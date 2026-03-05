# HbcBottomNav

Fixed bottom navigation bar for tablet and mobile viewports with overflow menu and Focus Mode support.

## Import

```tsx
import { HbcBottomNav } from '@hbc/ui-kit';
import type { HbcBottomNavProps, BottomNavItem } from '@hbc/ui-kit';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| items | BottomNavItem[] | required | Navigation items |
| activeId | string | undefined | ID of the currently active navigation item |
| onNavigate | (href: string) => void | undefined | Navigation handler |
| className | string | undefined | Additional CSS class |

### BottomNavItem

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | yes | Unique item identifier |
| label | string | yes | Display label |
| icon | ReactNode | yes | Icon element |
| href | string | yes | Navigation target |

## Usage

```tsx
<HbcBottomNav
  items={[
    { id: 'home', label: 'Home', icon: <HomeIcon />, href: '/dashboard' },
    { id: 'rfis', label: 'RFIs', icon: <RfiIcon />, href: '/rfis' },
    { id: 'daily', label: 'Daily Log', icon: <LogIcon />, href: '/daily-log' },
    { id: 'photos', label: 'Photos', icon: <CameraIcon />, href: '/photos' },
    { id: 'more', label: 'Docs', icon: <DocIcon />, href: '/documents' },
  ]}
  activeId="home"
  onNavigate={(href) => router.push(href)}
/>
```

## Overflow Behavior

- First 4 items are shown directly in the nav bar
- Beyond 4 items, a "More" button appears that opens a bottom sheet
- The bottom sheet slides in with animation, includes a drag handle, and has a backdrop overlay
- Sheet max-height is 60vh with scrollable overflow

## Focus Mode

The bottom nav listens for a custom `hbc-focus-mode-change` window event (`detail: { active: boolean }`). When Focus Mode is active, the nav bar hides completely.

## Field Mode Behavior

In Field Mode, active item uses accent orange. Inactive items use muted gray. Background adapts via `hbcFieldTheme` tokens.

## Accessibility

- Uses `<nav>` element with `role="navigation"` and aria-label
- All items are keyboard accessible (Enter/Space)
- Active item indicated via `aria-current="page"`
- Safe area insets for iOS notch devices via `env(safe-area-inset-bottom)`

## SPFx Constraints

No SPFx-specific constraints. Fixed positioning at viewport bottom with 56px height.
