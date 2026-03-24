/**
 * P3-E10-T09 Permissions, Visibility, Executive Review constants.
 */

import type { CloseoutAnnotationSource, CloseoutIntelligenceVisibility, CloseoutRole, SubIntelligenceAccessLevel } from './enums.js';
import type {
  IAnnotationVisibilityRule,
  ICloseoutRoleAction,
  ICloseoutRoleDefinition,
  IIntelligenceVisibilityRegime,
  IPEApprovalVsAnnotation,
  IPEFormalReviewSurface,
  IPEWorkQueueItem,
  ISubIntelFieldVisibilityRule,
  ISuptChecklistScope,
} from './types.js';

// -- Enum Arrays ------------------------------------------------------------

export const CLOSEOUT_ROLES = [
  'PM', 'SUPT', 'PE', 'PER', 'MOE', 'SUB_INTELLIGENCE_VIEWER',
] as const satisfies ReadonlyArray<CloseoutRole>;

export const CLOSEOUT_INTELLIGENCE_VISIBILITY_REGIMES = [
  'BroadlyAvailable', 'Restricted',
] as const satisfies ReadonlyArray<CloseoutIntelligenceVisibility>;

export const CLOSEOUT_ANNOTATION_SOURCES = [
  'PE', 'PER',
] as const satisfies ReadonlyArray<CloseoutAnnotationSource>;

export const SUB_INTELLIGENCE_ACCESS_LEVELS = [
  'PE_PER_MOE', 'SUB_INTELLIGENCE_VIEWER', 'GeneralUser',
] as const satisfies ReadonlyArray<SubIntelligenceAccessLevel>;

// -- Role Definitions (§1) --------------------------------------------------

export const CLOSEOUT_ROLE_DEFINITIONS: ReadonlyArray<ICloseoutRoleDefinition> = [
  { code: 'PM', displayName: 'Project Manager', scope: 'Project-scoped', description: 'Primary operator; owns all Closeout operational execution; submits scorecards, lessons, and autopsy records for PE review' },
  { code: 'SUPT', displayName: 'Superintendent', scope: 'Project-scoped', description: 'Field contributor; creates lesson entries and scorecard evaluations; marks checklist items within field scope; no approval authority' },
  { code: 'PE', displayName: 'Project Executive', scope: 'Project-scoped + org', description: 'Formal approval authority at all milestone gates, all publication approvals, and org intelligence releases; also Autopsy workshop lead' },
  { code: 'PER', displayName: 'Portfolio Executive Reviewer', scope: 'Read + annotate across assigned projects', description: 'Cross-project visibility and annotation; no mutation authority; no approval authority' },
  { code: 'MOE', displayName: 'Management of Execution / Admin', scope: 'Org-wide', description: 'Governs template library, pre-survey templates, and SUB_INTELLIGENCE_VIEWER grant issuance; no project operational access' },
  { code: 'SUB_INTELLIGENCE_VIEWER', displayName: 'Sub Intelligence Viewer', scope: 'Org-wide (read-only)', description: 'Explicit grant; enables access to SubIntelligence index excluding narratives and financial fields; does not inherit from general Project Hub access' },
];

// -- Master Role Matrix (§2) — all action rows --------------------------------

export const CLOSEOUT_ROLE_MATRIX: ReadonlyArray<ICloseoutRoleAction> = [
  // Checklist
  { category: 'Checklist', action: 'View checklist', pm: true, supt: true, pe: true, per: true, moe: false },
  { category: 'Checklist', action: 'Mark items Yes/No/NA', pm: true, supt: 'field scope', pe: false, per: false, moe: false },
  { category: 'Checklist', action: 'Add overlay items', pm: true, supt: false, pe: false, per: false, moe: false },
  // Scorecards
  { category: 'Scorecards', action: 'Create Interim or FinalCloseout scorecard', pm: true, supt: true, pe: false, per: false, moe: false },
  { category: 'Scorecards', action: 'Score criteria', pm: true, supt: true, pe: false, per: false, moe: false },
  { category: 'Scorecards', action: 'Submit scorecard', pm: true, supt: true, pe: false, per: false, moe: false },
  { category: 'Scorecards', action: 'Sign off on submission', pm: true, supt: true, pe: false, per: false, moe: false },
  { category: 'Scorecards', action: 'Approve FinalCloseout for org publication', pm: false, supt: false, pe: true, per: false, moe: false },
  { category: 'Scorecards', action: 'View project-scoped scorecards', pm: true, supt: true, pe: true, per: true, moe: false },
  // Lessons Learned
  { category: 'Lessons', action: 'Create LessonEntry', pm: true, supt: true, pe: false, per: false, moe: false },
  { category: 'Lessons', action: 'Edit LessonEntry (Draft only)', pm: true, supt: 'own', pe: false, per: false, moe: false },
  { category: 'Lessons', action: 'Submit LessonsLearningReport', pm: true, supt: false, pe: false, per: false, moe: false },
  { category: 'Lessons', action: 'Approve lessons for org publication', pm: false, supt: false, pe: true, per: false, moe: false },
  { category: 'Lessons', action: 'View project-scoped lessons', pm: true, supt: true, pe: true, per: true, moe: false },
  // Autopsy
  { category: 'Autopsy', action: 'Activate Autopsy sub-surface', pm: true, supt: false, pe: true, per: false, moe: false },
  { category: 'Autopsy', action: 'Issue pre-survey', pm: false, supt: false, pe: true, per: false, moe: false },
  { category: 'Autopsy', action: 'Log findings and actions', pm: true, supt: false, pe: true, per: false, moe: false },
  { category: 'Autopsy', action: 'Create LearningLegacyOutput', pm: true, supt: false, pe: true, per: false, moe: false },
  { category: 'Autopsy', action: 'Approve AutopsyRecord', pm: false, supt: false, pe: true, per: false, moe: false },
  { category: 'Autopsy', action: 'Approve individual LearningLegacyOutput', pm: false, supt: false, pe: true, per: false, moe: false },
  { category: 'Autopsy', action: 'View autopsy detail', pm: true, supt: false, pe: true, per: true, moe: false },
  // Lifecycle
  { category: 'Lifecycle', action: 'Advance to OWNER_ACCEPTANCE (submit evidence)', pm: 'submit', supt: false, pe: 'approve', per: false, moe: false },
  { category: 'Lifecycle', action: 'Approve ARCHIVE_READY', pm: false, supt: false, pe: true, per: false, moe: false },
  { category: 'Lifecycle', action: 'Trigger ARCHIVED', pm: false, supt: false, pe: true, per: false, moe: false },
  // Annotations
  { category: 'Annotations', action: 'Annotate any Closeout record', pm: false, supt: false, pe: true, per: true, moe: false },
  { category: 'Annotations', action: 'View PE annotations', pm: true, supt: true, pe: true, per: true, moe: false },
  { category: 'Annotations', action: 'View PER annotations', pm: true, supt: false, pe: true, per: true, moe: false },
  // Template library
  { category: 'Templates', action: 'View checklist template', pm: true, supt: false, pe: true, per: false, moe: true },
  { category: 'Templates', action: 'Create / update / retire template version', pm: false, supt: false, pe: false, per: false, moe: true },
  { category: 'Templates', action: 'Manage pre-survey templates', pm: false, supt: false, pe: false, per: false, moe: true },
  { category: 'Templates', action: 'Issue SUB_INTELLIGENCE_VIEWER grant', pm: false, supt: false, pe: true, per: false, moe: true },
];

// -- Intelligence Visibility Regimes (§3.1) ----------------------------------

export const CLOSEOUT_INTELLIGENCE_VISIBILITY: ReadonlyArray<IIntelligenceVisibilityRegime> = [
  { intelligenceClass: 'LessonsIntelligence', regime: 'BroadlyAvailable', rationale: 'Lessons are professional knowledge that improves all future project delivery; no reputational or legal risk' },
  { intelligenceClass: 'SubIntelligence', regime: 'Restricted', rationale: 'Subcontractor performance data carries reputational harm and legal exposure risk; access must be intentional' },
  { intelligenceClass: 'LearningLegacy', regime: 'BroadlyAvailable', rationale: 'Derived institutional knowledge; same rationale as LessonsIntelligence' },
  { intelligenceClass: 'Project-scoped operational records', regime: 'Restricted', rationale: 'Raw data; not yet PE-approved; not yet org-indexed' },
];

// -- SubIntelligence Field Visibility (§3.3) ---------------------------------

export const SUB_INTELLIGENCE_FIELD_VISIBILITY: ReadonlyArray<ISubIntelFieldVisibilityRule> = [
  { field: 'subcontractorName', pePERMOE: true, subIntelViewer: true, generalUser: false },
  { field: 'tradeScope', pePERMOE: true, subIntelViewer: true, generalUser: false },
  { field: 'overallWeightedScore', pePERMOE: true, subIntelViewer: true, generalUser: false },
  { field: 'performanceRating', pePERMOE: true, subIntelViewer: true, generalUser: false },
  { field: 'reBidRecommendation', pePERMOE: true, subIntelViewer: true, generalUser: false },
  { field: 'sectionScores', pePERMOE: true, subIntelViewer: true, generalUser: false },
  { field: 'evaluationDate', pePERMOE: true, subIntelViewer: true, generalUser: false },
  { field: 'sourceProjectName', pePERMOE: true, subIntelViewer: true, generalUser: false },
  { field: 'marketSector', pePERMOE: true, subIntelViewer: true, generalUser: false },
  { field: 'isInterimException', pePERMOE: true, subIntelViewer: true, generalUser: false },
  { field: 'keyStrengths', pePERMOE: true, subIntelViewer: false, generalUser: false },
  { field: 'areasForImprovement', pePERMOE: true, subIntelViewer: false, generalUser: false },
  { field: 'notableIncidentsOrIssues', pePERMOE: true, subIntelViewer: false, generalUser: false },
  { field: 'overallNarrativeSummary', pePERMOE: true, subIntelViewer: false, generalUser: false },
  { field: 'contractValue', pePERMOE: true, subIntelViewer: false, generalUser: false },
  { field: 'finalCost', pePERMOE: true, subIntelViewer: false, generalUser: false },
];

// -- Annotation Visibility (§4.3) -------------------------------------------

export const CLOSEOUT_ANNOTATION_VISIBILITY: ReadonlyArray<IAnnotationVisibilityRule> = [
  { source: 'PE', visibleToPM: true, visibleToSUPT: true, visibleToPE: true, visibleToPER: true },
  { source: 'PER', visibleToPM: true, visibleToSUPT: false, visibleToPE: true, visibleToPER: true },
];

// -- PE Approval vs. Annotation (§5) ----------------------------------------

export const PE_APPROVAL_VS_ANNOTATION: ReadonlyArray<IPEApprovalVsAnnotation> = [
  { dimension: 'What it does', annotation: 'Non-blocking review observation; does not change record state', approval: 'Formal gated state transition; advances publicationStatus or lifecycleState' },
  { dimension: 'Storage', annotation: '@hbc/field-annotations (annotation layer)', approval: 'Closeout record itself (peApprovedAt, peApprovedBy fields)' },
  { dimension: 'API action', annotation: 'POST /annotations/{entityType}/{entityId}', approval: 'Explicit approval action endpoint' },
  { dimension: 'Reversibility', annotation: 'Annotation is permanent (audit); new annotation can clarify', approval: 'Approval is permanent; reversion requires PE-documented exception' },
  { dimension: 'Effect on workflow', annotation: 'None — publication status does not advance', approval: 'Advances publication status or lifecycle state; triggers downstream events' },
  { dimension: 'UI treatment', annotation: 'Rendered as PE Review Note adjacent to the field', approval: 'Rendered as primary gated action button requiring explicit confirmation' },
  { dimension: 'Required before', annotation: 'Nothing — may be added at any time', approval: 'Required milestone completions and evidence gates per T04' },
];

// -- PE Formal Review Surfaces (§6.1) ----------------------------------------

export const PE_FORMAL_REVIEW_SURFACES: ReadonlyArray<IPEFormalReviewSurface> = [
  { surface: 'OWNER_ACCEPTANCE milestone', peAction: 'Approve', trigger: 'PM submits owner acceptance evidence' },
  { surface: 'FinalCloseout scorecard', peAction: 'Approve for org publication', trigger: 'PM/SUPT submits FinalCloseout scorecard' },
  { surface: 'LessonsLearningReport', peAction: 'Approve for org publication', trigger: 'PM submits lessons report' },
  { surface: 'AutopsyRecord', peAction: 'Approve (PE is workshop lead)', trigger: 'Workshop complete; record submitted' },
  { surface: 'Individual LearningLegacyOutput', peAction: 'Approve for org feed publication', trigger: 'PM or PE creates output and submits' },
  { surface: 'ARCHIVE_READY gate', peAction: 'Approve', trigger: 'All 8 criteria pass; PM requests' },
  { surface: 'ARCHIVED state trigger', peAction: 'Trigger', trigger: 'PE-initiated after ARCHIVE_READY approval' },
];

/** Actions that must NOT generate PE work queue items per §6.2. */
export const PE_NON_TRIGGERING_ACTIONS: ReadonlyArray<string> = [
  'Marking any checklist item Yes/No/NA',
  'Adding an overlay item',
  'Creating a lesson entry',
  'Creating an Interim scorecard',
  'Updating autopsy pre-briefing pack',
  'Responding to a PER annotation',
];

// -- PE Work Queue Items (§6.3) — 5 items ------------------------------------

export const PE_WORK_QUEUE_ITEMS: ReadonlyArray<IPEWorkQueueItem> = [
  { item: 'Owner Acceptance evidence submitted — PE review needed', priority: 'High', autoCloseWhen: 'Milestone approved or declined' },
  { item: 'FinalCloseout scorecard submitted — PE review needed', priority: 'Medium', autoCloseWhen: 'Scorecard approved or revision requested' },
  { item: 'Lessons report submitted — PE review needed', priority: 'Medium', autoCloseWhen: 'Report approved or revision requested' },
  { item: 'Autopsy record submitted — PE approval needed', priority: 'Medium', autoCloseWhen: 'Autopsy approved or revision requested' },
  { item: 'Archive Ready — all criteria pass, PE approval needed', priority: 'High', autoCloseWhen: 'Milestone approved or declined' },
];

// -- SUPT Checklist Section Scope (§7) ----------------------------------------

export const SUPT_CHECKLIST_SECTION_SCOPE: ReadonlyArray<ISuptChecklistScope> = [
  { section: 'Section 1 — Tasks and Pre-Work', suptMutationAuthority: 'within field scope' },
  { section: 'Section 2 — Construction Completion Documents', suptMutationAuthority: false },
  { section: 'Section 3 — Inspections and Certificate of Occupancy', suptMutationAuthority: true },
  { section: 'Section 4 — Turnover and Owner Handoff', suptMutationAuthority: 'field components' },
  { section: 'Section 5 — Estimating and File Return', suptMutationAuthority: false },
  { section: 'Section 6 — Closeout Intelligence Artifacts', suptMutationAuthority: false },
];

// -- Label Maps ---------------------------------------------------------------

export const CLOSEOUT_ROLE_LABELS: Readonly<Record<CloseoutRole, string>> = {
  PM: 'Project Manager',
  SUPT: 'Superintendent',
  PE: 'Project Executive',
  PER: 'Portfolio Executive Reviewer',
  MOE: 'Management of Execution / Admin',
  SUB_INTELLIGENCE_VIEWER: 'Sub Intelligence Viewer',
};
