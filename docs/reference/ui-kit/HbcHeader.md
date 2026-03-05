# HbcHeader

Fixed 56px dark header bar with logo, project selector, toolbox, favorites, search, create button, notifications, and user menu.

## Import

```tsx
import { HbcHeader } from '@hbc/ui-kit';
import type { HbcHeaderProps } from '@hbc/ui-kit';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| user | { id, displayName, email, avatarUrl?, initials? } | undefined | Current user object |
| logo | ReactNode | "HB" fallback | Logo element for left section |
| onSignOut | () => void | undefined | Sign-out handler |
| onCreateClick | () => void | undefined | Create button click handler |
| onSearchOpen | () => void | undefined | Search open handler |
| onNotificationsOpen | () => void | undefined | Notifications open handler |
| onProjectSelect | (projectId: string) => void | undefined | Project selection handler |
| onToolboxOpen | () => void | undefined | Toolbox open handler |

## Usage

```tsx
<HbcHeader
  user={{ id: '1', displayName: 'Jane Smith', email: 'jane@hbc.com' }}
  onSignOut={handleSignOut}
  onCreateClick={() => setShowCreate(true)}
  onSearchOpen={() => setSearchOpen(true)}
/>
```

## Layout

3-section flexbox layout:
- **Left:** Logo + HbcProjectSelector
- **Center:** HbcToolboxFlyout + HbcFavoriteTools + HbcGlobalSearch (hidden on mobile < 1024px)
- **Right:** HbcCreateButton + HbcNotificationBell + HbcUserMenu

## Field Mode Behavior

Header uses `HBC_DARK_HEADER` token. In Field Mode, contrast is maintained as the header is already dark. User menu provides Field Mode toggle.

## Accessibility

- Semantic `<header>` element with `role="banner"`
- All interactive sub-components are keyboard accessible
- Focus management flows left-to-right across sections
- Online status indicator adjusts header position offset

## SPFx Constraints

When used via `@hbc/ui-kit/app-shell` entry point, only the header and connectivity bar are included to keep the SPFx bundle lean.
