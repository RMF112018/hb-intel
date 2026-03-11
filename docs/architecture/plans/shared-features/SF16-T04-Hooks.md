# SF16-T04 — Hooks: `@hbc/search`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-16-Shared-Feature-Search.md`
**Decisions Applied:** D-04, D-05, D-06, D-07
**Estimated Effort:** 0.75 sprint-weeks
**Depends On:** T03

> **Doc Classification:** Canonical Normative Plan — SF16-T04 hooks task; sub-plan of `SF16-Search.md`.

---

## Objective

Define hook behaviors for querying, command-search UX state, and saved searches.

---

## Hook Contracts

- `useSearch(initialQuery?)`
- `useGlobalSearch()`
- `useSavedSearches()`

Required behaviors: debounce, keyboard navigation state, recent/saved history, query serialization.

---

## Verification Commands

```bash
pnpm --filter @hbc/search test -- useSearch useGlobalSearch useSavedSearches
pnpm --filter @hbc/search check-types
```
