# SF16-T03 — Indexer and API: `@hbc/search`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-16-Shared-Feature-Search.md`
**Decisions Applied:** D-01, D-03, D-08
**Estimated Effort:** 0.9 sprint-weeks
**Depends On:** T02

> **Doc Classification:** Canonical Normative Plan — SF16-T03 indexer/API task; sub-plan of `SF16-Search.md`.

---

## Objective

Define Azure indexer document transformation and backend query APIs.

---

## Indexer Scope

- transform `ISearchableRecord` to index schema
- merge/upload behavior
- delete behavior on source record removal
- BIC fields indexed as filterable dimensions

## API Scope

- `SearchApi.query(query)`
- `SavedSearchApi.list/save/delete`
- all client calls route through backend proxy

---

## Verification Commands

```bash
pnpm --filter @hbc/search test -- SearchIndexer SearchApi
pnpm --filter @hbc/search check-types
```
