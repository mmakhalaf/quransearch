import { Quran, Ayah } from './quran';

export class SearchResult {
   text = '';
   constructor(public ayah: Ayah, public word_index: Array<number>) {
      let arr = ayah.uthmani.split(' ');
      for (let i of word_index) {
         arr[i] = `<strong>${arr[i]}</strong>`;
      }
      this.text = arr.join(' ');
   }
}

const multi_match_map = { 
   ا: 'اأآإى', 
   أ: 'أءؤئ', 
   ٱ: 'ءاأآ',
   ء: 'ءأؤئ', 
   ت: 'تة', 
   ة: 'ةته', 
   ه: 'هة', 
   ى: 'ىي',
   ي: 'ىي'
   };

export class QuranSearch {

   constructor(private quran: Quran) {
      
   }

   search_by_word(q: string): Array<SearchResult> {
      console.log(q);
      for (let i = 0; i < q.length; ++i) {
         console.log(`i = ${i}. CP: ${q.codePointAt(i)}. CC: ${q.charCodeAt(i)}`);
      }

      const prep_re = new RegExp(`[${Object.keys(multi_match_map).join('')}]`, 'g');
      const re = new RegExp(`(${q.replace(prep_re, m => `[${multi_match_map[m]}]`)})`, 'g');
      
      let count = 0;
      let matches = [];
      for (let ayah of this.quran.ayat) {
         count++;
         let words_i = []
         let m = null;
         while ((m = re.exec(ayah.imlaa2y)) !== null) {
            // Sync the uthmani text to the imlaa'iee text
            let word_i = ayah.imlaa2y.slice(0, re.lastIndex).split(' ').length - 1;
            if ((count === 2442 && word_i > 2) || count === 5463 && word_i > 0) {
               word_i--;
            }
            
            const remove = ayah.imlaa2y.slice(0, m.index).match(/(^| )(ها|و?يا) /g);
            word_i -= remove ? remove.length : 0;
            word_i += ayah.uthmani.startsWith('۞') ? 1 : 0;
         
            words_i.push(word_i);
         }
         if (words_i.length > 0) {
            matches.push(new SearchResult(ayah, words_i));
         }
      }
      return matches;
   }
}
