/**
 * Tests for graceful degradation when IndexedDB is unavailable.
 * Uses vi.mock to make openSessionDb always return null.
 */
vi.mock('../db/SessionDb.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../db/SessionDb.js')>();
  return {
    ...actual,
    openSessionDb: vi.fn().mockResolvedValue(null),
  };
});

import { saveDraft, loadDraft, clearDraft, purgeExpiredDrafts } from '../db/DraftStore.js';
import { enqueue, listPending, markAttempt, remove, markFailed } from '../db/QueueStore.js';

describe('DraftStore — IDB unavailable', () => {
  it('saveDraft returns null', async () => {
    expect(await saveDraft('key', 'value')).toBeNull();
  });

  it('loadDraft returns null', async () => {
    expect(await loadDraft('key')).toBeNull();
  });

  it('clearDraft is a no-op', async () => {
    await clearDraft('key');
  });

  it('purgeExpiredDrafts returns 0', async () => {
    expect(await purgeExpiredDrafts()).toBe(0);
  });
});

describe('QueueStore — IDB unavailable', () => {
  it('enqueue returns null', async () => {
    expect(await enqueue({ type: 'upload', target: '/test', payload: null })).toBeNull();
  });

  it('listPending returns empty array', async () => {
    expect(await listPending()).toEqual([]);
  });

  it('markAttempt returns null', async () => {
    expect(await markAttempt('any-id')).toBeNull();
  });

  it('remove is a no-op', async () => {
    await remove('any-id');
  });

  it('markFailed returns null', async () => {
    expect(await markFailed('any-id', 'error')).toBeNull();
  });
});
