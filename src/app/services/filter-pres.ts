import { SearchFilter } from '../quran/quran-search/search-filter';
import { WordSearchFilter } from '../quran/quran-search/word-filter';
import { QuranSearchOpts, QuranSearchPlaceMode, QuranSearchMatchMode, QuranSearchDisplayOpts, QuranSearchSortMode } from '../quran/quran-search/search-opts';
import { RootSearchFilter } from '../quran/quran-search/root-filter';
import { Quran, QuranRoot, Category, Surah } from '../quran/quran';
import { CategorySearchFilter } from '../quran/quran-search/category-filter';
import { ErrorStateMatcher } from '@angular/material';
import { FormGroupDirective, NgForm, FormControl } from '@angular/forms';
import { QuranSearchCriteria } from '../quran/quran-search/quran-searcher';
import { ParamMap, Params } from '@angular/router';
import { SurahSearcFilter } from '../quran/quran-search/surah-filter';
import { isNullOrUndefined } from 'util';


const opts_query_types = [
   { opt: 'word', word: 'كلمات' },
   { opt: 'root', word: 'جذور' },
   { opt: 'category', word: 'مواضيع' },
   { opt: 'surah', word: 'سور'}
   ];
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

export function extract_term_strings(search_term: string, term_type: string): Array<string> {
   switch (term_type) {
      case 'word': {
         return [ search_term ];
      }
      case 'root': {
         return extract_root_strings(search_term);
      }
      case 'category': {
         return extract_category_strings(search_term);
      }
      case 'surah': {
         return extract_suwar_strings(search_term);
      }
      default: {
         console.error(`Unsupported term type ${term_type}`);
         return [];
      }
   }
}

function extract_root_strings(search_term: string): Array<string> {
   let arr = search_term.split(new RegExp('[,،\\s]'));
   arr = arr.map(s => s.trim());
   return arr;
}

function extract_category_strings(search_term: string): Array<string> {
   let arr = search_term.split(new RegExp('[,،]'));
   arr = arr.map(s => s.trim());
   return arr;
}

function extract_suwar_strings(search_term: string): Array<string> {
   let arr = search_term.split(new RegExp('[,،]'));
   arr = arr.map(s => s.trim());
   return arr;
}

function extract_roots(search_term: string, quran: Quran): Array<QuranRoot> {
   let roots = new Array<QuranRoot>();
   let terms: Array<string> = extract_root_strings(search_term);
   for (let term of terms) {
      let root = quran.word_store.get_root(term);
      if (root != null) {
         roots.push(root);
      }
   }
   return roots;
}

function extract_categories(search_term: string, quran: Quran): Array<Category> {
   let cats = new Array<Category>();
   let terms = extract_category_strings(search_term);
   for (let term of terms) {
      let cat = quran.get_category(term);
      if (cat != null) {
         cats.push(cat);
      }
   }
   return cats;
}

function extract_suwar(search_term: string, quran: Quran): Array<Surah> {
   let ss = new Array<Surah>();
   let terms = extract_suwar_strings(search_term);
   for (let term of terms) {
      let s = quran.get_surah(term);
      if (s != null) {
         ss.push(s);
      }
   }
   return ss;
}

// Blocks the search when we receive a filter update
// This is to use when we have multiple operations that could
// issue the callback but we only want to perform the search in the end
// NOTE: We must call dispose() at the end because we can't rely on the GC
//       to support this particular pattern
export class SearchBlocker {
   private static g_instances = 0;

   constructor() {
      SearchBlocker.g_instances++;
   }

   dispose() {
      SearchBlocker.g_instances--;
      if (SearchBlocker.g_instances < 0) {
         console.error('dispose() called too many times');
         SearchBlocker.g_instances = 0;
      }
   }

   static isBlocked(): boolean {
      return SearchBlocker.g_instances != 0;
   }

}

export class SearchInputStateMatcher implements ErrorStateMatcher {
   filter_group: FilterGroupPres = null;
   quran: Quran = null;

   isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
      if (this.filter_group.cur_filter == null) {
         console.error('Null Filter');
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

   available_sort_order = new Array<string>();
   cur_sort_order = 'seq';

   onFiltersUpdated = new Map<any, ()=>void>();

   show_sort_order_opt(opt: string): boolean {
      return this.available_sort_order.indexOf(opt) != -1;
   }

   copy(oth: FilterGroupPres) {
      this.filters = oth.filters;
      this.cur_filter = oth.cur_filter;
      this.cur_sort_order = oth.cur_sort_order;
      this.filter_updated();
   }

   add_filter(f: FilterPres) {
      let i = this.filters.findIndex(p => p == f || p.id == f.id);
      if (i == -1) {
         this.filters.push(f);
      } else {
         this.filters[i] = f;
      }
   }

   add_current_filter(quran: Quran) {
      if (this.cur_filter.is_valid(quran)) {
         let f = new FilterPres();
         f.copy(this.cur_filter);
         this.filters.push(f);
         this.cur_filter.cur_search_term = '';
         this.filter_updated();
         return true;
      } else {
         return false;
      }
   }

   make_current(f: FilterPres, quran: Quran) {
      let idx = this.filters.indexOf(f);
      if (idx == -1) {
         console.error(`Filter '${f.cur_search_term}' does not exist, so can not make active`);
         return false;
      }

      if (!f.is_valid(quran)) {
         console.error(`Filter '${f.cur_search_term}' is not valid, so can not make active`);
         return false;
      }

      this.filters.splice(idx, 1);
      if (this.cur_filter.is_valid(quran)) {
         this.filters.push(this.cur_filter);
      }

      this.cur_filter = f;
      this.filter_updated();
      return true;
   }

   remove_filter(f: FilterPres) {
      let idx = this.filters.indexOf(f);
      if (idx == -1) {
         console.error(`Trying to remove filter not in group`);
         return false;
      }
      
      this.filters.splice(idx, 1);
      this.filter_updated();
      return true;
   }

   clear(): boolean {
      if (this.filters.length > 0) {
         this.filters.splice(0, this.filters.length);
         this.filter_updated();
         return true;
      } else {
         return false;
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
      this.cur_filter.set_term_type(this.cur_filter.cur_term_type);
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

   show_filters(): boolean {
      return this.filters.length > 0;
   }

   has_search(): boolean {
      return this.cur_filter.cur_search_term.length > 0 || this.filters.length > 0;
   }

   sort_order_options(): Array<string> {
      let s = new Set<string>();
      for (let f of this.filters) {
         for (let opt of f.available_sort_order) {
            s.add(opt);
         }
      }
      for (let opt of this.cur_filter.available_sort_order) {
         s.add(opt);
      }
      let arr = new Array<string>();
      s.forEach((opt: string) => {
         arr.push(opt);
      });
      return arr;
   }

   to_params(quran: Quran): Params {
      let map = {};
      map['s'] = opts_sort_order.findIndex((v) => v.opt == this.cur_sort_order);
      this.filter_to_map(this.cur_filter, -1, map);
      let nfilters = 0;
      for (let i = 0; i < this.filters.length; ++i) {
         let f = this.filters[i];
         if (f.is_valid(quran)) {
            this.filter_to_map(f, nfilters, map);
            ++nfilters;
         }
      }
      map['n'] = nfilters;
      return map;
   }

   private filter_to_map(f: FilterPres, i: number, map: any) {
      map[i < 0 ? 't' : `t${i}`] = opts_query_types.findIndex(v => v.opt == f.cur_term_type);
      map[i < 0 ? 'q' : `q${i}`] = f.cur_search_term;
      map[i < 0 ? 'l' : `l${i}`] = opts_ayah_loc.findIndex(v => v.opt == f.cur_ayah_loc);
      map[i < 0 ? 'm' : `m${i}`] = opts_ayah_order.findIndex(v => v.opt == f.cur_ayah_order);
   }

   static from_params(params: ParamMap): FilterGroupPres {
      let group = new FilterGroupPres();

      let n = +params['n'];
      if (isNaN(n)) {
         return group;
      }
      
      let s = +params['s'];
      if (!isNaN(s)) {
         if (s >= opts_sort_order.length) {
            console.error(`Unsupported sort value ${s}`);
            s = 0;
         }
      } else {
         s = 0;
      }

      group.cur_sort_order = opts_sort_order[s].opt;

      for (let i = 0; i < n; ++i) {
         let f = FilterGroupPres.map_to_filter(params, i, true);
         if (f != null) {
            group.add_filter(f);
         }
      }

      group.cur_filter = FilterGroupPres.map_to_filter(params, -1, false);
      if (group.cur_filter == null) {
         console.error('Could not find current filter');
         group.cur_filter = new FilterPres();
      }

      return group;
   }

   private static map_to_filter(params: ParamMap, i: number, ensure_valid: boolean): FilterPres {

      let type = +params[i < 0 ? 't' : `t${i}`];
      if (isNaN(type)) {
         if (ensure_valid) {
            return null;
         } else {
            type = 0;
         }
      }

      let q = params[i < 0 ? 'q' : `q${i}`];
      if (q === undefined) {
         if (ensure_valid) {
            return null;
         } else {
            q = '';
         }
      }

      let loc = +params[i < 0 ? 'l' : `l${i}`];
      if (isNaN(loc)) {
         loc = 0;
      }

      let m = +params[i < 0 ? 'm' : `m${i}`];
      if (isNaN(m)) {
         m = 0;
      }

      let f = new FilterPres();
      f.set_term_type(opts_query_types[type].opt);
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
   available_loc_opts = new Array<string>();

   show_ayah_order = true;
   available_ayah_order = new Array<string>();

   available_sort_order = new Array<string>();

   cur_term_type = 'word';
   cur_search_term = '';
   cur_ayah_loc = 'any';
   cur_ayah_order = 'same_order_full_word';

   constructor() {
      this.id = ++FilterPres.g_id;
   }

   copy(oth: FilterPres) {
      this.set_term_type(oth.cur_term_type);
      this.cur_ayah_loc = oth.cur_ayah_loc;
      this.cur_ayah_order = oth.cur_ayah_order;
      this.cur_search_term = oth.cur_search_term;
   }
   
   show_settings(): boolean {
      return this.show_ayah_loc || this.show_ayah_order;
   }

   show_ayah_loc_option(loc: string): boolean {
      return this.available_loc_opts.indexOf(loc) != -1;
   }

   show_ayah_order_option(order: string): boolean {
      return this.available_ayah_order.indexOf(order) != -1;
   }

   // Set the term type (term, root, category)
   set_term_type(type: string) {
      let valid = false;
      switch (type) {
         case 'word': {
            valid = true;
            this.show_ayah_loc = true;
            this.show_ayah_order = true;
            this.available_loc_opts = opts_ayah_loc.map((opt, e) => opt.opt);
            this.available_ayah_order = opts_ayah_order.map((opt, e) => opt.opt);
            this.available_sort_order = opts_sort_order.map((opt, e) => opt.opt);
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
         case 'surah': {
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
      if (!this.is_valid(quran)) {
         return null;
      }
      
      let opts = this.make_search_opts();
      switch (this.cur_term_type) {
         case 'word': {
            return new WordSearchFilter(opts, this.cur_search_term);
         }
         case 'root': {
            let roots = extract_roots(this.cur_search_term, quran);
            if (roots.length > 0) {
               return new RootSearchFilter(opts, roots);
            }
            break;
         }
         case 'category': {
            let cats = extract_categories(this.cur_search_term, quran);
            if (cats.length > 0) {
               return new CategorySearchFilter(opts, cats);
            }
            break;
         }
         case 'surah': {
            let ss = extract_suwar(this.cur_search_term, quran);
            if (ss.length > 0) {
               return new SurahSearcFilter(opts, ss);
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

   from_surah(surah: Surah) {
      this.cur_search_term = surah.name;
      this.set_term_type('surah');
   }

   is_valid(quran: Quran): boolean {
      return this.validate(quran).length == 0;
   }
   
   validate(quran: Quran): string {
      if (quran == null) {
         return 'لم يتم تحميل القرآن بعد';
      }
      
      let err = '';
      switch (this.cur_term_type) {
         case 'word': {
            break;
         }
         case 'root': {
            let roots = extract_roots(this.cur_search_term, quran);
            if (roots.length == 0) {
               err = 'هذا الجذر لا يوجد لدينا';
            }
            break;
         }
         case 'category': {
            let cats = extract_categories(this.cur_search_term, quran);
            if (cats.length == 0) {
               err = 'هذا الموضوع لا يوجد لدينا';
            }
            break;
         }
         case 'surah': {
            let ss = extract_suwar(this.cur_search_term, quran);
            if (ss.length == 0) {
               err = 'إسم السورة غير مطابق';
            }
            break;
         }
         default: {
            console.error(`The search term type ${this.cur_term_type} is not supported`);
            break;
         }
      }
      if (err.length == 0) {
         if (this.cur_search_term.length == 0) {
            err = `أدخل كلمة لكي تبدأ البحث`;
         }
      }
      return err;
   }

   to_string(): string {
      let idx = opts_query_types.findIndex(v => v.opt == this.cur_term_type);
      return `<strong>${opts_query_types[idx].word}:</strong> ${this.cur_search_term}`;
   }
}
