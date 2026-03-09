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
