import { Surah, Ayah, Category, QuranRoot } from '../quran';

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
