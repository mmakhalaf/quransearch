import { Quran, Ayah } from '../quran';
import { QuranSearchOpts, QuranSearchDisplayOpts } from './search-opts';
import { SearchResults } from './search-result';
import { SearchFilter } from './search-filter';

export class QuranSearchCriteria {
   disp_opts = new QuranSearchDisplayOpts();
   filters = new Array<SearchFilter>();
}

enum SearchOpMode {
   All,        // Repeat the search
   Subset,     // Only search through the current matches
   NoneSort,   // Don't repeat the search but repeat the sort
   None        // Don't repeat the search
}

export class QuranSearcher {

   matches = new SearchResults();
   filters = new Set<SearchFilter>();

   constructor(private quran: Quran, private disp_opts: QuranSearchDisplayOpts) {
   }

   private reset_filters(filters: Array<SearchFilter>, disp_opts: QuranSearchDisplayOpts): SearchOpMode {
      // We want to find out if the filter list we have is a subset or an exact
      // match of the incoming filter list so we either a) only search the current
      // matches, b) don't repeat the search
      // Note: This relies on it being an AND operation

      let nmatches = 0;
      this.filters.forEach((cur_filter: SearchFilter) => {
         let found = false;
         for (let in_filter of filters) {
            if (in_filter.equals(cur_filter)) {
               found = true;
               break;
            }
         }
         if (found) {
            nmatches++;
         }
      });

      let op = SearchOpMode.All;
      if (this.filters.size == filters.length) {
         // Same number of filter, so maybe a filter was updated

         if (nmatches == this.filters.size) {
            // All filters match
            op = this.disp_opts.equals(disp_opts) ? SearchOpMode.None : SearchOpMode.NoneSort;
         } else {
            // One of the filters changed, so repeat
            op = SearchOpMode.All;
         }
      } else if (this.filters.size < filters.length) {
         // Our filter size is smaller, so maybe a filter was added

         if (nmatches == this.filters.size && this.filters.size != 0) {
            // All filters matched, so we're a subset
            op = SearchOpMode.Subset;
         } else {
            // Filters have changed, so repeat
            op = SearchOpMode.All;
         }
      } else {
         // Our filter list is larger, so maybe a filter was removed
         op = SearchOpMode.All;
      }

      this.filters = new Set<SearchFilter>(filters);
      this.disp_opts = disp_opts;
      return op;
   }
   
   update_criteria(crit: QuranSearchCriteria): boolean {
      let op = this.reset_filters(crit.filters, crit.disp_opts);
      switch (op) {
         case SearchOpMode.All: {
            this.search(this.prep_quran_as_results());
            return true;
         }
         case SearchOpMode.None: {
            return false;
         }
         case SearchOpMode.NoneSort: {
            this.matches.sort(this.disp_opts.sort_mode);
            return true;
         }
         case SearchOpMode.Subset: {
            this.search(this.matches);
            return true;
         }
      }
   }

   private search(initial_set: SearchResults): SearchResults {
      if (this.filters.size == 0) {
         this.matches = new SearchResults();
      } else {
         this.matches = initial_set;
         this.filters.forEach((filter: SearchFilter) => {
            filter.quran = this.quran;
            this.matches = filter.filter(this.matches);
         });
      }
      this.matches.sort(this.disp_opts.sort_mode);
      return this.matches;
   }

   private prep_quran_as_results(): SearchResults {
      let results = new SearchResults();
      this.quran.for_each_ayah((ayah: Ayah, ayah_id: string) => {
         results.add_result(ayah, new Set<number>());
      });
      return results;
   }
}
