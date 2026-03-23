# P3-E5: Schedule Module — Field and Data Model Specification

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E5 |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Document Type** | Module Field Specification |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-22 |
| **Related Contracts** | P3-E1 §3.2, P3-E2 §4, P3-G1 §4.2, P3-H1 §18.5 |
| **Source Examples** | docs/reference/example/ |

---

## Purpose

This specification defines the complete data model, field definitions, status enumerations, business rules, and required workflows for the Schedule module implementation. Every field listed here **MUST** be implemented. A developer reading this specification must have no ambiguity about what to build.

This document is grounded in the Primavera P6 data model and operational schedule management practice. The module is **read/track/override only**; it does not author or modify the baseline CPM schedule. Schedule adjustments flow through the Schedule module's override mechanism, which requires PM reasoning and PE approval when appropriate.

### Source Files

- `docs/reference/example/Project_Schedule.csv` — Primavera P6 CSV export (24 columns)
- `docs/reference/example/Project_Schedule.xer` — Primavera P6 XER native format (binary)
- `docs/reference/example/Project_Schedule.xml` — Primavera P6 XML export format

---

## 1. Schedule Activity Record (Primavera P6 Import Model)

The Schedule Activity Record represents a single task or milestone from the Primavera P6 schedule. Project Hub imports the complete schedule via XER, XML, or CSV format and materializes each activity as an internal record with derived calculations for display and tracking.

### 1.1 Complete Field Table

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Source (P6 Column) | P6 Meaning | Notes |
|------------------------|-----------------|----------|------------|-------------------|-----------|-------|
| activityId | `string` | Yes | Yes | — | UUID generated on import | Stable internal identifier |
| projectId | `string` | Yes | No | — | FK to project | Links activity to project |
| sourceActivityCode | `string` | Yes | No | task_code | Primavera activity ID | e.g., "A1000", "MOBILIZATION"; immutable from P6 |
| statusCode | `enum` | Yes | No | status_code | P6 activity status | Enum: `TK_NotStart` \| `TK_Active` \| `TK_Complete`; read from P6 import |
| wbsId | `string` | No | No | wbs_id | Work Breakdown Structure node | Hierarchical reference to WBS level (e.g., "1.2.3"); null if not hierarchical |
| activityName | `string` | Yes | No | task_name | Activity description | Human-readable activity name (e.g., "Excavation & Grading") |
| activityType | `enum` | Yes | No | task_type | Primavera task type | Enum: `TT_Task` (normal activity) \| `TT_Mile` (milestone) \| `TT_LOE` (level-of-effort) \| `TT_FinMile` (finish milestone) \| `TT_WBS` (WBS summary); drives milestone auto-detection (§2) |
| targetDurationHrs | `number` | Yes | No | target_drtn_hr_cnt | Planned duration | In hours; converted to working days for display (÷ 8) |
| remainingDurationHrs | `number` | Yes | No | remain_drtn_hr_cnt | Remaining work | In hours; 0 when `statusCode = TK_Complete` |
| actualDurationHrs | `number` | Yes | No | act_drtn_hr_cnt | Work performed | In hours; cumulative actual effort |
| baselineStartDate | `datetime` | No | No | primary_base_start_date | Project baseline | Immutable reference start date from P6 baseline plan; null if no baseline |
| baselineFinishDate | `datetime` | No | No | primary_base_end_date | Project baseline | Immutable reference finish date from P6 baseline plan; null if no baseline |
| targetStartDate | `datetime` | Yes | No | target_start_date | Current planned start | PM's or scheduler's current forecast start (may differ from baseline) |
| actualStartDate | `datetime` | No | No | start_date (actual) | Actual start | Null if `statusCode = TK_NotStart` |
| targetFinishDate | `datetime` | Yes | No | target_end_date | Current planned finish | PM's or scheduler's current forecast finish |
| actualFinishDate | `datetime` | No | No | end_date (actual) | Actual completion | Null unless `statusCode = TK_Complete` |
| totalFloatHrs | `number` | Yes | No | remain_float_hr_cnt | Total float (slack) | In hours; CPM calculated. Critical path if ≤ 0 |
| freeFloatHrs | `number` | No | No | free_float_hr_cnt | Free float | In hours; slack before affecting successor; may be null |
| predecessors | `string` | No | No | pred_list | Predecessor activities | Comma-separated list of predecessor codes with relationship type (e.g., "A990FS+5d,A985FF") |
| successors | `string` | No | No | succ_list | Successor activities | Comma-separated list of successor codes |
| successorDetails | `string` | No | No | succ_details | Successor details | Detailed relationship information |
| resources | `string` | No | No | resource_list | Assigned resources | Comma-separated list of resource names/codes; may be null |
| constraintType1 | `enum` | No | No | cstr_type | Primary constraint | Enum: `CS_MSOA` (Must Start On or After) \| `CS_MFOA` (Must Finish On or After) \| `CS_MSON` (Must Start On) \| `CS_MFON` (Must Finish On) \| `CS_SNLF` (Start No Later Than) \| `CS_FNLF` (Finish No Later Than) \| null (no constraint) |
| constraintType2 | `enum` | No | No | cstr_type2 | Secondary constraint | Same enum as `constraintType1`; null if not used |
| calendarId | `string` | No | No | clndr_id | Working calendar | Calendar reference for calculating working days vs calendar days; null = use project default |
| deleteFlag | `boolean` | Yes | No | delete_record_flag | P6 deletion flag | true = activity marked for deletion in P6; not imported into Project Hub milestone surface (§2) |
| importedAt | `datetime` | Yes | Yes | — | Import timestamp | Immutable; when this activity was imported |
| importBatchId | `string` | Yes | Yes | — | Import transaction ID | UUID grouping all activities from single upload |
| isManualMilestone | `boolean` | Yes | No | — | Manual flag | true = PM flagged this as a milestone via UI (even if P6 taskType is not TT_Mile); false = not manually flagged |
| criticityIndex | `number` | Yes | Yes | — | Criticality score | Calculated: indicates how critical activity is to completion date; used for filtering and alerting (§1.3) |
| notes | `string` | No | No | — | PM notes | Optional internal notes about activity status or risks |

### 1.2 Primavera P6 Status Codes and Task Types

**Activity Status Codes (required enum values):**

| Status Code | Description | Meaning | Typical Duration |
|-------------|-------------|---------|------------------|
| `TK_NotStart` | Not Started | Work has not yet begun | — |
| `TK_Active` | In Progress | Work is underway | Activity start to current completion |
| `TK_Complete` | Completed | All work finished | Full duration; `remainingDurationHrs = 0` |

**Task Type Codes (required enum values):**

| Task Type | Description | Meaning | Milestone Auto-Detection |
|-----------|-------------|---------|-------------------------|
| `TT_Task` | Normal Activity | Standard construction task | No (unless manually flagged) |
| `TT_Mile` | Milestone | Event with zero duration | **Yes** — auto-detected as milestone |
| `TT_LOE` | Level of Effort | Non-time-bound activity | No |
| `TT_FinMile` | Finish Milestone | End event | **Yes** — auto-detected as milestone |
| `TT_WBS` | WBS Summary | Summary-level activity | No |

**Constraint Type Codes (required enum values):**

| Constraint Type | Abbreviation | Meaning |
|-----------------|--------------|---------|
| `CS_MSOA` | MSOA | Must Start On or After [date] — activity cannot start before date |
| `CS_MFOA` | MFOA | Must Finish On or After [date] — activity cannot finish before date |
| `CS_MSON` | MSON | Must Start On [date] — activity constrained to exact start date |
| `CS_MFON` | MFON | Must Finish On [date] — activity constrained to exact finish date |
| `CS_SNLF` | SNLF | Start No Later Than [date] — activity must start by date or schedule is invalid |
| `CS_FNLF` | FNLF | Finish No Later Than [date] — activity must finish by date or schedule is invalid |

### 1.3 Criticality Index Calculation

The Criticality Index (0-100) indicates how important an activity is to project completion. It is calculated on import and used for prioritization and alerting.

**Formula:**
```
criticityIndex = (1 - (totalFloatHrs / maxTotalFloat)) × 100
where maxTotalFloat = maximum totalFloatHrs across all activities in schedule
```

**Interpretation:**
- 90-100: Critical path; any delay impacts completion
- 75-89: Near-critical; small delays propagate
- 50-74: Moderate slack
- 0-49: High slack; delays absorbed by float

**Display rule:**
- Activities with criticityIndex >= 90 highlighted in red (critical path)
- Activities with 75-89 highlighted in yellow (near-critical)
- Activities with < 75 standard display

---

## 2. Milestone Working Model

Project Hub surfaces milestones as first-class objects distinct from the general activity list. Milestones are the primary interface for schedule tracking and forecasting. A milestone is either automatically detected from P6 import or manually flagged by PM.

### 2.1 Milestone Identification Rule

An activity is treated as a milestone when:
- P6 `activityType` is `TT_Mile` OR `TT_FinMile`, **OR**
- PM manually sets `isManualMilestone = true` in the UI

Once identified, the activity is surfaced in the Schedule module's milestone tracking interface (separate from the activity list).

### 2.2 Milestone Record Structure

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Source | Business Rule |
|------------------------|-----------------|----------|------------|--------|---------------|
| milestoneId | `string` | Yes | Yes | — | UUID; identifies this milestone | Stable internal identifier; generated on creation or import |
| sourceActivityCode | `string` | No | No | activityId (from activity) | Primavera activity code | null if manual milestone (not from P6) |
| projectId | `string` | Yes | No | — | FK to project | Links milestone to project |
| milestoneName | `string` | Yes | No | activityName (from activity) or manual entry | Display name | e.g., "Substantial Completion", "Concrete Complete", "Permit Approved" |
| milestoneType | `enum` | Yes | No | — | Category | Enum: `ContractCompletion` (contract end date) \| `SubstantialCompletion` (owner occupancy) \| `OwnerMilestone` (owner-defined event) \| `HBInternal` (internal construction milestone) \| `SubMilestone` (subcontractor completion) \| `Permit` (permit approval) \| `Inspection` (inspection complete) \| `Custom` (user-defined) |
| baselineDate | `date` | Yes | No | baselineFinishDate or manual entry | Contract/plan baseline | Original planned date; immutable reference |
| approvedExtensionDays | `integer` | Yes | No | — | Days granted via CO | Total calendar days granted through approved change orders; >= 0 |
| revisedBaselineDate | `date` | Yes | Yes | — | **Calculated**: `baselineDate + approvedExtensionDays days` | Updated baseline after approved delays |
| forecastDate | `date` | Yes | No | — | **PM-EDITABLE**; PM's current best estimate | May differ from `revisedBaselineDate` when PM forecasts additional delay or acceleration |
| actualDate | `date` | No | No | — | Date achieved | null until milestone achieved; immutable once set |
| status | `enum` | Yes | Yes | — | **Calculated** (see §2.3) | Enum: `NotStarted` \| `OnTrack` \| `AtRisk` \| `Delayed` \| `Achieved` \| `Superseded` |
| varianceDays | `integer` | Yes | Yes | — | **Calculated**: `forecastDate - revisedBaselineDate` | Positive = behind schedule (unfavorable, red); Negative = ahead (favorable, green); Zero = on track |
| percentComplete | `number` | Yes | No | — | Completion % | 0-100; from P6 if import, or PM manual entry if manual milestone |
| totalFloatHrs | `number` | No | No | totalFloatHrs (from activity) | Float from P6 | Null if manual milestone; critical path flag if ≤ 0 |
| isCriticalPath | `boolean` | Yes | Yes | — | **Calculated**: `totalFloatHrs <= 0` if non-null | true = any delay impacts project completion |
| notes | `string` | No | No | — | PM commentary | Reason for delay, mitigation strategy, etc. |
| isManual | `boolean` | Yes | No | — | Source flag | true if created outside P6 import; false if imported from P6 |
| createdAt | `datetime` | Yes | Yes | — | Creation timestamp | Immutable |
| createdBy | `string` | Yes | Yes | — | userId | PM or system user who created |
| lastEditedAt | `datetime` | No | No | — | Last modification timestamp | null if not edited since creation |
| lastEditedBy | `string` | No | No | — | userId | null if not edited since creation |

### 2.3 Milestone Status Calculation Rules

Milestone status is **calculated** from actual/forecast dates and achievement state.

**Logic:**

```
if actualDate is not null:
  status = Achieved
else if actualDate is null and status == Superseded (previously marked):
  status = Superseded  (remains Superseded; immutable)
else if actualDate is null:
  varianceDays = forecastDate - revisedBaselineDate

  if varianceDays <= 0:
    status = OnTrack  (on or ahead of revised baseline)
  else if 0 < varianceDays <= 14:
    status = AtRisk  (1-14 days behind; needs attention)
  else if varianceDays > 14:
    status = Delayed  (> 14 days behind; significant risk)
  else:
    status = NotStarted  (has not started and is not yet at risk)
```

**Status Enumeration:**

| Status | Meaning | Trigger | UI Color |
|--------|---------|---------|----------|
| `NotStarted` | Milestone date is in future; no forecast slip | `percentComplete = 0` and `forecastDate` not yet reached | Gray |
| `OnTrack` | Forecast matches revised baseline or ahead | `varianceDays <= 0` | Green |
| `AtRisk` | Forecast shows 1-14 days slip | `0 < varianceDays <= 14` | Yellow |
| `Delayed` | Forecast shows > 14 days slip | `varianceDays > 14` | Red |
| `Achieved` | Milestone accomplished | `actualDate` is set | Green checkmark |
| `Superseded` | Milestone no longer relevant | Manually set by PM when milestone replaced | Gray / strikethrough |

### 2.4 Milestone Type Enumeration

| Type | Description | Typical | Tracked For |
|------|-------------|---------|------------|
| `ContractCompletion` | Contract completion date | Often the "Final Completion" date in contract | Legal/contractual obligations |
| `SubstantialCompletion` | Substantial completion (owner occupancy) | Key financial & operational milestone | Owner handoff; retention release trigger |
| `OwnerMilestone` | Owner-specified event | Owner approval, permit issuance, owner-supplied items | Owner coordination; external dependencies |
| `HBInternal` | HB internal construction milestone | Foundation complete, rough-in complete, close-out prep | Internal project control; crew scheduling |
| `SubMilestone` | Subcontractor phase completion | Concrete finished, framing finished | Buyout tracking; sequence control |
| `Permit` | Permit approval | Building permit, final approval | Regulatory; work enablement |
| `Inspection` | Inspection completion | Final inspection, trade inspections | Regulatory; work validation |
| `Custom` | User-defined | Any other event PM tracks | Flexible tracking for project-specific needs |

---

## 3. Forecast Override Record

When PM adjusts a milestone's `forecastDate` away from `revisedBaselineDate`, the system creates a Forecast Override Record to track the reasoning, approval chain, and change history. This governs PM authority and PE visibility.

### 3.1 Override Record Structure

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Description |
|------------------------|-----------------|----------|------------|-------------|
| overrideId | `string` | Yes | Yes | UUID; identifies this override |
| milestoneId | `string` | Yes | No | FK to milestone |
| projectId | `string` | Yes | No | FK to project |
| priorForecastDate | `date` | Yes | No | Previous forecast (before override); enables undo/comparison |
| newForecastDate | `date` | Yes | No | New forecast date set by PM |
| varianceDays | `integer` | Yes | Yes | **Calculated**: `newForecastDate - priorForecastDate`; positive = slip; negative = recovery |
| reason | `string` | Yes | No | **REQUIRED** — PM must explain override; non-empty string |
| reasonCategory | `enum` | Yes | No | Categorization: `ChangeOrder` \| `WeatherDelay` \| `DesignChange` \| `SubcontractorDelay` \| `OwnerAction` \| `ForceMajeure` \| `ScheduleCompression` \| `Other` |
| createdBy | `string` | Yes | No | userId of PM who created override |
| createdAt | `datetime` | Yes | Yes | Timestamp of override creation |
| approvalRequired | `boolean` | Yes | Yes | **Calculated**: true if `abs(varianceDays) > approvalThreshold` (configurable per project; default = 5 days) |
| approvedBy | `string` | No | No | userId of PE/approver; null if not approved yet |
| approvedAt | `datetime` | No | No | Timestamp of approval; null if not approved |
| rejectionReason | `string` | No | No | If PE rejects override, reason provided |
| status | `enum` | Yes | Yes | Enum: `Pending` (awaiting approval if required) \| `Approved` (PE approved) \| `Rejected` (PE rejected; override not applied) \| `Applied` (override active; no approval needed because within threshold) |

### 3.2 Override Validation Rules

**Mandatory Rule:** PM must fill in `reason` field; empty reason rejected with error: "Reason is required. Explain the cause of the forecast change."

**Threshold Rule:**
- If `abs(varianceDays) <= approvalThreshold` (default 5 days): `approvalRequired = false`; override auto-applies to `forecastDate`; status = `Applied`
- If `abs(varianceDays) > approvalThreshold`: `approvalRequired = true`; override held in `Pending` state; PE notified via Work Queue; `forecastDate` not updated until PE approves

**Approval Workflow:**
- PE receives Work Queue item: "Milestone forecast override pending approval: [milestone name], [varianceDays] days, reason: [reason category]"
- PE reviews in UI; may approve or reject
- If approved: status = `Approved`, `approvedAt = now`, `forecastDate` updated to `newForecastDate`
- If rejected: status = `Rejected`, `rejectionReason` set, `forecastDate` unchanged (prior forecast remains active)

---

## 4. Schedule File Upload / Version Record

The Schedule module maintains a complete version history of all uploaded schedules. No version is deleted; all are retained for audit trail and restoration capability.

### 4.1 Upload Record Structure

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Description |
|------------------------|-----------------|----------|------------|-------------|
| uploadId | `string` | Yes | Yes | UUID; identifies upload transaction |
| projectId | `string` | Yes | No | FK to project |
| uploadedBy | `string` | Yes | No | userId of user who uploaded |
| uploadedAt | `datetime` | Yes | Yes | Timestamp of upload |
| format | `enum` | Yes | No | File format: `XER` (Primavera native) \| `XML` (Primavera XML) \| `CSV` (Primavera CSV export) |
| originalFilename | `string` | Yes | No | Original file name (e.g., "Project_Schedule_2026-03-20.xer") |
| fileStorageRef | `string` | Yes | No | Reference to stored file (SharePoint URL, blob ID, etc.) |
| recordCount | `integer` | Yes | No | Number of activities parsed from file |
| milestoneCount | `integer` | Yes | No | Number of auto-detected milestones (tasks with type TT_Mile or TT_FinMile) |
| status | `enum` | Yes | No | Enum: `Processing` (parsing in progress) \| `Parsed` (successfully parsed) \| `Active` (currently in use by project) \| `Superseded` (replaced by newer upload) \| `Failed` (parse error; unable to ingest) |
| validationWarnings | `string[]` | No | No | Non-fatal parsing issues (e.g., "Activity A1000 has null duration; assuming LOE task") |
| validationErrors | `string[]` | No | No | Fatal errors that prevented parse (e.g., "File format not recognized", "Missing required XER magic bytes") |
| activatedAt | `datetime` | No | No | Timestamp when PM promoted this upload to Active; null if not yet activated |
| supersededAt | `datetime` | No | No | Timestamp when this upload was replaced by a newer version; null if still Active |
| supersededBy | `string` | No | No | uploadId of the replacement; null if not yet superseded |

### 4.2 Upload Version Workflow

**Upload Sequence:**
1. PM clicks "Upload Schedule" → file picker
2. System validates file format (XER, XML, or CSV)
3. Parser executes; creates upload record with `status = Processing`
4. If parsing succeeds: `status = Parsed`, records parsed, validation results noted
5. If parsing fails: `status = Failed`, `validationErrors` populated, PM shown error list
6. PM reviews parsed data and clicks "Activate" to promote to `Active`
7. When new upload activated: prior `Active` upload automatically marked `Superseded`, `supersededAt = now`, `supersededBy = newUploadId`

**Version Retention:**
- All uploads (Active, Superseded, Failed) retained indefinitely
- PM can restore a prior upload: selects upload from history, clicks "Restore" → prior upload becomes Active again, current Active marked Superseded

### 4.3 Validation on Parse

**Required Validation Checks:**

| Check | Error/Warning | Action |
|-------|---------------|--------|
| File format recognized | Error if not | Abort parse |
| Required columns present | Error | Abort parse |
| Activity code unique | Error if duplicate | Abort parse |
| Baseline dates present | Warning if missing | Parse succeeds; baseline = null |
| Target dates valid | Error if target < baseline | Abort parse |
| Float calculated | Warning if null | Parse succeeds; treat as null |
| Duration > 0 | Warning if = 0 (milestone) | Parse succeeds; expected for milestones |

---

## 5. Schedule Summary Projection (Canvas and Health Spine)

The Schedule Summary Projection is a normalized snapshot of schedule status computed on demand and published to the Health spine and canvas tile. It aggregates all milestones and activities into a single status view.

### 5.1 Schedule Summary Record

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Description |
|------------------------|-----------------|----------|------------|-------------|
| summaryId | `string` | Yes | Yes | UUID |
| projectId | `string` | Yes | No | FK to project |
| computedAt | `datetime` | Yes | Yes | Timestamp when summary was computed |
| overallStatus | `enum` | Yes | Yes | **Calculated** (§5.2): `OnTrack` \| `AtRisk` \| `Delayed` \| `Critical` |
| schedulePercentComplete | `number` | Yes | Yes | Weighted project completion % (0-100) based on duration of completed activities |
| contractCompletionDate | `date` | Yes | No | Contract baseline completion (immutable reference) |
| forecastCompletionDate | `date` | Yes | Yes | **PM's or schedule's current best estimate** of substantial completion; drives primary schedule variance |
| varianceDays | `integer` | Yes | Yes | **Calculated**: `forecastCompletionDate - contractCompletionDate`; positive = behind (unfavorable); negative = ahead (favorable) |
| criticalPathActivities | `integer` | Yes | Yes | Count of activities with `totalFloatHrs <= 0` |
| nearCriticalActivities | `integer` | Yes | Yes | Count of activities with `0 < totalFloatHrs <= 40 hrs` (5 working days) |
| milestoneSummary | `object` | Yes | Yes | Aggregate milestone status (see §5.3) |
| nextMilestone | `object` | No | Yes | Upcoming milestone info (see §5.4) |
| lastActivities | `array` | No | Yes | List of most recently updated/active activities (for UI feed) |

### 5.2 Overall Status Calculation

**Logic:**
```
varianceDays = forecastCompletionDate - contractCompletionDate

if varianceDays <= 0:
  overallStatus = OnTrack  (on or ahead of contract date)
else if 0 < varianceDays <= 7:
  overallStatus = AtRisk  (1 week behind; needs attention)
else if 7 < varianceDays <= 21:
  overallStatus = Delayed  (1-3 weeks behind; significant issue)
else if varianceDays > 21:
  overallStatus = Critical  (> 3 weeks behind; critical concern)
```

**Display:**
- OnTrack: green badge, "✓ On Schedule"
- AtRisk: yellow badge, "! Schedule At Risk"
- Delayed: orange badge, "⚠ Schedule Delayed"
- Critical: red badge, "🔴 Schedule Critical"

### 5.3 Milestone Summary Object

| Field Name (camelCase) | Type | Description |
|------------------------|------|-------------|
| total | integer | Total number of milestones |
| achieved | integer | Count of `status = Achieved` |
| onTrack | integer | Count of `status = OnTrack` |
| atRisk | integer | Count of `status = AtRisk` |
| delayed | integer | Count of `status = Delayed` |
| notStarted | integer | Count of `status = NotStarted` |

**Example:** `{ "total": 12, "achieved": 4, "onTrack": 6, "atRisk": 2, "delayed": 0, "notStarted": 0 }`

### 5.4 Next Milestone Object

| Field Name (camelCase) | Type | Description |
|------------------------|------|-------------|
| milestoneName | string | Name of next upcoming milestone |
| forecastDate | date | Next milestone forecast date |
| varianceDays | integer | Days behind revised baseline (positive = behind) |
| status | enum | `NotStarted` \| `OnTrack` \| `AtRisk` \| `Delayed` |
| percentComplete | number | 0-100 |

**Example:** `{ "milestoneName": "Structural Steel Complete", "forecastDate": "2026-06-15", "varianceDays": 3, "status": "AtRisk", "percentComplete": 45 }`

### 5.5 Last Activities Array

Array of 3-5 most recently updated or active activities (sortable, filterable in UI).

| Field | Type | Description |
|-------|------|-------------|
| sourceActivityCode | string | P6 activity code |
| activityName | string | Display name |
| status | enum | `TK_NotStart` \| `TK_Active` \| `TK_Complete` |
| percentComplete | number | 0-100 |
| targetFinishDate | date | Current forecast finish |
| lastUpdated | datetime | When activity was last modified in P6 or Project Hub |

---

## 6. Status Enumerations (Complete)

### 6.1 Activity Status (Primavera P6)

| Enum Value | Description |
|------------|-------------|
| `TK_NotStart` | Activity not yet started |
| `TK_Active` | Activity in progress |
| `TK_Complete` | Activity completed |

### 6.2 Milestone Status (Calculated in Project Hub)

| Enum Value | Description | Trigger |
|------------|-------------|---------|
| `NotStarted` | Not yet commenced | `percentComplete = 0`, forecast date in future |
| `OnTrack` | Proceeding per plan | `varianceDays <= 0` |
| `AtRisk` | Minor delay forecast | `0 < varianceDays <= 14 days` |
| `Delayed` | Significant delay | `varianceDays > 14 days` |
| `Achieved` | Completed | `actualDate` is set |
| `Superseded` | Milestone no longer relevant | Manually marked by PM |

### 6.3 Overall Schedule Status (Calculated)

| Enum Value | Description | Trigger |
|------------|-------------|---------|
| `OnTrack` | Project on or ahead of schedule | `varianceDays <= 0` |
| `AtRisk` | Minor schedule slip | `0 < varianceDays <= 7 days` |
| `Delayed` | Significant delay | `7 < varianceDays <= 21 days` |
| `Critical` | Critical delay | `varianceDays > 21 days` |

### 6.4 Upload Status

| Enum Value | Description |
|------------|-------------|
| `Processing` | File upload being parsed |
| `Parsed` | Parse completed successfully |
| `Active` | Currently in use as project schedule |
| `Superseded` | Replaced by newer upload |
| `Failed` | Parse failed; unable to ingest |

### 6.5 Milestone Type (PM-Selected Category)

| Enum Value | Description |
|------------|-------------|
| `ContractCompletion` | Contract completion date |
| `SubstantialCompletion` | Substantial completion (owner occupancy) |
| `OwnerMilestone` | Owner-specified event |
| `HBInternal` | Internal construction milestone |
| `SubMilestone` | Subcontractor phase completion |
| `Permit` | Permit approval |
| `Inspection` | Inspection completion |
| `Custom` | User-defined category |

### 6.6 Reason Category (for Forecast Overrides)

| Enum Value | Description | Example |
|------------|-------------|---------|
| `ChangeOrder` | Change order impact | Design change extends activity duration |
| `WeatherDelay` | Weather or environmental | Extreme rain, winter shutdown |
| `DesignChange` | Design revision | Redesign of structural system |
| `SubcontractorDelay` | Subcontractor performance | Sub behind schedule; impacts successor |
| `OwnerAction` | Owner-caused delay | Owner approval late; delays start of activity |
| `ForceMajeure` | Force majeure (rare) | Natural disaster, pandemic |
| `ScheduleCompression` | Deliberate compression | PM accelerates schedule to recover float |
| `Other` | Unclassified reason | Default when reason doesn't fit above |

---

## 7. Business Rules and Calculations (Complete)

### 7.1 Duration Conversion

**Rule:** All durations stored internally in hours; displayed to users in working days.

**Conversion:**
- Internal storage: hours (e.g., 80 hours)
- Display: working days (= hours ÷ 8; e.g., "10 days")
- Calculation: uses calendar configured for project (standard = 8 hours/day, 5 days/week)

**Implementation:** UI layer handles conversion at display time; API returns hours; calculations performed in hours.

### 7.2 Critical Path and Float

**Rule:** Activities with `totalFloatHrs <= 0` are on critical path; any delay impacts project completion.

**Near-Critical Threshold:** Activities with `0 < totalFloatHrs <= 40 hours` (5 working days) are near-critical and flagged for attention.

**Display:**
- Critical path: red highlighting, "Critical Path" label
- Near-critical: yellow highlighting, "Near Critical (5 days float)" label
- Slack activities: standard display

**Update:** Float recalculated on each schedule import from P6.

### 7.3 Milestone Status Calculation

See §2.3. Status is **calculated** from actual date, forecast date, and revised baseline; it is not stored as a static field. On every UI refresh, status is recomputed.

**Implementation:** Calculation function executed when milestone is loaded or when data changes.

### 7.4 Overall Schedule Status Calculation

See §5.2. Overall status determined by `varianceDays` of the forecastCompletionDate.

**Forecastion Date Logic:**
- Default: pulled from the P6 schedule's target finish date of the "Final Completion" or "Project End" activity
- Override: PM may manually set via "Set Forecast Completion Date" button (creates override record)

### 7.5 Schedule Percent Complete

**Formula:**
```
schedulePercentComplete = (sum of duration of completed activities / sum of total duration of all activities) × 100
```

**Calculation:**
- Completed activities: `statusCode = TK_Complete`; use `actualDurationHrs`
- All activities: use `targetDurationHrs`
- Weighted by duration (activities with longer duration have more weight)

### 7.6 Variance Days Sign Convention

**Rule:** Positive = behind schedule (unfavorable, red); Negative = ahead of schedule (favorable, green); Zero = on time.

**Formula:**
```
varianceDays = forecastDate - revisedBaselineDate
```

**Example:**
- Forecast: 2026-06-15, Baseline: 2026-06-10 → variance = +5 days (5 days late, red)
- Forecast: 2026-06-05, Baseline: 2026-06-10 → variance = -5 days (5 days early, green)

### 7.7 Forecast Override Approval Threshold

**Configurable per project; default = 5 days**

If `abs(varianceDays) <= threshold`: override auto-applies; no approval needed
If `abs(varianceDays) > threshold`: override held for PE approval; Work Queue notification sent

**Configuration:** Project settings; PE may raise/lower threshold per project risk tolerance.

### 7.8 Critical Path Identification

**Rule:** On each P6 import, activities with `totalFloatHrs <= 0` are identified as critical path.

**Calculation:** P6 computes float; imported as-is. Project Hub does not recalculate CPM.

**Display:**
- Canvas tile shows: "[N] Critical Path Activities, [N] Near-Critical"
- Activity list filtered/sorted option: "Show only critical path"
- Milestone tracking: highlights milestones on critical path

### 7.9 Approval Requirement Auto-Calculation

**Formula:**
```
approvalRequired = abs(varianceDays) > approvalThreshold (default 5 days)
```

When PM creates forecast override:
- System calculates `varianceDays = newForecastDate - priorForecastDate`
- If `abs(varianceDays) > approvalThreshold`: `approvalRequired = true`, status = `Pending`, PE notified
- If `abs(varianceDays) <= approvalThreshold`: `approvalRequired = false`, status = `Applied`, override auto-applies

### 7.10 Staleness and Schedule Version Control

**Rule:** When new schedule upload is activated, all activities are refreshed from the new upload.

**Old vs. New:**
- Old upload marked `Superseded`; activities remain in database for historical reference
- New upload marked `Active`; milestones and activities surface to users are from Active upload
- All overrides (forecast overrides) persist across schedule updates (they are milestone-level, not activity-level)

**Scenario:**
- Upload 1 (Active): Activity A1000 has target finish 2026-06-10
- PM creates override: forecast milestone A1000 to 2026-06-15 (+5 days)
- New upload 2 arrives: Activity A1000 now has target finish 2026-06-20
- PM activates Upload 2
- Old activity A1000 marked historical; new A1000 from Upload 2 is active
- PM's override persists; milestone shows new activity data + prior override

**Implementation:** Overrides stored at milestone level, not activity level, so they survive schedule refreshes.

### 7.11 Manual Milestones

**Rule:** PM may create milestones not in P6 schedule.

**Characteristics:**
- `sourceActivityCode = null` (no link to P6 activity)
- `isManual = true`
- `baselineDate`, `revisedBaselineDate`, `forecastDate` all PM-entered
- `totalFloatHrs = null` (no P6 data)
- `isCriticalPath = false` (N/A for manual milestones)
- Status calculated based on forecast vs. baseline, same as imported milestones

**Use Case:** PM tracks internal or customer milestones not in CPM (e.g., "Submit submittals", "Owner reviews", "Punch list complete").

### 7.12 Delete Flag Handling

**Rule:** Activities with P6 `deleteFlag = true` are NOT imported into Project Hub milestone surface.

**Implementation:**
- On parse: identify activities with `deleteFlag = true`
- Skip milestone extraction for these activities (even if `activityType = TT_Mile`)
- Log as validation warning: "Activity [code] marked for deletion in P6; not imported as milestone"
- Deletion is logical in P6; not reflected in Project Hub (no deletion of imported data)

### 7.13 Ancestor/Descendant Relationships

**Rule:** Predecessor and successor relationships are captured but not enforced or edited in Project Hub.

**Implementation:**
- `predecessors` and `successors` fields capture P6 relationships as comma-separated strings
- Project Hub is a tracker, not a CPM editor; relationships are read-only references
- If PM wishes to modify schedule logic, they modify in P6 and re-import

---

## 8. Required Capabilities

These capabilities **MUST** be implemented for the Schedule module to be complete.

### 8.1 XER/XML/CSV Schedule File Ingestion

**Capability:** Parse Primavera P6 export and populate activity model

**Specification:**
- File upload UI: "Upload Schedule" button
- Supported formats: XER (native Primavera), XML (P6 XML export), CSV (P6 CSV export)
- Parser identifies format automatically (magic bytes for XER, XML tag check, CSV header row)
- On success: parse all activities, create activity records, detect milestones (§1), compute criticality index (§1.3)
- All activities linked to `importBatchId` and `uploadId`
- Baseline and target dates converted to UTC ISO 8601 format; stored in project timezone for display
- Duration fields (hours) validated: must be > 0 or = 0 (for milestones)
- Status: `Parsed`, records available for preview

### 8.2 Import Validation

**Capability:** Flag missing fields, date conflicts, format errors with clear error messages

**Specification:**
- Parse-time validation (§4.3): format checks, column/field presence, data type validation
- Report warnings (non-fatal): "Activity A1000 has null duration; treating as LOE", "Activity A990 has no target finish; using baseline finish"
- Report errors (fatal): "File format not recognized", "Duplicate activity code: A1000", "Activity target date before baseline"
- If errors exist: parse fails; no records created; PM shown error list with line numbers
- If warnings only: parse succeeds; PM warned but can proceed
- UI displays: "✓ 24 activities parsed, 2 warnings" (clickable to view)

### 8.3 Milestone Extraction

**Capability:** Auto-identify milestones from task type; allow PM to flag/unflag any activity as milestone

**Specification:**
- Auto-detection: P6 `taskType` = `TT_Mile` or `TT_FinMile` → create milestone record
- PM can manually flag: any activity can be marked as milestone via UI checkbox "This is a milestone" → sets `isManualMilestone = true`
- PM can unflag: uncheck checkbox → `isManualMilestone = false`, but activity remains for reference
- Milestone list in UI: shows all auto-detected + PM-flagged milestones; standard activity list shows all activities (including those flagged as milestones)

### 8.4 Manual Milestone Creation

**Capability:** PM can add milestones not in P6 schedule (e.g., owner milestones, permit approvals)

**Specification:**
- "Add Milestone" button in Schedule module
- PM enters: name, milestone type, baseline date, optional notes
- System generates UUID, sets `sourceActivityCode = null`, `isManual = true`, `createdBy = userId`, `createdAt = now`
- PM may set initial forecast date (default = baseline date)
- Manual milestone appears in milestone tracking interface alongside imported ones
- No relationship to P6 schedule; independent lifecycle

### 8.5 Governed Forecast Overrides

**Capability:** PM can shift forecastDate with required reason; auto-creates override record; PE approval if threshold exceeded

**Specification:**
- PM clicks "Update Forecast" on milestone
- PM enters new date + required reason (dropdown + optional free text)
- System calculates `varianceDays`, checks threshold
- If within threshold: override applies immediately; status = `Applied`; override record created for audit
- If exceeds threshold: override held; status = `Pending`; PE notified via Work Queue with link to review
- PE clicks notification; sees override details; can Approve or Reject with notes
- On Approve: status = `Approved`, `approvedAt = now`, `approvedBy = userId`, `forecastDate` updated
- On Reject: status = `Rejected`, `forecastDate` unchanged; PM notified with rejection reason
- Override history viewable: list of all overrides for milestone with full provenance

### 8.6 Upload Version History

**Capability:** PM can view all prior uploads and restore a superseded version

**Specification:**
- "Upload History" view shows all uploads (Active, Superseded, Failed)
- Columns: Date Uploaded, Uploaded By, Format, Records, Status, Actions
- Actions: "View Details", "Activate" (if Superseded), "Download Original File"
- On "Activate": prior Active upload marked Superseded; selected upload marked Active; milestone and activity data refreshed; PM's forecast overrides persist
- Failed uploads remain in history but cannot be activated
- Archive retention: indefinite; no auto-deletion

### 8.7 Schedule Summary Projection

**Capability:** Publish normalized status to health spine and canvas tile

**Specification:**
- Summary computed on demand (when user views dashboard or background sync triggered)
- Computation: aggregate all milestones, count statuses, calculate overall status, identify next milestone
- Published fields (§5): `overallStatus`, `schedulePercentComplete`, `forecastCompletionDate`, `varianceDays`, critical path counts, milestone summary
- Canvas tile displays: status badge, % complete, forecast date, next milestone with variance
- Dashboard uses summary for schedule health dimension
- Health spine receive event on computation; used for trend analysis and alerting

### 8.8 Critical Path Highlighting

**Capability:** Activities with totalFloat ≤ 0 highlighted; near-critical threshold indicator

**Specification:**
- Activity list: critical path activities have red background; near-critical activities yellow background
- Milestone list: if milestone on critical path, label "Critical Path"
- Canvas summary: shows count of critical and near-critical activities
- Filter option: "Show only critical path" to isolate critical activities
- Graph view (optional future enhancement): visualize critical path graphically

### 8.9 Export Capabilities

**Capability:** Milestone list and full activity list exportable as CSV

**Specification:**
- "Export Milestones" button: exports all milestones as CSV (columns: name, type, baseline date, revised baseline, forecast date, actual date, status, variance days, % complete, notes)
- "Export Activities" button: exports all activities from Active schedule as CSV (columns: activity code, name, status, duration hours, baseline dates, target dates, actual dates, float hours, critical path flag, notes)
- File format: standard CSV; headers in row 1; UTF-8 encoding
- Filename includes project name and export date (e.g., "Project-Milestones-2026-03-20.csv")

### 8.10 SPFx Lane Parity

**Capability:** SharePoint/SPFx surface offers full parity with PWA for critical workflows

**Specification:**
- **SPFx Milestone Tracking Lane:** Display milestone list (name, status, forecast date, variance, % complete) with ability to view details
- **SPFx Upload History:** View all uploads; activate prior version (triggers server update)
- **SPFx View Forecast Override:** View pending approvals; approve/reject (if PE role)
- **SPFx Launch to PWA:** Deep links to detailed views in PWA (e.g., "View all details" → opens PWA milestone detail page)
- Sync: all data changes in PWA immediately visible in SPFx (within seconds); vice versa

---

## 9. Spine Publication Events

The Schedule module publishes structured events to the project's spines per P3-A3.

### 9.1 Activity Spine Events

| Event | Trigger | Payload | Purpose |
|-------|---------|---------|---------|
| `ScheduleUploadActivated` | PM activates new schedule upload | `{ uploadId, projectId, format, activityCount, activatedAt, activatedBy }` | Log schedule version changes |
| `MilestoneAchieved` | PM sets `actualDate` on milestone | `{ milestoneId, milestoneName, achievedDate, projectId }` | Celebrate/track milestone completion |
| `MilestoneForecastOverride` | PM creates forecast override (if auto-applied) | `{ overrideId, milestoneId, priorDate, newDate, varianceDays, reason, createdBy }` | Track schedule changes |
| `ForecastOverrideApproved` | PE approves override exceeding threshold | `{ overrideId, milestoneId, approvedBy, approvedAt }` | Log PE approvals |
| `ForecastOverrideRejected` | PE rejects override exceeding threshold | `{ overrideId, milestoneId, rejectionReason, rejectedBy }` | Track rejected adjustments |
| `ScheduleUploadSuperseeded` | New upload activated, prior marked Superseded | `{ priorUploadId, newUploadId, projectId, supersededAt }` | Audit version transitions |

### 9.2 Health Spine Metrics

| Metric | Type | Updated | Purpose |
|--------|------|---------|---------|
| `overallScheduleStatus` | enum | On milestone update, upload activation | Primary schedule health; color-coded |
| `schedulePercentComplete` | percentage | On upload refresh | Progress tracking |
| `forecastCompletionDate` | date | On milestone forecast update | Key project date |
| `varianceDays` | integer | On forecast update | Days late/early vs. contract date |
| `criticalPathActivityCount` | integer | On upload refresh | Risk indicator |
| `nearCriticalActivityCount` | integer | On upload refresh | Early warning |
| `nextMilestoneInfo` | object | On milestone update | Upcoming deadline |

### 9.3 Work Queue Items

| Item Type | Condition | Actionable |
|-----------|-----------|-----------|
| `ForecastOverridePendingApproval` | Override created with `approvalRequired = true` | PE approves/rejects |
| `MilestoneAtRisk` | Milestone status = `AtRisk` | PM reviews/adjusts forecast |
| `MilestoneDelayed` | Milestone status = `Delayed` (> 14 days) | PM escalates; team meeting |
| `ScheduleSlipped` | Overall status = `Delayed` or `Critical` | PE/PM mitigation planning |
| `UploadValidationWarnings` | Schedule uploaded with warnings | PM reviews; decides whether to activate |

---

## 10. Executive Review Annotation Scope

Per P3-E1 §9 and P3-E2 §4.4, the Schedule module is review-capable. Executive stakeholders can annotate milestones and forecasts with questions, concerns, or approval notes. Annotations are stored in `@hbc/field-annotations` and do not modify schedule records.

### 10.1 Annotation Targets

PER annotations may be placed on:
- Milestone `forecastDate` values (individual milestone forecasts)
- Milestone `milestoneType` field (category assignment)
- Overall `overallScheduleStatus` and forecast completion date
- Schedule summary commentary and risk assessment
- Forecast override `reason` and `reasonCategory` fields

### 10.2 Annotation Restrictions (from P3-E2 §11.2)

- All annotations stored exclusively in `@hbc/field-annotations`; no annotation data written to Schedule module records
- No annotation triggers a write, edit, or calculation change in Schedule module
- PM's working edits and unsaved overrides are NEVER visible to PER
- PER reviews only confirmed and published snapshots (after file activation)
- Annotation display: non-intrusive, sidebar or comment thread; does not obscure underlying data
- PER may flag concerns/questions; PM responds but retains override authority

### 10.3 Annotation Workflow

1. PE/CFO views Active schedule milestone list
2. PER clicks "Annotate" on a milestone or metric
3. PER enters comment (e.g., "Question: This milestone was baseline 2026-06-10; forecast is now 2026-06-20. What is the root cause and recovery plan?")
4. Annotation saved to `@hbc/field-annotations` with `annotatedBy`, `annotatedAt`, `targetField`, `comment`
5. PM notified (Work Queue); may respond inline or via separate meeting
6. Annotations retained for audit/compliance; visible only to authorized stakeholders

---

## 11. Acceptance Gate Reference

The Schedule Module delivery is subject to Acceptance Gate §18.5 "Schedule Items" from P3-H1 (Acceptance Gates and Delivery Criteria).

**Gate §18.5 Schedule Module Criteria:**
- [ ] All 24 activity fields (§1.1) imported and stored correctly
- [ ] XER/XML/CSV import (§8.1) parses all Primavera formats
- [ ] Import validation (§8.2) flags/reports errors and warnings accurately
- [ ] Milestone extraction (§8.3) auto-detects TT_Mile and TT_FinMile tasks
- [ ] Milestone model (§2) fully implemented with status calculation
- [ ] Forecast overrides (§3) with approval workflow and reason tracking
- [ ] Upload version history (§4) with retention and restore capability
- [ ] Schedule summary projection (§5) computed and published to spines
- [ ] Critical path highlighting (§8.8) and near-critical identification
- [ ] Export (§8.9) milestones and activities as CSV
- [ ] SPFx parity (§8.10) for milestone tracking and upload history
- [ ] All status enums (§6) implemented
- [ ] All business rules (§7) enforced
- [ ] Spine events (§9) published correctly
- [ ] User acceptance testing passed with 2+ sample projects
- [ ] Performance: schedule import < 5 seconds for 500+ activities; UI response < 500ms for forecast edits
- [ ] Integration with Financial module (contract dates) verified
- [ ] Integration with Health spine (metrics publication) verified

**Delivery checklist:**
- [ ] Code complete and committed to main branch
- [ ] Unit tests: > 85% code coverage on calculation logic (status, variance, criticality)
- [ ] Integration tests: import, override, export workflows functional
- [ ] User documentation in package `README.md`
- [ ] API documentation complete (if applicable)
- [ ] Spine event contracts verified against P3-A3 spec
- [ ] Performance benchmarks met (import time, UI responsiveness)

---

## 12. Field Summary Index

**Quick reference: alphabetical list of all fields defined in this specification.**

| Field Name | Section | Type | Source |
|------------|---------|------|--------|
| activityId | 1.1 | string | Generated |
| activityName | 1.1 | string | P6 task_name |
| activityType | 1.1 | enum | P6 task_type |
| actualDate | 2.2 | date | Manual entry or P6 |
| actualDurationHrs | 1.1 | number | P6 act_drtn_hr_cnt |
| actualFinishDate | 1.1 | date | P6 end_date (actual) |
| actualStartDate | 1.1 | date | P6 start_date (actual) |
| approvalRequired | 3.1 | boolean | Calculated |
| approvedAt | 3.1 | datetime | Manual entry (PE) |
| approvedBy | 3.1 | string | Manual entry (PE) |
| approvedExtensionDays | 2.2 | integer | Manual entry |
| baselineFinishDate | 1.1 | date | P6 primary_base_end_date |
| baselineStartDate | 1.1 | date | P6 primary_base_start_date |
| baselineDate | 2.2 | date | P6 or Manual |
| calendarId | 1.1 | string | P6 clndr_id |
| constraintType1 | 1.1 | enum | P6 cstr_type |
| constraintType2 | 1.1 | enum | P6 cstr_type2 |
| createdAt (activity) | 1.1 | datetime | Auto |
| createdAt (milestone) | 2.2 | datetime | Auto |
| createdBy (milestone) | 2.2 | string | Manual |
| criticityIndex | 1.1 | number | Calculated |
| deleteFlag | 1.1 | boolean | P6 delete_record_flag |
| fileStorageRef | 4.1 | string | Manual entry |
| forecastDate | 2.2 | date | Manual entry (PM) |
| format | 4.1 | enum | Manual entry (upload) |
| freeFloatHrs | 1.1 | number | P6 free_float_hr_cnt |
| importBatchId | 1.1 | string | Generated |
| importedAt | 1.1 | datetime | Auto |
| isCriticalPath | 2.2 | boolean | Calculated |
| isManual | 2.2 | boolean | Manual |
| isManualMilestone | 1.1 | boolean | Manual |
| lastEditedAt (activity) | 1.1 | datetime | Auto |
| lastEditedAt (milestone) | 2.2 | datetime | Auto |
| lastEditedBy (milestone) | 2.2 | string | Auto |
| milestoneId | 2.2 | string | Generated |
| milestoneName | 2.2 | string | P6 or Manual |
| milestoneType | 2.2 | enum | Manual |
| newForecastDate | 3.1 | date | Manual (PM) |
| notes | 1.1 | string | Manual |
| notes | 2.2 | string | Manual |
| notes (override) | 3.1 | string | Manual |
| notes (upload) | 4.1 | string | Manual |
| originalFilename | 4.1 | string | Manual entry |
| overallStatus | 5.1 | enum | Calculated |
| overrideId | 3.1 | string | Generated |
| overrideReason | 3.1 | string | Manual (PM) |
| overrideReasonCategory | 3.1 | enum | Manual (PM) |
| percentComplete | 2.2 | number | P6 or Manual |
| priorForecastDate | 3.1 | date | Auto (saved) |
| projectId | 1.1 | string | Manual |
| reason (override) | 3.1 | string | Manual (PM) |
| reasonCategory (override) | 3.1 | enum | Manual (PM) |
| recordCount | 4.1 | integer | Calculated |
| rejectionReason | 3.1 | string | Manual (PE) |
| remainingDurationHrs | 1.1 | number | P6 remain_drtn_hr_cnt |
| resources | 1.1 | string | P6 resource_list |
| revisedBaselineDate | 2.2 | date | Calculated |
| sourceActivityCode | 1.1 | string | P6 task_code |
| sourceActivityCode | 2.2 | string | P6 (nullable) |
| status | 2.2 | enum | Calculated |
| status (override) | 3.1 | enum | Calculated |
| status (upload) | 4.1 | enum | Manual/Auto |
| statusCode | 1.1 | enum | P6 status_code |
| successors | 1.1 | string | P6 succ_list |
| successorDetails | 1.1 | string | P6 succ_details |
| supersededAt | 4.1 | datetime | Auto |
| supersededBy | 4.1 | string | Auto |
| summaryId | 5.1 | string | Generated |
| targetDurationHrs | 1.1 | number | P6 target_drtn_hr_cnt |
| targetFinishDate | 1.1 | date | P6 target_end_date |
| targetStartDate | 1.1 | date | P6 target_start_date |
| totalFloatHrs | 1.1 | number | P6 remain_float_hr_cnt |
| uploadedAt | 4.1 | datetime | Auto |
| uploadedBy | 4.1 | string | Manual |
| uploadId | 4.1 | string | Generated |
| varianceDays (milestone) | 2.2 | integer | Calculated |
| varianceDays (override) | 3.1 | integer | Calculated |
| varianceDays (summary) | 5.1 | integer | Calculated |
| validationErrors | 4.1 | string[] | Auto |
| validationWarnings | 4.1 | string[] | Auto |
| wbsId | 1.1 | string | P6 wbs_id |

---

## 13. Import and Data Refresh Strategy

### 13.1 Initial Import

For new project setup:
1. PM uploads active project schedule from P6 (XER, XML, or CSV format)
2. System parses and validates; displays summary: "[N] activities, [M] milestones detected"
3. PM reviews warnings (if any); proceeds or re-exports from P6 if issues found
4. PM activates upload; milestones and activities available for tracking
5. PM may add manual milestones (e.g., owner gates) not in P6

### 13.2 Recurring Schedule Updates

As schedule evolves:
1. PM periodically exports updated schedule from P6 (weekly or as-needed)
2. PM uploads new file to Project Hub; system parses and shows diff (e.g., "3 activities changed, 1 activity added")
3. PM reviews; clicks "Activate"
4. Prior upload marked Superseded; new upload Active; activities refreshed
5. All PM forecast overrides persist (they are milestone-level)

### 13.3 Version Retention and Restore

- All uploads (Active, Superseded, Failed) retained indefinitely
- PM may restore a prior upload if needed (e.g., "We went with the 2026-03-10 schedule; need to revert")
- Restore action: select upload, click "Restore" → prior Active marked Superseded, selected marked Active

---

## 14. Primavera P6 Field Mapping Reference

For implementers: detailed mapping of Primavera P6 CSV export columns to internal model.

| P6 CSV Column Header | Target Field (camelCase) | Type Conversion | Notes |
|----------------------|-------------------------|-----------------|-------|
| task_code | sourceActivityCode | string | Immutable; stable ID |
| status_code | statusCode | enum | Map: TK_Complete, TK_Active, TK_NotStart |
| wbs_id | wbsId | string | Hierarchical reference |
| task_name | activityName | string | UTF-8 encoded |
| target_drtn_hr_cnt | targetDurationHrs | number | Float; convert from CSV to numeric |
| remain_drtn_hr_cnt | remainingDurationHrs | number | 0 if Complete |
| act_drtn_hr_cnt | actualDurationHrs | number | Cumulative |
| primary_base_start_date | baselineStartDate | datetime | "10/29/2024 08:00" → ISO 8601 UTC |
| target_start_date | targetStartDate | datetime | Same date conversion |
| start_date (actual) | actualStartDate | datetime | Null if not started |
| primary_base_end_date | baselineFinishDate | datetime | Same conversion |
| target_end_date | targetFinishDate | datetime | Same conversion |
| end_date (actual) | actualFinishDate | datetime | Null unless Complete |
| remain_float_hr_cnt | totalFloatHrs | number | Float; critical if <= 0 |
| free_float_hr_cnt | freeFloatHrs | number | Optional; may be null |
| task_type | activityType | enum | Map: TT_Task, TT_Mile, TT_LOE, TT_FinMile, TT_WBS |
| pred_list | predecessors | string | Comma-separated; preserve as-is |
| succ_list | successors | string | Comma-separated; preserve as-is |
| succ_details | successorDetails | string | Preserve as-is |
| resource_list | resources | string | Comma-separated; preserve as-is |
| cstr_type | constraintType1 | enum | Map: CS_MSOA, CS_MFOA, CS_MSON, CS_MFON, CS_SNLF, CS_FNLF, null |
| cstr_type2 | constraintType2 | enum | Same mapping; may be null |
| clndr_id | calendarId | string | Calendar reference; may be null |
| delete_record_flag | deleteFlag | boolean | "Y"/"N" from CSV → true/false |

---

**Document Version:** 1.0
**Last Updated:** 2026-03-22
**Next Review:** Upon module implementation start
**Authority:** Project Hub Leadership, Schedule Workstream (P3-E), P3-H1 Acceptance Gates
