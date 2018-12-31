import { Quran, Ayah } from '../quran';
import { QuranSearchOpts, QuranSearchDisplayOpts } from './search-opts';
import { SearchResults } from './search-result';
import { SearchFilter } from './search-filter';

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
   
   add_filter(filter: SearchFilter) {
      this.filters.add(filter);
      this.search();
   }

   remove_filter(filter: SearchFilter) {
      if (this.filters.delete(filter)) {
         this.search();
      }
   }

   update_filter(filter: SearchFilter) {
      if (this.filters.has(filter)) {
         this.search();
      } else {
         this.add_filter(filter);
      }
   }

   search(): SearchResults {
      this.matches = this.quran_results;
      this.filters.forEach((filter: SearchFilter) => {
         this.matches = filter.filter(this.matches);
      });
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
