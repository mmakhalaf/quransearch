import { SearchFilter } from './search-filter';
import { Quran, Category } from '../quran';
import { QuranSearchOpts } from './search-opts';
import { SearchResults } from './search-result';

export class CategorySearchFilter extends SearchFilter {

   num_matches = 0;

   constructor(quran: Quran, searchOpts: QuranSearchOpts, private category: Category) {
      super(quran, searchOpts);
   }

   filter(searchRes: SearchResults): SearchResults {
      this.num_matches = 0;
      if (this.category == null) {
         return searchRes;
      }

      let new_res = new SearchResults();
      let categories = this.category.get_children(true);
      for (let cat of categories) {
         for (let res of searchRes.results) {
            let catIdx = res.ayah.categories.indexOf(cat);
            if (catIdx != -1) {
               this.num_matches++;
               new_res.addUnchecked(res);
            }
         }
      }      
      return new_res;
   }

   number_matches(): number {
      return this.num_matches;
   }
}