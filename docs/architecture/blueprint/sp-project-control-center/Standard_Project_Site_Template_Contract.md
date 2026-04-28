# HB Intel — Standard Project Site Template Contract

**Status:** Architecture Contract — Source of Truth
**Effective Date:** 2026-04-28
**Template Version (proposed):** 1.0.0 (governed; final value frozen at first provisioning release)
**Governing Blueprint:** [`HB_Project_Control_Center_Target_Architecture_Blueprint.md`](./HB_Project_Control_Center_Target_Architecture_Blueprint.md)
**Audience:** Engineering, IT, Operations, Project Delivery, Estimating, Accounting

This document is the human-readable source of truth for every Hedrick Brothers Construction (HB) project SharePoint team site provisioned through HB Intel. It governs structure, permissions, surfaces, settings, integrations, validation, drift detection, and MVP scope. Future machine-readable schemas in `packages/project-site-template/` and provisioning code in `backend/functions/` derive from this contract.

Where the prompt that requested this contract diverged from current repo truth, the contract follows **repo truth** (live blueprint, live packages, live identifiers) and explicitly notes the alignment.

---

## 1. Executive Summary

HB Intel is rebuilding HB's SharePoint architecture around standardized, provisioned, project-specific team sites. Each project site is a **Project Control Center (PCC)** — a governed, branded, low-friction operating surface for the project team — not a manually administered SharePoint site.

This contract exists because:

- **Symmetry.** Every project must look, feel, and operate the same way regardless of estimator, project executive, or project type.
- **Least-privilege access.** Access is granted by governed permission templates, not ad-hoc SharePoint group membership.
- **Sync and access sprawl reduction.** Library design intentionally avoids monolithic libraries, ad-hoc folder permissions, and uncontrolled OneDrive sync.
- **Adoption.** Project teams should never need to learn SharePoint administration to do daily work. Every workflow is exposed through PCC UI surfaces.
- **Governance.** Provisioning is deterministic, validated, audited, and repairable. Drift is detected and classified by severity.
- **Foundation for evolution.** Modules, integrations, and settings are added via this contract, not by ad-hoc site customization.

This contract governs every project site provisioned by the HB Intel estimating → accounting → backend-functions provisioning pipeline. Future implementation packages and apps (`packages/project-site-template/`, `apps/project-control-center/`, `apps/document-control-center/`) derive from it.

---

## 2. Contract Scope and Authority

### 2.1 What this contract governs

This contract is the **governing source of truth** for every project site created through the HB Intel provisioning pipeline. It governs:

- project team site creation,
- the Project Control Center full-page shell,
- standard pages,
- standard document libraries,
- standard SharePoint lists,
- standard metadata fields,
- standard permission groups,
- the eleven user-facing permission templates,
- Team & Access management,
- Control Center Settings (project-level + template-level),
- module-level settings surfaces,
- external integrations (Procore, Sage Intacct, Compass, Document Crunch, Adobe Sign, Cupix, Microsoft Teams, Outlook),
- project workflow templates seeded from `docs/reference/example/`,
- site health checks and drift classification,
- template versioning,
- provisioning validation stages and audit fields,
- repair posture and emergency-access reconciliation.

### 2.2 Authority

This contract is authoritative below the [PCC Target Architecture Blueprint](./HB_Project_Control_Center_Target_Architecture_Blueprint.md) and above any local app or package documentation that touches project-site provisioning. When this contract conflicts with older guidance, this contract wins. When this contract conflicts with the blueprint, the blueprint wins and a follow-up amendment is required here.

### 2.3 What this contract does **not** do

It does **not** specify:

- the JSON schema implementation (deferred to `packages/project-site-template/template-contract.json` after schema extraction is approved — see §24),
- HTTP endpoints or RPC shapes for the provisioning service (those derive from this contract but live in `backend/functions/`),
- SPFx module code (lives in `apps/project-control-center/` and `apps/document-control-center/` when those apps are created),
- specific Entra group object IDs or SharePoint group IDs (those are tenant configuration and recorded in §22 as Open Decisions where unresolved).

---

## 3. Project Site Lifecycle Context

### 3.1 Provisioning lifecycle (sequenced)

```
1. New Project Request          → apps/estimating/ (@hbc/spfx-estimating)
2. Accounting Finalization      → apps/accounting/ (@hbc/spfx-accounting)
3. Provisioning Trigger         → backend/functions/src/services/sharepoint-provisioning-service.ts
4. Project Site Created
5. Site Metadata Applied
6. Project Control Center Shell Installed
7. Modules Seeded
8. Permission Groups Created and Mapped
9. Global Read-Only Group Applied
10. Project Team Roles Seeded
11. External Integration Placeholders Created
12. Workflow Templates Seeded (from §17)
13. Site Health Record Created
14. Final Validation Passed (§20)
15. Site available to project team
```

### 3.2 Project phases

Every project site supports the following phases. Phase changes are governed transitions managed through Control Center Settings (§10), not by direct edits in SharePoint.

| Phase | Trigger | Primary surfaces | Notes |
|---|---|---|---|
| Preconstruction / Estimating | New Project Request approved | Startup Center, Project Controls Center, Estimating-phase access managers | Subset of modules visible. |
| Accounting Finalization | Sage Intacct project record finalized | Triggers full provisioning. | Bridge between phases. |
| Construction | Provisioning succeeds, project mobilized | All modules active, Construction-phase access managers | Full Project Control Center. |
| Closeout | Punch list start / substantial completion | Closeout & Warranty Center, Closeout document tracking, lien watchlist | Some modules become read-only. |
| Warranty | Final completion + warranty start date | Warranty items, owner contact, post-turnover photos | Reduced active modules. |
| Archive | Warranty end + closeout sign-off | Site renamed, libraries marked read-only, metadata frozen | Per archive naming rules in §5. |

### 3.3 Source of truth at each phase

- **Estimating-phase data:** owned by `apps/estimating/`. Not yet provisioned to a project site.
- **Accounting-finalized data:** owned by `apps/accounting/`. Reconciled into project-site Project Profile at provisioning.
- **Project-operational data:** owned by the project site (this contract).
- **Cross-project data:** owned by HBCentral lists in `docs/reference/sharepoint/list-schemas/hbcentral/`.
- **Provisioning audit:** owned by backend storage.
- **Transactional financial / RFI / signed-document data:** owned by the relevant external system (Procore, Sage Intacct, Adobe Sign).

---

## 4. Template Identity

| Field | Value |
|---|---|
| Template Name | HB Standard Project Site Template |
| Template Type | SharePoint Online team site (governed, branded, full-page shell) |
| Template Version | 1.0.0 (proposed; frozen at first release) |
| Template Family | Project Sites |
| Template Owner | HB Intel Engineering |
| Business Owner | HB VP of Operations |
| Technical Owner | HB Intel Architecture |
| Provisioning Authority | `backend/functions/src/services/sharepoint-provisioning-service.ts` |
| Provisioning Application | `apps/accounting/` (final trigger), upstream from `apps/estimating/` |
| Provisioning Host | Azure Function App `hb-intel-function-app` |
| Function App Domain | `hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net` |
| Registered Application | `HB SharePoint Creator` |
| Application (Client) ID | `08c399eb-a394-4087-b859-659d493f8dc7` |
| Primary UX Shell | Project Control Center (full-page, branded, parallel to `apps/hb-homepage/` `@hbc/spfx-hb-homepage`) |
| Supported Project Phases | Preconstruction / Estimating, Accounting Finalization, Construction, Closeout, Warranty, Archive |
| Supported Project Types | Commercial, Multifamily, Luxury Residential, Environmental, Preconstruction-only Opportunity, Active Construction, Warranty/Closeout (see §4B) |
| Effective Date | 2026-04-28 |
| Change Control Owner | HB Intel Architecture (ADR-gated) |

**Repo-confirmed identifiers:** the Application ID, function app name, and resource name are confirmed in `infra/legacy-fallback-hosting.json` and `dist/sppkg/safety-route-auth-proof.json`. No secrets are exposed by this contract.

---

## 4A. Template Object Catalog

This catalog enumerates every provisioned object kind so future schema extraction (`packages/project-site-template/template-contract.json`) has a stable index. Every object in a provisioned site must trace back to a row in this catalog.

| # | Object Kind | Scope (per site unless noted) | Owning Section | MVP / Future | Schema Target Identifier (proposed) |
|---|---|---|---|---|---|
| 1 | Site | 1 | §5, §6 | MVP | `site` |
| 2 | Site Pages | ~15 (see §13) | §13 | MVP for ~9; Future for ~6 | `pages[]` |
| 3 | Document Libraries | 12 (`01_…` … `99_Archive`) | §14 | MVP for 8; Future for 4 | `libraries[]` |
| 4 | SharePoint Lists | ~70 across domains (see §15) | §15 | MVP for ~13; Future for the rest | `lists[]` |
| 5 | List/Library Fields | ~600+ across the catalog | §15, §16 | Mixed | `lists[].fields[]`, `libraries[].fields[]` |
| 6 | Views | Default view + named views per list/library | §13–§15 | MVP for default views | `lists[].views[]`, `libraries[].views[]` |
| 7 | SharePoint Groups | Core 12 (see §12.2) | §12 | MVP | `groups[]` |
| 8 | Permission Templates | 11 (see §12.4) | §12 | MVP for 6; Future for 5 | `permissionTemplates[]` |
| 9 | Configuration Records | Project Site Configuration, Module Configuration, Permission Template Configuration, Integration Configuration | §10, §15 | MVP | `configurationRecords[]` |
| 10 | Module Records | 20 (one per module in §8) | §8 | MVP for 8; Future for 12 | `modules[]` |
| 11 | Integration Records | 8 (Procore, Sage Intacct, Compass, Document Crunch, Adobe Sign, Cupix, Teams, Outlook) | §18 | MVP for Procore, Sage Intacct; rest Future | `integrations[]` |
| 12 | Health Records | 1 per site, multiple checks | §19 | MVP | `healthRecord` |
| 13 | Workflow Template Records | 8 source workflows (§17) | §17 | MVP for Startup, Closeout, Permits, Inspections, Responsibility Matrix; Future for Owner-Contract Matrix, Subcontractor Scorecard, Lessons Learned | `workflowTemplates[]` |

The Object Catalog is the index. Every other section in this contract specifies the contents of one or more rows above.

---

## 4B. Project-Type Variation Rules

There is **one** governed template family. Project type does not fork the template. Project type drives **conditional seeding** within the same template.

### 4B.1 Project type enum (proposed; finalize in §22)

| Code | Display | Notes |
|---|---|---|
| `commercial` | Commercial | Default. Full module set. |
| `multifamily` | Multifamily | Adds unit turnover tracking, tenant-handover seeded items in Closeout. |
| `luxury_residential` | Luxury Residential | Heavier use of Cupix, finishes register, owner-direct communication. |
| `environmental` | Environmental | Adds environmental compliance/permit categories; emphasizes AHJ Contacts. |
| `preconstruction_only` | Preconstruction-only Opportunity | Minimal seeding: Startup Center, Estimating handoff, Document Control limited. |
| `active_construction` | Active Construction | Full set; default for projects that pass accounting finalization. |
| `warranty_closeout` | Warranty / Closeout | Reduced active modules; Closeout & Warranty Center foregrounded. |

### 4B.2 Conditional seeding rules

| Object | Always-on | Conditional | Notes |
|---|---|---|---|
| Modules in §8 | All 20 created | "Visible by default" varies by type | E.g., `preconstruction_only` hides Field Operations Center until phase advances. |
| Library `09_Photos_Videos_and_Reality_Capture` | Created | Cupix integration required for `luxury_residential`, optional elsewhere | See §18. |
| List `Project Required Inspections` | Created | Seed set differs by `commercial` / `multifamily` / `environmental` | Inspection groups from §17.4. |
| List `Project Permits` | Created | `environmental` includes additional permit categories | See §17.3. |
| List `Subcontractor Evaluations` | Created | Skipped for `preconstruction_only` until phase advances | See §17.7. |
| Integration `Adobe Sign` | Placeholder created | Required for `commercial`, `multifamily`, `active_construction` | See §18. |
| Integration `Cupix` | Placeholder created | Required for `luxury_residential`; optional otherwise | See §18. |

### 4B.3 Anti-fork rule

Parallel uncontrolled templates are prohibited. Variations must be expressed as conditional rules in this contract or in `packages/project-site-template/` once schema extraction is approved. A project type that cannot be expressed as conditional seeding is an architecture amendment, not a new template.

---

## 5. Project Site Naming and Identity Rules

### 5.1 Site URL pattern

The blueprint (§7.2) records two candidates; the final convention is an Open Decision (§22).

| Candidate | Pattern | Notes |
|---|---|---|
| A | `/sites/projects-{projectNumberSlug}` | Stable; project-number based. |
| B | `/sites/p-{projectNumberSlug}-{shortProjectNameSlug}` | Adds short project name for readability. |

### 5.2 Display name

`{ProjectNumber} - {ProjectName}`

Length capped at 64 characters; project name truncated with ellipsis if needed. Display name updates require Control Center Settings change with audit (§10).

### 5.3 Project number usage

`projectNumber` is the canonical identifier for a project site. It is sourced from accounting finalization (Sage Intacct project number). Projects do not exist in HB Intel's project-site space until they have an accounting-finalized project number.

### 5.4 Short name sanitization

`shortProjectNameSlug` is generated by:
1. lowercasing,
2. removing non-ASCII alphanumerics and replacing with `-`,
3. collapsing repeated `-`,
4. trimming leading/trailing `-`,
5. truncating to 32 characters at a `-` boundary.

### 5.5 Collision handling

URL collisions are resolved with `-2`, `-3`, etc. suffix. The provisioning service must record the chosen URL in the Provisioning Audit (§20).

### 5.6 Archived project naming

On archive transition (§3.2):
- display name is prefixed `[ARCHIVED] `,
- URL is preserved (do not move sites at archive),
- libraries flip to read-only per §14,
- Project Site Health record records archive event and date.

### 5.7 Site title updates

Project name corrections after provisioning are governed; only Control Center Admin and IT/admin (§9 escape hatch tier c) may change the display name. Project number is immutable after provisioning.

---

## 6. Project Metadata Contract

Required at provisioning; optional fields may be configured later through Control Center Settings (§10). All metadata is stored as columns on the **Project Profile** list (§15).

### 6.1 Required at provisioning

| Field | Source | Notes |
|---|---|---|
| Project ID | HB Intel | Internal stable ID. |
| Project Number | Accounting Finalization (Sage Intacct) | Immutable. |
| Project Name | Accounting Finalization | Editable post-provisioning by Admin. |
| Client / Owner | Accounting Finalization | |
| Project Address | Accounting Finalization | Single composite field. |
| Region | Accounting Finalization | |
| Market Sector | Accounting Finalization | |
| Delivery Method | Estimating handoff | |
| Contract Type | Estimating handoff | |
| Project Phase | Estimating / Accounting | One of §3.2 phases. |
| Project Status | HB Intel | Active / On Hold / Closed. |
| Project Executive | Estimating / Accounting | |
| Project Manager | Accounting Finalization | |
| Estimating Coordinator | Estimating handoff | |
| Lead Estimator | Estimating handoff | |
| Project Accountant | Accounting Finalization | |
| Project Start Date | Estimating / Accounting | |
| Template Version | Provisioning | Set by template installer. |
| Provisioning Run ID | Provisioning | Cross-references audit (§20). |
| Provisioned Date | Provisioning | UTC. |
| Provisioned By | Provisioning | UPN of trigger / service principal. |
| Source New Project Request ID | Estimating | Cross-reference. |
| Accounting Finalization ID | Accounting | Cross-reference. |
| Sage Intacct Project ID | Accounting | Required for sync. |

### 6.2 Optional / configured later

| Field | Notes |
|---|---|
| City, County, State (decomposed) | Optional decomposition of Project Address. |
| Project Size Band | Set by PX. |
| Complexity Rating | Set by PX. |
| Superintendent | Set when assigned. |
| Manager of Operational Excellence | Set during construction phase. |
| Safety Lead, QAQC Lead | Set when assigned. |
| Mobilization Date | Set when known. |
| Substantial Completion Date | Set when scheduled. |
| Final Completion Date | Set when scheduled. |
| Warranty Start Date | Set at handover. |
| Warranty End Date | Set at handover. |
| Procore Project ID | Set when Procore integration enabled. |
| Compass Project ID | Set when Compass integration enabled. |
| Document Crunch Project / Workspace ID | Set when integration enabled. |
| Adobe Sign Workspace / Account Mapping | Set when integration enabled. |
| Cupix Project ID | Set when integration enabled. |
| Teams Channel / Team ID | Set if Teams provisioned. |
| Outlook calendar mapping | Set if used. |

### 6.3 External system mapping status

Every external integration carries a mapping status (`Not Configured`, `Configured`, `Error`). This drives Site Health (§19) and the Module Records for the affected modules.

---

## 7. Project Control Center Shell Contract

The PCC is a full-page, branded, governed shell hosted on the project site. It is **architecturally parallel** to the existing HBCentral homepage shell (`apps/hb-homepage/`, `@hbc/spfx-hb-homepage`) but is a **distinct surface** owned by `apps/project-control-center/` (future). It does not embed or alias the homepage shell.

### 7.1 Required shell regions

| Region | Purpose | MVP / Future |
|---|---|---|
| Project Hero / Identity Header | Project number, name, client, phase, status | MVP |
| Priority Actions Rail | Top actions across modules (governed seed model per HBCentral phase-01 + phase-05) | MVP |
| Today / This Week Panel | Tasks, decisions, meetings due | MVP |
| Project Readiness Cards | Startup readiness, permits, inspections, contract obligations | MVP |
| My Responsibilities | Cross-module responsibilities for current user | MVP |
| Work Center Navigation | Entry points to all modules in §8 | MVP |
| Project Activity / Recent Changes | Activity feed | Future |
| HBI Assistant / Help Surface | AI-assisted project context | Future |
| Control Center Settings Entry | Link to Settings (§10) | MVP |
| Team & Access Entry | Link to Team & Access (§11) | MVP |
| Site Health Indicator | Health badge with details (§19) | MVP |

### 7.2 Branding

The PCC shell uses HB Intel branding tokens from `@hbc/ui-kit`. No native SharePoint chrome customization is permitted to fulfill brand requirements.

### 7.3 Performance posture

The shell must render with no native SharePoint webparts visible; all content is composed via SPFx modules consuming this contract's lists and configuration records.

---

## 8. Required Work Centers / Modules

The blueprint (§9.1) defines 20 modules. This contract preserves them verbatim. The original prompt aliased a smaller set; the alias crosswalk is in §8.2.

### 8.1 Authoritative module list

| # | Module (Blueprint) | Purpose | Primary Users | MVP / Later |
|---|---|---|---|---|
| 1 | Project Home / Command Center | Daily entry; rollups; readiness | All project users | MVP |
| 2 | Team & Access Center | Team listing, invite, permission templates, audit | PX, PM, MoOE, Admin | MVP |
| 3 | Document Control Center | Library navigation, governed upload, register | All | MVP |
| 4 | Project Directory / Team Center | People directory, roles, contact | All | MVP |
| 5 | Action Center | Actions, decisions, issues, risks | All | Later (MVP partial) |
| 6 | Project Controls Center | Schedule, milestones, budget rollups, pay app status | PM, PA, PX | Later |
| 7 | Contract & Compliance Center | Obligations, COIs, notices, signed envelopes | PM, PA, Legal | Later |
| 8 | Drawing & Model Center | Current drawings, set tracking, BIM links | Field, PM | Later |
| 9 | Field Operations Center | Daily logs, deficiencies, safety acks | Superintendent, Safety | Later |
| 10 | Meeting & Communication Center | Meeting register, minutes, action items | All | Later |
| 11 | Risk / Issues / Decision Log | Cross-project risk + decision register | PM, PX | Later |
| 12 | Procurement & Buyout Center | Procurement log, buyout, allowances | PM, PA | Later |
| 13 | Startup Center | Startup checklist, readiness gates | Estimating, PX, PM | MVP |
| 14 | Permit & AHJ Center | Permits, AHJ contacts, postings | PM, Superintendent | MVP |
| 15 | Inspection Readiness Center | Required inspections, results, deficiencies | Superintendent, QAQC | MVP |
| 16 | Responsibility Matrix Center | Project + owner-contract responsibility matrices | PM, PX, PA | MVP |
| 17 | Subcontractor Performance Center | Scorecards, evaluations, history | PM, PX | Later |
| 18 | Lessons Learned Center | Lessons, best practices, recommendations | PX, PM | Later |
| 19 | Closeout & Warranty Center | Closeout tasks, turnover, warranty | PM, PA, PX | MVP |
| 20 | HBI Assistant | AI assistance grounded in project data | All | Later |
| (governance) | Control Center Settings / Site Health | Settings, drift, repair (§10, §19) | Admin, IT | MVP |

Per-module contract (purpose, key workflows, required lists, required libraries, required settings, external integrations, related example documents, home-page rollup contribution) is summarized below; comprehensive list-by-list specs are in §15 and example-driven seeds are in §17.

### 8.2 Prompt-to-blueprint module crosswalk

| Prompt name | Blueprint name | Resolution |
|---|---|---|
| Project Home / Command Center | Project Home / Command Center | Same. |
| Document Control Center | Document Control Center | Same. |
| Team & Access Center | Team & Access Center | Same. |
| **Project Directory / Role Center** | **Project Directory / Team Center** | Use Blueprint name. |
| Action Center | Action Center | Same. |
| Project Controls Center | Project Controls Center | Same. |
| Contract & Compliance Center | Contract & Compliance Center | Same. |
| Drawing & Model Center | Drawing & Model Center | Same. |
| Field Operations Center | Field Operations Center | Same. |
| Meeting & Communication Center | Meeting & Communication Center | Same. |
| Risk / Issues / Decision Log | Risk / Issues / Decision Log | Same. |
| Procurement & Buyout Center | Procurement & Buyout Center | Same. |
| Closeout & Warranty Center | Closeout & Warranty Center | Same. |
| Lessons Learned / Best Practices Center | Lessons Learned Center | Use Blueprint name. |
| **Settings / Site Health Center** | **Control Center Settings / Site Health** | Use Blueprint name. |
| HBI Assistant | HBI Assistant | Same. |
| (prompt missing) | Startup Center | Add. |
| (prompt missing) | Permit & AHJ Center | Add. |
| (prompt missing) | Inspection Readiness Center | Add. |
| (prompt missing) | Responsibility Matrix Center | Add. |
| (prompt missing) | Subcontractor Performance Center | Add. |

### 8.3 Module Record schema

Every module is represented as one row in the **Module Configuration** list (§15). Required fields:

`ModuleId`, `ModuleName`, `Purpose`, `PrimaryUsers`, `RequiredLists`, `RequiredLibraries`, `RequiredSettings`, `ExternalIntegrations`, `RelatedExampleDocuments`, `HomeRollupContribution`, `MvpStatus` (`MVP` / `Later`), `Visible` (boolean, gated by §4B), `LastConfiguredBy`, `LastConfiguredDate`.

---

## 9. User Experience and No-SharePoint-Admin Contract

### 9.1 Core principle

> **If a user has to leave the Project Control Center UI and use native SharePoint settings or edit screens to complete a normal project workflow, the module is not finished.**

### 9.2 Surfaces ordinary users must **not** be required to touch

- SharePoint page Edit mode
- SharePoint list settings
- SharePoint library settings
- SharePoint metadata / column configuration
- SharePoint content type screens
- Manual view creation
- Manual web part property pane edits
- Native SharePoint permissions screens
- Advanced permissions (`/_layouts/15/user.aspx`)
- Manual folder-level permission changes
- Microsoft Entra admin center

### 9.3 What user-facing configuration must use

All normal configuration is exposed through:

- Control Center Settings (§10),
- module-level settings panels,
- guided forms with validated pickers,
- role-aware actions,
- safe save / publish flows,
- repair workflows.

Settings copy uses **plain business labels**, never raw SharePoint internal field names.

### 9.4 Native SharePoint escape-hatch tiers

The product principle is preserved without pretending tenant admin functions never exist. Three tiers govern who may use native SharePoint:

| Tier | Who | Allowed native SharePoint use | Logging requirement |
|---|---|---|---|
| (a) **Ordinary users** (project team, viewers, externals) | All non-admin project users | **None.** Zero native SharePoint dependency for any normal workflow. | N/A — they should never reach native screens. |
| (b) **Project admins** (Control Center Admin, PX, PM in admin role) | Designated admins | **PCC settings only.** No native SharePoint admin screens. | Action recorded in Project Site Configuration audit. |
| (c) **IT / tenant admins (emergency repair)** | HB IT / SharePoint admins | Permitted for incident response, recovery, and repair operations the PCC does not yet expose. | **Mandatory.** Every action must be (1) logged externally (M365 audit), (2) reflected in the Project Site Health record (§19), and (3) reconciled by re-running drift detection. Unreconciled emergency changes raise a `Repair Required` finding. |

### 9.5 Non-negotiable rule

This is a **hard product principle**. PRs that satisfy a workflow only via native SharePoint admin (for ordinary or project-admin tiers) are non-conforming.

---

## 10. Control Center Settings Contract

### 10.1 Settings structure

Control Center Settings is a single governed surface. Sections:

| Section | Purpose | Allowed Roles | Records Controlled |
|---|---|---|---|
| General Project Profile | Edit project metadata fields permitted to be edited (§6) | Admin, PX | Project Profile |
| Modules & Navigation | Toggle modules visible (within §4B rules), reorder | Admin | Module Configuration |
| Team & Access | Invite, permission templates, requests | Phase-based managers (§11) | Project Team Assignments, Project Access Requests, Project Access Audit |
| Permission Templates | View/customize template attributes | Admin | Permission Template Configuration |
| Libraries & Document Areas | Toggle optional libraries, set per-library sync posture (§14.2 within bounds) | Admin | Site Configuration |
| External Integrations | Configure Procore/Sage Intacct/Compass/Document Crunch/Adobe Sign/Cupix/Teams/Outlook | Admin | Integration Configuration |
| Startup / Closeout Templates | Adjust seeded items (within governed allowlist) | Admin, PX, PM | Project Startup Tasks, Project Closeout Tasks |
| Permits & Inspections | Adjust seeded permits/inspections | Admin, PM, Superintendent | Project Permits, Project Required Inspections |
| Responsibility Matrix | Adjust matrix rows (governed) | Admin, PX, PM | Project Responsibility Matrix |
| Notifications / Escalations | Configure notification rules | Admin | Notification Rules |
| Data Validation | Run validation manually | Admin | Project Site Health |
| Site Health / Repair | View health, run repair | Admin, IT | Project Site Health |
| Template Version / Drift | View template version, drift summary | Admin, IT | Template Version Record |

### 10.2 Validation rules

Every settings save:
- validates against allowed values for the field,
- checks the user's permission against the section's allowed roles,
- writes an audit record (`who`, `when`, `before`, `after`, `reason`),
- re-runs the relevant subset of site health checks (§19).

### 10.3 Configuration tiers

Per `docs/reference/configuration/wave-0-config-registry.md`:

- **Bucket A — Infrastructure-controlled.** Template version, provisioning audit fields, system-of-record mappings. Edited only by IT / pipeline. Surfaced read-only in PCC.
- **Bucket B — Business-controlled.** Project metadata, navigation, seeded items, permission template assignments, integration toggles. Edited via PCC.

### 10.4 Project-specific vs template-level

Settings clearly mark whether they are project-specific (apply only to this site) or template-level (require ADR + new template version). Template-level changes never apply silently.

---

## 11. Team & Access Management Contract

### 11.1 Team & Access Center structure

```
Team & Access Center
├── Project Team
├── Invite User
├── Permission Templates
├── Access Requests
├── External Access Review
└── Access Audit
```

### 11.2 Global read-only access

A predefined Entra group is automatically applied to every project site at provisioning with read-only access. Members include:

- IT department,
- Vice Presidents and above,
- Executive oversight / audit users,
- Other pre-defined governance roles.

The exact Entra group object ID is an Open Decision (§22).

### 11.3 Phase-based access managers

| Phase | Roles authorized to invite users and apply approved permission templates |
|---|---|
| Preconstruction / Estimating | Estimating Coordinator, Lead Estimator, Project Executive |
| Construction | Project Executive, Project Manager, Manager of Operational Excellence |

Phase transitions are governed (§10). Outside the active phase, listed roles cannot apply templates.

### 11.4 Invite workflow

1. User opens Team & Access → **Add User**.
2. Search/select user via `HbcPeoplePicker` (`@hbc/ui-kit`, `packages/ui-kit/src/HbcPeoplePicker/`).
3. Select project role.
4. Select permission template (governed by §12).
5. Review clear access summary.
6. Confirm.
7. System validates authorization (phase-based manager check).
8. System maps template → SharePoint group(s) and adds user.
9. System writes audit record to **Project Access Audit** list.
10. System shows success/failure with reason.

The native SharePoint people picker is **not** used. The native SharePoint group selector is **not** exposed.

### 11.5 External (guest) user posture

External users are **disabled by default** at the template level. They are enabled only when **both**:

(a) a project-specific permission template explicitly allows external participants (e.g., External Design Team, Owner / Client Viewer, Subcontractor Limited Access — see §12), **and**
(b) a documented approval workflow grants the access (Admin sign-off plus audit entry plus expiration date).

External access carries:

- mandatory expiration date,
- mandatory periodic review (External Access Review surface),
- mandatory `Audit Required = true`,
- restriction to libraries/lists explicitly tagged as external-permissible.

Whether external users are permitted in the **first release** is an Open Decision (§22).

---

## 12. Permission Template Contract

### 12.1 Design intent

Users select **plain business permission templates**, never SharePoint groups directly. Behind the scenes, each template maps to one or more SharePoint groups and (where applicable) Entra groups.

### 12.2 Core SharePoint groups (provisioned on every site)

1. Project Owners / Admins
2. Project Management
3. Field Operations
4. Project Accounting
5. Safety / QAQC
6. Estimating / Preconstruction
7. Executive Oversight
8. Global Read-Only (Entra group attached)
9. External Design Team (conditional)
10. Owner / Client Viewer (conditional)
11. Subcontractor Limited Access (conditional)
12. Read-Only Visitors

Group object IDs and Entra group IDs are Open Decisions (§22).

### 12.3 Permission templates

| # | Display Name | Plain-English Description | Typical Users | Allowed Modules | Allowed Libraries | Write Capabilities | External Allowed | Approval Required | Assignable By | Mapped SharePoint Group | Mapped Entra Group | Default Expiration | Audit Required |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Project Viewer / Read Only | Read-only access to all non-restricted modules | Internal observers | All except restricted finance areas | All except `02_Contracts_and_Compliance`, `08_Project_Controls_and_Financials` | None | No | No | Phase manager | Read-Only Visitors | TBD (§22) | None | Yes |
| 2 | Project Team Member | Standard team member | PMs in support roles, coordinators | All operational | `01`, `03`, `04`, `05`, `06`, `07`, `09`, `10`, `11` | Operational lists, document upload (governed) | No | No | Phase manager | Project Management | TBD | None | Yes |
| 3 | Project Management | Full project leadership | PM, MoOE | All | All | Full operational, manage modules per §10 allowed roles | No | No | PX, MoOE, Admin | Project Management | TBD | None | Yes |
| 4 | Field Operations | Field-day workflows | Superintendent, foremen | Field Ops, Inspection Readiness, Permit & AHJ, Drawing & Model | `03`, `04`, `06`, `09` | Field operational lists | No | No | PM, MoOE | Field Operations | TBD | None | Yes |
| 5 | Project Accounting | Financial workflows | Project Accountant | Project Controls, Contract & Compliance, Procurement & Buyout | `02`, `08` | Financial lists | No | No | PA lead, Admin | Project Accounting | TBD | None | Yes |
| 6 | Safety / QAQC | Safety + quality | Safety lead, QAQC lead | Field Ops, Inspection Readiness | `04`, `06` | Safety + QAQC lists | No | No | PX, PM | Safety / QAQC | TBD | None | Yes |
| 7 | Executive Oversight | Read-only at PX+ level | PX, VP, executives | All | All | None (read-only) | No | No | Admin | Executive Oversight + Global Read-Only | TBD | None | Yes |
| 8 | External Design Team | Design partner access | Architect, engineer, consultants | Drawing & Model, Document Control, Meeting & Communication | `03`, `05`, `07` | Submittal/RFI participation only | **Yes** | **Yes** | Admin | External Design Team | External design Entra group (TBD) | 90 days (renew) | Yes |
| 9 | Owner / Client Viewer | Owner read-only | Owner, owner rep | Project Home, Document Control, Meeting & Communication | `02` (read-only), `07` (read-only), `10` (read-only) | None | **Yes** | **Yes** | Admin | Owner / Client Viewer | Owner Entra group (TBD) | 90 days | Yes |
| 10 | Subcontractor Limited Access | Subcontractor scoped access | Selected subs | Drawing & Model (limited), Submittals, RFIs, Meetings | `03` (scoped), `05` (scoped) | Submittal participation in their scope | **Yes** | **Yes** | Admin | Subcontractor Limited Access | Sub Entra group (TBD) | 60 days | Yes |
| 11 | Project Control Center Admin | Site administrator | Designated admins | All + governance | All | All settings + repair | No | No | IT, prior Admin | Project Owners / Admins | Admin Entra group (TBD) | None | Yes |

Open mappings (SharePoint group object IDs, Entra group object IDs, expirations, approval routing) are recorded in §22.

### 12.4 Template attribute schema

Every template row is a record in **Permission Template Configuration** (§15) with the columns above. Schema target identifier: `permissionTemplates[]`.

---

## 13. Standard Pages Contract

| URL | Page Purpose | Embedded Module / Webpart | Visibility | Navigation Label | Default Order | MVP / Future |
|---|---|---|---|---|---|---|
| `/SitePages/Project-Control-Center.aspx` | PCC shell home | Project Home / Command Center | All | Home | 1 | MVP |
| `/SitePages/Documents.aspx` | Document control entry | Document Control Center | All | Documents | 2 | MVP |
| `/SitePages/Team-Access.aspx` | Team & Access | Team & Access Center | Phase managers + Admin | Team | 3 | MVP |
| `/SitePages/Startup.aspx` | Startup workflows | Startup Center | All operational | Startup | 4 | MVP |
| `/SitePages/Permits-Inspections.aspx` | Permits + Inspections | Permit & AHJ + Inspection Readiness | All operational | Permits & Inspections | 5 | MVP |
| `/SitePages/Responsibilities.aspx` | Responsibility matrices | Responsibility Matrix Center | All operational | Responsibilities | 6 | MVP |
| `/SitePages/Closeout-Turnover.aspx` | Closeout + warranty | Closeout & Warranty Center | All operational | Closeout | 7 | MVP |
| `/SitePages/Settings.aspx` | Control Center Settings + Site Health | Control Center Settings / Site Health | Admin (Site Health view for IT) | Settings | 8 | MVP |
| `/SitePages/Directory.aspx` | Project directory | Project Directory / Team Center | All | Directory | 9 | MVP |
| `/SitePages/Contracts-Compliance.aspx` | Obligations + COIs + notices | Contract & Compliance Center | PM, PA, Admin | Contracts | 10 | Future |
| `/SitePages/Project-Controls.aspx` | Schedule + budget rollups | Project Controls Center | PM, PA, PX | Project Controls | 11 | Future |
| `/SitePages/Field-Operations.aspx` | Daily logs + safety | Field Operations Center | Field, Safety | Field | 12 | Future |
| `/SitePages/Meetings-Decisions.aspx` | Meeting register + decisions | Meeting & Communication Center | All | Meetings | 13 | Future |
| `/SitePages/Procurement-Buyout.aspx` | Procurement + buyout | Procurement & Buyout Center | PM, PA | Procurement | 14 | Future |
| `/SitePages/Risks-Issues-Decisions.aspx` | Risks + issues + decisions | Risk / Issues / Decision Log | All | Risk Log | 15 | Future |
| `/SitePages/Lessons-Learned.aspx` | Lessons + best practices | Lessons Learned Center | All | Lessons | 16 | Future |
| `/SitePages/HBI-Assistant.aspx` | AI assistance | HBI Assistant | All | HBI | 17 | Future |

Navigation order is governed by Control Center Settings (§10).

---

## 14. Standard Document Library Contract

### 14.1 Library set

The blueprint (§33.1) defines twelve numbered libraries. They are reproduced verbatim:

| Internal Name | Display Name | Purpose | Primary Module | Default Access | Restricted Access | Recommended Metadata | Default Views | Sync Policy | Retention / Archive | Required / Optional | Validation Rule |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `01_Project_Administration` | 01 Project Administration | General admin docs | Document Control | Project Team Member+ | None | DocCategory, DocStatus, ResponsibleRole | All; By Category; By Status | Sync Allowed | 7y, archive at closeout | Required | Must exist |
| `02_Contracts_and_Compliance` | 02 Contracts and Compliance | Prime + sub contracts, COIs | Contract & Compliance | PM, PA, Admin | Read for Executive Oversight | DocType, ContractParty, EffectiveDate, ExpirationDate, ObligationLink | All; By Contract Party; Expiring | Sync Discouraged | 10y, archive at closeout | Required | Must exist |
| `03_Drawings_and_Specifications` | 03 Drawings and Specifications | Drawings, specs, BIM | Drawing & Model | Project Team Member+ | None | Discipline, Set, RevisionNumber, IssuedDate, IsCurrent | Current Set; By Discipline; By Set | Sync Discouraged | 10y, archive at closeout | Required | Must exist |
| `04_Permits_and_Inspections` | 04 Permits and Inspections | Permits, inspection reports | Permit & AHJ + Inspection Readiness | Project Team Member+ | None | PermitType, InspectionGroup, AHJ, IssuedDate, ExpirationDate | By Permit Type; By Status; Expiring | Sync Allowed | 7y, archive at closeout | Required | Must exist |
| `05_RFIs_Submittals_and_Direction` | 05 RFIs Submittals and Direction | RFIs, submittals, ASIs | Drawing & Model + Document Control | Project Team Member+ | None | Type (RFI/Submittal/ASI), Status, RelatedSpec | By Type; By Status; My Open | Sync Discouraged | 10y, archive at closeout | Required | Must exist |
| `06_Field_Operations` | 06 Field Operations | Daily logs, photos, safety acks | Field Operations | Project Team Member+ | None | DocType, LogDate, ResponsibleRole | By Date; By Type | Sync Allowed | 7y, archive at closeout | Required | Must exist |
| `07_Meetings_and_Communications` | 07 Meetings and Communications | Meetings, minutes, comms | Meeting & Communication | Project Team Member+ | None | MeetingType, MeetingDate | By Type; By Date | Sync Allowed | 7y, archive at closeout | Optional | Validate if module enabled |
| `08_Project_Controls_and_Financials` | 08 Project Controls and Financials | Pay apps, cost reports, change events | Project Controls + Procurement & Buyout | Project Accounting + PM + PX | Read-only for Executive Oversight | DocType, PeriodEnd, FinancialCategory | By Category; By Period | **Sync Blocked** | 10y, archive at closeout | Optional | Validate if module enabled |
| `09_Photos_Videos_and_Reality_Capture` | 09 Photos Videos and Reality Capture | Photos, videos, Cupix exports | Drawing & Model + Field Operations | Project Team Member+ | None | CaptureDate, Source (Cupix/Manual), Location | By Date; By Source | **Sync Discouraged** (large media) | 10y, archive at closeout | Optional | Validate if module enabled |
| `10_Closeout_and_Turnover` | 10 Closeout and Turnover | O&M, warranties, attic stock, final survey | Closeout & Warranty | PM, PA, Admin | Owner read at handover | DocType, TurnoverStatus | By Type; By Status | Sync Allowed | 10y after warranty end | Required | Must exist |
| `11_Lessons_Learned_and_Reports` | 11 Lessons Learned and Reports | Recap, lessons, evaluations | Lessons Learned | PX, PM | None | ReportType, Phase | By Type | Sync Allowed | 10y | Optional | Validate if module enabled |
| `99_Archive` | 99 Archive | Archived items | Document Control | Admin | Read-only for all | ArchivedDate, ArchivedBy | All | **Sync Blocked** | indefinite | Required | Must exist |

### 14.2 Sync-Risk Policy

Three sync values:

- **Sync Allowed** — `Add to OneDrive` permitted; `Add shortcut to OneDrive` permitted.
- **Sync Discouraged** — `Add to OneDrive` permitted with warning; `Add shortcut to OneDrive` discouraged. Surfaced in PCC with a "consider not syncing" hint.
- **Sync Blocked** — Sync UI hidden in PCC; SharePoint-level sync access removed where possible. `08_Project_Controls_and_Financials` and `99_Archive` are Sync Blocked. (Native SharePoint may still expose sync if a user navigates outside the PCC; emergency repair tier (§9.4) reconciles this through Site Health.)

### 14.3 `Add shortcut to OneDrive`

Default posture: **discouraged** for all libraries. **Blocked** for `02_Contracts_and_Compliance`, `08_Project_Controls_and_Financials`, and `99_Archive`. The final allowlist of libraries permitted for shortcut + sync is recorded as Open Decision (§22).

### 14.4 Large media handling

`09_Photos_Videos_and_Reality_Capture`:

- sync discouraged (large media risks OneDrive client storage exhaustion),
- prefer Cupix-hosted reality capture for spatial content,
- prefer Stream / Microsoft 365 video surfaces for video,
- treat the SharePoint library as authoritative metadata + optional asset store, not the primary playback surface.

### 14.5 Folder permissions policy

Unique folder-level permissions are **prohibited** except in **controlled exceptions**. An exception requires:

1. a documented justification recorded on the library's configuration record,
2. named approval from a Control Center Admin and IT,
3. an entry in the **Project Site Configuration** audit,
4. inclusion in the next site health drift report.

Anything else is treated as drift and surfaced in §19 (severity `Security Risk` for libraries `02` and `08`; severity `Warning` elsewhere unless the inheritance break is on a financial / contracts library, which escalates to `Security Risk`).

### 14.6 Anti-monolith policy

A single sprawling `Documents` library is prohibited. Project-content separation is by lifecycle, access profile, sync risk, and functional purpose, as expressed by the twelve libraries above.

---

## 15. Standard SharePoint List Contract

### 15.1 Data ownership tags

Every list group in this section carries a **Data Ownership** tag. Default rule:

- project-operational data → **Site-local** (lives in this project site),
- cross-project rollups and registries → **HBCentral** (lives in `docs/reference/sharepoint/list-schemas/hbcentral/`),
- provisioning audit, template metadata → **Backend storage** (`backend/functions/`),
- transactional financial / RFI / signed-document data → **External system of record** (Procore / Sage Intacct / Compass / Document Crunch / Adobe Sign / Cupix / Teams / Outlook).

Unresolved cases (e.g., closeout, lessons learned, subcontractor performance, access audit centralization) are recorded as Open Decisions (§22).

### 15.2 Core / Governance lists (Data Ownership: Site-local + HBCentral)

| List | Purpose | Owning Module | Required Fields | Optional Fields | Default Views | Seeded Data | Permission Scope | Workflow Triggers | Related Libraries / Integrations | MVP / Future | Validation Rule | Data Ownership |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Project Profile | Single project-metadata record | Project Home | All §6.1 fields | All §6.2 fields | Default | One row per site | Read: all; Write: Admin, PX | On change → audit | All | MVP | Exactly one row | Site-local |
| Project Roles | Catalog of roles + abbreviations | Project Directory | RoleId, RoleName, Abbreviation, Active | Description | Default | PX, Sr. PM, PM2, PM1, PA, Superintendent, QAQC, Project Accountant, etc. | Read: all; Write: Admin | None | None | MVP | At least defaults | Site-local |
| Project Team Assignments | Person ↔ role ↔ permission template | Team & Access | Person, RoleId, PermissionTemplate, EffectiveDate | EndDate, Notes | By Role; By Person | None | Read: all; Write: phase managers | On invite → audit | None | MVP | Validates on invite | Site-local |
| Project Access Requests | External access requests | Team & Access | Requester, RequestedTemplate, Reason, Status, RequestedDate, ApprovedBy, ApprovedDate, Expiration | Notes | Pending; Recent | None | Read: phase managers + Admin; Write: phase managers | On approval → audit | None | MVP | Status enum | Site-local |
| Project Access Audit | Immutable invite/change/repair audit | Team & Access | Action, Person, RoleId, PermissionTemplate, ActorUpn, Timestamp, Reason, BeforeState, AfterState | Notes | By Date; By Actor | None | Read: Admin, IT; Write: system only | On every access change | None | MVP | Append-only | Site-local + mirror to HBCentral (TBD §22) |
| Project Site Configuration | Toggles + per-site settings | Settings | ConfigKey, ConfigValue, ConfigBucket (A/B), LastModifiedBy, LastModifiedDate | Notes | All; By Bucket | Defaults | Read: all; Write: Admin | On change → audit | None | MVP | Bucket A read-only to non-IT | Site-local |
| Module Configuration | Per-module settings | Settings | ModuleId, Visible, MvpStatus, DependentLists, DependentLibraries, IntegrationsRequired, LastConfiguredBy, LastConfiguredDate | Notes | By Module | One row per module | Read: all; Write: Admin | On change → audit | None | MVP | One row per module | Site-local |
| Permission Template Configuration | Template attributes | Settings | TemplateId, DisplayName, Description, AllowedModules, AllowedLibraries, WriteCapabilities, ExternalAllowed, ApprovalRequired, AssignableBy, MappedSpGroup, MappedEntraGroup, DefaultExpiration, AuditRequired | Notes | By Template | 11 templates from §12 | Read: all; Write: Admin | On change → audit | None | MVP | All 11 present | Site-local + mirror reference to HBCentral catalog (TBD) |
| Integration Configuration | Per-integration settings | Settings | IntegrationId, Status, ProjectMappingValue, BaseUrl, ConfiguredBy, ConfiguredDate, LastHealthCheck, LastHealthResult | Notes | By Integration | One row per §18 integration | Read: all; Write: Admin | On configure → audit | All §18 | MVP | Eight rows (or per project type per §4B) | Site-local |
| Project Site Health | Site health record + checks | Settings | CheckId, CheckName, State, Severity, LastChecked, Detail, RepairAvailable | RepairAction | By State; By Severity | One row per check | Read: Admin, IT; Write: system + repair flow | On run → audit | None | MVP | All required checks present | Site-local |
| Template Version Record | This site's template version + drift | Settings | TemplateVersion, ProvisionedAt, LastDriftCheck, DriftSummary | Notes | Default | One row | Read: Admin, IT | On drift run → audit | None | MVP | One row | Site-local |
| Project Links | Curated quick links | Project Home | LinkName, Url, Category, Order | Description | By Category | None | Read: all; Write: Admin, PM | None | None | MVP | None | Site-local |

### 15.3 Action / Risk / Communication lists (Data Ownership: Site-local)

| List | Owning Module | Required Fields | Seeded | MVP / Future | Notes |
|---|---|---|---|---|---|
| Project Action Items | Action Center | §16 baseline + ActionType | None | Future | Cross-module rollup. |
| Project Decisions | Risk / Issues / Decision Log | §16 baseline + DecisionType, DecisionMakers | None | Future | |
| Project Issues | Risk / Issues / Decision Log | §16 baseline + IssueImpact | None | Future | |
| Project Risks | Risk / Issues / Decision Log | §16 baseline + Likelihood, Impact, MitigationPlan | None | Future | |
| Meeting Register | Meeting & Communication | §16 baseline + MeetingType, MeetingDate, Attendees | None | Future | |
| Meeting Action Items | Meeting & Communication | §16 baseline + RelatedMeeting | None | Future | |
| Notification Rules | Settings | RuleId, Trigger, Audience, Channel, Active | None | Future | |

### 15.4 Startup lists (Data Ownership: Site-local; seeds derived from §17.1, §17.2)

| List | Required Fields | Seeded | MVP / Future |
|---|---|---|---|
| Project Startup Tasks | §16 baseline + TaskNumber, Section, Subsection | Yes (§17.1) | MVP |
| Startup Gate Checklist | §16 baseline + GateName, GateStage | Yes (Owner Contract Review, Job Start-up, Order Services & Equipment, Permits Posted) | MVP |
| Project Services and Equipment | §16 baseline + ServiceType, Vendor | Yes (Telephone/Internet, Sanitary, Field Office, Job Trailer, First Aid, Fire Extinguishers) | MVP |
| Preconstruction Meeting Log | §16 baseline + MeetingType (AHJ / Owner / Subcontractor / Internal), HeldDate | None | MVP |

### 15.5 Permits / Inspections lists (Data Ownership: Site-local)

| List | Required Fields | Seeded | MVP / Future |
|---|---|---|---|
| Project Permits | §16 baseline + PermitType, Location, PermitNumber, Description, ResponsibleContractor, Address, DateRequired, DateSubmitted, DateReceived, DateExpires, AHJ, Comments | Yes (§17.3 categories) | MVP |
| Project Required Inspections | §16 baseline + InspectionGroup, InspectionCode, DateCalledIn, ScheduledDate, Result, Comments, VerifiedOnline, BlocksCoverUp, BlocksCO_TCO, BlocksCloseout | Yes (§17.4 groups) | MVP |
| Inspection Results | §16 baseline + RelatedInspection, Result (Approved/Failed/Partial), VerifiedOnline | None | MVP |
| AHJ Contacts | §16 baseline + AhjName, ContactName, Phone, Email, Jurisdiction | Optional seed by region | MVP |
| Permit Closeout Requirements | §16 baseline + RequirementCategory | Yes (§17.4) | MVP |
| Inspection Deficiencies | §16 baseline + RelatedInspection, DeficiencyCategory | None | MVP |
| Corrective Actions | §16 baseline + RelatedDeficiency | None | MVP |

### 15.6 Contracts / Compliance lists (Data Ownership: Site-local with cross-references to HBCentral and external systems)

| List | Required Fields | Data Ownership Notes | MVP / Future |
|---|---|---|---|
| Contract Obligation Register | §16 baseline + ContractArticle, Page, ResponsibleParty (Owner/AE/Contractor), Obligation, TriggerEvent, ResponsibleHbRole, EvidenceRequirement | Site-local; sync to Document Crunch optional | Future |
| Owner Contract Responsibility Matrix | §16 baseline + ContractArticle, Page, ResponsibleParty, Obligation, TriggerEvent, ResponsibleHbRole, EvidenceRequirement | Site-local | Future |
| Insurance and COI Register | §16 baseline + Party, Type, EffectiveDate, ExpirationDate | Site-local | Future |
| Bonding and SDI Register | §16 baseline + Type, BondNumber, BondAmount, Issuer | Site-local | Future |
| Notice Register | §16 baseline + NoticeType, IssuedDate, RecipientParty | Site-local | Future |
| Adobe Sign Envelope Tracker | §16 baseline + EnvelopeId, Status, Signers, CompletedDate | External system of record (Adobe Sign); list mirrors metadata | Future |
| Document Crunch Review Tracker | §16 baseline + WorkspaceId, Status, ReviewSummary | External system of record (Document Crunch) | Future |

### 15.7 Project Controls lists (Data Ownership mixed)

| List | Required Fields | Data Ownership | MVP / Future |
|---|---|---|---|
| Project Milestones | §16 baseline + MilestoneType, TargetDate, ActualDate | Site-local | Future |
| Procurement Log | §16 baseline + PackageName, Status, BuyoutTarget | Site-local; cross-ref Procore | Future |
| Buyout Log | §16 baseline + Vendor, Amount, ExecutedDate | Site-local; cross-ref Sage Intacct | Future |
| Allowance Log | §16 baseline + AllowanceCategory, Amount | Site-local | Future |
| Change Event Summary | §16 baseline + ChangeEventNumber, Status, Amount | External SoR (Procore); local mirror | Future |
| Pay Application Tracker | §16 baseline + PeriodEnd, Status, Amount | External SoR (Sage Intacct); local mirror | Future |
| Financial Reporting Checklist | §16 baseline + ReportName, PeriodEnd, Status | Site-local | Future |
| Cost Variance Report | §16 baseline + Period, Variance, Notes | Site-local | Future |

### 15.8 Documents lists (Data Ownership mixed)

| List | Data Ownership | MVP / Future |
|---|---|---|
| Document Register | Site-local | Future |
| Drawing Register | Site-local; cross-ref Procore Drawings | Future |
| Submittal Register | External SoR (Procore); local mirror | Future |
| RFI Register | External SoR (Procore); local mirror | Future |
| As-Built Tracker | Site-local | Future |
| Closeout Document Register | Site-local | MVP |

### 15.9 Field / Safety / QAQC lists (Data Ownership: Site-local)

`Field Readiness Tasks`, `QAQC Checklist`, `Safety Plan Acknowledgements`, `SDS Register`, `Inspection Deficiencies`, `Corrective Actions`. All Site-local. MVP partial (Safety Plan Acknowledgements + SDS Register MVP; rest Future).

### 15.10 Subcontractors lists (Data Ownership: Site-local + HBCentral mirror)

| List | Data Ownership | MVP / Future |
|---|---|---|
| Subcontractor Evaluations | Site-local; mirror to HBCentral subcontractor performance registry (TBD §22) | Future |
| Subcontractor Evaluation Criteria | Site-local; reference catalog from HBCentral | Future |
| Subcontractor Performance History | HBCentral (cross-project) | Future |
| Subcontractor Rebid Recommendations | Site-local; cross-ref Compass | Future |

### 15.11 Closeout / Turnover lists (Data Ownership: Site-local; ownership of closeout summary unresolved §22)

`Project Closeout Tasks` (MVP), `Turnover Package Items` (MVP), `Warranty Items`, `OM Manual Tracker`, `Attic Stock Tracker`, `Lien and Final Payment Watchlist` (MVP).

### 15.12 Knowledge Capture lists (Data Ownership unresolved)

`Project Lessons Learned` — Site-local with mirror to HBCentral lessons-learned registry (TBD §22). `Best Practices Library` — HBCentral. `Process Improvement Recommendations` — HBCentral.

---

## 16. Common List Schema Pattern

Every operational list inherits these baseline fields unless explicitly overridden.

### 16.1 Baseline fields

`ProjectId`, `ProjectNumber`, `ProjectName`, `ItemNumber`, `Title`, `Category`, `Description`, `Status`, `Priority`, `ResponsibleRole`, `ResponsiblePerson`, `DueDate`, `CompletedDate`, `CompletedBy`, `EvidenceLink`, `EvidenceLibrary`, `EvidenceDocumentId`, `EvidenceStatus`, `RelatedModule`, `RelatedSystem`, `SourceTemplate`, `SourceTemplateVersion`, `CreatedBy`, `CreatedDate`, `ModifiedBy`, `ModifiedDate`.

### 16.2 Status enum

`Not Started`, `In Progress`, `Blocked`, `Pending Review`, `Complete`, `N/A`, `Cancelled`.

### 16.3 Priority enum

`Low`, `Normal`, `High`, `Critical`.

### 16.4 Ownership rule

Operational lists own task / status data. **Document Control owns files, evidence storage, and document metadata.** Lists reference documents via `EvidenceLink` / `EvidenceLibrary` / `EvidenceDocumentId`, not by storing duplicates.

### 16.5 Naming rule

Internal field names are stable identifiers. **PCC UI never displays internal field names.** It always renders the plain business label defined per list.

---

## 17. Seeded Workflow Templates from Example Documents

Each `docs/reference/example/` source converts into one or more lists' seeded data. Field names and categories are extracted from the example documents.

### 17.1 Project Startup Checklist → seeded

**Maps to:** Project Startup Tasks, Startup Gate Checklist, Field Readiness Tasks, Contract Obligation Register, Permit & AHJ Center, Project Controls Center.

**Seeded sections (with examples):**

1. **Review Owner's Contract:** split savings clause; liquidated damages; special terms; allowances. Status options: `N/A` / `Yes` / `No`.
2. **Job Start-up:** bonding / SDI; bond applications; accounting setup; Procore setup; estimating turnover; budget rolls (Sage Estimating → Accounting → Procore); project signs; drawings in Procore; owner contract with SOV / Pay app; subcontractor COIs; owner certificate of insurance; Notice of Commencement; job files setup; management / logistics plan; project schedule; submittal register; closeout setup; preconstruction meetings (AHJ, owner); threshold / testing company; photo / video surveys; vibration monitoring; subcontracts; buyout tracking; Notice to Owner with Outlook reminder; Notice to Owner; Builder's Risk insurance; safety plan / SDS delivery.
3. **Order Services & Equipment:** Telephone / Internet; Sanitary; Field Office; Job Trailer; First Aid Kit / Fire Extinguishers.
4. **Permits Posted on Jobsite:** Master; Roofing; Plumbing; HVAC; Electrical; Fire Alarm; Fire Sprinklers; Elevator; Irrigation; Low Voltage; Site-Utilities (Drainage / Water / Sewer); Right-of-way / FDOT / MOT plans.

**Per task:** `Task Number`, `Section`, `Description`, `Status` (`N/A` / `Yes` / `No`), `ResponsibleRole`, `Evidence Link`, `Completed Date`, `Completed By`.

### 17.2 Project Closeout Checklist → seeded

**Maps to:** Project Closeout Tasks, Closeout Document Register, Turnover Package Items, Lien and Final Payment Watchlist, Subcontractor Evaluations, Lessons Learned.

**Seeded categories:**

1. **Tasks:** RFI closure; Submittal approval; Change order approval; As-built requests.
2. **Document Tracking:** Soil investigation; Termite letter; Insulation certificate; Form board survey; Tie-in survey; Final survey / elevation cert; Fire-treated lumber letter; Fire alarm monitoring letter; Structural engineer cert.
3. **Inspections:** Plan changes approved; Health dept approval (water / sewer); Utility approval; Demo / Plumbing / HVAC / Electrical / Fire Alarm / Fire Sprinkler / Building finals; Pre-CO checklist; CO / CC.
4. **PBC Closeout Requirements:** Soil bearing capacity; Foundation density test; Form board survey; Termite pre-/post-treatment; Shoring reports; Structural cert; Fire main pressure test; Final survey; Insulation certs; Intumescent fire coating; Plenum door cert; All inspections "Approved" / "Passed"; Partial finals.
5. **Turnover:** CO to owner; Punch list meeting / completion; As-built drawings; Turnover meeting; Sub list / warranties; Maintenance manuals; Attic stock; Letter of appreciation.
6. **Post Turnover:** Final payment letter (if unpaid); Lien filing (88-day trigger); 6-month photos; Owner recommendation letter; File return to estimator. **80-day warning** and **88-day lien deadline** are mandatory milestones (Lien and Final Payment Watchlist).
7. **PX Closeout Documents:** Closeout checklist; Project recap form; Subcontractor evaluation form; Cost variance report; Lessons learned submission.

**Per item:** `Task Number`, `Description`, `Required / Conditional / N/A`, `ResponsibleRole`, `Evidence Required`, `Evidence Link`, `Related System`, `Completion tracking`.

### 17.3 Permit Log Template → seeded Project Permits

**Per row fields:** `PermitType`, `Location` / `Building` / `Area`, `PermitNumber`, `Description`, `ResponsibleContractor`, `Address`, `DateRequired`, `DateSubmitted`, `DateReceived`, `DateExpires`, `Status`, `AHJ`, `Comments`.

**Seeded permit types:** Master, Roofing, Plumbing, HVAC, Electrical, Fire Alarm, Fire Sprinklers, Elevator, Irrigation, Low Voltage, Site-Utilities (Drainage / Water / Sewer), Right-of-way / FDOT / MOT plans. (Per project type, per §4B.)

### 17.4 Required Inspections List → seeded

**Maps to:** Project Required Inspections, Inspection Results, Inspection Deficiencies, Corrective Actions, Closeout Readiness.

**Per row fields:** `InspectionGroup`, `InspectionCode`, `DateCalledIn`, `ScheduledDate`, `Result`, `Comments`, `VerifiedOnline`, `BlocksCoverUp`, `BlocksCO_TCO`, `BlocksCloseout`.

**Seeded inspection groups (verbatim from blueprint):** NOC / recorded; fire preliminary; civil preliminary; landscape preliminary; elevation certification; building footer; slab; filled cells; tie beams; waterproofing; door / window bucks; storefront; truss; wall sheathing; drywall; framing; fire penetration; insulation; low voltage; fire alarm; fire sprinkler; high voltage electrical; mechanical; plumbing; tree removal; irrigation; storm drainage; site wall / fencing; dumpster enclosure; exterior light poles; awnings; patio pavers; landscaping; asphalt paving; roofing.

### 17.5 Responsibility Matrix → seeded Project Responsibility Matrix

**Maps to:** Project Responsibility Matrix, Project Roles, Project Action Items, My Responsibilities, Team & Access Center.

**Per row fields:** `Workstream`, `Task / Responsibility`, `Primary Role`, `Primary Person`, `Support Roles`, `Support People`, `Sign-Off Role`, `Frequency`, `Due Rule`, `Related Module`, `Active`, `Notes`.

**Seeded role columns** (from the example workbook): PX, Sr. PM, PM2, PM1, PA, QAQC, Project Accountant.

### 17.6 Owner Contract Responsibility Matrix → seeded

**Maps to:** Contract Obligation Register, Owner Contract Responsibility Matrix, Action Center, Risk Register, Document Crunch Review Tracker.

**Per row fields:** `ContractArticle`, `Page`, `ResponsibleParty` (`Owner` / `Architect-Engineer` / `Contractor`), `Obligation`, `TriggerEvent`, `ResponsibleHbRole`, `EvidenceRequirement`.

### 17.7 Subcontractor Scorecard → seeded

**Maps to:** Subcontractor Evaluations, Subcontractor Evaluation Criteria, Subcontractor Performance History, Subcontractor Rebid Recommendations, Procurement & Buyout Center, Compass Integration.

**Categories and weights (verbatim):**

| Category | Weight |
|---|---|
| Safety & Compliance | 20% |
| Quality of Work | 20% |
| Schedule Performance | 20% |
| Cost Management | 15% |
| Communication & Management | 15% |
| Workforce & Labor | 10% |

### 17.8 Lessons Learned Report → seeded

**Maps to:** Project Lessons Learned, Best Practices Library, Process Improvement Recommendations, HBI Assistant.

**Categories (verbatim):** Pre-Construction; Estimating & Bid; Procurement; Schedule; Cost / Budget; Safety; Quality; Subcontractors; Design / RFIs; Owner / Client; Technology / BIM; Workforce / Labor; Commissioning; Closeout / Turnover; Other.

**Impact magnitude thresholds:** `Minor`, `Moderate`, `Significant`, `Critical`.

---

## 18. External Integration Contract

| Integration | Purpose | Project Mapping Field | Expected URL Field | Module Usage | Sync Direction | System of Record | Phase | Required / Optional | Configuration Owner | Health Check |
|---|---|---|---|---|---|---|---|---|---|---|
| Procore | RFIs, submittals, drawings/specs, change events, daily logs, inspections, directory, commitments, punch, schedule | `Procore Project ID` | `https://app.procore.com/{tenant}/projects/{id}` | Drawing & Model, Document Control, Project Controls, Field Operations | Reads from Procore; selective writes (future) | Procore | Construction | Required (Active Construction) | Admin | Verify project mapping resolves |
| Sage Intacct | Job setup, budget, cost reporting, commitments, pay apps, invoices, final payment | `Sage Intacct Project ID` | (system URL) | Project Controls, Procurement & Buyout, Closeout | Reads from Sage Intacct | Sage Intacct | All | Required | Admin (with Accounting) | Verify project mapping resolves |
| Compass | Subcontractor prequalification, vendor profile, trade capacity, performance history | `Compass Project ID` | (system URL) | Procurement & Buyout, Subcontractor Performance | Reads | Compass | Construction | Optional | Admin | Verify mapping |
| Document Crunch | Prime contract review, subcontract review, obligation extraction, risk clauses, notice requirements | `Document Crunch Project / Workspace ID` | (system URL) | Contract & Compliance | Reads + outbound triggers | Document Crunch | Preconstruction → Construction | Optional | Admin | Verify mapping |
| Adobe Sign | Prime / subcontract execution, change order signatures, lien releases | `Adobe Sign Workspace / Account Mapping` | (system URL) | Contract & Compliance, Procurement & Buyout, Closeout | Outbound + inbound webhook | Adobe Sign | All | Required (Active Construction) | Admin | Verify webhook + mapping |
| Cupix | Existing conditions, progress capture, turnover / warranty visual records, location-based context | `Cupix Project ID` | (system URL) | Drawing & Model, Field Operations, Closeout & Warranty | Reads | Cupix | Construction → Warranty | Required (Luxury Residential); Optional otherwise | Admin | Verify project resolves |
| Microsoft Teams | Project communication, channel/team for project | `Teams Channel / Team ID` | `https://teams.microsoft.com/...` | Meeting & Communication | None (link-out) | Teams | All | Optional | Admin | Verify channel resolves |
| Outlook Calendar | Meetings, calendar reminders (e.g., 80-day NTO reminder) | (mapping per user) | (per user) | Meeting & Communication, Closeout | None (link-out) | Outlook | All | Optional | Admin (configure reminders) | Verify rules saved |

---

## 19. Site Health, Drift Detection, and Repair Contract

### 19.1 Required checks

```
- site exists
- site metadata applied
- required pages exist
- required libraries exist
- required lists exist
- required fields exist
- required views exist
- Project Control Center app installed
- module configuration exists (one row per module)
- permission groups exist (12 core)
- global read-only group applied
- project team assignments valid
- external integration placeholders exist
- template version current
- no unauthorized permission breakage (libraries 02, 08 in particular)
- no missing navigation nodes
- no broken webpart bindings
- emergency repair (§9.4 tier c) reconciled
```

### 19.2 Health states

`Healthy`, `Warning`, `Drift Detected`, `Repair Available`, `Repair Required`, `Provisioning Error`.

### 19.3 Drift severity classification

| Severity | Meaning | Operator behavior |
|---|---|---|
| `Info` | Cosmetic or informational; no action required | Recorded; no alert |
| `Warning` | Drift not impacting workflow correctness | Recorded; surfaced to Admin in Settings |
| `Blocking` | A required surface is missing; users cannot perform a normal workflow | Alert Admin + IT; repair offered |
| `Security Risk` | Permission inheritance broken on a sensitive library, or unauthorized external grant | Alert Admin + IT immediately; high-priority audit; repair required before any normal use |
| `Repair Required` | Required template element missing or wrong | Repair must be run |

### 19.4 Worked examples

| Drift example | Severity |
|---|---|
| Cosmetic title typo on a page | `Info` |
| Missing navigation label on a Future-tier module | `Warning` |
| Missing required field on a required list | `Repair Required` |
| Missing Project Control Center page | `Blocking` |
| Permission inheritance broken on `02_Contracts_and_Compliance` | `Security Risk` |
| Permission inheritance broken on `08_Project_Controls_and_Financials` | `Security Risk` |
| Permission inheritance broken on `06_Field_Operations` | `Warning` |
| Unauthorized folder-level permission grant | `Security Risk` |
| Missing required list `Project Profile` | `Blocking` |
| Missing required permission group | `Repair Required` |
| Drift caused by IT emergency repair (§9.4 tier c) not reconciled | `Repair Required` |

### 19.5 Repair actions

```
- recreate missing list
- recreate missing library
- add missing field
- recreate missing view
- reseed module configuration
- repair page / app binding
- restore navigation
- reapply global read-only group
- repair permission inheritance
- generate diagnostics bundle
```

Repair actions are role-gated (Admin + IT) and audited. Security Risk findings require IT acknowledgement before repair runs.

---

## 20. Provisioning Validation Contract

### 20.1 Stages (numbered, sequenced)

1. Site Created
2. Site Metadata Applied
3. Libraries Created
4. Lists Created
5. Fields Created
6. Pages Created
7. Project Control Center Installed
8. Default Configuration Seeded
9. Permission Groups Created
10. Global Read-Only Group Applied
11. Project Team Roles Seeded
12. External Integration Placeholders Created
13. Workflow Templates Seeded (per §17)
14. Site Health Record Created
15. Final Validation Passed

A failure at any stage halts subsequent stages and produces a Provisioning Error with the failed stage recorded.

### 20.2 Provisioning audit fields

`ProvisioningRunId`, `ProjectId`, `ProjectNumber`, `SiteUrl`, `TemplateVersion`, `TriggeredBy`, `TriggeredFrom`, `StartedAt`, `CompletedAt`, `Status`, `ValidationSummary`, `FailureReason`, `RepairAvailable`.

### 20.3 Implementation seam

The implementing service is `backend/functions/src/services/sharepoint-provisioning-service.ts`. Existing functions used:

`createSite()`, `documentLibraryExists()`, `createDataLists()`, `uploadTemplateFiles()`, `installWebParts()`, `setGroupPermissions()`, `assignGroupToPermissionLevel()`, `associateHubSite()`, `writeAuditRecord()`.

Provisioning audit records are owned by **Backend storage** (Data Ownership). The Project Site Health record on the site mirrors the latest summary.

---

## 21. MVP Template Contract

The first release of the template must include the following.

### 21.1 MVP modules

Project Home / Command Center; Team & Access Center; Document Control Center; Project Directory / Team Center; Startup Center; Permit & AHJ Center; Inspection Readiness Center; Responsibility Matrix Center; Closeout & Warranty Center; Control Center Settings / Site Health.

### 21.2 MVP libraries

`01_Project_Administration`, `02_Contracts_and_Compliance`, `03_Drawings_and_Specifications`, `04_Permits_and_Inspections`, `05_RFIs_Submittals_and_Direction`, `06_Field_Operations`, `10_Closeout_and_Turnover`, `99_Archive`.

### 21.3 MVP lists

Project Profile; Project Roles; Project Team Assignments; Project Access Requests; Project Access Audit; Project Site Configuration; Project Site Health; Project Startup Tasks; Project Permits; Project Required Inspections; Project Responsibility Matrix; Project Closeout Tasks; Project Links.

### 21.4 MVP integrations

Procore (placeholder + project mapping), Sage Intacct (placeholder + project mapping), Adobe Sign (placeholder for Active Construction).

### 21.5 MVP boundaries

- Action Center, Project Controls Center, Contract & Compliance Center, Drawing & Model Center, Field Operations Center, Meeting & Communication Center, Risk / Issues / Decision Log, Procurement & Buyout Center, Subcontractor Performance Center, Lessons Learned Center, HBI Assistant: **Future** (modules created with empty/disabled state where required by Object Catalog, per §4B rules; UI hidden).
- Library `08_Project_Controls_and_Financials`, `09_Photos_Videos_and_Reality_Capture`, `07_Meetings_and_Communications`, `11_Lessons_Learned_and_Reports`: **Future** (created at provisioning if module enables them; otherwise skipped).
- External users (External Design Team, Owner / Client Viewer, Subcontractor Limited Access templates): **Future / Open Decision** (§22).

---

## 22. Open Decisions / Architecture Freeze Items

The 11 open decisions from the blueprint plus new items raised here. Any item below must be resolved before the listed scope is treated as "frozen."

### 22.1 Carried forward from the PCC Blueprint

1. Final project site URL naming convention (Candidate A vs B in §5.1).
2. Whether each project site connects to a Microsoft 365 Group / Teams team.
3. Standard external-user policy by project type.
4. Whether owner / client access is allowed in the first release.
5. Whether subcontractor access is allowed in the first release.
6. Whether permission templates map to SharePoint groups, Entra groups, or both.
7. How project phase is controlled and updated.
8. Which external systems are launch-link-only in the first release.
9. Which lists are per-project-site vs HBCentral-only.
10. Whether closeout / lessons / subcontractor performance data syncs to a central enterprise repo.
11. Whether HBI Assistant is enabled in MVP or deferred.

### 22.2 New from this contract

12. Final mapped SharePoint group object IDs for each of the 12 core groups (§12.2).
13. Final mapped Entra group object IDs for permission templates that require external groups (§12.3).
14. Final default expirations for non-external permission templates (§12.3).
15. Approval routing for external permission templates (Admin sign-off path).
16. Final allowlist of libraries permitted for OneDrive sync and `Add shortcut to OneDrive` (§14.3).
17. Whether unique folder-level permissions on `02_Contracts_and_Compliance` are ever permitted (§14.5).
18. Final Data Ownership decisions for: closeout summary, lessons learned, subcontractor performance history, project access audit (Site-local vs HBCentral mirror) (§15.1).
19. Whether external (guest) users are permitted in **first release** and which permission templates may grant external access (§11.5).
20. Final canonical project-type enum values (§4B.1).
21. Per-project-type integration requirements (§4B.2): which integrations are conditional vs always-on for each type.
22. Final Template Version numbering convention (SemVer is repo standard; document any deviation).
23. Archive / retention policy specifics per library (current values are recommendations).
24. Repair automation scope: which repairs run automatically vs require IT acknowledgement.
25. Required Microsoft Graph application permissions for provisioning under `HB SharePoint Creator` (delegated vs application-only boundaries).

---

## 23. Implementation Roadmap

| Phase | Objective | Primary Outputs | Acceptance Criteria | Risks | Dependencies |
|---|---|---|---|---|---|
| **0 — Architecture Contract Freeze** | Lock §1–§24 of this doc | Approved markdown; resolved Open Decisions §22 to the extent required for MVP | All MVP-relevant Open Decisions resolved or scoped as deferred | Open decisions remain ambiguous → block | Blueprint approval |
| **1 — Template Schema and Provisioning Baseline** | Extract machine-readable schema | `packages/project-site-template/template-contract.json`; `packages/project-site-template/schemas/`; provisioning baseline in `backend/functions/` | §24 acceptance criteria met; site provisions successfully end-to-end with MVP set | Schema drift from this doc | Phase 0; backend service surface |
| **2 — Project Control Center Shell** | Build PCC shell | `apps/project-control-center/` (`@hbc/spfx-project-control-center`); §7 regions implemented MVP-tier | All MVP shell regions render; navigation works; Site Health badge live | Shell perf at scale | Phase 1; `@hbc/ui-kit` (`HbcPeoplePicker`) |
| **3 — Team & Access Center** | Implement governed team & access | Invite workflow; permission template apply; audit; phase-based managers | §11 invite workflow runs end-to-end; audit records every action | Group mapping unknown (Open Decision 12, 13) | Phase 2; group ID resolution |
| **4 — Document Control Center** | Implement DCC | `apps/document-control-center/` (`@hbc/spfx-document-control-center`); MVP libraries; governed upload + register | Users use DCC for all document workflows on MVP libraries; no native library settings reach | Sync policy enforcement boundary | Phase 2 |
| **5 — Startup / Permits / Inspections / Closeout MVP Modules** | Implement MVP §21.1 modules | Startup Center, Permit & AHJ, Inspection Readiness, Closeout & Warranty | Seeded data from §17 visible; users complete end-to-end without native admin | Drift between example seed + actual fields | Phase 4 |
| **6 — Responsibility Matrix and Action Center** | Implement Responsibility Matrix; introduce Action Center | Project Responsibility Matrix; Action rollups | My Responsibilities surface populated | Cross-module rollup logic | Phase 5 |
| **7 — Contract / Compliance / Procurement / Subcontractor Performance** | Move from MVP into next-tier modules | Contract Obligation Register (with Document Crunch + Adobe Sign), Procurement & Buyout, Subcontractor Performance Center | Integration mappings live; Document Crunch reviews appear; Adobe Sign envelopes track | External system access; mapping decisions | Phase 6; integration approvals |
| **8 — Lessons Learned / Best Practices / HBI Assistant** | Knowledge capture | Lessons Learned Center; HBI Assistant grounded in project lists | Lessons saved + searchable; HBI returns project-grounded answers | LLM grounding scope | Phase 7 |
| **9 — External Integration Deepening** | Sync past placeholder | Selective Procore writes; Sage Intacct deeper sync; Cupix deepened | Integrations move from links to interactive surfaces where approved | Tenant policy on writes | Phase 8 |
| **10 — Governance, Analytics, and Continuous Improvement** | Cross-project rollups; analytics; ADR cycle | HBCentral rollups; analytics dashboards; ADRs for changes that move scope | Analytics live; ADR cadence operational | Cross-project data ownership decisions | Phase 9; HBCentral schema |

---

## 24. Acceptance Criteria for the Contract Document

### 24.1 Document acceptance

This contract is complete only if it:

- defines what every standard project site contains;
- distinguishes required vs optional components;
- preserves the blueprint's 20-module structure (§8);
- integrates the example operating documents as enhancements (§17);
- exposes settings/management through PCC, not native SharePoint (§9, §10);
- provides governed Team & Access management (§11);
- defines permission templates and phase-based access manager rules (§11, §12);
- defines pages, libraries, lists, metadata, integrations, site health, drift, provisioning validation, MVP, project-type variation (§13–§22);
- is detailed enough that a future agent can derive JSON schemas, provisioning scripts, SPFx modules, and backend APIs without re-interpreting (§24.2);
- never implies users must manually manage SharePoint lists/libraries/pages/permissions for normal workflows (§9);
- does not invent secrets, credentials, or tenant-specific IDs that are not present in repo or prompt context (§4, §22).

### 24.2 Future Machine-Readable Schema Acceptance

This markdown is the **human-readable source of truth** until schema extraction is approved. The following are deferred targets:

- `packages/project-site-template/template-contract.json` — the canonical machine-readable contract.
- `packages/project-site-template/schemas/` — typed schemas for each Object Catalog row.
- Provisioning definitions consumed by `backend/functions/src/services/sharepoint-provisioning-service.ts`.

To faithfully represent this contract, a future schema must satisfy:

1. **Object Catalog coverage** — every row of §4A is representable as a top-level schema concept.
2. **Enumerability** — every list, library, field, and view is enumerable with a stable identifier traceable back to a section/anchor in this markdown.
3. **Conditional seeding expressibility** — every rule in §4B is expressible as a conditional-seeding clause keyed on `projectType`.
4. **Drift severity expressibility** — every severity in §19.3 is a first-class schema value; every check carries an explicit severity assignment.
5. **Data ownership expressibility** — every list/record family carries one of `Site-local` / `HBCentral` / `Backend storage` / `External system of record`.
6. **Sync policy expressibility** — every library carries one of `Sync Allowed` / `Sync Discouraged` / `Sync Blocked`.
7. **Permission template expressibility** — every column in §12.3 is a typed field on the schema.
8. **Provenance** — every schema element references a section and (where applicable) anchor in this markdown so contract changes propagate cleanly into schema changes.

No schema, JSON, or code is produced in this prompt. Schema extraction is a separate authorized work item under §23 Phase 1.

---

## Appendix A — Cross-References

- PCC Target Architecture Blueprint: `docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md`
- Example operating documents: `docs/reference/example/`
- HBCentral list schemas: `docs/reference/sharepoint/list-schemas/hbcentral/`
- Configuration tier doctrine: `docs/reference/configuration/wave-0-config-registry.md`
- Provisioning service surface: `backend/functions/src/services/sharepoint-provisioning-service.ts`
- HBCentral homepage shell pattern: `apps/hb-homepage/` (`@hbc/spfx-hb-homepage`)
- Project provisioning UI today: `apps/project-sites/` (`@hbc/spfx-project-sites`)
- People picker (canonical): `packages/ui-kit/src/HbcPeoplePicker/` (`@hbc/ui-kit`)
- Future PCC app: `apps/project-control-center/` (does not yet exist)
- Future DCC app: `apps/document-control-center/` (does not yet exist)
- Future template package: `packages/project-site-template/` (does not yet exist)

---

*End of Standard Project Site Template Contract.*
