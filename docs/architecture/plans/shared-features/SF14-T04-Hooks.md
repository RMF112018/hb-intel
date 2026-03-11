<!-- DIFF-SUMMARY: Expanded useRelatedItems behavior for priority/role relevance, AI group inputs, and offline caching via session-state + sharepoint-docs summaries -->

# SF14-T04 — Hooks: `@hbc/related-items`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-14-Shared-Feature-Related-Items.md`
**Decisions Applied:** D-05, D-06, D-07
**Estimated Effort:** 0.35 sprint-weeks
**Depends On:** T03

> **Doc Classification:** Canonical Normative Plan — SF14-T04 hooks task; sub-plan of `SF14-Related-Items.md`.

---

## Objective

Implement `useRelatedItems` to load, sort, enrich, group, and cache related records for rendering.

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
  groups: Record<string, IRelatedItem[]>;
  aiSuggestions?: IRelatedItem[];
  isLoading: boolean;
  error: string | null;
};
```

---

## Behavior

- loads data via `RelatedItemsApi.getRelatedItems`
- sorts/groups by `relationshipPriority` and role relevance metadata
- includes Expert-only AI suggestion group inputs from registered hooks
- reads/writes offline summaries via `@hbc/session-state` and `@hbc/sharepoint-docs` support path
- returns stale-safe cached summaries in PWA standalone mode when network path is unavailable

---

## Verification Commands

```bash
pnpm --filter @hbc/related-items test -- useRelatedItems
pnpm --filter @hbc/related-items check-types
```
