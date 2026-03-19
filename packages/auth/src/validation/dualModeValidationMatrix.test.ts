import type { IInternalUser } from '@hbc/models';
import { describe, expect, it } from 'vitest';
import {
  applyOverrideApprovalAction,
  createStructuredOverrideRequest,
  DEFAULT_EMERGENCY_ACCESS_POLICY,
  DEFAULT_OVERRIDE_REQUEST_POLICY,
  evaluateEmergencyBoundary,
  mapLegacyToCanonicalAuthMode,
  MockAdapter,
  MsalAdapter,
  resolveCanonicalAuthMode,
  resolveGuardResolution,
  runEmergencyAccessWorkflow,
  runRenewalWorkflow,
  SpfxAdapter,
} from '../index.js';
import { createOverrideRequest, markDependentOverridesForRoleReview } from '../backend/overrideRecord.js';
import { isOverrideExpired } from '../workflows/renewalWorkflow.js';
import { buildAccessDeniedActionModel } from '../guards/AccessDenied.js';

/**
 * Phase 5.16 validation matrix fixture user used across runtime-mode tests.
 */
const MATRIX_USER: IInternalUser = {
  type: 'internal',
  id: 'matrix-user-1',
  displayName: 'Matrix User',
  email: 'matrix.user@hbintel.local',
  roles: [
    {
      id: 'role-admin',
      name: 'Administrator',
      grants: ['*:*'],
      source: 'manual',
    },
  ],
};

/**
 * Build a normalized session fixture so restore checks use one canonical shape.
 */
function buildSession(runtimeMode: 'mock' | 'dev-override' | 'pwa-msal' | 'spfx-context') {
  const now = new Date('2026-03-06T12:00:00.000Z').toISOString();
  return {
    user: MATRIX_USER,
    providerIdentityRef: MATRIX_USER.email,
    resolvedRoles: MATRIX_USER.roles.map((role) => role.name),
    permissionSummary: {
      grants: ['*:*'],
      overrides: [],
    },
    runtimeMode,
    issuedAt: now,
    validatedAt: now,
    restoreMetadata: {
      source: 'provider' as const,
    },
  };
}

describe('Phase 5.16 dual-mode validation matrix (@hbc/auth)', () => {
  it('covers happy-path sign-in and session-restore behavior by runtime mode', async () => {
    const msalAdapter = new MsalAdapter(
      {
        clientId: 'matrix-client',
        authority: 'https://login.microsoftonline.com/matrix',
        redirectUri: 'https://hbintel.local/auth',
        scopes: ['user.read'],
      },
      async () => MATRIX_USER,
    );
    const spfxAdapter = new SpfxAdapter({
      pageContext: {
        user: {
          displayName: MATRIX_USER.displayName,
          email: MATRIX_USER.email,
          loginName: `i:0#.f|membership|${MATRIX_USER.email}`,
          isAnonymousGuestUser: false,
          isSiteAdmin: true,
        },
        web: {
          permissions: {
            value: {
              High: 0,
              Low: 0,
            },
          },
        },
      },
      hostContainer: {
        hostId: 'spfx-matrix',
      },
      hostContextRef: 'matrix-context',
    });

    const acquiredMsal = await msalAdapter.acquireIdentity();
    expect(acquiredMsal.ok).toBe(true);
    if (acquiredMsal.ok) {
      expect(acquiredMsal.value.runtimeMode).toBe('pwa-msal');
    }

    const acquiredSpfx = await spfxAdapter.acquireIdentity();
    expect(acquiredSpfx.ok).toBe(true);
    if (acquiredSpfx.ok) {
      expect(acquiredSpfx.value.runtimeMode).toBe('spfx-context');
    }

    const restorePolicy = {
      safeWindowMs: 60_000,
      now: () => new Date('2026-03-06T12:00:30.000Z'),
    };

    const mockModeResult = await new MockAdapter('mock').restoreSession(buildSession('mock'), restorePolicy);
    const devOverrideResult = await new MockAdapter('dev-override').restoreSession(
      buildSession('dev-override'),
      restorePolicy,
    );
    const msalRestoreResult = await msalAdapter.restoreSession(buildSession('pwa-msal'), restorePolicy);
    const spfxRestoreResult = await spfxAdapter.restoreSession(buildSession('spfx-context'), restorePolicy);

    expect(mockModeResult.outcome).toBe('restored');
    expect(devOverrideResult.outcome).toBe('restored');
    expect(msalRestoreResult.outcome).toBe('restored');
    expect(spfxRestoreResult.outcome).toBe('restored');
  });

  it('covers direct unauthorized access, locked request-access presentation, and unsupported context handling', async () => {
    const unauthorized = resolveGuardResolution({
      lifecyclePhase: 'signed-out',
      runtimeMode: 'pwa-msal',
      resolvedRoles: [],
      requiredPermission: 'admin:write',
      hasPermission: false,
    });
    expect(unauthorized.allow).toBe(false);
    expect(unauthorized.failureKind).toBe('unauthenticated');

    const lockedActionModel = buildAccessDeniedActionModel({
      onGoHome: () => undefined,
      onGoBack: () => undefined,
      onRequestAccess: () => undefined,
      onSubmitAccessRequest: async () => ({ success: true, reviewQueueId: 'review-1' }),
    });
    expect(lockedActionModel.showRequestAccess).toBe(true);
    expect(lockedActionModel.showSubmitRequestAccess).toBe(true);

    const missingMsal = await new MsalAdapter(
      {
        clientId: 'matrix-client',
        authority: 'https://login.microsoftonline.com/matrix',
        redirectUri: 'https://hbintel.local/auth',
        scopes: ['user.read'],
      },
      null,
    ).acquireIdentity();
    expect(missingMsal.ok).toBe(false);
    if (!missingMsal.ok) {
      expect(missingMsal.error.code).toBe('provider-bootstrap-failure');
    }

    const missingSpfx = await new SpfxAdapter(null).acquireIdentity();
    expect(missingSpfx.ok).toBe(false);
    if (!missingSpfx.ok) {
      expect(missingSpfx.error.code).toBe('missing-context');
    }
  });

  it('covers override lifecycle, expiration/renewal, role-review flags, and emergency path', () => {
    const request = createStructuredOverrideRequest({
      requestId: 'matrix-request-1',
      targetUserId: 'target-1',
      baseRoleId: 'member',
      requestedChange: {
        mode: 'grant',
        grants: ['project:approve'],
      },
      businessReason: 'Temporary approval permission for month-end close operations.',
      targetFeatureId: 'project-hub',
      targetAction: 'approve',
      requesterId: 'manager-1',
      requestedDurationHours: 24,
      requestedAt: '2026-03-06T00:00:00.000Z',
    });

    const approved = applyOverrideApprovalAction({
      request,
      command: {
        reviewerId: 'security-admin',
        decision: 'approve',
        reviewedAt: '2026-03-06T01:00:00.000Z',
      },
    });
    expect(approved.ok).toBe(true);
    expect(approved.override?.approval.state).toBe('approved');

    const renewal = runRenewalWorkflow({
      action: {
        renewalRequestId: 'matrix-renewal-1',
        previousRequestId: request.requestId,
        targetUserId: request.targetUserId,
        baseRoleId: request.baseRoleId,
        requestedChange: request.requestedChange,
        updatedJustification: 'Extended support is required due to delayed finance closeout dependencies.',
        targetFeatureId: request.targetFeatureId,
        targetAction: request.targetAction,
        requesterId: request.requesterId,
        requestedDurationHours: 12,
        requestedAt: '2026-03-07T00:00:00.000Z',
      },
      policy: DEFAULT_OVERRIDE_REQUEST_POLICY,
      approvalCommand: {
        reviewerId: 'security-admin',
        decision: 'approve',
        reviewedAt: '2026-03-07T00:10:00.000Z',
      },
    });
    expect(renewal.ok).toBe(true);

    const expiredRecord = createOverrideRequest({
      id: 'expired-override',
      targetUserId: 'target-1',
      baseRoleId: 'member',
      requestedChange: {
        mode: 'grant',
        grants: ['project:approve'],
      },
      reason: 'Temporary override for workflow continuity.',
      requesterId: 'manager-1',
      emergency: false,
      expiresAt: '2026-03-05T00:00:00.000Z',
    });
    expect(isOverrideExpired(expiredRecord, new Date('2026-03-06T00:00:00.000Z'))).toBe(true);

    const reviewFlagged = markDependentOverridesForRoleReview({
      overrides: [expiredRecord],
      changedRoles: [{ roleId: 'member', previousVersion: 1, nextVersion: 2 }],
      markedBy: 'policy-engine',
      markedAt: '2026-03-06T00:00:00.000Z',
    });
    expect(reviewFlagged[0].review.reviewRequired).toBe(true);

    const emergencyBoundary = evaluateEmergencyBoundary(
      {
        requestId: 'emergency-1',
        targetUserId: 'target-1',
        baseRoleId: 'member',
        requestedChange: {
          mode: 'grant',
          grants: ['project:approve'],
        },
        emergencyReason: 'Urgent production incident response requiring immediate approval rights.',
        targetFeatureId: 'project-hub',
        targetAction: 'approve',
        requesterId: 'security-admin',
        requesterRoles: ['SecurityAdmin'],
        normalWorkflowAvailable: false,
      },
      DEFAULT_EMERGENCY_ACCESS_POLICY,
    );
    expect(emergencyBoundary.allowed).toBe(true);

    const emergency = runEmergencyAccessWorkflow({
      requestId: 'emergency-2',
      targetUserId: 'target-1',
      baseRoleId: 'member',
      requestedChange: {
        mode: 'grant',
        grants: ['project:approve'],
      },
      emergencyReason: 'Critical overnight incident requires immediate access for mitigation and audit follow-up.',
      targetFeatureId: 'project-hub',
      targetAction: 'approve',
      requesterId: 'security-admin',
      requesterRoles: ['SecurityAdmin'],
      normalWorkflowAvailable: false,
      requestedAt: '2026-03-06T00:00:00.000Z',
    });

    expect(emergency.ok).toBe(true);
    expect(emergency.override?.emergency).toBe(true);
    expect(emergency.override?.review.reviewRequired).toBe(true);
  });

  it('covers controlled dev/test override behavior for runtime resolution', () => {
    const g = globalThis as unknown as {
      process?: {
        env?: Record<string, string | undefined>;
      };
    };
    const originalProcess = g.process;

    g.process = {
      env: {
        NODE_ENV: 'development',
        HBC_AUTH_MODE_OVERRIDE: 'spfx',
      },
    };
    expect(resolveCanonicalAuthMode()).toBe('spfx-context');
    expect(mapLegacyToCanonicalAuthMode('spfx')).toBe('spfx-context');

    g.process = {
      env: {
        NODE_ENV: 'production',
        HBC_AUTH_MODE_OVERRIDE: 'spfx',
      },
    };
    // Production blocks explicit override and falls back to canonical environment detection.
    expect(resolveCanonicalAuthMode()).not.toBe('spfx-context');

    g.process = originalProcess;
  });
});
