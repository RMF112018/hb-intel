# P1-A5: Reference Data Dictionary Schema

**Document ID:** P1-A5
**Phase:** 1 (Foundation)
**Classification:** Internal — Engineering
**Status:** Draft
**Date:** 2026-03-17
**Read With:** [P1-A1-Data-Ownership-Matrix.md](./P1-A1-Data-Ownership-Matrix.md), [P1-A2-Source-of-Record-Register.md](./P1-A2-Source-of-Record-Register.md), [P1-A3-SharePoint-Lists-Libraries-Schema-Register.md](./P1-A3-SharePoint-Lists-Libraries-Schema-Register.md)

---

## Purpose

Define the canonical schema, keying rules, lifecycle model, classification framework, and governance approach for all reference data dictionaries and controlled value sets used across HB Intel Phase 1 domains.

Reference data — cost codes, project types, project stages, CSI/MasterFormat codes, status value sets, geographic codes, rating bands, category taxonomies, and similar controlled vocabularies — is consumed by multiple domains but must be governed with clear ownership, stable keys, and explicit extensibility rules. This document establishes the dictionary classification framework (Class S/P/X/D), the structural governance contract, and the canonical schemas so that all Phase 1 dictionaries are treated as governed reference data rather than ad hoc UI dropdown values.

**Dictionary families defined here:**
- **Cost Code Dictionary** — canonical cost code entity model (evidence: `cost-code-dictionary.csv`)
- **CSI Code Dictionary** — MasterFormat taxonomy model (evidence: `csi-code-dictionary.csv`)
- **Simple Reference Dictionaries** — 7 shared hub-site lookup dictionaries
- **Platform Controlled Sets** — import/validation infrastructure enumerations (Class P)
- **Cross-Domain Governed Sets** — 16 business-rule-carrying value sets consumed by 2+ schemas (Class X)
- **Domain-Local Governance Contract** — structural rules for 27 domain-owned dictionaries (Class D)

---

## Relationship to P1-A1 / P1-A2 / P1-A3

| Artifact | Role | This Document's Relationship |
|----------|------|------------------------------|
| **P1-A1** Data Ownership Matrix | Governance-level data ownership | P1-A1 references shared and domain-local reference dictionaries across field definitions. P1-A5 defines what those dictionaries contain and how they are structured. |
| **P1-A2** Source-of-Record Register | Adapter paths and write safety | Reference data is typically Class C (read-mostly) per P1-A2. P1-A5 defines the canonical schema that adapters serve. |
| **P1-A3** SharePoint Schema Register | Physical SharePoint containers | P1-A3 defines the SharePoint lists that store reference dictionaries. P1-A5 defines the logical schema and governance model for those dictionaries. |

**Reading order:** P1-A1 → P1-A5 → P1-A3 (for reference data containers).

---

## Scope and Non-Scope

### In Scope
- Cost Code dictionary canonical schema
- CSI Code dictionary canonical schema
- Simple Reference Dictionaries (7 shared hub-site dictionaries)
- Reference data governance patterns applicable to all HB Intel dictionaries
- **Dictionary classification framework** — Class S (Shared Reference), Class P (Platform Controlled Set), Class X (Cross-Domain Governed Set), Class D (Domain-Governed Dictionary)
- **Platform controlled sets** — Import Status, Finding Severity, Finding Category
- **Cross-domain governed sets** — dictionaries consumed by 2+ domain schemas that carry business rules
- **Domain-local dictionary governance contract** — structural rules domain-local dictionaries must follow
- **Key + display label behavior** — frozen stable-key / display-label / raw-preservation pattern
- **Extensibility and binding rules** — how consuming schemas bind to A5-governed dictionaries
- Keying, hierarchy, lifecycle, and applicability rules
- External mapping strategy for ERP/Sage integration
- Search, analytics, and reporting role of reference data
- Storage-boundary alignment with P1-A1/P1-A2

### Out of Scope
- SharePoint physical container definitions (P1-A3)
- Data ownership governance decisions (P1-A1)
- Adapter implementation details (P1-B1)
- Full enumeration of every domain-local dictionary value set (governed by their domain schema artifacts; A5 provides the structural contract)
- Identity resolution dictionaries (Class G person identity, Class H vendor identity — governed by P1-A2 identity resolution platform standards)

---

## Consolidated Entity Summary and Identity Alignment

This section lists all canonical entities and governed sets defined in this document, with identity class alignment to the [P1-A2 Identity Strategy Freeze](./P1-A2-Source-of-Record-Register.md).

### Canonical Entities (Class S — Shared Reference Dictionaries)

| # | Canonical Entity | Dictionary Family | Identity Class | Identity Key | Natural Key | Storage Target | Write Safety | Phase |
|---|-----------------|-------------------|---------------|-------------|-------------|----------------|-------------|-------|
| 1 | `cost_code` | Cost Code | C (shared reference) | `code_id` (surrogate) | `csi_code` | SP List (hub) | Class C | 1 |
| 2 | `cost_code_stage` | Cost Code | C (shared reference) | `stage_id` (surrogate) | `stage_name` | SP List (hub) | Class C | 1 |
| 3 | `cost_code_import_batch` | Cost Code | E (import-batch) | `batch_id` (surrogate) | — | Azure Table Storage | Class D | 1 |
| 4 | `cost_code_external_mapping` | Cost Code | I (external mapping) | `mapping_id` (surrogate) | — | SP List (hub) | Class A | 4+ |
| 5 | `csi_code` | CSI Code | C (shared reference) | `code_id` (surrogate) | `csi_code` | SP List (hub) | Class C | 1 |
| 6 | `csi_code_description_variant` | CSI Code | D (child record) | `variant_id` (surrogate) | — (FK `code_id`) | SP List (hub) | Class C | 1 |
| 7 | `csi_code_import_batch` | CSI Code | E (import-batch) | `batch_id` (surrogate) | — | Azure Table Storage | Class D | 1 |
| 8 | `csi_code_external_mapping` | CSI Code | I (external mapping) | `mapping_id` (surrogate) | — | SP List (hub) | Class A | 4+ |
| 9 | `project_type_dictionary` | Simple Reference | C (shared reference) | `{dict}_id` (surrogate) | `typeId` | SP List (hub) — `Shared_ProjectTypes` | Class C | 1 |
| 10 | `project_stage_dictionary` | Simple Reference | C (shared reference) | `{dict}_id` (surrogate) | `stageId` | SP List (hub) — `Shared_ProjectStages` | Class C | 1 |
| 11 | `project_region_dictionary` | Simple Reference | C (shared reference) | `{dict}_id` (surrogate) | `regionId` | SP List (hub) — `Shared_ProjectRegions` | Class C | 1 |
| 12 | `state_code_dictionary` | Simple Reference | C (shared reference) | `{dict}_id` (surrogate) | `stateCode` | SP List (hub) — `Shared_StateCodes` | Class C | 1 |
| 13 | `country_code_dictionary` | Simple Reference | C (shared reference) | `{dict}_id` (surrogate) | `countryCode` | SP List (hub) — `Shared_CountryCodes` | Class C | 1 |
| 14 | `delivery_method_dictionary` | Simple Reference | C (shared reference) | `{dict}_id` (surrogate) | `methodCode` | SP List (hub) — `Shared_DeliveryMethods` | Class C | 1 |
| 15 | `sector_dictionary` | Simple Reference | C (shared reference) | `{dict}_id` (surrogate) | `sectorCode` | SP List (hub) — `Shared_Sectors` | Class C | 1 |

**Build-ready vs deferred:** 13 entities are Phase 1 build-ready. Two external mapping entities (`cost_code_external_mapping`, `csi_code_external_mapping`) are deferred to Phase 4+ and carry schema placeholders only.

**Not enumerated here:** Three shared dictionaries (`ProjectBidTypes`, `ProjectOwnerTypes`, `TimeZones`) are not in A3 build-ready scope and are not counted among the 15 entities above. They will be specified when they enter build scope.

### Platform Controlled Sets (Class P)

| # | Set Name | Values | Consuming Schemas | Governance |
|---|---------|--------|-------------------|------------|
| 1 | Import Status | 5 (pending, parsing, validating, complete, failed) | A6–A13 (all) | Code-governed |
| 2 | Finding Severity | 3 (error, warning, info) | A6–A13 (all) | Code-governed |
| 3 | Finding Category (base) | 4 (parse_error, validation_failure, mapping_warning, derivation_mismatch) | A6–A13 (all) | Code-governed + domain extensions |

### Cross-Domain Governed Sets (Class X)

| # | Set Name | Value Count | Primary Consumer | Governance |
|---|---------|------------|-----------------|------------|
| 1 | Cost Type | 5 | A6 | Admin-managed |
| 2 | Register Category | 36 | A7 | Admin-managed |
| 3 | BIC Team | 32 | A7 | Admin-managed |
| 4 | Permit Type | 12 | A9 | Admin-managed |
| 5 | Checklist Family | 3 | A10 | Admin-managed |
| 6 | Rating Band | 5 | A12 | Admin-managed |
| 7 | Rebid Recommendation | 3 | A12 | Admin-managed |
| 8 | Scorecard Section | 6 | A12 | Admin-managed |
| 9 | Lesson Category | 15 | A13 | Admin-managed |
| 10 | Impact Magnitude | 4 | A13 | Admin-managed |
| 11 | Project Size Band | 6 | A13 | Admin-managed |
| 12 | Complexity Rating | 5 | A13 | Admin-managed |
| 13 | Assignment Value | 5 | A11 | Admin-managed |
| 14 | Permit Tag | 11 | A9 | Admin-managed |
| 15 | Lesson Phase | 7 | A13 | Admin-managed |
| 16 | Division Label | 9 | A5/A6 | Admin-managed |

### Domain-Local Dictionaries (Class D)

27 domain-local dictionaries are inventoried in the Domain-Local Dictionary Governance Contract section. They are governed by their owning schema artifacts (A7–A13) and must follow the A5 structural contract.

### Summary Counts

| Class | Count | Phase 1 Build-Ready |
|-------|-------|-------------------|
| S — Shared Reference (entities) | 15 | 13 (2 deferred to Phase 4+) |
| P — Platform Controlled (sets) | 3 | 3 |
| X — Cross-Domain Governed (sets) | 16 | 16 |
| D — Domain-Local (sets) | 27 | 27 (values in owning schemas) |
| **Total governed artifacts** | **61** | **59** |

---

## Cost Code Dictionary

### Source File Analysis

**File:** `docs/reference/example/cost-code-dictionary.csv`

| Property | Value |
|----------|-------|
| Rows | 7,565 (excluding header) |
| Columns | 3 (`stage`, `csi_code`, `csi_code_description`) |
| Encoding | UTF-8 with BOM |
| Delimiter | Comma |
| `csi_code` uniqueness | Globally unique — each code appears exactly once |
| `stage + csi_code` uniqueness | Unique — each code belongs to exactly one stage |
| Code format | `DD-SS-DDD` (division-subgroup-detail, hyphen-separated) |
| Divisions present | 01, 02, 03, 10, 15, 20, 25, 90, 99 |

**Stage Values (9):**

| Stage | Business Context |
|-------|-----------------|
| `Presentation/Proposal/RFQ` | Pre-award estimate and proposal work |
| `Estimating` | Estimating-phase cost classification |
| `Preconstruction` | Preconstruction services and coordination |
| `General Conditions/General Requirements` | Project general conditions and overhead |
| `Contracted Work/GMP/Subcontracts` | Subcontracted/committed scope of work |
| `INSURANCE/FEE/BOND - IF NEEDED SEPARATE` | Insurance, fee, and bonding line items when tracked separately |
| `PHASE FEE/GRs IF NEEDED SEPARATE` | Phase-specific fees and GRs when tracked separately |
| `NON-BILLABLE` | Non-billable internal cost categories |
| `WARRANTY` | Warranty-period cost tracking |

**Code Format Analysis:**

The `csi_code` follows a `DD-SS-DDD` pattern:

| Segment | Name | Range | Purpose |
|---------|------|-------|---------|
| `DD` | Division | 01–99 | Major cost division (loosely aligned with CSI MasterFormat divisions) |
| `SS` | Subgroup | 00–99 | Subdivision within division |
| `DDD` | Detail | 000–999 | Specific cost line item |

Example: `01-01-314` → Division 01 (General Conditions), Subgroup 01 (Administrative), Detail 314 (Supervision)

**Key observations:**
- Division codes do not strictly follow CSI MasterFormat (e.g., divisions 90, 99 are company-specific extensions)
- The file is a complete dictionary, not a partial export
- Stage is a business classification dimension — it determines which cost codes are applicable during which business workflow context
- Descriptions are canonical display text, not user-editable per-use descriptions

### Why a Canonical Reference Data Model Is Needed

1. **Cross-domain consumption:** Cost codes are referenced by estimating, buyout/commitments, contracts, cost controls, and reporting. A governed dictionary prevents drift.
2. **Hierarchy support:** The DD-SS-DDD structure implies roll-up/drill-down needs (division → subgroup → detail) for reporting and analytics.
3. **Stage applicability:** Different business contexts use different subsets of the code dictionary. This must be queryable.
4. **Future variability:** Additional stage values, deprecated codes, Sage/ERP mappings, and company-specific extensions are expected over time.
5. **Consistency:** Multiple domains (P1-A1 field definitions) already reference `CSICodes` as a shared dictionary. This document governs what that dictionary contains.

---

### Canonical Entity Model

#### Entity Summary

| # | Entity | Purpose | Source |
|---|--------|---------|--------|
| 1 | `cost_code` | Canonical cost code record with parsed segments | cost-code-dictionary.csv rows |
| 2 | `cost_code_stage` | Stage classification / applicability for each code | `stage` column |
| 3 | `cost_code_import_batch` | Tracks dictionary import/refresh operations | Platform operational |
| 4 | `cost_code_external_mapping` | Maps cost codes to external system codes (Sage, ERP) | Future: integration data |

#### cost_code

The primary cost code record. One row per unique `csi_code`.

| Field | Type | Required | Key | Description |
|-------|------|----------|-----|-------------|
| code_id | string | Yes | PK (surrogate) | HB Intel canonical cost code identifier |
| csi_code | string | Yes | Natural key (unique) | The DD-SS-DDD formatted cost code |
| description | string | Yes | — | Canonical display description |
| division_code | string | Yes | — | Parsed first segment (DD) |
| subgroup_code | string | Yes | — | Parsed second segment (SS) |
| detail_code | string | Yes | — | Parsed third segment (DDD) |
| stage | string | Yes | — | Business classification stage (denormalized from source for query convenience) |
| is_active | boolean | Yes | — | Whether this code is currently active (default: true) |
| is_deprecated | boolean | No | — | Whether this code has been deprecated (default: false) |
| deprecated_reason | string | No | — | Reason for deprecation if applicable |
| superseded_by_code | string | No | — | FK to replacement cost_code if deprecated |
| effective_start | date | No | — | Date this code became effective (null = always) |
| effective_end | date | No | — | Date this code was retired (null = still active) |
| sort_order | number | No | — | Explicit sort order within stage/division |
| source_batch_id | string | No | — | FK to cost_code_import_batch |
| notes | text | No | — | Implementation notes |

#### cost_code_stage

Reference table defining the valid stage values and their metadata.

| Field | Type | Required | Key | Description |
|-------|------|----------|-----|-------------|
| stage_id | string | Yes | PK | HB Intel stage identifier |
| stage_name | string | Yes | Natural key (unique) | Stage display name (e.g., "Estimating") |
| stage_description | string | No | — | Business description of this stage |
| applicable_domains | string | No | — | Which HB Intel domains primarily use codes in this stage |
| sort_order | number | No | — | Display sort order |
| is_active | boolean | Yes | — | Whether this stage is currently active |

**Initial values from source file:**

| stage_name | applicable_domains |
|------------|--------------------|
| Presentation/Proposal/RFQ | estimating, leads |
| Estimating | estimating |
| Preconstruction | estimating, project |
| General Conditions/General Requirements | project, buyout |
| Contracted Work/GMP/Subcontracts | buyout, contracts |
| INSURANCE/FEE/BOND - IF NEEDED SEPARATE | buyout, risk |
| PHASE FEE/GRs IF NEEDED SEPARATE | project, buyout |
| NON-BILLABLE | project |
| WARRANTY | project, compliance |

#### cost_code_import_batch

Tracks each dictionary import/refresh operation for provenance.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| batch_id | string | Yes | Import batch identifier |
| source_file_name | string | Yes | Original file name |
| source_file_url | string | No | SharePoint library URL if uploaded |
| import_date | datetime | Yes | When the import was processed |
| imported_by | string | Yes | Uploader identity (UPN) |
| total_codes_imported | number | No | Count of codes in this batch |
| total_codes_added | number | No | New codes added |
| total_codes_updated | number | No | Existing codes updated |
| total_codes_deprecated | number | No | Codes deprecated by this import |
| parser_version | string | No | Parser version used |
| notes | text | No | Import notes |

#### cost_code_external_mapping

Maps HB Intel cost codes to external system identifiers for integration.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| mapping_id | string | Yes | Mapping record identifier |
| code_id | string | Yes | FK to cost_code |
| external_system | string | Yes | External system name (e.g., Sage, Procore) |
| external_code | string | Yes | External system's code value |
| external_description | string | No | External system's description if different |
| mapping_confidence | string | No | Auto-matched, Manual, Verified |
| is_active | boolean | Yes | Whether this mapping is current |
| notes | text | No | Mapping notes |

---

### Keying and Uniqueness Rules

| Rule | Decision |
|------|----------|
| **Primary key** | `code_id` (surrogate, system-generated) |
| **Natural key** | `csi_code` (globally unique across all stages) |
| **Uniqueness constraint** | `csi_code` must be unique within the cost_code table |
| **Stage as part of key?** | No — since each `csi_code` belongs to exactly one stage, stage is a classification attribute, not part of the unique key |
| **Case sensitivity** | `csi_code` is case-insensitive (stored as-is from source; compared case-insensitively) |

---

### Hierarchy / Code Segment Parsing

The `DD-SS-DDD` code structure implies a three-level hierarchy:

| Level | Field | Derivation | Purpose |
|-------|-------|-----------|---------|
| 1 | `division_code` | First segment before first hyphen | Major cost division roll-up |
| 2 | `subgroup_code` | Second segment between hyphens | Subdivision grouping |
| 3 | `detail_code` | Third segment after second hyphen | Specific line item |

**Parsing rules:**
- Split `csi_code` on `-` delimiter
- Segment 1 → `division_code` (2 digits, zero-padded)
- Segment 2 → `subgroup_code` (2 digits, zero-padded)
- Segment 3 → `detail_code` (3 digits, zero-padded)

**Storage decision:** Both stored and derived.
- Segments are stored as explicit fields on `cost_code` for query/filter/rollup performance
- Segments are also derivable from `csi_code` by parsing, enabling validation

**Hierarchy navigation:**
- All codes in division `01` can be queried by `division_code = '01'`
- All codes in subgroup `01-01` can be queried by `division_code = '01' AND subgroup_code = '01'`
- Rollup reporting uses division and subgroup as grouping dimensions

---

### Stage Applicability Model

**Decision:** Stage is stored as a denormalized field on `cost_code` (single-value, not many-to-many).

**Rationale:**
- In the source data, each code belongs to exactly one stage
- No evidence of codes appearing in multiple stages
- A child applicability table would add unnecessary complexity for the current structure
- If future requirements introduce multi-stage applicability, the model can be extended with a junction table without breaking the primary schema

**Query pattern:**
- Filter codes by stage: `WHERE stage = 'Estimating'`
- Filter codes by stage + division: `WHERE stage = 'Estimating' AND division_code = '01'`

---

### External Mapping Strategy

The `cost_code_external_mapping` entity supports future integration scenarios:

| Integration Target | Mapping Use Case |
|--------------------|-----------------|
| **Sage / ERP** | Map HB Intel cost codes to Sage GL account codes or cost categories for financial reporting |
| **Procore** | Map to Procore cost code structures for commitment and budget sync (Phase 4+) |
| **Estimating categories** | Map cost codes to estimating-specific category groupings used in bid tabs |
| **Budget reporting** | Map to budget line item structures for cost control roll-ups |
| **CSI MasterFormat** | Map company-specific codes to standard MasterFormat divisions where alignment exists |

**Current state:** No external mappings exist in Phase 1. The entity is established as a schema placeholder for Phase 4+ integration work.

---

### Lifecycle / Deprecation / Revision Handling

| Aspect | Rule |
|--------|------|
| **New codes** | Added via import batch; `is_active = true`, `is_deprecated = false` |
| **Deprecated codes** | Set `is_deprecated = true`, `deprecated_reason`, optionally `superseded_by_code` and `effective_end` |
| **Removed codes** | Never hard-deleted; soft-deprecated to preserve historical references |
| **Updated descriptions** | Description updates are applied in place; import batch tracks the change |
| **Stage reassignment** | If a code moves stages, update the `stage` field and log the change in import batch |
| **Version tracking** | Dictionary versions are tracked via `cost_code_import_batch`, not per-code versioning |

---

### Search / Analytics / Reporting Role

| Role | Treatment |
|------|-----------|
| **Search indexed?** | Yes — cost code and description are searchable reference content |
| **Search role** | `csi_code`: Keyword Content; `description`: Keyword Content; `stage`: Facet / Filter; `division_code`: Facet / Filter |
| **Analytics included?** | Yes — cost codes are analytics dimensions |
| **Analytics role** | Operational Reporting, Portfolio / Cross-Project Analytics (cost roll-ups by division, stage, subgroup) |
| **Cross-project reporting** | Cost codes serve as the common dimension for comparing costs across projects |
| **Filter/facet use** | Stage, division, subgroup are filterable dimensions in cost views |

---

### Storage Boundary Alignment

| Data | Storage | Authority | P1-A1/A2 Alignment |
|------|---------|-----------|---------------------|
| Canonical cost code records | SharePoint List (hub site, shared) | Authoritative reference data | Aligns with P1-A1: shared reference dictionaries stored on hub site |
| Stage reference records | SharePoint List (hub site, shared) | Authoritative reference data | Same |
| Import batch metadata | Azure Table Storage | Operational state | Aligns with P1-A1/A2: operational state in Table Storage |
| External mappings | SharePoint List (hub site, shared) | Authoritative mapping data | Stored alongside reference data; read-mostly |

---

## CSI Code Dictionary

### Source File Analysis

**File:** `docs/reference/example/csi-code-dictionary.csv`

| Property | Value |
|----------|-------|
| Rows | 8,991 (including header) |
| Columns | 2 (`csi_code`, `csi_code_description`) |
| Encoding | UTF-8 with BOM |
| Delimiter | Comma |
| Code format | `DD SS SS` (space-separated, 3 segments of 2 digits each) |
| Divisions present | 00–14, 21–28, 31–35, 40–46, 48 (35 divisions) |
| `csi_code` uniqueness | **NOT globally unique** — 819 codes appear with multiple different descriptions |
| Top repeat | Code `28 51 15` appears 21 times with different descriptions |
| Line-continuation artifacts | 170 rows have blank `csi_code` — wrapped description lines from source export |
| Description format | CamelCase without spaces (e.g., "ProcurementandContractingRequirements") — requires normalization |

### Source Data Quality Findings

**1. Duplicate codes with multiple descriptions:**
CSI MasterFormat codes are taxonomy nodes, not simple unique lookup values. A single code (e.g., `00 31 13`) maps to multiple sub-descriptions:

| csi_code | csi_code_description |
|----------|---------------------|
| 00 31 13 | PreliminarySchedules |
| 00 31 13 | PreliminaryProjectSchedule |
| 00 31 13 | PreliminaryConstructionSchedule |
| 00 31 13 | PreliminaryProjectPhases |
| 00 31 13 | PreliminaryProjectSequencing |
| 00 31 13 | PreliminaryProjectMilestones |

This means a CSI code represents a **category** with multiple named sub-items or description variants.

**2. Line-continuation artifacts:**
170 rows have blank `csi_code` values. These are fragments of descriptions that wrapped across CSV lines due to embedded commas or length. Example:

```
00 52 13,AgreementForm-StipulatedSum(design/bid/buildor
,design/negotiate/build)
```

The second line is a continuation of the first description, not a separate record. Import must merge these.

**3. Description normalization needed:**
Descriptions are CamelCase concatenated words without spaces. Import must insert spaces at word boundaries for display. Example: `"ProcurementandContractingRequirements"` → `"Procurement and Contracting Requirements"`.

### Why This Requires a Canonical Model

1. **One-to-many relationship:** A CSI code maps to multiple description variants — this is not a simple key-value lookup.
2. **Data cleanup required:** Line-continuation artifacts and CamelCase normalization mean raw import cannot be used directly.
3. **Hierarchy support:** The `DD SS SS` structure is the MasterFormat 2014+ hierarchy (Division / Section Group / Section Number) needing roll-up/drill-down.
4. **Cross-domain consumption:** CSI codes classify buyout commitments, estimating scope, contracts, and cost code mappings.
5. **Future evolution:** MasterFormat editions change; company-specific aliases and deprecated codes are expected.

### Canonical Entity Model

#### Entity Summary

| # | Entity | Purpose |
|---|--------|---------|
| 1 | `csi_code` | Canonical CSI code node with hierarchy and primary description |
| 2 | `csi_code_description_variant` | Additional description variants for codes with multiple named sub-items |
| 3 | `csi_code_import_batch` | Tracks dictionary import/refresh operations |
| 4 | `csi_code_external_mapping` | Maps CSI codes to cost codes, ERP codes, or other classification systems |

#### csi_code

The primary CSI code record. One row per unique `csi_code` value (the code itself, not per-description).

| Field | Type | Required | Key | Description |
|-------|------|----------|-----|-------------|
| code_id | string | Yes | PK (surrogate) | HB Intel canonical CSI code identifier |
| csi_code | string | Yes | Natural key (unique) | The `DD SS SS` formatted MasterFormat code |
| csi_code_compact | string | Yes | — | Compact format without spaces (e.g., `003113`) for sorting/matching |
| primary_description | string | Yes | — | Normalized primary display description (first/most general variant) |
| raw_primary_description | string | No | — | Original CamelCase description from source for provenance |
| division_code | string | Yes | — | Parsed first segment (DD) — MasterFormat Division |
| section_group | string | Yes | — | Parsed second segment (SS) — MasterFormat Section Group |
| section_number | string | Yes | — | Parsed third segment (SS) — MasterFormat Section Number |
| hierarchy_level | number | Yes | — | 1 = Division (XX 00 00), 2 = Section Group (XX YY 00), 3 = Section (XX YY ZZ) |
| parent_code_id | string | No | — | FK to parent csi_code (e.g., `05 12 00` → parent `05 00 00`) |
| variant_count | number | No | — | Number of description variants (1 if unique, >1 if multi-description) |
| is_active | boolean | Yes | — | Whether this code is currently active (default: true) |
| is_deprecated | boolean | No | — | Whether this code has been deprecated |
| superseded_by_code_id | string | No | — | FK to replacement csi_code if superseded |
| masterformat_edition | string | No | — | MasterFormat edition year (e.g., "2014", "2018") |
| effective_start | date | No | — | Date this code became effective |
| effective_end | date | No | — | Date this code was retired |
| sort_order | number | No | — | Explicit sort order within parent |
| source_batch_id | string | No | — | FK to csi_code_import_batch |
| notes | text | No | — | Implementation notes |

#### csi_code_description_variant

Stores additional description variants for codes that have multiple named sub-items. The primary description lives on `csi_code`; additional variants live here.

| Field | Type | Required | Key | Description |
|-------|------|----------|-----|-------------|
| variant_id | string | Yes | PK | Variant record identifier |
| code_id | string | Yes | FK | FK to csi_code |
| description | string | Yes | — | Normalized description variant |
| raw_description | string | No | — | Original CamelCase text from source |
| variant_type | string | No | — | sub_item, alternate_label, alias, clarification |
| sort_order | number | No | — | Display order within the code's variants |
| is_active | boolean | Yes | — | Whether this variant is current |

#### csi_code_import_batch

Tracks each dictionary import/refresh operation for provenance.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| batch_id | string | Yes | Import batch identifier |
| source_file_name | string | Yes | Original file name |
| source_file_url | string | No | SharePoint library URL if uploaded |
| import_date | datetime | Yes | When the import was processed |
| imported_by | string | Yes | Uploader identity (UPN) |
| total_codes_imported | number | No | Unique codes processed |
| total_variants_imported | number | No | Total description rows processed |
| total_continuations_merged | number | No | Line-continuation rows merged during cleanup |
| total_descriptions_normalized | number | No | CamelCase descriptions normalized |
| parser_version | string | No | Parser version used |
| masterformat_edition | string | No | MasterFormat edition detected or specified |
| notes | text | No | Import notes |

#### csi_code_external_mapping

Maps CSI codes to other classification systems for cross-reference.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| mapping_id | string | Yes | Mapping record identifier |
| code_id | string | Yes | FK to csi_code |
| target_system | string | Yes | Target classification system (e.g., HBIntel_CostCode, Sage, UniFormat) |
| target_code | string | Yes | Target system's code value |
| target_description | string | No | Target system's description if different |
| mapping_confidence | string | No | Auto-matched, Manual, Verified |
| is_active | boolean | Yes | Whether this mapping is current |
| notes | text | No | Mapping notes |

### Keying and Uniqueness Rules

| Rule | Decision |
|------|----------|
| **Primary key** | `code_id` (surrogate, system-generated) |
| **Natural key** | `csi_code` (unique per code node; description variants are child records) |
| **Uniqueness constraint** | `csi_code` must be unique in the `csi_code` table |
| **Duplicate handling** | Source rows with the same `csi_code` and different descriptions → first row becomes primary_description, remaining rows become `csi_code_description_variant` records |
| **Blank-code handling** | Rows with blank `csi_code` are line-continuation artifacts; merge with preceding row's description during import |
| **Malformed-code handling** | Codes not matching `DD SS SS` pattern → log import finding (warning), attempt best-effort parse, flag for review |

### Hierarchy / Code Segment Rules

The `DD SS SS` structure is the MasterFormat 3-level hierarchy:

| Level | Pattern | Example | Description |
|-------|---------|---------|-------------|
| Division | `DD 00 00` | `05 00 00` | Metals |
| Section Group | `DD SS 00` | `05 12 00` | Structural Steel Framing |
| Section | `DD SS SS` | `05 12 23` | Lightweight Steel Framing |

**Parsing rules:**
- Split `csi_code` on space delimiter
- Segment 1 → `division_code` (2 digits)
- Segment 2 → `section_group` (2 digits)
- Segment 3 → `section_number` (2 digits)

**Hierarchy level assignment:**
- If section_group = `00` and section_number = `00` → level 1 (Division)
- If section_number = `00` → level 2 (Section Group)
- Otherwise → level 3 (Section)

**Parent resolution:**
- Level 3 parent → same division + section_group + `00` (if exists)
- Level 2 parent → same division + `00 00` (if exists)
- Level 1 parent → none (root)

**Storage:** Segments are stored as explicit fields AND parent_code_id is resolved and stored, enabling both segment-based queries and tree traversal.

### Description Normalization Rules

| Rule | Implementation |
|------|---------------|
| **CamelCase splitting** | Insert spaces at uppercase-to-lowercase transitions (e.g., `"ProcurementandContractingRequirements"` → `"Procurement and Contracting Requirements"`) |
| **Raw preservation** | Store original CamelCase text in `raw_primary_description` / `raw_description` for provenance |
| **Line-continuation merging** | Concatenate blank-code rows with the preceding row's description before normalization |
| **Parenthetical handling** | Preserve parenthetical content (e.g., `"(design/bid/build or design/negotiate/build)"`) |
| **Hyphenated terms** | Preserve hyphens (e.g., `"Cost-Plus"`, `"Pre-Bid"`) |
| **Primary description selection** | For codes with multiple descriptions, the first occurrence in the source file is primary; additional occurrences are variants |

### Relationship to Cost Code Dictionary

CSI codes and HB Intel cost codes are **related but distinct** reference systems:

| Aspect | CSI Codes (this section) | Cost Codes (above) |
|--------|-------------------------|-------------------|
| Source | MasterFormat 2014+ taxonomy (industry standard) | Company cost-code dictionary (HB-specific) |
| Format | `DD SS SS` (space-separated) | `DD-SS-DDD` (hyphen-separated) |
| Uniqueness | Code is unique; descriptions are one-to-many | Code is globally unique; one description per code |
| Hierarchy | 3-level (Division / Section Group / Section) | 3-level (Division / Subgroup / Detail) |
| Scope | Industry-standard classification taxonomy | Company-specific cost tracking and reporting |

**Cross-mapping:** The `csi_code_external_mapping` entity supports mapping CSI codes to cost codes via `target_system = 'HBIntel_CostCode'`. This enables:
- Buyout commitments classified by CSI code to be linked to cost-code budget lines
- Estimating categories aligned across both classification systems
- Reporting that bridges industry-standard (CSI) and company-specific (cost code) dimensions

### Downstream Mapping Strategy

| Integration Target | Mapping Use Case |
|--------------------|-----------------|
| **Cost Code Dictionary** | Map CSI sections to company cost codes for budget/reporting alignment |
| **Buyout Commitments** | Classify commitments by CSI code (already in P1-A1 via `csi_code` field on `buyout_commitment`) |
| **Estimating** | Classify bid items and scope by MasterFormat section |
| **Contracts / Procurement** | Scope classification for subcontracts and purchase orders |
| **Schedule Activities** | Map schedule activities to CSI-based scope categories |
| **Search / Analytics** | CSI division and section as facet/filter dimensions in search and portfolio analytics |

### Search / Analytics / Reporting Role

| Role | Treatment |
|------|-----------|
| **Search indexed?** | Yes — code and description are searchable reference content |
| **Search role** | `csi_code`: Keyword Content; `primary_description`: Keyword Content; `division_code`: Facet / Filter |
| **Analytics included?** | Yes — CSI codes are analytics dimensions |
| **Analytics role** | Portfolio / Cross-Project Analytics (scope classification by division/section); Operational Reporting (commitment/bid-item classification) |
| **Cross-project reporting** | CSI divisions and sections serve as industry-standard scope dimensions across projects |

### Storage Boundary Alignment

| Data | Storage | Authority | P1-A1/A2 Alignment |
|------|---------|-----------|---------------------|
| Canonical CSI code records | SharePoint List (hub site, shared) | Authoritative reference data | Aligns with P1-A1: shared reference dictionaries on hub site |
| Description variants | SharePoint List (hub site, shared) | Authoritative reference data | Same list or child list |
| Import batch metadata | Azure Table Storage | Operational state | Aligns with P1-A1/A2: operational state in Table Storage |
| External mappings | SharePoint List (hub site, shared) | Authoritative mapping data | Stored alongside reference data |

---

## Simple Reference Dictionaries (Shared Hub-Site)

### Simple Reference Dictionary Pattern

Seven shared dictionaries used across the project domain follow a common simple structure: a code/ID key, a display name, optional description, and standard governance fields. This pattern is defined once and instantiated per dictionary.

#### Common Entity Structure

| Field | Type | Required | Key | Description |
|-------|------|----------|-----|-------------|
| `{dict}_id` | string | Yes | PK (surrogate) | HB Intel canonical identifier |
| `{code_field}` | string | Yes | Natural key (unique) | The canonical code or ID value |
| `{name_field}` | string | Yes | — | Display name |
| `description` | string | No | — | Optional description or definition |
| `is_active` | boolean | Yes | — | Whether this value is currently active (default: true) |
| `is_deprecated` | boolean | No | — | Whether this value has been deprecated (default: false) |
| `sort_order` | number | No | — | Explicit display sort order |
| `source_batch_id` | string | No | — | FK to import batch (if populated via import) |
| `notes` | text | No | — | Implementation notes |

#### Common Rules

| Rule | Value |
|------|-------|
| **Storage** | SharePoint List on hub site (shared across all project sites) |
| **Content type** | `HBDictionaryItem` |
| **Versioning** | Major versions |
| **Security** | Hub site inherited; read by all project sites |
| **Provisioning** | Created during hub site setup |
| **Uniqueness** | Code/ID field must be unique within the dictionary |
| **External mapping** | Not required for Phase 1; optional future extension |
| **Hierarchy** | None (flat lookup lists) |
| **Import/provenance** | Optional CSV/manual population; import automation deferred to Phase 2 |
| **Lifecycle** | `is_active` / `is_deprecated` for soft-delete; no effective-dating in Phase 1 |

### Dictionary Instantiations

#### ProjectTypes

**Canonical entity name:** `project_type_dictionary`

| Property | Value |
|----------|-------|
| **Purpose** | Classify projects by construction type (Residential, Commercial, etc.) |
| **Consuming domains/fields** | project (`project_type_id`, `project_type_name`); new_project_request (indirect via project linkage) |
| **Physical container** | `Shared_ProjectTypes` (A3) |
| **Code field** | `typeId` (number or string — matches P1-A1 `project_type_id`) |
| **Name field** | `typeName` (string — matches P1-A1 `project_type_name`) |
| **Uniqueness** | `typeId` unique |
| **Value format** | Free-text name; no required format constraint |
| **Initial values** | Populated from source system project records (e.g., Residential, Commercial, Industrial) |

#### ProjectStages

**Canonical entity name:** `project_stage_dictionary`

| Property | Value |
|----------|-------|
| **Purpose** | Classify projects by lifecycle stage (Preconstruction, Construction, Closeout, etc.) |
| **Consuming domains/fields** | project (`project_stage_id`, `project_stage_name`) |
| **Physical container** | `Shared_ProjectStages` (A3) |
| **Code field** | `stageId` (number or string — matches P1-A1 `project_stage_id`) |
| **Name field** | `stageName` (string — matches P1-A1 `project_stage_name`) |
| **Uniqueness** | `stageId` unique |
| **Value format** | Free-text name; ordered by typical project lifecycle progression |
| **Initial values** | Populated from source system (e.g., Preconstruction, Bidding, Construction, Closeout) |

#### ProjectRegions

**Canonical entity name:** `project_region_dictionary`

| Property | Value |
|----------|-------|
| **Purpose** | Classify projects by geographic operating region |
| **Consuming domains/fields** | project (`project_region_id`) |
| **Physical container** | `Shared_ProjectRegions` (A3) |
| **Code field** | `regionId` (number or string — matches P1-A1 `project_region_id`) |
| **Name field** | `regionName` (string) |
| **Uniqueness** | `regionId` unique |
| **Value format** | Company-defined region names |
| **Initial values** | Populated from organizational structure (e.g., Southeast Florida, Central Florida) |

#### StateCodes

**Canonical entity name:** `state_code_dictionary`

| Property | Value |
|----------|-------|
| **Purpose** | Standard US state codes for project location classification |
| **Consuming domains/fields** | project (`state_code`), new_project_request (`state_code`) |
| **Physical container** | `Shared_StateCodes` (A3) |
| **Code field** | `stateCode` (string, 2-character — matches P1-A1 `state_code`) |
| **Name field** | `stateName` (string — full state name) |
| **Uniqueness** | `stateCode` unique |
| **Value format** | 2-character uppercase US state/territory abbreviation (ISO 3166-2:US aligned) |
| **Normalization** | Uppercase only; validated against known US state/territory codes |
| **Initial values** | Prepopulated with all 50 US states + DC + relevant territories |

#### CountryCodes

**Canonical entity name:** `country_code_dictionary`

| Property | Value |
|----------|-------|
| **Purpose** | Standard country codes for project location classification |
| **Consuming domains/fields** | project (`country_code`) |
| **Physical container** | `Shared_CountryCodes` (A3) |
| **Code field** | `countryCode` (string, 2-character — matches P1-A1 `country_code`) |
| **Name field** | `countryName` (string — full country name) |
| **Uniqueness** | `countryCode` unique |
| **Value format** | 2-character uppercase ISO 3166-1 alpha-2 code |
| **Normalization** | Uppercase only; validated against ISO 3166-1 |
| **Initial values** | Prepopulated with US + relevant operating countries |

#### DeliveryMethods

**Canonical entity name:** `delivery_method_dictionary`

| Property | Value |
|----------|-------|
| **Purpose** | Classify projects by construction delivery method |
| **Consuming domains/fields** | project (`delivery_method`), new_project_request (indirect), lessons_report_instance (`delivery_method`) |
| **Physical container** | `Shared_DeliveryMethods` (A3) |
| **Code field** | `methodCode` (string — short code or slug) |
| **Name field** | `methodName` (string — display name) |
| **Uniqueness** | `methodCode` unique |
| **Value format** | Free-text name; company-standard terminology |
| **Initial values** | Design-Bid-Build, Design-Build, CM at Risk, GMP, Lump Sum, IDIQ/Job Order, Public-Private (P3) — per P1-A13 Lessons Learned source |

#### Sectors

**Canonical entity name:** `sector_dictionary`

| Property | Value |
|----------|-------|
| **Purpose** | Classify projects by industry/market sector |
| **Consuming domains/fields** | project (`sector`), lessons_report_instance (`market_sector`) |
| **Physical container** | `Shared_Sectors` (A3) |
| **Code field** | `sectorCode` (string — short code or slug) |
| **Name field** | `sectorName` (string — display name) |
| **Uniqueness** | `sectorCode` unique |
| **Value format** | Free-text name; company-standard terminology |
| **Initial values** | K-12 Education, Higher Education, Healthcare/Medical, Government/Civic, Office/Commercial, Industrial/Mfg, Retail/Hospitality, Residential/Mixed-Use, Transportation/Infra, Data Center/Tech, Mission Critical, Renovation/Historic, Other — per P1-A13 Lessons Learned source |

---

## Dictionary Classification Framework

Every Phase 1 dictionary or controlled value set falls into one of four governance classes. This framework determines ownership, mutability, storage expectations, and how consuming schemas bind to the dictionary.

| Class | Name | Definition | Governance Owner | Mutability | Storage |
|-------|------|-----------|-----------------|-----------|---------|
| **S** | Shared Reference Dictionary | Hub-site dictionary consumed by 2+ domain schemas as a lookup/classification dimension | Platform Architecture (admin) | Admin-managed; values added/deprecated via governed process | SharePoint List (hub site, shared) |
| **P** | Platform Controlled Set | Platform-wide enumeration consumed by import/validation infrastructure across all domains | Platform Engineering (code) | Code-governed; immutable without platform release | Embedded in code; no separate storage entity |
| **X** | Cross-Domain Governed Set | Value set used by 2+ domain schemas that carries business rules beyond simple lookup (e.g., score bands, assignment models, weighted sections) | Platform Architecture (admin) + Domain SME | Admin-managed with SME approval; values carry business logic that downstream computation depends on | SharePoint List (hub site, shared) or code-governed depending on volatility |
| **D** | Domain-Governed Dictionary | Owned by a single domain schema; values frozen or constrained by that schema | Domain schema owner | Defined in domain schema; admin-managed or code-governed per domain decision | Domain-local; may be SharePoint List (project site) or code-governed |

**Class selection rule:** If a value set is consumed by 2+ domain schemas → Class S, P, or X. If consumed by exactly 1 schema → Class D. Platform infrastructure sets (import, validation) → Class P regardless of consumer count.

**Identity dictionaries are out of scope:** Person identity (Class G) and vendor/party identity (Class H) are governed by the P1-A2 identity resolution platform standards, not by A5. Schemas that reference identity fields follow the `_key` + `_display` pattern defined in P1-A2.

---

## Key + Display Label Behavior

All A5-governed dictionaries (Classes S, P, X, D) must follow this stable key + display label pattern.

| Aspect | Rule |
|--------|------|
| **Stable key** | Machine-readable identifier; immutable once assigned; used for storage, binding, validation, and cross-schema joins. Format: `snake_case` string or numeric code. |
| **Display label** | Human-readable text; mutable for cosmetic corrections; never used in logic, validation, or binding. |
| **Key immutability** | Once a key is assigned and any record references it, the key value must not change. Cosmetic label changes are safe; key changes require a deprecation + new-key cycle. |
| **Raw preservation** | When an import source provides free-text that maps to a governed dictionary, the schema must preserve the original value in a `_raw` field alongside the canonical `_key` field. This supports audit, debugging, and future re-mapping. |
| **Null key behavior** | A null key means the value could not be resolved to the dictionary. The `_display` or `_raw` field must still be populated so the human-readable value is never lost. |
| **Field naming convention** | `{concept}_key` for the stable key; `{concept}_display` or `{concept}_label` for the display text; `{concept}_raw` for unresolved import text. |

**Examples already in use:**
- `bic_key` + `bic_display` (A7 — BIC team)
- `subcontractor_key` + `subcontractor_display_name` (A12 — vendor identity)
- `evaluator_key` + `evaluator_display` (A12 — person identity)
- `category_key` + `category_label` (A7 — register category)

---

## Platform Controlled Sets (Class P)

Platform controlled sets are enumerations embedded in the import/validation infrastructure. They are consumed by every schema that uses the two-tier batch import model and are immutable without a platform code release.

### Import Status

| Key | Display Label | Description |
|-----|--------------|-------------|
| `pending` | Pending | Batch created, not yet processed |
| `parsing` | Parsing | File is being parsed into staging rows |
| `validating` | Validating | Parsed rows are being validated against schema rules |
| `complete` | Complete | All rows processed; findings (if any) attached |
| `failed` | Failed | Batch-level failure; no rows committed |

**Consuming schemas:** A6, A7, A8, A9, A10, A11, A12, A13 (all import-capable schemas)
**Governance:** Code-governed (Class P). Values are defined in platform import infrastructure code. Adding a new status requires a platform release and schema-level migration assessment.
**Transition rules:** `pending → parsing → validating → complete` (happy path); any state → `failed` on unrecoverable error.

### Finding Severity

| Key | Display Label | Description |
|-----|--------------|-------------|
| `error` | Error | Row or batch cannot proceed; requires correction |
| `warning` | Warning | Row accepted but data quality concern flagged |
| `info` | Info | Informational note; no action required |

**Consuming schemas:** A6, A7, A8, A9, A10, A11, A12, A13
**Governance:** Code-governed (Class P). Immutable without platform release.

### Finding Category

Finding categories have a **platform base set** plus **domain-local extensions**. The base set is Class P; extensions are Class D.

#### Platform Base Set

| Key | Display Label | Description |
|-----|--------------|-------------|
| `parse_error` | Parse Error | Row could not be parsed from source format |
| `validation_failure` | Validation Failure | Row parsed but failed schema validation rules |
| `mapping_warning` | Mapping Warning | Row accepted but a mapping/resolution was ambiguous |
| `derivation_mismatch` | Derivation Mismatch | Derived field value conflicts with explicit source value |

#### Domain-Local Extensions

| Key | Defined In | Description |
|-----|-----------|-------------|
| `excluded_row` | A6 | Row excluded by row-type filter (blank/summary) |
| `outcome_mismatch` | A10 | Raw outcome does not map cleanly to canonical outcome |
| `assignment_conflict` | A11 | Multiple conflicting assignments for same item/role |
| `calculation_mismatch` | A12 | Computed score does not match provided score |

**Extensibility:** Domain schemas may define additional finding categories as Class D extensions. New categories must use `snake_case` keys and must not collide with the platform base set.

---

## Cross-Domain Governed Sets (Class X)

Cross-domain governed sets are value sets consumed by 2+ schemas or carrying business rules that downstream logic depends on. They are admin-managed with SME approval and stored on the hub site as shared reference data.

### Cost Type

| Key | Display Label | Description |
|-----|--------------|-------------|
| `LAB` | Labor | Direct labor costs |
| `LBN` | Labor Burden | Labor burden / fringe costs |
| `MAT` | Materials | Material and supply costs |
| `OVH` | Overhead | Overhead and indirect costs |
| `SUB` | Subcontractor | Subcontracted scope costs |

**Primary consumer:** A6 (financial data ingestion — budget line classification)
**Future consumers:** Budget/cost control schemas, reporting roll-ups
**Governance:** Admin-managed (Class X). Values are stable; additions require finance SME approval.
**Build-ready:** Yes — Phase 1.

### Register Category

36 governed categories for operational register items. Each category has a numeric prefix and a label.

| Key Pattern | Example | Value Count |
|------------|---------|-------------|
| `{number}_{slug}` | `28_risk_management` | 36 |

**Canonical values:** Defined in A7 Section "Register Category." Full list: 1–36 covering DESIGN through WARRANTY.
**Primary consumer:** A7 (operational register)
**Future consumers:** Cross-register analytics, portfolio risk dashboards
**Governance:** Admin-managed (Class X). New categories require operations SME approval. Categories must not be renumbered once assigned.
**Key behavior:** `category_number` (integer, immutable) + `category_key` (slug) + `category_label` (display text).
**Build-ready:** Yes — Phase 1 (values frozen in A7).

### BIC Team (Business-in-Charge)

32 governed team/party assignments for operational register ownership.

**Primary consumer:** A7 (operational register — `bic_key` + `bic_display`)
**Future consumers:** Cross-register assignment analytics, workload reporting
**Governance:** Admin-managed (Class X). Resolves to Class H vendor/party identity when the party registry is available; until then, `bic_key` is derived from normalized display text.
**Key behavior:** `bic_key` (stable slug or Class H key when resolved) + `bic_display` (human-readable).
**Build-ready:** Yes — Phase 1 (values frozen in A7).

### Permit Type

| Key | Display Label |
|-----|--------------|
| `master_building` | Master Building |
| `demolition` | Demolition |
| `site_development` | Site Development |
| `electrical` | Electrical |
| `plumbing` | Plumbing |
| `mechanical` | Mechanical |
| `roofing` | Roofing |
| `fire_alarm` | Fire Alarm |
| `fire_sprinkler` | Fire Sprinkler |
| `elevator` | Elevator |
| `pool_barricade` | Pool Barricade |
| `mass_grading` | Mass Grading |

**Primary consumer:** A9 (permits & inspections)
**Future consumers:** Compliance analytics, cross-project permit dashboards
**Governance:** Admin-managed (Class X). New permit types require compliance SME approval.
**Build-ready:** Yes — Phase 1 (values frozen in A9).

### Checklist Family

| Key | Display Label | Outcome Set |
|-----|--------------|------------|
| `startup` | Startup | yes_no_na |
| `safety` | Safety | pass_fail_na |
| `closeout` | Closeout | yes_no_na |

**Primary consumer:** A10 (project lifecycle checklist)
**Future consumers:** Lifecycle governance, cross-project compliance reporting
**Governance:** Admin-managed (Class X). New families require operations SME approval. Each family defines its raw outcome set and canonical outcome mapping.
**Build-ready:** Yes — Phase 1 (values frozen in A10).

### Permit Tag

| Key | Display Label |
|-----|--------------|
| `demolition` | Demolition |
| `electrical` | Electrical |
| `environmental` | Environmental |
| `high_priority` | High Priority |
| `luxury` | Luxury |
| `residential` | Residential |
| `roofing` | Roofing |
| `safety` | Safety |
| `safety_critical` | Safety Critical |
| `site_work` | Site Work |
| `weatherproofing` | Weatherproofing |

**Primary consumer:** A9 (permits & inspections — `tag_value` on `permit_tag`)
**Future consumers:** Compliance analytics, cross-project permit filtering
**Governance:** Admin-managed (Class X). New tags require compliance SME approval. Hybrid rule: controlled base set with admin-extensibility (not freeform). Source keys normalized from hyphenated source values (`high-priority` → `high_priority`) per A5 key convention.
**Key behavior:** `tag_key` (stable slug, underscore-delimited) stored as `tag_value` on `permit_tag` child records.
**Build-ready:** Yes — Phase 1 (11 values frozen from permits.json evidence).

### Rating Band (Scorecard)

| Key | Display Label | Score Range |
|-----|--------------|------------|
| `exceptional` | Exceptional | 4.50 – 5.00 |
| `above_average` | Above Average | 3.50 – 4.49 |
| `satisfactory` | Satisfactory | 2.50 – 3.49 |
| `below_average` | Below Average | 1.50 – 2.49 |
| `unsatisfactory` | Unsatisfactory | 1.00 – 1.49 |

**Primary consumer:** A12 (subcontractor scorecard — `rating_code`)
**Future consumers:** Cross-project performance analytics, procurement qualification
**Governance:** Admin-managed (Class X). Score range boundaries are frozen — changes require business process review.
**Derivation dependency:** Rating band drives `rebid_recommendation` advisory logic in A12.
**Build-ready:** Yes — Phase 1 (values and score ranges frozen in A5; A12 binds by `rating_code` key).

### Rebid Recommendation

| Key | Display Label | Description |
|-----|--------------|-------------|
| `yes` | Yes | Recommended for future work |
| `yes_with_conditions` | Yes with Conditions | Recommended with noted improvement areas |
| `no` | No | Not recommended for future work |

**Primary consumer:** A12 (subcontractor scorecard)
**Future consumers:** Procurement qualification, vendor analytics
**Governance:** Admin-managed (Class X).
**Build-ready:** Yes — Phase 1 (values frozen in A5; A12 binds by `rebid_recommendation_code` key).

### Scorecard Section

| Key | Display Label | Default Weight |
|-----|--------------|---------------|
| `safety_compliance` | Safety & Compliance | 20% |
| `quality_of_work` | Quality of Work | 20% |
| `schedule_performance` | Schedule Performance | 20% |
| `cost_management` | Cost Management | 15% |
| `communication_management` | Communication & Management | 15% |
| `workforce_labor` | Workforce & Labor | 10% |

**Primary consumer:** A12 (subcontractor scorecard — section-level scoring and weighting)
**Future consumers:** Cross-project performance analytics
**Governance:** Admin-managed (Class X). Section weights are configurable per evaluation but default weights are governed. Adding/removing sections requires business process review.
**Build-ready:** Yes — Phase 1 (values and default weights frozen in A5; A12 binds by `section_id` key).

### Lesson Category

| Key | Display Label |
|-----|--------------|
| `pre_construction` | Pre-Construction |
| `estimating_bid` | Estimating & Bid |
| `procurement` | Procurement |
| `schedule` | Schedule |
| `cost_budget` | Cost / Budget |
| `safety` | Safety |
| `quality` | Quality |
| `subcontractors` | Subcontractors |
| `design_rfis` | Design / RFIs |
| `owner_client` | Owner / Client |
| `technology_bim` | Technology / BIM |
| `workforce_labor` | Workforce / Labor |
| `commissioning` | Commissioning |
| `closeout_turnover` | Closeout / Turnover |
| `other` | Other |

**Primary consumer:** A13 (lessons learned)
**Future consumers:** Knowledge management, cross-project trend analysis
**Governance:** Admin-managed (Class X). New categories require knowledge management SME approval.
**Build-ready:** Yes — Phase 1 (values frozen in A13).

### Impact Magnitude

| Key | Display Label | Cost Threshold | Schedule Threshold |
|-----|--------------|---------------|-------------------|
| `minor` | Minor | < $10K | < 2 days |
| `moderate` | Moderate | $10K – $50K | 2 – 10 days |
| `significant` | Significant | $50K – $200K | 10 – 30 days |
| `critical` | Critical | > $200K | > 30 days |

**Primary consumer:** A13 (lessons learned — `impact_magnitude`)
**Future consumers:** Risk analytics, cross-project impact reporting
**Governance:** Admin-managed (Class X). Threshold boundaries are frozen — changes require business process review.
**Build-ready:** Yes — Phase 1 (values and thresholds frozen in A13).

### Project Size Band

| Key | Display Label |
|-----|--------------|
| `under_1m` | Under $1M |
| `1m_5m` | $1M – $5M |
| `5m_15m` | $5M – $15M |
| `15m_50m` | $15M – $50M |
| `50m_100m` | $50M – $100M |
| `over_100m` | Over $100M |

**Primary consumer:** A13 (lessons learned — `project_size_band`)
**Future consumers:** Portfolio analytics, lessons-learned filtering
**Governance:** Admin-managed (Class X). Band boundaries are stable.
**Build-ready:** Yes — Phase 1 (values frozen in A13).

### Complexity Rating

| Key | Display Label | Description |
|-----|--------------|-------------|
| `1` | Straightforward | Minimal coordination, standard scope |
| `2` | Moderate | Some coordination complexity |
| `3` | Complex | Significant coordination, multiple trades/phases |
| `4` | Highly Complex | High coordination, regulatory, or technical demands |
| `5` | Exceptional | Maximum complexity across multiple dimensions |

**Primary consumer:** A13 (lessons learned — `complexity_rating`)
**Future consumers:** Portfolio analytics, lessons-learned filtering
**Governance:** Admin-managed (Class X). 1–5 scale is frozen.
**Build-ready:** Yes — Phase 1 (values frozen in A13).

### Lesson Phase

| Key | Display Label | Description |
|-----|--------------|-------------|
| `preconstruction` | Pre-Construction | Planning, constructability, BIM coordination, design review |
| `design` | Design | Design development, design-build involvement, VE |
| `procurement` | Procurement | Bidding, buyout, subcontractor selection, material ordering |
| `construction` | Construction | Active building, field operations, inspections |
| `commissioning` | Commissioning | Systems startup, testing, TAB, owner training |
| `closeout` | Closeout / Turnover | Punch list, as-builts, O&Ms, warranties, COO |
| `warranty` | Warranty / Post-Occupancy | Post-turnover warranty service, callbacks |

**Primary consumer:** A13 (lessons learned — `phase_encountered`)
**Future consumers:** Portfolio analytics, cross-project lesson filtering by lifecycle phase
**Governance:** Admin-managed (Class X). New phases require operations SME approval. Existing keys may not be deleted or renamed.
**Build-ready:** Yes — Phase 1 (values frozen in A5; A13 binds by `phase_encountered_key`).

### Assignment Value (Responsibility Matrix)

| Key | Display Label | Applies To |
|-----|--------------|-----------|
| `primary` | Primary (X) | PM, Field matrix families |
| `support` | Support | PM, Field matrix families |
| `review` | Review | PM, Field matrix families |
| `sign_off` | Sign-Off | PM, Field matrix families |
| `responsible_party` | Responsible Party | Owner Contract family |

**Primary consumer:** A11 (responsibility matrix — assignment cells)
**Future consumers:** Cross-project responsibility analytics
**Governance:** Admin-managed (Class X). Values are tied to RACI-style governance model.
**Build-ready:** Yes — Phase 1 (values frozen in A5; A11 binds by `value_code` key).

### Division Label

| Key | Display Label | Description |
|-----|--------------|-------------|
| `01` | General Conditions | Project-wide indirect costs (supervision, temp facilities, safety) |
| `02` | Site Construction | Earthwork, site utilities, paving, landscaping |
| `03` | Concrete | Formwork, reinforcement, cast-in-place, precast |
| `10` | Specialties | Signage, compartments, flagpoles, specialty items |
| `15` | Mechanical | HVAC, plumbing, fire protection |
| `20` | Electrical | Power distribution, lighting, communications |
| `25` | Equipment | Fixed and movable equipment |
| `90` | Other | Company-specific extensions outside standard divisions |
| `99` | Company Overhead | Corporate overhead allocation |

**Primary consumer:** A5 cost code hierarchy (`division_code` leading segment of DD-SS-DDD), A6 (division-level budget rollups and UI grouping)
**Future consumers:** Budget/cost control dashboards, portfolio analytics, UI division-filter controls
**Governance:** Admin-managed (Class X). Values extracted from cost-code-dictionary.csv evidence — 9 distinct division codes observed as leading DD segment across 7,565 cost codes. New divisions require cost controls SME approval. Existing keys are immutable.
**Key behavior:** `division_key` (2-digit zero-padded string, matching `division_code` on `cost_code` entity) + `division_label` (human-readable display text). Division labels are a normalized reference dictionary — the code IS the stable key, not a derived display layer.
**Relationship to cost codes:** Division is the parent grouping of the DD-SS-DDD cost code hierarchy. Every cost code maps to exactly one division. UI and reporting bind to `division_key` for rollup and filtering.
**Build-ready:** Yes — Phase 1 (9 values frozen from cost code evidence; A6 and cost code hierarchy bind by `division_key`).

---

## Domain-Local Dictionary Governance Contract (Class D)

Domain-local dictionaries are owned by a single domain schema. A5 does not enumerate their values — that responsibility stays with the owning schema artifact. However, all domain-local dictionaries must follow the structural contract below so they are governed consistently and can be promoted to shared (Class S/X) status if cross-domain consumption emerges.

### Structural Requirements

| Requirement | Rule |
|------------|------|
| **Key + label pattern** | Must use `{concept}_key` / `{concept}_code` + `{concept}_label` / `{concept}_display` pairs per the Key + Display Label Behavior section |
| **Mutability declaration** | The owning schema must declare whether the set is admin-managed, user-managed within constraints, or code-governed |
| **Extensibility declaration** | The owning schema must declare whether the value set is closed (frozen) or open (extensible with constraints) |
| **Lifecycle fields** | `is_active` and optionally `is_deprecated` must be present when soft-delete behavior is needed |
| **Transition rules** | Status/workflow dictionaries must declare allowed state transitions in the owning schema |

### Known Domain-Local Dictionaries (Phase 1)

| Dictionary | Owning Schema | Governance Model | Extensible? |
|-----------|--------------|-----------------|------------|
| Completion Status (risk/constraint/issue) | A7 | Code-governed | Closed (4 values + transitions) |
| Record Subtype | A7 | Code-governed | Open (delay added in v0.2; future subtypes expected) |
| Section Classification (kickoff) | A8 | Code-governed | Closed (4 sections) |
| Row Type (kickoff) | A8 | Code-governed | Closed (task, milestone, deliverable) |
| Status Code (kickoff) | A8 | Code-governed | Closed (5 values) |
| Date Rule Type | A8 | Code-governed | Closed (4 strategies) |
| Instance Status (kickoff) | A8 | Code-governed | Closed (4 values) |
| Permit Status | A9 | Code-governed | Closed (5 values) |
| Priority | A9 | Code-governed | Closed (high, medium, low) |
| Inspection Type | A9 | User-managed | Open (user-defined per project) |
| Inspection Result | A9 | Code-governed | Closed (4 values) |
| Permit Authority | A9 | Admin-managed | Open (new authorities per jurisdiction) |
| Canonical Outcome (checklist) | A10 | Code-governed | Closed (5 values) |
| Raw Outcome Family | A10 | Code-governed | Closed (2 families) |
| Family Status (checklist) | A10 | Code-governed | Closed (3 values) |
| Link Type (checklist) | A10 | Code-governed | Open (new link types expected) |
| Item Type (checklist) | A10 | Code-governed | Open (new types as templates evolve) |
| Matrix Family | A11 | Code-governed | Closed (3 families) |
| Assignment Model | A11 | Code-governed | Closed (2 models) |
| Item Type (responsibility) | A11 | Code-governed | Closed (3 types per family) |
| Role/Party Catalog | A11 | Admin-managed | Open per family (roles defined in A11) |
| Evaluation Type (scorecard) | A12 | Code-governed | Closed (3 types) |
| Evaluation Status (scorecard) | A12 | Code-governed | Closed (4 values) |
| Approval Role (scorecard) | A12 | Code-governed | Closed (3 roles) |
| Approval Status (scorecard) | A12 | Code-governed | Closed (3 values) |
| Reference Type (lessons) | A13 | Code-governed | Open (new reference types expected) |
| Keyword/Tag (lessons) | A13 | User-managed | Open (free-text Phase 1; governed Phase 2) |

### Promotion Path

When a domain-local dictionary begins to be consumed by a second domain schema, it should be promoted to Class X (cross-domain) or Class S (shared reference) and added to A5 with full governance. The owning schema retains its value definitions; A5 gains the governance and binding authority.

---

## Extensibility and Binding Rules

### Binding

Consuming schemas bind to A5-governed dictionaries **by key reference**, not by copying values into the consuming schema. The consuming schema declares:
- which A5 dictionary it references,
- which field holds the key,
- whether the key is required or nullable.

**Example:** A12 `rating_code` binds to the Rating Band governed set by storing the key (`exceptional`, `above_average`, etc.). A12 does not redefine the score ranges — it references A5 as the authority.

### Adding Values

| Class | Process |
|-------|---------|
| **S** (Shared Reference) | Admin request → platform team review → add to dictionary list → consuming schemas pick up automatically |
| **P** (Platform Controlled) | Platform code change → release → all schemas pick up automatically |
| **X** (Cross-Domain Governed) | Admin request → domain SME approval → add to A5 governed set → update consuming schemas if binding changes |
| **D** (Domain-Local) | Schema owner updates domain schema → values available in that domain |

### Validation Expectations

| Boundary | Rule |
|----------|------|
| **Import/ingestion** | Unknown keys are rejected or flagged as `validation_failure` findings. Raw value is preserved in `_raw` field. |
| **UI entry** | Dropdowns/selectors are populated from the governed dictionary. Free-text entry is not permitted for governed fields unless the dictionary is user-managed (Class D, open). |
| **Cross-schema joins** | Joins use the stable key. Display labels are resolved at read time from the governing dictionary, not stored redundantly. |

### Derivation Dependencies

Some governed sets drive downstream computation. These dependencies must be documented in both A5 and the consuming schema.

| Governed Set | Drives | In Schema |
|-------------|--------|-----------|
| Rating Band | `rebid_recommendation` advisory logic | A12 |
| Checklist Family | Raw-to-canonical outcome mapping | A10 |
| Impact Magnitude | Cost/schedule threshold classification | A13 |
| Scorecard Section | Weighted score computation | A12 |
| Register Category | Category-number parsing and grouping | A7 |

---

## Remaining Reference Dictionaries

The following dictionaries are referenced across P1-A1 field definitions. The 7 shared dictionaries above and the Cost Code / CSI Code dictionaries are now canonically defined. The remaining dictionaries are either domain-local (governed by their domain's schema artifact) or not yet in A3 build-ready scope.

### Shared Dictionaries (Hub Site)

| Dictionary | Referenced By | Status |
|-----------|--------------|--------|
| CSICodes / Cost Codes | buyout (csi_code, csi_description) | **Defined above** (Cost Code + CSI Code dictionaries) |
| ProjectTypes | project (project_type_id, project_type_name) | **Defined above** (Simple Reference Dictionary) |
| ProjectStages | project (project_stage_id, project_stage_name) | **Defined above** (Simple Reference Dictionary) |
| ProjectRegions | project (project_region_id) | **Defined above** (Simple Reference Dictionary) |
| StateCodes | project (state_code), new_project_request (state_code) | **Defined above** (Simple Reference Dictionary) |
| CountryCodes | project (country_code) | **Defined above** (Simple Reference Dictionary) |
| DeliveryMethods | project (delivery_method) | **Defined above** (Simple Reference Dictionary) |
| Sectors | project (sector) | **Defined above** (Simple Reference Dictionary) |
| ProjectBidTypes | project (project_bid_type_id) | Schema pending — not in A3 build-ready scope |
| ProjectOwnerTypes | project (project_owner_type_id) | Schema pending — not in A3 build-ready scope |
| TimeZones | project (time_zone) | Schema pending — not in A3 build-ready scope; deferred |

### Domain-Local Dictionaries

| Dictionary | Domain | Referenced By | Status |
|-----------|--------|--------------|--------|
| EstimateSources | estimating | pursuit, precon, tracking | Schema pending |
| EstimateDeliverables | estimating | pursuit, precon, tracking | Schema pending |
| EstimateStatuses | estimating | pursuit, precon, tracking | Schema pending |
| EstimateOutcomes | estimating | tracking | Schema pending |
| PreconStages | estimating | precon engagement | Schema pending |
| EstimatingRoles | estimating | team member | Schema pending |
| EstimatingSpecialties | estimating | team member | Schema pending |
| CommitmentStatuses | buyout | commitment | Schema pending |
| ProcurementMethods | buyout | commitment | Schema pending |
| ContractTypes | buyout | commitment | Schema pending |
| ComplianceStatuses | buyout | commitment | Schema pending |
| MilestoneStatuses | buyout | milestone | Schema pending |
| LongLeadStatuses | buyout | long lead item | Schema pending |
| VEStatuses | buyout | VE item | Schema pending |
| ChecklistItemStates | buyout | checklist item | Schema pending |
| ChecklistRequirements | buyout | checklist item | Schema pending |
| WaiverLevels | buyout | waiver request | Schema pending |
| CompassEnrollmentStatuses | buyout | checklist record | Schema pending |
| PreQualificationStatuses | buyout | checklist record | Schema pending |
| RequestStatuses | project | new_project_request | Schema pending |
| OfficeDivisions | project | new_project_request | Schema pending |

---

## Open Decisions / Future Expansion

### Closed by This Version

| Decision | Resolution |
|----------|-----------|
| **Dictionary classification framework** | Closed — 4-class framework (S, P, X, D) established in v0.5 |
| **Platform controlled sets** | Closed — Import Status, Finding Severity, Finding Category frozen with values and extensibility rules |
| **Cross-domain governed sets** | Closed — 15 sets frozen with values, governance, and build-ready status (Lesson Phase added in v0.7) |
| **Domain-local governance contract** | Closed — structural requirements and 27 known domain-local dictionaries inventoried |
| **Key + display label behavior** | Closed — stable key / display label / raw preservation pattern frozen |
| **Extensibility and binding rules** | Closed — binding, value-addition, validation, and derivation dependency rules frozen |
| **Domain-local dictionary full specification** | Closed (structurally) — A5 provides the governance contract; domain schemas own their values |
| **Permit Tag dictionary** | Closed — promoted to Class X. 11 values frozen from permits.json evidence. Admin-managed; new tags require compliance SME approval. |
| **Kickoff/permits/checklist domain-local expansion** | Closed — added Permit Authority (A9) and Item Type (A10) to domain-local inventory. Domain-local count: 25 → 27. |
| **Lesson Phase dictionary** | Closed — promoted to Class X. 7 construction lifecycle phases frozen (preconstruction through warranty). Admin-managed; new phases require operations SME approval. A13 binds by `phase_encountered_key`. General project-lifecycle phase normalization (A7 etc.) remains a separate Phase 2+ concern. |
| **Division label dictionary** | Closed — promoted to Class X. 9 division labels frozen from cost-code-dictionary.csv evidence (01 General Conditions through 99 Company Overhead). Admin-managed; new divisions require cost controls SME approval. `division_key` is the 2-digit DD prefix of the DD-SS-DDD cost code. A6 and cost code hierarchy bind by `division_key`. |

### Remaining Open

| Decision | Scope | Owner | Target |
|----------|-------|-------|--------|
| **Sage cost code mapping** | Define mapping between HB Intel cost codes and Sage GL accounts | Platform Architecture + Finance | Phase 4+ |
| **Procore cost code sync** | Define bidirectional sync of cost codes with Procore | Platform Architecture | Phase 4+ |
| **Multi-stage applicability** | Determine if any codes need to appear in multiple stages | Business Domains | Phase 1 (late) |
| **Shared dictionary import automation** | Automate dictionary refresh from CSV/Excel uploads | Platform Architecture | Phase 2 |
| **Remaining shared dictionaries** | ProjectBidTypes, ProjectOwnerTypes, TimeZones — not in A3 build-ready scope; define when needed | Platform Architecture | Phase 2+ |
| **Keyword/Tag governance** | A13 keywords are free-text in Phase 1; governed dictionary planned for Phase 2 knowledge management | Platform Architecture + KM | Phase 2 |
| **Role/Party Catalog promotion** | A11 role catalogs per matrix family; evaluate for Class X promotion if cross-schema role consumption emerges | Platform Architecture | Phase 2 |

---

## Decision Owners and Approval

| Role | Name | Approval Date |
|------|------|----------------|
| Platform Architecture Lead | — | — |
| Cost Controls / Operations Lead | — | — |
| Estimating Lead | — | — |

**Approval Status:** Active — Phase 1 dictionary/governance backbone frozen
**Comments:** A5 now governs 61 dictionary artifacts across 4 classes: 15 Class S shared reference entities (Cost Code, CSI Code, 7 Simple Reference Dictionaries), 3 Class P platform controlled sets (Import Status, Finding Severity, Finding Category), 16 Class X cross-domain governed sets (Division Label promoted from open decision; 9 division labels frozen from cost code evidence), and 27 Class D domain-local dictionaries (Permit Authority and Item Type added). Key + display label behavior, extensibility rules, binding mechanics, and derivation dependencies are frozen. Three shared dictionaries (ProjectBidTypes, ProjectOwnerTypes, TimeZones) remain pending — not in A3 build-ready scope.

---

## Revision History

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 0.1 | 2026-03-17 | Architecture | Initial schema; Cost Code dictionary with 4 canonical entities, keying rules, hierarchy parsing, stage applicability, external mapping strategy, and storage alignment. Evidence-based from cost-code-dictionary.csv. Future dictionary inventory established. |
| 0.2 | 2026-03-17 | Architecture | Added CSI Code dictionary with 4 canonical entities, one-to-many description variant model, MasterFormat hierarchy, import cleanup rules (continuation merging, CamelCase normalization), and cross-mapping to cost codes. Evidence-based from csi-code-dictionary.csv (8,991 rows, 819 duplicate codes, 170 continuation artifacts). |
| 0.3 | 2026-03-17 | Architecture | Added Simple Reference Dictionary pattern and 7 shared dictionary definitions (ProjectTypes, ProjectStages, ProjectRegions, StateCodes, CountryCodes, DeliveryMethods, Sectors). Closes A3/A5 shared dictionary gap — all A3 build-ready shared dictionaries now have canonical schemas. Updated shared dictionary table from "Schema pending" to "Defined above." Three dictionaries (ProjectBidTypes, ProjectOwnerTypes, TimeZones) remain pending — not in A3 build-ready scope. |
| 0.4 | 2026-03-17 | Architecture | Added consolidated entity summary with identity class alignment to A2 freeze (15 entities across 3 dictionary families). Added canonical entity names to all 7 simple reference dictionary instantiations. Distinguished build-ready (13 entities, Phase 1) from deferred (2 external mapping entities, Phase 4+). |
| 0.5 | 2026-03-17 | Architecture | Dictionary/governance backbone expansion. Added 4-class dictionary classification framework (S/P/X/D). Froze 3 platform controlled sets (Import Status, Finding Severity, Finding Category). Froze 13 cross-domain governed sets with values, governance, and derivation dependencies. Established domain-local governance contract with 25 inventoried Class D dictionaries. Froze key + display label behavior and extensibility/binding rules. A5 now governs 56 dictionary artifacts — sufficient for later prompts to resolve domain decisions without inventing new governance structure. |
| 0.6 | 2026-03-17 | Architecture | Governance closeout companion pass for kickoff/permits/checklist domains. Promoted Permit Tag to Class X (11 values frozen from permits.json evidence). Added 2 domain-local dictionaries to inventory: Permit Authority (A9, admin-managed, open), Item Type (A10, code-governed, open). Closed Permit Tag open decision. A5 now governs 59 dictionary artifacts: 15 Class S, 3 Class P, 14 Class X, 27 Class D. |
| 0.7 | 2026-03-17 | Architecture | Lessons phase dictionary governance freeze. Promoted Lesson Phase to Class X — 7 construction lifecycle phases frozen (preconstruction, design, procurement, construction, commissioning, closeout, warranty). Admin-managed; new phases require operations SME approval. A13 binds by `phase_encountered_key`. Closed Project Phase open decision. General project-lifecycle normalization (A7 etc.) remains Phase 2+. A5 now governs 60 dictionary artifacts: 15 Class S, 3 Class P, 15 Class X, 27 Class D. |
| 0.8 | 2026-03-17 | Architecture | Division label dictionary governance freeze. Promoted Division Label to Class X — 9 division labels frozen from cost-code-dictionary.csv evidence (01 General Conditions through 99 Company Overhead). Admin-managed; new divisions require cost controls SME approval. `division_key` is the 2-digit DD prefix of DD-SS-DDD cost codes. Closed Division label dictionary open decision. A5 now governs 61 dictionary artifacts: 15 Class S, 3 Class P, 16 Class X, 27 Class D. |
