# @hbc/pwa

Progressive Web App surface for HB Intel. Serves as the primary browser-based experience with offline support, MSAL authentication, and the Personal Work Hub.

## Purpose

The PWA is the full-capability HB Intel surface for desktop and tablet users. It hosts workspace routes (project-hub, accounting, estimating, etc.), the `/my-work` Personal Work Hub, and administrative surfaces. Authentication is dual-mode: MSAL for production, mock for development.

## Key Routes

| Route | Type | Component |
|-------|------|-----------|
| `/my-work` | Workspace | Personal Work Hub (Phase 2) |
| `/project-hub` | Workspace | Project portfolio overview |
| `/admin` | Workspace | System administration (Administrator only) |
| `/project-setup` | Non-workspace | Project setup wizard |
| `/projects` | Non-workspace | Request status list |
| `/provisioning/$projectId` | Non-workspace | Provisioning detail |

## Personal Work Hub Architecture

The `/my-work` route implements the Phase 2 Personal Work Hub with a three-zone adaptive layout per P2-D2:

```
pages/my-work/
  MyWorkPage.tsx             — Page orchestrator (zone layout + persistence + connectivity)
  HubZoneLayout.tsx          — 12-column CSS Grid with primary/secondary/tertiary zones
  HubPrimaryZone.tsx         — Protected task runway (HbcMyWorkFeed, not canvas-governed)
  HubSecondaryZone.tsx       — Analytics/oversight cards (role-aware, complexity-gated)
  HubTertiaryZone.tsx        — Quick actions/recent context (complexity-gated)
  HubPageLevelEmptyState.tsx — Loading-failed/permission-empty guard (never redirects on empty queue)
  HubTeamModeSelector.tsx    — Team mode toggle (personal/delegated-by-me/my-team)
  HubFreshnessIndicator.tsx  — Trust-state freshness timestamp + HbcStatusBadge
  HubConnectivityBanner.tsx  — Degraded/offline HbcBanner display
  hubStateTypes.ts           — Draft persistence contracts (query-seed, return state, card arrangement)
  trustStateConstants.ts     — Freshness window threshold (5 min)
  formatRelativeTime.ts      — P2-B3 §6.2 relative time formatter
  useHubStatePersistence.ts  — Query-seed + return-state draft hooks
  useHubReturnMemory.ts      — Scroll restore + feed refresh on return
  useHubFeedRefresh.ts       — TanStack Query invalidation on return
  useHubTrustState.ts        — Freshness/connectivity state derivation
  useHubPersonalization.ts   — Team mode + card arrangement draft persistence
  cards/
    PersonalAnalyticsCard.tsx  — KPI metrics from useMyWorkCounts() (all roles)
    TeamPortfolioCard.tsx      — Team feed counts (Executive only)
    AgingBlockedCard.tsx       — Escalation candidates (Executive only)
    AdminOversightCard.tsx     — System metrics (Administrator only)
    QuickActionsCard.tsx       — Action shortcuts (all roles)
    RecentContextCard.tsx      — Recent context links (all roles)
```

### Zone Rules

- **Primary zone**: Always visible, renders `HbcMyWorkFeed`. MUST NOT be wrapped in `HbcProjectCanvas` or support EditMode.
- **Secondary/Tertiary zones**: Hidden at `essential` complexity tier. Use 12-column grid matching `CANVAS_GRID_COLUMNS` for future canvas migration.
- **Responsive**: Desktop (12-col) → Tablet (6-col) → Mobile (1-col) per `HBC_BREAKPOINT_TABLET`/`HBC_BREAKPOINT_MOBILE`.

## Source Assembly Bootstrap

`src/sources/sourceAssembly.ts` centralizes all hub source registration, called once from `main.tsx` during bootstrap:

1. **BIC module registrations** — 5 sources registered via `registerBicModule()` from `@hbc/bic-next-move`
2. **Notification registrations** — 28 event types registered via `NotificationRegistry.register()` from `@hbc/notification-intelligence`
3. **MyWork adapter assembly** — 4 adapters registered via `MyWorkRegistry.register()`: BIC (0.9), handoff (0.8), acknowledgment (0.7), notification (0.5)

Domain queryFns are in `src/sources/domainQueryFns.ts` — currently mock data seams for development, replaceable with real domain API clients.

## Dependencies

### Workspace Packages

| Package | Purpose |
|---------|---------|
| `@hbc/models` | Domain types |
| `@hbc/auth` | Authentication, roles, permissions, feature flags |
| `@hbc/shell` | Shell orchestration, landing resolver, cohort gate |
| `@hbc/ui-kit` | Design system components |
| `@hbc/complexity` | Complexity tier system |
| `@hbc/session-state` | Offline persistence, connectivity, draft storage |
| `@hbc/smart-empty-state` | Classification-based empty states |
| `@hbc/my-work-feed` | Feed aggregation, adapters, components |
| `@hbc/bic-next-move` | BIC module registration |
| `@hbc/notification-intelligence` | Notification registry |
| `@hbc/provisioning` | Provisioning BIC + notification registrations |
| `@hbc/features-estimating` | Estimating BIC + notification registrations |
| `@hbc/features-business-development` | BD Score + Strategic Intelligence registrations |
| `@hbc/features-project-hub` | Health Pulse BIC + notification registrations |
| `@hbc/query-hooks` | TanStack Query defaults |
| `@hbc/data-access` | Data access layer |
| `@hbc/step-wizard` | Multi-step wizard framework |

## Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start dev server on port 4000 |
| `pnpm build` | Type-check + Vite production build |
| `pnpm preview` | Preview production build on port 4000 |
| `pnpm lint` | ESLint check |
| `pnpm test` | Vitest run |

## Related Documentation

- Landing resolver: `packages/shell/README.md` § Landing Resolver
- Cohort gate: `packages/shell/README.md` § Cohort Gate
- Phase 2 plan: `docs/architecture/plans/MASTER/03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md`
- Readiness register: `docs/architecture/plans/MASTER/phase-2-deliverables/P2-C5-Pilot-Publication-and-Rollout-Readiness-Register.md`
