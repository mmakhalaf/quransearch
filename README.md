# QuranSearch

An Arabic Quran search application (word / root / topic / surah search) built with
Angular 20 and Angular Material.

## Prerequisites

- Node.js `^20.19` or `^22.12` (see `.nvmrc` — Node 22)
- npm 10+

## Compile & Run

```
cd quransearch
npm install
npm start          # ng serve -> http://localhost:4200
```

## Common tasks

```
npm run build      # production build (dist/quran-search/browser)
npm run lint       # ESLint (angular-eslint)
npm run typecheck  # tsc --noEmit (app + spec)
npm test           # unit / search tests via Karma (needs Chrome)
npm run e2e        # Playwright end-to-end tests
./prod_build.sh    # build for GitHub Pages into docs/
```

CI (`.github/workflows/ci.yml`) runs lint, typecheck, build, unit tests and the
Playwright e2e suite on every pull request.

Currently deployed to https://mmakhalaf.github.io

## Architecture & review

See [`APP_REVIEW.md`](./APP_REVIEW.md) for a full review of the structure, design
patterns, performance/caching characteristics, the Angular 7 → 20 upgrade that was
performed, and a prioritized backlog of recommended follow-ups.
