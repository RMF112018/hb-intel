# P15-05 — Command and Utility Surface Overhaul — Closure Note

## What changed

PriorityActionsRail, ToolLauncherWorkHub, and their shared utility group primitive were redesigned from flat link lists into premium command surfaces with urgency-aware hierarchy, featured action treatment, and deliberate group shells.

## Perception change (not just code)

### Before
- All action items rendered at equal visual weight regardless of urgency
- Critical/warning items only got a subtle 3px red left border on the first item
- Icon frames were all `sm` (28px) with generic text indicators (!, ✓, ›)
- Group shells were plain boxes with `subtle` border and 10px padding
- Group titles were standard 0.875rem text with no accent treatment
- Launcher tiles used `launcherTilePrimary` CSS class with only a bottom separator
- The hover state was a generic `rgba(0,0,0,0.04)` background
- The entire utility zone looked like organized links, not command surfaces

### After
- **Featured action treatment**: Critical/warning items get larger `lg` icon frames (44px) with `accent` tint, urgency-tinted background (`rgba(220,38,38,0.04)`), and a strong left accent border
- **Standard items**: Compact `sm` icon frames with `neutral` tint — visually subordinate to featured actions
- **Group shells**: Premium headers with uppercase 0.75rem titles, 700 weight, 0.04em letter-spacing, and 2px accent bottom border. Three accent variants:
  - `brand` — blue header for standard groups
  - `urgent` — red-tinted header for groups containing critical/warning items
  - `neutral` — gray header for informational groups
- **Launcher tiles**: Primary items get `lg` icon frames (44px) with `accent` tint and brand-tinted background; secondary items get `md` frames (36px) with standard `brand` tint
- **Hover states**: Brand-blue tinted (`rgba(34,83,145,0.05)`) instead of generic black, with brand-colored arrow that shifts 3px on hover
- The utility zone now reads as a cockpit of prioritized actions, not a list of links

## Components changed

### PriorityActionsRail (`apps/hb-webparts/src/webparts/priorityActionsRail/`)
- Urgency resolution upgraded: `UrgencyResolution` type now includes `featured: boolean` flag
- Critical/warning/error/atRisk items: icon tint changed from `brand` (sm) to `accent` (lg), flagged as featured
- Success/completed/onTrack items: icon tint changed from `neutral` to `brand`
- Featured action rows get dedicated `featuredRowStyle` with urgency background and left accent
- Standard action rows get dedicated `standardRowStyle` with compact padding
- Removed `isFirstInUrgentGroup` pattern — urgency is now per-item via `featured` flag
- Passes `accent="urgent"` to group shell when any action in the group is critical/warning

### ToolLauncherWorkHub (`apps/hb-webparts/src/webparts/toolLauncherWorkHub/`)
- Primary tiles: icon size `md` → `lg`, tint `brand` → `accent`, dedicated `primaryTileStyle` with brand-tinted background
- Secondary tiles: icon size `sm` → `md`, dedicated `secondaryTileStyle`
- Removed `launcherTilePrimary` CSS class dependency — visual differentiation now via inline styles and icon sizing

### HomepageUtilityDenseGroup (`apps/hb-webparts/src/homepage/shared/`)
- Added `accent` prop: `'brand' | 'urgent' | 'neutral'`
- Group container: removed `subtle` border, added blue-tinted border and background
- Group header: redesigned as uppercase, letter-spaced, 700-weight label with 2px accent bottom border
- Three header variants: brand (blue), urgent (red), neutral (gray)
- Content area: padding changed from interior padding to `sm` vertical rhythm

### Homepage interactive CSS (`apps/hb-webparts/src/homepage/`)
- `.actionRowContainer`: hover changed from `rgba(0,0,0,0.04)` to `rgba(34,83,145,0.05)`; removed negative margins and explicit padding (now set by parent row styles)
- `.actionRowArrow`: color changed to brand-blue tinted, weight 600, hover translateX increased to 3px
- Removed `.actionRowUrgent` class — urgency now handled via featured row styles
- Removed `.launcherTilePrimary` class — primary emphasis now via dedicated tile styles
- Updated CSS module type declarations to match

## Verification

- `@hbc/spfx-hb-webparts` check-types: pass
- `@hbc/spfx-hb-webparts` build: pass (341 KB JS, 1.53 KB CSS)
- `@hbc/spfx-hb-webparts` lint: pass (zero errors)
- Keyboard and focus behavior preserved (focus-visible outlines unchanged)
- Reduced-motion blanket still covers all action row and arrow transitions
