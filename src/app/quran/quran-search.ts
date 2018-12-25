import { Quran, Ayah } from './quran';
import * as QSearchUtils from './search-utils';

/**
 * A single search result of an Ayah and the matching words
 * Also, caches the text to be displayed to highlight matching words
 */
export class SearchResult {
   text = '';
   word_indices = new Set<number>();
   constructor(public ayah: Ayah, word_indices: Set<number>) {
      this.add_words(word_indices);
   }

   private make_text() {
      let arr = this.ayah.uthmani.split(' ');
      this.word_indices.forEach((value: number, key: number) => {
         arr[value] = `<strong>${arr[value]}</strong>`;
      });
      this.text = arr.join(' ');
   }

   add_words(word_indices: Set<number>) {
      word_indices.forEach((val: number, k: number) => {
         this.word_indices.add(val);
      });
      this.make_text();
   }

   merge(res: SearchResult) {
      this.add_words(res.word_indices);
   }
}

/**
 * Represent a list of search results
 */
export class SearchResults {
   results = new Array<SearchResult>();

   add_result(ayah: Ayah, word_indices: Set<number>) {
      let res: SearchResult = this.get(ayah.id);
      if (res != null && res !== undefined) {
         res.add_words(word_indices);
      } else {
         res = new SearchResult(ayah, word_indices);
         this.results.push(res);
      }
   }
   add_results(results: SearchResults) {
      for (let res of results.results) {
         let found = this.get(res.ayah.id);
         if (found != null) {
            found.merge(res);
            return;
         } else {
            this.results.push(res);
         }
      }
   }

   get(ayah_id: number): SearchResult {
      for (let r of this.results) {
         if (r.ayah.id == ayah_id) {
            return r;
         }
      }
      return null;
   }

   length(): number {
      return this.results.length;
   }

   num_occurances(): number {
      let occ = 0;
      for (let r of this.results) {
         occ += r.word_indices.size;
      }
      return occ;
   }

   get_first(n: number): SearchResults {
      let sr = new SearchResults();
      sr.results = this.results.slice(0, n);
      return sr;
   }

   /**
    * Sort the results by number of occurances always prioritising subsequent
    * occurances
    */
   sort(mode: QuranSearchSortMode) {
      switch(mode) {
         case QuranSearchSortMode.Sequence: {
            this.results.sort(this.sort_by_ayah);
            break;
         }
         case QuranSearchSortMode.Occurances: {
            this.results.sort(this.sort_by_num_occ);
            break;
         }
         case QuranSearchSortMode.OccuranceSeqRes: {
            // For this, 
            // 1. We extract anything that has sequences, sort them by number of sequences
            // 2. The rest we sort by number of occurances
            let res_with_seq = [];
            this.results = this.results.reduce((p, c) => {
               let n_seq = SearchResults.num_consequtive_seq(c.word_indices);
               if (n_seq > 0) {
                  res_with_seq.push(c);
               } else {
                  p.push(c);
               }
               return p;
               }, []);
            res_with_seq.sort(this.sort_by_num_occ_prio_seq);
            this.results.sort(this.sort_by_num_occ);
            this.results.unshift(...res_with_seq);
            break;
         }
      }
   }

   // Search in an ascending order by the Ayah id (order of Ayat)
   sort_by_ayah = (l: SearchResult, r: SearchResult): number => {
      if (l.ayah.id < r.ayah.id) {
         return -1;
      } else {
         if (l.ayah.id > r.ayah.id) {
            return 1;
         } else {
            return 0;
         }
      }
   }

   // Sort in a descending order by the number of word occurances in result
   sort_by_num_occ = (l: SearchResult, r: SearchResult): number => {
      if (l.word_indices.size < r.word_indices.size) {
         return 1;
      } else {
         if (l.word_indices.size > r.word_indices.size) {
            return -1;
         } else {
            return this.sort_by_ayah(l, r);
         }
      }
   }

   // Sort in a descending order by the number of word occurances, but adding
   // to the top sequences
   sort_by_num_occ_prio_seq = (l: SearchResult, r: SearchResult): number => {
      let n_seq_l = SearchResults.num_consequtive_seq(l.word_indices);
      let n_seq_r = SearchResults.num_consequtive_seq(r.word_indices);
      if (n_seq_l < n_seq_r) {
         return 1;
      } else {
         if (n_seq_l > n_seq_r) {
            return -1;
         } else {
            return this.sort_by_num_occ(l, r);
         }
      }
   }

   // Return the number of word sequences in the result
   // For example, [ 1 2 3 6 8 9] => 2 sequences (1,2,3) and (8,9)
   static num_consequtive_seq(r: Set<number>): number {
      let n_seq = 0;
      let last_w = -1;
      let in_seq = false;
      r.forEach((w: number, k: number) => {
         if (w != last_w + 1) {
            // Not equal, so reset sequence (and increment if we're in a sequence)
            if (in_seq) {
               ++n_seq;
            }
            in_seq = false;
         } else {
            in_seq = true;
         }
         last_w = w;
      });

      if (in_seq) {
         ++n_seq;
      }
      return n_seq;
   }
}

export enum QuranSearchSortMode {
   Sequence,         // Sequence of suwar
   Occurances,       // Occurances of word
   OccuranceSeqRes   // Occurance (prioritising sequential res)
}

export enum QuranSearchPlaceMode {
   ExactOrder, // Word has to appear in the exact order
   BeginOnly,  // Word has to appear in the beginning of an Ayah (ExactOrder)
   EndOnly,    // Word has to appear in the end of an Ayah (ExactOrder)
   Any         // Words can appear in any order / sequence
}

/**
 * Options class to control how the search is performed
 */
export class QuranSearchOpts {
   place_mode = QuranSearchPlaceMode.ExactOrder;
   sort_mode = QuranSearchSortMode.OccuranceSeqRes;
}

export class QuranSearch {


   search_opts = new QuranSearchOpts();
   constructor(private quran: Quran) {
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
         // regexes.push(prep_regex(q));
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
         let m = null;
         while ((m = re.exec(ayah.imlaai)) !== null) {
            let word_i = ayah.imlaai_index_to_word(re.lastIndex);
            if (word_i != -1) {
               for (let i = 0; i < num_words + 1; ++i) {
                  words_i.add(word_i - i);
               }
            }
         }
         if (words_i.size > 0) {
            matches.add_result(ayah, words_i);
         }
      }
      return matches;
   }
}
