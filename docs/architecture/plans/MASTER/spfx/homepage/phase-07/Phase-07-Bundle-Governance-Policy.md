# Phase 07 Bundle Governance Policy

Budget thresholds, enforcement mechanisms, and review triggers for Lane A and Lane B bundles.

## Budget thresholds

### Lane A — `apps/hb-webparts`

| Asset | Soft Warn | Hard Fail | Current |
|-------|-----------|-----------|---------|
| JS | 350 KB | 400 KB | 264.07 KB (66% of hard limit) |
| CSS | 5 KB | 10 KB | 0.63 KB (6% of hard limit) |

### Lane B — `apps/hb-shell-extension`

| Asset | Soft Warn | Hard Fail | Current |
|-------|-----------|-----------|---------|
| JS | 250 KB | 300 KB | 146.76 KB (49% of hard limit) |
| CSS | 5 KB | 10 KB | 2.22 KB (22% of hard limit) |

### Domain apps (existing)

| Asset | Hard Fail | Notes |
|-------|-----------|-------|
| JS | 1,500 KB | Existing `tools/spfx-bundle-check.ts` limit |

## Enforcement mechanisms

### 1. `tools/spfx-bundle-check.ts` (CI-ready)

The bundle-check script now covers both product lanes alongside domain apps:
- Checks JS and CSS sizes against lane-specific budgets
- Emits `✅` for within budget, `⚠️` for soft warn, `❌` for hard fail
- Exits non-zero on any hard-fail violation

Run: `npx tsx tools/spfx-bundle-check.ts`

### 2. Structural tests (per-lane)

Each lane has a `bundleBudget.test.ts` that verifies:
- `dist/` exists (requires build before test)
- JS total is under the hard budget
- CSS total is under the hard budget

These run as part of `pnpm run test` and fail the test suite if a budget is exceeded.

### 3. Import discipline (existing)

- Lane A: ESLint `no-restricted-imports` prohibits `@hbc/ui-kit` root and `@hbc/ui-kit/app-shell`
- Lane B: ESLint `no-restricted-imports` prohibits `@hbc/ui-kit` root and `@hbc/ui-kit/homepage`
- Structural import tests in both lanes verify no prohibited imports in source

## Review triggers

| Trigger | Action |
|---------|--------|
| Build output exceeds soft warn threshold | Developer should investigate the cause before merging |
| Build output exceeds hard fail threshold | CI/test fails — merge blocked until resolved |
| New dependency added to either lane | Reviewer should check bundle impact |
| New entry-point alias added to Vite config | Architecture review — may affect tree-shaking |
| Proof-case entry referenced from production mount | Bug — proof-case entries must not be imported by production |

## Tree-shaking posture

### Current tree-shaking audit results

| Concern | Status |
|---------|--------|
| Lane A imports only `@hbc/ui-kit/homepage` (narrow surface) | Verified — ESLint + structural test |
| Lane B imports only from `@hbc/ui-kit/app-shell` (narrow surface) | Verified — ESLint + structural test |
| Vite aliases point to correct narrow entry-point source files | Verified — aliases match entry-point docs |
| Proof-case entries are NOT imported by production mount | Verified — structural test in `mountDispatch.test.ts` |
| IIFE format inlines vendor code (expected; no chunk splitting) | Documented — IIFE is required by SPFx loader |
| `sideEffects: false` on `@hbc/ui-kit` enables bundler tree-shaking | Verified — set in `packages/ui-kit/package.json` |

### Known limitations

- IIFE format prevents chunk splitting — all code is in one file per lane
- React and ReactDOM are inlined (not externalized) because SPFx's loader cannot resolve them from the host
- These are architectural choices, not tree-shaking defects

## Budget rationale

| Lane | Why this budget? |
|------|-----------------|
| A (400 KB hard) | Current 264 KB + ~50% headroom for async data + property panes + future webpart complexity |
| B (300 KB hard) | Current 147 KB + ~100% headroom for placeholder content + future shell surfaces |
| CSS (10 KB hard) | Both lanes use CSS modules; current totals are under 3 KB; 10 KB is generous for future interactive states |
