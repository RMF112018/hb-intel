# SF08-T01 — Package Scaffold: `@hbc/workflow-handoff`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-08-Shared-Feature-Workflow-Handoff.md`
**Decisions Applied:** D-09 (generic type contract), D-10 (testing sub-path)
**Estimated Effort:** 0.25 sprint-weeks
**Depends On:** `@hbc/bic-next-move` (for `IBicOwner`), `@hbc/ui-kit` (for app-shell), `@hbc/complexity` (for `useComplexity`), `@hbc/acknowledgment` (composed in Receiver), `@hbc/field-annotations` (annotation markers in Receiver)

> **Doc Classification:** Canonical Normative Plan — SF08-T01 package scaffold task; sub-plan of `SF08-Workflow-Handoff.md`.

---

## Objective

Create the full directory scaffold, configuration files, and barrel export stubs for `packages/workflow-handoff/`. This task produces no runtime logic — only the structure that all subsequent tasks build within.

---

## 3-Line Plan

1. Create directory tree with all folders and stub `index.ts` / `.tsx` files.
2. Write `package.json`, `tsconfig.json`, and `vitest.config.ts`.
3. Register in Turborepo workspace and verify `pnpm turbo run build` resolves the package.

---

## Directory Tree

```
packages/workflow-handoff/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts                                    # Main barrel — stub → T02–T06
│   ├── types/
│   │   ├── IWorkflowHandoff.ts                     # stub → T02
│   │   └── index.ts                               # stub → T02
│   ├── constants/
│   │   ├── handoffDefaults.ts                      # stub → T02
│   │   └── index.ts                               # stub → T02
│   ├── api/
│   │   ├── HandoffApi.ts                           # stub → T03
│   │   └── index.ts                               # stub → T03
│   ├── hooks/
│   │   ├── usePrepareHandoff.ts                    # stub → T04
│   │   ├── useHandoffInbox.ts                      # stub → T04
│   │   ├── useHandoffStatus.ts                     # stub → T04
│   │   └── index.ts                               # stub → T04
│   └── components/
│       ├── HbcHandoffComposer.tsx                  # stub → T05
│       ├── HbcHandoffReceiver.tsx                  # stub → T06
│       ├── HbcHandoffStatusBadge.tsx               # stub → T06
│       └── index.ts                               # stub → T05–T06
├── testing/
│   ├── index.ts                                    # stub → T08
│   ├── createMockHandoffPackage.ts                 # stub → T08
│   ├── createMockHandoffConfig.ts                  # stub → T08
│   ├── createMockHandoffDocument.ts                # stub → T08
│   ├── createMockContextNote.ts                    # stub → T08
│   └── mockHandoffStates.ts                       # stub → T08
└── src/__tests__/
    ├── setup.ts
    ├── HandoffApi.test.ts                          # stub → T08
    ├── usePrepareHandoff.test.ts                   # stub → T08
    ├── useHandoffInbox.test.ts                     # stub → T08
    ├── useHandoffStatus.test.ts                    # stub → T08
    ├── HbcHandoffComposer.test.tsx                 # stub → T08
    ├── HbcHandoffReceiver.test.tsx                 # stub → T08
    └── HbcHandoffStatusBadge.test.tsx              # stub → T08
```

---

## `package.json`

```json
{
  "name": "@hbc/workflow-handoff",
  "version": "0.1.0",
  "private": true,
  "description": "Platform-wide structured cross-module workflow handoff primitive",
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
    "check-types": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src --ext .ts,.tsx"
  },
  "dependencies": {
    "@hbc/bic-next-move": "workspace:*",
    "@hbc/ui-kit": "workspace:*",
    "@hbc/complexity": "workspace:*",
    "@hbc/acknowledgment": "workspace:*",
    "@hbc/field-annotations": "workspace:*",
    "@tanstack/react-query": "^5.0.0",
    "react": "^18.3.0"
  },
  "devDependencies": {
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@types/react": "^18.3.0",
    "@vitejs/plugin-react": "^4.0.0",
    "@vitest/coverage-v8": "^2.0.0",
    "jsdom": "^25.0.0",
    "typescript": "^5.5.0",
    "vitest": "^3.2.4",
    "vite": "^6.0.0"
  },
  "peerDependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  }
}
```

> **Note on dependencies:** `@hbc/acknowledgment` and `@hbc/field-annotations` are direct dependencies because `HbcHandoffReceiver` composes both packages in its review panel. `@hbc/bic-next-move` provides `IBicOwner` for sender/recipient identity — consistent with SF07's pattern. `@hbc/complexity` gates `HbcHandoffStatusBadge` per D-08.

---

## `tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": ".",
    "outDir": "dist",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "jsx": "react-jsx",
    "strict": true,
    "composite": true,
    "paths": {
      "@hbc/workflow-handoff/testing": ["./testing/index.ts"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "src/__tests__", "src/**/__stories__"]
}
```

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
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/__tests__/**',
        'src/**/index.ts',
        'src/**/__stories__/**',
        'src/types/**',
      ],
      thresholds: {
        lines: 95,
        functions: 95,
        branches: 95,
        statements: 95,
      },
    },
    alias: {
      '@hbc/workflow-handoff/testing': resolve(__dirname, './testing/index.ts'),
      '@hbc/bic-next-move': resolve(__dirname, '../bic-next-move/src/index.ts'),
      '@hbc/complexity': resolve(__dirname, '../complexity/src/index.ts'),
      '@hbc/ui-kit/app-shell': resolve(__dirname, '../ui-kit/src/app-shell.ts'),
      '@hbc/acknowledgment': resolve(__dirname, '../acknowledgment/src/index.ts'),
      '@hbc/field-annotations': resolve(__dirname, '../field-annotations/src/index.ts'),
    },
  },
  resolve: {
    alias: {
      '@hbc/workflow-handoff/testing': resolve(__dirname, './testing/index.ts'),
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

beforeAll(() => {
  vi.mock('@hbc/notification-intelligence', () => ({
    notificationIntelligence: {
      registerEvent: vi.fn(),
    },
  }));

  global.fetch = vi.fn();
});
```

---

## Barrel Export Stubs

### `src/index.ts`

```typescript
export * from './types';
export * from './constants/handoffDefaults';
export * from './api';
export * from './hooks';
export * from './components';
```

### `src/types/index.ts`

```typescript
export * from './IWorkflowHandoff';
```

### `src/constants/index.ts`

```typescript
export * from './handoffDefaults';
```

### `src/api/index.ts`

```typescript
export * from './HandoffApi';
```

### `src/hooks/index.ts`

```typescript
export * from './usePrepareHandoff';
export * from './useHandoffInbox';
export * from './useHandoffStatus';
```

### `src/components/index.ts`

```typescript
export * from './HbcHandoffComposer';
export * from './HbcHandoffReceiver';
export * from './HbcHandoffStatusBadge';
```

### `testing/index.ts`

```typescript
export * from './createMockHandoffPackage';
export * from './createMockHandoffConfig';
export * from './createMockHandoffDocument';
export * from './createMockContextNote';
export * from './mockHandoffStates';
```

---

## Verification Commands

```bash
# 1. Confirm package is in workspace graph
pnpm ls --filter @hbc/workflow-handoff

# 2. Type-check (stub build — should pass)
pnpm --filter @hbc/workflow-handoff check-types

# 3. Build
pnpm --filter @hbc/workflow-handoff build

# 4. Run tests (stub — 0 tests, passWithNoTests = true)
pnpm --filter @hbc/workflow-handoff test

# 5. Confirm testing sub-path resolves
node -e "import('@hbc/workflow-handoff/testing').then(m => console.log('testing sub-path OK:', Object.keys(m)))"
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF08-T01 not yet started.
Next: SF08-T02 (TypeScript Contracts)
-->
