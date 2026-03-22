# HbcSidebar

Collapsible navigation rail with icon-only collapsed mode, expanded label mode, governed active-state system, and live count badges.

## Import

```tsx
import { HbcSidebar } from '@hbc/ui-kit';
import type { SidebarNavItem, SidebarNavGroup } from '@hbc/ui-kit';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| groups | SidebarNavGroup[] | required | Navigation groups with items |
| activeItemId | string | undefined | ID of the currently active nav item |
| onNavigate | (href: string) => void | undefined | Navigation callback |
| onToggleFavorite | (id: string) => void | undefined | Favorite toggle callback |

### SidebarNavItem

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| id | string | required | Unique item identifier |
| label | string | required | Display label (visible expanded, tooltip collapsed) |
| icon | ReactNode | required | Icon element for the rail |
| href | string | required | Navigation target |
| badge | number | undefined | Live count badge. Hidden at 0. |
| isFavorite | boolean | undefined | Favorite state |
| requiredPermission | string | undefined | Permission gate — item hidden if not met |

## Dimensions

| Property | Value | Token |
|----------|-------|-------|
| Collapsed width | 56px | `HBC_SIDEBAR_WIDTH_COLLAPSED` |
| Expanded width | 240px | `HBC_SIDEBAR_WIDTH_EXPANDED` |
| Nav item min-height | 36px (desktop), 44px (coarse pointer) | — |
| Active left border | 3px | `--hbc-nav-item-active-border` |

## Active State

Active nav item is determined by `activeItemId` matching `item.id`. A single `isActive` boolean drives both visual and ARIA state:

- **Visual:** Orange 3px left border (`--hbc-nav-item-active-border`), brand background (`--hbc-nav-item-active-bg`), `fontWeight: 600`, `colorBrandForeground1`
- **ARIA:** `aria-current="page"` on the active button
- **Data attribute:** `data-active="true"` for testing/styling hooks

Inactive items use `colorNeutralForeground2` (muted) with `fontWeight: 400`.

## Hover / Pressed States

- **Hover:** `colorNeutralBackground3Hover` background, `colorBrandForeground1` text
- **Pressed:** `colorNeutralBackground3Pressed` background, `transform: scale(0.98)`
- **Transition:** 150ms ease on `background-color, color, border-color`

## Collapsed Mode

When collapsed (56px icon rail):
- Labels hidden; each nav item shows a **Fluent Tooltip** (`relationship="label"`, `positioning="after"`) on hover/focus
- Active item: orange icon color + orange left border
- Badge: positioned absolute `top: 4px; right: 8px` near the icon

## Expanded Mode

When expanded (240px):
- Full labels visible
- Badge: inline after label text, flexbox aligned
- Group labels visible with uppercase header treatment

## Badges

Live count badges render when `item.badge > 0`:

- **Style:** Red pill (`HBC_STATUS_COLORS.error`), white text, 16px min-width, 8px border-radius
- **Collapsed:** Absolute positioned near icon (14px size)
- **Expanded:** Inline after label (16px size)
- **Hidden at zero:** Badge element not rendered when count is 0
- **99+ cap:** Counts above 99 display as "99+"
- **Accessibility:** `aria-label` on the button includes badge count (e.g., "My Work, 3 items need attention")

## Expand/Collapse Toggle

Bottom-pinned button with:
- `aria-expanded={isExpanded}`
- `aria-controls="hbc-sidebar-nav"` referencing the nav scroll container
- `aria-label` that changes with state ("Collapse sidebar" / "Expand sidebar")
- Collapse/Expand icon swap

**Keyboard:** Pressing Escape when sidebar is expanded collapses it.

## Group Semantics

Navigation groups render with:
- `role="group"` on the group container
- `aria-label={group.label}` for screen reader context
- Visual group label `aria-hidden` when collapsed

## Responsive Behavior

| Context | Sidebar | Navigation |
|---------|---------|------------|
| Desktop office (≥1024px) | Visible, push model | Sidebar |
| Tablet/mobile (<1024px) | Hidden | `HbcBottomNav` |
| Field mode | Hidden | `HbcBottomNav` always |
| Focus mode | Hidden | N/A |

Desktop uses a **push model** — main content `marginLeft` transitions with `TRANSITION_NORMAL` + cubic-bezier. No overlay/backdrop is used on desktop.

## CSS Custom Properties

Set on the sidebar root element for theme overridability:

| Property | Default value |
|----------|---------------|
| `--hbc-sidebar-bg` | `var(--colorNeutralBackground1)` |
| `--hbc-sidebar-border` | `var(--colorNeutralStroke1)` |
| `--hbc-nav-item-active-border` | `HBC_ACCENT_ORANGE` |
| `--hbc-nav-item-active-bg` | `var(--colorBrandBackground2)` |

## Data Attributes

| Attribute | Value | Purpose |
|-----------|-------|---------|
| `data-hbc-ui` | `"sidebar"` | Component identification |
| `data-expanded` | `"true"/"false"` | Current expansion state |
| `data-active` | `"true"` | On active nav item |

## Skip Link

`HbcAppShell` renders a skip-to-content link (`<a href="#hbc-main-content">`) as the first focusable element. It appears on first Tab press and moves focus to the `<main id="hbc-main-content">` element.

## SPFx Constraints

Sidebar is not rendered in SPFx/embed mode — bottom nav is used instead. The `mode` prop on `HbcAppShell` controls this via `showSidebar = appMode === 'office' && !isTablet`.

## Accessibility Summary

- `aria-current="page"` on active item
- Fluent Tooltip on collapsed items (`relationship="label"`)
- `aria-expanded` + `aria-controls` on toggle button
- `role="group"` + `aria-label` on nav groups
- Badge counts in `aria-label`
- Skip-to-content link at shell level
- 36px desktop / 44px coarse-pointer touch targets
