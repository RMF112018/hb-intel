# Prompt 07 — Team & Access and Project Readiness Surface Migration


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

Apply the shared card contract to Team & Access and the large Project Readiness surface/subregions.

## Context


Use targeted edits. Project Readiness is large; do not reformat or refactor unrelated logic.


## Required Work


1. Migrate Team & Access:
   - header = tier1 command h2
   - restricted access card = state
   - team viewer = tier2 operational
   - permission request/access manager = tier2 detail
2. Migrate Project Readiness:
   - hero = tier1 command h2
   - loading/error hero = state h2 active panel owner
   - blockers/domain/ownership/priority = tier2 operational
   - lifecycle/permit/responsibility/constraints/buyout = tier2 detail
   - evidence/source/downstream/procore = tier3 detail/reference/deferred as matrix specifies
3. Preserve active panel ownership rules.
4. Preserve loading/error fixture scaffold behavior.
5. Update route and subregion tests.


## Validation


Run:

```bash
pnpm --filter @hbc/spfx-project-control-center test -- PccTeamAccessSurface PccProjectReadinessSurface PccResponsibilityMatrix PccConstraintsLog PccBuyoutLog
pnpm --filter @hbc/spfx-project-control-center exec tsc --noEmit
pnpm exec prettier --check apps/project-control-center/src/surfaces/teamAccess/**/*.tsx apps/project-control-center/src/surfaces/projectReadiness/**/*.tsx apps/project-control-center/src/surfaces/responsibilityMatrix/**/*.tsx apps/project-control-center/src/surfaces/constraintsLog/**/*.tsx apps/project-control-center/src/surfaces/buyoutLog/**/*.tsx
git diff --check
md5 pnpm-lock.yaml
```


## Closeout Response Required


Report:
- Team & Access migration status
- Project Readiness migration status
- any subregion files touched
- validation output
