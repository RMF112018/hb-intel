## Research Summary
Contracts are scoped to Azure AI Search query/facet and index projection expectations ([Microsoft Learn](https://learn.microsoft.com/en-us/azure/search/search-indexer-overview)), API aggregation boundaries for tenant-safe orchestration ([Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/patterns/gateway-aggregation)), and peer-reviewed construction NLP retrieval patterns that justify parser/provenance fields ([Automation in Construction, 2023](https://www.sciencedirect.com/science/article/abs/pii/S0926580523003278)).

# SF16-T02 — TypeScript Contracts: `@hbc/search`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-16-Shared-Feature-Search.md`
**Decisions Applied:** D-02, D-05, D-06
**Estimated Effort:** 0.5 sprint-weeks
**Depends On:** T01

> **Doc Classification:** Canonical Normative Plan — SF16-T02 contracts task; sub-plan of `SF16-Search.md`.

---

## Objective

Define full query/result/facet/saved-search contracts plus parser/indexing manifest contracts.

---

## Core Contracts

- `ISearchQuery`
- `ISearchResult` with `canvasDeepLink`, `relatedItemsDeepLink`, `provenance`
- `ISearchResponse`
- `ISearchFacets`
- `ISavedSearch` with governance/audit metadata
- `ISearchableModule` for declarative manifest-driven indexing

Include defaults for pagination, debounce, sort, and Search-First Mode behavior flags.

---

## Verification Commands

```bash
pnpm --filter @hbc/search check-types
pnpm --filter @hbc/search build
```
