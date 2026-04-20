# P3-E14-T02 — Record Families, Identity, and Authority Model

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E14-T02 |
| **Parent** | [P3-E14 Project Warranty Module](P3-E14-Project-Warranty-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T02 of 10 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. Record Family Overview

The Warranty module owns ten first-class record families. All are authored and owned exclusively by `@hbc/features-project-hub`. No other feature package may write these records.

| Family | Role | Lifecycle terminal states |
|---|---|---|
| `WarrantyCoverageItem` | Coverage inventory — what is under warranty, by whom, and for how long | `Expired`, `Voided` |
| `WarrantyCase` | First-class case — the atomic unit of warranty issue management | `Closed`, `NotCovered`, `Denied`, `Duplicate`, `Voided` |
| `WarrantyCoverageDecision` | Formal determination of whether a case falls within coverage scope | `Covered`, `NotCovered`, `Denied` |
| `WarrantyCaseAssignment` | Current and historical record of responsibility routing per case | `Superseded`, `Released` |
| `WarrantyVisit` | Scheduled or completed site visit for diagnosis, repair, or verification | `Completed`, `Cancelled` |
| `WarrantyCaseEvidence` | Evidence attachments: photos, videos, inspection notes, and linked artifacts | `Archived` |
| `SubcontractorAcknowledgment` | Subcontractor's formal response to a case assignment — scope position and declaration | `ScopeAccepted`, `ScopeDisputed` (terminal pending PM action) |
| `OwnerIntakeLog` | PM-entered record of an owner-reported issue; maps to coverage items and cases | `Linked`, `Unresolvable` |
| `WarrantyCaseResolutionRecord` | Immutable closure record created when a case is closed; includes back-charge advisory | Immutable from creation |
| `WarrantyCoverageExpiration` | System-generated record when a coverage item's window closes; read-only | Immutable from creation |

---

## 2. Record Family Hierarchy

```text
WarrantyCoverageItem (1)
    │
    ├── WarrantyCoverageExpiration (system-generated at expiration; 0..1 per item)
    │
    └── WarrantyCase (many per coverage item)
            │
            ├── WarrantyCoverageDecision (1 per case; replaces when revised)
            │
            ├── WarrantyCaseAssignment (many per case; only one active at a time)
            │       │
            │       └── SubcontractorAcknowledgment (1 per assignment)
            │
            ├── WarrantyVisit (many per case)
            │
            ├── WarrantyCaseEvidence (many per case)
            │
            ├── OwnerIntakeLog (0..1 per case; PM-entered)
            │
            └── WarrantyCaseResolutionRecord (1 per case; created at Closed; immutable)
```

---

## 3. Identity Model

### 3.1 WarrantyCoverageItem identity

A coverage item is keyed by:

```
projectId + coverageLayer + coverageScope + responsiblePartyId
```

- `projectId` — canonical project identifier (UUID from project registry, P3-A1)
- `coverageLayer` — discriminator: `Product`, `Labor`, `System` (see T03 §2)
- `coverageScope` — specific scope identifier within the layer (e.g., `HVAC-Main-Supply`, `Roofing-Membrane`, `Framing-Exterior`)
- `responsiblePartyId` — subcontractor legal entity ID or manufacturer ID (stable external reference)

One active coverage item exists per this 4-tuple. Material changes to responsible party or scope require voiding the existing item and registering a successor, preserving audit continuity.

### 3.2 WarrantyCase identity

A case is keyed by:

```
projectId + caseNumber
```

`caseNumber` is an auto-assigned sequential reference number per project (`W-001`, `W-002`, etc.). It is stable from creation and never reused, even for voided cases. The `caseId` (UUID) is the canonical programmatic key; `caseNumber` is the human-facing reference.

### 3.3 Assignment identity

A `WarrantyCaseAssignment` is keyed by `caseId + assignmentSequence`. When a case is reassigned, the existing assignment is superseded and a new assignment record is created with `assignmentSequence + 1`. This preserves the full routing history without mutation.

### 3.4 Coverage decision identity

A `WarrantyCoverageDecision` is keyed by `caseId`. Only one decision is active per case at a time. If the PM revises a coverage determination, the previous decision is marked `Superseded` and a new decision record is created with a revision note.

---

## 4. Interface Definitions — Key Fields

> **Implementation notes:** Full interface definitions with all fields, validation rules, and computed property contracts are authored in implementation sprints. The definitions below establish the canonical field names, types, and governing rules that all other T-files, the implementation team, and future T-files may reference.

### 4.1 WarrantyCoverageItem

```typescript
interface IWarrantyCoverageItem {
  // Identity
  coverageItemId: string;              // UUID — canonical key
  projectId: string;                   // FK → project registry
  coverageLayer: WarrantyCoverageLayer; // Product | Labor | System
  coverageScope: string;               // human-readable scope label (governed by T03 taxonomy)
  responsiblePartyId: string;          // sub legal entity ID or manufacturer ID
  responsiblePartyName: string;        // display name

  // Coverage window
  warrantyStartDate: string;           // ISO date — when coverage begins
  warrantyEndDate: string;             // ISO date — when coverage expires
  expirationAdvisoryThresholdDays: number; // days before expiration to surface advisory (default: 30)

  // Asset / location anchoring (see T03 §3)
  locationRef: IWarrantyLocationRef | null;
  systemRef: IWarrantySystemRef | null;
  assetRef: IWarrantyAssetRef | null;

  // Linkage to source artifacts
  closeoutTurnoverRef: ICloseoutTurnoverRef | null; // FK to Closeout turnover record
  startupCommissioningRef: IStartupCommissioningRef | null; // FK to Startup commissioning record

  // Status
  status: WarrantyCoverageStatus;      // Draft | Active | Expired | Voided
  sourceHandoff: WarrantyCoverageSource; // StartupTurnover | CloseoutTurnover | Manual

  // Metadata completeness
  isMetadataComplete: boolean;         // computed: all required fields populated
  metadataGaps: WarrantyCoverageMetadataGap[]; // surfaced in advisory if incomplete

  // Audit
  registeredAt: string;                // ISO datetime
  registeredByUserId: string;
  voidedAt: string | null;
  voidedByUserId: string | null;
  voidRationale: string | null;
}
```

### 4.2 WarrantyCase

```typescript
interface IWarrantyCase {
  // Identity
  caseId: string;                      // UUID — canonical key
  projectId: string;                   // FK → project registry
  caseNumber: string;                  // human-facing reference (W-001...)
  coverageItemId: string;              // FK → WarrantyCoverageItem

  // Description
  title: string;                       // short issue description (required)
  description: string;                 // detailed description
  location: string;                    // where on the project the issue presents
  reportedIssueType: WarrantyIssueType; // Defect | Damage | Incomplete | Failure | Other

  // Lifecycle
  status: WarrantyCaseStatus;          // 16-state enum — see T04
  openedAt: string;                    // ISO datetime
  openedByUserId: string;
  lastStatusTransitionAt: string;
  lastStatusTransitionByUserId: string;

  // Assignment
  activeAssignmentId: string | null;   // FK → WarrantyCaseAssignment
  activeDecisionId: string | null;     // FK → WarrantyCoverageDecision

  // SLA
  isUrgent: boolean;                   // PM-flagged; triggers expedited SLA tier
  slaResponseDeadline: string | null;  // computed when assigned
  slaRepairDeadline: string | null;    // computed when sub acknowledges
  slaVerificationDeadline: string | null; // computed when Corrected
  slaStatus: WarrantySlaStatus;        // WithinSla | Approaching | Overdue

  // Financial advisory
  isBackChargeAdvisory: boolean;       // advisory published to Financial
  backChargeAdvisoryPublishedAt: string | null;

  // Resolution
  resolutionRecordId: string | null;   // FK → WarrantyCaseResolutionRecord

  // Intake linkage
  ownerIntakeLogId: string | null;     // FK → OwnerIntakeLog if initiated via intake

  // Layer 2 seam fields
  sourceChannel: WarrantyCaseSourceChannel; // PmEntered | OwnerPortal (Layer 2)
  externalReferenceId: string | null;  // external system ID for Layer 2 integration
}
```

### 4.3 WarrantyCoverageDecision

```typescript
interface IWarrantyCoverageDecision {
  decisionId: string;                  // UUID
  caseId: string;                      // FK → WarrantyCase
  decision: CoverageDecisionOutcome;   // Covered | NotCovered | Denied
  rationale: string;                   // required for all outcomes
  decisionMadeAt: string;              // ISO datetime
  decisionMadeByUserId: string;
  status: CoverageDecisionStatus;      // Active | Superseded
  supersededByDecisionId: string | null;
  revisionNote: string | null;         // required when superseding
}
```

### 4.4 WarrantyCaseAssignment

```typescript
interface IWarrantyCaseAssignment {
  assignmentId: string;                // UUID
  caseId: string;                      // FK → WarrantyCase
  assignmentSequence: number;          // 1-based; increments on reassignment
  responsiblePartyId: string;          // sub or manufacturer ID
  responsiblePartyName: string;
  assignmentType: AssignmentType;      // Subcontractor | Manufacturer | GC | Internal
  assignedAt: string;                  // ISO datetime
  assignedByUserId: string;
  slaResponseDeadline: string;         // ISO date — set at assignment
  slaRepairDeadline: string;           // ISO date — set at assignment
  status: AssignmentStatus;            // Active | Superseded | Released
  supersededAt: string | null;
  supersededReason: string | null;     // Reassignment | Dispute | Error
}
```

### 4.5 WarrantyVisit

```typescript
interface IWarrantyVisit {
  visitId: string;                     // UUID
  caseId: string;                      // FK → WarrantyCase
  visitType: WarrantyVisitType;        // Diagnosis | Repair | Verification | Reinspection
  scheduledDate: string;               // ISO date
  scheduledAt: string;                 // ISO datetime when scheduled
  scheduledByUserId: string;
  attendees: IWarrantyVisitAttendee[]; // PM, Sub contact, Owner contact (Phase 3: PM only)
  status: WarrantyVisitStatus;         // Scheduled | Completed | Cancelled | NoShow
  completedAt: string | null;
  completedByUserId: string | null;
  visitNotes: string | null;
  evidenceIds: string[];               // FKs → WarrantyCaseEvidence captured at visit
  cancellationReason: string | null;
}
```

### 4.6 WarrantyCaseEvidence

```typescript
interface IWarrantyCaseEvidence {
  evidenceId: string;                  // UUID
  caseId: string;                      // FK → WarrantyCase
  visitId: string | null;              // FK → WarrantyVisit (if captured at visit)
  evidenceType: WarrantyEvidenceType;  // Photo | Video | InspectionNote | Document | LinkedArtifact
  capturedAt: string;                  // ISO datetime
  capturedByUserId: string;
  description: string | null;
  artifactRef: IRelatedItemRef | null; // for LinkedArtifact type — ref to Related Items graph
  // File storage is platform-managed; evidence records reference storage handles
  storageHandle: string | null;        // platform file storage reference
}
```

### 4.7 SubcontractorAcknowledgment

```typescript
interface ISubcontractorAcknowledgment {
  acknowledgmentId: string;            // UUID
  assignmentId: string;                // FK → WarrantyCaseAssignment
  caseId: string;                      // FK → WarrantyCase
  status: AcknowledgmentStatus;        // Pending | Acknowledged | ScopeAccepted | ScopeDisputed
  acknowledgedAt: string | null;       // ISO datetime
  scopePosition: SubcontractorScopePosition | null; // Accepted | Disputed | PartialAccepted
  disputeRationale: string | null;     // required when ScopeDisputed
  pmDisputeResponse: string | null;    // PM's position on the dispute
  disputeOutcome: DisputeOutcome | null; // resolved by PM/PX
  // Layer 2 seam: in Phase 3, all entries are PM-entered on behalf of subcontractor
  enteredBy: AcknowledgmentEnteredBy;  // PmOnBehalf | DirectSubcontractor (Layer 2)
  enteredByUserId: string;
  enteredAt: string;
}
```

### 4.8 OwnerIntakeLog

```typescript
interface IOwnerIntakeLog {
  intakeLogId: string;                 // UUID
  projectId: string;                   // FK → project registry
  reportedByOwner: string;             // owner name / organization (free text in Phase 3)
  reportedAt: string;                  // ISO datetime when PM logged the report
  issueDescription: string;            // owner's description (PM-transcribed)
  location: string | null;             // where the owner reports the issue
  reportChannel: OwnerReportChannel;   // Phone | Email | SiteVisit | Written (Phase 3)
  linkedCaseIds: string[];             // FKs → WarrantyCase
  status: OwnerIntakeStatus;           // Logged | Linked | Unresolvable
  unresolvableReason: string | null;   // required if Unresolvable
  loggedByUserId: string;
  loggedAt: string;
  // Layer 2 seam: sourceChannel distinguishes PM entry from future owner-direct
  sourceChannel: WarrantyCaseSourceChannel; // PmEntered | OwnerPortal (Layer 2)
}
```

### 4.9 WarrantyCaseResolutionRecord

```typescript
interface IWarrantyCaseResolutionRecord {
  resolutionRecordId: string;          // UUID
  caseId: string;                      // FK → WarrantyCase
  outcome: ResolutionOutcome;          // Corrected | CorrectedUnderProtest | PmAccepted | BackCharged | Unresolved
  resolvedAt: string;                  // ISO datetime
  resolvedByUserId: string;            // PM or Warranty Manager who confirmed
  resolutionDescription: string;       // what was done / why it is resolved
  isBackChargeAdvisory: boolean;       // whether Financial advisory has been published
  backChargeAdvisoryNotes: string | null;
  subcontractorPerformanceNote: string | null; // optional note for Closeout scorecard context
  evidenceIds: string[];               // FKs → WarrantyCaseEvidence captured at verification
  // IMMUTABLE from creation — correction requires void + new case
}
```

---

## 5. Enum Definitions

```typescript
enum WarrantyCoverageLayer {
  Product = 'Product',          // Manufacturer warranty on equipment / materials
  Labor = 'Labor',              // Subcontractor warranty on installed workmanship
  System = 'System',            // Integrated system warranty spanning scopes
}

enum WarrantyCoverageStatus {
  Draft = 'Draft',              // Registered but metadata incomplete
  Active = 'Active',            // Full coverage in effect
  Expired = 'Expired',          // Coverage window closed (system-set)
  Voided = 'Voided',            // PM/PX explicit void
}

enum WarrantyCoverageSource {
  CloseoutTurnover = 'CloseoutTurnover',  // Sourced from Closeout turnover package
  StartupTurnover = 'StartupTurnover',    // Sourced from Startup commissioning record
  Manual = 'Manual',                      // PM-entered; no external source record
}

enum WarrantyCaseStatus {
  Open = 'Open',                              // Logged; coverage not yet evaluated
  PendingCoverageDecision = 'PendingCoverageDecision', // Coverage evaluation in progress
  NotCovered = 'NotCovered',                  // Terminal: issue outside warranty scope
  Denied = 'Denied',                          // Terminal: not a warranty claim (e.g., owner damage)
  Duplicate = 'Duplicate',                    // Terminal: linked to canonical open case
  Assigned = 'Assigned',                      // Coverage confirmed; responsible party identified
  AwaitingSubcontractor = 'AwaitingSubcontractor', // Ack sent; no sub response yet
  AwaitingOwner = 'AwaitingOwner',            // Waiting on owner access / info / decision
  Scheduled = 'Scheduled',                    // Site visit or repair visit scheduled
  InProgress = 'InProgress',                  // Repair / correction work underway
  Corrected = 'Corrected',                    // Sub declares work complete; PM verification pending
  PendingVerification = 'PendingVerification', // PM verification visit scheduled or in-progress
  Verified = 'Verified',                      // PM confirmed correction satisfactory
  Closed = 'Closed',                          // Immutable resolution record created
  Reopened = 'Reopened',                      // PX re-opened after Closed (defect recurrence)
  Voided = 'Voided',                          // PM/PX void — opened in error
}

enum WarrantySlaStatus {
  WithinSla = 'WithinSla',
  Approaching = 'Approaching',  // Within threshold window before deadline
  Overdue = 'Overdue',          // Deadline passed; no resolution at required stage
  NotApplicable = 'NotApplicable', // Terminal or pre-assignment states
}

enum AcknowledgmentStatus {
  Pending = 'Pending',
  Acknowledged = 'Acknowledged',
  ScopeAccepted = 'ScopeAccepted',
  ScopeDisputed = 'ScopeDisputed',
}

enum SubcontractorScopePosition {
  Accepted = 'Accepted',
  Disputed = 'Disputed',
  PartialAccepted = 'PartialAccepted',
}

enum DisputeOutcome {
  UpheldSubcontractorNotResponsible = 'UpheldSubcontractorNotResponsible',
  RejectedSubcontractorRemains = 'RejectedSubcontractorRemains',
  Reassigned = 'Reassigned',
  EscalatedToPX = 'EscalatedToPX',
}

enum CoverageDecisionOutcome {
  Covered = 'Covered',
  NotCovered = 'NotCovered',
  Denied = 'Denied',
}

enum CoverageDecisionStatus {
  Active = 'Active',
  Superseded = 'Superseded',
}

enum AssignmentType {
  Subcontractor = 'Subcontractor',
  Manufacturer = 'Manufacturer',
  GC = 'GC',             // GC self-performs corrective work
  Internal = 'Internal', // PM resolves internally (no external sub)
}

enum AssignmentStatus {
  Active = 'Active',
  Superseded = 'Superseded',
  Released = 'Released',       // Sub completed; released from case
}

enum WarrantyVisitType {
  Diagnosis = 'Diagnosis',     // PM or sub assesses the issue
  Repair = 'Repair',           // Corrective work performed
  Verification = 'Verification', // PM confirms correction
  Reinspection = 'Reinspection', // Follow-up after failed verification
}

enum WarrantyVisitStatus {
  Scheduled = 'Scheduled',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  NoShow = 'NoShow',
}

enum WarrantyEvidenceType {
  Photo = 'Photo',
  Video = 'Video',
  InspectionNote = 'InspectionNote',
  Document = 'Document',
  LinkedArtifact = 'LinkedArtifact', // references Related Items graph
}

enum ResolutionOutcome {
  Corrected = 'Corrected',               // Sub corrected; PM verified; satisfactory
  CorrectedUnderProtest = 'CorrectedUnderProtest', // Sub completed but disputes responsibility
  PmAccepted = 'PmAccepted',             // PM accepted resolution without full verification
  BackCharged = 'BackCharged',           // Case resulted in back-charge advisory to Financial
  Unresolved = 'Unresolved',             // Case closed by age-out / PX decision; not corrected
}

enum OwnerReportChannel {
  Phone = 'Phone',
  Email = 'Email',
  SiteVisit = 'SiteVisit',
  Written = 'Written',
}

enum OwnerIntakeStatus {
  Logged = 'Logged',
  Linked = 'Linked',         // Successfully linked to one or more cases
  Unresolvable = 'Unresolvable', // No applicable coverage; PM documented rationale
}

enum WarrantyCaseSourceChannel {
  PmEntered = 'PmEntered',       // Phase 3 — all cases are PM-entered
  OwnerPortal = 'OwnerPortal',   // Layer 2 — future owner direct submission
}

enum AcknowledgmentEnteredBy {
  PmOnBehalf = 'PmOnBehalf',           // PM enters acknowledgment after communication with sub
  DirectSubcontractor = 'DirectSubcontractor', // Layer 2 — sub enters directly
}

enum WarrantyIssueType {
  Defect = 'Defect',
  Damage = 'Damage',
  Incomplete = 'Incomplete',
  Failure = 'Failure',
  Other = 'Other',
}
```

---

## 6. Authority Model

### 6.1 Role definitions

| Role code | Who they are | Scope |
|---|---|---|
| `PM` | Project Manager | Project-scoped; full operational authority on warranty |
| `PX` | Project Executive | Project and portfolio-scoped; override authority |
| `WARRANTY_MANAGER` | Warranty Manager (delegated role) | Delegated PM authority on warranty operations |
| `APM_PA` | Assistant PM / Project Administrator | Create and view cases; add evidence; enter intake logs |
| `PER` | Portfolio Executive Reviewer | Read-only health summary |
| `FINANCIAL_READER` | Financial module consumer | Read back-charge advisory fields only |
| `EXT_SUBCONTRACTOR` | External subcontractor (Layer 2 future) | Direct acknowledgment and evidence via seam |
| `EXT_OWNER` | External owner (Layer 2 future) | Direct intake submission via seam |

### 6.2 Write authority matrix

| Action | PM | WARRANTY_MANAGER | APM_PA | PX | Notes |
|---|---|---|---|---|---|
| Register coverage item (Draft) | ✓ | ✓ | — | ✓ | |
| Promote coverage item to Active | ✓ | ✓ | — | ✓ | Requires metadata complete |
| Void coverage item | ✓ | ✓ | — | ✓ | Requires rationale |
| Create warranty case | ✓ | ✓ | ✓ | ✓ | |
| Make coverage decision | ✓ | ✓ | — | ✓ | PM or WARRANTY_MANAGER only |
| Assign case to responsible party | ✓ | ✓ | — | ✓ | |
| Reassign case | ✓ | ✓ | — | ✓ | |
| Enter subcontractor acknowledgment | ✓ | ✓ | — | ✓ | PM on behalf of sub in Phase 3 |
| Schedule visit | ✓ | ✓ | ✓ | ✓ | |
| Add evidence | ✓ | ✓ | ✓ | ✓ | |
| Declare Corrected (sub declaration) | ✓ | ✓ | — | ✓ | PM enters on sub's behalf |
| Perform PM verification | ✓ | ✓ | — | ✓ | Verification gate is PM/WARRANTY_MANAGER |
| Create resolution record | ✓ | ✓ | — | ✓ | Immutable on creation |
| Flag back-charge advisory | ✓ | ✓ | — | ✓ | |
| Void a case | ✓ | ✓ | — | ✓ | Requires rationale |
| Re-open a Closed case | — | — | — | ✓ | PX only; requires reason |
| Enter owner intake log | ✓ | ✓ | ✓ | ✓ | |
| Extend SLA deadline | — | — | — | ✓ | PX only; requires reason |

### 6.3 Read authority matrix

| Data | PM | WARRANTY_MANAGER | APM_PA | PER | FINANCIAL_READER |
|---|---|---|---|---|---|
| Coverage registry | Full | Full | Full | Summary only | Advisory fields only |
| Case list and status | Full | Full | Full | Health summary | Advisory fields only |
| Coverage decisions | Full | Full | View | — | — |
| Assignment and routing history | Full | Full | View | — | — |
| Subcontractor acknowledgments | Full | Full | View | — | — |
| Evidence | Full | Full | Full | — | — |
| Resolution records | Full | Full | View | Health summary | Advisory fields |
| Back-charge advisory | Full | Full | — | — | Full |

### 6.4 Locked authority decisions

1. Coverage decisions (`WarrantyCoverageDecision`) require PM or WARRANTY_MANAGER authority. APM/PA may not make coverage determinations.
2. Re-opening a `Closed` case requires PX authority. PMs may not re-open closed cases unilaterally.
3. `WarrantyCaseResolutionRecord` is immutable after creation. A closed case requiring material correction must be voided and a new case opened — resolution records are never edited.
4. SLA deadline extension requires PX authority and a documented reason. SLA extension is an exceptional action, not a routine project management tool.
5. `WarrantyCoverageDecision` revisions are always additive (supersede, not mutate): the old decision is archived, the new one is created. Full decision history is preserved.

---

## 7. Shared Package Consumption

The following shared packages govern implementation of the Warranty module's infrastructure concerns. No local substitutes are permitted.

| Package | Phase 3 plan | Warranty use |
|---|---|---|
| `@hbc/record-form` (SF23) | P3-E14 Stage 3 | Coverage item registration; case create/edit lifecycle; evidence entry |
| `@hbc/saved-views` (SF26) | P3-E14 Stage 3 | Coverage registry and case workspace view persistence |
| `@hbc/activity-timeline` (SF28) | P3-E14 Stage 3 | Case lifecycle event stream emission |
| `@hbc/publish-workflow` (SF25) | P3-E14 Stage 3 | Coverage decision publication; resolution record governed release |
| `@hbc/bulk-actions` (SF27) | P3-E14 Stage 4 | Bulk case operations (assign, close, void) |
| `@hbc/acknowledgment` | ADR-pending | `SubcontractorAcknowledgment` pattern; PM-on-behalf and future direct |
| `@hbc/notification-intelligence` | P3-D3 §5 | SLA reminder emission; escalation alert routing |
| `@hbc/related-items` (P3-D4) | P3-D4 | Coverage item ↔ case ↔ evidence ↔ Closeout artifact linking |
| `@hbc/auth` (P3-A2) | P3-A2 | Role-based access, authority resolution, warranty role definitions |
| `@hbc/field-annotations` | P3-E2 §3.4 | PER read-only annotation layer on case workspace — **PROVISIONAL** |

### 7.1 Notes on `@hbc/acknowledgment`

The acknowledgment pattern from `@hbc/acknowledgment` (confirmed present in P3-E8 worker orientation context) applies to `SubcontractorAcknowledgment`. The key design consideration: Phase 3 uses `PmOnBehalf` entry. The package must support both on-behalf entry and future direct external-party entry without a schema change — the `enteredBy` discriminator on `ISubcontractorAcknowledgment` is the seam.

### 7.2 Notes on `@hbc/field-annotations`

Whether PER annotation scope applies to the Warranty case workspace is **provisional**. The Safety module (P3-E8) explicitly excluded annotation affordance. The default for review-capable surfaces is to include PER annotation per P3-E2 §3.4. A concrete decision on whether Warranty surfaces are annotation-capable should be made during T07 authoring. The field design (T02 interfaces) does not block either outcome.

---

## 8. Provisional Implementation Notes

The following items are implementation guidance rather than locked decisions. They may be revised during sprint-level design.

- **Evidence file storage:** The `storageHandle` field on `IWarrantyCaseEvidence` is a platform-managed reference. Implementation should use the same storage abstraction used by Safety module evidence records (P3-E8) rather than defining a new storage layer.
- **Owner contact capture:** In Phase 3, `OwnerIntakeLog.reportedByOwner` is free text. For Layer 2 readiness, a future migration may normalize this to a governed owner contact record. The free-text field is acceptable for Phase 3 and does not block Layer 2 design.
- **Visit attendee model:** `WarrantyVisit.attendees` in Phase 3 captures PM-entered attendee names. When Layer 2 adds owner and sub direct participation, attendees will reference governed external party identities. The attendee array is designed as a discriminated union to support this extension.
- **Coverage scope taxonomy:** The `coverageScope` string field on `IWarrantyCoverageItem` is governed by the taxonomy defined in T03 §2. It is a human-readable label with a constrained taxonomy in T03, not a free-form string. Implementation should use the T03 taxonomy as the source for UI picker values.

---

*← [T01](P3-E14-T01-Module-Scope-Operating-Model-and-Source-of-Truth-Boundaries.md) | [Master Index](P3-E14-Project-Warranty-Module-Field-Specification.md) | [T03 →](P3-E14-T03-Coverage-Registry-and-Turnover-Startup-Handoffs.md)*
