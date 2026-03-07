import type { ICurrentUser } from '@hbc/models';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MockAdapter } from './MockAdapter.js';
import type { NormalizedAuthSession } from '../types.js';

const user: ICurrentUser = {
  id: 'timing-user-1',
  displayName: 'Timing User',
  email: 'timing.user@hbintel.local',
  roles: [{ id: 'role-member', name: 'Member', permissions: ['project:read'] }],
};

function buildSession(expiresAt?: string): NormalizedAuthSession {
  const now = new Date().toISOString();
  return {
    user,
    providerIdentityRef: user.email,
    resolvedRoles: ['Member'],
    permissionSummary: {
      grants: ['project:read'],
      overrides: [],
    },
    runtimeMode: 'mock',
    issuedAt: now,
    validatedAt: now,
    expiresAt,
    restoreMetadata: {
      source: 'memory',
    },
  };
}

describe('session restore startup timing', () => {
  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).__HBC_STARTUP_TIMING_BRIDGE__;
  });

  it('emits session-restore timing markers for restore paths', async () => {
    const startPhase = vi.fn();
    const endPhase = vi.fn();
    const recordPhase = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).__HBC_STARTUP_TIMING_BRIDGE__ = {
      startPhase,
      endPhase,
      recordPhase,
    };

    const adapter = new MockAdapter();
    const result = await adapter.restoreSession(buildSession(), {
      safeWindowMs: 60_000,
    });
    expect(result.outcome).toBe('restored');
    expect(startPhase).toHaveBeenCalledWith(
      'session-restore',
      expect.objectContaining({ source: 'mock-adapter', outcome: 'pending' }),
    );
    expect(endPhase).toHaveBeenCalledWith(
      'session-restore',
      expect.objectContaining({ source: 'mock-adapter', outcome: 'success' }),
    );
    expect(recordPhase).not.toHaveBeenCalled();
  });
});
