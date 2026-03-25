# P3-E3: Spreadsheet/Document Replacement Reference Note Set

| Field | Value |
|---|---|
| **Doc ID** | P3-E3 |
| **Phase** | Phase 3 |
| **Workstream** | E — Always-on core module delivery and PH7 reconciliation |
| **Document Type** | Note |
| **Owner** | Architecture + Project Hub platform owner |
| **Update Authority** | Architecture lead; changes require review by Experience lead and Project Hub platform owner |
| **Last Reviewed Against Repo Truth** | 2026-03-21 |
| **References** | [Phase 3 Plan §12](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md); [P3-E1](P3-E1-Phase-3-Module-Classification-Matrix.md); [P3-E2](P3-E2-Module-Source-of-Truth-Action-Boundary-Matrix.md); [`docs/reference/example/`](../../../reference/example/); [PH7 Plans (ADR-0091)](../../ph7-project-hub/) |

---

## Note Statement

This note makes the spreadsheet/document replacement intent **explicit and implementation-guiding** for each Phase 3 operational module. It maps current document/spreadsheet workflows to the Project Hub module capabilities that replace them, with direct references to the baseline example files in `docs/reference/example/`.

Phase 3 Plan §20 directs: "Treat spreadsheet/document replacement notes as implementation instructions, not commentary." Phase 3 Plan §19.2 identifies a mitigation strategy: "Encode spreadsheet/document replacement notes directly in phase deliverables." This note fulfills both directives.

Each replacement note identifies:
- **What is being replaced** (the current document/spreadsheet workflow)
- **What replaces it** (the Project Hub module capability)
- **Reference example files** (baseline artifacts in `docs/reference/example/` for implementation alignment)
- **Replacement scope** (what the module handles vs. what remains external)
- **Future integration notes** (planned enhancements beyond Phase 3 scope)

**Repo-truth audit — 2026-03-21.** `docs/reference/example/` contains 130+ reference artifacts covering financial spreadsheets, schedule files, constraint worksheets, safety plans/checklists, permit lists, estimating templates, and project management documents. PH7 plans reference these for replacement alignment. No existing replacement mapping document exists — this note fills that gap.

---

## Note Scope

### This note governs

- Per-module replacement mapping (current workflow → Project Hub capability)
- Reference example file alignment for each module
- Replacement workflow notes and implementation guidance
- Future integration and enhancement notes

### This note does NOT govern

- Module classification — see [P3-E1](P3-E1-Phase-3-Module-Classification-Matrix.md)
- Source-of-truth and action-boundary rules — see [P3-E2](P3-E2-Module-Source-of-Truth-Action-Boundary-Matrix.md)
- Module implementation details — governed by PH7 plans and execution sequencing
- Lane depth differences — see [P3-G1 §4](P3-G1-Lane-Capability-Matrix.md)

---

## 1. Current-State Reconciliation

| Artifact | Status | Relevance |
|---|---|---|
| `docs/reference/example/` | **Live** — 130+ files | Baseline example artifacts for replacement alignment |
| PH7 plans (ADR-0091) | **Locked** — 16 plans | Reference these examples for module behavior definition |
| Replacement mapping document | **Gap** | Did not previously exist — this note fills the gap |
| P3-E1 §3 boundary rules | **Locked** | High-level replacement intent per module |
| P3-E2 source-of-truth | **Locked** | Authority rules governing what Project Hub owns |

---

## 2. Financial Replacement Notes

### 2.1 What is being replaced

The current financial workflow relies on spreadsheets for budget tracking, forecasting, GC/GR modeling, and cash flow management. Project teams manually maintain these files, share via email or SharePoint, and reconcile against Procore budget exports.

### 2.2 Reference example files

| File | Purpose | Replacement target |
|---|---|---|
| `Procore_Budget.csv` | Procore budget export | Budget import ingestion source |
| `Financial Forecast Summary & Checklist.xlsx` | Financial forecasting and checklist tracking | Editable Financial Summary working state + forecast checklist |
| `GC-GR Forecast.xlsm` | GC/GR forecast model (macro-enabled) | Governed GC/GR working model |
| `HB Draw Schedule -Cash Flow.xlsx` | Cash flow tracking and draw schedule | Interactive Cash Flow working model |
| `Buyout Log_Template 2025.xlsx` | Buyout tracking template | Financial sub-domain Buyout working state |
| `Procore budget report.pdf` | Budget report reference | Export/report output reference |
| `budget_details.numbers` | Budget details (Apple Numbers format) | Budget import alternate format reference |
| `cost-code-dictionary.csv` | Cost code reference data | Cost code structure reference |

### 2.3 Replacement scope

| Current workflow | Project Hub replacement | Notes |
|---|---|---|
| Manual budget spreadsheet maintenance | **Budget import** — structured CSV ingestion with validation | Interim: CSV upload; future: direct Procore API |
| Financial Forecast Summary spreadsheet | **Editable Financial Summary** — governed working state | Replaces manual spreadsheet with collaborative editing |
| GC-GR Forecast macro workbook | **GC/GR working model** — interactive governed model | Eliminates macro dependency; structured data model |
| Cash Flow spreadsheet | **Cash Flow working model** — interactive projection | Replaces manual spreadsheet with connected projections |
| Forecast checklist (spreadsheet tabs) | **Forecast checklist completion** — structured tracking | Status tracking with completion state |
| Manual exposure tracking | **Exposure tracking** — quantified with alerts | Proactive flag system vs. manual monitoring |
| Buyout template | **Buyout working state** — within Financial domain | Structured buyout tracking (P3-E1 §4.1) |
| Email/manual report distribution | **Export** — governed data export | Structured export replacing ad hoc sharing |

### 2.4 Future integration

- **Procore API direct integration** replaces CSV upload as the budget import path (Phase 3 Plan §12.1 implementation note)

---

## 3. Schedule Replacement Notes

### 3.1 What is being replaced

Schedule data currently lives in external systems (Primavera P6, Microsoft Project) with manual file exports shared via file servers or SharePoint. Milestone tracking and forecast management rely on informal processes.

### 3.2 Reference example files

| File | Purpose | Replacement target |
|---|---|---|
| `Project_Schedule.xer` | Primavera P6 export | Schedule file ingestion source |
| `Project_Schedule.xml` | Microsoft Project XML export | Schedule file ingestion source |
| `Project_Schedule.csv` | Schedule data CSV export | Schedule file ingestion source |

### 3.3 Replacement scope

| Current workflow | Project Hub replacement | Notes |
|---|---|---|
| Manual schedule file sharing | **Schedule file ingestion** — governed upload with history and restore | XER, XML, CSV support; upload history tracked |
| Informal milestone tracking | **Milestone tracking** — structured milestone state | Normalized milestone visibility |
| Manual milestone creation | **Manual milestone management** — user-created milestones | Independent of upstream schedule |
| Ad hoc forecast adjustments | **Governed forecast overrides** — overrides with provenance | Tracked: who, when, why (P3-E2 §12.2) |
| No projection integration | **Schedule projections** — into home, health, financial, reports | Cross-module schedule context |

### 3.4 Boundary note

Project Hub is NOT full CPM authoring. Upstream schedule systems remain authoritative for detailed baseline/update data and full CPM network logic (P3-E2 §4.3). Project Hub owns the normalized operational schedule context.

---

## 4. Constraints Replacement Notes

### 4.1 What is being replaced

Constraints, change tracking, and delay logging currently rely on worksheet-based processes — Excel spreadsheets and CSV files maintained by project teams with manual delay quantification.

### 4.2 Reference example files

| File | Purpose | Replacement target |
|---|---|---|
| `HB_ConstraintsLog_Template.xlsx` | Constraint log template | Operational constraint ledger |
| `Project Delay Log_2025.csv` | Delay log tracking | Delay Log with quantified impact |
| `constraints.json` | Structured constraint data | Data model reference |

### 4.3 Replacement scope

| Current workflow | Project Hub replacement | Notes |
|---|---|---|
| Constraint log spreadsheet | **Constraint CRUD** — create, update, close constraints | Full operational ledger replacing worksheet |
| Manual change tracking | **Change Tracking entries** — structured management | Replaces informal change documentation |
| Delay log CSV | **Delay Log entries** — managed with quantified impact | Replaces manual delay tracking |
| Manual due date tracking | **Due dates / BIC / responsibility / comments** — governed | Proactive tracking with BIC integration |
| Spreadsheet-based delay estimation | **Delay impact quantification** — integrated cross-module | Replaces manual estimation with cross-module linkage |
| Manual export/sharing | **Export** — governed data export | Structured export |

---

## 5. Permits Replacement Notes

### 5.1 What is being replaced

Permit and inspection tracking currently relies on spreadsheets and standalone document management, with manual monitoring of expiration dates and inspection schedules.

### 5.2 Reference example files

| File | Purpose | Replacement target |
|---|---|---|
| `10b_20260220_RequiredInspectionsList.xlsx` | Required inspections checklist | Linked required inspections |
| `permits.json` | Structured permit data | Data model reference |

### 5.3 Replacement scope

| Current workflow | Project Hub replacement | Notes |
|---|---|---|
| Permit tracking spreadsheet | **Permit log management** — operational ledger | Full permit lifecycle tracking |
| Separate inspection documents | **Linked required inspections** — inspection linkage | Inspections linked to permits |
| Manual status tracking | **Inspection results/status summaries** — aggregated | Summary views with status tracking |
| Manual expiration monitoring | **Expiration/status tracking** — proactive alerts | Replaces manual date watching |
| Scattered notes | **Comments/notes** — per-permit | Structured comment history |
| Manual export | **Export** — governed data export | Structured export |

### 5.4 External references

Jurisdictional artifacts/documents and governed storage locations may exist outside Project Hub. Project Hub maintains canonical references back to the permit ledger (P3-E2 §6.2).

---

## 6. Safety Replacement Notes

### 6.1 What is being replaced

Safety management currently relies on a **Site Specific Safety Plan** (SSSP) file-based workflow — a Word document template maintained per-project — and a weighted safety checklist baseline in Excel. JHA forms, incident reports, and orientation tracking use separate document workflows.

### 6.2 Reference example files

| File | Purpose | Replacement target |
|---|---|---|
| `Site Specific Safety Plan - NORA.docx` | Site-specific safety plan template | Structured project safety-plan state |
| `JHA Instructions Sheet.docx` | JHA instructions reference | JHA process guidance |
| `JHA form 2026.docx` | JHA log form | JHA log records |
| `Safety Checklist Template - Weighted.xlsx` | Weighted safety inspection checklist | Checklist/inspection aggregation |
| `Incident Report .docx` | Incident report form | Incident-report working state |
| `Tropical Storm_Hurricane Preparedness Plan.pdf` | Emergency response plan | Emergency-plan acknowledgment state |
| `Project_Safety_Checklist.pdf` | Startup safety readiness check — **RECLASSIFIED to Project Startup** (P3-E11-T07); NOT the ongoing safety checklist | See §8.4 reclassification note |
| `CrisisComs/Emergency Contact Card.pdf` | Emergency contact reference | Emergency plan component |
| `CrisisComs/HBC Crisis Communication Plan_KREPS 8.15.2025.pdf` | Crisis communication plan | Emergency plan component |
| `CrisisComs/ICE Action Plan - Field.pdf` | ICE response plan | Emergency plan component |

### 6.3 Replacement scope

| Current workflow | Project Hub replacement | Notes |
|---|---|---|
| SSSP Word document | **Structured project safety-plan state** | Document → governed structured state |
| Manual subcontractor forms | **Subcontractor acknowledgments** | Paper/email → digital records |
| Manual orientation tracking | **Safety orientation records** | Spreadsheet/forms → structured records |
| Weighted safety checklist Excel | **Checklist/inspection aggregation** | Template → aggregated point system |
| JHA paper/Word forms | **JHA log records** | Forms → structured log entries |
| Emergency plan PDFs | **Emergency-plan acknowledgment state** | PDFs → acknowledgment tracking |
| Incident report Word forms | **Incident-report working state + notification** | Forms → working state with notifications |
| Manual follow-up tracking | **Linked safety follow-up actions** | Ad hoc → structured linked actions |

### 6.4 Future integration

- **Smart toolbox-talk topic generation** — linked to high-risk schedule activities surfaced approximately one week before the activity start (Phase 3 Plan §12.5 future-state note)

---

## 7. Reports Replacement Notes

### 7.1 What is being replaced

PX Review and Owner Report currently involve manual assembly — pulling data from multiple module spreadsheets, writing narratives in Word, formatting in PDF, and distributing via email.

### 7.2 Replacement scope

| Current workflow | Project Hub replacement | Notes |
|---|---|---|
| Manual data gathering from modules | **Auto-assembly from module snapshots** | Reports consumes spine data at generation time |
| Word/PDF narrative writing | **PM narrative override** — governed editing | Structured narrative within governed draft |
| Manual draft management | **Governed draft refresh + staleness handling** | Automatic staleness detection and refresh |
| Ad hoc report generation | **Queued governed generation** | Structured generation pipeline |
| No run tracking | **Run-ledger tracking** — full history | Every generation tracked |
| Manual PDF/email distribution | **Export, release, and distribution state** | Governed release lifecycle |

### 7.3 Boundary note

Reports is a governed report workspace, NOT a simple launcher and NOT a full freeform authoring system. Module snapshot data is consumed, not owned, by Reports (P3-E2 §8.3). Minimum governed families: PX Review, Owner Report.

---

## 8. Project Closeout Notes

Project Closeout is an **always-on lifecycle module** that activates when a project enters the closeout phase. It owns the operational data for all closeout execution and publishes snapshots to the Reports module for release artifacts.

### 8.1 Reference example files

| File | Purpose | Replacement Module | Status |
|---|---|---|---|
| `06 20260307_SOP_SubScorecard-DRAFT.xlsx` | Subcontractor performance scorecard | Project Closeout — SubScorecard sub-surface | **Phase 3** — field spec in P3-E10-T06 |
| `07 20260307_SOP_LessonsLearnedReport-DRAFT.xlsx` | Lessons learned report | Project Closeout — Lessons Learned sub-surface | **Phase 3** — field spec in P3-E10-T05 |
| `Project_Closeout_Checklist.pdf` | 70-item closeout checklist (7 sections) | Project Closeout — Closeout Checklist sub-surface | **Phase 3** — field spec in P3-E10-T03 |

### 8.2 Replacement scope

All three files are replaced by the Project Closeout module in Phase 3. The module owns:
- The 70-item operational closeout checklist (replacing the PDF-based workflow)
- Subcontractor scorecard entry and publication to the SubIntelligence org index (derived read model; replacing the Excel SOP)
- Lessons learned structured entry and publication to the LessonsIntelligence org index (derived read model; replacing the Excel SOP)

The Reports module assembles SubScorecard and Lessons Learned entries into release artifacts when the project reaches `PE_APPROVED` publication status (P3-E2 §14.4, P3-E10-T11 §2).

### 8.3 Quality Control / Warranty Notes

Quality Control is now a **first-class internal Phase 3 Project Hub control surface** governed by [P3-E15](P3-E15-QC-Module-Field-Specification.md). Phase 3 QC replacement scope is no longer limited to lifecycle placement: it includes governed quality plans, reviews, review findings, QC issues and corrective actions, deviations, evidence references, external approval dependencies, submittal-completeness advisory, quality health/readiness projections, and downstream lifecycle handoffs. Only deeper field/mobile execution depth remains deferred.

Warranty remains a **first-class lifecycle module** governed by [P3-E14](P3-E14-Project-Warranty-Module-Field-Specification.md). Phase 3 includes the internal Layer 1 operating surface; only external collaborative workspace and deeper field-first execution remain deferred.

### 8.4 Project Startup Notes

Project Startup is an **always-on lifecycle module** that is active from project creation. It owns the operational data for all project mobilization activities.

| File | Purpose | Replacement Module | Status |
|---|---|---|---|
| `Job Startup Checklist.pdf` | 55-item startup operational checklist (4 sections) | Project Startup — Job Startup Checklist sub-surface | **Phase 3** — field spec in P3-E11-T03 |
| `Project_Startup_Checklist.pdf` | Same checklist as above; Procore inspection template export | Project Startup — Job Startup Checklist sub-surface | **Phase 3** — field spec in P3-E11-T03 |
| `Project_Safety_Checklist.pdf` | 32-item startup safety readiness check (Pass/Fail/N/A) — NOT the ongoing Safety module checklist | Project Startup — Jobsite Safety Checklist sub-surface | **Phase 3** — field spec in P3-E11-T07; reclassified from Safety domain (see §6.2 note) |
| `Responsibility Matrix - Template.xlsx` | PM (71 assignment rows + 11 reminder rows × 7 assignment roles) + Field (27 assignment rows × 5 assignment roles) role assignment template | Project Startup — Responsibility Matrix sub-surface | **Phase 3** — field spec in P3-E11 §3 |
| `Responsibility Matrix - Owner Contract Template.xlsx` | Owner contract obligations extraction template | Project Startup — Contract Obligations Register sub-surface | **Phase 3** — field spec in P3-E11-T04 |
| `PROJECT MANAGEMENT PLAN 2019.docx` | 11-section project management plan template | Project Startup — Project Management Plan sub-surface | **Phase 3** — field spec in P3-E11-T06 |
| `Procore Startup Checklist Summary (1).pdf` | Procore admin setup field requirements | Project Startup — Procore Setup Reference (read-only) | **Phase 3** — field spec in P3-E11-T04 |

**Project_Safety_Checklist.pdf reclassification note:** This file was previously uncategorized in the Safety domain. Upon content analysis, it is a startup-phase safety readiness check ("Jobsite Safety Checklist") with Pass/Fail/N/A scoring — distinct from the Safety module's 93-item ongoing weighted inspection checklist. It is now correctly owned by the Project Startup module. The Safety module does not own or receive write inputs from this checklist.

**Field-level specification:** [P3-E11 — Project Startup Module Field Specification](P3-E11-Project-Startup-Module-Field-Specification.md)

### 8.5 Subcontract Compliance Notes

Subcontract Compliance is an **always-on core module** with one record per subcontract. It owns the operational state for subcontract package submission verification and compliance relief.

| File | Purpose | Replacement Module | Status |
|---|---|---|---|
| `SUBCONTRACT CHECKLIST.xlsx` (Subcontract Checklist worksheet) | 12-item document package verification checklist submitted by PM for Risk Manager / PX review | Subcontract Compliance — Subcontract Checklist sub-surface | **Phase 3** — field spec in P3-E12 §1 |
| `SUBCONTRACT CHECKLIST.xlsx` (Compliance Waiver worksheet) | Insurance/licensing waiver with PX + CFO + Compliance Manager three-party approval routing | Subcontract Compliance — Compliance Waiver sub-surface | **Phase 3** — field spec in P3-E12 §2 |

**Reclassification note:** `SUBCONTRACT CHECKLIST.xlsx` was previously listed in §9.7 as "Estimating | Cross-cutting." This is incorrect. The file is a project-team document used during subcontract award review, not an estimating tool. It is now correctly classified under the Subcontract Compliance module.

**Field-level specification:** [P3-E12 — Subcontract Compliance Module Field Specification](P3-E12-Subcontract-Compliance-Module-Field-Specification.md)

---

## 9. Reference Example Inventory

Complete mapping of `docs/reference/example/` files to modules and replacement workflows:

### 9.1 Financial domain

| File | Module | Replacement workflow |
|---|---|---|
| `Procore_Budget.csv` | Financial | Budget import ingestion |
| `Financial Forecast Summary & Checklist.xlsx` | Financial | Financial Summary + checklist |
| `GC-GR Forecast.xlsm` | Financial | GC/GR working model |
| `HB Draw Schedule -Cash Flow.xlsx` | Financial | Cash Flow working model |
| `Buyout Log_Template 2025.xlsx` | Financial (Buyout) | Buyout working state |
| `Procore budget report.pdf` | Financial | Export reference |
| `budget_details.numbers` | Financial | Budget import alternate format |
| `cost-code-dictionary.csv` | Financial | Cost code structure |
| `cash-flow.json` | Financial | Cash flow data model |
| `ar-aging.json` | Financial | AR aging data reference |
| `prime-contracts.json` | Financial | Contract data reference |

### 9.2 Schedule domain

| File | Module | Replacement workflow |
|---|---|---|
| `Project_Schedule.xer` | Schedule | File ingestion (Primavera) |
| `Project_Schedule.xml` | Schedule | File ingestion (MS Project) |
| `Project_Schedule.csv` | Schedule | File ingestion (CSV) |

### 9.3 Constraints domain

| File | Module | Replacement workflow |
|---|---|---|
| `HB_ConstraintsLog_Template.xlsx` | Constraints | Constraint log template |
| `Project Delay Log_2025.csv` | Constraints | Delay Log |
| `constraints.json` | Constraints | Data model reference |

### 9.4 Permits domain

| File | Module | Replacement workflow |
|---|---|---|
| `10b_20260220_RequiredInspectionsList.xlsx` | Permits | Required inspections |
| `permits.json` | Permits | Data model reference |

### 9.5 Safety domain

| File | Module | Replacement workflow |
|---|---|---|
| `Site Specific Safety Plan - NORA.docx` | Safety | SSSP → structured state |
| `JHA Instructions Sheet.docx` | Safety | JHA process reference |
| `JHA form 2026.docx` | Safety | JHA log form |
| `Safety Checklist Template - Weighted.xlsx` | Safety | Checklist aggregation |
| `Incident Report .docx` | Safety | Incident working state |
| `Tropical Storm_Hurricane Preparedness Plan.pdf` | Safety | Emergency plan |
| `Project_Safety_Checklist.pdf` | **Project Startup** (reclassified — startup readiness, not ongoing Safety) | Jobsite Safety Checklist — P3-E11-T07 |
| `CrisisComs/*.pdf` (6 files) | Safety | Emergency/crisis plan components |

### 9.6 Project Closeout domain

| File | Module | Replacement workflow |
|---|---|---|
| `06 20260307_SOP_SubScorecard-DRAFT.xlsx` | Project Closeout | SubScorecard sub-surface — P3-E10 §5 |
| `07 20260307_SOP_LessonsLearnedReport-DRAFT.xlsx` | Project Closeout | Lessons Learned sub-surface — P3-E10 §6 |
| `Project_Closeout_Checklist.pdf` | Project Closeout | Closeout Checklist sub-surface — P3-E10 §4 |

### 9.7 Estimating / project management (deferred or cross-cutting)

| File | Domain | Status |
|---|---|---|
| `Estimating Kickoff.xlsx` | Estimating | Cross-cutting (BD/estimating) |
| `Estimating - Post Bid Autopsy Template 08.25.25.xlsx` | Estimating | Cross-cutting |
| `HB GO_NOGO Template Ver 2.2 2025.12.05.xlsx` | BD | Cross-cutting |
| `responsibility-matrix.json` | Project Management | Data model reference (aligned to P3-E11 §3) |
| `Project Closeout Guide - DRAFT.docx` | Project Management | Lifecycle reference |
| `E-Verify Tracking Log_Ver. 1, 7.10.csv` | HR/Compliance | Cross-cutting |
| `marketLeads.json` | BD | Data reference |
| `pipeline.json` | BD | Data reference |

> **Note:** `Responsibility Matrix - Template.xlsx`, `Responsibility Matrix - Owner Contract Template.xlsx`, and `PROJECT MANAGEMENT PLAN 2019.docx` have been reclassified from this section to **Project Startup domain** (§9.8). See §8.4.

### 9.8 Project Startup domain

| File | Module | Replacement workflow |
|---|---|---|
| `Job Startup Checklist.pdf` | Project Startup | Job Startup Checklist — P3-E11-T03 |
| `Project_Startup_Checklist.pdf` | Project Startup | Job Startup Checklist (Procore export) — P3-E11-T03 |
| `Project_Safety_Checklist.pdf` | Project Startup | Jobsite Safety Checklist (startup readiness) — P3-E11-T07 |
| `Responsibility Matrix - Template.xlsx` | Project Startup | Responsibility Matrix — P3-E11-T05 (routing engine with PM reminder-row preservation) |
| `Responsibility Matrix - Owner Contract Template.xlsx` | Project Startup | Contract Obligations Register — P3-E11-T04 |
| `PROJECT MANAGEMENT PLAN 2019.docx` | Project Startup | Project Management Plan — P3-E11-T06 |
| `Procore Startup Checklist Summary (1).pdf` | Project Startup | Procore Setup Reference — P3-E11 §6 |

### 9.9 Subcontract Compliance domain

| File | Module | Replacement workflow |
|---|---|---|
| `SUBCONTRACT CHECKLIST.xlsx` (Subcontract Checklist worksheet) | Subcontract Compliance | Document package verification — P3-E12 §1 |
| `SUBCONTRACT CHECKLIST.xlsx` (Compliance Waiver worksheet) | Subcontract Compliance | Three-party approval waiver — P3-E12 §2 |

### 9.10 Historical directory structures

| Directory | Purpose | Status |
|---|---|---|
| `ComDir/` | Historical company directory structure with placeholders | Reference for understanding current document taxonomy |
| `ResDir/` | Historical resource directory with sample project files | Reference for estimating/permit/pay-app workflows |

---

## 10. Future Integration Notes

| Enhancement | Module | Phase 3 status | Notes |
|---|---|---|---|
| **Procore API direct integration** | Financial | Deferred — future replaces CSV upload | Phase 3 uses CSV import as interim; API integration planned |
| **Smart toolbox-talk topic generation** | Safety | Deferred — future enhancement | Linked to high-risk schedule activities ~1 week before start |
| **Deeper QC field/mobile execution** | Quality Control | Deferred — internal control surface is Phase 3 scope | Future Site Controls depth: field/mobile execution, offline capture, and deeper execution routing beyond the P3-E15 Project Hub QC surface |
| **Deeper Warranty field-first tools** | Warranty | Deferred — lifecycle-visible in Phase 3 | Warranty tracking and resolution workflows |
| **Full platform-scale workflow expansion** | All modules | Future phases | Broader workflow automation and integration |

---

## 11. Acceptance Gate Reference

**Gate:** Core module gates (Phase 3 plan §18.5)

| Field | Value |
|---|---|
| **Pass condition** | Financial and Constraints include their spreadsheet-replacement notes. Safety includes its SSSP replacement, checklist/orientation aggregation, and future toolbox-talk note. |
| **Evidence required** | P3-E3 (this document), Financial replacement notes (§2) covering spreadsheet workflow, Constraints replacement notes (§4) covering worksheet process, Safety replacement notes (§6) covering SSSP, weighted checklist, JHA, incidents, and toolbox-talk future note |
| **Primary owner** | Architecture + Project Hub platform owner |

---

## 12. Policy Precedence

This note provides **replacement implementation guidance** that downstream work should reference:

| Deliverable | Relationship to P3-E3 |
|---|---|
| **Phase 3 Plan §12** | Provides module boundary rules that define what each module replaces |
| **P3-E1** — Module Classification Matrix | Classifies modules and identifies replacement intent per module |
| **P3-E2** — Source-of-Truth / Action-Boundary Matrix | Defines upstream vs. Project Hub authority for replaced data domains |
| **PH7 Plans (ADR-0091)** | Provide implementation-level detail for replacement workflows |
| **P3-F1** — Reports Contract | Must implement Reports replacement per §7 |
| **Any module implementation** | Should reference the replacement notes and example files in this document for alignment |

This note is implementation guidance, not a hard enforcement contract. Module implementations should align with these replacement notes but may adapt specific approaches as implementation realities emerge, provided the replacement intent and acceptance gate requirements are satisfied.

---

**Last Updated:** 2026-03-21
**Governing Authority:** [Phase 3 Plan §12, §19.2, §20](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md)
