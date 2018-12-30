
import * as MathUtils from './math-utils';
import * as StringUtils from './string-utils';

const suwar: any = [
   [7, "الفاتحة"], [286, "البقرة"], [200, "آل عمران"], [176, "النساء"],
   [120, "المائدة"], [165, "الأنعام"], [206, "الأعراف"], [75, "الأنفال"],
   [129, "التوبة"], [109, "يونس"], [123, "هود"], [111, "يوسف"], [43, "الرعد"],
   [52, "إبراهيم"], [99, "الحجر"], [128, "النحل"], [111, "الإسراء"],
   [110, "الكهف"], [98, "مريم"], [135, "طه"], [112, "الأنبياء"], [78, "الحج"],
   [118, "المؤمنون"], [64, "النور"], [77, "الفرقان"], [227, "الشعراء"], [93, "النمل"],
   [88, "القصص"], [69, "العنكبوت"], [60, "الروم"], [34, "لقمان"], [30, "السجدة"],
   [73, "الأحزاب"], [54, "سبأ"], [45, "فاطر"], [83, "يس"], [182, "الصافات"], [88, "ص"],
   [75, "الزمر"], [85, "غافر"], [54, "فصلت"], [53, "الشورى"], [89, "الزخرف"],
   [59, "الدخان"], [37, "الجاثية"], [35, "الأحقاف"], [38, "محمد"], [29, "الفتح"],
   [18, "الحجرات"], [45, "ق"], [60, "الذاريات"], [49, "الطور"], [62, "النجم"],
   [55, "القمر"], [78, "الرحمن"], [96, "الواقعة"], [29, "الحديد"],
   [22, "المجادلة"], [24, "الحشر"], [13, "الممتحنة"], [14, "الصف"],
   [11, "الجمعة"], [11, "المنافقون"], [18, "التغابن"], [12, "الطلاق"],
   [12, "التحريم"], [30, "الملك"], [52, "القلم"], [52, "الحاقة"], [44, "المعارج"],
   [28, "نوح"], [28, "الجن"], [20, "المزمل"], [56, "المدثر"], [40, "القيامة"],
   [31, "الإنسان"], [50, "المرسلات"], [40, "النبأ"], [46, "النازعات"], [42, "عبس"],
   [29, "التكوير"], [19, "الانفطار"], [36, "المطففين"], [25, "الانشقاق"],
   [22, "البروج"], [17, "الطارق"], [19, "الأعلى"], [26, "الغاشية"], [30, "الفجر"],
   [20, "البلد"], [15, "الشمس"], [21, "الليل"], [11, "الضحى"], [8, "الشرح"],
   [8, "التين"], [19, "العلق"], [5, "القدر"], [8, "البينة"], [8, "الزلزلة"],
   [11, "العاديات"], [11, "القارعة"], [8, "التكاثر"], [3, "العصر"], [9, "الهمزة"],
   [5, "الفيل"], [4, "قريش"], [7, "الماعون"], [3, "الكوثر"], [6, "الكافرون"],
   [3, "النصر"], [5, "المسد"], [4, "الإخلاص"], [5, "الفلق"], [6, "الناس"]
];

let qurans = {
   'uthmani': undefined,
   'imlaai': undefined,
   'morph': undefined,
   'ibnkathir_rel': undefined,
   'index': undefined
};

// List of tokens excluded from validation
// Sometimes, we get an inconsistency between a 'word' in the Quran
// text (both uthmani and imlaa'i) because there is a space. This doesn't
// match the morphology file. In some case, the morphology file was fixed
// particular in how 'بعد ما' is treated as a single word in it.
let morph_excluded = [
   '36:129:3' // إل ياسين
];

type AyahWithIdFn = (ayah: Ayah, ayah_id: string) => void;

function all_quran_loaded(): boolean {
   for (let k in qurans) {
      if (qurans[k] === undefined) {
         return false;
      }
   }
   return true;
}

function quran_len(): number {
   for (let k in qurans) {
      if (qurans[k] != null) {
         return qurans[k].length;
      }
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
export class QuranWord
{
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

function sort_ayah_by_id(a1: Ayah, a2: Ayah): number {
   return a1.id < a2.id ? -1 : (a1.id > a2.id ? 1 : 0);
}

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
}

//
// Store with all the Quran words
// The categorisation of a word is based on the imlaa'i text
//
export class QuranWordStore
{
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
}



export class Quran {

   private ayat: Map<string, Ayah> = null;
   word_store = new QuranWordStore();
   categories = new Map<number, Category>();
   is_loaded = false;

   onLoaded: (() => void) = null;

   constructor() {
      console.log('Loading Files...');
      for (let k in qurans) {
         fetch(`assets/qdb_${k}.json`, { cache: 'force-cache' }).then(r => r.json()).then(json => {
            qurans[k] = json;
            this.load();
         });
      }
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

   private static ayah_str_id(sura: number, ayah: number, incr_id: boolean) {
      if (incr_id) {
         return `${sura + 1}:${ayah + 1}`;
      } else {
         return `${sura}:${ayah}`;
      }
   }

   private static ayah_to_str_id(ayah: Ayah) {
      return `${ayah.surah_idx + 1}:${ayah.ayah_surah_idx + 1}`;
   }

   private load() {
      if (!all_quran_loaded()) {
         return;
      }

      if (qurans.imlaai.length != qurans.uthmani.length) {
         console.error(`Inconsistent lengths for Quran files`);
         return;
      }

      console.log('Files Loaded.');
      console.log('Processing...');

      // Go through the Ayat and construct our Ayah list and Word/Root store
      let len = quran_len();
      this.ayat = new Map<string, Ayah>();
      let cur_a = 0;
      let cur_s = 0;
      for (let i = 0; i < len; ++i) {
         this.ayat.set(Quran.ayah_str_id(cur_s, cur_a, true), new Ayah(i, cur_s, cur_a, this.word_store));

         cur_a++;
         if (cur_a >= suwar[cur_s][0]) {
            cur_a = 0;
            cur_s++;
         }
      }

      this.process_ibn_kathir_relations();
      this.process_index();

      console.log('Done.');
      this.is_loaded = true;
      if (this.onLoaded != null) {
         this.onLoaded();
      }
   }

   private process_ibn_kathir_relations() {
      // Go through the Ibn Kathir relevance map and connect the Ayat to each other
      // We create a map for each Ayah (source and target to ensure 2-way similarity)
      // and then we add similar ayat and their relevance into a map for each Ayah.
      let rel_map = new Map<Ayah, Map<Ayah, number>>();
      let rel_arr = qurans.ibnkathir_rel.kathir;
      for (let rel of rel_arr) {
         let src_id: string = Quran.ayah_str_id(+rel.ss, +rel.sv, false);
         let src_ayah = this.ayat.get(src_id);
         if (src_ayah === undefined) {
            console.error(`Ayah ${src_id} not found from relevance file`);
            continue;
         }
         let targ_id = Quran.ayah_str_id(+rel.ts, +rel.tv, false);
         let targ_ayah = this.ayat.get(targ_id);
         if (targ_ayah === undefined) {
            console.error(`Ayah ${targ_id} not found from relevance file`);
            continue;
         }

         if (src_ayah.id != targ_ayah.id) {
            let relevance = +rel.relevance;

            // Related source to targ
            let smap = rel_map.get(src_ayah);
            if (smap === undefined) {
               smap = new Map<Ayah, number>();
               rel_map.set(src_ayah, smap);
            }
            smap.set(targ_ayah, relevance);

            // Relate targ to source
            let tmap = rel_map.get(targ_ayah);
            if (tmap === undefined) {
               tmap = new Map<Ayah, number>();
               rel_map.set(targ_ayah, tmap);
            }
            tmap.set(src_ayah, relevance);
         }
      }

      // Now we go through the map and populate each Ayah with its similar Ayat
      rel_map.forEach((rel_ayat: Map<Ayah, number>, k: Ayah) => {
         k.set_related_ayat(rel_ayat);
      });
   }

   private add_category(cat: any, parent: Category) {
      let o = new Category(cat.id, cat.name);
      this.categories.set(o.id, o);
      if (parent != null) {
         parent.add_category(o);
      }
      if (cat.categories !== undefined) {
         for (let subcat of cat.categories) {
            this.add_category(subcat, o);
         }
      }
   }

   private process_index() {
      // Load the categories
      for (let cat of qurans.index.categories) {
         this.add_category(cat, null);
      }
      
      // Link the Ayat with the categories
      let idx_map = new Map<Ayah, Set<Category>>();
      let cat_map = new Map<Category, Array<Ayah>>();
      for (let a of qurans.index.ayat) {
         let a_id: string = Quran.ayah_str_id(a.s, a.a, false);
         let ayah = this.ayat.get(a_id);
         if (ayah === undefined) {
            console.error(`Could not find referenced Ayah in index ${a_id}`);
         } else {
            let cat_list = idx_map.get(ayah);
            if (cat_list === undefined) {
               cat_list = new Set<Category>();
               idx_map.set(ayah, cat_list);
            }

            for (let cat_idx of a.c) {
               let cat = this.categories.get(cat_idx);
               if (cat === undefined) {
                  console.error(`Could not find referenced category ${cat_idx}`);
               } else {
                  // if (cat_list.has(cat)) {
                  //    console.error(`Duplicate category "${cat.name}" in Ayah ${a_id}`);
                  // }
                  // Now add the categories to the Ayah
                  cat_list.add(cat);

                  let ayah_list = cat_map.get(cat);
                  if (ayah_list === undefined) {
                     ayah_list = new Array<Ayah>();
                     cat_map.set(cat, ayah_list);
                  }
                  ayah_list.push(ayah);
               }
            }
         }
      }

      idx_map.forEach((val: Set<Category>, k: Ayah) => {
         k.set_categories(val);
      });
      cat_map.forEach((val: Array<Ayah>, k: Category) => {
         val = val.sort(sort_ayah_by_id);
         k.ayat = val;
      });
   }
}

export class SimilarAyah {
   constructor(public ayah: Ayah, public relevance: number) {

   }
}

export class Ayah {
   id: number = -1;
   surah_idx: number = -1;
   ayah_surah_idx: number = -1;
   uthmani: string;
   uthmani_words: Array<string>;
   imlaai: string;
   words = new Array<QuranWord>();
   related_ayat = new Array<SimilarAyah>();
   categories = new Array<Category>();

   constructor(ayah_glob: number, surah: number, ayah: number, word_store: QuranWordStore) {
      this.id = ayah_glob;
      this.surah_idx = surah;
      this.ayah_surah_idx = ayah;
      this.uthmani = qurans.uthmani[ayah_glob];
      this.imlaai = qurans.imlaai[ayah_glob];
      this.uthmani_words = this.uthmani.split(' ');

      this.add_words(word_store);

      if (this.uthmani_words.length != this.words.length) {
         console.error(`Mismatching number of words in Ayah ${this.id}`);
      }
   }

   private add_words(word_store: QuranWordStore): boolean {
      // Add the words in the Ayah to the store
      // NOTE: It is essential that the number of words match in uthmani and imlaai
      //       This is ensured 
      let iml_arr = this.imlaai.split(' ')
      let uth_arr = this.uthmani.split(' ')
      if (iml_arr.length != uth_arr.length) {
         console.error('Ayat do not match');
         return false;
      }

      let word_index = 0;
      for (let i = 0; i < iml_arr.length; ++i) {
         let iml = iml_arr[i];
         let uth = uth_arr[i];
         let root = null;
         if (iml != '۩' && iml != '۞') {
            // Exclude the sajda and hezb symbols from the root
            let morph_id = `${this.surah_idx}:${this.ayah_surah_idx}:${word_index}`;
            root = qurans.morph[morph_id];
            if (root == null || root === undefined) {
               if (morph_excluded.indexOf(morph_id) == -1) {
                  // Repor the error if it's not just a previously detected false positive
                  console.error(`Ayah word ${morph_id} does not have root in ${this.imlaai}`);
               }
            } else {
               if (root === '_') {
                  root = null;
               }
            }
            ++word_index;
         }
         let word: QuranWord = word_store.add(iml, root, this);
         if (word != null) {
            this.words.push(word);
         }
      }
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
      return suwar[this.surah_idx][1];
   }

   surah_ayah_num(): number {
      return this.ayah_surah_idx + 1;
   }

   surah_aya_num_ar(): string {
      return StringUtils.number_en_to_ar(this.surah_ayah_num());
   }

   surah_num(): number {
      return this.surah_idx + 1;
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

      // Here we have the start index and end index of the match
      // We want to find out the words in between.
      // Go through each word and get its range.
      // If the ranges intersect, then we have a word
      let word_arr = this.imlaai.split(' ');
      let start_w = 0;
      let word_i = 0;
      for (let word of word_arr) {
         let end_w = start_w + word.length;
         if (MathUtils.ranges_intersect(start_w, end_w, start, end)) {
            word_indices.push(word_i);
         }
         ++word_i;
         start_w = end_w + 1;
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
