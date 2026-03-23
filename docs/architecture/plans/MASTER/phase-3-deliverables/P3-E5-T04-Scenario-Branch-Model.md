# P3-E5 — Schedule Module: Scenario Branch Model

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E5-T04 |
| **Parent** | [P3-E5 Schedule Module Field Specification](P3-E5-Schedule-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T04: Scenario Branch Model |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-23 |

---

## 5. Scenario Branch Model

Scenarios are first-class governed records. A scenario branch is an alternative schedule projection derived from a specific baseline and update snapshot. Scenarios may incorporate alternative logic, modified commitment dates, and different assumptions. Promotion of a scenario to managed commitment or published forecast requires governed approval.

### 5.1 ScenarioBranch

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| scenarioId | `string` | Yes | UUID |
| projectId | `string` | Yes | FK to project |
| scenarioName | `string` | Yes | Display name |
| scenarioType | `enum` | Yes | `RecoverySchedule` \| `AccelerationOption` \| `WhatIfAnalysis` \| `DelayImpact` \| `BaselineCandidate` \| `Other` |
| status | `enum` | Yes | `Draft` \| `UnderReview` \| `Approved` \| `Rejected` \| `PromotedToCommitment` \| `PromotedToPublication` \| `Archived` |
| branchFromVersionId | `string` | Yes | FK to ScheduleVersionRecord; the import snapshot this scenario branches from |
| branchFromBaselineId | `string` | Yes | FK to BaselineRecord; the baseline this scenario compares against |
| assumptionSet | `string` | Yes | Narrative description of key assumptions |
| scenarioNotes | `string` | No | Additional context |
| createdBy | `string` | Yes | userId |
| createdAt | `datetime` | Yes | Immutable |
| reviewedBy | `string` | No | userId of reviewer |
| reviewedAt | `datetime` | No | Timestamp |
| promotionDisposition | `enum` | No | `None` \| `PromoteToCommitment` \| `PromoteToPublication` \| `PromoteToBaseline` |
| promotedAt | `datetime` | No | When promotion occurred |
| promotedBy | `string` | No | userId who approved promotion |

### 5.2 ScenarioActivityRecord

Each scenario branch carries its own projected dates for activities of interest. Activities not overridden inherit their values from the branch source version.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| scenarioActivityId | `string` | Yes | UUID |
| scenarioId | `string` | Yes | FK to ScenarioBranch |
| externalActivityKey | `string` | Yes | Activity identity |
| scenarioStartDate | `datetime` | No | Projected start in this scenario; null = inherit from source |
| scenarioFinishDate | `datetime` | No | Projected finish in this scenario; null = inherit from source |
| scenarioFloatHrs | `number` | No | Projected float in this scenario |
| scenarioCausationCode | `string` | No | Why this activity's dates differ from source |
| assumptions | `string` | No | Activity-specific assumptions |

### 5.3 ScenarioLogicRecord

Captures alternative logic relationships used within this scenario that differ from the imported CPM network.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| scenarioLogicId | `string` | Yes | UUID |
| scenarioId | `string` | Yes | FK to ScenarioBranch |
| predecessorKey | `string` | Yes | externalActivityKey of predecessor |
| successorKey | `string` | Yes | externalActivityKey of successor |
| relationshipType | `enum` | Yes | `FS` \| `SS` \| `FF` \| `SF` |
| lagHrs | `number` | No | Lag in hours; negative = lead |
| logicSource | `enum` | Yes | `ScenarioOverride` \| `WorkPackageLink` |
| promotionEligible | `boolean` | Yes | Whether this logic may be promoted to operating layer |

### 5.4 Scenario Promotion Rules

- Promotion from `ScenarioBranch` to `PromotedToCommitment` creates ManagedCommitmentRecords for the activity overrides in the scenario.
- Promotion to `PromotedToPublication` creates a `Draft` PublicationRecord pre-populated with scenario dates.
- Promotion to `PromoteToBaseline` requires PE approval and creates a new BaselineRecord.
- All promotions are Governed; the Manager of Operational Excellence configures which scenario types are promotion-eligible.
- Promotion does not modify source snapshots.

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
