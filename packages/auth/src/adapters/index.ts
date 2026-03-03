import type { ICurrentUser } from '@hbc/models';

/** Auth mode resolved at runtime. Blueprint §2b — dual-mode locked. */
export type AuthMode = 'msal' | 'spfx' | 'mock';

/** MSAL configuration interface for PWA auth (Phase 4). */
export interface IMsalConfig {
  clientId: string;
  authority: string;
  redirectUri: string;
  scopes: string[];
}

/**
 * Lightweight interface mirroring SPFx pageContext.user — avoids pulling
 * @microsoft/sp-* types into the shared package (Phase 5).
 */
export interface ISpfxPageContext {
  user: {
    displayName: string;
    email: string;
    loginName: string;
    isAnonymousGuestUser: boolean;
    isSiteAdmin: boolean;
  };
  web: {
    permissions: {
      value: { High: number; Low: number };
    };
  };
}

/**
 * Detect current auth mode from environment.
 * Blueprint §2b — dual-mode auto-detection.
 */
export function resolveAuthMode(): AuthMode {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = globalThis as any;

    // SPFx context present → spfx mode
    if (g._spPageContextInfo || g.__spfxContext) {
      return 'spfx';
    }

    // Explicit env var override
    const env = g.process?.env as Record<string, string> | undefined;
    const mode = env?.HBC_AUTH_MODE;
    if (mode === 'msal' || mode === 'spfx') {
      return mode;
    }
  } catch {
    // No process available — fall through to default
  }
  return 'mock';
}

/**
 * Extract current user from SPFx page context.
 * Phase 5 — maps pageContext.user → ICurrentUser.
 * Derives permissions from SharePoint permission levels.
 */
export function extractSpfxUser(pageContext: ISpfxPageContext): ICurrentUser {
  const { user, web } = pageContext;

  const permissions: string[] = [];
  if (user.isSiteAdmin) {
    permissions.push('*:*');
  } else {
    // Map SharePoint permission mask to HBC permissions
    // High bit 0x800 = ManageWeb (admin-level)
    // Low bit 0x20 = EditListItems, 0x10 = ViewListItems
    const high = web.permissions.value.High;
    const low = web.permissions.value.Low;

    if (high & 0x800) permissions.push('settings:*');
    if (low & 0x20) permissions.push('project:write', 'document:write');
    if (low & 0x10) permissions.push('project:read', 'document:read', 'reports:read');

    // Everyone gets at least read access
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
 * Initialize MSAL authentication for PWA mode.
 * Stub — concrete implementation wired in Phase 4 (PWA).
 */
export function initMsalAuth(_config: IMsalConfig): Promise<ICurrentUser | null> {
  throw new Error('initMsalAuth() not yet implemented — requires @azure/msal-browser (Phase 4)');
}
