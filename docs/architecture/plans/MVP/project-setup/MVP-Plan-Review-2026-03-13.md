# MVP Plan Review — 2026-03-13

> **Doc Classification:** Canonical Current-State — evidence-based architectural review of the MVP Project Setup plan set; informs pre-implementation refinement pass.
>
> **Reviewer:** HB Intel Architecture Review Agent
> **Date:** 2026-03-13
> **Scope:** `docs/architecture/plans/MVP/MVP-Project-Setup-Plan.md` + T01 through T09
> **Authoritative Sources Used:** `current-state-map.md`, `HB-Intel-Blueprint-V4.md`, `hb-intel-foundation-plan.md`, ADR-0083 through ADR-0113, codebase inspection of `packages/`, `apps/`, and `backend/`

---

## MVP Plan Review — Executive Conclusion

The MVP Project Setup plan set is **partially aligned and directionally sound, but materially in need of targeted revision before implementation begins.**

The plans correctly identify the architectural ownership boundaries (headless provisioning in `@hbc/provisioning`, saga in `backend/functions`, UI in `@hbc/ui-kit`), correctly enumerate the shared primitive packages that must be used (`@hbc/bic-next-move`, `@hbc/field-annotations`, `@hbc/step-wizard`, `@hbc/notification-intelligence`), and correctly distinguish request lifecycle state from provisioning run state.

However, the plans contain four categories of material issues that must be corrected before a coding agent should begin implementation:

1. **Undiscovered codebase issues** the plans do not yet surface (admin router bug, admin missing package.json dependency, state machine duplication).
2. **Incomplete package dependency declarations** — `apps/accounting` and `apps/admin` are missing multiple declared dependencies required for their planned surfaces.
3. **A missing governance gate** — the plans do not acknowledge that ADR-0090 (Phase 7 Final Verification & Sign-Off) must exist on disk before any feature-expansion work begins (CLAUDE.md §7, last bullet).
4. **Speculative references** — one path reference in T06 (`packages/auth/src/backend/*`) does not exist, and one T04 wording ("or equivalent") creates ambiguity around mandatory platform-primitive usage.

The plans are **not safe to hand directly to a coding agent without the refinement pass described in this review**.

---

## Governing Constraints

The following locked constraints from CLAUDE.md, `current-state-map.md`, Blueprint V4, and the ADR catalog govern any work against these plans.

**From CLAUDE.md §1:**
- Read-First Rule: all four locked sources must be confirmed read before any action.
- Zero-Deviation Rule: deviations from blueprint, current-state-map, and active ADRs require a superseding ADR.
- Document Classification Rule: every new file must declare one of the six permitted classes.
- Guarded Commit Rule: `pnpm guarded:commit` is the only permitted commit mechanism.
- UI Ownership Rule: all reusable visual components must be owned by `@hbc/ui-kit`. No exception without an ADR.

**From CLAUDE.md §6.3 (Phase 7 Governance):**
- ADR-0083 through ADR-0090 are permanently binding.
- ADR-0090 must exist on disk and be signed off **before any feature-expansion phase begins.**
- The four mechanical enforcement gates (build, lint, type-check, P1 tests) must pass before any phase is considered complete.
- PH7-RM-* plans (Deferred Scope) may not be activated without reclassification.

**From `current-state-map.md` (Tier 1 — governs present truth):**
- `@hbc/versioned-record` is Scaffold-only (v0.0.1). Not implementation-ready.
- `@hbc/step-wizard`, `@hbc/bic-next-move`, `@hbc/field-annotations`, `@hbc/notification-intelligence` are Complete (v0.1.0 or v0.0.1 with full implementation).
- `apps/accounting` is Scaffold-only (no provisioning routes or controller surface).
- Category C packages (SF01–SF15) are Tier-1 Platform Primitives — **mandatory use** when their concern area is present. Non-duplication enforced.

**From ADR-0085 (Test Governance):**
- P1 workspace: `@hbc/auth`, `@hbc/shell`, `@hbc/sharepoint-docs`, `@hbc/bic-next-move`, `@hbc/complexity`.
- `branches: 95` maintained across all P1 packages.

**From ADR-0015 (Blueprint §3d assumed) / ADR-0084:**
- `@hbc/provisioning` owns headless logic only. No UI components.
- `backend/functions` owns saga orchestration, status persistence, SignalR emission, timer-deferred work.

---

## Current-State Validation Summary

### Confirmed Present (code-verified)

| Component | Evidence | Assessment |
|-----------|----------|------------|
| `apps/estimating` provisioning pages | `NewRequestPage.tsx`, `ProjectSetupPage.tsx`, `RequestDetailPage.tsx`, router routes | Partially wired; missing department, cancel/reopen, clarification, retry, completion UX |
| `@hbc/provisioning` headless package | `api-client.ts`, `state-machine.ts`, `store.ts`, `visibility.ts`, `notification-templates.ts` | Present; missing new contract fields and states |
| Backend provisioning saga (7 steps) | `saga-orchestrator.ts`, `step1-create-site.ts` through `step7-hub-association.ts` | Present; idempotency and retry logic in place; step6 permissions thin |
| Backend project requests API | `projectRequests/index.ts` — POST, GET list, PATCH state | Present; missing GET single, cancel, reopen, event history, department validation, uniqueness check |
| Backend SignalR negotiate | `signalr/index.ts` | Present |
| Backend timerFullSpec | `timerFullSpec/handler.ts` | Present (step5 deferred web-parts path) |
| Backend notifications functions | Full set: channelRouter, tierResolver, emailDelivery, pushDelivery, notificationStore, preferencesStore | **More mature than plans acknowledge** — full channel routing, tier resolution, email delivery already implemented |
| `backend/functions/src/state-machine.ts` | Duplicates `packages/provisioning/src/state-machine.ts` | State machine is **duplicated across both packages** — both must be updated together |
| `apps/admin` ProvisioningFailuresPage | `ProvisioningFailuresPage.tsx` — shows failed runs, Retry/Escalate actions | Present but thin; no takeover semantics, no business-readable summaries, no event timeline |
| `@hbc/bic-next-move` v0.1.0 | Complete per current-state-map; `components/`, `hooks/`, `registry/`, `transfer/`, `types/` | Implementation-ready |
| `@hbc/step-wizard` v0.1.0 | Complete per current-state-map; `components/`, `hooks/`, `state/`, `types/` | Implementation-ready |
| `@hbc/field-annotations` v0.1.0 | Complete per current-state-map; `api/`, `components/`, `hooks/`, `types/` | Implementation-ready |
| `@hbc/notification-intelligence` v0.0.1 | Complete per current-state-map; `api/`, `components/`, `hooks/`, `registry/`, `types/` | Implementation-ready |
| `@hbc/ui-kit` v2.1.0 | Complete; 8+ components, Storybook, Griffel theme | Implementation-ready |
| `backend/functions/src/utils/retry.ts` | `withRetry()` utility — `maxAttempts`, `baseDelayMs` | Present |

### Confirmed Missing or Incomplete

| Component | Gap | Risk Level |
|-----------|-----|-----------|
| `apps/accounting` Controller surface | **Completely absent** — no provisioning pages, no routes, no `@hbc/provisioning` dependency | **Critical — T03 highest risk** |
| `IProjectSetupRequest` fields | Missing: `department`, `currentOwner`, `projectNumberValidationState`, `clarifications[]`, `cancellation`, `reopen`, `retryPolicy`, `takeover`, `siteLaunch` | High |
| `ProjectSetupRequestState` | Missing: `'Draft'` and `'Canceled'` states | High |
| `ProvisioningRunState` type | Does not exist | High |
| `IProvisioningStatus` fields | Missing: `runState`, `lastSuccessfulStep`, `retryEligible`, `isPollingFallbackRequired`, `throttleBackoffUntilIso`, `statusResourceVersion`, `statusUpdatedAtIso` | High |
| `IProvisioningAuditRecord` | Only 3 events (`Started | Completed | Failed`); no granular event model | High |
| New contract types | `IRequestClarification`, `IRequestCancellation`, `IRequestReopenMetadata`, `IRequestRetryPolicy`, `IRequestTakeoverMetadata`, `IProvisioningEventRecord`, `ProjectDepartment` — none exist | High |
| State machine `'Canceled'` transitions | Neither `packages/provisioning/src/state-machine.ts` nor `backend/functions/src/state-machine.ts` has `'Canceled'` as a target or source | High |
| api-client operations | Missing: cancel, reopen, takeover, clarification-resolution, event history, GET single request | High |
| Backend endpoints | Missing: GET single request, cancel, reopen, event history, department validation, project number uniqueness check | High |
| `apps/admin` package.json dependency | `@hbc/provisioning` is used in `ProvisioningFailuresPage.tsx` but **not declared** in `apps/admin/package.json` | Medium-High |
| `apps/admin` router bug | `/provisioning-failures` route maps to `SystemSettingsPage` instead of `ProvisioningFailuresPage` | Medium-High |
| `apps/admin` takeover semantics | `ProvisioningFailuresPage` has only Retry/Escalate buttons; no ownership transfer, no business-readable summaries, no event timeline | Medium |
| Hybrid permission bootstrap | Step6 only provisions `groupMembers + OPEX_UPN`; no structural owners, no department background access | Medium |
| Department-based pruning in saga | No department logic in any provisioning step | Medium |
| Getting-started landing experience | Not implemented | Medium |
| Completion metadata surfacing | No `siteLaunch` in contract; no completion details surfaced to Estimating | Medium |
| `apps/estimating` missing UI | No department field, cancel/reopen actions, clarification resolution, retry, completion UX | Medium |
| Retry policy enforcement | Backend saga `retry()` method does not check or enforce max-1-requester-retry rule | Medium |
| Project number uniqueness check | No server-side duplicate detection in `advanceState` | Medium |
| `@hbc/provisioning` in `apps/admin/package.json` | Import exists in code, undeclared in manifest | Medium |
| `@hbc/versioned-record` maturity | Scaffold only — plans correctly don't rely on it, but should explicitly confirm this exclusion | Low |
| ADR-0090 gate | Master plan doesn't acknowledge the PH7.12 sign-off requirement | Medium |

---

## Dependency and Boundary Review

### `@hbc/provisioning`

| Attribute | Status |
|-----------|--------|
| **Intended use in plans** | Headless shared package — api-client, state-machine, store, hooks, notification-templates, visibility; consumed by Estimating, Accounting, Admin |
| **Actual maturity** | Implemented (complete for PH6 scope); needs new states, fields, and operations for MVP scope |
| **Responsibility assignment** | Correct — headless logic, no visual components |
| **Boundary compliance** | Correct — D-15 honored; `@hbc/ui-kit` owns visuals |
| **Corrections needed** | T02 must also update `backend/functions/src/state-machine.ts` (duplicate); T01 must add `@hbc/provisioning` to `apps/admin/package.json` and `apps/accounting/package.json` |

### `@hbc/models`

| Attribute | Status |
|-----------|--------|
| **Intended use in plans** | Source-of-truth for all request/run/history contracts |
| **Actual maturity** | Has `provisioning/` subfolder — `IProjectSetupRequest`, `IProvisioningStatus`, `ISagaStepResult`, `IProvisioningProgressEvent`, `IProvisioningAuditRecord`, `ProjectSetupRequestState` |
| **Gap vs. plan** | T02 adds 7 new types and extends 3 existing interfaces — this work is correctly scoped to models |
| **Corrections needed** | None in ownership; T02 scope is correct |

### `@hbc/step-wizard`

| Attribute | Status |
|-----------|--------|
| **Intended use in plans** | Progress / step rendering for Estimating's `RequestDetailPage` |
| **Actual maturity** | Complete (v0.1.0); implementation-ready |
| **Boundary compliance** | Correct — Tier-1 Platform Primitive; T04 mandates use |
| **Risk** | T04 says "use `@hbc/step-wizard` or equivalent step projection" — the platform primitive elevation rule (current-state-map §3, ADR-0093) means this is **not optional**. The wording "or equivalent" introduces ambiguity that a coding agent could misuse to re-implement app-local step logic. |
| **Corrections needed** | T04 must change "or equivalent" to a mandatory directive. The existing app-local `ProvisioningChecklist` must be either (a) replaced by `@hbc/step-wizard` composition or (b) its rendering logic migrated to `@hbc/ui-kit` as a reusable component. |

### `@hbc/bic-next-move`

| Attribute | Status |
|-----------|--------|
| **Intended use in plans** | Owner/next-move signaling derived from lifecycle state |
| **Actual maturity** | Complete (v0.1.0); implementation-ready with module registry and transfer detection |
| **Boundary compliance** | Correct — T03 specifies BIC projections derived from lifecycle truth, not app-invented |
| **Corrections needed** | None in ownership. T01 must add `@hbc/bic-next-move` to `apps/estimating/package.json`, `apps/accounting/package.json`, and `apps/admin/package.json`. |

### `@hbc/field-annotations`

| Attribute | Status |
|-----------|--------|
| **Intended use in plans** | Clarification request/resolution UX — field-level annotation threads |
| **Actual maturity** | Complete (v0.1.0); `api/`, `components/`, `hooks/`, `types/` all present |
| **Boundary compliance** | Correct — T03 correctly routes clarification threading to this package |
| **Corrections needed** | None in ownership. T01 must add `@hbc/field-annotations` to `apps/estimating/package.json` and `apps/accounting/package.json`. |

### `@hbc/notification-intelligence`

| Attribute | Status |
|-----------|--------|
| **Intended use in plans** | Notification routing in T07 |
| **Actual maturity** | Complete (v0.0.1); full channel routing, tier resolution, hooks, registry. Backend notification function set also complete. |
| **Risk** | T07 treats notifications as if building from a near-blank slate, but the backend already has a sophisticated notification infrastructure (channelRouter, tierResolver, emailDelivery, pushDelivery, preference store). The plan must explicitly inventory what already exists and clarify which parts of the new MVP notification routing will wire into the existing backend notifications function vs. build new paths. |
| **Corrections needed** | T07 must be revised to acknowledge the existing backend notifications infrastructure and specify how MVP lifecycle notification events integrate with the already-implemented `SendNotification`/`ProcessNotification` function chain. |

### `@hbc/versioned-record`

| Attribute | Status |
|-----------|--------|
| **Intended use in plans** | Not referenced in MVP plans — correct omission |
| **Actual maturity** | Scaffold (v0.0.1) — not implementation-ready |
| **Assessment** | Plans correctly avoid this dependency. Should be explicitly noted as excluded from MVP scope. |

### `@hbc/ui-kit`

| Attribute | Status |
|-----------|--------|
| **Intended use in plans** | Reusable progress, alert, summary, drawer, and status components |
| **Actual maturity** | Complete (v2.1.0); `HbcButton`, `HbcDataTable`, `HbcStatusBadge`, `WorkspacePageShell`, `HbcFormSection`, `HbcTextField`, `HbcSelect`, `HbcPeoplePicker`, etc. |
| **Boundary compliance** | Plans correctly enforce UI ownership in T04 and T07. Risk: app-local `ProvisioningChecklist` may need migration. |
| **Corrections needed** | T01 or T04 must explicitly determine whether `ProvisioningChecklist` is an app-specific composition shell (acceptable) or a reusable visual primitive (must move to ui-kit). |

### `backend/functions` (provisioning saga, project requests, notifications, SignalR, timerFullSpec)

| Attribute | Status |
|-----------|--------|
| **Intended use in plans** | Saga execution, status persistence, SignalR push, timer-deferred step5, request lifecycle APIs |
| **Actual maturity** | Saga: present with 7 steps, idempotency, compensation, retry, telemetry. Requests API: partial. Notifications: **more mature than plans acknowledge.** |
| **Responsibility assignment** | Correct — T05 and T06 correctly own saga hardening in backend/functions |
| **Corrections needed** | T05 must clarify that the backend `retry()` method needs a max-requester-retry enforcement guard. T06's path reference `packages/auth/src/backend/*` is invalid — must be corrected to `backend/functions/src/services/` or a real path. T07 must acknowledge the existing backend notification infrastructure. |

### `apps/accounting` (Controller surface)

| Attribute | Status |
|-----------|--------|
| **Intended use in plans** | Controller review inbox, request detail, Finish Setup trigger — the decisive gate |
| **Actual maturity** | **Scaffold only** — has `BudgetsPage`, `InvoicesPage`, `OverviewPage` for financial data. Zero provisioning pages, zero routes, zero `@hbc/provisioning` dependency. |
| **Risk** | T03 is the highest-risk task in the plan set because it must create the Controller surface essentially from scratch. The plan underestimates this effort. |
| **Corrections needed** | T03 must more explicitly scope the full accounting app setup work: new pages, new routes, new package.json dependencies, new router entries. The effort estimate of 1.2 sprint-weeks may be optimistic. |

### `apps/admin` (recovery surface)

| Attribute | Status |
|-----------|--------|
| **Intended use in plans** | Failure dashboard, takeover workflow, event timeline |
| **Actual maturity** | Partial — `ProvisioningFailuresPage` exists with retry/escalate, but `@hbc/provisioning` is undeclared in package.json and the provisioning route maps to the wrong page (SystemSettingsPage). |
| **Corrections needed** | T01 must surface and fix: (1) add `@hbc/provisioning` to `apps/admin/package.json`; (2) fix `/provisioning-failures` route to render `ProvisioningFailuresPage`. |

---

## Plan File Assessment

### `MVP-Project-Setup-Plan.md` (Master Plan)

**Correct:**
- Purpose, scope, and "narrow one proof" framing are well-calibrated for MVP.
- Locked decisions D-01 through D-15 are internally consistent and well-reasoned.
- Research rules R-01 through R-08 are grounded in current Microsoft guidance.
- Package/app ownership map is architecturally correct.
- Definition of Done is comprehensive.
- Current-state validation summary (§ "Already present" / "Still missing") is mostly accurate.

**Weak / Speculative:**
- Does not acknowledge ADR-0090 gate (CLAUDE.md §6.3 — "No feature-expansion phase may begin until PH7.12 acceptance criteria are fully satisfied and ADR-0090 exists on disk").
- "Already present" section lists "backend request lifecycle APIs" and "Admin failed-runs page with retry/escalate actions" — both are true but omit the `@hbc/provisioning` undeclared dependency in admin and the admin router bug.
- "Still missing" section does not list: state machine duplication problem, admin router bug, admin missing package.json dependency.

**Missing:**
- No explicit reference to ADR-0090 gate condition.
- No acknowledgment that `backend/functions` has more mature notification infrastructure than the plan's framing implies.
- No note on state machine duplication (backend + provisioning package copies).
- Verification envelope uses `@hbc/spfx-estimating`, `@hbc/spfx-accounting`, `@hbc/spfx-admin` — these match actual package names (confirmed). `@hbc/functions` also confirmed correct.

---

### `MVP-Project-Setup-T01-Scaffold-and-Documentation.md`

**Correct:**
- File path scope is accurate and comprehensive.
- "Correct package dependency drift" section identifies the accounting and admin dependency gaps.
- README minimum content requirements are solid.

**Missing — critical items T01 must also capture:**
1. **Admin router bug:** The `/provisioning-failures` route in `apps/admin/src/router/routes.ts` maps to `SystemSettingsPage` instead of `ProvisioningFailuresPage`. This must be corrected in T01 (it is a scaffold wiring error, not a feature).
2. **Admin `@hbc/provisioning` undeclared dependency:** `ProvisioningFailuresPage.tsx` imports from `@hbc/provisioning` but it is not in `apps/admin/package.json`. This is an existing defect.
3. **State machine duplication:** `packages/provisioning/src/state-machine.ts` and `backend/functions/src/state-machine.ts` are near-identical duplicates. Any state addition (adding `Canceled`, `Draft`) must be applied to both. T01 must document this constraint so T02 does not inadvertently diverge them.
4. **Dependency additions needed in T01:**
   - `apps/admin/package.json`: add `@hbc/provisioning`
   - `apps/accounting/package.json`: add `@hbc/provisioning`, `@hbc/bic-next-move`, `@hbc/field-annotations`, `@hbc/step-wizard`, `@hbc/notification-intelligence`
   - `apps/estimating/package.json`: add `@hbc/bic-next-move`, `@hbc/field-annotations`, `@hbc/step-wizard`
5. **ADR required:** T01 should note that an MVP Project Setup ADR should be created (the master plan calls this "Recommended" — in practice, it is required by the Zero-Deviation Rule since this introduces new lifecycle states, contracts, and a new workflow trigger authority).
6. **`ProvisioningChecklist` disposition:** Clarify whether `apps/estimating/src/components/ProvisioningChecklist.tsx` is a feature-local composition shell (acceptable) or a reusable visual primitive (must move to `@hbc/ui-kit`). This must be decided before T04 begins.

**Verification commands to add:**
```bash
# Confirm admin router wires ProvisioningFailuresPage correctly
grep -n "ProvisioningFailuresPage\|provisioning-failures" apps/admin/src/router/routes.ts
# Confirm @hbc/provisioning declared in admin
grep "@hbc/provisioning" apps/admin/package.json
# Confirm accounting deps
grep -E "@hbc/provisioning|bic-next-move|field-annotations|step-wizard|notification-intelligence" apps/accounting/package.json
```

---

### `MVP-Project-Setup-T02-Contracts-and-State-Model.md`

**Correct:**
- Contract additions are comprehensive and well-specified.
- `IProjectSetupRequest` additions cover all required fields.
- `IProvisioningStatus` additions cover all required run-state fields.
- Model guarantees (separate state/run-state, explicit retry eligibility, append-only history) are correct.
- State transition rules are complete and internally consistent.
- `ProjectDepartment` type is correctly scoped as lean for MVP.

**Missing — must add:**
1. **State machine duplication instruction:** T02 must explicitly instruct the agent to update `backend/functions/src/state-machine.ts` in addition to `packages/provisioning/src/state-machine.ts`. The two files are currently near-identical; without explicit guidance, an agent will update only one.
2. **`IProvisioningEventRecord` event categories extension:** T02 defines 12 event categories. The current `IProvisioningAuditRecord` has only `Started | Completed | Failed`. The plan should clarify whether the old `IProvisioningAuditRecord` is replaced by `IProvisioningEventRecord` or coexists (backward-compatibility concern).
3. **`IProjectSetupRequest.currentOwner` derivation:** The field is listed as required, but no derivation rule is specified. T02 should specify the derivation function signature (e.g., `deriveCurrentOwner(state, takeover): string`) and document where it lives (`@hbc/provisioning`).
4. **`Canceled` in state machine:** T02 transition rules add `Canceled` as a target state (rules 3, 4, 5, 6) but do not add it as a source state with explicit "reopen only" semantics. `STATE_TRANSITIONS['Canceled']` must be `[]` (no automatic transitions).

**Weak:**
- Verification commands reference `pnpm --filter @hbc/models test -- provisioning` — if models has no test file for provisioning types yet, this test command will fail vacuously. Should be made conditional or expanded to include type contract validation tests.

---

### `MVP-Project-Setup-T03-Controller-Gate-and-Request-Orchestration.md`

**Correct:**
- Controller workflow requirements (inbox, detail, Finish Setup trigger) are well-specified.
- Project-number validation rules are concrete.
- Backend orchestration idempotency requirements are correct.
- `@hbc/bic-next-move` integration rules are accurate.
- `@hbc/field-annotations` clarification rules are correct.

**Missing — must add:**
1. **Accounting app creation scope:** T03 must explicitly enumerate the new pages and routes needed in `apps/accounting`:
   - `apps/accounting/src/pages/ControllerInboxPage.tsx` (request queue)
   - `apps/accounting/src/pages/ControllerReviewPage.tsx` (request detail)
   - Route additions in `apps/accounting/src/router/routes.ts`
2. **Project number uniqueness check:** T03 mentions "check uniqueness before allowing `ReadyToProvision -> Provisioning`" but the backend `advanceState` handler currently has NO uniqueness check — only format validation. T03 must explicitly add a uniqueness-check step to the backend.
3. **`triggeredBy` identity source:** T03 mentions "triggered by validated identity, not client payload" — this is correct and already implemented for submitter identity. The Finish Setup trigger must also enforce this (Controller identity from token, not from client body).
4. **Accounting app effort underestimation:** The entire accounting provisioning surface is missing. 1.2 sprint-weeks is likely underestimated for building an inbox, review detail, full BIC integration, field annotation UX, and Finish Setup trigger from scratch.

---

### `MVP-Project-Setup-T04-Estimating-Requester-Surfaces.md`

**Correct:**
- `NewRequestPage` additions (department, project location) are accurate.
- Lifecycle visibility requirements are correct.
- Action requirements (cancel, reopen, clarification, retry, completion) are well-specified.
- Completion UX handoff requirements are correct.
- The instruction "reusable progress, alert, summary, and drawer components belong in `@hbc/ui-kit`" is correct.

**Weak — must revise:**
1. **"use `@hbc/step-wizard` or equivalent"** — this wording must be changed to a mandate. Per platform-primitive elevation rules (current-state-map §3, ADR-0093), `@hbc/step-wizard` is the canonical multi-step guided workflow primitive and must be used when its concern area is present. "Or equivalent" grants permission to invent app-local step logic, which would violate the non-duplication rule.
2. **`ProvisioningChecklist` disposition:** T04 must confirm what happens to the existing `apps/estimating/src/components/ProvisioningChecklist.tsx`. If it is replaced by `@hbc/step-wizard` composition, it must be removed. If it is promoted to a reusable component, it must move to `@hbc/ui-kit`.

**Missing:**
- Explicit path for cancel/reopen — `apps/estimating/src/pages/RequestDetailPage.tsx` needs specific action additions listed.
- Explicit note that `apps/estimating/package.json` needs `@hbc/bic-next-move`, `@hbc/field-annotations`, `@hbc/step-wizard` added (T01 should do this, but T04 should reference it as a prerequisite).

---

### `MVP-Project-Setup-T05-Provisioning-Orchestrator-and-Durable-Status.md`

**Correct:**
- Async workflow contract (trigger → immediate status resource → async execution) is correct.
- Status behavior requirements (SignalR + durable polling, stable step count, retry eligibility, site URL) are correct.
- Idempotency requirements are comprehensive and correctly mapped.
- Retry/backoff rules are sound.
- Throttling and concurrency rules are correct.
- SignalR/poll fallback rules are correct.

**Weak:**
1. **Retry policy enforcement gap:** The current `SagaOrchestrator.retry()` method in `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts` does not check `retryCount` against any maximum. It simply increments and re-executes. T05 must explicitly require that the backend enforces the max-1-requester-retry policy from `IRequestRetryPolicy.maxRequesterRetries`, marking `secondFailureEscalated = true` on the second failure and preventing further user-initiated retries.
2. **Status resource versioning:** T05 introduces `statusResourceVersion` and `statusUpdatedAtIso` in `IProvisioningStatus` (from T02). T05 should specify how these fields are populated in the saga orchestrator (increment on every upsert).
3. **`isPollingFallbackRequired` flag:** How is this determined and set? T05 should specify the condition (e.g., SignalR negotiate fails, client is not subscribed, or status is explicitly requested via polling).

**Missing:**
- T05 does not reference the existing `backend/functions/src/utils/retry.ts` (`withRetry` utility). It should confirm this utility is used and specify whether its `maxAttempts: 3, baseDelayMs: 2000` parameters are sufficient or need tuning for MVP.
- T05 does not address the `Retry-After` header parsing — the backend retry utility currently uses simple exponential backoff without `Retry-After` header honors. T05 should require this.

---

### `MVP-Project-Setup-T06-SharePoint-Template-and-Permissions.md`

**Correct:**
- One-template strategy with department-based library pruning is well-specified.
- Native-vs-custom rule is correct.
- Hybrid permission bootstrap (project team + structural owners + department background access) is well-specified.
- Governance rules (default deny, least-privilege, Sites.Selected aspiration) are correct.
- Technical implementation rules (deduplicated idempotent permission writes, recoverable failures) are correct.

**Wrong — must fix:**
1. **`packages/auth/src/backend/*`** in the Required Paths section — **this path does not exist.** The packages directory has `packages/auth/` which is the frontend auth package. Backend auth/identity work lives in `backend/functions/src/middleware/validateToken.ts` and `backend/functions/src/services/msal-obo-service.ts`. The correct path reference should be `backend/functions/src/services/*` or `backend/functions/src/middleware/*`.

**Missing:**
1. **Explicit step6 expansion:** The current `step6-permissions.ts` only does `groupMembers + OPEX_UPN`. T06 must explicitly enumerate that step6 needs to expand to: (1) project team members, (2) structural owners (OpEx manager + required admin principals), (3) department background access set. The step-by-step logic for selecting these sets based on `department` and a configuration source must be specified.
2. **Department pruning step:** Which saga step handles removing the non-applicable department library? T06 should assign this to an existing step (likely step2 or step3) or name it as a new sub-step.
3. **Permission idempotency verification:** T06 correctly requires idempotent permission writes but does not specify the check — a SharePoint group membership check before assignment to avoid duplicate entries.

---

### `MVP-Project-Setup-T07-Admin-Recovery-Notifications-and-Audit.md`

**Correct:**
- Admin recovery requirements (failure dashboard, retry from checkpoint, mark-resolved criteria) are well-specified.
- Takeover semantics (ownership record, actor/timestamp/reason, visibility to requester and Controller) are correct.
- Audit/event timeline requirements are comprehensive.
- Required notification events (8 routing targets) are correct.
- "Notification content must remain business-readable with direct deep links" is correct.

**Weak — must revise:**
1. **Existing backend notification infrastructure not acknowledged:** The backend already has a complete notification pipeline: `SendNotification`, `ProcessNotification`, `channelRouter`, `tierResolver`, `emailDelivery`, `pushDelivery`, `notificationStore`, `preferencesStore`. T07 must acknowledge this and specify whether new MVP lifecycle notifications (request-submitted → Controller, clarification-requested → requester, etc.) will: (a) route through the existing `SendNotification` endpoint/channelRouter, or (b) be handled via a separate thin notification handler. Without clarity here, the coding agent may duplicate infrastructure or bypass the existing notification tier resolver.
2. **`packages/provisioning/src/notification-templates.ts`** — this file already exists with 5 templates. T07's implicit expansion of notification coverage must explicitly extend this file, not replace it.

**Missing:**
1. **Admin route fix prerequisite:** T07 depends on `ProvisioningFailuresPage` being accessible. The admin router bug (route maps to `SystemSettingsPage`) must be fixed in T01 before T07 work begins. T07 should include a prerequisite note.
2. **Event history storage specification:** T07 asks for an append-only event model but does not specify where events are persisted. Are they stored in Azure Table Storage (same pattern as `IProvisioningStatus`)? Or in a separate SharePoint list (like the existing `IProvisioningAuditRecord` SharePoint list)? This must be specified before T07 implementation begins.

---

### `MVP-Project-Setup-T08-Completion-and-Getting-Started.md`

**Correct:**
- Request-side completion surface requirements are correct.
- Getting-started landing content requirements are appropriately lean.
- UX requirements ("usable now" vs "fully decorated later") are correct.
- Template/content rules (idempotent page provisioning step) are correct.

**Weak:**
- T08 depends on T05 (durable status), T06 (site URL is available), T07 (event history), but does not depend on T04 (Estimating completion UX). This should be explicit since the completion surface appears in Estimating's `RequestDetailPage`.
- `SharePoint template assets / provisioning content definitions` in Required Paths is vague. T08 should name the specific saga step that provisions the getting-started page (likely a sub-step of step3-template-files or a new step8).

**Missing:**
- No specification of what `siteLaunch.gettingStartedPageUrl` is populated to — needs a URL pattern (relative to siteUrl? absolute?).
- No specification for the "deferred work still pending" messaging trigger — when does the UI distinguish "BaseComplete" from "Completed" at the frontend?

---

### `MVP-Project-Setup-T09-Testing-Operations-and-Pilot-Release.md`

**Correct:**
- Test matrix is comprehensive and well-organized.
- The 9 end-to-end workflow scenarios cover all important paths including throttling simulation.
- Operational readiness requirements (metrics, runbooks) are well-specified.
- Pilot gate criteria are concrete and appropriate.

**Weak:**
1. **Verification commands use `@hbc/spfx-accounting test --coverage`** — but at T09 time, this package must have been created from scratch (no provisioning tests existed before T03). The coverage command is correct structurally but there is no minimum coverage threshold specified for the new MVP packages. T09 should specify the coverage threshold (branches: 80 minimum for new MVP packages, consistent with platform standard).
2. **P1 package test requirement missing:** T09 should explicitly require that P1 package tests (`@hbc/auth`, `@hbc/shell`, `@hbc/bic-next-move`, `@hbc/sharepoint-docs`, `@hbc/complexity`) still pass at `branches: 95` after all MVP changes — the mechanical gate from ADR-0085.

**Missing:**
- No runbook outline or template is provided. T09 lists required runbooks but should provide a minimum structure (headings/sections) that each runbook must contain.
- No specification of observability tooling (Application Insights event names to validate, specific metrics dashboards).

---

## Cross-Check Against Implemented Packages

| Package | Plans Use Correctly? | Maturity Confirmed? | Dependency Declared? | Notes |
|---------|---------------------|---------------------|---------------------|-------|
| `@hbc/models` (provisioning) | ✅ Yes | ✅ Present; thin contracts | ✅ Declared in all relevant packages | T02 adds required types |
| `@hbc/provisioning` | ✅ Yes | ✅ Present; needs extensions | ✅ Estimating only — missing Admin and Accounting | T01 must add to admin and accounting |
| `@hbc/ui-kit` | ✅ Yes | ✅ Complete | ✅ All apps | ProvisioningChecklist disposition TBD |
| `@hbc/bic-next-move` | ✅ Yes | ✅ Complete | ❌ Not in estimating, accounting, admin | T01 must add |
| `@hbc/step-wizard` | ⚠️ Ambiguous wording | ✅ Complete | ❌ Not in estimating, accounting, admin | T04 wording must be hardened to a mandate |
| `@hbc/field-annotations` | ✅ Yes | ✅ Complete | ❌ Not in estimating, accounting | T01 must add |
| `@hbc/notification-intelligence` | ✅ Yes | ✅ Complete | ❌ Not in estimating, accounting, admin | T01 must add; T07 must acknowledge existing backend pipeline |
| `@hbc/versioned-record` | ✅ Not referenced (correct) | ⚠️ Scaffold only | N/A | Should be explicitly excluded in T01 notes |
| `backend/functions` notifications | ⚠️ Underacknowledged | ✅ More complete than plans state | N/A | T07 must inventory and integrate |
| `backend/functions` state-machine | ❌ Not mentioned as duplicate | ✅ Present (duplicate) | N/A | T02 must update both copies |

---

## Refinement Recommendations

### Keep

- All 15 Locked Decisions (D-01 through D-15) — well-calibrated for MVP.
- All 8 Research Rules (R-01 through R-08) — grounded in real Microsoft guidance.
- Definition of Done in master plan — comprehensive.
- T02 contract additions — complete and well-structured.
- T05 idempotency and async workflow contract — correct.
- T09 test matrix and 9 end-to-end scenarios — keep as-is.
- Package/app ownership map — correct.

### Revise

| Item | Revision Required |
|------|-----------------|
| Master plan "Already present" / "Still missing" | Add: admin router bug, admin undeclared dependency, state machine duplication, existing backend notifications infrastructure |
| Master plan — governance gate | Add explicit acknowledgment of ADR-0090 pre-condition |
| T01 — dependency drift section | Expand to include all missing package.json entries for all three apps (admin, accounting, estimating) |
| T01 — verification commands | Add checks for admin router correctness and new package.json dependencies |
| T02 — state machine update instruction | Explicitly require updating both `packages/provisioning/src/state-machine.ts` AND `backend/functions/src/state-machine.ts` |
| T02 — `Canceled` as source state | Add `STATE_TRANSITIONS['Canceled'] = []` and reopen semantics |
| T02 — `currentOwner` derivation | Specify the derivation function and its home |
| T03 — accounting app creation scope | Enumerate new pages, routes, and dependencies explicitly |
| T03 — project number uniqueness check | Add explicit backend uniqueness-check step |
| T04 — step-wizard wording | Change "or equivalent" to a mandate; address ProvisioningChecklist disposition |
| T05 — retry policy enforcement | Explicitly require max-1-requester-retry gate in backend saga retry path |
| T05 — `withRetry` utility | Reference existing utility and confirm Retry-After header handling |
| T06 — path references | Fix `packages/auth/src/backend/*` → `backend/functions/src/services/*` |
| T06 — step6 expansion | Enumerate the three permission access sets explicitly |
| T06 — department pruning assignment | Assign to a specific saga step |
| T07 — existing backend notifications | Add inventory section; specify integration path with existing notification pipeline |
| T07 — event history storage | Specify where `IProvisioningEventRecord` items are persisted |
| T07 — admin route prerequisite | Add note that T01 admin router fix is a prerequisite |
| T08 — completion dependencies | Add T04 as explicit dependency |
| T08 — getting-started page URL | Specify URL pattern |
| T09 — coverage thresholds | Specify minimum coverage for new MVP packages |
| T09 — P1 package test requirement | Add explicit P1 gate check |

### Remove

Nothing should be removed from the current plan set. The scope, decisions, and requirements are appropriate.

### Add

| Item | Where |
|------|-------|
| ADR-0090 gate acknowledgment | Master plan, before "Recommended Task Sequence" |
| Explicit ADR requirement (not "Recommended") | Master plan |
| Admin router bug fix | T01 |
| `@hbc/versioned-record` explicit exclusion note | T01 |
| State machine duplication warning + dual-update instruction | T01 and T02 |
| ProvisioningChecklist disposition decision | T01 |
| Package.json additions table (all three apps) | T01 |
| `deriveCurrentOwner()` function spec | T02 |
| Backward-compat note for `IProvisioningAuditRecord` vs `IProvisioningEventRecord` | T02 |
| New accounting pages enumeration | T03 |
| Existing backend notification infrastructure inventory | T07 |
| Runbook minimum structure template | T09 |

### Resequence

No resequencing recommended. T01 → T02 → T03 → T04 → T05 → T06 → T07 → T08 → T09 is the correct order. However, T03 and T04 have no direct code dependency on each other (both depend on T02). They could run in parallel if two agents are available, but sequentially is safer given the shared models.

---

## Proposed Plan Enhancement Roadmap

The following describes the order in which the plan files themselves should be revised before a coding agent begins implementation.

### Pass 1 — Governance and Gate Fixes (30 minutes)

1. **Master plan:** Add ADR-0090 gate acknowledgment before "Recommended Task Sequence." Upgrade "ADR Recommended" to "ADR Required."
2. **Master plan "Still missing" section:** Add: admin router bug, admin undeclared dependency, state machine duplication, existing backend notifications infrastructure.

### Pass 2 — T01 Expansion (45 minutes)

1. Add explicit package.json dependency additions table for all three apps.
2. Add admin router bug fix requirement with verification command.
3. Add state machine duplication warning and dual-update constraint.
4. Add `ProvisioningChecklist` disposition decision requirement.
5. Add `@hbc/versioned-record` explicit exclusion note.
6. Expand verification commands.

### Pass 3 — T02 Precision (30 minutes)

1. Add explicit instruction to update both state machine files.
2. Add `Canceled` as a source state with `[]` transitions and reopen-only semantics.
3. Specify `deriveCurrentOwner()` function signature and home.
4. Add backward-compatibility note for `IProvisioningAuditRecord`.

### Pass 4 — T03 Scope Expansion (30 minutes)

1. Enumerate new accounting pages and routes explicitly.
2. Add project number uniqueness check requirement in backend.
3. Revise effort estimate with a note that accounting app creation is a significant sub-task.

### Pass 5 — T04 Wording Fix (15 minutes)

1. Change "or equivalent" to a mandatory `@hbc/step-wizard` directive.
2. Add `ProvisioningChecklist` disposition resolution (or defer to T01 decision point).

### Pass 6 — T05 and T06 Technical Fixes (30 minutes)

1. T05: Add max-1-requester-retry enforcement requirement. Add `Retry-After` header requirement. Reference `withRetry` utility.
2. T06: Fix `packages/auth/src/backend/*` path reference. Enumerate three permission access sets explicitly. Assign department pruning to a specific step.

### Pass 7 — T07 Notifications Alignment (30 minutes)

1. Add existing backend notification infrastructure inventory.
2. Specify integration path (route through existing `SendNotification`/channelRouter vs. new).
3. Specify `IProvisioningEventRecord` storage mechanism.
4. Add admin route fix as prerequisite.

### Pass 8 — T08 and T09 Minor Fixes (15 minutes)

1. T08: Add T04 as explicit dependency. Specify getting-started page URL pattern.
2. T09: Add minimum coverage thresholds for new MVP packages. Add P1 gate check requirement.

---

## Implementation Readiness Risks

Listed in order of severity if plans were implemented without refinement.

| # | Risk | Impact | Mitigation |
|---|------|--------|-----------|
| 1 | **ADR-0090 not confirmed** — Plans could be implemented before Phase 7 sign-off, violating CLAUDE.md §6.3 | Zero-Deviation Rule breach; work may need to be undone | Add gate acknowledgment to master plan; confirm ADR-0090 exists before implementing T01 |
| 2 | **State machine divergence** — T02 updates only one of two duplicate state machines | Backend and package transition rules diverge; `'Canceled'` state unavailable in backend | T02 must update both files explicitly |
| 3 | **Admin router bug** — `/provisioning-failures` renders wrong page | T07 admin recovery work is built on a broken foundation | Fix in T01 |
| 4 | **Accounting app missing dependencies and routes** — coding agent may not realize the scope of T03 | T03 work incomplete or builds on wrong foundation | T03 scope expansion in Pass 4 |
| 5 | **`@hbc/step-wizard` ambiguity** — "or equivalent" may lead to app-local step logic | UI Ownership Rule violation; non-duplication rule violation | T04 wording fix in Pass 5 |
| 6 | **Retry policy unenforced** — backend saga doesn't check max retry | Escalation never triggers; admin never gets ownership | T05 requires enforcement gate |
| 7 | **Notifications duplicated or bypassed** — T07 doesn't acknowledge existing pipeline | Two notification systems in flight; preference/channel routing bypassed | T07 inventory section in Pass 7 |
| 8 | **T06 invalid path reference** — `packages/auth/src/backend/*` | Agent searches for a non-existent path; T06 stalls | T06 path fix in Pass 6 |
| 9 | **Undeclared `@hbc/provisioning` in admin** | Build passes locally but fails in turbo-aware lint/type-check | T01 package.json fix |
| 10 | **Project number uniqueness unenforced** | Duplicate project numbers can be provisioned | T03 uniqueness check addition |

---

---

# MVP Plan Refinement Blueprint

This blueprint is a practical editing guide for a follow-up pass on `docs/architecture/plans/MVP/*`. It specifies exactly what text to add, change, or clarify in each file.

---

## How to Apply This Blueprint

Work through the plan files in this order:
1. `MVP-Project-Setup-Plan.md` (master)
2. `MVP-Project-Setup-T01`
3. `MVP-Project-Setup-T02`
4. `MVP-Project-Setup-T03`
5. `MVP-Project-Setup-T04`
6. `MVP-Project-Setup-T05`
7. `MVP-Project-Setup-T06`
8. `MVP-Project-Setup-T07`
9. `MVP-Project-Setup-T08`
10. `MVP-Project-Setup-T09`

Do not implement code during this pass. Only revise plan text.

---

## `MVP-Project-Setup-Plan.md` — Edits Required

### ADD before "Recommended Task Sequence":

```markdown
## Governance Gate

This plan is classified as a feature-expansion phase. Per CLAUDE.md §6.3 and the binding governance rule in ADR-0085, no implementation task in this plan set may begin until:

- [ ] ADR-0090 (Phase 7 Final Verification & Sign-Off) exists on disk and is signed off
- [ ] All four mechanical enforcement gates pass: build, lint, type-check, P1 tests

Confirm ADR-0090 exists before executing T01.
```

### REVISE "Already present" section — add:

```markdown
- backend has a more complete notification pipeline than most plans acknowledge: `SendNotification`,
  `ProcessNotification`, channelRouter, tierResolver, emailDelivery, pushDelivery, and a preference
  store are all scaffolded in `backend/functions/src/functions/notifications/`
```

### REVISE "Still missing or thin" section — add:

```markdown
- admin `/provisioning-failures` route currently maps to `SystemSettingsPage` — router bug to fix in T01
- `@hbc/provisioning` is imported by `apps/admin/src/pages/ProvisioningFailuresPage.tsx` but not
  declared in `apps/admin/package.json` — package.json defect to fix in T01
- `packages/provisioning/src/state-machine.ts` and `backend/functions/src/state-machine.ts` are
  near-identical duplicates — both must be updated when new states are added in T02
```

### REVISE "ADR Required" framing:

Change "ADR Required: Recommended — formalize …" to "ADR Required: Yes — create a new ADR (ADR-0114 or next available) formalizing MVP Project Setup workflow authority, controller trigger semantics, hybrid permission bootstrap model, and admin takeover governance before or alongside T01."

---

## `MVP-Project-Setup-T01` — Edits Required

### ADD new section "Known Defects to Fix in T01":

```markdown
## Known Defects to Fix in T01

These are existing codebase issues that must be corrected before any later task builds on them.

### 1. Admin router bug

`apps/admin/src/router/routes.ts` maps `/provisioning-failures` to `SystemSettingsPage` instead of
`ProvisioningFailuresPage`. Fix: update the `provisioningRoute` component to `ProvisioningFailuresPage`.

### 2. Admin undeclared dependency

`apps/admin/src/pages/ProvisioningFailuresPage.tsx` imports `createProvisioningApiClient` from
`@hbc/provisioning`, but `@hbc/provisioning` is not declared in `apps/admin/package.json`.

Fix: add `"@hbc/provisioning": "workspace:*"` to `apps/admin/package.json` dependencies.

### 3. State machine duplication

`packages/provisioning/src/state-machine.ts` and `backend/functions/src/state-machine.ts` are
near-identical duplicate implementations. **Any state addition in T02 must be applied to both files.**
Document this constraint in both READMEs. Do not attempt to consolidate them in T01 — note the
duplication only and defer consolidation to a follow-on task if desired.
```

### REVISE "Correct package dependency drift" section — replace with:

```markdown
## Required Package.json Dependency Additions

The following dependencies must be added before downstream tasks can build:

| App | Add Dependencies |
|-----|-----------------|
| `apps/admin/package.json` | `@hbc/provisioning` |
| `apps/accounting/package.json` | `@hbc/provisioning`, `@hbc/bic-next-move`, `@hbc/field-annotations`, `@hbc/step-wizard`, `@hbc/notification-intelligence` |
| `apps/estimating/package.json` | `@hbc/bic-next-move`, `@hbc/field-annotations`, `@hbc/step-wizard` |

Note: `@hbc/versioned-record` is Scaffold-only and must NOT be added to any MVP app.
```

### ADD decision item "ProvisioningChecklist disposition":

```markdown
## ProvisioningChecklist Disposition Decision

`apps/estimating/src/components/ProvisioningChecklist.tsx` is an existing app-local component.
Before T04 begins, decide:

- **Option A:** Replace with `@hbc/step-wizard` composition — remove `ProvisioningChecklist` entirely.
- **Option B:** Promote rendering logic to `@hbc/ui-kit` as a reusable `ProvisioningStepList`
  component — then Estimating and Accounting can both consume it.

Record the decision here before T04 is executed. Option A is preferred for MVP scope.
```

### ADD to Verification Commands:

```bash
# Confirm admin router fix
grep -n "ProvisioningFailuresPage" apps/admin/src/router/routes.ts
# Confirm admin package.json has @hbc/provisioning
grep '"@hbc/provisioning"' apps/admin/package.json
# Confirm accounting has all new deps
grep -E '"@hbc/provisioning"|"@hbc/bic-next-move"|"@hbc/field-annotations"|"@hbc/step-wizard"|"@hbc/notification-intelligence"' apps/accounting/package.json
# Confirm estimating has new deps
grep -E '"@hbc/bic-next-move"|"@hbc/field-annotations"|"@hbc/step-wizard"' apps/estimating/package.json
# Confirm state machine duplication is documented
grep -rn "D-PH6-08\|state-machine\|state machine" packages/provisioning/README.md backend/functions/README.md
```

---

## `MVP-Project-Setup-T02` — Edits Required

### ADD to "Required Contract Changes":

```markdown
### Both state machine files

T02 must update state transition tables in **both** of the following files:

- `packages/provisioning/src/state-machine.ts`
- `backend/functions/src/state-machine.ts`

Both files must have identical `STATE_TRANSITIONS` after T02 completes. The following additions apply to both:

```ts
// Add to ProjectSetupRequestState union:
| 'Draft'       // pre-submission draft; may be abandoned without lifecycle effect
| 'Canceled'    // explicit cancellation; terminal unless explicitly reopened

// Add to STATE_TRANSITIONS:
Draft: ['Submitted'],  // only transition: submit
Canceled: [],          // terminal — no automatic transitions; explicit reopen only

// Extend existing transitions to include 'Canceled' as a valid target:
UnderReview: ['NeedsClarification', 'AwaitingExternalSetup', 'ReadyToProvision', 'Canceled'],
NeedsClarification: ['UnderReview', 'Canceled'],
AwaitingExternalSetup: ['ReadyToProvision', 'Canceled'],
ReadyToProvision: ['Provisioning', 'Canceled'],
```
```

### ADD `deriveCurrentOwner()` specification:

```markdown
### `deriveCurrentOwner()` function

Add to `packages/provisioning/src/` (new file or extend state-machine.ts):

```ts
export function deriveCurrentOwner(
  state: ProjectSetupRequestState,
  takeover?: IRequestTakeoverMetadata | null,
  retryPolicy?: IRequestRetryPolicy | null
): 'Requester' | 'Controller' | 'Admin' | 'System' | 'None' {
  if (takeover?.takenOverBy) return 'Admin';
  if (retryPolicy?.secondFailureEscalated) return 'Admin';
  switch (state) {
    case 'Draft': return 'Requester';
    case 'Submitted':
    case 'UnderReview':
    case 'AwaitingExternalSetup':
    case 'ReadyToProvision': return 'Controller';
    case 'NeedsClarification': return 'Requester';
    case 'Provisioning': return 'System';
    case 'Completed':
    case 'Canceled': return 'None';
    case 'Failed': return retryPolicy?.requesterRetryUsed ? 'Admin' : 'Requester';
  }
}
```
```

### ADD backward-compatibility note:

```markdown
### `IProvisioningAuditRecord` vs `IProvisioningEventRecord`

The existing `IProvisioningAuditRecord` (3-event thin model) should be **retained** for backward
compatibility with the existing SharePoint audit list write path in `saga-orchestrator.ts`. It is
not replaced by `IProvisioningEventRecord`.

`IProvisioningEventRecord` is the new rich event model for the MVP lifecycle event log. It may be
stored in a separate Azure Table partition or SharePoint list (to be specified in T07).

Do not remove `IProvisioningAuditRecord` in T02.
```

---

## `MVP-Project-Setup-T03` — Edits Required

### ADD "New Accounting App Pages Required":

```markdown
## New Accounting App Pages Required

The Controller surface in `apps/accounting` must be built from scratch. The following pages
and routes do not currently exist and must be created in T03:

### New pages

- `apps/accounting/src/pages/ControllerInboxPage.tsx` — request queue with state/department/requester filters
- `apps/accounting/src/pages/ControllerReviewPage.tsx` — request detail, clarification panel, project number entry, Finish Setup trigger

### New routes (add to `apps/accounting/src/router/routes.ts`)

```ts
const controllerInboxRoute = createRoute({
  path: '/controller-inbox',
  // …
});
const controllerReviewRoute = createRoute({
  path: '/controller-inbox/$requestId',
  // …
});
```

Note: these routes must be added and wired before the page components are built.
```

### ADD to "Backend Orchestration Requirements":

```markdown
### Project number uniqueness enforcement

The backend `advanceState` handler currently validates **format** (##-###-##) but does **not**
check uniqueness across existing requests. Before allowing the `ReadyToProvision` transition,
the handler must:

1. Query all existing requests with `state != 'Canceled'`
2. Reject if any request already has the same `projectNumber`
3. Return HTTP 409 Conflict with a human-readable error if a duplicate is found

This must be implemented server-side, not enforced only in page UI.
```

### REVISE effort estimate:

Add a note: "The 1.2 sprint-week estimate does not account for full accounting app Controller surface creation from scratch. Actual effort may be 1.8–2.2 sprint-weeks if the inbox, review detail, BIC wiring, field annotation UX, and Finish Setup trigger are all new."

---

## `MVP-Project-Setup-T04` — Edits Required

### REVISE progress UX section:

Change:
> use `@hbc/step-wizard` or equivalent step projection for business-friendly status

To:
> **Use `@hbc/step-wizard` for business-friendly step progress.** `@hbc/step-wizard` is a
> Tier-1 Platform Primitive (ADR-0093). It is mandatory when multi-step guided workflow
> rendering is present. Do not implement app-local step logic or a custom checklist component.
> The existing `apps/estimating/src/components/ProvisioningChecklist.tsx` must be replaced by
> `@hbc/step-wizard` composition. (See T01 ProvisioningChecklist disposition decision.)

---

## `MVP-Project-Setup-T05` — Edits Required

### ADD to "Retry / Backoff Rules":

```markdown
### Max-requester-retry enforcement (backend requirement)

The `SagaOrchestrator.retry()` method must enforce the max-1-requester-retry policy from
`IRequestRetryPolicy`:

- If `retryPolicy.requesterRetryUsed === true` and the request failed again, automatically set
  `secondFailureEscalated = true` and escalate ownership to Admin.
- Do not allow further user-initiated retries after `requesterRetryUsed === true`.
- This enforcement must be in the backend, not only in the UI.

### `Retry-After` header honoring

The existing `withRetry()` utility (`backend/functions/src/utils/retry.ts`) uses simple
exponential backoff. For Graph/SharePoint throttling responses (HTTP 429), the retry logic must
inspect the `Retry-After` response header and respect the specified delay instead of calculating
backoff independently. Add this behavior to `withRetry` or as a Graph-specific wrapper.
```

### ADD reference note:

```markdown
**Note:** The `withRetry()` utility in `backend/functions/src/utils/retry.ts` (maxAttempts: 3,
baseDelayMs: 2000) is the existing baseline for step-level retries. T05 should confirm these
parameters are appropriate for Graph/SharePoint operations at MVP scale, or specify overrides.
```

---

## `MVP-Project-Setup-T06` — Edits Required

### FIX Required Paths:

Change:
```
packages/auth/src/backend/*
```

To:
```
backend/functions/src/services/sharepoint-service.ts
backend/functions/src/middleware/validateToken.ts
```

The `packages/auth/` directory is the frontend authentication package. Backend identity work lives in `backend/functions/src/services/` and `backend/functions/src/middleware/`.

### REVISE "Technical Implementation Rules" — expand step6:

```markdown
### Step 6 expanded access sets

The current `step6-permissions.ts` only grants access to `groupMembers + OPEX_UPN`.
T06 must expand this to three distinct access sets:

1. **Project team** — `status.groupMembers` (from request; already implemented)
2. **Structural owners** — OpEx manager (`OPEX_UPN` env var; already included) + any required
   admin/standards ownership principals (to be defined in T01 documentation)
3. **Department background access** — an approved per-department access list sourced from
   environment configuration or a config table; applied based on `request.department`

All three sets must be deduplicated before the permission call and the write must be idempotent
(check membership before assignment).

### Department pruning step assignment

Department-based library removal (removing the non-applicable library from the base template)
must be performed in **step 3** (`step3-template-files.ts`) as a pruning action on the
provisioned template artifacts. Document in step3 which library is removed for each department.
```

---

## `MVP-Project-Setup-T07` — Edits Required

### ADD prerequisite note:

```markdown
## Prerequisites

- T01 admin router fix must be complete before T07 begins (the `/provisioning-failures` route
  must render `ProvisioningFailuresPage`).
- T02 `IProvisioningEventRecord` type must exist in `@hbc/models` before T07 can implement
  event history storage.
```

### ADD "Existing Notification Infrastructure" section:

```markdown
## Existing Backend Notification Infrastructure

`backend/functions/src/functions/notifications/` contains a substantially complete
notification pipeline that must be integrated with, not duplicated:

| File | Purpose |
|------|---------|
| `SendNotification.ts` | Trigger endpoint for sending a notification |
| `ProcessNotification.ts` | Internal processing with tier classification |
| `lib/channelRouter.ts` | Routes by notification tier and user preference |
| `lib/tierResolver.ts` | Classifies priority tier based on event type |
| `lib/emailDelivery.ts` | Email channel delivery |
| `lib/pushDelivery.ts` | Push/SignalR channel delivery |
| `lib/notificationStore.ts` | Persistence layer for notification records |
| `lib/preferencesStore.ts` | Per-user preference storage |

**Integration requirement:** MVP lifecycle notifications (request submitted, clarification,
ready to provision, provisioning started, failure, escalation, completion, recovery)
must route **through the existing `SendNotification` endpoint and channelRouter**, not
through a separate ad-hoc notification call. This ensures preference management, tier
resolution, and delivery channel selection are consistent.

The `packages/provisioning/src/notification-templates.ts` file (already exists with 5 templates)
must be extended to cover all 8 MVP notification events.
```

### ADD "Event History Storage Specification":

```markdown
## Event History Storage

`IProvisioningEventRecord` items (defined in T02) must be persisted in Azure Table Storage,
using the same `@azure/data-tables` client pattern as `IProvisioningStatus`:

- Table name: `ProvisioningEvents`
- Partition key: `projectId`
- Row key: `eventId` (UUID)

The existing `table-storage-service.ts` in `backend/functions/src/services/` must be extended
with `appendEvent(record: IProvisioningEventRecord)` and `listEvents(projectId: string)` methods.

Do not persist event records to SharePoint — keep event history in Azure Table Storage for
query performance and cost efficiency.
```

---

## `MVP-Project-Setup-T08` — Edits Required

### ADD T04 to explicit dependencies:

Change `**Depends On:** T05, T06, T07` to `**Depends On:** T04, T05, T06, T07`

### ADD getting-started URL specification:

```markdown
### Getting-started page URL

`siteLaunch.gettingStartedPageUrl` should be populated with the absolute URL of the
getting-started page provisioned on the project site, in the format:
`{siteUrl}/SitePages/Getting-Started.aspx`

This URL is generated during the step responsible for content provisioning (step 3 or an
extension thereof) and must be stored in the status record when the page is created.
```

### ADD "BaseComplete vs Completed" disambiguation:

```markdown
### BaseComplete vs Completed distinction

When `overallStatus === 'WebPartsPending'` (step5 deferred to timer), the frontend must
distinguish "site is usable now" from "fully decorated soon":

- Show the direct site link immediately when `overallStatus === 'WebPartsPending'`
- Show "Full setup completing overnight — site is accessible now" messaging
- Do not show "Completed" status until `overallStatus === 'Completed'`
```

---

## `MVP-Project-Setup-T09` — Edits Required

### ADD to "Operational Readiness Requirements":

```markdown
### P1 gate re-verification

Before pilot approval, re-run the P1 package test suite to confirm that MVP changes have not
degraded coverage in any of the five P1 packages:

```bash
pnpm turbo run test --filter=@hbc/auth --filter=@hbc/shell --filter=@hbc/sharepoint-docs \
  --filter=@hbc/bic-next-move --filter=@hbc/complexity
```

All five must maintain `branches: 95` per ADR-0085.

### Minimum coverage for new MVP packages

New packages and apps created or substantially modified in this MVP plan set must meet:

- `@hbc/spfx-estimating`: branches 80 minimum
- `@hbc/spfx-accounting`: branches 80 minimum
- `@hbc/spfx-admin`: branches 80 minimum
- `@hbc/functions` (provisioning-related functions): branches 85 minimum

These thresholds are lower than P1 standards because the MVP surfaces are composition shells,
but they must be enforced via vitest coverage configuration.
```

### ADD minimum runbook structure:

```markdown
### Runbook minimum structure

Each required runbook must contain at minimum:

1. **Trigger condition** — what symptom or alert prompts use of this runbook
2. **Audience** — who executes (first-line support / admin / engineering)
3. **Decision tree or step-by-step procedure**
4. **Escalation path** — who to contact if procedure does not resolve the issue
5. **Verification** — how to confirm the issue is resolved
6. **Known failure modes** — documented pitfalls specific to this runbook
```

---

*End of MVP Plan Refinement Blueprint.*
