# SF07-T01 — Package Scaffold: `@hbc/field-annotations`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-07-Shared-Feature-Field-Annotations.md`
**Decisions Applied:** D-09 (form integration pattern), D-10 (testing sub-path)
**Estimated Effort:** 0.25 sprint-weeks
**Depends On:** `@hbc/bic-next-move` (for `IBicOwner` type), `@hbc/ui-kit` (for app-shell popover), `@hbc/complexity` (for `useComplexity`)

> **Doc Classification:** Canonical Normative Plan — SF07-T01 package scaffold task; sub-plan of `SF07-Field-Annotations.md`.

---

## Objective

Create the full directory scaffold, configuration files, and barrel export stubs for `packages/field-annotations/`. This task produces no runtime logic — only the structure that all subsequent tasks build within.

---

## 3-Line Plan

1. Create directory tree with all folders and stub `index.ts` / `.tsx` files.
2. Write `package.json`, `tsconfig.json`, and `vitest.config.ts`.
3. Register package in Turborepo pipeline and verify `pnpm turbo run build` resolves the package.

---

## Directory Tree

Create all folders and stub files as listed. Every `index.ts` is a stub (`export {};`) until populated by later tasks.

```
packages/field-annotations/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts                                   # Main barrel — stub → T02–T06
│   ├── types/
│   │   ├── IFieldAnnotation.ts                    # stub → T02
│   │   └── index.ts                               # stub → T02
│   ├── constants/
│   │   ├── annotationDefaults.ts                  # stub → T02
│   │   └── index.ts                               # stub → T02
│   ├── api/
│   │   ├── AnnotationApi.ts                       # stub → T03
│   │   └── index.ts                               # stub → T03
│   ├── hooks/
│   │   ├── useFieldAnnotations.ts                 # stub → T04
│   │   ├── useFieldAnnotation.ts                  # stub → T04
│   │   ├── useAnnotationActions.ts                # stub → T04
│   │   └── index.ts                               # stub → T04
│   └── components/
│       ├── HbcAnnotationMarker.tsx                # stub → T05
│       ├── HbcAnnotationThread.tsx                # stub → T06
│       ├── HbcAnnotationSummary.tsx               # stub → T06
│       └── index.ts                               # stub → T05–T06
├── testing/
│   ├── index.ts                                   # stub → T08
│   ├── createMockAnnotation.ts                    # stub → T08
│   ├── createMockAnnotationReply.ts               # stub → T08
│   ├── createMockAnnotationConfig.ts              # stub → T08
│   └── mockAnnotationStates.ts                    # stub → T08
└── src/__tests__/
    ├── setup.ts
    ├── AnnotationApi.test.ts                      # stub → T08
    ├── useFieldAnnotations.test.ts                # stub → T08
    ├── useFieldAnnotation.test.ts                 # stub → T08
    ├── useAnnotationActions.test.ts               # stub → T08
    ├── HbcAnnotationMarker.test.tsx               # stub → T08
    ├── HbcAnnotationThread.test.tsx               # stub → T08
    └── HbcAnnotationSummary.test.tsx              # stub → T08
```

---

## `package.json`

```json
{
  "name": "@hbc/field-annotations",
  "version": "0.1.0",
  "private": true,
  "description": "Platform-wide field-level annotation and clarification request primitive",
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

> **Note on `testing/` sub-path (D-10):** The `exports` field exposes `@hbc/field-annotations/testing` as a separate entry point. The `testing/` directory is committed to source control but is intentionally excluded from production bundle analysis. Consumers import from this path only in test files and Storybook — never in application code.

> **Note on dependencies:** `@hbc/bic-next-move` is a dependency because `IBicOwner` is reused as the annotation author type, maintaining identity consistency across the platform. `@hbc/complexity` is a dependency for `useComplexity` to control marker/thread rendering per tier (D-05). `@hbc/ui-kit` provides the `app-shell` Popover primitive for SPFx compliance (D-06).

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
      "@hbc/field-annotations/testing": ["./testing/index.ts"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "src/__tests__", "src/**/__stories__"]
}
```

> **Note:** The `testing/` directory uses the workspace root tsconfig for type resolution. `rootDir` is set to `"."` (not `"src"`) to include the `testing/` folder in type resolution while excluding it from the production `outDir`.

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
      '@hbc/field-annotations/testing': resolve(__dirname, './testing/index.ts'),
      '@hbc/bic-next-move': resolve(__dirname, '../bic-next-move/src/index.ts'),
      '@hbc/complexity': resolve(__dirname, '../complexity/src/index.ts'),
      '@hbc/ui-kit/app-shell': resolve(__dirname, '../ui-kit/src/app-shell.ts'),
    },
  },
  resolve: {
    alias: {
      '@hbc/field-annotations/testing': resolve(__dirname, './testing/index.ts'),
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

// Mock @hbc/notification-intelligence so annotation tests don't need the full package
beforeAll(() => {
  vi.mock('@hbc/notification-intelligence', () => ({
    notificationIntelligence: {
      registerEvent: vi.fn(),
    },
  }));
});

// Mock fetch globally for AnnotationApi tests
beforeAll(() => {
  global.fetch = vi.fn();
});
```

---

## Barrel Export Stubs

### `src/index.ts` (stub — populated by T02–T06)

```typescript
// Types
export * from './types';

// Constants
export * from './constants/annotationDefaults';

// API
export * from './api';

// Hooks
export * from './hooks';

// Components
export * from './components';
```

### `src/types/index.ts`

```typescript
export * from './IFieldAnnotation';
```

### `src/constants/index.ts`

```typescript
export * from './annotationDefaults';
```

### `src/api/index.ts`

```typescript
export * from './AnnotationApi';
```

### `src/hooks/index.ts`

```typescript
export * from './useFieldAnnotations';
export * from './useFieldAnnotation';
export * from './useAnnotationActions';
```

### `src/components/index.ts`

```typescript
export * from './HbcAnnotationMarker';
export * from './HbcAnnotationThread';
export * from './HbcAnnotationSummary';
```

### `testing/index.ts` (stub — populated by T08)

```typescript
export * from './createMockAnnotation';
export * from './createMockAnnotationReply';
export * from './createMockAnnotationConfig';
export * from './mockAnnotationStates';
```

---

## Turborepo Registration

Verify `packages/field-annotations` is discovered by the workspace (should be covered by `packages/**` glob in `pnpm-workspace.yaml`). No `turbo.json` changes required if the workspace glob is already in place.

Add to `packages/eslint-plugin-hbc/` boundary rules if field-annotations needs to be marked as a Tier 1 package that domain packages may import but may not be imported by other Tier 1 packages (except through the established dependency chain).

---

## Verification Commands

```bash
# 1. Confirm package is in workspace graph
pnpm ls --filter @hbc/field-annotations

# 2. Type-check with zero errors (stubs only — should pass)
pnpm --filter @hbc/field-annotations check-types

# 3. Build succeeds (stub build)
pnpm --filter @hbc/field-annotations build

# 4. Run tests (stub — 0 tests, passWithNoTests = true)
pnpm --filter @hbc/field-annotations test

# 5. Confirm testing sub-path resolves
node -e "import('@hbc/field-annotations/testing').then(m => console.log('testing sub-path OK:', Object.keys(m)))"
```

Expected: all commands exit 0. Test run reports "No test files found" or similar (not an error with `passWithNoTests: true`).

<!-- IMPLEMENTATION PROGRESS & NOTES
SF07-T01 not yet started.
Next: SF07-T02 (TypeScript Contracts)
-->
