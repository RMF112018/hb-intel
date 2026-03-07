import type { ICurrentUser } from '@hbc/models';
import type { IAuthAdapter } from '../IAuthAdapter.js';
import type { AdapterIdentityPayload, AuthResult, IMsalConfig, NormalizedAuthSession, SessionRestorePolicy, SessionRestoreResult } from '../types.js';
/**
 * PWA MSAL adapter for canonical `pwa-msal` runtime mode.
 *
 * This adapter intentionally keeps provider integration narrow and accepts
 * an injected acquire function to avoid over-coupling @hbc/auth to concrete
 * msal-browser orchestration details.
 */
export declare class MsalAdapter implements IAuthAdapter {
    private readonly config;
    private readonly acquireMsalUser;
    readonly mode: "pwa-msal";
    constructor(config: IMsalConfig, acquireMsalUser: (() => Promise<ICurrentUser | null>) | null);
    private static assertRequiredConfig;
    acquireIdentity(): Promise<AuthResult<AdapterIdentityPayload>>;
    normalizeSession(identity: AdapterIdentityPayload): AuthResult<NormalizedAuthSession>;
    restoreSession(session: NormalizedAuthSession | null, policy: SessionRestorePolicy): Promise<SessionRestoreResult>;
}
//# sourceMappingURL=MsalAdapter.d.ts.map