# Phase 4.6 — Component Library Developer Guide

**Reference:** PH4.6-UI-Design-Plan.md §6, Blueprint §1d

## Overview

Phase 4.6 delivers the 11 highest-priority UI components for the HB Intel Design System (V2.1). Components are located in `packages/ui-kit/src/` and exported from `@hbc/ui-kit`.

## Components

### 1. HbcStatusBadge (Enhanced)
Dual-channel status indicator — color + shape icon. Never relies on color alone.

```tsx
import { HbcStatusBadge } from '@hbc/ui-kit';

<HbcStatusBadge variant="success" label="On Track" />
<HbcStatusBadge variant="atRisk" label="At Risk" />
```

Icons auto-inject from variant map. Override with `icon` prop.

### 2. HbcConnectivityBar (Stories Only)
Already V2.1 compliant. No API changes.

### 3. HbcTypography (New)
Intent-based typography wrapper mapping to V2.1 type scale.

```tsx
import { HbcTypography } from '@hbc/ui-kit';

<HbcTypography intent="heading1">Section Title</HbcTypography>
<HbcTypography intent="body" truncate>Long text...</HbcTypography>
<HbcTypography intent="code" as="pre">console.log()</HbcTypography>
```

Intents: `display`, `heading1`–`heading4`, `body`, `bodySmall`, `label`, `code`.

### 4. HbcEmptyState (Enhanced)
Now uses HBC surface/text tokens instead of Fluent CSS variables.

### 5. HbcErrorBoundary (Enhanced)
Replaced hardcoded hex colors with `HBC_STATUS_COLORS.error`, `HBC_SURFACE_LIGHT['text-muted']`, `HBC_PRIMARY_BLUE`.

### 6. HbcButton (New)
Branded button with 4 variants, 3 sizes, and touch auto-scale.

```tsx
import { HbcButton } from '@hbc/ui-kit';

<HbcButton variant="primary" onClick={save}>Save</HbcButton>
<HbcButton variant="danger" icon={<Delete size="sm" />}>Remove</HbcButton>
<HbcButton variant="secondary" loading>Processing...</HbcButton>
```

**Touch auto-scale (V2.1 Dec 31):** On `(pointer: coarse)` devices, sizes auto-bump one tier (sm→md, md→lg).

### 7. HbcInput Suite (New)

#### HbcTextArea
Multi-line text input with voice dictation support.

```tsx
import { HbcTextArea } from '@hbc/ui-kit';

<HbcTextArea label="Notes" value={val} onChange={setVal} enableVoice />
```

#### HbcRichTextEditor
ContentEditable rich text with toolbar and voice dictation.

```tsx
import { HbcRichTextEditor } from '@hbc/ui-kit';

<HbcRichTextEditor
  label="Description"
  value={html}
  onChange={setHtml}
  toolbar={['bold', 'italic', 'underline', 'list', 'link']}
/>
```

#### Voice Dictation Browser Support
| Browser | Support |
|---------|---------|
| Chrome/Edge | Full (continuous + interim results) |
| Safari | Partial (may require user gesture) |
| Firefox | Not supported (mic button hidden) |

### 8. HbcForm + HbcFormSection (New)
Form wrapper with sticky footer and collapsible sections.

```tsx
import { HbcForm, HbcFormSection } from '@hbc/ui-kit';

<HbcForm onSubmit={handleSubmit} stickyFooter={<button type="submit">Save</button>}>
  <HbcFormSection title="General" collapsible>
    {/* form fields */}
  </HbcFormSection>
</HbcForm>
```

### 9. HbcPanel (Enhanced)
- Cubic-bezier animation timing (250ms)
- Mobile bottom-sheet behavior on screens ≤767px
- Focus trap (Tab cycles within panel)

### 10. HbcCommandBar (Enhanced)
- Three-tier saved views (personal/project/organization)
- Density auto-detection: coarse pointer → touch, wide desktop → compact
- Column config trigger slot

```tsx
import { HbcCommandBar } from '@hbc/ui-kit';

<HbcCommandBar
  savedViews={views}
  onViewChange={handleView}
  densityTier="standard"
  onDensityChange={setDensity}
/>
```

### 11. HbcCommandPalette (New)
Full command palette with Cmd+K activation, keyboard nav, and AI integration.

```tsx
import { HbcCommandPalette } from '@hbc/ui-kit';

<HbcCommandPalette
  navigationItems={navItems}
  actionItems={actions}
  onAiQuery={async (q) => await fetchAI(q)}
/>
```

**Offline behavior:** Navigation + Recent + Actions work via localStorage cache. AI section hidden with "AI unavailable offline" note.

## Density Tiers (V2.1 Dec 23)
| Tier | Detection | Min Height |
|------|-----------|------------|
| Compact | `pointer: fine` + width ≥ 1200px | 32px |
| Standard | Default | 40px |
| Touch | `pointer: coarse` | 48px |

## Storybook

All 11 components have 4 stories each (44 total):
- **Default** — basic usage
- **AllVariants / WithResults** — comprehensive showcase
- **FieldMode** — dark/sunlight-optimized theme
- **A11yTest** — accessibility verification

Run: `pnpm --filter @hbc/ui-kit storybook`
