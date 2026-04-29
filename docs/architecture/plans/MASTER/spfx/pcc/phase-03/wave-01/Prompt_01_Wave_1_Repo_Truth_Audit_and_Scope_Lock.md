# Prompt 01 — Wave 1 Repo Truth Audit and Scope Lock

## Objective

Re-audit the relevant repo files, confirm whether Wave 1 code implementation is authorized, lock exact Wave 1 file/package locations, and document the Wave 1 allowed/forbidden scope.

This prompt must not implement code.

## Context

The Project Control Center Phase 3 implementation plan is organized into waves. Wave 1 is the **PCC Shared Foundations** wave.

Wave 1 exists to prepare implementation-neutral shared model contracts, registries, fixture patterns, feature/module flags, and no-mutation guardrails for all later PCC waves.

Wave 1 must not implement shell UI, backend routes, live APIs, tenant execution, Graph/PnP calls, Procore runtime, workflow screens, access execution, Site Health repair execution, production rollout, app catalog deployment, or CI/CD deployment changes.

The repo audit found that the requested exact Phase 3 planning directory was not present on `main` during package generation. You must re-check this before proceeding.


## Repo-Truth Files to Inspect

Inspect at minimum:

```text
package.json
pnpm-workspace.yaml
turbo.json
tsconfig.base.json
docs/architecture/blueprint/sp-project-control-center/README.md
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md
docs/architecture/blueprint/sp-project-control-center/phase-0/**
docs/architecture/blueprint/sp-project-control-center/phase-1/**
docs/architecture/blueprint/sp-project-control-center/phase-2/**
docs/architecture/blueprint/sp-project-control-center/phase-3/**   # if present
packages/project-site-template/**
packages/project-site-provisioning/**
packages/models/**
backend/functions/README.md
backend/functions/package.json
docs/reference/ui-kit/doctrine/**
docs/reference/spfx-surfaces/**
docs/reference/sharepoint/**
```

Also run targeted searches for:

```text
PCC
Project Control Center
phase-3
Wave 1
Shared Foundations
ProjectProfile
PccUserRole
PccWorkCenter
PriorityAction
WorkflowModule
WorkflowItem
BusinessAuditEvent
ApprovalCheckpoint
ExternalSystemLink
SiteHealthSummary
Document Control Center
project-site-template
project-site-provisioning
manifest
dry-run
mutation
no mutation
provisioning
read model
role gate
admin
control plane
evidence
audit
readiness
site health
drift
repair
Procore
Sage
Compass
Document Crunch
Cupix
SharePoint
OneDrive
Teams
SPFx
ui-kit
fixture
mock
feature flag
```

## Files Allowed to Modify

Documentation only, after confirming the repo's preferred path:

Recommended path if no better repo path exists:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-1/
  Wave_1_Scope_Lock.md
  Wave_1_Repo_Truth_Audit.md
```

If the repo already has a Phase 3 planning path elsewhere, use the repo-confirmed path and document why.

## Files Forbidden to Modify

Do not modify:

```text
apps/**
backend/functions/**
packages/**
tools/**
infra/**
.github/**
dist/**
*.sppkg
package.json
pnpm-workspace.yaml
turbo.json
tsconfig.base.json
```

Do not bump versions or manifests.

## Required Implementation or Documentation Work

1. Confirm whether the exact requested Phase 3 planning files exist on the current branch.
2. If they do not exist, document the mismatch and identify the closest current repo-truth files.
3. Confirm whether Wave 1 code implementation is authorized now or whether Prompt 02–07 must remain documentation-only.
4. Confirm final shared model location:
   - recommended interim location: `packages/models/src/pcc/`;
   - alternative: new package only if the repo already proves that pattern is required;
   - app-local folders are disallowed unless explicitly justified.
5. Confirm final export strategy.
6. Confirm fixture location.
7. Confirm test strategy.
8. Confirm no-mutation guard strategy.
9. Confirm validation commands.
10. Confirm no Wave 2+ work will start.
11. Create/update a scope lock document and audit document.
12. Update the Open Decision Register if any decision remains unresolved.

## Required Guardrails

- No code implementation.
- No shell/backend/module/provisioning work.
- No tenant mutation.
- No package version bumps.
- Do not reinterpret or replace Phase 1/Phase 2 invariants.
- Preserve the PCC contract as the implementable source of truth.
- Clearly separate evidence from recommendations.
- State uncertainty explicitly.

## Required Validation Commands

Run:

```bash
git status --short
```

If documentation files are modified and repo formatting allows it:

```bash
pnpm format:check
```

Do not run build/test commands unless code files were changed, which this prompt should not do.

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
docs(pcc): lock phase 3 wave 1 scope
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

Adds the Wave 1 repo-truth audit and scope lock. No implementation code is introduced.

```
