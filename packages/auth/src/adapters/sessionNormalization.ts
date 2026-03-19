import type {
  AdapterIdentityPayload,
  AuthFailure,
  AuthResult,
  CanonicalAuthMode,
  NormalizedAuthSession,
  SessionRestorePolicy,
  SessionRestoreResult,
} from '../types.js';
import { mapIdentityToAppRoles } from '../roleMapping.js';

// ALIGNMENT: sessionNormalization v1.0 - PH5C.2, PH5C.3 - Session data normalization
/**
 * Build a structured auth failure payload with consistent defaults.
 */
export function createAuthFailure(
  code: AuthFailure['code'],
  message: string,
  recoverable: boolean,
  details?: Record<string, unknown>,
  cause?: unknown,
): AuthFailure {
  return { code, message, recoverable, details, cause };
}

/**
 * Normalize adapter identity into the required HB Intel session contract.
 *
 * Required fields:
 * - user identity
 * - provider identity reference
 * - resolved roles
 * - permission summary
 * - runtime mode
 * - session timestamps + restore metadata
 */
export function normalizeIdentityToSession(
  identity: AdapterIdentityPayload,
  restoreSource: 'memory' | 'storage' | 'provider' = 'provider',
): AuthResult<NormalizedAuthSession> {
  // ALIGNMENT: Session structure per D-PH5C-03
  // Normalize identity into canonical session shape for shared auth/shell contracts.
  if (!identity.user?.id) {
    return {
      ok: false,
      error: createAuthFailure(
        'access-validation-issue',
        'Normalized session requires a user id.',
        false,
      ),
    };
  }

  const nowIso = new Date().toISOString();
  const grants =
    identity.user.type === 'internal'
      ? identity.user.roles.flatMap((role) => role.grants)
      : identity.user.projectAccess.flatMap((p) => p.grants);
  const resolvedRoles = mapIdentityToAppRoles(identity);

  return {
    ok: true,
    value: {
      user: identity.user,
      providerIdentityRef: identity.providerIdentityRef,
      resolvedRoles,
      permissionSummary: {
        grants,
        overrides: [],
      },
      runtimeMode: identity.runtimeMode,
      issuedAt: nowIso,
      validatedAt: nowIso,
      expiresAt: identity.expiresAt,
      restoreMetadata: {
        source: restoreSource,
      },
      rawContext: identity.rawContext,
    },
  };
}

/**
 * Validate whether a normalized session can be restored inside the safe policy
 * window and return a typed outcome plus shell-status transition.
 */
export function restoreSessionWithinPolicy(
  session: NormalizedAuthSession | null,
  policy: SessionRestorePolicy,
): SessionRestoreResult {
  // ALIGNMENT: Expiration handling per D-PH5C-03
  // Restore policy validates expiration and safe-window boundaries before reuse.
  if (!session) {
    return {
      outcome: 'reauth-required',
      shellStatusTransition: 'restore-reauth-required',
      failure: createAuthFailure(
        'missing-context',
        'No previous session available for restoration.',
        true,
      ),
    };
  }

  const now = policy.now ? policy.now() : new Date();
  const expiresAt = session.expiresAt ? new Date(session.expiresAt) : null;

  if (expiresAt && expiresAt.getTime() <= now.getTime()) {
    return {
      outcome: 'invalid-expired',
      shellStatusTransition: 'restore-failed',
      failure: createAuthFailure('expired-session', 'Session is expired.', true),
    };
  }

  const safeUntil = session.restoreMetadata.canRestoreUntil
    ? new Date(session.restoreMetadata.canRestoreUntil)
    : null;

  if (safeUntil && safeUntil.getTime() < now.getTime()) {
    return {
      outcome: 'reauth-required',
      shellStatusTransition: 'restore-reauth-required',
      failure: createAuthFailure(
        'expired-session',
        'Restore window is expired; reauthentication required.',
        true,
      ),
    };
  }

  const issuedAt = new Date(session.issuedAt);
  const ageMs = now.getTime() - issuedAt.getTime();

  if (ageMs > policy.safeWindowMs) {
    return {
      outcome: 'reauth-required',
      shellStatusTransition: 'restore-reauth-required',
      failure: createAuthFailure(
        'expired-session',
        'Session is outside safe restore policy window.',
        true,
        { ageMs, safeWindowMs: policy.safeWindowMs },
      ),
    };
  }

  return {
    outcome: 'restored',
    shellStatusTransition: 'restore-succeeded',
    session: {
      ...session,
      validatedAt: now.toISOString(),
      restoreMetadata: {
        ...session.restoreMetadata,
        restoredAt: now.toISOString(),
      },
    },
  };
}

/**
 * Shared runtime mode guard for adapter constructors.
 */
export function ensureSupportedMode(
  mode: CanonicalAuthMode,
  supported: ReadonlyArray<CanonicalAuthMode>,
): AuthResult<CanonicalAuthMode> {
  if (!supported.includes(mode)) {
    return {
      ok: false,
      error: createAuthFailure(
        'unsupported-runtime',
        `Runtime mode '${mode}' is not supported by this adapter.`,
        false,
      ),
    };
  }

  return { ok: true, value: mode };
}
