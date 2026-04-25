# Safety Field Excellence Candidate Scores

## 1. Objective

- Schema-authority-backed reference for `Safety Field Excellence Candidate Scores` at `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`.
- Backend-generated, machine-written candidate score records produced by the Safety Field Excellence rollup service. One record per (`ReportingPeriodId`, `ProjectWeekRecordId`).

## 2. List-Level Metadata

- Source Authority: `packages/features/safety/src/lists/fieldSchema.ts` (`SAFETY_FIELD_EXCELLENCE_CANDIDATE_SCORES_FIELDS`), `packages/features/safety/src/lists/descriptors.ts` (`SafetyFieldExcellenceCandidateScoresList`)
- List ID: `pending-tenant-extraction (zero-GUID fail-closed)`
- ID Provenance: provisioned by `SafetyProvisioningService` from `SAFETY_RECORD_KEEPING_CONTAINER_DEFINITIONS`; live tenant GUID to be captured after first provisioning run.
- Display Name: `Safety Field Excellence Candidate Scores`
- URL: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/Lists/Safety%20Field%20Excellence%20Candidate%20Scores`
- Root Folder URL: `/sites/HBCentral/Lists/Safety Field Excellence Candidate Scores`
- Template: `genericList (expected)`
- Classification: `business/custom`
- Description: `Backend-generated weekly safety excellence candidate score records.`
- Hidden: `false (expected)`
- Content Types Enabled: `false (expected)`

## 3. Field Schema

| Display Name                   | Internal Name                  | Type     | Required | Indexed | Lookup / Choices / Notes                                                  |
| ------------------------------ | ------------------------------ | -------- | -------- | ------- | ------------------------------------------------------------------------- |
| Title                          | Title                          | Text     | Yes      | No      | MaxLength=255                                                             |
| Reporting Period               | ReportingPeriodId              | Lookup   | Yes      | Yes     | Lookup → `Safety Reporting Periods`                                       |
| Project-Week Record            | ProjectWeekRecordId            | Lookup   | Yes      | Yes     | Lookup → `Safety Project Week Records`                                    |
| Project                        | ProjectLookupId                | Lookup   | No       | No      | Lookup → `Projects`                                                       |
| Project Number                 | ProjectNumber                  | Text     | Yes      | Yes     | Canonical project identity                                                |
| Project Name                   | ProjectNameSnapshot            | Text     | No       | No      | Snapshot                                                                  |
| Project Stage                  | ProjectStageSnapshot           | Text     | No       | No      | Snapshot                                                                  |
| Project Location               | ProjectLocationSnapshot        | Text     | No       | No      | Snapshot                                                                  |
| Eligibility Status             | EligibilityStatus              | Choice   | Yes      | No      | `eligible`, `ineligible`, `low-confidence`, `needs-review`                |
| Exclusion Reasons (JSON)       | ExclusionReasonsJson           | Note     | No       | No      | JSON array of reason codes                                                |
| Composite Score                | CompositeScore                 | Number   | No       | No      | 0–100                                                                     |
| Safety Performance Score       | SafetyPerformanceScore         | Number   | No       | No      | Sub-score                                                                 |
| Consistency Trend Score        | ConsistencyTrendScore          | Number   | No       | No      | Sub-score                                                                 |
| Activity Exposure Score        | ActivityExposureScore          | Number   | No       | No      | Sub-score                                                                 |
| Corrective Action Score        | CorrectiveActionScore          | Number   | No       | No      | Sub-score                                                                 |
| Data Quality Score             | DataQualityScore               | Number   | No       | No      | Sub-score                                                                 |
| Inspection Count (Window)      | InspectionCountWindow          | Number   | No       | No      | Rolling-window count                                                      |
| Inspection Count (Rolling)     | InspectionCountRolling         | Number   | No       | No      | Longer rolling count                                                      |
| Average Score (Window)         | AverageInspectionScoreWindow   | Number   | No       | No      | Window average                                                            |
| Average Score (Rolling)        | AverageInspectionScoreRolling  | Number   | No       | No      | Rolling average                                                           |
| Inspection Trend %             | InspectionTrendPct             | Number   | No       | No      | Can be negative                                                           |
| Highest Risk Level             | HighestRiskFindingLevel        | Choice   | No       | No      | `info`, `medium`, `high`                                                  |
| High Severity Count            | HighSeverityFindingCount       | Number   | No       | No      |                                                                           |
| Medium Severity Count          | MediumSeverityFindingCount     | Number   | No       | No      |                                                                           |
| Open Finding Count             | OpenFindingCount               | Number   | No       | No      |                                                                           |
| Aged Open Finding Count        | AgedOpenFindingCount           | Number   | No       | No      |                                                                           |
| Repeat Finding Count           | RepeatFindingCount             | Number   | No       | No      |                                                                           |
| Activity Evidence Status       | ActivityEvidenceStatus         | Choice   | No       | No      | `proven`, `inferred`, `missing`                                           |
| Activity Evidence (JSON)       | ActivityEvidenceJson           | Note     | No       | No      | JSON evidence bag                                                         |
| Reason Summary                 | ReasonSummary                  | Note     | No       | No      | Human-readable rationale                                                  |
| Source Inspection IDs (JSON)   | SourceInspectionIdsJson        | Note     | No       | No      | JSON array of inspection event IDs                                        |
| Source Finding IDs (JSON)      | SourceFindingIdsJson           | Note     | No       | No      | JSON array of finding IDs                                                 |
| Generated At                   | GeneratedAt                    | DateTime | Yes      | Yes     | Generator timestamp                                                       |
| Generator Version              | GeneratorVersion               | Text     | Yes      | No      | E.g. `scoring-v1`                                                         |
| Publish Recommendation         | PublishRecommendation          | Choice   | No       | No      | `primary`, `secondary`, `monitor`, `do-not-publish`                       |

## 4. Content Types / Forms / Behavioral Context

- Associated Content Types: `Item` (expected)
- Default List Forms: `/sites/HBCentral/Lists/Safety Field Excellence Candidate Scores/AllItems.aspx` (expected)
- Observed Role Hint: machine-generated rollup output; reviewed by Safety leadership before any homepage publication.

## 5. Relationship Observations

- Outbound lookup references:
  - `ReportingPeriodId` → `Safety Reporting Periods`
  - `ProjectWeekRecordId` → `Safety Project Week Records`
  - `ProjectLookupId` → `Projects`
- Inbound references:
  - `Safety Field Excellence Weekly Highlights.PrimaryCandidateId`
  - `Safety Field Excellence Weekly Highlights.SecondaryCandidateIdsJson` (logical, JSON)
  - `Safety Field Excellence Weekly Highlights.SourceCandidateIdsJson` (logical, JSON)

## 6. Implementation-Relevant Findings

- Critical fields from descriptor contract: `ReportingPeriodId`, `ProjectWeekRecordId`, `ProjectNumber`, `EligibilityStatus`, `CompositeScore`, `GeneratedAt`, `PublishRecommendation`.
- Locked choice vocabularies (do not drift in later prompts):
  - `EligibilityStatus`: `eligible`, `ineligible`, `low-confidence`, `needs-review`
  - `ActivityEvidenceStatus`: `proven`, `inferred`, `missing`
  - `PublishRecommendation`: `primary`, `secondary`, `monitor`, `do-not-publish`
- JSON-in-Note columns (`ExclusionReasonsJson`, `ActivityEvidenceJson`, `SourceInspectionIdsJson`, `SourceFindingIdsJson`) are not schema-enforced; writers in Wave 04 must hold the contract.

## 6.1 Required Indexed Columns

Indexed via `SpFieldDefinition.indexed: true`, applied through `SafetyProvisioningService.provisionSafetyContainer()` and `SharePointProvisioningService.addListField()`:

| Column                | Why indexed is required                                                              |
| --------------------- | ------------------------------------------------------------------------------------ |
| `ReportingPeriodId`   | Primary filter for weekly candidate set retrieval; unindexed access trips 5k threshold. |
| `ProjectWeekRecordId` | Natural-key narrowing when joining candidates back to weekly project rollup state.   |
| `ProjectNumber`       | Narrowing filter for project-scoped queries and audit lookups.                       |
| `GeneratedAt`         | Recency filter for the most-recent generator pass per reporting period.              |

Provisioning honors `indexed: true` at field create time and detects/repairs index drift on existing fields. In dry-run, drift detection on **existing** fields produces `outcome: 'updatedOrRepaired'` with the message `Dry-run: Indexed would be set to true.`. Missing fields are reported as `would be created`; index is applied at real-run create time.

## 7. Open Questions / Follow-Up Checks

- Confirm tenant GUID and item count after first provisioning run; replace `pending-tenant-extraction` with the real list ID.
- Confirm indexed-column posture under production query load.
- Re-extract after provisioning to replace the pending GUID with tenant-truth values.
