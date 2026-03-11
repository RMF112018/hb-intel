# SF16-T01 — Package Scaffold: `@hbc/search`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-16-Shared-Feature-Search.md`
**Decisions Applied:** D-01, D-08, D-10
**Estimated Effort:** 0.45 sprint-weeks
**Depends On:** SF16 master plan

> **Doc Classification:** Canonical Normative Plan — SF16-T01 scaffold task; sub-plan of `SF16-Search.md`.

---

## Objective

Create package scaffold with dual exports, strict coverage gates, and mandatory README scaffold.

---

## Required Files

```text
packages/search/
├── package.json
├── README.md
├── tsconfig.json
├── vitest.config.ts
├── src/index.ts
├── src/types/index.ts
├── src/constants/index.ts
├── src/indexer/index.ts
├── src/api/index.ts
├── src/hooks/index.ts
├── src/components/index.ts
├── testing/index.ts
└── src/__tests__/setup.ts
```

---

## README Requirement (Mandatory in T01)

**File:** `packages/search/README.md`

Must include:

1. overview + operations-grade search goals
2. quick-start usage
3. Azure Search + indexer architecture summary
4. facets/command-search/saved-search behavior summary
5. exports table
6. architecture boundary rules
7. links to SF16 master/T09 and ADR-0105 target path

---

## Verification Commands

```bash
pnpm --filter @hbc/search check-types
pnpm --filter @hbc/search build
pnpm --filter @hbc/search test --coverage
test -f packages/search/README.md
```
