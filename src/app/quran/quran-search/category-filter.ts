import { SearchFilter } from './search-filter';
import { Quran, Category } from '../quran';
import { QuranSearchOpts } from './search-opts';
import { SearchResults } from './search-result';

export class CategorySearchFilter extends SearchFilter {
   constructor(searchOpts: QuranSearchOpts, private category: Category) {
      super(searchOpts);
   }

   filter(searchRes: SearchResults): SearchResults {
      if (this.category == null) {
         return new SearchResults();
      }

      let matches = new SearchResults();
      let categories = this.category.get_children(true);
      for (let cat of categories) {
         for (let res of searchRes.results) {
            let catIdx = res.ayah.categories.indexOf(cat);
            if (catIdx != -1) {
               matches.add(res);
            }
         }
      }      
      return matches;
   }
   
   equals(oth: SearchFilter): boolean {
      let eq = super.equals(oth);
      if (!eq) {
         return false;
      }

      return this.category == (<CategorySearchFilter>oth).category;
   }
}