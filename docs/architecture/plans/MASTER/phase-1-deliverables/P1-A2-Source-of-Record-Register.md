# P1-A2: Source-of-Record Register

**Document ID:** P1-A2
**Phase:** 1 (Foundation)
**Classification:** Internal — Architecture
**Status:** Draft — Entity-level coverage complete for all Phase 1 domains (A4–A15)
**Date:** 2026-03-17
**References:** [P1-A1-Data-Ownership-Matrix.md](./P1-A1-Data-Ownership-Matrix.md), [P1-A3-SharePoint-Lists-Libraries-Schema-Register.md](./P1-A3-SharePoint-Lists-Libraries-Schema-Register.md), [package-relationship-map.md](../../blueprint/package-relationship-map.md)

---

## Purpose

Establish the authoritative source, read/write paths, and identity strategy for each HB Intel domain. This register is the operational handbook for adapter design: it tells developers where each domain's data lives, how to reach it safely, what identity key to use, and what class of write safety is required.

---

## Reading Guide

**Source of Record:** The authoritative system where the domain's business data originates and is stored.

**Adapter to Reach It:** The code path from AF (Azure Functions) to the source system, including middleware services (e.g., PnPjs for SharePoint).

**Identity Key:** The stable identifier for domain records across systems (e.g., SharePoint item ID, UPN, or composite).

**Write Safety Class:** The level of transactionality required:
- **Class A (Idempotent):** Safe to retry; duplicate creates return the existing record. Best for stateless CRUD.
- **Class B (Sequential):** Writes must be ordered; retries must check for prior success. Used when order or quantity matters.
- **Class C (Read-Mostly):** Writes rare, reads optimized. Used for reference data and user identity.
- **Class D (Audit-Only):** Append-only, never overwritten. Used for audit trails and immutable events.

**Phase Available:** The earliest phase in which this domain is available for use.

---

## Domain Source-of-Record Register

> **Summary layer.** This table defines SoR, adapter path, identity key, and write safety at the *domain* level. For entity-level governance (individual canonical models within each domain), see the [Entity-Level Source-of-Record and Adapter Behavior Register](#entity-level-source-of-record-and-adapter-behavior-register) below.

| Domain | Source of Record | Adapter to Reach It | Identity Key | Write Safety Class | Phase |
|--------|------------------|------------------|--------------|-------------------|-------|
| **leads** | SharePoint Lists on Sales/BD site (`MarketLeads`, `PipelineSnapshots`) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs list item CRUD | `lead_id` (surrogate) for market leads; `snapshot_id` (surrogate) for pipeline snapshots; `(division, snapshot_date)` natural key | Class A | 1 |
| **project** | SharePoint Hub site + Project Metadata List on hub | `@hbc/af-adapter-proxy` → AF v4 → (1) PnPjs hub site provision + (2) PnPjs list item CRUD | Project UUID (assigned during provisioning; maps to hub site ID) | Class A | 1 |
| **estimating** | SharePoint List on project site (Bid Items) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs `list.items.add()` / `list.items.getById().update()` | Numeric item ID (e.g., `123`; domain-scoped) | Class B | 1 |
| **schedule** | SharePoint List on project site (Milestones/Schedule) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs `list.items.add()` / `list.items.getById().update()` | Numeric item ID (e.g., `456`; domain-scoped) | Class A | 1 |
| **buyout** | SharePoint List on project site (Purchase Orders) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs `list.items.add()` / `list.items.getById().update()` | Numeric item ID (e.g., `789`; domain-scoped) | Class B | 1 |
| **compliance** | SharePoint List + Document Library on project site | `@hbc/af-adapter-proxy` → AF v4 → (1) PnPjs list.items for metadata + (2) PnPjs `web.getFolderByServerRelativePath().files.add()` | Numeric list item ID (metadata); doc URL for content | Class D | 1 |
| **contracts** | SharePoint List on project site (`PrimeContracts`) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs list item CRUD | `contract_id` (surrogate); `contract_number` natural key (unique); `source_project_id` for Procore federation | Class A | 1 |
| **risk** | SharePoint List on project site (Risk Register) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs `list.items.add()` / `list.items.getById().update()` | Numeric item ID (e.g., `1001`; domain-scoped) | Class A | 1 |
| **scorecard** | SharePoint Lists on project site (`SubcontractorScorecards`, `ScorecardCriterionScores`) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs `list.items.add()` / `list.items.getById().update()` | `evaluation_id` (surrogate); linked to project and subcontractor | Class A | 1 |
| **pmp** | SharePoint Document Library + PMP Index List on project site | `@hbc/af-adapter-proxy` → AF v4 → (1) PnPjs `web.getFolderByServerRelativePath().files.add()` + (2) PnPjs list item for index | PMP document URL; list item ID for metadata | Class A | 1 |
| **auth** | Microsoft Graph / Entra ID (read-only) | MSAL OBO flow → AF v4 → `@azure/identity` + `@microsoft/microsoft-graph-client` → Graph `/me`, `/users/{id}`, `/groups/{id}` | User Principal Name (UPN); object ID for groups | Class C | 1 |

### Operational State and Audit

| Data | Source of Record | Adapter to Reach It | Identity Key | Write Safety Class | Phase |
|------|------------------|------------------|--------------|-------------------|-------|
| **Provisioning state** | Azure Table Storage (partition key: `{projectId}`, row key: `provisioning-{timestamp}`) | AF v4 → `@azure/data-tables` → orchestration service reads/writes status | Project UUID (provisioning key) | Class D | 1 |
| **Audit log** | Azure Table Storage (partition key: `audit-{domain}`, row key: timestamp + UPN, append-only) | AF v4 → `@azure/data-tables` → audit service appends on every write | Composite: domain + timestamp + UPN | Class D | 1 |
| **Project identity mapping** | Azure Table Storage (partition key: `project-identities`, row key: `{projectId}`) | AF v4 → `@azure/data-tables` → identity mapping cache | Project UUID | Class A | 1 |

---

## Entity-Level Source-of-Record and Adapter Behavior Register

The domain register above captures one row per business domain. As canonical schemas mature (P1-A4 through P1-A15), each domain decomposes into discrete entities that may differ in storage target, write safety class, adapter pathway, or caching strategy. This section provides entity-level governance so adapter implementers know exactly how each canonical model is stored, read, written, and identified.

### How to read this register

| Column | Meaning |
|--------|---------|
| **Domain** | Parent domain from the domain register above |
| **Entity** | Canonical model name as defined in the schema document |
| **Schema Doc** | The P1-A _n_ document that defines this entity |
| **Storage Target** | Physical storage system (e.g., SharePoint List, Azure Table Storage, Document Library) |
| **Adapter Path** | Code path from AF to the storage target, including middleware |
| **Identity Key** | Stable identifier for records of this entity |
| **Write Safety Class** | Class A–D as defined in the [Reading Guide](#reading-guide) |
| **Read Pattern** | Dominant read access pattern (e.g., list-by-project, get-by-id, batch-import) |
| **Cacheable** | Whether reads may be cached and approximate TTL guidance |
| **Mutability** | Whether records are mutable, append-only, or immutable after closure |
| **Conflict Handling** | How divergence between this entity's data across systems or imports is resolved |
| **Lifecycle Owner** | The system or process that creates and retires records |
| **Phase** | Earliest phase in which the entity is available |

### Schedule domain (P1-A4)

P1-A4 defines 16 canonical entities for the schedule ingestion and normalization pipeline. These entities fall into three tiers for SoR and adapter governance:

1. **Canonical business data persisted in SharePoint** — core schedule entities that survive normalization and are stored in SharePoint lists (some as dedicated columns, some flattened into shared containers per A3 physical design).
2. **Canonical entities not persisted as first-class SharePoint containers in Phase 1** — entities recognized by A4's normalized model but deferred to Phase 2+ for dedicated storage. Their data is either captured in `sourceExtrasJson` fields or not persisted beyond parser stage.
3. **Operational and provenance state** — import batch tracking and validation findings that support audit and re-parse but are not user-facing business data.

#### Canonical business data persisted in SharePoint

| Entity | Data Class | Storage Target | Adapter Path | Identity Key | Write Safety Class | Read Pattern | Cacheable | Mutability | Conflict Handling | Lifecycle Owner | Phase |
|--------|-----------|----------------|--------------|-------------|-------------------|-------------|-----------|-----------|------------------|----------------|-------|
| `schedule_activity` | business | SharePoint List (`ScheduleActivities`) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `batch_id` + `source_activity_id` → `sch-act-{itemId}` | Class A | list-by-project, filter-by-wbs | Yes (5 min) | Mutable; superseded per batch | Newer batch wins; prior batch retained for audit | Import service | 1 |
| `schedule_project` | business | SharePoint List (`ScheduleImportBatches`, flattened) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `batch_id` + `source_project_id` → `sch-proj-{itemId}` | Class A | get-by-project | Yes (5 min) | Mutable; one record per batch | Newer batch wins; project metadata merged at batch level | Import service | 1 |
| `schedule_wbs_node` | business | SharePoint List (`ScheduleActivities`, FK fields `wbsId`, `activityCode`) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `batch_id` + `source_wbs_id` → `sch-wbs-{itemId}` | Class A | list-by-project (tree) | Yes (5 min) | Mutable; superseded per batch | Newer batch wins; WBS hierarchy rebuilt per import | Import service | 1 |
| `schedule_calendar` | business | SharePoint List (`ScheduleActivities`, FK reference `calendarId`) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `batch_id` + `source_calendar_id` → `sch-cal-{itemId}` | Class A | list-by-project | Yes (15 min) | Mutable; superseded per batch | Newer batch wins; calendar identity preserved as FK | Import service | 1 |
| `schedule_relationship` | business | SharePoint List (`ScheduleActivities`, `sourceExtrasJson`) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `batch_id` + `predecessor_activity_id` + `successor_activity_id` + `relationship_type` | Class A | list-by-activity | Yes (5 min) | Mutable; superseded per batch | Newer batch wins; relationships rebuilt per import | Import service | 1 |
| `schedule_baseline` | business | SharePoint List (`ScheduleActivities`, baseline date fields) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `batch_id` + `activity_id` + `baseline_number` | Class D | list-by-project | Yes (60 min) | Baseline 0 immutable; 1–10 append-only | Primary baseline never overwritten; additional baselines append per import | Import service | 1 |
| `schedule_udf_value` | udf | SharePoint List (`ScheduleActivities`, `sourceExtrasJson`) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `batch_id` + `udf_definition_id` + `entity_id` | Class A | list-by-entity | Yes (5 min) | Mutable; superseded per batch | Newer batch wins; UDF values preserved in extras JSON | Import service | 1 |

#### Canonical entities not persisted as first-class SharePoint containers (Phase 1)

These entities are part of A4's normalized canonical model but are not stored in dedicated SharePoint containers during Phase 1. Their source data is either captured in `sourceExtrasJson` for provenance or remains parser-stage transient data. When these entities gain dedicated storage in Phase 2+, they will be promoted to the persisted table above with full SoR governance.

| Entity | Data Class | Phase 1 Disposition | Reason | Phase Available |
|--------|-----------|---------------------|--------|----------------|
| `schedule_resource` | resource | Not persisted (parser-stage) | Resource definitions not user-facing in Phase 1 | 2+ |
| `schedule_resource_rate` | resource | Not persisted (parser-stage) | Rate tables deferred; not needed for activity-level schedule views | 2+ |
| `schedule_assignment` | resource | Not persisted (parser-stage) | Resource-to-activity assignments deferred; activity-level data sufficient for Phase 1 | 2+ |
| `schedule_code_type` | classification | Not persisted (parser-stage) | Code type definitions deferred; activity-level classification sufficient | 2+ |
| `schedule_code_value` | classification | Not persisted (parser-stage) | Code value hierarchies deferred | 2+ |
| `schedule_activity_code_assignment` | classification | Not persisted (parser-stage) | Code-to-activity links deferred | 2+ |
| `schedule_udf_definition` | udf | Not persisted (parser-stage) | UDF schema definitions deferred; UDF values preserved in `sourceExtrasJson` | 2+ |

#### Operational and provenance state

| Entity | Data Class | Storage Target | Adapter Path | Identity Key | Write Safety Class | Read Pattern | Cacheable | Mutability | Conflict Handling | Lifecycle Owner | Phase |
|--------|-----------|----------------|--------------|-------------|-------------------|-------------|-----------|-----------|------------------|----------------|-------|
| `schedule_import_batch` | operational | SharePoint List (`ScheduleImportBatches`) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `batch_id` (unique per project per upload) | Class D | get-by-id, list-by-project | No | Status progresses forward only (pending → parsing → mapping → complete/failed) | No conflict; each upload creates a new `batch_id` | Import service | 1 |
| `import_finding` | operational | Azure Table Storage (`partition: sch-findings-{batchId}`) | AF v4 → `@azure/data-tables` | `batch_id` + sequence/timestamp | Class D | list-by-batch | No | Append-only; immutable once logged | No conflict; new parser versions create new batch with new findings | Import service | 1 |

#### A3 physical compression note

P1-A3 physically consolidates the 16 canonical schedule entities into 3 SharePoint containers (`ScheduleActivities`, `ScheduleImportBatches`, `ScheduleUploadsLib`) plus Azure Table Storage for findings. Several canonical entities are flattened into shared containers (e.g., `schedule_wbs_node` → FK fields on `ScheduleActivities`, `schedule_relationship` → `sourceExtrasJson`). This register preserves the logical entity-level SoR view for adapter design regardless of physical compression. For physical container specifications, see [P1-A3](./P1-A3-SharePoint-Lists-Libraries-Schema-Register.md).

### External financial domain (P1-A6)

P1-A6 defines 4 canonical entities for external financial data ingestion. In Phase 1, Procore budget data is **mirrored and read-only** — imported as point-in-time CSV snapshots, canonicalized, and stored. No write-back to Procore occurs until Phase 4+. The import model is snapshot-append: each upload creates a complete budget snapshot as a new batch; the latest batch for a project represents current state; all prior batches are retained for trend analysis.

The 4 entities split across two storage tiers: SharePoint for user-facing business data and import metadata, Azure Table Storage for operational mappings and audit findings.

#### Canonical business data and import metadata persisted in SharePoint

| Entity | Data Class | Storage Target | Adapter Path | Identity Key | Write Safety Class | Read Pattern | Cacheable | Mutability | Conflict Handling | Lifecycle Owner | Phase |
|--------|-----------|----------------|--------------|-------------|-------------------|-------------|-----------|-----------|------------------|----------------|-------|
| `budget_line` | business (mirrored) | SharePoint List (`BudgetLines`) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `(batch_id, budget_code)` natural key; `line_id` surrogate | Class C | list-by-project, filter-by-batch, filter-by-cost-code | Yes (15 min) | Read-only snapshot per batch; newer batch supersedes | Procore is mirrored authority; newer snapshot supersedes; all prior batches retained for trend analysis | Import service | 1 |
| `budget_import_batch` | operational | SharePoint List (`BudgetImportBatches`) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `batch_id` (unique per project per upload) | Class D | get-by-id, list-by-project | No | Status progresses forward only (pending → parsing → validating → complete/failed) | No conflict; each upload creates a new `batch_id` | Import service | 1 |

#### Non-SharePoint operational and reference state

| Entity | Data Class | Storage Target | Adapter Path | Identity Key | Write Safety Class | Read Pattern | Cacheable | Mutability | Conflict Handling | Lifecycle Owner | Phase |
|--------|-----------|----------------|--------------|-------------|-------------------|-------------|-----------|-----------|------------------|----------------|-------|
| `budget_line_external_mapping` | reference | Azure Table Storage | AF v4 → `@azure/data-tables` | `mapping_id` surrogate; `(line_id, target_entity_type, target_entity_id)` natural key | Class A | list-by-line, list-by-target | Yes (5 min) | Mutable; mappings adjustable, deactivatable via `is_active` flag | `is_active` flag deactivates obsolete mappings; no hard deletion; `mapping_basis` documents provenance | Import service + manual curation | 1 |
| `budget_import_finding` | operational | Azure Table Storage (`partition: budget-findings-{batchId}`) | AF v4 → `@azure/data-tables` | `finding_id` surrogate; `(batch_id, line_id, severity, category)` implied | Class D | list-by-batch | No | Append-only; immutable once logged | No conflict; new imports create new findings per batch | Import service | 1 |

#### A3 physical compression note

P1-A3 stores the 4 canonical external financial entities across 2 SharePoint lists (`BudgetLines`, `BudgetImportBatches`), 1 document library (`BudgetUploadsLib` for raw Procore CSV provenance), and Azure Table Storage for findings and external mappings. This register preserves the logical entity-level SoR view for adapter design. For physical container specifications, see [P1-A3](./P1-A3-SharePoint-Lists-Libraries-Schema-Register.md).

### Estimating kickoff domain (P1-A8)

P1-A8 defines 7 canonical entities for the estimating kickoff workflow. This is a **template-driven** domain: a shared template library on the hub site provides governed default item sets, and project-level instances on project sites inherit from those templates while allowing custom additions. Evidence links and notes are secondary append-only records attached to primary execution rows.

#### Shared template assets (hub site)

| Entity | Data Class | Storage Target | Adapter Path | Identity Key | Write Safety Class | Read Pattern | Cacheable | Mutability | Conflict Handling | Lifecycle Owner | Phase |
|--------|-----------|----------------|--------------|-------------|-------------------|-------------|-----------|-----------|------------------|----------------|-------|
| `kickoff_template` | template (shared) | SharePoint List (`Shared_KickoffTemplates`, hub site) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `template_id` (surrogate); one active version per template name | Class C | get-by-id, list-active | Yes (60 min) | Immutable once published; new versions create new records; only one `is_active = true` at a time | No conflict; versioned; existing project instances unaffected by template updates | Estimating leadership | 1 |
| `kickoff_template_item` | template (shared) | SharePoint List (`Shared_KickoffTemplates`, hub site, same list) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `template_item_id` (surrogate, stable across versions) | Class C | list-by-template | Yes (60 min) | Immutable within version; `template_item_id` preserved across template evolution for lineage | No conflict; items within a version are frozen; new template version creates new item set | Estimating leadership | 1 |

#### Project execution records (project site)

| Entity | Data Class | Storage Target | Adapter Path | Identity Key | Write Safety Class | Read Pattern | Cacheable | Mutability | Conflict Handling | Lifecycle Owner | Phase |
|--------|-----------|----------------|--------------|-------------|-------------------|-------------|-----------|-----------|------------------|----------------|-------|
| `kickoff_instance` | execution | SharePoint List (`KickoffInstances`) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `instance_id` (surrogate); `(project_id, pursuit_id)` business context | Class A | get-by-id, list-by-project | Yes (5 min) | Mutable (status, dates); project snapshots (job name, architect, PE) immutable after creation | Last-write-wins with `updated_at` timestamp; creation-time snapshots not overwritten | Project team | 1 |
| `kickoff_row` | execution | SharePoint List (`KickoffRows`) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `row_id` (surrogate); `(instance_id, row_id)` composite | Class A | list-by-instance, filter-by-section | Yes (5 min) | Fully mutable (status, applicable, responsible, dates, tab_required) | Last-write-wins; `is_custom` flag distinguishes template-inherited vs project-added rows | Project team | 1 |
| `kickoff_evidence_link` | execution (secondary) | SharePoint List (`KickoffRows`, inline `currentEvidenceRef` in Phase 1) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `link_id` (surrogate); `(row_id, link_id)` composite | Class A | list-by-row | No | Append-only in practice; new links added, old links retained for history | No conflict; additive only; row's `currentEvidenceRef` is denormalized summary pointer | Project team | 1 |
| `kickoff_note` | execution (secondary) | SharePoint List (`KickoffRows`, inline `notesSummary` in Phase 1) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `note_id` (surrogate); `(row_id, note_id)` composite | Class A | list-by-row, ordered-by-created_at | No | Append-only; notes accumulate; no edit or delete | No conflict; additive only; ordered by `created_at` for history sequence | Project team | 1 |

#### Operational state (non-SharePoint)

| Entity | Data Class | Storage Target | Adapter Path | Identity Key | Write Safety Class | Read Pattern | Cacheable | Mutability | Conflict Handling | Lifecycle Owner | Phase |
|--------|-----------|----------------|--------------|-------------|-------------------|-------------|-----------|-----------|------------------|----------------|-------|
| `kickoff_import_batch` | operational | Azure Table Storage | AF v4 → `@azure/data-tables` | `batch_id` (surrogate, unique per import) | Class D | get-by-id, list-by-project | No | Status progresses forward only (pending → parsing → complete/failed); immutable after completion | No conflict; each import creates a new `batch_id` | Import service | 1 |

#### A3 physical compression note

P1-A3 stores kickoff entities across 3 SharePoint containers: `Shared_KickoffTemplates` (hub site, combines template + template items), `KickoffInstances` (project site), and `KickoffRows` (project site). Evidence links and notes are stored inline on `KickoffRows` in Phase 1 (`currentEvidenceRef`, `notesSummary` fields); Phase 2 may promote these to separate child lists. Import batches remain in Azure Table Storage. For physical container specifications, see [P1-A3](./P1-A3-SharePoint-Lists-Libraries-Schema-Register.md).

### Project lifecycle checklist domain (P1-A10)

P1-A10 defines 8 canonical entities for the project lifecycle checklist system spanning three families: startup, safety, and closeout. Like kickoff, this is a **template-driven** domain with shared templates on the hub site and project execution records on project sites. The hierarchy is: checklist → family instance → section → item → evidence link. A3 physically compresses the 6 project-site entities into a single `LifecycleChecklists` list.

#### Shared template assets (hub site)

| Entity | Data Class | Storage Target | Adapter Path | Identity Key | Write Safety Class | Read Pattern | Cacheable | Mutability | Conflict Handling | Lifecycle Owner | Phase |
|--------|-----------|----------------|--------------|-------------|-------------------|-------------|-----------|-----------|------------------|----------------|-------|
| `lifecycle_checklist_template` | template (shared) | SharePoint List (`Shared_ChecklistTemplates`, hub site) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `template_id` (surrogate); `(template_id, checklist_family)` unique pair | Class C | get-by-id, list-by-family | Yes (60 min) | Immutable once published; versioned; existing project instances unaffected | No conflict; versioned; projects snapshot template at instance creation via `template_snapshot_date` | Operations leadership | 1 |
| `lifecycle_checklist_template_item` | template (shared) | SharePoint List (`Shared_ChecklistTemplates`, hub site, same list) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `template_item_id` (surrogate, stable across versions) | Class C | list-by-template, filter-by-family | Yes (60 min) | Immutable within version; changes propagate to new instances only | No conflict; items within a version are frozen | Operations leadership | 1 |

#### Project execution records (project site)

| Entity | Data Class | Storage Target | Adapter Path | Identity Key | Write Safety Class | Read Pattern | Cacheable | Mutability | Conflict Handling | Lifecycle Owner | Phase |
|--------|-----------|----------------|--------------|-------------|-------------------|-------------|-----------|-----------|------------------|----------------|-------|
| `project_lifecycle_checklist` | execution | SharePoint List (`LifecycleChecklists`, flattened) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `checklist_id` (surrogate); one per project | Class A | get-by-project | Yes (5 min) | Limited: `overall_status` mutable; project snapshots (name, number) immutable after creation | Last-write-wins for status; snapshots frozen at creation for audit | Project team | 1 |
| `project_checklist_family_instance` | execution | SharePoint List (`LifecycleChecklists`, flattened) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `instance_id` (surrogate); `(checklist_id, checklist_family)` unique pair | Class A | list-by-checklist, filter-by-family | Yes (5 min) | Mutable (family status, completion_percentage, notes); `template_snapshot_date` immutable | Last-write-wins for status and completion fields | Project team | 1 |
| `checklist_section` | execution | SharePoint List (`LifecycleChecklists`, flattened as `sectionNumber` + `sectionLabel`) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `section_id` (surrogate); `(instance_id, section_number)` unique pair | Class A | list-by-instance | Yes (15 min) | Immutable once created from template; section structure is fixed per family instance | No conflict; section structure is template-derived and frozen | Template (at creation) | 1 |
| `checklist_item` | execution | SharePoint List (`LifecycleChecklists`, primary record) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `item_id` (surrogate); `(section_id, item_number)` unique within section | Class A | list-by-section, filter-by-outcome | Yes (5 min) | Mutable (`canonical_outcome`, `raw_outcome_value`, `status_notes`, `target_date`, `completed_date`, `current_evidence_ref`) | Last-write-wins; `is_custom` distinguishes template-inherited vs project-added | Project team | 1 |
| `checklist_evidence_link` | execution (secondary) | SharePoint List (`LifecycleChecklists`, inline `currentEvidenceRef` in Phase 1) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `link_id` (surrogate); `(item_id, link_id)` composite | Class A | list-by-item | No | Append-only in practice; Phase 1 stores single reference inline; Phase 2 may promote to child list | No conflict; additive only; `currentEvidenceRef` on item is denormalized summary | Project team | 1 |

#### Operational state (non-SharePoint)

| Entity | Data Class | Storage Target | Adapter Path | Identity Key | Write Safety Class | Read Pattern | Cacheable | Mutability | Conflict Handling | Lifecycle Owner | Phase |
|--------|-----------|----------------|--------------|-------------|-------------------|-------------|-----------|-----------|------------------|----------------|-------|
| `checklist_import_batch` | operational | Azure Table Storage | AF v4 → `@azure/data-tables` | `batch_id` (surrogate, unique per import) | Class D | get-by-id, list-by-project | No | Status progresses forward only (pending → parsing → complete/failed); immutable after completion | No conflict; each import creates a new `batch_id` | Import service | 1 |

#### A3 physical compression note

P1-A3 compresses the 8 canonical lifecycle checklist entities into 2 SharePoint containers: `Shared_ChecklistTemplates` (hub site, combines template + template items across all 3 families) and `LifecycleChecklists` (project site, flattens checklist aggregate, family instances, sections, items, and evidence links into a single list with `checklistFamily` discriminator). Import batches remain in Azure Table Storage. The unified `LifecycleChecklists` list uses `checklistFamily` (startup/safety/closeout) to partition records and supports family-specific outcome vocabularies mapped to canonical outcomes. For physical container specifications, see [P1-A3](./P1-A3-SharePoint-Lists-Libraries-Schema-Register.md).

### Responsibility matrix domain (P1-A11)

P1-A11 defines 10 canonical entities for the responsibility matrix system spanning three families: PM, field, and owner/contract. This is a **template-driven** domain: a shared template library and canonical role/party catalog on the hub site provide governed defaults, and project-level instances on project sites inherit from those templates while supporting custom items and suppression. The key structural challenge is the normalized junction entity `responsibility_assignment` (item × role × value), which carries a composite key `(item_instance_id, role_party_id, value_code)`.

#### Shared reference assets (hub site)

| Entity | Data Class | Storage Target | Adapter Path | Identity Key | Write Safety Class | Read Pattern | Cacheable | Mutability | Conflict Handling | Lifecycle Owner | Phase |
|--------|-----------|----------------|--------------|-------------|-------------------|-------------|-----------|-----------|------------------|----------------|-------|
| `responsibility_matrix_family` | reference | SharePoint List (`Shared_ResponsibilityTemplates`, hub site) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `family_id` (surrogate); `family_code` unique (pm, field, owner_contract) | Class C | list-all, get-by-code | Yes (60 min) | Immutable once published; new families require governance approval | No conflict; enumeration-style reference data | Operations leadership | 1 |
| `responsibility_template` | template (shared) | SharePoint List (`Shared_ResponsibilityTemplates`, hub site) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `template_id` (surrogate); `(template_id, family_id)` unique pair | Class C | get-by-id, list-by-family | Yes (60 min) | Immutable once published; versioned via `responsibility_template_version`; existing project instances unaffected | No conflict; versioned; projects snapshot template version at instance creation | Operations leadership | 1 |
| `responsibility_template_version` | template (shared) | SharePoint List (`Shared_ResponsibilityTemplates`, hub site) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `version_id` (surrogate); `(template_id, version_number)` unique pair | Class C | get-by-id, list-by-template | Yes (60 min) | Immutable once released; new versions create new records | No conflict; append-only versioning; released versions are frozen | Operations leadership | 1 |
| `responsibility_item` | reference | SharePoint List (`Shared_ResponsibilityTemplates`, hub site) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `item_id` (surrogate); `(version_id, item_id)` scoped to template version | Class C | list-by-version, filter-by-section | Yes (60 min) | Immutable within version; items frozen once version is released | No conflict; items within a version are frozen | Operations leadership | 1 |
| `responsibility_role_party` | reference | SharePoint List (`Shared_ResponsibilityDictionary`, hub site) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `role_party_id` (surrogate); `role_party_code` unique | Class C | list-all, get-by-code | Yes (60 min) | Rarely mutable; new roles added via governance; existing roles not deleted | No conflict; additive-only catalog; deactivation via `is_active` flag | Operations leadership | 1 |
| `assignment_value_type` | reference | SharePoint List (`Shared_ResponsibilityDictionary`, hub site) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `value_code` (natural key: primary, support, review, sign_off) | Class C | list-all | Yes (60 min) | Immutable; fixed vocabulary | No conflict; enumeration-style reference data | Operations leadership | 1 |

#### Project execution records (project site)

| Entity | Data Class | Storage Target | Adapter Path | Identity Key | Write Safety Class | Read Pattern | Cacheable | Mutability | Conflict Handling | Lifecycle Owner | Phase |
|--------|-----------|----------------|--------------|-------------|-------------------|-------------|-----------|-----------|------------------|----------------|-------|
| `project_responsibility_instance` | execution | SharePoint List (`ResponsibilityMatrices`) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `instance_id` (surrogate); `(project_id, family_id, template_version_id)` business context | Class A | get-by-id, list-by-project, filter-by-family | Yes (5 min) | Mutable (status, dates); `template_version_id` snapshot immutable after creation | Last-write-wins with `updated_at` timestamp; template version snapshot frozen at creation | Project team | 1 |
| `project_item_instance` | execution | SharePoint List (`ResponsibilityMatrices`) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `item_instance_id` (surrogate); `(instance_id, item_instance_id)` composite | Class A | list-by-instance, filter-by-section | Yes (5 min) | Mutable (applicable, suppressed); `is_custom` distinguishes template-inherited vs project-added; suppressed items retained for audit | Last-write-wins; `is_custom` flag distinguishes template-inherited vs project-added items | Project team | 1 |
| `responsibility_assignment` | execution (junction) | SharePoint List (`ResponsibilityMatrices`) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `(item_instance_id, role_party_id, value_code)` composite natural key | Class A | list-by-item-instance, list-by-role, pivot-by-instance | Yes (5 min) | Mutable; assignments can be added, changed, or removed per item × role intersection | Last-write-wins per composite key; no blind overwrite — read-then-write for conflict safety | Project team | 1 |

#### Operational state (non-SharePoint)

| Entity | Data Class | Storage Target | Adapter Path | Identity Key | Write Safety Class | Read Pattern | Cacheable | Mutability | Conflict Handling | Lifecycle Owner | Phase |
|--------|-----------|----------------|--------------|-------------|-------------------|-------------|-----------|-----------|------------------|----------------|-------|
| `responsibility_import_batch` | operational | Azure Table Storage | AF v4 → `@azure/data-tables` | `batch_id` (surrogate, unique per import) | Class D | get-by-id, list-by-project | No | Status progresses forward only (pending → parsing → complete/failed); immutable after completion | No conflict; each import creates a new `batch_id` | Import service | 1 |

#### A3 physical compression note

P1-A3 stores the 10 canonical responsibility matrix entities across 2 SharePoint containers: `Shared_ResponsibilityTemplates` (hub site, combines family, template, version, and item records), 1 hub dictionary list (`Shared_ResponsibilityDictionary` for role/party catalog and value types), and `ResponsibilityMatrices` (project site, flattens instance, item instances, and normalized assignments into a single list). Import batches remain in Azure Table Storage. For physical container specifications, see [P1-A3](./P1-A3-SharePoint-Lists-Libraries-Schema-Register.md).

### Subcontractor scorecard domain (P1-A12)

P1-A12 defines 12 canonical entities for the subcontractor scorecard evaluation system. This is a **rubric-driven** domain: shared rubric templates on the hub site define sections, criteria, and scoring rules, while project-level evaluations on project sites capture scores, summaries, recommendations, and approval workflow. Key structural challenges: the junction entity `criterion_score_record` (evaluation × criterion), derived summary records (`section_score_summary`, `overall_score_summary`), and an approval workflow record (`scorecard_approval`) that differs from editable draft evaluation records. Evaluation records transition from mutable (draft) to immutable (approved).

#### Shared rubric structure (hub site)

| Entity | Data Class | Storage Target | Adapter Path | Identity Key | Write Safety Class | Read Pattern | Cacheable | Mutability | Conflict Handling | Lifecycle Owner | Phase |
|--------|-----------|----------------|--------------|-------------|-------------------|-------------|-----------|-----------|------------------|----------------|-------|
| `scorecard_rubric_template` | template (shared) | SharePoint List (`Shared_ScorecardRubrics`, hub site) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `rubric_template_id` (surrogate); one active version per template name | Class C | get-by-id, list-active | Yes (60 min) | Immutable once published; versioned via `scorecard_rubric_version`; existing evaluations unaffected | No conflict; versioned; evaluations snapshot rubric version at creation | Operations leadership | 1 |
| `scorecard_rubric_version` | template (shared) | SharePoint List (`Shared_ScorecardRubrics`, hub site) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `rubric_version_id` (surrogate); `(rubric_template_id, version_number)` unique pair | Class C | get-by-id, list-by-template | Yes (60 min) | Immutable once released; new versions create new records | No conflict; append-only versioning; released versions are frozen | Operations leadership | 1 |
| `scorecard_section_definition` | template (shared) | SharePoint List (`Shared_ScorecardRubrics`, hub site) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `section_def_id` (surrogate); `(rubric_version_id, section_number)` unique pair | Class C | list-by-version | Yes (60 min) | Immutable within version; section structure frozen once version is released | No conflict; section definitions within a version are frozen | Operations leadership | 1 |
| `scorecard_criterion_definition` | template (shared) | SharePoint List (`Shared_ScorecardRubrics`, hub site) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `criterion_def_id` (surrogate); `(section_def_id, criterion_number)` unique pair | Class C | list-by-section | Yes (60 min) | Immutable within version; criteria frozen once version is released; includes `weight` and `max_score` | No conflict; criteria within a version are frozen | Operations leadership | 1 |

#### Project evaluation records (project site)

| Entity | Data Class | Storage Target | Adapter Path | Identity Key | Write Safety Class | Read Pattern | Cacheable | Mutability | Conflict Handling | Lifecycle Owner | Phase |
|--------|-----------|----------------|--------------|-------------|-------------------|-------------|-----------|-----------|------------------|----------------|-------|
| `scorecard_evaluation` | execution | SharePoint List (`SubcontractorScorecards`) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `evaluation_id` (surrogate); `(project_id, subcontractor_id, evaluation_period)` business context | Class A | get-by-id, list-by-project, filter-by-subcontractor | Yes (5 min) | Mutable while `status = draft`; immutable once `status = approved`; `rubric_version_id` snapshot immutable after creation | Last-write-wins while draft; no writes accepted after approval | Project team | 1 |
| `criterion_score_record` | execution (junction) | SharePoint List (`ScorecardCriterionScores`) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `(evaluation_id, criterion_def_id)` composite natural key | Class A | list-by-evaluation, pivot-by-section | Yes (5 min) | Mutable while parent evaluation is draft; immutable after approval; includes `score_value`, `score_comment` | Last-write-wins while draft; no writes accepted after parent approval | Project team | 1 |
| `section_score_summary` | derived | SharePoint List (`SubcontractorScorecards`) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `(evaluation_id, section_def_id)` composite natural key | Class A | list-by-evaluation | Yes (5 min) | Recomputed on criterion score change while draft; frozen after approval; includes `weighted_score`, `max_possible`, `percentage` | Derived from `criterion_score_record`; recomputed, not manually edited | System (computed) | 1 |
| `overall_score_summary` | derived | SharePoint List (`SubcontractorScorecards`) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `evaluation_id` (1:1 with evaluation) | Class A | get-by-evaluation | Yes (5 min) | Recomputed on section summary change while draft; frozen after approval; includes `total_weighted_score`, `total_max_possible`, `overall_percentage`, `grade` | Derived from `section_score_summary`; recomputed, not manually edited | System (computed) | 1 |
| `scorecard_recommendation` | execution | SharePoint List (`SubcontractorScorecards`) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `recommendation_id` (surrogate); `(evaluation_id, recommendation_id)` composite | Class A | list-by-evaluation | Yes (5 min) | Mutable while parent evaluation is draft; immutable after approval; includes `narrative`, `rebid_recommendation` | Last-write-wins while draft; no writes accepted after parent approval | Project team | 1 |
| `scorecard_approval` | workflow | SharePoint List (`SubcontractorScorecards`) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `approval_id` (surrogate); `(evaluation_id, approver_role)` unique pair | Class A | list-by-evaluation | No | Status progresses forward only (pending → approved/rejected); differs from editable draft records; `approved_at` and `approver_upn` immutable once set | No conflict; each approver role has one approval record per evaluation; status is forward-only | Approval workflow | 1 |

#### Operational state (non-SharePoint)

| Entity | Data Class | Storage Target | Adapter Path | Identity Key | Write Safety Class | Read Pattern | Cacheable | Mutability | Conflict Handling | Lifecycle Owner | Phase |
|--------|-----------|----------------|--------------|-------------|-------------------|-------------|-----------|-----------|------------------|----------------|-------|
| `scorecard_import_batch` | operational | Azure Table Storage | AF v4 → `@azure/data-tables` | `batch_id` (surrogate, unique per import) | Class D | get-by-id, list-by-project | No | Status progresses forward only (pending → parsing → complete/failed); immutable after completion | No conflict; each import creates a new `batch_id` | Import service | 1 |
| `scorecard_import_finding` | operational | Azure Table Storage (`partition: scorecard-findings-{batchId}`) | AF v4 → `@azure/data-tables` | `finding_id` surrogate; `(batch_id, evaluation_id, severity, category)` implied | Class D | list-by-batch | No | Append-only; immutable once logged | No conflict; new imports create new findings per batch | Import service | 1 |

#### A3 physical compression note

P1-A3 stores the 12 canonical scorecard entities across 3 SharePoint containers: `Shared_ScorecardRubrics` (hub site, combines rubric template, version, section definitions, and criterion definitions), `SubcontractorScorecards` (project site, holds evaluation root, section/overall summaries, recommendations, and approval records), and `ScorecardCriterionScores` (project site, child list for normalized criterion-level scoring detail with FK lookups to `SubcontractorScorecards` and `Shared_ScorecardRubrics`). Import batches and findings remain in Azure Table Storage. The `SubcontractorScorecards` list uses evaluation `status` (draft/approved) to enforce the mutable→immutable lifecycle transition. For physical container specifications, see [P1-A3](./P1-A3-SharePoint-Lists-Libraries-Schema-Register.md).

### Lessons learned domain (P1-A13)

P1-A13 defines 8 canonical entities for the project lessons learned system. This is a **dictionary-driven** domain: shared category and impact magnitude dictionaries on the hub site provide governed classification vocabularies, while project-level report and child lesson records on project sites capture execution data. Key structural features: keyword and linked-reference are modeled as first-class child entities (not embedded fields), dictionaries are hub-site shared reference data consumed via FK, and raw preservation fields coexist with canonical FK references to ensure source fidelity through the import pipeline.

#### Shared dictionaries (hub site)

| Entity | Data Class | Storage Target | Adapter Path | Identity Key | Write Safety Class | Read Pattern | Cacheable | Mutability | Conflict Handling | Lifecycle Owner | Phase |
|--------|-----------|----------------|--------------|-------------|-------------------|-------------|-----------|-----------|------------------|----------------|-------|
| `lesson_category_dictionary` | reference (shared) | SharePoint List (`LessonCategories`, hub site) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `category_key` (natural key; e.g., `SAFETY`, `SCHEDULE`) | Class C | list-all, get-by-key | Yes (60 min) | Immutable per governance cycle; new categories additive only; no deletion or rename of existing keys | No conflict; enumeration-style reference data; governed by operations leadership | Operations leadership | 1 |
| `lesson_impact_magnitude_dictionary` | reference (shared) | SharePoint List (`LessonImpactMagnitudes`, hub site) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `magnitude_key` (natural key; e.g., `MINOR`, `MODERATE`, `SIGNIFICANT`, `CRITICAL`) | Class C | list-all, get-by-key | Yes (60 min) | Immutable per governance cycle; new magnitudes additive only; no deletion or rename of existing keys | No conflict; enumeration-style reference data; governed by operations leadership | Operations leadership | 1 |

#### Project report and child records (project site)

| Entity | Data Class | Storage Target | Adapter Path | Identity Key | Write Safety Class | Read Pattern | Cacheable | Mutability | Conflict Handling | Lifecycle Owner | Phase |
|--------|-----------|----------------|--------------|-------------|-------------------|-------------|-----------|-----------|------------------|----------------|-------|
| `lessons_report_instance` | execution | SharePoint List (`LessonsReports`) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `report_id` (surrogate); `project_id` FK (one report per project) | Class A | get-by-id, get-by-project | Yes (5 min) | Mutable (status, dates, classification metadata); project snapshots (`project_name_snapshot`, `project_number_snapshot`, etc.) immutable after creation; `batch_id` FK links to import provenance | Last-write-wins with `updated_at` timestamp; creation-time snapshots not overwritten | Project team | 1 |
| `lesson_record` | execution | SharePoint List (`LessonRecords`) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `lesson_id` (surrogate); `(report_id, lesson_id)` composite context | Class A | list-by-report, filter-by-category, filter-by-applicability-score | Yes (5 min) | Fully mutable (structured narrative fields, classification, applicability); raw preservation fields (`category_raw`, `impact_magnitude_raw`, `phase_encountered_raw`, `keywords_raw`, `supporting_reference_text`) never overwritten; `category_key` and `impact_magnitude_key` FKs to hub dictionaries | Last-write-wins; raw fields are source-of-truth for provenance; canonical FK fields may be corrected without altering raw | Project team | 1 |
| `lesson_keyword` | execution (child) | SharePoint List (`LessonRecords`, child records) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `keyword_id` (surrogate); `(lesson_id, keyword_id)` composite | Class A | list-by-lesson | No | Append-only in practice; new keywords added on re-parse; `keyword_value` (normalized: lowercase, trimmed) + `raw_keyword_value` (source text); parsed from parent `keywords_raw` field | No conflict; additive only; re-parse from `keywords_raw` regenerates normalized set | Import service (parser) | 1 |
| `lesson_linked_reference` | execution (child) | SharePoint List (`LessonRecords`, child records) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `reference_id` (surrogate); `(lesson_id, reference_id)` composite | Class A | list-by-lesson | No | Append-only in practice; new references added when resolvable from `supporting_reference_text`; `reference_type` enum (rfi, change_order, document, photo, schedule_snapshot, report, other); raw text always preserved on parent record | No conflict; additive only; structured links supplement but never replace raw `supporting_reference_text` on parent | Import service (parser) + manual curation | 1 |

#### Operational state (non-SharePoint)

| Entity | Data Class | Storage Target | Adapter Path | Identity Key | Write Safety Class | Read Pattern | Cacheable | Mutability | Conflict Handling | Lifecycle Owner | Phase |
|--------|-----------|----------------|--------------|-------------|-------------------|-------------|-----------|-----------|------------------|----------------|-------|
| `lessons_import_batch` | operational | Azure Table Storage | AF v4 → `@azure/data-tables` | `batch_id` (surrogate, unique per import) | Class D | get-by-id, list-by-project | No | Status progresses forward only (pending → parsing → complete/failed); immutable after completion | No conflict; each import creates a new `batch_id`; `lessons_report_instance.batch_id` FK links report to its import batch for provenance | Import service | 1 |
| `lessons_import_finding` | operational | Azure Table Storage (`partition: lessons-findings-{batchId}`) | AF v4 → `@azure/data-tables` | `finding_id` surrogate; `(batch_id, severity, category)` implied | Class D | list-by-batch | No | Append-only; immutable once logged; severity (error/warning/info); category (parse_error/validation_failure/taxonomy_mismatch) | No conflict; new imports create new findings per batch | Import service | 1 |

#### A3 physical compression note

P1-A3 stores the 8 canonical lessons learned entities across 2 SharePoint project-site lists (`LessonsReports` for report instances, `LessonRecords` for lesson records with keyword and linked-reference child records), 2 hub-site dictionary lists (`LessonCategories`, `LessonImpactMagnitudes`), and Azure Table Storage for import batches and findings. Keywords and linked references are compressed into the `LessonRecords` container as child records rather than separate lists; `keywords_raw` and `supporting_reference_text` fields on `lesson_record` preserve source fidelity alongside the normalized child entities. For physical container specifications, see [P1-A3](./P1-A3-SharePoint-Lists-Libraries-Schema-Register.md).

### Reference data domain (P1-A5)

P1-A5 defines 15 canonical entities across three dictionary families: **Cost Code** (4 entities), **CSI Code** (4 entities), and **Simple Reference Dictionaries** (7 entities). All canonical dictionary records are shared hub-site reference data (Class C). Import batch entities track provenance in Azure Table Storage (Class D). Two external mapping entities are deferred to Phase 4+.

#### Shared canonical dictionaries (hub site)

| Entity | Data Class | Storage Target | Adapter Path | Identity Key | Write Safety Class | Read Pattern | Cacheable | Mutability | Conflict Handling | Lifecycle Owner | Phase |
|--------|-----------|----------------|--------------|-------------|-------------------|-------------|-----------|-----------|------------------|----------------|-------|
| `cost_code` | reference (shared) | SharePoint List (hub site, shared) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `code_id` (surrogate); `csi_code` natural key (unique) | Class C | list-all, filter-by-stage, filter-by-division, get-by-code | Yes (60 min) | Governed; new codes added via import batch; existing codes soft-deprecated, never hard-deleted | No conflict; governed reference data; import batches are additive | Platform Architecture | 1 |
| `cost_code_stage` | reference (shared) | SharePoint List (hub site, shared) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `stage_id` (surrogate); `stage_name` natural key (unique) | Class C | list-all, get-by-id | Yes (60 min) | Governed; new stages additive only; no deletion of existing stages | No conflict; enumeration-style reference data | Platform Architecture | 1 |
| `csi_code` | reference (shared) | SharePoint List (hub site, shared) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `code_id` (surrogate); `csi_code` natural key (unique) | Class C | list-all, filter-by-division, filter-by-hierarchy-level, get-by-code | Yes (60 min) | Governed; new codes added via import batch; existing codes soft-deprecated, never hard-deleted | No conflict; governed reference data; import batches are additive | Platform Architecture | 1 |
| `csi_code_description_variant` | reference (shared, child) | SharePoint List (hub site, shared) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `variant_id` (surrogate); FK `code_id` | Class C | list-by-code | Yes (60 min) | Governed; variants added during import; existing variants soft-deprecated only | No conflict; child of governed `csi_code` | Platform Architecture | 1 |
| `project_type_dictionary` | reference (shared) | SharePoint List (`Shared_ProjectTypes`, hub site) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `{dict}_id` (surrogate); `typeId` natural key (unique) | Class C | list-all, get-by-id | Yes (60 min) | Governed; new values additive; no deletion of existing keys | No conflict; enumeration-style reference data | Operations leadership | 1 |
| `project_stage_dictionary` | reference (shared) | SharePoint List (`Shared_ProjectStages`, hub site) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `{dict}_id` (surrogate); `stageId` natural key (unique) | Class C | list-all, get-by-id | Yes (60 min) | Governed; new values additive; no deletion of existing keys | No conflict; enumeration-style reference data | Operations leadership | 1 |
| `project_region_dictionary` | reference (shared) | SharePoint List (`Shared_ProjectRegions`, hub site) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `{dict}_id` (surrogate); `regionId` natural key (unique) | Class C | list-all, get-by-id | Yes (60 min) | Governed; new values additive; no deletion of existing keys | No conflict; enumeration-style reference data | Operations leadership | 1 |
| `state_code_dictionary` | reference (shared) | SharePoint List (`Shared_StateCodes`, hub site) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `{dict}_id` (surrogate); `stateCode` natural key (unique) | Class C | list-all, get-by-code | Yes (60 min) | Governed; standard US state/territory codes; additions rare | No conflict; enumeration-style reference data | Operations leadership | 1 |
| `country_code_dictionary` | reference (shared) | SharePoint List (`Shared_CountryCodes`, hub site) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `{dict}_id` (surrogate); `countryCode` natural key (unique) | Class C | list-all, get-by-code | Yes (60 min) | Governed; ISO 3166-1 alpha-2 codes; additions rare | No conflict; enumeration-style reference data | Operations leadership | 1 |
| `delivery_method_dictionary` | reference (shared) | SharePoint List (`Shared_DeliveryMethods`, hub site) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `{dict}_id` (surrogate); `methodCode` natural key (unique) | Class C | list-all, get-by-code | Yes (60 min) | Governed; new methods additive; no deletion of existing codes | No conflict; enumeration-style reference data | Operations leadership | 1 |
| `sector_dictionary` | reference (shared) | SharePoint List (`Shared_Sectors`, hub site) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `{dict}_id` (surrogate); `sectorCode` natural key (unique) | Class C | list-all, get-by-code | Yes (60 min) | Governed; new sectors additive; no deletion of existing codes | No conflict; enumeration-style reference data | Operations leadership | 1 |

#### Deferred external mapping entities

| Entity | Data Class | Storage Target | Identity Key | Write Safety Class | Phase | Notes |
|--------|-----------|----------------|-------------|-------------------|-------|-------|
| `cost_code_external_mapping` | mapping | SharePoint List (hub site, shared) | `mapping_id` (surrogate) | Class A | 4+ | Maps HB Intel cost codes to Sage/Procore/ERP codes |
| `csi_code_external_mapping` | mapping | SharePoint List (hub site, shared) | `mapping_id` (surrogate) | Class A | 4+ | Maps CSI codes to cost codes, ERP codes, or other classification systems |

#### Operational state (non-SharePoint)

| Entity | Data Class | Storage Target | Adapter Path | Identity Key | Write Safety Class | Read Pattern | Cacheable | Mutability | Conflict Handling | Lifecycle Owner | Phase |
|--------|-----------|----------------|--------------|-------------|-------------------|-------------|-----------|-----------|------------------|----------------|-------|
| `cost_code_import_batch` | operational | Azure Table Storage | AF v4 → `@azure/data-tables` | `batch_id` (surrogate, unique per import) | Class D | get-by-id, list-by-date | No | Status progresses forward only (pending → parsing → complete/failed); immutable after completion | No conflict; each import creates a new `batch_id` | Import service | 1 |
| `csi_code_import_batch` | operational | Azure Table Storage | AF v4 → `@azure/data-tables` | `batch_id` (surrogate, unique per import) | Class D | get-by-id, list-by-date | No | Status progresses forward only (pending → parsing → complete/failed); immutable after completion | No conflict; each import creates a new `batch_id` | Import service | 1 |

#### A3 physical compression note

P1-A3 stores shared reference dictionaries in dedicated hub-site SharePoint lists: one list per dictionary for the 7 simple dictionaries (`Shared_ProjectTypes`, `Shared_ProjectStages`, `Shared_ProjectRegions`, `Shared_StateCodes`, `Shared_CountryCodes`, `Shared_DeliveryMethods`, `Shared_Sectors`), plus hub-site lists for cost code and CSI code canonical records and CSI description variants. Import batch entities reside in Azure Table Storage. For physical container specifications, see [P1-A3](./P1-A3-SharePoint-Lists-Libraries-Schema-Register.md).

### Operational register domain (P1-A7)

P1-A7 defines 4 canonical entities for the project-level operational register — a unified tracking system for issues, actions, risks, constraints, and delays. The delay subtype is the first implemented extension, adding PCCO/schedule linkage and cost-impact fields. Assignee identity follows the frozen Class G (person-attribution) pattern: `assigned_person_key` (UPN when resolved, nullable when unresolved) + `assigned_display` (raw text, always preserved, never a join key).

#### Project execution records (project site)

| Entity | Data Class | Storage Target | Adapter Path | Identity Key | Write Safety Class | Read Pattern | Cacheable | Mutability | Conflict Handling | Lifecycle Owner | Phase |
|--------|-----------|----------------|--------------|-------------|-------------------|-------------|-----------|-----------|------------------|----------------|-------|
| `register_record` | execution | SharePoint List (`OperationalRegister`, project site) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `record_id` (surrogate); `(project_id, reference)` natural key (project-scoped) | Class A | list-by-project, filter-by-category, filter-by-status, filter-by-record-type, get-by-id | Yes (5 min) | Fully mutable while status allows; status transitions forward-only (Identified → In Progress → Pending → Closed); Closed records effectively Class D (reversal requires reason); delay-subtype fields mutable same as base; `assigned_display` always preserved; `assigned_person_key` updated on resolution; `category_raw` and `days_elapsed_source` never overwritten | Last-write-wins with `updated_at` timestamp; raw preservation fields are source-of-truth for provenance | Project team | 1 |
| `register_record_external_mapping` | mapping | SharePoint List (project site) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `mapping_id` (surrogate) | Class A | list-by-record, list-by-target-entity | Yes (5 min) | Mutable; soft-delete via `is_active` flag; no hard deletion; `mapping_basis` documents provenance | Last-write-wins; `mapping_basis` documents provenance | Project team / import service | 1 |

#### Operational state (non-SharePoint)

| Entity | Data Class | Storage Target | Adapter Path | Identity Key | Write Safety Class | Read Pattern | Cacheable | Mutability | Conflict Handling | Lifecycle Owner | Phase |
|--------|-----------|----------------|--------------|-------------|-------------------|-------------|-----------|-----------|------------------|----------------|-------|
| `register_import_batch` | operational | Azure Table Storage | AF v4 → `@azure/data-tables` | `batch_id` (surrogate, unique per import) | Class D | get-by-id, list-by-project | No | Status progresses forward only (pending → parsing → validating → complete/failed); immutable after completion | No conflict; each import creates a new `batch_id` | Import service | 1 |
| `register_import_finding` | operational (audit) | Azure Table Storage (`partition: register-findings-{batchId}`) | AF v4 → `@azure/data-tables` | `finding_id` (surrogate); `(batch_id, finding_id)` composite context | Class D | list-by-batch | No | Append-only; immutable once logged; severity (error/warning/info); category (parse_error/validation_failure/derivation_mismatch/mapping_warning) | No conflict; new imports create new findings per batch | Import service | 1 |

#### A3 physical compression note

P1-A3 stores operational register records in a project-site SharePoint list (`OperationalRegister`) with delay-subtype fields as optional columns. External mappings are stored alongside register data in the same project site. Import batches and findings reside in Azure Table Storage. For physical container specifications, see [P1-A3](./P1-A3-SharePoint-Lists-Libraries-Schema-Register.md).

### Permits & inspections domain (P1-A9)

P1-A9 defines 7 canonical entities for the permits & inspections domain — a parent-child hierarchy tracking permit lifecycle (application → approval → renewal → expiration), scheduled inspections with compliance scoring, and structured issue resolution. Contact identity uses frozen Class G/H patterns: `inspector_contact_key` (Class G person-attribution, UPN when resolved) and `authority_contact_key` (Class H vendor/party, nullable when unresolved); snapshot fields are always preserved and never used as join keys.

#### Project execution records (project site)

| Entity | Data Class | Storage Target | Adapter Path | Identity Key | Write Safety Class | Read Pattern | Cacheable | Mutability | Conflict Handling | Lifecycle Owner | Phase |
|--------|-----------|----------------|--------------|-------------|-------------------|-------------|-----------|-----------|------------------|----------------|-------|
| `permit_record` | execution | SharePoint List (`Permits`, project site) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `record_id` (surrogate); `(project_id, permit_number)` natural key (project-scoped) | Class A | list-by-project, filter-by-type, filter-by-status, filter-by-priority, get-by-id | Yes (5 min) | Fully mutable; status transitions (pending → approved → renewed → expired / rejected); `conditions_raw` and `tags_raw` preserved for source fidelity; `authority_contact_key` updated on resolution; contact snapshot fields never overwritten by resolution | Last-write-wins with `updated_at` timestamp; raw preservation fields are source-of-truth for provenance | Project team | 1 |
| `permit_condition` | execution (child) | SharePoint List (`Permits`, project site, child records) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `condition_id` (surrogate); `(permit_id, condition_id)` composite context | Class A | list-by-permit | No | Mutable; `condition_status` nullable until workflow tracking enabled (Phase 2) | No conflict; additive from `conditions_raw`; re-parse regenerates set | Import service (parser) | 1 |
| `permit_tag` | execution (child) | SharePoint List (`Permits`, project site, child records) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `tag_id` (surrogate); `(permit_id, tag_id)` composite context | Class A | list-by-permit | No | Append-only in practice; `tag_value` normalized (lowercase, trimmed); `raw_tag_value` preserved; deduplicated within permit | No conflict; additive from `tags_raw` | Import service (parser) | 1 |
| `permit_inspection` | execution (child) | SharePoint List (`PermitInspections`, project site) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `inspection_id` (surrogate); FK `permit_id` | Class A | list-by-permit, filter-by-result, filter-by-type | Yes (5 min) | Fully mutable; `result` tracks inspection outcome (passed/conditional/failed/pending); `inspector_display` always preserved; `inspector_contact_key` updated on resolution; `issues_raw` preserved for source fidelity | Last-write-wins with `updated_at` timestamp | Project team | 1 |
| `permit_inspection_issue` | execution (child) | SharePoint List (`PermitInspections`, project site, child records) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `issue_id` (surrogate); FK `inspection_id` | Class A | list-by-inspection | No | Mutable; `is_resolved` + `resolution_notes` track resolution; `source_issue_id` preserved | Last-write-wins | Project team | 1 |

#### Operational state (non-SharePoint)

| Entity | Data Class | Storage Target | Adapter Path | Identity Key | Write Safety Class | Read Pattern | Cacheable | Mutability | Conflict Handling | Lifecycle Owner | Phase |
|--------|-----------|----------------|--------------|-------------|-------------------|-------------|-----------|-----------|------------------|----------------|-------|
| `permit_import_batch` | operational | Azure Table Storage | AF v4 → `@azure/data-tables` | `batch_id` (surrogate, unique per import) | Class D | get-by-id, list-by-project | No | Status progresses forward only (pending → parsing → complete/failed); immutable after completion | No conflict; each import creates a new `batch_id` | Import service | 1 |
| `permit_import_finding` | operational (audit) | Azure Table Storage (`partition: permit-findings-{batchId}`) | AF v4 → `@azure/data-tables` | `finding_id` (surrogate); `(batch_id, finding_id)` composite context | Class D | list-by-batch | No | Append-only; immutable once logged; severity (error/warning/info); category (parse_error/validation_failure/mapping_warning); `entity_type` classifies finding scope (permit/inspection/issue/condition/tag) | No conflict; new imports create new findings per batch | Import service | 1 |

#### A3 physical compression note

P1-A3 stores permit data across 2 project-site SharePoint lists: `Permits` for permit records with condition and tag child records, and `PermitInspections` for inspection records with issue child records. Import batches and findings reside in Azure Table Storage. For physical container specifications, see [P1-A3](./P1-A3-SharePoint-Lists-Libraries-Schema-Register.md).

### Leads domain (P1-A14)

P1-A14 defines 5 canonical entities for the leads and pipeline domain — two entity families serving business development: (1) individual market leads sourced from procurement portals, data services, and market intelligence, and (2) division-level pipeline health snapshots with aggregate stage/outcome data. Person attribution for matched BD representative follows the frozen Class G pattern. Pipeline snapshot nested structures (stages, wins, losses) are stored as flattened JSON — analytics summary data, not individually managed records.

#### Market lead records (Sales/BD site)

| Entity | Data Class | Storage Target | Adapter Path | Identity Key | Write Safety Class | Read Pattern | Cacheable | Mutability | Conflict Handling | Lifecycle Owner | Phase |
|--------|-----------|----------------|--------------|-------------|-------------------|-------------|-----------|-----------|------------------|----------------|-------|
| `market_lead` | execution | SharePoint List (`MarketLeads`, Sales/BD site) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `lead_id` (surrogate) | Class A | list-all, filter-by-sector, filter-by-region, filter-by-source, get-by-id | Yes (5 min) | Fully mutable; `matched_rep_display` always preserved; `matched_rep_key` updated on resolution; `tags_raw` never overwritten | Last-write-wins with `updated_at` timestamp; raw preservation fields are source-of-truth for provenance | BD team | 1 |
| `market_lead_tag` | execution (child) | SharePoint List (`MarketLeads`, Sales/BD site, child records) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `tag_id` (surrogate); `(lead_id, tag_id)` composite context | Class A | list-by-lead | No | Append-only in practice; `tag_value` normalized (lowercase, trimmed); `raw_tag_value` preserved; deduplicated within lead | No conflict; additive from `tags_raw` | Import service (parser) | 1 |

#### Pipeline snapshot records (Sales/BD site)

| Entity | Data Class | Storage Target | Adapter Path | Identity Key | Write Safety Class | Read Pattern | Cacheable | Mutability | Conflict Handling | Lifecycle Owner | Phase |
|--------|-----------|----------------|--------------|-------------|-------------------|-------------|-----------|-----------|------------------|----------------|-------|
| `pipeline_snapshot` | execution (analytics snapshot) | SharePoint List (`PipelineSnapshots`, Sales/BD site) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `snapshot_id` (surrogate); `(division, snapshot_date)` natural key | Class A | list-by-division, filter-by-date-range, get-by-id | Yes (15 min) | Immutable once imported; newer snapshots supersede for current-state views; `stages_json`, `recent_wins_json`, `recent_losses_json` stored as JSON text | No conflict; each import creates new snapshot or supersedes same `(division, snapshot_date)` | BD team / import service | 1 |

#### Operational state (non-SharePoint)

| Entity | Data Class | Storage Target | Adapter Path | Identity Key | Write Safety Class | Read Pattern | Cacheable | Mutability | Conflict Handling | Lifecycle Owner | Phase |
|--------|-----------|----------------|--------------|-------------|-------------------|-------------|-----------|-----------|------------------|----------------|-------|
| `lead_import_batch` | operational | Azure Table Storage | AF v4 → `@azure/data-tables` | `batch_id` (surrogate, unique per import) | Class D | get-by-id, list-by-source-type | No | Status progresses forward only (pending → parsing → complete/failed); immutable after completion | No conflict; each import creates a new `batch_id` | Import service | 1 |
| `lead_import_finding` | operational (audit) | Azure Table Storage (`partition: lead-findings-{batchId}`) | AF v4 → `@azure/data-tables` | `finding_id` (surrogate); `(batch_id, finding_id)` composite context | Class D | list-by-batch | No | Append-only; immutable once logged; severity (error/warning/info); `entity_type` classifies finding scope (market_lead/pipeline_snapshot/tag) | No conflict; new imports create new findings per batch | Import service | 1 |

#### A3 physical compression note

P1-A3 stores lead data across 2 Sales/BD-site SharePoint lists: `MarketLeads` for market lead records with tag child records, and `PipelineSnapshots` for pipeline snapshot records with JSON-embedded aggregate data. Import batches and findings reside in Azure Table Storage. For physical container specifications, see [P1-A3](./P1-A3-SharePoint-Lists-Libraries-Schema-Register.md).

### Prime contracts domain (P1-A15)

P1-A15 defines 3 canonical entities for owner/client-facing prime contracts — the top-level contractual agreements between the general contractor and the project owner. The source data is Procore-originated; canonical identity is a surrogate `contract_id` (not the Procore `project_id`, which is preserved as `source_project_id` for federation). Financial fields include a mix of authoritative values (original amount, approved/pending/draft COs, invoiced, payments) and derived values (revised amount, % paid, remaining balance). Owner/client contact follows frozen Class H (vendor/party) pattern; primary contact follows Class G (person-attribution).

#### Project execution records (project site)

| Entity | Data Class | Storage Target | Adapter Path | Identity Key | Write Safety Class | Read Pattern | Cacheable | Mutability | Conflict Handling | Lifecycle Owner | Phase |
|--------|-----------|----------------|--------------|-------------|-------------------|-------------|-----------|-----------|------------------|----------------|-------|
| `prime_contract` | execution | SharePoint List (`PrimeContracts`, project site) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs | `contract_id` (surrogate); `contract_number` natural key (unique) | Class A | list-by-project, filter-by-status, filter-by-erp-status, get-by-id, get-by-contract-number | Yes (5 min) | Fully mutable; status transitions not enforced as forward-only (imported state may arrive in any order); `owner_client_display` and `primary_contact_display` always preserved; `owner_client_key` and `primary_contact_key` updated on resolution; derived financial fields revalidated on import; `source_project_id` never overwritten | Last-write-wins with `updated_at` timestamp; derivation mismatches logged as import findings | Project team / import service | 1 |

#### Operational state (non-SharePoint)

| Entity | Data Class | Storage Target | Adapter Path | Identity Key | Write Safety Class | Read Pattern | Cacheable | Mutability | Conflict Handling | Lifecycle Owner | Phase |
|--------|-----------|----------------|--------------|-------------|-------------------|-------------|-----------|-----------|------------------|----------------|-------|
| `contract_import_batch` | operational | Azure Table Storage | AF v4 → `@azure/data-tables` | `batch_id` (surrogate, unique per import) | Class D | get-by-id, list-by-project | No | Status progresses forward only (pending → parsing → complete/failed); immutable after completion | No conflict; each import creates a new `batch_id` | Import service | 1 |
| `contract_import_finding` | operational (audit) | Azure Table Storage (`partition: contract-findings-{batchId}`) | AF v4 → `@azure/data-tables` | `finding_id` (surrogate); `(batch_id, finding_id)` composite context | Class D | list-by-batch | No | Append-only; immutable once logged; severity (error/warning/info); category includes `derivation_mismatch` for financial field validation | No conflict; new imports create new findings per batch | Import service | 1 |

#### A3 physical compression note

P1-A3 stores prime contracts in a single project-site SharePoint list (`PrimeContracts`). No paired document library is needed in Phase 1 — the source data contains no attachments. A library may be added in Phase 2 when contract document management is sourced. Import batches and findings reside in Azure Table Storage. For physical container specifications, see [P1-A3](./P1-A3-SharePoint-Lists-Libraries-Schema-Register.md).

### Phase 1 entity-level coverage complete

All Phase 1 domain schemas (A4–A15) now have entity-level SoR coverage in this register. No domains remain pending.

---

## Identity Key Strategy

HB Intel uses a multi-layered identity approach to maintain stability across systems:

### Project Identity
- **Primary:** Project UUID (assigned by provisioning service during site creation)
- **Correlation:** Maps 1:1 to SharePoint Hub site ID and Table Storage partition key
- **Lifetime:** Immutable; created during Phase 1 provisioning, never reassigned or reused
- **Format:** RFC 4122 UUID v4 (stored as string in SharePoint list, Table Storage, and AF state)
- **Example:** `550e8400-e29b-41d4-a716-446655440000`

### Entity Record Identity (Quick Reference)

> For the complete frozen identity strategy, see [Phase 1 Identity Strategy Freeze](#phase-1-identity-strategy-freeze) below. This table provides a quick-reference summary of the six structural patterns; the freeze section defines the 10 identity classes, field naming conventions, resolution rules, and implementation directives that govern their use.

| Pattern | Description | When to Use | Examples |
|---------|-------------|-------------|----------|
| **SharePoint item-backed ID** | SP numeric ID wrapped as `domain-{itemId}` for client stability | Domain-level records stored as SharePoint list items in the original domain register | `sch-act-{itemId}`, `est-{itemId}` |
| **Surrogate canonical ID** | Application-assigned string ID (`{entity}_id`); unique within entity scope | Mutable project execution records; report/instance roots; child records needing stable references | `report_id`, `lesson_id`, `evaluation_id`, `instance_id`, `row_id`, `item_instance_id` |
| **Composite natural key** | Multi-field business key; no single surrogate; uniqueness enforced at tuple level | Records where identity is inherently multi-dimensional (batch + source, version scope) | `(batch_id, source_activity_id)`, `(template_id, version_number)`, `(rubric_version_id, section_number)` |
| **Junction/intersection key** | Composite key on N:M or N-way intersection; all FK fields form the key | Normalized many-to-many or many-to-many-to-many relationships | `(item_instance_id, role_party_id, value_code)`, `(evaluation_id, criterion_def_id)` |
| **Batch/provenance key** | Surrogate `batch_id` unique per import run; scopes all child findings | Import/provenance tracking entities in Azure Table Storage | `schedule_import_batch`, `lessons_import_batch`, `scorecard_import_batch` |
| **Dictionary natural key** | Semantic code string from governed vocabulary; human-readable and stable | Shared reference dictionaries on hub site; enumeration-style data | `category_key`, `magnitude_key`, `value_code`, `family_code`, `role_party_code` |

**Client presentation:** Domain-prefixed wrapping (`domain-{itemId}`) remains the standard for client-facing API responses on SharePoint-backed records. Surrogate and composite keys are returned directly without wrapping. Internal SharePoint numeric item IDs are never exposed to clients.

### User Identity
- **Primary:** Azure Entra ID User Principal Name (UPN; e.g., `alice@contoso.com`)
- **Authority:** Microsoft Graph / Entra ID (read-only)
- **RBAC:** Roles are derived from Entra ID group membership (e.g., "ProjectManagers", "Safety", "Estimating")
- **Audit Trail:** All writes are attributed by UPN; no synthetic user IDs
- **Phase 1 Caching:** UPN + group membership cached in Table Storage or Redis for performance; cache is non-authoritative

### External System Identity (Phase 4+)
- **Procore:** Work order IDs, crew worker IDs, daily reports
- **Sage:** Cost codes, GL accounts, purchase requisition numbers
- **Autodesk:** Revit element IDs, sheet numbers, model revision hashes
- **Strategy:** Maintain a federated identity mapping table in Table Storage (partition key: `federated-identity`, row key: `{externalSystem}:{externalId}:{hbIntelDomainKey}`)

---

## Phase 1 Identity Strategy Freeze

This section freezes the identity rules for all Phase 1 canonical entities and their child records. The identity classes, field naming conventions, resolution rules, and implementation directives defined here are authoritative for P1-B1 and all subsequent adapter, parser, and feature implementation. Downstream work must not invent local identity conventions when the record type falls under one of the frozen classes below.

### Frozen Identity Classes

| Class | Record Type | Identity Rule | Key Pattern | Entity Examples |
|-------|------------|---------------|-------------|-----------------|
| **A. Project/root anchor** | Project identity | Immutable UUID assigned by provisioning service; cross-domain anchor key; never reassigned or reused | `project_id` (RFC 4122 UUID v4) | Project provisioning record |
| **B. SharePoint-backed business records** | Project-level instance/header records persisted in SharePoint lists | SharePoint numeric item ID is internal implementation detail only; expose stabilized HB Intel keys — either domain-prefixed wrapping (`domain-{itemId}`) or surrogate canonical `*_id`; raw SP numeric IDs must never appear in public API contracts, client state, or cross-system references | `domain-{itemId}` or surrogate `*_id` | `schedule_activity`, `kickoff_instance`, `project_lifecycle_checklist`, `checklist_item`, `scorecard_evaluation` |
| **C. Shared template/reference records** | Hub-site templates, template versions, dictionary entries, rubric definitions, role/party catalogs | Stable canonical IDs — surrogate `*_id` for template/version records, dictionary natural `*_key` for governed vocabularies; SP numeric IDs internal only; display text is never identity | Surrogate `*_id` + `(template_id, version_number)` composite; or natural `*_key` | `kickoff_template`, `scorecard_rubric_version`, `lesson_category_dictionary`, `responsibility_role_party`, `assignment_value_type` |
| **D. Child records** | Row-level children of a parent record | Stable surrogate `*_id` with required FK to parent; parent linkage alone is not sufficient identity — each child must have its own stable ID; row order and display name are not identity | Surrogate `*_id`; `(parent_id, child_id)` composite context | `kickoff_row`, `lesson_record`, `lesson_keyword`, `lesson_linked_reference`, `kickoff_evidence_link`, `checklist_evidence_link` |
| **E. Import-batch/provenance records** | Import run tracking entities in Azure Table Storage | System-generated surrogate `batch_id` — opaque string (UUID or equivalent), not derived from source filename; unique per import run; source filename stored as metadata (`source_file_name`) but is not identity; source row numbers are provenance only | `batch_id` (surrogate, system-generated) | `schedule_import_batch`, `budget_import_batch`, `kickoff_import_batch`, `checklist_import_batch`, `responsibility_import_batch`, `scorecard_import_batch`, `lessons_import_batch` |
| **F. Junction/intersection records** | N:M or N-way normalized relationship records | Composite natural key formed by all participating FK fields plus any discriminating value; uniqueness enforced at the tuple level; an optional surrogate `*_id` may be added if the adapter needs a stable single-field reference, but the composite natural key is the canonical identity | Composite `(fk1, fk2[, value_code])` | `responsibility_assignment` `(item_instance_id, role_party_id, value_code)`, `criterion_score_record` `(evaluation_id, criterion_def_id)` |
| **G. Person-attribution fields** | Any field identifying a human actor (creator, uploader, evaluator, approver, responsible party when that party is a person) | UPN is the authoritative identity when the person is an Entra ID-resolved user; display text preserved in `*_display` field but non-authoritative; resolved canonical key stored in `*_key` when a resolution layer exists; `*_key` is nullable if the person cannot be resolved — never invent synthetic person IDs to fill the gap; `created_by`, `uploaded_by`, `approved_by` fields store UPN directly | `*_key` (UPN or resolved canonical key); `*_display` (raw/mirrored text) | `created_by` (UPN), `uploaded_by` (UPN), `evaluator_key`, `approver_key`, `responsible_entity_key`, `project_executive_key` |
| **H. Vendor/subcontractor/party identity** | External party references — subcontractors, vendors, responsible parties that are not individual persons | Canonical `*_key` when resolved via a party registry, vendor catalog, or `responsibility_role_party` lookup; raw `*_display` text always preserved regardless of resolution status; external source ID preserved when available via `source_*` field; display text is never the durable join key; if unresolved, `*_key` is nullable — do not use display label as a substitute for a missing key | `*_key` (canonical); `*_display` (raw text); `source_*` (external) | `subcontractor_key`, `responsible_party_key`, `role_party_code` |
| **I. External mapping/federated identity records** | Cross-system source-object references and mapping rows | External IDs preserved as `source_*` fields; internal HB Intel linkage uses a canonical mapping record with its own surrogate `mapping_id`; the external key is authoritative for the external system but is not HB Intel's primary internal identifier unless explicitly designated in the entity's A2 register row | `mapping_id` (surrogate); `source_*` (external key); natural key `(line_id, target_entity_type, target_entity_id)` | `budget_line_external_mapping`, federated identity table (Phase 4+) |
| **J. Findings/audit/provenance rows** | Validation findings, audit log entries, parser diagnostics | Append-safe surrogate `finding_id` or deterministic `(batch_id, sequence)` composite; batch-scoped; these are not business-record IDs and must be clearly distinguished from the authoritative business objects they describe; never reuse a finding ID across batches | `finding_id` (surrogate) or `(batch_id, sequence)` | `import_finding`, `budget_import_finding`, `scorecard_import_finding`, `lessons_import_finding`, audit log entries |

### Implementation Directive: Do Not Invent IDs Locally

If a record type falls under identity classes A–J above, downstream adapters, parsers, and feature modules **must** use the frozen identity pattern. The following rules apply:

1. **No local ID invention.** Adapters must not create local ID formats, naming conventions, or key-generation strategies that diverge from the class rules above.
2. **New entity types require A2 amendment.** If a new canonical entity type is introduced in a later phase or wave, its identity class must be added to this table before implementation bakes in a local convention.
3. **Surrogates are system-generated.** Surrogate `*_id` and `batch_id` values are generated by the owning service (import service, provisioning service, adapter layer) — not by client code, UI, or external callers.
4. **Source-system IDs are preserved, not promoted.** When an imported record carries a source-system ID (e.g., Procore budget code, P6 activity ID), the source ID is preserved in a `source_*` field but does not replace the canonical HB Intel identity unless the A2 register row explicitly designates it as the primary key.
5. **Display text is never a key.** Human-readable labels, display names, and formatted descriptions may be stored for presentation but must never be used as join keys, FK targets, or uniqueness constraints.

### Field Naming Conventions (Frozen)

Identity-related field names across all Phase 1 canonical schemas must follow these suffix conventions:

| Suffix / Prefix | Meaning | Authoritative? | Examples |
|-----------------|---------|----------------|----------|
| `*_id` | Canonical record identifier (surrogate or natural key) | Yes | `report_id`, `lesson_id`, `evaluation_id`, `template_id` |
| `project_id` | Immutable HB Intel project UUID | Yes (cross-domain anchor) | Always UUID v4 |
| `*_key` | Stable resolved canonical identity for a person, vendor, party, or reference entity | Yes (when populated) | `evaluator_key`, `subcontractor_key`, `responsible_party_key`, `category_key` |
| `*_display` | Raw or mirrored human-readable label; preserved for presentation and provenance | No — never a join key | `evaluator_display`, `subcontractor_display_name`, `responsible_party_display` |
| `source_*` | Preserved source-system identifier or raw source text from an external system | Authoritative for the source system only | `source_activity_id`, `source_file_name`, `source_project_id` |
| `batch_id` | Canonical import batch identity; always surrogate, system-generated | Yes (within import scope) | All `*_import_batch` entities |
| `external_*` / `source_system_*` | External source identity fields used in federated mapping | Authoritative for the external system only | `external_id`, `source_system_code` |
| `created_by` / `uploaded_by` / `approved_by` | Authoritative person attribution — UPN unless explicitly resolved through a canonical person-key layer | Yes (UPN) | Always store as UPN string |

**Invariants:**
- Display text (`*_display`) is never the durable join key for cross-record or cross-domain references.
- Source row numbers from imported files are provenance metadata only — never entity identity.
- Source filenames are metadata (`source_file_name`) — never record identity or batch identity.
- SharePoint internal numeric item IDs are never part of the public API contract.

### Person and Vendor/Party Resolution Rules (Frozen)

#### Person/user identity

1. **UPN is authoritative** when the person is an Entra ID-resolved user. All `created_by`, `uploaded_by`, and `approved_by` fields store UPN directly.
2. **Display text is preserved but non-authoritative.** When a person field has both `*_key` and `*_display`, the `*_display` field preserves the raw or mirrored human-readable name. It may be used for presentation but must not be used as a join key.
3. **Key is nullable if unresolved.** When a person cannot be resolved to an Entra ID user (e.g., imported from a source workbook with only a display name), the `*_key` field is left null and the `*_display` field carries the raw text. Do not invent synthetic person IDs to fill the gap.
4. **No synthetic user IDs.** HB Intel does not generate synthetic person identifiers. Person identity flows from Entra ID (UPN) or remains unresolved (null key + preserved display).

#### Vendor/subcontractor/party identity

1. **Canonical `*_key` when resolved.** When a vendor, subcontractor, or external party can be resolved to a canonical party registry entry (e.g., `responsibility_role_party.role_party_code`, a future vendor registry), store the canonical key in the `*_key` field.
2. **Raw `*_display` always preserved.** The source text for the party name is always stored in a `*_display` field regardless of resolution status.
3. **External source ID preserved when available.** If the party has an identifier in an external system (e.g., Procore vendor ID), store it in a `source_*` field.
4. **Display label is never the durable join key.** Cross-record and cross-project references to vendors/parties must use the canonical `*_key`, not the display text.
5. **Key is nullable if unresolved.** When a party cannot be resolved (e.g., imported name with no registry match), the `*_key` is left null. Resolution may occur later via manual curation or automated matching.

#### Cross-system references

1. **Mapping records or federated identity logic required.** Cross-system joins must use explicit mapping records (e.g., `budget_line_external_mapping`) or the federated identity table — never free-form text joins.
2. **External keys are preserved, not promoted.** The external system's key is stored as `source_*` metadata but does not become HB Intel's internal primary key unless the entity's A2 register row explicitly designates it.

### Import Identity Rules (Frozen)

1. **Every import batch gets a system-generated surrogate `batch_id`.** The import service generates a unique, opaque string (UUID or equivalent) for each import run. This is the canonical batch identity.
2. **Source filename is metadata, not identity.** The uploaded file's name is stored in `source_file_name` for provenance but is never used as `batch_id` or any part of record identity.
3. **Source row numbers are provenance only.** Row/line numbers from imported spreadsheets or files may be stored for diagnostic traceability but are never entity identity.
4. **Natural keys within imported data must state their scope.** When an imported record carries a natural key from the source system (e.g., `source_activity_id`, `budget_code`), the A2 entity-level register row must state whether that key is:
   - Globally unique (rare; only if the source system guarantees global uniqueness)
   - Unique within project (common; scoped to `project_id`)
   - Unique within batch (common for import-driven data; scoped to `batch_id`)
5. **Findings and provenance rows are batch-scoped and append-only.** Each finding is scoped to its parent `batch_id` and must have an append-safe identity (surrogate `finding_id` or `(batch_id, sequence)` composite). Findings from different batches must never collide.
6. **Imported business rows may use surrogate canonical IDs even when a natural key exists.** When both a source natural key and a HB Intel surrogate exist (e.g., `budget_line` with `budget_code` natural key and `line_id` surrogate), the surrogate is the canonical HB Intel identity and the natural key is preserved for source-system correlation.

---

## Write Safety Classes Explained

### Class A: Idempotent
**Definition:** Write operations are stateless; retries are safe because duplicate operations return the existing record.

**Guarantees:**
- Creating a record with the same identity key twice returns the existing record (no duplicate).
- Updating a record idempotently (PUT, not PATCH) replaces the entire item.
- Retries are always safe; no ordering or quantity sensitivity.

**Best for:** Creates, full replacements, stateless updates.

**Entity patterns in Class A:** Mutable project execution records — instances, rows, items, assignments, junction records, evaluations (while draft), recommendations (while draft), lesson records, keyword/reference child records, report instances, mapping records with `is_active` soft-delete.

**AF Pattern:**
```typescript
// Example: Create or return existing lead
const lead = await leadRepo.createOrGet({
  salesName: 'Acme Tower',
  leadId: 'lead-123' // generated client-side or returned from prior attempt
});
// If called twice, both calls return the same record.
```

### Class B: Sequential
**Definition:** Write order and quantity matter; retries must check whether the prior operation succeeded before retrying.

**Guarantees:**
- Adding 5 bid items in order creates them with quantities 1, 2, 3, 4, 5 (not duplicates).
- Updating a PO quantity requires checking the current quantity first (no blind increments).
- Retrying a failed write requires a lookup to confirm the prior attempt failed.

**Best for:** Quantity-sensitive operations, ordered inserts, bulk appends.

**Entity patterns in Class B:** Quantity-sensitive operational records — estimating bid items (quantity fields), buyout purchase order line items (PO quantity, unit pricing).

**AF Pattern:**
```typescript
// Example: Add an estimating item with quantity
const item = await estimatingRepo.add({
  description: 'Concrete pour',
  quantity: 500, // lineal feet
  projectId
});
// Retry: Must check if the item was already added (by looking up by description+projectId)
// before adding again.
```

### Class C: Read-Mostly
**Definition:** Writes are rare or non-existent; reads are optimized; consistency windows are wider.

**Guarantees:**
- User identity reads are cached (eventual consistency, <5 min TTL).
- Role lookups may lag by seconds.
- Shared dictionaries and templates are governed reference data; writes require governance approval.
- Mirrored external data (e.g., Procore budget snapshots) is read-only within HB Intel; newer import batches supersede.

**Best for:** Identity, shared reference data, governed templates, dictionaries, mirrored external snapshots.

**Entity patterns in Class C:** Shared hub-site templates and versions (kickoff, lifecycle checklist, responsibility matrix, scorecard rubric), dictionary entries (lesson categories, impact magnitudes, assignment value types), role/party catalogs, template items/section/criterion definitions, mirrored budget line snapshots, auth identity.

**AF Pattern:**
```typescript
// Example: User identity is cached
const user = await authRepo.getUser('alice@contoso.com');
// May return cached data from prior lookup; consistency window is 5 minutes.
```

### Class D: Audit-Only
**Definition:** Append-only; never updated, overwritten, or deleted. Immutable by design.

**Guarantees:**
- Audit logs are immutable; they record every write with timestamp, UPN, and change delta.
- Compliance records are closed and never modified.
- Provisioning state transitions are recorded as append-only events.

**Best for:** Audit trails, immutable events, forensics.

**Entity patterns in Class D:** Import batches (all domains), import findings (all domains), approval/workflow records (post-approval), schedule baseline records (immutable once set), provisioning state, audit log, compliance records (after closure).

**AF Pattern:**
```typescript
// Example: Append an audit log entry (never update)
await auditRepo.append({
  domain: 'estimating',
  itemId: 'est-123',
  action: 'quantity_updated',
  oldValue: 100,
  newValue: 150,
  upn: 'alice@contoso.com',
  timestamp: new Date()
});
// This entry is immutable; it is never modified or deleted.
```

### Cross-Cutting Write-Safety Patterns

Entity-level governance reveals recurring archetypes that cut across domains. A single domain often contains entities from multiple write-safety classes. The table below defines the standard mutability contract for each archetype; entity-level rows in the register above specify which archetype applies.

| Entity Archetype | Typical Class | Mutability Rule | Identity Pattern |
|-----------------|---------------|-----------------|------------------|
| **Template/version record** | C | Immutable once published; new versions append as separate records; existing project instances unaffected by template updates | Surrogate + `(template_id, version_number)` composite |
| **Imported snapshot record** | C (mirrored) or A | Read-only per batch; newer batch supersedes for current state; all prior batches retained for trend/audit | `(batch_id, source_key)` composite |
| **Approval/signature record** | A → D | Forward-only status (pending → approved/rejected); immutable once terminal status reached; writes rejected after approval | Surrogate; `(parent_id, approver_role)` unique pair |
| **Append-only finding/provenance** | D | Immutable once logged; no update or delete; severity and category classified at write time | Surrogate or `(batch_id, sequence)` |
| **Editable project child record** | A | Fully mutable while parent record allows edits; may freeze when parent transitions to approved/closed | Surrogate; `(parent_id, child_id)` composite |
| **Mapping/reference record** | A | Mutable; soft-delete via `is_active` flag; no hard deletion; `mapping_basis` documents provenance | Surrogate or composite natural key |

**Rule: one class per entity, not per domain.** A domain like scorecard contains Class A entities (evaluations while draft), Class C entities (rubric definitions), and Class D entities (import batches). The domain-level register row indicates the dominant class for the domain as a whole; the entity-level rows specify the precise class for each entity.

---

## Source Conflicts and Tie-Breaking

### Conflict Scenario 1: SharePoint List vs Cache Divergence
**Situation:** A budget item quantity is cached in Redis as 100, but the SharePoint list shows 150.
**Resolution:** SharePoint is authoritative. AF invalidates the cache and reads from SharePoint.
**Policy:** Cache is a performance layer; it is never authoritative.

### Conflict Scenario 2: Provisional vs Final State
**Situation:** Provisioning service marks a project as "ready" in Table Storage, but the SharePoint hub site has not finished provisioning.
**Resolution:** Table Storage (provisioning state) is the AF authority; clients are told "provisioning in progress" until SharePoint hub site is live.
**Policy:** Operational state (Table Storage) drives the UI; document storage (SharePoint) is eventual consistency.

### Conflict Scenario 3: User Identity vs Cached Role
**Situation:** User "alice@contoso.com" was added to the "ProjectManagers" group in Entra ID 2 minutes ago, but the cached role in Table Storage still shows "Member".
**Resolution:** Table Storage cache is non-authoritative. For critical RBAC decisions, AF calls Graph API directly (every write). For read-heavy lookups, eventual consistency is acceptable.
**Policy:** Writes always verify roles against live Graph API. Reads may use cached role (eventual consistency, <5 min).

### Conflict Scenario 4: External System (Phase 4+) vs HB Intel Primary Data
**Situation:** A Procore crew worker ID is synced from Procore, but the "owner" field in HB Intel estimating is different.
**Resolution:** HB Intel SharePoint is authoritative. Procore is a federated source; disagreements are resolved by HB Intel business logic or manual reconciliation.
**Policy:** External systems are inputs; HB Intel domain data is source of truth.

### Conflict Scenario 5: Template Version vs Project Instance
**Situation:** A hub-site template (kickoff, lifecycle checklist, responsibility matrix, scorecard rubric) is updated to a new version after a project instance was already created from the prior version.
**Resolution:** The project instance retains the template version it was created from (`template_version_id` or `template_snapshot_date` is immutable on the instance). The updated template only applies to newly created instances.
**Policy:** Template evolution is append-only versioning; existing project instances are never retroactively changed by template updates.

### Conflict Scenario 6: Draft-to-Approved Lifecycle Guard
**Situation:** A user attempts to edit a scorecard evaluation or approval record that has already transitioned to `approved` status.
**Resolution:** The adapter rejects the write. Once a record reaches a terminal status (approved, rejected, signed, closed), it is immutable. The status transition is forward-only and enforced at the adapter layer.
**Policy:** Immutability after approval is enforced by status guard, not resolved after the fact. The entity effectively transitions from Class A (mutable while draft) to Class D (immutable after approval).

---

## Implementation Notes for Phase 1 Adapters

### Adapter Responsibilities
1. **Read Consistency:** Adapt between HB Intel canonical models and storage schemas. Return the appropriate identity key for the entity's pattern — domain-prefixed IDs for SharePoint item-backed records, surrogate IDs for canonical entities, composite keys for junction/intersection records. Never expose raw SharePoint numeric item IDs to clients.
2. **Write Safety:** Implement retries appropriately per the entity's write-safety class:
   - **Class A (Idempotent):** Implement "get or create" logic; check for existing record before creating.
   - **Class B (Sequential):** Check prior operation success (e.g., via lookup) before retry.
   - **Class C (Read-Mostly):** Cache reads; refresh cache on write.
   - **Class D (Audit-Only):** Append operations are idempotent by definition; timestamp uniqueness is key.
3. **Lifecycle Guards:** Enforce mutability contracts — reject writes to records that have transitioned to immutable status (approved, closed, signed). Check the entity's mutability rule before accepting a write.
4. **Error Handling:** Distinguish between transient (retry) and permanent (fail-fast) errors.
5. **Audit Trail:** Every write (create, update, delete) logs to audit table with UPN, domain, entity, item ID, old/new values.

### Non-SharePoint Operational State

Azure Table Storage is the designated storage platform for operational and provenance entities across all domains. These entities are not user-facing business data; they exist to support import tracking, validation audit, and system state management.

**Conventions:**
- **Partition key:** `{domain}-{entityType}-{scopeId}` (e.g., `sch-findings-{batchId}`, `lessons-findings-{batchId}`, `scorecard-findings-{batchId}`)
- **Write safety:** Always Class D (append-only; immutable after completion)
- **Adapter path:** `AF v4 → @azure/data-tables` (no PnPjs; no SharePoint dependency)
- **Caching:** Not cached; queried on demand for administrative and diagnostic views
- **Conflict handling:** No conflict — each import creates a new `batch_id` partition; findings append within the batch partition
- **Lifecycle:** Import service creates; system retains indefinitely for audit; no user delete

**Entities in this tier across domains:**
- Import batch records (Azure Table Storage default): `kickoff_import_batch`, `checklist_import_batch`, `responsibility_import_batch`, `scorecard_import_batch`, `lessons_import_batch`, `cost_code_import_batch`, `csi_code_import_batch`, `register_import_batch`, `permit_import_batch`, `lead_import_batch`, `contract_import_batch`. Note: `schedule_import_batch` and `budget_import_batch` are stored in dedicated SharePoint Lists per the Import-State Platform Standard (see below); all other domain batch records are in this tier.
- Import finding records: `import_finding` (schedule), `budget_import_finding`, `kickoff_import_finding`, `checklist_import_finding`, `responsibility_import_finding`, `scorecard_import_finding`, `lessons_import_finding`, `register_import_finding`, `permit_import_finding`, `lead_import_finding`, `contract_import_finding`
- External mapping records: `budget_line_external_mapping`
- System state: provisioning state, audit log, project identity mapping

### Import-State Platform Standard (Frozen)

> **Status: Frozen.** This section defines the cross-schema platform standard for import-batch metadata and import findings. Domain-specific batch status workflows and finding category vocabularies remain domain-scoped; the storage model, SoR designation, and structural contract are standardized here.

**`import_batch` — governed two-tier model.**

The default storage for canonical import-batch metadata is Azure Table Storage (Class D, operational). This is the standard for all import-driven domains unless a named exception applies.

A domain may store its `*_import_batch` entity in a dedicated SharePoint List instead of Azure Table Storage ONLY when both conditions are met:
1. End users need to browse, filter, or query import history directly through SharePoint views or the adapter layer.
2. The batch record is a direct parent of SharePoint-resident imported data (i.e., the batch's child records live in a SharePoint List on the same site).

**Phase 1 exceptions:** `schedule_import_batch` (SharePoint List `ScheduleImportBatches`) and `budget_import_batch` (SharePoint List `BudgetImportBatches`). Both meet the two conditions: users need import-history visibility, and the batch is the direct parent of SharePoint-resident activities/budget lines. These are documented in their entity-level register rows and in P1-A3's container appendices.

**All other domains** store their `*_import_batch` in Azure Table Storage. Downstream SharePoint entities reference the batch via the `sourceBatchId` field, which holds the canonical `batch_id` from Azure Table Storage.

**`import_finding` — universal Azure Table Storage.**

All `*_import_finding` entities are stored in Azure Table Storage (Class D, audit-only, append-only). No exceptions. Every import-driven domain MUST define a `{domain}_import_finding` entity with:
- Partition key: `{domain-prefix}-findings-{batchId}`
- Required fields: `finding_id` (surrogate), `batch_id` (FK to parent batch), `severity` (error/warning/info), `category` (domain-specific), `message`
- Append-only semantics: findings are never updated once logged

**`sourceBatchId` cross-reference convention.** All SharePoint-resident canonical entities that originate from an import carry a `sourceBatchId` field (Text) referencing the canonical `batch_id` of their governing import batch — regardless of whether that batch lives in SharePoint or Azure Table Storage. For schedule and budget domains, `batch_id` on child entities serves the same purpose (the batch is in the same SharePoint site). The field name convention (`sourceBatchId` vs `batchId`) may vary by domain but the semantic contract is identical: link to the canonical import batch record.

**Completeness requirement.** Every import-driven domain must define both `*_import_batch` and `*_import_finding` entities in its governing schema artifact. Domains that define batch metadata without a corresponding finding entity must add one; import validation without structured finding records is not acceptable for production import pipelines.

### Person Identity Resolution Platform Standard (Frozen)

> **Status: Frozen.** This section defines the cross-schema platform standard for person identity resolution. The resolution algorithm (how UPN matching works at runtime) remains a P1-B1 implementation detail; the structural contract is standardized here.

**Structural contract.** Every field that identifies a human actor (assignee, evaluator, approver, responsible person, contact, preparer, etc.) follows one of two patterns:

1. **Key + display pair** (`*_key` + `*_display`): The stable join key (`*_key`) stores the person's UPN when resolved via Entra ID. The display mirror (`*_display`) stores the raw source text and is always populated regardless of resolution status. The display field is never the canonical join key. The key field is nullable if the person cannot be resolved — never invent synthetic person IDs to fill the gap.

2. **Direct UPN** (`created_by`, `uploaded_by`, `approved_by`): System-attribution fields where the actor is always the authenticated current user. These store UPN directly with no separate display field, because the identity is known at write time.

**Unresolved-import behavior.** When imported data contains a person name that cannot be resolved to a UPN (e.g., historical records, external participants, name ambiguity), the `*_key` field is null and the `*_display` field preserves the raw source text. The adapter/service layer may backfill the key later when resolution becomes possible, but the display text is never overwritten.

**Resolution ownership.** The adapter/service layer owns person name-to-UPN resolution. Resolution occurs at import time or adapter-read time. Client code, UI layers, and external callers never perform resolution or generate person keys.

**Vendor/party distinction.** Fields identifying external parties (subcontractors, vendors, authority organizations) follow the same structural pattern — `*_key` + `*_display` with nullable key — but use a party registry or vendor catalog key instead of UPN. These are Class H (vendor/party identity), not Class G (person-attribution). The structural contract is the same; the key source differs.

**Completeness requirement.** Every person-attributed field across all Phase 1 schemas must have both a `_key` and `_display` field (or be a direct UPN field). Display-only person fields without corresponding key fields are not compliant with this standard.

**Cross-reference.** This standard consolidates the rules from Class G (person-attribution) in the Identity Strategy section above. The identity class defines the semantic rules; this section defines the cross-schema structural contract. For vendor/party identity (Class H), see the Vendor Identity Resolution Platform Standard below.

### Vendor Identity Resolution Platform Standard (Frozen)

> **Status: Frozen.** This section defines the cross-schema platform standard for vendor, subcontractor, and organization-party identity. The structural contract is standardized here. The canonical vendor registry (the source of resolved vendor keys) is a Phase 2 deliverable; Phase 1 schemas implement the structural contract with nullable keys.

**Structural contract.** Every field that identifies an external organization or company party (subcontractor, vendor, client/owner organization, authority body, responsible party when that party is an organization rather than a person) follows the `*_key` + `*_display` pattern:

- **Stable join key** (`*_key`): The canonical vendor/party identifier when resolved via a vendor registry, party catalog, or equivalent lookup. Nullable if unresolved. Never synthetic — do not invent vendor IDs to fill the gap.
- **Display mirror** (`*_display` or `*_display_name`): The raw source text (company name, subcontractor name, etc.). Always populated regardless of resolution status. Never the canonical join key.

**Distinction from person identity.** Vendor/party identity (Class H) shares the same `*_key` + `*_display` structural pattern as person identity (Class G), but the key source differs. Person keys resolve to UPN via Entra ID. Vendor keys resolve to a canonical party identifier via a vendor registry or party catalog. The structural contract is identical; the resolution mechanism is distinct.

**Unresolved-import behavior.** When imported data contains a company/vendor name that cannot be resolved to a canonical vendor key (the expected Phase 1 state, since no vendor registry exists yet), the `*_key` field is null and the `*_display` field preserves the raw source text. The adapter/service layer may backfill the key when a vendor registry becomes available in Phase 2+.

**Resolution ownership.** The adapter/service layer owns vendor name-to-key resolution. Resolution occurs at import time or adapter-read time when a vendor registry is available. Client code, UI layers, and external callers never perform resolution or generate vendor keys.

**Phase 1 fields governed by this standard:**

| Schema | Entity | Key Field | Display Field | Description |
|--------|--------|-----------|---------------|-------------|
| P1-A12 | `scorecard_evaluation` | `subcontractor_key` | `subcontractor_display_name` | Subcontractor being evaluated |
| P1-A15 | `prime_contract` | `owner_client_key` | `owner_client_display` | Owner/client organization on contract |
| P1-A11 | `project_item_instance` | `responsible_party_key` | `responsible_party_display` | Responsible party (Owner Contract family) |

**Pre-existing fields.** A3's `BuyoutCommitments` container includes `vendorName` as a pre-existing physical column from the buyout domain buildout. This field predates the platform standard and does not have a corresponding `vendor_key` column. During P1-B1 implementation, `vendorName` should be treated as a display field per Class H conventions. Adding a `vendor_key` column is deferred to the buyout adapter implementation.

**What remains open.** The canonical vendor registry — the authoritative source of vendor/party keys — is a Phase 2 deliverable. The structural contract (key + display pairs, nullable keys, adapter-owned resolution) is frozen now. Schemas do not need to wait for the vendor registry to implement the structural pattern; they use nullable keys until the registry is available.

### Proxy Adapter (Phase 1 MVP)
The `@hbc/af-adapter-proxy` is the placeholder adapter that:
- Takes domain repository calls from AF.
- Routes to actual storage (SharePoint, Table Storage, or Graph) based on the entity's storage target.
- Uses PnPjs for SharePoint CRUD (business data and shared reference/template records).
- Uses `@azure/data-tables` for Table Storage (operational state, provenance, findings, mappings).
- Uses `@microsoft/microsoft-graph-client` (via MSAL OBO) for auth.
- Returns canonical domain models to caller with appropriate identity keys.

Stub adapters (Procore, Sage, Autodesk) exist but do not write in Phase 1.

---

## Identity Strategy Validation Checklist

This checklist confirms that the Phase 1 identity strategy freeze is complete and internally consistent. Each item must pass before A2 can be treated as implementation-ready for P1-B1.

- [x] **Every Phase 1 canonical entity family has an approved identity class (A–J).** All 7 expanded domains (A4, A6, A8, A10, A11, A12, A13) have entity-level rows with explicit Identity Key columns that align to the frozen classes.
- [x] **No schema relies on raw SharePoint numeric IDs as the exposed contract.** All SharePoint-backed entities use domain-prefixed wrapping or surrogate canonical IDs for external exposure.
- [x] **Person attribution uses UPN/resolved-key rules consistently.** `created_by` and `uploaded_by` fields across all schemas are UPN. Person `*_key` fields are nullable-if-unresolved with `*_display` always populated.
- [x] **Vendor/party resolution uses key + display semantics consistently.** `subcontractor_key`, `responsible_party_key`, and similar fields use canonical key when resolved, with raw `*_display` always preserved. Display text is never the join key.
- [x] **Import batches use system-generated surrogate `batch_id` consistently.** All 7 domain import batches use opaque surrogate `batch_id`. Source filenames are metadata only.
- [x] **Child records have stable surrogate IDs with required FK to parent.** All child entities (`kickoff_row`, `lesson_record`, `lesson_keyword`, `checklist_item`, etc.) have their own `*_id` with FK to parent.
- [x] **Junction records have explicit composite natural keys.** `responsibility_assignment` and `criterion_score_record` have documented composite keys with uniqueness at the tuple level.
- [x] **Field naming follows frozen suffix conventions.** `*_id`, `*_key`, `*_display`, `source_*`, `batch_id`, `created_by`/`uploaded_by`/`approved_by` suffixes are used consistently.
- [x] **All Phase 1 domains (A4–A15) have identity class assignments.** Entity-level rows cover A4, A5, A6, A7, A8, A10, A11, A12, A13, A14, A15 with frozen identity classes.

---

## Revision History

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 0.1 | 2026-03-16 | Architecture | Initial draft; operationalizes P1-A1 decisions for adapter design |
| 0.2 | 2026-03-17 | Architecture | Add entity-level SoR and adapter behavior register structure; populate schedule domain (P1-A4); stub remaining domains |
| 0.3 | 2026-03-17 | Architecture | Refine schedule entity-level register with A4-aligned data classes, A3 storage targets, conflict handling, and business-vs-operational distinction |
| 0.4 | 2026-03-17 | Architecture | Add entity-level external financial register (P1-A6); distinguish mirrored Procore data from HB Intel-governed mappings and operational state |
| 0.5 | 2026-03-17 | Architecture | Add entity-level kickoff (P1-A8) and lifecycle checklist (P1-A10) registers; distinguish shared template assets from project execution records and operational state |
| 0.6 | 2026-03-17 | Architecture | Add entity-level responsibility matrix (P1-A11) and subcontractor scorecard (P1-A12) registers; distinguish shared reference/rubric (hub, Class C) from project execution/evaluation (project site, Class A) and operational state (Azure Table Storage, Class D); define junction identity for assignment and criterion score intersection records |
| 0.7 | 2026-03-17 | Architecture | Add entity-level lessons learned (P1-A13) register; distinguish shared dictionaries (hub, Class C) from project report/child records (project site, Class A) and operational state (Azure Table Storage, Class D); model keyword and linked-reference as first-class child entities |
| 0.8 | 2026-03-17 | Architecture | Normalize cross-cutting identity, write-safety, and operational-state rules for entity-level governance; replace stale domain-level assumptions with entity-pattern summaries; add cross-cutting archetype table; add non-SharePoint operational state section; add template-version and draft-to-approved conflict scenarios |
| 0.9 | 2026-03-17 | Architecture | Final QA reconciliation: fix A12 container naming to match A3 (SubcontractorScorecards + ScorecardCriterionScores); update document metadata date and status; tighten domain-level summary alignment; confirm entity-level coverage complete for 7 domains with no column gaps |
| 1.0 | 2026-03-17 | Architecture | Phase 1 Identity Strategy Freeze: add 10 frozen identity classes (A–J) covering project anchors, SP-backed records, templates, children, import batches, junctions, person-attribution, vendor/party, external mappings, and findings; freeze field naming conventions and person/vendor resolution rules; add import identity rules; add identity QA validation checklist; align companion schemas (A4–A13) to frozen rules |
| 1.1 | 2026-03-17 | Architecture | Add entity-level reference data domain register (P1-A5): 15 entities across 3 dictionary families (cost code, CSI code, simple reference); 11 shared canonical dictionaries (Class C), 2 import batches (Class D), 2 deferred external mappings (Phase 4+); update non-SharePoint operational state enumeration; update remaining domains to A7/A9 only |
| 1.2 | 2026-03-17 | Architecture | Add entity-level operational register domain (P1-A7): 4 entities — `register_record` (Class A), `register_record_external_mapping` (Class A), `register_import_batch` (Class D), `register_import_finding` (Class D); assignee identity frozen as Class G (UPN when resolved, nullable when unresolved, display always preserved); update non-SharePoint operational state enumeration; update remaining domains to A9 only |
| 1.3 | 2026-03-17 | Architecture | Add entity-level permits & inspections domain (P1-A9): 7 entities — `permit_record` (Class A), `permit_condition` (Class A), `permit_tag` (Class A), `permit_inspection` (Class A), `permit_inspection_issue` (Class A), `permit_import_batch` (Class D), `permit_import_finding` (Class D); contact identity frozen (`authority_contact_key` Class H, `inspector_contact_key` Class G); complete Phase 1 entity-level SoR coverage for all domains (A4–A13); identity validation checklist fully checked |
| 1.4 | 2026-03-17 | Architecture | Add entity-level leads domain (P1-A14): 5 entities — `market_lead` (Class A), `market_lead_tag` (Class A), `pipeline_snapshot` (Class A), `lead_import_batch` (Class D), `lead_import_finding` (Class D); matched rep identity frozen as Class G; pipeline nested structures stored as flattened JSON; extend coverage to A4–A14 |
| 1.5 | 2026-03-17 | Architecture | Add entity-level prime contracts domain (P1-A15): 3 entities — `prime_contract` (Class A), `contract_import_batch` (Class D), `contract_import_finding` (Class D); canonical identity frozen as surrogate `contract_id` with `contract_number` natural key and `source_project_id` for Procore federation; financial field classification (authoritative vs derived); owner/client contact as Class H, primary contact as Class G; extend coverage to A4–A15 |
| 1.6 | 2026-03-17 | Architecture | Reconcile domain summary rows: update leads row to reflect A14 two-list model (`MarketLeads`, `PipelineSnapshots`) with surrogate identity; update contracts row to reflect A15 single-list `PrimeContracts` with surrogate `contract_id` (remove stale paired library + document URL identity) |
| 1.7 | 2026-03-17 | Architecture | Froze Import-State Platform Standard: governed two-tier model for `import_batch` (Azure Table Storage default, SharePoint List exception for schedule/budget with explicit conditions), universal Azure Table Storage rule for `import_finding`, `sourceBatchId` cross-reference convention, completeness requirement (every import-driven domain must define both batch and finding entities). Fixed Non-SharePoint enumeration to exclude SharePoint-resident batch records. Added 3 missing finding entities to enumeration: `kickoff_import_finding`, `checklist_import_finding`, `responsibility_import_finding`. |
| 1.8 | 2026-03-17 | Architecture | Froze Person Identity Resolution Platform Standard: consolidated Class G (person-attribution) structural contract into one cross-schema section — `*_key` + `*_display` pair with nullable key for unresolved imports, direct UPN for system-attribution fields, adapter/service-layer resolution ownership, completeness requirement (every person-attributed field must have both key and display). |
| 1.9 | 2026-03-17 | Architecture | Froze Vendor Identity Resolution Platform Standard: consolidated Class H (vendor/party) structural contract into a dedicated cross-schema section — `*_key` + `*_display` pair with nullable key for unresolved vendor names, adapter/service-layer resolution ownership, vendor registry as Phase 2 deliverable. Enumerated all Phase 1 governed fields (A11 responsible_party, A12 subcontractor, A15 owner_client). Noted buyout vendorName as pre-existing display field. |

