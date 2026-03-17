# P1-A15: Prime Contracts Schema

**Document ID:** P1-A15
**Phase:** 1 (Foundation)
**Classification:** Internal — Engineering
**Status:** Draft
**Date:** 2026-03-17
**Read With:** [P1-A1-Data-Ownership-Matrix.md](./P1-A1-Data-Ownership-Matrix.md), [P1-A2-Source-of-Record-Register.md](./P1-A2-Source-of-Record-Register.md), [P1-A3-SharePoint-Lists-Libraries-Schema-Register.md](./P1-A3-SharePoint-Lists-Libraries-Schema-Register.md)

---

## Purpose

Define the canonical schema for owner/client-facing prime contracts — the top-level contractual agreements between the general contractor (HB Intel operator) and the project owner. This domain is distinct from subcontractor commitments (buyout domain, P1-A6) and covers contract identity, lifecycle status, financial tracking (original amount, change orders, invoicing, payments), ERP sync status, and owner/vendor contact snapshots.

The source data originates from Procore and represents a mirrored/imported view of prime contract state. HB Intel stores this data as authoritative within its domain while preserving external system provenance for federation.

---

## Relationship to P1-A1 / P1-A2 / P1-A3

| Artifact | Relationship |
|----------|-------------|
| **P1-A1** | The `contracts` domain in P1-A1 references prime contract data. This schema defines the canonical entity model. |
| **P1-A2** | Prime contract data follows P1-A2 adapter patterns for SharePoint persistence and identity rules. |
| **P1-A3** | P1-A3 defines the SharePoint list that stores prime contract records per project site. |
| **P1-A6** | External financial domain covers budgets and Procore-sourced financial data. Prime contracts complement this with owner-facing contract financials. |

---

## Scope and Non-Scope

### In Scope
- Prime contract canonical schema (single flat entity — no child records in source)
- Canonical identity strategy separating business identity from external system identity
- Financial field classification (authoritative vs derived)
- Owner/vendor contact snapshot model
- ERP sync status tracking
- Lifecycle status model
- Import batch / provenance tracking
- Storage-boundary alignment

### Out of Scope
- Individual change order records (source has aggregate totals only; CO line items require separate data source)
- Individual invoice/payment records (source has aggregate totals only)
- Contract document library / attachments (no attachments in source; library deferred to Phase 2)
- Vendor/owner registry linkage (snapshot fields only in Phase 1)
- Contract-to-buyout (subcontract) cross-reference (Phase 2)
- Subcontractor contracts (governed by buyout domain / P1-A6)
- SharePoint physical container definitions (P1-A3)

---

## Source File Analysis

**File:** `docs/reference/example/prime-contracts.json`

| Property | Value |
|----------|-------|
| Format | JSON array of contract objects |
| Total records | 20 |
| Structure | Flat (no nested children) |
| `Number` uniqueness | Globally unique (20/20) |
| Source system | Procore (inferred from field naming, numeric `project_id`, `ERP Status`) |

### Field Inventory

| Field | Type | Purpose | Notes |
|-------|------|---------|-------|
| `project_id` | number | Procore project identifier | External system ID — NOT HB Intel canonical |
| `Number` | string | Contract number (e.g., `FL-SE-001`) | Natural business key; globally unique |
| `Owner/Client` | string | Owner/client display name | Vendor/party display; same entity as `Vendor` in data |
| `Title` | string | Contract title | Display |
| `ERP Status` | string | ERP sync state | 2 values: "Not Ready" (13), "Synced" (7) |
| `Status` | string | Contract lifecycle status | 4 values: Draft (7), Approved (7), Out For Signature (4), Pending (2) |
| `Executed` | string | Whether contract is executed | "Yes"/"No"; correlates with Status=Approved |
| `Original Contract Amount` | number | Original contract value (USD) | Authoritative financial |
| `Approved Change Orders` | number | Net approved CO value | Can be negative; authoritative |
| `Revised Contract Amount` | number | Original + approved COs | Derivable; stored for performance |
| `Pending Change Orders` | number | Pending CO value | Authoritative |
| `Draft Change Orders` | number | Draft CO value | Authoritative |
| `Invoiced` | number | Total invoiced to date | Authoritative |
| `Payments Received` | number | Total payments received | Authoritative |
| `% Paid` | number | Payment percentage (0–1 scale) | Derivable (payments / revised) |
| `Remaining Balance Outstanding` | number | Remaining balance | Derivable (revised - payments) |
| `Private` | string | Privacy flag | "Yes"/"No" |
| `Attachments` | number | Attachment count | Always 0 in sample |
| `Vendor` | string | Vendor display name | Same as Owner/Client — the counterparty |
| `Primary Contact` | string | Primary contact display name | Always "Default" in sample |
| `Vendor Zip Code` | string | Vendor address: zip | Contact snapshot |
| `Vendor Street` | string | Vendor address: street | Contact snapshot |
| `Vendor State` | string | Vendor address: state | Contact snapshot |
| `Company Name` | string | Contractor company name | Always "Hedrick Brothers" — self-referential |
| `Vendor Fax` | string | Vendor fax | Contact snapshot; empty in sample |
| `Vendor Phone` | string | Vendor phone | Contact snapshot |
| `Project Number` | string | HB Intel project number | Matches contract `Number` in sample |
| `Project Name` | string | Project display name | Display mirror |
| `Vendor City` | string | Vendor address: city | Contact snapshot |
| `Email Address` | string | Owner/client email | Contact snapshot |
| `Description` | string | Contract description | HTML-formatted rich text |
| `Signed Contract Received Date` | string | Signature receipt date | Empty string when unsigned; date string when signed |

### Key Findings

| Finding | Detail |
|---------|--------|
| `Number` is globally unique | 20/20 unique; reliable as natural business key |
| `project_id` is Procore-specific | Numeric ID from Procore; preserved but not canonical |
| Financial fields mix authoritative and derived | `Revised = Original + Approved COs`; `% Paid = Payments / Revised`; `Remaining = Revised - Payments` |
| Vendor fields represent the owner/client | The counterparty to the GC, not a subcontractor |
| `Company Name` is self-referential | Always "Hedrick Brothers Construction Co., Inc." — the GC identity |
| No child records in source | Change orders, invoices, and payments exist only as aggregate totals |
| No attachments | All records have `Attachments = 0`; no document library needed in Phase 1 |
| ERP sync state is operational metadata | Tracks whether contract data is synchronized with external ERP |

---

## Canonical Entity Model

### Entity Summary

| # | Entity | Purpose | Source |
|---|--------|---------|--------|
| 1 | `prime_contract` | Owner-facing prime contract record with identity, lifecycle, financials, and contact snapshots | prime-contracts.json |
| 2 | `contract_import_batch` | Import provenance tracking | Platform operational |
| 3 | `contract_import_finding` | Validation findings | Platform operational |

### prime_contract

The primary prime contract record. One row per owner/client contract.

| Field | Type | Required | Key | Description |
|-------|------|----------|-----|-------------|
| contract_id | string | Yes | PK (surrogate) | HB Intel canonical contract identifier |
| batch_id | string | No | FK | FK to contract_import_batch (null for user-entered contracts) |
| project_id | string | Yes | FK | FK to HB Intel project domain (UUID) |
| source_project_id | string | No | — | Procore numeric project ID (external system identity; preserved for federation) |
| contract_number | string | Yes | NK (unique) | Contract number (e.g., `FL-SE-001`); natural business key; unique within HB Intel |
| title | string | No | — | Contract title |
| description | text | No | — | Contract description (may contain HTML) |
| owner_client_display | string | No | — | Owner/client display name (raw from source; always preserved; Class H pattern) |
| owner_client_key | string | No | — | Canonical owner/client key when resolved via vendor/party registry; nullable if unresolved |
| primary_contact_display | string | No | — | Primary contact display name (Class G person-attribution; raw from source) |
| primary_contact_key | string | No | — | Canonical person identity (UPN when resolved); nullable if unresolved |
| contract_status | string | Yes | — | Lifecycle status: Draft, Pending, Out For Signature, Approved |
| is_executed | boolean | No | — | Whether contract is executed (normalized from "Yes"/"No") |
| is_private | boolean | No | — | Privacy/visibility flag (normalized from "Yes"/"No") |
| erp_status | string | No | — | ERP sync status: not_ready, synced (operational metadata) |
| original_contract_amount | number | No | — | Original contract value (USD); authoritative |
| approved_change_orders | number | No | — | Net approved change order value (can be negative); authoritative |
| revised_contract_amount | number | No | — | Original + approved COs; **derived but stored** for query performance |
| pending_change_orders | number | No | — | Pending change order value; authoritative |
| draft_change_orders | number | No | — | Draft change order value; authoritative |
| invoiced_amount | number | No | — | Total invoiced to date; authoritative |
| payments_received | number | No | — | Total payments received; authoritative |
| percent_paid | number | No | — | Payment percentage (0–1); **derived** (payments / revised); stored for performance |
| remaining_balance | number | No | — | Remaining balance outstanding; **derived** (revised - payments); stored for performance |
| vendor_street | string | No | — | Owner/client address: street (contact snapshot) |
| vendor_city | string | No | — | Owner/client address: city (contact snapshot) |
| vendor_state | string | No | — | Owner/client address: state (contact snapshot) |
| vendor_zip_code | string | No | — | Owner/client address: zip (contact snapshot) |
| vendor_phone | string | No | — | Owner/client phone (contact snapshot) |
| vendor_fax | string | No | — | Owner/client fax (contact snapshot) |
| email_address | string | No | — | Owner/client email (contact snapshot) |
| company_name | string | No | — | Contractor company name (self-referential; always HB operator company) |
| project_number_snapshot | string | No | — | Project number display mirror from source |
| project_name_snapshot | string | No | — | Project name display mirror from source |
| signed_contract_received_date | date | No | — | Date signed contract was received; null when unsigned |
| attachment_count | number | No | — | Source attachment count (always 0 in Phase 1 sample) |
| is_active | boolean | Yes | — | Whether contract record is currently active |
| created_at | datetime | Yes | — | Record creation timestamp |
| updated_at | datetime | Yes | — | Last modification timestamp |
| notes | text | No | — | Implementation notes |

### contract_import_batch

Tracks each prime contract import operation for provenance.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| batch_id | string | Yes | Import batch identifier |
| project_id | string | No | FK to project domain (null for multi-project imports) |
| source_system | string | Yes | Source system name (e.g., "Procore") |
| source_file_name | string | Yes | Original file name |
| import_status | string | Yes | pending, parsing, complete, failed |
| total_contracts_imported | number | No | Contracts processed |
| total_warnings | number | No | Non-fatal findings |
| total_errors | number | No | Fatal findings |
| uploaded_by | string | Yes | Uploader identity (UPN) |
| uploaded_at | datetime | Yes | Upload timestamp |
| completed_at | datetime | No | Processing completion timestamp |
| parser_version | string | No | Parser version used |
| notes | text | No | Import notes |

### contract_import_finding

Validation findings from prime contract import.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| finding_id | string | Yes | Finding identifier |
| batch_id | string | Yes | FK to contract_import_batch |
| severity | string | Yes | error, warning, info |
| category | string | Yes | parse_error, validation_failure, derivation_mismatch, mapping_warning |
| field_name | string | No | Source field name |
| message | string | Yes | Human-readable description |

---

### Keying and Uniqueness Rules

| Rule | Decision |
|------|----------|
| **Primary key** | `contract_id` (surrogate, system-generated) |
| **Natural business key** | `contract_number` — globally unique; enforced as uniqueness constraint |
| **Project linkage** | `project_id` FK to HB Intel project domain (UUID); one prime contract per project expected but not enforced |
| **External system identity** | `source_project_id` preserves Procore numeric project ID; authoritative for Procore only |
| **Repeat import handling** | Same `contract_number` across batches represents the same logical contract; latest batch = current state |

---

### Canonical Identity Strategy (Frozen)

The canonical prime contract identity is explicitly separated from all other identity layers:

| Identity Layer | Field | Role | Authoritative For |
|---------------|-------|------|-------------------|
| **HB Intel canonical identity** | `contract_id` | Surrogate PK; system-generated string | All HB Intel cross-domain references |
| **Natural business key** | `contract_number` | Human-readable contract number (e.g., `FL-SE-001`); uniqueness constraint | Human identification and deduplication |
| **Cross-domain anchor** | `project_id` | FK to HB Intel project (UUID) | Project linkage |
| **External system identity** | `source_project_id` | Procore numeric project ID | Procore federation and sync |
| **ERP sync marker** | `erp_status` | Operational sync state | ERP system state tracking |
| **SharePoint item identity** | _(internal, never exposed)_ | SP numeric item ID | Internal storage only |
| **Document locator** | _(not applicable in Phase 1)_ | No paired library; documents deferred | — |

**Key invariants:**
- `contract_id` (surrogate) is the canonical identity for all HB Intel operations, adapters, and cross-domain references
- `contract_number` is the human-readable natural key but is NOT the primary key
- `source_project_id` (Procore) is preserved for federation but is NOT the canonical identity
- SharePoint numeric item IDs are never exposed in API contracts or client state
- No document URL or library path is used as identity

### Identity Class Alignment

| Entity | Identity Class | Identity Key | Notes |
|--------|---------------|-------------|-------|
| `prime_contract` | B (SP-backed business record) | `contract_id` (surrogate); `contract_number` natural key (unique) | `source_project_id` preserved for Procore federation |
| `contract_import_batch` | E (import-batch) | `batch_id` (surrogate, system-generated) | `source_file_name` is metadata, not identity |
| `contract_import_finding` | J (findings/audit) | `finding_id` (surrogate); batch-scoped | Append-only; immutable once logged |

---

### Financial Field Classification

| Field | Classification | Derivation Rule | Storage Decision |
|-------|---------------|-----------------|------------------|
| `original_contract_amount` | **Authoritative** | Source value | Stored as-is |
| `approved_change_orders` | **Authoritative** | Source value (aggregate; can be negative) | Stored as-is |
| `revised_contract_amount` | **Derived** | `original + approved_change_orders` | Stored for query performance; revalidated on import |
| `pending_change_orders` | **Authoritative** | Source value | Stored as-is |
| `draft_change_orders` | **Authoritative** | Source value | Stored as-is |
| `invoiced_amount` | **Authoritative** | Source value | Stored as-is |
| `payments_received` | **Authoritative** | Source value | Stored as-is |
| `percent_paid` | **Derived** | `payments_received / revised_contract_amount` | Stored for performance; revalidated on import |
| `remaining_balance` | **Derived** | `revised_contract_amount - payments_received` | Stored for performance; revalidated on import |

**Import validation:** Derivation mismatches between source values and computed values are logged as `derivation_mismatch` findings. Source values are preserved; computed values may be recalculated.

---

### Vendor/Owner Contact Strategy

Follows the same contact snapshot pattern as P1-A9 (permits):

| Aspect | Rule |
|--------|------|
| **Owner/client identity** | `owner_client_display` stores raw display name (always preserved; Class H vendor/party pattern); `owner_client_key` is nullable canonical key when resolvable via future vendor/party registry |
| **Primary contact** | `primary_contact_display` stores raw display name (Class G person-attribution); `primary_contact_key` is nullable UPN/canonical key when resolvable |
| **Address snapshot** | `vendor_street`, `vendor_city`, `vendor_state`, `vendor_zip_code`, `vendor_phone`, `vendor_fax`, `email_address` stored as snapshot fields on `prime_contract`; not separate entity |
| **Company name** | `company_name` is the contractor's own company name (self-referential); stored as snapshot for provenance |
| **Display text is never a join key** | Contact display names and snapshot fields are preserved for presentation; canonical keys are the join targets |

---

### Lifecycle / Status Rules

| Aspect | Rule |
|--------|------|
| **Contract status** | 4 values from source: Draft, Pending, Out For Signature, Approved |
| **Execution flag** | `is_executed` (boolean); correlates with Approved status in sample but tracked independently |
| **ERP status** | `erp_status`: not_ready, synced; operational metadata tracking ERP synchronization |
| **Signed date** | `signed_contract_received_date` populated when signed contract is received; null otherwise |
| **Status transitions** | Draft → Pending → Out For Signature → Approved is the observed progression; not enforced as strict forward-only in Phase 1 (imported state may arrive in any order) |

---

### Search / Analytics / Reporting Role

| Role | Treatment |
|------|-----------|
| **Search indexed?** | Yes — contract_number, title, owner/client, project name, description |
| **Search role** | `contract_number`: Keyword Content; `title`: Keyword Content; `owner_client_display`: Facet / Filter; `contract_status`: Facet / Filter; `erp_status`: Facet / Filter; `is_executed`: Facet / Filter |
| **Analytics included?** | Yes — contract financial tracking and portfolio analytics |
| **Analytics role** | Operational Reporting (contract value, invoicing progress, payment status, CO exposure); Portfolio / Cross-Project Analytics (total contract value by status, % paid distribution, CO trends) |
| **Dashboard use** | Contract status distribution, payment progress, CO exposure (pending + draft), unsigned contracts, ERP sync status |
| **AI context** | Contract financial status contributes to project health scoring |

---

### Storage Boundary Alignment

| Data | Storage | Authority | P1-A1/A2 Alignment |
|------|---------|-----------|---------------------|
| Prime contract records | SharePoint List (project site) | Authoritative for prime contract data | Aligns with P1-A1: contracts domain in SharePoint |
| Import batches | Azure Table Storage | Operational state | Aligns with P1-A1/A2: Table Storage for operational state |
| Import findings | Azure Table Storage | Operational audit | Same |
| Contract documents | _Deferred_ — no library in Phase 1 | — | Phase 2: paired library when document attachments are sourced |

---

## Open Decisions / Future Expansion

| Decision | Scope | Owner | Target |
|----------|-------|-------|--------|
| **Individual change order records** | Source has aggregate CO totals only; individual CO records need a separate data source (Procore CO export) | Platform Architecture | Phase 2 |
| **Invoice/payment line items** | Source has aggregate totals only; individual invoice records need a separate data source | Platform Architecture + Finance | Phase 2 |
| **Contract document library** | Paired document library for contract PDFs, amendments, certificates; no attachments in Phase 1 source | Platform Architecture | Phase 2 |
| **Vendor/owner registry linkage** | Resolve `owner_client_key` against a canonical vendor/party registry | Platform Architecture | Phase 2+ |
| **Contract-to-buyout cross-reference** | Link prime contracts to subcontracts in buyout domain for total exposure views | Platform Architecture | Phase 2 |
| **Contract status dictionary** | Formalize 4 status values as governed reference set | Platform Architecture | Phase 1 (late) |

---

## Decision Owners and Approval

| Role | Name | Approval Date |
|------|------|----------------|
| Platform Architecture Lead | — | — |
| Project Controls Lead | — | — |
| Finance / Contracts Lead | — | — |

**Approval Status:** Pending — Schema defined; pending operational validation
**Comments:** Schema derived from prime-contracts.json (20 contracts, Procore-sourced). Single flat entity with financial tracking, contact snapshots, and ERP sync state. Canonical identity is surrogate `contract_id`; Procore `project_id` preserved as external federation key. No child entities or document library in Phase 1 — aggregate totals only.

---

## Revision History

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 0.1 | 2026-03-17 | Architecture | Initial schema; 3 canonical entities (prime_contract, contract_import_batch, contract_import_finding). Flat Procore-sourced model with 38 fields on prime_contract. Identity strategy frozen: surrogate `contract_id` as canonical PK, `contract_number` as natural key, `source_project_id` for Procore federation. Financial field classification (authoritative vs derived). Vendor/owner contact snapshots (Class G/H). No child entities or document library — aggregate totals and no attachments in source. |
