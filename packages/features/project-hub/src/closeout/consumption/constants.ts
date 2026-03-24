/**
 * P3-E10-T08 Project Hub Consumption constants.
 * Data classes, org indexes, spine events, health metrics, reports, UI rules.
 */

import type { CloseoutDataClass, CloseoutHealthSpineDimension, CloseoutOrgIndex } from './enums.js';
import type {
  IActivitySpineEvent,
  ICloseoutDataClassDefinition,
  IHealthSpineMetric,
  IOrgIndexDefinition,
  IProjectHubConsumptionSurface,
  IReportArtifactFamily,
  ISearchDimension,
  ISnapshotPrecondition,
  IUIDataClassRule,
} from './types.js';

// -- Enum Arrays ------------------------------------------------------------

export const CLOSEOUT_DATA_CLASSES = [
  'ProjectOperational', 'PublishedIntelligence', 'ReadOnlyAggregation',
] as const satisfies ReadonlyArray<CloseoutDataClass>;

export const CLOSEOUT_ORG_INDEXES = [
  'LessonsIntelligence', 'SubIntelligence', 'LearningLegacy',
] as const satisfies ReadonlyArray<CloseoutOrgIndex>;

export const CLOSEOUT_HEALTH_SPINE_DIMENSIONS = [
  'closeoutCompletionPct', 'scorecardCoverage', 'lessonsReadiness', 'autopsyReadiness',
] as const satisfies ReadonlyArray<CloseoutHealthSpineDimension>;

// -- Data Class Definitions (§1) --------------------------------------------

export const CLOSEOUT_DATA_CLASS_DEFINITIONS: ReadonlyArray<ICloseoutDataClassDefinition> = [
  { class: 'ProjectOperational', data: 'LessonEntry, SubcontractorScorecard, AutopsyFinding, etc.', writePath: '@hbc/project-closeout module APIs', readPath: 'Direct read within project context; role-gated' },
  { class: 'PublishedIntelligence', data: 'LessonsIntelligenceIndexEntry, SubIntelligenceIndexEntry, LearningLegacyFeedEntry', writePath: 'Org intelligence layer only; populated from PE-approved Closeout events', readPath: 'Org intelligence query API' },
  { class: 'ReadOnlyAggregation', data: 'Project Hub contextual panels', writePath: 'Never — Project Hub is read-only', readPath: 'Org intelligence query API, filtered for context' },
];

// -- Org Index Definitions (§2) ---------------------------------------------

export const CLOSEOUT_ORG_INDEX_DEFINITIONS: ReadonlyArray<IOrgIndexDefinition> = [
  { index: 'LessonsIntelligence', purpose: 'Org-wide searchable knowledge base of approved project lesson entries', populationTrigger: 'closeout.lessons-published event at project ARCHIVED state', unitOfEntry: 'One LessonsIntelligenceIndexEntry per PE-approved LessonEntry' },
  { index: 'SubIntelligence', purpose: 'Org-wide role-restricted subcontractor performance database', populationTrigger: 'closeout.scorecard-published event at project ARCHIVED state', unitOfEntry: 'One entry per published FinalCloseout scorecard (plus PE-exception interims)' },
  { index: 'LearningLegacy', purpose: 'Org-wide browsable collection of approved Learning Legacy outputs from Autopsy records', populationTrigger: 'closeout.learning-legacy-published event at project ARCHIVED state', unitOfEntry: 'One LearningLegacyFeedEntry per PE-approved LearningLegacyOutput' },
];

// -- Search Dimensions (§2.1–2.3) -------------------------------------------

export const CLOSEOUT_SEARCH_DIMENSIONS: ReadonlyArray<ISearchDimension> = [
  {
    index: 'LessonsIntelligence',
    fullTextFields: ['situation', 'rootCause', 'recommendation', 'keywords', 'phaseEncountered'],
    filterFields: ['category', 'impactMagnitude', 'applicability', 'marketSector', 'deliveryMethod', 'projectSizeBand', 'complexityRating'],
    sortFields: ['applicability DESC', 'impactMagnitude DESC', 'reportDate DESC'],
  },
  {
    index: 'SubIntelligence',
    fullTextFields: ['subcontractorName', 'subcontractorId'],
    filterFields: ['tradeScope', 'marketSector', 'deliveryMethod', 'projectSizeBand', 'performanceRating', 'reBidRecommendation', 'overallWeightedScore'],
    sortFields: ['evaluationDate DESC'],
  },
  {
    index: 'LearningLegacy',
    fullTextFields: ['title', 'summary', 'fullContent', 'tags', 'actionableRecommendations'],
    filterFields: ['outputType', 'applicableMarketSectors', 'applicableDeliveryMethods', 'applicableSizeBands', 'recurrenceRisk'],
    sortFields: ['recurrenceRisk DESC', 'publishedAt DESC'],
  },
];

// -- Consumption Surfaces (§3) ----------------------------------------------

export const CLOSEOUT_CONSUMPTION_SURFACES: ReadonlyArray<IProjectHubConsumptionSurface> = [
  {
    surface: 'Contextual Lessons Panel',
    surfacedOn: 'Project Hub project detail view (for active or new projects)',
    trigger: 'When user views a project, system queries LessonsIntelligence index using project profile',
    capabilities: 'Read, filter, expand, copy recommendation text',
    restrictions: 'Edit, annotate, flag, delete, modify publication status',
  },
  {
    surface: 'Sub Vetting Intelligence Panel',
    surfacedOn: 'Project Hub procurement surface (SUB_INTELLIGENCE_VIEWER or higher only)',
    trigger: 'User enters subcontractor name or selects registered sub',
    capabilities: 'Read scores and ratings; view history; export summary (PE/PER/MOE: read narratives, view aggregate trend)',
    restrictions: 'Create evaluations, edit scores, change publication status',
  },
  {
    surface: 'Learning Legacy Feed',
    surfacedOn: 'Project Hub Organization Knowledge / Learning Library section',
    trigger: 'Manually browsable + contextual surfacing on new project setup',
    capabilities: 'Browse, filter by type/sector/method/size/risk/tags, expand full content',
    restrictions: 'Create, edit, re-publish, delete',
  },
];

// -- Activity Spine Events (§5.1) — 17 events --------------------------------

export const CLOSEOUT_ACTIVITY_SPINE_EVENTS: ReadonlyArray<IActivitySpineEvent> = [
  { eventKey: 'closeout.checklist-created', trigger: 'Checklist instantiated', payloadDescription: 'projectId, checklistId, templateVersion, jurisdiction' },
  { eventKey: 'closeout.item-completed', trigger: 'Any item result changes to Yes/No/NA', payloadDescription: 'projectId, itemId, itemNumber, result, previousResult' },
  { eventKey: 'closeout.substantial-completion', trigger: 'Item 2.10 = Yes', payloadDescription: 'projectId, itemId, itemDate' },
  { eventKey: 'closeout.co-obtained', trigger: 'Item 3.11 = Yes', payloadDescription: 'projectId, itemId, itemDate' },
  { eventKey: 'closeout.last-work-date-recorded', trigger: 'Item 4.13 = Yes', payloadDescription: 'projectId, itemId, itemDate' },
  { eventKey: 'closeout.liens-released', trigger: 'Item 4.15 = Yes', payloadDescription: 'projectId, itemId' },
  { eventKey: 'closeout.files-returned', trigger: 'Item 5.5 = Yes', payloadDescription: 'projectId, itemId' },
  { eventKey: 'closeout.scorecard-submitted', trigger: 'First FinalCloseout scorecard submitted', payloadDescription: 'projectId, scorecardId, subcontractorName, evaluationType' },
  { eventKey: 'closeout.scorecard-approved', trigger: 'FinalCloseout scorecard PE-approved', payloadDescription: 'projectId, scorecardId, subcontractorName, overallWeightedScore, performanceRating' },
  { eventKey: 'closeout.scorecard-published', trigger: 'Scorecard published to org index', payloadDescription: 'projectId, scorecardId, indexEntryId' },
  { eventKey: 'closeout.lessons-submitted', trigger: 'LessonsLearningReport submitted', payloadDescription: 'projectId, reportId, entryCount' },
  { eventKey: 'closeout.lessons-approved', trigger: 'LessonsLearningReport PE-approved', payloadDescription: 'projectId, reportId, entryCount' },
  { eventKey: 'closeout.lessons-published', trigger: 'Lessons published to org index', payloadDescription: 'projectId, reportId, publishedEntryCount' },
  { eventKey: 'closeout.autopsy-complete', trigger: 'AutopsyRecord PE-approved', payloadDescription: 'projectId, autopsyId, findingCount, actionCount, outputCount' },
  { eventKey: 'closeout.learning-legacy-published', trigger: 'Learning legacy outputs published', payloadDescription: 'projectId, autopsyId, publishedOutputCount, outputIds' },
  { eventKey: 'closeout.archive-ready', trigger: 'ARCHIVE_READY milestone approved by PE', payloadDescription: 'projectId, checklistId, milestonesAllApproved: true' },
  { eventKey: 'closeout.archived', trigger: 'Project reaches ARCHIVED state', payloadDescription: 'projectId, publishedAt, lessonsCount, scorecardsCount, learningOutputCount' },
];

// -- Health Spine Metrics (§5.2) — 4 metrics --------------------------------

export const CLOSEOUT_HEALTH_SPINE_METRICS: ReadonlyArray<IHealthSpineMetric> = [
  { dimensionKey: 'closeoutCompletionPct', formula: '(Yes items / applicable items) × 100', emittedWhen: 'Any item result change' },
  { dimensionKey: 'scorecardCoverage', formula: '(PE_APPROVED FinalCloseout scorecards / total registered subs) × 100', emittedWhen: 'Any scorecard status change' },
  { dimensionKey: 'lessonsReadiness', formula: '0 if LessonsLearningReport < PE_APPROVED; 100 if PE_APPROVED', emittedWhen: 'Report status change' },
  { dimensionKey: 'autopsyReadiness', formula: '0 if AutopsyRecord < PE_APPROVED; 100 if PE_APPROVED', emittedWhen: 'Autopsy status change' },
];

// -- Report Artifact Families (§6.1) ----------------------------------------

export const CLOSEOUT_REPORT_ARTIFACT_FAMILIES: ReadonlyArray<IReportArtifactFamily> = [
  { artifact: 'sub-scorecard', trigger: 'Per-sub; generated at closeout by PM/PE', snapshotSource: 'GET /api/closeout/{projectId}/scorecard/{scorecardId}/snapshot', reportsRole: 'Assembles scored criterion tables, narrative, section charts into PDF' },
  { artifact: 'lessons-learned', trigger: 'Per-project; generated at closeout', snapshotSource: 'GET /api/closeout/{projectId}/lessons/snapshot', reportsRole: 'Assembles entry list, category distribution, magnitude analysis into PDF' },
];

// -- Snapshot Preconditions (§6.2) ------------------------------------------

export const CLOSEOUT_SNAPSHOT_PRECONDITIONS: ReadonlyArray<ISnapshotPrecondition> = [
  { snapshot: 'Scorecard snapshot', precondition: 'SubcontractorScorecard.publicationStatus >= PE_APPROVED; caller has PE role' },
  { snapshot: 'Lessons snapshot', precondition: 'LessonsLearningReport.publicationStatus >= PE_APPROVED; caller has PE role' },
];

// -- UI Data Class Rules (§4) -----------------------------------------------

export const CLOSEOUT_UI_DATA_CLASS_RULES: ReadonlyArray<IUIDataClassRule> = [
  { surfaceElement: 'Checklist item result', dataClass: 'ProjectOperational', mutability: 'Editable by PM/SUPT', navigation: 'Within project Closeout module' },
  { surfaceElement: 'Lesson entry (in project)', dataClass: 'ProjectOperational', mutability: 'Editable while Draft', navigation: 'Within project Closeout module' },
  { surfaceElement: 'Org lessons index entry', dataClass: 'PublishedIntelligence', mutability: 'Immutable', navigation: 'Source: [Project Name] — view source link if user has project access' },
  { surfaceElement: 'Sub scorecard (in project)', dataClass: 'ProjectOperational', mutability: 'Editable while Draft', navigation: 'Within project Closeout module' },
  { surfaceElement: 'SubIntelligence index entry', dataClass: 'PublishedIntelligence', mutability: 'Immutable', navigation: 'Source: [Project Name] — view source link if user has project access' },
  { surfaceElement: 'Learning legacy output (in project)', dataClass: 'ProjectOperational', mutability: 'Editable while Draft', navigation: 'Within project Closeout module' },
  { surfaceElement: 'Learning legacy feed entry', dataClass: 'PublishedIntelligence', mutability: 'Immutable', navigation: 'Source: [Project Name] — view source link if user has project access' },
];

// -- Label Maps -------------------------------------------------------------

export const CLOSEOUT_DATA_CLASS_LABELS: Readonly<Record<CloseoutDataClass, string>> = {
  ProjectOperational: 'Project Operational Record',
  PublishedIntelligence: 'Published Intelligence Record',
  ReadOnlyAggregation: 'Read-Only Aggregation Surface',
};

export const CLOSEOUT_ORG_INDEX_LABELS: Readonly<Record<CloseoutOrgIndex, string>> = {
  LessonsIntelligence: 'Lessons Intelligence Index',
  SubIntelligence: 'SubIntelligence Index',
  LearningLegacy: 'Learning Legacy Feed',
};

export const CLOSEOUT_HEALTH_SPINE_DIMENSION_LABELS: Readonly<Record<CloseoutHealthSpineDimension, string>> = {
  closeoutCompletionPct: 'Closeout Completion %',
  scorecardCoverage: 'Scorecard Coverage %',
  lessonsReadiness: 'Lessons Readiness',
  autopsyReadiness: 'Autopsy Readiness',
};
