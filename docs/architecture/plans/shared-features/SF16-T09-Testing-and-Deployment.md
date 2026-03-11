# SF16-T09 — Testing and Deployment: `@hbc/search`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-16-Shared-Feature-Search.md`
**Decisions Applied:** All D-01 through D-10
**Estimated Effort:** 0.55 sprint-weeks
**Depends On:** T01–T08

> **Doc Classification:** Canonical Normative Plan — SF16-T09 testing/deployment task; sub-plan of `SF16-Search.md`.

---

## Objective

Finalize `@hbc/search` with SF11-grade documentation/deployment closure requirements (ADR template, adoption guide, API reference, README conformance, ADR index update, blueprint progress comment, and current-state-map updates).

---

## 3-Line Plan

1. Complete tests for indexer/query hooks/components/facets/saved searches.
2. Pass all mechanical enforcement gates with ≥95% coverage.
3. Publish ADR-0105 and all required documentation/state-map/index updates.

---

## Pre-Deployment Checklist (30 items)

### Architecture & Boundary Verification
- [ ] client does not call Azure Cognitive Search directly
- [ ] backend proxy routing enforced for all search queries
- [ ] `@hbc/search` has zero imports of `packages/features/*`
- [ ] app-shell-safe component usage validated
- [ ] indexing hooks do not bypass governance middleware
- [ ] boundary grep checks return zero prohibited matches

### Type Safety
- [ ] zero TypeScript errors: `pnpm --filter @hbc/search check-types`
- [ ] query/result/facet contracts enforced end-to-end
- [ ] searchable-record index transform contract stable
- [ ] saved-search serialization contract stable

### Build & Package
- [ ] package build succeeds
- [ ] runtime/testing entrypoints emitted
- [ ] testing sub-path excluded from production bundle
- [ ] exports resolve in consuming modules
- [ ] turbo build with indexing modules succeeds

### Tests
- [ ] all tests pass
- [ ] coverage thresholds met (lines/branches/functions/statements ≥95)
- [ ] indexer/query/facet tests complete
- [ ] hook tests for debounce/keyboard state complete
- [ ] component tests for search surfaces complete
- [ ] create→index→search E2E scenario passing

### Storage/API (Search Index + Query)
- [ ] Azure index schema validated
- [ ] index update on record change validated
- [ ] facet counts and filter behavior validated
- [ ] saved search persistence validated

### Integration
- [ ] BIC searchable dimensions validated
- [ ] related-items deep-link integration validated
- [ ] notification-intelligence alignment validated
- [ ] module indexing registrations validated

### Documentation
- [ ] `docs/architecture/adr/ADR-0105-search-azure-cognitive-search.md` written and accepted
- [ ] `docs/how-to/developer/search-adoption-guide.md` written
- [ ] `docs/reference/search/api.md` written
- [ ] `packages/search/README.md` conformance verified
- [ ] `docs/README.md` ADR index updated with ADR-0105 entry
- [ ] `current-state-map.md §2` updated with SF16 and ADR-0105 linkage

---

## ADR-0105: Search Azure Cognitive Search Primitive

**File:** `docs/architecture/adr/ADR-0105-search-azure-cognitive-search.md`

```markdown
# ADR-0105 — Search Azure Cognitive Search Primitive

**Status:** Accepted
**Date:** 2026-03-11
**Deciders:** HB Intel Architecture Team
**Supersedes:** None
**Note:** Source spec PH7-SF-16 referenced ADR-0025. Canonical ADR number for SF16 is ADR-0105.

## Context

Cross-module discoverability is weak without a unified index and fast faceted retrieval.

## Decisions

### D-01 — Azure Search Backend
Use Azure Cognitive Search as the unified index layer.

### D-02 — Query Contract
Use typed query/result/facet contracts with explicit filters and sorts.

### D-03 — Indexing Strategy
Update index via backend indexer on record change events.

### D-04 — Search UX Model
Support command overlay + inline + full results page.

### D-05 — Facets and Toggles
Require module/type/status facets and blocked/overdue/assigned toggles.

### D-06 — Saved Searches
Persist named saved searches per user.

### D-07 — Complexity Behavior
Essential minimal; Standard full; Expert advanced metadata/saved search emphasis.

### D-08 — Tenant Boundary
No direct client search-index calls; backend proxy only.

### D-09 — Integration Baseline
BIC fields searchable/filterable; related-items deep-link integration required.

### D-10 — Testing Sub-Path
Expose canonical fixtures from `@hbc/search/testing`.

## Compliance

This ADR is locked and can only be superseded by explicit follow-up ADR.
```

---

## Developer Adoption Guide

**File:** `docs/how-to/developer/search-adoption-guide.md`

Required sections:

1. making records searchable (`ISearchableRecord` mapping)
2. registering index transforms and update triggers
3. using inline/global search components
4. using full results/facets and saved-search hooks
5. applying BIC/assignment dimensions in index mapping
6. using testing fixtures from `@hbc/search/testing`

---

## API Reference

**File:** `docs/reference/search/api.md`

Must include export table entries for:

- `ISearchQuery`
- `ISearchResult`
- `ISearchResponse`
- `ISearchFacets`
- `SearchApi`
- `SavedSearchApi`
- `useSearch`
- `useGlobalSearch`
- `useSavedSearches`
- `HbcSearchBar`
- `HbcGlobalSearch`
- `HbcSearchResults`
- `HbcSearchFacets`
- testing exports (`createMockSearchQuery`, `createMockSearchResult`, `createMockSearchResponse`, `mockSearchFacets`)

---

## Package README Conformance

**File:** `packages/search/README.md`

Verify README contains:

- operations-grade search overview
- quick-start setup
- indexer + query architecture summary
- command search + facets + saved-search behavior summary
- exports table
- architecture boundary rules
- links to SF16 master plan, T09, ADR-0105, adoption guide, API reference

---

## ADR Index Update

**File:** `docs/README.md`

Append ADR row:

```markdown
| [ADR-0105](architecture/adr/ADR-0105-search-azure-cognitive-search.md) | Search Azure Cognitive Search Primitive | Accepted | 2026-03-11 |
```

---

## current-state-map Update Requirement

**File:** `docs/architecture/blueprint/current-state-map.md`

At implementation closure, update §2 with:

- SF16 shared-feature plans row
- ADR-0105 row linkage
- optional doc rows if authored in same pass:
  - `docs/how-to/developer/search-adoption-guide.md`
  - `docs/reference/search/api.md`
- update next unreserved ADR number after ADR-0105 allocation

---

## Final Verification Commands

```bash
# Mechanical enforcement gates
pnpm turbo run build --filter @hbc/search...
pnpm turbo run lint --filter @hbc/search...
pnpm --filter @hbc/search check-types
pnpm --filter @hbc/search test --coverage

# Boundary checks
grep -r "from 'packages/features/" packages/search/src/
grep -r "https://" packages/search/src/ | grep -v "Azure Functions endpoint constants"

# Documentation checks
test -f docs/architecture/adr/ADR-0105-search-azure-cognitive-search.md
test -f docs/how-to/developer/search-adoption-guide.md
test -f docs/reference/search/api.md
test -f packages/search/README.md
```

---

## Blueprint Progress Comment

Append to `SF16-Search.md` after all gates pass:

```markdown
<!-- IMPLEMENTATION PROGRESS & NOTES
SF16 completed: {DATE}
T01–T09 implemented.
All four mechanical enforcement gates passed.
ADR created: docs/architecture/adr/ADR-0105-search-azure-cognitive-search.md
Documentation added:
  - docs/how-to/developer/search-adoption-guide.md
  - docs/reference/search/api.md
  - packages/search/README.md
docs/README.md ADR index updated: ADR-0105 row appended.
current-state-map.md §2 updated with SF16 and ADR-0105 rows.
-->
```
