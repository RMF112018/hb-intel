/**
 * Config Override Store — Phase 10 persistence tests.
 *
 * Tests the MockConfigOverrideStore and serialization round-trips.
 * The mock shares the same logic as the durable implementation
 * but uses in-memory storage.
 *
 * @module admin-control-plane/tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type { IAdminActorContext, IConfigOverrideWriteRequest, IConfigOverrideRevertRequest } from '@hbc/models/admin-control-plane';
import {
  MockConfigOverrideStore,
  serializeOverrideRecord,
  deserializeOverrideRecord,
  serializeAuditEvent,
  deserializeAuditEvent,
} from '../config-override-store.js';

const TEST_ACTOR: IAdminActorContext = {
  upn: 'admin@hb.com',
  objectId: 'oid-123',
  displayName: 'Test Admin',
  capturedAt: new Date().toISOString(),
};

function makeWriteRequest(overrides?: Partial<IConfigOverrideWriteRequest>): IConfigOverrideWriteRequest {
  return {
    key: 'ADMIN_UPNS',
    domain: 'access-control',
    value: 'admin@hb.com,admin2@hb.com',
    reason: 'Updated admin list',
    expectedVersion: null,
    ...overrides,
  };
}

// ─── MockConfigOverrideStore ────────────────────────────────────────────────────

describe('MockConfigOverrideStore', () => {
  let store: MockConfigOverrideStore;

  beforeEach(() => {
    store = new MockConfigOverrideStore();
  });

  // ── getOverride ───────────────────────────────────────────────────────────

  describe('getOverride', () => {
    it('returns null for non-existent key', async () => {
      const result = await store.getOverride('ADMIN_UPNS');
      expect(result).toBeNull();
    });

    it('returns override after creation', async () => {
      await store.putOverride(makeWriteRequest(), TEST_ACTOR);
      const result = await store.getOverride('ADMIN_UPNS');

      expect(result).not.toBeNull();
      expect(result!.key).toBe('ADMIN_UPNS');
      expect(result!.domain).toBe('access-control');
      expect(result!.value).toBe('admin@hb.com,admin2@hb.com');
      expect(result!.version).toBe(1);
      expect(result!.status).toBe('published');
      expect(result!.lastModifiedBy.upn).toBe('admin@hb.com');
      expect(result!.reason).toBe('Updated admin list');
    });
  });

  // ── putOverride ───────────────────────────────────────────────────────────

  describe('putOverride', () => {
    it('creates new override with version 1', async () => {
      const result = await store.putOverride(makeWriteRequest(), TEST_ACTOR);

      expect(result.key).toBe('ADMIN_UPNS');
      expect(result.version).toBe(1);
      expect(result.status).toBe('published');
      expect(result.createdAt).toBeTruthy();
      expect(result.lastModifiedAt).toBeTruthy();
    });

    it('increments version on update', async () => {
      await store.putOverride(makeWriteRequest(), TEST_ACTOR);
      const result = await store.putOverride(
        makeWriteRequest({ value: 'updated@hb.com', expectedVersion: 1 }),
        TEST_ACTOR,
      );

      expect(result.version).toBe(2);
      expect(result.value).toBe('updated@hb.com');
    });

    it('rejects create when override already exists without expectedVersion', async () => {
      await store.putOverride(makeWriteRequest(), TEST_ACTOR);

      await expect(
        store.putOverride(makeWriteRequest(), TEST_ACTOR),
      ).rejects.toThrow(/already exists/);
    });

    it('rejects update with wrong expectedVersion', async () => {
      await store.putOverride(makeWriteRequest(), TEST_ACTOR);

      await expect(
        store.putOverride(makeWriteRequest({ expectedVersion: 5 }), TEST_ACTOR),
      ).rejects.toThrow(/Concurrency conflict/);
    });

    it('preserves createdAt across updates', async () => {
      const created = await store.putOverride(makeWriteRequest(), TEST_ACTOR);
      const updated = await store.putOverride(
        makeWriteRequest({ value: 'new@hb.com', expectedVersion: 1 }),
        TEST_ACTOR,
      );

      expect(updated.createdAt).toBe(created.createdAt);
      // lastModifiedAt is always set; createdAt is preserved from original
      expect(updated.lastModifiedAt).toBeTruthy();
      expect(updated.version).toBe(2);
    });
  });

  // ── revertOverride ────────────────────────────────────────────────────────

  describe('revertOverride', () => {
    it('reverts an existing override', async () => {
      await store.putOverride(makeWriteRequest(), TEST_ACTOR);

      const request: IConfigOverrideRevertRequest = {
        key: 'ADMIN_UPNS',
        reason: 'Reverting to code default',
        expectedVersion: 1,
      };
      const result = await store.revertOverride(request, TEST_ACTOR);

      expect(result.status).toBe('reverted');
      expect(result.value).toBeNull();
      expect(result.version).toBe(2);
    });

    it('rejects revert for non-existent key', async () => {
      const request: IConfigOverrideRevertRequest = {
        key: 'NONEXISTENT',
        reason: 'test',
        expectedVersion: 1,
      };

      await expect(
        store.revertOverride(request, TEST_ACTOR),
      ).rejects.toThrow(/No override found/);
    });

    it('rejects revert with wrong expectedVersion', async () => {
      await store.putOverride(makeWriteRequest(), TEST_ACTOR);

      const request: IConfigOverrideRevertRequest = {
        key: 'ADMIN_UPNS',
        reason: 'test',
        expectedVersion: 99,
      };

      await expect(
        store.revertOverride(request, TEST_ACTOR),
      ).rejects.toThrow(/Concurrency conflict/);
    });
  });

  // ── listOverrides ─────────────────────────────────────────────────────────

  describe('listOverrides', () => {
    it('returns empty list when no overrides exist', async () => {
      const result = await store.listOverrides();
      expect(result).toEqual([]);
    });

    it('returns all overrides', async () => {
      await store.putOverride(makeWriteRequest(), TEST_ACTOR);
      await store.putOverride(
        makeWriteRequest({ key: 'CONTROLLER_UPNS', value: 'ctrl@hb.com' }),
        TEST_ACTOR,
      );

      const result = await store.listOverrides();
      expect(result).toHaveLength(2);
    });

    it('filters by domain', async () => {
      await store.putOverride(makeWriteRequest(), TEST_ACTOR);
      await store.putOverride(
        makeWriteRequest({ key: 'TIMEOUT', domain: 'rollout', value: '90000' }),
        TEST_ACTOR,
      );

      const acResult = await store.listOverrides('access-control');
      expect(acResult).toHaveLength(1);
      expect(acResult[0].key).toBe('ADMIN_UPNS');

      const rolloutResult = await store.listOverrides('rollout');
      expect(rolloutResult).toHaveLength(1);
      expect(rolloutResult[0].key).toBe('TIMEOUT');
    });
  });

  // ── getHistory ────────────────────────────────────────────────────────────

  describe('getHistory', () => {
    it('returns empty history for non-existent key', async () => {
      const result = await store.getHistory('NONEXISTENT');
      expect(result).toEqual([]);
    });

    it('captures audit events for create and update', async () => {
      await store.putOverride(makeWriteRequest(), TEST_ACTOR);
      await store.putOverride(
        makeWriteRequest({ value: 'updated@hb.com', expectedVersion: 1 }),
        TEST_ACTOR,
      );

      const history = await store.getHistory('ADMIN_UPNS');
      expect(history).toHaveLength(2);

      // Newest first
      expect(history[0].eventType).toBe('updated');
      expect(history[0].newVersion).toBe(2);
      expect(history[0].previousValue).toBe('admin@hb.com,admin2@hb.com');
      expect(history[0].newValue).toBe('updated@hb.com');

      expect(history[1].eventType).toBe('created');
      expect(history[1].newVersion).toBe(1);
      expect(history[1].previousValue).toBeNull();
    });

    it('captures audit event for revert', async () => {
      await store.putOverride(makeWriteRequest(), TEST_ACTOR);
      await store.revertOverride(
        { key: 'ADMIN_UPNS', reason: 'reverting', expectedVersion: 1 },
        TEST_ACTOR,
      );

      const history = await store.getHistory('ADMIN_UPNS');
      expect(history).toHaveLength(2);
      expect(history[0].eventType).toBe('reverted');
      expect(history[0].newValue).toBeNull();
    });

    it('audit events include actor and reason', async () => {
      await store.putOverride(makeWriteRequest(), TEST_ACTOR);

      const history = await store.getHistory('ADMIN_UPNS');
      expect(history[0].actor.upn).toBe('admin@hb.com');
      expect(history[0].reason).toBe('Updated admin list');
    });
  });
});

// ─── Serialization Round-Trips ──────────────────────────────────────────────────

describe('P10-04 Override record serialization round-trip', () => {
  const record = {
    key: 'ADMIN_UPNS',
    domain: 'access-control',
    value: 'admin@hb.com,admin2@hb.com',
    version: 3,
    status: 'published' as const,
    lastModifiedBy: TEST_ACTOR,
    lastModifiedAt: '2026-04-03T12:00:00.000Z',
    createdAt: '2026-04-01T08:00:00.000Z',
    reason: 'Updated admin list',
  };

  it('serializes and deserializes override record with all fields', () => {
    const serialized = serializeOverrideRecord(record);
    const deserialized = deserializeOverrideRecord(serialized);

    expect(deserialized.key).toBe('ADMIN_UPNS');
    expect(deserialized.domain).toBe('access-control');
    expect(deserialized.value).toBe('admin@hb.com,admin2@hb.com');
    expect(deserialized.version).toBe(3);
    expect(deserialized.status).toBe('published');
    expect(deserialized.lastModifiedBy.upn).toBe('admin@hb.com');
    expect(deserialized.lastModifiedAt).toBe('2026-04-03T12:00:00.000Z');
    expect(deserialized.createdAt).toBe('2026-04-01T08:00:00.000Z');
    expect(deserialized.reason).toBe('Updated admin list');
  });

  it('serializes partitionKey as domain and rowKey as key', () => {
    const serialized = serializeOverrideRecord(record);
    expect(serialized.partitionKey).toBe('access-control');
    expect(serialized.rowKey).toBe('ADMIN_UPNS');
  });

  it('handles null value gracefully', () => {
    const reverted = { ...record, value: null, status: 'reverted' as const };
    const serialized = serializeOverrideRecord(reverted);
    const deserialized = deserializeOverrideRecord(serialized);

    expect(deserialized.value).toBeNull();
    expect(deserialized.status).toBe('reverted');
  });
});

describe('P10-04 Audit event serialization round-trip', () => {
  const event = {
    eventId: 'evt-001',
    eventType: 'updated' as const,
    configKey: 'ADMIN_UPNS',
    domain: 'access-control',
    previousValue: 'old@hb.com',
    newValue: 'new@hb.com',
    previousVersion: 2,
    newVersion: 3,
    actor: TEST_ACTOR,
    timestamp: '2026-04-03T12:00:00.000Z',
    reason: 'Updated admin list',
  };

  it('serializes and deserializes audit event with all fields', () => {
    const serialized = serializeAuditEvent(event);
    const deserialized = deserializeAuditEvent(serialized);

    expect(deserialized.eventId).toBe('evt-001');
    expect(deserialized.eventType).toBe('updated');
    expect(deserialized.configKey).toBe('ADMIN_UPNS');
    expect(deserialized.domain).toBe('access-control');
    expect(deserialized.previousValue).toBe('old@hb.com');
    expect(deserialized.newValue).toBe('new@hb.com');
    expect(deserialized.previousVersion).toBe(2);
    expect(deserialized.newVersion).toBe(3);
    expect(deserialized.actor.upn).toBe('admin@hb.com');
    expect(deserialized.reason).toBe('Updated admin list');
  });

  it('serializes partitionKey as configKey and rowKey as eventId', () => {
    const serialized = serializeAuditEvent(event);
    expect(serialized.partitionKey).toBe('ADMIN_UPNS');
    expect(serialized.rowKey).toBe('evt-001');
  });

  it('handles null values for created events', () => {
    const created = {
      ...event,
      eventType: 'created' as const,
      previousValue: null,
      previousVersion: null,
    };
    const serialized = serializeAuditEvent(created);
    const deserialized = deserializeAuditEvent(serialized);

    expect(deserialized.previousValue).toBeNull();
    expect(deserialized.previousVersion).toBeNull();
  });
});
