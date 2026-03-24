# P3-E14-T05 — Owner Intake, Communications, and Future Workspace Seams

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E14-T05 |
| **Parent** | [P3-E14 Project Warranty Module](P3-E14-Project-Warranty-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T05 of 10 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. Phase 3 Representation of Owner-Originated Requests

### 1.1 The PM-proxy model

In Phase 3, every owner-reported warranty issue enters the system through the PM. There is no owner-facing intake form, no owner login, and no self-service channel. The PM is the owner's proxy in Project Hub.

This is not a temporary workaround — it is the correct Phase 3 design. Phase 3 establishes the record model, the communication event model, and the canonical case structure that Layer 2 will build on. Building owner-direct access before the underlying model is mature would produce brittle integration debt.

### 1.2 OwnerIntakeLog as a first-class record

An owner-originated request is represented as an `OwnerIntakeLog` record — a first-class typed record, not a text comment on a case. This distinction matters:

- `OwnerIntakeLog` records are queryable and filterable independently of their linked cases.
- They carry explicit `reportChannel`, `reportedAt`, and `loggedByUserId` provenance.
- They carry a `sourceChannel = PmEntered` discriminator that marks them as Phase 3 proxy-entered. Layer 2 entries will carry `sourceChannel = OwnerPortal`.
- They may link to one or more `WarrantyCase` records, or remain unlinked if the issue falls outside warranty scope.

### 1.3 What the PM enters

When the PM logs an owner's report, they record:

| Field | What to enter |
|---|---|
| `reportedByOwner` | Owner name or organization (free text in Phase 3) |
| `reportedAt` | When the owner reported the issue (may predate the log entry) |
| `reportChannel` | How the owner communicated: Phone / Email / SiteVisit / Written |
| `issueDescription` | Owner's description — PM-transcribed, in the owner's terms |
| `location` | Where the owner reports the issue |
| `loggedAt` | When the PM entered the record (system-stamped) |

The `issueDescription` should capture the owner's words, not the PM's reframing. The PM's assessment of whether it is a warranty issue belongs in the linked `WarrantyCase` coverage decision — not in the intake record. Keeping the intake record as the owner's original report preserves an accurate audit trail.

---

## 2. Internal-Only Versus Future External/Self-Service

### 2.1 What stays internal in Phase 3

| Capability | Phase 3 position |
|---|---|
| Intake form and case creation | Internal only — PM enters |
| Case status visibility | Internal only — PM communicates externally through their preferred channel |
| Communication history | Internal log on the PM's side — owner does not see it |
| Evidence review | Internal only — PM may share individual items externally but not through the system |
| Denial / not-covered communication | Internal — system surfaces communication templates; PM delivers them externally |
| Subcontractor coordination | Internal only — PM coordinates with sub outside the system |

### 2.2 What is explicitly Layer 2 scope

| Capability | Layer 2 future |
|---|---|
| Owner intake portal (web form) | Yes |
| Owner case status self-service | Yes |
| Owner notification (push / email from the system) | Yes |
| Property manager multi-unit portfolio view | Yes |
| Owner-facing communications thread | Yes |
| Subcontractor direct case access and acknowledgment | Yes (also T06) |

The seam contracts that enable Layer 2 to build on Phase 3 records without a data model change are defined in §5.

---

## 3. Communications Timeline and Event Model

### 3.1 Communication event record

Phase 3 does not build a full messaging system. It builds a **communications log** — a PM-maintained timeline of external communications on owner-originated cases. This is a first-class feature, not an afterthought.

```typescript
interface IWarrantyCommunicationEvent {
  communicationEventId: string;       // UUID
  caseId: string;                     // FK → WarrantyCase
  ownerIntakeLogId: string | null;    // FK → OwnerIntakeLog if originating from owner report
  direction: CommunicationDirection;  // Outbound | Inbound
  channel: OwnerReportChannel;        // Phone | Email | SiteVisit | Written
  summary: string;                    // PM-entered summary of what was communicated
  communicatedAt: string;             // ISO datetime (when communication occurred)
  loggedByUserId: string;             // PM who entered the log
  loggedAt: string;                   // System timestamp
  // Layer 2 seam: future external messages reference this event model
  sourceChannel: WarrantyCaseSourceChannel; // PmEntered | OwnerPortal (Layer 2)
}

enum CommunicationDirection {
  Outbound = 'Outbound',  // PM communicated to owner
  Inbound = 'Inbound',    // Owner communicated to PM (PM-recorded)
}
```

### 3.2 When communication events are expected

The system surfaces communication event prompts at key case lifecycle transitions that have owner visibility implications:

| Case transition | Communication prompt |
|---|---|
| `Open → PendingCoverageDecision` | — (internal evaluation; no owner update expected yet) |
| `PendingCoverageDecision → NotCovered` | ⚑ "Log communication to owner: not covered determination" |
| `PendingCoverageDecision → Denied` | ⚑ "Log communication to owner: claim denied determination" |
| `PendingCoverageDecision → Assigned` | ⚑ "Consider notifying owner: case accepted and assigned" |
| `AwaitingSubcontractor → Scheduled` | ⚑ "Log communication to owner: visit date confirmed" |
| `Corrected → PendingVerification` | Optional |
| `Verified → Closed` | ⚑ "Log communication to owner: case resolved and closed" |

These prompts are advisory Work Queue nudges — they do not block the case transition. A PM who communicates outside the system and does not log the communication is not blocked. The advisory is an operational discipline tool, not a workflow gate.

### 3.3 Communication timeline in the case workspace

On any case with an associated `OwnerIntakeLog`, the case workspace surfaces a **Communications tab** showing:
- The original intake log (owner's reported issue)
- All `IWarrantyCommunicationEvent` records in reverse chronological order
- Empty state: "No communications logged. Use the log to track owner updates."
- Add communication button for PM/WARRANTY_MANAGER

This tab is not visible on cases without an associated intake log (i.e., cases the PM opened directly without a prior owner report).

---

## 4. Status Visibility Principles

### 4.1 PM is the owner's status proxy

The module's job in Phase 3 is to make the PM a well-informed and efficient status proxy. At any moment, the PM should be able to answer the owner's question — "what is happening with my issue?" — without digging through emails or memory.

The case workspace surfaces a **Owner Status Summary** block on cases with an associated intake log. This block shows:

- Current case status in plain-language owner-facing terms (not internal enum values)
- Last communication logged (channel + date + summary)
- Next expected milestone (SLA deadline, visit date, or pending PM action)
- Back-charge advisory status if applicable

### 4.2 Plain-language case status mapping

| Internal status | Owner-facing status text |
|---|---|
| `Open` | Under review |
| `PendingCoverageDecision` | Under review |
| `Assigned` | Accepted — assigned to responsible contractor |
| `AwaitingSubcontractor` | Accepted — awaiting contractor response |
| `AwaitingOwner` | Requires your input or site access |
| `Scheduled` | Repair visit scheduled |
| `InProgress` | Repair work underway |
| `Corrected` | Repair completed — pending verification |
| `PendingVerification` | Pending our final inspection |
| `Verified` | Repair verified — case closing |
| `Closed` | Resolved and closed |
| `NotCovered` | Outside warranty scope |
| `Denied` | Not covered — not a warranty claim |
| `Duplicate` | Consolidated with existing open case |
| `Voided` | Withdrawn |
| `Reopened` | Re-opened for further investigation |

These strings are UI-layer rendering constants, not stored values. The canonical status is `WarrantyCaseStatus` enum. The plain-language text is derived at render time.

### 4.3 Denial and not-covered communication handling

When a case is `NotCovered` or `Denied`, the case workspace surfaces a **Communication Template** the PM may use when contacting the owner. The template is pre-populated with the coverage decision rationale but is fully editable before use.

```text
Template: Warranty Scope Determination — Not Covered

Dear [Owner Name],

Thank you for reporting [issue description] at [project/location].

After reviewing the applicable warranty coverage, we have determined that this
issue falls outside the warranty scope for the following reason:

[PM enters coverage decision rationale here]

If you have questions, please contact [PM Name] at [contact].
```

The PM can review, edit, and use the template externally. The use of the template is logged as a `CommunicationDirection.Outbound` event with `summary = "Not-covered determination communicated to owner"` and channel as selected by PM.

### 4.4 Update cadence advisory

For open cases with an associated intake log, the module surfaces a communication cadence advisory:

| SLA tier | Advisory trigger | Advisory text |
|---|---|---|
| Expedited | No logged communication in 3 days | "No owner update logged in 3 days on an expedited case" |
| Standard | No logged communication in 7 days | "No owner update logged in 7 days" |

Advisory is surfaced as a Work Queue nudge (low priority) and as an inline badge on the case card in the Next Move surface. It is not a hard block and may be dismissed by the PM.

---

## 5. Future Workspace Seam Contracts

Phase 3 defines the following seam contracts so that Layer 2 can be added without a schema change or data migration. Each seam is implemented by a discriminator field already in the record model (T02).

### 5.1 Owner portal intake seam

**What it enables:** Owners submit warranty issues directly through a future owner portal instead of calling the PM.

**Seam field:** `IOwnerIntakeLog.sourceChannel`

- Phase 3: `sourceChannel = PmEntered`
- Layer 2: `sourceChannel = OwnerPortal` — the owner portal writes the same `IOwnerIntakeLog` record; the seam field distinguishes the source without a schema change

**What Layer 2 must NOT do:** Create a parallel "owner case table" that duplicates `OwnerIntakeLog`. All owner-submitted issues must flow into the same `IOwnerIntakeLog` and link to `WarrantyCase` records.

### 5.2 Owner notification seam

**What it enables:** System-generated status notifications to owners (email, push) when cases change state.

**Seam field:** `IWarrantyCommunicationEvent.sourceChannel`

- Phase 3: all communication events are `PmEntered`
- Layer 2: the notification engine writes `CommunicationEvent` records with `sourceChannel = OwnerPortal` when automated outbound notifications are sent

**Implementation requirement:** Layer 2 must use `@hbc/notification-intelligence` for outbound notification dispatch, not a local email stack. The communication event record is the paper trail for what was sent and when.

### 5.3 Property manager role seam

**What it enables:** Property managers on multi-unit residential or commercial projects can view warranty posture across units without PM delegation.

**Seam field:** `IOwnerIntakeLog.reportedByOwner` (currently free text)

**Layer 2 requirement:** `reportedByOwner` must be normalizable to a governed external party record. The free-text Phase 3 field design does not block this — Layer 2 adds a structured `externalPartyRef` field alongside the free-text field. The migration path is additive.

**Phase 3 constraint:** No property manager role exists in `@hbc/auth` in Phase 3. This role must be added before Layer 2 is built.

### 5.4 Owner auth model seam

**What it enables:** Owners authenticate directly into a future warranty portal and see only their project's cases.

**Seam field:** `IWarrantyCase.sourceChannel`, `IOwnerIntakeLog.sourceChannel`

**Auth requirement (deferred):** An `EXT_OWNER` role must be added to `@hbc/auth` before Layer 2 is built (T02 §6.1). The Phase 3 authority matrix does not include this role.

**Phase 3 invariant:** Warranty cases in Phase 3 carry `sourceChannel = PmEntered`. When Layer 2 writes owner-direct cases, they carry `sourceChannel = OwnerPortal`. The distinction is queryable and filterable in the future.

### 5.5 Self-service status visibility seam

**What it enables:** Owners see real-time case status without calling the PM.

**What is required:** The `WarrantyCaseStatus` plain-language mapping table (§4.2) is the source for the owner-facing status display in Layer 2. No additional status field is needed. Layer 2 renders the same mapping table with owner-appropriate language from the canonical `WarrantyCaseStatus` enum.

**Phase 3 invariant:** Owner status visibility is not a separate data store. Layer 2 queries the same `WarrantyCase.status` field and applies the owner-facing mapping at the presentation layer.

---

## 6. No Duplicate Source-of-Truth Constraint

This is the central governing invariant for the entire owner communication and Layer 2 design:

> **There is one canonical warranty record per project.** Layer 2 does not create a parallel source of truth. Every owner-originated intake, every owner-visible case status, every communication event, and every resolution outcome is stored in the Phase 3 record model and surfaced by Layer 2 as a presentation layer over those records.

This means:

- Layer 2 may NOT maintain its own "owner case database" synced from Project Hub
- Layer 2 may NOT create owner-visible "copies" of cases in a separate store
- Layer 2 may NOT fork the status lifecycle — the 16-state `WarrantyCaseStatus` is the canonical state machine for both layers
- Layer 2 communications log is the same `IWarrantyCommunicationEvent` table as Phase 3

Violations of this constraint require explicit ADR-level approval and a migration plan for the existing Phase 3 record set.

---

*← [T04](P3-E14-T04-Warranty-Case-Lifecycle-States-and-SLA-Escalation-Model.md) | [Master Index](P3-E14-Project-Warranty-Module-Field-Specification.md) | [T06 →](P3-E14-T06-Subcontractor-Participation-Acknowledgment-and-Resolution-Declarations.md)*
