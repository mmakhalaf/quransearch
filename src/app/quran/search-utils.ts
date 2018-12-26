
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
const prep_re = new RegExp(`[${Object.keys(multi_match_map).join('')}]`, 'g');

/**
 * Return a regex on the query string which aims to be flexible
 * @param q Query string
 */
export function prep_regex(q: string, start_only?: boolean, end_only?: boolean): RegExp {
   let re = `(${q.replace(prep_re, m => `[${multi_match_map[m]}]`)})`;
   if (start_only !== undefined && start_only) {
      re = '^' + re;
   }
   if (end_only !== undefined && end_only) {
      re += '$';
   }
   return new RegExp(re, 'g');
}

function make_range(s: number, e: number): Set<number> {
   let arr = new Set<number>();
   for (let i = s; i <= e; ++i) {
      arr.add(i);
   }
   return arr;
}

export function remove_diacritic(q: string) {
   // console.log(q);
   // q = q.replace('ـٰ', 'ا');

   let letter_range = make_range(1569, 1610);
   letter_range.add(32);   // space
   let new_q = '';
   for (let i = 0; i < q.length; ++i) {
      let cc = q.charCodeAt(i);
      console.log(`${cc}: ${q.charAt(i)}`);
      if (letter_range.has(cc)) {
         new_q += String.fromCharCode(cc);
      }
   }
   
   // for (let l = 1550; l <= 1850; ++l) {
   //    console.log(`${l}: ${String.fromCharCode(l)}`);
   // }
   return new_q;
}