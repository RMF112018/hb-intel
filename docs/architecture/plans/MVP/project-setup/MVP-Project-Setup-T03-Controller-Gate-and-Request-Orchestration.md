# MVP-Project-Setup-T03 — Controller Gate and Request Orchestration

**Phase Reference:** MVP Project Setup Master Plan
**Spec Source:** `MVP-Project-Setup.md` + MVP Blueprint + MVP Roadmap
**Decisions Applied:** D-01, D-02, D-05, D-07 through D-11, D-15 + R-02, R-03, R-08
**Estimated Effort:** 1.8–2.2 sprint-weeks (revised upward — entire accounting Controller surface must be built from scratch)
**Depends On:** T02
> **Doc Classification:** Canonical Normative Plan — business-gate/orchestration task; sub-plan of `MVP-Project-Setup-Plan.md`.

---

## Objective

Build the missing business workflow engine: Controller review, clarification, external setup, project-number validation, and the final **Finish Setup** provisioning trigger. This task includes creating the entire accounting Controller surface from scratch, which does not currently exist.

---

## Required Paths

```text
backend/functions/src/functions/projectRequests/*
backend/functions/src/state-machine.ts
packages/provisioning/src/state-machine.ts
packages/provisioning/src/api-client.ts
packages/provisioning/src/visibility.ts
apps/accounting/src/pages/ControllerInboxPage.tsx      ← new file
apps/accounting/src/pages/ControllerReviewPage.tsx     ← new file
apps/accounting/src/router/routes.ts                   ← add new routes
packages/bic-next-move/*
packages/field-annotations/*
```

---

## New Accounting App Pages (Build from Scratch)

The `apps/accounting` app currently has no provisioning routes or Controller surfaces. T03 must create them.

### New pages required

**`apps/accounting/src/pages/ControllerInboxPage.tsx`**
- List of submitted and active setup requests
- Filters: state, department, requester, duplicate project-number warning
- BIC indicator per request using `@hbc/bic-next-move`
- Route into `ControllerReviewPage` per request

**`apps/accounting/src/pages/ControllerReviewPage.tsx`**
- Request summary (project name, location, department, stage, group members)
- Clarification panel — unresolved items displayed distinctly using `@hbc/field-annotations`
- General comments section
- Duplicate project-number warning when applicable
- Project-number entry and validation result (inline; shows valid / format-invalid / duplicate)
- Explicit next-action buttons: Request Clarification, Mark External Setup Required, Finish Setup

### New routes (add to `apps/accounting/src/router/routes.ts`)

```ts
const controllerInboxRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/controller-inbox',
  beforeLoad: () => { useNavStore.getState().setActiveWorkspace('accounting'); },
  component: lazyRouteComponent(() =>
    import('../pages/ControllerInboxPage.js').then((m) => ({ default: m.ControllerInboxPage }))
  ),
});

const controllerReviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/controller-inbox/$requestId',
  component: lazyRouteComponent(() =>
    import('../pages/ControllerReviewPage.js').then((m) => ({ default: m.ControllerReviewPage }))
  ),
});
```

Add both routes to `webpartRoutes`.

---

## Finish Setup Trigger Requirements

- Single decisive action button
- No extra confirmation modal unless validation fails
- Disabled unless all conditions are met:
  - project number is entered and passes format validation
  - project number uniqueness check passes (see below)
  - all unresolved clarification items are resolved
- On click: call `advanceState(requestId, 'Provisioning')` — this is the trigger that starts the saga

---

## Project-Number Validation Rules

- Validate format on blur (pattern: `##-###-##`)
- Validate uniqueness before allowing `ReadyToProvision -> Provisioning` transition
- Uniqueness check must be **server-side** (backend `advanceState` handler):
  1. Query all existing requests with `state != 'Canceled'`
  2. Reject if any other request has the same `projectNumber`
  3. Return HTTP 409 Conflict with a human-readable error body on duplicate
- Validation result stored on `IProjectSetupRequest.projectNumberValidationState` — not re-derived only in page state
- A duplicate project number may be saved for work-in-progress context but cannot advance state

---

## Backend Orchestration Requirements

- `advanceState` must enforce all business validation server-side (not trust client state)
- `triggeredBy` must be extracted from the validated Bearer token — not from the client request body
- Request state transitions must be idempotent: repeated calls for the same transition must not create duplicate records or fire the saga twice
- Repeated `Finish Setup` triggers for the same request/run must not create duplicate provisioning runs — check for an existing `InProgress` or `Completed` run before enqueuing
- The backend must persist the correlation between request, run, and status resource on every state change
- When `advanceState` moves to `Provisioning`, the backend must:
  1. Create or update the `IProvisioningEventRecord` with category `'provisioning-started'`
  2. Enqueue the saga trigger
  3. Return the updated request and a provisioning run reference

---

## `@hbc/bic-next-move` Integration Rules

BIC projections must be derived from `deriveCurrentOwner()` (T02), not separately invented in app code.

| Request State | Derived Owner | BIC Module |
|---|---|---|
| Submitted / UnderReview / AwaitingExternalSetup | Controller | Accounting app |
| NeedsClarification | Requester | Estimating app |
| Failed (first failure) | Requester | Estimating app |
| Failed (second failure / escalated) | Admin | Admin app |
| Completed | None | — |

Use `@hbc/bic-next-move` module registry to register the accounting module and project-request action type. Do not hard-code ownership strings in page components.

---

## `@hbc/field-annotations` Clarification Rules

- Annotations may target named request fields (e.g., `projectName`, `department`) or a general review section
- Unresolved clarification items block advancement to `ReadyToProvision` and block the Finish Setup trigger
- Requester resubmission must preserve: original field value, updated value, and change summary — all visible to Controller without diff hunting
- Clarification resolution must be visible via `@hbc/field-annotations` thread UI in `ControllerReviewPage`
- The `IRequestClarification[]` array on the request record is the source of truth for thread state

---

## Verification Commands

```bash
# Backend tests for request lifecycle
pnpm --filter @hbc/functions test -- projectRequests

# Backend state machine — confirm Draft/Canceled present
pnpm --filter @hbc/functions test -- state-machine
rg -n "Draft|Canceled" backend/functions/src/state-machine.ts

# Provisioning package state machine — must match
rg -n "Draft|Canceled" packages/provisioning/src/state-machine.ts

# Accounting app typecheck
pnpm --filter @hbc/spfx-accounting check-types
pnpm --filter @hbc/spfx-accounting test

# Confirm new pages and routes exist
test -f apps/accounting/src/pages/ControllerInboxPage.tsx && echo "OK" || echo "MISSING ControllerInboxPage"
test -f apps/accounting/src/pages/ControllerReviewPage.tsx && echo "OK" || echo "MISSING ControllerReviewPage"
grep -n "controllerInboxRoute\|controllerReviewRoute\|controller-inbox" apps/accounting/src/router/routes.ts

# Confirm uniqueness check in backend
rg -n "uniqueness\|duplicate\|projectNumber\|409\|Conflict" backend/functions/src/functions/projectRequests/

# Confirm triggeredBy is extracted from token, not client body
rg -n "triggeredBy\|validateToken" backend/functions/src/functions/projectRequests/

# Confirm Finish Setup / clarification semantics
rg -n "Finish Setup|NeedsClarification|AwaitingExternalSetup|duplicate|projectNumberValidationState" apps/accounting backend/functions packages/provisioning
