# P1-A5: Reference Data Dictionary Schema

**Document ID:** P1-A5
**Phase:** 1 (Foundation)
**Classification:** Internal — Engineering
**Status:** Draft
**Date:** 2026-03-17
**Read With:** [P1-A1-Data-Ownership-Matrix.md](./P1-A1-Data-Ownership-Matrix.md), [P1-A2-Source-of-Record-Register.md](./P1-A2-Source-of-Record-Register.md), [P1-A3-SharePoint-Lists-Libraries-Schema-Register.md](./P1-A3-SharePoint-Lists-Libraries-Schema-Register.md)

---

## Purpose

Define the canonical schema, keying rules, lifecycle model, and governance approach for reference data dictionaries used across HB Intel domains.

Reference data — cost codes, project types, project stages, CSI/MasterFormat codes, status value sets, geographic codes, and similar controlled vocabularies — is consumed by multiple domains but owned and governed centrally. This document establishes the architectural patterns for these dictionaries so they are treated as governed reference data rather than ad hoc UI dropdown values.

The first dictionary fully specified here is the **Cost Code Dictionary**, based on evidence from `docs/reference/example/cost-code-dictionary.csv`.

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
- Cost Code dictionary canonical schema (primary deliverable of this version)
- Reference data governance patterns applicable to all HB Intel dictionaries
- Keying, hierarchy, lifecycle, and applicability rules
- External mapping strategy for ERP/Sage integration
- Search, analytics, and reporting role of reference data
- Storage-boundary alignment with P1-A1/P1-A2

### Out of Scope
- SharePoint physical container definitions (P1-A3)
- Data ownership governance decisions (P1-A1)
- Adapter implementation details (P1-B1)
- Full specification of every P1-A1 referenced dictionary (future versions of this document)

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

## Future Reference Dictionaries

P1-A1 field definitions reference the following shared and domain-local dictionaries. Future versions of this document will specify their canonical schemas:

### Shared Dictionaries (Hub Site)

| Dictionary | Referenced By | Status |
|-----------|--------------|--------|
| CSICodes / Cost Codes | buyout (csi_code, csi_description) | **Cost Code: Defined above; CSI Code: Defined above** |
| ProjectTypes | project (project_type_id, project_type_name) | Schema pending |
| ProjectStages | project (project_stage_id, project_stage_name) | Schema pending |
| ProjectBidTypes | project (project_bid_type_id) | Schema pending |
| ProjectOwnerTypes | project (project_owner_type_id) | Schema pending |
| ProjectRegions | project (project_region_id) | Schema pending |
| StateCodes | project (state_code), new_project_request (state_code) | Schema pending |
| CountryCodes | project (country_code) | Schema pending |
| DeliveryMethods | project (delivery_method) | Schema pending |
| Sectors | project (sector) | Schema pending |
| TimeZones | project (time_zone) | Schema pending |

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

| Decision | Scope | Owner | Target |
|----------|-------|-------|--------|
| **Sage cost code mapping** | Define mapping between HB Intel cost codes and Sage GL accounts | Platform Architecture + Finance | Phase 4+ |
| **Procore cost code sync** | Define bidirectional sync of cost codes with Procore | Platform Architecture | Phase 4+ |
| **Multi-stage applicability** | Determine if any codes need to appear in multiple stages | Business Domains | Phase 1 (late) |
| **Division label dictionary** | Create human-readable labels for division codes (01 = General Conditions, etc.) | Platform Architecture | Phase 1 |
| **Shared dictionary import automation** | Automate dictionary refresh from CSV/Excel uploads | Platform Architecture | Phase 2 |
| **Domain-local dictionary full specification** | Specify canonical schemas for all domain-local dictionaries listed above | Platform Architecture + Business Domains | Phase 1–2 |

---

## Decision Owners and Approval

| Role | Name | Approval Date |
|------|------|----------------|
| Platform Architecture Lead | — | — |
| Cost Controls / Operations Lead | — | — |
| Estimating Lead | — | — |

**Approval Status:** Pending — Cost Code schema defined; pending domain confirmation of stage applicability and hierarchy rules
**Comments:** Schema derived from evidence in cost-code-dictionary.csv (7,565 codes, 9 stages, DD-SS-DDD format).

---

## Revision History

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 0.1 | 2026-03-17 | Architecture | Initial schema; Cost Code dictionary with 4 canonical entities, keying rules, hierarchy parsing, stage applicability, external mapping strategy, and storage alignment. Evidence-based from cost-code-dictionary.csv. Future dictionary inventory established. |
| 0.2 | 2026-03-17 | Architecture | Added CSI Code dictionary with 4 canonical entities, one-to-many description variant model, MasterFormat hierarchy, import cleanup rules (continuation merging, CamelCase normalization), and cross-mapping to cost codes. Evidence-based from csi-code-dictionary.csv (8,991 rows, 819 duplicate codes, 170 continuation artifacts). |
