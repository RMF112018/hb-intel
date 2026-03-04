# Phase 4.8 — Overlay & Surface System (Developer Guide)

**Phase:** 4.8 | **Reference:** PH4.8-UI-Design-Plan.md §8, Blueprint §1d

## Overview

Phase 4.8 delivers the Overlay & Surface System: a V2.1 dual-shadow elevation scale, centralized z-index constants, and five surface components (HbcModal, HbcTearsheet, HbcPopover, HbcCard, and enhanced HbcPanel).

## Z-Index Layer System

All z-index values are centralized in `Z_INDEX` from `@hbc/ui-kit`. Never use magic numbers.

| Layer | Value | Usage |
|-------|-------|-------|
| `content` | 0 | Page content (0–99) |
| `sidebar` | 100 | Sidebar navigation |
| `header` | 200 | Fixed header bar |
| `popover` | 1000 | Popovers, dropdowns, flyouts |
| `panelBackdrop` | 1099 | Panel backdrop overlay |
| `panel` | 1100 | Slide-in panels |
| `modalBackdrop` | 1199 | Modal/tearsheet backdrop |
| `modal` / `tearsheet` | 1200 | Modal dialogs and tearsheets |
| `commandPaletteBackdrop` | 1249 | Command palette backdrop |
| `commandPalette` | 1250 | Command palette |
| `toast` | 1300 | Toast notifications |
| `spfx` | 10000 | SPFx host layer |
| `connectivityBar` | 10001 | Connectivity bar (always on top) |

### Usage

```tsx
import { Z_INDEX } from '@hbc/ui-kit';

const styles = makeStyles({
  overlay: {
    zIndex: Z_INDEX.modal,
  },
});
```

## V2.1 Elevation System

Four-level dual-shadow scale. Each level uses two `box-shadow` values for natural depth.

| Level | Name | Shadow |
|-------|------|--------|
| 0 | `elevationLevel0` | `none` |
| 1 | `elevationLevel1` / `elevationCard` | `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)` |
| 2 | `elevationLevel2` | `0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)` |
| 3 | `elevationLevel3` / `elevationModal` | `0 10px 20px rgba(0,0,0,0.10), 0 6px 6px rgba(0,0,0,0.08)` |

### Field Mode Shadows

Field Mode increases shadow opacity by ~50% for visibility in dark/outdoor environments. Use `hbcElevationField`:

```tsx
import { elevationLevel1, hbcElevationField } from '@hbc/ui-kit';

const shadow = isFieldMode ? hbcElevationField.level1 : elevationLevel1;
```

### Deprecated Aliases

Old names still work but map to V2.1 levels:

- `elevationRest` → `elevationLevel1` (NOT `none` — preserves existing card shadows)
- `elevationHover` → `elevationLevel1`
- `elevationRaised` → `elevationLevel2`
- `elevationOverlay` → `elevationLevel2`
- `elevationDialog` → `elevationLevel3`

## Components

### HbcCard

Surface card with Level 1 shadow, optional header/body/footer sections.

```tsx
<HbcCard header={<strong>Title</strong>} footer={<button>Save</button>}>
  Card body content
</HbcCard>
```

### HbcModal

Accessible modal dialog with focus trap, Escape to close, backdrop click-to-close.

```tsx
<HbcModal open={open} onClose={close} title="Confirm" size="md" footer={buttons}>
  Modal content
</HbcModal>
```

Sizes: `sm` (480px), `md` (600px), `lg` (720px).

### HbcTearsheet

Full-width multi-step overlay with step indicator and Previous/Next/Complete navigation.

```tsx
<HbcTearsheet open={open} onClose={close} title="Create" steps={steps} onComplete={done} />
```

### HbcPopover

Contextual popover with hover (150ms delay) or click trigger. Auto-positions with viewport edge flip.

```tsx
<HbcPopover trigger={<button>Info</button>} triggerMode="hover" size="sm">
  Tooltip-like content
</HbcPopover>
```

## Shared Hooks

### useFocusTrap

Traps Tab/Shift+Tab focus within a container. Used by HbcModal, HbcTearsheet, HbcPanel.

```tsx
const ref = useRef<HTMLDivElement>(null);
useFocusTrap(ref, isOpen);
```

### useIsMobile

Detects mobile breakpoint (<=767px). Used by HbcPanel for bottom-sheet mode.

```tsx
const isMobile = useIsMobile();
```
