# P3-E14-T06 — Subcontractor Participation, Acknowledgment, and Resolution Declarations

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E14-T06 |
| **Parent** | [P3-E14 Project Warranty Module](P3-E14-Project-Warranty-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T06 of 10 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. Phase 3 Subcontractor Participation Model

### 1.1 PM-proxy model for subcontractor interaction

In Phase 3, subcontractors do not access Project Hub directly. All acknowledgment responses, completion declarations, and evidence submissions are entered by the PM or Warranty Manager on behalf of the subcontractor, following communication through the PM's preferred external channel (phone, email, site visit).

This mirrors the owner PM-proxy model (T05 §1.1) and is correct Phase 3 design for the same architectural reason: Phase 3 establishes the governed record model that Layer 2 will extend. Building direct subcontractor portal access before the underlying acknowledgment and completion record structure is mature would create integration debt in the most change-prone part of the system.

### 1.2 The `enteredBy` seam discriminator

Every subcontractor-facing record carries an `enteredBy` field that marks whether the record was PM-entered on behalf of the subcontractor, or directly entered by the subcontractor through a future portal:

```typescript
enum SubcontractorEntryChannel {
  PmOnBehalf = 'PmOnBehalf',         // Phase 3: PM enters after communication
  DirectSubcontractor = 'DirectSubcontractor', // Layer 2: sub enters directly
}
```

All Phase 3 records carry `enteredBy = PmOnBehalf`. Layer 2 populates the same records with `enteredBy = DirectSubcontractor`. No schema change is required at Layer 2 adoption.

### 1.3 What Layer 2 subcontractor participation adds

| Capability | Phase 3 | Layer 2 |
|---|---|---|
| Case assignment notification to sub | PM contacts sub externally | System notification via `@hbc/notification-intelligence` |
| Acknowledgment entry | PM enters after sub response | Sub enters directly through portal |
| Completion declaration | PM enters after sub report | Sub submits directly |
| Evidence upload | PM uploads on sub's behalf | Sub uploads directly |
| Due-date visibility | PM communicates externally | Sub sees live deadline in portal |
| Dispute submission | PM records sub's stated dispute | Sub submits dispute with supporting materials directly |

---

## 2. Assignment Model

### 2.1 Assignment record

When a `WarrantyCase` coverage decision resolves to `Assigned`, the PM creates an assignment record identifying the responsible subcontractor. A case may have at most one active assignment at a time. If a case is reassigned, the prior assignment is superseded and a new one is created.

```typescript
interface IWarrantyCaseAssignment {
  assignmentId: string;                  // UUID
  caseId: string;                        // FK → WarrantyCase
  subcontractorId: string;               // FK → governed subcontractor registry
  subcontractorName: string;             // denormalized display name
  assignedByUserId: string;              // PM / WARRANTY_MANAGER who created assignment
  assignedAt: string;                    // ISO datetime
  assignmentNotes: string | null;        // optional scope notes for the sub
  supersededByAssignmentId: string | null; // set if this assignment was replaced
  // Layer 2 seam
  enteredBy: SubcontractorEntryChannel;  // PmOnBehalf | DirectSubcontractor
}
```

### 2.2 Assignment without a governed subcontractor

When no responsible subcontractor can be identified — manufacturer warranty claims, structural warranty with no responsible trade, or cases where the original sub is no longer available — the case may proceed with `subcontractorId = null`. In this situation:

- `assignedToId` is set to a PM or internal resource instead
- The acknowledgment workflow proceeds with modified actor expectations (PM self-acknowledges)
- The SLA model applies in full
- The back-charge advisory path is unavailable (no sub to charge)
- `assignmentNotes` should document why no external sub was assigned

### 2.3 Assignment publication

On creation of `IWarrantyCaseAssignment`, the module publishes to:
- **Work Queue**: Next Move item for PM — confirm subcontractor acknowledgment
- **Activity Timeline**: Assignment event on the case record
- **Notification** (Phase 3: advisory only): Work Queue nudge to PM to contact sub

---

## 3. Acknowledgment Lifecycle

### 3.1 ISubcontractorAcknowledgment interface

```typescript
interface ISubcontractorAcknowledgment {
  acknowledgmentId: string;               // UUID
  caseId: string;                         // FK → WarrantyCase
  assignmentId: string;                   // FK → IWarrantyCaseAssignment
  subcontractorId: string;                // FK → subcontractor registry
  status: SubcontractorAcknowledgmentStatus;
  acknowledgedAt: string | null;          // ISO datetime (null until acknowledged)
  acknowledgedByUserId: string;           // PM who entered the acknowledgment
  enteredBy: SubcontractorEntryChannel;   // PmOnBehalf | DirectSubcontractor
  acknowledgmentNotes: string | null;     // optional PM notes
  scopeDecisionAt: string | null;         // when ScopeAccepted or ScopeDisputed was entered
  disputeRationale: string | null;        // required if status = ScopeDisputed
  pmDisputeResponse: string | null;       // PM's position on the dispute
  disputeOutcome: AcknowledgmentDisputeOutcome | null; // set when dispute is resolved
  disputeResolvedAt: string | null;       // ISO datetime of dispute resolution
  disputeResolvedByUserId: string | null; // PX / PM who resolved the dispute
}

enum SubcontractorAcknowledgmentStatus {
  Pending = 'Pending',               // Assignment created; awaiting sub response
  Acknowledged = 'Acknowledged',     // Sub has received and acknowledged the case
  ScopeAccepted = 'ScopeAccepted',   // Sub accepts responsibility for the case scope
  ScopeDisputed = 'ScopeDisputed',   // Sub contests responsibility; dispute open
  DisputeResolved = 'DisputeResolved', // Dispute concluded; see disputeOutcome
}

enum AcknowledgmentDisputeOutcome {
  UpheldSubcontractorNotResponsible = 'UpheldSubcontractorNotResponsible',
  RejectedSubcontractorRemains = 'RejectedSubcontractorRemains',
  Reassigned = 'Reassigned',
  EscalatedToPX = 'EscalatedToPX',
}
```

### 3.2 Acknowledgment state transitions

| From | To | Actor | Guard |
|---|---|---|---|
| — | `Pending` | System | Case transitions to `Assigned` |
| `Pending` | `Acknowledged` | PM / WARRANTY_MANAGER | PM records sub confirmed receipt |
| `Acknowledged` | `ScopeAccepted` | PM / WARRANTY_MANAGER | PM records sub accepts scope |
| `Acknowledged` | `ScopeDisputed` | PM / WARRANTY_MANAGER | PM records sub disputes scope; `disputeRationale` required |
| `ScopeDisputed` | `DisputeResolved` | PX / PM | `disputeOutcome` + `pmDisputeResponse` required |

### 3.3 SLA linkage to acknowledgment

The acknowledgment SLA window begins when the case transitions to `Assigned` and the assignment record is created.

| Tier | Acknowledgment reminder | Acknowledgment escalation |
|---|---|---|
| Standard | No response logged in 5 BD | No response logged in 10 BD → escalate to PX |
| Expedited | No response logged in 2 BD | No response logged in 4 BD → escalate to PX |

These thresholds are configurable per deployment. The escalation is surfaced as a Work Queue item for PX, not a case status change. A blocked acknowledgment does not freeze the SLA clock — the repair deadline continues running.

---

## 4. Scope Dispute Path

### 4.1 Dispute entry requirements

When the PM records a scope dispute (`ScopeDisputed`), the following are required:

- `disputeRationale` — the subcontractor's stated reason, in their own terms as PM-transcribed (same provenance discipline as owner intake)
- PM must not editorialize the sub's rationale in the `disputeRationale` field; PM's position belongs in `pmDisputeResponse`

### 4.2 Dispute resolution paths

| Outcome | Case effect | Next action |
|---|---|---|
| `UpheldSubcontractorNotResponsible` | Case returned to `Open` or `PendingCoverageDecision` for PM resolution | PM selects new responsible party or closes as not covered |
| `RejectedSubcontractorRemains` | Case remains `Assigned` to original sub | PM re-engages sub; acknowledgment remains `ScopeDisputed` until sub proceeds or is re-assigned |
| `Reassigned` | Existing assignment superseded; new assignment and acknowledgment records created | PM assigns new sub; new acknowledgment cycle starts |
| `EscalatedToPX` | PX takes decision authority; PM documents PX outcome | PX outcome is recorded as `pmDisputeResponse`; case route follows PX decision |

### 4.3 Dispute does not void the case

A scope dispute does not automatically void the `WarrantyCase`. The case remains active in its current lifecycle state until the dispute resolves through one of the paths above. SLA clocks do not pause during dispute (there is no `AwaitingSubcontractor` pause — only `AwaitingOwner` pauses the SLA; see T04 §4).

This is intentional: the owner's SLA expectations are not suspended because of a subcontractor dispute. The PM must manage the dispute without allowing it to expire the repair window.

---

## 5. Evidence Submission Model

### 5.1 Evidence records

Evidence submitted during the subcontractor repair lifecycle is captured as `IWarrantyCaseEvidence` records (record family defined in T02). Evidence may be submitted by the PM on behalf of the subcontractor, or — in Layer 2 — by the subcontractor directly.

```typescript
interface IWarrantyCaseEvidence {
  evidenceId: string;                    // UUID
  caseId: string;                        // FK → WarrantyCase
  visitId: string | null;               // FK → IWarrantyVisit (if tied to a specific visit)
  evidenceType: WarrantyEvidenceType;
  fileRef: string | null;               // reference to attachment store
  description: string;                  // PM or sub description of the evidence
  capturedAt: string;                   // ISO datetime
  submittedByUserId: string;            // PM / WARRANTY_MANAGER who submitted
  enteredBy: SubcontractorEntryChannel; // PmOnBehalf | DirectSubcontractor (Layer 2 seam)
}

enum WarrantyEvidenceType {
  PhotoBefore = 'PhotoBefore',
  PhotoAfter = 'PhotoAfter',
  VideoDocumentation = 'VideoDocumentation',
  MaterialSpec = 'MaterialSpec',
  SubcontractorReport = 'SubcontractorReport',
  InspectionReport = 'InspectionReport',
  ManufacturerResponse = 'ManufacturerResponse',
  Other = 'Other',
}
```

### 5.2 Evidence at case and visit level

Evidence may be attached at the case level (general supporting documentation) or at a specific visit level (pre/post repair documentation tied to a scheduled visit). Visit-level evidence carries a `visitId` FK. Case-level evidence sets `visitId = null`.

### 5.3 Evidence in Phase 3

In Phase 3, the PM uploads evidence directly from communications with the sub. The sub sends photos, reports, or materials through external channels; the PM uploads them into the system with the sub as the implicit source. The `enteredBy = PmOnBehalf` discriminator records this provenance.

Layer 2 allows the subcontractor to upload evidence directly through a portal. The `IWarrantyCaseEvidence` record shape is identical; `enteredBy = DirectSubcontractor` distinguishes the source without a schema change.

---

## 6. Completion Declaration and Verification Handoff

### 6.1 Completion declaration path

When the subcontractor reports work complete, the PM enters a completion declaration that moves the case from `InProgress` to `Corrected`. The PM acts as the system proxy for the sub's claim that work is done.

Completion declaration requires:
- Confirmation that the repair visit was completed (visit record in `Completed` state, or PM attestation if no formal visit was scheduled)
- At least one `PhotoAfter` or `SubcontractorReport` evidence record (advisory — not a hard gate in Phase 3, but surfaced as a Work Queue prompt)
- PM attestation that the sub has reported work complete

### 6.2 `IWarrantyCaseResolutionRecord`

A `WarrantyCaseResolutionRecord` is created when the PM confirms a case is ready for closure — either after verification passes (`Verified → Closed`) or at earlier resolution points (see T04 §8 for dual resolution behavior).

```typescript
interface IWarrantyCaseResolutionRecord {
  resolutionRecordId: string;            // UUID
  caseId: string;                        // FK → WarrantyCase
  resolvedAt: string;                    // ISO datetime of resolution confirmation
  resolvedByUserId: string;              // PM / WARRANTY_MANAGER who confirmed resolution
  resolutionType: WarrantyResolutionType;
  resolutionDescription: string;         // free-text: what was done and confirmed
  verificationNotes: string | null;      // notes from verification inspection (optional)
  isBackChargeAdvisory: boolean;         // triggers Financial advisory if true
  backChargeAdvisoryNotes: string | null; // PM notes for Financial
  subcontractorPerformanceNote: string | null; // optional note for Closeout / Sub scorecard
  // Layer 2 seam: future owner sign-off reference
  ownerSignOffRef: string | null;        // reserved for Layer 2 owner acceptance record
}

enum WarrantyResolutionType {
  Corrected = 'Corrected',              // defect repaired and verified
  Credited = 'Credited',               // financial credit issued in lieu of repair
  Voided = 'Voided',                   // case withdrawn; no repair required
  NotWarrantyScope = 'NotWarrantyScope', // resolved as out-of-scope determination
}
```

### 6.3 Immutability constraint

`IWarrantyCaseResolutionRecord` is immutable after creation. If a resolution is subsequently disputed, the case is reopened via the `Reopened` path (T04 §8.3) and a new resolution record is created on re-closure. The original record is preserved as audit history with the `caseId` FK linking both records to the same case lineage.

### 6.4 Verification gate before closure

No `WarrantyCaseResolutionRecord` of type `Corrected` may be created without a prior `Verified` state entry. The verification gate ensures an independent inspection step is always present before a corrective repair is recorded as complete. See T04 §7 for verification requirements.

---

## 7. Back-Charge Advisory Linkage

### 7.1 Advisory model

When `IWarrantyCaseResolutionRecord.isBackChargeAdvisory = true`, the Warranty module publishes an advisory to the Financial module. This is a read-only signal — it does not create a Financial record and does not initiate a back-charge.

The Financial module or PX determines whether to initiate a formal back-charge through Financial's own governed workflow. Warranty owns no Financial domain records.

### 7.2 Advisory content

The advisory carries:
- FK to the closed `WarrantyCase` (case ID, title, coverage item, subcontractor)
- `backChargeAdvisoryNotes` — PM rationale for the advisory
- Estimated cost impact if PM-entered (advisory estimate only; not a Financial commitment field)
- Link to associated `IWarrantyCaseResolutionRecord`

### 7.3 Boundary constraint

> **Invariant:** Warranty does not write to Financial domain records. Back-charge advisories flow outbound from Warranty as a published signal. Financial owns all cost and commitment records resulting from that advisory.

---

## 8. Workflow Handoff, Acknowledgment Package, and Notification Integration

### 8.1 `@hbc/acknowledgment` integration

The Warranty module uses `@hbc/acknowledgment` for the subcontractor assignment acknowledgment workflow. The acknowledgment package manages the formal request/response cycle and surfaces pending acknowledgments in the Work Queue.

Phase 3 acknowledgment flow:

1. Case transitions to `Assigned` → `IWarrantyCaseAssignment` created
2. `@hbc/acknowledgment` creates a pending acknowledgment item on the Work Queue for PM
3. PM contacts sub externally and records response in `ISubcontractorAcknowledgment`
4. `@hbc/acknowledgment` marks the item resolved when `status ≠ Pending`
5. Unresolved items age into escalation triggers (§3.3)

**Dependency note:** `@hbc/acknowledgment` is a provisional package at Phase 3 authoring time. The Warranty module must verify acknowledgment package maturity before building the production acknowledgment flow on it. If `@hbc/acknowledgment` is not production-ready at Phase 3 build time, the PM-to-PM Work Queue nudge pattern (as used elsewhere in Project Hub) is the fallback.

### 8.2 `@hbc/notification-intelligence` integration

In Phase 3, outbound notifications are advisory Work Queue items surfaced to the PM. The Warranty module does not send external notifications directly in Phase 3.

Layer 2 notification integration uses `@hbc/notification-intelligence` for:
- Assignment notification dispatch to subcontractor (portal / email)
- Acknowledgment deadline reminders to sub
- Completion declaration confirmation to PM
- Dispute outcome notification to sub

When Layer 2 sends automated notifications, each outbound notification is recorded as a `IWarrantyCommunicationEvent` with `sourceChannel = OwnerPortal` (see T05 §5.2) extended to include subcontractor-directed events. The notification record is the paper trail for what was sent and when.

### 8.3 Work Queue publication on subcontractor events

| Event | Work Queue item | Assignee |
|---|---|---|
| Case assigned to sub | Next Move: Contact sub and confirm acknowledgment | PM |
| Acknowledgment SLA reminder | Nudge: Sub acknowledgment not confirmed (n BD) | PM |
| Acknowledgment SLA escalation | Escalation: Sub acknowledgment overdue | PX |
| Scope disputed | Next Move: Resolve sub scope dispute | PM |
| Dispute unresolved > threshold | Escalation: Sub dispute unresolved | PX |
| Completion declared, verification pending | Next Move: Schedule verification inspection | PM / WARRANTY_MANAGER |
| Verification failed | Next Move: Re-engage sub for re-correction | PM |
| Back-charge advisory flagged | Advisory: Review back-charge potential | PX |

---

## 9. External Collaboration Deferrals

The following subcontractor-facing capabilities are explicitly deferred to Layer 2. They must not be prototyped or partially built in Phase 3:

| Deferred capability | Why it is deferred | Layer 2 requirement |
|---|---|---|
| Subcontractor portal login | `EXT_SUB` role does not exist in `@hbc/auth` in Phase 3; premature auth complexity | Add `EXT_SUB` role to `@hbc/auth` before Layer 2 sub portal build |
| Direct case notification to sub | No sub contact model or routing in Phase 3; `@hbc/notification-intelligence` sub routing is not configured | Sub contact model + notification routing must be designed in Layer 2 |
| Sub direct acknowledgment entry | Portal access is the prerequisite | Depends on sub portal login above |
| Sub direct evidence upload | Requires sub portal with file upload permissions | Depends on sub portal login above |
| Sub-visible due-date dashboard | Requires sub portal | Depends on sub portal login above |
| Multi-sub portfolio view | Not relevant to single-case acknowledgment model in Phase 3 | May be added in Layer 2 for large general contractor sub-management scenarios |
| Digital punch-list integration | Out of Warranty scope; punch-list is a Closeout/Startup concern | If punch-list items convert to warranty cases at turnover, that is T03 §3 territory |

### 9.1 Why no partial sub portal in Phase 3

Building any sub-facing portal surface in Phase 3 — even a read-only status page — would require establishing `EXT_SUB` auth, URL routing, tenant isolation, and sub identity management. These are Layer 2 concerns. A partial implementation would create a brittle authentication surface that the full Layer 2 build must later refactor.

Phase 3 delivers a complete internal sub workflow record model with clean seam fields. Layer 2 adds the external surface cleanly on top.

---

## 10. No Duplicate Source-of-Truth Constraint (Subcontractor Records)

Consistent with the module-wide invariant in T05 §6, this constraint applies equally to subcontractor participation records:

> **There is one canonical acknowledgment record and one canonical resolution record per case.** Layer 2 does not create parallel subcontractor-facing copies. The `ISubcontractorAcknowledgment` record entered by the PM in Phase 3 and the same record entered directly by the sub in Layer 2 are the same record, distinguished only by `enteredBy`.

Violations of this constraint require explicit ADR-level approval and a migration plan for Phase 3 records.

---

*← [T05](P3-E14-T05-Owner-Intake-Communications-and-Future-Workspace-Seams.md) | [Master Index](P3-E14-Project-Warranty-Module-Field-Specification.md) | [T07 →](P3-E14-T07-UX-Surface-Canvas-Saved-Views-Related-Items-and-Next-Move.md)*
