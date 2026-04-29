# Prompt 02 — Wave 1 Shared Model Contracts

## Objective

Implement or scaffold shared PCC model contracts in the repo-approved package location from Prompt 01.

If Prompt 01 did not explicitly authorize code changes, produce documentation-only contract stubs and stop.

## Context

The Project Control Center Phase 3 implementation plan is organized into waves. Wave 1 is the **PCC Shared Foundations** wave.

Wave 1 exists to prepare implementation-neutral shared model contracts, registries, fixture patterns, feature/module flags, and no-mutation guardrails for all later PCC waves.

Wave 1 must not implement shell UI, backend routes, live APIs, tenant execution, Graph/PnP calls, Procore runtime, workflow screens, access execution, Site Health repair execution, production rollout, app catalog deployment, or CI/CD deployment changes.

The repo audit found that the requested exact Phase 3 planning directory was not present on `main` during package generation. You must re-check this before proceeding.


## Repo-Truth Files to Inspect

Inspect:

```text
packages/models/package.json
packages/models/src/index.ts
packages/models/src/project/**
packages/models/src/auth/**
packages/models/src/audit/**
packages/models/tsconfig.json
packages/models/vitest.config.ts
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md
packages/project-site-template/README.md
packages/project-site-provisioning/README.md
```

Re-check the Wave 1 scope lock from Prompt 01.

## Files Allowed to Modify

If code is authorized:

```text
packages/models/src/pcc/**
packages/models/src/index.ts
packages/models/src/pcc/**/*.test.ts
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-1/**
```

If Prompt 01 selects a different approved path, use that path and document why.

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
package.json           # unless Prompt 01 explicitly requires it; no version bump
pnpm-workspace.yaml
turbo.json
tsconfig.base.json
```

Do not alter legacy project enums in `packages/models/src/project/ProjectEnums.ts` unless the scope lock explicitly authorizes it.

## Required Implementation or Documentation Work

Create implementation-neutral TypeScript models covering at minimum:

```text
ProjectProfile
PccProjectType
PccProjectStage
PccProjectStatus
PccUserRole
PccPersona
PccWorkCenter
PccWorkCenterId
PriorityAction
PriorityActionCategory
WorkflowModule
WorkflowModuleId
WorkflowItem
WorkflowItemStatus
WorkflowItemAssignment
BusinessAuditEvent
ApprovalCheckpoint
ExternalSystemLink
ExternalSystemId
DocumentControlSource
SiteHealthSummary
SiteHealthSeverity
PccSettingsScope
```

Requirements:

1. Use pure TypeScript types/interfaces/constants only.
2. Keep types safe for both SPFx and backend consumption.
3. Do not import SPFx, backend runtime, Graph, PnP, Azure SDK, Procore SDK, or tenant-specific code.
4. Keep PCC status/stage/type values aligned to the PCC contract.
5. Do not mutate or reinterpret existing legacy `ProjectStatus` values.
6. Add a PCC domain barrel, for example:

```text
packages/models/src/pcc/index.ts
```

7. Add basic type-level or runtime tests where useful to prevent regressions in the frozen enum values.
8. Document any intentionally deferred fields.

## Required Guardrails

- No UI.
- No API.
- No route handlers.
- No tenant calls.
- No provisioning executor.
- No Procore runtime.
- No secrets.
- No feature runtime.
- No package or manifest version bump.
- PCC models must be implementation-neutral and side-effect free.

## Required Validation Commands

Run:

```bash
git status --short
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/models build
```

If lint is relevant to touched files:

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
feat(models): add PCC shared model contracts
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

Adds implementation-neutral PCC shared model contracts under the repo-approved shared model boundary.

```
