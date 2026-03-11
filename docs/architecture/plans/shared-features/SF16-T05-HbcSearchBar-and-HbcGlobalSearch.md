## Research Summary
Entry UX design follows Azure search response/facet interaction guidance ([Microsoft Learn](https://learn.microsoft.com/en-us/azure/search/search-indexer-overview)), command-surface aggregation and backend orchestration practices ([Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/patterns/gateway-aggregation)), and construction NLP assistant patterns for natural-language search prompts ([Automation in Construction, 2023](https://www.sciencedirect.com/science/article/abs/pii/S0926580523003278)).

# SF16-T05 — `HbcSearchBar` and `HbcGlobalSearch`: `@hbc/search`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-16-Shared-Feature-Search.md`
**Decisions Applied:** D-04, D-07
**Estimated Effort:** 0.8 sprint-weeks
**Depends On:** T04

> **Doc Classification:** Canonical Normative Plan — SF16-T05 entry search UI task; sub-plan of `SF16-Search.md`.

---

## Objective

Define command-trigger and inline search entry surfaces with Search-First Mode behavior.

---

## Components

- `HbcSearchBar`: persistent Search-First header bar with top-5 typeahead, BIC quick chips, and “View Related” affordance
- `HbcGlobalSearch`: global ⌘K/Ctrl+K overlay with AI parsing, quick-jump cards, and Expert provenance badges

Behavior: fast typeahead, grouped results, esc-to-close, enter-to-open, and consistent deep-link routing.

---

## Verification Commands

```bash
pnpm --filter @hbc/search test -- HbcSearchBar HbcGlobalSearch
pnpm --filter @hbc/search build
```
