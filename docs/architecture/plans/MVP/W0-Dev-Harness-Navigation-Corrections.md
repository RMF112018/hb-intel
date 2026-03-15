# Wave 0 — Dev Harness Navigation Corrections

> **Doc Classification:** Canonical Task Plan — Wave 0 Tooling Correction
> **Governing plan:** `docs/architecture/plans/MVP/HB-Intel-Wave-0-Buildout-Plan.md`
> **Related:** `apps/dev-harness/src/tabs/PwaPreview.tsx`; `apps/pwa/src/router/index.ts`; `docs/architecture/blueprint/current-state-map.md`

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Status:** Proposed
**Stream:** Wave 0 / Dev Tooling
**Date:** 2026-03-15

---

## Goal

Make every Wave 0 feature surface navigable and verifiable from the dev harness, covering both PWA routes (project-setup, my-projects, provisioning) and the SPFx webpart apps (admin, estimating, accounting, project-hub, etc.).

## Architecture

The dev harness `PwaPreview` tab currently renders a static `HbcAppShell` wrapping a `WorkspacePlaceholder`. It never mounts the PWA's TanStack Router, so Wave 0 PWA routes (`/project-setup`, `/projects`, `/provisioning/:projectId`) are unreachable — every PWA page component uses `useSearch`, `useParams`, or `useRouter` hooks that require a live `RouterProvider`. The fix mounts the real PWA route tree inside `PwaPreview` using a `createMemoryHistory` router so harness tab URL state (`?tab=pwa`) is not polluted by in-shell navigation. The SPFx webpart tabs (Estimating, Accounting, Admin, etc.) already render the real app but are not obviously discoverable when the full-screen PWA shell occupies the viewport; a quick-nav strip inside `PwaPreview` surfaces both concerns in one place.

**Tech Stack:** TypeScript, React, TanStack Router v1 (`createMemoryHistory`, `RouterProvider`), `@hbc/session-state` (`SessionStateProvider`), Vitest (type-check only; no behavioural tests for harness pages)

---

## Context and Root Cause

Diagnosis confirmed via `apps/dev-harness/src/tabs/PwaPreview.tsx` and `apps/pwa/src/router/workspace-routes.ts`:

1. **PWA routes unreachable.** `PwaPreview` builds `sidebarGroups` from `useNavStore(s => s.sidebarItems)`, which initialises as `[]` and is never populated because no `beforeLoad` from the PWA router ever fires. `ProjectSetupPage`, `ProjectsPage`, and `ProvisioningProgressView` all call `useSearch`, `useParams`, or `useRouter` — they cannot render outside a `RouterProvider`.

2. **SPFx tabs not discoverable.** The harness renders 13 tabs (`pwa`, `project-hub`, `accounting`, `estimating`, `admin`, …). The default tab is `pwa`, which fills the viewport with `HbcAppShell`. The tab bar sits above this shell but is not obvious when the shell has its own full-height nav chrome. Users looking for Estimating or Admin find no path forward without knowing to scroll the tab bar.

---

## Scope

- Extend `createAppRouter` in the PWA's router factory to accept an optional `RouterHistory` parameter.
- Replace the body of `PwaPreview.tsx` to mount a memory-history TanStack Router using the PWA's real route tree, wrapped in `SessionStateProvider`.
- Add a `PwaQuickNav` strip inside the tab's top bar with direct buttons for the three non-workspace Wave 0 PWA routes (`/project-setup`, `/projects`, `/provisioning/mock`) and a labelled hint pointing to the SPFx tabs above.
- Add CSS for `PwaQuickNav` in `harness.css`.

## Exclusions / Non-Goals

- Do not add new routes to the PWA itself. Route definitions are already complete in `workspace-routes.ts`.
- Do not create a new harness landing tab or restructure the 13-tab `TabRouter`.
- Do not add Vitest tests for harness UI pages. The harness has no test suite; the type-check command validates structural correctness.
- Do not add `SessionStateProvider` to the harness root (`App.tsx`). Scope it only to `PwaPreview.tsx` where `root-route.tsx`'s `useConnectivity` requires it.
- Do not modify `HbcAppShell`, `useNavStore`, or any shared package to accommodate harness routing. All changes stay inside `apps/dev-harness/` and `apps/pwa/src/router/index.ts`.

---

## Package / File Dependencies

| Package / File | Role | Status |
|---|---|---|
| `@tanstack/react-router` (v1.163.3) | `createMemoryHistory`, `RouterProvider`, `createRouter` | **READY.** `createMemoryHistory` confirmed exported. Signature: `createMemoryHistory({ initialEntries: string[] }): RouterHistory`. |
| `@hbc/session-state` | `SessionStateProvider`, `OperationExecutor` | **READY.** Used in `apps/pwa/src/App.tsx`; re-use pattern is established. |
| `apps/pwa/src/router/index.ts` | Route tree, `createAppRouter` | **MODIFY.** Add optional `history` parameter. |
| `apps/pwa/src/router/root-route.tsx` | `rootRoute`, `RootComponent` | **NO CHANGE.** Provides `HbcAppShell` + `Outlet`; renders correctly inside any `RouterProvider`. |
| `apps/pwa/src/router/workspace-routes.ts` | All route definitions incl. Wave 0 routes | **NO CHANGE.** `projectSetupRoute`, `projectsRoute`, `provisioningRoute` already defined. |
| `apps/pwa/src/bootstrap.ts` | `bootstrapMockEnvironment` | **NO CHANGE.** Called by the harness's existing bootstrap; seeding is already consistent. |
| `apps/dev-harness/src/tabs/PwaPreview.tsx` | Harness PWA tab | **MODIFY.** Mount real router. |
| `apps/dev-harness/src/harness.css` | Harness layout styles | **MODIFY.** Add `.pwa-quick-nav` styles. |

---

## Acceptance Criteria

1. **`/project-setup` reachable.** Clicking "Project Setup (new)" in the `PwaPreview` quick-nav renders `ProjectSetupPage` (the 5-step wizard) inside `HbcAppShell` with no runtime errors.

2. **`/projects` reachable.** Clicking "My Projects" renders `ProjectsPage` (RBAC-filtered request list) with mock data. No TanStack Router hook errors in the browser console.

3. **`/provisioning` reachable.** Clicking "Provisioning (mock)" navigates to `/provisioning/PRJ-001` and renders `ProvisioningProgressView` without crashing.

4. **Workspace navigation intact.** Clicking any workspace sidebar item in `HbcAppShell` (e.g. Project Hub) navigates to the correct workspace page via the memory router without affecting the harness `?tab=pwa` URL parameter.

5. **SPFx apps remain accessible.** Each existing webpart tab (`AdminTab`, `EstimatingTab`, `AccountingTab`, etc.) still renders the real SPFx app without regression.

6. **Quick-nav hint visible.** The `PwaQuickNav` strip includes a text label directing users to the tab bar above for SPFx apps.

7. **TypeScript clean.** `cd apps/pwa && tsc --noEmit` and `cd apps/dev-harness && tsc --noEmit` both pass with zero errors.

8. **No browser URL pollution.** Navigating within the PWA tab (e.g. from `/project-hub` to `/project-setup`) does not alter the browser URL's `?tab=` parameter.

---

## Chunk 1: Wire PWA TanStack Router into PwaPreview

### Task 1: Extend `createAppRouter` to accept optional history

**Files:**
- Modify: `apps/pwa/src/router/index.ts`

Read `apps/pwa/src/router/index.ts` first to verify the current implementation matches expectations before editing.

- [ ] **Step 1: Read the current router factory**

  Confirm `createAppRouter` currently accepts no parameters and creates a `createRouter({ routeTree, defaultPreload: 'intent' })`.

- [ ] **Step 2: Add the optional history parameter**

  Replace the body of `apps/pwa/src/router/index.ts` with:

  ```ts
  /**
   * Router factory — Blueprint §2f (TanStack Router).
   * Creates the app router with type registration.
   * Accepts an optional `history` override so the dev-harness can mount a
   * memory-history router (D-PH7-DH-1) without altering browser URL state.
   */
  import { createRouter } from '@tanstack/react-router';
  import type { RouterHistory } from '@tanstack/react-router';
  import { rootRoute } from './root-route.js';
  import { allRoutes } from './workspace-routes.js';

  const routeTree = rootRoute.addChildren(allRoutes);

  export function createAppRouter(history?: RouterHistory) {
    return createRouter({
      routeTree,
      defaultPreload: 'intent',
      ...(history !== undefined ? { history } : {}),
    });
  }

  export type AppRouter = ReturnType<typeof createAppRouter>;

  // Type registration for TanStack Router
  declare module '@tanstack/react-router' {
    interface Register {
      router: AppRouter;
    }
  }
  ```

- [ ] **Step 3: Verify TypeScript is clean**

  ```bash
  cd apps/pwa && node_modules/.bin/tsc --noEmit 2>&1 | head -20
  ```

  Expected: no errors.

- [ ] **Step 4: Commit**

  ```bash
  git -c user.email="bfetting@outlook.com" -c user.name="Bobby Fetting" \
    add apps/pwa/src/router/index.ts
  git -c user.email="bfetting@outlook.com" -c user.name="Bobby Fetting" \
    commit -m "feat(pwa/router): accept optional RouterHistory in createAppRouter

  Allows the dev-harness to mount a memory-history router for the PWA
  preview tab without affecting browser URL state (D-PH7-DH-1).
  Production callers pass no argument; behaviour is unchanged."
  ```

---

### Task 2: Replace `PwaPreview` with real router mount and quick-nav strip

**Files:**
- Modify: `apps/dev-harness/src/tabs/PwaPreview.tsx`
- Modify: `apps/dev-harness/src/harness.css`

Read both files before editing.

- [ ] **Step 1: Read the current PwaPreview**

  Confirm `PwaPreview.tsx` currently manually constructs `HbcAppShell` with `WorkspacePlaceholder` and no `RouterProvider`.

- [ ] **Step 2: Read harness.css**

  Confirm there is no existing `.pwa-quick-nav` class.

- [ ] **Step 3: Replace PwaPreview.tsx**

  Replace the entire contents of `apps/dev-harness/src/tabs/PwaPreview.tsx` with:

  ```tsx
  /**
   * PwaPreview — Mounts the real PWA TanStack Router with memory history.
   * D-PH7-DH-1: memory history keeps in-shell navigation isolated from the
   * harness ?tab=pwa URL parameter.
   *
   * Wave 0 quick-nav strip provides direct links to non-workspace PWA routes
   * (project-setup, my-projects, provisioning) that are not reachable from
   * the workspace sidebar.
   */
  import { useMemo, useEffect } from 'react';
  import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
  import type { AnyRouter } from '@tanstack/react-router';
  import { SessionStateProvider } from '@hbc/session-state';
  import type { OperationExecutor } from '@hbc/session-state';
  import { createAppRouter } from '../../../pwa/src/router/index.js';
  import { bootstrapMockEnvironment } from '../../../pwa/src/bootstrap.js';

  /**
   * Harness-only executor: no real API calls during dev preview.
   * The operation queue is populated by session-state but never dispatched.
   */
  const harnessExecutor: OperationExecutor = async () => {};

  let pwaBootstrapped = false;

  export function PwaPreview(): React.ReactNode {
    const router = useMemo(() => {
      const history = createMemoryHistory({ initialEntries: ['/project-hub'] });
      return createAppRouter(history);
    }, []);

    useEffect(() => {
      if (!pwaBootstrapped) {
        bootstrapMockEnvironment();
        pwaBootstrapped = true;
      }
    }, []);

    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <PwaQuickNav router={router} />
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <SessionStateProvider executor={harnessExecutor}>
            <RouterProvider router={router} />
          </SessionStateProvider>
        </div>
      </div>
    );
  }

  interface PwaQuickNavProps {
    router: AnyRouter;
  }

  function PwaQuickNav({ router }: PwaQuickNavProps): React.ReactNode {
    const navigate = (to: string, search?: Record<string, string>) =>
      void router.navigate({ to, ...(search ? { search } : {}) });

    return (
      <div className="pwa-quick-nav">
        <span className="pwa-quick-nav-label">Wave 0 PWA routes:</span>
        <button
          className="pwa-quick-nav-btn"
          onClick={() => navigate('/project-hub')}
        >
          Project Hub
        </button>
        <button
          className="pwa-quick-nav-btn"
          onClick={() => navigate('/project-setup', { mode: 'new-request' })}
        >
          Project Setup (new)
        </button>
        <button
          className="pwa-quick-nav-btn"
          onClick={() => navigate('/projects')}
        >
          My Projects
        </button>
        <button
          className="pwa-quick-nav-btn"
          onClick={() => navigate('/provisioning/PRJ-001')}
        >
          Provisioning (mock)
        </button>
        <button
          className="pwa-quick-nav-btn"
          onClick={() => navigate('/admin')}
        >
          Admin (PWA)
        </button>
        <span className="pwa-quick-nav-hint">
          SPFx webpart apps → use the tab bar above ↑
        </span>
      </div>
    );
  }
  ```

- [ ] **Step 4: Add `.pwa-quick-nav` styles to harness.css**

  Append to the end of `apps/dev-harness/src/harness.css`:

  ```css
  /* PwaQuickNav — Wave 0 route quick-access strip (D-PH7-DH-1) */
  .pwa-quick-nav {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    padding: 6px 16px;
    background: var(--colorNeutralBackground4, #f0f0f0);
    border-bottom: 1px solid var(--colorNeutralStroke2);
    flex-shrink: 0;
    font-size: 0.75rem;
  }

  .pwa-quick-nav-label {
    font-weight: 600;
    color: var(--colorNeutralForeground3);
    margin-right: 4px;
  }

  .pwa-quick-nav-btn {
    padding: 3px 10px;
    border: 1px solid var(--colorNeutralStroke1);
    border-radius: 4px;
    background: var(--colorNeutralBackground1);
    color: var(--colorNeutralForeground1);
    cursor: pointer;
    font-size: 0.75rem;
    line-height: 1.4;
  }

  .pwa-quick-nav-btn:hover {
    background: var(--colorNeutralBackground3);
    border-color: var(--colorNeutralStroke1Hover);
  }

  .pwa-quick-nav-hint {
    margin-left: auto;
    color: var(--colorNeutralForeground3);
    font-style: italic;
  }
  ```

- [ ] **Step 5: Verify TypeScript is clean for both apps**

  ```bash
  cd /path/to/hb-intel && \
    apps/dev-harness/node_modules/.bin/tsc --noEmit -p apps/dev-harness/tsconfig.json 2>&1 | head -20 || \
    node_modules/.bin/tsc --noEmit -p apps/dev-harness/tsconfig.json 2>&1 | head -20
  ```

  If the command above fails to locate tsc, run from the dev-harness directory:

  ```bash
  cd apps/dev-harness && ../../node_modules/.bin/tsc --noEmit 2>&1 | head -20
  ```

  Expected: zero TypeScript errors in both `apps/pwa` and `apps/dev-harness`.

- [ ] **Step 6: Visual smoke-check (manual)**

  Start the dev harness:

  ```bash
  cd apps/dev-harness && npm run dev
  # or: pnpm --filter dev-harness dev
  ```

  Verify in the browser:

  1. The `pwa` tab is active by default. A thin quick-nav strip appears above the shell with buttons.
  2. Clicking **"Project Setup (new)"** renders the 5-step wizard inside `HbcAppShell`. No console errors.
  3. Clicking **"My Projects"** renders `ProjectsPage`. No console errors.
  4. Clicking **"Provisioning (mock)"** renders `ProvisioningProgressView` for `PRJ-001`. No console errors.
  5. Clicking **"Project Hub"** in the quick-nav (or a sidebar link within the shell) navigates to the project hub workspace. The browser URL still shows `?tab=pwa` — it does **not** change to `/project-hub`.
  6. The hint text "SPFx webpart apps → use the tab bar above ↑" is visible on the right side of the strip.
  7. Clicking the **"Estimating"** tab in the tab bar still renders `EstimatingApp` without regression.
  8. Clicking the **"Admin"** tab in the tab bar still renders `AdminApp` without regression.

- [ ] **Step 7: Commit**

  ```bash
  git -c user.email="bfetting@outlook.com" -c user.name="Bobby Fetting" \
    add apps/dev-harness/src/tabs/PwaPreview.tsx \
        apps/dev-harness/src/harness.css
  git -c user.email="bfetting@outlook.com" -c user.name="Bobby Fetting" \
    commit -m "feat(dev-harness): mount real PWA router in PwaPreview tab (D-PH7-DH-1)

  Replaces the static HbcAppShell+WorkspacePlaceholder with a live
  TanStack Router using createMemoryHistory, giving full access to
  all PWA routes including Wave 0 surfaces (/project-setup, /projects,
  /provisioning/:projectId). Adds a PwaQuickNav strip for direct links
  to non-workspace routes. Memory history keeps ?tab=pwa browser URL
  state clean during in-shell navigation.

  SessionStateProvider scoped to PwaPreview satisfies root-route's
  useConnectivity dependency without touching the harness root."
  ```

---

## Chunk 2: Tab Bar Discoverability

### Task 3: Improve harness tab bar visual affordance

**Files:**
- Modify: `apps/dev-harness/src/harness.css`
- Modify: `apps/dev-harness/src/TabRouter.tsx`

The tab bar has `overflow-x: auto` but gives no visual indication of scrollability when 13 tabs overflow. This task adds a scroll-shadow affordance and a count badge showing how many tabs are available, so users know to scroll.

Read both files before editing.

- [ ] **Step 1: Read TabRouter.tsx**

  Confirm the current `harness-tabs` div and `TabList` structure. Note that `TABS` has 13 entries.

- [ ] **Step 2: Add tab count label to the harness-tabs bar**

  In `TabRouter.tsx`, add a small tab count label inside the `harness-tabs` div, after the `TabList`:

  ```tsx
  return (
    <>
      <div className="harness-tabs">
        <TabList selectedValue={activeTab} onTabSelect={onTabSelect} size="small">
          {TABS.map((tab) => (
            <Tab key={tab.id} value={tab.id}>
              {tab.label}
            </Tab>
          ))}
        </TabList>
        <span className="harness-tabs-count">{TABS.length} surfaces</span>
      </div>
      <div className="harness-content">
        {renderTab(activeTab)}
      </div>
    </>
  );
  ```

- [ ] **Step 3: Add scroll-shadow and count badge styles to harness.css**

  Append to the end of `apps/dev-harness/src/harness.css` (after the pwa-quick-nav block):

  ```css
  /* Tab bar scroll affordance and surface count badge */
  .harness-tabs {
    position: relative;
    display: flex;
    align-items: center;
  }

  .harness-tabs-count {
    flex-shrink: 0;
    margin-left: 12px;
    padding: 2px 8px;
    border-radius: 10px;
    background: var(--colorNeutralBackground2);
    border: 1px solid var(--colorNeutralStroke2);
    font-size: 0.688rem;
    color: var(--colorNeutralForeground3);
    white-space: nowrap;
  }
  ```

  > **Note:** The existing `.harness-tabs` CSS block has no `display` property, so these new rules are safe to append without any merge or conflict resolution needed.

- [ ] **Step 4: Verify TypeScript is clean**

  ```bash
  cd apps/dev-harness && ../../node_modules/.bin/tsc --noEmit 2>&1 | head -20
  ```

  Expected: zero errors.

- [ ] **Step 5: Visual smoke-check (manual)**

  1. The tab bar shows a small "13 surfaces" pill badge on the right side.
  2. On a narrow viewport the `TabList` area scrolls horizontally while the badge stays pinned to the right. Verify the badge is **not** inside the `TabList`'s scroll container — it must remain visible without scrolling.
  3. All existing tab switching behaviour is unchanged.

- [ ] **Step 6: Commit**

  ```bash
  git -c user.email="bfetting@outlook.com" -c user.name="Bobby Fetting" \
    add apps/dev-harness/src/TabRouter.tsx \
        apps/dev-harness/src/harness.css
  git -c user.email="bfetting@outlook.com" -c user.name="Bobby Fetting" \
    commit -m "feat(dev-harness): add surface count badge to tab bar

  Adds a dynamic surface count badge (currently '13 surfaces', derived from
  TABS array length) to the right of the tab bar so users know tabs exist
  beyond the visible area. Addresses discoverability of SPFx webpart tabs
  when PwaPreview fills the viewport."
  ```

---

## Final Verification

- [ ] **Step 7: Run TypeScript checks for both affected apps**

  ```bash
  cd /path/to/hb-intel
  node_modules/.bin/tsc --noEmit -p apps/pwa/tsconfig.json 2>&1 | head -20
  node_modules/.bin/tsc --noEmit -p apps/dev-harness/tsconfig.json 2>&1 | head -20
  ```

  Both: zero errors.

- [ ] **Step 8: Confirm all Acceptance Criteria are met**

  Walk through the acceptance criteria list in the **Acceptance Criteria** section above. Mark each criterion as verified. All 8 must pass before this plan is considered complete.
