/**
 * Ingestion orchestrator — the only place that decides state transitions
 * for a single workbook upload.
 *
 * Wave 1 audit remediation: numeric SP item-ID Lookup contract.
 * Wave 2 audit remediation:
 * - distinct `parse-error` terminal (P2-10) — no more flattening into
 *   `invalid-template`.
 * - distinct `reporting-period-mismatch` terminal (P2-9) — workbook date
 *   must fall inside the selected reporting period's week range.
 * - week-scoped rollup via `findInspectionsForProjectWeek` (P1-3).
 * - project-number hint plumbed from metadata (P2-12).
 * - enriched `SafetyIngestionRun` persistence (P1-4, P1-5).
 * - replay lineage: `attemptNumber`, `parentRunId`, `parentRunSpItemId`
 *   carried through every terminal.
 */

import {
  CommitError,
  TemplateInvalidError,
  type CommittedArtifacts,
  type DuplicateConfidence,
  type IngestionCommittedIds,
  type IngestionRunResult,
  type ParsedInspection,
  type ProjectResolutionResult,
  type SafetyFinding,
  type SafetyFindingDraft,
  type SafetyIngestionRun,
  type SafetyIngestionRunDraft,
  type SafetyInspectionEvent,
  type SafetyInspectionEventDraft,
  type SafetyProjectWeekRecord,
  type SafetyReportingPeriod,
  type UploadContext,
  type UploadedWorkbookRef,
} from '../domain/types.js';
import { parseChecklist } from '../parser/parseChecklist.js';
import { validateTemplate } from '../parser/validateTemplate.js';
import type { WorkbookView } from '../parser/workbookView.js';
import { extractFindings } from '../scoring/findingExtraction.js';
import { computeProjectWeekRollup } from '../scoring/projectWeekRollup.js';
import { computeInspectionScore } from '../scoring/scoringEngine.js';
import { isDateInRange, weekRangeForDate } from './weekRangeForDate.js';

export interface IngestionAdapter {
  resolveProject(
    projectSiteText: string,
    projectNumberHint: string | null,
  ): Promise<ProjectResolutionResult | null>;
  /** Wave 2 week-scoped rollup source — includes all accepted/duplicate-suspected inspections. */
  findInspectionsForProjectWeek(filter: {
    projectNumber: string;
    reportingPeriodId: string;
  }): Promise<ReadonlyArray<SafetyInspectionEvent>>;
  /**
   * Prior findings attached to a project-week, used for correct
   * `HighestRiskFindingLevel` derivation on the commit path. Intentionally
   * pipeline-internal — not on the public repository port.
   */
  findFindingsForProjectWeek(filter: {
    projectWeekRecordSpItemId: number;
  }): Promise<
    ReadonlyArray<Pick<SafetyFinding, 'severity' | 'inspectionEventId'>>
  >;
  /** Look up a reporting period by id so the pipeline can validate the workbook date. */
  resolveReportingPeriod(
    reportingPeriodId: string,
  ): Promise<SafetyReportingPeriod | null>;
  ensureProjectWeekRecord(
    resolution: ProjectResolutionResult,
    reportingPeriodId: string,
    reportingPeriodSpItemId: number,
    weekStartDate: string,
  ): Promise<SafetyProjectWeekRecord>;
  persistCommit(drafts: {
    inspectionEventDraft: SafetyInspectionEventDraft;
    findingDrafts: ReadonlyArray<SafetyFindingDraft>;
    projectWeekRecordUpdate: SafetyProjectWeekRecord;
  }): Promise<CommittedArtifacts>;
  /** Flip a prior inspection event to `superseded` and attach `supersededByInspectionEventId`. */
  markInspectionSuperseded(
    priorInspectionEventId: string,
    replacementInspectionEventId: string,
  ): Promise<void>;
  recordIngestionRun(runDraft: SafetyIngestionRunDraft): Promise<SafetyIngestionRun>;
}

export interface IngestionPipelineInput {
  readonly view: WorkbookView;
  readonly context: UploadContext;
  readonly uploadedRef: UploadedWorkbookRef;
  readonly adapter: IngestionAdapter;
  readonly attemptNumber?: number;
  readonly parentRunId?: string;
  readonly parentRunSpItemId?: number;
  /**
   * When true and a high-confidence duplicate is detected, the prior
   * inspection event is flipped to `superseded` and a fresh commit proceeds.
   */
  readonly supersedePrior?: boolean;
}

export async function runIngestionPipeline(
  input: IngestionPipelineInput,
): Promise<IngestionRunResult> {
  const { view, context, uploadedRef, adapter, parentRunId, parentRunSpItemId, supersedePrior } = input;
  const attemptNumber = input.attemptNumber ?? 1;
  const runStartedAt = new Date().toISOString();
  const committedIds: IngestionCommittedIds = {};
  let parsedCache: ParsedInspection | null = null;

  const buildRunDraft = (
    overrides: Partial<SafetyIngestionRunDraft> &
      Pick<SafetyIngestionRunDraft, 'terminalStatus'>,
  ): SafetyIngestionRunDraft => ({
    title: `Ingestion ${context.fileName} — attempt ${attemptNumber}`,
    sourceUploadItemId: uploadedRef.sourceUploadItemId,
    uploadFileName: context.fileName,
    templateVersionDetected: undefined,
    checksum: uploadedRef.checksum,
    validationStatus: 'pending',
    parseStatus: 'pending',
    projectResolutionStatus: 'pending',
    committedEntityIdsJson: JSON.stringify(committedIds),
    runStartedAt,
    runCompletedAt: new Date().toISOString(),
    attemptNumber,
    reportingPeriodId: context.reportingPeriodId,
    reportingPeriodSpItemId: context.reportingPeriodSpItemId,
    attemptedProjectSiteText: parsedCache?.metadata.projectSiteText,
    reviewStatus: 'none',
    parentRunId,
    parentRunSpItemId,
    ...overrides,
  });

  const finalize = async (
    draft: SafetyIngestionRunDraft,
  ): Promise<SafetyIngestionRun> => {
    const finalized = await adapter.recordIngestionRun({
      ...draft,
      committedEntityIdsJson: JSON.stringify(committedIds),
      attemptedProjectSiteText:
        draft.attemptedProjectSiteText ?? parsedCache?.metadata.projectSiteText,
    });
    committedIds.ingestionRunId = finalized.id;
    return finalized;
  };

  // Stage 1/2: validate
  try {
    validateTemplate(view);
  } catch (err) {
    if (err instanceof TemplateInvalidError) {
      const run = await finalize(
        buildRunDraft({
          validationStatus: 'failed',
          parseStatus: 'skipped',
          projectResolutionStatus: 'skipped',
          terminalStatus: 'invalid-template',
          errorClass: 'template-invalid',
          errorSummary: err.message,
          reviewStatus: 'pending-review',
        }),
      );
      return { run, state: 'invalid-template' };
    }
    throw err;
  }

  // Stage 3/4: extract + parse
  try {
    parsedCache = parseChecklist(view);
  } catch (err) {
    const run = await finalize(
      buildRunDraft({
        validationStatus: 'passed',
        parseStatus: 'failed',
        projectResolutionStatus: 'skipped',
        terminalStatus: 'parse-error',
        errorClass: 'parse-error',
        errorSummary: err instanceof Error ? err.message : 'Unknown parser error',
        reviewStatus: 'pending-review',
      }),
    );
    return { run, state: 'parse-error' };
  }
  const parsed = parsedCache;

  // Stage 5: validate workbook date against the selected reporting period.
  const period = await adapter.resolveReportingPeriod(context.reportingPeriodId);
  if (period && period.weekStartDate && period.weekEndDate) {
    const range = { weekStartDate: period.weekStartDate, weekEndDate: period.weekEndDate };
    if (parsed.metadata.inspectionDate && !isDateInRange(parsed.metadata.inspectionDate, range)) {
      const run = await finalize(
        buildRunDraft({
          validationStatus: 'passed',
          parseStatus: 'passed',
          projectResolutionStatus: 'skipped',
          terminalStatus: 'reporting-period-mismatch',
          errorClass: 'reporting-period-mismatch',
          errorSummary: `Workbook date ${parsed.metadata.inspectionDate} is not within selected period ${period.weekStartDate} … ${period.weekEndDate}.`,
          templateVersionDetected: parsed.templateVersion,
          reviewStatus: 'pending-review',
        }),
      );
      return { run, state: 'reporting-period-mismatch' };
    }
  }

  // Stage 6: resolve project (hint extracted from metadata in Wave 2).
  const resolution = await adapter.resolveProject(
    parsed.metadata.projectSiteText,
    parsed.metadata.projectNumberHint,
  );
  if (!resolution) {
    const run = await finalize(
      buildRunDraft({
        validationStatus: 'passed',
        parseStatus: 'passed',
        projectResolutionStatus: 'unresolved',
        terminalStatus: 'unresolved-project',
        errorClass: 'project-unresolved',
        errorSummary: `Could not resolve project from "${parsed.metadata.projectSiteText}".`,
        templateVersionDetected: parsed.templateVersion,
        projectSourceClassification: 'unresolved',
        reviewStatus: 'pending-review',
      }),
    );
    return { run, state: 'unresolved-project' };
  }

  // Stage: duplicate detection against prior week-scoped inspections.
  const weeklyInspections = await adapter.findInspectionsForProjectWeek({
    projectNumber: resolution.projectNumber,
    reportingPeriodId: context.reportingPeriodId,
  });
  const duplicate = classifyDuplicate(weeklyInspections, parsed, uploadedRef.checksum);

  if (duplicate.confidence === 'high-confidence-duplicate' && !supersedePrior) {
    // Idempotent retry: short-circuit to the existing committed event when
    // the parent run chain is already represented by a committed match.
    const matched = weeklyInspections.find((ie) => ie.id === duplicate.matchedId);
    if (matched && matched.ingestionStatus !== 'superseded') {
      committedIds.inspectionEventId = matched.id;
      committedIds.projectWeekRecordId = matched.projectWeekRecordId;
      const run = await finalize(
        buildRunDraft({
          validationStatus: 'passed',
          parseStatus: 'passed',
          projectResolutionStatus: 'resolved',
          terminalStatus: 'committed',
          templateVersionDetected: parsed.templateVersion,
          resolvedProjectNumber: resolution.projectNumber,
          projectSourceClassification: resolution.classification,
          reviewStatus: 'replayed-success',
        }),
      );
      return { run, state: 'committed' };
    }
    // Duplicate exists but previously superseded — fall through as review-required.
    const run = await finalize(
      buildRunDraft({
        validationStatus: 'passed',
        parseStatus: 'passed',
        projectResolutionStatus: 'resolved',
        terminalStatus: 'review-required',
        errorClass: 'duplicate-suspected',
        errorSummary: `High-confidence duplicate of inspection event ${duplicate.matchedId}.`,
        templateVersionDetected: parsed.templateVersion,
        resolvedProjectNumber: resolution.projectNumber,
        projectSourceClassification: resolution.classification,
        reviewStatus: 'pending-review',
      }),
    );
    return { run, state: 'review-required' };
  }

  // Stage 7: scoring + stage 8: finding extraction
  const score = computeInspectionScore(parsed, 'template-compat-v1');
  const findingDraftsFromParser = extractFindings(parsed);

  // Commit
  try {
    const projectWeek = await adapter.ensureProjectWeekRecord(
      resolution,
      context.reportingPeriodId,
      context.reportingPeriodSpItemId,
      weekRangeForDate(parsed.metadata.inspectionDate).weekStartDate,
    );

    const inspectionEventDraft: SafetyInspectionEventDraft = {
      title: `${resolution.projectNumber} — Inspection ${parsed.metadata.inspectionNumber || 'new'}`,
      projectWeekRecordId: projectWeek.id,
      projectWeekRecordSpItemId: projectWeek.spItemId,
      reportingPeriodId: context.reportingPeriodId,
      reportingPeriodSpItemId: context.reportingPeriodSpItemId,
      sourceUploadItemId: uploadedRef.sourceUploadItemId,
      sourceUploadWebUrl: uploadedRef.sourceUploadWebUrl,
      checksum: uploadedRef.checksum,
      templateVersion: parsed.templateVersion,
      parserVersion: parsed.parserVersion,
      scoringMode: score.scoringMode,
      inspectionDate: parsed.metadata.inspectionDate,
      inspectionNumber: parsed.metadata.inspectionNumber,
      inspectorName: context.uploadedByDisplayName,
      inspectorUpn: context.uploadedByUpn,
      projectNumber: resolution.projectNumber,
      projectNameSnapshot: resolution.projectNameSnapshot,
      inspectionScore: score.finalScorePct,
      totalYes: score.totalYes,
      totalNo: score.totalNo,
      totalNa: score.totalNa,
      rawChecklistJson: JSON.stringify(parsed),
      ingestionStatus:
        duplicate.confidence === 'near-duplicate' ? 'duplicate-suspected' : 'accepted',
      duplicateStatus: duplicate.confidence,
      requiresReview: duplicate.confidence === 'near-duplicate',
      submittedAt: context.uploadedAt,
      committedAt: new Date().toISOString(),
    };

    const findingDrafts: ReadonlyArray<SafetyFindingDraft> = findingDraftsFromParser.map(
      (draft) => ({
        title: `${resolution.projectNumber} — ${draft.sectionName} — row ${draft.checklistRowNumber}`,
        projectWeekRecordId: projectWeek.id,
        projectWeekRecordSpItemId: projectWeek.spItemId,
        sectionNumber: draft.sectionNumber,
        sectionName: draft.sectionName,
        checklistRowNumber: draft.checklistRowNumber,
        checklistItemLabel: draft.checklistItemLabel,
        findingType: draft.findingType,
        severity: draft.severity,
        findingSummary: draft.findingSummary,
        originalNoteText: draft.originalNoteText,
        requiresCorrectiveAction: draft.requiresCorrectiveAction,
        isOpen: true,
      }),
    );

    // Week-scoped rollup input: all accepted/duplicate-suspected events in the
    // reporting period for this project, plus the in-flight event (pre-persist).
    const supersededPriorId =
      supersedePrior && duplicate.matchedId ? duplicate.matchedId : undefined;
    const rolledInspections: SafetyInspectionEvent[] = weeklyInspections.filter(
      (ie) => ie.id !== supersededPriorId,
    );
    rolledInspections.push({ id: 'in-flight', spItemId: 0, ...inspectionEventDraft });

    // Findings included in `HighestRiskFindingLevel`:
    //   - previously-committed findings for this project-week whose parent
    //     inspection event is still in the included set (i.e. not superseded,
    //     not the supersede-target),
    //   - plus findings for the in-flight commit.
    // Skip the prior-findings fetch when the project-week is brand-new
    // (spItemId === 0 means it has not been persisted yet).
    const excludedParentIds = new Set(
      weeklyInspections
        .filter((ie) => ie.ingestionStatus === 'superseded' || ie.id === supersededPriorId)
        .map((ie) => ie.id),
    );
    const priorFindings =
      projectWeek.spItemId > 0
        ? await adapter.findFindingsForProjectWeek({
            projectWeekRecordSpItemId: projectWeek.spItemId,
          })
        : [];
    const includedPriorFindings = priorFindings.filter(
      (f) => !excludedParentIds.has(f.inspectionEventId),
    );
    const inFlightFindings = findingDrafts.map((draft) => ({ severity: draft.severity }));
    const rollup = computeProjectWeekRollup(rolledInspections, [
      ...includedPriorFindings,
      ...inFlightFindings,
    ]);
    const updatedProjectWeek: SafetyProjectWeekRecord = {
      ...projectWeek,
      inspectionCount: rollup.inspectionCount,
      averageInspectionScore: rollup.averageInspectionScore,
      highestRiskFindingLevel: rollup.highestRiskFindingLevel,
      publishStatus:
        duplicate.confidence === 'near-duplicate'
          ? 'review-required'
          : rollup.inspectionCount > 0
            ? 'in-progress'
            : projectWeek.publishStatus,
    };

    const committed = await adapter.persistCommit({
      inspectionEventDraft,
      findingDrafts,
      projectWeekRecordUpdate: updatedProjectWeek,
    });

    if (supersedePrior && duplicate.matchedId) {
      await adapter.markInspectionSuperseded(duplicate.matchedId, committed.inspectionEvent.id);
    }

    committedIds.inspectionEventId = committed.inspectionEvent.id;
    committedIds.findingIds = committed.findings.map((f) => f.id);
    committedIds.projectWeekRecordId = committed.projectWeekRecord.id;

    const run = await finalize(
      buildRunDraft({
        validationStatus: 'passed',
        parseStatus: 'passed',
        projectResolutionStatus: 'resolved',
        terminalStatus: 'committed',
        templateVersionDetected: parsed.templateVersion,
        runCompletedAt: new Date().toISOString(),
        resolvedProjectNumber: resolution.projectNumber,
        projectSourceClassification: resolution.classification,
        reviewStatus: parentRunId ? 'replayed-success' : 'none',
      }),
    );

    return {
      run,
      committed,
      state: 'committed',
    };
  } catch (err) {
    const partialIds =
      err instanceof CommitError ? { ...committedIds, ...err.partialIds } : committedIds;
    committedIds.inspectionEventId = partialIds.inspectionEventId;
    committedIds.findingIds = partialIds.findingIds;
    committedIds.projectWeekRecordId = partialIds.projectWeekRecordId;
    const run = await finalize(
      buildRunDraft({
        validationStatus: 'passed',
        parseStatus: 'passed',
        projectResolutionStatus: 'resolved',
        terminalStatus: 'commit-failed',
        errorClass: 'commit-error',
        errorSummary: err instanceof Error ? err.message : 'Unknown commit error',
        templateVersionDetected: parsed.templateVersion,
        resolvedProjectNumber: resolution.projectNumber,
        projectSourceClassification: resolution.classification,
        reviewStatus: parentRunId ? 'replayed-failed' : 'pending-review',
      }),
    );
    return { run, state: 'commit-failed' };
  }
}

function classifyDuplicate(
  recent: ReadonlyArray<SafetyInspectionEvent>,
  parsed: ParsedInspection,
  checksum: string,
): { confidence: DuplicateConfidence; matchedId?: string } {
  if (recent.length === 0) return { confidence: 'none' };

  const sameBusinessKey = recent.find(
    (ie) =>
      ie.ingestionStatus !== 'superseded' &&
      ie.projectNumber &&
      ie.inspectionDate === parsed.metadata.inspectionDate &&
      (ie.inspectionNumber ?? '').toLowerCase() ===
        (parsed.metadata.inspectionNumber ?? '').toLowerCase(),
  );

  if (!sameBusinessKey) return { confidence: 'none' };
  if (sameBusinessKey.checksum === checksum) {
    return { confidence: 'high-confidence-duplicate', matchedId: sameBusinessKey.id };
  }
  return { confidence: 'near-duplicate', matchedId: sameBusinessKey.id };
}

export function __testOnly_weekStartFromDate(dateIso: string): string {
  return weekRangeForDate(dateIso).weekStartDate;
}
