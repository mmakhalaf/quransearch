import { Surah, Ayah, Category, QuranRoot, VerbForm, PartOfSpeech } from '../quran';

export function sort_by_surah(s1: Surah, s2: Surah): number {
   return s1.surah_num < s2.surah_num ? -1 : (s1.surah_num > s2.surah_num ? 1 : 0);
}

export function sort_ayah_by_id(a1: Ayah, a2: Ayah): number {
   return a1.id < a2.id ? -1 : (a1.id > a2.id ? 1 : 0);
}

export function sort_by_category(c1: Category, c2: Category): number {
   return c1.name.localeCompare(c2.name);
}

export function sort_by_root(r1: QuranRoot, r2: QuranRoot): number {
   return r1.text.localeCompare(r2.text);
}

export function sorty_by_verb_form(vf1: VerbForm, vf2: VerbForm): number {
   return vf1.id < vf2.id ? -1 : (vf1.id > vf2.id ? 1 : 0);
}

export function sort_by_part_of_speech(ps1: PartOfSpeech, ps2: PartOfSpeech): number {
   return ps1.sym.localeCompare(ps2.sym);
}
