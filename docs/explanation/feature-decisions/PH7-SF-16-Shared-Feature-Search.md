# PH7-SF-16: `@hbc/search` — Operations-Grade Cross-Module Search (Azure Cognitive Search)

**Priority Tier:** 3 — Intelligence Layer (significantly enhances usability; not a core workflow blocker)
**Package:** `packages/search/`
**Interview Decision:** Q24 — Option B confirmed; Azure Cognitive Search as the index layer
**Mold Breaker Source:** UX-MB §15 (Operations-Grade Search); ux-mold-breaker.md Signature Solution #15; con-tech-ux-study §14 (Search capability gaps across platforms)

---

## Problem Solved

Construction project data is characterized by high volume, high specificity, and high recall requirements. A PM needs to find "the RFP for the Riverside Medical Tower project" immediately — not after navigating through three module menus. A Director needs to find every project where "soil conditions" caused a constraint. An Estimating Coordinator needs to find all projects in a specific county within a certain bid value range.

Current construction platforms provide at best per-module search that only covers that module's records. Cross-module search — finding records across BD, Estimating, Project Hub, and documents in a single query — is unavailable. The con-tech UX study §14 identifies search as one of the weakest capabilities across all seven platforms.

`@hbc/search` provides:
- **Cross-module full-text search** across all HB Intel record types and documents
- **Faceted filtering** by module, record type, date range, status, responsible party, BIC state
- **AI-assisted natural-language parsing** (Standard+ and Expert tiers)
- **Instant preview** of matching records without navigation
- **Keyboard-first UX** for power users (⌘K global search trigger)
- **Saved searches** with governance and audit controls
- **Seamless deep integration** with project canvas, related-items panels, and BIC state
- **Provenance transparency** and hybrid data-source support (Expert tier)

---

## Mold Breaker Rationale

The ux-mold-breaker.md Signature Solution #15 (Operations-Grade Search) specifies: "Search is not a filter — it is a command interface. Users should be able to find any record, document, or status in under 5 seconds from anywhere in the platform." Operating Principle §7.8 (Operations-grade) requires that search be fast enough (<500 ms) and comprehensive enough (all record types, all documents) to serve as the primary navigation method for power users.

The con-tech UX study §14 documents that Procore's search is module-scoped and document-heavy — it finds documents well but finds project records poorly. No platform provides BIC-state-aware search (filtering by "show me all items assigned to me across all modules that are overdue"). `@hbc/search` is the first construction platform search that treats accountability as a searchable dimension, delivers true Search-First navigation, offline resilience, and provenance transparency.

---

## Azure Cognitive Search Architecture

```
HB Intel Records (SharePoint Lists + Microsoft Graph)
    → Azure Functions Indexer (triggered on record change + manifest-driven discovery)
    → Azure Cognitive Search Index
    → SearchQueryParser Function (AI natural-language to structured query)
    → @hbc/search query API (Azure Functions)
    → HbcSearchBar / HbcSearchResults
```

### Index Schema

The Azure Cognitive Search index maintains a unified record across all module types:

| Field | Type | Searchable | Filterable | Facetable |
|---|---|---|---|---|
| `id` | String | No | Yes | No |
| `recordType` | String | No | Yes | Yes |
| `module` | String | No | Yes | Yes |
| `title` | String | Yes | No | No |
| `fullText` | String | Yes | No | No |
| `status` | String | No | Yes | Yes |
| `responsiblePartyUserId` | String | No | Yes | No |
| `responsiblePartyName` | String | Yes | Yes | No |
| `isBlocked` | Boolean | No | Yes | Yes |
| `isOverdue` | Boolean | No | Yes | Yes |
| `projectId` | String | No | Yes | No |
| `createdAt` | DateTimeOffset | No | Yes | Yes |
| `updatedAt` | DateTimeOffset | No | Yes | No |
| `tags` | Collection(String) | Yes | Yes | Yes |
| `sharepointUrl` | String | No | No | No |
| `dataSource` | String | No | Yes | Yes |
| `provenance` | String | No | Yes | No |

Dedicated BIC scoring profiles and pre-computed composite fields enable sub-500 ms “My Work” queries.

---

## Interface Contract

```typescript
// packages/search/src/types/ISearch.ts

export interface ISearchQuery {
  /** Free-text search term */
  term: string;
  /** Record type filter (null = all) */
  recordTypes?: string[];
  /** Module filter (null = all) */
  modules?: string[];
  /** Status filter */
  statuses?: string[];
  /** Filter by responsible party userId */
  responsiblePartyUserId?: string;
  /** Filter to only blocked items */
  isBlocked?: boolean;
  /** Filter to only overdue items */
  isOverdue?: boolean;
  /** Date range filter */
  createdAfter?: string;
  createdBefore?: string;
  /** Project scope */
  projectId?: string;
  /** Result page */
  page?: number;
  pageSize?: number;
  /** Sort: 'relevance' | 'date-desc' | 'date-asc' | 'status' */
  sortBy?: string;
}

export interface ISearchResult {
  recordId: string;
  recordType: string;
  module: string;
  title: string;
  status?: string;
  responsiblePartyName?: string;
  isBlocked?: boolean;
  isOverdue?: boolean;
  /** Highlighted excerpt showing the matching text */
  excerpt?: string;
  /** Navigation URL to the full record */
  href: string;
  /** Canvas-aware deep link (auto-populated when inside project canvas) */
  canvasDeepLink?: string;
  /** Direct link to pre-filtered related-items panel */
  relatedItemsDeepLink?: string;
  /** Data provenance for transparency (Expert tier) */
  provenance?: string;
  /** BIC state (if available for this record type) */
  bicState?: IBicNextMoveState;
  score: number; // Azure Cognitive Search relevance score
}

export interface ISearchResponse {
  results: ISearchResult[];
  totalCount: number;
  facets: ISearchFacets;
  query: ISearchQuery;
}

export interface ISearchFacets {
  recordTypes: Array<{ value: string; count: number }>;
  modules: Array<{ value: string; count: number }>;
  statuses: Array<{ value: string; count: number }>;
}
```

---

## Package Architecture

```
packages/search/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── types/
│   │   ├── ISearch.ts
│   │   └── index.ts
│   ├── parser/
│   │   └── SearchQueryParser.ts          # tenant-scoped GPT-4o-mini NL → ISearchQuery
│   ├── indexer/
│   │   └── SearchIndexer.ts              # manifest-driven Azure Functions indexer
│   ├── api/
│   │   └── SearchApi.ts                  # query API wrapper
│   ├── hooks/
│   │   ├── useSearch.ts                  # manages query state + results
│   │   ├── useGlobalSearch.ts            # ⌘K trigger + recent searches + quick-jump cards
│   │   └── useSavedSearches.ts           # save/load/delete + versioned governance
│   ├── governance/
│   │   └── SearchGovernance.ts           # admin audit panel
│   └── components/
│       ├── HbcSearchBar.tsx              # inline search input with instant results
│       ├── HbcGlobalSearch.tsx           # ⌘K modal search overlay
│       ├── HbcSearchResults.tsx          # full results page with facets
│       ├── HbcSearchFacets.tsx           # faceted filter panel
│       └── index.ts
```

---

## Component Specifications

### `HbcGlobalSearch` — ⌘K Command Search Overlay

Full-screen overlay with AI parsing (Standard+), quick-filter BIC chips, context-aware quick-jump cards, provenance badges (Expert tier), and Search-First Mode auto-trigger support.

### `HbcSearchBar` — Inline Module Search

Persistent high-visibility bar in global header (Search-First Mode). Type-ahead with top results and “View Related” option.

### `HbcSearchResults` — Full Results Page

Left panel: `HbcSearchFacets`; right panel: paginated cards with “View Related” button (opens `@hbc/related-items` pre-filtered), provenance badge (Expert), and canvas-aware navigation.

### `HbcSearchFacets` — Filter Panel

Includes BIC quick-filter chips and provenance-aware controls (Expert tier).

---

## Indexing Strategy

Declarative `ISearchableModule` manifest pattern. Each package exports its record types, mapping functions, searchable fields, and `dataSource` ("SharePointList" | "MicrosoftGraph" | "Hybrid"). Dynamic discovery and automatic registration. `SearchIndexer.ts` uses Azure Functions triggered on change events.

```typescript
// SearchIndexer.ts
export async function indexRecord(record: ISearchableRecord): Promise<void> {
  const document = { /* ... */ dataSource: record.dataSource, provenance: record.provenance };
  await searchClient.mergeOrUploadDocuments([document]);
}
```

---

## Saved Searches

Treated as versioned records via `@hbc/versioned-record`. `HbcSavedSearches` list includes audit columns (`lastExecutedAt`, `executionCount`, `sharedWithGroupId`, `isPromotedByAdmin`). Expert-tier governance panel provides usage analytics, promote-to-team/tenant, and soft-delete.

---

## Integration Points

| Package | Integration |
|---|---|
| `@hbc/bic-next-move` | BIC state as first-class searchable/filterable dimension with scoring profiles |
| `@hbc/complexity` | Progressive disclosure of AI parsing, facets, saved searches, Search-First Mode, governance |
| `@hbc/related-items` | Direct deep-links from every result to pre-filtered relationship panels |
| `@hbc/project-canvas` | Automatic projectId scoping + canvasDeepLink support |
| `@hbc/versioned-record` | Saved searches and governance |
| `@hbc/notification-intelligence` | Background sync for offline cache + performance alerts |
| `@hbc/auth` | Tenant-scoped parser and governance visibility |

---

## SPFx Constraints

- Persistent `HbcSearchBar` in SPFx Application Customizer (Search-First Mode)
- `HbcGlobalSearch` (⌘K overlay) available in SPFx contexts
- `HbcSearchResults` as full-page SPFx webpart
- All calls route through Azure Functions — no direct Azure Cognitive Search calls from client

---

## Priority & ROI

**Priority:** P2 — High-value for daily use; not a core workflow blocker; ship after core modules are stable  
**Estimated build effort:** 5–6 sprint-weeks (Azure Cognitive Search setup, indexer, parser, four components, saved searches, ⌘K integration, offline cache)  
**ROI:** Reduces record-finding time from 2-3 minutes to under 5 seconds; makes BIC-state search, Search-First navigation, and provenance transparency unique differentiators; eliminates field-versus-office gap with offline resilience.

---

## Definition of Done

- [ ] Azure Cognitive Search index deployed with full schema (including dataSource/provenance and BIC scoring profiles)
- [ ] Manifest-driven Azure Functions indexer with dynamic discovery
- [ ] Tenant-scoped `SearchQueryParser` Function with AI natural-language support
- [ ] `SearchApi.query()` implemented with full faceting, provenance, and <500 ms P95
- [ ] `useSearch`, `useGlobalSearch`, `useSavedSearches` updated with all new capabilities
- [ ] `HbcGlobalSearch` with AI parsing, BIC chips, quick-jump cards, provenance (Expert)
- [ ] `HbcSearchBar` with persistent Search-First Mode
- [ ] `HbcSearchResults` with “View Related” buttons and canvas deep-links
- [ ] `HbcSearchFacets` with BIC quick-filters
- [ ] All Phase 7 record types registered via manifests
- [ ] Saved searches as versioned records with full governance panel
- [ ] Hybrid offline-first strategy with IndexedDB + background sync
- [ ] Search-First Mode configuration in Expert governance panel
- [ ] Performance monitoring via Application Insights + alerts
- [ ] `@hbc/complexity` integration across all tiers
- [ ] Unit tests on parser, manifest registration, and query building
- [ ] E2E test: create record → index → natural-language search → result with provenance and related-items link

---

## ADR Reference

Create `docs/architecture/adr/0104-search-azure-cognitive-search.md` documenting the Azure Cognitive Search index schema, the manifest-driven indexing strategy, BIC-state-as-searchable-dimension design, AI query parser, Search-First navigation model, offline resilience, provenance transparency, and governance controls.

---
