# Prompt 06 — Approvals and External Systems Surface Migration


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

Apply the shared card contract to Approvals and External Systems without enabling execution paths.

## Context


Use `02_SURFACE_CARD_INVENTORY_MATRIX.md` for Approvals and External Systems rows.


## Required Work


1. Migrate Approvals:
   - home = tier1 command h2
   - queue/my approvals/escalation/admin verification = tier2 operational
   - registry = tier3 detail
   - policy/module integration/HBI = tier3 reference
   - decision history/lineage seams = tier3 deferred
   - loading/error route card = state h2 active panel owner
2. Migrate External Systems:
   - header = tier1 command h2
   - summary/mapping = tier2 operational
   - project links/review queue = tier2 detail
   - registry/source/audit/HBI = tier3 reference
   - procore config = tier3 deferred
   - loading/error route card = state h2 active panel owner
3. Preserve drawers, panels, and selection behavior.
4. Preserve disabled launch/save/review posture.
5. Update tests.


## Validation


Run:

```bash
pnpm --filter @hbc/spfx-project-control-center test -- PccApprovalsSurface PccExternalSystemsSurface
pnpm --filter @hbc/spfx-project-control-center exec tsc --noEmit
pnpm exec prettier --check apps/project-control-center/src/surfaces/approvals/**/*.tsx apps/project-control-center/src/surfaces/externalSystems/**/*.tsx apps/project-control-center/src/tests/PccApprovalsSurface*.tsx apps/project-control-center/src/tests/PccExternalSystems*.tsx
git diff --check
md5 pnpm-lock.yaml
```


## Closeout Response Required


Report:
- Approvals and External Systems migration status
- deferred seams preserved
- test output
