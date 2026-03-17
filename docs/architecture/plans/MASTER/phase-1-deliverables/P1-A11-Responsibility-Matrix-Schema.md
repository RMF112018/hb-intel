# P1-A11: Responsibility Matrix Schema

**Document ID:** P1-A11
**Phase:** 1 (Foundation)
**Classification:** Internal — Engineering
**Status:** Draft
**Date:** 2026-03-17
**Read With:** [P1-A1-Data-Ownership-Matrix.md](./P1-A1-Data-Ownership-Matrix.md), [P1-A2-Source-of-Record-Register.md](./P1-A2-Source-of-Record-Register.md), [P1-A3-SharePoint-Lists-Libraries-Schema-Register.md](./P1-A3-SharePoint-Lists-Libraries-Schema-Register.md)

---

## Purpose

Define the canonical schema for **project responsibility matrices** — governed, template-driven assignment models that map tasks/obligations to roles, parties, or persons using structured assignment values.

The canonical data model uses **normalized assignment junction records** even though the source forms are matrix-shaped spreadsheets, while preserving enough display metadata to reconstruct the workbook matrix view.

---

## Source Authority Decision

| Source File | Authority | Disposition |
|------------|-----------|-------------|
| `Responsibility Matrix - Template.xlsx` | **Authoritative** | Primary source for PM/Field responsibility matrix families |
| `Responsibility Matrix - Owner Contract Template.xlsx` | **Authoritative** | Primary source for Owner Contract responsibility family |
| `responsibility-matrix.json` | **Not authoritative** | Contains Estimating Kickoff data (projectInfo, managingInformation, finalDeliverables), not responsibility matrix data; already governed by P1-A8; ignored for this schema |

---

## Relationship to P1-A1 / P1-A2 / P1-A3

| Artifact | Relationship |
|----------|-------------|
| **P1-A1** | Project domain governance includes staffing and role assignments. Responsibility matrices operationalize those assignments at the task level. |
| **P1-A2** | Responsibility data follows P1-A2 adapter patterns for SharePoint persistence. |
| **P1-A3** | P1-A3 defines the SharePoint lists that store responsibility templates and project instances. |

---

## Scope and Non-Scope

### In Scope
- PM responsibility matrix family (project management role assignments)
- Field responsibility matrix family (field/superintendent role assignments)
- Owner Contract responsibility family (contractual party obligations)
- Governed template/version model with project tailoring
- Normalized assignment/intersection records
- Role/party catalog with template-specific display preservation
- Assignment value dictionary (X, Support, Review, Sign-Off)
- Matrix-reconstruction display metadata

### Out of Scope
- RACI methodology enforcement (the source uses X/Support/Review/Sign-Off, not R/A/C/I)
- Full staffing/HR role management
- SharePoint physical container definitions (P1-A3)
- Estimating Kickoff (governed by P1-A8; JSON is misattached)

---

## Source Analysis

### PM/Field Template (2 sheets, `Responsibility Matrix - Template.xlsx`)

**PM Sheet** (86 rows, 9 columns):

| Column | Role | Description |
|--------|------|-------------|
| A | — | Task Category (groups rows by primary owner role) |
| B | — | Task/Role description |
| C | PX | Project Executive |
| D | Sr. PM | Senior Project Manager |
| E | PM2 | Project Manager 2 |
| F | PM1 | Project Manager 1 |
| G | PA | Project Administrator |
| H | QAQC | Quality Assurance / Quality Control |
| I | Proj Acct. | Project Accountant |

- ~74 task items in rows 4–75 with assignment values
- 12 task categories: PX, SPM, PM 2, PM 1, PM1, PA, QAQC, Proj Acct, PM's, PM's/Supers, PM/Super, All
- Rows 76–86: recurring deadline reminders (monthly cadence items, different row type — no matrix assignments)

**Field Sheet** (78 rows, 8 columns):

| Column | Role | Description |
|--------|------|-------------|
| B | — | Task Category |
| C | — | Task/Role description |
| D | Lead Super | Lead Superintendent |
| E | MEP Super | MEP Superintendent |
| F | Interior Super | Interior Superintendent |
| G | Asst Super | Assistant Superintendent |
| H | QaQc | Quality Assurance / Quality Control |

- Task categories: Lead Super, MEP Super, Interior Super, Asst Super, QaQc

### Assignment Values (PM/Field)

| Value | Meaning | Usage |
|-------|---------|-------|
| `X` | Primary responsible party | One per row (usually); the person/role who owns the task |
| `Support` | Supporting role | Additional roles that assist the primary |
| `Review` | Review authority | Roles that review but don't execute |
| `Sign-Off` | Sign-off/approval authority | Roles that must approve/sign-off |
| _(blank)_ | No assignment | Role has no involvement in this task |

### Owner Contract Template (1 sheet, `Responsibility Matrix - Owner Contract Template.xlsx`)

| Column | Content |
|--------|---------|
| A | Article number |
| B | Page reference |
| C | Responsible Party |
| D | Description |

- 45 rows; empty template (placeholder 0 values in Article/Page)
- Header: "Owner Contract / GMP - Responsibility Matrix"
- Contract-article-based structure: each row maps a contract article to its responsible party
- Simpler than PM/Field — single responsible party per article, not a multi-role matrix

### Family Comparison

| Feature | PM/Field | Owner Contract |
|---------|----------|----------------|
| **Structure** | Wide matrix (task rows × role columns) | Narrow list (article → party) |
| **Assignment values** | X, Support, Review, Sign-Off | Single responsible party text |
| **Multiple roles per item** | Yes (one X + multiple Support/Review/Sign-Off) | No (one party per article) |
| **Sections/categories** | Task categories (PX, SPM, PM2, etc.) | Contract articles |
| **Template sheets** | 2 (PM + Field) | 1 (Template) |

---

## Canonical Entity Model

### Entity Summary

| # | Entity | Purpose |
|---|--------|---------|
| 1 | `responsibility_matrix_family` | Family classification (PM, Field, Owner Contract) |
| 2 | `responsibility_template` | Governed template definition |
| 3 | `responsibility_template_version` | Template version tracking |
| 4 | `responsibility_item` | Standard task/article in the governed library |
| 5 | `responsibility_role_party` | Governed role/party catalog entry |
| 6 | `assignment_value_type` | Assignment value dictionary |
| 7 | `project_responsibility_instance` | Project-level matrix instance |
| 8 | `project_item_instance` | Project-level item (inherited or custom) |
| 9 | `responsibility_assignment` | Normalized intersection record (item × role × value) |
| 10 | `responsibility_import_batch` | Import provenance |

### responsibility_matrix_family

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| family_id | string | Yes | Family identifier |
| family_code | string | Yes | `pm`, `field`, `owner_contract` |
| family_label | string | Yes | Display label (e.g., "PM Responsibility Matrix") |
| assignment_model | string | Yes | `multi_role_matrix` (PM/Field) or `single_party_list` (Owner Contract) |
| is_active | boolean | Yes | Whether this family is currently active |

### responsibility_template

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| template_id | string | Yes | Template identifier |
| family_id | string | Yes | FK to responsibility_matrix_family |
| template_name | string | Yes | Template display name |
| source_sheet_name | string | No | Source worksheet name (e.g., "PM", "Field", "Template") |
| is_active | boolean | Yes | Whether this is the current active template |
| created_at | datetime | Yes | Creation timestamp |
| created_by | string | Yes | Creator identity (UPN) |

### responsibility_template_version

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| version_id | string | Yes | Version identifier |
| template_id | string | Yes | FK to responsibility_template |
| version_number | number | Yes | Sequential version number |
| effective_date | date | No | When this version became effective |
| is_current | boolean | Yes | Whether this is the current version |
| notes | text | No | Version notes |

### responsibility_item

Governed library of standard tasks/articles.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| item_id | string | Yes | Item identifier |
| template_id | string | Yes | FK to responsibility_template |
| section_key | string | No | Category/section grouping key |
| section_label | string | No | Category display label (e.g., "PX", "Lead Super", "Article 5") |
| item_label | string | Yes | Task/article description text |
| item_type | string | No | `task`, `deadline_reminder`, `contract_article` |
| display_order | number | Yes | Sort position within template |
| is_active | boolean | Yes | Whether this item is in the current active library |
| article_number | string | No | Contract article number (Owner Contract only) |
| page_reference | string | No | Contract page reference (Owner Contract only) |

### responsibility_role_party

Governed catalog of roles/parties available as assignment targets.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| role_party_id | string | Yes | Catalog entry identifier |
| family_id | string | Yes | FK to responsibility_matrix_family |
| canonical_label | string | Yes | Canonical role/party name (e.g., "Project Executive", "Lead Superintendent") |
| template_display_label | string | No | Template-specific display abbreviation (e.g., "PX", "Lead Super") |
| role_party_type | string | Yes | `project_role` (PM/Field) or `contractual_party` (Owner Contract) |
| column_position | number | No | Matrix column position for display reconstruction (PM/Field) |
| is_active | boolean | Yes | Whether this role/party is in the current catalog |

### assignment_value_type

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| value_id | string | Yes | Value identifier |
| value_code | string | Yes | Canonical code: `primary`, `support`, `review`, `sign_off`, `responsible_party` |
| raw_display_value | string | Yes | Source display value: "X", "Support", "Review", "Sign-Off", or party name |
| value_description | string | No | Plain-language meaning |
| applies_to_family | string | No | Which family this value is used in (null = all) |

**Initial values:**

| Code | Raw Display | Family | Meaning |
|------|-------------|--------|---------|
| `primary` | X | PM, Field | Primary responsible role for this task |
| `support` | Support | PM, Field | Supporting role |
| `review` | Review | PM, Field | Review authority |
| `sign_off` | Sign-Off | PM, Field | Sign-off/approval authority |
| `responsible_party` | _(party name)_ | Owner Contract | Contractual party responsible for article |

### project_responsibility_instance

| Field | Type | Required | Key | Description |
|-------|------|----------|-----|-------------|
| instance_id | string | Yes | PK | Project matrix instance identifier |
| project_id | string | Yes | FK | FK to project domain |
| template_id | string | No | FK | FK to responsibility_template |
| version_id | string | No | FK | FK to template version snapshotted |
| family_id | string | Yes | FK | FK to responsibility_matrix_family |
| instance_label | string | No | — | Project-specific instance label |
| snapshot_date | datetime | No | — | When template was snapshotted |
| batch_id | string | No | FK | FK to import batch (null for app-created) |
| created_at | datetime | Yes | — | Instance creation timestamp |
| created_by | string | Yes | — | Creator identity (UPN) |
| notes | text | No | — | Instance-level notes |

### project_item_instance

| Field | Type | Required | Key | Description |
|-------|------|----------|-----|-------------|
| item_instance_id | string | Yes | PK | Project item instance identifier |
| instance_id | string | Yes | FK | FK to project_responsibility_instance |
| template_item_id | string | No | FK | FK to responsibility_item (null for custom) |
| is_custom | boolean | Yes | — | True if project-specific addition |
| is_suppressed | boolean | Yes | — | True if inherited item is hidden/removed for this project |
| section_key | string | No | — | Section/category (may override template) |
| section_label | string | No | — | Section display label (may override) |
| item_label | string | Yes | — | Task/article description |
| item_type | string | No | — | task, deadline_reminder, contract_article |
| display_order | number | Yes | — | Sort position (may override template) |
| article_number | string | No | — | Contract article (Owner Contract) |
| page_reference | string | No | — | Page reference (Owner Contract) |
| responsible_party_display | string | No | — | Non-authoritative display text; raw source preserved; not a join key (Owner Contract) |
| responsible_party_key | string | No | — | Canonical party key when resolved; nullable if unresolved; `responsible_party_display` always populated; display text is not the join key (per A2 identity class H; Vendor Identity Resolution Platform Standard in P1-A2) |
| source_row_number | number | No | — | Source workbook row |

### responsibility_assignment

Normalized intersection record — one per (item × role × assignment value). This is the canonical model that replaces the wide matrix columns.

| Field | Type | Required | Key | Description |
|-------|------|----------|-----|-------------|
| assignment_id | string | Yes | PK | Assignment record identifier |
| item_instance_id | string | Yes | FK | FK to project_item_instance |
| role_party_id | string | Yes | FK | FK to responsibility_role_party |
| value_code | string | Yes | — | Assignment value: primary, support, review, sign_off |
| raw_cell_value | string | No | — | Raw workbook cell text (preserved) |
| source_column_letter | string | No | — | Source worksheet column (for provenance) |

### responsibility_import_batch

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| batch_id | string | Yes | System-generated surrogate (opaque string); import batch identifier |
| project_id | string | No | FK to project domain |
| source_system | string | Yes | Source system (e.g., "Excel Template") |
| source_file_name | string | Yes | Original file name |
| family_code | string | Yes | Which family was imported |
| import_status | string | Yes | pending, parsing, complete, failed |
| total_items | number | No | Items processed |
| total_assignments | number | No | Assignment intersections processed |
| uploaded_by | string | Yes | Uploader identity (UPN) |
| uploaded_at | datetime | Yes | Upload timestamp |
| parser_version | string | No | Parser version |

**Storage:** Azure Table Storage (Class D, operational). Per the Import-State Platform Standard in P1-A2.

### responsibility_import_finding

Import validation findings for responsibility matrix workbook ingestion. Stored in Azure Table Storage per the Import-State Platform Standard in P1-A2 (universal rule: all findings in Azure Table Storage, Class D, append-only).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| finding_id | string | Yes | Finding identifier (surrogate) |
| batch_id | string | Yes | FK to responsibility_import_batch |
| severity | string | Yes | error, warning, info |
| category | string | Yes | parse_error, validation_failure, mapping_warning, assignment_conflict |
| message | string | Yes | Human-readable description |

**Storage:** Azure Table Storage (partition key: `responsibility-findings-{batchId}`). Class D, append-only, immutable once logged.

---

## Assignment Value Strategy

| Aspect | Rule |
|--------|------|
| **Governed dictionary** | `X`, `Support`, `Review`, `Sign-Off` are governed values in `assignment_value_type` |
| **Raw preservation** | `raw_cell_value` on `responsibility_assignment` preserves exact workbook text |
| **Empty intersections** | Not stored as assignment records — absence = no assignment |
| **Owner Contract** | Single responsible party stored as `responsible_party_display` on `project_item_instance`; no multi-role intersection records |
| **Future values** | Additional assignment codes (e.g., "Inform", "Consult") can be added to dictionary without schema change |

---

## Role/Party Catalog Strategy

| Aspect | Rule |
|--------|------|
| **Governed catalog** | `responsibility_role_party` maintains canonical role names with template display abbreviations |
| **PM roles** | PX, Sr. PM, PM2, PM1, PA, QAQC, Proj Acct — mapped to canonical labels |
| **Field roles** | Lead Super, MEP Super, Interior Super, Asst Super, QaQc — mapped to canonical labels |
| **Owner Contract parties** | Contractual party text stored as `responsible_party_display`; canonical mapping optional |
| **Template-specific display** | `template_display_label` preserves abbreviations; `canonical_label` standardizes naming |
| **Column position** | `column_position` on role/party preserves matrix axis ordering for UI reconstruction |

---

## Template / Version Strategy

| Aspect | Rule |
|--------|------|
| **One template per family per sheet** | PM sheet = PM template, Field sheet = Field template, Owner Contract sheet = Owner Contract template |
| **Version tracking** | `responsibility_template_version` tracks sequential versions |
| **Snapshot on instance creation** | Project instances record the version used at creation |
| **Governed updates** | Template changes require approval; existing instances not auto-updated |
| **Custom items** | Projects may add items with `is_custom = true` |
| **Suppressed items** | Projects may hide inherited items with `is_suppressed = true` without mutating master template |

---

## Project Tailoring Strategy

| Behavior | Implementation |
|----------|---------------|
| **Inherited items** | Copied from template at instance creation; `template_item_id` set, `is_custom = false`, `is_suppressed = false` |
| **Custom items** | Added with `is_custom = true`, `template_item_id = null` |
| **Suppressed items** | Set `is_suppressed = true` on inherited item; item preserved but hidden from active views |
| **Display overrides** | `display_order` and `section_label` on item instance can override template values |
| **Assignment overrides** | Assignment records are per-instance; project may change role assignments without affecting master |

---

## Matrix Reconstruction Strategy

The normalized model can reconstruct the workbook matrix view using:

1. **Role columns** from `responsibility_role_party` (ordered by `column_position`)
2. **Task rows** from `project_item_instance` (ordered by `display_order`, grouped by `section_key`)
3. **Cell values** from `responsibility_assignment` (join item_instance × role_party → value_code)
4. **Section headers** from `section_label` values
5. **Empty cells** = absence of assignment record for that intersection

---

## Search / Filter / Reporting Role

| Dimension | Treatment |
|-----------|-----------|
| **Filterable by** | project, family, section/category, role/party, assignment value, custom vs inherited, suppressed |
| **Reportable** | Unassigned responsibilities, role workload distribution, primary vs support allocation |
| **Dashboard** | Responsibility coverage per project, missing assignments, role assignment heatmap |
| **Contract view** | Owner Contract responsibilities by article for contract management |
| **Analytics** | Role utilization across projects, assignment pattern analysis |

---

## Storage Boundary Alignment

| Data | Storage | Authority | P1-A1/A2 Alignment |
|------|---------|-----------|---------------------|
| Family definitions | SharePoint List (hub site, shared) | Authoritative reference | Shared reference per P1-A1 |
| Templates + versions | SharePoint List (hub site, shared) | Authoritative template library | Same |
| Template items | SharePoint List (hub site, shared) | Authoritative library items | Same |
| Role/party catalog | SharePoint List (hub site, shared) | Authoritative reference | Same |
| Assignment value dictionary | SharePoint List (hub site, shared) | Authoritative reference | Same |
| Project instances | SharePoint List (project site) | Authoritative project data | Aligns with P1-A1 |
| Project item instances | SharePoint List (project site) | Authoritative child records | Same |
| Assignment records | SharePoint List (project site) | Authoritative intersection data | Same |
| Import batches | Azure Table Storage | Operational state | Default per Import-State Platform Standard in P1-A2 |

---

## Open Decisions / Future Expansion

| Decision | Scope | Owner | Target |
|----------|-------|-------|--------|
| **Role catalog governance** | Formalize PM/Field/Owner Contract role catalogs in P1-A5 | Platform Architecture | Phase 1 (late) |
| **Assignment value expansion** | Determine if additional values (Inform, Consult) are needed | Operations | Phase 2 |
| **Deadline reminder items** | Determine how PM rows 76-86 (recurring cadence reminders) are modeled — as responsibility items or a separate cadence entity | Platform Architecture | Phase 1 (late) |
| **Person-to-role mapping** | Map project staff names to roles for populated instances | Platform Architecture | Phase 2 |
| **Matrix comparison** | Cross-project matrix comparison/standardization reporting | Operations | Phase 3 |

---

## Decision Owners and Approval

| Role | Name | Approval Date |
|------|------|----------------|
| Platform Architecture Lead | — | — |
| Operations Lead | — | — |
| Project Controls Lead | — | — |

**Approval Status:** Pending — Schema defined; pending operational validation
**Comments:** Schema derived from 2 Excel templates (PM/Field: ~74+78 items, 12 roles, 4 assignment values; Owner Contract: 45 articles). JSON file confirmed as misattached Estimating Kickoff data. All 4 locked interview decisions encoded.

---

## Revision History

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 0.1 | 2026-03-17 | Architecture | Initial schema; 10 canonical entities, 3 matrix families (PM/Field/Owner Contract), normalized assignment junction model, governed role/party catalog, assignment value dictionary, template/version/instance governance with project tailoring (custom + suppressed items). Evidence-based from 2 Excel templates. JSON confirmed misattached. All 4 locked interview decisions encoded. |
| 0.2 | 2026-03-17 | Architecture | Added `responsibility_import_finding` entity per P1-A2 Import-State Platform Standard completeness requirement. Aligned storage boundary references to cite platform standard. |
| 0.3 | 2026-03-17 | Architecture | Updated responsible_party_key cross-reference to cite P1-A2 Vendor Identity Resolution Platform Standard (Class H, not Class G — this is a party/organization field). |
