import { createAuthFailure, normalizeIdentityToSession, restoreSessionWithinPolicy, } from './sessionNormalization.js';
import { recordStructuredAuditEvent } from '../audit/auditLogger.js';
import { endStartupPhase, startStartupPhase } from '../startup/startupTimingBridge.js';
/**
 * SPFx adapter implementation for `spfx-context` runtime mode.
 */
export class SpfxAdapter {
    bridge;
    mode = 'spfx-context';
    constructor(bridge) {
        this.bridge = bridge;
    }
    async acquireIdentity() {
        if (!this.bridge) {
            return {
                ok: false,
                error: createAuthFailure('missing-context', 'SPFx identity bridge is missing for spfx-context runtime.', false),
            };
        }
        const user = mapSpfxContextToUser(this.bridge.pageContext);
        return {
            ok: true,
            value: {
                user,
                providerIdentityRef: this.bridge.pageContext.user.loginName,
                runtimeMode: this.mode,
                rawContext: {
                    provider: this.mode,
                    payload: {
                        loginName: this.bridge.pageContext.user.loginName,
                        isSiteAdmin: this.bridge.pageContext.user.isSiteAdmin,
                        hostContextRef: this.bridge.hostContextRef,
                        hostContainer: this.bridge.hostContainer,
                        hostSignals: this.bridge.hostSignals,
                    },
                },
            },
        };
    }
    normalizeSession(identity) {
        return normalizeIdentityToSession(identity, 'provider');
    }
    async restoreSession(session, policy) {
        startStartupPhase('session-restore', {
            source: 'spfx-adapter',
            runtimeMode: this.mode,
            outcome: 'pending',
        });
        try {
            const result = restoreSessionWithinPolicy(session, policy);
            recordStructuredAuditEvent({
                eventType: result.outcome === 'restored' ? 'session-restore-success' : 'session-restore-failure',
                actorId: session?.user.id ?? 'system',
                subjectUserId: session?.user.id ?? 'system',
                runtimeMode: this.mode,
                source: 'adapter',
                outcome: result.outcome === 'restored' ? 'success' : 'failure',
                details: {
                    provider: 'spfx',
                    outcome: result.outcome,
                },
            });
            endStartupPhase('session-restore', {
                source: 'spfx-adapter',
                runtimeMode: this.mode,
                outcome: result.outcome === 'restored' ? 'success' : 'failure',
                details: {
                    restoreOutcome: result.outcome,
                },
            });
            return result;
        }
        catch (error) {
            endStartupPhase('session-restore', {
                source: 'spfx-adapter',
                runtimeMode: this.mode,
                outcome: 'failure',
                details: {
                    restoreOutcome: 'fatal',
                    message: error instanceof Error ? error.message : 'unknown-session-restore-error',
                },
            });
            throw error;
        }
    }
}
/**
 * Shared mapper retained for compatibility with existing SPFx bootstrap code.
 */
export function mapSpfxContextToUser(pageContext) {
    const { user, web } = pageContext;
    const permissions = [];
    if (user.isSiteAdmin) {
        permissions.push('*:*');
    }
    else {
        // SharePoint permission-mask bridge to current HB Intel action set.
        const high = web.permissions.value.High;
        const low = web.permissions.value.Low;
        if (high & 0x800)
            permissions.push('settings:*');
        if (low & 0x20)
            permissions.push('project:write', 'document:write');
        if (low & 0x10)
            permissions.push('project:read', 'document:read', 'reports:read');
        if (permissions.length === 0) {
            permissions.push('project:read');
        }
    }
    return {
        id: `spfx-${user.loginName}`,
        displayName: user.displayName,
        email: user.email,
        roles: [
            {
                id: user.isSiteAdmin ? 'role-admin' : 'role-member',
                name: user.isSiteAdmin ? 'Administrator' : 'Member',
                permissions,
            },
        ],
    };
}
/**
 * Normalize compatibility input into the strict Phase 5.14 SPFx identity seam.
 */
export function toSpfxIdentityBridgeInput(input) {
    if (!input) {
        return null;
    }
    if ('pageContext' in input) {
        return input;
    }
    return {
        pageContext: input,
        hostContainer: {
            hostId: 'spfx-host',
        },
        hostContextRef: input.user.loginName,
    };
}
//# sourceMappingURL=SpfxAdapter.js.map