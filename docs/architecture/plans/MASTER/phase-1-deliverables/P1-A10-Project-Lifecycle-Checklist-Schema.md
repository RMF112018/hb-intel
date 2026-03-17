# P1-A10: Project Lifecycle Checklist Schema

**Document ID:** P1-A10
**Phase:** 1 (Foundation)
**Classification:** Internal — Engineering
**Status:** Draft
**Date:** 2026-03-17
**Read With:** [P1-A1-Data-Ownership-Matrix.md](./P1-A1-Data-Ownership-Matrix.md), [P1-A2-Source-of-Record-Register.md](./P1-A2-Source-of-Record-Register.md), [P1-A3-SharePoint-Lists-Libraries-Schema-Register.md](./P1-A3-SharePoint-Lists-Libraries-Schema-Register.md)

---

## Purpose

Define the canonical schema for **project lifecycle checklists** — a unified governed domain that aggregates startup, safety, and closeout checklist families under one project-level container.

Construction projects require structured checklists at multiple lifecycle stages: mobilization/setup (startup), site safety readiness (safety), and project completion/turnover (closeout). These share a common template-driven, section-grouped, item-level checklist pattern but differ in outcome semantics and operational context.

### Why Not "Closeout Only"

The original source material spans three distinct checklist families (startup, safety, closeout). Governing them as separate domains would create duplicate entity models and prevent cross-family reporting. The "Project Lifecycle Checklist" umbrella accurately reflects the combined scope.

---

## Relationship to P1-A1 / P1-A2 / P1-A3

| Artifact | Relationship |
|----------|-------------|
| **P1-A1** | Compliance domain in P1-A1 includes checklist-related operational data. This schema governs the detailed entity model for project lifecycle checklists. |
| **P1-A2** | Checklist data follows P1-A2 adapter patterns for SharePoint persistence. |
| **P1-A3** | P1-A3 defines the SharePoint lists that store checklist templates and project instances. |

---

## Scope and Non-Scope

### In Scope
- Startup checklist family (project mobilization/setup)
- Safety checklist family (jobsite safety readiness)
- Closeout checklist family (project completion/turnover)
- Template/version governance model
- Project-level aggregate container
- Family-specific instances under the aggregate
- Shared canonical outcome mapping with preserved family-specific raw outcomes
- Evidence/document linkage
- Import provenance

### Out of Scope
- Recurring safety inspection checklists (future extension if needed)
- Subcontract compliance checklists (governed by P1-A1 buyout domain)
- Estimating kickoff checklists (governed by P1-A8)
- SharePoint physical container definitions (P1-A3)

---

## Source Analysis

### Source Files

| File | Family | Pages | Sections | Items | Outcome Values |
|------|--------|-------|----------|-------|----------------|
| `Project_Closeout_Checklist.pdf` | closeout | 4 | 7 | ~70 | N/A / Yes / No |
| `Project_Startup_Checklist.pdf` | startup | 3 | 4 | ~47 | N/A / Yes / No |
| `Project_Safety_Checklist.pdf` | safety | 2 | 2 | ~32 | Pass / Fail / N/A |

All three are exported from Procore's "Inspection Template" system with consistent structure: company header, project context, template name, type classification, sections with numbered items.

### Closeout Sections (~70 items)

| Section | # | Items | Behavior |
|---------|---|-------|----------|
| Tasks | 1 | 5 | Administrative closure tasks (RFIs, submittals, change orders, as-builts) |
| Document Tracking | 2 | 13 | Document/certification collection (soil, insulation, surveys, engineer certs) |
| Inspections | 3 | 11 | Final inspection sign-offs (plumbing, HVAC, electrical, fire, building final, CO) |
| Turnover | 4 | 15 | Owner turnover tasks (punch list, as-builts, warranties, manuals, appreciation) |
| Post Turnover | 5 | 5 | Post-completion tasks (lien filing, photos, recommendation letter, file return) |
| Complete Project Closeout Documents for PX | 6 | 5 | Internal closeout document package (recap form, evaluations, lessons learned) |
| PBC Close-Out Requirements | 7 | 16 | Palm Beach County-specific compliance requirements with details/notes |

### Startup Sections (~47 items)

| Section | # | Items | Behavior |
|---------|---|-------|----------|
| Review Owner's Contract | 1 | 4 | Contract review tasks (savings clause, liquidated damages, allowances) |
| Job Start-up | 2 | 33 | Mobilization/setup tasks (bonding, Procore setup, budget, schedule, permits, etc.) |
| Order services and equipment | 3 | 6 | Equipment/service ordering (phone, sanitary, field office, first aid) |
| Permits posted on Jobsite | 4 | 12 | Permit posting verification (master, roofing, plumbing, HVAC, electrical, etc.) |

### Safety Sections (~32 items)

| Section | # | Items | Behavior |
|---------|---|-------|----------|
| Areas of Highest Risk | 1 | 4 | Critical risk categories (fall, electrical, struck-by, crushed-by) |
| Other Risks (These caused most injuries) | 2 | 28 | Comprehensive risk/hazard assessment categories |

### Shared Structure

| Feature | Startup | Safety | Closeout |
|---------|---------|--------|----------|
| Source system | Procore Inspection Template | Procore Inspection Template | Procore Inspection Template |
| Project header | Yes | Yes | Yes |
| Numbered sections | Yes | Yes | Yes |
| Numbered items | Yes (X.Y format) | Yes (X.Y format) | Yes (X.Y format) |
| Outcome per item | N/A / Yes / No | Pass / Fail / N/A | N/A / Yes / No |
| Item details/notes | Some items have notes | No | Some items have "Details:" text |
| Timing | One-time at project start | One-time at project start | One-time at project end |

---

## Canonical Entity Model

### Entity Summary

| # | Entity | Purpose |
|---|--------|---------|
| 1 | `lifecycle_checklist_template` | Governed template definition for a checklist family |
| 2 | `lifecycle_checklist_template_item` | Standard item in a template version |
| 3 | `project_lifecycle_checklist` | Project-level aggregate container (one per project) |
| 4 | `project_checklist_family_instance` | Family-specific instance (startup / safety / closeout) under the aggregate |
| 5 | `checklist_section` | Section within a family instance |
| 6 | `checklist_item` | Individual item with outcome, notes, and optional evidence link |
| 7 | `checklist_evidence_link` | Evidence/document links per item |
| 8 | `checklist_import_batch` | Import provenance |

### lifecycle_checklist_template

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| template_id | string | Yes | Template identifier |
| template_name | string | Yes | Template display name (e.g., "Project Closeout & Pre Cert of Occupancy checklist") |
| checklist_family | string | Yes | Family: `startup`, `safety`, `closeout` |
| description | string | No | Template description |
| source_system | string | No | Source system (e.g., "Procore Inspection Template") |
| is_active | boolean | Yes | Whether this is the current active template for its family |
| created_at | datetime | Yes | Creation timestamp |
| created_by | string | Yes | Creator identity (UPN) |

### lifecycle_checklist_template_item

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| template_item_id | string | Yes | Stable item identifier across versions |
| template_id | string | Yes | FK to lifecycle_checklist_template |
| section_number | number | Yes | Section number (1, 2, 3, ...) |
| section_label | string | Yes | Section display name (e.g., "Document Tracking") |
| item_number | string | Yes | Item number within section (e.g., "2.5") |
| item_name | string | Yes | Item description text |
| item_details | string | No | Additional details/guidance text |
| item_type | string | No | `task`, `document_requirement`, `inspection_signoff`, `risk_assessment`, `permit_verification` |
| default_outcome_options | string | Yes | Family outcome set: `yes_no_na` or `pass_fail_na` |
| display_order | number | Yes | Sort position within template |
| evidence_expected | boolean | No | Whether this item typically requires evidence/document linkage |
| is_active | boolean | Yes | Whether this item is in the current active template |

### project_lifecycle_checklist

One per project — the aggregate container.

| Field | Type | Required | Key | Description |
|-------|------|----------|-----|-------------|
| checklist_id | string | Yes | PK | HB Intel aggregate container identifier |
| project_id | string | Yes | FK | FK to project domain |
| project_name_snapshot | string | No | — | Project name at creation |
| project_number_snapshot | string | No | — | Project number at creation |
| project_address_snapshot | string | No | — | Project address at creation |
| overall_status | string | No | — | Aggregate status: not_started, in_progress, complete |
| created_at | datetime | Yes | — | Container creation timestamp |

### project_checklist_family_instance

One per family per project (e.g., one startup instance, one safety instance, one closeout instance).

| Field | Type | Required | Key | Description |
|-------|------|----------|-----|-------------|
| instance_id | string | Yes | PK | Family instance identifier |
| checklist_id | string | Yes | FK | FK to project_lifecycle_checklist |
| template_id | string | No | FK | FK to lifecycle_checklist_template used |
| template_snapshot_date | datetime | No | — | When template was snapshotted into this instance |
| checklist_family | string | Yes | — | Family: `startup`, `safety`, `closeout` |
| family_status | string | Yes | — | Family-level status: not_started, in_progress, complete |
| completion_percentage | number | No | — | Derived: percentage of items with canonical outcome != null |
| started_at | datetime | No | — | When first item was completed |
| completed_at | datetime | No | — | When all items were completed |
| batch_id | string | No | FK | FK to checklist_import_batch (if imported) |
| notes | text | No | — | Family-level notes |

### checklist_section

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| section_id | string | Yes | Section identifier |
| instance_id | string | Yes | FK to project_checklist_family_instance |
| section_number | number | Yes | Section sequence number |
| section_label | string | Yes | Section display name |
| display_order | number | Yes | Sort position |

### checklist_item

| Field | Type | Required | Key | Description |
|-------|------|----------|-----|-------------|
| item_id | string | Yes | PK | HB Intel item identifier |
| section_id | string | Yes | FK | FK to checklist_section |
| instance_id | string | Yes | FK | FK to project_checklist_family_instance |
| template_item_id | string | No | FK | FK to template item (null for custom items) |
| is_custom | boolean | Yes | — | True if project-specific addition |
| item_number | string | Yes | — | Display number (e.g., "2.5") |
| item_name | string | Yes | — | Item description text |
| item_details | string | No | — | Additional details/guidance text |
| item_type | string | No | — | `task`, `document_requirement`, `inspection_signoff`, `risk_assessment`, `permit_verification` |
| display_order | number | Yes | — | Sort position within section |
| canonical_outcome | string | No | — | Canonical: `complete`, `incomplete`, `pass`, `fail`, `not_applicable` (null = not yet assessed) |
| raw_outcome_value | string | No | — | Raw source value: "Yes", "No", "N/A", "Pass", "Fail" |
| raw_outcome_family | string | No | — | Which outcome set: `yes_no_na`, `pass_fail_na` |
| status_notes | string | No | — | Item-level notes/comments |
| target_date | date | No | — | Target completion date (if applicable) |
| completed_date | date | No | — | Actual completion date |
| evidence_required | boolean | No | — | Whether evidence/document linkage is expected |
| current_evidence_ref | string | No | — | Primary evidence reference (document ID, URL) |
| source_row_number | number | No | — | Original row in source document |

### checklist_evidence_link

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| link_id | string | Yes | Link record identifier |
| item_id | string | Yes | FK to checklist_item |
| link_type | string | Yes | `document`, `file_url`, `certificate`, `inspection_report`, `external_reference` |
| link_target | string | Yes | Document ID, URL, or reference |
| link_label | string | No | Display label |
| created_at | datetime | Yes | When the link was added |

### checklist_import_batch

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| batch_id | string | Yes | System-generated surrogate (opaque string); import batch identifier |
| project_id | string | No | FK to project domain |
| checklist_family | string | Yes | Which family was imported |
| source_system | string | Yes | Source system (e.g., "Procore") |
| source_file_name | string | Yes | Original file name |
| import_status | string | Yes | pending, parsing, complete, failed |
| total_sections | number | No | Sections processed |
| total_items | number | No | Items processed |
| uploaded_by | string | Yes | Uploader identity (UPN) |
| uploaded_at | datetime | Yes | Upload timestamp |
| parser_version | string | No | Parser version |

**Storage:** Azure Table Storage (Class D, operational). Per the Import-State Platform Standard in P1-A2.

### checklist_import_finding

Import validation findings for checklist ingestion. Stored in Azure Table Storage per the Import-State Platform Standard in P1-A2 (universal rule: all findings in Azure Table Storage, Class D, append-only).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| finding_id | string | Yes | Finding identifier (surrogate) |
| batch_id | string | Yes | FK to checklist_import_batch |
| severity | string | Yes | error, warning, info |
| category | string | Yes | parse_error, validation_failure, mapping_warning, outcome_mismatch |
| message | string | Yes | Human-readable description |

**Storage:** Azure Table Storage (partition key: `checklist-findings-{batchId}`). Class D, append-only, immutable once logged.

---

## Outcome Mapping

### Canonical Outcome Codes

| Code | Meaning | Used By |
|------|---------|---------|
| `complete` | Item is complete / satisfactory | startup (Yes), closeout (Yes) |
| `incomplete` | Item is not complete / unsatisfactory | startup (No), closeout (No) |
| `pass` | Item passes inspection/assessment | safety (Pass) |
| `fail` | Item fails inspection/assessment | safety (Fail) |
| `not_applicable` | Item does not apply to this project | all families (N/A) |

### Raw-to-Canonical Mapping

| Family | Raw Value | Canonical Outcome |
|--------|-----------|-------------------|
| startup | Yes | `complete` |
| startup | No | `incomplete` |
| startup | N/A | `not_applicable` |
| closeout | Yes | `complete` |
| closeout | No | `incomplete` |
| closeout | N/A | `not_applicable` |
| safety | Pass | `pass` |
| safety | Fail | `fail` |
| safety | N/A | `not_applicable` |

**Both stored:** `canonical_outcome` for cross-family reporting + `raw_outcome_value` for source fidelity.

---

## Family Behavior Rules

### Shared Across All Families
- Template-driven section/item structure
- Project-specific custom item additions
- Outcome per item
- Evidence/document linkage capability
- One-time completion per project lifecycle stage
- Import from Procore Inspection Template exports

### Family-Specific Behavior

| Behavior | Startup | Safety | Closeout |
|----------|---------|--------|----------|
| **Timing** | Project start (mobilization) | Project start (readiness) | Project end (turnover) |
| **Outcome set** | Yes / No / N/A | Pass / Fail / N/A | Yes / No / N/A |
| **Item types** | Tasks, document readiness, setup verification | Risk/hazard assessment, adequacy checks | Tasks, document collection, inspection sign-offs, turnover deliverables |
| **Evidence frequency** | Moderate (insurance, permits, contracts) | Low (safety plan reference) | High (certificates, surveys, letters, warranties) |
| **Completion meaning** | "Ready to proceed" | "Site adequately assessed" | "Project turned over" |

---

## Template / Version Strategy

| Aspect | Rule |
|--------|------|
| **One template per family** | Each family (startup, safety, closeout) has its own template |
| **Version tracking** | Templates are versioned; project instances snapshot the active template at creation |
| **Governed updates** | Template changes require authorized approval; existing instances are not auto-updated |
| **Custom items** | Projects may add custom items (`is_custom = true`) to any section |
| **Source system** | Current templates sourced from Procore Inspection Templates |

---

## Evidence / Document Strategy

| Aspect | Rule |
|--------|------|
| **Primary reference** | `current_evidence_ref` on checklist_item for the main evidence link |
| **Multiple links** | `checklist_evidence_link` child records when multiple artifacts per item |
| **Link types** | document, file_url, certificate, inspection_report, external_reference |
| **Evidence required flag** | Items that typically need evidence are marked `evidence_required = true` in template |
| **Closeout emphasis** | Closeout items heavily use evidence (certificates, surveys, letters, approvals) |

---

## Search / Filter / Reporting Role

| Dimension | Treatment |
|-----------|-----------|
| **Filterable by** | project, checklist_family, section, canonical_outcome, item_type, evidence_required, completion status |
| **Reportable** | Family completion percentage, incomplete/failing items, missing evidence, overdue items |
| **Dashboard** | Startup readiness, safety readiness, closeout readiness — per project and portfolio |
| **Cross-family** | Canonical outcomes enable unified "project readiness" views across all families |
| **Analytics** | Completion trends, common failing items, evidence compliance rates |

---

## Storage Boundary Alignment

| Data | Storage | Authority | P1-A1/A2 Alignment |
|------|---------|-----------|---------------------|
| Templates | SharePoint List (hub site, shared) | Authoritative template library | Shared reference data per P1-A1 |
| Template items | SharePoint List (hub site, shared) | Authoritative library items | Same |
| Project aggregate + family instances | SharePoint List (project site) | Authoritative project operational data | Aligns with P1-A1 compliance domain |
| Sections + items | SharePoint List (project site) | Authoritative child records | Same |
| Evidence links | SharePoint List (project site) | Authoritative links | Same |
| Import batches | Azure Table Storage | Operational state | Default per Import-State Platform Standard in P1-A2 |

---

## Open Decisions / Future Expansion

| Decision | Scope | Owner | Target |
|----------|-------|-------|--------|
| **Recurring safety checklists** | If safety checklists become recurring (monthly/quarterly), extend the instance model to support cadenced repetition | Operations + Safety | Phase 2 |
| **Checklist family dictionary** | Formalize startup/safety/closeout as governed reference set in P1-A5 | Platform Architecture | Phase 1 (late) |
| **Item type dictionary** | Formalize task/document_requirement/inspection_signoff/etc. types | Platform Architecture | Phase 1 (late) |
| **Cross-family aggregate status** | Compute project-wide lifecycle readiness from all family statuses | Platform Architecture | Phase 2 |
| **Procore API import** | Replace PDF/export-based import with real-time Procore Inspection API | Platform Architecture | Phase 4+ |

---

## Decision Owners and Approval

| Role | Name | Approval Date |
|------|------|----------------|
| Platform Architecture Lead | — | — |
| Operations Lead | — | — |
| Safety Lead | — | — |

**Approval Status:** Pending — Schema defined; pending operational validation
**Comments:** Schema derived from three source PDFs (closeout ~70 items, startup ~47 items, safety ~32 items). All locked interview decisions encoded.

---

## Revision History

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 0.1 | 2026-03-17 | Architecture | Initial schema; 8 canonical entities, 3 checklist families (startup/safety/closeout), canonical outcome mapping (complete/incomplete/pass/fail/not_applicable), template/version model, evidence linkage, hybrid raw+canonical outcome preservation. Evidence-based from 3 source PDFs. All 6 locked interview decisions encoded. |
| 0.2 | 2026-03-17 | Architecture | Added `checklist_import_finding` entity per P1-A2 Import-State Platform Standard completeness requirement. Aligned storage boundary references to cite platform standard. |
