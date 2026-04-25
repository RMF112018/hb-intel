/**
 * Safety Field Excellence rollup service.
 *
 * Stateless orchestrator. Owns request validation, data assembly,
 * domain invocation, ranking, write orchestration, diagnostics, and
 * telemetry. Does NOT re-implement any scoring, eligibility, ranking,
 * narrative, or activity-inference logic — those live in
 * `@hbc/features-safety/excellence` and are consumed verbatim.
 */

import {
  EXCELLENCE_GENERATOR_VERSION,
  EXCELLENCE_REASON_CODES,
  generateCandidateScore,
  rankCandidates,
  type SafetyActivityEvidence,
  type SafetyExcellenceCandidateInput,
  type SafetyExcellenceCandidateScore,
} from '../../../../packages/features/safety/src/excellence/index.js';
import type {
  SafetyProjectWeekRecord,
  SafetyReportingPeriod,
} from '../../../../packages/features/safety/src/domain/types.js';
import {
  GraphBoundedQueryTruncatedError,
} from './safety-ingestion-graph-data-plane.js';
import {
  SafetyFieldExcellenceCandidateIdentityCollisionError,
  type IPersistedSafetyFieldExcellenceCandidate,
  type ISafetyFieldExcellenceGraphRepository,
} from './safety-field-excellence-graph-repository.js';
import {
  emitExcellenceRollupEvent,
} from './safety-field-excellence-telemetry.js';

export interface SafetyFieldExcellenceRollupRequest {
  readonly reportingPeriodId?: string;
  readonly reportingPeriodSpItemId?: number;
  readonly rollingWindowWeeks?: number;
  readonly generatorVersion?: string;
  readonly generatedAt?: string;
  readonly activityEvidenceByProjectNumber?: Readonly<Record<string, SafetyActivityEvidence>>;
}

export interface SafetyFieldExcellenceCandidateListRequest {
  readonly reportingPeriodId?: string;
  readonly reportingPeriodSpItemId?: number;
  readonly generatorVersion?: string;
  readonly eligibilityStatus?: string;
  readonly publishRecommendation?: string;
  readonly top?: number;
}

export interface SafetyFieldExcellenceRollupDiagnostic {
  readonly code: string;
  readonly message: string;
  readonly severity: 'info' | 'warning' | 'error';
}

export interface SafetyFieldExcellenceRollupSummary {
  readonly success: boolean;
  readonly reportingPeriodId: string;
  readonly reportingPeriodSpItemId: number;
  readonly generatorVersion: string;
  readonly generatedAt: string;
  readonly candidateCount: number;
  readonly eligibleCount: number;
  readonly lowConfidenceCount: number;
  readonly needsReviewCount: number;
  readonly ineligibleCount: number;
  readonly suppressedPerfectScoreCount: number;
  readonly missingActivityEvidenceCount: number;
  readonly diagnostics: ReadonlyArray<SafetyFieldExcellenceRollupDiagnostic>;
}

export interface SafetyFieldExcellenceRollupDryRunResponse
  extends SafetyFieldExcellenceRollupSummary {
  readonly dryRun: true;
  readonly candidates: ReadonlyArray<SafetyExcellenceCandidateScore>;
}

export interface SafetyFieldExcellenceRollupGenerateResponse
  extends SafetyFieldExcellenceRollupSummary {
  readonly dryRun: false;
  readonly createdCount: number;
  readonly updatedCount: number;
  readonly unchangedCount: number;
  readonly candidateItemIds: ReadonlyArray<number>;
  readonly candidates: ReadonlyArray<SafetyExcellenceCandidateScore>;
}

export interface SafetyFieldExcellenceCandidateListResponse {
  readonly success: boolean;
  readonly reportingPeriodId: string;
  readonly candidates: ReadonlyArray<IPersistedSafetyFieldExcellenceCandidate>;
  readonly diagnostics: ReadonlyArray<SafetyFieldExcellenceRollupDiagnostic>;
}

export class SafetyFieldExcellenceValidationError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'SafetyFieldExcellenceValidationError';
    this.code = code;
  }
}

const DEFAULT_ROLLING_WINDOW_WEEKS = 4;

export interface SafetyFieldExcellenceRollupServiceOptions {
  readonly repository: ISafetyFieldExcellenceGraphRepository;
}

export class SafetyFieldExcellenceRollupService {
  private readonly repo: ISafetyFieldExcellenceGraphRepository;

  constructor(options: SafetyFieldExcellenceRollupServiceOptions) {
    this.repo = options.repository;
  }

  async runRollup(input: {
    readonly request: SafetyFieldExcellenceRollupRequest;
    readonly dryRun: boolean;
    readonly requestId?: string;
  }): Promise<SafetyFieldExcellenceRollupDryRunResponse | SafetyFieldExcellenceRollupGenerateResponse> {
    const { request, dryRun, requestId } = input;
    const generatorVersion = request.generatorVersion ?? EXCELLENCE_GENERATOR_VERSION;
    const generatedAt = request.generatedAt ?? new Date().toISOString();
    const rollingWindowWeeks = request.rollingWindowWeeks ?? DEFAULT_ROLLING_WINDOW_WEEKS;
    const operation = dryRun ? 'excellence-rollup-read' : 'excellence-rollup-generate';

    if (!request.reportingPeriodId && !request.reportingPeriodSpItemId) {
      throw new SafetyFieldExcellenceValidationError(
        'VALIDATION_ERROR',
        'reportingPeriodId or reportingPeriodSpItemId is required.',
      );
    }

    emitExcellenceRollupEvent('safety.field-excellence.rollup.start', {
      requestId,
      operation,
      reportingPeriodId: request.reportingPeriodId,
      generatorVersion,
    }, { dryRun });

    const diagnostics: SafetyFieldExcellenceRollupDiagnostic[] = [];

    const period = await this.repo.resolveReportingPeriod({
      reportingPeriodId: request.reportingPeriodId,
      reportingPeriodSpItemId: request.reportingPeriodSpItemId,
    });
    if (!period) {
      diagnostics.push({
        code: 'REPORTING_PERIOD_NOT_FOUND',
        severity: 'error',
        message: `Reporting period not found for id=${request.reportingPeriodId ?? '<unset>'} ` +
          `spItemId=${request.reportingPeriodSpItemId ?? '<unset>'}.`,
      });
      return buildEmptyResponse({
        dryRun,
        generatorVersion,
        generatedAt,
        reportingPeriod: null,
        diagnostics,
        success: false,
      });
    }

    let projectWeeks: ReadonlyArray<SafetyProjectWeekRecord> = [];
    try {
      projectWeeks = await this.repo.listProjectWeeksForReportingPeriod({
        reportingPeriodSpItemId: period.spItemId,
      });
    } catch (err) {
      diagnostics.push(toQueryDiagnostic('PROJECT_WEEK_QUERY_FAILED', err));
      return buildEmptyResponse({
        dryRun,
        generatorVersion,
        generatedAt,
        reportingPeriod: period,
        diagnostics,
        success: false,
      });
    }

    if (projectWeeks.length === 0) {
      diagnostics.push({
        code: 'NO_PROJECT_WEEKS_FOUND',
        severity: 'info',
        message: `No project-week records exist for reporting period ${period.id}.`,
      });
      return buildEmptyResponse({
        dryRun,
        generatorVersion,
        generatedAt,
        reportingPeriod: period,
        diagnostics,
        success: true,
      });
    }

    const candidates: SafetyExcellenceCandidateScore[] = [];
    const scoreToProjectWeek = new Map<SafetyExcellenceCandidateScore, SafetyProjectWeekRecord>();
    for (const projectWeek of projectWeeks) {
      try {
        const inspections = await this.repo.listInspectionsForProjectWeek({
          projectWeekRecordSpItemId: projectWeek.spItemId,
        });
        const findings = await this.repo.listFindingsForProjectWeek({
          projectWeekRecordSpItemId: projectWeek.spItemId,
        });
        let priorProjectWeeks: ReadonlyArray<SafetyProjectWeekRecord> = [];
        let priorInspections: ReadonlyArray<SafetyExcellenceCandidateInput['priorInspections'][number]> = [];
        let priorFindings: ReadonlyArray<SafetyExcellenceCandidateInput['priorFindings'][number]> = [];
        try {
          const history = await this.repo.listRollingHistory({
            projectNumber: projectWeek.projectNumber,
            currentReportingPeriod: period,
            rollingWindowWeeks,
          });
          priorProjectWeeks = history.priorProjectWeeks;
          priorInspections = history.priorInspections;
          priorFindings = history.priorFindings;
        } catch (err) {
          diagnostics.push(toQueryDiagnostic('ROLLING_HISTORY_QUERY_FAILED', err, {
            projectNumber: projectWeek.projectNumber,
          }));
        }

        const activityEvidence =
          request.activityEvidenceByProjectNumber?.[projectWeek.projectNumber];
        const candidateInput: SafetyExcellenceCandidateInput = {
          reportingPeriod: period,
          projectWeek,
          inspections,
          findings,
          priorProjectWeeks,
          priorInspections,
          priorFindings,
          activityEvidence,
          generatedAt,
          generatorVersion,
        };

        const score = generateCandidateScore(candidateInput);
        candidates.push(score);
        scoreToProjectWeek.set(score, projectWeek);

        if (
          score.exclusionReasons.includes(
            EXCELLENCE_REASON_CODES.PERFECT_SCORE_INSUFFICIENT_ACTIVITY,
          )
        ) {
          diagnostics.push({
            code: 'PERFECT_SCORE_SUPPRESSED',
            severity: 'info',
            message: `Project ${projectWeek.projectNumber} suppressed: perfect score with insufficient activity evidence.`,
          });
        }

        if (score.activityEvidenceStatus === 'missing') {
          diagnostics.push({
            code: 'ACTIVITY_EVIDENCE_MISSING',
            severity: 'info',
            message: `Project ${projectWeek.projectNumber} has missing activity evidence; recognition limited.`,
          });
        }
      } catch (err) {
        if (err instanceof GraphBoundedQueryTruncatedError) {
          diagnostics.push(toQueryDiagnostic('PARTIAL_DATA_BLOCKED', err, {
            projectNumber: projectWeek.projectNumber,
          }));
        } else {
          diagnostics.push(toQueryDiagnostic('CANDIDATE_SCORE_FAILED', err, {
            projectNumber: projectWeek.projectNumber,
          }));
        }
      }
    }

    const ranked = rankCandidates(candidates);
    const counts = aggregateCounts(ranked);

    const partialDataBlocked = diagnostics.some(
      (d) => d.code === 'PARTIAL_DATA_BLOCKED' || d.code === 'PROJECT_WEEK_QUERY_FAILED',
    );

    if (dryRun) {
      const success = !partialDataBlocked;
      emitExcellenceRollupEvent('safety.field-excellence.rollup.complete', {
        requestId,
        operation,
        reportingPeriodId: period.id,
        generatorVersion,
      }, {
        dryRun,
        success,
        candidateCount: ranked.length,
        ...counts,
      });
      return {
        dryRun: true,
        success,
        reportingPeriodId: period.id,
        reportingPeriodSpItemId: period.spItemId,
        generatorVersion,
        generatedAt,
        candidateCount: ranked.length,
        ...counts,
        candidates: ranked,
        diagnostics,
      };
    }

    let createdCount = 0;
    let updatedCount = 0;
    let unchangedCount = 0;
    const candidateItemIds: number[] = [];
    let writeFailures = 0;

    for (let i = 0; i < ranked.length; i++) {
      const score = ranked[i];
      const projectWeek = scoreToProjectWeek.get(score);
      if (!projectWeek) {
        diagnostics.push({
          code: 'CANDIDATE_WRITE_FAILED',
          severity: 'error',
          message: `Could not resolve project-week for ranked candidate index ${i}.`,
        });
        writeFailures += 1;
        continue;
      }
      try {
        const result = await this.repo.upsertCandidateScore({
          reportingPeriod: period,
          projectWeek,
          score,
        });
        if (result.outcome === 'created') createdCount += 1;
        else if (result.outcome === 'updated') updatedCount += 1;
        else unchangedCount += 1;
        candidateItemIds.push(result.itemId);

        emitExcellenceRollupEvent(`safety.field-excellence.candidate.write.${result.outcome}`, {
          requestId,
          operation,
          reportingPeriodId: period.id,
          generatorVersion,
        }, {
          itemId: result.itemId,
          projectNumber: projectWeek.projectNumber,
        });
      } catch (err) {
        if (err instanceof SafetyFieldExcellenceCandidateIdentityCollisionError) {
          diagnostics.push({
            code: 'CANDIDATE_IDENTITY_COLLISION',
            severity: 'error',
            message:
              `Candidate identity collision for project ${projectWeek.projectNumber}: ` +
              `${err.matchCount} matches under generatorVersion=${err.generatorVersion}. ` +
              'Manual remediation required.',
          });
        } else {
          diagnostics.push(toQueryDiagnostic('CANDIDATE_WRITE_FAILED', err, {
            projectNumber: projectWeek.projectNumber,
          }));
        }
        writeFailures += 1;
      }
    }

    const success = !partialDataBlocked && writeFailures === 0;
    emitExcellenceRollupEvent('safety.field-excellence.rollup.complete', {
      requestId,
      operation,
      reportingPeriodId: period.id,
      generatorVersion,
    }, {
      dryRun,
      success,
      candidateCount: ranked.length,
      createdCount,
      updatedCount,
      unchangedCount,
      writeFailures,
      ...counts,
    });

    return {
      dryRun: false,
      success,
      reportingPeriodId: period.id,
      reportingPeriodSpItemId: period.spItemId,
      generatorVersion,
      generatedAt,
      candidateCount: ranked.length,
      createdCount,
      updatedCount,
      unchangedCount,
      candidateItemIds,
      ...counts,
      candidates: ranked,
      diagnostics,
    };
  }

  async listCandidates(
    request: SafetyFieldExcellenceCandidateListRequest,
    requestId?: string,
  ): Promise<SafetyFieldExcellenceCandidateListResponse> {
    if (!request.reportingPeriodId && !request.reportingPeriodSpItemId) {
      throw new SafetyFieldExcellenceValidationError(
        'VALIDATION_ERROR',
        'reportingPeriodId or reportingPeriodSpItemId is required.',
      );
    }

    const period = await this.repo.resolveReportingPeriod({
      reportingPeriodId: request.reportingPeriodId,
      reportingPeriodSpItemId: request.reportingPeriodSpItemId,
    });
    if (!period) {
      return {
        success: false,
        reportingPeriodId: request.reportingPeriodId ?? '',
        candidates: [],
        diagnostics: [
          {
            code: 'REPORTING_PERIOD_NOT_FOUND',
            severity: 'error',
            message: 'Reporting period not found.',
          },
        ],
      };
    }

    try {
      const candidates = await this.repo.listCandidateScores({
        reportingPeriodSpItemId: period.spItemId,
        generatorVersion: request.generatorVersion,
        eligibilityStatus: request.eligibilityStatus,
        publishRecommendation: request.publishRecommendation,
        top: request.top,
      });

      emitExcellenceRollupEvent('safety.field-excellence.candidates.listed', {
        requestId,
        operation: 'excellence-rollup-read',
        reportingPeriodId: period.id,
      }, {
        candidateCount: candidates.length,
      });

      return {
        success: true,
        reportingPeriodId: period.id,
        candidates,
        diagnostics: [],
      };
    } catch (err) {
      return {
        success: false,
        reportingPeriodId: period.id,
        candidates: [],
        diagnostics: [toQueryDiagnostic('CANDIDATE_QUERY_FAILED', err)],
      };
    }
  }
}

function aggregateCounts(candidates: ReadonlyArray<SafetyExcellenceCandidateScore>): {
  eligibleCount: number;
  lowConfidenceCount: number;
  needsReviewCount: number;
  ineligibleCount: number;
  suppressedPerfectScoreCount: number;
  missingActivityEvidenceCount: number;
} {
  let eligibleCount = 0;
  let lowConfidenceCount = 0;
  let needsReviewCount = 0;
  let ineligibleCount = 0;
  let suppressedPerfectScoreCount = 0;
  let missingActivityEvidenceCount = 0;
  for (const c of candidates) {
    switch (c.eligibilityStatus) {
      case 'eligible':
        eligibleCount += 1;
        break;
      case 'low-confidence':
        lowConfidenceCount += 1;
        break;
      case 'needs-review':
        needsReviewCount += 1;
        break;
      case 'ineligible':
        ineligibleCount += 1;
        break;
    }
    if (c.exclusionReasons.includes(EXCELLENCE_REASON_CODES.PERFECT_SCORE_INSUFFICIENT_ACTIVITY)) {
      suppressedPerfectScoreCount += 1;
    }
    if (c.activityEvidenceStatus === 'missing') {
      missingActivityEvidenceCount += 1;
    }
  }
  return {
    eligibleCount,
    lowConfidenceCount,
    needsReviewCount,
    ineligibleCount,
    suppressedPerfectScoreCount,
    missingActivityEvidenceCount,
  };
}

function toQueryDiagnostic(
  code: string,
  err: unknown,
  context: Record<string, string> = {},
): SafetyFieldExcellenceRollupDiagnostic {
  const ctx = Object.entries(context)
    .map(([k, v]) => `${k}=${v}`)
    .join(' ');
  const baseMessage = err instanceof Error ? err.message : String(err);
  const message = ctx ? `${baseMessage} (${ctx})` : baseMessage;
  return {
    code,
    severity: 'error',
    message,
  };
}

function buildEmptyResponse(input: {
  readonly dryRun: boolean;
  readonly generatorVersion: string;
  readonly generatedAt: string;
  readonly reportingPeriod: SafetyReportingPeriod | null;
  readonly diagnostics: ReadonlyArray<SafetyFieldExcellenceRollupDiagnostic>;
  readonly success: boolean;
}):
  | SafetyFieldExcellenceRollupDryRunResponse
  | SafetyFieldExcellenceRollupGenerateResponse {
  const counts = {
    eligibleCount: 0,
    lowConfidenceCount: 0,
    needsReviewCount: 0,
    ineligibleCount: 0,
    suppressedPerfectScoreCount: 0,
    missingActivityEvidenceCount: 0,
  };
  const reportingPeriodId = input.reportingPeriod?.id ?? '';
  const reportingPeriodSpItemId = input.reportingPeriod?.spItemId ?? 0;
  if (input.dryRun) {
    return {
      dryRun: true,
      success: input.success,
      reportingPeriodId,
      reportingPeriodSpItemId,
      generatorVersion: input.generatorVersion,
      generatedAt: input.generatedAt,
      candidateCount: 0,
      ...counts,
      candidates: [],
      diagnostics: input.diagnostics,
    };
  }
  return {
    dryRun: false,
    success: input.success,
    reportingPeriodId,
    reportingPeriodSpItemId,
    generatorVersion: input.generatorVersion,
    generatedAt: input.generatedAt,
    candidateCount: 0,
    createdCount: 0,
    updatedCount: 0,
    unchangedCount: 0,
    candidateItemIds: [],
    ...counts,
    candidates: [],
    diagnostics: input.diagnostics,
  };
}
