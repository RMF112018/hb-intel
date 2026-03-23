# P3-E7-T02 — Record Architecture and Identity Model

**Doc ID:** P3-E7-T02
**Parent:** P3-E7 Permits Module
**Phase:** 3
**Workstream:** E — Data Models and Field Specifications
**Part:** 2 of 8
**Owner:** Architecture
**Last Updated:** 2026-03-23

---

## 1. First-Class Record Families

The Permits module owns seven first-class record types. Each is independently addressable, auditable, and carries its own identity and provenance.

| # | Record Type | Description | Thread Participant |
|---|---|---|---|
| 1 | `PermitApplication` | Pre-issuance record capturing submission, tracking, and jurisdiction response | No |
| 2 | `IssuedPermit` | Post-approval record: the operative permit owned by the project | Yes |
| 3 | `RequiredInspectionCheckpoint` | Jurisdiction-mandated inspection milestone (governed template library) | No |
| 4 | `InspectionVisit` | Actual inspection visit logged by project team or inspector | No |
| 5 | `InspectionDeficiency` | Finding from an inspection visit requiring resolution | No |
| 6 | `PermitLifecycleAction` | Immutable record of every governed state change to an IssuedPermit | No |
| 7 | `PermitEvidenceRecord` | Document, photo, certificate, or scan attached to a permit or inspection | No |

---

## 2. PermitApplication

### 2.1 Purpose

Captures the pre-issuance phase: application preparation, submission to jurisdiction, and jurisdiction response. Creates a lineage record that `IssuedPermit` references.

### 2.2 Interface

```typescript
interface IPermitApplication {
  // Identity
  applicationId: string;              // UUID; immutable
  projectId: string;                  // FK to project; immutable
  permitType: PermitType;             // Enum (12 values); immutable after creation

  // Submission
  jurisdictionName: string;           // Issuing authority name
  jurisdictionContact: IJurisdictionContact;
  applicationDate: string;            // ISO 8601 date; immutable
  submittedById: string;              // User ID who submitted
  submittedByName: string;            // Display name at submission time

  // Application State
  applicationStatus: PermitApplicationStatus;
  submissionMethod: SubmissionMethod; // ONLINE | IN_PERSON | MAIL | PORTAL
  trackingNumber?: string;            // Jurisdiction-assigned tracking number
  estimatedResponseDate?: string;     // ISO 8601 date; jurisdiction estimate

  // Financials
  applicationFeeAmount: number;       // USD; ≥ 0
  bondAmountRequired: number;         // USD; ≥ 0
  feesPaid: boolean;

  // Resolution
  jurisdictionResponseDate?: string;  // ISO 8601 date when jurisdiction responded
  rejectionReason?: string;           // If applicationStatus = REJECTED
  issuedPermitId?: string;            // FK to IssuedPermit if approved; set on approval

  // Provenance
  createdAt: string;                  // ISO 8601 datetime; immutable
  updatedAt: string;                  // Auto-updated on change
  createdByUserId: string;
}
```

### 2.3 PermitApplicationStatus

```typescript
type PermitApplicationStatus =
  | 'DRAFT'              // Being prepared; not yet submitted
  | 'SUBMITTED'          // Submitted to jurisdiction; awaiting response
  | 'UNDER_REVIEW'       // Jurisdiction is reviewing
  | 'ADDITIONAL_INFO_REQUIRED' // Jurisdiction requested more information
  | 'APPROVED'           // Jurisdiction approved; IssuedPermit created
  | 'REJECTED'           // Jurisdiction denied; rejectionReason required
  | 'WITHDRAWN';         // Applicant withdrew application
```

---

## 3. IssuedPermit

### 3.1 Purpose

The operative permit record post-approval. Owns the permit lifecycle from issuance through closeout. All compliance health, work queue items, and spine events reference `issuedPermitId`.

### 3.2 Interface

```typescript
interface IIssuedPermit {
  // Identity
  issuedPermitId: string;             // UUID; immutable
  projectId: string;                  // FK to project; immutable
  applicationId?: string;             // FK to PermitApplication if originated from one
  permitNumber: string;               // Jurisdiction-assigned permit number; immutable
  permitType: PermitType;             // 12-value enum; immutable after issuance

  // Thread Model
  threadRootPermitId: string | null;  // null if this is the thread root
  parentPermitId: string | null;      // immediate parent; null if root or standalone
  threadRelationshipType: PermitThreadRelationship;

  // Jurisdiction
  jurisdictionName: string;
  jurisdictionContact: IJurisdictionContact;

  // Dates
  applicationDate: string;            // ISO 8601 date; immutable
  issuanceDate: string;               // ISO 8601 date; immutable after set
  expirationDate: string;             // ISO 8601 datetime ending 23:59:59Z
  renewalDate?: string;               // ISO 8601 datetime starting 00:00:00Z; set on renewal
  closedDate?: string;                // ISO 8601 date; set on CLOSED lifecycle action

  // Status — READ ONLY; mutated only via PermitLifecycleAction
  currentStatus: IssuedPermitStatus;
  currentStatusSetAt: string;         // ISO 8601 datetime of last status change
  currentStatusSetByActionId: string; // FK to PermitLifecycleAction that set this status

  // Financials
  permitFeeAmount: number;            // USD; ≥ 0
  bondAmount: number;                 // USD; ≥ 0

  // Description
  description: string;                // Human-readable permit scope
  conditions: string[];               // Jurisdiction-imposed conditions
  tags: string[];                     // User-defined tags

  // Responsibility Envelope
  accountableRole: PermitAccountableRole;
  currentResponsiblePartyId: string;
  currentResponsiblePartyType: PartyType;
  nextActionOwnerId?: string;
  watcherPartyIds: string[];
  escalationOwnerId?: string;
  blockedByPartyId?: string;

  // Derived (calculated; not persisted)
  daysToExpiration: number;           // May be negative if expired
  expirationRiskTier: ExpirationRiskTier;
  derivedHealthTier: PermitHealthTier;

  // Provenance
  createdAt: string;                  // ISO 8601 datetime; immutable
  updatedAt: string;
  createdByUserId: string;
}
```

### 3.3 IssuedPermitStatus

```typescript
type IssuedPermitStatus =
  | 'ACTIVE'             // Permit is valid and in force
  | 'ACTIVE_EXPIRING'    // Active but within 30-day expiration window (derived state)
  | 'UNDER_INSPECTION'   // Active; inspection visit in progress
  | 'SUSPENDED'          // Temporarily suspended by jurisdiction
  | 'STOP_WORK'          // Stop-work order issued
  | 'VIOLATION_ISSUED'   // Violation notice against this permit
  | 'RENEWAL_IN_PROGRESS'// Renewal application submitted
  | 'RENEWED'            // Successfully renewed; new expirationDate set
  | 'EXPIRED'            // expirationDate passed without renewal
  | 'CLOSED'             // All required inspections complete; permit closed
  | 'REVOKED'            // Jurisdiction revoked permit
  | 'REJECTED';          // Permit application rejected (terminal pre-issuance state)
```

### 3.4 Responsibility Envelope Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `accountableRole` | `PermitAccountableRole` | Yes | Structural role (PROJECT_MANAGER, SITE_SUPERVISOR, GC_REP) |
| `currentResponsiblePartyId` | `string` | Yes | User or org ID currently responsible |
| `currentResponsiblePartyType` | `PartyType` | Yes | USER \| ORGANIZATION \| SUBCONTRACTOR |
| `nextActionOwnerId` | `string` | No | Who needs to act next; set by bic-next-move |
| `watcherPartyIds` | `string[]` | Yes | Zero or more watchers; empty array allowed |
| `escalationOwnerId` | `string` | No | Who receives escalation if overdue |
| `blockedByPartyId` | `string` | No | Set when waiting on a specific party |

---

## 4. RequiredInspectionCheckpoint

### 4.1 Purpose

Represents a jurisdiction-mandated inspection milestone that must be completed for a permit to reach closeout. Governed by a per-permit-type template library (see T04 §1 for template details).

### 4.2 Interface

```typescript
interface IRequiredInspectionCheckpoint {
  // Identity
  checkpointId: string;               // UUID; immutable
  projectId: string;                  // FK to project; immutable
  issuedPermitId: string;             // FK to IssuedPermit; immutable
  templateCheckpointId?: string;      // FK to template library entry if originated from template

  // Checkpoint Definition
  checkpointName: string;             // From template (e.g., "Building Footer & ISO pads")
  codeReference?: string;             // Applicable code reference
  sequence: number;                   // Display order within permit; integer ≥ 1

  // Tracking
  status: CheckpointStatus;
  dateCalledIn?: string;              // ISO 8601 date when inspection was requested
  scheduledDate?: string;             // ISO 8601 date of scheduled visit
  verifiedOnline: boolean;            // Confirmed via jurisdiction online portal

  // Outcome (set from most recent InspectionVisit result for this checkpoint)
  currentResult: RequiredInspectionResult;
  linkedInspectionVisitIds: string[]; // All InspectionVisit IDs tied to this checkpoint
  lastVisitId?: string;               // Most recent InspectionVisit ID

  // Blocking
  isBlockingCloseout: boolean;        // True if this checkpoint is required for permit closeout
  blockedByCheckpointIds: string[];   // Predecessor checkpoints that must pass first

  // Provenance
  createdAt: string;
  updatedAt: string;
  importedFromTemplateAt?: string;    // If batch-imported from xlsx template
}
```

### 4.3 CheckpointStatus

```typescript
type CheckpointStatus =
  | 'NOT_SCHEDULED'      // Not yet called in or scheduled
  | 'CALLED_IN'          // Called in to jurisdiction; awaiting date
  | 'SCHEDULED'          // Date set; inspection upcoming
  | 'IN_PROGRESS'        // Inspector on-site
  | 'PASSED'             // Most recent visit result = PASS
  | 'FAILED'             // Most recent visit result = FAIL; re-inspection needed
  | 'WAIVED'             // Jurisdiction waived this checkpoint
  | 'NOT_APPLICABLE';    // Does not apply to this specific permit instance
```

---

## 5. InspectionVisit

### 5.1 Purpose

Records an actual inspection event: who inspected, what was the result, what deficiencies were found. Replaces the prior nested `IInspection[]` with a first-class record.

### 5.2 Interface

```typescript
interface IInspectionVisit {
  // Identity
  visitId: string;                    // UUID; immutable
  projectId: string;                  // FK to project; immutable
  issuedPermitId: string;             // FK to IssuedPermit; immutable
  linkedCheckpointId?: string;        // FK to RequiredInspectionCheckpoint if applicable

  // Inspector
  inspectorName: string;
  inspectorContact: IInspectorContact;
  inspectorOrganization?: string;     // Jurisdiction or third-party firm name

  // Schedule
  scheduledDate: string;              // ISO 8601 datetime
  completedDate?: string;             // ISO 8601 datetime; null until completed
  durationMinutes?: number;           // Integer ≥ 0

  // Result
  result: InspectionVisitResult;
  followUpRequired: boolean;          // True if re-inspection required
  followUpDueDate?: string;           // ISO 8601 date; required when followUpRequired = true

  // Responsibility Envelope
  currentResponsiblePartyId: string;
  currentResponsiblePartyType: PartyType;
  nextActionOwnerId?: string;
  escalationOwnerId?: string;

  // Notes
  inspectorNotes: string;             // Inspector findings; free-text
  internalNotes?: string;             // Project team notes; not shared externally

  // Provenance
  createdAt: string;                  // Immutable
  updatedAt: string;
  createdByUserId: string;
  resultRecordedByUserId?: string;    // Who entered the result (may differ from creator)
}
```

### 5.3 InspectionVisitResult

```typescript
type InspectionVisitResult =
  | 'PASSED'
  | 'PASSED_WITH_CONDITIONS'   // Passed but with noted conditions
  | 'FAILED'
  | 'PARTIAL_PASS'             // Some items passed; others require re-inspection
  | 'RESCHEDULED'              // Visit occurred but inspection was rescheduled
  | 'CANCELLED'                // Inspection cancelled before occurring
  | 'PENDING';                 // Scheduled but not yet occurred
```

---

## 6. InspectionDeficiency

### 6.1 Purpose

First-class record for each non-compliance finding from an inspection visit. Replaces the prior nested `IInspectionIssue[]`. Each deficiency has identity, assignment, resolution workflow, and audit trail.

### 6.2 Interface

```typescript
interface IInspectionDeficiency {
  // Identity
  deficiencyId: string;               // UUID; immutable
  projectId: string;                  // FK to project; immutable
  issuedPermitId: string;             // FK to IssuedPermit; immutable
  visitId: string;                    // FK to InspectionVisit; immutable

  // Deficiency Definition
  description: string;                // What was non-compliant; required
  severity: DeficiencySeverity;       // HIGH | MEDIUM | LOW
  codeReference?: string;             // Code section cited by inspector
  correctiveActionRequired: string;   // What must be done to resolve

  // Resolution
  resolutionStatus: DeficiencyResolutionStatus;
  assignedToPartyId?: string;
  assignedToPartyType?: PartyType;
  dueDate?: string;                   // ISO 8601 date
  resolvedDate?: string;              // ISO 8601 datetime when marked resolved
  resolutionNotes?: string;           // Required when resolutionStatus = RESOLVED
  resolvedByUserId?: string;

  // Re-inspection
  requiresReinspection: boolean;
  reinspectionVisitId?: string;       // FK to follow-up InspectionVisit

  // Provenance
  createdAt: string;                  // Immutable
  updatedAt: string;
  createdByUserId: string;
}
```

### 6.3 DeficiencySeverity

```typescript
type DeficiencySeverity =
  | 'HIGH'     // Safety-critical; requires immediate action; blocks work
  | 'MEDIUM'   // Significant non-compliance; must be resolved before next phase
  | 'LOW';     // Minor finding; must be resolved before closeout
```

### 6.4 DeficiencyResolutionStatus

```typescript
type DeficiencyResolutionStatus =
  | 'OPEN'                // Newly identified; not yet addressed
  | 'ACKNOWLEDGED'        // Responsible party acknowledged; plan in progress
  | 'REMEDIATION_IN_PROGRESS' // Active work underway
  | 'RESOLVED'            // Deficiency corrected; resolutionNotes required
  | 'VERIFIED_RESOLVED'   // Resolution confirmed by inspector at re-inspection
  | 'DISPUTED'            // Party disputes deficiency finding
  | 'WAIVED';             // Inspector or jurisdiction waived this deficiency
```

---

## 7. PermitLifecycleAction

### 7.1 Purpose

An immutable event record for every governed state change on an `IssuedPermit`. Replaces direct status-field mutation. The sequence of `PermitLifecycleAction` records is the complete, tamper-proof lifecycle history of a permit.

### 7.2 Interface

```typescript
interface IPermitLifecycleAction {
  // Identity
  actionId: string;                   // UUID; immutable
  projectId: string;                  // FK to project; immutable
  issuedPermitId: string;             // FK to IssuedPermit; immutable

  // Action
  actionType: PermitLifecycleActionType;
  actionDate: string;                 // ISO 8601 datetime; immutable
  effectiveDate?: string;             // When the action takes effect (may differ from actionDate)

  // State Change
  previousStatus: IssuedPermitStatus;
  newStatus: IssuedPermitStatus;

  // Actor
  performedByUserId: string;
  performedByName: string;
  performedByRole: string;

  // Context
  notes?: string;                     // Required for certain action types (see §7.3)
  evidenceRecordIds: string[];        // Supporting PermitEvidenceRecord IDs
  jurisdictionReferenceNumber?: string; // External reference from jurisdiction

  // Acknowledgment
  requiresAcknowledgment: boolean;
  acknowledgedAt?: string;
  acknowledgedByUserId?: string;

  // Provenance
  createdAt: string;                  // Immutable; set on record creation
}
```

### 7.3 PermitLifecycleActionType

```typescript
type PermitLifecycleActionType =
  | 'ISSUED'              // Permit issued by jurisdiction
  | 'ACTIVATED'           // Permit activated for construction use
  | 'INSPECTION_PASSED'   // Required inspection checkpoint passed
  | 'INSPECTION_FAILED'   // Required inspection checkpoint failed
  | 'DEFICIENCY_OPENED'   // New deficiency logged
  | 'DEFICIENCY_RESOLVED' // Deficiency resolved
  | 'STOP_WORK_ISSUED'    // Stop-work order received from jurisdiction
  | 'STOP_WORK_LIFTED'    // Stop-work order lifted
  | 'VIOLATION_ISSUED'    // Violation notice received
  | 'VIOLATION_RESOLVED'  // Violation resolved with jurisdiction
  | 'SUSPENSION_ISSUED'   // Permit suspended
  | 'SUSPENSION_LIFTED'   // Suspension lifted
  | 'RENEWAL_INITIATED'   // Renewal application submitted
  | 'RENEWAL_APPROVED'    // Jurisdiction approved renewal
  | 'RENEWAL_DENIED'      // Jurisdiction denied renewal
  | 'EXPIRATION_WARNING'  // System-generated 30-day expiration warning
  | 'EXPIRED'             // Permit expired (system or manual)
  | 'REVOKED'             // Jurisdiction revoked permit
  | 'CLOSED'              // All inspections complete; permit closed out
  | 'CORRECTION_ISSUED';  // Permit correction or amendment issued
```

---

## 8. PermitEvidenceRecord

### 8.1 Purpose

Stores references to documents, photos, certificates, and scans associated with a permit or specific inspection. Does not duplicate document storage — holds metadata and references only.

### 8.2 Interface

```typescript
interface IPermitEvidenceRecord {
  // Identity
  evidenceId: string;                 // UUID; immutable
  projectId: string;                  // FK to project; immutable
  issuedPermitId: string;             // FK to IssuedPermit; immutable
  linkedVisitId?: string;             // FK to InspectionVisit if evidence is visit-specific
  linkedActionId?: string;            // FK to PermitLifecycleAction if evidence supports an action

  // Evidence Definition
  evidenceType: PermitEvidenceType;
  title: string;
  description?: string;

  // Storage Reference
  storageUri: string;                 // URI to document management system or blob storage
  fileName: string;
  fileSizeBytes?: number;
  mimeType?: string;

  // Provenance
  uploadedAt: string;                 // ISO 8601 datetime; immutable
  uploadedByUserId: string;
  uploadedByName: string;
}
```

### 8.3 PermitEvidenceType

```typescript
type PermitEvidenceType =
  | 'PERMIT_DOCUMENT'         // Official permit document from jurisdiction
  | 'APPROVED_PLANS'          // Stamped/approved construction plans
  | 'INSPECTION_REPORT'       // Formal inspection report
  | 'CERTIFICATE_OF_OCCUPANCY'// CO or TCO
  | 'VIOLATION_NOTICE'        // Issued violation document
  | 'STOP_WORK_ORDER'         // Issued stop-work order document
  | 'RENEWAL_APPLICATION'     // Renewal application document
  | 'PHOTO_EVIDENCE'          // Site photo supporting inspection
  | 'CORRESPONDENCE'          // Written correspondence with jurisdiction
  | 'OTHER';                  // Catch-all; description required
```

---

## 9. Supporting Types

### 9.1 IJurisdictionContact

```typescript
interface IJurisdictionContact {
  contactName: string;            // Required
  title?: string;
  phone?: string;                 // "(555) 123-4567" format
  email?: string;
  address?: string;
  officeHours?: string;
  portalUrl?: string;             // Jurisdiction online portal URL
}
```

### 9.2 IInspectorContact

```typescript
interface IInspectorContact {
  phone?: string;
  email?: string;
  badgeNumber?: string;           // Credential number (e.g., "INS-001")
}
```

### 9.3 PermitType

```typescript
type PermitType =
  | 'DEMOLITION'
  | 'ELECTRICAL'
  | 'ELEVATOR'
  | 'FIRE_ALARM'
  | 'FIRE_SPRINKLER'
  | 'MASS_GRADING'
  | 'MASTER_BUILDING'
  | 'MECHANICAL'
  | 'PLUMBING'
  | 'POOL_BARRICADE'
  | 'ROOFING'
  | 'SITE_DEVELOPMENT';
```

### 9.4 ExpirationRiskTier

```typescript
type ExpirationRiskTier =
  | 'CRITICAL'    // expirationDate < today (already expired)
  | 'HIGH'        // 0 < daysToExpiration ≤ 30
  | 'MEDIUM'      // 30 < daysToExpiration ≤ 90
  | 'LOW';        // daysToExpiration > 90
```

### 9.5 PermitHealthTier

```typescript
type PermitHealthTier =
  | 'CRITICAL'    // Expired | REVOKED | STOP_WORK | open HIGH deficiency | blocking checkpoint FAIL
  | 'AT_RISK'     // ExpirationRiskTier = HIGH | VIOLATION_ISSUED | SUSPENDED | open MEDIUM deficiency
  | 'NORMAL'      // Active; no significant risk signals
  | 'CLOSED';     // Permit successfully closed out
```

### 9.6 PermitAccountableRole

```typescript
type PermitAccountableRole =
  | 'PROJECT_MANAGER'
  | 'SITE_SUPERVISOR'
  | 'GC_REPRESENTATIVE'
  | 'OWNER_REPRESENTATIVE'
  | 'PERMIT_EXPEDITER';
```

### 9.7 RequiredInspectionResult

```typescript
type RequiredInspectionResult =
  | 'PASS'
  | 'FAIL'
  | 'NOT_APPLICABLE'
  | 'PENDING';
```

### 9.8 SubmissionMethod

```typescript
type SubmissionMethod =
  | 'ONLINE'
  | 'IN_PERSON'
  | 'MAIL'
  | 'PORTAL';
```

### 9.9 PartyType

```typescript
type PartyType =
  | 'USER'
  | 'ORGANIZATION'
  | 'SUBCONTRACTOR'
  | 'JURISDICTION';
```

---

## 10. Field Index (All Record Types)

| Field | Record Type | Type | Immutable | Calculated | Required |
|---|---|---|---|---|---|
| `accountableRole` | `IIssuedPermit` | `PermitAccountableRole` | No | No | Yes |
| `actionDate` | `IPermitLifecycleAction` | `string` | Yes | No | Yes |
| `actionId` | `IPermitLifecycleAction` | `string` | Yes | No | Yes |
| `actionType` | `IPermitLifecycleAction` | `PermitLifecycleActionType` | Yes | No | Yes |
| `applicationDate` | `IIssuedPermit` | `string` | Yes | No | Yes |
| `applicationId` | `IIssuedPermit` | `string?` | Yes | No | No |
| `applicationId` | `IPermitApplication` | `string` | Yes | No | Yes |
| `applicationStatus` | `IPermitApplication` | `PermitApplicationStatus` | No | No | Yes |
| `assignedToPartyId` | `IInspectionDeficiency` | `string?` | No | No | No |
| `blockedByPartyId` | `IIssuedPermit` | `string?` | No | No | No |
| `checkpointId` | `IRequiredInspectionCheckpoint` | `string` | Yes | No | Yes |
| `checkpointName` | `IRequiredInspectionCheckpoint` | `string` | No | No | Yes |
| `closedDate` | `IIssuedPermit` | `string?` | No | No | No |
| `codeReference` | `IRequiredInspectionCheckpoint` | `string?` | No | No | No |
| `codeReference` | `IInspectionDeficiency` | `string?` | No | No | No |
| `completedDate` | `IInspectionVisit` | `string?` | No | No | No |
| `conditions` | `IIssuedPermit` | `string[]` | No | No | Yes |
| `correctiveActionRequired` | `IInspectionDeficiency` | `string` | No | No | Yes |
| `createdAt` | All records | `string` | Yes | No | Yes |
| `currentResult` | `IRequiredInspectionCheckpoint` | `RequiredInspectionResult` | No | No | Yes |
| `currentResponsiblePartyId` | `IIssuedPermit`, `IInspectionVisit` | `string` | No | No | Yes |
| `currentStatus` | `IIssuedPermit` | `IssuedPermitStatus` | No | No | Yes |
| `dateCalledIn` | `IRequiredInspectionCheckpoint` | `string?` | No | No | No |
| `daysToExpiration` | `IIssuedPermit` | `number` | No | Yes | No |
| `deficiencyId` | `IInspectionDeficiency` | `string` | Yes | No | Yes |
| `derivedHealthTier` | `IIssuedPermit` | `PermitHealthTier` | No | Yes | No |
| `description` | `IInspectionDeficiency` | `string` | No | No | Yes |
| `description` | `IIssuedPermit` | `string` | No | No | Yes |
| `dueDate` | `IInspectionDeficiency` | `string?` | No | No | No |
| `evidenceId` | `IPermitEvidenceRecord` | `string` | Yes | No | Yes |
| `evidenceType` | `IPermitEvidenceRecord` | `PermitEvidenceType` | No | No | Yes |
| `expirationDate` | `IIssuedPermit` | `string` | No | No | Yes |
| `expirationRiskTier` | `IIssuedPermit` | `ExpirationRiskTier` | No | Yes | No |
| `fileName` | `IPermitEvidenceRecord` | `string` | No | No | Yes |
| `followUpRequired` | `IInspectionVisit` | `boolean` | No | No | Yes |
| `inspectorName` | `IInspectionVisit` | `string` | No | No | Yes |
| `isBlockingCloseout` | `IRequiredInspectionCheckpoint` | `boolean` | No | No | Yes |
| `issuanceDate` | `IIssuedPermit` | `string` | Yes | No | Yes |
| `issuedPermitId` | `IIssuedPermit` | `string` | Yes | No | Yes |
| `jurisdictionName` | `IIssuedPermit`, `IPermitApplication` | `string` | No | No | Yes |
| `newStatus` | `IPermitLifecycleAction` | `IssuedPermitStatus` | Yes | No | Yes |
| `parentPermitId` | `IIssuedPermit` | `string?` | Yes | No | No |
| `permitFeeAmount` | `IIssuedPermit` | `number` | No | No | Yes |
| `permitNumber` | `IIssuedPermit` | `string` | Yes | No | Yes |
| `permitType` | `IIssuedPermit`, `IPermitApplication` | `PermitType` | Yes | No | Yes |
| `previousStatus` | `IPermitLifecycleAction` | `IssuedPermitStatus` | Yes | No | Yes |
| `projectId` | All records | `string` | Yes | No | Yes |
| `renewalDate` | `IIssuedPermit` | `string?` | No | No | No |
| `requiresReinspection` | `IInspectionDeficiency` | `boolean` | No | No | Yes |
| `resolutionNotes` | `IInspectionDeficiency` | `string?` | No | No | Conditional |
| `resolutionStatus` | `IInspectionDeficiency` | `DeficiencyResolutionStatus` | No | No | Yes |
| `result` | `IInspectionVisit` | `InspectionVisitResult` | No | No | Yes |
| `scheduledDate` | `IInspectionVisit` | `string` | No | No | Yes |
| `sequence` | `IRequiredInspectionCheckpoint` | `number` | No | No | Yes |
| `severity` | `IInspectionDeficiency` | `DeficiencySeverity` | No | No | Yes |
| `status` | `IRequiredInspectionCheckpoint` | `CheckpointStatus` | No | No | Yes |
| `storageUri` | `IPermitEvidenceRecord` | `string` | No | No | Yes |
| `tags` | `IIssuedPermit` | `string[]` | No | No | Yes |
| `threadRelationshipType` | `IIssuedPermit` | `PermitThreadRelationship` | Yes | No | Yes |
| `threadRootPermitId` | `IIssuedPermit` | `string?` | Yes | No | No |
| `updatedAt` | All records | `string` | No | No | Yes |
| `verifiedOnline` | `IRequiredInspectionCheckpoint` | `boolean` | No | No | Yes |
| `visitId` | `IInspectionVisit` | `string` | Yes | No | Yes |

---

*[← T01](P3-E7-T01-Product-Shape-Scope-and-Doctrine.md) | [Master Index](P3-E7-Permits-Module-Field-Specification.md) | [T03 →](P3-E7-T03-Lifecycle-State-Actions-and-Governance.md)*
