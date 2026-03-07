import { createAuthFailure, normalizeIdentityToSession, restoreSessionWithinPolicy, } from './sessionNormalization.js';
import { recordStructuredAuditEvent } from '../audit/auditLogger.js';
import { endStartupPhase, startStartupPhase } from '../startup/startupTimingBridge.js';
/**
 * PWA MSAL adapter for canonical `pwa-msal` runtime mode.
 *
 * This adapter intentionally keeps provider integration narrow and accepts
 * an injected acquire function to avoid over-coupling @hbc/auth to concrete
 * msal-browser orchestration details.
 */
export class MsalAdapter {
    config;
    acquireMsalUser;
    mode = 'pwa-msal';
    constructor(config, acquireMsalUser) {
        this.config = config;
        this.acquireMsalUser = acquireMsalUser;
        // Phase 5.2 Option C boundary hardening: adapter-owned provider config
        // validation must reject missing MSAL identity parameters deterministically.
        MsalAdapter.assertRequiredConfig(config);
    }
    static assertRequiredConfig(config) {
        if (!config.clientId?.trim()) {
            throw new Error('MSAL clientId is required');
        }
        if (!config.authority?.trim()) {
            throw new Error('MSAL authority is required');
        }
        if (!config.redirectUri?.trim()) {
            throw new Error('MSAL redirectUri is required');
        }
    }
    async acquireIdentity() {
        if (!this.acquireMsalUser) {
            return {
                ok: false,
                error: createAuthFailure('provider-bootstrap-failure', 'MSAL acquire function is not configured.', false, { clientId: this.config.clientId }),
            };
        }
        try {
            const user = await this.acquireMsalUser();
            if (!user) {
                return {
                    ok: false,
                    error: createAuthFailure('access-validation-issue', 'MSAL authentication did not return a valid user.', true),
                };
            }
            return {
                ok: true,
                value: {
                    user,
                    providerIdentityRef: user.email,
                    runtimeMode: this.mode,
                    rawContext: {
                        provider: this.mode,
                        payload: {
                            authority: this.config.authority,
                            redirectUri: this.config.redirectUri,
                        },
                    },
                },
            };
        }
        catch (cause) {
            return {
                ok: false,
                error: createAuthFailure('provider-bootstrap-failure', 'MSAL adapter failed during provider acquisition.', true, undefined, cause),
            };
        }
    }
    normalizeSession(identity) {
        return normalizeIdentityToSession(identity, 'provider');
    }
    async restoreSession(session, policy) {
        startStartupPhase('session-restore', {
            source: 'msal-adapter',
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
                    provider: 'msal',
                    outcome: result.outcome,
                },
            });
            endStartupPhase('session-restore', {
                source: 'msal-adapter',
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
                source: 'msal-adapter',
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
//# sourceMappingURL=MsalAdapter.js.map