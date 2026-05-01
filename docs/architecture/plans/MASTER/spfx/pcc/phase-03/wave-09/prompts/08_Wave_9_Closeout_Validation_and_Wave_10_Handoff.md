# Prompt 08 — Wave 9 Validation, Closeout, and Wave 10 Handoff

## Objective

Close Phase 3 Wave 9 with final validation, documentation, explicit exclusions, and Wave 10 Permit Log handoff. Do not add new feature behavior unless a narrow correction is required to close validation gaps.


## Mandatory Preflight

Run before any edits:

```bash
cd /Users/bobbyfetting/hb-intel
git status --short
git branch --show-current
git log --oneline -20
md5 pnpm-lock.yaml
```

Record unrelated pre-existing changes and do not stage or modify them. Do not use `git add .`. Stage only explicit paths approved by this prompt.

Do not re-read files that are still within your current context or memory; only re-open files when you need fresh repo truth, exact line references, or to verify changes after editing.


## Files to Inspect

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/
packages/models/src/pcc/
backend/functions/src/hosts/pcc-read-model/
apps/project-control-center/src/api/
apps/project-control-center/src/surfaces/projectReadiness/
apps/project-control-center/src/tests/
apps/project-control-center/README.md
```

## Required Closeout Doc

Create/update:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/Wave_9_Closeout.md
```

Closeout must include:

1. Executive summary.
2. Files changed by prompt.
3. Implemented model/read-model/fixture posture.
4. Backend route/provider posture, if implemented.
5. SPFx UI posture.
6. Canonical item-library coverage and source-traceability posture.
7. Startup, safety, and closeout family summary.
8. Evidence/document-control posture.
9. Priority Actions / Approvals signals posture.
10. Explicit exclusions.
11. Validation results.
12. Lockfile MD5 before/after.
13. Package/dependency/manifest status.
14. Remaining risks/operator-pending items.
15. Wave 10 Permit Log handoff.

## Required Validation

Run:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
pnpm --filter @hbc/spfx-project-control-center lint
pnpm exec prettier --check docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/*.md
git diff --check
md5 pnpm-lock.yaml
git status --short
git diff --stat
```

If a command is not applicable due to repo truth, run the nearest targeted equivalent and document the reason.

## Required Explicit Exclusions

The closeout must state Wave 9 did not introduce:

- live Graph/PnP/SharePoint REST runtime;
- SharePoint list/library/document storage mutation;
- Procore/Sage/Outlook runtime/writeback;
- Safety runtime/compliance engine;
- Approval execution;
- Priority Action queue mutation;
- notification execution;
- workflow execution;
- tenant mutation;
- package/dependency/lockfile/manifest changes unless explicitly documented and authorized;
- SPFx packaging/deployment/app-catalog upload;
- production rollout.

## Commit

Summary:

```text
docs(pcc): close wave 9 lifecycle readiness center
```

Body:

```text
Closes Phase 3 Wave 9 for the Project Lifecycle Readiness Center. Documents implemented startup/safety/closeout lifecycle-readiness model, fixture/read-model posture, source-traceability handling, command-surface UI, evidence/readiness posture, disabled signal integration for Priority Actions and Approvals, validation results, explicit exclusions, remaining risks, and Wave 10 Permit Log handoff.

No live Graph/PnP/SharePoint REST runtime, SharePoint mutation, Procore/Sage/Outlook runtime or writeback, Safety runtime, approval execution, priority-action queue mutation, notification execution, tenant mutation, package/dependency/lockfile/manifest changes, SPFx packaging/deployment, app-catalog upload, or production rollout is introduced unless separately documented and explicitly authorized.
```


## Required Closeout Response

Your final response must include:

- files changed;
- validation results;
- lockfile MD5 before/after;
- package/dependency/manifest status;
- explicit exclusions;
- remaining risks/operator-pending items;
- recommended next prompt.

If committing, use explicit path staging only. Do not use `git add .`.
