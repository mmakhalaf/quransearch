

export function number_en_to_ar(num: number): string {
   return ('' + num).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'.substr(+d, 1));
}