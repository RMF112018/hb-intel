# SF16-T08 — Testing Strategy: `@hbc/search`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-16-Shared-Feature-Search.md`
**Decisions Applied:** D-04, D-05, D-06, D-10
**Estimated Effort:** 0.5 sprint-weeks
**Depends On:** T01–T07

> **Doc Classification:** Canonical Normative Plan — SF16-T08 testing strategy task; sub-plan of `SF16-Search.md`.

---

## Objective

Define fixtures and tests for indexing, querying, filtering, keyboard UX, and saved searches.

---

## Testing Sub-Path

- `createMockSearchQuery`
- `createMockSearchResult`
- `createMockSearchResponse`
- `mockSearchFacets`

---

## Required Coverage

- indexer field mapping and BIC field projection tests
- query/facet/sort/saved-search API contract tests
- hook tests for debounce and keyboard state
- component tests for search entry and results/facets
- storybook states for command/search/results variants
- Playwright scenario for create→index→find record flow

---

## Verification Commands

```bash
pnpm --filter @hbc/search test --coverage
pnpm --filter @hbc/search storybook
pnpm exec playwright test --grep "search"
```
