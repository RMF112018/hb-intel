/**
 * useConnectivity hook — SF12-T05, D-07
 */
import type { ConnectivityStatus } from '../types/index.js';
import { useSessionState } from './useSessionState.js';

export function useConnectivity(): ConnectivityStatus {
  return useSessionState().connectivity;
}
