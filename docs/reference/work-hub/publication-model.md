# Work Hub Publication Model

**Purpose:** Define how each Wave 1 workflow publishes work items into the Personal Work Hub via `@hbc/my-work-feed`.
**Date:** 2026-03-15
**Governing primitive:** `@hbc/my-work-feed` (SF29, ADR-0115)

---

## 1. Publication Architecture

All Wave 1 workflows publish through three existing My Work Feed adapters. No new adapters are needed for Wave 1.

| Channel | Adapter | Source Weight | What It Publishes |
|---------|---------|---------------|-------------------|
| **BIC ownership** | `bicAdapter` | 0.9 (highest) | Active work items owned by the current user — state, urgency, expected action, blocked status |
| **Workflow handoff** | `handoffAdapter` | 0.8 | Inbound work transfers requiring acknowledgment |
| **Notifications** | `notificationAdapter` | 0.5 | Lifecycle signals — state changes, completions, failures, escalations |

Source weight determines which item survives deduplication when the same record is reported through multiple channels.

---

## 2. Wave 1 Publishing Sources

| Source | Module Key | BIC Adapter | Notification Events | Handoff Events |
|--------|-----------|-------------|-------------------|----------------|
| **Provisioning** | `provisioning` | `packages/provisioning/src/bic-registration.ts` | 15 events (`notification-registrations.ts`) | Completion handoff (`handoff-config.ts`) |
| **Estimating Bid Readiness** | `estimating-bid-readiness` | `packages/features/estimating/src/bid-readiness/integrations/bicNextMoveAdapter.ts` | Via `BidReadinessNotificationType` | None |
| **BD Score Benchmark** | `bd-score-benchmark` | `packages/features/business-development/src/score-benchmark/integrations/bicNextMoveAdapter.ts` | To be defined in Wave 1 | None |
| **BD Strategic Intelligence** | `bd-strategic-intelligence` | `packages/features/business-development/src/strategic-intelligence/integrations/bicNextMoveAdapter.ts` | To be defined in Wave 1 | None |
| **Project Hub Health Pulse** | `project-hub-health-pulse` | `packages/features/project-hub/src/health-pulse/integrations/bicNextMoveAdapter.ts` | To be defined in Wave 1 | None |
| **Admin Escalations** | `admin` | Via provisioning BIC (failed state) | Alert events via `AlertPollingService` | None |

---

## 3. BIC Registration Contract

Every Wave 1 workflow that publishes work items MUST follow the canonical BIC registration pattern.

### Required artifacts per module

1. **Module key constant** — stable string identifier (e.g., `ESTIMATING_BIC_MODULE_KEY = 'estimating-bid-readiness'`)
2. **Module label constant** — human-readable name (e.g., `'Bid Readiness'`)
3. **Registration factory** — `createXxxBicRegistration(queryFn: (userId: string) => Promise<IBicRegisteredItem[]>): IBicModuleRegistration`
4. **Query function** — fetches all items where the current user is the BIC owner
5. **BIC config** — maps domain states to: `moduleKey`, `itemKey`, `urgency`, `expectedAction`, `isBlocked`, `blockedReason`

### Reference implementation

```
packages/provisioning/src/bic-registration.ts   — factory
packages/provisioning/src/bic-config.ts          — config (ownership, urgency, actions)
```

### Existing adapters that need registration wiring

These BIC projection adapters exist but are not yet wired into the BIC module registry:

| Adapter | File | Wave 1 Action |
|---------|------|---------------|
| Estimating bid readiness | `packages/features/estimating/src/bid-readiness/integrations/bicNextMoveAdapter.ts` | Create registration factory; wire at Estimating app bootstrap |
| BD score benchmark | `packages/features/business-development/src/score-benchmark/integrations/bicNextMoveAdapter.ts` | Create registration factory; wire at BD app bootstrap |
| BD strategic intelligence | `packages/features/business-development/src/strategic-intelligence/integrations/bicNextMoveAdapter.ts` | Create registration factory; wire at BD app bootstrap |
| Project Hub health pulse | `packages/features/project-hub/src/health-pulse/integrations/bicNextMoveAdapter.ts` | Create registration factory; wire at Project Hub app bootstrap |

---

## 4. Notification Publication Contract

Workflows that want notification-driven work items in the feed must provide:

1. **Notification registrations** — following `PROVISIONING_NOTIFICATION_REGISTRATIONS` pattern:
   - Event type string (e.g., `'estimating.bid-readiness-changed'`)
   - Default tier: `immediate` | `watch` | `digest`
   - Overridable flag (can user suppress?)
   - Default channels: `in-app`, `email`, `push`
   - Recipient resolution function

2. **Notification templates** — following `PROVISIONING_NOTIFICATION_TEMPLATES` pattern:
   - Subject line factory
   - Body factory
   - Action URL factory

3. **Registration** — with `@hbc/notification-intelligence`

**Reference:** `packages/provisioning/src/notification-registrations.ts` and `packages/provisioning/src/notification-templates.ts`

---

## 5. Deduplication Keys

All sources use the canonical key format: `{moduleKey}::{recordType}::{recordId}`

| Source | Example Key |
|--------|-------------|
| Provisioning | `provisioning::request::req-abc123` |
| Estimating bid readiness | `estimating-bid-readiness::pursuit::pur-def456` |
| BD score benchmark | `bd-score-benchmark::pursuit::pur-ghi789` |
| BD strategic intelligence | `bd-strategic-intelligence::entry::ent-jkl012` |
| Project Hub health pulse | `project-hub-health-pulse::project::proj-mno345` |

When the same record produces items through multiple channels (e.g., a BIC item AND a notification), the higher-weight source (BIC at 0.9) wins deduplication. The lower-weight item's `sourceMeta` is merged into the survivor.

---

## 6. Priority Mapping Reference

Each adapter maps its source urgency model to the canonical feed priority:

### BIC adapter
| BIC Urgency | Feed Priority | Lane |
|-------------|--------------|------|
| `immediate` | `now` | `do-now` |
| `watch` | `soon` | `do-now` |
| `upcoming` | `watch` | `watch` |
| Blocked item | (original priority) | `waiting-blocked` |

### Notification adapter
| Notification Tier | Feed Priority | Lane |
|-------------------|--------------|------|
| `immediate` | `now` | `do-now` |
| `watch` | `soon` | `watch` |
| `digest` | `watch` | `watch` |

### Handoff adapter
| Handoff Age | Feed Priority | Lane |
|-------------|--------------|------|
| > 48 hours | `now` | `do-now` |
| > 24 hours | `soon` | `do-now` |
| ≤ 24 hours | `watch` | `do-now` |

---

## Related Documents

- [Work Hub Runway Definition](./runway-definition.md)
- [Work Hub Interaction Contract](./interaction-contract.md)
- [Provisioning Publication Contract](../provisioning/work-hub-publication-contract.md)
- [BIC Action Contract](../workflow-experience/bic-action-contract.md)
