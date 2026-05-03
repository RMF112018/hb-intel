# PCC SPFx Shell Design Spec

Generated: 2026-04-28

## Objective

Define the future Project Control Center SPFx shell as a planning-only specification. This document describes the target UX structure, state model, breakpoint behavior, role-aware shell behavior, and acceptance criteria for implementation after Phase 2 gates close.

No SPFx source code is authorized by this document.

## Shell Purpose

The PCC shell is the project-site operating surface. It should let primary project users understand project status, act on priority items, navigate to governed work centers, access project files, launch external systems, and participate in approved light workflows without relying on native SharePoint administration.

## Shell Non-Goals

The shell must not:

- execute provisioning;
- mutate tenant resources;
- call Graph/PnP directly for mutation;
- call Procore directly;
- store secrets;
- replace Procore/Sage/Compass/Document Crunch/Cupix/Teams;
- replace SharePoint or OneDrive file storage;
- become a generic SharePoint card grid;
- require normal users to use native SharePoint settings.

## Shell Layout

The MVP shell uses a **hybrid Command Center layout**.

### Region 1 — Project Identity / Health Header

Purpose:

- establish project context;
- display project status/stage/type;
- show Site Health;
- show major readiness posture;
- expose role-aware project controls.

Content:

- project name;
- project number;
- project type;
- project stage;
- project status;
- Site Health badge;
- role indicator;
- primary contacts;
- settings shortcut based on role.

### Region 2 — Priority Actions Rail

Purpose:

- immediately surface the most actionable items.

MVP categories:

- access requests;
- readiness blockers;
- approval/checkpoint prompts;
- external-system mapping prompts.

Excluded from MVP rail:

- document-control prompts;
- Site Health escalations.

Those remain visible in their work centers or supporting panels.

### Region 3 — Work Center Navigation

Primary work centers:

1. Project Home
2. Team & Access
3. Documents / Document Control
4. Project Readiness
5. Approvals / Checkpoints
6. External Systems
7. Control Center Settings
8. Site Health

### Region 4 — My Responsibilities

Purpose:

- show role/person-specific workflow assignments;
- include due dates, status, and review needs;
- remain read-only or editable based on role and assignment.

### Region 5 — Project Readiness / Workflow Module Snapshot

MVP modules:

- Job Startup Checklist
- Permit Log
- Responsibility Matrix
- Constraints Log
- Buyout Log

Later modules:

- Estimating Kickoff
- Post-Bid Autopsy
- Job Closeout Checklist

### Region 6 — Document Control Center Entry

Purpose:

- preview the two-lane Document Control architecture:
- Microsoft Files Lane (SharePoint Drive / SharePoint document libraries + OneDrive) as disabled/preview-only file-management affordances in Wave 2;
- External Document Systems Lane (Procore Files, Document Crunch, Adobe Sign, future systems) as launch/deep-link/missing-config/access-issue states in Wave 2.

Behavior:

- render Microsoft lane preview actions (browse, open, upload, download, copy/share link, metadata, permission/access states, approval/status cues) as disabled/preview-only;
- render external lane launch/deep-link/missing-config/access-issue states;
- label source of record;
- respect permissions;
- provide access issue prompt;
- no standalone submittal workflow replacement;
- no transmittal/revision-routing replacement;
- no document review/routing workflow execution in Wave 2;
- no approval execution in Wave 2.

### Region 7 — External Systems Launcher

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

### Region 8 — Site Health Panel

Purpose:

- show health status;
- show warnings or drift indicators;
- indicate owner/resolution path;
- allow repair/escalation request;
- prevent direct repair execution by project users.

## Role-Aware Shell Behavior

| Role                                                | Shell Emphasis                                                                          |
| --------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Project Manager                                     | Priority Actions, readiness blockers, workflow modules, approvals, settings, documents. |
| Project Executive                                   | Status, readiness, risk, approvals, health, executive drill-in.                         |
| Superintendent                                      | Permits, constraints, documents, access requests, readiness items.                      |
| Project Accountant                                  | Buyout, project records, setup/readiness, Sage launch, documents.                       |
| Estimating Coordinator / Lead Estimator / Estimator | Turnover visibility, estimating records, preconstruction handoff.                       |
| Executive Oversight / Global Read-Only              | Executive summary, governed drill-in, Document Control Center access.                   |
| IT / Control Center Admin                           | Technical settings, repair requests, access execution, provisioning/health posture.     |

## State Model

| State                           | Required UX Behavior                                                                   |
| ------------------------------- | -------------------------------------------------------------------------------------- |
| Loading                         | Skeleton/placeholder layout preserving shell structure.                                |
| Empty project profile           | Explain missing setup and route authorized users to readiness/setup workflow.          |
| Partial configuration           | Show available regions and flag incomplete areas without breaking page.                |
| No access                       | Explain insufficient access and provide access request path if allowed.                |
| Read-only access                | Allow viewing and governed drill-in; hide or disable action controls.                  |
| Missing external launch link    | Show missing configuration prompt.                                                     |
| Backend unavailable             | Show resilient message, avoid blank page, preserve local/static navigation where safe. |
| Stale Site Health               | Show stale badge and last-known posture.                                               |
| Drift detected                  | Show warning and repair request path; do not execute repair.                           |
| Repair pending                  | Show request status and owner.                                                         |
| Archived project                | Switch to read-only archival posture.                                                  |
| Narrow viewport                 | Collapse navigation into mobile-appropriate structure without losing primary actions.  |
| High zoom / constrained section | Prioritize project identity, Priority Actions, and Work Center Navigation.             |

## Breakpoint Matrix

| Mode                    | Practical Usable Width | Layout Behavior                                 | Content Priority                         | Collapsed Content        | Acceptance Criteria          |
| ----------------------- | ---------------------: | ----------------------------------------------- | ---------------------------------------- | ------------------------ | ---------------------------- |
| Ultrawide desktop       |                1440px+ | Multi-column command surface                    | Header, actions, workflows, health       | None                     | Dense but not cluttered.     |
| Standard desktop        |            1024–1439px | 2-column content with full-width header/actions | Header, actions, work centers            | Secondary details        | No horizontal overflow.      |
| Tablet landscape        |             900–1023px | Reduced columns                                 | Header, actions, work centers, readiness | Details into accordions  | Touch-safe.                  |
| Tablet portrait         |              700–899px | Single-column with grouped cards                | Header, actions, nav                     | Supporting detail panels | No squeezed cards.           |
| Phone                   |                 <700px | Mobile stack                                    | Header, top actions, work centers        | Most details collapsed   | Clear primary action access. |
| Short height            |              any width | Compact vertical spacing                        | Header, actions                          | Long panels collapse     | No viewport trap.            |
| High zoom / constrained |               variable | Defensive single-column                         | Identity, actions, nav                   | Detail panels            | No right-edge overflow.      |

## Accessibility Requirements

- keyboard accessible work center navigation;
- visible focus states;
- no hover-only meaning;
- no color-only status indicators;
- text labels for status/action badges;
- touch-safe targets;
- reduced motion support;
- readable contrast;
- predictable tab order;
- accessible error/empty/blocked states.

## UI Doctrine Mapping

| Doctrine Requirement         | PCC Response                                                                                |
| ---------------------------- | ------------------------------------------------------------------------------------------- |
| Host-aware polish            | Layout must work inside SharePoint page canvas and constrained webpart widths.              |
| No fake shell duplication    | Do not recreate SharePoint chrome; provide product shell within content area.               |
| Premium authored composition | Shell should feel intentionally designed, not default card grid.                            |
| State completeness           | Loading, empty, access denied, stale, drift, backend unavailable, archived states required. |
| Role-aware experience        | Primary personas receive different emphasis without fragmenting product architecture.       |
| Accessibility                | Keyboard, touch, contrast, focus, motion, and status semantics required.                    |
| Benchmark-grade quality      | Target flagship-grade readiness before implementation acceptance.                           |

## Scorecard Target

Recommended target:

- **Flagship-grade: 48+/56**
- no hard-stop failures;
- no right-edge overflow;
- no generic-card-only implementation;
- no missing fallback states.

## Data / Read-Model Assumptions

The shell should eventually consume backend-normalized read models for:

- project profile;
- work centers/modules;
- priority actions;
- readiness blockers;
- workflow responsibilities;
- approvals/checkpoints;
- external launch links;
- Document Control Center sources;
- Site Health;
- settings permissions.

The shell should not consume unstable Phase 2 manifest exports directly unless a later gate explicitly authorizes it.

## Implementation Gate Checklist

Before SPFx implementation:

- Phase 3 Implementation Gate Review complete.
- Phase 2 proof/mutation/validation assumptions reconciled.
- Product architecture approved.
- Shell design approved.
- UI doctrine mapping approved.
- Read model/API assumptions resolved or mocked safely.
- App/package path confirmed.
- No direct provisioning execution.
- No direct Procore calls.
- No tenant mutation from SPFx.

---

# SPFx Implementation Wave Allocation

The SPFx shell work is divided across multiple waves rather than delivered as a single monolithic build.

| Wave | SPFx Responsibility                                                                             |
| ---: | ----------------------------------------------------------------------------------------------- |
|    2 | Shell frame, layout, role-aware wrapper, work center navigation, state model, responsive shell. |
|    4 | Project Home / Command Center UI.                                                               |
|    5 | Priority Actions Rail components and routing.                                                   |
|    6 | Team & Access request/approval UI.                                                              |
|    7 | Document Control Center two-lane UI (Microsoft Files Lane + External Document Systems Lane).    |
|    8 | Shared Project Readiness module UI framework.                                                   |
| 9–13 | Individual workflow module UIs.                                                                 |
|   14 | Approvals / Checkpoints UI.                                                                     |
|   15 | External Systems launch hub UI.                                                                 |
|   16 | Control Center Settings UI.                                                                     |
|   17 | Site Health visibility and repair request UI.                                                   |
|   18 | Executive Oversight / Global Read-Only summary and drill-in.                                    |
|   19 | Admin review surfaces, if hosted in SPFx.                                                       |
|   20 | Responsive, accessibility, doctrine, and hosted validation hardening.                           |

## SPFx Implementation Guardrails

During all SPFx waves:

- SPFx must consume backend-normalized read models or safe fixtures.
- SPFx must not execute provisioning.
- SPFx must not perform tenant mutation.
- SPFx must not call Graph/PnP directly for mutation.
- SPFx must not call Procore directly.
- SPFx must not expose Procore secrets.
- SPFx must preserve read-only behavior for Executive Oversight / Global Read-Only.
- SPFx must include complete loading, empty, partial, access-denied, backend-unavailable, stale, drift, and archived states.

## Unified Lifecycle Doctrine Alignment (2026-05-03)

SPFx shell must enforce one unified PCC project context with role/stage/task lenses over shared project truth. Shell surface navigation must not be treated as departmental workspace segmentation.

Doctrine references:

- [`../Unified_PCC_Lifecycle_Objective_Architecture.md`](../Unified_PCC_Lifecycle_Objective_Architecture.md)
- [`../PCC_Role_And_Stage_Lens_Model.md`](../PCC_Role_And_Stage_Lens_Model.md)
- [`../PCC_Project_Memory_Layer.md`](../PCC_Project_Memory_Layer.md)

Wave 12 clarification:

- Backend Constraints Log read-model route/provider exists at `HEAD 9f67df78...`.
- Shell/surface integration completeness remains subject to SPFx wave implementation and should not be inferred from backend existence alone.
