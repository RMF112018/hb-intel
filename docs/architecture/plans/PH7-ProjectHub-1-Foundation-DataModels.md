# PH7.1 — Project Hub: Foundation & Data Models

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · `PH7-ProjectHub-Features-Plan.md`
**Purpose:** Define every TypeScript enum, interface, and type used across all Project Hub features. All downstream task files (PH7.2–PH7.14) import from these definitions. No feature work may begin until this task is complete and building cleanly.
**Audience:** Implementation agent(s), technical reviewers.
**Implementation Objective:** A complete, type-safe model layer in `packages/models/src/project-hub/` that captures every data shape confirmed during the structured product-owner interview (Q34–Q50B), including all uploaded template column structures.

---

## Prerequisites

- Phase 6 complete and passing (`pnpm turbo run build` exits 0).
- `PH7-Admin-Feature-Plan.md` and `PH7-Estimating-Feature-Plan.md` complete.
- `packages/models/` package exists and is exported from the monorepo.
- Confirm `packages/models/src/project-hub/` directory does not already contain conflicting files.

---

## 7.1.1 — Directory Scaffold

Create the following directory and barrel file structure. Do not create any other files yet.

```
packages/models/src/project-hub/
├── index.ts                        ← barrel export (all types)
├── ProjectHubEnums.ts
├── IProjectHubProject.ts
├── IPreconstruction.ts
├── IProjectManagement.ts
├── ISafety.ts
├── IQualityControl.ts
├── IWarranty.ts
├── IFinancialForecast.ts
├── ISchedule.ts
├── IBuyoutLog.ts
├── IPermitLog.ts
├── IConstraintsLog.ts
└── IReports.ts
```

Add `export * from './project-hub/index.js';` to `packages/models/src/index.ts`.

---

## 7.1.2 — `ProjectHubEnums.ts`

```typescript
// packages/models/src/project-hub/ProjectHubEnums.ts

/** Lifecycle status for a single checklist item. */
export enum ChecklistItemStatus {
  NotStarted = 'NotStarted',
  InProgress = 'InProgress',
  Complete = 'Complete',
  NA = 'NA',
}

/** Generic approval/acknowledgment state. */
export enum AcknowledgmentStatus {
  Pending = 'Pending',
  Acknowledged = 'Acknowledged',
  Declined = 'Declined',
}

/** RACI responsibility designations. */
export enum RaciRole {
  Responsible = 'R',
  Accountable = 'A',
  Consulted = 'C',
  Informed = 'I',
  None = '',
}

/** Permit status values — from uploaded 20250915_TWN_PermitLog.xlsx. */
export enum PermitStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  PendingApplication = 'Pending Application',
  PendingRevision = 'Pending Revision',
  Void = 'VOID',
}

/** Permit type — from uploaded template. */
export enum PermitType {
  Primary = 'PRIMARY',
  Sub = 'SUB',
  Temp = 'TEMP',
}

/** Required Inspection result — from uploaded 10b_20260220_RequiredInspectionsList.xlsx. */
export enum InspectionResult {
  Pass = 'Pass',
  Fail = 'Fail',
  NA = 'N/A',
  Pending = 'Pending',
}

/** Constraints log category — from uploaded HB_ConstraintsLog_Template.xlsx (7 categories). */
export enum ConstraintCategory {
  Design = 'Design',
  Owner = 'Owner',
  Subcontractor = 'Subcontractor',
  Weather = 'Weather',
  Regulatory = 'Regulatory',
  SiteConditions = 'Site Conditions',
  Other = 'Other',
}

/** Open/Closed state for constraints. */
export enum ConstraintStatus {
  Open = 'Open',
  Closed = 'Closed',
}

/** Warranty request lifecycle. */
export enum WarrantyStatus {
  Submitted = 'Submitted',
  Acknowledged = 'Acknowledged',
  InProgress = 'InProgress',
  Resolved = 'Resolved',
  Denied = 'Denied',
  Closed = 'Closed',
}

/** Schedule item status. */
export enum MilestoneStatus {
  OnTrack = 'OnTrack',
  AtRisk = 'AtRisk',
  Delayed = 'Delayed',
  Complete = 'Complete',
}

/** Incident type — from uploaded Incident Report.docx. */
export enum IncidentType {
  NearMiss = 'Near Miss',
  UnsafeCondition = 'Unsafe Condition',
  EquipmentDamage = 'Equipment Damage',
  Other = 'Other',
}

/** QC checklist item result. */
export enum QcItemResult {
  Pass = 'Pass',
  Fail = 'Fail',
  NA = 'N/A',
  Pending = 'Pending',
}

/** Schedule file format for upload parsing. */
export enum ScheduleFileFormat {
  XER = 'XER',   // Primavera P6
  XML = 'XML',   // MS Project / P6 XML
  CSV = 'CSV',   // Generic milestone CSV
}

/** Financial forecast period status. */
export enum ForecastPeriodStatus {
  Current = 'Current',
  Final = 'Final',
  Projected = 'Projected',
}
```

---

## 7.1.3 — `IProjectHubProject.ts`

```typescript
// packages/models/src/project-hub/IProjectHubProject.ts

/**
 * Lightweight project record used by the Project Hub shell to populate
 * the project selector and route context. Full project record lives in
 * the Projects SharePoint list (defined in PH6.8).
 */
export interface IProjectHubProject {
  /** UUID v4 — immutable system key. */
  projectId: string;
  /** Format: ##-###-## */
  projectNumber: string;
  projectName: string;
  projectLocation?: string;
  projectType?: string;
  /** ISO-8601 date string. */
  startDate?: string;
  /** ISO-8601 date string. */
  scheduledCompletionDate?: string;
  /** URL of the provisioned SharePoint project site. */
  siteUrl?: string;
  /** UPN of Project Manager. */
  projectManagerUpn?: string;
  projectManagerName?: string;
  /** UPN of Superintendent. */
  superintendentUpn?: string;
  superintendentName?: string;
  /** UPN of Project Executive. */
  projectExecutiveUpn?: string;
  projectExecutiveName?: string;
  /** All team member UPNs (union of all roles). */
  teamMemberUpns: string[];
}
```

---

## 7.1.4 — `IPreconstruction.ts`

```typescript
// packages/models/src/project-hub/IPreconstruction.ts

import type { AcknowledgmentStatus, ChecklistItemStatus } from './ProjectHubEnums.js';

/**
 * Read-only view of the BD Go/No-Go scorecard record for a project.
 * Source of truth lives in the Business Development module.
 */
export interface IGoNoGoView {
  projectId: string;
  goNoGoId: string;
  decision: 'Go' | 'No-Go' | 'Conditional';
  totalScore: number;
  maxScore: number;
  decidedBy: string;
  decidedAt: string;
  notes?: string;
  /** Categories and scores — display only. */
  categories: Array<{
    name: string;
    score: number;
    maxScore: number;
  }>;
}

/**
 * A single item in the pre-bid / kickoff checklist.
 * Lives at /project-hub/:projectId/kickoff in Project Hub.
 * Read/write for Estimators; read-only for Operations.
 * Derived from the kickoff checklist spreadsheet analyzed 2026-03-07.
 */
export interface IKickoffChecklistItem {
  id: string;
  projectId: string;
  category: string;
  itemText: string;
  status: ChecklistItemStatus;
  completedByUpn?: string;
  completedByName?: string;
  completedAt?: string;
  notes?: string;
  sortOrder: number;
}

/**
 * Turnover to Operations — 4-party digital sign-off.
 * All four parties have write access; visible in both Estimating and Project Hub.
 */
export interface ITurnoverToOps {
  projectId: string;
  turnoverDate?: string;

  // Narrative sections (editable by Estimating Coordinator)
  projectScopeNarrative?: string;
  ownerRelationshipNotes?: string;
  budgetNotes?: string;
  scheduleNotes?: string;
  riskNotes?: string;
  openItemsNotes?: string;

  // 4-party sign-off
  estimatingCoordinatorUpn?: string;
  estimatingCoordinatorName?: string;
  estimatingCoordinatorSignedAt?: string;
  estimatingCoordinatorStatus: AcknowledgmentStatus;

  projectExecutiveUpn?: string;
  projectExecutiveName?: string;
  projectExecutiveSignedAt?: string;
  projectExecutiveStatus: AcknowledgmentStatus;

  projectManagerUpn?: string;
  projectManagerName?: string;
  projectManagerSignedAt?: string;
  projectManagerStatus: AcknowledgmentStatus;

  superintendentUpn?: string;
  superintendentName?: string;
  superintendentSignedAt?: string;
  superintendentStatus: AcknowledgmentStatus;

  lastUpdatedAt?: string;
  lastUpdatedByUpn?: string;
}

/**
 * Post-bid autopsy record.
 * Read/write for Estimators; read-only view in Project Hub.
 */
export interface IPostBidAutopsy {
  projectId: string;
  completedByUpn: string;
  completedByName: string;
  completedAt: string;

  actualBidAmount?: number;
  nextLowestBidAmount?: number;
  bidSpread?: number;

  whatWentWell?: string;
  whatCouldImprove?: string;
  lessonLearned?: string;
  subPerformanceNotes?: string;
  estimatingMethodNotes?: string;
  recommendContinuedPursuit?: boolean;
}
```

---

## 7.1.5 — `IProjectManagement.ts`

```typescript
// packages/models/src/project-hub/IProjectManagement.ts

import type { AcknowledgmentStatus, ChecklistItemStatus, RaciRole } from './ProjectHubEnums.js';

/** Project Management Plan — structured digital form. */
export interface IProjectManagementPlan {
  projectId: string;
  version: number;
  createdByUpn: string;
  createdAt: string;
  lastUpdatedAt: string;
  lastUpdatedByUpn: string;

  // Section 1: Project Overview
  projectDescription?: string;
  constructionType?: string;
  contractType?: string; // GC / CM / Design-Build / Other
  contractAmount?: number;
  ntp?: string; // ISO date
  substantialCompletion?: string; // ISO date
  finalCompletion?: string; // ISO date

  // Section 2: Project Team
  ownerName?: string;
  ownerContactName?: string;
  ownerContactEmail?: string;
  architectName?: string;
  architectContactName?: string;
  architectContactEmail?: string;
  engineerName?: string;

  // Section 3: Communication Plan
  ownerMeetingFrequency?: string;
  internalMeetingFrequency?: string;
  reportingSchedule?: string;

  // Section 4: Key Milestones (free-form entries)
  keyMilestones?: Array<{
    description: string;
    targetDate: string; // ISO date
  }>;

  // Section 5: Risk Register (summary)
  identifiedRisks?: Array<{
    description: string;
    mitigation: string;
    owner: string;
  }>;

  // Section 6: Custom / additional notes
  additionalNotes?: string;

  // Acknowledgment tracking
  acknowledgments: IPmpAcknowledgment[];
}

export interface IPmpAcknowledgment {
  memberUpn: string;
  memberName: string;
  role: string;
  status: AcknowledgmentStatus;
  acknowledgedAt?: string;
}

/** RACI matrix row. */
export interface IRaciRow {
  id: string;
  projectId: string;
  taskOrDecision: string;
  /** UPN-keyed map of RACI designations. Keys are team member UPNs. */
  assignments: Record<string, RaciRole>;
  notes?: string;
  sortOrder: number;
  createdByUpn: string;
  createdAt: string;
}

/** RACI matrix definition for a project (includes row + column definitions). */
export interface IRaciMatrix {
  projectId: string;
  /** Column definitions — team members/roles displayed as RACI columns. */
  columns: Array<{
    upn: string;
    displayName: string;
    roleTitle: string;
  }>;
  rows: IRaciRow[];
  lastUpdatedAt: string;
}

/** A single startup checklist item — 37 items from Procore Startup Checklist. */
export interface IStartupChecklistItem {
  id: string;
  projectId: string;
  category: string;
  itemText: string;
  status: ChecklistItemStatus;
  completedByUpn?: string;
  completedByName?: string;
  completedAt?: string;
  dueDate?: string;
  notes?: string;
  sortOrder: number;
}

/** A single closeout checklist item — 43 items from closeout template. */
export interface ICloseoutChecklistItem {
  id: string;
  projectId: string;
  category: string;
  itemText: string;
  status: ChecklistItemStatus;
  completedByUpn?: string;
  completedByName?: string;
  completedAt?: string;
  dueDate?: string;
  notes?: string;
  sortOrder: number;
  /** If true, links to a stored closeout document. */
  hasDocument?: boolean;
  documentUrl?: string;
  documentName?: string;
}
```

---

## 7.1.6 — `ISafety.ts`

```typescript
// packages/models/src/project-hub/ISafety.ts

import type { AcknowledgmentStatus, IncidentType } from './ProjectHubEnums.js';

/** Site Specific Safety Plan — structured form matching uploaded SSSP template. */
export interface ISiteSafetyPlan {
  projectId: string;
  version: number;
  createdByUpn: string;
  createdAt: string;
  lastUpdatedAt: string;

  // Section 1: Project Information
  projectAddress?: string;
  ownerName?: string;
  generalContractor?: string;
  safetyManagerUpn?: string;
  safetyManagerName?: string;
  safetyManagerPhone?: string;

  // Section 2: Scope & Hazard Overview
  scopeDescription?: string;
  identifiedHazards?: string[];
  specialConditions?: string;

  // Section 3: Emergency Procedures
  nearestHospital?: string;
  nearestHospitalAddress?: string;
  emergencyAssemblyPoint?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;

  // Section 4: Required PPE
  requiredPpe?: string[];

  // Section 5: Subcontractor Requirements
  subRequirementsNotes?: string;

  // Section 6: Additional Sections (free-form)
  additionalSections?: Array<{
    sectionTitle: string;
    content: string;
  }>;

  /** Subcontractor acknowledgment records. */
  subAcknowledgments: ISubAcknowledgment[];
}

export interface ISubAcknowledgment {
  id: string;
  projectId: string;
  subcontractorCompany: string;
  contactName: string;
  contactUpn?: string;
  status: AcknowledgmentStatus;
  acknowledgedAt?: string;
  documentType: 'SSSP' | 'JHA' | 'EmergencyPlan';
}

/** JHA (Job Hazard Analysis) log entry. Phase 1: file upload. Phase 2: native digital form. */
export interface IJhaLogEntry {
  id: string;
  projectId: string;
  jhaDate: string; // ISO date
  workActivity: string;
  preparedByUpn: string;
  preparedByName: string;
  preparedByCompany: string;
  fileUrl?: string;
  fileName?: string;
  fileUploadedAt?: string;
  notes?: string;
}

/** Emergency plan library item — company-wide plans with per-project acknowledgment. */
export interface IEmergencyPlan {
  id: string;
  planTitle: string;
  planType: string; // e.g., "Tropical Storm/Hurricane", "ICE/Crisis", "Medical Emergency"
  version: string;
  effectiveDate: string;
  documentUrl: string;
  isActive: boolean;
  requiresAnnualAcknowledgment: boolean;
  acknowledgedByYear: Record<string, IEmergencyPlanAcknowledgment[]>; // year → ack records
}

export interface IEmergencyPlanAcknowledgment {
  memberUpn: string;
  memberName: string;
  projectId: string;
  acknowledgedAt: string;
  year: number;
}

/**
 * Incident Report — matches the 24-field uploaded Incident Report.docx exactly.
 * 24-hour submission deadline enforced in UI validation.
 */
export interface IIncidentReport {
  id: string;
  projectId: string;

  // Form fields from uploaded template
  personCompletingReport: string;
  personCompletingCompany: string;
  employeesInvolved: string;
  incidentDate: string; // ISO date-time
  dateFirstReported: string; // ISO date-time
  location: string;
  incidentType: IncidentType;
  incidentTypeOther?: string; // if incidentType = Other

  description: string;
  immediateCauses: string;
  contributingFactors: string;
  correctiveActions: string;

  equipmentInvolved?: string;
  operatorTrained?: boolean;

  photosAttached?: boolean;
  policeReport?: boolean;
  policeReportNumber?: string;

  witness1Name?: string;
  witness1Company?: string;
  witness1AgreesWithDescription?: boolean;

  witness2Name?: string;
  witness2Company?: string;
  witness2AgreesWithDescription?: boolean;

  safetyManagerNotified?: boolean;
  safetyManagerNotifiedAt?: string;
  subSupervisorNotified?: boolean;
  subSupervisorNotifiedAt?: string;

  submittedByUpn: string;
  submittedAt: string;

  // Notification tracking
  notificationsSent: IIncidentNotification[];
}

export interface IIncidentNotification {
  recipientUpn: string;
  recipientRole: 'SafetyManager' | 'SubcontractorSupervisor';
  sentAt: string;
  method: 'Email' | 'HBIntelNotification';
}
```

---

## 7.1.7 — `IQualityControl.ts`

```typescript
// packages/models/src/project-hub/IQualityControl.ts

import type { QcItemResult } from './ProjectHubEnums.js';

/**
 * QC Checklist — auto-suggested by CSI division, per-project customizable.
 * Long-term vision: replace Dashpivot/Sitemate with native collaborative workflow.
 */
export interface IQcChecklist {
  id: string;
  projectId: string;
  checklistName: string;
  /** CSI division number (e.g., "03" for Concrete, "09" for Finishes). */
  csiDivision: string;
  csiDivisionName: string;
  isCustom: boolean; // true if manually added (not auto-suggested)
  createdByUpn: string;
  createdAt: string;
  lastUpdatedAt: string;
  items: IQcChecklistItem[];
}

export interface IQcChecklistItem {
  id: string;
  checklistId: string;
  itemText: string;
  result: QcItemResult;
  completedByUpn?: string;
  completedByName?: string;
  completedAt?: string;
  notes?: string;
  photoUrls?: string[];
  sortOrder: number;
  /** Phase 2: collaborative multi-party completion tracking. */
  assignedToUpn?: string;
}

/** Third-party inspection record linked to QC completion. */
export interface IThirdPartyInspection {
  id: string;
  projectId: string;
  inspectionType: string;
  inspectorName: string;
  inspectorCompany: string;
  inspectionDate: string;
  result: QcItemResult;
  reportUrl?: string;
  reportFileName?: string;
  notes?: string;
  createdByUpn: string;
  createdAt: string;
}
```

---

## 7.1.8 — `IWarranty.ts`

```typescript
// packages/models/src/project-hub/IWarranty.ts

import type { WarrantyStatus } from './ProjectHubEnums.js';

/** Warranty request submitted by owner or internal team. */
export interface IWarrantyRequest {
  id: string;
  projectId: string;
  requestNumber: string; // auto-incremented per project
  submittedByUpn: string;
  submittedByName: string;
  submittedAt: string;
  status: WarrantyStatus;

  // Request details
  location: string;
  description: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Emergency';
  category?: string; // e.g., Roofing, HVAC, Plumbing, Finishes, etc.

  // Assignment
  assignedToUpn?: string;
  assignedToName?: string;
  assignedAt?: string;

  // Resolution
  resolutionDescription?: string;
  resolvedByUpn?: string;
  resolvedAt?: string;

  // Subcontractor routing
  responsibleSubcontractor?: string;
  subNotifiedAt?: string;
  subCompletedAt?: string;

  attachmentUrls?: string[];
  notes?: string;

  lastUpdatedAt: string;
  lastUpdatedByUpn: string;
}

/** Warranty document (e.g., manufacturer warranty, equipment warranty). */
export interface IWarrantyDocument {
  id: string;
  projectId: string;
  documentTitle: string;
  vendor: string;
  equipmentOrSystem: string;
  warrantyStartDate: string; // ISO date
  warrantyExpirationDate: string; // ISO date
  documentUrl?: string;
  documentFileName?: string;
  alertDaysBefore: number; // default 90
  alertSentAt?: string;
  notes?: string;
  uploadedByUpn: string;
  uploadedAt: string;
}
```

---

## 7.1.9 — `IFinancialForecast.ts`

```typescript
// packages/models/src/project-hub/IFinancialForecast.ts

/**
 * Financial Forecasting — modernizes the 4-file manual process:
 * 1. Procore Budget PDF (read-only source → imported via CSV/Excel upload)
 * 2. Financial Forecast Summary & Checklist.xlsx
 * 3. GC-GR Forecast.xlsm
 * 4. HB Draw Schedule - Cash Flow.xlsx
 */

/** Procore budget line item — imported from CSV/Excel upload. */
export interface IProcoreBudgetLineItem {
  costCode: string;
  costCodeDescription: string;
  division: string;
  budgetedQuantity?: number;
  budgetedUnit?: string;
  originalBudgetAmount: number;
  approvedBudgetChanges: number;
  revisedBudgetAmount: number;
}

/** Financial forecast header / project-level summary. */
export interface IFinancialForecastSummary {
  projectId: string;
  forecastPeriodEnding: string; // ISO date (month-end)
  preparedByUpn: string;
  preparedAt: string;
  lastUpdatedAt: string;

  // Schedule Status
  scheduledCompletion?: string; // ISO date
  projectedCompletion?: string; // ISO date
  scheduleVarianceDays?: number;

  // Contract Financial Summary
  originalContractAmount?: number;
  approvedChangeOrders?: number;
  currentContractAmount?: number;

  originalBudget?: number;
  currentBudget?: number;
  projectedCostAtCompletion?: number;
  projectedProfit?: number;
  projectedProfitPercent?: number;

  // Contingency
  ownerContingency?: number;
  ownerContingencyRemaining?: number;
  contractorContingency?: number;
  contractorContingencyRemaining?: number;

  // Problems / Exposures (from Summary Sheet template — 10 categories)
  exposures: IForecastExposure[];

  // GC Period Ending
  gcPeriodEndingDate?: string;
  gcPeriodEndingAmount?: number;
}

export interface IForecastExposure {
  category: 'Schedule' | 'Budget' | 'Payment' | 'Safety' | 'RFI' | 'Submittals' | 'Buyout' | 'Risk' | 'COs' | 'Permits' | 'CriticalIssues';
  description?: string;
  amount?: number;
  status?: 'Open' | 'Resolved' | 'Monitoring';
}

/** GC/GR Forecast line item — per cost code, monthly budget vs. actual. */
export interface IGcGrForecastLineItem {
  projectId: string;
  forecastPeriodEnding: string;
  costCode: string;
  costCodeDescription: string;
  originalBudget: number;
  /** Monthly actuals — keyed by ISO year-month string (e.g., "2026-03"). */
  monthlyActuals: Record<string, number>;
  /** Monthly projections — keyed by ISO year-month string. */
  monthlyProjections: Record<string, number>;
  projectedCostAtCompletion: number;
  variance: number; // originalBudget - projectedCostAtCompletion
}

/** Cash Flow Schedule row — CSI trade × pay app. */
export interface ICashFlowRow {
  projectId: string;
  csiDivision: string;
  tradeDescription: string;
  subcontractor?: string;
  contractTotal: number;
  retainagePercent: number;
  /** Pay app amounts — keyed by pay app number string (e.g., "PA-01"). */
  payAppAmounts: Record<string, number>;
  totalCompleted: number;
  balanceToComplete: number;
}

/** Forecast Checklist (v1.2) — 13 monthly review categories. */
export interface IForecastChecklistItem {
  id: string;
  projectId: string;
  forecastPeriodEnding: string;
  category: string;
  itemText: string;
  isComplete: boolean;
  completedByUpn?: string;
  completedAt?: string;
  notes?: string;
  sortOrder: number;
}
```

---

## 7.1.10 — `ISchedule.ts`

```typescript
// packages/models/src/project-hub/ISchedule.ts

import type { MilestoneStatus, ScheduleFileFormat } from './ProjectHubEnums.js';

/** A single project milestone parsed from XER/XML/CSV or entered manually. */
export interface IScheduleMilestone {
  id: string;
  projectId: string;
  milestoneCode?: string; // from P6 activity ID or custom
  milestoneName: string;
  phase?: string; // e.g., Foundation, Structure, MEP, Finishes, Closeout
  baselineDate?: string; // ISO date
  forecastDate?: string; // ISO date
  actualDate?: string; // ISO date
  status: MilestoneStatus;
  isCriticalPath: boolean;
  notes?: string;
  sortOrder: number;
}

/** Metadata for an uploaded schedule file. */
export interface IScheduleUpload {
  id: string;
  projectId: string;
  fileName: string;
  fileFormat: ScheduleFileFormat;
  uploadedByUpn: string;
  uploadedAt: string;
  parsedMilestoneCount: number;
  parseErrors?: string[];
  isActive: boolean; // most recent upload is the active one
}

/** Project schedule summary (derived from milestones). */
export interface IScheduleSummary {
  projectId: string;
  totalMilestones: number;
  completedMilestones: number;
  onTrackCount: number;
  atRiskCount: number;
  delayedCount: number;
  scheduledCompletion?: string; // ISO date
  forecastedCompletion?: string; // ISO date
  varianceDays?: number; // positive = behind, negative = ahead
  lastUploadedAt?: string;
}
```

---

## 7.1.11 — `IBuyoutLog.ts`

```typescript
// packages/models/src/project-hub/IBuyoutLog.ts

/**
 * Buyout Log — replicates the 14-column uploaded Buyout Log_Template 2025.xlsx.
 * CSI divisions 02–16 pre-populated. Original Budget seeded from Procore budget upload.
 */
export interface IBuyoutLogEntry {
  id: string;
  projectId: string;

  // Column 1: REF # (auto-assigned per CSI division row)
  refNumber: string;

  // Column 2: DIVISION # / DESCRIPTION
  csiDivision: string;
  csiDescription: string;

  // Column 3: SUBCONTRACTOR / VENDOR
  subcontractorVendor?: string;

  // Column 4: CONTRACT AMOUNT
  contractAmount?: number;

  // Column 5: ORIGINAL BUDGET (seeded from Procore budget upload)
  originalBudget?: number;

  // Column 6: OVER/UNDER (calculated: contractAmount - originalBudget)
  // overUnder is derived — do not persist separately; calculate on read

  // Column 7: LOI DATE TO BE SENT
  loiDateToBeSent?: string; // ISO date

  // Column 8: LOI Returned Executed
  loiReturnedExecuted?: string; // ISO date

  // Column 9: Submittal Dates
  submittalDates?: string;

  // Column 10: Lead Times
  leadTimes?: string;

  // Column 11: Sub Name (secondary contact or alternate name)
  subName?: string;

  // Column 12: BALL IN COURT
  ballInCourt?: string;

  // Column 13: Enrolled in SDI
  enrolledInSdi?: boolean;

  // Column 14: Bond Required
  bondRequired?: boolean;

  comments?: string;

  sortOrder: number;
  lastUpdatedAt: string;
  lastUpdatedByUpn: string;
}

/** Buyout Log summary calculations. */
export interface IBuyoutLogSummary {
  projectId: string;
  totalSubcontracts: number;
  subcontractsBoughtOut: number;
  totalBudget: number;
  totalContractAmount: number;
  totalOverUnder: number;
  percentBuyoutComplete: number; // 0–100
}
```

---

## 7.1.12 — `IPermitLog.ts`

```typescript
// packages/models/src/project-hub/IPermitLog.ts

import type { InspectionResult, PermitStatus, PermitType } from './ProjectHubEnums.js';

/**
 * Permit Log entry — replicates the 14-column uploaded 20250915_TWN_PermitLog.xlsx.
 * REF # supports alphanumeric sub-permit references (e.g., "02E", "16E").
 */
export interface IPermitLogEntry {
  id: string;
  projectId: string;

  // Column 1: REF # (alphanumeric, e.g., "02E", "16E")
  refNumber: string;

  // Column 2: LOCATION
  location?: string;

  // Column 3: TYPE
  permitType: PermitType;

  // Column 4: PERMIT #
  permitNumber?: string;

  // Column 5: DESCRIPTION
  description: string;

  // Column 6: RESPONSIBLE CONTRACTOR
  responsibleContractor?: string;

  // Column 7: ADDRESS
  address?: string;

  // Column 8: DATE REQUIRED
  dateRequired?: string; // ISO date

  // Column 9: DATE SUBMITTED
  dateSubmitted?: string; // ISO date

  // Column 10: DATE RECEIVED
  dateReceived?: string; // ISO date

  // Column 11: DATE EXPIRES
  dateExpires?: string; // ISO date

  // Column 12: STATUS
  status: PermitStatus;

  // Column 13: AHJ (Authority Having Jurisdiction)
  ahj?: string;

  // Column 14: COMMENTS
  comments?: string;

  sortOrder: number;
  lastUpdatedAt: string;
  lastUpdatedByUpn: string;

  /** Required inspections linked to this permit. */
  inspections?: IRequiredInspection[];
}

/**
 * Required Inspection — from uploaded 10b_20260220_RequiredInspectionsList.xlsx.
 * 200+ inspections; linked to parent permit by permitId.
 */
export interface IRequiredInspection {
  id: string;
  projectId: string;
  permitId: string;

  // Column 1: Inspection
  inspectionName: string;

  // Column 2: Code (building code reference)
  codeReference?: string;

  // Column 3: Date Called In
  dateCalledIn?: string; // ISO date

  // Column 4: Result
  result: InspectionResult;

  // Column 5: Comment
  comment?: string;

  // Column 6: Verified Online
  verifiedOnline?: boolean;

  sortOrder: number;
  lastUpdatedAt: string;
  lastUpdatedByUpn: string;
}
```

---

## 7.1.13 — `IConstraintsLog.ts`

```typescript
// packages/models/src/project-hub/IConstraintsLog.ts

import type { ConstraintCategory, ConstraintStatus } from './ProjectHubEnums.js';

/**
 * Constraints Log entry — replicates the uploaded HB_ConstraintsLog_Template.xlsx.
 * 11-column structure; 7 categories each with OPEN/CLOSED subcategories.
 * Due date color coding: green (8+ days), orange (7 days), red (past due).
 */
export interface IConstraintEntry {
  id: string;
  projectId: string;

  // Column 1: No # (sequential within project)
  sequenceNumber: number;

  // Column 2: Description
  description: string;

  // Column 3: Date Identified
  dateIdentified: string; // ISO date

  // Column 4: Status
  status: ConstraintStatus;

  // Column 5: Days Elapsed (calculated: today - dateIdentified if Open)
  // daysElapsed is derived — calculate on read

  // Column 6: Reference (contract section, RFI #, drawing ref, etc.)
  reference?: string;

  // Column 7: Responsible (person or company)
  responsible?: string;

  // Column 8: B.I.C (Ball in Court — who must act next)
  ballInCourt?: string;

  // Column 9: Due (due date for resolution)
  dueDate?: string; // ISO date

  // Column 10: Completion Date
  completionDate?: string; // ISO date

  // Column 11: Comments
  comments?: string;

  category: ConstraintCategory;
  sortOrder: number;
  lastUpdatedAt: string;
  lastUpdatedByUpn: string;
}

/**
 * Change Tracking entry — separate section in constraints log template.
 * 11-column structure.
 */
export interface IChangeTrackingEntry {
  id: string;
  projectId: string;
  sequenceNumber: number;
  description: string;
  dateIdentified: string;
  status: ConstraintStatus;
  reference?: string;
  responsible?: string;
  ballInCourt?: string;
  dueDate?: string;
  completionDate?: string;
  comments?: string;
  sortOrder: number;
  lastUpdatedAt: string;
  lastUpdatedByUpn: string;
}

/**
 * Delay Log entry — separate section in constraints log template.
 * 11-column structure.
 */
export interface IDelayLogEntry {
  id: string;
  projectId: string;
  sequenceNumber: number;
  description: string;
  dateIdentified: string;
  status: ConstraintStatus;
  reference?: string;
  responsible?: string;
  ballInCourt?: string;
  dueDate?: string;
  completionDate?: string;
  comments?: string;
  delayDays?: number;
  sortOrder: number;
  lastUpdatedAt: string;
  lastUpdatedByUpn: string;
}
```

---

## 7.1.14 — `IReports.ts`

```typescript
// packages/models/src/project-hub/IReports.ts

/** PX Review — auto-assembled review package with trend dashboard. */
export interface IPxReview {
  projectId: string;
  reviewDate: string; // ISO date
  preparedByUpn: string;
  preparedAt: string;

  // Auto-assembled sections (populated from module data at review time)
  scheduleSnapshotJson?: string;    // serialized IScheduleSummary
  financialSnapshotJson?: string;   // serialized IFinancialForecastSummary
  safetySnapshotJson?: string;      // incident count, open JHAs
  buyoutSnapshotJson?: string;      // serialized IBuyoutLogSummary
  constraintsSnapshotJson?: string; // open constraints count by category
  permitSnapshotJson?: string;      // active permits, pending inspections

  // Narrative overrides (PM can edit before export)
  executiveSummary?: string;
  scheduleNarrative?: string;
  financialNarrative?: string;
  safetyNarrative?: string;
  lookAheadNarrative?: string;

  // PDF export
  pdfExportUrl?: string;
  pdfExportedAt?: string;
  pdfExportedByUpn?: string;
}

/** Owner Report — auto-populated narrative report with PDF export. */
export interface IOwnerReport {
  projectId: string;
  reportNumber: number; // sequential per project
  reportPeriodStart: string; // ISO date
  reportPeriodEnd: string; // ISO date
  preparedByUpn: string;
  preparedAt: string;
  distributedAt?: string;

  // Auto-populated fields
  overallProjectStatus?: 'OnTrack' | 'AtRisk' | 'Behind';
  percentComplete?: number; // 0–100

  // Narrative sections (auto-suggested + PM-editable)
  executiveSummary?: string;
  workCompletedThisPeriod?: string;
  workPlannedNextPeriod?: string;
  scheduleStatusNarrative?: string;
  budgetStatusNarrative?: string;
  safetyStatusNarrative?: string;
  openItemsAndActions?: string;
  photos?: Array<{
    url: string;
    caption: string;
  }>;

  // PDF export
  pdfExportUrl?: string;
  pdfExportedAt?: string;
  pdfExportedByUpn?: string;
}
```

---

## 7.1.15 — `index.ts` Barrel Export

```typescript
// packages/models/src/project-hub/index.ts

export * from './ProjectHubEnums.js';
export * from './IProjectHubProject.js';
export * from './IPreconstruction.js';
export * from './IProjectManagement.js';
export * from './ISafety.js';
export * from './IQualityControl.js';
export * from './IWarranty.js';
export * from './IFinancialForecast.js';
export * from './ISchedule.js';
export * from './IBuyoutLog.js';
export * from './IPermitLog.js';
export * from './IConstraintsLog.js';
export * from './IReports.js';
```

---

## Verification

```bash
cd /path/to/repo
pnpm turbo run build --filter=@hbc/models
# Expected: BUILD SUCCESSFUL, 0 type errors
grep -r "from.*project-hub" packages/models/src/index.ts
# Expected: export * from './project-hub/index.js';
```

<!-- IMPLEMENTATION PROGRESS & NOTES
Task file created: 2026-03-07
Status: Ready for implementation
Next: PH7.2 — Routes & Shell Navigation
-->
