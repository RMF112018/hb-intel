# PH7-BD-2 — Business Development: Routes & Shell Navigation

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md · `hb-intel-foundation-plan.md`
**Date:** 2026-03-07
**Prerequisite:** PH7-BD-1 (Foundation & Data Models) complete and passing build.
**Purpose:** Define TanStack Router route tree for the BD module, implement the `BdApp` shell with sidebar navigation, and build the BD home page list view scoped to "My Scorecards Only" (Q62 = A).

---

## Prerequisite Checks

Before starting this task:

- [ ] `packages/models/src/bd/` exports all types from PH7-BD-1 without TypeScript errors.
- [ ] `pnpm turbo run build` passes from repo root.
- [ ] `apps/pwa/src/routes/` directory exists with TanStack Router root route file.
- [ ] `@hbc/ui-kit` components `WorkspacePageShell`, `HbcDataTable`, `HbcStatusBadge`, `HbcButton`, `HbcCard` are importable.

---

## Task 1 — Register BD Route Tree in TanStack Router

**File:** `apps/pwa/src/routes/bd/`

Create the following route files using TanStack Router file-based routing conventions:

```
apps/pwa/src/routes/bd/
├── _layout.tsx              # BdApp shell (sidebar + outlet)
├── index.tsx                # BD home — "My Scorecards" list
├── new.tsx                  # Create new scorecard (BD Manager only)
└── $scorecardId/
    ├── index.tsx            # Scorecard detail / read view
    ├── edit.tsx             # Edit scorecard (BD Manager / Director)
    ├── review.tsx           # Director review panel
    ├── committee.tsx        # Committee scoring session
    └── decision.tsx         # Decision & handoff panel
```

**Route path prefix:** `/bd`

All routes under `/bd` are protected by role guard. Users without any BD access role are redirected to `/unauthorized`.

---

## Task 2 — BdApp Shell Component

**File:** `apps/pwa/src/routes/bd/_layout.tsx`

```tsx
import { Outlet, useRouterState } from '@tanstack/react-router';
import { WorkspacePageShell } from '@hbc/ui-kit/app-shell';
import { BdSidebarNav } from '../../components/bd/BdSidebarNav';

export default function BdLayout() {
  return (
    <WorkspacePageShell
      sidebar={<BdSidebarNav />}
      headerTitle="Business Development"
    >
      <Outlet />
    </WorkspacePageShell>
  );
}
```

---

## Task 3 — BdSidebarNav Component

**File:** `apps/pwa/src/components/bd/BdSidebarNav.tsx`

Navigation sections and items:

| Section | Nav Item | Route | Visible To |
|---|---|---|---|
| My Work | My Scorecards | `/bd` | BD Manager |
| My Work | New Scorecard | `/bd/new` | BD Manager |
| Management | All Scorecards | `/bd/all` (future) | Director of Preconstruction, VP of Operations |
| Reports | BD Analytics | `/bd/analytics` | BD Manager (own data only) |

Rules:
- Nav items are conditionally rendered based on the current user's role from `useBdRole()` hook (see Task 5).
- Active route is highlighted using TanStack Router's `useRouterState`.
- Mobile: sidebar collapses to a hamburger drawer using `WorkspacePageShell` built-in responsive behavior.

---

## Task 4 — BD Home Page (My Scorecards List)

**File:** `apps/pwa/src/routes/bd/index.tsx`

**Behavior (Q62 = A — My Scorecards Only):**
- A BD Manager sees only the scorecards they originated.
- The Estimating Coordinator sees scorecards in the `Accepted` / `MeetingScheduled` / `CommitteeScoring` / `DecisionReached` / `HandedOff` stages.
- Director of Preconstruction and VP of Operations see all scorecards assigned to them for review.

**Column set for `HbcDataTable`:**

| Column | Field | Notes |
|---|---|---|
| Lead Name | `leadName` | Clickable — navigates to `/$scorecardId` |
| Client | `clientName` | — |
| Sector | `projectSector` | Badge |
| Region | `hbcRegion` | Badge |
| Bid Date | `bidDate` | Format: MM/DD/YYYY |
| Stage | `stage` | `HbcStatusBadge` with stage color map |
| BD Manager | `bdManagerName` | Hidden for BD Manager's own list |
| Version | `currentVersion` | Integer |
| Last Updated | `updatedAt` | Relative time |
| Actions | — | Kebab menu: View / Edit / Delete (role-gated) |

**Stage color map for `HbcStatusBadge`:**

| Stage | Color |
|---|---|
| Draft | gray |
| Submitted | blue |
| UnderReview | yellow |
| NeedsClarification | orange |
| Accepted | teal |
| MeetingScheduled | teal |
| CommitteeScoring | purple |
| DecisionReached | — |
| HandedOff | green |
| Waiting | yellow |
| Closed | gray |
| Rejected | red |

**Empty state:** "No scorecards found. Click 'New Scorecard' to get started." (BD Manager only). Other roles: "No scorecards assigned to you."

**Filtering / Sorting:**
- Filter by Stage (multi-select), Sector, Region.
- Sort by Bid Date (default: ascending), Last Updated.
- Search by Lead Name or Client Name.

**Data fetching:** `useQuery` via TanStack Query calling `GET /api/bd/scorecards?bdManagerId={currentUserId}` for BD Manager role.

---

## Task 5 — useBdRole Hook

**File:** `apps/pwa/src/hooks/useBdRole.ts`

```typescript
import { useAuthStore } from '../stores/authStore';
import { BdAccessRole } from '@hbc/models';

export type BdRoleResult = {
  role: BdAccessRole | null;
  isBdManager: boolean;
  isDirector: boolean;
  isVP: boolean;
  isEstimatingCoordinator: boolean;
  isAdmin: boolean;
  canViewScorecardContent: boolean;
  canEditBdFields: boolean;
  canEditCommitteeFields: boolean;
  canViewAnalytics: boolean;
};

export function useBdRole(): BdRoleResult {
  const { user } = useAuthStore();
  const role = user?.bdAccessRole ?? null;

  return {
    role,
    isBdManager: role === 'BdManager',
    isDirector: role === 'DirectorOfPreconstruction',
    isVP: role === 'VPOfOperations',
    isEstimatingCoordinator: role === 'EstimatingCoordinator',
    isAdmin: role === 'Admin',
    canViewScorecardContent: role !== null && role !== 'Admin',
    canEditBdFields: role === 'BdManager' || role === 'DirectorOfPreconstruction',
    canEditCommitteeFields: role === 'EstimatingCoordinator',
    canViewAnalytics: role === 'BdManager',
  };
}
```

**`BdAccessRole` enum** (add to `packages/models/src/bd/BdEnums.ts`):

```typescript
export enum BdAccessRole {
  BdManager = 'BdManager',
  DirectorOfPreconstruction = 'DirectorOfPreconstruction',
  VPOfOperations = 'VPOfOperations',
  EstimatingCoordinator = 'EstimatingCoordinator',
  Admin = 'Admin',
}
```

---

## Task 6 — Route Guards

**File:** `apps/pwa/src/routes/bd/_layout.tsx` (extend with guard)

```tsx
import { redirect } from '@tanstack/react-router';
import { useBdRole } from '../../hooks/useBdRole';

// In the route's beforeLoad:
export const Route = createFileRoute('/bd/_layout')({
  beforeLoad: ({ context }) => {
    const role = context.auth?.bdAccessRole;
    if (!role) {
      throw redirect({ to: '/unauthorized' });
    }
  },
});
```

**Scorecard-level guard** (`/$scorecardId` routes): Fetch scorecard metadata; confirm `currentUserId` matches `bdManagerId` OR user has Director / VP / EstimatingCoordinator role. Redirect to `/bd` with toast error if not.

---

## Task 7 — Zustand BD Store (Shell-level state)

**File:** `apps/pwa/src/stores/bdStore.ts`

State slice managed at the shell level:

```typescript
interface BdShellState {
  activeScorecardId: string | null;
  listFilters: {
    stages: ScorecardStage[];
    sectors: ProjectSector[];
    regions: HbcRegion[];
    searchText: string;
  };
  setActiveScorecardId: (id: string | null) => void;
  setListFilters: (filters: Partial<BdShellState['listFilters']>) => void;
  resetListFilters: () => void;
}
```

---

## Task 8 — Verification

Run after completing Tasks 1–7:

```bash
# Build
pnpm turbo run build

# Type-check
pnpm turbo run type-check

# Verify routes registered
# Navigate to /bd in dev-harness — BdApp shell renders with sidebar
# Navigate to /bd as unauthenticated user — redirects to /unauthorized
# BD Manager sees only own scorecards in the list
```

---

## Success Criteria

- [ ] BD-2.1 TanStack Router route tree for `/bd/**` is registered and resolves all paths.
- [ ] BD-2.2 `BdApp` shell renders sidebar navigation with correct role-conditional items.
- [ ] BD-2.3 BD home page renders `HbcDataTable` with correct columns and stage badges.
- [ ] BD-2.4 BD Manager sees only their own scorecards (Q62 = A).
- [ ] BD-2.5 Estimating Coordinator and Director/VP see correct scoped scorecard lists.
- [ ] BD-2.6 Admin cannot access scorecard content — redirected or sees metadata-only view.
- [ ] BD-2.7 `useBdRole` hook returns correct capability flags for each role.
- [ ] BD-2.8 Route guard redirects unauthorized users to `/unauthorized`.
- [ ] BD-2.9 `bdStore` persists list filters across navigation within the BD module.
- [ ] BD-2.10 Build passes with zero TypeScript errors.

<!-- IMPLEMENTATION PROGRESS & NOTES
Plan created: 2026-03-07
Status: Ready for implementation
Prerequisite: PH7-BD-1 complete
-->
