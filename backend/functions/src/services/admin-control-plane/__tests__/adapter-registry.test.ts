import { describe, it, expect, beforeEach } from 'vitest';
import { AdminAdapterCategory, AdminAdapterOutcome } from '@hbc/models/admin-control-plane';
import type { IAdminAdapterDescriptor, IAdminAdapterInvocationContext, IAdminAdapterResult } from '@hbc/models/admin-control-plane';
import { AdminAdapterRegistry } from '../adapter-registry.js';
import { registerPhase3Adapters, PHASE_3_ADAPTERS } from '../adapters.js';

/**
 * P3-06: Adapter registry and execution routing tests.
 *
 * Validates registration, resolution, listing, filtering, and invocation
 * of admin control plane adapters through the normalized registry contract.
 */

const TEST_DESCRIPTOR: IAdminAdapterDescriptor = {
  adapterKey: 'test:adapter',
  category: AdminAdapterCategory.ValidationProbe,
  label: 'Test Adapter',
  description: 'Unit test adapter',
  domains: ['provisioning' as never],
  supportsDryRun: true,
  supportsCompensation: false,
  idempotent: true,
  operations: ['testOp'],
  implementationStatus: 'implemented',
};

const TEST_CONTEXT: IAdminAdapterInvocationContext = {
  runId: 'run-001',
  stepNumber: 1,
  actor: { upn: 'admin@hb.com', objectId: 'oid-1', displayName: 'Admin', capturedAt: '2026-04-02T00:00:00Z' },
  dryRun: false,
  isRetry: false,
  retryAttempt: 0,
  correlationId: 'corr-001',
  input: {},
  resolvedConfig: {},
};

describe('P3-06 AdminAdapterRegistry', () => {
  let registry: AdminAdapterRegistry;

  beforeEach(() => {
    registry = new AdminAdapterRegistry();
  });

  describe('register and resolve', () => {
    it('registers a descriptor and resolves it by key', () => {
      registry.register(TEST_DESCRIPTOR);
      const resolved = registry.resolve('test:adapter');
      expect(resolved).not.toBeNull();
      expect(resolved!.adapterKey).toBe('test:adapter');
      expect(resolved!.label).toBe('Test Adapter');
    });

    it('returns null for unregistered key', () => {
      expect(registry.resolve('nonexistent')).toBeNull();
    });

    it('overwrites descriptor on re-registration', () => {
      registry.register(TEST_DESCRIPTOR);
      registry.register({ ...TEST_DESCRIPTOR, label: 'Updated' });
      expect(registry.resolve('test:adapter')!.label).toBe('Updated');
    });
  });

  describe('listAll', () => {
    it('returns empty array when no adapters registered', () => {
      expect(registry.listAll()).toEqual([]);
    });

    it('returns all registered descriptors', () => {
      registry.register(TEST_DESCRIPTOR);
      registry.register({ ...TEST_DESCRIPTOR, adapterKey: 'test:other', label: 'Other' });
      expect(registry.listAll()).toHaveLength(2);
    });
  });

  describe('listForAction', () => {
    it('filters adapters by domain prefix from action key', () => {
      registry.register(TEST_DESCRIPTOR); // domains: ['provisioning']
      registry.register({
        ...TEST_DESCRIPTOR,
        adapterKey: 'test:entra',
        domains: ['entraControl' as never],
      });

      const provisioningAdapters = registry.listForAction('provisioning:site:create' as never);
      expect(provisioningAdapters).toHaveLength(1);
      expect(provisioningAdapters[0].adapterKey).toBe('test:adapter');
    });

    it('returns empty array when no adapters match domain', () => {
      registry.register(TEST_DESCRIPTOR);
      const result = registry.listForAction('unknownDomain:action:verb' as never);
      expect(result).toEqual([]);
    });
  });

  describe('invoke', () => {
    it('calls registered invoker and returns its result', async () => {
      const expectedResult: IAdminAdapterResult = {
        adapterKey: 'test:adapter',
        outcome: AdminAdapterOutcome.Success,
        summary: 'Test success',
        durationMs: 42,
        warnings: [],
        issues: [],
        remediationHints: [],
        evidenceRefs: [],
        adapterSpecificData: { testKey: 'testValue' },
        deduplicatedInvocation: false,
      };

      registry.register(TEST_DESCRIPTOR, async () => expectedResult);
      const result = await registry.invoke('test:adapter', TEST_CONTEXT);

      expect(result.outcome).toBe(AdminAdapterOutcome.Success);
      expect(result.summary).toBe('Test success');
      expect(result.adapterSpecificData).toEqual({ testKey: 'testValue' });
    });

    it('returns Skipped when adapter has no invoker', async () => {
      registry.register(TEST_DESCRIPTOR); // no invoker
      const result = await registry.invoke('test:adapter', TEST_CONTEXT);

      expect(result.outcome).toBe(AdminAdapterOutcome.Skipped);
      expect(result.summary).toContain('no invoker');
    });

    it('returns Skipped for unregistered adapter key', async () => {
      const result = await registry.invoke('nonexistent', TEST_CONTEXT);

      expect(result.outcome).toBe(AdminAdapterOutcome.Skipped);
      expect(result.summary).toContain('not registered');
    });

    it('returns Failed when invoker throws', async () => {
      registry.register(TEST_DESCRIPTOR, async () => {
        throw new Error('Platform error');
      });

      const result = await registry.invoke('test:adapter', TEST_CONTEXT);

      expect(result.outcome).toBe(AdminAdapterOutcome.Failed);
      expect(result.summary).toContain('Platform error');
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].code).toBe('ADAPTER_INVOCATION_ERROR');
    });

    it('returns DryRunComplete from dry-run-capable invoker', async () => {
      const dryRunResult: IAdminAdapterResult = {
        adapterKey: 'test:adapter',
        outcome: AdminAdapterOutcome.DryRunComplete,
        summary: 'Preview completed',
        durationMs: 10,
        warnings: [],
        issues: [],
        remediationHints: [],
        evidenceRefs: [],
        adapterSpecificData: null,
        deduplicatedInvocation: false,
      };

      registry.register(TEST_DESCRIPTOR, async () => dryRunResult);
      const result = await registry.invoke('test:adapter', { ...TEST_CONTEXT, dryRun: true });

      expect(result.outcome).toBe(AdminAdapterOutcome.DryRunComplete);
    });
  });
});

describe('P3-06 registerPhase3Adapters', () => {
  it('registers all Phase 3 adapter descriptors', () => {
    const registry = new AdminAdapterRegistry();
    registerPhase3Adapters(registry);

    expect(registry.listAll()).toHaveLength(PHASE_3_ADAPTERS.length);
    expect(PHASE_3_ADAPTERS.length).toBe(18);
  });

  it('all registered adapters are resolvable by key', () => {
    const registry = new AdminAdapterRegistry();
    registerPhase3Adapters(registry);

    for (const descriptor of PHASE_3_ADAPTERS) {
      const resolved = registry.resolve(descriptor.adapterKey);
      expect(resolved, `Adapter '${descriptor.adapterKey}' must be resolvable`).not.toBeNull();
      expect(resolved!.adapterKey).toBe(descriptor.adapterKey);
    }
  });

  it('provisioning:bridge has a real invoker (P3-07)', async () => {
    const registry = new AdminAdapterRegistry();
    registerPhase3Adapters(registry);

    const context: IAdminAdapterInvocationContext = {
      runId: 'run-test',
      stepNumber: 1,
      actor: { upn: 'test@hb.com', objectId: 'oid', displayName: 'Test', capturedAt: '2026-01-01T00:00:00Z' },
      dryRun: false,
      isRetry: false,
      retryAttempt: 0,
      correlationId: 'corr-test',
      input: {},
      resolvedConfig: {},
    };

    const result = await registry.invoke('provisioning:bridge', context);
    expect(result.outcome).toBe(AdminAdapterOutcome.Success);
    expect(result.adapterKey).toBe('provisioning:bridge');
  });

  it('non-bridge adapters return Skipped (no invokers)', async () => {
    const registry = new AdminAdapterRegistry();
    registerPhase3Adapters(registry);

    const context: IAdminAdapterInvocationContext = {
      runId: 'run-test',
      stepNumber: 1,
      actor: { upn: 'test@hb.com', objectId: 'oid', displayName: 'Test', capturedAt: '2026-01-01T00:00:00Z' },
      dryRun: false,
      isRetry: false,
      retryAttempt: 0,
      correlationId: 'corr-test',
      input: {},
      resolvedConfig: {},
    };

    const result = await registry.invoke('table-storage:config-lookup', context);
    expect(result.outcome).toBe(AdminAdapterOutcome.Skipped);
  });
});
