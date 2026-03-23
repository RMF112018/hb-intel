# P3-E9: Reports Module — Field and Data Model Specification

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E9 |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Document Type** | Module Field Specification |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-22 |
| **Primary Governing Contract** | P3-F1 |
| **Related Contracts** | P3-E1 §3.6, P3-E2 §8, P3-A3 §7, P3-D1–P3-D4, P3-H1 §18.5 |
| **Source Documents** | P3-F1 |
| **Reclassification Note** | SubScorecard and Lessons Learned were initially drafted as standalone report families in this spec. They are now reclassified as **module-generated report artifacts** owned by the Project Closeout module (P3-E10). Reports consumes snapshots from Project Closeout. See §1.4 and P3-E10 for authoritative field definitions. |

---

## Purpose

This specification defines the complete data models, field definitions, enumerations, and required workflows for the Reports module implementation in Phase 3. **Every field listed here MUST be implemented.** A developer reading this specification must have no ambiguity about what to build.

This specification is grounded in:
1. **P3-F1 (locked contract)** — the authoritative governing specification for the Reports workspace, report families, draft/snapshot model, run-ledger lifecycle, approval rules, and release governance
2. **Field-level implementation guidance** — concrete TypeScript type definitions, validation rules, calculated fields, and business logic

P3-F1 is the primary contract. This document adds concrete field-level specifications that make P3-F1 implementation-ready.

> **Reclassification note (2026-03-22):** Subcontractor Performance Scorecard and Lessons Learned were initially defined in this document as standalone report families (`sub-scorecard`, `lessons-learned`). These are now reclassified as **module-generated report artifacts** owned and managed by the **Project Closeout module** (P3-E10). The Project Closeout module owns the operational data (scorecard entries, lessons entries, aggregation dashboard). When Section 6 completion items are marked complete, Project Closeout publishes a snapshot to the Reports module, which assembles it into a release artifact. The authoritative field definitions for SubScorecard and LessonsLearned now live in **P3-E10 §3–§6**. The TypeScript interfaces and section/criteria reference that were previously defined here remain in this document for historical reference but are superseded by P3-E10 for implementation purposes.

---

## 1. Source Data Mapping

### 1.1 P3-F1 Governing Contract

P3-F1 establishes the core Reports architecture:
- Report-definition registry with family registration (§2)
- Report definitions and section definitions (§2.2–§2.3)
- Phase 3 minimum families: PX Review (§3.1) and Owner Report (§3.2)
- Draft/snapshot model with narrative overrides (§4)
- Staleness handling and thresholds (§5)
- Generation pipeline and readiness checks (§6)
- Run-ledger contract and status lifecycle (§7)
- Approval model (§8) with PER report permissions (§8.5) and reviewer-generated runs (§8.6)
- Release and distribution lifecycle (§9)
- Module snapshot consumption rules (§10)
- Central project-governance policy record (§14)
- PM↔PE internal review chain governance (§14.5)
- Spine publication requirements (§12)

**Cross-Reference Rule:** All sections below that reference P3-F1 are locked. Changes to approval authority, release rules, PER permissions, or governance model require P3-F1 amendment, not this specification.

### 1.2 Subcontractor Performance Scorecard — RECLASSIFIED

> **Reclassified.** SubScorecard data is now owned by the **Project Closeout module** (P3-E10). See P3-E10 §3.2 and §5 for the authoritative field definitions, section/criteria reference, scoring formulas, and aggregation dashboard model.

**Reports module role:** When the Project Closeout module marks Section 6.3 complete, it generates a SubScorecard snapshot and publishes it to the Reports module. Reports assembles the snapshot into a release artifact (PDF export, distribution). Reports does NOT own SubScorecard records and must not write to the Project Closeout operational ledger.

**Report family key:** `sub-scorecard` — still registered in the Reports family registry, but data source is the Closeout module snapshot.

### 1.3 Lessons Learned Report — RECLASSIFIED

> **Reclassified.** Lessons Learned data is now owned by the **Project Closeout module** (P3-E10). See P3-E10 §3.3 and §6 for the authoritative field definitions, lesson entry model, category reference, and lessons database model.

**Reports module role:** When the Project Closeout module marks Section 6.5 complete, it generates a Lessons Learned snapshot and publishes it to the Reports module. Reports assembles the snapshot into a release artifact. Reports does NOT own lesson entries and must not write to the Project Closeout operational ledger.

**Report family key:** `lessons-learned` — still registered in the Reports family registry, but data source is the Closeout module snapshot.

### 1.4 Project Closeout Module Integration

The Project Closeout module (P3-E10) is a consumer of the Reports module's release pipeline for its two closeout report artifacts. The integration contract is:

- **Source of data:** Project Closeout module (P3-E10 §12)
- **Trigger:** Section 6 completion events (6.3 = scorecard submitted; 6.5 = lessons submitted)
- **Snapshot:** Project Closeout publishes `ICloseoutReportSnapshot` to Reports at trigger time
- **Reports role:** Assembles snapshot into report run record, manages draft/approval/release lifecycle per P3-F1
- **Mutation rule:** Reports MUST NOT write back to any Closeout source-of-truth record (P3-E2 §12.3)

---

## 2. TypeScript Data Models

All interfaces defined below are **immutable once persisted** (snapshots) or **mutable during draft state** (drafts only). Explicit field comments indicate mutability and ownership.

### 2.1 Core Report Infrastructure Interfaces

#### IReportFamilyDefinition

```typescript
interface IReportFamilyDefinition {
  familyKey: string;                    // Unique family identifier (e.g., 'px-review', 'owner-report', 'sub-scorecard', 'lessons-learned')
  label: string;                        // Human-readable family name
  description: string;                  // Family purpose and audience
  requiredModuleSnapshots: string[];    // Module keys required for generation (e.g., ['financial', 'schedule'])
  approvalGated: boolean;               // Whether explicit approval is required before release (P3-F1 §8.1–§8.2)
  sections: IReportSectionDefinition[]; // Ordered section definitions
  defaultSchedule: string | null;       // Default cadence (e.g., 'monthly', null for on-demand)
  createdAt: string;                    // ISO 8601 when family was registered
  createdBy: string;                    // UPN who registered the family
}
```

**Lifecycle:** Immutable after creation. Family registry changes require system administrator approval.

#### IReportSectionDefinition

```typescript
interface IReportSectionDefinition {
  sectionKey: string;             // Unique within family (e.g., 'schedule-status', 'executive-summary')
  label: string;                  // Section heading (user-facing)
  sourceModuleKey: string;        // Module providing snapshot data (e.g., 'financial', 'schedule', 'cross-module')
  narrativeOverridable: boolean;  // Whether PM may override auto-assembled text
  order: number;                  // Display sequence
}
```

#### IReportRunRecord

```typescript
interface IReportRunRecord {
  runId: string;                              // UUID; unique run identifier
  familyKey: string;                          // Report family (e.g., 'px-review')
  projectId: string;                          // Project identity (P3-A1 registry)
  generatedAt: string;                        // ISO 8601 when generation was triggered
  generatedBy: string;                        // UPN of the triggering user (PM, PE, or PER)
  runType: 'standard' | 'reviewer-generated'; // 'standard' = PM/PE-initiated; 'reviewer-generated' = PER-initiated (P3-F1 §8.6)
  snapshotVersion: string;                    // Identifier of frozen module snapshot used
  artifactUrl: string | null;                 // URL of generated PDF (null if in progress or failed)
  status: ReportRunStatus;                    // Current status in lifecycle
  approvalMetadata: IReportApproval | null;   // Approval record (PX Review only; null for unapproved runs)
  releaseMetadata: IReportRelease | null;     // Release and distribution metadata (null until released)
  error: string | null;                       // Error message if generation failed
  internalReviewChainMetadata?: IInternalReviewChainState | null; // PM↔PE internal review chain state (P3-F1 §14.5)
}
```

**Ownership:** Reports module owns the run-ledger entry. Once created, only status transitions and metadata fields are mutable; core identifiers and snapshot reference are immutable.

#### ReportRunStatus enum

```typescript
type ReportRunStatus = 'queued' | 'generating' | 'generated' | 'approved' | 'released' | 'archived' | 'failed';
```

| Status | Meaning | Transition |
|--------|---------|-----------|
| `queued` | Generation request submitted, waiting for processing | → `generating` or `failed` |
| `generating` | PDF production in progress | → `generated` or `failed` |
| `generated` | PDF produced; awaiting approval (if gated) or release | → `approved` (gated) or `released` (ungated) or `archived` |
| `approved` | PX Review only — explicit approval received (P3-F1 §8.1) | → `released` or `archived` |
| `released` | Report released for distribution (P3-F1 §9) | → `archived` |
| `archived` | Report archived/superseded by newer run | — (terminal) |
| `failed` | Generation failed; error recorded | — (terminal) |

#### IReportApproval

```typescript
interface IReportApproval {
  approvedBy: string;       // UPN of the approver (typically Project Executive)
  approvedAt: string;       // ISO 8601 approval timestamp
  comments?: string | null; // Optional approval comments
}
```

**Lifecycle:** Created when report transitions to `approved` status. Immutable once recorded.

#### IReportRelease

```typescript
interface IReportRelease {
  releasedBy: string;              // UPN of the person who released
  releasedAt: string;              // ISO 8601 release timestamp
  distributionRecipients?: string[]; // UPNs of recipients (optional; may be determined post-release)
  distributionChannel?: string;    // Channel (e.g., 'email', 'SharePoint', 'manual')
  distributedAt?: string | null;   // When distribution completed (null if pending)
}
```

**Lifecycle:** Created when report transitions to `released` status. Distribution metadata may be updated after release.

#### IModuleSnapshot

```typescript
interface IModuleSnapshot {
  snapshotId: string;       // UUID of this snapshot
  snapshotVersion: string;  // Semantic version or timestamp identifier
  moduleKey: string;        // Source module (e.g., 'financial', 'schedule')
  projectId: string;        // Project identity
  capturedAt: string;       // ISO 8601 when snapshot was frozen at draft confirmation
  data: Record<string, any>; // Module-specific data payload (structure defined per module)
}
```

**Immutability:** Snapshots are immutable post-creation (P3-F1 §4.4, §10).

---

### 2.2 Project Governance and Policy Interfaces

#### IProjectGovernancePolicyRecord

```typescript
interface IProjectGovernancePolicyRecord {
  projectId: string;                                      // Project identity
  familyPolicies: Record<string, IReportFamilyPolicy>;   // Per-family policy overrides
  internalReviewChainConfig?: IInternalReviewChainConfig | null; // PM↔PE review chain configuration (P3-F1 §14.5)
  lastModifiedBy: string;                                // UPN of PE or Manager of OpEx
  lastModifiedAt: string;                                // ISO 8601 timestamp
}
```

**Ownership:** Project Executive (project-level) and Manager of Operational Excellence (global floor). Reports module enforces, does not own (P3-F1 §14.1–§14.2).

#### IReportFamilyPolicy

```typescript
interface IReportFamilyPolicy {
  perReleaseAuthority: 'pe-only' | 'per-permitted' | 'global'; // PER release authority for this family (P3-F1 §14.4)
  requiresInternalReviewChain: boolean;                        // Whether PM↔PE chain must complete before release
  bypassInternalReviewChainForOwnerReport?: boolean;           // Owner Report only: explicit bypass (default: false)
}
```

**Policy Hierarchy (P3-F1 §14.2–§14.3):**
- Global floor set by Manager of OpEx
- Project overlay set by Project Executive (may tighten, not loosen)
- Effective policy = project overlay merged on global floor
- Reports enforces effective policy at generation, approval, release time

#### IInternalReviewChainConfig

```typescript
interface IInternalReviewChainConfig {
  enabled: boolean;                     // Whether chain is active
  requiredApprovalLevel: 'pe' | 'both'; // PE approval required, or both PE and senior PE
  escalationPath?: string[];            // Escalation routing if PE unavailable
}
```

#### IInternalReviewChainState

```typescript
interface IInternalReviewChainState {
  status: 'pending' | 'submitted-to-pe' | 'approved-by-pe' | 'returned-for-revision' | 'complete';
  submittedBy?: string;        // UPN of PM who submitted
  submittedAt?: string;        // ISO 8601
  reviewedBy?: string;         // UPN of PE reviewer
  reviewedAt?: string;         // ISO 8601
  reviewComments?: string;     // PE's review comments
  requiresRevision?: boolean;  // If true, PM must revise and resubmit
}
```

**Blocking Rule (P3-F1 §14.5):** When `requiresInternalReviewChain: true` for PX Review, the report CANNOT move to approval or release until `status === 'complete'`. PER cannot bypass this chain.

---

### 2.3 Subcontractor Scorecard Interfaces

#### ISubScorecardReport

```typescript
interface ISubScorecardReport {
  // Header / Project & Subcontractor Information
  scorecardId: string;           // UUID of scorecard
  projectId: string;             // Project identity
  projectName: string;           // Project name
  projectNumber: string;         // Project code
  projectLocation: string;       // Project geographic location
  projectType: string;           // Project type classification
  subcontractorName: string;     // Subcontractor legal name
  tradeScope: string;            // Trade or scope of work
  contractValue: number;         // Original contract amount in USD
  finalCost: number;             // Final cost in USD
  scheduledCompletion: string;   // ISO 8601 scheduled completion date
  actualCompletion: string;      // ISO 8601 actual completion date
  evaluatorName: string;         // Evaluator full name
  evaluatorTitle: string;        // Evaluator job title
  evaluationDate: string;        // ISO 8601 when evaluation was completed

  // Scoring Results (6 weighted sections)
  sections: ISubScorecardSection[]; // Array of 6 section scores
  safetyScore: number;               // Section average: Safety & Compliance (20% weight)
  qualityScore: number;              // Section average: Quality of Work (20% weight)
  scheduleScore: number;             // Section average: Schedule Performance (20% weight)
  costMgmtScore: number;             // Section average: Cost Management (15% weight)
  communicationScore: number;        // Section average: Communication & Management (15% weight)
  workforceScore: number;            // Section average: Workforce & Labor (10% weight)

  // Weighted Overall Score Calculation
  overallWeightedScore: number;  // Calculated: (safetyScore × 0.20) + (qualityScore × 0.20) + (scheduleScore × 0.20) + (costMgmtScore × 0.15) + (communicationScore × 0.15) + (workforceScore × 0.10)
  performanceRating: 'Exceptional' | 'Above Average' | 'Satisfactory' | 'Below Average' | 'Unsatisfactory'; // Derived from overallWeightedScore

  // Narrative Fields
  keyStrengths: string;             // What subcontractor did exceptionally well
  areasForImprovement: string;      // What must improve before future engagement
  notableIncidentsOrIssues: string; // Safety, quality, financial, personnel issues
  reBidRecommendation: 'Yes' | 'Yes with conditions' | 'No'; // Re-bid eligibility
  overallNarrativeSummary: string;  // Executive summary of evaluation

  // Metadata
  createdAt: string;  // ISO 8601 when scorecard was created
  createdBy: string;  // UPN of evaluator
  isActive: boolean;  // Logical deletion flag
}
```

**Scoring Formula:**
- Each section score = average of criteria scores within that section (N/A items excluded)
- `overallWeightedScore` = weighted average per formula above
- `performanceRating` mapping (P3-F1 data source):
  - `Exceptional`: 4.5–5.0
  - `Above Average`: 3.5–4.4
  - `Satisfactory`: 2.5–3.4
  - `Below Average`: 1.5–2.4
  - `Unsatisfactory`: 1.0–1.4

#### ISubScorecardSection

```typescript
interface ISubScorecardSection {
  sectionKey: string;                     // Unique within scorecard (e.g., 'safety-compliance')
  sectionLabel: string;                   // Display name
  sectionWeight: number;                  // Decimal 0–1 (e.g., 0.20 for 20%)
  criteria: ISubScorecardCriterion[];     // Ordered array of criteria for this section
  sectionScore: number;                   // Calculated average of criteria scores (N/A excluded)
}
```

#### ISubScorecardCriterion

```typescript
interface ISubScorecardCriterion {
  criterionNumber: number;        // Sequential within section (1–5 typically)
  criterionLabel: string;         // Criterion description (e.g., "Adherence to site safety plan...")
  score: number;                  // Evaluator score: 1–5 or null (N/A)
  weight: number;                 // Item weight within section (e.g., 0.20 for 20%)
  evidence: string;               // Evidence cited (e.g., "Incidents, near-misses, safety observations")
  evaluatorNotes?: string;        // Optional detailed notes for this criterion
}
```

**Scoring Scale:**
- **5** – Exceptional: Significantly exceeded expectations; set a standard for excellence
- **4** – Above Average: Exceeded expectations in most areas; minor issues resolved quickly
- **3** – Satisfactory: Met expectations; performance was acceptable and within contract scope
- **2** – Below Average: Partially met expectations; recurring issues required GC intervention
- **1** – Unsatisfactory: Failed to meet expectations; serious deficiencies; may not re-bid
- **null** – N/A: Criterion not applicable to this project/subcontractor

#### ISubScorecardAggregationRow

Database aggregation row for organizational subcontractor dashboard (separate from the scored report itself).

```typescript
interface ISubScorecardAggregationRow {
  aggregationId: string;         // UUID of this aggregation row
  scorecardId: string;           // FK to ISubScorecardReport
  subcontractorName: string;     // For dashboard grouping
  tradeScope: string;            // For dashboard filtering
  projectName: string;           // Context
  projectNumber: string;         // Context
  evaluationDate: string;        // ISO 8601
  contractValue: number;         // Original contract value
  safetyScore: number;           // From scorecard
  qualityScore: number;          // From scorecard
  scheduleScore: number;         // From scorecard
  costMgmtScore: number;         // From scorecard
  communicationScore: number;    // From scorecard
  workforceScore: number;        // From scorecard
  overallWeightedScore: number;  // From scorecard
  ratingBand: string;            // 'Exceptional' | 'Above Average' | 'Satisfactory' | 'Below Average' | 'Unsatisfactory'
  aggregatedAt: string;          // ISO 8601 when row was created
}
```

---

### 2.4 Lessons Learned Report Interfaces

#### ILessonsLearnedReport

```typescript
interface ILessonsLearnedReport {
  // Project Identification (Section 1)
  reportId: string;                  // UUID of lessons-learned report
  projectId: string;                 // Project identity
  projectName: string;               // Project name
  projectNumber: string;             // Project code
  projectLocation: string;           // Project geographic location
  projectType: string;               // Project type classification
  originalContractValue: number;     // Contract value at award (USD)
  finalContractValue: number;        // Final contract value (USD)
  contractVariance: number;          // Calculated: finalContractValue - originalContractValue
  scheduledCompletion: string;       // ISO 8601 scheduled completion date
  actualCompletion: string;          // ISO 8601 actual completion date
  daysVariance: number;              // Calculated: days(actualCompletion - scheduledCompletion); negative = early
  projectManager: string;            // PM name
  superintendent: string;            // Superintendent name
  projectExecutive: string;          // PE name
  reportPreparedBy: string;          // UPN of person preparing report
  reportDate: string;                // ISO 8601 when report was prepared

  // Project Classifications (Section 2)
  deliveryMethod: 'Design-Bid-Build' | 'Design-Build' | 'CM at Risk' | 'GMP' | 'Lump Sum' | 'IDIQ/Job Order' | 'Public-Private (P3)';
  marketSector: 'K-12 Education' | 'Higher Education' | 'Healthcare/Medical' | 'Government/Civic' | 'Office/Commercial' | 'Industrial/Mfg' | 'Retail/Hospitality' | 'Residential/Mixed-Use' | 'Transportation/Infra' | 'Data Center/Tech' | 'Mission Critical' | 'Renovation/Historic' | 'Other';
  projectSizeBand: 'Under $1M' | '$1M–$5M' | '$5M–$15M' | '$15M–$50M' | '$50M–$100M' | 'Over $100M';
  complexityRating: 1 | 2 | 3 | 4 | 5; // 1=Straightforward, 5=Exceptional

  // Lesson Entries (Section 3)
  lessons: ILessonEntry[]; // Array of individual lessons (up to N per report)

  // Metadata
  createdAt: string;  // ISO 8601 when report was created
  createdBy: string;  // UPN of preparer
  isActive: boolean;  // Logical deletion flag
}
```

#### ILessonEntry

```typescript
interface ILessonEntry {
  lessonId: string;                // UUID of this lesson entry
  reportId: string;                // FK to ILessonsLearnedReport
  lessonNumber: number;            // Sequential within report (1, 2, 3, ...)
  category: LessonCategory;        // Category enum
  phaseEncountered: string;        // Project phase when lesson occurred (free text)
  applicability: number;           // Applicability rating: 1–5 (1=rarely, 5=always applicable)
  keywords: string[];              // Tags for searchability (parsed from comma-separated input)
  situation: string;               // What happened: when, who, what triggered it
  impact: string;                  // Consequences (quantified where possible: $, days, hours)
  impactMagnitude: 'Minor' | 'Moderate' | 'Significant' | 'Critical'; // Categorized per thresholds (§9)
  rootCause: string;               // Underlying cause explanation
  response: string;                // Corrective/mitigation actions taken on this project
  recommendation: string;          // What future teams should do differently (starts with action verb)
  supportingDocuments: string;     // RFI numbers, CO numbers, file paths, schedule snapshots (comma-separated)
  createdAt: string;               // ISO 8601 when lesson was entered
  createdBy: string;               // UPN of entry author
}
```

#### LessonCategory enum

```typescript
type LessonCategory =
  | 'PRE-CONSTRUCTION'
  | 'ESTIMATING & BID'
  | 'PROCUREMENT'
  | 'SCHEDULE'
  | 'COST/BUDGET'
  | 'SAFETY'
  | 'QUALITY'
  | 'SUBCONTRACTORS'
  | 'DESIGN/RFIs'
  | 'OWNER/CLIENT'
  | 'TECHNOLOGY/BIM'
  | 'WORKFORCE/LABOR'
  | 'COMMISSIONING'
  | 'CLOSEOUT/TURNOVER'
  | 'OTHER';
```

#### ILessonsLearnedAggregationRow

Database aggregation row for organizational lessons database (separate from the full report).

```typescript
interface ILessonsLearnedAggregationRow {
  aggregationId: string;        // UUID of this aggregation row
  reportId: string;             // FK to ILessonsLearnedReport
  lessonId: string;             // FK to ILessonEntry
  projectName: string;          // Context
  projectNumber: string;        // Context
  marketSector: string;         // For filtering/analysis
  deliveryMethod: string;       // For filtering/analysis
  projectSize: string;          // For filtering/analysis
  reportDate: string;           // ISO 8601
  lessonNumber: number;         // Sequence
  category: string;             // Lesson category
  situation: string;            // What happened
  rootCause: string;            // Root cause
  recommendation: string;       // Recommendation
  keywords: string[];           // Tags for search
  impactMagnitude: string;      // Minor | Moderate | Significant | Critical
  applicability: number;        // 1–5
  aggregatedAt: string;         // ISO 8601 when row was created
}
```

---

## 3. Field Specification Tables

### 3.1 Report Run Record Fields

| Field | Type | Required | Mutable | Source | Validation / Formula |
|-------|------|----------|---------|--------|---------------------|
| `runId` | `string` (UUID) | Yes | No | Generated | Generated at run creation; unique within project |
| `familyKey` | `string` | Yes | No | Input | Must match a registered family in report-definition registry |
| `projectId` | `string` | Yes | No | Input | FK to project; must exist in P3-A1 registry |
| `generatedAt` | `string` (ISO 8601) | Yes | No | Generated | Timestamp when generation was triggered |
| `generatedBy` | `string` (UPN) | Yes | No | Context | Identity of triggering user (PM, PE, or PER) |
| `runType` | `enum` | Yes | No | Input | `'standard'` (PM/PE-initiated) or `'reviewer-generated'` (PER-initiated); P3-F1 §8.6 |
| `snapshotVersion` | `string` | Yes | No | Input | Version identifier of frozen module snapshot; immutable reference |
| `artifactUrl` | `string \| null` | Yes | Yes | Generated | URL of PDF artifact; null until generation completes |
| `status` | `ReportRunStatus` | Yes | Yes | State | Lifecycle status; transitions only (P3-F1 §7.2–§7.3) |
| `approvalMetadata` | `IReportApproval \| null` | No | Yes | Generated | Populated when run transitions to `approved` status (PX Review only) |
| `releaseMetadata` | `IReportRelease \| null` | No | Yes | Generated | Populated when run transitions to `released` status |
| `error` | `string \| null` | No | No | Generated | Error message if generation failed; null on success |
| `internalReviewChainMetadata` | `IInternalReviewChainState \| null` | No | Yes | State | PM↔PE internal review chain state (P3-F1 §14.5); null if chain not required |

### 3.2 Subcontractor Scorecard — Header Fields

| Field | Type | Required | Source | Validation |
|-------|------|----------|--------|-----------|
| `scorecardId` | `string` (UUID) | Yes | Generated | Generated at scorecard creation |
| `projectId` | `string` | Yes | Input | FK to project; must exist in P3-A1 registry |
| `projectName` | `string` | Yes | Input | Non-empty; matches project record |
| `projectNumber` | `string` | Yes | Input | Non-empty; matches project code |
| `projectLocation` | `string` | Yes | Input | Non-empty; geographic identifier |
| `projectType` | `string` | Yes | Input | Non-empty; e.g., "Commercial Office", "K-12 School" |
| `subcontractorName` | `string` | Yes | Input | Non-empty; legal business name |
| `tradeScope` | `string` | Yes | Input | Non-empty; e.g., "Structural Steel", "HVAC" |
| `contractValue` | `number` | Yes | Input | Positive decimal; USD; 2 decimal places |
| `finalCost` | `number` | Yes | Input | Positive decimal; USD; 2 decimal places; may be ≠ contractValue |
| `scheduledCompletion` | `string` (ISO 8601) | Yes | Input | Valid date; prior or equal to evaluationDate |
| `actualCompletion` | `string` (ISO 8601) | Yes | Input | Valid date; prior or equal to evaluationDate |
| `evaluatorName` | `string` | Yes | Input | Non-empty; evaluator full name |
| `evaluatorTitle` | `string` | Yes | Input | Non-empty; evaluator job title |
| `evaluationDate` | `string` (ISO 8601) | Yes | Input | Valid date; typically at project closeout |

### 3.3 Lessons Learned Report — Project Identification Fields

| Field | Type | Required | Source | Validation |
|-------|------|----------|--------|-----------|
| `reportId` | `string` (UUID) | Yes | Generated | Generated at report creation |
| `projectId` | `string` | Yes | Input | FK to project; must exist in P3-A1 registry |
| `projectName` | `string` | Yes | Input | Non-empty; matches project record |
| `projectNumber` | `string` | Yes | Input | Non-empty; project code |
| `projectLocation` | `string` | Yes | Input | Non-empty; geographic identifier |
| `projectType` | `string` | Yes | Input | Non-empty; project classification |
| `originalContractValue` | `number` | Yes | Input | Positive decimal; USD; 2 decimal places |
| `finalContractValue` | `number` | Yes | Input | Positive decimal; USD; 2 decimal places |
| `contractVariance` | `number` | Yes | Calculated | `finalContractValue - originalContractValue`; may be positive or negative |
| `scheduledCompletion` | `string` (ISO 8601) | Yes | Input | Valid date |
| `actualCompletion` | `string` (ISO 8601) | Yes | Input | Valid date; typically ≥ scheduled |
| `daysVariance` | `number` | Yes | Calculated | `days(actualCompletion - scheduledCompletion)`; negative = early, positive = late |
| `projectManager` | `string` | Yes | Input | Non-empty; PM name |
| `superintendent` | `string` | Yes | Input | Non-empty; superintendent name |
| `projectExecutive` | `string` | Yes | Input | Non-empty; PE name |
| `reportPreparedBy` | `string` (UPN) | Yes | Input | Valid UPN format |
| `reportDate` | `string` (ISO 8601) | Yes | Input | Valid date; typically at project closeout |

---

## 4. Enum Definitions

### 4.1 ReportRunStatus

```typescript
type ReportRunStatus = 'queued' | 'generating' | 'generated' | 'approved' | 'released' | 'archived' | 'failed';
```

| Status | Meaning | Triggered by |
|--------|---------|--------------|
| `queued` | Request queued for processing | User initiates generation |
| `generating` | PDF production in progress | Async job started |
| `generated` | PDF produced successfully; awaiting approval or release | Job completed |
| `approved` | Explicit approval received (PX Review only) | PE or approver approves |
| `released` | Released for distribution | Release action triggered |
| `archived` | Archived/superseded | Archival action or newer run published |
| `failed` | Generation failed; error recorded | Job failed with exception |

### 4.2 ReportFamilyKey

```typescript
type ReportFamilyKey = 'px-review' | 'owner-report' | 'sub-scorecard' | 'lessons-learned';
```

| Family | Purpose | Approval Gated | Closeout Only |
|--------|---------|----------------|---------------|
| `px-review` | Internal project review (PM + PE) | Yes (P3-F1 §8.1) | No |
| `owner-report` | External owner-facing status | No (P3-F1 §8.2) | No |
| `sub-scorecard` | Subcontractor performance evaluation | No | **Yes** |
| `lessons-learned` | Project lessons and recommendations | No | **Yes** |

### 4.3 LessonCategory

See §2.4 above. 15 categories plus 'OTHER'.

### 4.4 ImpactMagnitude Thresholds

```typescript
type ImpactMagnitude = 'Minor' | 'Moderate' | 'Significant' | 'Critical';
```

| Category | Dollar Threshold | Schedule Threshold | Other Threshold |
|----------|------------------|--------------------|-----------------|
| Minor | < $10,000 | < 2 days | — |
| Moderate | $10,000–$50,000 | 2–10 days | — |
| Significant | $50,000–$200,000 | 10–30 days | — |
| Critical | > $200,000 | > 30 days | Safety: fatality / serious injury; or schedule: > 90 days |

**Note:** Use the threshold that applies to the impact domain (financial, schedule, safety). A lesson may be categorized by any applicable domain.

---

## 5. Report Family Definitions (P3-F1 Governance)

### 5.1 PX Review Family

**Family Key:** `px-review`

**Governance:** P3-F1 §3.1

| Property | Value |
|----------|-------|
| **Purpose** | Internal project review package prepared by PM and Project Executive |
| **Approval** | **Gated** — requires explicit approval before release (P3-F1 §8.1) |
| **Audience** | Internal project team, executive review |
| **Schedule** | Monthly (default) |
| **Required Module Snapshots** | Financial, Schedule, Safety, Constraints, Permits, Health |

**Sections (all narrativeOverridable: true):**

| Order | Section Key | Label | Source Module | Notes |
|-------|-------------|-------|---------------|-------|
| 1 | `schedule-status` | Schedule Status | schedule | Live schedule snapshot; PM narrative describes variance and recovery actions |
| 2 | `financial-status` | Financial Status | financial | Live forecast snapshot; PM narrative explains trends and exposure |
| 3 | `safety` | Safety | safety | Live safety metrics; PM narrative describes incidents and corrective actions |
| 4 | `buyout-status` | Buyout Status | financial (buyout) | Procurement status snapshot; PM narrative on critical buyout risks |
| 5 | `constraints-delays` | Constraints & Delays | constraints | Open/overdue constraint counts; PM narrative on delay impacts |
| 6 | `executive-summary` | Executive Summary | cross-module (PM-authored) | PM-authored summary of key project status; fully narrative-driven |
| 7 | `look-ahead` | Look Ahead | cross-module (PM-authored) | PM-authored forward look and near-term priorities; fully narrative-driven |

---

### 5.2 Owner Report Family

**Family Key:** `owner-report`

**Governance:** P3-F1 §3.2

| Property | Value |
|----------|-------|
| **Purpose** | External owner-facing project status report |
| **Approval** | **Not gated** — governed run/export/release without explicit approval step (P3-F1 §8.2) |
| **Audience** | Project owner, external stakeholders |
| **Schedule** | Monthly (default) |
| **Required Module Snapshots** | Financial, Schedule, Safety, Constraints, Health |

**Sections (all narrativeOverridable: true):**

| Order | Section Key | Label | Source Module | Notes |
|-------|-------------|-------|---------------|-------|
| 1 | `project-overview` | Project Overview | cross-module | PM-authored introduction; project status at a glance |
| 2 | `schedule-summary` | Schedule Summary | schedule | Schedule snapshot; PM narrative on progress and projections |
| 3 | `financial-summary` | Financial Summary | financial | Financial snapshot; PM narrative on cost performance |
| 4 | `safety-summary` | Safety Summary | safety | Safety metrics; PM narrative on safety performance |
| 5 | `issues-risks` | Key Issues & Risks | constraints + health | Open issues and health dimension scores; PM narrative on mitigation |
| 6 | `look-ahead` | Look Ahead | cross-module (PM-authored) | PM-authored forward look and upcoming milestones |

---

### 5.3 Subcontractor Scorecard Family

**Family Key:** `sub-scorecard`

**Governance:** New family defined in this specification; aligns with P3-F1 extensibility (§2.2–§2.4)

| Property | Value |
|----------|-------|
| **Purpose** | Closeout-only subcontractor performance evaluation |
| **Approval** | Not gated (PE review recommended but not enforced) |
| **Audience** | Project team, subcontractor management, organizational procurement database |
| **Schedule** | On-demand (generated at project closeout per subcontractor) |
| **Report Type** | Structured scoring report (not module-snapshot driven) |
| **Data Source** | Direct form input (not consumed from another module) |

**Sections:** See §6 for complete section specification.

---

### 5.4 Lessons Learned Family

**Family Key:** `lessons-learned`

**Governance:** New family defined in this specification; aligns with P3-F1 extensibility (§2.2–§2.4)

| Property | Value |
|----------|-------|
| **Purpose** | Closeout-only lessons and recommendations documentation |
| **Approval** | Not gated (PE review recommended but not enforced) |
| **Audience** | Project team, organizational lessons database, future project teams |
| **Schedule** | On-demand (generated at project closeout) |
| **Report Type** | Structured multi-entry form (not module-snapshot driven) |
| **Data Source** | Direct form input (not consumed from another module) |

**Structure:** Project classification metadata + N individual lesson entries.

---

## 6. Subcontractor Scorecard — Complete Section Reference

### 6.1 Safety & Compliance (Weight: 20%)

**Section Key:** `safety-compliance`

Five criteria, each weighted 20% within section. All 5 criteria are expected; N/A designation permitted only if scope genuinely does not apply.

| # | Criterion Label | Evidence Basis | Score Range |
|---|-----------------|-----------------|-------------|
| 1 | Adherence to site safety plan and OSHA standards | Incidents, near-misses, safety observations, audit records | 1–5 or N/A |
| 2 | PPE compliance and toolbox-talk participation | Attendance records, field observations, training logs | 1–5 or N/A |
| 3 | Housekeeping and site cleanliness | Daily clean assessments, lay-down area inspection, debris removal timeliness | 1–5 or N/A |
| 4 | Incident/injury rate on this project | TRIR (Total Recordable Incident Rate), recordable incidents, first-aid events | 1–5 or N/A |
| 5 | Corrective action response to safety issues | Time to close NCRs (Nonconformance Reports) and safety violations | 1–5 or N/A |

---

### 6.2 Quality of Work (Weight: 20%)

**Section Key:** `quality-work`

Five criteria, each weighted 20% within section.

| # | Criterion Label | Evidence Basis | Score Range |
|---|-----------------|-----------------|-------------|
| 1 | Workmanship quality and craftsmanship | Punch list density, rework required, visual inspections | 1–5 or N/A |
| 2 | Compliance with plans, specs & submittals | RFI clarity and compliance, revision tracking, submittal approvals | 1–5 or N/A |
| 3 | First-time inspection pass rate | AHJ (Authority Having Jurisdiction) / third-party inspection results; % pass on first try | 1–5 or N/A |
| 4 | Materials and equipment quality | Substitutions vs. spec, as-specified compliance, supply chain quality | 1–5 or N/A |
| 5 | Closeout documentation completeness | O&Ms (Operations & Maintenance manuals), warranties, as-builts, attic stock, spare parts | 1–5 or N/A |

---

### 6.3 Schedule Performance (Weight: 20%)

**Section Key:** `schedule-performance`

Five criteria, each weighted 20% within section.

| # | Criterion Label | Evidence Basis | Score Range |
|---|-----------------|-----------------|-------------|
| 1 | On-time mobilization | Actual vs. planned start date; days variance | 1–5 or N/A |
| 2 | 3-week look-ahead participation & reliability | % commitments kept on Last Planner / pull plan; responsiveness to scheduling meetings | 1–5 or N/A |
| 3 | Progress relative to baseline schedule | Float consumption, milestone compliance vs. baseline, schedule trending | 1–5 or N/A |
| 4 | Recovery effort when behind schedule | Added crew size, extended hours, phasing coordination, acceleration actions | 1–5 or N/A |
| 5 | Coordination with other trades | BIM coordination, pre-construction coordination meetings, conflict resolution | 1–5 or N/A |

---

### 6.4 Cost Management (Weight: 15%)

**Section Key:** `cost-management`

Five criteria, each weighted 20% within section.

| # | Criterion Label | Evidence Basis | Score Range |
|---|-----------------|-----------------|-------------|
| 1 | Budget adherence (no unwarranted overruns) | Change order volume vs. scope growth, cost trending | 1–5 or N/A |
| 2 | Change order pricing accuracy & timeliness | Days to submit COs, fair-market pricing validation, audit trail | 1–5 or N/A |
| 3 | Back-charge exposure created | Back-charges assessed by GC for errors, rework, or negligence | 1–5 or N/A |
| 4 | Material procurement & financial stability | Supply stoppages due to unpaid invoices, payment history, credit | 1–5 or N/A |
| 5 | Billing accuracy and schedule of values quality | Overbilling incidents, retainage disputes, invoice accuracy rate | 1–5 or N/A |

---

### 6.5 Communication & Management (Weight: 15%)

**Section Key:** `communication-management`

Five criteria, each weighted 20% within section.

| # | Criterion Label | Evidence Basis | Score Range |
|---|-----------------|-----------------|-------------|
| 1 | Responsiveness to RFIs, emails, and calls | Average response time, dropped/unanswered items, communication log audit | 1–5 or N/A |
| 2 | Quality of superintendent / foreman leadership | Decision authority, problem ownership, crew respect and morale | 1–5 or N/A |
| 3 | Submittals: accuracy, completeness, timeliness | Resubmittal rate (low = better), lead times met, deficiency frequency | 1–5 or N/A |
| 4 | Participation in OAC and coordination meetings | Meeting attendance %, action item closure rate, engaged decision-making | 1–5 or N/A |
| 5 | Issue escalation and conflict resolution | Transparent communication vs. avoidance, escalation path clarity, speed of resolution | 1–5 or N/A |

---

### 6.6 Workforce & Labor (Weight: 10%)

**Section Key:** `workforce-labor`

Four criteria, each weighted 25% within section (note: fewer criteria due to 10% section weight).

| # | Criterion Label | Evidence Basis | Score Range |
|---|-----------------|-----------------|-------------|
| 1 | Adequate and consistent crew staffing | Planned vs. actual headcount; vacancy/churn impact on schedule | 1–5 or N/A |
| 2 | Workforce skill level and supervision ratio | Journeyman/apprentice mix, field leadership bench, supervision depth | 1–5 or N/A |
| 3 | Compliance with labor requirements | MBE/DBE compliance, prevailing wage adherence, union rules if applicable | 1–5 or N/A |
| 4 | Subcontractor to sub-tier management | Sub-tier oversight, insurance and bonding compliance, payment chain | 1–5 or N/A |

---

## 7. Lessons Learned — Complete Category and Classification Reference

### 7.1 Project Classification Fields

Lessons Learned reports include structured project metadata for organizational aggregation and filtering.

**Delivery Method enum:**
- Design-Bid-Build
- Design-Build
- CM at Risk
- GMP (Guaranteed Maximum Price)
- Lump Sum
- IDIQ/Job Order (Indefinite Delivery/Indefinite Quantity)
- Public-Private (P3)

**Market Sector enum:**
- K-12 Education
- Higher Education
- Healthcare/Medical
- Government/Civic
- Office/Commercial
- Industrial/Manufacturing
- Retail/Hospitality
- Residential/Mixed-Use
- Transportation/Infrastructure
- Data Center/Technology
- Mission Critical
- Renovation/Historic Preservation
- Other

**Project Size Band enum:**
- Under $1M
- $1M–$5M
- $5M–$15M
- $15M–$50M
- $50M–$100M
- Over $100M

**Complexity Rating:** 1 (Straightforward) | 2 (Moderate) | 3 (Complex) | 4 (Highly Complex) | 5 (Exceptional)

---

### 7.2 Lesson Category Reference

All 15 defined categories plus 'OTHER':

| Category | Description | Typical Topics |
|----------|-------------|-----------------|
| PRE-CONSTRUCTION | Pre-bid, proposal, kickoff, mobilization | Scope definition, team assembly, site logistics, owner coordination |
| ESTIMATING & BID | Estimating process, bid preparation, pricing | Estimate accuracy, bid strategy, margin assumptions, contingency |
| PROCUREMENT | Supplier selection, purchase orders, vendor management | Lead times, supplier performance, procurement authority, spec clarity |
| SCHEDULE | Schedule development, baseline, updates, variance | Critical path, logic, sequencing, recovery, milestone tracking |
| COST/BUDGET | Budgeting, forecast, change control, financial reporting | Forecast accuracy, cost trending, budget authority, CO process |
| SAFETY | Safety planning, incidents, compliance, culture | OSHA, near-miss reporting, safety engagement, incident investigation |
| QUALITY | Quality assurance, inspections, testing, standards | First-pass quality, rework, punch list, inspection protocols |
| SUBCONTRACTORS | Sub selection, coordination, performance, payment | Sub qualification, insurance, payment chain, performance management |
| DESIGN/RFIs | Design clarity, RFI process, change management | Ambiguous specs, RFI response time, design changes, constructability |
| OWNER/CLIENT | Owner relations, communication, decisions, satisfaction | Owner responsiveness, decision-making speed, scope changes, alignment |
| TECHNOLOGY/BIM | BIM coordination, modeling, clash detection, tech tools | BIM maturity, coordination workflows, clash resolution, 3D workflow |
| WORKFORCE/LABOR | Crew management, apprentices, unions, training | Crew continuity, union compliance, prevailing wage, apprenticeship |
| COMMISSIONING | Startup, testing, turnover, training | Commissioning readiness, testing plans, training delivery, manuals |
| CLOSEOUT/TURNOVER | Final documentation, warranties, O&Ms, punch list | As-built drawings, warranty registration, O&M manuals, final walkthrough |
| OTHER | Lessons that do not fit other categories | (free-text category may be specified) |

---

## 8. Scoring Formulas (Subcontractor Scorecard)

### 8.1 Section Average Calculation

For each of the six sections, calculate the section average:

```
sectionScore = Σ(criterionScore × criterionWeight) / Σ(criterionWeight)
              where N/A items are EXCLUDED from both numerator and denominator
```

Example (Safety & Compliance, all 5 criteria scored, each 20% weight):
- Criterion 1: score 5, weight 0.20
- Criterion 2: score 4, weight 0.20
- Criterion 3: score 4, weight 0.20
- Criterion 4: score 5, weight 0.20
- Criterion 5: score N/A (excluded)

```
safetyScore = (5 × 0.20 + 4 × 0.20 + 4 × 0.20 + 5 × 0.20) / (0.20 + 0.20 + 0.20 + 0.20)
            = (1.0 + 0.8 + 0.8 + 1.0) / 0.8
            = 3.6 / 0.8
            = 4.5
```

### 8.2 Overall Weighted Score Calculation

```
overallWeightedScore = (safetyScore × 0.20)
                     + (qualityScore × 0.20)
                     + (scheduleScore × 0.20)
                     + (costMgmtScore × 0.15)
                     + (communicationScore × 0.15)
                     + (workforceScore × 0.10)
```

All six section scores are included; no N/A sections (all sections must have at least one scored criterion).

### 8.3 Performance Rating Derivation

Map `overallWeightedScore` to `performanceRating`:

| Score Range | Rating |
|-------------|--------|
| 4.5–5.0 | Exceptional |
| 3.5–4.4 | Above Average |
| 2.5–3.4 | Satisfactory |
| 1.5–2.4 | Below Average |
| 1.0–1.4 | Unsatisfactory |

---

## 9. Business Rules

### 9.1 Report Family Registry

1. The report-definition registry is the single source of truth for report families and their sections.
2. Phase 3 minimum: `px-review`, `owner-report`, `sub-scorecard`, `lessons-learned`.
3. Registry is extensible — new families may be added; existing family definitions are immutable post-release.
4. Each family must specify its `approvalGated` flag (P3-F1 §8.1–§8.2); this flag determines workflow.

### 9.2 Draft and Snapshot Ownership

1. Reports module owns draft state (P3-F1 §4.2).
2. Module data within a draft is read-only — PM may override narratives only (P3-F1 §11).
3. Snapshots are immutable post-creation (P3-F1 §4.4).
4. At draft confirmation, module snapshots are frozen; no refresh can modify them thereafter.

### 9.3 Staleness and Refresh

1. Draft staleness is measured from `lastRefreshedAt` timestamp.
2. Default staleness threshold: 7 days (configurable per family).
3. Stale drafts MUST show a staleness warning before export is permitted (P3-F1 §5.2).
4. Refresh preserves PM narrative overrides across snapshot updates (P3-F1 §4.3).

### 9.4 Generation Pipeline

1. Generation is asynchronous — user does not wait for PDF production.
2. Readiness check verifies all required module snapshots are available (P3-F1 §6.2).
3. Generation queues the job; system transitions status: `queued` → `generating` → `generated` (or `failed`).
4. Artifact (PDF) is stored in project's governed SharePoint document library; URL recorded in run-ledger.

### 9.5 Approval Model

1. **PX Review family (`px-review`):** Explicit approval required before release. Status: `generated` → `approved` → `released` (P3-F1 §8.1).
2. **Owner Report family (`owner-report`):** No approval gate. Status: `generated` → `released` (P3-F1 §8.2).
3. **Subcontractor Scorecard (`sub-scorecard`):** No approval gate. Status: `generated` → `released` (or can remain as generated for internal reference).
4. **Lessons Learned (`lessons-learned`):** No approval gate. Status: `generated` → `released` (or can remain as generated for organizational database).

### 9.6 Reviewer-Generated Runs

1. **Initiated by:** Portfolio Executive Reviewer (PER) only (P3-F1 §8.6).
2. **Snapshot source:** MUST use the latest already-confirmed PM-owned snapshot. PER cannot initiate new confirmation; no unconfirmed drafts accessible.
3. **Run type tag:** Recorded as `runType: 'reviewer-generated'` in run-ledger. The `generatedBy` field captures PER identity.
4. **No bypass:** Reviewer-generated run does NOT bypass, replace, or modify PM's draft state, PM narrative, or PM's run history.
5. **Annotation attachment:** May carry attached field-annotations artifact as review layer (P3-E2 §8.4).

### 9.7 Central Project-Governance Policy Record

1. **Ownership:** Manager of Operational Excellence (global floor) and Project Executive (project-level overlay) (P3-F1 §14.1).
2. **Policy hierarchy:** Global floor → Project overlay merged = Effective policy (P3-F1 §14.2–§14.3).
3. **PE constraint:** PE may tighten project-level policy; may NOT loosen or override global floor.
4. **Reports as enforcer:** Reports module reads and enforces effective policy; does not own it (P3-F1 §14.6).
5. **PER release authority:** Governed by `perReleaseAuthority` field per report family. Values: `'pe-only'` | `'per-permitted'` | `'global'` (P3-F1 §14.4).

### 9.8 PM↔PE Internal Review Chain

1. **Configuration:** Enabled via `requiresInternalReviewChain: true` in project-governance policy record (P3-F1 §14.5).
2. **Chain behavior:** PM submits report run to PE for review → PE approves or returns for revision → chain marked complete.
3. **Blocking rule:** When enabled for PX Review, the report CANNOT proceed to approval or release until chain is marked `'complete'`.
4. **PER cannot bypass:** PER has no authority over the chain; chain is PM/PE-owned exclusively.
5. **Owner Report bypass:** Owner Report MAY bypass chain ONLY when `bypassInternalReviewChainForOwnerReport: true` is explicitly set (default: `false`).

### 9.9 Subcontractor Scorecard — Closeout Specific

1. Generated at project closeout per subcontractor.
2. Section scores calculate average of criteria scores; N/A items excluded.
3. Overall weighted score is calculated per §8.2.
4. Performance rating is derived per §8.3.
5. Aggregation dashboard rows are created separately for organizational database (not part of the scorecard report itself).
6. Narrative fields (key strengths, areas for improvement, re-bid recommendation) are required; enable capture of qualitative context.

### 9.10 Lessons Learned — Closeout Specific

1. Generated at project closeout; captures lessons encountered across project phases.
2. Each lesson entry is individually categorized per LessonCategory enum.
3. `impactMagnitude` is categorized per thresholds defined in §4.4 (financial, schedule, or other domain).
4. Keywords are parsed from comma-separated input; enable searchability in organizational lessons database.
5. Recommendation field must start with action verb and name owner and project phase.
6. Aggregation database rows are created separately for organizational lessons database.

### 9.11 Spine Publication

1. **Activity spine:** `reports.draft-refreshed` (routine), `reports.approved` (notable, PX Review), `reports.released` (notable), `reports.stale-warning` (notable) (P3-F1 §12.1).
2. **Health spine:** "Report currency" metric (Office dimension) tracking days since last approved report (P3-F1 §12.2).
3. **Work Queue spine:** "Report draft stale", "Report approval pending", "Report distribution pending" (P3-F1 §12.3).
4. **Related Items spine:** `report-run` → `module-snapshot` references relationship (P3-F1 §12.4).

---

## 10. Data Validation Rules

### 10.1 General Validation

| Field | Rule | Error Message |
|-------|------|---------------|
| `projectId` | Must exist in P3-A1 project registry | "Project ID not found in registry" |
| `familyKey` | Must match registered report family | "Report family not found in registry" |
| `snapshotVersion` | Must identify an existing snapshot | "Snapshot version not found" |
| `generatedBy` | Must be valid UPN | "Invalid user principal name" |
| UPN fields (approvedBy, releasedBy, etc.) | Valid UPN format | "Invalid UPN format" |
| ISO 8601 dates | Valid date format | "Invalid date format; expected ISO 8601" |
| Positive decimals (currency) | Must be positive; exactly 2 decimal places | "Currency must be positive with 2 decimal places" |
| Positive integers (counts) | Must be ≥ 0 | "Must be a non-negative integer" |
| Score values (1–5) | Must be 1, 2, 3, 4, 5, or null (N/A) | "Score must be 1–5 or N/A" |

### 10.2 Subcontractor Scorecard Validation

| Field | Rule | Error Message |
|-------|------|---------------|
| `contractValue` | Must be positive; ≤ finalCost is allowed (overrun) | "Contract value must be positive" |
| `finalCost` | Must be positive | "Final cost must be positive" |
| `scheduledCompletion` | Must be valid date; ≤ `evaluationDate` | "Scheduled completion must be on/before evaluation date" |
| `actualCompletion` | Must be valid date; ≤ `evaluationDate` | "Actual completion must be on/before evaluation date" |
| Section score (per section) | Must have at least 1 scored criterion (others may be N/A) | "At least one criterion must be scored in this section" |
| `overallWeightedScore` | Calculated; auto-validated after scoring | N/A |
| `performanceRating` | Derived from overallWeightedScore | N/A |

### 10.3 Lessons Learned Validation

| Field | Rule | Error Message |
|-------|------|---------------|
| `deliveryMethod` | Must match enum value | "Invalid delivery method" |
| `marketSector` | Must match enum value | "Invalid market sector" |
| `projectSizeBand` | Must match enum value | "Invalid project size band" |
| `complexityRating` | Must be 1–5 | "Complexity rating must be 1–5" |
| `category` | Must match LessonCategory enum | "Invalid lesson category" |
| `applicability` | Must be 1–5 | "Applicability must be 1–5" |
| `impactMagnitude` | Must match thresholds in §4.4 | "Impact magnitude must be Minor, Moderate, Significant, or Critical" |
| `recommendation` | Must start with action verb | "Recommendation must start with action verb (e.g., 'Establish', 'Implement', 'Document')" |
| `keywords` | May be empty or comma-separated strings | "Keywords must be comma-separated" |

---

## 11. PER Report Permissions (P3-F1 §8.5–§8.6)

### 11.1 What PER May Do

| Action | Permitted | Rules |
|--------|-----------|-------|
| View report runs (all families in scope) | **Yes** | Subject to department scope; PER sees runs for projects in governed scope only |
| Annotate report content (review layer) | **Yes** | Annotations stored in `@hbc/field-annotations` artifact; MUST NOT modify run-ledger, draft state, PM narrative |
| Generate reviewer-generated review runs | **Yes** | Only against the latest already-confirmed PM-owned snapshot; see §9.6 |
| View release status | **Yes** | Read-only access |
| Release a report family | **Project-policy governed** | Authority is per-family, governed by central project-governance policy record (§10); PER release authority set to `'per-permitted'` for authority |

### 11.2 What PER May NOT Do

| Action | Prohibited | Rule |
|--------|-----------|------|
| Confirm a PM draft | **NO** | Draft state confirmation is PM/PE-owned exclusively. PER may not initiate, approve, or modify draft confirmation. |
| Edit PM narrative | **NO** | Narrative is PM/PE-authored exclusively. PER has no authority to modify narrative content. |
| Modify run-ledger entries | **NO** | PER has no write access to the run-ledger. Reviewer-generated runs are added as new entries only. |
| Access unconfirmed PM drafts | **NO** | Reviewer-generated runs must use the latest confirmed snapshot only; in-progress or unconfirmed PM drafts are not accessible. |
| Advance or bypass PM↔PE internal review chain | **NO** | The internal review chain is PM/PE-owned; PER cannot initiate, advance, or skip it. |

---

## 12. Spine Publication Contract

### 12.1 Activity Events (P3-D1 §8.6)

Reports publishes to the Activity spine with the following event types:

```typescript
interface IActivityEvent {
  eventId: string;           // UUID
  eventType: 'reports.draft-refreshed' | 'reports.approved' | 'reports.released' | 'reports.stale-warning';
  category: 'record-change' | 'approval' | 'handoff' | 'alert';
  significance: 'routine' | 'notable';
  projectId: string;
  relatedRunId: string;      // FK to IReportRunRecord
  triggeredBy: string;       // UPN
  triggeredAt: string;       // ISO 8601
  summary: string;           // Human-readable event summary
}
```

| Event Type | Significance | Trigger |
|------------|--------------|---------|
| `reports.draft-refreshed` | routine | Draft refreshed with live module data; no approval or release |
| `reports.approved` | notable | PX Review approved by PE; transitioned to `approved` status |
| `reports.released` | notable | Report released for distribution; transitioned to `released` status |
| `reports.stale-warning` | notable | Draft exceeded staleness threshold; user shown warning |

### 12.2 Health Spine (P3-D2 §11)

Reports contributes a "Report Currency" metric to the Office dimension of the Health spine:

```typescript
interface IHealthMetric {
  metricKey: 'report-currency';
  dimension: 'Office';
  value: number;               // Days since last approved report (PX Review or Owner Report)
  threshold: number;           // Configured threshold (e.g., 30 days); metric turns red when exceeded
  lastUpdatedAt: string;       // ISO 8601
  associatedRunId: string;     // Latest approved/released report run
}
```

---

### 12.3 Work Queue Spine (P3-D3 §12)

Reports generates work items when:

```typescript
interface IWorkQueueItem {
  workItemId: string;
  itemType: 'report-draft-stale' | 'report-approval-pending' | 'report-distribution-pending';
  projectId: string;
  runId: string;               // FK to IReportRunRecord
  ownerUPN?: string;           // Assigned owner (e.g., PM for draft stale, PE for approval pending)
  dueDate?: string;            // ISO 8601 suggested due date
  createdAt: string;
  priority: 'normal' | 'high'; // High for approval/distribution; normal for staleness
}
```

| Work Item Type | Trigger | Owner |
|----------------|---------|-------|
| `report-draft-stale` | Draft exceeds staleness threshold | PM |
| `report-approval-pending` | PX Review in `generated` status awaiting approval | Project Executive |
| `report-distribution-pending` | Report released awaiting distribution | Designated distributor or PM |

### 12.4 Related Items Spine (P3-D4 §9)

Reports registers relationships:

```typescript
interface IRelatedItem {
  fromId: string;           // runId
  fromType: 'report-run';
  toId: string;             // snapshotId
  toType: 'module-snapshot';
  relationshipType: 'references';
  description: string;      // "Report run references module snapshots consumed at generation time"
}
```

---

## 13. Executive Review Boundary (P3-E2 §8.4)

Reports implements a clear review boundary per P3-E2 §8.4:

1. **Review layer:** Annotations stored in `@hbc/field-annotations` artifact separate from the report run-ledger and draft state.
2. **No modification:** Review annotations do NOT modify the run-ledger, draft state, or PM narrative.
3. **Visibility control:** Review annotations are restricted to review circle before PER pushes them to project team.
4. **PM ownership preserved:** PM narrative and draft state remain PM/PE-owned; review layer is read-only context only.

---

## 14. Required Capabilities

All capabilities defined in this specification MUST be implemented by Phase 3 delivery:

1. **Report family definition registry** (PX Review, Owner Report, Sub Scorecard, Lessons Learned)
2. **Run ledger management** (create, update status, query history by project/family/date range)
3. **Module snapshot consumption** at generation time with immutability guarantee
4. **PM narrative editing** per section with provenance tracking (user, timestamp)
5. **Approval workflow** (PX Review family only; Owner Report, scorecard, lessons no approval gate)
6. **Release and distribution management** with metadata tracking
7. **Reviewer-generated runs** (PER pathway only; against confirmed snapshots only)
8. **Central project-governance policy record management** (global and project-level policy)
9. **PM↔PE internal review chain** (optional project-level governance step blocking PX Review when configured)
10. **SubScorecard form** (6 sections, 26–29 criteria total, weighted scoring, aggregation dashboard)
11. **Lessons Learned form** (project classifications, per-lesson entries, lessons database)
12. **Spine publication** (Activity, Health, Work Queue, Related Items)
13. **Staleness detection and warning** (configurable thresholds, Work Queue item generation)
14. **PDF generation and SharePoint storage** (async, queued, artifact URL tracking)
15. **Status lifecycle enforcement** (transitions enforced per approval rules and family configuration)

---

## 15. Acceptance Gate Reference

**Gate:** Reporting gates (Phase 3 plan §18.6)

| Requirement | Acceptance Criterion |
|-------------|---------------------|
| **Report families live** | PX Review, Owner Report, Sub Scorecard, Lessons Learned all registered and functional |
| **Draft/snapshot model** | Draft refresh, narrative override, snapshot freeze, staleness warning all working |
| **Generation pipeline** | Queued generation, PDF production, SharePoint storage, artifact URL recording all functional |
| **Run-ledger tracking** | All runs recorded with status, approval/release metadata, `runType` distinction |
| **Approval model** | PX Review explicit approval gate enforced; Owner Report non-gated release working |
| **PER permissions** | PER report permissions enforced per §11; no draft authority; reviewer-generated runs against confirmed snapshots only |
| **Policy enforcement** | Central project-governance policy record enforced; global and project-level policy hierarchy in effect; PM↔PE internal review chain blocking when configured |
| **Spine publication** | Activity, Health, Work Queue, Related Items events flowing correctly |
| **Closeout reports** | SubScorecard and Lessons Learned forms capturing and aggregating data correctly |
| **Evidence required** | P3-F1 (locked), report-definition registry with 4 families, draft/snapshot model functional, staleness handling operational, generation pipeline producing PDFs, run-ledger tracking all runs with distinction, PX Review approval gate enforced, Owner Report non-gated, PER permissions verified, project-governance policy enforced, spine publication flowing |

---

## 16. Field Index

**Alphabetical Index of All Fields Defined:**

- `actualCompletion` (Subcontractor Scorecard, Lessons Learned)
- `applicability` (Lesson Entry)
- `approvalGated` (Report Family Definition)
- `approvalMetadata` (Report Run Record)
- `approvedAt` (Report Approval)
- `approvedBy` (Report Approval)
- `artifactUrl` (Report Run Record)
- `categoryField` (Lesson Entry)
- `comments` (Report Approval)
- `communicationScore` (Subcontractor Scorecard)
- `complexity Rating` (Lessons Learned Report)
- `contractValue` (Subcontractor Scorecard, Lessons Learned)
- `contractVariance` (Lessons Learned Report)
- `costMgmtScore` (Subcontractor Scorecard)
- `criteria` (Subcontractor Section)
- `createdAt` (Report Run Record, Subcontractor Scorecard, Lessons Learned Report)
- `createdBy` (Report Run Record, Subcontractor Scorecard, Lessons Learned Report)
- `data` (Module Snapshot)
- `daysVariance` (Lessons Learned Report)
- `deliveryMethod` (Lessons Learned Report)
- `description` (Report Family Definition)
- `distributedAt` (Report Release)
- `distributionChannel` (Report Release)
- `distributionRecipients` (Report Release)
- `evaluationDate` (Subcontractor Scorecard)
- `evaluatorName` (Subcontractor Scorecard)
- `evaluatorNotes` (Subcontractor Criterion)
- `evaluatorTitle` (Subcontractor Scorecard)
- `evidence` (Subcontractor Criterion)
- `error` (Report Run Record)
- `familyKey` (Report Run Record, Report Family Definition)
- `familyPolicies` (Project Governance Policy Record)
- `finalCost` (Subcontractor Scorecard, Lessons Learned)
- `finalContractValue` (Lessons Learned Report)
- `generatedAt` (Report Run Record)
- `generatedBy` (Report Run Record)
- `impact` (Lesson Entry)
- `impactMagnitude` (Lesson Entry)
- `internalReviewChainConfig` (Project Governance Policy Record)
- `isActive` (Subcontractor Scorecard, Lessons Learned Report)
- `keyStrengths` (Subcontractor Scorecard)
- `keywords` (Lesson Entry)
- `label` (Report Family Definition, Report Section Definition)
- `lastModifiedAt` (Project Governance Policy Record)
- `lastModifiedBy` (Project Governance Policy Record)
- `lessonId` (Lesson Entry)
- `lessonNumber` (Lesson Entry)
- `lessons` (Lessons Learned Report)
- `marketSector` (Lessons Learned Report)
- `moduleKey` (Module Snapshot)
- `notableIncidentsOrIssues` (Subcontractor Scorecard)
- `order` (Report Section Definition)
- `originalContractValue` (Lessons Learned Report)
- `overallNarrativeSummary` (Subcontractor Scorecard)
- `overallWeightedScore` (Subcontractor Scorecard)
- `performanceRating` (Subcontractor Scorecard)
- `perReleaseAuthority` (Report Family Policy)
- `phaseEncountered` (Lesson Entry)
- `projectExecutive` (Lessons Learned Report)
- `projectId` (Report Run Record, Report Family Definition, Subcontractor Scorecard, Lessons Learned Report, Module Snapshot)
- `projectLocation` (Subcontractor Scorecard, Lessons Learned Report)
- `projectName` (Subcontractor Scorecard, Lessons Learned Report)
- `projectNumber` (Subcontractor Scorecard, Lessons Learned Report)
- `projectSizeBand` (Lessons Learned Report)
- `projectType` (Subcontractor Scorecard, Lessons Learned Report)
- `qualityScore` (Subcontractor Scorecard)
- `recommendaation` (Lesson Entry)
- `reBidRecommendation` (Subcontractor Scorecard)
- `releasedAt` (Report Release)
- `releasedBy` (Report Release)
- `releaseMetadata` (Report Run Record)
- `reportDate` (Lessons Learned Report)
- `reportId` (Lessons Learned Report)
- `reportPreparedBy` (Lessons Learned Report)
- `requiredModuleSnapshots` (Report Family Definition)
- `requiresInternalReviewChain` (Report Family Policy)
- `response` (Lesson Entry)
- `rootCause` (Lesson Entry)
- `runId` (Report Run Record)
- `runType` (Report Run Record)
- `safetyScore` (Subcontractor Scorecard)
- `scheduledCompletion` (Subcontractor Scorecard, Lessons Learned)
- `scheduleScore` (Subcontractor Scorecard)
- `scorecardId` (Subcontractor Scorecard)
- `score` (Subcontractor Criterion)
- `sections` (Report Family Definition, Subcontractor Scorecard)
- `sectionKey` (Report Section Definition, Subcontractor Section)
- `sectionLabel` (Subcontractor Section)
- `sectionScore` (Subcontractor Section)
- `sectionWeight` (Subcontractor Section)
- `situation` (Lesson Entry)
- `snapshotId` (Module Snapshot)
- `snapshotVersion` (Report Run Record, Module Snapshot)
- `sourceModuleKey` (Report Section Definition)
- `status` (Report Run Record)
- `subcontractorName` (Subcontractor Scorecard)
- `superintendent` (Lessons Learned Report)
- `supportingDocuments` (Lesson Entry)
- `tradeScope` (Subcontractor Scorecard)
- `weight` (Subcontractor Criterion)
- `workforceScore` (Subcontractor Scorecard)

---

**Last Updated:** 2026-03-22

**Governing Authority:** P3-F1 (locked contract); operational SOPs (Subcontractor Scorecard, Lessons Learned)

**Spec Status:** **Production-Grade — Zero Tolerance for Implementation Drift**
