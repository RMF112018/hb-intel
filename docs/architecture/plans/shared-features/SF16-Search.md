# SF16 — `@hbc/search`: Operations-Grade Cross-Module Search (Azure Cognitive Search)

**Plan Version:** 1.0
**Date:** 2026-03-11
**Source Spec:** `docs/explanation/feature-decisions/PH7-SF-16-Shared-Feature-Search.md`
**Priority Tier:** 3 — Intelligence Layer (high-value usability accelerator)
**Estimated Effort:** 5–6 sprint-weeks
**ADR Required:** `docs/architecture/adr/ADR-0105-search-azure-cognitive-search.md`

> **Doc Classification:** Canonical Normative Plan — SF16 implementation master plan for `@hbc/search`; governs SF16-T01 through SF16-T09.

---

## Purpose

`@hbc/search` provides cross-module, faceted, keyboard-first search powered by Azure Cognitive Search, enabling users to find records/documents quickly without module-by-module navigation.

---

## Locked Interview Decisions

| # | Decision | Locked Choice |
|---|---|---|
| D-01 | Index backend | Azure Cognitive Search with unified record schema |
| D-02 | Query contract | `ISearchQuery` with free text + facets + assignment/BIC filters |
| D-03 | Indexing path | Azure Functions indexer on record changes |
| D-04 | UX model | global ⌘K/Ctrl+K command search + inline scoped bar + full results page |
| D-05 | Faceting model | module, record type, status required; blocked/overdue/assigned toggles |
| D-06 | Saved searches | per-user saved queries via `HbcSavedSearches` |
| D-07 | Complexity behavior | Essential: search bar only; Standard: full search; Expert: saved searches + advanced metadata |
| D-08 | Tenant boundary | all client calls route through backend; no direct client calls to Azure Search |
| D-09 | Integration baseline | BIC dimensions indexed/filterable; related-items deep-link integration |
| D-10 | Testing sub-path | `@hbc/search/testing` exports canonical query/result fixtures |

---

## Package Directory Structure

```text
packages/search/
├── package.json
├── README.md
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts
│   ├── types/
│   │   ├── ISearch.ts
│   │   └── index.ts
│   ├── constants/
│   │   ├── searchDefaults.ts
│   │   └── index.ts
│   ├── indexer/
│   │   ├── SearchIndexer.ts
│   │   └── index.ts
│   ├── api/
│   │   ├── SearchApi.ts
│   │   ├── SavedSearchApi.ts
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useSearch.ts
│   │   ├── useGlobalSearch.ts
│   │   ├── useSavedSearches.ts
│   │   └── index.ts
│   └── components/
│       ├── HbcSearchBar.tsx
│       ├── HbcGlobalSearch.tsx
│       ├── HbcSearchResults.tsx
│       ├── HbcSearchFacets.tsx
│       └── index.ts
├── testing/
│   ├── index.ts
│   ├── createMockSearchQuery.ts
│   ├── createMockSearchResult.ts
│   ├── createMockSearchResponse.ts
│   └── mockSearchFacets.ts
└── src/__tests__/
    ├── setup.ts
    ├── SearchIndexer.test.ts
    ├── SearchApi.test.ts
    ├── useSearch.test.ts
    ├── useGlobalSearch.test.ts
    ├── useSavedSearches.test.ts
    ├── HbcSearchBar.test.tsx
    ├── HbcGlobalSearch.test.tsx
    ├── HbcSearchResults.test.tsx
    └── HbcSearchFacets.test.tsx
```

---

## Definition of Done

- [ ] Azure Cognitive Search schema and indexer contracts documented
- [ ] query/facet/sort/saved-search contracts documented
- [ ] command palette search and full results UX documented
- [ ] BIC dimension indexing/filtering documented
- [ ] testing sub-path fixtures documented
- [ ] T09 includes SF11-grade documentation/deployment requirements
- [ ] `current-state-map.md` updated with SF16 + ADR-0105 linkage

---

## Task File Index

| File | Contents |
|---|---|
| `SF16-T01-Package-Scaffold.md` | package scaffold + README requirement |
| `SF16-T02-TypeScript-Contracts.md` | search contracts/constants |
| `SF16-T03-Indexer-and-API.md` | indexer + SearchApi/SavedSearchApi contracts |
| `SF16-T04-Hooks.md` | useSearch/useGlobalSearch/useSavedSearches |
| `SF16-T05-HbcSearchBar-and-HbcGlobalSearch.md` | entry UX components |
| `SF16-T06-HbcSearchResults-and-Facets.md` | full results/facets UX |
| `SF16-T07-Reference-Integrations.md` | BIC/related-items/notifications integrations |
| `SF16-T08-Testing-Strategy.md` | test fixtures and coverage matrix |
| `SF16-T09-Testing-and-Deployment.md` | checklist, ADR/docs/index/state-map updates |
