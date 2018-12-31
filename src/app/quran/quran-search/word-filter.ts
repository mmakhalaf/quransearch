import { SearchFilter } from './search-filter';
import { QuranSearchOpts, QuranSearchPlaceMode } from './search-opts';
import { Quran, Ayah } from '../quran';
import { SearchResults } from './search-result';
import * as QSearchUtils from './search-utils';

export class WordSearchFilter extends SearchFilter {

   num_matches = 0;
   
   constructor(id: number, searchOpts: QuranSearchOpts, private query: string) {
      super(id, searchOpts);
   }

   filter(searchRes: SearchResults): SearchResults {
      this.num_matches = 0;
      if (this.query.length == 0) {
         return searchRes;
      }

      let q = QSearchUtils.remove_diacritic(this.query);
      
      // Regular expressions in order of display
      let regexes = new Array<RegExp>();

      let qwords = q.trim().split(' ');
      if (this.searchOpts.place_mode == QuranSearchPlaceMode.Any) {
         regexes.push(QSearchUtils.prep_regex(q));
         for (let qw of qwords) {
            if (qw.length > 0) {
               regexes.push(QSearchUtils.prep_regex(qw));
            }
         }
      } else {
         regexes.push(QSearchUtils.prep_regex(
            q, 
            this.searchOpts.place_mode == QuranSearchPlaceMode.BeginOnly,
            this.searchOpts.place_mode == QuranSearchPlaceMode.EndOnly
            ));
      }

      let matches = new SearchResults();
      for (let re of regexes) {
         let sub_matches = this.search_by_regex(re, searchRes);
         matches.add_results(sub_matches);
      }
      return matches;
   }

   private search_by_regex(re: RegExp, searchRes: SearchResults): SearchResults {
      let matches = new SearchResults();
      for (let res of searchRes.results) {
         let words_i = new Set();
         let found = false;
         let m: RegExpExecArray = null;
         while ((m = re.exec(res.ayah.imlaai)) !== null) {
            found = true;
            let word_indices: Array<number> = res.ayah.imlaai_index_to_word(m.index, re.lastIndex);
            if (word_indices.length == 0) {
               console.error(`Could not find word indices in result for Ayah ${res.ayah.id}`);
            }
            for (let i of word_indices) {
               words_i.add(i);
            }
         }
         if (found) {
            matches.add_result(res.ayah, words_i);
         }
      }
      return matches;
   }
}
