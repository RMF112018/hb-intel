# Phase 4.4 — Global Application Shell (Developer Guide)

**Reference:** PH4.4-UI-Design-Plan.md §4.1–4.3 | Blueprint §1f, §2c

## Overview

Phase 4.4 delivers the global application shell chrome for HB Intel: a connectivity bar, dark header, collapsible sidebar, and orchestrator component. All components live in `packages/ui-kit/src/HbcAppShell/` and compose existing design tokens, icons, and shell stores.

## Components

| Component | Purpose |
|-----------|---------|
| `HbcConnectivityBar` | 2px ambient strip showing online/syncing/offline status |
| `HbcHeader` | 56px dark header with project selector, search, create, notifications, user menu |
| `HbcSidebar` | Collapsible sidebar (56px collapsed / 240px expanded) with role-filtered nav groups |
| `HbcAppShell` | Orchestrator composing bar + header + sidebar + main content area |

### Header Sub-Components

| Component | Purpose |
|-----------|---------|
| `HbcProjectSelector` | Active project name + searchable dropdown via `useProjectStore` |
| `HbcToolboxFlyout` | Grid-icon flyout (role-filtered, Phase 5 content) |
| `HbcFavoriteTools` | Up to 6 starred tool icons |
| `HbcGlobalSearch` | Search input with Cmd/Ctrl+K shortcut |
| `HbcCreateButton` | Orange CTA button |
| `HbcNotificationBell` | Bell icon with unread count badge |
| `HbcUserMenu` | Avatar dropdown with Field Mode toggle and sign out |

## Hooks

| Hook | Purpose | Returns |
|------|---------|---------|
| `useOnlineStatus` | Browser connectivity detection (navigator.onLine + SW messages) | `ConnectivityStatus` |
| `useFieldMode` | Dark theme toggle with localStorage persistence | `{ isFieldMode, toggleFieldMode, theme }` |
| `useSidebarState` | Sidebar expand/collapse with localStorage + responsive breakpoint | `{ isExpanded, isMobile, toggle }` |
| `useKeyboardShortcut` | Registers Cmd/Ctrl+key handlers | `void` |

## Usage

```tsx
import { HbcAppShell } from '@hbc/ui-kit';
import type { SidebarNavGroup } from '@hbc/ui-kit';

const groups: SidebarNavGroup[] = [
  {
    id: 'operations',
    label: 'Operations',
    items: [
      { id: 'rfis', label: 'RFIs', icon: <RFI size="md" />, href: '/rfis' },
    ],
  },
];

function App() {
  return (
    <HbcAppShell user={currentUser} sidebarGroups={groups}>
      <YourPageContent />
    </HbcAppShell>
  );
}
```

## Key Design Decisions

- All colors sourced from `theme/tokens.ts` — no hardcoded values
- Griffel `makeStyles` for all styling with `shorthands` for border/borderRadius properties
- Mobile (< 1024px): sidebar hidden entirely (bottom nav is future scope)
- Field Mode toggle persists via localStorage and sets `data-theme="field"` on `<html>`
- Components are tree-shakable for future SPFx bundling (Phase 5)

## Storybook

Run `pnpm --filter @hbc/ui-kit storybook` and navigate to the **Shell** section for:
- `HbcConnectivityBar` — Online, Syncing, Offline states
- `HbcHeader` — Default, No User, With Avatar
- `HbcSidebar` — Expanded, Collapsed, Role-Filtered
- `HbcAppShell` — Full Light, Full Field Mode
