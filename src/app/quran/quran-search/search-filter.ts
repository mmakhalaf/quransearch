import { Quran } from '../quran';
import { SearchResults } from './search-result';
import { QuranSearchOpts } from './search-opts';

export abstract class SearchFilter {
   quran: Quran = null;
   
   constructor(protected searchOpts: QuranSearchOpts) {
   }

   // Perform a search and return a NEW list with items from the list passed in
   abstract filter(searchRes: SearchResults): SearchResults;

   // Return true if the filters match perfectly
   equals(oth: SearchFilter): boolean {
      return this.searchOpts.equals(oth.searchOpts);
   }
}
