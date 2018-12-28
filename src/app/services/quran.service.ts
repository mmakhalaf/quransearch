import { Injectable, NgZone } from '@angular/core';
import { Quran } from '../quran/quran';
import { QuranSearch } from '../quran/quran-search';
import { Router } from '@angular/router';
import { SearchResults, SearchResult } from '../quran/search-result';
import { QuranSearchDisplayOpts, QuranSearchOpts } from '../quran/search-opts';

export enum SearchMode {
   Word,
   Root
}

type SearchFn = () => void;
export type OnSearchValUpdated = (val: string) => void;
export type OnSearchCompleted = (res: SearchResults, mode: SearchMode) => void;


@Injectable({
   providedIn: 'root'
})
export class QuranService {

   quran = new Quran();
   matches = new SearchResults();

   searchVal = '';
   searchMode = SearchMode.Word;

   onSearchValUpdated = new Map<any, OnSearchValUpdated>();
   onSearchCompleted = new Map<any, OnSearchCompleted>();

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
      this.perform_search(searchVal, this.do_query_search, SearchMode.Word);
   }

   perform_root_search(searchVal: string) {
      this.perform_search(searchVal, this.do_root_search, SearchMode.Root);
   }

   private perform_search(searchVal: string, fn: SearchFn, searchMode: SearchMode) {
      let changed = this.searchVal !== searchVal;
      this.searchVal = searchVal;
      if (changed) {
         this.onSearchValUpdated.forEach((cb: OnSearchValUpdated, k: any) => {
            cb(this.searchVal);
         });
      }

      if (searchVal.length < 2) {
         this.clear_results(searchMode);
         return;
      }

      if (this.quran.is_loaded) {
         this.do_search(fn, searchMode);
      } else {
         this.quran.onLoaded = () => {
            this.quran.onLoaded = null;
            this.zone.run(() => {
               this.do_search(fn, searchMode);
            });
         }
      }
   }

   private do_search(fn: SearchFn, searchMode: SearchMode) {
      fn();
      this.onSearchCompleted.forEach((cb: OnSearchCompleted, k: any) => {
         cb(this.matches, searchMode);
      });
   }

   private do_query_search = () => {
      let searcher = new QuranSearch(this.quran, this.search_opts, this.disp_opts);
      this.matches = searcher.search_by_word(this.searchVal);
   }

   private do_root_search = () => {
      let searcher = new QuranSearch(this.quran, this.search_opts, this.disp_opts);
      this.matches = searcher.search_by_root(this.searchVal);
   }

   clear_results(searchMode: SearchMode) {
      this.matches = new SearchResults();
      this.searchMode = SearchMode.Word;
      this.onSearchCompleted.forEach((cb: OnSearchCompleted, k: any) => {
         cb(this.matches, searchMode);
      });
   }
}
