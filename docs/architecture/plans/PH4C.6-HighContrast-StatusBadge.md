# PH4C.6 — StatusBadge High-Contrast Fix (Code Quality Remediation)

**Version:** 1.0
**Date:** 2026-03-07
**Purpose:** Fix the HbcStatusBadge inline style anti-pattern to use `makeStyles` with Fluent tokens and `forced-colors` media query support. Ensures proper high-contrast mode rendering on Windows and removes styling violations.
**Audience:** Frontend engineers, UI architects
**Implementation Objective:** Eliminate inline `style` prop from HbcStatusBadge; implement Fluent token-based styling with forced-colors accessibility support.

---

## Prerequisites

**No hard prerequisites.** This task is independent and may be executed in parallel with other PH4C tasks.

**Verification that no blockers exist:**
```bash
# Confirm HbcStatusBadge file exists and is readable
test -f packages/ui-kit/src/HbcStatusBadge/index.tsx && echo "✓ HbcStatusBadge found" || echo "✗ File not found"

# Confirm Fluent UI is available in ui-kit dependencies
grep -q "@fluentui/react-components" packages/ui-kit/package.json && echo "✓ Fluent UI available" || echo "✗ Fluent UI missing"
```

---

## Implementation Steps

### 4C.6.1 — Audit Current HbcStatusBadge Implementation

**Context:** Before refactoring, fully document the current implementation to identify all status types, inline styles, and color values.

**Step:**
```bash
# Read the component to understand current implementation
cat packages/ui-kit/src/HbcStatusBadge/index.tsx
```

**Expected Output Examination:**
- Locate the `HbcStatusBadge` component definition (typically a React functional component)
- Document all status type variants (enum or type literal string union)
- Identify inline `style={{ backgroundColor: '...', ... }}` objects on Fluent `Badge` or similar wrapper
- Extract current RGB or hex color values for each status
- Note any existing CSS class usages or theme token references (if any)

**Audit Document (create as comment in step 4C.6.4 or in PR description):**
```
Status Types Found:
- [List: e.g., "Active", "Pending", "AtRisk", "Complete", "Inactive", "Warning", "Draft", "Approved"]

Current Color Values:
- Active: [current RGB/hex]
- Pending: [current RGB/hex]
- ... (one line per status)

Styling Pattern:
- Inline style prop on Badge component
- No use of makeStyles
- No forced-colors media query handling
```

---

### 4C.6.2 — Map HBC Status Types to Fluent Token Values

**Context:** For each status variant identified in 4C.6.1, determine the corresponding Fluent UI semantic token that best represents that status semantically.

**HBC Status to Fluent Token Mapping:**

| HBC Status Type | Fluent Token (Background) | Fluent Token (Text) | Forced-Colors Fallback | Description |
|---|---|---|---|---|
| **Active** | `tokens.colorPaletteGreenBackground3` | `tokens.colorNeutralForegroundOnBrand` | ButtonText on ButtonFace | Active/enabled status |
| **Pending** | `tokens.colorPaletteYellowBackground3` | `tokens.colorNeutralForeground1` | ButtonText on ButtonFace | Awaiting action |
| **AtRisk** | `tokens.colorPaletteRedBackground3` | `tokens.colorNeutralForegroundOnBrand` | Highlight on HighlightText | Risk/warning state |
| **Complete** | `tokens.colorPaletteGreenBackground2` | `tokens.colorNeutralForegroundOnBrand` | ButtonText on ButtonFace | Finished/resolved |
| **Inactive** | `tokens.colorNeutralBackground3` | `tokens.colorNeutralForeground3` | ButtonText on ButtonFace | Disabled/inactive |
| **Warning** | `tokens.colorPaletteOrangeBackground3` | `tokens.colorNeutralForeground1` | Highlight on HighlightText | Alert/caution |
| **Draft** | `tokens.colorPaletteLightBlueBackground3` | `tokens.colorNeutralForeground1` | ButtonText on ButtonFace | In-progress/unsaved |
| **Approved** | `tokens.colorPaletteGreenBackground3` | `tokens.colorNeutralForegroundOnBrand` | ButtonText on ButtonFace | Authorized/accepted |

**Notes on Mapping:**
- `tokens.colorPalette*Background3` = Soft background (badge-suitable)
- `tokens.colorNeutralForeground1` = Standard text on light backgrounds
- `tokens.colorNeutralForegroundOnBrand` = Text that contrasts on branded backgrounds
- Forced-colors fallback uses Windows High Contrast system colors: `ButtonText`, `ButtonFace`, `Highlight`, `HighlightText`

---

### 4C.6.3 — Add makeStyles Import if Not Present

**File:** `packages/ui-kit/src/HbcStatusBadge/index.tsx`

**Step:** Ensure the following import is present at the top of the file:

```typescript
import { makeStyles, tokens } from '@fluentui/react-components';
```

If already present, proceed to 4C.6.4. If not, add this line immediately after other Fluent imports.

---

### 4C.6.4 — Define useStatusStyles Hook with forced-colors Support

**File:** `packages/ui-kit/src/HbcStatusBadge/index.tsx`

**Step:** Create a `useStatusStyles` hook using `makeStyles`. Insert this **before** the component definition (typically after imports):

```typescript
/**
 * @file HbcStatusBadge/index.tsx
 * StatusBadge component with high-contrast (forced-colors) support.
 * All styles use Fluent tokens and forced-colors media query for Windows High Contrast Mode.
 */

const useStatusStyles = makeStyles({
  active: {
    backgroundColor: tokens.colorPaletteGreenBackground3,
    color: tokens.colorNeutralForegroundOnBrand,
    fontWeight: '500',
    '@media (forced-colors: active)': {
      backgroundColor: 'ButtonFace',
      color: 'ButtonText',
      forcedColorAdjust: 'none',
      borderColor: 'ButtonText',
    },
  },
  pending: {
    backgroundColor: tokens.colorPaletteYellowBackground3,
    color: tokens.colorNeutralForeground1,
    fontWeight: '500',
    '@media (forced-colors: active)': {
      backgroundColor: 'ButtonFace',
      color: 'ButtonText',
      forcedColorAdjust: 'none',
      borderColor: 'ButtonText',
    },
  },
  atRisk: {
    backgroundColor: tokens.colorPaletteRedBackground3,
    color: tokens.colorNeutralForegroundOnBrand,
    fontWeight: '600',
    '@media (forced-colors: active)': {
      backgroundColor: 'HighlightText',
      color: 'Highlight',
      forcedColorAdjust: 'none',
      borderColor: 'Highlight',
    },
  },
  complete: {
    backgroundColor: tokens.colorPaletteGreenBackground2,
    color: tokens.colorNeutralForegroundOnBrand,
    fontWeight: '500',
    '@media (forced-colors: active)': {
      backgroundColor: 'ButtonFace',
      color: 'ButtonText',
      forcedColorAdjust: 'none',
      borderColor: 'ButtonText',
    },
  },
  inactive: {
    backgroundColor: tokens.colorNeutralBackground3,
    color: tokens.colorNeutralForeground3,
    fontWeight: '400',
    '@media (forced-colors: active)': {
      backgroundColor: 'ButtonFace',
      color: 'GrayText',
      forcedColorAdjust: 'none',
      borderColor: 'GrayText',
      opacity: '0.6',
    },
  },
  warning: {
    backgroundColor: tokens.colorPaletteOrangeBackground3,
    color: tokens.colorNeutralForeground1,
    fontWeight: '600',
    '@media (forced-colors: active)': {
      backgroundColor: 'HighlightText',
      color: 'Highlight',
      forcedColorAdjust: 'none',
      borderColor: 'Highlight',
    },
  },
  draft: {
    backgroundColor: tokens.colorPaletteLightBlueBackground3,
    color: tokens.colorNeutralForeground1,
    fontWeight: '500',
    '@media (forced-colors: active)': {
      backgroundColor: 'ButtonFace',
      color: 'ButtonText',
      forcedColorAdjust: 'none',
      borderColor: 'ButtonText',
      borderStyle: 'dashed',
    },
  },
  approved: {
    backgroundColor: tokens.colorPaletteGreenBackground3,
    color: tokens.colorNeutralForegroundOnBrand,
    fontWeight: '500',
    '@media (forced-colors: active)': {
      backgroundColor: 'ButtonFace',
      color: 'ButtonText',
      forcedColorAdjust: 'none',
      borderColor: 'ButtonText',
    },
  },
});
```

**Important Details:**
- `forcedColorAdjust: 'none'` allows the `backgroundColor` and `color` to be applied even in forced-colors mode (default is 'auto' which ignores colors)
- `@media (forced-colors: active)` applies only when Windows High Contrast Mode is on
- All status types must have a corresponding rule
- Font weights are set for semantic distinction (higher weight for critical statuses like AtRisk)

---

### 4C.6.5 — Call useStyles Hook in Component Body

**File:** `packages/ui-kit/src/HbcStatusBadge/index.tsx`

**Step:** Inside the `HbcStatusBadge` component function, call the hook to obtain the style classes:

```typescript
export const HbcStatusBadge: React.FC<HbcStatusBadgeProps> = (props) => {
  const styles = useStatusStyles();

  // ... rest of component logic
};
```

This must be called at the top of the component body, before any conditional returns.

---

### 4C.6.6 — Replace Inline style with className from makeStyles

**File:** `packages/ui-kit/src/HbcStatusBadge/index.tsx`

**Before (Inline Style Anti-pattern):**
```tsx
<Badge
  appearance="tonal"
  style={{
    backgroundColor: statusColorMap[props.status],
    color: textColorMap[props.status],
  }}
>
  {props.children}
</Badge>
```

**After (Token-Based):**
```tsx
<Badge
  appearance="tonal"
  className={styles[props.status.toLowerCase()]}
>
  {props.children}
</Badge>
```

**Assumptions:**
- `props.status` is a string enum or union type (e.g., `"Active" | "Pending" | "AtRisk" | ...`)
- The class name key matches the status value in lowercase (e.g., `props.status = "Active"` → `styles.active`)

**If the status value is not lowercase,** add a normalization function:
```typescript
const statusKey = props.status.toLowerCase() as keyof ReturnType<typeof useStatusStyles>;
const className = styles[statusKey];
```

---

### 4C.6.7 — Verify No Inline `style` Prop Remains

**Step:** Search for any remaining inline `style` attributes on the Badge component:

```bash
# Check for inline style prop on Badge in HbcStatusBadge
grep -n "style=" packages/ui-kit/src/HbcStatusBadge/index.tsx | head -5
```

**Expected Result:** No output (0 matches). If any remain, remove them per step 4C.6.6.

---

### 4C.6.8 — Add Storybook Story Demonstrating High-Contrast Mode

**File:** `packages/ui-kit/src/HbcStatusBadge/HbcStatusBadge.stories.tsx`

**Step:** Create or update the Storybook stories to include high-contrast mode documentation:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { HbcStatusBadge } from './index';

const meta: Meta<typeof HbcStatusBadge> = {
  component: HbcStatusBadge,
  title: 'Components/HbcStatusBadge',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof HbcStatusBadge>;

export const Active: Story = {
  args: { status: 'Active', children: 'Active' },
};

export const Pending: Story = {
  args: { status: 'Pending', children: 'Pending' },
};

export const AtRisk: Story = {
  args: { status: 'AtRisk', children: 'At Risk' },
};

export const Complete: Story = {
  args: { status: 'Complete', children: 'Complete' },
};

export const Inactive: Story = {
  args: { status: 'Inactive', children: 'Inactive' },
};

export const Warning: Story = {
  args: { status: 'Warning', children: 'Warning' },
};

export const Draft: Story = {
  args: { status: 'Draft', children: 'Draft' },
};

export const Approved: Story = {
  args: { status: 'Approved', children: 'Approved' },
};

/**
 * High-Contrast Mode Support Story
 *
 * This story demonstrates the StatusBadge under Windows High Contrast Mode.
 * Users with visual impairments or accessibility preferences can enable
 * high-contrast mode in Windows settings, and all status badges will
 * automatically adapt using the forced-colors media query.
 *
 * To test: Windows Settings → Ease of Access → High Contrast →
 * Enable "High Contrast" and view this story in the browser.
 */
export const AllStatusesHighContrast: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      <HbcStatusBadge status="Active">Active</HbcStatusBadge>
      <HbcStatusBadge status="Pending">Pending</HbcStatusBadge>
      <HbcStatusBadge status="AtRisk">At Risk</HbcStatusBadge>
      <HbcStatusBadge status="Complete">Complete</HbcStatusBadge>
      <HbcStatusBadge status="Inactive">Inactive</HbcStatusBadge>
      <HbcStatusBadge status="Warning">Warning</HbcStatusBadge>
      <HbcStatusBadge status="Draft">Draft</HbcStatusBadge>
      <HbcStatusBadge status="Approved">Approved</HbcStatusBadge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'All status variants rendered together. Enable Windows High Contrast mode to verify forced-colors styles are applied correctly.',
      },
    },
  },
};
```

---

### 4C.6.9 — Test in Light Theme, Field Theme, and High-Contrast Mode

**Context:** Verify visual rendering across all theme contexts to ensure the Fluent token selection is correct and high-contrast fallbacks work.

**Step 1: Light Theme Testing**
```bash
# Start Storybook (if not already running)
pnpm --filter @hbc/ui-kit storybook
```
- Navigate to **HbcStatusBadge** in Storybook
- View each status story (Active, Pending, AtRisk, Complete, Inactive, Warning, Draft, Approved)
- Verify colors match the token-based palette (no visible difference from before, or improved contrast)
- Check that badge padding, font weight, and sizing are correct

**Step 2: Dark Theme Testing**
- Click the theme switcher in Storybook (if implemented) or mock dark theme in preview
- Verify each status badge has adequate contrast in dark mode
- Text should remain readable on the darker background

**Step 3: Field Mode Testing (if applicable)**
- If a Field Mode theme exists (lower-contrast, outdoor-readable), toggle to it
- Verify badges are still distinguishable and readable

**Step 4: High-Contrast Mode Simulation (Windows)**
- On Windows: Settings → Ease of Access → High Contrast → Toggle ON
- Reload Storybook and view **AllStatusesHighContrast** story
- Expected: All badges use system High Contrast colors (typically black text on white background, or white on black)
- Verify the `forced-colors` CSS is rendering correctly (system colors override token colors)

**Step 5: Browser DevTools Verification**
```javascript
// In browser console on Storybook page with AllStatusesHighContrast story rendered:
const badge = document.querySelector('[class*="active"]');
const styles = window.getComputedStyle(badge);
console.log('backgroundColor:', styles.backgroundColor);
console.log('color:', styles.color);
// Output should show Fluent token colors in normal mode, system colors in High Contrast
```

---

## Success Criteria Checklist

- [ ] **4C.6.1 Complete** — Audit document created; all status types identified and current colors recorded
- [ ] **4C.6.2 Complete** — Token mapping table filled for all 8+ status types; forced-colors fallbacks defined
- [ ] **4C.6.3 Complete** — `makeStyles` and `tokens` imports verified/added to HbcStatusBadge
- [ ] **4C.6.4 Complete** — `useStatusStyles` hook implemented with all status type rules + forced-colors media queries
- [ ] **4C.6.5 Complete** — Hook called in component body; `const styles = useStatusStyles();` present
- [ ] **4C.6.6 Complete** — All inline `style` props removed from Badge component; className used instead
- [ ] **4C.6.7 Complete** — `grep -n "style="` returns zero results for inline styles
- [ ] **4C.6.8 Complete** — Storybook stories include individual status stories + AllStatusesHighContrast story
- [ ] **4C.6.9 Complete** — Visual testing passed in light, dark, Field Mode, and high-contrast mode
- [ ] **No TypeScript Errors** — `pnpm turbo type-check` passes for ui-kit package
- [ ] **No Lint Errors** — `pnpm --filter @hbc/ui-kit lint` returns zero violations
- [ ] **Storybook Builds** — `pnpm --filter @hbc/ui-kit build-storybook` completes without errors
- [ ] **A11y Audit Passes** — Storybook accessibility addon reports no violations on HbcStatusBadge stories

---

## Verification Commands

### Full TypeScript Check (ui-kit scope)
```bash
pnpm --filter @hbc/ui-kit type-check
# Expected: EXIT CODE 0, no errors in HbcStatusBadge.ts/tsx
```

### Lint Check
```bash
pnpm --filter @hbc/ui-kit lint
# Expected: EXIT CODE 0, zero violations on HbcStatusBadge files
```

### Build Storybook
```bash
pnpm --filter @hbc/ui-kit build-storybook
# Expected: EXIT CODE 0; storybook build folder created without errors
```

### Run Storybook Test-Runner (A11y + visual)
```bash
pnpm --filter @hbc/ui-kit test-storybook
# Expected: All HbcStatusBadge stories pass; zero failures
```

### Verify Component Export
```bash
node -e "require('./packages/ui-kit/dist/index.js').HbcStatusBadge && console.log('✓ HbcStatusBadge exported');"
# Expected: ✓ HbcStatusBadge exported
```

### Manual High-Contrast Test (Windows)
```powershell
# Enable High Contrast Mode programmatically (Windows 10+):
reg add "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Accessibility" /v HighContrast /t REG_SZ /d "1" /f
# Then refresh browser and view Storybook
# Disable with: reg delete ... /v HighContrast
```

---

## PH4C.6 Progress Notes

- **Initiated:** 2026-03-07
- **4C.6.1 Status:** [PENDING] Audit in progress
- **4C.6.2 Status:** [PENDING] Token mapping to be completed
- **4C.6.3–4C.6.5 Status:** [PENDING] Implementation to follow after audit
- **4C.6.6–4C.6.7 Status:** [PENDING] Inline style removal
- **4C.6.8–4C.6.9 Status:** [PENDING] Storybook integration and testing
- **Build/Lint Status:** [AWAITING IMPLEMENTATION]
- **ADR Reference:** Will be created in PH4C.8 as part of ADR review

**Sign-Off Plan:**
- Architecture Owner to review token mapping in step 4C.6.2
- UI Lead to verify Storybook rendering in step 4C.6.9
- Final verification in PH4C.8 (Verification & Testing)

---

## Verification Evidence Template

| Criterion | Status | Evidence | Date |
|---|---|---|---|
| Audit Complete | [ ] | Screenshot or audit document | |
| Token Mapping Approved | [ ] | Mapping table review + sign-off | |
| TypeScript Check Passes | [ ] | `pnpm turbo type-check` output (EXIT 0) | |
| Lint Passes | [ ] | `pnpm lint` output (0 violations) | |
| Storybook Builds | [ ] | Build log (EXIT 0) | |
| High-Contrast Mode Tested | [ ] | Windows High Contrast screenshot + console output | |
| Light/Dark/Field Theme Tested | [ ] | Visual confirmation screenshots | |
| A11y Audit Passes | [ ] | Storybook addon report (0 violations) | |
| Production Build Tested | [ ] | `pnpm turbo build` output | |

---

**End of PH4C.6 Plan**
