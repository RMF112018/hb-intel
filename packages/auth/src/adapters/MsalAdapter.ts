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
import { recordStructuredAuditEvent } from '../audit/auditLogger.js';
import { endStartupPhase, startStartupPhase } from '../startup/startupTimingBridge.js';

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
  ) {
    // Phase 5.2 Option C boundary hardening: adapter-owned provider config
    // validation must reject missing MSAL identity parameters deterministically.
    MsalAdapter.assertRequiredConfig(config);
  }

  private static assertRequiredConfig(config: IMsalConfig): void {
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
    } catch (error) {
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
