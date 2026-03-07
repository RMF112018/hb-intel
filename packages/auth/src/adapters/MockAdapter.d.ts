import type { ICurrentUser } from '@hbc/models';
import type { IAuthAdapter } from '../IAuthAdapter.js';
import type { AdapterIdentityPayload, AuthResult, CanonicalAuthMode, NormalizedAuthSession, SessionRestorePolicy, SessionRestoreResult } from '../types.js';
/**
 * Mock/dev override adapter for local and test runtime scenarios.
 */
export declare class MockAdapter implements IAuthAdapter {
    private readonly mockUser;
    readonly mode: CanonicalAuthMode;
    constructor(mode?: 'mock' | 'dev-override', mockUser?: ICurrentUser);
    acquireIdentity(): Promise<AuthResult<AdapterIdentityPayload>>;
    normalizeSession(identity: AdapterIdentityPayload): AuthResult<NormalizedAuthSession>;
    restoreSession(session: NormalizedAuthSession | null, policy: SessionRestorePolicy): Promise<SessionRestoreResult>;
}
//# sourceMappingURL=MockAdapter.d.ts.map