/**
 * Field schema for Safety Record Keeping lists.
 *
 * Used by the tenant-provisioning checklist in README and as a reference
 * for the SharePoint adapter write payloads.
 */

export type SpFieldType =
  | 'Text'
  | 'Note'
  | 'Number'
  | 'DateTime'
  | 'Boolean'
  | 'Choice'
  | 'Lookup'
  | 'User';

export interface SpFieldDefinition {
  readonly internalName: string;
  readonly displayName: string;
  readonly type: SpFieldType;
  readonly required?: boolean;
  readonly choices?: ReadonlyArray<string>;
  readonly lookupList?: string;
  readonly indexed?: boolean;
}

export const SAFETY_REPORTING_PERIODS_FIELDS: ReadonlyArray<SpFieldDefinition> = [
  { internalName: 'Title', displayName: 'Title', type: 'Text', required: true },
  { internalName: 'WeekStartDate', displayName: 'Week Start Date', type: 'DateTime', required: true },
  { internalName: 'WeekEndDate', displayName: 'Week End Date', type: 'DateTime', required: true },
  { internalName: 'PeriodLabel', displayName: 'Period Label', type: 'Text' },
  {
    internalName: 'Status',
    displayName: 'Status',
    type: 'Choice',
    choices: ['open', 'closed', 'published'],
  },
  { internalName: 'PublishedAt', displayName: 'Published At', type: 'DateTime' },
  { internalName: 'PublishedBy', displayName: 'Published By', type: 'User' },
  { internalName: 'Notes', displayName: 'Notes', type: 'Note' },
];

export const SAFETY_PROJECT_WEEK_RECORDS_FIELDS: ReadonlyArray<SpFieldDefinition> = [
  { internalName: 'Title', displayName: 'Title', type: 'Text', required: true },
  {
    internalName: 'ReportingPeriodId',
    displayName: 'Reporting Period',
    type: 'Lookup',
    lookupList: 'Safety Reporting Periods',
    required: true,
  },
  {
    internalName: 'ProjectLookupId',
    displayName: 'Project',
    type: 'Lookup',
    lookupList: 'Projects',
  },
  {
    internalName: 'LegacyRegistryItemId',
    displayName: 'Legacy Registry Item',
    type: 'Number',
  },
  {
    internalName: 'ProjectSourceClassification',
    displayName: 'Project Source',
    type: 'Choice',
    choices: ['project', 'legacy-only', 'project+legacy', 'unresolved'],
  },
  { internalName: 'ProjectNumber', displayName: 'Project Number', type: 'Text', required: true },
  { internalName: 'ProjectNameSnapshot', displayName: 'Project Name', type: 'Text' },
  { internalName: 'ProjectStageSnapshot', displayName: 'Project Stage', type: 'Text' },
  { internalName: 'ProjectLocationSnapshot', displayName: 'Project Location', type: 'Text' },
  {
    internalName: 'ExpectedInspectionThisWeek',
    displayName: 'Expected This Week',
    type: 'Boolean',
  },
  { internalName: 'InspectionCount', displayName: 'Inspection Count', type: 'Number' },
  { internalName: 'AverageInspectionScore', displayName: 'Average Score', type: 'Number' },
  {
    internalName: 'HighestRiskFindingLevel',
    displayName: 'Highest Risk Level',
    type: 'Choice',
    choices: ['info', 'medium', 'high'],
  },
  { internalName: 'WeeklySummary', displayName: 'Weekly Summary', type: 'Note' },
  {
    internalName: 'ManagerReviewStatus',
    displayName: 'Manager Review',
    type: 'Choice',
    choices: ['not-required', 'pending', 'approved'],
  },
  {
    internalName: 'PublishStatus',
    displayName: 'Publish Status',
    type: 'Choice',
    choices: [
      'not-started',
      'awaiting-upload',
      'in-progress',
      'completed',
      'review-required',
      'published',
    ],
  },
];

export const SAFETY_INSPECTION_EVENTS_FIELDS: ReadonlyArray<SpFieldDefinition> = [
  { internalName: 'Title', displayName: 'Title', type: 'Text', required: true },
  {
    internalName: 'ProjectWeekRecordId',
    displayName: 'Project-Week Record',
    type: 'Lookup',
    lookupList: 'Safety Project Week Records',
    required: true,
  },
  {
    internalName: 'ReportingPeriodId',
    displayName: 'Reporting Period',
    type: 'Lookup',
    lookupList: 'Safety Reporting Periods',
    required: true,
  },
  {
    internalName: 'SourceUploadItemId',
    displayName: 'Source Upload Item ID',
    type: 'Number',
    required: true,
  },
  { internalName: 'SourceUploadWebUrl', displayName: 'Source Upload URL', type: 'Text' },
  { internalName: 'Checksum', displayName: 'Checksum', type: 'Text' },
  { internalName: 'TemplateVersion', displayName: 'Template Version', type: 'Text' },
  { internalName: 'ParserVersion', displayName: 'Parser Version', type: 'Text' },
  {
    internalName: 'ScoringMode',
    displayName: 'Scoring Mode',
    type: 'Choice',
    choices: ['template-compat-v1', 'normalized-vNext'],
  },
  { internalName: 'InspectionDate', displayName: 'Inspection Date', type: 'DateTime' },
  { internalName: 'InspectionNumber', displayName: 'Inspection Number', type: 'Text' },
  { internalName: 'InspectorName', displayName: 'Inspector', type: 'Text' },
  { internalName: 'InspectorUpn', displayName: 'Inspector UPN', type: 'Text' },
  { internalName: 'ProjectNumber', displayName: 'Project Number', type: 'Text' },
  { internalName: 'ProjectNameSnapshot', displayName: 'Project Name', type: 'Text' },
  { internalName: 'InspectionScore', displayName: 'Inspection Score', type: 'Number' },
  { internalName: 'TotalYes', displayName: 'Total Yes', type: 'Number' },
  { internalName: 'TotalNo', displayName: 'Total No', type: 'Number' },
  { internalName: 'TotalNA', displayName: 'Total N/A', type: 'Number' },
  { internalName: 'RawChecklistJson', displayName: 'Raw Checklist JSON', type: 'Note' },
  {
    internalName: 'IngestionStatus',
    displayName: 'Ingestion Status',
    type: 'Choice',
    choices: ['accepted', 'duplicate-suspected', 'superseded', 'review-required', 'rejected'],
  },
  {
    internalName: 'DuplicateStatus',
    displayName: 'Duplicate Status',
    type: 'Choice',
    choices: ['none', 'near-duplicate', 'high-confidence-duplicate'],
  },
  { internalName: 'RequiresReview', displayName: 'Requires Review', type: 'Boolean' },
  { internalName: 'SubmittedAt', displayName: 'Submitted At', type: 'DateTime' },
  { internalName: 'CommittedAt', displayName: 'Committed At', type: 'DateTime' },
  {
    internalName: 'SupersededByInspectionEventId',
    displayName: 'Superseded By',
    type: 'Lookup',
    lookupList: 'Safety Inspection Events',
  },
];

export const SAFETY_FINDINGS_FIELDS: ReadonlyArray<SpFieldDefinition> = [
  { internalName: 'Title', displayName: 'Title', type: 'Text', required: true },
  {
    internalName: 'InspectionEventId',
    displayName: 'Inspection Event',
    type: 'Lookup',
    lookupList: 'Safety Inspection Events',
    required: true,
  },
  {
    internalName: 'ProjectWeekRecordId',
    displayName: 'Project-Week Record',
    type: 'Lookup',
    lookupList: 'Safety Project Week Records',
  },
  { internalName: 'SectionNumber', displayName: 'Section Number', type: 'Number' },
  { internalName: 'SectionName', displayName: 'Section Name', type: 'Text' },
  { internalName: 'ChecklistRowNumber', displayName: 'Checklist Row', type: 'Number' },
  { internalName: 'ChecklistItemLabel', displayName: 'Checklist Item', type: 'Note' },
  {
    internalName: 'FindingType',
    displayName: 'Finding Type',
    type: 'Choice',
    choices: ['no-response', 'incomplete', 'multi', 'note-only'],
  },
  {
    internalName: 'Severity',
    displayName: 'Severity',
    type: 'Choice',
    choices: ['info', 'medium', 'high'],
  },
  { internalName: 'FindingSummary', displayName: 'Finding Summary', type: 'Note' },
  { internalName: 'OriginalNoteText', displayName: 'Original Note', type: 'Note' },
  { internalName: 'RequiresCorrectiveAction', displayName: 'Requires CA', type: 'Boolean' },
  { internalName: 'IsOpen', displayName: 'Is Open', type: 'Boolean' },
];

export const SAFETY_INGESTION_RUNS_FIELDS: ReadonlyArray<SpFieldDefinition> = [
  { internalName: 'Title', displayName: 'Title', type: 'Text', required: true },
  { internalName: 'SourceUploadItemId', displayName: 'Upload Item ID', type: 'Number' },
  { internalName: 'UploadFileName', displayName: 'Upload File Name', type: 'Text' },
  { internalName: 'TemplateVersionDetected', displayName: 'Template Version', type: 'Text' },
  { internalName: 'Checksum', displayName: 'Checksum', type: 'Text' },
  {
    internalName: 'ValidationStatus',
    displayName: 'Validation Status',
    type: 'Choice',
    choices: ['pending', 'passed', 'failed'],
  },
  {
    internalName: 'ParseStatus',
    displayName: 'Parse Status',
    type: 'Choice',
    choices: ['pending', 'passed', 'failed', 'skipped'],
  },
  {
    internalName: 'ProjectResolutionStatus',
    displayName: 'Project Resolution',
    type: 'Choice',
    choices: ['pending', 'resolved', 'unresolved', 'skipped'],
  },
  {
    internalName: 'TerminalStatus',
    displayName: 'Terminal Status',
    type: 'Choice',
    choices: [
      'invalid-template',
      'parse-error',
      'reporting-period-mismatch',
      'unresolved-project',
      'review-required',
      'committed',
      'commit-failed',
    ],
  },
  { internalName: 'CommittedEntityIdsJson', displayName: 'Committed IDs', type: 'Note' },
  { internalName: 'ErrorClass', displayName: 'Error Class', type: 'Text' },
  { internalName: 'ErrorSummary', displayName: 'Error Summary', type: 'Note' },
  { internalName: 'RunStartedAt', displayName: 'Run Started', type: 'DateTime' },
  { internalName: 'RunCompletedAt', displayName: 'Run Completed', type: 'DateTime' },
  { internalName: 'AttemptNumber', displayName: 'Attempt Number', type: 'Number' },
  {
    internalName: 'ReportingPeriodId',
    displayName: 'Reporting Period',
    type: 'Lookup',
    lookupList: 'Safety Reporting Periods',
  },
  { internalName: 'AttemptedProjectSiteText', displayName: 'Attempted Project/Site', type: 'Note' },
  { internalName: 'ResolvedProjectNumber', displayName: 'Resolved Project Number', type: 'Text' },
  {
    internalName: 'ProjectSourceClassification',
    displayName: 'Project Source',
    type: 'Choice',
    choices: ['project', 'legacy-only', 'project+legacy', 'unresolved'],
  },
  {
    internalName: 'ReviewStatus',
    displayName: 'Review Status',
    type: 'Choice',
    choices: ['none', 'pending-review', 'in-review', 'resolved', 'replayed-success', 'replayed-failed'],
  },
  {
    internalName: 'ParentRunId',
    displayName: 'Parent Run',
    type: 'Lookup',
    lookupList: 'Safety Ingestion Runs',
  },
  { internalName: 'ReviewedAt', displayName: 'Reviewed At', type: 'DateTime' },
  { internalName: 'ReviewedBy', displayName: 'Reviewed By', type: 'User' },
  { internalName: 'ResolutionNote', displayName: 'Resolution Note', type: 'Note' },
];

export const SAFETY_FIELD_EXCELLENCE_CANDIDATE_SCORES_FIELDS: ReadonlyArray<SpFieldDefinition> = [
  { internalName: 'Title', displayName: 'Title', type: 'Text', required: true },
  {
    internalName: 'ReportingPeriodId',
    displayName: 'Reporting Period',
    type: 'Lookup',
    lookupList: 'Safety Reporting Periods',
    required: true,
    indexed: true,
  },
  {
    internalName: 'ProjectWeekRecordId',
    displayName: 'Project-Week Record',
    type: 'Lookup',
    lookupList: 'Safety Project Week Records',
    required: true,
    indexed: true,
  },
  {
    internalName: 'ProjectLookupId',
    displayName: 'Project',
    type: 'Lookup',
    lookupList: 'Projects',
  },
  {
    internalName: 'ProjectNumber',
    displayName: 'Project Number',
    type: 'Text',
    required: true,
    indexed: true,
  },
  { internalName: 'ProjectNameSnapshot', displayName: 'Project Name', type: 'Text' },
  { internalName: 'ProjectStageSnapshot', displayName: 'Project Stage', type: 'Text' },
  { internalName: 'ProjectLocationSnapshot', displayName: 'Project Location', type: 'Text' },
  {
    internalName: 'EligibilityStatus',
    displayName: 'Eligibility Status',
    type: 'Choice',
    required: true,
    choices: ['eligible', 'ineligible', 'low-confidence', 'needs-review'],
  },
  { internalName: 'ExclusionReasonsJson', displayName: 'Exclusion Reasons (JSON)', type: 'Note' },
  { internalName: 'CompositeScore', displayName: 'Composite Score', type: 'Number' },
  { internalName: 'SafetyPerformanceScore', displayName: 'Safety Performance Score', type: 'Number' },
  { internalName: 'ConsistencyTrendScore', displayName: 'Consistency Trend Score', type: 'Number' },
  { internalName: 'ActivityExposureScore', displayName: 'Activity Exposure Score', type: 'Number' },
  { internalName: 'CorrectiveActionScore', displayName: 'Corrective Action Score', type: 'Number' },
  { internalName: 'DataQualityScore', displayName: 'Data Quality Score', type: 'Number' },
  { internalName: 'InspectionCountWindow', displayName: 'Inspection Count (Window)', type: 'Number' },
  { internalName: 'InspectionCountRolling', displayName: 'Inspection Count (Rolling)', type: 'Number' },
  { internalName: 'AverageInspectionScoreWindow', displayName: 'Average Score (Window)', type: 'Number' },
  { internalName: 'AverageInspectionScoreRolling', displayName: 'Average Score (Rolling)', type: 'Number' },
  { internalName: 'InspectionTrendPct', displayName: 'Inspection Trend %', type: 'Number' },
  {
    internalName: 'HighestRiskFindingLevel',
    displayName: 'Highest Risk Level',
    type: 'Choice',
    choices: ['info', 'medium', 'high'],
  },
  { internalName: 'HighSeverityFindingCount', displayName: 'High Severity Count', type: 'Number' },
  { internalName: 'MediumSeverityFindingCount', displayName: 'Medium Severity Count', type: 'Number' },
  { internalName: 'OpenFindingCount', displayName: 'Open Finding Count', type: 'Number' },
  { internalName: 'AgedOpenFindingCount', displayName: 'Aged Open Finding Count', type: 'Number' },
  { internalName: 'RepeatFindingCount', displayName: 'Repeat Finding Count', type: 'Number' },
  {
    internalName: 'ActivityEvidenceStatus',
    displayName: 'Activity Evidence Status',
    type: 'Choice',
    choices: ['proven', 'inferred', 'missing'],
  },
  { internalName: 'ActivityEvidenceJson', displayName: 'Activity Evidence (JSON)', type: 'Note' },
  { internalName: 'ReasonSummary', displayName: 'Reason Summary', type: 'Note' },
  { internalName: 'SourceInspectionIdsJson', displayName: 'Source Inspection IDs (JSON)', type: 'Note' },
  { internalName: 'SourceFindingIdsJson', displayName: 'Source Finding IDs (JSON)', type: 'Note' },
  {
    internalName: 'GeneratedAt',
    displayName: 'Generated At',
    type: 'DateTime',
    required: true,
    indexed: true,
  },
  { internalName: 'GeneratorVersion', displayName: 'Generator Version', type: 'Text', required: true },
  {
    internalName: 'PublishRecommendation',
    displayName: 'Publish Recommendation',
    type: 'Choice',
    choices: ['primary', 'secondary', 'monitor', 'do-not-publish'],
  },
];

export const SAFETY_FIELD_EXCELLENCE_WEEKLY_HIGHLIGHTS_FIELDS: ReadonlyArray<SpFieldDefinition> = [
  { internalName: 'Title', displayName: 'Title', type: 'Text', required: true },
  {
    internalName: 'ReportingPeriodId',
    displayName: 'Reporting Period',
    type: 'Lookup',
    lookupList: 'Safety Reporting Periods',
    required: true,
    indexed: true,
  },
  {
    internalName: 'WeekStartDate',
    displayName: 'Week Start Date',
    type: 'DateTime',
    required: true,
    indexed: true,
  },
  {
    internalName: 'WeekEndDate',
    displayName: 'Week End Date',
    type: 'DateTime',
    required: true,
    indexed: true,
  },
  { internalName: 'PeriodLabel', displayName: 'Period Label', type: 'Text' },
  {
    internalName: 'PublishStatus',
    displayName: 'Publish Status',
    type: 'Choice',
    required: true,
    choices: ['draft', 'pending-review', 'approved', 'published', 'archived', 'suppressed'],
    indexed: true,
  },
  {
    internalName: 'PrimaryCandidateId',
    displayName: 'Primary Candidate',
    type: 'Lookup',
    lookupList: 'Safety Field Excellence Candidate Scores',
  },
  {
    internalName: 'SecondaryCandidateIdsJson',
    displayName: 'Secondary Candidate IDs (JSON)',
    type: 'Note',
  },
  { internalName: 'HomepagePayloadJson', displayName: 'Homepage Payload (JSON)', type: 'Note' },
  { internalName: 'SourceCandidateIdsJson', displayName: 'Source Candidate IDs (JSON)', type: 'Note' },
  { internalName: 'SelectionMethodVersion', displayName: 'Selection Method Version', type: 'Text' },
  {
    internalName: 'DataConfidence',
    displayName: 'Data Confidence',
    type: 'Choice',
    choices: ['high', 'medium', 'low'],
  },
  { internalName: 'DataQualityNotes', displayName: 'Data Quality Notes', type: 'Note' },
  {
    internalName: 'EditorialOverrideApplied',
    displayName: 'Editorial Override Applied',
    type: 'Boolean',
  },
  { internalName: 'OverrideReason', displayName: 'Override Reason', type: 'Note' },
  { internalName: 'ApprovedBy', displayName: 'Approved By', type: 'User' },
  { internalName: 'ApprovedAt', displayName: 'Approved At', type: 'DateTime' },
  { internalName: 'PublishedAt', displayName: 'Published At', type: 'DateTime' },
  {
    internalName: 'FreshUntil',
    displayName: 'Fresh Until',
    type: 'DateTime',
    indexed: true,
  },
  {
    internalName: 'RollbackFromItemId',
    displayName: 'Rollback From Item ID',
    type: 'Number',
  },
];

export const FIELD_SCHEMA_BY_LIST = {
  SafetyReportingPeriods: SAFETY_REPORTING_PERIODS_FIELDS,
  SafetyProjectWeekRecords: SAFETY_PROJECT_WEEK_RECORDS_FIELDS,
  SafetyInspectionEvents: SAFETY_INSPECTION_EVENTS_FIELDS,
  SafetyFindings: SAFETY_FINDINGS_FIELDS,
  SafetyIngestionRuns: SAFETY_INGESTION_RUNS_FIELDS,
  SafetyFieldExcellenceCandidateScores: SAFETY_FIELD_EXCELLENCE_CANDIDATE_SCORES_FIELDS,
  SafetyFieldExcellenceWeeklyHighlights: SAFETY_FIELD_EXCELLENCE_WEEKLY_HIGHLIGHTS_FIELDS,
} as const;
