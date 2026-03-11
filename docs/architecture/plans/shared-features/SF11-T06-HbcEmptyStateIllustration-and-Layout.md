# SF11-T06 — `HbcEmptyStateIllustration` and Layout: `@hbc/smart-empty-state`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-11-Shared-Feature-Smart-Empty-State.md`
**Decisions Applied:** D-06, D-07
**Estimated Effort:** 0.2 sprint-weeks
**Depends On:** T05

> **Doc Classification:** Canonical Normative Plan — SF11-T06 visual/layout task; sub-plan of `SF11-Smart-Empty-State.md`.

---

## Objective

Define reusable illustration and layout primitives for consistent empty-state rendering across full-page and inline placements.

---

## `HbcEmptyStateIllustration`

**File:** `src/components/HbcEmptyStateIllustration.tsx`

```typescript
interface HbcEmptyStateIllustrationProps {
  classification: EmptyStateClassification;
  illustrationKey?: string;
  size?: 'sm' | 'md' | 'lg';
}
```

Requirements:

- Default icon by classification when `illustrationKey` omitted.
- Use only local icon resources from `@hbc/ui-kit`.
- Safe fallback icon for unknown key.

---

## Layout Rules

- `full-page`: centered container, max-width content card, larger visual scale.
- `inline`: compact horizontal/stacked card for embedded lists and panels.
- Keep consistent spacing tokens and typography scale across classifications.

---

## SPFx Compatibility Notes

- No CSS features known to fail in SPFx iframe-hosted contexts.
- Avoid portal-only dependencies in the core layout component.

---

## Verification Commands

```bash
pnpm --filter @hbc/smart-empty-state test -- HbcEmptyStateIllustration
pnpm --filter @hbc/smart-empty-state build
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF11-T06 completed: 2026-03-11
- HbcEmptyStateIllustration.tsx: classification→icon mapping (5 classifications), illustrationKey override with ICON_KEY_MAP registry, StatusInfoIcon fallback, sm/md/lg size support, aria-hidden decorative
- HbcSmartEmptyState.tsx: placeholder <span> replaced with <HbcEmptyStateIllustration>, content wrapper <div class="hbc-empty-state__content"> added, size varies by variant (lg for full-page, sm for inline)
- Barrel exports: HbcEmptyStateIllustrationProps added to components/index.ts and src/index.ts
- setup.ts: global vi.mock for @hbc/ui-kit/icons with createElement-based mock icons
- scaffold.test.ts: updated to pass required classification prop
- HbcSmartEmptyState.test.tsx: test #16 selector updated from .hbc-empty-state__icon to .hbc-empty-state__illustration
- HbcEmptyStateIllustration.test.tsx: 12 new tests (5 classification defaults, key override, unknown key fallback, 3 size variants, aria-hidden, data-classification)
- All gates pass: check-types (0 errors), build (0 errors), test:coverage (100% all metrics, 87 tests), full monorepo build (35/35)
-->
