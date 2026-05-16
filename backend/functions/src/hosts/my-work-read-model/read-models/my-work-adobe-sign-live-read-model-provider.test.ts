import { describe, expect, it, vi } from 'vitest';

import type {
  MyWorkAdobeSignActionQueueItem,
  MyWorkAdobeSignActionQueueQuery,
  MyWorkAdobeSignActionQueueReadModel,
  MyWorkAdobeSignRecentCompletionsQuery,
  MyWorkAdobeSignRecentCompletionsReadModel,
  MyWorkReadModelEnvelope,
  MyWorkReadModelSourceStatus,
  MyWorkReadModelWarning,
} from '@hbc/models/myWork';

import type { IAdobeSignActionQueueAdapter } from './adobe-sign/adobe-sign-action-queue-adapter.js';
import type { IAdobeSignRecentCompletionsAdapter } from './adobe-sign/adobe-sign-recent-completions-adapter.js';
import { MyWorkAdobeSignLiveReadModelProvider } from './my-work-adobe-sign-live-read-model-provider.js';
import type { MyWorkReadContext } from './my-work-read-model-provider.js';

const FIXED_NOW = new Date('2026-05-13T12:00:00.000Z');

const context = (): MyWorkReadContext => ({
  actor: {
    displayName: 'Avery Operator',
    principalName: 'avery@hbc.test',
    hbcUserId: 'oid-avery',
  },
  requestId: 'req-fixture',
});

function queueItem(
  agreementId: string,
  overrides: Partial<MyWorkAdobeSignActionQueueItem> = {},
): MyWorkAdobeSignActionQueueItem {
  return {
    itemId: `adobe-sign:agreement-${agreementId}`,
    sourceSystem: 'adobe-sign',
    agreementId,
    agreementName: `Agreement ${agreementId}`,
    requiredAction: 'signature',
    adobeRecipientStatus: 'WAITING_FOR_MY_SIGNATURE',
    ...overrides,
  };
}

function envelope(opts: {
  status: MyWorkReadModelSourceStatus;
  items?: MyWorkAdobeSignActionQueueItem[];
  warnings?: readonly MyWorkReadModelWarning[];
  totalActionItemCount?: number;
}): MyWorkReadModelEnvelope<MyWorkAdobeSignActionQueueReadModel> {
  const items = opts.items ?? [];
  return {
    mode: 'backend',
    sourceStatus: opts.status,
    readOnly: true,
    warnings: opts.warnings ?? [],
    generatedAtUtc: '2026-05-13T12:00:00.000Z',
    data: {
      moduleId: 'adobe-sign-action-queue',
      summary: {
        countBasis: 'returned-items',
        totalActionItemCount: opts.totalActionItemCount ?? items.length,
        signatureCount: items.length,
        approvalCount: 0,
        acceptanceCount: 0,
        acknowledgementCount: 0,
        formFillingCount: 0,
        delegationCount: 0,
        expiringSoonCount: 0,
      },
      items,
      pagination: { pageSize: 5, hasMore: false },
      freshness: {
        state: opts.status === 'available' ? 'fresh' : 'unknown',
        generatedAtUtc: '2026-05-13T12:00:00.000Z',
      },
    },
  };
}

function buildAdapter(
  envelopeFn: (
    context: MyWorkReadContext,
    query: MyWorkAdobeSignActionQueueQuery,
  ) => Promise<MyWorkReadModelEnvelope<MyWorkAdobeSignActionQueueReadModel>>,
): IAdobeSignActionQueueAdapter & { getActionQueue: ReturnType<typeof vi.fn> } {
  const spy = vi.fn(envelopeFn);
  return { getActionQueue: spy };
}

function buildRecentCompletionsAdapter(
  envelopeFn: (
    context: MyWorkReadContext,
    query: MyWorkAdobeSignRecentCompletionsQuery,
  ) => Promise<MyWorkReadModelEnvelope<MyWorkAdobeSignRecentCompletionsReadModel>>,
): IAdobeSignRecentCompletionsAdapter & { getRecentCompletions: ReturnType<typeof vi.fn> } {
  const spy = vi.fn(envelopeFn);
  return { getRecentCompletions: spy };
}

describe('MyWorkAdobeSignLiveReadModelProvider — getAdobeSignActionQueue', () => {
  it('delegates 1:1 to the adapter; cursor + pageSize pass through', async () => {
    const queueEnv = envelope({ status: 'available', items: [queueItem('a')] });
    const adapter = buildAdapter(async () => queueEnv);
    const recentAdapter = buildRecentCompletionsAdapter(
      async () =>
        ({
          mode: 'backend',
          sourceStatus: 'available',
          readOnly: true,
          warnings: [],
          generatedAtUtc: '2026-05-13T12:00:00.000Z',
          data: {
            moduleId: 'adobe-sign-recent-completions',
            summary: { countBasis: 'returned-items', completedAgreementCount: 0, windowDays: 30 },
            items: [],
            pagination: { pageSize: 25, hasMore: false },
            freshness: { state: 'fresh', generatedAtUtc: '2026-05-13T12:00:00.000Z' },
          },
        }) satisfies MyWorkReadModelEnvelope<MyWorkAdobeSignRecentCompletionsReadModel>,
    );
    const provider = new MyWorkAdobeSignLiveReadModelProvider({
      actionQueueAdapter: adapter,
      recentCompletionsAdapter: recentAdapter,
      now: () => FIXED_NOW,
    });
    const result = await provider.getAdobeSignActionQueue(context(), {
      pageSize: 12,
      cursor: 'opaque-cursor',
    });
    expect(result).toBe(queueEnv);
    expect(adapter.getActionQueue).toHaveBeenCalledTimes(1);
    expect(adapter.getActionQueue.mock.calls[0]![1]).toEqual({
      pageSize: 12,
      cursor: 'opaque-cursor',
    });
    expect(recentAdapter.getRecentCompletions).toHaveBeenCalledTimes(0);
  });
});

describe('MyWorkAdobeSignLiveReadModelProvider — getAdobeSignRecentCompletions', () => {
  it('delegates 1:1 to the recent-completions adapter', async () => {
    const queueAdapter = buildAdapter(async () => envelope({ status: 'available' }));
    const recentEnv = {
      mode: 'backend',
      sourceStatus: 'available',
      readOnly: true,
      warnings: [],
      generatedAtUtc: '2026-05-13T12:00:00.000Z',
      data: {
        moduleId: 'adobe-sign-recent-completions',
        summary: { countBasis: 'returned-items', completedAgreementCount: 1, windowDays: 30 },
        items: [
          {
            itemId: 'adobe-sign:completed-agreement-a',
            sourceSystem: 'adobe-sign',
            agreementId: 'a',
            agreementName: 'Agreement a',
            agreementStatus: 'COMPLETED',
          },
        ],
        pagination: { pageSize: 10, hasMore: false },
        freshness: { state: 'fresh', generatedAtUtc: '2026-05-13T12:00:00.000Z' },
      },
    } satisfies MyWorkReadModelEnvelope<MyWorkAdobeSignRecentCompletionsReadModel>;
    const recentAdapter = buildRecentCompletionsAdapter(async () => recentEnv);
    const provider = new MyWorkAdobeSignLiveReadModelProvider({
      actionQueueAdapter: queueAdapter,
      recentCompletionsAdapter: recentAdapter,
      now: () => FIXED_NOW,
    });

    const result = await provider.getAdobeSignRecentCompletions(context(), {
      pageSize: 10,
      cursor: 'opaque-cursor',
    });
    expect(result).toBe(recentEnv);
    expect(recentAdapter.getRecentCompletions).toHaveBeenCalledTimes(1);
    expect(recentAdapter.getRecentCompletions.mock.calls[0]![1]).toEqual({
      pageSize: 10,
      cursor: 'opaque-cursor',
    });
    expect(queueAdapter.getActionQueue).toHaveBeenCalledTimes(0);
  });
});

describe('MyWorkAdobeSignLiveReadModelProvider — getMyWorkHome projection', () => {
  it('projects the adapter envelope into a home envelope with a bounded 5-item preview', async () => {
    const items = Array.from({ length: 8 }, (_, i) => queueItem(`a-${i}`));
    const queueEnv = envelope({ status: 'available', items, totalActionItemCount: 8 });
    const adapter = buildAdapter(async () => queueEnv);
    const recentAdapter = buildRecentCompletionsAdapter(
      async () =>
        ({
          mode: 'backend',
          sourceStatus: 'available',
          readOnly: true,
          warnings: [],
          generatedAtUtc: '2026-05-13T12:00:00.000Z',
          data: {
            moduleId: 'adobe-sign-recent-completions',
            summary: { countBasis: 'returned-items', completedAgreementCount: 0, windowDays: 30 },
            items: [],
            pagination: { pageSize: 25, hasMore: false },
            freshness: { state: 'fresh', generatedAtUtc: '2026-05-13T12:00:00.000Z' },
          },
        }) satisfies MyWorkReadModelEnvelope<MyWorkAdobeSignRecentCompletionsReadModel>,
    );
    const provider = new MyWorkAdobeSignLiveReadModelProvider({
      actionQueueAdapter: adapter,
      recentCompletionsAdapter: recentAdapter,
      now: () => FIXED_NOW,
    });

    const home = await provider.getMyWorkHome(context());

    expect(adapter.getActionQueue).toHaveBeenCalledTimes(1);
    expect(recentAdapter.getRecentCompletions).toHaveBeenCalledTimes(0);
    expect(adapter.getActionQueue.mock.calls[0]![1]).toEqual({ pageSize: 5 });
    expect(home.mode).toBe('backend');
    expect(home.sourceStatus).toBe('available');
    expect(home.readOnly).toBe(true);
    expect(home.warnings).toEqual([]);
    expect(home.generatedAtUtc).toBe('2026-05-13T12:00:00.000Z');
    expect(home.data.actor.hbcUserId).toBe('oid-avery');
    expect(home.data.summary.totalActionItemCount).toBe(8);
    expect(home.data.sourceReadiness).toHaveLength(1);
    expect(home.data.sourceReadiness[0]).toEqual({
      sourceSystem: 'adobe-sign',
      sourceStatus: 'available',
      warnings: [],
    });
    expect(home.data.adobeSignActionQueue.previewItemLimit).toBe(5);
    expect(home.data.adobeSignActionQueue.previewItems).toHaveLength(5);
    expect(home.data.adobeSignActionQueue.previewItems.map((i) => i.agreementId)).toEqual([
      'a-0',
      'a-1',
      'a-2',
      'a-3',
      'a-4',
    ]);
  });

  it('inherits authorization-required + warnings from the adapter envelope', async () => {
    const queueEnv = envelope({
      status: 'authorization-required',
      items: [],
      warnings: [{ code: 'authorization-required' }],
      totalActionItemCount: 0,
    });
    const adapter = buildAdapter(async () => queueEnv);
    const recentAdapter = buildRecentCompletionsAdapter(async () => {
      throw new Error('should not be called');
    });
    const provider = new MyWorkAdobeSignLiveReadModelProvider({
      actionQueueAdapter: adapter,
      recentCompletionsAdapter: recentAdapter,
      now: () => FIXED_NOW,
    });
    const home = await provider.getMyWorkHome(context());
    expect(home.sourceStatus).toBe('authorization-required');
    expect(home.warnings).toEqual([{ code: 'authorization-required' }]);
    expect(home.data.summary.totalActionItemCount).toBe(0);
    expect(home.data.sourceReadiness[0]?.warnings).toEqual([{ code: 'authorization-required' }]);
    expect(home.data.adobeSignActionQueue.previewItems).toEqual([]);
  });

  it('inherits source-unavailable cleanly without synthesizing items', async () => {
    const queueEnv = envelope({
      status: 'source-unavailable',
      items: [],
      warnings: [{ code: 'source-unavailable' }],
      totalActionItemCount: 0,
    });
    const adapter = buildAdapter(async () => queueEnv);
    const recentAdapter = buildRecentCompletionsAdapter(async () => {
      throw new Error('should not be called');
    });
    const provider = new MyWorkAdobeSignLiveReadModelProvider({
      actionQueueAdapter: adapter,
      recentCompletionsAdapter: recentAdapter,
      now: () => FIXED_NOW,
    });
    const home = await provider.getMyWorkHome(context());
    expect(home.sourceStatus).toBe('source-unavailable');
    expect(home.data.adobeSignActionQueue.previewItems).toEqual([]);
    expect(home.data.adobeSignActionQueue.summary.totalActionItemCount).toBe(0);
  });

  it('uses the injected now() for generatedAtUtc', async () => {
    const adapter = buildAdapter(async () => envelope({ status: 'available' }));
    const recentAdapter = buildRecentCompletionsAdapter(async () => {
      throw new Error('should not be called');
    });
    const customNow = new Date('2027-01-01T00:00:00.000Z');
    const provider = new MyWorkAdobeSignLiveReadModelProvider({
      actionQueueAdapter: adapter,
      recentCompletionsAdapter: recentAdapter,
      now: () => customNow,
    });
    const home = await provider.getMyWorkHome(context());
    expect(home.generatedAtUtc).toBe('2027-01-01T00:00:00.000Z');
  });
});
