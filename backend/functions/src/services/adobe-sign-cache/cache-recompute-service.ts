/**
 * My Dashboard | Adobe Sign cache — recompute / upsert / soft-deactivate
 * service (B05.15 Prompt 09).
 *
 * Pure orchestrator that converts authoritative Adobe Sign refresh
 * results (action-queue + recent-completions envelopes from the existing
 * live adapters) into SharePoint projection cache state. Two flows:
 *
 *   - `recomputeAfterUserWideRefresh` — full refresh; upsert every
 *     returned row + soft-deactivate every prior-active row not in the
 *     new set + recompute UserCache preview/summary.
 *   - `recomputeAfterAgreementTargetedRefresh` — single-agreement
 *     refresh; classify the outcome (still-pending / now-completed /
 *     no-longer-visible / mapping-ambiguous) and apply targeted writes.
 *
 * Failure preservation (package §7): a degraded refresh (sourceStatus
 * !== 'available') NEVER blanks cached content. Only sync-metadata
 * fields + freshness state on the UserCache row update.
 *
 * Signing/action URL prohibition: input DTOs carry only the policy-
 * approved `sourceOpenUrl`. No signing URL / action URL is ever written.
 *
 * @module services/adobe-sign-cache/cache-recompute-service
 */

import type {
  MyWorkAdobeSignActionQueueItem,
  MyWorkAdobeSignActionQueueReadModel,
  MyWorkAdobeSignActionQueueSummary,
  MyWorkAdobeSignRecentCompletionsItem,
  MyWorkAdobeSignRecentCompletionsReadModel,
  MyWorkAdobeSignRecentCompletionsSummary,
  MyWorkReadModelEnvelope,
} from '@hbc/models/myWork';

import type {
  AdobeSignCacheFreshnessState,
  AdobeSignCacheSyncOutcome,
} from './cache-list-descriptors.js';
import type {
  AdobeSignAgreementProjectionRow,
  AdobeSignAgreementProjectionUpsertInput,
  IAdobeSignAgreementProjectionCacheRepository,
} from './repositories/agreement-projection-cache-repository.js';
import type {
  AdobeSignUserCacheRow,
  AdobeSignUserCacheUpsertInput,
  IAdobeSignUserCacheRepository,
} from './repositories/user-cache-repository.js';
import { ADOBE_SIGN_CACHE_USER_CACHE_SCHEMA_VERSION } from './repositories/cache-snapshot-codec.js';
import {
  computeAdobeSignCacheProjectionKey,
  deriveRecipientActionKeyForActionQueue,
  deriveRecipientActionKeyForRecentCompletion,
  RECIPIENT_ACTION_KEY_DEFAULT,
} from './projection-key.js';

const PREVIEW_LIMIT = 5;
const CACHE_SCHEMA_VERSION = ADOBE_SIGN_CACHE_USER_CACHE_SCHEMA_VERSION;

export interface AdobeSignCacheRecomputeServiceOptions {
  readonly userCacheRepository: IAdobeSignUserCacheRepository;
  readonly agreementProjectionCacheRepository: IAdobeSignAgreementProjectionCacheRepository;
  /** Override only for tests that need to bound recompute time. */
  readonly now?: () => Date;
  /** Page size used when scanning existing active projections for soft-deactivation. */
  readonly listPageSize?: number;
}

export interface AdobeSignCacheUserWideRecomputeInput {
  readonly adobeActorKey: string;
  readonly userPrincipalNameNormalized?: string;
  readonly actionQueueEnvelope: MyWorkReadModelEnvelope<MyWorkAdobeSignActionQueueReadModel>;
  readonly recentCompletionsEnvelope: MyWorkReadModelEnvelope<MyWorkAdobeSignRecentCompletionsReadModel>;
  readonly refreshedAtUtc: string;
  readonly correlationId: string;
  /**
   * Stamp on the UserCache row when at least one envelope is degraded.
   * Defaults to `'Unknown'`. Worker (Prompt 08) supplies `'Aging'` /
   * `'Stale'` based on the last-success timestamp.
   */
  readonly nextFreshnessOnFailurePreservation?: AdobeSignCacheFreshnessState;
}

export interface AdobeSignCacheAgreementTargetedRecomputeInput {
  readonly adobeActorKey: string;
  readonly agreementId: string;
  readonly userPrincipalNameNormalized?: string;
  readonly refreshedAtUtc: string;
  readonly correlationId: string;
  readonly outcome:
    | { readonly kind: 'still-pending'; readonly item: MyWorkAdobeSignActionQueueItem }
    | { readonly kind: 'now-completed'; readonly item: MyWorkAdobeSignRecentCompletionsItem }
    | { readonly kind: 'no-longer-visible' }
    | { readonly kind: 'mapping-ambiguous' };
}

export type AdobeSignCacheUserWideRecomputeResult =
  | {
      readonly status: 'recomputed';
      readonly rowsUpserted: number;
      readonly rowsSoftDeactivated: number;
      readonly pendingActionCount: number;
      readonly recentCompletionCount: number;
      readonly freshnessState: AdobeSignCacheFreshnessState;
    }
  | {
      readonly status: 'failure-preserved';
      readonly reason: 'action-queue-degraded' | 'recent-completions-degraded';
      readonly cachedSourceStatus:
        | MyWorkReadModelEnvelope<unknown>['sourceStatus'];
      readonly freshnessState: AdobeSignCacheFreshnessState;
    };

export type AdobeSignCacheAgreementTargetedRecomputeResult =
  | {
      readonly status: 'recomputed';
      readonly rowsUpserted: number;
      readonly rowsSoftDeactivated: number;
      readonly pendingActionCount: number;
      readonly recentCompletionCount: number;
    }
  | {
      readonly status: 'fallback-required';
      readonly reason: 'mapping-ambiguous';
    };

interface UpsertPlanEntry {
  readonly projectionKey: string;
  readonly upsertInput: AdobeSignAgreementProjectionUpsertInput;
}

function isAvailable(
  envelope: MyWorkReadModelEnvelope<unknown>,
): envelope is MyWorkReadModelEnvelope<unknown> & { readonly sourceStatus: 'available' } {
  return envelope.sourceStatus === 'available';
}

/**
 * Map an action-queue item to its projection upsert payload. The
 * `MyWorkAdobeSignActionQueueItem.actionHandoff` discriminated union
 * carries posture + reason; both are passed through to the cache row.
 * SourceOpenUrl is policy-approved and DTO-visible — passed through
 * verbatim. No signing/action URL is ever copied (the input DTO doesn't
 * carry one).
 */
export function mapActionQueueItemToProjectionUpsertInput(input: {
  readonly adobeActorKey: string;
  readonly userPrincipalNameNormalized?: string;
  readonly item: MyWorkAdobeSignActionQueueItem;
  readonly refreshedAtUtc: string;
}): AdobeSignAgreementProjectionUpsertInput {
  const recipientActionKey = deriveRecipientActionKeyForActionQueue(input.item);
  const projectionKey = computeAdobeSignCacheProjectionKey({
    adobeActorKey: input.adobeActorKey,
    agreementId: input.item.agreementId,
    recipientActionKey,
  });
  const posture = input.item.actionHandoff.posture;
  const actionHandoffPosture =
    posture === 'resolve-on-click'
      ? 'ResolveOnClick'
      : posture === 'view-only'
        ? 'ViewOnly'
        : 'Unavailable';
  return {
    projectionKey,
    adobeActorKey: input.adobeActorKey,
    ...(input.userPrincipalNameNormalized !== undefined && {
      userPrincipalNameNormalized: input.userPrincipalNameNormalized,
    }),
    agreementId: input.item.agreementId,
    recipientActionKey,
    projectionBucket: 'PendingAction',
    agreementName: input.item.agreementName,
    ...(input.item.adobeRecipientStatus !== undefined && {
      agreementStatus: input.item.adobeRecipientStatus,
    }),
    requiredAction: input.item.requiredAction,
    adobeRecipientStatus: input.item.adobeRecipientStatus,
    actionHandoffPosture,
    actionHandoffReason: input.item.actionHandoff.reason,
    ...(input.item.sourceOpenUrl !== undefined && { sourceOpenUrl: input.item.sourceOpenUrl }),
    ...(input.item.sender?.displayName !== undefined && {
      senderDisplayName: input.item.sender.displayName,
    }),
    ...(input.item.sender?.emailAddress !== undefined && {
      senderEmail: input.item.sender.emailAddress,
    }),
    ...(input.item.createdAtUtc !== undefined && { createdAtAdobeUtc: input.item.createdAtUtc }),
    ...(input.item.modifiedAtUtc !== undefined && { modifiedAtAdobeUtc: input.item.modifiedAtUtc }),
    ...(input.item.expirationAtUtc !== undefined && {
      expirationAtAdobeUtc: input.item.expirationAtUtc,
    }),
    sortDateUtc: input.item.modifiedAtUtc ?? input.item.createdAtUtc ?? input.refreshedAtUtc,
    isActiveProjection: true,
    freshnessState: 'Fresh',
    lastSuccessfulAdobeRefreshUtc: input.refreshedAtUtc,
    lastSyncOutcome: 'Success',
    previewItem: input.item,
    cacheSchemaVersion: CACHE_SCHEMA_VERSION,
  };
}

/**
 * Map a recent-completion item to its projection upsert payload. The
 * recipient-action discriminator is always `__DEFAULT__` — completions
 * are agreement-grain.
 */
export function mapRecentCompletionItemToProjectionUpsertInput(input: {
  readonly adobeActorKey: string;
  readonly userPrincipalNameNormalized?: string;
  readonly item: MyWorkAdobeSignRecentCompletionsItem;
  readonly refreshedAtUtc: string;
}): AdobeSignAgreementProjectionUpsertInput {
  const recipientActionKey = deriveRecipientActionKeyForRecentCompletion(input.item);
  const projectionKey = computeAdobeSignCacheProjectionKey({
    adobeActorKey: input.adobeActorKey,
    agreementId: input.item.agreementId,
    recipientActionKey,
  });
  // Recent-completions items reuse the action-queue preview-item DTO
  // shape from the agreement projection-cache repo's standpoint
  // (the repo treats `previewItem` as opaque JSON). The cache provider
  // narrows back to the completion-specific shape on read (Prompt 04).
  return {
    projectionKey,
    adobeActorKey: input.adobeActorKey,
    ...(input.userPrincipalNameNormalized !== undefined && {
      userPrincipalNameNormalized: input.userPrincipalNameNormalized,
    }),
    agreementId: input.item.agreementId,
    recipientActionKey,
    projectionBucket: 'RecentCompletion',
    agreementName: input.item.agreementName,
    agreementStatus: input.item.agreementStatus,
    ...(input.item.sourceOpenUrl !== undefined && { sourceOpenUrl: input.item.sourceOpenUrl }),
    ...(input.item.sender?.displayName !== undefined && {
      senderDisplayName: input.item.sender.displayName,
    }),
    ...(input.item.sender?.emailAddress !== undefined && {
      senderEmail: input.item.sender.emailAddress,
    }),
    ...(input.item.completedAtUtc !== undefined && {
      completedAtAdobeUtc: input.item.completedAtUtc,
    }),
    ...(input.item.modifiedAtUtc !== undefined && { modifiedAtAdobeUtc: input.item.modifiedAtUtc }),
    sortDateUtc: input.item.completedAtUtc ?? input.item.modifiedAtUtc ?? input.refreshedAtUtc,
    isActiveProjection: true,
    freshnessState: 'Fresh',
    lastSuccessfulAdobeRefreshUtc: input.refreshedAtUtc,
    lastSyncOutcome: 'Success',
    previewItem:
      input.item as unknown as AdobeSignAgreementProjectionUpsertInput['previewItem'],
    cacheSchemaVersion: CACHE_SCHEMA_VERSION,
  };
}

function buildUserCacheUpsertInput(input: {
  readonly adobeActorKey: string;
  readonly userPrincipalNameNormalized?: string;
  readonly actionQueueSummary: MyWorkAdobeSignActionQueueSummary;
  readonly actionQueuePreview: readonly MyWorkAdobeSignActionQueueItem[];
  readonly recentCompletionsSummary: MyWorkAdobeSignRecentCompletionsSummary;
  readonly recentCompletionsPreview: readonly MyWorkAdobeSignRecentCompletionsItem[];
  readonly refreshedAtUtc: string;
  readonly freshnessState: AdobeSignCacheFreshnessState;
  readonly lastSyncOutcome: AdobeSignCacheSyncOutcome;
  readonly lastSyncFailureCode?: string;
  readonly lastSyncFailureSummary?: string;
  readonly projectionRevisionBase: number;
}): AdobeSignUserCacheUpsertInput {
  return {
    adobeActorKey: input.adobeActorKey,
    ...(input.userPrincipalNameNormalized !== undefined && {
      userPrincipalNameNormalized: input.userPrincipalNameNormalized,
    }),
    isActive: true,
    cacheHydrationState: 'Ready',
    cachedSourceStatus: input.lastSyncOutcome === 'Success' ? 'available' : 'partial',
    freshnessState: input.freshnessState,
    pendingActionCount: input.actionQueueSummary.totalActionItemCount,
    recentCompletionCount: input.recentCompletionsSummary.completedAgreementCount,
    ...(input.lastSyncOutcome === 'Success' && {
      lastSuccessfulAdobeRefreshUtc: input.refreshedAtUtc,
    }),
    lastReconciliationRefreshUtc: input.refreshedAtUtc,
    lastSyncOutcome: input.lastSyncOutcome,
    ...(input.lastSyncFailureCode !== undefined && {
      lastSyncFailureCode: input.lastSyncFailureCode,
    }),
    ...(input.lastSyncFailureSummary !== undefined && {
      lastSyncFailureSummary: input.lastSyncFailureSummary,
    }),
    cacheSchemaVersion: CACHE_SCHEMA_VERSION,
    projectionRevision: input.projectionRevisionBase + 1,
    snapshots: {
      actionQueuePreview: input.actionQueuePreview.slice(0, PREVIEW_LIMIT),
      actionQueueSummary: input.actionQueueSummary,
      actionQueueWarnings: [],
      recentCompletionsPreview: input.recentCompletionsPreview.slice(0, PREVIEW_LIMIT),
      recentCompletionsSummary: input.recentCompletionsSummary,
      recentCompletionsWarnings: [],
    },
  };
}

/**
 * Read every active row for a given (actor, bucket) pair, paging
 * through `listActiveByActorAndBucket` until exhausted.
 */
async function readAllActiveByBucket(
  repo: IAdobeSignAgreementProjectionCacheRepository,
  adobeActorKey: string,
  projectionBucket: 'PendingAction' | 'RecentCompletion',
  pageSize: number,
): Promise<readonly AdobeSignAgreementProjectionRow[]> {
  const rows: AdobeSignAgreementProjectionRow[] = [];
  let cursor: string | undefined;
  do {
    const page = await repo.listActiveByActorAndBucket({
      adobeActorKey,
      projectionBucket,
      pageSize,
      ...(cursor !== undefined && { cursor }),
    });
    rows.push(...page.rows);
    cursor = page.nextCursor;
  } while (cursor !== undefined);
  return rows;
}

export class AdobeSignCacheRecomputeService {
  private readonly userCacheRepository: IAdobeSignUserCacheRepository;
  private readonly agreementProjectionCacheRepository: IAdobeSignAgreementProjectionCacheRepository;
  private readonly now: () => Date;
  private readonly listPageSize: number;

  constructor(options: AdobeSignCacheRecomputeServiceOptions) {
    this.userCacheRepository = options.userCacheRepository;
    this.agreementProjectionCacheRepository = options.agreementProjectionCacheRepository;
    this.now = options.now ?? (() => new Date());
    this.listPageSize = options.listPageSize ?? 100;
  }

  async recomputeAfterUserWideRefresh(
    input: AdobeSignCacheUserWideRecomputeInput,
  ): Promise<AdobeSignCacheUserWideRecomputeResult> {
    // Failure-preservation gate (package §7).
    if (!isAvailable(input.actionQueueEnvelope) || !isAvailable(input.recentCompletionsEnvelope)) {
      const reason = !isAvailable(input.actionQueueEnvelope)
        ? 'action-queue-degraded'
        : 'recent-completions-degraded';
      const cachedSourceStatus = !isAvailable(input.actionQueueEnvelope)
        ? input.actionQueueEnvelope.sourceStatus
        : input.recentCompletionsEnvelope.sourceStatus;
      const nextFreshness = input.nextFreshnessOnFailurePreservation ?? 'Unknown';
      const prior = await this.userCacheRepository.findByAdobeActorKey(input.adobeActorKey);
      if (prior.outcome === 'found') {
        const failureUpsert: AdobeSignUserCacheUpsertInput = {
          adobeActorKey: input.adobeActorKey,
          ...(input.userPrincipalNameNormalized !== undefined && {
            userPrincipalNameNormalized: input.userPrincipalNameNormalized,
          }),
          isActive: prior.row.isActive,
          cacheHydrationState: prior.row.cacheHydrationState,
          cachedSourceStatus: cachedSourceStatus,
          freshnessState: nextFreshness,
          pendingActionCount: prior.row.pendingActionCount,
          recentCompletionCount: prior.row.recentCompletionCount,
          ...(prior.row.lastSuccessfulAdobeRefreshUtc !== undefined && {
            lastSuccessfulAdobeRefreshUtc: prior.row.lastSuccessfulAdobeRefreshUtc,
          }),
          lastReconciliationRefreshUtc: input.refreshedAtUtc,
          lastSyncOutcome: 'Failure',
          lastSyncFailureCode: reason,
          lastSyncFailureSummary: `Refresh degraded: ${cachedSourceStatus}`,
          cacheSchemaVersion: prior.row.cacheSchemaVersion,
          projectionRevision: prior.row.projectionRevision,
          snapshots: prior.row.snapshots,
        };
        await this.userCacheRepository.upsert(failureUpsert);
      }
      return {
        status: 'failure-preserved',
        reason,
        cachedSourceStatus,
        freshnessState: nextFreshness,
      };
    }

    // Build the new authoritative set.
    const upsertPlan: UpsertPlanEntry[] = [];
    for (const item of input.actionQueueEnvelope.data.items) {
      const upsertInput = mapActionQueueItemToProjectionUpsertInput({
        adobeActorKey: input.adobeActorKey,
        ...(input.userPrincipalNameNormalized !== undefined && {
          userPrincipalNameNormalized: input.userPrincipalNameNormalized,
        }),
        item,
        refreshedAtUtc: input.refreshedAtUtc,
      });
      upsertPlan.push({ projectionKey: upsertInput.projectionKey, upsertInput });
    }
    for (const item of input.recentCompletionsEnvelope.data.items) {
      const upsertInput = mapRecentCompletionItemToProjectionUpsertInput({
        adobeActorKey: input.adobeActorKey,
        ...(input.userPrincipalNameNormalized !== undefined && {
          userPrincipalNameNormalized: input.userPrincipalNameNormalized,
        }),
        item,
        refreshedAtUtc: input.refreshedAtUtc,
      });
      upsertPlan.push({ projectionKey: upsertInput.projectionKey, upsertInput });
    }
    const newProjectionKeys = new Set(upsertPlan.map((p) => p.projectionKey));

    // Soft-deactivate prior-active rows not in the new set.
    const [activePending, activeCompletions] = await Promise.all([
      readAllActiveByBucket(
        this.agreementProjectionCacheRepository,
        input.adobeActorKey,
        'PendingAction',
        this.listPageSize,
      ),
      readAllActiveByBucket(
        this.agreementProjectionCacheRepository,
        input.adobeActorKey,
        'RecentCompletion',
        this.listPageSize,
      ),
    ]);
    const allPriorActive = [...activePending, ...activeCompletions];
    let rowsSoftDeactivated = 0;
    for (const row of allPriorActive) {
      if (!newProjectionKeys.has(row.projectionKey)) {
        const result = await this.agreementProjectionCacheRepository.softDeactivate(
          row.projectionKey,
          input.refreshedAtUtc,
        );
        if (result.deactivated) rowsSoftDeactivated += 1;
      }
    }

    // Upsert the new authoritative set.
    for (const entry of upsertPlan) {
      await this.agreementProjectionCacheRepository.upsert(entry.upsertInput);
    }

    // Recompute the UserCache row.
    const priorUserCache = await this.userCacheRepository.findByAdobeActorKey(input.adobeActorKey);
    const projectionRevisionBase =
      priorUserCache.outcome === 'found' ? priorUserCache.row.projectionRevision : 0;
    await this.userCacheRepository.upsert(
      buildUserCacheUpsertInput({
        adobeActorKey: input.adobeActorKey,
        ...(input.userPrincipalNameNormalized !== undefined && {
          userPrincipalNameNormalized: input.userPrincipalNameNormalized,
        }),
        actionQueueSummary: input.actionQueueEnvelope.data.summary,
        actionQueuePreview: input.actionQueueEnvelope.data.items,
        recentCompletionsSummary: input.recentCompletionsEnvelope.data.summary,
        recentCompletionsPreview: input.recentCompletionsEnvelope.data.items,
        refreshedAtUtc: input.refreshedAtUtc,
        freshnessState: 'Fresh',
        lastSyncOutcome: 'Success',
        projectionRevisionBase,
      }),
    );

    return {
      status: 'recomputed',
      rowsUpserted: upsertPlan.length,
      rowsSoftDeactivated,
      pendingActionCount: input.actionQueueEnvelope.data.summary.totalActionItemCount,
      recentCompletionCount:
        input.recentCompletionsEnvelope.data.summary.completedAgreementCount,
      freshnessState: 'Fresh',
    };
  }

  async recomputeAfterAgreementTargetedRefresh(
    input: AdobeSignCacheAgreementTargetedRecomputeInput,
  ): Promise<AdobeSignCacheAgreementTargetedRecomputeResult> {
    if (input.outcome.kind === 'mapping-ambiguous') {
      return { status: 'fallback-required', reason: 'mapping-ambiguous' };
    }

    let rowsUpserted = 0;
    let rowsSoftDeactivated = 0;

    // Read existing active rows for (actor, agreementId) — needed for
    // every targeted-outcome kind to scope soft-deactivation correctly.
    const activePending = await readAllActiveByBucket(
      this.agreementProjectionCacheRepository,
      input.adobeActorKey,
      'PendingAction',
      this.listPageSize,
    );
    const activeCompletions = await readAllActiveByBucket(
      this.agreementProjectionCacheRepository,
      input.adobeActorKey,
      'RecentCompletion',
      this.listPageSize,
    );
    const activeForAgreement = [...activePending, ...activeCompletions].filter(
      (r) => r.agreementId === input.agreementId,
    );

    if (input.outcome.kind === 'still-pending') {
      const upsertInput = mapActionQueueItemToProjectionUpsertInput({
        adobeActorKey: input.adobeActorKey,
        ...(input.userPrincipalNameNormalized !== undefined && {
          userPrincipalNameNormalized: input.userPrincipalNameNormalized,
        }),
        item: input.outcome.item,
        refreshedAtUtc: input.refreshedAtUtc,
      });
      await this.agreementProjectionCacheRepository.upsert(upsertInput);
      rowsUpserted = 1;
      for (const row of activeForAgreement) {
        if (row.projectionKey !== upsertInput.projectionKey) {
          const result = await this.agreementProjectionCacheRepository.softDeactivate(
            row.projectionKey,
            input.refreshedAtUtc,
          );
          if (result.deactivated) rowsSoftDeactivated += 1;
        }
      }
    } else if (input.outcome.kind === 'now-completed') {
      const upsertInput = mapRecentCompletionItemToProjectionUpsertInput({
        adobeActorKey: input.adobeActorKey,
        ...(input.userPrincipalNameNormalized !== undefined && {
          userPrincipalNameNormalized: input.userPrincipalNameNormalized,
        }),
        item: input.outcome.item,
        refreshedAtUtc: input.refreshedAtUtc,
      });
      await this.agreementProjectionCacheRepository.upsert(upsertInput);
      rowsUpserted = 1;
      for (const row of activeForAgreement) {
        if (row.projectionKey !== upsertInput.projectionKey) {
          const result = await this.agreementProjectionCacheRepository.softDeactivate(
            row.projectionKey,
            input.refreshedAtUtc,
          );
          if (result.deactivated) rowsSoftDeactivated += 1;
        }
      }
    } else {
      // no-longer-visible: deactivate every active row for this agreement.
      for (const row of activeForAgreement) {
        const result = await this.agreementProjectionCacheRepository.softDeactivate(
          row.projectionKey,
          input.refreshedAtUtc,
        );
        if (result.deactivated) rowsSoftDeactivated += 1;
      }
    }

    // Recompute UserCache: read first-page active rows (top-5 each
    // bucket) + count totals across the (now-mutated) active set.
    const [postPending, postCompletions] = await Promise.all([
      this.agreementProjectionCacheRepository.listActiveByActorAndBucket({
        adobeActorKey: input.adobeActorKey,
        projectionBucket: 'PendingAction',
        pageSize: PREVIEW_LIMIT,
      }),
      this.agreementProjectionCacheRepository.listActiveByActorAndBucket({
        adobeActorKey: input.adobeActorKey,
        projectionBucket: 'RecentCompletion',
        pageSize: PREVIEW_LIMIT,
      }),
    ]);
    const totalsPending = await readAllActiveByBucket(
      this.agreementProjectionCacheRepository,
      input.adobeActorKey,
      'PendingAction',
      this.listPageSize,
    );
    const totalsCompletions = await readAllActiveByBucket(
      this.agreementProjectionCacheRepository,
      input.adobeActorKey,
      'RecentCompletion',
      this.listPageSize,
    );

    const actionQueuePreview = postPending.rows
      .map((r) => r.previewItem)
      .filter((p): p is MyWorkAdobeSignActionQueueItem => p !== null);
    const recentCompletionsPreview = postCompletions.rows
      .map(
        (r) =>
          (r.previewItem ?? null) as unknown as MyWorkAdobeSignRecentCompletionsItem | null,
      )
      .filter((p): p is MyWorkAdobeSignRecentCompletionsItem => p !== null);

    const actionQueueSummary: MyWorkAdobeSignActionQueueSummary = {
      countBasis: 'returned-items',
      totalActionItemCount: totalsPending.length,
      signatureCount: totalsPending.filter((r) => r.requiredAction === 'signature').length,
      approvalCount: totalsPending.filter((r) => r.requiredAction === 'approval').length,
      acceptanceCount: totalsPending.filter((r) => r.requiredAction === 'acceptance').length,
      acknowledgementCount: totalsPending.filter((r) => r.requiredAction === 'acknowledgement')
        .length,
      formFillingCount: totalsPending.filter((r) => r.requiredAction === 'form-filling').length,
      delegationCount: totalsPending.filter((r) => r.requiredAction === 'delegation').length,
      expiringSoonCount: 0,
    };
    const recentCompletionsSummary: MyWorkAdobeSignRecentCompletionsSummary = {
      countBasis: 'returned-items',
      completedAgreementCount: totalsCompletions.length,
      windowDays: 30,
    };

    const priorUserCache = await this.userCacheRepository.findByAdobeActorKey(input.adobeActorKey);
    const projectionRevisionBase =
      priorUserCache.outcome === 'found' ? priorUserCache.row.projectionRevision : 0;
    await this.userCacheRepository.upsert(
      buildUserCacheUpsertInput({
        adobeActorKey: input.adobeActorKey,
        ...(input.userPrincipalNameNormalized !== undefined && {
          userPrincipalNameNormalized: input.userPrincipalNameNormalized,
        }),
        actionQueueSummary,
        actionQueuePreview,
        recentCompletionsSummary,
        recentCompletionsPreview,
        refreshedAtUtc: input.refreshedAtUtc,
        freshnessState: 'Fresh',
        lastSyncOutcome: 'Success',
        projectionRevisionBase,
      }),
    );

    return {
      status: 'recomputed',
      rowsUpserted,
      rowsSoftDeactivated,
      pendingActionCount: totalsPending.length,
      recentCompletionCount: totalsCompletions.length,
    };
  }
}
