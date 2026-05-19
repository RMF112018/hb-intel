/**
 * My Work Adobe-Sign cache read-model provider — B05.15 Prompt 04.
 *
 * Cache-backed counterpart to `MyWorkAdobeSignLiveReadModelProvider`. Serves
 * `GET /api/my-work/me/home`, `.../adobe-sign/action-queue`, and
 * `.../adobe-sign/recent-completions` from the SharePoint cache when
 * `MY_WORK_ADOBE_SIGN_READ_MODE=cache`. **Never** calls Adobe Sign live —
 * structurally enforced because the constructor accepts no Adobe HTTP
 * client; only the principal resolver (for grant-posture / actor-key
 * resolution) and the cache repositories.
 *
 * Read-state mapping (package §8.5):
 *
 *   - grant missing / revoked / requires-reauth → authorization-required.
 *   - active grant + UserCache missing          → partial + cache-hydration-pending, freshness=unknown.
 *   - active grant + UserCache malformed        → backend-unavailable + sanitized diagnostic.
 *   - active grant + UserCache fresh/aging/stale → cached envelope + freshness from row.
 *
 * @module hosts/my-work-read-model/read-models/my-work-adobe-sign-cache-read-model-provider
 */

import type {
  MyWorkAdobeSignActionQueueQuery,
  MyWorkAdobeSignActionQueueReadModel,
  MyWorkAdobeSignActionQueueSummary,
  MyWorkAdobeSignRecentCompletionsItem,
  MyWorkAdobeSignRecentCompletionsQuery,
  MyWorkAdobeSignRecentCompletionsReadModel,
  MyWorkAdobeSignRecentCompletionsSummary,
  MyWorkFreshnessState,
  MyWorkHomeReadModel,
  MyWorkReadModelEnvelope,
  MyWorkReadModelSourceStatus,
  MyWorkReadModelWarning,
} from '@hbc/models/myWork';

import type { AdobeSignCacheFreshnessState } from '../../../services/adobe-sign-cache/cache-list-descriptors.js';
import type {
  AdobeSignAgreementProjectionRow,
  IAdobeSignAgreementProjectionCacheRepository,
} from '../../../services/adobe-sign-cache/repositories/agreement-projection-cache-repository.js';
import type {
  AdobeSignUserCacheRow,
  IAdobeSignUserCacheRepository,
} from '../../../services/adobe-sign-cache/repositories/user-cache-repository.js';
import {
  toMyWorkSourceStatus,
  type AdobeSignPrincipalResolutionResult,
} from './adobe-sign/adobe-sign-principal-resolution.js';
import type { AdobeSignPrincipalResolver } from './adobe-sign/adobe-sign-principal-resolver.js';
import type { AdobeSignRuntimeDiagnosticReporter } from './adobe-sign/adobe-sign-runtime-diagnostics.js';
import type { MyWorkReadContext } from './my-work-read-model-provider.js';

const HOME_PREVIEW_ITEM_LIMIT = 5 as const;
const RECENT_COMPLETIONS_WINDOW_DAYS = 30 as const;

const FRESHNESS_LOOKUP: Readonly<Record<AdobeSignCacheFreshnessState, MyWorkFreshnessState>> = {
  Fresh: 'fresh',
  Aging: 'aging',
  Stale: 'stale',
  Unknown: 'unknown',
};

function toMyWorkFreshness(state: AdobeSignCacheFreshnessState | undefined): MyWorkFreshnessState {
  if (state === undefined) return 'unknown';
  return FRESHNESS_LOOKUP[state] ?? 'unknown';
}

export interface MyWorkAdobeSignCacheReadModelProviderOptions {
  readonly resolvePrincipal: AdobeSignPrincipalResolver;
  readonly userCacheRepository: IAdobeSignUserCacheRepository;
  readonly agreementProjectionCacheRepository: IAdobeSignAgreementProjectionCacheRepository;
  readonly now?: () => Date;
  /** Optional sanitized diagnostic sink; omit in tests that don't care. */
  readonly diagnostics?: AdobeSignRuntimeDiagnosticReporter;
}

function makeAuthorizationRequiredEnvelope<TData>(
  data: TData,
  generatedAtUtc: string,
): MyWorkReadModelEnvelope<TData> {
  return {
    mode: 'backend',
    sourceStatus: 'authorization-required',
    readOnly: true,
    warnings: [{ code: 'authorization-required' }],
    generatedAtUtc,
    data,
  };
}

function makeHydrationPendingEnvelope<TData>(
  data: TData,
  generatedAtUtc: string,
): MyWorkReadModelEnvelope<TData> {
  return {
    mode: 'backend',
    sourceStatus: 'partial',
    readOnly: true,
    warnings: [{ code: 'cache-hydration-pending' }],
    generatedAtUtc,
    data,
  };
}

function makeBackendUnavailableEnvelope<TData>(
  data: TData,
  generatedAtUtc: string,
): MyWorkReadModelEnvelope<TData> {
  return {
    mode: 'backend',
    sourceStatus: 'backend-unavailable',
    readOnly: true,
    warnings: [{ code: 'backend-unavailable' }],
    generatedAtUtc,
    data,
  };
}

function emptyActionQueue(generatedAtUtc = ''): MyWorkAdobeSignActionQueueReadModel {
  return {
    moduleId: 'adobe-sign-action-queue',
    summary: {
      countBasis: 'returned-items',
      totalActionItemCount: 0,
      signatureCount: 0,
      approvalCount: 0,
      acceptanceCount: 0,
      acknowledgementCount: 0,
      formFillingCount: 0,
      delegationCount: 0,
      expiringSoonCount: 0,
    },
    items: [],
    pagination: { pageSize: 0, hasMore: false },
    freshness: { state: 'unknown', generatedAtUtc },
  };
}

function emptyRecentCompletions(
  generatedAtUtc = '',
): MyWorkAdobeSignRecentCompletionsReadModel {
  return {
    moduleId: 'adobe-sign-recent-completions',
    summary: {
      countBasis: 'returned-items',
      completedAgreementCount: 0,
      windowDays: RECENT_COMPLETIONS_WINDOW_DAYS,
    },
    items: [],
    pagination: { pageSize: 0, hasMore: false },
    freshness: { state: 'unknown', generatedAtUtc },
  };
}

function emptyHome(actor: MyWorkReadContext['actor']): MyWorkHomeReadModel {
  return {
    actor,
    summary: { totalActionItemCount: 0 },
    sourceReadiness: [],
    adobeSignActionQueue: {
      summary: emptyActionQueue().summary,
      previewItems: [],
      previewItemLimit: HOME_PREVIEW_ITEM_LIMIT,
    },
  };
}

function deriveStaleWarnings(
  cachedWarnings: readonly MyWorkReadModelWarning[],
  freshness: MyWorkFreshnessState,
): readonly MyWorkReadModelWarning[] {
  if (freshness === 'aging' || freshness === 'stale') {
    const alreadyStaleFlagged = cachedWarnings.some((w) => w.code === 'stale-cache-used');
    return alreadyStaleFlagged ? cachedWarnings : [...cachedWarnings, { code: 'stale-cache-used' }];
  }
  return cachedWarnings;
}

export class MyWorkAdobeSignCacheReadModelProvider {
  private readonly resolvePrincipal: AdobeSignPrincipalResolver;
  private readonly userCacheRepository: IAdobeSignUserCacheRepository;
  private readonly agreementProjectionCacheRepository: IAdobeSignAgreementProjectionCacheRepository;
  private readonly now: () => Date;
  private readonly diagnostics?: AdobeSignRuntimeDiagnosticReporter;

  constructor(options: MyWorkAdobeSignCacheReadModelProviderOptions) {
    this.resolvePrincipal = options.resolvePrincipal;
    this.userCacheRepository = options.userCacheRepository;
    this.agreementProjectionCacheRepository = options.agreementProjectionCacheRepository;
    this.now = options.now ?? (() => new Date());
    this.diagnostics = options.diagnostics;
  }

  private buildPrincipalEnvelope<TData>(
    resolution: Exclude<AdobeSignPrincipalResolutionResult, { status: 'resolved' }>,
    data: TData,
    generatedAtUtc: string,
  ): MyWorkReadModelEnvelope<TData> {
    const sourceStatus: MyWorkReadModelSourceStatus = toMyWorkSourceStatus(resolution.status);
    const warningCode: MyWorkReadModelWarning['code'] = (() => {
      switch (sourceStatus) {
        case 'authorization-required':
          return 'authorization-required';
        case 'principal-unresolved':
          return 'principal-unresolved';
        case 'configuration-required':
          return 'configuration-required';
        case 'source-unavailable':
          return 'source-unavailable';
        default:
          return 'backend-unavailable';
      }
    })();
    return {
      mode: 'backend',
      sourceStatus,
      readOnly: true,
      warnings: [{ code: warningCode }],
      generatedAtUtc,
      data,
    };
  }

  async getMyWorkHome(
    context: MyWorkReadContext,
  ): Promise<MyWorkReadModelEnvelope<MyWorkHomeReadModel>> {
    const generatedAtUtc = this.now().toISOString();
    const resolution = await this.resolvePrincipal(context);
    if (resolution.status !== 'resolved') {
      return this.buildPrincipalEnvelope(resolution, emptyHome(context.actor), generatedAtUtc);
    }
    const userCache = await this.userCacheRepository.findByAdobeActorKey(
      resolution.principal.actor.actorKey,
    );
    if (userCache.outcome === 'missing') {
      const data: MyWorkHomeReadModel = {
        actor: context.actor,
        summary: { totalActionItemCount: 0 },
        sourceReadiness: [
          {
            sourceSystem: 'adobe-sign',
            sourceStatus: 'partial',
            warnings: [{ code: 'cache-hydration-pending' }],
          },
        ],
        adobeSignActionQueue: {
          summary: emptyActionQueue().summary,
          previewItems: [],
          previewItemLimit: HOME_PREVIEW_ITEM_LIMIT,
        },
      };
      return makeHydrationPendingEnvelope(data, generatedAtUtc);
    }
    if (userCache.outcome === 'malformed') {
      this.diagnostics?.trackAdobeSignRuntimeEvent('adobe-sign-runtime-failure', {
        status: 'failed',
        errorClass: 'unknown',
      });
      return makeBackendUnavailableEnvelope(emptyHome(context.actor), generatedAtUtc);
    }
    const row = userCache.row;
    const freshness = toMyWorkFreshness(row.freshnessState);
    const warnings = deriveStaleWarnings(row.snapshots.actionQueueWarnings, freshness);
    const summary: MyWorkAdobeSignActionQueueSummary = row.snapshots.actionQueueSummary;
    const previewItems = row.snapshots.actionQueuePreview.slice(0, HOME_PREVIEW_ITEM_LIMIT);
    const data: MyWorkHomeReadModel = {
      actor: context.actor,
      summary: { totalActionItemCount: summary.totalActionItemCount },
      sourceReadiness: [
        {
          sourceSystem: 'adobe-sign',
          sourceStatus: row.cachedSourceStatus,
          warnings,
        },
      ],
      adobeSignActionQueue: {
        summary,
        previewItems,
        previewItemLimit: HOME_PREVIEW_ITEM_LIMIT,
      },
    };
    return {
      mode: 'backend',
      sourceStatus: row.cachedSourceStatus,
      readOnly: true,
      warnings,
      generatedAtUtc,
      data,
    };
  }

  async getAdobeSignActionQueue(
    context: MyWorkReadContext,
    query: MyWorkAdobeSignActionQueueQuery,
  ): Promise<MyWorkReadModelEnvelope<MyWorkAdobeSignActionQueueReadModel>> {
    const generatedAtUtc = this.now().toISOString();
    const resolution = await this.resolvePrincipal(context);
    if (resolution.status !== 'resolved') {
      const empty = emptyActionQueue(generatedAtUtc);
      return this.buildPrincipalEnvelope(resolution, empty, generatedAtUtc);
    }
    const userCache = await this.userCacheRepository.findByAdobeActorKey(
      resolution.principal.actor.actorKey,
    );
    if (userCache.outcome === 'missing') {
      const empty = emptyActionQueue(generatedAtUtc);
      return makeHydrationPendingEnvelope(empty, generatedAtUtc);
    }
    if (userCache.outcome === 'malformed') {
      this.diagnostics?.trackAdobeSignRuntimeEvent('adobe-sign-runtime-failure', {
        status: 'failed',
        errorClass: 'unknown',
      });
      const empty = emptyActionQueue(generatedAtUtc);
      return makeBackendUnavailableEnvelope(empty, generatedAtUtc);
    }
    const row = userCache.row;
    const freshness = toMyWorkFreshness(row.freshnessState);
    const warnings = deriveStaleWarnings(row.snapshots.actionQueueWarnings, freshness);
    const pageSize = clampPageSize(query.pageSize, 25);
    const page = await this.agreementProjectionCacheRepository.listActiveByActorAndBucket({
      adobeActorKey: resolution.principal.actor.actorKey,
      projectionBucket: 'PendingAction',
      pageSize,
      cursor: query.cursor,
    });
    const items = collectActionQueueItems(page.rows);
    const data: MyWorkAdobeSignActionQueueReadModel = {
      moduleId: 'adobe-sign-action-queue',
      summary: row.snapshots.actionQueueSummary,
      items,
      pagination: page.nextCursor
        ? { pageSize, hasMore: page.hasMore, nextCursor: page.nextCursor }
        : { pageSize, hasMore: page.hasMore },
      freshness: {
        state: freshness,
        generatedAtUtc,
        ...(row.lastSuccessfulAdobeRefreshUtc !== undefined && {
          lastSuccessfulSourceReadAtUtc: row.lastSuccessfulAdobeRefreshUtc,
        }),
      },
    };
    return {
      mode: 'backend',
      sourceStatus: row.cachedSourceStatus,
      readOnly: true,
      warnings,
      generatedAtUtc,
      data,
    };
  }

  async getAdobeSignRecentCompletions(
    context: MyWorkReadContext,
    query: MyWorkAdobeSignRecentCompletionsQuery,
  ): Promise<MyWorkReadModelEnvelope<MyWorkAdobeSignRecentCompletionsReadModel>> {
    const generatedAtUtc = this.now().toISOString();
    const resolution = await this.resolvePrincipal(context);
    if (resolution.status !== 'resolved') {
      const empty = emptyRecentCompletions(generatedAtUtc);
      return this.buildPrincipalEnvelope(resolution, empty, generatedAtUtc);
    }
    const userCache = await this.userCacheRepository.findByAdobeActorKey(
      resolution.principal.actor.actorKey,
    );
    if (userCache.outcome === 'missing') {
      const empty = emptyRecentCompletions(generatedAtUtc);
      return makeHydrationPendingEnvelope(empty, generatedAtUtc);
    }
    if (userCache.outcome === 'malformed') {
      this.diagnostics?.trackAdobeSignRuntimeEvent('adobe-sign-runtime-failure', {
        status: 'failed',
        errorClass: 'unknown',
      });
      const empty = emptyRecentCompletions(generatedAtUtc);
      return makeBackendUnavailableEnvelope(empty, generatedAtUtc);
    }
    const row = userCache.row;
    const freshness = toMyWorkFreshness(row.freshnessState);
    const warnings = deriveStaleWarnings(
      row.snapshots.recentCompletionsWarnings,
      freshness,
    );
    const pageSize = clampPageSize(query.pageSize, 25);
    const page = await this.agreementProjectionCacheRepository.listActiveByActorAndBucket({
      adobeActorKey: resolution.principal.actor.actorKey,
      projectionBucket: 'RecentCompletion',
      pageSize,
      cursor: query.cursor,
    });
    const items = collectRecentCompletionsItems(page.rows);
    const summary: MyWorkAdobeSignRecentCompletionsSummary = row.snapshots.recentCompletionsSummary;
    const data: MyWorkAdobeSignRecentCompletionsReadModel = {
      moduleId: 'adobe-sign-recent-completions',
      summary,
      items,
      pagination: page.nextCursor
        ? { pageSize, hasMore: page.hasMore, nextCursor: page.nextCursor }
        : { pageSize, hasMore: page.hasMore },
      freshness: {
        state: freshness,
        generatedAtUtc,
        ...(row.lastSuccessfulAdobeRefreshUtc !== undefined && {
          lastSuccessfulSourceReadAtUtc: row.lastSuccessfulAdobeRefreshUtc,
        }),
      },
    };
    return {
      mode: 'backend',
      sourceStatus: row.cachedSourceStatus,
      readOnly: true,
      warnings,
      generatedAtUtc,
      data,
    };
  }
}

function clampPageSize(requested: number | undefined, defaultSize: number): number {
  if (requested === undefined) return defaultSize;
  if (!Number.isFinite(requested) || !Number.isInteger(requested) || requested <= 0) {
    return defaultSize;
  }
  return Math.min(requested, 100);
}

function collectActionQueueItems(
  rows: readonly AdobeSignAgreementProjectionRow[],
): readonly NonNullable<AdobeSignAgreementProjectionRow['previewItem']>[] {
  const items: NonNullable<AdobeSignAgreementProjectionRow['previewItem']>[] = [];
  for (const row of rows) {
    if (row.previewItem) items.push(row.previewItem);
  }
  return items;
}

function collectRecentCompletionsItems(
  rows: readonly AdobeSignAgreementProjectionRow[],
): readonly MyWorkAdobeSignRecentCompletionsItem[] {
  // Recent-completions rows reuse the same PreviewItemJson shape; the worker
  // (Prompt 09) writes a `MyWorkAdobeSignRecentCompletionsItem` shape into
  // `PreviewItemJson` for rows with `ProjectionBucket='RecentCompletion'`.
  // From the repository's perspective, `previewItem` is opaque DTO data — we
  // narrow to the recent-completions shape here based on the row's bucket
  // (already filtered upstream).
  const items: MyWorkAdobeSignRecentCompletionsItem[] = [];
  for (const row of rows) {
    if (row.previewItem) {
      items.push(row.previewItem as unknown as MyWorkAdobeSignRecentCompletionsItem);
    }
  }
  return items;
}
