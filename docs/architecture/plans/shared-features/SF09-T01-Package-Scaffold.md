# SF09-T01 — Package Scaffold: `@hbc/data-seeding`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-09-Shared-Feature-Data-Seeding.md`
**Decisions Applied:** D-01 (dual parse paths), D-09 (complexity rendering), D-10 (testing sub-path)
**Estimated Effort:** 0.25 sprint-weeks
**Depends On:** `@hbc/complexity`, `@hbc/ui-kit/app-shell`

> **Doc Classification:** Canonical Normative Plan — SF09-T01 scaffold task; sub-plan of `SF09-Data-Seeding.md`.

---

## Objective

Create `packages/data-seeding/` with a complete `package.json` (including dual `./` and `./testing` export entry points), `tsconfig.json`, `vitest.config.ts`, and all barrel stub files. SheetJS (`xlsx`) is the only non-HBC production dependency.

---

## 3-Line Plan

1. Create `packages/data-seeding/package.json` with dual entry points, SheetJS dependency, and peer deps on `@hbc/complexity` and `@hbc/ui-kit`.
2. Create `tsconfig.json` (extends `../../tsconfig.base.json`), `vitest.config.ts` with 95% coverage thresholds, and a test setup file.
3. Create all barrel stub files (`src/index.ts`, `src/types/index.ts`, `src/parsers/index.ts`, `src/validation/index.ts`, `src/api/SeedApi.ts`, `src/hooks/index.ts`, `src/components/index.ts`, `testing/index.ts`).

---

## `package.json`

```json
{
  "name": "@hbc/data-seeding",
  "version": "0.0.1",
  "description": "Structured data import and initial state population primitive for HB Intel",
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
  "dependencies": {
    "xlsx": "^0.18.5"
  },
  "peerDependencies": {
    "@hbc/complexity": "workspace:*",
    "@hbc/ui-kit": "workspace:*",
    "@tanstack/react-query": "^5.0.0",
    "react": "^18.0.0"
  },
  "devDependencies": {
    "@hbc/app-types": "workspace:*",
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@types/react": "^18.0.0",
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

**SheetJS note:** `xlsx` v0.18.5 is the last Apache-2.0 licensed version of SheetJS. If the license has changed in the project's context, evaluate `exceljs` as an alternative; see D-01 in the master plan for the parsing strategy rationale. The import boundary must be confined to `src/parsers/XlsxParser.ts` — no other file should import `xlsx` directly.

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
        'src/parsers/index.ts',
        'src/validation/index.ts',
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

// Mock SheetJS to avoid JSDOM binary parsing issues in unit tests.
// Integration and E2E tests use real file fixtures.
vi.mock('xlsx', () => ({
  read: vi.fn(),
  utils: {
    sheet_to_json: vi.fn(),
    decode_range: vi.fn(),
  },
}));

// Mock @hbc/sharepoint-docs to isolate data-seeding unit tests
// from SharePoint dependency
vi.mock('@hbc/sharepoint-docs', () => ({
  DocumentApi: {
    uploadToSystemContext: vi.fn().mockResolvedValue({
      documentId: 'doc-seed-001',
      sharepointUrl: 'https://sp.example.com/system/seed-file.xlsx',
    }),
  },
}));
```

---

## Barrel Stubs

### `src/index.ts`

```typescript
// @hbc/data-seeding — public barrel
// Populated by T02–T07

export * from './types';
export * from './parsers';
export * from './validation';
export * from './hooks';
export * from './components';
export { SeedApi } from './api/SeedApi';
```

### `src/types/index.ts`

```typescript
// Populated by T02
export * from './IDataSeeding';
```

### `src/parsers/index.ts`

```typescript
// Populated by T03
export { XlsxParser } from './XlsxParser';
export { CsvParser } from './CsvParser';
export { ProcoreExportParser } from './ProcoreExportParser';
```

### `src/validation/index.ts`

```typescript
// Populated by T03
export { validateRow } from './validateRow';
export { autoMapHeaders } from './autoMapHeaders';
```

### `src/api/SeedApi.ts`

```typescript
// Populated by T04
export const SeedApi = {} as Record<string, unknown>; // stub
```

### `src/hooks/index.ts`

```typescript
// Populated by T05
export { useSeedImport } from './useSeedImport';
export { useSeedHistory } from './useSeedHistory';
```

### `src/components/index.ts`

```typescript
// Populated by T06–T07
export { HbcSeedUploader } from './HbcSeedUploader';
export { HbcSeedMapper } from './HbcSeedMapper';
export { HbcSeedPreview } from './HbcSeedPreview';
export { HbcSeedProgress } from './HbcSeedProgress';
```

### `testing/index.ts`

```typescript
// @hbc/data-seeding/testing — test fixture sub-path (D-10)
// Import from this sub-path only in test files.
export { createMockSeedConfig } from './createMockSeedConfig';
export { createMockSeedResult } from './createMockSeedResult';
export { createMockValidationError } from './createMockValidationError';
export { createMockSeedRow } from './createMockSeedRow';
export { mockSeedStatuses } from './mockSeedStatuses';
export type { MockSeedStatuses } from './mockSeedStatuses';
```

---

## Verification Commands

```bash
# Confirm package resolves from workspace root
pnpm --filter @hbc/data-seeding build

# Confirm both entry points present in dist/
ls packages/data-seeding/dist/index.js
ls packages/data-seeding/dist/testing/index.js

# Type-check
pnpm --filter @hbc/data-seeding check-types

# SheetJS import confined to XlsxParser only
grep -r "from 'xlsx'" packages/data-seeding/src/ | grep -v XlsxParser
# Expected: zero matches
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF09-T01 completed: 2026-03-10
- Created packages/data-seeding/ with full directory structure
- package.json with dual entry points (./dist/src/index.js, ./dist/testing/index.js), private: true
- tsconfig.json + tsconfig.build.json matching workflow-handoff pattern
- vitest.config.ts with passWithNoTests, resolve aliases, 95% coverage thresholds
- All 8 barrel stubs and 17 module stubs created
- tsconfig.base.json updated with @hbc/data-seeding path aliases
- Deviation: removed @hbc/app-types devDependency (package does not exist in workspace)
- Build: zero errors | check-types: zero errors | test: passes (no test files)
Next: SF09-T02-TypeScript-Contracts.md
-->
