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
  type IngestionMetadataMismatch,
  type IngestionRunResult,
  type InspectionMetadata,
  type MetadataAuthority,
  type ParsedInspection,
  type ParserValueSource,
  type ProjectResolutionResult,
  type ProjectSourceClassification,
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
  /**
   * G-03 structured intake authority (Wave 2 revision).
   * Resolve a project directly from the operator-entered project number +
   * source classification (as selected in the Upload project picker).
   * Adapters may enrich from the Projects list / Legacy Fallback Registry
   * if useful, but must not override the operator-entered `projectNumber`.
   * When `null` is returned, the pipeline falls back to the legacy
   * workbook-led `resolveProject` path (migration shim only).
   */
  resolveProjectByNumber?(
    projectNumber: string,
    classification: ProjectSourceClassification,
    hints?: {
      readonly projectNameSnapshot?: string;
      readonly projectLocationSnapshot?: string;
      readonly projectStageSnapshot?: string;
      readonly projectLookupId?: number;
      readonly legacyRegistryItemId?: number;
    },
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

export type IngestionTelemetryStage =
  | 'preview-parse'
  | 'contract-validation'
  | 'reporting-period-resolution'
  | 'project-resolution'
  | 'duplicate-classification'
  | 'write-group.inspection-event'
  | 'write-group.findings-batch'
  | 'write-group.project-week-rollup'
  | 'write-group.ingestion-run'
  | 'terminal';

export interface IIngestionTelemetryEvent {
  readonly stage: IngestionTelemetryStage;
  readonly status: 'start' | 'success' | 'failure';
  readonly state?: IngestionRunResult['state'];
  readonly details?: Record<string, unknown>;
}

export interface IIngestionTelemetryObserver {
  onEvent(event: IIngestionTelemetryEvent): void;
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
  readonly telemetryObserver?: IIngestionTelemetryObserver;
}

export async function runIngestionPipeline(
  input: IngestionPipelineInput,
): Promise<IngestionRunResult> {
  const {
    view,
    context,
    uploadedRef,
    adapter,
    parentRunId,
    parentRunSpItemId,
    supersedePrior,
    telemetryObserver,
  } = input;
  const attemptNumber = input.attemptNumber ?? 1;
  const runStartedAt = new Date().toISOString();
  const committedIds: IngestionCommittedIds = {};
  let parsedCache: ParsedInspection | null = null;
  const emit = (event: IIngestionTelemetryEvent): void => {
    try {
      telemetryObserver?.onEvent(event);
    } catch {
      // Best-effort telemetry: never break ingestion flow on observer failure.
    }
  };

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
    emit({
      stage: 'write-group.ingestion-run',
      status: 'start',
      details: {
        terminalStatus: draft.terminalStatus,
      },
    });
    const finalized = await adapter.recordIngestionRun({
      ...draft,
      committedEntityIdsJson: JSON.stringify(committedIds),
      attemptedProjectSiteText:
        draft.attemptedProjectSiteText ?? parsedCache?.metadata.projectSiteText,
    });
    emit({
      stage: 'write-group.ingestion-run',
      status: 'success',
      details: {
        terminalStatus: draft.terminalStatus,
        runId: finalized.id,
        runSpItemId: finalized.spItemId,
      },
    });
    committedIds.ingestionRunId = finalized.id;
    return finalized;
  };

  // Stage 1/2: validate
  emit({
    stage: 'preview-parse',
    status: 'start',
    details: {
      attemptNumber,
      reportingPeriodId: context.reportingPeriodId,
    },
  });
  emit({ stage: 'contract-validation', status: 'start' });
  try {
    validateTemplate(view);
    emit({ stage: 'contract-validation', status: 'success' });
  } catch (err) {
    if (err instanceof TemplateInvalidError) {
      emit({
        stage: 'contract-validation',
        status: 'failure',
        details: { errorClass: 'template-invalid', message: err.message },
      });
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
      emit({
        stage: 'terminal',
        status: 'failure',
        state: 'invalid-template',
        details: {
          runId: run.id,
          attemptNumber,
        },
      });
      return { run, state: 'invalid-template' };
    }
    throw err;
  }

  // Stage 3/4: extract + parse
  try {
    parsedCache = parseChecklist(view);
    emit({
      stage: 'preview-parse',
      status: 'success',
      details: {
        templateVersion: parsedCache.templateVersion,
        parserVersion: parsedCache.parserVersion,
      },
    });
  } catch (err) {
    emit({
      stage: 'preview-parse',
      status: 'failure',
      details: {
        message: err instanceof Error ? err.message : 'Unknown parser error',
      },
    });
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
    emit({
      stage: 'terminal',
      status: 'failure',
      state: 'parse-error',
      details: {
        runId: run.id,
        attemptNumber,
      },
    });
    return { run, state: 'parse-error' };
  }
  const parsed = parsedCache;

  // Prompt 02 closure: parser-derived values are authoritative whenever the
  // parser resolved a field from `ParserMeta` or a named range. The
  // operator-entered intake context is retained for comparison / mismatch
  // advisory via `buildMetadataMismatch`, but it does not displace parser
  // authority for committed inspection metadata.
  //
  // For fields with parser source `legacy` (markerless workbook) or `none`
  // (parser could not resolve the value), the intake context is allowed to
  // step in — this keeps genuinely legacy workbooks ingestible during
  // rollout while eliminating the silent override on marker-bearing
  // workbooks.
  const dateAuthority = resolveFieldAuthority({
    parsedValue: parsed.metadata.inspectionDate,
    parserSource: parsed.metadata.sources.inspectionDate,
    contextValue: context.inspectionDate,
  });
  const inspectionNumberAuthority = resolveFieldAuthority({
    parsedValue: parsed.metadata.inspectionNumber,
    parserSource: parsed.metadata.sources.inspectionNumber,
    contextValue: context.inspectionNumber,
  });
  const authoritativeInspectionDate = dateAuthority.value;
  const authoritativeInspectionNumber = inspectionNumberAuthority.value;
  const metadataAuthority: MetadataAuthority = buildMetadataAuthority(
    parsed.metadata,
    dateAuthority.usedContext,
    inspectionNumberAuthority.usedContext,
  );

  // Stage 5: validate authoritative date against the selected reporting period.
  emit({ stage: 'reporting-period-resolution', status: 'start' });
  const period = await adapter.resolveReportingPeriod(context.reportingPeriodId);
  if (period && period.weekStartDate && period.weekEndDate) {
    const range = { weekStartDate: period.weekStartDate, weekEndDate: period.weekEndDate };
    if (authoritativeInspectionDate && !isDateInRange(authoritativeInspectionDate, range)) {
      emit({
        stage: 'reporting-period-resolution',
        status: 'failure',
        details: {
          reportingPeriodId: period.id,
          inspectionDate: authoritativeInspectionDate,
        },
      });
      const run = await finalize(
        buildRunDraft({
          validationStatus: 'passed',
          parseStatus: 'passed',
          projectResolutionStatus: 'skipped',
          terminalStatus: 'reporting-period-mismatch',
          errorClass: 'reporting-period-mismatch',
          errorSummary: `Inspection date ${authoritativeInspectionDate} is not within selected period ${period.weekStartDate} … ${period.weekEndDate}.`,
          templateVersionDetected: parsed.templateVersion,
          reviewStatus: 'pending-review',
        }),
      );
      emit({
        stage: 'terminal',
        status: 'failure',
        state: 'reporting-period-mismatch',
        details: {
          runId: run.id,
          attemptNumber,
        },
      });
      return { run, state: 'reporting-period-mismatch', metadataAuthority };
    }
  }
  emit({
    stage: 'reporting-period-resolution',
    status: 'success',
    details: {
      reportingPeriodResolved: Boolean(period),
      reportingPeriodId: period?.id,
    },
  });

  // Stage 6: resolve project. When the operator selected a project on the
  // Upload panel, honor that selection directly (resolveProjectByNumber).
  // Otherwise (legacy shim), fall back to workbook-text-led resolution.
  emit({ stage: 'project-resolution', status: 'start' });
  let resolution: ProjectResolutionResult | null = null;
  if (
    context.projectNumber &&
    context.projectNumber.length > 0 &&
    context.projectSourceClassification &&
    adapter.resolveProjectByNumber
  ) {
    resolution = await adapter.resolveProjectByNumber(
      context.projectNumber,
      context.projectSourceClassification,
      {
        projectNameSnapshot: context.projectNameSnapshot,
        projectLocationSnapshot: context.projectLocationSnapshot,
        projectStageSnapshot: context.projectStageSnapshot,
        projectLookupId: context.projectLookupId,
        legacyRegistryItemId: context.legacyRegistryItemId,
      },
    );
  }
  if (!resolution) {
    resolution = await adapter.resolveProject(
      parsed.metadata.projectSiteText,
      parsed.metadata.projectNumberHint,
    );
  }
  if (!resolution) {
    emit({
      stage: 'project-resolution',
      status: 'failure',
      details: {
        projectSiteText: parsed.metadata.projectSiteText,
      },
    });
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
    emit({
      stage: 'terminal',
      status: 'failure',
      state: 'unresolved-project',
      details: {
        runId: run.id,
        attemptNumber,
      },
    });
    return { run, state: 'unresolved-project', metadataAuthority };
  }
  emit({
    stage: 'project-resolution',
    status: 'success',
    details: {
      classification: resolution.classification,
      projectNumber: resolution.projectNumber,
    },
  });

  // G-03 (Wave 2 revision): compute advisory metadata mismatch between
  // workbook-parsed values and operator-entered authoritative values.
  // Surfaces on the IngestionRunResult so the Upload outcome zone can show
  // a bounded advisory. Never changes terminal state.
  const metadataMismatch = buildMetadataMismatch(parsed, context, resolution.projectNumber);

  // Stage: duplicate detection against prior week-scoped inspections.
  const weeklyInspections = await adapter.findInspectionsForProjectWeek({
    projectNumber: resolution.projectNumber,
    reportingPeriodId: context.reportingPeriodId,
  });
  const duplicate = classifyDuplicateRisk(
    weeklyInspections,
    authoritativeInspectionDate,
    authoritativeInspectionNumber,
    uploadedRef.checksum,
  );
  emit({
    stage: 'duplicate-classification',
    status: 'success',
    details: {
      confidence: duplicate.confidence,
      matchedId: duplicate.matchedId,
      supersedePrior: supersedePrior === true,
    },
  });

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
      emit({
        stage: 'terminal',
        status: 'success',
        state: 'committed',
        details: {
          runId: run.id,
          attemptNumber,
          idempotentShortCircuit: true,
          matchedInspectionEventId: matched.id,
        },
      });
      return { run, state: 'committed', metadataMismatch, metadataAuthority };
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
    emit({
      stage: 'terminal',
      status: 'failure',
      state: 'review-required',
      details: {
        runId: run.id,
        attemptNumber,
        duplicateConfidence: duplicate.confidence,
        matchedInspectionEventId: duplicate.matchedId,
      },
    });
    return { run, state: 'review-required', metadataMismatch, metadataAuthority };
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
      weekRangeForDate(authoritativeInspectionDate).weekStartDate,
    );

    // G-03 (Wave 2 revision): operator-entered values are authoritative
    // for inspectionDate, inspectionNumber, projectNumber, and
    // projectNameSnapshot on the committed SafetyInspectionEvents row.
    const inspectionEventDraft: SafetyInspectionEventDraft = {
      title: `${resolution.projectNumber} — Inspection ${authoritativeInspectionNumber || 'new'}`,
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
      inspectionDate: authoritativeInspectionDate,
      inspectionNumber: authoritativeInspectionNumber,
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

    emit({
      stage: 'write-group.project-week-rollup',
      status: 'start',
      details: {
        attemptNumber,
      },
    });
    emit({
      stage: 'write-group.inspection-event',
      status: 'start',
      details: {
        duplicateStatus: inspectionEventDraft.duplicateStatus,
      },
    });
    emit({
      stage: 'write-group.findings-batch',
      status: 'start',
      details: {
        findingCount: findingDrafts.length,
      },
    });

    const committed = await adapter.persistCommit({
      inspectionEventDraft,
      findingDrafts,
      projectWeekRecordUpdate: updatedProjectWeek,
    });
    emit({
      stage: 'write-group.project-week-rollup',
      status: 'success',
      details: {
        inspectionCount: updatedProjectWeek.inspectionCount,
        highestRiskFindingLevel: updatedProjectWeek.highestRiskFindingLevel,
      },
    });
    emit({
      stage: 'write-group.inspection-event',
      status: 'success',
      details: {
        inspectionEventId: committed.inspectionEvent.id,
      },
    });
    emit({
      stage: 'write-group.findings-batch',
      status: 'success',
      details: {
        findingCount: committed.findings.length,
      },
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
    emit({
      stage: 'terminal',
      status: 'success',
      state: 'committed',
      details: {
        runId: run.id,
        attemptNumber,
        inspectionEventId: committed.inspectionEvent.id,
        supersededPriorId: supersedePrior ? duplicate.matchedId : undefined,
      },
    });

    return {
      run,
      committed,
      state: 'committed',
      metadataMismatch,
      metadataAuthority,
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
    emit({
      stage: 'terminal',
      status: 'failure',
      state: 'commit-failed',
      details: {
        runId: run.id,
        attemptNumber,
        message: err instanceof Error ? err.message : 'Unknown commit error',
      },
    });
    return { run, state: 'commit-failed', metadataMismatch, metadataAuthority };
  }
}

interface FieldAuthorityInput {
  readonly parsedValue: string;
  readonly parserSource: ParserValueSource;
  readonly contextValue: string | undefined;
}

interface FieldAuthorityResult {
  readonly value: string;
  readonly usedContext: boolean;
}

/**
 * Prompt 02 closure: decide the authoritative value for a parser-critical
 * field given the parser's resolved value, its source seam, and the
 * operator-entered intake context.
 *
 * Governed authority rule:
 *   - `parser-meta` | `named-range` (markered template): parser wins; the
 *     committed event uses the parsed value. Divergence from the intake
 *     context flows through the existing `metadataMismatch` advisory.
 *   - `legacy` | `none` (markerless / no-marker template): no parser
 *     authority to protect — preserves the pre-existing G-03 rule that
 *     operator-entered intake values drive the committed list fields when
 *     supplied; the parser value fills in only when the intake context is
 *     absent (migration shim).
 */
function resolveFieldAuthority(input: FieldAuthorityInput): FieldAuthorityResult {
  const trimmedContext = (input.contextValue ?? '').trim();
  const hasContext = trimmedContext.length > 0;

  if (input.parserSource === 'parser-meta' || input.parserSource === 'named-range') {
    return { value: input.parsedValue, usedContext: false };
  }

  if (hasContext) return { value: trimmedContext, usedContext: true };
  return { value: input.parsedValue, usedContext: false };
}

function buildMetadataAuthority(
  metadata: InspectionMetadata,
  dateUsedContext: boolean,
  inspectionNumberUsedContext: boolean,
): MetadataAuthority {
  return {
    inspectionDate: {
      source: metadata.sources.inspectionDate,
      usedContext: dateUsedContext,
    },
    inspectionNumber: {
      source: metadata.sources.inspectionNumber,
      usedContext: inspectionNumberUsedContext,
    },
    projectSite: metadata.sources.projectSite,
    keyFindings: metadata.sources.keyFindings,
    reportingWeekStart: metadata.sources.reportingWeekStart,
    reportingWeekEnd: metadata.sources.reportingWeekEnd,
    reportingPeriodLabel: metadata.sources.reportingPeriodLabel,
  };
}

export function classifyDuplicateRisk(
  recent: ReadonlyArray<SafetyInspectionEvent>,
  inspectionDate: string,
  inspectionNumber: string,
  checksum: string,
): { confidence: DuplicateConfidence; matchedId?: string } {
  if (recent.length === 0) return { confidence: 'none' };

  const sameBusinessKey = recent.find(
    (ie) =>
      ie.ingestionStatus !== 'superseded' &&
      ie.projectNumber &&
      ie.inspectionDate === inspectionDate &&
      (ie.inspectionNumber ?? '').toLowerCase() ===
        (inspectionNumber ?? '').toLowerCase(),
  );

  if (!sameBusinessKey) return { confidence: 'none' };
  if (sameBusinessKey.checksum === checksum) {
    return { confidence: 'high-confidence-duplicate', matchedId: sameBusinessKey.id };
  }
  return { confidence: 'near-duplicate', matchedId: sameBusinessKey.id };
}

/**
 * G-03 (Wave 2 revision): compute advisory per-field mismatch between
 * workbook-parsed metadata and operator-entered authoritative metadata.
 * Returns `undefined` when no authoritative intake metadata was provided
 * (legacy migration shim path) or when there is no disagreement to show.
 */
function buildMetadataMismatch(
  parsed: ParsedInspection,
  context: UploadContext,
  resolvedProjectNumber: string,
): IngestionMetadataMismatch | undefined {
  const mismatch: {
    projectNumberMismatch?: { entered: string; parsed: string };
    inspectionNumberMismatch?: { entered: string; parsed: string };
    inspectionDateMismatch?: { entered: string; parsed: string };
  } = {};

  if (context.projectNumber && context.projectNumber.length > 0) {
    const parsedHint = parsed.metadata.projectNumberHint ?? '';
    if (parsedHint && parsedHint !== context.projectNumber) {
      mismatch.projectNumberMismatch = {
        entered: context.projectNumber,
        parsed: parsedHint,
      };
    }
    // Also surface mismatch vs. the free-text project-site cell when it
    // contains an identifiable project number that disagrees.
    if (!parsedHint && parsed.metadata.projectSiteText) {
      const containsResolvedNumber = parsed.metadata.projectSiteText.includes(
        resolvedProjectNumber,
      );
      if (!containsResolvedNumber) {
        mismatch.projectNumberMismatch = {
          entered: context.projectNumber,
          parsed: parsed.metadata.projectSiteText,
        };
      }
    }
  }

  if (context.inspectionNumber && context.inspectionNumber.length > 0) {
    const parsedNum = parsed.metadata.inspectionNumber ?? '';
    if (parsedNum && parsedNum !== context.inspectionNumber) {
      mismatch.inspectionNumberMismatch = {
        entered: context.inspectionNumber,
        parsed: parsedNum,
      };
    }
  }

  if (context.inspectionDate && context.inspectionDate.length > 0) {
    const parsedDate = parsed.metadata.inspectionDate ?? '';
    if (parsedDate && parsedDate !== context.inspectionDate) {
      mismatch.inspectionDateMismatch = {
        entered: context.inspectionDate,
        parsed: parsedDate,
      };
    }
  }

  if (
    !mismatch.projectNumberMismatch &&
    !mismatch.inspectionNumberMismatch &&
    !mismatch.inspectionDateMismatch
  ) {
    return undefined;
  }
  return mismatch;
}

export function __testOnly_weekStartFromDate(dateIso: string): string {
  return weekRangeForDate(dateIso).weekStartDate;
}
