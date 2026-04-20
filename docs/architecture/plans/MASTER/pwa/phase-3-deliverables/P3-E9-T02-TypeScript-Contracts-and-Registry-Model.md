# P3-E9-T02 — Reports: TypeScript Contracts and Registry Model

**Module:** P3-E9 Reports
**Governing contract:** P3-F1 — Reports Workspace / Definition / Run / Release Contract Package
**Locked decisions driving this file:** LD-REP-01, LD-REP-02, LD-REP-03, LD-REP-04, LD-REP-06, LD-REP-07, LD-REP-09, LD-REP-10

---

## 1. Enumerations

### 1.1 Report Run Status

```typescript
type ReportRunStatus =
  | 'queued'        // Generation job enqueued; not yet started
  | 'generating'    // Generation pipeline active
  | 'generated'     // Artifact produced; awaiting approval (PX Review) or ready for release (others)
  | 'approved'      // PX Review only: PE approval recorded; ready for release
  | 'released'      // Released for distribution
  | 'archived'      // Historical record; no longer active
  | 'failed';       // Generation failed; see failureReason
```

**Valid transitions:**
- `queued` → `generating` → `generated` → `approved` (PX Review only) → `released` → `archived`
- `queued` → `generating` → `failed` (terminal for that run; a new run may be initiated)
- `generated` → `released` (non-gated families: owner-report, sub-scorecard, lessons-learned)
- `generated` → `archived` (without release, if superseded or abandoned)

### 1.2 Run Type

```typescript
type ReportRunType =
  | 'standard'            // PM/PE-initiated generation run
  | 'reviewer-generated'; // PER-initiated run against confirmed PM snapshot
```

### 1.3 Report Family Type Classification

```typescript
type ReportFamilyType =
  | 'native-locked'          // Corporate locked template (e.g., px-review)
  | 'native-configurable'    // Corporate configurable template with governed customization zones
  | 'integration-artifact';  // Source data owned by another module; Reports assembles
```

### 1.4 Section Content Type

```typescript
type ReportSectionContentType =
  | 'module-snapshot'       // Data sourced from an immutable module snapshot
  | 'calculated-rollup'     // MOE-approved rollup calculation applied to snapshot data
  | 'narrative-only';       // PM-authored free text; no data binding
```

### 1.5 PER Release Authority

```typescript
type PerReleaseAuthority =
  | 'pe-only'           // Only PE may release; PER has no release authority for this family
  | 'per-permitted'     // PER may release per effective project-governance policy
  | 'global';           // Any authorized user in governed scope may release
```

### 1.6 Release Class

```typescript
type ReleaseClass =
  | 'internal-only'         // Project team and authorized reviewers only
  | 'owner-facing'          // Owner and owner representatives included
  | 'external-limited'      // Named external parties per distribution list
  | 'public';               // No distribution restriction (where template permits)
```

### 1.7 Internal Review Chain Status

```typescript
type InternalReviewChainStatus =
  | 'not-started'
  | 'submitted'        // PM has submitted to PE for review
  | 'returned'         // PE has returned for revision; PM must revise
  | 'complete';        // PE has approved the chain; report may proceed
```

### 1.8 Configuration Version State

```typescript
type ConfigVersionState =
  | 'draft'      // PM-editable; pending PE activation
  | 'active'     // PE-activated; immutable; drives generation runs
  | 'superseded' // Replaced by a newer active version
  | 'rejected';  // PE rejected the draft; PM must revise or abandon
```

### 1.9 Template Promotion Status

```typescript
type TemplatePromotionStatus =
  | 'not-submitted'
  | 'submitted-for-review'
  | 'under-review'
  | 'approved-promoted'   // Promoted to corporate template library
  | 'rejected';
```

---

## 2. Core Interfaces

### 2.1 Report Family Definition (Corporate Template Library Record)

```typescript
interface IReportFamilyDefinition {
  familyKey: string;                          // Unique key: 'px-review' | 'owner-report' | 'sub-scorecard' | 'lessons-learned' | custom
  displayName: string;
  familyType: ReportFamilyType;
  approvalGated: boolean;                     // true = PE approval required before release
  perReleaseAuthority: PerReleaseAuthority;
  allowedReleaseClasses: ReleaseClass[];      // Governed set; PE chooses within this list
  defaultReleaseClass: ReleaseClass;
  allowedAudienceClasses: string[];           // Governed audience identifiers
  stalenessThresholdDays: number;             // Default: 7
  requiresInternalReviewChainDefault: boolean; // Can be overridden by project governance policy
  sections: IReportSectionDefinition[];
  isLocked: boolean;                          // true = MOE-only modification (e.g., px-review)
  version: number;                            // Incremented on structural change
  effectiveFrom: string;                      // ISO 8601 — when this version became active
  deprecatedAt: string | null;
  sourceModule: string | null;                // Populated for integration-artifact families (e.g., 'P3-E10')
}
```

### 2.2 Report Section Definition

```typescript
interface IReportSectionDefinition {
  sectionKey: string;
  displayName: string;
  contentType: ReportSectionContentType;
  sourceModuleKey: string | null;            // Null for narrative-only sections
  snapshotApiContractRef: string | null;     // Reference to the snapshot API contract in source module
  rollupCalculationRef: string | null;       // Reference to approved rollup definition; null if not calculated-rollup
  isNarrativeOverrideable: boolean;          // true = PM may add/override narrative in this section
  isRequired: boolean;
  displayOrder: number;
}
```

### 2.3 Project Family Registration

Records the activation of a report family for a specific project, including the active configuration version.

```typescript
interface IProjectFamilyRegistration {
  registrationId: string;                    // UUID
  projectId: string;
  familyKey: string;                         // FK to IReportFamilyDefinition
  isActive: boolean;
  activatedAt: string | null;                // ISO 8601; null until first PE activation
  activatedByUPN: string | null;
  activeConfigVersionId: string | null;      // FK to IProjectFamilyConfigVersion (active)
  draftConfigVersionId: string | null;       // FK to IProjectFamilyConfigVersion (latest draft)
  promotionStatus: TemplatePromotionStatus;  // For project-extension families only
  promotionSubmittedAt: string | null;
  createdAt: string;
  createdByUPN: string;
}
```

### 2.4 Project Family Configuration Version

Represents a version of a project's configuration overlay for a family (structural customizations, narrative defaults, class selections).

```typescript
interface IProjectFamilyConfigVersion {
  configVersionId: string;                   // UUID
  registrationId: string;                    // FK to IProjectFamilyRegistration
  projectId: string;
  familyKey: string;
  state: ConfigVersionState;
  selectedReleaseClass: ReleaseClass;        // PM selects within allowedReleaseClasses
  selectedAudienceClasses: string[];         // PE-approved; PE approval required for changes
  sectionOverrides: IProjectSectionOverride[];
  narrativeDefaults: Record<string, string>; // sectionKey → default narrative text
  structuralChanges: boolean;                // true = post-activation structural changes exist; requires PE re-approval
  submittedForActivationAt: string | null;
  activatedAt: string | null;
  activatedByUPN: string | null;
  rejectionReason: string | null;
  version: number;
  createdAt: string;
  createdByUPN: string;
}
```

### 2.5 Project Section Override

Captures PM-authored or PE-approved overrides to section configuration within governed bounds.

```typescript
interface IProjectSectionOverride {
  sectionKey: string;
  isIncluded: boolean;                       // false = section excluded (only permitted sections may be excluded)
  displayOrderOverride: number | null;       // Reordering within template-permitted range
  narrativeDefaultOverride: string | null;   // PM-authored default narrative for this section
}
```

### 2.6 Report Run Record

The core run-ledger record for every generation event.

```typescript
interface IReportRunRecord {
  runId: string;                             // UUID
  projectId: string;
  familyKey: string;
  runType: ReportRunType;
  status: ReportRunStatus;
  configVersionId: string;                   // FK to IProjectFamilyConfigVersion active at generation time
  snapshotRefs: ISnapshotRef[];              // All module snapshots consumed; immutable after queuing
  generatedByUPN: string;                    // PM for standard; PER UPN for reviewer-generated
  generatedAt: string | null;                // ISO 8601; set when generation completes
  queuedAt: string;                          // ISO 8601
  artifactUrl: string | null;                // SharePoint URL; set after generation completes
  artifactSizeBytes: number | null;
  approvalMetadata: IReportApproval | null;  // Populated for PX Review approval events
  releaseMetadata: IReportRelease | null;    // Populated when released
  internalReviewChain: IInternalReviewChainState | null;
  failureReason: string | null;              // Populated on 'failed' status
  annotationArtifactRef: string | null;      // @hbc/field-annotations reference for reviewer-generated runs
  archivedAt: string | null;
}
```

### 2.7 Snapshot Reference (Immutable)

```typescript
interface ISnapshotRef {
  sourceModule: string;                      // e.g., 'P3-E5' (Financial), 'P3-E10' (Closeout)
  snapshotId: string;                        // Immutable snapshot identifier from source module
  snapshotVersion: number;
  capturedAt: string;                        // ISO 8601; when snapshot was captured by source module
  confirmedAt: string;                       // ISO 8601; when PM confirmed this snapshot for this run
}
```

### 2.8 Module Snapshot Envelope

The envelope used when Reports receives a snapshot from a source module.

```typescript
interface IModuleSnapshot {
  snapshotId: string;
  sourceModule: string;
  projectId: string;
  snapshotVersion: number;
  capturedAt: string;
  confirmedAt: string | null;
  dataPayload: Record<string, unknown>;      // Module-specific snapshot data; opaque to Reports
  schemaRef: string;                         // Reference to the snapshot schema contract in the source module
}
```

### 2.9 Report Approval

```typescript
interface IReportApproval {
  approvedByUPN: string;                     // PE UPN
  approvedAt: string;                        // ISO 8601
  comments: string | null;
  internalReviewChainRef: string | null;     // FK to chain record if chain was required
}
```

### 2.10 Report Release

```typescript
interface IReportRelease {
  releasedByUPN: string;
  releasedAt: string;                        // ISO 8601
  releaseClass: ReleaseClass;
  audienceClasses: string[];
  distributionNotes: string | null;
  externalRecipients: IExternalRecipient[] | null; // Populated when releaseClass includes external parties
}
```

### 2.11 External Recipient

```typescript
interface IExternalRecipient {
  name: string;
  organization: string | null;
  email: string | null;
  role: string | null;                       // e.g., 'Owner Representative', 'Architect'
}
```

### 2.12 Internal Review Chain State

```typescript
interface IInternalReviewChainState {
  chainId: string;                           // UUID
  runId: string;
  projectId: string;
  familyKey: string;
  status: InternalReviewChainStatus;
  submittedByPM_UPN: string;
  submittedAt: string | null;
  reviewedByPE_UPN: string | null;
  reviewedAt: string | null;
  returnReason: string | null;               // Populated when PE returns for revision
  completedAt: string | null;
}
```

### 2.13 Central Project-Governance Policy Record

The merged effective policy record that Reports enforces. Reports reads this; it does not write it.

```typescript
interface IProjectGovernancePolicyRecord {
  policyId: string;
  projectId: string;
  globalFloor: IGovernancePolicyFloor;       // MOE-set global minimum policy
  projectOverlay: IGovernancePolicyOverlay;  // PE-set project additions (tighten only, not loosen)
  effectivePolicy: IEffectiveGovernancePolicy; // Computed merged policy; Reports uses this
  version: number;
  lastUpdatedAt: string;
  lastUpdatedByUPN: string;
}

interface IGovernancePolicyFloor {
  requiresInternalReviewChainForPxReview: boolean;
  perReleaseAuthorityOverride: Partial<Record<string, PerReleaseAuthority>>; // familyKey → authority
  maxStalenessThresholdDays: number;         // Global max; projects cannot exceed
  allowedReleaseClassesGlobal: ReleaseClass[];
}

interface IGovernancePolicyOverlay {
  requiresInternalReviewChainForPxReview: boolean | null; // null = inherit from floor
  requiresInternalReviewChainForOwnerReport: boolean | null;
  bypassInternalReviewChainForOwnerReport: boolean;       // Default: false
  perReleaseAuthorityProjectOverride: Partial<Record<string, PerReleaseAuthority>>;
  stalenessThresholdDaysOverride: Partial<Record<string, number>>;
  allowedReleaseClassesProjectOverride: ReleaseClass[] | null; // null = inherit floor
}

interface IEffectiveGovernancePolicy {
  requiresInternalReviewChainForPxReview: boolean;
  requiresInternalReviewChainForOwnerReport: boolean;
  bypassInternalReviewChainForOwnerReport: boolean;
  perReleaseAuthority: Record<string, PerReleaseAuthority>; // familyKey → resolved authority
  stalenessThresholdDays: Record<string, number>;           // familyKey → resolved threshold
  allowedReleaseClasses: Record<string, ReleaseClass[]>;    // familyKey → resolved allowed classes
}
```

### 2.14 Report Family Policy (Per-Family Governance)

```typescript
interface IReportFamilyPolicy {
  familyKey: string;
  projectId: string;
  effectivePerReleaseAuthority: PerReleaseAuthority;
  effectiveStalenessThresholdDays: number;
  effectiveAllowedReleaseClasses: ReleaseClass[];
  requiresInternalReviewChain: boolean;
  bypassInternalReviewChain: boolean;        // Relevant for owner-report only
}
```

---

## 3. Registry Query Model

The report-definition registry is queried by project context. Key query patterns:

```typescript
// Get all active families registered for a project
function getProjectRegisteredFamilies(projectId: string): IProjectFamilyRegistration[]

// Get the active configuration version for a family
function getActiveFamilyConfig(projectId: string, familyKey: string): IProjectFamilyConfigVersion | null

// Get the run ledger for a project (with optional filters)
function getRunLedger(
  projectId: string,
  filters?: {
    familyKey?: string;
    runType?: ReportRunType;
    status?: ReportRunStatus;
    fromDate?: string;
    toDate?: string;
  }
): IReportRunRecord[]

// Get effective policy for a project-family combination
function getEffectiveFamilyPolicy(projectId: string, familyKey: string): IReportFamilyPolicy

// Get all snapshot refs for a run (immutable)
function getRunSnapshotRefs(runId: string): ISnapshotRef[]
```

---

## 4. Validation Rules (Contract-Level)

| Field | Rule |
|-------|------|
| `familyKey` | Must match a registered family in the report-definition registry |
| `projectId` | Must exist in P3-A1 project registry |
| `configVersionId` | Must reference an active configuration version for the project-family |
| `snapshotRefs` | All required source modules per family definition must have snapshot refs at generation time |
| `selectedReleaseClass` | Must be within `allowedReleaseClasses` for the family per effective policy |
| `selectedAudienceClasses` | Must be within `allowedAudienceClasses` for the family; audience class changes require PE approval |
| `generatedByUPN` | Valid UPN; must have PM role for standard runs, PER role for reviewer-generated runs |
| `approvedByUPN` | Valid PE UPN; only PE may approve PX Review runs |
| `releasedByUPN` | Valid UPN with release authority per effective `perReleaseAuthority` |
| `releaseClass` | Must match `selectedReleaseClass` from active config; PE must approve external-facing class changes |
| Narrative fields | Text only; no data binding markup; no formula syntax |
| Score fields (sub-scorecard) | Must be 1–5 or null (N/A); sourced from P3-E10 snapshot, not Reports |
| `recommendation` (lessons-learned) | Must start with action verb; sourced from P3-E10 snapshot, not Reports |
| Configuration structural changes | Require PE re-approval before activating; `structuralChanges: true` flag triggers approval workflow |
