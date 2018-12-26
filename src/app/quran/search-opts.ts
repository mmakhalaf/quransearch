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
 * Options class to control how the search is performed
 */
export class QuranSearchOpts {
   place_mode = QuranSearchPlaceMode.ExactOrder;
   sort_mode = QuranSearchSortMode.Sequence;
}
