# P3-E13-T02 — Record Families, Identity, Lifecycle, and Readiness Decision

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E13-T02 |
| **Parent** | [P3-E13 Subcontract Execution Readiness Module](P3-E13-Subcontract-Execution-Readiness-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T02 of 8 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. Record Family Map

| Record family | Purpose | Ledger or projection |
|---|---|---|
| `SubcontractReadinessCase` | Parent source-of-truth record for one active governed award path | Primary ledger |
| `ReadinessRequirementItem` | Generated governed item under a case | Primary ledger |
| `RequirementArtifact` | Linked evidence, external references, and receipt provenance | Primary ledger |
| `RequirementEvaluation` | Specialist evaluation result and typed ruling detail | Primary ledger |
| `ExceptionCase` | Parent governed exception aggregate under the readiness case | Primary ledger |
| `ExceptionSubmissionIteration` | Immutable submitted snapshot for an exception packet iteration | Primary ledger |
| `ExceptionApprovalSlot` | Required approval slot preserved across delegation | Primary ledger |
| `ExceptionApprovalAction` | Actual approve / reject / return action tied to an iteration and slot | Primary ledger |
| `ExceptionDelegationEvent` | Delegation / reassignment audit tied to a slot | Primary ledger |
| `ExecutionReadinessDecision` | Formal issued decision for gate consumption | Primary ledger |
| `GlobalPrecedentReference` | Published governed cross-project reference artifact derived from an approved exception | Publication artifact |
| `ReadinessHealthProjection` | Health summary for project-level health surfaces | Downstream projection |
| `ReadinessWorkQueueProjection` | Actionable routed work for work-intelligence surfaces | Downstream projection |
| `ReadinessRelatedItemProjection` | Linked-item relationships to Financial and other consumers | Downstream projection |
| `ReadinessActivityProjection` | Activity spine events for audit and timeline consumption | Downstream projection |

---

## 2. Parent Source-Of-Truth Record: `SubcontractReadinessCase`

`SubcontractReadinessCase` is the parent source-of-truth record for the module. Everything else is subordinate to it or published from it.

### 2.1 Required identity fields

| Field | Rule |
|---|---|
| `readinessCaseId` | Immutable UUID |
| `projectId` | Required |
| `subcontractorLegalEntityId` | Required canonical legal-entity key |
| `linkedBuyoutLineId` | Required when the case is tied to a buyout path |
| `awardPathFingerprint` | Required stable identity fingerprint for the current award intent |
| `sourceCaseId` | Nullable; points to the original case in a renewal / successor chain |
| `supersedesCaseId` | Nullable; predecessor case when this case replaces an earlier one |
| `supersededByCaseId` | Nullable; successor case when this case is replaced |
| `caseVersion` | Starts at `1`; increments across successor cases |

### 2.2 Operational header fields

At minimum the case must also store:

- `workflowStatus`
- `plannedExecutionDate`
- `activeRequirementProfileId`
- `activeRequirementProfileVersion`
- `activeDecisionId`
- `activeExceptionCaseId`
- `lastSubmittedAt`
- `lastEvaluatedAt`
- `lastRenewedAt`

---

## 3. Identity Rules

### 3.1 One active case rule

One active case exists for the same:

- project,
- subcontractor legal entity,
- underlying award / buyout intent.

### 3.2 In-case continuity

The following remain within the same case:

- routine artifact resubmission,
- deficiency correction,
- corrected uploads,
- expiration-driven renewal for the same identity,
- re-review after an exception rejection where the same award path still applies.

### 3.3 Supersede / void triggers

Material identity changes create `SUPERSEDED` or `VOID` plus a new case where applicable. Material changes include:

- legal entity changes,
- buyout-line replacement that changes the underlying award intent,
- scope or risk posture changes that alter the case identity rather than only an item evaluation,
- explicit abandonment of the award path.

---

## 4. Lifecycle Statuses Versus Readiness Decision

Workflow status and readiness outcome must remain separate.

### 4.1 Case workflow status

```typescript
type ReadinessWorkflowStatus =
  | 'DRAFT'
  | 'ASSEMBLING'
  | 'SUBMITTED_FOR_REVIEW'
  | 'UNDER_EVALUATION'
  | 'AWAITING_RESPONSE'
  | 'AWAITING_EXCEPTION'
  | 'READY_FOR_ISSUANCE'
  | 'ISSUED'
  | 'RENEWAL_DUE'
  | 'SUPERSEDED'
  | 'VOID';
```

### 4.2 Readiness decision / outcome

```typescript
type ExecutionReadinessOutcome =
  | 'NOT_ISSUED'
  | 'READY'
  | 'BLOCKED'
  | 'READY_WITH_APPROVED_EXCEPTION'
  | 'SUPERSEDED'
  | 'VOID';
```

### 4.3 Governing rule

`workflowStatus` describes where the case is in process. `ExecutionReadinessOutcome` describes whether execution is currently allowed. They are related but not interchangeable.

Example:

- a case may be `READY_FOR_ISSUANCE` while the outcome is still `NOT_ISSUED`,
- a case may be `ISSUED` with outcome `BLOCKED`,
- a case may be `AWAITING_EXCEPTION` and still have the prior outcome `NOT_ISSUED`.

---

## 5. `ExecutionReadinessDecision`

The readiness decision must be a formal issued record rather than a derived boolean.

### 5.1 Required fields

| Field | Rule |
|---|---|
| `executionReadinessDecisionId` | Immutable UUID |
| `readinessCaseId` | Parent linkage |
| `issuedAt` | Required when issued |
| `issuedByUserId` | Specialist issuer; Compliance / Risk-owned |
| `issuedByRole` | Must reflect specialist authority |
| `outcome` | `ExecutionReadinessOutcome` value |
| `outcomeReasonCode` | Typed rationale |
| `blockingItemCountAtIssue` | Snapshot count |
| `exceptionIterationIdsAtIssue` | Snapshot linkage to approved iterations considered |
| `supersededByDecisionId` | Nullable |

### 5.2 Governing rule

Financial may only consume the current active `ExecutionReadinessDecision` or a derived gate projection sourced from it. Financial must not infer readiness by reading raw item rows or exception actions directly.

---

## 6. `ReadinessRequirementItem`

Each `ReadinessRequirementItem` belongs to one parent case and stores:

- identity,
- requirement-family classification,
- governing profile provenance,
- artifact-state fields,
- evaluation-state fields,
- typed metadata,
- blocking severity,
- renewal / expiration posture where applicable.

The item itself is a primary ledger. It is not a report or projection.

---

## 7. `ExceptionCase`

Each readiness case may have one parent `ExceptionCase` aggregate used to coordinate exception handling for one or more linked requirement items. The aggregate remains under the parent readiness case. Submitted content lives in immutable `ExceptionSubmissionIteration` records per T04.

---

## 8. Downstream Projections Are Not Primary Ledgers

The following must be modeled as downstream read products only:

- readiness health summary,
- work queue tasks,
- related-item links,
- activity events,
- precedent publication artifacts.

No downstream projection may be treated as the authoritative place to update readiness workflow state.
