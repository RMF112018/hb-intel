import { createAuthFailure, normalizeIdentityToSession, restoreSessionWithinPolicy, } from './sessionNormalization.js';
import { recordStructuredAuditEvent } from '../audit/auditLogger.js';
import { endStartupPhase, startStartupPhase } from '../startup/startupTimingBridge.js';
/**
 * Mock/dev override adapter for local and test runtime scenarios.
 */
export class MockAdapter {
    mockUser;
    mode;
    constructor(mode = 'mock', mockUser = DEFAULT_MOCK_USER) {
        this.mockUser = mockUser;
        this.mode = mode;
    }
    async acquireIdentity() {
        if (!this.mockUser?.id) {
            return {
                ok: false,
                error: createAuthFailure('missing-context', 'Mock adapter requires a valid mock user.', false),
            };
        }
        return {
            ok: true,
            value: {
                user: this.mockUser,
                providerIdentityRef: this.mockUser.email,
                runtimeMode: this.mode,
                rawContext: {
                    provider: this.mode,
                    payload: { source: 'mock-adapter' },
                },
            },
        };
    }
    normalizeSession(identity) {
        return normalizeIdentityToSession(identity, 'memory');
    }
    async restoreSession(session, policy) {
        startStartupPhase('session-restore', {
            source: 'mock-adapter',
            runtimeMode: this.mode,
            outcome: 'pending',
        });
        try {
            const result = restoreSessionWithinPolicy(session, policy);
            recordStructuredAuditEvent({
                eventType: result.outcome === 'restored' ? 'session-restore-success' : 'session-restore-failure',
                actorId: session?.user.id ?? this.mockUser.id,
                subjectUserId: session?.user.id ?? this.mockUser.id,
                runtimeMode: this.mode,
                source: 'adapter',
                outcome: result.outcome === 'restored' ? 'success' : 'failure',
                details: {
                    provider: this.mode,
                    outcome: result.outcome,
                },
            });
            endStartupPhase('session-restore', {
                source: 'mock-adapter',
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
                source: 'mock-adapter',
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
const DEFAULT_MOCK_USER = {
    id: 'mock-user-001',
    displayName: 'Mock User',
    email: 'mock.user@hbintel.local',
    roles: [
        {
            id: 'role-mock-admin',
            name: 'Administrator',
            permissions: ['*:*'],
        },
    ],
};
//# sourceMappingURL=MockAdapter.js.map