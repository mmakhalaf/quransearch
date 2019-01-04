import { Ayah } from '../quran';


export function number_en_to_ar(num: number): string {
   return ('' + num).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'.substr(+d, 1));
}

export function ayah_str_id(sura: number, ayah: number) {
   return `${sura}:${ayah}`;
}

export function sort_ayah_by_id(a1: Ayah, a2: Ayah): number {
   return a1.id < a2.id ? -1 : (a1.id > a2.id ? 1 : 0);
}
