/**
 * P3-E10-T05 Lessons Learned Operating Model constants.
 * Categories, thresholds, approved verbs, workflow, business rules.
 */

import type {
  DeliveryMethod,
  ImpactMagnitude,
  LessonCategory,
  MarketSector,
  ProjectSizeBand,
} from './enums.js';
import type {
  IImpactMagnitudeThreshold,
  ILessonLayerDefinition,
  ILessonsAutopsyRelationship,
  ILessonsBusinessRule,
  ILessonsWorkflowStep,
} from './types.js';

// -- Enum Arrays ------------------------------------------------------------

export const LESSON_CATEGORIES = [
  'PreConstruction', 'EstimatingBid', 'Procurement', 'Schedule', 'CostBudget',
  'Safety', 'Quality', 'Subcontractors', 'DesignRFIs', 'OwnerClient',
  'TechnologyBIM', 'WorkforceLabor', 'Commissioning', 'CloseoutTurnover', 'Other',
] as const satisfies ReadonlyArray<LessonCategory>;

export const DELIVERY_METHODS = [
  'DesignBidBuild', 'DesignBuild', 'CMAtRisk', 'GMP',
  'LumpSum', 'IDIQJobOrder', 'PublicPrivateP3',
] as const satisfies ReadonlyArray<DeliveryMethod>;

export const MARKET_SECTORS = [
  'K12Education', 'HigherEducation', 'HealthcareMedical', 'GovernmentCivic',
  'OfficeCommercial', 'IndustrialMfg', 'RetailHospitality', 'ResidentialMixedUse',
  'TransportationInfra', 'DataCenterTech', 'MissionCritical', 'RenovationHistoric', 'Other',
] as const satisfies ReadonlyArray<MarketSector>;

export const PROJECT_SIZE_BANDS = [
  'Under1M', 'OneToFiveM', 'FiveToFifteenM',
  'FifteenToFiftyM', 'FiftyToOneHundredM', 'OverOneHundredM',
] as const satisfies ReadonlyArray<ProjectSizeBand>;

export const IMPACT_MAGNITUDES = [
  'Minor', 'Moderate', 'Significant', 'Critical',
] as const satisfies ReadonlyArray<ImpactMagnitude>;

// -- Label Maps -------------------------------------------------------------

export const LESSON_CATEGORY_LABELS: Readonly<Record<LessonCategory, string>> = {
  PreConstruction: 'Pre-Construction',
  EstimatingBid: 'Estimating / Bid',
  Procurement: 'Procurement',
  Schedule: 'Schedule',
  CostBudget: 'Cost / Budget',
  Safety: 'Safety',
  Quality: 'Quality',
  Subcontractors: 'Subcontractors',
  DesignRFIs: 'Design / RFIs',
  OwnerClient: 'Owner / Client',
  TechnologyBIM: 'Technology / BIM',
  WorkforceLabor: 'Workforce / Labor',
  Commissioning: 'Commissioning',
  CloseoutTurnover: 'Closeout / Turnover',
  Other: 'Other',
};

export const DELIVERY_METHOD_LABELS: Readonly<Record<DeliveryMethod, string>> = {
  DesignBidBuild: 'Design-Bid-Build',
  DesignBuild: 'Design-Build',
  CMAtRisk: 'CM at Risk',
  GMP: 'GMP',
  LumpSum: 'Lump Sum',
  IDIQJobOrder: 'IDIQ / Job Order',
  PublicPrivateP3: 'Public-Private (P3)',
};

export const MARKET_SECTOR_LABELS: Readonly<Record<MarketSector, string>> = {
  K12Education: 'K-12 Education',
  HigherEducation: 'Higher Education',
  HealthcareMedical: 'Healthcare / Medical',
  GovernmentCivic: 'Government / Civic',
  OfficeCommercial: 'Office / Commercial',
  IndustrialMfg: 'Industrial / Manufacturing',
  RetailHospitality: 'Retail / Hospitality',
  ResidentialMixedUse: 'Residential / Mixed-Use',
  TransportationInfra: 'Transportation / Infrastructure',
  DataCenterTech: 'Data Center / Tech',
  MissionCritical: 'Mission Critical',
  RenovationHistoric: 'Renovation / Historic',
  Other: 'Other',
};

export const PROJECT_SIZE_BAND_LABELS: Readonly<Record<ProjectSizeBand, string>> = {
  Under1M: 'Under $1M',
  OneToFiveM: '$1M – $5M',
  FiveToFifteenM: '$5M – $15M',
  FifteenToFiftyM: '$15M – $50M',
  FiftyToOneHundredM: '$50M – $100M',
  OverOneHundredM: 'Over $100M',
};

export const IMPACT_MAGNITUDE_LABELS: Readonly<Record<ImpactMagnitude, string>> = {
  Minor: 'Minor (< $10K or < 2 days)',
  Moderate: 'Moderate ($10K–$50K or 2–10 days)',
  Significant: 'Significant ($50K–$200K or 10–30 days)',
  Critical: 'Critical (> $200K or > 30 days)',
};

// -- Impact Magnitude Thresholds (§3.2) -------------------------------------

export const IMPACT_MAGNITUDE_THRESHOLDS: ReadonlyArray<IImpactMagnitudeThreshold> = [
  { magnitude: 'Minor', costCondition: '< $10,000', scheduleCondition: '< 2 calendar days', costMin: 0, costMax: 9999, scheduleDaysMin: 0, scheduleDaysMax: 1 },
  { magnitude: 'Moderate', costCondition: '$10,000 – $50,000', scheduleCondition: '2 – 10 calendar days', costMin: 10000, costMax: 50000, scheduleDaysMin: 2, scheduleDaysMax: 10 },
  { magnitude: 'Significant', costCondition: '$50,001 – $200,000', scheduleCondition: '11 – 30 calendar days', costMin: 50001, costMax: 200000, scheduleDaysMin: 11, scheduleDaysMax: 30 },
  { magnitude: 'Critical', costCondition: '> $200,000', scheduleCondition: '> 30 calendar days', costMin: 200001, costMax: null, scheduleDaysMin: 31, scheduleDaysMax: null },
];

// -- Approved Action Verbs (§4) — 32 verbs ----------------------------------

export const APPROVED_ACTION_VERBS: ReadonlySet<string> = new Set([
  'assign', 'audit', 'build', 'clarify', 'codify', 'conduct', 'confirm',
  'create', 'define', 'deploy', 'develop', 'document', 'ensure', 'establish',
  'evaluate', 'implement', 'include', 'incorporate', 'mandate', 'pilot',
  'prepare', 'publish', 'require', 'review', 'revise', 'schedule',
  'standardize', 'train', 'update', 'use', 'validate', 'verify',
]);

// -- Layer Definitions (§1) -------------------------------------------------

export const LESSONS_LAYER_DEFINITIONS: ReadonlyArray<ILessonLayerDefinition> = [
  { layer: 'Raw learning ledger', recordType: 'LessonEntry', whenCreated: 'Any project phase', creator: 'PM, SUPT', purpose: 'Captures individual structured learning events as they occur' },
  { layer: 'Closeout synthesis container', recordType: 'LessonsLearningReport', whenCreated: 'Closeout phase', creator: 'PM', purpose: 'Assembles rolling entries; adds project-level context; packages for PE approval' },
  { layer: 'Institutional synthesis', recordType: 'AutopsyRecord + LearningLegacyOutput', whenCreated: 'Closeout workshop', creator: 'PE (lead), PM', purpose: 'Cross-cutting pattern analysis; feed-forward outputs' },
];

// -- Workflow Steps (§5) ----------------------------------------------------

export const LESSONS_WORKFLOW_STEPS: ReadonlyArray<ILessonsWorkflowStep> = [
  { stepNumber: 1, phase: 'Rolling Capture', description: 'PM or SUPT creates LessonEntry at any lifecycle state; reportId = null; system validates impact magnitude and recommendation verb; saved as DRAFT' },
  { stepNumber: 2, phase: 'Closeout Synthesis', description: 'LessonsLearningReport container created at closeout activation; PM reviews, edits, links entries; fills report-level context; submits (SUBMITTED); Work Queue item raised for PE' },
  { stepNumber: 3, phase: 'PE Review', description: 'PE reviews from Work Queue; may annotate via @hbc/field-annotations; may request revision (REVISION_REQUIRED) or approve (PE_APPROVED); approval triggers item 6.5, spine event, LESSONS_APPROVED milestone' },
  { stepNumber: 4, phase: 'Org Index Publication', description: 'At ARCHIVED lifecycle state, system creates LessonsIntelligenceIndexEntry for each PE_APPROVED entry; entries immutable; publicationStatus → PUBLISHED; spine event emitted' },
];

// -- Business Rules (§6) — 9 rules -----------------------------------------

export const LESSONS_BUSINESS_RULES: ReadonlyArray<ILessonsBusinessRule> = [
  { ruleNumber: 1, description: 'Rolling capture: Lesson entries may be created at any project lifecycle state' },
  { ruleNumber: 2, description: 'One report per project: LessonsLearningReport enforces unique constraint on projectId' },
  { ruleNumber: 3, description: 'Minimum one entry: Report must have at least one linked LessonEntry before submission' },
  { ruleNumber: 4, description: 'All entries must be linked: Unlinked entries flagged; PM must link or archive before report submission' },
  { ruleNumber: 5, description: 'Sequential numbering: LessonEntry.lessonNumber auto-assigned and never reused' },
  { ruleNumber: 6, description: 'PE approval gates item 6.5: Checklist item 6.5 resolves only on PE_APPROVED — not on SUBMITTED' },
  { ruleNumber: 7, description: 'Immutability after PE approval: All LessonEntry content fields and LessonsLearningReport header fields immutable after PE_APPROVED' },
  { ruleNumber: 8, description: 'Keyword deduplication: Keywords stored as deduplicated string array; normalized lowercase and trimmed' },
  { ruleNumber: 9, description: 'Reports module consumption: Reports receives frozen snapshot — does not read live lesson records' },
];

// -- Autopsy Relationship Table (§8) ----------------------------------------

export const LESSONS_AUTOPSY_RELATIONSHIP_TABLE: ReadonlyArray<ILessonsAutopsyRelationship> = [
  { aspect: 'Nature', lessonsLearned: 'Raw learning ledger', projectAutopsy: 'Cross-cutting synthesis and institutional learning engine' },
  { aspect: 'Primary operators', lessonsLearned: 'PM and SUPT', projectAutopsy: 'PE leads; PM coordinates' },
  { aspect: 'Creation timing', lessonsLearned: 'Throughout delivery', projectAutopsy: 'At closeout' },
  { aspect: 'Record unit', lessonsLearned: 'Each entry is discrete observed learning event', projectAutopsy: 'Findings synthesize patterns across multiple entries and other sources' },
  { aspect: 'Approval scope', lessonsLearned: 'PE approves for org publication as package', projectAutopsy: 'PE approves each LearningLegacyOutput individually' },
  { aspect: 'Publication target', lessonsLearned: 'LessonsIntelligence index', projectAutopsy: 'LearningLegacy feed' },
  { aspect: 'Retrievability', lessonsLearned: 'Individual lessons searchable', projectAutopsy: 'Learning legacy outputs browsable; tagging enables retrieval' },
];
