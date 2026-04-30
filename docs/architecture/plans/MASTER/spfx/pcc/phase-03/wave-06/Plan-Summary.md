# Plan Summary — Wave 6 Team & Access

Generated: 2026-04-30

## Objective

Implement the PCC Team & Access module as a fixture-default, read-model-safe workflow preview that supports request intake, request queue, review/detail UI, manager execution queue visibility, manual IT execution posture, and audit trail display.

## Implementation posture

Wave 6 builds UI and read-model plumbing only. It does **not** execute permissions.

## Sequencing

1. Close local repo-truth gate and scope lock.
2. Build app-local view model and adapter using existing shared models.
3. Add request form and status UI.
4. Add request queue and detail review UI.
5. Add manager execution queue and manual IT posture.
6. Optionally wire read-only `team-access` backend opt-in.
7. Harden guardrails and state regressions.
8. Close docs and prepare Wave 7.

## Main assumptions

- Existing `TeamAccess.ts` shared model is sufficient for the first UI pass.
- Any richer UI state belongs in app-local view models unless repo truth proves shared model changes are required.
- Approve/reject/comment UI remains local preview/read-model UI, not execution.
- “Approved, pending execution” means business review is complete and IT/manual execution is pending; it must never imply a SharePoint or Teams permission change occurred.
- Admin/IT execution queue is a visual/read-model queue only.

## Final validation command set

```bash
git status --short
md5 pnpm-lock.yaml
git diff --check

pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test

pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/functions build

pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build

md5 pnpm-lock.yaml
git diff --check
git diff --stat HEAD
git diff --name-only HEAD
```
