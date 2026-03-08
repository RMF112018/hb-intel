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
- **Instant preview** of matching records without navigation
- **Keyboard-first UX** for power users (⌘K global search trigger)
- **Saved searches** for frequently used complex queries

---

## Mold Breaker Rationale

The ux-mold-breaker.md Signature Solution #15 (Operations-Grade Search) specifies: "Search is not a filter — it is a command interface. Users should be able to find any record, document, or status in under 5 seconds from anywhere in the platform." Operating Principle §7.8 (Operations-grade) requires that search be fast enough (<500ms) and comprehensive enough (all record types, all documents) to serve as the primary navigation method for power users.

The con-tech UX study §14 documents that Procore's search is module-scoped and document-heavy — it finds documents well but finds project records poorly. No platform provides BIC-state-aware search (filtering by "show me all items assigned to me across all modules that are overdue"). `@hbc/search` is the first construction platform search that treats accountability as a searchable dimension.

---

## Azure Cognitive Search Architecture

```
HB Intel Records (SharePoint Lists)
    → Azure Functions Indexer (triggered on record change)
    → Azure Cognitive Search Index
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
│   ├── indexer/
│   │   └── SearchIndexer.ts              # Azure Functions indexer logic
│   ├── api/
│   │   └── SearchApi.ts                  # query API wrapper
│   ├── hooks/
│   │   ├── useSearch.ts                  # manages query state + results
│   │   ├── useGlobalSearch.ts            # ⌘K trigger + recent searches
│   │   └── useSavedSearches.ts           # save/load/delete named searches
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

The primary power-user search interface. Triggered by ⌘K (Mac) or Ctrl+K (Windows) from anywhere in the platform.

```typescript
interface HbcGlobalSearchProps {
  onResultSelect: (result: ISearchResult) => void;
}
```

**Visual behavior:**
- Full-screen overlay with centered search modal
- Type-ahead: results update as user types (debounced 200ms)
- Recent searches shown before first keystroke
- Results grouped by module with module icon
- Keyboard navigation: arrow keys to select, Enter to navigate, Esc to dismiss
- BIC state indicators on results that have ownership data
- "See all results" link → `HbcSearchResults` full page

### `HbcSearchBar` — Inline Module Search

```typescript
interface HbcSearchBarProps {
  /** Pre-scoped to a module or record type */
  scope?: { modules?: string[]; recordTypes?: string[] };
  placeholder?: string;
  onSearch?: (query: ISearchQuery) => void;
  onResultSelect?: (result: ISearchResult) => void;
}
```

**Visual behavior:**
- Standard search input with search icon
- Type-ahead dropdown showing top 5 results
- "Advanced search" link → `HbcSearchResults` with scope pre-applied

### `HbcSearchResults` — Full Results Page

```typescript
interface HbcSearchResultsProps {
  initialQuery?: ISearchQuery;
}
```

**Visual behavior:**
- Left panel: `HbcSearchFacets` for filtering
- Right panel: paginated result list with relevance-ordered cards
- Each result card: record type badge, module icon, title, excerpt (highlighted match), status, BIC state
- Sort controls: Relevance / Newest / Oldest / Status
- "Save this search" CTA (for `useSavedSearches`)

### `HbcSearchFacets` — Filter Panel

```typescript
interface HbcSearchFacetsProps {
  facets: ISearchFacets;
  query: ISearchQuery;
  onQueryChange: (query: ISearchQuery) => void;
}
```

**Visual behavior:**
- Checkbox groups for: Module, Record Type, Status
- Toggle filters: "Only overdue", "Only blocked", "Assigned to me"
- Date range pickers for Created / Updated
- "Clear all filters" link

---

## Indexing Strategy

Records are indexed via Azure Functions triggered on SharePoint list item change events:

```typescript
// SearchIndexer.ts
export async function indexRecord(record: ISearchableRecord): Promise<void> {
  const document = {
    id: record.id,
    recordType: record.recordType,
    module: record.module,
    title: record.title,
    fullText: buildFullText(record), // concatenate all searchable fields
    status: record.status,
    responsiblePartyUserId: record.bicState?.currentOwner?.userId,
    responsiblePartyName: record.bicState?.currentOwner?.displayName,
    isBlocked: record.bicState?.isBlocked ?? false,
    isOverdue: record.bicState?.isOverdue ?? false,
    // ... other fields
  };
  await searchClient.mergeOrUploadDocuments([document]);
}
```

Each module registers its records for indexing by implementing `ISearchableRecord`:

```typescript
export interface ISearchableRecord {
  id: string;
  recordType: string;
  module: string;
  title: string;
  status?: string;
  bicState?: IBicNextMoveState;
  searchableFields: Record<string, string>; // field key → text value for full-text indexing
  tags?: string[];
  projectId?: string;
  href: string;
}
```

---

## Saved Searches

Power users can save frequently used complex queries:

```typescript
// Example: save a search for "all overdue items assigned to me"
await SavedSearchApi.save({
  name: 'My Overdue Items',
  query: {
    term: '',
    responsiblePartyUserId: currentUser.id,
    isOverdue: true,
    sortBy: 'date-asc',
  },
});
```

Saved searches are stored per user in `HbcSavedSearches` SharePoint list and surfaced in `HbcGlobalSearch` "Recent & Saved" section.

---

## Integration Points

| Package | Integration |
|---|---|
| `@hbc/bic-next-move` | BIC state (`isBlocked`, `isOverdue`, `responsiblePartyUserId`) are searchable/filterable dimensions |
| `@hbc/complexity` | Essential: search bar only; Standard: full results with facets; Expert: all search dimensions + saved searches |
| `@hbc/related-items` | Search results link to related items panel of found records |
| `@hbc/notification-intelligence` | Search for "items assigned to me" returns same results as My Work Feed; complementary navigation paths |

---

## SPFx Constraints

- `HbcSearchBar` available in SPFx Application Customizer (global header)
- `HbcGlobalSearch` (⌘K overlay) available in SPFx contexts
- `HbcSearchResults` as full-page SPFx webpart
- All search queries route through Azure Functions backend — no direct Azure Cognitive Search calls from client

---

## Priority & ROI

**Priority:** P2 — High-value for daily use; not a core workflow blocker; ship after core modules are stable
**Estimated build effort:** 5–6 sprint-weeks (Azure Cognitive Search setup, indexer, four components, saved searches, ⌘K integration)
**ROI:** Reduces record-finding time from 2-3 minutes (navigate + filter) to under 5 seconds; makes BIC-state search a unique differentiator; enables power user navigation that no construction platform currently offers

---

## Definition of Done

- [ ] Azure Cognitive Search index deployed with full schema
- [ ] Azure Functions indexer triggered on SharePoint list changes for all record types
- [ ] `SearchApi.query()` implemented with full faceting and filtering
- [ ] `useSearch` manages query state, debounced fetching, result normalization
- [ ] `useGlobalSearch` manages ⌘K trigger, recent searches, keyboard navigation
- [ ] `useSavedSearches` loads, saves, and deletes named searches
- [ ] `HbcGlobalSearch` ⌘K overlay with type-ahead, grouping, keyboard nav
- [ ] `HbcSearchBar` inline module-scoped search with type-ahead dropdown
- [ ] `HbcSearchResults` full results page with pagination and sort
- [ ] `HbcSearchFacets` checkbox groups for module/type/status + toggle filters
- [ ] All Phase 7 record types registered for indexing (BD, Estimating, Project Hub, Admin)
- [ ] BIC state dimensions indexed and filterable
- [ ] `@hbc/complexity` integration: full search UI in Standard+; saved searches in Expert
- [ ] Performance: search results return in <500ms (P95)
- [ ] Unit tests on indexer record transformation and query building
- [ ] E2E test: create BD scorecard → wait for index → search by project name → result appears

---

## ADR Reference

Create `docs/architecture/adr/0025-search-azure-cognitive-search.md` documenting the Azure Cognitive Search index schema, the SharePoint list change event indexing strategy, the BIC-state-as-searchable-dimension design, and the ⌘K command search UX model.
