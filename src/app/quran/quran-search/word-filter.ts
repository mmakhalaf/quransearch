import { SearchFilter } from './search-filter';
import { QuranSearchOpts, QuranSearchPlaceMode, QuranSearchMatchMode } from './search-opts';
import { SearchResults } from './search-result';
import * as QSearchUtils from '../utils/search-utils';

export class WordSearchFilter extends SearchFilter {

   constructor(searchOpts: QuranSearchOpts, private query: string) {
      super(searchOpts);
   }

   filter(searchRes: SearchResults): SearchResults {
      if (this.query.length == 0) {
         return new SearchResults();
      }

      let q = QSearchUtils.remove_diacritic(this.query);
      if (q.length == 0) {
         return new SearchResults();
      }
      
      // Regular expressions in order of display
      let regexes = new Array<RegExp>();

      let qwords = q.trim().split(' ');
      if (this.searchOpts.match_mode == QuranSearchMatchMode.Any) {
         for (let qw of qwords) {
            if (qw.length > 0 && qw != 'و') {
               regexes.push(QSearchUtils.prep_regex(qw, false, false, true));
            }
         }
      } else {
         regexes.push(QSearchUtils.prep_regex(
            q,
            this.searchOpts.place_mode == QuranSearchPlaceMode.BeginOnly,
            this.searchOpts.place_mode == QuranSearchPlaceMode.EndOnly,
            this.searchOpts.match_mode == QuranSearchMatchMode.ExactOrderFullWord
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
            res.add_words(words_i);
            matches.add(res);
         }
      }
      return matches;
   }

   equals(oth: SearchFilter): boolean {
      if (!(oth instanceof WordSearchFilter)) {
         return false;
      }
      let eq = super.equals(oth);
      if (!eq) {
         return false;
      }

      return this.query == (<WordSearchFilter>oth).query;
   }
}
