# PH7-Estimating-3 — Home Dashboard

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md
**Date:** 2026-03-08
**Depends on:** PH7-Estimating-1 (Foundation) · PH7-Estimating-2 (Project Setup Page)
**Blocks:** PH7-Estimating-4 through PH7-Estimating-8 (feature pages share home navigation)

---

## Summary

Implement the Estimating Home Dashboard (`EstimatingHomePage.tsx`) as the primary landing page for the Estimating module. This page displays a high-level summary of key metrics (active pursuits, active precon, FY submitted, FY win rate), an urgent pursuits callout (bids due within 7 days), and four navigation tiles linking to main module sections (Current Pursuits, Preconstruction, Estimate Log, Templates). The page uses `WorkspacePageShell` layout, TanStack Query for data fetching, and `@hbc/ui-kit` components for consistent styling and responsiveness. This foundation enables users to quickly assess module status and navigate to their workflow of choice.

## Why It Matters

The home dashboard is the entry point for all Estimating module users. A well-designed summary view reduces cognitive load, surfaces urgent items (upcoming bid deadlines), and provides clear navigation to specialized pages. By establishing this pattern early, subsequent feature pages (Pursuits, Preconstruction, Estimate Log, Templates) can maintain consistent visual hierarchy and interaction patterns. The layout also serves as a reference implementation for other module home pages (Accounting, Project Hub, Business Development, Leadership).

---

## Files to Create / Modify

| File | Action | Purpose |
|------|--------|---------|
| `packages/features/estimating/src/EstimatingHomePage.tsx` | Create | Home dashboard component with summary cards, urgent pursuits callout, and navigation tiles |
| `packages/features/estimating/src/data/estimatingQueries.ts` | Modify | Add `fetchEstimatingHomeSummary` query hook (if not already present) |
| `apps/estimating/src/router/routes.ts` | Modify | Add route for `/` (home) with lazy-loaded `EstimatingHomePage` import and `estimating:read` RBAC guard |

---

## Implementation

### 1. EstimatingHomePage Component

**File:** `packages/features/estimating/src/EstimatingHomePage.tsx`

```typescript
import type { ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { WorkspacePageShell, HbcCard, Text, HbcStatusBadge } from '@hbc/ui-kit';
import { useQuery } from '@tanstack/react-query';
import { fetchEstimatingHomeSummary } from './data/estimatingQueries.js';

/**
 * EstimatingHomePage
 *
 * Home dashboard for the Estimating module. Displays:
 * - Four summary stat cards (Active Pursuits, Active Precon, FY Submitted, FY Win Rate)
 * - Urgent pursuits callout (bids due within 7 days) — shown only if any exist
 * - Four navigation tiles to main sections (Current Pursuits, Preconstruction, Estimate Log, Templates)
 *
 * RBAC: Routes.ts enforces estimating:read permission before rendering this page.
 * Data fetching uses TanStack Query with adapter pattern for PWA/SPFx compatibility.
 */
export function EstimatingHomePage(): ReactNode {
  const navigate = useNavigate();
  const { data: summary } = useQuery({
    queryKey: ['estimating', 'home-summary'],
    queryFn: fetchEstimatingHomeSummary,
  });

  // Summary stat cards: Active Pursuits, Active Precon, FY Submitted, FY Win Rate
  const summaryCards = [
    {
      label: 'Active Pursuits',
      value: summary?.activePursuits ?? '—',
      variant: 'neutral' as const,
    },
    {
      label: 'Active Precon',
      value: summary?.activePrecon ?? '—',
      variant: 'neutral' as const,
    },
    {
      label: 'FY Submitted',
      value: summary?.fySubmitted ?? '—',
      variant: 'neutral' as const,
    },
    {
      label: 'FY Win Rate',
      value: summary?.fyWinRate != null ? `${summary.fyWinRate}%` : '—',
      variant: 'success' as const,
    },
  ];

  // Navigation tiles: Current Pursuits, Preconstruction, Estimate Log, Templates
  // Note: ProjectSetupPage is NOT included here — it is accessed via /project-setup
  // from the Accounting module provisioning flow, not from the home page.
  const navTiles = [
    {
      label: 'Current Pursuits',
      description: 'Active bids and proposal tracking',
      path: '/pursuits',
      icon: '📋',
    },
    {
      label: 'Preconstruction',
      description: 'Active precon engagements',
      path: '/preconstruction',
      icon: '🏗️',
    },
    {
      label: 'Estimate Log',
      description: 'FY historical record and analytics',
      path: '/log',
      icon: '📊',
    },
    {
      label: 'Templates',
      description: 'Proposal and deliverable templates',
      path: '/templates',
      icon: '📁',
    },
  ];

  return (
    <WorkspacePageShell layout="list" title="Estimating">
      {/* Summary stat strip: 4 cards in responsive grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
          marginBottom: 24,
        }}
      >
        {summaryCards.map((card) => (
          <HbcCard key={card.label} size="small">
            <Text size={200} style={{ display: 'block', marginBottom: 4 }}>
              {card.label}
            </Text>
            <Text size={700} weight="bold">
              {card.value}
            </Text>
          </HbcCard>
        ))}
      </div>

      {/* Urgent pursuits callout: shown only if any bids are due within 7 days */}
      {summary?.urgentPursuits && summary.urgentPursuits.length > 0 && (
        <HbcCard
          style={{
            marginBottom: 24,
            borderLeft: '4px solid var(--colorStatusWarningForeground1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Text weight="semibold">Due within 7 days</Text>
            <HbcStatusBadge
              label={`${summary.urgentPursuits.length} pursuit${
                summary.urgentPursuits.length > 1 ? 's' : ''
              }`}
              variant="warning"
            />
          </div>
          {summary.urgentPursuits.map((p) => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBlock: 4,
              }}
            >
              <Text>
                {p.projectNumber} — {p.projectName}
              </Text>
              <Text
                size={200}
                style={{ color: 'var(--colorStatusWarningForeground1)' }}
              >
                Due {p.dueDate}
              </Text>
            </div>
          ))}
        </HbcCard>
      )}

      {/* Navigation tiles: 4 main sections */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        {navTiles.map((tile) => (
          <HbcCard
            key={tile.label}
            style={{ cursor: 'pointer' }}
            onClick={() => navigate({ to: tile.path })}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>{tile.icon}</div>
            <Text size={400} weight="semibold" style={{ display: 'block', marginBottom: 4 }}>
              {tile.label}
            </Text>
            <Text size={200} style={{ color: 'var(--colorNeutralForeground3)' }}>
              {tile.description}
            </Text>
          </HbcCard>
        ))}
      </div>
    </WorkspacePageShell>
  );
}
```

---

### 2. Data Access Layer

**File:** `packages/features/estimating/src/data/estimatingQueries.ts` — **Modify**

Ensure the following query hook is present. If already defined in PH7-Estimating-1, verify the signature matches. If not, add it now:

```typescript
/**
 * fetchEstimatingHomeSummary
 *
 * Fetches the home dashboard summary: active pursuits count, active precon count,
 * FY submitted count, FY win rate %, and up to 10 urgent pursuits (bids due within 7 days).
 *
 * Uses the adapter pattern from @hbc/data-access for dual-mode (PWA/SPFx) compatibility.
 *
 * @returns {Promise<IEstimatingHomeSummary>}
 */
export async function fetchEstimatingHomeSummary(): Promise<IEstimatingHomeSummary> {
  // Adapter pattern: resolve environment-specific data access method
  const adapter = getEstimatingAdapter();
  return adapter.getHomeSummary();
}
```

**Data Model** (should already exist in `packages/models/src/estimating/IEstimatingAnalytics.ts` or similar):

```typescript
/**
 * IEstimatingHomeSummary
 *
 * Home dashboard summary data
 */
export interface IEstimatingHomeSummary {
  activePursuits: number;
  activePrecon: number;
  fySubmitted: number;
  fyWinRate: number; // percentage, e.g., 45.2
  urgentPursuits: IUrgentPursuit[];
}

/**
 * IUrgentPursuit
 *
 * Urgent pursuit summary for callout (bid due within 7 days)
 */
export interface IUrgentPursuit {
  id: string;
  projectNumber: string;
  projectName: string;
  dueDate: string; // formatted as "MM/DD/YYYY"
}
```

---

### 3. Routing

**File:** `apps/estimating/src/router/routes.ts` — **Modify**

Add the following route definition (if not already present):

```typescript
// Home page route
{
  path: '/',
  component: lazy(() =>
    import('@hbc/features-estimating')
      .then((m) => ({ default: m.EstimatingHomePage }))
  ),
  beforeLoad: requirePermission('estimating:read'),
  pendingComponent: () => <LoadingFallback />,
  errorComponent: ErrorBoundary,
},
```

---

## Verification

After implementing the component, verify:

1. **Build succeeds:**
   ```bash
   pnpm turbo run build
   ```

2. **Component renders in dev-harness:**
   - Navigate to the Estimating module root (`/estimating/`)
   - Confirm the home page loads with all four summary cards
   - Verify summary card values are fetched and displayed
   - Check that the urgent pursuits callout is shown (if test data includes urgent pursuits)
   - Click each navigation tile and confirm navigation works

3. **Component exports correctly:**
   - Verify `EstimatingHomePage` is exported from `packages/features/estimating/src/index.ts`
   - Verify the export is accessible as `import { EstimatingHomePage } from '@hbc/features-estimating'`

4. **Data query works:**
   - Open browser DevTools → React Query DevTools (if enabled)
   - Confirm the query `['estimating', 'home-summary']` is called on page load
   - Verify the data structure matches `IEstimatingHomeSummary`

5. **RBAC enforced:**
   - Test without the `estimating:read` permission
   - Confirm the page is blocked and a 403 or redirect to unauthorized page appears

6. **Responsive design:**
   - Resize browser window to mobile (375px), tablet (768px), and desktop (1920px) widths
   - Confirm summary cards stack correctly in grid
   - Confirm navigation tiles remain readable and clickable

---

## Definition of Done

- [ ] `EstimatingHomePage.tsx` created with all components
- [ ] `fetchEstimatingHomeSummary` query hook defined in `estimatingQueries.ts`
- [ ] `IEstimatingHomeSummary` and `IUrgentPursuit` models defined in models package
- [ ] Route added to `apps/estimating/src/router/routes.ts` with RBAC guard
- [ ] Build passes: `pnpm turbo run build`
- [ ] Component renders and navigation works in dev-harness
- [ ] Data query returns correct structure
- [ ] RBAC enforcement verified
- [ ] Responsive design verified at 375px, 768px, 1920px widths
- [ ] All imports use `@hbc/ui-kit`, not `@hbc/ui-kit/app-shell` (correct for PWA page)

---

<!-- IMPLEMENTATION PROGRESS & NOTES
Phase 3 (Home Dashboard) plan created: 2026-03-08
Ready for development. Next: PH7-Estimating-4 (Active Pursuits)
-->
