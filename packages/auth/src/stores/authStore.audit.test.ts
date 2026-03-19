import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearStructuredAuditEvents,
  getStructuredAuditEvents,
} from '../audit/auditLogger.js';
import { useAuthStore } from './authStore.js';

describe('authStore audit integration', () => {
  beforeEach(() => {
    clearStructuredAuditEvents();
    useAuthStore.getState().clear();
  });

  it('records sign-in and sign-out events', () => {
    useAuthStore.getState().signInSuccess({
      user: {
        type: 'internal',
        id: 'user-1',
        displayName: 'User One',
        email: 'user1@hbintel.local',
        roles: [
          {
            id: 'role-member',
            name: 'Member',
            grants: ['project-hub:view'],
            source: 'manual',
          },
        ],
      },
      providerIdentityRef: 'user1@hbintel.local',
      resolvedRoles: ['Member'],
      permissionSummary: {
        grants: ['project-hub:view'],
        overrides: [],
      },
      runtimeMode: 'mock',
      issuedAt: '2026-03-06T00:00:00.000Z',
      validatedAt: '2026-03-06T00:00:00.000Z',
      restoreMetadata: {
        source: 'memory',
      },
    });

    useAuthStore.getState().signOut();

    const events = getStructuredAuditEvents();
    expect(events.some((event) => event.eventType === 'sign-in')).toBe(true);
    expect(events.some((event) => event.eventType === 'sign-out')).toBe(true);
  });

  it('records session restore success and failure outcomes', () => {
    useAuthStore.getState().resolveRestore({
      outcome: 'restored',
      shellStatusTransition: 'restore-succeeded',
      session: {
        user: {
          type: 'internal',
          id: 'user-2',
          displayName: 'User Two',
          email: 'user2@hbintel.local',
          roles: [
            {
              id: 'role-admin',
              name: 'Administrator',
              grants: ['*:*'],
              source: 'manual',
            },
          ],
        },
        providerIdentityRef: 'user2@hbintel.local',
        resolvedRoles: ['Administrator'],
        permissionSummary: {
          grants: ['*:*'],
          overrides: [],
        },
        runtimeMode: 'spfx-context',
        issuedAt: '2026-03-06T00:00:00.000Z',
        validatedAt: '2026-03-06T01:00:00.000Z',
        restoreMetadata: {
          source: 'provider',
        },
      },
    });

    useAuthStore.getState().resolveRestore({
      outcome: 'fatal',
      shellStatusTransition: 'restore-fatal',
      failure: {
        code: 'provider-bootstrap-failure',
        message: 'restore failed',
        recoverable: false,
      },
    });

    const events = getStructuredAuditEvents();
    expect(events.some((event) => event.eventType === 'session-restore-success')).toBe(true);
    expect(events.some((event) => event.eventType === 'session-restore-failure')).toBe(true);
  });

  it("'invalid-expired' restore outcome emits session-restore-failure", () => {
    useAuthStore.getState().resolveRestore({
      outcome: 'invalid-expired',
      shellStatusTransition: 'restore-failed',
      failure: {
        code: 'expired-session',
        message: 'session expired',
        recoverable: false,
      },
    });

    const events = getStructuredAuditEvents();
    const failureEvent = events.find((e) => e.eventType === 'session-restore-failure');
    expect(failureEvent).toBeDefined();
    expect(failureEvent!.outcome).toBe('failure');
    expect((failureEvent!.details as Record<string, unknown>)?.outcome).toBe('invalid-expired');
  });

  it("'reauth-required' restore outcome emits session-restore-failure", () => {
    useAuthStore.getState().resolveRestore({
      outcome: 'reauth-required',
      shellStatusTransition: 'restore-reauth-required',
    });

    const events = getStructuredAuditEvents();
    const failureEvent = events.find((e) => e.eventType === 'session-restore-failure');
    expect(failureEvent).toBeDefined();
    expect(failureEvent!.outcome).toBe('failure');
    expect((failureEvent!.details as Record<string, unknown>)?.outcome).toBe('reauth-required');
  });
});

describe('authStore bootstrap timing integration', () => {
  let mockBridge: {
    startPhase: ReturnType<typeof vi.fn>;
    endPhase: ReturnType<typeof vi.fn>;
    recordPhase: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    clearStructuredAuditEvents();
    useAuthStore.getState().clear();
    mockBridge = {
      startPhase: vi.fn(),
      endPhase: vi.fn(),
      recordPhase: vi.fn(),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).__HBC_STARTUP_TIMING_BRIDGE__ = mockBridge;
  });

  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).__HBC_STARTUP_TIMING_BRIDGE__;
  });

  it('beginBootstrap calls startStartupPhase with correct metadata', () => {
    useAuthStore.getState().beginBootstrap('mock');

    expect(mockBridge.startPhase).toHaveBeenCalledWith('auth-bootstrap', {
      source: 'auth-store',
      runtimeMode: 'mock',
      outcome: 'pending',
    });
  });

  it('completeBootstrap calls endStartupPhase with success metadata', () => {
    const mockSession = {
      user: {
        type: 'internal' as const,
        id: 'user-1',
        displayName: 'User One',
        email: 'user1@hbintel.local',
        roles: [{ id: 'role-member', name: 'Member', grants: ['project-hub:view'], source: 'manual' as const }],
      },
      providerIdentityRef: 'user1@hbintel.local',
      resolvedRoles: ['Member'],
      permissionSummary: { grants: ['project-hub:view'], overrides: [] },
      runtimeMode: 'mock' as const,
      issuedAt: '2026-03-06T00:00:00.000Z',
      validatedAt: '2026-03-06T00:00:00.000Z',
      restoreMetadata: { source: 'memory' as const },
    };

    useAuthStore.getState().completeBootstrap({ session: mockSession, permissionsReady: true });

    expect(mockBridge.endPhase).toHaveBeenCalledWith('auth-bootstrap', {
      source: 'auth-store',
      runtimeMode: 'mock',
      outcome: 'success',
      details: { permissionsReady: true },
    });
  });

  it('completeBootstrap calls endStartupPhase with failure metadata when no session', () => {
    useAuthStore.getState().completeBootstrap({});

    expect(mockBridge.endPhase).toHaveBeenCalledWith('auth-bootstrap', {
      source: 'auth-store',
      runtimeMode: undefined,
      outcome: 'failure',
      details: { permissionsReady: false },
    });
  });
});
