import type { AdapterIdentityPayload, AuthResult, CanonicalAuthMode, NormalizedAuthSession, SessionRestorePolicy, SessionRestoreResult } from './types.js';
/**
 * Typed adapter abstraction for Phase 5.2 dual-mode authentication.
 *
 * Design constraint (locked Option C):
 * - Interface is intentionally narrow for current PWA/SPFx/mock/dev-override
 *   use cases and does not introduce speculative multi-provider generalization.
 */
export interface IAuthAdapter {
    /** Canonical mode this adapter services. */
    readonly mode: CanonicalAuthMode;
    /** Acquire provider/environment identity and return a structured result. */
    acquireIdentity(): Promise<AuthResult<AdapterIdentityPayload>>;
    /** Normalize acquired identity into the HB Intel normalized session contract. */
    normalizeSession(identity: AdapterIdentityPayload): AuthResult<NormalizedAuthSession>;
    /** Restore or revalidate a prior normalized session within safe policy windows. */
    restoreSession(session: NormalizedAuthSession | null, policy: SessionRestorePolicy): Promise<SessionRestoreResult>;
}
//# sourceMappingURL=IAuthAdapter.d.ts.map