/**
 * Phase 1 Scope Guards — Acceptance tests that prevent removed scope
 * from silently returning to the Project Setup SPFx surface.
 *
 * Governed by: phase-1/Phase-1_Contract-Freeze.md
 *
 * These tests are intentionally strict. If a test fails, the change
 * either violates the Phase 1 contract or the contract itself needs
 * updating first.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { createWebpartRouter } from '../router/index.js';
import {
  setRuntimeConfig,
  getBackendMode,
  getFunctionAppUrl,
  getAllowBackendModeSwitch,
  ConfigError,
  _resetConfig,
} from '../config/runtimeConfig.js';
import { createUiReviewProjectSetupClient } from '../project-setup/backend/uiReviewProjectSetupClient.js';
import type { IProjectSetupClient } from '../project-setup/backend/types.js';
import fs from 'node:fs';
import path from 'node:path';

// ─────────────────────────────────────────────────────────────────────────────
// 1. Route scope guard
// ─────────────────────────────────────────────────────────────────────────────

describe('Phase 1 — Route scope guard', () => {
  const ALLOWED_ROUTES = ['/', '/project-setup', '/project-setup/new', '/project-setup/$requestId'];

  it('registers exactly the allowed Project Setup routes', () => {
    const router = createWebpartRouter();
    const routePaths = Object.keys(router.routesByPath ?? {}).sort();
    expect(routePaths).toEqual([...ALLOWED_ROUTES].sort());
  });

  it('does not register any out-of-scope route patterns', () => {
    const router = createWebpartRouter();
    const routePaths = Object.keys(router.routesByPath ?? {});
    const outOfScope = [
      '/bids', '/templates', '/estimating', '/accounting',
      '/admin', '/my-work', '/bd', '/project-hub',
      '/notifications', '/preferences', '/settings',
    ];
    for (const route of outOfScope) {
      expect(routePaths).not.toContain(route);
    }
  });

  it('starts at /project-setup', () => {
    const router = createWebpartRouter();
    expect(router.history.location.pathname).toBe('/project-setup');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. API client scope guard
// ─────────────────────────────────────────────────────────────────────────────

describe('Phase 1 — API client scope guard', () => {
  const CONTRACT_METHODS: (keyof IProjectSetupClient)[] = [
    'listRequests',
    'submitRequest',
    'getProvisioningStatus',
    'retryProvisioning',
    'escalateProvisioning',
  ];

  it('IProjectSetupClient exposes exactly the 5 contracted methods', () => {
    const client = createUiReviewProjectSetupClient();
    const clientKeys = Object.keys(client).sort();
    expect(clientKeys).toEqual([...CONTRACT_METHODS].sort());
  });

  it('each contracted method is a function', () => {
    const client = createUiReviewProjectSetupClient();
    for (const method of CONTRACT_METHODS) {
      expect(typeof client[method]).toBe('function');
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Runtime mode guard
// ─────────────────────────────────────────────────────────────────────────────

describe('Phase 1 — Runtime mode guard', () => {
  beforeEach(() => {
    _resetConfig();
    delete (import.meta.env as Record<string, unknown>).VITE_BACKEND_MODE;
    delete (import.meta.env as Record<string, unknown>).VITE_ALLOW_BACKEND_MODE_SWITCH;
    delete (import.meta.env as Record<string, unknown>).VITE_FUNCTION_APP_URL;
  });

  it('defaults to production mode', () => {
    expect(getBackendMode()).toBe('production');
  });

  it('defaults to mode-switch disabled', () => {
    expect(getAllowBackendModeSwitch()).toBe(false);
  });

  it('ui-review mode returns empty function app URL (no backend calls)', () => {
    setRuntimeConfig({ backendMode: 'ui-review' });
    expect(getFunctionAppUrl()).toBe('');
  });

  it('production mode throws ConfigError when function app URL is missing', () => {
    setRuntimeConfig({ backendMode: 'production' });
    expect(() => getFunctionAppUrl()).toThrow(ConfigError);
  });

  it('only accepts valid backend modes', () => {
    setRuntimeConfig({ backendMode: 'invalid-mode' as 'production' });
    // Invalid mode is ignored; falls through to default
    expect(getBackendMode()).toBe('production');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Static scope guard — source-level import boundaries
// ─────────────────────────────────────────────────────────────────────────────

describe('Phase 1 — Static scope guard (no out-of-scope imports)', () => {
  const SRC_DIR = path.resolve(__dirname, '..');

  function collectSourceFiles(dir: string): string[] {
    const files: string[] = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== 'test') {
        files.push(...collectSourceFiles(fullPath));
      } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith('.test.ts') && !entry.name.endsWith('.test.tsx')) {
        files.push(fullPath);
      }
    }
    return files;
  }

  const sourceFiles = collectSourceFiles(SRC_DIR);

  it('no source file directly calls /api/notifications', () => {
    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      expect(content).not.toMatch(/['"`]\/api\/notifications/);
    }
  });

  it('no source file directly calls /api/groups', () => {
    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      expect(content).not.toMatch(/['"`]\/api\/groups/);
    }
  });

  it('no source file directly calls /api/proxy', () => {
    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      expect(content).not.toMatch(/['"`]\/api\/proxy/);
    }
  });

  it('no source file imports useEstimatingTrackers or useEstimatingKickoff', () => {
    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      expect(content).not.toMatch(/useEstimatingTracker|useEstimatingKickoff|useCreateEstimatingTracker/);
    }
  });
});
