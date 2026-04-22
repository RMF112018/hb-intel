/**
 * Ingestion orchestrator — the only place that decides state transitions
 * for a single workbook upload.
 *
 * Wave 1 audit remediation:
 * - Adapter owns identity allocation (numeric `spItemId` is authoritative for
 *   SharePoint Lookup fields; string `id` is derived for stable UI routing).
 * - Pipeline never parses business IDs into fake numeric Lookup parents.
 * - `UploadContext.reportingPeriodSpItemId` is threaded into Lookup payloads.
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
  type SafetyFindingDraft,
  type SafetyIngestionRun,
  type SafetyIngestionRunDraft,
  type SafetyInspectionEvent,
  type SafetyInspectionEventDraft,
  type SafetyProjectWeekRecord,
  type UploadContext,
  type UploadedWorkbookRef,
} from '../domain/types.js';
import { parseChecklist } from '../parser/parseChecklist.js';
import { validateTemplate } from '../parser/validateTemplate.js';
import type { WorkbookView } from '../parser/workbookView.js';
import { extractFindings } from '../scoring/findingExtraction.js';
import { computeProjectWeekRollup } from '../scoring/projectWeekRollup.js';
import { computeInspectionScore } from '../scoring/scoringEngine.js';

/**
 * Adapter contract for the pipeline. The adapter is the sole owner of
 * persistence, ID allocation, and Lookup-parent binding.
 */
export interface IngestionAdapter {
  resolveProject(
    projectSiteText: string,
    projectNumberHint?: string,
  ): Promise<ProjectResolutionResult | null>;
  findRecentInspectionsForProject(
    projectNumber: string,
    inspectionDate: string,
  ): Promise<ReadonlyArray<SafetyInspectionEvent>>;
  /**
   * Ensure a project-week record exists for the (project, reporting period).
   * Returned record carries real `spItemId` and `reportingPeriodSpItemId`.
   */
  ensureProjectWeekRecord(
    resolution: ProjectResolutionResult,
    reportingPeriodId: string,
    reportingPeriodSpItemId: number,
    weekStartDate: string,
  ): Promise<SafetyProjectWeekRecord>;
  /**
   * Persist the inspection event + findings + updated project-week record.
   * The adapter assigns real `spItemId`s (SharePoint: from REST; mock:
   * monotonic), wires up Lookup relationships, and returns the finalized
   * records.
   */
  persistCommit(drafts: {
    inspectionEventDraft: SafetyInspectionEventDraft;
    findingDrafts: ReadonlyArray<SafetyFindingDraft>;
    projectWeekRecordUpdate: SafetyProjectWeekRecord;
  }): Promise<CommittedArtifacts>;
  /**
   * Write an ingestion-run audit row. Adapter assigns `spItemId` / `id`.
   */
  recordIngestionRun(runDraft: SafetyIngestionRunDraft): Promise<SafetyIngestionRun>;
}

export interface IngestionPipelineInput {
  readonly view: WorkbookView;
  readonly context: UploadContext;
  readonly uploadedRef: UploadedWorkbookRef;
  readonly adapter: IngestionAdapter;
  readonly attemptNumber?: number;
}

export async function runIngestionPipeline(
  input: IngestionPipelineInput,
): Promise<IngestionRunResult> {
  const { view, context, uploadedRef, adapter } = input;
  const attemptNumber = input.attemptNumber ?? 1;
  const runStartedAt = new Date().toISOString();
  const committedIds: IngestionCommittedIds = {};

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
    ...overrides,
  });

  const finalize = async (
    draft: SafetyIngestionRunDraft,
  ): Promise<SafetyIngestionRun> => {
    const finalized = await adapter.recordIngestionRun({
      ...draft,
      committedEntityIdsJson: JSON.stringify(committedIds),
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
        }),
      );
      return { run, state: 'invalid-template' };
    }
    throw err;
  }

  // Stage 3/4: extract + parse
  let parsed: ParsedInspection;
  try {
    parsed = parseChecklist(view);
  } catch (err) {
    const run = await finalize(
      buildRunDraft({
        validationStatus: 'passed',
        parseStatus: 'failed',
        projectResolutionStatus: 'skipped',
        terminalStatus: 'invalid-template',
        errorClass: 'parse-error',
        errorSummary: err instanceof Error ? err.message : 'Unknown parser error',
      }),
    );
    return { run, state: 'invalid-template' };
  }

  // Stage 5: resolve project
  const resolution = await adapter.resolveProject(parsed.metadata.projectSiteText);
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
      }),
    );
    return { run, state: 'unresolved-project' };
  }

  // Stage: duplicate detection
  const recent = await adapter.findRecentInspectionsForProject(
    resolution.projectNumber,
    parsed.metadata.inspectionDate,
  );
  const duplicate = classifyDuplicate(recent, parsed, uploadedRef.checksum);

  if (duplicate.confidence === 'high-confidence-duplicate') {
    const run = await finalize(
      buildRunDraft({
        validationStatus: 'passed',
        parseStatus: 'passed',
        projectResolutionStatus: 'resolved',
        terminalStatus: 'review-required',
        errorClass: 'duplicate-suspected',
        errorSummary: `High-confidence duplicate of inspection event ${duplicate.matchedId}.`,
        templateVersionDetected: parsed.templateVersion,
      }),
    );
    return { run, state: 'review-required' };
  }

  // Stage 6: scoring + stage 7: finding extraction
  const score = computeInspectionScore(parsed, 'template-compat-v1');
  const findingDraftsFromParser = extractFindings(parsed);

  // Commit
  try {
    const projectWeek = await adapter.ensureProjectWeekRecord(
      resolution,
      context.reportingPeriodId,
      context.reportingPeriodSpItemId,
      weekStartFromDate(parsed.metadata.inspectionDate),
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

    // Recompute rollup from the persisted weekly set plus the in-flight event.
    // Wave 1 retains the same-date query contract; Wave 2 replaces it with
    // `findInspectionsForProjectWeek` for true weekly scope.
    const rolledInspections: SafetyInspectionEvent[] = [
      ...(await adapter.findRecentInspectionsForProject(
        resolution.projectNumber,
        parsed.metadata.inspectionDate,
      )),
    ];
    // Synthesize a preliminary inspection event for rollup-score input only.
    const rollupCandidateEvent: SafetyInspectionEvent = {
      id: 'in-flight',
      spItemId: 0,
      ...inspectionEventDraft,
    };
    rolledInspections.push(rollupCandidateEvent);

    const rollup = computeProjectWeekRollup(rolledInspections, []);
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

function weekStartFromDate(dateIso: string): string {
  if (!dateIso) return new Date().toISOString().slice(0, 10);
  const d = new Date(`${dateIso}T00:00:00Z`);
  const day = d.getUTCDay();
  const offset = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
}

export function __testOnly_weekStartFromDate(dateIso: string): string {
  return weekStartFromDate(dateIso);
}
