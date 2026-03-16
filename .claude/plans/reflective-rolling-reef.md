# Complexity-Aware Stubs → Tier A + Design Compliance

## Context

5 Complexity-Aware Stub components (SF03-T07 D-08) are at Tier D (Placeholder/minimal). Each needs full visual implementation with Griffel styles, design tokens, accessibility, and tests to reach Tier A. The types.ts files are the contract and must not change.

**Components:** HbcCoachingCallout, HbcFormField, HbcStatusTimeline, HbcAuditTrailPanel, HbcPermissionMatrix

**Current version:** 2.2.20 → **Target:** 2.2.21

---

## Implementation Order

1. **HbcCoachingCallout** — simplest (message + button), introduces dual-gate test pattern
2. **HbcFormField** — simple wrapper, conditional complexity gating
3. **HbcStatusTimeline** — data display, timeline visual with status colors
4. **HbcAuditTrailPanel** — panel shell (no data prop in types, so styled empty container)
5. **HbcPermissionMatrix** — most complex (styled table + keyboard grid nav)

---

## Step 1: HbcCoachingCallout

### Source: `packages/ui-kit/src/HbcCoachingCallout/index.tsx`

**Visual design:** Info-accent callout card
- `surface-1` background, `HBC_STATUS_COLORS.info` left border (4px), `HBC_RADIUS_LG` corners, `elevationLevel1`
- Flex row: message text (`body` size, `text-primary`) + optional action button
- Action button: text-style, `HBC_PRIMARY_BLUE` color, `HBC_RADIUS_MD`
- Padding: `HBC_SPACE_MD` all sides, `HBC_SPACE_SM` gap

**Imports to add:**
```tsx
import { makeStyles, mergeClasses } from '@griffel/react';
import { HBC_STATUS_COLORS, HBC_SURFACE_LIGHT, HBC_PRIMARY_BLUE } from '../theme/tokens.js';
import { HBC_RADIUS_LG, HBC_RADIUS_MD } from '../theme/radii.js';
import { elevationLevel1 } from '../theme/elevation.js';
import { HBC_SPACE_XS, HBC_SPACE_SM, HBC_SPACE_MD } from '../theme/grid.js';
```

**Styles:**
```tsx
const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: `${HBC_SPACE_SM}px`,
    padding: `${HBC_SPACE_MD}px`,
    backgroundColor: HBC_SURFACE_LIGHT['surface-1'],
    borderLeft: `${HBC_SPACE_XS}px solid ${HBC_STATUS_COLORS.info}`,
    borderRadius: HBC_RADIUS_LG,
    boxShadow: elevationLevel1,
  },
  message: {
    flex: '1 1 auto',
    margin: '0',
    fontSize: '0.875rem',
    color: HBC_SURFACE_LIGHT['text-primary'],
    lineHeight: '1.5',
  },
  action: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: HBC_PRIMARY_BLUE,
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: HBC_RADIUS_MD,
    cursor: 'pointer',
    padding: `${HBC_SPACE_XS}px ${HBC_SPACE_SM}px`,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
});
```

**ARIA:** Keep existing `role="note"` and `aria-label="Guidance"`.

**Preserve:** Dual gate logic (`useComplexityGate` + `showCoaching`).

### Test: `packages/ui-kit/src/HbcCoachingCallout/__tests__/HbcCoachingCallout.test.tsx`

Use `createComplexityWrapper` and `ComplexityTestProvider` from `@hbc/complexity/testing`.

**Key behavior:** `showCoaching` defaults to `tier === 'essential'` in test provider. So:
- essential tier → showCoaching=true (default) → renders
- standard tier → showCoaching=false (default) → does NOT render unless explicit `showCoaching={true}`
- expert tier → gated out regardless

**Tests (7):**
1. Renders `data-hbc-ui="HbcCoachingCallout"` at essential tier
2. Has `role="note"` with `aria-label="Guidance"`
3. Displays message text
4. Renders action button when `actionLabel` and `onAction` provided
5. Does NOT render action button when `actionLabel` omitted
6. Fires `onAction` on button click (userEvent)
7. Returns null at expert tier (gated out)
8. Returns null when `showCoaching=false` (use `ComplexityTestProvider` with explicit `showCoaching={false}`)

---

## Step 2: HbcFormField

### Source: `packages/ui-kit/src/HbcFormField/index.tsx`

**Visual design:** Minimal styled label wrapper
- Vertical flex column, `HBC_SPACE_XS` gap
- Label: `0.75rem`, weight 600, `text-muted` color
- `htmlFor` attribute: `hbc-field-${name}` for accessibility
- No background, no border, no elevation (wrapper only)

**Imports to add:**
```tsx
import { makeStyles } from '@griffel/react';
import { HBC_SURFACE_LIGHT } from '../theme/tokens.js';
import { HBC_SPACE_XS } from '../theme/grid.js';
```

**Styles:**
```tsx
const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_XS}px`,
  },
  label: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
});
```

**ARIA:** Add `htmlFor={`hbc-field-${name}`}` on the `<label>`.

### Test: `packages/ui-kit/src/HbcFormField/__tests__/HbcFormField.test.tsx`

**Tests (6):**
1. Renders `data-hbc-ui="HbcFormField"` with `data-field-name`
2. Renders label text
3. Label has `htmlFor` matching `hbc-field-${name}`
4. Always renders at essential tier when `complexitySensitive=false` (default)
5. Returns null at essential tier when `complexitySensitive=true` (standard-gated)
6. Renders at standard tier when `complexitySensitive=true`

---

## Step 3: HbcStatusTimeline

### Source: `packages/ui-kit/src/HbcStatusTimeline/index.tsx`

**Visual design:** Vertical timeline with colored dots and connector lines
- Each entry: 12px colored dot (left) + vertical connector line (2px) + content (right)
- Dot color: map status string to `HBC_STATUS_COLORS` (approved→success, rejected→error, pending→neutral, in-progress→info, default→neutral)
- Content: status text (body, `text-primary`), timestamp (bodySmall, `text-muted`), actor (bodySmall, `text-muted`)
- Future entries: dashed connector, dot outline only, `text-muted` opacity
- Spacing: `HBC_SPACE_MD` between entries, `HBC_SPACE_SM` dot-to-content gap

**Imports to add:**
```tsx
import { makeStyles, mergeClasses } from '@griffel/react';
import { HBC_STATUS_COLORS, HBC_SURFACE_LIGHT } from '../theme/tokens.js';
import { HBC_RADIUS_FULL } from '../theme/radii.js';
import { HBC_SPACE_XS, HBC_SPACE_SM, HBC_SPACE_MD } from '../theme/grid.js';
```

**Styles:**
```tsx
const STATUS_COLOR_MAP: Record<string, string> = {
  approved: HBC_STATUS_COLORS.success,
  completed: HBC_STATUS_COLORS.completed,
  rejected: HBC_STATUS_COLORS.error,
  pending: HBC_STATUS_COLORS.pending,
  'in-progress': HBC_STATUS_COLORS.inProgress,
  draft: HBC_STATUS_COLORS.draft,
};

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column' },
  entry: {
    display: 'flex',
    gap: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_MD}px`,
    position: 'relative',
  },
  dotColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flexShrink: 0,
    width: '12px',
  },
  dot: {
    width: '12px',
    height: '12px',
    borderRadius: HBC_RADIUS_FULL,
    flexShrink: 0,
  },
  connector: {
    flex: '1 1 auto',
    width: '2px',
    backgroundColor: HBC_SURFACE_LIGHT['border-default'],
    marginTop: `${HBC_SPACE_XS}px`,
  },
  connectorDashed: {
    backgroundColor: 'transparent',
    borderLeft: `2px dashed ${HBC_SURFACE_LIGHT['border-default']}`,
  },
  futureDot: {
    backgroundColor: 'transparent !important',
    border: `2px solid ${HBC_SURFACE_LIGHT['border-default']}`,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_XS}px`,
    minWidth: 0,
  },
  status: { fontSize: '0.875rem', color: HBC_SURFACE_LIGHT['text-primary'], fontWeight: 500 },
  meta: { fontSize: '0.75rem', color: HBC_SURFACE_LIGHT['text-muted'] },
  futureEntry: { opacity: '0.6' },
});
```

**ARIA:** Add `role="list"` + `aria-label="Status timeline"` on root. Each entry: `role="listitem"`.

**Key logic:** Entries render normally. Future entries (determined by some heuristic — since there's no `isFuture` field on `IStatusEntry`, all entries render the same; `showFuture` controls whether future entries are included, but the component doesn't know which are future). Since the data contract doesn't indicate future vs past, render all provided `statuses` with standard styling. The `showFuture` attribute is preserved as `data-show-future` for consumer logic.

### Test: `packages/ui-kit/src/HbcStatusTimeline/__tests__/HbcStatusTimeline.test.tsx`

**Tests (7):**
1. Renders `data-hbc-ui="HbcStatusTimeline"` at standard tier
2. Has `role="list"` with `aria-label="Status timeline"`
3. Renders one `role="listitem"` per status entry
4. Displays status text, timestamp, and actor
5. Omits actor text when not provided
6. Returns null at essential tier (standard-gated)
7. Preserves `data-show-future` attribute

---

## Step 4: HbcAuditTrailPanel

### Source: `packages/ui-kit/src/HbcAuditTrailPanel/index.tsx`

**Visual design:** Polished panel shell (no data prop exists — render empty container)
- Card surface: `surface-0` bg, `border-default` border, `HBC_RADIUS_LG`, `elevationLevel1`
- Header bar: "Audit Trail" heading (heading4 size, `text-primary`), `surface-2` background, bottom border
- Empty body: centered muted text "No audit entries" (body, `text-muted`), `HBC_SPACE_XL` vertical padding
- Preserves `data-item-id` and `data-max-items` attributes

**Imports to add:**
```tsx
import { makeStyles } from '@griffel/react';
import { HBC_SURFACE_LIGHT } from '../theme/tokens.js';
import { HBC_RADIUS_LG } from '../theme/radii.js';
import { elevationLevel1 } from '../theme/elevation.js';
import { HBC_SPACE_SM, HBC_SPACE_MD, HBC_SPACE_XL } from '../theme/grid.js';
```

**Styles:**
```tsx
const useStyles = makeStyles({
  root: {
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
    border: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
    borderRadius: HBC_RADIUS_LG,
    boxShadow: elevationLevel1,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: `${HBC_SPACE_SM}px ${HBC_SPACE_MD}px`,
    backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    borderBottom: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
  },
  title: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: HBC_SURFACE_LIGHT['text-primary'],
    margin: '0',
  },
  body: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: `${HBC_SPACE_XL}px`,
    paddingBottom: `${HBC_SPACE_XL}px`,
    color: HBC_SURFACE_LIGHT['text-muted'],
    fontSize: '0.875rem',
  },
});
```

**ARIA:** Add `role="log"`, `aria-label="Audit trail"` on root.

**Render:** Header with "Audit Trail" title + body with "No audit entries" placeholder.

### Test: `packages/ui-kit/src/HbcAuditTrailPanel/__tests__/HbcAuditTrailPanel.test.tsx`

**Tests (6):**
1. Renders `data-hbc-ui="HbcAuditTrailPanel"` at expert tier
2. Has `role="log"` with `aria-label="Audit trail"`
3. Renders heading "Audit Trail"
4. Shows "No audit entries" placeholder
5. Preserves `data-item-id` and `data-max-items` attributes
6. Returns null at standard tier (expert-gated)

---

## Step 5: HbcPermissionMatrix

### Source: `packages/ui-kit/src/HbcPermissionMatrix/index.tsx`

**Visual design:** Styled table in a card container
- Card wrap: `surface-0` bg, `border-default` border, `HBC_RADIUS_LG`, `elevationLevel1`, `overflow: 'auto'`
- Table: full width, collapsed borders
- Header row: `surface-2` bg, heading4 typography, `HBC_SPACE_SM`/`HBC_SPACE_MD` padding
- Role name cells (row headers): body typography, weight 500, `HBC_SPACE_SM`/`HBC_SPACE_MD` padding
- Checkbox cells: centered, `HBC_SPACE_SM` padding, 18px checkbox with `accentColor: HBC_PRIMARY_BLUE`
- Row hover: `surface-1` background
- Cell borders: `1px solid border-default`

**Imports to add:**
```tsx
import { makeStyles, mergeClasses } from '@griffel/react';
import { HBC_SURFACE_LIGHT, HBC_PRIMARY_BLUE } from '../theme/tokens.js';
import { HBC_RADIUS_LG } from '../theme/radii.js';
import { elevationLevel1 } from '../theme/elevation.js';
import { HBC_SPACE_SM, HBC_SPACE_MD } from '../theme/grid.js';
```

**Styles:**
```tsx
const useStyles = makeStyles({
  root: {
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
    border: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
    borderRadius: HBC_RADIUS_LG,
    boxShadow: elevationLevel1,
    overflowX: 'auto',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  headerCell: {
    fontSize: '0.875rem',
    fontWeight: 600,
    backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    padding: `${HBC_SPACE_SM}px ${HBC_SPACE_MD}px`,
    textAlign: 'left',
    color: HBC_SURFACE_LIGHT['text-primary'],
    borderBottom: `2px solid ${HBC_SURFACE_LIGHT['border-default']}`,
  },
  bodyRow: {
    ':hover': { backgroundColor: HBC_SURFACE_LIGHT['surface-1'] },
  },
  roleCell: {
    fontSize: '0.875rem',
    fontWeight: 500,
    padding: `${HBC_SPACE_SM}px ${HBC_SPACE_MD}px`,
    color: HBC_SURFACE_LIGHT['text-primary'],
    borderBottom: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
  },
  permCell: {
    textAlign: 'center',
    padding: `${HBC_SPACE_SM}px`,
    borderBottom: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
  },
  checkbox: {
    width: '18px',
    height: '18px',
    accentColor: HBC_PRIMARY_BLUE,
    cursor: 'pointer',
  },
});
```

**ARIA:** Add `role="grid"`, `aria-label="Permission matrix"` on table. `role="columnheader"` on header `<th>`. `role="rowheader"` on role name `<td>`. Keep existing `aria-label` on checkboxes.

### Test: `packages/ui-kit/src/HbcPermissionMatrix/__tests__/HbcPermissionMatrix.test.tsx`

**Tests (7):**
1. Renders `data-hbc-ui="HbcPermissionMatrix"` at expert tier
2. Renders role names in table rows
3. Renders permission names as column headers
4. Checkboxes have `aria-label` with role + permission names
5. Fires `onPermissionChange` with correct args on checkbox toggle (userEvent)
6. Returns null at standard tier (expert-gated)
7. Returns null at essential tier

---

## Step 6: Update maturity matrix

**File:** `docs/reference/ui-kit/UI-Kit-Component-Maturity-Matrix.md`

Update the Complexity-Aware Stubs table rows:
- HbcAuditTrailPanel: D → **A**, Tests: None → Yes (6)
- HbcFormField: D → **A**, Tests: None → Yes (6)
- HbcStatusTimeline: D → **A**, Tests: None → Yes (7)
- HbcPermissionMatrix: D → **A**, Tests: None → Yes (7)
- HbcCoachingCallout: D → **A**, Tests: None → Yes (8)

Update assessment notes with test counts, tokenization, Griffel styling, and ARIA additions.

Update Tier D summary counts (5 fewer D-tier components).

---

## Step 7: Version bump

`packages/ui-kit/package.json`: `"version": "2.2.20"` → `"2.2.21"`

---

## Verification

```bash
cd packages/ui-kit && npx vitest run src/HbcCoachingCallout src/HbcFormField src/HbcStatusTimeline src/HbcAuditTrailPanel src/HbcPermissionMatrix --reporter=verbose
npx tsc --noEmit -p packages/ui-kit/tsconfig.json
```

---

## Commit message

```
test(ui-kit): add complexity-aware stub tests and tokenize spacing, upgrade all 5 to Tier A
```

## Key files

### Source files to modify (5)
- `packages/ui-kit/src/HbcCoachingCallout/index.tsx`
- `packages/ui-kit/src/HbcFormField/index.tsx`
- `packages/ui-kit/src/HbcStatusTimeline/index.tsx`
- `packages/ui-kit/src/HbcAuditTrailPanel/index.tsx`
- `packages/ui-kit/src/HbcPermissionMatrix/index.tsx`

### Test files to create (5)
- `packages/ui-kit/src/HbcCoachingCallout/__tests__/HbcCoachingCallout.test.tsx`
- `packages/ui-kit/src/HbcFormField/__tests__/HbcFormField.test.tsx`
- `packages/ui-kit/src/HbcStatusTimeline/__tests__/HbcStatusTimeline.test.tsx`
- `packages/ui-kit/src/HbcAuditTrailPanel/__tests__/HbcAuditTrailPanel.test.tsx`
- `packages/ui-kit/src/HbcPermissionMatrix/__tests__/HbcPermissionMatrix.test.tsx`

### Other files to update
- `docs/reference/ui-kit/UI-Kit-Component-Maturity-Matrix.md` — tier changes
- `packages/ui-kit/package.json` — version 2.2.20 → 2.2.21

### Design token sources (reuse, do not modify)
- `packages/ui-kit/src/theme/tokens.ts` — colors, surfaces, status
- `packages/ui-kit/src/theme/grid.ts` — spacing tokens
- `packages/ui-kit/src/theme/radii.ts` — border radius tokens
- `packages/ui-kit/src/theme/elevation.ts` — shadow tokens

### Test utilities (reuse)
- `@hbc/complexity/testing` — `createComplexityWrapper`, `ComplexityTestProvider`, `allTiers`
