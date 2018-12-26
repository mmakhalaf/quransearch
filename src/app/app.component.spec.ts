/** Depends on Jasmine (through Angular) */

import { Quran } from './quran/quran';
import { QuranSearch } from './quran/quran-search';
import { QuranSearchOpts, QuranSearchPlaceMode, QuranSearchSortMode } from './quran/search-opts';

let quran = new Quran();

let exact_match_opts = new QuranSearchOpts();
exact_match_opts.place_mode = QuranSearchPlaceMode.ExactOrder;
exact_match_opts.sort_mode = QuranSearchSortMode.Sequence;

let search = new QuranSearch(quran, exact_match_opts);

// beforeEach(() => {
//    search = new QuranSearch(quran);
// });
describe('Search', () => {
   it('Test Suite', (done: any) => {
      setTimeout(() => {
         console.log('Starting Tests');
         start_tests(done);
      }, 250);
   });
});

function start_tests(done: any) {
   expect(quran.is_loaded).toEqual(true);
   expect_word_search('ياأيها', 142, 142);
   expect_word_search('يا أيها', 142, 142);
   expect_word_search('ياموسى', 24, 24);
   expect_word_search('يا موسى', 24, 24);
   expect_word_search('يأبى', 1, 1);
   done();
}

function expect_word_search(q: string, num_ayat: number, num_occ: number) {
   expect(search.search_by_word(q).length()).toEqual(num_ayat);
   expect(search.search_by_word(q).num_occurances()).toEqual(num_occ);
}

function expect_root_search(r: string, num_ayat: number, num_occ: number) {
   expect(search.search_by_root(r).length()).toEqual(num_ayat);
   expect(search.search_by_root(r).num_occurances()).toEqual(num_occ);
}
