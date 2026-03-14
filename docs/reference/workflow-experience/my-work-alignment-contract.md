# My Work Alignment Contract

> **Document Classification:** Canonical Normative Plan
> **Traceability:** W0-G3-T04

---

## Status

`@hbc/my-work-feed` does not exist. It is classified as SF-29 (P2 research stage). No code implementation is required or permitted at this time.

This document defines the alignment contract that enables future My Work integration without creating premature coupling or stopgap surfaces.

---

## Illustrative `IMyWorkItem` Mapping Shape (Provisional)

The following shape is reproduced verbatim from the T04 spec and is marked **provisional** — it will be finalized when SF-29 enters active development:

```typescript
/** Provisional — do not implement until SF-29 is activated. */
interface IMyWorkItem {
  id: string;
  moduleKey: string;          // e.g. 'project-setup'
  sourceType: string;         // e.g. 'provisioning-request'
  sourceId: string;           // e.g. request ID
  title: string;              // e.g. project name
  description: string;        // current expected action (from BIC)
  urgency: 'immediate' | 'watch' | 'upcoming';
  owner: {
    userId: string;
    displayName: string;
    role: string;
  } | null;
  actionUrl: string;
  dueDate: string | null;
  isBlocked: boolean;
  blockedReason: string | null;
  lastUpdated: string;
}
```

---

## Minimum Interim Hook Points

Three contract surfaces are already stable and will serve as the integration seam when `@hbc/my-work-feed` is created:

### 1. BIC Module Registration

`createProjectSetupBicRegistration()` from `@hbc/provisioning/src/bic-registration.ts` provides a fixed module key (`project-setup`) and label. The My Work feed will consume this registration to know which modules supply work items.

### 2. Notification Event Types

The 15 events in `PROVISIONING_NOTIFICATION_REGISTRATIONS` (from `@hbc/provisioning/src/notification-registrations.ts`) define the complete set of lifecycle signals. The My Work feed can subscribe to these events to update item state.

### 3. Canonical Action Strings

`PROJECT_SETUP_ACTION_MAP` (from `@hbc/provisioning/src/bic-config.ts`) provides the authoritative expected-action text per lifecycle state. The My Work feed must use these strings — it must not define its own action text.

---

## Prohibited My Work Stopgap Patterns

The following patterns are **prohibited** until SF-29 is activated with a Canonical Normative Plan:

1. **"My Requests" surface** — no per-user request list aggregation outside of the established module surfaces (Estimating, Accounting, Admin)
2. **"My Reviews" surface** — no per-controller review queue outside of the Accounting controller surface
3. **"My Active Items" surface** — no cross-module work item aggregation
4. **Bespoke per-surface aggregation** — no surface may create its own "things I need to do" aggregation logic; this is the exclusive domain of `@hbc/my-work-feed`

These prohibitions prevent fragmented, inconsistent work-item surfaces from proliferating before the platform primitive is ready.

---

## Source Enumeration for Project Setup Items

When SF-29 is implemented, the following sources supply project setup work items:

| Source | Data |
|--------|------|
| `IProjectSetupRequest` state + `deriveCurrentOwner()` | Current owner, lifecycle state, expected action |
| `PROJECT_SETUP_BIC_CONFIG` resolvers | Urgency, blocked status, due date, next owner |
| `PROVISIONING_NOTIFICATION_REGISTRATIONS` | Event type catalog for subscription |
| `PROVISIONING_NOTIFICATION_TEMPLATES` | Display text for notification-driven item updates |
| `PROJECT_SETUP_ACTION_MAP` | Canonical action strings |

---

## Cross-References

- [BIC Action Contract](./bic-action-contract.md) — T02 ownership and action contract
- [Setup Notification Registrations](./setup-notification-registrations.md) — T04 full 15-event registration spec
- [Clarification Re-entry Spec](./clarification-reentry-spec.md) — T03 clarification loop contract
