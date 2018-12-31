/** Depends on Jasmine (through Angular) */

import { Quran } from './quran/quran';
import { QuranSearcher } from './quran/quran-search/quran-searcher';
import { QuranSearchOpts, QuranSearchPlaceMode, QuranSearchSortMode, QuranSearchDisplayOpts, QuranSearchMatchMode } from './quran/quran-search/search-opts';
import { WordSearchFilter } from './quran/quran-search/word-filter';
import { RootSearchFilter } from './quran/quran-search/root-filter';

let exact_match_opts = new QuranSearchOpts();
exact_match_opts.match_mode = QuranSearchMatchMode.ExactOrder;
exact_match_opts.place_mode = QuranSearchPlaceMode.Any;

let quran: Quran = null;
let search: QuranSearcher = null;

describe('Search', () => {
   it('Test Suite', (done: any) => {
      let start = new Date();
      Quran.create().then((q: Quran) => {
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
   done();
}

function expect_word_search(q: string, num_ayat: number, num_occ: number) {
   search.reset_filter(new WordSearchFilter(quran, exact_match_opts, q));
   let res = search.search();
   expect(res.length()).toEqual(num_ayat);
   expect(res.num_occurances()).toEqual(num_occ);
}

function expect_root_search(r: string, num_ayat: number, num_occ: number) {
   let root = quran.word_store.get_root(r);
   search.reset_filter(new RootSearchFilter(quran, exact_match_opts, root));
   let res = search.search();
   expect(res.length()).toEqual(num_ayat);
   expect(res.num_occurances()).toEqual(num_occ);
}
