import { Injectable, NgZone, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { Quran, QuranRoot, Category } from '../quran/quran';
import { QuranSearcher } from '../quran/quran-search/quran-searcher';
import { SearchResult, SearchResults } from '../quran/quran-search/search-result';
import { QuranSearchDisplayOpts } from '../quran/quran-search/search-opts';
import { FilterGroupPres } from './filter-pres';
import { QuranDataService } from './quran-data.service';

interface WorkerResult {
   type: 'result' | 'ready';
   reqId: number;
   updated: boolean;
   error?: boolean;
   results: { id: number; wi: number[] }[];
}

/**
 * Owns the search engine and the presentation/criteria state, and runs searches
 * in response to filter changes. A `debounceTime(0)` on
 * `searchCriteriaPres.filtersUpdated$` coalesces a synchronous burst of filter
 * mutations into one search (replacing the old SearchBlocker).
 *
 * Searches run in a Web Worker (search.worker.ts) when available, keeping the
 * main thread responsive; an in-thread QuranSearcher is used as a fallback and
 * for searches issued before the worker has finished loading its dataset.
 */
@Injectable({
   providedIn: 'root'
})
export class SearchService {

   searcher!: QuranSearcher;
   matches = new SearchResults();
   readonly searchCriteriaPres = new FilterGroupPres();
   readonly disp_opts = new QuranSearchDisplayOpts();

   private isSearchPending = false;
   private disable_defaults = false;

   private worker: Worker | null = null;
   private workerReady = false;
   private reqId = 0;
   private latestReqId = 0;

   /** Emits whenever a search produced an updated result set. */
   readonly searchCompleted$ = new Subject<SearchResults>();

   private zone = inject(NgZone);
   private data = inject(QuranDataService);
   private cookieService = inject(CookieService);

   constructor() {
      this.init_worker();

      this.data.quranLoaded$.subscribe((quran: Quran) => this.on_quran_loaded(quran));
      // Coalesce a synchronous burst of filter mutations into one search.
      this.searchCriteriaPres.filtersUpdated$
         .pipe(debounceTime(0))
         .subscribe(() => this.run_search());
   }

   private init_worker() {
      if (typeof Worker === 'undefined') {
         return;
      }
      try {
         this.worker = new Worker(new URL('../search.worker', import.meta.url), { type: 'module' });
         this.worker.onmessage = ({ data }: MessageEvent<WorkerResult>) => {
            this.zone.run(() => this.on_worker_message(data));
         };
         this.worker.onerror = () => {
            // Fall back to in-thread search on any worker failure.
            this.worker = null;
            this.workerReady = false;
         };
      } catch {
         this.worker = null;
      }
   }

   private on_worker_message(data: WorkerResult) {
      if (data.type === 'ready') {
         this.workerReady = !data.error;
         return;
      }
      // Ignore stale responses superseded by a newer request.
      if (data.reqId !== this.latestReqId) {
         return;
      }
      this.matches = this.results_from_worker(data.results);
      if (data.updated) {
         this.searchCompleted$.next(this.matches);
         this.save_cookies();
      }
   }

   private results_from_worker(items: { id: number; wi: number[] }[]): SearchResults {
      let sr = new SearchResults();
      for (let item of items) {
         let ayah = this.data.ayahById.get(item.id);
         if (ayah != null) {
            sr.results.push(new SearchResult(ayah, new Set<number>(item.wi)));
         }
      }
      return sr;
   }

   private on_quran_loaded(quran: Quran) {
      this.searcher = new QuranSearcher(quran, this.disp_opts);
      if (this.isSearchPending) {
         this.zone.run(() => this.run_search());
      } else {
         this.load_cookies();
      }
   }

   request_search_with_word_filter(word: string, reset: boolean) {
      this.apply_filter(reset, () => this.searchCriteriaPres.cur_filter.from_word(word));
   }

   request_search_with_root_filter(root: QuranRoot, reset: boolean) {
      this.apply_filter(reset, () => this.searchCriteriaPres.cur_filter.from_root(root));
   }

   request_search_with_cat_filter(cat: Category, reset: boolean) {
      this.apply_filter(reset, () => this.searchCriteriaPres.cur_filter.from_category(cat));
   }

   // Apply a new current filter, optionally resetting the filter history first.
   // Each mutation emits filtersUpdated$; the debounced subscription runs the
   // search once after the burst.
   private apply_filter(reset: boolean, set_term: () => void) {
      if (reset) {
         set_term();
         this.searchCriteriaPres.clear();
      } else {
         this.searchCriteriaPres.add_current_filter(this.data.quran);
         set_term();
      }
      this.searchCriteriaPres.filter_updated();
   }

   perform_search(crit: FilterGroupPres) {
      if (this.searchCriteriaPres !== crit) {
         // copy() emits filtersUpdated$, which drives the search.
         this.searchCriteriaPres.copy(crit);
      } else {
         this.searchCriteriaPres.filter_updated();
      }
   }

   private run_search() {
      if (this.data.quran == null || this.searcher == null) {
         // Quran not loaded yet; remember to search once it is.
         if (this.searchCriteriaPres.has_search()) {
            this.isSearchPending = true;
         }
         return;
      }
      this.isSearchPending = false;

      if (this.worker != null && this.workerReady) {
         // Off-main-thread: send serializable criteria; results arrive async.
         this.latestReqId = ++this.reqId;
         this.worker.postMessage({
            type: 'search',
            reqId: this.latestReqId,
            params: this.searchCriteriaPres.to_params(this.data.quran)
         });
         return;
      }

      this.run_search_in_thread();
   }

   private run_search_in_thread() {
      let crit = this.searchCriteriaPres.to_criteria(this.data.quran);
      if (crit.filters.length == 0) {
         return;
      }

      let updated: boolean = this.searcher.update_criteria(crit);
      this.matches = this.searcher.matches;

      if (updated) {
         this.searchCompleted$.next(this.matches);
         this.save_cookies();
      }
   }

   private load_cookies() {
      if (this.disable_defaults) {
         return;
      }

      if (this.cookieService.check('SortOrder')) {
         this.searchCriteriaPres.cur_sort_order = this.cookieService.get('SortOrder');
      }
      if (this.cookieService.check('SearchType')) {
         this.searchCriteriaPres.cur_filter.cur_term_type = this.cookieService.get('SearchType');
      }
      if (this.cookieService.check('SearchTerm')) {
         this.searchCriteriaPres.cur_filter.cur_search_term = this.cookieService.get('SearchTerm');
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
      if (this.disable_defaults) {
         return;
      }

      this.cookieService.set('SortOrder', this.searchCriteriaPres.cur_sort_order);
      this.cookieService.set('SearchType', this.searchCriteriaPres.cur_filter.cur_term_type);
      this.cookieService.set('SearchTerm', this.searchCriteriaPres.cur_filter.cur_search_term);
      this.cookieService.set('CurSearch', JSON.stringify(this.searchCriteriaPres.to_params(this.data.quran)));
   }
}
