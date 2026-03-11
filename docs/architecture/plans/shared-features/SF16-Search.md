## Research Summary
This master plan uses Azure AI Search indexer/facet guidance for cross-source indexing and query behavior ([Microsoft Learn](https://learn.microsoft.com/en-us/azure/search/search-indexer-overview)), backend aggregation and tenant-safe API mediation patterns ([Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/patterns/gateway-aggregation)), and peer-reviewed construction-domain natural-language retrieval evidence for BIM/search workflows ([Automation in Construction, 2023](https://www.sciencedirect.com/science/article/abs/pii/S0926580523003278)).

# SF16 — `@hbc/search`: Operations-Grade Cross-Module Search (Azure Cognitive Search)

**Plan Version:** 1.1
**Date:** 2026-03-11
**Source Spec:** `docs/explanation/feature-decisions/PH7-SF-16-Shared-Feature-Search.md`
**Priority Tier:** 3 — Intelligence Layer (high-value usability accelerator)
**Estimated Effort:** 5–6 sprint-weeks
**ADR Required:** `docs/architecture/adr/0104-search-azure-cognitive-search.md`

> **Doc Classification:** Canonical Normative Plan — SF16 implementation master plan for `@hbc/search`; governs SF16-T01 through SF16-T09.

---

## Purpose

`@hbc/search` provides cross-module, faceted, keyboard-first search powered by Azure Cognitive Search, enabling users to find records/documents quickly without module-by-module navigation, with Search-First Mode, provenance visibility, and offline resilience.

---

## Locked Interview Decisions

| # | Decision | Locked Choice |
|---|---|---|
| D-01 | Index backend | Azure Cognitive Search with unified record schema + BIC scoring profiles |
| D-02 | Query contract | `ISearchQuery` with free text + facets + assignment/BIC filters |
| D-03 | Indexing path | Manifest-driven Azure Functions indexer on record changes |
| D-04 | UX model | global ⌘K/Ctrl+K command search + persistent Search-First bar + full results |
| D-05 | Faceting model | module, record type, status required; blocked/overdue/assigned + BIC chips |
| D-06 | Saved searches | versioned records with audit columns + Expert governance panel |
| D-07 | Complexity behavior | Essential: baseline search; Standard: AI parsing/facets; Expert: provenance/governance |
| D-08 | Tenant boundary | all client calls route through backend; no direct client calls to Azure Search |
| D-09 | Integration baseline | BIC dimensions indexed/filterable; related-items/project-canvas deep links |
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
│   ├── parser/
│   │   ├── SearchQueryParser.ts
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
│   ├── governance/
│   │   ├── SearchGovernance.ts
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
    ├── SearchQueryParser.test.ts
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

- [ ] Azure Cognitive Search schema includes `dataSource` and `provenance` with BIC scoring profiles
- [ ] declarative `ISearchableModule` manifest registration documented and validated
- [ ] `SearchQueryParser` Function and parser contracts documented
- [ ] query/facet/sort/saved-search/governance contracts documented
- [ ] Search-First Mode behavior and persistent header bar documented
- [ ] canvas and related-items deep-link behavior documented
- [ ] offline resilience strategy (IndexedDB + background sync) documented
- [ ] performance monitoring requirements (Application Insights + alerts) documented
- [ ] testing sub-path fixtures documented
- [ ] T09 includes SF11-grade documentation/deployment requirements
- [ ] `current-state-map.md` updated with SF16 + ADR-0104 linkage

---

## Task File Index

| File | Contents |
|---|---|
| `SF16-T01-Package-Scaffold.md` | package scaffold + README requirement |
| `SF16-T02-TypeScript-Contracts.md` | search contracts/constants |
| `SF16-T03-Indexer-and-API.md` | indexer + parser + SearchApi/SavedSearchApi contracts |
| `SF16-T04-Hooks.md` | useSearch/useGlobalSearch/useSavedSearches |
| `SF16-T05-HbcSearchBar-and-HbcGlobalSearch.md` | entry UX components + Search-First Mode |
| `SF16-T06-HbcSearchResults-and-Facets.md` | full results/facets UX + deep links + provenance |
| `SF16-T07-Reference-Integrations.md` | BIC/related-items/canvas/versioned/offline integrations |
| `SF16-T08-Testing-Strategy.md` | test fixtures and coverage matrix |
| `SF16-T09-Testing-and-Deployment.md` | checklist, ADR/docs/index/state-map updates |
