# P1-A3: SharePoint Lists & Libraries Schema Register

**Document ID:** P1-A3
**Phase:** 1 (Foundation)
**Classification:** Internal — Engineering
**Status:** Active — Physical Schema Register
**Date:** 2026-03-17
**Read With:** [P1-A1-Data-Ownership-Matrix.md](./P1-A1-Data-Ownership-Matrix.md), [P1-A2-Source-of-Record-Register.md](./P1-A2-Source-of-Record-Register.md), [P1-A4-Schedule-Ingestion-Normalization-Schema.md](./P1-A4-Schedule-Ingestion-Normalization-Schema.md), [P1-A5-Reference-Data-Dictionary-Schema.md](./P1-A5-Reference-Data-Dictionary-Schema.md), [P1-A6-External-Financial-Data-Ingestion-Schema.md](./P1-A6-External-Financial-Data-Ingestion-Schema.md), [P1-A7-Operational-Register-Schema.md](./P1-A7-Operational-Register-Schema.md), [P1-A8-Estimating-Kickoff-Schema.md](./P1-A8-Estimating-Kickoff-Schema.md), [P1-A9-Permits-Inspections-Schema.md](./P1-A9-Permits-Inspections-Schema.md), [P1-A10-Project-Lifecycle-Checklist-Schema.md](./P1-A10-Project-Lifecycle-Checklist-Schema.md), [P1-A11-Responsibility-Matrix-Schema.md](./P1-A11-Responsibility-Matrix-Schema.md), [P1-A12-Subcontractor-Scorecard-Schema.md](./P1-A12-Subcontractor-Scorecard-Schema.md), [P1-A13-Lessons-Learned-Schema.md](./P1-A13-Lessons-Learned-Schema.md), [current-state-map.md](../../blueprint/current-state-map.md)

---

## Purpose

Define the physical SharePoint container definitions — lists, libraries, paired patterns, and hub site structures — that implement the data ownership decisions made in P1-A1 and the source-of-record mappings established in P1-A2.

This register is the **engineering-level** companion to P1-A1's governance-level data ownership model. It translates logical domain-to-storage decisions into concrete SharePoint implementation: container names, column schemas, content types, lookup relationships, indexing strategy, versioning rules, and provisioning requirements.

**This document does not:**
- redefine data ownership or source-of-record authority (see P1-A1)
- redefine write safety classes, identity keys, or adapter paths (see P1-A2)
- define logical/canonical entity models (see P1-A4 through P1-A13 for domain-specific schemas)
- define reference dictionary schemas or governance (see P1-A5)
- cover Azure Table Storage, Redis, or external system schemas (those are not SharePoint containers)

### Authority Boundary (Frozen)

| Layer | Owning Artifact(s) | Scope |
|-------|-------------------|-------|
| **Physical SharePoint implementation** | **P1-A3** (this document) | Container names, column schemas, content types, lookups, indexing, versioning, provisioning, permissions |
| **Logical / canonical entity models** | P1-A4 through P1-A13 | Domain-specific entity definitions, field semantics, relationship rules, ingestion/normalization logic |
| **Data ownership and governance** | P1-A1 | Which data belongs where, who owns it, field-level ownership schema, lifecycle/retention/visibility/search/analytics |
| **Adapter / source-of-record behavior** | P1-A2 | How adapters reach data, identity keys, write safety classes, conflict resolution |
| **Dictionary schema and governance** | P1-A5 | Reference data dictionary canonical schemas, keying rules, hierarchy, lifecycle, external mapping |

This boundary is frozen. P1-A3 does not own or redefine concerns that belong to the logical, governance, adapter, or dictionary layers.

---

## Relationship to Companion Artifacts

| Artifact | Role | Scope |
|----------|------|-------|
| **P1-A1** Data Ownership Matrix | Governance-level authority for data ownership, storage platform decisions, field-level ownership schema, lifecycle/retention/visibility/search/analytics participation | Logical: which data belongs where and who owns it |
| **P1-A2** Source-of-Record Register | Operational authority for adapter paths, identity keys, write safety classes, and conflict resolution | Operational: how adapters reach authoritative data |
| **P1-A3** SharePoint Schema Register (this document) | Engineering authority for physical SharePoint container definitions, column schemas, and implementation conventions | Physical: how SharePoint lists and libraries are structured |
| **P1-A4–A13** Domain Schema Artifacts | Logical/canonical entity models for schedule ingestion, reference dictionaries, external financial data, operational registers, estimating kickoff, permits, lifecycle checklists, responsibility matrices, subcontractor scorecards, and lessons learned | Logical: what canonical entities and fields exist in each domain |
| **P1-A5** Reference Data Dictionaries | Dictionary schema governance for cost codes, CSI codes, and all shared/domain-local reference sets | Dictionary: keying, hierarchy, lifecycle, and external mapping for governed reference data |

**Reading order:** P1-A1 → P1-A2 → domain schema (A4–A13) → P1-A3. The governance decisions in P1-A1 drive the container choices. The domain schemas define what goes into the containers. P1-A3 defines how the containers are physically structured in SharePoint.

---

## Scope and Non-Scope

### In Scope
- SharePoint List definitions (column names, types, required/optional, indexed columns)
- SharePoint Document Library definitions (content types, metadata columns, folder structure)
- Paired List + Library patterns (where a domain uses both a list and a library)
- Hub site container patterns
- Lookup column definitions and cross-list relationships
- Content type definitions where applicable
- Naming conventions for containers, columns, and content types
- Indexing and performance guidance
- Versioning and document library rules
- Provisioning requirements (per-project vs shared vs hub-level)
- Permission inheritance notes

### Out of Scope
- Data ownership decisions (P1-A1)
- Source-of-record and adapter path decisions (P1-A2)
- Azure Table Storage schema (not SharePoint)
- Redis configuration (not SharePoint)
- External system schemas (Procore, Sage, Autodesk — Phase 4+)
- Application-layer code or adapter implementation details (P1-B1)

---

## Canonical Container Patterns

Phase 1 uses these standard SharePoint container patterns:

### Pattern 1: Single List
A standard SharePoint list storing transactional or reference records as list items.

**Used by:** leads, project (metadata), estimating, schedule, buyout, risk, scorecard
**Provisioning:** per-project site (most domains) or hub site (project master list)
**Characteristics:** each row is one record; columns map to entity fields; lookups link related lists

### Pattern 2: Single Document Library
A SharePoint document library storing document content with metadata columns.

**Used by:** standalone document storage where no companion metadata list is needed
**Provisioning:** per-project site
**Characteristics:** documents are primary content; metadata columns on the library provide classification, search, and filtering

### Pattern 3: Paired List + Document Library
A document library for content paired with a companion list for structured metadata, compliance tracking, or workflow state.

**Used by:** compliance, contracts, pmp
**Provisioning:** per-project site
**Characteristics:** library stores the document; list stores structured metadata, approval state, checklist records, or index entries; linked by a stable key

### Pattern 4: Hub Site Container
A SharePoint hub site that provides cross-project aggregation, navigation, and shared reference data.

**Used by:** project (hub-level master list, identity mapping)
**Provisioning:** one per HB Intel deployment
**Characteristics:** aggregates project-level data; provides the root identity anchor for project sites

---

## Container Definition Template

Use this column schema when defining individual containers in the register below.

| Column | Definition |
|--------|-----------|
| `Domain` | The HB Intel domain that owns this container |
| `Entity` | The logical entity or entities stored in this container (from P1-A1) |
| `Logical Container Name` | The canonical name used in architecture and governance docs |
| `Physical Container Name` | The actual SharePoint list or library name (internal name) |
| `Container Type` | List, Document Library, or Paired (List + Library) |
| `Scope` | Hub, Project Site, Shared Site, or Sales/BD Site |
| `Purpose` | Brief statement of what this container holds |
| `Primary Record Type` | The main content type or record shape |
| `Parent / Related Container` | Containers this one depends on or links to |
| `Key Columns / Required Fields` | Critical columns that must exist for the container to function |
| `Lookup / Join Dependencies` | Cross-list lookup columns or join relationships |
| `Document Pairing Pattern` | For paired containers: how the list and library relate |
| `Versioning Requirement` | SharePoint versioning settings (major, major+minor, none) |
| `Indexing / Scale Notes` | Columns to index; expected row volume; 5000-item threshold considerations |
| `Provisioning Requirement` | When and how this container is created (provisioning flow, manual, or pre-existing) |
| `Security / Visibility Notes` | Permission inheritance, item-level security, or access restrictions |
| `Related Adapter / Package Owner` | The package or adapter responsible for reading/writing this container |
| `Notes` | Implementation notes, constraints, or pending decisions |

---

## Container Register by Domain

This section maps P1-A1 domains to their SharePoint container definitions. Initial entries are derived from the Domain Data Classification Table in P1-A1.

**Status:** Domains with complete logical entity models (P1-A1 field-level definitions + P1-A4–A13 canonical schemas) are classified as **build-ready** below. Domains without complete logical models remain in the **deferred** section.

### Phase 1 Build-Ready Containers

| Domain | Entity | Logical Container Name | Physical Container Name | Container Type | Scope | Purpose | Primary Record Type | Parent / Related Container | Key Columns / Required Fields | Lookup / Join Dependencies | Document Pairing Pattern | Versioning Requirement | Indexing / Scale Notes | Provisioning Requirement | Security / Visibility Notes | Related Adapter / Package Owner | Notes |
|--------|--------|------------------------|-------------------------|----------------|-------|---------|--------------------|-----------------------------|-------------------------------|---------------------------|--------------------------|------------------------|------------------------|--------------------------|----------------------------|--------------------------------|-------|
| project | Project | Project Master List | `ProjectMaster` | List | Hub Site | Master project records with identity, classification, financial, schedule, and status fields | Project item | Hub Site (root) | project_id, record_id, name, project_number, status | ProjectTypes, ProjectStages, ProjectRegions (shared dictionaries) | — | Major versions | Index: project_id, record_id, project_number, active; expect hundreds to low thousands of rows | Created during hub site provisioning | Inherits hub site permissions; project team scoped | @hbc/data-access | 60 fields defined in P1-A1 |
| project | new_project_request | New Project Request List | `NewProjectRequests` | List | Hub Site | Intake requests for new project numbers | Request item | Project Master List (post-approval linkage) | request_id, project_name, request_status, requester_email | — | — | Major versions | Index: request_id, request_status; low volume | Created during hub site provisioning | Restricted to project administration during review | @hbc/data-access | 32 fields defined in P1-A1 |
| estimating | estimating_pursuit | Estimating Pursuit List | `EstimatingPursuits` | List | Project Site | Active bid pursuits with milestone tracking and checklist fields | Pursuit item | Project Master List (project_id FK) | record_id, project_id, status, deliverable, leadEstimator | EstimateSources, EstimateDeliverables, EstimateStatuses (domain-local) | — | Major versions | Index: record_id, project_id, status; moderate volume per project | Created during project site provisioning | Project team scoped | @hbc/data-access | 24 fields defined in P1-A1 |
| estimating | preconstruction_engagement | Preconstruction Engagement List | `PreconEngagements` | List | Project Site | Active preconstruction engagements with budget tracking | Engagement item | Project Master List (project_id FK) | record_id, project_id, status, currentStage | PreconStages (domain-local) | — | Major versions | Index: record_id, project_id, status; low-moderate volume | Created during project site provisioning | Project team scoped | @hbc/data-access | 23 fields defined in P1-A1 |
| estimating | estimate_tracking_record | Estimate Tracking Log | `EstimateTracking` | List | Project Site | Historical estimate submissions and outcomes | Tracking record | Project Master List (project_id FK) | record_id, project_id, status, outcome | EstimateOutcomes (domain-local) | — | Major versions | Index: record_id, project_id, status, outcome; grows over project lifetime | Created during project site provisioning | Project team scoped | @hbc/data-access | 21 fields defined in P1-A1 |
| estimating | estimating_team_member | Estimating Team Members | `EstimatingTeamMembers` | List | Shared Site | Estimating team roster with workload and specialties | Team member item | — | id, record_id, name, role, email | EstimatingRoles, EstimatingSpecialties (domain-local) | — | Major versions | Index: id, role; small stable list | Created once for estimating department | Domain team only | @hbc/data-access | 7 fields defined in P1-A1 |
| buyout | buyout_commitment | Buyout Commitments List | `BuyoutCommitments` | List | Project Site | Subcontracts, POs, and commitment tracking with compliance status | Commitment item | Project Master List (project_id FK) | record_id, id, project_id, commitment_number, status | CommitmentStatuses, ProcurementMethods, ContractTypes, CSICodes (shared/domain) | — | Major versions | Index: record_id, project_id, commitment_number, status, csi_code; moderate-high volume | Created during project site provisioning | Project team scoped; financial fields domain team only | @hbc/data-access | 34 fields defined in P1-A1 |
| buyout | commitment_milestone | Commitment Milestones List | `CommitmentMilestones` | List | Project Site | Milestone tracking for commitments | Milestone item | Buyout Commitments List (commitment_id FK) | record_id, commitment_id, name, status | MilestoneStatuses (domain-local) | — | None | Index: commitment_id; child records of commitments | Created during project site provisioning | Inherits commitment visibility | @hbc/data-access | 8 fields defined in P1-A1 |
| buyout | allowance_item | Allowance Items List | `AllowanceItems` | List | Project Site | Allowance tracking and reconciliation | Allowance item | Buyout Commitments List (commitment_id FK) | record_id, commitment_id, item, value | — | — | Major versions | Index: commitment_id; child records | Created during project site provisioning | Financial fields domain team only | @hbc/data-access | 10 fields defined in P1-A1 |
| buyout | long_lead_item | Long Lead Items List | `LongLeadItems` | List | Project Site | Long lead procurement item tracking | Long lead item | Buyout Commitments List (commitment_id FK) | record_id, commitment_id, item, status | LongLeadStatuses (domain-local) | — | Major versions | Index: commitment_id, status; child records | Created during project site provisioning | Project team scoped | @hbc/data-access | 8 fields defined in P1-A1 |
| buyout | value_engineering_item | Value Engineering Items List | `ValueEngineeringItems` | List | Project Site | VE proposals and savings tracking | VE item | Buyout Commitments List (commitment_id FK) | record_id, commitment_id, item, status | VEStatuses (domain-local) | — | Major versions | Index: commitment_id, status; child records | Created during project site provisioning | Financial fields domain team only | @hbc/data-access | 10 fields defined in P1-A1 |
| buyout | subcontract_checklist_record | Subcontract Checklist Records | `SubcontractChecklists` | List | Project Site | Subcontract compliance checklist header records | Checklist record | Buyout Commitments List (commitment_id FK) | record_id, commitment_id, subcontractor_name | — | — | Major versions | Index: commitment_id; one per commitment | Created during project site provisioning | Compliance-sensitive; confidential business | @hbc/data-access | 21 fields defined in P1-A1 |
| buyout | subcontract_checklist_item | Subcontract Checklist Items | `SubcontractChecklistItems` | List | Project Site | Individual checklist requirement line items | Checklist item | Subcontract Checklist Records (checklist_record_id FK) | record_id, checklist_record_id, requirement_name, item_state | ChecklistItemStates, ChecklistRequirements (domain-local) | — | None | Index: checklist_record_id; ~19 items per checklist | Created during project site provisioning | Compliance-sensitive | @hbc/data-access | 8 fields defined in P1-A1 |
| buyout | compliance_waiver_request | Compliance Waiver Requests | `ComplianceWaiverRequests` | List | Project Site | Insurance and licensing waiver requests with approval chain | Waiver request | Buyout Commitments List (commitment_id FK) | record_id, commitment_id, subcontractor_or_vendor_name | WaiverLevels (domain-local) | — | Major versions | Index: commitment_id; low volume per project | Created during project site provisioning | Compliance-sensitive; audit retention; approval fields privileged/admin | @hbc/data-access | 35 fields defined in P1-A1 |
| buyout | everify_tracking_record | E-Verify Tracking Log | `EVerifyTracking` | List | Project Site | E-Verify affidavit compliance tracking per subcontract | E-Verify record | Buyout Commitments List (commitment_id FK) | record_id, commitment_id, contract_number, everify_status | EVerifyStatuses (domain-local) | — | Major versions | Index: commitment_id, everify_status; one per commitment | Created during project site provisioning | Compliance-sensitive; audit retention | @hbc/data-access | 14 fields defined in P1-A1 |

### Phase 1 Build-Ready Containers — Additional Domains

These domains have complete logical entity models in companion schema artifacts (P1-A4–A13) and are ready for physical container implementation.

| Domain | Entity | Logical Container Name | Physical Container Name | Container Type | Scope | Purpose | Primary Record Type | Parent / Related Container | Key Columns / Required Fields | Lookup / Join Dependencies | Document Pairing Pattern | Versioning Requirement | Indexing / Scale Notes | Provisioning Requirement | Security / Visibility Notes | Related Adapter / Package Owner | Notes |
|--------|--------|------------------------|-------------------------|----------------|-------|---------|--------------------|-----------------------------|-------------------------------|---------------------------|--------------------------|------------------------|------------------------|--------------------------|----------------------------|--------------------------------|-------|
| schedule | schedule_import_batch | Schedule Import Batches | `ScheduleImportBatches` | List | Project Site | Schedule file upload tracking and import provenance | Import batch | Project Master List (project_id FK) | batch_id, project_id, detected_format, import_status | — | — | Major versions | Index: project_id, import_status; low volume per project | Created during project site provisioning | Project team scoped | @hbc/data-access | Canonical entity model in P1-A4; 16 canonical entities |
| schedule | schedule_activity | Schedule Activities List | `ScheduleActivities` | List | Project Site | Canonical normalized schedule activities from CSV/XML/XER imports | Activity item | Schedule Import Batches (batch_id FK) | record_id, batch_id, activity_code, activity_name | schedule_wbs_node, schedule_calendar | — | None | Index: batch_id, activity_code; potentially thousands per import | Created during project site provisioning | Project team scoped | @hbc/data-access | Primary canonical entity from P1-A4 |
| schedule | _raw uploads_ | Schedule Uploads Library | `ScheduleUploadsLib` | Document Library | Project Site | Raw uploaded schedule files (CSV, XML, XER) retained for provenance | Schedule file | Project Master List (project_id FK) | file name, detected_format, upload_date | — | Paired with Schedule Import Batches | Major versions | Low volume; file-level storage | Created during project site provisioning | Project team scoped | @hbc/data-access | Immutable raw source files per P1-A4 Layer 1 |
| risk | register_record (risk subtype) | Operational Register List | `OperationalRegister` | List | Project Site | Hybrid operational register records including risk, constraint, issue, action, and delay subtypes | Register record | Project Master List (project_id FK) | record_id, project_id, record_type, category, completion_status | RegisterCategories, RegisterBICTeams (domain-local) | — | Major versions | Index: project_id, record_type, completion_status, category; moderate volume | Created during project site provisioning | Project team scoped | @hbc/data-access | Canonical entity model in P1-A7; delay subtype extension included |
| compliance | permit_record | Permits List | `Permits` | List | Project Site | Construction permit lifecycle tracking with authority contacts | Permit item | Project Master List (project_id FK) | record_id, project_id, permit_number, permit_status | PermitTypes (domain-local) | — | Major versions | Index: project_id, permit_number, permit_status; moderate volume | Created during project site provisioning | Project team scoped | @hbc/data-access | Canonical entity model in P1-A9; 7 canonical entities |
| compliance | permit_inspection | Permit Inspections List | `PermitInspections` | List | Project Site | Inspection records with results, compliance scores, and inspector contacts | Inspection item | Permits List (permit_id FK) | inspection_id, permit_id, inspection_type, result | — | — | Major versions | Index: permit_id; child records | Created during project site provisioning | Project team scoped | @hbc/data-access | Child of permit_record per P1-A9 |
| compliance | lifecycle checklist | Project Lifecycle Checklists List | `LifecycleChecklists` | List | Project Site | Unified startup/safety/closeout checklist instances and items | Checklist item | Project Master List (project_id FK) | checklist_id, instance_id, item_id, checklist_family, canonical_outcome | ChecklistFamilies (domain-local) | — | Major versions | Index: project_id, checklist_family, canonical_outcome; moderate volume | Created during project site provisioning | Project team scoped | @hbc/data-access | Canonical entity model in P1-A10; 3 families (startup/safety/closeout) |
| scorecard | scorecard_evaluation | Subcontractor Scorecards List | `SubcontractorScorecards` | List | Project Site | Per-project per-subcontractor performance evaluations with criterion-level scoring | Evaluation item | Project Master List (project_id FK), Buyout Commitments List (subcontractor linkage) | evaluation_id, project_id, subcontractor_display_name, official_final_flag | — | — | Major versions | Index: project_id, subcontractor_key, official_final_flag; low-moderate volume | Created during project site provisioning | Project team scoped; financial snapshots domain team only | @hbc/data-access | Canonical entity model in P1-A12; 12 canonical entities; rubric templates on hub site |
| scorecard | criterion_score_record | Scorecard Criterion Scores List | `ScorecardCriterionScores` | List | Project Site | Per-criterion scoring detail for subcontractor evaluations | Criterion score | Subcontractor Scorecards List (evaluation_id FK) | score_record_id, evaluation_id, criterion_id, score_raw | — | — | None | Index: evaluation_id; ~29 child records per evaluation | Created during project site provisioning | Inherits evaluation visibility | @hbc/data-access | Canonical scoring detail per P1-A12 |

### Deferred / Future-Wave Placeholders

These domains do not yet have complete logical entity models in the Phase 1 schema set. They remain placeholders until P1-A1 field expansion and/or dedicated schema artifacts are completed.

| Domain | Entity | Logical Container Name | Physical Container Name | Container Type | Scope | Purpose | Notes |
|--------|--------|------------------------|-------------------------|----------------|-------|---------|-------|
| leads | _pending_ | Leads List | _deferred_ | List | Sales/BD Site | Lead/opportunity tracking | No dedicated schema artifact yet; pending P1-A1 field expansion |
| contracts | _pending_ | Contract Metadata List + Contract Library | _deferred_ | Paired (List + Library) | Project Site | Contract documents with structured metadata | No dedicated schema artifact yet |
| pmp | _pending_ | PMP Index List + PMP Library | _deferred_ | Paired (List + Library) | Project Site | Project management plan documents with structured index | No dedicated schema artifact yet |

### Platform and Infrastructure Containers (Wave 3+)

Platform containers for auth, provisioning state, audit log, and project identity mapping are **not SharePoint containers** — they live in Azure Table Storage or Microsoft Graph / Entra ID. They are documented in P1-A1 and P1-A2 but are out of scope for this register.

---

## Physical Schema Conventions

### Container Naming

| Element | Convention | Example |
|---------|-----------|---------|
| **Physical list name** | PascalCase, no spaces, domain-prefixed where needed for clarity | `BuyoutCommitments`, `EstimatingPursuits`, `PermitInspections` |
| **Display name** | Title case with spaces; matches logical container name from register | "Buyout Commitments", "Estimating Pursuits", "Permit Inspections" |
| **Document library name** | PascalCase with `Lib` suffix where disambiguation is needed | `ScheduleUploadsLib`, `ComplianceDocumentsLib` |
| **Hub-site shared lists** | Prefixed with `Shared_` or placed in a dedicated shared list group | `Shared_ProjectTypes`, `Shared_CSICodes` |

### Column Naming

| Convention | Rule | Example |
|-----------|------|---------|
| **Internal name** | camelCase; no spaces or special characters | `projectId`, `commitmentNumber`, `createdAt` |
| **Display name** | Title case with spaces | "Project ID", "Commitment Number", "Created At" |
| **Nested/prefixed fields** | Underscore prefix for embedded object fields to avoid collision | `vendorContact_name`, `vendorContact_email`, `bidTabLink_bidTabId`, `checklist_bidBond` |

### Key Field Suffix Conventions

| Suffix | Meaning | Usage |
|--------|---------|-------|
| `_id` | Primary or foreign key identifier (system-generated or source-native) | `project_id`, `commitment_id`, `batch_id` |
| `_key` | Canonical HB Intel reference key (stable cross-entity linkage) | `record_id` (via Record ID Field), `template_item_key`, `role_party_key` |
| `_code` | Controlled-value code from a governed dictionary or reference set | `status_code`, `category_code`, `cost_type_code` |
| `_display` | Raw display/snapshot text preserved from source for UI rendering | `assigned_display`, `vendor_display`, `inspector_display` |
| `_snapshot` | Point-in-time snapshot of a value that may change on the source entity | `job_name_snapshot`, `project_name_snapshot`, `contract_value_snapshot` |
| `_raw` | Original source text preserved alongside a normalized canonical field | `category_raw`, `critical_path_impact_raw`, `pcco_reference_raw` |
| `_flag` | Normalized boolean derived from source text (Yes/No, Pass/Fail, etc.) | `critical_path_impact_flag`, `na_flag`, `official_final_flag` |
| `_pct` | Percentage value (stored as number, display as %) | `section_weight_pct`, `variance_percentage` |

### Content Type Naming

| Convention | Rule | Example |
|-----------|------|---------|
| **Base content type** | Use default `Item` for most lists | Standard SharePoint Item |
| **Custom content type** | PascalCase, domain-prefixed, descriptive | `BuyoutCommitment`, `PermitRecord`, `ScorecardEvaluation` |
| **Document content type** | PascalCase with `Document` suffix | `ScheduleUploadDocument`, `ComplianceDocument` |

Custom content types are created only when:
- A list stores multiple distinct record types
- A document library requires enforced metadata columns
- A content type is reused across multiple lists (shared site column group)

### Lookup Target Notation

In the container register, lookup/join dependencies use this notation:
- `ParentListName (foreign_key_field FK)` — e.g., `Buyout Commitments List (commitment_id FK)`
- `SharedDictionaryName (domain-local)` — e.g., `CommitmentStatuses (domain-local)`
- `SharedDictionaryName (shared)` — e.g., `CSICodes (shared)`

### Column Types

Map P1-A1 data types to SharePoint column types:

| P1-A1 Data Type | SharePoint Column Type | Notes |
|-----------------|------------------------|-------|
| `string` | Single Line of Text | Use for short strings (<255 chars) |
| `text` | Multiple Lines of Text (Plain) | Use for narrative fields, descriptions |
| `number` | Number | Configure decimal places per field |
| `boolean` | Yes/No | |
| `date` | Date Only | |
| `datetime` | Date and Time | |
| `string[]` | Multiple Lines of Text (Plain) | Store as JSON array; parse in adapter layer |
| `json` | Multiple Lines of Text (Plain) | Store as JSON; parse in adapter layer |
| `choice` / controlled value | Choice | Populate choice values from P1-A1 controlled-value sets |

### Content Type Rules
- Use the default Item content type for most lists
- Create custom content types only when a list stores multiple distinct record types
- Document libraries should use custom content types to enforce required metadata columns

---

## Shared Reusable Schema Assets

This section defines the reusable physical-schema building blocks that Phase 1 build-ready containers reference rather than redefining per-container.

### Shared Site Columns

These columns appear on most or all Phase 1 lists and should be provisioned as shared site columns at the hub or project-site level.

| Column Internal Name | Display Name | SharePoint Type | Scope | Purpose |
|---------------------|-------------|-----------------|-------|---------|
| `recordId` | Record ID | Single Line of Text | All lists | HB Intel domain-prefixed primary identifier |
| `projectId` | Project ID | Single Line of Text | All project-site lists | FK to project domain |
| `createdAt` | Created At | Date and Time | All lists | Record creation timestamp |
| `updatedAt` | Updated At | Date and Time | All lists | Last modification timestamp |
| `createdBy` | Created By | Single Line of Text | Most lists | Creator identity (UPN or display) |
| `isActive` | Is Active | Yes/No | Most lists | Soft-delete / active flag |
| `notes` | Notes | Multiple Lines of Text | Most lists | General-purpose notes field |
| `sourceBatchId` | Source Batch ID | Single Line of Text | Imported lists | FK to import batch (Azure Table Storage) |
| `sourceRowNumber` | Source Row Number | Number | Imported lists | Original row in source file |

### Custom Content Types

| Content Type | Base Type | Scope | Used By |
|-------------|-----------|-------|---------|
| `HBBaseListItem` | Item | Hub + Project Site | All Phase 1 lists; includes shared site columns above |
| `HBDocumentItem` | Document | Project Site | Schedule uploads, compliance documents, contract documents |
| `HBDictionaryItem` | Item | Hub Site | All shared and domain-local dictionary lists |

### Shared Dictionaries (Governed by P1-A5)

These dictionaries are stored as SharePoint lists on the **hub site** and governed by [P1-A5-Reference-Data-Dictionary-Schema.md](./P1-A5-Reference-Data-Dictionary-Schema.md). A3 defines their physical container; A5 defines their canonical schema.

| Dictionary List | Internal Name | Key Column | Display Column | Source |
|----------------|---------------|-----------|----------------|--------|
| Cost Codes | `Shared_CostCodes` | `csiCode` | `description` | P1-A5 Cost Code Dictionary |
| CSI Codes | `Shared_CSICodes` | `csiCode` | `primaryDescription` | P1-A5 CSI Code Dictionary |
| Project Types | `Shared_ProjectTypes` | `typeId` | `typeName` | P1-A5 (pending schema) |
| Project Stages | `Shared_ProjectStages` | `stageId` | `stageName` | P1-A5 (pending schema) |
| Project Regions | `Shared_ProjectRegions` | `regionId` | `regionName` | P1-A5 (pending schema) |
| State Codes | `Shared_StateCodes` | `stateCode` | `stateName` | P1-A5 (pending schema) |
| Country Codes | `Shared_CountryCodes` | `countryCode` | `countryName` | P1-A5 (pending schema) |
| Delivery Methods | `Shared_DeliveryMethods` | `methodCode` | `methodName` | P1-A5 (pending schema) |
| Sectors | `Shared_Sectors` | `sectorCode` | `sectorName` | P1-A5 (pending schema) |

### Domain-Local Dictionaries (Site-Scoped)

These dictionaries are stored on the relevant project or shared site and are managed within their domain's schema artifact. They are NOT governed by P1-A5 unless later promoted.

| Dictionary List | Domain | Internal Name | Scope | Governing Schema |
|----------------|--------|---------------|-------|-----------------|
| Estimate Sources | estimating | `EstimateSources` | Project Site | P1-A1 (buyout/estimating field definitions) |
| Estimate Deliverables | estimating | `EstimateDeliverables` | Project Site | P1-A1 |
| Estimate Statuses | estimating | `EstimateStatuses` | Project Site | P1-A1 |
| Commitment Statuses | buyout | `CommitmentStatuses` | Project Site | P1-A1 |
| Procurement Methods | buyout | `ProcurementMethods` | Project Site | P1-A1 |
| Contract Types | buyout | `ContractTypes` | Project Site | P1-A1 |
| Checklist Item States | buyout | `ChecklistItemStates` | Project Site | P1-A1 |
| E-Verify Statuses | buyout | `EVerifyStatuses` | Project Site | P1-A1 |
| Register Categories | risk | `RegisterCategories` | Project Site | P1-A7 |
| Register BIC Teams | risk | `RegisterBICTeams` | Project Site | P1-A7 |
| Permit Types | compliance | `PermitTypes` | Project Site | P1-A9 |
| Checklist Families | compliance | `ChecklistFamilies` | Project Site | P1-A10 |

### Reusable Child-Record Patterns

These patterns repeat across multiple domains. Each domain's container appendix should reference the shared pattern rather than reinventing the structure.

#### Evidence / Document Link Pattern

Used by: buyout (compliance waiver), estimating kickoff, lifecycle checklists, lessons learned, subcontractor scorecards

| Column | Type | Description |
|--------|------|-------------|
| `linkId` | Single Line of Text | Link record identifier |
| `parentRecordId` | Single Line of Text | FK to parent entity |
| `linkType` | Choice | document, file_url, certificate, inspection_report, external_reference |
| `linkTarget` | Single Line of Text | Document ID, URL, or reference |
| `linkLabel` | Single Line of Text | Display label |
| `createdAt` | Date and Time | When the link was added |

#### External Mapping Pattern

Used by: cost codes (P1-A5), CSI codes (P1-A5), budget lines (P1-A6), operational register records (P1-A7)

| Column | Type | Description |
|--------|------|-------------|
| `mappingId` | Single Line of Text | Mapping record identifier |
| `sourceEntityId` | Single Line of Text | FK to source entity |
| `targetSystem` | Single Line of Text | Target system name |
| `targetCode` | Single Line of Text | Target system code/ID |
| `targetDescription` | Single Line of Text | Target system description |
| `mappingConfidence` | Choice | Auto-matched, Manual, Verified |
| `isActive` | Yes/No | Whether mapping is current |

#### Import Finding Pattern

Used by: all imported data (schedule, budget, operational register, permits, checklists, scorecards, lessons)

| Column | Type | Description |
|--------|------|-------------|
| `findingId` | Single Line of Text | Finding identifier |
| `batchId` | Single Line of Text | FK to import batch |
| `severity` | Choice | error, warning, info |
| `category` | Single Line of Text | Finding category |
| `entityType` | Single Line of Text | Which entity the finding relates to |
| `message` | Multiple Lines of Text | Human-readable description |

**Note:** Import findings are stored in **Azure Table Storage** per P1-A1/A2 storage boundary rules, not in SharePoint lists. This pattern defines the schema; the storage location is Table Storage.

#### Approval / Attestation Record Pattern

Used by: compliance waiver requests (3-tier), subcontractor scorecards (3-role), lifecycle checklists (future)

| Column | Type | Description |
|--------|------|-------------|
| `approvalId` | Single Line of Text | Approval record identifier |
| `parentRecordId` | Single Line of Text | FK to parent entity |
| `approvalRole` | Single Line of Text | Role (project_manager, superintendent, project_executive, compliance_manager, cfo) |
| `approverDisplay` | Single Line of Text | Approver display name |
| `approverKey` | Single Line of Text | Canonical person key (if resolved) |
| `approvalDate` | Date Only | Date of approval |
| `approvalStatus` | Choice | pending, approved, declined |

#### Summary / Derived Record Pattern

Used by: subcontractor scorecard (section summaries, overall summary), budget lines (derived metrics)

| Column | Type | Description |
|--------|------|-------------|
| `summaryId` | Single Line of Text | Summary record identifier |
| `parentRecordId` | Single Line of Text | FK to parent entity |
| `summaryType` | Single Line of Text | section_score, overall_score, derived_total |
| `summaryValue` | Number | Calculated/derived numeric value |
| `summaryLabel` | Single Line of Text | Display label |
| `sourceFormula` | Single Line of Text | Derivation description (for provenance) |

---

## Lookup and Reference Strategy

### Cross-List Lookups
- Use SharePoint lookup columns for parent-child relationships within the same site (e.g., Milestone → Commitment)
- Lookup columns reference the parent list's ID column
- Do not use cross-site lookups; use stable key fields (e.g., `project_id`) and resolve at the adapter layer

### Shared Reference Dictionaries
- Shared dictionaries (CSICodes / Cost Codes, StateCodes, CountryCodes, ProjectTypes, etc.) should be stored as lists on the hub site
- Domain-local reference sets (EstimateSources, CommitmentStatuses, etc.) should be stored as lists on the relevant site scope
- Reference sets referenced by Choice columns should have their values populated from these dictionary lists
- Canonical schema for reference dictionaries (keying, hierarchy, lifecycle, applicability) is governed by [P1-A5-Reference-Data-Dictionary-Schema.md](./P1-A5-Reference-Data-Dictionary-Schema.md)

---

## Indexing and Performance Considerations

### Required Indexes
- Every list must index its `record_id` column (or equivalent primary identifier)
- Parent foreign key columns (`project_id`, `commitment_id`, `checklist_record_id`) must be indexed on child lists
- Status/lifecycle columns should be indexed when used as primary filter criteria
- Lists expected to exceed 5,000 items must have indexed columns for all common query patterns

### 5,000-Item Threshold
- SharePoint lists have a 5,000-item list view threshold
- Use indexed columns and filtered views to keep query results under threshold
- For high-volume lists (buyout commitments across large projects), consider partitioning strategies at the adapter layer

---

## Permissions and Inheritance Notes

- Most project-site lists inherit permissions from the project site
- Financial fields marked `Domain Team Only` in P1-A1 require column-level or view-level access control; implement via separate views or adapter-level filtering
- Compliance-sensitive lists (checklist records, waiver requests) may require elevated permission settings
- Hub site lists inherit hub site permissions; project team scoping is managed at the adapter layer

---

## Versioning and Document Library Rules

### Lists
- Enable major version history on lists where `version` field is tracked (per P1-A1 Revision Pattern = Standard Revision Pattern)
- Milestone and checklist item lists (no revision pattern) do not require versioning

### Document Libraries
- Enable major + minor versions for contract and compliance document libraries
- PMP libraries should use major versions only (published versions)
- Set version limit per organizational retention policy (recommended: 50 major versions for active documents)

---

## Open Decisions / Future Expansion

| Decision | Scope | Owner | Target |
|----------|-------|-------|--------|
| **Physical column schemas per domain** | Define exact SharePoint column names, types, and display names for each container | Platform Architecture + Business Domains | Wave-by-wave as P1-A1 field expansion completes |
| **Shared dictionary list deployment** | Where and how shared reference dictionaries are provisioned across hub and project sites | Platform Architecture | Phase 1 |
| **Column-level security for financial fields** | Implementation approach for restricting financial column visibility | Platform Architecture + Security | Phase 1 |
| **Content type strategy for paired containers** | Custom content types for compliance, contracts, PMP document libraries | Platform Architecture | Phase 1 |
| **Provisioning automation scope** | Which containers are auto-provisioned vs manually created | Platform Architecture + DevOps | Phase 1 |

---

## Decision Owners and Approval

| Role | Name | Approval Date |
|------|------|----------------|
| Platform Architecture Lead | — | — |
| SharePoint Infrastructure Owner | — | — |
| Security and Compliance Lead | — | — |

**Approval Status:** Active — Physical schema register for Phase 1 build-ready domains
**Comments:** Container register established for all Wave 1 domains with logical container names, types, scope, key columns, and provisioning requirements. Wave 1 domains (project, estimating, buyout, new_project_request) have complete logical entity models in P1-A1 and domain schemas (P1-A4–A13); physical column schemas for these domains are ready for implementation as SharePoint list provisioning proceeds. Wave 2+ domains remain pending P1-A1 field expansion.

---

## Revision History

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 0.1 | 2026-03-17 | Architecture | Initial structure; container register seeded from P1-A1 Wave 1 domains. Physical column schemas pending approval. |
| 0.2 | 2026-03-17 | Architecture | Froze authority boundary: A3 owns physical SharePoint implementation only; A4–A13 own logical/canonical entity models; A2 owns adapter/source-of-record behavior; A5 owns dictionary schema governance. Updated status from Draft to Active for Phase 1 build-ready domains. Expanded relationship table to include A4–A13 and A5. |
| 0.3 | 2026-03-17 | Architecture | Split container register into Phase 1 Build-Ready vs Deferred sections. Moved schedule (P1-A4), risk (P1-A7), compliance/permits (P1-A9), compliance/checklists (P1-A10), scorecard (P1-A12) into build-ready scope with proper container rows. Retained leads, contracts, pmp as deferred placeholders. |
| 0.4 | 2026-03-17 | Architecture | Added Shared Reusable Schema Assets section (shared site columns, custom content types, shared/domain-local dictionaries, 5 reusable child-record patterns). Expanded Physical Schema Conventions with comprehensive naming conventions (container names, column suffixes, content type rules, lookup notation). |
| 0.5 | 2026-03-17 | Architecture | Applied naming conventions: replaced all `_pending schema approval_` Physical Container Names with PascalCase names (24 build-ready containers). Changed deferred container names to `_deferred_` to distinguish from build-ready scope. |
