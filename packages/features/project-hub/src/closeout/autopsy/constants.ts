/**
 * P3-E10-T07 Project Autopsy and Learning Legacy constants.
 * Sections, finding types, action types, output types, workshop, root causes.
 */

import type {
  AutopsyActionStatus,
  AutopsyActionType,
  AutopsyFindingSeverity,
  AutopsyFindingType,
  AutopsyRecurrenceRisk,
  AutopsyTheme,
  AutopsyWorkshopFormat,
  FindingEvidenceRefType,
  LearningLegacyOutputType,
  PreSurveyResponseType,
  RootCauseCategory,
} from './enums.js';
import type {
  IActionTypeDefinition,
  IAutopsyLayerComparison,
  IAutopsySectionDefinition,
  IFindingTypeDefinition,
  IPreBriefingDataSource,
  IRootCauseLevel,
  IWorkshopAgendaBlock,
} from './types.js';

// -- Enum Arrays ------------------------------------------------------------

export const AUTOPSY_THEMES = [
  'BusinessCase', 'PreconPlanningProcurement', 'DesignCoordination',
  'CommercialChanges', 'ScheduleProduction', 'CostFinancialOutcomes',
  'SafetyRiskCompliance', 'QualityReworkTurnover', 'StakeholderCommunication',
  'CloseoutHandover', 'OccupancyUserExperience', 'DeveloperAssetOutcomes',
] as const satisfies ReadonlyArray<AutopsyTheme>;

export const AUTOPSY_FINDING_TYPES = [
  'Strength', 'Gap', 'Risk', 'Opportunity', 'SystemicPattern',
] as const satisfies ReadonlyArray<AutopsyFindingType>;

export const AUTOPSY_RECURRENCE_RISKS = [
  'Low', 'Medium', 'High',
] as const satisfies ReadonlyArray<AutopsyRecurrenceRisk>;

export const AUTOPSY_FINDING_SEVERITIES = [
  'Minor', 'Moderate', 'Significant', 'Critical',
] as const satisfies ReadonlyArray<AutopsyFindingSeverity>;

export const AUTOPSY_ACTION_TYPES = [
  'ProcessChange', 'StandardsUpdate', 'TrainingRequired', 'ToolOrSystemChange',
  'ContractualAdjustment', 'RelationshipAction', 'FeedForwardToEstimating', 'Other',
] as const satisfies ReadonlyArray<AutopsyActionType>;

export const AUTOPSY_ACTION_STATUSES = [
  'Open', 'InProgress', 'Complete', 'Deferred', 'Cancelled',
] as const satisfies ReadonlyArray<AutopsyActionStatus>;

export const LEARNING_LEGACY_OUTPUT_TYPES = [
  'FeedForwardLesson', 'StandardsUpdateRecommendation', 'ProcessImprovementProposal',
  'TrainingNeedIdentified', 'SupplierOrPartnerInsight', 'TechnologyOrToolInsight',
  'ClientOrOwnerInsight', 'DeveloperAssetInsight',
] as const satisfies ReadonlyArray<LearningLegacyOutputType>;

export const AUTOPSY_WORKSHOP_FORMATS = [
  'FullDay', 'HalfDay', 'Virtual', 'Hybrid',
] as const satisfies ReadonlyArray<AutopsyWorkshopFormat>;

export const ROOT_CAUSE_CATEGORIES = [
  'Planning', 'Estimation', 'Procurement', 'Communication', 'ContractClarity',
  'Staffing', 'Process', 'Technology', 'External', 'OwnerDecision',
  'DesignQuality', 'SubPerformance', 'Cultural', 'Other',
] as const satisfies ReadonlyArray<RootCauseCategory>;

export const PRE_SURVEY_RESPONSE_TYPES = [
  'Scale1to5', 'Scale1to10', 'Text', 'MultiSelect', 'Ranked',
] as const satisfies ReadonlyArray<PreSurveyResponseType>;

export const FINDING_EVIDENCE_REF_TYPES = [
  'LessonEntry', 'ScorecardCriterion', 'ScheduleSnapshot', 'FinancialVariance',
  'SafetyEvent', 'PermitEvent', 'PreSurveyResponse', 'ExternalDocument',
] as const satisfies ReadonlyArray<FindingEvidenceRefType>;

// -- Section Definitions (§9.1) ---------------------------------------------

export const AUTOPSY_SECTION_DEFINITIONS: ReadonlyArray<IAutopsySectionDefinition> = [
  { key: 'BusinessCase', label: 'Business Case & Success Criteria', applicableWhen: 'Always' },
  { key: 'PreconPlanningProcurement', label: 'Preconstruction, Planning & Procurement', applicableWhen: 'Always' },
  { key: 'DesignCoordination', label: 'Design, Coordination & Constructability', applicableWhen: 'Always' },
  { key: 'CommercialChanges', label: 'Commercial, Changes & Contracts', applicableWhen: 'Always' },
  { key: 'ScheduleProduction', label: 'Schedule, Production & Logistics', applicableWhen: 'Always' },
  { key: 'CostFinancialOutcomes', label: 'Cost, Forecasting & Financial Outcomes', applicableWhen: 'Always' },
  { key: 'SafetyRiskCompliance', label: 'Safety, Risk & Compliance', applicableWhen: 'Always' },
  { key: 'QualityReworkTurnover', label: 'Quality, Rework & Turnover Readiness', applicableWhen: 'Always' },
  { key: 'StakeholderCommunication', label: 'Stakeholder Management & Communication', applicableWhen: 'Always' },
  { key: 'CloseoutHandover', label: 'Closeout, Handover & Warranty', applicableWhen: 'Always' },
  { key: 'OccupancyUserExperience', label: 'Occupancy, Operations & User Experience', applicableWhen: 'operationalOutcomesApplicable = true' },
  { key: 'DeveloperAssetOutcomes', label: 'Developer & Asset Performance Outcomes', applicableWhen: 'developerProjectApplicable = true' },
];

// -- Finding Type Definitions (§11.1) ----------------------------------------

export const AUTOPSY_FINDING_TYPE_DEFINITIONS: ReadonlyArray<IFindingTypeDefinition> = [
  { type: 'Strength', definition: 'Something that worked well and should be replicated' },
  { type: 'Gap', definition: 'Something that fell short and should be improved' },
  { type: 'Risk', definition: 'A condition that created risk; may recur on similar projects' },
  { type: 'Opportunity', definition: 'Potential improvement identified; not yet acted on' },
  { type: 'SystemicPattern', definition: 'A pattern that recurs across multiple projects or scope areas' },
];

// -- Action Type Definitions (§13.2) -----------------------------------------

export const AUTOPSY_ACTION_TYPE_DEFINITIONS: ReadonlyArray<IActionTypeDefinition> = [
  { type: 'ProcessChange', description: 'Revise how we execute a specific process', typicalOwner: 'PM, Operations Director' },
  { type: 'StandardsUpdate', description: 'Update a company standard, template, or policy', typicalOwner: 'MOE, PE' },
  { type: 'TrainingRequired', description: 'Identify and deliver training to address a gap', typicalOwner: 'Safety, Operations' },
  { type: 'ToolOrSystemChange', description: 'Modify or adopt a technology', typicalOwner: 'IT, BIM/VDC' },
  { type: 'ContractualAdjustment', description: 'Revise standard contract language or terms', typicalOwner: 'Legal, PE' },
  { type: 'RelationshipAction', description: 'Action specific to a sub, owner, or trade partner', typicalOwner: 'PE, PM' },
  { type: 'FeedForwardToEstimating', description: 'Feed insight to estimating for future bid strategy', typicalOwner: 'Estimator' },
  { type: 'Other', description: 'Does not fit above', typicalOwner: 'Assigned owner' },
];

// -- Root-Cause Levels (§12.2) -----------------------------------------------

export const AUTOPSY_ROOT_CAUSE_LEVELS: ReadonlyArray<IRootCauseLevel> = [
  { level: 'Immediate', question: 'What directly caused this?', example: 'The sub ran out of material' },
  { level: 'Contributing', question: 'What allowed the immediate cause to occur?', example: 'Procurement lead times were underestimated in the estimate' },
  { level: 'Systemic', question: 'What organizational or process weakness enabled this?', example: 'We have no systematic long-lead procurement review in pre-con' },
  { level: 'Cultural / Behavioral', question: 'What behaviors or norms reinforced the problem?', example: "Teams don't escalate schedule concerns early enough" },
];

// -- Workshop Agenda (§8.2) --------------------------------------------------

export const AUTOPSY_WORKSHOP_AGENDA: ReadonlyArray<IWorkshopAgendaBlock> = [
  { time: '08:00 – 08:30', block: 'Welcome and ground rules', description: 'PE sets expectations; psychological safety; purpose of the autopsy vs. blame' },
  { time: '08:30 – 09:00', block: 'Briefing pack review', description: 'PM walks through pre-briefing pack highlights; data corrections if any' },
  { time: '09:00 – 10:30', block: 'Part 1: What happened — Delivery review', description: 'Structured review of delivery experience by autopsy section/theme' },
  { time: '10:30 – 10:45', block: 'Break', description: '' },
  { time: '10:45 – 12:00', block: 'Part 2: Why it happened — Root cause analysis', description: 'PE leads root-cause mapping for top-priority findings; contributing factor capture' },
  { time: '12:00 – 13:00', block: 'Lunch break', description: '' },
  { time: '13:00 – 14:30', block: 'Part 3: Sub-specific findings', description: 'Structured review of subcontractor scorecard findings; cross-reference with delivery events' },
  { time: '14:30 – 15:30', block: 'Part 4: What changes — Action register', description: 'For each root cause, what will the organization do differently? Standards updates; process changes; training needs' },
  { time: '15:30 – 16:00', block: 'Part 5: Legacy synthesis', description: 'PE leads discussion: what are the most important learning legacies from this project?' },
  { time: '16:00 – 16:30', block: 'Wrap-up and commitments', description: 'Action owners confirmed; PE closes; next steps' },
];

// -- Pre-Briefing Data Sources (§7.1) ----------------------------------------

export const AUTOPSY_PRE_BRIEFING_DATA_SOURCES: ReadonlyArray<IPreBriefingDataSource> = [
  { section: 'Project Identity', source: 'Project record', dataPoints: 'Name, number, location, type, market sector, delivery method, size band, contract value' },
  { section: 'Team', source: 'Project record', dataPoints: 'PM, SUPT, PE, estimator, key subcontractors' },
  { section: 'Schedule Performance', source: 'P3-E5/E6 Schedule', dataPoints: 'Original duration vs. actual; baseline vs. actual finish; key milestone actuals; critical float history; schedule variance narrative' },
  { section: 'Financial Performance', source: 'P3-E4 Financial', dataPoints: 'Original contract value; final contract value; contract variance; contingency budget vs. usage; buyout result; top CO values' },
  { section: 'Safety Summary', source: 'P3-E8 Safety', dataPoints: 'TRIR; recordable incidents; near-misses; stop-work events; safety inspection scores' },
  { section: 'Subcontractor Summary', source: 'Submitted SubcontractorScorecard records', dataPoints: 'Score by sub, section, and overall; reBid recommendations; any Unsatisfactory ratings' },
  { section: 'Lessons Learned Summary', source: 'Submitted LessonEntry records', dataPoints: 'Entry count by category; impact magnitude distribution; top 5 by applicability; any Critical-magnitude entries' },
  { section: 'Permit History', source: 'P3-E7 Permits', dataPoints: 'Permit count; first submission to final dates; inspection pass/fail rates; any stop-work orders' },
  { section: 'Work Queue History', source: 'P3-D3 Work Queue', dataPoints: 'Count of critical/high items raised during delivery; unresolved items' },
  { section: 'Pre-Survey Synthesis', source: 'AutopsyPreSurveyResponse records', dataPoints: 'Aggregate theme ratings; top-mentioned challenges (de-attributed)' },
];

// -- Layer Comparison (§2) ---------------------------------------------------

export const AUTOPSY_LAYER_COMPARISON: ReadonlyArray<IAutopsyLayerComparison> = [
  { layer: 'Raw learning ledger', tool: 'Lessons Learned', operator: 'PM, SUPT', granularity: 'Individual events', timing: 'Rolling throughout delivery' },
  { layer: 'Partner performance ledger', tool: 'Subcontractor Scorecard', operator: 'PM, SUPT, PE', granularity: 'Per-sub per-criterion evaluation', timing: 'Interim + FinalCloseout' },
  { layer: 'Synthesis and institutional engine', tool: 'Project Autopsy', operator: 'PE (lead), PM (coord)', granularity: 'Cross-cutting patterns; system-level insights', timing: 'Closeout workshop' },
];

// -- Label Maps -------------------------------------------------------------

export const AUTOPSY_THEME_LABELS: Readonly<Record<AutopsyTheme, string>> = {
  BusinessCase: 'Business Case & Success Criteria',
  PreconPlanningProcurement: 'Preconstruction, Planning & Procurement',
  DesignCoordination: 'Design, Coordination & Constructability',
  CommercialChanges: 'Commercial, Changes & Contracts',
  ScheduleProduction: 'Schedule, Production & Logistics',
  CostFinancialOutcomes: 'Cost, Forecasting & Financial Outcomes',
  SafetyRiskCompliance: 'Safety, Risk & Compliance',
  QualityReworkTurnover: 'Quality, Rework & Turnover Readiness',
  StakeholderCommunication: 'Stakeholder Management & Communication',
  CloseoutHandover: 'Closeout, Handover & Warranty',
  OccupancyUserExperience: 'Occupancy, Operations & User Experience',
  DeveloperAssetOutcomes: 'Developer & Asset Performance Outcomes',
};

export const AUTOPSY_FINDING_TYPE_LABELS: Readonly<Record<AutopsyFindingType, string>> = {
  Strength: 'Strength',
  Gap: 'Gap',
  Risk: 'Risk',
  Opportunity: 'Opportunity',
  SystemicPattern: 'Systemic Pattern',
};

export const AUTOPSY_ACTION_TYPE_LABELS: Readonly<Record<AutopsyActionType, string>> = {
  ProcessChange: 'Process Change',
  StandardsUpdate: 'Standards Update',
  TrainingRequired: 'Training Required',
  ToolOrSystemChange: 'Tool or System Change',
  ContractualAdjustment: 'Contractual Adjustment',
  RelationshipAction: 'Relationship Action',
  FeedForwardToEstimating: 'Feed Forward to Estimating',
  Other: 'Other',
};

export const AUTOPSY_ACTION_STATUS_LABELS: Readonly<Record<AutopsyActionStatus, string>> = {
  Open: 'Open',
  InProgress: 'In Progress',
  Complete: 'Complete',
  Deferred: 'Deferred',
  Cancelled: 'Cancelled',
};

export const LEARNING_LEGACY_OUTPUT_TYPE_LABELS: Readonly<Record<LearningLegacyOutputType, string>> = {
  FeedForwardLesson: 'Feed-Forward Lesson',
  StandardsUpdateRecommendation: 'Standards Update Recommendation',
  ProcessImprovementProposal: 'Process Improvement Proposal',
  TrainingNeedIdentified: 'Training Need Identified',
  SupplierOrPartnerInsight: 'Supplier or Partner Insight',
  TechnologyOrToolInsight: 'Technology or Tool Insight',
  ClientOrOwnerInsight: 'Client or Owner Insight',
  DeveloperAssetInsight: 'Developer & Asset Insight',
};

export const ROOT_CAUSE_CATEGORY_LABELS: Readonly<Record<RootCauseCategory, string>> = {
  Planning: 'Planning',
  Estimation: 'Estimation',
  Procurement: 'Procurement',
  Communication: 'Communication',
  ContractClarity: 'Contract Clarity',
  Staffing: 'Staffing',
  Process: 'Process',
  Technology: 'Technology',
  External: 'External',
  OwnerDecision: 'Owner Decision',
  DesignQuality: 'Design Quality',
  SubPerformance: 'Sub Performance',
  Cultural: 'Cultural',
  Other: 'Other',
};
