# Gap 5 Cutover and Rollback Runbook

> **Created:** 2026-04-01 (P9-G5-12)
> **Status:** Ready for execution
> **Audience:** IT operations, Entra administrators, deployment engineers

## Executive Summary

This runbook covers the controlled cutover from the old hybrid authorization model (env-based UPN lists + JWT roles) to the new claim-based model (JWT app-roles + oid-based ownership) for the Project Setup / Estimating backend. All repo-owned code changes are complete (Prompts 1-01 through 1-11). The remaining work is environment-executed: Entra app-role creation, user/group assignment, and env-var reclassification.

---

## 1. Pre-Cutover Checklist

### 1.1 Repo-Complete Items (No Further Action)

| Item | Status | Evidence |
|------|--------|---------|
| Shared authorization policy engine | ✓ Complete | `middleware/authorization.ts` (P9-G5-04) |
| Stable `oid` identity fields in models | ✓ Complete | `IProjectSetupRequest.submittedByOid`, `IProvisioningStatus.triggeredByOid` (P9-G5-05) |
| `resolveRequestRole()` uses JWT claims + oid | ✓ Complete | `state-machine.ts` (P9-G5-06) |
| Inline env-var auth removed from request lifecycle | ✓ Complete | `projectRequests/index.ts` (P9-G5-06) |
| Delegated scope enforcement on all provisioning routes | ✓ Complete | `provisioningSaga/index.ts` (P9-G5-07) |
| App-only token support in `validateToken()` | ✓ Complete | `validateToken.ts` scp/idtyp extraction (P9-G5-04) |
| Break-glass telemetry | ✓ Complete | `authz.break_glass` event (P9-G5-10) |
| Release gates | ✓ Complete | 6 gate suites, 19 assertions (P9-G5-11) |
| Frontend SPFx contract verified | ✓ Complete | All 7 files aligned (P9-G5-09) |

### 1.2 Environment Prerequisites (Must Be Completed Before Cutover)

| # | Step | Owner | Verification |
|---|------|-------|-------------|
| 1 | `Controller` app-role exists on `hb-intel-api-{env}` app registration | Entra admin | Entra portal → App Registration → App roles |
| 2 | `HBIntelController` app-role exists (tenant alias) | Entra admin | Same as above |
| 3 | `BreakGlass` app-role exists | Entra admin | Same as above |
| 4 | `Automation` app-role exists (Application type) | Entra admin | Same as above |
| 5 | `Admin`/`HBIntelAdmin` app-roles already exist | Verify only | Provisioning admin routes already use these |
| 6 | Users from `ADMIN_UPNS` are assigned `Admin` or `HBIntelAdmin` app-role | Entra admin | User → Enterprise App → Users and groups |
| 7 | Users from `CONTROLLER_UPNS` are assigned `Controller` or `HBIntelController` app-role | Entra admin | Same as above |
| 8 | Break-glass group created and time-bounded via PIM (optional for initial release) | Security team | Entra PIM configuration |
| 9 | `access_as_user` scope approved in SharePoint admin center | Verify only | Already done (Gap 1) |
| 10 | `API_AUDIENCE` env var set in all deployment environments | Verify only | Already required since Phase 3 |

---

## 2. Cutover Sequence

### Phase A — Parallel Operation (Safe to Deploy Immediately)

The new code is backward-compatible. Deploy without environment changes:

1. **Deploy the updated backend** (`@hbc/functions` v0.0.108+)
2. **Verify health endpoint** returns successfully
3. **Verify existing flows work** — submitters can submit, controllers can advance states, admins can manage provisioning
4. **Monitor telemetry** for `auth.bearer.success` events (existing) and `handler.success` events

**Why this is safe:** The new `resolveRequestRole()` reads JWT `roles` claims. If users already have `Admin`/`HBIntelAdmin` app-roles assigned (which they do for provisioning admin routes), the request lifecycle will also recognize them. If `Controller` app-roles are not yet assigned, controllers will not be recognized — they fall through to submitter or system role based on ownership.

### Phase B — Entra Configuration

Execute environment prerequisites 1–8 from §1.2 above.

**Critical verification after each role assignment:**

```
1. Have the user sign out and sign back in (or wait for token refresh ~1 hour)
2. Navigate to an admin route (e.g., provisioning failures list)
3. Confirm access is granted
4. Check Application Insights for auth.bearer.success events with the user's UPN
```

### Phase C — Env-Var Reclassification

After Entra roles are confirmed working for all users:

1. **Update `wave0-env-registry.ts` descriptions** for `ADMIN_UPNS` and `CONTROLLER_UPNS`:
   - Change description to: "Notification-only: UPNs for email/notification recipient resolution. Not used for authorization (migrated to Entra app-roles in Gap 5)."
2. **Update `service-factory.ts` startup warnings** to remove misleading "role-based state transitions disabled" language
3. **Update health endpoint** role config labels to reflect app-role model
4. **Keep the env vars populated** — they are still used by `notification-dispatch.ts` for recipient resolution

### Phase D — Post-Cutover Verification

| Check | Method | Expected Result |
|-------|--------|----------------|
| Admin can list failed runs | Navigate to provisioning failures | 200 OK, data returned |
| Controller can advance Submitted → UnderReview | PATCH state transition | 200 OK, state changed |
| Submitter can view own request | GET request by ID | 200 OK, request returned |
| Submitter cannot view other's request | GET request by ID (different submitter) | 403 FORBIDDEN |
| Non-privileged user sees only own requests in list | GET list | Only own requests returned |
| Break-glass user can perform admin operations | Use BreakGlass role | 200 OK + `authz.break_glass` telemetry event |
| SPFx token carries `access_as_user` scope | Check browser devtools → network → token | `scp` claim present |

---

## 3. Live Data Migration — Stable Identity Fields

### 3.1 New Records

All records created after the backend update include `submittedByOid`, `triggeredByOid`, and `completedByOid` fields, captured from `auth.claims.oid` at creation time.

### 3.2 Pre-Migration Records

Records created before the update have `undefined` for all `*Oid` fields. The authorization system handles this gracefully:

- `checkOwnership()` prefers `submittedByOid` when present
- Falls back to case-insensitive UPN comparison when `submittedByOid` is absent
- Ownership resolution method is observable via the `method` field (`'oid'` or `'upn'`)

### 3.3 Backfill Strategy

**Lazy backfill (recommended):** No bulk migration needed. Pre-migration records use UPN fallback indefinitely. If UPN fallback noise in telemetry becomes excessive, a one-time backfill script can be written to:
1. Query all records from SharePoint/Table Storage
2. Resolve `upn` → `oid` via Microsoft Graph `GET /users/{upn}?$select=id`
3. Write `submittedByOid` to each record

This is optional and not blocking for cutover.

---

## 4. Rollback Plan

### 4.1 When to Rollback

Rollback is warranted if:
- Users assigned Entra app-roles cannot perform their expected operations
- The `resolveRequestRole()` function returns incorrect roles for a class of users
- SPFx token acquisition fails after Entra configuration changes
- Break-glass role does not grant emergency access when needed

### 4.2 Rollback Steps

**Option A — Code Rollback (Full):**

1. Revert to the previous backend deployment (`@hbc/functions` < v0.0.102)
2. Restore `ADMIN_UPNS` and `CONTROLLER_UPNS` env vars if they were removed
3. Verify request lifecycle authorization works with the old model

**Option B — Env-Var Restoration (Partial):**

Not applicable — the new code does not read `ADMIN_UPNS`/`CONTROLLER_UPNS` for authorization. A code rollback is required to restore env-var-based authorization.

### 4.3 Rollback Risk Assessment

| Scenario | Risk | Mitigation |
|----------|------|-----------|
| Code rollback loses oid fields in new records | Low — `submittedByOid` is optional; old code ignores it | No data loss; field simply unused |
| Users lose access during Entra role reassignment | Medium — token refresh delay | Have users sign out and back in; or wait ~1 hour |
| Break-glass group not set up before incident | Medium — no emergency override available | Assign BreakGlass role to a named admin as immediate fallback |

---

## 5. Coexistence Behavior

During the transition period (new code deployed, Entra roles partially assigned):

| Scenario | Behavior |
|----------|----------|
| User has `Admin` app-role in token | Recognized as admin by new code ✓ |
| User in `ADMIN_UPNS` but no app-role | **Not recognized as admin** — falls to submitter or system |
| User has `Controller` app-role in token | Recognized as controller ✓ |
| User in `CONTROLLER_UPNS` but no app-role | **Not recognized as controller** |
| Submitter accesses own request (new record with oid) | Recognized via oid match ✓ |
| Submitter accesses own request (legacy record without oid) | Recognized via UPN fallback ✓ |

**Critical implication:** Deploy Phase B (Entra configuration) promptly after Phase A (code deployment) to avoid a window where controllers lose access.

---

## 6. Post-Cutover Cleanup (Future)

These items are not blocking for cutover but should be addressed post-launch:

| Item | Priority | Description |
|------|----------|-------------|
| Reclassify env vars in `wave0-env-registry.ts` | Medium | Update descriptions to reflect notification-only use |
| Update startup warnings in `service-factory.ts` | Low | Remove "role-based state transitions disabled" warning |
| Update health endpoint labels | Low | Reflect app-role model instead of env-var config status |
| Evaluate Graph API recipient resolution | Low | Replace `ADMIN_UPNS`/`CONTROLLER_UPNS` for notification dispatch if operational burden warrants |
| Optional oid backfill for legacy records | Low | Run if UPN fallback telemetry noise is excessive |
