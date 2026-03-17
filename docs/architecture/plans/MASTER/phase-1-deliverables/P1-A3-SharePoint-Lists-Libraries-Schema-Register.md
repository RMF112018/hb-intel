# P1-A3: SharePoint Lists & Libraries Schema Register

**Document ID:** P1-A3
**Phase:** 1 (Foundation)
**Classification:** Internal — Engineering
**Status:** Active — Physical Schema Register
**Date:** 2026-03-17
**Read With:** [P1-A1-Data-Ownership-Matrix.md](./P1-A1-Data-Ownership-Matrix.md), [P1-A2-Source-of-Record-Register.md](./P1-A2-Source-of-Record-Register.md), [P1-A4-Schedule-Ingestion-Normalization-Schema.md](./P1-A4-Schedule-Ingestion-Normalization-Schema.md), [P1-A5-Reference-Data-Dictionary-Schema.md](./P1-A5-Reference-Data-Dictionary-Schema.md), [P1-A6-External-Financial-Data-Ingestion-Schema.md](./P1-A6-External-Financial-Data-Ingestion-Schema.md), [P1-A7-Operational-Register-Schema.md](./P1-A7-Operational-Register-Schema.md), [P1-A8-Estimating-Kickoff-Schema.md](./P1-A8-Estimating-Kickoff-Schema.md), [P1-A9-Permits-Inspections-Schema.md](./P1-A9-Permits-Inspections-Schema.md), [P1-A10-Project-Lifecycle-Checklist-Schema.md](./P1-A10-Project-Lifecycle-Checklist-Schema.md), [P1-A11-Responsibility-Matrix-Schema.md](./P1-A11-Responsibility-Matrix-Schema.md), [P1-A12-Subcontractor-Scorecard-Schema.md](./P1-A12-Subcontractor-Scorecard-Schema.md), [P1-A13-Lessons-Learned-Schema.md](./P1-A13-Lessons-Learned-Schema.md), [P1-A14-Leads-Schema.md](./P1-A14-Leads-Schema.md), [P1-A15-Prime-Contracts-Schema.md](./P1-A15-Prime-Contracts-Schema.md), [current-state-map.md](../../blueprint/current-state-map.md)

---

## Purpose

Define the physical SharePoint container definitions — lists, libraries, paired patterns, and hub site structures — that implement the data ownership decisions made in P1-A1 and the source-of-record mappings established in P1-A2.

This register is the **engineering-level** companion to P1-A1's governance-level data ownership model. It translates logical domain-to-storage decisions into concrete SharePoint implementation: container names, column schemas, content types, lookup relationships, indexing strategy, versioning rules, and provisioning requirements.

**This document does not:**
- redefine data ownership or source-of-record authority (see P1-A1)
- redefine write safety classes, identity keys, or adapter paths (see P1-A2)
- define logical/canonical entity models (see P1-A4 through P1-A15 for domain-specific schemas)
- define reference dictionary schemas or governance (see P1-A5)
- cover Azure Table Storage, Redis, or external system schemas (those are not SharePoint containers)

### Authority Boundary (Frozen)

| Layer | Owning Artifact(s) | Scope |
|-------|-------------------|-------|
| **Physical SharePoint implementation** | **P1-A3** (this document) | Container names, column schemas, content types, lookups, indexing, versioning, provisioning, permissions |
| **Logical / canonical entity models** | P1-A4 through P1-A15 | Domain-specific entity definitions, field semantics, relationship rules, ingestion/normalization logic |
| **Data ownership and governance** | P1-A1 | Which data belongs where, who owns it, field-level ownership schema, lifecycle/retention/visibility/search/analytics |
| **Adapter / source-of-record behavior** | P1-A2 | How adapters reach data, identity keys, write safety classes, conflict resolution |
| **Dictionary schema and governance** | P1-A5 | Reference data dictionary canonical schemas, keying rules, hierarchy, lifecycle, external mapping |

This boundary is frozen. P1-A3 does not own or redefine concerns that belong to the logical, governance, adapter, or dictionary layers.

**Canonical-to-Physical Reconciliation Rule:** When a governing canonical schema defines more entities than A3 implements as separate SharePoint containers, A3 must include an explicit canonical-to-physical reconciliation note identifying which canonical entities are flattened into broader records, represented via shared hub-site assets, externalized to non-SharePoint operational state, or deferred. Fewer physical containers does not imply incomplete governance — it indicates intentional Phase 1 compression documented in A3.

---

## Relationship to Companion Artifacts

| Artifact | Role | Scope |
|----------|------|-------|
| **P1-A1** Data Ownership Matrix | Governance-level authority for data ownership, storage platform decisions, field-level ownership schema, lifecycle/retention/visibility/search/analytics participation | Logical: which data belongs where and who owns it |
| **P1-A2** Source-of-Record Register | Operational authority for adapter paths, identity keys, write safety classes, and conflict resolution | Operational: how adapters reach authoritative data |
| **P1-A3** SharePoint Schema Register (this document) | Engineering authority for physical SharePoint container definitions, column schemas, and implementation conventions | Physical: how SharePoint lists and libraries are structured |
| **P1-A4–A15** Domain Schema Artifacts | Logical/canonical entity models for schedule ingestion, reference dictionaries, external financial data, operational registers, estimating kickoff, permits, lifecycle checklists, responsibility matrices, subcontractor scorecards, lessons learned, leads & pipeline, and prime contracts | Logical: what canonical entities and fields exist in each domain |
| **P1-A5** Reference Data Dictionaries | Dictionary schema governance for cost codes, CSI codes, and all shared/domain-local reference sets | Dictionary: keying, hierarchy, lifecycle, and external mapping for governed reference data |

**Reading order:** P1-A1 → P1-A2 → domain schema (A4–A15) → P1-A3. The governance decisions in P1-A1 drive the container choices. The domain schemas define what goes into the containers. P1-A3 defines how the containers are physically structured in SharePoint.

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

**Used by:** leads, project (metadata), estimating, schedule, buyout, risk, scorecard, contracts
**Provisioning:** per-project site (most domains) or hub site (project master list)
**Characteristics:** each row is one record; columns map to entity fields; lookups link related lists

### Pattern 2: Single Document Library
A SharePoint document library storing document content with metadata columns.

**Used by:** standalone document storage where no companion metadata list is needed
**Provisioning:** per-project site
**Characteristics:** documents are primary content; metadata columns on the library provide classification, search, and filtering

### Pattern 3: Paired List + Document Library
A document library for content paired with a companion list for structured metadata, compliance tracking, or workflow state.

**Used by:** compliance, pmp
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

**Status:** All Phase 1 build-ready containers have physical names, content types, key columns, indexing, provisioning, and security documented in the register below, with per-container appendix blocks (Section A) providing column-level physical schema definitions. Deferred domains remain placeholders.

### Phase 1 Build-Ready Containers

Containers are organized by execution dependency order. All containers below are build-ready with per-container appendix blocks in Section A.

#### 1. Shared Dictionaries (Hub Site)

| Domain | Entity | Logical Container Name | Physical Container Name | Container Type | Scope | Key Columns | Governing Schema | Notes |
|--------|--------|------------------------|-------------------------|----------------|-------|-------------|-----------------|-------|
| shared | cost_code | Cost Codes | `Shared_CostCodes` | List | Hub Site | csiCode, description, stage, divisionCode | P1-A5 | Build-ready. CT: `HBDictionaryItem`. 7,565 codes. |
| shared | csi_code | CSI Codes | `Shared_CSICodes` | List | Hub Site | csiCode, primaryDescription, divisionCode, sectionGroup | P1-A5 | Build-ready. CT: `HBDictionaryItem`. ~6,633 codes. |
| shared | project_types | Project Types | `Shared_ProjectTypes` | List | Hub Site | typeId, typeName | P1-A5 | Build-ready. CT: `HBDictionaryItem`. Simple Reference Dictionary pattern. |
| shared | project_stages | Project Stages | `Shared_ProjectStages` | List | Hub Site | stageId, stageName | P1-A5 | Build-ready. CT: `HBDictionaryItem`. Simple Reference Dictionary pattern. |
| shared | project_regions | Project Regions | `Shared_ProjectRegions` | List | Hub Site | regionId, regionName | P1-A5 | Build-ready. CT: `HBDictionaryItem`. Simple Reference Dictionary pattern. |
| shared | state_codes | State Codes | `Shared_StateCodes` | List | Hub Site | stateCode, stateName | P1-A5 | Build-ready. CT: `HBDictionaryItem`. Simple Reference Dictionary pattern. ISO-aligned. |
| shared | country_codes | Country Codes | `Shared_CountryCodes` | List | Hub Site | countryCode, countryName | P1-A5 | Build-ready. CT: `HBDictionaryItem`. Simple Reference Dictionary pattern. ISO-aligned. |
| shared | delivery_methods | Delivery Methods | `Shared_DeliveryMethods` | List | Hub Site | methodCode, methodName | P1-A5 | Build-ready. CT: `HBDictionaryItem`. Simple Reference Dictionary pattern. |
| shared | sectors | Sectors | `Shared_Sectors` | List | Hub Site | sectorCode, sectorName | P1-A5 | Build-ready. CT: `HBDictionaryItem`. Simple Reference Dictionary pattern. |
| shared | scorecard_rubric | Scorecard Rubric Templates | `Shared_ScorecardRubrics` | List | Hub Site | templateId, versionId, sectionId, criterionId | P1-A12 | Build-ready. CT: `HBDictionaryItem`. Rubric definitions for subcontractor scorecards. |
| shared | kickoff_template | Kickoff Templates | `Shared_KickoffTemplates` | List | Hub Site | templateId, templateItemId, section, rowType | P1-A8 | Build-ready. CT: `HBDictionaryItem`. Estimating kickoff template library. |
| shared | checklist_template | Lifecycle Checklist Templates | `Shared_ChecklistTemplates` | List | Hub Site | templateId, checklistFamily, sectionId, itemId | P1-A10 | Build-ready. CT: `HBDictionaryItem`. Startup/safety/closeout templates. |
| shared | responsibility_template | Responsibility Templates | `Shared_ResponsibilityTemplates` | List | Hub Site | templateId, familyId, itemId, rolePartyId | P1-A11 | Build-ready. CT: `HBDictionaryItem`. PM/Field/Owner Contract templates. |

#### 2. Project / Intake

| Domain | Entity | Logical Container Name | Physical Container Name | Container Type | Scope | Purpose | Primary Record Type | Parent / Related Container | Key Columns / Required Fields | Lookup / Join Dependencies | Document Pairing Pattern | Versioning Requirement | Indexing / Scale Notes | Provisioning Requirement | Security / Visibility Notes | Related Adapter / Package Owner | Notes |
|--------|--------|------------------------|-------------------------|----------------|-------|---------|--------------------|-----------------------------|-------------------------------|---------------------------|--------------------------|------------------------|------------------------|--------------------------|----------------------------|--------------------------------|-------|
| project | Project | Project Master List | `ProjectMaster` | List | Hub Site | Master project records with identity, classification, financial, schedule, and status fields | Project item | Hub Site (root) | project_id, record_id, name, project_number, status | ProjectTypes, ProjectStages, ProjectRegions (shared) | — | Major versions | Index: project_id, record_id, project_number, active; hundreds to low thousands | Created during hub site provisioning | Inherits hub site permissions; project team scoped | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. 60 fields (P1-A1). |
| project | new_project_request | New Project Request List | `NewProjectRequests` | List | Hub Site | Intake requests for new project numbers | Request item | ProjectMaster (post-approval linkage) | request_id, project_name, request_status, requester_email | — | — | Major versions | Index: request_id, request_status; low volume | Created during hub site provisioning | Restricted to project administration during review | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. 32 fields (P1-A1). |

#### 3. Estimating (Pursuit / Preconstruction / Tracking / Team)

| Domain | Entity | Logical Container Name | Physical Container Name | Container Type | Scope | Purpose | Primary Record Type | Parent / Related Container | Key Columns / Required Fields | Lookup / Join Dependencies | Document Pairing Pattern | Versioning Requirement | Indexing / Scale Notes | Provisioning Requirement | Security / Visibility Notes | Related Adapter / Package Owner | Notes |
|--------|--------|------------------------|-------------------------|----------------|-------|---------|--------------------|-----------------------------|-------------------------------|---------------------------|--------------------------|------------------------|------------------------|--------------------------|----------------------------|--------------------------------|-------|
| estimating | estimating_pursuit | Estimating Pursuit List | `EstimatingPursuits` | List | Project Site | Active bid pursuits with milestone tracking and checklist fields | Pursuit item | ProjectMaster (project_id FK) | record_id, project_id, status, deliverable, leadEstimator | EstimateSources, EstimateDeliverables, EstimateStatuses (domain-local) | — | Major versions | Index: record_id, project_id, status; moderate volume | Created during project site provisioning | Project team scoped | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. 24 fields (P1-A1). |
| estimating | preconstruction_engagement | Preconstruction Engagement List | `PreconEngagements` | List | Project Site | Active preconstruction engagements with budget tracking | Engagement item | ProjectMaster (project_id FK) | record_id, project_id, status, currentStage | PreconStages (domain-local) | — | Major versions | Index: record_id, project_id, status; low-moderate volume | Created during project site provisioning | Restricted list — Financial Domain Team group | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. 23 fields (P1-A1). |
| estimating | estimate_tracking_record | Estimate Tracking Log | `EstimateTracking` | List | Project Site | Historical estimate submissions and outcomes | Tracking record | ProjectMaster (project_id FK) | record_id, project_id, status, outcome | EstimateOutcomes (domain-local) | — | Major versions | Index: record_id, project_id, status, outcome; grows over lifetime | Created during project site provisioning | Project team scoped | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. 21 fields (P1-A1). |
| estimating | estimating_team_member | Estimating Team Members | `EstimatingTeamMembers` | List | Shared Site | Estimating team roster with workload and specialties | Team member item | — | id, record_id, name, role, email | EstimatingRoles, EstimatingSpecialties (domain-local) | — | Major versions | Index: id, role; small stable list | Created once for estimating department | Domain team only | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. 7 fields (P1-A1). |

#### 4. Buyout (Commitments + Compliance)

| Domain | Entity | Logical Container Name | Physical Container Name | Container Type | Scope | Purpose | Primary Record Type | Parent / Related Container | Key Columns / Required Fields | Lookup / Join Dependencies | Document Pairing Pattern | Versioning Requirement | Indexing / Scale Notes | Provisioning Requirement | Security / Visibility Notes | Related Adapter / Package Owner | Notes |
|--------|--------|------------------------|-------------------------|----------------|-------|---------|--------------------|-----------------------------|-------------------------------|---------------------------|--------------------------|------------------------|------------------------|--------------------------|----------------------------|--------------------------------|-------|
| buyout | buyout_commitment | Buyout Commitments List | `BuyoutCommitments` | List | Project Site | Subcontracts, POs, and commitment tracking with compliance status | Commitment item | ProjectMaster (project_id FK) | record_id, id, project_id, commitment_number, status | CommitmentStatuses, ProcurementMethods, ContractTypes, CSICodes | — | Major versions | Index: record_id, project_id, commitment_number, status, csi_code; moderate-high volume | Created during project site provisioning | Restricted list — Financial Domain Team group | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. 34 fields (P1-A1). |
| buyout | commitment_milestone | Commitment Milestones | `CommitmentMilestones` | List | Project Site | Milestone tracking for commitments | Milestone item | BuyoutCommitments (commitment_id FK) | record_id, commitment_id, name, status | MilestoneStatuses (domain-local) | — | None | Index: commitment_id; child records | Created during project site provisioning | Inherits commitment visibility | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. 8 fields (P1-A1). |
| buyout | allowance_item | Allowance Items | `AllowanceItems` | List | Project Site | Allowance tracking and reconciliation | Allowance item | BuyoutCommitments (commitment_id FK) | record_id, commitment_id, item, value | — | — | Major versions | Index: commitment_id; child records | Created during project site provisioning | Restricted list — Financial Domain Team group | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. 10 fields (P1-A1). |
| buyout | long_lead_item | Long Lead Items | `LongLeadItems` | List | Project Site | Long lead procurement item tracking | Long lead item | BuyoutCommitments (commitment_id FK) | record_id, commitment_id, item, status | LongLeadStatuses (domain-local) | — | Major versions | Index: commitment_id, status; child records | Created during project site provisioning | Project team scoped | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. 8 fields (P1-A1). |
| buyout | value_engineering_item | Value Engineering Items | `ValueEngineeringItems` | List | Project Site | VE proposals and savings tracking | VE item | BuyoutCommitments (commitment_id FK) | record_id, commitment_id, item, status | VEStatuses (domain-local) | — | Major versions | Index: commitment_id, status; child records | Created during project site provisioning | Restricted list — Financial Domain Team group | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. 10 fields (P1-A1). |
| buyout | subcontract_checklist_record | Subcontract Checklists | `SubcontractChecklists` | List | Project Site | Subcontract compliance checklist header records | Checklist record | BuyoutCommitments (commitment_id FK) | record_id, commitment_id, subcontractor_name | — | — | Major versions | Index: commitment_id; one per commitment | Created during project site provisioning | Compliance-sensitive; confidential business | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. 21 fields (P1-A1). |
| buyout | subcontract_checklist_item | Subcontract Checklist Items | `SubcontractChecklistItems` | List | Project Site | Individual checklist requirement line items | Checklist item | SubcontractChecklists (checklist_record_id FK) | record_id, checklist_record_id, requirement_name, item_state | ChecklistItemStates, ChecklistRequirements (domain-local) | — | None | Index: checklist_record_id; ~19 items per checklist | Created during project site provisioning | Compliance-sensitive | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. 8 fields (P1-A1). |
| buyout | compliance_waiver_request | Compliance Waiver Requests | `ComplianceWaiverRequests` | List | Project Site | Insurance and licensing waiver requests with approval chain | Waiver request | BuyoutCommitments (commitment_id FK) | record_id, commitment_id, subcontractor_or_vendor_name | WaiverLevels (domain-local) | — | Major versions | Index: commitment_id; low volume per project | Created during project site provisioning | Compliance-sensitive; audit retention; approval fields privileged/admin | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. 35 fields (P1-A1). Approval pattern: 3-tier. |
| buyout | everify_tracking_record | E-Verify Tracking | `EVerifyTracking` | List | Project Site | E-Verify affidavit compliance tracking per subcontract | E-Verify record | BuyoutCommitments (commitment_id FK) | record_id, commitment_id, contract_number, everify_status | EVerifyStatuses (domain-local) | — | Major versions | Index: commitment_id, everify_status; one per commitment | Created during project site provisioning | Compliance-sensitive; audit retention | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. 14 fields (P1-A1). |

#### 5. Schedule (P1-A4)

| Domain | Entity | Logical Container Name | Physical Container Name | Container Type | Scope | Purpose | Primary Record Type | Parent / Related Container | Key Columns / Required Fields | Lookup / Join Dependencies | Document Pairing Pattern | Versioning Requirement | Indexing / Scale Notes | Provisioning Requirement | Security / Visibility Notes | Related Adapter / Package Owner | Notes |
|--------|--------|------------------------|-------------------------|----------------|-------|---------|--------------------|-----------------------------|-------------------------------|---------------------------|--------------------------|------------------------|------------------------|--------------------------|----------------------------|--------------------------------|-------|
| schedule | schedule_import_batch | Schedule Import Batches | `ScheduleImportBatches` | List | Project Site | Schedule file upload tracking and import provenance | Import batch | ProjectMaster (project_id FK) | batch_id, project_id, detected_format, import_status | — | — | Major versions | Index: project_id, import_status; low volume | Created during project site provisioning | Project team scoped | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. P1-A4 governs 16 canonical entities. |
| schedule | schedule_activity | Schedule Activities | `ScheduleActivities` | List | Project Site | Canonical normalized schedule activities from CSV/XML/XER imports | Activity item | ScheduleImportBatches (batch_id FK) | record_id, batch_id, activity_code, activity_name | schedule_wbs_node, schedule_calendar | — | None | Index: batch_id, activity_code; potentially thousands per import | Created during project site provisioning | Project team scoped | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. Primary canonical entity from P1-A4. |
| schedule | _raw uploads_ | Schedule Uploads Library | `ScheduleUploadsLib` | Document Library | Project Site | Raw uploaded schedule files (CSV, XML, XER) retained for provenance | Schedule file | ProjectMaster (project_id FK) | file name, detected_format, upload_date | — | Paired with ScheduleImportBatches | Major versions | Low volume; file-level storage | Created during project site provisioning | Project team scoped | @hbc/data-access | Build-ready. CT: `HBDocumentItem`. Immutable raw files per P1-A4 Layer 1. |

**Canonical-to-Physical Reconciliation — Schedule (P1-A4 → A3)**

P1-A4 defines 16 canonical entities across a 4-layer ingestion pipeline. A3 implements 3 physical SharePoint containers. This is an intentional Phase 1 compression: the canonical model supports full multi-format schedule normalization, while the physical model prioritizes user-facing activity data and raw file provenance. Parser-stage intermediate structures and operational audit records are handled outside SharePoint.

| P1-A4 Canonical Entity | A3 Physical Disposition | Rationale |
|------------------------|------------------------|-----------|
| `schedule_import_batch` | **`ScheduleImportBatches`** (dedicated list) | User-visible import history; dedicated container justified |
| `schedule_activity` | **`ScheduleActivities`** (dedicated list) | Primary user-facing entity; dedicated container justified |
| `schedule_project` | Flattened into `ScheduleImportBatches` | One project per import batch; project metadata stored as batch fields |
| `schedule_calendar` | Flattened into `ScheduleActivities` (`calendarId` FK field) | Calendar identity preserved as reference field on activity records; full calendar definitions are parser-stage data |
| `schedule_wbs_node` | Flattened into `ScheduleActivities` (`wbsId`, `activityCode` fields) | WBS hierarchy preserved as reference fields; separate WBS list deferred — flat activity queries sufficient for Phase 1 |
| `schedule_relationship` | Flattened into `ScheduleActivities` (predecessor/successor data in `sourceExtrasJson`) | Relationship data preserved in source extras JSON; separate relationship list deferred to Phase 2 when CPM visualization is implemented |
| `schedule_resource` | Not implemented as Phase 1 SharePoint container | Resource definitions are parser-stage reference data; not user-facing in Phase 1 |
| `schedule_resource_rate` | Not implemented as Phase 1 SharePoint container | Rate tables are parser-stage data |
| `schedule_assignment` | Not implemented as Phase 1 SharePoint container | Resource assignments deferred; activity-level is sufficient for Phase 1 |
| `schedule_baseline` | Flattened into `ScheduleActivities` (baseline date fields) | Primary baseline dates stored as activity fields; multi-baseline child records deferred |
| `schedule_code_type` | Not implemented as Phase 1 SharePoint container | Code type definitions are parser-stage reference data |
| `schedule_code_value` | Not implemented as Phase 1 SharePoint container | Code values are parser-stage reference data |
| `schedule_activity_code_assignment` | Not implemented as Phase 1 SharePoint container | Code assignments deferred; activity-level classification sufficient for Phase 1 |
| `schedule_udf_definition` | Not implemented as Phase 1 SharePoint container | UDF definitions are parser-stage metadata |
| `schedule_udf_value` | Preserved in `ScheduleActivities` (`sourceExtrasJson`) | UDF values captured in source extras JSON for provenance |
| `import_finding` | **Non-SharePoint** (Azure Table Storage) | Operational audit; documented in Non-SharePoint Entities registry |
| Raw uploaded files | **`ScheduleUploadsLib`** (dedicated document library) | Immutable source file provenance; dedicated library justified |
| Mapping/provenance/drift records | **Non-SharePoint** (Azure Table Storage) | Operational state; documented in Non-SharePoint Entities registry |

**Compression justification:** Phase 1 schedule data consumption is activity-centric — users query activities by project, filter by status/dates, and view in list/timeline views. Full relational normalization (separate WBS tree, relationship table, resource table, code assignment table) adds significant container overhead without proportional Phase 1 user value. The canonical model in P1-A4 remains authoritative for parser/adapter design; the physical model here optimizes for SharePoint query patterns and list view threshold management.

#### 6. External Financial (P1-A6)

| Domain | Entity | Logical Container Name | Physical Container Name | Container Type | Scope | Purpose | Primary Record Type | Parent / Related Container | Key Columns / Required Fields | Lookup / Join Dependencies | Document Pairing Pattern | Versioning Requirement | Indexing / Scale Notes | Provisioning Requirement | Security / Visibility Notes | Related Adapter / Package Owner | Notes |
|--------|--------|------------------------|-------------------------|----------------|-------|---------|--------------------|-----------------------------|-------------------------------|---------------------------|--------------------------|------------------------|------------------------|--------------------------|----------------------------|--------------------------------|-------|
| financial | budget_line | Budget Lines | `BudgetLines` | List | Project Site | Canonical Procore budget line items with parsed dimensions and 14 financial metrics | Budget line | ProjectMaster (project_id FK) | line_id, batch_id, project_id, budget_code | — | — | Major versions | Index: batch_id, project_id, budget_code; ~100–500 lines per import | Created during project site provisioning | Restricted list — Financial Domain Team group | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. P1-A6 governs 4 canonical entities. Snapshot-append model. |
| financial | budget_import_batch | Budget Import Batches | `BudgetImportBatches` | List | Project Site | Import batch tracking for Procore budget file uploads | Import batch | ProjectMaster (project_id FK) | batchId, projectId, sourceSystem, importStatus | — | — | Major versions | Index: projectId, importStatus; low volume | Created during project site provisioning | Restricted list — Financial Domain Team group | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. P1-A6 governs. SharePoint for user-visible import history. |
| financial | _budget uploads_ | Budget Uploads Library | `BudgetUploadsLib` | Document Library | Project Site | Raw uploaded Procore budget CSV files retained for provenance | Budget file | ProjectMaster (project_id FK) | file name, upload_date, source_system | — | Paired with BudgetImportBatches (batch_id) | Major versions | Low volume | Created during project site provisioning | Restricted list — Financial Domain Team group | @hbc/data-access | Build-ready. CT: `HBDocumentItem`. Raw source files. |

#### 7. Operational Register (P1-A7)

| Domain | Entity | Logical Container Name | Physical Container Name | Container Type | Scope | Purpose | Primary Record Type | Parent / Related Container | Key Columns / Required Fields | Lookup / Join Dependencies | Document Pairing Pattern | Versioning Requirement | Indexing / Scale Notes | Provisioning Requirement | Security / Visibility Notes | Related Adapter / Package Owner | Notes |
|--------|--------|------------------------|-------------------------|----------------|-------|---------|--------------------|-----------------------------|-------------------------------|---------------------------|--------------------------|------------------------|------------------------|--------------------------|----------------------------|--------------------------------|-------|
| operations | register_record | Operational Register | `OperationalRegister` | List | Project Site | Hybrid register: risk, constraint, issue, action, delay subtypes | Register record | ProjectMaster (project_id FK) | record_id, project_id, record_type, category, completion_status | RegisterCategories, RegisterBICTeams (domain-local) | — | Major versions | Index: project_id, record_type, completion_status, category; moderate volume | Created during project site provisioning | Project team scoped | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. P1-A7 governs 4 entities + delay subtype. |

#### 8. Estimating Kickoff (P1-A8)

| Domain | Entity | Logical Container Name | Physical Container Name | Container Type | Scope | Purpose | Primary Record Type | Parent / Related Container | Key Columns / Required Fields | Lookup / Join Dependencies | Document Pairing Pattern | Versioning Requirement | Indexing / Scale Notes | Provisioning Requirement | Security / Visibility Notes | Related Adapter / Package Owner | Notes |
|--------|--------|------------------------|-------------------------|----------------|-------|---------|--------------------|-----------------------------|-------------------------------|---------------------------|--------------------------|------------------------|------------------------|--------------------------|----------------------------|--------------------------------|-------|
| estimating | kickoff_instance | Kickoff Instances | `KickoffInstances` | List | Project Site | Project-level estimating kickoff instances with header snapshot fields | Kickoff instance | ProjectMaster (project_id FK) | instance_id, project_id, template_id, status | Shared_KickoffTemplates (hub) | — | Major versions | Index: project_id, status; low volume (one per pursuit) | Created during project site provisioning | Project team scoped | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. P1-A8 governs 7 entities. |
| estimating | kickoff_row | Kickoff Rows | `KickoffRows` | List | Project Site | Child rows: tasks, milestones, deliverables with subtype behavior | Kickoff row | KickoffInstances (instance_id FK) | row_id, instance_id, row_type, section, status_code | — | — | Major versions | Index: instance_id, row_type, status_code; ~50–70 rows per instance | Created during project site provisioning | Project team scoped | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. 3 row subtypes (task/milestone/deliverable). |

#### 9. Permits & Inspections (P1-A9)

| Domain | Entity | Logical Container Name | Physical Container Name | Container Type | Scope | Purpose | Primary Record Type | Parent / Related Container | Key Columns / Required Fields | Lookup / Join Dependencies | Document Pairing Pattern | Versioning Requirement | Indexing / Scale Notes | Provisioning Requirement | Security / Visibility Notes | Related Adapter / Package Owner | Notes |
|--------|--------|------------------------|-------------------------|----------------|-------|---------|--------------------|-----------------------------|-------------------------------|---------------------------|--------------------------|------------------------|------------------------|--------------------------|----------------------------|--------------------------------|-------|
| compliance | permit_record | Permits | `Permits` | List | Project Site | Construction permit lifecycle tracking with authority contacts | Permit item | ProjectMaster (project_id FK) | record_id, project_id, permit_number, permit_status | PermitTypes (domain-local) | — | Major versions | Index: project_id, permit_number, permit_status; moderate volume | Created during project site provisioning | Project team scoped | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. P1-A9 governs 7 entities. |
| compliance | permit_inspection | Permit Inspections | `PermitInspections` | List | Project Site | Inspection records with results, compliance scores, and inspector contacts | Inspection item | Permits (permit_id FK) | inspection_id, permit_id, inspection_type, result | — | — | Major versions | Index: permit_id; child records | Created during project site provisioning | Project team scoped | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. Child of permit_record. |

#### 10. Project Lifecycle Checklists (P1-A10)

| Domain | Entity | Logical Container Name | Physical Container Name | Container Type | Scope | Purpose | Primary Record Type | Parent / Related Container | Key Columns / Required Fields | Lookup / Join Dependencies | Document Pairing Pattern | Versioning Requirement | Indexing / Scale Notes | Provisioning Requirement | Security / Visibility Notes | Related Adapter / Package Owner | Notes |
|--------|--------|------------------------|-------------------------|----------------|-------|---------|--------------------|-----------------------------|-------------------------------|---------------------------|--------------------------|------------------------|------------------------|--------------------------|----------------------------|--------------------------------|-------|
| compliance | checklist_family_instance | Lifecycle Checklists | `LifecycleChecklists` | List | Project Site | Unified startup/safety/closeout checklist instances and items | Checklist item | ProjectMaster (project_id FK) | checklist_id, instance_id, item_id, checklist_family, canonical_outcome | Shared_ChecklistTemplates (hub), ChecklistFamilies (domain-local) | — | Major versions | Index: project_id, checklist_family, canonical_outcome; moderate volume | Created during project site provisioning | Project team scoped | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. P1-A10 governs 8 entities. 3 families. |

**Canonical-to-Physical Reconciliation — Project Lifecycle Checklists (P1-A10 → A3)**

P1-A10 defines 8 canonical entities supporting 3 checklist families (startup, safety, closeout) with template governance. A3 implements 1 shared hub-site template list + 1 project-site checklist list. This is an intentional Phase 1 compression: the canonical model separates template, instance, section, item, and evidence concerns into distinct entities; the physical model flattens the project-side execution hierarchy into a single list with discriminator fields.

| P1-A10 Canonical Entity | A3 Physical Disposition | Rationale |
|------------------------|------------------------|-----------|
| `lifecycle_checklist_template` | **`Shared_ChecklistTemplates`** (hub-site shared list) | Template identity stored as rows with `templateId` field; shared across all project sites |
| `lifecycle_checklist_template_item` | **`Shared_ChecklistTemplates`** (hub-site shared list) | Template items are rows in the same shared list, distinguished by `templateItemId`, `sectionNumber`, `itemNumber` |
| `project_lifecycle_checklist` | Flattened into **`LifecycleChecklists`** (project-site list) | Aggregate container identity represented by `checklistId` field; one per project — does not need a separate list |
| `project_checklist_family_instance` | Flattened into **`LifecycleChecklists`** | Family instances distinguished by `instanceId` + `checklistFamily` fields; each row carries its family identity |
| `checklist_section` | Flattened into **`LifecycleChecklists`** | Section identity represented by `sectionNumber` + `sectionLabel` fields on each item row; no separate section list needed |
| `checklist_item` | **`LifecycleChecklists`** (project-site list) | The primary physical record — each row is one checklist item with outcome, notes, dates, and evidence reference |
| `checklist_evidence_link` | Embedded as `currentEvidenceRef` field on `LifecycleChecklists` | Phase 1 uses a single evidence reference field per item; separate Evidence Link child list deferred to Phase 2 |
| `checklist_import_batch` | **Non-SharePoint** (Azure Table Storage) | Operational state; batch ID referenced via `sourceBatchId` on checklist items |

**Compression justification:** The physical `LifecycleChecklists` list stores one row per checklist item, with aggregate container, family instance, and section identity carried as discriminator fields (`checklistId`, `instanceId`, `checklistFamily`, `sectionNumber`, `sectionLabel`) on each row. This flat-list approach supports all three families (startup/safety/closeout) in a single list with SharePoint filtered views by family. The canonical hierarchy (container → family instance → section → item) is preserved logically via these fields and can be reconstructed for display, but does not require separate physical lists for Phase 1 query patterns. Template governance is separated onto the hub site (`Shared_ChecklistTemplates`) because templates are shared across all projects.

**Family support in the unified list:**
- Rows with `checklistFamily = 'startup'` → startup checklist items with `N/A / Yes / No` outcomes mapped to `complete / incomplete / not_applicable`
- Rows with `checklistFamily = 'safety'` → safety checklist items with `Pass / Fail / N/A` outcomes mapped to `pass / fail / not_applicable`
- Rows with `checklistFamily = 'closeout'` → closeout checklist items with `N/A / Yes / No` outcomes mapped to `complete / incomplete / not_applicable`

#### 11. Responsibility Matrix (P1-A11)

| Domain | Entity | Logical Container Name | Physical Container Name | Container Type | Scope | Purpose | Primary Record Type | Parent / Related Container | Key Columns / Required Fields | Lookup / Join Dependencies | Document Pairing Pattern | Versioning Requirement | Indexing / Scale Notes | Provisioning Requirement | Security / Visibility Notes | Related Adapter / Package Owner | Notes |
|--------|--------|------------------------|-------------------------|----------------|-------|---------|--------------------|-----------------------------|-------------------------------|---------------------------|--------------------------|------------------------|------------------------|--------------------------|----------------------------|--------------------------------|-------|
| operations | project_responsibility_instance | Responsibility Matrices | `ResponsibilityMatrices` | List | Project Site | Project-level responsibility matrix instances (PM/Field/Owner Contract) | Matrix instance | ProjectMaster (project_id FK) | instance_id, project_id, family_id, template_id | Shared_ResponsibilityTemplates (hub) | — | Major versions | Index: project_id, family_id; low volume (1–3 per project) | Created during project site provisioning | Project team scoped | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. P1-A11 governs 10 entities. |
| operations | responsibility_assignment | Responsibility Assignments | `ResponsibilityAssignments` | List | Project Site | Normalized intersection records (item × role × assignment value) | Assignment record | ResponsibilityMatrices (instance_id FK) | assignment_id, item_instance_id, role_party_id, value_code | — | — | None | Index: item_instance_id; ~200–400 assignments per matrix | Created during project site provisioning | Project team scoped | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. Canonical junction records. |

#### 12. Subcontractor Scorecard (P1-A12)

| Domain | Entity | Logical Container Name | Physical Container Name | Container Type | Scope | Purpose | Primary Record Type | Parent / Related Container | Key Columns / Required Fields | Lookup / Join Dependencies | Document Pairing Pattern | Versioning Requirement | Indexing / Scale Notes | Provisioning Requirement | Security / Visibility Notes | Related Adapter / Package Owner | Notes |
|--------|--------|------------------------|-------------------------|----------------|-------|---------|--------------------|-----------------------------|-------------------------------|---------------------------|--------------------------|------------------------|------------------------|--------------------------|----------------------------|--------------------------------|-------|
| operations | scorecard_evaluation | Subcontractor Scorecards | `SubcontractorScorecards` | List | Project Site | Per-project per-subcontractor performance evaluations | Evaluation item | ProjectMaster (project_id FK), BuyoutCommitments (subcontractor linkage) | evaluation_id, project_id, subcontractor_display_name, official_final_flag | Shared_ScorecardRubrics (hub) | — | Major versions | Index: project_id, subcontractor_key, official_final_flag; low-moderate volume | Created during project site provisioning | Restricted list — Financial Domain Team group | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. P1-A12 governs 12 entities. |
| operations | criterion_score_record | Scorecard Criterion Scores | `ScorecardCriterionScores` | List | Project Site | Per-criterion scoring detail for subcontractor evaluations | Criterion score | SubcontractorScorecards (evaluation_id FK) | score_record_id, evaluation_id, criterion_id, score_raw | — | — | None | Index: evaluation_id; ~29 child records per evaluation | Created during project site provisioning | Inherits evaluation visibility | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. Canonical scoring detail. |

#### 13. Lessons Learned (P1-A13)

| Domain | Entity | Logical Container Name | Physical Container Name | Container Type | Scope | Purpose | Primary Record Type | Parent / Related Container | Key Columns / Required Fields | Lookup / Join Dependencies | Document Pairing Pattern | Versioning Requirement | Indexing / Scale Notes | Provisioning Requirement | Security / Visibility Notes | Related Adapter / Package Owner | Notes |
|--------|--------|------------------------|-------------------------|----------------|-------|---------|--------------------|-----------------------------|-------------------------------|---------------------------|--------------------------|------------------------|------------------------|--------------------------|----------------------------|--------------------------------|-------|
| operations | lessons_report_instance | Lessons Learned Reports | `LessonsReports` | List | Project Site | One-per-project lessons learned report with header and classification metadata | Report instance | ProjectMaster (project_id FK) | report_id, project_id, report_date, market_sector, delivery_method | — | — | Major versions | Index: project_id; one per project | Created during project site provisioning | Project team scoped | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. P1-A13 governs 8 entities. |
| operations | lesson_record | Lesson Records | `LessonRecords` | List | Project Site | Individual lesson records — the canonical search/reporting unit | Lesson record | LessonsReports (report_id FK) | lesson_id, report_id, category_key, applicability_score | LessonCategories, LessonImpactMagnitudes (hub dictionaries) | — | Major versions | Index: report_id, category_key, applicability_score; ~5–15 per report | Created during project site provisioning | Project team scoped | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. 5 structured narrative fields + composed narrative. |

#### 14. Leads & Pipeline (P1-A14)

| Domain | Entity | Logical Container Name | Physical Container Name | Container Type | Scope | Purpose | Primary Record Type | Parent / Related Container | Key Columns / Required Fields | Lookup / Join Dependencies | Document Pairing Pattern | Versioning Requirement | Indexing / Scale Notes | Provisioning Requirement | Security / Visibility Notes | Related Adapter / Package Owner | Notes |
|--------|--------|------------------------|-------------------------|----------------|-------|---------|--------------------|-----------------------------|-------------------------------|---------------------------|--------------------------|------------------------|------------------------|--------------------------|----------------------------|--------------------------------|-------|
| leads | market_lead + market_lead_tag | Market Leads | `MarketLeads` | List | Sales/BD Site | Individual market leads with classification tags | Lead record + tag child records | — | lead_id, lead_title, sector, region, lead_source | — | — | Major versions | Index: lead_id, sector, region, lead_status; moderate volume | Created during Sales/BD site setup | BD team scoped | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. P1-A14 governs schema. Tags as child records. |
| leads | pipeline_snapshot | Pipeline Snapshots | `PipelineSnapshots` | List | Sales/BD Site | Division-level pipeline health snapshots with aggregate stage/outcome data | Snapshot record | — | snapshot_id, division, snapshot_date, pipeline_value | — | — | Major versions | Index: snapshot_id, division, snapshot_date; low volume (periodic snapshots) | Created during Sales/BD site setup | BD team scoped | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. P1-A14 governs schema. Stages/wins/losses stored as JSON text fields. |

#### 15. Prime Contracts (P1-A15)

| Domain | Entity | Logical Container Name | Physical Container Name | Container Type | Scope | Purpose | Primary Record Type | Parent / Related Container | Key Columns / Required Fields | Lookup / Join Dependencies | Document Pairing Pattern | Versioning Requirement | Indexing / Scale Notes | Provisioning Requirement | Security / Visibility Notes | Related Adapter / Package Owner | Notes |
|--------|--------|------------------------|-------------------------|----------------|-------|---------|--------------------|-----------------------------|-------------------------------|---------------------------|--------------------------|------------------------|------------------------|--------------------------|----------------------------|--------------------------------|-------|
| contracts | prime_contract | Prime Contracts | `PrimeContracts` | List | Project Site | Owner-facing prime contract records with financial tracking, lifecycle status, and contact snapshots | Contract record | ProjectMaster (project_id FK) | contract_id, contract_number, project_id, contract_status, original_contract_amount | — | None in Phase 1; document library deferred to Phase 2 | Major versions | Index: contract_id, contract_number, contract_status, erp_status; low volume (typically 1 per project) | Created during project site provisioning | Restricted list — Financial Domain Team group; `is_private` flag for supplemental adapter-layer control | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. P1-A15 governs schema. Single list (no paired library) — source has no attachments. |

### Deferred / Future-Wave Placeholders

The following domain does not yet have a complete logical entity model in the Phase 1 schema set. It remains a placeholder until a dedicated schema artifact is completed.

| Domain | Entity | Logical Container Name | Physical Container Name | Container Type | Scope | Purpose | Notes |
|--------|--------|------------------------|-------------------------|----------------|-------|---------|-------|
| pmp | _pending_ | PMP Index List + PMP Library | _deferred_ | Paired (List + Library) | Project Site | Project management plan documents with structured index | No dedicated schema artifact yet |

### Platform and Infrastructure Containers (Wave 3+)

Platform containers for auth, provisioning state, audit log, and project identity mapping are **not SharePoint containers** — they live in Azure Table Storage or Microsoft Graph / Entra ID. They are documented in P1-A1 and P1-A2 but are out of scope for this register.

---

## Container Appendices — Physical Schema Definitions

Each appendix follows the standard 12-point sequence. All containers inherit shared site columns from `HBBaseListItem` (recordId, projectId, createdAt, updatedAt, createdBy, isActive, notes, sourceBatchId, sourceRowNumber) unless noted otherwise. Only domain-specific columns are listed below.

### Non-SharePoint Canonical Entities

The following entities are part of the Phase 1 canonical domain model but are **NOT physically implemented as SharePoint lists or libraries**. They are listed here explicitly so A3 is clear about what it does and does not contain.

#### Azure Table Storage — Import Findings (all domains)

Import findings (parse errors, validation warnings, derivation mismatches) are operational audit records stored in Azure Table Storage per P1-A1/A2 storage boundary.

| Entity | Governing Schema | Storage | Phase 1 Handling |
|--------|-----------------|---------|-----------------|
| `schedule_import_finding` | P1-A4 `import_finding` | Azure Table Storage | Operational audit; not in SharePoint |
| `budget_import_finding` | P1-A6 `budget_import_finding` | Azure Table Storage | Operational audit; not in SharePoint |
| `register_import_finding` | P1-A7 `register_import_finding` | Azure Table Storage | Operational audit; not in SharePoint |
| `permit_import_finding` | P1-A9 `permit_import_finding` | Azure Table Storage | Operational audit; not in SharePoint |
| `checklist_import_finding` | P1-A10 (implied) | Azure Table Storage | Operational audit; not in SharePoint |
| `scorecard_import_finding` | P1-A12 `scorecard_import_finding` | Azure Table Storage | Operational audit; not in SharePoint |
| `lessons_import_finding` | P1-A13 `lessons_import_finding` | Azure Table Storage | Operational audit; not in SharePoint |
| `kickoff_import_finding` | P1-A8 (implied) | Azure Table Storage | Operational audit; not in SharePoint |

#### Azure Table Storage — Import Batch Metadata (domains without SharePoint batch lists)

Schedule and budget domains have dedicated SharePoint batch lists (`ScheduleImportBatches`, `BudgetImportBatches`). The following domains track batch metadata only via the `sourceBatchId` field on their respective SharePoint lists, with full batch records in Azure Table Storage.

| Entity | Governing Schema | Storage | Phase 1 Handling |
|--------|-----------------|---------|-----------------|
| `register_import_batch` | P1-A7 | Azure Table Storage | Batch ID referenced via `sourceBatchId` on `OperationalRegister` |
| `permit_import_batch` | P1-A9 | Azure Table Storage | Batch ID referenced via `sourceBatchId` on `Permits` |
| `checklist_import_batch` | P1-A10 | Azure Table Storage | Batch ID referenced via `sourceBatchId` on `LifecycleChecklists` |
| `scorecard_import_batch` | P1-A12 | Azure Table Storage | Batch ID referenced via `sourceBatchId` on `SubcontractorScorecards` |
| `lessons_import_batch` | P1-A13 | Azure Table Storage | Batch ID referenced via `sourceBatchId` on `LessonsReports` |
| `responsibility_import_batch` | P1-A11 | Azure Table Storage | Batch ID referenced via `sourceBatchId` on `ResponsibilityMatrices` |
| `kickoff_import_batch` | P1-A8 | Azure Table Storage | Batch ID referenced via `sourceBatchId` on `KickoffInstances` |

#### Azure Table Storage — Mapping / Provenance / Drift Records

| Entity | Governing Schema | Storage | Phase 1 Handling |
|--------|-----------------|---------|-----------------|
| `schedule_mapping_record` | P1-A4 Layer 4 | Azure Table Storage | Source-to-canonical field mapping provenance |
| `budget_line_external_mapping` | P1-A6 | Azure Table Storage | Budget line → cost code / CSI / commitment mappings |
| `register_record_external_mapping` | P1-A7 | Azure Table Storage | Register record → schedule / cost / compliance linkage |
| `cost_code_external_mapping` | P1-A5 | Azure Table Storage | Cost code → Sage / ERP / Procore mappings (Phase 4+) |
| `csi_code_external_mapping` | P1-A5 | Azure Table Storage | CSI code → cost code cross-mappings |
| `cost_code_import_batch` | P1-A5 | Azure Table Storage | Dictionary import provenance |
| `csi_code_import_batch` | P1-A5 | Azure Table Storage | Dictionary import provenance |

#### Phase 2 Deferred Child Entities (not yet in any storage)

These entities are defined in their governing schemas but are deferred to Phase 2 as separate SharePoint lists. In Phase 1, their function is served by inline fields on parent records.

| Entity | Governing Schema | Phase 1 Inline Alternative | Phase 2 Target |
|--------|-----------------|---------------------------|----------------|
| `kickoff_note` | P1-A8 | `notesSummary` on `KickoffRows` | Separate child list for timestamped comment history |
| `kickoff_evidence_link` | P1-A8 | `currentEvidenceRef` on `KickoffRows` | Separate child list for multi-artifact evidence |
| `permit_condition` | P1-A9 | `conditionsRaw` JSON on `Permits` | Separate child list for structured conditions |
| `permit_tag` | P1-A9 | `tagsRaw` JSON on `Permits` | Separate child list for normalized tags |
| `permit_inspection_issue` | P1-A9 | `issuesRaw` JSON on `PermitInspections` | Separate child list for structured issues |
| `lesson_keyword` | P1-A13 | `keywordsRaw` on `LessonRecords` | Separate child list for normalized keywords |
| `lesson_linked_reference` | P1-A13 | `supportingReferenceText` on `LessonRecords` | Separate child list for structured linked refs |
| `csi_code_description_variant` | P1-A5 | Variant count tracked; primary description on `Shared_CSICodes` | Separate child list for one-to-many description variants |
| `scorecard_approval` | P1-A12 | Approval fields inline on `SubcontractorScorecards` (future) | Separate child list using Approval pattern |
| `scorecard_recommendation` | P1-A12 | Recommendation/narrative fields inline on `SubcontractorScorecards` | May remain inline or become child record |
| `section_score_summary` / `overall_score_summary` | P1-A12 | Derived values computed from criterion scores; may be stored inline | Separate summary records using Summary pattern |

### A.1 — Shared Dictionaries (Hub Site)

All shared dictionary lists use content type `HBDictionaryItem`, are provisioned during hub site setup, use major versioning, and inherit hub site permissions. Governing schemas are in P1-A5 unless noted.

#### A.1.1 `Shared_CostCodes`

| # | Property | Value |
|---|----------|-------|
| 1 | Scope | Hub Site |
| 2 | Container Type | List |
| 3 | Physical Name | `Shared_CostCodes` |
| 4 | Content Type | `HBDictionaryItem` |
| 5 | Required Columns | `csiCode` (Text), `description` (Text), `stage` (Text), `divisionCode` (Text), `subgroupCode` (Text), `detailCode` (Text), `isActive` (Yes/No) |
| 6 | Optional Columns | `sortOrder` (Number), `effectiveStart` (Date), `effectiveEnd` (Date), `supersededByCode` (Text), `isDeprecated` (Yes/No), `notes` (Multi-line) |
| 7 | Lookups | — |
| 8 | Indexes | `csiCode` (unique), `stage`, `divisionCode` |
| 9 | Versioning | Major versions |
| 10 | Security | Hub site inherited; project-site consumers resolve via adapter layer (no cross-site lookup columns) |
| 11 | Provisioning | Created during hub site setup; populated from CSV import |
| 12 | Governing Schema | P1-A5 Cost Code Dictionary (7,565 codes, DD-SS-DDD format) |

#### A.1.2 `Shared_CSICodes`

| # | Property | Value |
|---|----------|-------|
| 1 | Scope | Hub Site |
| 2 | Container Type | List |
| 3 | Physical Name | `Shared_CSICodes` |
| 4 | Content Type | `HBDictionaryItem` |
| 5 | Required Columns | `csiCode` (Text), `csiCodeCompact` (Text), `primaryDescription` (Text), `divisionCode` (Text), `sectionGroup` (Text), `sectionNumber` (Text), `hierarchyLevel` (Number), `isActive` (Yes/No) |
| 6 | Optional Columns | `rawPrimaryDescription` (Text), `parentCodeId` (Text), `variantCount` (Number), `masterformatEdition` (Text), `sortOrder` (Number), `notes` (Multi-line) |
| 7 | Lookups | `parentCodeId` → self (Shared_CSICodes) for hierarchy traversal |
| 8 | Indexes | `csiCode` (unique), `divisionCode`, `hierarchyLevel` |
| 9 | Versioning | Major versions |
| 10 | Security | Hub site inherited |
| 11 | Provisioning | Created during hub site setup; populated from CSV import |
| 12 | Governing Schema | P1-A5 CSI Code Dictionary (~6,633 codes, DD SS SS format, one-to-many description variants) |

#### A.1.3 `Shared_ProjectTypes` through `Shared_Sectors`

These 7 dictionaries (ProjectTypes, ProjectStages, ProjectRegions, StateCodes, CountryCodes, DeliveryMethods, Sectors) share the Simple Reference Dictionary pattern defined in P1-A5.

| # | Property | Common Value |
|---|----------|-------------|
| 1 | Scope | Hub Site |
| 2 | Container Type | List |
| 3 | Physical Name | `Shared_{DictionaryName}` |
| 4 | Content Type | `HBDictionaryItem` |
| 5 | Required Columns | `{code}` (Text), `{displayName}` (Text), `isActive` (Yes/No) |
| 6 | Optional Columns | `sortOrder` (Number), `description` (Multi-line) |
| 7 | Lookups | — |
| 8 | Indexes | `{code}` (unique) |
| 9 | Versioning | Major versions |
| 10 | Security | Hub site inherited |
| 11 | Provisioning | Created during hub site setup |
| 12 | Governing Schema | P1-A5 Simple Reference Dictionary pattern |

#### A.1.4 `Shared_ScorecardRubrics`

| # | Property | Value |
|---|----------|-------|
| 1 | Scope | Hub Site |
| 2 | Container Type | List |
| 3 | Physical Name | `Shared_ScorecardRubrics` |
| 4 | Content Type | `HBDictionaryItem` |
| 5 | Required Columns | `templateId` (Text), `versionId` (Text), `sectionId` (Text), `sectionLabel` (Text), `sectionWeightPct` (Number), `criterionId` (Text), `criterionLabel` (Text), `criterionWeight` (Number), `displayOrder` (Number), `isActive` (Yes/No) |
| 6 | Optional Columns | `scoringGuidance` (Multi-line), `allowsNa` (Yes/No), `isCurrent` (Yes/No), `versionNumber` (Number), `effectiveDate` (Date) |
| 7 | Lookups | — |
| 8 | Indexes | `templateId`, `versionId`, `sectionId` |
| 9 | Versioning | Major versions |
| 10 | Security | Hub site inherited; managed by estimating/operations leadership |
| 11 | Provisioning | Created during hub site setup |
| 12 | Governing Schema | P1-A12 (6 sections, 29 criteria, 1-5 scale) |

#### A.1.5 `Shared_KickoffTemplates`

| # | Property | Value |
|---|----------|-------|
| 1 | Scope | Hub Site |
| 2 | Container Type | List |
| 3 | Physical Name | `Shared_KickoffTemplates` |
| 4 | Content Type | `HBDictionaryItem` |
| 5 | Required Columns | `templateItemId` (Text), `templateId` (Text), `section` (Text), `itemName` (Text), `rowType` (Choice: task/milestone/deliverable), `displayOrder` (Number), `isActive` (Yes/No) |
| 6 | Optional Columns | `sectionLabel` (Text), `groupLabel` (Text), `defaultApplicable` (Yes/No), `defaultResponsibleType` (Text), `defaultResponsibleDisplay` (Text), `defaultTabRequired` (Yes/No), `dateRuleType` (Text), `dateRuleExpression` (Text) |
| 7 | Lookups | — |
| 8 | Indexes | `templateItemId`, `templateId`, `section` |
| 9 | Versioning | Major versions |
| 10 | Security | Hub site inherited; managed by estimating leadership |
| 11 | Provisioning | Created during hub site setup |
| 12 | Governing Schema | P1-A8 (4 sections, 3 row subtypes, ~50-70 template items) |

#### A.1.6 `Shared_ChecklistTemplates`

| # | Property | Value |
|---|----------|-------|
| 1 | Scope | Hub Site |
| 2 | Container Type | List |
| 3 | Physical Name | `Shared_ChecklistTemplates` |
| 4 | Content Type | `HBDictionaryItem` |
| 5 | Required Columns | `templateItemId` (Text), `templateId` (Text), `checklistFamily` (Choice: startup/safety/closeout), `sectionNumber` (Number), `sectionLabel` (Text), `itemNumber` (Text), `itemName` (Text), `displayOrder` (Number), `defaultOutcomeOptions` (Text), `isActive` (Yes/No) |
| 6 | Optional Columns | `itemDetails` (Multi-line), `itemType` (Text), `evidenceExpected` (Yes/No) |
| 7 | Lookups | — |
| 8 | Indexes | `templateId`, `checklistFamily` |
| 9 | Versioning | Major versions |
| 10 | Security | Hub site inherited |
| 11 | Provisioning | Created during hub site setup |
| 12 | Governing Schema | P1-A10 (3 families, ~149 items across 13 sections) |

#### A.1.7 `Shared_ResponsibilityTemplates`

| # | Property | Value |
|---|----------|-------|
| 1 | Scope | Hub Site |
| 2 | Container Type | List |
| 3 | Physical Name | `Shared_ResponsibilityTemplates` |
| 4 | Content Type | `HBDictionaryItem` |
| 5 | Required Columns | `itemId` (Text), `templateId` (Text), `familyId` (Text), `sectionKey` (Text), `sectionLabel` (Text), `itemLabel` (Text), `displayOrder` (Number), `isActive` (Yes/No) |
| 6 | Optional Columns | `itemType` (Text), `articleNumber` (Text), `pageReference` (Text) |
| 7 | Lookups | — |
| 8 | Indexes | `templateId`, `familyId` |
| 9 | Versioning | Major versions |
| 10 | Security | Hub site inherited |
| 11 | Provisioning | Created during hub site setup |
| 12 | Governing Schema | P1-A11 (3 families: PM/Field/Owner Contract, ~200 items) |

### A.2 — Project / Intake

#### A.2.1 `ProjectMaster`

| # | Property | Value |
|---|----------|-------|
| 1 | Scope | Hub Site |
| 2 | Container Type | List |
| 3 | Physical Name | `ProjectMaster` |
| 4 | Content Type | `HBBaseListItem` |
| 5 | Required Columns | `projectId` (Number), `name` (Text), `displayName` (Text), `projectNumber` (Text), `active` (Yes/No), `projectStageId` (Number), `projectStageName` (Text), `version` (Number) |
| 6 | Optional Columns | `accountingProjectNumber` (Text), `description` (Multi-line), `workScope` (Text), `sector` (Text), `deliveryMethod` (Text), `squareFeet` (Number), `projectTypeId` (Number), `projectTypeName` (Text), `projectBidTypeId` (Number), `projectOwnerTypeId` (Number), `projectRegionId` (Number), `address` (Text), `city` (Text), `stateCode` (Text), `countryCode` (Text), `zip` (Text), `county` (Text), `latitude` (Number), `longitude` (Number), `timeZone` (Text), `startDate` (Date), `actualStartDate` (Date), `projectedFinishDate` (Date), `originalCompletionDate` (Date), `approvedCompletionDate` (Date), `completionDate` (Date), `duration` (Number), `approvedExtensions` (Number), `contractValue` (Number), `approvedChanges` (Number), `contingencyOriginal` (Number), `contingencyApproved` (Number), `estimatedValue` (Number), `totalValue` (Number), `isDemo` (Yes/No), `erpIntegrated` (Yes/No), `phone` (Text), `fax` (Text), `ownersProjectId` (Text), `originId` (Text), `originCode` (Text), `originData` (Multi-line), `parentJobId` (Number), `storeNumber` (Text), `photoId` (Number), `customFields` (Multi-line/JSON) |
| 7 | Lookups | `projectTypeId` → Shared_ProjectTypes, `projectStageId` → Shared_ProjectStages, `projectRegionId` → Shared_ProjectRegions, `stateCode` → Shared_StateCodes |
| 8 | Indexes | `projectId` (unique), `recordId` (unique), `projectNumber`, `active`, `projectStageName` |
| 9 | Versioning | Major versions |
| 10 | Security | Hub site permissions; project team scoped |
| 11 | Provisioning | Created during hub site provisioning |
| 12 | Governing Schema | P1-A1 Project entity (60 fields) |

#### A.2.2 `NewProjectRequests`

| # | Property | Value |
|---|----------|-------|
| 1 | Scope | Hub Site |
| 2 | Container Type | List |
| 3 | Physical Name | `NewProjectRequests` |
| 4 | Content Type | `HBBaseListItem` |
| 5 | Required Columns | `requestId` (Text), `requesterEmail` (Text), `projectName` (Text), `requestStatus` (Choice: Draft/Submitted/Under Review/Approved/Rejected/Provisioned), `managedInProcore` (Yes/No), `sourceFormName` (Text), `sourceFormVersion` (Text) |
| 6 | Optional Columns | `requestDate` (Date), `streetAddress` (Text), `cityStateRaw` (Text), `city` (Text), `stateCode` (Text), `zipCode` (Text), `county` (Text), `projectExecutiveName` (Text), `projectExecutiveAssignmentKey` (Text), `projectManagerName` (Text), `projectManagerAssignmentKey` (Text), `timberscanApproverName` (Text), `timberscanApproverAssignmentKey` (Text), `officeDivisionLabel` (Text), `officeDivisionCode` (Text), `officeName` (Text), `divisionName` (Text), `additionalSageAccessText` (Multi-line), `submittedAt` (DateTime), `reviewNotes` (Multi-line), `version` (Number) |
| 7 | Lookups | `stateCode` → Shared_StateCodes, `officeDivisionCode` → domain-local OfficeDivisions |
| 8 | Indexes | `requestId` (unique), `requestStatus` |
| 9 | Versioning | Major versions |
| 10 | Security | Restricted to project administration during review |
| 11 | Provisioning | Created during hub site provisioning |
| 12 | Governing Schema | P1-A1 new_project_request entity (32 fields) |

### A.3 — Estimating

#### A.3.1 `EstimatingPursuits`

| # | Property | Value |
|---|----------|-------|
| 1 | Scope | Project Site |
| 2 | Container Type | List |
| 3 | Physical Name | `EstimatingPursuits` |
| 4 | Content Type | `HBBaseListItem` |
| 5 | Required Columns | `projectId` (Text), `status` (Choice) |
| 6 | Optional Columns | `projectNumber` (Text), `projectName` (Text), `source` (Choice), `deliverable` (Choice), `leadEstimator` (Text), `contributors` (Multi-line), `px` (Text), `subBidsDue` (Date), `presubmissionReview` (Date), `winStrategyMeeting` (Date), `dueDateOutTheDoor` (Date), `checklist_bidBond` (Yes/No), `checklist_ppBond` (Yes/No), `checklist_schedule` (Yes/No), `checklist_logistics` (Yes/No), `checklist_bimProposal` (Yes/No), `checklist_preconProposal` (Yes/No), `checklist_proposalTabs` (Yes/No), `checklist_coordinateWithMarketing` (Yes/No) |
| 7 | Lookups | `source` → domain-local EstimateSources, `deliverable` → domain-local EstimateDeliverables, `status` → domain-local EstimateStatuses |
| 8 | Indexes | `recordId`, `projectId`, `status` |
| 9 | Versioning | Major versions |
| 10 | Security | Project team scoped |
| 11 | Provisioning | Created during project site provisioning |
| 12 | Governing Schema | P1-A1 estimating_pursuit entity (24 fields) |

#### A.3.2 `PreconEngagements`

| # | Property | Value |
|---|----------|-------|
| 1 | Scope | Project Site |
| 2 | Container Type | List |
| 3 | Physical Name | `PreconEngagements` |
| 4 | Content Type | `HBBaseListItem` |
| 5 | Required Columns | `projectId` (Text), `status` (Choice) |
| 6 | Optional Columns | `projectNumber` (Text), `projectName` (Text), `source` (Choice), `deliverable` (Choice), `leadEstimator` (Text), `px` (Text), `currentStage` (Choice), `preconBudget` (Number), `designBudget` (Number), `billedToDate` (Number), checklist booleans (8×Yes/No) |
| 7 | Lookups | `status` → EstimateStatuses, `currentStage` → PreconStages |
| 8 | Indexes | `recordId`, `projectId`, `status` |
| 9 | Versioning | Major versions |
| 10 | Security | Restricted list — Financial Domain Team group (see §Permissions) |
| 11 | Provisioning | Created during project site provisioning |
| 12 | Governing Schema | P1-A1 preconstruction_engagement entity (23 fields) |

#### A.3.3 `EstimateTracking`

| # | Property | Value |
|---|----------|-------|
| 1–4 | Standard | Project Site / List / `EstimateTracking` / `HBBaseListItem` |
| 5 | Required Columns | `projectId` (Text), `status` (Choice) |
| 6 | Optional Columns | `projectNumber` (Text), `projectName` (Text), `source` (Choice), `deliverable` (Choice), `leadEstimator` (Text), `submittedDate` (Date), `estimatedValue` (Number), `outcome` (Choice), checklist booleans (8×Yes/No) |
| 7 | Lookups | `status` → EstimateStatuses, `outcome` → EstimateOutcomes |
| 8 | Indexes | `recordId`, `projectId`, `status`, `outcome` |
| 9–11 | Standard | Major versions / Project team scoped / Project site provisioning |
| 12 | Governing Schema | P1-A1 estimate_tracking_record entity (21 fields) |

#### A.3.4 `EstimatingTeamMembers`

| # | Property | Value |
|---|----------|-------|
| 1–4 | Standard | Shared Site / List / `EstimatingTeamMembers` / `HBBaseListItem` |
| 5 | Required Columns | `id` (Text, UUID), `name` (Text), `role` (Choice), `email` (Text) |
| 6 | Optional Columns | `workload` (Number), `specialties` (Multi-line/JSON array) |
| 7 | Lookups | `role` → domain-local EstimatingRoles |
| 8 | Indexes | `id` (unique), `role` |
| 9–11 | Standard | Major versions / Domain team only / Created once |
| 12 | Governing Schema | P1-A1 estimating_team_member entity (7 fields) |

### A.4 — Buyout

#### A.4.1 `BuyoutCommitments`

| # | Property | Value |
|---|----------|-------|
| 1–4 | Standard | Project Site / List / `BuyoutCommitments` / `HBBaseListItem` |
| 5 | Required Columns | `id` (Text, native), `projectId` (Text), `commitmentTitle` (Text), `commitmentNumber` (Text), `status` (Choice) |
| 6 | Optional Columns | `procoreCommitmentId` (Text), `vendorName` (Text), `vendorContact_name` (Text), `vendorContact_email` (Text), `vendorContact_phone` (Text), `csiCode` (Text), `csiDescription` (Text), `procurementMethod` (Choice), `contractType` (Choice), `complianceStatus` (Choice), `contractAmount` (Number), `budgetAmount` (Number), `variance` (Number), `variancePercentage` (Number), `bondsRequired` (Yes/No), `insuranceVerified` (Yes/No), `startDate` (Date), `completionDate` (Date), `bidTabLink_bidTabId` (Text), `bidTabLink_csiMatch` (Yes/No), `bidTabLink_descriptionMatch` (Number), `bidTabLink_linkedAt` (DateTime), `bidTabLink_verifiedBy` (Text), `procurementNotes` (Multi-line), `updatedBy` (Text) |
| 7 | Lookups | `csiCode` → Shared_CSICodes (hub-site; adapter-resolved — see §Lookup and Reference Strategy), `status` → CommitmentStatuses (same-site), `procurementMethod` → ProcurementMethods (same-site), `contractType` → ContractTypes (same-site) |
| 8 | Indexes | `recordId`, `projectId`, `commitmentNumber`, `status`, `csiCode` |
| 9–11 | Standard | Major versions / Restricted list — Financial Domain Team group (see §Permissions) / Project site provisioning |
| 12 | Governing Schema | P1-A1 buyout_commitment entity (34 fields) |

#### A.4.2 `CommitmentMilestones`

| # | Property | Value |
|---|----------|-------|
| 1–4 | Standard | Project Site / List / `CommitmentMilestones` / `HBBaseListItem` |
| 5 | Required Columns | `commitmentId` (Text), `name` (Text) |
| 6 | Optional Columns | `date` (Date), `status` (Choice), `completed` (Yes/No), `milestoneNotes` (Multi-line) |
| 7 | Lookups | `commitmentId` → BuyoutCommitments (ID lookup), `status` → MilestoneStatuses |
| 8 | Indexes | `commitmentId` |
| 9–11 | Standard | None (no versioning) / Inherits commitment visibility / Project site provisioning |
| 12 | Governing Schema | P1-A1 commitment_milestone entity (8 fields) |

#### A.4.3 `AllowanceItems`

| # | Property | Value |
|---|----------|-------|
| 1–4 | Standard | Project Site / List / `AllowanceItems` / `HBBaseListItem` |
| 5 | Required Columns | `commitmentId` (Text), `item` (Text), `value` (Number), `version` (Number) |
| 6 | Optional Columns | `reconciled` (Yes/No), `reconciliationValue` (Number), `variance` (Number) |
| 7 | Lookups | `commitmentId` → BuyoutCommitments |
| 8 | Indexes | `commitmentId` |
| 9–11 | Standard | Major versions / Restricted list — Financial Domain Team group (see §Permissions) / Project site provisioning |
| 12 | Governing Schema | P1-A1 allowance_item entity (10 fields) |

#### A.4.4 `LongLeadItems`

| # | Property | Value |
|---|----------|-------|
| 1–4 | Standard | Project Site / List / `LongLeadItems` / `HBBaseListItem` |
| 5 | Required Columns | `commitmentId` (Text), `item` (Text), `version` (Number) |
| 6 | Optional Columns | `leadTime` (Number), `status` (Choice) |
| 7 | Lookups | `commitmentId` → BuyoutCommitments, `status` → LongLeadStatuses |
| 8 | Indexes | `commitmentId`, `status` |
| 9–11 | Standard | Major versions / Project team / Project site provisioning |
| 12 | Governing Schema | P1-A1 long_lead_item entity (8 fields) |

#### A.4.5 `ValueEngineeringItems`

| # | Property | Value |
|---|----------|-------|
| 1–4 | Standard | Project Site / List / `ValueEngineeringItems` / `HBBaseListItem` |
| 5 | Required Columns | `commitmentId` (Text), `item` (Text), `originalValue` (Number), `veValue` (Number), `version` (Number) |
| 6 | Optional Columns | `savings` (Number, derived), `status` (Choice) |
| 7 | Lookups | `commitmentId` → BuyoutCommitments, `status` → VEStatuses |
| 8 | Indexes | `commitmentId`, `status` |
| 9–11 | Standard | Major versions / Restricted list — Financial Domain Team group (see §Permissions) / Project site provisioning |
| 12 | Governing Schema | P1-A1 value_engineering_item entity (10 fields) |

#### A.4.6 `SubcontractChecklists`

| # | Property | Value |
|---|----------|-------|
| 1–4 | Standard | Project Site / List / `SubcontractChecklists` / `HBBaseListItem` |
| 5 | Required Columns | `commitmentId` (Text), `subcontractorName` (Text) |
| 6 | Optional Columns | `projectNumber` (Text), `projectName` (Text), `scopeOfWork` (Multi-line), `dateReceived` (Date), `budgetAmount` (Number), `contractValue` (Number), `otherCommitmentsToBudget` (Number), `overUnderAmount` (Number, derived), `overUnderReason` (Multi-line), `px` (Text), `pm` (Text), `riskManager` (Text), `apmPa` (Text), `scannedReturnedToSub` (Yes/No), `compassEnrolled` (Choice: Yes/No/Manual Review), `qScore` (Number), `preQualified` (Choice: Qualified/Rejected/Pending) |
| 7 | Lookups | `commitmentId` → BuyoutCommitments |
| 8 | Indexes | `commitmentId` |
| 9–11 | Standard | Major versions / Compliance-sensitive; confidential / Project site provisioning |
| 12 | Governing Schema | P1-A1 subcontract_checklist_record entity (21 fields) |

#### A.4.7 `SubcontractChecklistItems`

| # | Property | Value |
|---|----------|-------|
| 1–4 | Standard | Project Site / List / `SubcontractChecklistItems` / `HBBaseListItem` |
| 5 | Required Columns | `checklistRecordId` (Text), `requirementName` (Choice), `itemState` (Choice: Required-Included/Required-Not Included/Not Required/Pending) |
| 6 | Optional Columns | `requirementCategory` (Text), `itemNotes` (Multi-line), `sortOrder` (Number) |
| 7 | Lookups | `checklistRecordId` → SubcontractChecklists |
| 8 | Indexes | `checklistRecordId` |
| 9–11 | Standard | None / Compliance-sensitive / Project site provisioning |
| 12 | Governing Schema | P1-A1 subcontract_checklist_item entity (8 fields) |

#### A.4.8 `ComplianceWaiverRequests`

| # | Property | Value |
|---|----------|-------|
| 1–4 | Standard | Project Site / List / `ComplianceWaiverRequests` / `HBBaseListItem` |
| 5 | Required Columns | `subcontractorOrVendorName` (Text) |
| 6 | Optional Columns | `commitmentId` (Text), `projectName` (Text), `projectNumber` (Text), `projectManager` (Text), `pcPaApm` (Text), `insuranceWaiverSelected` (Yes/No), `insuranceReductionSelected` (Yes/No), `generalLiability` (Yes/No), `auto` (Yes/No), `umbrella` (Yes/No), `workersComp` (Yes/No), `professionalLiability` (Yes/No), `insuranceExplanation` (Multi-line), `insuranceRiskJustification` (Multi-line), `insuranceRiskMitigationActions` (Multi-line), `insuranceWaiverLevel` (Choice: Project Level/Global Level), `licensingStateWaived` (Yes/No), `licensingLocalWaived` (Yes/No), `licensingCounty` (Text), `licensingRiskJustification` (Multi-line), `licensingRiskMitigationActions` (Multi-line), `licensingWaiverLevel` (Choice), `scopeDescription` (Multi-line), `hasEmployeesOnSite` (Yes/No), `subcontractPoValue` (Number), `projectExecutiveApprover` (Text), `projectExecutiveApprovalDate` (Date), `complianceManagerApprover` (Text), `complianceManagerApprovalDate` (Date), `cfoApprover` (Text), `cfoApprovalDate` (Date) |
| 7 | Lookups | `commitmentId` → BuyoutCommitments |
| 8 | Indexes | `commitmentId` |
| 9–11 | Standard | Major versions / Restricted list — Compliance Team group; audit retention (see §Permissions) / Project site provisioning |
| 12 | Governing Schema | P1-A1 compliance_waiver_request entity (35 fields). Uses Approval pattern (3-tier). |

#### A.4.9 `EVerifyTracking`

| # | Property | Value |
|---|----------|-------|
| 1–4 | Standard | Project Site / List / `EVerifyTracking` / `HBBaseListItem` |
| 5 | Required Columns | `commitmentId` (Text) |
| 6 | Optional Columns | `contractNumber` (Text), `contractCompanyDisplay` (Text), `contractTitle` (Text), `contractExecutedDate` (Date), `everifySentDate` (Date), `reminder1Date` (Date), `reminder2Date` (Date), `everifyReceivedDate` (Date), `everifyStatus` (Choice: Not Started/Sent/Reminded/Received/Overdue), `jobNameSnapshot` (Text), `delayNotes` (Multi-line) |
| 7 | Lookups | `commitmentId` → BuyoutCommitments |
| 8 | Indexes | `commitmentId`, `everifyStatus` |
| 9–11 | Standard | Major versions / Compliance-sensitive; audit retention / Project site provisioning |
| 12 | Governing Schema | P1-A1 everify_tracking_record entity (14 fields) |

### A.5 — Schedule

#### A.5.1 `ScheduleActivities`

| # | Property | Value |
|---|----------|-------|
| 1–4 | Standard | Project Site / List / `ScheduleActivities` / `HBBaseListItem` |
| 5 | Required Columns | `batchId` (Text), `activityName` (Text) |
| 6 | Optional Columns | `wbsId` (Text), `calendarId` (Text), `sourceActivityId` (Text), `activityCode` (Text), `activityType` (Text), `status` (Text), `isMilestone` (Yes/No), `isSummary` (Yes/No), `plannedStart` (Date), `plannedFinish` (Date), `actualStart` (Date), `actualFinish` (Date), `earlyStart` (Date), `earlyFinish` (Date), `lateStart` (Date), `lateFinish` (Date), `plannedDurationHours` (Number), `actualDurationHours` (Number), `remainingDurationHours` (Number), `totalFloatHours` (Number), `freeFloatHours` (Number), `percentComplete` (Number), `physicalPercentComplete` (Number), `constraintType` (Text), `constraintDate` (Date), `isCritical` (Yes/No), `sourceExtrasJson` (Multi-line/JSON) |
| 7 | Lookups | `batchId` → ScheduleImportBatches |
| 8 | Indexes | `batchId`, `activityCode` |
| 9–11 | Standard | None / Project team / Project site provisioning |
| 12 | Governing Schema | P1-A4 schedule_activity entity. **Compressed model:** 16 canonical entities → 3 physical containers. See canonical-to-physical reconciliation note in Section 5. |

#### A.5.2 `ScheduleImportBatches`

| # | Property | Value |
|---|----------|-------|
| 1–4 | Standard | Project Site / List / `ScheduleImportBatches` / `HBBaseListItem` |
| 5 | Required Columns | `batchId` (Text), `projectId` (Text), `sourceFileName` (Text), `detectedFormat` (Choice: csv/msproject_xml/p6_xml/p6_xer), `importStatus` (Choice: pending/parsing/mapping/complete/failed), `uploadedBy` (Text), `uploadedAt` (DateTime) |
| 6 | Optional Columns | `sourceFileUrl` (Text), `detectedSourceProgram` (Text), `detectedSourceVersion` (Text), `parserVersion` (Text), `mappingVersion` (Text), `totalActivitiesParsed` (Number), `totalActivitiesMapped` (Number), `totalWarnings` (Number), `totalErrors` (Number), `completedAt` (DateTime), `batchNotes` (Multi-line) |
| 7 | Lookups | — |
| 8 | Indexes | `projectId`, `importStatus` |
| 9–11 | Standard | Major versions / Project team / Project site provisioning |
| 12 | Governing Schema | P1-A4 schedule_import_batch entity. Also absorbs `schedule_project` metadata (flattened). See reconciliation note in Section 5. |

#### A.5.3 `ScheduleUploadsLib`

| # | Property | Value |
|---|----------|-------|
| 1–4 | Standard | Project Site / Document Library / `ScheduleUploadsLib` / `HBDocumentItem` |
| 5 | Required Columns | (metadata) `detectedFormat` (Text), `uploadDate` (DateTime) |
| 6 | Optional Columns | `detectedSourceProgram` (Text), `batchId` (Text) |
| 7 | Lookups | — |
| 8 | Indexes | — (file-level storage) |
| 9–11 | Standard | Major versions / Project team / Project site provisioning |
| 12 | Governing Schema | P1-A4 Layer 1 (raw upload). Immutable raw source files. |

### A.6 — External Financial

#### A.6.1 `BudgetLines`

| # | Property | Value |
|---|----------|-------|
| 1–4 | Standard | Project Site / List / `BudgetLines` / `HBBaseListItem` |
| 5 | Required Columns | `batchId` (Text), `projectId` (Text), `budgetCode` (Text), `rowType` (Choice: data/blank_excluded/summary_excluded), `isExcluded` (Yes/No) |
| 6 | Optional Columns | `budgetCodeDescription` (Text), `subJobCode` (Text), `subJobDescription` (Text), `costCodeTier1Code` (Text), `costCodeTier1Description` (Text), `costCodeTier2Code` (Text), `costCodeTier2Description` (Text), `costCodeTier3Code` (Text), `costCodeTier3Description` (Text), `costTypeCode` (Text), `costTypeDescription` (Text), `originalBudgetAmount` (Number), `budgetModifications` (Number), `approvedCos` (Number), `revisedBudget` (Number), `pendingBudgetChanges` (Number), `projectedBudget` (Number), `committedCosts` (Number), `directCosts` (Number), `jobToDateCosts` (Number), `pendingCostChanges` (Number), `projectedCosts` (Number), `forecastToComplete` (Number), `estimatedCostAtCompletion` (Number), `projectedOverUnder` (Number), `sourceRowNumber` (Number) |
| 7 | Lookups | `costCodeTier3Code` → Shared_CostCodes (hub-site; adapter-resolved — see §Lookup and Reference Strategy) |
| 8 | Indexes | `batchId`, `projectId`, `budgetCode` |
| 9–11 | Standard | Major versions / Restricted list — Financial Domain Team group (see §Permissions) / Project site provisioning |
| 12 | Governing Schema | P1-A6 budget_line entity (4 canonical entities). Snapshot-append model. |

#### A.6.2 `BudgetImportBatches`

| # | Property | Value |
|---|----------|-------|
| 1–4 | Standard | Project Site / List / `BudgetImportBatches` / `HBBaseListItem` |
| 5 | Required Columns | `batchId` (Text), `projectId` (Text), `sourceSystem` (Text), `sourceFileName` (Text), `importStatus` (Choice: pending/parsing/validating/complete/failed), `uploadedBy` (Text), `uploadedAt` (DateTime) |
| 6 | Optional Columns | `snapshotDate` (Date), `totalLinesImported` (Number), `totalLinesExcluded` (Number), `totalWarnings` (Number), `totalErrors` (Number), `totalDerivationMismatches` (Number), `completedAt` (DateTime), `importedTotalPotentialCostImpact` (Number), `importedTotalPotentialDelayDays` (Number), `parserVersion` (Text), `batchNotes` (Multi-line) |
| 7 | Lookups | — |
| 8 | Indexes | `projectId`, `importStatus` |
| 9–11 | Standard | Major versions / Restricted list — Financial Domain Team group (see §Permissions) / Project site provisioning |
| 12 | Governing Schema | P1-A6 budget_import_batch entity. **Storage decision:** SharePoint list for user-visible import history and snapshot tracking. Import *findings* remain in Azure Table Storage. |

#### A.6.3 `BudgetUploadsLib`

| # | Property | Value |
|---|----------|-------|
| 1–4 | Standard | Project Site / Document Library / `BudgetUploadsLib` / `HBDocumentItem` |
| 5 | Required Columns | (metadata) `sourceSystem` (Text), `uploadDate` (DateTime) |
| 6 | Optional Columns | `snapshotDate` (Date), `batchId` (Text) |
| 7 | Lookups | — |
| 8 | Indexes | — |
| 9–11 | Standard | Major versions / Restricted list — Financial Domain Team group (see §Permissions) / Project site provisioning |
| 12 | Governing Schema | P1-A6. Raw Procore budget CSV files. |

### A.7 — Operational Register

#### A.7.1 `OperationalRegister`

| # | Property | Value |
|---|----------|-------|
| 1–4 | Standard | Project Site / List / `OperationalRegister` / `HBBaseListItem` |
| 5 | Required Columns | `projectId` (Text), `completionStatus` (Choice: Identified/In Progress/Pending/Closed) |
| 6 | Optional Columns | `department` (Text), `sourceRecordId` (Text), `displayNo` (Text), `recordType` (Text: risk/constraint/issue/action/delay/general), `categoryNumber` (Number), `categoryLabel` (Text), `categoryRaw` (Text), `description` (Multi-line), `reference` (Text), `assignedDisplay` (Text), `assignedPersonKey` (Text), `bicDisplay` (Text), `bicKey` (Text), `dateIdentified` (Date), `dueDate` (Date), `dateClosed` (Date), `daysElapsed` (Number), `daysElapsedSource` (Number), `closureDocument` (Text), `comments` (Multi-line), `ownerNameSnapshot` (Text), `pccoReferenceRaw` (Text), `pccoRecordKey` (Text), `affectedTaskRaw` (Text), `affectedScheduleActivityKey` (Text), `criticalPathImpactRaw` (Text), `criticalPathImpactFlag` (Yes/No), `potentialCostImpactRaw` (Text), `potentialCostImpactAmount` (Number), `delayDurationRaw` (Text), `delayDurationDays` (Number), `originalActivityStartRaw` (Text), `originalActivityStartDate` (Date), `delayStartRaw` (Text), `delayStartDate` (Date), `ownerNotificationRaw` (Text), `ownerNotificationDate` (Date), `delayNotes` (Multi-line), `sourceExtrasJson` (Multi-line/JSON) |
| 7 | Lookups | `categoryLabel` → domain-local RegisterCategories, `bicDisplay` → domain-local RegisterBICTeams |
| 8 | Indexes | `projectId`, `recordType`, `completionStatus`, `categoryLabel` |
| 9–11 | Standard | Major versions / Project team / Project site provisioning |
| 12 | Governing Schema | P1-A7 register_record entity + delay subtype (4 entities + 18 delay fields) |

### A.8 — Estimating Kickoff

#### A.8.1 `KickoffInstances`

| # | Property | Value |
|---|----------|-------|
| 1–4 | Standard | Project Site / List / `KickoffInstances` / `HBBaseListItem` |
| 5 | Required Columns | `instanceId` (Text), `projectId` (Text), `status` (Choice: draft/active/submitted/closed) |
| 6 | Optional Columns | `pursuitId` (Text), `templateId` (Text), `templateSnapshotDate` (DateTime), `jobNameSnapshot` (Text), `jobNumberSnapshot` (Text), `architectSnapshot` (Text), `proposalDueDate` (Date), `deliveryMethod` (Text), `copiesRequired` (Text), `proposalType` (Text), `rfiFormat` (Text), `projectExecutiveDisplay` (Text), `projectExecutiveKey` (Text), `primaryContactDisplay` (Text), `estimatorAssignedDisplay` (Text), `estimatorAssignedKey` (Text) |
| 7 | Lookups | `templateId` → Shared_KickoffTemplates |
| 8 | Indexes | `projectId`, `status` |
| 9–11 | Standard | Major versions / Project team / Project site provisioning |
| 12 | Governing Schema | P1-A8 kickoff_instance entity (7 canonical entities) |

#### A.8.2 `KickoffRows`

| # | Property | Value |
|---|----------|-------|
| 1–4 | Standard | Project Site / List / `KickoffRows` / `HBBaseListItem` |
| 5 | Required Columns | `instanceId` (Text), `isCustom` (Yes/No), `section` (Choice: managing_info/key_dates/deliverable_standard/deliverable_nonstandard), `displayOrder` (Number), `rowType` (Choice: task/milestone/deliverable), `itemName` (Text), `statusCode` (Choice: not_started/in_progress/complete/not_applicable/deferred) |
| 6 | Optional Columns | `templateItemId` (Text), `sectionLabel` (Text), `groupLabel` (Text), `applicable` (Yes/No), `rawYesMarker` (Yes/No), `rawNoMarker` (Yes/No), `responsibleDisplay` (Text), `responsibleEntityKey` (Text), `responsibleEntityType` (Text), `targetDate` (Date), `targetDateRaw` (Text), `dateRuleType` (Text), `dateRuleExpression` (Text), `tabRequired` (Yes/No), `packageDisplayOrder` (Number), `currentEvidenceRef` (Text), `notesSummary` (Multi-line), `sourceRowNumber` (Number) |
| 7 | Lookups | `instanceId` → KickoffInstances |
| 8 | Indexes | `instanceId`, `rowType`, `statusCode` |
| 9–11 | Standard | Major versions / Project team / Project site provisioning |
| 12 | Governing Schema | P1-A8 kickoff_row entity (3 row subtypes). **Storage note:** `kickoff_note` (timestamped comment history) and `kickoff_evidence_link` (multi-artifact links) are P1-A8 child entities deferred to Phase 2 as separate SharePoint lists. In Phase 1, `notesSummary` and `currentEvidenceRef` fields on this list serve as current-state equivalents. |

### A.9 — Permits & Inspections

#### A.9.1 `Permits`

| # | Property | Value |
|---|----------|-------|
| 1–4 | Standard | Project Site / List / `Permits` / `HBBaseListItem` |
| 5 | Required Columns | `projectId` (Text), `permitNumber` (Text), `permitType` (Choice), `permitStatus` (Choice: pending/approved/renewed/expired/rejected) |
| 6 | Optional Columns | `sourcePermitId` (Text), `priority` (Choice: high/medium/low), `authorityName` (Text), `authorityContact_name` (Text), `authorityContact_phone` (Text), `authorityContact_email` (Text), `authorityContact_address` (Text), `authorityContactKey` (Text), `applicationDate` (DateTime), `approvalDate` (DateTime), `expirationDate` (DateTime), `renewalDate` (DateTime), `cost` (Number), `bondAmount` (Number), `description` (Multi-line), `comments` (Multi-line), `conditionsRaw` (Multi-line/JSON), `tagsRaw` (Multi-line/JSON) |
| 7 | Lookups | `permitType` → domain-local PermitTypes |
| 8 | Indexes | `projectId`, `permitNumber`, `permitStatus` |
| 9–11 | Standard | Major versions / Project team / Project site provisioning |
| 12 | Governing Schema | P1-A9 permit_record entity (7 canonical entities) |

#### A.9.2 `PermitInspections`

| # | Property | Value |
|---|----------|-------|
| 1–4 | Standard | Project Site / List / `PermitInspections` / `HBBaseListItem` |
| 5 | Required Columns | `permitId` (Text), `inspectionType` (Text) |
| 6 | Optional Columns | `sourceInspectionId` (Text), `scheduledDate` (DateTime), `completedDate` (DateTime), `result` (Choice: passed/conditional/failed/pending), `complianceScore` (Number), `inspectorDisplay` (Text), `inspectorContact_phone` (Text), `inspectorContact_email` (Text), `inspectorContact_badge` (Text), `inspectorContactKey` (Text), `comments` (Multi-line), `resolutionNotes` (Multi-line), `followUpRequired` (Yes/No), `durationMinutes` (Number), `issuesRaw` (Multi-line/JSON) |
| 7 | Lookups | `permitId` → Permits |
| 8 | Indexes | `permitId` |
| 9–11 | Standard | Major versions / Project team / Project site provisioning |
| 12 | Governing Schema | P1-A9 permit_inspection entity |

### A.10 — Lifecycle Checklists

#### A.10.1 `LifecycleChecklists`

| # | Property | Value |
|---|----------|-------|
| 1–4 | Standard | Project Site / List / `LifecycleChecklists` / `HBBaseListItem` |
| 5 | Required Columns | `instanceId` (Text), `checklistFamily` (Choice: startup/safety/closeout), `itemNumber` (Text), `itemName` (Text), `displayOrder` (Number) |
| 6 | Optional Columns | `checklistId` (Text), `templateItemId` (Text), `isCustom` (Yes/No), `sectionNumber` (Number), `sectionLabel` (Text), `itemDetails` (Multi-line), `itemType` (Text), `canonicalOutcome` (Choice: complete/incomplete/pass/fail/not_applicable), `rawOutcomeValue` (Text), `rawOutcomeFamily` (Text), `statusNotes` (Multi-line), `targetDate` (Date), `completedDate` (Date), `evidenceRequired` (Yes/No), `currentEvidenceRef` (Text), `sourceRowNumber` (Number) |
| 7 | Lookups | `checklistFamily` → domain-local ChecklistFamilies, `templateItemId` → Shared_ChecklistTemplates |
| 8 | Indexes | `projectId`, `checklistFamily`, `canonicalOutcome` |
| 9–11 | Standard | Major versions / Project team / Project site provisioning |
| 12 | Governing Schema | P1-A10. **Compressed model:** 8 canonical entities → 1 shared template list + 1 project-site list. See canonical-to-physical reconciliation note in Section 10. |

### A.11 — Responsibility Matrix

#### A.11.1 `ResponsibilityMatrices`

| # | Property | Value |
|---|----------|-------|
| 1–4 | Standard | Project Site / List / `ResponsibilityMatrices` / `HBBaseListItem` |
| 5 | Required Columns | `instanceId` (Text), `projectId` (Text), `familyId` (Text) |
| 6 | Optional Columns | `templateId` (Text), `versionId` (Text), `instanceLabel` (Text), `snapshotDate` (DateTime) |
| 7 | Lookups | `templateId` → Shared_ResponsibilityTemplates |
| 8 | Indexes | `projectId`, `familyId` |
| 9–11 | Standard | Major versions / Project team / Project site provisioning |
| 12 | Governing Schema | P1-A11 project_responsibility_instance entity (10 entities total) |

#### A.11.2 `ResponsibilityAssignments`

| # | Property | Value |
|---|----------|-------|
| 1–4 | Standard | Project Site / List / `ResponsibilityAssignments` / `HBBaseListItem` |
| 5 | Required Columns | `itemInstanceId` (Text), `rolePartyId` (Text), `valueCode` (Choice: primary/support/review/sign_off) |
| 6 | Optional Columns | `rawCellValue` (Text), `sourceColumnLetter` (Text) |
| 7 | Lookups | `itemInstanceId` → ResponsibilityMatrices (via item instance), `rolePartyId` → Shared_ResponsibilityTemplates (role catalog) |
| 8 | Indexes | `itemInstanceId` |
| 9–11 | Standard | None / Project team / Project site provisioning |
| 12 | Governing Schema | P1-A11 responsibility_assignment entity (normalized junction records) |

### A.12 — Subcontractor Scorecard

#### A.12.1 `SubcontractorScorecards`

| # | Property | Value |
|---|----------|-------|
| 1–4 | Standard | Project Site / List / `SubcontractorScorecards` / `HBBaseListItem` |
| 5 | Required Columns | `evaluationId` (Text), `projectId` (Text), `subcontractorDisplayName` (Text), `evaluationStatus` (Choice: draft/in_progress/completed/approved), `officialFinalFlag` (Yes/No) |
| 6 | Optional Columns | `subcontractorKey` (Text), `tradePackage` (Text), `rubricVersionId` (Text), `evaluationType` (Text), `evaluationDate` (Date), `evaluatorDisplay` (Text), `evaluatorKey` (Text), `evaluatorTitle` (Text), `projectNameSnapshot` (Text), `projectNumberSnapshot` (Text), `contractValueSnapshot` (Number), `finalCostSnapshot` (Number), `scheduledCompletionSnapshot` (Date), `actualCompletionSnapshot` (Date), `overallWeightedScore` (Number), `overallRatingCode` (Choice: exceptional/above_average/satisfactory/below_average/unsatisfactory), `rebidRecommendationCode` (Choice: yes/yes_with_conditions/no), `strengthsSummary` (Multi-line), `improvementSummary` (Multi-line), `incidentsIssuesSummary` (Multi-line), `overallSummary` (Multi-line) |
| 7 | Lookups | `rubricVersionId` → Shared_ScorecardRubrics |
| 8 | Indexes | `projectId`, `subcontractorKey`, `officialFinalFlag` |
| 9–11 | Standard | Major versions / Restricted list — Financial Domain Team group (see §Permissions) / Project site provisioning |
| 12 | Governing Schema | P1-A12 scorecard_evaluation entity (12 canonical entities) |

#### A.12.2 `ScorecardCriterionScores`

| # | Property | Value |
|---|----------|-------|
| 1–4 | Standard | Project Site / List / `ScorecardCriterionScores` / `HBBaseListItem` |
| 5 | Required Columns | `evaluationId` (Text), `criterionId` (Text), `naFlag` (Yes/No), `criterionWeight` (Number) |
| 6 | Optional Columns | `scoreRaw` (Number, 1-5), `weightedScore` (Number), `comments` (Multi-line), `sourceRowNumber` (Number) |
| 7 | Lookups | `evaluationId` → SubcontractorScorecards, `criterionId` → Shared_ScorecardRubrics |
| 8 | Indexes | `evaluationId` |
| 9–11 | Standard | None / Inherits evaluation visibility / Project site provisioning |
| 12 | Governing Schema | P1-A12 criterion_score_record entity |

### A.13 — Lessons Learned

#### A.13.1 `LessonsReports`

| # | Property | Value |
|---|----------|-------|
| 1–4 | Standard | Project Site / List / `LessonsReports` / `HBBaseListItem` |
| 5 | Required Columns | `reportId` (Text), `projectId` (Text) |
| 6 | Optional Columns | `projectNameSnapshot` (Text), `projectNumberSnapshot` (Text), `projectLocationSnapshot` (Text), `projectTypeSnapshot` (Text), `originalContractValue` (Number), `finalContractValue` (Number), `costVariance` (Number), `scheduledCompletion` (Date), `actualCompletion` (Date), `daysVariance` (Number), `projectManagerDisplay` (Text), `superintendentDisplay` (Text), `projectExecutiveDisplay` (Text), `reportPreparedBy` (Text), `reportDate` (Date), `deliveryMethod` (Text), `marketSector` (Text), `projectSizeBand` (Text), `complexityRating` (Number) |
| 7 | Lookups | — |
| 8 | Indexes | `projectId` |
| 9–11 | Standard | Major versions / Project team / Project site provisioning |
| 12 | Governing Schema | P1-A13 lessons_report_instance entity (8 canonical entities) |

#### A.13.2 `LessonRecords`

| # | Property | Value |
|---|----------|-------|
| 1–4 | Standard | Project Site / List / `LessonRecords` / `HBBaseListItem` |
| 5 | Required Columns | `lessonId` (Text), `reportId` (Text), `lessonSequence` (Number) |
| 6 | Optional Columns | `categoryKey` (Text), `categoryRaw` (Text), `phaseEncounteredKey` (Text), `phaseEncounteredRaw` (Text), `impactMagnitudeKey` (Text), `impactMagnitudeRaw` (Text), `applicabilityScore` (Number, 1-5), `keywordsRaw` (Text), `situationText` (Multi-line), `impactText` (Multi-line), `rootCauseText` (Multi-line), `responseText` (Multi-line), `recommendationText` (Multi-line), `composedNarrative` (Multi-line), `supportingReferenceText` (Multi-line), `projectNameInherited` (Text), `projectNumberInherited` (Text), `marketSectorInherited` (Text), `deliveryMethodInherited` (Text), `projectSizeBandInherited` (Text), `reportDateInherited` (Date) |
| 7 | Lookups | `reportId` → LessonsReports, `categoryKey` → hub-site LessonCategories dictionary |
| 8 | Indexes | `reportId`, `categoryKey`, `applicabilityScore` |
| 9–11 | Standard | Major versions / Project team / Project site provisioning |
| 12 | Governing Schema | P1-A13 lesson_record entity. 5 structured narrative fields + composed narrative. Inherited project metadata for denormalized search. |

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

### Content Type Strategy (Frozen)

> **Status: Frozen.** This subsection defines when centralized, domain-specific, or list-local content types are appropriate.

**Phase 1 content types.** Three hub-level content types, published through the Content Type Gallery, cover all Phase 1 build-ready containers:

- `HBBaseListItem` (Item-based) — all transactional and operational lists
- `HBDocumentItem` (Document-based) — all document libraries
- `HBDictionaryItem` (Item-based) — all shared and domain-local dictionary lists

No domain-specific content types are required for Phase 1. All Phase 1 lists use `HBBaseListItem`; all Phase 1 document libraries use `HBDocumentItem` with list-local metadata columns; all dictionary lists use `HBDictionaryItem`.

**When centralized content types are required.** Use the Content Type Gallery to publish centralized content types when:
- a content type is reused across multiple sites (the three hub-level types above),
- a future document library requires enforced metadata columns beyond what `HBDocumentItem` provides, or
- a repeating document class emerges across multiple project sites (e.g., a governed PMP document type).

**When list-local schema is sufficient.** Do not create centralized or domain-specific content types when:
- a list stores a single record type (most Phase 1 lists),
- metadata requirements are met by list-local columns without content-type enforcement, or
- the content type would serve only one list on one site.

**Paired library pattern.** When a domain uses a paired container (list + library), the list uses `HBBaseListItem` and the library evaluates whether `HBDocumentItem` with list-local metadata is sufficient or whether a domain-specific document content type with enforced metadata should be published through the Content Type Gallery. Phase 1 build-ready paired libraries (`ScheduleUploadsLib`, `BudgetUploadsLib`) use `HBDocumentItem` with list-local metadata — no domain-specific document content types are needed.

**Template-driven domains.** Hub-site template lists (`Shared_KickoffTemplates`, `Shared_ChecklistTemplates`, `Shared_ResponsibilityTemplates`, `Shared_ScorecardRubrics`) use `HBDictionaryItem`. Project-site instance/record lists use `HBBaseListItem`. Template governance is enforced at the schema level by domain schema artifacts (P1-A8 through P1-A13), not through domain-specific content types. This is sufficient because template structure is controlled by the governing schema, not by SharePoint content type enforcement.

**What remains open.** When deferred paired libraries (PMP, future compliance/contract document libraries) become build-ready, their schema artifacts must declare whether `HBDocumentItem` is sufficient or a domain-specific document content type is warranted. This is evaluated per-domain, not pre-decided globally.

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
| `HBDocumentItem` | Document | Project Site | Schedule uploads (`ScheduleUploadsLib`), budget uploads (`BudgetUploadsLib`); future document libraries evaluate per §Content Type Strategy |
| `HBDictionaryItem` | Item | Hub Site | All shared and domain-local dictionary lists |

All three content types are published through the Content Type Gallery at the hub-site level and inherited by project sites during provisioning.

### Shared Dictionaries (Governed by P1-A5)

These dictionaries are stored as SharePoint lists on the **hub site** and governed by [P1-A5-Reference-Data-Dictionary-Schema.md](./P1-A5-Reference-Data-Dictionary-Schema.md). A3 defines their physical container; A5 defines their canonical schema.

| Dictionary List | Internal Name | Key Column | Display Column | Source |
|----------------|---------------|-----------|----------------|--------|
| Cost Codes | `Shared_CostCodes` | `csiCode` | `description` | P1-A5 Cost Code Dictionary |
| CSI Codes | `Shared_CSICodes` | `csiCode` | `primaryDescription` | P1-A5 CSI Code Dictionary |
| Project Types | `Shared_ProjectTypes` | `typeId` | `typeName` | P1-A5 Simple Reference Dictionary |
| Project Stages | `Shared_ProjectStages` | `stageId` | `stageName` | P1-A5 Simple Reference Dictionary |
| Project Regions | `Shared_ProjectRegions` | `regionId` | `regionName` | P1-A5 Simple Reference Dictionary |
| State Codes | `Shared_StateCodes` | `stateCode` | `stateName` | P1-A5 Simple Reference Dictionary |
| Country Codes | `Shared_CountryCodes` | `countryCode` | `countryName` | P1-A5 Simple Reference Dictionary |
| Delivery Methods | `Shared_DeliveryMethods` | `methodCode` | `methodName` | P1-A5 Simple Reference Dictionary |
| Sectors | `Shared_Sectors` | `sectorCode` | `sectorName` | P1-A5 Simple Reference Dictionary |

### Domain-Local Dictionaries (Site-Scoped)

These dictionaries are stored on the relevant project or shared site and are managed within their domain's schema artifact. They are NOT governed by P1-A5 unless later promoted.

Domain-local dictionaries are provisioned as part of project-site setup (manually or via provisioning scripts, per the open provisioning-automation decision). They use the `HBDictionaryItem` content type, same-site lookup columns from consuming lists within the same project site, and are maintained by the owning domain team. Promotion to hub-site shared governance requires an explicit decision and migration to P1-A5 governance.

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

### Shared Dictionary Deployment Model

> **Status: Frozen.** This subsection defines the architectural contract for shared dictionary deployment. Population automation (CSV, PnP, manual) remains an open implementation decision.

**Authoritative storage.** Each shared dictionary is stored in exactly one authoritative SharePoint list on the hub site (enumerated in Appendix A.1). The hub-site list is the single source of truth for dictionary content. Project sites do not maintain authoritative copies or synchronized replicas of shared dictionary lists.

**Project-site column contract.** Project-site records that reference a shared dictionary store the dictionary's stable key value (e.g., `csiCode`, `typeId`, `stateCode`) as a plain text column. Where the consuming domain also stores a display value (e.g., `csiDescription`, `projectTypeName`), that column is a denormalized display mirror populated at write time or adapter-resolution time — not an authoritative copy. The key column is the durable contract; the display mirror is a convenience that may lag dictionary updates until the record is next touched.

**Resolution mechanism.** Cross-site SharePoint lookup columns are not used as the architectural contract between project sites and hub-site dictionaries. The adapter layer resolves dictionary key-to-display enrichment at read time, using the stable key stored on the project-site record to look up the current authoritative value from the hub-site dictionary list. This aligns with the cross-site lookup prohibition in the Cross-List Lookups subsection above and with P1-A2's Class C adapter-resolution model for read-mostly reference data.

**What remains open.** Initial dictionary population mechanics (CSV upload, PnP provisioning, manual entry) and ongoing dictionary update propagation remain implementation decisions tracked in the Open Decisions table below. The frozen architectural decisions are: WHERE dictionaries live (hub site), WHAT project-site columns store (stable key + optional display mirror), and HOW cross-site resolution works (adapter layer, not SharePoint lookup columns).

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

> **Status: Frozen.** This section defines the architectural security model for financial and compliance data. Group provisioning mechanics and adapter authorization implementation remain open.

**Default inheritance.** Most project-site lists inherit permissions from the project site. Hub-site lists inherit hub-site permissions.

**Financial-sensitive list isolation (Frozen).** Lists containing financial-sensitive data (marked `Confidential Business` or `Domain Team Only` in P1-A1) break permission inheritance at the list level and are scoped to a **Financial Domain Team** SharePoint group. Members of this group have Contribute access; other project team members have no access to these lists. This applies to: `PreconEngagements`, `BuyoutCommitments`, `AllowanceItems`, `ValueEngineeringItems`, `BudgetLines`, `BudgetImportBatches`, `BudgetUploadsLib`, `PrimeContracts`, and `SubcontractorScorecards`.

**Compliance-sensitive list isolation.** Lists with compliance-sensitive or audit-privileged data (`ComplianceWaiverRequests`, `SubcontractChecklists`) break permission inheritance and are scoped to a **Compliance Team** SharePoint group with appropriate access.

**What is explicitly rejected.** Filtered views, adapter-only filtering, and UI-level conventions are not sufficient as the sole enforcement mechanism for financial or compliance data. These may supplement but cannot replace SharePoint-native permission boundaries.

**Item-level permissions.** Item-level unique permissions (per-row ACLs) are not the default financial-access model. List-level isolation via SharePoint groups avoids permission sprawl and keeps administration practical. Item-level permissions may be used in exceptional cases but require explicit justification.

**Service-layer enforcement.** The adapter/service layer must mirror SharePoint permission boundaries — adapter endpoints for financial data must validate caller membership in the Financial Domain Team group (or equivalent authorization) and must not serve financial fields to unauthorized callers. This prevents API overexposure even if SharePoint permissions are the primary boundary.

**`is_private` flag (PrimeContracts).** PrimeContracts retains the Procore-sourced `is_private` flag as supplemental application-layer visibility control. The flag is enforced at the adapter layer in addition to list-level SharePoint permissions, not as a substitute for them.

**What remains open.** Financial Domain Team and Compliance Team group provisioning mechanics (creation, membership management, per-project-site setup) and adapter authorization implementation (how adapters validate group membership at runtime) remain implementation decisions for P1-B1.

---

## Versioning and Document Library Rules

### Lists
- Enable major version history on lists where `version` field is tracked (per P1-A1 Revision Pattern = Standard Revision Pattern)
- Milestone and checklist item lists (no revision pattern) do not require versioning

### Document Libraries
- Phase 1 build-ready libraries (`ScheduleUploadsLib`, `BudgetUploadsLib`): enable major versions only (upload provenance files, not collaboratively edited)
- Future contract and compliance document libraries (when build-ready): enable major + minor versions
- Future PMP libraries (when build-ready): major versions only (published versions)
- Set version limit per organizational retention policy (recommended: 50 major versions for active documents)

---

## Open Decisions / Future Expansion

**Resolved during A3 closeout (Steps 2–10):** Physical column schemas per domain — resolved by per-container appendix blocks (v0.8). Build-ready vs deferred scope — resolved by scope split (v0.3). Non-SharePoint operational state — resolved by non-SharePoint entities registry (v1.0). Naming conventions — resolved (v0.4–0.5). Authority boundaries — frozen (v0.2).

**Remaining implementation decisions:**

| Decision | Scope | Owner | Target | Why Still Open |
|----------|-------|-------|--------|---------------|
| **Shared dictionary population automation** | How hub-site dictionary lists are initially populated (CSV upload, PnP provisioning, manual entry) and how dictionary content updates are applied to hub-site lists over time. Deployment architecture (hub-site authoritative, project-site adapter-resolved) is frozen in §Lookup and Reference Strategy | Platform Architecture + DevOps | Phase 1 (implementation) | Deployment architecture frozen (v1.8); automation tooling choice remains an implementation decision |
| **Financial-sensitive data access model** | Group provisioning mechanics (how Financial Domain Team and Compliance Team SharePoint groups are created and populated per project site) and adapter authorization implementation (how adapters validate group membership at runtime). Security architecture (list-level isolation via restricted SharePoint groups, service-layer mirroring) is frozen in §Permissions and Inheritance Notes | Platform Architecture + Security | Phase 1 (implementation) | Security architecture frozen (v1.9); group provisioning mechanics and adapter authorization implementation remain |
| **Content type evaluation for future paired libraries** | When deferred paired-library domains (PMP, future compliance/contract document libraries) become build-ready, their schema artifacts must declare whether `HBDocumentItem` with list-local metadata is sufficient or a domain-specific document content type with enforced metadata should be published through the Content Type Gallery. Phase 1 content type strategy is frozen in §Content Type Strategy | Platform Architecture | When deferred domains become build-ready | Content type strategy frozen (v2.0); per-domain evaluation deferred to schema artifact completion |
| **Provisioning automation scope** | Which of the ~45 build-ready containers are auto-provisioned via PnP scripts during hub/project site creation vs created manually or on-demand | Platform Architecture + DevOps | Phase 1 (implementation) | Container definitions are complete but the provisioning execution model (scripted vs manual vs hybrid) is not yet decided |

---

## Decision Owners and Approval

| Role | Name | Approval Date |
|------|------|----------------|
| Platform Architecture Lead | — | — |
| SharePoint Infrastructure Owner | — | — |
| Security and Compliance Lead | — | — |

**Approval Status:** Active — Closeout complete (v1.2). Physical schema register with per-container appendices for all Phase 1 build-ready domains.
**Comments:** A3 closeout completed through 12 steps: authority boundary frozen (v0.2), build-ready/deferred scope split (v0.3), shared reusable schema assets and naming conventions (v0.4–0.5), Wave 1 containers completed (v0.6), all 13 domain groups added in execution order (v0.7), per-container appendix blocks with 12-point physical schema sequence for ~46 containers (v0.8), ambiguous storage cases resolved (v0.9), non-SharePoint entities registry (v1.0), open decisions reconciled to 4 true implementation choices (v1.1), final QA pass (v1.2). Post-closeout: leads moved to build-ready with `MarketLeads` and `PipelineSnapshots` containers (v1.5, governed by P1-A14), contracts moved to build-ready with `PrimeContracts` container (v1.6, governed by P1-A15). One deferred domain (pmp) remains a placeholder pending a dedicated schema artifact. All shared dictionaries have canonical schemas in P1-A5.

---

## Revision History

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 0.1 | 2026-03-17 | Architecture | Initial structure; container register seeded from P1-A1 Wave 1 domains. Physical column schemas pending approval. |
| 0.2 | 2026-03-17 | Architecture | Froze authority boundary: A3 owns physical SharePoint implementation only; A4–A13 own logical/canonical entity models; A2 owns adapter/source-of-record behavior; A5 owns dictionary schema governance. Updated status from Draft to Active for Phase 1 build-ready domains. Expanded relationship table to include A4–A13 and A5. |
| 0.3 | 2026-03-17 | Architecture | Split container register into Phase 1 Build-Ready vs Deferred sections. Moved schedule (P1-A4), risk (P1-A7), compliance/permits (P1-A9), compliance/checklists (P1-A10), scorecard (P1-A12) into build-ready scope with proper container rows. Retained leads, contracts, pmp as deferred placeholders. |
| 0.4 | 2026-03-17 | Architecture | Added Shared Reusable Schema Assets section (shared site columns, custom content types, shared/domain-local dictionaries, 5 reusable child-record patterns). Expanded Physical Schema Conventions with comprehensive naming conventions (container names, column suffixes, content type rules, lookup notation). |
| 0.5 | 2026-03-17 | Architecture | Applied naming conventions: replaced all `_pending schema approval_` Physical Container Names with PascalCase names (24 build-ready containers). Changed deferred container names to `_deferred_` to distinguish from build-ready scope. |
| 0.6 | 2026-03-17 | Architecture | Completed physical-schema treatment for 15 Wave 1 seeded containers (project, estimating, buyout). Added content type references, build-ready status, and field counts to Notes. Updated section status from pending to build-ready framing. Column appendices remain next step. |
| 0.7 | 2026-03-17 | Architecture | Reorganized build-ready register into 13 execution-ordered sections. Added 15 new containers: shared dictionaries (9 hub-site + 4 template lists), external financial (2: budget lines + uploads lib), estimating kickoff (2: instances + rows), responsibility matrix (2: instances + assignments), lessons learned (2: reports + records). Total build-ready containers: ~46. |
| 0.8 | 2026-03-17 | Architecture | Added per-container appendix blocks (A.1–A.13) with 12-point physical schema sequence for all build-ready containers. Covers shared dictionaries (13), project/intake (2), estimating (4), buyout (9), schedule (3), external financial (2), operational register (1), estimating kickoff (2), permits (2), lifecycle checklists (1), responsibility matrix (2), scorecard (2), lessons learned (2). |
| 0.9 | 2026-03-17 | Architecture | Resolved 3 ambiguous storage cases. (1) kickoff_note: deferred to Phase 2 as separate child list; Phase 1 uses notesSummary field on KickoffRows. (2) schedule ScheduleImportBatches: confirmed as SharePoint list (not Azure Table Storage). (3) budget BudgetImportBatches: added as new SharePoint list + appendix A.6.2 for user-visible import history. Fixed blanket import statement to distinguish findings (Table Storage) from batch metadata (SharePoint where user-visible). |
| 1.0 | 2026-03-17 | Architecture | Added Non-SharePoint Canonical Entities registry: 8 import finding entities (Azure Table Storage), 7 import batch entities without SharePoint lists, 7 mapping/provenance entities (Azure Table Storage), 11 Phase 2 deferred child entities with Phase 1 inline alternatives documented. Replaces ad-hoc inline notes with comprehensive structured tables. |
| 1.1 | 2026-03-17 | Architecture | Reconciled open decisions: removed "Physical column schemas per domain" (resolved by appendix blocks v0.8). Narrowed "Shared dictionary deployment" to mechanics only, "Content type strategy" to deferred domains only. Added "Why Still Open" column. Documented resolved items from A3 closeout Steps 2–10 for traceability. 4 true implementation decisions remain. |
| 1.2 | 2026-03-17 | Architecture | Final QA and closeout pass. Verified: all build-ready containers have appendix blocks, all appendices reference governing schemas, all project-site lists have indexed key/status fields, all shared dictionaries point to P1-A5, all non-SharePoint entities explicitly documented, deferred placeholders clearly separated. Updated approval status and comments to reflect completed closeout. A3 is implementation-ready for Phase 1 build-ready scope. |
| 1.3 | 2026-03-17 | Architecture | Closed A3/A5 shared dictionary gap. Removed stale "next implementation step" language for appendices (appendices are present since v0.8). Updated 7 shared dictionary rows from "P1-A5 (pending)" to "P1-A5" referencing completed Simple Reference Dictionary pattern. Updated A.1.3 appendix and comments. |
| 1.4 | 2026-03-17 | Architecture | Added canonical-to-physical reconciliation notes for schedule (16 entities → 3 containers) and lifecycle checklists (8 entities → 2 containers). Added reusable reconciliation rule in Authority Boundary section. Updated appendix governing-schema references to note compression. No corrective container changes required — existing compression is defensible. |
| 1.5 | 2026-03-17 | Architecture | Moved leads from deferred to build-ready scope (section 14). Added 2 containers: `MarketLeads` (Sales/BD site, market leads with tag child records) and `PipelineSnapshots` (Sales/BD site, division-level pipeline snapshots with JSON-embedded aggregates). Governed by P1-A14. Remaining deferred: contracts, pmp. |
| 1.6 | 2026-03-17 | Architecture | Moved contracts from deferred to build-ready scope (section 15). Added 1 container: `PrimeContracts` (project site, single list — no paired library). Changed from original "Paired (List + Library)" to single List — evidence shows no attachments in Phase 1 source data; library deferred to Phase 2. Governed by P1-A15. Remaining deferred: pmp. |
| 1.7 | 2026-03-17 | Architecture | Summary-layer reconciliation: add A14 and A15 to Read With, authority boundary, relationship table, and document-scope references (previously stopped at A13). Move contracts from Pattern 3 (Paired) to Pattern 1 (Single List) in canonical container patterns to match A15 single-list decision. |
| 1.8 | 2026-03-17 | Architecture | Froze shared dictionary deployment model: hub-site authoritative, project-site stores stable keys with optional display mirrors, adapter-resolved cross-site reads (no cross-site lookup columns). Annotated 2 cross-site appendix lookup rows (BuyoutCommitments, BudgetLines). Clarified domain-local dictionary provisioning. Fixed 7 stale "pending schema" labels in summary table. Narrowed open decision to population automation only. |
| 1.9 | 2026-03-17 | Architecture | Froze financial-sensitive data security model: list-level permission isolation via Financial Domain Team and Compliance Team SharePoint groups, service-layer enforcement mirrors the same boundary, UI/view-only conventions explicitly rejected as sole mechanism, item-level permissions rejected as default model. Standardized security terminology across 9 container appendices and 9 register entries. Narrowed open decision to group provisioning and adapter authorization mechanics. |
| 2.0 | 2026-03-17 | Architecture | Froze content type strategy: three hub-level types (HBBaseListItem, HBDocumentItem, HBDictionaryItem) published through Content Type Gallery cover all Phase 1 containers; no domain-specific content types needed for Phase 1; paired libraries evaluate per-domain when deferred domains become build-ready; template governance at schema level not content-type level. Fixed HBDocumentItem "Used By" to reflect Phase 1 reality. Separated document library versioning rules into Phase 1 build-ready vs future guidance. Narrowed open decision to per-domain evaluation for future paired libraries. |
