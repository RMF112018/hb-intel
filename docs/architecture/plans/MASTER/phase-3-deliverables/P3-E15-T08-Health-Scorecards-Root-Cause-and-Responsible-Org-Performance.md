# P3-E15-T08 — Health, Scorecards, Root Cause, and Responsible-Org Performance

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E15-T08 |
| **Parent** | [P3-E15 QC Module Field Specification](P3-E15-QC-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T08 of 10 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. Governing Principle: QC Health Is a Derived Read Model

QC health, quality scorecards, responsible-organization performance, and governed learning outputs are derived projections built from QC source records. They are not a second operational workspace, not editable alternatives to QC source records, and not a replacement for the shared Project Health contract.

The governing model is:

```text
QC operational records
  → governed computation and snapshoting
  → project-level quality health / scorecard projection
  → responsible-organization rollup and drilldown
  → governed learning and update notices
```

### 1.1 What T08 owns

- `QualityHealthSnapshot` as the immutable project-level quality posture read model.
- scorecard composition, weighting philosophy, status bands, drilldown rules, and leadership visibility boundary.
- `ResponsibleOrgPerformanceRollupInput` as the frozen per-snapshot rollup input set.
- `RootCauseAndRecurrenceRecord` governance posture for quality learning and recurrence qualification.
- the governed learning pipeline from confirmed project findings back into standards, best-practice packets, taxonomy, coverage logic, and update notices.

### 1.2 What T08 does not own

- direct editing of QC source records from scorecard or dashboard surfaces,
- field/mobile execution workflows,
- portfolio-wide health ownership beyond QC’s quality contribution,
- ad hoc project-authored scorecard formulas,
- or direct governed publication without MOE/Admin.

---

## 2. Record and Read-Model Contracts

T03 locked the existence of the governing records. T08 defines how they behave in the health and learning layer.

### 2.1 `QualityHealthSnapshot`

`QualityHealthSnapshot` is the immutable project-level quality posture snapshot for a single governed computation cycle.

| Field | Rule |
|---|---|
| `qualityHealthSnapshotId` | Immutable UUID |
| `projectId` | Required |
| `sourceProjectQcSnapshotId` | Required link to the governing `ProjectQcSnapshot` used for the computation cycle |
| `computedAt` | Required timestamp |
| `computedBy` | Required actor or service identity |
| `governedFormulaVersion` | Required |
| `projectOverlayVersion` | Nullable; required when project overlay adjustments are active |
| `overallQualityScore` | Required numeric score |
| `overallQualityStatus` | Required governed status band |
| `confidenceTier` | Required confidence band |
| `planGateReadinessScore` | Required domain score |
| `issueActionPerformanceScore` | Required domain score |
| `exceptionDependencyScore` | Required domain score |
| `evidenceVerificationScore` | Required domain score |
| `recurrenceLearningScore` | Required domain score |
| `manualReviewPressure` | Required rollup indicator derived from advisory, exception, and approval pressure |
| `topDrivers` | Required list of reason-coded contributors |
| `topRecommendedActionRefs` | Required list of recommended next-action refs |
| `drilldownAvailability` | Required descriptor of supported drilldown cuts |

**Governing rule:** once issued, a `QualityHealthSnapshot` is immutable. Recalculation creates a new snapshot.

### 2.2 `ResponsibleOrgPerformanceRollupInput`

`ResponsibleOrgPerformanceRollupInput` is the normalized per-organization rollup input frozen for a specific `QualityHealthSnapshot`.

| Field | Rule |
|---|---|
| `responsibleOrgPerformanceRollupInputId` | Immutable UUID |
| `projectId` | Required |
| `qualityHealthSnapshotId` | Required |
| `organizationKey` | Required normalized responsible-organization key |
| `organizationDisplayName` | Required |
| `workPackageRefs` | Required set of associated work packages |
| `openIssueCount` | Required |
| `overdueIssueCount` | Required |
| `verifiedClosureRate` | Required |
| `reopenedCount` | Required |
| `recurrenceQualifiedCount` | Required |
| `deviationCount` | Required |
| `approvalLagDays` | Required |
| `advisoryFailureCount` | Required |
| `planGateFailureCount` | Required |
| `evidenceRejectionCount` | Required |
| `rollupBand` | Required derived band |

**Governing rule:** rollup inputs are derived and frozen per snapshot. They are not editable score rows.

### 2.3 `RootCauseAndRecurrenceRecord`

`RootCauseAndRecurrenceRecord` remains a QC operational analysis record, but T08 defines its health and learning posture.

| Field | Rule |
|---|---|
| `rootCauseAndRecurrenceRecordId` | Immutable UUID |
| `projectId` | Required |
| `linkedQcIssueIds` | Required one or more issue/action refs |
| `rootCauseCategory` | Required governed category |
| `recurrenceClassification` | Required governed recurrence classification |
| `contributingFactors` | Required governed factor list |
| `learningRecommendation` | Required structured recommendation output |
| `learningCandidateType` | Required: standard, best-practice packet, taxonomy, coverage-set, scorecard logic, or advisory rule |
| `analysisStatus` | Required: `draft`, `confirmed`, `published-to-learning`, or `superseded` |
| `confirmedBy` | Required when confirmed |
| `publishedNoticeRef` | Nullable link to `GovernedUpdateNotice` when promoted |

### 2.4 Supporting records

- `ProjectQcSnapshot` remains the immutable source snapshot for quality health, handoffs, and update notices.
- `GovernedUpdateNotice` remains the enterprise-governed publication record for promoted learning and governed changes.

---

## 3. Project Quality Health Model

### 3.1 Composite posture

QC health is a governed composite posture, not a single metric. It must answer:

- Are plans, gates, and readiness conditions healthy and current?
- Are issues and corrective actions being resolved and verified effectively?
- Are deviations, approvals, and advisory exceptions carrying too much project risk?
- Is evidence sufficiency strong enough to trust closure and readiness?
- Are recurrence patterns being analyzed and converted into learning?

### 3.2 Required scorecard domains

`QualityHealthSnapshot` must compute at minimum these domains:

| Domain | Purpose | Source record families |
|---|---|---|
| Plan and gate readiness | readiness of active plans, review packages, and quality prerequisites | `WorkPackageQualityPlan`, `PreconstructionReviewPackage`, `ReviewFinding` |
| Issue and corrective-action performance | performance of issue/action routing, aging, and verifier-close quality | `QcIssue`, `CorrectiveAction`, `ResponsiblePartyAssignment` |
| Exception and dependency pressure | degree to which quality posture depends on exceptions or slow approvals | `DeviationOrWaiverRecord`, `ExternalApprovalDependency`, `AdvisoryException` |
| Evidence and verification quality | strength of evidence sufficiency and acceptance posture | `EvidenceReference`, `QcIssue`, `CorrectiveAction` |
| Recurrence and learning posture | repeat-pattern detection and learning conversion quality | `RootCauseAndRecurrenceRecord`, `GovernedUpdateNotice`, `ProjectQcSnapshot` |

### 3.3 Status bands

| Band | Meaning |
|---|---|
| `healthy` | quality obligations, evidence, and readiness posture are within governed thresholds |
| `watch` | emerging pressure exists; drilldown warranted |
| `at-risk` | multiple warning signals or one material lagging failure exists |
| `critical` | readiness degradation, repeated recurrence, or blocker-level exception posture exists |
| `data-pending` | insufficient or stale data prevents reliable classification |

The formulas and thresholds are MOE/Admin-governed. Projects may not define alternate scorecard bands.

---

## 4. Weighting Philosophy and Scorecard Inputs

### 4.1 Weighting philosophy

QC scorecards must follow the same repo health doctrine used elsewhere:

- leading / predictive quality indicators dominate lagging results,
- lagging signals confirm deterioration and can escalate posture,
- formulas, weights, and status bands are governed by MOE/Admin,
- projects may adjust thresholds only within the controlled-adjustment rules in T02.

### 4.2 Scorecard input matrix

| Scorecard domain | Required input signals |
|---|---|
| Plan and gate readiness | unaccepted mandatory plans, blocked control gates, due-soon mockups/tests/preinstallation meetings, high-risk review gaps |
| Issue and action performance | open issue count, overdue actions, verified closure rate, reopened count, SLA breaches, reviewer backlog |
| Exception and dependency pressure | active deviations, soon-to-expire waivers, approval dependencies awaiting response, advisory exceptions in use |
| Evidence and verification quality | evidence-accepted ratio, rejected evidence count, minimum-evidence misses, verification turnaround aging |
| Recurrence and learning posture | recurrence-qualified issue count, confirmed root-cause coverage, repeated reopen rate, learning-candidate conversion rate |

### 4.3 Input interpretation rule

Derived scorecards must reference source records and computed trends only. They may not become locally edited status rows or manual RAG overrides inside QC.

---

## 5. Drilldown Expectations

Every scorecard and quality health view must drill back to QC source records.

### 5.1 Minimum drilldown cuts

Derived QC metrics must support drilldown by:

- work package,
- record family,
- responsible organization,
- cause category,
- aging bucket,
- verifier status,
- readiness impact,
- snapshot version.

### 5.2 Drillback rule

Every metric displayed from `QualityHealthSnapshot` or a responsible-organization rollup must resolve back to:

- contributing source records,
- the governed formula or rule class,
- the snapshot version used,
- and any exception/manual-review contributors that affected posture.

### 5.3 Leadership visibility rule

Leadership-facing dashboards and Project Hub surfaces consume derived posture and drilldown entry points only. Operational editing remains inside QC surfaces.

---

## 6. Responsible-Organization Performance Model

### 6.1 Purpose

Responsible-organization performance is a governed quality rollup used to answer:

- Which organizations repeatedly carry open or overdue quality obligations?
- Which organizations achieve first-pass verified closure?
- Which organizations generate repeated exception or recurrence patterns?

It is not a standalone vendor-management or procurement system.

### 6.2 Core performance dimensions

| Dimension | Examples |
|---|---|
| Responsiveness | open vs overdue items, SLA adherence, approval turnaround |
| Closure quality | first-pass verification rate, reopened-after-verification rate |
| Exception dependence | active deviations, waivers, advisory exceptions linked to the organization |
| Evidence quality | evidence rejection rate, minimum-evidence miss rate |
| Recurrence posture | repeated cause categories, recurrence-qualified issues, learning conversion quality |

### 6.3 Project vs enterprise boundary

Project-level responsible-organization rollups are visible in project context. Enterprise-wide organization trends are derived from published project snapshots and update notices, not from live project records.

---

## 7. Root-Cause and Recurrence Coding Model

### 7.1 Governed coding requirement

Root-cause and contributing-factor coding is governed enterprise taxonomy, not project-local free text. Every confirmed record must classify:

- one primary root-cause category,
- zero or more contributing factors,
- one recurrence classification,
- one learning recommendation type.

### 7.2 Minimum recurrence classes

| Recurrence classification | Meaning |
|---|---|
| `isolated` | no governed repeat pattern detected |
| `repeat-within-work-package` | repeat in the same work package or tightly bounded scope |
| `repeat-across-work-packages` | repeat across multiple work packages on the same project |
| `repeat-across-organizations` | repeat affecting multiple responsible organizations |
| `repeat-enterprise-candidate` | pattern strong enough for governed enterprise learning review |

### 7.3 Mandatory analysis triggers

`RootCauseAndRecurrenceRecord` analysis is required when:

- a `QcIssue` or `CorrectiveAction` is reopened after verification,
- a recurrence pattern is detected,
- a high-severity issue materially affects turnover-quality readiness,
- the same responsible organization generates repeated cause patterns,
- or T05 classifies the case as learning-qualified.

### 7.4 Health impact

Required-but-missing recurrence analysis must degrade the recurrence/learning domain in `QualityHealthSnapshot`.

---

## 8. Governed Learning Pipeline

### 8.1 Pipeline stages

```text
QC source records
  → confirmed root-cause / recurrence analysis
  → learning recommendation candidate
  → MOE/Admin review
  → governed update notice / promoted content
  → project adoption and future snapshot influence
```

### 8.2 Eligible learning targets

Confirmed findings may generate candidates for:

- `GovernedQualityStandard` updates,
- governed best-practice packet updates,
- taxonomy refinements,
- mandatory coverage-set changes,
- submittal-advisory rule refinements,
- scorecard or root-cause model refinements.

### 8.3 Publishing rule

Projects never publish governed learning directly. MOE/Admin reviews candidate signals and, if accepted, publishes a `GovernedUpdateNotice` and promoted governed content version.

---

## 9. Project vs Enterprise Reporting Boundary

### 9.1 Project reporting

Project reporting may show:

- current and historical `QualityHealthSnapshot` views,
- work-package and cause-category drilldowns,
- responsible-organization performance within the project,
- readiness and turnover-quality posture.

### 9.2 Enterprise reporting

Enterprise reporting may show only derived or published layers:

- cross-project quality rollup trends,
- repeat root-cause themes,
- responsible-organization performance trends from published snapshots,
- governed learning adoption and update-notice impact.

Enterprise reporting may not directly edit or bypass project QC source records.

### 9.3 Relationship to Reports, dashboards, and leadership visibility

- [P3-D2-Project-Health-Contract.md](P3-D2-Project-Health-Contract.md) remains the shared health-spine contract.
- [P3-E9-T08](P3-E9-T08-Spine-Publication-Work-Queue-Related-Items-and-Health.md) provides the mature read-model publication pattern into Project Hub and reports.
- [P3-E8-T09](P3-E8-T09-Publication-Contracts-Project-Hub-PER-and-Reports.md) provides the composite-scorecard publication pattern for a peer module.

Leadership dashboards consume derived quality posture, confidence, and drilldown entry points. They do not operate QC source records.

---

## 10. Shared Contract Alignment

### 10.1 Health spine

QC must align its quality projection to the shared Health contract:

- deterministic computation,
- immutable snapshots,
- explainability and confidence,
- derived recommended actions,
- no hidden source-record mutation.

### 10.2 Work Queue and Related Items consistency

T08 must not redefine the T05 work-queue publication contract or create a separate relationship store. Health surfaces may consume those signals and relationships but remain derived readers.

---

## 11. Acceptance Framing

T08 is acceptable only when:

1. quality health is a derived, immutable read model rather than an editable operational record,
2. scorecards drill back to QC source records by work package, record family, organization, cause category, and aging bucket,
3. responsible-organization rollups are computed from frozen per-snapshot inputs,
4. qualifying root-cause / recurrence cases require governed analysis,
5. the learning pipeline can create governed candidates without bypassing MOE/Admin publishing authority,
6. project and enterprise reporting boundaries remain distinct and role-correct.

---

## 12. Cross-References

- [P3-E15-T02](P3-E15-T02-Governance-Ownership-and-Versioning.md)
- [P3-E15-T03](P3-E15-T03-Record-Families-Authority-and-Data-Model.md)
- [P3-E15-T05](P3-E15-T05-Issues-Corrective-Actions-and-Work-Queue-Publication.md)
- [P3-E15-T06](P3-E15-T06-Deviations-Evidence-and-External-Approval-Dependencies.md)
- [P3-E15-T07](P3-E15-T07-Submittal-Completeness-Advisory.md)
- [P3-D2-Project-Health-Contract.md](P3-D2-Project-Health-Contract.md)
- [P3-E9-T08](P3-E9-T08-Spine-Publication-Work-Queue-Related-Items-and-Health.md)
- [P3-E8-T09](P3-E8-T09-Publication-Contracts-Project-Hub-PER-and-Reports.md)
