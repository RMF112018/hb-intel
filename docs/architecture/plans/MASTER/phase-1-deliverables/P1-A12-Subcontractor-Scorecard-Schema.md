# P1-A12: Subcontractor Scorecard Schema

**Document ID:** P1-A12
**Phase:** 1 (Foundation)
**Classification:** Internal — Engineering
**Status:** Draft
**Date:** 2026-03-17
**Read With:** [P1-A1-Data-Ownership-Matrix.md](./P1-A1-Data-Ownership-Matrix.md), [P1-A2-Source-of-Record-Register.md](./P1-A2-Source-of-Record-Register.md), [P1-A3-SharePoint-Lists-Libraries-Schema-Register.md](./P1-A3-SharePoint-Lists-Libraries-Schema-Register.md)

---

## Purpose

Define the canonical schema for **subcontractor performance scorecards** — a governed rubric-based evaluation system that scores subcontractors per-project across weighted sections and criteria, captures re-bid recommendations and narrative summaries, and supports portfolio-level performance aggregation.

Each project evaluates each subcontractor using a governed rubric. Multiple evaluations per subcontractor per project are supported; one evaluation is designated as the **official final scorecard** for aggregation and long-term performance history.

---

## Source Workbook Analysis

**File:** `docs/reference/example/06 20260307_SOP_SubScorecard-DRAFT.xlsx`

| Property | Value |
|----------|-------|
| Sheets | 2: `Scorecard` (evaluation form), `Aggregation Dashboard` (portfolio database) |
| Scorecard rows | 91 |
| Sections | 6 weighted sections |
| Total criteria | 29 |
| Score scale | 1–5 (with N/A option per criterion) |

### Rubric Sections

| Section | Weight | Criteria |
|---------|--------|----------|
| Safety & Compliance | 20% | 5 |
| Quality of Work | 20% | 5 |
| Schedule Performance | 20% | 5 |
| Cost Management | 15% | 5 |
| Communication & Management | 15% | 5 |
| Workforce & Labor | 10% | 4 |

### Criterion Columns

| Column | Content |
|--------|---------|
| A | Criterion number within section |
| B | Evaluation Criterion (description) |
| C | Scoring Notes / Evidence (guidance text) |
| D | Score (1–5) |
| E | N/A? |
| F | Weight (within section, e.g., 20 or 25) |
| G | Weighted Score (formula-derived) |
| H | Comments |

### Rating Bands

| Score Range | Rating |
|-------------|--------|
| 5 | Exceptional |
| 4 | Above Average |
| 3 | Satisfactory |
| 2 | Below Average |
| 1 | Unsatisfactory |

### Recommendation Values

`Yes` / `Yes with conditions` / `No`

### Narrative Blocks (4)

1. Key Strengths
2. Areas for Improvement
3. Notable Incidents or Issues
4. Overall Narrative Summary

### Approvals (3)

| Role | Fields |
|------|--------|
| Project Manager | Signature + Date |
| Superintendent | Signature + Date |
| Project Executive | Approval + Date |

### Aggregation Dashboard

Portfolio-level database with per-evaluation rows: Subcontractor, Trade, Project, Date, Contract Value, 6 section scores, Overall Weighted Score, Rating Band.

---

## Canonical Entity Model

### Entity Summary

| # | Entity | Purpose |
|---|--------|---------|
| 1 | `scorecard_rubric_template` | Governed rubric definition |
| 2 | `scorecard_rubric_version` | Template version tracking |
| 3 | `scorecard_section_definition` | Section with weight within a rubric version |
| 4 | `scorecard_criterion_definition` | Criterion within a section |
| 5 | `scorecard_evaluation` | Per-project per-subcontractor evaluation instance |
| 6 | `criterion_score_record` | Per-criterion score child record |
| 7 | `section_score_summary` | Section-level score summary (derived + stored) |
| 8 | `overall_score_summary` | Overall weighted score + rating (derived + stored) |
| 9 | `scorecard_recommendation` | Re-bid recommendation + narrative blocks |
| 10 | `scorecard_approval` | Approval/signature records |
| 11 | `scorecard_import_batch` | Import provenance |
| 12 | `scorecard_import_finding` | Validation findings |

### scorecard_rubric_template

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| template_id | string | Yes | Rubric template identifier |
| template_name | string | Yes | Display name (e.g., "Subcontractor Performance Scorecard") |
| rubric_family | string | Yes | Family classification (e.g., "subcontractor_performance") |
| score_scale_min | number | Yes | Minimum score (1) |
| score_scale_max | number | Yes | Maximum score (5) |
| is_active | boolean | Yes | Whether this is the current active template |
| created_at | datetime | Yes | Creation timestamp |
| created_by | string | Yes | Creator identity (UPN) |

### scorecard_rubric_version

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| version_id | string | Yes | Version identifier |
| template_id | string | Yes | FK to scorecard_rubric_template |
| version_number | number | Yes | Sequential version number |
| effective_date | date | No | When this version became effective |
| is_current | boolean | Yes | Whether this is the current version |
| notes | text | No | Version notes |

### scorecard_section_definition

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| section_id | string | Yes | Section identifier |
| version_id | string | Yes | FK to scorecard_rubric_version |
| section_label | string | Yes | Section name (e.g., "Safety & Compliance") |
| section_weight_pct | number | Yes | Section weight as percentage (e.g., 20) |
| display_order | number | Yes | Sort position |
| is_active | boolean | Yes | Whether this section is in the active rubric |

### scorecard_criterion_definition

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| criterion_id | string | Yes | Criterion identifier |
| section_id | string | Yes | FK to scorecard_section_definition |
| criterion_number | number | Yes | Position within section (1, 2, 3...) |
| criterion_label | string | Yes | Evaluation criterion text |
| scoring_guidance | string | No | Evidence/guidance notes for evaluators |
| criterion_weight | number | Yes | Weight within section (e.g., 20 out of 100) |
| allows_na | boolean | Yes | Whether N/A is permitted |
| display_order | number | Yes | Sort position within section |
| is_active | boolean | Yes | Whether this criterion is in the active rubric |

### scorecard_evaluation

Per-project, per-subcontractor evaluation instance.

| Field | Type | Required | Key | Description |
|-------|------|----------|-----|-------------|
| evaluation_id | string | Yes | PK | HB Intel evaluation identifier |
| project_id | string | Yes | FK | FK to project domain |
| subcontractor_key | string | No | FK | Canonical subcontractor/vendor key when resolved; nullable if unresolved; `subcontractor_display_name` always populated; display text is not the join key (per A2 identity class H) |
| subcontractor_display_name | string | Yes | — | Non-authoritative display text; not a join key |
| trade_package | string | No | — | Trade/scope description |
| rubric_version_id | string | No | FK | FK to rubric version used |
| evaluation_type | string | No | — | `interim`, `final`, `closeout` |
| evaluation_status | string | Yes | — | `draft`, `in_progress`, `completed`, `approved` |
| official_final_flag | boolean | Yes | — | True if this is the designated official final scorecard for aggregation |
| evaluation_date | date | No | — | Date of evaluation |
| evaluator_display | string | No | — | Non-authoritative display text; not a join key |
| evaluator_key | string | No | — | Canonical person key (UPN when Entra-resolved; nullable if unresolved; `evaluator_display` always populated per A2 identity class G) |
| evaluator_title | string | No | — | Evaluator title |
| project_name_snapshot | string | No | — | Project name at evaluation time |
| project_number_snapshot | string | No | — | Project number at evaluation time |
| project_location_snapshot | string | No | — | Project location |
| project_type_snapshot | string | No | — | Project type |
| contract_value_snapshot | number | No | — | Contract value at evaluation |
| final_cost_snapshot | number | No | — | Final cost at evaluation |
| scheduled_completion_snapshot | date | No | — | Scheduled completion date |
| actual_completion_snapshot | date | No | — | Actual completion date |
| batch_id | string | No | FK | FK to import batch (null for app-created) |
| created_at | datetime | Yes | — | Record creation timestamp |
| updated_at | datetime | Yes | — | Last modification timestamp |
| notes | text | No | — | Evaluation-level notes |

### criterion_score_record

One per criterion per evaluation — the canonical scoring detail.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| score_record_id | string | Yes | Score record identifier |
| evaluation_id | string | Yes | FK to scorecard_evaluation |
| criterion_id | string | Yes | FK to scorecard_criterion_definition |
| score_raw | number | No | Score entered (1–5); null if N/A |
| na_flag | boolean | Yes | True if marked N/A |
| criterion_weight | number | Yes | Weight applied (inherited from rubric, may be adjusted if N/A redistribution) |
| weighted_score | number | No | Derived: score_raw × (criterion_weight / total_section_weight) |
| comments | string | No | Evaluator comments for this criterion |
| source_row_number | number | No | Source workbook row |

### section_score_summary

One per section per evaluation — derived from criterion scores, stored for reporting and workbook fidelity.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| summary_id | string | Yes | Summary record identifier |
| evaluation_id | string | Yes | FK to scorecard_evaluation |
| section_id | string | Yes | FK to scorecard_section_definition |
| section_average_score | number | No | Average of non-N/A criterion scores in this section |
| section_weighted_score | number | No | Section average × section weight percentage |
| criteria_scored_count | number | No | Number of criteria scored (non-N/A) |
| criteria_na_count | number | No | Number of criteria marked N/A |

### overall_score_summary

One per evaluation — derived from section summaries, stored for reporting and portfolio aggregation.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| overall_id | string | Yes | Overall record identifier |
| evaluation_id | string | Yes | FK to scorecard_evaluation (one-to-one) |
| overall_weighted_score | number | No | Sum of section weighted scores (max 5.00) |
| overall_rating_code | string | No | Rating band code: `exceptional`, `above_average`, `satisfactory`, `below_average`, `unsatisfactory` |
| overall_rating_label | string | No | Display label (e.g., "Exceptional") |
| source_overall_score | number | No | Raw workbook overall score (preserved for reconciliation) |

### scorecard_recommendation

One per evaluation — recommendation outcome + narrative blocks.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| recommendation_id | string | Yes | Recommendation record identifier |
| evaluation_id | string | Yes | FK to scorecard_evaluation (one-to-one) |
| rebid_recommendation_code | string | No | `yes`, `yes_with_conditions`, `no` |
| rebid_recommendation_label | string | No | Raw display text |
| strengths_summary | text | No | Key Strengths narrative |
| improvement_summary | text | No | Areas for Improvement narrative |
| incidents_issues_summary | text | No | Notable Incidents or Issues narrative |
| overall_summary | text | No | Overall Narrative Summary |

### scorecard_approval

One per approver role per evaluation — structured approval records.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| approval_id | string | Yes | Approval record identifier |
| evaluation_id | string | Yes | FK to scorecard_evaluation |
| approval_role | string | Yes | `project_manager`, `superintendent`, `project_executive` |
| approver_display | string | No | Non-authoritative display text; not a join key |
| approver_key | string | No | Canonical person key (UPN when Entra-resolved; nullable if unresolved; `approver_display` always populated per A2 identity class G) |
| approval_date | date | No | Date of approval |
| approval_status | string | No | `pending`, `approved`, `declined` |

### scorecard_import_batch

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| batch_id | string | Yes | System-generated surrogate (opaque string); source filename is metadata only |
| project_id | string | No | FK to project |
| source_file_name | string | Yes | Original file name |
| import_status | string | Yes | pending, parsing, complete, failed |
| total_evaluations | number | No | Evaluations processed |
| uploaded_by | string | Yes | Uploader identity (UPN) |
| uploaded_at | datetime | Yes | Upload timestamp |

### scorecard_import_finding

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| finding_id | string | Yes | Finding identifier |
| batch_id | string | Yes | FK to import batch |
| severity | string | Yes | error, warning, info |
| category | string | Yes | parse_error, calculation_mismatch, validation_failure |
| message | string | Yes | Description |

---

## Rubric / Version Strategy

| Aspect | Rule |
|--------|------|
| **Governed template** | `scorecard_rubric_template` + `scorecard_rubric_version` define the master rubric |
| **Section + criteria** | Sections and criteria are children of the version — changes create a new version |
| **Snapshot on evaluation** | Evaluations reference the `rubric_version_id` used; rubric changes don't retroactively affect completed evaluations |
| **Controlled overrides** | Future capability: evaluation-level criterion additions/overrides tracked as non-standard items with appropriate flagging |

---

## Scoring Strategy

| Aspect | Rule |
|--------|------|
| **Canonical detail** | `criterion_score_record` is the source-of-truth for all scoring |
| **Section summary** | `section_score_summary` stores derived section averages/weighted scores — recomputable from criteria but stored for reporting |
| **Overall summary** | `overall_score_summary` stores derived overall weighted score + rating — recomputable but stored for portfolio aggregation |
| **N/A handling** | N/A criteria are excluded from section average calculation; section weight may be redistributed or section scored only on valid criteria |
| **Workbook formulas** | Formula results are stored as `source_overall_score` for reconciliation; canonical values are independently derived |
| **Both stored + derivable** | Per locked interview decision: section/overall summaries stored for audit/reporting fidelity AND derivable from criterion records |

---

## Rating Band Strategy

| Overall Score | Rating Code | Label |
|--------------|-------------|-------|
| 4.5–5.0 | `exceptional` | Exceptional |
| 3.5–4.49 | `above_average` | Above Average |
| 2.5–3.49 | `satisfactory` | Satisfactory |
| 1.5–2.49 | `below_average` | Below Average |
| 1.0–1.49 | `unsatisfactory` | Unsatisfactory |

Rating bands are derived from the overall weighted score. Thresholds are governed and may be adjusted via rubric version.

---

## Recommendation / Narrative Strategy

| Aspect | Rule |
|--------|------|
| **Recommendation values** | Governed set: Yes, Yes with conditions, No |
| **Narrative blocks** | 4 free-text fields on `scorecard_recommendation` (strengths, improvement, incidents, overall) |
| **Portfolio use** | `rebid_recommendation_code` is the primary aggregation/reporting field for vendor qualification decisions |

---

## Approval Strategy

| Aspect | Rule |
|--------|------|
| **Structured records** | Each approval is a `scorecard_approval` child record (not a flat signature field) |
| **Three standard roles** | Project Manager, Superintendent, Project Executive |
| **Approval status** | pending → approved; declined is possible but exceptional |
| **Schema-only** | Approval workflow logic belongs in application layer, not schema definition |

---

## Evaluation Cadence / Official Final Strategy

| Aspect | Rule |
|--------|------|
| **Multiple per sub/project** | Multiple `scorecard_evaluation` records per (project_id, subcontractor_key) pair |
| **Official final** | One evaluation per subcontractor per project has `official_final_flag = true` |
| **Aggregation** | Portfolio dashboards and long-term performance history use only official final scorecards |
| **Interim vs final** | `evaluation_type` distinguishes interim from final/closeout evaluations |

---

## Search / Filter / Reporting Role

| Dimension | Treatment |
|-----------|-----------|
| **Filterable by** | project, subcontractor, trade, evaluation_type, evaluation_status, official_final_flag, overall_rating, rebid_recommendation |
| **Reportable** | Subcontractor performance trends, section score distributions, portfolio rating summaries, re-bid recommendation rates |
| **Dashboard** | Portfolio subcontractor performance leaderboard, section heatmaps, re-bid recommendation summary |
| **Analytics** | Cross-project subcontractor comparison, trade-level performance trends, section weakness identification |
| **AI context** | Scorecard data feeds subcontractor pre-qualification and bid evaluation recommendations |

---

## Storage Boundary Alignment

| Data | Storage | Authority | P1-A1/A2 Alignment |
|------|---------|-----------|---------------------|
| Rubric templates + versions | SharePoint List (hub site, shared) | Authoritative template library | Shared reference per P1-A1 |
| Section + criterion definitions | SharePoint List (hub site, shared) | Authoritative library items | Same |
| Rating bands + recommendation values | SharePoint List (hub site, shared) | Authoritative reference | Same |
| Evaluation instances | SharePoint List (project site) | Authoritative project data | Aligns with P1-A1 |
| Criterion scores | SharePoint List (project site) | Authoritative child records | Same |
| Section/overall summaries | SharePoint List (project site) | Derived + stored | Same |
| Recommendations + narratives | SharePoint List (project site) | Authoritative | Same |
| Approvals | SharePoint List (project site) | Authoritative | Same |
| Import batches | Azure Table Storage | Operational state | Aligns with P1-A1/A2 |

---

## Open Decisions / Future Expansion

| Decision | Scope | Owner | Target |
|----------|-------|-------|--------|
| **N/A weight redistribution** | Define exact formula for redistributing section weight when criteria are N/A | Platform Architecture + Operations | Phase 1 (late) |
| **Rating band thresholds** | Confirm exact score ranges for each rating band | Operations | Phase 1 (late) |
| **Subcontractor identity resolution** | Map subcontractor display names to canonical vendor keys from vendor registry | Platform Architecture | Phase 2 |
| **Cross-project aggregation engine** | Build portfolio-level scorecard aggregation from official final records | Platform Architecture | Phase 2–3 |
| **Rubric override governance** | Define controlled override/addition rules at evaluation-instance level | Operations | Phase 2 |

---

## Decision Owners and Approval

| Role | Name | Approval Date |
|------|------|----------------|
| Platform Architecture Lead | — | — |
| Operations Lead | — | — |
| Preconstruction / Purchasing Lead | — | — |

**Approval Status:** Pending — Schema defined; pending operational validation
**Comments:** Schema derived from SOP SubScorecard workbook (2 sheets, 6 sections, 29 criteria, 12 entities). All 4 locked interview decisions encoded.

---

## Revision History

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 0.1 | 2026-03-17 | Architecture | Initial schema; 12 canonical entities (rubric template/version/section/criterion, evaluation, criterion score, section summary, overall summary, recommendation, approval, import batch/finding). 6 weighted sections, 29 criteria, 1-5 scale with N/A, 3 approval roles, 4 narrative blocks, official-final designation for portfolio aggregation. Evidence-based from SOP SubScorecard workbook. All 4 locked interview decisions encoded. |
