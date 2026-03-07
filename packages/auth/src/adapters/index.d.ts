import type { ICurrentUser } from '@hbc/models';
import type { IMsalConfig, ISpfxPageContext, SpfxIdentityBridgeInput } from '../types.js';
import { MockAdapter } from './MockAdapter.js';
import { SpfxAdapter } from './SpfxAdapter.js';
export type { AdapterIdentityPayload, AuthFailure, AuthFailureCode, AuthMode, AuthResult, CanonicalAuthMode, IMsalConfig, ISpfxPageContext, SpfxHostContainerMetadata, SpfxHostSignalState, SpfxIdentityBridgeInput, LegacyAuthMode, NormalizedAuthSession, SessionRestoreMetadata, SessionRestoreOutcome, SessionRestorePolicy, SessionRestoreResult, ShellStatusTransition, } from '../types.js';
export type { IAuthAdapter } from '../IAuthAdapter.js';
export { resolveAuthMode, resolveCanonicalAuthMode, mapLegacyToCanonicalAuthMode, mapCanonicalToLegacyAuthMode, describeResolvedAuthRuntime, } from './resolveAuthMode.js';
export { createAuthFailure, normalizeIdentityToSession, restoreSessionWithinPolicy, ensureSupportedMode, } from './sessionNormalization.js';
export { MsalAdapter } from './MsalAdapter.js';
export { SpfxAdapter, mapSpfxContextToUser, toSpfxIdentityBridgeInput } from './SpfxAdapter.js';
export { MockAdapter } from './MockAdapter.js';
/**
 * Backward-compatible helper retained for existing SPFx bootstrap flows.
 */
export declare function extractSpfxUser(pageContext: ISpfxPageContext): ICurrentUser;
/**
 * Backward-compatible helper retained for existing callers.
 * Returns `null` when no provider acquisition callback is supplied.
 */
export declare function initMsalAuth(config: IMsalConfig, acquireMsalUser?: () => Promise<ICurrentUser | null>): Promise<ICurrentUser | null>;
/**
 * Convenience helper for SPFx bootstrap integration seams.
 */
export declare function acquireSpfxSession(pageContext: ISpfxPageContext | SpfxIdentityBridgeInput): Promise<ReturnType<SpfxAdapter['acquireIdentity']>>;
/**
 * Convenience helper for mock/dev-override bootstrap integration seams.
 */
export declare function acquireMockSession(mode?: 'mock' | 'dev-override'): Promise<ReturnType<MockAdapter['acquireIdentity']>>;
//# sourceMappingURL=index.d.ts.map