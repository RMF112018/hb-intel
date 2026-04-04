/**
 * Config Resolution Service — Phase 10 resolution engine and snapshot tests.
 *
 * Tests effective-value resolution, provenance reporting, precedence order,
 * secret exclusion, snapshot capture/retrieval, and run-to-config linkage.
 *
 * @module admin-control-plane/tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type { IAdminActorContext } from '@hbc/models/admin-control-plane';
import type { IResolvableCatalogEntry, EnvReader } from '../config-resolution-service.js';
import { ConfigResolutionService } from '../config-resolution-service.js';
import { MockConfigOverrideStore } from '../config-override-store.js';
import { MockConfigSnapshotStore } from '../config-snapshot-store.js';

const TEST_ACTOR: IAdminActorContext = {
  upn: 'admin@hb.com',
  objectId: 'oid-123',
  displayName: 'Test Admin',
  capturedAt: new Date().toISOString(),
};

// ── Test catalog entries ────────────────────────────────────────────────────

const CATALOG: IResolvableCatalogEntry[] = [
  {
    key: 'ADMIN_UPNS',
    domain: 'access-control',
    defaultValue: '',
    liveEditable: true,
    secret: false,
    infrastructureControlled: false,
  },
  {
    key: 'CONTROLLER_UPNS',
    domain: 'access-control',
    defaultValue: '',
    liveEditable: true,
    secret: false,
    infrastructureControlled: false,
  },
  {
    key: 'PROVISIONING_STEP5_TIMEOUT_MS',
    domain: 'rollout',
    defaultValue: 90000,
    liveEditable: true,
    secret: false,
    infrastructureControlled: false,
  },
  {
    key: 'AZURE_TENANT_ID',
    domain: 'identity',
    defaultValue: null,
    liveEditable: false,
    secret: false,
    infrastructureControlled: true,
  },
  {
    key: 'SHAREPOINT_TENANT_URL',
    domain: 'sharepoint',
    defaultValue: null,
    liveEditable: false,
    secret: false,
    infrastructureControlled: true,
  },
  {
    key: 'AzureSignalRConnectionString',
    domain: 'infrastructure',
    defaultValue: null,
    liveEditable: false,
    secret: true,
    infrastructureControlled: true,
  },
  {
    key: 'EMAIL_DELIVERY_API_KEY',
    domain: 'notification',
    defaultValue: null,
    liveEditable: false,
    secret: true,
    infrastructureControlled: false,
  },
];

// ── Test environment reader ─────────────────────────────────────────────────

function createTestEnvReader(env: Record<string, string>): EnvReader {
  return (key: string) => env[key];
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe('ConfigResolutionService', () => {
  let overrideStore: MockConfigOverrideStore;
  let snapshotStore: MockConfigSnapshotStore;
  let service: ConfigResolutionService;
  let envReader: EnvReader;

  beforeEach(() => {
    overrideStore = new MockConfigOverrideStore();
    snapshotStore = new MockConfigSnapshotStore();
    envReader = createTestEnvReader({
      AZURE_TENANT_ID: 'test-tenant-id',
      SHAREPOINT_TENANT_URL: 'https://test.sharepoint.com',
      AzureSignalRConnectionString: 'secret-conn-string',
    });
    service = new ConfigResolutionService(CATALOG, overrideStore, snapshotStore, envReader);
  });

  // ── resolveItem ─────────────────────────────────────────────────────────

  describe('resolveItem', () => {
    it('returns null for unknown key', async () => {
      const result = await service.resolveItem('NONEXISTENT');
      expect(result).toBeNull();
    });

    it('returns code default when no override exists', async () => {
      const result = await service.resolveItem('PROVISIONING_STEP5_TIMEOUT_MS');

      expect(result).not.toBeNull();
      expect(result!.key).toBe('PROVISIONING_STEP5_TIMEOUT_MS');
      expect(result!.effectiveValue).toBe(90000);
      expect(result!.source).toBe('code-default');
      expect(result!.version).toBeNull();
      expect(result!.lastChangedBy).toBeNull();
      expect(result!.codeDefault).toBe(90000);
      expect(result!.validationStatus).toBe('valid');
    });

    it('returns live override when published', async () => {
      await overrideStore.putOverride(
        { key: 'ADMIN_UPNS', domain: 'access-control', value: 'admin@hb.com', reason: 'setup', expectedVersion: null },
        TEST_ACTOR,
      );

      const result = await service.resolveItem('ADMIN_UPNS');

      expect(result!.effectiveValue).toBe('admin@hb.com');
      expect(result!.source).toBe('live-override');
      expect(result!.version).toBe(1);
      expect(result!.lastChangedBy!.upn).toBe('admin@hb.com');
      expect(result!.codeDefault).toBe('');
    });

    it('falls back to code default when override is reverted', async () => {
      await overrideStore.putOverride(
        { key: 'ADMIN_UPNS', domain: 'access-control', value: 'admin@hb.com', reason: 'setup', expectedVersion: null },
        TEST_ACTOR,
      );
      await overrideStore.revertOverride(
        { key: 'ADMIN_UPNS', reason: 'revert', expectedVersion: 1 },
        TEST_ACTOR,
      );

      const result = await service.resolveItem('ADMIN_UPNS');

      expect(result!.effectiveValue).toBe('');
      expect(result!.source).toBe('code-default');
    });

    it('returns infrastructure value from env', async () => {
      const result = await service.resolveItem('AZURE_TENANT_ID');

      expect(result!.effectiveValue).toBe('test-tenant-id');
      expect(result!.source).toBe('infrastructure');
      expect(result!.version).toBeNull();
    });

    it('falls back to code default when env var not set for infra item', async () => {
      const emptyEnv = createTestEnvReader({});
      const svc = new ConfigResolutionService(CATALOG, overrideStore, snapshotStore, emptyEnv);

      const result = await svc.resolveItem('AZURE_TENANT_ID');

      expect(result!.effectiveValue).toBeNull(); // defaultValue is null
      expect(result!.source).toBe('code-default');
    });

    it('excludes secret items from resolution', async () => {
      const result1 = await service.resolveItem('AzureSignalRConnectionString');
      expect(result1).toBeNull();

      const result2 = await service.resolveItem('EMAIL_DELIVERY_API_KEY');
      expect(result2).toBeNull();
    });
  });

  // ── resolveAll ──────────────────────────────────────────────────────────

  describe('resolveAll', () => {
    it('resolves all non-secret items', async () => {
      const results = await service.resolveAll();

      // 7 catalog entries - 2 secrets = 5 resolvable
      expect(results).toHaveLength(5);
      expect(results.find(r => r.key === 'AzureSignalRConnectionString')).toBeUndefined();
      expect(results.find(r => r.key === 'EMAIL_DELIVERY_API_KEY')).toBeUndefined();
    });

    it('filters by domain', async () => {
      const results = await service.resolveAll('access-control');

      expect(results).toHaveLength(2);
      expect(results.every(r => r.key === 'ADMIN_UPNS' || r.key === 'CONTROLLER_UPNS')).toBe(true);
    });

    it('includes provenance for each item', async () => {
      await overrideStore.putOverride(
        { key: 'ADMIN_UPNS', domain: 'access-control', value: 'admin@hb.com', reason: 'setup', expectedVersion: null },
        TEST_ACTOR,
      );

      const results = await service.resolveAll('access-control');
      const adminItem = results.find(r => r.key === 'ADMIN_UPNS')!;
      const controllerItem = results.find(r => r.key === 'CONTROLLER_UPNS')!;

      expect(adminItem.source).toBe('live-override');
      expect(adminItem.version).toBe(1);
      expect(controllerItem.source).toBe('code-default');
      expect(controllerItem.version).toBeNull();
    });
  });

  // ── Precedence ──────────────────────────────────────────────────────────

  describe('precedence', () => {
    it('infrastructure value beats everything — live override not possible for infra items', async () => {
      // Infrastructure-controlled items have liveEditable: false in catalog,
      // so the override store would never have an entry for them.
      // The resolution engine reads from env, not from the store.
      const result = await service.resolveItem('AZURE_TENANT_ID');

      expect(result!.source).toBe('infrastructure');
      expect(result!.effectiveValue).toBe('test-tenant-id');
    });

    it('live override beats code default', async () => {
      await overrideStore.putOverride(
        { key: 'PROVISIONING_STEP5_TIMEOUT_MS', domain: 'rollout', value: 120000, reason: 'tuning', expectedVersion: null },
        TEST_ACTOR,
      );

      const result = await service.resolveItem('PROVISIONING_STEP5_TIMEOUT_MS');

      expect(result!.effectiveValue).toBe(120000);
      expect(result!.source).toBe('live-override');
      expect(result!.codeDefault).toBe(90000); // Original default still available
    });
  });

  // ── Snapshots ─────────────────────────────────────────────────────────

  describe('captureSnapshot', () => {
    it('captures immutable snapshot of current effective config', async () => {
      await overrideStore.putOverride(
        { key: 'ADMIN_UPNS', domain: 'access-control', value: 'admin@hb.com', reason: 'setup', expectedVersion: null },
        TEST_ACTOR,
      );

      const snapshot = await service.captureSnapshot();

      expect(snapshot.snapshotId).toBeTruthy();
      expect(snapshot.resolvedAt).toBeTruthy();
      expect(snapshot.effectiveValues['ADMIN_UPNS']).toBe('admin@hb.com');
      expect(snapshot.effectiveValues['AZURE_TENANT_ID']).toBe('test-tenant-id');
      expect(snapshot.sourceMap['ADMIN_UPNS']).toBe('live-override');
      expect(snapshot.sourceMap['AZURE_TENANT_ID']).toBe('infrastructure');
      expect(snapshot.versionMap['ADMIN_UPNS']).toBe(1);
    });

    it('excludes secrets from snapshot', async () => {
      const snapshot = await service.captureSnapshot();

      expect(snapshot.effectiveValues['AzureSignalRConnectionString']).toBeUndefined();
      expect(snapshot.effectiveValues['EMAIL_DELIVERY_API_KEY']).toBeUndefined();
    });

    it('captures domain-scoped snapshot', async () => {
      const snapshot = await service.captureSnapshot('access-control');

      expect(Object.keys(snapshot.effectiveValues)).toHaveLength(2);
      expect(snapshot.effectiveValues['ADMIN_UPNS']).toBeDefined();
      expect(snapshot.effectiveValues['CONTROLLER_UPNS']).toBeDefined();
      expect(snapshot.effectiveValues['AZURE_TENANT_ID']).toBeUndefined();
    });
  });

  describe('getSnapshot', () => {
    it('retrieves a previously captured snapshot', async () => {
      const captured = await service.captureSnapshot();
      const retrieved = await service.getSnapshot(captured.snapshotId);

      expect(retrieved).not.toBeNull();
      expect(retrieved!.snapshotId).toBe(captured.snapshotId);
      expect(retrieved!.effectiveValues).toEqual(captured.effectiveValues);
    });

    it('returns null for non-existent snapshot', async () => {
      const result = await service.getSnapshot('nonexistent-id');
      expect(result).toBeNull();
    });
  });

  // ── Run-to-config linkage ─────────────────────────────────────────────

  describe('run-to-config traceability', () => {
    it('snapshot ID can be stored as configSnapshotRef on a run', async () => {
      const snapshot = await service.captureSnapshot();

      // Simulate what a run orchestrator would do:
      const configSnapshotRef = snapshot.snapshotId;
      expect(configSnapshotRef).toBeTruthy();
      expect(typeof configSnapshotRef).toBe('string');

      // Later, retrieve the snapshot to inspect what config the run used:
      const retrieved = await service.getSnapshot(configSnapshotRef);
      expect(retrieved).not.toBeNull();
      expect(retrieved!.effectiveValues).toBeTruthy();
      expect(retrieved!.sourceMap).toBeTruthy();
      expect(retrieved!.versionMap).toBeTruthy();
    });

    it('snapshot is immutable — changes after capture do not affect it', async () => {
      await overrideStore.putOverride(
        { key: 'ADMIN_UPNS', domain: 'access-control', value: 'before@hb.com', reason: 'setup', expectedVersion: null },
        TEST_ACTOR,
      );

      const snapshot = await service.captureSnapshot();

      // Change the value after snapshot
      await overrideStore.putOverride(
        { key: 'ADMIN_UPNS', domain: 'access-control', value: 'after@hb.com', reason: 'update', expectedVersion: 1 },
        TEST_ACTOR,
      );

      // Snapshot still has the old value
      const retrieved = await service.getSnapshot(snapshot.snapshotId);
      expect(retrieved!.effectiveValues['ADMIN_UPNS']).toBe('before@hb.com');

      // But live resolution reflects the new value
      const current = await service.resolveItem('ADMIN_UPNS');
      expect(current!.effectiveValue).toBe('after@hb.com');
    });
  });
});

// ─── Snapshot store tests ───────────────────────────────────────────────────

describe('MockConfigSnapshotStore', () => {
  let store: MockConfigSnapshotStore;

  beforeEach(() => {
    store = new MockConfigSnapshotStore();
  });

  it('saves and retrieves a snapshot', async () => {
    const snapshot = {
      snapshotId: 'snap-001',
      resolvedAt: new Date().toISOString(),
      versionMap: { ADMIN_UPNS: 1 },
      effectiveValues: { ADMIN_UPNS: 'admin@hb.com' },
      sourceMap: { ADMIN_UPNS: 'live-override' as const },
    };

    await store.saveSnapshot(snapshot);
    const retrieved = await store.getSnapshot('snap-001');

    expect(retrieved).not.toBeNull();
    expect(retrieved!.snapshotId).toBe('snap-001');
  });

  it('rejects duplicate snapshot ID (immutability)', async () => {
    const snapshot = {
      snapshotId: 'snap-001',
      resolvedAt: new Date().toISOString(),
      versionMap: {},
      effectiveValues: {},
      sourceMap: {},
    };

    await store.saveSnapshot(snapshot);
    await expect(store.saveSnapshot(snapshot)).rejects.toThrow(/already exists/);
  });

  it('returns null for non-existent snapshot', async () => {
    const result = await store.getSnapshot('nonexistent');
    expect(result).toBeNull();
  });
});
