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
 * Stub — concrete implementation wired in Phase 5 (SPFx webparts).
 */
export function extractSpfxUser(): ICurrentUser {
  throw new Error('extractSpfxUser() not yet implemented — requires SPFx context (Phase 5)');
}

/**
 * Initialize MSAL authentication for PWA mode.
 * Stub — concrete implementation wired in Phase 4 (PWA).
 */
export function initMsalAuth(_config: IMsalConfig): Promise<ICurrentUser | null> {
  throw new Error('initMsalAuth() not yet implemented — requires @azure/msal-browser (Phase 4)');
}
