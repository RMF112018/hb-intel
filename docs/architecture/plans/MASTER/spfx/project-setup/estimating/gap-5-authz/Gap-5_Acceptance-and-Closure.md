# Gap 5 Acceptance and Closure

> **Created:** 2026-04-01 (P9-G5-13)
> **Status:** Closed in repo-owned code
> **Scope:** Final reconciliation and closure evidence for Gap 5 authorization convergence

## Verdict

**Gap 5 is closed in repo-owned code.** The Project Setup backend has converged from a dual authorization model (env-based UPN lists for request lifecycle, JWT app-roles for provisioning admin) to a single Entra claim-based model with app-role-driven privileged access, oid-based resource ownership, delegated scope enforcement, and workload/app-only authorization. All remaining prerequisites are environment-executed (Entra app-role creation, user/group assignment) and documented in the cutover runbook.

---

## 1. Exit Criteria Reconciliation

The exit criteria are defined in `Gap-5-Implementation-Summary.md`.

| Exit Criterion | Status | Evidence |
|---------------|--------|---------|
| No permanent request-time authorization based on `ADMIN_UPNS` / `CONTROLLER_UPNS` | **Met** | `state-machine.ts` and `projectRequests/index.ts` contain zero references to these env vars (verified by Gate 1) |
| All privileged user routes enforce app-role-based authorization | **Met** | `resolveRequestRole()` uses `isAdmin()`, `isController()`, `isBreakGlass()` from shared policy engine; provisioning admin routes use `requireAdmin()` (verified by Gates 2-3) |
| Delegated routes explicitly enforce scope and ownership/resource checks | **Met** | All 10 provisioning routes call `requireDelegatedScope()`; request lifecycle uses `checkOwnership()` with oid-first semantics (verified by Gates 2, 4) |
| Workload/app-only routes enforce workload roles | **Met (code-ready)** | `requireWorkloadRole()` implemented and tested; no current HTTP workload routes exist (timer functions use host-level trust) |
| Identity persistence uses stable IDs and not only UPN/email | **Met** | `submittedByOid`, `triggeredByOid`, `completedByOid` fields added to models, handlers, and persistence layers (verified by Gate 4) |
| Telemetry and release gates prove the final model | **Met** | `authz.break_glass` telemetry event; 6 release gate suites with 19 static-analysis assertions; 825 total tests pass |
| Docs and runbooks explain deployment, cutover, rollback, and operational ownership | **Met** | Cutover runbook with 4-phase sequence, rollback plan, coexistence guide, post-cutover cleanup list |
| Final implementation report clearly marks Gap 5 as closed in repo-owned code | **Met** | This document + implementation report v5.0 |

---

## 2. Implementation Summary

| Metric | Value |
|--------|-------|
| Prompts executed | 13 of 13 |
| Commits | 12 |
| Code files created | 3 (`authorization.ts`, `authorization.test.ts`, `workload-authorization.test.ts`) |
| Code files modified | 9 (`state-machine.ts`, `validateToken.ts`, `projectRequests/index.ts`, `provisioningSaga/index.ts`, `signalr/index.ts`, `table-storage-service.ts`, `projects-list-contract.ts`, `projects-list-mapper.ts`, `vitest.config.ts`) |
| Test files created | 3 (`authorization.test.ts`, `workload-authorization.test.ts`, `authz-release-gates.test.ts`, `provisioning-authorization.test.ts`) |
| Documentation artifacts created | 8 (Baseline Inventory, Target Outcome, Target Architecture, Route-Policy Matrix, Entra Contract, Oid Migration Contract, Workload/Break-Glass Model, Cutover Runbook) |
| Total tests at closure | 825 passed, 3 skipped (55 test files) |
| Tests added by Gap 5 | 140 (from baseline 685) |
| Backend version | `0.0.101` → `0.0.108` (7 patch increments) |

---

## 3. Repo-Complete vs Environment-Gated

### Repo-Complete (No Further Action)

- Shared authorization policy engine with role constants, scope checks, ownership checks, workload checks
- `resolveRequestRole()` uses JWT claims + oid ownership (zero env-var references)
- Delegated scope enforcement (`access_as_user`) on all 14 HTTP routes
- App-only token support in `validateToken()` (scp/idtyp extraction, relaxed upn)
- Stable identity (`oid`) fields in models, handlers, and persistence layers
- Break-glass telemetry (`authz.break_glass` event)
- Release gates preventing regression to env-var UPN model
- Frontend SPFx contract verified aligned
- Cutover and rollback runbook

### Environment-Gated (Requires IT/Entra Action)

| Item | Owner | Blocking? |
|------|-------|-----------|
| Create `Controller`/`HBIntelController` app-roles | Entra admin | Yes — controllers not recognized until created |
| Create `BreakGlass` app-role | Entra admin | No — optional for initial release |
| Create `Automation` app-role (Application type) | Entra admin | No — no HTTP workload routes currently exist |
| Assign users to app-roles matching `ADMIN_UPNS`/`CONTROLLER_UPNS` lists | Entra admin | Yes — users lose access until roles assigned |
| Reclassify `ADMIN_UPNS`/`CONTROLLER_UPNS` in env registry | Developer | No — post-cutover cleanup |
| Optional oid backfill for legacy records | Operations | No — UPN fallback works indefinitely |

---

## 4. Prior Report Reconciliation

### `project-setup-authz-model-gap-validation.md`

The original audit report (§6 Verdict) states: "Partially confirmed — the mixed authorization model exists and is real, but is intentionally documented as a transitional release posture."

**Updated status:** The transitional posture has been resolved. The repo-owned code now implements a single claim-based authorization model. The specific claims from the audit:

| Original Claim | Original Status | Gap 5 Resolution |
|---------------|----------------|------------------|
| Request-state transitions use env-based UPN authorization | Confirmed | **Resolved** — `resolveRequestRole()` rewritten to use JWT claims (P9-G5-06) |
| Provisioning admin routes use JWT-role authorization | Confirmed | **Retained and enhanced** — delegated scope enforcement added (P9-G5-07) |
| The backend uses two different authorization models | Confirmed | **Resolved** — single model: JWT claims + oid ownership |
| The mixed model is a production-readiness blocker | Not confirmed | **Moot** — the mixed model no longer exists in repo-owned code |

### Phase 7 and Phase 1-5 Reports

These reports correctly documented the dual model as intentional and deferred RBAC convergence to post-launch. No reconciliation needed — those statements were accurate at the time and Gap 5 is the post-launch convergence they anticipated.

---

## 5. Artifacts Produced

### Architecture/Planning Documents (`gap-5-authz/`)

| Document | Purpose |
|----------|---------|
| `Gap-5_Baseline-Inventory.md` | Current-state authorization surface inventory |
| `Gap-5_Target-Outcome-Summary.md` | Frozen target posture |
| `Gap-5_Target-Authorization-Architecture.md` | 5-layer authorization stack design |
| `Gap-5_Route-Policy-Matrix.md` | Per-route policy assignment |
| `Gap-5_Entra-App-Role-and-Scope-Contract.md` | Entra app registration contract |
| `Gap-5_Oid-Migration-and-Data-Contract.md` | Stable identity field migration |
| `Gap-5_Workload-and-Break-Glass-Model.md` | Workload execution paths and break-glass audit |
| `Gap-5_Cutover-and-Rollback-Runbook.md` | Operational cutover plan |
| `Gap-5_Acceptance-and-Closure.md` | This document |

### Central Report

| Document | Purpose |
|----------|---------|
| `project-setup-gap-5-implementation-report.md` | Per-prompt tracking, files changed, verification logs, version history |

---

## 6. Final Verification Evidence

**Run date:** 2026-04-01

| Check | Result |
|-------|--------|
| `pnpm -F @hbc/functions check-types` | Pass (0 errors) |
| `pnpm -F @hbc/functions lint` | Pass (0 errors, 78 pre-existing warnings) |
| `pnpm -F @hbc/functions build` | Pass (clean compilation) |
| `pnpm -F @hbc/functions test` | 55 files passed, 825 tests passed, 3 skipped |
| Release gates (G5-Gate-1 through G5-Gate-6) | All 19 assertions pass |
| `@hbc/functions` version | `0.0.108` |
