
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

export class Quran {

   ayat: Array<Ayah> = null;
   is_loaded = false;
   
   constructor() {
      fetch('assets/quran.json', { cache: 'force-cache' }).then(r => r.json()).then(json => {
         this.load(json);
      });
   }

   private load(json: any) {
      this.ayat = new Array<Ayah>(json.length);

      let cur_a = 0;
      let cur_s = 0;
      for (let i = 0; i < json.length; ++i) {
         this.ayat[i] = new Ayah(json, i, cur_s, cur_a);

         cur_a++;
         if (cur_a >= suwar[cur_s][0]) {
            cur_a = 0;
            cur_s++;
         }
      }
      this.is_loaded = true;
   }
}

export class Ayah {
   id: number = -1;
   surah_idx: number = -1;
   ayah_surah_idx: number = -1;
   imlaa2y: string;
   uthmani: string;

   constructor(json: any, ayah_glob: number, surah: number, ayah: number) {
      this.id = ayah_glob;
      this.surah_idx = surah;
      this.ayah_surah_idx = ayah;
      this.imlaa2y = json[ayah_glob][0];
      this.uthmani = json[ayah_glob][1];
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
}
