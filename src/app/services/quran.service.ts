import { Injectable, NgZone } from '@angular/core';
import { Location } from '@angular/common';
import { Quran, QuranRoot, Category } from '../quran/quran';
import { QuranSearcher, QuranSearchCriteria } from '../quran/quran-search/quran-searcher';
import { SearchResults } from '../quran/quran-search/search-result';
import { QuranSearchDisplayOpts, QuranSearchOpts } from '../quran/quran-search/search-opts';
import { FilterGroupPres, SearchBlocker } from './filter-pres';

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

   constructor(private zone: NgZone, private location: Location) {
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

   request_search_with_word_filter(word: string, reset: boolean) {
      let blocker = new SearchBlocker();
      if (reset) {
         this.searchCriteriaPres.cur_filter.from_word(word);
         this.searchCriteriaPres.clear();
         this.searchCriteriaPres.filter_updated();
      } else {
         this.searchCriteriaPres.add_current_filter(this.quran);
         this.searchCriteriaPres.cur_filter.from_word(word);
         this.searchCriteriaPres.filter_updated();
      }
      blocker.dispose();

      this.request_search(this.searchCriteriaPres);
   }

   request_search_with_root_filter(root: QuranRoot, reset: boolean) {
      let blocker = new SearchBlocker();
      if (reset) {
         this.searchCriteriaPres.cur_filter.from_root(root);
         this.searchCriteriaPres.clear();
         this.searchCriteriaPres.filter_updated();
      } else {
         this.searchCriteriaPres.add_current_filter(this.quran);
         this.searchCriteriaPres.cur_filter.from_root(root);
         this.searchCriteriaPres.filter_updated();
      }
      blocker.dispose();

      this.request_search(this.searchCriteriaPres);
   }

   request_search_with_cat_filter(cat: Category, reset: boolean) {
      let blocker = new SearchBlocker();
      if (reset) {
         this.searchCriteriaPres.cur_filter.from_category(cat);
         this.searchCriteriaPres.clear();
         this.searchCriteriaPres.filter_updated();
      } else {
         this.searchCriteriaPres.add_current_filter(this.quran);
         this.searchCriteriaPres.cur_filter.from_category(cat);
         this.searchCriteriaPres.filter_updated();
      }
      blocker.dispose();

      this.request_search(this.searchCriteriaPres);
   }

   request_search(crit: FilterGroupPres) {
      if (this.quran == null) {
         return;
      }

      if (SearchBlocker.isBlocked()) {
         return;
      }

      let blocker = new SearchBlocker();
      this.perform_search(this.searchCriteriaPres);
      blocker.dispose();

      this.location.go('');
   }

   perform_search(crit: FilterGroupPres) {
      let blocker = new SearchBlocker();
      if (this.searchCriteriaPres != crit) {
         this.searchCriteriaPres.copy(crit);
      }
      blocker.dispose();
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
