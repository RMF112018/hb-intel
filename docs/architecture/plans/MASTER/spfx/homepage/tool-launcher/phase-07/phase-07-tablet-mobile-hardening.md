# Phase 07 — Tablet / Mobile Layout Hardening

## 1. What Changed

### Components updated with tier-aware behavior

| Component | Changes |
|-----------|---------|
| **LauncherCommandBand** | Added `tier` prop. Mobile: 2-column grid (title + actions), search hidden, "Need Help" hidden, compact padding/gap, shorter supporting line. Tablet/desktop: unchanged 3-column grid. |
| **LauncherFlagshipStage** | Added `tier` prop. Mobile: grid min-width reduced from 240px to 160px, gap reduced from 16px to 12px. Tablet/desktop: unchanged. |
| **ToolLauncherWorkHub** | Passes `tier` to command band and flagship stage. |

### Components unchanged (already responsive)

| Component | Why no changes needed |
|-----------|----------------------|
| **LauncherCompositionShell** | Already tier-aware from P07-01 (body stacks at tablet/mobile) |
| **LauncherFlagshipCard** | Column layout and auto-fill grid handle narrowing naturally |
| **LauncherUtilityRail** | Section cards are full-width within the rail; stacking handles narrowing |
| **LauncherWorkflowShelves** | `minmax(180px, 1fr)` auto-fill grid reflows naturally |
| **LauncherShelfCard** | Horizontal row layout with ellipsis handles narrowing |
| **LauncherAllPlatformsOverlay** | Single-column list layout, scrollable body — inherently narrow-safe |
| **LauncherIndexRow** | Horizontal row with flex and ellipsis — narrow-safe |

## 2. Region-by-Region Behavior

### Command band

| Tier | Grid | Search | "Need Help" | Padding | Supporting line |
|------|------|--------|-------------|---------|-----------------|
| Desktop | `auto 1fr auto` | Visible | Visible | 10px × 16px | Full (count + tagline) |
| Tablet | `auto 1fr auto` | Visible | Visible | 10px × 16px | Full |
| Mobile | `auto 1fr` | Hidden | Hidden | 8px × 10px | Short (count only) |

**Why search is hidden on mobile:** The overlay search (opened via "All Platforms") provides the same functionality. The command band search placeholder was read-only anyway — hiding it avoids a dead input on small screens.

**Why "Need Help" is hidden on mobile:** Preserves density. Help links remain accessible in the utility rail.

### Flagship stage

| Tier | Grid min-width | Gap | Card count (typical) |
|------|---------------|-----|---------------------|
| Desktop | 240px | 16px | 2–3 per row |
| Tablet | 240px | 16px | 1–2 per row |
| Mobile | 160px | 12px | 1–2 per row |

Flagship cards remain column-layout with 56px logo container at all tiers. The min-width reduction allows cards to fit in narrower contexts without horizontal overflow.

### Utility rail

| Tier | Position | Width |
|------|----------|-------|
| Desktop | Right column (2fr/1fr split) | ~33% of body |
| Tablet | Below flagship (stacked) | 100% of body |
| Mobile | Below flagship (stacked) | 100% of body |

At tablet/mobile, stacking gives the rail full width. Section cards (notices, help, access, contacts) render identically — their content-based layout handles narrowing naturally.

### Workflow shelves

| Tier | Grid min-width | Cards per row (typical) |
|------|---------------|------------------------|
| Desktop | 180px | 3–4 |
| Tablet | 180px | 2–3 |
| Mobile | 180px | 1–2 |

Shelf cards use horizontal row layout with ellipsis overflow — they compress naturally. The `minmax(180px, 1fr)` grid reflows without explicit tier logic.

### All-platforms overlay trigger

The "All Platforms" button remains visible at all tiers. On mobile, it's the only action button in the command band (no "Need Help" competing for space). The overlay itself renders identically at all tiers — its single-column list layout is inherently narrow-safe.

## 3. Remaining Layout Debt

| Debt | Phase | Description |
|------|-------|-------------|
| **Overlay mobile sheet** | Future | Overlay uses inline panel at all tiers. Full-screen sheet on mobile could improve usability. |
| **Flagship card compact mode** | Future | Cards maintain full 56px logo and column layout on mobile. A horizontal compact card variant could improve density. |
| **Shelf card single-column** | Future | At very narrow widths (<360px), shelf cards may benefit from a simplified single-column list. |
| **Touch target validation** | Future | All interactive elements meet 44px min-height but haven't been validated with a real touch device. |
| **Orientation change** | P07-01 | `useResponsiveTier` already listens for `orientationchange` events. Tier updates on rotation. |
| **SharePoint narrow web part zone** | Future | SP page editor can place webparts in narrow columns — behavior in <600px contexts untested. |

## 4. Validation Notes

### How tablet/mobile behavior was checked

- **Typecheck:** `tsc --noEmit` passes — all tier props are typed as `ResponsiveTier`
- **Build:** Vite build succeeds (506 KB)
- **Lint:** Zero errors, zero warnings
- **Structural verification:** `useResponsiveTier()` hook is proven in other homepage webparts (`ProjectPortfolioSpotlight` uses it). The tier detection, resize listener, and orientation change handler are battle-tested.
- **CSS auto-fill:** The `minmax()` + `auto-fill` grids reflow correctly by CSS spec — no JS intervention needed for column count adaptation.
- **Conditional rendering:** Mobile search/button hiding uses `{!isMobile && ...}` — clean suppression, no layout shift.

### What was NOT tested

- Real device testing (requires deployment to SharePoint)
- Touch interaction quality
- Screen reader behavior at different tiers
- SharePoint edit mode at narrow widths
