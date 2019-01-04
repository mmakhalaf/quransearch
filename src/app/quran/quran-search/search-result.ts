import { Ayah } from '../quran';
import { QuranSearchSortMode } from './search-opts';

/**
 * A single search result of an Ayah and the matching words
 * Also, caches the text to be displayed to highlight matching words
 */
export class SearchResult {
   word_indices = new Array<number>();
   constructor(public ayah: Ayah, word_indices: Set<number>) {
      this.add_words(word_indices);
   }

   add_words(word_indices: Set<number>) {
      if (word_indices.size == 0) {
         return;
      }
      let cur_indices = new Set<number>(this.word_indices);
      word_indices.forEach((i: number) => {
         cur_indices.add(i);
      });
      this.set_word_indices(cur_indices);
   }

   add_words_arr(word_indices: Array<number>) {
      if (word_indices.length == 0) {
         return;
      }

      let cur_indices = new Set<number>(this.word_indices);
      for (let i of word_indices) {
         cur_indices.add(i);
      }
      this.set_word_indices(cur_indices);
   }

   merge(res: SearchResult) {
      this.add_words_arr(res.word_indices);
   }

   clone(): SearchResult {
      let r = new SearchResult(this.ayah, new Set<number>());
      r.word_indices.push(...this.word_indices);
      return r;
   }

   private set_word_indices(s: Set<number>) {
      if (s.size == 0) {
         this.word_indices = [];
         return;
      }

      this.word_indices = [];
      s.forEach((i) => {
         this.word_indices.push(i);
      });

      if (this.word_indices.length > 1) {
         this.word_indices = this.word_indices.sort((a: number, b: number) => {
            return a < b ? -1 : (a > b ? 1 : 0);
         });
      }
   }
}

/**
 * Represent a list of search results
 */
export class SearchResults {
   results = new Array<SearchResult>();

   clone(deep: boolean): SearchResults {
      let res = new SearchResults();
      for (let r of this.results) {
         if (deep) {
            res.results.push(r.clone());
         } else {
            res.results.push(r);
         }
      }
      return res;
   }

   add(res: SearchResult) {
      let cur_res = this.get_by_ayah(res.ayah);
      if (cur_res == null) {
         this.results.push(res);
      } else {
         cur_res.add_words_arr(res.word_indices);
      }
   }

   add_result(ayah: Ayah, word_indices: Set<number>) {
      let res: SearchResult = this.get_by_ayah(ayah);
      if (res != null && res !== undefined) {
         res.add_words(word_indices);
      } else {
         res = new SearchResult(ayah, word_indices);
         this.results.push(res);
      }
   }

   add_results(results: SearchResults) {
      for (let res of results.results) {
         let found = this.get_by_ayah(res.ayah);
         if (found != null) {
            found.merge(res);
         } else {
            this.results.push(res);
         }
      }
   }

   get_by_ayah_id(ayah_id: number): SearchResult {
      let idx = this.results.findIndex((r: SearchResult):boolean => {
         return r.ayah.id == ayah_id;
      });
      return idx == -1 ? null : this.results[idx];
   }
   
   get_by_ayah(ayah: Ayah): SearchResult {
      let idx = this.results.findIndex((r: SearchResult):boolean => {
         return r.ayah == ayah;
      });
      return idx == -1 ? null : this.results[idx];
   }

   length(): number {
      return this.results.length;
   }

   num_occurances(): number {
      let occ = 0;
      for (let r of this.results) {
         occ += r.word_indices.length;
      }
      return occ;
   }

   get_first(n: number): SearchResults {
      let sr = new SearchResults();
      if (n >= this.results.length) {
         n = this.results.length;
      }
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
            let res_no_seq = [];
            for (let res of this.results) {
               let n_seq = SearchResults.num_consequtive_seq(res.word_indices);
               if (n_seq > 0) {
                  res_with_seq.push(res);
               } else {
                  res_no_seq.push(res)
               }
            }

            res_with_seq.sort(this.sort_by_num_occ_prio_seq);
            res_no_seq.sort(this.sort_by_num_occ);
            this.results.splice(0, this.results.length);
            this.results.push(...res_with_seq);
            this.results.push(...res_no_seq);
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
      if (l.word_indices.length < r.word_indices.length) {
         return 1;
      } else {
         if (l.word_indices.length > r.word_indices.length) {
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
   static num_consequtive_seq(r: Array<number>): number {
      if (r.length == 1) {
         return 0;
      }

      let n_seq = 0;
      let last_w = -1;
      let in_seq = false;
      for (let w of r) {
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
      }

      if (in_seq) {
         ++n_seq;
      }
      return n_seq;
   }
}
