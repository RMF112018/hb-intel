/**
 * PWA entry point — Foundation Plan Phase 4.
 * Dual-mode: mock (synchronous) or msal (async).
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { resolveAuthMode, usePermissionStore } from '@hbc/auth';
import type { AuthMode } from '@hbc/auth';
import { toFeaturePermissionRegistrations, startPhase, endPhase } from '@hbc/shell';
import { FEATURE_REGISTRY } from './features/featureRegistry.js';
import { bootstrapMockEnvironment } from './bootstrap.js';
import { initializeMsalAuth } from './auth/msal-init.js';
import { assembleHubSources } from './sources/sourceAssembly.js';
import { App } from './App.js';
import './pwa.css';

async function start(): Promise<void> {
  // D-PH6F-07: Instrument runtime-detection — time to determine auth mode.
  startPhase('runtime-detection');
  const authMode: AuthMode = resolveAuthMode();
  endPhase('runtime-detection', { source: 'pwa-main', outcome: 'success', runtimeMode: authMode });

  if (authMode === 'mock') {
    // D-PH6F-07: Instrument auth-bootstrap for mock path (synchronous).
    startPhase('auth-bootstrap');
    bootstrapMockEnvironment();
    endPhase('auth-bootstrap', { source: 'mock-bootstrap', outcome: 'success', runtimeMode: 'mock' });

    // D-PH6F-07: session-restore is instantaneous in mock mode.
    startPhase('session-restore');
    endPhase('session-restore', { source: 'mock-bootstrap', outcome: 'success', runtimeMode: 'mock' });
  } else if (authMode === 'msal') {
    // D-PH6F-07: auth-bootstrap and session-restore phases are instrumented inside msal-init.ts.
    await initializeMsalAuth();
  }

  // D-PH6F-07: Instrument permission-resolution — time to register feature contracts.
  startPhase('permission-resolution');
  // D-PH6F-3: Register protected feature contracts before any route guard evaluation.
  usePermissionStore.getState().setFeatureRegistrations(
    toFeaturePermissionRegistrations(Object.values(FEATURE_REGISTRY)),
  );
  endPhase('permission-resolution', { source: 'pwa-bootstrap', outcome: 'success', runtimeMode: authMode });

  // P2-C1: Assemble hub sources — BIC modules, notification registrations, MyWork adapters.
  assembleHubSources();

  const root = document.getElementById('root');
  if (!root) throw new Error('Root element not found');

  createRoot(root).render(
    <StrictMode>
      <App authMode={authMode} />
    </StrictMode>,
  );
}

start().catch((err) => {
  console.error('HB Intel failed to start:', err);
});
