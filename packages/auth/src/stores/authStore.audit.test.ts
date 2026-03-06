import { beforeEach, describe, expect, it } from 'vitest';
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
        id: 'user-1',
        displayName: 'User One',
        email: 'user1@hbintel.local',
        roles: [
          {
            id: 'role-member',
            name: 'Member',
            permissions: ['project-hub:view'],
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
          id: 'user-2',
          displayName: 'User Two',
          email: 'user2@hbintel.local',
          roles: [
            {
              id: 'role-admin',
              name: 'Administrator',
              permissions: ['*:*'],
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
});
