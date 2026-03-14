# Project Setup BIC Action Contract

> **Doc Classification:** Canonical Normative Plan — defines the canonical BIC ownership and expected-action mapping for project setup requests across all consuming surfaces.

**Source Task:** W0-G3-T02 — Ownership, Next Action, and Handoff Contract
**Package:** `@hbc/provisioning` → `src/bic-config.ts`, `src/bic-registration.ts`
**Consumers:** Estimating, Accounting, Admin surfaces; notification payloads; future My Work feed

---

## Canonical Action String Table

| Lifecycle State | Current Owner | expectedAction | Urgency |
|-----------------|---------------|----------------|---------|
| `Submitted` | Controller | Review the new project setup request | `watch` |
| `UnderReview` | Controller | Complete your review and approve or request clarification | `watch` |
| `NeedsClarification` | Requester | Respond to clarification requests to continue setup | `immediate` |
| `AwaitingExternalSetup` | Controller | Complete external IT setup prerequisites | `watch` |
| `ReadyToProvision` | System (null) | Site provisioning is queued | N/A |
| `Provisioning` | System (null) | Site provisioning is in progress | N/A |
| `Completed` | Project Lead | Review your provisioned project site and complete the getting-started steps | `upcoming` |
| `Failed` | Admin | Investigate and recover the failed provisioning request | `immediate` |
| `Failed` (escalated) | Admin | Investigate the escalated provisioning failure — requester retry exhausted | `immediate` |

---

## BIC Config Location

```
@hbc/provisioning
  src/bic-config.ts       → PROJECT_SETUP_BIC_CONFIG, deriveCurrentOwner(), action maps
  src/bic-registration.ts → createProjectSetupBicRegistration(), module key/label constants
```

All consuming surfaces must import `PROJECT_SETUP_BIC_CONFIG` from `@hbc/provisioning`. Surfaces must not redefine or override individual resolvers.

---

## Owner Derivation Rules

| State | Derivation | userId Source |
|-------|-----------|--------------|
| Submitted, UnderReview, AwaitingExternalSetup | Controller | `request.completedBy` (fallback: empty) |
| NeedsClarification | Requester | `request.submittedBy` |
| ReadyToProvision, Provisioning | System (null) | N/A |
| Completed | Project Lead | `request.projectLeadId` (fallback: `submittedBy`) |
| Failed | Admin | Role-based (empty userId) |

**System-owned states:** `resolveCurrentOwner()` returns `null` for `ReadyToProvision` and `Provisioning`. Consuming surfaces must handle null gracefully — T06 governs display behavior.

**Failed state distinction:** When `request.requesterRetryUsed === true`, the failure is escalated and the request is blocked. The action string changes to the escalated variant.

---

## Blocked States

| State | Blocked | Reason |
|-------|---------|--------|
| `AwaitingExternalSetup` | Yes | Waiting for external IT/security setup |
| `Failed` (escalated) | Yes | Requester retry exhausted; admin must investigate |
| All others | No | — |

---

## Due Date Calculation

Only `NeedsClarification` has a due date: 3 calendar days from `clarificationRequestedAt`. All other states return `null`. This is advisory in Wave 0 — no hard SLA enforcement.

---

## Module Registration

The provisioning module registers with `@hbc/bic-next-move` using:

| Field | Value |
|-------|-------|
| `key` | `'provisioning'` |
| `label` | `'Project Setup'` |
| `queryFn` | Provided by consuming surface at registration time |

Use `createProjectSetupBicRegistration(queryFn)` factory to create the registration object. The consuming surface (app bootstrap) provides the `queryFn` that fetches items from its API client.

---

## Resolver Summary (8 required)

| Resolver | Behavior |
|----------|----------|
| `resolveCurrentOwner` | State-derived via `deriveCurrentOwner()` |
| `resolveExpectedAction` | Lookup in `PROJECT_SETUP_ACTION_MAP` with Failed escalation branch |
| `resolveDueDate` | 3-day advisory for NeedsClarification; null otherwise |
| `resolveIsBlocked` | AwaitingExternalSetup or escalated Failed |
| `resolveBlockedReason` | Specific reason strings for blocked states |
| `resolvePreviousOwner` | Returns null (Wave 0 — no transfer history stored) |
| `resolveNextOwner` | Role-based stub for the expected next owner |
| `resolveEscalationOwner` | Always Admin |

---

## Deviations from Spec

- **`state` vs. `workflowStage`:** The spec references `workflowStage` but the model uses `state`. All resolvers use `request.state`.
- **`Draft` state:** The spec includes `Draft` in the action table but `ProjectSetupRequestState` does not include `Draft` (lifecycle begins at `Submitted`). Draft handling is a pre-lifecycle concern managed by the wizard, not by BIC.
- **`deriveCurrentOwner` is new:** The spec references this as an existing function in `@hbc/provisioning` — it was created by this task.
- **`IBicOwner.userId`:** The spec uses `null` for role-based stubs. The interface requires `string`. Empty string `''` is used as the sentinel.
- **`resolvePreviousOwner`:** Returns null in Wave 0 (no `ownershipHistory` on the model). Wave 1 can extend.

---

*End of bic-action-contract.md — W0-G3-T02*
