# Prompt 06 — Wave 9 Item Detail, Evidence, Risk, Ownership, and Degraded States

## Objective

Enhance the Wave 9 surface with item-level detail, evidence posture, ownership/accountability, risk/criticality, dependency, exception, and degraded-state rendering.


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
apps/project-control-center/src/surfaces/projectReadiness/
apps/project-control-center/src/tests/
packages/models/src/pcc/
packages/models/src/pcc/fixtures/
```

Only touch models if a narrow read-model/fixture field is missing and the change is additive.

## Implementation Requirements

- Add item detail drawer/panel or equivalent progressive-disclosure component.
- Show exact source text separately from normalized title.
- Show owner persona, reviewer persona, due date, status, criticality, risk tags, evidence policy, evidence status, source family, source section, and external reference posture.
- Show missing evidence/readiness blockers as display-only signals.
- Show safety failed-state posture without compliance claims.
- Show closeout-from-day-one posture and future closeout exposure.
- Show degraded/source-unavailable/missing-config state when envelope/source status requires it.
- Keep all actions inert/disabled.

Tests must cover:

- detail panel renders source traceability;
- evidence posture is display-only;
- failed safety item does not imply Safety runtime;
- source-unavailable/degraded states render product-safe copy;
- actions have no executable handler or href;
- no forbidden runtime imports.


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
git diff --check
md5 pnpm-lock.yaml
```

## Commit

Summary:

```text
feat(spfx-pcc): add lifecycle readiness item detail states
```

Body:

```text
Enhances the Wave 9 Project Lifecycle Readiness Center with item-level source traceability, evidence posture, ownership, reviewer, due-date, criticality, risk, exception, external-reference, safety failed-state, closeout exposure, and degraded-state rendering. Keeps all controls inert and read-only.

No document upload/storage, live Graph/PnP, SharePoint REST, Procore, Sage, Outlook, safety runtime, approval execution, notification, writeback, package, lockfile, manifest, workflow, deployment, tenant, or production changes are introduced.
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
