## Research Summary
Indexer/API scope follows Azure AI Search indexer and filter/facet strategy for low-latency retrieval ([Microsoft Learn](https://learn.microsoft.com/en-us/azure/search/search-indexer-overview)), backend gateway aggregation for tenant and source mediation ([Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/patterns/gateway-aggregation)), and construction-domain NL search evidence for parser-assisted retrieval quality ([Automation in Construction, 2023](https://www.sciencedirect.com/science/article/abs/pii/S0926580523003278)).

# SF16-T03 — Indexer and API: `@hbc/search`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-16-Shared-Feature-Search.md`
**Decisions Applied:** D-01, D-03, D-08
**Estimated Effort:** 0.9 sprint-weeks
**Depends On:** T02

> **Doc Classification:** Canonical Normative Plan — SF16-T03 indexer/API task; sub-plan of `SF16-Search.md`.

---

## Objective

Define manifest-driven indexer document transformation, parser mediation, and backend query APIs.

---

## Indexer Scope

- transform `ISearchableRecord` from `ISearchableModule` manifests to index schema
- include `dataSource` and `provenance` in index payload
- merge/upload behavior
- delete behavior on source record removal
- BIC fields indexed as filterable dimensions with dedicated scoring profile notes

## API Scope

- `SearchApi.query(query)`
- `SavedSearchApi.list/save/delete`
- parser handoff through `SearchQueryParser` Function for Standard+/Expert NL queries
- all client calls route through backend proxy

---

## Verification Commands

```bash
pnpm --filter @hbc/search test -- SearchIndexer SearchApi SearchQueryParser
pnpm --filter @hbc/search check-types
```
