# Homepage Product Stabilization — Acceptance Checklist

Phase 01 acceptance criteria for `apps/hb-webparts` as a stabilized homepage product lane.

## Package-Level Verification

| Check | Method | Status |
|-------|--------|--------|
| TypeScript compiles without errors | `pnpm run check-types` | PASS |
| ESLint passes (includes import guardrails) | `pnpm run lint` | PASS |
| Vite IIFE build succeeds | `pnpm run build` | PASS (262.49 KB) |
| All tests pass | `pnpm run test` | PASS (14 files, 48 tests) |

## Import Discipline

| Check | Method | Status |
|-------|--------|--------|
| No `@hbc/ui-kit` root imports in source | ESLint `no-restricted-imports` + test | PASS |
| No `@hbc/ui-kit/app-shell` imports in source | ESLint `no-restricted-imports` + test | PASS |
| All UI imports use `@hbc/ui-kit/homepage` | Grep verification + structural test | PASS |

## Mount/Dispatch Seam

| Check | Method | Status |
|-------|--------|--------|
| `globalThis.__hbIntel_hbWebparts` publishes mount/unmount | Test: `mountDispatch.test.ts` | PASS |
| Mount function accepts SPFx loader contract signature | Test: `mountDispatch.test.ts` | PASS |
| All 10 production manifest IDs are in WEBPART_RENDERERS | Test: `mountDispatch.test.ts` | PASS |
| Excluded scaffold manifest ID is not referenced | Test: `mountDispatch.test.ts` | PASS |

## Webpart State Handling

| Check | Method | Status |
|-------|--------|--------|
| Top-band renders greeting with identity fallback | Test: `topBandWebparts.test.tsx` | PASS |
| Hero banner renders empty state when no config | Test: `topBandWebparts.test.tsx` | PASS |
| Utility webparts render loading states | Test: `utilityWebparts.test.tsx` | PASS |
| Utility webparts render empty states | Test: `utilityWebparts.test.tsx` | PASS |
| Communications render featured/secondary hierarchy | Test: `communicationsWebparts.test.tsx` | PASS |
| Communications render loading states | Test: `communicationsWebparts.test.tsx` | PASS |
| Operational awareness renders stale badges | Test: `operationalAwarenessWebparts.test.tsx` | PASS |
| Discovery renders search results and no-match fallback | Test: `discoveryWebpart.test.tsx` | PASS |

## Config Normalization

| Check | Method | Status |
|-------|--------|--------|
| Top-band normalizes alert severity whitelist | Test: `topBandWebparts.test.tsx` | PASS |
| Utility normalizes group ordering and audience filtering | Test: `utilityConfig.test.ts` | PASS |
| Communications normalizes featured/secondary split | Test: `communicationsConfig.test.ts` | PASS |
| Operational normalizes freshness/staleness | Test: `operationalAwarenessConfig.test.ts` | PASS |
| Discovery normalizes categories and promoted resources | Test: `discoveryConfig.test.ts` | PASS |

## Authoring Governance

| Check | Method | Status |
|-------|--------|--------|
| All 10 webparts registered in governance registry | Test: `authoringGovernance.test.ts` | PASS |
| All entries have owner and zone metadata | Test: `authoringGovernance.test.ts` | PASS |
| Message resolution cascade works (noResults → invalid → noData) | Test: `authoringGovernance.test.ts` | PASS |

## Documentation

| Check | Status |
|-------|--------|
| README reads as product-lane documentation (not scaffold) | PASS (P01-01) |
| Product boundary document exists | PASS (P01-01) |
| Package inventory document exists | PASS (P01-01) |
| Shared seam taxonomy document exists | PASS (P01-02) |
| Per-webpart contract reference exists | PASS (P01-03) |
| Phase 00 doctrine hierarchy is not regressed | PASS |
