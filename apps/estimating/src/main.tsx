import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { resolveAuthMode } from '@hbc/auth';
import type { AuthMode } from '@hbc/auth';
import { bootstrapMockEnvironment } from './bootstrap.js';
import { App } from './App.js';
import './webpart.css';

// DEV MODE ONLY: This entry point is used by Vite dev server.
// In SharePoint (production), the SPFx shell loads the IIFE via mount.tsx.
function start(): void {
  const authMode: AuthMode = resolveAuthMode();
  if (authMode === 'mock') bootstrapMockEnvironment();
  const root = document.getElementById('root');
  if (!root) throw new Error('Root element not found');
  createRoot(root).render(<StrictMode><App /></StrictMode>);
}

start();
