# Prompt 03 — Wave 1 Role, Work Center, and Status Registries

## Objective

Define the shared PCC registries for personas, work centers, workflow modules, statuses, priority action categories, external systems, and role capabilities.

Do not implement UI or APIs.

## Context

The Project Control Center Phase 3 implementation plan is organized into waves. Wave 1 is the **PCC Shared Foundations** wave.

Wave 1 exists to prepare implementation-neutral shared model contracts, registries, fixture patterns, feature/module flags, and no-mutation guardrails for all later PCC waves.

Wave 1 must not implement shell UI, backend routes, live APIs, tenant execution, Graph/PnP calls, Procore runtime, workflow screens, access execution, Site Health repair execution, production rollout, app catalog deployment, or CI/CD deployment changes.

The repo audit found that the requested exact Phase 3 planning directory was not present on `main` during package generation. You must re-check this before proceeding.


## Repo-Truth Files to Inspect

Inspect:

```text
packages/models/src/pcc/**
packages/models/src/auth/ProjectRoles.ts
packages/models/src/auth/index.ts
packages/models/src/project/**
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-1/Wave_1_Scope_Lock.md
```

Also inspect any repo-confirmed Phase 3 register files if Prompt 01 found them.

## Files Allowed to Modify

If code is authorized:

```text
packages/models/src/pcc/roles.ts
packages/models/src/pcc/personas.ts
packages/models/src/pcc/work-centers.ts
packages/models/src/pcc/workflow-modules.ts
packages/models/src/pcc/statuses.ts
packages/models/src/pcc/priority-actions.ts
packages/models/src/pcc/capabilities.ts
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

Do not change existing `ProjectRole` values unless separately authorized.

## Required Implementation or Documentation Work

Define at minimum:

1. Primary MVP personas:
   - Estimating Coordinator
   - Lead Estimator
   - Project Executive
   - Project Manager
   - Superintendent / Field leadership where contract-supported
   - Project Accountant
   - Executive Oversight / Global Read-Only
2. Support/admin personas:
   - IT/Admin
   - Control Center Admin
   - Manager of Operational Excellence where contract-supported
3. Secondary personas:
   - Safety / QAQC
   - project team member
   - project viewer
4. Eight primary Wave 1/MVP work centers:
   - Project Home
   - Team & Access
   - Documents / Document Control
   - Project Readiness
   - Approvals / Checkpoints
   - External Systems
   - Control Center Settings
   - Site Health
5. MVP workflow module registry:
   - Job Startup Checklist
   - Permit Log
   - Responsibility Matrix, including owner-contract responsibility mapping
   - Constraints Log
   - Buyout Log
6. Later-phase workflow module registry:
   - Estimating Kickoff
   - Post-Bid Autopsy
   - Job Closeout Checklist
7. Workflow status registry.
8. Priority action category registry.
9. External system registry references.
10. Role capability matrix if repo-supported by the Prompt 01 scope lock.

Requirements:

- Use stable ID strings.
- Include display labels and descriptions.
- Include MVP/later/deferred/proof-gated posture where useful.
- Do not create UI navigation or route definitions.
- Do not consume unstable Phase 2 provisioning manifest exports.
- Keep registries deterministic and side-effect free.

## Required Guardrails

- No UI rendering.
- No app route wiring.
- No backend route or API.
- No live authorization logic.
- No tenant permission mutation.
- No Graph/PnP/Procore runtime.
- No changes to Phase 1/Phase 2 packages.

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
feat(models): add PCC role and work center registries
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

Adds deterministic PCC registries for personas, work centers, workflow modules, statuses, priority action categories, and role capabilities where authorized.

```
