# Provisioning-to-Work-Hub Publication Contract

**Purpose:** Define how provisioning lifecycle states publish into the Personal Work Hub via `@hbc/my-work-feed`.
**Date:** 2026-03-15
**Status:** Implemented — this document formalizes the existing integration seams.

---

## 1. Publication Channels

Provisioning publishes into the Personal Work Hub through three existing My Work Feed adapters. No provisioning-specific adapter is needed.

| Channel | My Work Feed Adapter | Source Weight | What It Publishes |
|---------|---------------------|---------------|-------------------|
| BIC ownership | `bicAdapter` | 0.9 (highest) | Active provisioning requests owned by the current user — state, urgency, expected action, blocked status |
| Handoff | `handoffAdapter` | 0.8 | Completion handoff from provisioning to Project Hub — acknowledge/reject actions |
| Notifications | `notificationAdapter` | 0.5 | 15 provisioning lifecycle events — completion, failure, clarification, handoff signals |

**Integration seam:** Each consuming surface (Estimating, Accounting, Admin) registers the provisioning BIC module at initialization via `createProjectSetupBicRegistration()` from `@hbc/provisioning`.

---

## 2. State-to-Work-Item Mapping

| Provisioning State | Feed Item Class | Priority | Lane | Owner | Expected Action |
|-------------------|----------------|----------|------|-------|-----------------|
| Submitted | `owned-action` | `soon` | `do-now` | Controller | "Review the new project setup request" |
| UnderReview | `owned-action` | `soon` | `do-now` | Controller | "Complete your review and approve or request clarification" |
| NeedsClarification | `owned-action` | `now` | `do-now` | Requester | "Respond to clarification requests to continue setup" |
| AwaitingExternalSetup | `owned-action` | `soon` | `waiting-blocked` | Controller | "Complete external IT setup prerequisites" |
| ReadyToProvision | *(system-owned)* | — | — | System | No work item — system processing |
| Provisioning | *(system-owned)* | — | — | System | No work item — system processing |
| Completed | `owned-action` | `watch` | `watch` | Project Lead | "Review your provisioned project site and complete the getting-started steps" |
| Failed | `owned-action` | `now` | `do-now` | Admin | "Investigate and recover the failed provisioning request" |

**Key rule:** System-owned states (ReadyToProvision, Provisioning) do not create owned work items. Progress is available via `ProvisioningProgressView` (SignalR) but does not feed the work item model.

---

## 3. Notification Event Feed Items

All 15 provisioning events (from `PROVISIONING_NOTIFICATION_REGISTRATIONS`) can surface as `attention-item` class work items via the `notificationAdapter`.

| Event | Default Tier | Feed Priority | Recipients |
|-------|-------------|---------------|-----------|
| `provisioning.request-submitted` | immediate | `now` | Controller |
| `provisioning.clarification-requested` | immediate | `now` | Requester |
| `provisioning.clarification-responded` | immediate | `now` | Controller |
| `provisioning.request-approved` | watch | `soon` | Requester |
| `provisioning.ready-to-provision` | immediate | `now` | Controller |
| `provisioning.started` | watch | `soon` | Group |
| `provisioning.step-completed` | watch | `soon` | Group |
| `provisioning.completed` | watch | `soon` | Group, Requester |
| `provisioning.first-failure` | immediate | `now` | Controller, Requester |
| `provisioning.second-failure-escalated` | immediate | `now` | Controller, Requester, Admin |
| `provisioning.recovery-resolved` | watch | `soon` | Group, Requester |
| `provisioning.handoff-received` | immediate | `now` | Handoff recipient |
| `provisioning.handoff-acknowledged` | watch | `soon` | Handoff sender |
| `provisioning.handoff-rejected` | immediate | `now` | Handoff sender |
| `provisioning.site-access-ready` | watch | `soon` | Group |

---

## 4. Handoff Feed Items

When provisioning completes, the `SETUP_TO_PROJECT_HUB_HANDOFF_CONFIG` creates a workflow handoff to the Project Lead. This surfaces as an `inbound-handoff` class work item via the `handoffAdapter`.

- **Recipient:** Project Lead (from `request.projectLeadId`, with submitter fallback)
- **Actions:** Acknowledge, Reject (danger variant)
- **Priority escalation:** Age-based — >48h = `now`, >24h = `soon`, else `watch`
- **Seed data:** projectName, projectNumber, department, siteUrl, projectLeadId, groupMembers

---

## 5. Deduplication & Ranking

- **Deduplication key:** `provisioning::request::{requestId}` — ensures the same provisioning request does not appear as 3 separate items (BIC + notification + handoff)
- **Ranking:** BIC item (weight 0.9) wins over handoff (0.8) and notification (0.5) when the same request produces items through multiple channels
- **Supersession:** Items in `completed` or `superseded` states are hidden from active lanes but retained for audit
- **Count consistency:** Badge count, panel count, and full feed count are guaranteed consistent by the aggregation pipeline

---

## 6. Display Strings (Canonical Sources)

All display text is drawn from provisioning package registries. The Work Hub does not define its own provisioning display strings.

| Concern | Canonical Source | File |
|---------|-----------------|------|
| State labels | `PROJECT_SETUP_STATUS_LABELS` | `packages/provisioning/src/summary-field-registry.ts` |
| Expected actions | `PROJECT_SETUP_ACTION_MAP` | `packages/provisioning/src/bic-config.ts` |
| Urgency indicators | `URGENCY_INDICATOR_MAP` | `packages/provisioning/src/summary-field-registry.ts` |
| Badge variants | `STATE_BADGE_VARIANTS` | `packages/provisioning/src/summary-field-registry.ts` |
| Coaching prompts | `PROJECT_SETUP_COACHING_PROMPTS` | `packages/provisioning/src/coaching-prompt-registry.ts` |

---

## 7. What Is NOT Published (Wave 0 Boundaries)

- **System-owned states** (ReadyToProvision, Provisioning) do not create owned work items. SignalR progress is a separate real-time view, not a feed item.
- **Deferred monitors** (overdue workflow, stale request, permission anomaly, override expiration) do not yet create alert-type work items. These are Wave 1 scope.
- **Deferred probes** (search, notification, module-record-health) do not yet create infrastructure-health work items. These are Wave 1 scope.
- **Email/Teams notifications** are console-logged / fire-and-forget in Wave 0. They create in-app notification items but do not yet deliver externally with confirmation.

---

## Key Source Files

| File | Role |
|------|------|
| `packages/provisioning/src/bic-config.ts` | Ownership, urgency, expected actions per state |
| `packages/provisioning/src/bic-registration.ts` | BIC module registration factory |
| `packages/provisioning/src/notification-registrations.ts` | 15 lifecycle events |
| `packages/provisioning/src/notification-templates.ts` | Event message templates |
| `packages/provisioning/src/handoff-config.ts` | Completion handoff to Project Hub |
| `packages/provisioning/src/summary-field-registry.ts` | Display labels, badge variants, urgency indicators |
| `packages/provisioning/src/coaching-prompt-registry.ts` | Coaching prompts for guided states |
| `packages/my-work-feed/src/adapters/bicAdapter.ts` | BIC → work item adapter |
| `packages/my-work-feed/src/adapters/handoffAdapter.ts` | Handoff → work item adapter |
| `packages/my-work-feed/src/adapters/notificationAdapter.ts` | Notification → work item adapter |
| `packages/my-work-feed/src/types/IMyWorkItem.ts` | Work item domain model |
| `docs/reference/workflow-experience/my-work-alignment-contract.md` | Alignment contract (provisional) |
