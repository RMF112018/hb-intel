# Prompt 01 — Wave 9 Gate, Repo-Truth Audit, and Wave 8 Dependency Verification

## Role

You are a local code agent working in `/Users/bobbyfetting/hb-intel`.

You are opening **PCC Phase 3 / Wave 9 — Project Lifecycle Readiness Center** implementation.

## Objective

Perform a comprehensive repo-truth gate before any Wave 9 source implementation. Verify that Wave 8 has implemented and closed the Project Readiness Module Framework or identify a blocking dependency gap. Verify current Wave 9 architecture, item-library source posture, and implementation authorization.

Do not implement source code in this prompt unless you are making a narrow documentation correction explicitly required to unblock later prompts.


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


## Files / Areas to Inspect

```text
docs/architecture/blueprint/sp-project-control-center/
docs/architecture/blueprint/sp-project-control-center/phase-3/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-09/
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-09/checklist-definition-files/
packages/models/src/pcc/
backend/functions/src/hosts/pcc-read-model/
apps/project-control-center/src/surfaces/projectReadiness/
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
apps/project-control-center/package.json
packages/models/package.json
backend/functions/package.json
```

## Required Checks

1. Confirm Wave 8 implementation/closeout status.
2. Confirm Wave 9 = Project Lifecycle Readiness Center.
3. Confirm canonical item library count: 157 total; startup 55; safety 32; closeout 70.
4. Confirm source files exist or document exact missing paths.
5. Confirm Wave 9 implementation scope is authorized by current blueprint docs.
6. Confirm no Wave 10–14 ownership is being mixed into Wave 9.
7. Confirm package names/scripts and likely validation commands.
8. Confirm if existing `project-readiness` surface is static, Wave 8-enhanced, or Wave 9-ready.

## Required Output Artifact

Create or update only if needed:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/Wave_9_Implementation_Gate.md
```

Include:

- repo-truth baseline;
- Wave 8 dependency status;
- Wave 9 source item-library status;
- authorized/blocked implementation posture;
- allowed file scope for Prompts 02–08;
- explicit no-runtime/no-mutation exclusions;
- validation commands for later prompts.

If Wave 8 is not implemented/closed, stop and write the gate as **BLOCKED**. Do not proceed to source prompts.


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
git diff --check
pnpm exec prettier --check docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/Wave_9_Implementation_Gate.md
md5 pnpm-lock.yaml
```

If no docs are changed, explain that no validation beyond repo inspection and lockfile MD5 was required.

## Commit

Commit only if you create/update the gate doc.

Summary:

```text
docs(pcc): open wave 9 lifecycle readiness implementation gate
```

Body:

```text
Opens the Phase 3 Wave 9 Project Lifecycle Readiness Center implementation gate. Documents repo-truth baseline, Wave 8 dependency status, canonical startup/safety/closeout item-library posture, implementation authorization, allowed scope, validation commands, and no-runtime/no-mutation guardrails.

No source code, backend route, SPFx runtime, package, lockfile, manifest, workflow, deployment, tenant, Graph/PnP, Procore, Sage, Outlook, approval execution, notification, or production changes are introduced.
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
