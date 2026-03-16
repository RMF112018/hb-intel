# MVP Project Setup — Implementation Master Plan

**Plan Version:** 1.1
**Date:** 2026-03-13 (refined 2026-03-13)
**Source Spec:** `MVP-Project-Setup.md` + `HBI_MVP_SharePoint_Provisioning_Blueprint.md` + `HBI_MVP_SharePoint_Provisioning_Roadmap.md`
**Priority Tier:** 1 — MVP Platform Proof (cross-app workflow; shared provisioning engine; leadership proof point)
**Estimated Effort:** 6–8 sprint-weeks (assuming current PH6 foundation remains usable)
**ADR Required:** Yes — create ADR-0114 (or next available) formalizing MVP Project Setup workflow authority, controller trigger semantics, hybrid permission bootstrap model, and admin takeover governance. Required by the Zero-Deviation Rule; must be created before or alongside T01.
> **Doc Classification:** Canonical Normative Plan — implementation master plan for the MVP Project Setup feature; governs `MVP-Project-Setup-T01` through `MVP-Project-Setup-T09`.

---

## Governance Gate

This plan is a feature-expansion phase. Per CLAUDE.md §6.3 and ADR-0085, **no implementation task in this plan set may begin until all of the following are confirmed:**

- [ ] ADR-0091 (Phase 7 Final Verification & Sign-Off) exists on disk and is signed off
- [ ] `pnpm turbo run build` passes with zero errors
- [ ] `pnpm turbo run lint` passes with zero errors
- [ ] `pnpm turbo run check-types` passes with zero TypeScript errors
- [ ] P1 package tests pass at `branches: 95` for all five P1 packages

Confirm ADR-0090 exists before executing T01. If it does not exist, complete PH7.12 sign-off first.

---

## Purpose

This plan converts the MVP feature summary into an implementation-ready plan set that is aligned to:

- the repo's present-truth hierarchy (`current-state-map.md` before historical plans)
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

For automation principals that act on project sites, Microsoft's `Sites.Selected` / selected-scope model is the preferred long-term access posture. Where broader rights are needed at create time, that elevation should be explicit, minimized, and documented.

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
6. **Current implementation bias:** Estimating is already wired to `@hbc/provisioning`; Accounting has no provisioning surface yet.
7. **Platform primitive elevation:** `@hbc/step-wizard`, `@hbc/bic-next-move`, `@hbc/field-annotations`, and `@hbc/notification-intelligence` are Tier-1 Platform Primitives — mandatory use when their concern area is present in a feature (current-state-map §3).
8. **`@hbc/versioned-record` exclusion:** This package is Scaffold-only (v0.0.1). It must not be added as a dependency by any MVP task.

---

## Current-State Validation Summary

### Already present (code-verified)

- Estimating request intake page and request-detail/progress surfaces (basic wiring; see "Still missing" for gaps)
- headless provisioning package (`@hbc/provisioning`) with api-client, state-machine, store, visibility, notification-templates
- backend project request lifecycle API (POST, GET list, PATCH state)
- provisioning saga with 7-step orchestrator, idempotency guards, compensation, retry, and telemetry
- SignalR negotiate and per-project progress push
- Admin `ProvisioningFailuresPage` with Retry/Escalate actions
- `withRetry()` utility in `backend/functions/src/utils/retry.ts`
- Full backend notification pipeline in `backend/functions/src/functions/notifications/` — `SendNotification`, `ProcessNotification`, `channelRouter`, `tierResolver`, `emailDelivery`, `pushDelivery`, `notificationStore`, `preferencesStore` are all scaffolded and more mature than most task plans acknowledge

### Still missing or thin

- `apps/accounting` Controller review-and-trigger surface — **completely absent** (no provisioning pages, no routes, no `@hbc/provisioning` dependency)
- request contract fields for `department`, `currentOwner`, `cancellation`, `reopen`, `retryPolicy`, `takeover`, `clarifications[]`, `siteLaunch`, and richer event history
- `'Draft'` and `'Canceled'` states in `ProjectSetupRequestState`
- `ProvisioningRunState` type and richer `IProvisioningStatus` run-state fields
- `IProvisioningEventRecord` append-only event model
- `IRequestClarification`, `IRequestCancellation`, `IRequestReopenMetadata`, `IRequestRetryPolicy`, `IRequestTakeoverMetadata` types
- hybrid permission bootstrap beyond request members + OpEx (structural owners and department background access missing)
- completion and getting-started launch experience
- business-grade event history and takeover summary semantics in admin recovery surface
- **admin router bug:** `/provisioning-failures` route in `apps/admin` maps to `SystemSettingsPage` instead of `ProvisioningFailuresPage` — must be fixed in T01
- **admin undeclared dependency:** `ProvisioningFailuresPage.tsx` imports from `@hbc/provisioning` but it is not declared in `apps/admin/package.json` — must be fixed in T01
- **state machine duplication:** `packages/provisioning/src/state-machine.ts` and `backend/functions/src/state-machine.ts` are near-identical copies — any state additions in T02 must be applied to both
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
| D-15 | Boundary rule | `@hbc/provisioning` stays headless; reusable UI stays in `@hbc/ui-kit`; `@hbc/step-wizard` is mandatory for multi-step progress rendering |

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
| Ownership / next-move signaling | `packages/bic-next-move` |
| Clarification annotations | `packages/field-annotations` |
| Notifications | `packages/notification-intelligence` + `backend/functions/notifications` pipeline |
| Progress / step rendering | `packages/step-wizard` (mandatory; not optional) |

---

## Recommended Task Sequence

| File | Purpose |
|---|---|
| `MVP-Project-Setup-T01-Scaffold-and-Documentation.md` | fix known defects, align scaffolding, READMEs, path ownership, and package.json dependencies |
| `MVP-Project-Setup-T02-Contracts-and-State-Model.md` | lock request/run/history contracts and lifecycle transitions in models + both state machine files |
| `MVP-Project-Setup-T03-Controller-Gate-and-Request-Orchestration.md` | build the accounting Controller surface from scratch and finish business workflow engine |
| `MVP-Project-Setup-T04-Estimating-Requester-Surfaces.md` | finish intake, clarification, cancel/reopen, retry, and progress UX in Estimating |
| `MVP-Project-Setup-T05-Provisioning-Orchestrator-and-Status.md` | harden saga, async status model, SignalR/poll fallback, idempotency, throttling behavior |
| `MVP-Project-Setup-T06-SharePoint-Template-and-Permissions.md` | implement one-template strategy, department pruning, hybrid access bootstrap, least privilege |
| `MVP-Project-Setup-T07-Admin-Recovery-Notifications-and-Audit.md` | harden failures dashboard, takeover workflow, notifications (via existing backend pipeline), event timeline |
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
- [ ] P1 package tests still pass at `branches: 95` after all MVP changes

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
# P1 gate — must pass at branches: 95 throughout
pnpm turbo run test --filter=@hbc/auth --filter=@hbc/shell --filter=@hbc/sharepoint-docs --filter=@hbc/bic-next-move --filter=@hbc/complexity
```
