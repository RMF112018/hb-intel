# HbcAppShell

Application shell layout component providing header, sidebar, and content area structure.

## Import

```tsx
import { HbcAppShell } from '@hbc/ui-kit';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| user | ShellUser | required | Current user object with name, role, avatar |
| navItems | SidebarNavGroup[] | required | Navigation menu structure |
| children | ReactNode | required | Main content area |
| onProjectChange | (projectId: string) => void | - | Callback when project selection changes |

### ShellUser

| Property | Type | Description |
|----------|------|-------------|
| name | string | User display name |
| role | string | User system role label |
| avatar | string | Avatar URL or initials |
| email | string | User email address |

### SidebarNavGroup

| Property | Type | Description |
|----------|------|-------------|
| label | string | Group heading |
| items | SidebarNavItem[] | Menu items in group |

### SidebarNavItem

| Property | Type | Description |
|----------|------|-------------|
| label | string | Link text |
| href | string | Navigation target |
| icon | ReactNode | Icon element |
| badge | string | Optional badge (unread count) |
| children | SidebarNavItem[] | Nested items (collapsible groups) |

## Usage

```tsx
<HbcAppShell
  user={{
    name: 'John Doe',
    role: 'Project Manager',
    avatar: 'https://...',
    email: 'john@example.com',
  }}
  navItems={[
    {
      label: 'Work',
      items: [
        { label: 'Dashboard', href: '/dashboard', icon: <DashIcon /> },
        { label: 'Projects', href: '/projects', icon: <ProjectIcon /> },
      ],
    },
  ]}
  onProjectChange={(projId) => setActiveProject(projId)}
>
  <main>{/* Your page content */}</main>
</HbcAppShell>
```

## Mode Switching (PH4B.10 — D-09)

`HbcAppShell` automatically switches chrome based on the resolved `AppMode`:

| Mode | Chrome | Detection |
|------|--------|-----------|
| `office` | HbcHeader + HbcSidebar + content (sidebar margin) | Viewport > 767px AND not HB Site Control |
| `field` | HbcHeader + content (no sidebar) + HbcBottomNav | Viewport ≤ 767px OR HB Site Control app |

### useFieldMode Hook

```ts
import { useFieldMode } from '@hbc/ui-kit';
// or from '@hbc/app-shell'

const { isFieldMode, mode, toggleFieldMode, theme } = useFieldMode();
// mode: 'office' | 'field'
// isFieldMode: boolean (mode === 'field')
// toggleFieldMode: manual toggle (no-op when auto-detected as field)
// theme: 'light' | 'field'
```

**Auto-detection priority:**
1. Mobile viewport (≤ 767px) → always `'field'`
2. HB Site Control app (`data-hbc-app="hb-site-control"`) → always `'field'`
3. Desktop with no override → `'office'`
4. Desktop with manual toggle → user's choice

### supportedModes Guard

Pages can declare which modes they support via `WorkspacePageShell`:

```tsx
<WorkspacePageShell
  layout="form"
  title="Risk Assessment"
  supportedModes={['office']}  // Only available in office mode
>
  {/* content */}
</WorkspacePageShell>
```

If `supportedModes` is omitted, all modes are supported (default).

## Field Mode Behavior

The app shell adapts fully to Field Mode. Header background remains dark (no change needed). Content area background inherits document dark mode. In field mode, `HbcSidebar` is hidden and `HbcBottomNav` appears at the bottom. All navigation items and interactive elements use Field Mode color palette.

## Accessibility

- Header marked with `role="banner"`
- Navigation sidebar marked with `role="navigation"` and `aria-label="Main navigation"`
- Main content area marked with `role="main"`
- User menu button has `aria-haspopup="menu"` and `aria-expanded`
- Active nav item has `aria-current="page"`
- Sidebar toggle button has clear aria-label
- Focus indicators visible on all interactive elements
- Skip link to main content available for keyboard users
- Project selector properly labeled with aria-label

## SPFx Constraints

No SPFx-specific constraints.
