import type { ICurrentUser } from '@hbc/models';
import type { IAuthAdapter } from '../IAuthAdapter.js';
import type {
  AdapterIdentityPayload,
  AuthResult,
  IMsalConfig,
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
 * PWA MSAL adapter for canonical `pwa-msal` runtime mode.
 *
 * This adapter intentionally keeps provider integration narrow and accepts
 * an injected acquire function to avoid over-coupling @hbc/auth to concrete
 * msal-browser orchestration details.
 */
export class MsalAdapter implements IAuthAdapter {
  public readonly mode = 'pwa-msal' as const;

  public constructor(
    private readonly config: IMsalConfig,
    private readonly acquireMsalUser: (() => Promise<ICurrentUser | null>) | null,
  ) {}

  public async acquireIdentity(): Promise<AuthResult<AdapterIdentityPayload>> {
    if (!this.acquireMsalUser) {
      return {
        ok: false,
        error: createAuthFailure(
          'provider-bootstrap-failure',
          'MSAL acquire function is not configured.',
          false,
          { clientId: this.config.clientId },
        ),
      };
    }

    try {
      const user = await this.acquireMsalUser();
      if (!user) {
        return {
          ok: false,
          error: createAuthFailure(
            'access-validation-issue',
            'MSAL authentication did not return a valid user.',
            true,
          ),
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
    } catch (cause) {
      return {
        ok: false,
        error: createAuthFailure(
          'provider-bootstrap-failure',
          'MSAL adapter failed during provider acquisition.',
          true,
          undefined,
          cause,
        ),
      };
    }
  }

  public normalizeSession(identity: AdapterIdentityPayload): AuthResult<NormalizedAuthSession> {
    return normalizeIdentityToSession(identity, 'provider');
  }

  public async restoreSession(
    session: NormalizedAuthSession | null,
    policy: SessionRestorePolicy,
  ): Promise<SessionRestoreResult> {
    return restoreSessionWithinPolicy(session, policy);
  }
}
