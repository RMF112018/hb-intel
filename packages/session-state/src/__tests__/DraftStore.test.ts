import { deleteDB } from 'idb';
import {
  closeSessionDb,
  resetSessionDbPromise,
} from '../db/SessionDb.js';
import {
  saveDraft,
  loadDraft,
  clearDraft,
  purgeExpiredDrafts,
  computeExpiresAt,
} from '../db/DraftStore.js';
import {
  SESSION_DB_NAME,
  DRAFT_DEFAULT_TTL_HOURS,
} from '../constants/index.js';

beforeEach(async () => {
  await closeSessionDb();
  resetSessionDbPromise();
  await deleteDB(SESSION_DB_NAME);
});

afterEach(async () => {
  await closeSessionDb();
  resetSessionDbPromise();
});

describe('DraftStore', () => {
  describe('computeExpiresAt', () => {
    it('adds TTL hours to the savedAt timestamp', () => {
      const savedAt = '2026-01-01T00:00:00.000Z';
      const result = computeExpiresAt(savedAt, 72);
      expect(result).toBe('2026-01-04T00:00:00.000Z');
    });
  });

  describe('saveDraft + loadDraft round-trip', () => {
    it('saves and loads a draft value', async () => {
      const payload = { title: 'Test Draft', items: [1, 2, 3] };
      const entry = await saveDraft('test-key', payload);

      expect(entry).not.toBeNull();
      expect(entry!.draftKey).toBe('test-key');
      expect(entry!.ttlHours).toBe(DRAFT_DEFAULT_TTL_HOURS);
      expect(entry!.value).toEqual(payload);

      const loaded = await loadDraft<typeof payload>('test-key');
      expect(loaded).toEqual(payload);
    });

    it('uses default TTL of 72 hours', async () => {
      const entry = await saveDraft('ttl-test', 'value');
      expect(entry!.ttlHours).toBe(72);
    });

    it('accepts a custom TTL', async () => {
      const entry = await saveDraft('custom-ttl', 'value', 24);
      expect(entry!.ttlHours).toBe(24);
    });
  });

  describe('loadDraft', () => {
    it('returns null for a missing key', async () => {
      const result = await loadDraft('nonexistent');
      expect(result).toBeNull();
    });

    it('returns null for an expired draft and triggers cleanup', async () => {
      // Save a draft with 1-hour TTL
      await saveDraft('expire-me', 'old-data', 1);

      // Manually expire it by rewriting with past expiresAt
      const { openSessionDb } = await import('../db/SessionDb.js');
      const db = await openSessionDb();
      const record = await db!.get('drafts', 'expire-me');
      await db!.put('drafts', {
        ...record!,
        expiresAt: '2020-01-01T00:00:00.000Z',
      });

      const loaded = await loadDraft('expire-me');
      expect(loaded).toBeNull();
    });
  });

  describe('clearDraft', () => {
    it('removes a draft entry', async () => {
      await saveDraft('to-clear', 'data');
      await clearDraft('to-clear');
      const loaded = await loadDraft('to-clear');
      expect(loaded).toBeNull();
    });

    it('is a no-op for missing keys', async () => {
      // Should not throw
      await clearDraft('nonexistent');
    });
  });

  describe('purgeExpiredDrafts', () => {
    it('removes expired drafts and preserves valid ones', async () => {
      const { openSessionDb } = await import('../db/SessionDb.js');

      // Save two drafts
      await saveDraft('expired-1', 'old1', 1);
      await saveDraft('valid-1', 'fresh', 1);

      // Manually expire the first one
      const db = await openSessionDb();
      const record = await db!.get('drafts', 'expired-1');
      await db!.put('drafts', {
        ...record!,
        expiresAt: '2020-01-01T00:00:00.000Z',
      });

      const purged = await purgeExpiredDrafts();
      expect(purged).toBe(1);

      // expired-1 should be gone, valid-1 should remain
      const loaded1 = await loadDraft('expired-1');
      const loaded2 = await loadDraft('valid-1');
      expect(loaded1).toBeNull();
      expect(loaded2).toBe('fresh');
    });

    it('returns 0 when no drafts are expired', async () => {
      await saveDraft('still-valid', 'data', 9999);
      const purged = await purgeExpiredDrafts();
      expect(purged).toBe(0);
    });
  });

});
