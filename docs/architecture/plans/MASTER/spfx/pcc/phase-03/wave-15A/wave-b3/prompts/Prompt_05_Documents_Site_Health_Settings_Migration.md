# Prompt 05 — Documents, Site Health, and Settings Surface Migration


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

Apply the shared card contract to Documents, Site Health, and Control Center Settings.

## Context


Use `02_SURFACE_CARD_INVENTORY_MATRIX.md` for Documents, Site Health, and Control Center Settings rows.


## Required Work


1. Migrate Documents:
   - header = tier1 command h2
   - Project Record = tier2 operational
   - My Project Files = tier2 operational
   - External Systems lane = tier3 deferred
   - Permissions & Guardrails = tier3 detail
   - Reviews & Approvals = tier2 detail
2. Migrate Site Health:
   - overview = tier1 command h2
   - checks/drift = tier2 operational
   - repair/procore seams = tier3 deferred
3. Migrate Settings:
   - overview = tier1 command h2
   - scope lanes = tier2 detail
   - missing setup = state
4. Preserve all inert/no-execution behavior.
5. Update or add tests for these routes.


## Validation


Run:

```bash
pnpm --filter @hbc/spfx-project-control-center test -- PccDocumentsSurface PccSiteHealthSurface PccControlCenterSettingsSurface
pnpm --filter @hbc/spfx-project-control-center exec tsc --noEmit
pnpm exec prettier --check apps/project-control-center/src/surfaces/documents/**/*.tsx apps/project-control-center/src/surfaces/siteHealth/**/*.tsx apps/project-control-center/src/surfaces/controlCenterSettings/**/*.tsx apps/project-control-center/src/tests/PccDocumentsSurface*.tsx apps/project-control-center/src/tests/PccSiteHealthSurface*.tsx apps/project-control-center/src/tests/PccControlCenterSettingsSurface*.tsx
git diff --check
md5 pnpm-lock.yaml
```


## Closeout Response Required


Report:
- surfaces migrated
- tests updated
- validation output
