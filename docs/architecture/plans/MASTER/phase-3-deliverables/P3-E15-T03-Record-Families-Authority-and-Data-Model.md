# P3-E15-T03 — Record Families, Authority, and Data Model

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E15-T03 |
| **Parent** | [P3-E15 Project Hub QC Module](P3-E15-QC-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T03 of 10 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. Canonical Record Vocabulary

The following vocabulary is locked across the P3-E15 family and must be used consistently:

- `GovernedQualityStandard`
- `ProjectQualityExtension`
- `WorkPackageQualityPlan`
- `PreconstructionReviewPackage`
- `ReviewFinding`
- `QcIssue`
- `CorrectiveAction`
- `DeviationOrWaiverRecord`
- `EvidenceReference`
- `ExternalApprovalDependency`
- `ResponsiblePartyAssignment`
- `RootCauseAndRecurrenceRecord`
- `QualityHealthSnapshot`
- `GovernedUpdateNotice`
- `ProjectQcSnapshot`
- `ResponsibleOrgPerformanceRollupInput`
- `SubmittalItemRecord`
- `DocumentInventoryEntry`
- `AdvisoryVerdict`
- `AdvisoryException`
- `VersionDriftAlert`

Supporting child/reference structures are also required where applicable:

- `SubmittalSpecLinkRef`
- `SubmittalPackageLinkRef`
- `WorkPackageRef`
- `ReviewPackageRef`
- `DownstreamHandoffRef`

---

## 2. Record-Family Inventory

### 2.1 Governed Standards and Extension Families

| Record family | Source-of-truth owner | Required identifiers | Required metadata set | Version / publication expectation | State foundation | Lineage and handoff |
|---|---|---|---|---|---|---|
| `GovernedQualityStandard` | QC module governed-core store; published by MOE/Admin | `governedQualityStandardId`, `standardKey`, `governedVersionId` | title, discipline, governed taxonomy path, requirement text, applicability, minimum evidence rule refs, source provenance, publication metadata | Published governed versions; immutable once published; supersession via new governed version | `draft` → `under-review` → `published` → `superseded` / `retired` | Upstream root of plans, review templates, mapping logic, and issue lineage |
| `ProjectQualityExtension` | QC module project store | `projectQualityExtensionId`, `projectId`, `parentGovernedKey`, `extensionVersionId` | project rationale, taxonomy parent, constrained scope, approval metadata, provenance, promotion status | Project-scoped versioning; may later be promoted | `draft` → `approved-project-only` / `submitted-for-promotion` → `promoted` / `rejected` / `retired` | Attaches to governed core; may flow into plans and advisory logic but never bypasses governed parentage |

### 2.2 Planning and Review Families

| Record family | Source-of-truth owner | Required identifiers | Required metadata set | Version / publication expectation | State foundation | Lineage and handoff |
|---|---|---|---|---|---|---|
| `WorkPackageQualityPlan` | QC module project store | `workPackageQualityPlanId`, `projectId`, `workPackageKey`, `planVersionId` | governed-standard refs, project-extension refs, responsible organization + optional individual, verifier designation, mandatory / high-risk additions, soft-gate set, due dates, status, schedule refs | Mutable working versions; approved baseline version retained; snapshots reference plan version | `draft` → `in-review` → `active` → `revised` / `superseded` / `closed` | Instantiated from governed standards; feeds review packages, issues, deviations, health, and handoffs |
| `PreconstructionReviewPackage` | QC module project store | `preconstructionReviewPackageId`, `projectId`, `reviewPackageKey`, `reviewVersionId` | package type, scope, linked work package, required disciplines, required reviewers, package references, spec references, decision status, meeting / due dates | Versioned review package record; accepted versions are frozen | `draft` → `submitted` → `under-review` → `accepted` / `accepted-with-conditions` / `returned` / `voided` | Consumes plans and standards; produces `ReviewFinding` records and downstream obligations |
| `ReviewFinding` | QC module project store | `reviewFindingId`, `projectId`, `findingKey` | origin review package, finding type, severity, responsible organization + optional individual, due date, disposition, evidence expectations, linked requirement refs | Immutable origin linkage; mutable disposition history via versioned updates | `open` → `accepted` / `deferred` / `converted-to-issue` / `closed` | Must preserve lineage to originating review package and may spawn `QcIssue` |

### 2.3 Issue, Action, and Exception Families

| Record family | Source-of-truth owner | Required identifiers | Required metadata set | Version / publication expectation | State foundation | Lineage and handoff |
|---|---|---|---|---|---|---|
| `QcIssue` | QC module project store | `qcIssueId`, `projectId`, `issueKey` | issue origin (`finding`, `ad-hoc`, `advisory`, `deviation-fallback`), work-package ref, responsible organization + optional individual, verifier designation, severity, due date, SLA class, readiness impact, root-cause placeholder | Full mutation history via `@hbc/versioned-record`; published into My Work and snapshots | `open` → `in-progress` → `ready-for-review` → `verified` / `closed` / `voided` / `escalated` | May originate from findings or ad hoc; feeds corrective actions, health, rollups, and downstream handoffs |
| `CorrectiveAction` | QC module project store | `correctiveActionId`, `projectId`, `actionKey`, `qcIssueId` | action description, responsible organization + optional individual, verifier designation, due date, evidence expectation refs, status, escalation flags | Versioned working record; verification event is immutable in history | `open` → `in-progress` → `ready-for-review` → `verified` / `closed` / `overdue` / `voided` | Child of `QcIssue`; may reference evidence, approval dependencies, and deviations |
| `DeviationOrWaiverRecord` | QC module project store | `deviationOrWaiverRecordId`, `projectId`, `exceptionKey` | exception type, governed rule reference, rationale, approver set, expiry, affected plan / issue / advisory refs, responsible organization + optional individual | Approved exception versions are frozen; later changes create new version | `draft` → `submitted` → `approved` / `rejected` / `expired` / `withdrawn` | May temporarily alter plan, issue, advisory, or evidence requirements; must preserve affected lineage |

### 2.4 Evidence and Approval Families

| Record family | Source-of-truth owner | Required identifiers | Required metadata set | Version / publication expectation | State foundation | Lineage and handoff |
|---|---|---|---|---|---|---|
| `EvidenceReference` | QC module project store | `evidenceReferenceId`, `projectId`, `evidenceKey` | source system ref, document reference, evidence type, evidence date, responsible organization + optional individual, minimum-rule ref, review status, linked record refs | References are mutable until accepted; file blobs are not stored in QC | `captured` → `submitted` → `accepted` / `rejected` / `superseded` | Supports plans, issues, corrective actions, deviations, approval dependencies, and handoffs |
| `ExternalApprovalDependency` | QC module project store | `externalApprovalDependencyId`, `projectId`, `dependencyKey` | approval authority, required decision, due date, submission reference, current status, responsible organization + optional individual, escalation class | Versioned operational record; decision receipts retained immutably | `not-started` → `submitted` → `awaiting-response` → `approved` / `rejected` / `expired` / `waived` | May block readiness, corrective-action closure, or plan activation; feeds issue and health posture |
| `ResponsiblePartyAssignment` | QC module project store | `responsiblePartyAssignmentId`, `projectId`, `assignmentKey` | owning record ref, responsible organization, optional individual, role basis, verifier designation, effective dates | Assignment changes are versioned to preserve responsibility history | `active` → `superseded` / `ended` | Shared assignment primitive for plans, issues, actions, deviations, approval dependencies, and advisory follow-up |

### 2.5 Root Cause, Health, and Snapshot Families

| Record family | Source-of-truth owner | Required identifiers | Required metadata set | Version / publication expectation | State foundation | Lineage and handoff |
|---|---|---|---|---|---|---|
| `RootCauseAndRecurrenceRecord` | QC module project store | `rootCauseAndRecurrenceRecordId`, `projectId`, `analysisKey` | linked issue / action refs, governed root-cause category, recurrence classification, contributing factors, learning recommendation, responsible organization | Versioned analysis history; closed analyses remain queryable for trend logic | `draft` → `confirmed` → `published-to-learning` / `superseded` | Consumes issue lineage and feeds health snapshots and responsible-org rollups |
| `QualityHealthSnapshot` | Derived QC read model | `qualityHealthSnapshotId`, `projectId`, `snapshotAt` | plan posture, issue aging, corrective-action posture, approval dependency posture, advisory posture, root-cause trend, responsible-org rollup summary, readiness signals | Immutable derived snapshots; published at governed intervals | `computed` → `published` / `superseded` | Drives Project Hub projection and management visibility only; no direct edits |
| `ProjectQcSnapshot` | QC module snapshot store | `projectQcSnapshotId`, `projectId`, `snapshotVersionId` | governed-version refs, active plan refs, issue posture, deviation posture, approval posture, advisory posture, rollup posture, handoff refs | Immutable once published; retained for audit and downstream continuity | `working` → `project-baseline` / `snapshot-published` → `superseded` | Used for update notices, downstream module handoff, and management projection |
| `GovernedUpdateNotice` | QC module governed-notice store | `governedUpdateNoticeId`, `governedChangeKey`, `publishedVersionId` | changed family, impact description, adoption requirement, effective date, recheck instruction, affected records | Published notice is immutable; later notices supersede earlier ones | `published` → `resolved` / `superseded` | Informs project adoption and recheck flows; may force advisory review or plan rebasing |
| `ResponsibleOrgPerformanceRollupInput` | QC module derived input store | `responsibleOrgPerformanceRollupInputId`, `projectId`, `organizationKey`, `sourceSnapshotId` | normalized counts, verified closure rates, deviation counts, recurrence counts, approval lag, advisory failure counts | Derived inputs frozen per snapshot | `computed` → `consumed` / `superseded` | Feeds responsible-organization rollup logic and scorecards |

### 2.6 Submittal Advisory Families

| Record family | Source-of-truth owner | Required identifiers | Required metadata set | Version / publication expectation | State foundation | Lineage and handoff |
|---|---|---|---|---|---|---|
| `SubmittalItemRecord` | QC module project store | `submittalItemRecordId`, `projectId`, `itemKey` | required `SubmittalSpecLinkRef`, required `SubmittalPackageLinkRef`, product/material/system identity, responsible organization + optional individual, approved-project-basis ref, activation stage, linked work package | Persistent item record across revisions and resubmittals | `draft` → `preliminary-guidance` → `package-review-active` → `accepted-advisory` / `exception-approved` / `manual-review-required` / `superseded` | Parallel advisory lineage: spec + package ref + inventory + verdicts + drift alerts |
| `DocumentInventoryEntry` | QC module project store | `documentInventoryEntryId`, `projectId`, `submittalItemRecordId`, `inventoryKey` | document family, source reference, version label, publisher, publication date, currentness status, reference-match metadata, minimum metadata compliance | Versioned by entry revisions; no file storage | `captured` → `confirmed` → `verified` / `unable-to-verify` / `superseded` | Child inventory record for advisory evaluation |
| `AdvisoryVerdict` | QC module project store | `advisoryVerdictId`, `projectId`, `submittalItemRecordId`, `verdictVersionId` | completeness verdict, currentness verdict, reference-match confidence, manual-review-required flag, evaluated-at, evaluator type, mapping outcome | Immutable verdict record per evaluation cycle | `issued` → `superseded` | Derived from item + inventory + governed mapping; may generate issue/advisory follow-up |
| `AdvisoryException` | QC module project store | `advisoryExceptionId`, `projectId`, `submittalItemRecordId`, `exceptionVersionId` | exception rationale, approving authority, scope, expiry, affected verdict refs, approved project basis rule | Approved exception versions are frozen | `draft` → `submitted` → `approved` / `rejected` / `expired` | Applies only to advisory follow-up; does not replace project basis or workflow lineage |
| `VersionDriftAlert` | QC module project store | `versionDriftAlertId`, `projectId`, `submittalItemRecordId`, `alertKey` | official-source change ref, impacted inventory entries, conflict status, recheck due date, responsible organization + optional individual | Alert history retained; later alerts may supersede earlier notices | `open` → `acknowledged` → `rechecked` / `resolved` / `superseded` | Extends advisory lineage after initial verdict issuance |

---

## 3. Source-of-Truth and Authority Matrix

| Concern | QC owns | Adjacent module owns |
|---|---|---|
| Quality standards, plans, findings, issues, deviations, evidence refs, approval dependencies, advisory records, snapshots | Yes | No |
| Startup commissioning execution and certification | No | Project Startup |
| Closeout turnover package and archive gate | No | Project Closeout |
| Warranty case lifecycle and coverage operations | No | Project Warranty |
| Detailed schedule network and milestone authority | No | Schedule |
| File storage and artifact binaries | No | Governed document system via `@hbc/sharepoint-docs` and adjacent modules |
| My Work routing and aggregation | Publishes only | Work Queue spine |
| Relationship graph rendering | Publishes only | Related Items spine |
| Project-canvas health tile semantics | Publishes metrics only | Health spine / Project Canvas |

---

## 4. Required Metadata Families

### 4.1 Plan-Level Metadata (`WorkPackageQualityPlan`)

Required metadata families:

- project identity and work-package identity,
- governed-standard and project-extension references,
- responsible organization + optional individual,
- verifier designation,
- required plan-set members,
- soft-gate members,
- required evidence minimum refs,
- schedule-awareness refs,
- downstream handoff flags.

### 4.2 Review-Level Metadata (`PreconstructionReviewPackage`, `ReviewFinding`)

Required metadata families:

- linked plan/work package,
- review type and discipline set,
- package/spec references,
- reviewer set and due dates,
- finding severity and disposition,
- finding-to-issue conversion status,
- responsible organization + optional individual,
- evidence expectation refs.

### 4.3 Issue-Level Metadata (`QcIssue`, `CorrectiveAction`)

Required metadata families:

- origin type,
- linked plan / finding / advisory refs,
- responsible organization + optional individual,
- verifier designation,
- due date and SLA class,
- readiness impact,
- root-cause placeholder or confirmed record ref,
- evidence requirement refs,
- escalation state.

### 4.4 Deviation-Level Metadata (`DeviationOrWaiverRecord`)

Required metadata families:

- governed rule or requirement being deviated from,
- affected record refs,
- responsible organization + optional individual,
- approver set,
- effective dates,
- rationale,
- expiry or review-by date,
- linked evidence refs,
- downstream impact flags.

### 4.5 Approval-Dependency Metadata (`ExternalApprovalDependency`)

Required metadata families:

- authority or external body,
- submission ref,
- required decision,
- due / aging dates,
- responsible organization + optional individual,
- escalation class,
- linked plans/issues/actions,
- acceptance or rejection receipt refs.

### 4.6 Evidence-Reference Metadata (`EvidenceReference`)

Required metadata families:

- source system and document reference,
- evidence type,
- evidence date,
- linked record refs,
- minimum-rule ref,
- responsible organization + optional individual where applicable,
- review / acceptance status,
- supersession ref when replaced.

### 4.7 Advisory Metadata (`SubmittalItemRecord`, `DocumentInventoryEntry`, `AdvisoryVerdict`)

Required metadata families:

- required spec linkage,
- required package link/reference,
- product/material/system identity,
- approved-project-basis ref,
- responsible organization + optional individual for follow-up,
- inventory minimum metadata set per document,
- currentness state,
- reference-match confidence,
- manual-review-required flag,
- exception or drift-alert linkage when present.

---

## 5. Identity and Lineage Rules

### 5.1 Core Identifier Rules

- Every first-class QC family uses a server-assigned immutable UUID primary key.
- Project-scoped records must include `projectId`.
- Work-package-scoped records must include a stable `workPackageKey`.
- Review-, issue-, and advisory-derived records must retain origin references rather than copying lineage into plain text fields only.
- All records that can route work must carry `ResponsiblePartyAssignment` linkage or equivalent responsible organization + optional individual fields.

### 5.2 Locked Lineage Chain

The following lineage chain is mandatory and must be preserved in data structures and Related Items registrations:

`GovernedQualityStandard` / `ProjectQualityExtension`
→ `WorkPackageQualityPlan`
→ `PreconstructionReviewPackage`
→ `ReviewFinding`
→ `QcIssue`
→ `CorrectiveAction`
→ `EvidenceReference` / `DeviationOrWaiverRecord` / `ExternalApprovalDependency`
→ `QualityHealthSnapshot` / `ProjectQcSnapshot` / downstream handoff

The submittal advisory is parallel to, not inside, the main issue chain:

`SubmittalItemRecord`
→ required `SubmittalSpecLinkRef`
→ required `SubmittalPackageLinkRef`
→ `DocumentInventoryEntry`
→ `AdvisoryVerdict`
→ `AdvisoryException` where approved
→ `VersionDriftAlert`

### 5.3 Finding-to-Issue Rule

If a `ReviewFinding` creates an operational obligation, the resulting `QcIssue` must preserve:

- origin review package id,
- finding id,
- finding severity,
- original governed requirement refs,
- and originating responsible-party context.

No downstream issue may sever the line back to its originating finding.

---

## 6. State and Lifecycle Foundations

| Family group | Minimum lifecycle requirement |
|---|---|
| Governed core | Must support governed draft, review, publication, supersession, and retirement |
| Project extensions | Must support draft, project approval, promotion submission, promotion decision, retirement |
| Plans and review packages | Must support draft, review, active/accepted, return/revision, supersession, closure |
| Issues and corrective actions | Must support open, in-progress, ready-for-review, verified/closed, escalation, void |
| Deviations and approval dependencies | Must support draft/submitted, approved/rejected, active/expired/resolved |
| Evidence references | Must support capture, submission, acceptance/rejection, supersession |
| Advisory records | Must support capture, confirmation, verdict issuance, manual review, exception, supersession, drift-alert resolution |
| Snapshots and health | Must support compute/publish/supersede and remain immutable once published |

---

## 7. Downstream Handoffs

| Downstream target | QC handoff content |
|---|---|
| Project Startup | Quality readiness posture, unresolved soft-gate context, commissioning-adjacent quality references |
| Project Closeout | Turnover-quality readiness posture, unresolved issue lineage, evidence-reference context |
| Project Warranty | Quality lineage relevant to post-turnover defects where needed; no direct warranty-case creation |
| Schedule | Quality-critical sequencing, readiness dependencies, and near-term advisory signals |
| Future Site Controls | Control-layer record references, readiness state, issue follow-up posture, and evidence-reference context for deeper field execution |

---

## 8. Shared-Package Reuse Boundaries

QC must leverage the following packages where applicable:

| Package | Required QC use |
|---|---|
| `@hbc/versioned-record` | Mutation history, version lineage, immutable snapshots, supersession |
| `@hbc/record-form` | Form-state, trust-state, recovery-state, and review-step behavior for QC record authoring |
| `@hbc/saved-views` | System and user views for plan, issue, advisory, and rollup workspaces |
| `@hbc/publish-workflow` | Governed publication lifecycle for standards, snapshots, and notices |
| `@hbc/my-work-feed` | Personal and team obligation routing |
| `@hbc/related-items` | Cross-record lineage and handoff presentation |
| `@hbc/project-canvas` | Baseline-visible QC tile and contextual module projections |
| `@hbc/notification-intelligence` | Escalations, update notices, drift alerts, and overdue signals |
| `@hbc/session-state` | Draft persistence and recovery only; never canonical QC truth |
| `@hbc/sharepoint-docs` | Document link/reference handling only; not a QC-owned storage layer |

**File-repository prohibition:** QC may reference files and inventory entries, but it must never store package files, evidence binaries, or duplicate document payloads as QC-owned canonical records.

---

## 9. Governing Summary

P3-E15 owns a broad but bounded record model: governed standards, project extensions, plans, reviews, issues, corrective actions, deviations, evidence references, approval dependencies, advisory records, health snapshots, update notices, and performance rollup inputs. Each family has a distinct authority boundary, identifier model, lifecycle foundation, lineage posture, and downstream handoff role. Together they create the Project Hub quality control layer without collapsing into a field-first execution tool, a document repository, or a duplicate downstream module.

---

*[← T02](P3-E15-T02-Governance-Ownership-and-Versioning.md) | Back to [Master Index](P3-E15-QC-Module-Field-Specification.md)*
