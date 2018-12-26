import { Quran } from './quran';
import * as QSearchUtils from './search-utils';
import { QuranSearchOpts, QuranSearchPlaceMode } from './search-opts';
import { SearchResults, SearchResult } from './search-result';

export class QuranSearch {


   search_opts: QuranSearchOpts = null;
   constructor(private quran: Quran, search_opts?: QuranSearchOpts) {
      if (search_opts !== undefined) {
         this.search_opts = search_opts;
      } else {
         this.search_opts = new QuranSearchOpts();
      }
   }

   search_by_root(r: string): SearchResults {
      let root = this.quran.word_store.get_root(r);
      let matches = new SearchResults();
      if (root == null) {
         return matches;
      }

      // For each word derived from this root,
      //  For each ayah this word was mentioned in
      //   Add the Ayah as a result along with the word
      //   NOTE: This could probably be done faster by gathering the Ayat first
      //         and then going through the words, but we'll see if it needs optimising.
      for (let w of root.words) {
         for (let a of w.ayat) {
            let occ = a.word_occurances(w);
            if (occ.size == 0) {
               console.error(`Word ${w.imlaai} does not occur in the Ayah ${a.id}`);
            } else {
               matches.add_result(a, occ);
            }
         }
      }

      matches.sort(this.search_opts.sort_mode);
      return matches;
   }

   search_by_word(q: string): SearchResults {
      q = QSearchUtils.remove_diacritic(q);
      
      // Regular expressions in order of display
      let regexes = [];

      let qwords = q.trim().split(' ');
      if (this.search_opts.place_mode == QuranSearchPlaceMode.Any) {
         regexes.push({re: QSearchUtils.prep_regex(q), w: qwords.length - 1});
         for (let qw of qwords) {
            if (qw.length > 0) {
               regexes.push({re: QSearchUtils.prep_regex(qw), w: 0});
            }
         }
      } else {
         regexes.push({re: QSearchUtils.prep_regex(
            q, 
            this.search_opts.place_mode == QuranSearchPlaceMode.BeginOnly,
            this.search_opts.place_mode == QuranSearchPlaceMode.EndOnly
            ), w: qwords.length - 1
         });
      }

      let matches = new SearchResults();
      for (let re_tup of regexes) {
         let sub_matches = this.search_by_regex(re_tup.re, re_tup.w);
         sub_matches.sort(this.search_opts.sort_mode);
         matches.add_results(sub_matches);
      }
      return matches;
   }

   private search_by_regex(re: RegExp, num_words: number): SearchResults {
      let matches = new SearchResults();
      for (let ayah of this.quran.ayat) {
         let words_i = new Set();
         let found = false;
         let m: RegExpExecArray = null;
         while ((m = re.exec(ayah.imlaai)) !== null) {
            found = true;
            let word_indices: Array<number> = ayah.imlaai_index_to_word(m.index, re.lastIndex);
            if (word_indices.length == 0) {
               console.error(`Could not find word indices in result for Ayah ${ayah.id}`);
            }
            for (let i of word_indices) {
               words_i.add(i);
            }
         }
         if (found) {
            matches.add_result(ayah, words_i);
         }
      }
      return matches;
   }
}
