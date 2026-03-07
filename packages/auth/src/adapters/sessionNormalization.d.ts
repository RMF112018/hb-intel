import type { AdapterIdentityPayload, AuthFailure, AuthResult, CanonicalAuthMode, NormalizedAuthSession, SessionRestorePolicy, SessionRestoreResult } from '../types.js';
/**
 * Build a structured auth failure payload with consistent defaults.
 */
export declare function createAuthFailure(code: AuthFailure['code'], message: string, recoverable: boolean, details?: Record<string, unknown>, cause?: unknown): AuthFailure;
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
export declare function normalizeIdentityToSession(identity: AdapterIdentityPayload, restoreSource?: 'memory' | 'storage' | 'provider'): AuthResult<NormalizedAuthSession>;
/**
 * Validate whether a normalized session can be restored inside the safe policy
 * window and return a typed outcome plus shell-status transition.
 */
export declare function restoreSessionWithinPolicy(session: NormalizedAuthSession | null, policy: SessionRestorePolicy): SessionRestoreResult;
/**
 * Shared runtime mode guard for adapter constructors.
 */
export declare function ensureSupportedMode(mode: CanonicalAuthMode, supported: ReadonlyArray<CanonicalAuthMode>): AuthResult<CanonicalAuthMode>;
//# sourceMappingURL=sessionNormalization.d.ts.map