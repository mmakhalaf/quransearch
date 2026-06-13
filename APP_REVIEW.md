# QuranSearch — Application Review & Dependency Upgrade

_Review date: 2026-06-13. Scope: full-app review (structure, design patterns,
caching, performance) plus an executed dependency upgrade from Angular 7 → 20._

---

## 1. Executive summary

QuranSearch is a small, well-factored Arabic Quran search SPA. Its **domain layer**
(the Quran model and search engine) is clean and framework-agnostic; the weak spots
are in the **application layer** (a god-service, hand-rolled event buses) and the
**toolchain**, which was ~6 years stale.

The toolchain was not merely old — it was **unbuildable in a modern environment**:
Angular 7 requires Node ≤ 12, but current environments run Node 22. As part of this
review the project was upgraded to **Angular 20 LTS** and verified to build, serve,
and pass an end-to-end smoke test.

| Area | Before | After |
| --- | --- | --- |
| Angular / Material / CDK | 7.2.1 | 20.3.x / 20.2.x |
| TypeScript | 3.2.4 | 5.8.x |
| RxJS / zone.js | 6.3.3 / 0.8 | 7.8 / 0.15 |
| Build system | webpack (`@angular-devkit:browser`) | esbuild (`@angular/build:application`) |
| Lint | TSLint + codelyzer (deprecated) | ESLint + angular-eslint |
| E2E | Protractor (EOL) | removed (Playwright recommended) |
| Module system | NgModules | standalone components |
| Abandoned dep | `ngx-virtual-scroller` (2022) | removed → native virtualization |
| Clipboard dep | `ngx-clipboard` | removed → CDK `Clipboard` |
| Polyfills | `core-js` v2, `hammerjs` | removed (not needed) |
| Prod bundle (transfer) | n/a | **~130 kB initial** |

---

## 2. Structure summary

```
src/app/
├── app.component / app.config.ts / app.routes.ts   # standalone bootstrap + routing
├── home/                                            # landing page (search button)
├── modal/ayah/                                      # ayah detail dialog (lazy)
├── quran/                                           # DOMAIN LAYER (framework-agnostic)
│   ├── quran.ts                                     # Quran / Surah / Ayah / QuranWord / Category
│   ├── quran-loader.ts                              # async fetch + parse of qdb_*.json
│   ├── quran-search/                                # search engine (strategy pattern)
│   │   ├── quran-searcher.ts                        # orchestrator + subset re-use logic
│   │   ├── search-filter.ts (abstract)
│   │   ├── word-filter.ts / root-filter.ts / category-filter.ts / surah-filter.ts
│   │   ├── search-opts.ts / search-result.ts
│   └── utils/                                        # regex/diacritic/sort/string/http helpers
├── search-page/                                     # main search UI (lazy)
│   ├── search-controls/ …                           # input, type-select, term/global settings, filters
│   └── results/ …                                   # results list + single result row
└── services/
    ├── quran.service.ts                             # central service: data + state + search + side-effects
    ├── filter-pres.ts                               # presentation models (FilterGroupPres / FilterPres)
    ├── nav-service.service.ts                       # router navigation
    └── controlres.service.ts                        # scroll event bus
src/assets/qdb_*.json                                # 6.5 MB Quran dataset (see §4)
```

- **Routing**: `/` (home, eager), `/search` (lazy), `ayah/:id` (lazy, dual
  `primary` + `modal` router outlets for shareable + overlay views).
- **Data flow**: components read/write `QuranService` directly; the service runs
  the `QuranSearcher` and notifies subscribers; search state is persisted to
  cookies and is round-trippable via URL query params.
- **UI**: Angular Material (form-field, autocomplete, select, chips, slide-toggle,
  bottom-sheet, dialog, tabs, snackbar, progress-bar, badge) + CDK
  `BreakpointObserver` for responsive layout. Fully RTL.

---

## 3. Design-pattern review

**Strengths**
- Clean separation of a **framework-agnostic domain layer** from the UI. The
  search engine uses a tidy **strategy pattern** (`SearchFilter` subclasses) and a
  smart "is this filter set a subset of the last one?" optimization to avoid
  re-searching from scratch.
- Lazy-loaded feature areas; URL/cookie round-tripping of search state.

**Weaknesses / smells** (findings — most deferred, see §7)
- **God service**: `QuranService` mixes data loading, search orchestration, state
  ownership, and UI side-effects (snackbar/clipboard). Violates SRP.
- **Hand-rolled event buses**: `onSearchCompleted`, `onQuranLoaded`, `onScroll`,
  `onFiltersUpdated` are `Map<any, callback>` with manual subscribe/unsubscribe in
  `ngOnInit`/`ngOnDestroy` — leak-prone and at odds with `OnPush`. RxJS
  `Subject`s/signals would be idiomatic.
- **Tight coupling**: every smart component injects and reads `qService.*`
  directly; no facade.
- **`SearchBlocker`** static counter as a global re-entrancy guard — fragile.
- **`setTimeout` races** in `AyahComponent.ngOnInit` to wait for data.
- **No error surfacing**: loader failures only `console.error` (one snackbar).
- **Fixed during this pass**: a self-comparison bug in the results component
  (`r.text === r.text`, which always de-duplicated to a single root) — now a
  correct `Set<string>` dedupe.

---

## 4. Data, caching & performance

**Dataset** (`src/assets`, ~6.5 MB total, loaded in parallel via `fetch` then
parsed into in-memory `Map`s at startup):

| File | Size | Contents |
| --- | --- | --- |
| `qdb_morph.json` | 3.0 MB | morphology: roots, verb forms, parts of speech |
| `qdb_uthmani.json` | 1.4 MB | Uthmani text (6,236 ayat) |
| `qdb_ibnkathir_rel.json` | 1.2 MB | related-ayah relevance graph |
| `qdb_imlaai.json` | 753 kB | Imlaai (vowelled) text |
| `qdb_index.json` | 301 kB | topic/category tree |
| `qdb_suwar.json` | 8.3 kB | 114 surah metadata |

**Caching today**: browser HTTP cache (`fetch(..., {cache:'default'})`) + an
in-memory module singleton + cookies for search state. **No service worker / PWA /
offline support; no IndexedDB.**

**Performance characteristics**
- ⚠️ **Startup**: 6.5 MB parsed + full object graph built on the main thread, all
  upfront (no lazy-by-surah, no Web Worker).
- ⚠️ **Search cost**: word search runs a regex `exec` across all 6,236 ayat per
  query (O(n·m)); root/category filters are linear scans. No inverted index/trie.
  Synchronous → can block the main thread on broad queries.
- ✅ **Rendering** (improved in this pass): results now render with `trackBy`,
  `OnPush` row components, and native **`content-visibility: auto`** virtualization
  (handles variable-height verse rows with no JS library); highlight lookups use a
  `Set` instead of `Array.indexOf`.

**Why not Angular CDK virtual scroll?** Stable `@angular/cdk` virtual scroll only
supports **fixed-size** items, which is incorrect for variable-height Arabic verse
rows; the only variable-height option is the *experimental* `@angular/cdk-experimental`
autosize strategy. To avoid an experimental dependency while still removing the
abandoned `ngx-virtual-scroller`, rows use native CSS containment
(`content-visibility`), which the browser virtualizes for free. For unbounded
result sets, a windowed virtual scroll remains a recommended future enhancement
(see §7).

---

## 5. Dependency upgrade (what was done)

**Targets pinned to current registry versions:** Angular core/router/forms
`^20.3`, Material/CDK `^20.2`, TypeScript `~5.8`, RxJS `~7.8`, zone.js `~0.15`,
`ngx-cookie-service ^20.1`, angular-eslint `^20.7`.

**Removed:** `core-js`, `hammerjs`, `ngx-virtual-scroller`, `ngx-clipboard`,
`tslint`, `codelyzer`, `protractor`, `@types/jasminewd2`.

**Mechanical migration work**
- New build system: `@angular/build:application` (esbuild); theme moved to
  `angular.json` styles (`azure-blue` M3 prebuilt, replacing the removed legacy
  `indigo-pink`); `polyfills: ["zone.js"]` (deleted `polyfills.ts`).
- **Standalone everything**: deleted all `*.module.ts`; `bootstrapApplication` +
  `app.config.ts` (`provideRouter`, `provideAnimationsAsync`) + `app.routes.ts`
  with `loadComponent` lazy routes; `entryComponents` removed.
- **Material 7 → 20 API**: barrel imports (`from '@angular/material'`) → per-entry
  submodule imports; `mat-chip-list`/`mat-chip` → `mat-chip-set`/`mat-chip-row`;
  invalid stacked `mat-icon-button mat-raised-button` → `mat-icon-button`;
  `[(matBadge)]` → `[matBadge]`; dialog/snackbar/slide-toggle/autocomplete/error-state
  imports repointed.
- **Idiom modernization**: constructor DI → `inject()`; `OnPush` + `trackBy` on
  results; `Set`-based highlighting.
- **Critical correctness fix**: removed `import { isNullOrUndefined } from 'util'`
  (a Node builtin that modern esbuild will not bundle) across 4 files, replaced
  with `== null` checks. Also removed an unused `XRegExp` ambient global and typed
  a bare `Set`.
- **Data loading** already used native `fetch` (not `HttpClient`), so no HTTP/RxJS
  migration was required there.

**Deliberately deferred (documented, not changed):** full `strict` /
`strictTemplates` TypeScript modes, and the design refactors in §7. The tsconfig
keeps `strict: false` / `strictTemplates: false` so the legacy code compiles
without a large type-annotation rewrite; tightening these incrementally is the
single highest-value follow-up.

---

## 6. Verification performed

- `npm install` — clean (652 packages, Node 22).
- `ng build` (production) — **succeeds**; initial bundle **~130 kB transfer**
  (budget 1.5 MB), no budget errors.
- `ng lint` — **0 errors** (warnings only: mostly `prefer-const` in legacy domain
  code; noisy legacy template a11y/`==`/`onX`-output rules downgraded to warnings).
- **End-to-end browser smoke test** (headless Chrome driving the served app):
  - Home loads (title `بحث`, search button present).
  - Word search `الله` → **1,661 ayat / 2,394 occurrences**, 2,394 highlighted
    words rendered.
  - Ayah modal (`ayah/:id`) opens with verse text, working tabs, related ayat with
    full diacritics and surah references.
  - **No application/Angular console errors.** (The only console errors are the
    external Scheherazade font CDN at `deendev.com` failing TLS — pre-existing,
    unrelated to the migration.)
- `ng test` (Karma): the spec doubles as a search-correctness suite against the
  real dataset, but the new `@angular/build:karma` builder has a jasmine-globals
  load-order quirk with this single legacy spec that was not resolved in this pass
  (see §7). The search behavior it asserts was instead validated via the browser
  smoke test above.

---

## 7. Backlog — status

All of the originally-identified backlog items have now been implemented (see the
git history; each was a separate commit).

**High value**
1. ✅ **TypeScript `strict` + Angular `strictTemplates` enabled.** `tsconfig.json`
   now sets `strict`, `noImplicitOverride`, `noImplicitReturns`,
   `noFallthroughCasesInSwitch`, and `strictTemplates`; all fallout fixed.
2. ✅ **Karma harness fixed.** `src/karma.conf.js` declares `frameworks: ['jasmine']`
   (the `@angular/build:karma` builder needs it) + a no-sandbox launcher; the
   search-correctness spec runs green headless.
3. ✅ **CI workflow added** (`.github/workflows/ci.yml`, `on: pull_request`): Node 22,
   lint → typecheck → build → headless unit tests, plus a separate Playwright e2e job.

**Medium value**
4. ✅ **`QuranService` decomposed** into `QuranDataService` (loading),
   `SearchService` (engine + state + persistence) and a thin `QuranService` facade
   (+ clipboard side effect).
5. ✅ **`Map`-based event buses replaced with RxJS** (`filtersUpdated$`, `scroll$`,
   `scrollToTop$`, `searchCompleted$`, `quranLoaded$`) with `takeUntilDestroyed()`;
   **`SearchBlocker` removed** in favour of `debounceTime(0)` coalescing; `OnPush`
   on the result row.
6. ✅ **Search moved into a Web Worker** (`search.worker.ts`), running the identical
   `QuranSearcher` for guaranteed parity, with an in-thread fallback.
   ⚠️ **Inverted word index: deferred (deliberate).** Preserving exact parity with
   the flexible Arabic matching (alef/teh variants, optional و, begin/end/full-word
   modes) via a token index is high-risk, and search is already fast once
   off-thread. Re-evaluate only if profiling shows a need. Trade-off of the worker:
   the dataset is parsed twice (once per thread) — acceptable as the worker parse is
   off the main thread; revisit if memory becomes a concern.
7. ✅ **PWA / offline**: `@angular/service-worker` + `ngsw-config.json` (app-shell
   prefetch; `/assets/**` incl. the 6.5 MB dataset cached) + web manifest. Verified
   registering/controlling against a production build.
8. ✅ **Windowed virtual scroll** via CDK `cdk-virtual-scroll-viewport autosize`
   (`@angular/cdk-experimental`) — only ~14 rows in the DOM for a 1,661-result query.

**Polish**
9. ✅ **Icons**: switched to **Material Symbols Outlined**, self-hosted, set as the
   default `mat-icon` font; icon names corrected.
10. ✅ **Scheherazade New Arabic font self-hosted** (SIL OFL, Arabic subset).
    Together with #9 the app now has **zero external resource dependencies** (fully
    offline-capable; smoke test shows 0 console errors).
11. ✅ **localStorage** replaces cookie persistence (`ngx-cookie-service` removed);
    **Playwright** e2e added (`playwright.config.ts`, `e2e/search.spec.ts`,
    `npm run e2e`).

### Remaining / future
- Inverted word index (see #6) if search latency ever matters.
- Fuller `OnPush`/signal-based state across the control components (they still bind
  to mutable service state with default change detection).
- App icons + installable-PWA polish (the manifest currently reuses `favicon.ico`).
