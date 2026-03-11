# SF11-T05 — `HbcSmartEmptyState`: `@hbc/smart-empty-state`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-11-Shared-Feature-Smart-Empty-State.md`
**Decisions Applied:** D-02, D-03, D-05, D-06, D-07
**Estimated Effort:** 0.35 sprint-weeks
**Depends On:** T04

> **Doc Classification:** Canonical Normative Plan — SF11-T05 core component task; sub-plan of `SF11-Smart-Empty-State.md`.

---

## Objective

Implement the main renderer that resolves classification content and presents actionable, role-aware empty-state UI.

---

## Component Contract

```typescript
interface HbcSmartEmptyStateProps {
  config: ISmartEmptyStateConfig;
  context: IEmptyStateContext;
  variant?: 'full-page' | 'inline';
  onActionFired?: (actionLabel: string, classification: EmptyStateClassification) => void;
}
```

---

## Rendering Behavior

- Heading + description always rendered.
- CTA rendering:
  - `primaryAction` as prominent button
  - `secondaryAction` as secondary button/link
  - `filterClearAction` rendered only for `filter-empty`
- Classification-specific visuals:
  - `loading-failed`: error icon, retry-focused copy
  - `permission-empty`: lock icon, no destructive CTA
  - `filter-empty`: minimal visual + clear-filter guidance
  - `first-use`: prominent onboarding illustration and onboarding copy
  - `truly-empty`: neutral "no items yet" visual

---

## Complexity Behavior (D-05)

- Essential: coaching tip inline below description.
- Standard: coaching tip behind disclosure control labeled with `EMPTY_STATE_COACHING_COLLAPSE_LABEL`.
- Expert: coaching tip suppressed.

---

## Accessibility

- Root region has `aria-labelledby` and `aria-describedby`.
- All button/link actions keyboard accessible.
- Decorative illustrations marked `aria-hidden`.

---

## Verification Commands

```bash
pnpm --filter @hbc/smart-empty-state test -- HbcSmartEmptyState
pnpm --filter @hbc/smart-empty-state build
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF11-T05 completed: 2026-03-11
- HbcSmartEmptyState.tsx rewritten from stub to full renderer consuming useEmptyState + useComplexity
- Renders heading/description/CTAs per classification with full-page/inline variant support
- D-05 coaching behavior: essential=inline, standard=disclosure, expert=hidden
- Accessibility: region with aria-labelledby/aria-describedby, decorative icon aria-hidden, keyboard-accessible actions
- HbcSmartEmptyStateProps type exported from barrel (components/index.ts + src/index.ts)
- setup.ts global mock updated with useComplexity default
- scaffold.test.ts updated to pass required props
- 17 new component tests in HbcSmartEmptyState.test.tsx; 75 total package tests; 100% coverage all metrics
- Full monorepo build verified (35/35)
- Next: T06 HbcEmptyStateIllustration & Layout
-->
