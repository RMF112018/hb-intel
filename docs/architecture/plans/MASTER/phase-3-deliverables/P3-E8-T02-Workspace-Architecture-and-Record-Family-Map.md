# P3-E8-T02 — Workspace Architecture and Record-Family Map

**Doc ID:** P3-E8-T02
**Parent:** P3-E8 Safety Module — Master Index
**Phase:** 3
**Workstream:** E — Data Models and Field Specifications
**Part:** 2 of 10
**Owner:** Architecture
**Last Updated:** 2026-03-23

---

## 1. Identity and Scoping Model

Every Safety record is scoped to a **project**. There are no cross-project safety records. Each project has exactly one active SSSP base plan at a time. All other record families are multi-instance within a project.

### 1.1 Core Identity Fields (All Record Families)

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | ULID; system-assigned at creation |
| `projectId` | `string` | Required foreign key to project registry |
| `createdAt` | `ISO8601` | System-assigned |
| `createdBy` | `string` | User identity reference |
| `updatedAt` | `ISO8601` | System-assigned on every mutation |
| `updatedBy` | `string` | Last mutating user |
| `schemaVersion` | `number` | For forward-compatible deserialization |

### 1.2 Lifecycle State Pattern

All governed record families use explicit lifecycle states with constrained transitions. State is a first-class field — never derived from a date comparison alone. The transition guard lives at the API layer; the client may not write `status` directly for governed transitions.

---

## 2. Record Family Interfaces

### 2.1 `ISiteSpecificSafetyPlan` (SSSP Base Plan)

```typescript
interface ISiteSpecificSafetyPlan {
  // Identity
  id: string;
  projectId: string;
  schemaVersion: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;

  // Version and lifecycle
  planVersion: number;                    // Increments on each full reapproval
  status: SSSPStatus;                     // DRAFT | PENDING_APPROVAL | APPROVED | SUPERSEDED
  approvalDate: string | null;
  approvedBy: SSSPApproval;               // Joint approval record — see T03
  supersededBy: string | null;            // id of successor SSSP if SUPERSEDED
  effectiveDate: string | null;

  // Governed sections (Safety Manager only — safetyManagerOnly: true)
  hazardIdentificationAndControl: SSSPGoverned_HazardSection;
  emergencyResponseProcedures: SSSPGoverned_EmergencySection;
  safetyProgramStandards: SSSPGoverned_ProgramSection;
  regulatoryAndCodeCitationBlock: SSSPGoverned_RegulatorySection;
  competentPersonRequirements: SSSPGoverned_CompetentPersonSection;
  subcontractorComplianceStandards: SSSPGoverned_SubcontractorSection;
  incidentReportingProtocol: SSSPGoverned_IncidentSection;

  // Project-instance sections (project team editable)
  projectContacts: SSSPInstance_Contacts;
  subcontractorList: SSSPInstance_SubcontractorList;
  projectLocation: SSSPInstance_Location;
  emergencyAssemblyAndSiteLayout: SSSPInstance_SiteLayout;
  orientationSchedule: SSSPInstance_OrientationSchedule;
  projectSpecificNotes: string | null;

  // Document output
  renderedDocumentRef: string | null;     // Reference to rendered formal PDF artifact
  renderedAt: string | null;
}
```

**Lifecycle states:** `DRAFT → PENDING_APPROVAL → APPROVED → SUPERSEDED`

Full detail: T03.

---

### 2.2 `ISSSPAddendum`

```typescript
interface ISSSPAddendum {
  id: string;
  projectId: string;
  parentSsspId: string;                   // Must reference APPROVED base plan
  schemaVersion: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;

  addendumNumber: number;                 // Sequential within a base plan
  title: string;
  description: string;
  affectedSections: SSSPSectionKey[];     // Which SSSP sections this addendum modifies
  changeType: SSSPAddendumChangeType;     // SCOPE_CHANGE | HAZARD_ADDITION | PROCEDURE_UPDATE | EMERGENCY_UPDATE | OTHER
  operationallyAffected: boolean;         // When true, PM and Superintendent approval required

  status: SSSPAddendumStatus;             // DRAFT | PENDING_APPROVAL | APPROVED | VOIDED
  approvalRecord: SSSPAddendumApproval;   // See T03
  effectiveDate: string | null;
  voidedReason: string | null;
}
```

Full detail: T03.

---

### 2.3 `IInspectionChecklistTemplate`

```typescript
interface IInspectionChecklistTemplate {
  id: string;
  projectId: string;                      // null = workspace-level template (Safety Manager library)
  schemaVersion: number;
  createdAt: string;
  createdBy: string;                      // Must be Safety Manager role
  updatedAt: string;
  updatedBy: string;

  templateName: string;
  templateVersion: number;               // Increments on each approved revision
  templateStatus: TemplateStatus;         // DRAFT | ACTIVE | RETIRED
  publishedAt: string | null;

  sections: IInspectionSection[];         // See §2.4
  scoringWeights: ISectionScoringWeight[];// One per section; must sum to 100
  applicableSectionLogic: IApplicabilityRule[];  // Conditions for marking a section N/A
}
```

Full detail: T04.

---

### 2.4 `IInspectionSection` (embedded in template)

```typescript
interface IInspectionSection {
  sectionKey: string;                     // Stable key across template versions
  sectionName: string;
  sectionNumber: number;
  items: IInspectionItem[];
  isApplicableByDefault: boolean;
}

interface IInspectionItem {
  itemKey: string;
  itemText: string;
  itemNumber: number;
  responseType: InspectionItemResponseType; // PASS_FAIL | YES_NO | N_A_ALLOWED | NUMERIC_RATING
  requiresPhotoOnFail: boolean;
  requiresCorrectiveActionOnFail: boolean;
  regulatoryRef: string | null;
}
```

---

### 2.5 `ICompletedInspection`

```typescript
interface ICompletedInspection {
  id: string;
  projectId: string;
  schemaVersion: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;

  // Template binding (immutable after completion)
  templateId: string;
  templateVersion: number;               // Pinned at time of inspection creation
  inspectionDate: string;
  inspectionWeek: string;                // ISO week label e.g. "2026-W12"
  inspectorId: string;                   // Must be Safety Manager or Safety Officer role

  status: InspectionStatus;              // IN_PROGRESS | COMPLETED | VOIDED

  // Section responses
  sectionResponses: IInspectionSectionResponse[];

  // Derived score fields (computed at completion; immutable after)
  applicableSectionCount: number;
  rawScore: number;                       // Points earned from applicable sections
  maxPossibleScore: number;               // Max points from applicable sections only
  normalizedScore: number;               // rawScore / maxPossibleScore * 100; rounded 1dp

  // Corrective action links
  correctiveActionIds: string[];          // IDs of SCAs generated from this inspection

  // Notes and evidence
  overallNotes: string | null;
  evidenceRecordIds: string[];

  // Immutable score snapshot published to Project Hub
  publishedScorecardSnapshot: IInspectionScorecardSnapshot | null;
}
```

**Scoring:** Normalized score accounts for applicable sections only (Decision 38). Full detail: T04.

---

### 2.6 `ISafetyCorrectiveAction` (Centralized Ledger)

```typescript
interface ISafetyCorrectiveAction {
  id: string;
  projectId: string;
  schemaVersion: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;

  // Source (where this CA originated — does not change lifecycle)
  sourceType: CorrectiveActionSourceType;  // INSPECTION | INCIDENT | JHA | OBSERVATION | EXTERNAL
  sourceRecordId: string | null;           // FK to originating record when applicable
  sourceDescription: string | null;        // Free-text origin note for EXTERNAL/OBSERVATION sources

  // Content
  title: string;
  description: string;
  severity: CorrectiveActionSeverity;      // CRITICAL | MAJOR | MINOR
  category: CorrectiveActionCategory;      // HOUSEKEEPING | PPE | FALL_PROTECTION | ... (governed list)

  // Assignment and ownership
  assignedToId: string;                    // User reference (typically PM or foreman)
  assignedToSubcontractorId: string | null;
  ownerId: string;                         // Safety Manager — always owns the ledger entry

  // Lifecycle
  status: CorrectiveActionStatus;          // OPEN | IN_PROGRESS | PENDING_VERIFICATION | CLOSED | VOIDED
  dueDate: string;
  completedDate: string | null;
  verifiedDate: string | null;
  verifiedById: string | null;

  // Resolution
  resolutionNotes: string | null;
  evidenceRecordIds: string[];

  // Work queue driver
  isOverdue: boolean;                      // Computed: dueDate < today and status not terminal
}
```

**Centralized regardless of source.** All corrective actions from all workflows land in this ledger. Full detail: T05.

---

### 2.7 `IIncidentRecord`

```typescript
interface IIncidentRecord {
  id: string;
  projectId: string;
  schemaVersion: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;

  // Classification
  incidentType: IncidentType;             // NEAR_MISS | FIRST_AID | RECORDABLE | LOST_TIME | FATALITY | PROPERTY_DAMAGE | ENVIRONMENTAL
  incidentDate: string;
  incidentTime: string | null;
  location: string;

  // Privacy
  privacyTier: IncidentPrivacyTier;       // STANDARD | SENSITIVE | RESTRICTED
  // STANDARD: full project team visibility
  // SENSITIVE: Safety Manager / Safety Officer only + PM + PM's designated lead
  // RESTRICTED: Safety Manager / Safety Officer only

  // Case status
  status: IncidentStatus;                 // REPORTED | UNDER_INVESTIGATION | INVESTIGATION_COMPLETE | CLOSED | LITIGATED
  caseNumber: string | null;

  // Narrative (visibility controlled by privacyTier)
  incidentNarrative: string;
  immediateActions: string | null;
  rootCauseAnalysis: string | null;
  preventiveMeasures: string | null;

  // Persons involved (always RESTRICTED visibility)
  personsInvolved: IIncidentPersonRecord[];

  // Links
  correctiveActionIds: string[];
  evidenceRecordIds: string[];
  relatedIncidentIds: string[];           // For linked incidents in same event
}
```

Full detail: T05.

---

### 2.8 `IJhaRecord` (Job Hazard Analysis)

```typescript
interface IJhaRecord {
  id: string;
  projectId: string;
  schemaVersion: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;

  // Scope
  activityDescription: string;
  scopeOfWork: string;
  location: string;
  applicableSubcontractorIds: string[];

  // Lifecycle
  status: JhaStatus;                      // DRAFT | PENDING_APPROVAL | APPROVED | SUPERSEDED | VOIDED
  approvedById: string | null;            // Safety Manager
  approvedAt: string | null;
  supersededById: string | null;

  // Steps and hazards
  steps: IJhaStep[];

  // Required PPE (governed list)
  requiredPpe: PpeType[];

  // Competent person required
  requiresCompetentPerson: boolean;
  competentPersonDesignationId: string | null;

  // Links
  linkedDailyPreTaskIds: string[];        // Pre-task plans that reference this JHA
  evidenceRecordIds: string[];
}

interface IJhaStep {
  stepNumber: number;
  stepDescription: string;
  hazards: IJhaHazard[];
}

interface IJhaHazard {
  hazardDescription: string;
  riskLevel: HazardRiskLevel;             // HIGH | MEDIUM | LOW
  controlMeasures: string[];
  residualRiskLevel: HazardRiskLevel;
}
```

Full detail: T06.

---

### 2.9 `IDailyPreTaskPlan`

```typescript
interface IDailyPreTaskPlan {
  id: string;
  projectId: string;
  schemaVersion: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;

  // Reference to governing JHA
  jhaId: string;                          // Must reference APPROVED JHA
  workDate: string;
  location: string;
  crewForeman: string;

  // Day-of confirmation fields
  weatherConditions: string | null;
  specialHazardsToday: string | null;
  controlsConfirmed: boolean;
  ppeVerified: boolean;
  siteConditionsNotes: string | null;

  // Attendees
  attendeeCount: number;
  namedAttendees: string[];               // When available; provisional identity allowed
  signInEvidenceRecordId: string | null;

  status: PreTaskStatus;                  // OPEN | COMPLETE | VOIDED
  completedAt: string | null;
}
```

Full detail: T06.

---

### 2.10 `IToolboxTalkPrompt` (Governed Library Entry)

```typescript
interface IToolboxTalkPrompt {
  id: string;
  projectId: string | null;              // null = workspace-level library prompt
  schemaVersion: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;

  promptTitle: string;
  promptContent: string;
  associatedActivities: string[];         // Activity types this prompt is relevant to
  associatedHazardCategories: string[];
  governedPromptStatus: ToolboxPromptStatus;  // ACTIVE | RETIRED

  issuanceRecord: IToolboxPromptIssuance | null;  // Set when issued to a project week
}

interface IToolboxPromptIssuance {
  issuedToProjectId: string;
  issuedForWeek: string;                  // ISO week
  issuedBy: string;                       // Safety Manager
  issuedAt: string;
  closureRequired: boolean;              // True for governed high-risk prompts
  closedAt: string | null;
  closureProofRecordId: string | null;
}
```

Full detail: T06.

---

### 2.11 `IWeeklyToolboxTalkRecord`

```typescript
interface IWeeklyToolboxTalkRecord {
  id: string;
  projectId: string;
  schemaVersion: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;

  talkWeek: string;                       // ISO week e.g. "2026-W12"
  talkDate: string;
  conductedById: string;                  // Safety Manager or designated presenter

  promptId: string | null;               // Optional link to governing prompt
  topicTitle: string;
  topicContent: string;                   // May be drawn from prompt or free-form

  // Attendance proof model
  attendeeCount: number;                  // Baseline count (required)
  signInSheetEvidenceId: string | null;  // Physical/scanned sign-in (optional baseline)

  // Named attendance (required for governed high-risk toolbox talks)
  namedAttendees: IToolboxAttendee[];
  isHighRiskGoverned: boolean;

  status: ToolboxTalkStatus;              // DRAFT | COMPLETE | VOIDED
  completedAt: string | null;
  acknowledgmentBatchId: string | null;  // When @hbc/acknowledgment used
}

interface IToolboxAttendee {
  workerId: string | null;               // Governed worker ref when available
  workerName: string;                    // Provisional / ad hoc allowed
  subcontractorId: string | null;
  acknowledgedAt: string | null;
}
```

Full detail: T06.

---

### 2.12 `IWorkerOrientationRecord`

```typescript
interface IWorkerOrientationRecord {
  id: string;
  projectId: string;
  schemaVersion: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;

  // Worker identity (hybrid — governed when available)
  workerId: string | null;               // Governed worker identity ref
  workerName: string;                    // Always recorded (provisional fallback)
  workerCompanyId: string | null;        // Company registry reference
  workerCompanyName: string;             // Always recorded

  orientationDate: string;
  orientationAdministeredById: string;   // Safety Manager / Safety Officer

  // Content coverage (governed checklist)
  topicsCovered: OrientationTopic[];     // From governed orientation checklist
  projectSpecificTopicsNotes: string | null;

  // Acknowledgment
  acknowledgedAt: string | null;
  acknowledgmentMethod: AcknowledgmentMethod;  // DIGITAL_SIGNATURE | PHYSICAL_SIGNATURE | VERBAL_CONFIRMED
  acknowledgmentEvidenceId: string | null;

  status: OrientationStatus;             // COMPLETE | PENDING_ACKNOWLEDGMENT | VOIDED
}
```

Full detail: T07.

---

### 2.13 `ISubcontractorSafetySubmission`

```typescript
interface ISubcontractorSafetySubmission {
  id: string;
  projectId: string;
  schemaVersion: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;

  subcontractorId: string;               // Company registry reference
  subcontractorName: string;
  tradeScope: string;

  // Submission content
  submissionType: SafetySubmissionType;  // COMPANY_SAFETY_PLAN | PROJECT_SPECIFIC_APP | HAZARD_COMMUNICATION | OTHER
  documentTitle: string;
  submittedAt: string;
  submittedByName: string;

  // Review
  status: SubmissionReviewStatus;        // PENDING_REVIEW | APPROVED | REJECTED | REVISION_REQUESTED
  reviewedById: string | null;           // Safety Manager
  reviewedAt: string | null;
  reviewNotes: string | null;
  revisionRequestNotes: string | null;

  evidenceRecordId: string;              // Required: the submitted document as a governed evidence record
}
```

Full detail: T07.

---

### 2.14 `ICertificationRecord`

```typescript
interface ICertificationRecord {
  id: string;
  projectId: string;
  schemaVersion: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;

  // Holder identity (hybrid)
  workerId: string | null;
  workerName: string;
  workerCompanyId: string | null;

  // Certification details
  certificationType: CertificationType;  // OSHA_10 | OSHA_30 | FIRST_AID_CPR | RIGGING | SCAFFOLD | CRANE_OPERATOR | COMPETENT_PERSON | CUSTOM
  customCertificationName: string | null;
  certifyingBody: string | null;
  certificationNumber: string | null;
  issueDate: string;
  expirationDate: string | null;

  // Compliance state
  status: CertificationStatus;           // ACTIVE | EXPIRING_SOON | EXPIRED | REVOKED
  // expiringSoon = expirationDate within 30 days
  verifiedById: string | null;           // Safety Manager who verified
  verifiedAt: string | null;
  evidenceRecordId: string | null;
}
```

Full detail: T07.

---

### 2.15 `IHazComSdsRecord`

```typescript
interface IHazComSdsRecord {
  id: string;
  projectId: string;
  schemaVersion: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;

  // Product
  productName: string;
  manufacturer: string;
  chemicalAbstractNumber: string | null;  // CAS number

  // Location and use
  useLocation: string;
  responsibleSubcontractorId: string | null;
  responsibleSubcontractorName: string | null;

  // SDS document
  sdsDocumentRef: string;                // Evidence record ID for the SDS PDF
  sdsRevisionDate: string | null;

  // Compliance
  status: SdsStatus;                     // ACTIVE | SUPERSEDED | REMOVED_FROM_SITE
  addedDate: string;
  removedDate: string | null;
}
```

Full detail: T07.

---

### 2.16 `ICompetentPersonDesignation`

```typescript
interface ICompetentPersonDesignation {
  id: string;
  projectId: string;
  schemaVersion: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;

  // Designee identity
  workerId: string | null;
  workerName: string;
  workerCompanyId: string | null;

  // Scope of designation
  competencyArea: CompetencyArea;        // EXCAVATION | SCAFFOLDING | FALL_PROTECTION | CONFINED_SPACE | RIGGING | ELECTRICAL | CUSTOM
  customCompetencyDescription: string | null;
  scopeDescription: string;

  // Qualification backing
  qualifyingCertificationId: string | null;
  qualificationNotes: string | null;

  // Lifecycle
  status: DesignationStatus;             // ACTIVE | EXPIRED | REVOKED
  effectiveDate: string;
  expirationDate: string | null;
  designatedById: string;                // Safety Manager
  revokedAt: string | null;
  revocationReason: string | null;
}
```

Full detail: T07.

---

### 2.17 `ISafetyEvidenceRecord`

```typescript
interface ISafetyEvidenceRecord {
  id: string;
  projectId: string;
  schemaVersion: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;

  // Source
  sourceRecordType: SafetyEvidenceSourceType;  // INSPECTION | INCIDENT | JHA | CORRECTIVE_ACTION | TOOLBOX_TALK | ORIENTATION | SUBMISSION | CERTIFICATION | GENERAL
  sourceRecordId: string | null;

  // Document
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  storageRef: string;                    // Internal storage reference (SharePoint / blob)

  // Metadata
  capturedAt: string;
  capturedBy: string;
  description: string | null;

  // Sensitivity and retention
  sensitivityTier: EvidenceSensitivityTier;  // STANDARD | SENSITIVE | RESTRICTED
  retentionCategory: RetentionCategory;  // STANDARD_PROJECT | EXTENDED_REGULATORY | LITIGATION_HOLD
  retentionHoldNote: string | null;

  // Review state
  reviewStatus: EvidenceReviewStatus;    // PENDING_REVIEW | REVIEWED | ACCEPTED | REJECTED
  reviewedById: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
}
```

Full detail: T05.

---

## 3. Type Unions

```typescript
type SSSPStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'SUPERSEDED';

type SSSPAddendumStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'VOIDED';

type SSSPAddendumChangeType =
  | 'SCOPE_CHANGE'
  | 'HAZARD_ADDITION'
  | 'PROCEDURE_UPDATE'
  | 'EMERGENCY_UPDATE'
  | 'OTHER';

type TemplateStatus = 'DRAFT' | 'ACTIVE' | 'RETIRED';

type InspectionItemResponseType = 'PASS_FAIL' | 'YES_NO' | 'N_A_ALLOWED' | 'NUMERIC_RATING';

type InspectionStatus = 'IN_PROGRESS' | 'COMPLETED' | 'VOIDED';

type CorrectiveActionSourceType =
  | 'INSPECTION'
  | 'INCIDENT'
  | 'JHA'
  | 'OBSERVATION'
  | 'EXTERNAL';

type CorrectiveActionSeverity = 'CRITICAL' | 'MAJOR' | 'MINOR';

type CorrectiveActionCategory =
  | 'HOUSEKEEPING'
  | 'PPE'
  | 'FALL_PROTECTION'
  | 'ELECTRICAL'
  | 'EXCAVATION'
  | 'SCAFFOLDING'
  | 'CRANE_RIGGING'
  | 'FIRE_PREVENTION'
  | 'HAZMAT'
  | 'TRAFFIC_CONTROL'
  | 'CONFINED_SPACE'
  | 'DOCUMENTATION'
  | 'OTHER';

type CorrectiveActionStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'PENDING_VERIFICATION'
  | 'CLOSED'
  | 'VOIDED';

type IncidentType =
  | 'NEAR_MISS'
  | 'FIRST_AID'
  | 'RECORDABLE'
  | 'LOST_TIME'
  | 'FATALITY'
  | 'PROPERTY_DAMAGE'
  | 'ENVIRONMENTAL';

type IncidentPrivacyTier = 'STANDARD' | 'SENSITIVE' | 'RESTRICTED';

type IncidentStatus =
  | 'REPORTED'
  | 'UNDER_INVESTIGATION'
  | 'INVESTIGATION_COMPLETE'
  | 'CLOSED'
  | 'LITIGATED';

type JhaStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'SUPERSEDED'
  | 'VOIDED';

type HazardRiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

type PreTaskStatus = 'OPEN' | 'COMPLETE' | 'VOIDED';

type ToolboxPromptStatus = 'ACTIVE' | 'RETIRED';

type ToolboxTalkStatus = 'DRAFT' | 'COMPLETE' | 'VOIDED';

type OrientationStatus = 'COMPLETE' | 'PENDING_ACKNOWLEDGMENT' | 'VOIDED';

type AcknowledgmentMethod =
  | 'DIGITAL_SIGNATURE'
  | 'PHYSICAL_SIGNATURE'
  | 'VERBAL_CONFIRMED';

type OrientationTopic =
  | 'SITE_HAZARDS'
  | 'EMERGENCY_PROCEDURES'
  | 'PPE_REQUIREMENTS'
  | 'INCIDENT_REPORTING'
  | 'SSSP_OVERVIEW'
  | 'SUBSTANCE_ABUSE_POLICY'
  | 'FALL_PROTECTION'
  | 'PROJECT_SPECIFIC_HAZARDS';

type SafetySubmissionType =
  | 'COMPANY_SAFETY_PLAN'
  | 'PROJECT_SPECIFIC_APP'
  | 'HAZARD_COMMUNICATION'
  | 'OTHER';

type SubmissionReviewStatus =
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'REVISION_REQUESTED';

type CertificationType =
  | 'OSHA_10'
  | 'OSHA_30'
  | 'FIRST_AID_CPR'
  | 'RIGGING'
  | 'SCAFFOLD'
  | 'CRANE_OPERATOR'
  | 'COMPETENT_PERSON'
  | 'CUSTOM';

type CertificationStatus =
  | 'ACTIVE'
  | 'EXPIRING_SOON'
  | 'EXPIRED'
  | 'REVOKED';

type SdsStatus = 'ACTIVE' | 'SUPERSEDED' | 'REMOVED_FROM_SITE';

type CompetencyArea =
  | 'EXCAVATION'
  | 'SCAFFOLDING'
  | 'FALL_PROTECTION'
  | 'CONFINED_SPACE'
  | 'RIGGING'
  | 'ELECTRICAL'
  | 'CUSTOM';

type DesignationStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED';

type SafetyEvidenceSourceType =
  | 'INSPECTION'
  | 'INCIDENT'
  | 'JHA'
  | 'CORRECTIVE_ACTION'
  | 'TOOLBOX_TALK'
  | 'ORIENTATION'
  | 'SUBMISSION'
  | 'CERTIFICATION'
  | 'GENERAL';

type EvidenceSensitivityTier = 'STANDARD' | 'SENSITIVE' | 'RESTRICTED';

type RetentionCategory =
  | 'STANDARD_PROJECT'
  | 'EXTENDED_REGULATORY'
  | 'LITIGATION_HOLD';

type EvidenceReviewStatus =
  | 'PENDING_REVIEW'
  | 'REVIEWED'
  | 'ACCEPTED'
  | 'REJECTED';

type PpeType =
  | 'HARD_HAT'
  | 'SAFETY_GLASSES'
  | 'GLOVES'
  | 'SAFETY_VEST'
  | 'STEEL_TOE_BOOTS'
  | 'FALL_HARNESS'
  | 'RESPIRATOR'
  | 'HEARING_PROTECTION'
  | 'FACE_SHIELD'
  | 'CUSTOM';
```

---

## 4. Governance Layer

### 4.1 Field-Level Authority Matrix

| Record Family | Safety Manager | Safety Officer | PM | Superintendent | Field Engineer | PER |
|---|---|---|---|---|---|---|
| SSSP Governed Sections | RW | RW | R | R | — | — |
| SSSP Instance Sections | R | R | RW | RW | R | — |
| Inspection Template | RW | R | R | — | — | — |
| Completed Inspection | RW (create/complete) | RW (assist) | R | R | R | Summary only |
| Corrective Action | RW | RW | R (own items) | R (own items) | — | Count/age only |
| Incident (STANDARD tier) | RW | RW | R | R | — | Anonymized count |
| Incident (SENSITIVE tier) | RW | RW | R (limited) | — | — | Anonymized count |
| Incident (RESTRICTED tier) | RW | RW | — | — | — | Anonymized count |
| JHA | RW (approve) | R | Contributor | Contributor | — | — |
| Daily Pre-Task Plan | R | R | RW | RW | — | — |
| Toolbox Talk Prompt | RW | R | — | — | — | — |
| Weekly Toolbox Talk | RW (own) | RW (assist) | R | R | — | — |
| Orientation Record | RW | RW | R | R | — | — |
| Subcontractor Submission | R (review/approve) | R | R | — | — | — |
| Certification Record | RW | RW | R | R | — | — |
| HazCom/SDS | RW | RW | R | R | — | — |
| Competent Person | RW | RW | R | R | — | — |
| Evidence Record | RW | RW | R (STANDARD) | R (STANDARD) | — | — |

**R** = Read, **RW** = Read + Write, **—** = No access. PER access governed by T01 §5.3 tiering.

### 4.2 Workforce Identity Model

Per Decision 31: workforce identity uses a hybrid model.

- **Governed references:** When a worker has a system identity (company employee ID, platform user account), use the governed `workerId` reference.
- **Provisional / ad hoc:** When a worker is present on site without a governed identity (day labor, visitor), use name-only fields. The `workerId` field is nullable.
- Workers are never blocked from orientation, toolbox attendance, or JHA participation due to absence of a governed identity. Ad hoc identity is permitted and expected.

### 4.3 Subcontractor / Company Identity Model

Per Decision 32: subcontractor/company identity uses the governed company registry (`workerCompanyId`). The platform maintains a company registry that is the source of truth for subcontractor identity across Safety, Subcontractors, and Permits modules.

Per Decision 33: future-state company mapping will support Procore commitment vendor/company identity alignment. Phase 3 plans the data shape and identity key design to support this future mapping without requiring it.

---

## 5. Full Field Index

| Record Family | Field | Type | Notes |
|---|---|---|---|
| SSSP | `id` | string | ULID |
| SSSP | `planVersion` | number | Increments on full reapproval |
| SSSP | `status` | SSSPStatus | State machine |
| SSSP | `approvalDate` | string \| null | Set on APPROVED transition |
| SSSP | `effectiveDate` | string \| null | May differ from approvalDate |
| SSSP | `renderedDocumentRef` | string \| null | PDF output reference |
| SSSP Addendum | `addendumNumber` | number | Sequential within base plan |
| SSSP Addendum | `changeType` | SSSPAddendumChangeType | Classification |
| SSSP Addendum | `operationallyAffected` | boolean | Triggers PM/Super approval |
| Inspection Template | `templateVersion` | number | Increments on approved revision |
| Inspection Template | `scoringWeights` | ISectionScoringWeight[] | Must sum to 100 |
| Completed Inspection | `templateVersion` | number | Pinned at creation — immutable |
| Completed Inspection | `normalizedScore` | number | Applicable sections only |
| Completed Inspection | `applicableSectionCount` | number | Denominator for normalization |
| Safety CA | `sourceType` | CorrectiveActionSourceType | All sources land in central ledger |
| Safety CA | `severity` | CorrectiveActionSeverity | Drives health tier |
| Safety CA | `isOverdue` | boolean | Computed field |
| Incident | `privacyTier` | IncidentPrivacyTier | Controls visibility |
| Incident | `incidentType` | IncidentType | Classification |
| JHA | `steps` | IJhaStep[] | Step-hazard-control model |
| JHA | `requiresCompetentPerson` | boolean | Links to designation |
| Daily Pre-Task | `jhaId` | string | Must reference APPROVED JHA |
| Toolbox Talk | `isHighRiskGoverned` | boolean | Triggers named attendance |
| Orientation | `topicsCovered` | OrientationTopic[] | Governed checklist |
| Subcontractor Submission | `submissionType` | SafetySubmissionType | Classification |
| Certification | `certificationType` | CertificationType | |
| Certification | `status` | CertificationStatus | Includes EXPIRING_SOON |
| Competent Person | `competencyArea` | CompetencyArea | Governed scope |
| Evidence | `sensitivityTier` | EvidenceSensitivityTier | Visibility control |
| Evidence | `retentionCategory` | RetentionCategory | Retention rules |

---

*[← T01](P3-E8-T01-Module-Scope-Operating-Model-and-Visibility.md) | [Master Index](P3-E8-Safety-Module-Field-Specification.md) | [T03 →](P3-E8-T03-SSSP-Base-Plan-Addenda-and-Approval-Governance.md)*
