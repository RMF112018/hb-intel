/**
 * SPFx auth bootstrap — Phase 5.
 * Seeds authStore + permissionStore from SharePoint page context.
 */
import { useAuthStore } from '../stores/index.js';
import { usePermissionStore } from '../stores/index.js';
import { extractSpfxUser } from '../adapters/index.js';
import { endStartupPhase, startStartupPhase } from '../startup/startupTimingBridge.js';
/**
 * Validate strict SPFx host-bridge input before auth-store bootstrap.
 */
export function assertValidSpfxHostBridgeInput(input) {
    if (!input.pageContext?.user?.loginName) {
        throw new Error('SPFx host bridge requires pageContext.user.loginName.');
    }
    if (!input.hostContainer.hostId.trim()) {
        throw new Error('SPFx host bridge requires hostContainer.hostId.');
    }
    if (!input.hostContextRef.trim()) {
        throw new Error('SPFx host bridge requires hostContextRef.');
    }
}
/**
 * Build normalized identity bridge payload from approved SPFx host input.
 */
export function toSpfxIdentityBridgeInput(input) {
    assertValidSpfxHostBridgeInput(input);
    return {
        pageContext: input.pageContext,
        hostContainer: input.hostContainer,
        hostContextRef: input.hostContextRef,
        hostSignals: input.hostSignals,
    };
}
/**
 * Bootstrap authentication from SPFx page context.
 * Call once before React renders in SPFx webpart entry point.
 */
export function bootstrapSpfxAuth(input) {
    startStartupPhase('auth-bootstrap', {
        source: 'spfx-bootstrap',
        runtimeMode: 'spfx-context',
        outcome: 'pending',
    });
    try {
        const bridgeInput = isSpfxHostBridgeInput(input)
            ? toSpfxIdentityBridgeInput(input)
            : toLegacyBridgeInput(input);
        const user = extractSpfxUser(bridgeInput.pageContext);
        const permissions = user.roles.flatMap((r) => r.permissions);
        useAuthStore.getState().setUser(user);
        usePermissionStore.getState().setPermissions(permissions);
        endStartupPhase('auth-bootstrap', {
            source: 'spfx-bootstrap',
            runtimeMode: 'spfx-context',
            outcome: 'success',
            details: {
                permissionCount: permissions.length,
            },
        });
    }
    catch (error) {
        endStartupPhase('auth-bootstrap', {
            source: 'spfx-bootstrap',
            runtimeMode: 'spfx-context',
            outcome: 'failure',
            details: {
                message: error instanceof Error ? error.message : 'unknown-spfx-bootstrap-error',
            },
        });
        throw error;
    }
}
function isSpfxHostBridgeInput(input) {
    return 'pageContext' in input && 'hostContainer' in input && 'hostContextRef' in input;
}
function toLegacyBridgeInput(pageContext) {
    return {
        pageContext,
        hostContainer: {
            hostId: 'spfx-host',
        },
        hostContextRef: pageContext.user.loginName,
    };
}
//# sourceMappingURL=index.js.map