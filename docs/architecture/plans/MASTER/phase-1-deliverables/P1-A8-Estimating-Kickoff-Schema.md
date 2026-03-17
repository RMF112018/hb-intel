# P1-A8: Estimating Kickoff Schema

**Document ID:** P1-A8
**Phase:** 1 (Foundation)
**Classification:** Internal — Engineering
**Status:** Draft
**Date:** 2026-03-17
**Read With:** [P1-A1-Data-Ownership-Matrix.md](./P1-A1-Data-Ownership-Matrix.md), [P1-A2-Source-of-Record-Register.md](./P1-A2-Source-of-Record-Register.md), [P1-A3-SharePoint-Lists-Libraries-Schema-Register.md](./P1-A3-SharePoint-Lists-Libraries-Schema-Register.md), [P1-A5-Reference-Data-Dictionary-Schema.md](./P1-A5-Reference-Data-Dictionary-Schema.md)

---

## Purpose

Define the canonical schema for the Estimating Kickoff — a template-based project coordination artifact that tracks managing tasks, key milestone dates, and final deliverable assembly for each estimating pursuit or bid package.

The kickoff is modeled as a **project instance header with typed child rows**, backed by a **semi-governed template library** that provides standard starting items while supporting project-specific custom additions.

---

## Relationship to P1-A1 / P1-A2 / P1-A3 / P1-A5

| Artifact | Relationship |
|----------|-------------|
| **P1-A1** | Estimating domain in P1-A1 includes pursuit and preconstruction entities; kickoff instances link to pursuit records via `project_id`. |
| **P1-A2** | Kickoff data follows P1-A2 adapter patterns for SharePoint persistence. |
| **P1-A3** | P1-A3 defines the SharePoint lists that store kickoff instances and child rows. |
| **P1-A5** | Status values, responsible-party roles, and deliverable-section types are governed reference dictionaries. |

---

## Scope and Non-Scope

### In Scope
- Kickoff project instance header with snapshot fields
- Typed child rows: managing tasks, key-date milestones, standard deliverables, non-standard deliverables
- Template/library definition and versioning model
- Template-to-instance inheritance and snapshotting
- Custom project-specific row additions
- Hybrid YES/NO applicability handling
- Assignment normalization (person, team, role, placeholder)
- Date rule logic vs resolved project dates
- Deliverable package assembly metadata (tab-required, section grouping, display order)
- Evidence/output link model
- Notes/history model
- Storage-boundary alignment

### Out of Scope
- Full estimating workflow/UX implementation
- Bid-tab or cost-estimation calculation
- SharePoint physical container definitions (P1-A3)
- Reference dictionary schemas for status/role/section values (P1-A5)

---

## Source Workbook Analysis

**File:** `docs/reference/example/Estimating Kickoff.xlsx`

| Property | Value |
|----------|-------|
| Sheets | 1 (`Sheet1`) |
| Rows | 80 (including headers and blank rows) |
| Columns | 7 (A: Tab Req'd?, B: Item/Label, C: YES, D: NO, E: Responsible, F: Deadline/Frequency, G: Notes) |
| Sections | 4 distinct sections with different column semantics |

### Section Analysis

| Section | Rows | Row Type | Columns Used | Row Count |
|---------|------|----------|-------------|-----------|
| **Project Information** | R1–R13 | Header fields (label → value pairs) | B (label), E (value) | 13 header fields |
| **Managing Information** | R14–R37 | Task/action items | B (item), C/D (YES/NO), E (responsible), F (deadline), G (notes) | 23 task rows |
| **Estimating Preparation — Key Dates** | R38–R44 | Milestone items | B (milestone), E (responsible), F (deadline), G (notes) | 6 milestone rows |
| **Final Deliverables — Standard** | R45–R60 | Deliverable items | A (tab req'd?), B (item), C/D (YES/NO), E (responsible), F (deadline), G (notes) | 15 deliverable rows |
| **Final Deliverables — Non-Standard** | R61–R70 | Deliverable items (including "other" placeholders) | A (tab req'd?), B (item), C/D (YES/NO), E (responsible), F (deadline), G (notes) | 9 deliverable rows |

### Project Header Fields (R1–R13)

| Row | Field | Example Value |
|-----|-------|---------------|
| R1 | Title | RESPONSIBILITY MATRIX FOR NON-NEGOTIATED PROJECTS |
| R3 | Job Name | Ocean Towers Workforce Housing |
| R4 | Job Number | 25-246-01 |
| R5 | Architect | Spina O'Rourke |
| R6 | Proposal Due Date | 2025-08-15 |
| R7 | Delivery Method | email |
| R8 | Copies if Hand Delivered | N/A |
| R9 | Type of Proposal | Lump Sum Proposal |
| R10 | RFI Format | email |
| R11 | Project Executive | Paul Fulks |
| R12 | Primary Contact for Owner | Sam Fahmy |
| R13 | Estimator(s) Assigned | Sam Fahmy |

### YES/NO Behavior

YES/NO is indicated by an `x` marker in either column C (YES) or column D (NO):
- `x` in C = applicable/required/included
- `x` in D = not applicable/not required/not included
- Both blank = not yet determined or section header row
- No rows have `x` in both columns

**Hybrid handling:** Store a canonical `applicable` boolean (true if YES, false if NO, null if undetermined) AND preserve the raw marker position (`raw_yes_col`, `raw_no_col`) for provenance.

### Responsible Field Behavior

| Pattern | Example | Normalization |
|---------|---------|---------------|
| Person name | "Sam", "Mike C", "Wanda", "Butch" | Resolve to person key when possible; preserve display text |
| Team name | "Estimating Team" | Resolve to team key; preserve display text |
| "N/A" | "N/A" | Null normalized key; preserve "N/A" as display text |
| Blank | (empty) | Null both key and display |

### Deadline/Date Behavior

| Pattern | Example | Treatment |
|---------|---------|-----------|
| Date value | 2025-07-21 (datetime) | Resolved project-instance date |
| Text date | "Friday, August 15, 2025" | Parse to resolved date; preserve raw text |
| Narrative | "Update Ryan H. Weekly" | Not a date; treat as notes overflow |
| Blank | (empty) | No deadline set |

### Tab Required Behavior (col A)

Only populated in Final Deliverables sections. Not a YES/NO pair — it's a separate package-assembly flag indicating whether this deliverable requires its own tab/section in the assembled proposal package.

---

## Canonical Entity Model

### Entity Summary

| # | Entity | Purpose |
|---|--------|---------|
| 1 | `kickoff_template` | Standard template definition with version tracking |
| 2 | `kickoff_template_item` | Standard library item within a template version |
| 3 | `kickoff_instance` | Project-level kickoff instance with header snapshot fields |
| 4 | `kickoff_row` | Child row on a project instance (task, milestone, or deliverable) |
| 5 | `kickoff_evidence_link` | Evidence/output document links for a row |
| 6 | `kickoff_note` | Note/history entries for a row |
| 7 | `kickoff_import_batch` | Tracks workbook imports for provenance |

### kickoff_template

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| template_id | string | Yes | HB Intel template identifier |
| template_name | string | Yes | Template display name (e.g., "Non-Negotiated Projects Kickoff") |
| description | string | No | Template purpose description |
| is_active | boolean | Yes | Whether this template version is the current default |
| created_at | datetime | Yes | Template creation timestamp |
| created_by | string | Yes | Creator identity (UPN) |

### kickoff_template_item

Standard library items that are inherited by new project instances.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| template_item_id | string | Yes | PK — stable identifier for this library item across versions |
| template_id | string | Yes | FK to kickoff_template |
| section | string | Yes | Section classification: `managing_info`, `key_dates`, `deliverable_standard`, `deliverable_nonstandard` |
| section_label | string | No | Display label (e.g., "MANAGING INFORMATION") |
| group_label | string | No | Sub-group label if applicable |
| item_name | string | Yes | Standard item name (e.g., "Finalize Subcontractor Bid List in BC") |
| row_type | string | Yes | `task`, `milestone`, `deliverable` |
| display_order | number | Yes | Sort position within section |
| default_applicable | boolean | No | Default YES/NO for new instances |
| default_responsible_type | string | No | Default responsible type: `person`, `team`, `role`, `na` |
| default_responsible_display | string | No | Default responsible text |
| default_tab_required | boolean | No | Default tab-required flag (deliverables only) |
| date_rule_type | string | No | How deadline is determined: `fixed`, `relative_to_proposal_due`, `relative_to_row`, `manual` |
| date_rule_expression | string | No | Rule expression (e.g., "-3 business days from proposal_due_date") |
| is_active | boolean | Yes | Whether this item is still in the active library |

### kickoff_instance

Project-level kickoff instance with snapshot header fields.

| Field | Type | Required | Key | Description |
|-------|------|----------|-----|-------------|
| instance_id | string | Yes | PK | HB Intel kickoff instance identifier |
| project_id | string | Yes | FK | FK to project domain |
| pursuit_id | string | No | FK | FK to estimating_pursuit if applicable |
| template_id | string | No | FK | FK to kickoff_template used to seed this instance |
| template_snapshot_date | datetime | No | — | When the template was snapshotted into this instance |
| job_name_snapshot | string | No | — | Job name at kickoff creation |
| job_number_snapshot | string | No | — | Job number at kickoff creation |
| architect_snapshot | string | No | — | Architect at kickoff creation |
| proposal_due_date | date | No | — | Proposal due date |
| delivery_method | string | No | — | Proposal delivery method (email, hand delivery, etc.) |
| copies_required | string | No | — | Number of copies if hand delivered |
| proposal_type | string | No | — | Type of proposal (e.g., Lump Sum Proposal) |
| rfi_format | string | No | — | RFI management format (Excel, Procore, email) |
| project_executive_display | string | No | — | PE display name snapshot |
| project_executive_key | string | No | — | Canonical person key (UPN when Entra-resolved; nullable if unresolved; `project_executive_display` is always populated per A2 identity class G) |
| primary_contact_display | string | No | — | Owner primary contact snapshot |
| estimator_assigned_display | string | No | — | Estimator(s) display name snapshot |
| estimator_assigned_key | string | No | — | Canonical person key (UPN when Entra-resolved; nullable if unresolved; `estimator_assigned_display` is always populated per A2 identity class G) |
| status | string | Yes | — | Instance status: draft, active, submitted, closed |
| batch_id | string | No | FK | FK to kickoff_import_batch (null for app-created instances) |
| created_at | datetime | Yes | — | Instance creation timestamp |
| created_by | string | Yes | — | Creator identity (UPN) |
| updated_at | datetime | Yes | — | Last modification timestamp |
| notes | text | No | — | Instance-level notes |

### kickoff_row

Child row on a project instance. Shared base with subtype-specific behavior.

| Field | Type | Required | Key | Description |
|-------|------|----------|-----|-------------|
| row_id | string | Yes | PK | HB Intel row instance identifier |
| instance_id | string | Yes | FK | FK to kickoff_instance |
| template_item_id | string | No | FK | FK to kickoff_template_item (null for custom project rows) |
| is_custom | boolean | Yes | — | True if this is a project-specific custom row (not from template library) |
| section | string | Yes | — | Section: `managing_info`, `key_dates`, `deliverable_standard`, `deliverable_nonstandard` |
| section_label | string | No | — | Display section label |
| group_label | string | No | — | Display sub-group label |
| display_order | number | Yes | — | Sort position within section |
| row_type | string | Yes | — | `task`, `milestone`, `deliverable` |
| item_name | string | Yes | — | Item description/name |
| applicable | boolean | No | — | Canonical: true (YES), false (NO), null (undetermined) |
| raw_yes_marker | boolean | No | — | Source had "x" in YES column |
| raw_no_marker | boolean | No | — | Source had "x" in NO column |
| responsible_display | string | No | — | Raw responsible text from source |
| responsible_entity_key | string | No | — | Canonical person key (UPN when Entra-resolved; nullable if unresolved; `responsible_display` is always populated per A2 identity class G) |
| responsible_entity_type | string | No | — | `person`, `team`, `role`, `na`, `placeholder` |
| target_date | date | No | — | Resolved deadline/due date for this project instance |
| target_date_raw | string | No | — | Raw deadline text from source (preserved if text/narrative) |
| date_rule_type | string | No | — | Inherited template rule type |
| date_rule_expression | string | No | — | Inherited template rule expression |
| status_code | string | Yes | — | Row status: `not_started`, `in_progress`, `complete`, `not_applicable`, `deferred` |
| tab_required | boolean | No | — | Whether this deliverable requires its own tab in the proposal package (deliverables only) |
| package_display_order | number | No | — | Position in assembled package (deliverables only) |
| current_evidence_ref | string | No | — | Primary completion/evidence reference (document ID, URL, or description) |
| notes_summary | string | No | — | Current summary note |
| source_row_number | number | No | — | Original row in source workbook (for imported instances) |

### kickoff_evidence_link

Multiple evidence/output links per row when needed.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| link_id | string | Yes | Link record identifier |
| row_id | string | Yes | FK to kickoff_row |
| link_type | string | Yes | `document`, `file_url`, `package_artifact`, `external_reference` |
| link_target | string | Yes | Document ID, URL, or reference |
| link_label | string | No | Display label |
| created_at | datetime | Yes | When the link was added |

### kickoff_note

Note/history entries per row.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| note_id | string | Yes | Note record identifier |
| row_id | string | Yes | FK to kickoff_row |
| note_text | string | Yes | Note content |
| created_by | string | Yes | Author identity (UPN) |
| created_at | datetime | Yes | Note timestamp |

### kickoff_import_batch

Tracks workbook imports for provenance.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| batch_id | string | Yes | System-generated surrogate (opaque string); source filename is metadata only |
| project_id | string | No | FK to project domain |
| source_file_name | string | Yes | Original file name |
| source_file_url | string | No | SharePoint document library URL |
| import_status | string | Yes | pending, parsing, complete, failed |
| total_rows_imported | number | No | Count of rows processed |
| uploaded_by | string | Yes | Uploader identity (UPN) |
| uploaded_at | datetime | Yes | Upload timestamp |
| parser_version | string | No | Parser version |
| notes | text | No | Import notes |

---

### Keying and Uniqueness Rules

| Rule | Decision |
|------|----------|
| **Instance key** | `instance_id` (surrogate) — one per project kickoff |
| **Row key** | `row_id` (surrogate) — one per child row per instance |
| **Template item lineage** | Inherited rows carry `template_item_id` linking to the library item; custom rows have `template_item_id = null`, `is_custom = true` |
| **Instance-to-project** | `(project_id, pursuit_id)` identifies the business context; multiple kickoff instances per project are allowed (e.g., revised pursuits) |
| **Workbook row identity** | Workbook row position (`source_row_number`) is preserved for import traceability but is not a durable key |

---

### Template / Library Strategy

| Aspect | Rule |
|--------|------|
| **Standard library** | `kickoff_template_item` records define the governed default item set |
| **Template versioning** | `kickoff_template` represents the current active template; new instances snapshot the template at creation via `template_id` + `template_snapshot_date` |
| **Instance inheritance** | When a new instance is created, all active template items are copied as `kickoff_row` records with `template_item_id` set and `is_custom = false` |
| **Custom additions** | Project teams can add rows with `is_custom = true`, `template_item_id = null`; custom rows specify their own `section`, `row_type`, and `display_order` |
| **Template evolution** | Estimating leadership can update the library; existing project instances are NOT automatically updated — selective approved changes may be applied manually |
| **Template categories** | Initial template: "Non-Negotiated Projects Kickoff". Future templates may include negotiated, design-build, or other pursuit types |

---

### Row Subtype Rules

| Row Type | Section(s) | Subtype-Specific Fields | Notes |
|----------|-----------|------------------------|-------|
| `task` | managing_info | applicable (YES/NO), status_code, responsible, target_date | Standard task/action items |
| `milestone` | key_dates | responsible, target_date, date_rule | Key dates with potential formula-derived deadlines |
| `deliverable` | deliverable_standard, deliverable_nonstandard | applicable, tab_required, package_display_order, current_evidence_ref | Package assembly items; tab-required only on deliverables |

**Shared base fields** (all row types): row_id, instance_id, template_item_id, is_custom, section, display_order, item_name, responsible_display, responsible_entity_key, status_code, notes_summary, source_row_number

---

### Date Rule / Resolved Date Rules

| Aspect | Rule |
|--------|------|
| **Resolved date** | `target_date` stores the actual project-instance date as a resolved date value |
| **Template rule** | `date_rule_type` + `date_rule_expression` preserve the formula logic for milestone rows (e.g., "Sub Proposals Due = Proposal Due − 3 business days") |
| **Rule types** | `fixed` (specific date), `relative_to_proposal_due` (offset from proposal due date), `relative_to_row` (offset from another row's date), `manual` (no rule, user-entered) |
| **Narrative deadlines** | Text like "Update Ryan H. Weekly" is stored in `target_date_raw` and `notes_summary`, NOT as a date |

---

### Deliverable / Package Assembly Rules

| Aspect | Rule |
|--------|------|
| **Standard sections** | Front Cover, Executive Summary, Cost Summary, Allowances, Clarifications, Value Analysis, Schedule, Logistics, List of Documents, BIM Proposal, Back Cover, etc. |
| **Non-standard sections** | Financials, GC License, BIM, Contract, Bid Bond, Business Terms, plus "other" placeholders |
| **Tab required** | `tab_required` boolean indicates whether the deliverable gets its own tab in the assembled proposal package |
| **Package ordering** | `package_display_order` determines the tab/section position in the assembled package |
| **Optional items** | Items marked NO (not applicable) may still exist as rows with `applicable = false` for template completeness |

---

### Search / Analytics / Reporting Role

| Role | Treatment |
|------|-----------|
| **Search indexed?** | Yes — item names, responsible, project name, job number |
| **Search role** | `item_name`: Keyword Content; `responsible_display`: Facet / Filter; `section`: Facet / Filter; `status_code`: Facet / Filter; `row_type`: Facet / Filter |
| **Analytics included?** | Yes — coordination tracking and workload reporting |
| **Analytics role** | Operational Reporting (overdue tasks, deliverable readiness, estimator workload); Portfolio analytics (pursuit throughput, template utilization) |
| **Dashboard use** | Kickoff completion status, overdue milestones, deliverable assembly progress |

---

### Storage Boundary Alignment

| Data | Storage | Authority | P1-A1/A2 Alignment |
|------|---------|-----------|---------------------|
| Template definitions | SharePoint List (hub site, shared) | Authoritative template library | Shared reference data per P1-A1 |
| Template items | SharePoint List (hub site, shared) | Authoritative library items | Same |
| Kickoff instances | SharePoint List (project site) | Authoritative project operational data | Aligns with P1-A1: estimating domain in SharePoint |
| Kickoff rows | SharePoint List (project site) | Authoritative child records | Same |
| Evidence links | SharePoint List (project site) | Authoritative links | Same |
| Notes/history | SharePoint List (project site) or Azure Table Storage | Operational | Depends on volume; Table Storage for high-volume history |
| Import batches | Azure Table Storage | Operational state | Aligns with P1-A1/A2 |

---

## Open Decisions / Future Expansion

| Decision | Scope | Owner | Target |
|----------|-------|-------|--------|
| **Template variant support** | Define templates for negotiated, design-build, and other pursuit types | Estimating Leadership | Phase 2 |
| **Date rule automation** | Implement milestone date auto-calculation from proposal due date | Platform Architecture | Phase 2 |
| **Package assembly engine** | Build deliverable package tab assembly from kickoff metadata | Platform Architecture + Estimating | Phase 2–3 |
| **Comment history volume** | Determine if note history warrants Azure Table Storage vs SharePoint list | Platform Architecture | Phase 1 (late) |
| **Status dictionary governance** | Formalize kickoff status values in P1-A5 | Platform Architecture | Phase 1 (late) |
| **Multi-estimator assignment** | Support multiple estimators per row | Platform Architecture | Phase 2 |

---

## Decision Owners and Approval

| Role | Name | Approval Date |
|------|------|----------------|
| Platform Architecture Lead | — | — |
| Estimating Operations Lead | — | — |
| Preconstruction Lead | — | — |

**Approval Status:** Pending — Schema defined; pending operational validation
**Comments:** Schema derived from Estimating Kickoff.xlsx (80 rows, 4 sections, 7 entities). Locked interview decisions encoded.

---

## Revision History

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 0.1 | 2026-03-17 | Architecture | Initial schema; 7 canonical entities (template, template item, instance, row, evidence link, note, import batch), 3 row subtypes (task/milestone/deliverable), hybrid YES/NO and date handling, template/instance snapshot model, and package assembly metadata. Evidence-based from Estimating Kickoff.xlsx. All 16 locked interview decisions encoded. |
