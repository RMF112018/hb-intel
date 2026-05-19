import { describe, expect, it, vi } from 'vitest';

import type {
  MyWorkAdobeSignActionQueueItem,
  MyWorkAdobeSignActionQueueSummary,
  MyWorkAdobeSignRecentCompletionsItem,
  MyWorkAdobeSignRecentCompletionsSummary,
} from '@hbc/models/myWork';

import type {
  AdobeSignCacheFreshnessState,
  AdobeSignCacheProjectionBucket,
} from '../../../services/adobe-sign-cache/cache-list-descriptors.js';
import type {
  AdobeSignAgreementProjectionListInput,
  AdobeSignAgreementProjectionListPage,
  AdobeSignAgreementProjectionRow,
  IAdobeSignAgreementProjectionCacheRepository,
} from '../../../services/adobe-sign-cache/repositories/agreement-projection-cache-repository.js';
import type {
  AdobeSignUserCacheReadOutcome,
  AdobeSignUserCacheRow,
  AdobeSignUserCacheSnapshotsPayload,
  IAdobeSignUserCacheRepository,
} from '../../../services/adobe-sign-cache/repositories/user-cache-repository.js';
import type {
  AdobeSignActorKey,
  AdobeSignDelegatedActor,
} from './adobe-sign/adobe-sign-actor-normalizer.js';
import type { AdobeSignPrincipalResolutionResult } from './adobe-sign/adobe-sign-principal-resolution.js';
import type { AdobeSignPrincipalResolver } from './adobe-sign/adobe-sign-principal-resolver.js';
import { MyWorkAdobeSignCacheReadModelProvider } from './my-work-adobe-sign-cache-read-model-provider.js';
import type { MyWorkReadContext } from './my-work-read-model-provider.js';

const FIXED_NOW = new Date('2026-05-19T12:00:00.000Z');

function makeContext(): MyWorkReadContext {
  return {
    actor: {
      displayName: 'Avery Operator',
      principalName: 'avery@hbc.test',
      hbcUserId: 'oid-avery',
    },
    requestId: 'req-fixture',
  };
}

function makeActor(): AdobeSignDelegatedActor {
  return {
    tenantId: 'tenant-1',
    oid: 'oid-avery',
    actorKey: 'tenant-1::oid-avery' as AdobeSignActorKey,
    displayName: 'Avery Operator',
    upn: 'avery@hbc.test',
  };
}

function resolvedPrincipal(): AdobeSignPrincipalResolutionResult {
  return {
    status: 'resolved',
    principal: {
      actor: makeActor(),
      adobeApiAccessPoint: 'https://api.example.com',
      adobeWebAccessPoint: 'https://web.example.com',
      grantedScopes: ['agreement_read'],
      grantState: 'active',
    },
    grantPublic: {
      grantState: 'active',
      grantedScopes: ['agreement_read'],
      revokedAtUtc: null,
      requiresReauthAtUtc: null,
      lastAuthorizedAtUtc: '2026-05-01T00:00:00.000Z',
    },
  };
}

function makeResolver(result: AdobeSignPrincipalResolutionResult): AdobeSignPrincipalResolver {
  return vi.fn(async (_context: MyWorkReadContext) => result) as unknown as AdobeSignPrincipalResolver;
}

function summary(total: number): MyWorkAdobeSignActionQueueSummary {
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

function completionsSummary(total: number): MyWorkAdobeSignRecentCompletionsSummary {
  return {
    countBasis: 'returned-items',
    completedAgreementCount: total,
    windowDays: 30,
  };
}

function snapshots(
  overrides: Partial<AdobeSignUserCacheSnapshotsPayload> = {},
): AdobeSignUserCacheSnapshotsPayload {
  return {
    actionQueuePreview: [],
    actionQueueSummary: summary(3),
    actionQueueWarnings: [],
    recentCompletionsPreview: [],
    recentCompletionsSummary: completionsSummary(2),
    recentCompletionsWarnings: [],
    ...overrides,
  };
}

function userCacheRow(
  overrides: Partial<AdobeSignUserCacheRow> = {},
): AdobeSignUserCacheRow {
  return {
    listItemId: 1,
    adobeActorKey: 'tenant-1::oid-avery',
    isActive: true,
    cacheHydrationState: 'Ready',
    cachedSourceStatus: 'available',
    freshnessState: 'Fresh',
    pendingActionCount: 3,
    recentCompletionCount: 2,
    cacheSchemaVersion: 1,
    projectionRevision: 1,
    snapshots: snapshots(),
    ...overrides,
  };
}

function makeUserCacheRepo(
  outcome: AdobeSignUserCacheReadOutcome,
): IAdobeSignUserCacheRepository {
  return {
    findByAdobeActorKey: vi.fn(async () => outcome),
    upsert: vi.fn(async () => ({ listItemId: 1 })),
    softDeactivateByAdobeActorKey: vi.fn(async () => ({ deactivated: false })),
  };
}

function makeProjectionRepo(
  pages: Record<AdobeSignCacheProjectionBucket, AdobeSignAgreementProjectionListPage>,
): IAdobeSignAgreementProjectionCacheRepository {
  return {
    listActiveByActorAndBucket: vi.fn(
      async (input: AdobeSignAgreementProjectionListInput) =>
        pages[input.projectionBucket] ?? { rows: [], hasMore: false },
    ),
    findByProjectionKey: vi.fn(async () => null),
    upsert: vi.fn(async () => ({ listItemId: 1 })),
    softDeactivate: vi.fn(async () => ({ deactivated: false })),
  };
}

function previewActionItem(agreementId: string): MyWorkAdobeSignActionQueueItem {
  return {
    itemId: `adobe-sign:agreement-${agreementId}`,
    sourceSystem: 'adobe-sign',
    agreementId,
    agreementName: `Agreement ${agreementId}`,
    requiredAction: 'signature',
    actionHandoff: { posture: 'resolve-on-click', reason: 'eligible' },
    adobeRecipientStatus: 'WAITING_FOR_MY_SIGNATURE',
  };
}

function previewCompletionItem(agreementId: string): MyWorkAdobeSignRecentCompletionsItem {
  return {
    itemId: `adobe-sign:agreement-${agreementId}`,
    sourceSystem: 'adobe-sign',
    agreementId,
    agreementName: `Agreement ${agreementId}`,
    agreementStatus: 'COMPLETED',
    completedAtUtc: '2026-05-15T10:00:00.000Z',
  };
}

function makeAgreementRow(
  bucket: AdobeSignCacheProjectionBucket,
  agreementId: string,
): AdobeSignAgreementProjectionRow {
  return {
    listItemId: 1,
    projectionKey: `tenant-1::oid-avery::${agreementId}::__DEFAULT__`,
    adobeActorKey: 'tenant-1::oid-avery',
    agreementId,
    recipientActionKey: '__DEFAULT__',
    projectionBucket: bucket,
    agreementName: `Agreement ${agreementId}`,
    isActiveProjection: true,
    previewItem:
      bucket === 'PendingAction'
        ? previewActionItem(agreementId)
        : (previewCompletionItem(agreementId) as unknown as MyWorkAdobeSignActionQueueItem),
    cacheSchemaVersion: 1,
  };
}

function makeProvider(opts: {
  resolution: AdobeSignPrincipalResolutionResult;
  userCacheOutcome: AdobeSignUserCacheReadOutcome;
  projectionPages?: Record<AdobeSignCacheProjectionBucket, AdobeSignAgreementProjectionListPage>;
}): {
  provider: MyWorkAdobeSignCacheReadModelProvider;
  resolverSpy: AdobeSignPrincipalResolver;
  userCacheRepoSpy: IAdobeSignUserCacheRepository;
  projectionRepoSpy: IAdobeSignAgreementProjectionCacheRepository;
} {
  const resolverSpy = makeResolver(opts.resolution);
  const userCacheRepoSpy = makeUserCacheRepo(opts.userCacheOutcome);
  const projectionRepoSpy = makeProjectionRepo(
    opts.projectionPages ?? {
      PendingAction: { rows: [], hasMore: false },
      RecentCompletion: { rows: [], hasMore: false },
      Inactive: { rows: [], hasMore: false },
    },
  );
  const provider = new MyWorkAdobeSignCacheReadModelProvider({
    resolvePrincipal: resolverSpy,
    userCacheRepository: userCacheRepoSpy,
    agreementProjectionCacheRepository: projectionRepoSpy,
    now: () => FIXED_NOW,
  });
  return { provider, resolverSpy, userCacheRepoSpy, projectionRepoSpy };
}

describe('MyWorkAdobeSignCacheReadModelProvider — authorization-required', () => {
  it.each([
    ['no-grant-found' as const],
    ['grant-revoked' as const],
    ['grant-requires-reauth' as const],
    ['grant-expired' as const],
  ])('returns authorization-required when grant is %s (regardless of cache row state)', async (reason) => {
    const { provider, userCacheRepoSpy } = makeProvider({
      resolution: { status: 'authorization-required', actor: makeActor(), reason },
      userCacheOutcome: { outcome: 'found', row: userCacheRow() },
    });
    const homeEnvelope = await provider.getMyWorkHome(makeContext());
    expect(homeEnvelope.sourceStatus).toBe('authorization-required');
    expect(homeEnvelope.warnings[0]?.code).toBe('authorization-required');
    // Cache repo never consulted when grant is bad
    expect(userCacheRepoSpy.findByAdobeActorKey).not.toHaveBeenCalled();
  });
});

describe('MyWorkAdobeSignCacheReadModelProvider — hydration-pending', () => {
  it('returns partial + cache-hydration-pending when grant is active and UserCache row is missing', async () => {
    const { provider } = makeProvider({
      resolution: resolvedPrincipal(),
      userCacheOutcome: { outcome: 'missing' },
    });
    const homeEnvelope = await provider.getMyWorkHome(makeContext());
    expect(homeEnvelope.sourceStatus).toBe('partial');
    expect(homeEnvelope.warnings[0]?.code).toBe('cache-hydration-pending');
    expect(homeEnvelope.data.summary.totalActionItemCount).toBe(0);
    expect(homeEnvelope.data.adobeSignActionQueue.previewItems).toEqual([]);
  });

  it('returns the same hydration-pending posture on the action-queue route', async () => {
    const { provider } = makeProvider({
      resolution: resolvedPrincipal(),
      userCacheOutcome: { outcome: 'missing' },
    });
    const envelope = await provider.getAdobeSignActionQueue(makeContext(), {});
    expect(envelope.sourceStatus).toBe('partial');
    expect(envelope.warnings[0]?.code).toBe('cache-hydration-pending');
    expect(envelope.data.items).toEqual([]);
    expect(envelope.data.freshness.state).toBe('unknown');
  });
});

describe('MyWorkAdobeSignCacheReadModelProvider — malformed cache row', () => {
  it('returns backend-unavailable when UserCache row JSON is corrupt', async () => {
    const { provider } = makeProvider({
      resolution: resolvedPrincipal(),
      userCacheOutcome: {
        outcome: 'malformed',
        column: 'actionQueuePreview',
        reason: 'parse-error',
      },
    });
    const homeEnvelope = await provider.getMyWorkHome(makeContext());
    expect(homeEnvelope.sourceStatus).toBe('backend-unavailable');
    expect(homeEnvelope.warnings[0]?.code).toBe('backend-unavailable');
    // No envelope data leaked (empty placeholders)
    expect(homeEnvelope.data.summary.totalActionItemCount).toBe(0);
  });

  it('routes diagnostics to the optional sink', async () => {
    const trackSpy = vi.fn();
    const resolverSpy = makeResolver(resolvedPrincipal());
    const userCacheRepoSpy = makeUserCacheRepo({
      outcome: 'malformed',
      column: 'actionQueuePreview',
      reason: 'schema-version-mismatch',
    });
    const projectionRepoSpy = makeProjectionRepo({
      PendingAction: { rows: [], hasMore: false },
      RecentCompletion: { rows: [], hasMore: false },
      Inactive: { rows: [], hasMore: false },
    });
    const provider = new MyWorkAdobeSignCacheReadModelProvider({
      resolvePrincipal: resolverSpy,
      userCacheRepository: userCacheRepoSpy,
      agreementProjectionCacheRepository: projectionRepoSpy,
      now: () => FIXED_NOW,
      diagnostics: { trackAdobeSignRuntimeEvent: trackSpy },
    });
    await provider.getMyWorkHome(makeContext());
    expect(trackSpy).toHaveBeenCalled();
  });
});

describe('MyWorkAdobeSignCacheReadModelProvider — freshness mapping', () => {
  it.each([
    ['Fresh' as const, 'fresh' as const, false],
    ['Aging' as const, 'aging' as const, true],
    ['Stale' as const, 'stale' as const, true],
    ['Unknown' as const, 'unknown' as const, false],
  ])(
    'cache freshness %s → envelope freshness %s; stale-cache-used warning emitted=%s',
    async (cacheState, envelopeState, expectStaleWarning) => {
      const row = userCacheRow({ freshnessState: cacheState as AdobeSignCacheFreshnessState });
      const { provider } = makeProvider({
        resolution: resolvedPrincipal(),
        userCacheOutcome: { outcome: 'found', row },
      });
      const queueEnvelope = await provider.getAdobeSignActionQueue(makeContext(), {});
      expect(queueEnvelope.data.freshness.state).toBe(envelopeState);
      const hasStaleWarning = queueEnvelope.warnings.some(
        (w) => w.code === 'stale-cache-used',
      );
      expect(hasStaleWarning).toBe(expectStaleWarning);
    },
  );

  it('passes cached warnings through unchanged when freshness is Fresh', async () => {
    const row = userCacheRow({
      freshnessState: 'Fresh',
      snapshots: snapshots({
        actionQueueWarnings: [{ code: 'partial-source-data', message: 'note' }],
      }),
    });
    const { provider } = makeProvider({
      resolution: resolvedPrincipal(),
      userCacheOutcome: { outcome: 'found', row },
    });
    const envelope = await provider.getAdobeSignActionQueue(makeContext(), {});
    expect(envelope.warnings).toEqual([{ code: 'partial-source-data', message: 'note' }]);
  });
});

describe('MyWorkAdobeSignCacheReadModelProvider — bucket filters', () => {
  it("getAdobeSignActionQueue filters to ProjectionBucket='PendingAction'", async () => {
    const { provider, projectionRepoSpy } = makeProvider({
      resolution: resolvedPrincipal(),
      userCacheOutcome: { outcome: 'found', row: userCacheRow() },
      projectionPages: {
        PendingAction: {
          rows: [makeAgreementRow('PendingAction', 'agr-1')],
          hasMore: false,
        },
        RecentCompletion: { rows: [], hasMore: false },
        Inactive: { rows: [], hasMore: false },
      },
    });
    const envelope = await provider.getAdobeSignActionQueue(makeContext(), {});
    expect(envelope.data.items).toHaveLength(1);
    expect(envelope.data.items[0].agreementId).toBe('agr-1');
    expect(projectionRepoSpy.listActiveByActorAndBucket).toHaveBeenCalledWith(
      expect.objectContaining({ projectionBucket: 'PendingAction' }),
    );
  });

  it("getAdobeSignRecentCompletions filters to ProjectionBucket='RecentCompletion'", async () => {
    const { provider, projectionRepoSpy } = makeProvider({
      resolution: resolvedPrincipal(),
      userCacheOutcome: { outcome: 'found', row: userCacheRow() },
      projectionPages: {
        PendingAction: { rows: [], hasMore: false },
        RecentCompletion: {
          rows: [makeAgreementRow('RecentCompletion', 'agr-2')],
          hasMore: false,
        },
        Inactive: { rows: [], hasMore: false },
      },
    });
    const envelope = await provider.getAdobeSignRecentCompletions(makeContext(), {});
    expect(envelope.data.items).toHaveLength(1);
    expect(envelope.data.items[0].agreementId).toBe('agr-2');
    expect(projectionRepoSpy.listActiveByActorAndBucket).toHaveBeenCalledWith(
      expect.objectContaining({ projectionBucket: 'RecentCompletion' }),
    );
  });

  it('propagates the page cursor through pagination', async () => {
    const { provider, projectionRepoSpy } = makeProvider({
      resolution: resolvedPrincipal(),
      userCacheOutcome: { outcome: 'found', row: userCacheRow() },
      projectionPages: {
        PendingAction: {
          rows: [makeAgreementRow('PendingAction', 'agr-1')],
          hasMore: true,
          nextCursor: 'opaque-cursor-1',
        },
        RecentCompletion: { rows: [], hasMore: false },
        Inactive: { rows: [], hasMore: false },
      },
    });
    const envelope = await provider.getAdobeSignActionQueue(makeContext(), {
      pageSize: 1,
      cursor: 'opaque-cursor-0',
    });
    expect(projectionRepoSpy.listActiveByActorAndBucket).toHaveBeenCalledWith(
      expect.objectContaining({ pageSize: 1, cursor: 'opaque-cursor-0' }),
    );
    expect(envelope.data.pagination.hasMore).toBe(true);
    expect(envelope.data.pagination.nextCursor).toBe('opaque-cursor-1');
  });
});

describe('MyWorkAdobeSignCacheReadModelProvider — structural no-Adobe-live guarantee', () => {
  it("constructor signature has no Adobe HTTP client parameter (compile-time + runtime)", () => {
    // Compile-time: the type below is the public constructor option set.
    // Runtime: instantiate and ensure construction completes without any
    // mention of action-queue / recent-completions adapter properties.
    const provider = new MyWorkAdobeSignCacheReadModelProvider({
      resolvePrincipal: makeResolver({ status: 'configuration-required', missingKeys: [], pendingStoreSelection: false }),
      userCacheRepository: makeUserCacheRepo({ outcome: 'missing' }),
      agreementProjectionCacheRepository: makeProjectionRepo({
        PendingAction: { rows: [], hasMore: false },
        RecentCompletion: { rows: [], hasMore: false },
        Inactive: { rows: [], hasMore: false },
      }),
    });
    expect(provider).toBeInstanceOf(MyWorkAdobeSignCacheReadModelProvider);
    // No actionQueueAdapter / recentCompletionsAdapter accessor exists on
    // the provider (private state is encapsulated). The structural guarantee
    // is enforced at the type level — this assertion just exercises the
    // construction path.
    expect((provider as unknown as { actionQueueAdapter?: unknown }).actionQueueAdapter).toBeUndefined();
    expect(
      (provider as unknown as { recentCompletionsAdapter?: unknown }).recentCompletionsAdapter,
    ).toBeUndefined();
  });
});
