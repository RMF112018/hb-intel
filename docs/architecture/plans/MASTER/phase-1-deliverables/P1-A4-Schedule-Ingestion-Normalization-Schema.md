# P1-A4: Schedule Ingestion & Normalization Schema

**Document ID:** P1-A4
**Phase:** 1 (Foundation)
**Classification:** Internal — Engineering
**Status:** Draft
**Date:** 2026-03-17
**Read With:** [P1-A1-Data-Ownership-Matrix.md](./P1-A1-Data-Ownership-Matrix.md), [P1-A2-Source-of-Record-Register.md](./P1-A2-Source-of-Record-Register.md), [P1-A3-SharePoint-Lists-Libraries-Schema-Register.md](./P1-A3-SharePoint-Lists-Libraries-Schema-Register.md)

---

## Purpose

Define the ingestion pipeline architecture, canonical entity model, format detection rules, source-to-canonical mapping strategy, and drift-handling approach required to support construction schedule file uploads in HB Intel.

Construction schedule files are exported from multiple programs (Primavera P6, Microsoft Project, and others) in multiple formats (CSV, XML, XER) with field sets that vary by source program, program version, export template, and end-user export choices. A single fixed-column schema cannot absorb this variability. This document establishes a canonical normalized schedule model that ingestion parsers map into regardless of source format.

---

## Relationship to P1-A1 / P1-A2 / P1-A3

| Artifact | Role | This Document's Relationship |
|----------|------|------------------------------|
| **P1-A1** Data Ownership Matrix | Governance-level data ownership and field-level authority | P1-A4 canonical entities align with the `schedule` domain in P1-A1. Storage-boundary decisions here respect P1-A1 platform authority. |
| **P1-A2** Source-of-Record Register | Adapter paths, identity keys, write safety classes | Schedule data enters via upload, not direct SharePoint CRUD. P1-A2's adapter pattern applies post-normalization when canonical entities are persisted. |
| **P1-A3** SharePoint Schema Register | Physical SharePoint container definitions | P1-A3 defines the SharePoint lists/libraries that store canonical schedule entities. P1-A4 defines what goes into those containers. |

**Reading order:** P1-A1 → P1-A2 → P1-A4 → P1-A3 (for schedule domain).

---

## Scope and Non-Scope

### In Scope
- Source format classification and detection rules (CSV, MS Project XML, P6 XML, P6 XER)
- Ingestion pipeline layer architecture (raw → parsed → canonical → mapping/provenance)
- Canonical normalized schedule entity model
- Source-to-canonical field mapping per format
- Schema drift and unmapped-field handling strategy
- Provenance, parser version, and import-finding tracking
- Storage-boundary alignment with P1-A1/P1-A2

### Out of Scope
- Parser implementation code (belongs in adapter/package code)
- SharePoint physical container definitions (P1-A3)
- Data ownership governance decisions (P1-A1)
- Adapter path and write-safety design (P1-A2)
- Real-time schedule calculation or CPM engine design
- Schedule comparison / version-diff logic (future phase)

---

## Source Format Analysis

### Evidence Base

Analysis performed on three example files in `docs/reference/example/`:

| File | Format | Source Program | Lines | Structure |
|------|--------|----------------|-------|-----------|
| `Project_Schedule.csv` | CSV (tab/comma-delimited) | Primavera P6 flat export | 1,176 | Flat two-header-row table; denormalized relationships in text columns |
| `Project_Schedule.xml` | Microsoft Project XML | MS Project 2016+ (SaveVersion 12) | 12,313 | Hierarchical XML; embedded relationships, multiple baselines, extended attributes |
| `Project_Schedule.xer` | Primavera P6 XER | P6 native export | 580 | Tab-delimited normalized tables (%T/%F/%R format); 15+ tables |

### Concept Coverage by Format

| Schedule Concept | CSV | MS Project XML | P6 XER |
|-----------------|-----|----------------|--------|
| Projects | Implied (single) | Yes (Project element) | Yes (PROJECT table) |
| Activities / Tasks | Yes (flat rows) | Yes (hierarchical Tasks) | Yes (TASK table) |
| Activity Codes / IDs | Yes (task_code) | Yes (Name, UID) | Yes (task_code, task_id) |
| WBS | Yes (wbs_id, flat) | Yes (WBS element, OutlineLevel) | Yes (PROJWBS table, hierarchical) |
| Calendars | Yes (clndr_id ref) | Yes (Calendar definitions) | Yes (CALENDAR table with encoded data) |
| Resources | Minimal (resource_list text) | Yes (Resource elements with rates) | Yes (RSRC, RSRCRATE tables) |
| Resource Assignments | No | Yes (embedded in Tasks) | Yes (TASKRSRC table) |
| Relationships / Links | Yes (pred_list, succ_list text) | Yes (PredecessorLink elements) | Yes (TASKPRED table) |
| Relationship Types | Yes (FS/SS/FF/SF) | Yes (Type code) | Yes (pred_type) |
| Lag | Implied in succ_details | Yes (Lag, LagFormat) | Yes (lag_hr_cnt) |
| Baselines | Yes (2 date pairs) | Yes (multiple numbered, 0–10) | Not in this export (optional P6 tables) |
| Activity Codes (categorization) | Implied in code prefixes | Yes (OutlineCodes, ExtendedAttribute) | Yes (ACTVCODE, ACTVTYPE, TASKACTV) |
| UDFs / Custom Fields | No | Yes (ExtendedAttribute by FieldID) | Yes (UDFTYPE, UDFVALUE) |
| Constraints | Yes (cstr_type, cstr_type2) | Yes (ConstraintType, ConstraintDate) | Yes (cstr_type, cstr_date) |
| Float / Slack | Yes (hours) | Yes (FreeSlack, TotalSlack minutes) | Yes (hours) |
| % Complete | No | Yes (PercentComplete, PhysicalPercentComplete) | Yes (phys_complete_pct, complete_pct_type) |
| Effort / Work | Implicit in duration | Yes (Work, ActualWork, RemainingWork) | Yes (act_work_qty, remain_work_qty) |
| Cost | No | Yes (FixedCost per task) | Yes (TASKRSRC cost fields) |
| OBS (Org Breakdown) | No | No | Yes (OBS table) |

### Why a Fixed Flat Schema Is Insufficient

1. **Structural divergence:** CSV is flat rows; XML is hierarchical with embedded children; XER is multi-table normalized. A single column set cannot represent all three.
2. **Concept coverage varies:** Resources and assignments are rich in XML/XER but minimal in CSV. Baselines exist differently in each. UDFs/codes use entirely different patterns.
3. **Relationship representation differs:** CSV denormalizes predecessors into text; XML embeds PredecessorLink elements; XER uses a separate TASKPRED table.
4. **Units differ:** Float is in hours (CSV/XER) vs minutes (XML). Duration uses raw numbers (CSV/XER) vs ISO 8601 (XML).
5. **Export variability:** Users control which fields are exported. A CSV from one user may have 24 columns; another may have 40 or 12.

---

## Source Format Classification and Detection Rules

### Detection by Content (not just extension)

| Detection Signal | Format | Source Program |
|-----------------|--------|----------------|
| File starts with `ERMHDR` | XER | Primavera P6 |
| Root XML element `<Project xmlns="http://schemas.microsoft.com/project">` | MS Project XML | Microsoft Project |
| Root XML element `<APIBusinessObjects>` or P6-specific namespace | P6 XML | Primavera P6 (XML export) |
| First non-empty line is parseable as delimited header row (no XML declaration, no ERMHDR) | CSV | Varies (often P6 tabular export) |

### XML Dialect Detection

XML files must be classified by namespace/root element, not file extension:

```
if root == "Project" and namespace contains "schemas.microsoft.com/project":
    → MS Project XML
elif root == "APIBusinessObjects" or namespace contains "oracle" or "primavera":
    → P6 XML
else:
    → Unknown XML (log warning, attempt best-effort parse)
```

### Version Detection

| Format | Version Signal |
|--------|---------------|
| MS Project XML | `<SaveVersion>` element (12 = 2016+, 14 = 2019+) |
| P6 XER | ERMHDR line field 2 (e.g., `7.0`) |
| P6 XML | Schema version in API response metadata |
| CSV | No version signal; infer from column headers |

---

## Ingestion Pipeline Layers

### Layer 1: Raw Upload

**Purpose:** Retain the original uploaded file untouched for audit, re-parse, and provenance.

| Aspect | Decision |
|--------|----------|
| Storage | SharePoint Document Library (per-project site, "Schedule Uploads" library) |
| Retention | Follows parent project record (per P1-A1 retention class) |
| Metadata captured | file name, file size, upload timestamp, uploader identity, detected format, detected source program, detected version |
| Authority | Authoritative raw source; immutable after upload |

### Layer 2: Parsed Source

**Purpose:** Parse the raw file into format-native structures without normalization. This layer preserves every field the source file contains, in the source's own structure.

| Aspect | Decision |
|--------|----------|
| Storage | Transient / in-memory during processing; optionally persisted to Azure Table Storage if re-parse cost is high |
| Structure | Format-specific: CSV rows, XML DOM/SAX tree, XER table set |
| Retention | Short-lived operational (unless persisted for debugging) |
| Authority | Derived from raw file; not authoritative for business queries |

### Layer 3: Canonical Normalized

**Purpose:** Map parsed source structures into stable canonical schedule entities that business logic, search, analytics, and UI consume.

| Aspect | Decision |
|--------|----------|
| Storage | SharePoint Lists (per-project site) — aligned with P1-A1 `schedule` domain |
| Structure | Canonical entity model defined below |
| Retention | Follows parent project record |
| Authority | Authoritative for schedule business data within HB Intel (per P1-A1) |

### Layer 4: Mapping / Provenance / Drift

**Purpose:** Record how source fields mapped to canonical fields, preserve unmapped/extra source fields, and track parser/mapping version.

| Aspect | Decision |
|--------|----------|
| Storage | Azure Table Storage (operational state, per P1-A1/P1-A2 storage boundary) |
| Structure | Mapping records, drift records, import findings |
| Retention | Audit retention |
| Authority | Operational metadata; not authoritative for business data |

---

## Canonical Entity Model

### Entity Summary

| # | Entity | Purpose | Source Coverage |
|---|--------|---------|----------------|
| 1 | `schedule_import_batch` | Tracks each upload/import operation | All formats |
| 2 | `schedule_project` | Top-level project record from the schedule file | XML, XER; implied in CSV |
| 3 | `schedule_calendar` | Working calendar definitions | XML, XER; ref only in CSV |
| 4 | `schedule_wbs_node` | Work breakdown structure hierarchy | XML (OutlineLevel), XER (PROJWBS), CSV (wbs_id) |
| 5 | `schedule_activity` | Core activity/task records | All formats |
| 6 | `schedule_relationship` | Predecessor/successor links with type and lag | All formats |
| 7 | `schedule_resource` | Resource definitions | XML (Resource), XER (RSRC) |
| 8 | `schedule_resource_rate` | Resource rate tables | XML (Rates), XER (RSRCRATE) |
| 9 | `schedule_assignment` | Resource-to-activity assignments | XML (embedded), XER (TASKRSRC) |
| 10 | `schedule_baseline` | Baseline date/cost/work snapshots | XML (Baseline elements), CSV (primary_base dates) |
| 11 | `schedule_code_type` | Activity code type definitions | XML (OutlineCodes), XER (ACTVTYPE) |
| 12 | `schedule_code_value` | Activity code value hierarchies | XML (OutlineCode values), XER (ACTVCODE) |
| 13 | `schedule_activity_code_assignment` | Many-to-many activity-to-code links | XML (ExtendedAttribute), XER (TASKACTV) |
| 14 | `schedule_udf_definition` | Custom/extended field definitions | XML (ExtendedAttribute schema), XER (UDFTYPE) |
| 15 | `schedule_udf_value` | Custom/extended field values | XML (ExtendedAttribute values), XER (UDFVALUE) |
| 16 | `import_finding` | Warnings, errors, validation findings from import | All formats |

### Entity Field Definitions

#### schedule_import_batch

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| batch_id | string | Yes | System-generated surrogate (opaque string); source filename is metadata only |
| project_id | string | Yes | FK to project domain |
| source_file_name | string | Yes | Original uploaded file name |
| source_file_url | string | Yes | SharePoint document library URL |
| detected_format | string | Yes | csv, msproject_xml, p6_xml, p6_xer |
| detected_source_program | string | No | Microsoft Project, Primavera P6, Unknown |
| detected_source_version | string | No | SaveVersion, ERMHDR version, or null |
| parser_version | string | Yes | Version of the HB Intel parser used |
| mapping_version | string | Yes | Version of the source-to-canonical mapping rules |
| import_status | string | Yes | pending, parsing, mapping, complete, failed |
| total_activities_parsed | number | No | Count after parsing |
| total_activities_mapped | number | No | Count after canonical mapping |
| total_warnings | number | No | Count of non-fatal findings |
| total_errors | number | No | Count of fatal findings |
| uploaded_by | string | Yes | Uploader identity (UPN) |
| uploaded_at | datetime | Yes | Upload timestamp |
| completed_at | datetime | No | Processing completion timestamp |
| notes | text | No | Import notes or operator comments |

#### schedule_project

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| record_id | string | Yes | HB Intel canonical project-schedule ID |
| batch_id | string | Yes | FK to schedule_import_batch |
| project_id | string | Yes | FK to project domain |
| source_project_id | string | No | Native project ID from source (proj_id in XER, Name in XML) |
| project_name | string | No | Schedule project name from source |
| plan_start_date | date | No | Planned start from source |
| plan_end_date | date | No | Planned end / data date from source |
| status_date | date | No | Status / data date |
| calendar_id | string | No | Default calendar reference |
| critical_path_type | string | No | Critical path calculation method (P6-specific) |
| source_metadata_json | text | No | Preserved source-specific project-level fields not mapped to canonical columns |

#### schedule_calendar

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| record_id | string | Yes | HB Intel canonical calendar ID |
| batch_id | string | Yes | FK to schedule_import_batch |
| source_calendar_id | string | No | Native calendar ID from source |
| calendar_name | string | Yes | Calendar display name |
| calendar_type | string | No | Standard, Project, Resource, Global |
| is_default | boolean | No | Whether this is the project default calendar |
| working_days_pattern | text | No | Encoded working days (e.g., Mon–Fri, 5D, 7D) |
| exceptions_json | text | No | Holiday/exception dates in JSON |
| source_calendar_data | text | No | Raw calendar data for formats with encoded rules (P6) |

#### schedule_wbs_node

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| record_id | string | Yes | HB Intel canonical WBS node ID |
| batch_id | string | Yes | FK to schedule_import_batch |
| source_wbs_id | string | No | Native WBS ID from source |
| parent_wbs_id | string | No | FK to parent schedule_wbs_node (self-referential) |
| wbs_code | string | No | WBS short code |
| wbs_name | string | Yes | WBS node name |
| outline_level | number | No | Hierarchy depth level |
| sequence | number | No | Sort order within parent |
| is_project_node | boolean | No | Whether this is the root project WBS node |

#### schedule_activity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| record_id | string | Yes | HB Intel canonical activity ID |
| batch_id | string | Yes | FK to schedule_import_batch |
| wbs_id | string | No | FK to schedule_wbs_node |
| calendar_id | string | No | FK to schedule_calendar |
| source_activity_id | string | No | Native activity/task ID from source |
| activity_code | string | No | Activity code (task_code in P6, WBS in MSP) |
| activity_name | string | Yes | Activity name |
| activity_type | string | No | Task type (task_dependent, resource_dependent, etc.) |
| status | string | No | Completed, In Progress, Not Started |
| is_milestone | boolean | No | Whether this is a milestone activity |
| is_summary | boolean | No | Whether this is a summary/hammock task |
| planned_start | date | No | Target/planned start date |
| planned_finish | date | No | Target/planned finish date |
| actual_start | date | No | Actual start date |
| actual_finish | date | No | Actual finish date |
| early_start | date | No | Calculated early start |
| early_finish | date | No | Calculated early finish |
| late_start | date | No | Calculated late start |
| late_finish | date | No | Calculated late finish |
| planned_duration_hours | number | No | Target duration in hours (normalized from source units) |
| actual_duration_hours | number | No | Actual duration in hours |
| remaining_duration_hours | number | No | Remaining duration in hours |
| total_float_hours | number | No | Total float/slack in hours |
| free_float_hours | number | No | Free float/slack in hours |
| percent_complete | number | No | Schedule % complete (0–100) |
| physical_percent_complete | number | No | Physical % complete where available |
| constraint_type | string | No | Constraint type code |
| constraint_date | date | No | Constraint date |
| constraint_type_2 | string | No | Secondary constraint (P6) |
| constraint_date_2 | date | No | Secondary constraint date |
| planned_work_hours | number | No | Target work/effort in hours |
| actual_work_hours | number | No | Actual work in hours |
| remaining_work_hours | number | No | Remaining work in hours |
| fixed_cost | number | No | Fixed cost (MS Project) |
| is_critical | boolean | No | Whether on critical path |
| is_driving_path | boolean | No | Driving path flag (P6-specific) |
| suspend_date | date | No | Suspend date (P6-specific) |
| resume_date | date | No | Resume date (P6-specific) |
| source_extras_json | text | No | Preserved source-specific fields not mapped to canonical columns |

#### schedule_relationship

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| record_id | string | Yes | HB Intel canonical relationship ID |
| batch_id | string | Yes | FK to schedule_import_batch |
| predecessor_activity_id | string | Yes | FK to schedule_activity (predecessor) |
| successor_activity_id | string | Yes | FK to schedule_activity (successor) |
| relationship_type | string | Yes | FS (Finish-to-Start), SS, FF, SF |
| lag_hours | number | No | Lag duration in hours (positive = lag, negative = lead) |
| source_relationship_id | string | No | Native relationship ID from source |

#### schedule_resource

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| record_id | string | Yes | HB Intel canonical resource ID |
| batch_id | string | Yes | FK to schedule_import_batch |
| source_resource_id | string | No | Native resource ID from source |
| resource_name | string | Yes | Resource name |
| resource_short_name | string | No | Abbreviation/initials |
| resource_type | string | No | Work, Material, Cost |
| email | string | No | Resource email if available |
| is_active | boolean | No | Active flag |
| source_extras_json | text | No | Preserved source-specific resource fields |

#### schedule_resource_rate

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| record_id | string | Yes | HB Intel canonical rate ID |
| resource_id | string | Yes | FK to schedule_resource |
| effective_date | date | No | Rate effective date |
| standard_rate | number | No | Standard rate |
| overtime_rate | number | No | Overtime rate |
| cost_per_use | number | No | Cost per use |
| rate_table | string | No | Rate table identifier (A, B, C, etc.) |

#### schedule_assignment

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| record_id | string | Yes | HB Intel canonical assignment ID |
| batch_id | string | Yes | FK to schedule_import_batch |
| activity_id | string | Yes | FK to schedule_activity |
| resource_id | string | Yes | FK to schedule_resource |
| planned_units | number | No | Target quantity/units |
| actual_units | number | No | Actual quantity/units |
| remaining_units | number | No | Remaining quantity/units |
| planned_cost | number | No | Target cost |
| actual_cost | number | No | Actual cost |
| remaining_cost | number | No | Remaining cost |
| planned_start | date | No | Assignment planned start |
| planned_finish | date | No | Assignment planned finish |
| actual_start | date | No | Assignment actual start |
| actual_finish | date | No | Assignment actual finish |

#### schedule_baseline

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| record_id | string | Yes | HB Intel canonical baseline ID |
| batch_id | string | Yes | FK to schedule_import_batch |
| activity_id | string | Yes | FK to schedule_activity |
| baseline_number | number | Yes | Baseline index (0 = primary, 1–10 for additional) |
| baseline_start | date | No | Baseline start date |
| baseline_finish | date | No | Baseline finish date |
| baseline_duration_hours | number | No | Baseline duration in hours |
| baseline_work_hours | number | No | Baseline work in hours |
| baseline_cost | number | No | Baseline cost |

#### schedule_code_type

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| record_id | string | Yes | HB Intel canonical code type ID |
| batch_id | string | Yes | FK to schedule_import_batch |
| source_code_type_id | string | No | Native code type ID |
| code_type_name | string | Yes | Code type name (e.g., Phase, Area, Discipline) |
| code_type_scope | string | No | Global, Project, WBS-level |
| max_length | number | No | Max code length if defined |

#### schedule_code_value

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| record_id | string | Yes | HB Intel canonical code value ID |
| code_type_id | string | Yes | FK to schedule_code_type |
| source_code_value_id | string | No | Native code value ID |
| code_value | string | Yes | Code short name/value |
| code_description | string | No | Code description/long name |
| parent_code_value_id | string | No | FK to parent schedule_code_value (hierarchical codes) |
| sequence | number | No | Sort order |

#### schedule_activity_code_assignment

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| record_id | string | Yes | HB Intel canonical assignment ID |
| activity_id | string | Yes | FK to schedule_activity |
| code_type_id | string | Yes | FK to schedule_code_type |
| code_value_id | string | Yes | FK to schedule_code_value |

#### schedule_udf_definition

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| record_id | string | Yes | HB Intel canonical UDF definition ID |
| batch_id | string | Yes | FK to schedule_import_batch |
| source_udf_id | string | No | Native UDF type ID |
| udf_name | string | Yes | UDF field name |
| udf_label | string | No | UDF display label |
| target_entity | string | Yes | Which entity this UDF applies to (activity, resource, project, etc.) |
| data_type | string | Yes | text, number, date, cost, indicator |

#### schedule_udf_value

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| record_id | string | Yes | HB Intel canonical UDF value ID |
| udf_definition_id | string | Yes | FK to schedule_udf_definition |
| entity_id | string | Yes | FK to the target entity record |
| text_value | string | No | Text value (when data_type = text) |
| number_value | number | No | Number value |
| date_value | date | No | Date value |

#### import_finding

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| record_id | string | Yes | HB Intel finding ID |
| batch_id | string | Yes | FK to schedule_import_batch |
| severity | string | Yes | error, warning, info |
| category | string | No | parse_error, mapping_warning, validation_failure, drift_detected, unmapped_field |
| entity_type | string | No | Which canonical entity the finding relates to |
| source_reference | string | No | Source table/element/row reference |
| message | string | Yes | Human-readable finding description |
| field_name | string | No | Source or canonical field name |
| source_value | string | No | The problematic value from source |

---

## Source-to-Canonical Mapping Model

### Mapping Strategy

Each source format has a dedicated mapping definition that transforms source-native structures into canonical entities. Mappings are versioned and stored as configuration, not hard-coded.

### CSV → Canonical Mapping (P6 Flat Export)

| CSV Column | Canonical Entity | Canonical Field | Transform Notes |
|------------|-----------------|-----------------|-----------------|
| task_code | schedule_activity | activity_code | Direct |
| status_code | schedule_activity | status | Map: Completed → Completed, TK_Active → In Progress, etc. |
| wbs_id | schedule_wbs_node | wbs_code | Parse hierarchical code into WBS tree |
| task_name | schedule_activity | activity_name | Direct |
| target_drtn_hr_cnt | schedule_activity | planned_duration_hours | Direct (already hours) |
| remain_drtn_hr_cnt | schedule_activity | remaining_duration_hours | Direct |
| act_drtn_hr_cnt | schedule_activity | actual_duration_hours | Direct |
| primary_base_start_date | schedule_baseline | baseline_start | baseline_number = 0 |
| target_start_date | schedule_activity | planned_start | Parse date format |
| start_date | schedule_activity | actual_start | If status = Completed or In Progress |
| primary_base_end_date | schedule_baseline | baseline_finish | baseline_number = 0 |
| target_end_date | schedule_activity | planned_finish | Parse date format |
| end_date | schedule_activity | actual_finish | If status = Completed |
| remain_float_hr_cnt | schedule_activity | total_float_hours | Direct |
| free_float_hr_cnt | schedule_activity | free_float_hours | Direct |
| task_type | schedule_activity | activity_type | Map P6 type codes |
| pred_list | schedule_relationship | predecessor_activity_id | Parse comma-separated codes; create one relationship per predecessor |
| succ_list | schedule_relationship | successor_activity_id | Parse; extract relationship types (FS, SS, FF, SF) |
| clndr_id | schedule_calendar | calendar_name | Lookup/create calendar record |
| resource_list | schedule_assignment | resource_id | Parse; minimal data available |
| cstr_type | schedule_activity | constraint_type | Map P6 constraint codes |
| cstr_type2 | schedule_activity | constraint_type_2 | Map P6 constraint codes |

### MS Project XML → Canonical Mapping

| XML Path | Canonical Entity | Canonical Field | Transform Notes |
|----------|-----------------|-----------------|-----------------|
| Task/UID | schedule_activity | source_activity_id | Direct |
| Task/Name | schedule_activity | activity_name | Direct |
| Task/WBS | schedule_activity | activity_code | Direct |
| Task/OutlineLevel | schedule_wbs_node | outline_level | Build WBS tree from outline hierarchy |
| Task/Start | schedule_activity | planned_start | Parse ISO datetime |
| Task/Finish | schedule_activity | planned_finish | Parse ISO datetime |
| Task/Duration | schedule_activity | planned_duration_hours | Convert ISO 8601 duration (PT...H...M...S) to hours |
| Task/ActualStart | schedule_activity | actual_start | Parse ISO datetime |
| Task/ActualFinish | schedule_activity | actual_finish | Parse ISO datetime |
| Task/FreeSlack | schedule_activity | free_float_hours | Convert minutes to hours (÷ 60) |
| Task/TotalSlack | schedule_activity | total_float_hours | Convert minutes to hours (÷ 60) |
| Task/PercentComplete | schedule_activity | percent_complete | Direct |
| Task/PhysicalPercentComplete | schedule_activity | physical_percent_complete | Direct |
| Task/Milestone | schedule_activity | is_milestone | Direct boolean |
| Task/Summary | schedule_activity | is_summary | Direct boolean |
| Task/PredecessorLink/PredecessorUID | schedule_relationship | predecessor_activity_id | Resolve UID to canonical ID |
| Task/PredecessorLink/Type | schedule_relationship | relationship_type | Map: 0=FF, 1=FS, 2=SF, 3=SS |
| Task/PredecessorLink/LinkLag | schedule_relationship | lag_hours | Convert tenths-of-minutes to hours |
| Task/Baseline/* | schedule_baseline | baseline_start/finish/etc. | One record per Baseline element; baseline_number from Number attribute |
| Task/ExtendedAttribute | schedule_udf_value | text/number/date_value | Map by FieldID to schedule_udf_definition |
| Calendar/* | schedule_calendar | * | Map calendar structure |
| Resource/* | schedule_resource | * | Map resource fields |

### P6 XER → Canonical Mapping

| XER Table.Field | Canonical Entity | Canonical Field | Transform Notes |
|-----------------|-----------------|-----------------|-----------------|
| PROJECT.proj_id | schedule_project | source_project_id | Direct |
| PROJECT.proj_short_name | schedule_project | project_name | Direct |
| CALENDAR.clndr_id | schedule_calendar | source_calendar_id | Direct |
| CALENDAR.clndr_name | schedule_calendar | calendar_name | Direct |
| CALENDAR.clndr_data | schedule_calendar | source_calendar_data | Preserve encoded data |
| PROJWBS.wbs_id | schedule_wbs_node | source_wbs_id | Direct |
| PROJWBS.parent_wbs_id | schedule_wbs_node | parent_wbs_id | Resolve to canonical ID |
| PROJWBS.wbs_name | schedule_wbs_node | wbs_name | Direct |
| TASK.task_id | schedule_activity | source_activity_id | Direct |
| TASK.task_code | schedule_activity | activity_code | Direct |
| TASK.task_name | schedule_activity | activity_name | Direct |
| TASK.target_start_date | schedule_activity | planned_start | Parse date |
| TASK.target_end_date | schedule_activity | planned_finish | Parse date |
| TASK.act_start_date | schedule_activity | actual_start | Parse date |
| TASK.act_end_date | schedule_activity | actual_finish | Parse date |
| TASK.target_drtn_hr_cnt | schedule_activity | planned_duration_hours | Direct (already hours) |
| TASK.total_float_hr_cnt | schedule_activity | total_float_hours | Direct |
| TASK.free_float_hr_cnt | schedule_activity | free_float_hours | Direct |
| TASKPRED.pred_task_id | schedule_relationship | predecessor_activity_id | Resolve to canonical ID |
| TASKPRED.task_id | schedule_relationship | successor_activity_id | Resolve to canonical ID |
| TASKPRED.pred_type | schedule_relationship | relationship_type | Map: PR_FS, PR_SS, PR_FF, PR_SF |
| TASKPRED.lag_hr_cnt | schedule_relationship | lag_hours | Direct |
| RSRC.rsrc_id | schedule_resource | source_resource_id | Direct |
| RSRC.rsrc_name | schedule_resource | resource_name | Direct |
| TASKRSRC.* | schedule_assignment | * | Map qty, cost, date fields |
| ACTVTYPE.* | schedule_code_type | * | Map code type structure |
| ACTVCODE.* | schedule_code_value | * | Map code values with hierarchy |
| TASKACTV.* | schedule_activity_code_assignment | * | Map many-to-many |
| UDFTYPE.* | schedule_udf_definition | * | Map UDF definitions |
| UDFVALUE.* | schedule_udf_value | * | Map UDF values by fk_id |

---

## Drift and Unmapped Field Handling

### Strategy

| Situation | Handling |
|-----------|----------|
| **Expected field missing** | Log `import_finding` (warning); set canonical field to null; continue import |
| **Extra/unexpected field** | Preserve in `source_extras_json` on the nearest canonical entity; log info-level finding |
| **Renamed field** | Mapping definitions include known aliases; parser attempts alias match before logging unmapped |
| **Source-specific field with no canonical equivalent** | Preserve in `source_extras_json`; do not drop silently |
| **Type mismatch** (e.g., date in wrong format) | Attempt format detection/coercion; log warning if coerced; log error if unparseable |
| **Value outside expected range** | Map to canonical field; log validation warning |
| **Parser/version difference** | Mapping definitions are versioned; parser selects mapping version by detected source version |

### Unmapped Field Preservation

Each canonical entity with significant source variability includes a `source_extras_json` or `source_metadata_json` field (type: text, stored as JSON). This field captures:
- All source fields that have no canonical mapping
- Source field name → value pairs
- Parser can reconstruct the full source record from canonical fields + extras JSON

---

## Provenance and Parser Version Tracking

Every `schedule_import_batch` records:

| Provenance Field | Purpose |
|-----------------|---------|
| `source_file_name` | Original file name |
| `source_file_url` | Immutable reference to raw file in SharePoint library |
| `detected_format` | Format classification result |
| `detected_source_program` | Source program identification |
| `detected_source_version` | Source program version if detectable |
| `parser_version` | HB Intel parser code version used |
| `mapping_version` | Source-to-canonical mapping rule version used |

This enables:
- Re-parsing with updated parsers
- Auditing which mapping rules produced current canonical data
- Detecting when parser upgrades change interpretation

---

## Validation / Import Findings Model

The `import_finding` entity captures all non-silent events during ingestion:

| Category | Severity | Example |
|----------|----------|---------|
| `parse_error` | error | Malformed XML element; truncated XER table |
| `mapping_warning` | warning | Expected column missing; alias substituted |
| `validation_failure` | error | Activity has no name; relationship references non-existent activity |
| `drift_detected` | info | New column not in mapping definition; extra XER table found |
| `unmapped_field` | info | Source field preserved in extras JSON |
| `type_coercion` | warning | Date format differed from expected; successfully coerced |
| `data_quality` | warning | Duplicate activity codes; orphaned WBS nodes |

---

## Storage Boundary Alignment with Phase 1 Authority Model

| Layer | Storage | Authority | P1-A1/A2 Alignment |
|-------|---------|-----------|---------------------|
| Raw uploaded files | SharePoint Document Library (project site) | Authoritative raw source | Aligns with P1-A1 `schedule` domain: SharePoint is primary business data store |
| Import batch metadata | SharePoint List (project site) | Authoritative operational metadata | Aligns with schedule domain governance |
| Canonical schedule entities | SharePoint Lists (project site) | Authoritative for schedule business data | Aligns with P1-A1: SharePoint List as primary store for schedule domain |
| Mapping/provenance/drift records | Azure Table Storage | Operational state | Aligns with P1-A1/P1-A2: Azure Table Storage owns operational state and audit |
| Import findings | Azure Table Storage | Operational audit | Aligns with P1-A1: audit/operational history in Table Storage |

---

## Open Decisions / Future Expansion

| Decision | Scope | Owner | Target |
|----------|-------|-------|--------|
| **P6 XML support** | Full P6 XML parser in addition to XER and MSProject XML | Platform Architecture | Phase 1 (if P6 XML exports are common) or Phase 2 |
| **Baseline table support in XER** | Handle BASELINE / BASELINE_TASK tables when present in XER exports | Platform Architecture | Phase 1 |
| **Schedule comparison / diff** | Compare two import batches to detect schedule changes | Product / Platform Architecture | Phase 3+ |
| **Re-parse from raw file** | Trigger re-parse when parser/mapping upgrades occur | Platform Architecture | Phase 2 |
| **CSV column auto-detection** | Handle arbitrary CSV column orders and custom column names | Platform Architecture | Phase 1 |
| **SharePoint list schema for canonical entities** | Physical column definitions in P1-A3 for schedule domain containers | Platform Architecture | Phase 1 (after field expansion in P1-A1) |

---

## Revision History

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 0.1 | 2026-03-17 | Architecture | Initial schema; canonical entity model with 16 entities, 3 format mappings (CSV/MSProject XML/P6 XER), drift handling, provenance tracking, and storage boundary alignment. Evidence-based analysis from 3 example schedule files. |
