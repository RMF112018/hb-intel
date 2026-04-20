# Phase 5 Development Plan – Authentication & Shell Foundation Task 5C.1: Vitest Workspace Configuration Fix

**Version:** 2.0 (Vitest root-cause fix, test scripts, fallback)
**Purpose:** This document defines the complete implementation steps to fix the Vitest workspace configuration root cause, add test scripts to package.json, integrate testing into turbo.json, and provide a versioned fallback script for continuity.
**Audience:** Implementation agent(s), backend developers, QA engineers
**Implementation Objective:** Deliver a fully functional Vitest configuration across auth and shell packages with explicit absolute paths, executable test scripts, and a fallback contingency mechanism to ensure 100% test reliability.

---

## 5.C.1 Vitest Workspace Configuration Root-Cause Fix

1. **Update `vitest.workspace.ts` with explicit absolute paths** (D-PH5C-05)
   - Open `vitest.workspace.ts` at repository root
   - Replace all relative paths with explicit absolute paths using `fileURLToPath` and `path` module
   - Configure workspace array with two entries: `@hbc/auth` and `@hbc/shell` packages
   - Add explicit test root directory for each package (`src`, not `dist`)
   - Set environment to `node` for backend packages, `happy-dom` for shell (if needed)
   - Ensure globals flag is set to `true` for expect/describe/it availability
   - Add coverage configuration pointing to `src/**` for both packages
   - Include exclude patterns for `.spec.ts` files that should not run in workspace mode

2. **Add test scripts to `packages/auth/package.json` and `packages/shell/package.json`** (D-PH5C-05)
   - Add `"test": "vitest run"` script for CI/CD
   - Add `"test:watch": "vitest watch"` script for local development
   - Add `"test:coverage": "vitest run --coverage"` for coverage reports
   - Ensure scripts reference the root `vitest.workspace.ts` by default

3. **Integrate test task into `turbo.json`** (D-PH5C-05)
   - Add new task entry: `"test": { "inputs": ["src/**", "*.test.ts", "vitest.config.*"], "outputs": ["coverage/**"], "cache": true }`
   - Mark test task as dependent on build if needed
   - Add test task to pipeline for both `@hbc/auth` and `@hbc/shell`

4. **Create fallback script `scripts/test-auth-shell.sh`** (D-PH5C-05)
   - Bash script with clear error handling and exit codes
   - Include version comment and timestamp
   - Run tests explicitly for both packages in isolation as fallback
   - Report coverage and exit with non-zero if any test fails
   - Make script executable and document its use in package README files

5. **Update root `package.json`** (D-PH5C-05)
   - Add `"test": "pnpm turbo run test --filter=@hbc/auth --filter=@hbc/shell"` at root
   - Document fallback script in scripts section with comment

6. **Verify absolute path resolution** (D-PH5C-05)
   - Test that `import.meta.url` resolves correctly in `vitest.workspace.ts`
   - Confirm `fileURLToPath(import.meta.url)` produces correct absolute paths
   - Validate path resolution works on both Unix and Windows systems

7. **Add test configuration to each package's `vitest.config.ts` (if separate)**
   - If packages have their own `vitest.config.ts`, ensure they inherit from root workspace
   - Set package-specific test directory root
   - Configure any package-specific environment variables

8. **Document workspace configuration in `packages/auth/README.md` and `packages/shell/README.md`**
   - Add section: "Running Tests"
   - Include commands: `pnpm test`, `pnpm test:watch`, `pnpm test:coverage`
   - Reference fallback script: `bash scripts/test-auth-shell.sh`
   - Explain workspace structure and how tests are organized

9. **Add CI/CD environment variables if needed**
   - Export `CI=true` environment variable if tests behave differently in CI
   - Set `NODE_OPTIONS` if Node heap size needs adjustment
   - Configure timeout values for slow CI environments (e.g., `VITEST_TIMEOUT=30000`)

10. **Create `.vitest-workspace.lock` (optional version marker)**
    - Simple file documenting Vitest version and fix date
    - Use for audit trail: `# Vitest workspace fixed: 2026-03-07, v1.0`

---

## Production-Ready Code: `vitest.workspace.ts`

```typescript
// vitest.workspace.ts — Root workspace configuration for auth & shell testing
// D-PH5C-05: Root-cause Vitest fix with explicit absolute paths
// Version: 1.0
// Last Updated: 2026-03-07

import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { defineWorkspace } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineWorkspace([
  {
    name: '@hbc/auth',
    root: path.resolve(__dirname, 'packages/auth'),
    test: {
      globals: true,
      environment: 'node',
      include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
      exclude: ['dist/**', 'node_modules/**'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        include: ['src/**/*.ts'],
        exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'src/index.ts'],
        all: true,
        lines: 95,
        functions: 95,
        branches: 90,
        statements: 95,
      },
      testTimeout: 10000,
      hookTimeout: 10000,
    },
  },
  {
    name: '@hbc/shell',
    root: path.resolve(__dirname, 'packages/shell'),
    test: {
      globals: true,
      environment: 'happy-dom',
      include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
      exclude: ['dist/**', 'node_modules/**'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        include: ['src/**/*.ts', 'src/**/*.tsx'],
        exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'src/index.ts'],
        all: true,
        lines: 95,
        functions: 95,
        branches: 90,
        statements: 95,
      },
      testTimeout: 10000,
      hookTimeout: 10000,
    },
  },
]);
```

---

## Production-Ready Code: `packages/auth/package.json` (test scripts section)

```json
{
  "name": "@hbc/auth",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "tsup src/index.ts --format esm,cjs --dts",
    "dev": "tsup src/index.ts --format esm,cjs --dts --watch",
    "test": "vitest run",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src --max-warnings=0",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "zustand": "^4.4.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0",
    "@vitest/coverage-v8": "^1.0.0",
    "eslint": "^8.50.0",
    "tsup": "^7.2.0"
  }
}
```

---

## Production-Ready Code: `packages/shell/package.json` (test scripts section)

```json
{
  "name": "@hbc/shell",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "tsup src/index.ts --format esm --dts",
    "dev": "tsup src/index.ts --format esm --dts --watch",
    "test": "vitest run",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src --max-warnings=0",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@hbc/auth": "workspace:*",
    "zustand": "^4.4.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0",
    "@vitest/coverage-v8": "^1.0.0",
    "happy-dom": "^12.10.3",
    "eslint": "^8.50.0",
    "tsup": "^7.2.0"
  }
}
```

---

## Production-Ready Code: `turbo.json` (test task)

```json
{
  "$schema": "https://turbo.build/json-schema.json",
  "version": "1",
  "globalDependencies": ["**/.env.local", "**/.env.*.local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "build/**"],
      "cache": true
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"],
      "cache": true,
      "inputs": ["src/**", "*.test.ts", "*.spec.ts", "vitest.config.*", "vitest.workspace.ts"]
    },
    "lint": {
      "outputs": [],
      "cache": false
    },
    "type-check": {
      "outputs": [],
      "cache": true
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

---

## Production-Ready Code: `scripts/test-auth-shell.sh`

```bash
#!/usr/bin/env bash
# scripts/test-auth-shell.sh
# D-PH5C-05: Fallback test script for @hbc/auth and @hbc/shell
# Version: 1.0
# Last Updated: 2026-03-07
# Usage: bash scripts/test-auth-shell.sh [--coverage]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
INCLUDE_COVERAGE=false

if [[ "$1" == "--coverage" ]]; then
  INCLUDE_COVERAGE=true
fi

echo "=========================================="
echo "HB Intel Auth & Shell Test Suite"
echo "Fallback Script v1.0"
echo "=========================================="
echo ""

# Test @hbc/auth
echo "Testing @hbc/auth package..."
cd "$PROJECT_ROOT"
if [[ "$INCLUDE_COVERAGE" == "true" ]]; then
  pnpm --filter @hbc/auth run test:coverage || {
    echo "ERROR: @hbc/auth tests failed"
    exit 1
  }
else
  pnpm --filter @hbc/auth run test || {
    echo "ERROR: @hbc/auth tests failed"
    exit 1
  }
fi
echo "@hbc/auth tests passed ✓"
echo ""

# Test @hbc/shell
echo "Testing @hbc/shell package..."
cd "$PROJECT_ROOT"
if [[ "$INCLUDE_COVERAGE" == "true" ]]; then
  pnpm --filter @hbc/shell run test:coverage || {
    echo "ERROR: @hbc/shell tests failed"
    exit 1
  }
else
  pnpm --filter @hbc/shell run test || {
    echo "ERROR: @hbc/shell tests failed"
    exit 1
  }
fi
echo "@hbc/shell tests passed ✓"
echo ""

echo "=========================================="
echo "All tests passed successfully!"
echo "=========================================="
exit 0
```

---

## Recommended Implementation Sequence

1. PH5C.1 – Vitest Fix (this task)
2. PH5C.2 – MockAuthAdapter Upgrade
3. PH5C.3 – PersonaRegistry
4. PH5C.4 – DevToolbar
5. PH5C.5 – Developer How-To Guide
6. PH5C.6 – End-User How-To Guide
7. PH5C.7 – Administrator How-To Guide
8. PH5C.8 – Alignment Markers
9. PH5C.9 – ADR Updates
10. PH5C.10 – Final Verification

---

## Final Phase 5C Definition of Done

Phase 5C is complete when:
1. All 10 granular task files (PH5C.1 through PH5C.10) are executed in sequence.
2. Phase 5 audit coverage reaches **100%** across all seven categories (security, code quality, documentation, testability, maintainability, completeness, architecture alignment).
3. `pnpm turbo run build --filter=@hbc/auth --filter=@hbc/shell` succeeds with zero warnings.
4. `pnpm turbo run test --filter=@hbc/auth --filter=@hbc/shell` executes and reports ≥95% coverage.
5. All documentation files exist in correct `docs/` subfolders and follow Diátaxis structure (how-to, reference, explanation).
6. All alignment markers are in place; `pnpm lint` detects no violations.
7. Production bundle contains zero byte references to dev-mode code (verified via string search).
8. Final sign-off table is completed with all roles approved.

---

## 5.C.1 Success Criteria Checklist (Task 5C.1)

- [x] 5.C.1.1 `vitest.workspace.ts` updated with explicit absolute paths, two packages configured
- [x] 5.C.1.2 `packages/auth/package.json` includes test, test:watch, test:coverage scripts
- [x] 5.C.1.3 `packages/shell/package.json` includes test, test:watch, test:coverage scripts
- [x] 5.C.1.4 `turbo.json` includes test task with correct inputs/outputs
- [x] 5.C.1.5 `scripts/test-auth-shell.sh` created, executable, and documented
- [x] 5.C.1.6 Root `package.json` includes test script referencing turbo
- [x] 5.C.1.7 `pnpm turbo run test --filter=@hbc/auth --filter=@hbc/shell` executes without errors
- [x] 5.C.1.8 Test coverage reports generated for both packages
- [x] 5.C.1.9 Fallback script `bash scripts/test-auth-shell.sh` executes successfully
- [x] 5.C.1.10 Package READMEs updated with test running instructions

---

## Phase 5.C.1 Progress Notes

- 5.C.1.1 [COMPLETED] — Update vitest.workspace.ts with absolute paths
- 5.C.1.2 [COMPLETED] — Add test scripts to package.json files
- 5.C.1.3 [COMPLETED] — Integrate test task in turbo.json
- 5.C.1.4 [COMPLETED] — Create fallback script
- 5.C.1.5 [COMPLETED] — Verify all tests execute

### Verification Evidence

- `pnpm turbo run build --filter=@hbc/auth --filter=@hbc/shell` - [PASS]
- `pnpm turbo run test --filter=@hbc/auth --filter=@hbc/shell` - [PASS]
- `pnpm turbo run lint --filter=@hbc/auth --filter=@hbc/shell` - [PASS]
- `bash scripts/test-auth-shell.sh --coverage` - [PASS]
- Coverage reports generated for both packages - [PASS]
- Remediation note: initial Vitest execution failures were corrected by rooting package test scripts to `vitest.workspace.ts`, adding `happy-dom` and `@vitest/coverage-v8`, and fixing two pre-existing auth test defects (`overrideRecord` emergency validation order; UTC-safe duration math in `overrideRequest`).

---

**End of Task PH5C.1**

<!-- IMPLEMENTATION PROGRESS & NOTES
Task PH5C.1 created: 2026-03-07
Vitest root-cause fix specification complete.
Task PH5C.1 completed: 2026-03-07
D-PH5C-05 implemented with absolute-path workspace config, package/root test scripts, turbo test task wiring, fallback script, README test guidance, and verification gates (test/fallback coverage/build/lint/check-types) passing.
Remediation applied: resolved workspace execution regressions and stabilized two failing auth tests required for gate closure.
Next: PH5C.2 (MockAuthAdapter Upgrade)
-->
