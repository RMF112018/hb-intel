# PH7-BW-8 — Dev Harness Integration: SPFx Webpart Preview Tabs

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md §1 (dev-harness tab structure)
**Date:** 2026-03-07
**Priority:** MEDIUM — Required for efficient development workflow; without this, webpart dev requires SharePoint Workbench
**Depends on:** BW-4 (Vite configs define dev server ports 4001–4011)
**Blocks:** BW-10 (Playwright E2E tests run against dev harness tabs)

---

## Summary

The Blueprint specifies:
> `apps/dev-harness/` — Vite dev harness (tabs for PWA, each webpart, HB Site Control; mocks Azure Functions)

Currently, the dev harness exists for the PWA but does not have tabs for any of the 11 SPFx webparts. Developers must either use the SharePoint Workbench (requires a live tenant and network access) or run each webpart's Vite dev server independently and navigate to `https://localhost:400X` directly.

This task adds embedded tab views for all 11 webparts inside the dev harness, making it possible to develop and test all SPFx webpart UIs without a SharePoint tenant.

---

## Dev Harness Architecture

The dev harness renders each app in one of two ways:
1. **Direct import** — imports the app's `App.tsx` directly (for same-origin rendering, best for most webparts)
2. **IFrame embed** — embeds the webpart dev server via `<iframe src="https://localhost:400X">` (for port-isolated testing that simulates SharePoint's iframe loading)

For SPFx webpart development, **direct import** is preferred because:
- No cross-origin restrictions in dev mode
- DevToolbar persona switcher affects the shared Zustand stores correctly
- React DevTools and Vitest can observe the component tree
- IFrame is still available as an option for testing SPFx-specific quirks

---

## Current Dev Harness Structure

```
apps/dev-harness/src/
├── App.tsx              # Tab container
├── main.tsx             # Entry point
└── tabs/
    └── PwaTabs.tsx      # PWA tab(s)
```

Target structure after BW-8:
```
apps/dev-harness/src/
├── App.tsx
├── main.tsx
└── tabs/
    ├── PwaTabs.tsx
    ├── AccountingTab.tsx
    ├── EstimatingTab.tsx
    ├── ProjectHubTab.tsx
    ├── LeadershipTab.tsx
    ├── BusinessDevelopmentTab.tsx
    ├── AdminTab.tsx
    ├── SafetyTab.tsx
    ├── QualityControlWarrantyTab.tsx
    ├── RiskManagementTab.tsx
    ├── OperationalExcellenceTab.tsx
    └── HumanResourcesTab.tsx
```

---

## Webpart Tab Component Pattern

Each tab follows this pattern (shown for Accounting):

```typescript
// apps/dev-harness/src/tabs/AccountingTab.tsx
import { App as AccountingApp } from '../../accounting/src/App.js';
import { bootstrapMockEnvironment } from '../../accounting/src/bootstrap.js';
import { useEffect } from 'react';

// Bootstrap mock environment when this tab mounts
// (In the real SPFx environment, bootstrapSpfxAuth() does this instead)
let bootstrapped = false;

export function AccountingTab(): React.ReactNode {
  useEffect(() => {
    if (!bootstrapped) {
      bootstrapMockEnvironment();
      bootstrapped = true;
    }
  }, []);

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <AccountingApp />
    </div>
  );
}
```

Note: The `bootstrapped` flag prevents double-bootstrapping when the tab mounts/unmounts (e.g., tab switching). Each webpart's router uses `createMemoryHistory` so tab switching does not lose route state.

---

## Dev Harness App.tsx Tab Registration

```typescript
// apps/dev-harness/src/App.tsx

import { useState } from 'react';
import { TabList, Tab, makeStyles } from '@fluentui/react-components';
import { PwaTabs } from './tabs/PwaTabs.js';
import { AccountingTab } from './tabs/AccountingTab.js';
import { EstimatingTab } from './tabs/EstimatingTab.js';
import { ProjectHubTab } from './tabs/ProjectHubTab.js';
import { LeadershipTab } from './tabs/LeadershipTab.js';
import { BusinessDevelopmentTab } from './tabs/BusinessDevelopmentTab.js';
import { AdminTab } from './tabs/AdminTab.js';
import { SafetyTab } from './tabs/SafetyTab.js';
import { QualityControlWarrantyTab } from './tabs/QualityControlWarrantyTab.js';
import { RiskManagementTab } from './tabs/RiskManagementTab.js';
import { OperationalExcellenceTab } from './tabs/OperationalExcellenceTab.js';
import { HumanResourcesTab } from './tabs/HumanResourcesTab.js';

type TabId =
  | 'pwa' | 'accounting' | 'estimating' | 'project-hub' | 'leadership'
  | 'business-development' | 'admin' | 'safety' | 'quality-control-warranty'
  | 'risk-management' | 'operational-excellence' | 'human-resources';

const TABS: Array<{ id: TabId; label: string; component: React.ComponentType }> = [
  { id: 'pwa', label: 'PWA', component: PwaTabs },
  { id: 'accounting', label: 'Accounting', component: AccountingTab },
  { id: 'estimating', label: 'Estimating', component: EstimatingTab },
  { id: 'project-hub', label: 'Project Hub', component: ProjectHubTab },
  { id: 'leadership', label: 'Leadership', component: LeadershipTab },
  { id: 'business-development', label: 'BD', component: BusinessDevelopmentTab },
  { id: 'admin', label: 'Admin', component: AdminTab },
  { id: 'safety', label: 'Safety', component: SafetyTab },
  { id: 'quality-control-warranty', label: 'QC/W', component: QualityControlWarrantyTab },
  { id: 'risk-management', label: 'Risk', component: RiskManagementTab },
  { id: 'operational-excellence', label: 'OE', component: OperationalExcellenceTab },
  { id: 'human-resources', label: 'HR', component: HumanResourcesTab },
];

export function App(): React.ReactNode {
  const [activeTab, setActiveTab] = useState<TabId>('pwa');
  const ActiveComponent = TABS.find((t) => t.id === activeTab)!.component;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TabList
        selectedValue={activeTab}
        onTabSelect={(_, data) => setActiveTab(data.value as TabId)}
        style={{ padding: '0 16px', borderBottom: '1px solid #e0e0e0', flexShrink: 0 }}
      >
        {TABS.map((tab) => (
          <Tab key={tab.id} value={tab.id}>{tab.label}</Tab>
        ))}
      </TabList>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <ActiveComponent />
      </div>
    </div>
  );
}
```

---

## Dev Harness Package Dependencies

The dev harness must include all 11 webpart apps as workspace dependencies:

```json
// apps/dev-harness/package.json
{
  "name": "dev-harness",
  "dependencies": {
    "@hbc/ui-kit": "workspace:*",
    "@hbc/auth": "workspace:*",
    "@hbc/shell": "workspace:*",
    "accounting": "workspace:*",
    "estimating": "workspace:*",
    "project-hub": "workspace:*",
    "leadership": "workspace:*",
    "business-development": "workspace:*",
    "admin": "workspace:*",
    "safety": "workspace:*",
    "quality-control-warranty": "workspace:*",
    "risk-management": "workspace:*",
    "operational-excellence": "workspace:*",
    "human-resources": "workspace:*"
  }
}
```

Note: Workspace dependency references use the `name` field from each app's `package.json`. Verify the `name` field of each app's `package.json` matches.

---

## Dev Harness Vite Config Update

The dev harness Vite config must resolve `@hbc/*` aliases and include all webpart app `src/` directories:

```typescript
// apps/dev-harness/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@hbc/models': resolve(__dirname, '../../packages/models/src/index.ts'),
      '@hbc/data-access': resolve(__dirname, '../../packages/data-access/src/index.ts'),
      '@hbc/query-hooks': resolve(__dirname, '../../packages/query-hooks/src/index.ts'),
      '@hbc/ui-kit': resolve(__dirname, '../../packages/ui-kit/src/index.ts'),
      '@hbc/auth': resolve(__dirname, '../../packages/auth/src/index.ts'),
      '@hbc/auth/spfx': resolve(__dirname, '../../packages/auth/src/spfx/index.ts'),
      '@hbc/shell': resolve(__dirname, '../../packages/shell/src/index.ts'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
```

---

## Store Isolation Note

All 11 webpart apps and the PWA share the same Zustand store singletons when rendered in the dev harness (since they all import the same `@hbc/auth` and `@hbc/shell` packages). This means:

- Switching tabs does NOT reset the auth store — the persona selected in one tab persists to another (by design, as this matches real SharePoint behavior where users have consistent identity across webparts)
- The DevToolbar persona switcher in any tab affects all tabs (also by design)
- If a tab needs isolated store state for testing (e.g., testing "accounting manager can't see admin features"), use the DevToolbar to switch personas before switching tabs

---

## IFrame Mode (Alternative)

For testing SPFx-specific context isolation, add an optional iframe mode toggle to each tab:

```typescript
// Pattern for iframe mode (opt-in per tab)
function AccountingTab(): React.ReactNode {
  const [iframeMode, setIframeMode] = useState(false);
  return iframeMode
    ? <iframe src="https://localhost:4001" style={{ width: '100%', height: '100%', border: 'none' }} />
    : <DirectAccountingTab />;
}
```

---

## Verification

```bash
# Start dev harness
pnpm --filter="./apps/dev-harness" dev

# Expected: opens on http://localhost:3000 with 12 tabs (PWA + 11 webparts)
# All tabs should render without import errors

# TypeScript check
pnpm turbo run typecheck --filter="./apps/dev-harness"
```

**Manual tests:**
- All 12 tabs render without white-screen errors
- Switching between tabs does not lose route state within each tab
- DevToolbar persona switcher is accessible from PWA tab and affects persona context
- Accounting tab shows correct workspace name and back-to-hub affordance

---

## Definition of Done

- [x] 11 webpart tab components created in `apps/dev-harness/src/tabs/`
- [x] `apps/dev-harness/src/TabRouter.tsx` updated with all 13 tabs (PWA + 11 webparts + site-control)
- [x] `apps/dev-harness/package.json` includes all 11 webpart apps as workspace dependencies
- [x] Dev harness Vite config resolves `@hbc/*` aliases including `@hbc/auth/spfx`
- [x] `pnpm turbo run build` passes (24/24 green)
- [x] All 13 tabs render and are navigable
- [x] TypeScript compiles without errors

<!-- IMPLEMENTATION PROGRESS & NOTES
BW-8 completed: 2026-03-08
- Created 11 tab components in apps/dev-harness/src/tabs/ (AccountingTab through HumanResourcesTab)
- Each tab directly imports the webpart's App component and calls bootstrapMockEnvironment() on mount
- Module-level bootstrapped flag prevents double-bootstrap across tab switches
- Updated TabRouter.tsx: replaced TAB_TO_WORKSPACE + WebpartPreview with TAB_TO_COMPONENT map
- Added @hbc/auth/spfx alias to vite.config.ts (before @hbc/auth for correct Vite match order)
- Added all 11 @hbc/spfx-* workspace dependencies to package.json
- Extracted TanStack Router Register declarations from all 11 router/index.ts into register.d.ts files
  to prevent TS2717 conflicts when dev-harness compiles all webparts in a single compilation context
- WebpartPreview.tsx retained but unreferenced (available for simplified-shell-only testing)
- Build verified: 24/24 green
-->
