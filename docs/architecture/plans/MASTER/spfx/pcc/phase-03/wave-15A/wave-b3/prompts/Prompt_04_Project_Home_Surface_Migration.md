# Prompt 04 — Project Home Surface Migration


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

Apply the shared tier/region/heading/footprint contract to every Project Home card in both fixture and read-model paths.

## Context


Use `02_SURFACE_CARD_INVENTORY_MATRIX.md`, Project Home rows. Preserve all read-model, fixture, and inert behavior.


## Required Work


1. Update Project Home card components under `surfaces/projectHome`.
2. Apply exact targets from the inventory matrix.
3. Ensure Project Intelligence is `tier='tier1'`, `region='command'`, `headingLevel={2}`, and active panel owner.
4. Convert Team Snapshot to `footprint='rail'`, `tier='tier3'`, `region='rail'`.
5. Convert Project Lens to rail.
6. Convert Lifecycle Timeline / Ask HBI / Related Records to detail where specified.
7. Mark missing config as `tier='state'`, `region='state'`.
8. Preserve read-model and fixture path card count expectations unless tests are intentionally updated.
9. Update Project Home tests for card tier/region assertions.


## Validation


Run:

```bash
pnpm --filter @hbc/spfx-project-control-center test -- PccProjectHome
pnpm --filter @hbc/spfx-project-control-center exec tsc --noEmit
pnpm exec prettier --check apps/project-control-center/src/surfaces/projectHome/**/*.tsx apps/project-control-center/src/tests/PccProjectHome*.tsx
git diff --check
md5 pnpm-lock.yaml
```


## Closeout Response Required


Report:
- Project Home cards migrated
- exact Tier 1 owner
- test output
- any read-model path caveats
