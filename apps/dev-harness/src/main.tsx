/**
 * Dev-harness entry point — Foundation Plan Phase 3.
 * Bootstrap mock env → create QueryClient → render App.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { bootstrapMockEnvironment } from './bootstrap.js';
import { App } from './App.js';
import './harness.css';

// Imperative bootstrap BEFORE React renders — no loading spinners
bootstrapMockEnvironment();

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
