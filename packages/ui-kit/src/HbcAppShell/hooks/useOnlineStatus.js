/**
 * useOnlineStatus — Tracks browser connectivity
 * PH4.4 §Step 1 | Blueprint §2c
 *
 * Uses navigator.onLine + window online/offline events + SW postMessage listener.
 * Gracefully degrades if no ServiceWorker is available.
 */
import { useState, useEffect } from 'react';
export function useOnlineStatus() {
    const [status, setStatus] = useState(typeof navigator !== 'undefined' && navigator.onLine ? 'online' : 'offline');
    useEffect(() => {
        if (typeof window === 'undefined')
            return;
        const handleOnline = () => setStatus((prev) => (prev === 'offline' ? 'online' : prev));
        const handleOffline = () => setStatus('offline');
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        // Listen for SW sync messages
        const handleSWMessage = (event) => {
            if (event.data?.type === 'HBC_SYNC_STATUS') {
                const syncStatus = event.data.status;
                if (syncStatus === 'syncing' || syncStatus === 'online' || syncStatus === 'offline') {
                    setStatus(syncStatus);
                }
            }
        };
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', handleSWMessage);
        }
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.removeEventListener('message', handleSWMessage);
            }
        };
    }, []);
    return status;
}
//# sourceMappingURL=useOnlineStatus.js.map