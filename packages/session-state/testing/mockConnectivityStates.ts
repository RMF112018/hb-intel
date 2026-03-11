import type { ConnectivityStatus } from '../src/types/ISessionState.js';

/**
 * All connectivity states for exhaustive testing.
 */
export const mockConnectivityStates: readonly ConnectivityStatus[] = [
  'online',
  'offline',
  'degraded',
] as const;
