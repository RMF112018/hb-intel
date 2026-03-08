# SF01-T01: Package Scaffold

**Package:** `@hbc/sharepoint-docs`
**Wave:** 1 — Foundation
**Estimated effort:** 0.5 sprint-weeks
**Prerequisite tasks:** None — this is the first task
**Unlocks:** SF01-T02, SF01-T03 (can begin immediately after this task)
**Governed by:** CLAUDE.md v1.2 §3 (Architecture Enforcement), §6 (Build System)

---

## 1. Objective

Create the complete directory scaffold, configuration files, and empty barrel exports for the `@hbc/sharepoint-docs` package. After this task, `pnpm turbo run build` passes with zero errors for the new package, and all downstream tasks can begin adding source files without any structural decisions remaining.

---

## 2. Directory Structure to Create

Run the following from the monorepo root. Create every file listed — empty stubs are acceptable at this stage; contents are filled in by subsequent task files.

```
packages/sharepoint-docs/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts                          # Public barrel export (stub)
│   ├── types/
│   │   ├── IDocumentContext.ts           # stub
│   │   ├── IUploadedDocument.ts          # stub
│   │   ├── IDocumentMigration.ts         # stub
│   │   ├── IOfflineQueueEntry.ts         # stub
│   │   ├── IConflict.ts                  # stub
│   │   ├── ITombstone.ts                 # stub
│   │   ├── IMigrationCheckpoint.ts       # stub
│   │   └── index.ts                      # stub
│   ├── constants/
│   │   ├── fileSizeLimits.ts             # stub
│   │   ├── blockedExtensions.ts          # stub
│   │   ├── migrationSchedule.ts          # stub
│   │   └── registryColumns.ts            # stub
│   ├── api/
│   │   ├── SharePointDocsApi.ts          # stub
│   │   ├── FolderManager.ts              # stub
│   │   ├── PermissionManager.ts          # stub
│   │   ├── RegistryClient.ts             # stub
│   │   ├── MigrationLogClient.ts         # stub
│   │   ├── TombstoneWriter.ts            # stub
│   │   └── ConflictDetector.ts           # stub
│   ├── services/
│   │   ├── UploadService.ts              # stub
│   │   ├── OfflineQueueManager.ts        # stub
│   │   ├── MigrationService.ts           # stub
│   │   ├── MigrationScheduler.ts         # stub
│   │   └── ConflictResolver.ts           # stub
│   ├── hooks/
│   │   ├── useDocumentContext.ts         # stub
│   │   ├── useDocumentUpload.ts          # stub
│   │   ├── useDocumentList.ts            # stub
│   │   ├── useOfflineQueue.ts            # stub
│   │   └── useMigrationStatus.ts         # stub
│   └── components/
│       ├── HbcDocumentAttachment/
│       │   ├── HbcDocumentAttachment.tsx  # stub
│       │   ├── DropZone.tsx               # stub
│       │   ├── UploadProgressRow.tsx      # stub
│       │   ├── LargeFileConfirmDialog.tsx # stub
│       │   └── index.ts                   # stub
│       ├── HbcDocumentList/
│       │   ├── HbcDocumentList.tsx        # stub
│       │   ├── TombstoneRow.tsx           # stub
│       │   ├── MigrationStatusBadge.tsx   # stub
│       │   └── index.ts                   # stub
│       ├── HbcUploadQueue/
│       │   ├── HbcUploadQueue.tsx         # stub
│       │   ├── QueueEntry.tsx             # stub
│       │   └── index.ts                   # stub
│       ├── HbcConflictResolutionPanel/
│       │   ├── HbcConflictResolutionPanel.tsx  # stub
│       │   ├── ConflictRow.tsx                 # stub
│       │   └── index.ts                        # stub
│       ├── HbcMigrationSummaryBanner.tsx  # stub
│       └── index.ts                       # stub
```

---

## 3. `package.json`

```json
{
  "name": "@hbc/sharepoint-docs",
  "version": "0.1.0",
  "description": "SharePoint document lifecycle management — pre-provisioning staging, upload, migration, and offline queue",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsc --project tsconfig.json",
    "dev": "tsc --project tsconfig.json --watch",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src --ext .ts,.tsx --max-warnings 0",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@hbc/auth": "workspace:*",
    "@hbc/models": "workspace:*",
    "@hbc/data-access": "workspace:*",
    "@hbc/ui-kit": "workspace:*",
    "@microsoft/microsoft-graph-client": "^3.0.7",
    "@tanstack/react-query": "^5.0.0",
    "react": "^18.3.0"
  },
  "devDependencies": {
    "@hbc/tsconfig": "workspace:*",
    "@testing-library/react": "^15.0.0",
    "@testing-library/user-event": "^14.5.0",
    "@types/react": "^18.3.0",
    "@vitejs/plugin-react": "^4.0.0",
    "@vitest/coverage-v8": "^1.0.0",
    "typescript": "^5.4.0",
    "vitest": "^1.0.0",
    "msw": "^2.0.0"
  },
  "peerDependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  }
}
```

---

## 4. `tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "composite": true,
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "paths": {
      "@hbc/auth": ["../auth/src/index.ts"],
      "@hbc/models": ["../models/src/index.ts"],
      "@hbc/data-access": ["../data-access/src/index.ts"],
      "@hbc/ui-kit": ["../ui-kit/src/index.ts"],
      "@hbc/ui-kit/app-shell": ["../ui-kit/src/app-shell/index.ts"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.test.tsx"]
}
```

---

## 5. `vitest.config.ts`

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
      exclude: ['src/**/*.test.{ts,tsx}', 'src/index.ts', 'src/types/**', 'src/constants/**'],
      // Enforce 95% coverage on critical services per Definition of Done
      thresholds: {
        branches: 95,
        functions: 95,
        lines: 95,
        statements: 95,
      },
    },
  },
  resolve: {
    alias: {
      '@hbc/auth': resolve(__dirname, '../auth/src/index.ts'),
      '@hbc/models': resolve(__dirname, '../models/src/index.ts'),
      '@hbc/data-access': resolve(__dirname, '../data-access/src/index.ts'),
      '@hbc/ui-kit': resolve(__dirname, '../ui-kit/src/index.ts'),
      '@hbc/ui-kit/app-shell': resolve(__dirname, '../ui-kit/src/app-shell/index.ts'),
    },
  },
});
```

---

## 6. Turborepo Pipeline Registration

Add the following to `turbo.json` pipeline (do not overwrite existing entries — merge):

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

Ensure `packages/sharepoint-docs` is included in `pnpm-workspace.yaml`:

```yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

The wildcard glob covers it automatically if the directory exists under `packages/`.

---

## 7. Initial Barrel Export (`src/index.ts`)

The stub barrel export. Each task file will append to this as exports are implemented. Start with empty named groups and fill them in progressively.

```typescript
// @hbc/sharepoint-docs — public API
// Generated stubs — fill in as task files are implemented

// Types
export * from './types/index.js';

// Constants
export * from './constants/fileSizeLimits.js';
export * from './constants/blockedExtensions.js';
export * from './constants/migrationSchedule.js';

// API layer
export { FolderManager } from './api/FolderManager.js';
export { SharePointDocsApi } from './api/SharePointDocsApi.js';
export { RegistryClient } from './api/RegistryClient.js';
export { MigrationLogClient } from './api/MigrationLogClient.js';
export { TombstoneWriter } from './api/TombstoneWriter.js';
export { ConflictDetector } from './api/ConflictDetector.js';
export { PermissionManager } from './api/PermissionManager.js';

// Services
export { UploadService } from './services/UploadService.js';
export { OfflineQueueManager } from './services/OfflineQueueManager.js';
export { MigrationService } from './services/MigrationService.js';
export { MigrationScheduler } from './services/MigrationScheduler.js';
export { ConflictResolver } from './services/ConflictResolver.js';

// Hooks
export { useDocumentContext } from './hooks/useDocumentContext.js';
export { useDocumentUpload } from './hooks/useDocumentUpload.js';
export { useDocumentList } from './hooks/useDocumentList.js';
export { useOfflineQueue } from './hooks/useOfflineQueue.js';
export { useMigrationStatus } from './hooks/useMigrationStatus.js';

// Components
export { HbcDocumentAttachment } from './components/HbcDocumentAttachment/index.js';
export { HbcDocumentList } from './components/HbcDocumentList/index.js';
export { HbcUploadQueue } from './components/HbcUploadQueue/index.js';
export { HbcConflictResolutionPanel } from './components/HbcConflictResolutionPanel/index.js';
export { HbcMigrationSummaryBanner } from './components/HbcMigrationSummaryBanner.js';
```

---

## 8. Stub File Template

Every stub file created in step 2 should use this minimal pattern to keep the build green:

```typescript
// TODO: Implement in [task file reference]
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export {};
```

For component stubs:

```typescript
// TODO: Implement in SF01-T06-React-Hooks-and-Components.md
import React from 'react';
export const ComponentName: React.FC = () => null;
```

---

## 9. Verification Commands

Run these after completing the scaffold to confirm the build is green before moving to T02:

```bash
# From monorepo root
pnpm install

# Type-check the new package in isolation
pnpm --filter @hbc/sharepoint-docs typecheck

# Build the package
pnpm --filter @hbc/sharepoint-docs build

# Run the (empty) test suite — should report 0 tests, 0 failures
pnpm --filter @hbc/sharepoint-docs test

# Full monorepo build — confirm no regressions
pnpm turbo run build
```

All four commands must exit with code 0 before proceeding to SF01-T02.

<!-- IMPLEMENTATION PROGRESS & NOTES
SF01-T01 completed: 2026-03-08
- All 51 stub files created under packages/sharepoint-docs/
- 2 existing files modified: tsconfig.base.json (path mappings), vitest.workspace.ts (workspace entry)
- Discrepancy resolutions applied: removed @hbc/tsconfig devDep, added check-types alias, aligned vitest to ^3.2.4, react as peerDep only, ESM __dirname fix, plugin-react ^4.4.0, vite ^6.0.0
- passWithNoTests added to vitest.config.ts for empty test suite
- Verification results:
  - pnpm --filter @hbc/sharepoint-docs check-types → exit 0
  - pnpm --filter @hbc/sharepoint-docs build → exit 0, dist/ populated
  - pnpm --filter @hbc/sharepoint-docs test → 0 tests, 0 failures, exit 0
  - pnpm turbo run build → 25/25 tasks successful, zero errors
Next: SF01-T02 TypeScript Contracts
-->
