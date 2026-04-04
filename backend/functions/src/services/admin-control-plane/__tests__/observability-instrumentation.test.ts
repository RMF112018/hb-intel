/**
 * Phase 12 — Cross-Domain Observability Instrumentation Tests
 *
 * Tests covering:
 * - Route error emitter classification logic
 * - Fire-and-forget safety
 * - Domain-specific error emission
 */

import { describe, expect, it, vi } from 'vitest';
import {
  AdminDomain,
  ObservabilityErrorClassification,
  ObservabilityErrorSource,
  ObservabilityAlertSeverity,
} from '@hbc/models/admin-control-plane';
import { MockObservabilityErrorStore } from '../observability-error-store.js';

// Import the emitter — we test its behavior via the mock store
import { emitRouteError } from '../../../functions/adminApi/observability-emitter.js';

// ─── Helpers ────────────────────────────────────────────────────────────────────

function createMockServices(errorStore = new MockObservabilityErrorStore()) {
  return {
    observabilityErrorStore: errorStore,
  } as never; // Only needs observabilityErrorStore for emitRouteError
}

// ─── Classification Tests ───────────────────────────────────────────────────────

describe('emitRouteError', () => {
  it('emits an error record to the observability store', async () => {
    const errorStore = new MockObservabilityErrorStore();
    const services = createMockServices(errorStore);

    emitRouteError(
      services,
      {
        domain: AdminDomain.ProvisioningRollout,
        source: ObservabilityErrorSource.AdminRun,
        operation: 'cancelRun',
        runId: 'run-001',
        actionKey: 'admin.cancel-run',
      },
      new Error('Run not in cancellable state'),
    );

    // Give the fire-and-forget promise time to resolve
    await new Promise(resolve => setTimeout(resolve, 10));

    const result = await errorStore.listErrors({
      domain: null, source: null, classification: null, severity: null,
      runId: 'run-001', from: null, to: null, cursor: null, limit: 50,
    });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].domain).toBe(AdminDomain.ProvisioningRollout);
    expect(result.items[0].source).toBe(ObservabilityErrorSource.AdminRun);
    expect(result.items[0].title).toBe('cancelRun failed');
    expect(result.items[0].message).toBe('Run not in cancellable state');
    expect(result.items[0].runId).toBe('run-001');
    expect(result.items[0].actionKey).toBe('admin.cancel-run');
  });

  it('classifies "not found" errors as structural', async () => {
    const errorStore = new MockObservabilityErrorStore();
    const services = createMockServices(errorStore);

    emitRouteError(
      services,
      { domain: AdminDomain.ProvisioningRollout, source: ObservabilityErrorSource.AdminRun, operation: 'test', runId: null, actionKey: null },
      new Error('Run not found'),
    );

    await new Promise(resolve => setTimeout(resolve, 10));

    const result = await errorStore.listErrors({
      domain: null, source: null, classification: null, severity: null,
      runId: null, from: null, to: null, cursor: null, limit: 50,
    });
    expect(result.items[0].classification).toBe(ObservabilityErrorClassification.Structural);
  });

  it('classifies permission errors as permissions with high severity', async () => {
    const errorStore = new MockObservabilityErrorStore();
    const services = createMockServices(errorStore);

    emitRouteError(
      services,
      { domain: AdminDomain.EntraControl, source: ObservabilityErrorSource.EntraControl, operation: 'test', runId: null, actionKey: null },
      new Error('Insufficient permission to modify group'),
    );

    await new Promise(resolve => setTimeout(resolve, 10));

    const result = await errorStore.listErrors({
      domain: null, source: null, classification: null, severity: null,
      runId: null, from: null, to: null, cursor: null, limit: 50,
    });
    expect(result.items[0].classification).toBe(ObservabilityErrorClassification.Permissions);
    expect(result.items[0].severity).toBe(ObservabilityAlertSeverity.High);
  });

  it('classifies timeout errors as transient', async () => {
    const errorStore = new MockObservabilityErrorStore();
    const services = createMockServices(errorStore);

    emitRouteError(
      services,
      { domain: AdminDomain.SharePointControl, source: ObservabilityErrorSource.SharePointControl, operation: 'test', runId: null, actionKey: null },
      new Error('Request timeout after 30s'),
    );

    await new Promise(resolve => setTimeout(resolve, 10));

    const result = await errorStore.listErrors({
      domain: null, source: null, classification: null, severity: null,
      runId: null, from: null, to: null, cursor: null, limit: 50,
    });
    expect(result.items[0].classification).toBe(ObservabilityErrorClassification.Transient);
  });

  it('classifies invalid state as admin-class', async () => {
    const errorStore = new MockObservabilityErrorStore();
    const services = createMockServices(errorStore);

    emitRouteError(
      services,
      { domain: AdminDomain.ProvisioningRollout, source: ObservabilityErrorSource.AdminRun, operation: 'test', runId: null, actionKey: null },
      new Error('Invalid state transition'),
    );

    await new Promise(resolve => setTimeout(resolve, 10));

    const result = await errorStore.listErrors({
      domain: null, source: null, classification: null, severity: null,
      runId: null, from: null, to: null, cursor: null, limit: 50,
    });
    expect(result.items[0].classification).toBe(ObservabilityErrorClassification.AdminClass);
  });

  it('classifies unknown errors as unclassified', async () => {
    const errorStore = new MockObservabilityErrorStore();
    const services = createMockServices(errorStore);

    emitRouteError(
      services,
      { domain: AdminDomain.ProvisioningRollout, source: ObservabilityErrorSource.AdminRun, operation: 'test', runId: null, actionKey: null },
      new Error('Something unexpected'),
    );

    await new Promise(resolve => setTimeout(resolve, 10));

    const result = await errorStore.listErrors({
      domain: null, source: null, classification: null, severity: null,
      runId: null, from: null, to: null, cursor: null, limit: 50,
    });
    expect(result.items[0].classification).toBe(ObservabilityErrorClassification.Unclassified);
  });

  it('handles non-Error objects gracefully', async () => {
    const errorStore = new MockObservabilityErrorStore();
    const services = createMockServices(errorStore);

    emitRouteError(
      services,
      { domain: AdminDomain.ProvisioningRollout, source: ObservabilityErrorSource.AdminRun, operation: 'test', runId: null, actionKey: null },
      'string error',
    );

    await new Promise(resolve => setTimeout(resolve, 10));

    const result = await errorStore.listErrors({
      domain: null, source: null, classification: null, severity: null,
      runId: null, from: null, to: null, cursor: null, limit: 50,
    });
    expect(result.items[0].message).toBe('string error');
  });

  it('does not throw when store fails (fire-and-forget)', () => {
    const failingStore = {
      ingestErrors: async () => { throw new Error('Store unavailable'); },
      getError: async () => null,
      listErrors: async () => ({ items: [], nextCursor: null, totalCount: 0 }),
    };
    const services = createMockServices(failingStore as never);

    // Should not throw
    expect(() => {
      emitRouteError(
        services,
        { domain: AdminDomain.ProvisioningRollout, source: ObservabilityErrorSource.AdminRun, operation: 'test', runId: null, actionKey: null },
        new Error('test'),
      );
    }).not.toThrow();
  });

  it('emits with correct domain for white-glove operations', async () => {
    const errorStore = new MockObservabilityErrorStore();
    const services = createMockServices(errorStore);

    emitRouteError(
      services,
      {
        domain: AdminDomain.WhiteGloveDeployment,
        source: ObservabilityErrorSource.WhiteGloveDeployment,
        operation: 'launchPackageRun',
        runId: null,
        actionKey: 'white-glove.launch',
      },
      new Error('Launch validation failed'),
    );

    await new Promise(resolve => setTimeout(resolve, 10));

    const result = await errorStore.listErrors({
      domain: AdminDomain.WhiteGloveDeployment, source: null, classification: null,
      severity: null, runId: null, from: null, to: null, cursor: null, limit: 50,
    });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].domain).toBe(AdminDomain.WhiteGloveDeployment);
    expect(result.items[0].source).toBe(ObservabilityErrorSource.WhiteGloveDeployment);
  });
});
