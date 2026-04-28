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
- the thirteen user-facing permission templates,
- Team & Access management - including ten MVP-enabled internal templates and three deferred external templates,
- Control Center Settings (project-level + template-level),
- module-level settings surfaces,
- external integrations (Procore, Sage Intacct, Compass, Document Crunch, Adobe Sign, Cupix, Microsoft Teams, Outlook),
- **Procore integration** as a foundational layer: project mapping, Procore Subject Area Registry, sync health, object lineage, curated summaries, Procore Settings, Procore site-health checks (see §18.1, §15.13),
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
| 8 | Permission Templates | 13 (see §12.4) | §12 | MVP for 10; Future/deferred for 3 | `permissionTemplates[]` |
| 9 | Configuration Records | Project Site Configuration, Module Configuration, Permission Template Configuration, Integration Configuration | §10, §15 | MVP | `configurationRecords[]` |
| 10 | Module Records | 20 (one per module in §8) | §8 | MVP for 8; Future for 12 | `modules[]` |
| 11 | Integration Records | 8 (Procore, Sage Intacct, Compass, Document Crunch, Adobe Sign, Cupix, Teams, Outlook) | §18 | MVP for Procore, Sage Intacct; rest Future | `integrations[]` |
| 12 | Health Records | 1 per site, multiple checks | §19 | MVP | `healthRecord` |
| 13 | Workflow Template Records | 8 source workflows (§17) | §17 | MVP for Startup, Closeout, Permits, Inspections, Responsibility Matrix; Future for Owner-Contract Matrix, Subcontractor Scorecard, Lessons Learned | `workflowTemplates[]` |
| 14 | Procore Project Mapping | 1 per site | §15.13, §18.1 | MVP | `procoreMapping` |
| 15 | Procore Subject Area Registry | 6 rows per site (one per subject area) + lifecycle metadata | §15.13, §18.1 | MVP (rows seeded `Enabled=false`); enablement Future per Recommended Practical scope | `procoreSubjectAreas[]` |
| 16 | Procore Sync Health | 1 + N (per subject area enabled) | §15.13, §19, §18.1 | MVP placeholder; populated when sync enabled | `procoreSyncHealth[]` |
| 17 | Procore Object Link Records | N (created when summaries / curated rows reference Procore objects) | §15.13, §18.1 | Future (Recommended Practical) | `procoreObjectLinks[]` |
| 18 | Procore Curated Summary Records | N per enabled subject area (RFI summary, observation summary, etc.) | §15.13, §18.1 | Future (Recommended Practical) — placeholder in MVP | `procoreMaterializations[]` |

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

**Frozen for MVP** (see §22.1).

### 5.1 Site URL pattern (frozen)

Project site URLs use the **stable project base number** derived from the accounting-generated project number.

**Rule.** Take the **first six characters** of the accounting project number, then **strip non-numeric characters** to produce the URL slug. The hyphen-bearing form is preserved separately as `{ProjectBaseNumber}` for use in SharePoint group names (§12).

| Step | Value (example: accounting number `26-000-00`) |
|---|---|
| Accounting project number | `26-000-00` |
| First six characters | `26-000` (5 digits + 1 hyphen = 6 characters) |
| `{ProjectBaseNumber}` (hyphen retained, used for groups) | `26-000` |
| `{ProjectPhaseSuffix}` (project metadata) | `-00` |
| `{ProjectBaseNumberNoHyphen}` (URL slug) | `26000` |
| Site URL | `https://hedrickbrotherscom.sharepoint.com/sites/26000` |

**Pattern (canonical):**

```
/sites/{ProjectBaseNumberNoHyphen}
```

The accounting side enters the generated project number during the project setup request / finalization workflow. The phase suffix may vary by project phase or related project record (e.g., `-00`, `-01`, `-02`); the first six characters are the stable base.

### 5.2 Display name

`{ProjectNumber} - {ProjectName}`

Length capped at 64 characters; project name truncated with ellipsis if needed. Display name updates require Control Center Settings change with audit (§10).

### 5.3 Project number usage

`{ProjectNumber}` (full accounting number, e.g., `26-000-00`) is the canonical full identifier; `{ProjectBaseNumber}` (e.g., `26-000`) is the stable base used for site URL slug derivation and SharePoint group naming. Both are sourced from accounting finalization (Sage Intacct project number). Projects do not exist in HB Intel's project-site space until they have an accounting-finalized project number.

### 5.4 Short name sanitization

`{ShortProjectNameSlug}` (used in display name truncation only, not in the URL) is generated by:
1. lowercasing,
2. removing non-ASCII alphanumerics and replacing with `-`,
3. collapsing repeated `-`,
4. trimming leading/trailing `-`,
5. truncating to 32 characters at a `-` boundary.

### 5.5 Phase association and collision handling (frozen)

A project site is created **once per `{ProjectBaseNumber}`**. Phase suffixes do not produce additional sites by default.

- If a site for the base number already exists, the provisioning workflow must **not** create a duplicate.
- Subsequent phase project numbers (e.g., `26-000-01`, `26-000-02`) **associate with the existing project site** for that base number.
- A separate project site for a particular phase is an **exception**, requiring an explicit governed decision by accounting / operations and a recorded justification in the Provisioning Audit (§20). The exception URL suffix convention is **not yet defined** and is recorded as Remaining Open (§22.2).

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
| Project Number | Accounting Finalization (Sage Intacct) | Full accounting number (e.g., `26-000-00`). Immutable. |
| Project Base Number | Derived at provisioning | First six characters of the accounting project number, hyphen retained (e.g., `26-000`). Used in SharePoint group naming (§12). Immutable. |
| Project Phase Suffix | Derived at provisioning | The phase portion of the accounting number (e.g., `-00`, `-01`). Updates allowed when a new phase is associated with the same base. |
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
| Procore Company ID | Set when Procore integration enabled. Identifies the Procore tenant/company that owns the project record. |
| Procore Project ID | Set when Procore integration enabled. |
| Procore Project URL | Set when Procore integration enabled. The browser URL for deep links from PCC. |
| Procore Project Status | Set when Procore integration enabled. Reflected from Procore (Active / Inactive / Archived). |
| Procore Sync Enabled | Set when Procore integration is configured. Boolean; defaults to `false` at provisioning. |
| Procore Sync Profile | Set when Procore Sync Enabled. Identifies the named sync profile (e.g., `MVP-mapping-only`, `RecommendedPractical-Wave1`). |
| Procore Last Successful Sync | System-managed; UTC timestamp of the last successful end-to-end sync run. |
| Procore Last Sync Status | System-managed; one of `Success` / `Partial` / `Failed` / `NotRun`. |
| Compass Project ID | Set when Compass integration enabled. |
| Document Crunch Project / Workspace ID | Set when integration enabled. |
| Adobe Sign Workspace / Account Mapping | Set when integration enabled. |
| Cupix Project ID | Set when integration enabled. |
| Teams Group ID | Required once Teams-connected provisioning completes; **nullable during the provisioning-pending state**. Once populated, governed by Team & Access (§11), not editable through native Teams admin. |
| Teams Channel ID | Required once the project Teams team has at least one governed channel; nullable during pending state. |
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

### 10.5 SharePoint Site Access vs Microsoft 365 Group / Teams Membership

These two are governed separately and must not be conflated:

```
SharePoint Site Access
  = controls ability to view / read / edit project site content (libraries, lists, pages).

Microsoft 365 Group / Teams Membership
  = controls participation in project collaboration spaces, channels, Teams conversations,
    and group resources (mailbox, planner, etc.).
```

A user may have SharePoint read access to a project site without being a member of its Teams team (e.g., Global Read-Only, Executive Oversight). Conversely, a Teams team member always has at least project-team-level SharePoint access. All Teams membership changes are governed through the Team & Access Center (§11) or backend provisioning, **not** through native Teams administration by project users.

### 10.6 Procore Settings

Control Center Settings includes a Procore configuration surface that exposes Procore mapping and integration state in business language. The settings live in the Project Procore Mapping and Procore Subject Area Registry records (§15.13); Settings is the user-facing surface to view and edit them.

| Field | Source | Edit Allowed By | Notes |
|---|---|---|---|
| Procore Company ID | Project Procore Mapping | PCC Admin, IT / Integration Admin | |
| Procore Project ID | Project Procore Mapping | PCC Admin, Project Executive, Project Manager, IT / Integration Admin | |
| Procore Project URL | Project Procore Mapping (auto-generated where possible) | PCC Admin, Project Executive, Project Manager, IT / Integration Admin | Used for deep links. |
| Enabled Procore Subject Areas | Procore Subject Area Registry | PCC Admin, IT / Integration Admin | Six subject areas: `financials`, `project_management`, `documents_design`, `quality_safety`, `field_execution`, `workflow`. Defaults to `Enabled=false` at provisioning. |
| Sync Cadence | Procore Subject Area Registry | PCC Admin, IT / Integration Admin | Per subject area. |
| Sync Profile | Project Procore Mapping | PCC Admin, IT / Integration Admin | E.g., `MVP-mapping-only`, `RecommendedPractical-Wave1`. |
| Tool Deep Links | Auto-generated from Procore Project URL | (read-only in PCC) | RFIs, submittals, drawings, etc. |
| Last Sync Status | Procore Sync Health | (read-only in PCC) | One of `Success` / `Partial` / `Failed` / `NotRun`. |
| Last Successful Sync | Procore Sync Health | (read-only in PCC) | UTC timestamp. |
| Configured By | Project Procore Mapping | (read-only in PCC) | UPN of last configurator. |
| Configured Date | Project Procore Mapping | (read-only in PCC) | UTC timestamp. |
| Health Status | Procore Sync Health | (read-only in PCC) | Surfaces severity per §19.3 + ErrorCategory per §15.13. |
| Redacted Error Summary | Procore Sync Health | (read-only in PCC) | Plain-language message per §15.13 ErrorCategory mapping; **never** raw payload, token, URL with secrets. |

All labels use plain business language. Native SharePoint list editing of these records is not exposed in PCC; emergency repair (§9.4 tier c) follows the standard tier rules.

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

A central Entra group (`HB-PCC-Global-Read-All`) is automatically mapped to the project-local SharePoint group `PCC-{ProjectBaseNumber}-GlobalReadOnly` at provisioning, granting site read-only access. Members of the Entra group include:

- IT department,
- Vice Presidents and above,
- Executive oversight / audit users,
- Other pre-defined governance roles.

Global read-only users receive **SharePoint read access only**. They are **not** added to the project Microsoft 365 Group / Teams team (see §11.6). The Entra group object ID is tenant configuration recorded as Remaining Open (§22.2).

### 11.2A Hybrid group model (frozen)

The contract uses a **hybrid** identity model:

- **Central Entra groups** — tenant-wide, stable role groups managed centrally and reused across all project sites. Used for global oversight and IT roles.
- **Project-local SharePoint groups** — created **per project site** during provisioning, named with the `PCC-{ProjectBaseNumber}-…` convention. These carry per-project permission template assignments.

Per-project Entra groups are **not** created in MVP. Project-local SharePoint group object IDs are runtime-generated and **must not be hardcoded** in the template; they are stored in the project site's Project Site Configuration (§15) after provisioning.

**Central Entra groups (MVP):**

```
HB-PCC-Global-Read-All
HB-PCC-IT-Site-Repair-Admins
HB-PCC-Template-Owners
```

Deferred until external access is enabled:

```
HB-PCC-External-Access-Approvers
```

**Project-local SharePoint groups (created at provisioning, MVP):**

```
PCC-{ProjectBaseNumber}-Owners
PCC-{ProjectBaseNumber}-GlobalReadOnly
PCC-{ProjectBaseNumber}-ReadOnly
PCC-{ProjectBaseNumber}-ProjectTeam
PCC-{ProjectBaseNumber}-ProjectManagement
PCC-{ProjectBaseNumber}-FieldOperations
PCC-{ProjectBaseNumber}-ProjectAccounting
PCC-{ProjectBaseNumber}-SafetyQAQC
PCC-{ProjectBaseNumber}-EstimatingPreconstruction
PCC-{ProjectBaseNumber}-ExecutiveOversight
```

Deferred until external access is enabled:

```
PCC-{ProjectBaseNumber}-ExternalDesignTeam
PCC-{ProjectBaseNumber}-OwnerClientViewer
PCC-{ProjectBaseNumber}-SubcontractorLimited
```

All access mutations route through `backend/functions/` and are audit-logged (§15 Project Access Audit).

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

### 11.5 External (guest) user posture (frozen for MVP — no external users)

**MVP decision:** No external users in first release.

- External-facing permission templates (`External Design Team`, `Owner / Client Viewer`, `Subcontractor Limited Access`) are **defined architecturally but disabled** in MVP.
- The corresponding project-local SharePoint groups (`PCC-{ProjectBaseNumber}-ExternalDesignTeam`, `…-OwnerClientViewer`, `…-SubcontractorLimited`) are **not provisioned** in MVP unless explicitly required for a future pilot.
- The Team & Access Center **must not** allow assignment of external-facing templates in MVP.
- External users **must not** be invited through the PCC UI in MVP.
- Any external access before formal enablement is an exception requiring IT and leadership approval **outside** the MVP flow, recorded in the Project Access Audit.

**Future enablement.** When the external-access model is enabled in a later release, the following gates apply:

(a) a project-specific permission template explicitly allows external participants, **and**
(b) a documented approval workflow grants the access (Admin sign-off plus audit entry plus expiration date),
(c) mandatory expiration date,
(d) mandatory periodic review (External Access Review surface),
(e) mandatory `Audit Required = true`,
(f) restriction to libraries/lists explicitly tagged as external-permissible.

The future external-access release scope and approval workflow are recorded as Remaining Open (§22.2). Any change to enable external access requires an architecture amendment, not a project-level setting.

### 11.6 Microsoft 365 Group / Teams connection posture (frozen for MVP)

Project sites are **Microsoft 365 Group / Teams connected by default** unless a future exception is approved.

- **Teams membership is limited** to active project team members who need collaboration access (PMs, superintendents, project accountants, designated PX, safety/QAQC leads, estimating handoff users during preconstruction).
- The **Global Read-Only Entra group is not added** to the project Microsoft 365 / Teams team. Executive / global read-only visibility is delivered through SharePoint read access only.
- **IT / admin repair users are not auto-added** to project Teams unless they are active project participants. Tier (c) emergency repair access (§9.4) does not grant Teams membership.
- Teams membership changes are made through the **Team & Access Center** or backend provisioning; native Teams administration by project users is not an authorized path.

The distinction between SharePoint site access and M365 / Teams membership is documented in §10.5.

### 11.7 Procore directory comparison (read-only)

The Team & Access Center may surface a **read-only** Procore directory comparison feed (sourced from the Procore `project_management` subject area when enabled per §15.13) showing:

- PCC user exists but not in Procore,
- Procore user exists but not in PCC,
- role mismatch,
- inactive user with active SharePoint access,
- missing PX / PM / Superintendent / Project Accountant.

**Procore project directory membership may be used for comparison, reconciliation, and exception reporting. It must not automatically grant SharePoint access. Auto-grant requires a future governed access-sync workflow approved by an architecture amendment** (R6). All access mutations continue to route through the §11.4 invite workflow with audit (§15 Project Access Audit).

---

## 12. Permission Template Contract

### 12.1 Design intent

Users select **plain business permission templates**, never SharePoint groups directly. Behind the scenes, each template maps to one or more **project-local SharePoint groups** (§11.2A) and, where applicable, a **central Entra group**.

### 12.2 Custom SharePoint permission levels (frozen)

Native SharePoint `Edit` and broad `Full Control` are **not** granted to ordinary users. The template uses HB-defined custom permission levels:

| Permission Level | Purpose | Notes |
|---|---|---|
| `HB Read` | Read-only access to permitted libraries / lists | Default for read-only templates. |
| `HB Contribute No Delete` | Add and edit, but not delete | **Default write level for most operational users.** |
| `HB Contribute` | Add, edit, and delete own items | Used selectively where delete authority is justified. |
| `HB Manage Project Content` | Full management of project content (incl. delete + library config within governed bounds) | Used by Project Management. |
| `Full Control` | Site-level admin | **Restricted to PCC Admin / IT repair only.** |

Exact implementation (mapped roleDefinitions, base permissions) is validated during provisioning implementation; the names above are the template-level identifiers.

### 12.3 Permission template keys (stable internal identifiers)

```
pcc_admin
global_read_only
executive_oversight
project_viewer
estimating_preconstruction
project_team_member
project_management
field_operations
project_accounting
safety_qaqc
external_design_team           ← deferred / disabled in MVP
owner_client_viewer            ← deferred / disabled in MVP
subcontractor_limited          ← deferred / disabled in MVP
```

These keys are stable and used by `permissionTemplates[].key` in the future schema (§24.2).

### 12.4 MVP permission template mapping (frozen)

| Template | Key | Project-Local SharePoint Group | Central Entra Group | Permission Level | MVP |
|---|---|---|---|---|---|
| Project Control Center Admin | `pcc_admin` | `PCC-{ProjectBaseNumber}-Owners` | optional `HB-PCC-IT-Site-Repair-Admins` | `Full Control` | Yes |
| Global Read-Only | `global_read_only` | `PCC-{ProjectBaseNumber}-GlobalReadOnly` | `HB-PCC-Global-Read-All` | `HB Read` | Yes |
| Executive Oversight | `executive_oversight` | `PCC-{ProjectBaseNumber}-ExecutiveOversight` | optional | `HB Read` | Yes |
| Project Viewer / Read Only | `project_viewer` | `PCC-{ProjectBaseNumber}-ReadOnly` | none | `HB Read` | Yes |
| Estimating / Preconstruction | `estimating_preconstruction` | `PCC-{ProjectBaseNumber}-EstimatingPreconstruction` | none | `HB Contribute No Delete` | Yes |
| Project Team Member | `project_team_member` | `PCC-{ProjectBaseNumber}-ProjectTeam` | none | `HB Contribute No Delete` | Yes |
| Project Management | `project_management` | `PCC-{ProjectBaseNumber}-ProjectManagement` | none | `HB Manage Project Content` | Yes |
| Field Operations | `field_operations` | `PCC-{ProjectBaseNumber}-FieldOperations` | none | `HB Contribute No Delete` | Yes |
| Project Accounting | `project_accounting` | `PCC-{ProjectBaseNumber}-ProjectAccounting` | none | `HB Contribute No Delete` | Yes |
| Safety / QAQC | `safety_qaqc` | `PCC-{ProjectBaseNumber}-SafetyQAQC` | none | `HB Contribute No Delete` | Yes |
| External Design Team | `external_design_team` | deferred | deferred | disabled | **No** (deferred) |
| Owner / Client Viewer | `owner_client_viewer` | deferred | deferred | disabled | **No** (deferred) |
| Subcontractor Limited Access | `subcontractor_limited` | deferred | deferred | disabled | **No** (deferred) |

**Correction note.** Earlier drafts of this contract may have shown `Project Team Member` mapped to a Project Management group. The mapping is corrected here: `Project Team Member` → `PCC-{ProjectBaseNumber}-ProjectTeam`; `Project Management` → `PCC-{ProjectBaseNumber}-ProjectManagement`. They are distinct templates with distinct permission levels and distinct groups.

### 12.5 MVP library access matrix

This is the starting MVP access matrix. Cells use `Full` / `Manage` / `Edit` / `Read` / `—` (no default access).

| Library | PCC Admin | Global Read-Only | Executive Oversight | Project Viewer | Estimating / Precon | Project Team Member | Project Management | Field Operations | Project Accounting | Safety / QAQC |
|---|---|---|---|---|---|---|---|---|---|---|
| `01_Project_Administration` | Full | Read | Read | Read | Edit | Edit | Manage | Read | Read | Read |
| `02_Contracts_and_Compliance` | Full | Read | Read | — | — | — | Edit | — | Edit | — |
| `03_Drawings_and_Specifications` | Full | Read | Read | Read | Read | Edit | Manage | Edit | Read | Read |
| `04_Permits_and_Inspections` | Full | Read | Read | Read | Read | Edit | Manage | Edit | Read | Edit |
| `05_RFIs_Submittals_and_Direction` | Full | Read | Read | Read | Read | Edit | Manage | Edit | Read | Read |
| `06_Field_Operations` | Full | Read | Read | Read | — | Edit | Manage | Edit | Read | Edit |
| `07_Meetings_and_Communications` | Full | Read | Read | Read | Read | Edit | Manage | Read | Read | Read |
| `08_Project_Controls_and_Financials` | Full | Read | Read | — | — | — | Edit | — | Edit | — |
| `09_Photos_Videos_and_Reality_Capture` | Full | Read | Read | Read | — | Edit | Manage | Edit | Read | Read |
| `10_Closeout_and_Turnover` | Full | Read | Read | Read | — | Edit | Manage | Edit | Read | Read |
| `11_Lessons_Learned_and_Reports` | Full | Read | Read | Read | Read | Edit | Manage | Read | Read | Read |
| `99_Archive` | Full | Read | Read | Read | Read | Read | Read | Read | Read | Read |

Per-template policy summary (governs the matrix):

- **PCC Admin** — Full across all.
- **Global Read-Only** — Read across all internal libraries.
- **Executive Oversight** — Read across all internal libraries.
- **Project Viewer** — Read on general libraries; **no default access** to contracts (`02`) or financials (`08`).
- **Estimating / Preconstruction** — Edit on startup / admin / handoff areas; limited or no access to field, financial, and media unless approved per project.
- **Project Team Member** — Edit on general operational libraries; **no default** financial / contract access.
- **Project Management** — Manage across operational libraries; Edit on financial and contract libraries.
- **Field Operations** — Edit on field, permits, inspections, drawings, and photos; **no default** contracts / financials access.
- **Project Accounting** — Edit on contracts and financials; Read on general operational libraries.
- **Safety / QAQC** — Edit on safety, QAQC, inspections, and field records; Read on drawings and general context.

Variations from this matrix on a specific project are recorded in Project Site Configuration with audit (§10) and surface in Site Health (§19).

### 12.6 Template attribute schema

Every template row is a record in **Permission Template Configuration** (§15) with attributes: `key`, `displayName`, `description`, `assignedSpGroup`, `assignedEntraGroup`, `permissionLevel`, `mvpStatus`, `assignableBy`, `defaultExpiration`, `auditRequired`, plus the per-library access vector (one cell per library code from §12.5). Schema target identifier: `permissionTemplates[]`.

### 12.7 Open items recorded as Remaining (§22.2)

- exact central Entra group object IDs,
- exact runtime-generated SharePoint group IDs (per project, runtime),
- mapped roleDefinitions for the five custom permission levels,
- assignment limits / max counts per template (if any),
- non-default expiration policy (currently `None` for internal templates).

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
| `01_Project_Administration` | 01 Project Administration | General admin docs | Document Control | Project Team Member+ | None | DocCategory, DocStatus, ResponsibleRole | All; By Category; By Status | `Shortcut Allowed` | 7y, archive at closeout | Required | Must exist |
| `02_Contracts_and_Compliance` | 02 Contracts and Compliance | Prime + sub contracts, COIs | Contract & Compliance | PM, PA, Admin | Read for Executive Oversight | DocType, ContractParty, EffectiveDate, ExpirationDate, ObligationLink | All; By Contract Party; Expiring | **`Sync Blocked`** | 10y, archive at closeout | Required | Must exist |
| `03_Drawings_and_Specifications` | 03 Drawings and Specifications | Drawings, specs, BIM | Drawing & Model | Project Team Member+ | None | Discipline, Set, RevisionNumber, IssuedDate, IsCurrent | Current Set; By Discipline; By Set | `Online Only` | 10y, archive at closeout | Required | Must exist |
| `04_Permits_and_Inspections` | 04 Permits and Inspections | Permits, inspection reports | Permit & AHJ + Inspection Readiness | Project Team Member+ | None | PermitType, InspectionGroup, AHJ, IssuedDate, ExpirationDate | By Permit Type; By Status; Expiring | `Shortcut Allowed` | 7y, archive at closeout | Required | Must exist |
| `05_RFIs_Submittals_and_Direction` | 05 RFIs Submittals and Direction | RFIs, submittals, ASIs | Drawing & Model + Document Control | Project Team Member+ | None | Type (RFI/Submittal/ASI), Status, RelatedSpec | By Type; By Status; My Open | `Online Only` | 10y, archive at closeout | Required | Must exist |
| `06_Field_Operations` | 06 Field Operations | Daily logs, photos, safety acks | Field Operations | Project Team Member+ | None | DocType, LogDate, ResponsibleRole | By Date; By Type | `Shortcut Allowed` (elevation to `Sync Allowed` for field laptops requires governed exception per §14.5A) | 7y, archive at closeout | Required | Must exist |
| `07_Meetings_and_Communications` | 07 Meetings and Communications | Meetings, minutes, comms | Meeting & Communication | Project Team Member+ | None | MeetingType, MeetingDate | By Type; By Date | `Shortcut Allowed` | 7y, archive at closeout | Optional | Validate if module enabled |
| `08_Project_Controls_and_Financials` | 08 Project Controls and Financials | Pay apps, cost reports, change events | Project Controls + Procurement & Buyout | Project Accounting + PM + PX | Read-only for Executive Oversight | DocType, PeriodEnd, FinancialCategory | By Category; By Period | **`Sync Blocked`** | 10y, archive at closeout | Optional | Validate if module enabled |
| `09_Photos_Videos_and_Reality_Capture` | 09 Photos Videos and Reality Capture | Photos, videos, Cupix exports | Drawing & Model + Field Operations | Project Team Member+ | None | CaptureDate, Source (Cupix/Manual), Location | By Date; By Source | `Online Only` (prefer Cupix / Stream surfaces) | 10y, archive at closeout | Optional | Validate if module enabled |
| `10_Closeout_and_Turnover` | 10 Closeout and Turnover | O&M, warranties, attic stock, final survey | Closeout & Warranty | PM, PA, Admin | Owner read at handover | DocType, TurnoverStatus | By Type; By Status | `Shortcut Allowed` | 10y after warranty end | Required | Must exist |
| `11_Lessons_Learned_and_Reports` | 11 Lessons Learned and Reports | Recap, lessons, evaluations | Lessons Learned | PX, PM | None | ReportType, Phase | By Type | `Shortcut Allowed` | 10y | Optional | Validate if module enabled |
| `99_Archive` | 99 Archive | Archived items | Document Control | Admin | Read-only for all | ArchivedDate, ArchivedBy | All | **`Sync Blocked`** | indefinite | Required | Must exist |

### 14.2 Sync-Risk Policy (frozen — four states)

The default access path for every library is **the Project Control Center / Document Control Center web UI**. The four sync policy values are:

| Policy | PCC / DCC behavior | Native SharePoint behavior | Use |
|---|---|---|---|
| `Online Only` | PCC / DCC web access is the default. **No** shortcut or sync action is promoted in the PCC UI. | Native sync may remain technically possible unless blocked at tenant level. | Default for large, version-sensitive, or governance-heavy content (drawings, RFIs/submittals, photos/media). |
| `Shortcut Allowed` | `Add shortcut to OneDrive` may be offered to users. **Traditional sync is discouraged.** Users see a plain-language warning in the PCC. | Native shortcut + sync still possible. | **MVP default for low-risk operational libraries.** |
| `Sync Allowed` | Both `Add shortcut to OneDrive` and traditional sync are permitted. | Both permitted. | Used **only** when operationally justified (e.g., field-laptop offline use). Per-project elevation requires the §14.5A governed exception. |
| `Sync Blocked` | PCC / DCC hides sync and shortcut affordances. SharePoint-level sync is disabled where technically possible. | Any native sync exposure that remains is reported as Site Health drift (severity per §19.3). | Sensitive libraries (`02`, `08`) and read-only archive (`99`). |

### 14.3 MVP Library Sync Policy (frozen)

| Tier | Libraries | Default policy | Rationale |
|---|---|---|---|
| Low-risk operational | `01_Project_Administration`, `04_Permits_and_Inspections`, `06_Field_Operations`, `07_Meetings_and_Communications`, `10_Closeout_and_Turnover`, `11_Lessons_Learned_and_Reports` | **`Shortcut Allowed`** (preferred) | Promote shortcut, discourage traditional sync. |
| Online-first | `03_Drawings_and_Specifications`, `05_RFIs_Submittals_and_Direction`, `09_Photos_Videos_and_Reality_Capture` | `Online Only` | Drawings + RFIs are version-sensitive; media is large and better served by Cupix / Stream. |
| Blocked | `02_Contracts_and_Compliance`, `08_Project_Controls_and_Financials`, `99_Archive` | `Sync Blocked` | Sensitive content / read-only archive. |

`Sync Allowed` is **not** a default in MVP. Promoting a library from `Shortcut Allowed` to `Sync Allowed` for a specific project requires a governed exception (§14.5A); it does **not** require a template-version bump because it stays within the governed allowlist. Promoting a library from `Online Only` to `Shortcut Allowed` or `Sync Allowed` is a **template-level** change requiring an architecture amendment.

### 14.4 Large media handling

`09_Photos_Videos_and_Reality_Capture` is `Online Only` by template default:

- traditional sync risks OneDrive client storage exhaustion;
- prefer Cupix-hosted reality capture for spatial content;
- prefer Stream / Microsoft 365 video surfaces for video;
- treat the SharePoint library as authoritative metadata + optional asset store, not the primary playback surface.

### 14.5 Folder permissions policy

Unique folder-level permissions are **prohibited** except in **controlled exceptions**. An exception requires:

1. a documented justification recorded on the library's configuration record,
2. named approval from a Control Center Admin and IT,
3. an entry in the **Project Site Configuration** audit,
4. inclusion in the next site health drift report.

Anything else is treated as drift and surfaced in §19 (severity `Security Risk` for libraries `02` and `08`; severity `Warning` elsewhere unless the inheritance break is on a financial / contracts library, which escalates to `Security Risk`).

### 14.5A Governed sync elevation exception

A project may **request elevation** of a library from `Shortcut Allowed` to `Sync Allowed`, or from `Online Only` to `Shortcut Allowed` (the latter requiring a template-version amendment, not just a project-level setting). Requirements:

1. Operational justification recorded on the library's configuration record (e.g., "field laptops require offline access to `06_Field_Operations` for remote jobsite").
2. Approval from a Control Center Admin **and** IT.
3. Audit entry written to **Project Site Configuration** with `before` / `after` / `reason`.
4. The exception is reviewed each time site health runs.
5. Elevation **never** applies to `02`, `08`, or `99`.

### 14.6 Site Health enforcement of sync policy

A library carrying `Sync Blocked` policy that is found sync-enabled in any user surface is reported as Site Health drift:

- on `02_Contracts_and_Compliance` or `08_Project_Controls_and_Financials` → severity `Security Risk` (§19.3),
- on `99_Archive` → severity `Repair Required`.

A library carrying `Online Only` policy that is found promoting sync in the PCC UI is `Repair Required`. Drift caused by tier (c) emergency repair (§9.4) that has not been reconciled is `Repair Required`.

### 14.7 Anti-monolith policy

A single sprawling `Documents` library is prohibited. Project-content separation is by lifecycle, access profile, sync risk, and functional purpose, as expressed by the twelve libraries above.

---

## 15. Standard SharePoint List Contract

### 15.1 Data ownership model (frozen — dual-record)

The contract uses a **dual-record** ownership model. A given data set may have authoritative copies in more than one place, with each copy serving a distinct purpose:

```
Site-local       = working project record (active, editable, project-team facing)
HBCentral        = enterprise rollup / approved historical record (cross-project intelligence)
Backend storage  = immutable system / provisioning / security audit (canonical event log)
External systems = transactional system of record where already authoritative
                   (Procore / Sage Intacct / Compass / Document Crunch / Adobe Sign / Cupix / Teams / Outlook)
```

**Default routing rules:**

- Project-operational data → **Site-local**.
- Cross-project rollups, governance registries, approved historical records → **HBCentral**.
- Provisioning audit, security mutation log, template metadata → **Backend storage**.
- Transactional financial / RFI / signed-document data → **External system of record**.

**HBCentral is not the messy working area.** It is the cross-project intelligence, governance, and approved-history layer. Project teams do not edit HBCentral directly; HBCentral receives promoted records via governed workflows and integration audit.

### 15.1A Frozen ownership matrix for the four previously-open data sets

| Data set | Site-local (working) | HBCentral (approved / enterprise) | Backend storage (audit) | External systems |
|---|---|---|---|---|
| **Access Audit** | Project-facing access history (Project Access Audit list, §15.2) | Cross-project access / security review registry | Immutable mutation log (canonical) | M365 / Entra audit where applicable |
| **Lessons Learned** | Draft / review project lessons (Project Lessons Learned, §15.12) | Approved enterprise lessons, best practices, process improvements | Optional processing / audit | None unless linked |
| **Subcontractor History** | Project evaluation forms (Subcontractor Evaluations, §15.10) | Approved performance summaries / history (cross-project registry) | Optional integration audit | Compass / vendor profile reference |
| **Closeout Summaries** | Full closeout working detail (§15.11) | Executive / archive closeout summary | Optional finalization audit | Procore / Sage Intacct / Adobe Sign where authoritative |

### 15.1B Ownership lifecycle rules (frozen)

**Access Audit.**
```
Backend storage  : canonical immutable event log (provisioning, repair, access mutations)
Site-local       : project-facing copy for PCC visibility (Project Access Audit list)
HBCentral        : enterprise / security registry for cross-project review
```

**Lessons Learned.**
```
Site-local       : captured as draft / review during the project
Promotion        : Project Manager / Project Executive / Operations approval
HBCentral        : approved lessons, best practices, and process improvements
                   Best practices and process improvements are HBCentral-owned.
```

**Subcontractor History.**
```
Site-local       : evaluation form completed at project close or interim review
Promotion        : approved summary + score copied to HBCentral subcontractor performance registry
HBCentral        : approved history; scoring, trends, rebid recommendations
External         : Compass remains reference / system where applicable
```

**Closeout Summaries.**
```
Site-local       : working closeout detail, checklist completion, evidence
Promotion        : final approved summary / archive record
HBCentral        : approved closeout summary / archive record
Site-local       : closeout documents and evidence remain in project site libraries (10_Closeout_and_Turnover)
External         : transactional finalization (final pay app, lien releases, signed envelopes)
                   remain in Procore / Sage Intacct / Adobe Sign
```

### 15.1C Remaining open ownership questions

- Exact promotion / approval workflows and who triggers them (recorded in §22.2).
- HBCentral schema additions required for promoted records (subcontractor performance registry, executive closeout summary registry).
- Whether Project Access Audit mirrors to HBCentral on every event or batches.

### 15.1D Procore Data Ownership Rules

Procore-derived data does not flatten the dual-record model — it adds an external-system layer with explicit ownership rules:

```
Procore-owned transactional data        : remains owned by Procore (RFIs, submittals, inspections,
                                          observations, punch, commitments, change events,
                                          requisitions, daily logs, etc.).
Sage Intacct-owned accounting           : remains owned by Sage Intacct (GL, AP, AR, cash, books).
SharePoint / PCC                         : owns project-site configuration, access, settings,
                                          local readiness workflows, and CURATED operational summaries.
Canonical Procore data, where stored    : owned by the BACKEND integration / data layer
                                          (`backend/functions/`), NOT by individual SharePoint sites.
SharePoint lists                         : are NOT the canonical store for bulk Procore transactional data.
```

The Procore Configuration Records in §15.13 (Project Procore Mapping, Subject Area Registry, Sync Health, Object Links, Curated Summaries, Integration Audit) are PCC-side configuration / curation records — they are **not** the canonical store for Procore transactional content. The package's three-layer model (raw landing → canonical relational → SharePoint materialized) is preserved verbatim; PCC adds **deep links back to Procore** as an explicit fifth surface alongside the package's document/file storage layer (see §18.1 Storage strategy).

### 15.2 Core / Governance lists (Data Ownership: Site-local + HBCentral)

| List | Purpose | Owning Module | Required Fields | Optional Fields | Default Views | Seeded Data | Permission Scope | Workflow Triggers | Related Libraries / Integrations | MVP / Future | Validation Rule | Data Ownership |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Project Profile | Single project-metadata record | Project Home | All §6.1 fields | All §6.2 fields | Default | One row per site | Read: all; Write: Admin, PX | On change → audit | All | MVP | Exactly one row | Site-local |
| Project Roles | Catalog of roles + abbreviations | Project Directory | RoleId, RoleName, Abbreviation, Active | Description | Default | PX, Sr. PM, PM2, PM1, PA, Superintendent, QAQC, Project Accountant, etc. | Read: all; Write: Admin | None | None | MVP | At least defaults | Site-local |
| Project Team Assignments | Person ↔ role ↔ permission template | Team & Access | Person, RoleId, PermissionTemplate, EffectiveDate | EndDate, Notes | By Role; By Person | None | Read: all; Write: phase managers | On invite → audit | None | MVP | Validates on invite | Site-local |
| Project Access Requests | External access requests | Team & Access | Requester, RequestedTemplate, Reason, Status, RequestedDate, ApprovedBy, ApprovedDate, Expiration | Notes | Pending; Recent | None | Read: phase managers + Admin; Write: phase managers | On approval → audit | None | MVP | Status enum | Site-local |
| Project Access Audit | Immutable invite/change/repair audit | Team & Access | Action, Person, RoleId, PermissionTemplate, ActorUpn, Timestamp, Reason, BeforeState, AfterState | Notes | By Date; By Actor | None | Read: Admin, IT; Write: system only | On every access change | None | MVP | Append-only | **Backend canonical + Site-local copy + HBCentral enterprise registry** (per §15.1A) |
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

### 15.10 Subcontractors lists (Data Ownership: dual-record per §15.1A)

| List | Data Ownership | MVP / Future |
|---|---|---|
| Subcontractor Evaluations | **Site-local** (working evaluation form) → promoted to **HBCentral** subcontractor performance registry on approval; **Compass** reference where applicable | Future |
| Subcontractor Evaluation Criteria | Reference catalog in **HBCentral**; site-local reads it | Future |
| Subcontractor Performance History | **HBCentral** (cross-project, approved history) | Future |
| Subcontractor Rebid Recommendations | **Site-local** (project recommendation) → may inform **HBCentral** rebid history; cross-ref Compass | Future |

### 15.11 Closeout / Turnover lists (Data Ownership per §15.1A)

| List | Data Ownership | MVP / Future |
|---|---|---|
| Project Closeout Tasks | **Site-local** (working closeout detail) | MVP |
| Turnover Package Items | **Site-local** | MVP |
| Warranty Items | **Site-local** | Future |
| OM Manual Tracker | **Site-local** | Future |
| Attic Stock Tracker | **Site-local** | Future |
| Lien and Final Payment Watchlist | **Site-local**; cross-ref Sage Intacct (transactional final payment is external SoR) | MVP |
| Closeout Summary (final, approved) | **HBCentral** (approved executive / archive record), promoted from site-local working detail | Future |

Closeout documents and evidence remain in `10_Closeout_and_Turnover` library; transactional finalization (final pay app, lien releases, signed envelopes) remains in Procore / Sage Intacct / Adobe Sign per §15.1B.

### 15.12 Knowledge Capture lists (Data Ownership per §15.1A)

| List | Data Ownership | MVP / Future |
|---|---|---|
| Project Lessons Learned | **Site-local** (draft / review) → promoted to **HBCentral** on approval | Future |
| Best Practices Library | **HBCentral** (approved enterprise content) | Future |
| Process Improvement Recommendations | **HBCentral** (approved enterprise content) | Future |

### 15.13 Procore Configuration Records (Data Ownership per §15.1D)

Six Procore-related records. **They are configuration records**, not operational lists — they belong to Object Catalog row family #9 / new rows §4A #14–#18. They configure and observe the Procore integration; they do **not** mirror Procore transactional content.

#### 15.13.1 Project Procore Mapping (one row per site)

| Field | Notes |
|---|---|
| `ProjectId` | Cross-reference to Project Profile. |
| `ProjectNumber` | Full accounting number. |
| `SharePointSiteId` | The provisioned site ID. |
| `ProcoreCompanyId` | Lineage. |
| `ProcoreProjectId` | Lineage. |
| `ProcoreProjectUrl` | Used for deep links. |
| `ProcoreProjectStatus` | Reflected from Procore. |
| `ProcoreSyncEnabled` | Boolean; default `false` at provisioning. |
| `SyncProfile` | E.g., `MVP-mapping-only`, `RecommendedPractical-Wave1`. |
| `LastSuccessfulSync` | UTC timestamp; nullable until first success. |
| `LastSyncStatus` | `Success` / `Partial` / `Failed` / `NotRun`. |
| `LastSyncErrorRedacted` | Plain-language; per §15.13.3 ErrorCategory mapping. **Never** raw payload, token, or URL with secrets. |
| `ConfiguredBy` | UPN. |
| `ConfiguredDate` | UTC. |
| `Notes` | Optional. |

Permission scope: read by all on site; write by PCC Admin + IT / Integration Admin only. Data Ownership: **Site-local configuration**, mirroring the canonical mapping that lives in `backend/functions/` per §15.1D.

#### 15.13.2 Procore Subject Area Registry (six rows per site, one per subject area)

The `SubjectArea` field is **enumerated to the package's six subject areas exactly**: `financials`, `project_management`, `documents_design`, `quality_safety`, `field_execution`, `workflow`.

| Field | Notes |
|---|---|
| `ProjectId` | Cross-reference. |
| `SubjectArea` | Enum (`financials` / `project_management` / `documents_design` / `quality_safety` / `field_execution` / `workflow`). |
| `Enabled` | Boolean; defaults `false` at provisioning. |
| `SystemOfRecord` | Default `Procore`; `Procore + Sage` permitted for `financials` per §18.1 R5 wording. |
| `SyncMode` | One of `webhook` / `event-stream` / `polling-incremental` / `polling-full` / `snapshot`. |
| `SyncCadence` | Per package guidance (e.g., `near-real-time`, `hourly`, `nightly`, `daily-snapshot`). |
| `StorageTarget` | One of `raw-landing` / `canonical-relational` / `sharepoint-materialized` / `deep-link-only` (see §18.1 storage strategy). |
| `PCCModule` | Owning PCC module (e.g., Action Center, Project Controls Center). |
| `SharePointListTarget` | Optional; cite the list/configuration record name (e.g., `Procore Curated Summaries`) when materialization applies. |
| `CanonicalEntityTarget` | Package canonical entity name (e.g., `rfi`, `submittal`, `observation`). |
| `LastSync` | UTC timestamp. |
| `EndpointName` | The Procore endpoint family in use (e.g., `Budget Changes`, `RFIs`, `Submittals`). |
| `EndpointVersion` | Version string from Procore (e.g., `v1.0`, `vapid`). |
| `ApiLifecycleStatus` | Enum: `Stable` / `Beta` / `Deprecated` / `Sunset` / `Unknown`. |
| `LastVersionReviewDate` | UTC date of last quarterly review. |
| `VersionRisk` | Enum: `Low` / `Medium` / `High`. |
| `HealthStatus` | Mirrors latest Procore Sync Health row for this subject area. |
| `Notes` | Optional. |

Rationale for the endpoint / version fields: package §13 explicitly flags mixed maturity (budget, workflow, schedule). API lifecycle is tracked on the same record that gates per-project enablement so review and enablement decisions stay coupled.

Permission scope: read by all on site; write by PCC Admin + IT / Integration Admin. Data Ownership: **Site-local configuration**.

#### 15.13.3 Procore Sync Health (1 base + N per enabled subject area)

| Field | Notes |
|---|---|
| `ProjectId` | Cross-reference. |
| `SubjectArea` | Same enum as 15.13.2. |
| `LastRunStarted` | UTC. |
| `LastRunCompleted` | UTC. |
| `RecordsRead` | Integer. |
| `RecordsChanged` | Integer. |
| `RecordsFailed` | Integer. |
| `Status` | One of `Success` / `Partial` / `Failed` / `NotRun`. |
| `ErrorCategory` | **Enum below.** |
| `ErrorMessageRedacted` | Plain-language UI message keyed to ErrorCategory. **Never** raw payload, token, URL with secrets. |
| `NextRun` | UTC; planned next attempt. |
| `RepairActionAvailable` | Boolean; if `true`, surfaces in Site Health repair flow per §19A. |

**`ErrorCategory` enum** with plain-language UI mapping, severity (§19.3), and repair tier (§19A):

| `ErrorCategory` | Plain-language UI message | Severity | Repair Tier |
|---|---|---|---|
| `AuthFailed` | "Procore sign-in failed. Contact integration admin." | Security Risk | T3 — IT-Approved |
| `PermissionDenied` | "Procore service does not have permission for this project." | Repair Required | T3 |
| `RateLimited` | "Procore is busy; data refresh delayed." | Warning | T1 (auto-retry) |
| `EndpointDeprecated` | "An older Procore endpoint is in use; refresh planned." | Warning | T2 (Admin) |
| `MappingMissing` | "Procore project mapping is not configured." | Repair Required | T2 |
| `ProjectNotFound` | "The mapped Procore project cannot be found." | Repair Required | T3 |
| `PartialSync` | "Some Procore data is delayed or missing." | Warning | T1 |
| `StaleData` | "Last successful refresh is older than expected." | Warning | T1 |
| `MaterializationFailed` | "PCC could not save the latest Procore summary." | Repair Required | T2 |
| `Unknown` | "An unexpected Procore integration issue occurred." | Repair Required | T3 |

Technical diagnostics live in `LastSyncErrorRedacted` and are bound to the Procore Integration Audit (§15.13.6); raw payloads are forbidden in this surface.

Permission scope: read by Admin, IT / Integration Admin; write by system only. Data Ownership: **Site-local** (mirror of the canonical health log in `backend/functions/`).

#### 15.13.4 Procore Object Links (N records per site)

| Field | Notes |
|---|---|
| `ProjectId` | Cross-reference. |
| `SourceSystem` | Constant `Procore`. |
| `ProcoreCompanyId` | Lineage. |
| `ProcoreProjectId` | Lineage. |
| `ProcoreObjectType` | Canonical entity name (`rfi`, `submittal`, `observation`, `punch_item`, `commitment`, `change_event`, …). |
| `ProcoreObjectId` | Lineage. |
| `ProcoreObjectUrl` | Deep link. |
| `ProcoreLastSyncedAt` | UTC. |
| `CanonicalEntityId` | If a canonical-layer ID is populated. |
| `CanonicalEntityType` | Same as `ProcoreObjectType`; expressed as the package canonical entity name. |
| `MaterializedRecordId` | Pointer to the curated summary record when present. |
| `RelatedPCCModule` | Owning PCC module. |

Permission scope: read by all on site; write by system only. MVP: **Future** (Recommended Practical). At MVP the **pattern** exists; rows are not created until a subject area is enabled.

#### 15.13.5 Procore Curated Summaries (placeholder in MVP)

A configuration record (placeholder) describing per-subject-area summary types that PCC may materialize when the corresponding subject area is enabled. **No rows materialized in MVP.** Populated when Recommended Practical waves enable specific summaries (e.g., RFI summary, observation summary). Required-field shape will be defined per summary type in a follow-up amendment when the first summary is enabled; the placeholder record holds:

| Field | Notes |
|---|---|
| `ProjectId` | Cross-reference. |
| `SubjectArea` | Enum from 15.13.2. |
| `SummaryType` | E.g., `rfi_open_overdue`, `observation_open_safety`. |
| `Enabled` | Boolean. |
| `LastMaterialized` | UTC. |
| `MaterializationStatus` | `Success` / `Failed` / `NotRun`. |
| `RecordCount` | Integer. |
| `RetentionPolicy` | Per the package's retention guidance for that subject area. |
| `Notes` | Optional. |

Permission scope: read by all on site; write by system only. Data Ownership: **Site-local materialized layer** (the package's "SharePoint / HB Intel materialized layer").

#### 15.13.6 Procore Integration Audit (mutation log)

| Field | Notes |
|---|---|
| `ProjectId` | Cross-reference. |
| `Action` | E.g., `mapping_configured`, `subject_area_enabled`, `sync_run`, `repair_executed`, `secret_violation_detected`. |
| `ActorUpn` | Backend service principal or human admin. |
| `Timestamp` | UTC. |
| `BeforeState` | Compact JSON; redacted of secrets. |
| `AfterState` | Compact JSON; redacted of secrets. |
| `Reason` | Plain language. |
| `Notes` | Optional. |

Permission scope: read by Admin, IT / Integration Admin; write by system only; **append-only**. Data Ownership: **Backend canonical** (in `backend/functions/`) **+ Site-local copy** for PCC visibility.

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

The integration table below covers all external systems. **Procore is the foundational integration** and is governed by the dedicated subsection §18.1.

| Integration | Purpose | Project Mapping Field | Expected URL Field | Module Usage | Sync Direction | System of Record | Phase | Required / Optional | Configuration Owner | Health Check |
|---|---|---|---|---|---|---|---|---|---|---|
| Procore | (see §18.1) | `Procore Company ID` + `Procore Project ID` | `Procore Project URL` | Action Center, Document Control, Project Controls, Procurement & Buyout, Field Operations, Inspection Readiness, Closeout & Warranty, HBI Assistant | Reads from Procore in MVP; **selective writes deferred** (future amendment required) | Procore | Construction (mapping at Preconstruction) | Required (Active Construction); mapping placeholder created at provisioning | PCC Admin + IT / Integration Admin | Verify project mapping resolves; sync health within tolerance; no secrets in SharePoint surfaces |
| Sage Intacct | Job setup, budget, cost reporting, commitments, pay apps, invoices, final payment | `Sage Intacct Project ID` | (system URL) | Project Controls, Procurement & Buyout, Closeout | Reads from Sage Intacct | Sage Intacct | All | Required | Admin (with Accounting) | Verify project mapping resolves |
| Compass | Subcontractor prequalification, vendor profile, trade capacity, performance history | `Compass Project ID` | (system URL) | Procurement & Buyout, Subcontractor Performance | Reads | Compass | Construction | Optional | Admin | Verify mapping |
| Document Crunch | Prime contract review, subcontract review, obligation extraction, risk clauses, notice requirements | `Document Crunch Project / Workspace ID` | (system URL) | Contract & Compliance | Reads + outbound triggers | Document Crunch | Preconstruction → Construction | Optional | Admin | Verify mapping |
| Adobe Sign | Prime / subcontract execution, change order signatures, lien releases | `Adobe Sign Workspace / Account Mapping` | (system URL) | Contract & Compliance, Procurement & Buyout, Closeout | Outbound + inbound webhook | Adobe Sign | All | Required (Active Construction) | Admin | Verify webhook + mapping |
| Cupix | Existing conditions, progress capture, turnover / warranty visual records, location-based context | `Cupix Project ID` | (system URL) | Drawing & Model, Field Operations, Closeout & Warranty | Reads | Cupix | Construction → Warranty | Required (Luxury Residential); Optional otherwise | Admin | Verify project resolves |
| Microsoft Teams | Project communication, channel/team for project | `Teams Channel / Team ID` | `https://teams.microsoft.com/...` | Meeting & Communication | None (link-out) | Teams | All | Optional | Admin | Verify channel resolves |
| Outlook Calendar | Meetings, calendar reminders (e.g., 80-day NTO reminder) | (mapping per user) | (per user) | Meeting & Communication, Closeout | None (link-out) | Outlook | All | Optional | Admin (configure reminders) | Verify rules saved |

### 18.1 Procore Integration

> **Procore Architecture Decision.** Procore is the system of record for Procore-owned project-management workflows. PCC is the SharePoint-hosted project operating surface that summarizes, contextualizes, deep-links, and selectively materializes Procore data. PCC must not become a parallel Procore clone or a full SharePoint mirror of Procore transactional records.

The controlling local reference for Procore data modeling, canonical entities, subject areas, storage layers, and sync cadence is the Procore HB Intel data model package at:

```
docs/architecture/blueprint/sp-project-control-center/procore_hbintel_data_model_package/
```

#### 18.1.1 Purpose

Surface current-state summaries, readiness checks, exception queues, project-control indicators, and deep links into Procore. Store only curated, user-facing materializations and project-specific configuration in SharePoint.

#### 18.1.2 System-of-record posture

Procore remains the system of record for Procore-owned project-management workflows: RFIs, submittals, drawings, specifications, daily logs, inspections, observations, incidents, punch items, commitments, change events, prime contracts, budget views, requisitions / subcontractor invoices, direct costs, directory / companies / users, meetings, correspondence, photos / field media (when used).

**Sage Intacct remains the accounting book of record.** Procore may provide project-management-domain financial state — commitments, change events, requisitions, prime contract status, and project-level budget views — but PCC must label these as **Procore-sourced operational / project-management financial summaries**. PCC must never reposition Procore figures as accounting figures or use Procore values for general-ledger purposes.

#### 18.1.3 SPFx boundary

> **SPFx modules must not call the Procore API directly.** All Procore API interaction must route through `backend/functions/` or a later approved integration service boundary. The reasons: authentication, secret handling, rate limits, canonical mapping, logging, health checks, and error redaction.

#### 18.1.4 Backend-mediated access

```
SPFx PCC modules
  → HB backend/functions PCC API
    → Procore Integration Service
      → Procore API
```

The backend layer handles: Procore authentication; credential isolation; rate-limit handling; retry/backoff; API version tracking; sync orchestration; canonical mapping; raw payload retention (where appropriate); curated materialization; audit logging; sync health; diagnostics; redacted errors. The recommended (future) backend service boundary is `backend/functions/src/services/procore/` (auth, client, project-mapping, sync-orchestrator, subject-area-registry, canonical-mapper, materialization, sync-health, webhook-handler). **No code is created in this contract amendment.**

#### 18.1.5 Authentication posture

Per the package: **DMSA (Procore Direct Mobile Service Account)** is preferred for enterprise sync — backend-held system-to-system credentials. User-context OAuth flows are deferred until a user-action workflow requires them. Simple deep links require no API call (rely on the user's Procore session).

> **Procore client IDs, client secrets, refresh tokens, DMSA credentials, OAuth secrets, and environment credentials must never be stored in SharePoint lists, SPFx code, markdown docs, or client-side configuration.** A secret discovered in any of those surfaces is a `Security Risk` (§19.3) and a `T3 — IT-Approved Security Repair` (§19A).

Procore credentials are **not** held under HB SharePoint Creator (§20A boundary). Procore auth is a separate backend secret-management surface; specifics are tenant configuration recorded in §22.2.

#### 18.1.6 Storage strategy

Five surfaces, in order of authority and recency:

```
Procore API
  → Raw landing / integration store           (backend; replay / archive where appropriate)
  → Canonical relational layer                (backend; package's canonical entities)
  → SharePoint / HB Intel materialized layer  (curated summaries; selective)
  → Document/file storage                     (selective publish; no full binary mirror)
  → Deep links back to Procore                (always available; default user path)
```

Layer 5 (deep links) is the default user path. PCC promotes deep links over materialization wherever a Procore tool already provides the user experience.

#### 18.1.7 SharePoint materialization rules (allowed vs forbidden)

**Allowed in SharePoint** (per package §10):

- summaries (current-state),
- exceptions / readiness checks,
- action queues,
- mapping / configuration (§15.13),
- sync health (§15.13),
- audit (§15.13),
- lightweight object link records (§15.13).

**Forbidden / discouraged in SharePoint** (per package):

- raw Procore payloads,
- large transactional histories,
- high-volume detail records (timecards, production quantities, equipment events, daily-log segments at scale),
- bulk attachments,
- full financial line-item histories,
- drawing / spec / document metadata at uncontrolled scale,
- binary document replication.

The package document `10-SharePoint-HB-Intel-Integration-Recommendations.md` is authoritative for materialization decisions; this contract does not relax it.

#### 18.1.8 Sync cadence per subject area

Sourced from the package's recommended cadences:

| Subject Area | Cadence (default) | Notes |
|---|---|---|
| `project_management` (RFIs, submittals, observations) | near-real-time / event-based | Webhook preferred; polling fallback. |
| `quality_safety` (inspections, incidents, punch) | near-real-time / event-based | Same. |
| `field_execution` (daily logs, timecards, production qty) | hourly / intra-day | High-volume; canonical-layer first. |
| `financials` (commitments, change events, requisitions, budget views) | nightly + intra-day for active projects | Snapshot cadence per package. |
| `documents_design` (drawings, specs, document metadata) | nightly | Metadata only; no binary mirror. |
| `workflow` | daily to hourly | Phase 7 / Future Strategic. |

#### 18.1.9 Three-tier scope ladder

| Tier | Scope | Source |
|---|---|---|
| **PCC MVP** | Project Procore Mapping, launch / deep links, Procore Settings (read-only fields populated from mapping), Sync Health placeholder, Object Link pattern. **No summaries materialized.** | This contract §21.8 |
| **Procore Recommended Practical Model** (default future state) | Operational summaries and canonical-layer sync by subject area: directory + projects, RFIs, submittals, observations, inspections, incidents, punch, commitments, change events, requisitions, drawings/specs metadata, daily-log headers, timecards, production quantities, drawings/specs/document metadata, workflow instances, project roles. | Package `12-Core-vs-Extended-Scope-Recommendation.md` |
| **Full Strategic Enterprise** | Cross-project analytics, HBI grounding, broader workflow / coordination / equipment / telematics, raw-payload archival/replay, **governed write-back if approved**. | Package |

#### 18.1.10 MVP vs future scope

MVP scope is enumerated in §21.8. Anything beyond mapping + launch links + sync health placeholder is deferred to Recommended Practical or Full Strategic Enterprise.

#### 18.1.11 Write-back posture (deferred)

**MVP is read-only from Procore plus deep links.** PCC may create local PCC actions based on Procore data (e.g., a PCC Action Item that references an overdue Procore RFI), but **PCC must not create / update / delete Procore records** unless a future architecture amendment approves all of:

- user authorization model,
- permission mapping,
- audit trail,
- confirmation UI,
- rollback / error posture,
- legal / commercial ownership,
- Procore endpoint capability,
- sandbox validation.

Any pre-amendment write-back attempt is a `Security Risk`.

#### 18.1.12 Error / diagnostics rules

- User-facing errors must be plain language (§15.13.3 ErrorCategory mapping is canonical).
- Technical errors must be redacted; raw Procore payloads must never appear in SharePoint UI diagnostics.
- Credentials must never be displayed.
- Sync failures must be visible in Site Health (§19).
- Integration admins (PCC Admin + IT / Integration Admin) see subject-area health.
- Ordinary users see only useful status: healthy / delayed / unavailable / not configured.

#### 18.1.13 Security & audit rules

- No Procore secrets in SPFx, SharePoint lists, markdown docs, or repo source (R4).
- All Procore sync actions are audit-logged in Procore Integration Audit (§15.13.6).
- Credential access is backend-only.
- Environment separation is required for sandbox vs production (recorded in §22.2).
- High-risk permission use is logged.
- Quarterly Procore endpoint / version review (drives `LastVersionReviewDate` in §15.13.2).

#### 18.1.14 Rate-limit / retry / error posture

Backend handles rate-limit responses via retry-with-backoff. `ErrorCategory = RateLimited` (§15.13.3) maps to `Warning` severity and `T1` repair tier (auto-retry). Persistent `RateLimited` past a configurable threshold escalates to `Repair Required`.

#### 18.1.15 Terminology Alignment

PCC surface names diverge from the package's snake_case canonical layer. The Terminology Alignment table appears once for the contract here:

| Concept | Package (canonical / data layer) | PCC / SharePoint surface |
|---|---|---|
| Top-level grouping | `subject area` (six: `financials`, `project_management`, `documents_design`, `quality_safety`, `field_execution`, `workflow`) | "Procore Subject Area"; PCC stores per-project enablement in **Procore Subject Area Registry** (§15.13.2) |
| Canonical entity | bare snake_case (`project`, `rfi`, `submittal`, `observation`, `punch_item`, …) | Same names quoted; PCC objects that reference them use PCC field names |
| Lineage | `procore_company_id`, `procore_project_id`, `source_system_id`, `source_updated_at`, `ingested_at` | Canonical names retained at canonical layer; SharePoint surface mirrors as `ProcoreCompanyId`, `ProcoreProjectId`, `ProcoreObjectType`, `ProcoreObjectId`, `ProcoreObjectUrl`, `ProcoreLastSyncedAt`, `SourceSystem`, `CanonicalEntityId`, `CanonicalEntityType`, `MaterializedRecordId` |
| Storage layers | Raw landing → Canonical relational → SharePoint / HB Intel materialized → Document/file storage | Same; PCC adds **deep links back to Procore** as an explicit fifth surface |
| Scope tier | Minimum Viable / **Recommended Practical** (default) / Full Strategic Enterprise | Anchored in §18.1.9 / §21.8 |
| Wave priority | Wave 1–7 from `extraction_priority_matrix.csv` | Mapped to Phase 1–6 in the integration roadmap (blueprint §38) |
| Auth | DMSA preferred for enterprise sync | DMSA cited as the default backend posture; user-context OAuth deferred |

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
- Procore Project Mapping record exists (§15.13.1)
- `ProcoreProjectId` present (when `ProcoreSyncEnabled=true`)
- `ProcoreProjectUrl` present (when `ProcoreSyncEnabled=true`)
- Procore project reachable, when backend connectivity is configured
- enabled Procore subject areas healthy (§15.13.2 + §15.13.3)
- backend Procore credentials available for the configured environment
- last successful Procore sync within tolerance
- Procore sync errors are redacted (no raw payloads, tokens, or URLs containing secrets in PCC surfaces)
- required Procore tool deep links configured
- no stale Procore materializations beyond per-summary tolerance
- no Procore secret found in any SharePoint surface (R4)
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
| Procore secret discovered in any SharePoint surface (R4) | `Security Risk` |
| Missing `ProcoreProjectId` while `ProcoreSyncEnabled=true` | `Repair Required` |
| Missing Procore Project Mapping when sync was enabled previously | `Repair Required` |
| Procore Sync Health `ErrorCategory = AuthFailed` | `Security Risk` (§15.13.3) |
| Procore Sync Health `ErrorCategory = PermissionDenied` | `Repair Required` |
| Procore Sync Health `ErrorCategory = RateLimited` | `Warning` |
| Procore Sync Health `ErrorCategory = EndpointDeprecated` | `Warning` |
| Procore Sync Health `ErrorCategory = MappingMissing` | `Repair Required` |
| Procore Sync Health `ErrorCategory = ProjectNotFound` | `Repair Required` |
| Procore Sync Health `ErrorCategory = PartialSync` or `StaleData` | `Warning` |
| Procore Sync Health `ErrorCategory = MaterializationFailed` | `Repair Required` |
| Procore Sync Health `ErrorCategory = Unknown` | `Repair Required` |

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

## 19A. Repair Automation Tiers (frozen for MVP)

The repair posture is **automate the safe, structural, non-destructive cases; require approval for permission-and-security cases; never auto-mutate project data, users, or external mappings.**

### 19A.1 Tier matrix

| Tier | Authorization | Automation behavior | Examples |
|---|---|---|---|
| **T1 — Auto-Repair Allowed** | None beyond Site Health run | Repair runs automatically when drift is detected | Restore missing navigation node; recreate missing default view; reseed missing module configuration row; recreate integration placeholder record; add missing non-sensitive field; repair PCC page / app binding; recreate missing template version record from provisioning audit. |
| **T2 — Admin-Approved Repair** | PCC Admin acknowledges in Site Health UI | Repair runs after Admin click-through | Recreate missing required list; recreate missing required library; add missing required field on a sensitive list; recreate missing permission group; reapply missing global read-only group; rebind app / webpart on the main PCC page; reseed missing workflow records; restore expected module visibility. |
| **T3 — IT-Approved Security Repair** | IT (tenant admin) acknowledgement + audit reason | Repair runs after IT acknowledges; logged externally and re-validated | Restore governed permissions on `02_Contracts_and_Compliance`; restore governed permissions on `08_Project_Controls_and_Financials`; review / remove unauthorized folder-level permission grants; review / remove an external user added outside the PCC workflow; restore Project Control Center Admin group mapping; reconcile emergency IT manual change (§9.4 tier c). |
| **T4 — Manual / No Auto-Repair in MVP** | Out-of-band manual workflow | **Never automated in MVP.** Surface the issue with diagnostics; do not act. | Delete extra lists / libraries; delete or move project documents; remove users automatically; remove external users automatically; overwrite project metadata; rewrite all library permissions without review; resolve duplicate project sites; change external system mappings; modify Entra group membership; repair sync / shortcut state on user devices. |

### 19A.2 Severity → tier mapping

| Severity (§19.3) | Tier | Notes |
|---|---|---|
| `Info` | None / surface only | Recorded; no repair offered. |
| `Warning` | T1 if structural; otherwise surface only | Most navigation / cosmetic drift fits T1. |
| `Repair Required` | T1 or T2 depending on the asset | Default to T2 for required lists/libraries; T1 for navigation / view / module configuration / page binding. |
| `Blocking` | T2 | A required surface is missing; Admin acknowledges before repair runs. |
| `Security Risk` | T3 | Always requires IT acknowledgement. |
| `Provisioning Error` | T2 (replay last successful stage) or T3 (if security state is implicated) | Audited by Provisioning Run ID. |

### 19A.3 UI shape (Site Health → Repair)

The Site Health surface in Control Center Settings (§10) presents each finding with these columns:

```
Issue
Severity
Repair Eligibility       (T1 / T2 / T3 / T4)
Required Approval        (none / Admin / IT / out-of-band)
Repair Action            (specific action to be taken)
Before / After Audit     (recorded automatically)
Re-run Validation Result (after repair)
```

### 19A.4 Hard rules

- **Never auto-delete** project data (documents, list items, libraries, lists).
- **Never auto-remove** users without explicit Admin approval; never auto-remove external users (when external access is enabled in a future release).
- **Never overwrite** project-specific settings without confirmation.
- **Escalate** ambiguous, destructive, or security-sensitive drift to IT — do not guess.

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
12A. Procore Mapping Placeholder Created (§15.13.1; defaults `ProcoreSyncEnabled=false`)
12B. Procore Subject Area Registry Seeded (§15.13.2; six rows, one per package subject area; defaults `Enabled=false`; `ApiLifecycleStatus=Unknown` until first review)
12C. Procore Settings Initialized (§10.6 surface populated with mapping defaults)
12D. Procore Tool Deep Links Initialized (when `ProcoreProjectId` is provided; otherwise deferred to first configuration save)
12E. Procore Sync Health Placeholder Created (§15.13.3)
12F. Procore Site Health Checks Registered (per §19.1 Procore lines)
13. Workflow Templates Seeded (per §17)
14. Site Health Record Created
15. Final Validation Passed (includes the §19.1 line "no Procore secret found in any SharePoint surface")

A failure at any stage halts subsequent stages and produces a Provisioning Error with the failed stage recorded. A failed Procore stage (12A–12F) does **not** block stages 13–15 unless `ProcoreSyncEnabled=true` was requested at provisioning; otherwise mapping/registry placeholders are created and the project proceeds with Procore disabled.

### 20.2 Provisioning audit fields

`ProvisioningRunId`, `ProjectId`, `ProjectNumber`, `SiteUrl`, `TemplateVersion`, `TriggeredBy`, `TriggeredFrom`, `StartedAt`, `CompletedAt`, `Status`, `ValidationSummary`, `FailureReason`, `RepairAvailable`.

### 20.3 Implementation seam

The implementing service is `backend/functions/src/services/sharepoint-provisioning-service.ts`. Existing functions used:

`createSite()`, `documentLibraryExists()`, `createDataLists()`, `uploadTemplateFiles()`, `installWebParts()`, `setGroupPermissions()`, `assignGroupToPermissionLevel()`, `associateHubSite()`, `writeAuditRecord()`.

Provisioning audit records are owned by **Backend storage** (Data Ownership). The Project Site Health record on the site mirrors the latest summary.

---

## 20A. Required Graph Application Permissions for Provisioning

### 20A.1 Boundary statement

```
HB SharePoint Creator (registered application 08c399eb-a394-4087-b859-659d493f8dc7)
  uses APPLICATION permissions only for backend provisioning, repair, validation,
  and governed access mutation.

SPFx / PCC UI
  uses DELEGATED permissions only for user-facing reads, people search,
  and user-context actions.

Ordinary project users
  never receive Graph application permissions.
```

The application-permission surface is owned by `backend/functions/`. The delegated-permission surface is owned by `apps/project-control-center/` and `apps/document-control-center/` (future) and the `@hbc/ui-kit` `HbcPeoplePicker`.

### 20A.2 MVP target permission posture

```
MVP target (least-privilege):
  - Sites.Create.All
  - Sites.Selected

Conditional during implementation proof:
  - Sites.FullControl.All

Avoid unless required:
  - GroupMember.ReadWrite.All
  - Group.ReadWrite.All
  - broad tenant-wide Sites.Manage.All / Sites.ReadWrite.All
    (where Sites.Selected can replace them)
```

### 20A.3 Current registered-application permission state

Captured from the current admin-consent state of `HB SharePoint Creator` (Application ID `08c399eb-a394-4087-b859-659d493f8dc7`) for reference. No secrets are recorded.

**Currently granted:**

```
Group.ReadWrite.All           — Delegated
Group.ReadWrite.All           — Application
Sites.FullControl.All         — Delegated
Sites.FullControl.All         — Application
Sites.Manage.All              — Delegated
Sites.Manage.All              — Application
Sites.ReadWrite.All           — Delegated
Sites.ReadWrite.All           — Application
User.Read                     — Delegated
```

**Also shown / requested (delegated):**

```
Files.ReadWrite.All           — Delegated
Calendars.Read.Shared         — Delegated
openid                        — Delegated
profile                       — Delegated
User.ReadBasic.All            — Delegated
```

**Pending / not yet granted:**

```
GroupMember.ReadWrite.All     — Application
Sites.Selected                — Application
```

### 20A.4 Recommendation

```
Approve  : Sites.Selected (Application) — required for least-privilege
                                         selected-site access going forward.
Hold     : GroupMember.ReadWrite.All (Application) — only if backend must
                                                     mutate Entra group membership;
                                                     not required for MVP project-local
                                                     SharePoint group operations.
Add /    : Sites.Create.All (Application) — evaluate as the future least-privilege
evaluate                                    site-creation permission once provisioning proof
                                            confirms it can replace Sites.FullControl.All.
Document : Broad Sites.*.All permissions (FullControl.All, Manage.All, ReadWrite.All)
           are TEMPORARY / BOOTSTRAP permissions retained only until provisioning proof
           determines what can be removed. They are reviewed quarterly (§20A.7).
```

### 20A.5 Permission register

| Permission | Type | Current Status | MVP / Future | Used By | Used For | Risk Level | Approval Owner | Runtime Controls | Target Disposition |
|---|---|---|---|---|---|---|---|---|---|
| `Sites.Create.All` | Application | Not granted | MVP target | `backend/functions/` | Create project site under tenant policy | Medium | IT + Architecture | Backend service principal only; audit on every create | **Add** when implementation proof confirms |
| `Sites.Selected` | Application | Pending | MVP target | `backend/functions/` | Selected-site read/write per granted site | Low | IT | Per-site grant; never tenant-wide | **Approve** |
| `Sites.FullControl.All` | Application | Granted | Conditional during proof | `backend/functions/` | Bootstrap during early provisioning while exact required surface unknown | High | IT + Architecture | Backend service principal only; quarterly review | **Reduce / remove** after proof |
| `Sites.Manage.All` | Application | Granted | Bootstrap | `backend/functions/` | Configure site features during provisioning | High | IT + Architecture | Backend service principal only | **Reduce / remove** if `Sites.Selected` covers |
| `Sites.ReadWrite.All` | Application | Granted | Bootstrap | `backend/functions/` | Tenant-wide site read/write during provisioning | High | IT + Architecture | Backend service principal only | **Reduce / remove** if `Sites.Selected` covers |
| `Group.ReadWrite.All` | Application | Granted | Bootstrap | `backend/functions/` | M365 Group / Teams provisioning calls | High | IT + Architecture | Backend service principal only | **Hold** pending Teams provisioning proof |
| `GroupMember.ReadWrite.All` | Application | Pending | Conditional | `backend/functions/` | Mutate Entra group membership | High | IT + Architecture | Backend service principal only; only if backend must add/remove members of central Entra groups | **Hold** unless required |
| `Sites.FullControl.All` | Delegated | Granted | Bootstrap | (admin tools) | Manual site administration where required | High | IT | Limited to IT admins | Document and review |
| `Sites.Manage.All` | Delegated | Granted | Bootstrap | (admin tools) | Manual site management | High | IT | Limited to IT admins | Document and review |
| `Sites.ReadWrite.All` | Delegated | Granted | Bootstrap | (admin tools) | Admin reads/writes | High | IT | Limited to IT admins | Document and review |
| `Group.ReadWrite.All` | Delegated | Granted | Bootstrap | (admin tools) | Admin Group operations | High | IT | Limited to IT admins | Document and review |
| `Files.ReadWrite.All` | Delegated | Granted | Future | PCC / DCC | User-context file operations through PCC / DCC | Medium | Architecture | Per-user context only; bound by SharePoint ACLs | Keep delegated only |
| `User.Read` | Delegated | Granted | MVP | All apps | Sign-in profile | Low | Architecture | Per-user context | Keep |
| `User.ReadBasic.All` | Delegated | Requested | MVP | PCC (people picker) | People search through `HbcPeoplePicker` | Low | Architecture | Per-user context | **Approve** for delegated UX |
| `Calendars.Read.Shared` | Delegated | Requested | Future | PCC / Meeting & Communication | Read shared calendars for meeting surfaces | Low | Architecture | Per-user context | Keep when meetings module enables |
| `openid`, `profile` | Delegated | Requested | MVP | All apps | OIDC sign-in scopes | Low | Architecture | Standard OIDC | **Approve** |

### 20A.6 Operation → permission matrix

For each provisioning / governance operation, the likely API surface and permission. Several operations require **SharePoint REST or PnP** rather than Microsoft Graph; those rely on app-only authentication against SharePoint and are recorded as Remaining Open (§22.2) until implementation proof is complete.

| Operation | Likely API surface | Likely permission | Notes |
|---|---|---|---|
| Create project site | Graph: `POST /sites/add` (or SharePoint REST site creation) | `Sites.Create.All` (Graph) or SharePoint app-only | Implementation proof determines path. |
| Grant selected-site permission | Graph: `POST /sites/{id}/permissions` | `Sites.Selected` | Per-site grant. |
| Read site by URL / ID | Graph: `GET /sites/{hostname}:/sites/{path}` | `Sites.Read.All` or `Sites.Selected` (if granted) | |
| Create libraries | Graph: `POST /sites/{id}/lists` (template `documentLibrary`); or SharePoint REST | `Sites.Manage.All` or `Sites.Selected` | |
| Create lists | Graph: `POST /sites/{id}/lists`; or SharePoint REST | `Sites.Manage.All` or `Sites.Selected` | |
| Create fields / views / content types | SharePoint REST / PnP (Graph coverage limited) | SharePoint app-only | Implementation proof. |
| Upload seed files | Graph: `PUT /drive/items/.../content`; or SharePoint REST | `Files.ReadWrite.All` (delegated for user uploads) or app-only | |
| Install / configure PCC app | SharePoint App Catalog / PnP | SharePoint app-only | Implementation proof. |
| Create SharePoint groups | SharePoint REST / PnP | SharePoint app-only | Project-local groups; **runtime IDs not hardcoded** (§11.2A). |
| Apply global read-only Entra group to SharePoint group | Graph: `POST /sites/.../permissions`; or SharePoint REST | `Sites.Selected` + `Group.Read.All` | Add Entra group as a SharePoint group member. |
| Add / remove user from project-local SharePoint group | SharePoint REST / PnP | SharePoint app-only | Audited via Project Access Audit. |
| Add / remove user from central Entra group | Graph: `POST /groups/{id}/members/$ref` | `GroupMember.ReadWrite.All` or `Group.ReadWrite.All` | Only if backend must mutate central Entra group membership. |
| Write provisioning audit | Backend storage write (no Graph) | (backend) | Owned by `backend/functions/`. |
| Run Site Health | Graph + SharePoint REST reads | `Sites.Selected` (post-grant) | Read-only checks. |
| Repair drift | Same as the affected operation, scoped to repair tier (§19A) | as above | Audited; tiered. |

### 20A.7 Security controls

- **No secrets in repo.** Client secrets and certificates live in Azure Key Vault and are never committed.
- **No raw token logging.** Tokens redacted in diagnostics.
- **High-risk permission use is logged** with operation, target site/group, actor service principal, and run ID.
- **Quarterly app permission review.** Architecture + IT review the register; reduce or remove broad `Sites.*.All` permissions where `Sites.Selected` can replace them.
- **Failed permission operations** produce redacted diagnostics. The diagnostics bundle is downloadable from Site Health (Admin / IT only).
- **Broad permissions are reviewed for removal** after provisioning proof.
- **`Sites.Selected`** is the **target** ongoing selected-site access model.
- **Procore credentials are not held under HB SharePoint Creator.** Procore authentication (DMSA / OAuth) is a separate backend secret-management surface owned by the future `backend/functions/src/services/procore/` boundary. Cross-reference §18.1.5 and the R4 no-secrets-in-SharePoint validation rule.

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

### 21.5 MVP permission templates (frozen)

The MVP enables **10 internal templates** (per §12.4): `pcc_admin`, `global_read_only`, `executive_oversight`, `project_viewer`, `estimating_preconstruction`, `project_team_member`, `project_management`, `field_operations`, `project_accounting`, `safety_qaqc`. **`Estimating / Preconstruction` is a first-class MVP template.**

The three external templates (`external_design_team`, `owner_client_viewer`, `subcontractor_limited`) are **defined architecturally but disabled** (see §11.5).

### 21.6 MVP sync policy (frozen)

Per §14.3: low-risk operational libraries ship with `Shortcut Allowed`; drawings / RFIs / media ship with `Online Only`; contracts / financials / archive ship with `Sync Blocked`. `Sync Allowed` is not a default in MVP and requires the §14.5A governed elevation exception when justified.

### 21.7 MVP boundaries

- Action Center, Project Controls Center, Contract & Compliance Center, Drawing & Model Center, Field Operations Center, Meeting & Communication Center, Risk / Issues / Decision Log, Procurement & Buyout Center, Subcontractor Performance Center, Lessons Learned Center, HBI Assistant: **Future** (modules created with empty/disabled state where required by Object Catalog, per §4B rules; UI hidden).
- Library `08_Project_Controls_and_Financials`, `09_Photos_Videos_and_Reality_Capture`, `07_Meetings_and_Communications`, `11_Lessons_Learned_and_Reports`: **Future** (created at provisioning if module enables them; otherwise skipped).
- External users: **Disabled in MVP** (frozen — see §11.5).
- External-facing project-local SharePoint groups (`PCC-{ProjectBaseNumber}-ExternalDesignTeam`, `…-OwnerClientViewer`, `…-SubcontractorLimited`): **Not provisioned in MVP** (frozen).
- Per-project Entra groups: **Not created in MVP** (frozen — see §11.2A).

### 21.8 Procore MVP scope (frozen — Phase 1 only)

Phase 1 MVP for Procore is **mapping + launch links + sync health placeholder only**. No summaries are materialized in MVP.

| Procore element | MVP behavior |
|---|---|
| Project Procore Mapping (§15.13.1) | One row created at provisioning with `ProcoreSyncEnabled=false`; populated when configuration entered through §10.6 Procore Settings. |
| Procore Subject Area Registry (§15.13.2) | Six rows seeded at provisioning, one per package subject area (`financials`, `project_management`, `documents_design`, `quality_safety`, `field_execution`, `workflow`); all `Enabled=false`. |
| Procore Launch Links | Generated from `ProcoreProjectUrl` once present; visible in the PCC UI. |
| Procore Settings (§10.6) | Read-only fields populated from the mapping; edit available to PCC Admin / IT / Integration Admin. |
| Procore Sync Health Placeholder (§15.13.3) | Empty record exists; populated when a subject area is enabled. |
| Procore Object Link pattern (§15.13.4) | Defined; no rows created in MVP. |
| Procore Curated Summaries (§15.13.5) | **Deferred** to Recommended Practical (§18.1.9). No rows in MVP. |
| Backend integration | The future `backend/functions/src/services/procore/` boundary is **declared** in §18.1.4; **not implemented** in MVP. |
| Write-back | **Deferred** unconditionally; gated by future amendment per §18.1.11. |

Curated summaries, canonical-layer sync, and write-back are deferred to **Recommended Practical** or **Full Strategic Enterprise** per §18.1.9. Cross-reference §18.1 for the full integration contract.

---

## 22. Open Decisions / Architecture Freeze Items

This section is now split into **Frozen for MVP** (§22.1) and **Remaining Open** (§22.2). Frozen items are governed by the sections cited; do not relitigate them without an architecture amendment.

### 22.1 Frozen for MVP

| # | Decision | Resolution | Section |
|---|---|---|---|
| F1 | Project site URL convention | First six characters of the accounting project number with non-numeric stripped → `/sites/{ProjectBaseNumberNoHyphen}` | §5.1 |
| F2 | Microsoft 365 Group / Teams connection posture | Sites are M365 / Teams connected by default; Teams membership limited to active project team members; Global Read-Only and IT repair users not auto-added to Teams | §11.6, §10.5 |
| F3 | Entra group / SharePoint group mapping model | Hybrid model: central Entra groups for tenant-wide roles, project-local SharePoint groups (`PCC-{ProjectBaseNumber}-…`) for permission templates; no per-project Entra groups in MVP. **Object IDs remain tenant configuration** (recorded in §22.2). | §11.2A, §12.4 |
| F4 | External users in first release | **No external users in MVP.** Three external templates defined architecturally but disabled. | §11.5 |
| F5 | Permission-template mappings | 13 templates total, 10 MVP, 3 deferred; custom permission levels (`HB Read`, `HB Contribute No Delete`, `HB Contribute`, `HB Manage Project Content`, `Full Control`); `Estimating / Preconstruction` first-class; `Project Team Member` → `PCC-{ProjectBaseNumber}-ProjectTeam` (corrected). | §12 |
| F6 | Library sync / shortcut allowlist | Four-state policy (`Online Only` / `Shortcut Allowed` / `Sync Allowed` / `Sync Blocked`); MVP defaults `Shortcut Allowed` for low-risk operational; `Online Only` for drawings / RFIs / media; `Sync Blocked` for contracts / financials / archive. `Sync Allowed` requires §14.5A governed exception. | §14.2, §14.3 |
| F7 | Site-local vs HBCentral ownership for access audit, lessons learned, subcontractor history, closeout summaries | Dual-record model: site-local working record, HBCentral approved / enterprise record, backend canonical audit, external SoR for transactional. Lifecycle rules per §15.1B. | §15.1, §15.1A, §15.1B |
| F8 | Repair automation scope | Four tiers (T1 Auto / T2 Admin / T3 IT / T4 Manual); never auto-delete data, auto-remove users, auto-mutate external mappings. | §19A |
| F9 | Required Graph application permissions for provisioning | Boundary: app perms in backend, delegated in PCC, none for ordinary users. MVP target: `Sites.Create.All` + `Sites.Selected`; broad `Sites.*.All` retained as bootstrap pending implementation proof. | §20A |

### 22.2 Remaining Open (must be resolved per item before the listed implementation phase)

1. **Exact central Entra group object IDs** for `HB-PCC-Global-Read-All`, `HB-PCC-IT-Site-Repair-Admins`, `HB-PCC-Template-Owners` (and deferred `HB-PCC-External-Access-Approvers`). Tenant configuration values recorded outside this contract.
2. **Exact SharePoint group IDs generated per project** at provisioning. Runtime values; recorded in Project Site Configuration after provisioning.
3. **Mapped roleDefinitions** for the five custom permission levels (§12.2).
4. **Whether external users are allowed in a future release** (timing + scope).
5. **External access approval workflow** (when external access is enabled): exact gating, approval routing, expiration policy, periodic-review cadence.
6. **Final app-only permission reduction** after provisioning proof (which broad `Sites.*.All` can be removed once `Sites.Selected` covers).
7. **Exact SharePoint REST / PnP permissions required** for non-Graph operations (custom permission levels, content types, view creation, page binding, app catalog operations).
8. **Per-project phase exception URL suffix convention** for the rare case where a phase requires its own site (§5.5).
9. **Tenant / device-level OneDrive sync enforcement policy** (Intune / device-config layer outside SharePoint UI).
10. **Whether Project Access Audit mirrors to HBCentral** on every event or batches; HBCentral schema additions required for the enterprise registry (§15.1C).
11. **Promotion / approval workflows** for site-local → HBCentral promotion (lessons learned, subcontractor performance, closeout summary): exact actors and triggers (§15.1B).
12. **Project-type enum** finalization and per-project-type integration requirements (§4B). Currently a proposed enum; final values pending operations review.
13. **Repair automation scope edge cases** beyond the §19A tier list (e.g., orphaned external integration mappings).
14. **Default expirations** for non-external permission templates (currently `None`).
15. **HBI Assistant first-release scope** (still deferred; see §8 / §23 Phase 8).
16. **Per-project-type list seeding** beyond the conditional rules in §4B.2.
17. **HB SharePoint Creator permission grants** for `Sites.Selected` and review of `GroupMember.ReadWrite.All` (per §20A.4 recommendation).
18. **Procore authentication model** — DMSA confirmation vs user-context OAuth scope; final disposition.
19. **Procore credential storage location** — backend secret manager (Azure Key Vault assumed); explicit binding decision.
20. **Procore Company ID strategy** — single-company vs multi-company tenant; how the company is resolved per project.
21. **Project mapping owner** — which role triggers initial Procore mapping (Estimating Coordinator vs Project Accountant vs Admin) and which triggers a re-mapping.
22. **MVP-enabled subject areas beyond mapping/launch links** — current default is none; if any are enabled at first release, which.
23. **Sync cadence per subject area** — reconcile to package defaults; per-project overrides allowed?
24. **Webhooks vs scheduled polling** — package recommends event-based for transactional, polling for reference; final decision per subject area.
25. **Canonical storage target choice** — backend persistence engine for the canonical relational layer (Postgres, SQL Server, Cosmos, etc.); not yet selected.
26. **Raw payload retention policy** — whether to retain raw Procore payloads for replay; retention window.
27. **SharePoint materialization boundaries** — confirm package allowed/forbidden lists hold; any per-summary deviations?
28. **Procore vs Sage financial SoR boundaries** — confirm §18.1.2 R5 wording at adoption time; any operational reports that need cross-source reconciliation.
29. **Write-back governance** — when (if ever) to enable; the §18.1.11 nine-gate amendment scope.
30. **Rate-limit / retry policy** — exact thresholds and backoff parameters.
31. **Endpoint version tracking cadence** — quarterly review confirmed; who owns the review (Architecture vs Integration Admin).
32. **Sandbox vs production environment separation** — environment matrix, DMSA per environment, configuration-record split.
33. **Procore data deletion / archive policy** — per subject area; aligns to package retention guidance.
34. **External-user / Procore-directory reconciliation** — when external users are enabled in a future release, how Procore directory entries map to PCC permission templates.

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
9. **Procore representability** — schema must represent `procoreMapping` (§15.13.1), `procoreSubjectAreas` (§15.13.2 — including the endpoint / version fields `EndpointName`, `EndpointVersion`, `ApiLifecycleStatus`, `LastVersionReviewDate`, `VersionRisk`), `procoreSyncHealth` (§15.13.3 — including the `ErrorCategory` enum), `procoreObjectLinks` (§15.13.4), `procoreMaterializations` (§15.13.5), and `procoreLineageFields` (the canonical-layer snake_case set and the SharePoint-surface PascalCase mirror per §18.1.15). Provenance back to §15.13 and §18.1 anchors is required.

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
