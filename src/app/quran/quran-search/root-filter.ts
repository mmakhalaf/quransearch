import { SearchFilter } from './search-filter';
import { Quran, QuranRoot } from '../quran';
import { QuranSearchOpts } from './search-opts';
import { SearchResults } from './search-result';

export class RootSearchFilter extends SearchFilter {
   num_matches = 0;

   constructor(id: number, searchOpts: QuranSearchOpts, private root: QuranRoot) {
      super(id, searchOpts);
   }

   filter(searchRes: SearchResults): SearchResults {

      this.num_matches = 0;
      if (this.root == null) {
         return searchRes;
      }

      // For each word derived from this root,
      //  For each ayah this word was mentioned in
      //   Add the Ayah as a result along with the word
      //   NOTE: This could probably be done faster by gathering the Ayat first
      //         and then going through the words, but we'll see if it needs optimising.
      let new_res = new SearchResults();
      for (let w of this.root.words) {
         for (let a of w.ayat) {
            let occ = a.word_occurances(w);
            if (occ.size == 0) {
               console.error(`Word ${w.imlaai} does not occur in the Ayah ${a.id}`);
            } else {
               this.num_matches++;
               new_res.add_result(a, occ);
            }
         }
      }

      return new_res;
   }

   // Return the number of matches by the last filtering operation
   number_matches(): number {
      return this.num_matches;
   }
}