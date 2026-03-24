/**
 * P3-E10-T01 Project Closeout Module foundation constants.
 */

import type {
  CloseoutAuthorityAction,
  CloseoutAuthorityRole,
  CloseoutConsumptionPoint,
  CloseoutCrossModuleSource,
  CloseoutDerivedIndex,
  CloseoutFunction,
  CloseoutLifecyclePhase,
  CloseoutOperationalSurface,
  CloseoutRecordFamily,
  CloseoutSurfaceClass,
} from './enums.js';
import type {
  ICloseoutActivationPhase,
  ICloseoutCrossContractRef,
  ICloseoutCrossModuleRead,
  ICloseoutExclusion,
  ICloseoutLockedDecision,
  ICloseoutOperatingPrinciple,
  ICloseoutRecordFamilyDefinition,
  ICloseoutSharedPackageRequirement,
  ICloseoutSoTBoundary,
  ICloseoutSurfaceDefinition,
} from './types.js';

// -- Module Scope -----------------------------------------------------------

export const CLOSEOUT_MODULE_SCOPE = 'closeout' as const;
export const CLOSEOUT_FOUNDATION_SCOPE = 'closeout/foundation' as const;

// -- Enum Arrays ------------------------------------------------------------

export const CLOSEOUT_RECORD_FAMILIES = [
  'CloseoutChecklist', 'CloseoutChecklistSection', 'CloseoutChecklistItem',
  'ChecklistTemplate', 'CloseoutMilestone', 'SubcontractorScorecard',
  'ScorecardSection', 'ScorecardCriterion', 'LessonEntry',
  'LessonsLearningReport', 'AutopsyRecord', 'AutopsySection',
  'AutopsyFinding', 'AutopsyAction', 'AutopsyPreSurveyResponse',
  'LearningLegacyOutput',
] as const satisfies ReadonlyArray<CloseoutRecordFamily>;

export const CLOSEOUT_SURFACE_CLASSES = [
  'ProjectScoped', 'OrgDerived', 'ProjectHubConsumption',
] as const satisfies ReadonlyArray<CloseoutSurfaceClass>;

export const CLOSEOUT_OPERATIONAL_SURFACES = [
  'CloseoutChecklist', 'SubcontractorScorecard', 'LessonsLearned', 'ProjectAutopsy',
] as const satisfies ReadonlyArray<CloseoutOperationalSurface>;

export const CLOSEOUT_DERIVED_INDEXES = [
  'LessonsIntelligence', 'SubIntelligence', 'LearningLegacy',
] as const satisfies ReadonlyArray<CloseoutDerivedIndex>;

export const CLOSEOUT_CONSUMPTION_POINTS = [
  'ContextualLessonsPanel', 'SubVettingIntelligence', 'LearningLegacyFeed',
] as const satisfies ReadonlyArray<CloseoutConsumptionPoint>;

export const CLOSEOUT_AUTHORITY_ROLES = [
  'PM', 'Superintendent', 'PE', 'PER', 'MOEAdmin', 'System',
] as const satisfies ReadonlyArray<CloseoutAuthorityRole>;

export const CLOSEOUT_AUTHORITY_ACTIONS = [
  'Create', 'Read', 'Update', 'Approve', 'Annotate',
] as const satisfies ReadonlyArray<CloseoutAuthorityAction>;

export const CLOSEOUT_LIFECYCLE_PHASES = [
  'Preconstruction', 'EarlyExecution', 'Execution', 'CloseoutPhase', 'ArchivePublication',
] as const satisfies ReadonlyArray<CloseoutLifecyclePhase>;

export const CLOSEOUT_FUNCTIONS = [
  'ProjectScopedOperations', 'IntelligencePublication',
] as const satisfies ReadonlyArray<CloseoutFunction>;

export const CLOSEOUT_CROSS_MODULE_SOURCES = [
  'Financial', 'Schedule', 'Permits', 'Safety', 'RelatedItems',
] as const satisfies ReadonlyArray<CloseoutCrossModuleSource>;

// -- Class 1 Operational Surface Definitions (§2.2) -------------------------

export const CLOSEOUT_SURFACE_CLASS_1_SURFACES: ReadonlyArray<ICloseoutSurfaceDefinition> = [
  {
    surface: 'CloseoutChecklist',
    class: 'ProjectScoped',
    description: 'Governed 70-item tri-state checklist with template library, project overlay, and milestone gate integration',
    primaryOperator: 'PM',
    peInvolvement: 'Approves formal stage transitions; annotates; no routine item-level authority',
  },
  {
    surface: 'SubcontractorScorecard',
    class: 'ProjectScoped',
    description: 'Structured per-sub evaluation tool; supports interim reviews during delivery plus a mandatory final closeout evaluation',
    primaryOperator: 'PM, Superintendent',
    peInvolvement: 'Required approval before FinalCloseout record is published to org',
  },
  {
    surface: 'LessonsLearned',
    class: 'ProjectScoped',
    description: 'Continuous structured lesson capture from any project phase; synthesized into a publication package at closeout',
    primaryOperator: 'PM, Superintendent',
    peInvolvement: 'Required approval before lessons are published to org',
  },
  {
    surface: 'ProjectAutopsy',
    class: 'ProjectScoped',
    description: 'PE-led closeout synthesis workshop; structured findings; action register; feed-forward outputs',
    primaryOperator: 'PE (lead), PM (coordinator)',
    peInvolvement: 'PE is the lead facilitator and sole approval authority',
  },
];

// -- Class 2 Derived Index Definitions (§2.2) --------------------------------

export const CLOSEOUT_SURFACE_CLASS_2_INDEXES: ReadonlyArray<{
  readonly index: CloseoutDerivedIndex;
  readonly source: string;
  readonly whoPopulates: string;
  readonly whoReads: string;
}> = [
  {
    index: 'LessonsIntelligence',
    source: 'PE-approved LessonEntry records',
    whoPopulates: 'Automated on archive event',
    whoReads: 'Broadly available — all internal users with Project Hub access',
  },
  {
    index: 'SubIntelligence',
    source: 'PE-approved FinalCloseout scorecard records',
    whoPopulates: 'Automated on archive event',
    whoReads: 'Restricted — PE, PER, SUB_INTELLIGENCE_VIEWER role only',
  },
  {
    index: 'LearningLegacy',
    source: 'PE-approved LearningLegacyOutput records from Autopsy',
    whoPopulates: 'Automated on archive event',
    whoReads: 'Broadly available; full content gated by role for sensitive findings',
  },
];

// -- Class 3 Consumption Point Definitions (§2.2) ----------------------------

export const CLOSEOUT_SURFACE_CLASS_3_POINTS: ReadonlyArray<{
  readonly point: CloseoutConsumptionPoint;
  readonly sourceIndex: string;
  readonly userCanDo: string;
  readonly userCannotDo: string;
}> = [
  {
    point: 'ContextualLessonsPanel',
    sourceIndex: 'LessonsIntelligence Index',
    userCanDo: 'Filter by sector/method/size; read entries; open finding detail',
    userCannotDo: 'Edit, annotate, delete, flag',
  },
  {
    point: 'SubVettingIntelligence',
    sourceIndex: 'SubIntelligence Index',
    userCanDo: 'Filter by sub name; view historical performance; read summaries',
    userCannotDo: 'Edit, override, publish new evaluation',
  },
  {
    point: 'LearningLegacyFeed',
    sourceIndex: 'LearningLegacy Feed',
    userCanDo: 'Browse by type/tag; retrieve applicable outputs',
    userCannotDo: 'Edit, re-publish, delete',
  },
];

// -- Record Family Definitions (§3.1) ----------------------------------------

export const CLOSEOUT_RECORD_FAMILY_DEFINITIONS: ReadonlyArray<ICloseoutRecordFamilyDefinition> = [
  { family: 'CloseoutChecklist', key: 'checklistId', notes: 'One per project; never recreated' },
  { family: 'CloseoutChecklistSection', key: 'sectionId', notes: '7 per checklist; template-driven' },
  { family: 'CloseoutChecklistItem', key: 'itemId', notes: '~70 governed + project overlays' },
  { family: 'ChecklistTemplate', key: 'templateId + version', notes: 'MOE-governed baseline; versioned' },
  { family: 'CloseoutMilestone', key: 'milestoneId', notes: '13 defined milestones per T04' },
  { family: 'SubcontractorScorecard', key: 'scorecardId', notes: '1+ per project (one per sub × multiple eval types)' },
  { family: 'ScorecardSection', key: 'sectionId', notes: '6 per scorecard; fixed' },
  { family: 'ScorecardCriterion', key: 'criterionId', notes: '28 per scorecard; fixed' },
  { family: 'LessonEntry', key: 'lessonId', notes: 'Rolling; 0+ per project' },
  { family: 'LessonsLearningReport', key: 'reportId', notes: 'Closeout synthesis container; 1 per project' },
  { family: 'AutopsyRecord', key: 'autopsyId', notes: '1 per project' },
  { family: 'AutopsySection', key: 'sectionId', notes: 'Up to 12 thematic sections per T07' },
  { family: 'AutopsyFinding', key: 'findingId', notes: '0+ per autopsy' },
  { family: 'AutopsyAction', key: 'actionId', notes: '0+ per autopsy' },
  { family: 'AutopsyPreSurveyResponse', key: 'responseId', notes: '1 per invited participant' },
  { family: 'LearningLegacyOutput', key: 'outputId', notes: '0+ per autopsy' },
];

// -- SoT Boundary Matrix (§5) -----------------------------------------------

export const CLOSEOUT_SOT_BOUNDARY_MATRIX: ReadonlyArray<ICloseoutSoTBoundary> = [
  { dataConcern: 'Checklist item result', sotOwner: '@hbc/project-closeout', whoWrites: 'PM, SUPT', whoReads: 'PM, SUPT, PE, PER, Reports (snapshot)' },
  { dataConcern: 'Checklist template baseline', sotOwner: 'ChecklistTemplate store (MOE-governed)', whoWrites: 'MOE/Admin only', whoReads: 'Closeout (at instantiation)' },
  { dataConcern: 'Scorecard criterion score', sotOwner: '@hbc/project-closeout', whoWrites: 'PM, SUPT', whoReads: 'PM, SUPT, PE, PER' },
  { dataConcern: 'PE annotation on scorecard', sotOwner: '@hbc/field-annotations', whoWrites: 'PE, PER', whoReads: 'PM, SUPT, PE, PER' },
  { dataConcern: 'Lesson entry content', sotOwner: '@hbc/project-closeout', whoWrites: 'PM, SUPT', whoReads: 'PM, SUPT, PE, PER, Autopsy (cross-ref)' },
  { dataConcern: 'Autopsy finding', sotOwner: '@hbc/project-closeout', whoWrites: 'PE, PM (with PE)', whoReads: 'PE, PM, PER' },
  { dataConcern: 'Learning legacy output', sotOwner: '@hbc/project-closeout', whoWrites: 'PE, PM', whoReads: 'PE, PM, PER; org feed on publication' },
  { dataConcern: 'Org SubIntelligence entry', sotOwner: 'Org Intelligence Layer', whoWrites: 'Automated from PE-approved events', whoReads: 'PE, PER, SUB_INTELLIGENCE_VIEWER' },
  { dataConcern: 'Org Lessons entry', sotOwner: 'Org Intelligence Layer', whoWrites: 'Automated from PE-approved events', whoReads: 'All internal users (Project Hub access)' },
  { dataConcern: 'Cost variance', sotOwner: 'P3-E4 Financial', whoWrites: 'Financial module only', whoReads: 'Closeout (read signal for item 6.4)' },
  { dataConcern: 'C.O. status', sotOwner: 'P3-E7 Permits', whoWrites: 'Permits module only', whoReads: 'Closeout (related-items read)' },
];

// -- Cross-Contract Positioning (§6) -----------------------------------------

export const CLOSEOUT_CROSS_CONTRACT_REFS: ReadonlyArray<ICloseoutCrossContractRef> = [
  { contract: 'P3-E1 §3.1', relationship: 'Module classification — review-capable, lifecycle module, project-scoped SoT' },
  { contract: 'P3-E2 §3', relationship: 'Source-of-truth boundaries and action authority matrix' },
  { contract: 'P3-D1 Activity Spine', relationship: 'Closeout emits lifecycle events, checklist milestones, autopsy completion' },
  { contract: 'P3-D2 Health Spine', relationship: 'Closeout emits closeout completion %, scorecard coverage, autopsy readiness' },
  { contract: 'P3-D3 Work Queue', relationship: 'Closeout raises items for C.O. deadlines, lien deadlines, overdue evaluations, PE approvals, autopsy actions' },
  { contract: 'P3-D4 Related Items', relationship: 'Closeout registers checklist → permit, checklist → financial, autopsy → lesson links' },
  { contract: 'P3-E4 Financial', relationship: 'Read-only: final cost variance for item 6.4 and autopsy briefing pack' },
  { contract: 'P3-E7 Permits', relationship: 'Read-only: permit lifecycle and C.O. date for checklist items 3.x' },
  { contract: 'P3-E8 Safety', relationship: 'Read-only: TRIR and incident summary for scorecard Safety section and autopsy' },
  { contract: 'P3-E9 Reports', relationship: 'Reports assembles sub-scorecard and lessons-learned artifacts from PE-approved Closeout snapshots' },
  { contract: 'P3-G1 Lane Capability Matrix', relationship: 'Closeout lane capabilities including new Autopsy surface' },
  { contract: 'P3-H1 §18.5', relationship: 'Closeout acceptance gate — updated per T11' },
];

// -- Always-On Activation Model (§4) -----------------------------------------

export const CLOSEOUT_ACTIVATION_MODEL: ReadonlyArray<ICloseoutActivationPhase> = [
  { phase: 'Preconstruction', activity: 'Module exists but no operational Closeout records yet' },
  { phase: 'EarlyExecution', activity: 'PM and Superintendent may begin capturing LessonEntry records at any time' },
  { phase: 'Execution', activity: 'Interim SubcontractorScorecard evaluations may be created; lessons may be logged' },
  { phase: 'CloseoutPhase', activity: 'CloseoutChecklist is instantiated; Autopsy is activated; LessonsLearningReport container created' },
  { phase: 'ArchivePublication', activity: 'PE-approved records published to org intelligence indexes' },
];

// -- Cross-Module Reads (§3.2) -----------------------------------------------

export const CLOSEOUT_CROSS_MODULE_READS: ReadonlyArray<ICloseoutCrossModuleRead> = [
  { source: 'Financial', consumedData: 'Final cost variance, contingency usage', purpose: 'Autopsy briefing pack; checklist item 6.4 signal', mutationPermitted: false },
  { source: 'Schedule', consumedData: 'Schedule variance, milestone actuals, float history', purpose: 'Autopsy briefing pack; evidence on checklist items', mutationPermitted: false },
  { source: 'Permits', consumedData: 'Permit lifecycle, C.O. status, inspection pass/fail', purpose: 'Checklist items 3.x; related-items links', mutationPermitted: false },
  { source: 'Safety', consumedData: 'TRIR, recordable incidents, near-misses', purpose: 'Scorecard Safety section evidence; autopsy input', mutationPermitted: false },
  { source: 'RelatedItems', consumedData: 'Cross-module record links', purpose: 'Pre-fill evidence suggestions; readiness signals', mutationPermitted: false },
];

// -- Exclusions (§3.3) -------------------------------------------------------

export const CLOSEOUT_EXCLUSIONS: ReadonlyArray<ICloseoutExclusion> = [
  { item: 'Org-wide SubIntelligence Index (write path)', correctOwner: 'Org Intelligence Layer; populated from PE-approved events' },
  { item: 'Org-wide LessonsIntelligence Index (write path)', correctOwner: 'Org Intelligence Layer' },
  { item: 'Report artifact generation (PDF/HTML)', correctOwner: 'P3-E9 Reports; Closeout provides approved snapshots' },
  { item: 'Financial cost variance calculation', correctOwner: 'P3-E4 Financial' },
  { item: 'Permit inspection records', correctOwner: 'P3-E7 Permits' },
  { item: 'Safety incident records', correctOwner: 'P3-E8 Safety' },
  { item: 'Document management / file storage', correctOwner: 'SharePoint / document management layer' },
  { item: 'Work Queue routing infrastructure', correctOwner: 'P3-D3 Work Queue contract' },
];

// -- Locked Architecture Decisions (Master Index) ----------------------------

export const CLOSEOUT_LOCKED_DECISIONS: ReadonlyArray<ICloseoutLockedDecision> = [
  { decisionId: 1, description: 'Closeout is always-on for the life of the project, not a phase-gated unlock' },
  { decisionId: 2, description: 'Checklist template is MOE-governed with semantic versioning; project overlay is bounded (max 5 items/section)' },
  { decisionId: 3, description: 'Subcontractor performance index is an org-wide derived read model — not an editable ledger' },
  { decisionId: 4, description: 'Lessons intelligence is an org-wide derived read model — not an editable ledger' },
  { decisionId: 5, description: 'No direct cross-feature imports; cross-module data flows via Spine and snapshot API only' },
  { decisionId: 6, description: 'PE approval (gated record transition) is distinct from PE annotation (non-blocking observation)' },
  { decisionId: 7, description: 'Subcontractor performance data is restricted by role; SUB_INTELLIGENCE_VIEWER grant is explicit, not inherited' },
  { decisionId: 8, description: 'Lessons intelligence is broadly visible to all internal Project Hub users' },
  { decisionId: 9, description: 'Impact magnitude is backend-derived from text signals; PM cannot set or override' },
  { decisionId: 10, description: 'Reports ingests PE-approved Closeout snapshots; Reports does not own or recompute any Closeout data' },
  { decisionId: 11, description: 'Project Autopsy is a first-class sub-surface; AUTOPSY_COMPLETE milestone is required for Archive-Ready gate' },
  { decisionId: 12, description: 'Archive-Ready is an 8-criterion gate that PE must explicitly approve' },
  { decisionId: 13, description: 'ARCHIVED is terminal; no mutation of any Closeout record is permitted after archiving' },
  { decisionId: 14, description: 'FinalCloseout scorecard is unique per subcontractor per project; duplicate attempts return 409' },
];

// -- Shared Package Requirements (T10) ----------------------------------------

export const CLOSEOUT_SHARED_PACKAGE_REQUIREMENTS: ReadonlyArray<ICloseoutSharedPackageRequirement> = [
  { packageName: '@hbc/field-annotations', role: 'PE/PER annotation across Closeout surfaces', blockerId: 'B-CLO-01' },
  { packageName: '@hbc/my-work-feed', role: 'Closeout work queue items (C.O. deadlines, lien deadlines, overdue evaluations, PE approvals, autopsy actions)', blockerId: 'B-CLO-02' },
  { packageName: '@hbc/workflow-handoff', role: 'PE approval routing, milestone sign-off, archive-ready gate', blockerId: 'B-CLO-03' },
  { packageName: '@hbc/bic-next-move', role: 'Closeout workspace next-move prompt registration', blockerId: 'B-CLO-04' },
  { packageName: '@hbc/related-items', role: 'Cross-module record relationship registration (checklist→permit, checklist→financial, autopsy→lesson)', blockerId: 'B-CLO-05' },
  { packageName: '@hbc/versioned-record', role: 'Immutable audit trail for checklist, scorecard, lessons, and autopsy records', blockerId: 'B-CLO-06' },
  { packageName: '@hbc/acknowledgment', role: 'Autopsy participant acknowledgment and pre-survey response confirmation', blockerId: 'B-CLO-07' },
];

// -- Operating Principles -----------------------------------------------------

export const CLOSEOUT_OPERATING_PRINCIPLES: ReadonlyArray<ICloseoutOperatingPrinciple> = [
  { id: 1, description: 'Function A (project-scoped operations) and Function B (intelligence publication) must never share a write path' },
  { id: 2, description: 'No user session in Closeout may directly write to a Class 2 index; publication is event-driven from PE-approved state' },
  { id: 3, description: 'Related records may suggest readiness for checklist items but must not auto-resolve any item; the user must confirm every result' },
  { id: 4, description: 'Lessons Learned and Subcontractor Scorecard sub-surfaces must be accessible from the Project Hub sidebar at any point in the lifecycle' },
  { id: 5, description: 'Closeout Checklist and Autopsy sub-surfaces are accessible only from closeout phase activation forward' },
];

// -- Label Maps ---------------------------------------------------------------

export const CLOSEOUT_RECORD_FAMILY_LABELS: Readonly<Record<CloseoutRecordFamily, string>> = {
  CloseoutChecklist: 'Closeout Checklist',
  CloseoutChecklistSection: 'Closeout Checklist Section',
  CloseoutChecklistItem: 'Closeout Checklist Item',
  ChecklistTemplate: 'Checklist Template',
  CloseoutMilestone: 'Closeout Milestone',
  SubcontractorScorecard: 'Subcontractor Scorecard',
  ScorecardSection: 'Scorecard Section',
  ScorecardCriterion: 'Scorecard Criterion',
  LessonEntry: 'Lesson Entry',
  LessonsLearningReport: 'Lessons Learning Report',
  AutopsyRecord: 'Autopsy Record',
  AutopsySection: 'Autopsy Section',
  AutopsyFinding: 'Autopsy Finding',
  AutopsyAction: 'Autopsy Action',
  AutopsyPreSurveyResponse: 'Autopsy Pre-Survey Response',
  LearningLegacyOutput: 'Learning Legacy Output',
};

export const CLOSEOUT_AUTHORITY_ROLE_LABELS: Readonly<Record<CloseoutAuthorityRole, string>> = {
  PM: 'Project Manager',
  Superintendent: 'Superintendent',
  PE: 'Project Executive',
  PER: 'Portfolio Executive Reviewer',
  MOEAdmin: 'MOE / Admin',
  System: 'System',
};

export const CLOSEOUT_LIFECYCLE_PHASE_LABELS: Readonly<Record<CloseoutLifecyclePhase, string>> = {
  Preconstruction: 'Preconstruction / Bid',
  EarlyExecution: 'Early Execution',
  Execution: 'Execution (any phase)',
  CloseoutPhase: 'Closeout Phase Activation',
  ArchivePublication: 'Archive / Publication',
};

export const CLOSEOUT_OPERATIONAL_SURFACE_LABELS: Readonly<Record<CloseoutOperationalSurface, string>> = {
  CloseoutChecklist: 'Closeout Execution Checklist',
  SubcontractorScorecard: 'Subcontractor Scorecard',
  LessonsLearned: 'Lessons Learned (Rolling Ledger)',
  ProjectAutopsy: 'Project Autopsy & Learning Legacy',
};

export const CLOSEOUT_DERIVED_INDEX_LABELS: Readonly<Record<CloseoutDerivedIndex, string>> = {
  LessonsIntelligence: 'Lessons Intelligence Index',
  SubIntelligence: 'SubIntelligence Index',
  LearningLegacy: 'Learning Legacy Feed',
};
