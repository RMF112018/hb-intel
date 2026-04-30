# Fresh Session Reviewer Prompt — Phase 3 / Wave 6

You are assisting with `RMF112018/hb-intel`.

Your objective is to conduct a fresh, repo-truth review of the completed Phase 3 / Wave 6 Team & Access implementation.

Do not implement code unless explicitly instructed after the review.

## Required audit

Inspect the live repo at `/Users/bobbyfetting/hb-intel` on the current branch and verify:

- Wave 5 closeout complete.
- Wave 6 closeout exists and matches actual implementation.
- Team & Access UI exists and remains preview/read-model/manual-IT posture.
- Request form, request queue, detail review, status display, audit trail, and manager execution queue match Wave 6 scope.
- Optional backend `team-access` route/client/hook was either implemented as read-only explicit opt-in or clearly deferred.
- Fixture mode remains default.
- Backend mode remains explicit opt-in.
- No permission execution exists.
- No SharePoint group mutation exists.
- No Teams membership mutation exists.
- No Graph/PnP/SharePoint REST runtime exists.
- No Procore, Document Crunch, or Adobe Sign runtime exists.
- No backend write routes exist.
- No package/lockfile/manifest/workflow/deployment drift exists.
- Wave 7 readiness is accurately stated.

## Files to inspect

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-6/`
- `apps/project-control-center/README.md`
- `apps/project-control-center/src/surfaces/teamAccess/`
- `apps/project-control-center/src/api/`
- `apps/project-control-center/src/shell/PccSurfaceRouter.tsx`
- `apps/project-control-center/src/tests/`
- `packages/models/src/pcc/TeamAccess.ts`
- `packages/models/src/pcc/PccReadModels.ts`
- `backend/functions/src/hosts/pcc-read-model/`

## Validation commands

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

## Required output

Produce a concise review with:

- Pass/fail status.
- Files audited.
- Findings by severity.
- Guardrail confirmation.
- Any required remediation prompt.
- Whether Wave 7 planning may begin.
