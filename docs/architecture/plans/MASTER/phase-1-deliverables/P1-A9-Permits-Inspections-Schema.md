# P1-A9: Permits & Inspections Schema

**Document ID:** P1-A9
**Phase:** 1 (Foundation)
**Classification:** Internal — Engineering
**Status:** Draft
**Date:** 2026-03-17
**Read With:** [P1-A1-Data-Ownership-Matrix.md](./P1-A1-Data-Ownership-Matrix.md), [P1-A2-Source-of-Record-Register.md](./P1-A2-Source-of-Record-Register.md), [P1-A3-SharePoint-Lists-Libraries-Schema-Register.md](./P1-A3-SharePoint-Lists-Libraries-Schema-Register.md)

---

## Purpose

Define the canonical schema for construction permits, inspections, and inspection issues — a parent-child operational domain that tracks permit lifecycle (application → approval → renewal → expiration), scheduled inspections with compliance scoring, and structured issue resolution.

---

## Relationship to P1-A1 / P1-A2 / P1-A3

| Artifact | Relationship |
|----------|-------------|
| **P1-A1** | The `compliance` domain in P1-A1 is the governance-level home for permit-related data. This schema defines the detailed entity model. |
| **P1-A2** | Permit data follows P1-A2 adapter patterns for SharePoint persistence. |
| **P1-A3** | P1-A3 defines the SharePoint lists that store permit records per project site. |

---

## Scope and Non-Scope

### In Scope
- Permit parent record with identity, type, status, dates, financial, authority contact, description
- Permit conditions as child records (hybrid: structured + raw preservation)
- Permit tags as normalized classification values (hybrid: normalized + raw preservation)
- Inspection child records with type, result, compliance score, inspector contact, dates
- Inspection issue child records with severity, resolution tracking
- Contact snapshot model (authority contact, inspector contact)
- Import batch / provenance tracking
- Storage-boundary alignment

### Out of Scope
- Full permit workflow/UX implementation
- Document attachment management
- Authority/jurisdiction reference dictionary (future P1-A5 extension)
- SharePoint physical container definitions (P1-A3)
- Re-inspection workflow engine

---

## Source File Analysis

**File:** `docs/reference/example/permits.json`

| Property | Value |
|----------|-------|
| Format | JSON array of permit objects |
| Total permits | 153 |
| Total inspections | 4 (nested under permits) |
| Total issues | 3 (nested under inspections) |
| Permit IDs | Globally unique (`perm-001` through `perm-153`) |
| Inspection IDs | Globally unique (`insp-001-1`, `insp-001-2`, etc.) |

### Permit-Level Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Source permit identifier |
| `project_id` | number | Project linkage |
| `number` | string | Permit number (e.g., `MAST-2024-001`) |
| `type` | string | Permit type (12 values) |
| `status` | string | Lifecycle status (5 values) |
| `priority` | string | Priority level (3 values) |
| `authority` | string | Issuing authority name |
| `authorityContact` | object | Authority contact snapshot: name, phone, email, address |
| `applicationDate` | datetime | Application submission date |
| `approvalDate` | datetime | Approval date |
| `expirationDate` | datetime | Permit expiration date |
| `renewalDate` | datetime | Renewal date (null if not renewed) |
| `cost` | number | Permit cost/fee |
| `bondAmount` | number | Required bond amount |
| `description` | string | Permit description |
| `comments` | string | General comments |
| `conditions` | string[] | Required conditions (freeform text array) |
| `tags` | string[] | Classification tags (lightweight values) |
| `inspections` | object[] | Nested inspection records |

### Controlled Values

| Field | Values |
|-------|--------|
| **Permit Type** | Master Building Permit, Demolition, Site Development, Electrical, Plumbing, Mechanical, Roofing, Fire Alarm, Fire Sprinkler, Elevator, Pool Barricade, Mass Grading |
| **Permit Status** | pending, approved, renewed, expired, rejected |
| **Priority** | high, medium, low |
| **Inspection Result** | passed, conditional, failed, pending |
| **Issue Severity** | high, medium |

### Inspection-Level Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Source inspection identifier |
| `permitId` | string | Parent permit FK |
| `type` | string | Inspection type (e.g., Foundation, Framing) |
| `scheduledDate` | datetime | Scheduled inspection date |
| `completedDate` | datetime | Actual completion date |
| `inspector` | string | Inspector display name |
| `inspectorContact` | object | Inspector contact: phone, email, badge |
| `result` | string | Inspection result |
| `complianceScore` | number | Compliance score (0–100) |
| `issues` | object[] | Nested issue records |
| `comments` | string | Inspection comments |
| `resolutionNotes` | string | Resolution notes |
| `followUpRequired` | boolean | Whether follow-up is needed |
| `duration` | number | Inspection duration in minutes |
| `createdAt` | datetime | Creation timestamp |
| `updatedAt` | datetime | Last update timestamp |

### Issue-Level Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Source issue identifier |
| `description` | string | Issue description |
| `severity` | string | Issue severity |
| `resolved` | boolean | Whether the issue is resolved |
| `resolutionNotes` | string | Resolution description |

### Contact Structure Comparison

| Field | Authority Contact | Inspector Contact |
|-------|-------------------|-------------------|
| `name` | Yes | No (name is top-level `inspector` field) |
| `phone` | Yes | Yes |
| `email` | Yes | Yes |
| `address` | Yes | No |
| `badge` | No | Yes |

Both share phone/email; authority adds name/address, inspector adds badge. The inspector display name is a separate top-level field.

---

## Canonical Entity Model

### Entity Summary

| # | Entity | Purpose |
|---|--------|---------|
| 1 | `permit_record` | Parent permit with identity, type, status, dates, financial, authority contact, description |
| 2 | `permit_condition` | Child condition records (structured from conditions array) |
| 3 | `permit_tag` | Child tag records (normalized from tags array) |
| 4 | `permit_inspection` | Child inspection with type, result, score, inspector contact, dates |
| 5 | `permit_inspection_issue` | Child issue on inspection with severity, resolution |
| 6 | `permit_import_batch` | Import provenance tracking |
| 7 | `permit_import_finding` | Validation findings |

### permit_record

| Field | Type | Required | Key | Description |
|-------|------|----------|-----|-------------|
| record_id | string | Yes | PK | HB Intel canonical permit identifier |
| batch_id | string | No | FK | FK to permit_import_batch |
| project_id | string | Yes | FK | FK to project domain |
| source_permit_id | string | No | — | Source `id` field (e.g., `perm-001`) |
| permit_number | string | Yes | NK | Permit number (e.g., `MAST-2024-001`); unique within project/authority |
| permit_name | string | No | — | Permit display name (derived from type + description if needed) |
| permit_type | string | Yes | — | Permit type classification |
| permit_status | string | Yes | — | Lifecycle status: pending, approved, renewed, expired, rejected |
| priority | string | No | — | Priority: high, medium, low |
| authority_name | string | No | — | Issuing authority display name |
| authority_contact_name | string | No | — | Authority contact person name (snapshot) |
| authority_contact_phone | string | No | — | Authority contact phone (snapshot) |
| authority_contact_email | string | No | — | Authority contact email (snapshot) |
| authority_contact_address | string | No | — | Authority contact address (snapshot) |
| authority_contact_key | string | No | — | Canonical authority contact key (Class H vendor/party pattern); nullable if unresolved; snapshot fields always preserved |
| application_date | datetime | No | — | Application submission date |
| approval_date | datetime | No | — | Approval date |
| expiration_date | datetime | No | — | Permit expiration date |
| renewal_date | datetime | No | — | Renewal date (null if not renewed) |
| cost | number | No | — | Permit cost/fee (USD) |
| bond_amount | number | No | — | Required bond amount (USD) |
| description | string | No | — | Permit description |
| comments | string | No | — | General comments |
| conditions_raw | text | No | — | Raw JSON array of conditions (preserved for source fidelity) |
| tags_raw | text | No | — | Raw JSON array of tags (preserved for source fidelity) |
| is_active | boolean | Yes | — | Whether permit is currently active |
| created_at | datetime | Yes | — | Record creation timestamp |
| updated_at | datetime | Yes | — | Last modification timestamp |
| notes | text | No | — | Implementation notes |

### permit_condition

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| condition_id | string | Yes | Condition record identifier |
| permit_id | string | Yes | FK to permit_record |
| condition_text | string | Yes | Condition description |
| condition_status | string | No | met, pending, waived (future extension; null until tracked) |
| sort_order | number | No | Display order |

### permit_tag

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| tag_id | string | Yes | Tag record identifier |
| permit_id | string | Yes | FK to permit_record |
| tag_value | string | Yes | Normalized tag value (lowercase, trimmed) |
| raw_tag_value | string | No | Original source tag value |

### permit_inspection

| Field | Type | Required | Key | Description |
|-------|------|----------|-----|-------------|
| inspection_id | string | Yes | PK | HB Intel canonical inspection identifier |
| permit_id | string | Yes | FK | FK to permit_record |
| source_inspection_id | string | No | — | Source `id` field (e.g., `insp-001-1`) |
| inspection_type | string | Yes | — | Inspection type (e.g., Foundation, Framing) |
| scheduled_date | datetime | No | — | Scheduled inspection date |
| completed_date | datetime | No | — | Actual completion date |
| result | string | No | — | Inspection result: passed, conditional, failed, pending |
| compliance_score | number | No | — | Compliance score (0–100) |
| inspector_display | string | No | — | Inspector display name (snapshot) |
| inspector_contact_phone | string | No | — | Inspector phone (snapshot) |
| inspector_contact_email | string | No | — | Inspector email (snapshot) |
| inspector_contact_badge | string | No | — | Inspector badge number (snapshot) |
| inspector_contact_key | string | No | — | Canonical inspector identity (Class G person-attribution); UPN if Entra ID user, external registry key otherwise; nullable if unresolved; `inspector_display` always preserved |
| comments | string | No | — | Inspection comments |
| resolution_notes | string | No | — | Resolution notes |
| follow_up_required | boolean | No | — | Whether follow-up inspection is needed |
| duration_minutes | number | No | — | Inspection duration in minutes |
| issues_raw | text | No | — | Raw JSON array of issues (preserved for source fidelity) |
| created_at | datetime | Yes | — | Creation timestamp |
| updated_at | datetime | Yes | — | Last update timestamp |

### permit_inspection_issue

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| issue_id | string | Yes | HB Intel canonical issue identifier |
| inspection_id | string | Yes | FK to permit_inspection |
| source_issue_id | string | No | Source `id` field (e.g., `issue-001`) |
| description | string | Yes | Issue description |
| severity | string | No | Issue severity: high, medium, low |
| is_resolved | boolean | No | Whether the issue is resolved |
| resolution_notes | string | No | Resolution description |

### permit_import_batch

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| batch_id | string | Yes | Import batch identifier |
| project_id | string | No | FK to project domain |
| source_system | string | Yes | Source system name |
| source_file_name | string | Yes | Original file name |
| import_status | string | Yes | pending, parsing, complete, failed |
| total_permits | number | No | Permits processed |
| total_inspections | number | No | Inspections processed |
| total_issues | number | No | Issues processed |
| uploaded_by | string | Yes | Uploader identity |
| uploaded_at | datetime | Yes | Upload timestamp |
| parser_version | string | No | Parser version |

### permit_import_finding

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| finding_id | string | Yes | Finding identifier |
| batch_id | string | Yes | FK to permit_import_batch |
| severity | string | Yes | error, warning, info |
| category | string | Yes | parse_error, validation_failure, mapping_warning |
| entity_type | string | No | permit, inspection, issue, condition, tag |
| message | string | Yes | Human-readable description |

---

### Keying and Uniqueness Rules

| Rule | Decision |
|------|----------|
| **Permit PK** | `record_id` (surrogate) |
| **Permit natural key** | `(project_id, permit_number)` — unique within project/authority |
| **Source identity** | `source_permit_id` preserved for import traceability |
| **Inspection PK** | `inspection_id` (surrogate) |
| **Inspection source** | `source_inspection_id` preserved |
| **Issue PK** | `issue_id` (surrogate) |
| **Issue source** | `source_issue_id` preserved |
| **Repeat import** | Same project + permit_number across batches = same logical permit; latest batch = current state |

---

### Identity Class Alignment (Frozen)

Each A9 entity maps to a frozen identity class from the [P1-A2 Identity Strategy Freeze](./P1-A2-Source-of-Record-Register.md).

| Entity | Identity Class | Identity Key | Notes |
|--------|---------------|-------------|-------|
| `permit_record` | B (SP-backed business record) | `record_id` (surrogate); `(project_id, permit_number)` natural key | `source_permit_id` preserved for import traceability; no raw SP numeric IDs exposed |
| `permit_condition` | D (child record) | `condition_id` (surrogate); FK `permit_id` | Child of `permit_record` |
| `permit_tag` | D (child record) | `tag_id` (surrogate); FK `permit_id` | `tag_value` normalized; `raw_tag_value` preserved |
| `permit_inspection` | D (child record) | `inspection_id` (surrogate); FK `permit_id` | `source_inspection_id` preserved |
| `permit_inspection_issue` | D (child record) | `issue_id` (surrogate); FK `inspection_id` | `source_issue_id` preserved |
| `permit_import_batch` | E (import-batch) | `batch_id` (surrogate, system-generated) | `source_file_name` is metadata, not identity |
| `permit_import_finding` | J (findings/audit) | `finding_id` (surrogate); batch-scoped | Append-only; immutable once logged |

#### Contact key resolution

- **`authority_contact_key`** follows the Class H (vendor/party) pattern: nullable canonical key for the issuing authority contact when resolvable via a future authority registry; raw snapshot fields (`authority_contact_name`, `authority_contact_phone`, `authority_contact_email`, `authority_contact_address`) are always preserved and never used as join keys.
- **`inspector_contact_key`** follows the Class G (person-attribution) pattern: nullable canonical key — UPN if the inspector is an Entra ID-resolved user, or an external inspector registry key when available; `inspector_display` always preserved and never used as a join key.
- Both keys are nullable if unresolved. No synthetic person or party IDs are invented. Resolution is owned by the adapter/import layer.

---

### Contact Strategy (Locked Hybrid)

| Aspect | Rule |
|--------|------|
| **Authority contact** | Raw snapshot fields on permit_record (name, phone, email, address) + optional `authority_contact_key` for canonical linked reference when resolvable |
| **Inspector contact** | Raw snapshot fields on permit_inspection (display name, phone, email, badge) + optional `inspector_contact_key` for canonical linked reference |
| **Shared model** | Both use the same pattern: raw snapshots + optional canonical key. Authority adds address; inspector adds badge. Role is implicit by entity placement. |

---

### Conditions / Tags Strategy (Locked Hybrid)

#### Conditions
| Aspect | Rule |
|--------|------|
| **Structured records** | Each condition string becomes a `permit_condition` child record |
| **Raw preservation** | `conditions_raw` on permit_record preserves the original JSON array |
| **Normalization** | Trim whitespace; no casing change (conditions are natural language) |
| **Future** | `condition_status` field supports met/pending/waived tracking when workflow is added |

#### Tags
| Aspect | Rule |
|--------|------|
| **Normalized values** | Each tag becomes a `permit_tag` child record with lowercase-normalized value |
| **Raw preservation** | `tags_raw` on permit_record preserves the original JSON array; `raw_tag_value` on each tag record |
| **Duplicate handling** | Deduplicate within a permit; log finding if duplicates detected |
| **Dictionary candidate** | 11 tag values should become a governed tag dictionary in P1-A5 when the set stabilizes |

---

### Inspection / Issue Strategy (Locked Hybrid)

| Aspect | Rule |
|--------|------|
| **Inspection modeling** | First-class child entity under permit_record |
| **Issue modeling** | First-class child entity under permit_inspection |
| **Raw preservation** | `issues_raw` on permit_inspection preserves the original JSON array |
| **Issue lifecycle** | `is_resolved` + `resolution_notes` track resolution; future extensions may add resolved_date, resolved_by |

---

### Lifecycle / Temporal Strategy (Locked Hybrid)

| Aspect | Rule |
|--------|------|
| **Permit status** | Current status stored directly on permit_record; 5 values: pending, approved, renewed, expired, rejected |
| **Milestone dates** | application_date, approval_date, expiration_date, renewal_date stored as direct fields |
| **Inspection status** | `result` field on inspection (passed, conditional, failed, pending) |
| **Timestamps** | created_at, updated_at on permit and inspection records for current-state audit |
| **History support** | Optional lifecycle/history child records may be added in future phases; not modeled in v0.1 |
| **Renewal/expiration** | renewal_date set when renewed; expiration_date monitoring enables renewal dashboard |

---

### Search / Analytics / Reporting Role

| Role | Treatment |
|------|-----------|
| **Search indexed?** | Yes — permit_number, permit_type, authority, description, tags |
| **Search role** | `permit_number`: Keyword Content; `permit_type`: Facet / Filter; `permit_status`: Facet / Filter; `priority`: Facet / Filter; `authority_name`: Facet / Filter; tag values: Facet / Filter |
| **Analytics included?** | Yes — permit lifecycle and compliance tracking |
| **Analytics role** | Operational Reporting (permit status distribution, expiration monitoring, inspection pass rates); Portfolio analytics (permit cost/bond across projects) |
| **Dashboard use** | Expiring permits, pending inspections, failed inspections, unresolved issues, compliance scores |
| **AI context** | Permit status and inspection results contribute to project health scoring |

---

### Storage Boundary Alignment

| Data | Storage | Authority | P1-A1/A2 Alignment |
|------|---------|-----------|---------------------|
| Permit records | SharePoint List (project site) | Authoritative project operational data | Aligns with P1-A1: compliance domain in SharePoint |
| Conditions | SharePoint List (project site) | Authoritative child records | Same |
| Tags | SharePoint List (project site) | Authoritative child records | Same |
| Inspections | SharePoint List (project site) | Authoritative child records | Same |
| Issues | SharePoint List (project site) | Authoritative child records | Same |
| Import batches | Azure Table Storage | Operational state | Default per Import-State Platform Standard in P1-A2 |
| Import findings | Azure Table Storage | Operational audit | Same |

---

## Open Decisions / Future Expansion

| Decision | Scope | Owner | Target |
|----------|-------|-------|--------|
| **Authority/jurisdiction dictionary** | Formalize authority names as governed reference set in P1-A5 | Platform Architecture | Phase 1 (late) |
| **Permit type dictionary** | Formalize 12 permit types as governed reference set | Platform Architecture | Phase 1 (late) |
| **Tag dictionary** | Formalize tag values in P1-A5 | Platform Architecture | Phase 1 (late) |
| **Condition tracking workflow** | Add condition_status tracking (met/pending/waived) | Operations + Compliance | Phase 2 |
| **Re-inspection support** | Model re-inspections as linked follow-up records | Platform Architecture | Phase 2 |
| **Document/evidence links** | Attach permit documents, certificates, inspection photos | Platform Architecture | Phase 2 |
| **Renewal automation** | Automated expiration alerts and renewal workflow | Platform Architecture + Operations | Phase 2–3 |

---

## Decision Owners and Approval

| Role | Name | Approval Date |
|------|------|----------------|
| Platform Architecture Lead | — | — |
| Operations / Compliance Lead | — | — |
| Project Controls Lead | — | — |

**Approval Status:** Pending — Schema defined; pending operational validation
**Comments:** Schema derived from permits.json (153 permits, 4 inspections, 3 issues). All 5 locked interview decisions encoded (hybrid contacts, conditions/tags, issues, lifecycle).

---

## Revision History

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 0.1 | 2026-03-17 | Architecture | Initial schema; 7 canonical entities (permit_record, permit_condition, permit_tag, permit_inspection, permit_inspection_issue, permit_import_batch, permit_import_finding). Hybrid contact/conditions/tags/issues/lifecycle strategies per locked interview decisions. Evidence-based from permits.json. |
| 0.2 | 2026-03-17 | Architecture | Add identity class alignment to A2 freeze: map all 7 entities to frozen classes (B, D, E, J). Freeze contact key resolution semantics — `authority_contact_key` as Class H (vendor/party), `inspector_contact_key` as Class G (person-attribution). Both nullable if unresolved; snapshot fields always preserved. |
| 0.3 | 2026-03-17 | Architecture | Aligned storage boundary references with P1-A2 Import-State Platform Standard. |
