/**
 * Connectivity monitor — SF12-T04, D-03
 */
import type { ConnectivityStatus } from '../types/index.js';
import {
  CONNECTIVITY_PROBE_TIMEOUT_MS,
  CONNECTIVITY_PROBE_INTERVAL_MS,
} from '../constants/index.js';

export type ConnectivityListener = (status: ConnectivityStatus) => void;

export interface IConnectivityMonitor {
  getStatus(): ConnectivityStatus;
  subscribe(listener: ConnectivityListener): () => void;
  probe(): Promise<ConnectivityStatus>;
  dispose(): void;
}

export function createConnectivityMonitor(
  probeUrl?: string,
): IConnectivityMonitor {
  let currentStatus: ConnectivityStatus = getInitialStatus();
  const listeners = new Set<ConnectivityListener>();
  let probeInterval: ReturnType<typeof setInterval> | null = null;

  const onOnline = (): void => {
    void probe();
  };

  const onOffline = (): void => {
    setStatus('offline');
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
  }

  if (probeUrl) {
    probeInterval = setInterval(() => {
      void probe();
    }, CONNECTIVITY_PROBE_INTERVAL_MS);
  }

  function getInitialStatus(): ConnectivityStatus {
    if (typeof navigator === 'undefined') return 'online';
    return navigator.onLine ? 'online' : 'offline';
  }

  function setStatus(status: ConnectivityStatus): void {
    if (status === currentStatus) return;
    currentStatus = status;
    for (const listener of listeners) {
      listener(status);
    }
  }

  async function probe(): Promise<ConnectivityStatus> {
    if (typeof navigator === 'undefined') {
      setStatus('online');
      return 'online';
    }

    if (!navigator.onLine) {
      setStatus('offline');
      return 'offline';
    }

    if (!probeUrl) {
      const status: ConnectivityStatus = navigator.onLine ? 'online' : 'offline';
      setStatus(status);
      return status;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CONNECTIVITY_PROBE_TIMEOUT_MS);
    const start = Date.now();

    try {
      await fetch(probeUrl, {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timer);
      const elapsed = Date.now() - start;
      const status: ConnectivityStatus =
        elapsed > CONNECTIVITY_PROBE_TIMEOUT_MS / 2 ? 'degraded' : 'online';
      setStatus(status);
      return status;
    } catch {
      clearTimeout(timer);
      setStatus('offline');
      return 'offline';
    }
  }

  function getStatus(): ConnectivityStatus {
    return currentStatus;
  }

  function subscribe(listener: ConnectivityListener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  function dispose(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    }
    if (probeInterval !== null) {
      clearInterval(probeInterval);
      probeInterval = null;
    }
    listeners.clear();
  }

  return { getStatus, subscribe, probe, dispose };
}
