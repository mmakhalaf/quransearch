
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
   'morph': undefined
};

// List of tokens excluded from validation
// Sometimes, we get an inconsistency between a 'word' in the Quran
// text (both uthmani and imlaa'i) because there is a space. This doesn't
// match the morphology file. In some case, the morphology file was fixed
// particular in how 'بعد ما' is treated as a single word in it.
let morph_excluded = [
   '36:129:3' // إل ياسين
];

function all_quran_loaded(): boolean {
   for (let k in qurans) {
      if (qurans[k] === undefined) {
         return false;
      }
   }
   return true;
}

function quran_consistent_len(): boolean {
   return qurans.imlaai.length == qurans.uthmani.length;
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

   ayat: Array<Ayah> = null;
   word_store = new QuranWordStore();
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

   private load() {
      if (!all_quran_loaded()) {
         return;
      }

      if (!quran_consistent_len()) {
         console.error(`Inconsistent lengths for Quran files`);
         return;
      }

      console.log('Files Loaded.');
      console.log('Processing...');

      let len = quran_len();
      this.ayat = new Array<Ayah>(len);
      let cur_a = 0;
      let cur_s = 0;
      for (let i = 0; i < len; ++i) {
         this.ayat[i] = new Ayah(i, cur_s, cur_a, this.word_store);

         cur_a++;
         if (cur_a >= suwar[cur_s][0]) {
            cur_a = 0;
            cur_s++;
         }
      }
      this.is_loaded = true;
      if (this.onLoaded != null) {
         this.onLoaded();
      }
      console.log('Done.');
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

   surah_name(): string {
      return suwar[this.surah_idx][1];
   }

   surah_ayah_num(): number {
      return this.ayah_surah_idx + 1;
   }

   surah_aya_num_ar(): string {
      return ('' + this.surah_ayah_num()).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'.substr(+d, 1));
   }

   surah_num(): number {
      return this.surah_idx + 1;
   }

   /**
    * Convert a character index to the nearest word before it
    * @param index 
    */
   imlaai_index_to_word(index: number): number {
      if (index < 0 || index >= this.imlaai.length) {
         return -1;
      }
      return this.imlaai.substr(0, index).trim().split(' ').length - 1;
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