# Shell Package — Component Export Reference

## Overview

`@hbc/shell` exports components at three tiers. Understanding which tier a component belongs
to prevents subtle integration errors.

## Tier 1 — Public API (App Integration Surface)

These exports are designed for direct use in consuming apps (`apps/pwa`, `apps/dev-harness`,
`apps/spfx`).

| Export | Purpose |
|--------|---------|
| `ShellCore` | Primary integration surface. Mounts the full shell including auth lifecycle, connectivity bar, feature gates, and all layout components. Requires a `ShellEnvironmentAdapter`. |
| `useAuthStore` | (re-exported via `@hbc/auth`) Central auth state store. |

### ShellCore Integration

```tsx
import { ShellCore } from '@hbc/shell';

// In app root:
<ShellCore adapter={myAdapter} />
```

## Tier 2 — Internal Composition (ShellCore Only)

These components are exported for type compatibility and testing but are **not designed for
direct app use**. They require context provided by `ShellCore` and will behave incorrectly
when mounted outside of it.

| Component | Reason for restriction |
|-----------|----------------------|
| `HeaderBar` | Reads shell status snapshot and auth state from ShellCore-managed context |
| `AppLauncher` | Requires feature registration context to render workspace list |
| `ProjectPicker` | Reads project store state managed by ShellCore's lifecycle |
| `BackToProjectHub` | Navigation semantics tied to ShellCore's router integration |
| `ContextualSidebar` | Receives sidebar groups from ShellCore's nav composition |
| `ShellLayout` | Pure layout wrapper for ShellCore's render tree |

**Do not import these directly into app components.** If you need to customize their
behavior, extend `ShellCore` via its props (`renderStatusRail`, `sidebarSlot`, etc.) or
file an architectural discussion.

## Tier 3 — Utility & Hook API

These exports are designed for direct app use, typically during the transition period before
`ShellCore` is fully adopted.

| Export | Usage context |
|--------|--------------|
| `resolveRoleLandingPath` | Post-auth navigation: get the correct landing path for a user's roles |
| `captureIntendedDestination` | Pre-auth navigation: save the user's intended path before redirect |
| `resolvePostGuardRedirect` | Post-auth: restore the saved intended destination |
| `clearRedirectMemory` | Clear stored redirect target after use or on sign-out |
| `isSafeRedirectPath` | Validate paths before storing as redirect targets |
| `runShellSignOutCleanup` | Orchestrated sign-out with store teardown and cleanup |
| `createDefaultShellSignOutCleanupDependencies` | Create default cleanup dependency set |
| `resolveShellStatusSnapshot` | Derive `ShellStatusSnapshot` from auth and connectivity state |
| `startPhase`, `endPhase` | Startup timing instrumentation |
| `getSnapshot`, `validateBudgets` | Startup timing reporting and budget validation |
| `defineProtectedFeatureRegistration` | Define a feature's access control contract |
| `createProtectedFeatureRegistry` | Build a registry from an array of contracts |
| `validateProtectedFeatureRegistration` | Validate a contract at startup |

## Phase 2 Note (PH8)

Once `ShellCore` is adopted as the primary mounting strategy:
- All Tier 3 utility calls from `root-route.tsx` (redirect memory, role landing, connectivity bar, sign-out) will be removed from the app layer
- `ShellCore` handles these natively via its adapter interface
- The Tier 3 exports will remain available for edge cases and testing
