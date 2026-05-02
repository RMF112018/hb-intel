# HB Project Control Center — Target Architecture Blueprint

**Status:** Target Architecture Draft  
**Audience:** Executive Leadership, Operations, IT, Project Executives, Project Managers, Accounting, Field Operations, Safety/QAQC, and platform implementation teams  
**Repository context:** `RMF112018/hb-intel`  
**Reference example documents:** `docs/reference/example/`  
**Prepared for:** Hedrick Brothers Construction

---

## 1. Executive Summary

The Project Control Center is the proposed standard operating surface for every construction project team site created in SharePoint. The goal is to replace inconsistent manual project-site creation, scattered project documents, and low SharePoint adoption with a governed, branded, application-like project workspace that employees open every day to manage project information, actions, responsibilities, access, documents, external system links, and project-specific workflows.

This blueprint assumes the company will continue using best-in-class construction platforms such as Procore, Sage Intacct, Compass, Document Crunch, Adobe Sign, and Cupix. The Project Control Center is not intended to replace those systems. It is intended to organize them around the project, provide a consistent project-specific SharePoint architecture, and expose the daily project workflows that currently live in Excel, PDFs, emails, disconnected file folders, or individual user habits.

**Procore is HB's primary project-management platform.** PCC is the SharePoint-hosted project operating surface that organizes access, current-state summaries, readiness checks, and project-level context around Procore. PCC must not become an uncontrolled duplicate of Procore.

> **Procore Architecture Decision.** Procore is the system of record for Procore-owned project-management workflows. PCC is the SharePoint-hosted project operating surface that summarizes, contextualizes, deep-links, and selectively materializes Procore data. PCC must not become a parallel Procore clone or a full SharePoint mirror of Procore transactional records.

The controlling local reference for Procore data modeling is the Procore HB Intel data model package at `docs/architecture/blueprint/sp-project-control-center/procore_hbintel_data_model_package/`. The dedicated Procore Integration Layer is documented in §36A.

The Project Control Center should be implemented as a full-page SPFx shell, similar in strategy to the existing `hb-intel-homepage` application pattern in the repo. The homepage precedent is host strategy only, not a dashboard layout to copy. Each project site should receive the same template, the same pages, the same libraries, the same baseline lists, the same permission model, and the same Project Control Center app surface. Project-specific configuration should be handled inside the Project Control Center UI, not through native SharePoint edit modes or manual site administration.

## 1A. Current Repo-Truth Status

Verified sources:

- `docs/architecture/blueprint/sp-project-control-center/phase-2/Phase_2_Closeout.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-1/Wave_1_Closeout.md`
- `packages/project-site-template/package.json` and `packages/project-site-template/README.md`
- `packages/project-site-provisioning/package.json` and `packages/project-site-provisioning/README.md`
- `packages/models/src/pcc/index.ts`
- `packages/models/src/pcc/PccMvpSurfaces.ts`
- `docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png` (present)

Current status:

- Phase 0 is complete (architecture stabilization and schema extraction planning closed).
- Phase 1 is complete (`@hbc/project-site-template` contract package exists and validation gate is closed).
- Phase 2 is complete (`@hbc/project-site-provisioning` headless no-mutation boundary package exists).
- Phase 3 Wave 1 is complete (PCC shared read-model foundations are shipped in `packages/models/src/pcc/`).
- Phase 3 Wave 2 is the active/current PCC SPFx shell-frame and UI/UX wave, with fixture-driven preview implementation in progress.
- `apps/project-control-center/` is the locked Wave 2 target location and scaffold exists in repo truth.

## 1B. Document Authority Split

- **Blueprint authority (this document):** architecture doctrine, product boundaries, module/system posture, and non-negotiable governance guardrails.
- **Roadmap authority:** implementation sequencing, current phase/wave execution status, and immediate execution priorities in [`Project_Control_Center_Development_Roadmap.md`](./Project_Control_Center_Development_Roadmap.md).
- **Implementation contract authority:** implementation-detail contract in [`Standard_Project_Site_Template_Contract.md`](./Standard_Project_Site_Template_Contract.md).
- **Canonical system-of-record authority:** field-level ownership boundaries in [`System_of_Record_Matrix.md`](./System_of_Record_Matrix.md).

## 1C. PCC / Procore / Sage System-of-Record Boundaries

PCC is the unified project operating layer and source-lineage layer. It may be the system of record for PCC-native legacy workflow replacements that are not generated or maintained in Procore.

Procore is the system of record for Procore-native records generated, owned, and maintained in Procore tools.

Sage Intacct remains the accounting book of record.

SharePoint/Microsoft 365 is the controlled document/collaboration substrate and hosting layer, but is not automatically the system of record for every process hosted in PCC.

For authoritative field-level ownership and conflict handling, use [`System_of_Record_Matrix.md`](./System_of_Record_Matrix.md).

---

## 2. Core Business Objective

Create symmetrical, governed SharePoint team sites for construction projects that:

- maintain least-privilege access control;
- separate project information by concern and lifecycle;
- reduce large-group access failures caused by sprawling synced libraries or manual permission drift;
- eliminate manual SharePoint site creation by project teams or SharePoint admins;
- make project sites useful enough that users open them daily;
- surface project-specific tasks, documents, responsibilities, risks, and external system links in one place;
- convert current project workflow artifacts into structured, searchable, auditable project data;
- support 3–10 new project sites per week without losing standardization or governance.

---

## 3. Architectural North Star

The Project Control Center should behave like a governed business application hosted on SharePoint.

SharePoint provides:

- secure site container;
- libraries;
- lists;
- metadata;
- permissions;
- pages;
- versioning;
- Microsoft 365 integration;
- Graph-accessible data substrate.

The Project Control Center provides:

- guided user experience;
- project command center;
- module navigation;
- role-aware task views;
- settings and configuration UI;
- team and access management;
- structured forms;
- workflow status;
- readiness gates;
- external system launchers;
- project intelligence;
- site health and drift detection.

Users should not need to understand SharePoint administration to successfully operate a project site.

---

## 4. Non-Negotiable UX and Governance Requirements

### 4.1 No Native SharePoint Edit Dependency

Normal project users should not need to use:

- SharePoint page **Edit** mode;
- web part property panes;
- list settings;
- library settings;
- content type settings;
- metadata column settings;
- manual view creation;
- SharePoint site permissions screens;
- advanced permissions;
- folder/item-level permission management;
- direct list-item editing except through governed app UI.

If a normal workflow requires a user to leave the Project Control Center and use native SharePoint settings, that workflow is not complete.

### 4.2 Surface-Managed Configuration

All configuration should be available through:

1. **Control Center Settings**  
   Centralized settings experience for project-level configuration.

2. **Module-Level Settings**  
   Feature-specific settings inside each module.

Settings should use guided forms, pickers, toggles, validation messages, warnings, role gates, and safe save flows. Users should see business language, not raw SharePoint implementation details.

### 4.3 Governed Team and Access Management

Team and access management must be handled inside the Project Control Center UI, similar in intent to Procore project access management.

Authorized users should be able to:

- add a user;
- search using the people picker foundation;
- select a project role;
- select a permission template;
- confirm access;
- trigger backend validation and group assignment;
- see success/failure in plain language;
- review project team membership;
- review external access;
- submit or approve access requests.

Users should not manually manage SharePoint groups, Entra groups, or library permissions.

---

## 5. Current Repo and Platform Context

### 5.0 Repo-Truth Foundation State

- `packages/project-site-template/` exists and is the machine-readable contract package for PCC template artifacts.
- `packages/project-site-provisioning/` exists and is the headless provisioning boundary package with no tenant mutation or live API execution.
- `packages/models/src/pcc/` exists and exports Wave 1 shared PCC vocabulary, fixtures, and navigation-surface identifiers.
- `apps/project-control-center/` is the locked Wave 2 shell target location and scaffold is present.

### 5.1 Existing Repo Foundations

The repo already contains several relevant architectural foundations:

- `apps/estimating/` — existing Project Setup / New Project Request surface.
- `apps/accounting/` — accounting/project finalization context.
- `apps/hb-homepage/` and/or `hb-intel-homepage` strategy — precedent for full-page SPFx host strategy only; not a Project Home layout model.
- `backend/functions/` — Azure Functions backend integration layer.
- SPFx/Vite packaging orchestration for multiple app domains.
- Existing Microsoft Graph token acquisition patterns through SPFx context.
- Existing UI kit and homepage shell design doctrine.
- Existing people-picker foundation referred to as `hb-people-picker`.
- Existing Azure/Entra application posture built around:
  - Registered Application: `HB SharePoint Creator`
  - Application ID: `08c399eb-a394-4087-b859-659d493f8dc7`
  - Function App: `hb-intel-function-app`
  - Function App domain: `hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net`

### 5.2 Current External Platforms

The target architecture should respect existing systems of record and provide project-aware integration/launch surfaces for:

- **Procore** — HB's primary project-management platform; first-class integration. Controlling local reference: `docs/architecture/blueprint/sp-project-control-center/procore_hbintel_data_model_package/`. Integration boundary: `backend/functions/` (future `backend/functions/src/services/procore/`). See §36A for the dedicated Procore Integration Layer.
- Sage Intacct — accounting book of record.
- Compass
- Document Crunch
- Adobe Sign
- Cupix
- Other project-specific platforms as needed

---

## 6. Project Site Provisioning Lifecycle

### 6.1 Intake and Approval Flow

```text
New Project Request
  └─ apps/estimating/
      ├─ Estimating Coordinator input
      ├─ Lead Estimator input
      ├─ Project Executive assignment
      └─ preliminary project metadata

Accounting Finalization
  └─ apps/accounting/
      ├─ official job number
      ├─ accounting setup
      ├─ Sage Intacct mapping
      ├─ project accountant assignment
      └─ final approval to provision

Provisioning Trigger
  └─ backend/functions/
      ├─ create SharePoint Team site
      ├─ apply template
      ├─ seed lists and libraries
      ├─ create/configure groups
      ├─ assign global read-only group
      ├─ seed Project Control Center records
      ├─ install/configure SPFx shell
      ├─ validate site health
      └─ write provisioning audit
```

### 6.2 Provisioning Principles

- Every project site starts from the same governed template.
- The template should be versioned.
- Provisioning should be repeatable and idempotent where possible.
- Post-provision validation is mandatory.
- Configuration records should be seeded automatically.
- Manual SharePoint admin work should be the exception, not the normal process.
- Project users should interact with business forms and settings, not raw SharePoint infrastructure.

### 6.3 Required Provisioning Outputs

Each project site should receive:

- standard libraries;
- standard lists;
- standard metadata;
- standard permissions;
- standard navigation;
- standard pages;
- Project Control Center landing page;
- Control Center Settings data;
- Team & Access configuration;
- module registry records;
- external system mapping placeholders;
- **Procore Mapping Placeholder Created** — Project Procore Mapping record + Sync Health placeholder + Procore Subject Area Registry seeded with `Enabled=false` for all six package subject areas (`financials`, `project_management`, `documents_design`, `quality_safety`, `field_execution`, `workflow`). See contract §15.13 and §20 stages 12A–12F.
- site health record;
- template version record;
- provisioning audit trail.

### 6.4 ProjectType, ProjectStage, and ProjectStatus

Three orthogonal fields govern lifecycle, vertical context, and operational state on Project Profile (contract §3.2 / §4B):

- **`ProjectType`** drives **vertical / construction context** — `commercial`, `multifamily`, `municipal`, `luxury_residential`, `environmental`. Frozen for MVP.
- **`ProjectStage`** drives **lifecycle and module visibility** — `lead`, `estimating`, `preconstruction`, `active_construction`, `closeout`, `warranty`. Frozen for MVP. Stages `lead` and `estimating` may exist in `apps/estimating/` and `apps/accounting/` workflows **before a PCC site is provisioned**; `preconstruction` straddles the provisioning event; `active_construction` / `closeout` / `warranty` always have a site.
- **`ProjectStatus`** drives **operational state** — `Active`, `On Hold`, `Closed`, `Archived`. **Archive is a `ProjectStatus` value, not a stage.**

Construction-vertical seeding rules key on `ProjectType`. Module visibility / workflow activation rules key on `ProjectStage`. Site read-only / archive rules key on `ProjectStatus`. See contract §4B.2 for the full conditional-seeding table.

---

## 7. Project Site Type and Information Architecture

### 7.1 Recommended Site Type

Use a SharePoint team site pattern suitable for project collaboration and Microsoft 365 integration. The site should be project-specific, least-privilege controlled, and provisioned with a standard template.

### 7.2 Recommended Project Site Naming

Recommended naming should be formalized during implementation, but the site URL should be stable, project-number based, and human-readable.

Example:

```text
/sites/projects-{projectNumberSlug}
```

or:

```text
/sites/p-{projectNumberSlug}-{shortProjectNameSlug}
```

Avoid names that change when a project name changes.

### 7.3 Required Project Metadata

Each project site should carry a Project Profile record with:

- Project ID
- Project Number
- Project Name
- Client / Owner
- Project Address
- Region
- Market Sector
- Delivery Method
- Contract Type
- Project Size Band
- Complexity Rating
- Project Phase
- Project Executive
- Project Manager
- Superintendent
- Project Accountant
- Estimating Coordinator
- Lead Estimator
- Safety / QAQC lead
- Start Date
- Substantial Completion Date
- Final Completion Date
- Template Version
- Provisioning Run ID
- Created Date
- Source Request ID
- External System Mapping Status

---

## 8. Full-Page Project Control Center Shell

### 8.1 Recommended Repo Target

```text
apps/project-control-center/
  Full-page SPFx shell for project team sites (locked Wave 2 target; scaffold present)

apps/document-control-center/
  Reusable document/file browser module

packages/project-site-template/
  Existing machine-readable template contract package

packages/project-site-provisioning/
  Existing headless no-mutation provisioning boundary package

backend/functions/
  Future runtime boundary for backend execution and integrations (outside Wave 2)
```

### 8.2 Shell Structure

```text
Project Control Center
├── Project Hero / Identity
├── Priority Actions Rail
├── Today / This Week
├── Readiness & Risk Rollups
├── My Responsibilities
├── Work Center Navigation
├── Embedded Modules
├── HBI Assistant
└── Control Center Settings
```

### 8.3 Design Intent

The home page should answer:

- What project am I in?
- What requires attention today?
- What changed recently?
- What is overdue?
- What do I own?
- Where are the documents?
- Which system should I open?
- Who has access?
- What is blocking startup, construction, closeout, or turnover?
- What project risks need escalation?

### 8.4 Phase 3 Wave 2 Shell Boundary

Includes:

- PCC shell-frame UI/UX in a dedicated `apps/project-control-center/` app target.
- Command-center header, application navigation rail, and flexible dashboard composition.
- Preview and fallback experiences sourced from `@hbc/models/pcc` fixtures.

Excludes:

- Backend API route implementation.
- Provisioning executor implementation.
- Tenant mutation or live Graph/PnP calls.
- Procore runtime/API clients, secrets, mirror, or write-back.
- Workflow execution and Site Health scanning/repair execution.
- App catalog deployment, production rollout, or CI/CD deployment changes.

### 8.5 Wave 2 UI/UX Basis-of-Design and Layout Lock

Governing visual reference:

- `docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png`

Wave 2 shell direction:

- dark navy/blue project-intelligence header;
- HB orange left application navigation rail;
- large project identity plus command/search zone;
- floating light operational cards;
- flexible bento/masonry-style dashboard layout with variable card heights and widths;
- responsive desktop/tablet/mobile adaptations.

Project Home must not reuse the `hb-intel-homepage` fixed paired-row composition when that model forces equal-height rows or whitespace waste.

The preferred Wave 2 implementation model is CSS Grid with measured row spans and predictable DOM/focus order.

```ts
type PccWidgetFootprint = 'hero' | 'wide' | 'standard' | 'compact' | 'tall' | 'full';
```

Wave 2 layout guardrails:

- prefer CSS Grid with measured row spans;
- do not use CSS columns as the primary layout path;
- do not ship uncontrolled drag/resizable dashboard behavior in Wave 2;
- do not create horizontal overflow or host-chrome conflicts.

---

## 9. Project Control Center Module Map

Module visibility is keyed on **`ProjectStage`** (lifecycle); vertical-flavored seeding within each module is keyed on **`ProjectType`**. Archive behavior is keyed on **`ProjectStatus = Archived`**. See §6.4 and contract §4B for the authoritative rules.

### 9.1 Core Modules

```text
Project Control Center
├── Project Home / Command Center
├── Team & Access Center
├── Document Control Center
├── Project Directory / Team Center
├── Action Center
├── Project Controls Center
├── Contract & Compliance Center
├── Drawing & Model Center
├── Field Operations Center
├── Meeting & Communication Center
├── Risk / Issues / Decision Log
├── Procurement & Buyout Center
├── Startup Center
├── Permit & AHJ Center
├── Inspection Readiness Center
├── Responsibility Matrix Center
├── Subcontractor Performance Center
├── Lessons Learned Center
├── Closeout & Warranty Center
├── HBI Assistant
└── Control Center Settings / Site Health
```

### 9.2 Relationship Between Original Architecture and Uploaded Examples

The original Project Control Center structure remains the governing architecture. The uploaded example documents add operating detail, list schemas, workflows, readiness gates, and module enhancements.

The uploaded documents are not a replacement for the original structure. They should be converted into structured modules inside the broader work centers.

---

## 10. Reference Example Documents

The following example documents are assumed to be stored in the repo at:

```text
docs/reference/example/
```

| Example Document                                       | Primary Architecture Use                                               |
| ------------------------------------------------------ | ---------------------------------------------------------------------- |
| `Project_Startup_Checklist(1).pdf`                     | Startup Center, Contract & Compliance, Field Operations, Action Center |
| `Project_Closeout_Checklist(1).pdf`                    | Closeout & Warranty Center, Document Control, Risk, Action Center      |
| `Permit_Log_Template.xlsx`                             | Permit & AHJ Center                                                    |
| `10b_20260220_RequiredInspectionsList(1).xlsx`         | Inspection Readiness Center                                            |
| `Responsibility Matrix - Template.xlsx`                | Responsibility Matrix Center, Team & Access, Action Center             |
| `Responsibility Matrix - Owner Contract Template.xlsx` | Contract & Obligation Center                                           |
| `06 20260307_SOP_SubScorecard-DRAFT(1).xlsx`           | Subcontractor Performance Center, Procurement & Buyout, Closeout       |
| `07 20260307_SOP_LessonsLearnedReport-DRAFT(1).xlsx`   | Lessons Learned Center, Best Practices, HBI knowledge base             |

---

## 11. Project Home / Command Center

### 11.1 Purpose

The Project Home is the daily landing surface for all project participants. It should be useful to project executives, PMs, supers, accounting, safety, QAQC, admins, and authorized leadership.

### 11.2 Recommended Home Cards

- Project Identity
- Priority Actions
- Today / This Week
- My Responsibilities
- Startup Readiness
- Permit Readiness
- Inspection Readiness
- Closeout Readiness
- Contract Obligation Status
- Subcontractor Evaluation Status
- Lessons Learned Capture Status
- Recent Documents
- Recent Decisions
- Open Risks / Issues
- External System Links
- Site Health

### 11.2A Wave 2 Project Home Shell Requirements

Wave 2 Project Home must present:

- a command-center header with project identity, phase/health/action pills, and command/search affordance;
- an HB orange application navigation rail (application navigation only, not duplicate SharePoint chrome);
- a floating card layer on a flexible bento/masonry grid with content-driven heights;
- internal tab/state navigation based on `PCC_MVP_SURFACE_IDS` from `packages/models/src/pcc/PccMvpSurfaces.ts`;
- fixture-driven preview from `@hbc/models/pcc` with no live backend data dependency.

Wave 2 shell must include states for:

- preview;
- empty;
- loading;
- error;
- missing-config;
- unavailable-fixture;
- unauthorized-persona.

### 11.3 Example Rollup

```text
Project Readiness
├── Startup: 82% complete / 4 blocked
├── Permits: 3 pending / 1 expiring
├── Inspections: 5 scheduled / 2 failed
├── Contract Obligations: 6 open / 1 high risk
├── Closeout: 18% complete / 9 future requirements
└── My Responsibilities: 7 assigned / 2 overdue
```

### 11.4 Wave 8 Framework vs Surface Naming

- Technical wave/framework name: **Project Readiness Module Framework**.
- User-facing module/surface name: **Project Readiness Center**.
- Wave 8 establishes readiness framework taxonomy and posture logic; it is not a standalone checklist page, static dashboard, or duplicate workflow engine.
- Wave 9–14 remain downstream module implementations that provide module-owned detail consumed by Wave 8 readiness normalization.
- Wave 8 documentation posture is non-runtime: no backend execution routes, persistence claims, approval execution claims, or external-system mutation claims are implied.

### 11.x Procore current-state cards (Recommended Practical tier)

When the relevant Procore subject areas are enabled (§36A.9), the Project Home dashboard surfaces Procore current-state cards alongside the readiness rollups above. All cards are read-only summaries with deep links to Procore; **no Procore writes from PCC** (§36A.13).

```text
Procore Current State (Recommended Practical)
├── Open RFIs                        (project_management)
├── Overdue RFIs                     (project_management)
├── Submittals Awaiting Action       (project_management)
├── Open Observations                (quality_safety)
├── Open Punch Items                 (quality_safety)
├── Daily Log Completion             (field_execution)
├── Recent Drawings / Specs          (documents_design)
├── Current Change Exposure          (financials)
├── Commitment / Buyout Status       (financials)
└── Procore Sync Health              (per §36A.10 ErrorCategory)
```

These cards are deferred from MVP per §36A.16; they appear when the corresponding Procore Subject Area is `Enabled=true`.

---

## 12. Team & Access Center

### 12.1 Purpose

Provide Procore-like project team and access management inside the Project Control Center.

### 12.2 Required UX

User flow:

```text
Add User
  ├─ search user with people picker
  ├─ select user
  ├─ select project role
  ├─ select permission template
  ├─ review access summary
  ├─ confirm
  ├─ backend validates actor authority
  ├─ backend applies group membership
  └─ audit record is written
```

### 12.3 Access Management Rules

#### Global Read-Only Access

A predefined Entra group receives read-only access to every project site automatically.

Examples:

- IT department
- Vice Presidents and above
- other executive/oversight/audit roles

This group is applied during provisioning.

#### Preconstruction / Estimating Access Managers

During preconstruction and estimating, the following assigned roles can invite users and apply approved permission templates:

- Estimating Coordinator
- Lead Estimator
- Project Executive

#### Construction Access Managers

During construction, the following assigned roles can invite users and apply approved permission templates:

- Project Executive
- Project Manager
- Manager of Operational Excellence

### 12.4 Permission Templates

Permission templates are business concepts mapped to SharePoint/Entra implementation details behind the scenes.

Recommended templates:

- Project Viewer / Read Only
- Project Team Member
- Project Management
- Field Operations
- Project Accounting
- Safety / QAQC
- Executive Oversight
- External Design Team
- Owner / Client Viewer
- Subcontractor Limited Access, if required
- Project Control Center Admin

Each template should define:

- display name;
- business description;
- mapped SharePoint group;
- mapped Entra group, if used;
- allowed modules;
- allowed libraries;
- external-user allowance;
- approval requirement;
- phase restrictions;
- assigner role restrictions;
- expiration defaults;
- audit requirements.

### 12.5 Data Lists

#### Project Access Configuration

- Project ID
- Site ID
- Site URL
- Project Phase
- Global Read-Only Group ID
- Template Version
- Default Permission Templates
- External Access Allowed
- Access Review Frequency
- Last Access Review Date

#### Project Team Assignments

- Project ID
- User Object ID
- UPN
- Display Name
- Email
- Company
- Project Role
- Permission Template
- Phase Added
- Added By
- Added Date
- Effective Date
- Expiration Date
- Status
- Notes

#### Project Access Audit

- Project ID
- Action Type
- Actor
- Target User / Group
- Permission Template
- Previous Value
- New Value
- Timestamp
- Result
- Failure Reason

#### Access Requests

- Project ID
- Requested User
- Requested By
- Requested Permission Template
- Business Justification
- Status
- Approved By
- Approved Date
- Rejected By
- Rejected Date
- Notes

---

## 13. Document Control Center

### 13.1 Purpose

Provide the **HB Document Control Center** as the project-site document-control module with three lanes: Project Record, My Project Files, and External Systems.

### 13.2 Lane Model (Current Target Architecture)

- **Project Record**: formal project record in SharePoint project-site document libraries.
- **My Project Files**: user-specific OneDrive working files under `My Project Files > {ProjectNumber}-{ProjectName}`.
- **External Systems**: Procore, Document Crunch, Adobe Sign, and future approved systems as launch/deep-link/visibility sources.

Hard guardrail: the project-site instance must never expose the user’s full OneDrive `My Project Files` root folder or other project folders.

### 13.3 Source Binding and Read-Model Posture

- Every project binds document sources through a backend-controlled **Project Document Source Registry**.
- SPFx must not hard-code or self-discover source links.
- Wave 7 uses backend-mediated read-model/API posture for source resolution, permission-aware actions, throttling/resilience states, and audit logging.
- `procoreProjectId` is part of the project-level metadata model for source binding and external-system context.

### 13.4 Integration With Other Modules

Checklist items, permit rows, inspection records, subcontractor scorecards, lessons learned entries, contract obligations, and closeout tasks should all support evidence links into project document libraries.

### 13.5 Graph and File-Action Posture

Phase 1 should use delegated permissions and signed-in user context. Candidate read-only Graph permissions should be validated before implementation, but the working model is:

- file access for user-accessible files;
- site/library access for configured project document libraries;
- no app-only tenant-wide file crawling;
- no persistence of temporary download URLs.

### 13.6 External-System Deep-Link Posture

When Procore `documents_design` and `project_management` subject areas are enabled (§36A.9), Document Control deep-links to Procore drawings, specifications, and document records rather than mirroring binaries. Posture:

- PCC deep-links to Procore drawings / specs / documents — full binary mirror is **prohibited**.
- Selective publish of approved PDFs / generated reports to SharePoint is allowed when business explicitly requires the deliverable in M365 (per package §10).
- Procore-derived records require lineage fields per §36A.11 (`SourceSystem`, `ProcoreObjectType`, `ProcoreObjectId`, `ProcoreObjectUrl`, `ProcoreLastSyncedAt`, etc.).
- Drawing / spec metadata may be summarized in PCC (current set, latest revision); the binary remains in Procore.

### 13.7 Role/Action Permission Model Requirements (Wave 7 Target)

Wave 7 target documentation must include:

- complete role list `R01`–`R23`;
- action code families `PR`, `MP`, `SB`, `EX`, `WF`;
- permission legend and universal hard-no rules;
- Project Coordinator naming for document-control routing roles (Project Engineer is legacy wording and not used for current target architecture).

The role/action matrix is architecture doctrine for Wave 7 planning and does not claim runtime authorization implementation is already complete.

---

## 14. Project Directory / Team Center

### 14.1 Purpose

Provide fast access to project contacts, responsibilities, companies, and role assignments.

### 14.2 Recommended Features

- Internal project team
- Owner contacts
- Architect/engineer contacts
- Consultants
- Subcontractors
- Project accountant
- Safety/QAQC contacts
- Emergency contacts
- Distribution groups
- “Who owns this?” lookup
- Contact by role
- Contact by company
- Contact by responsibility
- Role assignment history

### 14.3 Data Sources

- Project Team Assignments
- Project Companies
- Project Contacts
- Responsibility Matrix
- Access Configuration

---

## 15. Responsibility Matrix Center

### 15.1 Purpose

Convert the current responsibility-matrix workbooks into a governed, project-level, role-aware responsibility module with explicit assignment semantics.

This is not a static spreadsheet replacement only. It is a governed Responsibility Matrix Center that uses a two-axis model:

- contract-party classification axis (`Owner`, `Architect / Engineer`, `Contractor`);
- internal RACI assignment axis (`Responsible`, `Accountable`, `Consulted`, `Informed`).

Hard semantic separation applies: contract-party `C = Contractor` is not RACI `C = Consulted`.

### 15.2 Current Example Coverage

Seed source workbooks (repo-resident):

- `docs/reference/example/Responsibility Matrix - Template.xlsx` (sheets: `PM`, `Field`)
- `docs/reference/example/Responsibility Matrix - Owner Contract Template.xlsx` (sheet: `Template`)

Workbook-source counting posture used for governance planning:

- `109` is workbook-derived task-row posture context: 82 PM task-text rows plus 27 Field rows with assignment marks.
- Strict marked assignment rows total `98` (71 PM + 27 Field).
- Owner-contract workbook is placeholder/schema posture only in current source files; it does not contain populated obligation-description defaults.

Seed families:

- Owner Contract / GMP
- PM Operations
- Field Operations

The PM responsibility matrix includes responsibilities across:

- owner notices;
- contracts;
- prime contract change orders;
- subcontract change orders;
- subcontractor SOV review;
- change orders and invoices;
- invoice approvals;
- credit card and expense approvals;
- OCIP credits/enrollment;
- payment applications;
- release of funds;
- monthly financial reports;
- schedule updates;
- daily internal huddles;
- team collaboration;
- buyout tracking;
- subcontract SOWs;
- project roles for PX, Sr. PM, PM2, PM1, PA, QAQC, and Project Accountant.

The field responsibility matrix includes responsibilities across:

- overall job lead;
- monthly schedule updates;
- three-week lookaheads;
- subcontractor pay app review;
- site work;
- landscape;
- hardscape;
- utilities;
- courtyard and road work;
- MEP for units, amenities, exteriors, and courtyard;
- interiors through drywall and completion;
- exterior envelope;
- flooring;
- painting;
- trim-out;
- QAQC submittal and envelope review;
- superintendent-driven QAQC coordination.

### 15.3 Required Features

- Template-driven responsibility matrix
- Responsibility Template Library with governed template version references
- Project-instance responsibility records separated from template definitions
- Project-specific role assignment
- RACI-style view
- Two-axis assignment model (contract-party classification + internal RACI)
- Personal “My Responsibilities” view
- Role-based filtering
- Support role assignments
- Sign-off role assignments
- Recurring responsibility rules
- Handoff workflow when a staff member changes roles
- Assignment lifecycle history and current action owner / ball-in-court posture
- Workflow-step model and decision-rights overlay for decision-heavy responsibility items
- Contract clause / obligation reference model using article/page metadata as project-controls context
- Matrix Health Score posture and snapshot/export governance
- Integration into Action Center (planning/target-state; runtime delivery occurs in later phase implementation)
- Seed traceability metadata (`source workbook`, `source sheet`, `source row`, `seed family`, `seed version`)
- Governed edit authority for Admin, Project Executive, and Project Manager
- Governance-required normalization policy for legacy assignment markers (`X`, `Support`, `Review`, `Sign-Off`)

### 15.4 Data Lists

#### Project Responsibility Matrix

- Project ID
- Workstream
- Task / Responsibility
- Primary Role
- Primary Person
- Support Roles
- Support People
- Sign-Off Role
- Frequency
- Due Rule
- Related Module
- Related System
- Active
- Notes

#### Project Role Assignments

- Project ID
- Role
- Person
- Start Date
- End Date
- Responsibility Scope
- Backup Person
- Assignment Status

### 15.5 Scope and Guardrails

- Responsibility Matrix is a single unified Project Readiness module and is not split into separate spreadsheet launchers.
- Wave 8 owns Project Readiness framework seams; Wave 11 must not redefine framework ownership.
- Wave 14 owns approval/checkpoint execution authority; Wave 11 may request or reference approvals but does not execute approval runtime.
- Evidence links are reference posture only; HB Document Control Center and SharePoint project record remain evidence-binary owners.
- Team & Access remains owner of project roster/access state; Responsibility Matrix consumes resolved role/person context.
- This architecture is project-controls metadata posture only and is not legal advice.
- This architecture does not automatically create legal obligations and does not replace executed contracts.
- External-system writeback/mutation runtime is out of scope in this Wave 11 architecture definition.
- Wave 12 `Constraints Log` remains under Project Readiness with subtitle `Make-Ready Constraint & Risk Exposure Center`; governing posture distinguishes risk, constraint, issue, delay exposure, and change exposure for project-controls review only.
- Governing docs place Wave 12 in Project Readiness while current source-model mapping (`constraints-log`) to `risk-issues-decision` remains a tracked alignment item and is not changed in this prompt.
- Wave 12 embedded risk/exposure views do not replace claims handling, formal delay analysis, enterprise change-management systems, or enterprise risk systems.
- External-system posture for Wave 12 remains launcher/reference-only with no writeback/runtime mutation.

---

## 16. Action Center

### 16.1 Purpose

Aggregate all project work requiring attention into one role-aware task surface.

For Responsibility Matrix inputs, Action Center consumes governed responsibility outputs from the two-axis model. This is architecture and planning posture, not a claim that Phase 7 runtime behavior is already delivered.

### 16.2 Sources

- Startup tasks
- Permit tasks
- Inspection tasks
- Contract obligations
- Responsibility matrix recurring tasks
- Access requests
- Closeout tasks
- Subcontractor evaluations
- Lessons learned assignments
- Risk/issue follow-ups
- Meeting action items
- External system tasks where integrations support them

### 16.3 Features

- My Actions
- Team Actions
- Overdue
- Due This Week
- Awaiting Approval
- Blocked
- By Module
- By Responsible Role
- By Project Phase
- Escalation view for PX/PM
- Action audit trail

### 16.4 Data List

#### Project Action Items

- Project ID
- Action Source
- Source Record ID
- Title
- Description
- Assigned Role
- Assigned User
- Due Date
- Priority
- Status
- Related Module
- Related Document
- Related External System
- Created By
- Created Date
- Completed By
- Completed Date
- Escalation Status

### 16.5 Procore-derived actions and exceptions (Recommended Practical)

Action Center surfaces Procore-derived exceptions when the corresponding Procore subject areas are enabled (§36A.9). All entries are **summary / exception records** — they are not write-back records. Procore write-back is deferred (§36A.13).

- overdue RFIs (`project_management`)
- submittals awaiting action (`project_management`)
- open observations (`quality_safety`)
- failed inspections (`quality_safety`)
- open punch items (`quality_safety`)
- daily log missing for prior business day (`field_execution`)
- commitment / change-event exceptions (`financials`)

Each entry carries lineage fields per §36A.11 and a deep link back to the source Procore record.

---

## 17. Project Startup Center

### 17.1 Purpose

Convert the startup checklist into an operational project launch module.

### 17.2 Example Coverage

The startup checklist covers:

- owner contract review;
- split savings;
- contingency usage parameters;
- liquidated damages;
- allowances;
- bonding / SDI;
- accounting setup;
- Procore setup;
- estimating turnover;
- budget roll from estimating/accounting to Procore;
- project signs;
- drawings/specifications in Procore;
- owner contract with SOV/pay app;
- subcontractor COIs;
- owner certificate of insurance;
- Notice of Commencement;
- job files;
- management and logistics plan;
- project schedule;
- submittal register;
- closeout setup;
- preconstruction meetings with AHJ and owner;
- threshold/testing company verification;
- photo/video surveys;
- vibration monitoring;
- subcontract writing;
- buyout tracking;
- NTO;
- builder’s risk;
- safety plan and SDS notebook;
- utilities;
- services and equipment;
- permits posted on jobsite.

### 17.3 Features

- Startup readiness dashboard
- Startup checklist by category
- Mobilization readiness gate
- Accounting setup status
- Procore setup status
- Contract risk setup
- Insurance/bonding status
- NOC/NTO status
- Safety plan setup
- Services/equipment setup
- Permits-posted tracker
- Evidence attachments
- Auto-generated actions

### 17.4 Data List

#### Project Startup Tasks

- Project ID
- Task Number
- Task Category
- Task Description
- Required / Conditional / N/A
- Responsible Role
- Responsible Person
- Due Date
- Status
- Completed Date
- Completed By
- Evidence Required
- Evidence Link
- Related System
- Startup Gate Impact
- Notes

### 17.x Procore-backed startup readiness checks

When the Procore project mapping is configured (§36A.9), Startup Center surfaces these readiness checks alongside the PCC-native startup checklist:

- Procore project exists and reachable
- Procore project mapping configured (`ProcoreProjectId` and `ProcoreProjectUrl` populated)
- Procore directory initialized (key roles populated)
- Budget present in Procore (when `financials` subject area enabled)
- Drawings and specs initialized in Procore
- Submittal register initialized in Procore
- Commitments / subcontracts initialized in Procore
- Procore tool deep links configured (links visible in PCC)

These checks are read-only summaries of Procore state; they do not write to Procore.

---

## 18. Permit & AHJ Center

### 18.1 Purpose

Convert the permit log into a project permit register and AHJ management module.

### 18.2 Example Coverage

The permit log includes:

- permit sequence;
- sub reference;
- permit type;
- location;
- permit number;
- description;
- responsible contractor;
- address;
- date required;
- date submitted;
- date received;
- date expires;
- status;
- AHJ;
- comments.

Example permit types and descriptions include:

- mass grading;
- engineering;
- construction field office;
- irrigation;
- pool deck;
- swimming pool;
- pool barrier;
- gazebos;
- site wall;
- site lighting;
- landscape;
- hardscape;
- dog park/playground fencing;
- monument sign;
- master building;
- electrical sub;
- plumbing sub;
- mechanical sub;
- fire sprinkler;
- fire alarm;
- access control;
- low voltage;
- roofing;
- elevator;
- BDA.

### 18.3 Features

- Permit register
- Status board
- Permit expiration alerts
- Responsible contractor view
- AHJ view
- Permit document links
- Posted-on-jobsite status
- Permit closeout status
- Connection to inspections
- Location/building grouping

### 18.4 Data List

#### Project Permits

- Project ID
- Permit Sequence Number
- Sub Reference
- Permit Type
- Location / Building / Area
- Permit Number
- Permit Description
- Responsible Contractor
- Address
- AHJ
- Date Required
- Date Submitted
- Date Received
- Date Expires
- Status
- Permit Document Link
- Related Inspection Group
- Comments

### 18.x Procore split

The permit register, AHJ contacts, and CO/TCO readiness are **PCC-native** (no Procore dependency). Procore provides no permit equivalent in MVP. Procore's `quality_safety` inspection workflows are addressed in §19 Inspection Readiness Center.

---

## 19. Inspection Readiness Center

### 19.1 Purpose

Convert the required inspections workbook into a structured inspection planning, call-in, result, and verification module.

### 19.2 Example Coverage

The required inspections list includes fields for:

- inspection;
- code;
- date called in;
- result;
- comment;
- verified online.

It includes inspection groups and examples such as:

- NOC/recorded;
- fire preliminary;
- civil preliminary;
- landscape preliminary;
- elevation certification;
- building footer;
- slab;
- filled cells;
- tie beams;
- waterproofing;
- door/window bucks;
- storefront;
- truss;
- wall sheathing;
- drywall;
- framing;
- fire penetration;
- insulation;
- low voltage;
- fire alarm;
- fire sprinkler;
- high voltage electrical;
- mechanical;
- plumbing;
- tree removal;
- irrigation;
- storm drainage;
- site wall/fencing;
- dumpster enclosure;
- exterior light poles;
- awnings;
- patio pavers;
- landscaping;
- asphalt paving;
- roofing.

### 19.3 Features

- Required inspection template by project type
- Inspection call-in tracking
- Scheduled inspections
- Passed/failed/partial result tracking
- Online verification flag
- Reinspection tracking
- Evidence/document links
- Failed inspection corrective actions
- Blocks-cover-up flag
- Blocks-CO/TCO flag
- Connection to Permit & AHJ Center
- Connection to Closeout & Turnover Center

### 19.4 Data List

#### Project Required Inspections

- Project ID
- Inspection Group
- Inspection Name
- Inspection Code
- Permit Number
- Related Permit ID
- Location / Building / Area
- Date Called In
- Scheduled Date
- Result
- Verified Online
- Verification Date
- AHJ
- Inspector
- Comments
- Evidence Link
- Blocks Cover-Up
- Blocks CO/TCO
- Blocks Closeout

### 19.x PCC vs Procore split

**PCC-native** (always): the required-inspection template (per project type), the AHJ-by-permit map, and CO/TCO readiness rollups.

**Procore-backed** (Recommended Practical, when `quality_safety` subject area is enabled per §36A.9):

- inspection / checklist execution results from Procore inspections,
- inspection item status,
- attachments / deep links to Procore inspection records,
- observations created from failed inspections (surfaced in Action Center §16.5).

Inspection results from Procore are summarized in PCC; the canonical record stays in Procore.

---

## 20. Contract & Compliance Center

### 20.1 Purpose

Manage contract terms, obligations, risk clauses, notices, insurance, bonds, responsibilities, and external contract systems.

### 20.2 Example Sources

- Startup checklist owner contract review
- Owner Contract / GMP Responsibility Matrix
- Document Crunch
- Adobe Sign
- Insurance and COI tracking
- NOC/NTO requirements
- Bonding/SDI requirements

### 20.3 Owner Contract Responsibility Matrix

The owner contract matrix includes:

- article;
- page;
- responsible party;
- description;
- responsibility legend:
  - `O` = Owner Activity
  - `A/E` = Architect / Engineer Activity
  - `C` = Contractor Activity

These are contract-party classification markers and remain separate from internal RACI assignment values.

### 20.4 Features

- Prime contract obligation register
- Contract article/page reference
- Owner / A/E / Contractor responsibility mapping
- LDs tracking
- Contingency usage parameters
- Split savings terms
- Allowance tracking
- Notice requirements
- Insurance requirements
- Bonding/SDI requirements
- Document Crunch review links
- Adobe Sign envelope tracking
- Owner notice workflow
- Contract risk flags

### 20.5 Data List

#### Contract Obligation Register

- Project ID
- Contract Document
- Article / Section
- Page
- Responsible Party
- Obligation Description
- Trigger Event
- Required Action
- Due Date
- Risk Level
- Responsible HB Role
- Status
- Evidence Link
- Document Crunch Link
- Adobe Sign Link
- Notes

---

## 21. Drawing & Model Center

### 21.1 Purpose

Create a project-specific access point for drawings, specifications, models, as-builts, surveys, reality capture, and design coordination references.

### 21.2 Features

- Current drawing set
- Superseded drawings
- Specifications
- Permit plans
- ASIs / CCDs / sketches
- As-built tracker
- Final survey / elevation certificate tracker
- Form board survey tracker
- Engineer certification tracker
- Cupix walkthrough launcher
- Photo/video survey records
- Vibration monitoring records
- Links to Procore drawing/spec modules
- Design team contacts

### 21.3 Data Lists

#### Drawing Register

- Project ID
- Drawing Number
- Drawing Title
- Discipline
- Current Revision
- Issue Date
- Status
- Source System
- File Link
- Procore Link
- Notes

#### Survey and Certification Register

- Project ID
- Certification Type
- Required For
- Responsible Party
- Due Date
- Received Date
- Status
- File Link
- Notes

---

## 22. Field Operations Center

### 22.1 Purpose

Provide superintendent and field teams with a practical daily field surface.

### 22.2 Features

- Field readiness dashboard
- Daily work plan
- Lookahead schedule
- Required inspections
- Jobsite permits posted
- Safety plan and SDS notebook access
- Site logistics
- Utilities and services
- Trailer / field office setup
- Sanitary and temporary facilities
- First aid and fire extinguisher readiness
- Field photos
- Site observations
- Issue escalation
- Mobile/tablet-friendly views

### 22.3 Source Enhancements

This module pulls directly from:

- Project Startup Checklist
- Required Inspections List
- Permit & Inspection Control Center (internal source families: `permits`, `required-inspections`)
- Responsibility Matrix - Field
- Safety / QAQC workflows
- Procore daily logs, if integrated

### 22.x Procore-backed field summaries (Recommended Practical)

When `field_execution` and `quality_safety` subject areas are enabled (§36A.9), Field Operations surfaces the following Procore-backed summaries. **High-volume detail (timecard rows, production-quantity rows, equipment-event rows, daily-log segments) lives in the canonical relational layer**, not in SharePoint lists (per §36A.8 forbidden list):

- daily log completion (header level)
- manpower / timecard summary (when modeled)
- inspections (summary; details in §19)
- observations (summary; surfaced as exceptions in Action Center §16.5)
- incidents (summary)
- punch items (summary)
- field photos / media (when modeled — prefer Cupix surface)
- production quantities (when modeled)

---

## 23. Meeting & Communication Center

### 23.1 Purpose

Centralize meeting records, agendas, minutes, action items, project communications, and formal decision tracking.

### 23.2 Features

- Estimating-to-operations turnover meeting
- Preconstruction meeting with AHJ
- Preconstruction meeting with owner
- OAC meeting minutes
- Subcontractor meeting minutes
- Internal project huddles
- Punch list meeting
- Owner turnover meeting
- Meeting action items
- Decision log integration
- Public relations announcement workflow
- Owner recommendation letter workflow
- Letter of appreciation workflow

### 23.3 Data Lists

#### Meeting Register

- Project ID
- Meeting Type
- Meeting Date
- Organizer
- Attendees
- Agenda Link
- Minutes Link
- Related Actions
- Related Decisions
- Status

#### Decision Log

- Project ID
- Decision Title
- Decision Description
- Decision Owner
- Required By
- Decision Date
- Impact
- Related Meeting
- Related RFI / Change / Drawing
- Status

### 23.x Procore meetings / correspondence (Future)

When `project_management` is enabled (Recommended Practical or Strategic), Procore meetings and correspondence may feed Meeting & Communication summaries (deep links + lightweight metadata). MVP and early Recommended Practical do not enable this feed.

---

## 24. Risk / Issues / Decision Log

### 24.1 Purpose

Create executive and project-team visibility into unresolved project risk, blockers, issues, constraints, and decisions.

### 24.2 Risk Sources

- Liquidated damages exposure
- Special contract terms
- Allowance or contingency uncertainty
- Permit delays
- AHJ dependencies
- Failed or partial inspections
- Builder’s risk verification
- Vibration monitoring need
- Photo/video survey need
- CO/TCO blockers
- Lien/final payment timing
- Late owner decisions
- Subcontractor performance issues
- Lessons learned significant/critical impacts

### 24.3 Data Lists

#### Project Risks

- Project ID
- Risk Title
- Risk Category
- Description
- Probability
- Impact
- Risk Level
- Owner
- Mitigation Plan
- Due Date
- Status
- Related Module
- Related Document
- Escalation Required

#### Project Issues

- Project ID
- Issue Title
- Description
- Source
- Responsible Role
- Responsible Person
- Due Date
- Status
- Related Module
- Related System
- Resolution Notes

### 24.x Procore RFI / observation feeds (Future)

When `project_management` and `quality_safety` subject areas are enabled, Procore RFI and observation patterns are candidate inputs to the Risk / Issues / Decision Log. Feeds are summary-level (deep links to Procore for the source record).

---

## 25. Project Controls Center

### 25.1 Purpose

Provide schedule, budget, cost, change, procurement, milestone, and readiness visibility.

### 25.2 Features

- Milestone tracker
- Schedule summary
- Lookahead snapshot
- Budget summary
- Cost report link
- Change event summary
- Pay application status
- Forecast / cost-to-complete summary
- Procurement log
- Buyout status
- Allowance log
- Startup readiness gates
- Closeout readiness gates
- Cost variance report closeout status
- Sage Intacct links
- Procore links

### 25.3 Integrations

- Sage Intacct for official financials
- Procore for project management records
- Internal HB Intel summaries where normalized data is available

### 25.4 Sage Intacct vs Procore system-of-record boundary

> **Sage Intacct remains the accounting book of record.** Procore may provide project-management-domain financial state — commitments, change events, requisitions, prime contract status, and project-level budget views — but PCC must label these as **Procore-sourced operational / project-management financial summaries**. PCC must never reposition Procore figures as accounting figures or use Procore values for general-ledger purposes.

### 25.5 Procore-backed Project Controls summaries (Recommended Practical)

When `financials` is enabled (§36A.9), Project Controls surfaces these Procore-sourced project-management financial summaries:

- budget views (snapshot rows from Procore Budget Views)
- change events
- commitments
- commitment change orders
- prime contract status
- requisitions / subcontractor invoices (status only)
- direct costs (when modeled)

Each summary is labeled "Procore-sourced operational / project-management financial summary" in the UI per §25.4. Reconciliation with Sage values stays out-of-band (or is a future Strategic Enterprise feature).

---

## 26. Procurement & Buyout Center

### 26.1 Purpose

Manage subcontract buyout, procurement priorities, vendor qualification, long-lead exposure, and owner-provided items.

### 26.2 Features

- Buyout tracking log
- Subcontract status
- Long-lead item tracking
- Owner-provided item tracking
- Subcontract writing in Procore
- Compass vendor/prequalification links
- Subcontractor evaluation history
- Rebid recommendation visibility
- Procurement-related lessons learned

### 26.3 Data Lists

#### Buyout Log

Wave 13 governance alignment:

- Official module name remains `Buyout Log` (subtitle: `Buyout Control Center`).
- Buyout Log is an MVP Project Readiness workflow module with Procurement / Project Controls classification and future Procurement & Buyout Center affinity.

- Project ID
- Package
- Trade
- Scope
- Budget
- Target Award Date
- Current Status
- Selected Subcontractor
- Compass Link
- Procore Commitment Link
- Risk Notes

#### Procurement Log

- Project ID
- Item
- Related Trade
- Required Date
- Lead Time
- Responsible Party
- Status
- Vendor/Subcontractor
- Related Submittal
- Related Schedule Activity
- Notes

### 26.x Procore-backed procurement summaries (Recommended Practical)

When `financials` is enabled (§36A.9), Procurement & Buyout surfaces:

- Procore commitments (status, executed value, balance)
- subcontract status (active, pending, suspended)
- SOV status
- change-order status (per commitment)
- commitment deep links to Procore
- Compass connection for vendor qualification
- subcontractor performance feedback loop (writes into §27 Subcontractor Performance Center)

---

## 27. Subcontractor Performance Center

### 27.1 Purpose

Convert the subcontractor performance scorecard into a structured closeout and future procurement dataset.

### 27.2 Example Scorecard Categories

The scorecard uses weighted performance categories:

- Safety & Compliance — 20%
- Quality of Work — 20%
- Schedule Performance — 20%
- Cost Management — 15%
- Communication & Management — 15%
- Workforce & Labor — 10%

The scorecard includes detailed evaluation criteria for safety plan adherence, PPE/toolbox participation, housekeeping, incident rate, corrective actions, workmanship, plan/spec/submittal compliance, first-time inspection pass rate, closeout documentation, mobilization, lookahead reliability, baseline schedule progress, recovery effort, coordination, budget adherence, change order timeliness, back-charge exposure, financial stability, billing quality, responsiveness, foreman/superintendent leadership, submittal quality, meeting participation, issue escalation, staffing, skill level, labor compliance, and sub-tier management.

### 27.3 Features

- Subcontractor evaluation form
- Weighted scoring
- Rating band
- PM/Super/PX signature/approval
- Rebid recommendation
- Key strengths
- Areas for improvement
- Notable incidents
- Compass integration candidate
- Historical performance dashboard
- Closeout gate requirement

### 27.4 Data Lists

#### Subcontractor Evaluations

- Project ID
- Subcontractor
- Trade / Scope
- Contract Value
- Final Cost
- Scheduled Completion
- Actual Completion
- Evaluator
- Evaluation Date
- Safety Score
- Quality Score
- Schedule Score
- Cost Management Score
- Communication Score
- Workforce Score
- Overall Weighted Score
- Rating Band
- Recommend Rebidding
- Key Strengths
- Areas for Improvement
- Notable Incidents
- PM Signature
- Superintendent Signature
- PX Approval

#### Subcontractor Evaluation Criteria

- Criterion ID
- Category
- Criterion
- Evidence Guidance
- Weight
- Active

### 27.x Procore feedback into subcontractor performance

When `quality_safety` is enabled, Procore observation, inspection, and punch records concerning a specific subcontractor feed performance evidence into the scorecard (counts of open observations, failed inspections, open punch items by subcontractor). The scorecard remains site-local working detail; the approved summary is HBCentral per contract §15.10.

---

## 28. Lessons Learned Center

### 28.1 Purpose

Convert project closeout lessons into structured knowledge capture, searchable best practices, and process-improvement routing.

### 28.2 Example Form Coverage

The lessons learned workbook includes:

- project identification;
- delivery method;
- market sector;
- project size band;
- complexity rating;
- individual lesson entries;
- situation;
- impact;
- root cause;
- response;
- recommendation;
- supporting references;
- project-level summary;
- best practices to replicate;
- process improvement recommendations;
- approval workflow;
- lessons database;
- reference guide;
- category definitions;
- writing standards.

### 28.3 Lesson Categories

- Pre-Construction
- Estimating & Bid
- Procurement
- Schedule
- Cost / Budget
- Safety
- Quality
- Subcontractors
- Design / RFIs
- Owner / Client
- Technology / BIM
- Workforce / Labor
- Commissioning
- Closeout / Turnover
- Other

### 28.4 Impact Magnitude

The lessons template defines impact magnitude thresholds by cost and schedule impact:

- Minor
- Moderate
- Significant
- Critical

### 28.5 Features

- Capture lessons during the project, not only at closeout
- Lesson entry form
- Category tagging
- Keywords/tags
- Impact scoring
- Root cause and recommendation fields
- Supporting document references
- PX/leadership review
- Convert lesson to best practice
- Route process improvement recommendation
- HBI searchable knowledge base

### 28.6 Data Lists

#### Project Lessons Learned

- Project ID
- Lesson Number
- Category
- Phase Encountered
- Situation
- Impact Description
- Cost Impact
- Schedule Impact Days
- Impact Magnitude
- Root Cause
- Response
- Recommendation
- Applicability Rating
- Keywords
- Supporting Document Links
- Created By
- Created Date
- Reviewed By
- PX Approved
- VP Ops Approved
- Companywide Best Practice Candidate

#### Best Practices Library

- Practice Title
- Category
- Description
- Conditions for Use
- Owner Department
- Source Project
- Source Lesson
- Approved By
- Active / Retired
- Related Templates / Standards

#### Process Improvement Recommendations

- Recommendation
- Owner Department
- Priority
- Effort
- Status
- Source Project
- Source Lesson
- Assigned Owner
- Due Date
- Resolution Notes

### 28.x Procore patterns as lesson sources

When `project_management` and `quality_safety` are enabled, Procore RFI patterns and observation patterns are candidate sources for project lessons (recurring RFI categories, recurring observation categories). Lessons remain site-local drafts until promoted to HBCentral.

---

## 29. Closeout & Warranty Center

### 29.1 Purpose

Make closeout visible and structured from day one of the project.

### 29.2 Example Checklist Coverage

The closeout checklist includes:

- fire alarm/elevator phone lines;
- RFI closure;
- submittal approval;
- change order approval;
- as-built requests;
- soil investigation/certification;
- termite letters;
- insulation certificate;
- form board survey;
- tie-in survey;
- final survey/elevation certificate;
- fire-treated lumber letter;
- fire alarm monitoring letter;
- structural engineer certification;
- substantial completion affidavit;
- engineer certification for paving/utilities;
- threshold inspection reports;
- landscape acceptance letter;
- building department plan changes approval;
- health department approval;
- utility approval;
- demo, plumbing, HVAC, electrical, fire alarm, fire sprinkler, and building finals;
- pre-CO checklist;
- CO/CC;
- owner turnover;
- punch list;
- as-builts;
- owner warranties;
- O&M manuals;
- attic stock;
- final payment forms;
- last contractual work date;
- 80-day flag;
- 88-day lien filing trigger;
- releases of lien;
- recommendation letter;
- project files returned;
- project recap;
- subcontractor evaluation;
- cost variance report;
- lessons learned;
- PBC closeout requirements.

### 29.3 Features

- Closeout readiness dashboard
- Pre-CO checklist
- Turnover package builder
- Closeout document tracker
- Inspection final readiness
- Certificate tracker
- Warranty/O&M/attic stock tracker
- Punch list status
- Final payment forms
- Lien/final payment watchlist
- PX closeout package
- Subcontractor evaluation gate
- Lessons learned gate

### 29.4 Data Lists

#### Project Closeout Tasks

- Project ID
- Section
- Item Number
- Closeout Item
- Required / Conditional / N/A
- Responsible Role
- Responsible Person
- Due Date
- Status
- Evidence Required
- Evidence Document Link
- Related AHJ
- Related Inspection
- Completed Date
- Completed By
- Notes

#### Closeout Documents Register

- Project ID
- Document Type
- Required By
- Responsible Party
- Source Company
- Required For CO
- Required For Turnover
- Required For Final Payment
- Received Date
- Reviewed Date
- Accepted Date
- File Link
- Status
- Notes

#### Lien / Final Payment Watchlist

- Project ID
- Last Contractual Work Date
- 80-Day Warning Date
- 88-Day Lien Filing Deadline
- Final Payment Received
- Release of Liens Received
- Owner Notice Sent
- Status
- Legal/Risk Notes

### 29.x Procore evidence gates (Recommended Practical)

Closeout & Warranty surfaces Procore evidence gates when the relevant subject areas are enabled (§36A.9):

- RFIs closed (`project_management`)
- submittals approved (`project_management`)
- change orders approved (`financials`)
- punch items complete (`quality_safety`)
- inspections passed (`quality_safety`)
- as-builts requested / received (when modeled)
- O&M / warranty links (deep links to Procore documents)

Each gate is a Procore-sourced summary; the canonical record stays in Procore.

---

## 30. HBI Assistant

### 30.1 Purpose

Provide a project-aware assistant grounded in project-site data, project-accessible documents, and integrated system summaries.

### 30.2 Example Queries

- What startup items are still blocking mobilization?
- Which permits are not received?
- What inspections are required before CO?
- What inspections failed this week?
- What closeout documents are missing?
- Who owns waterproofing inspections?
- Which subcontractors need evaluation?
- Summarize open lessons learned.
- Which contract obligations are owner responsibilities?
- What are the lien/final payment deadlines?
- Find the latest structural drawings.
- Prepare an OAC agenda draft.
- Summarize changes since yesterday.
- Show external users with access to this project.

### 30.3 Guardrails

- HBI should use project-accessible data only.
- HBI should not bypass user permissions.
- HBI should not use tenant-wide file crawling unless a separate governed architecture is approved.
- Answers should link to source records/documents where possible.
- Sensitive diagnostics should be redacted.

### 30.4 Procore-grounded queries (Strategic Enterprise)

When Procore subject areas are enabled and HBI grounding extends to canonical Procore data (Strategic Enterprise per §36A.16), example queries include:

- "What RFIs are overdue?"
- "Which submittals are awaiting action?"
- "What Procore items changed since yesterday?"
- "Which punch items are blocking turnover?"
- "What change events are open?"
- "Summarize Procore inspection failures."
- "What drawings or specs changed recently?"

HBI must respect the Procore Architecture Decision (§36A) — answers cite deep links into Procore for source-of-truth, never propose write-back, and never expose secrets.

---

## 31. Control Center Settings

### 31.1 Purpose

Give authorized users a way to configure the project site without using native SharePoint administration.

### 31.2 Settings Sections

```text
Control Center Settings
├── General Project Profile
├── Modules & Navigation
├── Project Team / Roles
├── Team & Access
├── Libraries & Document Areas
├── External Integrations
├── Startup / Closeout Templates
├── Permits & Inspections
├── Responsibility Matrix
├── Notifications / Escalations
├── Access Requests
├── HBI Settings
└── Template Health / Validation
```

### 31.3 UX Requirements

- Role-gated settings
- Guided forms
- Friendly labels
- Plain-language validation
- Safe save workflow
- Audit trail
- No raw internal field names
- No raw SharePoint list/library settings
- Preview changes before publish
- Clear indication when a setting affects permissions or visibility

### 31.4 Settings Data List

#### Project Control Center Settings

- Project ID
- Site URL
- Active Modules
- Module Labels
- Default Landing View
- Project Phase
- External System Links
- Procore Project ID
- Sage Project ID
- Compass Project/Vendor References
- Document Crunch Project Link
- Adobe Sign Project References
- Cupix Project Link
- Default Library Mapping
- Default View Mapping
- HBI Enabled
- Template Version
- Last Updated By
- Last Updated Date

### 31.x Procore Settings

Control Center Settings includes a Procore configuration surface that exposes the Project Procore Mapping and Procore Subject Area Registry in business language. Fields: Procore Company ID, Procore Project ID, Procore Project URL, Enabled Procore Subject Areas, Sync Cadence, Sync Profile, Tool Deep Links, Last Sync Status, Last Successful Sync, Configured By, Configured Date, Health Status, Redacted Error Summary. Edit gates: PCC Admin, Project Executive, Project Manager, IT / Integration Admin. See contract §10.6 and §15.13.

---

## 32. Site Health and Drift Detection

### 32.1 Purpose

Detect whether a provisioned project site still matches the governed template.

### 32.2 Health Checks

- Site exists
- Required pages exist
- Required libraries exist
- Required lists exist
- Required fields exist
- Required content types exist, if used
- Required permission groups exist
- Global read-only group applied
- Project Control Center app installed
- Settings records exist
- Module registry records exist
- External mapping placeholders exist
- No unexpected broken permission inheritance in governed areas
- Template version matches current supported version
- Required views exist or app-generated views work
- Site navigation matches expected state

### 32.3 Repair Actions

Authorized admins may trigger repair actions where safe:

- recreate missing list;
- recreate missing library;
- restore missing field;
- reseed module registry;
- reapply default navigation;
- refresh permission group mapping;
- re-run validation;
- open support ticket for unsafe drift.

All repairs must be audited.

### 32.4 Procore-specific health checks

Site Health includes Procore checks per contract §19 / §15.13:

- Procore Project Mapping record exists
- `ProcoreProjectId` and `ProcoreProjectUrl` present (when `ProcoreSyncEnabled=true`)
- Procore project reachable (when backend connectivity is configured)
- enabled Procore subject areas healthy (per Procore Sync Health)
- backend Procore credentials available for the configured environment
- last successful Procore sync within tolerance
- Procore sync errors are redacted (no raw payloads, tokens, or URLs containing secrets in PCC surfaces)
- required Procore tool deep links configured
- no stale Procore materializations beyond per-summary tolerance
- **no Procore secret found in any SharePoint surface** (R4 — `Security Risk` if violated)
- `ProcoreCompanyId = 5280` (or an approved multi-company exception) — flagged otherwise
- Project Procore Mapping `ConfiguredBy` reflects the assigned Project Manager (or Project Executive fallback)

Severity examples (per §19.3 of the contract) align to the §36A.10 `ErrorCategory` enum:

- `AuthFailed` → `Security Risk`
- `PermissionDenied` / `ProjectNotFound` / `MaterializationFailed` / `MappingMissing` / `Unknown` → `Repair Required`
- `RateLimited` / `EndpointDeprecated` / `PartialSync` / `StaleData` → `Warning`

---

## 33. Standard Document Libraries

### 33.1 Recommended Baseline

```text
01_Project_Administration
02_Contracts_and_Compliance
03_Drawings_and_Specifications
04_Permits_and_Inspections
05_RFIs_Submittals_and_Direction
06_Field_Operations
07_Meetings_and_Communications
08_Project_Controls_and_Financials
09_Photos_Videos_and_Reality_Capture
10_Closeout_and_Turnover
11_Lessons_Learned_and_Reports
99_Archive
```

### 33.2 Library Design Principles

- Use separate libraries where permission, lifecycle, sync, or confidentiality needs differ.
- Avoid one massive mixed-permission library.
- Avoid frequent folder-level unique permissions.
- Prefer library-level security boundaries.
- Avoid making users manage metadata manually.
- Expose metadata through app UI and controlled forms.
- Provide project-friendly views in the Document Control Center rather than requiring users to create SharePoint views.

---

## 34. Standard SharePoint Lists

### 34.1 Governance and Configuration

- Project Profile
- Project Control Center Settings
- Project Module Registry
- Project Site Health
- Project Provisioning Audit
- Project Access Configuration
- Project Access Audit
- Access Requests

### 34.2 Team and Responsibilities

- Project Team Assignments
- Project Companies
- Project Contacts
- Project Roles
- Project Responsibility Matrix
- Contract Responsibility Matrix

### 34.3 Daily Operations

- Project Action Items
- Project Decisions
- Project Issues
- Project Risks
- Meeting Register
- Project Links

### 34.4 Startup

- Project Startup Tasks
- Startup Gate Checklist
- Project Services and Equipment
- Preconstruction Meeting Log

### 34.5 Permits and Inspections

- Project Permits
- AHJ Contacts
- Project Required Inspections
- Inspection Results
- Inspection Deficiencies
- Corrective Actions
- Permit Closeout Requirements

### 34.6 Contracts and Compliance

- Contract Obligation Register
- Insurance and COI Register
- Bonding and SDI Register
- Notice Register
- Adobe Sign Envelope Tracker
- Document Crunch Review Tracker

### 34.7 Project Controls

- Milestones
- Buyout Log
- Procurement Log
- Allowance Log
- Change Event Summary
- Pay Application Tracker
- Financial Reporting Checklist

### 34.8 Documents

- Document Register
- Drawing Register
- Submittal Register
- RFI Register
- As-Built Tracker
- Closeout Document Register
- Survey and Certification Register

### 34.9 Subcontractors

- Subcontractor Evaluations
- Subcontractor Evaluation Criteria
- Subcontractor Performance History
- Subcontractor Rebid Recommendations

### 34.10 Closeout and Knowledge Capture

- Project Closeout Tasks
- Turnover Package Items
- Warranty Items
- O&M Manual Tracker
- Attic Stock Tracker
- Lien and Final Payment Watchlist
- Project Lessons Learned
- Best Practices Library
- Process Improvement Recommendations

---

## 35. Permission and Access Architecture

### 35.1 Core Principle

Permissions should be governed by role and template, not by ad hoc manual SharePoint administration.

### 35.2 Baseline Permission Groups

Recommended baseline SharePoint groups or mapped group concepts:

- Project Owners / Admins
- Project Management
- Field Operations
- Project Accounting
- Safety / QAQC
- Estimating / Preconstruction
- Executive Oversight
- Global Read-Only
- External Design Team
- Owner / Client Viewer
- Subcontractor Limited Access, if used
- Read-Only Visitors

### 35.3 Global Read-Only Group

A predefined Entra group should be granted read-only access to all project sites.

This should include:

- IT department;
- Vice Presidents and above;
- other centrally approved oversight users.

### 35.4 Phase-Based Access Managers

#### Preconstruction / Estimating

Authorized add-user roles:

- Estimating Coordinator
- Lead Estimator
- Project Executive

#### Construction

Authorized add-user roles:

- Project Executive
- Project Manager
- Manager of Operational Excellence

### 35.5 Access Mutation Flow

```text
User initiates add/change access
  └─ Project Control Center UI
      ├─ validate user role
      ├─ validate project phase
      ├─ validate permission template
      ├─ submit request to backend/functions
      └─ show pending/success/error state

backend/functions
  ├─ validate actor
  ├─ validate project context
  ├─ map permission template to group
  ├─ apply membership change
  ├─ write Project Access Audit record
  └─ return plain-language result
```

### 35.6 Access Guardrails

- No arbitrary permission grant UI.
- No raw SharePoint group selection for normal users.
- No item/folder-level permission management by project teams.
- No phase-rule bypass.
- No access change without audit logging.
- No hidden dependency on native SharePoint permissions screens.
- No raw Graph/SharePoint error dumps in the UI.

### 35.7 Procore directory comparison (read-only)

When `project_management` is enabled (§36A.9), Team & Access surfaces a read-only Procore directory comparison feed:

- PCC user exists but not in Procore
- Procore user exists but not in PCC
- role mismatch
- inactive user with active SharePoint access
- missing PX / PM / Superintendent / Project Accountant

> Procore project directory membership may be used for **comparison, reconciliation, and exception reporting**. It must **not** automatically grant SharePoint access. Auto-grant requires a future governed access-sync workflow approved by an architecture amendment.

All access mutations route through the standard PCC invite workflow (§12) with audit (Project Access Audit). Procore access does not auto-grant SharePoint access.

---

## 36. External Integration Architecture

**Procore is HB's primary integration.** Detailed Procore architecture is in §36A. The general pattern below applies to all other integrations (Sage Intacct, Compass, Document Crunch, Adobe Sign, Cupix, Teams, Outlook).

### 36.1 Integration Pattern

The Project Control Center should provide three levels of integration:

1. **Launch Links**  
   Low-cost, high-value deep links to project-specific records in external systems.

2. **Status Cards**  
   API-backed summaries where practical.

3. **Workflow Sync / Automation**  
   Future controlled integration where business value justifies it.

### 36.2 Integration Candidates

| Platform        | Candidate Uses                                                                                                    |
| --------------- | ----------------------------------------------------------------------------------------------------------------- |
| Procore         | RFIs, submittals, drawings/specs, change events, daily logs, inspections, directory, commitments, punch, schedule |
| Sage Intacct    | job setup, budget, cost reporting, commitments, pay apps, invoices, final payment                                 |
| Compass         | subcontractor prequalification, vendor profile, trade capacity, performance history                               |
| Document Crunch | prime contract review, subcontract review, obligation extraction, risk clauses, notice requirements               |
| Adobe Sign      | prime contract execution, subcontract execution, change order signatures, lien releases                           |
| Cupix           | existing conditions, progress capture, turnover/warranty visual records, location-based photo/video context       |

### 36.3 External System Mapping List

#### Project External System Mappings

- Project ID
- System Name
- External Project ID
- External URL
- Integration Status
- Last Verified
- Verified By
- Mapping Notes

---

## 36A. Procore Integration Layer

> **Procore Architecture Decision.** Procore is the system of record for Procore-owned project-management workflows. PCC is the SharePoint-hosted project operating surface that summarizes, contextualizes, deep-links, and selectively materializes Procore data. PCC must not become a parallel Procore clone or a full SharePoint mirror of Procore transactional records.

### 36A.1 Purpose

Surface Procore current-state summaries, readiness checks, exception queues, project-control indicators, and deep links into Procore. Store only curated, user-facing materializations and project-specific configuration in SharePoint.

### 36A.2 System-of-record posture

Procore is the system of record for Procore-native records generated and maintained in Procore, including: RFIs, submittals, drawings, specifications, daily logs, inspections, observations, incidents, punch items, commitments, change events, prime contracts, budget views, requisitions / subcontractor invoices, direct costs, directory / companies / users, meetings, correspondence, and photos / field media (when used).

Sage Intacct remains the accounting book of record. Procore project-management-domain financial state (commitments, change events, requisitions, prime contract status, project-level budget views) is exposed in PCC as **Procore-sourced operational / project-management financial summaries** — not as accounting figures (see §25).

PCC owns PCC-native records that replace legacy manual methods, including Responsibility Matrix, Permit Log, Required Inspection Log where not generated in Procore, Constraints Log, Project Readiness records, PCC evidence links, PCC priority actions, and PCC risk/exposure signals. Linked Procore records remain Procore-owned source objects.

### 36A.3 SPFx boundary (hard rule)

> **SPFx modules must not call the Procore API directly.** All Procore API interaction must route through `backend/functions/` or a later approved integration service boundary. The reasons: authentication, secret handling, rate limits, canonical mapping, logging, health checks, and error redaction.

### 36A.4 Backend-mediated access

```
Project Control Center SPFx
  → backend/functions PCC API
    → Procore Integration Service
      → Procore API

Procore API
  → Raw / Canonical Data Layer
  → Curated PCC Summary Views
  → Selective SharePoint Materialization
  → PCC Cards / Queues / Readiness Gates
  → Deep Links back to Procore
```

The recommended (future) backend boundary is `backend/functions/src/services/procore/` with services for auth, client, project mapping, sync orchestrator, subject area registry, canonical mapper, materialization, sync health, and webhook handling. **No code is created by this blueprint amendment.**

### 36A.5 Authentication posture (DMSA default)

Per the package: **DMSA (Procore Direct Mobile Service Account)** is preferred for enterprise sync — backend-held system-to-system credentials. User-context OAuth is deferred. Simple deep links require no API call.

> **Procore client IDs, client secrets, refresh tokens, DMSA credentials, OAuth secrets, and environment credentials must never be stored in SharePoint lists, SPFx code, markdown docs, or client-side configuration.** A secret discovered in any of those surfaces is a `Security Risk` and an IT-approved security repair.

Procore credentials are **not** held under HB SharePoint Creator. Procore auth is a separate backend secret-management surface; specifics are tenant configuration recorded in the Decision Closure Register (§41.1).

**Procore Company ID is configuration, not a secret.** HB's value is **`5280`**. Three forms are used consistently across the architecture:

- canonical / data-layer: `procore_company_id`,
- PCC / SharePoint surface: `ProcoreCompanyId`,
- business language: "Procore Company ID = `5280`".

The R4 no-secrets rule above still applies in full to client IDs, client secrets, refresh tokens, DMSA credentials, OAuth secrets, and environment credentials. The `ProcoreCompanyId` field on Project Procore Mapping is retained for future multi-company flexibility; Site Health flags blank or non-`5280` values unless an approved multi-company exception exists (§32.4).

### 36A.6 Storage strategy

Five surfaces (PCC adds the explicit "deep links back to Procore" tier on top of the package's four-layer model):

```
Procore API
  → Raw landing / integration store           (backend; archive / replay where appropriate)
  → Canonical relational layer                (backend; package's canonical entities)
  → SharePoint / HB Intel materialized layer  (curated summaries; selective)
  → Document/file storage                     (selective publish; no full binary mirror)
  → Deep links back to Procore                (default user path)
```

### 36A.7 Canonical model alignment

The package defines six canonical **subject areas**: `financials`, `project_management`, `documents_design`, `quality_safety`, `field_execution`, `workflow`. Canonical entities use bare snake_case names (`project`, `rfi`, `submittal`, `observation`, `punch_item`, etc.). Lineage at the canonical layer uses snake_case (`procore_company_id`, `procore_project_id`, `source_system_id`, `source_updated_at`, `ingested_at`); SharePoint surface objects mirror these with PascalCase (`ProcoreCompanyId`, `ProcoreProjectId`, `SourceSystem`, `ProcoreObjectType`, `ProcoreObjectId`, `ProcoreObjectUrl`, `ProcoreLastSyncedAt`, `CanonicalEntityId`, `CanonicalEntityType`, `MaterializedRecordId`).

### 36A.8 SharePoint materialization rules

**Allowed in SharePoint** (per package §10): summaries, exceptions / readiness checks, action queues, mapping / configuration, sync health, audit, lightweight object link records.

**Forbidden / discouraged in SharePoint**: raw Procore payloads, large transactional histories, high-volume detail records, bulk attachments, full financial line-item histories, drawing / spec / document metadata at uncontrolled scale, binary document replication.

Authority: package `10-SharePoint-HB-Intel-Integration-Recommendations.md`. This blueprint does not relax those rules.

### 36A.9 Subject Area Registry

Per project, a Subject Area Registry tracks per-subject-area enablement, sync mode, sync cadence, storage target, canonical entity target, endpoint name, **endpoint version, API lifecycle status, last version review date, version risk**, and health status. Six rows per project; defaults `Enabled=false`, `ApiLifecycleStatus=Unknown` until first review. See contract §15.13.2.

Rationale for endpoint / version tracking: package §13 explicitly flags mixed maturity across Procore endpoints (budget, workflow, schedule). Lifecycle and risk live on the same record that gates per-project enablement so review and enablement decisions stay coupled.

### 36A.10 Sync Health (with failure-mode enum)

Sync runs are recorded per subject area. The canonical `ErrorCategory` enum:

| `ErrorCategory`         | Plain-language UI message                                    | Severity        | Repair Tier      |
| ----------------------- | ------------------------------------------------------------ | --------------- | ---------------- |
| `AuthFailed`            | "Procore sign-in failed. Contact integration admin."         | Security Risk   | T3 — IT-Approved |
| `PermissionDenied`      | "Procore service does not have permission for this project." | Repair Required | T3               |
| `RateLimited`           | "Procore is busy; data refresh delayed."                     | Warning         | T1 (auto-retry)  |
| `EndpointDeprecated`    | "An older Procore endpoint is in use; refresh planned."      | Warning         | T2 (Admin)       |
| `MappingMissing`        | "Procore project mapping is not configured."                 | Repair Required | T2               |
| `ProjectNotFound`       | "The mapped Procore project cannot be found."                | Repair Required | T3               |
| `PartialSync`           | "Some Procore data is delayed or missing."                   | Warning         | T1               |
| `StaleData`             | "Last successful refresh is older than expected."            | Warning         | T1               |
| `MaterializationFailed` | "PCC could not save the latest Procore summary."             | Repair Required | T2               |
| `Unknown`               | "An unexpected Procore integration issue occurred."          | Repair Required | T3               |

Plain-language messages reach ordinary users; technical diagnostics live in the Procore Integration Audit (§32 Site Health).

### 36A.11 Data lineage fields

Every PCC surface that displays a Procore-derived record carries the lineage set named in §36A.7. The canonical-layer snake_case set lives at the canonical layer; the SharePoint surface mirror is in PascalCase per §36A.7. Lineage is required on derived summary records and object link records.

### 36A.12 Deep link strategy

Deep links are the default user path. PCC promotes deep links over materialization wherever a Procore tool already provides the user experience (drawings, specs, RFIs, submittals, observations, inspections, daily logs, change events, commitments). Deep links require only `ProcoreProjectUrl` plus a tool-specific path; no API call is made for the link itself.

### 36A.13 Write-back posture (deferred)

**MVP is read-only from Procore plus deep links.** PCC may create local PCC actions based on Procore data. PCC must not create / update / delete Procore records unless a future architecture amendment approves all of: user authorization model, permission mapping, audit trail, confirmation UI, rollback / error posture, legal / commercial ownership, Procore endpoint capability, sandbox validation.

### 36A.14 Security & audit posture

- No Procore secrets in SPFx, SharePoint lists, markdown docs, or repo source.
- All Procore sync actions are audit-logged (Procore Integration Audit).
- Credential access is backend-only.
- Environment separation is required for sandbox vs production.
- Quarterly endpoint / version review.
- **Mapping ownership (frozen for MVP).** Primary Procore project mapping owner: **Project Manager**. Fallback: **Project Executive** (when no PM is assigned). IT / Integration Admin may **repair or override only** through the controlled settings/repair workflow. **Project Accountant is not the mapping owner.** Mapping changes are audited through Procore Integration Audit (`mapping_owner_changed` action) and Project Site Configuration audit. See contract §10.6 / §15.13.1 / §18.1.13.

### 36A.15 Rate-limit / retry / error posture

Backend handles rate-limit responses with retry-with-backoff. `RateLimited` is `Warning` / T1 (auto-retry). Persistent rate limiting past a threshold escalates to `Repair Required`.

### 36A.16 Three-tier scope ladder

| Tier                                                           | Scope                                                                                                                                                                                                                                                                                                                                             | Source                                                |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| **PCC MVP**                                                    | Project mapping, launch / deep links, Procore Settings (read-only fields populated from mapping), Sync Health placeholder, Object Link pattern. **No summaries materialized.**                                                                                                                                                                    | Contract §21.8                                        |
| **Procore Recommended Practical Model** (default future state) | Operational summaries and canonical-layer sync by subject area: directory + projects, RFIs, submittals, observations, inspections, incidents, punch, commitments, change events, requisitions, drawings/specs metadata, daily-log headers, timecards, production quantities, drawings/specs/document metadata, workflow instances, project roles. | Package `12-Core-vs-Extended-Scope-Recommendation.md` |
| **Full Strategic Enterprise**                                  | Cross-project analytics, HBI grounding, broader workflow / coordination / equipment / telematics, raw-payload archival/replay, **governed write-back if approved**.                                                                                                                                                                               | Package                                               |

### 36A.17 Procore Module Matrix

One row per canonical entity, with the subject area called out explicitly. MVP / Future is keyed to the §36A.16 ladder (everything past mapping + launch links is Recommended Practical or later).

| Canonical Entity                                                                                 | Subject Area            | PCC Module                                | PCC Use                                    | System of Record                                                | Storage Target                                                 | MVP / Future                                                             |
| ------------------------------------------------------------------------------------------------ | ----------------------- | ----------------------------------------- | ------------------------------------------ | --------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `project`                                                                                        | (cross-cutting)         | Project Home / Settings                   | mapping, health, launch                    | Procore                                                         | SharePoint materialized + deep link                            | **MVP** (mapping placeholder)                                            |
| `company`, `user`, `vendor`                                                                      | (cross-cutting masters) | Team & Access / Project Directory         | directory comparison, contacts             | Procore + PCC split                                             | canonical (backend)                                            | Future (Recommended Practical)                                           |
| `rfi`                                                                                            | `project_management`    | Action Center / Document Control          | open / overdue summaries, deep links       | Procore                                                         | curated summary + deep link                                    | Future (Recommended Practical)                                           |
| `submittal`                                                                                      | `project_management`    | Action Center / Document Control          | awaiting action, overdue, closeout gates   | Procore                                                         | curated summary + deep link                                    | Future (Recommended Practical)                                           |
| `correspondence`, `meeting`, `form`                                                              | `project_management`    | Meeting & Communication                   | summaries, deep links                      | Procore                                                         | canonical + deep link                                          | Future (Recommended Practical)                                           |
| `drawing`                                                                                        | `documents_design`      | Document Control / Drawing & Model Center | latest set, revision metadata, deep links  | Procore                                                         | metadata summary (no binary mirror)                            | Future (Recommended Practical)                                           |
| `specification`                                                                                  | `documents_design`      | Document Control / Drawing & Model Center | spec set, deep links                       | Procore                                                         | metadata summary                                               | Future (Recommended Practical)                                           |
| `daily_log` (header), `timecard_entry`, `production_quantity`, `equipment_usage`                 | `field_execution`       | Field Operations Center                   | completion status, exceptions              | Procore                                                         | canonical (backend); curated header summary in SharePoint only | Future (Recommended Practical for headers; full detail Future Strategic) |
| `inspection`, `inspection_item`                                                                  | `quality_safety`        | Inspection Readiness / Field Operations   | execution results, failed items            | Procore + PCC split (PCC owns the required-inspection template) | curated summary + deep link                                    | Future (Recommended Practical)                                           |
| `observation`                                                                                    | `quality_safety`        | Field Operations / Action Center          | open observations, safety / quality issues | Procore                                                         | curated summary + deep link                                    | Future (Recommended Practical)                                           |
| `incident`                                                                                       | `quality_safety`        | Field Operations / Action Center          | open incidents                             | Procore                                                         | curated summary + deep link                                    | Future (Recommended Practical)                                           |
| `punch_item`                                                                                     | `quality_safety`        | Closeout / Field Operations               | punch completion, turnover readiness       | Procore                                                         | curated summary + deep link                                    | Future (Recommended Practical)                                           |
| `coordination_issue`                                                                             | `quality_safety`        | Risk / Issues / Decision Log              | open coordination issues                   | Procore                                                         | curated summary                                                | Future (Strategic Enterprise)                                            |
| `commitment`, `commitment_change_order`                                                          | `financials`            | Procurement & Buyout / Project Controls   | subcontract status, change-order status    | Procore                                                         | canonical + summary                                            | Future (Recommended Practical)                                           |
| `change_event`, `budget_change`                                                                  | `financials`            | Project Controls                          | change exposure                            | Procore                                                         | canonical + summary                                            | Future (Recommended Practical)                                           |
| `budget_view`, `budget_view_snapshot`                                                            | `financials`            | Project Controls                          | project financial snapshots                | Procore + Sage split (per §25 / §36A.2)                         | canonical (snapshot rows); summary in SharePoint               | Future (Recommended Practical)                                           |
| `prime_contract`, `prime_change_order`, `requisition`, `direct_cost`, `owner_invoice`, `payment` | `financials`            | Project Controls / Closeout               | summaries, deep links                      | Procore                                                         | canonical + summary                                            | Future (Recommended Practical)                                           |
| `workflow_instance`, `workflow_activity`, `action_plan`                                          | `workflow`              | Action Center                             | approval queue, action exceptions          | Procore                                                         | canonical + summary                                            | Future (Strategic Enterprise)                                            |

### 36A.18 Terminology Alignment

PCC surface names diverge from the package's snake_case canonical layer.

| Concept            | Package (canonical / data layer)                                                                                              | PCC / SharePoint surface                                                                                                                                                                                                |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Top-level grouping | `subject area` (six: `financials`, `project_management`, `documents_design`, `quality_safety`, `field_execution`, `workflow`) | "Procore Subject Area"; PCC stores per-project enablement in **Procore Subject Area Registry**                                                                                                                          |
| Canonical entity   | bare snake_case (`project`, `rfi`, `submittal`, `observation`, `punch_item`, …)                                               | Same names quoted; PCC objects that reference them use PCC field names                                                                                                                                                  |
| Lineage            | `procore_company_id`, `procore_project_id`, `source_system_id`, `source_updated_at`, `ingested_at`                            | Mirror as `ProcoreCompanyId`, `ProcoreProjectId`, `ProcoreObjectType`, `ProcoreObjectId`, `ProcoreObjectUrl`, `ProcoreLastSyncedAt`, `SourceSystem`, `CanonicalEntityId`, `CanonicalEntityType`, `MaterializedRecordId` |
| Storage layers     | Raw landing → Canonical relational → SharePoint / HB Intel materialized → Document/file storage                               | Same; PCC adds **deep links back to Procore** as an explicit fifth surface                                                                                                                                              |
| Scope tier         | Minimum Viable / **Recommended Practical** (default) / Full Strategic Enterprise                                              | Anchored in §36A.16                                                                                                                                                                                                     |
| Wave priority      | Wave 1–7 from `extraction_priority_matrix.csv`                                                                                | Mapped to Phase 1–6 in §38                                                                                                                                                                                              |
| Auth               | DMSA preferred for enterprise sync                                                                                            | DMSA cited as the default backend posture; user-context OAuth deferred                                                                                                                                                  |

---

## 37. Data Relationship Model

```text
Project Profile
├── Project Control Center Settings
├── Project Team Assignments
│   ├── Project Access Configuration
│   └── Project Responsibility Matrix
├── Startup Tasks
│   ├── Contract Review Items
│   ├── Insurance / Bonding / NOC / NTO
│   └── Services / Permits Posted
├── Permits
│   └── Required Inspections
│       ├── Inspection Results
│       └── Corrective Actions
├── Contract Obligations
│   ├── Notices
│   ├── Document Crunch Reviews
│   └── Adobe Sign Envelopes
├── Project Documents
│   ├── Drawing Register
│   ├── Submittal Register
│   ├── RFI Register
│   ├── Survey / Certification Register
│   └── Closeout Document Register
├── Project Controls
│   ├── Milestones
│   ├── Buyout Log
│   ├── Procurement Log
│   └── Pay Application Tracker
├── Closeout Tasks
│   ├── Turnover Package
│   ├── Warranty Items
│   ├── Lien Watchlist
│   └── PX Closeout Package
├── Subcontractor Evaluations
│   └── Subcontractor Performance History
├── Lessons Learned
│   ├── Best Practices
│   └── Process Improvements
└── Project Procore Mapping
    ├── Procore Subject Area Registry
    ├── Procore Sync Health
    ├── Procore Object Links
    └── Procore Curated Summaries
```

The Procore subtree is **PCC-side configuration and curation** (contract §15.13) — it is **not** the canonical store for Procore transactional data. Canonical Procore data lives in the backend integration / data layer (`backend/functions/`) per contract §15.1D and §36A.6.

---

## 38. Implementation Sequencing Authority

Implementation sequencing and phase/wave execution status are governed by:

- [`Project_Control_Center_Development_Roadmap.md`](./Project_Control_Center_Development_Roadmap.md)

Current status snapshot (repo-truth aligned):

- Phase 0 complete — see [`phase-0/`](./phase-0/)
- Phase 1 complete — see [`phase-1/`](./phase-1/)
- Phase 2 complete — see [`phase-2/Phase_2_Closeout.md`](./phase-2/Phase_2_Closeout.md)
- Phase 3 Wave 1 complete — see [`phase-3/wave-1/Wave_1_Closeout.md`](./phase-3/wave-1/Wave_1_Closeout.md)
- Phase 3 Wave 2 planned/current shell-frame UI/UX wave (not implemented in runtime app code yet)

Architecture doctrine for Procore tiering, write-back gates, and system-of-record boundaries remains authoritative in this blueprint under §36A and related module sections.

---

## 39. MVP Recommendation

The first useful production pilot should include:

1. Project site provisioning from estimating/accounting handoff.
2. Standard project site template with baseline libraries and lists.
3. Project Control Center Home.
4. Team & Access Center.
5. Document Control Center.
6. Startup Center.
7. Responsibility Matrix Center.
8. Permit & AHJ Center.
9. Inspection Readiness Center.
10. Site Health / Template Validation.

This set directly addresses:

- adoption;
- access control;
- startup consistency;
- document organization;
- field readiness;
- project-site standardization;
- reduced SharePoint admin burden.

---

## 40. Success Criteria

### 40.1 User Adoption

- Project users open the Project Control Center daily.
- Project teams use the site as the starting point for project work.
- Users can find project documents without SharePoint training.
- Users can identify responsibilities without asking around.
- Users can request/access project systems from a clear project home page.

### 40.2 Governance

- Every project site is provisioned from the same template.
- Template version is tracked.
- Site health is visible.
- Drift is detected.
- Access changes are audited.
- Project users do not manually manage SharePoint settings.

### 40.3 Operations

- Startup readiness is measurable.
- Permit status is visible.
- Required inspections are trackable.
- Closeout begins at startup.
- Lien/final payment deadlines are visible.
- Lessons learned are captured and reusable.
- Subcontractor performance is captured for future buyout.

### 40.4 Technical

- SPFx shell is packageable and deployable.
- Backend provisioning is repeatable.
- Graph/API permissions are documented and governed.
- External integrations are mapped by project.
- Site repair and validation are available to authorized admins.

### 40.5 Procore integration success

- PCC presents Procore current-state without becoming a duplicate of Procore.
- Deep links from PCC to Procore work for every enabled subject area.
- Procore Sync Health is visible to integration admins; failures map to plain-language messages per §36A.10.
- No Procore secret appears in any SharePoint surface (R4).
- SPFx never calls Procore directly (R3).
- Sage Intacct remains the accounting book of record; Procore figures appear only as project-management financial summaries (§25.4 / §36A.2).

---

## 41. MVP Decision Closure Register (condensed mirror)

> **All MVP architecture decisions for PCC are now closed.** This section is a condensed mirror of the full register that lives at [Standard Project Site Template Contract](./Standard_Project_Site_Template_Contract.md) §22.2. Refer to the contract for full Implementation Impact and Owner / Validation columns. The historical "Open Decisions" list previously kept here is captured below for traceability and is now superseded by §41.1.

### 41.0 Status definitions

| Status                  | Meaning                                                                                                                                                  |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Frozen for MVP`        | Architecture decision is closed for the first provisioning release; implementation must follow it unless a later amendment changes it.                   |
| `Runtime Configuration` | Architecture is closed but the actual value is tenant-, environment-, or project-specific and is captured in configuration during provisioning or setup. |
| `Deferred`              | Intentionally out of MVP scope; must not block MVP implementation. Future implementation requires a new amendment or release plan.                       |
| `Proof-Gated`           | Target direction known but final implementation depends on technical proof, tenant validation, API capability confirmation, or security review.          |

### 41.1 Register (one line per decision)

#### Core PCC / SharePoint decisions

| ID   | Decision                                           | Status                  | One-line closure                                                                                                                            |
| ---- | -------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| D-01 | Central Entra group object IDs                     | `Runtime Configuration` | Names frozen; IDs resolved from HBCentral configuration.                                                                                    |
| D-02 | Project-local SharePoint group IDs                 | `Runtime Configuration` | Names frozen; IDs generated at provisioning.                                                                                                |
| D-03 | Custom permission-level role definitions           | `Frozen for MVP`        | `HB Read`, `HB Contribute No Delete`, `HB Contribute`, `HB Manage Project Content`, `Full Control`.                                         |
| D-04 | External users (MVP)                               | `Deferred`              | No external users in MVP.                                                                                                                   |
| D-05 | External access approval workflow                  | `Deferred`              | Future model captured; not built in MVP.                                                                                                    |
| D-06 | Final app-only permission reduction                | `Proof-Gated`           | Target `Sites.Create.All` + `Sites.Selected`; reduce after proof.                                                                           |
| D-07 | SharePoint REST / PnP residual permissions         | `Proof-Gated`           | Graph first; REST/PnP only where required.                                                                                                  |
| D-08 | Per-project phase exception URL suffix             | `Frozen for MVP`        | `/sites/{ProjectBaseNumberNoHyphen}-{PhaseSuffixNoHyphen}` (e.g., `/sites/26000-01`) when an exception is approved.                         |
| D-09 | OneDrive sync enforcement                          | `Runtime Configuration` | PCC governs labels; IT governs device enforcement.                                                                                          |
| D-10 | Project Access Audit mirror to HBCentral           | `Frozen for MVP`        | Mirror near-real-time; local audit is source on failure.                                                                                    |
| D-11 | Site-local → HBCentral promotion workflows         | `Frozen for MVP`        | PM submits / PX approves / Ops curates (lessons, sub performance, closeout summary).                                                        |
| D-12 | **ProjectType enum**                               | `Frozen for MVP`        | `commercial`, `multifamily`, `municipal`, `luxury_residential`, `environmental`.                                                            |
| D-13 | **ProjectStage enum**                              | `Frozen for MVP`        | `lead`, `estimating`, `preconstruction`, `active_construction`, `closeout`, `warranty`. Archive is `ProjectStatus = Archived`, not a stage. |
| D-14 | Repair automation edge cases                       | `Frozen for MVP`        | T1 auto / T2 admin / T3 IT / T4 manual; no destructive auto-repair.                                                                         |
| D-15 | Default expirations for non-external templates     | `Frozen for MVP`        | Internal: no fixed expiration; viewer 90d; estimating/precon 30d after `active_construction`.                                               |
| D-16 | HBI Assistant first-release scope                  | `Deferred`              | Architecture hooks only; no HBI in MVP.                                                                                                     |
| D-17 | Per-project-type list seeding beyond current rules | `Deferred`              | Common seed set in MVP; future per-type expansions tracked.                                                                                 |
| D-18 | HB SharePoint Creator permission grants            | `Proof-Gated`           | Use minimum Graph app permissions proven by implementation; `GroupMember.ReadWrite.All` only if required.                                   |
| D-19 | Per-stage / per-status edge behavior               | `Frozen for MVP`        | Stage drives module visibility; status drives archive behavior; transitions governed and audited.                                           |

#### Procore decisions

| ID   | Decision                                         | Status           | One-line closure                                                                               |
| ---- | ------------------------------------------------ | ---------------- | ---------------------------------------------------------------------------------------------- |
| P-01 | Procore authentication model                     | `Frozen for MVP` | DMSA / backend service account; user-context OAuth deferred.                                   |
| P-02 | Procore credential storage                       | `Frozen for MVP` | Azure Key Vault per environment via managed identity.                                          |
| P-03 | **Procore Company ID**                           | `Frozen for MVP` | `ProcoreCompanyId = 5280`. Configuration; not a secret.                                        |
| P-04 | **Procore mapping owner**                        | `Frozen for MVP` | Primary: PM. Fallback: PX. Repair: IT / Integration Admin. PA excluded.                        |
| P-05 | MVP-enabled Procore subject areas                | `Frozen for MVP` | None. Mapping + launch links + sync health placeholder only.                                   |
| P-06 | Sync cadence per subject area                    | `Deferred`       | Adopt package defaults at Recommended Practical.                                               |
| P-07 | Webhooks vs polling                              | `Deferred`       | Webhooks for `project_management` / `quality_safety`; polling fallback / snapshots for others. |
| P-08 | Canonical storage target                         | `Deferred`       | Azure SQL (canonical) + Azure Blob (raw landing).                                              |
| P-09 | Raw payload retention                            | `Deferred`       | 90 days default; longer for replay / legal hold.                                               |
| P-10 | SharePoint materialization boundaries            | `Frozen for MVP` | Mappings / summaries / sync health / audits only; no raw payloads or bulk binaries.            |
| P-11 | Procore vs Sage financial SoR                    | `Frozen for MVP` | Sage is accounting book of record; Procore = operational state, labeled as Procore-sourced.    |
| P-12 | Procore write-back governance                    | `Deferred`       | No Procore writes from PCC until amendment satisfies §36A.13 gates.                            |
| P-13 | Rate-limit / retry thresholds                    | `Deferred`       | Exponential backoff with jitter; ~1/2/4/8/16 min; 5 attempts; escalate after 3 failed runs.    |
| P-14 | Endpoint version review cadence                  | `Deferred`       | Quarterly review; IT / Integration Admin + Architecture sign-off for high risk.                |
| P-15 | Sandbox vs production separation                 | `Frozen for MVP` | Strict separation of credentials, secrets, storage, config, schedules.                         |
| P-16 | Procore data deletion / archive policy           | `Deferred`       | Soft-delete / tombstone; no immediate hard-delete.                                             |
| P-17 | External-user / Procore-directory reconciliation | `Frozen for MVP` | Comparison only; no auto-grant of SharePoint access (R6).                                      |

### 41.2 Historical "Open Decisions" list (superseded)

Preserved for traceability. All twelve items below are now governed by entries in §41.1 / contract §22.2:

1. Exact project site URL naming convention. → **D-08 / contract F1**
2. Whether each project site is connected to a Microsoft 365 Group / Teams team. → **contract F2**
3. Standard external-user policy by project type. → **D-04**
4. Whether owner/client access is allowed in the first release. → **D-04**
5. Whether subcontractor access is allowed in the first release. → **D-04**
6. Whether permission templates map to SharePoint groups, Entra groups, or both. → **D-01 / D-02 / contract F3**
7. How project phase is controlled and updated. → **D-13 / D-19** (resolved by ProjectStage enum and governed transitions).
8. Which external systems are launch-link only in the first release. → resolved by **§36A.16** (PCC MVP) and **contract §21.4 / §18.1** (Procore mapping + launch links only; other systems unchanged).
9. Which lists are stored per project site versus centrally at HB Central. → **contract F7 / D-11**
10. Whether closeout/lessons/subcontractor performance data should sync to a central enterprise repository. → **D-11 / contract F7**
11. Whether HBI Assistant is enabled in the MVP or deferred. → **D-16** (`Deferred`).
12. Whether write-enabled Document Control actions are included in the MVP or deferred. → resolved by §36A.13 / **P-12** (`Deferred`); writes to project document libraries follow the existing PCC governance.

---

## 42. Recommended Guiding Statement

The Project Control Center is not a SharePoint page. It is a project operations application hosted on a standardized SharePoint site.

The site template provides the secure, repeatable project container. The Project Control Center provides the daily user experience, business workflows, settings, access management, and project intelligence that make the site useful.

The uploaded example documents should be treated as legacy workflow artifacts to convert into structured, governed project modules — not files to simply store in SharePoint.
