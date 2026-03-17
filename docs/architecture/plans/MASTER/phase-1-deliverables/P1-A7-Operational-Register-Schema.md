# P1-A7: Operational Register Schema

**Document ID:** P1-A7
**Phase:** 1 (Foundation)
**Classification:** Internal — Engineering
**Status:** Draft
**Date:** 2026-03-17
**Read With:** [P1-A1-Data-Ownership-Matrix.md](./P1-A1-Data-Ownership-Matrix.md), [P1-A2-Source-of-Record-Register.md](./P1-A2-Source-of-Record-Register.md), [P1-A3-SharePoint-Lists-Libraries-Schema-Register.md](./P1-A3-SharePoint-Lists-Libraries-Schema-Register.md), [P1-A5-Reference-Data-Dictionary-Schema.md](./P1-A5-Reference-Data-Dictionary-Schema.md)

---

## Purpose

Define the canonical schema for project-level operational registers that track issues, actions, risks, constraints, and other managed items across construction operations.

This register absorbs tracked items from across all operational categories — design, permits, procurement, safety, quality, cost, risk management, change management, environmental, legal, and 25+ additional categories — into a unified model with consistent lifecycle tracking, assignment, due-date management, and closure evidence.

---

## Register-Type Classification Decision

### Decision: Hybrid Operational Register

The source file (`docs/reference/example/constraints.json`) is named "constraints" but the evidence shows it is a **hybrid operational register** — a unified tracking system for issues, actions, risks, constraints, and other managed items.

### Evidence

| Signal | Finding | Implication |
|--------|---------|-------------|
| **36 categories** | Spans RISK MANAGEMENT, CHANGE MANAGEMENT, SAFETY, QUALITY, TESTING, TRAINING, EQUIPMENT, ENVIRONMENTAL, LEGAL, SECURITY, etc. | Far broader than "constraints" or "risks" |
| **Status lifecycle** | Identified → In Progress → Pending → Closed | Action/issue lifecycle, not risk probability assessment |
| **Comment language** | "Identified action for...", "In Progress action for..." | Items are tracked as actions, not uncertainty assessments |
| **No probability/impact** | No fields for likelihood, severity, exposure, or risk score | Not a pure risk register |
| **No dependency/blocker** | No fields for blocking conditions, predecessors, or constraint types | Not a pure constraint register |
| **Assignment + due date** | Person-assigned with due dates and elapsed-day tracking | Classic issue/action item pattern |

### Why Other Labels Are Less Precise

| Label | Problem |
|-------|---------|
| **Risk Register** | No probability, impact, or exposure fields; no risk-scoring model; categories include non-risk items like EQUIPMENT, LOGISTICS, TRAINING |
| **Constraint Register** | No dependency/blocker/condition fields; no constraint-type classification; items span operational categories unrelated to constraints |
| **Issue Register** | Closer, but misses that items include proactive risk identification and constraint tracking alongside reactive issue management |

### Future Expansion

The schema is designed so that future enhancements can add:
- Risk-specific fields (probability, impact, exposure, mitigation plan) as optional typed extensions
- Constraint-specific fields (blocking condition, dependency, resolution criteria) as optional typed extensions
- A `record_type` field that classifies individual records as risk, constraint, issue, or action while sharing the common register structure

---

## Relationship to P1-A1 / P1-A2 / P1-A3 / P1-A5

| Artifact | Relationship |
|----------|-------------|
| **P1-A1** | The `risk` domain in P1-A1 maps to operational register records categorized under risk management. This schema governs the broader register that the risk domain draws from. |
| **P1-A2** | Operational register data follows P1-A2 adapter patterns when persisted to SharePoint. |
| **P1-A3** | P1-A3 defines the SharePoint list containers that store register records per project site. |
| **P1-A5** | Category and BIC values are governed reference dictionaries; their canonical schemas belong in P1-A5. |

---

## Scope and Non-Scope

### In Scope
- Canonical register record schema
- Project envelope / context handling
- Category and BIC normalization
- Lifecycle / status model
- Assignment identity model
- Elapsed-day derivation rules
- Closure evidence model
- Import batch / provenance tracking
- Storage-boundary alignment

### Out of Scope
- Risk-specific scoring/probability model (future extension)
- Constraint-specific dependency model (future extension)
- Full mitigation-plan or action-plan child entities (future extension)
- Comment history as separate entity (future; currently single-value)
- SharePoint physical container definitions (P1-A3)
- Reference dictionary schemas for categories/BICs (P1-A5)

---

## Source File Analysis

**File:** `docs/reference/example/constraints.json`

| Property | Value |
|----------|-------|
| Format | JSON array of project objects, each containing a `constraints` array |
| Projects | 20 |
| Total records | 400 (~20 per project) |
| Top-level structure | `[ { project_id, name, department, constraints: [...] } ]` |

### Project Envelope Fields

| Field | Type | Purpose |
|-------|------|---------|
| `project_id` | number | Project identifier (matches P1-A1 project domain) |
| `name` | string | Project display name |
| `department` | string | Department classification |

### Record Fields

| Field | Type | Unique? | Purpose |
|-------|------|---------|---------|
| `id` | string | **Yes (globally)** | Sequential identifier; unique across all projects (400 unique / 400 records) |
| `no` | string | No | Formatted display number; format `{category#}.{sequence}` (e.g., "28.1") |
| `category` | string | — | Numbered category label (e.g., "28. RISK MANAGEMENT"); 36 values |
| `description` | string | — | Free-text description of the tracked item |
| `dateIdentified` | date | — | Date the item was first identified |
| `daysElapsed` | number | — | Days since identification; **derivable** from dateIdentified and current/close date |
| `reference` | string | **No** | Reference code (e.g., "RISK-001"); 74 duplicates across projects — same code reused |
| `closureDocument` | string | — | Document reference for closure evidence; empty string when open or when no evidence provided |
| `assigned` | string | — | Person display name (e.g., "Mark Davis") |
| `bic` | string | — | Business-in-Charge team (e.g., "Risk Team"); 32 values |
| `dueDate` | date | — | Target due date for resolution |
| `completionStatus` | string | — | Lifecycle status; 4 values: Identified, In Progress, Pending, Closed |
| `dateClosed` | date | — | Date the item was closed; empty string when open |
| `comments` | string | — | Current-state commentary; follows template pattern |

### Key Findings

| Finding | Detail |
|---------|--------|
| `id` is globally unique | Reliable as surrogate key across all projects |
| `reference` is NOT unique | 74 codes appear in multiple projects (e.g., "RISK-001" in 4 projects) — project-scoped business code |
| `no` is a formatted display label | Composed of category number + sequence; not a stable key |
| `category` embeds numbered prefix | "28. RISK MANAGEMENT" → category_number = 28, category_label = "RISK MANAGEMENT" |
| `daysElapsed` is derivable | Can be computed from dateIdentified + current date (open) or dateClosed (closed) |
| `closureDocument` always empty | Even for 87 closed items — field exists but is not populated in this sample |
| `comments` use template pattern | "{Status} action for {description}" — may be auto-generated |

---

### Canonical Entity Model

#### Entity Summary

| # | Entity | Purpose |
|---|--------|---------|
| 1 | `register_import_batch` | Tracks each register file upload/import operation |
| 2 | `register_record` | Canonical operational register record |
| 3 | `register_record_external_mapping` | Maps records to schedule, cost, commitment, or compliance entities |
| 4 | `register_import_finding` | Warnings, errors, and validation findings from import |

#### register_import_batch

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| batch_id | string | Yes | HB Intel import batch identifier |
| project_id | string | No | FK to project domain (null for multi-project imports) |
| source_system | string | Yes | Source system name (e.g., "HB Intel", "Procore", "External") |
| source_file_name | string | Yes | Original uploaded file name |
| source_file_url | string | No | SharePoint document library URL |
| import_status | string | Yes | pending, parsing, validating, complete, failed |
| total_records_imported | number | No | Count of records processed |
| total_records_excluded | number | No | Count of excluded/invalid rows |
| total_warnings | number | No | Non-fatal findings |
| total_errors | number | No | Fatal findings |
| uploaded_by | string | Yes | Uploader identity (UPN) |
| uploaded_at | datetime | Yes | Upload timestamp |
| completed_at | datetime | No | Processing completion timestamp |
| parser_version | string | No | Parser version used |
| notes | text | No | Import notes |

#### register_record

The primary operational register record. One row per tracked item.

| Field | Type | Required | Key | Description |
|-------|------|----------|-----|-------------|
| record_id | string | Yes | PK (surrogate) | HB Intel canonical register record identifier |
| batch_id | string | No | FK | FK to register_import_batch (null for user-entered records) |
| project_id | string | Yes | FK | FK to project domain |
| project_name | string | No | — | Display mirror of project name |
| department | string | No | — | Department classification from source |
| source_record_id | string | No | — | Original source `id` field (for imported records) |
| display_no | string | No | — | Formatted display number (e.g., "28.1"); not used as key |
| record_type | string | No | — | Subtype classification: risk, constraint, issue, action, general (future extension; null = untyped) |
| category_number | number | No | — | Parsed category number from source (e.g., 28) |
| category_label | string | No | — | Parsed category label (e.g., "RISK MANAGEMENT") |
| category_raw | string | No | — | Original source category text (e.g., "28. RISK MANAGEMENT") |
| description | string | Yes | — | Free-text description of the tracked item |
| reference | string | No | — | Reference code (e.g., "RISK-001"); project-scoped, not globally unique |
| assigned_display | string | No | — | Person display name from source (e.g., "Mark Davis") |
| assigned_person_key | string | No | — | Stable person/assignment key (resolved during processing; null until identity reconciliation) |
| bic_display | string | No | — | Business-in-Charge team display text |
| bic_key | string | No | — | Stable BIC reference key (resolved from BIC dictionary if available) |
| date_identified | date | No | — | Date the item was first identified |
| due_date | date | No | — | Target due date for resolution |
| completion_status | string | Yes | — | Lifecycle status: Identified, In Progress, Pending, Closed |
| date_closed | date | No | — | Date the item was closed (null when open) |
| days_elapsed | number | No | — | **Derived:** days since date_identified (to current date if open, to date_closed if closed) |
| days_elapsed_source | number | No | — | Original source-supplied daysElapsed value (preserved for provenance) |
| closure_document | string | No | — | Document reference or identifier for closure evidence |
| comments | string | No | — | Current-state commentary |
| is_active | boolean | Yes | — | Whether the record is currently active (true when not Closed) |
| source_extras_json | text | No | — | Preserved source-specific fields not mapped to canonical columns |
| notes | text | No | — | Implementation or processing notes |

#### register_record_external_mapping

Maps register records to related entities in other domains.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| mapping_id | string | Yes | Mapping record identifier |
| record_id | string | Yes | FK to register_record |
| target_entity_type | string | Yes | Target: `schedule_activity`, `buyout_commitment`, `change_order`, `compliance_record`, `document` |
| target_entity_id | string | Yes | FK to target entity |
| mapping_basis | string | No | How the mapping was established (manual, reference_match, category_match) |
| is_active | boolean | Yes | Whether this mapping is current |

#### register_import_finding

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| finding_id | string | Yes | Finding identifier |
| batch_id | string | Yes | FK to register_import_batch |
| record_id | string | No | FK to register_record |
| severity | string | Yes | error, warning, info |
| category | string | Yes | parse_error, validation_failure, derivation_mismatch, mapping_warning |
| field_name | string | No | Source field name |
| message | string | Yes | Human-readable finding description |

---

### Keying and Uniqueness Rules

| Rule | Decision |
|------|----------|
| **Primary key** | `record_id` (surrogate, system-generated) |
| **Source identity** | `source_record_id` preserves the original `id` from imported files |
| **Natural key** | `(project_id, reference)` is the project-scoped business key — `reference` is unique within a project but reused across projects |
| **`display_no` treatment** | Display-only formatted label; not used as a key or uniqueness constraint |
| **`id` from source** | Globally unique in the sample (400/400) but treated as source-specific; HB Intel generates its own `record_id` |
| **Repeat import handling** | Same project + reference across batches represents the same logical record; latest batch = current state |

---

### Category / BIC Normalization Rules

#### Category

| Aspect | Rule |
|--------|------|
| **Raw preservation** | Store original text in `category_raw` (e.g., "28. RISK MANAGEMENT") |
| **Parsed components** | Split on first `. ` (period-space): left = `category_number`, right = `category_label` |
| **Dictionary candidate** | 36 category values should be governed as a reference dictionary in P1-A5 (`RegisterCategories`) |
| **Sort order** | Category number provides natural sort order |

#### BIC (Business-in-Charge)

| Aspect | Rule |
|--------|------|
| **Display preservation** | Store original text in `bic_display` |
| **Dictionary candidate** | 32 BIC values should be governed as a reference dictionary in P1-A5 (`RegisterBICTeams`) |
| **Key resolution** | `bic_key` resolved from dictionary when available; null until dictionary is populated |

---

### Lifecycle / Temporal Rules

#### Status Model

| Status | Meaning | Allowed Transitions |
|--------|---------|-------------------|
| `Identified` | Item identified, not yet acted upon | → In Progress, → Pending, → Closed |
| `In Progress` | Active work underway | → Pending, → Closed |
| `Pending` | Waiting on external input or dependency | → In Progress, → Closed |
| `Closed` | Item resolved and closed | (terminal; reversal requires reason) |

#### Days Elapsed Derivation

| Situation | Calculation |
|-----------|-------------|
| Open record | `current_date − date_identified` (recomputed on read) |
| Closed record | `date_closed − date_identified` (fixed at closure) |
| Missing date_identified | `days_elapsed = null` |

**Storage decision:** Both source value and derived value.
- `days_elapsed_source`: the original value from the imported file (preserved for provenance)
- `days_elapsed`: recomputed value (derived for accuracy; may diverge from source if dates changed)

#### Closure Validation

| Rule | Enforcement |
|------|------------|
| Status = Closed requires `date_closed` | Warning if Closed without date_closed |
| `closure_document` is optional | Not enforced; encouraged for compliance-sensitive categories |

---

### Comments / Closure Evidence Rules

| Aspect | Decision |
|--------|----------|
| **Comments model** | Single current-value text field; comment history is a future extension (not modeled as separate entity in v0.1) |
| **Closure document** | Stored as string field on register_record; may contain document ID, URL, or reference code |
| **Document linkage** | For rich document linking, use `register_record_external_mapping` with `target_entity_type = 'document'` |
| **Attachment support** | Future extension; not modeled in v0.1 |

---

### Downstream Mapping Strategy

| Target | Mapping Approach |
|--------|-----------------|
| **Project** | Direct FK via `project_id` |
| **Schedule Activities** | Via `register_record_external_mapping` (`schedule_activity`) for schedule-impacting items |
| **Buyout Commitments** | Via external mapping for procurement/vendor-related items |
| **Change Orders** | Via external mapping for change management items |
| **Compliance Records** | Via external mapping for safety/quality/environmental items |
| **Documents** | Via external mapping or `closure_document` field |
| **Cost Codes / CSI** | Indirect via commitment or schedule linkage |

---

### Search / Analytics / Reporting Role

| Role | Treatment |
|------|-----------|
| **Search indexed?** | Yes — description, reference, assigned, category, comments |
| **Search role** | `description`: Keyword Content; `reference`: Keyword Content; `category_label`: Facet / Filter; `completion_status`: Facet / Filter; `assigned_display`: Facet / Filter; `bic_display`: Facet / Filter |
| **Analytics included?** | Yes — operational reporting and portfolio analytics |
| **Analytics role** | Operational Reporting (open/closed trends, aging, overdue items); Portfolio / Cross-Project Analytics (category distribution, team workload, closure rates) |
| **Dashboard use** | Open items by category/project, overdue items, aging distribution, closure velocity |
| **AI context** | Register items provide context for risk assessment and project health scoring |

---

### Storage Boundary Alignment

| Data | Storage | Authority | P1-A1/A2 Alignment |
|------|---------|-----------|---------------------|
| Canonical register records | SharePoint List (project site) | Authoritative for operational register data | Aligns with P1-A1: SharePoint for project business data |
| Import batch metadata | Azure Table Storage | Operational state | Aligns with P1-A1/A2: Table Storage for operational state |
| External mappings | SharePoint List (project site) | Authoritative mapping data | Alongside register data |
| Import findings | Azure Table Storage | Operational audit | Aligns with P1-A1/A2: audit in Table Storage |
| Category/BIC dictionaries | SharePoint List (hub site, shared) | Authoritative reference data | Governed by P1-A5 |

---

## Delay Subtype Extension

### Overview

Delay records are modeled as `register_record` entries with `record_type = 'delay'`. Delay-specific fields are optional columns on `register_record` — populated only when `record_type = 'delay'`, null for other record types.

This is the first implemented subtype extension of the operational register, establishing the pattern for future risk, constraint, and action subtypes.

### Source File

**File:** `docs/reference/example/Project Delay Log_2025.csv`

| Property | Value |
|----------|-------|
| Format | CSV template/tracker |
| Rows | 31 (including metadata, headers, empty rows, totals) |
| Data rows | 0 (template structure only; rows 6–29 are empty placeholders) |
| Column header row | Row 5 |

### Source Structure

| Row | Content | Treatment |
|-----|---------|-----------|
| Row 1 | `Owner Name` (empty value) | Log-level metadata → `owner_name_snapshot` on import batch or register_record |
| Row 2 | `Project Name` (empty value) | Log-level metadata → `project_name` on register_record |
| Row 3 | `Delay Log` | Sheet title → source provenance only |
| Row 4 | Empty | Skip |
| Row 5 | Column headers | Schema definition row |
| Rows 6–29 | Empty data rows | Placeholder; skip during import |
| Row 30 | Totals: `Total Potential Cost Impact: $-`, `Total Potential Delay [days] 0` | Derived summary → optional import-batch snapshot fields; not canonical delay records |

### Source Column Mapping

| Source Column | Raw Field | Normalized Field | Type | Description |
|--------------|-----------|-----------------|------|-------------|
| `PCCO #` | `pcco_reference_raw` | `pcco_record_key` | string → string (FK) | Potential Change/Cost Order reference; raw text preserved; canonical linked key resolved when possible |
| `Affected Task` | `affected_task_raw` | `affected_schedule_activity_key` | string → string (FK) | Schedule activity affected by delay; raw text preserved; canonical schedule activity key resolved when possible |
| `Critical Path Impact [Yes/ No]` | `critical_path_impact_raw` | `critical_path_impact_flag` | string → boolean | Whether delay impacts critical path; "Yes" → true, "No" → false, blank → null |
| `Potential Cost Impact` | `potential_cost_impact_raw` | `potential_cost_impact_amount` | string → number | Dollar amount of potential cost impact; "$-" or blank → 0 or null; strip currency formatting |
| `Expected/ Actual Delay Duration [days]` | `delay_duration_raw` | `delay_duration_days` | string → number | Duration of delay in calendar days; blank → null |
| `Original Activity Start` | `original_activity_start_raw` | `original_activity_start_date` | string → date | Original planned start date of the affected activity |
| `Delay Start` | `delay_start_raw` | `delay_start_date` | string → date | Date the delay began |
| `Date of Delay Notification to Owner` | `owner_notification_raw` | `owner_notification_date` | string → date | Date the owner was formally notified of the delay |
| `Notes` | `delay_notes` | — | string | Free-text notes/remarks about the delay |

### Delay-Specific Fields on `register_record`

These fields are added to the existing `register_record` entity. They are populated only when `record_type = 'delay'` and are null for all other record types.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `owner_name_snapshot` | string | No | Owner/client name from source metadata row; display mirror of project owner |
| `pcco_reference_raw` | string | No | Raw PCCO # text from source |
| `pcco_record_key` | string | No | Canonical FK to related change/PCCO record (if resolved) |
| `affected_task_raw` | string | No | Raw Affected Task text from source |
| `affected_schedule_activity_key` | string | No | Canonical FK to schedule_activity (P1-A4) (if resolved) |
| `critical_path_impact_raw` | string | No | Raw Yes/No text from source |
| `critical_path_impact_flag` | boolean | No | Normalized: true = Yes, false = No, null = unknown |
| `potential_cost_impact_raw` | string | No | Raw dollar text from source (e.g., "$15,000", "$-") |
| `potential_cost_impact_amount` | number | No | Normalized numeric amount; 0 for "$-"; null if blank |
| `delay_duration_raw` | string | No | Raw days text from source |
| `delay_duration_days` | number | No | Normalized numeric days; null if blank |
| `original_activity_start_raw` | string | No | Raw date text from source |
| `original_activity_start_date` | date | No | Normalized date; null if blank or unparseable |
| `delay_start_raw` | string | No | Raw date text from source |
| `delay_start_date` | date | No | Normalized date; null if blank or unparseable |
| `owner_notification_raw` | string | No | Raw date text from source |
| `owner_notification_date` | date | No | Normalized date; null if blank or unparseable |
| `delay_notes` | text | No | Notes/remarks from source Notes column |

### Import Batch Snapshot Fields for Totals

When the source file contains a totals row, these optional fields are stored on `register_import_batch` (not on individual delay records):

| Field | Type | Description |
|-------|------|-------------|
| `imported_total_potential_cost_impact` | number | Source totals row value for Total Potential Cost Impact |
| `imported_total_potential_delay_days` | number | Source totals row value for Total Potential Delay [days] |

These are reconciliation snapshots only — canonical totals should be derived from the actual delay records.

### PCCO / Change Linkage Rules

| Aspect | Rule |
|--------|------|
| **Raw preservation** | `pcco_reference_raw` stores the exact source text |
| **Canonical linkage** | `pcco_record_key` resolves to a change/PCCO record key when available; null until identity reconciliation |
| **Resolution pattern** | Parser attempts to match PCCO # against known change order references; logs import_finding (info) if unresolvable |

### Affected Task / Schedule Linkage Rules

| Aspect | Rule |
|--------|------|
| **Raw preservation** | `affected_task_raw` stores the exact source text |
| **Canonical linkage** | `affected_schedule_activity_key` resolves to a `schedule_activity` record key (P1-A4) when available |
| **Resolution pattern** | Parser attempts to match against activity name or code in the project's schedule; logs import_finding (info) if unresolvable |

### Normalization Rules

| Source Pattern | Normalized Treatment |
|----------------|---------------------|
| "Yes" / "YES" / "yes" | `critical_path_impact_flag = true` |
| "No" / "NO" / "no" | `critical_path_impact_flag = false` |
| Blank | `critical_path_impact_flag = null` |
| "$-" or "$0" or blank | `potential_cost_impact_amount = 0` or `null` |
| "$15,000" | Strip `$`, `,`; parse as number → `15000` |
| Date strings | Parse to ISO date; log warning if format is ambiguous |
| Blank fields | `null` in normalized fields; empty string in raw fields |

### Search / Filter / Reporting Role (Delay Subtype)

| Dimension | Treatment |
|-----------|-----------|
| **Filterable by** | record_type = 'delay', project, critical_path_impact_flag, pcco_reference, affected_task |
| **Reportable** | Delay count by project, total potential cost impact, total delay days, critical-path delay count, owner notification timing |
| **Analytics** | Delay frequency, cost exposure trending, notification lag analysis |
| **Dashboard** | Active delays by project, critical-path delays, unnotified delays, cost exposure summary |

---

## Future Extensions

| Extension | Description | Target |
|-----------|-------------|--------|
| **Delay subtype** | Delay-specific fields on register_record with PCCO/schedule linkage | **Implemented in v0.2** |
| **Risk-specific fields** | probability, impact, exposure, mitigation_plan, risk_score | Phase 2–3 |
| **Constraint-specific fields** | blocking_condition, dependency_type, resolution_criteria | Phase 2–3 |
| **Action plan child records** | Linked mitigation/resolution steps with their own assignment and due dates | Phase 2–3 |
| **Comment history** | Timestamped comment entries as child entity | Phase 2 |
| **Attachment support** | Document library linkage for evidence files | Phase 2 |
| **Multi-assignee** | Multiple person assignments per record | Phase 2 |
| **Severity/priority** | Priority classification and escalation rules | Phase 2 |

---

## Open Decisions / Future Expansion

| Decision | Scope | Owner | Target |
|----------|-------|-------|--------|
| **Record-type subtyping** | First subtype (delay) implemented in v0.2; risk/constraint/issue/action subtypes remain Phase 2 targets | Platform Architecture + Operations | Phase 2 (delay: done) |
| **Category dictionary governance** | Formalize 36 categories as governed reference set in P1-A5 | Platform Architecture | Phase 1 (late) |
| **BIC dictionary governance** | Formalize 32 BIC teams as governed reference set in P1-A5 | Platform Architecture | Phase 1 (late) |
| **Identity reconciliation for assigned** | Map assigned display names to stable person keys from identity source | Platform Architecture | Phase 1–2 |
| **Closure evidence requirements** | Define which categories require closure documents for compliance | Risk / Compliance | Phase 2 |

---

## Decision Owners and Approval

| Role | Name | Approval Date |
|------|------|----------------|
| Platform Architecture Lead | — | — |
| Operations / Project Controls Lead | — | — |
| Risk / Compliance Lead | — | — |

**Approval Status:** Pending — Schema defined; pending operational validation
**Comments:** Schema derived from constraints.json (400 records, 20 projects, 36 categories). Classified as Hybrid Operational Register based on evidence analysis.

---

## Revision History

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 0.1 | 2026-03-17 | Architecture | Initial schema; 4 canonical entities, hybrid operational register classification, category/BIC normalization, lifecycle model, days-elapsed derivation, and storage alignment. Evidence-based from constraints.json. |
| 0.2 | 2026-03-17 | Architecture | Added delay subtype extension with 18 delay-specific fields on register_record (raw+normalized pairs for PCCO, affected task, critical path impact, cost impact, duration, dates, notification). Import batch snapshot fields for totals row. First implemented subtype establishing the pattern. Evidence-based from Project Delay Log CSV template. |
