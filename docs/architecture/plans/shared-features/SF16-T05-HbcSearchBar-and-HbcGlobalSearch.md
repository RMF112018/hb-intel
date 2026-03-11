# SF16-T05 — `HbcSearchBar` and `HbcGlobalSearch`: `@hbc/search`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-16-Shared-Feature-Search.md`
**Decisions Applied:** D-04, D-07
**Estimated Effort:** 0.8 sprint-weeks
**Depends On:** T04

> **Doc Classification:** Canonical Normative Plan — SF16-T05 entry search UI task; sub-plan of `SF16-Search.md`.

---

## Objective

Define command-trigger and inline search entry surfaces.

---

## Components

- `HbcSearchBar`: scoped inline search with top-5 typeahead
- `HbcGlobalSearch`: global ⌘K/Ctrl+K overlay with keyboard navigation

Behavior: fast typeahead, grouped results, esc-to-close, enter-to-open.

---

## Verification Commands

```bash
pnpm --filter @hbc/search test -- HbcSearchBar HbcGlobalSearch
pnpm --filter @hbc/search build
```
