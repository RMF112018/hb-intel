# MVP Project Setup — Implementation Master Plan

**Plan Version:** 1.0  
**Date:** 2026-03-13  
**Source Spec:** `MVP-Project-Setup.md` + `HBI_MVP_SharePoint_Provisioning_Blueprint.md` + `HBI_MVP_SharePoint_Provisioning_Roadmap.md`  
**Priority Tier:** 1 — MVP Platform Proof (cross-app workflow; shared provisioning engine; leadership proof point)  
**Estimated Effort:** 6–8 sprint-weeks (assuming current PH6 foundation remains usable)  
**ADR Required:** Recommended — formalize MVP Project Setup workflow, controller trigger authority, hybrid permission bootstrap, and admin takeover semantics in a new ADR if this plan is adopted into the repo  
> **Doc Classification:** Canonical Normative Plan — implementation master plan for the MVP Project Setup feature; governs `MVP-Project-Setup-T01` through `MVP-Project-Setup-T09`.

---

## Purpose

This plan converts the MVP feature summary into an implementation-ready plan set that is aligned to:

- the repo’s present-truth hierarchy (`current-state-map.md` before historical plans)
- the locked package-boundary and UI-ownership rules
- the uploaded MVP Blueprint and Roadmap
- the current implementation evidence in Estimating, Admin, backend Functions, and `@hbc/provisioning`
- Microsoft and Azure provisioning best practices for long-running workflow orchestration, SharePoint template application, least-privilege app access, and throttling-safe execution

This plan is intentionally narrow. It does **not** attempt to complete the broader platform vision. It exists to deliver one business-complete proof:

> A new project request can move through a controlled lifecycle, the Controller can perform the decisive gate, the system can provision a standardized SharePoint site reliably, and the business can understand both success and failure.

---

## Research-Derived Implementation Rules

The following rules are baked into this plan because they are strongly supported by current Microsoft guidance and directly affect code shape, reliability, and SharePoint provisioning behavior.

### R-01 — Prefer platform-native site-template actions for simple site-scoped setup

Where the required behavior is site-scoped and repeatable, use SharePoint site templates / site scripts as the baseline mechanism for consistency. Use additional custom provisioning logic only where site-template actions are insufficient or where the repo already has stronger backend orchestration requirements.

### R-02 — Keep the provisioning engine idempotent

Azure Functions guidance explicitly recommends idempotent processing because retries and duplicate requests happen in real systems. Every provisioning step must be safe to replay or to no-op if the artifact already exists.

### R-03 — Treat provisioning as an async request-reply workflow

Long-running provisioning must expose a status resource that clients can poll even when SignalR is unavailable or disconnected. SignalR is the real-time enhancement, not the only source of truth.

### R-04 — Prefer Microsoft Graph when possible; fall back only where necessary

Current SharePoint Online throttling guidance recommends Microsoft Graph over CSOM/REST when possible because Graph generally consumes fewer resources and is less prone to throttling for equivalent operations.

### R-05 — Design explicitly for throttling and backoff

Provisioning creates lists, libraries, permission changes, links, and sometimes page artifacts. The plan must include `Retry-After`/rate-limit handling, bounded concurrency, and deferred/noncritical work separation to prevent burst failures.

### R-06 — Use least-privilege app access for post-create operations

For automation principals that act on project sites, Microsoft’s `Sites.Selected` / selected-scope model is the preferred long-term access posture. Where broader rights are needed at create time, that elevation should be explicit, minimized, and documented.

### R-07 — Preserve headless logic / app-owned UI boundaries

`@hbc/provisioning` remains headless. Consuming apps own visual surfaces. Reusable visual components belong in `@hbc/ui-kit`.

### R-08 — Make failure understandable in business language

The technical engine may expose step-level details, but each failure state must map to a business-readable explanation, next owner, retry eligibility, and escalation path.

---

## Repo Constraints That Govern This Plan

1. **Present-truth hierarchy:** `current-state-map.md` governs what exists now; older plans do not prove implementation.
2. **Provisioning package boundary:** `@hbc/provisioning` owns headless logic only.
3. **UI ownership:** reusable UI must live in `@hbc/ui-kit`.
4. **Access governance:** HB Intel, not SharePoint, is the system of record for authorization and override governance.
5. **SignalR scoping:** provisioning progress is scoped to per-project groups plus admin visibility.
6. **Current implementation bias:** Estimating is already wired to `@hbc/provisioning`; Accounting is not yet.

---

## Current-State Validation Summary

### Already present

- Estimating request intake page and request-detail/progress surfaces
- headless provisioning package
- backend request lifecycle APIs
- provisioning saga with step model
- SignalR negotiate / per-project progress
- Admin failed-runs page with retry/escalate actions

### Still missing or thin

- Accounting / Controller review-and-trigger surface
- request contract fields for department, cancellation, reopen, retry, takeover, and richer history
- hybrid permission bootstrap beyond request members + OpEx
- completion and getting-started launch experience
- business-grade event history and takeover summary semantics
- explicit backend/client parity validation and throttling/idempotency test coverage

---

## Locked Decisions

| # | Decision | Locked Choice |
|---|---|---|
| D-01 | MVP front door | Estimating remains the initial request intake surface |
| D-02 | Final provisioning trigger | Controller triggers provisioning from Accounting via **Finish Setup** |
| D-03 | Required MVP request field | `department` is mandatory and drives provisioning/access rules |
| D-04 | Project type behavior | record only; no major template branching in MVP |
| D-05 | Trigger gate | validated project number is required before provisioning |
| D-06 | Template strategy | one maintained base site template with department-based pruning |
| D-07 | Lifecycle support | cancel + reopen are supported before provisioning |
| D-08 | Failure policy | one requester/business retry, then admin takeover after second failure |
| D-09 | Business watch owner during provisioning | Estimating Coordinator |
| D-10 | Access bootstrap | hybrid model: project team + structural owners + department background access |
| D-11 | Recovery UX | Admin recovery must be visible in an Admin workspace, not hidden in backend-only tooling |
| D-12 | Completion promise | direct site link + getting-started landing experience |
| D-13 | Pilot rollout | controlled first pilot of 4–10 real project setups |
| D-14 | External access | excluded from MVP |
| D-15 | Boundary rule | `@hbc/provisioning` stays headless; reusable UI stays in `@hbc/ui-kit` |

---

## Package / App Ownership Map

| Area | Primary Owner |
|---|---|
| Request / run / history contracts | `packages/models` |
| Lifecycle rules / visibility / notifications | `packages/provisioning` |
| Requester UI | `apps/estimating` |
| Controller UI | `apps/accounting` |
| Admin recovery UI | `apps/admin` |
| Saga execution and status persistence | `backend/functions` |
| Reusable visual UI | `packages/ui-kit` |
| Ownership signaling | `packages/bic-next-move` |
| Clarification annotations | `packages/field-annotations` |
| Notifications | `packages/notification-intelligence` |
| Progress / step rendering | `packages/step-wizard` |

---

## Recommended Task Sequence

| File | Purpose |
|---|---|
| `MVP-Project-Setup-T01-Scaffold-and-Documentation.md` | align scaffolding, READMEs, path ownership, and research-informed non-negotiables |
| `MVP-Project-Setup-T02-Contracts-and-State-Model.md` | lock request/run/history contracts and lifecycle transitions |
| `MVP-Project-Setup-T03-Controller-Gate-and-Request-Orchestration.md` | finish business workflow engine and Controller trigger path |
| `MVP-Project-Setup-T04-Estimating-Requester-Surfaces.md` | finish intake, clarification, cancel/reopen, retry, and progress UX in Estimating |
| `MVP-Project-Setup-T05-Provisioning-Orchestrator-and-Status.md` | harden saga, async status model, SignalR/poll fallback, idempotency, throttling behavior |
| `MVP-Project-Setup-T06-SharePoint-Template-and-Permissions.md` | implement one-template strategy, department pruning, hybrid access bootstrap, least privilege |
| `MVP-Project-Setup-T07-Admin-Recovery-Notifications-and-Audit.md` | harden failures dashboard, takeover workflow, notifications, event timeline |
| `MVP-Project-Setup-T08-Completion-and-Getting-Started.md` | direct launch, site summary, first-use landing content, completion visibility |
| `MVP-Project-Setup-T09-Testing-Operations-and-Pilot-Release.md` | quality gates, pilot readiness, observability, deployment and rollback criteria |

---

## Definition of Done

- [ ] Estimating can submit a request including department
- [ ] Controller can review, request clarification, enter project number, and trigger provisioning
- [ ] request lifecycle cleanly supports clarification, cancel, reopen, provisioning, failure, completion
- [ ] request state, provisioning run state, and event history are separate and explicit
- [ ] provisioning steps are idempotent and throttling-safe
- [ ] status is available through SignalR **and** durable status/polling
- [ ] hybrid permission bootstrap is implemented and auditable
- [ ] admin takeover occurs after second failure with visible history and business-readable summaries
- [ ] completion state provides direct site link and getting-started page
- [ ] pilot metrics, runbooks, and rollback criteria exist
- [ ] verification commands succeed across all affected workspaces

---

## Verification Envelope

```bash
pnpm turbo run lint --filter @hbc/spfx-estimating... --filter @hbc/spfx-accounting... --filter @hbc/spfx-admin... --filter @hbc/provisioning... --filter @hbc/models... --filter @hbc/functions...
pnpm turbo run build --filter @hbc/spfx-estimating... --filter @hbc/spfx-accounting... --filter @hbc/spfx-admin... --filter @hbc/provisioning... --filter @hbc/models... --filter @hbc/functions...
pnpm --filter @hbc/provisioning check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/spfx-estimating test
pnpm --filter @hbc/spfx-accounting test
pnpm --filter @hbc/spfx-admin test
```
