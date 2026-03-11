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
pnpm --filter @hbc/related-items build
```

---

## SF14-T04 Success Criteria

- [x] `useRelatedItems` implemented as canonical orchestration hook over T03 API (`getRelatedItems`) with strict T04 contract shape.
- [x] Deterministic loading/success/empty/error behavior implemented, including missing source-id/type fast fallback.
- [x] Deterministic sorting/grouping implemented with typed `groups` and `aiSuggestions` derived output.
- [x] Role/governance-aware retrieval path preserved via role passthrough to T03 API.
- [x] Offline stale-safe fallback implemented via `@hbc/session-state` draft cache (`saveDraft`/`loadDraft`).
- [x] Hook tests implemented for loading/success/empty/error, role passthrough, AI inclusion, fallback paths, and derived-state determinism.
- [x] Hook barrel/root exports remain stable and compile-safe.

---

<!-- IMPLEMENTATION PROGRESS & NOTES
SF14-T04 completed: 2026-03-11
- Implemented `useRelatedItems` with T04 contract:
  - input: { sourceRecordType, sourceRecordId, sourceRecord, currentUserRole, showBicState? }
  - output: { items, groups, aiSuggestions, isLoading, error }
- Added deterministic derived-state behavior:
  - stable sorting (relationshipLabel -> label -> recordId)
  - grouped output by relationshipLabel
  - AI suggestion derivation by aiConfidence / AI relationship label
  - optional BIC hiding when `showBicState === false`
- Added stale-safe cache fallback using `@hbc/session-state` DraftStore (`related-items:{sourceType}:{sourceId}:{role}` key pattern).
- Added runtime dependency: `@hbc/session-state` (workspace) in `packages/related-items/package.json`.
- Added hook tests: `packages/related-items/src/hooks/useRelatedItems.test.ts`.
- Verification evidence (all pass):
  - pnpm --filter @hbc/related-items test -- useRelatedItems
  - pnpm --filter @hbc/related-items check-types
  - pnpm --filter @hbc/related-items build
Next task: SF14-T05 (HbcRelatedItemsPanel)
-->
