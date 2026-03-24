# P3-E11-T04 — Contract Obligations Register Operating Model

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E11-T04 |
| **Parent** | [P3-E11 Project Startup Module](P3-E11-Project-Startup-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T04 of 10 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. Purpose — Active Monitoring Ledger, Not Review Form

The Contract Obligations Register is a **governed obligation ledger with active lifecycle monitoring** — not a one-time review form. It captures every contractual obligation extracted from the executed Owner's contract and tracks each obligation from identification through satisfaction or waiver, generating Work Queue items for obligations that require monitoring.

The distinction from the superseded "Owner Contract Review" model:

| Original model | Register model |
|---|---|
| One-time form completed at startup | Active ledger maintained from startup through project close |
| Free-text rows with no categorization | Structured obligation records with category, trigger, and monitoring fields |
| No lifecycle after initial entry | Each obligation has an explicit `obligationStatus` lifecycle with guarded transitions |
| No flagging or due-date tracking | Flagged obligations and due-date obligations generate Work Queue items |
| No routing by obligation type | `category` and `responsibleRoleCode` drive routing to correct Work Queue owner |
| No Closeout continuity | Open count and flagged count snapshotted into `StartupBaseline` at lock |

The register's ongoing value extends beyond startup. Obligations with `flagForMonitoring = true` remain surfaced in Work Queue throughout the project lifecycle until resolved, waived, or explicitly reopened under PX governance.

**Source document:** `docs/reference/example/Responsibility Matrix - Owner Contract Template.xlsx` — Owner contract obligations matrix (45 reference rows across 6 columns: Article / Page / Responsible Party / Description / Category / Notes).

---

## 2. ContractObligationsRegister Header

One register per project. Created automatically at project creation alongside `StartupProgram`.

| Field | Type | Required | Calculated | Rule |
|---|---|---|---|---|
| `registerId` | `string` | Yes | Yes | UUID; immutable |
| `programId` | `string` | Yes | No | FK to StartupProgram |
| `projectId` | `string` | Yes | No | FK to project; one register per project |
| `contractDate` | `date` | No | No | Date of the executed Owner's contract |
| `contractType` | `enum` | No | No | See §9 for `ContractType` enum |
| `contractValue` | `number` | No | No | Total executed Owner contract value; USD |
| `deliveryMethod` | `enum` | No | No | See §9 for `DeliveryMethod` enum |
| `uploadedContractFileId` | `string` | No | No | FK to document management layer for uploaded executed contract |
| `createdAt` | `datetime` | Yes | Yes | Timestamp of register creation |
| `createdBy` | `string` | Yes | No | userId of creator |
| `lastModifiedAt` | `datetime` | Yes | Yes | Timestamp of most recent obligation row edit |
| `lastModifiedBy` | `string` | No | No | userId of most recent editor |
| `totalObligationCount` | `number` | Yes | Yes | Count of all `ContractObligation` rows |
| `openObligationCount` | `number` | Yes | Yes | Count of rows with `obligationStatus = OPEN` |
| `inProgressObligationCount` | `number` | Yes | Yes | Count of rows with `obligationStatus = IN_PROGRESS` |
| `flaggedObligationCount` | `number` | Yes | Yes | Count of rows with `flagForMonitoring = true` and `obligationStatus ∉ {SATISFIED, NOT_APPLICABLE, WAIVED}` |
| `overdueObligationCount` | `number` | Yes | Yes | Count of rows with `dueDate < today` and `obligationStatus ∉ {SATISFIED, NOT_APPLICABLE, WAIVED}` |
| `lastMonitoringReviewAt` | `datetime` | No | No | Timestamp when PM last acknowledged monitoring review |
| `certificationStatus` | `enum` | Yes | Yes | Mirrors `ReadinessCertification.certStatus` for `CONTRACT_OBLIGATIONS` sub-surface |

---

## 3. ContractObligation Row Model

Each extracted obligation is a `ContractObligation` record. There is no upper limit; the register captures every obligation the team identifies.

| Field | Type | Required | Calculated | Rule |
|---|---|---|---|---|
| `obligationId` | `string` | Yes | Yes | UUID; immutable |
| `registerId` | `string` | Yes | No | FK to ContractObligationsRegister |
| `projectId` | `string` | Yes | No | FK to project |
| `article` | `string` | No | No | Contract article or section reference (e.g., `Article 3.2`) |
| `page` | `string` | No | No | Page number or exhibit reference in executed contract (e.g., `p. 12`, `Exhibit B`) |
| `exhibitRef` | `string` | No | No | Named exhibit or attachment (e.g., `Exhibit C — Insurance Schedule`) |
| `description` | `string` | Yes | No | Description of the contractual requirement |
| `category` | `enum` | No | No | See §5 for obligation category enum |
| `responsibleRoleCode` | `string` | No | No | Role code responsible for managing/executing this obligation (e.g., `PM`, `PX`, `ProjAcct`) |
| `responsiblePersonName` | `string` | No | No | Named person currently assigned responsibility for this obligation |
| `responsibleUserId` | `string` | No | No | FK to user record; null if not yet in system |
| `accountableRoleCode` | `string` | No | No | Role code ultimately accountable to Owner for this obligation; typically `PX` for Owner-facing obligations |
| `obligationStatus` | `enum` | Yes | No | `OPEN` \| `IN_PROGRESS` \| `SATISFIED` \| `WAIVED` \| `NOT_APPLICABLE`; see §4 for transitions |
| `flagForMonitoring` | `boolean` | Yes | No | `true` = active monitoring required; generates Work Queue items while status is not terminal; default `false` |
| `monitoringPriority` | `enum` | No | No | `HIGH` \| `MEDIUM` \| `LOW`; governs reminder frequency when `flagForMonitoring = true` |
| `triggerBasis` | `enum` | No | No | See §3.1 for `ObligationTriggerBasis` enum |
| `dueDate` | `date` | No | No | Obligation due date or next-due date (for recurring obligations) |
| `recurrencePeriodDays` | `number` | No | No | For recurring obligations: number of days between occurrences; null if not recurring |
| `nextMonitoringCheckAt` | `date` | No | Yes | Calculated: `dueDate` minus reminder lead days per `monitoringPriority`; null if no `dueDate` |
| `notes` | `string` | No | No | Team notes on this obligation |
| `waiverNote` | `string` | No | No | Required when `obligationStatus = WAIVED`; must document the contractual basis for the waiver |
| `evidenceAttachmentIds` | `string[]` | No | No | Document management layer file IDs proving satisfaction (pay app submission receipts, insurance certs, notice letters, etc.) |
| `satisfiedAt` | `datetime` | No | No | Timestamp when obligation was marked `SATISFIED` |
| `satisfiedBy` | `string` | No | No | userId |
| `createdAt` | `datetime` | Yes | Yes | Timestamp of row creation |
| `createdBy` | `string` | Yes | No | userId |
| `lastModifiedAt` | `datetime` | Yes | Yes | Timestamp of last edit; versioned via `@hbc/versioned-record` |
| `lastModifiedBy` | `string` | No | No | userId |

`@hbc/versioned-record` is required on `obligationStatus` changes.

### 3.1 ObligationTriggerBasis Enum

```typescript
enum ObligationTriggerBasis {
  ProjectStart      = 'PROJECT_START',         // Required at or before project start
  NTPIssued         = 'NTP_ISSUED',             // Triggered when NTP is issued
  ContractExecution = 'CONTRACT_EXECUTION',    // Required upon Owner contract execution
  MilestoneDate     = 'MILESTONE_DATE',         // Tied to a specific contractual milestone
  RecurringMonthly  = 'RECURRING_MONTHLY',      // Recurring on monthly cycle
  RecurringQuarterly = 'RECURRING_QUARTERLY',  // Recurring on quarterly cycle
  OwnerNotice       = 'OWNER_NOTICE',           // Triggered by Owner issuing a formal notice
  AsNeeded          = 'AS_NEEDED',              // Triggered by project conditions
  ProjectClose      = 'PROJECT_CLOSE',          // Due at or before project closeout
  None              = 'NONE',                   // No explicit trigger; monitoring only
}
```

---

## 4. Obligation Lifecycle States

```
OPEN ──────────────────── → IN_PROGRESS → SATISFIED
  │                              │
  ├── → NOT_APPLICABLE           └── → OPEN (regression)
  └── → WAIVED (PX note required)

IN_PROGRESS → WAIVED (PX note required)
SATISFIED / NOT_APPLICABLE / WAIVED → OPEN (PX reopen only; note required)
```

| State | Code | Description | Terminal |
|---|---|---|---|
| Open | `OPEN` | Obligation identified; not yet addressed | No |
| In Progress | `IN_PROGRESS` | Active work under way toward satisfying this obligation | No |
| Satisfied | `SATISFIED` | Obligation fully met; evidence attached or documented | Yes |
| Not Applicable | `NOT_APPLICABLE` | Confirmed not applicable to this project scope; documented | Yes |
| Waived | `WAIVED` | Contractual waiver or modification agreed with Owner; `waiverNote` required | Yes |

**State transition rules:**

| Transition | Guard |
|---|---|
| `OPEN → IN_PROGRESS` | None |
| `OPEN → NOT_APPLICABLE` | `notes` must be populated |
| `OPEN → WAIVED` | `waiverNote` required; PX must be the actor (403 for non-PX) |
| `IN_PROGRESS → SATISFIED` | `evidenceAttachmentIds` must contain at least one file, OR `notes` must be populated with justification |
| `IN_PROGRESS → OPEN` | Permitted; regression documented in `notes` |
| `IN_PROGRESS → WAIVED` | `waiverNote` required; PX must be the actor |
| `SATISFIED` \| `NOT_APPLICABLE` \| `WAIVED` → `OPEN` | PX must be the actor; `notes` must document why the obligation is being reopened |

All `obligationStatus` changes are versioned via `@hbc/versioned-record`.

---

## 5. Obligation Categories

The `category` field classifies obligations for routing and reporting:

| Category code | Label | Routing implication |
|---|---|---|
| `SPECIAL_TERMS` | Special Terms | Routes to PM and PX; high monitoring priority |
| `LIQUIDATED_DAMAGES` | Liquidated Damages | Routes to PX and ProjAcct; auto-flag for monitoring |
| `SPLIT_SAVINGS` | Split Savings | Routes to PX and ProjAcct |
| `ALLOWANCES` | Allowances | Routes to PM; link to Financial module tracking |
| `BONDING_REQUIREMENTS` | Bonding Requirements | Routes to ProjAcct; due dates required |
| `INSURANCE_REQUIREMENTS` | Insurance Requirements | Routes to ProjAcct; recurring due dates required |
| `SCHEDULE_MILESTONES` | Schedule Milestones | Routes to PM; link to Schedule module |
| `PAYMENT_TERMS` | Payment Terms | Routes to ProjAcct |
| `CHANGE_ORDER_AUTHORITY` | Change Order Authority | Routes to PX and PM |
| `WARRANTIES` | Warranties | Routes to PM; typically PROJECT_CLOSE trigger |
| `OWNER_COMMITMENT` | Owner Commitment | Owner-side obligations that HB must track and enforce |
| `OTHER` | Other | Routes to PM |

---

## 6. Monitoring Engine

### 6.1 Monitoring Trigger Rules

The register actively generates Work Queue items based on obligation state. Work Queue items clear automatically when the triggering condition resolves.

| Condition | Work Queue item type | Assigned to | Clears when |
|---|---|---|---|
| `flagForMonitoring = true` AND `obligationStatus = OPEN` | `ObligationOpenFlagged` | `responsibleRoleCode` (PM if null) | `obligationStatus` transitions to `IN_PROGRESS`, `SATISFIED`, `WAIVED`, or `NOT_APPLICABLE` |
| `flagForMonitoring = true` AND `obligationStatus = IN_PROGRESS` AND no `evidenceAttachmentIds` after 30 days | `ObligationNoEvidence` | `responsibleRoleCode` (PM if null) | Evidence attached or obligation satisfied |
| `dueDate` within 14 days AND `obligationStatus ∉ {SATISFIED, NOT_APPLICABLE, WAIVED}` | `ObligationDueSoon` | `responsibleRoleCode` (PM if null) | `obligationStatus` transitions to terminal state |
| `dueDate` in the past AND `obligationStatus ∉ {SATISFIED, NOT_APPLICABLE, WAIVED}` | `ObligationOverdue` | `responsibleRoleCode` AND `accountableRoleCode` | `obligationStatus` transitions to terminal state |
| `triggerBasis = RECURRING_MONTHLY` or `RECURRING_QUARTERLY` AND `dueDate < today` AND terminal state not yet set for this cycle | `ObligationRecurringDue` | `responsibleRoleCode` (PM if null) | PM advances `dueDate` to next cycle and transitions status |

### 6.2 Monitoring Priority Lead Days

When `flagForMonitoring = true` and a `dueDate` is set, the `nextMonitoringCheckAt` calculation uses lead days by priority:

| monitoringPriority | Reminder lead days before `dueDate` |
|---|---|
| `HIGH` | 21 days |
| `MEDIUM` | 14 days |
| `LOW` | 7 days |

### 6.3 Escalation Rules

| Trigger | Escalation action |
|---|---|
| Obligation `OVERDUE` > 7 days with `monitoringPriority = HIGH` | Escalate Work Queue item to `accountableRoleCode` (PX) |
| `LIQUIDATED_DAMAGES` obligation reaches `dueDate` without `SATISFIED` status | Immediate Work Queue item to PX regardless of `flagForMonitoring` value |
| Register `overdueObligationCount ≥ 3` at time of Safety Readiness certification review | Advisory annotation surfaced on PM Plan certification |

### 6.4 Recurring Obligation Cycle Advancement

When a `RECURRING_MONTHLY` or `RECURRING_QUARTERLY` obligation is `SATISFIED` for the current cycle:

1. PM marks `obligationStatus = SATISFIED` with evidence
2. PM advances `dueDate` to the next cycle date (`dueDate + recurrencePeriodDays`)
3. System resets `obligationStatus` to `OPEN` for the new cycle
4. The prior cycle satisfaction is preserved in the `@hbc/versioned-record` history

---

## 7. Register Certification Eligibility

`ReadinessCertification` for `CONTRACT_OBLIGATIONS` may be submitted when **all** of:

1. `totalObligationCount ≥ 1` — the team performed a contract review and extracted at least one obligation
2. All obligations with `flagForMonitoring = true` have a `notes` value documenting the team's review position
3. All obligations with a `dueDate` within the next 30 days have `obligationStatus ∉ {OPEN}`, or have a documented `notes` entry and active `flagForMonitoring = true` with an acknowledged Work Queue item
4. All `LIQUIDATED_DAMAGES` obligations have `dueDate` populated
5. All `INSURANCE_REQUIREMENTS` obligations have `dueDate` populated (or `triggerBasis = RECURRING_MONTHLY` with `dueDate` set to next renewal)

The register does not require every obligation to be `SATISFIED`, `WAIVED`, or otherwise terminal for certification. It requires the team to document the review position, route ownership, and acknowledge all monitored and near-due obligations that remain active. PE reviews the submitted certification with full visibility into `openObligationCount`, `flaggedObligationCount`, and `overdueObligationCount`, then decides whether the documented position is acceptable for readiness.

---

## 8. Financial, Schedule, and Reports Integration

The Contract Obligations Register does not write to the Financial or Schedule modules. Integration is read-context and advisory only.

| Integration point | Direction | Model |
|---|---|---|
| `contractValue` field | Startup writes | Stored on register header; read by Reports for project summary |
| `LIQUIDATED_DAMAGES` obligations with `dueDate` | Startup → Work Queue | `ObligationDueSoon` and `ObligationOverdue` items routed to ProjAcct |
| `SCHEDULE_MILESTONES` obligations | Display cross-reference | UI may surface matching Schedule module milestone dates as display context — read-only; not synced |
| `PAYMENT_TERMS` obligations | Display cross-reference | UI may surface current pay application status from Financial module as display context — read-only |
| `StartupBaseline` snapshot | Startup → Closeout read | `contractObligationsSnapshotAtLock` captures total, flagged, open, and satisfied obligation counts at baseline lock for Closeout/Autopsy reference |

**Closeout continuity:** At baseline lock, the snapshot captures the state of the register. Closeout/Autopsy uses this to compare "obligations flagged at launch" against resolution outcomes. Closeout does not query live `ContractObligation` records; it reads the snapshot only.

---

## 9. Contract Type and Delivery Method Enums

```typescript
enum ContractType {
  AIADocs           = 'AIA Docs',
  ConsensusDocs     = 'Consensus Docs',
  ConstructionManager = 'Construction Manager',
  CostPlusWithGMP   = 'Cost Plus with GMP',
  CostPlusWithoutGMP = 'Cost Plus without GMP',
  LumpSum           = 'Lump Sum',
  PurchaseOrder     = 'Purchase Order',
  StipulatedSum     = 'Stipulated Sum',
  TimeAndMaterial   = 'Time & Material',
}

enum DeliveryMethod {
  ConstructionManager = 'Construction Manager',
  DesignBuild         = 'Design Build',
  FastTrack           = 'Fast Track',
  GeneralContractor   = 'General Contractor',
  OwnersRepresentative = 'Owners Representative',
  P3                  = 'P3',
  Preconstruction     = 'Preconstruction',
  ProgramManager      = 'Program Manager',
}
```

---

## 10. Procore Setup Reference

The Procore Startup Checklist Summary defines required Procore Admin section fields and Prime Contract tab entries. HB Intel does not write to or sync with Procore; this section is display-only reference material surfaced as a guided setup checklist within the register view.

### 10.1 Procore Admin Fields Reference

| Field | Notes |
|---|---|
| `projectName` | If different from job number name |
| `totalValue` | Actual Owner contract value — not an estimate; update with final data at close |
| `startDate` | Actual scheduled start; update with actual at close |
| `completionDate` | Estimated completion; update with actual at close |
| `projectType` | Market sector from Procore dropdown |
| `squareFeet` | Total project square footage |
| `description` | Concise and accurate project description with unit counts, building types, square footage |
| `projectLocation` | Project address |
| `office` | Procore office assignment |

### 10.2 Prime Contract Tab Reference

Required entries in Procore's Prime Contract tab (reference checklist — not synced to HB Intel):
- Upload executed Owner's Contract
- Complete Contract Dates
- Add Architect/Engineer
- Add Description

---

## 11. Cross-Reference

| Concern | Governing source |
|---|---|
| Register field architecture | This file (T04) |
| StartupBaseline snapshot fields | T02 §7.2 — `contractObligationsSnapshotAtLock` |
| Certification model and gate criteria | T02 §3.3 |
| Work Queue item types | T08 §3 |
| Related Items — obligation to contract | T08 §4 |
| Role permissions for register | T09 §1 |
| SoT boundary (no writes to Financial/Schedule) | T01 §8 |

---

*[← T03](P3-E11-T03-Startup-Program-Checklist-Library-Readiness-Tasks-Blockers-Evidence.md) | [Master Index](P3-E11-Project-Startup-Module-Field-Specification.md) | [T05 →](P3-E11-T05-Responsibility-Routing-and-Accountability-Engine.md)*
