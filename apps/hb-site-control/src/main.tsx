/**
 * HB Site Control entry point — Foundation Plan Phase 6.
 * Tri-mode: mock (dev) / msal (prod standalone) / spfx (embedded).
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { resolveAuthMode } from '@hbc/auth';
import type { AuthMode } from '@hbc/auth';
import { bootstrapMockEnvironment } from './bootstrap.js';
import { App } from './App.js';
import './app.css';

async function start(): Promise<void> {
  const authMode: AuthMode = resolveAuthMode();

  if (authMode === 'mock') {
    bootstrapMockEnvironment();
  } else if (authMode === 'msal') {
    // MSAL init deferred to Phase 7 backend integration
    // await initializeMsalAuth();
  }
  // spfx mode: auth is handled by SharePoint context (bootstrapSpfxAuth)

  const root = document.getElementById('root');
  if (!root) throw new Error('Root element not found');

  createRoot(root).render(
    <StrictMode>
      <App authMode={authMode} />
    </StrictMode>,
  );
}

start().catch((err) => {
  console.error('HB Site Control failed to start:', err);
});
