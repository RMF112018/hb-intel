# PH7-BW-10 — Testing Infrastructure: Vitest Unit + Playwright E2E for SPFx Webparts

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md §2h (Vitest + Playwright, 95% coverage)
**Date:** 2026-03-07
**Priority:** LOW (unblocks feature test writing) — Does not block BW-1 through BW-9 infrastructure
**Depends on:** BW-4 (Vite configs), BW-8 (dev harness — Playwright runs against it)
**Blocks:** Feature-level test writing in PH7 domain feature plans

---

## Summary

The Blueprint specifies (§2h): Vitest (unit/integration), Playwright (E2E), Storybook (UI/a11y), 95%+ coverage.

Currently, no webpart app has any test files, Vitest configuration, or Playwright specs. This task establishes the testing infrastructure at the webpart level so that feature teams can write tests as part of each feature implementation.

The testing strategy for SPFx webparts has three tiers:
1. **Unit/integration tests (Vitest)** — Test bootstrap logic, RBAC resolution, router config, and page components in isolation (no SharePoint dependency)
2. **E2E tests (Playwright)** — Test full user flows against the dev harness (no SharePoint dependency for dev mode)
3. **SharePoint Workbench smoke tests (manual)** — Validate SPFx-specific behavior (loading, context, auth) against a real tenant (manual or future Playwright-against-SP extension)

---

## Vitest Configuration Per Webpart App

Each webpart app needs a `vitest.config.ts`. Since all share the same base config, create a shared factory and override per app:

### Shared factory: `tools/vitest-webpart.config.ts`

```typescript
// tools/vitest-webpart.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export function createWebpartVitestConfig(appDir: string) {
  return defineConfig({
    plugins: [react()],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'lcov', 'html'],
        thresholds: {
          global: {
            statements: 80,
            branches: 80,
            functions: 80,
            lines: 80,
          },
        },
        exclude: [
          '**/node_modules/**',
          '**/dist/**',
          '**/*.config.ts',
          '**/test/**',
          '**/*.d.ts',
        ],
      },
    },
    resolve: {
      alias: {
        '@hbc/models': resolve(appDir, '../../../packages/models/src/index.ts'),
        '@hbc/data-access': resolve(appDir, '../../../packages/data-access/src/index.ts'),
        '@hbc/query-hooks': resolve(appDir, '../../../packages/query-hooks/src/index.ts'),
        '@hbc/ui-kit': resolve(appDir, '../../../packages/ui-kit/src/index.ts'),
        '@hbc/auth': resolve(appDir, '../../../packages/auth/src/index.ts'),
        '@hbc/auth/spfx': resolve(appDir, '../../../packages/auth/src/spfx/index.ts'),
        '@hbc/shell': resolve(appDir, '../../../packages/shell/src/index.ts'),
        // Mock SPFx SDK — not available in jsdom
        '@microsoft/sp-core-library': resolve(appDir, '../../../tools/mocks/sp-core-library.ts'),
        '@microsoft/sp-webpart-base': resolve(appDir, '../../../tools/mocks/sp-webpart-base.ts'),
        '@microsoft/sp-property-pane': resolve(appDir, '../../../tools/mocks/sp-property-pane.ts'),
      },
    },
  });
}
```

### Per-app vitest.config.ts (example — accounting):

```typescript
// apps/accounting/vitest.config.ts
import { createWebpartVitestConfig } from '../../tools/vitest-webpart.config.js';
export default createWebpartVitestConfig(__dirname);
```

All 11 apps use this same one-liner.

---

## SPFx SDK Mocks

The SharePoint SDK packages (`@microsoft/sp-webpart-base`, etc.) are not available in jsdom. Create lightweight mocks:

```typescript
// tools/mocks/sp-webpart-base.ts
export class BaseClientSideWebPart<TProperties> {
  public context: Record<string, unknown> = {};
  public domElement: HTMLElement = document.createElement('div');
  public properties: TProperties = {} as TProperties;
  protected async onInit(): Promise<void> { /* no-op */ }
  public render(): void { /* no-op */ }
  protected onDispose(): void { /* no-op */ }
}

// tools/mocks/sp-core-library.ts
export const Version = {
  parse: (v: string) => ({ major: 1, minor: 0, revision: 0, toString: () => v }),
};

// tools/mocks/sp-property-pane.ts
export const PropertyPaneTextField = (key: string, config: Record<string, unknown>) => ({
  key, ...config
});
export type IPropertyPaneConfiguration = Record<string, unknown>;
```

---

## Test Setup File Pattern

Each app needs a `src/test/setup.ts`:

```typescript
// apps/accounting/src/test/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Reset all Zustand stores between tests
beforeEach(() => {
  // Reset auth and permission stores to clean state
  vi.resetAllMocks();
});

// Mock window._spPageContextInfo so resolveAuthMode() returns 'mock' in tests
Object.defineProperty(window, '_spPageContextInfo', {
  value: undefined,
  writable: true,
});
```

---

## Core Unit Tests Per Domain

Each webpart app must have these baseline test files:

### 1. Bootstrap test (`src/test/bootstrap.test.ts`)

```typescript
// apps/accounting/src/test/bootstrap.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { bootstrapMockEnvironment } from '../bootstrap.js';
import { useAuthStore, usePermissionStore } from '@hbc/auth';
import { useNavStore } from '@hbc/shell';

describe('bootstrapMockEnvironment (accounting)', () => {
  beforeEach(() => {
    // Reset stores
    useAuthStore.setState({ currentUser: null });
    usePermissionStore.setState({ permissions: [] });
  });

  it('sets a non-null current user', () => {
    bootstrapMockEnvironment();
    expect(useAuthStore.getState().currentUser).not.toBeNull();
  });

  it('sets non-wildcard permissions', () => {
    bootstrapMockEnvironment();
    const perms = usePermissionStore.getState().permissions;
    expect(perms).not.toContain('*:*');
    expect(perms.length).toBeGreaterThan(0);
  });

  it('sets workspace to accounting', () => {
    bootstrapMockEnvironment();
    expect(useNavStore.getState().activeWorkspace).toBe('accounting');
  });

  it('uses PersonaRegistry (not hardcoded MOCK_USER)', () => {
    bootstrapMockEnvironment();
    const user = useAuthStore.getState().currentUser;
    // PersonaRegistry users have structured IDs, not 'user-001'
    expect(user?.id).not.toBe('user-001');
  });
});
```

### 2. Router test (`src/test/router.test.ts`)

```typescript
// apps/accounting/src/test/router.test.ts
import { describe, it, expect } from 'vitest';
import { createWebpartRouter } from '../router/index.js';

describe('createWebpartRouter (accounting)', () => {
  it('creates a router with memory history', () => {
    const router = createWebpartRouter();
    expect(router.history.location.pathname).toBe('/');
  });

  it('resolves the root route', async () => {
    const router = createWebpartRouter();
    await router.navigate({ to: '/' });
    expect(router.state.location.pathname).toBe('/');
  });
});
```

### 3. RBAC mapping test (in `packages/auth`)

```typescript
// packages/auth/src/spfx/__tests__/SpfxRbacAdapter.test.ts
import { describe, it, expect } from 'vitest';
import { SP_GROUP_TO_PERMISSIONS } from '../SpfxRbacAdapter.js';

describe('SP_GROUP_TO_PERMISSIONS', () => {
  it('Accounting Manager has accounting:write', () => {
    expect(SP_GROUP_TO_PERMISSIONS['HB Intel Accounting Managers']).toContain('accounting:write');
  });

  it('Field Personnel does not have accounting:write', () => {
    expect(SP_GROUP_TO_PERMISSIONS['HB Intel Field Personnel']).not.toContain('accounting:write');
  });

  it('All groups have at least action:read', () => {
    for (const [group, perms] of Object.entries(SP_GROUP_TO_PERMISSIONS)) {
      expect(perms, `${group} missing action:read`).toContain('action:read');
    }
  });

  it('Administrator has all 17 canonical permission keys', () => {
    const adminPerms = SP_GROUP_TO_PERMISSIONS['HB Intel Administrators'];
    const canonical = [
      'admin:read', 'admin:write', 'admin:delete', 'admin:approve',
      'action:read', 'action:write', 'action:delete', 'action:approve',
      'feature:audit-logs', 'feature:override-requests',
      'provisioning:read', 'provisioning:write', 'provisioning:approve',
      'project:read', 'project:write',
      'accounting:read', 'accounting:write',
    ];
    for (const key of canonical) {
      expect(adminPerms, `Administrator missing ${key}`).toContain(key);
    }
  });
});
```

---

## Playwright E2E Configuration

Playwright tests run against the dev harness (BW-8). Create root-level `playwright.webparts.config.ts`:

```typescript
// playwright.webparts.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/webparts',
  fullyParallel: false, // Dev harness shares one Zustand store instance
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'pnpm --filter="./apps/dev-harness" dev --port 3000',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
```

### Baseline E2E spec: `e2e/webparts/accounting.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Accounting Webpart', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: 'Accounting' }).click();
    await page.waitForLoadState('networkidle');
  });

  test('renders without error boundary', async ({ page }) => {
    await expect(page.locator('[data-testid="error-boundary"]')).not.toBeVisible();
  });

  test('shows simplified shell (no app launcher, no project picker)', async ({ page }) => {
    await expect(page.locator('[data-testid="app-launcher"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="project-picker"]')).not.toBeVisible();
  });

  test('shows back-to-project-hub link', async ({ page }) => {
    await expect(page.getByText('Back to Project Hub')).toBeVisible();
  });

  test('overview page renders', async ({ page }) => {
    await expect(page.locator('main, [role="main"]')).toBeVisible();
  });
});
```

Add equivalent baseline specs for all 11 webparts under `e2e/webparts/`.

---

## Package.json Test Scripts

Add to each `apps/[domain]/package.json`:
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

Add to root `package.json`:
```json
{
  "scripts": {
    "test:webparts:e2e": "playwright test --config=playwright.webparts.config.ts",
    "test:webparts:e2e:ui": "playwright test --config=playwright.webparts.config.ts --ui"
  }
}
```

---

## Verification

```bash
# Run unit tests for accounting
pnpm --filter="./apps/accounting" test

# Run unit tests for all webpart apps
pnpm turbo run test --filter="./apps/accounting" \
  --filter="./apps/estimating" --filter="./apps/project-hub"

# Run coverage report
pnpm --filter="./apps/accounting" test:coverage

# Run Playwright E2E (requires dev harness running)
pnpm test:webparts:e2e

# Expected: all bootstrap tests pass, router tests pass, RBAC tests pass
# Expected: Playwright tests pass for accounting tab (simplified shell visible)
```

---

## Definition of Done

- [ ] `tools/vitest-webpart.config.ts` shared factory created
- [ ] `apps/[domain]/vitest.config.ts` created for all 11 apps (single-line using factory)
- [ ] SPFx SDK mock files created at `tools/mocks/sp-*.ts`
- [ ] `apps/[domain]/src/test/setup.ts` created for all 11 apps
- [ ] `apps/[domain]/src/test/bootstrap.test.ts` created and passing for all 11 apps
- [ ] `apps/[domain]/src/test/router.test.ts` created and passing for all 11 apps
- [ ] `packages/auth/src/spfx/__tests__/SpfxRbacAdapter.test.ts` created and passing
- [ ] `playwright.webparts.config.ts` created at repo root
- [ ] Baseline Playwright E2E specs created for all 11 webpart tabs (`e2e/webparts/*.spec.ts`)
- [ ] All unit tests pass with coverage ≥ 80% for covered files
- [ ] Playwright baseline tests pass against dev harness
- [ ] CI/CD workflow (`spfx-build.yml`) includes test step
