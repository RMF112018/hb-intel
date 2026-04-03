/**
 * App-Binding Store — focused unit tests.
 *
 * Tests the MockAdminAppBindingStore which shares the same logic as
 * the durable implementation but uses in-memory storage.
 *
 * @module admin-control-plane/tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AppBindingStatus } from '@hbc/models/admin-control-plane';
import type { IAdminActorContext, IAppBindingPublishRequest } from '@hbc/models/admin-control-plane';
import { MockAdminAppBindingStore } from '../app-binding-store.js';

const TEST_ACTOR: IAdminActorContext = {
  upn: 'admin@hb.com',
  objectId: 'oid-123',
  displayName: 'Test Admin',
  capturedAt: new Date().toISOString(),
};

function makePublishRequest(overrides?: Partial<IAppBindingPublishRequest>): IAppBindingPublishRequest {
  return {
    appId: 'accounting',
    functionAppUrl: 'https://hb-intel-func.azurewebsites.net',
    apiAudience: 'api://hb-intel-api',
    backendMode: 'production',
    allowBackendModeSwitch: false,
    publishSource: 'test-publish',
    ...overrides,
  };
}

describe('MockAdminAppBindingStore', () => {
  let store: MockAdminAppBindingStore;

  beforeEach(() => {
    store = new MockAdminAppBindingStore();
  });

  // ── Get Binding ────────────────────────────────────────────────────────────

  describe('getBinding', () => {
    it('returns null for unconfigured app', async () => {
      const result = await store.getBinding('accounting');
      expect(result).toBeNull();
    });

    it('returns binding after publication', async () => {
      await store.publishBinding(makePublishRequest(), TEST_ACTOR);
      const result = await store.getBinding('accounting');

      expect(result).not.toBeNull();
      expect(result!.appId).toBe('accounting');
      expect(result!.functionAppUrl).toBe('https://hb-intel-func.azurewebsites.net');
      expect(result!.apiAudience).toBe('api://hb-intel-api');
      expect(result!.backendMode).toBe('production');
      expect(result!.allowBackendModeSwitch).toBe(false);
      expect(result!.version).toBe(1);
      expect(result!.status).toBe(AppBindingStatus.Active);
    });
  });

  // ── Publish Binding ────────────────────────────────────────────────────────

  describe('publishBinding', () => {
    it('creates new binding with version 1', async () => {
      const result = await store.publishBinding(makePublishRequest(), TEST_ACTOR);

      expect(result.appId).toBe('accounting');
      expect(result.version).toBe(1);
      expect(result.status).toBe(AppBindingStatus.Active);
      expect(result.created).toBe(true);
      expect(result.publishedAt).toBeTruthy();
    });

    it('increments version on update', async () => {
      await store.publishBinding(makePublishRequest(), TEST_ACTOR);
      const result = await store.publishBinding(
        makePublishRequest({ functionAppUrl: 'https://updated.azurewebsites.net' }),
        TEST_ACTOR,
      );

      expect(result.version).toBe(2);
      expect(result.created).toBe(false);

      const binding = await store.getBinding('accounting');
      expect(binding!.functionAppUrl).toBe('https://updated.azurewebsites.net');
      expect(binding!.version).toBe(2);
    });

    it('stores publication metadata', async () => {
      await store.publishBinding(
        makePublishRequest({ publishSource: 'install-run:run-abc' }),
        TEST_ACTOR,
      );

      const binding = await store.getBinding('accounting');
      expect(binding!.publishedBy.upn).toBe('admin@hb.com');
      expect(binding!.publishSource).toBe('install-run:run-abc');
      expect(binding!.lastVerifiedAt).toBeNull();
      expect(binding!.lastVerificationResult).toBeNull();
    });
  });

  // ── List Bindings ──────────────────────────────────────────────────────────

  describe('listBindings', () => {
    it('returns empty array when no bindings exist', async () => {
      const result = await store.listBindings();
      expect(result).toEqual([]);
    });

    it('returns all published bindings', async () => {
      await store.publishBinding(makePublishRequest({ appId: 'accounting' }), TEST_ACTOR);
      await store.publishBinding(makePublishRequest({ appId: 'project-setup' }), TEST_ACTOR);

      const result = await store.listBindings();
      expect(result).toHaveLength(2);

      const appIds = result.map(b => b.appId);
      expect(appIds).toContain('accounting');
      expect(appIds).toContain('project-setup');
    });
  });

  // ── Verify Binding ─────────────────────────────────────────────────────────

  describe('verifyBinding', () => {
    it('returns inconclusive for unconfigured app', async () => {
      const result = await store.verifyBinding('accounting');

      expect(result.outcome).toBe('inconclusive');
      expect(result.version).toBe(0);
      expect(result.findings).toHaveLength(1);
      expect(result.findings[0].severity).toBe('critical');
    });

    it('passes for valid binding', async () => {
      await store.publishBinding(makePublishRequest(), TEST_ACTOR);
      const result = await store.verifyBinding('accounting');

      expect(result.outcome).toBe('passed');
      expect(result.checksPassed).toBe(2);
      expect(result.checksTotal).toBe(2);
      expect(result.findings).toHaveLength(0);

      // Status should be updated
      const binding = await store.getBinding('accounting');
      expect(binding!.lastVerifiedAt).toBeTruthy();
      expect(binding!.lastVerificationResult).toBe('passed');
    });

    it('detects drift for empty functionAppUrl', async () => {
      await store.publishBinding(
        makePublishRequest({ functionAppUrl: '' }),
        TEST_ACTOR,
      );
      const result = await store.verifyBinding('accounting');

      expect(result.outcome).toBe('drifted');
      expect(result.findings).toHaveLength(1);
      expect(result.findings[0].field).toBe('functionAppUrl');

      const binding = await store.getBinding('accounting');
      expect(binding!.status).toBe(AppBindingStatus.Drifted);
    });
  });

  // ── Repair Binding ─────────────────────────────────────────────────────────

  describe('repairBinding', () => {
    it('throws for unconfigured app', async () => {
      await expect(
        store.repairBinding(
          { appId: 'accounting', functionAppUrl: 'https://new.azurewebsites.net', apiAudience: null, backendMode: null, allowBackendModeSwitch: null, rationale: 'test' },
          TEST_ACTOR,
        ),
      ).rejects.toThrow("Cannot repair binding for 'accounting'");
    });

    it('repairs with corrected values', async () => {
      await store.publishBinding(makePublishRequest(), TEST_ACTOR);
      const result = await store.repairBinding(
        {
          appId: 'accounting',
          functionAppUrl: 'https://repaired.azurewebsites.net',
          apiAudience: null,
          backendMode: null,
          allowBackendModeSwitch: null,
          rationale: 'URL changed after migration',
        },
        TEST_ACTOR,
      );

      expect(result.version).toBe(2);
      expect(result.status).toBe(AppBindingStatus.Active);
      expect(result.fieldsChanged).toBe(1);

      const binding = await store.getBinding('accounting');
      expect(binding!.functionAppUrl).toBe('https://repaired.azurewebsites.net');
      expect(binding!.apiAudience).toBe('api://hb-intel-api'); // unchanged
      expect(binding!.version).toBe(2);
    });

    it('keeps existing values when null provided', async () => {
      await store.publishBinding(makePublishRequest(), TEST_ACTOR);
      const result = await store.repairBinding(
        { appId: 'accounting', functionAppUrl: null, apiAudience: null, backendMode: null, allowBackendModeSwitch: null, rationale: 'no-op repair' },
        TEST_ACTOR,
      );

      expect(result.fieldsChanged).toBe(0);
      expect(result.version).toBe(2); // still increments

      const binding = await store.getBinding('accounting');
      expect(binding!.functionAppUrl).toBe('https://hb-intel-func.azurewebsites.net');
    });
  });
});
