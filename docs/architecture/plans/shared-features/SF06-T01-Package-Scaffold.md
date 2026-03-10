# SF06-T01 — Package Scaffold

**Package:** `packages/versioned-record/`
**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Depends On:** None — this is the first task
**Blocks:** T02 (contracts), T03 (diff engine), T04 (hooks), T05 (components), T06 (components), T07 (API + storage), T08 (testing sub-path)

---

## Objective

Establish the complete directory skeleton, configuration files, and barrel stubs for `@hbc/versioned-record`. All source files created here are stubs that later tasks will populate. The `testing/` sub-path entry point is wired at this stage so T08 never needs to touch `package.json`.

---

## Full Directory Tree

```
packages/versioned-record/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts                            # Public barrel — all production exports
│   ├── types/
│   │   ├── IVersionedRecord.ts             # Stub — populated by T02
│   │   └── index.ts
│   ├── engine/
│   │   └── diffEngine.ts                   # Stub — populated by T03
│   ├── api/
│   │   └── VersionApi.ts                   # Stub — populated by T07
│   ├── hooks/
│   │   ├── useVersionHistory.ts            # Stub — populated by T04
│   │   ├── useVersionSnapshot.ts           # Stub — populated by T04
│   │   ├── useVersionDiff.ts               # Stub — populated by T04
│   │   └── index.ts
│   ├── components/
│   │   ├── HbcVersionHistory.tsx           # Stub — populated by T05
│   │   ├── HbcVersionDiff.tsx              # Stub — populated by T06
│   │   ├── HbcVersionBadge.tsx             # Stub — populated by T06
│   │   └── index.ts
│   └── test/
│       └── setup.ts                        # Vitest global setup
└── testing/
    ├── index.ts                            # Testing sub-path barrel
    ├── createMockVersionedRecordConfig.ts  # Stub — populated by T08
    ├── mockVersionedRecordStates.ts        # Stub — populated by T08
    ├── mockUseVersionHistory.ts            # Stub — populated by T08
    └── createVersionedRecordWrapper.tsx    # Stub — populated by T08
```

---

## `package.json`

```json
{
  "name": "@hbc/versioned-record",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./testing": {
      "import": "./testing/index.ts",
      "types": "./testing/index.ts"
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
    "@hbc/complexity": "workspace:*",
    "@hbc/notification-intelligence": "workspace:*",
    "@hbc/ui-kit": "workspace:*"
  },
  "devDependencies": {
    "@hbc/tsconfig": "workspace:*",
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@types/react": "^18.2.0",
    "@vitest/coverage-v8": "^1.0.0",
    "react": "^18.2.0",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0"
  },
  "peerDependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

---

## `tsconfig.json`

```json
{
  "extends": "@hbc/tsconfig/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  },
  "include": ["src"],
  "exclude": ["dist", "node_modules", "testing"]
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
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      thresholds: {
        // diffEngine requires ≥95% per spec
        lines: 95,
        functions: 95,
        branches: 90,
        statements: 95,
      },
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/test/**', 'src/**/*.stories.{ts,tsx}'],
    },
  },
  resolve: {
    alias: {
      '@hbc/versioned-record': resolve(__dirname, './src/index.ts'),
      '@hbc/versioned-record/testing': resolve(__dirname, './testing/index.ts'),
    },
  },
});
```

---

## `src/test/setup.ts`

```typescript
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Suppress React act() warnings in unit tests
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Mock @hbc/notification-intelligence at global level so diffEngine
// and VersionApi tests do not require a live notification registry.
vi.mock('@hbc/notification-intelligence', () => ({
  NotificationRegistry: {
    register: vi.fn(),
  },
  NotificationApi: {
    send: vi.fn().mockResolvedValue(undefined),
  },
}));
```

---

## Barrel Stubs

### `src/types/index.ts`

```typescript
// Populated by T02
export * from './IVersionedRecord';
```

### `src/hooks/index.ts`

```typescript
// Populated by T04
export { useVersionHistory } from './useVersionHistory';
export { useVersionSnapshot } from './useVersionSnapshot';
export { useVersionDiff } from './useVersionDiff';
```

### `src/components/index.ts`

```typescript
// Populated by T05 and T06
export { HbcVersionHistory } from './HbcVersionHistory';
export { HbcVersionDiff } from './HbcVersionDiff';
export { HbcVersionBadge } from './HbcVersionBadge';
```

### `src/index.ts` — Public production barrel

```typescript
// Types
export type {
  IVersionSnapshot,
  IVersionMetadata,
  IVersionedRecordConfig,
  IVersionDiff,
  VersionTag,
  VersionTrigger,
  IBicOwner,
} from './types';

// API
export { VersionApi } from './api/VersionApi';

// Hooks
export { useVersionHistory } from './hooks/useVersionHistory';
export { useVersionSnapshot } from './hooks/useVersionSnapshot';
export { useVersionDiff } from './hooks/useVersionDiff';

// Components
export { HbcVersionHistory } from './components/HbcVersionHistory';
export { HbcVersionDiff } from './components/HbcVersionDiff';
export { HbcVersionBadge } from './components/HbcVersionBadge';
```

### `testing/index.ts` — Testing sub-path barrel (D-10)

```typescript
// Populated by T08 — do not import production bundle internals here
export { createMockVersionedRecordConfig } from './createMockVersionedRecordConfig';
export {
  versionedRecordStates,
  emptyHistoryState,
  singleDraftState,
  multiVersionState,
  approvedVersionState,
  supersededVersionState,
  rollbackInProgressState,
} from './mockVersionedRecordStates';
export { mockUseVersionHistory } from './mockUseVersionHistory';
export { createVersionedRecordWrapper } from './createVersionedRecordWrapper';
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF06-T01 completed: 2026-03-10

Adaptations from spec (documented in implementation plan):
1. "extends": "../../tsconfig.base.json" (no @hbc/tsconfig package exists)
2. Removed @hbc/notification-intelligence dep; added src/__mocks__/notification-intelligence.ts mock
3. Aligned devDep versions with step-wizard: vitest ^3.2.4, @vitest/coverage-v8 ^3.2.4, vite ^6.0.0
4. Added missing devDeps: @vitejs/plugin-react, jsdom, vite
5. Added check-types script alongside typecheck
6. Added fileURLToPath ESM __dirname pattern in vitest.config.ts
7. Added .eslintrc.cjs (required for lint to find config)
8. tsconfig paths + vitest aliases for mock resolution

Verification:
- build: zero errors (30/30 monorepo tasks)
- check-types: zero errors (38/38 monorepo tasks)
- lint: zero errors, zero warnings
- test: 0 tests, passWithNoTests — no error

All success criteria satisfied. Package scaffold ready for T02–T08.
-->

---

## Stub File Templates

Each of the following files is created as a minimal stub. Later tasks replace the stub body with full implementations.

### `src/types/IVersionedRecord.ts` (stub)

```typescript
// Full implementation in T02
export type VersionTag = 'draft' | 'submitted' | 'approved' | 'rejected' | 'archived' | 'handoff' | 'superseded';
export type VersionTrigger = 'on-submit' | 'on-approve' | 'on-reject' | 'on-handoff' | 'on-explicit-save' | 'on-stage-change';
export interface IBicOwner { userId: string; displayName: string; role: string; }
export interface IVersionSnapshot<T> { snapshotId: string; version: number; createdAt: string; createdBy: IBicOwner; changeSummary: string; tag: VersionTag; snapshot: T; }
export interface IVersionMetadata { snapshotId: string; version: number; createdAt: string; createdBy: IBicOwner; changeSummary: string; tag: VersionTag; storageRef?: string; }
export interface IVersionedRecordConfig<T> { recordType: string; triggers: VersionTrigger[]; generateChangeSummary?: (previous: T | null, current: T) => string; excludeFields?: Array<keyof T>; maxVersions?: number; getStakeholders: (snapshot: IVersionSnapshot<T>) => string[]; onVersionCreated?: (snapshot: IVersionSnapshot<T>) => void; }
export interface IVersionDiff { fieldName: string; label: string; previousValue: string; currentValue: string; changeType: 'added' | 'removed' | 'modified'; }
```

### `src/engine/diffEngine.ts` (stub)

```typescript
// Full implementation in T03
import type { IVersionDiff } from '../types';
export function computeDiff<T extends Record<string, unknown>>(
  _previous: T,
  _current: T,
  _excludeFields?: string[]
): IVersionDiff[] {
  throw new Error('diffEngine not yet implemented — see T03');
}
```

### `src/api/VersionApi.ts` (stub)

```typescript
// Full implementation in T07
export const VersionApi = {
  createSnapshot: async (..._args: unknown[]) => { throw new Error('Not implemented — see T07'); },
  getMetadataList: async (..._args: unknown[]) => { throw new Error('Not implemented — see T07'); },
  getSnapshot: async (..._args: unknown[]) => { throw new Error('Not implemented — see T07'); },
  getSnapshotById: async (..._args: unknown[]) => { throw new Error('Not implemented — see T07'); },
  restoreSnapshot: async (..._args: unknown[]) => { throw new Error('Not implemented — see T07'); },
};
```

### `src/hooks/useVersionHistory.ts` (stub)

```typescript
// Full implementation in T04
export function useVersionHistory() { throw new Error('Not implemented — see T04'); }
```

### `src/hooks/useVersionSnapshot.ts` (stub)

```typescript
// Full implementation in T04
export function useVersionSnapshot() { throw new Error('Not implemented — see T04'); }
```

### `src/hooks/useVersionDiff.ts` (stub)

```typescript
// Full implementation in T04
export function useVersionDiff() { throw new Error('Not implemented — see T04'); }
```

### `src/components/HbcVersionHistory.tsx` (stub)

```typescript
// Full implementation in T05
export function HbcVersionHistory() { return null; }
```

### `src/components/HbcVersionDiff.tsx` (stub)

```typescript
// Full implementation in T06
export function HbcVersionDiff() { return null; }
```

### `src/components/HbcVersionBadge.tsx` (stub)

```typescript
// Full implementation in T06
export function HbcVersionBadge() { return null; }
```

---

## Verification Commands

```bash
# Confirm package is recognized by pnpm workspace
pnpm list --filter @hbc/versioned-record

# TypeScript compiles from stub with zero errors
cd packages/versioned-record && pnpm typecheck

# Vitest discovers test suite (no tests yet — should report 0 tests, not an error)
cd packages/versioned-record && pnpm test

# Turbo build picks up the new package
pnpm turbo run build --filter @hbc/versioned-record

# Confirm testing sub-path resolves
node -e "import('@hbc/versioned-record/testing').then(() => console.log('testing sub-path OK'))"
```
