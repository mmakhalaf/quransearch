import { SearchFilter } from './search-filter';
import { Quran, QuranRoot } from '../quran';
import { QuranSearchOpts } from './search-opts';
import { SearchResults } from './search-result';

export class RootSearchFilter extends SearchFilter {

   constructor(searchOpts: QuranSearchOpts, private root: QuranRoot) {
      super(searchOpts);
   }

   filter(searchRes: SearchResults): SearchResults {

      if (this.root == null) {
         return new SearchResults();
      }

      // For each search result => ayah
      //  For each word deriving from the root
      //   if the Ayah references the word, add it to our results
      let matches = new SearchResults();
      for (let res of searchRes.results) {
         for (let w of this.root.words) {
            let idx = w.ayat.indexOf(res.ayah);
            if (idx != -1) {
               let occ = res.ayah.word_occurances(w);
               if (occ.size == 0) {
                  console.error(`Word ${w.imlaai} does not occur in the Ayah ${res.ayah.id}`);
               } else {
                  res.add_words(occ);
                  matches.add(res);
               }
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

      return this.root == (<RootSearchFilter>oth).root;
   }
}