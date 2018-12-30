import { Quran } from '../quran';
import { SearchResults } from '../search-result';
import { QuranSearchOpts } from '../search-opts';

export abstract class SearchFilter
{
   constructor(protected quran: Quran, protected searchOpts: QuranSearchOpts) {
   }

   filter(searchRes: SearchResults): SearchResults {
      return searchRes;
   }
}
