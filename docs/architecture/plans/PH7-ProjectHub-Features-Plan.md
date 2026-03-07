# PH7 — Project Hub Module: Master Feature Plan

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md · `hb-intel-foundation-plan.md`
**Date:** 2026-03-07
**Derived from:** Structured product-owner interview (2026-03-07); all decisions locked.
**Audience:** Implementation agent(s), technical reviewers, product owner, operations/support stakeholders, and future maintainers.
**Purpose:** This document is the master plan for the Project Hub module. It defines every feature, consolidates all locked architectural decisions from the structured interview, and serves as the authoritative index for all 16 individual task files. A developer unfamiliar with the project can read this document, follow the file map, and produce a production-ready, fully tested, fully documented Project Hub webpart.

---

## Governing Architectural Rule

> **"The Project Hub will contain features that use data for one unique project at a time. Tracking that includes multiple projects will never be included in the Project Hub."**
> — Product Owner, 2026-03-07

All routing, data fetching, and component scope is bound to a single `projectId` parameter. No cross-project aggregate tables, dashboards, or reports belong in this module.

---

## All Locked Interview Decisions

| # | Feature Area | Decision |
|---|---|---|
| Q34 | Startup Checklist | HB Intel native replacement for Procore startup checklist; 37-item interactive checklist with completion tracking |
| Q35 | Closeout Checklist | Option B — native HB Intel checklist with auto-populated closeout documents section linked to stored project documents |
| Q36 | Project Management Plan | Option C — structured digital form matching current PMP template with team member digital acknowledgment/signature tracking |
| Q37 | Responsibility Matrix | Option B — fully interactive RACI matrix with add/edit/delete row capability; role and responsibility columns; per-project |
| Q38 | Site Specific Safety Plan | Option C — structured field entry matching SSSP template with subcontractor acknowledgment tracking |
| Q39 | JHA Log | Option C — upload existing log immediately (Phase 1); Phase 2 native digital JHA form documented for future build |
| Q40 | Emergency Plans | Option B — curated library of company-wide safety/emergency plans with annual acknowledgment tracking per team member |
| Q41 | Incident Reporting | Option B — structured incident report form matching uploaded template; notification workflow to Safety Manager and Subcontractor Supervisor |
| Q42 | QC Checklists | Option B+C — CSI-division-auto-suggested checklists as starting point, per-project customizable |
| Q43 | QC Completion | Phase 1: interactive per-item completion checklist; Phase 2: full Dashpivot-replacement collaborative workflow (documented, not built now) |
| Q44 | Warranty | Option C — warranty request workflow + document library + expiration alert system |
| Q45 | Financial Forecasting | Full modernization: Procore budget CSV/Excel upload seeds baseline; native 3-part report (Summary Sheet, GC/GR Forecast, Cash Flow) |
| Q46 | Schedule | Option B — milestone tracker + XER/XML/CSV file upload and parsing (Primavera P6, MS Project) |
| Q47 | Buyout Log | Option B — full tracker replicating uploaded template view; Procore budget CSV/Excel upload populates Original Budget column |
| Q48 | Permit Log | Full tracker matching uploaded template; Required Inspections tracker linked to permits (200+ inspection rows) |
| Q49 | Constraints Log | Full tracker matching uploaded template view; simplified data entry; 7 categories + Change Tracking + Delay Log sections |
| Q50A | PX Review | Option B — auto-assembled review package from project data + trend dashboard across projects |
| Q50B | Owner Report | Option B — auto-populated narrative report from project data + PDF export |

### Cross-Module Integration Rules

- **Go/No-Go Scorecard** lives in Business Development; Project Hub shows a **read-only view** of the BD record for the current project.
- **Kickoff Checklist** is read/write for Estimators; read-only view in Project Hub for Operations (cross-module feed).
- **Estimate Panel** in Project Hub is read-only (source of truth remains in Estimating module).
- **Turnover to Ops** is a 4-party digital sign-off (Estimating Coordinator, Project Executive, Project Manager, Superintendent) — write access for all four parties, visible in both Estimating and Project Hub.
- **Post-Bid Autopsy** is read/write for Estimators; read-only in Project Hub.
- **Financial Forecast baseline** and **Buyout Log original budget** are both seeded from the same Procore budget CSV/Excel upload performed at project start.

---

## Phase 7 Project Hub — File Map

| Task File | Title | Key Deliverables |
|---|---|---|
| `PH7.1` | Foundation & Data Models | All TypeScript enums, interfaces, and type definitions for every Project Hub feature |
| `PH7.2` | Routes & Shell Navigation | TanStack Router route tree, `ProjectHubApp` shell, sidebar nav, project selector |
| `PH7.3` | Project Hub Home Page | Per-project dashboard: status cards, quick-action shortcuts, recent activity feed |
| `PH7.4` | Preconstruction Module | Go/No-Go read-only view, Kickoff Checklist, Estimate Panel, Turnover to Ops, Post-Bid Autopsy |
| `PH7.5` | Project Management Module | PMP + team acknowledgment, RACI Matrix, Startup Checklist, Closeout Checklist |
| `PH7.6` | Safety Module | Site Specific Safety Plan, JHA Log, Emergency Plans Library, Incident Reporting |
| `PH7.7` | Quality Control Module | QC Checklists (CSI-scoped), QC Completion + Third-Party Inspection Coordination |
| `PH7.8` | Warranty Module | Warranty request workflow, document library, expiration alert system |
| `PH7.9` | Financial Forecasting | Procore budget upload, Summary Sheet, GC/GR Forecast, Cash Flow Schedule |
| `PH7.10` | Schedule | Milestone tracker, XER/XML/CSV file parsing, Primavera P6 / MS Project support |
| `PH7.11` | Buyout Log | Full buyout tracker, Procore budget upload for original budget, CSI division structure |
| `PH7.12` | Permit Log & Required Inspections | Permit log tracker, linked Required Inspections tracker, status management |
| `PH7.13` | Constraints Log | 7-category constraints tracker, Change Tracking section, Delay Log section |
| `PH7.14` | PX Review & Owner Report | PX Review auto-assembly + trend dashboard; Owner Report auto-populate + PDF export |
| `PH7.15` | Backend API Endpoints | All Azure Functions HTTP triggers for Project Hub data operations |
| `PH7.16` | Testing, CI/CD & Documentation | Vitest unit tests, Playwright E2E, GitHub Actions, ADRs, Diátaxis docs |

---

## Recommended Implementation Sequence

Execute task files strictly in the following order. Each task file lists its own prerequisite checks.

```
PH7.1 → PH7.2 → PH7.3 → PH7.4 → PH7.5 → PH7.6 → PH7.7 → PH7.8 →
PH7.9 → PH7.10 → PH7.11 → PH7.12 → PH7.13 → PH7.14 → PH7.15 → PH7.16
```

**Rationale:** Foundation types (PH7.1) must exist before any component or API work begins. Routes and shell (PH7.2) must exist before individual pages are built. The home page (PH7.3) provides the navigation anchor for all feature pages. Feature modules (PH7.4–PH7.14) are ordered by business priority (Preconstruction → Project Management → Safety → QC → Warranty → Financial → Schedule → Buyout → Permits → Constraints → Reporting). Backend API (PH7.15) must be finalized after all feature data shapes are confirmed. Testing and documentation (PH7.16) are last but mandatory.

---

## Phase 7 Project Hub — Definition of Done

The Project Hub module is complete when:

- All 16 task files have been executed sequentially with passing builds at each step.
- Every per-project route resolves correctly and is gated by project membership.
- The Go/No-Go, Kickoff, Estimate, Turnover, and Autopsy panels display correct read-only/read-write behavior per role.
- The RACI matrix supports full add/edit/delete with SharePoint persistence.
- The Startup and Closeout checklists track item-level completion with user attribution.
- The PMP and SSSP structured forms match their uploaded template schemas with acknowledgment tracking.
- The JHA Log accepts file upload and stores metadata correctly.
- The Emergency Plans library supports annual per-member acknowledgment.
- The Incident Report form matches the 24-field uploaded template and fires notifications to Safety Manager and Sub Supervisor.
- QC Checklists are auto-suggested by CSI division and per-project customizable.
- Warranty module supports request workflow, document storage, and expiration alerts.
- Financial Forecasting imports Procore budget CSV/Excel, calculates Summary Sheet, GC/GR Forecast, and Cash Flow correctly.
- Schedule module parses XER/XML/CSV files and displays milestones.
- Buyout Log replicates the uploaded 14-column template view with CSI structure and Procore budget upload for original budget.
- Permit Log and Required Inspections tracker match uploaded templates with full status management.
- Constraints Log supports all 7 categories, Change Tracking, and Delay Log with due-date color coding.
- PX Review auto-assembles from live project data and exports PDF.
- Owner Report auto-populates narrative fields and exports PDF.
- All Azure Functions API endpoints are secured with Bearer token validation.
- All SharePoint list schemas are defined and deployed via setup scripts.
- Vitest unit tests cover all data transformation and state logic (≥95% coverage).
- Playwright E2E tests cover all primary user flows end to end.
- All ADRs are created in `docs/architecture/adr/`.
- All documentation exists in the correct Diátaxis folders.

---

## Phase 7 Project Hub — Master Success Criteria Checklist

### Foundation
- [ ] 7.1.1 All Project Hub TypeScript enums, interfaces, and type definitions created in `packages/models/src/project-hub/`
- [ ] 7.1.2 All models exported from `packages/models/src/index.ts`

### Routes & Shell
- [ ] 7.2.1 TanStack Router route tree for `/project-hub/:projectId/**` registered
- [ ] 7.2.2 Project selector component resolves `projectId` from URL and validates membership
- [ ] 7.2.3 `ProjectHubApp` shell renders sidebar navigation with all module sections

### Home Page
- [ ] 7.3.1 Project Hub home page renders status summary cards for all modules
- [ ] 7.3.2 Quick-action shortcuts navigate to key module pages
- [ ] 7.3.3 Recent activity feed shows last 10 project events

### Preconstruction Module
- [ ] 7.4.1 Go/No-Go read-only panel fetches and displays BD scorecard record for the project
- [ ] 7.4.2 Kickoff checklist page renders with read/write for Estimators, read-only for Operations
- [ ] 7.4.3 Estimate panel renders read-only estimate data from Estimating module
- [ ] 7.4.4 Turnover to Ops page supports 4-party digital sign-off with signature tracking
- [ ] 7.4.5 Post-Bid Autopsy renders with read/write for Estimators, read-only for Operations

### Project Management Module
- [ ] 7.5.1 PMP structured form matches uploaded template schema with all sections
- [ ] 7.5.2 Team member acknowledgment/digital signature flow functions for PMP
- [ ] 7.5.3 RACI Matrix renders all columns; add/edit/delete rows persist to SharePoint
- [ ] 7.5.4 Startup Checklist renders 37 items with per-item completion tracking and user attribution
- [ ] 7.5.5 Closeout Checklist renders with auto-populated closeout documents section

### Safety Module
- [ ] 7.6.1 SSSP structured form renders all sections from uploaded template
- [ ] 7.6.2 SSSP subcontractor acknowledgment tracking is functional
- [ ] 7.6.3 JHA Log file upload stores file metadata and renders log entries
- [ ] 7.6.4 Emergency Plans library displays company-wide plans with annual acknowledgment per member
- [ ] 7.6.5 Incident Report form matches 24-field uploaded template exactly
- [ ] 7.6.6 Incident Report notification fires to Safety Manager and Subcontractor Supervisor on submit

### Quality Control Module
- [ ] 7.7.1 QC Checklists auto-suggest items from CSI division mapping
- [ ] 7.7.2 QC Checklists are per-project customizable (add/remove items)
- [ ] 7.7.3 QC Completion checklist tracks per-item pass/fail with user attribution
- [ ] 7.7.4 Third-Party Inspection Coordination panel is functional

### Warranty Module
- [ ] 7.8.1 Warranty request submission form is functional
- [ ] 7.8.2 Warranty request workflow advances through status states
- [ ] 7.8.3 Warranty document library stores and retrieves attachments
- [ ] 7.8.4 Warranty expiration alert fires N days before expiration date

### Financial Forecasting
- [ ] 7.9.1 Procore budget CSV/Excel upload parses and seeds baseline budget data
- [ ] 7.9.2 Financial Summary Sheet renders all sections from uploaded template
- [ ] 7.9.3 GC/GR Forecast renders per-cost-code budget vs. actual by month
- [ ] 7.9.4 Cash Flow Schedule renders CSI trade rows × pay app columns
- [ ] 7.9.5 Forecast Checklist (13 categories) is functional

### Schedule
- [ ] 7.10.1 Schedule upload accepts XER, XML, and CSV files
- [ ] 7.10.2 Parsed milestones display in milestone tracker table
- [ ] 7.10.3 Schedule status indicators show on-track / at-risk / delayed

### Buyout Log
- [ ] 7.11.1 Buyout Log renders all 14 columns from uploaded template
- [ ] 7.11.2 CSI divisions 02–16 are pre-populated as row groups
- [ ] 7.11.3 Procore budget upload populates Original Budget column per CSI division
- [ ] 7.11.4 Summary rows (Subcontracts Bought Out, Total Budget, % Buyout Complete) calculate correctly

### Permit Log & Required Inspections
- [ ] 7.12.1 Permit Log renders all 14 columns from uploaded template
- [ ] 7.12.2 Permit status choices match uploaded template values
- [ ] 7.12.3 Required Inspections tracker is linked to parent permits
- [ ] 7.12.4 Required Inspections Pass/Fail/N/A tracking is functional

### Constraints Log
- [ ] 7.13.1 Constraints Log renders all 11 columns with 7 category groupings
- [ ] 7.13.2 OPEN/CLOSED subcategories display and filter correctly
- [ ] 7.13.3 Due date color coding (green/orange/red) renders correctly
- [ ] 7.13.4 Change Tracking section (11 columns) is functional
- [ ] 7.13.5 Delay Log section (11 columns) is functional

### PX Review & Owner Report
- [ ] 7.14.1 PX Review auto-assembles data from all Project Hub modules
- [ ] 7.14.2 PX Review PDF export generates correct document
- [ ] 7.14.3 Owner Report auto-populates all narrative fields from project data
- [ ] 7.14.4 Owner Report PDF export generates correct document

### Backend & Infrastructure
- [ ] 7.15.1 All Project Hub Azure Function HTTP endpoints return correct data shapes
- [ ] 7.15.2 All endpoints secured with Bearer token validation
- [ ] 7.15.3 All SharePoint list schemas deployed via setup script

### Testing & Documentation
- [ ] 7.16.1 Vitest unit test coverage ≥95% for all data transformation and state logic
- [ ] 7.16.2 Playwright E2E tests cover all primary user flows
- [ ] 7.16.3 All required ADRs created in `docs/architecture/adr/`
- [ ] 7.16.4 Developer how-to guide created in `docs/how-to/developer/`
- [ ] 7.16.5 User guide created in `docs/user-guide/`
- [ ] 7.16.6 Reference documentation created in `docs/reference/`

<!-- IMPLEMENTATION PROGRESS & NOTES
Plan created: 2026-03-07
Status: Ready for implementation
Next: Execute PH7.1 — Foundation & Data Models
-->
