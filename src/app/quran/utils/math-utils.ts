
/**
 * Make a range between s & e inclusive
 */
export function make_range(s: number, e: number): Set<number> {
   let arr = new Set<number>();
   for (let i = s; i <= e; ++i) {
      arr.add(i);
   }
   return arr;
}

/**
 * Return true if the ranges (inclusives) intersect or touch
 * Example,
 *   s1--------e1
 *       s2--------e2
 *  or,
 *       s1--------e1
 *   s2--------e2
 */
export function ranges_intersect(s1: number, e1: number, s2: number, e2: number) {
   if ((s1 >= s2 && s1 <= e2) || (s2 >= s1 && s2 <= e1)) {
      return true;
   } else {
      return false;
   }
}