import { SearchFilter } from './search-filter';
import { QuranRoot, QuranWord } from '../quran';
import { QuranSearchOpts, QuranSearchPlaceMode } from './search-opts';
import { SearchResults } from './search-result';
import * as SortUtils from '../utils/sort-utils';

export class RootSearchFilter extends SearchFilter {

   constructor(searchOpts: QuranSearchOpts, private roots: Array<QuranRoot>) {
      super(searchOpts);
      this.roots.sort(SortUtils.sort_by_root);
   }

   filter(searchRes: SearchResults): SearchResults {

      if (this.roots == null || this.roots.length == 0) {
         return new SearchResults();
      }

      let words = new Set<QuranWord>();
      for (let r of this.roots) {
         for (let w of r.words) {
            words.add(w);
         }
      }

      // For each word deriving from the root
      //  For each search result => ayah
      //   If the Ayah references the word, add it to our results
      let matches = new SearchResults();
      words.forEach((w: QuranWord) => {
         for (let res of searchRes.results) {
            if (w.ayah == res.ayah) {
               let occ = res.ayah.word_occurances(w);
               if (occ.size == 0) {
                  console.error(`Word ${w.imlaai} does not occur in the Ayah ${res.ayah.id}`);
               } else {
                  if (this.searchOpts.place_mode == QuranSearchPlaceMode.Any ||
                      this.searchOpts.place_mode == QuranSearchPlaceMode.BeginOnly && occ.has(0) ||
                      this.searchOpts.place_mode == QuranSearchPlaceMode.EndOnly && occ.has(res.ayah.uthmani_words.length - 1)) {
                     res.add_words(occ);
                     matches.add(res);
                  }
               }
            }
         }
      });

      return matches;
   }

   equals(oth: SearchFilter): boolean {
      if (!(oth instanceof RootSearchFilter)) {
         return false;
      }
      let eq = super.equals(oth);
      if (!eq) {
         return false;
      }

      let poth = <RootSearchFilter>oth;
      if (poth.roots.length != this.roots.length) {
         return false;
      }

      for (let i = 0; i < this.roots.length; ++i) {
         if (this.roots[i].text != poth.roots[i].text) {
            return false;
         }
      }

      return true;
   }
}