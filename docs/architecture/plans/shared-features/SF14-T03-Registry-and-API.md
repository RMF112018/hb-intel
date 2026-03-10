# SF14-T03 — Registry and API: `@hbc/related-items`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-14-Shared-Feature-Related-Items.md`
**Decisions Applied:** D-01, D-03, D-04
**Estimated Effort:** 0.5 sprint-weeks
**Depends On:** T02

> **Doc Classification:** Canonical Normative Plan — SF14-T03 registry/API task; sub-plan of `SF14-Related-Items.md`.

---

## Objective

Implement relationship registration and backend-backed related-item summary retrieval.

---

## Registry

- `RelationshipRegistry.register(definitions)`
- `RelationshipRegistry.getBySourceRecordType(recordType)`
- duplicate definition policy: reject by unique composite key

## API

- `RelatedItemsApi.getRelatedItems(sourceRecordType, sourceRecordId, sourceRecord, role)`
- resolves IDs via registered definitions
- fetches summary payloads via backend
- applies role visibility filters

---

## Verification Commands

```bash
pnpm --filter @hbc/related-items test -- RelationshipRegistry RelatedItemsApi
pnpm --filter @hbc/related-items check-types
```
