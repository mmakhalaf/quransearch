export enum QuranSearchSortMode {
   Sequence,         // Sequence of suwar
   Occurances,       // Occurances of word
   OccuranceSeqRes   // Occurance (prioritising sequential res)
}

export enum QuranSearchPlaceMode {
   ExactOrder, // Word has to appear in the exact order
   BeginOnly,  // Word has to appear in the beginning of an Ayah (ExactOrder)
   EndOnly,    // Word has to appear in the end of an Ayah (ExactOrder)
   Any         // Words can appear in any order / sequence
}

/**
 * Those options affect the way the searc is performed.
 * (i.e. They will have an impact on the number of results).
 */
export class QuranSearchOpts {
   place_mode = QuranSearchPlaceMode.ExactOrder;
}

/**
 * Those options affect the displaying of the result.
 */
export class QuranSearchDisplayOpts {
   sort_mode = QuranSearchSortMode.Sequence;
}