# SF10 — `@hbc/notification-intelligence`: Priority-Tiered Smart Notification System

**Plan Version:** 1.0
**Date:** 2026-03-10
**Source Spec:** `docs/explanation/feature-decisions/PH7-SF-10-Shared-Feature-Notification-Intelligence.md`
**Priority Tier:** 1 — Foundation (every module's notification integration depends on this package)
**Estimated Effort:** 5–6 sprint-weeks
**ADR Required:** `docs/architecture/adr/0099-notification-intelligence-tiered-model.md`
**ADR Number:** ADR-0099
**Note:** Source spec referenced ADR-0019. Per CLAUDE.md §7, all numbers below ADR-0091 are taken. ADR-0092–0097 are assigned (acknowledgment, step-wizard, versioned-record, stub-detection, field-annotations, workflow-handoff); ADR-0098 reserved for SF09. The canonical locked ADR for this feature is ADR-0099 per current-state-map.md §2.2 (2026-03-10 validation).

> **Doc Classification:** Canonical Normative Plan — SF10 implementation master plan for `@hbc/notification-intelligence`; governs all task files SF10-T01 through SF10-T09.

---

## Purpose

`@hbc/notification-intelligence` solves the #1 documented pain point in construction management platforms: notification fatigue. Every major platform (Procore, Autodesk Build, Viewpoint) uses a flat broadcast model where all events trigger equal-weight alerts. The con-tech UX study §13 reports this as "overwhelming" by experienced users — most disable notifications entirely within weeks.

HB Intel's answer is **tiered adaptive intelligence**: every notification event is classified into one of three priority tiers by the platform (not by the user configuring 47 toggles), delivered through tier-appropriate channels, and adapted over time based on the user's actual response patterns.

This package is a platform-wide primitive: all other HB Intel modules — `@hbc/bic-next-move`, `@hbc/acknowledgment`, `@hbc/workflow-handoff`, `@hbc/field-annotations`, `@hbc/versioned-record`, `@hbc/data-seeding` — register their event types here and send notifications through this package's API. It is a dependency of the application layer; nothing else can send intelligent notifications until this package exists.

---

## Locked Interview Decisions

| # | Decision | Locked Choice |
|---|----------|--------------|
| D-01 | Storage backend | `HbcNotifications` SharePoint list for in-app items; Azure Functions event processor for tier computation + channel routing; Azure Notification Hubs for push delivery; SendGrid for email |
| D-02 | Three-tier model | `immediate \| watch \| digest`; Immediate tier is non-downgradable by user (may be snoozed only); Watch and Digest tiers are user-overridable per `INotificationRegistration.tierOverridable` flag |
| D-03 | Badge count semantics | `HbcNotificationBadge` shows Immediate-only unread count (not total); red badge when Immediate unread > 0; grey badge when Watch-only items are unread; no badge for Digest-only |
| D-04 | Banner behavior | `HbcNotificationBanner` is Immediate-tier only; auto-dismisses after 30 seconds; maximum 1 banner visible at a time; overflow managed by internal queue |
| D-05 | Registry singleton pattern | All packages register event types via `NotificationRegistry.register([])` at package initialization time; registry is a module singleton; registration is additive (no deregistration) |
| D-06 | Digest schedule | Azure Timer Function; per-user `INotificationPreferences.digestDay` (0=Sun) and `digestHour` (0-23); default: Sunday at 08:00 |
| D-07 | SPFx constraints | Push notifications require PWA service worker — unavailable in SPFx context; SPFx users receive email + in-app only; `HbcNotificationBadge` and `HbcNotificationCenter` are SPFx-compatible via Application Customizer |
| D-08 | Complexity rendering | `HbcNotificationPreferences` rendered in Expert mode only; `HbcNotificationBadge` and `HbcNotificationCenter` rendered in all tiers (Standard/Expert); `HbcNotificationBanner` rendered in Immediate tier and Standard/Expert modes |
| D-09 | Adaptive tier (Phase 1 static) | Phase 1 uses static default tiers per `INotificationRegistration.defaultTier`; adaptive downshift algorithm (tracking user ignore patterns) is deferred to Phase 2 — architecture must support it but Phase 1 does not implement it |
| D-10 | Testing sub-path | `@hbc/notification-intelligence/testing` exports: `createMockNotification`, `createMockNotificationPreferences`, `createMockNotificationRegistration`, `mockNotificationTiers`, `mockNotificationChannels`; excluded from production bundle |

---

## Package Directory Structure

```
packages/notification-intelligence/
├── package.json                              # @hbc/notification-intelligence; dual ./ and ./testing exports
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts                              # Public barrel export
│   ├── types/
│   │   ├── INotification.ts                  # All interfaces, NotificationTier, NotificationChannel
│   │   └── index.ts
│   ├── registry/
│   │   ├── NotificationRegistry.ts           # Singleton; all modules register event types here
│   │   └── index.ts
│   ├── api/
│   │   ├── NotificationApi.ts               # send, read, dismiss, list, getCenter
│   │   ├── PreferencesApi.ts                # getPreferences, updatePreferences
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useNotificationCenter.ts          # Paginated in-app notification center items
│   │   ├── useNotificationPreferences.ts     # Get/update user preferences
│   │   ├── useNotificationBadge.ts           # Immediate unread count + real-time polling
│   │   └── index.ts
│   └── components/
│       ├── HbcNotificationCenter.tsx         # Full panel: tab bar (All/Immediate/Watch/Digest)
│       ├── HbcNotificationBadge.tsx          # Header bell icon with Immediate unread count
│       ├── HbcNotificationBanner.tsx         # Immediate-tier in-page dismissible alert
│       ├── HbcNotificationPreferences.tsx    # Event type list + tier overrides + digest settings
│       └── index.ts
└── testing/
    ├── index.ts                              # D-10: testing sub-path barrel
    ├── createMockNotification.ts
    ├── createMockNotificationPreferences.ts
    ├── createMockNotificationRegistration.ts
    ├── mockNotificationTiers.ts
    └── mockNotificationChannels.ts
```

---

## Integration Points

| Package | Notification Events Registered |
|---------|-------------------------------|
| `@hbc/bic-next-move` | `bic.transfer` (Immediate, non-overridable), `bic.overdue` (Immediate, non-overridable), `bic.escalated` (Immediate) |
| `@hbc/acknowledgment` | `ack.request` (Immediate, non-overridable), `ack.completed` (Watch) |
| `@hbc/workflow-handoff` | `handoff.sent` (Immediate to recipient), `handoff.acknowledged` (Watch to sender), `handoff.rejected` (Immediate to sender) |
| `@hbc/field-annotations` | `annotation.created` (Immediate to assignee), `annotation.resolved` (Watch) |
| `@hbc/versioned-record` | `version.created` (Digest, overridable) |
| `@hbc/data-seeding` | `import.completed` (Digest), `import.failed` (Watch) |
| `@hbc/sharepoint-docs` | `upload.failed` (Watch), `migration.completed` (Digest) |

---

## Task Index

| Task | File | Description | Effort |
|------|------|-------------|--------|
| T01 | `SF10-T01-Package-Scaffold.md` | `package.json`, `tsconfig.json`, `vitest.config.ts`, barrel stubs | 0.25 sw |
| T02 | `SF10-T02-TypeScript-Contracts.md` | `INotification.ts` — all interfaces, `NotificationTier`, `NotificationChannel` | 0.25 sw |
| T03 | `SF10-T03-Notification-Registry.md` | `NotificationRegistry` singleton; `register()`, `getAll()`, `getByEventType()` | 0.5 sw |
| T04 | `SF10-T04-API-Layer.md` | `NotificationApi` (send, read, dismiss, list); `PreferencesApi` (get, update) | 0.75 sw |
| T05 | `SF10-T05-React-Hooks.md` | `useNotificationCenter`, `useNotificationBadge`, `useNotificationPreferences` | 0.5 sw |
| T06 | `SF10-T06-Core-Components.md` | `HbcNotificationCenter` (tab panel); `HbcNotificationBadge` (header bell) | 0.75 sw |
| T07 | `SF10-T07-Interaction-Components.md` | `HbcNotificationBanner` (Immediate alert); `HbcNotificationPreferences` (settings panel) | 0.75 sw |
| T08 | `SF10-T08-Azure-Functions-Backend.md` | Event processor, push (Azure Notification Hubs), email (SendGrid), digest scheduler | 1.0 sw |
| T09 | `SF10-T09-Deployment.md` | Testing sub-path, unit/E2E tests, ADR-0099, README, adoption guide, API reference, mechanical gates | 0.75 sw |

**Recommended implementation order:** T01 → T02 → T03 → T04 → T05 → T06 → T07 → T08 → T09

T02 must precede all others (types). T03 must precede T04 (registry before API). T05 depends on T04 (hooks consume API). T06–T07 depend on T05 (components use hooks). T08 is backend and can proceed in parallel after T02. T09 must be last.

---

## Acceptance Criteria (Definition of Done)

- [ ] `INotificationRegistration` registry defined; all packages can register event types
- [ ] `NotificationRegistry.register()` available at package initialization
- [ ] `NotificationApi.send()` routes to Azure Functions queue processor
- [ ] Azure Functions: tier computation, preference lookup, channel routing
- [ ] Push delivery via Azure Notification Hubs (PWA service worker integration)
- [ ] Email delivery via SendGrid (Immediate + Watch daily summary + Digest weekly)
- [ ] In-app storage: `HbcNotifications` SharePoint list
- [ ] `useNotificationCenter` loads paginated notifications with tier filtering
- [ ] `useNotificationBadge` returns Immediate unread count with real-time update
- [ ] `useNotificationPreferences` gets/sets user preferences
- [ ] `HbcNotificationCenter` renders all tiers with tab filtering
- [ ] `HbcNotificationBadge` renders in app header with correct unread count
- [ ] `HbcNotificationBanner` renders Immediate-tier banners with queue management (max 1, auto-dismiss 30s)
- [ ] `HbcNotificationPreferences` renders event type list with tier overrides (Expert mode)
- [ ] `@hbc/complexity` integration: full preferences in Expert, badge+center in Standard/Expert, banner in Immediate tier
- [ ] SPFx constraint respected: push channel excluded from SPFx context (D-07)
- [ ] Unit tests ≥95% on tier computation and delivery routing logic
- [ ] E2E test: BIC transfer event → Immediate notification → in-app center shows item
- [ ] All four mechanical enforcement gates pass

---

## Blueprint Progress Comment

After all acceptance criteria are met, add this comment block to `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md`:

```markdown
<!-- IMPLEMENTATION PROGRESS & NOTES
SF10 completed: {DATE}
@hbc/notification-intelligence — priority-tiered smart notification system.
Three-tier model (Immediate/Watch/Digest); NotificationRegistry singleton; Azure Functions event processor.
Push: Azure Notification Hubs (PWA). Email: SendGrid. In-app: HbcNotifications SharePoint list.
Four components: HbcNotificationCenter, HbcNotificationBadge, HbcNotificationBanner, HbcNotificationPreferences.
Three hooks: useNotificationCenter, useNotificationBadge, useNotificationPreferences.
ADR created: docs/architecture/adr/0096-notification-intelligence-tiered-model.md
All four mechanical enforcement gates passed.
Next: platform modules register their event types; SF10 enables module-level notification integration.
-->
```

---

<!-- IMPLEMENTATION PROGRESS & NOTES
SF10 authored: 2026-03-10
ADR corrected to ADR-0099 (initial plan used ADR-0096, which conflicts with field-annotations; corrected during current-state-map validation 2026-03-10).
SF10-T01 completed: 2026-03-10 — Package scaffold (27 files), dual entry points, all barrel stubs compile-safe.
SF10-T02 completed: 2026-03-10 — Full TypeScript contracts (INotificationEvent, INotificationRegistration, INotificationPreferences, NotificationSendPayload, INotificationCenterResult, INotificationCenterFilter). All T01 stubs updated for compile safety.
SF10-T03 completed: 2026-03-10 — NotificationRegistry singleton (register/getAll/getByEventType/getByModule/size/_clearForTesting). 10 unit tests passing. ADR ref corrected to ADR-0099.
SF10-T04 completed: 2026-03-10 — NotificationApi (send/getCenter/markRead/markAllRead/dismiss) + PreferencesApi (getPreferences/updatePreferences). 9 API tests + 10 registry tests = 19 passing. ADR ref ADR-0099.
SF10-T05 completed: 2026-03-10 — React hooks (useNotificationCenter with useInfiniteQuery + 3 mutations, useNotificationBadge with 60s polling, useNotificationPreferences with optimistic update/rollback). Query key factory (notificationKeys). All 19 existing tests pass; check-types zero errors; build zero errors.
SF10-T06 completed: 2026-03-10 — Core components (HbcNotificationBadge with Notifications icon + Immediate unread badge; HbcNotificationCenter with tier tab bar, notification cards, mark-read/dismiss/mark-all-read, load-more pagination). Icon adapted: Notifications replaces BellIcon, size="md" replaces size={20}. 21 new component tests (9 badge + 12 center). @testing-library/jest-dom added. @hbc/ui-kit/icons alias added to vitest config. All 40 tests pass; check-types zero errors; build zero errors.
SF10-T07 completed: 2026-03-10 — Interaction components (HbcNotificationBanner with 30s auto-dismiss D-04, ARIA role="alert"; HbcNotificationPreferences Expert-only panel with registry-driven tier overrides, digest schedule, push toggle D-05/D-06/D-07/D-08). 26 new tests (11 banner + 15 preferences). All 66 tests pass; check-types zero errors; build zero errors.
Status: T07 done — ready for T08 implementation (Azure Functions Backend).
SF10-T08 completed: 2026-03-10 — Azure Functions backend: 10 notification functions (SendNotification HTTP POST, GetCenter HTTP GET, MarkRead/Dismiss HTTP PATCH, MarkAllRead HTTP POST, GetPreferences HTTP GET, UpdatePreferences HTTP PATCH, ProcessNotification queue trigger, SendNotificationEmail queue trigger, SendDigestEmail timer trigger) + 6 lib helpers (tierResolver, channelRouter, notificationStore, preferencesStore, pushDelivery stub, emailDelivery stub). SDK-adapted from plan code using output.storageQueue() bindings. All auth via validateToken (D-PH6-03). Push/email adapters are Phase 1 stubs. check-types zero errors; build zero errors.
Pending: PH7.12 sign-off (ADR-0090) before feature-expansion phases begin.
Next: SF10-T09 (Testing Strategy and Deployment)
-->
