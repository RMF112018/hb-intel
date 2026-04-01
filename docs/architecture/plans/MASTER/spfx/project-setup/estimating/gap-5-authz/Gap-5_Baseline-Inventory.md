# Gap 5 Baseline Inventory — Project Setup Authorization Surface

> **Created:** 2026-04-01 (P9-G5-01)
> **Status:** Baselined
> **Scope:** Inventory every authn/authz decision path retained in the Project Setup backend and frontend

## Executive Summary

Project Setup uses a dual authorization model across 16 HTTP routes and 2 timer functions. Request-lifecycle routes (`projectRequests/index.ts`) resolve caller roles via env-based UPN matching against `ADMIN_UPNS` and `CONTROLLER_UPNS`. Provisioning-admin routes (`provisioningSaga/index.ts`) check JWT `roles` claims for `Admin` or `HBIntelAdmin`. Both families share a common JWT authentication layer (`withAuth()` + `validateToken()`), which extracts `oid` as a required claim — but no model or persistence layer uses `oid` today. All identity fields in models are UPN-based.

This inventory covers every authorization surface that the Gap 5 convergence package must address.

---

## 1. Authentication Layer

### 1.1 Token Validation Pipeline

**File:** `backend/functions/src/middleware/validateToken.ts`

The `validateToken()` function (lines 184–261) validates Bearer tokens against Azure Entra ID JWKS and extracts structured claims:

```typescript
// IValidatedClaims interface (lines 144–164)
interface IValidatedClaims {
  upn: string;           // User Principal Name (required)
  oid: string;           // Object ID (required)
  roles: string[];       // Entra ID app roles (defaults to [])
  displayName?: string;  // JWT 'name' claim; falls back to upn
  jobTitle?: string;     // Optional claim
  tokenVersion?: string; // JWT 'ver' claim for diagnostics
}
```

**Key facts:**
- Both `upn` and `oid` are **required** — validation throws `TokenValidationError` with reason `missing_claims` if either is absent (lines 247–251)
- `roles` defaults to empty array when absent from token (line 257)
- Configuration uses lazy initialization — identity config resolved at first request, not module load (lines 98–138)
- Accepted issuers: both v1 (`sts.windows.net`) and v2 (`login.microsoftonline.com`) formats
- Audience validated against `API_AUDIENCE` env var (no implicit fallback in production)

**Evidence type:** Confirmed repo fact

### 1.2 withAuth() Wrapper

**File:** `backend/functions/src/middleware/auth.ts` (lines 49–95)

Wraps Azure Functions HTTP handlers with Bearer token authentication. Passes `AuthContext { userToken, claims: IValidatedClaims }` to every handler. Both `claims.upn` and `claims.roles` are available at every decision point. The choice between env-based UPN matching and JWT-role checking is made per-handler, not per-middleware.

**Evidence type:** Confirmed repo fact

---

## 2. Request Lifecycle Routes (Env-Based UPN Authorization)

All routes in `backend/functions/src/functions/projectRequests/index.ts`.

| Route | Method | Lines | Authorization Mechanism |
|-------|--------|-------|------------------------|
| `submitProjectSetupRequest` | POST | 100–174 | `withAuth()` only — any authenticated user |
| `listProjectSetupRequests` | GET | 181–218 | Inline env-based UPN check for privilege scoping |
| `getProjectSetupRequest` | GET | 225–245 | `resolveRequestRole()` — excludes `system` role |
| `advanceRequestState` | PATCH | 251–384 | `resolveRequestRole()` + `isAuthorizedTransition()` |

### 2.1 `resolveRequestRole()` — Env-Based UPN Resolution

**File:** `backend/functions/src/state-machine.ts` (lines 36–48)

```typescript
export function resolveRequestRole(
  callerUpn: string,
  request: IProjectSetupRequest,
): RequestRole {
  const adminUpns = (process.env.ADMIN_UPNS ?? '').split(',')
    .map((u) => u.trim().toLowerCase()).filter(Boolean);
  const controllerUpns = (process.env.CONTROLLER_UPNS ?? '').split(',')
    .map((u) => u.trim().toLowerCase()).filter(Boolean);
  const normalizedCaller = callerUpn.toLowerCase();

  if (adminUpns.includes(normalizedCaller)) return 'admin';
  if (controllerUpns.includes(normalizedCaller)) return 'controller';
  if (request.submittedBy.toLowerCase() === normalizedCaller) return 'submitter';
  return 'system';
}
```

**`RequestRole` type** (line 27): `'submitter' | 'controller' | 'admin' | 'system'`

**Resolution priority:** admin → controller → submitter → system (fallback)

**Key observations:**
- Reads `ADMIN_UPNS` / `CONTROLLER_UPNS` from `process.env` at **every call** — no caching
- Ownership check compares `request.submittedBy` by UPN (line 46) — not stable ID
- Missing env vars degrade to empty arrays — no admin/controller roles resolved

**Evidence type:** Confirmed repo fact

### 2.2 `isAuthorizedTransition()` — Role-Gated Transition Matrix

**File:** `backend/functions/src/state-machine.ts` (lines 69–84)

```typescript
const CONTROLLER_TRANSITIONS: Array<[ProjectSetupRequestState, ProjectSetupRequestState]> = [
  ['Submitted', 'UnderReview'],
  ['UnderReview', 'NeedsClarification'],
  ['UnderReview', 'AwaitingExternalSetup'],
  ['UnderReview', 'ReadyToProvision'],
  ['AwaitingExternalSetup', 'ReadyToProvision'],
  ['Failed', 'UnderReview'],
];
```

| Role | Authorization |
|------|--------------|
| `admin` | Any valid transition |
| `controller` | Only transitions in `CONTROLLER_TRANSITIONS` (6 named transitions, lines 54–61) |
| `submitter` | Only `NeedsClarification` → `UnderReview` |
| `system` | Only `ReadyToProvision` or `Provisioning` as source state (saga-internal) |

**Evidence type:** Confirmed repo fact

### 2.3 `submitProjectSetupRequest` (POST)

**Lines 100–174.** JWT authentication only — any authenticated user can submit. Caller UPN captured as `submittedBy`. No authorization gate.

**Evidence type:** Confirmed repo fact

### 2.4 `listProjectSetupRequests` (GET)

**Lines 181–218.** Inline env-based UPN parsing (lines 197–200):

```typescript
const adminUpns = (process.env.ADMIN_UPNS ?? '').split(',')
  .map((u) => u.trim().toLowerCase()).filter(Boolean);
const controllerUpns = (process.env.CONTROLLER_UPNS ?? '').split(',')
  .map((u) => u.trim().toLowerCase()).filter(Boolean);
const callerUpn = auth.claims.upn.toLowerCase();
const isPrivileged = adminUpns.includes(callerUpn) || controllerUpns.includes(callerUpn);
```

**Scoping rules:**
- Non-privileged: sees only own requests (filtered by `submittedBy` match)
- Privileged (admin or controller UPN match): sees all requests, optionally filtered by `state` or `submitterId`

**Note:** This is inline env-var parsing, not via `resolveRequestRole()`.

**Evidence type:** Confirmed repo fact

### 2.5 `getProjectSetupRequest` (GET)

**Lines 225–245.** Uses `resolveRequestRole()` (line 238). Denies access if role is `system` (403 FORBIDDEN). Submitters can view own request; controllers and admins can view any request.

**Evidence type:** Confirmed repo fact

### 2.6 `advanceRequestState` (PATCH)

**Lines 251–384.** Uses `resolveRequestRole()` + `isAuthorizedTransition()` (lines 282–286). The full state-machine authorization matrix applies. Special validation: `ReadyToProvision` requires valid `projectNumber` format. Auto-triggers provisioning saga on `ReadyToProvision` transition.

**Evidence type:** Confirmed repo fact

---

## 3. Provisioning Admin Routes (JWT-Role Authorization)

All routes in `backend/functions/src/functions/provisioningSaga/index.ts`.

### 3.1 JWT-Role-Gated Routes (6 routes)

All use identical guard pattern:

```typescript
if (!auth.claims.roles.some((role) => role === 'Admin' || role === 'HBIntelAdmin')) {
  return forbiddenResponse('Admin role required', requestId);
}
```

| Route | Method | Line | Additional Guards |
|-------|--------|------|-------------------|
| `listFailedRuns` | GET | 117 | — |
| `triggerTimerManually` | POST | 135 | Production environment block (line 140) |
| `listProvisioningRuns` | GET | 230 | — |
| `archiveFailure` | POST | 255 | Records `auth.claims.upn` as archiver (line 267) |
| `acknowledgeEscalation` | POST | 286 | Records `auth.claims.upn` as acknowledger (line 298) |
| `forceStateTransition` | POST | 321 | — |

**Evidence type:** Confirmed repo fact

### 3.2 Authn-Only Routes (4 routes)

| Route | Method | Lines | Notes |
|-------|--------|-------|-------|
| `provisionProjectSite` | POST | 19–73 | Server overwrites `triggeredBy` from JWT claims (line 30) |
| `getProvisioningStatus` | GET | 75–107 | Any authenticated user |
| `retryProvisioning` | POST | 149–185 | Any authenticated user |
| `escalateProvisioning` | POST | 187–217 | Records `auth.claims.upn` as escalator (line 205) |

**Evidence type:** Confirmed repo fact

---

## 4. Timer / Internal Functions (No Auth)

| Function | File | Schedule | Auth |
|----------|------|----------|------|
| `timerFullSpec` | `backend/functions/src/functions/timerFullSpec/index.ts` | `0 0 1 * * *` (1 AM nightly) | None — timer-triggered |
| `cleanupIdempotency` | `backend/functions/src/functions/cleanupIdempotency/index.ts` | `0 0 3 * * *` (3 AM nightly) | None — timer-triggered |

Both execute within the Azure Functions host without HTTP authentication. The target state requires workload/app-only authorization for these paths.

**Evidence type:** Confirmed repo fact

---

## 5. Notification Dispatch (Env-Based UPN)

**File:** `backend/functions/src/functions/provisioningSaga/notification-dispatch.ts` (lines 27–56)

`resolveRecipients()` resolves notification recipients by group:

| Group | Resolution | Source |
|-------|-----------|--------|
| `submitter` | `status.submittedBy` | UPN from provisioning status record |
| `controller` | `process.env.CONTROLLER_UPNS` | Env var, comma-split (line 39) |
| `group` | `status.groupMembers` + `status.groupLeaders` | UPN arrays from provisioning status |
| `admin` | `process.env.ADMIN_UPNS` | Env var, comma-split (line 48) |

**Key observation:** This is a directory-lookup use of env vars, not just an authorization check. Replacing env-based role resolution for request authorization does not automatically solve recipient resolution — the system needs to know *who* the admins and controllers are (by email/UPN), not just *whether* a caller is one.

**Evidence type:** Confirmed repo fact

---

## 6. Other Env-Based UPN Surfaces (Provisioning-Only)

These env vars use UPN-based identity but are outside the request-lifecycle authorization scope:

### 6.1 `OPEX_MANAGER_UPN`

**File:** `backend/functions/src/functions/provisioningSaga/steps/step6-permissions.ts` (lines 12–13)

Used in provisioning Step 6 to add the OpEx manager to the Leaders group. Throws if missing. Classified as `business` bucket, `requiredInProd: false` in `wave0-env-registry.ts` (line 156).

### 6.2 `DEPT_BACKGROUND_ACCESS_*`

**File:** `backend/functions/src/config/entra-group-definitions.ts`

`DEPT_BACKGROUND_ACCESS_COMMERCIAL` and `DEPT_BACKGROUND_ACCESS_LUXURY_RESIDENTIAL` provide UPNs for background read access to department-specific sites during provisioning. Classified as `business` bucket with `conditionalOn` department filters.

**Scope note:** These are provisioning-saga-internal concerns, not request-lifecycle authorization. They are inventoried here for completeness but are outside Gap 5's primary convergence scope.

**Evidence type:** Confirmed repo fact

---

## 7. Frontend / SPFx Authorization

### 7.1 Provisioning Visibility

**File:** `packages/provisioning/src/visibility.ts` (lines 1–27)

```typescript
const FULL_CHECKLIST_ROLES = ['Admin', 'HBIntelAdmin'];
```

Uses `session.resolvedRoles` (JWT `roles` claim array) to determine UI visibility. Also checks `session.user.email === submittedBy` for ownership-based visibility. **Already uses the modern JWT-role pattern.**

**Evidence type:** Confirmed repo fact

### 7.2 SPFx Permission Declaration

**File:** `apps/estimating/config/package-solution.json` (lines 10–15)

```json
"webApiPermissionRequests": [
  {
    "resource": "hb-intel-api-staging",
    "scope": "access_as_user"
  }
]
```

Declares `access_as_user` delegated scope. Resolved in Gap 1 (P9-G1).

**Evidence type:** Confirmed repo fact

### 7.3 Token Acquisition

**File:** `apps/estimating/src/mount.tsx` (lines 48–62)

SPFx production path: `createSpfxApiTokenProvider()` acquires audience-scoped tokens per-call via `aadTokenProviderFactory`. Frontend sends Bearer token; backend validates against `API_AUDIENCE`. The frontend token acquisition path does not need changes for Gap 5 — the token already carries `roles` and `oid` claims when present in the app registration.

**Evidence type:** Confirmed repo fact

---

## 8. Identity Fields in Models

**File:** `packages/models/src/provisioning/IProvisioning.ts`

### 8.1 `IProjectSetupRequest` (lines 119–205)

| Field | Type | Purpose |
|-------|------|---------|
| `submittedBy` | `string` | UPN of submitting Estimating Coordinator |
| `projectExecutiveUpn` | `string?` | UPN — person assignment |
| `projectManagerUpn` | `string?` | UPN — person assignment |
| `leadEstimatorUpn` | `string?` | UPN — person assignment |
| `supportingEstimatorUpns` | `string[]?` | UPN array — person assignment |
| `additionalTeamMemberUpns` | `string[]?` | UPN array — person assignment |
| `timberscanApproverUpn` | `string?` | UPN — person assignment |
| `sageAccessUpns` | `string[]?` | UPN array — access assignment |
| `viewerUPNs` | `string[]?` | UPN array — read-only access |
| `groupMembers` | `string[]` | UPN array — Team group membership |
| `groupLeaders` | `string[]?` | UPN array — Leaders group membership |

### 8.2 `IProvisionSiteRequest` (lines 26–45)

| Field | Type | Purpose |
|-------|------|---------|
| `triggeredBy` | `string` | UPN from validated Bearer token (server-set) |
| `submittedBy` | `string` | UPN of original submitter |
| `groupMembers` | `string[]` | UPN array — Team group |
| `groupLeaders` | `string[]?` | UPN array — Leaders group |

### 8.3 `IProvisioningStatus` (lines 51–83)

| Field | Type | Purpose |
|-------|------|---------|
| `triggeredBy` | `string` | UPN who triggered provisioning |
| `submittedBy` | `string` | UPN of original submitter |
| `groupMembers` | `string[]` | UPN array — Team group |
| `groupLeaders` | `string[]?` | UPN array — Leaders group |
| `escalatedBy` | `string?` | UPN who escalated |

### 8.4 Identity Gap

`oid` is extracted as a required claim in `validateToken.ts` and is available in every handler via `auth.claims.oid`. However, **no model interface includes an `oid` field**. All identity persistence is UPN-based. Ownership checks in `resolveRequestRole()` compare `request.submittedBy` (UPN) against `callerUpn` (UPN).

**Evidence type:** Confirmed repo fact

---

## 9. Startup Validation and Environment Configuration

### 9.1 Service Factory Startup Warnings

**File:** `backend/functions/src/hosts/project-setup/service-factory.ts` (lines 74–81)

```typescript
if (!isMock) {
  if (!process.env.CONTROLLER_UPNS) {
    console.warn('[StartupWarning] CONTROLLER_UPNS not set — role-based state transitions disabled for controllers.');
  }
  if (!process.env.ADMIN_UPNS) {
    console.warn('[StartupWarning] ADMIN_UPNS not set — admin role resolution disabled.');
  }
}
```

Missing env vars do **not** block startup — graceful degradation with warning logs.

### 9.2 Environment Registry Classification

**File:** `backend/functions/src/config/wave0-env-registry.ts` (lines 162–172)

| Env Var | Bucket | Required in Prod | Fallback |
|---------|--------|-----------------|----------|
| `CONTROLLER_UPNS` | `business` | `false` | Empty string → empty array |
| `ADMIN_UPNS` | `business` | `false` | Empty string → empty array |

### 9.3 Health Endpoint Reporting

**File:** `backend/functions/src/functions/health/index.ts` (lines 76–79)

Reports role configuration status as `configured` or `degraded` based on env var presence.

**Evidence type:** Confirmed repo fact

---

## 10. Consolidated Authorization Decision Table

| # | Route | File | Lines | Mechanism | Input Source | Stable ID (`oid`) Present? |
|---|-------|------|-------|-----------|-------------|---------------------------|
| 1 | `submitProjectSetupRequest` | `projectRequests/index.ts` | 100–174 | JWT authn only | — | N/A (no authz check) |
| 2 | `listProjectSetupRequests` | `projectRequests/index.ts` | 197–200 | Env-based UPN | `ADMIN_UPNS`, `CONTROLLER_UPNS` | No |
| 3 | `getProjectSetupRequest` | `projectRequests/index.ts` | 238 | Env-based UPN + ownership | `resolveRequestRole()` | No |
| 4 | `advanceRequestState` | `projectRequests/index.ts` | 282–286 | Env-based UPN + state machine | `resolveRequestRole()` + `isAuthorizedTransition()` | No |
| 5 | `provisionProjectSite` | `provisioningSaga/index.ts` | 19–73 | JWT authn only | — | N/A |
| 6 | `getProvisioningStatus` | `provisioningSaga/index.ts` | 75–107 | JWT authn only | — | N/A |
| 7 | `listFailedRuns` | `provisioningSaga/index.ts` | 117 | JWT roles | `auth.claims.roles` | N/A (role check, not ownership) |
| 8 | `triggerTimerManually` | `provisioningSaga/index.ts` | 135 | JWT roles + env guard | `auth.claims.roles` + `AZURE_FUNCTIONS_ENVIRONMENT` | N/A |
| 9 | `retryProvisioning` | `provisioningSaga/index.ts` | 149–185 | JWT authn only | — | N/A |
| 10 | `escalateProvisioning` | `provisioningSaga/index.ts` | 187–217 | JWT authn only | — | N/A |
| 11 | `listProvisioningRuns` | `provisioningSaga/index.ts` | 230 | JWT roles | `auth.claims.roles` | N/A |
| 12 | `archiveFailure` | `provisioningSaga/index.ts` | 255 | JWT roles | `auth.claims.roles` | N/A |
| 13 | `acknowledgeEscalation` | `provisioningSaga/index.ts` | 286 | JWT roles | `auth.claims.roles` | N/A |
| 14 | `forceStateTransition` | `provisioningSaga/index.ts` | 321 | JWT roles | `auth.claims.roles` | N/A |
| 15 | `timerFullSpec` | `timerFullSpec/index.ts` | — | None (timer) | Azure Functions host | N/A |
| 16 | `cleanupIdempotency` | `cleanupIdempotency/index.ts` | — | None (timer) | Azure Functions host | N/A |

**Non-route authorization surfaces:**

| Surface | File | Mechanism | Input Source |
|---------|------|-----------|-------------|
| Notification recipient resolution | `notification-dispatch.ts:27–56` | Env-based UPN | `CONTROLLER_UPNS`, `ADMIN_UPNS` |
| Provisioning visibility (frontend) | `visibility.ts:1–27` | JWT roles | `session.resolvedRoles` |
| Ownership check (submit) | `projectRequests/index.ts:138` | UPN comparison | `auth.claims.upn` → `submittedBy` |
| Ownership check (state machine) | `state-machine.ts:46` | UPN comparison | `request.submittedBy` vs `callerUpn` |
| Ownership check (visibility) | `visibility.ts` | Email comparison | `session.user.email` vs `submittedBy` |

---

## 11. Evidence Classification

### Confirmed Repo Facts

- Token validation extracts `oid` as a required claim (`validateToken.ts:247–257`)
- Request-lifecycle authorization uses env-based UPN matching (`state-machine.ts:36–48`)
- Provisioning-admin routes use JWT `roles` claim checks (`provisioningSaga/index.ts:117,135,230,255,286,321`)
- All identity fields in `IProjectSetupRequest`, `IProvisionSiteRequest`, and `IProvisioningStatus` are UPN-based — no `oid` fields exist
- Notification dispatch reads `CONTROLLER_UPNS` and `ADMIN_UPNS` from env vars for recipient resolution
- Frontend provisioning visibility uses JWT roles (`visibility.ts`)
- SPFx declares `access_as_user` delegated scope (`package-solution.json`)
- Startup warnings for missing UPN env vars do not block boot
- Timer functions have no HTTP authentication

### Confirmed Microsoft-Guidance Facts

- APIs should authorize the calling app via delegated scope for user-delegated access
- Stable claims (`oid`, `sub`) are preferred over mutable claims (`upn`, `email`) for identity
- App roles are the recommended mechanism for workload/app-only authorization
- Token overage and portability concerns apply to raw group claims

### Inferences

- The dual model was intentional (documented in P6-03, Phase 7, Phase 1-5 reports) but is now technical debt to be resolved
- Notification recipient resolution will require a different solution than simple role-claim checks (directory lookup vs authorization check)
- Existing table storage records with UPN-only identity will need a migration or fallback strategy

### Unresolved Items

| # | Item | Why It Matters | Expected Resolution |
|---|------|---------------|-------------------|
| 1 | Does a `Controller` app-role exist in Entra? | If not, migration requires app-registration changes | Prompt 1-03 |
| 2 | Do SPFx tokens include `roles` claims? | If scope doesn't request roles, JWT `roles` may be empty | Prompt 1-09 |
| 3 | How to resolve admin/controller recipients without env vars? | Notification dispatch needs a directory of people, not just a claim check | Prompt 1-02 |
| 4 | What is the oid backfill strategy for existing records? | Records in table storage have UPN-only identity | Prompt 1-05 |
| 5 | Should `submittedBy` ownership remain UPN-based or migrate to oid? | Ownership is request-relative, not a platform role | Prompt 1-05 |
