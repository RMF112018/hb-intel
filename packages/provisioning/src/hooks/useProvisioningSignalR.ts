import { useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import type { IProvisioningProgressEvent } from '@hbc/models';
import { useProvisioningStore } from '../store.js';

export interface IUseProvisioningSignalROptions {
  /** The negotiate endpoint URL (Function App base URL + /api/provisioning-negotiate) */
  negotiateUrl: string;
  /** The projectId to connect to */
  projectId: string;
  /** Factory function that returns the current Bearer token for the Function App */
  getToken: () => Promise<string>;
  /** Whether the connection should be active (e.g. false when no projectId) */
  enabled?: boolean;
}

/**
 * D-PH6-09 / P4-03: Managed SignalR hook for provisioning progress events.
 *
 * **Enhancement-layer role (P4-03):** This hook provides real-time progress
 * updates as an enhancement to the authoritative status API endpoint. If the
 * connection fails or is unavailable, consumers fall back to API polling.
 * The store's stale-event guard ensures events from a different run than the
 * known status are dropped.
 *
 * **Terminal-state handling:** Consumers should set `enabled: false` when a
 * terminal state (Completed/Failed) is reached to stop the connection and
 * prevent unnecessary reconnect attempts. The cleanup function runs
 * automatically when `enabled` transitions from true to false.
 *
 * Traceability: docs/reference/provisioning/durable-status-contract.md
 */
export function useProvisioningSignalR({
  negotiateUrl,
  projectId,
  getToken,
  enabled = true,
}: IUseProvisioningSignalROptions): { isConnected: boolean } {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const { handleProgressEvent, setSignalRConnected } = useProvisioningStore();

  useEffect(() => {
    if (!enabled || !projectId) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${negotiateUrl}?projectId=${projectId}`, {
        accessTokenFactory: getToken,
      })
      // D-PH6-09 reconnect strategy: immediate retry, then incremental backoff up to 60s.
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000, 60000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.on('provisioningProgress', (event: IProvisioningProgressEvent) => {
      handleProgressEvent(event);
    });

    connection.onclose(() => setSignalRConnected(false));
    connection.onreconnecting(() => setSignalRConnected(false));
    connection.onreconnected(() => setSignalRConnected(true));

    connectionRef.current = connection;

    connection
      .start()
      .then(() => setSignalRConnected(true))
      .catch((err) => {
        console.warn('[useProvisioningSignalR] Failed to connect:', err);
        setSignalRConnected(false);
      });

    return () => {
      const activeConnection = connectionRef.current;
      connectionRef.current = null;
      activeConnection
        ?.stop()
        .catch(() => {
          // Ignore cleanup errors on unmount.
        });
      setSignalRConnected(false);
    };
  }, [enabled, projectId, negotiateUrl, getToken, handleProgressEvent, setSignalRConnected]);

  return { isConnected: useProvisioningStore((s) => s.signalRConnected) };
}
