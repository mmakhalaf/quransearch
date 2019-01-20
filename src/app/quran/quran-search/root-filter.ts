import { SearchFilter } from './search-filter';
import { QuranRoot, QuranWord, VerbForm, PartOfSpeech } from '../quran';
import { QuranSearchOpts, QuranSearchPlaceMode } from './search-opts';
import { SearchResults } from './search-result';
import * as SortUtils from '../utils/sort-utils';

export class RootSearchFilter extends SearchFilter {

   constructor(
      searchOpts: QuranSearchOpts, 
      private roots: Array<QuranRoot>,
      private vforms: Array<VerbForm>,
      private pospeech: Array<PartOfSpeech>
      ) {
      super(searchOpts);
      this.roots.sort(SortUtils.sort_by_root);
      this.vforms.sort(SortUtils.sorty_by_verb_form);
      this.pospeech.sort(SortUtils.sort_by_part_of_speech);
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
            if (w.ayah == res.ayah && this.is_right_form(w)) {
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
      if (poth.roots.length != this.roots.length ||
          poth.vforms.length != this.vforms.length ||
          poth.pospeech.length != this.pospeech.length) {
         return false;
      }

      // Check roots
      for (let i = 0; i < this.roots.length; ++i) {
         if (this.roots[i].text != poth.roots[i].text) {
            return false;
         }
      }

      // Check verb form
      for (let i = 0; i < this.vforms.length; ++i) {
         if (this.vforms[i] != poth.vforms[i]) {
            return false;
         }
      }

      // Check part of speech
      for (let i = 0; i < this.pospeech.length; ++i) {
         if (this.pospeech[i] != poth.pospeech[i]) {
            return false;
         }
      }

      return true;
   }

   private is_right_form(w: QuranWord): boolean {
      if (this.vforms.length > 0) {
         let idx = this.vforms.indexOf(w.verb_form);
         if (idx == -1) {
            return false;
         } else {
            return true;
         }
      }

      if (this.pospeech.length > 0) {
         for (let ps of this.pospeech) {
            let idx = w.parts_of_speech.indexOf(ps);
            if (idx != -1) {
               return true;   // If we match any of those (because we're OR'ing in a single filter)
            }
         }
         // Nothing found
         return false;
      }

      return true;
   }
}