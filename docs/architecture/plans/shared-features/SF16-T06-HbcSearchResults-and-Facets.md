## Research Summary
Results/facets behavior is based on Azure search facet/filter design at scale ([Microsoft Learn](https://learn.microsoft.com/en-us/azure/search/search-indexer-overview)), API-side aggregation and source-safe query brokering ([Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/patterns/gateway-aggregation)), and peer-reviewed construction search UX patterns for NL-driven BIM retrieval ([Automation in Construction, 2023](https://www.sciencedirect.com/science/article/abs/pii/S0926580523003278)).

# SF16-T06 — `HbcSearchResults` and `HbcSearchFacets`: `@hbc/search`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-16-Shared-Feature-Search.md`
**Decisions Applied:** D-05, D-07
**Estimated Effort:** 0.8 sprint-weeks
**Depends On:** T05

> **Doc Classification:** Canonical Normative Plan — SF16-T06 full results/facets task; sub-plan of `SF16-Search.md`.

---

## Objective

Define full results experience with pagination, sorting, facets, deep links, and provenance visibility.

---

## Components

- `HbcSearchResults`: result cards + pagination + sort controls + “View Related” button + canvas-aware navigation
- `HbcSearchFacets`: module/type/status facets + BIC quick-filter chips + date filters + provenance-aware controls (Expert)

Essential behavior: minimal search only; full facet panel in Standard+; provenance badge in Expert.

---

## Verification Commands

```bash
pnpm --filter @hbc/search test -- HbcSearchResults HbcSearchFacets
pnpm --filter @hbc/search build
```
