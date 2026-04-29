# PCC Admin Workflow Readiness Model

Generated: 2026-04-28

## Objective

Define the future admin/control-plane workflows, approval gates, Site Health repair request flow, and readiness model required by PCC.

This is planning-only. It does not authorize backend implementation, provisioning, repair execution, tenant mutation, Graph/PnP calls, or production rollout.

## Admin / Control-Plane Purpose

The admin/control-plane model ensures that technical and tenant-affecting actions are safe, evidence-backed, role-gated, and not performed directly by SPFx or normal project users.

## Operator Personas

| Persona | Role |
|---|---|
| IT / Control Center Admin | Technical settings, access execution, repair execution, provisioning operations after gates. |
| HB Intel Architecture Reviewer | Architecture/governance review of workflows and implementation gates. |
| Project Control Center Admin | Product/admin ownership of PCC configuration and user enablement. |
| Project Executive | Business readiness and escalation approval. |
| Project Manager | Business-facing settings, workflow/checkpoint approval within authority. |
| Security / Compliance Reviewer | Review sensitive access, audit, repair, production readiness. |
| Support / Helpdesk | Intake, triage, user support, non-technical repair coordination. |

## Workflow Overview

| Workflow | MVP Position |
|---|---|
| Access request | User request + approval tracking; execution later/backend-gated. |
| Readiness blocker | User resolves or routes to responsible party. |
| Approval/checkpoint | PM/PX/IT/Admin approval by checkpoint type. |
| External-system mapping issue | User flags issue; IT/Admin or responsible owner resolves. |
| Site Health repair request | Project user submits; IT/Admin reviews/executes later. |
| Provisioning preview | Future admin-only; blocked until Phase 2 proof gates. |
| Non-production apply | Blocked until Phase 2 closeout and explicit authorization. |
| Production rollout | Production-blocked. |

## Access Request Workflow

| Step | Description |
|---|---|
| Trigger | User needs access added, removed, or adjusted. |
| Actor | Any primary user, subject to role and project context. |
| Input | User, requested access, reason, urgency, target system/scope. |
| Review | PM/PX/IT/Admin depending on request type. |
| Approval | Approve, reject, comment, request info. |
| Execution | Manual or external in MVP; automated backend execution later. |
| Audit | Business audit trail for request/approval; technical evidence for execution later. |

## Readiness Blocker Workflow

| Step | Description |
|---|---|
| Trigger | Missing setup/configuration/workflow item appears. |
| Actor | Assigned owner or authorized PM/PX/Admin. |
| Input | Blocker type, required action, due date, related module. |
| Action | Resolve, defer, comment, reassign, escalate. |
| Audit | Business audit trail. |
| Execution Boundary | No tenant mutation unless future-gated. |

## Approval / Checkpoint Workflow

| Checkpoint Type | Approval Authority |
|---|---|
| Technical/provisioning | IT/Admin |
| Access/security | IT/Admin with PM/PX business approval where needed |
| Project/business readiness | PM/PX |
| Workflow item review | Assigned reviewer |
| Executive escalation | PX or Executive Oversight where assigned |

## External-System Mapping Issue Workflow

MVP behavior:

- user sees missing/broken launch issue;
- user flags issue;
- responsible owner resolves outside or through later admin tool;
- no sync/mirror/write-back.

## Site Health Repair Request Workflow

| Step | Description |
|---|---|
| Trigger | User sees warning/drift/health issue. |
| Actor | Project user submits request. |
| Review | IT/Admin reviews and classifies. |
| Resolution | IT/Admin resolves manually or through future backend repair. |
| Execution | Gated; never executed by project user or SPFx. |
| Evidence | Technical evidence required for repair execution later. |

## Drift Severity Model

| Severity | Description | User Visibility | Repair Authority | Approval Required |
|---|---|---|---|---|
| Informational | No immediate impact. | Visible as info. | IT/Admin | No |
| Warning | Possible issue or stale config. | Visible. | IT/Admin | Maybe |
| Degraded | Functionality impaired. | Visible with owner. | IT/Admin | Yes for repair |
| Blocked | Required PCC/project function blocked. | Visible as blocker. | IT/Admin | Yes |
| Critical | Major system/project access failure. | Visible/escalated. | IT/Admin/Security | Yes |
| Emergency | Severe outage/security issue. | Controlled escalation. | IT/Admin/Security | Emergency process |

## Control Center Settings Authority

| Setting Type | PM | PX | IT/Admin |
|---|---:|---:|---:|
| Business-facing project settings | Yes | Yes | Yes |
| Module display/configuration | Limited | Limited | Yes |
| External launch links | Request/edit if authorized | Request/edit if authorized | Yes |
| Technical/provisioning settings | No | No | Yes |
| Permissions/security settings | No | No | Yes |
| Site Health repair settings | No | No | Yes |

## Readiness Gate Matrix

| Gate | Required Evidence | Owner | Blocks |
|---|---|---|---|
| Product architecture approved | Human decisions captured | Product / Operations | SPFx design |
| UI doctrine mapped | Shell design + scorecard target | SPFx / UI Doctrine | SPFx implementation |
| Backend service design approved | Route/read-model concepts | Backend / Architecture | Backend implementation |
| Manifest validation stable | Phase 2 artifact | Provisioning | Backend/SPFx binding |
| Dry-run proof stable | Phase 2 Step 4 | Provisioning / Backend | Evidence workflow |
| Mutation gate stable | Phase 2 Step 5/6 | Provisioning / Backend | Executor work |
| Post-provision validation stable | Phase 2 Step 6 | Provisioning / Backend | Site Health implementation |
| Non-production target selected | Target/site documented | IT | Non-production rollout |
| Repair runbook approved | Process and authority documented | IT / Security | Repair execution |
| Production approval | Non-prod evidence + support/security approval | IT / Leadership | Production rollout |

## Production Gate

Production remains blocked until:

- non-production proof is complete;
- operator approval is documented;
- support/rollback model exists;
- security review is complete;
- Phase 2 closeout is complete;
- SPFx/backend implementation has passed validation;
- production target inventory and change window are approved.

---

# Admin / Control-Plane Implementation Wave Allocation

Admin and control-plane capabilities are delivered through gated review surfaces first, not through automated technical execution.

| Wave | Admin / Control-Plane Scope |
|---:|---|
| 0 | Confirm implementation gate and blocked execution boundaries. |
| 6 | Access request review and approval visibility. |
| 14 | Approval/checkpoint queue and authority validation. |
| 16 | Technical versus business setting separation. |
| 17 | Site Health repair request intake and review posture. |
| 19 | Consolidated admin review surfaces for access, approvals, repair requests, external mapping issues, and technical settings. |
| 20 | Validation, no-mutation tests, admin documentation, and non-production readiness posture. |

## Admin Implementation Rule

Admin surfaces may review, approve, reject, comment, assign, escalate, and track. They must not execute provisioning, tenant mutation, automated repair, or Procore runtime behavior unless a later gate explicitly authorizes that work.
