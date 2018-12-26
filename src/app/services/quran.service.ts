import { Injectable } from '@angular/core';
import { Quran } from '../quran/quran';
import { QuranSearch } from '../quran/quran-search';
import { Router } from '@angular/router';
import { SearchResults } from '../quran/search-result';

export type OnSearchValUpdated = (val: string) => void;

@Injectable({
   providedIn: 'root'
})
export class QuranService {

   quran = new Quran();
   all_matches = new SearchResults();
   disp_matches = new SearchResults();
   searchVal = '';

   onSearchValUpdated = new Array<OnSearchValUpdated>();

   constructor(private router: Router) {

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
         for (let cb of this.onSearchValUpdated) {
            cb(this.searchVal);
         }
      }
      if (this.quran.is_loaded) {
         fn();
      } else {
         this.quran.onLoaded = () => {
            this.quran.onLoaded = null;
            fn();
         }
      }
   }

   private do_query_search = () => {
      let searcher = new QuranSearch(this.quran);
      this.all_matches = searcher.search_by_word(this.searchVal);
      this.disp_matches = this.init_num_results();
   }

   private do_root_search = () => {
      let searcher = new QuranSearch(this.quran);
      this.all_matches = searcher.search_by_root(this.searchVal);
      this.disp_matches = this.init_num_results();
   }

   show_more() {
      this.disp_matches = this.inc_num_results();
   }

   can_show_more(): boolean {
      return this.all_matches.length() != 0 && this.disp_matches.length() < this.all_matches.length();
   }

   init_num_results(): SearchResults {
      let s = Math.min(this.all_matches.length(), 50);
      return this.all_matches.get_first(s);
   }

   inc_num_results(): SearchResults {
      let s = Math.min(this.all_matches.length(), this.disp_matches != null ? this.disp_matches.length() + 50 : 50);
      return this.all_matches.get_first(s);
   }
}
