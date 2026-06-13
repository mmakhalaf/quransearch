/// <reference lib="webworker" />
//
// Off-main-thread search. The worker loads its own copy of the dataset and runs
// the exact same QuranSearcher as the main thread (guaranteeing result parity),
// returning serializable { id, wi } records that the main thread maps back onto
// its rendering model. Criteria are passed as serializable URL-style params and
// rebuilt here via FilterGroupPres (the same round-trip already used for cookie
// persistence and shareable URLs).

import type { Params } from '@angular/router';
import { Quran } from './quran/quran';
import { QuranLoader } from './quran/quran-loader';
import { QuranSearcher } from './quran/quran-search/quran-searcher';
import { QuranSearchDisplayOpts } from './quran/quran-search/search-opts';
import { FilterGroupPres } from './services/filter-pres';

interface SearchRequest {
   type: 'search';
   reqId: number;
   params: Params;
}

let quran: Quran | null = null;
let searcher: QuranSearcher | null = null;
let pending: { reqId: number; params: Params } | null = null;

QuranLoader.create().then((q: Quran) => {
   quran = q;
   searcher = new QuranSearcher(q, new QuranSearchDisplayOpts());
   postMessage({ type: 'ready', error: q.error });
   if (pending) {
      let p = pending;
      pending = null;
      run(p.reqId, p.params);
   }
});

addEventListener('message', ({ data }: MessageEvent<SearchRequest>) => {
   if (data == null || data.type !== 'search') {
      return;
   }
   if (searcher == null) {
      // Not loaded yet: keep only the latest request to run once ready.
      pending = { reqId: data.reqId, params: data.params };
      return;
   }
   run(data.reqId, data.params);
});

function run(reqId: number, params: Params) {
   if (searcher == null || quran == null) {
      return;
   }
   let group = FilterGroupPres.from_params(params);
   let crit = group.to_criteria(quran);
   if (crit.filters.length == 0) {
      postMessage({ type: 'result', reqId, updated: false, results: [] });
      return;
   }
   let updated = searcher.update_criteria(crit);
   let results = searcher.matches.results.map(r => ({ id: r.ayah.id, wi: r.word_indices }));
   postMessage({ type: 'result', reqId, updated, results });
}
