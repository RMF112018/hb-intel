# P3-E9-T04 — Reports: Run Ledger, Approval, Release, and Distribution Lifecycle

**Module:** P3-E9 Reports
**Governing contract:** P3-F1 §6–§10 — Generation pipeline, run ledger, approval, release, distribution
**Locked decisions driving this file:** LD-REP-04, LD-REP-09, LD-REP-10

---

## 1. Run Ledger

### 1.1 Purpose

The run ledger is the immutable append-only record of all report generation events for a project. Every time a report is generated — whether PM-initiated standard run or PER-initiated reviewer-generated run — a run record is created. Run records are never deleted; they are archived.

### 1.2 Run Record Lifecycle Summary

Each run record (`IReportRunRecord`) is created at queue time with `status = 'queued'` and progresses through the status lifecycle defined in T02 §1.1. All status transitions are recorded with timestamps and acting UPN.

### 1.3 Run Ledger Query Patterns

The run ledger supports:
- All runs for a project (sorted by `queuedAt` descending)
- Runs filtered by `familyKey`
- Runs filtered by `status`
- Runs filtered by `runType` (standard vs. reviewer-generated)
- Runs filtered by date range
- Single run by `runId`

---

## 2. Generation Pipeline

### 2.1 Pipeline Overview

Report generation is **asynchronous**. The PM initiates generation; the system queues the job and the user does not wait for PDF production.

```
PM initiates run
  → Readiness check (T03 §4.3) — synchronous
  → Run record created: status = 'queued'
  → Generation job enqueued
  → Worker picks up job: status = 'generating'
  → Worker assembles report from frozen snapshots + narrative
  → PDF rendered
  → Artifact stored in project's governed SharePoint document library
  → Artifact URL recorded on run record
  → status = 'generated' (or 'failed' if any step fails)
  → Activity event emitted (draft-refreshed → generated → approved → released)
```

### 2.2 Artifact Storage

Generated PDF artifacts are stored in the project's governed SharePoint document library. The SharePoint URL is recorded as `artifactUrl` on the run record. The artifact URL is permanent — artifacts are not deleted or overwritten; new runs produce new artifacts.

### 2.3 Generation Failure

If any generation step fails:
- `status` transitions to `'failed'`
- `failureReason` is populated with a descriptive message
- A new run may be initiated after the failure is resolved
- Failed runs remain in the ledger for audit purposes

### 2.4 Run Identification

Each run is identified by a UUID `runId`. Standard runs and reviewer-generated runs are distinguished by `runType`. Both appear in the project's run ledger.

---

## 3. Status Transition Rules

### 3.1 Full Status Machine

| From Status | To Status | Trigger | Constraint |
|-------------|-----------|---------|------------|
| `queued` | `generating` | Worker picks up job | Automatic |
| `generating` | `generated` | PDF production complete, artifact stored | Automatic |
| `generating` | `failed` | Any generation error | Automatic; terminal for this run |
| `generated` | `approved` | PE approves (PX Review only) | PE action; requires `approvalGated = true` family; internal review chain must be complete if required |
| `generated` | `released` | PM/PE/PER releases (non-gated families) | Actor must have release authority per effective policy |
| `approved` | `released` | PE/authorized actor releases (PX Review post-approval) | Must be in `approved` state first for PX Review |
| `released` | `archived` | Manual or superseded by new release | PE or MOE action |
| `generated` | `archived` | Superseded without release | PE action |

### 3.2 Family-Specific Transition Rules

| Family | Approval Gate | Status Path |
|--------|---------------|-------------|
| `px-review` | **Yes — PE approval required** | `queued → generating → generated → approved → released` |
| `owner-report` | No | `queued → generating → generated → released` |
| `sub-scorecard` | No | `queued → generating → generated → released` (or archived without release) |
| `lessons-learned` | No | `queued → generating → generated → released` (or archived without release) |

---

## 4. Approval Model (PX Review)

### 4.1 Approval Gate

PX Review (`px-review`) is the only Phase 3 family with an explicit approval gate. A PX Review run cannot transition to `released` without first passing through `approved`.

**Who approves:** Project Executive (PE). Only PE UPN is valid in `IReportApproval.approvedByUPN`.

### 4.2 Internal Review Chain Pre-condition

When the effective project-governance policy requires `requiresInternalReviewChainForPxReview = true`:
- The PM↔PE internal review chain (see §6 below) must reach `'complete'` status before PE may approve.
- A PX Review run in `generated` status with an incomplete chain shows a blocking indicator in the UI.
- PE cannot invoke the approval action while the chain is incomplete.

When the internal review chain is not required (`requiresInternalReviewChainForPxReview = false`), PE may approve directly.

### 4.3 Approval Work Queue Item

When a PX Review run reaches `generated` status:
- A `report-approval-pending` Work Queue item is created.
- Owner: PE.
- Priority: `'high'`.
- Resolves when the run transitions to `approved`.

### 4.4 Approval Record

The approval is recorded as `IReportApproval` on the run record:
```
approvedByUPN: PE UPN
approvedAt: ISO 8601 timestamp
comments: optional PE notes
internalReviewChainRef: FK to chain record if chain was required
```

---

## 5. Release and Distribution Governance

### 5.1 Release Classes

Each report family has a governed set of allowed release classes defined in the corporate template. The PM selects a release class from the allowed set during draft configuration. PE approval is required if the PM changes the audience class to a broader category.

| Release Class | Audience |
|---------------|---------|
| `'internal-only'` | Project team and authorized reviewers only |
| `'owner-facing'` | Owner and owner representatives included |
| `'external-limited'` | Named external parties per explicit distribution list |
| `'public'` | No distribution restriction (only where template explicitly permits) |

### 5.2 External Distribution Gate

External distribution (`external-limited` or `public` class) is only permitted where the corporate template explicitly permits it. PX Review does not permit external distribution. Owner Report may permit `owner-facing` and `external-limited` where configured by MOE.

External recipients must be specified as `IExternalRecipient` records at release time.

### 5.3 PER Release Authority

PER release authority is per-family and resolved from the effective project-governance policy:

| `perReleaseAuthority` Value | PER May Release? |
|-----------------------------|-----------------|
| `'pe-only'` | No — only PE may release |
| `'per-permitted'` | Yes — PER may release per effective policy |
| `'global'` | Yes — any authorized user in governed scope may release |

PX Review is always `'pe-only'`. Owner Report may be `'per-permitted'` per project policy.

### 5.4 Distribution Work Queue Item

When a run reaches `released` status and distribution is expected:
- A `report-distribution-pending` Work Queue item may be created (optional per family policy).
- Owner: PM or designated distributor.
- Priority: `'high'`.
- Resolves when distribution is confirmed.

### 5.5 Release Record

The release is recorded as `IReportRelease` on the run record:
```
releasedByUPN: actor UPN
releasedAt: ISO 8601 timestamp
releaseClass: selected release class
audienceClasses: resolved audience identifiers
distributionNotes: optional notes
externalRecipients: populated if release class is external-limited or public
```

---

## 6. PM↔PE Internal Review Chain

### 6.1 Purpose

The PM↔PE internal review chain is a lightweight internal handoff step that allows PE to review a report run before it proceeds to formal approval. It is optional and governed by effective project policy.

When enabled for PX Review (`requiresInternalReviewChainForPxReview = true`), the chain is a **hard prerequisite** for PE approval. The report run cannot transition to `approved` until the chain reaches `'complete'`.

When enabled for Owner Report (`requiresInternalReviewChainForOwnerReport = true`), the chain is a hard prerequisite for release.

### 6.2 Chain Lifecycle

```
PM submits run for internal review → chain status = 'submitted'
  → PE reviews run
  → PE approves chain: chain status = 'complete' → report may proceed to approval/release
  → PE returns for revision: chain status = 'returned' → PM revises and resubmits
```

### 6.3 Chain Rules

- PER has NO authority over the chain. PER cannot initiate, advance, or skip the chain.
- The chain is tracked as `IInternalReviewChainState` on the run record.
- A new chain record is created per run (chains are not reused across runs).
- Owner Report may bypass the chain ONLY when `bypassInternalReviewChainForOwnerReport: true` is set in the effective governance policy (default: `false`).

### 6.4 Review Chain Work Queue Item

When a run is submitted for internal review:
- A `report-approval-pending` Work Queue item is created for PE (or a dedicated chain-review item type if surfaced separately).
- PE's action resolves the chain.

---

## 7. Run Archival

Runs may be archived:
- Manually by PE after a superseding run is released (`generated → archived` or `released → archived`).
- Automatically when a new run of the same family is released and the project policy auto-archives prior runs (optional, not required for Phase 3).

Archived runs remain visible in run-ledger history. Archived status is terminal.

---

## 8. Reviewer-Generated Run Separation

Reviewer-generated runs (`runType: 'reviewer-generated'`) appear in the run ledger alongside standard runs. Key separation rules:

- Reviewer-generated runs do NOT affect PM draft state, PM narrative, or the standard run sequence.
- Reviewer-generated runs use the latest already-confirmed PM snapshot (not an in-progress draft).
- Reviewer-generated runs may carry an `annotationArtifactRef` pointing to a `@hbc/field-annotations` review artifact.
- PER cannot advance a reviewer-generated run through the approval or release workflow. The approval and release gates apply only to standard runs.

See T07 §2 for full reviewer-generated run rules.
