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
