import { useSyncExternalStore } from 'react';

/** Subscribes to browser online/offline events. */
function subscribeToOnlineStatus(callback: () => void): () => void {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getOnlineSnapshot(): boolean {
  return navigator.onLine;
}

export function useNetworkStatus() {
  const isOnline = useSyncExternalStore(subscribeToOnlineStatus, getOnlineSnapshot);
  return { isOnline };
}
