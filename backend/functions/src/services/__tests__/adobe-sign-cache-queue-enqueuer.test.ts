import { describe, expect, it } from 'vitest';

import { createInMemoryAdobeSignCacheQueueEnqueuer } from '../adobe-sign-cache/queue-enqueuer.js';
import type { AdobeSignCacheWorkItem } from '../adobe-sign-cache/queue-work-item-contract.js';

const NOW_DATE = new Date('2026-05-19T12:00:00.000Z');
const FIXED_UUID = '11111111-1111-4111-8111-111111111111';

const VALID_WORK_ITEM: AdobeSignCacheWorkItem = {
  workItemId: '00000000-0000-4000-8000-000000000001',
  workItemType: 'ManualUserRefresh',
  correlationId: 'corr-1',
  requestedAtUtc: '2026-05-19T12:00:00.000Z',
  adobeActorKey: 'actor-1',
  refreshScope: 'UserWide',
};

describe('createInMemoryAdobeSignCacheQueueEnqueuer', () => {
  it('captures every successfully enqueued work item in order', async () => {
    const enqueuer = createInMemoryAdobeSignCacheQueueEnqueuer({
      now: () => NOW_DATE,
      randomUUID: () => FIXED_UUID,
    });
    const second: AdobeSignCacheWorkItem = { ...VALID_WORK_ITEM, correlationId: 'corr-2' };
    await enqueuer.enqueue(VALID_WORK_ITEM);
    await enqueuer.enqueue(second);
    expect(enqueuer.items).toHaveLength(2);
    expect(enqueuer.items[0].correlationId).toBe('corr-1');
    expect(enqueuer.items[1].correlationId).toBe('corr-2');
  });

  it('returns a messageId from the injected randomUUID and an insertedAtUtc from injected now', async () => {
    const enqueuer = createInMemoryAdobeSignCacheQueueEnqueuer({
      now: () => NOW_DATE,
      randomUUID: () => FIXED_UUID,
    });
    const result = await enqueuer.enqueue(VALID_WORK_ITEM);
    expect(result.messageId).toBe(FIXED_UUID);
    expect(result.insertedAtUtc).toBe(NOW_DATE.toISOString());
  });

  it('rejects a payload that fails work-item validation', async () => {
    const enqueuer = createInMemoryAdobeSignCacheQueueEnqueuer({
      now: () => NOW_DATE,
      randomUUID: () => FIXED_UUID,
    });
    const invalid = { ...VALID_WORK_ITEM, refreshScope: 'Bogus' as never };
    await expect(enqueuer.enqueue(invalid)).rejects.toThrow(/invalid-refreshScope/);
    expect(enqueuer.items).toHaveLength(0);
  });

  it('rejects a payload that carries any prohibited field', async () => {
    const enqueuer = createInMemoryAdobeSignCacheQueueEnqueuer({
      now: () => NOW_DATE,
      randomUUID: () => FIXED_UUID,
    });
    const leaky = { ...VALID_WORK_ITEM, accessToken: 'leaked-token' } as unknown as AdobeSignCacheWorkItem;
    await expect(enqueuer.enqueue(leaky)).rejects.toThrow(/prohibited-field:accessToken/);
  });

  it('health() reports ready', async () => {
    const enqueuer = createInMemoryAdobeSignCacheQueueEnqueuer();
    expect(await enqueuer.health()).toEqual({ ready: true });
  });

  it('reset() clears captured items', async () => {
    const enqueuer = createInMemoryAdobeSignCacheQueueEnqueuer({
      now: () => NOW_DATE,
      randomUUID: () => FIXED_UUID,
    });
    await enqueuer.enqueue(VALID_WORK_ITEM);
    expect(enqueuer.items).toHaveLength(1);
    enqueuer.reset();
    expect(enqueuer.items).toHaveLength(0);
  });
});
