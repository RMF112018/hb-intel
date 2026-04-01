# Gap 5 Route-Policy Matrix

> **Created:** 2026-04-01 (P9-G5-02)
> **Status:** Frozen
> **Scope:** Definitive policy matrix for every Project Setup route and trigger — the implementation contract for Prompts 1-03 through 1-11

## How to Read This Matrix

Each route is classified by **surface type** and assigned a **policy stack** — the ordered set of authorization layers that must pass before the handler executes. The layers are defined in `Gap-5_Target-Authorization-Architecture.md`.

**Surface types:**

| Type | Description | Token | Layers |
|------|-------------|-------|--------|
| **Delegated-Open** | Any authenticated user with delegated scope | Delegated | L1 + L2 |
| **Delegated-Privileged** | Requires specific app-role | Delegated | L1 + L2 + L3 |
| **Delegated-Owner** | Requires app-role OR resource ownership | Delegated | L1 + L2 + L3 + L4 |
| **Delegated-Owner-Transition** | Ownership + state-transition matrix | Delegated | L1 + L2 + L3 + L4 + transition guard |
| **Workload** | App-only token with workload role | App-only | L1 + L5 |
| **Internal** | Platform-triggered, no HTTP auth | None | Host-level trust |

---

## 1. Request Lifecycle Routes

**File:** `backend/functions/src/functions/projectRequests/index.ts`

| # | Route | Method | Surface Type | Policy Stack | Claims Required | Current Auth | Change Required |
|---|-------|--------|-------------|-------------|-----------------|-------------|-----------------|
| 1 | `submitProjectSetupRequest` | POST | Delegated-Open | L1 → L2 | `aud`, `iss`, `scp:access_as_user`, `upn`, `oid` | `withAuth()` only | Add scope check (L2) |
| 2 | `listProjectSetupRequests` | GET | Delegated-Owner | L1 → L2 → L3 → L4 | `aud`, `iss`, `scp:access_as_user`, `upn`, `oid`, `roles` | Inline env-based UPN | Replace env-var privilege check with app-role check; scope own-request view by `oid` |
| 3 | `getProjectSetupRequest` | GET | Delegated-Owner | L1 → L2 → L3 → L4 | `aud`, `iss`, `scp:access_as_user`, `upn`, `oid`, `roles` | `resolveRequestRole()` env-based | Rewrite role resolution to use `claims.roles` + `oid` ownership |
| 4 | `advanceRequestState` | PATCH | Delegated-Owner-Transition | L1 → L2 → L3 → L4 → transition guard | `aud`, `iss`, `scp:access_as_user`, `upn`, `oid`, `roles` | `resolveRequestRole()` + `isAuthorizedTransition()` | Rewrite role resolution; transition matrix unchanged |

### Route 1 — `submitProjectSetupRequest` (POST)

**Policy:** Any authenticated user with delegated scope can submit a new request.

- **L1:** Token validated via `withAuth()`
- **L2:** Scope must include `access_as_user`
- **L3:** Not applied — no role requirement
- **L4:** Not applied — no existing resource to check ownership against
- **Post-auth:** Server records `auth.claims.upn` as `submittedBy` and `auth.claims.oid` as `submittedByOid`

**Change from current:** Add scope check. Add `oid` capture at record creation.

### Route 2 — `listProjectSetupRequests` (GET)

**Policy:** Privileged users (admin or controller app-role) see all requests. Non-privileged users see only their own requests, scoped by `oid`.

- **L1:** Token validated
- **L2:** Scope must include `access_as_user`
- **L3:** Check `claims.roles` for `Admin`/`HBIntelAdmin`/`Controller`/`HBIntelController`
  - If privileged → return all requests (optionally filtered by query params)
- **L4:** If not privileged → filter by `submittedByOid === claims.oid` (with UPN fallback for pre-migration records)

**Change from current:** Replace inline `ADMIN_UPNS`/`CONTROLLER_UPNS` env-var parsing (lines 197–200) with `claims.roles` check. Replace UPN-based scoping with `oid`-based scoping.

### Route 3 — `getProjectSetupRequest` (GET)

**Policy:** Admin, controller, or request owner can view a specific request. All others denied.

- **L1:** Token validated
- **L2:** Scope must include `access_as_user`
- **L3:** Check `claims.roles` — if admin or controller, grant access
- **L4:** If no privileged role, check `request.submittedByOid === claims.oid` (with UPN fallback)
- **Denied:** If neither privileged nor owner → 403 FORBIDDEN

**Change from current:** Replace `resolveRequestRole()` env-based check with `claims.roles` + `oid` ownership.

### Route 4 — `advanceRequestState` (PATCH)

**Policy:** Role-gated state transitions. Role resolved from JWT claims and `oid` ownership, then checked against the existing transition matrix.

- **L1:** Token validated
- **L2:** Scope must include `access_as_user`
- **L3 + L4:** Resolve role:
  - `claims.roles` includes Admin/HBIntelAdmin → `admin`
  - `claims.roles` includes Controller/HBIntelController → `controller`
  - `request.submittedByOid === claims.oid` → `submitter` (UPN fallback for legacy)
  - Otherwise → `system`
- **Transition guard:** `isAuthorizedTransition(role, from, to)` — unchanged matrix
- **Denied:** If `!isAuthorizedTransition()` → 403 FORBIDDEN

**Change from current:** Rewrite `resolveRequestRole()` to use `claims.roles` + `oid` instead of env vars + UPN. The `isAuthorizedTransition()` matrix and `CONTROLLER_TRANSITIONS` array are unchanged.

---

## 2. Provisioning Routes

**File:** `backend/functions/src/functions/provisioningSaga/index.ts`

| # | Route | Method | Surface Type | Policy Stack | Current Auth | Change Required |
|---|-------|--------|-------------|-------------|-------------|-----------------|
| 5 | `provisionProjectSite` | POST | Delegated-Open | L1 → L2 | `withAuth()` only | Add scope check (L2) |
| 6 | `getProvisioningStatus` | GET | Delegated-Open | L1 → L2 | `withAuth()` only | Add scope check (L2) |
| 7 | `listFailedRuns` | GET | Delegated-Privileged | L1 → L2 → L3 | JWT roles | Add scope check (L2); role check unchanged |
| 8 | `triggerTimerManually` | POST | Delegated-Privileged | L1 → L2 → L3 + env guard | JWT roles + env guard | Add scope check (L2); role + env guard unchanged |
| 9 | `retryProvisioning` | POST | Delegated-Open | L1 → L2 | `withAuth()` only | Add scope check (L2) |
| 10 | `escalateProvisioning` | POST | Delegated-Open | L1 → L2 | `withAuth()` only | Add scope check (L2) |
| 11 | `listProvisioningRuns` | GET | Delegated-Privileged | L1 → L2 → L3 | JWT roles | Add scope check (L2); role check unchanged |
| 12 | `archiveFailure` | POST | Delegated-Privileged | L1 → L2 → L3 | JWT roles | Add scope check (L2); role check unchanged |
| 13 | `acknowledgeEscalation` | POST | Delegated-Privileged | L1 → L2 → L3 | JWT roles | Add scope check (L2); role check unchanged |
| 14 | `forceStateTransition` | POST | Delegated-Privileged | L1 → L2 → L3 | JWT roles | Add scope check (L2); role check unchanged |

**Notes:**
- Routes 7–8, 11–14 already use the target JWT-role pattern. The only addition is delegated scope enforcement (L2).
- Routes 5–6, 9–10 are open to any authenticated user. They gain scope enforcement only.
- Route 8 retains the production environment guard (`AZURE_FUNCTIONS_ENVIRONMENT === 'Production'` → 403) as a non-auth safety check.

---

## 3. Timer / Internal Functions

| # | Function | Surface Type | Policy Stack | Current Auth | Change Required |
|---|----------|-------------|-------------|-------------|-----------------|
| 15 | `timerFullSpec` | Internal | Host-level trust | None | Document as platform-triggered; no HTTP auth path |
| 16 | `cleanupIdempotency` | Internal | Host-level trust | None | Document as platform-triggered; no HTTP auth path |

**Design note:** These timer functions execute within the Azure Functions host process. They invoke saga logic directly via function calls, not via HTTP. They do not pass through `withAuth()` and do not need Bearer tokens. If a future refactoring routes timer work through the HTTP API, those calls would use app-only tokens with the `Automation` app-role (Workload surface type).

---

## 4. Non-Route Authorization Surfaces

| Surface | File | Current Mechanism | Target Mechanism | Change Required |
|---------|------|-------------------|-----------------|-----------------|
| Notification recipient resolution | `notification-dispatch.ts:27–56` | `ADMIN_UPNS`/`CONTROLLER_UPNS` env vars | **Retained as notification-only config** (not an authorization input) | Reclassify env vars; update documentation |
| Frontend provisioning visibility | `visibility.ts:1–27` | `session.resolvedRoles` (JWT roles) | **Retained** — already target pattern | No change |
| Submit ownership capture | `projectRequests/index.ts:138` | `auth.claims.upn` → `submittedBy` | Add `auth.claims.oid` → `submittedByOid` alongside UPN | Add `oid` capture |
| Provisioning trigger identity | `provisioningSaga/index.ts:30` | `auth.claims.upn` → `triggeredBy` | Add `auth.claims.oid` → `triggeredByOid` alongside UPN | Add `oid` capture |
| Escalation actor | `provisioningSaga/index.ts:205` | `auth.claims.upn` → `escalatedBy` | Retain UPN — display/notification only, not authorization | No change |
| Archive/acknowledge actor | `provisioningSaga/index.ts:267,298` | `auth.claims.upn` | Retain UPN — audit display, not authorization | No change |
| Health endpoint role status | `health/index.ts:76–79` | Reports env-var presence | Update to reflect app-role model | Update labels and check logic |
| Startup validation | `service-factory.ts:74–81` | Warns on missing UPN env vars | Remove warnings for deprecated auth env vars | Remove or reclassify |

---

## 5. Consolidated Change Impact by Prompt

| Prompt | Routes/Surfaces Affected | Primary Change |
|--------|------------------------|---------------|
| 1-03 | — | Define Entra app-role and scope contract (input to all later prompts) |
| 1-04 | All routes | Build shared policy engine (L2 scope check, L3 role check helpers) |
| 1-05 | Routes 1–4, submit capture, trigger capture | Add `oid` fields to models, implement dual-write |
| 1-06 | Routes 1–4 | Rewrite `resolveRequestRole()`, replace inline env-var privilege check |
| 1-07 | Routes 5–14 | Add L2 scope enforcement to provisioning routes; standardize role check via shared policy engine |
| 1-08 | Routes 15–16, Route 8 | Formalize workload auth for timers; document app-only token handling |
| 1-09 | Frontend | Verify SPFx tokens include `roles` claim; add diagnostics |
| 1-10 | All routes | Add authorization telemetry, break-glass role, audit logging |
| 1-11 | All routes | Add exhaustive tests, release gates |
| 1-12 | — | Documentation, cutover runbook, rollback plan |

---

## 6. Scope Enforcement Implementation Note

Adding `scp` claim validation (Layer 2) is the only net-new authorization layer. Options for implementation:

**Option A — Middleware-level (recommended):** Create a `withDelegatedScope()` wrapper or extend `withAuth()` to optionally enforce scope. All interactive routes compose this. App-only paths use a separate `withWorkloadAuth()` wrapper.

**Option B — Per-handler check:** Each handler calls a `requireScope('access_as_user')` helper. More explicit, but duplicative.

**Recommendation for Prompt 1-04:** Option A — a composable middleware that can be stacked with `withAuth()`. This keeps the per-handler code minimal and makes the policy stack visible in the route registration.

---

## 7. Evidence Classification

### Confirmed Repo Facts
- All 16 routes and 2 timers inventoried with exact file paths and line numbers (Baseline Inventory, P9-G5-01)
- Provisioning admin routes already use JWT `roles` checks (provisioningSaga/index.ts)
- Request lifecycle routes use env-based UPN (state-machine.ts:36–48)
- No `scp` claim enforcement exists anywhere in the codebase
- Timer functions invoke saga logic directly, not via HTTP
- `isAuthorizedTransition()` matrix is purely role-based, independent of role resolution method

### Confirmed Microsoft-Guidance Facts
- Delegated tokens carry `scp`; app-only tokens carry `roles` with `idtyp=app`
- APIs should enforce delegated scope explicitly
- App roles assigned to managed identities appear in app-only token `roles` claim

### Design Decisions (Frozen in This Matrix)
- All routes gain delegated scope enforcement (L2) — this is the only structural addition to provisioning routes
- Request lifecycle role resolution migrates from env vars to JWT `roles` — transition matrix unchanged
- Notification recipient resolution is not an authorization concern — env vars reclassified
- Timer functions remain internal (host-level trust) unless refactored to HTTP
- `BreakGlass` role authorized at L3, same as admin, with mandatory audit telemetry
