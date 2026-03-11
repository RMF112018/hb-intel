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
pnpm --filter @hbc/related-items build
```
