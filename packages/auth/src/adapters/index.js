import { MsalAdapter } from './MsalAdapter.js';
import { MockAdapter } from './MockAdapter.js';
import { mapSpfxContextToUser, SpfxAdapter, toSpfxIdentityBridgeInput } from './SpfxAdapter.js';
export { resolveAuthMode, resolveCanonicalAuthMode, mapLegacyToCanonicalAuthMode, mapCanonicalToLegacyAuthMode, describeResolvedAuthRuntime, } from './resolveAuthMode.js';
export { createAuthFailure, normalizeIdentityToSession, restoreSessionWithinPolicy, ensureSupportedMode, } from './sessionNormalization.js';
export { MsalAdapter } from './MsalAdapter.js';
export { SpfxAdapter, mapSpfxContextToUser, toSpfxIdentityBridgeInput } from './SpfxAdapter.js';
export { MockAdapter } from './MockAdapter.js';
/**
 * Backward-compatible helper retained for existing SPFx bootstrap flows.
 */
export function extractSpfxUser(pageContext) {
    return mapSpfxContextToUser(pageContext);
}
/**
 * Backward-compatible helper retained for existing callers.
 * Returns `null` when no provider acquisition callback is supplied.
 */
export async function initMsalAuth(config, acquireMsalUser) {
    const adapter = new MsalAdapter(config, acquireMsalUser ?? null);
    const acquired = await adapter.acquireIdentity();
    if (!acquired.ok) {
        return null;
    }
    return acquired.value.user;
}
/**
 * Convenience helper for SPFx bootstrap integration seams.
 */
export async function acquireSpfxSession(pageContext) {
    const adapter = new SpfxAdapter(toSpfxIdentityBridgeInput(pageContext));
    return adapter.acquireIdentity();
}
/**
 * Convenience helper for mock/dev-override bootstrap integration seams.
 */
export async function acquireMockSession(mode = 'mock') {
    const adapter = new MockAdapter(mode);
    return adapter.acquireIdentity();
}
//# sourceMappingURL=index.js.map