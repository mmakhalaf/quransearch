import { Injectable, NgZone } from '@angular/core';
import { Quran } from '../quran/quran';
import { QuranSearch } from '../quran/quran-search';
import { Router } from '@angular/router';
import { SearchResults } from '../quran/search-result';
import { QuranSearchDisplayOpts, QuranSearchOpts } from '../quran/search-opts';

export type OnSearchValUpdated = (val: string) => void;

@Injectable({
   providedIn: 'root'
})
export class QuranService {

   quran = new Quran();
   matches = new SearchResults();
   searchVal = '';

   onSearchValUpdated = new Map<any, OnSearchValUpdated>();
   search_opts = new QuranSearchOpts();
   disp_opts = new QuranSearchDisplayOpts();

   constructor(private router: Router, private zone: NgZone) {
      
   }

   request_query_search(q: string) {
      this.router.navigateByUrl(`?q=${q}`);
   }

   request_root_search(r: string) {
      this.router.navigateByUrl(`?r=${r}`);
   }

   perform_query_search(searchVal: string) {
      this.do_search(searchVal, this.do_query_search);
   }

   perform_root_search(searchVal: string) {
      this.do_search(searchVal, this.do_root_search);
   }

   private do_search(searchVal: string, fn: ()=>void) {
      if (searchVal.length < 2) {
         return;
      }

      let changed = this.searchVal !== searchVal;
      this.searchVal = searchVal;
      if (changed) {
         this.onSearchValUpdated.forEach((cb: OnSearchValUpdated, k: any) => {
            cb(this.searchVal);
         });
      }

      if (this.quran.is_loaded) {
         fn();
      } else {
         this.quran.onLoaded = () => {
            this.quran.onLoaded = null;
            this.zone.run(() => {
               fn();
            });
         }
      }
   }

   private do_query_search = () => {
      let searcher = new QuranSearch(this.quran, this.search_opts, this.disp_opts);
      this.matches = searcher.search_by_word(this.searchVal);
   }

   private do_root_search = () => {
      let searcher = new QuranSearch(this.quran, this.search_opts, this.disp_opts);
      this.matches = searcher.search_by_root(this.searchVal);
   }
}
