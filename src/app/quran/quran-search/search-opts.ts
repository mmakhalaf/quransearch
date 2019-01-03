export enum QuranSearchSortMode {
   Sequence,         // Sequence of suwar
   Occurances,       // Occurances of word
   OccuranceSeqRes   // Occurance (prioritising sequential res)
}

export enum QuranSearchPlaceMode {
   BeginOnly,  // Word has to appear in the beginning of an Ayah (ExactOrder)
   EndOnly,    // Word has to appear in the end of an Ayah (ExactOrder)
   Any         // Words can appear anywhere
}

export enum QuranSearchMatchMode {
   ExactOrder, // Word has to appear in the exact order
   ExactOrderFullWord,  // Word has to appear in the exact order and match a full word
   Any
}

/**
 * Those options affect the way the searc is performed.
 * (i.e. They will have an impact on the number of results).
 */
export class QuranSearchOpts {
   place_mode = QuranSearchPlaceMode.Any;
   match_mode = QuranSearchMatchMode.ExactOrder;

   equals(oth: QuranSearchOpts): boolean {
      return this.place_mode == oth.place_mode && this.match_mode == oth.match_mode;
   }
}

/**
 * Those options affect the displaying of the result.
 */
export class QuranSearchDisplayOpts {
   sort_mode = QuranSearchSortMode.Sequence;
   equals(oth: QuranSearchDisplayOpts): boolean {
      return this.sort_mode == oth.sort_mode;
   }
}