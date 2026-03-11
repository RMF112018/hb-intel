# ADR-0099 — Notification Intelligence Tiered Model

**Status:** Accepted
**Date:** 2026-03-10
**Deciders:** HB Intel Architecture Team
**Supersedes:** None
**Note:** Source spec (PH7-SF-10) referenced ADR-0019 and ADR-0096 in some plan files. Per CLAUDE.md §7, all numbers below ADR-0091 are taken. ADR-0092–0098 are assigned (acknowledgment, step-wizard, versioned-record, stub-detection, field-annotations, workflow-handoff, data-seeding). The canonical ADR for SF-10 Notification Intelligence is ADR-0099 per current-state-map.md §2.2 (2026-03-10 validation).

## Context

Construction management platforms uniformly suffer from notification fatigue. Every major competitor (Procore, Autodesk Build, Viewpoint) uses a flat broadcast model where all events trigger equal-weight alerts. User research (con-tech UX study §13) confirms that experienced users disable notifications entirely within weeks — eliminating the platform's ability to surface time-critical information. `@hbc/notification-intelligence` solves this by classifying every notification into one of three priority tiers, routing through tier-appropriate channels, and providing user-overridable preferences that respect platform constraints.

## Decisions

### D-01 — Azure Functions Backend + SharePoint In-App Store
`HbcNotifications` SharePoint list stores in-app notification items. Azure Functions event processor handles tier computation and channel routing. Azure Notification Hubs for push delivery. SendGrid for email.

### D-02 — Three-Tier Priority Model
Three tiers: `immediate | watch | digest`. Immediate tier is non-downgradable by user (may only be snoozed). Watch and Digest tiers are user-overridable per `INotificationRegistration.tierOverridable` flag. Visual conventions: Immediate = red left border, Watch = amber, Digest = grey.

### D-03 — Badge Count: Immediate-Only
`HbcNotificationBadge` shows Immediate-only unread count (not total). Red badge when Immediate unread > 0. Grey badge when Watch-only items are unread. No badge for Digest-only. Polls every 60 seconds with background pause.

### D-04 — Banner: Immediate-Only with Auto-Dismiss
`HbcNotificationBanner` renders Immediate-tier notifications only. Auto-dismisses after 30 seconds if not interacted with. Maximum 1 banner visible at a time; overflow managed by internal queue. Clicking action CTA or dismiss button cancels auto-dismiss timer.

### D-05 — Registry Singleton Pattern (Additive-Only)
All packages register event types via `NotificationRegistry.register([])` at package initialization time. Registry is a module singleton. Registration is additive — no deregistration method exists. Throws on duplicate eventType or invalid tier.

### D-06 — Digest Schedule Configuration
Azure Timer Function processes digest batches. Per-user `INotificationPreferences.digestDay` (0=Sunday) and `digestHour` (0-23). Default: Sunday at 08:00.

### D-07 — SPFx Constraints
Push notifications require PWA service worker — unavailable in SPFx context. SPFx users receive email + in-app only. Push toggle hidden when `_spPageContextInfo` is detected. `HbcNotificationBadge` and `HbcNotificationCenter` are SPFx-compatible via Application Customizer.

### D-08 — Complexity-Aware Rendering
`HbcNotificationPreferences` rendered in Expert mode only. `HbcNotificationBadge` and `HbcNotificationCenter` rendered in Standard and Expert modes. `HbcNotificationBanner` rendered in Standard and Expert modes. All components return `null` in Essential mode.

### D-09 — Adaptive Tier (Phase 1 Static)
Phase 1 uses static default tiers per `INotificationRegistration.defaultTier`. Adaptive downshift algorithm (tracking user ignore patterns) is deferred to Phase 2. Architecture supports future adaptation but Phase 1 does not implement it.

### D-10 — Testing Sub-Path
`@hbc/notification-intelligence/testing` exports 5 canonical fixtures: `createMockNotification`, `createMockNotificationPreferences`, `createMockNotificationRegistration`, `mockNotificationTiers`, `mockNotificationChannels`. Excluded from production bundle.

## Consequences

- All consuming modules must call `NotificationRegistry.register()` at initialization to enable notification sending.
- `NotificationApi.send()` validates eventType against registry — unregistered events throw.
- SPFx surfaces receive a subset of notification features (no push toggle, no banner in Essential).
- Digest scheduling requires the Azure Timer Function (`SendDigestEmail`) to be deployed and configured.
- Phase 2 adaptive tier algorithm must use the existing `INotificationRegistration` schema — no breaking changes.
- Five canonical testing fixtures ship via the `testing` sub-path for consumer module test isolation.

## Compliance

This ADR is locked by CLAUDE.md §6.3. May only be reversed by a superseding ADR.
