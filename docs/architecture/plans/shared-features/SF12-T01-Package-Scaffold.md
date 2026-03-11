# SF12-T01 — Package Scaffold: `@hbc/session-state`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-12-Shared-Feature-Session-State.md`
**Decisions Applied:** D-01, D-04, D-07, D-10
**Estimated Effort:** 0.35 sprint-weeks
**Depends On:** SF12 master plan

> **Doc Classification:** Canonical Normative Plan — SF12-T01 package scaffold task; sub-plan of `SF12-Session-State.md`.

---

## Objective

Create `@hbc/session-state` base scaffolding, including dual runtime/testing exports, strict testing thresholds, and a required package README scaffold in T01.

---

## 3-Line Plan

1. Create package directory and all barrel files for db/sync/context/hooks/components/testing.
2. Configure `package.json`, `tsconfig.json`, `vitest.config.ts` with 95% coverage thresholds.
3. Create `packages/session-state/README.md` scaffold immediately in T01.

---

## Required Files

```text
packages/session-state/
├── package.json
├── README.md
├── tsconfig.json
├── vitest.config.ts
├── src/index.ts
├── src/types/index.ts
├── src/constants/index.ts
├── src/db/index.ts
├── src/sync/index.ts
├── src/context/index.ts
├── src/hooks/index.ts
├── src/components/index.ts
├── testing/index.ts
└── src/__tests__/setup.ts
```

---

## Package Requirements

- Name: `@hbc/session-state`
- Exports: `"."` and `"./testing"`
- Runtime deps include `react`
- `sideEffects: false`
- Test env: `jsdom`
- Coverage thresholds:
  - `lines: 95`
  - `branches: 95`
  - `functions: 95`
  - `statements: 95`

---

## README.md Requirement (Mandatory in T01)

**File:** `packages/session-state/README.md`

T01 must create a scaffold README containing:

1. Overview and purpose
2. Quick start (Provider + hooks)
3. Connectivity states and queue model summary
4. Draft TTL behavior summary
5. Exports table (runtime + testing)
6. Architecture boundaries
7. Links to SF12 master/T09 and ADR-0101 target path

---

## Verification Commands

```bash
pnpm --filter @hbc/session-state check-types
pnpm --filter @hbc/session-state build
pnpm --filter @hbc/session-state test --coverage
test -f packages/session-state/README.md
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF12-T01 completed: 2026-03-11
- Package scaffold created with all 22 source barrel stubs (src/ + testing/)
- Dual exports configured: "." (runtime) and "./testing" (test factories)
- tsconfig.json, tsconfig.build.json, vitest.config.ts with 95/95/95/95 thresholds
- 4 testing factories: createMockQueuedOperation, createMockDraftEntry, createMockSessionContext, mockConnectivityStates
- README.md created with all 7 required sections
- tsconfig.base.json updated with @hbc/session-state path aliases
- pnpm workspace registered
- All verification gates passed: check-types ✓, build ✓, test (passWithNoTests) ✓, README exists ✓
Next: SF12-T02 (TypeScript Contracts)
-->
