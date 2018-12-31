import { Quran } from '../quran';
import { SearchResults } from './search-result';
import { QuranSearchOpts } from './search-opts';

export abstract class SearchFilter
{
   quran: Quran = null;
   
   constructor(public id: number, protected searchOpts: QuranSearchOpts) {
   }

   filter(searchRes: SearchResults): SearchResults {
      return searchRes;
   }
}
