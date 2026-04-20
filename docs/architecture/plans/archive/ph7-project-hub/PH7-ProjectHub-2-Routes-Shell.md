# PH7.2 — Project Hub: Routes & Shell Navigation

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · `PH7-ProjectHub-Features-Plan.md`
**Purpose:** Define the TanStack Router route tree for the Project Hub, implement the `ProjectHubApp` shell with sidebar navigation, build the project selector component, and establish the `projectId` context that all downstream feature pages consume.
**Audience:** Implementation agent(s), technical reviewers.
**Implementation Objective:** A fully navigable Project Hub shell where every route is gated by project membership, the sidebar reflects all module sections, and `projectId` is consistently available to every child route component.

---

## Prerequisites

- PH7.1 complete and building cleanly.
- `apps/project-hub` exists with a placeholder root page.
- `@hbc/auth` package provides `useCurrentUser()` and `useProjectMembership(projectId)` hooks.
- `@hbc/ui-kit` `WorkspacePageShell` component available.
- TanStack Router installed in `apps/project-hub`.

---

## 7.2.1 — Route Tree Definition

Define the complete route tree in `apps/project-hub/src/routes/`. Use TanStack Router file-based routing conventions.

```
apps/project-hub/src/routes/
├── __root.tsx                            ← root layout + auth guard
├── index.tsx                             ← /project-hub — project selector landing
├── $projectId/
│   ├── _layout.tsx                       ← project shell layout (sidebar + breadcrumb)
│   ├── index.tsx                         ← /project-hub/:projectId — Home Page
│   ├── preconstruction/
│   │   ├── index.tsx                     ← Preconstruction section landing
│   │   ├── go-no-go.tsx
│   │   ├── kickoff.tsx
│   │   ├── estimate.tsx
│   │   ├── turnover.tsx
│   │   └── autopsy.tsx
│   ├── project-management/
│   │   ├── index.tsx
│   │   ├── pmp.tsx
│   │   ├── raci.tsx
│   │   ├── startup-checklist.tsx
│   │   └── closeout-checklist.tsx
│   ├── safety/
│   │   ├── index.tsx
│   │   ├── sssp.tsx
│   │   ├── jha-log.tsx
│   │   ├── emergency-plans.tsx
│   │   └── incident-reporting.tsx
│   ├── quality-control/
│   │   ├── index.tsx
│   │   ├── checklists.tsx
│   │   ├── $checklistId.tsx              ← individual checklist detail
│   │   └── completion.tsx
│   ├── warranty/
│   │   ├── index.tsx
│   │   ├── requests.tsx
│   │   └── documents.tsx
│   ├── financial/
│   │   ├── index.tsx
│   │   ├── summary.tsx
│   │   ├── gc-gr-forecast.tsx
│   │   └── cash-flow.tsx
│   ├── schedule/
│   │   └── index.tsx
│   ├── buyout-log/
│   │   └── index.tsx
│   ├── permit-log/
│   │   ├── index.tsx
│   │   └── $permitId/
│   │       └── inspections.tsx
│   ├── constraints-log/
│   │   └── index.tsx
│   └── reports/
│       ├── index.tsx
│       ├── px-review.tsx
│       └── owner-report.tsx
```

---

## 7.2.2 — Root Layout & Auth Guard (`__root.tsx`)

```typescript
// apps/project-hub/src/routes/__root.tsx
import { createRootRoute, Outlet, redirect } from '@tanstack/react-router';
import { useCurrentUser } from '@hbc/auth';

export const Route = createRootRoute({
  beforeLoad: async ({ context }) => {
    const user = context.auth?.currentUser;
    if (!user) {
      throw redirect({ to: '/login' });
    }
  },
  component: () => <Outlet />,
});
```

---

## 7.2.3 — Project Selector Landing Page (`index.tsx`)

The root `/project-hub` page renders when no `projectId` is in the URL. It shows the user's assigned projects as cards.

```typescript
// apps/project-hub/src/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { ProjectSelectorPage } from '../pages/ProjectSelectorPage.js';

export const Route = createFileRoute('/')({
  component: ProjectSelectorPage,
});
```

**`ProjectSelectorPage` component requirements:**
- Calls `GET /api/project-hub/my-projects` to fetch the current user's project list.
- Renders each project as an `HbcCard` with `projectNumber`, `projectName`, `projectLocation`, and role badge.
- Clicking a card navigates to `/project-hub/:projectId`.
- Includes a search/filter input for users on many projects.
- Shows an empty state if the user has no assigned projects.

---

## 7.2.4 — Project Shell Layout (`$projectId/_layout.tsx`)

This layout wraps all per-project pages. It:
1. Resolves `projectId` from URL params.
2. Calls `GET /api/project-hub/projects/:projectId` to load `IProjectHubProject`.
3. Validates user is a team member (redirect to `/project-hub` if not).
4. Renders `WorkspacePageShell` with the sidebar navigation.

```typescript
// apps/project-hub/src/routes/$projectId/_layout.tsx
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { WorkspacePageShell } from '@hbc/ui-kit';
import { useProjectHubStore } from '../store/projectHubStore.js';
import { ProjectHubSidebar } from '../components/ProjectHubSidebar.js';

export const Route = createFileRoute('/$projectId/_layout')({
  beforeLoad: async ({ params, context }) => {
    const project = await context.queryClient.ensureQueryData(
      projectQueryOptions(params.projectId)
    );
    if (!project) {
      throw redirect({ to: '/project-hub' });
    }
    // Membership check
    const user = context.auth.currentUser;
    if (!project.teamMemberUpns.includes(user.upn) && user.role !== 'Admin') {
      throw redirect({ to: '/project-hub' });
    }
  },
  component: ProjectShellLayout,
});

function ProjectShellLayout() {
  const { projectId } = Route.useParams();
  return (
    <WorkspacePageShell
      sidebar={<ProjectHubSidebar projectId={projectId} />}
    >
      <Outlet />
    </WorkspacePageShell>
  );
}
```

---

## 7.2.5 — Sidebar Navigation Component

```typescript
// apps/project-hub/src/components/ProjectHubSidebar.tsx

/**
 * Sidebar navigation for the Project Hub.
 * Sections match the module structure from PH7-ProjectHub-Features-Plan.md.
 */

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { label: 'Home', path: '' }, // /project-hub/:projectId
    ],
  },
  {
    label: 'Preconstruction',
    items: [
      { label: 'Go / No-Go', path: '/preconstruction/go-no-go' },
      { label: 'Kickoff Checklist', path: '/preconstruction/kickoff' },
      { label: 'Estimate', path: '/preconstruction/estimate' },
      { label: 'Turnover to Ops', path: '/preconstruction/turnover' },
      { label: 'Post-Bid Autopsy', path: '/preconstruction/autopsy' },
    ],
  },
  {
    label: 'Project Management',
    items: [
      { label: 'Project Management Plan', path: '/project-management/pmp' },
      { label: 'Responsibility Matrix', path: '/project-management/raci' },
      { label: 'Startup Checklist', path: '/project-management/startup-checklist' },
      { label: 'Closeout Checklist', path: '/project-management/closeout-checklist' },
    ],
  },
  {
    label: 'Safety',
    items: [
      { label: 'Site Safety Plan', path: '/safety/sssp' },
      { label: 'JHA Log', path: '/safety/jha-log' },
      { label: 'Emergency Plans', path: '/safety/emergency-plans' },
      { label: 'Incident Reporting', path: '/safety/incident-reporting' },
    ],
  },
  {
    label: 'Quality Control',
    items: [
      { label: 'QC Checklists', path: '/quality-control/checklists' },
      { label: 'QC Completion', path: '/quality-control/completion' },
    ],
  },
  {
    label: 'Financial',
    items: [
      { label: 'Financial Summary', path: '/financial/summary' },
      { label: 'GC / GR Forecast', path: '/financial/gc-gr-forecast' },
      { label: 'Cash Flow', path: '/financial/cash-flow' },
    ],
  },
  {
    label: 'Project Tracking',
    items: [
      { label: 'Schedule', path: '/schedule' },
      { label: 'Buyout Log', path: '/buyout-log' },
      { label: 'Permit Log', path: '/permit-log' },
      { label: 'Constraints Log', path: '/constraints-log' },
    ],
  },
  {
    label: 'Warranty',
    items: [
      { label: 'Warranty Requests', path: '/warranty/requests' },
      { label: 'Warranty Documents', path: '/warranty/documents' },
    ],
  },
  {
    label: 'Reports',
    items: [
      { label: 'PX Review', path: '/reports/px-review' },
      { label: 'Owner Report', path: '/reports/owner-report' },
    ],
  },
];
```

The sidebar component maps over `NAV_SECTIONS` and renders each section with a header and `HbcButton` links. Active route is highlighted using TanStack Router's `useMatchRoute`.

---

## 7.2.6 — Project Hub Zustand Store

```typescript
// apps/project-hub/src/store/projectHubStore.ts
import { create } from 'zustand';
import type { IProjectHubProject } from '@hbc/models';

interface ProjectHubStore {
  currentProject: IProjectHubProject | null;
  setCurrentProject: (project: IProjectHubProject) => void;
  clearCurrentProject: () => void;
}

export const useProjectHubStore = create<ProjectHubStore>((set) => ({
  currentProject: null,
  setCurrentProject: (project) => set({ currentProject: project }),
  clearCurrentProject: () => set({ currentProject: null }),
}));
```

---

## 7.2.7 — Project Header Component

Shown at the top of every project page (inside the shell layout, above page content).

```typescript
// apps/project-hub/src/components/ProjectHeader.tsx

/**
 * Renders: "{projectNumber} — {projectName}" with subtitle showing location and PM name.
 * Includes a back-to-project-selector link.
 */
```

Required fields from `IProjectHubProject`: `projectNumber`, `projectName`, `projectLocation`, `projectManagerName`, `scheduledCompletionDate`.

---

## 7.2.8 — Breadcrumb Navigation

Every page inside `$projectId` renders a breadcrumb:

```
Project Hub > {projectNumber} — {projectName} > {Section} > {Page}
```

Implement using TanStack Router's `useMatches` to build the breadcrumb array dynamically from route segments.

---

## Verification

```bash
pnpm turbo run build --filter=project-hub
# Expected: 0 type errors, routes compile cleanly

# Navigate manually in dev-harness:
# /project-hub → shows ProjectSelectorPage
# /project-hub/FAKE-UUID → redirects to /project-hub (membership guard)
# /project-hub/:validProjectId → renders shell with sidebar
```

<!-- IMPLEMENTATION PROGRESS & NOTES
Task file created: 2026-03-07
Status: Ready for implementation
Next: PH7.3 — Project Hub Home Page
-->
