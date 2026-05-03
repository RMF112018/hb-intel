# PCC Backend Service Contract Design

Generated: 2026-04-28

## Objective

Define the future backend service boundaries and read-model concepts required by PCC, without implementing routes, services, DTOs, adapters, persistence, provisioning, repair, or tenant mutation.

## Backend Purpose

The future backend is the privileged service/control-plane boundary for PCC. It should normalize read models for the SPFx shell, enforce role gates, support approval/checkpoint workflows, preserve evidence/audit posture, and eventually execute approved technical operations only after Phase 2 gates close.

## Backend Non-Goals

The backend design must not authorize:

- implementation in this planning step;
- tenant mutation;
- provisioning executor work;
- automated repair execution;
- Procore runtime implementation;
- Procore secrets;
- Procore mirror/write-back;
- direct SPFx-to-Procore paths.

## Conceptual Route Families

These are conceptual only, not committed API contracts.

| Conceptual Route                                 | Purpose                                                           |
| ------------------------------------------------ | ----------------------------------------------------------------- |
| `/api/pcc/projects/{projectId}/profile`          | Project identity, type, stage, status, contacts.                  |
| `/api/pcc/projects/{projectId}/modules`          | Work Center/module registry.                                      |
| `/api/pcc/projects/{projectId}/priority-actions` | Access, readiness, approval/checkpoint, external mapping prompts. |
| `/api/pcc/projects/{projectId}/readiness`        | Readiness status and blockers.                                    |
| `/api/pcc/projects/{projectId}/responsibilities` | My Responsibilities and workflow assignments.                     |
| `/api/pcc/projects/{projectId}/workflows`        | Structured workflow module summaries.                             |
| `/api/pcc/projects/{projectId}/workflow-items`   | Item-level workflow records.                                      |
| `/api/pcc/projects/{projectId}/approvals`        | Approval/checkpoint records and status.                           |
| `/api/pcc/projects/{projectId}/team-access`      | Access requests and approval tracking.                            |
| `/api/pcc/projects/{projectId}/document-control` | File source registry / launch data.                               |
| `/api/pcc/projects/{projectId}/external-links`   | External system launch links.                                     |
| `/api/pcc/projects/{projectId}/site-health`      | Site Health status and repair request visibility.                 |
| `/api/pcc/projects/{projectId}/settings`         | Business-facing settings, role-filtered.                          |
| `/api/admin/pcc/site-health/repair-requests`     | Admin repair request review.                                      |
| `/api/admin/pcc/provisioning/preview`            | Future provisioning preview; blocked until gates.                 |
| `/api/admin/pcc/provisioning/evidence`           | Future evidence/proof review; blocked until gates.                |
| `/api/admin/pcc/provisioning/approve`            | Future approval checkpoint; blocked until gates.                  |

## Read Model Concepts

### Project Profile

Fields:

- projectId;
- accounting project number;
- project name;
- project type;
- project stage;
- project status;
- project executive;
- project manager;
- superintendent;
- project accountant;
- estimator/lead estimator references;
- external system launch availability;
- archive/read-only status.

### Work Center Registry

Eight primary work centers:

1. Project Home
2. Team & Access
3. Documents / Document Control
4. Project Readiness
5. Approvals / Checkpoints
6. External Systems
7. Control Center Settings
8. Site Health

### Priority Actions

MVP action categories:

- access requests;
- readiness blockers;
- approval/checkpoint prompts;
- external-system mapping prompts.

### Workflow Module Summary

MVP modules:

- Job Startup Checklist;
- Permit Log;
- Responsibility Matrix;
- Constraints Log;
- Buyout Log.

Later modules:

- Estimating Kickoff;
- Post-Bid Autopsy;
- Job Closeout Checklist.

### Workflow Item

Recommended conceptual fields:

- itemId;
- moduleId;
- title;
- description;
- owner;
- dueDate;
- status;
- comments;
- attachments/references;
- reviewer;
- approvalDecision;
- escalation;
- history;
- sourceTemplateReference.

### Team & Access

MVP service posture:

- request;
- approval/rejection/comment;
- status tracking;
- future backend-controlled execution.

No SPFx direct permission mutation.

### Document Control Center

MVP service posture:

- two-lane architecture;
- Microsoft Files Lane: SharePoint Drive / SharePoint document libraries and OneDrive as future Microsoft Graph-backed file-management;
- External Document Systems Lane: Procore Files, Document Crunch, Adobe Sign, and future systems as access/deep-link/visibility;
- permission-aware links and source-of-record labeling;
- access issue prompt.

Wave 2 preview boundary:

- Microsoft lane actions are disabled/preview-only;
- external lane remains launch/deep-link/missing-config/access-issue only;
- no live Graph/PnP/API calls, no upload/download/copy-link execution, no approval execution, no permission mutation, no external runtime/SDK/secrets, and no sync/mirror/write-back/mutation.

### External Links

Systems:

- SharePoint
- OneDrive
- Procore
- Sage
- Microsoft Teams
- Compass
- Document Crunch
- Cupix

MVP behavior:

- launch links only.

### Site Health

MVP service posture:

- project-visible health;
- warnings/drift indicators;
- owner/resolution guidance;
- repair request submission;
- IT/Admin execution only.

## Auth / Role Gate Assumptions

| Capability                   |                 PM |  PX |         Superintendent |             Accountant |       Estimating Users |      Executive Read-Only |          IT/Admin |
| ---------------------------- | -----------------: | --: | ---------------------: | ---------------------: | ---------------------: | -----------------------: | ----------------: |
| View Project Home            |                Yes | Yes |                    Yes |                    Yes |                    Yes |                      Yes |               Yes |
| View Document Control Center |                Yes | Yes |                    Yes |                    Yes |                    Yes |                      Yes |               Yes |
| Submit access request        |                Yes | Yes |                    Yes |                    Yes |                    Yes |        No / request-only |               Yes |
| Approve business checkpoints | Yes where assigned | Yes | Limited where assigned | Limited where assigned | Limited where assigned |                       No | Yes for technical |
| Edit business settings       |                Yes | Yes |          No by default |          No by default |          No by default |                       No |               Yes |
| Edit technical settings      |                 No |  No |                     No |                     No |                     No |                       No |               Yes |
| Submit repair request        |                Yes | Yes |                    Yes |                    Yes |                    Yes | View/escalate if allowed |               Yes |
| Execute repair               |                 No |  No |                     No |                     No |                     No |                       No |               Yes |
| Run provisioning             |                 No |  No |                     No |                     No |                     No |                       No |      Future-gated |

## Evidence and Audit

### Business Audit Trail

Applies to workflow modules and approval actions:

- status changes;
- owner changes;
- due-date changes;
- comments;
- reviewer actions;
- approval decisions.

### Compliance / Technical Evidence

Reserved for:

- provisioning;
- Site Health validation;
- drift;
- repair;
- access execution;
- technical settings;
- admin-control-plane actions.

## Phase 2 Dependencies

| Dependency                        | Required For                                              |
| --------------------------------- | --------------------------------------------------------- |
| Stable dry-run proof artifact     | Admin preview/evidence APIs.                              |
| Mutation/executor boundary        | Provisioning/apply and automated access/repair execution. |
| Post-provision validation posture | Site Health read model and drift behavior.                |
| Approved manifest interface       | Backend read model normalization.                         |
| Phase 2 closeout                  | Any implementation that touches execution.                |

## Backend Implementation Gate

Before implementation:

- Prompt 06 gate review must authorize backend work;
- route namespace must be finalized;
- DTO/model placement must be finalized;
- auth/role model must be approved;
- storage/source strategy must be approved;
- tenant mutation must remain gated;
- Procore runtime must remain launch-only unless separately approved.

---

# Backend Implementation Wave Allocation

The backend service contract should be implemented incrementally after the implementation gate authorizes backend work.

| Wave | Backend Responsibility                                                     |
| ---: | -------------------------------------------------------------------------- |
|    1 | Shared model contracts, status enums, role definitions, fixture data.      |
|    3 | Backend read-model foundation and conceptual route families.               |
|    5 | Priority action aggregation read model.                                    |
|    6 | Team & Access request/approval read/update model; no permission execution. |
|    7 | Document Control Center file-source/launch read model.                     |
|    8 | Workflow module framework and item-level model.                            |
| 9–13 | Module-specific workflow read/update models.                               |
|   14 | Approval/checkpoint model and authority validation.                        |
|   15 | External Systems launch-link read model.                                   |
|   16 | Settings read/update model with role gates.                                |
|   17 | Site Health read model and repair-request intake; no repair execution.     |
|   18 | Executive read-only shaping / summary read model.                          |
|   19 | Admin review queues.                                                       |
|   20 | Tests, guards, evidence posture, and non-production readiness validation.  |

## Backend Implementation Guardrails

Backend waves must preserve:

- no provisioning executor unless a later gate explicitly authorizes it;
- no tenant mutation during read-model and workflow scaffolding;
- no automated SharePoint/Teams access execution in Team & Access MVP;
- no automated Site Health repair;
- no Procore runtime, secrets, mirror, or write-back;
- no backend re-derivation of provisioning plans outside approved Phase 2 artifacts;
- clear separation between business audit trail and compliance/technical evidence.

## Unified Lifecycle Doctrine Alignment (2026-05-03)

Backend contracts align to unified lifecycle doctrine and must preserve:

- source-of-record boundaries,
- source lineage for derived signals,
- readiness rollup semantics without ownership reassignment,
- permission-aware retrieval posture for future memory/traceability/search/HBI layers.

Doctrine references:

- [`../Unified_PCC_Lifecycle_Objective_Architecture.md`](../Unified_PCC_Lifecycle_Objective_Architecture.md)
- [`../PCC_Project_Lifecycle_Spine.md`](../PCC_Project_Lifecycle_Spine.md)
- [`../PCC_Project_Memory_Layer.md`](../PCC_Project_Memory_Layer.md)
- [`../PCC_Cross_Stage_Traceability_Model.md`](../PCC_Cross_Stage_Traceability_Model.md)
- [`../PCC_Unified_Search_And_HBI_Grounding_Model.md`](../PCC_Unified_Search_And_HBI_Grounding_Model.md)

Wave 12 baseline correction:

- Wave 12 Constraints Log has shared model contracts, backend read-model/provider route, and SPFx read-model client seam.
- Remaining implementation gap is end-user UI/surface integration into Project Readiness and/or the applicable PCC shell route/navigation pattern.
