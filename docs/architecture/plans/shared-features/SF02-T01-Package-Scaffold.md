# SF02-T01 — Package Scaffold: `@hbc/bic-next-move`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-02-Shared-Feature-BIC-Next-Move.md`
**Decisions Applied:** D-02 (registry pattern), D-10 (testing sub-path)
**Estimated Effort:** 0.25 sprint-weeks

---

## Objective

Create the full directory scaffold, configuration files, and barrel export stubs for `packages/bic-next-move/`. This task produces no runtime logic — only the structure that all subsequent tasks build within.

---

## 3-Line Plan

1. Create directory tree with all folders and stub `index.ts` files.
2. Write `package.json`, `tsconfig.json`, and `vitest.config.ts`.
3. Register package in Turborepo pipeline and verify `pnpm turbo run build` resolves the package.

---

## Directory Tree

Create all folders and stub files as listed. Every `index.ts` is a stub (`export {};`) until populated by later tasks.

```
packages/bic-next-move/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts
│   ├── types/
│   │   ├── IBicNextMove.ts               # stub → T02
│   │   └── index.ts                      # stub → T02
│   ├── constants/
│   │   ├── urgencyThresholds.ts          # stub → T02
│   │   └── manifest.ts                   # stub → T02
│   ├── registry/
│   │   ├── BicModuleRegistry.ts          # stub → T03
│   │   └── index.ts                      # stub → T03
│   ├── hooks/
│   │   ├── useBicNextMove.ts             # stub → T04
│   │   ├── useBicMyItems.ts              # stub → T04
│   │   └── index.ts                      # stub → T04
│   ├── transfer/
│   │   ├── recordBicTransfer.ts          # stub → T06
│   │   ├── TransferDeduplicator.ts       # stub → T06
│   │   └── index.ts                      # stub → T06
│   └── components/
│       ├── HbcBicBadge.tsx               # stub → T05
│       ├── HbcBicDetail.tsx              # stub → T05
│       ├── HbcBicBlockedBanner.tsx       # stub → T05
│       └── index.ts                      # stub → T05
├── testing/
│   ├── index.ts                          # stub → T07
│   ├── MockBicItem.ts                    # stub → T07
│   ├── createMockBicConfig.ts            # stub → T07
│   ├── mockBicStates.ts                  # stub → T07
│   └── createMockBicOwner.ts             # stub → T07
└── src/__tests__/
    ├── setup.ts
    ├── useBicNextMove.test.ts            # stub → T07
    ├── useBicMyItems.test.ts             # stub → T07
    ├── BicModuleRegistry.test.ts         # stub → T07
    ├── TransferDeduplicator.test.ts      # stub → T07
    ├── HbcBicBadge.test.tsx              # stub → T07
    ├── HbcBicDetail.test.tsx             # stub → T07
    └── HbcBicBlockedBanner.test.tsx      # stub → T07
```

---

## `package.json`

```json
{
  "name": "@hbc/bic-next-move",
  "version": "0.1.0",
  "private": true,
  "description": "Universal Ball-In-Court & Next Move Ownership platform primitive",
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./testing": {
      "import": "./testing/index.js",
      "types": "./testing/index.d.ts"
    }
  },
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": [
    "dist",
    "testing"
  ],
  "scripts": {
    "build": "tsc --project tsconfig.json",
    "dev": "tsc --project tsconfig.json --watch",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src --ext .ts,.tsx",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@hbc/ui-kit": "workspace:*",
    "@tanstack/react-query": "^5.0.0",
    "react": "^18.3.0"
  },
  "devDependencies": {
    "@hbc/tsconfig": "workspace:*",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@types/react": "^18.3.0",
    "@vitejs/plugin-react": "^4.0.0",
    "@vitest/coverage-v8": "^2.0.0",
    "jsdom": "^25.0.0",
    "typescript": "^5.5.0",
    "vitest": "^2.0.0"
  },
  "peerDependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  }
}
```

> **Note on `testing/` sub-path (D-10):** The `exports` field exposes `@hbc/bic-next-move/testing` as a separate entry point. The `testing/` directory is committed to source control but is intentionally excluded from production bundle analysis. Consumers import from this path only in test files and Storybook — never in application code.

---

## `tsconfig.json`

```json
{
  "extends": "@hbc/tsconfig/base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "jsx": "react-jsx",
    "strict": true,
    "paths": {
      "@hbc/bic-next-move/testing": ["./testing/index.ts"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "src/__tests__"]
}
```

> **Note:** `testing/` is excluded from the main `tsconfig.json` so it doesn't add to the production type surface. The `testing/` folder uses its own implicit tsconfig inherited from the workspace root.

---

## `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/__tests__/**',
        'src/**/index.ts',
      ],
      thresholds: {
        lines: 95,
        functions: 95,
        branches: 95,
        statements: 95,
      },
    },
    alias: {
      '@hbc/bic-next-move/testing': resolve(__dirname, './testing/index.ts'),
    },
  },
  resolve: {
    alias: {
      '@hbc/bic-next-move/testing': resolve(__dirname, './testing/index.ts'),
    },
  },
});
```

---

## Test Setup File

```typescript
// src/__tests__/setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';

afterEach(() => {
  cleanup();
});

// Mock @hbc/notification-intelligence so transfer tests don't need the full package
beforeAll(() => {
  vi.mock('@hbc/notification-intelligence', () => ({
    notificationIntelligence: {
      registerEvent: vi.fn(),
    },
  }));
});
```

---

## Barrel Export Stubs

### `src/index.ts` (stub — populated by T02–T06)

```typescript
// Types
export * from './types';

// Constants
export * from './constants/urgencyThresholds';
export * from './constants/manifest';

// Registry
export * from './registry';

// Hooks
export * from './hooks';

// Transfer
export * from './transfer';

// Components
export * from './components';
```

### `src/types/index.ts`

```typescript
export * from './IBicNextMove';
```

### `src/registry/index.ts`

```typescript
export * from './BicModuleRegistry';
```

### `src/hooks/index.ts`

```typescript
export * from './useBicNextMove';
export * from './useBicMyItems';
```

### `src/transfer/index.ts`

```typescript
export * from './recordBicTransfer';
export * from './TransferDeduplicator';
```

### `src/components/index.ts`

```typescript
export * from './HbcBicBadge';
export * from './HbcBicDetail';
export * from './HbcBicBlockedBanner';
```

### `testing/index.ts` (stub — populated by T07)

```typescript
export * from './MockBicItem';
export * from './createMockBicConfig';
export * from './mockBicStates';
export * from './createMockBicOwner';
```

---

## Turborepo Registration

Add to `turbo.json` pipeline (if not already covered by workspace glob):

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    }
  }
}
```

Add to `pnpm-workspace.yaml` (if not already using `packages/**`):

```yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

Verify `packages/bic-next-move` is discovered:

```bash
pnpm ls --filter @hbc/bic-next-move
```

---

## Verification Commands

```bash
# 1. Confirm package is in workspace graph
pnpm ls --filter @hbc/bic-next-move

# 2. Typecheck with zero errors (stubs only, should pass)
pnpm --filter @hbc/bic-next-move typecheck

# 3. Build succeeds (stub build)
pnpm --filter @hbc/bic-next-move build

# 4. Run tests (stub — 0 tests, 0 failures)
pnpm --filter @hbc/bic-next-move test

# 5. Confirm testing sub-path resolves
node -e "import('@hbc/bic-next-move/testing').then(m => console.log(Object.keys(m)))"
```

Expected: all commands exit 0. Test run reports "No test files found" (not an error at this stage).

<!-- IMPLEMENTATION PROGRESS & NOTES
SF02-T01 completed: 2026-03-08
- Created full directory scaffold: 33 new files
- package.json with dual exports (D-10 testing sub-path), aligned devDeps to workspace versions (vitest ^3.2.4, vite ^6.0.0)
- tsconfig.json extends ../../tsconfig.base.json with composite: true
- vitest.config.ts with passWithNoTests: true, 95% coverage thresholds
- All barrel index files, source stubs, testing stubs, and test stubs created
- Path aliases registered in tsconfig.base.json
- Verification: pnpm ls ✓ | typecheck ✓ | build ✓ | test ✓ (7 files, 0 tests, exit 0)
Discrepancy resolutions applied: #1 (extends path), #2 (remove @hbc/tsconfig), #3 (react peerDeps only), #4 (vitest ^3.2.4), #5 (composite: true), #6 (check-types script), #7 (passWithNoTests)
Next: SF02-T02 (TypeScript Contracts)
-->
