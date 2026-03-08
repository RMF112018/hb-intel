# PH7-BW-6 — Simplified Shell & Cross-Webpart Navigation

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md §2c (Procore-aligned navigation, simplified shells for webparts)
**Date:** 2026-03-07
**Priority:** MEDIUM — UX completeness; back-to-project-hub is a core user affordance in every non-hub webpart
**Depends on:** BW-1 through BW-4 (at least one domain fully scaffolded before wiring nav)
**Blocks:** nothing (but PH7 feature routes cannot be fully usable without this)

---

## Summary

The Blueprint specifies (§2c):
> "Simplified Shells: Breakout webparts/HB Site Control omit picker/launcher for focus."
> "Global Project Persistence: Zustand `projectStore`; persists across workspaces. In non-Project-Hub, add emphasized 'Back to the Project Hub {Project Name}' section in tool picker."

Currently, all 11 `root-route.tsx` files render `<ShellLayout mode="simplified">` — the simplified shell renders, but:
1. There is no back-to-project-hub affordance
2. There is no domain tool picker (the sidebar navigation for the tools within each workspace)
3. There is no project context display (showing which project is currently active)
4. The simplified shell receives no domain-specific configuration

This task wires the full simplified shell experience for all 11 webparts.

---

## What "Simplified Shell" Must Include

**Present in all 11 non-PWA webparts:**
- HB Intel branding bar (logo, app name) — no project picker, no waffle launcher
- Domain tool picker (contextual sidebar or toolbar showing navigation within this domain)
- Current project indicator (if the domain is project-scoped — see table below)
- **Back to Project Hub** section: prominent link that navigates the user to the Project Hub webpart for the currently active project (or opens the PWA Project Hub if no SP context)

**Absent in all 11 webparts (PWA-only features):**
- ProjectPicker (the cross-project selector — only in Project Hub)
- AppLauncher / waffle grid (full workspace switcher — only in PWA)

---

## Project Scope Classification

| Domain | Project-Scoped? | Back-to-Hub Behavior |
|---|---|---|
| accounting | ✅ Yes | Link to Project Hub for active project |
| estimating | ✅ Yes | Link to Project Hub for active project |
| project-hub | ⛔ No (IS the hub) | — (no back-to-hub in the hub itself) |
| leadership | ✅ Yes | Link to Project Hub for active project |
| business-development | ❌ No (portfolio-level) | Show "Projects" link to PWA or SP hub site list |
| admin | ❌ No (tenant-level) | No back-to-hub (admin is cross-project) |
| safety | ✅ Yes | Link to Project Hub for active project |
| quality-control-warranty | ✅ Yes | Link to Project Hub for active project |
| risk-management | ✅ Yes | Link to Project Hub for active project |
| operational-excellence | ❌ No (org-level) | No back-to-hub |
| human-resources | ❌ No (org-level) | No back-to-hub |

---

## ShellLayout Props Extension

First, verify or extend the `ShellLayout` component in `packages/shell/src/ShellLayout/` to accept simplified shell configuration props:

```typescript
// packages/shell/src/ShellLayout/types.ts

export interface SimplifiedShellConfig {
  /** Domain identifier shown in the branding bar */
  workspaceName: string;
  /** Domain-specific navigation items for the tool picker / sidebar */
  toolPickerItems: ToolPickerItem[];
  /** Whether to show the Back to Project Hub affordance */
  showBackToProjectHub: boolean;
  /** URL pattern for the Project Hub site (SP site URL + /webpart path) */
  projectHubUrl?: string;
}

export interface ToolPickerItem {
  label: string;
  path: string;
  icon?: string;
}

export interface ShellLayoutProps {
  mode: 'full' | 'simplified';
  /** Required when mode === 'simplified' */
  simplifiedConfig?: SimplifiedShellConfig;
  children: React.ReactNode;
}
```

---

## Back-to-Project-Hub Link Component

Create in `packages/shell/src/BackToProjectHub/BackToProjectHub.tsx`:

```typescript
import { useProjectStore } from '../stores/projectStore.js';
import { makeStyles, tokens, Link } from '@fluentui/react-components';
import { ArrowLeft20Regular } from '@fluentui/react-icons';

interface BackToProjectHubProps {
  projectHubBaseUrl?: string; // e.g., https://[tenant].sharepoint.com/sites/project-hub
}

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    backgroundColor: tokens.colorNeutralBackground2,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase300,
  },
  projectName: {
    color: tokens.colorBrandForeground1,
    fontStyle: 'italic',
  },
});

export function BackToProjectHub({ projectHubBaseUrl }: BackToProjectHubProps): React.ReactNode | null {
  const activeProject = useProjectStore((s) => s.activeProject);

  if (!activeProject) return null;

  const hubUrl = projectHubBaseUrl
    ? `${projectHubBaseUrl}?projectId=${activeProject.id}`
    : `/project-hub?projectId=${activeProject.id}`;

  return (
    <div className={useStyles().root}>
      <ArrowLeft20Regular />
      <Link href={hubUrl}>
        Back to Project Hub —{' '}
        <span className={useStyles().projectName}>{activeProject.name}</span>
      </Link>
    </div>
  );
}
```

---

## Updated root-route.tsx Pattern

Each webpart's `root-route.tsx` must be updated from the generic simplified shell to the domain-configured version:

```typescript
// apps/accounting/src/router/root-route.tsx

import { createRootRoute, Outlet } from '@tanstack/react-router';
import { ShellLayout } from '@hbc/shell';
import type { SimplifiedShellConfig } from '@hbc/shell';

const ACCOUNTING_SHELL_CONFIG: SimplifiedShellConfig = {
  workspaceName: 'Accounting',
  showBackToProjectHub: true,
  toolPickerItems: [
    { label: 'Overview', path: '/' },
    { label: 'Invoices', path: '/invoices' },
    { label: 'Budgets', path: '/budgets' },
  ],
};

function RootComponent(): React.ReactNode {
  return (
    <ShellLayout mode="simplified" simplifiedConfig={ACCOUNTING_SHELL_CONFIG}>
      <Outlet />
    </ShellLayout>
  );
}

export const rootRoute = createRootRoute({ component: RootComponent });
```

---

## Per-Domain Tool Picker Items

| Domain | Tool Picker Items |
|---|---|
| accounting | Overview · Invoices · Budgets |
| estimating | Project Setup · Bids · Templates · New Request |
| project-hub | Dashboard · Preconstruction · Documents · Team |
| leadership | Portfolio Overview · KPI Dashboard |
| business-development | Opportunities · Pipeline |
| admin | System Settings · Provisioning Failures · Error Log |
| safety | Dashboard · Incidents · Inspections |
| quality-control-warranty | Punch List · Warranty Claims · Inspections |
| risk-management | Risk Register · Contingency · Reports |
| operational-excellence | Process Metrics · Improvement Log |
| human-resources | Org Chart · Onboarding · Directory |

*These items must match the routes registered in each domain's `routes.ts`. Paths are added progressively as feature pages are built.*

---

## Project Hub URL Configuration

The `projectHubBaseUrl` is a runtime value that varies by SharePoint tenant. It must not be hardcoded. Strategy:

1. In SPFx mode: derive from `getSpfxContext().pageContext.site.absoluteUrl` (available via BW-2)
2. In mock/dev mode: use `http://localhost:4003` (project-hub dev server from BW-4)

```typescript
// packages/shell/src/utils/resolveProjectHubUrl.ts
import { resolveAuthMode } from '@hbc/auth';

export function resolveProjectHubUrl(): string {
  const mode = resolveAuthMode();
  if (mode === 'spfx') {
    // In SPFx: navigate to the SharePoint site hosting the Project Hub webpart
    // This requires the SP hub site URL — stored in a webpart property or tenant config
    return (window as Window & { _hbIntelProjectHubUrl?: string })._hbIntelProjectHubUrl
      ?? '/sites/project-hub';
  }
  // Dev/mock: point to local project-hub dev server
  return 'http://localhost:4003';
}
```

---

## Verification

```bash
# Build accounting and check root-route.tsx exports
pnpm turbo run build --filter="./apps/accounting"

# TypeScript check for ShellLayout prop changes
pnpm turbo run typecheck --filter="./packages/shell"
pnpm turbo run typecheck --filter="./apps/accounting"

# Grep to confirm all 11 root-route.tsx files have simplifiedConfig
grep -rn "simplifiedConfig" apps/*/src/router/root-route.tsx
# Expected: 11 matches
```

**Manual verification:**
- Start dev harness (`pnpm dev --filter="./apps/dev-harness"`)
- Navigate to Accounting tab — confirm HB Intel branding bar renders with "Back to Project Hub — Harbor View Medical Center" when a project is active
- Confirm no AppLauncher or ProjectPicker is visible
- Confirm tool picker shows accounting-specific nav items

---

## Definition of Done

- [ ] `ShellLayout` accepts `SimplifiedShellConfig` prop in `simplified` mode
- [ ] `BackToProjectHub` component created in `packages/shell/`
- [ ] All 11 `root-route.tsx` files updated with domain-specific `SimplifiedShellConfig`
- [ ] Back-to-project-hub shows correct project name from `useProjectStore`
- [ ] Back-to-project-hub link omitted for project-hub, admin, business-development, operational-excellence, human-resources
- [ ] Tool picker items match routes in each domain's `routes.ts`
- [ ] `resolveProjectHubUrl()` handles SPFx and mock modes
- [ ] TypeScript compiles without errors
- [ ] Visual manual test confirms simplified shell renders correctly in dev harness
