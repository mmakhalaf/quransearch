import { Injectable, NgZone } from '@angular/core';
import { Quran } from '../quran/quran';
import { QuranSearcher } from '../quran/quran-search/quran-searcher';
import { Router } from '@angular/router';
import { SearchResults, SearchResult } from '../quran/quran-search/search-result';
import { QuranSearchDisplayOpts, QuranSearchOpts } from '../quran/quran-search/search-opts';
import { WordSearchFilter } from '../quran/quran-search/word-filter';
import { RootSearchFilter } from '../quran/quran-search/root-filter';
import { CategorySearchFilter } from '../quran/quran-search/category-filter';

export enum SearchMode {
   Word,
   Root,
   Category
}

type SearchFn = () => void;
export type OnSearchValUpdated = (val: string) => void;
export type OnSearchCompleted = (res: SearchResults, mode: SearchMode) => void;


@Injectable({
   providedIn: 'root'
})
export class QuranService {

   quran: Quran = null;
   searcher: QuranSearcher = null;
   isOpPending = false;

   matches = new SearchResults();

   searchVal = '';
   searchMode = SearchMode.Word;

   onSearchValUpdated = new Map<any, OnSearchValUpdated>();
   onSearchCompleted = new Map<any, OnSearchCompleted>();

   search_opts = new QuranSearchOpts();
   disp_opts = new QuranSearchDisplayOpts();

   constructor(private router: Router, private zone: NgZone) {
      this.isOpPending = true;
      Quran.create().then(this.on_quran_loaded);
      console.log(`Promise sent`);
   }

   on_quran_loaded = (quran: Quran) => {
      console.log(`Promise Returned`);
      // setTimeout(() => {
         this.quran = quran;
         this.searcher = new QuranSearcher(this.quran, this.disp_opts);
         this.isOpPending = false;
         if (this.searchVal.length > 0) {
            this.zone.run(() => {
               this.repeat_search();
            });
         }
      // }, 1000);
   }

   request_query_search(q: string) {
      this.router.navigateByUrl(`?q=${q}`);
   }

   request_root_search(r: string) {
      this.router.navigateByUrl(`?r=${r}`);
   }

   request_category_search(c: string) {
      this.router.navigateByUrl(`?c=${c}`);
   }

   repeat_search() {
      this.perform_search(this.searchVal, this.searchMode);
   }

   perform_search(searchVal: string, searchMode: SearchMode) {
      let changed = this.searchVal !== searchVal;
      this.searchVal = searchVal;
      this.searchMode = searchMode;
      if (changed) {
         this.onSearchValUpdated.forEach((cb: OnSearchValUpdated, k: any) => {
            cb(this.searchVal);
         });
      }

      if (searchVal.length < 2) {
         this.clear_results(searchMode);
         return;
      }

      if (this.quran == null) {
         return;
      }
      
      switch (searchMode) {
         case SearchMode.Category: {
            this.do_cat_search();
            break;
         }
         case SearchMode.Root: {
            this.do_root_search();
            break;
         }
         case SearchMode.Word: {
            this.do_query_search();
            break;
         }
      }

      this.onSearchCompleted.forEach((cb: OnSearchCompleted, k: any) => {
         cb(this.matches, searchMode);
      });
   }

   private do_query_search() {
      this.searcher.reset_filter(new WordSearchFilter(this.quran, this.search_opts, this.searchVal));
      this.begin_search();
   }

   private do_root_search() {
      let root = this.quran.word_store.get_root(this.searchVal);
      if (root != null) {
         this.searcher.reset_filter(new RootSearchFilter(this.quran, this.search_opts, root));
         this.begin_search();
      }
   }

   private do_cat_search() {
      // this.matches = searcher.search_by_category(this.searchVal);
      let cat = this.quran.get_category(this.searchVal);
      if (cat != null) {
         this.searcher.reset_filter(new CategorySearchFilter(this.quran, this.search_opts, cat));
         this.begin_search();
      }
   }

   private begin_search() {
      // this.matches = this.searcher.search();
      this.isOpPending = true;
      this.searcher.beginSearch().then((searchRes: SearchResults) => {
         this.zone.run(() => {
            this.matches = searchRes;
            this.isOpPending = false;
         });
      });
   }

   private clear_results(searchMode: SearchMode) {
      this.matches = new SearchResults();
      this.searchMode = SearchMode.Word;
      this.onSearchCompleted.forEach((cb: OnSearchCompleted, k: any) => {
         cb(this.matches, searchMode);
      });
   }
}
