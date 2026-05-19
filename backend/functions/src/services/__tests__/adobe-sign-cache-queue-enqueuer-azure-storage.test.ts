import { describe, expect, it, vi } from 'vitest';

import {
  composeAdobeSignCacheQueueEnqueuer,
  createAzureStorageQueueAdobeSignCacheEnqueuer,
  resolveAdobeSignCacheQueueEndpoint,
  type IAdobeSignCacheQueueClient,
} from '../adobe-sign-cache/queue-enqueuer.js';
import type { AdobeSignCacheWorkItem } from '../adobe-sign-cache/queue-work-item-contract.js';

const FIXED_NOW = new Date('2026-05-19T12:00:00.000Z');

const VALID_WORK_ITEM: AdobeSignCacheWorkItem = {
  workItemId: '00000000-0000-4000-8000-000000000001',
  workItemType: 'ManualUserRefresh',
  correlationId: 'corr-1',
  requestedAtUtc: '2026-05-19T12:00:00.000Z',
  adobeActorKey: 'tenant-1::oid-avery',
  refreshScope: 'UserWide',
};

function makeFakeQueueClient(
  override: Partial<{
    sendMessageResult: { messageId?: string; insertedOn?: Date };
    sendMessageError: Error;
    existsResult: boolean;
    existsError: Error;
  }> = {},
): IAdobeSignCacheQueueClient & {
  sendMessage: ReturnType<typeof vi.fn>;
  exists: ReturnType<typeof vi.fn>;
} {
  return {
    sendMessage: vi.fn(async (messageText: string) => {
      if (override.sendMessageError) throw override.sendMessageError;
      return (
        override.sendMessageResult ?? {
          messageId: 'msg-1',
          insertedOn: new Date('2026-05-19T12:00:01.000Z'),
        }
      );
    }),
    exists: vi.fn(async () => {
      if (override.existsError) throw override.existsError;
      return override.existsResult ?? true;
    }),
  } as ReturnType<typeof makeFakeQueueClient>;
}

describe('createAzureStorageQueueAdobeSignCacheEnqueuer — enqueue', () => {
  it('rejects an invalid work item before any sendMessage call', async () => {
    const client = makeFakeQueueClient();
    const enqueuer = createAzureStorageQueueAdobeSignCacheEnqueuer({
      queueClient: client,
      queueName: 'adobe-sign-cache-work-items',
      now: () => FIXED_NOW,
    });
    await expect(
      enqueuer.enqueue({ ...VALID_WORK_ITEM, workItemType: 'Bogus' as never }),
    ).rejects.toThrow(/invalid work item/);
    expect(client.sendMessage).not.toHaveBeenCalled();
  });

  it('rejects a payload carrying a prohibited field before sendMessage', async () => {
    const client = makeFakeQueueClient();
    const enqueuer = createAzureStorageQueueAdobeSignCacheEnqueuer({
      queueClient: client,
      queueName: 'adobe-sign-cache-work-items',
      now: () => FIXED_NOW,
    });
    const leaky = { ...VALID_WORK_ITEM, accessToken: 'leaked' } as unknown as AdobeSignCacheWorkItem;
    await expect(enqueuer.enqueue(leaky)).rejects.toThrow(/prohibited-field/);
    expect(client.sendMessage).not.toHaveBeenCalled();
  });

  it('base64-encodes the JSON payload and sends via the queue client', async () => {
    const client = makeFakeQueueClient();
    const enqueuer = createAzureStorageQueueAdobeSignCacheEnqueuer({
      queueClient: client,
      queueName: 'adobe-sign-cache-work-items',
      now: () => FIXED_NOW,
    });
    await enqueuer.enqueue(VALID_WORK_ITEM);
    expect(client.sendMessage).toHaveBeenCalledTimes(1);
    const sentText = client.sendMessage.mock.calls[0][0] as string;
    const decoded = JSON.parse(Buffer.from(sentText, 'base64').toString('utf8'));
    expect(decoded).toEqual(VALID_WORK_ITEM);
  });

  it('returns the SDK messageId + insertedOn → insertedAtUtc', async () => {
    const client = makeFakeQueueClient({
      sendMessageResult: {
        messageId: 'msg-42',
        insertedOn: new Date('2026-05-19T12:01:00.000Z'),
      },
    });
    const enqueuer = createAzureStorageQueueAdobeSignCacheEnqueuer({
      queueClient: client,
      queueName: 'adobe-sign-cache-work-items',
      now: () => FIXED_NOW,
    });
    const result = await enqueuer.enqueue(VALID_WORK_ITEM);
    expect(result).toEqual({
      messageId: 'msg-42',
      insertedAtUtc: '2026-05-19T12:01:00.000Z',
    });
  });

  it('falls back to deps.now when the SDK response lacks insertedOn', async () => {
    const client = makeFakeQueueClient({
      sendMessageResult: { messageId: 'msg-7' },
    });
    const enqueuer = createAzureStorageQueueAdobeSignCacheEnqueuer({
      queueClient: client,
      queueName: 'adobe-sign-cache-work-items',
      now: () => FIXED_NOW,
    });
    const result = await enqueuer.enqueue(VALID_WORK_ITEM);
    expect(result.insertedAtUtc).toBe(FIXED_NOW.toISOString());
  });

  it('throws when the SDK response does not include messageId', async () => {
    const client = makeFakeQueueClient({ sendMessageResult: {} });
    const enqueuer = createAzureStorageQueueAdobeSignCacheEnqueuer({
      queueClient: client,
      queueName: 'adobe-sign-cache-work-items',
      now: () => FIXED_NOW,
    });
    await expect(enqueuer.enqueue(VALID_WORK_ITEM)).rejects.toThrow(/messageId/);
  });

  it('propagates sendMessage errors to the caller', async () => {
    const client = makeFakeQueueClient({
      sendMessageError: new Error('storage unreachable'),
    });
    const enqueuer = createAzureStorageQueueAdobeSignCacheEnqueuer({
      queueClient: client,
      queueName: 'adobe-sign-cache-work-items',
      now: () => FIXED_NOW,
    });
    await expect(enqueuer.enqueue(VALID_WORK_ITEM)).rejects.toThrow(/storage unreachable/);
  });
});

describe('createAzureStorageQueueAdobeSignCacheEnqueuer — health', () => {
  it('reports ready=true when QueueClient.exists() resolves true', async () => {
    const client = makeFakeQueueClient({ existsResult: true });
    const enqueuer = createAzureStorageQueueAdobeSignCacheEnqueuer({
      queueClient: client,
      queueName: 'adobe-sign-cache-work-items',
    });
    expect(await enqueuer.health()).toEqual({ ready: true });
  });

  it('reports ready=false with queue-not-found when QueueClient.exists() resolves false', async () => {
    const client = makeFakeQueueClient({ existsResult: false });
    const enqueuer = createAzureStorageQueueAdobeSignCacheEnqueuer({
      queueClient: client,
      queueName: 'adobe-sign-cache-work-items',
    });
    expect(await enqueuer.health()).toEqual({ ready: false, reason: 'queue-not-found' });
  });

  it('reports ready=false with the underlying error on exists() failure', async () => {
    const client = makeFakeQueueClient({
      existsError: new Error('credential refused'),
    });
    const enqueuer = createAzureStorageQueueAdobeSignCacheEnqueuer({
      queueClient: client,
      queueName: 'adobe-sign-cache-work-items',
    });
    const result = await enqueuer.health();
    expect(result.ready).toBe(false);
    expect(result.reason).toMatch(/health-probe-failed/);
  });

  it('reports ready=true when the client has no exists() method', async () => {
    const minimal: IAdobeSignCacheQueueClient = {
      sendMessage: vi.fn(),
    };
    const enqueuer = createAzureStorageQueueAdobeSignCacheEnqueuer({
      queueClient: minimal,
      queueName: 'adobe-sign-cache-work-items',
    });
    expect(await enqueuer.health()).toEqual({ ready: true });
  });
});

describe('resolveAdobeSignCacheQueueEndpoint', () => {
  it('returns AZURE_STORAGE_QUEUE_ENDPOINT verbatim when set', () => {
    const explicit = 'https://custom.queue.core.windows.net/';
    expect(
      resolveAdobeSignCacheQueueEndpoint({ AZURE_STORAGE_QUEUE_ENDPOINT: explicit }),
    ).toBe(explicit);
  });

  it('derives queue endpoint from AZURE_TABLE_ENDPOINT (replaces .table. with .queue.)', () => {
    const result = resolveAdobeSignCacheQueueEndpoint({
      AZURE_TABLE_ENDPOINT: 'https://hbintelstorage.table.core.windows.net/',
    });
    expect(result).toBe('https://hbintelstorage.queue.core.windows.net/');
  });

  it('prefers explicit AZURE_STORAGE_QUEUE_ENDPOINT over the table-derived fallback', () => {
    const result = resolveAdobeSignCacheQueueEndpoint({
      AZURE_STORAGE_QUEUE_ENDPOINT: 'https://override.queue.core.windows.net/',
      AZURE_TABLE_ENDPOINT: 'https://other.table.core.windows.net/',
    });
    expect(result).toBe('https://override.queue.core.windows.net/');
  });

  it('returns undefined when neither env is set', () => {
    expect(resolveAdobeSignCacheQueueEndpoint({})).toBeUndefined();
  });

  it('returns undefined when AZURE_TABLE_ENDPOINT does not include the .table. subdomain', () => {
    expect(
      resolveAdobeSignCacheQueueEndpoint({
        AZURE_TABLE_ENDPOINT: 'https://example.com/azurite',
      }),
    ).toBeUndefined();
  });

  it('returns undefined when AZURE_TABLE_ENDPOINT is malformed', () => {
    expect(
      resolveAdobeSignCacheQueueEndpoint({ AZURE_TABLE_ENDPOINT: 'not-a-url' }),
    ).toBeUndefined();
  });
});

describe('composeAdobeSignCacheQueueEnqueuer', () => {
  it("returns 'configuration-required' when ADOBE_SIGN_CACHE_QUEUE_NAME is missing", () => {
    const composition = composeAdobeSignCacheQueueEnqueuer({});
    expect(composition.status).toBe('configuration-required');
    if (composition.status === 'configuration-required') {
      expect(composition.reason).toBe('queue-name-not-configured');
    }
  });

  it("returns 'configuration-required' when the queue endpoint is unresolvable", () => {
    const composition = composeAdobeSignCacheQueueEnqueuer({
      ADOBE_SIGN_CACHE_QUEUE_NAME: 'adobe-sign-cache-work-items',
    });
    expect(composition.status).toBe('configuration-required');
    if (composition.status === 'configuration-required') {
      expect(composition.reason).toBe('queue-endpoint-not-configured');
    }
  });

  it("returns 'ready' with the injected queue client when buildQueueClient is supplied", () => {
    const stub = makeFakeQueueClient();
    const composition = composeAdobeSignCacheQueueEnqueuer(
      {
        ADOBE_SIGN_CACHE_QUEUE_NAME: 'adobe-sign-cache-work-items',
        AZURE_STORAGE_QUEUE_ENDPOINT: 'https://hbintelstorage.queue.core.windows.net/',
      },
      { buildQueueClient: () => stub },
    );
    expect(composition.status).toBe('ready');
    if (composition.status === 'ready') {
      expect(composition.queueName).toBe('adobe-sign-cache-work-items');
      expect(composition.queueEndpoint).toBe(
        'https://hbintelstorage.queue.core.windows.net/',
      );
    }
  });
});
