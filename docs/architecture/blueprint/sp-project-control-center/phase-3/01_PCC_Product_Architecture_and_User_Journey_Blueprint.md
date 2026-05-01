# PCC Product Architecture and User Journey Blueprint

Generated: 2026-04-28

## Objective

Define the Project Control Center (PCC) MVP product architecture, user journey model, work center structure, functional workflow modules, and operating principles based on the Phase 3 planning interview.

This is a planning deliverable only. It does not authorize SPFx implementation, backend implementation, provisioning executor work, tenant mutation, Graph/PnP live calls, Procore runtime implementation, production rollout, package version changes, or deployment changes.

## Governing Decisions

| ID    | Decision                               | Final Direction                                                                                                                                                                                                                                                                                                                                                                                                              |
| ----- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-001 | PCC MVP scope                          | Option C: Project Home + governed navigation hub + light operational workflows.                                                                                                                                                                                                                                                                                                                                              |
| D-002 | Primary MVP users                      | Project Executive, Project Manager, Project Accountant, Superintendent, Estimating Coordinator, Lead Estimator, Estimator, Executive Oversight / Global Read-Only. IT / Control Center Admin is required MVP support/admin.                                                                                                                                                                                                  |
| D-003 | Primary journey priority               | 1. PM, 2. PX, 3. Superintendent, 4. Project Accountant, 5. Lead Estimator / Estimator / Estimating Coordinator, 6. Executive Oversight / Global Read-Only.                                                                                                                                                                                                                                                                   |
| D-004 | Project Home layout                    | Hybrid: project identity/current status/site health at top, immediately followed by Priority Actions Rail.                                                                                                                                                                                                                                                                                                                   |
| D-005 | Priority Actions Rail categories       | Access requests, readiness blockers, approval/checkpoint prompts, external-system mapping prompts.                                                                                                                                                                                                                                                                                                                           |
| D-006 | Light operational workflows            | Request access change, resolve readiness blocker, submit approval/checkpoint response, resolve external-system mapping issue.                                                                                                                                                                                                                                                                                                |
| D-007 | Work Center Navigation                 | Keep eight primary work centers: Project Home, Team & Access, Documents / Document Control, Project Readiness, Approvals / Checkpoints, External Systems, Control Center Settings, Site Health.                                                                                                                                                                                                                              |
| D-008 | Functional module treatment            | Target structured in-app workflows over time, not template launch only. Template launch/reference is an interim fallback only.                                                                                                                                                                                                                                                                                               |
| D-009 | MVP structured workflow modules        | Job Startup Checklist, Permit Log, Responsibility Matrix, Constraints Log, Buyout Log.                                                                                                                                                                                                                                                                                                                                       |
| D-010 | Later-phase workflow modules           | Estimating Kickoff, Post-Bid Autopsy, Job Closeout Checklist.                                                                                                                                                                                                                                                                                                                                                                |
| D-011 | Responsibility Matrix scope            | Merge Owner Contract Responsibility Matrix into the single Responsibility Matrix module.                                                                                                                                                                                                                                                                                                                                     |
| D-012 | HB Document Control Center             | Three-lane HB Document Control Center: Project Record (formal SharePoint record), My Project Files (project-scoped OneDrive working files), and External Systems (Procore/Document Crunch/Adobe Sign launch/deep-link/visibility). Not a standalone submittal/transmittal/revision-routing/review-routing workflow engine. |
| D-013 | External Systems                       | SharePoint, OneDrive, Procore, Sage, Microsoft Teams, Compass, Document Crunch, Cupix.                                                                                                                                                                                                                                                                                                                                       |
| D-014 | External Systems MVP behavior          | Launch/deep-link/visibility in Wave 7; no writeback/sync/mirror in MVP.                                                                                                                                                                                                                                                                                                                                                  |
| D-015 | Team & Access                          | Request + approval + automated execution later. MVP plans full lifecycle; automation remains gated.                                                                                                                                                                                                                                                                                                                          |
| D-016 | Site Health                            | Project-user visibility + repair request workflow; IT/Admin controls repair execution.                                                                                                                                                                                                                                                                                                                                       |
| D-017 | Control Center Settings authority      | IT/Admin + Project Executive + Project Manager; PM/PX edit approved business-facing settings; IT/Admin controls technical settings.                                                                                                                                                                                                                                                                                          |
| D-018 | Approvals / Checkpoints authority      | IT/Admin + Project Executive + Project Manager, with authority by checkpoint type.                                                                                                                                                                                                                                                                                                                                           |
| D-019 | Structured workflow detail             | Item-level status tracking.                                                                                                                                                                                                                                                                                                                                                                                                  |
| D-020 | Workflow auditability                  | Business audit trail for MVP; compliance-grade evidence for technical/provisioning/admin actions.                                                                                                                                                                                                                                                                                                                            |
| D-021 | Executive Oversight / Global Read-Only | Executive summary view with governed drill-in and Document Control Center access.                                                                                                                                                                                                                                                                                                                                            |
| D-022 | Estimating / Preconstruction MVP       | Hybrid: turnover visibility and access in MVP; structured Estimating Kickoff and Post-Bid Autopsy later.                                                                                                                                                                                                                                                                                                                     |
| D-023 | Deliverable scope                      | Required deliverables plus supporting registers.                                                                                                                                                                                                                                                                                                                                                                             |

## Product Definition

The PCC MVP is a governed project operating surface that combines:

1. **Project Home / Command Center** — the daily landing page for project status, priorities, and readiness.
2. **Governed Work Center Navigation** — structured navigation into the core project work centers.
3. **Light Operational Workflows** — guided actions for access, readiness, approvals/checkpoints, and external-system mapping issues.
4. **Structured Workflow Module Direction** — in-app item-level workflow planning for selected high-value project controls.
5. **Three-Lane HB Document Control Center** — Project Record, My Project Files, and External Systems.
6. **External System Launch Hub** — launch links to the project’s external systems.

The PCC is not a replacement for Procore, Sage, Compass, Document Crunch, Cupix, Teams, Outlook, SharePoint file storage, or native accounting/project-management systems. It is the governed access, coordination, readiness, and project-control layer around those systems.

## MVP Operating Principles

| Principle                     | Meaning                                                                                                                                             |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project-first                 | PCC starts with a project context, not an application menu.                                                                                         |
| Role-aware                    | PM, PX, Superintendent, Project Accountant, Estimating users, and Executive Oversight see different emphasis based on role.                         |
| Actionable but safe           | Users can request, approve, and resolve business-facing items, but unsafe technical execution remains gated.                                        |
| Document control boundary     | HB Document Control Center uses a three-lane architecture and a backend-controlled source registry; it is not a standalone submittal/transmittal/revision-routing/review-routing workflow engine. |
| Structured workflow direction | Key spreadsheet/checklist processes become item-level workflows over time.                                                                          |
| Launch before sync            | External systems are launch-link MVP integrations only.                                                                                             |
| Admin boundary                | IT/Admin controls technical/provisioning settings and repair execution.                                                                             |
| Planning-only until gated     | Phase 3 deliverables do not implement source code or tenant changes.                                                                                |

## Primary Personas

| Persona                                |           MVP Priority | Primary Need                                                                                     |
| -------------------------------------- | ---------------------: | ------------------------------------------------------------------------------------------------ |
| Project Manager                        |                Primary | Daily command, project readiness, actions, settings, workflows, coordination.                    |
| Project Executive                      |                Primary | Oversight, readiness, risk, escalation, approvals, project health.                               |
| Superintendent                         |                Primary | Field-facing access to status, documents, readiness, permits, constraints, and project blockers. |
| Project Accountant                     |                Primary | Access to project setup, financial/admin documents, buyout visibility, records, approvals.       |
| Estimating Coordinator                 |                Primary | Turnover visibility, estimating/preconstruction records, handoff context.                        |
| Lead Estimator                         |                Primary | Estimate/bid context, turnover status, preconstruction record access.                            |
| Estimator                              |                Primary | Estimating/preconstruction record access and turnover visibility.                                |
| Executive Oversight / Global Read-Only |                Primary | Executive summary, risk/readiness visibility, governed drill-in, Document Control Center access. |
| IT / Control Center Admin              | Required Support/Admin | Technical settings, provisioning, repair, access execution, support, governance.                 |
| Safety / QAQC                          |              Secondary | Later refinement for safety/quality-specific modules and records.                                |
| Manager of Operational Excellence      |              Secondary | Process governance and workflow optimization.                                                    |

## Journey Priority Order

1. Project Manager
2. Project Executive
3. Superintendent
4. Project Accountant
5. Lead Estimator / Estimator / Estimating Coordinator
6. Executive Oversight / Global Read-Only

## Project Home / Command Center

The MVP Project Home uses a **hybrid layout**.

### Top Section

- Project name
- Project number
- Project status
- Project stage
- Project type
- current health indicator
- key readiness posture
- primary project contacts / responsible parties

### Immediately Below

Priority Actions Rail, limited to:

- access requests
- readiness blockers
- approval/checkpoint prompts
- external-system mapping prompts

### Supporting Zones

- My Responsibilities
- Work Center Navigation
- Project Readiness summary
- Site Health
- External Systems launch panel
- Document Control Center entry
- Control Center Settings entry

## Work Center Navigation

The MVP keeps eight primary work centers.

| Work Center                  | Purpose                                           | Included Functional Items                                                                                                                                                                                                                                |
| ---------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project Home                 | Daily command surface.                            | Identity, current status, health, Priority Actions, readiness rollup.                                                                                                                                                                                    |
| Team & Access                | Governed project access workflow.                 | Access requests, approval tracking, later backend execution.                                                                                                                                                                                             |
| Documents / Document Control | Three-lane architecture.                          | Project Record (formal SharePoint project record), My Project Files (project-scoped OneDrive working files with hard guardrail), External Systems (Procore/Document Crunch/Adobe Sign launch/deep-link/visibility). |
| Project Readiness            | Functional project controls and workflow modules. | Job Startup Checklist, Permit Log, Responsibility Matrix, Constraints Log, Buyout Log, later estimating/closeout modules.                                                                                                                                |
| Approvals / Checkpoints      | Governed decisions and approval prompts.          | Setup approvals, readiness approvals, access approvals, checkpoint responses.                                                                                                                                                                            |
| External Systems             | Launch hub.                                       | SharePoint, OneDrive, Procore, Sage, Teams, Compass, Document Crunch, Cupix.                                                                                                                                                                             |
| Control Center Settings      | Business and technical configuration.             | PM/PX business-facing settings; IT/Admin technical settings.                                                                                                                                                                                             |
| Site Health                  | Visibility into validation/drift/repair posture.  | Health status, warnings, repair requests, IT/Admin execution.                                                                                                                                                                                            |

## MVP Structured Workflow Modules

| Module                | Scope                                                                                        |
| --------------------- | -------------------------------------------------------------------------------------------- |
| Job Startup Checklist | Item-level startup workflow with owners, due dates, status, comments, history, review state. |
| Permit Log            | Item-level permit tracking workflow.                                                         |
| Responsibility Matrix | Item-level responsibility workflow including owner-contract responsibility mapping.          |
| Constraints Log       | Item-level constraints workflow.                                                             |
| Buyout Log            | Item-level procurement/project-control workflow.                                             |

## Later-Phase Workflow Modules

| Module                 | Later-Phase Intent                                       |
| ---------------------- | -------------------------------------------------------- |
| Estimating Kickoff     | Structured preconstruction workflow after MVP.           |
| Post-Bid Autopsy       | Structured post-bid learning/handoff workflow after MVP. |
| Job Closeout Checklist | Structured closeout workflow after MVP.                  |

## HB Document Control Center (Current Target Architecture)

Current target architecture for Wave 7 is a **three-lane model**:

- **Project Record**: formal project record in SharePoint project-site libraries.
- **My Project Files**: project-scoped OneDrive working files at `My Project Files > {ProjectNumber}-{ProjectName}`.
- **External Systems**: Procore, Document Crunch, Adobe Sign, and future approved systems as linked systems.

Hard guardrail: the project-site module must never expose the user’s full OneDrive `My Project Files` root or folders for other projects.

Wave 7 posture is backend-mediated source binding through a Project Document Source Registry. SPFx surfaces only project-approved bindings and role-allowed actions.

Permission model requirements (Wave 7 target):

- complete role list `R01`–`R23`;
- action code families `PR`, `MP`, `SB`, `EX`, `WF`;
- permission legend symbols and universal hard-no rules;
- use **Project Coordinator** terminology for document-control actor routing (not Project Engineer).

This section is planning/architecture only and does not assert runtime implementation completion.

## External Systems

The MVP external-system model is **launch links only**.

| System          | MVP Behavior                                                  |
| --------------- | ------------------------------------------------------------- |
| SharePoint      | Launch project site/document location.                        |
| OneDrive        | Launch linked project location where applicable.              |
| Procore         | Launch project record/files.                                  |
| Sage            | Launch relevant project/accounting context where available.   |
| Microsoft Teams | Launch project Team/channel.                                  |
| Compass         | Launch project/vendor/compliance context where available.     |
| Document Crunch | Launch project/legal/document review context where available. |
| Cupix           | Launch project reality-capture context where available.       |

No mapping health, synchronization, full mirror, write-back, or external context summary is required for MVP.

## Team & Access Journey

MVP target: **request + approval + automated execution later**.

| Stage     | MVP Position                                                                                  |
| --------- | --------------------------------------------------------------------------------------------- |
| Request   | User submits access change request.                                                           |
| Review    | Authorized PM/PX/IT/Admin reviews depending on request type.                                  |
| Approval  | Approval/rejection/comment tracked in PCC.                                                    |
| Execution | Manual or external in MVP; automated backend execution later after gates close.               |
| Audit     | Business audit trail for request/approval; compliance evidence for technical execution later. |

## Site Health Journey

MVP target: **project-user visibility + repair request workflow**.

| User Capability                  | MVP Position      |
| -------------------------------- | ----------------- |
| See health status                | Yes               |
| See warnings/drift indicators    | Yes               |
| Understand resolution owner      | Yes               |
| Submit repair/escalation request | Yes               |
| Execute repair                   | No; IT/Admin only |
| Automated repair                 | Later/gated       |

## Control Center Settings

| Role                      | Authority                                                                           |
| ------------------------- | ----------------------------------------------------------------------------------- |
| Project Manager           | Edit approved business-facing settings.                                             |
| Project Executive         | Edit approved business-facing settings.                                             |
| IT / Control Center Admin | Edit technical, provisioning, integration, permissions, and repair settings.        |
| Executive Oversight       | Read-only unless separately assigned.                                               |
| Estimating users          | Read/update only if specific business-facing setting is assigned to their workflow. |

## Approvals / Checkpoints

Approval authority is by checkpoint type.

| Checkpoint Type            | Primary Authority                                                                      |
| -------------------------- | -------------------------------------------------------------------------------------- |
| Technical/provisioning     | IT/Admin                                                                               |
| Access/security            | IT/Admin with business approval where appropriate                                      |
| Project/business readiness | Project Executive / Project Manager                                                    |
| Workflow item approval     | Owner/reviewer based on workflow type                                                  |
| Executive escalation       | Project Executive / Executive Oversight as read-only or escalated approver if assigned |

## Executive Oversight / Global Read-Only

MVP behavior:

- executive summary view;
- project status;
- risk/readiness posture;
- blockers;
- Site Health;
- key workflow status;
- governed drill-in;
- Document Control Center access;
- no workflow execution authority unless separately assigned.

## Estimating / Preconstruction

MVP behavior:

- estimating personas are primary users;
- MVP provides turnover visibility;
- MVP provides access to estimating/preconstruction records;
- structured Estimating Kickoff and Post-Bid Autopsy workflows are later-phase.

## User Journey Summaries

### Project Manager

- lands on Project Home;
- reviews Priority Actions;
- resolves readiness blockers;
- reviews workflow modules;
- approves business-facing checkpoints;
- manages project settings within authority;
- uses Document Control Center and External Systems.

### Project Executive

- reviews status, risk, readiness, health;
- reviews blockers and escalations;
- approves major business/readiness checkpoints;
- drills into workflows where needed;
- uses Document Control Center and external launch links.

### Superintendent

- reviews field-relevant readiness and blockers;
- accesses permits, constraints, documents, external systems;
- submits access or repair requests;
- updates assigned workflow items if authorized.

### Project Accountant

- reviews project setup/admin readiness;
- accesses buyout/project records;
- participates in workflow items and approvals where assigned;
- uses Document Control Center and Sage launch links.

### Estimating Users

- access turnover and preconstruction records;
- review estimate/bid context;
- support handoff continuity;
- later use structured Estimating Kickoff and Post-Bid Autopsy workflows.

### Executive Oversight / Global Read-Only

- reviews executive summary;
- drills into governed read-only project data;
- accesses Document Control Center;
- avoids operational workflow execution.

## Product Risks

| Risk                                                             | Mitigation                                                           |
| ---------------------------------------------------------------- | -------------------------------------------------------------------- |
| MVP over-expands into full workflow platform                     | Keep MVP modules limited and implementation gated.                   |
| Document Control scope drifts into standalone workflow execution | Preserve three-lane boundary and backend-controlled source-binding guardrails. |
| External Systems grow into integrations too early                | Launch links only for MVP.                                           |
| Item-level workflows require storage decisions                   | Capture as open implementation decision.                             |
| SPFx attempts unsafe execution                                   | Enforce backend-only technical execution boundary.                   |
| Phase 2 interface churn affects read models                      | Keep SPFx/backend assumptions non-binding until gate review.         |

## Recommended Next Deliverable

Proceed with the PCC SPFx Shell Design Spec using this product architecture as the governing product direction.

---

# Implementation Plan Alignment

The product architecture is implemented through the formal Phase 3 module implementation plan in `07_Phase_3_Module_Implementation_Plan.md`.

## Product-to-Wave Mapping

| Product Area                           | Implementation Wave |
| -------------------------------------- | ------------------: |
| Project Home / Command Center          |              Wave 4 |
| Priority Actions Rail                  |              Wave 5 |
| Team & Access                          |              Wave 6 |
| HB Document Control Center             |              Wave 7 |
| Project Readiness module framework     |              Wave 8 |
| Job Startup Checklist                  |              Wave 9 |
| Permit Log                             |             Wave 10 |
| Responsibility Matrix                  |             Wave 11 |
| Constraints Log                        |             Wave 12 |
| Buyout Log                             |             Wave 13 |
| Approvals / Checkpoints                |             Wave 14 |
| External Systems                       |             Wave 15 |
| Control Center Settings                |             Wave 16 |
| Site Health                            |             Wave 17 |
| Executive Oversight / Global Read-Only |             Wave 18 |
| Admin / Control Plane Review Surfaces  |             Wave 19 |
| Hardening and Non-Production Readiness |             Wave 20 |

## Product Implementation Rule

The product layer must not begin with individual workflow modules. The first implementation waves must establish the gate review, shared foundations, shell frame, and backend read-model foundation. This ensures that all modules use the same role model, status model, audit model, approval model, and backend read-model structure.
