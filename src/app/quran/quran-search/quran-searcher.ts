import { Quran, Ayah } from '../quran';
import { QuranSearchOpts, QuranSearchDisplayOpts } from './search-opts';
import { SearchResults } from './search-result';
import { SearchFilter } from './search-filter';

export class QuranSearchCriteria {
   disp_opts = new QuranSearchDisplayOpts();
   filters = new Array<SearchFilter>();
}

export class QuranSearcher {

   private quran_results = null;
   matches = new SearchResults();
   filters = new Set<SearchFilter>();

   constructor(private quran: Quran, private disp_opts: QuranSearchDisplayOpts) {
      this.quran_results = this.prep_quran_as_results();
   }

   reset_filter(filter: SearchFilter) {
      this.filters.clear();
      this.filters.add(filter);
      this.search();
   }

   reset_filters(filters: Array<SearchFilter>) {
      this.filters.clear();
      this.filters = new Set<SearchFilter>(filters);
      this.search();
   }
   
   // Add a filter or update an existing one with the same id
   // and then repeat the search.
   add_filter(filter: SearchFilter) {
      let f = this.get_filter(filter);
      if (f != null) {
         this.filters.delete(f);
      }
      this.filters.add(filter);
      filter.quran = this.quran;
      this.search();
   }

   // Remove filter
   remove_filter(filter: SearchFilter) {
      let f = this.get_filter(filter);
      if (this.filters.delete(f)) {
         this.search();
      }
   }

   get_filter(f: SearchFilter) {
      if (this.filters.has(f)) {
         return f;
      } else {
         let found = null;
         this.filters.forEach((mf: SearchFilter) => {
            if (mf.id == f.id) {
               found = mf;
            }
         });
         return found;
      }
   }

   update_criteria(crit: QuranSearchCriteria) {
      this.disp_opts = crit.disp_opts;
      this.reset_filters(crit.filters);
   }

   search(): SearchResults {
      this.matches = this.quran_results;
      this.filters.forEach((filter: SearchFilter) => {
         filter.quran = this.quran;
         this.matches = filter.filter(this.matches);
      });
      this.matches.sort(this.disp_opts.sort_mode);
      return this.matches;
   }

   beginSearch(): Promise<SearchResults> {
      console.log(`Searcher creating promise`);
      return new Promise<SearchResults>((resolve, reject) => {
         this.search();
         resolve(this.matches);
      });
   }

   private prep_quran_as_results(): SearchResults {
      let results = new SearchResults();
      this.quran.for_each_ayah((ayah: Ayah, ayah_id: string) => {
         results.add_result(ayah, new Set<number>());
      });
      return results;
   }
}
