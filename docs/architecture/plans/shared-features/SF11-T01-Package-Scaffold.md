# SF11-T01 — Package Scaffold: `@hbc/smart-empty-state`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-11-Shared-Feature-Smart-Empty-State.md`
**Decisions Applied:** D-02, D-04, D-07, D-10
**Estimated Effort:** 0.2 sprint-weeks
**Depends On:** SF11 master plan

> **Doc Classification:** Canonical Normative Plan — SF11-T01 package scaffold task; sub-plan of `SF11-Smart-Empty-State.md`.

---

## Objective

Create the base package scaffold for `@hbc/smart-empty-state` with dual exports (`./` and `./testing`), strict TS/lint/test defaults, and coverage gates consistent with shared-feature standards.

---

## 3-Line Plan

1. Create package directory tree with `src/` and `testing/` entry points.
2. Define `package.json`, `tsconfig.json`, and `vitest.config.ts` with 95% coverage thresholds.
3. Add barrels and empty implementation stubs consumed by T02–T08.

---

## Required Files

```text
packages/smart-empty-state/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── README.md
├── src/
│   ├── index.ts
│   ├── types/index.ts
│   ├── constants/index.ts
│   ├── classification/index.ts
│   ├── hooks/index.ts
│   └── components/index.ts
├── testing/index.ts
└── src/__tests__/setup.ts
```

---

## `package.json` Requirements

- Name: `@hbc/smart-empty-state`
- Version: `0.0.1`
- Exports:
  - `"."` → main runtime entry
  - `"./testing"` → testing fixtures only
- Peer/runtime deps include:
  - `react`, `react-dom`
  - `@hbc/complexity`
  - `@hbc/ui-kit`
- Dev deps include `vitest`, `@testing-library/react`, `@types/react`.
- `sideEffects: false`

---

## `vitest.config.ts` Requirements

Coverage thresholds (all mandatory):

- `lines: 95`
- `branches: 95`
- `functions: 95`
- `statements: 95`

Test environment: `jsdom`.

---

## Verification Commands

```bash
pnpm --filter @hbc/smart-empty-state check-types
pnpm --filter @hbc/smart-empty-state build
pnpm --filter @hbc/smart-empty-state test --coverage
```

All commands must pass with zero errors before T02 starts.

<!-- IMPLEMENTATION PROGRESS & NOTES
SF11-T01 completed: 2026-03-10
- 27 files created (6 infrastructure, 8 leaf stubs, 5 barrels, 6 root/test/testing, 1 scaffold test, 1 external update)
- package.json: dual exports (. and ./testing), NO @tanstack/react-query peer dep (D-08)
- tsconfig.json/tsconfig.build.json: extends base, self-path alias, __tests__ excluded from type-check
- vitest.config.ts: jsdom, 95% thresholds, passWithNoTests, setupFiles ./src/__tests__/setup.ts
- Coverage: 100% all metrics (stmts/branches/functions/lines)
- Build: zero errors (pnpm turbo run build — 35/35 tasks pass)
- Type-check: zero errors
- tsconfig.base.json updated with @hbc/smart-empty-state path aliases
- D-02: ISmartEmptyStateConfig placeholder in types stub
- D-04: IEmptyStateVisitStore adapter + noopVisitStore; no @hbc/session-state dep
- D-07: no external asset imports in component stubs
- D-08: zero @hbc/notification-intelligence imports
- D-10: testing sub-path with 3 fixture stubs
Next: SF11-T02 TypeScript Contracts
-->
