import { describe, expect, it } from 'vitest';
import {
  buildProjectionSyncMessageId,
  computeDebounceBucketUtc,
  isProjectionSyncMessage,
  type IMyProjectsProjectionSyncMessage,
} from '../my-projects-projection/projection-message-contract.js';

const VALID_MESSAGE: IMyProjectsProjectionSyncMessage = {
  schemaVersion: 'v1',
  messageType: 'my-projects-projection-sync',
  sourceListKind: 'Projects',
  receivedAtUtc: '2026-05-17T14:32:47.512Z',
  debounceBucketUtc: '2026-05-17T14:32:00.000Z',
  notificationBatchId: '0a7f0a09-b3a7-4f04-9c2a-3a4d3c11a111',
  subscriptionId: 'sub-12345',
  notificationCount: 3,
  correlationId: 'corr-abc',
};

describe('computeDebounceBucketUtc', () => {
  it('floors to a 60-second window', () => {
    const result = computeDebounceBucketUtc(new Date('2026-05-17T14:32:47.512Z'), 60);
    expect(result).toBe('2026-05-17T14:32:00.000Z');
  });

  it('floors to a 30-second window mid-minute', () => {
    expect(computeDebounceBucketUtc(new Date('2026-05-17T14:32:29.999Z'), 30)).toBe(
      '2026-05-17T14:32:00.000Z',
    );
    expect(computeDebounceBucketUtc(new Date('2026-05-17T14:32:30.000Z'), 30)).toBe(
      '2026-05-17T14:32:30.000Z',
    );
  });

  it('floors exactly on a window boundary to the same instant', () => {
    expect(computeDebounceBucketUtc(new Date('2026-05-17T14:32:00.000Z'), 60)).toBe(
      '2026-05-17T14:32:00.000Z',
    );
  });

  it.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'rejects windowSeconds=%s',
    (windowSeconds) => {
      expect(() =>
        computeDebounceBucketUtc(new Date('2026-05-17T14:32:00.000Z'), windowSeconds),
      ).toThrow(RangeError);
    },
  );

  it('rejects an invalid Date', () => {
    expect(() => computeDebounceBucketUtc(new Date('not-a-date'), 60)).toThrow(RangeError);
  });
});

describe('buildProjectionSyncMessageId', () => {
  it('formats per the locked template for Projects', () => {
    expect(buildProjectionSyncMessageId('Projects', '2026-05-17T14:32:00.000Z')).toBe(
      'my-projects-projection:Projects:2026-05-17T14:32:00.000Z',
    );
  });

  it('formats per the locked template for LegacyRegistry', () => {
    expect(buildProjectionSyncMessageId('LegacyRegistry', '2026-05-17T14:32:00.000Z')).toBe(
      'my-projects-projection:LegacyRegistry:2026-05-17T14:32:00.000Z',
    );
  });

  it('rejects unknown source kinds at runtime', () => {
    expect(() =>
      buildProjectionSyncMessageId(
        'legacy-registry' as unknown as IMyProjectsProjectionSyncMessage['sourceListKind'],
        '2026-05-17T14:32:00.000Z',
      ),
    ).toThrow(RangeError);
  });

  it('rejects an empty debounce bucket', () => {
    expect(() => buildProjectionSyncMessageId('Projects', '')).toThrow(RangeError);
  });
});

describe('isProjectionSyncMessage', () => {
  it('accepts the canonical fixture', () => {
    expect(isProjectionSyncMessage(VALID_MESSAGE)).toBe(true);
  });

  it('accepts a fixture without the optional fields', () => {
    const minimal: IMyProjectsProjectionSyncMessage = {
      schemaVersion: 'v1',
      messageType: 'my-projects-projection-sync',
      sourceListKind: 'LegacyRegistry',
      receivedAtUtc: '2026-05-17T14:32:47.512Z',
      debounceBucketUtc: '2026-05-17T14:32:00.000Z',
      notificationBatchId: 'batch-1',
    };
    expect(isProjectionSyncMessage(minimal)).toBe(true);
  });

  it.each([
    ['wrong schemaVersion', { ...VALID_MESSAGE, schemaVersion: 'v2' }],
    ['wrong messageType', { ...VALID_MESSAGE, messageType: 'some-other-type' }],
    ['wrong sourceListKind', { ...VALID_MESSAGE, sourceListKind: 'legacy-registry' }],
    ['empty notificationBatchId', { ...VALID_MESSAGE, notificationBatchId: '' }],
    ['non-ISO receivedAtUtc', { ...VALID_MESSAGE, receivedAtUtc: 'not-a-date' }],
    ['non-ISO debounceBucketUtc', { ...VALID_MESSAGE, debounceBucketUtc: 'not-a-date' }],
    ['negative notificationCount', { ...VALID_MESSAGE, notificationCount: -1 }],
    ['non-integer notificationCount', { ...VALID_MESSAGE, notificationCount: 1.5 }],
  ])('rejects message with %s', (_label, value) => {
    expect(isProjectionSyncMessage(value)).toBe(false);
  });

  it('rejects extra unknown keys (additionalProperties:false)', () => {
    const withExtra = { ...VALID_MESSAGE, clientState: 'leaked-secret' };
    expect(isProjectionSyncMessage(withExtra)).toBe(false);
  });

  it('rejects sensitive forbidden fields enumerated in the JSON contract', () => {
    for (const forbiddenKey of [
      'clientState',
      'bearerToken',
      'assertion',
      'graphToken',
      'rawNotificationPayload',
    ]) {
      const tainted = { ...VALID_MESSAGE, [forbiddenKey]: 'value' };
      expect(isProjectionSyncMessage(tainted)).toBe(false);
    }
  });

  it.each([null, undefined, '', 0, [], 'string'])('rejects non-object %p', (value) => {
    expect(isProjectionSyncMessage(value)).toBe(false);
  });

  it('rejects missing required field', () => {
    const withoutBatch = { ...VALID_MESSAGE } as Partial<IMyProjectsProjectionSyncMessage>;
    delete withoutBatch.notificationBatchId;
    expect(isProjectionSyncMessage(withoutBatch)).toBe(false);
  });
});
