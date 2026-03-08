# SF04-T01 — Package Scaffold: `@hbc/acknowledgment`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Decisions Applied:** D-08 (context types), D-10 (testing sub-path)
**Estimated Effort:** 0.25 sprint-weeks
**Wave:** 1

---

## Objective

Create the complete `packages/acknowledgment/` directory, configuration files, and barrel stubs so that all subsequent tasks have a working, buildable skeleton to fill in.

---

## 3-Line Plan

1. Create `packages/acknowledgment/` with `package.json`, `tsconfig.json`, and `vitest.config.ts`.
2. Create all source directory stubs (`types/`, `config/`, `hooks/`, `components/`, `testing/`) with empty barrel files.
3. Register the package in the Turborepo workspace and verify `pnpm --filter @hbc/acknowledgment build` succeeds on the empty scaffold.

---

## Directory Tree (Complete)

```
packages/acknowledgment/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts                          # Main barrel — exports all public symbols
│   ├── types/
│   │   ├── IAcknowledgment.ts            # All interfaces (T02)
│   │   └── index.ts
│   ├── config/
│   │   └── contextTypes.ts               # ACK_CONTEXT_TYPES registry (T02)
│   ├── hooks/
│   │   ├── useAcknowledgment.ts          # (T03)
│   │   ├── useAcknowledgmentGate.ts      # (T03)
│   │   └── index.ts
│   └── components/
│       ├── HbcAcknowledgmentPanel.tsx    # (T04)
│       ├── HbcAcknowledgmentBadge.tsx    # (T05)
│       ├── HbcAcknowledgmentModal.tsx    # (T05)
│       └── index.ts
└── testing/
    ├── index.ts                          # Testing sub-path barrel (D-10)
    ├── createMockAckConfig.ts
    ├── createMockAckState.ts
    ├── mockAckStates.ts
    ├── mockUseAcknowledgment.ts
    └── createAckWrapper.tsx
```

---

## `package.json`

```json
{
  "name": "@hbc/acknowledgment",
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
  "files": [
    "dist",
    "testing"
  ],
  "scripts": {
    "build": "tsc --project tsconfig.json",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src testing --ext .ts,.tsx",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  },
  "dependencies": {
    "@hbc/ui-kit": "workspace:*",
    "@hbc/session-state": "workspace:*",
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
      '@hbc/acknowledgment/testing': resolve(__dirname, './testing/index.ts'),
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

## Test Setup: `src/test/setup.ts`

```typescript
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock fetch globally — unit tests should not make real API calls
globalThis.fetch = vi.fn();
```

---

## Barrel Stubs

### `src/index.ts`
```typescript
// Types
export * from './types';
// Config
export * from './config/contextTypes';
// Hooks
export * from './hooks';
// Components
export * from './components';
```

### `src/types/index.ts`
```typescript
export * from './IAcknowledgment';
```

### `src/hooks/index.ts`
```typescript
export { useAcknowledgment } from './useAcknowledgment';
export { useAcknowledgmentGate } from './useAcknowledgmentGate';
```

### `src/components/index.ts`
```typescript
export { HbcAcknowledgmentPanel } from './HbcAcknowledgmentPanel';
export { HbcAcknowledgmentBadge } from './HbcAcknowledgmentBadge';
export { HbcAcknowledgmentModal } from './HbcAcknowledgmentModal';
```

### `testing/index.ts` (D-10)
```typescript
export { createMockAckConfig } from './createMockAckConfig';
export { createMockAckState } from './createMockAckState';
export { mockAckStates } from './mockAckStates';
export { mockUseAcknowledgment } from './mockUseAcknowledgment';
export { createAckWrapper } from './createAckWrapper';
```

---

## Turborepo Registration

In `turbo.json`, confirm `@hbc/acknowledgment` is included in the workspace. In `pnpm-workspace.yaml`:

```yaml
packages:
  - 'packages/*'   # already covers packages/acknowledgment/
```

No change needed if glob is already `packages/*`.

---

## Verification Commands

```bash
# Install dependencies
pnpm install

# Typecheck scaffold (should pass with empty stubs)
pnpm --filter @hbc/acknowledgment typecheck

# Build scaffold
pnpm --filter @hbc/acknowledgment build

# Verify testing sub-path resolves
node -e "import('@hbc/acknowledgment/testing').then(m => console.log(Object.keys(m)))"
# Expected: [] (empty stubs — populated in T10)
```
