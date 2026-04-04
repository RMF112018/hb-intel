/**
 * Config Versioning Service — Phase 10 version/history/diff tests.
 *
 * Tests the ConfigVersioningService backed by MockConfigOverrideStore.
 * Covers: concurrent update rejection, version retrieval, diff stability,
 * publish/revert behavior, and audit event emission.
 *
 * @module admin-control-plane/tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type { IAdminActorContext, IConfigOverrideWriteRequest } from '@hbc/models/admin-control-plane';
import { MockConfigOverrideStore } from '../config-override-store.js';
import { ConfigVersioningService, stableEquals, buildDiffSummary } from '../config-versioning-service.js';

const TEST_ACTOR: IAdminActorContext = {
  upn: 'admin@hb.com',
  objectId: 'oid-123',
  displayName: 'Test Admin',
  capturedAt: new Date().toISOString(),
};

const SECOND_ACTOR: IAdminActorContext = {
  upn: 'admin2@hb.com',
  objectId: 'oid-456',
  displayName: 'Second Admin',
  capturedAt: new Date().toISOString(),
};

function makeWriteRequest(overrides?: Partial<IConfigOverrideWriteRequest>): IConfigOverrideWriteRequest {
  return {
    key: 'ADMIN_UPNS',
    domain: 'access-control',
    value: 'admin@hb.com',
    reason: 'Initial setup',
    expectedVersion: null,
    ...overrides,
  };
}

describe('ConfigVersioningService', () => {
  let store: MockConfigOverrideStore;
  let service: ConfigVersioningService;

  beforeEach(() => {
    store = new MockConfigOverrideStore();
    service = new ConfigVersioningService(store);
  });

  // ── publish ─────────────────────────────────────────────────────────────

  describe('publish', () => {
    it('creates a new override at version 1', async () => {
      const result = await service.publish(makeWriteRequest(), TEST_ACTOR);

      expect(result.key).toBe('ADMIN_UPNS');
      expect(result.version).toBe(1);
      expect(result.status).toBe('published');
      expect(result.value).toBe('admin@hb.com');
    });

    it('increments version on subsequent publish', async () => {
      await service.publish(makeWriteRequest(), TEST_ACTOR);
      const result = await service.publish(
        makeWriteRequest({ value: 'updated@hb.com', expectedVersion: 1 }),
        SECOND_ACTOR,
      );

      expect(result.version).toBe(2);
      expect(result.value).toBe('updated@hb.com');
      expect(result.lastModifiedBy.upn).toBe('admin2@hb.com');
    });
  });

  // ── concurrent update rejection ────────────────────────────────────────

  describe('concurrent update rejection', () => {
    it('rejects publish with stale expectedVersion', async () => {
      await service.publish(makeWriteRequest(), TEST_ACTOR);
      await service.publish(
        makeWriteRequest({ value: 'v2@hb.com', expectedVersion: 1 }),
        TEST_ACTOR,
      );

      // Another caller still thinks we're at version 1
      await expect(
        service.publish(
          makeWriteRequest({ value: 'stale@hb.com', expectedVersion: 1 }),
          SECOND_ACTOR,
        ),
      ).rejects.toThrow(/Concurrency conflict/);
    });

    it('rejects revert with stale expectedVersion', async () => {
      await service.publish(makeWriteRequest(), TEST_ACTOR);
      await service.publish(
        makeWriteRequest({ value: 'v2@hb.com', expectedVersion: 1 }),
        TEST_ACTOR,
      );

      await expect(
        service.revert({ key: 'ADMIN_UPNS', reason: 'stale revert', expectedVersion: 1 }, SECOND_ACTOR),
      ).rejects.toThrow(/Concurrency conflict/);
    });

    it('prevents silent overwrite of newer value', async () => {
      await service.publish(makeWriteRequest(), TEST_ACTOR);

      // Two callers read version 1 concurrently
      // First caller succeeds
      await service.publish(
        makeWriteRequest({ value: 'caller1@hb.com', expectedVersion: 1 }),
        TEST_ACTOR,
      );
      // Second caller fails — newer value exists
      await expect(
        service.publish(
          makeWriteRequest({ value: 'caller2@hb.com', expectedVersion: 1 }),
          SECOND_ACTOR,
        ),
      ).rejects.toThrow(/Concurrency conflict/);

      // Value should be caller1's, not caller2's
      const current = await service.getCurrent('ADMIN_UPNS');
      expect(current!.value).toBe('caller1@hb.com');
    });
  });

  // ── revert ──────────────────────────────────────────────────────────────

  describe('revert', () => {
    it('reverts to code default', async () => {
      await service.publish(makeWriteRequest(), TEST_ACTOR);

      const result = await service.revert(
        { key: 'ADMIN_UPNS', reason: 'Reverting to default', expectedVersion: 1 },
        TEST_ACTOR,
      );

      expect(result.status).toBe('reverted');
      expect(result.value).toBeNull();
      expect(result.version).toBe(2);
    });

    it('creates an auditable event on revert', async () => {
      await service.publish(makeWriteRequest(), TEST_ACTOR);
      await service.revert(
        { key: 'ADMIN_UPNS', reason: 'Reverting', expectedVersion: 1 },
        TEST_ACTOR,
      );

      const history = await service.getVersionHistory('ADMIN_UPNS');
      expect(history!.versions[0].eventType).toBe('reverted');
      expect(history!.versions[0].reason).toBe('Reverting');
    });
  });

  // ── getVersion ──────────────────────────────────────────────────────────

  describe('getVersion', () => {
    it('returns null for non-existent key', async () => {
      const result = await service.getVersion('NONEXISTENT', 1);
      expect(result).toBeNull();
    });

    it('returns null for non-existent version', async () => {
      await service.publish(makeWriteRequest(), TEST_ACTOR);
      const result = await service.getVersion('ADMIN_UPNS', 99);
      expect(result).toBeNull();
    });

    it('returns the specific version snapshot', async () => {
      await service.publish(makeWriteRequest({ value: 'v1@hb.com' }), TEST_ACTOR);
      await service.publish(
        makeWriteRequest({ value: 'v2@hb.com', expectedVersion: 1 }),
        SECOND_ACTOR,
      );

      const v1 = await service.getVersion('ADMIN_UPNS', 1);
      expect(v1).not.toBeNull();
      expect(v1!.version).toBe(1);
      expect(v1!.value).toBe('v1@hb.com');
      expect(v1!.actor.upn).toBe('admin@hb.com');

      const v2 = await service.getVersion('ADMIN_UPNS', 2);
      expect(v2).not.toBeNull();
      expect(v2!.version).toBe(2);
      expect(v2!.value).toBe('v2@hb.com');
      expect(v2!.actor.upn).toBe('admin2@hb.com');
    });

    it('returns reverted version with null value', async () => {
      await service.publish(makeWriteRequest(), TEST_ACTOR);
      await service.revert(
        { key: 'ADMIN_UPNS', reason: 'revert', expectedVersion: 1 },
        TEST_ACTOR,
      );

      const v2 = await service.getVersion('ADMIN_UPNS', 2);
      expect(v2!.status).toBe('reverted');
      expect(v2!.value).toBeNull();
    });
  });

  // ── getVersionHistory ──────────────────────────────────────────────────

  describe('getVersionHistory', () => {
    it('returns null for non-existent key', async () => {
      const result = await service.getVersionHistory('NONEXISTENT');
      expect(result).toBeNull();
    });

    it('returns structured version list newest first', async () => {
      await service.publish(makeWriteRequest({ value: 'v1' }), TEST_ACTOR);
      await service.publish(
        makeWriteRequest({ value: 'v2', expectedVersion: 1 }),
        SECOND_ACTOR,
      );

      const history = await service.getVersionHistory('ADMIN_UPNS');
      expect(history).not.toBeNull();
      expect(history!.key).toBe('ADMIN_UPNS');
      expect(history!.currentVersion).toBe(2);
      expect(history!.currentStatus).toBe('published');
      expect(history!.total).toBe(2);
      expect(history!.versions).toHaveLength(2);
      expect(history!.versions[0].version).toBe(2);
      expect(history!.versions[1].version).toBe(1);
    });

    it('reflects reverted status in current', async () => {
      await service.publish(makeWriteRequest(), TEST_ACTOR);
      await service.revert(
        { key: 'ADMIN_UPNS', reason: 'revert', expectedVersion: 1 },
        TEST_ACTOR,
      );

      const history = await service.getVersionHistory('ADMIN_UPNS');
      expect(history!.currentStatus).toBe('reverted');
    });
  });

  // ── diffVersions ──────────────────────────────────────────────────────

  describe('diffVersions', () => {
    it('returns null for non-existent key', async () => {
      const result = await service.diffVersions('NONEXISTENT', null, 1);
      expect(result).toBeNull();
    });

    it('returns null for non-existent target version', async () => {
      await service.publish(makeWriteRequest(), TEST_ACTOR);
      const result = await service.diffVersions('ADMIN_UPNS', null, 99);
      expect(result).toBeNull();
    });

    it('diffs code default (null) against first version', async () => {
      await service.publish(makeWriteRequest({ value: 'admin@hb.com' }), TEST_ACTOR);

      const diff = await service.diffVersions('ADMIN_UPNS', null, 1);
      expect(diff).not.toBeNull();
      expect(diff!.fromVersion).toBeNull();
      expect(diff!.toVersion).toBe(1);
      expect(diff!.fromValue).toBeNull();
      expect(diff!.toValue).toBe('admin@hb.com');
      expect(diff!.unchanged).toBe(false);
      expect(diff!.summary).toContain('code default');
    });

    it('diffs between two versions', async () => {
      await service.publish(makeWriteRequest({ value: 'v1@hb.com' }), TEST_ACTOR);
      await service.publish(
        makeWriteRequest({ value: 'v2@hb.com', expectedVersion: 1 }),
        SECOND_ACTOR,
      );

      const diff = await service.diffVersions('ADMIN_UPNS', 1, 2);
      expect(diff).not.toBeNull();
      expect(diff!.fromVersion).toBe(1);
      expect(diff!.toVersion).toBe(2);
      expect(diff!.fromValue).toBe('v1@hb.com');
      expect(diff!.toValue).toBe('v2@hb.com');
      expect(diff!.unchanged).toBe(false);
      expect(diff!.actor.upn).toBe('admin2@hb.com');
    });

    it('reports unchanged when values are identical', async () => {
      await service.publish(makeWriteRequest({ value: 'same@hb.com' }), TEST_ACTOR);
      // Publish same value again (version bump but no value change)
      await service.publish(
        makeWriteRequest({ value: 'same@hb.com', expectedVersion: 1, reason: 'No-op republish' }),
        TEST_ACTOR,
      );

      const diff = await service.diffVersions('ADMIN_UPNS', 1, 2);
      expect(diff!.unchanged).toBe(true);
      expect(diff!.summary).toContain('no value change');
    });

    it('diff output is stable (deterministic)', async () => {
      await service.publish(makeWriteRequest({ value: 'a@hb.com' }), TEST_ACTOR);
      await service.publish(
        makeWriteRequest({ value: 'b@hb.com', expectedVersion: 1 }),
        TEST_ACTOR,
      );

      const diff1 = await service.diffVersions('ADMIN_UPNS', 1, 2);
      const diff2 = await service.diffVersions('ADMIN_UPNS', 1, 2);

      expect(diff1!.fromValue).toBe(diff2!.fromValue);
      expect(diff1!.toValue).toBe(diff2!.toValue);
      expect(diff1!.unchanged).toBe(diff2!.unchanged);
      expect(diff1!.summary).toBe(diff2!.summary);
    });

    it('includes actor and reason from target version', async () => {
      await service.publish(makeWriteRequest({ value: 'v1' }), TEST_ACTOR);
      await service.publish(
        makeWriteRequest({ value: 'v2', expectedVersion: 1, reason: 'Policy update' }),
        SECOND_ACTOR,
      );

      const diff = await service.diffVersions('ADMIN_UPNS', 1, 2);
      expect(diff!.actor.upn).toBe('admin2@hb.com');
      expect(diff!.reason).toBe('Policy update');
    });
  });

  // ── audit event emission ──────────────────────────────────────────────

  describe('audit event emission', () => {
    it('publish creates auditable event', async () => {
      await service.publish(makeWriteRequest(), TEST_ACTOR);

      const history = await service.getVersionHistory('ADMIN_UPNS');
      expect(history!.total).toBe(1);
      expect(history!.versions[0].eventType).toBe('created');
    });

    it('update creates auditable event', async () => {
      await service.publish(makeWriteRequest(), TEST_ACTOR);
      await service.publish(
        makeWriteRequest({ value: 'updated', expectedVersion: 1 }),
        TEST_ACTOR,
      );

      const history = await service.getVersionHistory('ADMIN_UPNS');
      expect(history!.total).toBe(2);
      expect(history!.versions[0].eventType).toBe('updated');
    });

    it('revert creates auditable event', async () => {
      await service.publish(makeWriteRequest(), TEST_ACTOR);
      await service.revert(
        { key: 'ADMIN_UPNS', reason: 'revert', expectedVersion: 1 },
        TEST_ACTOR,
      );

      const history = await service.getVersionHistory('ADMIN_UPNS');
      expect(history!.total).toBe(2);
      expect(history!.versions[0].eventType).toBe('reverted');
    });

    it('audit events capture actor and reason', async () => {
      await service.publish(
        makeWriteRequest({ reason: 'Audit test' }),
        TEST_ACTOR,
      );

      const history = await service.getVersionHistory('ADMIN_UPNS');
      const event = history!.versions[0];
      expect(event.actor.upn).toBe('admin@hb.com');
      expect(event.reason).toBe('Audit test');
    });
  });
});

// ─── stableEquals ────────────────────────────────────────────────────────────

describe('stableEquals', () => {
  it('returns true for identical primitives', () => {
    expect(stableEquals('hello', 'hello')).toBe(true);
    expect(stableEquals(42, 42)).toBe(true);
    expect(stableEquals(true, true)).toBe(true);
  });

  it('returns false for different primitives', () => {
    expect(stableEquals('hello', 'world')).toBe(false);
    expect(stableEquals(1, 2)).toBe(false);
  });

  it('returns true for deeply equal objects', () => {
    expect(stableEquals({ a: 1, b: 'x' }, { a: 1, b: 'x' })).toBe(true);
  });

  it('returns false for different objects', () => {
    expect(stableEquals({ a: 1 }, { a: 2 })).toBe(false);
  });

  it('handles null correctly', () => {
    expect(stableEquals(null, null)).toBe(true);
    expect(stableEquals(null, 'x')).toBe(false);
    expect(stableEquals('x', null)).toBe(false);
  });
});

// ─── buildDiffSummary ───────────────────────────────────────────────────────

describe('buildDiffSummary', () => {
  it('reports no value change for unchanged', () => {
    const result = buildDiffSummary(1, 2, 'same', 'same', true, 'updated');
    expect(result).toContain('no value change');
  });

  it('references code default when fromVersion is null', () => {
    const result = buildDiffSummary(null, 1, null, 'new', false, 'created');
    expect(result).toContain('code default');
  });

  it('includes version numbers in summary', () => {
    const result = buildDiffSummary(1, 2, 'old', 'new', false, 'updated');
    expect(result).toContain('version 1');
    expect(result).toContain('Version 2');
  });

  it('indicates revert in summary', () => {
    const result = buildDiffSummary(1, 2, 'val', null, false, 'reverted');
    expect(result).toContain('reverted to code default');
  });
});
