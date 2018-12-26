
import * as MathUtils from './math-utils';

const multi_match_map_any = { 
   ا: '[اأآإى]',
   أ: '[أءؤئ]',
   ٱ: '[ءاأآ]',
   ء: '[ءأؤئ]'
   };
const multi_match_map_end = {
   ة: '[ةته]',   // END ONLY
   ت: '[تة]',    // END ONLY
   ه: '[هة]',    // END ONLY
   ى: '[ىي]',    // END ONLY
   ي: '[ىي]'     // END ONLY
};

function is_char_mid_word(q: string, index: number) {
   // If it's the first character and or preceded by a space,
   // or the last character or superceded by a space, then it's not in the middle
   // In the end of a word
   if (index == 0 || index == q.length - 1 ||
       q.charAt(index - 1) === ' ' || q.charAt(index + 1) === ' ') {
      return false;
   }
   return true;
}

function is_char_end_word(q: string, index: number) {
   if (is_char_mid_word(q, index)) {
      return false;
   }
   if (index == q.length - 1 || q.charAt(index + 1) == ' ') {
      return true;
   } else {
      return false;
   }
}

function is_char_start_word(q: string, index: number) {
   if (is_char_mid_word(q, index)) {
      return false;
   }
   if (index == 0 || q.charAt(index - 1) == ' ') {
      return true;
   } else {
      return false;
   }
}

function replace_any(q: string, index: number): string {
   let c = q.charAt(index);
   let repl = multi_match_map_any[c];
   if (repl === undefined) {
      return c;
   } else {
      return repl;
   }
}

function replace_end(q: string, index: number): string {
   let c = q.charAt(index);
   let repl = multi_match_map_end[c];
   if (repl === undefined) {
      return c;
   } else {
      return repl;
   }
}

/**
 * Return a regex on the query string which aims to be flexible
 * @param q Query string
 */
export function prep_regex(q: string, start_only?: boolean, end_only?: boolean): RegExp {
   let new_q = '';
   let q_len = q.length;
   for (let i = 0; i < q_len; ++i) {
      if (is_char_end_word(q, i)) {
         new_q += replace_end(q, i);
      } else {
         new_q += replace_any(q, i);
      }
      let c = q.charAt(i);
   }

   new_q = new_q.replace(' ', '\\s*');
   let re = `(${new_q})`;
   if (end_only !== undefined && end_only) {
      re += '$';
   }

   return new RegExp(re, 'g');
}

export function remove_diacritic(q: string) {
   // console.log(q);
   // q = q.replace('ـٰ', 'ا');

   let letter_range = MathUtils.make_range(1569, 1610);
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