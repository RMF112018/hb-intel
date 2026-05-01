# Prompt 07 — Wave 9 Readiness Signals for Priority Actions and Approvals Posture, No Execution

## Objective

Add display-only readiness signal summaries that prepare future Priority Actions and Approvals/Checkpoints integration without mutating queues or executing workflows.


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


## Allowed Files

```text
packages/models/src/pcc/
packages/models/src/pcc/fixtures/
apps/project-control-center/src/surfaces/projectReadiness/
apps/project-control-center/src/tests/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/
```

## Implementation Requirements

- Add read-model fields or computed fixture fields for `priorityActionSignal` and `approvalCheckpointSignal` only if not already present.
- Render a summary of readiness-generated signals:
  - blocked;
  - overdue;
  - missing evidence;
  - failed safety;
  - gate-blocking;
  - awaiting approval;
  - external setup/reference issue.
- Render approval/checkpoint posture as disabled/inert cards or chips.
- Do not create, mutate, enqueue, approve, return, waive, or execute any workflow.
- Add tests proving no executable action path.
- Document future integration handoff in Wave 9 docs if needed.


## Forbidden Scope

Do not implement or introduce:

- live Microsoft Graph file operations;
- live SharePoint/PnP/SharePoint REST operations;
- SharePoint list/library mutation or provisioning;
- tenant mutation;
- permission/group mutation;
- Procore runtime/API integration or writeback;
- Sage runtime/API integration or writeback;
- Outlook/calendar/email runtime mutation;
- Document Crunch or Adobe Sign runtime/writeback;
- Safety platform runtime integration;
- workflow/approval execution;
- Power Automate flows;
- notifications;
- production persistence writes;
- package/dependency/version/manifest changes unless this prompt explicitly authorizes and proves need;
- SPFx packaging/deployment/app-catalog upload;
- secrets/app settings;
- broad format rewrites outside touched files.


## Validation

Run:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
pnpm exec prettier --check docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/*.md
git diff --check
md5 pnpm-lock.yaml
```

## Commit

Summary:

```text
feat(spfx-pcc): surface lifecycle readiness signals
```

Body:

```text
Surfaces Wave 9 lifecycle-readiness signals for future Priority Actions and Approvals/Checkpoints integration. Adds display-only blocked, overdue, missing-evidence, failed-safety, gate-blocking, awaiting-approval, and external-reference signals while preserving inert/no-execution behavior.

No queue mutation, approval execution, notification, workflow execution, live Graph/PnP, SharePoint REST, Procore, Sage, Outlook, package, lockfile, manifest, deployment, tenant, or production changes are introduced.
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
