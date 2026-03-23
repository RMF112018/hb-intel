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
| Budget baseline | Procore / CSV upload (`budget_details`) | Budget import workflow | Ingest and normalize; does not originate budget data |
| Future: direct API | Procore API integration | API sync (future) | Same ingestion role, different transport |

### 3.2 Project Hub operational authority

| Data domain | Authority | Notes |
|---|---|---|
| Financial Summary working state | **Project Hub owns** | Editable operational forecast |
| GC/GR working model | **Project Hub owns** | Editable working model |
| Cash Flow working model | **Project Hub owns** | Editable working model |
| Forecast checklist completion | **Project Hub owns** | Checklist state and completion tracking |
| Exposure tracking | **Project Hub owns** | Exposure flags and quantification |
| Buyout working state | **Project Hub owns** | Within Financial domain (P3-E1 §4.1) |
| Export artifacts | **Project Hub generates** | Derived from working state |

### 3.3 Boundary rule

Project Hub is NOT the ERP/accounting system-of-record. Financial is an operational financial surface that replaces spreadsheet workflow for project-team use. Budget baseline comes from upstream; working state is Project Hub's.

### 3.4 Executive review annotation boundary

Financial is a **review-capable surface** in Phase 3 (P3-E1 §9.1). Portfolio Executive Reviewers may place annotations at full field-level depth on Financial module content.

| Rule | Description |
|---|---|
| **Annotation isolation** | Review annotations MUST be stored in a separate `@hbc/field-annotations` artifact. They MUST NOT be stored in or written to any Financial source-of-truth record (working forecast state, GC/GR model, Cash Flow model, Buyout state, etc.). |
| **No mutation path** | Annotations are read-layer overlays only. No review annotation may trigger a mutation of Financial working state — not a budget line, not a forecast override, not a checklist completion. |
| **Visibility** | Restricted to the review circle before the PER explicitly pushes to the project team. |
| **Push** | Push-to-Project-Team creates a governed work queue item per P3-D3 §13. |

**Field-level specification:** [P3-E4 — Financial Module Field Specification](P3-E4-Financial-Module-Field-Specification.md)

---

## 4. Schedule Source-of-Truth

### 4.1 Upstream authority

| Data | Source | Ingestion path | Project Hub role |
|---|---|---|---|
| Detailed baseline schedule | Primavera / MS Project | XER/XML/CSV file ingestion | Ingest and normalize; does not originate CPM data |
| Full CPM network logic | Upstream schedule system | Not ingested — remains upstream | Project Hub does not replicate CPM |

### 4.2 Project Hub operational authority

| Data domain | Authority | Notes |
|---|---|---|
| Milestone tracking | **Project Hub owns** | Normalized milestone state |
| Manual milestone management | **Project Hub owns** | User-created milestones |
| Governed forecast overrides | **Project Hub owns** | Override with provenance metadata |
| Schedule projections | **Project Hub owns** | Derived for health, financial, reports |
| Upload history / restore | **Project Hub owns** | Full ingestion history |

### 4.3 Boundary rule

Project Hub is NOT full CPM authoring. Schedule is an operational schedule surface. Upstream schedule systems remain authoritative for detailed baseline/update data and full CPM network logic. Project Hub owns normalized project schedule context.

### 4.4 Executive review annotation boundary

Schedule is a **review-capable surface** in Phase 3 (P3-E1 §9.1). Portfolio Executive Reviewers may place annotations at full field-level depth on Schedule module content.

| Rule | Description |
|---|---|
| **Annotation isolation** | Review annotations MUST be stored in a separate `@hbc/field-annotations` artifact. They MUST NOT be stored in or written to any Schedule source-of-truth record. |
| **No mutation path** | Annotations are read-layer overlays only. No review annotation may trigger a mutation of milestone state, governed forecast overrides, projections, or upload history. |
| **Visibility** | Restricted to the review circle before the PER explicitly pushes to the project team. |
| **Push** | Push-to-Project-Team creates a governed work queue item per P3-D3 §13. |

**Field-level specification:** [P3-E5 — Schedule Module Field Specification](P3-E5-Schedule-Module-Field-Specification.md)

---

## 5. Constraints Source-of-Truth

### 5.1 Project Hub operational authority

| Data domain | Authority | Notes |
|---|---|---|
| Constraint records | **Project Hub owns** | Full operational ledger |
| Change Tracking entries | **Project Hub owns** | Full operational ledger |
| Delay Log entries | **Project Hub owns** | Full operational ledger |
| Due dates, BIC, responsibility | **Project Hub owns** | Per-constraint management |
| Delay impact quantification | **Project Hub owns** | Cross-module impact tracking |

### 5.2 External references

Supporting artifacts/documents MAY live in governed external destinations (SharePoint libraries, document management). Project Hub maintains canonical references back to the ledger.

### 5.3 Boundary rule

Constraints module is the operational ledger owner. No upstream system is authoritative for constraint data — Project Hub originates and owns all constraint, change tracking, and delay log records.

### 5.4 Executive review annotation boundary

Constraints is a **review-capable surface** in Phase 3 (P3-E1 §9.1). Portfolio Executive Reviewers may place annotations at full field-level depth on Constraints module content.

| Rule | Description |
|---|---|
| **Annotation isolation** | Review annotations MUST be stored in a separate `@hbc/field-annotations` artifact. They MUST NOT be stored in or written to the Constraints operational ledger. |
| **No mutation path** | Annotations are read-layer overlays only. No review annotation may trigger a mutation of constraint records, Change Tracking entries, Delay Log entries, due dates, BIC assignments, or delay impact values. |
| **Visibility** | Restricted to the review circle before the PER explicitly pushes to the project team. |
| **Push** | Push-to-Project-Team creates a governed work queue item per P3-D3 §13. |

**Field-level specification:** [P3-E6 — Constraints Module Field Specification](P3-E6-Constraints-Module-Field-Specification.md)

---

## 6. Permits Source-of-Truth

### 6.1 Project Hub operational authority

| Data domain | Authority | Notes |
|---|---|---|
| Permit log | **Project Hub owns** | Full operational ledger |
| Linked required inspections | **Project Hub owns** | Inspection linkage and tracking |
| Inspection results/status | **Project Hub owns** | Aggregated status |
| Expiration/status tracking | **Project Hub owns** | Proactive expiration monitoring |

### 6.2 External references

Jurisdictional artifacts/documents and governed storage locations MAY exist outside Project Hub. Project Hub maintains canonical references back to the permit ledger.

### 6.3 Boundary rule

Permits module is the operational ledger owner for permits and inspections. External jurisdictional documents are referenced, not owned.

### 6.4 Executive review annotation boundary

Permits is a **review-capable surface** in Phase 3 (P3-E1 §9.1). Portfolio Executive Reviewers may place annotations at full field-level depth on Permits module content.

| Rule | Description |
|---|---|
| **Annotation isolation** | Review annotations MUST be stored in a separate `@hbc/field-annotations` artifact. They MUST NOT be stored in or written to the permit ledger or inspection records. |
| **No mutation path** | Annotations are read-layer overlays only. No review annotation may trigger a mutation of permit status, inspection results/linkage, or expiration tracking. |
| **Visibility** | Restricted to the review circle before the PER explicitly pushes to the project team. |
| **Push** | Push-to-Project-Team creates a governed work queue item per P3-D3 §13. |

**Field-level specification:** [P3-E7 — Permits Module Field Specification](P3-E7-Permits-Module-Field-Specification.md)

---

## 7. Safety Source-of-Truth

### 7.1 Project Hub operational authority

| Data domain | Authority | Notes |
|---|---|---|
| Project safety-plan state | **Project Hub owns** | Structured safety plan |
| Subcontractor acknowledgments | **Project Hub owns** | Acknowledgment records |
| Safety orientation records | **Project Hub owns** | Orientation tracking |
| Checklist / inspection aggregation | **Project Hub owns** | Aggregated from weighted safety checklist baseline |
| JHA log records | **Project Hub owns** | Job hazard analysis logs |
| Emergency-plan acknowledgment | **Project Hub owns** | Acknowledgment state |
| Incident reports | **Project Hub owns** | Working state and notification state |
| Safety follow-up actions | **Project Hub owns** | Linked follow-up tracking |

### 7.2 External references

Governed safety artifacts/documents MAY live in destination libraries. Project Hub maintains canonical references.

### 7.3 Boundary rule

Safety module is the operational platform owner. It replaces the current Site Specific Safety Plan file-based workflow. All operational safety state originates in and is owned by Project Hub.

### 7.4 Executive review exclusion (Phase 3)

Safety is **excluded from Phase 3 executive review** (P3-E1 §9.1 and §9.3). The following rules apply:

| Rule | Description |
|---|---|
| **No annotation layer** | No executive review annotation layer exists for the Safety module in Phase 3. Portfolio Executive Reviewers MUST NOT place review annotations on Safety module content. |
| **Read-only PER access** | PER posture grants read-only access to Safety module data. Read-only access does not constitute a review layer — there is no annotation capability and no push-to-team pathway from Safety in Phase 3. |
| **No mutation path from PER** | PER access to Safety data is strictly non-operational. No PER action may trigger any write to Safety source-of-truth records. |
| **Rationale** | Safety data is operationally sensitive and compliance-critical. This exclusion may be revisited in a later phase with appropriate governance controls (P3-E1 §9.3). |

**Field-level specification:** [P3-E8 — Safety Module Field Specification](P3-E8-Safety-Module-Field-Specification.md)

---

## 8. Reports Source-of-Truth

### 8.1 Project Hub operational authority

| Data domain | Authority | Notes |
|---|---|---|
| Report family definitions | **Project Hub owns** | PX Review, Owner Report |
| Report run ledger | **Project Hub owns** | Run history, generation tracking |
| Draft state | **Project Hub owns** | Auto-assembled drafts with staleness handling |
| PM narrative overrides | **Project Hub owns** | Governed narrative editing |
| Release/distribution state | **Project Hub owns** | Release lifecycle tracking |
| Export artifacts | **Project Hub generates** | Derived from draft state |

### 8.2 Module snapshot consumption

| Source module | Data consumed | Authority |
|---|---|---|
| Financial | Forecast summary, exposure, checklist status | Financial module owns source |
| Schedule | Milestone status, variance, projections | Schedule module owns source |
| Constraints | Open/overdue counts, delay impact | Constraints module owns source |
| Permits | Status summary, expiration risk | Permits module owns source |
| Safety | Incident summary, compliance metrics | Safety module owns source |
| Health | Overall status, dimension scores, triage | Health spine owns source |

### 8.3 Boundary rule

Reports module owns the report lifecycle (definition, generation, draft, approval, release). Reports does NOT own the module data it assembles — it consumes snapshots from the respective module spines at generation time.

### 8.4 Executive review boundary

Reports is a **review-capable surface** in Phase 3 but under governance that differs from the operational module surfaces. PER authority over Reports is governed by P3-F1 (the central project-governance policy record and report-family release rules).

| Rule | Description |
|---|---|
| **Annotation isolation** | Review annotations on report content MUST NOT modify report definitions, the run ledger, draft state, or PM narrative. Annotations are a separate review-layer artifact. |
| **No PM draft authority** | PER has no authority over PM draft state. PM draft state confirmation is PM/PE-owned exclusively. PER MUST NOT initiate, approve, or modify the PM draft confirmation step. |
| **Reviewer-generated review runs** | PER may generate review runs only against the latest already-confirmed PM-owned snapshot. PER CANNOT generate a run against an unconfirmed or in-progress PM draft. |
| **Release authority** | PER release authority on a given report family is governed by the central project-governance policy record (P3-F1). It is not universal — family-by-family, governed by policy. |
| **PX Review cannot bypass PE internal review** | The PM↔PE internal review chain, when configured at project level, MUST complete before PX Review proceeds. PER cannot bypass this chain. |

**Field-level specification:** [P3-E9 — Reports Module Field Specification](P3-E9-Reports-Module-Field-Specification.md)

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
| Closeout checklist items | **Project Hub owns** | 70-item checklist across 7 sections |
| Checklist item results (Yes/No/N/A) | **Project Hub owns** | Tri-state per item |
| Checklist date fields | **Project Hub owns** | Date-bearing items (2.10, 3.11, 4.2, 4.3, 4.4, 4.13); item 4.14 is calculated |
| Subcontractor scorecard records | **Project Hub owns** | Full evaluation record per subcontractor |
| Scorecard scoring and calculation | **Project Hub owns** | Section averages and weighted overall score computed in module |
| Aggregation dashboard rows | **Project Hub owns** | Organization-wide subcontractor database fed from individual scorecards |
| Lessons Learned entries | **Project Hub owns** | Per-lesson structured records |
| Lessons database rows | **Project Hub owns** | Organization-wide lessons knowledge database |
| Jurisdiction configuration (Section 7) | **Project Hub owns** | Per-project jurisdiction template selection |
| Section 6 integration state | **Project Hub owns** | Completion status and snapshot triggers for Reports module |

### 14.2 External references

Completed closeout documents (certificates, surveys, letters) may live in governed external destinations (SharePoint libraries, document management). Project Hub maintains canonical references to those artifacts; the artifacts themselves are not owned by Project Hub.

### 14.3 Boundary rule

Project Closeout is the operational owner of all closeout execution state. No upstream system is authoritative for closeout checklist, scorecard, or lessons learned data. Project Hub originates and owns all records.

**Hybrid publication rule:** When Section 6 completion items (6.3 Subcontractor Evaluation, 6.5 Lessons Learned) are marked complete, the Project Closeout module generates a snapshot and publishes it to the Reports module. The Reports module consumes the snapshot to assemble release artifacts (PDF export, distribution). The Reports module MUST NOT write back to or mutate any Closeout source-of-truth record during this process.

### 14.4 Executive review annotation boundary

Project Closeout is a **review-capable surface** in Phase 3 (P3-E1 §9.1). Portfolio Executive Reviewers may place annotations at full field-level depth on Project Closeout module content.

| Rule | Description |
|---|---|
| **Annotation isolation** | Review annotations MUST be stored in a separate `@hbc/field-annotations` artifact. They MUST NOT be stored in or written to the closeout checklist, scorecard records, or lessons entries. |
| **No mutation path** | Annotations are read-layer overlays only. No review annotation may trigger a mutation of closeout records, scorecard scores, lessons entries, or aggregation dashboard rows. |
| **Visibility** | Restricted to the review circle before the PER explicitly pushes to the project team. |
| **Push** | Push-to-Project-Team creates a governed work queue item per P3-D3 §13. |

**Field-level specification:** [P3-E10 — Project Closeout Module Field Specification](P3-E10-Project-Closeout-Module-Field-Specification.md)

---

## 15. Project Startup Source-of-Truth

### 15.1 Project Hub operational authority

| Authority dimension | Source-of-truth owner | Notes |
|---|---|---|
| Job Startup Checklist (55-item, 4 sections) | Project Hub | Operational state only; one checklist per project; created automatically on project creation |
| Jobsite Safety Checklist (32-item startup readiness) | Project Hub | Startup safety readiness only; does NOT feed Safety module (P3-E8) |
| Responsibility Matrix — PM sheet (84 tasks × 9 roles) | Project Hub | Project-specific assignments; task descriptions immutable from template |
| Responsibility Matrix — Field sheet (28 tasks × 8 roles) | Project Hub | Project-specific assignments; task descriptions immutable from template |
| Owner Contract Review rows | Project Hub | Structured extraction from uploaded Owner's contract; PM editable |
| Project Management Plan (11 sections) | Project Hub | Narrative + structured fields; PX approval required for Approved status |
| Procore setup reference fields | Procore (external) | Project Hub displays as read-only reference; does not write to Procore |

### 15.2 External references

| External system | Relationship |
|---|---|
| Procore | Procore is the external source for executed contract uploads (referenced in §4.1 of P3-E11) and Admin setup fields. Project Hub does not write to Procore. The Procore setup reference surface (§6 of P3-E11) is read-only guidance in Project Hub. |
| Permits module (P3-E7) | Job Startup Checklist Section 4 (Permits Posted on Jobsite) is a parallel, independent surface. Neither module writes to the other based on Section 4 checklist state. See §15.3. |
| Safety module (P3-E8) | The Jobsite Safety Checklist (startup readiness) is a parallel, independent surface. A Fail result does not create a Safety module corrective action. See §15.3. |

### 15.3 Boundary rules

**Permits non-interference rule:** Job Startup Checklist Section 4 (items 4.1–4.12) verifies permits are posted on the jobsite at startup. This checklist surface has NO write relationship to the Permits module. Marking a Section 4 item Yes does not create, update, or close a permit record in P3-E7. The Permits module does not auto-update Section 4 item results based on permit lifecycle state.

**Safety non-interference rule:** The 32-item Jobsite Safety Checklist is owned by Project Startup and represents startup safety readiness. It has NO write relationship to the Safety module's ongoing inspection checklist, corrective action log, or incident records. A Fail result on a Jobsite Safety Checklist item does not create a corrective action in P3-E8.

**PM Plan approval rule:** The Project Management Plan transitions from Draft → Submitted → Approved. Only a Project Executive (PX) may transition a plan to Approved status. Any post-Approved edit reverts the affected sections to Draft, requiring resubmission.

**Task description immutability:** Responsibility Matrix task descriptions are verbatim from the company template. They MUST NOT be edited in any project instance. New project-specific tasks may be added under a `Custom` task category.

### 15.4 Executive review annotation boundary

Project Startup is a **review-capable surface** in Phase 3. Portfolio Executive Reviewers may place annotations at full field-level depth on all Project Startup sub-surfaces: Job Startup Checklist, Jobsite Safety Checklist, Responsibility Matrix, Owner Contract Review, and Project Management Plan.

**Important distinction from Safety module:** Unlike the Safety module (P3-E8), the Jobsite Safety Checklist within Project Startup IS subject to executive review annotations. The Safety executive review exclusion applies only to the Safety module's own surfaces. Project Startup's safety readiness checklist follows standard annotation rules.

| Action | Rule |
|---|---|
| **Annotate** | PER-sourced; `@hbc/field-annotations` artifact; MUST NOT write to operational records |
| **Push** | Push-to-Project-Team creates a governed work queue item per P3-D3 §13. |

**Field-level specification:** [P3-E11 — Project Startup Module Field Specification](P3-E11-Project-Startup-Module-Field-Specification.md)

---

## 16. Subcontract Compliance Source-of-Truth

### 16.1 Project Hub operational authority

| Data domain | Authority | Notes |
|---|---|---|
| Subcontract Checklist records (one per subcontract) | Project Hub | Multi-record; created per subcontract by project team |
| Document package receipt tracking (12 document types) | Project Hub | PM-controlled; required-flag override per checklist allowed |
| Budget over/under (contractValue − budget) | Project Hub (calculated) | Calculated from PM-entered contractValue and budget fields |
| Compliance Waiver record (insurance and/or licensing) | Project Hub | Optional; attached when SDI or insurance/licensing requirements are not met |
| Waiver approval records (PX, CFO, Compliance Manager) | Project Hub | Three-party; sequencing flexible; all three required for Approved status |
| Waiver submission audit trail | Project Hub | Preserved on rejection; submissionCount increments on each resubmission |

### 16.2 External references

| External system | Relationship |
|---|---|
| Buyout Log (P3-E4 §6) | Subcontract Checklist is the compliance gate for `ContractExecuted` status in the Buyout Log. The Financial module enforces the gate; the Subcontract Compliance module is the source-of-truth for gate satisfaction. See §16.3. |
| Compass / SDI Prequalification | Compass is the external SDI prequalification system. The `CompassSDI` document item tracks receipt of the prequalification; Compass itself is not integrated into Project Hub in Phase 3. |

### 16.3 Boundary rules

**Buyout gate rule:** The Financial module's Buyout Log entry for a subcontract MUST NOT transition to `ContractExecuted` unless the linked `ISubcontractChecklist.status === 'Complete'` AND either no waiver is attached or the attached waiver's `status === 'Approved'`. This gate is enforced in the Financial module's Buyout status update API. The Subcontract Compliance module surfaces status; it does not perform gate enforcement itself.

**Checklist → Financial read direction:** The Subcontract Compliance module may read the `budget` value from the linked Buyout Log entry to populate the `ISubcontractChecklist.budget` field. The Financial module MUST NOT write to or mutate Subcontract Compliance records.

**Waiver approval independence:** No approval in the three-party waiver routing may be inferred or auto-populated from another. Each of PX, CFO, and Compliance Manager must explicitly record their action in their own `IWaiverApproval` record.

**Over/under reason gate:** A checklist with `overUnder > 0` MUST NOT transition out of `Draft` status until `overUnderReason` is populated.

### 16.4 Executive review annotation boundary

Subcontract Compliance is a **review-capable surface** in Phase 3. Portfolio Executive Reviewers may place annotations on checklist and waiver content.

| Action | Rule |
|---|---|
| **Annotate** | PER-sourced; `@hbc/field-annotations` artifact; MUST NOT write to checklist records, document items, or waiver approval records |
| **Push** | Push-to-Project-Team creates a governed work queue item per P3-D3 §13. |

**Field-level specification:** [P3-E12 — Subcontract Compliance Module Field Specification](P3-E12-Subcontract-Compliance-Module-Field-Specification.md)

---

## 17. Acceptance Gate Reference

**Gate:** Core module gates (Phase 3 plan §18.5)

| Field | Value |
|---|---|
| **Pass condition** | Financial, Schedule, Constraints, Permits, Safety, Work Queue, Reports, Project Closeout, Project Startup, and Subcontract Compliance meet their locked source-of-truth and action-boundary rules; executive review annotation boundary rules enforced per §3.4–§8.4, §14.4, §15.4, and §16.4; Safety exclusion applies to Safety module surfaces only (§8.4); annotation isolation mutation prohibitions verified; Closeout hybrid publication rule (§14.3) respected; Startup Permits and Safety non-interference rules (§15.3) respected; Subcontract Compliance buyout gate rule (§16.3) enforced at the Financial module API layer |
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

**Last Updated:** 2026-03-23 (v2)
**Governing Authority:** [Phase 3 Plan §6, §12](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md)
