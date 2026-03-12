# SF18-T01 - Package Scaffold: `@hbc/features-estimating` (Bid Readiness Adapter)

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-18-Module-Feature-Estimating-Bid-Readiness.md`
**Decisions Applied:** L-01 through L-06
**Estimated Effort:** 0.45 sprint-weeks
**Depends On:** SF18 master plan + `@hbc/health-indicator`

> **Doc Classification:** Canonical Normative Plan - SF18-T01 scaffold task; sub-plan of `SF18-Estimating-Bid-Readiness.md`.

---

## Objective

Define the SF18 adapter scaffold in `@hbc/features-estimating` so Estimating consumes `@hbc/health-indicator` contracts without re-implementing scoring/version/telemetry cores.

---

## Required Files

```text
packages/features/estimating/
|- package.json
|- README.md
|- src/index.ts
|- src/bid-readiness/index.ts
|- src/bid-readiness/profiles/index.ts
|- src/bid-readiness/adapters/index.ts
|- src/bid-readiness/hooks/index.ts
|- src/bid-readiness/components/index.ts
|- src/bid-readiness/telemetry/index.ts
|- testing/index.ts
|- src/__tests__/setup.ts
```

---

## Package Contract Requirements

- package name remains `@hbc/features-estimating`
- runtime exports expose adapter hooks/components/profile contracts only
- no duplicate scoring engine or versioning logic in package runtime
- `@hbc/health-indicator` is required dependency for core state contracts
- testing exports include profile fixtures and mocked health-indicator states
- coverage thresholds remain `95/95/95/95`

---

## README Requirement (Mandatory in T01)

**File:** `packages/features/estimating/README.md`

Must include:

1. adapter-over-primitive architecture summary
2. estimating profile defaults and admin override behavior
3. complexity-mode behavior summary
4. offline behavior and optimistic status badges
5. inline AI action constraints (sources + approval)
6. KPI telemetry outputs and where they surface
7. links to SF18 master, SF18-T09, ADR-0107, companion primitive ADR

---

## Verification Commands

```bash
pnpm --filter @hbc/features-estimating check-types
pnpm --filter @hbc/features-estimating build
pnpm --filter @hbc/features-estimating test --coverage
test -f packages/features/estimating/README.md
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF18-T01 completed: 2026-03-12
- All 11 required files created per §Required Files
- package.json: v0.0.1, dual exports (. + ./testing), admin pattern scripts, 95/95/95/95 coverage thresholds
- tsconfig.json/tsconfig.build.json: admin pattern (rootDir ".", declaration, declarationMap, sourceMap, jsx react-jsx, paths alias)
- vitest.config.ts: jsdom, globals, passWithNoTests, setup file, v8 coverage with scaffold exclusions
- src/index.ts: re-exports empty-state (preserved) + bid-readiness barrel
- src/bid-readiness/: profiles, adapters, hooks, components, telemetry barrels with stub implementations
- testing/: createMockHealthIndicatorState + createMockBidReadinessProfile factories
- README.md: all 7 required sections (architecture, profiles, complexity, offline, AI, KPIs, links)
- @hbc/health-indicator dependency deferred (package not yet in workspace); will be added when primitive is scaffolded
- Verification: check-types ✓, build ✓, test --coverage ✓ (passWithNoTests)
Next: SF18-T02 (TypeScript Contracts)
-->
