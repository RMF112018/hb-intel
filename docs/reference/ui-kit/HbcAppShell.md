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

## Field Mode Behavior

The app shell adapts fully to Field Mode. Header background remains dark (no change needed). Sidebar background, text, and icons adapt to dark theme with proper contrast. Content area background inherits document dark mode. All navigation items and interactive elements in the shell use Field Mode color palette.

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
