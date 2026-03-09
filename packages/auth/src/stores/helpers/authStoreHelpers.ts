import type { ICurrentUser } from '@hbc/models';
import type { CreateAuditEventInput } from '../../audit/auditLogger.js';
import type { StartupTimingPhaseMetadata } from '../../startup/startupTimingBridge.js';
import type {
  AuthLifecyclePhase,
  AuthMode,
  NormalizedAuthSession,
  SessionRestoreOutcome,
  SessionRestoreResult,
} from '../../types.js';

/**
 * Build structured audit payload for a successful sign-in event.
 */
export function buildSignInAuditPayload(session: NormalizedAuthSession): CreateAuditEventInput {
  return {
    eventType: 'sign-in',
    actorId: session.user.id,
    subjectUserId: session.user.id,
    runtimeMode: session.runtimeMode,
    source: 'auth-store',
    correlationId: `signin-${session.issuedAt}`,
    outcome: 'success',
    details: {
      providerIdentityRef: session.providerIdentityRef,
      roles: session.resolvedRoles,
    },
    occurredAt: session.validatedAt,
  };
}

/**
 * Build structured audit payload for a sign-out event.
 */
export function buildSignOutAuditPayload(
  sessionUserId: string | undefined,
  currentUserId: string | undefined,
  runtimeMode: string | undefined,
): CreateAuditEventInput {
  const signer = sessionUserId ?? currentUserId ?? 'system';
  return {
    eventType: 'sign-out',
    actorId: signer,
    subjectUserId: signer,
    runtimeMode: (runtimeMode as CreateAuditEventInput['runtimeMode']) ?? 'unknown',
    source: 'auth-store',
    correlationId: `signout-${new Date().toISOString()}`,
    outcome: 'success',
  };
}

/**
 * Build structured audit payload for a session restore outcome.
 */
export function buildRestoreAuditPayload(
  result: SessionRestoreResult,
  nextSession: NormalizedAuthSession | null,
  currentSession: NormalizedAuthSession | null,
  lastAttemptedAt: string | null,
): CreateAuditEventInput {
  return {
    eventType: result.outcome === 'restored' ? 'session-restore-success' : 'session-restore-failure',
    actorId: nextSession?.user.id ?? currentSession?.user.id ?? 'system',
    subjectUserId: nextSession?.user.id ?? currentSession?.user.id ?? 'system',
    runtimeMode: nextSession?.runtimeMode ?? 'unknown',
    source: 'auth-store',
    correlationId: `restore-${lastAttemptedAt ?? 'unknown'}`,
    outcome: result.outcome === 'restored' ? 'success' : 'failure',
    details: {
      outcome: result.outcome,
      shellTransition: result.shellStatusTransition,
      failureCode: result.failure?.code,
      failureMessage: result.failure?.message,
    },
  };
}

/**
 * Build startup timing metadata for bootstrap start.
 */
export function buildBootstrapStartMetadata(
  runtimeMode: string | undefined,
): StartupTimingPhaseMetadata {
  return {
    source: 'auth-store',
    runtimeMode: runtimeMode ?? undefined,
    outcome: 'pending',
  };
}

/**
 * Build startup timing metadata for bootstrap completion.
 */
export function buildBootstrapEndMetadata(
  session: NormalizedAuthSession | null | undefined,
  runtimeMode: AuthMode | null,
  permissionsReady: boolean,
): StartupTimingPhaseMetadata {
  const hasSession = Boolean(session);
  return {
    source: 'auth-store',
    runtimeMode: session?.runtimeMode ?? runtimeMode ?? undefined,
    outcome: hasSession ? 'success' : 'failure',
    details: {
      permissionsReady,
    },
  };
}

/**
 * Map a restore outcome to the corresponding auth lifecycle phase.
 */
export function mapRestoreOutcomeToLifecycle(outcome: SessionRestoreOutcome): AuthLifecyclePhase {
  switch (outcome) {
    case 'restored':
      return 'authenticated';
    case 'reauth-required':
      return 'reauth-required';
    case 'fatal':
      return 'error';
    default:
      return 'signed-out';
  }
}

/**
 * Build a NormalizedAuthSession from an ICurrentUser for compatibility wrappers.
 */
export function buildCompatSession(
  user: ICurrentUser,
  currentRuntimeMode: AuthMode | null,
): NormalizedAuthSession {
  const nowIso = new Date().toISOString();
  const fallbackMode = currentRuntimeMode ?? 'mock';
  const runtimeMode =
    fallbackMode === 'msal'
      ? 'pwa-msal'
      : fallbackMode === 'spfx'
        ? 'spfx-context'
        : fallbackMode;

  return {
    user,
    providerIdentityRef: user.email,
    resolvedRoles: user.roles.map((role) => role.name),
    permissionSummary: {
      grants: user.roles.flatMap((role) => role.permissions),
      overrides: [],
    },
    runtimeMode,
    issuedAt: nowIso,
    validatedAt: nowIso,
    restoreMetadata: {
      source: 'memory',
    },
  };
}
