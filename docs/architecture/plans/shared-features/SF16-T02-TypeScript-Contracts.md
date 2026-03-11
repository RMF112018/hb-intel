# SF16-T02 — TypeScript Contracts: `@hbc/search`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-16-Shared-Feature-Search.md`
**Decisions Applied:** D-02, D-05, D-06
**Estimated Effort:** 0.5 sprint-weeks
**Depends On:** T01

> **Doc Classification:** Canonical Normative Plan — SF16-T02 contracts task; sub-plan of `SF16-Search.md`.

---

## Objective

Define full query/result/facet/saved-search contracts.

---

## Core Contracts

- `ISearchQuery`
- `ISearchResult`
- `ISearchResponse`
- `ISearchFacets`
- `ISavedSearch`

Include defaults for pagination, debounce, and sort.

---

## Verification Commands

```bash
pnpm --filter @hbc/search check-types
pnpm --filter @hbc/search build
```
