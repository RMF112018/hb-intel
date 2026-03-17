# P1-A3: SharePoint Lists & Libraries Schema Register

**Document ID:** P1-A3
**Phase:** 1 (Foundation)
**Classification:** Internal — Engineering
**Status:** Draft — Structure Established
**Date:** 2026-03-17
**Read With:** [P1-A1-Data-Ownership-Matrix.md](./P1-A1-Data-Ownership-Matrix.md), [P1-A2-Source-of-Record-Register.md](./P1-A2-Source-of-Record-Register.md), [P1-A4-Schedule-Ingestion-Normalization-Schema.md](./P1-A4-Schedule-Ingestion-Normalization-Schema.md), [current-state-map.md](../../blueprint/current-state-map.md)

---

## Purpose

Define the physical SharePoint container definitions — lists, libraries, paired patterns, and hub site structures — that implement the data ownership decisions made in P1-A1 and the source-of-record mappings established in P1-A2.

This register is the **engineering-level** companion to P1-A1's governance-level data ownership model. It translates logical domain-to-storage decisions into concrete SharePoint implementation: container names, column schemas, content types, lookup relationships, indexing strategy, versioning rules, and provisioning requirements.

**This document does not:**
- redefine data ownership or source-of-record authority (see P1-A1)
- redefine write safety classes, identity keys, or adapter paths (see P1-A2)
- cover Azure Table Storage, Redis, or external system schemas (those are not SharePoint containers)

---

## Relationship to P1-A1 and P1-A2

| Artifact | Role | Scope |
|----------|------|-------|
| **P1-A1** Data Ownership Matrix | Governance-level authority for data ownership, storage platform decisions, field-level ownership schema, lifecycle/retention/visibility/search/analytics participation | Logical: which data belongs where and who owns it |
| **P1-A2** Source-of-Record Register | Operational authority for adapter paths, identity keys, write safety classes, and conflict resolution | Operational: how adapters reach authoritative data |
| **P1-A3** SharePoint Schema Register (this document) | Engineering authority for physical SharePoint container definitions, column schemas, and implementation conventions | Physical: how SharePoint lists and libraries are structured |

**Reading order:** P1-A1 → P1-A2 → P1-A3. The governance decisions in P1-A1 drive the container choices here. The adapter paths in P1-A2 inform how containers are accessed.

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

**Status:** Container names and types are established from P1-A1 governance decisions. Physical column schemas are pending domain-by-domain schema approval (see Open Decisions).

### Wave 1 Domains

| Domain | Entity | Logical Container Name | Physical Container Name | Container Type | Scope | Purpose | Primary Record Type | Parent / Related Container | Key Columns / Required Fields | Lookup / Join Dependencies | Document Pairing Pattern | Versioning Requirement | Indexing / Scale Notes | Provisioning Requirement | Security / Visibility Notes | Related Adapter / Package Owner | Notes |
|--------|--------|------------------------|-------------------------|----------------|-------|---------|--------------------|-----------------------------|-------------------------------|---------------------------|--------------------------|------------------------|------------------------|--------------------------|----------------------------|--------------------------------|-------|
| project | Project | Project Master List | _pending schema approval_ | List | Hub Site | Master project records with identity, classification, financial, schedule, and status fields | Project item | Hub Site (root) | project_id, record_id, name, project_number, status | ProjectTypes, ProjectStages, ProjectRegions (shared dictionaries) | — | Major versions | Index: project_id, record_id, project_number, active; expect hundreds to low thousands of rows | Created during hub site provisioning | Inherits hub site permissions; project team scoped | @hbc/data-access | 60 fields defined in P1-A1 |
| project | new_project_request | New Project Request List | _pending schema approval_ | List | Hub Site | Intake requests for new project numbers | Request item | Project Master List (post-approval linkage) | request_id, project_name, request_status, requester_email | — | — | Major versions | Index: request_id, request_status; low volume | Created during hub site provisioning | Restricted to project administration during review | @hbc/data-access | 32 fields defined in P1-A1 |
| estimating | estimating_pursuit | Estimating Pursuit List | _pending schema approval_ | List | Project Site | Active bid pursuits with milestone tracking and checklist fields | Pursuit item | Project Master List (project_id FK) | record_id, project_id, status, deliverable, leadEstimator | EstimateSources, EstimateDeliverables, EstimateStatuses (domain-local) | — | Major versions | Index: record_id, project_id, status; moderate volume per project | Created during project site provisioning | Project team scoped | @hbc/data-access | 24 fields defined in P1-A1 |
| estimating | preconstruction_engagement | Preconstruction Engagement List | _pending schema approval_ | List | Project Site | Active preconstruction engagements with budget tracking | Engagement item | Project Master List (project_id FK) | record_id, project_id, status, currentStage | PreconStages (domain-local) | — | Major versions | Index: record_id, project_id, status; low-moderate volume | Created during project site provisioning | Project team scoped | @hbc/data-access | 23 fields defined in P1-A1 |
| estimating | estimate_tracking_record | Estimate Tracking Log | _pending schema approval_ | List | Project Site | Historical estimate submissions and outcomes | Tracking record | Project Master List (project_id FK) | record_id, project_id, status, outcome | EstimateOutcomes (domain-local) | — | Major versions | Index: record_id, project_id, status, outcome; grows over project lifetime | Created during project site provisioning | Project team scoped | @hbc/data-access | 21 fields defined in P1-A1 |
| estimating | estimating_team_member | Estimating Team Members | _pending schema approval_ | List | Shared Site | Estimating team roster with workload and specialties | Team member item | — | id, record_id, name, role, email | EstimatingRoles, EstimatingSpecialties (domain-local) | — | Major versions | Index: id, role; small stable list | Created once for estimating department | Domain team only | @hbc/data-access | 7 fields defined in P1-A1 |
| buyout | buyout_commitment | Buyout Commitments List | _pending schema approval_ | List | Project Site | Subcontracts, POs, and commitment tracking with compliance status | Commitment item | Project Master List (project_id FK) | record_id, id, project_id, commitment_number, status | CommitmentStatuses, ProcurementMethods, ContractTypes, CSICodes (shared/domain) | — | Major versions | Index: record_id, project_id, commitment_number, status, csi_code; moderate-high volume | Created during project site provisioning | Project team scoped; financial fields domain team only | @hbc/data-access | 34 fields defined in P1-A1 |
| buyout | commitment_milestone | Commitment Milestones List | _pending schema approval_ | List | Project Site | Milestone tracking for commitments | Milestone item | Buyout Commitments List (commitment_id FK) | record_id, commitment_id, name, status | MilestoneStatuses (domain-local) | — | None | Index: commitment_id; child records of commitments | Created during project site provisioning | Inherits commitment visibility | @hbc/data-access | 8 fields defined in P1-A1 |
| buyout | allowance_item | Allowance Items List | _pending schema approval_ | List | Project Site | Allowance tracking and reconciliation | Allowance item | Buyout Commitments List (commitment_id FK) | record_id, commitment_id, item, value | — | — | Major versions | Index: commitment_id; child records | Created during project site provisioning | Financial fields domain team only | @hbc/data-access | 10 fields defined in P1-A1 |
| buyout | long_lead_item | Long Lead Items List | _pending schema approval_ | List | Project Site | Long lead procurement item tracking | Long lead item | Buyout Commitments List (commitment_id FK) | record_id, commitment_id, item, status | LongLeadStatuses (domain-local) | — | Major versions | Index: commitment_id, status; child records | Created during project site provisioning | Project team scoped | @hbc/data-access | 8 fields defined in P1-A1 |
| buyout | value_engineering_item | Value Engineering Items List | _pending schema approval_ | List | Project Site | VE proposals and savings tracking | VE item | Buyout Commitments List (commitment_id FK) | record_id, commitment_id, item, status | VEStatuses (domain-local) | — | Major versions | Index: commitment_id, status; child records | Created during project site provisioning | Financial fields domain team only | @hbc/data-access | 10 fields defined in P1-A1 |
| buyout | subcontract_checklist_record | Subcontract Checklist Records | _pending schema approval_ | List | Project Site | Subcontract compliance checklist header records | Checklist record | Buyout Commitments List (commitment_id FK) | record_id, commitment_id, subcontractor_name | — | — | Major versions | Index: commitment_id; one per commitment | Created during project site provisioning | Compliance-sensitive; confidential business | @hbc/data-access | 21 fields defined in P1-A1 |
| buyout | subcontract_checklist_item | Subcontract Checklist Items | _pending schema approval_ | List | Project Site | Individual checklist requirement line items | Checklist item | Subcontract Checklist Records (checklist_record_id FK) | record_id, checklist_record_id, requirement_name, item_state | ChecklistItemStates, ChecklistRequirements (domain-local) | — | None | Index: checklist_record_id; ~19 items per checklist | Created during project site provisioning | Compliance-sensitive | @hbc/data-access | 8 fields defined in P1-A1 |
| buyout | compliance_waiver_request | Compliance Waiver Requests | _pending schema approval_ | List | Project Site | Insurance and licensing waiver requests with approval chain | Waiver request | Buyout Commitments List (commitment_id FK) | record_id, commitment_id, subcontractor_or_vendor_name | WaiverLevels (domain-local) | — | Major versions | Index: commitment_id; low volume per project | Created during project site provisioning | Compliance-sensitive; audit retention; approval fields privileged/admin | @hbc/data-access | 35 fields defined in P1-A1 |

### Wave 2+ Domains (Pending Field Expansion)

| Domain | Entity | Logical Container Name | Physical Container Name | Container Type | Scope | Purpose | Notes |
|--------|--------|------------------------|-------------------------|----------------|-------|---------|-------|
| leads | _pending_ | Leads List | _pending schema approval_ | List | Sales/BD Site | Lead/opportunity tracking | Fields pending Wave 2 expansion in P1-A1 |
| risk | _pending_ | Risk Register List | _pending schema approval_ | List | Project Site | Risk identification and mitigation tracking | Fields pending Wave 2 expansion in P1-A1 |
| scorecard | _pending_ | Bid Scorecards List | _pending schema approval_ | List | Project Site | Bid performance scoring | Fields pending Wave 2 expansion in P1-A1 |
| pmp | _pending_ | PMP Index List + PMP Library | _pending schema approval_ | Paired (List + Library) | Project Site | Project management plan documents with structured index | Fields pending Wave 2 expansion in P1-A1 |
| compliance | _pending_ | Compliance Records List + Compliance Library | _pending schema approval_ | Paired (List + Library) | Project Site | Compliance records with document attachments | Fields pending Wave 1 expansion in P1-A1 |
| contracts | _pending_ | Contract Metadata List + Contract Library | _pending schema approval_ | Paired (List + Library) | Project Site | Contract documents with structured metadata | Fields pending Wave 1 expansion in P1-A1 |
| schedule | _pending_ | Schedule Milestones List + Schedule Upload Library | _pending schema approval_ | List + Library | Project Site | Project schedule activities, relationships, and uploaded schedule files | Canonical entity model defined in P1-A4; containers pending P1-A1 field expansion and schema approval |

### Platform and Infrastructure Containers (Wave 3+)

Platform containers for auth, provisioning state, audit log, and project identity mapping are **not SharePoint containers** — they live in Azure Table Storage or Microsoft Graph / Entra ID. They are documented in P1-A1 and P1-A2 but are out of scope for this register.

---

## Physical Schema Conventions

### Column Naming
- Use camelCase for internal column names (e.g., `projectId`, `commitmentNumber`, `createdAt`)
- Display names may use title case with spaces (e.g., "Project ID", "Commitment Number")
- Prefix checklist fields with `checklist_` to avoid collision (e.g., `checklist_bidBond`)
- Prefix vendor contact fields with `vendorContact_` (e.g., `vendorContact_name`)
- Prefix bid tab link fields with `bidTabLink_` (e.g., `bidTabLink_bidTabId`)

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

### Content Types
- Use the default Item content type for most lists
- Create custom content types only when a list stores multiple distinct record types
- Document libraries should use custom content types to enforce required metadata columns

---

## Lookup and Reference Strategy

### Cross-List Lookups
- Use SharePoint lookup columns for parent-child relationships within the same site (e.g., Milestone → Commitment)
- Lookup columns reference the parent list's ID column
- Do not use cross-site lookups; use stable key fields (e.g., `project_id`) and resolve at the adapter layer

### Shared Reference Dictionaries
- Shared dictionaries (CSICodes, StateCodes, CountryCodes, ProjectTypes, etc.) should be stored as lists on the hub site
- Domain-local reference sets (EstimateSources, CommitmentStatuses, etc.) should be stored as lists on the relevant site scope
- Reference sets referenced by Choice columns should have their values populated from these dictionary lists

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

**Approval Status:** Pending — Structure established; physical schemas pending domain-by-domain approval
**Comments:** Container register seeded from P1-A1 domain classification. Physical column schemas will be defined wave-by-wave as field expansion is approved.

---

## Revision History

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 0.1 | 2026-03-17 | Architecture | Initial structure; container register seeded from P1-A1 Wave 1 domains. Physical column schemas pending approval. |
