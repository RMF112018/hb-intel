## Research Summary
Testing strategy follows Azure search correctness/latency expectations ([Microsoft Learn](https://learn.microsoft.com/en-us/azure/search/search-indexer-overview)), resilient API aggregation and failure-isolation patterns ([Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/patterns/gateway-aggregation)), and construction NLP retrieval research supporting parser quality and contextual grounding tests ([Automation in Construction, 2023](https://www.sciencedirect.com/science/article/abs/pii/S0926580523003278)).

# SF16-T08 — Testing Strategy: `@hbc/search`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-16-Shared-Feature-Search.md`
**Decisions Applied:** D-04, D-05, D-06, D-10
**Estimated Effort:** 0.5 sprint-weeks
**Depends On:** T01–T07

> **Doc Classification:** Canonical Normative Plan — SF16-T08 testing strategy task; sub-plan of `SF16-Search.md`.

---

## Objective

Define fixtures and tests for indexing, parser/querying, filtering, keyboard UX, deep links, provenance, offline cache, and saved-search governance.

---

## Testing Sub-Path

- `createMockSearchQuery`
- `createMockSearchResult`
- `createMockSearchResponse`
- `mockSearchFacets`

---

## Required Coverage

- indexer field mapping including `dataSource` and `provenance`
- parser tests for NL-to-structured `ISearchQuery` conversion
- query/facet/sort/saved-search API contract tests
- hook tests for debounce, keyboard state, and IndexedDB fallback
- component tests for Search-First bar, global overlay, results/facets, and “View Related” flows
- provenance badge and Expert-tier governance visibility tests
- storybook states for command/search/results/provenance variants
- Playwright scenario for create→index→NL search→deep-link flow

---

## Verification Commands

```bash
pnpm --filter @hbc/search test --coverage
pnpm --filter @hbc/search storybook
pnpm exec playwright test --grep "search"
```
