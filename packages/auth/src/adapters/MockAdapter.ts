import type { ICurrentUser } from '@hbc/models';
import type { IAuthAdapter } from '../IAuthAdapter.js';
import type {
  AdapterIdentityPayload,
  AuthResult,
  CanonicalAuthMode,
  NormalizedAuthSession,
  SessionRestorePolicy,
  SessionRestoreResult,
} from '../types.js';
import {
  createAuthFailure,
  normalizeIdentityToSession,
  restoreSessionWithinPolicy,
} from './sessionNormalization.js';

/**
 * Mock/dev override adapter for local and test runtime scenarios.
 */
export class MockAdapter implements IAuthAdapter {
  public readonly mode: CanonicalAuthMode;

  public constructor(
    mode: 'mock' | 'dev-override' = 'mock',
    private readonly mockUser: ICurrentUser = DEFAULT_MOCK_USER,
  ) {
    this.mode = mode;
  }

  public async acquireIdentity(): Promise<AuthResult<AdapterIdentityPayload>> {
    if (!this.mockUser?.id) {
      return {
        ok: false,
        error: createAuthFailure(
          'missing-context',
          'Mock adapter requires a valid mock user.',
          false,
        ),
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

  public normalizeSession(identity: AdapterIdentityPayload): AuthResult<NormalizedAuthSession> {
    return normalizeIdentityToSession(identity, 'memory');
  }

  public async restoreSession(
    session: NormalizedAuthSession | null,
    policy: SessionRestorePolicy,
  ): Promise<SessionRestoreResult> {
    return restoreSessionWithinPolicy(session, policy);
  }
}

const DEFAULT_MOCK_USER: ICurrentUser = {
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
