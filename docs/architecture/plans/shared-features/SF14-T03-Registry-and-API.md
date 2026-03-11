<!-- DIFF-SUMMARY: Replaced one-way registration with bidirectional pair + AI hook registration; updated API to batched summaries with hybrid/BIC enrichment -->

# SF14-T03 — Registry and API: `@hbc/related-items`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-14-Shared-Feature-Related-Items.md`
**Decisions Applied:** D-01, D-03, D-04
**Estimated Effort:** 0.5 sprint-weeks
**Depends On:** T02

> **Doc Classification:** Canonical Normative Plan — SF14-T03 registry/API task; sub-plan of `SF14-Related-Items.md`.

---

## Objective

Implement bidirectional relationship registration, AI suggestion hook registration, and batched backend-backed related-item summary retrieval.

---

## Registry

- `RelationshipRegistry.registerBidirectionalPair(forwardDefinition, reverseOverrides?)`
- `RelationshipRegistry.registerAISuggestionHook(hookId, resolver)`
- `RelationshipRegistry.getBySourceRecordType(recordType)`
- duplicate definition policy: reject by unique composite key including direction and source/target tuple
- governance metadata persisted with relationship pair for sorting, collapse, and resolver policy

## API

- `RelatedItemsApi.getRelatedItems(sourceRecordType, sourceRecordId, sourceRecord, role)`
- resolves IDs via registered definitions
- batches summary lookup through `/api/related-items/summaries` Azure Function route
- applies resolverStrategy routing (`sharepoint` | `graph` | `hybrid`) and BIC enrichment
- applies role visibility filters and returns AI suggestion-group payloads when enabled

---

## Verification Commands

```bash
pnpm --filter @hbc/related-items test -- RelationshipRegistry RelatedItemsApi
pnpm --filter @hbc/related-items check-types
```
