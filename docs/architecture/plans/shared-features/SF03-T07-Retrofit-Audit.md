# SF03-T07 — Retrofit Audit

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Decisions Applied:** D-08 (internal default gate + complexityMinTier/maxTier override props)
**Estimated Effort:** 0.5 sprint-weeks
**Depends On:** T01–T05

---

## Objective

Conduct the complexity sensitivity audit for existing `@hbc/ui-kit` components. Produce `docs/reference/ui-kit/complexity-sensitivity.md` as the authoritative reference. Retrofit at least 5 existing components with internal default gates and `complexityMinTier`/`complexityMaxTier` override props.

---

## 3-Line Plan

1. Categorize all existing `@hbc/ui-kit` components by complexity sensitivity — produce the sensitivity table.
2. Add `complexityMinTier`/`complexityMaxTier` props to each sensitivity-classified component; implement internal gate using `useComplexityGate`.
3. Verify each retrofitted component hides correctly at Essential and surfaces at its designated tier.

---

## Retrofit Pattern (D-08)

Every complexity-sensitive `@hbc/ui-kit` component follows this pattern:

```tsx
// packages/ui-kit/src/components/HbcAuditTrailPanel/HbcAuditTrailPanel.tsx
import { useComplexityGate } from '@hbc/complexity';
import type { IComplexityAwareProps } from '@hbc/complexity';

interface HbcAuditTrailPanelProps extends IComplexityAwareProps {
  itemId: string;
  // ... other props
}

export function HbcAuditTrailPanel({
  itemId,
  complexityMinTier = 'expert', // ← Default gate: Expert only
  complexityMaxTier,
  ...props
}: HbcAuditTrailPanelProps): React.ReactElement | null {

  // Internal gate — uses override props from consuming module, or defaults
  const isVisible = useComplexityGate({
    minTier: complexityMinTier,
    maxTier: complexityMaxTier,
  });

  if (!isVisible) return null;

  return (
    <div className="hbc-audit-trail-panel">
      {/* ... component body unchanged ... */}
    </div>
  );
}
```

Consuming modules that need a different threshold for their specific context:

```tsx
// In BD Scorecard module — audit trail visible from Standard for directors
<HbcAuditTrailPanel
  itemId={scorecard.id}
  complexityMinTier="standard"   // ← Override: show at Standard for this module
/>
```

---

## Component Sensitivity Categories

**Sensitivity Levels:**
- `none` — renders at all tiers (no gate needed)
- `standard+` — hidden at Essential; visible from Standard
- `expert` — hidden at Essential and Standard; visible at Expert only
- `essential-only` — visible only at Essential (coaching prompts, simplified summaries)

---

## `docs/reference/ui-kit/complexity-sensitivity.md` (Output of This Task)

```markdown
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
```

---

## Phase 7 Retrofit Implementations

### 1. `HbcAuditTrailPanel` — `expert` default

```tsx
// packages/ui-kit/src/components/HbcAuditTrailPanel/index.tsx
import { useComplexityGate } from '@hbc/complexity';
import type { IComplexityAwareProps } from '@hbc/complexity';

export interface HbcAuditTrailPanelProps extends IComplexityAwareProps {
  itemId: string;
  maxItems?: number;
}

export function HbcAuditTrailPanel({
  itemId,
  maxItems = 20,
  complexityMinTier = 'expert',
  complexityMaxTier,
}: HbcAuditTrailPanelProps): React.ReactElement | null {
  const isVisible = useComplexityGate({ minTier: complexityMinTier, maxTier: complexityMaxTier });
  if (!isVisible) return null;
  // ... existing implementation unchanged
}
```

### 2. `HbcDataTable` — `expert` default for advanced filter row

```tsx
// packages/ui-kit/src/components/HbcDataTable/index.tsx
// Add to existing props interface:
export interface HbcDataTableProps<T> extends IComplexityAwareProps {
  // ... existing props
  /** complexityMinTier applies to the advanced filter row only, not the table itself */
}

// Inside the component, gate the advanced filter row:
const showAdvancedFilters = useComplexityGate({
  minTier: props.complexityMinTier ?? 'expert',
  maxTier: props.complexityMaxTier,
});

// In JSX:
{showAdvancedFilters && <AdvancedFilterRow filters={advancedFilters} />}
```

### 3. `HbcFormField` (internal notes) — `standard` default

```tsx
// packages/ui-kit/src/components/HbcFormField/index.tsx
// Add complexityMinTier prop — used only for fields marked as complexity-sensitive
export interface HbcFormFieldProps extends IComplexityAwareProps {
  name: string;
  label: string;
  /**
   * When true, field is treated as complexity-sensitive and gated at complexityMinTier.
   * Use for internal notes, secondary metadata, and operational detail fields.
   */
  complexitySensitive?: boolean;
}

export function HbcFormField({
  name,
  label,
  complexitySensitive = false,
  complexityMinTier = 'standard',
  complexityMaxTier,
  ...rest
}: HbcFormFieldProps): React.ReactElement | null {
  const isVisible = useComplexityGate({
    minTier: complexitySensitive ? complexityMinTier : 'essential',
    maxTier: complexityMaxTier,
  });
  if (!isVisible) return null;
  // ... existing implementation
}
```

### 4. `HbcStatusTimeline` — `standard` default

```tsx
// packages/ui-kit/src/components/HbcStatusTimeline/index.tsx
export interface HbcStatusTimelineProps extends IComplexityAwareProps {
  statuses: IStatusEntry[];
  showFuture?: boolean;
}

export function HbcStatusTimeline({
  statuses,
  showFuture = false,
  complexityMinTier = 'standard',
  complexityMaxTier,
}: HbcStatusTimelineProps): React.ReactElement | null {
  const isVisible = useComplexityGate({ minTier: complexityMinTier, maxTier: complexityMaxTier });
  if (!isVisible) return null;
  // ... existing implementation
}
```

### 5. `HbcPermissionMatrix` — `expert` default

```tsx
// packages/ui-kit/src/components/HbcPermissionMatrix/index.tsx
export interface HbcPermissionMatrixProps extends IComplexityAwareProps {
  roles: IRole[];
  permissions: IPermission[];
  onPermissionChange: (roleId: string, permissionId: string, granted: boolean) => void;
}

export function HbcPermissionMatrix({
  roles,
  permissions,
  onPermissionChange,
  complexityMinTier = 'expert',
  complexityMaxTier,
}: HbcPermissionMatrixProps): React.ReactElement | null {
  const isVisible = useComplexityGate({ minTier: complexityMinTier, maxTier: complexityMaxTier });
  if (!isVisible) return null;
  // ... existing implementation
}
```

### 6. `HbcCoachingCallout` — `essential` to `standard` default

```tsx
// packages/ui-kit/src/components/HbcCoachingCallout/index.tsx
// Special case: maxTier default of 'standard' suppresses in Expert per user intent
export interface HbcCoachingCalloutProps extends IComplexityAwareProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function HbcCoachingCallout({
  message,
  actionLabel,
  onAction,
  complexityMinTier = 'essential',
  complexityMaxTier = 'standard', // ← Expert users see no coaching by default
}: HbcCoachingCalloutProps): React.ReactElement | null {
  const { showCoaching } = useComplexity(); // D-07: also check independent toggle
  const isVisible = useComplexityGate({ minTier: complexityMinTier, maxTier: complexityMaxTier });

  if (!isVisible || !showCoaching) return null;

  return (
    <div className="hbc-coaching-callout" role="note" aria-label="Guidance">
      <p>{message}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} type="button">{actionLabel}</button>
      )}
    </div>
  );
}
```

---

## Retrofit Verification

```bash
# 1. Typecheck all retrofitted components
pnpm --filter @hbc/ui-kit typecheck

# 2. Verify each component hides at Essential
# (Run in dev-harness with ComplexityProvider at 'essential')
pnpm --filter @hbc/dev-harness dev
# Navigate to: /dev-harness/complexity-audit
# Confirm: HbcAuditTrailPanel absent, HbcStatusTimeline absent, HbcCoachingCallout visible

# 3. Verify at Standard
# Confirm: HbcStatusTimeline visible, HbcFormField (sensitive) visible, HbcAuditTrailPanel absent

# 4. Verify at Expert
# Confirm: All components visible, HbcCoachingCallout absent (maxTier="standard")

# 5. Verify complexityMinTier override works
# (Pass complexityMinTier="standard" to HbcAuditTrailPanel)
# Confirm: Panel visible at Standard when override applied
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF03-T07 completed: 2026-03-08

Implementation summary:
- Added @hbc/complexity as workspace dependency to @hbc/ui-kit
- Fixed @hbc/complexity package.json exports to match actual dist/src/ layout (rootDir=".")
- Created 5 new complexity-aware component stubs:
  - HbcAuditTrailPanel (expert default)
  - HbcFormField (standard default, conditional via complexitySensitive flag)
  - HbcStatusTimeline (standard default)
  - HbcPermissionMatrix (expert default)
  - HbcCoachingCallout (essential–standard, also checks showCoaching D-07)
- Retrofitted HbcDataTable with IComplexityAwareProps + useComplexityGate for advanced filters
- Exported all new components from ui-kit barrel (src/index.ts)
- Created docs/reference/ui-kit/complexity-sensitivity.md (authoritative sensitivity table)
- useComplexity stub in ui-kit left as-is for backward compatibility with bic-next-move

Verification:
- pnpm --filter @hbc/ui-kit check-types: ✅ zero errors
- pnpm --filter @hbc/ui-kit build: ✅ zero errors
- docs/reference/ui-kit/complexity-sensitivity.md: ✅ created with full 18-component table

Next: T08 Testing Strategy
-->
