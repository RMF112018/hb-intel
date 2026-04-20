# PH7.3 — Project Hub: Home Page

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · `PH7-ProjectHub-Features-Plan.md`
**Purpose:** Build the per-project home/dashboard page that serves as the navigation anchor for the Project Hub. The home page provides a status overview across all modules, quick-action shortcuts to key workflows, and a recent project activity feed.
**Audience:** Implementation agent(s), technical reviewers.
**Implementation Objective:** A data-rich home page that gives Project Managers, Superintendents, and Project Executives an immediate at-a-glance understanding of their project's status across all modules.

---

## Prerequisites

- PH7.1 and PH7.2 complete.
- `GET /api/project-hub/projects/:projectId/dashboard` endpoint returning `IProjectDashboard` (defined below).
- `@hbc/ui-kit` components: `HbcCard`, `HbcStatusBadge`, `HbcButton`, `HbcDataTable`.

---

## 7.3.1 — Dashboard Data Shape

```typescript
// packages/models/src/project-hub/IProjectHubProject.ts (add to existing file)

/** Aggregated dashboard snapshot for the Project Hub home page. */
export interface IProjectDashboard {
  projectId: string;
  project: IProjectHubProject;

  // Module status summary cards
  modules: {
    preconstruction: {
      turnoverComplete: boolean;
      kickoffComplete: boolean;
      estimateAttached: boolean;
    };
    projectManagement: {
      pmpComplete: boolean;
      pmpAcknowledgmentsPending: number;
      raciRowCount: number;
      startupChecklistPercent: number;   // 0–100
      closeoutChecklistPercent: number;  // 0–100
    };
    safety: {
      sspComplete: boolean;
      openIncidents: number;
      jhaLogCount: number;
      emergencyPlanAcknowledgmentsPending: number;
    };
    qualityControl: {
      activeChecklists: number;
      failedItemsCount: number;
    };
    financial: {
      forecastCurrentPeriod?: string; // ISO month
      projectedProfit?: number;
      projectedProfitPercent?: number;
      hasBaseline: boolean;
    };
    schedule: {
      scheduledCompletion?: string;
      forecastedCompletion?: string;
      varianceDays?: number;
      status?: MilestoneStatus;
    };
    buyout: {
      percentBuyoutComplete: number;
      totalSubcontracts: number;
      subcontractsBoughtOut: number;
    };
    permits: {
      activePermits: number;
      pendingPermits: number;
      expiringSoon: number; // within 30 days
    };
    constraints: {
      openConstraints: number;
      overdueConstraints: number;
    };
    warranty: {
      openRequests: number;
      documentsExpiringSoon: number;
    };
  };

  // Recent activity feed (last 10 project events across all modules)
  recentActivity: IProjectActivityEvent[];
}

export interface IProjectActivityEvent {
  id: string;
  projectId: string;
  module: string;      // e.g., "Safety", "Buyout Log", "Permits"
  eventType: string;   // e.g., "IncidentReported", "PermitReceived", "ChecklistItemComplete"
  description: string; // Human-readable description of the event
  actorUpn: string;
  actorName: string;
  occurredAt: string;  // ISO timestamp
}
```

---

## 7.3.2 — Home Page Component

```typescript
// apps/project-hub/src/pages/ProjectHomePage.tsx

/**
 * Layout: ProjectHeader → Module Status Grid → Quick Actions Row → Recent Activity Feed
 */
```

**Module Status Grid** — render one `HbcCard` per module section. Each card shows:
- Module name (icon + label)
- Key metric (e.g., "Startup Checklist: 71% complete")
- Status badge (`HbcStatusBadge`): `OnTrack` (green), `AtRisk` (orange), `NeedsAttention` (red), `NotStarted` (gray)
- "Open" button that navigates to the module's primary page

Status badge logic per module:
- **Project Management:** `NeedsAttention` if PMP acknowledgments pending > 0; `OnTrack` otherwise
- **Safety:** `NeedsAttention` if openIncidents > 0; `AtRisk` if emergencyPlanAcknowledgmentsPending > 0
- **Financial:** `NeedsAttention` if projectedProfitPercent < 0; `AtRisk` if no baseline set
- **Schedule:** mirrors `MilestoneStatus` from schedule summary
- **Permits:** `NeedsAttention` if overdueConstraints > 0 or expiringSoon > 0
- **Constraints:** `NeedsAttention` if overdueConstraints > 0; `AtRisk` if openConstraints > 5

**Quick Actions Row** — `HbcButton` shortcuts for the most common actions:
- "Log Incident" → `/safety/incident-reporting`
- "Update Forecast" → `/financial/summary`
- "Add Constraint" → `/constraints-log`
- "View Buyout Log" → `/buyout-log`
- "Create Owner Report" → `/reports/owner-report`

**Recent Activity Feed** — `HbcDataTable` with columns: Module | Event | Actor | Time (relative, e.g., "2 hours ago"). Max 10 rows. "View all activity" link to a future full activity log page.

---

## 7.3.3 — API Query Hook

```typescript
// apps/project-hub/src/hooks/useProjectDashboard.ts
import { useQuery } from '@tanstack/react-query';
import type { IProjectDashboard } from '@hbc/models';

export function useProjectDashboard(projectId: string) {
  return useQuery<IProjectDashboard>({
    queryKey: ['project-hub', 'dashboard', projectId],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_FUNCTION_APP_URL}/api/project-hub/projects/${projectId}/dashboard`, {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      }).then((r) => r.json()),
    staleTime: 60_000, // 1 minute
  });
}
```

---

## 7.3.4 — Loading & Error States

- **Loading:** Show skeleton cards (one per module) using CSS animation.
- **Error:** Show `HbcCard` with error message and "Retry" button that calls `refetch()`.
- **Empty project (new project, no data):** All module cards show `NotStarted` status with "Get Started" prompts.

---

## Verification

```bash
pnpm turbo run build --filter=project-hub

# In dev-harness, navigate to /project-hub/:projectId
# Expected: Home page renders with all 10 module status cards
# Expected: Quick Actions row renders 5 buttons
# Expected: Recent Activity feed renders (empty state acceptable for new projects)
# Expected: No console errors
```

<!-- IMPLEMENTATION PROGRESS & NOTES
Task file created: 2026-03-07
Status: Ready for implementation
Next: PH7.4 — Preconstruction Module
-->
