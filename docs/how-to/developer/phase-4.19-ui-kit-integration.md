# How-To: Wire HbcAppShell into an App (Phase 4.19)

**Audience:** Developers
**Category:** How-to (goal-oriented)

## Goal

Replace the unstyled `ShellLayout` from `@hbc/shell` with the fully-styled `HbcAppShell` from
`@hbc/ui-kit` in any app that needs the HB Intel design system shell (dark header, connectivity
bar, sidebar, bottom nav, Field Mode).

## Prerequisites

- App has `@hbc/ui-kit`, `@hbc/auth`, `@hbc/shell`, and `@hbc/models` as workspace dependencies
- App uses TanStack Router (for `onNavigate` wiring)

## Steps

### 1. Create Bridge Functions

`HbcAppShell` expects `SidebarNavGroup[]` and `ShellUser`, while the Zustand stores provide
`SidebarItem[]` and `ICurrentUser`. Create bridge functions:

```typescript
import { createElement } from 'react';
import type { ICurrentUser } from '@hbc/models';
import type { SidebarItem } from '@hbc/shell';
import type { SidebarNavGroup, ShellUser } from '@hbc/ui-kit';
import { DrawingSheet } from '@hbc/ui-kit'; // or any icon

export function mapNavStoreToSidebarGroups(
  items: SidebarItem[],
  groupLabel: string,
  groupId: string,
): SidebarNavGroup[] {
  if (items.length === 0) return [];
  return [{
    id: groupId,
    label: groupLabel,
    items: items.map((item) => ({
      id: item.id,
      label: item.label,
      icon: createElement(DrawingSheet, { size: 'sm' }),
      href: `/${groupId}/${item.id}`,
    })),
  }];
}

export function mapCurrentUserToShellUser(user: ICurrentUser | null): ShellUser | null {
  if (!user) return null;
  return {
    id: user.id,
    displayName: user.displayName,
    email: user.email,
    initials: user.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
  };
}
```

### 2. Update Root Route

Replace `ShellLayout` import with `HbcAppShell`:

```typescript
import { HbcAppShell } from '@hbc/ui-kit';
import { useCurrentUser, useAuthStore } from '@hbc/auth';
import { useNavStore } from '@hbc/shell';

function RootComponent() {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const sidebarItems = useNavStore((s) => s.sidebarItems);
  const activeWorkspace = useNavStore((s) => s.activeWorkspace);

  return (
    <HbcAppShell
      mode="pwa"
      user={mapCurrentUserToShellUser(currentUser)}
      sidebarGroups={mapNavStoreToSidebarGroups(sidebarItems, ...)}
      onNavigate={(href) => void router.navigate({ to: href })}
      onSignOut={() => useAuthStore.getState().clear()}
    >
      <Outlet />
    </HbcAppShell>
  );
}
```

### 3. Keep FluentProvider in App.tsx

Do **not** remove the outer `FluentProvider` — auth loading states (MsalGuard spinner) render
before the router loads, so they need a FluentProvider. `HbcAppShell`'s inner FluentProvider
handles theme switching for the main app tree.

## What You Get

- Dark `#1E1E1E` header at 56px height
- Green 2px connectivity bar above header
- Collapsible sidebar (240px expanded, 56px collapsed)
- Field Mode toggle in user menu
- Responsive bottom nav on viewports < 1024px
- Full Griffel CSS styling from the HB Intel Design System

## Notes

- SPFx webpart apps do **not** need this — they get the shell from the Application Customizer
- The `@hbc/shell` package and its stores remain the source of truth for navigation state
