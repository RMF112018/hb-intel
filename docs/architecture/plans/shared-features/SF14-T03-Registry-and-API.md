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
pnpm --filter @hbc/related-items build
```

---

## SF14-T03 Success Criteria

- [x] Bidirectional relationship registration implemented with deterministic reverse creation.
- [x] AI suggestion hook registration implemented with duplicate and resolver validation.
- [x] Deterministic source-based retrieval implemented (`getBySourceRecordType`) with compatibility alias (`getRelationships`).
- [x] Batched related-item retrieval API implemented with strategy routing, role visibility filtering, AI suggestion inclusion, and non-fatal BIC enrichment.
- [x] Registry/API unit tests added for duplicate handling, validation rules, deterministic retrieval, batching, filtering, AI suggestions, and partial-failure safety.

---

<!-- IMPLEMENTATION PROGRESS & NOTES
SF14-T03 completed: 2026-03-11
- Implemented registry singleton store with bidirectional pair registration, composite duplicate protection, governance validation, deterministic sorting, and AI suggestion hook resolver registry.
- Implemented RelatedItemsApi.getRelatedItems(sourceRecordType, sourceRecordId, sourceRecord, role) with resolver-strategy batching to /api/related-items/summaries, role/governance filtering, non-fatal /api/related-items/bic-enrichment pass, and AI hook suggestion expansion.
- Added tests:
  - packages/related-items/src/registry/RelationshipRegistry.test.ts
  - packages/related-items/src/api/RelatedItemsApi.test.ts
- Updated testing contract compatibility:
  - packages/related-items/testing/mockRelationshipRegistry.ts
- Verification evidence (all pass):
  - pnpm --filter @hbc/related-items test -- RelationshipRegistry RelatedItemsApi
  - pnpm --filter @hbc/related-items check-types
  - pnpm --filter @hbc/related-items build
Next task: SF14-T04 (Hooks)
-->
