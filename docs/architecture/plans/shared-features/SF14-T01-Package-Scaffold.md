# SF14-T01 — Package Scaffold: `@hbc/related-items`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-14-Shared-Feature-Related-Items.md`
**Decisions Applied:** D-01, D-07, D-10
**Estimated Effort:** 0.35 sprint-weeks
**Depends On:** SF14 master plan

> **Doc Classification:** Canonical Normative Plan — SF14-T01 scaffold task; sub-plan of `SF14-Related-Items.md`.

---

## Objective

Create base package structure for `@hbc/related-items` with dual exports, strict coverage gates, and mandatory README scaffold.

---

## Required Files

```text
packages/related-items/
├── package.json
├── README.md
├── tsconfig.json
├── vitest.config.ts
├── src/index.ts
├── src/types/index.ts
├── src/constants/index.ts
├── src/registry/index.ts
├── src/api/index.ts
├── src/hooks/index.ts
├── src/components/index.ts
├── testing/index.ts
└── src/__tests__/setup.ts
```

---

## Package Requirements

- Name: `@hbc/related-items`
- Exports: `"."`, `"./testing"`
- `sideEffects: false`
- Coverage thresholds all `95`

---

## README Requirement (Mandatory in T01)

**File:** `packages/related-items/README.md`

Must include:

1. overview + work-graph relationship model
2. quick start usage
3. registry + API + panel summary
4. role visibility and complexity behavior summary
5. exports table
6. architecture boundary rules
7. links to SF14 master/T09 and ADR-0103 target path

---

## Verification Commands

```bash
pnpm --filter @hbc/related-items check-types
pnpm --filter @hbc/related-items build
pnpm --filter @hbc/related-items test --coverage
test -f packages/related-items/README.md
```
