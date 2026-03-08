# SF05-T01 — Package Scaffold: `@hbc/step-wizard`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Decisions Applied:** D-10 (testing sub-path)
**Estimated Effort:** 0.25 sprint-weeks
**Wave:** 1

---

## Objective

Create the complete `packages/step-wizard/` directory, configuration files, and barrel stubs so all subsequent tasks have a working, buildable skeleton.

---

## 3-Line Plan

1. Create `packages/step-wizard/` with `package.json`, `tsconfig.json`, and `vitest.config.ts`.
2. Create all source directory stubs (`types/`, `state/`, `hooks/`, `components/`, `testing/`) with empty barrels.
3. Register in Turborepo workspace and verify `pnpm --filter @hbc/step-wizard build` passes on the empty scaffold.

---

## Directory Tree (Complete)

```
packages/step-wizard/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts
│   ├── types/
│   │   ├── IStepWizard.ts
│   │   └── index.ts
│   ├── state/
│   │   ├── stepStateMachine.ts
│   │   └── draftPayload.ts
│   ├── hooks/
│   │   ├── useStepWizard.ts
│   │   ├── useStepProgress.ts
│   │   └── index.ts
│   └── components/
│       ├── HbcStepWizard.tsx
│       ├── HbcStepProgress.tsx
│       ├── HbcStepSidebar.tsx
│       └── index.ts
└── testing/
    ├── index.ts
    ├── createMockWizardConfig.ts
    ├── mockWizardStates.ts
    ├── mockUseStepWizard.ts
    └── createWizardWrapper.tsx
```

---

## `package.json`

```json
{
  "name": "@hbc/step-wizard",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
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
  "files": ["dist", "testing"],
  "scripts": {
    "build": "tsc --project tsconfig.json",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src testing --ext .ts,.tsx",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  },
  "dependencies": {
    "@hbc/bic-next-move": "workspace:*",
    "@hbc/complexity": "workspace:*",
    "@hbc/notification-intelligence": "workspace:*",
    "@hbc/session-state": "workspace:*",
    "@hbc/ui-kit": "workspace:*",
    "@tanstack/react-query": "^5.0.0",
    "react": "^18.3.0"
  },
  "devDependencies": {
    "@hbc/tsconfig": "workspace:*",
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@types/react": "^18.3.0",
    "@vitejs/plugin-react": "^4.0.0",
    "@vitest/coverage-v8": "^1.0.0",
    "typescript": "^5.4.0",
    "vitest": "^1.0.0"
  },
  "peerDependencies": {
    "react": "^18.3.0"
  }
}
```

---

## `tsconfig.json`

```json
{
  "extends": "@hbc/tsconfig/react-library.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "testing", "**/*.test.ts", "**/*.test.tsx"]
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
  resolve: {
    alias: {
      '@hbc/step-wizard/testing': resolve(__dirname, './testing/index.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 95,
        functions: 95,
        branches: 95,
        statements: 95,
      },
      exclude: [
        'src/index.ts',
        'src/types/index.ts',
        'src/hooks/index.ts',
        'src/components/index.ts',
        'testing/**',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.stories.tsx',
      ],
    },
  },
});
```

---

## `src/test/setup.ts`

```typescript
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.useRealTimers();
});

globalThis.fetch = vi.fn();
```

---

## Barrel Stubs

### `src/index.ts`
```typescript
export * from './types';
export * from './state/stepStateMachine';
export * from './hooks';
export * from './components';
```

### `src/types/index.ts`
```typescript
export * from './IStepWizard';
```

### `src/hooks/index.ts`
```typescript
export { useStepWizard } from './useStepWizard';
export { useStepProgress } from './useStepProgress';
```

### `src/components/index.ts`
```typescript
export { HbcStepWizard } from './HbcStepWizard';
export { HbcStepProgress } from './HbcStepProgress';
export { HbcStepSidebar } from './HbcStepSidebar';
```

### `testing/index.ts`
```typescript
export { createMockWizardConfig } from './createMockWizardConfig';
export { mockWizardStates } from './mockWizardStates';
export { mockUseStepWizard } from './mockUseStepWizard';
export { createWizardWrapper } from './createWizardWrapper';
```

---

## Verification Commands

```bash
pnpm install
pnpm --filter @hbc/step-wizard typecheck
pnpm --filter @hbc/step-wizard build
node -e "import('@hbc/step-wizard/testing').then(m => console.log(Object.keys(m)))"
# Expected: ['createMockWizardConfig', 'mockWizardStates', 'mockUseStepWizard', 'createWizardWrapper']
```
