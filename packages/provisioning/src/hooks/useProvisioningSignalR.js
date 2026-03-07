import { useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { useProvisioningStore } from '../store.js';
/**
 * D-PH6-09 managed SignalR hook for provisioning progress events.
 * Traceability: docs/architecture/plans/PH6.9-Provisioning-Package.md §6.9.3
 */
export function useProvisioningSignalR({ negotiateUrl, projectId, getToken, enabled = true, }) {
    const connectionRef = useRef(null);
    const { handleProgressEvent, setSignalRConnected } = useProvisioningStore();
    useEffect(() => {
        if (!enabled || !projectId)
            return;
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`${negotiateUrl}?projectId=${projectId}`, {
            accessTokenFactory: getToken,
        })
            // D-PH6-09 reconnect strategy: immediate retry, then incremental backoff up to 60s.
            .withAutomaticReconnect([0, 2000, 5000, 10000, 30000, 60000])
            .configureLogging(signalR.LogLevel.Warning)
            .build();
        connection.on('provisioningProgress', (event) => {
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
//# sourceMappingURL=useProvisioningSignalR.js.map