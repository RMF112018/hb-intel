## Research Summary
Hook behavior targets Azure AI Search query/facet latency patterns ([Microsoft Learn](https://learn.microsoft.com/en-us/azure/search/search-indexer-overview)), resilient backend orchestration and rate-safe aggregation ([Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/patterns/gateway-aggregation)), and construction NL retrieval interaction patterns supporting parser-driven UX ([Automation in Construction, 2023](https://www.sciencedirect.com/science/article/abs/pii/S0926580523003278)).

# SF16-T04 — Hooks: `@hbc/search`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-16-Shared-Feature-Search.md`
**Decisions Applied:** D-04, D-05, D-06, D-07
**Estimated Effort:** 0.75 sprint-weeks
**Depends On:** T03

> **Doc Classification:** Canonical Normative Plan — SF16-T04 hooks task; sub-plan of `SF16-Search.md`.

---

## Objective

Define hook behaviors for querying, parser-assisted command-search UX state, deep-link enrichment, and governed saved searches.

---

## Hook Contracts

- `useSearch(initialQuery?)`
- `useGlobalSearch()`
- `useSavedSearches()`

Required behaviors: debounce, parser-assisted query normalization, keyboard navigation state, recent/saved history, query serialization, IndexedDB cache fallback, and deep-link hydration (`canvasDeepLink`, `relatedItemsDeepLink`).

---

## Verification Commands

```bash
pnpm --filter @hbc/search test -- useSearch useGlobalSearch useSavedSearches
pnpm --filter @hbc/search check-types
```
