# P3-E2: Module Source-of-Truth / Action-Boundary Matrix

| Field | Value |
|---|---|
| **Doc ID** | P3-E2 |
| **Phase** | Phase 3 |
| **Workstream** | E — Always-on core module delivery and PH7 reconciliation |
| **Document Type** | Specification |
| **Owner** | Architecture + Project Hub platform owner |
| **Update Authority** | Architecture lead; changes require review by Platform lead and Experience lead |
| **Last Reviewed Against Repo Truth** | 2026-03-21 |
| **References** | [Phase 3 Plan §6, §12](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md); [P3-E1](P3-E1-Phase-3-Module-Classification-Matrix.md); [P3-A3 §4.3, §5.3, §6.3](P3-A3-Shared-Spine-Publication-Contract-Set.md); [P3-D1](P3-D1-Project-Activity-Contract.md); [P3-D2](P3-D2-Project-Health-Contract.md); [P3-D3](P3-D3-Project-Work-Queue-Contract.md); [P3-D4](P3-D4-Related-Items-Registry-Presentation-Contract.md); [P3-G1 §4](P3-G1-Lane-Capability-Matrix.md) |

---

## Specification Statement

This specification defines the **source-of-truth** and **action-boundary** rules for every always-on core module in Phase 3 Project Hub. It expands the high-level module boundary rules in P3-E1 §3 into explicit per-module matrices that clarify: what data each module owns vs. what upstream systems own, what actions each module controls vs. what spines coordinate, and what mutation and override rules apply.

Phase 3 uses a **hybrid spine model** for all operational modules (Phase 3 plan §12):

- Upstream/source systems remain authoritative for certain baseline inputs.
- Project Hub owns the normalized operational state — the working ledger, forecasts, logs, and governance.
- Spines own cross-module rollup semantics — scoring, normalization, counts, and presentation.
- Modules own domain actions — CRUD operations, business rules, completion semantics.

This is a **mandatory Phase 3 acceptance gate** per §18.5: "Financial, Schedule, Constraints, Permits, Safety, Work Queue, and Reports meet their locked source-of-truth and action-boundary rules."

**Repo-truth audit — 2026-03-21.** No source-of-truth or action-boundary matrix previously existed. P3-E1 §3 defines high-level module boundaries. P3-A3 §4.3/§5.3/§6.3 lock spine-level architecture boundaries. PH7 plans (ADR-0091 locked) provide module-level implementation detail. This specification fills the gap between high-level classification and implementation-level boundary enforcement.

---

## Specification Scope

### This specification governs

- Per-module source-of-truth authority (upstream vs. Project Hub)
- Per-module action ownership (what the module controls)
- Spine coordination boundaries (what spines coordinate vs. what modules own)
- Data mutation rules (who can write what, through which path)
- Governed override rules (where manual overrides are permitted and how they are tracked)
- Upstream integration authority (what external systems remain authoritative for)
- Executive review annotation boundary rules (per-module: which actions are and are not permitted in the executive review layer)

### This specification does NOT govern

- Module classification or depth — see [P3-E1](P3-E1-Phase-3-Module-Classification-Matrix.md)
- Which module surfaces are review-capable in Phase 3 — classification is in [P3-E1 §9](P3-E1-Phase-3-Module-Classification-Matrix.md)
- Spine implementation details — see [P3-D1](P3-D1-Project-Activity-Contract.md)–[P3-D4](P3-D4-Related-Items-Registry-Presentation-Contract.md)
- Per-capability lane depth — see [P3-G1 §4](P3-G1-Lane-Capability-Matrix.md)
- Spreadsheet/document replacement details — see P3-E3
- Executive review annotation layer implementation details (`@hbc/field-annotations`) — see P3-E1 §9.2 and [P3-D2 §2.5](P3-D2-Project-Health-Contract.md)

---

## Definitions

| Term | Meaning |
|---|---|
| **Source-of-truth** | The authoritative owner of a data domain — the system whose version of the data is canonical |
| **Action boundary** | The demarcation of which system controls a given action or workflow — who initiates, who processes, who stores the result |
| **Upstream authority** | An external system (Procore, Primavera, vendor API, user-provided document) that remains the canonical source for certain baseline data |
| **Operational authority** | Project Hub's ownership of the normalized working state — forecasts, logs, checklists, governance, overrides |
| **Hybrid spine** | The Phase 3 model where upstream systems own baseline inputs while Project Hub owns the operational state built from those inputs |
| **Data mutation** | Any write operation that changes the canonical state of a record |
| **Governed override** | A manual value entry that overrides system-derived data, carrying provenance metadata (who, when, why, approval) |
| **Normalized state** | The operational state that Project Hub owns after ingesting, transforming, and enriching upstream data |
| **Baseline input** | Raw data from upstream systems (budget CSV, schedule XER/XML, jurisdictional permits) that Project Hub ingests but does not originate |
| **Executive review annotation layer** | A separate review-layer artifact owned by `@hbc/field-annotations` carrying Portfolio Executive Reviewer annotations on module fields; never a mutation path for module source-of-truth records |
| **Review-capable surface** | A module surface on which PER annotations may be placed in Phase 3; classified per P3-E1 §9 |

---

## 1. Current-State Reconciliation

| Artifact | Status | Relevance |
|---|---|---|
| Source-of-truth matrix | **Gap** — did not previously exist | This specification fills the gap |
| P3-E1 §3 module boundaries | **Locked** — high-level boundary rules | This specification expands those rules into explicit authority matrices |
| P3-A3 §4.3/§5.3/§6.3 spine boundaries | **Locked** — spine architecture boundaries | This specification aligns module authority with spine boundaries |
| P3-D1–D4 spine contracts | **Locked** — complete spine specifications | This specification references spine ownership rules |
| PH7 plans (ADR-0091) | **Locked** — deferred scope | Provide module-level implementation detail for authority mapping |

**Classification:** No source-of-truth or action-boundary matrix previously existed. This is a **gap requiring new specification** that connects existing high-level boundaries (P3-E1) with spine contracts (P3-D1–D4) and PH7 implementation plans.

---

## 2. Source-of-Truth Authority Matrix

### 2.1 Operational modules

| Module | Data domain | Upstream authority | Project Hub authority | Reconciliation rule |
|---|---|---|---|---|
| **Financial** | Budget baseline | Procore / CSV import | — | Ingested, not originated |
| | Working forecast state | — | **Owns** | Project Hub is canonical |
| | GC/GR working model | — | **Owns** | Project Hub is canonical |
| | Cash Flow working model | — | **Owns** | Project Hub is canonical |
| | Exposure tracking | — | **Owns** | Project Hub is canonical |
| | Forecast checklist | — | **Owns** | Project Hub is canonical |
| | Buyout working state | — | **Owns** (within Financial domain) | Project Hub is canonical |
| **Schedule** | Detailed baseline / CPM | Primavera / MS Project (XER/XML/CSV) | — | Ingested, not originated |
| | Milestone tracking | — | **Owns** | Project Hub is canonical |
| | Forecast overrides | — | **Owns** (governed) | Override with provenance |
| | Schedule projections | — | **Owns** | Derived from ingested + override data |
| | Upload history | — | **Owns** | Project Hub tracks all ingestions |
| **Constraints** | Constraint records | — | **Owns** | Project Hub is operational ledger owner |
| | Change Tracking entries | — | **Owns** | Project Hub is operational ledger owner |
| | Delay Log entries | — | **Owns** | Project Hub is operational ledger owner |
| | Supporting documents | Governed external destinations | Canonical references | Documents may live externally; references are Project Hub's |
| **Permits** | Permit + inspection ledger | — | **Owns** | Project Hub is operational ledger owner |
| | Jurisdictional artifacts | External governed storage | Canonical references | Artifacts may live externally; references are Project Hub's |
| **Safety** | Safety plan state | — | **Owns** | Project Hub is operational platform owner |
| | Orientations, acknowledgments | — | **Owns** | Project Hub is canonical |
| | Checklists, inspections | — | **Owns** | Project Hub aggregates |
| | JHA log records | — | **Owns** | Project Hub is canonical |
| | Incident reports | — | **Owns** | Project Hub is canonical |
| | Safety artifacts/documents | Destination libraries | Canonical references | Documents may live externally; references are Project Hub's |
| **Reports** | Report definitions | — | **Owns** | Project Hub defines report families |
| | Run ledger / history | — | **Owns** | Project Hub tracks all runs |
| | Draft state / narrative | — | **Owns** | Project Hub is canonical for drafts |
| | Module snapshot data | Respective module spines | **Consumes** | Reports reads from modules; does not own source data |
| | Release/distribution state | — | **Owns** | Project Hub tracks release lifecycle |

### 2.2 Spine modules

| Module | Data domain | Spine owns | Modules own | Governing boundary |
|---|---|---|---|---|
| **Project Health** | Scoring, confidence, compound risk | Scoring algorithms, dimension weighting, triage projections, explainability, admin governance | Metric data sourcing, freshness, local thresholds, drill-down | P3-A3 §4.3, P3-D2 |
| **Activity** | Event lifecycle, storage | Event persistence, query, rendering, retention | Event emission, event content, significance | P3-D1 |
| **Work Queue** | Item normalization | Canonical shape, lane assignment, priority/scoring, dedup, counts | Item origin, business rules, completion semantics, mutation | P3-A3 §5.3, P3-D3 |
| **Related Items** | Relationship registry | Type registry, directionality, visibility, AI hooks, governance events | Local record linkage, data authority, drill-down, relationship creation/deletion | P3-A3 §6.3, P3-D4 |

### 2.3 Canvas module

| Module | Data domain | Authority | Rule |
|---|---|---|---|
| **Home / Canvas** | All spine data | **Consumes only** | Canvas reads from all 4 spines via mandatory tiles; does not own any source data |
| | Canvas layout / personalization | **Owns** | Canvas persistence and governance are canvas-owned (P3-C1) |

---

## 3. Financial Source-of-Truth

### 3.1 Upstream authority

| Data | Source | Ingestion path | Project Hub role |
|---|---|---|---|
| Budget baseline | Procore / CSV upload (`budget_details`) | Budget CSV import workflow; identity resolution per P3-E4-T02 §2.3 | Ingest, normalize, and maintain stable canonical identity; does not originate budget data |
| Actual costs | Procore / ERP | CSV import (`jobToDateActualCost`, `committedCosts` columns) | Consume and display; read-only after ingestion |
| A/R aging data | Accounting / ERP | Daily sync job | Read-only display; no PM editing |
| Future: direct API | Procore API integration | API sync (future) | Same ingestion role; `externalSourceLineId` takes precedence over composite fallback matching |

### 3.2 Project Hub operational authority

| Data domain | Authority | Version scope | Notes |
|---|---|---|---|
| Budget line identity and working state | **Project Hub owns** | Working version only for `forecastToComplete` | `canonicalBudgetLineId` stable across imports; immutable on confirmed versions |
| Financial Forecast Summary | **Project Hub owns** | Working version only for PM-editable fields | PM fields: `currentContractValue`, `currentContingency`, `approvedDaysExtensions`, etc. |
| GC/GR working model | **Project Hub owns** | Working version only | Version-scoped; aggregate feeds Forecast Summary |
| Cash Flow working model | **Project Hub owns** | Working version only for forecast months | Actual months sourced from ERP; read-only |
| Forecast checklist | **Project Hub owns** | Per working version; starts empty on derivation | Confirmation gate enforced by Financial module |
| Forecast version ledger | **Project Hub owns** | All version types | Working → ConfirmedInternal → PublishedMonthly lifecycle |
| Buyout working state | **Project Hub owns** | Not version-scoped | Procurement-control state; savings disposition records |
| Export artifacts | **Project Hub generates** | From confirmed or working version | Derived; not source-of-truth records |

### 3.3 Version-specific mutability rule

The Financial module's version lifecycle governs which state is mutable:

| State | PM can edit | PER can annotate | Notes |
|---|---|---|---|
| Working version | Yes — `forecastToComplete`, GC/GR EAC, cash flow forecast months, FM-editable summary fields | **No** — never visible to PER | No confirmed version may be unlocked in place |
| ConfirmedInternal | No | Yes — via `@hbc/field-annotations` | Annotation anchors target `canonicalBudgetLineId`, not `budgetImportRowId` |
| PublishedMonthly | No | Yes — via `@hbc/field-annotations` | Finalized by P3-F1 publication callback |
| Superseded | No | No | Audit trail only |

### 3.4 Boundary rule

Project Hub is NOT the ERP/accounting system-of-record. Budget baseline originates in Procore; actual cost data comes from Procore/ERP. Project Hub owns the normalized operational state built from those inputs — the versioned forecast ledger, the PM's working estimates, the confirmation and publication lifecycle, and the buyout procurement state. No other module may write to Financial domain fields.

### 3.5 Executive review annotation boundary

Financial is a **review-capable surface** in Phase 3 (P3-E1 §9.1). Portfolio Executive Reviewers may annotate confirmed versions (ConfirmedInternal and PublishedMonthly) at full field, section, and block anchor depth.

| Rule | Description |
|---|---|
| **Version scope** | PER may annotate any `ConfirmedInternal` or `PublishedMonthly` version. The Working version is never visible to PER. |
| **Annotation isolation** | Review annotations MUST be stored exclusively in `@hbc/field-annotations`. They MUST NOT be stored in or written to any Financial source-of-truth record. |
| **No mutation path** | No annotation may trigger a write, edit, or validation override of any Financial record. |
| **Anchor stability** | Annotation anchors use `canonicalBudgetLineId` (not `budgetImportRowId`) to ensure anchors survive re-imports and remain valid across version derivations. |
| **Carry-forward** | When a new working version is derived from an annotated confirmed version, open annotations carry forward as `Inherited` carry-forward records. PM must disposition each before confirming the new version. |
| **Visibility** | Restricted to the review circle before the PER explicitly pushes to the project team. |
| **Push** | Push-to-Project-Team creates a governed work queue item per P3-D3 §13. |

**Field-level specification:** [P3-E4 — Financial Module Field Specification](P3-E4-Financial-Module-Field-Specification.md) *(master index + T01–T09 detail files)*

---

## 4. Schedule Source-of-Truth

### 4.1 Upstream authority

| Data | Source | Ingestion path | Project Hub role |
|---|---|---|---|
| Detailed baseline and update schedule | Primavera / MS Project | XER/XML/CSV file ingestion — creates a frozen `ScheduleVersionRecord` + `ImportedActivitySnapshot` set | Ingest, normalize, and freeze; does not originate CPM data; every import is immutable |
| Full CPM network logic | Upstream schedule system | `ImportedRelationshipRecord` per version — immutable | Project Hub does not replicate live CPM; imported logic is read-only source truth |
| Durable activity identity | Derived at ingestion | `externalActivityKey = {sourceId}::{sourceActivityCode}` | Stable cross-version reconciliation key; `ActivityContinuityLink` maintains identity across imports |

### 4.2 Dual-truth model

The Schedule module maintains two distinct truth layers on top of the upstream source:

| Truth layer | Owner | Records | Notes |
|---|---|---|---|
| **Source truth** | Upstream schedule system (frozen in HB Intel) | `ImportedActivitySnapshot`, `ScheduleVersionRecord`, `BaselineRecord` | Immutable after ingestion; never overwritten |
| **Commitment truth** | Project Manager (current state) / Scheduler (future state) | `ManagedCommitmentRecord`, `ReconciliationRecord` | PM-owned operating layer; reconciliation status tracks alignment with source truth |

### 4.3 Project Hub operational authority

| Data domain | Authority | Notes |
|---|---|---|
| Canonical source designation | **Project Hub owns** | One `CanonicalScheduleSource` per project at a time; secondary sources for comparison only |
| Frozen import snapshots | **Project Hub owns** | `ScheduleVersionRecord` + `ImportedActivitySnapshot`; immutable after ingestion |
| Governed baselines | **Project Hub owns** | `BaselineRecord` with PE approval; multiple governed baselines; primary designation |
| Managed commitment layer | **Project Hub owns** | `ManagedCommitmentRecord` with `reconciliationStatus` tracking alignment with source truth |
| Published forecast layer | **Project Hub owns** | `PublicationRecord` with `Draft → ReadyForReview → Published → Superseded` lifecycle |
| Milestone records | **Project Hub owns** | View projections derived from Published layer; not an independent source of truth |
| Field work packages | **Project Hub owns** | `FieldWorkPackage` (child of imported activity by location/trade/time); commitment and blocker records |
| Look-ahead plans and PPC | **Project Hub owns** | `LookAheadPlan` + `CommitmentRecord`; PPC calculated per governed window |
| Progress verification | **Project Hub owns** | Three-tier: reported → verified → authoritative; `ProgressClaimRecord` + `ProgressVerificationRecord` |
| Schedule analytics and grading | **Project Hub owns** | `ScheduleQualityGrade`, `ConfidenceRecord`, `FloatPathSnapshot`; all weights governed |
| Scenario branches | **Project Hub owns** | `ScenarioBranch` from specific version + baseline; promotion via governed workflow |

### 4.4 Boundary rule

Project Hub is NOT full CPM authoring. The upstream schedule system remains authoritative for detailed CPM network logic and baseline data. HB Intel owns the commitment truth, publication lifecycle, field execution layer, and all analytics computed on top of the frozen source truth. All thresholds, grading rules, roll-up methods, and governed taxonomies are configured exclusively by Manager of Operational Excellence.

### 4.5 Ownership maturity model

| Ownership dimension | Current state | Future state |
|---|---|---|
| Source ownership | PM owns and uploads schedule files | Scheduler manages upload and canonical source designation |
| Publication authority | PM publishes to executive review | PE approves and publishes |
| Baseline authority | PM requests; PE approves | PE initiates and approves |
| Field execution ownership | PM creates work packages | Trade foremen create and manage their packages |
| Commitment approval | Governed threshold (configurable) | Full commitment approval workflow |

Role assignment is governed configuration, not code-level change.

### 4.6 Executive review annotation boundary

Schedule is a **review-capable surface** in Phase 3 (P3-E1 §9.1). Portfolio Executive Reviewers may place annotations on Published layer content only.

| Rule | Description |
|---|---|
| **Published layer only** | Annotations are anchored exclusively to `PublishedActivitySnapshot` and related Published layer records. No annotation on draft, managed commitment, or field execution records. |
| **Annotation isolation** | Review annotations MUST be stored in a separate `@hbc/field-annotations` artifact. They MUST NOT be stored in or written to any Schedule source-of-truth record. |
| **No mutation path** | Annotations are read-layer overlays only. No review annotation may trigger a mutation of any governed record. |
| **Visibility** | Restricted to the review circle before the PER explicitly pushes to the project team. |
| **Push** | Push-to-Project-Team creates a governed work queue item per P3-D3 §13. |

**Field-level specification:** [P3-E5 — Schedule Module Field Specification](P3-E5-Schedule-Module-Field-Specification.md) *(master index)* + T01–T11 detail files. See P3-E5-T03 for publication lifecycle, P3-E5-T02 for dual-truth model, P3-E5-T05 for field execution layer, P3-E5-T07 for analytics and grading.

---

## 5. Constraints Source-of-Truth

### 5.1 Four-ledger workspace authority model

The Constraints module is a **four-ledger project-controls workspace**. Each ledger has its own source-of-truth authority:

| Ledger | Authority | Notes |
|--------|-----------|-------|
| Risk Ledger | **HB Intel native** | HB Intel originates and owns all risk records; no external system integration |
| Constraint Ledger | **HB Intel native** | HB Intel originates and owns all constraint records; no external system integration |
| Delay Ledger | **HB Intel native** (with schedule reference integration) | Delay records are HB Intel-native; may consume governed schedule references from integrated schedule sources (P3-E5); Schedule records are not mutated by the Delay Ledger |
| Change Ledger — manual mode | **HB Intel native** | HB Intel originates and owns all change event records in manual mode |
| Change Ledger — integrated mode | **Dual authority** | HB Intel retains canonical identity (`changeEventId`, `changeEventNumber`) and normalized status model; Procore is the system of transaction for integrated change-event fields; authoritative transactional writes execute through Procore API paths |

### 5.2 Live operational state vs published state

| Consumer | State | Rationale |
|----------|-------|-----------|
| PM day-to-day operations | Live | PMs need current state without waiting for publish |
| Escalation and Work Queue | Live | Actions must reflect current ledger state |
| Executive review surfaces | Published | PER reviews confirmed snapshots; not live draft state |
| Health spine (review-facing) | Published | Review-cycle metrics from published packages |
| Health spine (operational) | Live | Day-to-day counts from live ledger |
| Reports for review packages | Published | Report from published state for cadence review |

### 5.3 External references

Supporting artifacts and documents may live in governed external destinations (SharePoint, document management). Project Hub maintains canonical references back to the ledger via attachment URI fields on each ledger record.

### 5.4 Boundary rule

The Constraints module is the HB Intel-native operational workspace for risk, constraint, delay, and change management. No external system is authoritative for Risk, Constraint, or Delay records. In Phase 3, the Change Ledger is also fully HB Intel-native. Post-Procore-integration, HB Intel retains canonical identity and governance semantics for Change records while Procore serves as the transactional system for integrated change-event fields.

All module taxonomies, thresholds, BIC registries, escalation rules, and stage-gate requirements are governed configuration managed exclusively by the Manager of Operational Excellence or an authorized Admin.

### 5.5 Executive review annotation boundary

Constraints is a **review-capable surface** in Phase 3 (P3-E1 §9.1). Portfolio Executive Reviewers may place annotations on **published snapshots and review packages only**.

| Rule | Description |
|---|---|
| **Published state only** | Annotations are anchored to `LedgerRecordSnapshot` and `ReviewPackage` records; never to live ledger records. |
| **Annotation isolation** | Review annotations MUST be stored in a separate `@hbc/field-annotations` artifact. They MUST NOT be stored in or written to any Constraints module ledger record. |
| **No mutation path** | Annotations are read-layer overlays only. No review annotation may trigger a mutation of any ledger record, status, BIC assignment, or impact value. |
| **Visibility** | Restricted to the review circle before the PER explicitly pushes to the project team. |
| **Push** | Push-to-Project-Team creates a governed work queue item per P3-D3 §13. |

**Field-level specification:** [P3-E6 — Constraints Module Field Specification](P3-E6-Constraints-Module-Field-Specification.md) *(master index)* + T01–T08 detail files. See P3-E6-T06 for publication and review model, P3-E6-T01 for Risk, P3-E6-T02 for Constraint, P3-E6-T03 for Delay, P3-E6-T04 for Change.

---

## 6. Permits Source-of-Truth

### 6.1 Project Hub operational authority

| Data domain | Authority | Notes |
|---|---|---|
| `PermitApplication` | **Project Hub owns** | Pre-issuance lifecycle; origination through approval |
| `IssuedPermit` | **Project Hub owns** | Operative post-approval permit record; status via lifecycle actions only |
| `RequiredInspectionCheckpoint` | **Project Hub owns** | Governed template library and per-permit checkpoint tracking |
| `InspectionVisit` | **Project Hub owns** | All inspection visit records; append-only |
| `InspectionDeficiency` | **Project Hub owns** | All deficiency records; resolution workflow owned here |
| `PermitLifecycleAction` | **Project Hub owns** | Immutable audit trail; only creation allowed; no update or delete |
| `PermitEvidenceRecord` | **Project Hub owns** | Metadata and references to documents; not binary storage |
| Permit thread relationships | **Project Hub owns** | Thread root, parent-child, relationship type |
| Derived compliance health | **Project Hub derives** | Computed from record truth; not persisted as manual score |

### 6.2 External references

Jurisdictional artifacts/documents and governed storage locations MAY exist outside Project Hub. `PermitEvidenceRecord.storageUri` holds the reference. Project Hub does not manage document binary storage.

### 6.3 Boundary rule

Permits module is the **operational ledger owner** for all permit lifecycle data. `IssuedPermit.currentStatus` may only change via a `PermitLifecycleAction` record. Direct status mutation is a boundary violation.

**No manual compliance score** may appear on any record in this module. Compliance health is derived exclusively from record truth per P3-E7-T04 §4.

Upstream jurisdiction systems are referenced but not owned. Future jurisdiction API integration (P3-E7-T07 §5) will consume jurisdiction data but Project Hub remains the source-of-truth for the project-side record.

### 6.4 Executive review annotation boundary

Permits is a **review-capable surface** in Phase 3 (P3-E1 §9.1). Portfolio Executive Reviewers may place annotations at full field-level depth on `IssuedPermit` and `InspectionVisit` records.

| Rule | Description |
|---|---|
| **Annotation isolation** | Review annotations MUST be stored in `@hbc/field-annotations` using `IPermitAnnotationAnchor`. MUST NOT be stored in any Permits ledger record. |
| **No mutation path** | No annotation may trigger mutation of permit status, inspection results, deficiency resolution status, or expiration dates. All mutations flow through operational workflows only. |
| **Annotatable record types** | `IssuedPermit` (any field), `InspectionVisit` (result, notes, followUpRequired), `InspectionDeficiency` (description, severity, resolutionStatus), `RequiredInspectionCheckpoint` (result, status, name). `PermitLifecycleAction` is NOT annotatable. |
| **Visibility** | Restricted to the review circle before the PER explicitly pushes to the project team. |
| **Push** | Push-to-Project-Team creates a governed work queue item per P3-D3 §13. |

**Field-level specification:** [P3-E7 — Permits Module Field Specification](P3-E7-Permits-Module-Field-Specification.md) *(master index + T01–T08 detail files)*

---

## 7. Safety Source-of-Truth

### 7.1 Project Hub operational authority

The Safety Module is a governed multi-record workspace. All 15 record families below are owned by Project Hub / the Safety workspace. No external system is the source of truth for any of these records.

| Data domain | Authority | Governing Record Family |
|---|---|---|
| SSSP base plan (governed sections) | **Safety Manager owns** | `ISiteSpecificSafetyPlan` — governed sections |
| SSSP base plan (instance sections) | **Project team owns** (within Safety Manager framework) | `ISiteSpecificSafetyPlan` — instance sections |
| SSSP addenda | **Safety Manager owns** (project team may draft instance addenda) | `ISSSPAddendum` |
| Inspection checklist templates | **Safety Manager owns exclusively** | `IInspectionChecklistTemplate` |
| Completed weekly inspections | **Safety Manager owns exclusively** | `ICompletedInspection` |
| Safety corrective actions | **Safety module owns** (centralized ledger, all sources) | `ISafetyCorrectiveAction` |
| Incidents and cases | **Safety Manager / Safety Officer owns** | `IIncidentRecord` |
| Job Hazard Analysis records | **Safety Manager approves; project team contributes** | `IJhaRecord` |
| Daily Pre-Task Plans | **Project team creates; Safety Manager has read access** | `IDailyPreTaskPlan` |
| Toolbox Talk Prompts | **Safety Manager owns** | `IToolboxTalkPrompt` |
| Weekly Toolbox Talk records | **Safety Manager owns** | `IWeeklyToolboxTalkRecord` |
| Worker orientation records | **Safety Manager / Safety Officer owns** | `IWorkerOrientationRecord` |
| Subcontractor safety submissions | **Safety Manager reviews and approves** | `ISubcontractorSafetySubmission` |
| Certifications and qualifications | **Safety Manager owns** | `ICertificationRecord` |
| HazCom / SDS records | **Safety Manager owns** | `IHazComSdsRecord` |
| Competent-person designations | **Safety Manager owns** | `ICompetentPersonDesignation` |
| Safety evidence records | **Safety Manager owns** | `ISafetyEvidenceRecord` |
| Readiness decisions | **Safety module derives; Safety Manager sets exceptions/overrides** | `ISafetyReadinessDecision` |
| Composite safety scorecard | **Safety module publishes (derived — never stored as raw score)** | `ISafetyCompositeScorecard` |

### 7.2 Status mutation prohibition

- `ICompletedInspection.status` may only be set by Safety Manager or Safety Officer. Project team cannot initiate or complete inspections.
- `ISafetyCorrectiveAction.status` transitions to `CLOSED` require Safety Manager verification (the `PENDING_VERIFICATION → CLOSED` step is Safety Manager-only).
- `ISafetyReadinessDecision`: exceptions may only be granted by Safety Manager. Overrides require joint acknowledgment (Safety Manager + PM + Superintendent for activity-level; Safety Manager + PM for project/subcontractor level).
- No `complianceScore` numeric field exists anywhere in the Safety module. The composite scorecard is derived, not stored.

### 7.3 External references

Governed safety artifacts/documents MAY live in destination libraries. The SSSP rendered PDF output is stored as a governed `ISafetyEvidenceRecord` and referenced by `ISiteSpecificSafetyPlan.renderedDocumentRef`. The Safety module maintains canonical references to all document outputs.

### 7.4 Executive review exclusion (Phase 3)

Safety is **excluded from Phase 3 executive review** (P3-E1 §9.1 and §9.3). The following rules apply:

| Rule | Description |
|---|---|
| **No annotation layer** | No executive review annotation layer exists for the Safety module in Phase 3. Portfolio Executive Reviewers MUST NOT place review annotations on Safety module content. `@hbc/field-annotations` MUST NOT be integrated in the Safety module. |
| **Tiered PER read access** | PER posture grants read-only access to governed operational summaries only: composite scorecard (score band, not raw score), readiness decision, corrective action counts, and anonymized incident counts by type. No individual incident detail, no raw inspection scores. |
| **No mutation path from PER** | PER access to Safety data is strictly non-operational. No PER action may trigger any write to Safety source-of-truth records. |
| **No push-to-team** | There is no push-to-team pathway from Safety in Phase 3. |
| **Rationale** | Safety data is operationally sensitive and compliance-critical. This exclusion may be revisited in a later phase with appropriate governance controls (P3-E1 §9.3). |

**Field-level specification:** [P3-E8 — Safety Module Field Specification](P3-E8-Safety-Module-Field-Specification.md) *(master index + T01–T10 detail files)*

---

## 8. Reports Source-of-Truth

### 8.1 Reports operational authority

| Data domain | Authority | Notes |
|---|---|---|
| Corporate template library (family definitions, section schemas, allowed content types) | **Reports owns** (governed by MOE/Admin) | PX Review (locked), Owner Report, sub-scorecard, lessons-learned family definitions |
| Project family registrations | **Reports owns** | Activation state, active configuration version per project-family |
| Draft configuration (PM-editable, pending PE activation) | **Reports owns** | Draft and active configuration version model; structural changes require PE re-approval |
| PM narrative overrides | **Reports owns** | Narrative-only sections; PM/PE-authored exclusively; PER has no write authority |
| Run ledger | **Reports owns** | All generation runs (standard + reviewer-generated), status transitions, approval/release records |
| Artifact provenance | **Reports owns** | Snapshot references frozen on run creation; immutable |
| Central project-governance policy record | **Reports enforces only** — Policy record owned by MOE (global floor) and PE (project overlay); Reports reads and enforces but does not write |

### 8.2 Module snapshot consumption

| Source module | Data consumed | Authority |
|---|---|---|
| P3-A1 (Project Registry) | Project metadata, team, contract summary | P3-A1 owns source |
| P3-E3 (Action Items / Constraints) | Open item counts, summaries | P3-E3 owns source |
| P3-E5 (Financial) | Forecast summary, budget status, change orders | Financial module owns source |
| P3-E6 (Schedule) | Milestone status, percent complete, critical path summary | Schedule module owns source |
| P3-E7 (Permits & Constraints) | Open permits, active constraints summary | Permits module owns source |
| P3-E8 (Safety) | Safety posture band, composite score band, corrective actions summary | Safety module owns source |
| P3-E10 (Closeout) | Pre-computed sub-scorecard (scores, ratings, narrative) and lessons-learned entries | **P3-E10 owns all source data; Reports ingests confirmed snapshot only** |

**Sub-scorecard and lessons-learned boundary:** P3-E10 (Project Closeout) is the source-of-truth for all sub-scorecard and lessons-learned operational data. Reports assembles these into governed PDF artifacts but does not own, compute, or re-derive this data. Scoring formulas (section averages, overall weighted score, performance ratings) are executed by P3-E10 before snapshot publication to Reports.

### 8.3 Boundary rule

Reports module owns the report lifecycle (definition, generation, draft configuration, approval, release). Reports does NOT own the module data it assembles — it consumes immutable snapshots from source modules at generation time. Reports does NOT own sub-scorecard or lessons-learned data — these are owned by P3-E10.

### 8.4 Executive review boundary

Reports is a **review-capable surface** in Phase 3. PER authority over Reports is governed by P3-F1 (the central project-governance policy record and report-family release rules).

| Rule | Description |
|---|---|
| **Annotation isolation** | Review annotations on report content MUST NOT modify report definitions, the run ledger, draft state, or PM narrative. Annotations are a separate `@hbc/field-annotations` review-layer artifact. |
| **No PM draft authority** | PER has no authority over PM draft state. PM draft state confirmation is PM/PE-owned exclusively. PER MUST NOT initiate, approve, or modify the PM draft confirmation step. |
| **No draft access** | PER cannot access unconfirmed or in-progress PM drafts. |
| **Reviewer-generated review runs** | PER may generate review runs only against the latest already-confirmed PM-owned snapshot. PER CANNOT generate a run against an unconfirmed or in-progress PM draft. |
| **Release authority** | PER release authority on a given report family is governed by the effective project-governance policy record (P3-F1 §14.4). It is not universal — family-by-family, governed by policy. `perReleaseAuthority = 'per-permitted'` required. |
| **PX Review cannot bypass PE internal review** | The PM↔PE internal review chain, when configured at project level, MUST complete before PX Review proceeds. PER cannot bypass this chain. |
| **No chain authority** | PER cannot initiate, advance, or skip the PM↔PE internal review chain. |

**Field-level specification:** [P3-E9 — Reports Module Field Specification](P3-E9-Reports-Module-Field-Specification.md) *(master index + T01–T10)*

---

## 9. Spine Module Source-of-Truth

### 9.1 Project Health (P3-A3 §4.3, P3-D2)

| Domain | Owner | Boundary |
|---|---|---|
| Scoring algorithms, dimension weighting | Health spine | Deterministic computation; modules do not score |
| Compound risk detection | Health spine | Cross-dimension pattern evaluation |
| Confidence model | Health spine | 6-factor penalty model |
| Explainability, recommended actions | Health spine | Reason-coded, traceable |
| Triage projections | Health spine | Portfolio-level classification |
| Admin governance | Health spine | Staleness, overrides, suppression |
| Metric data sourcing and freshness | Modules | Modules provide `IHealthMetric` values |
| Local thresholds and alerts | Modules | Module-owned |
| Richer drill-down | Modules | Module-owned |

### 9.2 Activity (P3-D1)

| Domain | Owner | Boundary |
|---|---|---|
| Event persistence and query | Activity spine | Stores, indexes, and serves events |
| Event rendering contract | Activity spine | Mandatory rendering elements, freshness cues |
| Retention policy | Activity spine | Active (90 days), archive (1 year), purge |
| Event creation and content | Modules | Modules create `IProjectActivityEvent` records |
| Event significance classification | Modules | Modules assign `routine`, `notable`, `critical` |
| Event immutability | Activity spine | Events cannot be modified after publication |

### 9.3 Work Queue (P3-A3 §5.3, P3-D3)

| Domain | Owner | Boundary |
|---|---|---|
| Canonical item shape | Work Queue spine | `IMyWorkItem` normalization |
| Lane assignment, priority/scoring | Work Queue spine | Deterministic ranking |
| Deduplication, supersession | Work Queue spine | Queue hygiene |
| Count semantics | Work Queue spine | `computeCounts()` is single source of truth |
| Item origin and creation | Modules | Modules create work items via adapters |
| Business rules, completion | Modules | Domain actions flow through modules |
| Mutation | Modules | Modules MUST NOT modify items through the spine |

### 9.4 Related Items (P3-A3 §6.3, P3-D4)

| Domain | Owner | Boundary |
|---|---|---|
| Relationship type registry | Related Items spine | `RelationshipRegistry` definitions |
| Directionality, visibility rules | Related Items spine | Bidirectional pairs, role gating |
| AI suggestion hooks | Related Items spine | Hook registration and resolution |
| Governance event emission | Related Items spine | `IGovernanceTimelineEvent` lifecycle |
| Local record linkage | Modules | Modules resolve IDs via `resolveRelatedIds` |
| Data authority for linked records | Modules | Modules own the records being linked |
| Relationship creation/deletion | Modules | Business logic is module-owned |

---

## 10. Action-Boundary Matrix

### 10.1 Operational module actions

| Action | Owner | Spine coordination | External system |
|---|---|---|---|
| **CRUD on domain records** | Module owns | — | — |
| **Data import/ingestion** | Module owns | — | Upstream provides data (CSV, XER, API) |
| **Working-state editing** | Module owns | — | — |
| **Export** | Module owns | — | — |
| **Health metric contribution** | Module provides `IHealthMetric` | Health spine scores and classifies | — |
| **Activity event emission** | Module creates event | Activity spine stores and serves | — |
| **Work item publication** | Module creates `IMyWorkItem` | Work Queue normalizes, ranks, deduplicates | — |
| **Relationship registration** | Module registers bidirectional pair | Related Items coordinates visibility, resolution | — |
| **Report snapshot provision** | Module owns source data | Reports consumes snapshot at generation time | — |

### 10.2 Spine module actions

| Action | Spine owner | Module role | External system |
|---|---|---|---|
| **Health scoring** | Health spine computes | Modules contribute metrics only | — |
| **Activity event storage** | Activity spine stores | Modules emit events | — |
| **Work item normalization** | Work Queue spine normalizes | Modules create items; mutation flows through module domain actions | — |
| **Relationship resolution** | Related Items spine resolves | Modules provide `resolveRelatedIds` and `buildTargetUrl` | — |

### 10.3 Cross-module action rules

| Rule | Description |
|---|---|
| **No spine-mediated mutation** | Modules MUST NOT mutate domain data through spines. Mutation flows through module-owned domain actions (P3-A3 §5.3) |
| **No cross-feature coupling** | Modules MUST NOT create cross-feature package imports for relationship resolution — use record IDs and URL builders only (P3-A3 §6.2) |
| **Spine publication is one-way** | Modules publish into spines; spines do not write back to modules |
| **Health scoring is read-only** | Health spine computes scores from metrics; it does not modify the source metrics |
| **Reports consumes, not owns** | Reports assembles from module snapshots; it does not own or modify the source module data |

---

## 11. Data Mutation Rules

### 11.1 Who can write what

| Data type | Mutation authority | Path |
|---|---|---|
| Module domain records | **Module owns** | Module CRUD operations |
| Health metrics | **Module provides** | Module pushes `IHealthMetric`; Health spine scores (read-only projection) |
| Activity events | **Module emits** | Module creates `IProjectActivityEvent`; Activity spine stores (immutable after publication) |
| Work items | **Module creates** | Module creates `IMyWorkItem` via adapter; Work Queue normalizes; module owns completion/mutation |
| Relationships | **Module registers** | Module registers via `registerBidirectionalPair()`; Related Items coordinates |
| Canvas layout | **Canvas owns** | `CanvasApi` persistence; user edit-mode actions |
| Report drafts | **Reports owns** | Reports module manages draft lifecycle |
| Admin configuration | **Spine/module admin** | Governed admin panels with validation |

### 11.2 Mutation prohibitions

| Prohibition | Governing contract |
|---|---|
| Modules MUST NOT modify work items through the Work Queue spine | P3-A3 §5.3, P3-D3 §12.3 |
| Activity events are immutable after publication | P3-D1 §2.2 |
| Health scoring is deterministic projection — no UI-side recomputation | ADR-0110 D-02, P3-D2 §2.4 |
| Relationships MUST NOT create cross-feature package imports | P3-A3 §6.2 |
| Modules MUST NOT directly compute health scores | P3-A3 §4.2 |
| Executive review annotations MUST NOT mutate any module source-of-truth record — Financial, Schedule, Constraints, Permits, Reports, or Health | P3-E1 §9.2, §3.4, §4.4, §5.4, §6.4, §8.4 |
| Executive review annotations MUST be stored in a separate `@hbc/field-annotations` artifact, not in the module's domain storage | P3-E1 §9.2 |
| PER MUST NOT place review annotations on Safety module content in Phase 3 | P3-E1 §9.3, §7.4 |

---

## 12. Governed Override Rules

Manual overrides are permitted in specific, governed contexts. All overrides carry provenance metadata.

### 12.1 Health metric overrides

| Aspect | Rule | Governing contract |
|---|---|---|
| Override entry | Users may manually enter health metric values | P3-D2 §3.4 (`IManualOverrideMetadata`) |
| Provenance | Reason, enteredBy, enteredAt, approval tracking | P3-D2 §9.2 |
| Approval gating | Configurable per-metric via `approvalRequiredMetricKeys` | P3-D2 §9.2 |
| Maximum influence | `maxManualInfluencePercent` caps manual entry fraction | P3-D2 §9.2 |
| Override aging | `maxOverrideAgeDays` flags stale overrides | P3-D2 §9.2 |
| Confidence impact | Manual influence penalizes confidence score | P3-D2 §5.2 |

### 12.2 Schedule forecast overrides

| Aspect | Rule |
|---|---|
| Override entry | Users may apply governed forecast overrides to milestones |
| Provenance | Override carries user, timestamp, and reason |
| Authority | Schedule module owns override logic |

### 12.3 Report narrative overrides

| Aspect | Rule |
|---|---|
| Override entry | PM may override auto-assembled narrative sections |
| Provenance | Override carries PM identity and timestamp |
| Authority | Reports module owns narrative draft state |
| Scope | Narrative only — module snapshot data is not overridable through Reports |

### 12.4 Override invariant

Overrides MUST always carry provenance metadata. No override may be applied silently — the system must record who, when, and why for audit.

---

## 13. Repo-Truth Reconciliation Notes

1. **Source-of-truth matrix — gap filled**
   No source-of-truth or action-boundary matrix previously existed. This specification fills the gap between P3-E1 high-level boundaries and implementation-level authority enforcement. Classified as **gap — now resolved**.

2. **Spine architecture boundaries — compliant**
   Health (P3-A3 §4.3), Work Queue (P3-A3 §5.3), and Related Items (P3-A3 §6.3) spine boundaries are locked and reflected in §9 and §10. Classified as **compliant**.

3. **Module boundaries — aligned with P3-E1**
   Per-module source-of-truth definitions in §3–§8 expand the high-level boundary rules in P3-E1 §3. No conflicts. Classified as **compliant**.

4. **Operational module implementations — controlled evolution**
   Financial, Schedule, Constraints, Permits, Safety, and Reports have no production implementations beyond reference examples. Source-of-truth and action-boundary rules in this specification govern the implementation when it proceeds. Classified as **controlled evolution**.

5. **Health manual override governance — compliant**
   `IManualOverrideMetadata`, `IHealthPulseAdminConfig`, and `validateHealthPulseAdminConfig()` implement the governed override rules in §12.1. Classified as **compliant**.

6. **PH7 plans — aligned**
   PH7 module plans provide implementation-level detail that is consistent with the source-of-truth and action-boundary rules defined here. No reconciliation conflicts. Classified as **aligned**.

7. **Executive review annotation boundary rules — gap filled**
   No per-module executive review annotation boundary rules previously existed in this specification. Rules now locked in §3.4 (Financial), §4.4 (Schedule), §5.4 (Constraints), §6.4 (Permits), §7.4 (Safety exclusion), §8.4 (Reports), and in §11.2 mutation prohibitions. Classified as **gap — remediated in `@hbc/field-annotations` v0.2.0 (2026-03-22).** `AnchorType` discriminator and `HbcAnnotationAnchor` component added for section/block anchor targets.

---

## 14. Project Closeout Source-of-Truth

### 14.1 Project Hub operational authority

| Data domain | Authority | Notes |
|---|---|---|
| Closeout checklist items | **Project Hub owns** | 70-item governed checklist; MOE-controlled template library |
| Checklist item results (Yes/No/NA) | **Project Hub owns** | Tri-state per item; every mutation creates an audit trail entry |
| Checklist date fields | **Project Hub owns** | Date-bearing items (2.10, 3.11, 4.2, 4.3, 4.4, 4.13); item 4.14 is calculated from item 3.11 |
| Checklist overlay items | **Project Hub owns** | PM-added items bounded at max 5 per section; auditable |
| Subcontractor scorecard records | **Project Hub owns** | Interim and FinalCloseout evaluation types; full evaluation record per subcontractor |
| Scorecard scoring and calculation | **Project Hub owns** | Section averages, overall weighted score, and performance rating — computed by module, not Reports |
| Lessons Learned entries | **Project Hub owns** | Per-lesson structured records; rolling capture throughout project lifecycle |
| `LessonsLearningReport` synthesis container | **Project Hub owns** | One per project; packages rolling entries for PE review |
| Impact magnitude derivation | **Project Hub derives** | Backend text-parsing service; PM cannot set or override; 422 on no signal |
| Project Autopsy records | **Project Hub owns** | `AutopsyRecord`, `AutopsyFinding`, `AutopsyAction`, `LearningLegacyOutput` per project |
| Pre-survey templates | **MOE owns** | Governs `PreSurveyTemplate` library; PM/PE issues per project |
| Closeout lifecycle state | **Project Hub owns** | 9-state `CloseoutLifecycleState` machine; 13 `CloseoutMilestone` records |
| Jurisdiction configuration | **Project Hub owns** | Per-project jurisdiction template selection for Section 7 items |

### 14.2 Org intelligence — derived read models (not operational records)

The following are **derived read models** populated from PE-approved Closeout publication events at project `ARCHIVED` state. They are not editable ledgers within the module. No user may write to them directly; they are populated only by Closeout publication events.

| Derived index | Populated from | Visibility |
|---|---|---|
| `LessonsIntelligenceIndex` | PE-approved `LessonsLearningReport` on project archive | Broadly available — all internal Project Hub users |
| `SubIntelligenceIndex` | PE-approved `FinalCloseout` scorecard on project archive | Restricted — PE, PER, MOE, or explicit `SUB_INTELLIGENCE_VIEWER` grant only |
| `LearningLegacyFeed` | PE-approved individual `LearningLegacyOutput` records on project archive | Broadly available — all internal Project Hub users |

### 14.3 External references

Completed closeout documents (certificates of occupancy, owner acceptance letters, surveys, lien releases) may live in governed external destinations (SharePoint libraries, document management). Project Hub maintains canonical references to those artifacts; the artifacts themselves are not owned by Project Hub.

### 14.4 Boundary rules

**Ownership rule:** Project Closeout is the sole operational owner of all closeout execution state. No other feature package may write to any Closeout record. No upstream system is authoritative for closeout checklist, scorecard, lessons, or autopsy data.

**Publication trigger rule:** Org intelligence publication does **not** occur on Section 6 item completion. The correct trigger sequence is:
1. Records reach `publicationStatus = PE_APPROVED` via PE approval workflow.
2. Project lifecycle reaches `ARCHIVED` state (PE-gated).
3. Closeout emits publication events; org indexes are populated from the events.

This replaces the earlier "Section 6 items marked complete → snapshot to Reports" framing, which was incorrect.

**Reports module snapshot rule:** Reports ingests Closeout sub-scorecard and lessons-learned data via the snapshot API (`GET /api/closeout/{projectId}/scorecard/{id}/snapshot`; `GET /api/closeout/{projectId}/lessons/snapshot`). Precondition: `publicationStatus ≥ PE_APPROVED` and PE role on the requesting user. Reports does NOT recompute any Closeout scores or re-derive any data. Reports MUST NOT write back to or mutate any Closeout source-of-truth record.

**Org intelligence read boundary:** Project Hub contextual surfaces (lessons panel, sub vetting panel, learning legacy feed) are read-only consumers of the org intelligence indexes. No Project Hub surface may mutate any Closeout source-of-truth record through the org intelligence read path.

**Cross-module read boundary:** Closeout reads cross-module data (permit lifecycle state, financial variance, schedule dates) exclusively through `@hbc/related-items` read signals and through the respective module's summary/snapshot APIs (for the autopsy pre-briefing pack assembly). Closeout does not import from other feature packages.

### 14.5 Executive review and approval boundary

Project Closeout is a **review-capable surface** in Phase 3 (P3-E1 §9.1). Both PE (Project Executive) and PER (Portfolio Executive Reviewer) may annotate Closeout content. PE additionally has formal approval authority at all milestone gates and publication approvals.

| Rule | Description |
|---|---|
| **Annotation isolation** | All annotations MUST be stored in `@hbc/field-annotations`. They MUST NOT be stored in or written to any Closeout operational record (checklist, scorecard, lessons, autopsy). |
| **No mutation path from annotation** | No annotation action may trigger a mutation of any Closeout record. PE adding an annotation does not advance any status. |
| **PE annotation ≠ PE approval** | PE annotation (non-blocking observation stored in `@hbc/field-annotations`) is categorically distinct from PE approval (explicit API action that advances `publicationStatus` or `lifecycleState` and is stored on the operational record). These must be separate API actions and separate UI paths. |
| **PER annotation visibility** | PER annotations on Closeout records are visible to PM and PE; not visible to SUPT. |
| **PE annotation visibility** | PE annotations are visible to PM, SUPT, PE, and PER. |
| **Retention** | All annotation history is retained indefinitely; annotations survive project archive. |
| **Push** | PE push-to-project-team creates a governed work queue item per P3-D3 §13. |

**Field-level specification:** [P3-E10 — Project Closeout Module Field Specification](P3-E10-Project-Closeout-Module-Field-Specification.md) *(master index + T01–T11 detail files)*

---

## 15. Project Startup Source-of-Truth

### 15.1 Project Hub operational authority

| Authority dimension | Source-of-truth owner | Record name | Notes |
|---|---|---|---|
| Task Library | Project Hub | `StartupTaskTemplate` / `StartupTaskInstance` | MOE-governed template catalog plus project instance set; project instances created automatically on project creation; Pass/Fail/N/A/Pending results; `taskNumber` and `description` immutable on governed entries |
| Safety Readiness | Project Hub | `JobsiteSafetyChecklist` / `SafetyReadinessItem` / `SafetyRemediationRecord` | Startup safety readiness only; does NOT feed Safety module (P3-E8); open remediations are reviewable within Startup and may escalate internally |
| Contract Obligations Register | Project Hub | `ContractObligationsRegister` / `ContractObligation` | Structured obligation tracking with `OPEN` / `IN_PROGRESS` / `SATISFIED` / `WAIVED` / `NOT_APPLICABLE` lifecycle; PM owned; PX required for waiver |
| Responsibility Matrix — PM sheet (71 assignment rows + 11 reminder rows × 7 assignment roles) | Project Hub | `ResponsibilityMatrixRow` (sheet = PM) | Project-specific assignments on assignment-bearing rows; reminder rows preserved from workbook for display/reference only; named-`Primary` coverage and critical-category acknowledgment gate certification |
| Responsibility Matrix — Field sheet (27 assignment rows × 5 assignment roles) | Project Hub | `ResponsibilityMatrixRow` (sheet = Field) | Project-specific assignments; task descriptions immutable from template; category-level named-`Primary` coverage required before certification |
| Project Execution Baseline / PM Plan (11 sections) | Project Hub | `ProjectExecutionBaseline` / `ExecutionBaselineSection` / `BaselineSectionField` / `ExecutionAssumption` | Narrative + structured fields; `ExecutionAssumption` records associate structured assumptions with sections; PX approval required |
| Permit Posting Verification | Project Hub | `PermitVerificationDetail` (within Task Library Section 4) | Photo evidence upload is PWA-depth; metadata entry available in SPFx |
| Readiness certifications | Project Hub | `ReadinessCertification` | Six sub-surface certifications; SAFETY_READINESS requires Safety Manager co-sign; PX exclusive acceptance |
| Mobilization authorization | Project Hub | `PEMobilizationAuthorization` | PX exclusive; requires all certifications `ACCEPTED` or `WAIVED` and no open `ProgramBlocker` |
| Startup Baseline snapshot | Project Hub | `StartupBaseline` | Created atomically at `BASELINE_LOCKED`; immutable; consumed read-only by Closeout (P3-E10) |
| Procore setup reference fields | Procore (external) | — | Project Hub displays as read-only reference; does not write to Procore |

### 15.2 External references

| External system | Relationship |
|---|---|
| Procore | Procore is the external source for executed contract uploads and Admin setup fields. Project Hub does not write to Procore. The Procore setup reference surface in P3-E11 is read-only guidance in Project Hub. |
| Permits module (P3-E7) | Task Library Section 4 (`PermitVerificationDetail`) is a parallel, independent surface. `PermitVerificationDetail` records do not create, update, or close Permit records in P3-E7. Startup reads Permits read-only for cross-reference display context only. See §15.3. |
| Safety module (P3-E8) | Safety Readiness (`JobsiteSafetyChecklist` / `SafetyReadinessItem`) is a parallel, independent surface. A Fail result on a Safety Readiness item does not create a corrective action in P3-E8. See §15.3. |
| Project Closeout module (P3-E10) | Startup publishes `StartupBaseline` as a read-only API (`GET /api/startup/{projectId}/baseline`) consumed by Closeout. Startup writes no Closeout records; Closeout writes no Startup records. See §15.3. |

### 15.3 Boundary rules

**Permits non-interference rule:** Task Library Section 4 (`PermitVerificationDetail` records) verifies that permits are posted on the jobsite at startup. This surface has NO write relationship to the Permits module. `PermitVerificationDetail` status changes do not create, update, or close permit records in P3-E7. The Permits module does not auto-update Task Library results based on permit lifecycle state. Startup may read Permits data for cross-reference display only.

**Safety non-interference rule:** Safety Readiness (`JobsiteSafetyChecklist` / `SafetyReadinessItem`) is owned by Project Startup and represents startup safety readiness only. It has NO write relationship to the Safety module's ongoing inspection checklist, corrective action log, or incident records. A Fail result on a Safety Readiness item does not create a corrective action in P3-E8. The Safety Manager co-certification role in the startup workflow does not grant Safety module write access.

**PM Plan approval rule:** The Project Execution Baseline transitions from Draft → Submitted → Approved. Only a Project Executive (PX) may approve the plan. `ReadinessCertification` for `EXECUTION_BASELINE` cannot be submitted until the plan is `Approved`. Post-Approved edits require reversion to Draft and re-approval.

**Task description immutability:** `taskDescription` on governed `ResponsibilityMatrixRow` records is verbatim from the company template and MUST NOT be edited in any project instance. Custom rows (`isCustomRow = true`) are fully mutable.

**Startup-to-Closeout continuity rule:** `StartupBaseline` is the only Startup artifact published for Closeout consumption. It is read-only from Closeout's perspective (`GET /api/startup/{projectId}/baseline`). Startup publishes no org-intelligence indexes; it does not contribute to the Closeout module's scoring, ranking, or intelligence surfaces. Startup publishes to the Activity Spine and Health Spine for project-scoped signals only.

**Safety Remediation escalation:** A `SafetyRemediationRecord` reaching `escalationLevel = PX` / `remediationStatus = ESCALATED` on a startup safety item triggers an Activity Spine `SafetyRemediationEscalated` event and a Work Queue escalation item, and may raise a `ProgramBlocker`. It does not trigger any Safety module record. Escalation is internal to the Startup module.

**Waivers and exceptions:** PX may waive a `ReadinessCertification` sub-surface gate via `ExceptionWaiverRecord`. All waiver records are preserved permanently. There is no hard-delete path for any waiver record. Waivers do not suppress the underlying data — the certification state transitions to `WAIVED` and the waiver note is preserved in the record.

### 15.4 Executive review annotation boundary

Project Startup is a **review-capable surface** in Phase 3. Portfolio Executive Reviewers (PER) may place annotations at full field-level depth on all six Project Startup sub-surfaces: Task Library, Safety Readiness, Contract Obligations Register, Responsibility Matrix, Project Execution Baseline, and Permit Posting Verification.

**Important distinction from Safety module:** Unlike the Safety module (P3-E8), the Safety Readiness surface within Project Startup IS subject to executive review annotations. The Safety executive review exclusion applies only to the Safety module's own surfaces. Project Startup's safety readiness surface follows standard annotation rules.

**Post-lock annotation:** After `BASELINE_LOCKED`, all sub-surface records become read-only. PX and PER annotations continue to be permitted on all sub-surfaces post-lock. Annotations do not require a writable record state.

| Action | Rule |
|---|---|
| **Annotate** | PER-sourced; `@hbc/field-annotations` artifact; MUST NOT write to any operational Startup record |
| **Push** | Push-to-Project-Team creates a governed work queue item per P3-D3 §13 |
| **Post-lock annotate** | Permitted for PX and PER; annotation layer unaffected by `BASELINE_LOCKED` state |

**Field-level specification:** [P3-E11 — Project Startup Module Field Specification](P3-E11-Project-Startup-Module-Field-Specification.md) *(master index + T01–T10 detail files)*

---

## 16. Subcontract Execution Readiness Source-of-Truth

### 16.1 Project Hub operational authority

| Data domain | Authority | Notes |
|---|---|---|
| `SubcontractReadinessCase` records | Project Hub | One active case per subcontractor legal entity plus governed award / buyout intent; successor cases required for material path changes |
| `RequirementProfileBinding` | Project Hub | Governed profile provenance; no ad hoc PM configuration |
| `ReadinessRequirementItem` records | Project Hub | Generated from the bound profile; owns artifact state and evaluation state |
| `RequirementArtifact` | Project Hub | Attachment, reference, and receipt provenance for item review |
| `RequirementEvaluation` | Project Hub | Compliance / Risk-owned evaluation output |
| `ExecutionReadinessDecision` | Project Hub | Distinct ready / blocked / superseded / void output consumed by Financial |
| `ExceptionCase` and `ExceptionSubmissionIteration` | Project Hub | Governed relief mechanism; immutable submission iterations |
| Approval-slot and delegation audit | Project Hub | Preserves slot identity and reassignment history |
| `GlobalPrecedentReference` | Project Hub | Reference-only publication; never automatic approval carry-forward |

### 16.2 External references

| External system | Relationship |
|---|---|
| Buyout Log (P3-E4 §6) | The readiness gate projection is the execution gate for `ContractExecuted`. Financial enforces the gate; this module sources the readiness truth. See §16.3. |
| Compass / SDI Prequalification | Compass is one reference input to the SDI / prequalification requirement family. Readiness logic evaluates governed outcomes; Compass is not the whole rule. |

### 16.3 Boundary rules

**Buyout gate rule:** The Financial module's Buyout Log entry for a subcontract MUST NOT transition to `ContractExecuted` unless the active `ReadinessGateProjection.executionReadinessOutcome` allows execution for the current identity and current award path, based on the active issued `ExecutionReadinessDecision`. This gate is enforced in the Financial module's Buyout status update API. The readiness module surfaces the source-of-truth state; it does not perform the Financial transition itself.

**Readiness → Financial read direction:** The readiness module may read budget, contract value, and award-path context from the linked Buyout Log entry to populate case header context. The Financial module MUST NOT write to or mutate readiness records.

**Governed applicability:** PM / APM users may request applicability review, but they may not directly mark governed items not required. Only Compliance / Risk may resolve an item to `NOT_REQUIRED_BY_RULE`.

**Approval-slot independence:** No approval in an exception packet may be inferred or auto-populated from another. Each governed slot records its own action history.

**Material award-path change rule:** If award-path facts change in a way that affects profile selection or gate posture, the active case must be `SUPERSEDED` or `VOID`, and a successor case must be created where appropriate.

### 16.4 Executive review annotation boundary

Subcontract Execution Readiness is a **review-capable surface** in Phase 3. Portfolio Executive Reviewers may place annotations on case, requirement-item, exception-packet, and readiness-decision content.

| Action | Rule |
|---|---|
| **Annotate** | PER-sourced; `@hbc/field-annotations` artifact; MUST NOT write to case, item, evaluation, packet, or decision records |
| **Push** | Push-to-Project-Team creates a governed work queue item per P3-D3 §13. |

**Field-level specification:** [P3-E13 — Subcontract Execution Readiness Module Field Specification](P3-E13-Subcontract-Execution-Readiness-Module-Field-Specification.md)

---

## 17. Acceptance Gate Reference

**Gate:** Core module gates (Phase 3 plan §18.5)

| Field | Value |
|---|---|
| **Pass condition** | Financial, Schedule, Constraints, Permits, Safety, Work Queue, Reports, Project Closeout, Project Startup, and Subcontract Execution Readiness meet their locked source-of-truth and action-boundary rules; executive review annotation boundary rules enforced per §3.4–§8.4, §14.4, §15.4, and §16.4; Safety exclusion applies to Safety module surfaces only (§8.4); annotation isolation mutation prohibitions verified; Closeout hybrid publication rule (§14.3) respected; Startup Permits and Safety non-interference rules (§15.3) respected; Subcontract Execution Readiness buyout gate rule (§16.3) enforced at the Financial module API layer |
| **Evidence required** | P3-E2 (this document), module implementations respecting authority matrices, spine publication flowing through governed boundaries, mutation rules enforced, override provenance tracked, executive review annotation artifacts isolated from module source-of-truth records |
| **Primary owner** | Architecture + Project Hub platform owner |

---

## 18. Policy Precedence

This specification establishes the **source-of-truth and action-boundary rules** that module implementations must satisfy:

| Deliverable | Relationship to P3-E2 |
|---|---|
| **Phase 3 Plan §6, §12** | Provides the hybrid spine model and module boundary rules that this specification codifies |
| **P3-E1** — Module Classification Matrix | Provides module classification and high-level boundary rules that this specification expands |
| **P3-A3 §4.3, §5.3, §6.3** — Spine Architecture Boundaries | Lock the spine-level ownership rules that this specification aligns with |
| **P3-D1–D4** — Spine Contracts | Define the complete spine specifications that govern cross-module data flow |
| **P3-G1 §4** — Module Lane Depth Matrix | Defines per-capability lane depth that may affect action availability per lane |
| **P3-E3** — Spreadsheet/Document Replacement Reference | Must align replacement workflows with source-of-truth authority defined here |
| **P3-F1** — Reports Contract | Must implement Reports module per the source-of-truth rules in §8 |
| **Any module implementation** | Must respect source-of-truth authority, action boundaries, mutation rules, and override governance |

If a downstream deliverable conflicts with this specification, this specification takes precedence for source-of-truth and action-boundary rules unless the Architecture lead approves a documented exception.

---

**Last Updated:** 2026-03-24 (v4) — §16 rewritten to replace the old P3-E12 Subcontract Compliance checklist-and-waiver boundary with the P3-E13 Subcontract Execution Readiness case / profile / exception / decision model, including the revised Financial gate contract and review annotation boundary. Prior: 2026-03-24 (v3) — §14 Project Closeout rewritten to reflect derived intelligence model, correct publication trigger (PE_APPROVED + ARCHIVED, not Section 6 completion), Autopsy sub-surface, LessonsIntelligenceIndex/SubIntelligenceIndex/LearningLegacyFeed as derived read models, PE annotation vs. PE approval formal distinction, and updated field-level specification link. Prior: 2026-03-23 (v2)
**Governing Authority:** [Phase 3 Plan §6, §12](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md)
