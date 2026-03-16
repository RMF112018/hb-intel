# P1-A1: Data Ownership Matrix

**Document ID:** P1-A1
**Phase:** 1 (Foundation)
**Classification:** Internal — Architecture
**Status:** Draft — Schema Implemented
**Date:** 2026-03-16
**Read With:** [P1-A2-Source-of-Record-Register.md](./P1-A2-Source-of-Record-Register.md), [current-state-map.md](../../blueprint/current-state-map.md)

---

## Purpose

Define which data categories belong in which storage platforms and establish the ownership model for each domain's data. This matrix governs Phase 1 adapter design and data provisioning strategy, ensuring HB Intel respects SharePoint as the primary business data store while using Azure Table Storage for operational state.

---

## Data Category Taxonomy

HB Intel data falls into these categories, each with different storage and sync requirements:

| Category | Definition | Typical Lifetime | Primary Consumer |
|----------|-----------|-----------------|-----------------|
| **Transactional** | Business events, state changes, and commitments | Months to years | Domain repositories |
| **Reference** | Lookup tables, enumerations, configurations | Months to years (stable) | Dropdowns, filters, UI bindings |
| **Document Metadata** | SharePoint file attributes (name, modified, author, version) | Tied to document lifecycle | Search, audit, UI display |
| **Workflow State** | Provisioning status, approval workflow, transitional state | Hours to weeks | Platform orchestration, UI status |
| **Audit History** | Change logs, transition records, decision trails | Years (immutable) | Compliance, traceability, forensics |
| **Field Capture** | Measurements, observations, photos, time-series telemetry | Project duration | Domain-specific queries, analytics |
| **Search Index Inputs** | Denormalized or tokenized data fed to search service | Hours (eventual consistency) | Full-text search, discovery |
| **AI Context Inputs** | Data prepared for ML/AI inference (risk scoring, cost prediction) | Hours to days | AI/ML pipeline, recommendations |

---

## Storage Platform Decision Table

Each platform in the HB Intel stack owns specific data categories:

| Platform | Owns | Does NOT Own | Notes |
|----------|------|--------------|-------|
| **SharePoint Lists** | Transactional, reference, document metadata, workflow state (list items with status fields) | Operational ephemeral state, audit history, time-series telemetry | Single source of truth for business data; schema provisioned per project site |
| **SharePoint Document Libraries** | Document content, document metadata, version history | Data embedded in documents (must be extracted and versioned separately) | Content versioning and permissions tied to site/library; not used for bulk transactional state |
| **Azure Table Storage** | Workflow state (provisioning, approval queues), audit history, operational ephemeral state, cache invalidation signals | Authoritative business data, user identity, reference lookups | Append-only logs, high-throughput state transitions; GDPR-safe retention policy |
| **Redis Cache** | Ephemeral query results, session tokens, rate-limiting counters | Persistent state, audit trails, identity data | Non-authoritative; loss does not corrupt business data; sub-minute TTL typical |
| **External Systems** | Domain-specific data (Procore timesheets, Sage accounting, Autodesk schedules) | HB-provisioned site identity, project portfolio hierarchy | Federated identity; write-back through adapters only; Phase 4+ scope |
| **Microsoft Graph / Entra ID** | User identity (UPN, display name, group membership, email) | Project business data, domain-specific reference | Source of truth for authentication and RBAC; read-only in Phase 1 |
| **Azure SQL** | Long-term data warehouse, analytics, complex cross-project queries | Transactional writes (read-mostly copy), real-time state | Phase 7+ target; not in scope for Phase 1 |

---

## Domain Data Classification Table

This table maps each HB Intel domain to its primary store, read/write paths, and sync strategy:

| Domain | Primary Store | Write Path | Read Path | Sync Strategy | Phase |
|--------|---------------|-----------|-----------|---------------|-------|
| **leads** | SharePoint List (Sales site) | Proxy adapter → AF → PnPjs → List item POST | Proxy adapter → AF → PnPjs → List query | Real-time on write; list view polling for external changes | 1 |
| **project** | SharePoint Hub site + List | Proxy adapter → AF → PnPjs → Hub site provision + list item | Proxy adapter → AF → PnPjs → Hub list query | Provisioning event writes to Table Storage; then propagates to SharePoint | 1 |
| **estimating** | SharePoint List (project site) | Proxy adapter → AF → PnPjs → List item POST/PATCH | Proxy adapter → AF → PnPjs → List query | Real-time; uses numeric item ID as stability anchor | 1 |
| **schedule** | SharePoint List (project site) | Proxy adapter → AF → PnPjs → List item (structured as event records) | Proxy adapter → AF → PnPjs → List query + date filtering | Real-time; supports milestone grouping | 1 |
| **buyout** | SharePoint List (project site) | Proxy adapter → AF → PnPjs → List item with PO metadata | Proxy adapter → AF → PnPjs → List query | Real-time; PO state tracked in list columns | 1 |
| **compliance** | SharePoint List + Document Library | Proxy adapter → AF → PnPjs → List item + doc upload | Proxy adapter → AF → PnPjs → List query + doc retrieval | Real-time; compliance records immutable after closure | 1 |
| **contracts** | SharePoint Document Library + List (contract metadata) | Proxy adapter → AF → PnPjs → Doc upload + metadata item | Proxy adapter → AF → PnPjs → Lib query + metadata join | Real-time; contract amendments tracked via doc versions | 1 |
| **risk** | SharePoint List (project site) | Proxy adapter → AF → PnPjs → List item with risk attributes | Proxy adapter → AF → PnPjs → List query | Real-time; risk status and mitigation tracked in list columns | 1 |
| **scorecard** | SharePoint List (project site) | Proxy adapter → AF → PnPjs → List item (bid performance data) | Proxy adapter → AF → PnPjs → List query | Real-time; scorecards tied to lead and project context | 1 |
| **pmp** | SharePoint Document Library + List | Proxy adapter → AF → PnPjs → Doc upload + index item | Proxy adapter → AF → PnPjs → Lib query + metadata | Real-time; PMP is versioned document with structured outline | 1 |
| **auth** | Microsoft Graph / Entra ID | N/A (read-only; MSAL OBO) | MSAL OBO flow → AF → Graph query (users, roles, groups) | Cache in Azure Table Storage (eventual consistency, <5 min TTL) | 1 |

### Provisioning and Operational State

| Data | Primary Store | Write Path | Read Path | Sync Strategy | Phase |
|------|---------------|-----------|-----------|---------------|-------|
| **Provisioning state** | Azure Table Storage (partition by project ID) | Provisioning orchestrator → AF → Table insert/update | Status service → AF → Table query | Real-time; triggers downstream SharePoint site provisioning | 1 |
| **Audit log** | Azure Table Storage (append-only partition) | Adapter → AF → Table append | Audit service → AF → Table query (time range) | Eventual consistency; immutable; GDPR-safe retention | 1 |
| **Project identity mapping** | Azure Table Storage + SharePoint hub site ID | Provisioner → AF → Table + SharePoint site correlation | Cache + on-demand lookup | Real-time on provisioning; cached for reads | 1 |

---

## Storage Platform Capability Alignment

### SharePoint Lists
- **Best for:** Transactional domain data, reference data, structured workflow state
- **Limits:** Row size (5000 items soft limit per view; use incremental load), query latency (200-500ms typical), no aggregation queries
- **Consistency:** Strong consistency within list; eventual consistency across farms
- **Phase 1 Strategy:** All domain business data lives here; AF adapters use PnPjs for CRUD

### Azure Table Storage
- **Best for:** Operational state, audit trails, high-throughput writes, project identity mapping
- **Limits:** Partition key strategy critical (partition by project ID); 1 MB row size limit
- **Consistency:** Strong consistency within partition; eventual across partitions
- **Phase 1 Strategy:** Provisioning state, audit logs, project ID mapping; no business data

### Redis
- **Best for:** Session tokens, query result caching, rate limiting, ephemeral coordination
- **Limits:** No persistence; loss is acceptable
- **Consistency:** N/A (non-authoritative)
- **Phase 1 Strategy:** Optional; not required for MVP; future optimization

### External Systems
- **Phase 1 Role:** None (stub adapters only)
- **Phase 4+ Strategy:** Federated reads via adapters; write-back for time entries, cost actuals

---

## Official Field-Level Column Schema

The matrix now uses a **standard field-level row model** where each row represents one field within a domain entity. This schema governs Phase 1 adapter design, SharePoint list schema planning, and data ownership expansion.

Not every row will populate every column — relationship columns are blank for non-relational fields, temporal columns are blank for non-temporal fields, etc. — but all columns are part of the official structure and must be considered during domain expansion.

### Column Definitions

#### Core Identity and Meaning

| Column | Definition |
|--------|-----------|
| `Domain` | The HB Intel business domain that owns this field (e.g., project, estimating, buyout) |
| `Entity` | The logical entity or record type within the domain (e.g., BidItem, PurchaseOrder, RiskEntry) |
| `Field Name` | The canonical field name as it appears in code and schema definitions |
| `Business Meaning` | Plain-language description of what this field represents to business users |
| `Data Type` | The storage data type (e.g., string, number, boolean, datetime, choice, lookup) |
| `Required?` | Whether this field must have a value for the record to be valid (Yes / No / Conditional) |

#### Ownership and Authority

| Column | Definition |
|--------|-----------|
| `Business Owner` | The business role or team accountable for the correctness of this field's data |
| `Technical Owner` | The package or service responsible for reading/writing this field |
| `Authority Type` | Whether this field is authoritative, mirrored, derived, or reference data in HB Intel |
| `Field Origin` | How the field's value is created — user entered, system generated, calculated, imported, or looked up |
| `Source System` | The system where this field's authoritative value originates (e.g., SharePoint, Entra ID, Procore) |
| `Primary Store` | The storage platform where this field is persisted in Phase 1 (e.g., SharePoint List, Azure Table Storage) |
| `System of Entry` | The application or interface through which the value is first captured |

#### Write / Read / Lifecycle Control

| Column | Definition |
|--------|-----------|
| `Write Control` | Who or what is allowed to modify this field and under what conditions |
| `Write Path` | The technical path used to write this field (e.g., AF → PnPjs → SharePoint List) |
| `Read Path` | The technical path used to read this field |
| `Lifecycle State` | When this field becomes editable or locked relative to the parent record's lifecycle |
| `Sync Behavior` | How and when changes to this field propagate across systems or caches |

#### Security / Governance

| Column | Definition |
|--------|-----------|
| `Sensitivity` | The data classification level governing access controls and handling requirements |
| `Visibility Scope` | Which users or roles can see this field's value |
| `Retention Class` | How long this field's data is retained and under what policy |
| `Validation Class` | The type of validation applied to this field on write |

#### Relationship / Reference Behavior

| Column | Definition |
|--------|-----------|
| `Related Entity` | The entity this field links to, if it represents a relationship (blank if not relational) |
| `Relationship Field Type` | The role this field plays in the relationship (foreign key, display mirror, lookup helper, etc.) |
| `Reference Source` | Where the allowed values come from for reference/lookup fields (e.g., shared dictionary, domain-local set) |
| `Reference Set Name` | The name of the specific reference dictionary or value set, if applicable |

#### Search / Analytics / AI Participation

| Column | Definition |
|--------|-----------|
| `Search Indexed?` | Whether this field participates in the search index (Yes / No) |
| `Search Role` | The role this field plays in search results — keyword content, facet, title, boost signal, or not searchable |
| `Analytics Included?` | Whether this field is included in analytics and reporting pipelines (Yes / No) |
| `Analytics Role` | The role this field plays in analytics — operational reporting, portfolio analytics, snapshot history, AI input, or excluded |

#### Operational and Trust Controls

| Column | Definition |
|--------|-----------|
| `Offline Behavior` | How this field behaves when the client is offline |
| `Source Visible to User?` | Whether the UI shows users where this field's value originated (Yes / No) |
| `Last Source Sync Tracked?` | Whether the system tracks when this field was last synced from its source (Yes / No) |
| `Reason Requirement` | Whether a reason must be captured when this field is changed under specific conditions |
| `Cache Pattern` | The caching and invalidation strategy for this field |

#### Versioning / Temporal / Record Identity

| Column | Definition |
|--------|-----------|
| `Native ID Field?` | Whether this field carries the source system's native identifier (Yes / No) |
| `Record ID Field?` | Whether this field carries the HB Intel domain-prefixed record identifier (Yes / No) |
| `Revision Pattern` | The revision or version history pattern applied to the parent entity |
| `Temporal Field Type` | The temporal role of this field — created, updated, effective, approved, closed, etc. (blank if not temporal) |
| `Status Family` | The status model family this field belongs to — lifecycle, approval, risk, document, or none |

#### Notes

| Column | Definition |
|--------|-----------|
| `Notes` | Free-text implementation notes, constraints, or cross-references |

---

### Allowed Values / Control Sets

#### Authority Type
| Value | Meaning |
|-------|---------|
| `Authoritative` | HB Intel is the system of record for this field |
| `Mirrored` | Value is copied from an external system and kept in sync |
| `Derived` | Value is calculated from other fields within HB Intel |
| `Reference` | Value comes from a shared or external reference set |

#### Field Origin
| Value | Meaning |
|-------|---------|
| `User Entered` | Captured directly from user input |
| `System Generated` | Created automatically by platform logic (e.g., IDs, timestamps) |
| `Calculated / Derived` | Computed from other field values |
| `Imported / Mirrored` | Brought in from an external source system |
| `Reference Lookup` | Selected from a reference dictionary or value set |

#### Write Control
| Value | Meaning |
|-------|---------|
| `User Editable` | Users can modify this field directly |
| `System Managed` | Only platform services write this field |
| `Approval Gated` | Changes require approval workflow before taking effect |
| `Read Only / Federated` | Field is read-only in HB Intel; authoritative value lives elsewhere |

#### Sync Behavior
| Value | Meaning |
|-------|---------|
| `Immediate on Write` | Changes propagate synchronously on write |
| `Eventual / Background Refresh` | Changes propagate asynchronously via background process |
| `Polled for External Changes` | HB Intel polls the source system for updates |
| `Immutable After Closure` | Field is no longer synced after parent record closure |
| `Cache with TTL` | Value is cached with a time-to-live expiration |
| `Not Synced (Reference Only)` | Static reference value; no ongoing sync |

#### Sensitivity
| Value | Meaning |
|-------|---------|
| `Public / Shared Internal` | Visible to all authenticated HB Intel users |
| `Internal Operational` | Visible to operational teams; not externally shared |
| `Confidential Business` | Restricted to authorized business roles |
| `Sensitive Identity / Access` | Contains identity or access control data; strict handling |
| `Regulated / Legal Hold` | Subject to regulatory retention or legal hold requirements |

#### Lifecycle State
| Value | Meaning |
|-------|---------|
| `Editable in Draft` | Field can be modified while the parent record is in draft |
| `Editable Until Approval` | Field can be modified until the parent record is approved |
| `Editable Until Closure` | Field can be modified until the parent record is closed |
| `Locked After Approval` | Field becomes read-only after approval |
| `Locked After Closure` | Field becomes read-only after closure |
| `Always System Managed` | Field is never directly editable by users |

#### Search Role
| Value | Meaning |
|-------|---------|
| `Keyword Content` | Included in full-text keyword search |
| `Facet / Filter` | Available as a filter or facet in search UI |
| `Result Title / Subtitle` | Displayed as title or subtitle in search results |
| `Search Boost Signal` | Used to boost relevance ranking |
| `Not Searchable` | Excluded from search index |

#### Analytics Role
| Value | Meaning |
|-------|---------|
| `Operational Reporting` | Included in day-to-day operational reports |
| `Portfolio / Cross-Project Analytics` | Included in cross-project portfolio views |
| `Snapshot History` | Captured in periodic snapshots for trend analysis |
| `AI Context Input` | Fed to AI/ML pipelines as inference context |
| `Not for Analytics` | Excluded from analytics pipelines |

#### Retention Class
| Value | Meaning |
|-------|---------|
| `Follows Parent Record` | Retained as long as the parent record exists |
| `Short-Lived Operational` | Retained for operational duration only; then purged |
| `Audit Retention` | Retained per audit policy (typically years) |
| `Compliance / Immutable Retention` | Immutable; retained per compliance or regulatory mandate |
| `Legal Hold Override` | Retention extended by legal hold; overrides normal policy |

#### Visibility Scope
| Value | Meaning |
|-------|---------|
| `Platform Internal` | Visible only to platform services and administrators |
| `Domain Team Only` | Visible to the domain team that owns the data |
| `Project Team Scoped` | Visible to all members of the project team |
| `Privileged / Admin Only` | Visible only to privileged or admin roles |
| `Source-System Restricted` | Visibility governed by the source system's access controls |

#### Validation Class
| Value | Meaning |
|-------|---------|
| `Format Validated` | Checked against a format pattern (e.g., email, phone, date) |
| `Reference-Matched` | Must match a value in a reference dictionary |
| `Range-Bounded` | Must fall within a defined numeric or date range |
| `Unique Within Entity` | Must be unique among records of the same entity type |
| `Unique Globally` | Must be unique across all records in the platform |
| `Conditional Rule` | Validated by a conditional business rule |
| `No Special Validation` | No validation beyond basic type checking |

#### Offline Behavior
| Value | Meaning |
|-------|---------|
| `Offline Create Allowed` | New records can be created offline and synced later |
| `Offline Edit Allowed` | Existing records can be edited offline and synced later |
| `Read-Only Cached Offline` | Field is readable from cache but not editable offline |
| `Queue Until Reconnected` | Changes are queued locally and submitted on reconnection |
| `Online Only` | Field requires an active connection to read or write |

#### Reason Requirement
| Value | Meaning |
|-------|---------|
| `No Reason Normally Required` | Standard edits do not require a reason |
| `Reason Required on Manual Override` | A reason must be provided when overriding a system value |
| `Reason Required on Rejection / Return` | A reason must be provided when rejecting or returning a record |
| `Reason Required on Status Reversal` | A reason must be provided when reversing a status transition |
| `Reason Required on Revision / Supersession` | A reason must be provided when creating a new revision |
| `Reason Required on Sensitive Edit` | A reason must be provided when editing a sensitive field |

#### Cache Pattern
| Value | Meaning |
|-------|---------|
| `Invalidate on Write` | Cache is invalidated immediately when the source field is written |
| `TTL Refresh` | Cache expires after a time-to-live period and is refreshed on next read |
| `Poll for External Change` | Cache is refreshed by polling the source system for changes |
| `Do Not Cache` | Field is always read from the authoritative source |

#### Relationship Field Type
| Value | Meaning |
|-------|---------|
| `Primary Foreign Key` | The stable key linking to the related entity's record ID |
| `Display Mirror` | A denormalized copy of a related field for display purposes |
| `Lookup Helper` | A field used to resolve lookups against the related entity |
| `Document Link` | A URL or path linking to a document in a library |
| `Reference Only` | A soft reference that does not enforce referential integrity |

#### Revision Pattern
| Value | Meaning |
|-------|---------|
| `None` | Entity does not support revision history |
| `Standard Revision Pattern` | Entity supports numbered revisions with reason capture |
| `Document Version History` | Revisions are managed by SharePoint document versioning |
| `Operational Event Lineage` | History is captured as a sequence of immutable event records |

#### Temporal Field Type
| Value | Meaning |
|-------|---------|
| `Created` | Timestamp when the record was first created |
| `Updated` | Timestamp of the most recent modification |
| `Effective` | Date when the record becomes effective |
| `Approved` | Timestamp when the record was approved |
| `Closed` | Timestamp when the record was closed |
| `Captured` | Timestamp when a measurement or observation was recorded |
| `Expires` | Date when the record or value expires |
| `Last Synced` | Timestamp of the most recent sync from source |
| `Not Temporal` | Field does not represent a point in time |

#### Status Family
| Value | Meaning |
|-------|---------|
| `Lifecycle Status` | Tracks the record through draft → active → closed lifecycle |
| `Approval Status` | Tracks approval workflow state (pending, approved, rejected, returned) |
| `Risk Status` | Tracks risk assessment state (identified, mitigated, accepted, closed) |
| `Document Status` | Tracks document workflow (draft, review, published, superseded) |
| `No Standard Status Family` | Field does not belong to a standard status model |

---

### Row Population Rules

These rules govern how rows are added during domain-by-domain field expansion:

1. **One row per field.** Each row represents a single field on a single entity. Do not combine multiple fields into one row.

2. **Document object model.** Documents (contracts, PMPs, compliance records) are modeled as a document object in SharePoint Document Library plus parent-linkage and metadata fields in a companion SharePoint List. The document content row references the library; metadata fields reference the list.

3. **Audit and event records.** Audit trails and operational events are not represented as scalar fields on parent entities. They use the separate audit/event record pattern — each event is its own row in the audit entity, stored in Azure Table Storage.

4. **Calculated fields.** Store a calculated field only when it materially supports one or more of: workflow decisions, filtering, search indexing, reporting/analytics, point-in-time snapshots, or read performance. Do not store calculated fields that can be trivially recomputed on read.

5. **External-system mirroring.** Mirror fields from external systems (Procore, Sage, Autodesk) only when approved for working visibility within HB Intel. Mirrored fields must have `Authority Type` = `Mirrored` and `Field Origin` = `Imported / Mirrored`. Phase 1 has no active external-system mirroring.

6. **Relationship fields.** Use stable keys (`Primary Foreign Key`) for entity relationships plus optional `Display Mirror` fields for UI convenience. Do not rely solely on display values for cross-entity linkage.

7. **Hybrid approval state.** Entities with approval workflows use the hybrid model: lifecycle status and approval status are tracked as separate fields in the same status family. Simple lifecycle entities use only lifecycle status.

8. **Dual-ID pattern.** Entities that have a native source-system ID (e.g., SharePoint numeric item ID) and an HB Intel domain-prefixed record ID (e.g., `est-123`) must have both represented as fields with `Native ID Field?` = Yes and `Record ID Field?` = Yes respectively.

9. **Reference dictionaries.** Use shared reference dictionaries (via `Reference Source` = shared dictionary) where values repeat across domains (e.g., status values, trade codes, unit types). Use domain-local reference sets only when the values are truly domain-specific.

10. **Search and analytics participation.** Not every field is searchable or analytics-eligible. Set `Search Indexed?` and `Analytics Included?` deliberately. Fields marked for search or analytics must have a corresponding `Search Role` or `Analytics Role`.

11. **Provenance and trust.** Surface `Source Visible to User?` and `Last Source Sync Tracked?` for fields where users need to assess data freshness or origin trustworthiness — particularly for mirrored, derived, or cached fields.

---

### Blank Starter Table Template

Use this template when expanding the matrix domain-by-domain. Copy one row per field.

| Domain | Entity | Field Name | Business Meaning | Data Type | Required? | Business Owner | Technical Owner | Authority Type | Field Origin | Source System | Primary Store | System of Entry | Write Control | Write Path | Read Path | Lifecycle State | Sync Behavior | Sensitivity | Visibility Scope | Retention Class | Validation Class | Related Entity | Relationship Field Type | Reference Source | Reference Set Name | Search Indexed? | Search Role | Analytics Included? | Analytics Role | Offline Behavior | Source Visible to User? | Last Source Sync Tracked? | Reason Requirement | Cache Pattern | Native ID Field? | Record ID Field? | Revision Pattern | Temporal Field Type | Status Family | Notes |
|--------|--------|------------|------------------|-----------|-----------|----------------|-----------------|----------------|--------------|---------------|---------------|-----------------|---------------|------------|-----------|-----------------|---------------|-------------|------------------|-----------------|------------------|----------------|-------------------------|------------------|--------------------|--------------------|-------------|---------------------|----------------|------------------|-------------------------|---------------------------|--------------------|---------------|-------------------|------------------|------------------|---------------------|---------------|-------|
| | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | |

---

## Field Expansion Rollout Order

Field-level rows will be added to the matrix in priority waves. Each wave expands the matrix for the listed domains using the official column schema above.

### Wave 1 — Core Business Domains
- `project` — **recommended first expansion anchor** (drives relationships, identifiers, document linkage, and cross-domain context for all other domains)
- `estimating`
- `buyout`
- `compliance`
- `contracts`

### Wave 2 — Extended Business Domains
- `leads`
- `risk`
- `scorecard`
- `pmp`

### Wave 3 — Platform and Infrastructure Domains
- `auth` (user identity, roles, group membership)
- provisioning state
- audit log
- project identity mapping
- search/analytics support structures

---

## Open Decisions and Unknowns

### Resolved Decisions

These items were resolved through the field-level schema design interview and are now encoded in the Official Field-Level Column Schema above.

| Decision | Resolution | Reference |
|----------|-----------|-----------|
| **SharePoint list schema per domain** | Resolved. The official column schema defines the field-level structure. Domain expansion follows the priority-wave rollout order. | Column Schema, Field Expansion Rollout Order |
| **Identity key stability** | Resolved. Dual-ID pattern: native source-system ID + HB Intel domain-prefixed record ID (e.g., `est-12345`). Both are tracked per field via `Native ID Field?` and `Record ID Field?` columns. | Row Population Rules §8, P1-A2 Identity Key Strategy |
| **Cross-domain data joins** | Resolved. Stable linked-key relationship pattern using `Primary Foreign Key` for entity linkage plus optional `Display Mirror` fields for UI convenience. | Row Population Rules §6, Relationship Field Type control set |
| **Workflow approval state location** | Resolved. Hybrid approval-state model: lifecycle status and approval status as separate fields within the same entity, tracked in SharePoint List columns. Complex state machines remain in Azure Table Storage for provisioning and audit. | Row Population Rules §7, Status Family control set |
| **Cache invalidation strategy** | Resolved. Event-driven cache invalidation with TTL fallback. Encoded as `Cache Pattern` column with values: Invalidate on Write, TTL Refresh, Poll for External Change, Do Not Cache. | Cache Pattern control set |

### Open Decisions

| Decision | Scope | Owner | Target Phase |
|----------|-------|-------|--------------|
| **Audit log retention policy** | GDPR retention windows, PII masking rules, archive strategy | Legal + platform ops | Phase 1 (late) |
| **Search and analytics data pipeline** | Does Phase 1 include search/analytics, or is that Phase 3+? If Phase 3+, where does denormalized data live in the interim? | Product roadmap | Phase 3+ |

---

## Data Ownership: Clear Boundaries

### Boundary 1: SharePoint is Authoritative for Business Data
- All transactional domain data (leads, project, estimating, schedule, buyout, compliance, contracts, risk, scorecard, pmp) originates and lives in SharePoint.
- AF adapters act as read-write bridges; they do not transform or filter domain data arbitrarily.
- If a conflict arises between SharePoint and cache/local copies, SharePoint wins.

### Boundary 2: Azure Table Storage Owns Operational State and Audit
- Provisioning state, approval workflow queues, audit logs, project identity mapping are Table Storage authority.
- SharePoint never contains "how we got here"; audit trails are immutable in Table Storage.
- AF services read from both layers and correlate data.

### Boundary 3: Microsoft Graph is Read-Only Identity Authority
- User identity (UPN, email, groups, roles) is read-only from Entra ID via Graph API.
- RBAC decisions are made client-side (after AF returns Graph user/group data) or server-side (AF checks roles before allowing writes).
- Phase 1 caches user/group data in Table Storage or Redis for performance; this cache is not authoritative.

### Boundary 4: External Systems Are Federated (Phase 4+)
- In Phase 1, external systems are not integrated; only stub adapters exist.
- When Phase 4+ integrates Procore, Sage, Autodesk, write-back is always through adapters, never direct.

---

## Decision Owners and Approval

| Role | Name | Approval Date |
|------|------|----------------|
| Platform Architecture Lead | — | — |
| Security and Compliance Lead | — | — |
| SharePoint Infrastructure Owner | — | — |

**Approval Status:** Pending
**Comments:** Document ready for stakeholder review. Decisions on audit retention, cache strategy, and identity wrapping are critical for Phase 1 readiness.

---

## Revision History

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 0.1 | 2026-03-16 | Architecture | Initial draft; foundation for P1-A2 and adapter design |
| 0.2 | 2026-03-16 | Architecture | Field-level column schema implemented: 35 official columns, 18 controlled enumerations, row population rules, blank template, priority-wave rollout order. Resolved 5 of 7 open decisions. |
