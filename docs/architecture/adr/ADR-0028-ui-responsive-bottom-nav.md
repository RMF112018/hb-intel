# ADR-0028: Responsive Bottom Navigation Bar

**Status:** Accepted
**Date:** 2026-03-04
**Deciders:** HB Intel Architecture Team
**References:** PH4.14-UI-Design-Plan.md §14 (Responsive Behavior, Bottom Navigation Bar), PH4-UI-Design-Plan.md §8 (Sidebar Navigation), Blueprint V4 §1d

## Context

HB Intel is a field-first PWA used on desktops, tablets, and mobile phones. On desktop viewports (>=1024px), the collapsible icon-rail sidebar provides primary navigation. However, on tablet and mobile viewports (<1024px), the sidebar is hidden to maximize content area. These smaller viewports need an alternative navigation mechanism that is thumb-reachable, familiar to mobile users, and consistent with the sidebar's navigation groups.

Key constraints:

- Construction field workers use the app on iPads and phones in challenging conditions (gloves, sunlight, one-handed use).
- Navigation items must stay synchronized with the sidebar — no duplicate configuration.
- Focus Mode (used during form entry) must suppress the bottom nav to maximize form space.
- iOS standalone PWA mode requires safe area inset handling to avoid the home indicator overlapping the nav bar.

## Decision

Implement a fixed bottom navigation bar (`HbcBottomNav`) for viewports below 1024px width:

### Breakpoint Architecture

- **`useIsMobile` hook:** Detects viewports <=767px (`max-width: 767px` media query match).
- **`useIsTablet` hook:** Detects viewports <=1023px (`max-width: 1023px` media query match). This is separate from `useIsMobile` because certain components (e.g., `HbcModal`, `HbcCommandPalette`) adapt at the mobile breakpoint (768px) while the bottom nav activates at the tablet breakpoint (1024px).

### Bottom Nav Specifications

- **Height:** 56px (matches sidebar collapsed width and touch target requirements from PH4-UI-Design-Plan.md §31).
- **Position:** Fixed to viewport bottom with `z-index: 300` (between overlay backdrop at 200 and modal at 400).
- **Background:** `#1E1E1E` (matches header).
- **Slots:** 4 primary tool shortcuts + 1 "More" overflow button.
- **Active state:** Icon fill `#F37021`, label color `#F37021`.
- **Inactive state:** Icon fill `#A0A0A0`, label color `#A0A0A0`.
- **Safe area:** `padding-bottom: env(safe-area-inset-bottom)` for iOS standalone mode.

### Item Derivation

Bottom nav items are derived from `sidebarGroups` passed to `HbcAppShell`. The first 4 items from the flattened sidebar groups become the primary slots. All remaining items are accessible via the "More" button, which opens a bottom sheet. This ensures zero duplicate navigation configuration — the sidebar definition is the single source of truth.

### Animation

A `slideInFromBottom` keyframe animation is shared across three components:
- `HbcBottomNav` (entry animation on mount)
- `HbcModal` (full-screen slide-up on mobile <768px)
- `HbcCommandPalette` (full-screen slide-up on mobile <768px)

### Focus Mode Integration

When Focus Mode is active (`data-focus-mode="true"` on the document element), the bottom nav is hidden. This prevents navigation distractions during form entry and maximizes the available form area on small screens.

### Component Adaptations at Mobile Breakpoint (<768px)

- **`HbcModal`:** Renders full-screen with `slideInFromBottom` animation. Close button is a 44px touch target in the top-right corner.
- **`HbcCommandPalette`:** Renders full-screen with `slideInFromBottom` animation. The desktop ESC hint is replaced with a visible X close button for touch accessibility.

## Consequences

### Positive

- Consistent navigation across all viewport sizes with zero configuration duplication.
- Thumb-reachable navigation for field workers on tablets and phones.
- iOS safe area handling prevents home indicator overlap in standalone PWA mode.
- Shared `slideInFromBottom` animation creates visual consistency across mobile-adapted components.
- Two separate breakpoint hooks (`useIsMobile` at 767px, `useIsTablet` at 1023px) allow granular component adaptation.

### Negative

- The "More" overflow sheet adds one extra tap for less-frequently-used navigation items on mobile.
- The 56px bottom nav reduces available content height on small screens (mitigated by Focus Mode hiding it during form entry).

### Neutral

- The `bottomNav` z-index (300) must be maintained in the centralized `Z_INDEX` constants to avoid layering conflicts with future components.
- Content areas must account for the 56px bottom nav height via `padding-bottom` on tablet/mobile viewports.

## Related ADRs

- ADR-0017: Global Application Shell (sidebar navigation)
- ADR-0025: UI Interaction Pattern Library (Focus Mode)
- ADR-0027: UI Field Mode Implementation (theme-aware surfaces)
