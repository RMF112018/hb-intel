# P3-E14-T04 — Warranty Case Lifecycle, States, and SLA / Escalation Model

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E14-T04 |
| **Parent** | [P3-E14 Project Warranty Module](P3-E14-Project-Warranty-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T04 of 10 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. Case Lifecycle Overview

A `WarrantyCase` is the atomic unit of warranty issue management. Every case has exactly one active `WarrantyCoverageDecision`, zero or one active `WarrantyCaseAssignment`, and will eventually produce either a terminal non-coverage determination (`NotCovered`, `Denied`, `Duplicate`, `Voided`) or a `WarrantyCaseResolutionRecord` at `Closed`.

The lifecycle is not a percentage model. Status transitions are discrete, driven by explicit PM or system actions. There are no "75% resolved" states. The case is either progressing through known states or it is terminal.

**16 canonical states.** The lifecycle is richer than a simple open/closed toggle because the warranty domain requires explicit positions on coverage determination, responsibility routing, subcontractor response, repair scheduling, and PM verification. Compressing these into fewer states sacrifices the auditability and routing intelligence that make this module operationally useful.

---

## 2. State Definitions

| State | Who owns next move | Meaning |
|---|---|---|
| `Open` | PM | Case logged; coverage not yet evaluated |
| `PendingCoverageDecision` | PM / WARRANTY_MANAGER | PM has initiated coverage evaluation; awaiting formal determination |
| `NotCovered` | — (terminal) | Formal coverage decision: issue is outside warranty scope |
| `Denied` | — (terminal) | Formal determination: this is not a warranty claim (e.g., owner damage, abuse, normal wear) |
| `Duplicate` | — (terminal) | Case identified as duplicate; linked to canonical open case |
| `Assigned` | PM | Coverage confirmed; responsible party identified; acknowledgment request not yet sent |
| `AwaitingSubcontractor` | Sub / PM (on sub's behalf) | Acknowledgment request sent to subcontractor; no response received |
| `AwaitingOwner` | Owner / PM | Case is blocked on owner action: site access, additional information, or owner decision |
| `Scheduled` | Sub / PM | Site visit or repair visit is scheduled; awaiting completion |
| `InProgress` | Sub / PM | Corrective work is actively underway; sub has not yet declared completion |
| `Corrected` | PM | Sub declares corrective work complete; PM has not yet verified |
| `PendingVerification` | PM | PM verification visit is scheduled or in progress |
| `Verified` | PM | PM has confirmed the correction is satisfactory; closure record not yet created |
| `Closed` | — (terminal) | `WarrantyCaseResolutionRecord` created and immutable; case archived |
| `Reopened` | PM | PX has re-opened a previously `Closed` case due to defect recurrence |
| `Voided` | — (terminal) | Case opened in error or withdrawn; retained for audit; excluded from all metrics |

---

## 3. State Machine

### 3.1 Primary flow (standard covered case)

```text
  ① OPEN
       │ PM initiates coverage evaluation
       ▼
  ② PENDING_COVERAGE_DECISION
       │
       ├─── coverage confirmed ──────────────────────── ⑥ ASSIGNED
       │                                                      │ ack request sent
       ├─── out of scope ──────────────────────────────  ③ NOT_COVERED (terminal)
       │                                                      │
       ├─── not a warranty claim ──────────────────────  ④ DENIED (terminal)
       │
       └─── duplicate of existing case ────────────────  ⑤ DUPLICATE (terminal)
                                                               │ linked to canonical case
```

```text
  ⑥ ASSIGNED
       │ acknowledgment request sent to sub
       ▼
  ⑦ AWAITING_SUBCONTRACTOR
       │
       ├─── sub acknowledges + accepts scope ──────────── ⑨ SCHEDULED (if visit booked)
       │                                                      or ⑩ IN_PROGRESS (if work begins)
       │
       ├─── sub disputes scope ──────────────────────────► dispute resolution path (§5.2)
       │     └─ uphold: back to ⑥ ASSIGNED (reassigned)
       │        reject: back to ⑦ AWAITING_SUBCONTRACTOR (sub continues)
       │
       └─── owner access needed ─────────────────────────  ⑧ AWAITING_OWNER
                │ owner provides access / info
                └─ returns to ⑦ AWAITING_SUBCONTRACTOR or ⑨ SCHEDULED
```

```text
  ⑨ SCHEDULED
       │ visit begins
       ▼
  ⑩ IN_PROGRESS
       │ sub declares work complete
       ▼
  ⑪ CORRECTED
       │ PM schedules verification
       ▼
  ⑫ PENDING_VERIFICATION
       │
       ├─── verification successful ─────────────────────  ⑬ VERIFIED
       │                                                          │ PM creates resolution record
       │                                                          ▼
       │                                                     ⑭ CLOSED (terminal)
       │
       └─── verification fails ──────────────────────────  ⑩ IN_PROGRESS (work restarts)
```

```text
  ⑭ CLOSED
       │ PX re-opens (defect recurrence)
       ▼
  ⑮ REOPENED ──── follows same path as ⑥ ASSIGNED
```

```text
  Any non-terminal state
       │ PM/PX explicit void action + rationale
       ▼
  ⑯ VOIDED (terminal)
```

### 3.2 State transition table

| From | To | Actor | Guard condition |
|---|---|---|---|
| `Open` | `PendingCoverageDecision` | PM / WARRANTY_MANAGER | Coverage evaluation initiated |
| `Open` | `Voided` | PM / PX | Rationale required |
| `PendingCoverageDecision` | `NotCovered` | PM / WARRANTY_MANAGER | Coverage decision: out of scope; rationale required |
| `PendingCoverageDecision` | `Denied` | PM / WARRANTY_MANAGER | Coverage decision: not a warranty claim; rationale required |
| `PendingCoverageDecision` | `Duplicate` | PM / WARRANTY_MANAGER | Duplicate confirmed; canonical case ID required |
| `PendingCoverageDecision` | `Assigned` | PM / WARRANTY_MANAGER | Coverage confirmed; `responsiblePartyId` required |
| `PendingCoverageDecision` | `Voided` | PM / PX | Rationale required |
| `Assigned` | `AwaitingSubcontractor` | PM / WARRANTY_MANAGER | Acknowledgment request sent; `slaResponseDeadline` set |
| `Assigned` | `InProgress` | PM / WARRANTY_MANAGER | GC or internal assignment; skips ack flow |
| `Assigned` | `Voided` | PM / PX | Rationale required |
| `AwaitingSubcontractor` | `AwaitingOwner` | PM | Owner action required; blocking reason documented |
| `AwaitingSubcontractor` | `Scheduled` | PM / WARRANTY_MANAGER | Sub acknowledged; visit scheduled |
| `AwaitingSubcontractor` | `InProgress` | PM / WARRANTY_MANAGER | Work begins without formal scheduling |
| `AwaitingSubcontractor` | `Assigned` | PM | Reassignment after scope dispute or non-response |
| `AwaitingOwner` | `AwaitingSubcontractor` | PM | Owner unblocked; returning to sub response path |
| `AwaitingOwner` | `Scheduled` | PM | Owner unblocked; visit scheduled directly |
| `AwaitingOwner` | `Voided` | PM / PX | Rationale required |
| `Scheduled` | `InProgress` | PM / WARRANTY_MANAGER | Work has begun |
| `Scheduled` | `AwaitingSubcontractor` | PM | Visit cancelled; back to sub coordination |
| `Scheduled` | `Voided` | PM / PX | Rationale required |
| `InProgress` | `Corrected` | PM / WARRANTY_MANAGER | Sub declares work complete |
| `InProgress` | `Voided` | PM / PX | Rationale required |
| `Corrected` | `PendingVerification` | PM / WARRANTY_MANAGER | Verification visit scheduled |
| `Corrected` | `InProgress` | PM / WARRANTY_MANAGER | PM rejects declaration; work must restart |
| `Corrected` | `Voided` | PM / PX | Rationale required |
| `PendingVerification` | `Verified` | PM / WARRANTY_MANAGER | PM confirms correction satisfactory |
| `PendingVerification` | `InProgress` | PM / WARRANTY_MANAGER | Verification fails; work restarts |
| `PendingVerification` | `Voided` | PM / PX | Rationale required |
| `Verified` | `Closed` | PM / WARRANTY_MANAGER | `WarrantyCaseResolutionRecord` created (immutable) |
| `Verified` | `Voided` | PM / PX | Rationale required (unusual path; PX should prefer Closed) |
| `Closed` | `Reopened` | PX only | Defect recurrence confirmed; reason documented |
| `Reopened` | `Assigned` | PM | Treated as a new assignment cycle for the reopened case |
| `Reopened` | `Voided` | PM / PX | Rationale required |

---

## 4. Next Move Ownership Model

Each non-terminal state has a canonical **next move**: the action that advances the case. The system surfaces the next move in the case workspace and routes it to the responsible actor's Work Queue item.

| State | Next move | Owner | Work Queue routed to |
|---|---|---|---|
| `Open` | Initiate coverage evaluation | PM / WARRANTY_MANAGER | PM |
| `PendingCoverageDecision` | Make coverage determination | PM / WARRANTY_MANAGER | PM |
| `Assigned` | Send acknowledgment request to sub | PM / WARRANTY_MANAGER | PM |
| `AwaitingSubcontractor` | Record sub response | PM (on sub's behalf) | PM |
| `AwaitingOwner` | Resolve owner blocking item | PM | PM (owner contact is external) |
| `Scheduled` | Confirm visit completion; log outcome | PM | PM |
| `InProgress` | Record sub correction declaration | PM (on sub's behalf) | PM |
| `Corrected` | Schedule PM verification visit | PM / WARRANTY_MANAGER | PM |
| `PendingVerification` | Conduct verification; record outcome | PM / WARRANTY_MANAGER | PM |
| `Verified` | Create resolution record and close | PM / WARRANTY_MANAGER | PM |
| `Reopened` | Assess and assign for repeat repair | PM | PM |

> **Layer 2 note:** In Phase 3, PM acts as proxy for subcontractor and owner responses. In Layer 2, sub and owner have direct access and become direct next-move owners for their respective states. The Work Queue routing model and next-move structure support this extension without a state machine change.

---

## 5. SLA and Aging Model

### 5.1 SLA tiers

| Tier | Trigger | Applies to |
|---|---|---|
| **Standard** | Default for all new cases | All cases where `isUrgent = false` |
| **Expedited** | PM flags `isUrgent = true` | Cases with safety implications, high-profile owner complaints, or PX-escalated items |

### 5.2 SLA windows (default thresholds)

> **Provisional:** These defaults are the initial governing values. Project-specific SLA configuration may be added in a future release. Until project-level configuration is available, these defaults apply universally.

| Window | Standard | Expedited | Starts when | Applies to field |
|---|---|---|---|---|
| **Response SLA** | 5 business days | 2 business days | Case transitions to `AwaitingSubcontractor` | `slaResponseDeadline` |
| **Repair SLA** | 30 business days | 10 business days | Sub acknowledges scope (`ScopeAccepted`) | `slaRepairDeadline` |
| **Verification SLA** | 5 business days | 2 business days | Case transitions to `Corrected` | `slaVerificationDeadline` |

### 5.3 SLA clock behavior

- **Clock starts:** On the state transition listed in the "Starts when" column above.
- **Clock pauses:** When the case transitions to `AwaitingOwner` — the PM has explicitly documented that progress is blocked on owner action beyond PM or sub control.
- **Clock resumes:** When the case exits `AwaitingOwner`.
- **Clock stops:** When the relevant SLA window milestone is reached (`AwaitingSubcontractor → Scheduled` stops Response SLA; `Corrected` stops Repair SLA; `Verified` stops Verification SLA).
- **Clock does not pause** for non-documented delays, scheduling difficulty, or sub-requested extensions unless PX explicitly extends the deadline.

### 5.4 SLA status computation

```typescript
function computeSlaStatus(
  deadlineDate: string | null,
  currentDate: string,
  approachingThresholdDays: number = 5
): WarrantySlaStatus {
  if (!deadlineDate) return WarrantySlaStatus.NotApplicable;
  const daysRemaining = businessDaysBetween(currentDate, deadlineDate);
  if (daysRemaining < 0) return WarrantySlaStatus.Overdue;
  if (daysRemaining <= approachingThresholdDays) return WarrantySlaStatus.Approaching;
  return WarrantySlaStatus.WithinSla;
}
```

`slaStatus` on `IWarrantyCase` is the most severe SLA status across all active SLA windows. A case with `Overdue` response SLA reports `Overdue` even if repair SLA has not yet started.

---

## 6. Escalation Model

### 6.1 Escalation triggers and routing

| Trigger | Action | Routed to |
|---|---|---|
| Response SLA `Approaching` (5 BD remaining) | Work Queue advisory: "Sub acknowledgment due in N days" | PM |
| Response SLA `Overdue` | Work Queue escalation: "Sub has not acknowledged — [N] days overdue" | PM |
| Response SLA `Overdue` by > 5 BD | Work Queue escalation to PX; Health spine signal emitted | PM + PX |
| Repair SLA `Approaching` (5 BD remaining) | Work Queue advisory: "Repair deadline approaching for case [ref]" | PM |
| Repair SLA `Overdue` | Work Queue escalation: "Repair SLA exceeded — [N] days overdue" | PM |
| Repair SLA `Overdue` by > 10 BD | Work Queue escalation to PX; back-charge advisory flag auto-surfaced as advisory | PM + PX |
| Verification SLA `Approaching` | Work Queue advisory | PM |
| Verification SLA `Overdue` | Work Queue escalation | PM |
| Coverage expiring in 30 days with open cases | Work Queue advisory | PM |
| Coverage expired with open cases > 30 days | Work Queue escalation | PM + PX |
| Case in `AwaitingOwner` > 14 days | Work Queue advisory: "Owner-blocked case — consider alternate path" | PM |
| Case in `AwaitingOwner` > 30 days | PX escalation advisory | PM + PX |

### 6.2 Escalation implementation contract

All escalation routing must use `@hbc/notification-intelligence` (referenced in P3-D3 §5) and the Work Queue publication contract (P3-D3). No local ad-hoc timer or notification implementation is permitted. The trigger evaluation must run on the shared work-intelligence execution layer, not as a local `setInterval` or cron stub.

---

## 7. Due Date Model

Beyond SLA deadlines (which are computed), cases may carry an explicit `dueDateOverride` set by PX for project-specific commitments (e.g., "owner requires response by [date]"). The `dueDateOverride` is displayed alongside SLA deadlines in the case workspace and surfaced in Work Queue items. It does not replace SLA computation — both are displayed.

```typescript
interface IWarrantyCaseDueDate {
  slaResponseDeadline: string | null;  // computed (§5.2)
  slaRepairDeadline: string | null;    // computed (§5.2)
  slaVerificationDeadline: string | null; // computed (§5.2)
  dueDateOverride: string | null;      // PX-set explicit commitment date
  dueDateOverrideReason: string | null; // required when set
  dueDateOverrideSetByUserId: string | null;
}
```

---

## 8. Blocking Reasons

When a case enters `AwaitingOwner` or is otherwise in a blocked state, the PM must document a blocking reason. This is required for auditability and for SLA clock management.

```typescript
enum WarrantyCaseBlockingReason {
  OwnerAccessRequired = 'OwnerAccessRequired',
  OwnerDecisionPending = 'OwnerDecisionPending',
  OwnerInformationRequired = 'OwnerInformationRequired',
  WeatherOrSeasonalConstraint = 'WeatherOrSeasonalConstraint',
  MaterialLeadTime = 'MaterialLeadTime',
  PermitRequired = 'PermitRequired',
  Other = 'Other',
}
```

When `blockingReason = Other`, a free-text `blockingReasonNotes` field is required. The blocking reason and the `AwaitingOwner` entry timestamp are preserved in the audit trail.

---

## 9. Verification Gate Model

### 9.1 Verification is always required

A `WarrantyCase` may not transition directly from `InProgress` or `Corrected` to `Closed` without PM verification. The only exception is `ResolutionOutcome.PmAccepted`, which allows the PM to bypass the formal verification visit and close the case with an explicit written acceptance. PX does not need to approve `PmAccepted` closures, but they are flagged in the audit trail and surfaced in the resolution record.

### 9.2 Verification failure path

When a PM conducts a verification visit and the correction is unsatisfactory:
1. PM transitions the case from `PendingVerification` back to `InProgress`.
2. PM documents the specific deficiencies that led to the rejection.
3. The rejection documentation is attached as a `WarrantyCaseEvidence` record.
4. The sub's `SubcontractorAcknowledgment` record is updated with a `correctionRejectedAt` timestamp.
5. New SLA windows reset from the `InProgress` re-entry point.

---

## 10. Re-Open Logic

### 10.1 Re-open authority

Only PX may re-open a `Closed` case. PM-level re-open is intentionally blocked to preserve the integrity of the `WarrantyCaseResolutionRecord`.

### 10.2 Re-open conditions

PX may re-open a case only when:
- The same defect or failure has recurred after the original correction, or
- New information has come to light that materially changes the resolution posture

A case re-opened for an entirely unrelated new defect must be handled as a new `WarrantyCase`, not a re-open.

### 10.3 Re-open behavior

When a case is re-opened:
1. Case status transitions to `Reopened`.
2. A re-open record is attached to the case: reason, PX ID, timestamp.
3. The original `WarrantyCaseResolutionRecord` is **not voided** — it is preserved. The re-open is additive.
4. The case then follows the standard assignment → acknowledgment → visit → verification → closure path as a new cycle.
5. The closure of the re-opened cycle creates a second `WarrantyCaseResolutionRecord` on the same case. Both records are preserved in the audit trail.

---

## 11. Duplicate Handling

### 11.1 Duplicate identification

When a PM reviewing an `Open` or `PendingCoverageDecision` case determines it is a duplicate of an existing case, they may transition the case to `Duplicate` and supply the canonical case ID. The duplicate case is then linked to the canonical case via the `canonicalCaseId` field.

### 11.2 Duplicate rules

- A case transitioned to `Duplicate` is terminal. It may not be re-opened or reassigned.
- The canonical case referenced by the duplicate must be an existing, non-terminal case.
- A `Closed` case may not be the canonical target for a new duplicate — if the existing case is closed and the new issue represents the same recurrent defect, the closed case should be re-opened (PX action) rather than duplicated.
- Duplicate case records are retained for audit purposes. They are excluded from SLA metrics, Health spine counts, and Work Queue routing.

---

## 12. Auditability Requirements

The following transitions and events must be captured immutably in the activity record (via `@hbc/activity-timeline`) with actor, timestamp, and rationale:

| Event | Auditability requirement |
|---|---|
| Any state transition | Actor + timestamp + prior state + new state |
| Coverage decision made | Decision outcome + rationale + actor + timestamp |
| Coverage decision superseded | Original decision reference + new decision + revision note |
| Subcontractor acknowledgment recorded | Scope position + actor (PM on behalf) + timestamp |
| Scope dispute resolution | Dispute outcome + PM/PX rationale + timestamp |
| SLA extension granted | Prior deadline + new deadline + PX ID + reason + timestamp |
| Verification failure | Deficiency notes + actor + timestamp + rejection evidence reference |
| Case re-opened | Prior resolution record ID + re-open reason + PX ID + timestamp |
| Back-charge advisory published | Advisory notes + actor + timestamp + Financial advisory ID |
| Resolution record created | Outcome + all resolution fields (immutable snapshot) |
| Case voided | Rationale + actor + timestamp |

All records listed in §12 must be preserved and may not be deleted, even when cases are voided or closed. The activity stream for a case must be complete and queryable by PM, PX, and audit review surfaces.

---

## 13. Publication Contracts

### 13.1 Activity spine

All state transitions listed in §12 emit activity events to `@hbc/activity-timeline`. Module event key prefix: `warranty.case.*`. Governing contract: P3-D1.

### 13.2 Work Queue publication

All escalation triggers listed in §6 emit Work Queue items via `@hbc/notification-intelligence` and P3-D3. Work Queue items include: case reference (`caseId`, `caseNumber`, `title`), triggering condition, SLA deadline (if applicable), and direct deep-link to case workspace.

### 13.3 Health spine

The case lifecycle contributes to three Health spine metrics (full definitions in T09):
- `openCaseCount` — all cases in non-terminal, non-void states
- `overdueCount` — cases with `slaStatus = Overdue`
- `awaitingOwnerCount` — cases in `AwaitingOwner` state

A single `Overdue` case on any SLA window contributes one count to `overdueCount`, regardless of how many SLA windows are breached on that case.

### 13.4 Work Queue item lifecycle

Work Queue items created by the warranty escalation model follow the standard P3-D3 Work Queue item lifecycle. Resolving a Work Queue item does **not** advance the case status. The case status advances only through PM action in the case workspace. This separation between notification routing and case lifecycle is intentional and must be enforced.

---

*← [T03](P3-E14-T03-Coverage-Registry-and-Turnover-Startup-Handoffs.md) | [Master Index](P3-E14-Project-Warranty-Module-Field-Specification.md) | [T05 →](P3-E14-T05-Owner-Intake-Communications-and-Future-Workspace-Seams.md)*
