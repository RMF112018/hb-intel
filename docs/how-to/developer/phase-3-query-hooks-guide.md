# Developer Guide: @hbc/query-hooks (Phase 3.1)

## Overview

`@hbc/query-hooks` provides TanStack Query v5 hooks for all 11 HB Intel domains plus Zustand stores for client-side state. This guide covers common usage patterns.

## Quick Start

```ts
import {
  useLeads, useCreateLead,        // Domain hooks
  queryKeys,                       // Cache key factory
  useOptimisticMutation,          // Generic mutation helper
  useRepository,                   // Direct repo access
  useUiStore, useFilterStore,     // Zustand stores
} from '@hbc/query-hooks';
```

## Domain Hooks

Each domain provides a consistent set of hooks:

| Pattern | Example | Description |
|---------|---------|-------------|
| `use{Domain}s` | `useLeads()` | Paginated list query |
| `use{Domain}ById` | `useLeadById(id)` | Single entity query |
| `useCreate{Domain}` | `useCreateLead()` | Create mutation with optimistic update |
| `useUpdate{Domain}` | `useUpdateLead()` | Update mutation with optimistic update |
| `useDelete{Domain}` | `useDeleteLead()` | Delete mutation with optimistic update |
| Domain-specific | `useSearchLeads(q)` | Search, metrics, summary, etc. |

### Available Domains (69 hooks total)

- **leads** (6) — `useLeads`, `useLeadById`, `useCreateLead`, `useUpdateLead`, `useDeleteLead`, `useSearchLeads`
- **schedule** (6) — `useScheduleActivities`, `useScheduleActivityById`, `useCreateScheduleActivity`, `useUpdateScheduleActivity`, `useDeleteScheduleActivity`, `useScheduleMetrics`
- **buyout** (6) — `useBuyoutLog`, `useBuyoutEntryById`, `useCreateBuyoutEntry`, `useUpdateBuyoutEntry`, `useDeleteBuyoutEntry`, `useBuyoutSummary`
- **scorecard** (6) — `useScorecards`, `useScorecardById`, `useSubmitDecision`, `useUpdateScorecard`, `useDeleteScorecard`, `useScorecardVersions`
- **project** (6) — `useActiveProjects`, `useProjectById`, `useProjectDashboard`, `useCreateProject`, `useUpdateProject`, `useDeleteProject`
- **estimating** (7) — `useEstimatingTrackers`, `useEstimatingTrackerById`, `useCreateEstimatingTracker`, `useUpdateEstimatingTracker`, `useDeleteEstimatingTracker`, `useEstimatingKickoff`, `useCreateEstimatingKickoff`
- **compliance** (6) — `useComplianceEntries`, `useComplianceEntryById`, `useCreateComplianceEntry`, `useUpdateComplianceEntry`, `useDeleteComplianceEntry`, `useComplianceSummary`
- **contracts** (7) — `useContracts`, `useContractById`, `useCreateContract`, `useUpdateContract`, `useDeleteContract`, `useContractApprovals`, `useCreateContractApproval`
- **risk** (6) — `useRiskItems`, `useRiskItemById`, `useCreateRiskItem`, `useUpdateRiskItem`, `useDeleteRiskItem`, `useRiskManagement`
- **pmp** (7) — `usePmpPlans`, `usePmpPlanById`, `useCreatePmpPlan`, `useUpdatePmpPlan`, `useDeletePmpPlan`, `usePmpSignatures`, `useCreatePmpSignature`
- **auth** (6) — `useCurrentUser`, `useRoles`, `useRoleById`, `usePermissionTemplates`, `useAssignRole`, `useRemoveRole`

## Optimistic Mutations

All mutation hooks use `useOptimisticMutation` which handles:

1. **Cancel** in-flight queries for the invalidation key
2. **Snapshot** previous cache data
3. **Apply** optional optimistic update
4. **Rollback** on error using the snapshot
5. **Invalidate** queries on settle (success or error)

```ts
const createLead = useCreateLead();
createLead.mutate({ title: 'New Lead', stage: 'Qualifying', ... });
```

## Query Keys

Use `queryKeys` for manual cache operations:

```ts
import { queryKeys } from '@hbc/query-hooks';

// Invalidate all leads
queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });

// Invalidate a specific lead
queryClient.invalidateQueries({ queryKey: queryKeys.leads.detail(42) });
```

## useRepository (DI)

Direct repository access for advanced scenarios:

```ts
const repo = useRepository('leads');
const lead = await repo.getById(42);
```

### Test Overrides

```ts
import { setRepositoryOverride, clearRepositoryOverrides } from '@hbc/query-hooks';

// In test setup
setRepositoryOverride('leads', mockLeadRepo);

// In test teardown
clearRepositoryOverrides();
```

## Zustand Stores

### useUiStore — UI state

```ts
const { openDetailPanel, closeDetailPanel, openModal, closeModal } = useUiStore();
openDetailPanel('leads', 42);
```

### useFilterStore — Domain-scoped filters

```ts
import { useDomainFilters, useFilterStore } from '@hbc/query-hooks';

// Read filters for a domain (shallow selector — no cascade re-renders)
const filters = useDomainFilters('leads');

// Set a filter
const { setFilter } = useFilterStore();
setFilter('leads', 'stage', 'Qualifying');
```

### useFormDraftStore — Form draft persistence

```ts
const { setDraft, getDraft, removeDraft, isDirty } = useFormDraftStore();
setDraft('leads:42', { title: 'Draft Title' });
```

## Configuration

Default query options (flat objects, not nested):

| Option | Value |
|--------|-------|
| `staleTime` | 5 minutes |
| `gcTime` | 10 minutes |
| `retry` (queries) | 2 |
| `retry` (mutations) | 0 |
| `refetchOnWindowFocus` | false |
