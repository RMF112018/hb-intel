# P3-E13-T04 — Exception Packets, Approvals, Delegation, and Global Precedent

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E13-T04 |
| **Parent** | [P3-E13 Subcontract Execution Readiness Module](P3-E13-Subcontract-Execution-Readiness-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T04 of 8 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. Parent Exception Model

Each readiness case may own one parent `ExceptionCase` aggregate. The parent exception case exists to coordinate exception handling for one or more linked requirement items that cannot be satisfied through the normal governed path.

The parent exception case may include multiple linked requirement items where policy allows them to be resolved together. It does not erase item-level detail; it groups the exception workflow under one governed case aggregate.

---

## 2. Immutable Submission Iterations

Exception content is submitted as immutable `ExceptionSubmissionIteration` records.

### 2.1 Governing rules

- submitted content must never be edited in place,
- any revision produces a new iteration,
- approval actions are tied to a specific iteration,
- the exception header cannot be treated as the mutable approval record.

### 2.2 Required iteration fields

At minimum, each iteration must store:

- `exceptionSubmissionIterationId`
- `exceptionCaseId`
- `iterationNumber`
- `submittedAt`
- `submittedByUserId`
- `iterationSnapshot`
- `iterationStatus`
- `supersedesIterationId` where applicable

Rejected or withdrawn iterations remain permanent history.

---

## 3. Approval Slots And Approval Actions

### 3.1 Preserved slot model

Approval authorities must be modeled as `ExceptionApprovalSlot` records. The slot represents the required governed authority, not the current assignee's identity.

Required slot properties:

- `approvalSlotId`
- `slotRole`
- `slotSequence`
- `assignedUserId`
- `slotRequired`
- `slotStatus`

### 3.2 Approval actions

Each slot action must be stored in `ExceptionApprovalAction` and tied to:

- one slot,
- one iteration,
- one actor,
- one timestamp,
- one typed action outcome.

The module must not collapse slot identity and action history into a single mutable header field.

---

## 4. Delegation And Reassignment

Delegation is controlled reassignment within a preserved slot.

### 4.1 Required audit fields

Each `ExceptionDelegationEvent` must capture:

- delegator,
- delegate,
- reason,
- timestamp,
- resulting assignee,
- resulting action state where applicable.

### 4.2 Governing rules

- the original required approval slot remains constant,
- delegation does not create a new slot type,
- delegation does not erase the original assignee,
- the audit trail must survive across later iterations.

This prevents a mutable “delegate” field from silently rewriting approval authority history.

---

## 5. Approval Sequencing

Approval sequencing must be explicit and packet-type specific.

### 5.1 Default rule

Parallel routing is allowed by default unless packet policy requires ordered sequencing.

### 5.2 Required authorities where defined

The package must support defined exception families in which these authorities remain required:

- `PX`
- `CFO`
- `Compliance Manager`

Policy may define additional specialist or risk slots. The implementation must not assume all exception packets have identical slot sets, but it must preserve the required-slot model consistently.

---

## 6. `GlobalPrecedentReference`

An approved exception may publish a governed cross-project `GlobalPrecedentReference`.

### 6.1 What publication means

Publication means:

- the exception outcome may be referenced in future cases,
- the organization may learn from the approved treatment,
- evaluators may cite the precedent during later local review.

### 6.2 What publication does not mean

Publication does **not** mean:

- automatic future approval,
- automatic satisfaction of future readiness items,
- bypass of local specialist evaluation,
- bypass of local readiness decision issuance.

Future cases may reference the precedent but still require explicit local adoption and an explicit local readiness decision.

---

## 7. Audit Expectations

The exception package must preserve:

- item links,
- iteration snapshots,
- slot definitions,
- all slot actions,
- delegation history,
- precedent publication lineage.

No exception implementation may trade audit history for convenience.
