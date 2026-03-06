import type { ICurrentUser } from '@hbc/models';
import type { IAuthAdapter } from '../IAuthAdapter.js';
import type {
  AdapterIdentityPayload,
  AuthResult,
  ISpfxPageContext,
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

/**
 * SPFx adapter implementation for `spfx-context` runtime mode.
 */
export class SpfxAdapter implements IAuthAdapter {
  public readonly mode = 'spfx-context' as const;

  public constructor(private readonly pageContext: ISpfxPageContext | null) {}

  public async acquireIdentity(): Promise<AuthResult<AdapterIdentityPayload>> {
    if (!this.pageContext) {
      return {
        ok: false,
        error: createAuthFailure(
          'missing-context',
          'SPFx page context is missing for spfx-context runtime.',
          false,
        ),
      };
    }

    const user = mapSpfxContextToUser(this.pageContext);

    return {
      ok: true,
      value: {
        user,
        providerIdentityRef: this.pageContext.user.loginName,
        runtimeMode: this.mode,
        rawContext: {
          provider: this.mode,
          payload: {
            loginName: this.pageContext.user.loginName,
            isSiteAdmin: this.pageContext.user.isSiteAdmin,
          },
        },
      },
    };
  }

  public normalizeSession(identity: AdapterIdentityPayload): AuthResult<NormalizedAuthSession> {
    return normalizeIdentityToSession(identity, 'provider');
  }

  public async restoreSession(
    session: NormalizedAuthSession | null,
    policy: SessionRestorePolicy,
  ): Promise<SessionRestoreResult> {
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
    return result;
  }
}

/**
 * Shared mapper retained for compatibility with existing SPFx bootstrap code.
 */
export function mapSpfxContextToUser(pageContext: ISpfxPageContext): ICurrentUser {
  const { user, web } = pageContext;

  const permissions: string[] = [];
  if (user.isSiteAdmin) {
    permissions.push('*:*');
  } else {
    // SharePoint permission-mask bridge to current HB Intel action set.
    const high = web.permissions.value.High;
    const low = web.permissions.value.Low;

    if (high & 0x800) permissions.push('settings:*');
    if (low & 0x20) permissions.push('project:write', 'document:write');
    if (low & 0x10) permissions.push('project:read', 'document:read', 'reports:read');

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
