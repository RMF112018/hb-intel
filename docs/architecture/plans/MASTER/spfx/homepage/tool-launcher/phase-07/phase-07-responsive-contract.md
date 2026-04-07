# Phase 07 — Responsive Contract

## 1. Current-State Responsive Gap

### What the launcher was doing before Phase 07

All launcher regions used fixed desktop-only layout:
- Composition shell: 16px gap/padding at all widths
- Body grid: `2fr 1fr` at all widths (flagship + rail side-by-side)
- Flagship grid: `minmax(240px, 1fr)` auto-fill (wraps but doesn't adapt spacing)
- Shelf grid: `minmax(180px, 1fr)` auto-fill (wraps but doesn't adapt spacing)
- Command band: 3-column grid (title, search, actions) at all widths
- Overlay: 60vh max-height with no mobile adaptation

The auto-fill grids provided basic reflow, but the body's 2fr/1fr split and the shell's padding were not width-aware.

### What a hardened responsive launcher requires

- Tier-aware layout that stacks the body at tablet/mobile instead of forcing 2fr/1fr
- Compact padding at mobile widths
- Breakpoint tiers aligned with the existing `useResponsiveTier` hook (mobile ≤767, tablet 768–1199, desktop ≥1200)
- Explicit rules per region so later prompts don't improvise

## 2. Breakpoint Plan

### Named tiers

| Tier | Width | Source |
|------|-------|--------|
| **Mobile** | ≤ 767px | `useResponsiveTier()` — `MOBILE_MAX = 767` |
| **Tablet** | 768–1199px | `useResponsiveTier()` — between thresholds |
| **Desktop** | ≥ 1200px | `useResponsiveTier()` — `DESKTOP_MIN = 1200` |

### Regional behavior per tier

| Region | Desktop (≥1200) | Tablet (768–1199) | Mobile (≤767) |
|--------|----------------|-------------------|---------------|
| **Shell padding** | 16px | 16px | 12px |
| **Shell gap** | 16px | 16px | 12px |
| **Body grid** | `2fr 1fr` (side-by-side) | `1fr` (stacked) | `1fr` (stacked) |
| **Flagship grid** | `minmax(240px, 1fr)` | `minmax(240px, 1fr)` | `minmax(240px, 1fr)` |
| **Shelf grid** | `minmax(180px, 1fr)` | `minmax(180px, 1fr)` | `minmax(180px, 1fr)` |
| **Command band** | 3-column (title, search, actions) | 3-column (unchanged) | 3-column (unchanged — auto-wraps) |
| **Utility rail** | Right column | Below flagship (full-width) | Below flagship (full-width) |
| **Overlay** | Inline panel, 60vh | Inline panel, 60vh | Inline panel, 70vh (future P07-02) |
| **All Platforms button** | Visible | Visible | Visible |

### Key adaptation: body stacking

The most impactful responsive change is the body grid. At desktop, the flagship stage and utility rail sit side-by-side in a 2fr/1fr split. At tablet and mobile, they stack vertically (flagship first, rail below), giving both regions full width.

This is implemented in the shell's `getBodyStyle(tier, hasRail)`:
- `tier === 'desktop' && hasRail` → `gridTemplateColumns: '2fr 1fr'`
- Otherwise → `gridTemplateColumns: '1fr'`

### What does NOT change between tiers

The flagship card grid (`minmax(240px, 1fr)`) and shelf card grid (`minmax(180px, 1fr)`) use CSS auto-fill which naturally reflows to fewer columns at narrower widths. No tier-specific override is needed — the grids adapt via their min-width constraints.

## 3. Hierarchy Preservation Rules

### What must remain primary at all widths

| Element | Rule |
|---------|------|
| **Flagship stage** | Always renders first in the body, before the utility rail. Never suppressed by responsive rules. |
| **Command band** | Always visible at all tiers. Search and actions may wrap but are never hidden. |
| **Launcher identity** | "Work Hub" title always visible in the command band. |

### What may compress or subordinate

| Element | Adaptation |
|---------|-----------|
| **Utility rail** | Moves from right column (desktop) to below flagship (tablet/mobile). This subordinates it further at narrow widths — correct. |
| **Shell padding** | Reduces from 16px to 12px at mobile for density. |
| **Shell gap** | Reduces from 16px to 12px at mobile. |

### What must NOT happen

| Prohibited | Why |
|-----------|-----|
| Flattening flagship and shelf cards to equal weight | Hierarchy must survive all widths |
| Hiding the flagship stage at any width | It's the primary content |
| Making the rail visually compete with flagship at narrow widths | Stacking must not equalize visual weight |
| Hiding "All Platforms" at narrow widths | Users need inventory access on all devices |

## 4. Structural Coding Plan

### `LauncherCompositionShell.tsx` (updated)

**Changes:**
- Added `tier` prop of type `ResponsiveTier` (defaults to `'desktop'`)
- `getShellStyle(tier)` — compact padding/gap at mobile
- `getBodyStyle(tier, hasRail)` — side-by-side at desktop, stacked at tablet/mobile
- Static styles (`flagshipStageStyle`, `utilityRailStyle`, `shelvesStyle`) unchanged — they don't need tier awareness

### `ToolLauncherWorkHub.tsx` (updated)

**Changes:**
- Imports and calls `useResponsiveTier()` hook
- Passes `tier` to `LauncherCompositionShell`

### No changes to region components

`LauncherCommandBand`, `LauncherFlagshipStage`, `LauncherFlagshipCard`, `LauncherUtilityRail`, `LauncherWorkflowShelves`, `LauncherShelfCard`, `LauncherAllPlatformsOverlay`, and `LauncherIndexRow` are not modified in this prompt. Their auto-fill grids and flexible layouts handle width reduction naturally. Deeper per-component adaptation is Phase 07 Prompt 02 scope.

## 5. Guardrails

| Must not | Reason |
|----------|--------|
| Invent a separate mobile launcher product | Responsive adaptation, not a new product |
| Flatten hierarchy at narrow widths | Flagship cards must remain visually primary over shelf cards at all tiers |
| Hide launcher regions at narrow widths | All regions visible; layout adapts but content doesn't disappear |
| Hard-code pixel breakpoints in components | Use the existing `useResponsiveTier()` hook — single source of truth |
| Fight SharePoint host scroll/chrome | The shell uses inline positioning, not fixed/absolute viewport tricks |
| Push responsive logic into `@hbc/ui-kit` | Launcher-specific responsive rules stay local |
| Override auto-fill grid behavior with forced column counts | CSS auto-fill naturally reflows — don't fight it |
