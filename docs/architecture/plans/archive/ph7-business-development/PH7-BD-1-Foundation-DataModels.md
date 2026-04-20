# PH7-BD-1 — Business Development: Foundation & Data Models

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · `PH7-BD-Features.md`
**Purpose:** Define every TypeScript enum, interface, and type for the BD module. All downstream BD task files import from these definitions. No BD feature work may begin until this task is complete and building cleanly.
**Audience:** Implementation agent(s), technical reviewers.
**Implementation Objective:** A complete, type-safe model layer in `packages/models/src/bd/` capturing every data shape from the structured interview (Q51–Q65) and the uploaded `HB GO_NOGO Template Ver 2.2 2025.12.05.xlsx`.

---

## Prerequisites

- PH7-ProjectHub-1 complete (project hub models exist; BD models reference `IProjectHubProject`).
- `packages/models/` package exists and builds cleanly.
- Go/No-Go scorecard Excel template fully analyzed (2026-03-07).

---

## BD-1.1 — Directory Scaffold

```
packages/models/src/bd/
├── index.ts
├── BdEnums.ts
├── IGoNoGoScorecard.ts
├── IGoNoGoScoring.ts
├── IGoNoGoWorkflow.ts
└── IBdAnalytics.ts
```

Add `export * from './bd/index.js';` to `packages/models/src/index.ts`.

---

## BD-1.2 — `BdEnums.ts`

```typescript
// packages/models/src/bd/BdEnums.ts

/** Department that originated the lead. From scorecard Dept of Lead Origination dropdown. */
export enum LeadOriginDept {
  BusinessDevelopment = 'Business Development',
  Estimating = 'Estimating',
  Marketing = 'Marketing',
  Operations = 'Operations',
  Other = 'Other',
  Ownership = 'Ownership',
}

/** HBC regional office. From scorecard Region dropdown. */
export enum HbcRegion {
  WestPalm = 'West Palm',
  WinterPark = 'Winter Park',
  Miami = 'Miami',
  Stuart = 'Stuart',
}

/** Project market sector. From scorecard Sector dropdown (14 options). */
export enum ProjectSector {
  Airport = 'Airport',
  City = 'City',
  Commercial = 'Commercial',
  County = 'County',
  Education = 'Education',
  Federal = 'Federal',
  GolfClub = 'Golf Club/Course',
  Hospitality = 'Hospitality',
  Industrial = 'Industrial',
  MixedUse = 'Mixed-Use',
  MultiFamiliy = 'Multi-Family',
  Municipal = 'Municipal',
  ParkingGarage = 'Parking Garage',
  Other = 'Other',
}

/** Project delivery method. From scorecard Delivery Method dropdown. */
export enum DeliveryMethod {
  GMP = 'GMP',
  HardBid = 'Hard-Bid',
  PreconWithGmpAmend = 'Precon w/ GMP Amend',
  Other = 'Other',
}

/** Scoring tier for a single Go/No-Go criterion. */
export enum ScoringTier {
  High = 'High',
  Average = 'Average',
  Low = 'Low',
  NotScored = '',
}

/**
 * The Go/No-Go decision outcome.
 * Strategic Pursuit / Detrimental / Not Detrimental are NOT decision states —
 * they are the answer to the strategic question field (Q59 clarification).
 */
export enum GoNoGoDecision {
  Go = 'GO',
  NoGo = 'NO GO',
  Wait = 'WAIT',
}

/** Answer to "Is this a Strategic Pursuit or will a No Bid be Detrimental?" */
export enum StrategicPursuitAnswer {
  StrategicPursuit = 'Strategic Pursuit',
  Detrimental = 'Detrimental',
  NotDetrimental = 'Not Detrimental',
}

/** Lifecycle stage of a Go/No-Go scorecard. */
export enum ScorecardStage {
  Draft = 'Draft',
  Submitted = 'Submitted',
  UnderReview = 'UnderReview',
  NeedsClarification = 'NeedsClarification',
  Accepted = 'Accepted',         // Director accepted; meeting pending scheduling
  MeetingScheduled = 'MeetingScheduled',
  CommitteeScoring = 'CommitteeScoring',
  DecisionReached = 'DecisionReached',
  Waiting = 'Waiting',           // WAIT decision — parked with follow-up date
  HandedOff = 'HandedOff',       // GO — handed off to Estimating
  Rejected = 'Rejected',         // Rejected by Director
  Closed = 'Closed',             // NO GO — closed (may be reopened)
}

/** Which side of the dual-score column. */
export enum ScoreColumn {
  Originator = 'Originator',
  Committee = 'Committee',
}
```

---

## BD-1.3 — `IGoNoGoScorecard.ts`

```typescript
// packages/models/src/bd/IGoNoGoScorecard.ts

import type {
  DeliveryMethod, GoNoGoDecision, HbcRegion, LeadOriginDept,
  ProjectSector, ScorecardStage, StrategicPursuitAnswer,
} from './BdEnums.js';
import type { IGoNoGoCriterionScore } from './IGoNoGoScoring.js';

/**
 * The complete Go/No-Go Scorecard record.
 * Derived from HB GO_NOGO Template Ver 2.2 2025.12.05.xlsx.
 * Two score columns: Originator (BD Manager) and Committee (consensus).
 */
export interface IGoNoGoScorecard {
  /** UUID v4 — immutable system key. */
  scorecardId: string;
  /** UUID v4 — links to the Projects SharePoint list after GO. Null until GO decision. */
  projectId?: string;
  /** Current workflow stage. */
  stage: ScorecardStage;
  /** Current version number (increments on every update). */
  version: number;
  /** Full version history — all prior versions preserved immutably. */
  versionHistory: IScorecardVersion[];

  // ─── PROJECT DETAILS HEADER ───────────────────────────────────────────────
  dateOfEvaluation?: string;             // ISO date
  originatorUpn: string;                 // BD Manager UPN
  originatorName: string;
  deptOfLeadOrigination: LeadOriginDept;

  projectName: string;
  clientName?: string;
  aeName?: string;
  aeAddress?: string;
  aeContactAndPhone?: string;

  cityLocation?: string;
  region?: HbcRegion;
  sector?: ProjectSector;
  subSector?: string;
  proposalBidDue?: string;               // ISO date
  awardDate?: string;                    // ISO date
  projectValue?: number;
  deliveryMethod?: DeliveryMethod;
  anticipatedFeePercent?: number;
  anticipatedGrossMargin?: number;
  preconDurationMonths?: number;
  squareFeet?: number;
  projectStartDate?: string;             // ISO date
  projectDurationMonths?: number;
  briefDescription?: string;

  // ─── RESOURCE / CAPACITY FIELDS ───────────────────────────────────────────
  estimatingCapacity?: boolean;
  estimatingDeliverable?: string;
  estimatingCostOfDeliverable?: number;
  mktgPursuitTeamCapacity?: boolean;
  pursuitsDeliverable?: string;
  estimatedPursuitCost?: number;
  idsCapacity?: boolean;
  idsDeliverable?: string;
  idsEstCost?: number;
  willGetPaidForPrecon?: boolean;
  scheduleRequired?: boolean;
  logisticsRequired?: boolean;
  financialsRequired?: boolean;

  // ─── SCORING ──────────────────────────────────────────────────────────────
  /** 20 criterion scores — both Originator and Committee columns. */
  criterionScores: IGoNoGoCriterionScore[];
  /** Computed: sum of Originator scores. */
  originatorTotal: number;
  /** Computed: sum of Committee scores. */
  committeeTotal: number;
  /** Computed: committeeTotal - originatorTotal. */
  scoreDifference: number;

  // ─── COMMENTS & RESOURCES ────────────────────────────────────────────────
  originatorComments?: string;
  committeeComments?: string;
  pursuitsMarketingComments?: string;
  pursuitsMarketingResources?: string;
  pursuitsMarketingHours?: number;
  estimatingComments?: string;
  estimatingResources?: string;
  estimatingHours?: number;
  idsComments?: string;
  idsResources?: string;
  idsHours?: number;

  // ─── STRATEGIC NARRATIVE FIELDS ───────────────────────────────────────────
  decisionMakingProcess?: string;
  hbDifferentiators?: string;
  winStrategy?: string;
  /** Answer to: "Is this a Strategic Pursuit or will a No Bid be Detrimental?" */
  strategicPursuitAnswer?: StrategicPursuitAnswer;
  decisionMakerAdvocate?: string;

  // ─── DEPARTMENTAL SECTION COMPLETION TRACKING ────────────────────────────
  deptSections: IDeptSectionStatus[];

  // ─── APPROVAL ─────────────────────────────────────────────────────────────
  /** Set by user with Executive Override role. */
  executiveOverrideByUpn?: string;
  executiveOverrideByName?: string;
  executiveOverrideAt?: string;
  decision?: GoNoGoDecision;
  decisionDate?: string;                 // ISO date
  dateApprovedPursuitBudget?: string;    // ISO date
  dateApprovedPreconBudget?: string;     // ISO date

  // ─── WAIT STATE ───────────────────────────────────────────────────────────
  waitFollowUpDate?: string;             // ISO date — required when decision = WAIT
  waitReminderSentAt?: string;

  // ─── DIRECTOR REVIEW ──────────────────────────────────────────────────────
  reviewedByUpn?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  clarificationRequest?: string;        // Free-text overall clarification comment
  fieldAnnotations?: IFieldAnnotation[]; // Inline per-field annotations
  committeeMeetingDeadline?: string;    // ISO date — set by Director on acceptance

  // ─── COMMITTEE MEETING ────────────────────────────────────────────────────
  meetingScheduledAt?: string;          // ISO date-time
  meetingScheduledByUpn?: string;
  coreCommitteeUpns: string[];          // Pre-populated from Admin config
  additionalInviteeUpns?: string[];     // Per-lead additions
  allAttendeeUpns: string[];            // coreCommitteeUpns + additionalInviteeUpns + originatorUpn

  // ─── DOCUMENTS ────────────────────────────────────────────────────────────
  attachments: IScorecardAttachment[];

  // ─── AUDIT ────────────────────────────────────────────────────────────────
  createdAt: string;
  lastUpdatedAt: string;
  lastUpdatedByUpn: string;
}

/** Per-department section completion tracking. */
export interface IDeptSectionStatus {
  dept: 'PursuitsMarketing' | 'Estimating' | 'IDS';
  taggedUpn?: string;
  taggedName?: string;
  isComplete: boolean;
  completedAt?: string;
}

/** Inline annotation on a specific scorecard field. */
export interface IFieldAnnotation {
  fieldName: string;        // e.g., "clientName", "criterion_3_originator"
  annotation: string;       // Director's comment on this specific field
  addedByUpn: string;
  addedAt: string;
}

/** Document attached to the scorecard. */
export interface IScorecardAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedByUpn: string;
  uploadedByName: string;
  uploadedAt: string;
  stage: ScorecardStage;    // The stage at which this document was attached
  description?: string;
}

/** Immutable version snapshot of a scorecard state. */
export interface IScorecardVersion {
  version: number;
  snapshotJson: string;     // JSON-serialized full IGoNoGoScorecard at this version
  changedByUpn: string;
  changedByName: string;
  changedAt: string;
  /** Per-criterion/field change comments — required for every update. */
  changeComments: IVersionChangeComment[];
}

export interface IVersionChangeComment {
  fieldOrCriterion: string; // e.g., "criterion_7_committee", "projectValue", "winStrategy"
  previousValue: string;
  newValue: string;
  comment: string;          // Required explanation for this change
}
```

---

## BD-1.4 — `IGoNoGoScoring.ts`

```typescript
// packages/models/src/bd/IGoNoGoScoring.ts

import type { ScoringTier } from './BdEnums.js';

/**
 * The 20 Go/No-Go scoring criteria.
 * Keys match the criterion order from the uploaded scorecard template.
 */
export enum GoNoGoCriterion {
  ClientImportance = 'ClientImportance',
  Competition = 'Competition',
  EstimatedWinOdds = 'EstimatedWinOdds',
  EstimatedProjectValue = 'EstimatedProjectValue',
  LocationEnvironment = 'LocationEnvironment',
  CommerciallyViable = 'CommerciallyViable',
  PreferredByDecisionMaker = 'PreferredByDecisionMaker',
  AeExperience = 'AeExperience',
  StaffAvailability = 'StaffAvailability',
  StaffExperienceProjectType = 'StaffExperienceProjectType',
  StaffExperienceGeography = 'StaffExperienceGeography',
  ScheduleFloat = 'ScheduleFloat',
  ContractTerms = 'ContractTerms',
  TypeOfContract = 'TypeOfContract',
  ClientFinancing = 'ClientFinancing',
  SectorDiversification = 'SectorDiversification',
  InvestmentFrontEnd = 'InvestmentFrontEnd',
  ProfitPotential = 'ProfitPotential',
  FeeEnhancementSubguard = 'FeeEnhancementSubguard',
  FeeEnhancementDirectPurchase = 'FeeEnhancementDirectPurchase',
}

/** The point values and labels for a single criterion at each tier. */
export interface ICriterionDefinition {
  criterion: GoNoGoCriterion;
  displayName: string;
  sortOrder: number;
  highValue: number;
  highLabel: string;
  averageValue: number;
  averageLabel: string;
  lowValue: number;
  lowLabel: string;
}

/**
 * Master criterion definitions — derived from uploaded scorecard template.
 * Used to render scoring UI and calculate totals.
 */
export const CRITERION_DEFINITIONS: ICriterionDefinition[] = [
  { criterion: GoNoGoCriterion.ClientImportance, displayName: 'Client Importance', sortOrder: 1, highValue: 6, highLabel: 'High Value/Repeat', averageValue: 4, averageLabel: 'High Value Future', lowValue: 2, lowLabel: 'Less Important' },
  { criterion: GoNoGoCriterion.Competition, displayName: 'Competition (short list)', sortOrder: 2, highValue: 4, highLabel: '1–3 or weak', averageValue: 2, averageLabel: '4–5 or average', lowValue: 0, lowLabel: '6+ or strong' },
  { criterion: GoNoGoCriterion.EstimatedWinOdds, displayName: 'Estimated Win Odds', sortOrder: 3, highValue: 6, highLabel: '>33%', averageValue: 4, averageLabel: '>25%', lowValue: 1, lowLabel: '<25%' },
  { criterion: GoNoGoCriterion.EstimatedProjectValue, displayName: 'Estimated Project $', sortOrder: 4, highValue: 4, highLabel: '>$50M', averageValue: 2, averageLabel: '$10M–$49M', lowValue: 1, lowLabel: '<$10M' },
  { criterion: GoNoGoCriterion.LocationEnvironment, displayName: 'Location/Environment', sortOrder: 5, highValue: 5, highLabel: 'Local, favorable', averageValue: 3, averageLabel: 'Close, average', lowValue: 1, lowLabel: 'Distant, severe' },
  { criterion: GoNoGoCriterion.CommerciallyViable, displayName: 'Commercially Viable', sortOrder: 6, highValue: 6, highLabel: 'Probability to Break Ground >75%', averageValue: 4, averageLabel: 'Probability to Break Ground >33%–<75%', lowValue: 2, lowLabel: 'High risk to start' },
  { criterion: GoNoGoCriterion.PreferredByDecisionMaker, displayName: 'Preferred by Decision Maker', sortOrder: 7, highValue: 6, highLabel: 'Yes', averageValue: 3, averageLabel: 'Neutral', lowValue: 0, lowLabel: 'No' },
  { criterion: GoNoGoCriterion.AeExperience, displayName: 'A&E Experience', sortOrder: 8, highValue: 5, highLabel: 'Successful', averageValue: 4, averageLabel: 'Mediocre', lowValue: 1, lowLabel: 'None or poor' },
  { criterion: GoNoGoCriterion.StaffAvailability, displayName: 'Staff Availability (Super/PM)', sortOrder: 9, highValue: 4, highLabel: 'On bench', averageValue: 2, averageLabel: 'Available', lowValue: 1, lowLabel: 'Must hire' },
  { criterion: GoNoGoCriterion.StaffExperienceProjectType, displayName: 'Staff Experience — Project Type', sortOrder: 10, highValue: 5, highLabel: 'Extensive >5', averageValue: 3, averageLabel: 'Average 1–4', lowValue: 0, lowLabel: 'Low 0' },
  { criterion: GoNoGoCriterion.StaffExperienceGeography, displayName: 'Staff Experience — Geography', sortOrder: 11, highValue: 5, highLabel: 'Extensive >5', averageValue: 3, averageLabel: 'Average 1–4', lowValue: 0, lowLabel: 'Low 0' },
  { criterion: GoNoGoCriterion.ScheduleFloat, displayName: 'Schedule (float potential)', sortOrder: 12, highValue: 4, highLabel: 'Liberal', averageValue: 3, averageLabel: 'Manageable', lowValue: 1, lowLabel: 'Tight' },
  { criterion: GoNoGoCriterion.ContractTerms, displayName: 'Contract Terms/Conditions', sortOrder: 13, highValue: 5, highLabel: 'Favorable', averageValue: 4, averageLabel: 'Average', lowValue: 1, lowLabel: 'Poor/Unknown' },
  { criterion: GoNoGoCriterion.TypeOfContract, displayName: 'Type of Contract', sortOrder: 14, highValue: 5, highLabel: 'Sole Source Neg.', averageValue: 4, averageLabel: 'GMP/CMAR', lowValue: 1, lowLabel: 'Bid' },
  { criterion: GoNoGoCriterion.ClientFinancing, displayName: 'Client Financing', sortOrder: 15, highValue: 5, highLabel: 'Secure', averageValue: 3, averageLabel: 'Available', lowValue: 1, lowLabel: 'Unknown' },
  { criterion: GoNoGoCriterion.SectorDiversification, displayName: 'Supports Sector Diversification (COE)', sortOrder: 16, highValue: 7, highLabel: 'COE Sector', averageValue: 5, averageLabel: 'Diverse Sector', lowValue: 2, lowLabel: 'Neither' },
  { criterion: GoNoGoCriterion.InvestmentFrontEnd, displayName: 'Investment Front End/Time (Estimating, Mktg.)', sortOrder: 17, highValue: 6, highLabel: 'Small', averageValue: 3, averageLabel: 'Average', lowValue: 1, lowLabel: 'Significant' },
  { criterion: GoNoGoCriterion.ProfitPotential, displayName: 'Profit Potential', sortOrder: 18, highValue: 6, highLabel: '>4.5%', averageValue: 4, averageLabel: '4–4.5%', lowValue: 2, lowLabel: '<4%' },
  { criterion: GoNoGoCriterion.FeeEnhancementSubguard, displayName: 'Fee Enhancement — Subguard/Billable Rates/Savings Split', sortOrder: 19, highValue: 6, highLabel: 'All 3', averageValue: 4, averageLabel: '2 of 3', lowValue: 2, lowLabel: '1 of 3' },
  { criterion: GoNoGoCriterion.FeeEnhancementDirectPurchase, displayName: 'Fee Enhancement — Direct Purchase (appliances, HVAC, Elec, etc.)', sortOrder: 20, highValue: 6, highLabel: '3 or more packages', averageValue: 4, averageLabel: 'Two packages', lowValue: 1, lowLabel: 'None' },
];

/** Maximum possible score (all High). */
export const MAX_POSSIBLE_SCORE = 106;
/** Score guide thresholds. */
export const SCORE_FOCUS_ALL_EFFORTS = 80; // Above 80
export const SCORE_PURSUE = 75;            // 75–80
// Below 75 = Drop

/** Score entry for a single criterion (both originator and committee columns). */
export interface IGoNoGoCriterionScore {
  criterion: GoNoGoCriterion;
  /** BD Manager's tier selection. */
  originatorTier: ScoringTier;
  /** Calculated from originatorTier using CRITERION_DEFINITIONS. */
  originatorValue: number;
  /** Committee consensus tier selection. */
  committeeTier: ScoringTier;
  /** Calculated from committeeTier. */
  committeeValue: number;
}

/** Utility: calculate point value from tier for a given criterion. */
export function getCriterionValue(criterion: GoNoGoCriterion, tier: ScoringTier): number {
  const def = CRITERION_DEFINITIONS.find(d => d.criterion === criterion);
  if (!def) return 0;
  switch (tier) {
    case ScoringTier.High: return def.highValue;
    case ScoringTier.Average: return def.averageValue;
    case ScoringTier.Low: return def.lowValue;
    default: return 0;
  }
}

/** Utility: determine score guide category from total. */
export type ScoreGuideCategory = 'FocusAllEfforts' | 'Pursue' | 'Drop' | 'NotScored';
export function getScoreGuideCategory(total: number): ScoreGuideCategory {
  if (total > SCORE_FOCUS_ALL_EFFORTS) return 'FocusAllEfforts';
  if (total >= SCORE_PURSUE) return 'Pursue';
  if (total > 0) return 'Drop';
  return 'NotScored';
}
```

---

## BD-1.5 — `IGoNoGoWorkflow.ts`

```typescript
// packages/models/src/bd/IGoNoGoWorkflow.ts

import type { ScorecardStage } from './BdEnums.js';

/** Valid stage transitions for the scorecard lifecycle. */
export const SCORECARD_STAGE_TRANSITIONS: Record<ScorecardStage, ScorecardStage[]> = {
  Draft:              ['Submitted'],
  Submitted:          ['UnderReview', 'NeedsClarification', 'Rejected'],
  UnderReview:        ['NeedsClarification', 'Accepted', 'Rejected'],
  NeedsClarification: ['Submitted'],       // BD Manager resubmits → Submitted
  Accepted:           ['MeetingScheduled'],
  MeetingScheduled:   ['CommitteeScoring'],
  CommitteeScoring:   ['DecisionReached'],
  DecisionReached:    ['HandedOff', 'Waiting', 'Closed'],
  Waiting:            ['Submitted'],       // BD Manager re-engages → back to Submitted (new version)
  HandedOff:          [],                  // Terminal
  Rejected:           ['Draft'],           // BD Manager can re-open → Draft (new version)
  Closed:             ['Draft'],           // BD Manager or Director re-opens → Draft (new version)
};

/** Notification payload sent at each stage transition. */
export interface IScorecardNotification {
  scorecardId: string;
  projectName: string;
  clientName?: string;
  fromStage: ScorecardStage;
  toStage: ScorecardStage;
  recipientUpns: string[];
  message: string;
  sentAt: string;
  handoffPackageUrl?: string;  // populated for GO decision notifications
}

/** The auto-assembled handoff package sent to Estimating Coordinator + Chief Estimator on GO. */
export interface IScorecardHandoffPackage {
  scorecardId: string;
  projectName: string;
  clientName?: string;
  sector?: string;
  region?: string;
  projectValue?: number;
  deliveryMethod?: string;
  anticipatedFeePercent?: number;
  proposalBidDue?: string;
  originatorName: string;
  originatorUpn: string;
  committeeTotal: number;
  scoreGuideCategory: string;
  decisionDate: string;
  winStrategy?: string;
  hbDifferentiators?: string;
  attachments: Array<{ fileName: string; fileUrl: string }>;
  /** Deep link to the full scorecard in HB Intel. */
  scorecardUrl: string;
}
```

---

## BD-1.6 — `IBdAnalytics.ts`

```typescript
// packages/models/src/bd/IBdAnalytics.ts

import type { GoNoGoDecision, HbcRegion, ProjectSector } from './BdEnums.js';
import type { GoNoGoCriterion } from './IGoNoGoScoring.js';

/** Analytics filter parameters. */
export interface IBdAnalyticsFilter {
  /** If set, scope to a single BD Manager's leads. If null, show all (Director/VP view). */
  bdManagerUpn?: string;
  periodStart?: string;   // ISO date
  periodEnd?: string;     // ISO date
  sector?: ProjectSector;
  region?: HbcRegion;
}

/** Top-level analytics summary. */
export interface IBdAnalyticsSummary {
  filter: IBdAnalyticsFilter;
  totalScorecards: number;
  goCount: number;
  noGoCount: number;
  waitCount: number;
  inProgressCount: number;
  winRate: number; // GO decisions that became awarded projects (0–100%)
  averageOriginatorScore: number;
  averageCommitteeScore: number;
  averageScoreDivergence: number; // avg |committee - originator|
  averageDaysPerStage: Record<string, number>; // stage name → avg days
  criterionDistribution: ICriterionDistribution[];
  committeeDivergenceBycriterion: ICriterionDivergence[];
  scoresByPeriod: IScoresPeriodBucket[];
  byBdManager?: IBdManagerBreakdown[];   // Director/VP view only
  bySector?: IBySectorBreakdown[];
  byRegion?: IByRegionBreakdown[];
}

export interface ICriterionDistribution {
  criterion: GoNoGoCriterion;
  displayName: string;
  avgOriginatorValue: number;
  avgCommitteeValue: number;
  highCount: number;
  averageCount: number;
  lowCount: number;
}

export interface ICriterionDivergence {
  criterion: GoNoGoCriterion;
  displayName: string;
  avgDivergence: number;   // avg |committee - originator| for this criterion
  maxDivergence: number;
}

export interface IScoresPeriodBucket {
  periodLabel: string;     // e.g., "Q1 2026"
  goCount: number;
  noGoCount: number;
  waitCount: number;
  avgCommitteeScore: number;
}

export interface IBdManagerBreakdown {
  bdManagerUpn: string;
  bdManagerName: string;
  totalScorecards: number;
  goCount: number;
  noGoCount: number;
  winRate: number;
  avgScore: number;
}

export interface IBySectorBreakdown {
  sector: ProjectSector;
  totalScorecards: number;
  goCount: number;
  avgScore: number;
}

export interface IByRegionBreakdown {
  region: HbcRegion;
  totalScorecards: number;
  goCount: number;
  avgScore: number;
}
```

---

## BD-1.7 — `index.ts` Barrel Export

```typescript
// packages/models/src/bd/index.ts
export * from './BdEnums.js';
export * from './IGoNoGoScorecard.js';
export * from './IGoNoGoScoring.js';
export * from './IGoNoGoWorkflow.js';
export * from './IBdAnalytics.js';
```

---

## Verification

```bash
pnpm turbo run build --filter=@hbc/models
# Expected: 0 type errors

grep "from.*\/bd\/" packages/models/src/index.ts
# Expected: export * from './bd/index.js';

# Spot-check: MAX_POSSIBLE_SCORE should equal sum of all highValue entries
# 6+4+6+4+5+6+6+5+4+5+5+4+5+5+5+7+6+6+6+6 = 106 ✓
```

<!-- IMPLEMENTATION PROGRESS & NOTES
Task file created: 2026-03-07
Status: Ready for implementation
Next: PH7-BD-2 — Routes & Shell Navigation
-->
