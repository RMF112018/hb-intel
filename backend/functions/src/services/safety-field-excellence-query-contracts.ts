/**
 * Safety Field Excellence Graph query contracts.
 *
 * Lightweight registry mirroring the pattern in
 * `safety-ingestion-graph-repository.ts → SAFETY_GRAPH_QUERY_CONTRACTS`.
 * Each entry documents which Wave 01 indexed fields the query depends on,
 * the bounded select set, and the natural-key intent — so reviewers can
 * confirm index discipline and `RawChecklistJson` is never selected.
 *
 * Wave 03 deliberately keeps this scoped to the new feature; the broader
 * Safety query-contract registry continues to own ingestion paths.
 */

export interface ISafetyFieldExcellenceQueryContract {
  readonly id: string;
  readonly list:
    | 'SafetyReportingPeriods'
    | 'SafetyProjectWeekRecords'
    | 'SafetyInspectionEvents'
    | 'SafetyFindings'
    | 'SafetyFieldExcellenceCandidateScores';
  readonly purpose: string;
  readonly strategy: string;
  readonly requiredIndexedFields: readonly string[];
  readonly select: readonly string[];
}

const PROJECT_WEEK_SELECT = [
  'Title',
  'ReportingPeriodIdLookupId',
  'ProjectNumber',
  'ProjectNameSnapshot',
  'ProjectLocationSnapshot',
  'ProjectStageSnapshot',
  'ProjectSourceClassification',
  'ProjectLookupIdLookupId',
  'LegacyRegistryItemId',
  'ExpectedInspectionThisWeek',
  'InspectionCount',
  'AverageInspectionScore',
  'HighestRiskFindingLevel',
  'WeeklySummary',
  'ManagerReviewStatus',
  'PublishStatus',
] as const;

// `RawChecklistJson` is intentionally NOT selected — backend rollup never
// reads, returns, or persists raw checklist data.
const INSPECTION_SELECT = [
  'Title',
  'ProjectWeekRecordIdLookupId',
  'ReportingPeriodIdLookupId',
  'SourceUploadItemId',
  'SourceUploadWebUrl',
  'Checksum',
  'TemplateVersion',
  'ParserVersion',
  'ScoringMode',
  'InspectionDate',
  'InspectionNumber',
  'ProjectNumber',
  'ProjectNameSnapshot',
  'InspectionScore',
  'TotalYes',
  'TotalNo',
  'TotalNA',
  'IngestionStatus',
  'DuplicateStatus',
  'RequiresReview',
  'SubmittedAt',
  'CommittedAt',
] as const;

const FINDING_SELECT = [
  'Title',
  'InspectionEventIdLookupId',
  'ProjectWeekRecordIdLookupId',
  'SectionNumber',
  'SectionName',
  'ChecklistRowNumber',
  'ChecklistItemLabel',
  'FindingType',
  'Severity',
  'FindingSummary',
  'RequiresCorrectiveAction',
  'IsOpen',
] as const;

const CANDIDATE_SELECT = [
  'Title',
  'ReportingPeriodIdLookupId',
  'ProjectWeekRecordIdLookupId',
  'ProjectLookupIdLookupId',
  'ProjectNumber',
  'ProjectNameSnapshot',
  'ProjectStageSnapshot',
  'ProjectLocationSnapshot',
  'EligibilityStatus',
  'ExclusionReasonsJson',
  'CompositeScore',
  'SafetyPerformanceScore',
  'ConsistencyTrendScore',
  'ActivityExposureScore',
  'CorrectiveActionScore',
  'DataQualityScore',
  'InspectionCountWindow',
  'InspectionCountRolling',
  'AverageInspectionScoreWindow',
  'AverageInspectionScoreRolling',
  'InspectionTrendPct',
  'HighestRiskFindingLevel',
  'HighSeverityFindingCount',
  'MediumSeverityFindingCount',
  'OpenFindingCount',
  'AgedOpenFindingCount',
  'RepeatFindingCount',
  'ActivityEvidenceStatus',
  'ActivityEvidenceJson',
  'ReasonSummary',
  'SourceInspectionIdsJson',
  'SourceFindingIdsJson',
  'GeneratedAt',
  'GeneratorVersion',
  'PublishRecommendation',
] as const;

export const EXCELLENCE_QUERY_CONTRACTS: readonly ISafetyFieldExcellenceQueryContract[] = [
  {
    id: 'excellence-project-weeks-by-period',
    list: 'SafetyProjectWeekRecords',
    purpose: 'List project-week rollups for a given reporting period.',
    strategy:
      "Single-field $filter (ReportingPeriodIdLookupId eq N) with paged listItems and $select.",
    requiredIndexedFields: ['ReportingPeriodIdLookupId'],
    select: PROJECT_WEEK_SELECT,
  },
  {
    id: 'excellence-inspections-by-project-week',
    list: 'SafetyInspectionEvents',
    purpose: 'List accepted/duplicate-suspected/review-required inspections for a project-week.',
    strategy:
      "Single-field $filter (ProjectWeekRecordIdLookupId eq N) with paged listItems. " +
      'RawChecklistJson is intentionally not selected.',
    requiredIndexedFields: ['ProjectWeekRecordIdLookupId'],
    select: INSPECTION_SELECT,
  },
  {
    id: 'excellence-findings-by-project-week',
    list: 'SafetyFindings',
    purpose: 'List findings for a project-week to feed corrective-action scoring.',
    strategy: "Single-field $filter (ProjectWeekRecordIdLookupId eq N) with paged listItems.",
    requiredIndexedFields: ['ProjectWeekRecordIdLookupId'],
    select: FINDING_SELECT,
  },
  {
    id: 'excellence-rolling-project-weeks-by-project',
    list: 'SafetyProjectWeekRecords',
    purpose:
      'Rolling-history project-weeks for a project number, bounded by week-start window.',
    strategy:
      "Compound $filter (ProjectNumber eq 'X' and WeekStartDate ge <floor> and WeekStartDate lt <ceiling>) " +
      'with paged listItems.',
    requiredIndexedFields: ['ProjectNumber'],
    select: PROJECT_WEEK_SELECT,
  },
  {
    id: 'excellence-candidate-natural-key',
    list: 'SafetyFieldExcellenceCandidateScores',
    purpose:
      'Idempotent upsert read by (ReportingPeriodIdLookupId, ProjectWeekRecordIdLookupId, ' +
      'ProjectNumber, GeneratorVersion).',
    strategy:
      'Bounded single-page compound $filter with top:2; >1 match throws ' +
      'CANDIDATE_IDENTITY_COLLISION (natural-key violation).',
    requiredIndexedFields: [
      'ReportingPeriodIdLookupId',
      'ProjectWeekRecordIdLookupId',
      'ProjectNumber',
    ],
    select: CANDIDATE_SELECT,
  },
  {
    id: 'excellence-candidate-list',
    list: 'SafetyFieldExcellenceCandidateScores',
    purpose: 'List persisted candidates for a reporting period with optional facet filters.',
    strategy:
      "Single-field $filter (ReportingPeriodIdLookupId eq N) optionally narrowed by " +
      'EligibilityStatus / PublishRecommendation / GeneratorVersion via paged listItems.',
    requiredIndexedFields: ['ReportingPeriodIdLookupId'],
    select: CANDIDATE_SELECT,
  },
] as const;

export const EXCELLENCE_PROJECT_WEEK_SELECT = PROJECT_WEEK_SELECT;
export const EXCELLENCE_INSPECTION_SELECT = INSPECTION_SELECT;
export const EXCELLENCE_FINDING_SELECT = FINDING_SELECT;
export const EXCELLENCE_CANDIDATE_SELECT = CANDIDATE_SELECT;
