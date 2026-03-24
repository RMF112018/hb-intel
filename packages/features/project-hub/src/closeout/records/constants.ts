/**
 * P3-E10-T02 Project Closeout Module record-level constants.
 */

import type {
  CloseoutChecklistItemResult,
  CloseoutChecklistJurisdiction,
  CloseoutChecklistLifecycleStageTrigger,
  CloseoutChecklistResponsibleRole,
  CloseoutPublicationState,
  CloseoutReBidRecommendation,
  CloseoutScorecardEvaluationType,
} from './enums.js';
import type {
  IAutopsyRecordInvariant,
  IAutopsyRelationship,
  ICloseoutImmutabilityRule,
  ICloseoutPublicationStateApplicability,
  ICloseoutPublicationStateDetail,
  ICloseoutRecordFamilyRelationship,
} from './types.js';

// -- Enum Arrays ------------------------------------------------------------

export const CLOSEOUT_PUBLICATION_STATES = [
  'DRAFT', 'SUBMITTED', 'PE_REVIEW', 'REVISION_REQUIRED',
  'PE_APPROVED', 'PUBLISHED', 'SUPERSEDED', 'ARCHIVED',
] as const satisfies ReadonlyArray<CloseoutPublicationState>;

export const CLOSEOUT_CHECKLIST_ITEM_RESULTS = [
  'Yes', 'No', 'NA', 'Pending',
] as const satisfies ReadonlyArray<CloseoutChecklistItemResult>;

export const CLOSEOUT_CHECKLIST_RESPONSIBLE_ROLES = [
  'PM', 'SUPT', 'PE', 'OWNER', 'AHJ', 'ARCHITECT', 'ENGINEER', 'MOE',
] as const satisfies ReadonlyArray<CloseoutChecklistResponsibleRole>;

export const CLOSEOUT_CHECKLIST_LIFECYCLE_STAGE_TRIGGERS = [
  'ALWAYS', 'INSPECTIONS', 'TURNOVER', 'POST_TURNOVER', 'FINAL_COMPLETION', 'ARCHIVE_READY',
] as const satisfies ReadonlyArray<CloseoutChecklistLifecycleStageTrigger>;

export const CLOSEOUT_CHECKLIST_JURISDICTIONS = [
  'PBC', 'Other',
] as const satisfies ReadonlyArray<CloseoutChecklistJurisdiction>;

export const CLOSEOUT_SCORECARD_EVALUATION_TYPES = [
  'Interim', 'FinalCloseout',
] as const satisfies ReadonlyArray<CloseoutScorecardEvaluationType>;

export const CLOSEOUT_REBID_RECOMMENDATIONS = [
  'Yes', 'YesWithConditions', 'No',
] as const satisfies ReadonlyArray<CloseoutReBidRecommendation>;

// -- Publication State Details (§2) -----------------------------------------

export const CLOSEOUT_PUBLICATION_STATE_DETAILS: ReadonlyArray<ICloseoutPublicationStateDetail> = [
  { state: 'DRAFT', code: 'DRAFT', editable: true, orgEligible: false, description: 'Working; PM/SUPT can edit freely' },
  { state: 'SUBMITTED', code: 'SUBMITTED', editable: false, orgEligible: false, description: 'PM submitted; locked for PE review; work queue item raised for PE' },
  { state: 'PE_REVIEW', code: 'PE_REVIEW', editable: false, orgEligible: false, description: 'PE has opened for review; may annotate via @hbc/field-annotations' },
  { state: 'REVISION_REQUIRED', code: 'REVISION_REQUIRED', editable: true, orgEligible: false, description: 'PE rejected; PM must revise and resubmit' },
  { state: 'PE_APPROVED', code: 'PE_APPROVED', editable: false, orgEligible: true, description: 'PE approved; eligible for org publication at archive event' },
  { state: 'PUBLISHED', code: 'PUBLISHED', editable: false, orgEligible: false, description: 'Permanent; immutable; part of org intelligence' },
  { state: 'SUPERSEDED', code: 'SUPERSEDED', editable: false, orgEligible: false, description: 'A newer publication overwrites this entry for the same sub (SubIntelligence only)' },
  { state: 'ARCHIVED', code: 'ARCHIVED', editable: false, orgEligible: false, description: 'Project archived without PE approval; records preserved but not published' },
];

// -- Publication State Labels -----------------------------------------------

export const CLOSEOUT_PUBLICATION_STATE_LABELS: Readonly<Record<CloseoutPublicationState, string>> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  PE_REVIEW: 'PE Review',
  REVISION_REQUIRED: 'Revision Required',
  PE_APPROVED: 'PE Approved',
  PUBLISHED: 'Published to Org Index',
  SUPERSEDED: 'Superseded',
  ARCHIVED: 'Archived',
};

// -- Publication State Applicability (§2.1) ---------------------------------

export const CLOSEOUT_PUBLICATION_STATE_APPLICABILITY: ReadonlyArray<ICloseoutPublicationStateApplicability> = [
  { family: 'CloseoutChecklist', usesPublicationStates: false, notes: 'Uses lifecycle state machine (T04); not publishable to org' },
  { family: 'CloseoutChecklistItem', usesPublicationStates: false, notes: 'Item-level result states only (T04)' },
  { family: 'SubcontractorScorecard', usesPublicationStates: true, notes: 'FinalCloseout: full 6-state model; Interim: partial (DRAFT, SUBMITTED, ARCHIVED)' },
  { family: 'LessonEntry', usesPublicationStates: true, notes: 'Individual entries follow their parent report publication state' },
  { family: 'LessonsLearningReport', usesPublicationStates: true, notes: 'Full 6-state model; gates individual entry publication' },
  { family: 'AutopsyRecord', usesPublicationStates: true, notes: 'Full 6-state model; gates LearningLegacyOutput publication' },
  { family: 'LearningLegacyOutput', usesPublicationStates: true, notes: 'Each output has independent PE approval within the autopsy' },
  { family: 'AutopsyFinding', usesPublicationStates: false, notes: 'Project-scoped; discoverable in org context only via LearningLegacyOutput references' },
  { family: 'AutopsyAction', usesPublicationStates: false, notes: 'Project-scoped; assigned to users via Work Queue; not publishable' },
  { family: 'ChecklistTemplate', usesPublicationStates: false, notes: 'MOE-governed versioned template; not a publishable record' },
];

// -- Record Family Hierarchy (§1) -------------------------------------------

export const CLOSEOUT_RECORD_FAMILY_HIERARCHY: ReadonlyArray<ICloseoutRecordFamilyRelationship> = [
  { parent: 'ChecklistTemplate', child: 'CloseoutChecklist', cardinality: '1:N', notes: 'Template instantiates checklists' },
  { parent: 'CloseoutChecklist', child: 'CloseoutChecklistSection', cardinality: '1:7', notes: '7 sections per checklist; template-driven' },
  { parent: 'CloseoutChecklistSection', child: 'CloseoutChecklistItem', cardinality: '1:N', notes: 'Governed + overlay items per section' },
  { parent: 'CloseoutChecklist', child: 'CloseoutMilestone', cardinality: '1:13', notes: '13 milestones per project' },
  { parent: 'SubcontractorScorecard', child: 'ScorecardSection', cardinality: '1:6', notes: '6 sections per scorecard; fixed' },
  { parent: 'ScorecardSection', child: 'ScorecardCriterion', cardinality: '1:N', notes: '4-5 per section = 28 total' },
  { parent: 'SubcontractorScorecard', child: 'SubIntelligenceIndexEntry', cardinality: '1:1', notes: 'PE approval → org read model' },
  { parent: 'LessonEntry', child: 'LessonsLearningReport', cardinality: 'N:1', notes: 'Lessons synthesized into report' },
  { parent: 'LessonsLearningReport', child: 'LessonsIntelligenceIndexEntry', cardinality: '1:N', notes: 'PE approval → org read model entries' },
  { parent: 'AutopsyRecord', child: 'AutopsySection', cardinality: '1:12', notes: 'Up to 12 thematic sections' },
  { parent: 'AutopsyRecord', child: 'AutopsyPreSurveyResponse', cardinality: '1:N', notes: '1 per invited participant' },
  { parent: 'AutopsyRecord', child: 'AutopsyFinding', cardinality: '1:N', notes: '0+ per autopsy; may span sections' },
  { parent: 'AutopsyRecord', child: 'AutopsyAction', cardinality: '1:N', notes: '0+ per autopsy' },
  { parent: 'AutopsyRecord', child: 'LearningLegacyOutput', cardinality: '1:N', notes: '0+ per autopsy' },
  { parent: 'LearningLegacyOutput', child: 'LearningLegacyFeedEntry', cardinality: '1:1', notes: 'PE approval → org read model' },
];

// -- Autopsy Invariants (§5.1) ----------------------------------------------

export const CLOSEOUT_AUTOPSY_INVARIANTS: ReadonlyArray<IAutopsyRecordInvariant> = [
  { invariant: 'One autopsy per project', rule: 'AutopsyRecord has unique constraint on projectId' },
  { invariant: 'PE leads', rule: 'leadFacilitatorUserId defaults to PE; any delegation requires PE annotation' },
  { invariant: 'Findings are not lessons', rule: 'AutopsyFinding is distinct from LessonEntry; findings may reference lessons by ID' },
  { invariant: 'Actions are not findings', rule: 'AutopsyAction is a commitment created from a finding; findings may exist without actions' },
  { invariant: 'Outputs require individual PE approval', rule: 'Each LearningLegacyOutput has its own publicationStatus; PE approves each independently' },
  { invariant: 'Publication requires ARCHIVE_READY', rule: 'LearningLegacyOutput records cannot be published until the project reaches ARCHIVED lifecycle state' },
];

// -- Autopsy Relationships (§5.2) -------------------------------------------

export const CLOSEOUT_AUTOPSY_RELATIONSHIPS: ReadonlyArray<IAutopsyRelationship> = [
  { source: 'AutopsyFinding', target: 'LessonEntry', relationship: 'referencesLesson', direction: 'Finding → Lesson (read-only ref; does not modify lesson)' },
  { source: 'AutopsyFinding', target: 'ScorecardCriterion', relationship: 'referencesCriterion', direction: 'Finding → Criterion (read-only ref)' },
  { source: 'AutopsyAction', target: 'AutopsyFinding', relationship: 'derivedFrom', direction: 'Action → Finding (optional; may be cross-cutting)' },
  { source: 'LearningLegacyOutput', target: 'AutopsyFinding', relationship: 'synthesizesFindings', direction: 'Output → Findings (many)' },
  { source: 'LearningLegacyOutput', target: 'LessonEntry', relationship: 'synthesizesLessons', direction: 'Output → Lessons (many)' },
];

// -- Immutability Rules (§6) ------------------------------------------------

export const CLOSEOUT_IMMUTABILITY_RULES: ReadonlyArray<ICloseoutImmutabilityRule> = [
  { record: 'CloseoutChecklist', fieldCategory: 'Identity fields', immutableFrom: 'Creation' },
  { record: 'CloseoutChecklistItem (governed)', fieldCategory: 'All definition fields', immutableFrom: 'Template instantiation' },
  { record: 'CloseoutChecklistItem', fieldCategory: 'result, itemDate, notes', immutableFrom: 'Never (until ARCHIVED)' },
  { record: 'SubcontractorScorecard', fieldCategory: 'All score/narrative fields', immutableFrom: 'SUBMITTED' },
  { record: 'LessonEntry', fieldCategory: 'All content fields', immutableFrom: 'PE_APPROVED' },
  { record: 'LessonsLearningReport', fieldCategory: 'All header fields', immutableFrom: 'PE_APPROVED' },
  { record: 'AutopsyRecord', fieldCategory: 'Identity, facilitator', immutableFrom: 'Creation' },
  { record: 'AutopsyFinding', fieldCategory: 'All fields', immutableFrom: 'PE_APPROVED on parent autopsy' },
  { record: 'LearningLegacyOutput', fieldCategory: 'All fields', immutableFrom: 'PUBLISHED' },
  { record: 'Org index entries', fieldCategory: 'All fields', immutableFrom: 'Creation (immutable; corrections require new project record)' },
];

// -- Checklist Item Result Labels -------------------------------------------

export const CLOSEOUT_CHECKLIST_ITEM_RESULT_LABELS: Readonly<Record<CloseoutChecklistItemResult, string>> = {
  Yes: 'Yes',
  No: 'No',
  NA: 'N/A',
  Pending: 'Pending',
};

// -- Scorecard Evaluation Type Labels ---------------------------------------

export const CLOSEOUT_SCORECARD_EVALUATION_TYPE_LABELS: Readonly<Record<CloseoutScorecardEvaluationType, string>> = {
  Interim: 'Interim Review',
  FinalCloseout: 'Final Closeout Evaluation',
};

// -- Re-Bid Recommendation Labels -------------------------------------------

export const CLOSEOUT_REBID_RECOMMENDATION_LABELS: Readonly<Record<CloseoutReBidRecommendation, string>> = {
  Yes: 'Yes — Recommend',
  YesWithConditions: 'Yes — With Conditions',
  No: 'No — Do Not Recommend',
};

// -- Jurisdiction Labels ----------------------------------------------------

export const CLOSEOUT_JURISDICTION_LABELS: Readonly<Record<CloseoutChecklistJurisdiction, string>> = {
  PBC: 'Palm Beach County',
  Other: 'Other Jurisdiction',
};
