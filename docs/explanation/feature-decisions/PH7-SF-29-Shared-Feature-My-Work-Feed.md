# PH7-SF-29: `@hbc/my-work-feed` — Unified Cross-Module Personal Work Inbox, Queue & Action Orchestration Surface

**Priority Tier:** 2 — Application Layer (shared package; cross-module personal work orchestration)
**Module:** Platform / Shared Infrastructure (cross-module)
**Interview Decision:** Repo Review + Research Synthesis — derived from current package inventory, PH7 shared-feature plans, PH9b My Work direction, and 2025–2026 external UX / architecture research (not yet interview-locked)
**Mold Breaker Source:** UX-MB §4 (Universal Next Move); UX-MB §1 (Role-Based Project Canvas); UX-MB §9 (Notification Intelligence); UX-MB §3 (Unified Work Graph); UX-MB §11 (Transparent Systems)

---

## Problem Solved

HB Intel is already being structured around a set of shared primitives that each answer part of the same operational question:

- **What do I own right now?** → `@hbc/bic-next-move`
- **What was handed to me?** → `@hbc/workflow-handoff`
- **What still needs my acknowledgment or review?** → `@hbc/acknowledgment`
- **What changed that I should pay attention to?** → `@hbc/notification-intelligence`
- **What is most relevant to my role and project context?** → `@hbc/project-canvas`
- **What related work or record context should I see next?** → `@hbc/related-items`
- **What state must survive offline or degraded connectivity?** → `@hbc/session-state`

Each package is valuable independently, but from the user’s perspective they are all facets of one practical need:

> **“Show me my work, in priority order, with enough context to act immediately.”**

The older PH9b UX enhancement plan recognized this and introduced a **Dynamic My Work Feed** with a `useMyWork` hook inside `@hbc/query-hooks`. That was the correct product direction at the time, but the repo has since evolved into a much more package-centric architecture, where platform primitives are scaffolded as dedicated workspaces under `packages/` with their own contracts, exports, tests, and implementation plans. My Work should now follow that same pattern rather than remaining a hook tucked inside another package.

Without a dedicated shared My Work package, the platform will fragment in predictable ways:

- BIC-owned work appears in one place
- handoff receipts appear in another
- pending approvals appear in another
- notifications appear in another
- Project Canvas tiles expose slices of work but not a unified queue
- field/mobile users get a different “my items” concept than desktop users
- module teams invent their own inboxes, counters, badges, filters, and action rows

That creates the exact operational friction the platform is trying to remove:

- duplicated “my items” implementations across modules
- inconsistent prioritization rules
- inconsistent definitions of what qualifies as actionable work
- poor relationship between panel surfaces, dashboard tiles, and full-page work queues
- weak offline behavior because each module handles caching differently
- no reliable answer to “why is this item here, and what replaced the older signal?”

The **My Work Feed** package is the shared orchestration layer that aggregates personal work across packages and modules into one normalized feed, one consistent prioritization model, one audit-friendly state model, and several reusable UI surfaces.

To fully solve the UX gap, the package must go beyond aggregation and include:

- **explainability** so the user can see why an item surfaced, why it is ranked where it is, and why they can or cannot act
- **lifecycle context** so the user can see what this item came from, what it blocks, and what likely comes next
- **inline execution** so common actions can be completed from the feed without repeated module-hopping
- **field-native behavior** so the same system works on a jobsite phone, tablet, or intermittent PWA session without becoming a shrunk desktop queue
- **manager / delegation overlays** so PM, PX, and executive users can see personal work and team bottlenecks through the same orchestration model
- **attention governance** so the feed reduces noise rather than becoming one more source of notification fatigue

It is not merely a panel. It is the platform’s canonical personal work system.

---

## Mold Breaker Rationale

The repo’s current shared-feature direction already implies that “My Work” is not optional glue — it is the user-facing convergence point for the platform’s accountability model.

The Phase 7 Shared Features Evaluation explicitly treats **My Work Feed (`useMyWork`, `HbcMyWorkFeed`)** as an already-planned cross-module action-aggregation surface that consumes `@hbc/bic-next-move`. The earlier PH9b UX plan also framed it as the answer to the highest-frequency operational question: **“What do I need to do right now?”**. That product framing still stands. What has changed is the architectural maturity of the repo: current shared primitives such as `@hbc/bic-next-move`, `@hbc/session-state`, `@hbc/workflow-handoff`, and `@hbc/notification-intelligence` now exist as first-class packages with their own contracts and testing paths. My Work should be elevated to the same level.

External pattern research strongly reinforces that decision:

1. Enterprise Microsoft 365 task experiences converge work into **Assigned to me** and **Tasks** surfaces instead of forcing users to visit each source system independently.
2. Viva Connections is built around **multi-surface task UX**: cards for quick awareness, quick views for inline drill-down, and deeper pages for full interaction.
3. Construction platforms such as Procore and Primavera Cloud both center personal work around filtered action queues, due-date sorting, configurable views, and handoff-aware task management.
4. Modern enterprise queue systems emphasize aggregated views, prioritization, deduplication, and operational triage rather than flat lists.
5. PWA guidance now treats offline-safe task continuity as a first-class requirement, not an enhancement.

This package is therefore the logical next step because it gives the platform a single place to:

1. normalize work from multiple shared primitives and feature modules
2. rank work by operational priority instead of raw source order
3. expose the same work model in several UI forms (tile, panel, full feed, mobile condensed view)
4. preserve action context so users can go from signal to action without hunting
5. deduplicate overlapping signals and handle superseded work cleanly
6. keep accountability visible and trustworthy as the application grows
7. explain why each item is here, what it affects, and what changed since the user last saw it
8. create one consistent personal-work model that can expand into team oversight, delegation, and escalation surfaces without fragmenting the UX

This package does **not** replace BIC, notifications, approvals, or workflow handoffs. It is the **personal work aggregation and action-routing layer** that turns those primitives into a coherent daily operating surface.

The mold-breaker opportunity is not simply to ship a cleaner inbox. It is to replace the fragmented, module-first operating model common in current construction platforms with a **work-first system** that is:

- **explainable** rather than opaque
- **lifecycle-aware** rather than list-only
- **inline-actionable** rather than click-heavy
- **attention-governed** rather than notification-driven
- **field-capable** rather than desktop-first with mobile compromise
- **manager-aware** rather than limited to individual assignment views

That is the threshold that makes My Work a genuine platform differentiator instead of a familiar “Assigned to Me” variant.

---

## My Work Feed Model

The package should unify several categories of work while keeping their source identity explicit.

### Work Item Classes

- **Owned Action** — an item where the current user is the active owner (`@hbc/bic-next-move` primary case)
- **Inbound Handoff** — a package, record, or workflow state awaiting review / receipt / acceptance by the current user
- **Pending Approval / Acknowledgment** — a sign-off, comment resolution, or structured receipt task awaiting the current user
- **Attention Item** — a high-value notification or system signal that should surface alongside action work
- **Queued Follow-Up** — a draft, blocked action, or deferred step the user can resume or clear
- **Contextual Work Signal** — related activity or dependency that changes the urgency of another active item

### Feed Modes

- **Personal Feed** — all work for the authenticated user across modules
- **Project-Scoped Feed** — current user’s work filtered to a single project context
- **Module-Scoped Feed** — current user’s work limited to one functional area
- **Role Tile Feed** — compact projection used inside `@hbc/project-canvas`
- **Panel Feed** — app-shell slide-out / “My Items” side panel projection
- **Full Workspace Feed** — dedicated page with filtering, grouping, saved views, and bulk actions
- **Mobile Condensed Feed** — field/PWA list optimized for narrow width, intermittent connectivity, and direct action

### Standard Work States

1. **New** — surfaced to the user but not yet viewed in My Work
2. **Active** — current actionable work item
3. **Blocked** — current user owns it but cannot advance it
4. **Waiting** — visible to the user but awaiting external completion before action
5. **Deferred** — intentionally snoozed / postponed within guardrails
6. **Superseded** — an older signal that has been replaced by a newer canonical item
7. **Completed / Cleared** — no longer active in the feed but retained in history

### Priority Tiers

The feed should separate **source urgency** from **presentation priority**.

**Source urgency examples**
- BIC `immediate` / `watch` / `upcoming`
- notification `Immediate` / `Watch` / `Digest`
- handoff `received but not acknowledged`
- approval due / overdue state
- checklist or startup item overdue state

**Presentation priority examples**
- **Now** — action required immediately, overdue, signature-blocked, or operationally critical
- **Soon** — action should be taken soon but is not yet overdue
- **Watch** — awareness matters because the item may become actionable or materially affect another item
- **Deferred** — intentionally postponed / user-cleared from immediate queue

The package should compute presentation priority consistently even when source systems use different urgency models.

### Explainability, Permission Clarity & Lifecycle Context

Every item should carry enough structured metadata to answer four questions without forcing the user into the source module:

- **Why is this here?**
- **Why is it ranked here?**
- **Why can or can’t I act?**
- **What does this block or change downstream?**

To support that, normalized items should include:

- source traces and latest-source reason
- ranking rationale summary
- permission / ownership explanation
- blocker explanation
- a lightweight work-graph preview (previous step, current step, likely next step, impacted record or dependency)

### Personal vs Team Perspectives

The package should ship with a personal feed first, but its underlying model should support adjacent views for:

- **My Work** — the current user’s active queue
- **Delegated by Me** — work routed to others that I still monitor
- **My Team’s Work** — manager / PX / executive oversight of aging, blocked, or overdue items
- **Escalation Candidates** — items stalled beyond policy thresholds

These should remain views over one canonical model rather than separate queue implementations.

### Personal Planning Controls

A high-value My Work surface should support lightweight personal orchestration directly in the feed:

- pin to **Today**
- pin to **This Week**
- snooze until date / time / event
- mark **Waiting on someone else**
- attach a note to self
- restore deferred work predictably

### Core Questions the Feed Must Answer

- What do I own right now?
- What is overdue?
- What is blocked and why?
- What arrived since I last checked?
- What was handed to me?
- What can I clear in bulk?
- What project or module is each item tied to?
- What should I open next to act?
- What newer item superseded this older signal?
- Why can’t I act on this item right now?
- What changed since I last viewed it?
- What or who is this currently blocking?
- Which items belong in my personal queue versus my team oversight queue?

---

## My Work Surface Structure

Research and repo review both point to the same UX model: **one normalized data contract, several disclosure surfaces**.

### Canonical Surfaces

- **`HbcMyWorkLauncher`** — app-header entry point, icon/button, urgent count, and quick route to the full feed
- **`HbcMyWorkPanel`** — shell-level side panel / quick inbox for rapid triage
- **`HbcMyWorkFeed`** — full feed surface with grouping, filtering, saved views, and bulk actions
- **`HbcMyWorkTile`** — project-canvas tile variant for role-aware command-center surfaces
- **`HbcMyWorkBadge`** — compact unread / urgent count indicator for shell and mobile nav
- **`HbcMyWorkTeamFeed`** — manager / PX / executive oversight surface for delegated, aging, and escalatable work
- **`HbcMyWorkReasonDrawer`** — inline explainability panel showing why the item surfaced, why it is ranked, and what is blocking action
- **`HbcMyWorkPlanningBar`** — Today / This Week / defer / waiting-on controls for lightweight personal planning
- **`HbcMyWorkEmptyState`** — role-aware caught-up / no-items guidance surface
- **`HbcMyWorkOfflineBanner`** — degraded-connectivity indicator paired to last successful sync and queued local actions
- **`HbcMyWorkSourceHealth`** — expert/diagnostic trust surface for source freshness, degraded adapters, and hidden superseded items

### Surface Responsibilities

- **Launcher / badge** favors awareness and entry into the work system
- **Tile** favors role/project relevance and compact urgency visibility
- **Panel** favors speed, triage, inline micro-actions, and immediate deep-linking
- **Full feed** favors queue management, search, grouping, saved views, bulk action, explainability, and lifecycle context
- **Team feed** favors delegation, aging visibility, escalation, and owner-by-owner bottleneck review
- **Mobile condensed feed** favors quick scan, pull-to-refresh, offline-safe action resumption, location-aware grouping, and low cognitive load

### Complexity-Aware Disclosure Rules

This package should explicitly follow the repo’s complexity model and modern progressive-disclosure guidance:

- **Essential** shows grouped counts, the top few urgent items, and one primary action per item
- **Standard** adds status reasons, due-date nuance, source detail, planning controls, and secondary actions
- **Expert** adds grouping controls, source diagnostics, dedupe/supersession traces, history, permission traces, queue-health signals, and advanced queue tools

The critical rule is that **the item contract stays the same across surfaces**. Only the amount of disclosed metadata changes.

---

## Interface Contract

```typescript
export type MyWorkItemClass =
  | 'owned-action'
  | 'inbound-handoff'
  | 'pending-approval'
  | 'attention-item'
  | 'queued-follow-up'
  | 'contextual-signal';

export type MyWorkPriority = 'now' | 'soon' | 'watch' | 'deferred';
export type MyWorkLane = 'do-now' | 'waiting-blocked' | 'watch' | 'delegated-team' | 'deferred';
export type MyWorkState =
  | 'new'
  | 'active'
  | 'blocked'
  | 'waiting'
  | 'deferred'
  | 'superseded'
  | 'completed';

export type MyWorkOwnerType = 'user' | 'role' | 'company' | 'system';

export type MyWorkSource =
  | 'bic-next-move'
  | 'workflow-handoff'
  | 'acknowledgment'
  | 'notification-intelligence'
  | 'session-state'
  | 'module';

export interface IMyWorkOwner {
  type: MyWorkOwnerType;
  id: string;
  label: string;
}

export interface IMyWorkContext {
  moduleKey: string;
  projectId?: string;
  projectCode?: string;
  projectName?: string;
  recordId?: string;
  recordType?: string;
  workflowStepKey?: string;
  versionId?: string;
  href?: string;
}

export interface IMyWorkSourceMeta {
  source: MyWorkSource;
  sourceEventType?: string;
  sourceUrgency?: string;
  sourceItemId: string;
  sourceUpdatedAtIso: string;
  explanation?: string;
}

export interface IMyWorkPermissionState {
  canOpen: boolean;
  canAct: boolean;
  canDelegate?: boolean;
  canBulkAct?: boolean;
  cannotActReason?: string | null;
}

export interface IMyWorkLifecyclePreview {
  previousStepLabel?: string | null;
  currentStepLabel?: string | null;
  nextStepLabel?: string | null;
  blockedDependencyLabel?: string | null;
  impactedRecordLabel?: string | null;
}

export interface IMyWorkRankingReason {
  primaryReason: string;
  contributingReasons: string[];
  score?: number;
}

export interface IMyWorkAttentionPolicy {
  batchGroupKey?: string | null;
  escalationAtIso?: string | null;
  suppressedDuplicateCount?: number;
  quietHoursDeferred?: boolean;
}

export interface IMyWorkHealthState {
  freshness: 'live' | 'cached' | 'partial';
  hiddenSupersededCount?: number;
  degradedSourceCount?: number;
  warningMessage?: string | null;
}

export interface IMyWorkActionDefinition {
  key: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  requiresConfirmation?: boolean;
  offlineCapable?: boolean;
}

export interface IMyWorkItem {
  workItemId: string;
  canonicalKey: string;
  dedupeKey: string;
  class: MyWorkItemClass;
  priority: MyWorkPriority;
  state: MyWorkState;
  lane: MyWorkLane;
  title: string;
  summary: string;
  expectedAction?: string;
  dueDateIso?: string | null;
  isOverdue: boolean;
  isUnread: boolean;
  isBlocked: boolean;
  blockedReason?: string | null;
  changeSummary?: string | null;
  whyThisMatters?: string | null;
  supersededByWorkItemId?: string | null;
  owner: IMyWorkOwner;
  previousOwner?: IMyWorkOwner | null;
  context: IMyWorkContext;
  sourceMeta: IMyWorkSourceMeta[];
  permissionState: IMyWorkPermissionState;
  lifecycle: IMyWorkLifecyclePreview;
  rankingReason: IMyWorkRankingReason;
  attentionPolicy?: IMyWorkAttentionPolicy;
  availableActions: IMyWorkActionDefinition[];
  offlineCapable: boolean;
  healthState?: IMyWorkHealthState;
  delegatedBy?: IMyWorkOwner | null;
  delegatedTo?: IMyWorkOwner | null;
  locationLabel?: string | null;
  userNote?: string | null;
  createdAtIso: string;
  updatedAtIso: string;
}

export interface IMyWorkQuery {
  projectId?: string;
  moduleKeys?: string[];
  priorities?: MyWorkPriority[];
  classes?: MyWorkItemClass[];
  states?: MyWorkState[];
  includeDeferred?: boolean;
  includeSuperseded?: boolean;
  lane?: MyWorkLane;
  teamMode?: 'personal' | 'delegated-by-me' | 'my-team';
  locationLabel?: string;
  limit?: number;
}

export interface IMyWorkFeedResult {
  items: IMyWorkItem[];
  totalCount: number;
  unreadCount: number;
  nowCount: number;
  blockedCount: number;
  waitingCount: number;
  deferredCount: number;
  teamCount?: number;
  lastRefreshedIso: string;
  isStale: boolean;
  healthState?: IMyWorkHealthState;
}

export interface IMyWorkSourceAdapter {
  source: MyWorkSource;
  isEnabled(context: IMyWorkRuntimeContext): boolean;
  load(query: IMyWorkQuery, context: IMyWorkRuntimeContext): Promise<IMyWorkItem[]>;
}

export interface IMyWorkRuntimeContext {
  currentUserId: string;
  roleKeys: string[];
  projectIds?: string[];
  isOffline: boolean;
  complexityTier: 'essential' | 'standard' | 'expert';
}

export interface IMyWorkRegistryEntry {
  source: MyWorkSource;
  adapter: IMyWorkSourceAdapter;
  enabledByDefault?: boolean;
  rankingWeight?: number;
}

export interface IMyWorkCommandResult {
  success: boolean;
  message?: string;
  affectedWorkItemIds?: string[];
}
```

---

## Component Architecture

```
packages/my-work-feed/
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── vitest.config.ts
├── README.md
├── src/
│   ├── index.ts
│   ├── types/
│   │   ├── IMyWorkItem.ts
│   │   ├── IMyWorkQuery.ts
│   │   ├── IMyWorkRegistry.ts
│   │   └── index.ts
│   ├── constants/
│   │   ├── priorityThresholds.ts
│   │   ├── dedupeRules.ts
│   │   ├── panelDefaults.ts
│   │   └── index.ts
│   ├── registry/
│   │   ├── MyWorkRegistry.ts                # singleton adapter registry
│   │   ├── registerBuiltInAdapters.ts       # BIC / handoff / notification / acknowledgment
│   │   └── index.ts
│   ├── normalization/
│   │   ├── normalizeWorkItem.ts             # canonical item mapping
│   │   ├── rankWorkItems.ts                 # presentation-priority engine
│   │   ├── buildRankingReason.ts            # why this item surfaced / why it is ranked
│   │   ├── dedupeWorkItems.ts               # same signal from multiple sources
│   │   ├── applySupersession.ts             # older items hidden/referenced by newer ones
│   │   ├── buildLifecyclePreview.ts         # previous/next/dependency context
│   │   └── index.ts
│   ├── adapters/
│   │   ├── bicAdapter.ts
│   │   ├── handoffAdapter.ts
│   │   ├── acknowledgmentAdapter.ts
│   │   ├── notificationAdapter.ts
│   │   ├── draftResumeAdapter.ts
│   │   └── index.ts
│   ├── api/
│   │   ├── MyWorkApi.ts                     # list, markRead, defer, undefer, bulkAct
│   │   ├── MyWorkPreferencesApi.ts          # grouping, panel defaults, saved surface prefs
│   │   ├── MyWorkTeamApi.ts                 # team/delegation/escalation queries
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useMyWork.ts
│   │   ├── useMyWorkCounts.ts
│   │   ├── useMyWorkPanel.ts
│   │   ├── useMyWorkActions.ts
│   │   ├── useMyWorkReasoning.ts
│   │   ├── useMyWorkTeamFeed.ts
│   │   ├── useMyWorkOfflineState.ts
│   │   └── index.ts
│   ├── store/
│   │   ├── myWorkUiStore.ts                 # ephemeral UI state only (panel open, grouping)
│   │   └── index.ts
│   ├── components/
│   │   ├── HbcMyWorkLauncher.tsx
│   │   ├── HbcMyWorkBadge.tsx
│   │   ├── HbcMyWorkTile.tsx
│   │   ├── HbcMyWorkPanel.tsx
│   │   ├── HbcMyWorkFeed.tsx
│   │   ├── HbcMyWorkTeamFeed.tsx
│   │   ├── HbcMyWorkListItem.tsx
│   │   ├── HbcMyWorkReasonDrawer.tsx
│   │   ├── HbcMyWorkPlanningBar.tsx
│   │   ├── HbcMyWorkSourceHealth.tsx
│   │   ├── HbcMyWorkEmptyState.tsx
│   │   ├── HbcMyWorkOfflineBanner.tsx
│   │   └── index.ts
│   └── telemetry/
│       ├── myWorkEvents.ts                  # open, act, defer, complete, restore, dedupe
│       ├── myWorkMetrics.ts                 # time-to-action, queue age, suppressions, trust signals
│       └── index.ts
└── testing/
    ├── index.ts
    ├── createMockMyWorkItem.ts
    ├── createMockMyWorkFeed.ts
    ├── createMockMyWorkRuntimeContext.ts
    ├── createMockMyWorkAdapter.ts
    ├── createMockMyWorkTeamScenario.ts
    └── mockMyWorkScenarios.ts
```

---

## Component Specifications

### `HbcMyWorkLauncher` — Standard Entry Surface

```typescript
interface HbcMyWorkLauncherProps {
  nowCount: number;
  unreadCount?: number;
  onOpenPanel: () => void;
  onOpenFullFeed?: () => void;
}
```

**Visual behavior:**
- appears in a standardized shell location
- shows urgent count first, unread count second
- opens the side panel by default; exposes a route to the full feed
- is available in both shell and mobile navigation variants

### `HbcMyWorkTile` — Project Canvas Compact Surface

```typescript
interface HbcMyWorkTileProps {
  projectId?: string;
  limit?: number;
  showCounts?: boolean;
  onOpenFullFeed?: () => void;
}
```

**Visual behavior:**
- optimized for compact command-center display
- shows grouped counts and the top urgent items
- respects `@hbc/complexity` tiers
- never redefines prioritization logic; it projects the canonical feed contract into a smaller surface

### `HbcMyWorkPanel` — Quick Triage Surface

```typescript
interface HbcMyWorkPanelProps {
  projectId?: string;
  defaultGroupBy?: 'priority' | 'project' | 'module';
  limitPerGroup?: number;
  includeReasonDrawer?: boolean;
}
```

**Visual behavior:**
- acts as the user’s fast inbox / “My Items” panel
- supports inline mark-read, defer, and open-item actions
- keeps scrolling vertical only and avoids horizontal table complexity
- surfaces enough detail to decide, but not full expert controls by default

### `HbcMyWorkFeed` — Full Queue Workspace

```typescript
interface HbcMyWorkFeedProps {
  projectId?: string;
  allowSavedViews?: boolean;
  allowBulkActions?: boolean;
  defaultGroupBy?: 'priority' | 'project' | 'module' | 'owner';
}
```

**Visual behavior:**
- is the dedicated queue-management surface
- supports grouping, filtering, search, sorting, saved views, and future bulk actions
- shows blocked reason, supersession lineage, and related context in Standard/Expert tiers
- is the canonical desktop experience for users with high task volume

### `HbcMyWorkListItem` — Canonical Item Renderer

This component is the single renderer used across tile, panel, and full feed. It receives the same normalized item contract and varies only its disclosure level.

It should display:
- module/source badge
- project or project code
- concise action title
- due / overdue state
- expected action text
- blocked reason when relevant
- concise why-this-matters / why-this-is-here summary
- primary CTA and eligible inline micro-actions
- unread/new signal when applicable
- field location label when available

### `HbcMyWorkTeamFeed` — Delegation, Aging & Escalation Surface

```typescript
interface HbcMyWorkTeamFeedProps {
  ownerScope?: 'delegated-by-me' | 'my-team';
  groupBy?: 'owner' | 'priority' | 'project' | 'module';
  showEscalationCandidates?: boolean;
}
```

**Visual behavior:**
- gives PM, PX, and executive users one oversight surface for delegated, aging, and blocked work
- never redefines item truth; it projects canonical work items through a manager-oriented grouping model
- supports escalation and coaching workflows without requiring a separate “team queue” implementation

### `HbcMyWorkReasonDrawer` — Why / Why Not / What Next Surface

Shows:
- why the item surfaced
- why it is ranked in its current lane
- what changed since the user last viewed it
- whether the user can act, and if not, why not
- what dependency, workflow step, or record is affected next

This is one of the most important trust-building surfaces in the package.

### `HbcMyWorkPlanningBar` — Personal Orchestration Controls

Shows lightweight planning controls for:
- pin to Today
- pin to This Week
- snooze until date / time / event
- mark waiting on someone else
- add personal note

These are intentionally lighter than project scheduling tools. Their purpose is to reduce personal workflow friction without sending the user to an external task system.

### `HbcMyWorkOfflineBanner` — Degraded Continuity Indicator

Shows:
- offline / degraded state
- last successful sync timestamp
- pending local actions queued for replay
- explicit messaging when the visible queue is cached rather than live

This surface keeps trust high when the user is mobile or disconnected.

---

## Work-Item Normalization & Source Adapter Registry

A unified feed only works if the platform solves normalization deliberately.

### Governing Rules

1. **Every source registers through a registry, not ad hoc imports.**
2. **Every adapter returns normalized items, not source-native payloads.**
3. **Ownership is normalized as `user | role | company | system`.**
4. **Every item carries source metadata for auditability and dedupe tracing.**
5. **Every surface consumes the same normalized item type.**
6. **Every item exposes an explanation contract for ranking, permissions, and lifecycle context.**
7. **Deduplication must preserve traceability; supersession must preserve visibility.**

### Why this matters

Construction systems do not model ownership the same way.

- Procore’s “My Open Items” centers around open items requiring action by the current user.
- Primavera Cloud combines tasks, hand-offs, constraints, and customizable views, including assignment by user and company.
- Autodesk Construction Cloud task APIs support assignment by **user, company, or role**, which means My Work cannot assume every source resolves to a single user-only assignment model.

The registry pattern should therefore be explicit and package-owned.

### Adapter Responsibilities

Each adapter must:
- identify whether the current runtime context should load that source
- load source records through repositories or package APIs
- map source-specific assignment models into canonical ownership
- declare source urgency and update timestamps
- emit enough metadata to support dedupe and supersession
- emit ranking explanation inputs and permission clarity where available
- emit lifecycle/dependency hints when the source can provide them
- avoid returning terminal or irrelevant items

### Built-In Adapters in Phase 1

- `bicAdapter`
- `handoffAdapter`
- `acknowledgmentAdapter`
- `notificationAdapter`
- `draftResumeAdapter` (for resumable local work from `@hbc/session-state`)

---

## Priority Ranking, Deduplication & Supersession Discipline

A flat merged list is not sufficient. This package must implement a queue engine.

### Ranking Inputs

Presentation priority should be computed from:

- overdue state
- days-to-due threshold
- BIC urgency / ownership state
- blocked status
- inbound-handoff state
- unacknowledged approval state
- unread freshness
- project context weighting
- source ranking weight
- offline capability of the next action

### Deduplication Rules

The package should collapse overlapping source signals into a single canonical work item when they refer to the same actionable thing.

Examples:
- a BIC transfer and a matching Immediate notification should usually present as one item, not two
- a handoff receipt and a pending acknowledgment generated from the same workflow transition should usually present as one item with multiple source traces
- a stale reminder notification should not outrank a newer direct ownership transfer for the same record

### Supersession Rules

Some items should be replaced rather than merged.

Examples:
- “Review PMP” is superseded by “PMP overdue — approval blocking turnover”
- “Draft available to resume” is superseded by a new live workflow task on the same record
- “Watch” signals are superseded when the user becomes the active owner

Superseded items should not disappear silently. They should remain traceable in history and expert diagnostics.

### Explainability Requirement

Every ranked item should surface a concise human-readable rationale such as:
- overdue approval blocking turnover
- handed to you and unacknowledged
- newer ownership transfer superseded earlier watch signal
- waiting on permit response from external reviewer

Users should never be forced to infer why the queue changed.

### Attention-Governance Rules

The package should coordinate with `@hbc/notification-intelligence` so that it reduces noise rather than amplifies it.

Required behaviors:
- batch related low-value signals
- suppress repeated alerts when no material change occurred
- escalate only when thresholds are met
- support quiet-hours-aware deferral where policy allows
- preserve visible rationale when duplicate signals are hidden

### Governance Requirement

All dedupe and supersession rules must be deterministic and documented. Users should not feel like work items randomly vanish.

---

## Offline / PWA Resilience Model

This package must be explicitly PWA-aware.

### Required Offline Behaviors

- cache the last successful feed snapshot locally
- show the cached queue when offline or degraded
- display last successful sync time
- allow safe local actions such as mark-read, defer, pin-to-today, waiting-on, and open cached context where possible
- queue replayable mutations for restoration when connectivity returns
- support a compact offline-safe Today Pack / top-urgent snapshot for field usage
- gracefully degrade when a work item requires server-only action

### Package-Level Responsibilities

- use TanStack Query for server-synchronized feed retrieval
- persist feed state through query persistence for resumable sessions
- rely on `@hbc/session-state` for offline-safe local queue entries and connectivity signaling
- support replay of deferred local mutations after reconnect
- expose explicit `isStale`, `lastRefreshedIso`, and `queuedActionCount` state to the UI

### Context-Specific Rules

- **Standalone PWA:** full offline cache and queued local actions
- **SPFx host context:** read-mostly cache and explicit refresh; do not assume service-worker-only capabilities are available
- **Mobile field surfaces:** prioritize compact payloads, top-N urgent items, one-thumb primary actions, and location-aware grouping to reduce load and improve perceived performance

---

## Multi-Surface Rendering Consistency

The package should deliberately separate **data contract**, **priority engine**, and **surface projection**.

### Non-Negotiable Rules

- the panel, tile, badge, and full feed all consume the same normalized item type
- grouping and filtering rules are shared, not reimplemented by each surface
- the badge never uses a different counting rule than the panel or full feed
- shell-level “My Items” and project-canvas “My Work” should feel like views into the same system
- mobile and desktop differ in density, not in source truth
- field mode can change grouping and disclosure defaults, but not item truth or count semantics

### Recommended Projection Strategy

- **Badge projection:** urgent count, unread count
- **Tile projection:** top urgent items + grouped counts
- **Panel projection:** compact grouped queue
- **Full feed projection:** complete queue with advanced controls, explainability, and lifecycle preview
- **Team feed projection:** delegated / aging / escalation slices over the same canonical queue model

This keeps the UX coherent while allowing each surface to remain fit for purpose.

---

## Package Setup, State Management & Testing Expectations

The current repo package set already establishes the right precedent for this package.

### Scaffold Requirements

The package should be created as a first-class workspace package under `packages/my-work-feed/` with:

- `package.json`
- `tsconfig.json`
- `tsconfig.build.json`
- `vitest.config.ts`
- `README.md`
- public barrel exports
- `./testing` sub-path export

### Dependency Rules

`@hbc/my-work-feed` should depend only on platform primitives and shared infrastructure, not on domain packages directly.

**Expected dependencies:**
- `@hbc/ui-kit`
- `@hbc/shell`
- `@hbc/auth`
- `@hbc/models`
- `@hbc/data-access`
- `@hbc/query-hooks`
- `@hbc/session-state`
- `@hbc/bic-next-move`
- `@hbc/workflow-handoff`
- `@hbc/acknowledgment`
- `@hbc/notification-intelligence`
- `@hbc/complexity`

### State Management Rules

- **TanStack Query** owns remote feed retrieval, refresh cadence, and cache freshness
- **package-local UI store** owns panel open state, grouping choice, and transient display state only
- **session-state / IndexedDB** owns offline persistence and queued local action replay
- **do not** conflate work-item truth with shell-only presentation state

### Testing Strategy

The package should follow a four-layer test model:

1. **Unit tests**
   - ranking engine
   - dedupe rules
   - supersession rules
   - adapter normalization
   - count semantics

2. **Hook / integration tests**
   - `useMyWork`
   - ranking/explainability consistency
   - offline snapshot fallback
   - replay of queued local actions
   - panel/full-feed consistency
   - personal vs team queue projections

3. **Component tests in real browser mode**
   - `HbcMyWorkPanel`
   - `HbcMyWorkTile`
   - `HbcMyWorkFeed`
   - `HbcMyWorkReasonDrawer`
   - keyboard / focus / disclosure behavior
   - field-mode hit targets and disclosure defaults

4. **E2E tests**
   - urgent item appears in badge, panel, and full feed consistently
   - deduped item renders once with merged source traces
   - inline approval / acknowledge action completes without module-hopping where supported
   - offline cached feed appears with last-sync indicator
   - reconnect resumes queued mutations and refreshes the feed
   - manager view shows aging delegated item without breaking personal queue truth

### Testing Export

The `./testing` sub-path should include:
- mock work item factory
- mock feed factory
- mock adapter factory
- scenario fixtures for overdue, blocked, deduped, superseded, offline, delegated, and field-mode states

---

## Governance, Auditability & Operational Readiness

A personal work feed becomes untrustworthy if users cannot explain where items came from or why they changed.

### Audit Expectations

The package should emit auditable events for:
- feed item opened
- mark-read
- defer / undefer
- bulk clear
- action invoked from My Work
- dedupe merge applied
- supersession applied
- offline action queued
- queued action replayed

### Audit-Friendly Data Requirements

Each item should preserve:
- source item IDs
- source event types where applicable
- canonical key / dedupe key
- creation / update timestamps
- owner identity
- project / record context
- ranking rationale summary
- permission / cannot-act reason where relevant
- supersession linkage

### Queue Health & Trust Requirements

The package should expose operational trust indicators such as:
- live vs cached vs partial freshness state
- degraded source count
- hidden superseded count
- queued local action count
- warning when the visible queue is derived from partial source success

### Operational Readiness Rules

- the package must fail soft when one source adapter errors
- adapter errors must be isolated and surfaced diagnostically in Expert mode
- count surfaces must continue to render from partial success where safe
- urgent items must never disappear because a non-critical source failed
- dedupe and supersession logic must be test-covered and documented
- explainability, permission clarity, and queue-health signals must remain available even when the feed is partially degraded
- the package should emit measurable product-health metrics such as time-to-first-action, suppressed-duplicate rate, stale-item age, and inline-action completion rate

---

## Integration Points

| Package | Integration |
|---|---|
| `@hbc/bic-next-move` | primary ownership / next-move feed source; highest-value actionable signals |
| `@hbc/workflow-handoff` | inbound handoff items and acknowledgment-required transitions |
| `@hbc/acknowledgment` | sign-off / receipt tasks surfaced as actionable work |
| `@hbc/notification-intelligence` | attention signals and urgency source metadata |
| `@hbc/session-state` | offline cache coordination, connectivity state, queued local actions |
| `@hbc/project-canvas` | compact `HbcMyWorkTile` and role-aware default tile placement |
| `@hbc/shell` | launcher, panel host, badge, global entrypoint wiring |
| `@hbc/ui-kit` | list rows, badges, cards, empty states, banners, queue controls |
| `@hbc/query-hooks` | shared query infrastructure and repository integration |
| `@hbc/data-access` | source repositories and future server-side aggregation endpoints |
| `@hbc/complexity` | disclosure-level control across tile, panel, and full feed |
| `@hbc/related-items` | contextual cross-links from active work items |
| `@hbc/saved-views` | reusable full-feed and team-feed queue configurations |
| `@hbc/bulk-actions` | high-volume queue clearing, reassignment, and batched action execution |
| `@hbc/activity-timeline` | what changed / when / by whom context inside item drill-downs |

---

## Expected Consumers

- Business Development: scorecard approvals, department reviews, handoffs
- Estimating: kickoff coordination, post-bid autopsy follow-up, bid-readiness actions
- Project Hub: PMP approvals, startup checklist items, turnover receipts, constraints
- Executive / Ops: compact urgent-action feed in Project Canvas and shell surfaces
- PM / PX managers: delegated work, aging queue review, and escalation candidates
- Field / PWA users: mobile condensed queue, location-aware triage, and resumable local work
- Future platform features: shared saved views, bulk actions, and activity timeline integration

---

## Priority & ROI

**Priority:** P1 — should be implemented before personal-work UX diverges across modules

**Estimated build effort:** 5–6 sprint-weeks
- package scaffold and contracts
- registry and adapter model
- normalization / dedupe / supersession engine
- panel / tile / full feed surfaces
- offline-safe cache and queued mutation handling
- test harness and E2E coverage

**ROI:**
- prevents duplicate “my items” implementations
- creates a canonical answer to “what do I need to do now?”
- materially improves adoption for PM, PX, executive, and field workflows
- turns existing shared primitives into a coherent daily operating model
- reduces module-hopping through inline execution and better queue explainability
- improves trust because work becomes explainable, consistent, and audit-friendly
- differentiates HB Intel from incumbent construction platforms by making work lifecycle, accountability, and action routing visible in one place

---

## Definition of Done

- [ ] `packages/my-work-feed/` scaffolded as a standalone workspace package
- [ ] public exports and `./testing` sub-path configured
- [ ] normalized work-item contracts implemented
- [ ] registry singleton implemented for source adapters
- [ ] built-in adapters implemented for BIC, handoff, acknowledgment, notification, and resumable draft work
- [ ] ranking engine implemented with deterministic priority rules
- [ ] dedupe rules implemented and documented
- [ ] supersession rules implemented and documented
- [ ] `HbcMyWorkLauncher` implemented in shell
- [ ] `HbcMyWorkBadge` implemented with canonical count semantics
- [ ] `HbcMyWorkPanel` implemented for “My Items” side panel use
- [ ] `HbcMyWorkTile` implemented for Project Canvas consumption
- [ ] `HbcMyWorkFeed` implemented as full workspace surface
- [ ] `HbcMyWorkTeamFeed` implemented for delegated / aging / escalation views
- [ ] `HbcMyWorkReasonDrawer` implemented for why/why-not/what-next explainability
- [ ] planning controls implemented for Today / This Week / waiting-on / defer flows
- [ ] inline micro-actions implemented for supported actions without forced module-hop
- [ ] offline banner + last-sync behavior implemented
- [ ] cached feed fallback implemented for degraded connectivity
- [ ] field-mode / mobile disclosure defaults implemented
- [ ] queue-health and source-health trust indicators implemented
- [ ] queued local mutations supported where action types are safe to replay
- [ ] unit tests cover ranking, dedupe, supersession, explainability, and adapter normalization
- [ ] component tests cover tile/panel/full-feed consistency, team feed, reason drawer, and complexity disclosure
- [ ] E2E tests cover urgent-item flow, inline-action completion, offline cache, reconnect replay, and merged-source rendering
- [ ] README documents source-adapter contract, count semantics, explanation semantics, and surface-consistency rules
- [ ] ADR issued and cross-linked from the PH7 shared-feature index

---

## ADR Reference

Create `docs/architecture/adr/0038-my-work-feed.md` documenting:

- the decision to elevate My Work from a `@hbc/query-hooks` sub-feature into a dedicated shared package
- the adapter-registry architecture and normalized ownership model
- the requirement that all surfaces consume one canonical work-item contract
- the deterministic priority / dedupe / supersession model
- the offline-safe feed strategy using TanStack Query persistence plus `@hbc/session-state`
- the distinction between shell presentation state and work-item truth
- the explainability contract for ranking, permissions, lifecycle preview, and queue-health signals
- the manager/delegation projection model over the same canonical work-item contract
