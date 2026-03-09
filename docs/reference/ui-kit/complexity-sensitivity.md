# UI Kit Complexity Sensitivity Reference

**Maintained by:** HB Intel Architecture Team
**Last updated:** 2026-03-08
**Source:** `docs/architecture/plans/shared-features/SF03-T07-Retrofit-Audit.md`

This table is the authoritative reference for all complexity-aware UI Kit components.
When consuming a component marked as sensitivity-classified, you may pass
`complexityMinTier` and/or `complexityMaxTier` props to override the default gate
for your specific module context.

## Component Sensitivity Table

| Component | Default minTier | Default maxTier | Rationale | Phase 7 Retrofit |
|---|---|---|---|---|
| `HbcAuditTrailPanel` | `expert` | — | Full change history overwhelms Essential/Standard users | ✅ Phase 7 |
| `HbcDataTable` (advanced filters) | `expert` | — | Advanced filter row adds cognitive load at lower tiers | ✅ Phase 7 |
| `HbcFormField` (internal notes fields) | `standard` | — | Internal notes not relevant for Essential task completion | ✅ Phase 7 |
| `HbcStatusTimeline` | `standard` | — | Historical status progression adds context at Standard+ | ✅ Phase 7 |
| `HbcPermissionMatrix` | `expert` | — | Permission configuration is an Expert administrative function | ✅ Phase 7 |
| `HbcCoachingCallout` | `essential` | `standard` | Coaching prompts suppressed in Expert per user intent | ✅ Phase 7 |
| `HbcBicDetail` (showChain) | `expert` | — | Full ownership chain relevant only at Expert (see SF02) | Handled in SF02 |
| `HbcDocumentAttachment` (SharePoint path) | `expert` | — | Technical path detail relevant only at Expert (see SF01) | Handled in SF01 |
| `HbcBicDetail` (due date) | `standard` | — | Due date relevant at Standard+ (see SF02) | Handled in SF02 |
| `HbcNotificationPanel` (config) | `expert` | — | Notification configuration is an Expert function | Phase 8 |
| `HbcProjectCanvas` (summary tiles) | `essential` | `essential` | Summary-only tiles for Essential users | Phase 8 |
| `HbcSearchBar` (advanced operators) | `expert` | — | Boolean search operators relevant only for power users | Phase 8 |
| `HbcUserAvatar` | none | — | Always renders regardless of tier | — |
| `HbcButton` | none | — | Always renders regardless of tier | — |
| `HbcModal` | none | — | Always renders regardless of tier | — |
| `HbcSkeleton` | none | — | Always renders regardless of tier | — |
| `HbcToast` | none | — | Always renders regardless of tier | — |
| `HbcBadge` | none | — | Always renders regardless of tier | — |

## Override Pattern (D-08)

Every complexity-sensitive component accepts `complexityMinTier` and `complexityMaxTier` props
via the `IComplexityAwareProps` interface from `@hbc/complexity`. The component uses its own
internal default when no override is provided.

```tsx
// Default: HbcAuditTrailPanel renders only at Expert
<HbcAuditTrailPanel itemId={item.id} />

// Override: show at Standard for BD Scorecard module
<HbcAuditTrailPanel itemId={scorecard.id} complexityMinTier="standard" />
```

## Gate Implementation

All complexity-aware components use `useComplexityGate()` from `@hbc/complexity`:

```tsx
import { useComplexityGate } from '@hbc/complexity';
import type { IComplexityAwareProps } from '@hbc/complexity';

function MyComponent({
  complexityMinTier = 'expert',  // internal default
  complexityMaxTier,
  ...props
}: MyComponentProps) {
  const isVisible = useComplexityGate({
    minTier: complexityMinTier,
    maxTier: complexityMaxTier,
  });

  if (!isVisible) return null;

  return <div>{/* component body */}</div>;
}
```

## Special Cases

### HbcFormField — Conditional Gating

`HbcFormField` uses a `complexitySensitive` boolean to opt individual fields into gating.
When `complexitySensitive` is `false` (default), the field always renders regardless of tier.

### HbcCoachingCallout — showCoaching Check (D-07)

`HbcCoachingCallout` additionally checks the `showCoaching` flag from `useComplexity()`.
Even if the tier gate passes, the callout is hidden when the user has disabled coaching prompts.

### HbcDataTable — Advanced Filter Row Only

The complexity gate on `HbcDataTable` applies only to the advanced filter row, not the
table itself. The table always renders; only the advanced filter feature is gated at Expert.

---

## Per-Surface Tier Behavior

| Surface | Storage | Sync Mechanism | Notes |
|---------|---------|----------------|-------|
| **PWA** | `localStorage` | `StorageEvent` cross-tab sync | All tabs share tier instantly. Key: `hbc::complexity::v1`. |
| **SPFx webparts** | `sessionStorage` | Per-webpart isolated (React context propagation within page) | Each tab maintains independent state. Webparts on the same page read the same `sessionStorage` key on mount but changes in one webpart do not propagate to others on the same page via storage events — they share context through the React tree. |
| **Dev harness** | `localStorage` | Same as PWA | Mirrors PWA behavior for development parity. |

## Coaching Behavior

- `showCoaching` is an independent boolean preference stored alongside `tier` in the `hbc::complexity::v1` storage key.
- Defaults: `true` when initialized at Essential, `false` when initialized at Standard or Expert.
- Auto-set to `false` when a user upgrades from Essential to a higher tier (user has demonstrated competence).
- Users can toggle coaching independently at any time via `setShowCoaching()`.
- Currently, only `HbcCoachingCallout` checks the `showCoaching` flag. All other components gate purely on tier.

## Storage Mode Notes

- **Key schema:** `hbc::complexity::v1` — versioned to support future migration.
- **PWA behavior:** `localStorage` provides persistence across sessions and cross-tab sync via `StorageEvent`.
- **SPFx behavior:** `sessionStorage` provides tab-scoped persistence. No cross-tab events.
- **In-memory fallback:** When both `localStorage` and `sessionStorage` are unavailable (private browsing, iframe sandboxes), `ComplexityProvider` uses an in-memory store. Tier resets to optimistic default on page refresh.
- **Storage detection:** `ComplexityProvider` inspects the `spfxContext` prop — present → `sessionStorage`; absent → `localStorage`.

## Cross-Webpart Consistency Note

SPFx webparts on the same SharePoint page each render their own React tree with `ComplexityProvider`. Each provider reads from `sessionStorage` on mount, so all webparts start with the same tier. However, if a user changes tier via `HbcComplexityDial` in one webpart, that change writes to `sessionStorage` but does **not** trigger re-render in other webparts' React trees. Consistency is maintained for the common case (user sets tier once, all webparts read it on mount); real-time cross-webpart propagation requires the Application Customizer pattern (future enhancement).

---

## Retrofit Audit Results (PH7.5)

### Compliant Components (6)

| Component | Default minTier | Classification | Notes |
|-----------|----------------|----------------|-------|
| `HbcAuditTrailPanel` | `expert` | Self-gated via `useComplexityGate()` | Full change history overwhelms Essential/Standard users |
| `HbcDataTable` (advanced filters) | `expert` | Self-gated (filter row only) | Table always renders; only advanced filter feature is gated |
| `HbcFormField` (internal notes) | `standard` | Conditional gate via `complexitySensitive` prop | Default fields always render; opt-in gating for sensitive fields |
| `HbcStatusTimeline` | `standard` | Self-gated via `useComplexityGate()` | Historical status progression adds context at Standard+ |
| `HbcPermissionMatrix` | `expert` | Self-gated via `useComplexityGate()` | Permission configuration is an Expert administrative function |
| `HbcCoachingCallout` | `essential` (max: `standard`) | Self-gated + `showCoaching` check | Coaching suppressed in Expert per user intent; respects `showCoaching` toggle |

### Intentional Exclusions

| Item | Classification | Rationale |
|------|---------------|-----------|
| `_showAdvancedFilters` | Future-feature placeholder | Gate is computed but no UI is wired to it yet. Will be connected when advanced filter UX ships. Not a complexity concern — it is a feature-readiness gate. |
| Density system (`useDensity`, `useAdaptiveDensity`, `useFormDensity`, `density.ts`) | NOT complexity — separate concern | Density controls visual spacing/compactness (compact/comfortable/spacious). Complexity controls information visibility (what to show/hide). These are orthogonal axes. Density is not gated by complexity tier and is not applicable for retrofit. |
