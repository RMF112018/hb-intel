# SF14-T06 — `HbcRelatedItemCard`: `@hbc/related-items`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-14-Shared-Feature-Related-Items.md`
**Decisions Applied:** D-05, D-07
**Estimated Effort:** 0.35 sprint-weeks
**Depends On:** T05

> **Doc Classification:** Canonical Normative Plan — SF14-T06 card task; sub-plan of `SF14-Related-Items.md`.

---

## Objective

Implement related item row/card with icon, label, status, optional BIC state, relationship chip, and navigation.

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
- expert complexity may include extended bic state details

---

## Verification Commands

```bash
pnpm --filter @hbc/related-items test -- HbcRelatedItemCard
pnpm --filter @hbc/related-items build
```
