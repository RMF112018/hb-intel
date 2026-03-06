import type { ICurrentUser } from '@hbc/models';
import type { IMsalConfig, ISpfxPageContext } from '../types.js';
import { MsalAdapter } from './MsalAdapter.js';
import { MockAdapter } from './MockAdapter.js';
import { mapSpfxContextToUser, SpfxAdapter } from './SpfxAdapter.js';
export type {
  AdapterIdentityPayload,
  AuthFailure,
  AuthFailureCode,
  AuthMode,
  AuthResult,
  CanonicalAuthMode,
  IMsalConfig,
  ISpfxPageContext,
  LegacyAuthMode,
  NormalizedAuthSession,
  SessionRestoreMetadata,
  SessionRestoreOutcome,
  SessionRestorePolicy,
  SessionRestoreResult,
  ShellStatusTransition,
} from '../types.js';
export type { IAuthAdapter } from '../IAuthAdapter.js';

export {
  resolveAuthMode,
  resolveCanonicalAuthMode,
  mapLegacyToCanonicalAuthMode,
  mapCanonicalToLegacyAuthMode,
  describeResolvedAuthRuntime,
} from './resolveAuthMode.js';

export {
  createAuthFailure,
  normalizeIdentityToSession,
  restoreSessionWithinPolicy,
  ensureSupportedMode,
} from './sessionNormalization.js';

export { MsalAdapter } from './MsalAdapter.js';
export { SpfxAdapter, mapSpfxContextToUser } from './SpfxAdapter.js';
export { MockAdapter } from './MockAdapter.js';

/**
 * Backward-compatible helper retained for existing SPFx bootstrap flows.
 */
export function extractSpfxUser(pageContext: ISpfxPageContext): ICurrentUser {
  return mapSpfxContextToUser(pageContext);
}

/**
 * Backward-compatible helper retained for existing callers.
 * Returns `null` when no provider acquisition callback is supplied.
 */
export async function initMsalAuth(
  config: IMsalConfig,
  acquireMsalUser?: () => Promise<ICurrentUser | null>,
): Promise<ICurrentUser | null> {
  const adapter = new MsalAdapter(config, acquireMsalUser ?? null);
  const acquired = await adapter.acquireIdentity();
  if (!acquired.ok) {
    return null;
  }
  return acquired.value.user;
}

/**
 * Convenience helper for SPFx bootstrap integration seams.
 */
export async function acquireSpfxSession(
  pageContext: ISpfxPageContext,
): Promise<ReturnType<SpfxAdapter['acquireIdentity']>> {
  const adapter = new SpfxAdapter(pageContext);
  return adapter.acquireIdentity();
}

/**
 * Convenience helper for mock/dev-override bootstrap integration seams.
 */
export async function acquireMockSession(
  mode: 'mock' | 'dev-override' = 'mock',
): Promise<ReturnType<MockAdapter['acquireIdentity']>> {
  const adapter = new MockAdapter(mode);
  return adapter.acquireIdentity();
}
