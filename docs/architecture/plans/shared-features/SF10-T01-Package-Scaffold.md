# SF10-T01 — Package Scaffold: `@hbc/notification-intelligence`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-10-Shared-Feature-Notification-Intelligence.md`
**Decisions Applied:** D-01 (Azure Functions backend), D-07 (SPFx constraints), D-09 (Phase 1 static tiers), D-10 (testing sub-path)
**Estimated Effort:** 0.25 sprint-weeks
**Depends On:** `@hbc/complexity`, `@hbc/ui-kit/app-shell`

> **Doc Classification:** Canonical Normative Plan — SF10-T01 scaffold task; sub-plan of `SF10-Notification-Intelligence.md`.

---

## Objective

Create `packages/notification-intelligence/` with a complete `package.json` (dual `./` and `./testing` export entry points), `tsconfig.json`, `vitest.config.ts`, and all barrel stub files. No production dependencies beyond React and workspace peers — notification delivery is handled by the Azure Functions backend (T08).

---

## 3-Line Plan

1. Create `packages/notification-intelligence/package.json` with dual entry points and peer deps on `@hbc/complexity`, `@hbc/ui-kit`, and `@tanstack/react-query`.
2. Create `tsconfig.json` (extends `../../tsconfig.base.json`), `vitest.config.ts` with 95% coverage thresholds, and `src/test-setup.ts`.
3. Create all barrel stub files for `src/` and `testing/` sub-paths.

---

## `package.json`

```json
{
  "name": "@hbc/notification-intelligence",
  "version": "0.0.1",
  "description": "Priority-tiered smart notification system for HB Intel",
  "type": "module",
  "sideEffects": false,
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./testing": {
      "import": "./dist/testing/index.js",
      "types": "./dist/testing/index.d.ts"
    }
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsc --project tsconfig.json",
    "check-types": "tsc --noEmit",
    "lint": "eslint src testing --ext .ts,.tsx",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {},
  "peerDependencies": {
    "@hbc/complexity": "workspace:*",
    "@hbc/ui-kit": "workspace:*",
    "@tanstack/react-query": "^5.0.0",
    "react": "^18.0.0"
  },
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@types/react": "^18.0.0",
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

---

## `tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": ".",
    "outDir": "dist",
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "jsx": "react-jsx"
  },
  "include": ["src", "testing"],
  "exclude": ["dist", "node_modules", "**/*.test.ts", "**/*.test.tsx"]
}
```

---

## `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 95,
        branches: 95,
        functions: 95,
        statements: 95,
      },
      exclude: [
        'src/index.ts',
        'src/types/index.ts',
        'src/registry/index.ts',
        'src/api/index.ts',
        'src/hooks/index.ts',
        'src/components/index.ts',
        'testing/**',
        '**/*.d.ts',
      ],
    },
  },
});
```

---

## `src/test-setup.ts`

```typescript
import { vi } from 'vitest';

// Mock @hbc/complexity to isolate notification-intelligence unit tests
// from complexity context dependency
vi.mock('@hbc/complexity', () => ({
  useComplexity: vi.fn().mockReturnValue({ tier: 'standard' }),
  ComplexityProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock fetch for NotificationApi and PreferencesApi calls
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: vi.fn().mockResolvedValue({}),
});
```

---

## Barrel Stubs

### `src/index.ts`

```typescript
// @hbc/notification-intelligence — public barrel
// Populated by T02–T07

export * from './types';
export * from './registry';
export * from './api';
export * from './hooks';
export * from './components';
```

### `src/types/index.ts`

```typescript
// Populated by T02
export * from './INotification';
```

### `src/registry/index.ts`

```typescript
// Populated by T03
export { NotificationRegistry } from './NotificationRegistry';
```

### `src/api/index.ts`

```typescript
// Populated by T04
export { NotificationApi } from './NotificationApi';
export { PreferencesApi } from './PreferencesApi';
```

### `src/hooks/index.ts`

```typescript
// Populated by T05
export { useNotificationCenter } from './useNotificationCenter';
export { useNotificationPreferences } from './useNotificationPreferences';
export { useNotificationBadge } from './useNotificationBadge';
```

### `src/components/index.ts`

```typescript
// Populated by T06–T07
export { HbcNotificationCenter } from './HbcNotificationCenter';
export { HbcNotificationBadge } from './HbcNotificationBadge';
export { HbcNotificationBanner } from './HbcNotificationBanner';
export { HbcNotificationPreferences } from './HbcNotificationPreferences';
```

### `testing/index.ts`

```typescript
// @hbc/notification-intelligence/testing — test fixture sub-path (D-10)
// Import from this sub-path only in test files.
export { createMockNotification } from './createMockNotification';
export { createMockNotificationPreferences } from './createMockNotificationPreferences';
export { createMockNotificationRegistration } from './createMockNotificationRegistration';
export { mockNotificationTiers } from './mockNotificationTiers';
export { mockNotificationChannels } from './mockNotificationChannels';
```

---

## Verification Commands

```bash
# Confirm package resolves from workspace root
pnpm --filter @hbc/notification-intelligence build

# Confirm both entry points present in dist/
ls packages/notification-intelligence/dist/index.js
ls packages/notification-intelligence/dist/testing/index.js

# Type-check
pnpm --filter @hbc/notification-intelligence check-types

# Confirm no spurious production dependencies
cat packages/notification-intelligence/package.json | grep '"dependencies"' -A 3
# Expected: empty dependencies block
```

---

<!-- IMPLEMENTATION PROGRESS & NOTES
SF10-T01 completed: 2026-03-10
Package scaffold created with 27 files: package.json, tsconfig.json, tsconfig.build.json, vitest.config.ts,
test-setup.ts, 6 barrel stubs (src + testing), 11 placeholder source modules, 5 testing mock factories.
Reconciliation corrections applied: dist/src/ paths, tsconfig.build.json, workspace-current devDep versions,
resolve aliases, private:true, react-dom peer dep, sourceMap/lib, additional scripts, files array.
Root tsconfig.base.json updated with @hbc/notification-intelligence path mappings.
Verification: build ✓, check-types ✓, test (passWithNoTests) ✓, dist/src/index.js ✓, dist/testing/index.js ✓.
Next: SF10-T02 (TypeScript Contracts)
-->
