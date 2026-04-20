# P1-A13: Lessons Learned Schema

**Document ID:** P1-A13
**Phase:** 1 (Foundation)
**Classification:** Internal — Engineering
**Status:** Draft
**Date:** 2026-03-17
**Read With:** [P1-A1-Data-Ownership-Matrix.md](./P1-A1-Data-Ownership-Matrix.md), [P1-A2-Source-of-Record-Register.md](./P1-A2-Source-of-Record-Register.md), [P1-A3-SharePoint-Lists-Libraries-Schema-Register.md](./P1-A3-SharePoint-Lists-Libraries-Schema-Register.md)

---

## Purpose

Define the canonical schema for **project lessons learned** — a governed knowledge-capture domain where one project report instance produces multiple searchable lesson records, each with structured content fields, governed taxonomy classifications, and supporting document references.

The canonical downstream model is **lesson-centric**: individual lesson records are the primary search/reporting unit, with inherited project metadata enabling portfolio-wide knowledge retrieval.

---

## Source Workbook Analysis

**File:** `docs/reference/example/07 20260307_SOP_LessonsLearnedReport-DRAFT.xlsx`

| Sheet | Rows | Purpose |
|-------|------|---------|
| `Lessons Learned Form` | 159 | Project report form: header + ~10 lesson entry blocks with structured fields |
| `Lessons Database` | 122 | Portfolio database: one-row-per-lesson with 15 columns (confirms lesson-centric downstream intent) |
| `Reference Guide` | 28 | Taxonomy definitions: 15 categories, 4 impact magnitudes, writing standards |

### Report Header (Section 1–2)

| Field | Description |
|-------|-------------|
| Project Name | Project identity |
| Project Number | Project business identifier |
| Project Location / Address | Site location |
| Project Type | Project type classification |
| Original Contract Value ($) | Starting contract value |
| Final Contract Value ($) | Final contract value |
| Variance ($) | Cost variance |
| Scheduled Completion | Planned completion date |
| Actual Completion | Actual completion date |
| Days Variance | Schedule variance in days |
| Project Manager | PM name |
| Superintendent | Superintendent name |
| Project Executive | PX name |
| Report Prepared By | Author |
| Date of Report | Report date |
| Delivery Method | 7 values: Design-Bid-Build, Design-Build, CM at Risk, GMP, Lump Sum, IDIQ/Job Order, Public-Private (P3) |
| Market Sector | 11 values: K-12 Education, Higher Education, Healthcare/Medical, Government/Civic, Office/Commercial, Industrial/Mfg, Retail/Hospitality, Residential/Mixed-Use, Transportation/Infra, Data Center/Tech, Mission Critical, Renovation/Historic, Other |
| Project Size Band | 6 values: Under $1M, $1M–$5M, $5M–$15M, $15M–$50M, $50M–$100M, Over $100M |
| Complexity Rating | 5 values: 1–Straightforward, 2–Moderate, 3–Complex, 4–Highly Complex, 5–Exceptional |

### Lesson Entry Block (repeats ~10 times in form)

Each lesson block has:

| Field | Type | Description |
|-------|------|-------------|
| Category | dropdown | 15 governed categories |
| Phase Encountered | dropdown | Project phase when lesson occurred |
| Applicability (1–5) | number | How broadly applicable (1=rarely, 5=always) |
| Impact Magnitude | dropdown | 4 values: Minor, Moderate, Significant, Critical |
| Keywords / Tags | text | Comma-separated search terms |
| SITUATION | text | What happened? Specific condition/event |
| IMPACT | text | Consequences — cost, schedule, safety, rework |
| ROOT CAUSE | text | Underlying cause analysis |
| RESPONSE | text | Corrective/mitigation actions taken |
| RECOMMENDATION | text | What future teams should do differently |
| Supporting Documents / References | text | RFI numbers, CO numbers, file paths, snapshots |

### Governed Taxonomy (Reference Guide)

**15 Lesson Categories:**

| Category | Scope |
|----------|-------|
| PRE-CONSTRUCTION | Planning, constructability, BIM coordination, owner alignment |
| ESTIMATING & BID | Takeoffs, bid strategy, allowances, unit prices, scope exclusions |
| PROCUREMENT | Lead times, supplier qualification, subcontract terms, material escalation |
| SCHEDULE | CPM logic, float, look-ahead reliability, milestone tracking |
| COST / BUDGET | Contingency, change orders, GMP risk, buyout savings/losses |
| SAFETY | Incidents, near-misses, safety culture, PPE, compliance, JHAs |
| QUALITY | Rework, punch list density, inspection failures, substitutions |
| SUBCONTRACTORS | Selection, performance, default, coordination, contract clarity |
| DESIGN / RFIs | Design gaps, RFI volume, architect responsiveness, drawings |
| OWNER / CLIENT | Scope creep, decision latency, design freeze, communication |
| TECHNOLOGY / BIM | Clash detection, drones, PM software, digital twins |
| WORKFORCE / LABOR | Productivity, craft shortage, overtime, union issues |
| COMMISSIONING | Systems startup, OAC sign-off, testing, owner training, TAB |
| CLOSEOUT / TURNOVER | As-builts, O&Ms, warranties, attic stock, lien waivers, COO |
| OTHER | Lessons not fitting above categories |

**4 Impact Magnitudes:**

| Rating | Threshold | Description |
|--------|-----------|-------------|
| Minor | <$10K or <2 days | Isolated; resolved quickly |
| Moderate | $10K–$50K or 2–10 days | Noticeable; required escalation |
| Significant | $50K–$200K or 10–30 days | Material impact; required recovery plan |
| Critical | >$200K or >30 days | Major impact; threatened milestone/budget/safety |

---

## Canonical Entity Model

### Entity Summary

| # | Entity | Purpose |
|---|--------|---------|
| 1 | `lessons_report_instance` | One-per-project report with header and classification metadata |
| 2 | `lesson_record` | Individual lesson with structured content fields |
| 3 | `lesson_keyword` | Normalized keyword/tag per lesson |
| 4 | `lesson_linked_reference` | Structured document/artifact links per lesson |
| 5 | `lesson_category_dictionary` | 15 governed lesson categories |
| 6 | `lesson_impact_magnitude_dictionary` | 4 governed impact magnitudes |
| 7 | `lesson_phase_dictionary` | 7 governed construction lifecycle phases |
| 8 | `lessons_import_batch` | Import provenance |
| 9 | `lessons_import_finding` | Validation findings |

### lessons_report_instance

One per project — the report-level container.

| Field | Type | Required | Key | Description |
|-------|------|----------|-----|-------------|
| report_id | string | Yes | PK | HB Intel report instance identifier |
| project_id | string | Yes | FK | FK to project domain |
| project_name_snapshot | string | No | — | Project name at report time |
| project_number_snapshot | string | No | — | Project number |
| project_location_snapshot | string | No | — | Project location/address |
| project_type_snapshot | string | No | — | Project type |
| original_contract_value | number | No | — | Original contract value |
| final_contract_value | number | No | — | Final contract value |
| cost_variance | number | No | — | Cost variance (derived or entered) |
| scheduled_completion | date | No | — | Planned completion date |
| actual_completion | date | No | — | Actual completion date |
| days_variance | number | No | — | Schedule variance in days |
| project_manager_display | string | No | — | Non-authoritative display text; always populated; not a join key. Per Person Identity Resolution Platform Standard in P1-A2 |
| project_manager_key | string | No | — | Canonical person key (UPN when Entra-resolved); nullable if unresolved. Class G per P1-A2 |
| superintendent_display | string | No | — | Non-authoritative display text; always populated; not a join key. Per Person Identity Resolution Platform Standard in P1-A2 |
| superintendent_key | string | No | — | Canonical person key (UPN when Entra-resolved); nullable if unresolved. Class G per P1-A2 |
| project_executive_display | string | No | — | Non-authoritative display text; always populated; not a join key. Per Person Identity Resolution Platform Standard in P1-A2 |
| project_executive_key | string | No | — | Canonical person key (UPN when Entra-resolved); nullable if unresolved. Class G per P1-A2 |
| report_prepared_by | string | No | — | Author identity (UPN when Entra-resolved; raw display preserved per A2 identity class G) |
| report_date | date | No | — | Report completion date |
| delivery_method | string | No | — | Delivery method classification |
| market_sector | string | No | — | Market sector classification |
| project_size_band | string | No | — | Project size band |
| complexity_rating | number | No | — | Complexity rating (1–5) |
| batch_id | string | No | FK | FK to import batch |
| created_at | datetime | Yes | — | Creation timestamp |
| updated_at | datetime | Yes | — | Last modification |
| notes | text | No | — | Report-level notes |

### lesson_record

Individual lesson — the canonical search/reporting unit.

| Field | Type | Required | Key | Description |
|-------|------|----------|-----|-------------|
| lesson_id | string | Yes | PK | HB Intel lesson identifier |
| report_id | string | Yes | FK | FK to lessons_report_instance |
| lesson_sequence | number | Yes | — | Lesson number within the report |
| category_key | string | No | FK | FK to lesson_category_dictionary (canonical) |
| category_raw | string | No | — | Raw/source category text |
| phase_encountered_key | string | No | FK | FK to lesson_phase_dictionary (canonical); 7 construction lifecycle phases governed as Class X in P1-A5 |
| phase_encountered_raw | string | No | — | Raw/source phase text |
| impact_magnitude_key | string | No | FK | FK to lesson_impact_magnitude_dictionary (canonical) |
| impact_magnitude_raw | string | No | — | Raw/source magnitude text |
| applicability_score | number | No | — | Applicability rating (1–5) |
| keywords_raw | string | No | — | Raw comma-separated keywords from source |
| situation_text | text | No | — | SITUATION — What happened? |
| impact_text | text | No | — | IMPACT — What were the consequences? |
| root_cause_text | text | No | — | ROOT CAUSE — Why did it happen? |
| response_text | text | No | — | RESPONSE — How did we address it? |
| recommendation_text | text | No | — | RECOMMENDATION — What should future teams do differently? |
| composed_narrative | text | No | — | Combined searchable narrative (derived: situation + impact + root cause + response + recommendation) |
| supporting_reference_text | string | No | — | Raw supporting documents / references text |
| project_name_inherited | string | No | — | Inherited from report for search convenience |
| project_number_inherited | string | No | — | Inherited from report |
| market_sector_inherited | string | No | — | Inherited from report |
| delivery_method_inherited | string | No | — | Inherited from report |
| project_size_band_inherited | string | No | — | Inherited from report |
| report_date_inherited | date | No | — | Inherited from report |
| source_row_number | number | No | — | Source workbook row/block number |

### lesson_keyword

Normalized keyword/tag per lesson.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| keyword_id | string | Yes | Keyword record identifier |
| lesson_id | string | Yes | FK to lesson_record |
| keyword_value | string | Yes | Normalized keyword (lowercase, trimmed) |
| raw_keyword_value | string | No | Original source keyword text |

### lesson_linked_reference

Structured document/artifact links per lesson.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| reference_id | string | Yes | Reference record identifier |
| lesson_id | string | Yes | FK to lesson_record |
| reference_type | string | Yes | `rfi`, `change_order`, `document`, `photo`, `schedule_snapshot`, `report`, `other` |
| reference_identifier | string | Yes | Reference number, document ID, or file path |
| reference_display | string | No | Display label |
| reference_url | string | No | URL or SharePoint link if available |

### lesson_category_dictionary

15 governed lesson categories.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| category_key | string | Yes | Category identifier |
| category_label | string | Yes | Display label (e.g., "PRE-CONSTRUCTION") |
| category_description | string | No | Scope description from reference guide |
| sort_order | number | No | Display order |
| is_active | boolean | Yes | Whether this category is current |

### lesson_impact_magnitude_dictionary

4 governed impact magnitude levels.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| magnitude_key | string | Yes | Magnitude identifier |
| magnitude_label | string | Yes | Display label (e.g., "Significant") |
| cost_threshold | string | No | Cost threshold description (e.g., "$50K–$200K") |
| schedule_threshold | string | No | Schedule threshold (e.g., "10–30 days") |
| magnitude_description | string | No | Full description |
| sort_order | number | Yes | Severity order (1=Minor, 4=Critical) |
| is_active | boolean | Yes | Whether this magnitude is current |

### lesson_phase_dictionary

7 governed construction lifecycle phases. Classified as Class X (cross-domain governed) in P1-A5. Values frozen; new phases additive only with operations SME approval.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| phase_key | string | Yes | Phase identifier (e.g., `preconstruction`, `construction`) |
| phase_label | string | Yes | Display label (e.g., "Pre-Construction") |
| phase_description | string | No | Scope description |
| sort_order | number | Yes | Lifecycle order (1=Pre-Construction, 7=Warranty) |
| is_active | boolean | Yes | Whether this phase is current |

### lessons_import_batch

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| batch_id | string | Yes | System-generated surrogate (opaque string); source filename is metadata only |
| project_id | string | No | FK to project |
| source_file_name | string | Yes | Original file name |
| import_status | string | Yes | pending, parsing, complete, failed |
| total_lessons | number | No | Lessons processed |
| uploaded_by | string | Yes | Uploader identity (UPN) |
| uploaded_at | datetime | Yes | Upload timestamp |
| parser_version | string | No | Parser version |

### lessons_import_finding

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| finding_id | string | Yes | Finding identifier |
| batch_id | string | Yes | FK to import batch |
| severity | string | Yes | error, warning, info |
| category | string | Yes | parse_error, validation_failure, taxonomy_mismatch |
| message | string | Yes | Description |

---

## Taxonomy / Classification Strategy

| Aspect | Rule |
|--------|------|
| **Governed categories** | 15 values in `lesson_category_dictionary`; canonical for filtering/analytics |
| **Raw preservation** | `category_raw` on lesson_record preserves source text |
| **Impact magnitudes** | 4 values in `lesson_impact_magnitude_dictionary` with cost/schedule thresholds |
| **Phases** | `phase_encountered_key` + `phase_encountered_raw` — 7 construction lifecycle phases governed as Class X in P1-A5 (preconstruction, design, procurement, construction, commissioning, closeout, warranty); A13 binds by `phase_encountered_key` FK |
| **Applicability** | Numeric 1–5 score directly on lesson_record |
| **Project classifications** | Delivery method, market sector, size band, complexity — stored on report, inherited to lessons for search |

---

## Lesson Content Strategy

| Aspect | Rule |
|--------|------|
| **Structured fields** | 5 canonical narrative components: situation, impact, root_cause, response, recommendation |
| **Composed narrative** | `composed_narrative` stores a combined searchable text (derived: concatenation of all 5 components) |
| **Both stored** | Per locked interview decision: structured fields for detailed analysis + composed narrative for full-text search and AI retrieval |
| **Source fidelity** | Each component field preserves the exact entered text from the workbook block |

---

## Supporting References Strategy

| Aspect | Rule |
|--------|------|
| **Simple text** | `supporting_reference_text` on lesson_record preserves the raw text from the workbook (e.g., "RFI-045, CO-012, photo folder: /site-photos/2024-08") |
| **Structured links** | `lesson_linked_reference` child records when references can be parsed or resolved to governed artifacts |
| **Reference types** | rfi, change_order, document, photo, schedule_snapshot, report, other |
| **Both supported** | Per locked interview decision: text field always populated from source; structured links added when resolvable |

---

## Report-to-Lesson Inheritance Strategy

| Report Field | Inherited to Lesson | Purpose |
|-------------|--------------------|---------|
| project_name_snapshot | project_name_inherited | Search/filter by project name without join |
| project_number_snapshot | project_number_inherited | Same |
| market_sector | market_sector_inherited | Portfolio search by sector |
| delivery_method | delivery_method_inherited | Portfolio search by delivery method |
| project_size_band | project_size_band_inherited | Portfolio search by project size |
| report_date | report_date_inherited | Temporal filtering |

This denormalization ensures each `lesson_record` is self-contained for search and portfolio analytics without requiring a join to the parent report.

---

## Search / Filter / Reporting Role

| Dimension | Treatment |
|-----------|-----------|
| **Filterable by** | project, market_sector, delivery_method, project_size, category, phase_encountered, impact_magnitude, applicability, keyword |
| **Full-text search** | `composed_narrative` + `recommendation_text` + keyword values |
| **Reportable** | Lesson count by category/project/sector, impact distribution, most common root causes, recommendation patterns |
| **Dashboard** | Portfolio lessons knowledge base, category heatmap, impact magnitude distribution |
| **AI/context** | Lesson records feed AI recommendations for similar project situations; composed narratives enable RAG retrieval |
| **Analytics** | Portfolio-wide lesson trends, cross-project pattern detection, recurring issue identification |

---

## Storage Boundary Alignment

| Data | Storage | Authority | P1-A1/A2 Alignment |
|------|---------|-----------|---------------------|
| Category, magnitude, + phase dictionaries | SharePoint List (hub site, shared) | Authoritative reference | Shared reference per P1-A1 |
| Report instances | SharePoint List (project site) | Authoritative project data | Aligns with P1-A1 |
| Lesson records | SharePoint List (project site) | Authoritative child records | Same |
| Keywords | SharePoint List (project site) | Authoritative child records | Same |
| Linked references | SharePoint List (project site) | Authoritative child records | Same |
| Import batches | Azure Table Storage | Operational state | Default per Import-State Platform Standard in P1-A2 |

---

## Open Decisions / Future Expansion

### Closed by This Version

| Decision | Resolution |
|----------|-----------|
| **Phase dictionary governance** | Closed — 7 construction lifecycle phases (preconstruction, design, procurement, construction, commissioning, closeout, warranty) promoted to Class X in P1-A5. A13 binds by `phase_encountered_key` FK. `lesson_phase_dictionary` entity added (entity #7). |

### Remaining Open

| Decision | Scope | Owner | Target |
|----------|-------|-------|--------|
| **AI-powered lesson retrieval** | Build RAG retrieval using composed narratives and keyword vectors | Platform Architecture + AI | Phase 3+ |
| **Cross-project lesson linking** | Link lessons across projects when the same root cause applies | Platform Architecture | Phase 3 |
| **Lesson approval workflow** | Formal review/approval before lessons enter the portfolio knowledge base | Operations | Phase 2 |
| **Keyword dictionary** | Evolve free-text keywords into governed tag taxonomy over time | Platform Architecture | Phase 2 |

---

## Decision Owners and Approval

| Role | Name | Approval Date |
|------|------|----------------|
| Platform Architecture Lead | — | — |
| Operations Lead | — | — |
| Knowledge Management Lead | — | — |

**Approval Status:** Pending — Schema defined; pending operational validation
**Comments:** Schema derived from SOP Lessons Learned workbook (3 sheets, 15 categories, 4 impact magnitudes, 7 lifecycle phases, ~10 lesson slots per report, 15-column database model). All 4 locked interview decisions encoded. Phase dictionary governance frozen — 7 construction lifecycle phases governed as Class X in P1-A5. 9 canonical entities.

---

## Revision History

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 0.1 | 2026-03-17 | Architecture | Initial schema; 8 canonical entities (report instance, lesson record, keyword, linked reference, category dictionary, impact magnitude dictionary, import batch/finding). Report+child lesson model with inherited search metadata, structured lesson components + composed narrative, governed taxonomy + raw preservation, text + structured reference support. Evidence-based from SOP Lessons Learned workbook. All 4 locked interview decisions encoded. |
| 0.2 | 2026-03-17 | Architecture | Aligned storage boundary references with P1-A2 Import-State Platform Standard. |
| 0.3 | 2026-03-17 | Architecture | Added 3 missing person key fields (`project_manager_key`, `superintendent_key`, `project_executive_key`) to `lessons_report_instance` per P1-A2 Person Identity Resolution Platform Standard completeness requirement. Display-only person fields are not compliant; every person-attributed field must have both `_key` and `_display`. |
| 0.4 | 2026-03-17 | Architecture | Phase dictionary governance freeze. Added `lesson_phase_dictionary` entity (#7, 9 total entities). 7 construction lifecycle phases (preconstruction → warranty) promoted to Class X in P1-A5. Updated `phase_encountered_key` to FK binding. Closed Phase dictionary governance open decision. |
