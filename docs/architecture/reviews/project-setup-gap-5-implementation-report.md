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
| 1-05 | Oid Migration and Data Contract | Not started | — | — |
| 1-06 | Request Lifecycle Authorization Convergence | Not started | — | — |
| 1-07 | Provisioning and Admin Authorization Convergence | Not started | — | — |
| 1-08 | Workload and App-Only Authorization | Not started | — | — |
| 1-09 | Frontend SPFx Contract and Diagnostics | Not started | — | — |
| 1-10 | Telemetry, Break-Glass, and Auditability | Not started | — | — |
| 1-11 | Tests, Release Gates, and Security Hardening | Not started | — | — |
| 1-12 | Documentation, Cutover, and Rollback | Not started | — | — |
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

---

## Version History

| Version | Date | Prompt | Summary |
|---------|------|--------|---------|
| 1.0 | 2026-04-01 | P9-G5-01 | Initial baseline and contract freeze — 3 documents created |
| 1.1 | 2026-04-01 | P9-G5-02 | Target authorization architecture and route-policy matrix frozen — 2 documents created, 3 design decisions resolved |
| 1.2 | 2026-04-01 | P9-G5-03 | Entra app-role and scope contract frozen — 6 app-roles, delegated scope, token differentiation, environment setup matrix |
| 2.0 | 2026-04-01 | P9-G5-04 | Shared authorization policy engine — new module, 60 tests, 6 admin guards consolidated, validateToken extended for app-only tokens |
