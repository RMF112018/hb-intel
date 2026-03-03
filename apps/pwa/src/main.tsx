/**
 * PWA entry point — Foundation Plan Phase 4.
 * Dual-mode: mock (synchronous) or msal (async).
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { resolveAuthMode } from '@hbc/auth';
import type { AuthMode } from '@hbc/auth';
import { bootstrapMockEnvironment } from './bootstrap.js';
import { initializeMsalAuth } from './auth/msal-init.js';
import { App } from './App.js';
import './pwa.css';

async function start(): Promise<void> {
  const authMode: AuthMode = resolveAuthMode();

  if (authMode === 'mock') {
    bootstrapMockEnvironment();
  } else if (authMode === 'msal') {
    await initializeMsalAuth();
  }

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
