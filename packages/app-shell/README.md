# @hbc/app-shell

PWA facade that combines `@hbc/shell`, `@hbc/auth`, and `@hbc/ui-kit` into a single import point for SPFx / Project Hub shell contexts.

## Exports

| Category | Examples |
|----------|----------|
| Shell navigation & stores | `ShellLayout`, `HeaderBar`, `AppLauncher`, `BackToProjectHub`, `ProjectPicker`, `ContextualSidebar`, `useProjectStore`, `useNavStore`, `WORKSPACE_IDS` |
| Module configs | `scorecardsLanding`, `rfisLanding`, `budgetLanding`, `dailyLogSections`, etc. |
| UI-kit shell components | `HbcAppShell`, `HbcConnectivityBar`, `HbcHeader`, `HbcSidebar`, `HbcProjectSelector`, `HbcToolboxFlyout`, `HbcFavoriteTools`, `HbcGlobalSearch`, `HbcCreateButton`, `HbcNotificationBell`, `HbcUserMenu` |
| WorkspacePageShell | `WorkspacePageShell`, `ListConfigContext` |
| Toast & Feedback | `AppShellLayout`, `useToast` |
| Auth adapter | `useShellAuth` |

## Using HbcConnectivityBar in the PWA

> **Do not import from `@hbc/app-shell` in PWA contexts.** This facade depends on `@hbc/shell`, which carries SPFx-oriented transitive dependencies that should not enter the PWA bundle.

Import `HbcConnectivityBar` directly from `@hbc/ui-kit`:

```tsx
import { HbcConnectivityBar } from '@hbc/ui-kit';

export function PwaRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HbcConnectivityBar />
      {children}
    </>
  );
}
```

The direct `@hbc/ui-kit` import path introduces zero SPFx modules — `HbcConnectivityBar` depends only on `navigator.onLine`, browser events, `@griffel/react`, and `@hbc/shell` types.

## Commands

```bash
pnpm --filter @hbc/app-shell build
pnpm --filter @hbc/app-shell check-types
pnpm --filter @hbc/app-shell lint
```
