# SF17-T01 - Package Scaffold: `@hbc/features-admin` (Admin Intelligence)

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-17-Module-Feature-Admin-Intelligence.md`
**Decisions Applied:** D-01, D-09, D-10
**Estimated Effort:** 0.5 sprint-weeks
**Depends On:** SF17 master plan

> **Doc Classification:** Canonical Normative Plan - SF17-T01 scaffold task; sub-plan of `SF17-Admin-Intelligence.md`.

---

## Objective

Define the Admin Intelligence scaffold in `packages/features/admin` with dual exports, strict coverage gates, and required README structure.

---

## Required Files

```text
packages/features/admin/
|- package.json
|- README.md
|- tsconfig.json
|- vitest.config.ts
|- src/index.ts
|- src/types/index.ts
|- src/monitors/index.ts
|- src/probes/index.ts
|- src/api/index.ts
|- src/hooks/index.ts
|- src/components/index.ts
|- testing/index.ts
|- src/__tests__/setup.ts
```

---

## Package Contract Requirements

- package name remains `@hbc/features-admin`
- export map includes runtime `./` and testing `./testing`
- `testing` exports are isolated from production bundles
- coverage thresholds are `95/95/95/95` (lines/branches/functions/statements)
- lint/typecheck/build/test scripts include admin-intelligence surfaces

---

## README Requirement (Mandatory in T01)

**File:** `packages/features/admin/README.md`

Must include:

1. admin-intelligence capability overview (alerts, truth layer, approval authority)
2. quick-start integration for `apps/admin` and dependent packages
3. monitor/probe/approval architecture summary
4. exported APIs/components table
5. architecture boundary rules
6. testing entrypoint guidance (`@hbc/features-admin/testing`)
7. links to SF17 master, SF17-T09, ADR-0106 target path

---

## Verification Commands

```bash
pnpm --filter @hbc/features-admin check-types
pnpm --filter @hbc/features-admin build
pnpm --filter @hbc/features-admin test --coverage
test -f packages/features/admin/README.md
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF17-T01 completed: 2026-03-11
- package.json: dual exports (./  ./testing), scripts, devDependencies, v0.0.1
- tsconfig.json: declaration/declarationMap/sourceMap/jsx/paths for testing alias
- tsconfig.build.json: extends local tsconfig, excludes tests/stories
- vitest.config.ts: jsdom, react plugin, 95% coverage thresholds, scaffold dirs excluded
- src/__tests__/setup.ts: vitest globals + jest-dom
- src/index.ts: re-exports all barrel modules preserving empty-state export
- src/types/: IAdminAlert, IInfrastructureProbe, IApprovalAuthorityRule
- src/monitors/: 6 monitors + monitorRegistry (placeholder stubs)
- src/probes/: 5 probes + probeScheduler (placeholder stubs)
- src/api/: ApprovalAuthorityApi, AdminAlertsApi, InfrastructureProbeApi (class stubs)
- src/hooks/: useAdminAlerts, useInfrastructureProbes, useApprovalAuthority (hook stubs)
- src/components/: AdminAlertBadge, AdminAlertDashboard, ImplementationTruthDashboard, ApprovalAuthorityTable, ApprovalRuleEditor (component stubs)
- testing/: createMockAdminAlert, createMockProbeSnapshot, createMockApprovalAuthorityRule, mockAdminIntelligenceStates
- README.md: 7 required sections
- Verification: check-types ✓, build ✓, test ✓ (passWithNoTests)
Next: SF17-T02 (TypeScript Contracts)
-->
