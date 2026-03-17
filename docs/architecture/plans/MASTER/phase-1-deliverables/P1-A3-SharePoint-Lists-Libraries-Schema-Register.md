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

**Status:** All Wave 1 containers below are **build-ready** — physical container names assigned, content types referenced, key columns identified, indexing/provisioning/security documented. Column-level appendices with complete SharePoint field definitions are the next implementation step. Deferred domains remain placeholders.

### Phase 1 Build-Ready Containers

Containers are organized by execution dependency order. All containers below are build-ready at the register level. Column-level appendices are the next implementation step.

#### 1. Shared Dictionaries (Hub Site)

| Domain | Entity | Logical Container Name | Physical Container Name | Container Type | Scope | Key Columns | Governing Schema | Notes |
|--------|--------|------------------------|-------------------------|----------------|-------|-------------|-----------------|-------|
| shared | cost_code | Cost Codes | `Shared_CostCodes` | List | Hub Site | csiCode, description, stage, divisionCode | P1-A5 | Build-ready. CT: `HBDictionaryItem`. 7,565 codes. |
| shared | csi_code | CSI Codes | `Shared_CSICodes` | List | Hub Site | csiCode, primaryDescription, divisionCode, sectionGroup | P1-A5 | Build-ready. CT: `HBDictionaryItem`. ~6,633 codes. |
| shared | project_types | Project Types | `Shared_ProjectTypes` | List | Hub Site | typeId, typeName | P1-A5 (pending) | Build-ready. CT: `HBDictionaryItem`. Schema pending in P1-A5. |
| shared | project_stages | Project Stages | `Shared_ProjectStages` | List | Hub Site | stageId, stageName | P1-A5 (pending) | Build-ready. CT: `HBDictionaryItem`. Schema pending in P1-A5. |
| shared | project_regions | Project Regions | `Shared_ProjectRegions` | List | Hub Site | regionId, regionName | P1-A5 (pending) | Build-ready. CT: `HBDictionaryItem`. |
| shared | state_codes | State Codes | `Shared_StateCodes` | List | Hub Site | stateCode, stateName | P1-A5 (pending) | Build-ready. CT: `HBDictionaryItem`. |
| shared | country_codes | Country Codes | `Shared_CountryCodes` | List | Hub Site | countryCode, countryName | P1-A5 (pending) | Build-ready. CT: `HBDictionaryItem`. |
| shared | delivery_methods | Delivery Methods | `Shared_DeliveryMethods` | List | Hub Site | methodCode, methodName | P1-A5 (pending) | Build-ready. CT: `HBDictionaryItem`. |
| shared | sectors | Sectors | `Shared_Sectors` | List | Hub Site | sectorCode, sectorName | P1-A5 (pending) | Build-ready. CT: `HBDictionaryItem`. |
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
| estimating | preconstruction_engagement | Preconstruction Engagement List | `PreconEngagements` | List | Project Site | Active preconstruction engagements with budget tracking | Engagement item | ProjectMaster (project_id FK) | record_id, project_id, status, currentStage | PreconStages (domain-local) | — | Major versions | Index: record_id, project_id, status; low-moderate volume | Created during project site provisioning | Project team scoped | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. 23 fields (P1-A1). |
| estimating | estimate_tracking_record | Estimate Tracking Log | `EstimateTracking` | List | Project Site | Historical estimate submissions and outcomes | Tracking record | ProjectMaster (project_id FK) | record_id, project_id, status, outcome | EstimateOutcomes (domain-local) | — | Major versions | Index: record_id, project_id, status, outcome; grows over lifetime | Created during project site provisioning | Project team scoped | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. 21 fields (P1-A1). |
| estimating | estimating_team_member | Estimating Team Members | `EstimatingTeamMembers` | List | Shared Site | Estimating team roster with workload and specialties | Team member item | — | id, record_id, name, role, email | EstimatingRoles, EstimatingSpecialties (domain-local) | — | Major versions | Index: id, role; small stable list | Created once for estimating department | Domain team only | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. 7 fields (P1-A1). |

#### 4. Buyout (Commitments + Compliance)

| Domain | Entity | Logical Container Name | Physical Container Name | Container Type | Scope | Purpose | Primary Record Type | Parent / Related Container | Key Columns / Required Fields | Lookup / Join Dependencies | Document Pairing Pattern | Versioning Requirement | Indexing / Scale Notes | Provisioning Requirement | Security / Visibility Notes | Related Adapter / Package Owner | Notes |
|--------|--------|------------------------|-------------------------|----------------|-------|---------|--------------------|-----------------------------|-------------------------------|---------------------------|--------------------------|------------------------|------------------------|--------------------------|----------------------------|--------------------------------|-------|
| buyout | buyout_commitment | Buyout Commitments List | `BuyoutCommitments` | List | Project Site | Subcontracts, POs, and commitment tracking with compliance status | Commitment item | ProjectMaster (project_id FK) | record_id, id, project_id, commitment_number, status | CommitmentStatuses, ProcurementMethods, ContractTypes, CSICodes | — | Major versions | Index: record_id, project_id, commitment_number, status, csi_code; moderate-high volume | Created during project site provisioning | Project team scoped; financial fields domain team only | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. 34 fields (P1-A1). |
| buyout | commitment_milestone | Commitment Milestones | `CommitmentMilestones` | List | Project Site | Milestone tracking for commitments | Milestone item | BuyoutCommitments (commitment_id FK) | record_id, commitment_id, name, status | MilestoneStatuses (domain-local) | — | None | Index: commitment_id; child records | Created during project site provisioning | Inherits commitment visibility | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. 8 fields (P1-A1). |
| buyout | allowance_item | Allowance Items | `AllowanceItems` | List | Project Site | Allowance tracking and reconciliation | Allowance item | BuyoutCommitments (commitment_id FK) | record_id, commitment_id, item, value | — | — | Major versions | Index: commitment_id; child records | Created during project site provisioning | Financial fields domain team only | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. 10 fields (P1-A1). |
| buyout | long_lead_item | Long Lead Items | `LongLeadItems` | List | Project Site | Long lead procurement item tracking | Long lead item | BuyoutCommitments (commitment_id FK) | record_id, commitment_id, item, status | LongLeadStatuses (domain-local) | — | Major versions | Index: commitment_id, status; child records | Created during project site provisioning | Project team scoped | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. 8 fields (P1-A1). |
| buyout | value_engineering_item | Value Engineering Items | `ValueEngineeringItems` | List | Project Site | VE proposals and savings tracking | VE item | BuyoutCommitments (commitment_id FK) | record_id, commitment_id, item, status | VEStatuses (domain-local) | — | Major versions | Index: commitment_id, status; child records | Created during project site provisioning | Financial fields domain team only | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. 10 fields (P1-A1). |
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

#### 6. External Financial (P1-A6)

| Domain | Entity | Logical Container Name | Physical Container Name | Container Type | Scope | Purpose | Primary Record Type | Parent / Related Container | Key Columns / Required Fields | Lookup / Join Dependencies | Document Pairing Pattern | Versioning Requirement | Indexing / Scale Notes | Provisioning Requirement | Security / Visibility Notes | Related Adapter / Package Owner | Notes |
|--------|--------|------------------------|-------------------------|----------------|-------|---------|--------------------|-----------------------------|-------------------------------|---------------------------|--------------------------|------------------------|------------------------|--------------------------|----------------------------|--------------------------------|-------|
| financial | budget_line | Budget Lines | `BudgetLines` | List | Project Site | Canonical Procore budget line items with parsed dimensions and 14 financial metrics | Budget line | ProjectMaster (project_id FK) | line_id, batch_id, project_id, budget_code | — | — | Major versions | Index: batch_id, project_id, budget_code; ~100–500 lines per import | Created during project site provisioning | Project team scoped; financial fields confidential | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. P1-A6 governs 4 canonical entities. Snapshot-append model. |
| financial | _budget uploads_ | Budget Uploads Library | `BudgetUploadsLib` | Document Library | Project Site | Raw uploaded Procore budget CSV files retained for provenance | Budget file | ProjectMaster (project_id FK) | file name, upload_date, source_system | — | Paired with BudgetLines (batch_id) | Major versions | Low volume | Created during project site provisioning | Project team scoped | @hbc/data-access | Build-ready. CT: `HBDocumentItem`. Raw source files. |

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

#### 11. Responsibility Matrix (P1-A11)

| Domain | Entity | Logical Container Name | Physical Container Name | Container Type | Scope | Purpose | Primary Record Type | Parent / Related Container | Key Columns / Required Fields | Lookup / Join Dependencies | Document Pairing Pattern | Versioning Requirement | Indexing / Scale Notes | Provisioning Requirement | Security / Visibility Notes | Related Adapter / Package Owner | Notes |
|--------|--------|------------------------|-------------------------|----------------|-------|---------|--------------------|-----------------------------|-------------------------------|---------------------------|--------------------------|------------------------|------------------------|--------------------------|----------------------------|--------------------------------|-------|
| operations | project_responsibility_instance | Responsibility Matrices | `ResponsibilityMatrices` | List | Project Site | Project-level responsibility matrix instances (PM/Field/Owner Contract) | Matrix instance | ProjectMaster (project_id FK) | instance_id, project_id, family_id, template_id | Shared_ResponsibilityTemplates (hub) | — | Major versions | Index: project_id, family_id; low volume (1–3 per project) | Created during project site provisioning | Project team scoped | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. P1-A11 governs 10 entities. |
| operations | responsibility_assignment | Responsibility Assignments | `ResponsibilityAssignments` | List | Project Site | Normalized intersection records (item × role × assignment value) | Assignment record | ResponsibilityMatrices (instance_id FK) | assignment_id, item_instance_id, role_party_id, value_code | — | — | None | Index: item_instance_id; ~200–400 assignments per matrix | Created during project site provisioning | Project team scoped | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. Canonical junction records. |

#### 12. Subcontractor Scorecard (P1-A12)

| Domain | Entity | Logical Container Name | Physical Container Name | Container Type | Scope | Purpose | Primary Record Type | Parent / Related Container | Key Columns / Required Fields | Lookup / Join Dependencies | Document Pairing Pattern | Versioning Requirement | Indexing / Scale Notes | Provisioning Requirement | Security / Visibility Notes | Related Adapter / Package Owner | Notes |
|--------|--------|------------------------|-------------------------|----------------|-------|---------|--------------------|-----------------------------|-------------------------------|---------------------------|--------------------------|------------------------|------------------------|--------------------------|----------------------------|--------------------------------|-------|
| operations | scorecard_evaluation | Subcontractor Scorecards | `SubcontractorScorecards` | List | Project Site | Per-project per-subcontractor performance evaluations | Evaluation item | ProjectMaster (project_id FK), BuyoutCommitments (subcontractor linkage) | evaluation_id, project_id, subcontractor_display_name, official_final_flag | Shared_ScorecardRubrics (hub) | — | Major versions | Index: project_id, subcontractor_key, official_final_flag; low-moderate volume | Created during project site provisioning | Project team scoped; financial snapshots domain team only | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. P1-A12 governs 12 entities. |
| operations | criterion_score_record | Scorecard Criterion Scores | `ScorecardCriterionScores` | List | Project Site | Per-criterion scoring detail for subcontractor evaluations | Criterion score | SubcontractorScorecards (evaluation_id FK) | score_record_id, evaluation_id, criterion_id, score_raw | — | — | None | Index: evaluation_id; ~29 child records per evaluation | Created during project site provisioning | Inherits evaluation visibility | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. Canonical scoring detail. |

#### 13. Lessons Learned (P1-A13)

| Domain | Entity | Logical Container Name | Physical Container Name | Container Type | Scope | Purpose | Primary Record Type | Parent / Related Container | Key Columns / Required Fields | Lookup / Join Dependencies | Document Pairing Pattern | Versioning Requirement | Indexing / Scale Notes | Provisioning Requirement | Security / Visibility Notes | Related Adapter / Package Owner | Notes |
|--------|--------|------------------------|-------------------------|----------------|-------|---------|--------------------|-----------------------------|-------------------------------|---------------------------|--------------------------|------------------------|------------------------|--------------------------|----------------------------|--------------------------------|-------|
| operations | lessons_report_instance | Lessons Learned Reports | `LessonsReports` | List | Project Site | One-per-project lessons learned report with header and classification metadata | Report instance | ProjectMaster (project_id FK) | report_id, project_id, report_date, market_sector, delivery_method | — | — | Major versions | Index: project_id; one per project | Created during project site provisioning | Project team scoped | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. P1-A13 governs 8 entities. |
| operations | lesson_record | Lesson Records | `LessonRecords` | List | Project Site | Individual lesson records — the canonical search/reporting unit | Lesson record | LessonsReports (report_id FK) | lesson_id, report_id, category_key, applicability_score | LessonCategories, LessonImpactMagnitudes (hub dictionaries) | — | Major versions | Index: report_id, category_key, applicability_score; ~5–15 per report | Created during project site provisioning | Project team scoped | @hbc/data-access | Build-ready. CT: `HBBaseListItem`. 5 structured narrative fields + composed narrative. |

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

## Container Appendices — Physical Schema Definitions

Each appendix follows the standard 12-point sequence. All containers inherit shared site columns from `HBBaseListItem` (recordId, projectId, createdAt, updatedAt, createdBy, isActive, notes, sourceBatchId, sourceRowNumber) unless noted otherwise. Only domain-specific columns are listed below.

**Import findings and import batch metadata** for all imported data are stored in **Azure Table Storage** per P1-A1/A2 storage boundary — not in SharePoint lists. They are not given container appendices here.

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
| 10 | Security | Hub site inherited; read by all project sites |
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

These 7 dictionaries (ProjectTypes, ProjectStages, ProjectRegions, StateCodes, CountryCodes, DeliveryMethods, Sectors) share a common simple structure. Full schemas pending in P1-A5.

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
| 12 | Governing Schema | P1-A5 (schemas pending) |

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
| 10 | Security | Project team scoped; financial fields domain team only |
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
| 7 | Lookups | `csiCode` → Shared_CSICodes, `status` → CommitmentStatuses, `procurementMethod` → ProcurementMethods, `contractType` → ContractTypes |
| 8 | Indexes | `recordId`, `projectId`, `commitmentNumber`, `status`, `csiCode` |
| 9–11 | Standard | Major versions / Project team + financial domain team / Project site provisioning |
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
| 9–11 | Standard | Major versions / Financial domain team / Project site provisioning |
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
| 9–11 | Standard | Major versions / Financial domain team / Project site provisioning |
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
| 9–11 | Standard | Major versions / Compliance-sensitive; audit retention; approval fields privileged | Project site provisioning |
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
| 12 | Governing Schema | P1-A4 schedule_activity entity (16 canonical entities total) |

#### A.5.2 `ScheduleImportBatches`

| # | Property | Value |
|---|----------|-------|
| 1–4 | Standard | Project Site / List / `ScheduleImportBatches` / `HBBaseListItem` |
| 5 | Required Columns | `batchId` (Text), `projectId` (Text), `sourceFileName` (Text), `detectedFormat` (Choice: csv/msproject_xml/p6_xml/p6_xer), `importStatus` (Choice: pending/parsing/mapping/complete/failed), `uploadedBy` (Text), `uploadedAt` (DateTime) |
| 6 | Optional Columns | `sourceFileUrl` (Text), `detectedSourceProgram` (Text), `detectedSourceVersion` (Text), `parserVersion` (Text), `mappingVersion` (Text), `totalActivitiesParsed` (Number), `totalActivitiesMapped` (Number), `totalWarnings` (Number), `totalErrors` (Number), `completedAt` (DateTime), `batchNotes` (Multi-line) |
| 7 | Lookups | — |
| 8 | Indexes | `projectId`, `importStatus` |
| 9–11 | Standard | Major versions / Project team / Project site provisioning |
| 12 | Governing Schema | P1-A4 schedule_import_batch entity |

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
| 7 | Lookups | `costCodeTier3Code` → Shared_CostCodes (code match) |
| 8 | Indexes | `batchId`, `projectId`, `budgetCode` |
| 9–11 | Standard | Major versions / Financial confidential / Project site provisioning |
| 12 | Governing Schema | P1-A6 budget_line entity (4 canonical entities). Snapshot-append model. |

#### A.6.2 `BudgetUploadsLib`

| # | Property | Value |
|---|----------|-------|
| 1–4 | Standard | Project Site / Document Library / `BudgetUploadsLib` / `HBDocumentItem` |
| 5 | Required Columns | (metadata) `sourceSystem` (Text), `uploadDate` (DateTime) |
| 6 | Optional Columns | `snapshotDate` (Date), `batchId` (Text) |
| 7 | Lookups | — |
| 8 | Indexes | — |
| 9–11 | Standard | Major versions / Financial confidential / Project site provisioning |
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
| 12 | Governing Schema | P1-A8 kickoff_row entity (3 row subtypes) |

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
| 12 | Governing Schema | P1-A10 (8 canonical entities, 3 families, ~149 items) |

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
| 9–11 | Standard | Major versions / Project team; financial snapshots domain team / Project site provisioning |
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
| 0.6 | 2026-03-17 | Architecture | Completed physical-schema treatment for 15 Wave 1 seeded containers (project, estimating, buyout). Added content type references, build-ready status, and field counts to Notes. Updated section status from pending to build-ready framing. Column appendices remain next step. |
| 0.7 | 2026-03-17 | Architecture | Reorganized build-ready register into 13 execution-ordered sections. Added 15 new containers: shared dictionaries (9 hub-site + 4 template lists), external financial (2: budget lines + uploads lib), estimating kickoff (2: instances + rows), responsibility matrix (2: instances + assignments), lessons learned (2: reports + records). Total build-ready containers: ~46. |
| 0.8 | 2026-03-17 | Architecture | Added per-container appendix blocks (A.1–A.13) with 12-point physical schema sequence for all build-ready containers. Covers shared dictionaries (13), project/intake (2), estimating (4), buyout (9), schedule (3), external financial (2), operational register (1), estimating kickoff (2), permits (2), lifecycle checklists (1), responsibility matrix (2), scorecard (2), lessons learned (2). Import findings/batch metadata confirmed as Azure Table Storage (not SharePoint). |
