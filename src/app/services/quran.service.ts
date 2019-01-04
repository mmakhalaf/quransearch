import { Injectable, NgZone } from '@angular/core';
import { Location } from '@angular/common';
import { Quran, QuranRoot, Category } from '../quran/quran';
import { QuranSearcher, QuranSearchCriteria } from '../quran/quran-search/quran-searcher';
import { SearchResults } from '../quran/quran-search/search-result';
import { QuranSearchDisplayOpts, QuranSearchOpts } from '../quran/quran-search/search-opts';
import { FilterGroupPres, SearchBlocker } from './filter-pres';
import { CookieService } from 'ngx-cookie-service';
import { ClipboardService } from 'ngx-clipboard';

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
   isSearchPending = false;

   matches = new SearchResults();

   searchCriteriaPres = new FilterGroupPres();
   onSearchCompleted = new Map<any, OnSearchCompleted>();
   onQuranLoaded = new Map<any, OnQuranLoaded>();

   cbElem: any = null;

   search_opts = new QuranSearchOpts();
   disp_opts = new QuranSearchDisplayOpts();

   constructor(
      private zone: NgZone, 
      private location: Location, 
      private cookieService: CookieService,
      private cbService: ClipboardService
      ) {
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

      if (this.isSearchPending) {
         this.zone.run(() => {
            this.repeat_search();
         });
      } else {
         this.load_cookies();
      }
   }

   copy_text(txt: string) {
      let succ = this.cbService.copyFromContent(txt, this.cbElem);
      this.cbService.destroy(this.cbElem);
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

   private load_cookies() {
      if (this.cookieService.check('SortOrder')) {
         this.searchCriteriaPres.cur_sort_order = this.cookieService.get('SortOrder');
      }
      if (this.cookieService.check('SearchType')) {
         this.searchCriteriaPres.cur_filter.cur_term_type = this.cookieService.get('SearchType');
      }
      if (this.cookieService.check('SearchTerm')) {
         this.searchCriteriaPres.cur_filter.cur_search_term = this.cookieService.get('SearchTerm');
      }
      if (this.cookieService.check('WordAyahLoc')) {
         this.searchCriteriaPres.cur_filter.cur_ayah_loc = this.cookieService.get('WordAyahLoc');
      }
      if (this.cookieService.check('WordMatch')) {
         this.searchCriteriaPres.cur_filter.cur_ayah_order = this.cookieService.get('WordMatch');
      }
      if (this.cookieService.check('CurSearch')) {
         let j = this.cookieService.get('CurSearch');
         let p = JSON.parse(j);
         if (p !== undefined) {
            let g = FilterGroupPres.from_params(p);
            if (g != null && g.has_search()) {
               this.searchCriteriaPres.copy(g);
            }
         }
      }
      this.searchCriteriaPres.filter_updated();
   }

   private save_cookies() {
      this.cookieService.set('SortOrder', this.searchCriteriaPres.cur_sort_order);
      this.cookieService.set('SearchType', this.searchCriteriaPres.cur_filter.cur_term_type);
      this.cookieService.set('SearchTerm', this.searchCriteriaPres.cur_filter.cur_search_term);
      this.cookieService.set('WordAyahLoc', this.searchCriteriaPres.cur_filter.cur_ayah_loc);
      this.cookieService.set('WordMatch', this.searchCriteriaPres.cur_filter.cur_ayah_order);
      this.cookieService.set('CurSearch', JSON.stringify(this.searchCriteriaPres.to_params(this.quran)));
   }

   private repeat_search() {
      if (this.quran == null) {
         // Quran not loaded yet, so return
         if (this.searchCriteriaPres.has_search()) {
            this.isSearchPending = true;
         }
         return;
      }

      let crit = this.searchCriteriaPres.to_criteria(this.quran);
      if (crit.filters.length == 0) {
         return;
      }

      this.isSearchPending = false;
      let updated: boolean = this.searcher.update_criteria(crit);
      this.matches = this.searcher.matches;

      if (updated) {
         this.onSearchCompleted.forEach((cb: OnSearchCompleted, k: any) => {
            cb(this.matches);
         });

         this.save_cookies();
      }
   }
}
