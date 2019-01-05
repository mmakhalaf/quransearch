
import { SearchFilter } from './search-filter';
import { QuranSearchOpts } from './search-opts';
import { SearchResults } from './search-result';
import { Surah } from '../quran';
import * as SortUtils from '../utils/sort-utils';
import { isNullOrUndefined } from 'util';

export class SurahSearcFilter extends SearchFilter {

   constructor(searchOpts: QuranSearchOpts, private suwar: Array<Surah>) {
      super(searchOpts);
      if (isNullOrUndefined(suwar)) {
         this.suwar = new Array<Surah>();
         console.error(`Null | Undefined surah provided to filter`);
      } else {
         this.suwar.sort(SortUtils.sort_by_surah);
      }
   }
   
   filter(searchRes: SearchResults): SearchResults {
      let matches = new SearchResults();
      for (let res of searchRes.results) {
         let idx = this.suwar.indexOf(res.ayah.surah);
         if (idx != -1) {
            matches.add(res);
         }
      }
      return matches;
   }

   equals(oth: SearchFilter): boolean {
      if (!(oth instanceof SurahSearcFilter)) {
         return false;
      }
      if (!super.equals(oth)) {
         return false;
      }

      let poth = <SurahSearcFilter>oth;
      if (poth.suwar.length != this.suwar.length) {
         return false;
      }

      for (let i = 0; i < this.suwar.length; ++i) {
         if (this.suwar[i].surah_num != poth.suwar[i].surah_num) {
            return false;
         }
      }

      return true;
   }

}