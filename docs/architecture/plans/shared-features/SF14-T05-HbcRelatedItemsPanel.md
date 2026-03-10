# SF14-T05 — `HbcRelatedItemsPanel`: `@hbc/related-items`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-14-Shared-Feature-Related-Items.md`
**Decisions Applied:** D-05, D-07
**Estimated Effort:** 0.45 sprint-weeks
**Depends On:** T04

> **Doc Classification:** Canonical Normative Plan — SF14-T05 panel task; sub-plan of `SF14-Related-Items.md`.

---

## Objective

Implement grouped related-items sidebar/panel renderer.

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

- grouped sections by relationship direction
- section counts and labels visible
- empty state uses smart-empty-state inline variant
- essential complexity hides panel; standard/expert show panel

---

## Verification Commands

```bash
pnpm --filter @hbc/related-items test -- HbcRelatedItemsPanel
pnpm --filter @hbc/related-items build
```
