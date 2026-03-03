/**
 * SPFx webpart entry point — Project Hub.
 * Dual-mode: spfx (from SharePoint context) or mock (dev).
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { resolveAuthMode } from '@hbc/auth';
import type { AuthMode } from '@hbc/auth';
import { bootstrapMockEnvironment } from './bootstrap.js';
import { App } from './App.js';
import './webpart.css';

function start(): void {
  const authMode: AuthMode = resolveAuthMode();

  if (authMode === 'mock') {
    bootstrapMockEnvironment();
  }
  // spfx mode: bootstrapSpfxAuth() called by SPFx wrapper (future phase)

  const root = document.getElementById('root');
  if (!root) throw new Error('Root element not found');

  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

start();
