import type { ICurrentUser } from '@hbc/models';
import type { IAuthAdapter } from '../IAuthAdapter.js';
import type { AdapterIdentityPayload, AuthResult, ISpfxPageContext, NormalizedAuthSession, SessionRestorePolicy, SessionRestoreResult, SpfxIdentityBridgeInput } from '../types.js';
/**
 * SPFx adapter implementation for `spfx-context` runtime mode.
 */
export declare class SpfxAdapter implements IAuthAdapter {
    private readonly bridge;
    readonly mode: "spfx-context";
    constructor(bridge: SpfxIdentityBridgeInput | null);
    acquireIdentity(): Promise<AuthResult<AdapterIdentityPayload>>;
    normalizeSession(identity: AdapterIdentityPayload): AuthResult<NormalizedAuthSession>;
    restoreSession(session: NormalizedAuthSession | null, policy: SessionRestorePolicy): Promise<SessionRestoreResult>;
}
/**
 * Shared mapper retained for compatibility with existing SPFx bootstrap code.
 */
export declare function mapSpfxContextToUser(pageContext: ISpfxPageContext): ICurrentUser;
/**
 * Normalize compatibility input into the strict Phase 5.14 SPFx identity seam.
 */
export declare function toSpfxIdentityBridgeInput(input: ISpfxPageContext | SpfxIdentityBridgeInput | null): SpfxIdentityBridgeInput | null;
//# sourceMappingURL=SpfxAdapter.d.ts.map