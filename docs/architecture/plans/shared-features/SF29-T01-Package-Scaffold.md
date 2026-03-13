# SF29-T01 - Package Scaffold: `@hbc/my-work-feed`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-29-Shared-Feature-My-Work-Feed.md`
**Decisions Applied:** L-01, L-02, L-03, L-07, L-10
**Estimated Effort:** 0.8 sprint-weeks
**Depends On:** SF29 master plan

> **Doc Classification:** Canonical Normative Plan - SF29-T01 scaffold task; sub-plan of `SF29-My-Work-Feed.md`.

---

## Objective

Define scaffolding for `@hbc/my-work-feed` as a first-class shared package with runtime, composite surfaces, telemetry, and testing exports, while preserving a strict reuse-first relationship with `@hbc/ui-kit`.

---

## Required Files

```text
packages/my-work-feed/
|- package.json
|- README.md
|- tsconfig.json
|- tsconfig.build.json
|- vitest.config.ts
|- src/index.ts
|- src/types/index.ts
|- src/constants/index.ts
|- src/registry/index.ts
|- src/normalization/index.ts
|- src/adapters/index.ts
|- src/api/index.ts
|- src/hooks/index.ts
|- src/store/index.ts
|- src/components/index.ts
|- src/telemetry/index.ts
|- testing/index.ts
```

Subfolders under `src/components/` must include:

- `HbcMyWorkLauncher`
- `HbcMyWorkBadge`
- `HbcMyWorkTile`
- `HbcMyWorkPanel`
- `HbcMyWorkFeed`
- `HbcMyWorkTeamFeed`
- `HbcMyWorkListItem`
- `HbcMyWorkReasonDrawer`
- `HbcMyWorkPlanningBar`
- `HbcMyWorkSourceHealth`
- `HbcMyWorkEmptyState`
- `HbcMyWorkOfflineBanner`

---

## Package Contract Requirements

- package name is `@hbc/my-work-feed`
- public-barrel imports only; consumers must not import internal file paths
- coverage thresholds are `95/95/95/95`
- `./testing` sub-path is excluded from production bundles
- runtime logic owns canonical work-item truth; shell state is not the source of truth
- component code may compose `@hbc/ui-kit` primitives but must not duplicate design-system-grade primitives already available there
- only genuinely cross-package, design-system-grade abstractions should be factored back into `@hbc/ui-kit`

---

## README Requirement (Mandatory in T01)

Must include:

1. My Work package purpose and cross-module orchestration role
2. adapter-registry architecture and source-ownership boundaries
3. reuse-first rule for `@hbc/ui-kit` primitives
4. explanation of count semantics across badge, launcher, tile, panel, and full feed
5. offline cache and replay-safe mutation model
6. testing entrypoint guidance (`@hbc/my-work-feed/testing`)
7. links to SF29 master plan, SF29-T09, and ADR-0114

---

## Verification Commands

```bash
pnpm --filter @hbc/my-work-feed check-types
pnpm --filter @hbc/my-work-feed build
pnpm --filter @hbc/my-work-feed test --coverage
rg -n "HbcMyWork|my-work-feed" packages/my-work-feed/src
```
