import { SearchFilter } from '../quran/quran-search/search-filter';
import { WordSearchFilter } from '../quran/quran-search/word-filter';
import { QuranSearchOpts, QuranSearchPlaceMode, QuranSearchMatchMode, QuranSearchDisplayOpts, QuranSearchSortMode } from '../quran/quran-search/search-opts';
import { RootSearchFilter } from '../quran/quran-search/root-filter';
import { Quran, QuranRoot, Category } from '../quran/quran';
import { CategorySearchFilter } from '../quran/quran-search/category-filter';
import { ErrorStateMatcher } from '@angular/material';
import { FormGroupDirective, NgForm, FormControl } from '@angular/forms';
import { QuranSearchCriteria } from '../quran/quran-search/quran-searcher';
import { ParamMap, Params } from '@angular/router';


const opts_query_types = [ 'word', 'root', 'category' ];
const opts_ayah_loc = [
   { opt: 'any', e: QuranSearchPlaceMode.Any }, 
   { opt: 'start_ayah_only', e: QuranSearchPlaceMode.BeginOnly }, 
   { opt: 'end_ayah_only', e: QuranSearchPlaceMode.EndOnly }
   ];
const opts_ayah_order = [
   { opt: 'any', e: QuranSearchMatchMode.Any }, 
   { opt: 'same_order_any_word', e: QuranSearchMatchMode.ExactOrder },
   { opt: 'same_order_full_word', e: QuranSearchMatchMode.ExactOrderFullWord }
   ];
const opts_sort_order = [
   { opt: 'seq', e: QuranSearchSortMode.Sequence }, 
   { opt: 'occ', e: QuranSearchSortMode.Occurances},
   { opt: 'occ_seq', e: QuranSearchSortMode.OccuranceSeqRes}
   ];

export class SearchInputStateMatcher implements ErrorStateMatcher {
   filter_group: FilterGroupPres = null;
   quran: Quran = null;

   isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
      if (this.filter_group.cur_filter == null) {
         console.error('Null Filter or Quran for validation');
         return false;
      } else if (this.quran == null) {
         return false;
      } else {
         let err = this.filter_group.cur_filter.validate(this.quran);
         if (err.length == 0) {
            return false;
         } else {
            control.setErrors({err: err});
            return true;
         }
      }
   }
 }

// Represent a group of active filters and their effect on the UI
export class FilterGroupPres {
   cur_filter = new FilterPres();
   filters = new Array<FilterPres>();

   available_sort_order = [];
   cur_sort_order = 'seq';

   onFiltersUpdated = new Map<any, ()=>void>();

   copy(oth: FilterGroupPres) {
      this.filters = oth.filters;
      this.cur_filter = oth.cur_filter;
      this.cur_sort_order = oth.cur_sort_order;
      this.filter_updated();
   }

   add_filter(f: FilterPres) {
      let i = this.filters.findIndex((p: FilterPres): boolean => {
         return p == f || p.id == f.id;
      });
      if (i == -1) {
         this.filters.push(f);
      } else {
         this.filters[i] = f;
      }
   }

   to_display_opts(): QuranSearchDisplayOpts {
      let opts = new QuranSearchDisplayOpts();
      switch (this.cur_sort_order) {
         case 'seq': {
            opts.sort_mode = QuranSearchSortMode.Sequence;
            break;
         }
         case 'occ': {
            opts.sort_mode = QuranSearchSortMode.Occurances;
            break;
         }
         case 'occ_seq': {
            opts.sort_mode = QuranSearchSortMode.OccuranceSeqRes;
            break;
         }
         default: {
            console.error(`Unsupported search options ${this.cur_sort_order}`);
            break;
         }
      }
      return opts;
   }

   to_criteria(quran: Quran): QuranSearchCriteria {
      let c = new QuranSearchCriteria();
      c.disp_opts = this.to_display_opts();
      for (let f of this.filters) {
         if (f == this.cur_filter) {
            console.error('Current filter should not be in the filter group');
            continue;
         }
         let sf =f.to_filter(quran);
         if (sf != null) {
            c.filters.push(sf);
         }
      }
      // Make sure the current filter is the last
      let cf = this.cur_filter.to_filter(quran);
      if (cf != null) {
         c.filters.push(this.cur_filter.to_filter(quran));
      }
      return c;
   }
   
   filter_updated() {
      for (let f of this.filters) {
         f.set_term_type(f.cur_term_type);
      }
      this.available_sort_order = this.sort_order_options();
      this.onFiltersUpdated.forEach((cb, k: any) => {
         cb();
      });
   }

   show_sort_by(): boolean {
      for (let f of this.filters) {
         if (f.available_sort_order.length > 0) {
            return true;
         }
      }
   }

   show_settings(): boolean {
      for (let f of this.filters) {
         if (f.available_sort_order.length > 0) {
            return true;
         }
      }
   }

   sort_order_options(): Array<string> {
      let s = new Set<string>();
      for (let f of this.filters) {
         for (let opt of f.available_sort_order) {
            s.add(opt);
         }
      }
      let arr = new Array<string>();
      s.forEach((opt: string) => {
         arr.push(opt);
      });
      return arr;
   }

   to_params(): Params {
      let map = {};
      map['n'] = this.filters.length;
      map['s'] = opts_sort_order.findIndex((v) => v.opt == this.cur_sort_order);
      this.filter_to_map(this.cur_filter, -1, map);
      for (let i = 0; i < this.filters.length; ++i) {
         let f = this.filters[i];
         this.filter_to_map(f, i, map);
      }
      return map;
   }

   private filter_to_map(f: FilterPres, i: number, map: any) {
      map[i < 0 ? 't' : `t${i}`] = opts_query_types.indexOf(f.cur_term_type);
      map[i < 0 ? 'q' : `q${i}`] = f.cur_search_term;
      map[i < 0 ? 'l' : `l${i}`] = opts_ayah_loc.findIndex(v => v.opt == f.cur_ayah_loc);
      map[i < 0 ? 'm' : `m${i}`] = opts_ayah_order.findIndex(v => v.opt == f.cur_ayah_order);
   }

   static from_params(params: ParamMap): FilterGroupPres {
      let group = new FilterGroupPres();

      let n = +params['n'];
      if (isNaN(n)) {
         return null;
      }
      
      let s = +params['s'];
      if (!isNaN(s)) {
         if (s >= opts_sort_order.length) {
            console.log(`Unsupported sort value ${s}`);
         } else {
            group.cur_sort_order = opts_sort_order[s].opt;
         }
      }

      for (let i = 0; i < n; ++i) {
         let f = FilterGroupPres.map_to_filter(params, i);
         group.add_filter(f);
      }

      group.cur_filter = FilterGroupPres.map_to_filter(params, -1);
      if (group.cur_filter == null) {
         console.error('Could not find current filter');
         group.cur_filter = new FilterPres();
      }

      return group;
   }

   private static map_to_filter(params: ParamMap, i: number): FilterPres {

      let type = +params[i < 0 ? 't' : `t${i}`];
      if (isNaN(type)) {
         return null;
      }

      let q = params[i < 0 ? 'q' : `q${i}`];
      let loc = +params[i < 0 ? 'l' : `l${i}`];
      let m = +params[i < 0 ? 'm' : `m${i}`];

      let f = new FilterPres();
      f.set_term_type(opts_query_types[type]);
      f.cur_search_term = q;
      f.cur_ayah_loc = opts_ayah_loc[loc].opt;
      f.cur_ayah_order = opts_ayah_order[m].opt;
      return f;
   }
}

// Represent filters for displaying in the UI
export class FilterPres {
   id = 0;
   static g_id = 0;

   show_ayah_loc = true;
   available_loc_opts = [];

   show_ayah_order = true;
   available_ayah_order = [];

   available_sort_order = [];

   cur_term_type = 'word';
   cur_search_term = '';
   cur_ayah_loc = 'any';
   cur_ayah_order = 'same_order_full_word';

   constructor() {
      this.id = ++FilterPres.g_id;
   }

   show_settings(): boolean {
      return this.show_ayah_loc && this.show_ayah_order && this.available_sort_order.length > 0;
   }

   // Set the term type (term, root, category)
   set_term_type(type: string) {
      let valid = false;
      switch (type) {
         case 'word': {
            valid = true;
            this.show_ayah_loc = true;
            this.show_ayah_order = true;
            this.available_loc_opts = opts_ayah_loc.map((opt, e) => opt);
            this.available_ayah_order = opts_ayah_order.map((opt, e) => opt);
            this.available_sort_order = opts_sort_order.map((opt, e) => opt);
            break;
         }
         case 'root': {
            valid = true;
            this.show_ayah_loc = true;
            this.show_ayah_order = false;
            this.available_loc_opts = [ 'any', 'start_ayah_only', 'end_ayah_only' ];
            this.available_ayah_order = [ ];
            this.available_sort_order = [ 'seq', 'occ' ];
            break;
         }
         case 'category': {
            valid = true;
            this.show_ayah_loc = false;
            this.show_ayah_order = false;
            this.available_loc_opts = [];
            this.available_ayah_order = [];
            this.available_sort_order = [ 'seq' ];
            break;
         }
         default: {
            console.error(`Invalid term type ${type}`);
         }
      }
      if (valid) {
         this.cur_term_type = type;
      }
   }

   make_search_opts(): QuranSearchOpts {
      let opts = new QuranSearchOpts();

      switch (this.cur_ayah_loc) {
         case 'any': {
            opts.place_mode = QuranSearchPlaceMode.Any;
            break;
         }
         case 'start_ayah_only': {
            opts.place_mode = QuranSearchPlaceMode.BeginOnly;
            break;
         }
         case 'end_ayah_only': {
            opts.place_mode = QuranSearchPlaceMode.EndOnly;
            break;
         }
         default: {
            console.error(`Invalid place options ${this.cur_ayah_loc}`);
            break;
         }
      }

      switch (this.cur_ayah_order) {
         case 'same_order_full_word': {
            opts.match_mode = QuranSearchMatchMode.ExactOrderFullWord;
            break;
         }
         case 'same_order_any_word': {
            opts.match_mode = QuranSearchMatchMode.ExactOrder;
            break;
         }
         case 'any': {
            opts.match_mode = QuranSearchMatchMode.Any;
            break;
         }
         default: {
            console.error(`Invalid match option ${this.cur_ayah_order}`);
            break;
         }
      }

      return opts;
   }

   to_filter(quran: Quran): SearchFilter {
      let opts = this.make_search_opts();
      switch (this.cur_term_type) {
         case 'word': {
            return new WordSearchFilter(this.id, opts, this.cur_search_term);
         }
         case 'root': {
            let root = quran.word_store.get_root(this.cur_search_term);
            if (root == null) {
               console.error(`No root found ${this.cur_search_term}`);
            } else {
               return new RootSearchFilter(this.id, opts, root);
            }
            break;
         }
         case 'category': {
            let cat = quran.get_category(this.cur_search_term);
            if (cat == null) {
               console.error(`No category found ${this.cur_search_term}`);
            } else {
               return new CategorySearchFilter(this.id, opts, cat);
            }
            break;
         }
         default: {
            console.error(`Invalid term type ${this.cur_term_type}`);
            break;
         }
      }
      return null;
   }

   from_word(word: string) {
      this.cur_search_term = word;
      this.set_term_type('word');
   }

   from_root(root: QuranRoot) {
      this.cur_search_term = root.text;
      this.set_term_type('root');
   }

   from_category(cat: Category) {
      this.cur_search_term = cat.name;
      this.set_term_type('category');
   }
   
   validate(quran: Quran): string {
      let err = '';
      switch (this.cur_term_type) {
         case 'word': {
            break;
         }
         case 'root': {
            let root = quran.word_store.get_root(this.cur_search_term);
            if (root == null) {
               if (this.cur_search_term.includes(' ')) {
                  err = 'الجذر لابد أن يكون كلمة واحدة بدون مسافات';
               } else {
                  err = 'هذا الجذر لا يوجد لدينا';
               }
            }
            break;
         }
         case 'category': {
            let cat = quran.get_category(this.cur_search_term);
            if (cat == null) {
               err = 'هذا الموضوع لا يوجد لدينا';
            }
            break;
         }
         default: {
            console.log(`The search term type ${this.cur_term_type} is not supported`);
            break;
         }
      }
      return err;
   }
}
