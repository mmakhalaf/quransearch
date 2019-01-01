import { Injectable, NgZone } from '@angular/core';
import { Quran, QuranRoot, Category } from '../quran/quran';
import { QuranSearcher, QuranSearchCriteria } from '../quran/quran-search/quran-searcher';
import { Router } from '@angular/router';
import { SearchResults } from '../quran/quran-search/search-result';
import { QuranSearchDisplayOpts, QuranSearchOpts } from '../quran/quran-search/search-opts';
import { SearchFilter } from '../quran/quran-search/search-filter';
import { RootSearchFilter } from '../quran/quran-search/root-filter';
import { FilterGroupPres } from './filter-pres';

export type OnQuranLoaded = (q: Quran) => void;
export type OnSearchValUpdated = (val: string) => void;
export type OnSearchCompleted = (res: SearchResults) => void;


@Injectable({
   providedIn: 'root'
})
export class QuranService {

   quran: Quran = null;
   searcher: QuranSearcher = null;
   isOpPending = false;

   matches = new SearchResults();

   searchCriteriaPres = new FilterGroupPres();
   onSearchCompleted = new Map<any, OnSearchCompleted>();
   onQuranLoaded = new Map<any, OnQuranLoaded>();

   search_opts = new QuranSearchOpts();
   disp_opts = new QuranSearchDisplayOpts();

   constructor(private router: Router, private zone: NgZone) {
      this.isOpPending = true;
      Quran.create().then(this.on_quran_loaded);
   }

   on_quran_loaded = (quran: Quran) => {
      this.quran = quran;
      this.searcher = new QuranSearcher(this.quran, this.disp_opts);
      this.isOpPending = false;
      this.onQuranLoaded.forEach((fn: OnQuranLoaded) => {
         fn(this.quran);
      });

      this.zone.run(() => {
         this.repeat_search();
      });
   }

   reset_search_with_word_filter(word: string) {
      this.searchCriteriaPres.cur_filter.from_word(word);
      this.searchCriteriaPres.filter_updated();
      this.request_search(this.searchCriteriaPres);
   }

   reset_search_with_root_filter(root: QuranRoot) {
      this.searchCriteriaPres.cur_filter.from_root(root);
      this.searchCriteriaPres.filter_updated();
      this.request_search(this.searchCriteriaPres);
   }

   reset_search_with_cat_filter(cat: Category) {
      this.searchCriteriaPres.cur_filter.from_category(cat);
      this.searchCriteriaPres.filter_updated();
      this.request_search(this.searchCriteriaPres);
   }

   request_repeat_search() {
      this.request_search(this.searchCriteriaPres);
   }

   request_search(crit: FilterGroupPres) {
      let p = crit.to_params();
      this.router.navigate([''], {
         queryParams: p
      });
   }

   perform_search(crit: FilterGroupPres) {
      if (this.searchCriteriaPres != crit) {
         this.searchCriteriaPres.copy(crit);
      }
      this.repeat_search();
   }

   private repeat_search() {
      if (this.quran == null) {
         // Quran not loaded yet, so return
         return;
      }
      let crit = this.searchCriteriaPres.to_criteria(this.quran);
      this.searcher.update_criteria(crit);
      this.matches = this.searcher.matches;

      this.onSearchCompleted.forEach((cb: OnSearchCompleted, k: any) => {
         cb(this.matches);
      });
   }
}
