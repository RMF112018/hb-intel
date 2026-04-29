# Prompt 09 — PCC Site Health / Drift Read Model, Gated Implementation

## Objective

Create the initial Site Health and drift-status read model for PCC only if Phase 2 Step 6 and the Phase 3 Implementation Gate Review explicitly authorize it.

This prompt is blocked by default.

## Required Gate

Before starting, verify:

- Phase 3 Implementation Gate Review exists.
- Gate decision authorizes Site Health/drift read-model implementation.
- Phase 2 Step 6 has clarified post-provision validation posture.
- Drift categories and evidence fields are stable enough for read-only consumption.
- Repair execution remains blocked unless separately authorized.

If any item fails, stop and produce a blocked closeout.

## Required Repo Sources

Audit:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/Phase_3_Implementation_Gate_Review.md
docs/architecture/blueprint/sp-project-control-center/phase-3/PCC_Admin_Workflow_Readiness_Model.md
docs/architecture/blueprint/sp-project-control-center/phase-3/PCC_Backend_Service_Contract_Design.md
packages/project-site-template/**
packages/project-site-provisioning/**
backend/functions/**
docs/reference/sharepoint/**
```

Search for:

```text
site health
drift
repair
post-provision validation
validation
evidence
audit
readiness
health record
```

## Allowed Files

Allowed files must be determined by the gate review.

Potential future targets:

```text
backend/functions/**
apps/project-control-center/**
packages/**
```

Only if explicitly authorized.

## Forbidden Scope

- automated repair
- tenant mutation
- provisioning executor
- Graph/PnP live mutation
- Procore runtime
- deployment workflows
- production rollout

## Required Implementation Constraints

If authorized:

- Implement read-only Site Health/drift status surfaces only.
- Do not execute repair.
- Do not mutate tenant resources.
- Include clear user/operator distinction.
- Include stale/unknown/error states.
- Preserve evidence/audit traceability.
- Ensure SPFx surfaces consume read APIs only.
- Keep repair requests conceptual or disabled unless explicitly authorized.

## Required Closeout Documentation

Create:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/Prompt_09_Site_Health_Drift_Read_Model_Closeout.md
```

Include:

- Gate evidence
- Files changed
- What was implemented
- What remains blocked
- Validation commands
- No repair/mutation confirmation
- Recommended next prompt

## Validation

Run appropriate commands based on touched files.

At minimum:

```bash
git status --short
```

If code changed, run package/app/backend typecheck and tests as appropriate.

Do not run tenant, deployment, Graph/PnP, or production commands.

## Required Final Response

Return only:

```text
Commit summary
Commit description
Validation results
Gate evidence
Recommended next prompt
```

## Recommended Commit Summary

```text
feat(pcc): scaffold site health drift read models
```

## Recommended Commit Description

```text
Manifest: SharePoint Project Control Center

Version: <fill version posture based on repo policy>

Adds gated read-only Site Health and drift-status model support for PCC after Phase 2 validation posture stabilized. Does not implement repair execution, tenant mutation, provisioning executor behavior, or production rollout.

Validation:
- <fill exact commands and results>

Gate evidence:
- <cite Phase 3 Implementation Gate Review decision>

No tenant mutation. No automated repair. No provisioning executor. No Procore runtime.
```
