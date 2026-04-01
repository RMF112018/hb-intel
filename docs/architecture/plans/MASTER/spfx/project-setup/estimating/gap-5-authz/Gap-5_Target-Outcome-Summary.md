# Gap 5 Target Outcome Summary — Authorization Convergence

> **Created:** 2026-04-01 (P9-G5-01)
> **Status:** Frozen
> **Scope:** Define the exact target authorization posture for Project Setup

## Executive Summary

The target posture replaces the current dual authorization model (env-based UPN matching for request lifecycle, JWT app-roles for provisioning admin) with a single Microsoft Entra claim-based authorization architecture. All interactive authorization will derive from JWT claims. Privileged access will use app-role claims. Resource ownership will use stable `oid`-based identity. Workload/app-only execution will use dedicated app-roles assigned to managed identities. The `ADMIN_UPNS` and `CONTROLLER_UPNS` environment variables will be deprecated and removed from the authorization path.

---

## 1. Frozen Target Posture

| Concern | Current State | Target State |
|---------|--------------|-------------|
| **Request-state role resolution** | Env-based UPN matching (`ADMIN_UPNS`/`CONTROLLER_UPNS`) | JWT app-role claims (`Admin`/`HBIntelAdmin`, `Controller`/`HBIntelController`) |
| **Request ownership** | UPN comparison (`submittedBy` vs `callerUpn`) | `oid`-based comparison (`submittedByOid` vs `auth.claims.oid`) with UPN retained for display |
| **Provisioning admin gates** | JWT roles (`Admin`/`HBIntelAdmin`) | Retained — already target pattern |
| **List scoping (privilege check)** | Inline env-based UPN parsing | JWT app-role claim check |
| **Notification recipient resolution** | Env-based UPN (`CONTROLLER_UPNS`/`ADMIN_UPNS`) | TBD: Entra group query or configuration migration (unresolved — see §9) |
| **Timer/internal execution** | No auth | Workload/app-only roles via managed identity |
| **Frontend visibility** | JWT roles via `session.resolvedRoles` | Retained — already target pattern |
| **Break-glass override** | Not present | Explicit audited override app-role |
| **SPFx token acquisition** | `access_as_user` delegated scope | Retained; ensure `roles` claim populated |

---

## 2. Authorization Model Principles

1. **All interactive authorization derives from JWT claims** — no env-var-based role resolution at request time.
2. **Stable identity via `oid`/`sub`** — UPN is mutable (rename, domain change); `oid` is immutable within a tenant. Ownership and assignment checks use `oid`.
3. **App-role-driven privileged access** — admin and controller privileges assigned via Entra ID app-roles, not operator-configured UPN lists.
4. **Workload/app-only roles for automation** — timer functions and internal execution paths use app-only tokens with dedicated app-roles assigned to managed identities.
5. **No env-based UPN allowlists in steady state** — `ADMIN_UPNS` and `CONTROLLER_UPNS` are deprecated for authorization. Any transitional compatibility shim is time-bounded and explicitly documented.
6. **Separation of concerns preserved** — token validation, delegated scope enforcement, business-role authorization, resource ownership checks, and workload authorization remain distinct layers.

---

## 3. Route-by-Route Target Matrix

### Request Lifecycle Routes

| Route | Current Auth | Target Auth |
|-------|-------------|-------------|
| `submitProjectSetupRequest` (POST) | JWT authn only | JWT authn only (unchanged) |
| `listProjectSetupRequests` (GET) | Inline env-based UPN | JWT app-role check: privileged if `roles` includes `Admin`/`HBIntelAdmin`/`Controller`/`HBIntelController` |
| `getProjectSetupRequest` (GET) | `resolveRequestRole()` env-based | JWT app-role + `oid`-based ownership: admin/controller via `roles` claim, submitter via `oid` match |
| `advanceRequestState` (PATCH) | `resolveRequestRole()` + `isAuthorizedTransition()` | Rewritten `resolveRequestRole()` using `auth.claims.roles` + `oid`-based submitter check + same transition matrix |

### Provisioning Routes

| Route | Current Auth | Target Auth |
|-------|-------------|-------------|
| `provisionProjectSite` (POST) | JWT authn only | JWT authn only (unchanged) |
| `getProvisioningStatus` (GET) | JWT authn only | JWT authn only (unchanged) |
| `listFailedRuns` (GET) | JWT roles | Retained (unchanged) |
| `triggerTimerManually` (POST) | JWT roles + env guard | Retained (unchanged) |
| `retryProvisioning` (POST) | JWT authn only | JWT authn only (unchanged) |
| `escalateProvisioning` (POST) | JWT authn only | JWT authn only (unchanged) |
| `listProvisioningRuns` (GET) | JWT roles | Retained (unchanged) |
| `archiveFailure` (POST) | JWT roles | Retained (unchanged) |
| `acknowledgeEscalation` (POST) | JWT roles | Retained (unchanged) |
| `forceStateTransition` (POST) | JWT roles | Retained (unchanged) |

### Timer / Internal Functions

| Function | Current Auth | Target Auth |
|----------|-------------|-------------|
| `timerFullSpec` | None (timer) | Workload/app-only app-role on managed identity |
| `cleanupIdempotency` | None (timer) | Workload/app-only app-role on managed identity |

---

## 4. Identity Migration Target

### 4.1 Model Changes

All models that persist identity for ownership or assignment purposes gain an `oid` field alongside the existing UPN field:

| Model | Current Field | New Field | Purpose |
|-------|--------------|-----------|---------|
| `IProjectSetupRequest` | `submittedBy` (UPN) | `submittedByOid` (string) | Ownership identity |
| `IProvisionSiteRequest` | `triggeredBy` (UPN) | `triggeredByOid` (string) | Audit identity |
| `IProvisioningStatus` | `triggeredBy` (UPN) | `triggeredByOid` (string) | Audit identity |
| `IProvisioningStatus` | `submittedBy` (UPN) | `submittedByOid` (string) | Ownership identity |

**UPN fields are retained** for display, notification, and SharePoint group membership. UPN is not removed — it is no longer used for authorization decisions.

### 4.2 Dual-Write Period

During migration:
1. New records write both `oid` and UPN at creation time
2. Ownership checks prefer `oid` when present, fall back to UPN for pre-migration records
3. Backfill strategy for existing records determined in Prompt 1-05

### 4.3 Person-Assignment Fields

Fields like `projectExecutiveUpn`, `projectManagerUpn`, `groupMembers[]`, etc. remain UPN-based. These are SharePoint group membership inputs, not authorization inputs. They are not in scope for `oid` migration.

---

## 5. Environment Variable Deprecation Plan

| Env Var | Current Use | Target | Deprecation Path |
|---------|-------------|--------|-----------------|
| `ADMIN_UPNS` | `resolveRequestRole()`, `listProjectSetupRequests`, `notification-dispatch` | **Removed from authorization** | Replace with `Admin`/`HBIntelAdmin` app-role; notification recipient resolution requires separate solution |
| `CONTROLLER_UPNS` | `resolveRequestRole()`, `listProjectSetupRequests`, `notification-dispatch` | **Removed from authorization** | Replace with `Controller`/`HBIntelController` app-role; notification recipient resolution requires separate solution |
| `OPEX_MANAGER_UPN` | Step 6 permissions (provisioning) | **Out of scope** | Provisioning-saga-internal; not a request-lifecycle authorization concern |
| `DEPT_BACKGROUND_ACCESS_*` | Entra group definitions (provisioning) | **Out of scope** | Provisioning-saga-internal |

### Deprecation Sequence

1. Build new app-role-based `resolveRequestRole()` alongside existing implementation
2. Introduce feature flag or compatibility mode for gradual cutover
3. Remove env-var authorization path once Entra app-roles are confirmed assigned in all environments
4. Update startup validation and health endpoint to reflect new model
5. Remove `ADMIN_UPNS`/`CONTROLLER_UPNS` from env registry (or reclassify as notification-only if retained for that purpose)

---

## 6. Repo-Owned Blockers

| # | Blocker | Current State | Resolution Prompt |
|---|---------|--------------|-------------------|
| 1 | No `oid` fields in data models | All identity is UPN-based | Prompt 1-05 |
| 2 | `resolveRequestRole()` reads env vars | Not JWT-role-aware | Prompt 1-06 |
| 3 | `listProjectSetupRequests` inline env-var parsing | Duplicates env-based pattern | Prompt 1-06 |
| 4 | Notification dispatch reads env vars for recipients | No alternative directory lookup | Prompt 1-06 or 1-07 |
| 5 | Startup validation warns on missing UPN env vars | Must be updated when env vars are deprecated | Prompt 1-06 |
| 6 | Health endpoint reports role config from env vars | Must reflect new model | Prompt 1-06 |
| 7 | No shared authorization policy engine | Admin check pattern duplicated across handlers | Prompt 1-04 |
| 8 | No workload/app-only auth path for timers | Timer functions execute without identity | Prompt 1-08 |
| 9 | No break-glass mechanism | No explicit override role exists | Prompt 1-10 |
| 10 | No telemetry for authorization decisions | Authorization outcomes not systematically logged | Prompt 1-10 |

---

## 7. External Prerequisites

| # | Prerequisite | Owner | Required Before |
|---|-------------|-------|----------------|
| 1 | `Controller` (or `HBIntelController`) app-role created in Entra app registration | Entra admin / IT | Prompt 1-06 implementation |
| 2 | Users assigned to appropriate app-roles in Entra | Entra admin / IT | Production cutover |
| 3 | SPFx token acquisition includes `roles` claim | Depends on app registration scope config | Prompt 1-09 verification |
| 4 | Managed identity for timer function app has app-role assignment | Azure admin / IT | Prompt 1-08 implementation |
| 5 | IT runbook updated: configure app-roles instead of env vars | IT documentation | Production cutover |
| 6 | Existing data `oid` backfill (if required) | Ops / migration script | Post Prompt 1-05 |

---

## 8. Scope Boundary

### In Scope

- Rewrite `resolveRequestRole()` to use JWT `roles` claims
- Rewrite `listProjectSetupRequests` privilege check to use JWT `roles` claims
- Add `oid` fields to identity-bearing model interfaces
- Implement dual-write for `oid` + UPN at record creation
- Migrate ownership checks from UPN to `oid` comparison
- Build shared authorization policy engine for consistent role checks
- Formalize workload/app-only auth for timer functions
- Add break-glass override role
- Add authorization telemetry
- Update startup validation, health endpoint, and env registry
- Update all affected tests
- Document cutover, rollback, and operational runbook

### Out of Scope

- Authentication pipeline changes (`validateToken()` remains as-is)
- SPFx permission declaration changes (Gap 1 already resolved)
- `OPEX_MANAGER_UPN` migration (provisioning-internal)
- `DEPT_BACKGROUND_ACCESS_*` migration (provisioning-internal)
- Person-assignment UPN fields (`projectManagerUpn`, `groupMembers[]`, etc.) — these are SharePoint inputs, not authorization inputs
- Entra app registration execution (documented in runbook, executed by IT)

---

## 9. Unresolved Design Questions

| # | Question | Options | Impact | Expected Resolution |
|---|----------|---------|--------|-------------------|
| 1 | How to resolve admin/controller recipients for notifications without env vars? | (a) Query Entra group by app-role assignment via Graph API, (b) Maintain a separate config for notification recipients, (c) Keep env vars for notification-only purpose | Affects whether `ADMIN_UPNS`/`CONTROLLER_UPNS` can be fully removed | Prompt 1-02 |
| 2 | Should `submittedBy` ownership migrate to `oid` or remain UPN-based? | (a) Migrate to `oid`-based with UPN fallback, (b) Keep UPN for ownership since it doubles as display value | Affects model changes and migration scope | Prompt 1-05 |
| 3 | What is the backfill strategy for existing records without `oid`? | (a) One-time migration script, (b) Lazy backfill on next access, (c) Accept UPN fallback for historical records | Affects data migration complexity | Prompt 1-05 |
| 4 | Should the `Controller` app-role be `Controller` or `HBIntelController`? | Naming convention question — must align with existing `Admin`/`HBIntelAdmin` pattern | Affects app registration and all code references | Prompt 1-03 |
