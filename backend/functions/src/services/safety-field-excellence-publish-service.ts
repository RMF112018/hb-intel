/**
 * Safety Field Excellence publish workflow service.
 *
 * Owns the highlight state machine:
 *   draft → pending-review → approved → published → archived | suppressed | rollback.
 *
 * Consumes Wave 03's `SafetyFieldExcellenceRollupService` for candidate
 * generation/persistence and Wave 02's `buildHomepagePayload` /
 * `buildPreviewPayload` for the frozen `HomepagePayloadJson`. This service
 * never re-implements scoring, ranking, eligibility, suppression,
 * narrative, or activity-inference logic — those live in
 * `@hbc/features-safety/excellence`.
 */

import {
  buildHomepagePayload,
  buildPreviewPayload,
  EXCELLENCE_GENERATOR_VERSION,
  type SafetyExcellenceCandidateScore,
  type SafetyExcellenceCtaLink,
  type SafetyFieldExcellenceHomepagePayload,
  type SafetyFieldExcellencePreviewPayload,
  type SafetyFieldExcellencePublishedPayloadDraft,
} from '../../../../packages/features/safety/src/excellence/index.js';
import type {
  SafetyProjectWeekRecord,
  SafetyReportingPeriod,
} from '../../../../packages/features/safety/src/domain/types.js';
import {
  SafetyFieldExcellenceCandidateIdentityCollisionError,
  SafetyFieldExcellenceHighlightIdentityCollisionError,
  type IPersistedSafetyFieldExcellenceCandidate,
  type IPersistedSafetyFieldExcellenceWeeklyHighlight,
  type ISafetyFieldExcellenceGraphRepository,
} from './safety-field-excellence-graph-repository.js';
import { SafetyFieldExcellenceRollupService } from './safety-field-excellence-rollup-service.js';
import { emitExcellenceRollupEvent } from './safety-field-excellence-telemetry.js';

const FRESH_UNTIL_DAYS = 7;
const HARD_OVERRIDE_REASON_MIN_LENGTH = 40;

export interface SafetyFieldExcellencePublishDiagnostic {
  readonly code: string;
  readonly message: string;
  readonly severity: 'info' | 'warning' | 'error';
}

export interface SafetyFieldExcellencePublishServiceOptions {
  readonly repository: ISafetyFieldExcellenceGraphRepository;
  readonly rollupService: SafetyFieldExcellenceRollupService;
}

export interface DraftHighlightRequest {
  readonly reportingPeriodId?: string;
  readonly reportingPeriodSpItemId?: number;
  readonly selectionMethodVersion?: string;
  readonly ctaHref?: string;
  readonly ctaLabel?: string;
}

export interface DraftHighlightResponse {
  readonly success: boolean;
  readonly highlight: IPersistedSafetyFieldExcellenceWeeklyHighlight | null;
  readonly diagnostics: ReadonlyArray<SafetyFieldExcellencePublishDiagnostic>;
}

export interface ApproveHighlightRequest {
  readonly itemId: number;
  readonly approverUpn: string;
}

export interface OverrideHighlightRequest {
  readonly itemId: number;
  readonly primaryCandidateItemId: number;
  readonly secondaryCandidateItemIds?: ReadonlyArray<number>;
  readonly overrideReason: string;
  readonly approve?: boolean;
  readonly approverUpn: string;
}

export interface PublishHighlightRequest {
  readonly itemId: number;
  readonly now?: string;
}

export interface SuppressHighlightRequest {
  readonly itemId: number;
  readonly suppressionReason?: string;
}

export interface RollbackHighlightRequest {
  readonly itemId: number;
  readonly targetItemId?: number;
  readonly now?: string;
}

export interface CurrentHighlightRequest {
  readonly now?: string;
  readonly includeStale?: boolean;
}

export interface CurrentHighlightArtifact {
  readonly state: 'published' | 'no-published-highlight';
  readonly highlight?: {
    readonly itemId: number;
    readonly reportingPeriodSpItemId: number;
    readonly periodLabel: string;
    readonly weekStartDate: string;
    readonly weekEndDate: string;
    readonly publishStatus: 'published';
    readonly publishedAt: string | null;
    readonly freshUntil: string | null;
    readonly isStale: boolean;
    readonly dataConfidence: 'high' | 'medium' | 'low' | null;
    readonly homepagePayload: SafetyFieldExcellencePublishedPayloadDraft | null;
  };
  readonly diagnostics: ReadonlyArray<SafetyFieldExcellencePublishDiagnostic>;
}

export interface HighlightActionResponse {
  readonly success: boolean;
  readonly highlight: IPersistedSafetyFieldExcellenceWeeklyHighlight | null;
  readonly archivedItemIds?: ReadonlyArray<number>;
  readonly diagnostics: ReadonlyArray<SafetyFieldExcellencePublishDiagnostic>;
}

export class SafetyFieldExcellencePublishService {
  private readonly repo: ISafetyFieldExcellenceGraphRepository;
  private readonly rollup: SafetyFieldExcellenceRollupService;

  constructor(options: SafetyFieldExcellencePublishServiceOptions) {
    this.repo = options.repository;
    this.rollup = options.rollupService;
  }

  async draftHighlightFromRollup(
    request: DraftHighlightRequest,
    requestId?: string,
  ): Promise<DraftHighlightResponse> {
    const selectionMethodVersion =
      request.selectionMethodVersion ?? EXCELLENCE_GENERATOR_VERSION;

    emitExcellenceRollupEvent(
      'safety.field-excellence.timer.draft.start',
      {
        requestId,
        operation: 'excellence-rollup-generate',
        reportingPeriodId: request.reportingPeriodId,
        generatorVersion: selectionMethodVersion,
      },
      {},
    );

    const rollupResult = await this.rollup.runRollup({
      request: {
        reportingPeriodId: request.reportingPeriodId,
        reportingPeriodSpItemId: request.reportingPeriodSpItemId,
        generatorVersion: selectionMethodVersion,
      },
      dryRun: false,
      requestId,
    });

    if (!rollupResult.success) {
      const diagnostics: SafetyFieldExcellencePublishDiagnostic[] = [
        ...rollupResult.diagnostics,
        {
          code: 'WEEKLY_ROLLUP_DRAFT_FAILED',
          severity: 'error',
          message: 'Rollup did not succeed; draft highlight not created.',
        },
      ];
      return { success: false, highlight: null, diagnostics };
    }

    const period: SafetyReportingPeriod = {
      id: rollupResult.reportingPeriodId,
      spItemId: rollupResult.reportingPeriodSpItemId,
      title: '',
      weekStartDate: '',
      weekEndDate: '',
      periodLabel: '',
      status: 'open',
    };

    // Re-load reporting period for accurate week dates / label.
    const livePeriod = await this.repo.resolveReportingPeriod({
      reportingPeriodId: rollupResult.reportingPeriodId,
      reportingPeriodSpItemId: rollupResult.reportingPeriodSpItemId,
    });
    const reportingPeriod = livePeriod ?? period;

    const persistedCandidates = await this.repo.listCandidateScores({
      reportingPeriodSpItemId: rollupResult.reportingPeriodSpItemId,
      generatorVersion: selectionMethodVersion,
      top: 200,
    });

    const eligibleForPrimary = persistedCandidates.filter(
      (c) =>
        c.eligibilityStatus === 'eligible' &&
        (c.publishRecommendation === 'primary' || c.publishRecommendation === 'secondary'),
    );

    const primary = eligibleForPrimary[0] ?? null;
    const secondaries = eligibleForPrimary
      .slice(1, 5)
      .filter((c) => c.publishRecommendation !== 'do-not-publish');

    const sectionCta: SafetyExcellenceCtaLink | undefined = request.ctaHref
      ? { label: request.ctaLabel ?? 'View Safety records', href: request.ctaHref }
      : undefined;

    let homepagePayloadJson: string;
    let dataConfidence: 'high' | 'medium' | 'low';
    let dataQualityNotes: string | undefined;

    if (primary) {
      const payload = buildHomepagePayload({
        primary: candidateToScore(primary),
        secondary: secondaries.map(candidateToScore),
        reportingPeriod: ensureReportingPeriodForPayload(reportingPeriod),
        sectionCta,
      });
      homepagePayloadJson = JSON.stringify(payload);
      dataConfidence = payload.dataConfidence;
    } else {
      const previewPayload = buildPreviewPayload({
        ctaHref: request.ctaHref,
        ctaLabel: request.ctaLabel,
      });
      homepagePayloadJson = JSON.stringify(previewPayload);
      dataConfidence = 'low';
      dataQualityNotes =
        'No eligible primary candidate generated for this period; preview payload published pending leadership review.';
    }

    try {
      const highlight = await this.repo.upsertDraftWeeklyHighlight({
        reportingPeriod: ensureReportingPeriodForPayload(reportingPeriod),
        selection: {
          primaryCandidateItemId: primary?.itemId,
          secondaryCandidateItemIds: secondaries.map((c) => c.itemId),
          sourceCandidateItemIds: persistedCandidates.map((c) => c.itemId),
        },
        homepagePayloadJson,
        selectionMethodVersion,
        dataConfidence,
        dataQualityNotes,
      });

      emitExcellenceRollupEvent(
        'safety.field-excellence.timer.draft.complete',
        {
          requestId,
          operation: 'excellence-rollup-generate',
          reportingPeriodId: rollupResult.reportingPeriodId,
          generatorVersion: selectionMethodVersion,
        },
        {
          highlightItemId: highlight.itemId,
          publishStatus: highlight.publishStatus,
          dataConfidence,
        },
      );

      return { success: true, highlight, diagnostics: [] };
    } catch (err) {
      if (err instanceof SafetyFieldExcellenceHighlightIdentityCollisionError) {
        return {
          success: false,
          highlight: null,
          diagnostics: [
            {
              code: 'HIGHLIGHT_IDENTITY_COLLISION',
              severity: 'error',
              message: err.message,
            },
          ],
        };
      }
      if (err instanceof SafetyFieldExcellenceCandidateIdentityCollisionError) {
        return {
          success: false,
          highlight: null,
          diagnostics: [
            {
              code: 'CANDIDATE_IDENTITY_COLLISION',
              severity: 'error',
              message: err.message,
            },
          ],
        };
      }
      const message = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        highlight: null,
        diagnostics: [
          { code: 'WEEKLY_HIGHLIGHT_WRITE_FAILED', severity: 'error', message },
        ],
      };
    }
  }

  async getHighlight(itemId: number): Promise<IPersistedSafetyFieldExcellenceWeeklyHighlight | null> {
    return this.repo.getWeeklyHighlightByItemId({ itemId });
  }

  async approveHighlight(
    request: ApproveHighlightRequest,
    requestId?: string,
  ): Promise<HighlightActionResponse> {
    const current = await this.repo.getWeeklyHighlightByItemId({ itemId: request.itemId });
    if (!current) return errorResponse('HIGHLIGHT_NOT_FOUND', 'Highlight not found.');

    if (current.publishStatus !== 'draft' && current.publishStatus !== 'pending-review') {
      return errorResponse(
        'HIGHLIGHT_INVALID_STATUS',
        `Highlight cannot be approved from status '${current.publishStatus}'.`,
      );
    }

    if (!current.homepagePayloadJson) {
      return errorResponse('HIGHLIGHT_PAYLOAD_MISSING', 'Highlight is missing HomepagePayloadJson.');
    }
    let payload: SafetyFieldExcellencePublishedPayloadDraft | null = null;
    try {
      payload = JSON.parse(current.homepagePayloadJson) as SafetyFieldExcellencePublishedPayloadDraft;
    } catch {
      return errorResponse('HIGHLIGHT_PAYLOAD_INVALID', 'HomepagePayloadJson failed to parse.');
    }

    if (current.primaryCandidateSpItemId !== null) {
      const primary = await this.repo.getCandidateScoreByItemId({
        itemId: current.primaryCandidateSpItemId,
      });
      if (!primary) {
        return errorResponse(
          'CANDIDATE_NOT_FOUND',
          `Primary candidate ${current.primaryCandidateSpItemId} not found.`,
        );
      }
      if (
        primary.publishRecommendation === 'do-not-publish' &&
        !current.editorialOverrideApplied
      ) {
        return errorResponse(
          'CANDIDATE_NOT_APPROVABLE',
          'Primary candidate is do-not-publish; override required before approval.',
        );
      }
    }

    const updated = await this.repo.updateWeeklyHighlightFields({
      itemId: request.itemId,
      fields: {
        PublishStatus: 'approved',
        ApprovedBy: request.approverUpn,
        ApprovedAt: new Date().toISOString(),
      },
    });

    emitExcellenceRollupEvent(
      'safety.field-excellence.highlight.approved',
      {
        requestId,
        operation: 'excellence-rollup-generate',
        reportingPeriodId: `period-${updated.reportingPeriodSpItemId}`,
      },
      { highlightItemId: updated.itemId, payloadIsPreview: payload?.isPreview === true },
    );

    return { success: true, highlight: updated, diagnostics: [] };
  }

  async overrideHighlight(
    request: OverrideHighlightRequest,
    requestId?: string,
  ): Promise<HighlightActionResponse> {
    if (!request.overrideReason || request.overrideReason.trim().length === 0) {
      return errorResponse('OVERRIDE_REASON_REQUIRED', 'overrideReason is required.');
    }

    const current = await this.repo.getWeeklyHighlightByItemId({ itemId: request.itemId });
    if (!current) return errorResponse('HIGHLIGHT_NOT_FOUND', 'Highlight not found.');

    const period = await this.repo.resolveReportingPeriod({
      reportingPeriodSpItemId: current.reportingPeriodSpItemId,
    });
    if (!period) {
      return errorResponse(
        'HIGHLIGHT_INVALID_STATUS',
        'Reporting period for highlight no longer resolves.',
      );
    }

    const primary = await this.repo.getCandidateScoreByItemId({
      itemId: request.primaryCandidateItemId,
    });
    if (!primary) {
      return errorResponse(
        'CANDIDATE_NOT_FOUND',
        `Primary candidate ${request.primaryCandidateItemId} not found.`,
      );
    }

    const isHardExcluded =
      primary.publishRecommendation === 'do-not-publish' || primary.eligibilityStatus === 'ineligible';
    let editorialOverrideApplied = false;
    if (isHardExcluded) {
      if (request.overrideReason.trim().length < HARD_OVERRIDE_REASON_MIN_LENGTH) {
        return errorResponse(
          'OVERRIDE_REASON_REQUIRED',
          `Hard-excluded candidate override requires reason of at least ${HARD_OVERRIDE_REASON_MIN_LENGTH} characters.`,
        );
      }
      editorialOverrideApplied = true;
    }

    const secondaryRequest = request.secondaryCandidateItemIds ?? [];
    const secondaries: IPersistedSafetyFieldExcellenceCandidate[] = [];
    for (const secondaryItemId of secondaryRequest) {
      const secondary = await this.repo.getCandidateScoreByItemId({ itemId: secondaryItemId });
      if (!secondary) {
        return errorResponse(
          'CANDIDATE_NOT_FOUND',
          `Secondary candidate ${secondaryItemId} not found.`,
        );
      }
      if (secondary.publishRecommendation === 'do-not-publish') {
        return errorResponse(
          'CANDIDATE_NOT_APPROVABLE',
          `Secondary candidate ${secondaryItemId} is do-not-publish; cannot be selected as a secondary.`,
        );
      }
      secondaries.push(secondary);
    }

    // For editorial overrides on hard-excluded candidates, the Wave 02
    // helper refuses to publish (its safety guard). Construct an
    // override-aware payload by treating the primary as a `secondary`
    // recommendation for the payload-construction-only view; the
    // persisted candidate stays unchanged.
    const primaryForPayload = isHardExcluded
      ? { ...candidateToScore(primary), publishRecommendation: 'secondary' as const, eligibilityStatus: 'eligible' as const }
      : candidateToScore(primary);
    const payload = buildHomepagePayload({
      primary: primaryForPayload,
      secondary: secondaries.map(candidateToScore),
      reportingPeriod: period,
    });
    const homepagePayloadJson = JSON.stringify(payload);

    const fields: Record<string, unknown> = {
      PublishStatus: request.approve ? 'approved' : 'pending-review',
      PrimaryCandidateIdLookupId: primary.itemId,
      SecondaryCandidateIdsJson: JSON.stringify(secondaries.map((c) => c.itemId)),
      HomepagePayloadJson: homepagePayloadJson,
      DataConfidence: payload.dataConfidence,
      EditorialOverrideApplied: editorialOverrideApplied,
      OverrideReason: request.overrideReason,
    };
    if (request.approve) {
      fields.ApprovedBy = request.approverUpn;
      fields.ApprovedAt = new Date().toISOString();
    }

    const updated = await this.repo.updateWeeklyHighlightFields({
      itemId: request.itemId,
      fields,
    });

    emitExcellenceRollupEvent(
      'safety.field-excellence.highlight.overridden',
      {
        requestId,
        operation: 'excellence-rollup-generate',
        reportingPeriodId: `period-${updated.reportingPeriodSpItemId}`,
      },
      {
        highlightItemId: updated.itemId,
        editorialOverrideApplied,
        approved: Boolean(request.approve),
      },
    );

    return { success: true, highlight: updated, diagnostics: [] };
  }

  async publishHighlight(
    request: PublishHighlightRequest,
    requestId?: string,
  ): Promise<HighlightActionResponse> {
    const now = request.now ?? new Date().toISOString();
    const current = await this.repo.getWeeklyHighlightByItemId({ itemId: request.itemId });
    if (!current) return errorResponse('HIGHLIGHT_NOT_FOUND', 'Highlight not found.');

    if (current.publishStatus !== 'approved') {
      return errorResponse(
        'PUBLISH_APPROVAL_REQUIRED',
        `Highlight must be 'approved' before publish; current status '${current.publishStatus}'.`,
      );
    }

    let payload: SafetyFieldExcellencePublishedPayloadDraft | null = null;
    if (!current.homepagePayloadJson) {
      return errorResponse('HIGHLIGHT_PAYLOAD_MISSING', 'Highlight is missing HomepagePayloadJson.');
    }
    try {
      payload = JSON.parse(current.homepagePayloadJson) as SafetyFieldExcellencePublishedPayloadDraft;
    } catch {
      return errorResponse('HIGHLIGHT_PAYLOAD_INVALID', 'HomepagePayloadJson failed to parse.');
    }
    if (payload.isPreview === false && !payload.primarySpotlight) {
      return errorResponse(
        'PUBLISH_NO_VALID_PRIMARY',
        'Non-preview payload has no primary spotlight; refusing to publish.',
      );
    }

    const archivedItemIds = await this.repo.archivePriorPublishedHighlights({
      reportingPeriodSpItemId: current.reportingPeriodSpItemId,
      excludingItemId: current.itemId,
    });

    const freshUntil =
      current.freshUntil && current.freshUntil > now
        ? current.freshUntil
        : addDaysIso(now, FRESH_UNTIL_DAYS);

    const updated = await this.repo.updateWeeklyHighlightFields({
      itemId: request.itemId,
      fields: {
        PublishStatus: 'published',
        PublishedAt: now,
        FreshUntil: freshUntil,
      },
    });

    emitExcellenceRollupEvent(
      'safety.field-excellence.highlight.published',
      {
        requestId,
        operation: 'excellence-rollup-generate',
        reportingPeriodId: `period-${updated.reportingPeriodSpItemId}`,
      },
      {
        highlightItemId: updated.itemId,
        archivedCount: archivedItemIds.length,
        freshUntil,
      },
    );

    return { success: true, highlight: updated, archivedItemIds, diagnostics: [] };
  }

  async suppressHighlight(
    request: SuppressHighlightRequest,
    requestId?: string,
  ): Promise<HighlightActionResponse> {
    const current = await this.repo.getWeeklyHighlightByItemId({ itemId: request.itemId });
    if (!current) return errorResponse('HIGHLIGHT_NOT_FOUND', 'Highlight not found.');

    const fields: Record<string, unknown> = { PublishStatus: 'suppressed' };
    const reason = request.suppressionReason?.trim();
    if (reason && reason.length > 0) {
      fields.OverrideReason = reason;
    }

    const updated = await this.repo.updateWeeklyHighlightFields({
      itemId: request.itemId,
      fields,
    });

    emitExcellenceRollupEvent(
      'safety.field-excellence.highlight.suppressed',
      {
        requestId,
        operation: 'excellence-rollup-generate',
        reportingPeriodId: `period-${updated.reportingPeriodSpItemId}`,
      },
      {
        highlightItemId: updated.itemId,
        reasonRecorded: Boolean(reason),
      },
    );

    return {
      success: true,
      highlight: updated,
      diagnostics: reason
        ? [{ code: 'SUPPRESS_REASON_RECORDED', severity: 'info', message: 'Suppression reason recorded.' }]
        : [],
    };
  }

  async rollbackHighlight(
    request: RollbackHighlightRequest,
    requestId?: string,
  ): Promise<HighlightActionResponse> {
    const now = request.now ?? new Date().toISOString();
    const current = await this.repo.getWeeklyHighlightByItemId({ itemId: request.itemId });
    if (!current) return errorResponse('HIGHLIGHT_NOT_FOUND', 'Highlight not found.');

    const targetItemId = request.targetItemId ?? current.rollbackFromItemId ?? null;
    if (!targetItemId) {
      return errorResponse(
        'ROLLBACK_TARGET_NOT_FOUND',
        'No rollback target supplied and no RollbackFromItemId set on current highlight.',
      );
    }

    const target = await this.repo.getWeeklyHighlightByItemId({ itemId: targetItemId });
    if (!target) {
      return errorResponse(
        'ROLLBACK_TARGET_NOT_FOUND',
        `Rollback target ${targetItemId} not found.`,
      );
    }
    if (!target.homepagePayloadJson) {
      return errorResponse(
        'ROLLBACK_TARGET_INVALID',
        'Rollback target has no HomepagePayloadJson.',
      );
    }

    await this.repo.updateWeeklyHighlightFields({
      itemId: target.itemId,
      fields: {
        PublishStatus: 'published',
        PublishedAt: now,
        FreshUntil: addDaysIso(now, FRESH_UNTIL_DAYS),
      },
    });

    const updated = await this.repo.updateWeeklyHighlightFields({
      itemId: request.itemId,
      fields: {
        PublishStatus: 'archived',
        RollbackFromItemId: target.itemId,
      },
    });

    emitExcellenceRollupEvent(
      'safety.field-excellence.highlight.rolled-back',
      {
        requestId,
        operation: 'excellence-rollup-generate',
        reportingPeriodId: `period-${updated.reportingPeriodSpItemId}`,
      },
      { fromItemId: updated.itemId, toItemId: target.itemId },
    );

    return { success: true, highlight: updated, diagnostics: [] };
  }

  async getCurrentHomepageHighlight(
    request: CurrentHighlightRequest,
    requestId?: string,
  ): Promise<CurrentHighlightArtifact> {
    const now = request.now ?? new Date().toISOString();
    const includeStale = request.includeStale === true;

    const fresh = await this.repo.listCurrentPublishedHighlights({ now, includeStale: false });
    let chosen: IPersistedSafetyFieldExcellenceWeeklyHighlight | null = fresh[0] ?? null;
    let isStale = false;

    if (!chosen && includeStale) {
      const all = await this.repo.listCurrentPublishedHighlights({ now, includeStale: true });
      chosen = all[0] ?? null;
      if (chosen) {
        isStale =
          chosen.freshUntil !== null &&
          chosen.freshUntil !== undefined &&
          chosen.freshUntil < now;
      }
    }

    if (!chosen) {
      emitExcellenceRollupEvent(
        'safety.field-excellence.homepage.current.empty',
        {
          requestId,
          operation: 'excellence-rollup-read',
        },
        { includeStale },
      );
      return { state: 'no-published-highlight', diagnostics: [] };
    }

    let payload: SafetyFieldExcellencePublishedPayloadDraft | null = null;
    try {
      payload = JSON.parse(chosen.homepagePayloadJson) as SafetyFieldExcellencePublishedPayloadDraft;
    } catch {
      payload = null;
    }

    emitExcellenceRollupEvent(
      'safety.field-excellence.homepage.current.read',
      {
        requestId,
        operation: 'excellence-rollup-read',
      },
      {
        highlightItemId: chosen.itemId,
        publishStatus: chosen.publishStatus,
        dataConfidence: chosen.dataConfidence,
        isStale,
      },
    );

    return {
      state: 'published',
      highlight: {
        itemId: chosen.itemId,
        reportingPeriodSpItemId: chosen.reportingPeriodSpItemId,
        periodLabel: chosen.periodLabel,
        weekStartDate: chosen.weekStartDate,
        weekEndDate: chosen.weekEndDate,
        publishStatus: 'published',
        publishedAt: chosen.publishedAt,
        freshUntil: chosen.freshUntil,
        isStale,
        dataConfidence: chosen.dataConfidence,
        homepagePayload: payload,
      },
      diagnostics: [],
    };
  }
}

function ensureReportingPeriodForPayload(period: SafetyReportingPeriod): SafetyReportingPeriod {
  return period;
}

function candidateToScore(
  candidate: IPersistedSafetyFieldExcellenceCandidate,
): SafetyExcellenceCandidateScore {
  // Strip persistence-only fields; the Wave 02 payload helpers expect
  // `SafetyExcellenceCandidateScore` shape. The repository type extends
  // candidate score with `itemId` + lookup IDs — drop those here.
  const {
    itemId: _itemId,
    reportingPeriodSpItemId: _r,
    projectWeekRecordSpItemId: _p,
    ...score
  } = candidate;
  void _itemId;
  void _r;
  void _p;
  return score;
}

function addDaysIso(now: string, days: number): string {
  const dt = new Date(now);
  if (Number.isNaN(dt.getTime())) return now;
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString();
}

function errorResponse(code: string, message: string): HighlightActionResponse {
  return {
    success: false,
    highlight: null,
    diagnostics: [{ code, severity: 'error', message }],
  };
}

// Reference unused imports for type-only consumers in dts environments.
void (null as null | SafetyFieldExcellenceHomepagePayload);
void (null as null | SafetyFieldExcellencePreviewPayload);
void (null as null | SafetyProjectWeekRecord);
