# Prompt 04 — Wave 1 Workflow, Audit, and Approval Types

## Objective

Define shared PCC workflow, business audit, approval checkpoint, reviewer action, comment/history, and assignment types.

Do not implement workflow routes, SPFx forms, or persistence.

## Context

The Project Control Center Phase 3 implementation plan is organized into waves. Wave 1 is the **PCC Shared Foundations** wave.

Wave 1 exists to prepare implementation-neutral shared model contracts, registries, fixture patterns, feature/module flags, and no-mutation guardrails for all later PCC waves.

Wave 1 must not implement shell UI, backend routes, live APIs, tenant execution, Graph/PnP calls, Procore runtime, workflow screens, access execution, Site Health repair execution, production rollout, app catalog deployment, or CI/CD deployment changes.

The repo audit found that the requested exact Phase 3 planning directory was not present on `main` during package generation. You must re-check this before proceeding.


## Repo-Truth Files to Inspect

Inspect:

```text
packages/models/src/pcc/**
packages/models/src/audit/IAuditRecord.ts
packages/models/src/audit/index.ts
packages/models/src/admin-control-plane/**
backend/functions/README.md
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-1/Wave_1_Scope_Lock.md
```

## Files Allowed to Modify

If code is authorized:

```text
packages/models/src/pcc/workflow.ts
packages/models/src/pcc/audit.ts
packages/models/src/pcc/approvals.ts
packages/models/src/pcc/comments.ts
packages/models/src/pcc/assignments.ts
packages/models/src/pcc/index.ts
packages/models/src/pcc/**/*.test.ts
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-1/**
```

## Files Forbidden to Modify

Do not modify:

```text
apps/**
backend/functions/**
packages/project-site-template/**
packages/project-site-provisioning/**
packages/provisioning/**
tools/**
.github/**
dist/**
*.sppkg
```

Do not implement route handlers, data stores, API DTOs, SharePoint list mutations, or workflow UI.

## Required Implementation or Documentation Work

Define at minimum:

1. Workflow item transition types:
   - transition ID
   - workflow item ID
   - from status
   - to status
   - actor
   - reason/comment
   - timestamp
   - correlation ID
2. Business audit event types:
   - event ID
   - project ID
   - entity type
   - entity ID
   - event type
   - actor
   - timestamp
   - before/after summary
   - source module
   - correlation ID
3. Approval checkpoint types:
   - checkpoint ID
   - checkpoint type
   - authority type
   - required reviewer role/persona
   - status
   - requested by
   - requested at
   - decided by
   - decided at
4. Approval authority types:
   - IT/Admin authority
   - Project Executive authority
   - Project Manager authority
   - combined authority / checkpoint-specific authority
5. Reviewer action types:
   - approve
   - reject
   - request changes
   - delegate
   - cancel
6. Comment/history models.
7. Assignment models and assignment history.
8. Tests that lock critical status/action string values.

Requirements:

- You may reference existing generic audit concepts, but define PCC business audit models explicitly.
- Keep models storage-agnostic.
- Keep models safe for SPFx/backend import.
- Do not encode live authorization logic.
- Do not add API request/response routes.

## Required Guardrails

- No workflow route implementation.
- No SPFx forms.
- No SharePoint list writes.
- No access mutation.
- No Site Health repair execution.
- No backend persistence implementation.
- No Procore write-back or runtime.

## Required Validation Commands

Run:

```bash
git status --short
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/models build
```

If lint is relevant:

```bash
pnpm --filter @hbc/models lint
```

## Required Closeout Response Format

Return only the following sections:

```markdown
## Execution Summary
- ...

## Files Changed
- ...

## Validation
- Command: ...
  - Result: ...

## Guardrail Confirmation
- No PCC shell UI implemented: Confirmed / Not confirmed
- No backend route/API implemented: Confirmed / Not confirmed
- No provisioning executor or tenant mutation: Confirmed / Not confirmed
- No Graph/PnP live calls: Confirmed / Not confirmed
- No Procore runtime, secrets, mirror, or write-back: Confirmed / Not confirmed
- No package/SPFx manifest version bump: Confirmed / Not confirmed
- No CI/CD deployment change: Confirmed / Not confirmed

## Open Decisions / Follow-ups
- ...

## Recommended Commit Summary
...

## Recommended Commit Description
...
```


## Recommended Commit Summary

```text
feat(models): add PCC workflow audit and approval types
```

## Recommended Commit Description

```text
Manifest: SharePoint Project Control Center

Version: no package or SPFx version change unless explicitly authorized.

Preserves Phase 3 Wave 1 guardrails:
- no PCC shell implementation;
- no backend route/API implementation;
- no provisioning executor;
- no tenant mutation;
- no Graph/PnP live calls;
- no Procore runtime, secrets, mirror, or write-back;
- no direct SPFx-to-Procore path;
- no production rollout.

Adds shared PCC workflow transition, business audit, approval, reviewer action, comment/history, and assignment model types only.

```
