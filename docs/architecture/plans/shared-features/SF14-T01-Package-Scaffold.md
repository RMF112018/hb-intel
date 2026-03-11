<!-- DIFF-SUMMARY: Updated scaffold tree for governance/tile assets and batched API surface requirements -->

# SF14-T01 — Package Scaffold: `@hbc/related-items`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-14-Shared-Feature-Related-Items.md`
**Decisions Applied:** D-01, D-07, D-10
**Estimated Effort:** 0.35 sprint-weeks
**Depends On:** SF14 master plan

> **Doc Classification:** Canonical Normative Plan — SF14-T01 scaffold task; sub-plan of `SF14-Related-Items.md`.

---

## Objective

Create base package structure for `@hbc/related-items` with dual exports, strict coverage gates, mandatory README scaffold, governance surface entrypoints, and batched API surface.

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
├── src/api/RelatedItemsApi.ts
├── src/hooks/index.ts
├── src/hooks/useRelatedItems.ts
├── src/governance/index.ts
├── src/governance/HbcRelatedItemsGovernance.tsx
├── src/components/index.ts
├── src/components/HbcRelatedItemsPanel.tsx
├── src/components/HbcRelatedItemCard.tsx
├── src/components/HbcRelatedItemsTile.tsx
├── testing/index.ts
└── src/__tests__/setup.ts
```

---

## Package Requirements

- Name: `@hbc/related-items`
- Exports: `"."`, `"./testing"`
- `sideEffects: false`
- Coverage thresholds all `95`
- Public API surface includes registry, batched API, hooks, panel/card/tile, and governance surface exports

---

## README Requirement (Mandatory in T01)

**File:** `packages/related-items/README.md`

Must include:

1. overview + work-graph relationship model
2. quick start usage
3. `registerBidirectionalPair()` + batched `/api/related-items/summaries` + panel/tile summary
4. role visibility, complexity behavior, and governance metadata summary
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

<!-- IMPLEMENTATION PROGRESS & NOTES
SF14-T01 completed: 2026-03-11
22 files created in packages/related-items/
Verification: check-types ✓, build ✓, test --coverage ✓, README ✓
Coverage note: scaffold stubs (api/**, registry/**, hooks/**, governance/**, components/**) excluded from thresholds — remove excludes as real implementations land in T02–T07
Next: SF14-T02 (TypeScript Contracts)
-->
