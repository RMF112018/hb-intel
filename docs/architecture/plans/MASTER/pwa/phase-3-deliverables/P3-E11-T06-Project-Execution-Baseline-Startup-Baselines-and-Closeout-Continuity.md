# P3-E11-T06 — Project Execution Baseline, Startup Baselines, and Closeout Continuity

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E11-T06 |
| **Parent** | [P3-E11 Project Startup Module](P3-E11-Project-Startup-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T06 of 10 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. Purpose — Structured Baseline That Seeds Closeout Comparison

The PM Plan is the **Project Execution Baseline** — a structured record of the project team's operational commitments, assumptions, and hypotheses at the time of project launch. Its architectural purpose is twofold:

1. **Operational guide at launch:** 11 sections capture the team's plan for quality, safety, cost, schedule, procurement, site management, and team accountability.
2. **Closeout comparison seed:** The structured fields in each section are typed commitment records — dates, amounts, named persons, risk areas, operating hypotheses — that are explicitly queryable by the Closeout/Autopsy phase for delta analysis.

The narrative sections exist and are valuable, but the structured fields are the baseline's durable value. An implementation that captures only narrative is not sufficient.

**Source document:** `docs/reference/example/PROJECT MANAGEMENT PLAN 2019.docx` — 11-section PM Plan template (Sections I–XI).

---

## 2. ProjectExecutionBaseline Header

One baseline per project. User-facing label is "Project Management Plan." Internal record name is `ProjectExecutionBaseline`.

| Field | Type | Required | Calculated | Rule |
|---|---|---|---|---|
| `baselineId` | `string` | Yes | Yes | UUID; immutable |
| `programId` | `string` | Yes | No | FK to StartupProgram |
| `projectId` | `string` | Yes | No | FK to project; one baseline per project |
| `projectName` | `string` | Yes | No | Inherited from project |
| `projectNumber` | `string` | Yes | No | Inherited from project |
| `submittedBy` | `string` | No | No | Name of PM submitting the plan |
| `submittedByUserId` | `string` | No | No | FK to user record |
| `approvedBy` | `string` | No | No | Name of PX approving the plan |
| `approvedByUserId` | `string` | No | No | FK to user record |
| `planDate` | `date` | No | No | Date plan was approved and signed |
| `status` | `enum` | Yes | No | `Draft` \| `Submitted` \| `Approved` \| `Archived` |
| `lastModifiedAt` | `datetime` | Yes | Yes | Timestamp of most recent edit |
| `createdAt` | `datetime` | Yes | Yes | Timestamp of plan creation |
| `teamSignatures` | `PlanTeamSignature[]` | No | No | Project team members who have signed the plan |
| `distributionResidential` | `string[]` | No | No | Distribution list for residential market |
| `distributionCommercial` | `string[]` | No | No | Distribution list for commercial market |
| `sections` | `ExecutionBaselineSection[]` | Yes | No | Array of 11 section objects; array length is immutable |
| `assumptions` | `ExecutionAssumption[]` | No | No | Array of structured critical assumption records across 9 categories; see §8 |
| `certificationStatus` | `enum` | Yes | Yes | Mirrors `ReadinessCertification.certStatus` for `EXECUTION_BASELINE` sub-surface |

### 2.1 PM Plan Approval Flow

```
Draft → Submitted → Approved → (Archived)
```

- `Draft`: being completed; editable by PM
- `Submitted`: PM submitted for PX review; no further PM editing without reverting to Draft
- `Approved`: PX approved; plan is ready for certification submission
- `Archived`: manually set if superseded

A `ReadinessCertification` for `EXECUTION_BASELINE` requires `status = Approved` before submission. Attempting to submit certification while `status ≠ Approved` returns HTTP 400 with `EXECUTION_BASELINE_NOT_APPROVED`.

### 2.3 Certification Prerequisites for `EXECUTION_BASELINE`

T02 defines three gate criteria for the baseline certification. T06 is authoritative for what those criteria mean in practice:

| Criterion | Pass condition |
|---|---|
| `BASELINE_APPROVED` | `ProjectExecutionBaseline.status = Approved` |
| `BASELINE_CRITICAL_FIELDS_SET` | `safetyOfficerName`, `safetyOfficerRole`, `projectStartDate`, `substantialCompletionDate`, `noticeToProceedDate`, `goalSubstantialCompletionDate`, and `goalFinalCompletionDate` are populated |
| `BASELINE_SIGNED` | `PlanTeamSignature` includes signed PM and PX entries (`signedAt` populated for both roles) |

The signature block and Residential/Commercial distribution block come from the source PM Plan template and remain part of the baseline header model. The certification gate, however, is driven specifically by the PM/PX signature requirement above.

### 2.2 PlanTeamSignature Model

| Field | Type | Required | Rule |
|---|---|---|---|
| `signatureId` | `string` | Yes | UUID; immutable |
| `memberName` | `string` | Yes | Name of signing team member |
| `role` | `string` | Yes | Project role |
| `signedAt` | `datetime` | No | Timestamp of signature; null if not yet signed |
| `userId` | `string` | No | FK to user record |

---

## 3. ExecutionBaselineSection Model

| Field | Type | Required | Calculated | Rule |
|---|---|---|---|---|
| `sectionId` | `string` | Yes | Yes | UUID; immutable |
| `baselineId` | `string` | Yes | No | FK |
| `sectionNumber` | `number` | Yes | No | 1–11 (Roman numeral equivalent I–XI); immutable |
| `sectionTitle` | `string` | Yes | No | Verbatim section title; immutable |
| `content` | `string` | No | No | Free-text narrative content |
| `structuredFields` | `BaselineSectionField[]` | No | No | Typed structured fields; see §4 and §5 |
| `isComplete` | `boolean` | Yes | No | Manual indicator that section has been reviewed and completed |
| `completedAt` | `datetime` | No | No | Timestamp when section marked complete |
| `completedBy` | `string` | No | No | userId |

### 3.1 Section Enumeration

| Section No. | Title | Capture mode |
|---|---|---|
| I | Project Team Philosophy | Narrative + critical assumptions reference |
| II | Quality Control | Narrative + structured (Punch List Manager) |
| III | Preconstruction Meeting | Narrative + structured date |
| IV | Safety | Structured commitment fields + narrative |
| V | Maintaining Cost Control | Structured financial fields + procurement strategy |
| VI | Project Schedule | Structured date fields + critical path notes |
| VII | Project Team Members Responsibilities | Reference → ResponsibilityMatrix |
| VIII | Project Site Management | Structured logistics fields + narrative |
| IX | Project Administration | Narrative + operating hypotheses reference |
| X | Project Closeout | Narrative reference to Closeout module |
| XI | Attachments to Be Included | Attachment checklist (boolean flags) |

---

## 4. BaselineSectionField Model

Structured fields capture typed commitment values that are queryable by Closeout/Autopsy for delta analysis.

| Field | Type | Required | Calculated | Rule |
|---|---|---|---|---|
| `fieldId` | `string` | Yes | Yes | UUID; immutable |
| `sectionId` | `string` | Yes | No | FK |
| `fieldKey` | `string` | Yes | No | Machine-readable key; used for Closeout delta queries |
| `fieldLabel` | `string` | Yes | No | Human-readable label from PM Plan template |
| `fieldType` | `enum` | Yes | No | `Text` \| `Number` \| `Date` \| `Currency` \| `Boolean` \| `LongText` |
| `value` | `string \| number \| boolean \| Date \| null` | No | No | Current value; null until set |
| `sectionNumber` | `number` | Yes | No | Owning section number |
| `isBaselineQueryable` | `boolean` | Yes | No | `true` = this field participates in versioned baseline-query and Closeout delta-analysis contracts; `false` = informational only, but the field still appears in the full `executionBaselineFieldsAtLock` snapshot map |

`@hbc/versioned-record` is required on `value` changes to any field where `isBaselineQueryable = true`. The lock snapshot still carries all structured field values, including non-queryable informational fields.

---

## 5. Structured Fields by Section

### Section II — Quality Control

| fieldKey | fieldLabel | fieldType | isBaselineQueryable |
|---|---|---|---|
| `punchListManager` | Punch List Manager assigned | Text | Yes |

### Section III — Preconstruction Meeting

| fieldKey | fieldLabel | fieldType | isBaselineQueryable |
|---|---|---|---|
| `preConMeetingDate` | Preconstruction Meeting Date | Date | Yes |

### Section IV — Safety

| fieldKey | fieldLabel | fieldType | isBaselineQueryable |
|---|---|---|---|
| `safetyOfficerName` | Project Safety Officer Assigned | Text | Yes |
| `safetyOfficerRole` | Safety Officer Role / Title | Text | Yes |
| `safetyGoals` | Safety Goals (project-specific) | LongText | Yes |
| `safetyConcerns` | Safety Concerns to be addressed at launch | LongText | Yes |
| `safetyPlanAttached` | Project Specific Safety Plan attached | Boolean | Yes |

### Section V — Maintaining Cost Control

| fieldKey | fieldLabel | fieldType | isBaselineQueryable |
|---|---|---|---|
| `contractAmount` | Contract amount at baseline | Currency | Yes |
| `buyoutOpportunities` | Areas of potential buyout opportunity | LongText | Yes |
| `buyoutTargetAmount` | Buyout savings target amount | Currency | Yes |
| `buyoutStrategy` | Vendor/subcontractor buyout strategy | LongText | Yes |
| `costRiskAreas` | Areas of potential cost risk | LongText | Yes |
| `costSavingsAreas` | Areas of potential savings | LongText | Yes |
| `splitSavingsProvision` | Split savings provision exists (Y/N) | Boolean | Yes |
| `liquidatedDamagesPerDay` | Liquidated damages per day (if applicable) | Currency | Yes |

### Section VI — Project Schedule

| fieldKey | fieldLabel | fieldType | isBaselineQueryable |
|---|---|---|---|
| `projectStartDate` | Project start date | Date | Yes |
| `substantialCompletionDate` | Substantial Completion Date per contract | Date | Yes |
| `noticeToProceedDate` | Notice to Proceed issued date | Date | Yes |
| `noticeOfCommencementDate` | Notice of Commencement recorded date | Date | Yes |
| `noticeOfCommencementExpiration` | Notice of Commencement expiration date | Date | Yes |
| `goalSubstantialCompletionDate` | Team goal — Substantial Completion by | Date | Yes |
| `goalFinalCompletionDate` | Team goal — Final Completion by | Date | Yes |
| `criticalPathConcerns` | Critical Path concerns identified at launch | LongText | Yes |
| `scheduleFloatDays` | Schedule float days available at baseline | Number | Yes |

### Section VII — Project Team Members Responsibilities

| fieldKey | fieldLabel | fieldType | isBaselineQueryable |
|---|---|---|---|
| `responsibilityMatrixRef` | Responsibility Matrix ID | Text (UUID) | Yes |

This field stores `matrixId`. Section VII is rendered as an embedded view of the Responsibility Matrix — no task rows are duplicated.

### Section VIII — Project Site Management

| fieldKey | fieldLabel | fieldType | isBaselineQueryable |
|---|---|---|---|
| `logisticsApproach` | Site logistics and mobilization approach | LongText | Yes |
| `utilityServiceIssues` | Utility and Service Issues | LongText | Yes |
| `trafficPedestrianConsiderations` | Traffic and Pedestrian Considerations | LongText | No |
| `siteSecurity` | Site Security and Visitor Check-in | LongText | No |
| `dustErosionControl` | Dust Control & Erosion | LongText | No |
| `noiseControlHours` | Noise Control and Working Hours | LongText | No |
| `siteMaintenance` | Site Maintenance | LongText | No |
| `existingSiteConditions` | Existing Site Conditions — known issues | LongText | Yes |
| `permitsOnSite` | Permits required on site at mobilization | LongText | Yes |
| `siteWorkIssues` | Site Work Issues & Concerns | LongText | Yes |

### Section XI — Attachments to Be Included

All attachment items are `Boolean` fields defaulting to `false`. `isBaselineQueryable = false` for all.

| fieldKey | fieldLabel |
|---|---|
| `attachEstimate` | Estimate |
| `attachQualifications` | Qualifications |
| `attachPhasingPlan` | Phasing Plan (if applicable) |
| `attachLogisticsPlan` | Logistics Plan |
| `attachConstructionSchedule` | Construction Schedule |
| `attachProjectBudget` | Project Budget (from Procore Budget) |
| `attachScheduleOfValues` | Schedule of Values |
| `attachIDSRequirements` | IDS Requirements |
| `attachResponsibilityMatrix` | Responsibility Matrix |
| `attachWhoToContact` | List of Who to Contact |
| `attachMeetingAgendaTemplates` | Meeting Agenda Templates (in Procore) |
| `attachPayAppProcedures` | Pay App Procedures (Subcontractor & Owner) |
| `attachHurricanePlan` | Hurricane & Tropical Storm Preparedness Plan |
| `attachCrisisManagementPlan` | Crisis Management & Ice Response Plans |
| `attachLessonsLearnedReport` | Lessons Learned Report |
| `attachSubScorecards` | Subcontractor Scorecards |
| `attachStartupChecklist` | Startup Checklist with Assignment |
| `attachSubmittalRegister` | Submittal Register |
| `attachCloseoutProcedureGuide` | Closeout Procedure Guide |
| `attachCompletionAcceptanceManual` | Completion & Acceptance Manual |
| `attachCloseoutPreCOChecklist` | Closeout & Pre-CO Checklist |
| `attachSafetyStartupProcess` | Safety – Project Startup Process |
| `attachProjectSpecificSafetyPlan` | Project Specific Safety Plan |
| `attachQualityControlProgram` | Quality Control Program |

---

## 6. Baseline Lock Event

When the program enters `BASELINE_LOCKED` (PE closes the stabilization window), the following occurs:

1. All `ExecutionBaselineSection` and `BaselineSectionField` records become read-only (HTTP 405 on any PATCH/PUT)
2. All `ExecutionAssumption` records become read-only (HTTP 405 on any PATCH/PUT)
3. The current values of all `BaselineSectionField` records are snapshotted into `StartupBaseline.executionBaselineFieldsAtLock` (T02 §7.2) atomically with the state transition; `isBaselineQueryable` governs versioning and Closeout delta-query use, not whether a field is included in the snapshot
4. `PlanTeamSignature` records are frozen
5. `status` retains its value at lock time (typically `Approved`)

The lock is irreversible. There is no unlock path. Post-lock plan amendments must be handled as project records in the PM Plan's narrative section or as separate change events.

---

## 7. ExecutionAssumption Model — Critical Assumptions and Operating Hypotheses

Beyond the structured `BaselineSectionField` records, the team captures explicit **critical assumptions** — statements about project conditions, Owner commitments, vendor behavior, and operating hypotheses that the plan depends on. Each assumption is a discrete record. If an assumption proves wrong during execution, the Closeout/Autopsy team can trace the deviation back to a specific stated assumption.

These are categorized baseline records. They are not the stale `assumptionText` / `successCriteria` / `ownerRole` / `reviewFrequency` contract still echoed in older dependent docs.

| Field | Type | Required | Calculated | Rule |
|---|---|---|---|---|
| `assumptionId` | `string` | Yes | Yes | UUID; immutable |
| `baselineId` | `string` | Yes | No | FK to ProjectExecutionBaseline |
| `projectId` | `string` | Yes | No | FK |
| `category` | `enum` | Yes | No | See §8 for `AssumptionCategory` enum |
| `description` | `string` | Yes | No | The stated assumption — written as a condition assumed to be true at launch |
| `rationale` | `string` | No | No | Why the team believes this assumption holds |
| `ownerRoleCode` | `string` | No | No | Role accountable for monitoring this assumption |
| `riskLevel` | `enum` | No | No | `HIGH` \| `MEDIUM` \| `LOW` — how much project outcome depends on this assumption holding |
| `closeoutVerificationNote` | `string` | No | No | Describes how Closeout/Autopsy will test whether this assumption held |
| `isSuccessCriterion` | `boolean` | Yes | No | `true` = this assumption doubles as a measurable success criterion for the project |
| `successMeasure` | `string` | No | No | Populated when `isSuccessCriterion = true`; defines what "success" looks like in measurable terms |
| `createdAt` | `datetime` | Yes | Yes | Timestamp |
| `createdBy` | `string` | Yes | No | userId |
| `lastModifiedAt` | `datetime` | Yes | Yes | Timestamp |

---

## 8. Assumption Categories

```typescript
enum AssumptionCategory {
  Logistics              = 'LOGISTICS',              // Site access, laydown, sequencing, mobilization
  Safety                 = 'SAFETY',                 // Safety conditions, subcontractor safety compliance
  Schedule               = 'SCHEDULE',               // Lead times, Owner milestone delivery, weather assumptions
  ProcurementBuyout      = 'PROCUREMENT_BUYOUT',     // Subcontractor/vendor availability, buyout targets, market conditions
  OwnerCommitment        = 'OWNER_COMMITMENT',        // Owner RFI response times, design completion, decision authority
  Risk                   = 'RISK',                   // Financial risk, scope risk, geotechnical, regulatory
  CloseoutPreparation    = 'CLOSEOUT_PREPARATION',   // Punchlist velocity assumptions, commissioning, warranty program
  OperatingHypothesis    = 'OPERATING_HYPOTHESIS',   // Project-specific operational conditions assumed true at launch
  SuccessCriteria        = 'SUCCESS_CRITERIA',        // Measurable outcomes the team commits to achieve
}
```

**Category guidance:**

| Category | What belongs here |
|---|---|
| `LOGISTICS` | "Site access will be available from [address] without neighbor restriction" — schedule and cost depend on this |
| `SAFETY` | "All subcontractors have reviewed and accepted the project-specific safety plan before mobilization" |
| `SCHEDULE` | "Structural steel will be released within 6 weeks of Owner NTP based on current lead times" |
| `PROCUREMENT_BUYOUT` | "Complete buyout of MEP will be achieved within 30 days of NTP at or below budget" |
| `OWNER_COMMITMENT` | "Owner will provide final interior selection decisions no later than [date]" |
| `RISK` | "Soil bearing capacity meets structural drawings; no undisclosed underground obstructions" |
| `CLOSEOUT_PREPARATION` | "Final punchlist will be completed within 21 days of Substantial Completion" |
| `OPERATING_HYPOTHESIS` | "Project will achieve Substantial Completion in a single phase without occupancy phasing" |
| `SUCCESS_CRITERIA` | "Achieve zero OSHA recordable incidents"; "Complete project within 3% of contract amount" |

---

## 9. Baseline Lock and Closeout Continuity

### 9.1 What Is Snapshotted at Baseline Lock

The `StartupBaseline` snapshot (see T02 §7.2) is created atomically at `BASELINE_LOCKED`. The snapshot captures the final state of the following baseline records:

| Snapshot group | Fields captured |
|---|---|
| Full structured field map | `executionBaselineFieldsAtLock` keyed by every `BaselineSectionField.fieldKey` across all populated sections, including informational/non-queryable fields |
| Schedule commitments | `projectStartDate`, `substantialCompletionDate`, `goalSubstantialCompletionDate`, `goalFinalCompletionDate`, `noticeToProceedDate`, `scheduleFloatDays` |
| Financial commitments | `contractAmount`, `buyoutTargetAmount`, `liquidatedDamagesPerDay` |
| Risk and assumptions | `costRiskAreas`, `costSavingsAreas`, `criticalPathConcerns`, `safetyGoals`, `safetyConcerns`, `existingSiteConditions` |
| Procurement strategy | `buyoutOpportunities`, `buyoutStrategy`, `splitSavingsProvision` |
| Team | `responsibilitySnapshotAtLock`, `safetyOfficerName`, `punchListManager` |
| Assumptions | All `ExecutionAssumption` records, including `isSuccessCriterion = true` records |
| Program state at lock | `openProgramBlockersAtLock`, `lapsedWaiversAtLock`, `stabilizationActualDuration` (T02 §7.2) |

### 9.2 What Closeout Reads — Delta Analysis Map

Closeout/Autopsy reads the `StartupBaseline` snapshot via the read-only endpoint:

```
GET /api/startup/{projectId}/baseline
→ Returns StartupBaseline snapshot with all fields
→ 403 if caller is not Closeout module or PX
→ 405 on any PATCH/PUT
```

Closeout does **not** query live `ProjectExecutionBaseline`, `ExecutionBaselineSection`, or `BaselineSectionField` records. The snapshot is the sole continuity interface, and `executionBaselineFieldsAtLock` is the authoritative keyed record of baseline field values at lock time.

| Closeout/Autopsy analysis | Source fields from snapshot |
|---|---|
| **Schedule Autopsy** — planned vs. actual dates | `substantialCompletionDate`, `goalSubstantialCompletionDate`, `goalFinalCompletionDate`, `noticeToProceedDate` |
| **Cost Autopsy** — final cost vs. baseline contract | `contractAmount`, `buyoutTargetAmount`, `liquidatedDamagesPerDay` |
| **Risk Realization** — which identified risks materialized | `costRiskAreas`, `criticalPathConcerns`, `safetyGoals`, `existingSiteConditions` |
| **Savings Achievement** — which savings targets were hit | `costSavingsAreas`, `buyoutStrategy`, `buyoutOpportunities`, `splitSavingsProvision` |
| **Safety Scorecard** — safety goal adherence | `safetyGoals`, `safetyConcerns`, `safetyOfficerName` |
| **Assumption Audit** — which assumptions held, which failed | All `ExecutionAssumption` records with `closeoutVerificationNote` |
| **Success Criteria Scoring** — measurable outcomes achieved | `ExecutionAssumption` records with `isSuccessCriterion = true` and `successMeasure` values |
| **Team Staffing Comparison** — planned vs. actual team | `responsibilitySnapshotAtLock.primaryAssignments` |
| **Lessons Learned Seeding** — recurring patterns across projects | `costRiskAreas`, `criticalPathConcerns`, `assumptionCategory = OPERATING_HYPOTHESIS` records |

### 9.3 What Must Not Be Duplicated

Closeout must not re-collect data that is already owned by the `StartupBaseline`. The following fields are owned by Startup and must not be re-entered in Closeout records:

- Original contract amount (`contractAmount`)
- Contractual Substantial Completion date (`substantialCompletionDate`)
- Team's internal Substantial Completion goal (`goalSubstantialCompletionDate`)
- Safety goals stated at launch (`safetyGoals`)
- Critical path concerns stated at launch (`criticalPathConcerns`)
- Named safety officer and punch list manager at baseline (`safetyOfficerName`, `punchListManager`)

Closeout may capture the **actual** values for comparison (what actually happened), but the baseline values are read from the snapshot. Any Closeout module UI that re-asks for these values as input should instead surface the snapshot value as read-only context.

### 9.4 What Closeout May NOT Do with the Baseline

- Closeout may not PATCH or PUT any field in `StartupBaseline` (HTTP 405)
- Closeout may not write back to `ProjectExecutionBaseline`, `ExecutionBaselineSection`, or `BaselineSectionField`
- Closeout may not create new `ExecutionAssumption` records — it may annotate its own Autopsy records linking to assumption IDs, but the assumption records themselves are immutable after baseline lock
- Closeout may not modify `PlanTeamSignature` records

---

## 10. Cross-Reference

| Concern | Governing source |
|---|---|
| PM Plan field architecture | This file (T06) |
| StartupBaseline snapshot full field list | T02 §7.2 |
| Certification model and gate criteria | T02 §3.3 |
| Closeout read API | T02 §7.2, T10 §4 |
| Responsibility Matrix integration | T05 §10 |
| Activity and Health Spine publication | T08 §1–§2 |
| Role permissions for plan editing and approval | T09 §1 |
| `@hbc/versioned-record` usage | T02 §2.2 |
| P3-E10 Closeout module consumption | P3-E10 (reads StartupBaseline via T02 §7.2 contract) |

---

*[← T05](P3-E11-T05-Responsibility-Routing-and-Accountability-Engine.md) | [Master Index](P3-E11-Project-Startup-Module-Field-Specification.md) | [T07 →](P3-E11-T07-Startup-Safety-Readiness-and-Permit-Posting-Verification.md)*
