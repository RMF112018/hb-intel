/**
 * useConnectivity — Canonical connectivity hook
 * PH4.16 §Step 6 | Blueprint §2c
 *
 * Thin wrapper providing a canonical import path from @hbc/ui-kit/theme.
 * Delegates to useOnlineStatus from HbcAppShell/hooks.
 */
import { useOnlineStatus } from '../HbcAppShell/hooks/useOnlineStatus.js';
import type { ConnectivityStatus } from '../HbcAppShell/types.js';

export type { ConnectivityStatus };

/**
 * Access the current network connectivity status.
 *
 * @returns `ConnectivityStatus` — `'online' | 'syncing' | 'offline'`
 */
export function useConnectivity(): ConnectivityStatus {
  return useOnlineStatus();
}
