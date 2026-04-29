# Prompt 05 — PCC Admin / Workflow / Readiness Model

## Objective

Create a documentation-only admin/control-plane workflow and readiness model for future Project Control Center provisioning preview, proof review, approval checkpoints, non-production readiness, Site Health escalation, drift classification, and repair-request workflow.

Do not implement backend, SPFx, provisioning, tenant mutation, durable stores, APIs, scripts, or deployment changes.

## Context

Phase 3 can define admin and operator workflows now as planning, but executable provisioning, repair, and tenant mutation remain blocked until Phase 2 dry-run/proof/mutation and validation gates are stable.

The repo already contains admin control-plane patterns that should guide future PCC planning, but this prompt must not alter those implementations.

## Primary Question

What admin/operator workflow must exist before PCC provisioning, evidence review, Site Health, drift, repair, and rollout can be safely implemented?

## Required Repo Sources

Audit:

```text
docs/architecture/blueprint/sp-project-control-center/**
docs/architecture/blueprint/sp-project-control-center/phase-3/**
backend/functions/README.md
backend/functions/**
docs/architecture/plans/MASTER/spfx/admin/**
docs/architecture/plans/MASTER/backend/**
docs/reference/developer/verification-commands.md
packages/project-site-provisioning/**
packages/project-site-template/**
```

Search for:

```text
admin control plane
runs
checkpoint
approval
preview
dry-run
evidence
audit
observability
readiness
health ready
repair
drift
provisioning
non-production
production gate
operator
support model
rollback
```

## Allowed Files

Create documentation only:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/PCC_Admin_Workflow_Readiness_Model.md
```

Optional:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/PCC_Readiness_Gate_Matrix.md
```

## Forbidden Files

Do not modify:

```text
backend/**
apps/**
packages/**
tools/**
.github/**
scripts/**
infra/**
package.json
pnpm-lock.yaml
tsconfig.base.json
turbo.json
deployment workflows
tenant/provisioning scripts
```

## Required Deliverable — `PCC_Admin_Workflow_Readiness_Model.md`

Include:

1. Objective
2. Sources audited
3. Admin/control-plane purpose
4. Non-goals
5. Operator personas
6. Workflow overview
7. Provisioning preview workflow
8. Dry-run proof review workflow
9. Human approval checkpoint workflow
10. Non-production apply readiness workflow
11. Evidence review workflow
12. Site Health escalation workflow
13. Drift classification model
14. Repair request model
15. Rollback and support posture
16. Production gate model
17. Role/auth assumptions
18. Phase 2 dependency map
19. Readiness gate matrix
20. Open decisions
21. Risks
22. Recommended next prompt

## Required Operator Personas

Include:

- IT Admin / Control Plane Operator
- HB Intel Architecture reviewer
- Project Control Center Admin
- Project Executive
- Project Manager
- Security / Compliance reviewer
- Support / Helpdesk reviewer

## Required Workflow Models

For each workflow include:

- trigger
- actor
- input
- system checks
- approval/checkpoint
- output
- evidence captured
- failure state
- blocked dependencies

## Required Drift Classification Model

Include at least:

```markdown
| Severity | Description | Example | User Visibility | Repair Authority | Approval Required |
|---|---|---|---|---|---|
```

Suggested categories:

- informational
- warning
- degraded
- blocked
- critical
- emergency

## Required Readiness Gate Matrix

Include:

```markdown
| Gate | Required Evidence | Owner | Blocks | Current Status |
|---|---|---|---|---|
```

Cover:

- manifest validation
- deterministic planned hash
- secret scan
- Procore mirror scan
- dry-run proof artifact
- human approval
- non-production target
- executor boundary
- post-provision validation
- Site Health record
- drift detection
- repair posture
- rollback/support posture
- production approval

## Required Guardrails

Preserve:

- no tenant mutation without approved manifest, dry-run proof, and human checkpoint
- no production rollout from planning docs
- no SPFx direct provisioning
- no direct SPFx-to-Procore
- no Procore secrets, mirror, or write-back
- no normal-user native SharePoint admin dependency
- backend is future privileged execution boundary only after gates close

## Validation

Run:

```bash
git status --short
```

If documentation-only:

```text
No build/typecheck required because no code changed.
```

If implementation files are modified accidentally, revert them and re-run status.

## Required Final Response

Return only:

```text
Commit summary
Commit description
Validation results
Open decisions
Recommended next prompt
```

## Recommended Commit Summary

```text
docs(pcc): define phase 3 admin workflow readiness model
```

## Recommended Commit Description

```text
Manifest: SharePoint Project Control Center

Version: no package, backend, or SPFx version change; documentation-only Phase 3 admin/workflow planning step.

Adds the PCC Admin Workflow Readiness Model under docs/architecture/blueprint/sp-project-control-center/phase-3/. Defines future operator workflows for provisioning preview, dry-run proof review, human approval checkpoints, non-production readiness, evidence review, Site Health escalation, drift classification, repair requests, rollback/support posture, and production gating.

Preserves all Phase 2 and Phase 3 execution boundaries:
- no tenant mutation;
- no backend executor;
- no SPFx implementation;
- no Graph/PnP calls;
- no Procore runtime, secrets, mirror, or write-back.

Validation:
- git status --short
- documentation-only; no build/typecheck required because no code changed
```
