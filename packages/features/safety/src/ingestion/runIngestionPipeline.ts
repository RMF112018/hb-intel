/**
 * Ingestion orchestrator — the only place that decides state transitions
 * for a single workbook upload.
 *
 * States (see docs/architecture/plans/MASTER/spfx/safety-records/design-pacakge/):
 *   uploaded → validating → resolving-project → parsed → duplicate-checked
 *            → scoring → commit-pending → committed
 *
 * Terminal failure states: invalid-template, unresolved-project (→review-required),
 *   review-required (duplicate), commit-failed.
 *
 * Every terminal state writes a Safety Ingestion Run row via the adapter.
 */

import {
  CommitError,
  ProjectUnresolvedError,
  TemplateInvalidError,
  type DuplicateConfidence,
  type IngestionCommittedIds,
  type IngestionRunResult,
  type IngestionTerminalStatus,
  type ParsedInspection,
  type ProjectResolutionResult,
  type SafetyFinding,
  type SafetyIngestionRun,
  type SafetyInspectionEvent,
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
import { TEMPLATE_VERSION } from '../domain/templateContract.js';

export interface IngestionAdapter {
  resolveProject(
    projectSiteText: string,
    projectNumberHint?: string,
  ): Promise<ProjectResolutionResult | null>;
  findRecentInspectionsForProject(
    projectNumber: string,
    inspectionDate: string,
  ): Promise<ReadonlyArray<SafetyInspectionEvent>>;
  ensureProjectWeekRecord(
    resolution: ProjectResolutionResult,
    reportingPeriodId: string,
    weekStartDate: string,
  ): Promise<SafetyProjectWeekRecord>;
  persistCommit(committed: {
    inspectionEvent: SafetyInspectionEvent;
    findings: ReadonlyArray<SafetyFinding>;
    projectWeekRecord: SafetyProjectWeekRecord;
  }): Promise<void>;
  recordIngestionRun(run: SafetyIngestionRun): Promise<void>;
  allocateId(prefix: 'ie' | 'fd' | 'run'): string;
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
  const runId = adapter.allocateId('run');
  const committedIds: IngestionCommittedIds = { ingestionRunId: runId };

  const baseRun = (
    overrides: Partial<SafetyIngestionRun> & Pick<SafetyIngestionRun, 'terminalStatus'>,
  ): SafetyIngestionRun => ({
    id: runId,
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

  // Stage 1/2: validate
  try {
    validateTemplate(view);
  } catch (err) {
    if (err instanceof TemplateInvalidError) {
      const run = baseRun({
        validationStatus: 'failed',
        parseStatus: 'skipped',
        projectResolutionStatus: 'skipped',
        terminalStatus: 'invalid-template',
        errorClass: 'template-invalid',
        errorSummary: err.message,
      });
      await adapter.recordIngestionRun(run);
      return { run, state: 'invalid-template' };
    }
    throw err;
  }

  // Stage 3/4: extract + parse
  let parsed: ParsedInspection;
  try {
    parsed = parseChecklist(view);
  } catch (err) {
    const run = baseRun({
      validationStatus: 'passed',
      parseStatus: 'failed',
      projectResolutionStatus: 'skipped',
      terminalStatus: 'invalid-template',
      errorClass: 'parse-error',
      errorSummary: err instanceof Error ? err.message : 'Unknown parser error',
      templateVersionDetected: TEMPLATE_VERSION,
    });
    await adapter.recordIngestionRun(run);
    return { run, state: 'invalid-template' };
  }

  // Stage 5: resolve project
  const resolution = await adapter.resolveProject(parsed.metadata.projectSiteText);
  if (!resolution) {
    const run = baseRun({
      validationStatus: 'passed',
      parseStatus: 'passed',
      projectResolutionStatus: 'unresolved',
      terminalStatus: 'unresolved-project',
      errorClass: 'project-unresolved',
      errorSummary: `Could not resolve project from "${parsed.metadata.projectSiteText}".`,
      templateVersionDetected: parsed.templateVersion,
    });
    await adapter.recordIngestionRun(run);
    return { run, state: 'unresolved-project' };
  }

  // Stage: duplicate detection
  const recent = await adapter.findRecentInspectionsForProject(
    resolution.projectNumber,
    parsed.metadata.inspectionDate,
  );
  const duplicate = classifyDuplicate(recent, parsed, uploadedRef.checksum);

  if (duplicate.confidence === 'high-confidence-duplicate') {
    const run = baseRun({
      validationStatus: 'passed',
      parseStatus: 'passed',
      projectResolutionStatus: 'resolved',
      terminalStatus: 'review-required',
      errorClass: 'duplicate-suspected',
      errorSummary: `High-confidence duplicate of inspection event ${duplicate.matchedId}.`,
      templateVersionDetected: parsed.templateVersion,
    });
    await adapter.recordIngestionRun(run);
    return { run, state: 'review-required' };
  }

  // Stage 6: scoring
  const score = computeInspectionScore(parsed, 'template-compat-v1');

  // Stage 7: finding extraction
  const findingDraftList = extractFindings(parsed);

  // Commit
  try {
    const projectWeek = await adapter.ensureProjectWeekRecord(
      resolution,
      context.reportingPeriodId,
      weekStartFromDate(parsed.metadata.inspectionDate),
    );

    const inspectionEventId = adapter.allocateId('ie');
    const now = new Date().toISOString();
    const inspectionEvent: SafetyInspectionEvent = {
      id: inspectionEventId,
      title: `${resolution.projectNumber} — Inspection ${parsed.metadata.inspectionNumber || inspectionEventId}`,
      projectWeekRecordId: projectWeek.id,
      reportingPeriodId: context.reportingPeriodId,
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
      committedAt: now,
    };
    committedIds.inspectionEventId = inspectionEventId;

    const findings: SafetyFinding[] = findingDraftList.map((draft) => ({
      id: adapter.allocateId('fd'),
      title: `${resolution.projectNumber} — ${draft.sectionName} — row ${draft.checklistRowNumber}`,
      inspectionEventId,
      projectWeekRecordId: projectWeek.id,
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
    }));
    committedIds.findingIds = findings.map((f) => f.id);

    const rolledInspections = [
      ...(await adapter.findRecentInspectionsForProject(
        resolution.projectNumber,
        parsed.metadata.inspectionDate,
      )),
      inspectionEvent,
    ];
    const rollup = computeProjectWeekRollup(rolledInspections, findings);
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
    committedIds.projectWeekRecordId = updatedProjectWeek.id;

    await adapter.persistCommit({
      inspectionEvent,
      findings,
      projectWeekRecord: updatedProjectWeek,
    });

    const run = baseRun({
      validationStatus: 'passed',
      parseStatus: 'passed',
      projectResolutionStatus: 'resolved',
      terminalStatus: 'committed',
      committedEntityIdsJson: JSON.stringify(committedIds),
      templateVersionDetected: parsed.templateVersion,
      runCompletedAt: now,
    });
    await adapter.recordIngestionRun(run);

    return {
      run,
      committed: {
        inspectionEvent,
        findings,
        projectWeekRecord: updatedProjectWeek,
      },
      state: 'committed',
    };
  } catch (err) {
    const partial =
      err instanceof CommitError
        ? err.partialIds
        : (err instanceof ProjectUnresolvedError
            ? { ingestionRunId: runId }
            : committedIds);
    const run = baseRun({
      validationStatus: 'passed',
      parseStatus: 'passed',
      projectResolutionStatus: 'resolved',
      terminalStatus: 'commit-failed',
      errorClass: 'commit-error',
      errorSummary: err instanceof Error ? err.message : 'Unknown commit error',
      committedEntityIdsJson: JSON.stringify(partial),
      templateVersionDetected: parsed.templateVersion,
    });
    await adapter.recordIngestionRun(run);
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

export function __testOnly_classifyDuplicate(
  recent: ReadonlyArray<SafetyInspectionEvent>,
  parsed: ParsedInspection,
  checksum: string,
): { confidence: IngestionTerminalStatus | DuplicateConfidence; matchedId?: string } {
  return classifyDuplicate(recent, parsed, checksum);
}
