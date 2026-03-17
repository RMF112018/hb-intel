# P1-A6: External Financial Data Ingestion Schema

**Document ID:** P1-A6
**Phase:** 1 (Foundation)
**Classification:** Internal — Engineering
**Status:** Draft
**Date:** 2026-03-17
**Read With:** [P1-A1-Data-Ownership-Matrix.md](./P1-A1-Data-Ownership-Matrix.md), [P1-A2-Source-of-Record-Register.md](./P1-A2-Source-of-Record-Register.md), [P1-A3-SharePoint-Lists-Libraries-Schema-Register.md](./P1-A3-SharePoint-Lists-Libraries-Schema-Register.md), [P1-A5-Reference-Data-Dictionary-Schema.md](./P1-A5-Reference-Data-Dictionary-Schema.md)

---

## Purpose

Define the ingestion pipeline architecture, canonical entity model, metric governance, and snapshot strategy required to import external financial data into HB Intel — starting with Procore Budget exports.

External financial data arrives as point-in-time exports from systems like Procore with column sets that vary by project configuration, user export choices, and source system version. This document establishes canonical models that normalize external financial data into governed operational structures suitable for cost control reporting, commitment reconciliation, and portfolio analytics.

---

## Relationship to P1-A1 / P1-A2 / P1-A3 / P1-A5

| Artifact | Role | This Document's Relationship |
|----------|------|------------------------------|
| **P1-A1** Data Ownership Matrix | Governance-level data ownership | External financial data is Mirrored per P1-A1 authority model; Procore is not authoritative within HB Intel |
| **P1-A2** Source-of-Record Register | Adapter paths and write safety | External systems are Phase 4+ for active sync per P1-A2; imported snapshots are read-only operational data |
| **P1-A3** SharePoint Schema Register | Physical SharePoint containers | P1-A3 defines containers for persisted canonical budget data if stored in SharePoint lists |
| **P1-A5** Reference Data Dictionaries | Cost codes, CSI codes | Budget lines reference cost codes and CSI codes from P1-A5 dictionaries for classification alignment |

---

## Scope and Non-Scope

### In Scope
- Procore Budget export canonical schema (primary deliverable of this version)
- Import batch and provenance tracking
- Budget line canonical model with parsed hierarchy dimensions
- Financial metric classification (source vs derived)
- Snapshot/temporal import strategy
- Downstream mapping to cost codes, CSI codes, and commitments
- Storage-boundary alignment

### Out of Scope
- Real-time Procore API integration (Phase 4+)
- Procore change orders, direct costs, or contract exports (future versions of this document)
- SharePoint physical container definitions (P1-A3)
- Cost code / CSI code dictionary schemas (P1-A5)
- Budget forecasting calculation engine
- Active write-back to Procore

---

## Procore Budget

### Source File Analysis

**File:** `docs/reference/example/Procore_Budget.csv`

| Property | Value |
|----------|-------|
| Rows | 121 (excluding header) |
| Columns | 21 |
| Encoding | UTF-8 |
| Delimiter | Comma (with quoted fields containing commas) |
| Budget Code uniqueness | **Globally unique** — each code appears exactly once |
| Budget Code format | Composite: `{SubJob}.{Tier3Code}.{CostType}` (e.g., `1000.10-01-025.MAT`) |
| Blank/zero rows | 1 row (row 2) with all "None" dimensions and all-zero financial values |

**Column Structure:**

| # | Column | Type | Role |
|---|--------|------|------|
| 1 | `Sub Job` | string | Project/sub-job classification (`code - description` format) |
| 2 | `Cost Code Tier 1` | string | Top-level cost code grouping (`code - description` format) |
| 3 | `Cost Code Tier 2` | string | Mid-level cost code grouping (`code - description` format) |
| 4 | `Cost Code Tier 3` | string | Detail-level cost code (`code - description` format) |
| 5 | `Cost Type` | string | Cost type classification (`code - description` format) |
| 6 | `Budget Code` | string | Composite unique budget line identifier |
| 7 | `Budget Code Description` | string | Derived composite description |
| 8 | `Original Budget Amount` | number | Original budget allocation |
| 9 | `Budget Modifications` | number | Approved budget modifications/transfers |
| 10 | `Approved COs` | number | Approved change order amounts |
| 11 | `Revised Budget` | number | **Derivable:** Original + Modifications + Approved COs |
| 12 | `Pending Budget Changes` | number | Pending (unapproved) budget changes |
| 13 | `Projected Budget` | number | **Derivable:** Revised Budget + Pending Budget Changes |
| 14 | `Committed Costs` | number | Costs committed via subcontracts/POs |
| 15 | `Direct Costs` | number | Direct (non-committed) costs incurred |
| 16 | `Job to Date Costs` | number | **Derivable:** Committed Costs + Direct Costs (or cumulative actual) |
| 17 | `Pending Cost Changes` | number | Pending cost changes not yet committed |
| 18 | `Projected Costs` | number | **Derivable:** Job to Date + Pending Cost Changes |
| 19 | `Forecast To Complete` | number | Estimated remaining cost to complete |
| 20 | `Estimated Cost at Completion` | number | **Derivable:** Projected Costs + Forecast To Complete (or independent EAC) |
| 21 | `Projected over Under` | number | **Derivable:** Projected Budget − Estimated Cost at Completion |

### Dimension Field Parsing

Tier fields use a `code - description` format that must be parsed:

| Source Field | Example Value | Parsed Code | Parsed Description |
|-------------|--------------|-------------|-------------------|
| `Sub Job` | `1000 - TROPICAL WOLRD NURSERY-CONSTR` | `1000` | `TROPICAL WOLRD NURSERY-CONSTR` |
| `Cost Code Tier 1` | `10 - GENERAL CONDITIONS` | `10` | `GENERAL CONDITIONS` |
| `Cost Code Tier 2` | `10-01 - GENERAL CONDITIONS` | `10-01` | `GENERAL CONDITIONS` |
| `Cost Code Tier 3` | `10-01-025 - PLAN COPY EXPENSE` | `10-01-025` | `PLAN COPY EXPENSE` |
| `Cost Type` | `MAT - Materials` | `MAT` | `Materials` |

**Parsing rule:** Split on first occurrence of ` - ` (space-hyphen-space). Left side = code. Right side = description.

**Special values:**
- `None` = no value / blank row dimension (row 2 only)
- `""` (empty quoted string) = blank Budget Code on the zero-row

### Cost Type Values

| Code | Description |
|------|-------------|
| `LAB` | Labor |
| `LBN` | Labor Burden |
| `MAT` | Materials |
| `OVH` | Overhead |
| `SUB` | Subcontractor |

### Financial Metric Classification

| Metric | Source vs Derived | Import Treatment |
|--------|------------------|-----------------|
| `Original Budget Amount` | **Source** | Store as-imported; authoritative from Procore |
| `Budget Modifications` | **Source** | Store as-imported |
| `Approved COs` | **Source** | Store as-imported |
| `Revised Budget` | **Derivable** (Original + Mods + COs) | Store as-imported; validate derivation; flag variance if mismatch |
| `Pending Budget Changes` | **Source** | Store as-imported |
| `Projected Budget` | **Derivable** (Revised + Pending) | Store as-imported; validate derivation |
| `Committed Costs` | **Source** | Store as-imported |
| `Direct Costs` | **Source** | Store as-imported |
| `Job to Date Costs` | **Derivable** | Store as-imported; validate derivation |
| `Pending Cost Changes` | **Source** | Store as-imported |
| `Projected Costs` | **Derivable** | Store as-imported; validate derivation |
| `Forecast To Complete` | **Source** (may involve judgment/manual entry) | Store as-imported |
| `Estimated Cost at Completion` | **Derivable** | Store as-imported; validate derivation |
| `Projected over Under` | **Derivable** (Budget − EAC) | Store as-imported; validate derivation |

**Strategy:** Store all 14 metrics as-imported from the source for audit/provenance. Validate derivable values against their constituent source values during import. Log `import_finding` (warning) if a derivable metric does not match expected calculation. Do not silently recompute — preserve the source value and flag discrepancies.

### Why a Canonical Model Is Needed

1. **Point-in-time snapshots:** Budget exports are snapshots, not event streams. The same project produces different budget exports over time as costs change.
2. **Composite key parsing:** Budget Code is a concatenation of sub-job, cost code, and cost type — it must be parsed for dimensional analysis.
3. **Tier field parsing:** All dimension fields embed `code - description` pairs that need extraction.
4. **Metric governance:** Some values are source-authoritative, others are derivable — the system must distinguish them.
5. **Cross-domain mapping:** Budget lines must link to HB Intel cost codes, CSI codes, and commitments for reconciliation.
6. **Export variability:** Different Procore projects may use different sub-job structures, cost types, or column subsets.

---

### Canonical Entity Model

#### Entity Summary

| # | Entity | Purpose |
|---|--------|---------|
| 1 | `budget_import_batch` | Tracks each budget file upload/import operation |
| 2 | `budget_line` | Canonical budget line item with parsed dimensions and all financial metrics |
| 3 | `budget_line_external_mapping` | Maps budget lines to HB Intel cost codes, CSI codes, or commitments |
| 4 | `budget_import_finding` | Warnings, errors, and validation findings from import |

#### budget_import_batch

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| batch_id | string | Yes | HB Intel import batch identifier |
| project_id | string | Yes | FK to project domain |
| source_system | string | Yes | Source system name (e.g., "Procore") |
| source_file_name | string | Yes | Original uploaded file name |
| source_file_url | string | No | SharePoint document library URL |
| snapshot_date | date | No | Business date this snapshot represents (may differ from upload date) |
| import_status | string | Yes | pending, parsing, validating, complete, failed |
| total_lines_imported | number | No | Count of budget lines processed |
| total_lines_excluded | number | No | Count of excluded rows (blank/zero/summary) |
| total_warnings | number | No | Count of non-fatal findings |
| total_errors | number | No | Count of fatal findings |
| total_derivation_mismatches | number | No | Count of derivable metrics that did not match expected calculation |
| uploaded_by | string | Yes | Uploader identity (UPN) |
| uploaded_at | datetime | Yes | Upload timestamp |
| completed_at | datetime | No | Processing completion timestamp |
| parser_version | string | No | Parser version used |
| notes | text | No | Import notes |

#### budget_line

The primary budget line item record. One row per unique `budget_code` per import batch.

| Field | Type | Required | Key | Description |
|-------|------|----------|-----|-------------|
| line_id | string | Yes | PK (surrogate) | HB Intel canonical budget line identifier |
| batch_id | string | Yes | FK | FK to budget_import_batch |
| project_id | string | Yes | FK | FK to project domain |
| budget_code | string | Yes | Natural key (unique within batch) | Composite budget line code (e.g., `1000.10-01-025.MAT`) |
| budget_code_description | string | No | — | Source composite description (preserved as-imported) |
| sub_job_code | string | No | — | Parsed sub-job code (e.g., `1000`) |
| sub_job_description | string | No | — | Parsed sub-job description |
| cost_code_tier_1_code | string | No | — | Parsed tier 1 code (e.g., `10`) |
| cost_code_tier_1_description | string | No | — | Parsed tier 1 description |
| cost_code_tier_2_code | string | No | — | Parsed tier 2 code (e.g., `10-01`) |
| cost_code_tier_2_description | string | No | — | Parsed tier 2 description |
| cost_code_tier_3_code | string | No | — | Parsed tier 3 code (e.g., `10-01-025`) |
| cost_code_tier_3_description | string | No | — | Parsed tier 3 description |
| cost_type_code | string | No | — | Parsed cost type code (e.g., `MAT`) |
| cost_type_description | string | No | — | Parsed cost type description (e.g., `Materials`) |
| original_budget_amount | number | No | — | Source metric |
| budget_modifications | number | No | — | Source metric |
| approved_cos | number | No | — | Source metric (approved change orders) |
| revised_budget | number | No | — | Source metric (derivable: original + mods + COs) |
| pending_budget_changes | number | No | — | Source metric |
| projected_budget | number | No | — | Source metric (derivable: revised + pending) |
| committed_costs | number | No | — | Source metric |
| direct_costs | number | No | — | Source metric |
| job_to_date_costs | number | No | — | Source metric (derivable) |
| pending_cost_changes | number | No | — | Source metric |
| projected_costs | number | No | — | Source metric (derivable) |
| forecast_to_complete | number | No | — | Source metric |
| estimated_cost_at_completion | number | No | — | Source metric (derivable) |
| projected_over_under | number | No | — | Source metric (derivable: budget − EAC) |
| row_type | string | Yes | — | `data`, `blank_excluded`, `summary_excluded` |
| is_excluded | boolean | Yes | — | Whether this row was excluded from analytics (blank/zero/summary rows) |
| source_row_number | number | No | — | Original row number in source file |
| notes | text | No | — | Import or processing notes |

#### budget_line_external_mapping

Maps budget lines to HB Intel reference entities.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| mapping_id | string | Yes | Mapping record identifier |
| line_id | string | Yes | FK to budget_line |
| target_entity_type | string | Yes | Target: `cost_code`, `csi_code`, `buyout_commitment` |
| target_entity_id | string | Yes | FK to target entity |
| mapping_basis | string | No | How the mapping was established (code_match, manual, tier_match) |
| is_active | boolean | Yes | Whether this mapping is current |
| notes | text | No | Mapping notes |

#### budget_import_finding

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| finding_id | string | Yes | Finding identifier |
| batch_id | string | Yes | FK to budget_import_batch |
| line_id | string | No | FK to budget_line (null for batch-level findings) |
| severity | string | Yes | error, warning, info |
| category | string | Yes | parse_error, derivation_mismatch, excluded_row, mapping_warning, validation_failure |
| field_name | string | No | Source column name |
| expected_value | string | No | Expected calculated value (for derivation mismatches) |
| actual_value | string | No | Actual imported value |
| message | string | Yes | Human-readable finding description |

---

### Keying and Uniqueness Rules

| Rule | Decision |
|------|----------|
| **Primary key** | `line_id` (surrogate, system-generated) |
| **Natural key** | `budget_code` within a given `batch_id` |
| **Uniqueness constraint** | `(batch_id, budget_code)` must be unique |
| **Cross-snapshot identity** | Same `budget_code` across batches represents the same logical budget line; latest batch = current state |
| **Blank/zero row handling** | Row with all "None" dimensions and zero values → `row_type = 'blank_excluded'`, `is_excluded = true` |
| **Summary row handling** | If present in future exports, total/subtotal rows → `row_type = 'summary_excluded'`, `is_excluded = true` |

---

### Hierarchy / Tier Parsing Rules

| Source Field | Parse Rule | Output Code | Output Description |
|-------------|-----------|-------------|-------------------|
| `Sub Job` | Split on first ` - ` | `sub_job_code` | `sub_job_description` |
| `Cost Code Tier 1` | Split on first ` - ` | `cost_code_tier_1_code` | `cost_code_tier_1_description` |
| `Cost Code Tier 2` | Split on first ` - ` | `cost_code_tier_2_code` | `cost_code_tier_2_description` |
| `Cost Code Tier 3` | Split on first ` - ` | `cost_code_tier_3_code` | `cost_code_tier_3_description` |
| `Cost Type` | Split on first ` - ` | `cost_type_code` | `cost_type_description` |
| `None` values | Do not parse; set both code and description to null | null | null |

**Cost Code Tier 3 alignment:** The tier 3 code (e.g., `10-01-025`) follows the same `DD-SS-DDD` format as HB Intel cost codes defined in P1-A5. This enables automatic mapping to the cost code dictionary.

---

### Snapshot / Temporal Strategy

| Aspect | Decision |
|--------|----------|
| **Import model** | Append — each import creates a new batch; does not overwrite previous batches |
| **Current state** | Latest batch for a project represents the current budget state |
| **Historical access** | All previous batches are retained for trend analysis and audit |
| **Snapshot date** | May be explicitly provided by uploader or defaulted to upload date |
| **Comparison** | Cross-batch comparison enables budget-vs-prior-budget variance reporting |
| **Retention** | Follows parent project record per P1-A1 retention policy |

---

### Downstream Mapping Strategy

| Target | Mapping Approach |
|--------|-----------------|
| **Cost Codes (P1-A5)** | Automatic match: tier 3 code (e.g., `10-01-025`) → cost code dictionary `csi_code` field. Use `budget_line_external_mapping` with `target_entity_type = 'cost_code'`, `mapping_basis = 'code_match'` |
| **CSI Codes (P1-A5)** | Indirect: via cost code → CSI mapping chain defined in P1-A5 external mappings |
| **Buyout Commitments** | Map committed costs to commitment records via cost code + sub-job alignment. Use `target_entity_type = 'buyout_commitment'` |
| **Forecasting / Cost Controls** | Budget lines serve as the budget-side fact source; job-to-date and forecast metrics feed cost-control dashboards |
| **Portfolio Analytics** | Cross-project rollups by sub-job, tier, and cost type enable portfolio-level financial analysis |

---

### Search / Analytics / Reporting Role

| Role | Treatment |
|------|-----------|
| **Search indexed?** | Yes — budget_code, descriptions, sub-job, tier descriptions |
| **Search role** | `budget_code`: Keyword Content; tier descriptions: Keyword Content; `cost_type_description`: Facet / Filter; `sub_job_description`: Facet / Filter |
| **Analytics included?** | Yes — financial metrics are primary analytics fact source |
| **Analytics role** | Operational Reporting (project-level cost tracking); Portfolio / Cross-Project Analytics (cross-project financial rollups); Snapshot History (trend analysis) |
| **Dashboard use** | Budget vs actual, committed vs projected, forecast-to-complete trending |

---

### Storage Boundary Alignment

| Data | Storage | Authority | P1-A1/A2 Alignment |
|------|---------|-----------|---------------------|
| Raw uploaded files | SharePoint Document Library (project site) | Source provenance; immutable | Aligns with P1-A1: SharePoint for business data |
| Import batch metadata | Azure Table Storage | Operational state | Aligns with P1-A1/A2: Table Storage for operational state |
| Canonical budget lines | SharePoint List (project site) | Authoritative imported financial data (Mirrored from Procore) | Aligns with P1-A1: imported data is Mirrored authority type |
| External mappings | SharePoint List (project site) | Authoritative mapping data | Alongside budget data |
| Import findings | Azure Table Storage | Operational audit | Aligns with P1-A1/A2: audit in Table Storage |

---

## Future External Financial Schemas

This artifact will be extended to cover additional external financial data sources as they are introduced:

| Future Schema | Source System | Status |
|--------------|--------------|--------|
| Procore Change Orders | Procore | Pending |
| Procore Direct Costs | Procore | Pending |
| Procore Contracts / Commitments | Procore | Pending |
| Sage Budget Export | Sage | Phase 4+ |
| Sage GL Actuals | Sage | Phase 4+ |

---

## Open Decisions / Future Expansion

| Decision | Scope | Owner | Target |
|----------|-------|-------|--------|
| **Procore API integration** | Replace CSV upload with real-time Procore API sync | Platform Architecture | Phase 4+ |
| **Budget comparison engine** | Automated cross-snapshot variance detection and reporting | Platform Architecture + Cost Controls | Phase 2–3 |
| **Cost type reference dictionary** | Formalize LAB/LBN/MAT/OVH/SUB as governed reference set in P1-A5 | Platform Architecture | Phase 1 |
| **Sub-job entity model** | Determine if sub-jobs warrant their own entity or remain dimension fields | Platform Architecture + Project Controls | Phase 1 (late) |
| **Derivation validation rules** | Finalize which derivable metrics are validated and tolerance thresholds | Cost Controls | Phase 1 |

---

## Decision Owners and Approval

| Role | Name | Approval Date |
|------|------|----------------|
| Platform Architecture Lead | — | — |
| Cost Controls / Operations Lead | — | — |
| Project Controls Lead | — | — |

**Approval Status:** Pending — Schema defined; pending operational validation with real project data
**Comments:** Schema derived from Procore_Budget.csv (121 lines, 21 columns, 14 financial metrics). Snapshot-append model preserves full import history.

---

## Revision History

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 0.1 | 2026-03-17 | Architecture | Initial schema; Procore Budget with 4 canonical entities, composite key parsing, 14-metric classification (source vs derivable), snapshot-append temporal model, and downstream mapping strategy. Evidence-based from Procore_Budget.csv. |
