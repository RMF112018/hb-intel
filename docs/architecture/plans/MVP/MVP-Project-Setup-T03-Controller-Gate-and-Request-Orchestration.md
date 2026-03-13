# MVP-Project-Setup-T03 — Controller Gate and Request Orchestration

**Phase Reference:** MVP Project Setup Master Plan  
**Spec Source:** `MVP-Project-Setup.md` + MVP Blueprint + MVP Roadmap  
**Decisions Applied:** D-01, D-02, D-05, D-07 through D-11, D-15 + R-02, R-03, R-08  
**Estimated Effort:** 1.2 sprint-weeks  
**Depends On:** T02  
> **Doc Classification:** Canonical Normative Plan — business-gate/orchestration task; sub-plan of `MVP-Project-Setup-Plan.md`.

---

## Objective

Finish the missing business workflow engine: Controller review, clarification, external setup, project-number validation, and the final **Finish Setup** provisioning trigger.

---

## Required Paths

```text
backend/functions/src/functions/projectRequests/*
packages/provisioning/src/state-machine.ts
packages/provisioning/src/api-client.ts
packages/provisioning/src/visibility.ts
apps/accounting/src/pages/*
apps/accounting/src/routes/*
packages/bic-next-move/*
packages/field-annotations/*
```

---

## Controller Workflow Requirements

### Required Accounting surfaces

1. **Request inbox / queue**
   - list of submitted and active setup requests
   - filters: state, department, requester, duplicate warning
   - route into detail/review workspace

2. **Controller review detail**
   - request summary
   - highlighted clarifications / changed fields
   - general comments
   - duplicate warning state
   - project-number entry and validation result
   - explicit next actions

3. **Finish Setup trigger**
   - single decisive action
   - no extra confirmation modal unless validation fails
   - disabled unless project-number validation passes and required review gates are complete

### Project-number validation rules

- validate format before persistence
- check uniqueness before allowing `ReadyToProvision -> Provisioning`
- duplicates may be saved for work-in-progress context but cannot advance
- validation result must be stored, not re-derived only in page state

---

## Backend Orchestration Requirements

- `advanceState` must enforce business validation server-side
- `triggeredBy` must come from validated identity, not client payload
- request transitions must be idempotent
- repeated `Finish Setup` clicks for the same request/run must not create duplicate provisioning runs
- the backend must persist correlation between request, run, and status resource

---

## `@hbc/bic-next-move` Integration Rules

- Submitted / UnderReview / AwaitingExternalSetup = Controller next move
- NeedsClarification = requester next move
- Failed with retry available = Estimating next move
- Failed after second failure = Admin next move
- Completed = no action state

BIC projections must be derived from lifecycle truth, not separately invented in app code.

---

## `@hbc/field-annotations` Clarification Rules

- annotations may target named fields or general review sections
- unresolved clarification items block advancement to `ReadyToProvision`
- requester resubmission must preserve original value, updated value, and change summary
- clarification resolution must be visible to Controller without diff hunting

---

## Verification Commands

```bash
pnpm --filter @hbc/functions test -- projectRequests
pnpm --filter @hbc/provisioning test -- state-machine
pnpm --filter @hbc/spfx-accounting check-types
pnpm --filter @hbc/spfx-accounting test
rg -n "Finish Setup|project number|NeedsClarification|AwaitingExternalSetup|duplicate" apps/accounting backend/functions packages/provisioning
```
