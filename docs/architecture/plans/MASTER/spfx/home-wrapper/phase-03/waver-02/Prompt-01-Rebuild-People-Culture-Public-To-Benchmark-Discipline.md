# Prompt 01 — Rebuild People & Culture Public to benchmark homepage discipline

## Objective
Replace the current outlier surface posture in `PeopleCulturePublicSurface` with a benchmark-grade, governed homepage surface implementation.

## Governing authority
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/README.md`
- `docs/reference/ui-kit/homepage-webpart-benchmark.md`

## Inspect these files first
- `apps/hb-webparts/src/webparts/peopleCulturePublic/PeopleCulturePublic.tsx`
- `apps/hb-webparts/src/webparts/peopleCulturePublic/PeopleCulturePublicSurface.tsx`
- related split contracts/helpers under `apps/hb-webparts/src/homepage/**`
- benchmark reference families such as:
  - `apps/hb-webparts/src/webparts/companyPulse/CompanyPulse.tsx`
  - `apps/hb-webparts/src/webparts/leadershipMessage/LeadershipMessage.tsx`
  - `apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellence.tsx`
  - `apps/hb-webparts/src/webparts/hbKudos/*`

Do not re-read files that are still in active context unless you need to confirm drift, dependencies, or uncertainty after changes.

## Current gap
The public People & Culture surface is still self-contained and inline-style-heavy, with raw presentation literals and weaker shared-surface discipline than the strongest homepage modules.

## Required implementation outcome
- rebuild the surface as a benchmark-grade homepage family
- eliminate ordinary inline presentation objects and raw color/spacing literals
- preserve the hard split boundary between People & Culture Public and HB Kudos
- improve responsive behavior and shell fit
- keep author-safe empty/loading/error handling

## Closure proof required
Provide:
- changed architecture summary
- proof that the split boundary with HB Kudos remains intact
- explicit note on token/surface-family discipline
- any new tests or validation coverage

## Prohibited
- no re-merging of People & Culture and Kudos
- no unrelated shell contract work
