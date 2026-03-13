# SF28-T01 - Package Scaffold: `@hbc/activity-timeline`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-28-Shared-Feature-Activity-Timeline.md`
**Decisions Applied:** L-01, L-04, L-08, L-09
**Estimated Effort:** 0.7 sprint-weeks
**Depends On:** SF28 master plan

> **Doc Classification:** Canonical Normative Plan - SF28-T01 scaffold task; sub-plan of `SF28-Activity-Timeline.md`.

---

## Objective

Define scaffolding across `@hbc/activity-timeline` and `@hbc/ui-kit` with runtime/testing exports, append-only event seams, query/filter state boundaries, and README requirements that match current package-governance rules.

---

## Required Files

```text
packages/activity-timeline/
|- package.json
|- README.md
|- tsconfig.json
|- vitest.config.ts
|- src/index.ts
|- src/types/index.ts
|- src/model/index.ts
|- src/formatters/index.ts
|- src/storage/index.ts
|- src/adapters/index.ts
|- src/hooks/index.ts
|- src/telemetry/index.ts
|- testing/index.ts

packages/ui-kit/src/HbcActivityTimeline/
packages/ui-kit/src/ActivityEventRow/
packages/ui-kit/src/ActivityEventIcon/
packages/ui-kit/src/ActivityFilterBar/
packages/ui-kit/src/ActivityDiffPopover/
packages/ui-kit/src/ActivityEmptyState/
```

Scaffold expectations must leave explicit room for:

- normalized event contracts
- source truth stamps and provenance state
- diff summarization and grouping formatters
- append-only storage adapters
- query/filter orchestration
- event confidence and source-health state
- pending local event projection
- telemetry and testing exports

---

## Package Contract Requirements

- primitive package name is `@hbc/activity-timeline`
- consumers and source adapters import primitive public exports only
- runtime/orchestration ownership remains in `@hbc/activity-timeline`
- reusable visual primitives and presentational components belong in `@hbc/ui-kit` per `CLAUDE.md`
- any local render helpers in `@hbc/activity-timeline` must remain thin composition shells over runtime state and `@hbc/ui-kit` building blocks
- testing entrypoints excluded from production bundles
- coverage thresholds are `95/95/95/95` (lines/branches/functions/statements)
- scripts include primitive check-types/build/test targets

---

## README Requirement (Mandatory in T01)

Must include:

1. shared activity timeline overview
2. append-only event-truth and narrative-projection boundary rules
3. record / related / workspace timeline mode summary
4. actor attribution and provenance vocabulary summary
5. SharePoint MVP storage + Azure future seam summary
6. ui-kit ownership and component boundary summary
7. testing entrypoint guidance (`@hbc/activity-timeline/testing`)
8. links to SF28 master, SF28-T09, ADR-0114, and companion primitive ADR

---

## Export Expectations

Primitive exports must reserve public surface for:

- event and query contracts
- normalization and summarization helpers
- storage adapter interfaces
- emitter utilities
- confidence/source-health selectors
- dedupe and grouping selectors
- telemetry constants and testing factories

These exports are required so modules do not invent local activity-feed behavior.

---

## Verification Commands

```bash
pnpm --filter @hbc/activity-timeline check-types
pnpm --filter @hbc/activity-timeline build
pnpm --filter @hbc/activity-timeline test --coverage
pnpm --filter @hbc/ui-kit check-types
```
