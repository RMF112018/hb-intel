# Phase 2 — Adapter and Output Foundation

## Objective

Build the normalized output foundation for the full homepage surface: Band A, Kudos module, and Band B.

## Why this package exists

This phase exists because later UI phases need a deterministic output shape that separates formal announcements, recognition, and weekly celebrations cleanly.

## Package contents

- implementation summary
- prompt 01
- prompt 02
- validation checklist

## Implementation artifacts

- `apps/hb-webparts/src/homepage/webparts/communicationsContracts.ts` — merged content model types
- `apps/hb-webparts/src/homepage/helpers/communicationsConfig.ts` — `normalizePeopleCultureMergedConfig()` normalizer
- `apps/hb-webparts/src/homepage/webparts/index.ts` — public type exports
- `apps/hb-webparts/src/homepage/helpers/authoringGovernance.ts` — updated governance entry
- `apps/hb-webparts/src/homepage/__tests__/peopleCultureMerged.test.ts` — deterministic proof (32 tests)
