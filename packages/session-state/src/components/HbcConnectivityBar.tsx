/**
 * HbcConnectivityBar — Connectivity status bar component — SF12-T06, D-08
 *
 * Renders a dismissible status bar reflecting the current connectivity state.
 * Uses inline styles only (app-shell-safe, SPFx-compatible).
 */
import { useState, useEffect, useRef } from 'react';
import type { ConnectivityStatus } from '../types/index.js';
import { useSessionState } from '../hooks/useSessionState.js';

export interface HbcConnectivityBarProps {
  /** When true the bar is visible even when fully online. Default: false */
  showWhenOnline?: boolean;
}

const SYNCING_DURATION_MS = 3_000;

const baseBarStyle: React.CSSProperties = {
  padding: '8px 16px',
  fontSize: '14px',
  fontWeight: 500,
  textAlign: 'center',
  width: '100%',
  boxSizing: 'border-box',
};

const barStyles: Record<string, React.CSSProperties> = {
  online: { ...baseBarStyle, backgroundColor: '#d4edda', color: '#155724' },
  syncing: { ...baseBarStyle, backgroundColor: '#d4edda', color: '#155724' },
  degraded: { ...baseBarStyle, backgroundColor: '#fff3cd', color: '#856404' },
  offline: { ...baseBarStyle, backgroundColor: '#f8d7da', color: '#721c24' },
};

export function HbcConnectivityBar({ showWhenOnline = false }: HbcConnectivityBarProps): React.ReactElement | null {
  const { connectivity, pendingCount } = useSessionState();
  const [isSyncing, setIsSyncing] = useState(false);
  const prevConnectivity = useRef<ConnectivityStatus>(connectivity);

  useEffect(() => {
    const wasOffline = prevConnectivity.current === 'offline';
    prevConnectivity.current = connectivity;

    if (wasOffline && connectivity !== 'offline') {
      setIsSyncing(true);
      const timer = setTimeout(() => setIsSyncing(false), SYNCING_DURATION_MS);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [connectivity]);

  // Determine visibility
  if (connectivity === 'online' && !isSyncing && !showWhenOnline) {
    return null;
  }

  let message: string;
  let styleKey: string;

  if (isSyncing) {
    message = 'Syncing changes\u2026';
    styleKey = 'syncing';
  } else if (connectivity === 'degraded') {
    message = 'Connection unstable \u2014 changes will be saved locally';
    styleKey = 'degraded';
  } else if (connectivity === 'offline') {
    message = `You are offline \u2014 ${pendingCount} change(s) queued`;
    styleKey = 'offline';
  } else {
    message = 'Connected';
    styleKey = 'online';
  }

  return (
    <div role="status" aria-live="polite" style={barStyles[styleKey]} data-testid="connectivity-bar">
      {message}
    </div>
  );
}
