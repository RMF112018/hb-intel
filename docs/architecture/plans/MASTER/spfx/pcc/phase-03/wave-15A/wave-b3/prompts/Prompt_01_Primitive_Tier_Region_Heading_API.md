# Prompt 01 — Primitive Tier / Region / Heading API


# Operating Rules for the Local Code Agent

- Work only in the current repository.
- Do not re-read files that are still within your current context or memory. Use targeted reads only when verifying drift.
- Do not install packages.
- Do not change `pnpm-lock.yaml`.
- Do not modify backend/functions.
- Do not enable live integrations, mutations, saves, launches, approvals, repairs, sync, access changes, or HBI execution.
- Preserve read-only / preview-only / inert behavior.
- Preserve bento direct-child invariants.
- Preserve existing `data-pcc-*` markers unless the prompt explicitly instructs a replacement and test update.
- Run the required validation commands listed in this prompt.
- Close with commit-ready summary, files changed, validation output, and residual risks.


## Objective

Add the shared `tier`, `region`, and `headingLevel` contract to `PccDashboardCard` without changing surface behavior.

## Context


Use `01_CARD_TIER_REGION_CONTRACT.md` as the governing source. This prompt modifies only the primitive and primitive tests.


## Required Work


1. Update `apps/project-control-center/src/layout/PccDashboardCard.tsx`.
2. Export `PccCardTier` and `PccCardRegion`.
3. Extend `PccDashboardCardProps` with `tier`, `region`, `headingLevel`, and `ariaDescribedBy`.
4. Add resolution helpers:
   - explicit `tier` wins
   - `hierarchy='primary'` maps to `tier1`
   - `hierarchy='supporting'` maps to `tier3`
   - default maps to `tier2`
   - `tier1` defaults to `region='command'`
   - `tier2` defaults to `region='operational'`
   - `tier3` defaults to `region='reference'`
   - `state` defaults to `region='state'`
5. Add `data-pcc-card-tier` and `data-pcc-card-region`.
6. Preserve existing markers.
7. Implement visible-title `aria-labelledby`.
8. Implement `headingLevel`.
9. Add/update `PccDashboardCard.test.tsx` with all assertions in `07_TEST_ACCEPTANCE_MATRIX.md`.


## Validation


Run:

```bash
pnpm --filter @hbc/spfx-project-control-center exec tsc --noEmit
pnpm --filter @hbc/spfx-project-control-center test -- PccDashboardCard
pnpm exec prettier --check apps/project-control-center/src/layout/PccDashboardCard.tsx apps/project-control-center/src/layout/PccDashboardCard.test.tsx
git diff --check
md5 pnpm-lock.yaml
```


## Closeout Response Required


Report:
- files changed
- exact API added
- test output
- lockfile hash
- any deviations from `01_CARD_TIER_REGION_CONTRACT.md`
