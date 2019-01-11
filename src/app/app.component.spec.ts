/** Depends on Jasmine (through Angular) */

import { Quran } from './quran/quran';
import { QuranSearcher, QuranSearchCriteria } from './quran/quran-search/quran-searcher';
import { QuranSearchOpts, QuranSearchPlaceMode, QuranSearchSortMode, QuranSearchDisplayOpts, QuranSearchMatchMode } from './quran/quran-search/search-opts';
import { WordSearchFilter } from './quran/quran-search/word-filter';
import { RootSearchFilter } from './quran/quran-search/root-filter';
import { QuranLoader } from './quran/quran-loader';

let exact_match_opts = new QuranSearchOpts();
exact_match_opts.match_mode = QuranSearchMatchMode.ExactOrder;
exact_match_opts.place_mode = QuranSearchPlaceMode.Any;

let quran: Quran = null;
let search: QuranSearcher = null;

describe('Search', () => {
   it('Test Suite', (done: any) => {
      let start = new Date();
      QuranLoader.create().then((q: Quran) => {
         let end = new Date();
         let elp = end.valueOf() - start.valueOf();
         console.log(`Elapsed: ${elp}`);
         quran = q;
         search = new QuranSearcher(quran, new QuranSearchDisplayOpts());
         start_tests(done);
      });
   });
});

function start_tests(done: any) {
   expect_word_search('ياأيها', 142, 142);
   expect_word_search('يا أيها', 142, 142);
   expect_word_search('ياموسى', 24, 24);
   expect_word_search('يا موسى', 24, 24);
   expect_word_search('يأبى', 1, 1);
   expect_root_search('كلم', 71, 75);
   done();
}

function expect_word_search(q: string, num_ayat: number, num_occ: number) {
   console.log(`Test Word: ${q}`);
   let crit = new QuranSearchCriteria();
   crit.filters.push(new WordSearchFilter(exact_match_opts, q));
   search.update_criteria(crit);
   expect(search.matches.length()).toEqual(num_ayat);
   expect(search.matches.num_occurances()).toEqual(num_occ);
}

function expect_root_search(r: string, num_ayat: number, num_occ: number) {
   console.log(`Test Root: ${r}`);
   let root = quran.word_store.get_root(r);
   let crit = new QuranSearchCriteria();
   crit.filters.push(new RootSearchFilter(exact_match_opts, [root]));
   search.update_criteria(crit);
   expect(search.matches.length()).toEqual(num_ayat);
   expect(search.matches.num_occurances()).toEqual(num_occ);
}
