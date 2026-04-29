# Prompt 05 — Wave 1 External System and Site Health Types

## Objective

Define shared PCC external system, launch-link, Document Control source, Site Health summary, Site Health severity, missing configuration, and repair request types.

Do not implement external system runtime, sync, mirror, write-back, or repair execution.

## Context

The Project Control Center Phase 3 implementation plan is organized into waves. Wave 1 is the **PCC Shared Foundations** wave.

Wave 1 exists to prepare implementation-neutral shared model contracts, registries, fixture patterns, feature/module flags, and no-mutation guardrails for all later PCC waves.

Wave 1 must not implement shell UI, backend routes, live APIs, tenant execution, Graph/PnP calls, Procore runtime, workflow screens, access execution, Site Health repair execution, production rollout, app catalog deployment, or CI/CD deployment changes.

The repo audit found that the requested exact Phase 3 planning directory was not present on `main` during package generation. You must re-check this before proceeding.


## Repo-Truth Files to Inspect

Inspect:

```text
packages/models/src/pcc/**
docs/architecture/blueprint/sp-project-control-center/README.md
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md
docs/architecture/blueprint/sp-project-control-center/procore_hbintel_data_model_package/**
packages/project-site-provisioning/src/guards/no-mutation-guard.ts
packages/project-site-provisioning/README.md
backend/functions/README.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-1/Wave_1_Scope_Lock.md
```

## Files Allowed to Modify

If code is authorized:

```text
packages/models/src/pcc/external-systems.ts
packages/models/src/pcc/document-control.ts
packages/models/src/pcc/site-health.ts
packages/models/src/pcc/repair-requests.ts
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

Do not add Procore SDKs, HTTP clients, secrets, sync logic, mirrors, or write-back fields.

## Required Implementation or Documentation Work

Define at minimum:

1. External system identifiers:
   - `sharepoint`
   - `onedrive`
   - `procore`
   - `sage-intacct`
   - `teams`
   - `compass`
   - `document-crunch`
   - `cupix`
   - include `adobe-sign` and `outlook` only if repo truth confirms they remain part of the active external-system catalog.
2. Launch-link model:
   - display label
   - system ID
   - URL
   - configured/missing state
   - opens-in-new-window flag
   - optional project context fields
3. Missing configuration state model:
   - system ID
   - severity
   - required before
   - message
   - owner persona/role
4. Document Control Center source model:
   - SharePoint Drive
   - OneDrive
   - Procore files as launch/deep-link only
   - no document-control management workflow behavior
5. Site Health summary model:
   - project ID
   - overall severity
   - checks
   - latest check timestamp
   - drift indicators
   - repair request availability
6. Site Health severity model.
7. Repair request type definitions:
   - request, triage status, owner, severity, evidence summary
   - IT/Admin execution owner
   - no automatic repair execution
8. Tests proving:
   - no secret-like keys are included;
   - no Procore mirror/write-back/sync runtime fields are introduced;
   - all external system IDs are deterministic.

## Required Guardrails

- External Systems MVP behavior is launch links only.
- No sync.
- No mirror.
- No write-back.
- No direct SPFx-to-Procore path.
- No Procore secrets or tokens.
- No repair execution or automatic tenant mutation.
- Site Health may define visibility and request models only.

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
feat(models): add PCC external system and site health types
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

Adds shared PCC external system, launch-link, Document Control source, Site Health, severity, and repair request model types only.

```
