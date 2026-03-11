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
pnpm --filter @hbc/related-items build
```
