import { SearchFilter } from './search-filter';
import { Category } from '../quran';
import { QuranSearchOpts } from './search-opts';
import { SearchResults } from './search-result';
import * as SortUtils from '../utils/sort-utils';

export class CategorySearchFilter extends SearchFilter {
   constructor(searchOpts: QuranSearchOpts, private categories: Array<Category>) {
      super(searchOpts);
      this.categories.sort(SortUtils.sort_by_category);
   }

   filter(searchRes: SearchResults): SearchResults {
      if (this.categories == null || this.categories.length == 0) {
         return new SearchResults();
      }

      let all_cats = new Set<Category>();
      for (let c of this.categories) {
         let cchild: Array<Category> = c.get_children(true);
         for (let cc of cchild) {
            all_cats.add(cc);
         }
      }

      let matches = new SearchResults();
      all_cats.forEach((cat: Category) => {
         for (let res of searchRes.results) {
            let catIdx = res.ayah.categories.indexOf(cat);
            if (catIdx != -1) {
               matches.add(res);
            }
         }
      });

      return matches;
   }
   
   equals(oth: SearchFilter): boolean {
      if (!(oth instanceof CategorySearchFilter)) {
         return false;
      }
      
      let eq = super.equals(oth);
      if (!eq) {
         return false;
      }

      let poth = <CategorySearchFilter>oth;
      if (poth.categories.length != this.categories.length) {
         return false;
      }

      for (let i = 0; i < this.categories.length; ++i) {
         if (this.categories[i].name != poth.categories[i].name) {
            return false;
         }
      }
      
      return true;
   }
}