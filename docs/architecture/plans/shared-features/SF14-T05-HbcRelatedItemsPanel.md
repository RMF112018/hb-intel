<!-- DIFF-SUMMARY: Updated panel behavior for priority collapse, role-aware smart-empty-state, Expert AI group, and version-chip popovers -->

# SF14-T05 — `HbcRelatedItemsPanel`: `@hbc/related-items`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-14-Shared-Feature-Related-Items.md`
**Decisions Applied:** D-05, D-07
**Estimated Effort:** 0.45 sprint-weeks
**Depends On:** T04

> **Doc Classification:** Canonical Normative Plan — SF14-T05 panel task; sub-plan of `SF14-Related-Items.md`.

---

## Objective

Implement grouped related-items sidebar/panel renderer with role-aware priority behavior and progressive disclosure.

---

## Contract

```typescript
interface HbcRelatedItemsPanelProps {
  sourceRecordType: string;
  sourceRecordId: string;
  sourceRecord: unknown;
  showBicState?: boolean;
}
```

Behavior:

- grouped sections sorted/collapsed by `relationshipPriority` and role relevance
- section counts and labels visible
- empty state uses role-aware `@hbc/smart-empty-state` coaching variant
- Expert complexity shows AI suggestion group and suggest CTA
- related item rows include version-history chip popover via `@hbc/versioned-record`
- essential complexity hides panel; standard/expert show panel

---

## Verification Commands

```bash
pnpm --filter @hbc/related-items test -- HbcRelatedItemsPanel
pnpm --filter @hbc/related-items test -- HbcRelatedItemCard
pnpm --filter @hbc/related-items check-types
pnpm --filter @hbc/related-items build
```

---

## SF14-T05 Success Criteria

- [x] `HbcRelatedItemsPanel` implemented on top of `useRelatedItems` (T04) with no ad hoc data access paths.
- [x] Deterministic state handling implemented: missing-source, loading, empty, success, and degraded (error + stale data) states.
- [x] Grouped section rendering implemented with deterministic ordering by governance priority then label.
- [x] Complexity behavior implemented: essential hidden, standard panel, expert AI suggestion group + CTA.
- [x] Role-aware empty-state rendering integrated via `@hbc/smart-empty-state`.
- [x] Related item metadata rendering implemented through `HbcRelatedItemCard`, including relationship/status/BIC/version metadata and AI affordance.
- [x] Panel/card tests implemented for ordering, state transitions, AI rendering, metadata display, and partial data handling.

---

<!-- IMPLEMENTATION PROGRESS & NOTES
SF14-T05 completed: 2026-03-11
- Implemented `HbcRelatedItemsPanel` using T04 hook + T03 registry metadata:
  - derives current role from `@hbc/auth`
  - applies complexity gating via `@hbc/complexity` (essential hidden; standard/expert visible)
  - renders deterministic state machine (missing-source/loading/empty/success/degraded)
  - orders groups by relationshipPriority desc, then label asc
  - renders expert-only AI suggestion group and suggest CTA
- Implemented `HbcRelatedItemCard` metadata surface in support of panel:
  - clickable navigation, relationship/status chips, optional BIC summary
  - version chip with inline details popover
  - expert AI suggestion affordance
- Added tests:
  - packages/related-items/src/components/HbcRelatedItemsPanel.test.tsx
  - packages/related-items/src/components/HbcRelatedItemCard.test.tsx
- Added runtime deps in `@hbc/related-items`: `@hbc/auth`, `@hbc/complexity`, `@hbc/smart-empty-state`, `@hbc/versioned-record`.
- Verification evidence (all pass):
  - pnpm --filter @hbc/related-items test -- HbcRelatedItemsPanel HbcRelatedItemCard
  - pnpm --filter @hbc/related-items check-types
  - pnpm --filter @hbc/related-items build
Next task: SF14-T06 (HbcRelatedItemCard)
-->
