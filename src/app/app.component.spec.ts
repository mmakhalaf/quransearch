/** Depends on Jasmine (through Angular) */

import { Quran, VerbForm, PartOfSpeech } from './quran/quran';
import { QuranSearcher, QuranSearchCriteria } from './quran/quran-search/quran-searcher';
import { QuranSearchOpts, QuranSearchPlaceMode, QuranSearchDisplayOpts, QuranSearchMatchMode } from './quran/quran-search/search-opts';
import { WordSearchFilter } from './quran/quran-search/word-filter';
import { RootSearchFilter } from './quran/quran-search/root-filter';
import { QuranLoader } from './quran/quran-loader';

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

   let exact_match_opts = new QuranSearchOpts();
   exact_match_opts.match_mode = QuranSearchMatchMode.ExactOrder;
   exact_match_opts.place_mode = QuranSearchPlaceMode.Any;

   let exact_match_start_ayah_opts = new QuranSearchOpts();
   exact_match_start_ayah_opts.match_mode = QuranSearchMatchMode.ExactOrder;
   exact_match_start_ayah_opts.place_mode = QuranSearchPlaceMode.BeginOnly;

   let exact_match_end_ayah_opts = new QuranSearchOpts();
   exact_match_end_ayah_opts.match_mode = QuranSearchMatchMode.ExactOrder;
   exact_match_end_ayah_opts.place_mode = QuranSearchPlaceMode.EndOnly;

   // Words
   expect_word_search('ياأيها', 142, 142, exact_match_opts);
   expect_word_search('يا أيها', 142, 142, exact_match_opts);
   expect_word_search('ياأيها', 124, 124, exact_match_start_ayah_opts);
   expect_word_search('يا أيها', 124, 124, exact_match_start_ayah_opts);
   expect_word_search('ياأيها', 0, 0, exact_match_end_ayah_opts);
   expect_word_search('يا أيها', 0, 0, exact_match_end_ayah_opts);

   expect_word_search('ياموسى', 24, 24, exact_match_opts);
   expect_word_search('يا موسى', 24, 24, exact_match_opts);
   expect_word_search('ياموسى', 1, 1, exact_match_start_ayah_opts);
   expect_word_search('يا موسى', 1, 1, exact_match_start_ayah_opts);
   expect_word_search('ياموسى', 8, 8, exact_match_end_ayah_opts);
   expect_word_search('يا موسى', 8, 8, exact_match_end_ayah_opts);
   
   expect_word_search('يأبى', 1, 1, exact_match_opts);
   
   
   // Roots
   expect_root_search('كلم', 71, 75, exact_match_opts);
   expect_root_search('كلم', 1, 1, exact_match_start_ayah_opts);
   expect_root_search('كلم', 2, 2, exact_match_end_ayah_opts);

   expect_root_search('رسل', 429, 513, exact_match_opts);
   expect_root_search('رسل', 17, 17, exact_match_start_ayah_opts);
   expect_root_search('رسل', 40, 40, exact_match_end_ayah_opts);


   expect_root_search('علم', 728, 854, exact_match_opts);
   expect_root_search('علم', 363, 425, exact_match_opts, [], ['V']);
   expect_root_search('علم', 123, 123, exact_match_opts, [], ['ADJ']);
   expect_root_search('علم', 36, 42, exact_match_opts, [2]);
   expect_root_search('علم', 36, 36, exact_match_start_ayah_opts);
   expect_root_search('علم', 309, 309, exact_match_end_ayah_opts);
   
   expect_root_search('ختم', 8, 8, exact_match_opts);
   expect_root_search('بعث', 64, 67, exact_match_opts);

   //
   done();
}

function expect_word_search(q: string, num_ayat: number, num_occ: number, opts: QuranSearchOpts) {
   console.log(`Test Word: ${q}`);
   let crit = new QuranSearchCriteria();
   crit.filters.push(new WordSearchFilter(opts, q));
   search.update_criteria(crit);
   expect(search.matches.length()).toEqual(num_ayat);
   expect(search.matches.num_occurances()).toEqual(num_occ);
}

function expect_root_search(r: string, num_ayat: number, num_occ: number, opts: QuranSearchOpts, vf?: Array<number>, pos?:Array<string>) {
   console.log(`Test Root: ${r}`);

   let vfarr = vf !== undefined ? vf.map(x => quran.word_store.get_verb_form(x)) : new Array<VerbForm>();
   let posarr = pos !== undefined ? pos.map(x => quran.word_store.get_part_of_speech(x)) : new Array<PartOfSpeech>();

   let root = quran.word_store.get_root(r);
   let crit = new QuranSearchCriteria();
   crit.filters.push(new RootSearchFilter(opts, [root], vfarr, posarr));
   search.update_criteria(crit);
   expect(search.matches.length()).toEqual(num_ayat);
   expect(search.matches.num_occurances()).toEqual(num_occ);
}
