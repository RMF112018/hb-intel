# P3-E5 — Schedule Module: Source Identity and Versioning

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E5-T01 |
| **Parent** | [P3-E5 Schedule Module Field Specification](P3-E5-Schedule-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T01: Source Identity and Versioning |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-23 |

---

## 1. Identity, Versioning, and Import Snapshot Model

### 1.1 CanonicalScheduleSource

Each project has **one** governed canonical master-schedule source at a time. Additional connected schedule sources may be registered for comparison, enrichment, or diagnostics, but only one source carries `isCanonical = true`. Promotion of a secondary source to canonical requires a governed approval action.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| sourceId | `string` | Yes | UUID; identifies this source registration |
| projectId | `string` | Yes | FK to project |
| sourceName | `string` | Yes | Display name (e.g., "Primavera P6 — General Contractor") |
| sourceSystem | `enum` | Yes | `PrimaveraP6` \| `MSProject` \| `Asta` \| `Oracle` \| `Other` |
| isCanonical | `boolean` | Yes | true = this source is the governed master-schedule truth; only one per project |
| sourceOwnerRole | `enum` | Yes | `PM` \| `Scheduler` \| `PE`; who is responsible for keeping this source current (see Ownership Maturity Model) |
| registeredBy | `string` | Yes | userId who registered this source |
| registeredAt | `datetime` | Yes | Immutable registration timestamp |
| promotedToCanonicalAt | `datetime` | No | When this source became canonical; null if always was canonical |
| promotedBy | `string` | No | userId who promoted; null if always canonical |
| deregisteredAt | `datetime` | No | When source was retired; null if still active |
| notes | `string` | No | Description of source scope or limitations |

**Business rule:** A project without a canonical source cannot publish a forecast. A secondary source cannot be used to derive managed commitments unless explicitly promoted.

### 1.2 ScheduleVersionRecord (Update Snapshot)

Every import creates a **frozen, immutable dated update snapshot**. No import overwrites prior data; all versions are retained. Version records carry the source basis and lineage for scenario branching and forensic comparison.

| Field | Type | Required | Calculated | Description |
|-------|------|----------|------------|-------------|
| versionId | `string` | Yes | Yes | UUID; version-local identifier; immutable |
| projectId | `string` | Yes | No | FK to project |
| sourceId | `string` | Yes | No | FK to CanonicalScheduleSource or secondary source |
| versionLabel | `string` | Yes | No | Human-assigned label (e.g., "Update 12 — March 2026") |
| dataDate | `date` | Yes | No | Schedule data date from the CPM file; the "as-of" date of CPM calculations |
| importedBy | `string` | Yes | No | userId who imported |
| importedAt | `datetime` | Yes | Yes | Immutable import timestamp |
| format | `enum` | Yes | No | `XER` \| `XML` \| `CSV` |
| originalFilename | `string` | Yes | No | Original filename |
| fileStorageRef | `string` | Yes | No | Storage reference (SharePoint URL, blob ID) |
| activityCount | `integer` | Yes | Yes | Activities parsed from this import |
| milestoneCount | `integer` | Yes | Yes | Auto-detected milestones in this version |
| status | `enum` | Yes | No | `Processing` \| `Parsed` \| `Active` \| `Superseded` \| `Failed` \| `Secondary` |
| isCanonicalVersion | `boolean` | Yes | No | true = this version is the current active import for the canonical source |
| supersededAt | `datetime` | No | No | When replaced; null if still active |
| supersededBy | `string` | No | No | versionId of replacement |
| activatedAt | `datetime` | No | No | When PM activated this version |
| validationWarnings | `string[]` | No | No | Non-fatal parsing issues |
| validationErrors | `string[]` | No | No | Fatal errors |
| parentVersionId | `string` | No | No | versionId of the prior active version; enables lineage chain |

**Status definitions:**

| Status | Description |
|--------|-------------|
| `Processing` | File is being parsed |
| `Parsed` | Successfully parsed; awaiting activation |
| `Active` | Currently active for this source (one per source at a time) |
| `Superseded` | Replaced by a newer version; retained for history and forensics |
| `Failed` | Parse failed; not usable |
| `Secondary` | Imported from a non-canonical source; available for comparison only |

**Business rules:**
- Only one version per source may carry `Active` status at a time.
- Activating a new version automatically transitions the prior active version to `Superseded`.
- All versions are retained indefinitely; no version may be deleted.
- `parentVersionId` must be set at activation to preserve the lineage chain.

### 1.3 BaselineRecord

Multiple governed baselines are permitted. Each baseline must be formally approved. The primary baseline is the contractual reference; subsequent baselines require governed approval with documented basis. Baselines are frozen at the time of approval and never modified.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| baselineId | `string` | Yes | UUID; immutable |
| projectId | `string` | Yes | FK to project |
| baselineLabel | `string` | Yes | Display label (e.g., "Contract Baseline", "Approved Baseline Rev 2") |
| baselineType | `enum` | Yes | `ContractBaseline` \| `ApprovedRevision` \| `RecoveryBaseline` \| `Scenario` |
| sourceVersionId | `string` | Yes | FK to ScheduleVersionRecord; the import snapshot this baseline was extracted from |
| dataDate | `date` | Yes | Data date of the source version at time of baseline |
| approvedBy | `string` | Yes | userId of approver |
| approvedAt | `datetime` | Yes | Immutable approval timestamp |
| approvalBasis | `string` | Yes | Reason for establishing this baseline (e.g., "NTP issued", "CO-14 approved") |
| causationCode | `string` | No | FK to CausationCode; governed coded cause for new baseline |
| isPrimary | `boolean` | Yes | true = this is the project's primary variance reference baseline; only one per project |
| supersededAt | `datetime` | No | When this baseline was superseded; null if still primary |
| supersededBy | `string` | No | baselineId of replacement primary baseline |

**Business rule:** Establishing a new primary baseline requires PE approval. Superseding an existing primary baseline requires documenting the causation code and approval basis. Analytics variance calculations must reference the governing baseline explicitly.

### 1.4 ImportedActivitySnapshot

Each activity from an import is stored as an **immutable snapshot** bound to its `versionId`. Activity snapshots are never modified after import. Cross-version identity is maintained via `externalActivityKey`.

| Field | Type | Required | Calculated | Source (P6 Column) | Description |
|-------|------|----------|------------|-------------------|-------------|
| snapshotId | `string` | Yes | Yes | — | UUID; version-local identifier; immutable |
| versionId | `string` | Yes | No | — | FK to ScheduleVersionRecord |
| projectId | `string` | Yes | No | — | FK to project |
| externalActivityKey | `string` | Yes | No | — | Durable cross-version reconciliation key; derived from sourceActivityCode + optional source namespace; immutable once set; survives version upgrades |
| sourceActivityCode | `string` | Yes | No | task_code | Business-facing activity ID from CPM tool (e.g., "A1000"); immutable from source |
| activityName | `string` | Yes | No | task_name | Display name (e.g., "Excavation & Grading") |
| activityType | `enum` | Yes | No | task_type | `TT_Task` \| `TT_Mile` \| `TT_LOE` \| `TT_FinMile` \| `TT_WBS` |
| statusCode | `enum` | Yes | No | status_code | `TK_NotStart` \| `TK_Active` \| `TK_Complete` |
| wbsCode | `string` | No | No | wbs_id | WBS node reference |
| wbsName | `string` | No | No | wbs_name | WBS level display name |
| targetDurationHrs | `number` | Yes | No | target_drtn_hr_cnt | Planned duration in hours |
| remainingDurationHrs | `number` | Yes | No | remain_drtn_hr_cnt | Remaining duration in hours; 0 when complete |
| actualDurationHrs | `number` | Yes | No | act_drtn_hr_cnt | Actual cumulative effort in hours |
| baselineStartDate | `datetime` | No | No | primary_base_start_date | Primary baseline start; null if no baseline in file |
| baselineFinishDate | `datetime` | No | No | primary_base_end_date | Primary baseline finish; null if no baseline in file |
| targetStartDate | `datetime` | Yes | No | target_start_date | CPM-computed current planned start |
| targetFinishDate | `datetime` | Yes | No | target_end_date | CPM-computed current planned finish |
| actualStartDate | `datetime` | No | No | start_date | Null if `TK_NotStart` |
| actualFinishDate | `datetime` | No | No | end_date | Null unless `TK_Complete` |
| totalFloatHrs | `number` | Yes | No | remain_float_hr_cnt | CPM float in hours; ≤ 0 = critical path |
| freeFloatHrs | `number` | No | No | free_float_hr_cnt | Free float in hours |
| percentComplete | `number` | Yes | No | phys_complete_pct | Source percent complete (0-100) |
| percentCompleteBasis | `enum` | Yes | No | complete_pct_type | `Duration` \| `Physical` \| `Units` \| `Manual`; from CPM tool |
| calendarId | `string` | No | No | clndr_id | Source calendar reference |
| calendarName | `string` | No | No | clndr_name | Source calendar display name |
| constraintType1 | `enum` | No | No | cstr_type | See §1.4.1 |
| constraintDate1 | `datetime` | No | No | cstr_date | Date for constraint 1 |
| constraintType2 | `enum` | No | No | cstr_type2 | Secondary constraint |
| constraintDate2 | `datetime` | No | No | cstr_date2 | Date for constraint 2 |
| predecessors | `RelationshipRef[]` | No | No | pred_list | Array of `{ activityCode, relationshipType, lagHrs }` |
| successors | `RelationshipRef[]` | No | No | succ_list | Array of `{ activityCode, relationshipType, lagHrs }` |
| resources | `ResourceRef[]` | No | No | resource_list | Array of `{ resourceCode, resourceName, role }` |
| deleteFlag | `boolean` | Yes | No | delete_record_flag | true = marked for deletion in source; not surfaced to UI |
| importedAt | `datetime` | Yes | Yes | — | Immutable; when this snapshot was created |

**Classification fields preserved from source (normalized at import):**

| Field | Type | Source | Description |
|-------|------|--------|-------------|
| activityCodeValues | `ActivityCodeValue[]` | P6 activity codes | Array of `{ codeType, codeValue, codeDescription }` |
| udfValues | `UDFValue[]` | User-defined fields | Array of `{ fieldName, fieldType, value }` |
| primaryResourceCode | `string` | resource_list | Dominant assigned resource code |
| primaryResponsibleUserId | `string` | — | Mapped from governed responsibility classification (§13) |
| tradeCode | `string` | — | Derived or mapped from activity code (Governed) |
| phaseCode | `string` | — | Derived or mapped from activity code (Governed) |
| areaCode | `string` | — | Derived or mapped from location classification (Governed) |
| contractMilestoneFlag | `boolean` | — | true = governess-mapped as a contract milestone |

#### 1.4.1 Constraint Type Enumeration

| Enum | Abbreviation | Meaning |
|------|-------------|---------|
| `CS_MSOA` | MSOA | Must Start On or After |
| `CS_MFOA` | MFOA | Must Finish On or After |
| `CS_MSON` | MSON | Must Start On (exact) |
| `CS_MFON` | MFON | Must Finish On (exact) |
| `CS_SNLF` | SNLF | Start No Later Than |
| `CS_FNLF` | FNLF | Finish No Later Than |
| `CS_MEOA` | MEOA | Must End On or After |
| `CS_MEON` | MEON | Must End On |

### 1.5 ActivityContinuityLink

This record maintains the durable identity connection of a logical activity across multiple import versions. It enables forensic comparison, scenario branching, and cross-version analytics.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| continuityId | `string` | Yes | UUID |
| projectId | `string` | Yes | FK to project |
| externalActivityKey | `string` | Yes | The durable key shared across versions (see §1.4) |
| snapshotIds | `string[]` | Yes | Ordered array of snapshotIds for this activity across versions |
| firstSeenVersionId | `string` | Yes | FK to ScheduleVersionRecord where this activity first appeared |
| lastSeenVersionId | `string` | Yes | FK to most recent ScheduleVersionRecord where this activity appears |
| isActive | `boolean` | Yes | false = activity was present but has not appeared in the last active version (potentially deleted from source) |
| splitFromKey | `string` | No | externalActivityKey of the activity this was split from (if applicable) |
| mergedIntoKey | `string` | No | externalActivityKey this was merged into (if applicable) |

**Business rule:** The `externalActivityKey` is derived on first import as `{sourceId}::{sourceActivityCode}`. If the same activity code appears in multiple sources, the sourceId namespace disambiguates them. This key is immutable once assigned and must be used for all cross-version linkage.

### 1.6 Import Validation Rules

| Check | Error/Warning | Behavior |
|-------|---------------|---------|
| File format recognized | Error | Abort parse |
| Required columns present | Error | Abort parse |
| Activity code unique within version | Error | Abort parse |
| Data date present and valid | Error | Abort parse |
| Baseline dates present | Warning | Parse succeeds; baselineStartDate/Finish = null |
| Target dates valid | Error if target finish < data date (for not-started) | Abort parse |
| Float values present | Warning | Parse succeeds; float = null |
| Duration ≥ 0 | Warning if 0 for non-milestone | Parse succeeds |
| Activity code matches prior versions | Informational | Match to continuity link; log new/missing codes |
| Constraint dates within project window | Warning | Parse succeeds; flag for review |

---


## 17. Dual-Calendar Model

### 17.1 Calendar Layer Definitions

| Calendar Type | Purpose | Authority |
|--------------|---------|-----------|
| `SourceCalendar` | Formal schedule truth; from CPM tool | Imported; immutable per version |
| `OperatingCalendar` | Field working calendar for commitments, look-aheads, and scenarios | PM-configurable per project |

Both calendar types must co-exist. Operating calendar assumptions that differ from source calendar assumptions must be explicitly surfaced in the UI and in publication context.

### 17.2 CalendarRule (Governed)

| Field | Type | Description |
|-------|------|-------------|
| calendarRuleId | `string` | UUID |
| projectId | `string` | FK to project |
| calendarType | `enum` | `SourceCalendar` \| `OperatingCalendar` |
| calendarName | `string` | Display name |
| hoursPerDay | `number` | Working hours per day |
| workDays | `integer[]` | ISO weekday numbers (1=Mon; 7=Sun) |
| exceptions | `CalendarException[]` | Holidays and non-work dates |
| effectiveFrom | `date` | When this calendar takes effect |
| effectiveTo | `date` | End date; null = indefinite |
| createdBy | `string` | userId |
| createdAt | `datetime` | Immutable |

**Business rule:** When a LookAheadPlan or ManagedCommitmentRecord uses operating calendar dates that would yield different implied completion dates than source calendar assumptions, the system must flag the delta as a `CalendarAssumptionDivergence` warning visible on the commitment and publication records.

---


---

## Navigation

| File | Contents |
|------|---------|
| [P3-E5.md](P3-E5-Schedule-Module-Field-Specification.md) | Master index — Purpose, Operating Model, Ownership Maturity |
| [P3-E5-T01-Source-Identity-and-Versioning.md](P3-E5-T01-Source-Identity-and-Versioning.md) | T01: §1 Identity/Versioning/Import and §17 Dual-Calendar Model |
| [P3-E5-T02-Dual-Truth-Commitments-and-Milestones.md](P3-E5-T02-Dual-Truth-Commitments-and-Milestones.md) | T02: §2 Dual-Truth/Operating Layer and §4 Milestone Working Model |
| [P3-E5-T03-Publication-Layer.md](P3-E5-T03-Publication-Layer.md) | T03: §3 Published Forecast Layer and §19 Schedule Summary Projection |
| [P3-E5-T04-Scenario-Branch-Model.md](P3-E5-T04-Scenario-Branch-Model.md) | T04: §5 Scenario Branch Model |
| [P3-E5-T05-Field-Execution-Layer.md](P3-E5-T05-Field-Execution-Layer.md) | T05: §6 Field Execution, §7 Acknowledgement, §8 Progress/Verification, §9 Roll-Up |
| [P3-E5-T06-Logic-Dependencies-and-Propagation.md](P3-E5-T06-Logic-Dependencies-and-Propagation.md) | T06: §10 Logic Layers and Dependency Model |
| [P3-E5-T07-Analytics-Intelligence-and-Grading.md](P3-E5-T07-Analytics-Intelligence-and-Grading.md) | T07: §11 Analytics/Grading/Confidence, §12 Recommendations, §13 Causation Taxonomy |
| [P3-E5-T08-Classification-Metadata-Offline-and-Sync.md](P3-E5-T08-Classification-Metadata-Offline-and-Sync.md) | T08: §14 Classification/Metadata, §15 Offline/Sync, §16 Visibility/Participation |
| [P3-E5-T09-Platform-Integration-and-Governance.md](P3-E5-T09-Platform-Integration-and-Governance.md) | T09: §18 Cross-Platform Workflow/Shared Packages, §20 Governance/Policy, §23 Executive Review |
| [P3-E5-T10-Business-Rules-Capabilities-and-Reference.md](P3-E5-T10-Business-Rules-Capabilities-and-Reference.md) | T10: §21 Business Rules, §22 Required Capabilities, §27 Status Enumerations, §28 Field Index |
| [P3-E5-T11-Implementation-and-Acceptance.md](P3-E5-T11-Implementation-and-Acceptance.md) | T11: §24 Implementation Guide, §25 Acceptance Gate, §26 Remaining Blockers |
