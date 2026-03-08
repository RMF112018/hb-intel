# SF03-T01 — Package Scaffold: `@hbc/complexity`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Decisions Applied:** D-01 (storage strategy), D-10 (testing sub-path)
**Estimated Effort:** 0.25 sprint-weeks

---

## Objective

Create the full directory scaffold, configuration files, and barrel export stubs for `packages/complexity/`. No runtime logic — only the structure all subsequent tasks build within.

---

## 3-Line Plan

1. Create directory tree with all folders and stub `index.ts` files.
2. Write `package.json`, `tsconfig.json`, and `vitest.config.ts`.
3. Register in Turborepo and verify `pnpm turbo run build` resolves the package.

---

## Directory Tree

```
packages/complexity/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts
│   ├── types/
│   │   ├── IComplexity.ts               # stub → T02
│   │   ├── IComplexityPreference.ts     # stub → T02
│   │   └── index.ts
│   ├── config/
│   │   └── roleComplexityMap.ts         # stub → T06
│   ├── context/
│   │   ├── ComplexityContext.ts         # stub → T03
│   │   └── ComplexityProvider.tsx       # stub → T03
│   ├── storage/
│   │   ├── getStorage.ts                # stub → T06
│   │   ├── complexityStorage.ts         # stub → T06
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useComplexity.ts             # stub → T04
│   │   ├── useComplexityGate.ts         # stub → T04
│   │   └── index.ts
│   └── components/
│       ├── HbcComplexityGate.tsx        # stub → T05
│       ├── HbcComplexityDial.tsx        # stub → T05
│       └── index.ts
├── testing/
│   ├── index.ts                         # stub → T08
│   ├── ComplexityTestProvider.tsx       # stub → T08
│   ├── createComplexityWrapper.tsx      # stub → T08
│   ├── mockComplexityContext.ts         # stub → T08
│   └── allTiers.ts                      # stub → T08
└── src/__tests__/
    ├── setup.ts
    ├── useComplexity.test.ts            # stub → T08
    ├── useComplexityGate.test.ts        # stub → T08
    ├── ComplexityProvider.test.tsx      # stub → T08
    ├── HbcComplexityGate.test.tsx       # stub → T08
    └── HbcComplexityDial.test.tsx       # stub → T08
```

---

## `package.json`

```json
{
  "name": "@hbc/complexity",
  "version": "0.1.0",
  "private": true,
  "description": "Three-tier Complexity Dial — platform-wide UI density context",
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
  "files": ["dist", "testing"],
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
      "@hbc/complexity/testing": ["./testing/index.ts"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "src/__tests__"]
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
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/__tests__/**',
        'src/**/index.ts',
        'src/config/roleComplexityMap.ts', // config data, not logic
      ],
      thresholds: {
        lines: 95,
        functions: 95,
        branches: 95,
        statements: 95,
      },
    },
    alias: {
      '@hbc/complexity/testing': resolve(__dirname, './testing/index.ts'),
    },
  },
  resolve: {
    alias: {
      '@hbc/complexity/testing': resolve(__dirname, './testing/index.ts'),
    },
  },
});
```

---

## `src/__tests__/setup.ts`

```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
});

// Mock fetch for API calls — prevent real network in tests
beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ tier: 'standard', showCoaching: false }),
  }));
});
```

---

## Barrel Stubs

### `src/index.ts`

```typescript
// Types
export * from './types';

// Context & Provider
export { ComplexityContext } from './context/ComplexityContext';
export { ComplexityProvider } from './context/ComplexityProvider';

// Hooks
export * from './hooks';

// Components
export * from './components';
```

### `src/types/index.ts`

```typescript
export * from './IComplexity';
export * from './IComplexityPreference';
```

### `src/storage/index.ts`

```typescript
export * from './getStorage';
export * from './complexityStorage';
```

### `src/hooks/index.ts`

```typescript
export * from './useComplexity';
export * from './useComplexityGate';
```

### `src/components/index.ts`

```typescript
export { HbcComplexityGate } from './HbcComplexityGate';
export type { HbcComplexityGateProps } from './HbcComplexityGate';
export { HbcComplexityDial } from './HbcComplexityDial';
export type { HbcComplexityDialProps } from './HbcComplexityDial';
```

### `testing/index.ts`

```typescript
export { ComplexityTestProvider } from './ComplexityTestProvider';
export { createComplexityWrapper } from './createComplexityWrapper';
export { mockComplexityContext } from './mockComplexityContext';
export { allTiers } from './allTiers';
```

---

## Verification Commands

```bash
# 1. Confirm package in workspace
pnpm ls --filter @hbc/complexity

# 2. Typecheck stubs (zero errors expected)
pnpm --filter @hbc/complexity typecheck

# 3. Build succeeds (stub build)
pnpm --filter @hbc/complexity build

# 4. Testing sub-path resolves
node -e "import('@hbc/complexity/testing').then(m => console.log(Object.keys(m)))"
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF03-T01 completed: 2026-03-08

Spec adaptations applied (lessons from SF02-T01 bic-next-move scaffold):
1. @hbc/tsconfig doesn't exist — extends ../../tsconfig.base.json directly
2. rootDir: "." instead of "src" — prevents TS6059 when testing/ imports from ../src/
3. Vitest ^3.2.4 / @vitest/coverage-v8 ^3.2.4 — matches workspace versions
4. react only in peerDependencies (not duplicated in dependencies)
5. passWithNoTests: true in vitest config — all test files are stubs
6. composite: true in tsconfig — enables project references
7. Barrel files use `export *` instead of named re-exports — compatible with `export {}` stubs
8. Added check-types script (turbo.json references it)
9. @testing-library/react ^15.0.0 / vite ^6.0.0 / @vitejs/plugin-react ^4.4.0 — workspace-aligned

Verification results:
- pnpm ls --filter @hbc/complexity — package visible ✅
- pnpm --filter @hbc/complexity typecheck — zero errors ✅
- pnpm --filter @hbc/complexity build — zero errors, dist/ created ✅
- pnpm --filter @hbc/complexity test — 5 test files, 0 tests, all passed ✅

Next: SF03-T02 (TypeScript Contracts)
-->
