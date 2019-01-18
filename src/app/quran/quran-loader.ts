import { Quran, Ayah, Category, Surah, QuranWord, PartOfSpeech, VerbForm } from './quran';
import * as StringUtils from './utils/string-utils';
import * as SortUtils from './utils/sort-utils';
import { isNullOrUndefined } from 'util';

function all_quran_loaded(): boolean {
   for (let k in qurans) {
      if (qurans[k] === undefined) {
         return false;
      }
   }
   return true;
}

function quran_len(): number {
   if (!all_quran_loaded()) {
      console.error('Getting quran lengths too early');
      return 0;
   }

   if (qurans.uthmani.length != qurans.uthmani.length) {
      console.error('Mismatching lengths of the quran Ayat from JSON');
      return 0;
   }

   return qurans.uthmani.length;
}

let qurans = {
   'suwar': undefined,
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
   '37:130:4' // إل ياسين
];


export class QuranLoader extends Quran {

   private constructor() {
      super();
   }

   static create(): Promise<Quran> {
      return QuranLoader.loadFiles().then(() => {
         // console.log('Files Loaded.');
         let q = new QuranLoader();
         if (q.load()) {
            q.error = false;
            return q;
         }
         
         console.error('Errors occured when loading.');
         return new Quran();
      });
   }

   private static loadFiles(): Promise<any> {
      // console.log('Loading Files.');
      let arr = new Array<Promise<any>>();
      for (let k in qurans) {
         arr.push(QuranLoader.loadFile(k));
      }
      return Promise.all(arr);
   }

   private static loadFile(k: any): Promise<any> {
      // console.log(`Load file ${k} Promise Sent`);
      return fetch(`assets/qdb_${k}.json`, { cache: 'default' })
         .then(r => r.json())
         .then(json => { qurans[k] = json; });
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
   
   private load(): boolean {
      if (!all_quran_loaded()) {
         console.error('Not all data is loaded');
         return false;
      }

      if (qurans.imlaai.length != qurans.uthmani.length) {
         console.error(`Inconsistent lengths for Quran files`);
         return false;
      }

      // console.log('Processing...');

      // Go through the suwar
      let idx = 1;
      this.suwar = new Map<number, Surah>();
      for (let s of qurans.suwar.suwar) {
         this.suwar.set(idx, new Surah(s.name, idx, s.num_ayat));
         ++idx;
      }

      // Go through the Ayat and construct our Ayah list and Word/Root store
      let len = quran_len();
      if (len == 0) {
         console.error('Invalid quran lengths');
         return false;
      }

      this.ayat = new Map<string, Ayah>();
      let cur_a = 1;
      let cur_s = 1;
      for (let i = 0; i < len; ++i) {
         let surah = this.suwar.get(cur_s);
         let a = new Ayah(i, surah, cur_a, qurans.uthmani[i], qurans.imlaai[i]);
         surah.ayat.push(a);
         this.ayat.set(StringUtils.ayah_str_id(cur_s, cur_a), a);

         cur_a++;
         if (cur_a >= surah.num_ayat + 1) {
            cur_a = 1;
            cur_s++;
         }
      }

      if (!this.process_morph()) {
         return false;
      }

      if (!this.process_ibn_kathir_relations()) {
         return false;
      }

      if (!this.process_index()) {
         return false;
      }

      // Validate the integrity of the data
      let errors = false;
      this.suwar.forEach((v: Surah, k: number) => {
         if (!v.check()) {
            errors = true;
         }
      });

      this.ayat.forEach((v: Ayah, k: string) => {
         if (!v.check()) {
            errors = true;
         }
      });

      // console.log('Done.');
      return !errors;
   }

   private process_morph(): boolean {
      // Store the tags
      for (let p of qurans.morph.tags.pos) {
         this.word_store.part_of_speech.push(new PartOfSpeech(p.s, p.ar, p.en));
      }

      // Store the verb forms
      for (let vf of qurans.morph.tags.vf) {
         this.word_store.verb_forms.push(new VerbForm(vf.f, vf.n));
      }

      // Add the words in the Ayah to the store
      // NOTE: It is essential that the number of words match in uthmani and imlaai
      let succ = true;
      this.ayat.forEach((ayah: Ayah, k: string) => {
         let iml_arr = ayah.imlaai.split(' ')
         let uth_arr = ayah.uthmani.split(' ')
         if (iml_arr.length != uth_arr.length) {
            console.error('Ayat imlaai and uthmani lengths do not match');
            succ = false;
            return;
         }
   
         let word_index = 1;
         for (let i = 0; i < iml_arr.length; ++i) {
            let iml = iml_arr[i];
            let uth = uth_arr[i];
            let root = null;
            let vf = -1;
            let tags = new Array<number>();
            if (iml != '۩' && iml != '۞') {
               // Exclude the sajda and hezb symbols from the root
               let morph_id = `${ayah.surah.surah_num}:${ayah.ayah_surah_idx}:${word_index}`;
               let morph = qurans.morph.w[morph_id];
               if (isNullOrUndefined(morph)) {
                  if (morph_excluded.indexOf(morph_id) == -1) {
                     // Repor the error if it's not just a previously detected false positive
                     console.error(`Ayah word ${morph_id} does not have root in ${ayah.imlaai}`);
                     succ = false;
                  }
               } else {
                  if (!isNullOrUndefined(morph.r)) {
                     root = morph.r;
                  }
                  if (!isNullOrUndefined(morph.vf)) {
                     vf = morph.vf;
                  }
                  if (!isNullOrUndefined(morph.t)) {
                     tags = morph.t;
                  }
               }
               ++word_index;
            }
            let word: QuranWord = this.word_store.add(iml, uth, root, vf, tags, ayah, i);
            if (word != null) {
               ayah.words.push(word);
            }
         }
      });
      return succ;
   }

   private process_ibn_kathir_relations(): boolean {
      // Go through the Ibn Kathir relevance map and connect the Ayat to each other
      // We create a map for each Ayah (source and target to ensure 2-way similarity)
      // and then we add similar ayat and their relevance into a map for each Ayah.
      let succ = true;
      let rel_map = new Map<Ayah, Map<Ayah, number>>();
      let rel_arr = qurans.ibnkathir_rel.kathir;
      for (let rel of rel_arr) {
         let src_id: string = StringUtils.ayah_str_id(+rel.ss, +rel.sv);
         let src_ayah = this.ayat.get(src_id);
         if (src_ayah === undefined) {
            console.error(`Ayah ${src_id} not found from relevance file`);
            succ = false;
            continue;
         }
         let targ_id = StringUtils.ayah_str_id(+rel.ts, +rel.tv);
         let targ_ayah = this.ayat.get(targ_id);
         if (targ_ayah === undefined) {
            console.error(`Ayah ${targ_id} not found from relevance file`);
            succ = false;
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

      return succ;
   }

   private process_index(): boolean {
      // Load the categories
      for (let cat of qurans.index.categories) {
         this.add_category(cat, null);
      }
      
      let succ = true;

      // Link the Ayat with the categories
      let idx_map = new Map<Ayah, Set<Category>>();
      let cat_map = new Map<Category, Array<Ayah>>();
      for (let a of qurans.index.ayat) {
         let a_id: string = StringUtils.ayah_str_id(a.s, a.a);
         let ayah = this.ayat.get(a_id);
         if (ayah === undefined) {
            console.error(`Could not find referenced Ayah in index ${a_id}`);
            succ = false;
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
                  succ = false;
               } else {
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
         val = val.sort(SortUtils.sort_ayah_by_id);
         k.ayat = val;
      });

      return succ;
   }
}