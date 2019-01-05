import { Ayah } from '../quran';


export function number_en_to_ar(num: number): string {
   return ('' + num).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'.substr(+d, 1));
}

export function ayah_str_id(sura: number, ayah: number) {
   return `${sura}:${ayah}`;
}
