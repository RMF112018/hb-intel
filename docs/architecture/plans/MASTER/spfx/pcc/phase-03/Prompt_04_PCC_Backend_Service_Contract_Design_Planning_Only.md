# Prompt 04 — PCC Backend / Service Contract Design, Planning Only

## Objective

Create a documentation-only backend/service contract design for the future Project Control Center (PCC) read models, readiness surfaces, Site Health views, admin workflow concepts, and manifest/proof consumption boundaries.

Do not implement backend routes, services, DTOs, adapters, persistence, tests, or configuration. This prompt is planning only.

## Context

Phase 3 can plan backend/service architecture while Phase 2 continues, but final API and DTO shapes depend on Phase 2 dry-run proof semantics, mutation/executor boundaries, and post-provision validation posture.

The existing `backend/functions/` control-plane patterns may guide the design, but no PCC backend implementation may begin in this step.

## Primary Question

What future backend service boundaries will PCC need, and what should remain blocked until Phase 2 proof/mutation/validation gates close?

## Required Repo Sources

Audit:

```text
backend/functions/README.md
backend/functions/**
docs/architecture/blueprint/sp-project-control-center/**
docs/architecture/blueprint/sp-project-control-center/phase-3/**
packages/project-site-template/**
packages/project-site-provisioning/**
packages/**
docs/reference/sharepoint/**
docs/reference/sharepoint/list-schemas/**
```

Search for:

```text
admin control plane
runs
preview
dry-run
evidence
audit
readiness
health ready
observability
adapter registry
service factory
withAuth
requireAdmin
requireDelegatedScope
SharePoint service
Graph service
provisioning
drift
repair
site health
Project Setup
```

## Allowed Files

Create documentation only:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/PCC_Backend_Service_Contract_Design.md
```

Optional:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/PCC_Interface_Assumptions_Register.md
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

## Required Deliverable — `PCC_Backend_Service_Contract_Design.md`

Include:

1. Objective
2. Sources audited
3. Backend purpose
4. Backend non-goals
5. Current backend patterns to reuse
6. Future route family concepts
7. Future read model concepts
8. Auth and role gate assumptions
9. Evidence/audit model concepts
10. Manifest/proof consumption boundary
11. Admin/control-plane interaction boundary
12. Site Health / drift / repair service concepts
13. Team & Access service concepts
14. Document Control service concepts
15. External system / Procore boundary
16. Phase 2 dependency map
17. Interface assumptions register
18. Open decisions
19. Risks
20. Implementation gate checklist
21. Recommended next prompt

## Required Future Route Family Concepts

Document concepts only. Do not implement.

At minimum include:

```text
/api/pcc/projects/{projectId}/profile
/api/pcc/projects/{projectId}/modules
/api/pcc/projects/{projectId}/readiness
/api/pcc/projects/{projectId}/site-health
/api/pcc/projects/{projectId}/actions
/api/pcc/projects/{projectId}/responsibilities
/api/pcc/projects/{projectId}/team-access
/api/pcc/projects/{projectId}/document-control
/api/pcc/projects/{projectId}/external-links
/api/admin/pcc/provisioning/preview
/api/admin/pcc/provisioning/evidence
/api/admin/pcc/provisioning/approve
/api/admin/pcc/site-health/repair-requests
```

Mark all as conceptual, not committed API contracts.

## Required Read Model Concepts

Include:

- Project Profile read model
- Module Registry read model
- Priority Actions read model
- Today / This Week read model
- Readiness rollup read model
- My Responsibilities read model
- Team & Access read model
- Document Control summary read model
- Site Health read model
- Drift summary read model
- External Links / Procore Mapping placeholder read model
- Manifest/proof summary read model

## Required Backend Boundary Rules

Preserve:

- Backend is the privileged control plane.
- SPFx may consume approved read APIs, not execute provisioning.
- Executor work waits for Phase 2 mutation gates.
- Backend consumes approved manifests only.
- Backend must not re-derive plans independently of approved manifest/proof artifacts.
- Tenant mutation requires human approval and evidence gates.
- Procore runtime remains out of scope unless separately approved.
- No Procore secrets in repo, SharePoint, SPFx, markdown, or client configuration.

## Required Interface Assumptions Register

Include:

```markdown
| Assumption ID | Interface / Concept | Assumption | Phase 2 Dependency | Risk | Resolution Gate |
|---|---|---|---|---|---|
```

## Required Open Decision Register

Include:

```markdown
| Decision ID | Decision Needed | Options | Interim Position | Required Before |
|---|---|---|---|---|
```

## Validation

Run:

```bash
git status --short
```

If documentation-only:

```text
No build/typecheck required because no code changed.
```

If backend/package/app/config files are modified accidentally, revert them and re-run status.

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
docs(pcc): design phase 3 backend service contract boundaries
```

## Recommended Commit Description

```text
Manifest: SharePoint Project Control Center

Version: no package or backend version change; documentation-only Phase 3 backend planning step.

Adds the PCC Backend Service Contract Design under docs/architecture/blueprint/sp-project-control-center/phase-3/. Defines future backend read-model, readiness, Site Health, Team & Access, Document Control, admin workflow, manifest/proof, and evidence/audit service concepts without implementing routes, DTOs, services, adapters, persistence, or executor behavior.

Preserves Phase 2 gates:
- backend executor waits for approved manifest/proof/mutation boundaries;
- no tenant mutation;
- no Graph/PnP calls;
- no Procore runtime, secrets, mirror, or write-back;
- SPFx remains read-consumer only.

Validation:
- git status --short
- documentation-only; no build/typecheck required because no code changed
```
