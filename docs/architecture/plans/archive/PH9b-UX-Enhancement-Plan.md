# Phase 4 Development Plan — UX-Enhanced PWA, My Work Feed, Onboarding & Metrics Layer

> **Doc Classification:** Deferred Scope — post-Phase-7 UX enhancement plan (My Work Feed, Role-Aware Coaching, Draft Persistence, UX Instrumentation); not yet assigned to an active phase milestone. PH7.12 sign-off is required before this work can be activated.
>
> **Status after consolidation:** Deferred Scope — confirmed 2026-03-14
> **Current authoritative source for status:** `docs/architecture/blueprint/current-state-map.md` §2
> **When activated:** Reclassify to Canonical Normative Plan, add to active phase plan index, and update `current-state-map.md §2`.
> **Note on title:** The H1 title ("Phase 4 Development Plan") is a carry-over artifact from the previous document name and does not accurately reflect this plan's scope. This is the PH9b UX Enhancement Plan (V3.0), not a Phase 4 plan.

**Version:** 1.0
**Supersedes:** PH9b-UX-Enhancement-Plan.md V2.1
**Governed by:** HB-Intel-Blueprint-V4.md · CLAUDE.md v1.2
**Date:** March 2026
**Author:** HB Intel Orchestration Agent

**V3.0 Change Summary:** This document extends PH4-UI-Design-Plan.md V2.1 with four new implementation layers derived from a structured competitive UX analysis of seven leading construction technology platforms (March 2026) and a subsequent structured interview with the HB Intel product owner. V2.1 decisions remain fully in force. This plan adds:

1. **§A — Dynamic My Work Feed** (`useMyWork` aggregation hook + `HbcMyWorkFeed` component)
2. **§B — Role-Aware Progressive Coaching System** (JSON-driven coaching for 5 MVP roles)
3. **§C — Auto-Save Draft Persistence** (local draft recovery for all major forms)
4. **§D — Lightweight UX Instrumentation** (Tier 1 task timing + Customer Effort Score)

All four layers are designed to integrate without breaking or duplicating any existing V2.1 decision. Every locked decision in V2.1 (Decisions #1–#32) remains in force and is not re-stated here. Developers must read PH4-UI-Design-Plan.md V2.1 before implementing this document.

---

## CRITICAL GOVERNING PRINCIPLE (Inherited)

> HB Intel does **not** mirror Procore's UI 1:1. Procore serves as a structural familiarity framework. All visual identity derives from HBC firm branding as defined in `@hbc/ui-kit`. The goal is to build the best field-first construction platform on the market, not a Procore clone.

---

## Table of Contents

- [§A — Dynamic My Work Feed](#a--dynamic-my-work-feed)
  - [A.1 Product Requirements](#a1-product-requirements)
  - [A.2 Data Model](#a2-data-model)
  - [A.3 `useMyWork` Hook Implementation](#a3-usemywork-hook-implementation)
  - [A.4 `HbcMyWorkFeed` Component Implementation](#a4-hbcmyworkfeed-component-implementation)
  - [A.5 PWA Integration](#a5-pwa-integration)
  - [A.6 Field PWA Home Screen Wiring](#a6-field-pwa-home-screen-wiring)
  - [A.7 Checklist](#a7-checklist)
- [§B — Role-Aware Progressive Coaching System](#b--role-aware-progressive-coaching-system)
  - [B.1 Product Requirements](#b1-product-requirements)
  - [B.2 Coaching Content Schema](#b2-coaching-content-schema)
  - [B.3 SharePoint List Schema](#b3-sharepoint-list-schema)
  - [B.4 `useCoaching` Hook Implementation](#b4-usecoaching-hook-implementation)
  - [B.5 `HbcCoachCard` Component Implementation](#b5-hbccoachcard-component-implementation)
  - [B.6 MVP Role Coaching Content](#b6-mvp-role-coaching-content)
  - [B.7 Checklist](#b7-checklist)
- [§C — Auto-Save Draft Persistence](#c--auto-save-draft-persistence)
  - [C.1 Product Requirements](#c1-product-requirements)
  - [C.2 Draft Storage Strategy](#c2-draft-storage-strategy)
  - [C.3 `useFormDraft` Hook Implementation](#c3-useformdraft-hook-implementation)
  - [C.4 `HbcDraftRecoveryBanner` Component](#c4-hbcdraftrecoverybanner-component)
  - [C.5 Integration Into Existing Forms](#c5-integration-into-existing-forms)
  - [C.6 Checklist](#c6-checklist)
- [§D — Lightweight UX Instrumentation](#d--lightweight-ux-instrumentation)
  - [D.1 Product Requirements](#d1-product-requirements)
  - [D.2 SharePoint List Schema](#d2-sharepoint-list-schema)
  - [D.3 `useUXInstrumentation` Hook Implementation](#d3-useux-instrumentation-hook-implementation)
  - [D.4 `HbcCESPrompt` Component Implementation](#d4-hbcces-prompt-component-implementation)
  - [D.5 Instrumented Task Definitions](#d5-instrumented-task-definitions)
  - [D.6 Checklist](#d6-checklist)
- [§E — Updated Phase 4 Completion Checklist](#e--updated-phase-4-completion-checklist)
- [§F — Architecture Decision Records](#f--architecture-decision-records)

---

## §A — Dynamic My Work Feed

### A.1 Product Requirements

**What it is:** A unified, real-time, role-aware priority feed that answers the question: *"What do I need to do right now?"* It is the default landing view for the standalone PWA and the primary field-user entry point.

**What problem it solves:** Every construction platform forces users to hunt across modules to understand their responsibilities. The UX study documents this as a primary source of cognitive overload and the #1 driver of the 3–6 month proficiency curve. The My Work feed eliminates module-hunting entirely for daily operational tasks.

**Behavioral specification:**

- Displays a unified, priority-sorted list of action items assigned to or owned by the authenticated user across all active projects
- Items are grouped into three priority tiers: **🔴 Needs Action Now** (overdue or signature-blocked), **🟡 Due This Week**, **🟢 Upcoming / In Progress**
- Each item shows: module badge, project name, item title, due date, and a single primary action button
- Tapping an item navigates to the specific workflow step — not the module home page
- Refreshes in the background every 5 minutes; manual pull-to-refresh on mobile
- Works offline — shows last-cached feed with a "Last synced: X minutes ago" indicator driven by the V2.1 `HbcConnectivityBar` system
- Empty state: `HbcEmptyState` with message "You're all caught up. Nothing pending on your plate today." with a green checkmark illustration

**Data sources aggregated (Option B locked decision):**

| Source | What triggers a My Work item |
|---|---|
| Go/No-Go Scorecards | Scorecard is at a stage where authenticated user is the designated reviewer/approver |
| Turnover Meeting Agenda | Authenticated user is one of the 4 required signatories and has not yet signed |
| Project Management Plan (PMP) | PMP approval cycle requires authenticated user's signature |
| Monthly Project Review | A review step is assigned to authenticated user and not yet marked complete |
| Project Startup Checklist | One or more of the 55 checklist items are assigned to authenticated user and overdue |
| Estimating Kickoffs | Authenticated user is the meeting coordinator and kickoff is within 7 days |
| Post-Bid Autopsies | Autopsy is assigned to authenticated user's role and is incomplete |

**What it does NOT aggregate (Phase 4 scope boundary):**

- Admin tasks (provisioning statuses, workflow configurations)
- Marketing module items
- Financial/accounting approvals (Phase 5 expansion)

---

### A.2 Data Model

Create the following type definitions in `packages/query-hooks/src/mywork/types.ts`:

```typescript
/**
 * Represents a single actionable item in the My Work feed.
 * Aggregated from multiple domain repositories.
 * See docs/reference/query-hooks/my-work.md
 */
export type MyWorkItemPriority = 'critical' | 'due-this-week' | 'upcoming';

export type MyWorkItemModule =
  | 'go-no-go'
  | 'turnover'
  | 'pmp'
  | 'monthly-review'
  | 'startup-checklist'
  | 'estimating-kickoff'
  | 'post-bid-autopsy';

export interface IMyWorkItem {
  /** Unique identifier: "{module}:{itemId}:{userId}" */
  id: string;
  /** Display module label */
  module: MyWorkItemModule;
  /** Human-readable module label (e.g., "Go/No-Go Scorecard") */
  moduleLabel: string;
  /** Project this item belongs to */
  projectCode: string;
  projectName: string;
  /** Short description of the required action */
  title: string;
  /** ISO date string — the action deadline */
  dueDate: string | null;
  /** Priority tier derived from due date and item state */
  priority: MyWorkItemPriority;
  /** Route to navigate to when item is tapped */
  navigationRoute: string;
  /** Label for the primary CTA button */
  actionLabel: string;
  /** Whether this item can be actioned while offline */
  offlineCapable: boolean;
}

export interface IMyWorkFeed {
  critical: IMyWorkItem[];
  dueThisWeek: IMyWorkItem[];
  upcoming: IMyWorkItem[];
  lastSyncedAt: string; // ISO timestamp
  totalCount: number;
}

export interface IMyWorkQueryOptions {
  /** User's Azure AD object ID */
  userId: string;
  /** User's resolved role names */
  roles: string[];
  /** Active project codes to scope queries (empty = all projects) */
  projectCodes?: string[];
}
```

---

### A.3 `useMyWork` Hook Implementation

**File location:** `packages/query-hooks/src/mywork/useMyWork.ts`

**Step-by-step implementation instructions:**

**Step 1.** Create the directory:
```bash
mkdir -p packages/query-hooks/src/mywork
```

**Step 2.** Create `packages/query-hooks/src/mywork/constants.ts`:
```typescript
/**
 * My Work feed configuration constants.
 */

/** Items due within this many days are classified as "due-this-week" */
export const MY_WORK_DUE_SOON_DAYS = 7;

/** Background refetch interval in milliseconds (5 minutes) */
export const MY_WORK_REFETCH_INTERVAL_MS = 5 * 60 * 1000;

/** TanStack Query stale time (2 minutes — shorter than default due to workflow criticality) */
export const MY_WORK_STALE_TIME_MS = 2 * 60 * 1000;

/** IndexedDB store name for offline caching */
export const MY_WORK_IDB_STORE = 'hbc-my-work-cache';
```

**Step 3.** Create `packages/query-hooks/src/mywork/helpers.ts`:
```typescript
import { MY_WORK_DUE_SOON_DAYS } from './constants';
import type { MyWorkItemPriority } from './types';

/**
 * Derives priority tier from a due date string.
 * - null due date = upcoming
 * - overdue = critical
 * - within MY_WORK_DUE_SOON_DAYS = due-this-week
 * - beyond = upcoming
 */
export function derivePriority(dueDate: string | null): MyWorkItemPriority {
  if (!dueDate) return 'upcoming';
  const due = new Date(dueDate);
  const now = new Date();
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'critical';
  if (diffDays <= MY_WORK_DUE_SOON_DAYS) return 'due-this-week';
  return 'upcoming';
}

/**
 * Sorts an array of IMyWorkItem by priority then by dueDate ascending.
 */
export function sortByPriorityAndDate<T extends { priority: MyWorkItemPriority; dueDate: string | null }>(
  items: T[]
): T[] {
  const order: Record<MyWorkItemPriority, number> = { critical: 0, 'due-this-week': 1, upcoming: 2 };
  return [...items].sort((a, b) => {
    const priorityDiff = order[a.priority] - order[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
}
```

**Step 4.** Create `packages/query-hooks/src/mywork/aggregators/scorecardAggregator.ts`:

```typescript
import type { IMyWorkItem, IMyWorkQueryOptions } from '../types';
import { derivePriority } from '../helpers';

/**
 * Extracts My Work items from Go/No-Go scorecards.
 * A scorecard generates a work item when:
 * - The scorecard's current workflow stage requires action from a user matching `options.roles`
 * - The scorecard is not in a terminal state (Approved, Rejected, Withdrawn)
 *
 * @param scorecards - Raw scorecard records from IScorecardRepository
 * @param options - Query options containing userId and roles
 */
export function aggregateScorecardItems(
  scorecards: any[], // Replace `any` with IScorecardRepository return type when available
  options: IMyWorkQueryOptions
): IMyWorkItem[] {
  const TERMINAL_STATES = ['Approved', 'Rejected', 'Withdrawn'];

  return scorecards
    .filter((sc) => {
      if (TERMINAL_STATES.includes(sc.status)) return false;
      // Check if current stage awaiting party matches this user's roles
      return sc.awaitingPartyRoles?.some((role: string) => options.roles.includes(role));
    })
    .map((sc) => ({
      id: `go-no-go:${sc.id}:${options.userId}`,
      module: 'go-no-go' as const,
      moduleLabel: 'Go/No-Go Scorecard',
      projectCode: sc.projectCode,
      projectName: sc.projectName,
      title: `Review ${sc.projectName} scorecard — ${sc.status}`,
      dueDate: sc.reviewDeadline ?? null,
      priority: derivePriority(sc.reviewDeadline ?? null),
      navigationRoute: `/preconstruction/scorecard/${sc.id}`,
      actionLabel: 'Review Scorecard',
      offlineCapable: false, // Scorecard approval requires network
    }));
}
```

**Step 5.** Create equivalent aggregator files for each remaining data source. Use the exact same pattern as `scorecardAggregator.ts`. File names and key field mappings:

| File | Source Field for `awaitingParty` | `navigationRoute` pattern | `offlineCapable` |
|---|---|---|---|
| `turnoverAggregator.ts` | `signatories[]` — include if userId in array and `signed: false` | `/operations/turnover/${id}` | `false` |
| `pmpAggregator.ts` | `approvalCycle.pendingApprovers[]` | `/operations/pmp/${id}` | `false` |
| `monthlyReviewAggregator.ts` | `steps[].assignedToRole` matching user roles | `/operations/monthly-review/${id}/step/${stepIndex}` | `true` |
| `startupChecklistAggregator.ts` | `items[].assignedTo` matching userId, `completed: false`, `dueDate` overdue | `/operations/startup/${projectCode}` | `true` |
| `estimatingKickoffAggregator.ts` | `coordinatorUserId === userId` | `/preconstruction/kickoffs/${id}` | `false` |
| `postBidAutopsyAggregator.ts` | `assignedToRole` matching user roles, `status !== 'Complete'` | `/preconstruction/autopsy/${id}` | `false` |

**Step 6.** Create `packages/query-hooks/src/mywork/useMyWork.ts`:

```typescript
import { useQuery } from '@tanstack/react-query';
import { useRepository } from '../useRepository';
import { useCurrentUser } from '@hbc/auth';
import { aggregateScorecardItems } from './aggregators/scorecardAggregator';
import { aggregateTurnoverItems } from './aggregators/turnoverAggregator';
import { aggregatePmpItems } from './aggregators/pmpAggregator';
import { aggregateMonthlyReviewItems } from './aggregators/monthlyReviewAggregator';
import { aggregateStartupChecklistItems } from './aggregators/startupChecklistAggregator';
import { aggregateKickoffItems } from './aggregators/estimatingKickoffAggregator';
import { aggregateAutopsyItems } from './aggregators/postBidAutopsyAggregator';
import { sortByPriorityAndDate } from './helpers';
import { MY_WORK_REFETCH_INTERVAL_MS, MY_WORK_STALE_TIME_MS } from './constants';
import type { IMyWorkFeed, IMyWorkQueryOptions } from './types';

/**
 * Primary My Work feed hook. Aggregates actionable items for the authenticated user
 * across all active workflow modules. Returns a priority-sorted IMyWorkFeed.
 *
 * Usage:
 * ```tsx
 * const { data: feed, isLoading } = useMyWork();
 * ```
 *
 * See docs/reference/query-hooks/my-work.md for full behavior documentation.
 */
export function useMyWork() {
  const { currentUser } = useCurrentUser();
  const scorecardRepo = useRepository('scorecard');
  const projectRepo = useRepository('project');
  // Add remaining repository references here following established pattern

  const options: IMyWorkQueryOptions = {
    userId: currentUser?.id ?? '',
    roles: currentUser?.roles ?? [],
  };

  return useQuery({
    queryKey: ['my-work', options.userId, options.roles],
    queryFn: async (): Promise<IMyWorkFeed> => {
      if (!options.userId) {
        return { critical: [], dueThisWeek: [], upcoming: [], lastSyncedAt: new Date().toISOString(), totalCount: 0 };
      }

      // Fetch all data sources in parallel for performance
      const [scorecards, activeProjects] = await Promise.all([
        scorecardRepo.getAll({ pageSize: 200 }),
        projectRepo.getAll({ pageSize: 200 }),
        // Add remaining repository calls here
      ]);

      // Aggregate items from each source
      const allItems = [
        ...aggregateScorecardItems(scorecards.items, options),
        ...aggregateTurnoverItems(/* turnoverItems.items */ [], options),
        ...aggregatePmpItems(/* pmpItems.items */ [], options),
        ...aggregateMonthlyReviewItems(/* monthlyReviews.items */ [], options),
        ...aggregateStartupChecklistItems(/* checklistItems.items */ [], options),
        ...aggregateKickoffItems(/* kickoffs.items */ [], options),
        ...aggregateAutopsyItems(/* autopsies.items */ [], options),
      ];

      const sorted = sortByPriorityAndDate(allItems);
      const lastSyncedAt = new Date().toISOString();

      return {
        critical: sorted.filter((i) => i.priority === 'critical'),
        dueThisWeek: sorted.filter((i) => i.priority === 'due-this-week'),
        upcoming: sorted.filter((i) => i.priority === 'upcoming'),
        lastSyncedAt,
        totalCount: sorted.length,
      };
    },
    staleTime: MY_WORK_STALE_TIME_MS,
    refetchInterval: MY_WORK_REFETCH_INTERVAL_MS,
    enabled: !!options.userId,
    // Persist to IndexedDB via the service worker cache strategy defined in V2.1 §PWA
    // The service worker intercepts this query key and applies a NetworkFirst strategy
    // with IndexedDB fallback. No additional code required here.
  });
}
```

**Step 7.** Create `packages/query-hooks/src/mywork/index.ts`:
```typescript
export { useMyWork } from './useMyWork';
export type { IMyWorkFeed, IMyWorkItem, IMyWorkQueryOptions, MyWorkItemModule, MyWorkItemPriority } from './types';
```

**Step 8.** Add to root barrel `packages/query-hooks/src/index.ts`:
```typescript
// My Work aggregation feed
export * from './mywork';
```

**Step 9.** Add query key to `packages/query-hooks/src/keys.ts`:
```typescript
export const queryKeys = {
  // ... existing keys ...
  myWork: {
    forUser: (userId: string, roles: string[]) => ['my-work', userId, roles] as const,
  },
};
```

---

### A.4 `HbcMyWorkFeed` Component Implementation

**File location:** `packages/ui-kit/src/HbcMyWorkFeed/`

**Step 1.** Create the directory:
```bash
mkdir -p packages/ui-kit/src/HbcMyWorkFeed
```

**Step 2.** Create `packages/ui-kit/src/HbcMyWorkFeed/HbcMyWorkFeed.tsx`:

```tsx
import React from 'react';
import { makeStyles, tokens, Spinner, Text } from '@fluentui/react-components';
import type { IMyWorkFeed, IMyWorkItem } from '@hbc/query-hooks';
import { HbcEmptyState } from '../HbcEmptyState/HbcEmptyState';
import { HbcMyWorkItem } from './HbcMyWorkItem';
import { HbcConnectivityIndicator } from '../HbcConnectivityBar/HbcConnectivityIndicator';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0px',
    width: '100%',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px 8px',
    position: 'sticky',
    top: 0,
    backgroundColor: 'var(--hbc-surface-1)',
    zIndex: 1,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  sectionDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  syncMeta: {
    padding: '8px 16px',
    color: tokens.colorNeutralForeground3,
  },
  emptyWrapper: {
    padding: '48px 24px',
    display: 'flex',
    justifyContent: 'center',
  },
});

interface HbcMyWorkFeedProps {
  feed: IMyWorkFeed | undefined;
  isLoading: boolean;
  onNavigate: (route: string) => void;
}

/**
 * My Work feed component. Renders priority-grouped actionable items for the
 * authenticated user. Designed as the PWA home screen default view.
 *
 * @example
 * ```tsx
 * const { data: feed, isLoading } = useMyWork();
 * <HbcMyWorkFeed feed={feed} isLoading={isLoading} onNavigate={navigate} />
 * ```
 */
export const HbcMyWorkFeed: React.FC<HbcMyWorkFeedProps> = ({ feed, isLoading, onNavigate }) => {
  const styles = useStyles();

  if (isLoading) {
    return <Spinner label="Loading your work items..." />;
  }

  if (!feed || feed.totalCount === 0) {
    return (
      <div className={styles.emptyWrapper}>
        <HbcEmptyState
          icon="CheckmarkCircle"
          title="You're all caught up"
          description="Nothing pending on your plate today."
        />
      </div>
    );
  }

  return (
    <div className={styles.root}>
      {/* Sync metadata */}
      <HbcConnectivityIndicator lastSyncedAt={feed.lastSyncedAt} className={styles.syncMeta} />

      {/* Critical items */}
      {feed.critical.length > 0 && (
        <FeedSection
          label="Needs Action Now"
          dotColor="#FF4D4D"
          items={feed.critical}
          onNavigate={onNavigate}
        />
      )}

      {/* Due this week */}
      {feed.dueThisWeek.length > 0 && (
        <FeedSection
          label="Due This Week"
          dotColor="#FFB020"
          items={feed.dueThisWeek}
          onNavigate={onNavigate}
        />
      )}

      {/* Upcoming */}
      {feed.upcoming.length > 0 && (
        <FeedSection
          label="Upcoming"
          dotColor="#8B95A5"
          items={feed.upcoming}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
};

// Internal section subcomponent
const FeedSection: React.FC<{
  label: string;
  dotColor: string;
  items: IMyWorkItem[];
  onNavigate: (route: string) => void;
}> = ({ label, dotColor, items, onNavigate }) => {
  const styles = useStyles();
  return (
    <>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionDot} style={{ backgroundColor: dotColor }} />
        <Text weight="semibold" size={200}>
          {label} ({items.length})
        </Text>
      </div>
      {items.map((item) => (
        <HbcMyWorkItem key={item.id} item={item} onNavigate={onNavigate} />
      ))}
    </>
  );
};
```

**Step 3.** Create `packages/ui-kit/src/HbcMyWorkFeed/HbcMyWorkItem.tsx`:

```tsx
import React from 'react';
import { makeStyles, tokens, Text, Button, Badge } from '@fluentui/react-components';
import type { IMyWorkItem } from '@hbc/query-hooks';
import { CloudOffline20Regular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: 'var(--hbc-surface-1)',
    cursor: 'pointer',
    // Responsibility heat map: applied when item has responsibilityField (inherited from V2.1 Decision #27)
    '&[data-responsibility="true"]': {
      borderLeft: '4px solid #F37021',
      backgroundColor: '#FFF5EE',
      paddingLeft: '12px',
    },
    // Touch target: minimum 56px height on Touch density tier (V2.1 Decision #31)
    '@media (pointer: coarse)': {
      minHeight: '56px',
    },
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0, // Prevent text overflow from breaking layout
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  title: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  offlineIndicator: {
    color: tokens.colorNeutralForeground3,
    flexShrink: 0,
  },
  actionButton: {
    flexShrink: 0,
    minWidth: '120px',
  },
});

// Module label → Badge appearance mapping
const MODULE_BADGE_COLOR: Record<string, 'brand' | 'warning' | 'danger' | 'success' | 'informative'> = {
  'go-no-go': 'brand',
  'turnover': 'warning',
  'pmp': 'informative',
  'monthly-review': 'informative',
  'startup-checklist': 'success',
  'estimating-kickoff': 'brand',
  'post-bid-autopsy': 'danger',
};

interface HbcMyWorkItemProps {
  item: IMyWorkItem;
  onNavigate: (route: string) => void;
}

export const HbcMyWorkItem: React.FC<HbcMyWorkItemProps> = ({ item, onNavigate }) => {
  const styles = useStyles();
  const isOffline = !navigator.onLine;
  const isDisabledWhileOffline = isOffline && !item.offlineCapable;

  const handleAction = () => {
    if (!isDisabledWhileOffline) {
      onNavigate(item.navigationRoute);
    }
  };

  return (
    <div
      className={styles.root}
      data-responsibility="true"
      onClick={handleAction}
      role="button"
      tabIndex={0}
      aria-label={`${item.moduleLabel}: ${item.title}`}
      onKeyDown={(e) => e.key === 'Enter' && handleAction()}
    >
      <div className={styles.content}>
        <div className={styles.meta}>
          <Badge color={MODULE_BADGE_COLOR[item.module] ?? 'informative'} size="small">
            {item.moduleLabel}
          </Badge>
          <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>
            {item.projectName}
          </Text>
        </div>
        <Text size={300} weight="medium" className={styles.title}>
          {item.title}
        </Text>
        {item.dueDate && (
          <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>
            Due: {new Date(item.dueDate).toLocaleDateString()}
          </Text>
        )}
      </div>

      {/* Offline indicator */}
      {isDisabledWhileOffline && (
        <CloudOffline20Regular className={styles.offlineIndicator} title="Not available offline" />
      )}

      {/* Primary action button */}
      <Button
        appearance="primary"
        size="small"
        className={styles.actionButton}
        onClick={(e) => { e.stopPropagation(); handleAction(); }}
        disabled={isDisabledWhileOffline}
        aria-label={item.actionLabel}
      >
        {item.actionLabel}
      </Button>
    </div>
  );
};
```

**Step 4.** Create `packages/ui-kit/src/HbcMyWorkFeed/index.ts`:
```typescript
export { HbcMyWorkFeed } from './HbcMyWorkFeed';
export { HbcMyWorkItem } from './HbcMyWorkItem';
```

**Step 5.** Add to `packages/ui-kit/src/index.ts`:
```typescript
export * from './HbcMyWorkFeed';
```

**Step 6.** Create Storybook story `packages/ui-kit/src/HbcMyWorkFeed/HbcMyWorkFeed.stories.tsx`:
```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { HbcMyWorkFeed } from './HbcMyWorkFeed';

const mockFeed = {
  critical: [
    {
      id: 'go-no-go:1:user1',
      module: 'go-no-go' as const,
      moduleLabel: 'Go/No-Go Scorecard',
      projectCode: 'HBC-2024-001',
      projectName: 'Riverside Medical Center',
      title: 'Review Go/No-Go Scorecard — Director Review',
      dueDate: new Date(Date.now() - 86400000).toISOString(), // yesterday = overdue
      priority: 'critical' as const,
      navigationRoute: '/preconstruction/scorecard/1',
      actionLabel: 'Review Scorecard',
      offlineCapable: false,
    },
  ],
  dueThisWeek: [
    {
      id: 'turnover:5:user1',
      module: 'turnover' as const,
      moduleLabel: 'Turnover Meeting',
      projectCode: 'HBC-2024-002',
      projectName: 'Harbor View Apartments',
      title: 'Sign Turnover Meeting Agenda',
      dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
      priority: 'due-this-week' as const,
      navigationRoute: '/operations/turnover/5',
      actionLabel: 'Sign Now',
      offlineCapable: false,
    },
  ],
  upcoming: [],
  lastSyncedAt: new Date().toISOString(),
  totalCount: 2,
};

const meta: Meta<typeof HbcMyWorkFeed> = {
  title: 'HB Intel/HbcMyWorkFeed',
  component: HbcMyWorkFeed,
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof HbcMyWorkFeed>;

export const Default: Story = {
  args: { feed: mockFeed, isLoading: false, onNavigate: (r) => console.log('Navigate:', r) },
};
export const Loading: Story = {
  args: { feed: undefined, isLoading: true, onNavigate: () => {} },
};
export const Empty: Story = {
  args: {
    feed: { critical: [], dueThisWeek: [], upcoming: [], lastSyncedAt: new Date().toISOString(), totalCount: 0 },
    isLoading: false,
    onNavigate: () => {},
  },
};
export const FieldMode: Story = {
  args: { ...Default.args },
  parameters: { backgrounds: { default: 'dark' } },
};
export const A11yTest: Story = {
  args: { ...Default.args },
  play: async ({ canvasElement }) => {
    // Accessibility test: all interactive elements must be keyboard-reachable
    // Verified via @storybook/addon-a11y
  },
};
```

---

### A.5 PWA Integration

**Service worker caching strategy for My Work feed:**

Add the following cache strategy to the service worker configuration in `apps/pwa/src/sw.ts` (or equivalent service worker entry point):

```typescript
// My Work feed — NetworkFirst strategy with IndexedDB fallback
// Queries identified by the 'my-work' query key prefix
registerRoute(
  ({ url }) => url.pathname.includes('/api/my-work') || url.searchParams.has('queryKey'),
  new NetworkFirst({
    cacheName: 'hbc-my-work-cache',
    networkTimeoutSeconds: 5,
    plugins: [
      new ExpirationPlugin({ maxAgeSeconds: 30 * 60 }), // 30-minute cache window
    ],
  })
);
```

**Application Badging API integration** (V2.1 Decision already requires this; wire to My Work count):

In `apps/pwa/src/main.tsx` or the PWA shell provider, add:
```typescript
import { useMyWork } from '@hbc/query-hooks';

// In a component or effect that runs at the app root:
const { data: feed } = useMyWork();

useEffect(() => {
  if ('setAppBadge' in navigator && feed?.critical.length !== undefined) {
    if (feed.critical.length > 0) {
      navigator.setAppBadge(feed.critical.length).catch(() => {}); // Graceful fallback
    } else {
      navigator.clearAppBadge().catch(() => {});
    }
  }
}, [feed?.critical.length]);
```

---

### A.6 Field PWA Home Screen Wiring

The My Work feed is the **default landing route** for the standalone PWA. Wire it as follows in `apps/pwa/src/router/routes.ts`:

```typescript
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';
import { MyWorkPage } from '../pages/MyWorkPage';

// My Work feed is the index route — what field users see when they open the PWA
export const myWorkRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: MyWorkPage,
});
```

Create `apps/pwa/src/pages/MyWorkPage.tsx`:
```tsx
import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useMyWork } from '@hbc/query-hooks';
import { HbcMyWorkFeed } from '@hbc/ui-kit';
import { ToolLandingLayout } from '@hbc/ui-kit';

/**
 * Default PWA landing page — My Work feed.
 * Field users see this immediately on app open.
 */
export const MyWorkPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: feed, isLoading } = useMyWork();

  return (
    <ToolLandingLayout
      title="My Work"
      subtitle="Your action items across all active projects"
    >
      <HbcMyWorkFeed
        feed={feed}
        isLoading={isLoading}
        onNavigate={(route) => navigate({ to: route })}
      />
    </ToolLandingLayout>
  );
};
```

---

### A.7 Checklist

All items must pass before Phase 4 is considered complete.

- [ ] `packages/query-hooks/src/mywork/` directory exists with all files from §A.3
- [ ] All 7 aggregator files created and returning correctly typed `IMyWorkItem[]`
- [ ] `useMyWork` hook returns correctly shaped `IMyWorkFeed` from mock adapter
- [ ] `useMyWork` hook refetches automatically every 5 minutes (verified in DevTools Network tab)
- [ ] `queryKeys.myWork.forUser()` key exists in `keys.ts`
- [ ] `HbcMyWorkFeed` component renders all 3 priority sections
- [ ] `HbcMyWorkFeed` renders `HbcEmptyState` when `totalCount === 0`
- [ ] `HbcMyWorkItem` shows offline indicator on items where `offlineCapable: false` when network is unavailable
- [ ] `HbcMyWorkItem` responsibility heat map (4px orange border) applies via `data-responsibility` attribute (V2.1 Decision #27)
- [ ] Touch targets ≥ 56×56px on Touch density tier (V2.1 Decision #31)
- [ ] Application Badging API updates badge count from `feed.critical.length`
- [ ] PWA index route (`/`) renders `MyWorkPage`
- [ ] Service worker applies NetworkFirst caching to My Work queries
- [ ] All 5 Storybook story exports present (`Default`, `Loading`, `Empty`, `FieldMode`, `A11yTest`)
- [ ] Zero WCAG 2.2 AA violations in both light and Field Mode
- [ ] Documentation created: `docs/reference/query-hooks/my-work.md`
- [ ] ADR created: `docs/architecture/adr/0015-my-work-feed.md`

---

## §B — Role-Aware Progressive Coaching System

### B.1 Product Requirements

**What it is:** A system that surfaces contextual guidance to users at the moment they first encounter a feature — not through a training course, not through external documentation, but as a small, dismissible card that appears inline on the page. Cards disappear permanently once dismissed or once the user demonstrates proficiency by completing the relevant action.

**What problem it solves:** The UX study documents a 3–6 month proficiency timeline across every construction platform, with in-app guidance identified as "the single largest UX gap shared across the entire category." HB Intel eliminates this gap at the MVP level by coaching the 5 roles that matter most for launch.

**Behavioral specification:**

- A coaching card is a small, dismissible panel that appears above or beside a page's primary content area — never blocking the content
- Cards are shown **only once** per user per coaching item — once dismissed, they never return
- Cards have a maximum of 3 sentences and one optional action button (e.g., "Show me" — which can scroll to or highlight the relevant element)
- The system detects "demonstrated proficiency" when a user successfully completes the coached action and automatically marks the card as dismissed
- Coaching content is stored as JSON in a SharePoint list so non-developers can update copy without code deployment
- The `HbcCommandPalette` (V2.1 Decision #28) surfaces coaching items as a searchable command type: "Onboarding tips" — users can recall any previously dismissed card

**MVP Role scope (Option B locked decision):**

| Role | Module Priority |
|---|---|
| Accounting Manager | Site provisioning trigger, Accounting Setup page |
| Estimator | Estimating tracker, Go/No-Go scorecard, Kickoffs |
| Project Manager | Project Startup Checklist, PMP, Monthly Review, Turnover |
| Leadership / Executive | Leadership dashboard, KPI interpretation |
| Business Development Rep | Lead intake, Pipeline, Go/No-Go committee review |

All other roles receive a 3-card generic fallback sequence covering: navigation basics, the My Work feed, and the Command Palette.

---

### B.2 Coaching Content Schema

**Type definitions in `packages/query-hooks/src/coaching/types.ts`:**

```typescript
/**
 * A single coaching item — one contextual tip for one role in one context.
 */
export interface ICoachingItem {
  /** Unique identifier — used to track per-user dismissal */
  id: string;
  /** Which roles see this card (empty array = all roles / generic fallback) */
  targetRoles: string[];
  /** The route or page context where this card appears (glob pattern supported) */
  pageContext: string;
  /** Card title (max 8 words) */
  title: string;
  /** Card body (max 3 sentences) */
  body: string;
  /** Optional: label for the action button */
  actionLabel?: string;
  /** Optional: TanStack Router route to navigate to when action button is clicked */
  actionRoute?: string;
  /** Optional: CSS selector of element to highlight when action is triggered */
  actionHighlightSelector?: string;
  /** Display order within a page context */
  order: number;
  /** ISO date this coaching item was last updated — used for cache invalidation */
  updatedAt: string;
}

export interface ICoachingState {
  /** Map of coachingItemId → true (dismissed) */
  dismissed: Record<string, boolean>;
  /** Map of coachingItemId → true (proficiency demonstrated) */
  completed: Record<string, boolean>;
}
```

---

### B.3 SharePoint List Schema

Create a SharePoint list named `HBIntel_CoachingItems` in the hub site with the following columns:

| Column Name | Type | Description |
|---|---|---|
| `Title` | Single line text | Coaching item ID (primary key) |
| `TargetRoles` | Multi-select choice | Role names this card targets |
| `PageContext` | Single line text | Route glob pattern (e.g., `/preconstruction/*`) |
| `CardTitle` | Single line text | Display title |
| `CardBody` | Multiple lines text | Display body (plain text, max 3 sentences) |
| `ActionLabel` | Single line text | Optional CTA button label |
| `ActionRoute` | Single line text | Optional TanStack Router route |
| `ActionHighlightSelector` | Single line text | Optional CSS selector |
| `DisplayOrder` | Number | Sort order within page context |
| `Modified` | Date/Time | Auto-managed — used for cache invalidation |

Create a SharePoint list named `HBIntel_CoachingProgress` in the hub site with the following columns:

| Column Name | Type | Description |
|---|---|---|
| `Title` | Single line text | `"{userId}:{coachingItemId}"` composite key |
| `UserId` | Single line text | Azure AD object ID |
| `CoachingItemId` | Single line text | Matches `HBIntel_CoachingItems.Title` |
| `Status` | Choice | `Dismissed` or `Completed` |
| `OccurredAt` | Date/Time | When dismissed/completed |

---

### B.4 `useCoaching` Hook Implementation

**File location:** `packages/query-hooks/src/coaching/useCoaching.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '@hbc/auth';
import { useRepository } from '../useRepository';
import type { ICoachingItem, ICoachingState } from './types';

/**
 * Provides coaching items for the current page context and user role,
 * filtered to exclude already-dismissed or completed items.
 *
 * @param pageContext - The current route path (e.g., '/preconstruction/scorecard')
 *
 * Usage:
 * ```tsx
 * const { items, dismiss, markComplete } = useCoaching('/preconstruction/scorecard');
 * ```
 */
export function useCoaching(pageContext: string) {
  const { currentUser } = useCurrentUser();
  const queryClient = useQueryClient();
  const coachingRepo = useRepository('coaching'); // Add to factory in @hbc/data-access

  // Fetch all coaching items for this page context + user roles
  const { data: allItems = [] } = useQuery({
    queryKey: ['coaching', 'items', pageContext, currentUser?.roles],
    queryFn: async (): Promise<ICoachingItem[]> => {
      return coachingRepo.getByPageContext(pageContext, currentUser?.roles ?? []);
    },
    staleTime: 10 * 60 * 1000, // 10 minutes — coaching content changes rarely
    enabled: !!currentUser,
  });

  // Fetch this user's dismissal/completion state
  const { data: state } = useQuery({
    queryKey: ['coaching', 'state', currentUser?.id],
    queryFn: async (): Promise<ICoachingState> => {
      return coachingRepo.getStateForUser(currentUser?.id ?? '');
    },
    enabled: !!currentUser?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Mutation: dismiss a coaching item permanently
  const dismissMutation = useMutation({
    mutationFn: (itemId: string) =>
      coachingRepo.recordProgress({
        userId: currentUser?.id ?? '',
        coachingItemId: itemId,
        status: 'Dismissed',
        occurredAt: new Date().toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coaching', 'state', currentUser?.id] });
    },
  });

  // Mutation: mark a coaching item as completed (proficiency demonstrated)
  const completeMutation = useMutation({
    mutationFn: (itemId: string) =>
      coachingRepo.recordProgress({
        userId: currentUser?.id ?? '',
        coachingItemId: itemId,
        status: 'Completed',
        occurredAt: new Date().toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coaching', 'state', currentUser?.id] });
    },
  });

  // Filter to only show items not yet dismissed or completed
  const activeItems = allItems.filter(
    (item) => !state?.dismissed[item.id] && !state?.completed[item.id]
  );

  // Sort by display order
  const sortedItems = [...activeItems].sort((a, b) => a.order - b.order);

  return {
    /** Coaching items to display on the current page for this user */
    items: sortedItems,
    /** Call to permanently dismiss a coaching card */
    dismiss: dismissMutation.mutate,
    /** Call when user completes the coached action (auto-dismisses the card) */
    markComplete: completeMutation.mutate,
  };
}
```

---

### B.5 `HbcCoachCard` Component Implementation

**File location:** `packages/ui-kit/src/HbcCoachCard/HbcCoachCard.tsx`

```tsx
import React, { useRef } from 'react';
import { makeStyles, tokens, Text, Button, Card, CardHeader } from '@fluentui/react-components';
import { Lightbulb20Regular, Dismiss20Regular } from '@fluentui/react-icons';
import type { ICoachingItem } from '@hbc/query-hooks';

const useStyles = makeStyles({
  card: {
    backgroundColor: '#EBF4FF', // Light blue coaching tint — distinct from content
    border: `1px solid #3B9FFF`,
    borderLeft: `4px solid #3B9FFF`,
    borderRadius: '6px',
    padding: '12px 16px',
    marginBottom: '16px',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    // Animate in
    animationName: {
      from: { opacity: 0, transform: 'translateY(-8px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    animationDuration: '200ms',
    animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    // Respect reduced motion preference
    '@media (prefers-reduced-motion: reduce)': {
      animationDuration: '0ms',
    },
  },
  icon: {
    color: '#3B9FFF',
    flexShrink: 0,
    marginTop: '2px',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  actions: {
    display: 'flex',
    gap: '8px',
    marginTop: '4px',
  },
  dismissButton: {
    flexShrink: 0,
    color: tokens.colorNeutralForeground3,
  },
});

interface HbcCoachCardProps {
  item: ICoachingItem;
  onDismiss: (itemId: string) => void;
  onAction?: (item: ICoachingItem) => void;
}

/**
 * Contextual coaching card. Appears inline on pages to guide users through
 * features they haven't encountered yet. Dismisses permanently when closed.
 *
 * @example
 * ```tsx
 * const { items, dismiss } = useCoaching('/preconstruction/scorecard');
 * {items.map(item => (
 *   <HbcCoachCard key={item.id} item={item} onDismiss={dismiss} />
 * ))}
 * ```
 */
export const HbcCoachCard: React.FC<HbcCoachCardProps> = ({ item, onDismiss, onAction }) => {
  const styles = useStyles();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDismiss = () => {
    // Animate out before calling onDismiss
    if (cardRef.current) {
      cardRef.current.style.opacity = '0';
      cardRef.current.style.transform = 'translateY(-8px)';
      setTimeout(() => onDismiss(item.id), 150);
    } else {
      onDismiss(item.id);
    }
  };

  return (
    <div
      ref={cardRef}
      className={styles.card}
      role="note"
      aria-label={`Coaching tip: ${item.title}`}
      style={{ transition: 'opacity 150ms ease, transform 150ms ease' }}
    >
      <Lightbulb20Regular className={styles.icon} />

      <div className={styles.content}>
        <Text weight="semibold" size={200}>
          {item.title}
        </Text>
        <Text size={200}>{item.body}</Text>

        {item.actionLabel && (
          <div className={styles.actions}>
            <Button
              appearance="outline"
              size="small"
              onClick={() => onAction?.(item)}
            >
              {item.actionLabel}
            </Button>
          </div>
        )}
      </div>

      <Button
        appearance="transparent"
        icon={<Dismiss20Regular />}
        size="small"
        className={styles.dismissButton}
        onClick={handleDismiss}
        aria-label="Dismiss this tip"
      />
    </div>
  );
};
```

---

### B.6 MVP Role Coaching Content

The following coaching items must be seeded into `HBIntel_CoachingItems` during SharePoint list setup. They are also available as a seed JSON file at `packages/data-access/src/adapters/mock/coachingSeeds.ts` for the mock adapter.

**Accounting Manager — 2 items:**

```json
[
  {
    "id": "acct-001",
    "targetRoles": ["Accounting Manager", "Accounting Admin"],
    "pageContext": "/accounting/*",
    "title": "How to provision a new project site",
    "body": "When you save a new project, click 'Save + Provision Site' to automatically create the project's SharePoint workspace. You'll be taken to a live progress screen — no need to do anything else. The site will be fully configured within minutes.",
    "actionLabel": "Show me the button",
    "actionHighlightSelector": "[data-provision-trigger]",
    "order": 1,
    "updatedAt": "2026-03-01T00:00:00Z"
  },
  {
    "id": "acct-002",
    "targetRoles": ["Accounting Manager"],
    "pageContext": "/accounting/*",
    "title": "Your provisioning history is always available",
    "body": "Every site you've provisioned is tracked in the Admin workspace under 'Provisioning History.' If anything goes wrong, the system records exactly what happened and gives you a one-click retry option.",
    "order": 2,
    "updatedAt": "2026-03-01T00:00:00Z"
  }
]
```

**Estimator — 3 items:**

```json
[
  {
    "id": "est-001",
    "targetRoles": ["Estimator", "Senior Estimator", "Chief Estimator"],
    "pageContext": "/preconstruction/tracker",
    "title": "Edit estimates directly in the table",
    "body": "Click any cell in the Estimating Tracker to edit it inline — no need to open a separate form. Press Tab to move to the next cell, or Enter to save. Your changes are saved automatically.",
    "order": 1,
    "updatedAt": "2026-03-01T00:00:00Z"
  },
  {
    "id": "est-002",
    "targetRoles": ["Estimator", "Senior Estimator", "Chief Estimator"],
    "pageContext": "/preconstruction/scorecard/*",
    "title": "Your scoring directly affects the Go/No-Go outcome",
    "body": "Each section you score contributes to the project's total weighted score. A score below the threshold automatically flags the project for Director review. You'll see a real-time score preview as you fill in each section.",
    "order": 1,
    "updatedAt": "2026-03-01T00:00:00Z"
  },
  {
    "id": "est-003",
    "targetRoles": ["Estimator", "Senior Estimator"],
    "pageContext": "/preconstruction/kickoffs/*",
    "title": "Set up your kickoff meeting agenda here",
    "body": "This form generates the formal Estimating Kickoff agenda automatically. Fill in the required participants and discussion items, then click 'Generate Agenda' to create a formatted document ready for distribution.",
    "order": 1,
    "updatedAt": "2026-03-01T00:00:00Z"
  }
]
```

**Project Manager — 3 items:**

```json
[
  {
    "id": "pm-001",
    "targetRoles": ["Project Manager", "Senior Project Manager"],
    "pageContext": "/operations/startup/*",
    "title": "Track your startup checklist here",
    "body": "This 55-item checklist covers everything needed to start a project correctly. Check items off as they're completed — the system tracks your progress and shows what's still open. Overdue items will appear in your My Work feed.",
    "order": 1,
    "updatedAt": "2026-03-01T00:00:00Z"
  },
  {
    "id": "pm-002",
    "targetRoles": ["Project Manager", "Senior Project Manager"],
    "pageContext": "/operations/pmp/*",
    "title": "The PMP requires signatures from multiple parties",
    "body": "Once you complete all 16 sections, the Project Management Plan enters an approval cycle. The system automatically notifies each required approver. You can track who has signed and who is pending in the signature panel on the right.",
    "order": 1,
    "updatedAt": "2026-03-01T00:00:00Z"
  },
  {
    "id": "pm-003",
    "targetRoles": ["Project Manager", "Senior Project Manager", "Superintendent"],
    "pageContext": "/operations/monthly-review/*",
    "title": "Complete your monthly review in 10 steps",
    "body": "The Monthly Project Review walks you through 10 structured steps covering cost, schedule, quality, and risk. Each step saves automatically. You can leave and return to finish — your progress is preserved.",
    "order": 1,
    "updatedAt": "2026-03-01T00:00:00Z"
  }
]
```

**Leadership / Executive — 2 items:**

```json
[
  {
    "id": "lead-001",
    "targetRoles": ["Executive", "Director", "VP", "President"],
    "pageContext": "/leadership/*",
    "title": "Your dashboard shows real-time company performance",
    "body": "Every KPI card updates automatically as project data changes. Click any card to drill down into the underlying projects. Use the filter bar at the top to focus on specific project types, regions, or time periods.",
    "order": 1,
    "updatedAt": "2026-03-01T00:00:00Z"
  },
  {
    "id": "lead-002",
    "targetRoles": ["Director", "VP"],
    "pageContext": "/preconstruction/scorecard/*",
    "title": "Your review is required before this project proceeds",
    "body": "This Go/No-Go scorecard is awaiting your decision. Review each section score, read the Estimator's notes, then select Approve or Recommend Rejection at the bottom of the page. Your decision is recorded with a timestamp.",
    "order": 1,
    "updatedAt": "2026-03-01T00:00:00Z"
  }
]
```

**Business Development Rep — 2 items:**

```json
[
  {
    "id": "bd-001",
    "targetRoles": ["Business Development Rep", "BD Manager"],
    "pageContext": "/preconstruction/leads/*",
    "title": "Capture a new lead in under 2 minutes",
    "body": "Click '+ Create' in the header to open the Lead Intake form. Required fields are marked with an asterisk. The form saves a draft automatically so you'll never lose your work if you need to step away.",
    "order": 1,
    "updatedAt": "2026-03-01T00:00:00Z"
  },
  {
    "id": "bd-002",
    "targetRoles": ["Business Development Rep", "BD Manager"],
    "pageContext": "/preconstruction/pipeline",
    "title": "The pipeline shows where every lead stands",
    "body": "Each column represents a stage in the pursuit process. Drag a lead card to move it to the next stage, or click the card to open the full pursuit detail and update notes, deliverables, and contacts.",
    "order": 1,
    "updatedAt": "2026-03-01T00:00:00Z"
  }
]
```

**Generic fallback — 3 items (shown to all roles not covered above):**

```json
[
  {
    "id": "generic-001",
    "targetRoles": [],
    "pageContext": "/*",
    "title": "Your daily work items are in My Work",
    "body": "The My Work feed (your home screen) shows everything that needs your attention today, sorted by priority. It pulls items from all your active projects automatically — no hunting through menus required.",
    "actionLabel": "Go to My Work",
    "actionRoute": "/",
    "order": 1,
    "updatedAt": "2026-03-01T00:00:00Z"
  },
  {
    "id": "generic-002",
    "targetRoles": [],
    "pageContext": "/*",
    "title": "Press Ctrl+K to find anything instantly",
    "body": "The Command Palette (Ctrl+K on Windows, Cmd+K on Mac) lets you navigate anywhere, search for any item, or ask a question in plain English. It works even when you're offline for navigation tasks.",
    "order": 2,
    "updatedAt": "2026-03-01T00:00:00Z"
  },
  {
    "id": "generic-003",
    "targetRoles": [],
    "pageContext": "/*",
    "title": "Install HB Intel for faster access on your tablet",
    "body": "HB Intel works as an installable app on your tablet or phone. Look for the install prompt in your browser's address bar, or find the option in your browser's menu. Once installed, it opens in under a second — even on slow jobsite networks.",
    "order": 3,
    "updatedAt": "2026-03-01T00:00:00Z"
  }
]
```

---

### B.7 Checklist

- [ ] `ICoachingItem` and `ICoachingState` types defined in `packages/query-hooks/src/coaching/types.ts`
- [ ] `ICoachingRepository` port created in `packages/data-access/src/ports/ICoachingRepository.ts`
- [ ] Mock adapter `CoachingMockAdapter.ts` seeded with all 15 coaching items from §B.6
- [ ] SharePoint adapter stub created for `ICoachingRepository` in `packages/data-access/src/adapters/sharepoint/`
- [ ] `HBIntel_CoachingItems` SharePoint list documented in `docs/reference/schemas/coaching-items-list.md`
- [ ] `HBIntel_CoachingProgress` SharePoint list documented in `docs/reference/schemas/coaching-progress-list.md`
- [ ] `useCoaching(pageContext)` hook returns only undismissed items for current user's roles
- [ ] Dismissing a card calls `coachingRepo.recordProgress` and immediately hides the card
- [ ] `HbcCoachCard` renders within 200ms entrance animation (0ms when `prefers-reduced-motion`)
- [ ] `HbcCoachCard` dismiss button is keyboard accessible (`Tab` + `Enter`)
- [ ] `HbcCoachCard` is exported from `@hbc/ui-kit` barrel
- [ ] `useCoaching` is exported from `@hbc/query-hooks` barrel
- [ ] Command Palette (V2.1 Decision #28) surfaces dismissed coaching items as "Onboarding Tips" result type
- [ ] All 15 MVP coaching items seeded in mock adapter
- [ ] Documentation created: `docs/reference/query-hooks/coaching.md`
- [ ] Documentation created: `docs/how-to/administrator/managing-coaching-content.md`
- [ ] ADR created: `docs/architecture/adr/0016-progressive-coaching-system.md`

---

## §C — Auto-Save Draft Persistence

### C.1 Product Requirements

**What it is:** Every major multi-field form in HB Intel automatically saves a local draft every 30 seconds. If the user navigates away accidentally, the browser crashes, or the network fails mid-save, their work is fully recoverable. On return, a non-blocking banner offers to restore the draft.

**What problem it solves:** The UX study identifies lost form data as the "single highest-consequence UX failure across all construction platforms." No competitor currently solves this. It is a wide-open differentiator that directly affects field users who may lose connectivity mid-form.

**Behavioral specification:**

- Auto-save fires every 30 seconds while a form has unsaved changes
- Draft is stored in `localStorage` (available offline, no network required)
- A subtle "Draft saved" indicator appears briefly (2 seconds) in the form's sticky footer after each auto-save
- When a user returns to a form that has a saved draft, a `HbcDraftRecoveryBanner` appears at the top of the form with two options: "Restore my draft" and "Start fresh"
- Choosing "Start fresh" clears the draft permanently
- Choosing "Restore my draft" populates the form with draft values and removes the banner
- Drafts expire after 7 days automatically
- Draft keys are namespaced by `{formId}:{userId}:{projectCode}` to prevent cross-user or cross-project collisions

**Forms in scope for Phase 4:**

| Form | Form ID |
|---|---|
| Go/No-Go Scorecard (all sections) | `scorecard-edit` |
| Turnover Meeting Agenda | `turnover-edit` |
| Project Management Plan (all sections) | `pmp-edit` |
| Monthly Project Review (all steps) | `monthly-review-edit` |
| Lead Intake Form | `lead-create` |
| Estimating Kickoff Form | `kickoff-create` |
| Post-Bid Autopsy Form | `autopsy-edit` |

---

### C.2 Draft Storage Strategy

Drafts are stored in `localStorage` using the following key format:

```
hbc:draft:{formId}:{userId}:{projectCode}:{formVersion}
```

The value is a JSON-serialized object:

```typescript
interface DraftEnvelope<T> {
  /** The draft form data */
  data: T;
  /** ISO timestamp of when this draft was saved */
  savedAt: string;
  /** ISO timestamp after which this draft should be discarded */
  expiresAt: string;
  /** Semantic version of the form schema — used to discard stale drafts after form changes */
  formVersion: string;
}
```

`formVersion` is a constant string defined per form (e.g., `"1.0"`). When a form's field structure changes in a future release, increment `formVersion` to cause all existing drafts for that form to be ignored safely.

---

### C.3 `useFormDraft` Hook Implementation

**File location:** `packages/query-hooks/src/stores/useFormDraftStore.ts` (extend the existing Zustand store established in Phase 3)

```typescript
/**
 * Extension of the existing useFormDraftStore (established in Phase 3).
 * Adds auto-save interval management and expiry-aware draft retrieval.
 *
 * NOTE: This extends, does not replace, the Phase 3 useFormDraftStore.
 * The Phase 3 store handles in-memory draft state during a session.
 * This extension adds localStorage persistence across sessions.
 */

import { useEffect, useCallback, useRef } from 'react';
import { useCurrentUser } from '@hbc/auth';

const DRAFT_AUTO_SAVE_INTERVAL_MS = 30_000; // 30 seconds
const DRAFT_EXPIRY_DAYS = 7;
const DRAFT_KEY_PREFIX = 'hbc:draft';

interface UseFormDraftOptions<T> {
  /** Unique identifier for this form type */
  formId: string;
  /** Project code to scope the draft (prevents cross-project collisions) */
  projectCode: string;
  /** Current form data — provided by the parent form's state */
  formData: T;
  /** Semantic version of the form schema */
  formVersion?: string;
}

interface UseFormDraftReturn<T> {
  /** Whether a recoverable draft exists for this user + form + project */
  hasDraft: boolean;
  /** Restore draft data — call when user confirms recovery */
  restoreDraft: () => T | null;
  /** Clear the draft — call on successful form submission or "Start fresh" */
  clearDraft: () => void;
  /** The ISO timestamp when the draft was last saved */
  draftSavedAt: string | null;
}

/**
 * Manages local draft persistence for a form. Attaches an auto-save interval
 * to the provided `formData` and exposes draft recovery utilities.
 *
 * @example
 * ```tsx
 * const { hasDraft, restoreDraft, clearDraft } = useFormDraft({
 *   formId: 'scorecard-edit',
 *   projectCode: project.code,
 *   formData: scorecardFormState,
 * });
 * ```
 */
export function useFormDraft<T>({
  formId,
  projectCode,
  formData,
  formVersion = '1.0',
}: UseFormDraftOptions<T>): UseFormDraftReturn<T> {
  const { currentUser } = useCurrentUser();
  const userId = currentUser?.id ?? 'anonymous';
  const storageKey = `${DRAFT_KEY_PREFIX}:${formId}:${userId}:${projectCode}:${formVersion}`;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-save on interval
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      try {
        const envelope = {
          data: formData,
          savedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + DRAFT_EXPIRY_DAYS * 86400000).toISOString(),
          formVersion,
        };
        localStorage.setItem(storageKey, JSON.stringify(envelope));
      } catch {
        // localStorage may be unavailable (private browsing, quota exceeded) — fail silently
      }
    }, DRAFT_AUTO_SAVE_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [storageKey, formData, formVersion]);

  const getRawDraft = useCallback((): { data: T; savedAt: string } | null => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      const envelope = JSON.parse(raw) as { data: T; savedAt: string; expiresAt: string; formVersion: string };
      // Discard expired drafts
      if (new Date(envelope.expiresAt) < new Date()) {
        localStorage.removeItem(storageKey);
        return null;
      }
      // Discard drafts from a different schema version
      if (envelope.formVersion !== formVersion) {
        localStorage.removeItem(storageKey);
        return null;
      }
      return { data: envelope.data, savedAt: envelope.savedAt };
    } catch {
      return null;
    }
  }, [storageKey, formVersion]);

  const hasDraft = !!getRawDraft();

  const restoreDraft = useCallback((): T | null => {
    const draft = getRawDraft();
    return draft?.data ?? null;
  }, [getRawDraft]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Fail silently
    }
  }, [storageKey]);

  return {
    hasDraft,
    restoreDraft,
    clearDraft,
    draftSavedAt: getRawDraft()?.savedAt ?? null,
  };
}
```

---

### C.4 `HbcDraftRecoveryBanner` Component

**File location:** `packages/ui-kit/src/HbcDraftRecoveryBanner/HbcDraftRecoveryBanner.tsx`

```tsx
import React from 'react';
import { makeStyles, tokens, Text, Button, MessageBar, MessageBarActions, MessageBarBody } from '@fluentui/react-components';
import { Clock20Regular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  bar: {
    marginBottom: '16px',
    border: `1px solid ${tokens.colorBrandBackground}`,
  },
});

interface HbcDraftRecoveryBannerProps {
  /** ISO timestamp when the draft was saved */
  savedAt: string;
  /** Called when user clicks "Restore my draft" */
  onRestore: () => void;
  /** Called when user clicks "Start fresh" */
  onDiscard: () => void;
}

/**
 * Non-blocking banner shown when a recoverable draft exists for a form.
 * Appears at the top of the form's content area, above the first form section.
 *
 * @example
 * ```tsx
 * {hasDraft && (
 *   <HbcDraftRecoveryBanner
 *     savedAt={draftSavedAt}
 *     onRestore={() => { const d = restoreDraft(); if (d) setFormState(d); }}
 *     onDiscard={() => { clearDraft(); }}
 *   />
 * )}
 * ```
 */
export const HbcDraftRecoveryBanner: React.FC<HbcDraftRecoveryBannerProps> = ({
  savedAt,
  onRestore,
  onDiscard,
}) => {
  const styles = useStyles();
  const savedTime = new Date(savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const savedDate = new Date(savedAt).toLocaleDateString();

  return (
    <MessageBar intent="info" className={styles.bar}>
      <MessageBarBody>
        <Clock20Regular style={{ marginRight: '6px', verticalAlign: 'middle' }} />
        <Text>
          You have an unsaved draft from {savedDate} at {savedTime}.
        </Text>
      </MessageBarBody>
      <MessageBarActions
        containerAction={
          <Button appearance="transparent" size="small" onClick={onDiscard}>
            Start fresh
          </Button>
        }
      >
        <Button appearance="primary" size="small" onClick={onRestore}>
          Restore my draft
        </Button>
      </MessageBarActions>
    </MessageBar>
  );
};
```

---

### C.5 Integration Into Existing Forms

For each form in scope (§C.1), apply the following integration pattern. Example shown for the Go/No-Go Scorecard:

```tsx
// In apps/pwa/src/pages/GoNoGoScorecardPage.tsx (or equivalent)

import { useFormDraft, HbcDraftRecoveryBanner } from '@hbc/ui-kit';
// ... existing imports

export const GoNoGoScorecardPage: React.FC = () => {
  const [formState, setFormState] = useState<IScorecardFormData>(initialState);
  const { currentUser } = useCurrentUser();
  const project = useProjectStore((s) => s.activeProject);

  const { hasDraft, restoreDraft, clearDraft, draftSavedAt } = useFormDraft({
    formId: 'scorecard-edit',
    projectCode: project?.code ?? 'unknown',
    formData: formState,
  });

  const handleRestore = () => {
    const draft = restoreDraft();
    if (draft) setFormState(draft);
  };

  const handleSubmit = async () => {
    // ... existing submit logic ...
    clearDraft(); // Always clear on successful submit
  };

  return (
    <CreateUpdateLayout title="Go/No-Go Scorecard" onSubmit={handleSubmit}>
      {/* Draft recovery banner — rendered above the first form section */}
      {hasDraft && draftSavedAt && (
        <HbcDraftRecoveryBanner
          savedAt={draftSavedAt}
          onRestore={handleRestore}
          onDiscard={clearDraft}
        />
      )}

      {/* Existing form sections — unchanged */}
      <HbcFormSection title="Project Overview">
        {/* ... */}
      </HbcFormSection>
      {/* ... remaining sections */}
    </CreateUpdateLayout>
  );
};
```

Apply this exact pattern to all 7 forms in §C.1. The only variables that change per form are `formId`, the form state type, and the form content.

**Sticky footer "Draft saved" indicator:**

In `packages/ui-kit/src/HbcForm/HbcFormStickyFooter.tsx`, add a draft indicator display that the footer already renders when `draftSavedAt` is recent:

```tsx
// In the sticky footer component, add:
{draftIndicatorVisible && (
  <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>
    ✓ Draft saved {formattedTime}
  </Text>
)}
```

The footer shows this indicator for 2 seconds after each auto-save, then fades it out via CSS transition.

---

### C.6 Checklist

- [ ] `useFormDraft` hook created in `packages/query-hooks/src/stores/`
- [ ] `useFormDraft` exported from `@hbc/query-hooks` barrel
- [ ] Auto-save fires every 30 seconds when form has data (verified in DevTools Application → localStorage)
- [ ] Draft key includes `{formId}:{userId}:{projectCode}:{formVersion}` — verified by inspecting localStorage keys
- [ ] Draft expires after 7 days (set `expiresAt` correctly, verified by mocking `Date.now()` in tests)
- [ ] `formVersion` mismatch causes draft to be silently discarded
- [ ] `localStorage` unavailable (e.g., private browsing) handled gracefully — no error thrown
- [ ] `HbcDraftRecoveryBanner` renders above first form section when draft exists
- [ ] "Restore my draft" populates form state and removes banner
- [ ] "Start fresh" clears draft from localStorage and removes banner
- [ ] Successful form submission calls `clearDraft()`
- [ ] Sticky footer shows "Draft saved" indicator for 2 seconds after each auto-save
- [ ] `HbcDraftRecoveryBanner` exported from `@hbc/ui-kit` barrel
- [ ] All 7 in-scope forms have `useFormDraft` integrated
- [ ] Background Sync (V2.1) and draft persistence are complementary — documented in ADR
- [ ] Documentation created: `docs/reference/ui-kit/hbc-draft-recovery-banner.md`
- [ ] ADR created: `docs/architecture/adr/0017-form-draft-persistence.md`

---

## §D — Lightweight UX Instrumentation

### D.1 Product Requirements

**What it is:** A lightweight, privacy-respecting measurement system that captures how long the 5 most important task flows take to complete, and prompts users with a single "How easy was that?" question after completing a workflow-terminal action. Data is stored anonymously in SharePoint.

**What problem it solves:** Without measurement, UX improvements are prioritized by intuition rather than evidence. This system generates real data — from real HBC users on real projects — that informs Phase 5 prioritization with confidence. It also creates a baseline that can prove HB Intel's performance superiority over incumbent platforms.

**Behavioral specification:**

- Task timing is captured client-side: a timer starts when a user enters a workflow and stops when they successfully complete the terminal action (form submit, approval sent, signature placed)
- Timing data is anonymous — no PII is stored. Data stored: task name, duration in seconds, user's role, whether they were online or offline, timestamp
- Customer Effort Score (CES) prompt appears **once after each terminal action** as a non-blocking toast that slides in from the bottom: "How easy was that? [1][2][3][4][5][6][7]" — a 7-button tap scale
- CES prompt auto-dismisses after 10 seconds if not answered — no disruption to workflow
- CES prompt does not appear more than once per user per 24 hours per task to prevent survey fatigue
- Data syncs to SharePoint via the Background Sync API (V2.1) — works offline, uploads when connected
- An Admin-only UX Metrics dashboard in the Admin webpart displays aggregated timing and CES data

---

### D.2 SharePoint List Schema

Create a SharePoint list named `HBIntel_UXMetrics` in the hub site with the following columns:

| Column Name | Type | Notes |
|---|---|---|
| `Title` | Single line text | Auto-generated UUID — not meaningful |
| `TaskName` | Single line text | One of 5 instrumented task names |
| `DurationSeconds` | Number | Time from task start to completion |
| `UserRole` | Single line text | User's primary role name |
| `WasOffline` | Yes/No | Whether user was offline during the task |
| `CEScore` | Number | 1–7 CES rating (null if not answered) |
| `RecordedAt` | Date/Time | ISO timestamp |

> **Privacy note:** No user IDs, names, email addresses, or project identifiers are stored. This is aggregated role-level performance data only.

---

### D.3 `useUXInstrumentation` Hook Implementation

**File location:** `packages/query-hooks/src/instrumentation/useUXInstrumentation.ts`

```typescript
import { useCallback, useRef } from 'react';
import { useCurrentUser } from '@hbc/auth';
import { useRepository } from '../useRepository';

export type InstrumentedTaskName =
  | 'create-go-no-go-scorecard'
  | 'complete-startup-checklist-item'
  | 'submit-monthly-review-step'
  | 'open-my-work-feed'
  | 'complete-turnover-signature';

interface TaskRecord {
  taskName: InstrumentedTaskName;
  startedAt: number; // performance.now() timestamp
}

/**
 * Lightweight UX task timing instrumentation.
 *
 * Usage — wrap a task flow:
 * ```tsx
 * const { startTask, completeTask } = useUXInstrumentation();
 *
 * // When user begins a task:
 * startTask('create-go-no-go-scorecard');
 *
 * // When user successfully completes the task:
 * await completeTask('create-go-no-go-scorecard'); // Records timing to SharePoint
 * ```
 */
export function useUXInstrumentation() {
  const { currentUser } = useCurrentUser();
  const metricsRepo = useRepository('uxMetrics'); // Add port to @hbc/data-access
  const activeTaskRef = useRef<TaskRecord | null>(null);

  const startTask = useCallback((taskName: InstrumentedTaskName) => {
    activeTaskRef.current = {
      taskName,
      startedAt: performance.now(),
    };
  }, []);

  const completeTask = useCallback(
    async (taskName: InstrumentedTaskName): Promise<number | null> => {
      const task = activeTaskRef.current;
      if (!task || task.taskName !== taskName) return null;

      const durationSeconds = Math.round((performance.now() - task.startedAt) / 1000);
      activeTaskRef.current = null;

      // Store anonymously — no user PII
      try {
        await metricsRepo.record({
          taskName,
          durationSeconds,
          userRole: currentUser?.roles?.[0] ?? 'Unknown',
          wasOffline: !navigator.onLine,
          recordedAt: new Date().toISOString(),
          cesScore: null, // CES score is recorded separately via HbcCESPrompt
        });
      } catch {
        // Instrumentation failure must never disrupt the user workflow — fail silently
      }

      return durationSeconds;
    },
    [currentUser, metricsRepo]
  );

  const recordCES = useCallback(
    async (taskName: InstrumentedTaskName, score: 1 | 2 | 3 | 4 | 5 | 6 | 7) => {
      try {
        await metricsRepo.record({
          taskName,
          durationSeconds: null,
          userRole: currentUser?.roles?.[0] ?? 'Unknown',
          wasOffline: !navigator.onLine,
          recordedAt: new Date().toISOString(),
          cesScore: score,
        });
      } catch {
        // Fail silently
      }
    },
    [currentUser, metricsRepo]
  );

  return { startTask, completeTask, recordCES };
}
```

---

### D.4 `HbcCESPrompt` Component Implementation

**File location:** `packages/ui-kit/src/HbcCESPrompt/HbcCESPrompt.tsx`

```tsx
import React, { useEffect, useRef } from 'react';
import { makeStyles, tokens, Text, Button } from '@fluentui/react-components';
import type { InstrumentedTaskName } from '@hbc/query-hooks';

const useStyles = makeStyles({
  root: {
    position: 'fixed',
    bottom: '80px', // Above bottom navigation on mobile
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: '8px',
    padding: '16px 20px',
    boxShadow: tokens.shadow16,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    alignItems: 'center',
    zIndex: 1000,
    minWidth: '320px',
    maxWidth: '480px',
    // Animate in from bottom
    animationName: {
      from: { opacity: 0, transform: 'translateX(-50%) translateY(16px)' },
      to: { opacity: 1, transform: 'translateX(-50%) translateY(0)' },
    },
    animationDuration: '200ms',
    animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    '@media (prefers-reduced-motion: reduce)': {
      animationDuration: '0ms',
    },
  },
  scaleRow: {
    display: 'flex',
    gap: '6px',
  },
  scaleButton: {
    minWidth: '36px',
    height: '36px',
    borderRadius: '6px',
    padding: '0',
  },
  scaleLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
  },
});

const CES_SCORES = [1, 2, 3, 4, 5, 6, 7] as const;

interface HbcCESPromptProps {
  taskName: InstrumentedTaskName;
  onScore: (score: 1 | 2 | 3 | 4 | 5 | 6 | 7) => void;
  onDismiss: () => void;
  /** Auto-dismiss after this many milliseconds. Default: 10000 */
  autoDismissMs?: number;
}

/**
 * Non-blocking Customer Effort Score prompt.
 * Appears after a user completes a terminal workflow action.
 * Auto-dismisses after 10 seconds if not answered.
 *
 * @example
 * ```tsx
 * {showCES && (
 *   <HbcCESPrompt
 *     taskName="create-go-no-go-scorecard"
 *     onScore={(s) => { recordCES('create-go-no-go-scorecard', s); setShowCES(false); }}
 *     onDismiss={() => setShowCES(false)}
 *   />
 * )}
 * ```
 */
export const HbcCESPrompt: React.FC<HbcCESPromptProps> = ({
  taskName,
  onScore,
  onDismiss,
  autoDismissMs = 10_000,
}) => {
  const styles = useStyles();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(onDismiss, autoDismissMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onDismiss, autoDismissMs]);

  const handleScore = (score: (typeof CES_SCORES)[number]) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    onScore(score);
  };

  return (
    <div
      className={styles.root}
      role="dialog"
      aria-modal="false"
      aria-label="How easy was that?"
    >
      <Text weight="semibold" size={300}>
        How easy was that?
      </Text>

      <div className={styles.scaleRow}>
        {CES_SCORES.map((score) => (
          <Button
            key={score}
            appearance="outline"
            className={styles.scaleButton}
            onClick={() => handleScore(score)}
            aria-label={`Score ${score}`}
          >
            {score}
          </Button>
        ))}
      </div>

      <div className={styles.scaleLabels}>
        <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>
          Very difficult
        </Text>
        <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>
          Very easy
        </Text>
      </div>
    </div>
  );
};
```

---

### D.5 Instrumented Task Definitions

The following 5 task flows must have `startTask` / `completeTask` calls wired at the appropriate points. Apply the instrumentation exactly as shown for each:

**Task 1 — `open-my-work-feed`**
- `startTask`: Called in `MyWorkPage` `useEffect` on mount
- `completeTask`: Called when `feed` data is received and rendered (first non-loading render)
- Measures: Time from page load to first meaningful content display

**Task 2 — `create-go-no-go-scorecard`**
- `startTask`: Called when user opens the scorecard create form
- `completeTask`: Called on successful form submission response
- CES prompt: Show after `completeTask` resolves

**Task 3 — `complete-startup-checklist-item`**
- `startTask`: Called when user taps a checklist item checkbox
- `completeTask`: Called when the item's `completed: true` mutation succeeds
- Note: No CES prompt for this task — too frequent (reduces survey fatigue)

**Task 4 — `submit-monthly-review-step`**
- `startTask`: Called when user opens a Monthly Review step form
- `completeTask`: Called on successful step submission
- CES prompt: Show after `completeTask` resolves

**Task 5 — `complete-turnover-signature`**
- `startTask`: Called when user opens the signature pad
- `completeTask`: Called on successful signature submission
- CES prompt: Show after `completeTask` resolves

**CES prompt frequency gate** — add this logic in each component that shows the CES prompt:

```typescript
const CES_COOLDOWN_KEY = (taskName: string) => `hbc:ces-last:${taskName}`;
const CES_COOLDOWN_HOURS = 24;

function shouldShowCES(taskName: string): boolean {
  try {
    const raw = localStorage.getItem(CES_COOLDOWN_KEY(taskName));
    if (!raw) return true;
    const lastShown = new Date(raw).getTime();
    const hoursElapsed = (Date.now() - lastShown) / (1000 * 60 * 60);
    return hoursElapsed >= CES_COOLDOWN_HOURS;
  } catch {
    return false; // If localStorage unavailable, don't show
  }
}

function recordCESShown(taskName: string): void {
  try {
    localStorage.setItem(CES_COOLDOWN_KEY(taskName), new Date().toISOString());
  } catch {}
}
```

---

### D.6 Checklist

- [ ] `IUXMetricsRepository` port created in `packages/data-access/src/ports/`
- [ ] Mock adapter `UXMetricsMockAdapter.ts` created (stores to in-memory array)
- [ ] SharePoint adapter stub created for `IUXMetricsRepository`
- [ ] `HBIntel_UXMetrics` SharePoint list documented in `docs/reference/schemas/ux-metrics-list.md`
- [ ] `useUXInstrumentation` hook exported from `@hbc/query-hooks` barrel
- [ ] `startTask` / `completeTask` calls wired in all 5 instrumented flows
- [ ] Task timing data written to mock adapter successfully (verified in dev-harness)
- [ ] Instrumentation failure (network down, SharePoint error) does not throw or disrupt user workflow
- [ ] `HbcCESPrompt` appears after `completeTask` for tasks 2, 4, 5
- [ ] `HbcCESPrompt` auto-dismisses after 10 seconds without interaction
- [ ] CES prompt does not appear more than once per task per 24 hours per device (localStorage gate)
- [ ] CES score is recorded to `HBIntel_UXMetrics` with `cesScore` populated and `durationSeconds: null`
- [ ] Admin webpart UX Metrics view shows aggregated task timing and CES averages per role
- [ ] `HbcCESPrompt` is keyboard accessible (`Tab` through buttons, `Enter` to select)
- [ ] `HbcCESPrompt` exported from `@hbc/ui-kit` barrel
- [ ] Documentation created: `docs/reference/query-hooks/ux-instrumentation.md`
- [ ] Documentation created: `docs/how-to/administrator/reading-ux-metrics.md`
- [ ] ADR created: `docs/architecture/adr/0018-ux-instrumentation.md`

---

## §E — Updated Phase 4 Completion Checklist

This checklist extends the V2.1 completion checklist. All V2.1 checklist items remain required and are not re-stated here. These items are **additive**.

### My Work Feed (§A)
- [ ] All §A.7 checklist items pass

### Progressive Coaching (§B)
- [ ] All §B.7 checklist items pass

### Auto-Save Draft Persistence (§C)
- [ ] All §C.6 checklist items pass

### UX Instrumentation (§D)
- [ ] All §D.6 checklist items pass

### Cross-Cutting Integration Verification

- [ ] `useMyWork`, `useCoaching`, `useFormDraft`, `useUXInstrumentation` all exported from `@hbc/query-hooks` root barrel
- [ ] `HbcMyWorkFeed`, `HbcCoachCard`, `HbcDraftRecoveryBanner`, `HbcCESPrompt` all exported from `@hbc/ui-kit` root barrel
- [ ] All new components have `Default`, `AllVariants`, `FieldMode`, `A11yTest` Storybook exports
- [ ] All new components pass WCAG 2.2 AA in light mode and AAA in Field Mode (V2.1 Decision #29)
- [ ] All new components respect `prefers-reduced-motion` (V2.1 Decision #30)
- [ ] `pnpm turbo run build` succeeds with zero errors across all packages and apps
- [ ] Dev-harness tab for PWA shows My Work feed as the default landing screen
- [ ] Mock adapter returns realistic test data for all new repositories

### New Repository Ports Added to `@hbc/data-access`

- [ ] `ICoachingRepository` port and mock adapter
- [ ] `IUXMetricsRepository` port and mock adapter
- [ ] Both ports registered in `factory.ts`
- [ ] Both ports added to `useRepository` dependency injection map in `@hbc/query-hooks`

### Documentation

- [ ] `docs/reference/query-hooks/my-work.md`
- [ ] `docs/reference/query-hooks/coaching.md`
- [ ] `docs/reference/query-hooks/ux-instrumentation.md`
- [ ] `docs/reference/ui-kit/hbc-my-work-feed.md`
- [ ] `docs/reference/ui-kit/hbc-coach-card.md`
- [ ] `docs/reference/ui-kit/hbc-draft-recovery-banner.md`
- [ ] `docs/reference/ui-kit/hbc-ces-prompt.md`
- [ ] `docs/reference/schemas/coaching-items-list.md`
- [ ] `docs/reference/schemas/coaching-progress-list.md`
- [ ] `docs/reference/schemas/ux-metrics-list.md`
- [ ] `docs/how-to/administrator/managing-coaching-content.md`
- [ ] `docs/how-to/administrator/reading-ux-metrics.md`
- [ ] Blueprint `<!-- IMPLEMENTATION PROGRESS & NOTES -->` comment block updated with Phase 4 V3.0 completion date and new ADR references

---

## §F — Architecture Decision Records

Create the following four ADR files in `docs/architecture/adr/`. Each file follows the standard ADR template (Title, Status, Context, Decision, Consequences).

| ADR Number | File Name | Decision Summary |
|---|---|---|
| 0015 | `0015-my-work-feed.md` | Dynamic My Work feed aggregates from 7 domain repositories client-side using parallel `Promise.all` rather than a server-side aggregation endpoint, keeping the architecture simple for Phase 4 while remaining migratable to a server-side feed in Phase 6 |
| 0016 | `0016-progressive-coaching-system.md` | Coaching content stored in SharePoint list (not hardcoded) to enable non-developer content updates. 5 MVP roles scoped to align with Blueprint rollout priorities. Generic fallback prevents zero-guidance for uncovered roles |
| 0017 | `0017-form-draft-persistence.md` | `localStorage` chosen over IndexedDB for draft persistence due to simplicity and synchronous API. IndexedDB is reserved for service worker caching (V2.1). Draft and Background Sync are complementary — drafts protect against browser-level data loss, Background Sync protects against network-level submission failure |
| 0018 | `0018-ux-instrumentation.md` | No PII stored in `HBIntel_UXMetrics`. Role-only attribution enables meaningful segmentation (field vs. office performance) without privacy risk. 5-task scope chosen to generate actionable signal without instrumentation overhead. CES 24-hour cooldown prevents survey fatigue while maintaining data freshness |

---

*PH4-UX-Enhanced-Plan.md V3.0 — Hedrick Brothers Construction · HB Intel Platform · March 2026*  
*Supersedes PH4-UI-Design-Plan.md V2.1 for the four new implementation layers defined in §A–§D.*  
*All V2.1 decisions (Decisions #1–#32) remain fully in force.*  
*Governed by HB-Intel-Blueprint-V4.md and CLAUDE.md v1.2.*  
*All deviations from locked decisions require a formal ADR and sign-off.*