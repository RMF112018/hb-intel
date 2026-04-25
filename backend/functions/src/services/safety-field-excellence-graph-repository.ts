/**
 * Safety Field Excellence Graph repository.
 *
 * Owns Graph data access for the rollup APIs introduced in Wave 03. This
 * repository assembles existing Safety domain inputs and persists candidate
 * score records into `Safety Field Excellence Candidate Scores`. Scoring,
 * eligibility, ranking, narrative, and activity inference live in
 * `@hbc/features-safety/excellence` and are consumed verbatim by the
 * rollup service — never duplicated here.
 */

import type {
  FindingSeverity,
  ProjectSourceClassification,
  SafetyFinding,
  SafetyInspectionEvent,
  SafetyProjectWeekRecord,
  SafetyReportingPeriod,
} from '../../../../packages/features/safety/src/domain/types.js';
import type {
  SafetyExcellenceCandidateScore,
  SafetyExcellenceEligibilityStatus,
  SafetyExcellencePublishRecommendation,
  SafetyActivityEvidenceStatus,
} from '../../../../packages/features/safety/src/excellence/index.js';
import {
  resolveDescriptor,
  type SiteScopedListDescriptor,
} from '../../../../packages/features/safety/src/lists/descriptors.js';
import {
  GraphConcurrencyError,
  GraphRequestError,
  SafetyIngestionGraphDataPlane,
  assertSafetyGraphEtag,
  type IGraphListItem,
} from './safety-ingestion-graph-data-plane.js';
import type { IManagedIdentityTokenService } from './managed-identity-token-service.js';
import {
  EXCELLENCE_CANDIDATE_SELECT,
  EXCELLENCE_FINDING_SELECT,
  EXCELLENCE_INSPECTION_SELECT,
  EXCELLENCE_PROJECT_WEEK_SELECT,
} from './safety-field-excellence-query-contracts.js';
import {
  ReportingPeriodContractError,
  normalizeReportingPeriodContract,
} from './safety-reporting-period-contract.js';

const SAFETY_GRAPH_CONCURRENCY_MAX_ATTEMPTS = 3;
const SAFETY_GRAPH_CONCURRENCY_BASE_DELAY_MS = 100;

async function backoffDelay(attempt: number): Promise<void> {
  const jitter = Math.floor(Math.random() * SAFETY_GRAPH_CONCURRENCY_BASE_DELAY_MS);
  const wait = SAFETY_GRAPH_CONCURRENCY_BASE_DELAY_MS * Math.pow(2, attempt - 1) + jitter;
  await new Promise((resolve) => setTimeout(resolve, wait));
}

const REPORTING_PERIOD_SELECT = [
  'Title',
  'WeekStartDate',
  'WeekEndDate',
  'PeriodLabel',
  'Status',
  'PublishedAt',
  'Notes',
] as const;

export interface IPersistedSafetyFieldExcellenceCandidate
  extends SafetyExcellenceCandidateScore {
  readonly itemId: number;
  readonly reportingPeriodSpItemId: number;
  readonly projectWeekRecordSpItemId: number;
}

export interface ISafetyFieldExcellenceGraphRepository {
  resolveReportingPeriod(input: {
    readonly reportingPeriodId?: string;
    readonly reportingPeriodSpItemId?: number;
  }): Promise<SafetyReportingPeriod | null>;

  listProjectWeeksForReportingPeriod(input: {
    readonly reportingPeriodSpItemId: number;
  }): Promise<ReadonlyArray<SafetyProjectWeekRecord>>;

  listInspectionsForProjectWeek(input: {
    readonly projectWeekRecordSpItemId: number;
  }): Promise<ReadonlyArray<SafetyInspectionEvent>>;

  listFindingsForProjectWeek(input: {
    readonly projectWeekRecordSpItemId: number;
  }): Promise<ReadonlyArray<SafetyFinding>>;

  listRollingHistory(input: {
    readonly projectNumber: string;
    readonly currentReportingPeriod: SafetyReportingPeriod;
    readonly rollingWindowWeeks: number;
  }): Promise<{
    readonly priorProjectWeeks: ReadonlyArray<SafetyProjectWeekRecord>;
    readonly priorInspections: ReadonlyArray<SafetyInspectionEvent>;
    readonly priorFindings: ReadonlyArray<SafetyFinding>;
  }>;

  upsertCandidateScore(input: {
    readonly reportingPeriod: SafetyReportingPeriod;
    readonly projectWeek: SafetyProjectWeekRecord;
    readonly score: SafetyExcellenceCandidateScore;
  }): Promise<{ readonly outcome: 'created' | 'updated' | 'unchanged'; readonly itemId: number }>;

  listCandidateScores(input: {
    readonly reportingPeriodSpItemId: number;
    readonly generatorVersion?: string;
    readonly eligibilityStatus?: string;
    readonly publishRecommendation?: string;
    readonly top?: number;
  }): Promise<ReadonlyArray<IPersistedSafetyFieldExcellenceCandidate>>;
}

export class SafetyFieldExcellenceCandidateIdentityCollisionError extends Error {
  readonly code = 'CANDIDATE_IDENTITY_COLLISION';
  readonly reportingPeriodSpItemId: number;
  readonly projectWeekRecordSpItemId: number;
  readonly projectNumber: string;
  readonly generatorVersion: string;
  readonly matchCount: number;

  constructor(input: {
    reportingPeriodSpItemId: number;
    projectWeekRecordSpItemId: number;
    projectNumber: string;
    generatorVersion: string;
    matchCount: number;
  }) {
    super(
      `Candidate identity collision: ${input.matchCount} records matched ` +
        `(reportingPeriodSpItemId=${input.reportingPeriodSpItemId}, ` +
        `projectWeekRecordSpItemId=${input.projectWeekRecordSpItemId}, ` +
        `projectNumber=${input.projectNumber}, generatorVersion=${input.generatorVersion}). ` +
        'Upsert refused; manual remediation required.',
    );
    this.name = 'SafetyFieldExcellenceCandidateIdentityCollisionError';
    this.reportingPeriodSpItemId = input.reportingPeriodSpItemId;
    this.projectWeekRecordSpItemId = input.projectWeekRecordSpItemId;
    this.projectNumber = input.projectNumber;
    this.generatorVersion = input.generatorVersion;
    this.matchCount = input.matchCount;
  }
}

export class SafetyFieldExcellenceGraphRepository
  implements ISafetyFieldExcellenceGraphRepository
{
  private readonly graph: SafetyIngestionGraphDataPlane;

  constructor(graphOrTokenService: SafetyIngestionGraphDataPlane | IManagedIdentityTokenService) {
    this.graph =
      graphOrTokenService instanceof SafetyIngestionGraphDataPlane
        ? graphOrTokenService
        : new SafetyIngestionGraphDataPlane(graphOrTokenService);
  }

  private list(name: Parameters<typeof resolveDescriptor>[0]): SiteScopedListDescriptor {
    return resolveDescriptor(name);
  }

  async resolveReportingPeriod(input: {
    reportingPeriodId?: string;
    reportingPeriodSpItemId?: number;
  }): Promise<SafetyReportingPeriod | null> {
    if (!input.reportingPeriodId && !input.reportingPeriodSpItemId) return null;
    let normalizedId: number;
    try {
      const normalized = normalizeReportingPeriodContract({
        reportingPeriodId: input.reportingPeriodId ?? '',
        reportingPeriodSpItemId: input.reportingPeriodSpItemId,
      });
      normalizedId = normalized.reportingPeriodSpItemId;
    } catch (err) {
      if (err instanceof ReportingPeriodContractError) {
        return null;
      }
      throw err;
    }
    const descriptor = this.list('SafetyReportingPeriods');
    const item = await this.graph.getItemById(
      descriptor.siteUrl,
      descriptor.id,
      normalizedId,
      REPORTING_PERIOD_SELECT,
    );
    return item ? mapReportingPeriod(item) : null;
  }

  async listProjectWeeksForReportingPeriod(input: {
    reportingPeriodSpItemId: number;
  }): Promise<ReadonlyArray<SafetyProjectWeekRecord>> {
    const descriptor = this.list('SafetyProjectWeekRecords');
    const rows = await this.graph.listItems(descriptor.siteUrl, descriptor.id, {
      filter: `fields/ReportingPeriodIdLookupId eq ${input.reportingPeriodSpItemId}`,
      select: EXCELLENCE_PROJECT_WEEK_SELECT,
    });
    return rows.map(mapProjectWeek);
  }

  async listInspectionsForProjectWeek(input: {
    projectWeekRecordSpItemId: number;
  }): Promise<ReadonlyArray<SafetyInspectionEvent>> {
    const descriptor = this.list('SafetyInspectionEvents');
    const rows = await this.graph.listItems(descriptor.siteUrl, descriptor.id, {
      filter: `fields/ProjectWeekRecordIdLookupId eq ${input.projectWeekRecordSpItemId}`,
      select: EXCELLENCE_INSPECTION_SELECT,
    });
    return rows.map(mapInspectionEvent);
  }

  async listFindingsForProjectWeek(input: {
    projectWeekRecordSpItemId: number;
  }): Promise<ReadonlyArray<SafetyFinding>> {
    const descriptor = this.list('SafetyFindings');
    const rows = await this.graph.listItems(descriptor.siteUrl, descriptor.id, {
      filter: `fields/ProjectWeekRecordIdLookupId eq ${input.projectWeekRecordSpItemId}`,
      select: EXCELLENCE_FINDING_SELECT,
    });
    return rows.map(mapFinding);
  }

  async listRollingHistory(input: {
    projectNumber: string;
    currentReportingPeriod: SafetyReportingPeriod;
    rollingWindowWeeks: number;
  }): Promise<{
    priorProjectWeeks: ReadonlyArray<SafetyProjectWeekRecord>;
    priorInspections: ReadonlyArray<SafetyInspectionEvent>;
    priorFindings: ReadonlyArray<SafetyFinding>;
  }> {
    const descriptor = this.list('SafetyProjectWeekRecords');
    const currentStart = input.currentReportingPeriod.weekStartDate;
    const floorDate = computeRollingFloor(currentStart, input.rollingWindowWeeks);

    const projectWeekRows = await this.graph.listItems(descriptor.siteUrl, descriptor.id, {
      filter:
        `fields/ProjectNumber eq '${escapeGraphString(input.projectNumber)}' ` +
        `and fields/WeekStartDate ge '${floorDate}' ` +
        `and fields/WeekStartDate lt '${currentStart}'`,
      select: EXCELLENCE_PROJECT_WEEK_SELECT,
    });
    const priorProjectWeeks = projectWeekRows.map(mapProjectWeek);

    if (priorProjectWeeks.length === 0) {
      return { priorProjectWeeks: [], priorInspections: [], priorFindings: [] };
    }

    const priorInspections: SafetyInspectionEvent[] = [];
    const priorFindings: SafetyFinding[] = [];
    for (const week of priorProjectWeeks) {
      const inspections = await this.listInspectionsForProjectWeek({
        projectWeekRecordSpItemId: week.spItemId,
      });
      priorInspections.push(...inspections);
      const findings = await this.listFindingsForProjectWeek({
        projectWeekRecordSpItemId: week.spItemId,
      });
      priorFindings.push(...findings);
    }

    return { priorProjectWeeks, priorInspections, priorFindings };
  }

  async upsertCandidateScore(input: {
    reportingPeriod: SafetyReportingPeriod;
    projectWeek: SafetyProjectWeekRecord;
    score: SafetyExcellenceCandidateScore;
  }): Promise<{ outcome: 'created' | 'updated' | 'unchanged'; itemId: number }> {
    const descriptor = this.list('SafetyFieldExcellenceCandidateScores');
    const reportingPeriodSpItemId = input.reportingPeriod.spItemId;
    const projectWeekSpItemId = input.projectWeek.spItemId;
    const projectNumber = input.projectWeek.projectNumber;
    const generatorVersion = input.score.generatorVersion;

    const existing = await this.graph.listItemsBounded(
      descriptor.siteUrl,
      descriptor.id,
      {
        filter:
          `fields/ReportingPeriodIdLookupId eq ${reportingPeriodSpItemId} ` +
          `and fields/ProjectWeekRecordIdLookupId eq ${projectWeekSpItemId} ` +
          `and fields/ProjectNumber eq '${escapeGraphString(projectNumber)}' ` +
          `and fields/GeneratorVersion eq '${escapeGraphString(generatorVersion)}'`,
        top: 2,
        select: EXCELLENCE_CANDIDATE_SELECT,
      },
      'excellence-candidate-natural-key',
    );

    if (existing.length > 1) {
      throw new SafetyFieldExcellenceCandidateIdentityCollisionError({
        reportingPeriodSpItemId,
        projectWeekRecordSpItemId: projectWeekSpItemId,
        projectNumber,
        generatorVersion,
        matchCount: existing.length,
      });
    }

    const payload = toCandidateWritePayload({
      reportingPeriod: input.reportingPeriod,
      projectWeek: input.projectWeek,
      score: input.score,
    });

    if (existing.length === 0) {
      const created = await this.graph.createItem(descriptor.siteUrl, descriptor.id, payload);
      return { outcome: 'created', itemId: Number(created.id) };
    }

    const current = existing[0];
    const itemId = Number(current.id);
    const drift = candidatePayloadDrift(current.fields, payload);
    if (!drift) {
      return { outcome: 'unchanged', itemId };
    }

    for (let attempt = 1; attempt <= SAFETY_GRAPH_CONCURRENCY_MAX_ATTEMPTS; attempt++) {
      const fresh = await this.graph.getItemById(
        descriptor.siteUrl,
        descriptor.id,
        itemId,
        EXCELLENCE_CANDIDATE_SELECT,
      );
      assertSafetyGraphEtag(
        fresh?.etag,
        `SafetyFieldExcellenceCandidateScores/${itemId}`,
      );
      try {
        await this.graph.updateItemWithConcurrency(
          descriptor.siteUrl,
          descriptor.id,
          itemId,
          payload,
          fresh.etag,
        );
        return { outcome: 'updated', itemId };
      } catch (err) {
        if (!(err instanceof GraphConcurrencyError)) throw err;
        if (attempt === SAFETY_GRAPH_CONCURRENCY_MAX_ATTEMPTS) throw err;
        await backoffDelay(attempt);
      }
    }
    throw new Error('safety-field-excellence upsert exhausted concurrency retries');
  }

  async listCandidateScores(input: {
    reportingPeriodSpItemId: number;
    generatorVersion?: string;
    eligibilityStatus?: string;
    publishRecommendation?: string;
    top?: number;
  }): Promise<ReadonlyArray<IPersistedSafetyFieldExcellenceCandidate>> {
    const descriptor = this.list('SafetyFieldExcellenceCandidateScores');
    const filters: string[] = [
      `fields/ReportingPeriodIdLookupId eq ${input.reportingPeriodSpItemId}`,
    ];
    if (input.generatorVersion) {
      filters.push(`fields/GeneratorVersion eq '${escapeGraphString(input.generatorVersion)}'`);
    }
    if (input.eligibilityStatus) {
      filters.push(`fields/EligibilityStatus eq '${escapeGraphString(input.eligibilityStatus)}'`);
    }
    if (input.publishRecommendation) {
      filters.push(
        `fields/PublishRecommendation eq '${escapeGraphString(input.publishRecommendation)}'`,
      );
    }
    const rows = await this.graph.listItems(descriptor.siteUrl, descriptor.id, {
      filter: filters.join(' and '),
      select: EXCELLENCE_CANDIDATE_SELECT,
      top: input.top ?? 200,
    });
    return rows.map(mapPersistedCandidate);
  }
}

// -- Mappers and write payload --------------------------------------------

function mapReportingPeriod(row: IGraphListItem): SafetyReportingPeriod {
  const id = Number(row.id);
  return {
    id: `period-${id}`,
    spItemId: id,
    title: String(row.fields.Title ?? ''),
    weekStartDate: sliceDate(row.fields.WeekStartDate),
    weekEndDate: sliceDate(row.fields.WeekEndDate),
    periodLabel: String(row.fields.PeriodLabel ?? row.fields.Title ?? ''),
    status: toPeriodStatus(row.fields.Status),
    publishedAt: optionalString(row.fields.PublishedAt),
    notes: optionalString(row.fields.Notes),
  };
}

function mapProjectWeek(row: IGraphListItem): SafetyProjectWeekRecord {
  const id = Number(row.id);
  const reportingPeriodSpItemId =
    toOptionalNumber(row.fields.ReportingPeriodIdLookupId) ?? 0;
  return {
    id: `pw-${id}`,
    spItemId: id,
    title: String(row.fields.Title ?? ''),
    reportingPeriodId: `period-${reportingPeriodSpItemId}`,
    reportingPeriodSpItemId,
    projectNumber: String(row.fields.ProjectNumber ?? ''),
    projectNameSnapshot: String(row.fields.ProjectNameSnapshot ?? ''),
    projectLocationSnapshot: String(row.fields.ProjectLocationSnapshot ?? ''),
    projectStageSnapshot: String(row.fields.ProjectStageSnapshot ?? ''),
    projectSourceClassification: toProjectSource(row.fields.ProjectSourceClassification),
    projectLookupId: toOptionalNumber(row.fields.ProjectLookupIdLookupId) ?? undefined,
    legacyRegistryItemId: toOptionalNumber(row.fields.LegacyRegistryItemId) ?? undefined,
    expectedInspectionThisWeek: Boolean(row.fields.ExpectedInspectionThisWeek ?? false),
    inspectionCount: toNumber(row.fields.InspectionCount),
    averageInspectionScore: toOptionalNumber(row.fields.AverageInspectionScore),
    highestRiskFindingLevel: toFindingSeverity(row.fields.HighestRiskFindingLevel),
    weeklySummary: String(row.fields.WeeklySummary ?? ''),
    managerReviewStatus: toManagerStatus(row.fields.ManagerReviewStatus),
    publishStatus: toProjectWeekPublishStatus(row.fields.PublishStatus),
  };
}

function mapInspectionEvent(row: IGraphListItem): SafetyInspectionEvent {
  const id = Number(row.id);
  const projectWeekSpItemId = toNumber(row.fields.ProjectWeekRecordIdLookupId);
  const reportingSpItemId = toNumber(row.fields.ReportingPeriodIdLookupId);
  return {
    id: `ie-${id}`,
    spItemId: id,
    title: String(row.fields.Title ?? ''),
    projectWeekRecordId: `pw-${projectWeekSpItemId}`,
    projectWeekRecordSpItemId: projectWeekSpItemId,
    reportingPeriodId: `period-${reportingSpItemId}`,
    reportingPeriodSpItemId: reportingSpItemId,
    sourceUploadItemId: toNumber(row.fields.SourceUploadItemId),
    sourceUploadWebUrl: String(row.fields.SourceUploadWebUrl ?? ''),
    checksum: String(row.fields.Checksum ?? ''),
    templateVersion: String(row.fields.TemplateVersion ?? ''),
    parserVersion: String(row.fields.ParserVersion ?? ''),
    scoringMode: toScoringMode(row.fields.ScoringMode),
    inspectionDate: sliceDate(row.fields.InspectionDate),
    inspectionNumber: String(row.fields.InspectionNumber ?? ''),
    inspectorName: undefined,
    inspectorUpn: undefined,
    projectNumber: String(row.fields.ProjectNumber ?? ''),
    projectNameSnapshot: String(row.fields.ProjectNameSnapshot ?? ''),
    inspectionScore: toFractionalScore(row.fields.InspectionScore),
    totalYes: toNumber(row.fields.TotalYes),
    totalNo: toNumber(row.fields.TotalNo),
    totalNa: toNumber(row.fields.TotalNA),
    rawChecklistJson: '',
    ingestionStatus: toInspectionStatus(row.fields.IngestionStatus),
    duplicateStatus: toDuplicateStatus(row.fields.DuplicateStatus),
    requiresReview: Boolean(row.fields.RequiresReview ?? false),
    submittedAt: String(row.fields.SubmittedAt ?? ''),
    committedAt: optionalString(row.fields.CommittedAt),
  };
}

function mapFinding(row: IGraphListItem): SafetyFinding {
  const id = Number(row.id);
  const inspectionEventSpItemId = toNumber(row.fields.InspectionEventIdLookupId);
  const projectWeekRecordSpItemId = toNumber(row.fields.ProjectWeekRecordIdLookupId);
  return {
    id: `fd-${id}`,
    spItemId: id,
    title: String(row.fields.Title ?? ''),
    inspectionEventId: `ie-${inspectionEventSpItemId}`,
    inspectionEventSpItemId,
    projectWeekRecordId: `pw-${projectWeekRecordSpItemId}`,
    projectWeekRecordSpItemId,
    sectionNumber: toNumber(row.fields.SectionNumber),
    sectionName: String(row.fields.SectionName ?? ''),
    checklistRowNumber: toNumber(row.fields.ChecklistRowNumber),
    checklistItemLabel: String(row.fields.ChecklistItemLabel ?? ''),
    findingType: toFindingType(row.fields.FindingType),
    severity: toFindingSeverityRequired(row.fields.Severity),
    findingSummary: String(row.fields.FindingSummary ?? ''),
    originalNoteText: '',
    requiresCorrectiveAction: Boolean(row.fields.RequiresCorrectiveAction ?? false),
    isOpen: Boolean(row.fields.IsOpen ?? false),
  };
}

export function toCandidateWritePayload(input: {
  reportingPeriod: SafetyReportingPeriod;
  projectWeek: SafetyProjectWeekRecord;
  score: SafetyExcellenceCandidateScore;
}): Record<string, unknown> {
  const { score, projectWeek, reportingPeriod } = input;
  const payload: Record<string, unknown> = {
    Title: `${projectWeek.projectNumber} — ${reportingPeriod.weekStartDate} (${score.generatorVersion})`,
    ReportingPeriodIdLookupId: reportingPeriod.spItemId,
    ProjectWeekRecordIdLookupId: projectWeek.spItemId,
    ProjectNumber: projectWeek.projectNumber,
    ProjectNameSnapshot: projectWeek.projectNameSnapshot,
    ProjectStageSnapshot: projectWeek.projectStageSnapshot,
    ProjectLocationSnapshot: projectWeek.projectLocationSnapshot,
    EligibilityStatus: score.eligibilityStatus,
    ExclusionReasonsJson: JSON.stringify(score.exclusionReasons),
    CompositeScore: score.compositeScore,
    SafetyPerformanceScore: score.safetyPerformanceScore,
    ConsistencyTrendScore: score.consistencyTrendScore,
    ActivityExposureScore: score.activityExposureScore,
    CorrectiveActionScore: score.correctiveActionScore,
    DataQualityScore: score.dataQualityScore,
    InspectionCountWindow: score.inspectionCountWindow,
    InspectionCountRolling: score.inspectionCountRolling,
    AverageInspectionScoreWindow: score.averageInspectionScoreWindow,
    AverageInspectionScoreRolling: score.averageInspectionScoreRolling,
    InspectionTrendPct: score.inspectionTrendPct,
    HighestRiskFindingLevel: score.highestRiskFindingLevel,
    HighSeverityFindingCount: score.highSeverityFindingCount,
    MediumSeverityFindingCount: score.mediumSeverityFindingCount,
    OpenFindingCount: score.openFindingCount,
    AgedOpenFindingCount: score.agedOpenFindingCount,
    RepeatFindingCount: score.repeatFindingCount,
    ActivityEvidenceStatus: score.activityEvidenceStatus,
    ActivityEvidenceJson: score.activityEvidenceJson,
    ReasonSummary: score.reasonSummary,
    SourceInspectionIdsJson: JSON.stringify(score.sourceInspectionIds),
    SourceFindingIdsJson: JSON.stringify(score.sourceFindingIds),
    GeneratedAt: score.generatedAt,
    GeneratorVersion: score.generatorVersion,
    PublishRecommendation: score.publishRecommendation,
  };
  if (projectWeek.projectLookupId !== undefined) {
    payload.ProjectLookupIdLookupId = projectWeek.projectLookupId;
  }
  return payload;
}

function candidatePayloadDrift(
  current: Record<string, unknown>,
  proposed: Record<string, unknown>,
): boolean {
  for (const [key, proposedValue] of Object.entries(proposed)) {
    if (key === 'Title') continue;
    const currentValue = current[key];
    if (!shallowEqual(currentValue, proposedValue)) return true;
  }
  return false;
}

function shallowEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null || b == null) return a == null && b == null;
  if (typeof a === 'number' && typeof b === 'number') {
    return Math.abs(a - b) < 1e-9;
  }
  if (typeof a === 'object' || typeof b === 'object') {
    return JSON.stringify(a) === JSON.stringify(b);
  }
  return String(a) === String(b);
}

function mapPersistedCandidate(row: IGraphListItem): IPersistedSafetyFieldExcellenceCandidate {
  const itemId = Number(row.id);
  const exclusionReasons = parseJsonStringArray(row.fields.ExclusionReasonsJson);
  const sourceInspectionIds = parseJsonStringArray(row.fields.SourceInspectionIdsJson);
  const sourceFindingIds = parseJsonStringArray(row.fields.SourceFindingIdsJson);

  return {
    itemId,
    reportingPeriodSpItemId: toNumber(row.fields.ReportingPeriodIdLookupId),
    projectWeekRecordSpItemId: toNumber(row.fields.ProjectWeekRecordIdLookupId),
    eligibilityStatus: toEligibility(row.fields.EligibilityStatus),
    exclusionReasons,
    compositeScore: toNumber(row.fields.CompositeScore),
    safetyPerformanceScore: toNumber(row.fields.SafetyPerformanceScore),
    consistencyTrendScore: toNumber(row.fields.ConsistencyTrendScore),
    activityExposureScore: toNumber(row.fields.ActivityExposureScore),
    correctiveActionScore: toNumber(row.fields.CorrectiveActionScore),
    dataQualityScore: toNumber(row.fields.DataQualityScore),
    inspectionCountWindow: toNumber(row.fields.InspectionCountWindow),
    inspectionCountRolling: toNumber(row.fields.InspectionCountRolling),
    averageInspectionScoreWindow: toOptionalNumber(row.fields.AverageInspectionScoreWindow),
    averageInspectionScoreRolling: toOptionalNumber(row.fields.AverageInspectionScoreRolling),
    inspectionTrendPct: toOptionalNumber(row.fields.InspectionTrendPct),
    highestRiskFindingLevel: toFindingSeverity(row.fields.HighestRiskFindingLevel),
    highSeverityFindingCount: toNumber(row.fields.HighSeverityFindingCount),
    mediumSeverityFindingCount: toNumber(row.fields.MediumSeverityFindingCount),
    openFindingCount: toNumber(row.fields.OpenFindingCount),
    agedOpenFindingCount: toNumber(row.fields.AgedOpenFindingCount),
    repeatFindingCount: toNumber(row.fields.RepeatFindingCount),
    activityEvidenceStatus: toActivityEvidenceStatus(row.fields.ActivityEvidenceStatus),
    activityEvidenceJson: String(row.fields.ActivityEvidenceJson ?? '{}'),
    reasonSummary: String(row.fields.ReasonSummary ?? ''),
    sourceInspectionIds,
    sourceFindingIds,
    generatedAt: String(row.fields.GeneratedAt ?? ''),
    generatorVersion: String(row.fields.GeneratorVersion ?? ''),
    publishRecommendation: toPublishRecommendation(row.fields.PublishRecommendation),
  };
}

// -- Helpers --------------------------------------------------------------

export function computeRollingFloor(currentWeekStartIso: string, weeks: number): string {
  const days = Math.max(1, Math.floor(weeks)) * 7;
  const dt = new Date(`${currentWeekStartIso}T00:00:00Z`);
  if (Number.isNaN(dt.getTime())) return currentWeekStartIso;
  dt.setUTCDate(dt.getUTCDate() - days);
  return dt.toISOString().slice(0, 10);
}

function escapeGraphString(value: string): string {
  return value.replace(/'/g, "''");
}

function sliceDate(value: unknown): string {
  const text = String(value ?? '');
  return text.length >= 10 ? text.slice(0, 10) : text;
}

function toNumber(value: unknown): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function toOptionalNumber(value: unknown): number | null {
  const n = Number(value ?? NaN);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function toFractionalScore(value: unknown): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function optionalString(value: unknown): string | undefined {
  const text = String(value ?? '').trim();
  return text.length > 0 ? text : undefined;
}

function toPeriodStatus(value: unknown): SafetyReportingPeriod['status'] {
  const text = String(value ?? 'open');
  if (text === 'closed' || text === 'published') return text;
  return 'open';
}

function toProjectSource(value: unknown): ProjectSourceClassification {
  const text = String(value ?? 'unresolved');
  if (text === 'project' || text === 'legacy-only' || text === 'project+legacy') return text;
  return 'unresolved';
}

function toFindingSeverity(value: unknown): FindingSeverity | null {
  const text = String(value ?? '').trim();
  if (text === 'info' || text === 'medium' || text === 'high') return text;
  return null;
}

function toFindingSeverityRequired(value: unknown): FindingSeverity {
  return toFindingSeverity(value) ?? 'info';
}

function toManagerStatus(value: unknown): SafetyProjectWeekRecord['managerReviewStatus'] {
  const text = String(value ?? 'not-required');
  if (text === 'pending' || text === 'approved') return text;
  return 'not-required';
}

function toProjectWeekPublishStatus(value: unknown): SafetyProjectWeekRecord['publishStatus'] {
  const text = String(value ?? 'in-progress');
  if (
    text === 'not-started' ||
    text === 'awaiting-upload' ||
    text === 'in-progress' ||
    text === 'completed' ||
    text === 'review-required' ||
    text === 'published'
  ) {
    return text;
  }
  return 'in-progress';
}

function toScoringMode(value: unknown): SafetyInspectionEvent['scoringMode'] {
  return String(value ?? 'normalized-vNext') === 'template-compat-v1'
    ? 'template-compat-v1'
    : 'normalized-vNext';
}

function toInspectionStatus(value: unknown): SafetyInspectionEvent['ingestionStatus'] {
  const text = String(value ?? 'accepted');
  if (
    text === 'accepted' ||
    text === 'duplicate-suspected' ||
    text === 'superseded' ||
    text === 'review-required' ||
    text === 'rejected'
  ) {
    return text;
  }
  return 'accepted';
}

function toDuplicateStatus(value: unknown): SafetyInspectionEvent['duplicateStatus'] {
  const text = String(value ?? 'none');
  if (text === 'near-duplicate' || text === 'high-confidence-duplicate') return text;
  return 'none';
}

function toFindingType(value: unknown): SafetyFinding['findingType'] {
  const text = String(value ?? 'note-only');
  if (text === 'no-response' || text === 'incomplete' || text === 'multi' || text === 'note-only') {
    return text;
  }
  return 'note-only';
}

function toEligibility(value: unknown): SafetyExcellenceEligibilityStatus {
  const text = String(value ?? 'low-confidence');
  if (
    text === 'eligible' ||
    text === 'ineligible' ||
    text === 'low-confidence' ||
    text === 'needs-review'
  ) {
    return text;
  }
  return 'low-confidence';
}

function toPublishRecommendation(value: unknown): SafetyExcellencePublishRecommendation {
  const text = String(value ?? 'do-not-publish');
  if (text === 'primary' || text === 'secondary' || text === 'monitor' || text === 'do-not-publish') {
    return text;
  }
  return 'do-not-publish';
}

function toActivityEvidenceStatus(value: unknown): SafetyActivityEvidenceStatus {
  const text = String(value ?? 'missing');
  if (text === 'proven' || text === 'inferred' || text === 'missing') return text;
  return 'missing';
}

function parseJsonStringArray(value: unknown): ReadonlyArray<string> {
  if (!value) return [];
  try {
    const parsed = JSON.parse(String(value));
    if (Array.isArray(parsed)) return parsed.map((entry) => String(entry));
  } catch {
    /* fall through */
  }
  return [];
}

// Unused helper kept for future usage and to mirror the existing repo's
// classification helper without depending on it.
void GraphRequestError;
