# P1-A2: Source-of-Record Register

**Document ID:** P1-A2
**Phase:** 1 (Foundation)
**Classification:** Internal — Architecture
**Status:** Draft
**Date:** 2026-03-16
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
| **leads** | SharePoint List on Sales/Business Development site | `@hbc/af-adapter-proxy` → AF v4 → PnPjs `list.items.add()` / `list.items.getById().update()` | SharePoint numeric item ID (wrapped as `lead-{itemId}` for stability) | Class A | 1 |
| **project** | SharePoint Hub site + Project Metadata List on hub | `@hbc/af-adapter-proxy` → AF v4 → (1) PnPjs hub site provision + (2) PnPjs list item CRUD | Project UUID (assigned during provisioning; maps to hub site ID) | Class A | 1 |
| **estimating** | SharePoint List on project site (Bid Items) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs `list.items.add()` / `list.items.getById().update()` | Numeric item ID (e.g., `123`; domain-scoped) | Class B | 1 |
| **schedule** | SharePoint List on project site (Milestones/Schedule) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs `list.items.add()` / `list.items.getById().update()` | Numeric item ID (e.g., `456`; domain-scoped) | Class A | 1 |
| **buyout** | SharePoint List on project site (Purchase Orders) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs `list.items.add()` / `list.items.getById().update()` | Numeric item ID (e.g., `789`; domain-scoped) | Class B | 1 |
| **compliance** | SharePoint List + Document Library on project site | `@hbc/af-adapter-proxy` → AF v4 → (1) PnPjs list.items for metadata + (2) PnPjs `web.getFolderByServerRelativePath().files.add()` | Numeric list item ID (metadata); doc URL for content | Class D | 1 |
| **contracts** | SharePoint Document Library + Contract Metadata List on project site | `@hbc/af-adapter-proxy` → AF v4 → (1) PnPjs `web.getFolderByServerRelativePath().files.add()` + (2) PnPjs metadata list item | Contract document URL or UUID; list item ID for metadata | Class A | 1 |
| **risk** | SharePoint List on project site (Risk Register) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs `list.items.add()` / `list.items.getById().update()` | Numeric item ID (e.g., `1001`; domain-scoped) | Class A | 1 |
| **scorecard** | SharePoint List on project site (Bid Scorecards) | `@hbc/af-adapter-proxy` → AF v4 → PnPjs `list.items.add()` / `list.items.getById().update()` | Numeric item ID (e.g., `2001`; domain-scoped); linked to lead and project | Class A | 1 |
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

The domain register above captures one row per business domain. As canonical schemas mature (P1-A4 through P1-A13), each domain decomposes into discrete entities that may differ in storage target, write safety class, adapter pathway, or caching strategy. This section provides entity-level governance so adapter implementers know exactly how each canonical model is stored, read, written, and identified.

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

### Remaining domains

Entity-level rows for the following domains will be added as their schemas reach implementation-ready status:

| Domain | Schema Doc | Entity Count | Status |
|--------|-----------|-------------|--------|
| shared (reference data) | P1-A5 | ~11 | Schema defined; entity register pending |
| risk / compliance (operational register) | P1-A7 | 4 | Schema defined; entity register pending |
| compliance (permits) | P1-A9 | 8 | Schema defined; entity register pending |
| project management (responsibility matrix) | P1-A11 | 11 | Schema defined; entity register pending |
| procurement (subcontractor scorecard) | P1-A12 | 12 | Schema defined; entity register pending |
| project management (lessons learned) | P1-A13 | 8 | Schema defined; entity register pending |

---

## Identity Key Strategy

HB Intel uses a multi-layered identity approach to maintain stability across systems:

### Project Identity
- **Primary:** Project UUID (assigned by provisioning service during site creation)
- **Correlation:** Maps 1:1 to SharePoint Hub site ID and Table Storage partition key
- **Lifetime:** Immutable; created during Phase 1 provisioning, never reassigned or reused
- **Format:** RFC 4122 UUID v4 (stored as string in SharePoint list, Table Storage, and AF state)
- **Example:** `550e8400-e29b-41d4-a716-446655440000`

### Domain Record Identity
- **SharePoint List-Scoped:** Each domain (estimating, schedule, buyout, compliance, contracts, risk, scorecard, pmp) stores records as SharePoint list items.
- **Numeric Item ID:** SharePoint assigns numeric IDs per list (e.g., 1, 2, 3, ...). These are scoped to the list and project site.
- **Stability Wrapping:** To prevent external dependencies on SharePoint internal ID assignment, AF wraps these as domain-prefixed keys:
  - `lead-{itemId}` → Lead from Sales list
  - `est-{itemId}` → Estimating item (bid)
  - `sch-{itemId}` → Schedule milestone
  - `buyout-{itemId}` → Purchase order
  - `comp-{itemId}` → Compliance record
  - `contract-{itemId}` → Contract metadata
  - `risk-{itemId}` → Risk register entry
  - `scorecard-{itemId}` → Scorecard record
  - `pmp-{itemId}` → PMP index entry
- **Client Presentation:** UI and API responses use domain-prefixed keys; internal SharePoint item ID is never exposed to clients.

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

## Write Safety Classes Explained

### Class A: Idempotent
**Definition:** Write operations are stateless; retries are safe because duplicate operations return the existing record.

**Guarantees:**
- Creating the same lead twice returns the same record (no duplicate).
- Creating a project with the same UUID returns the existing project.
- Updating an estimating item idempotently (PUT, not PATCH) replaces the entire item.

**Best for:** Creates, full replacements, stateless updates.

**Domains in Class A:** leads, project, schedule, risk, scorecard, contracts (basic), pmp (basic)

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

**Domains in Class B:** estimating (quantity-sensitive bid items), buyout (PO quantity, line items)

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
- Reference data (enumerations, classifications) is static per project.

**Best for:** Identity, reference data, configuration.

**Domains in Class C:** auth

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

**Domains in Class D:** compliance (after closure), provisioning state, audit log

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

---

## Implementation Notes for Phase 1 Adapters

### Adapter Responsibilities
1. **Read Consistency:** Adapt between HB Intel domain models and SharePoint list schema. Return domain-prefixed IDs, not raw SharePoint item IDs.
2. **Write Safety:** Implement retries appropriately:
   - **Class A (Idempotent):** Implement "get or create" logic; check for existing record before creating.
   - **Class B (Sequential):** Check prior operation success (e.g., via lookup) before retry.
   - **Class C (Read-Mostly):** Cache reads; refresh cache on write.
   - **Class D (Audit-Only):** Append operations are idempotent by definition; timestamp uniqueness is key.
3. **Error Handling:** Distinguish between transient (retry) and permanent (fail-fast) errors.
4. **Audit Trail:** Every write (create, update, delete) logs to audit table with UPN, domain, item ID, old/new values.

### Proxy Adapter (Phase 1 MVP)
The `@hbc/af-adapter-proxy` is the placeholder adapter that:
- Takes domain repository calls from AF.
- Routes to actual storage (SharePoint, Table Storage, or Graph).
- Uses PnPjs for SharePoint CRUD.
- Uses `@azure/data-tables` for Table Storage.
- Uses `@microsoft/microsoft-graph-client` (via MSAL OBO) for auth.
- Returns domain models to caller.

Stub adapters (Procore, Sage, Autodesk) exist but do not write in Phase 1.

---

## Revision History

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 0.1 | 2026-03-16 | Architecture | Initial draft; operationalizes P1-A1 decisions for adapter design |
| 0.2 | 2026-03-17 | Architecture | Add entity-level SoR and adapter behavior register structure; populate schedule domain (P1-A4); stub remaining domains |
| 0.3 | 2026-03-17 | Architecture | Refine schedule entity-level register with A4-aligned data classes, A3 storage targets, conflict handling, and business-vs-operational distinction |
| 0.4 | 2026-03-17 | Architecture | Add entity-level external financial register (P1-A6); distinguish mirrored Procore data from HB Intel-governed mappings and operational state |
| 0.5 | 2026-03-17 | Architecture | Add entity-level kickoff (P1-A8) and lifecycle checklist (P1-A10) registers; distinguish shared template assets from project execution records and operational state |

