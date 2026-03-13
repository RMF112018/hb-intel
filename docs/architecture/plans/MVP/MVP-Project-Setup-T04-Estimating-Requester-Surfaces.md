# MVP-Project-Setup-T04 — Estimating Requester Surfaces

**Phase Reference:** MVP Project Setup Master Plan  
**Spec Source:** `MVP-Project-Setup.md` + MVP Blueprint + MVP Roadmap  
**Decisions Applied:** D-01, D-03, D-07 through D-09, D-12, D-14, D-15 + R-03, R-08  
**Estimated Effort:** 1.0 sprint-weeks  
**Depends On:** T02, T03  
> **Doc Classification:** Canonical Normative Plan — requester-surface task; sub-plan of `MVP-Project-Setup-Plan.md`.

---

## Objective

Upgrade Estimating from a basic request form into a complete requester-side workflow surface that supports intake, clarification, cancel/reopen, progress visibility, and one allowed retry.

---

## Required Paths

```text
apps/estimating/src/pages/NewRequestPage.tsx
apps/estimating/src/pages/ProjectSetupPage.tsx
apps/estimating/src/pages/RequestDetailPage.tsx
packages/provisioning/src/hooks/*
packages/step-wizard/*
packages/ui-kit/*
```

---

## `NewRequestPage` Requirements

Must capture:

- project name
- project location
- department
- project type
- project stage
- group members

Form rules:

- keep the form lean and nontechnical
- department is required
- OpEx inclusion logic must not hide or overwrite explicit group-member choices
- validation messages must be business-readable
- submission returns a durable request reference immediately

---

## `ProjectSetupPage` / `RequestDetailPage` Requirements

### Lifecycle visibility

- show current request state
- show current owner / next move
- show project-number status once assigned
- show clarification tasks distinctly from general comments
- show retry eligibility and escalation state clearly

### Actions

- cancel in any pre-provision state with required reason
- reopen / continue when the request is restored after cancellation
- resolve clarification items and resubmit
- invoke one self-service retry after first failure
- submit a failure report / extra context before retry if desired

### Progress UX

- use `@hbc/step-wizard` or equivalent step projection for business-friendly status
- render SignalR updates live when connected
- fall back to status polling when not connected
- never rely on SignalR as the sole truth source

### Completion UX handoff

- when `Completed`, expose direct site link
- show created-site summary
- expose getting-started route if present
- preserve the request record as history after completion

---

## Complexity / UI Rules

- reusable progress, alert, summary, and drawer components belong in `@hbc/ui-kit`
- Estimating pages may compose role-specific shells only
- wording must remain plain English; do not expose raw step IDs as primary messaging

---

## Verification Commands

```bash
pnpm --filter @hbc/spfx-estimating check-types
pnpm --filter @hbc/spfx-estimating test
rg -n "department|cancel|reopen|retry|SignalR|poll|getting started|current owner" apps/estimating
```
