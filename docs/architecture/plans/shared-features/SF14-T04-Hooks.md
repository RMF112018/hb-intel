# SF14-T04 — Hooks: `@hbc/related-items`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-14-Shared-Feature-Related-Items.md`
**Decisions Applied:** D-05, D-06, D-07
**Estimated Effort:** 0.35 sprint-weeks
**Depends On:** T03

> **Doc Classification:** Canonical Normative Plan — SF14-T04 hooks task; sub-plan of `SF14-Related-Items.md`.

---

## Objective

Implement `useRelatedItems` to load and group related records for rendering.

---

## Hook Contract

```typescript
function useRelatedItems(params: {
  sourceRecordType: string;
  sourceRecordId: string;
  sourceRecord: unknown;
  currentUserRole: string;
  showBicState?: boolean;
}): {
  items: IRelatedItem[];
  groups: Record<RelationshipDirection, IRelatedItem[]>;
  isLoading: boolean;
  error: string | null;
};
```

---

## Behavior

- loads data via `RelatedItemsApi`
- groups by relationship direction
- applies complexity visibility expectations in consumer components

---

## Verification Commands

```bash
pnpm --filter @hbc/related-items test -- useRelatedItems
pnpm --filter @hbc/related-items check-types
```
