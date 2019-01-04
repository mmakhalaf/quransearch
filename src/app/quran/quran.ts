
import * as MathUtils from './utils/math-utils';
import * as StringUtils from './utils/string-utils';
import { isNullOrUndefined } from 'util';

export type AyahWithIdFn = (ayah: Ayah, ayah_id: string) => void;

//
// The Quran object which has everything (words, ayat, roots and categories)
//
export class Quran {
   error = true;
   protected suwar = new Map<number, Surah>();
   protected ayat = new Map<string, Ayah>();
   word_store = new QuranWordStore();
   categories = new Map<number, Category>();
   
   protected constructor() {

   }

   for_each_ayah(fn: AyahWithIdFn) {
      this.ayat.forEach(fn);
   }

   get_category(c: string): Category {
      let found = null;
      this.categories.forEach((val: Category, k: number) => {
         if (val.name == c) {
            found = val;
         }
      });
      return found;
   }
   
   get_categories_as_sorted_strings(): Array<string> {
      let arr = new Array<string>();
      this.categories.forEach((c: Category, k: number) => {
         arr.push(c.name);
      });
      arr.sort();
      return arr;
   }
}


//
// Represent a surah
//  Contains the list of Ayat
//
export class Surah {
   ayat = new Array<Ayah>();
   
   constructor(public name: string, public surah_num: number, public num_ayat: number) {
   }

   check(): boolean {
      let succ = true;
      if (this.ayat.length != this.num_ayat) {
         succ = false;
         console.error('Mismatching number of Ayat');
      }
      return succ;
   }
}


//
// Represent an Ayah in the Quran
// This has
// - references to its words (and through them, the roots)
// - its text, imlaii and uthmani
// - its categories
// - its related Ayat
//
export class Ayah {
   id: number = -1;
   surah: Surah = null;
   ayah_surah_idx: number = -1;
   uthmani: string;
   uthmani_words: Array<string>;
   imlaai: string;
   words = new Array<QuranWord>();
   related_ayat = new Array<SimilarAyah>();
   categories = new Array<Category>();

   constructor(ayah_glob: number, surah: Surah, ayah: number, uth: string, iml: string) {
      this.id = ayah_glob;
      this.surah = surah;
      this.ayah_surah_idx = ayah;
      this.uthmani = uth;
      this.imlaai = iml
      this.uthmani_words = this.uthmani.split(' ');
   }

   check(): boolean {
      let succ = true;
      if (this.words.length == 0) {
         console.error(`No words found in Ayah ${this.id}`);
         succ = false;
      }
      if (this.uthmani_words.length == 0) {
         console.error(`No uthmani words found in Ayah ${this.id}`);
         succ = false;
      }
      if (this.words.length != this.uthmani_words.length) {
         console.error(`Mismatching number of words in Ayah ${this.id}`);
         succ = false;
      }
      if (isNullOrUndefined(this.surah)) {
         console.error(`No Surah assigned to Ayah ${this.id}`);
         succ = false;
      }
      return succ;
   }

   set_related_ayat(rel_ayat: Map<Ayah, number>) {
      if (this.related_ayat.length > 0) {
         console.error(`Related Ayat populated twice for Ayah ${this.id}`);
         this.related_ayat = new Array<SimilarAyah>();
      }

      rel_ayat.forEach((relevance: number, ayah: Ayah) => {
         this.related_ayat.push(new SimilarAyah(ayah, relevance));
      });

      this.related_ayat.sort((a1: SimilarAyah, a2: SimilarAyah): number => {
         return a1.relevance < a2.relevance ? 1 : (a1.relevance > a2.relevance ? -1 : 0);
      });
      
      return true;
   }

   set_categories(cats: Set<Category>) {
      if (this.categories.length > 0) {
         console.error(`Categories populated twice for Ayah ${this.id}`);
         this.categories = new Array<Category>();
      }

      cats.forEach((cat: Category) => {
         this.categories.push(cat);
      });
   }

   surah_name(): string {
      return this.surah.name;
   }

   surah_ayah_num(): number {
      return this.ayah_surah_idx;
   }

   surah_aya_num_ar(): string {
      return StringUtils.number_en_to_ar(this.surah_ayah_num());
   }

   surah_num(): number {
      return this.surah.surah_num;
   }

   /**
    * Convert a character index to the nearest word before it
    * @param index 
    */
   imlaai_index_to_word(start: number, end: number): Array<number> {
      let word_indices = new Array<number>();
      if (start < 0 || start > this.imlaai.length ||
         end < 0 || end > this.imlaai.length) {
         return word_indices;
      }

      if (end - 1 < start) {
         end = start;
      } else {
         --end;
      }

      // Here we have the start index and end index of the match
      // We want to find out the words in between.
      // Go through each word and get its range.
      // If the ranges intersect, then we have a word
      let word_arr = this.imlaai.split(' ');
      let start_w = 0;
      let word_i = 0;
      for (let word of word_arr) {
         let end_w = start_w + word.length - 1;
         if (MathUtils.ranges_intersect(start_w, end_w, start, end)) {
            word_indices.push(word_i);
         }
         ++word_i;
         start_w = end_w + 2;
      }
      return word_indices;
   }

   word_occurances(word: QuranWord): Set<number> {
      let s = new Set<number>();
      for (let i = 0; i < this.words.length; ++i) {
         if (this.words[i] === word) {
            s.add(i);
         }
      }
      return s;
   }
}


//
// Represent a similar Ayah and the degree of relevance
//
export class SimilarAyah {
   constructor(public ayah: Ayah, public relevance: number) {

   }
}


//
// Store with all the Quran words
// The categorisation of a word is based on the imlaa'i text
//
export class QuranWordStore {
   private words = new Map<string, QuranWord>();
   private roots = new Map<string, QuranRoot>();
   constructor() {
   }

   add_word(iml: string, root: QuranRoot): QuranWord {
      let w = this.words.get(iml);
      if (w !== undefined) {
         if (w.get_root() == root) {
            return w;
         }
      }
      w = new QuranWord(iml);
      if (root != null) {
         w.set_root(root);
      }
      this.words.set(iml, w);
      return w;
   }

   add_root(root: string): QuranRoot {
      if (root == null) {
         return null;
      }

      let r = this.roots.get(root);
      if (r !== undefined) {
         return r;
      }
      
      r = new QuranRoot(root);
      this.roots.set(root, r);
      return r;
   }

   get_root(r: string): QuranRoot {
      let rt = this.roots.get(r);
      if (rt !== undefined) {
         return rt;
      }
      return null;
   }

   add(iml: string, root: string, ayah: Ayah): QuranWord {
      let qroot = this.add_root(root);
      let word: QuranWord = this.add_word(iml, qroot);
      if (word != null) {
         word.ayat.push(ayah);
      }
      return word;
   }

   get_roots_as_sorted_strings(): Array<string> {
      let arr = new Array<string>();
      this.roots.forEach((v: QuranRoot, k: string) => {
         arr.push(v.text);
      });
      arr.sort();
      return arr;
   }
}


//
// Represent a root word
//
export class QuranRoot {
   public words = new Array<QuranWord>();
   constructor(public text: string) {

   }
}

//
// Represent a word in the Quran
// They should reference back the Ayah which they reside in
// 
export class QuranWord {
   public ayat = new Array<Ayah>();
   private root: QuranRoot = null;
   constructor(public imlaai: string) {
   }

   set_root(root: QuranRoot): boolean {
      if (this.root == null) {
         this.root = root;
         this.root.words.push(this);
         return true;
      } else {
         // Just make sure the root is the same
         if (this.root != root) {
            console.error('Word has more than 1 root?');
            return false;
         } else {
            // Same root
            this.root.words.push(this);
            return true;
         }
      }
   }

   get_root(): QuranRoot {
      return this.root;
   }
}


//
// A category / sub-category
// This has refernces to the Ayat that are under it
//
export class Category {
   ayat = new Array<Ayah>();
   subcat = new Array<Category>();
   parent: Category = null;

   constructor(public id: number, public name: string) {

   }

   add_category(cat: Category) {
      this.subcat.push(cat);
      cat.parent = this;
   }

   get_children(include_this: boolean) {
      let children = new Array<Category>();
      if (include_this) {
         children.push(this);
      }
      Category.get_children(this, children);
      return children;
   }
   
   private static get_children(c: Category, children: Array<Category>) {
      for (let cc of c.subcat) {
         children.push(cc);
         Category.get_children(cc, children);
      }
   }

   get_parents(include_this: boolean): Array<Category> {
      let parents = new Array<Category>();
      if (include_this) {
         parents.push(this);
      }
      let p = this.parent;
      while (p != null) {
         parents.push(p);
         p = p.parent;
      }
      parents.reverse();
      return parents;
   }

   is_same_or_child_of(oth: Category): boolean {
      if (this == oth) {
         return true;
      }

      let p = this.parent;
      while (p != null) {
         if (p == oth) {
            return true;
         }
         p = p.parent;
      }
      
      return false;
   }
}
