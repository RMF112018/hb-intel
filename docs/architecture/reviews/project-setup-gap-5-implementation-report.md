# Gap 5 Implementation Report — Project Setup Authorization Convergence

> **Created:** 2026-04-01 (P9-G5-01)
> **Status:** In Progress
> **Scope:** Central tracking report for the 13-prompt Gap 5 authorization convergence package

## Executive Summary

Gap 5 addresses the dual authorization model in Project Setup: request-lifecycle routes use env-based UPN matching (`ADMIN_UPNS`/`CONTROLLER_UPNS`), while provisioning-admin routes use JWT app-role claims (`Admin`/`HBIntelAdmin`). The target is convergence onto a single Microsoft Entra claim-based authorization architecture with app-role-driven privileged access, `oid`-based resource ownership, and workload/app-only authorization for automation paths.

This report tracks implementation progress across all 13 prompts.

**Governing documents:**
- Prompt package: `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-9/gap-5/`
- Baseline inventory: `docs/architecture/plans/MASTER/spfx/project-setup/estimating/gap-5-authz/Gap-5_Baseline-Inventory.md`
- Target outcome: `docs/architecture/plans/MASTER/spfx/project-setup/estimating/gap-5-authz/Gap-5_Target-Outcome-Summary.md`
- Authorization audit: `docs/architecture/reviews/project-setup-authz-model-gap-validation.md`
- Target architecture: `docs/architecture/plans/MASTER/spfx/project-setup/estimating/gap-5-authz/Gap-5_Target-Authorization-Architecture.md`
- Route-policy matrix: `docs/architecture/plans/MASTER/spfx/project-setup/estimating/gap-5-authz/Gap-5_Route-Policy-Matrix.md`
- Entra contract: `docs/architecture/plans/MASTER/spfx/project-setup/estimating/gap-5-authz/Gap-5_Entra-App-Role-and-Scope-Contract.md`

---

## 1. Baseline (P9-G5-01)

### 1.1 Current Authorization Surface

Project Setup exposes 16 HTTP routes and 2 timer functions across two authorization families:

| Family | Routes | Mechanism | Key Files |
|--------|--------|-----------|-----------|
| Request lifecycle | 4 | Env-based UPN matching | `projectRequests/index.ts`, `state-machine.ts` |
| Provisioning admin | 10 (6 role-gated, 4 authn-only) | JWT app-role claims | `provisioningSaga/index.ts` |
| Timer/internal | 2 | None (timer-triggered) | `timerFullSpec/index.ts`, `cleanupIdempotency/index.ts` |

Additional non-route authorization surfaces: notification recipient resolution (env-based UPN), frontend provisioning visibility (JWT roles), ownership checks (UPN comparison).

### 1.2 Identity Gap

`oid` is extracted as a required claim in `validateToken.ts` and available in every handler via `auth.claims.oid`. However, no model interface includes an `oid` field. All identity persistence — `submittedBy`, `triggeredBy`, `escalatedBy`, person assignments — is UPN-based.

### 1.3 Frozen Target

Single Entra claim-based authorization model. See `Gap-5_Target-Outcome-Summary.md` for the complete target posture, route-by-route matrix, identity migration plan, and env var deprecation path.

### 1.4 Blockers and Prerequisites

| # | Item | Type | Owner | Resolution |
|---|------|------|-------|-----------|
| 1 | No `oid` fields in data models | Repo-owned | Prompt 1-05 | Add `oid` fields, implement dual-write |
| 2 | `resolveRequestRole()` reads env vars | Repo-owned | Prompt 1-06 | Rewrite to use JWT `roles` claims |
| 3 | Inline env-var privilege check in list route | Repo-owned | Prompt 1-06 | Rewrite to use JWT `roles` claims |
| 4 | Notification dispatch reads env vars for recipients | Repo-owned | Prompt 1-06/07 | Requires design decision (§9 of target outcome) |
| 5 | No shared authorization policy engine | Repo-owned | Prompt 1-04 | Build shared policy module |
| 6 | No workload/app-only auth for timers | Repo-owned | Prompt 1-08 | Formalize workload roles |
| 7 | `Controller` app-role may not exist in Entra | External | Entra admin | Create app-role before Prompt 1-06 |
| 8 | Users must be assigned to app-roles | External | Entra admin | Before production cutover |
| 9 | Managed identity needs app-role assignment | External | Azure admin | Before Prompt 1-08 |

---

## 2. Implementation Progress

| Prompt | Title | Status | Date | Notes |
|--------|-------|--------|------|-------|
| 1-01 | Contract Freeze and Baseline | **Complete** | 2026-04-01 | Baseline inventoried, target frozen |
| 1-02 | Target Architecture and Policy Matrix | **Complete** | 2026-04-01 | Architecture and route-policy matrix frozen |
| 1-03 | Entra App Role and Scope Contract | **Complete** | 2026-04-01 | Entra contract frozen: 6 app-roles, delegated scope, token differentiation |
| 1-04 | Shared Authorization Policy Engine | **Complete** | 2026-04-01 | Policy module created, 60 tests, 6 admin guards replaced |
| 1-05 | Oid Migration and Data Contract | **Complete** | 2026-04-01 | oid fields added to 3 model interfaces, 3 handlers, 2 persistence layers |
| 1-06 | Request Lifecycle Authorization Convergence | **Complete** | 2026-04-01 | resolveRequestRole() rewritten to use JWT claims + oid ownership; env-var auth eliminated |
| 1-07 | Provisioning and Admin Authorization Convergence | **Complete** | 2026-04-01 | Delegated scope enforcement added to all 10 provisioning routes |
| 1-08 | Workload and App-Only Authorization | **Complete** | 2026-04-01 | Workload model documented, 21 tests, timer paths confirmed identity-free |
| 1-09 | Frontend SPFx Contract and Diagnostics | **Complete** | 2026-04-01 | Verified: frontend already aligned — no code changes needed |
| 1-10 | Telemetry, Break-Glass, and Auditability | **Complete** | 2026-04-01 | emitAuthorizationTelemetry() + authz.break_glass event; 8 new tests |
| 1-11 | Tests, Release Gates, and Security Hardening | **Complete** | 2026-04-01 | 6 release gates (19 assertions), regression-proof for all Gap 5 changes |
| 1-12 | Documentation, Cutover, and Rollback | **Complete** | 2026-04-01 | Cutover runbook with 4-phase sequence, rollback plan, coexistence guide |
| 1-13 | Final Reconciliation and Closure | Not started | — | — |

---

## 3. Files Changed

### Prompt 1-01 (P9-G5-01)

| Action | File |
|--------|------|
| Created | `docs/architecture/plans/MASTER/spfx/project-setup/estimating/gap-5-authz/Gap-5_Baseline-Inventory.md` |
| Created | `docs/architecture/plans/MASTER/spfx/project-setup/estimating/gap-5-authz/Gap-5_Target-Outcome-Summary.md` |
| Created | `docs/architecture/reviews/project-setup-gap-5-implementation-report.md` |

### Prompt 1-02 (P9-G5-02)

| Action | File |
|--------|------|
| Created | `docs/architecture/plans/MASTER/spfx/project-setup/estimating/gap-5-authz/Gap-5_Target-Authorization-Architecture.md` |
| Created | `docs/architecture/plans/MASTER/spfx/project-setup/estimating/gap-5-authz/Gap-5_Route-Policy-Matrix.md` |
| Updated | `docs/architecture/reviews/project-setup-gap-5-implementation-report.md` |

### Prompt 1-03 (P9-G5-03)

| Action | File |
|--------|------|
| Created | `docs/architecture/plans/MASTER/spfx/project-setup/estimating/gap-5-authz/Gap-5_Entra-App-Role-and-Scope-Contract.md` |
| Updated | `docs/architecture/reviews/project-setup-gap-5-implementation-report.md` |

### Prompt 1-04 (P9-G5-04)

| Action | File |
|--------|------|
| Created | `backend/functions/src/middleware/authorization.ts` |
| Created | `backend/functions/src/middleware/authorization.test.ts` |
| Modified | `backend/functions/src/middleware/validateToken.ts` — extended `IValidatedClaims` with `scp` and `idtyp`; relaxed `upn` requirement for app-only tokens |
| Modified | `backend/functions/src/functions/provisioningSaga/index.ts` — replaced 6 inline admin guards with `requireAdmin()` |
| Modified | `backend/functions/src/functions/signalr/index.ts` — replaced local `ADMIN_ROLES` constant and inline check with shared `isAdmin()` |
| Modified | `backend/functions/vitest.config.ts` — added authorization test and coverage entries |
| Modified | `backend/functions/package.json` — version bump `0.0.101` → `0.0.102` |
| Updated | `docs/architecture/reviews/project-setup-gap-5-implementation-report.md` |

### Prompt 1-05 (P9-G5-05)

| Action | File |
|--------|------|
| Modified | `packages/models/src/provisioning/IProvisioning.ts` — added `submittedByOid`, `triggeredByOid`, `completedByOid` to 3 interfaces |
| Modified | `backend/functions/src/functions/projectRequests/index.ts` — dual-write `oid` at submission, completion, and auto-provisioning handoff |
| Modified | `backend/functions/src/functions/provisioningSaga/index.ts` — dual-write `triggeredByOid` at trust boundary |
| Modified | `backend/functions/src/services/table-storage-service.ts` — serialize/deserialize `triggeredByOid` and `submittedByOid` |
| Modified | `backend/functions/src/services/projects-list-contract.ts` — added `submittedByOid`, `completedByOid` to `IProjectsListItem` |
| Modified | `backend/functions/src/services/projects-list-mapper.ts` — added oid fields to read (`toDomain`) and write (`toListItem`) paths |
| Modified | `backend/functions/package.json` — version bump `0.0.102` → `0.0.103` |
| Created | `docs/architecture/plans/MASTER/spfx/project-setup/estimating/gap-5-authz/Gap-5_Oid-Migration-and-Data-Contract.md` |
| Updated | `docs/architecture/reviews/project-setup-gap-5-implementation-report.md` |

### Prompt 1-06 (P9-G5-06)

| Action | File |
|--------|------|
| Modified | `backend/functions/src/state-machine.ts` — rewrote `resolveRequestRole()`: now takes `IValidatedClaims` instead of UPN string; uses `isAdmin()`, `isBreakGlass()`, `isController()`, `checkOwnership()` from shared policy engine; no env vars consulted |
| Modified | `backend/functions/src/functions/projectRequests/index.ts` — replaced inline env-var privilege check in `listProjectSetupRequests` with `isPrivileged()` + `checkOwnership()`; updated `getProjectSetupRequest` and `advanceRequestState` call sites to pass `auth.claims` |
| Modified | `backend/functions/src/state-machine.test.ts` — added 16 tests for claims-based `resolveRequestRole()` and `isAuthorizedTransition()` |
| Modified | `backend/functions/src/functions/projectRequests/__tests__/request-lifecycle.test.ts` — rewrote Section C tests: removed env-var setup, uses `IValidatedClaims` objects with app-roles and oid ownership |
| Modified | `backend/functions/package.json` — version bump `0.0.103` → `0.0.104` |
| Updated | `docs/architecture/reviews/project-setup-gap-5-implementation-report.md` |

### Prompt 1-07 (P9-G5-07)

| Action | File |
|--------|------|
| Modified | `backend/functions/src/functions/provisioningSaga/index.ts` — added `requireDelegatedScope()` (L2) to all 10 provisioning routes; added `auth` parameter to `getProvisioningStatus` and `retryProvisioning` handlers |
| Created | `backend/functions/src/functions/provisioningSaga/__tests__/provisioning-authorization.test.ts` — 13 tests for L2 scope enforcement and L3 admin role enforcement on provisioning routes |
| Modified | `backend/functions/package.json` — version bump `0.0.104` → `0.0.105` |
| Updated | `docs/architecture/reviews/project-setup-gap-5-implementation-report.md` |

### Prompt 1-08 (P9-G5-08)

| Action | File |
|--------|------|
| Created | `docs/architecture/plans/MASTER/spfx/project-setup/estimating/gap-5-authz/Gap-5_Workload-and-Break-Glass-Model.md` |
| Created | `backend/functions/src/middleware/workload-authorization.test.ts` — 21 tests for workload/delegated token distinction |
| Modified | `backend/functions/vitest.config.ts` — added workload test entry |
| Modified | `backend/functions/package.json` — version bump `0.0.105` → `0.0.106` |
| Updated | `docs/architecture/reviews/project-setup-gap-5-implementation-report.md` |

### Prompt 1-09 (P9-G5-09)

| Action | File |
|--------|------|
| Verified | `apps/estimating/src/mount.tsx` — token acquisition chain and audience contract correct |
| Verified | `apps/estimating/src/config/runtimeConfig.ts` — production readiness checks surface missing prerequisites |
| Verified | `apps/estimating/src/project-setup/backend/ProjectSetupBackendContext.tsx` — P3-07 auth model documentation accurate |
| Verified | `packages/provisioning/src/api-client.ts` — per-request Bearer token injection correct |
| Verified | `packages/provisioning/src/visibility.ts` — JWT roles-based visibility (already target pattern) |
| Verified | `apps/estimating/src/test/authTransportContract.test.ts` — transport contract tests current |
| Verified | `apps/estimating/config/package-solution.json` — `access_as_user` scope declaration correct |
| Updated | `docs/architecture/reviews/project-setup-gap-5-implementation-report.md` |

### Prompt 1-10 (P9-G5-10)

| Action | File |
|--------|------|
| Modified | `backend/functions/src/middleware/authorization.ts` — added `AuthzTelemetryEvent` interface and `emitAuthorizationTelemetry()` function |
| Modified | `backend/functions/src/state-machine.ts` — added optional `logger` param to `resolveRequestRole()`, emits `authz.break_glass` for BreakGlass role |
| Modified | `backend/functions/src/functions/projectRequests/index.ts` — pass logger to `resolveRequestRole()` calls; added logger to `getProjectSetupRequest` handler |
| Modified | `backend/functions/src/middleware/authorization.test.ts` — 4 telemetry emission tests |
| Modified | `backend/functions/src/state-machine.test.ts` — 4 break-glass telemetry tests |
| Updated | `docs/architecture/plans/MASTER/spfx/project-setup/estimating/gap-5-authz/Gap-5_Workload-and-Break-Glass-Model.md` — replaced deferred §3.4 with implemented telemetry contract |
| Modified | `backend/functions/package.json` — version bump `0.0.106` → `0.0.107` |
| Updated | `docs/architecture/reviews/project-setup-gap-5-implementation-report.md` |

### Prompt 1-11 (P9-G5-11)

| Action | File |
|--------|------|
| Created | `backend/functions/src/test/authz-release-gates.test.ts` — 6 release gate suites with 19 static-analysis assertions |
| Modified | `backend/functions/package.json` — version bump `0.0.107` → `0.0.108` |
| Updated | `docs/architecture/reviews/project-setup-gap-5-implementation-report.md` |

### Prompt 1-12 (P9-G5-12)

| Action | File |
|--------|------|
| Created | `docs/architecture/plans/MASTER/spfx/project-setup/estimating/gap-5-authz/Gap-5_Cutover-and-Rollback-Runbook.md` |
| Updated | `docs/architecture/reviews/project-setup-gap-5-implementation-report.md` |

---

## 4. Verification Log

### Prompt 1-01 (P9-G5-01)

**Scope:** Documentation-only — no code changes, no build/lint/test verification required.

**Structural verification:**
- Baseline inventory covers all 16 routes across both route families
- Baseline includes non-route surfaces (notification dispatch, frontend visibility, ownership checks)
- Identity gap documented: `oid` available but never persisted
- Target outcome specifies per-route authorization targets
- Evidence classified as confirmed repo fact / inference / unresolved
- Blockers classified as repo-owned vs external with resolution prompt assignments

**Acceptance criteria status:**
- [x] Baseline inventory covers every retained Project Setup route family and authorization path
- [x] Report identifies all current UPN-based, role-based, and ownership-based decisions
- [x] Target outcome is specific enough to guide all later prompts without re-deciding architecture

### Prompt 1-02 (P9-G5-02)

**Scope:** Documentation-only — no code changes, no build/lint/test verification required.

**Structural verification:**
- Target architecture defines 5 authorization layers with clear separation of concerns
- Route-policy matrix covers all 16 routes, 2 timers, and 8 non-route authorization surfaces
- Each route assigned a surface type, policy stack, claims requirements, and explicit change impact
- Three previously unresolved design questions from P9-G5-01 resolved and frozen:
  - Notification recipient resolution: env vars retained as notification-only config (not auth input)
  - Submitter ownership: migrates to `oid` with UPN fallback and lazy backfill
  - Controller app-role naming: `Controller`/`HBIntelController` following existing pattern
- Delegated scope enforcement (`scp:access_as_user`) identified as the only net-new authorization layer
- Change impact mapped to specific prompts (1-03 through 1-11)

**Acceptance criteria status:**
- [x] Route-policy matrix covers every retained route and trigger
- [x] Architecture doc separates token validation, delegated scope, business-role, ownership, and workload authorization
- [x] Docs are concrete enough that Prompts 03–11 can implement without reopening fundamental design questions

### Prompt 1-03 (P9-G5-03)

**Scope:** Documentation-only — no code changes, no build/lint/test verification required.

**Structural verification:**
- Entra contract specifies 6 app-roles: `Admin`, `HBIntelAdmin`, `Controller`, `HBIntelController`, `BreakGlass` (user), `Automation` (application)
- Delegated scope contract: single `access_as_user` scope, already declared in `package-solution.json`
- Token-type differentiation strategy defined: `idtyp` as primary signal, `scp`/`upn` absence as fallback
- Validation pipeline changes identified: `validateToken.ts` must relax `upn` requirement for app-only tokens
- Environment configuration matrix distinguishes repo-owned config from environment-executed setup steps
- 9 environment-executed setup steps documented with owner and prerequisite prompt mapping
- Frontend token acquisition chain confirmed: no changes needed (`package-solution.json`, `ShellWebPart.ts`, `mount.tsx`, `runtimeConfig.ts`)
- Complete claim requirements for both delegated and app-only token types

**Acceptance criteria status:**
- [x] Entra contract doc specifies scopes, roles, assignment targets, and required claims
- [x] Doc clearly distinguishes repo-owned implementation work from environment-executed setup steps
- [x] Doc is specific enough that later prompts can implement validation, policies, and runbooks without re-interpreting the identity model

### Prompt 1-04 (P9-G5-04)

**Scope:** Code changes — new shared authorization policy module, `IValidatedClaims` extension, handler refactoring.

**Verification results:**
- `check-types`: pass (0 errors)
- `lint`: pass (0 errors, 75 pre-existing warnings)
- `build`: pass (clean compilation)
- `test`: 52 files passed, 745 tests passed, 3 skipped (was 51 files / 685 tests — 60 new authorization tests added)

**What was built:**
- `authorization.ts`: shared policy module with role constants (`ADMIN_ROLES`, `CONTROLLER_ROLES`, `PRIVILEGED_ROLES`, `BREAK_GLASS_ROLES`, `AUTOMATION_ROLES`), token-type detection (`isAppOnlyToken`), role checks (`isAdmin`, `isController`, `isPrivileged`, `isBreakGlass`, `isAutomation`), scope checks (`hasScope`, `hasDelegatedScope`), ownership checks (`checkOwnership` with oid-first/UPN-fallback), and policy enforcement helpers (`requireRoles`, `requireAdmin`, `requireDelegatedScope`, `requireWorkloadRole`)
- `validateToken.ts`: extended `IValidatedClaims` with `scp` and `idtyp` fields; `validateToken()` now extracts both claims and supports app-only tokens (relaxed `upn` requirement when `idtyp=app`)
- `provisioningSaga/index.ts`: all 6 inline admin guard patterns replaced with `requireAdmin()` from shared policy module
- `signalr/index.ts`: local `ADMIN_ROLES` constant and inline `.some()` check replaced with shared `isAdmin()`

**Acceptance criteria status:**
- [x] Authorization decisions no longer primarily implemented as scattered route-local one-offs
- [x] Shared policy layer can express delegated scope checks, role checks, workload checks, and ownership checks
- [x] Tests prove policy layer behavior and cover negative cases (60 tests across 14 describe blocks)

### Prompt 1-05 (P9-G5-05)

**Scope:** Code changes — oid field additions across models, handlers, and persistence layers.

**Verification results:**
- `@hbc/models build`: pass
- `@hbc/functions check-types`: pass (0 errors)
- `@hbc/functions lint`: pass (0 errors, 75 pre-existing warnings)
- `@hbc/functions build`: pass (clean compilation)
- `@hbc/functions test`: 52 files passed, 745 tests passed, 3 skipped
- Workspace `pnpm check-types`: all tasks pass except pre-existing `@hbc/spfx-leadership#build` failure (unrelated)

**What changed:**
- `IProjectSetupRequest`: added `submittedByOid?`, `completedByOid?`
- `IProvisionSiteRequest`: added `triggeredByOid?`, `submittedByOid?`
- `IProvisioningStatus`: added `triggeredByOid?`, `submittedByOid?`
- `submitProjectSetupRequest`: captures `auth.claims.oid` as `submittedByOid`
- `advanceRequestState`: captures `auth.claims.oid` as `completedByOid` on completion; propagates `submittedByOid` and `triggeredByOid` through auto-provisioning handoff
- `provisionProjectSite`: captures `auth.claims.oid` as `triggeredByOid` at trust boundary
- Table storage: serializes/deserializes `triggeredByOid` and `submittedByOid`
- SharePoint mapper: reads/writes `submittedByOid` and `completedByOid`
- `IProjectsListItem`: added `submittedByOid` and `completedByOid` fields

**Acceptance criteria status:**
- [x] Stable identity fields exist in repo-owned code where needed for ownership and actor attribution
- [x] Authorization-critical logic can rely on stable IDs (via `checkOwnership()` from P9-G5-04) even while older records work via UPN fallback
- [x] All oid fields are optional, preserving backward compatibility for pre-migration records

### Prompt 1-06 (P9-G5-06)

**Scope:** Code changes — core authorization convergence: env-var UPN authorization replaced with JWT app-role + oid ownership.

**Verification results:**
- `check-types`: pass (0 errors)
- `lint`: pass (0 errors, 76 pre-existing warnings)
- `build`: pass (clean compilation)
- `test`: 52 files passed, 764 tests passed, 3 skipped (was 745 — 19 new tests)

**What changed:**
- `resolveRequestRole()` in `state-machine.ts`: signature changed from `(callerUpn: string, request)` to `(claims: IValidatedClaims, request)`; implementation uses `isAdmin()`, `isBreakGlass()`, `isController()` from shared policy engine and `checkOwnership()` for oid-first submitter detection; zero env-var references
- `listProjectSetupRequests`: inline `ADMIN_UPNS`/`CONTROLLER_UPNS` env-var parsing removed; replaced with `isPrivileged(auth.claims)` and `checkOwnership()` for request scoping
- `getProjectSetupRequest` and `advanceRequestState`: call sites updated to pass `auth.claims` instead of `auth.claims.upn`
- Tests: Section C rewritten from env-var-based to claims-based; added oid ownership tests, HBIntel variant tests, BreakGlass resolution test, UPN fallback case-insensitivity test

**Acceptance criteria status:**
- [x] Request-lifecycle authorization no longer depends on env-based UPN lists
- [x] Submitter access is ownership/resource-based (oid-first, UPN-fallback via `checkOwnership()`)
- [x] Controller/admin access is role-based through the shared policy layer
- [x] Tests prove all major request lifecycle cases (19 new tests across role resolution and transition authorization)

### Prompt 1-07 (P9-G5-07)

**Scope:** Code changes — delegated scope enforcement (L2) added to all provisioning routes per route-policy matrix.

**Verification results:**
- `check-types`: pass (0 errors)
- `lint`: pass (0 errors, 78 pre-existing warnings)
- `build`: pass (clean compilation)
- `test`: 53 files passed, 777 tests passed, 3 skipped (was 52 files / 764 tests — 13 new tests)

**What changed:**
- All 10 provisioning routes in `provisioningSaga/index.ts` now call `requireDelegatedScope(auth.claims, requestId)` as the first authorization check after request ID extraction
- `getProvisioningStatus` and `retryProvisioning` handlers: added `auth` parameter (previously unused since they had no authorization check)
- Delegated-Open routes (5, 6, 9, 10): gain L2 scope check only
- Delegated-Privileged routes (7, 8, 11, 12, 13, 14): gain L2 scope check before existing L3 admin role check
- New test file: `provisioning-authorization.test.ts` with 13 tests covering L2 scope enforcement (positive, negative, app-only bypass) and L3 admin role enforcement (positive, negative), plus route classification alignment

**Acceptance criteria status:**
- [x] Privileged delegated routes use one coherent authorization model (L2 scope + L3 role via shared policy engine)
- [x] Route access aligns with the policy matrix from Prompt 1-02
- [x] Tests prove positive and negative authorization outcomes across provisioning/admin routes

### Prompt 1-08 (P9-G5-08)

**Scope:** Documentation + tests — workload authorization model formalized, timer identity independence confirmed.

**Verification results:**
- `check-types`: pass (0 errors)
- `lint`: pass (0 errors, 78 pre-existing warnings)
- `build`: pass (clean compilation)
- `test`: 54 files passed, 798 tests passed, 3 skipped (was 53 files / 777 tests — 21 new workload tests)

**What was done:**
- Created `Gap-5_Workload-and-Break-Glass-Model.md` documenting execution path classification (host-level trust for timers, delegated admin for manual trigger, future workload HTTP path via `requireWorkloadRole()`), app-only token support, break-glass model, and environment prerequisites
- Confirmed `timerFullSpec` and `cleanupIdempotency` have zero user identity dependencies — no auth claims, no UPN, no env-var role checks
- Created `workload-authorization.test.ts` with 21 tests covering: token-type detection (4), Delegated-Open route stack (3), Delegated-Privileged route stack (3), Workload route stack (4), break-glass role behavior (4), and cross-path isolation (3)

**Acceptance criteria status:**
- [x] Workload/app-only paths are explicit and documented — timer functions use host-level trust, manual trigger uses delegated admin
- [x] Authorization for automation paths is expressed in code (`requireWorkloadRole()`) and docs
- [x] Tests prove workload and delegated execution are distinguished correctly (21 tests)

### Prompt 1-09 (P9-G5-09)

**Scope:** Verification-only — no code changes required.

**Verification method:** Exhaustive read of all 7 frontend/SPFx files referenced in the prompt.

**Findings:**
- `mount.tsx`: Token acquisition chain is correct — `createSpfxApiTokenProvider(spfxContext, apiAudience)` acquires audience-scoped delegated tokens per-call; frontend/backend audience contract is documented (lines 55-58)
- `runtimeConfig.ts`: `checkProductionReadiness()` surfaces missing Function App URL and API token provider with actionable diagnostics; `getApiAudience()` has 3-tier resolution (runtime injection → Vite env → undefined)
- `ProjectSetupBackendContext.tsx`: P3-07 architecture freeze comment is accurate — documents SPFx, PWA, and ui-review token paths; correctly references `validateToken()` backend contract
- `api-client.ts`: Per-request `Authorization: Bearer ${token}` injection via `authFetch()` — no stale cookie-based patterns
- `visibility.ts`: Uses `session.resolvedRoles` (JWT roles) for provisioning visibility — already target pattern
- `authTransportContract.test.ts`: 6 tests validating per-call token acquisition, deprecated `resolveSessionToken` removal, Bearer injection, and complexity package API sync default
- `package-solution.json`: `access_as_user` delegated scope declared for `hb-intel-api-staging` resource

**Stale references found:** None. No references to old mixed auth model, env-var UPN authorization, or cookie-based auth in the Project Setup frontend surface.

**Acceptance criteria status:**
- [x] Frontend reflects the final delegated-caller auth contract accurately
- [x] Production-readiness/auth diagnostics clearly identify missing runtime prerequisites
- [x] Frontend contracts do not misrepresent or mask the backend authorization model

### Prompt 1-10 (P9-G5-10)

**Scope:** Code changes — authorization telemetry infrastructure and break-glass audit implementation.

**Verification results:**
- `check-types`: pass (0 errors)
- `lint`: pass (0 errors, 78 pre-existing warnings)
- `build`: pass (clean compilation)
- `test`: 54 files passed, 806 tests passed, 3 skipped (was 798 — 8 new tests)

**What changed:**
- `authorization.ts`: added `AuthzTelemetryEvent` interface and `emitAuthorizationTelemetry()` function — emits `authz.decision` for normal events and `authz.break_glass` for BreakGlass role usage; includes caller oid/upn, action, outcome, role, method, and correlationId
- `state-machine.ts`: `resolveRequestRole()` now accepts optional `logger` param; emits `authz.break_glass` when BreakGlass role resolves to admin (with callerOid and callerUpn); normal admin/controller/submitter resolution does not emit telemetry
- `projectRequests/index.ts`: passes `logger` to both `resolveRequestRole()` call sites; added `createLogger(context)` to `getProjectSetupRequest` handler
- `Gap-5_Workload-and-Break-Glass-Model.md`: §3.4 updated from "Deferred to Prompt 1-10" to implemented telemetry contract with event schema

**Acceptance criteria status:**
- [x] Privileged authorization outcomes are observable via structured `authz.break_glass` events
- [x] Break-glass behavior is explicit, role-based, and distinguishable from ordinary admin access
- [x] Telemetry contract documented in break-glass model doc with event properties and emission point

### Prompt 1-11 (P9-G5-11)

**Scope:** Release gates — static-analysis regression tests proving the Gap 5 authorization model is enforced.

**Verification results:**
- `check-types`: pass (0 errors)
- `lint`: pass (0 errors, 78 pre-existing warnings)
- `build`: pass (clean compilation)
- `test`: 55 files passed, 825 tests passed, 3 skipped (was 54 files / 806 tests — 19 new release gate assertions)

**Release gates implemented (6 suites, 19 assertions):**

| Gate | What It Proves | Assertions |
|------|---------------|-----------|
| G5-Gate-1 | Request lifecycle does not use env-var UPN authorization | 3 — state-machine.ts and projectRequests/index.ts free of ADMIN_UPNS/CONTROLLER_UPNS; resolveRequestRole accepts IValidatedClaims |
| G5-Gate-2 | All provisioning routes enforce delegated scope | 4 — requireDelegatedScope imported and called in every app.http route; no inline admin role checks remain |
| G5-Gate-3 | Shared policy engine is the single authorization source | 4 — canonical role constants, oid-first ownership, telemetry helper exported; signalr uses shared ADMIN_ROLES |
| G5-Gate-4 | Stable identity (oid) fields present in handlers | 4 — submittedByOid, completedByOid, triggeredByOid captured; table storage persists oid fields |
| G5-Gate-5 | Token validation supports app-only tokens | 2 — IValidatedClaims includes scp/idtyp; validateToken relaxes upn for app-only |
| G5-Gate-6 | Break-glass telemetry wired in role resolution | 2 — isBreakGlass + emitAuthorizationTelemetry in state-machine; optional logger param |

**Acceptance criteria status:**
- [x] Repo truth has machine-checkable proof that the new authorization model is enforced
- [x] Regression to env-based runtime authorization would fail Gate 1 and Gate 2
- [x] Test evidence is specific enough to support architecture and release decisions

### Prompt 1-12 (P9-G5-12)

**Scope:** Documentation-only — cutover runbook and rollback plan.

**Deliverable:** `Gap-5_Cutover-and-Rollback-Runbook.md` containing:
- Pre-cutover checklist (9 repo-complete items, 10 environment prerequisites)
- 4-phase cutover sequence (A: parallel deploy, B: Entra config, C: env-var reclassification, D: post-cutover verification)
- Live data migration guidance (lazy oid backfill strategy, UPN fallback for legacy records)
- Coexistence behavior matrix (what happens when code is deployed but Entra roles are partially assigned)
- Rollback plan (code rollback only — env-var restoration not applicable since new code doesn't read them)
- Post-cutover cleanup tasks (env-var reclassification, startup warning updates, optional oid backfill)

**Acceptance criteria status:**
- [x] Repo contains a usable cutover and rollback package for IT/operations
- [x] Docs clearly distinguish repo-complete work from environment-executed tasks
- [x] The old transitional authz posture is no longer represented as the intended steady state

---

## Version History

| Version | Date | Prompt | Summary |
|---------|------|--------|---------|
| 1.0 | 2026-04-01 | P9-G5-01 | Initial baseline and contract freeze — 3 documents created |
| 1.1 | 2026-04-01 | P9-G5-02 | Target authorization architecture and route-policy matrix frozen — 2 documents created, 3 design decisions resolved |
| 1.2 | 2026-04-01 | P9-G5-03 | Entra app-role and scope contract frozen — 6 app-roles, delegated scope, token differentiation, environment setup matrix |
| 2.0 | 2026-04-01 | P9-G5-04 | Shared authorization policy engine — new module, 60 tests, 6 admin guards consolidated, validateToken extended for app-only tokens |
| 2.1 | 2026-04-01 | P9-G5-05 | Oid migration — stable identity fields added to 3 model interfaces, 3 handlers, 2 persistence layers |
| 3.0 | 2026-04-01 | P9-G5-06 | Request lifecycle authorization convergence — resolveRequestRole() rewritten to JWT claims + oid ownership; env-var auth eliminated from all request lifecycle routes |
| 3.1 | 2026-04-01 | P9-G5-07 | Provisioning and admin route convergence — delegated scope enforcement (L2) added to all 10 provisioning routes; 13 authorization tests |
| 3.2 | 2026-04-01 | P9-G5-08 | Workload and break-glass model — timer identity independence confirmed, execution paths classified, 21 workload authorization tests |
| 3.3 | 2026-04-01 | P9-G5-09 | Frontend SPFx contract verification — all 7 frontend files confirmed aligned, no stale auth references, no code changes needed |
| 4.0 | 2026-04-01 | P9-G5-10 | Telemetry and break-glass auditability — emitAuthorizationTelemetry() + authz.break_glass event, 8 new tests |
| 4.1 | 2026-04-01 | P9-G5-11 | Release gates — 6 static-analysis gate suites with 19 assertions proving Gap 5 model enforced |
| 4.2 | 2026-04-01 | P9-G5-12 | Cutover and rollback runbook — 4-phase cutover sequence, rollback plan, coexistence guide |
