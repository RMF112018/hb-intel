import { describe, expect, it, vi } from 'vitest';

import type {
  MyWorkAdobeSignActionQueueItem,
  MyWorkAdobeSignActionQueueReadModel,
  MyWorkAdobeSignActionQueueSummary,
  MyWorkAdobeSignRecentCompletionsItem,
  MyWorkAdobeSignRecentCompletionsReadModel,
  MyWorkReadModelEnvelope,
  MyWorkReadModelSourceStatus,
} from '@hbc/models/myWork';

import {
  AdobeSignCacheRecomputeService,
  mapActionQueueItemToProjectionUpsertInput,
  mapRecentCompletionItemToProjectionUpsertInput,
  type AdobeSignCacheAgreementTargetedRecomputeInput,
  type AdobeSignCacheUserWideRecomputeInput,
} from '../adobe-sign-cache/cache-recompute-service.js';
import type {
  AdobeSignAgreementProjectionListInput,
  AdobeSignAgreementProjectionListPage,
  AdobeSignAgreementProjectionRow,
  IAdobeSignAgreementProjectionCacheRepository,
} from '../adobe-sign-cache/repositories/agreement-projection-cache-repository.js';
import type {
  AdobeSignUserCacheReadOutcome,
  AdobeSignUserCacheUpsertInput,
  IAdobeSignUserCacheRepository,
} from '../adobe-sign-cache/repositories/user-cache-repository.js';

const ACTOR = 'tenant-1::oid-avery';
const REFRESHED_AT = '2026-05-19T12:00:00.000Z';
const NOW = new Date(REFRESHED_AT);

function defaultSummary(total = 0): MyWorkAdobeSignActionQueueSummary {
  return {
    countBasis: 'returned-items',
    totalActionItemCount: total,
    signatureCount: total,
    approvalCount: 0,
    acceptanceCount: 0,
    acknowledgementCount: 0,
    formFillingCount: 0,
    delegationCount: 0,
    expiringSoonCount: 0,
  };
}

function actionItem(
  agreementId: string,
  overrides: Partial<MyWorkAdobeSignActionQueueItem> = {},
): MyWorkAdobeSignActionQueueItem {
  return {
    itemId: `adobe-sign:agreement-${agreementId}`,
    sourceSystem: 'adobe-sign',
    agreementId,
    agreementName: `Agreement ${agreementId}`,
    requiredAction: 'signature',
    actionHandoff: { posture: 'resolve-on-click', reason: 'eligible' },
    adobeRecipientStatus: 'WAITING_FOR_MY_SIGNATURE',
    ...overrides,
  };
}

function completionItem(
  agreementId: string,
  overrides: Partial<MyWorkAdobeSignRecentCompletionsItem> = {},
): MyWorkAdobeSignRecentCompletionsItem {
  return {
    itemId: `adobe-sign:agreement-${agreementId}`,
    sourceSystem: 'adobe-sign',
    agreementId,
    agreementName: `Agreement ${agreementId}`,
    agreementStatus: 'COMPLETED',
    completedAtUtc: '2026-05-18T10:00:00.000Z',
    ...overrides,
  };
}

function actionEnvelope(
  items: readonly MyWorkAdobeSignActionQueueItem[],
  sourceStatus: MyWorkReadModelSourceStatus = 'available',
): MyWorkReadModelEnvelope<MyWorkAdobeSignActionQueueReadModel> {
  return {
    mode: 'backend',
    sourceStatus,
    readOnly: true,
    warnings: [],
    generatedAtUtc: REFRESHED_AT,
    data: {
      moduleId: 'adobe-sign-action-queue',
      summary: { ...defaultSummary(items.length) },
      items,
      pagination: { pageSize: items.length, hasMore: false },
      freshness: { state: 'fresh', generatedAtUtc: REFRESHED_AT },
    },
  };
}

function completionEnvelope(
  items: readonly MyWorkAdobeSignRecentCompletionsItem[],
  sourceStatus: MyWorkReadModelSourceStatus = 'available',
): MyWorkReadModelEnvelope<MyWorkAdobeSignRecentCompletionsReadModel> {
  return {
    mode: 'backend',
    sourceStatus,
    readOnly: true,
    warnings: [],
    generatedAtUtc: REFRESHED_AT,
    data: {
      moduleId: 'adobe-sign-recent-completions',
      summary: {
        countBasis: 'returned-items',
        completedAgreementCount: items.length,
        windowDays: 30,
      },
      items,
      pagination: { pageSize: items.length, hasMore: false },
      freshness: { state: 'fresh', generatedAtUtc: REFRESHED_AT },
    },
  };
}

function projectionRowFromAction(
  item: MyWorkAdobeSignActionQueueItem,
): AdobeSignAgreementProjectionRow {
  return {
    listItemId: Math.floor(Math.random() * 100000),
    projectionKey: `${ACTOR}::${item.agreementId}::${item.requiredAction}`,
    adobeActorKey: ACTOR,
    agreementId: item.agreementId,
    recipientActionKey: item.requiredAction,
    projectionBucket: 'PendingAction',
    agreementName: item.agreementName,
    requiredAction: item.requiredAction,
    isActiveProjection: true,
    previewItem: item,
    cacheSchemaVersion: 1,
  };
}

function projectionRowFromCompletion(
  item: MyWorkAdobeSignRecentCompletionsItem,
): AdobeSignAgreementProjectionRow {
  return {
    listItemId: Math.floor(Math.random() * 100000),
    projectionKey: `${ACTOR}::${item.agreementId}::__DEFAULT__`,
    adobeActorKey: ACTOR,
    agreementId: item.agreementId,
    recipientActionKey: '__DEFAULT__',
    projectionBucket: 'RecentCompletion',
    agreementName: item.agreementName,
    isActiveProjection: true,
    previewItem: item as unknown as MyWorkAdobeSignActionQueueItem,
    cacheSchemaVersion: 1,
  };
}

function makeProjectionRepoWithActive(
  pending: readonly AdobeSignAgreementProjectionRow[] = [],
  completions: readonly AdobeSignAgreementProjectionRow[] = [],
): IAdobeSignAgreementProjectionCacheRepository & {
  upsertCalls: ReturnType<typeof vi.fn>;
  softDeactivateCalls: ReturnType<typeof vi.fn>;
} {
  const upsertCalls = vi.fn(async () => ({ listItemId: Math.floor(Math.random() * 100000) }));
  const softDeactivateCalls = vi.fn(async () => ({ deactivated: true }));
  const repo: IAdobeSignAgreementProjectionCacheRepository = {
    async listActiveByActorAndBucket(
      input: AdobeSignAgreementProjectionListInput,
    ): Promise<AdobeSignAgreementProjectionListPage> {
      const rows =
        input.projectionBucket === 'PendingAction'
          ? pending
          : input.projectionBucket === 'RecentCompletion'
            ? completions
            : [];
      return { rows: rows.slice(0, input.pageSize), hasMore: false };
    },
    async findByProjectionKey(): Promise<AdobeSignAgreementProjectionRow | null> {
      return null;
    },
    upsert: upsertCalls,
    softDeactivate: softDeactivateCalls,
  };
  return Object.assign(repo, { upsertCalls, softDeactivateCalls });
}

function makeUserCacheRepo(
  prior: AdobeSignUserCacheReadOutcome = { outcome: 'missing' },
): IAdobeSignUserCacheRepository & {
  upsertCalls: ReturnType<typeof vi.fn>;
} {
  const upsertCalls = vi.fn(async () => ({ listItemId: 1 }));
  const repo: IAdobeSignUserCacheRepository = {
    async findByAdobeActorKey() {
      return prior;
    },
    upsert: upsertCalls,
    softDeactivateByAdobeActorKey: vi.fn(async () => ({ deactivated: false })),
  };
  return Object.assign(repo, { upsertCalls });
}

function service(
  projectionRepo: IAdobeSignAgreementProjectionCacheRepository,
  userCacheRepo: IAdobeSignUserCacheRepository,
): AdobeSignCacheRecomputeService {
  return new AdobeSignCacheRecomputeService({
    userCacheRepository: userCacheRepo,
    agreementProjectionCacheRepository: projectionRepo,
    now: () => NOW,
    listPageSize: 100,
  });
}

function userWideInput(
  actionItems: readonly MyWorkAdobeSignActionQueueItem[],
  completionItems: readonly MyWorkAdobeSignRecentCompletionsItem[] = [],
  override: Partial<AdobeSignCacheUserWideRecomputeInput> = {},
): AdobeSignCacheUserWideRecomputeInput {
  return {
    adobeActorKey: ACTOR,
    userPrincipalNameNormalized: 'avery@hbc.test',
    actionQueueEnvelope: actionEnvelope(actionItems),
    recentCompletionsEnvelope: completionEnvelope(completionItems),
    refreshedAtUtc: REFRESHED_AT,
    correlationId: 'corr-1',
    ...override,
  };
}

describe('AdobeSignCacheRecomputeService — user-wide recompute', () => {
  it('action→completion transition: deactivates the old PendingAction row and upserts the new RecentCompletion row', async () => {
    const priorPending = [projectionRowFromAction(actionItem('agr-1'))];
    const projectionRepo = makeProjectionRepoWithActive(priorPending, []);
    const userCacheRepo = makeUserCacheRepo();
    const result = await service(projectionRepo, userCacheRepo).recomputeAfterUserWideRefresh(
      userWideInput([], [completionItem('agr-1')]),
    );
    expect(result.status).toBe('recomputed');
    // Old pending row soft-deactivated, new completion row upserted.
    expect(projectionRepo.softDeactivateCalls).toHaveBeenCalledWith(
      `${ACTOR}::agr-1::signature`,
      REFRESHED_AT,
    );
    expect(projectionRepo.upsertCalls).toHaveBeenCalledTimes(1);
    const upsertedKey = projectionRepo.upsertCalls.mock.calls[0][0].projectionKey;
    expect(upsertedKey).toBe(`${ACTOR}::agr-1::__DEFAULT__`);
  });

  it('action disappearance: soft-deactivates the old row and writes no replacement', async () => {
    const priorPending = [projectionRowFromAction(actionItem('agr-1'))];
    const projectionRepo = makeProjectionRepoWithActive(priorPending, []);
    const userCacheRepo = makeUserCacheRepo();
    await service(projectionRepo, userCacheRepo).recomputeAfterUserWideRefresh(
      userWideInput([], []),
    );
    expect(projectionRepo.softDeactivateCalls).toHaveBeenCalledTimes(1);
    expect(projectionRepo.upsertCalls).not.toHaveBeenCalled();
  });

  it('failure preservation: degraded action-queue sourceStatus → no projection writes', async () => {
    const priorPending = [projectionRowFromAction(actionItem('agr-1'))];
    const projectionRepo = makeProjectionRepoWithActive(priorPending, []);
    const priorRow = {
      outcome: 'found' as const,
      row: {
        listItemId: 1,
        adobeActorKey: ACTOR,
        isActive: true,
        cacheHydrationState: 'Ready' as const,
        cachedSourceStatus: 'available' as MyWorkReadModelSourceStatus,
        freshnessState: 'Fresh' as const,
        pendingActionCount: 1,
        recentCompletionCount: 0,
        cacheSchemaVersion: 1,
        projectionRevision: 3,
        snapshots: {
          actionQueuePreview: [],
          actionQueueSummary: defaultSummary(1),
          actionQueueWarnings: [],
          recentCompletionsPreview: [],
          recentCompletionsSummary: {
            countBasis: 'returned-items' as const,
            completedAgreementCount: 0,
            windowDays: 30 as const,
          },
          recentCompletionsWarnings: [],
        },
      },
    };
    const userCacheRepo = makeUserCacheRepo(priorRow);
    const input: AdobeSignCacheUserWideRecomputeInput = {
      adobeActorKey: ACTOR,
      actionQueueEnvelope: actionEnvelope([], 'source-unavailable'),
      recentCompletionsEnvelope: completionEnvelope([]),
      refreshedAtUtc: REFRESHED_AT,
      correlationId: 'corr-1',
      nextFreshnessOnFailurePreservation: 'Aging',
    };
    const result = await service(projectionRepo, userCacheRepo).recomputeAfterUserWideRefresh(
      input,
    );
    expect(result.status).toBe('failure-preserved');
    if (result.status === 'failure-preserved') {
      expect(result.reason).toBe('action-queue-degraded');
      expect(result.cachedSourceStatus).toBe('source-unavailable');
      expect(result.freshnessState).toBe('Aging');
    }
    expect(projectionRepo.upsertCalls).not.toHaveBeenCalled();
    expect(projectionRepo.softDeactivateCalls).not.toHaveBeenCalled();
    // UserCache row touched with sync-metadata only (snapshots preserved).
    expect(userCacheRepo.upsertCalls).toHaveBeenCalledTimes(1);
    const upsert = userCacheRepo.upsertCalls.mock.calls[0][0] as AdobeSignUserCacheUpsertInput;
    expect(upsert.lastSyncOutcome).toBe('Failure');
    expect(upsert.freshnessState).toBe('Aging');
    expect(upsert.snapshots).toEqual(priorRow.row.snapshots);
  });

  it('top-five preview ordering: 7 items → preview holds first 5 in adapter-supplied order', async () => {
    const items = Array.from({ length: 7 }, (_, i) => actionItem(`agr-${i + 1}`));
    const projectionRepo = makeProjectionRepoWithActive([], []);
    const userCacheRepo = makeUserCacheRepo();
    await service(projectionRepo, userCacheRepo).recomputeAfterUserWideRefresh(
      userWideInput(items),
    );
    const upsert = userCacheRepo.upsertCalls.mock.calls[0][0] as AdobeSignUserCacheUpsertInput;
    expect(upsert.snapshots.actionQueuePreview).toHaveLength(5);
    expect(upsert.snapshots.actionQueuePreview.map((p) => p.agreementId)).toEqual([
      'agr-1',
      'agr-2',
      'agr-3',
      'agr-4',
      'agr-5',
    ]);
  });

  it('summary count correctness: persists envelope totals to UserCache', async () => {
    const projectionRepo = makeProjectionRepoWithActive([], []);
    const userCacheRepo = makeUserCacheRepo();
    await service(projectionRepo, userCacheRepo).recomputeAfterUserWideRefresh(
      userWideInput(
        [actionItem('agr-1'), actionItem('agr-2')],
        [completionItem('agr-3')],
      ),
    );
    const upsert = userCacheRepo.upsertCalls.mock.calls[0][0] as AdobeSignUserCacheUpsertInput;
    expect(upsert.pendingActionCount).toBe(2);
    expect(upsert.recentCompletionCount).toBe(1);
  });

  it('idempotency: running the same input twice → second run records zero soft-deactivations', async () => {
    // Simulate the second run: prior active rows match the new authoritative set exactly.
    const items = [actionItem('agr-1'), actionItem('agr-2')];
    const priorPending = items.map(projectionRowFromAction);
    const projectionRepo = makeProjectionRepoWithActive(priorPending, []);
    const userCacheRepo = makeUserCacheRepo();
    const result = await service(projectionRepo, userCacheRepo).recomputeAfterUserWideRefresh(
      userWideInput(items),
    );
    expect(result.status).toBe('recomputed');
    if (result.status === 'recomputed') {
      expect(result.rowsSoftDeactivated).toBe(0);
      expect(result.rowsUpserted).toBe(2);
    }
    expect(projectionRepo.softDeactivateCalls).not.toHaveBeenCalled();
  });

  it('multi-action-per-agreement: same agreementId + different requiredAction → two distinct projection rows', async () => {
    const projectionRepo = makeProjectionRepoWithActive([], []);
    const userCacheRepo = makeUserCacheRepo();
    await service(projectionRepo, userCacheRepo).recomputeAfterUserWideRefresh(
      userWideInput([
        actionItem('agr-1', { requiredAction: 'signature' }),
        actionItem('agr-1', {
          requiredAction: 'approval',
          adobeRecipientStatus: 'WAITING_FOR_MY_APPROVAL',
        }),
      ]),
    );
    const upsertedKeys = projectionRepo.upsertCalls.mock.calls.map(
      (call) => (call[0] as { projectionKey: string }).projectionKey,
    );
    expect(upsertedKeys).toEqual([
      `${ACTOR}::agr-1::signature`,
      `${ACTOR}::agr-1::approval`,
    ]);
  });

  it('no signing/action URL written: upsert payload only carries DTO-allowed sourceOpenUrl', async () => {
    const projectionRepo = makeProjectionRepoWithActive([], []);
    const userCacheRepo = makeUserCacheRepo();
    await service(projectionRepo, userCacheRepo).recomputeAfterUserWideRefresh(
      userWideInput([
        actionItem('agr-1', { sourceOpenUrl: 'https://example.com/view/agr-1' }),
      ]),
    );
    const upsert = projectionRepo.upsertCalls.mock.calls[0][0] as Record<string, unknown>;
    expect(upsert).not.toHaveProperty('signingUrl');
    expect(upsert).not.toHaveProperty('actionUrl');
    expect(upsert.sourceOpenUrl).toBe('https://example.com/view/agr-1');
  });

  it('completion projection key uses __DEFAULT__ recipient-action-key', async () => {
    const projectionRepo = makeProjectionRepoWithActive([], []);
    const userCacheRepo = makeUserCacheRepo();
    await service(projectionRepo, userCacheRepo).recomputeAfterUserWideRefresh(
      userWideInput([], [completionItem('agr-9')]),
    );
    const upserted = projectionRepo.upsertCalls.mock.calls[0][0] as { projectionKey: string };
    expect(upserted.projectionKey).toBe(`${ACTOR}::agr-9::__DEFAULT__`);
  });
});

describe('AdobeSignCacheRecomputeService — agreement-targeted recompute', () => {
  function targetedInput(
    outcome: AdobeSignCacheAgreementTargetedRecomputeInput['outcome'],
    agreementId = 'agr-1',
  ): AdobeSignCacheAgreementTargetedRecomputeInput {
    return {
      adobeActorKey: ACTOR,
      agreementId,
      userPrincipalNameNormalized: 'avery@hbc.test',
      refreshedAtUtc: REFRESHED_AT,
      correlationId: 'corr-1',
      outcome,
    };
  }

  it('still-pending: upserts one PendingAction row + deactivates any prior other-key active rows for the agreement', async () => {
    // Prior: agreement was waiting on signature; now waiting on approval.
    const priorPending = [
      projectionRowFromAction(actionItem('agr-1', { requiredAction: 'signature' })),
    ];
    const projectionRepo = makeProjectionRepoWithActive(priorPending, []);
    const userCacheRepo = makeUserCacheRepo();
    await service(projectionRepo, userCacheRepo).recomputeAfterAgreementTargetedRefresh(
      targetedInput({
        kind: 'still-pending',
        item: actionItem('agr-1', {
          requiredAction: 'approval',
          adobeRecipientStatus: 'WAITING_FOR_MY_APPROVAL',
        }),
      }),
    );
    expect(projectionRepo.upsertCalls).toHaveBeenCalledTimes(1);
    expect(projectionRepo.softDeactivateCalls).toHaveBeenCalledWith(
      `${ACTOR}::agr-1::signature`,
      REFRESHED_AT,
    );
  });

  it('now-completed: deactivates every active row for the agreement and upserts the completion', async () => {
    const priorPending = [projectionRowFromAction(actionItem('agr-1'))];
    const projectionRepo = makeProjectionRepoWithActive(priorPending, []);
    const userCacheRepo = makeUserCacheRepo();
    await service(projectionRepo, userCacheRepo).recomputeAfterAgreementTargetedRefresh(
      targetedInput({
        kind: 'now-completed',
        item: completionItem('agr-1'),
      }),
    );
    expect(projectionRepo.upsertCalls).toHaveBeenCalledTimes(1);
    const upserted = projectionRepo.upsertCalls.mock.calls[0][0] as { projectionKey: string };
    expect(upserted.projectionKey).toBe(`${ACTOR}::agr-1::__DEFAULT__`);
    expect(projectionRepo.softDeactivateCalls).toHaveBeenCalledWith(
      `${ACTOR}::agr-1::signature`,
      REFRESHED_AT,
    );
  });

  it('no-longer-visible: deactivates every active row for the agreement; no upserts', async () => {
    const priorPending = [
      projectionRowFromAction(actionItem('agr-1')),
      projectionRowFromAction(actionItem('agr-2')),
    ];
    const projectionRepo = makeProjectionRepoWithActive(priorPending, []);
    const userCacheRepo = makeUserCacheRepo();
    await service(projectionRepo, userCacheRepo).recomputeAfterAgreementTargetedRefresh(
      targetedInput({ kind: 'no-longer-visible' }, 'agr-1'),
    );
    // Only agr-1 deactivated; agr-2 left alone (different agreement).
    expect(projectionRepo.softDeactivateCalls).toHaveBeenCalledTimes(1);
    expect(projectionRepo.softDeactivateCalls).toHaveBeenCalledWith(
      `${ACTOR}::agr-1::signature`,
      REFRESHED_AT,
    );
    expect(projectionRepo.upsertCalls).not.toHaveBeenCalled();
  });

  it('mapping-ambiguous: returns fallback-required with no writes', async () => {
    const projectionRepo = makeProjectionRepoWithActive([], []);
    const userCacheRepo = makeUserCacheRepo();
    const result = await service(
      projectionRepo,
      userCacheRepo,
    ).recomputeAfterAgreementTargetedRefresh(
      targetedInput({ kind: 'mapping-ambiguous' }),
    );
    expect(result.status).toBe('fallback-required');
    if (result.status === 'fallback-required') {
      expect(result.reason).toBe('mapping-ambiguous');
    }
    expect(projectionRepo.upsertCalls).not.toHaveBeenCalled();
    expect(projectionRepo.softDeactivateCalls).not.toHaveBeenCalled();
    expect(userCacheRepo.upsertCalls).not.toHaveBeenCalled();
  });
});

describe('pure mappers: mapActionQueueItemToProjectionUpsertInput', () => {
  it('maps actionHandoff.posture → ActionHandoffPosture closed enum', () => {
    const upsert = mapActionQueueItemToProjectionUpsertInput({
      adobeActorKey: ACTOR,
      item: actionItem('agr-1', { actionHandoff: { posture: 'view-only', reason: 'missing-agreement-id' } }),
      refreshedAtUtc: REFRESHED_AT,
    });
    expect(upsert.actionHandoffPosture).toBe('ViewOnly');
  });

  it('passes a non-empty sourceOpenUrl through and omits the field when undefined', () => {
    const withUrl = mapActionQueueItemToProjectionUpsertInput({
      adobeActorKey: ACTOR,
      item: actionItem('agr-1', { sourceOpenUrl: 'https://example.com/view/agr-1' }),
      refreshedAtUtc: REFRESHED_AT,
    });
    expect(withUrl.sourceOpenUrl).toBe('https://example.com/view/agr-1');
    const without = mapActionQueueItemToProjectionUpsertInput({
      adobeActorKey: ACTOR,
      item: actionItem('agr-1'),
      refreshedAtUtc: REFRESHED_AT,
    });
    expect(without).not.toHaveProperty('sourceOpenUrl');
  });
});

describe('pure mappers: mapRecentCompletionItemToProjectionUpsertInput', () => {
  it('uses __DEFAULT__ recipient-action-key + RecentCompletion bucket', () => {
    const upsert = mapRecentCompletionItemToProjectionUpsertInput({
      adobeActorKey: ACTOR,
      item: completionItem('agr-9'),
      refreshedAtUtc: REFRESHED_AT,
    });
    expect(upsert.recipientActionKey).toBe('__DEFAULT__');
    expect(upsert.projectionBucket).toBe('RecentCompletion');
    expect(upsert.projectionKey).toBe(`${ACTOR}::agr-9::__DEFAULT__`);
  });
});
