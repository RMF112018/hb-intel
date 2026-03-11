<!-- DIFF-SUMMARY: Added version-history chip/popover and optional AI suggest action; aligned card behavior with locked Expert features -->

# SF14-T06 — `HbcRelatedItemCard`: `@hbc/related-items`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-14-Shared-Feature-Related-Items.md`
**Decisions Applied:** D-05, D-07
**Estimated Effort:** 0.35 sprint-weeks
**Depends On:** T05

> **Doc Classification:** Canonical Normative Plan — SF14-T06 card task; sub-plan of `SF14-Related-Items.md`.

---

## Objective

Implement related item row/card with icon, label, status, optional BIC state, relationship chip, version history chip + popover, optional AI suggest action, and navigation.

---

## Contract

```typescript
interface HbcRelatedItemCardProps {
  item: IRelatedItem;
}
```

Behavior:

- click navigates to `item.href`
- relationship chip rendered consistently by direction
- version-history chip displays last changed and author in inline popover
- expert complexity may include AI suggest action and extended BIC detail

---

## Verification Commands

```bash
pnpm --filter @hbc/related-items test -- HbcRelatedItemCard
pnpm --filter @hbc/related-items check-types
pnpm --filter @hbc/related-items build
```

---

## SF14-T06 Success Criteria

- [x] `HbcRelatedItemCard` implemented with deterministic rendering for title, identity, relationship context, metadata, and navigation.
- [x] Relationship/direction context is rendered consistently from T02 contract direction values.
- [x] Optional BIC enrichment display implemented with compatibility suppression control (`showBicState`).
- [x] Version-history chip with inline popover/details implemented for `versionChip` metadata.
- [x] Expert-only AI suggestion affordance implemented with deterministic indicator logic.
- [x] Partial/minimal data fallback handling implemented without invalid UI states or crashes.
- [x] Card tests completed for content, direction labels, metadata/version, AI indicators, BIC visibility, and fallback rendering.

---

<!-- IMPLEMENTATION PROGRESS & NOTES
SF14-T06 completed: 2026-03-11
- Hardened `HbcRelatedItemCard` to align with T06 card requirements while preserving compatibility prop `showBicState`.
- Added deterministic display derivations:
  - title fallback (`label` -> `recordId`)
  - record type fallback (`related-record`)
  - relationship label fallback (`Related`)
  - direction label mapping from contract directions (`originated`, `converted-to`, `has`, `references`, `blocks`, `is-blocked-by`)
- Confirmed behavior coverage:
  - relationship/direction chip rendering
  - optional status/classification display
  - optional BIC state visibility with suppression
  - version chip + inline details popover
  - expert-only AI suggest indicator/action
- Updated tests: `packages/related-items/src/components/HbcRelatedItemCard.test.tsx` (added direction consistency and deterministic fallback assertions).
- Verification evidence (all pass):
  - pnpm --filter @hbc/related-items test -- HbcRelatedItemCard
  - pnpm --filter @hbc/related-items check-types
  - pnpm --filter @hbc/related-items build
Next task: SF14-T07 (Reference Integrations)
-->
