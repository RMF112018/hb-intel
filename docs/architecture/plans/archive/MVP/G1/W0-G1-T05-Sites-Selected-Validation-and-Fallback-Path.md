# W0-G1-T05 — Sites.Selected Validation and Fallback Path

> **Doc Classification:** Canonical Normative Plan — Wave 0 Group 1 task plan for service principal access validation. Governs how the provisioning service principal's SharePoint access is validated, what the preferred least-privilege path is, and what the fallback path is if the preferred path requires additional approval time. Determines G2 entry condition for step 6 implementation approach.

**Phase Reference:** Wave 0 Group 1 — Contracts and Configuration Plan
**Locked Decision Applied:** Decision 4 — preferred secure path first, with documented fallback
**Estimated Decision Effort:** Ongoing (external dependency on IT/security response time)
**Depends On:** T04 (environment separation requirements must be known before staging validation begins)
**Unlocks:** G2 step 6 implementation approach, T06 of MVP Project Setup plan set (permission bootstrap section)
**ADR Output:** Contributes to ADR-0114 (service principal access section); fallback activation requires a separate ADR

---

## Objective

Define the preferred access model for the HB Intel provisioning service principal, execute the validation plan against a staging SharePoint tenant, record the outcome, and — if the preferred path requires an approval timeline that would block G2 — formally document the fallback path and its governance requirements.

The output of this task is a reference document (`docs/reference/configuration/sites-selected-validation.md`) that records:
1. The preferred access model specification
2. The IT/security engagement record
3. The validation test results
4. The active path decision (preferred or fallback) and its governing conditions

---

## Why This Task Exists

The provisioning service principal (the Azure Function App's system-assigned Managed Identity) needs permission to create SharePoint sites, create document libraries and lists, upload files, set permissions, and associate sites with a hub. The access model chosen determines how permissive that service principal is across the tenant.

**Two paths exist:**

**Path A (preferred):** `Sites.Selected` application permission — the service principal is granted access only to specific sites. For provisioning, this means: at the time a new site is created, a tenant admin grants the service principal access to that specific new site. All other sites in the tenant are inaccessible to the service principal by default.

**Path B (fallback):** `Sites.FullControl.All` or tenant-scoped site collection admin — the service principal has access to all sites in the tenant (or a broad collection). This is easier to configure but dramatically increases the blast radius if the service principal is compromised.

The locked Decision 4 mandates Path A as the preferred approach. However, Path A requires explicit IT/security approval and a process for granting per-site access at provisioning time — a process that may take time to approve and implement. T05 exists to:
- Specify Path A in enough detail that IT/security can evaluate and approve it
- Execute the validation test in staging to confirm Path A works end-to-end
- If Path A approval is delayed, formally document Path B as a contingency — not normalize it as a shortcut

---

## Scope

T05 covers:

1. Specification of Path A (`Sites.Selected`): what permissions are required, how per-site access is granted at provisioning time, and what tenant admin action is required
2. Specification of Path B (fallback): what broader access model is used, what security review is required, and what constraints apply if activated
3. The validation plan for Path A in staging
4. IT/security engagement requirements and timeline
5. The Group 2 entry condition: what T05 outcome is required before G2 step 6 can begin its access-model-dependent code
6. Requirements for `Group.ReadWrite.All` permission (needed for T02's Entra ID group creation)

T05 does not cover:

- Azure infrastructure provisioning (enabling Managed Identity on the Function App — that is a prerequisite)
- Routine permission management after provisioning (that is a Wave 1+ operational concern)
- SharePoint governance model beyond what is required for provisioning
- Entra ID conditional access policies

---

## Governing Constraints

- **Locked Decision 4:** Path A is the preferred approach. Path B may only be activated if: (1) the validation test confirms Path A is technically unworkable in the target tenant, OR (2) IT/security approval for Path A is blocked and a time-bounded pilot delay is unacceptable. Path B activation requires its own ADR.
- **CLAUDE.md §1.2 Zero-Deviation Rule:** Normalizing Path B as the default approach (i.e., treating it as equivalent to Path A) is a Zero-Deviation Rule violation. The fallback is a temporary, governed concession — not a design choice.
- **Security principle:** Least-privilege access for automation principals is a non-negotiable design value in HB Intel. The Wave 0 provisioning service principal must not have broader access than it demonstrably needs.

---

## Long-Term Steady-State Target (Locked Direction)

> This section defines the long-term operating direction that all Wave 0 and post-Wave-0 access design decisions must respect. It is a locked input (see §Locked Interview Decisions in the Group 1 master plan) and cannot be reversed by convenience or cost-of-implementation arguments.

### Locked steady-state design goals

1. **Managed Identity remains the service identity** — the provisioning service must use its system-assigned Managed Identity as the service principal. No app registrations or client secrets in production.
2. **Site-specific access remains the normal permission doctrine** — the Managed Identity must not hold tenant-wide SharePoint access in steady state. Access must be scoped to individual sites that have been explicitly provisioned.
3. **The site grant/bootstrap step becomes automated and auditable** — the per-site grant process (Option A2, currently manual for the pilot) must be automated (Option A1) before Wave 0 expands beyond the pilot cohort. Manual grants are a temporary pilot bridge, not a scalable operating model.
4. **No broad tenant-wide access in steady state** — `Sites.FullControl.All` (Path B) is allowed only as a security-reviewed, time-bounded exception with an explicit return-to-Path-A commitment in an ADR. It must never be the default steady-state model.
5. **Operations are auditable** — every per-site access grant, every provisioning identity action, and every permission assignment must produce an AppInsights telemetry record.

### Pilot bridge model (Wave 0 initial cohort only)

Option A2 (manual per-site grant) is acceptable for the initial Wave 0 pilot because:
- The pilot is explicitly bounded to a small number of projects (target: 2–3)
- Each manual grant takes minutes for a tenant admin with the correct role
- IT/security has visibility and control over every grant

**Scale threshold for reassessment:** If the project count requiring provisioning exceeds the pilot cohort before Option A1 automation is implemented, the manual grant process becomes an operational bottleneck. The specific reassessment trigger is: **more than 3 projects queued for provisioning without an Option A1 automation implementation in place**. At that point, either Option A1 must be implemented before new provisioning runs, or the team must formally decide to temporarily widen the permission model (requiring a new ADR).

### What "automated site bootstrap" means (Option A1 target model)

In the Option A1 model:
- The provisioning saga includes a pre-provisioning step (Step 0 or a pre-step) that programmatically grants the Managed Identity `Sites.Selected` access to the new site's expected URL
- This step uses a tenant admin service account or a secondary privileged Managed Identity that holds `Sites.FullControl.All` only for this one bootstrap step
- All subsequent provisioning steps (1–7) execute under the per-site-scoped Managed Identity
- Every bootstrap grant is logged to AppInsights with the project ID, site URL, and timestamp

Option A1 planning must begin no later than when pilot provisioning runs begin. It is not post-Wave-0 scope — it must be ready before broader Wave 0 rollout.

---

---

## Current Auth Posture (Validated)

From live codebase inspection of `backend/functions/src/services/sharepoint-service.ts`:

```typescript
export class SharePointService implements ISharePointService {
  private readonly credential = new DefaultAzureCredential();
  // ...
  async createSite(projectId: string, projectNumber: string, projectName: string): Promise<string> {
    const tokenResponse = await this.credential.getToken(resource);
    // ...
  }
}
```

And `backend/functions/src/services/msal-obo-service.ts` (class naming is legacy; actual implementation is Managed Identity):

```typescript
export class ManagedIdentityOboService implements IMsalOboService {
  private readonly credential = new DefaultAzureCredential();
  async getSharePointToken(siteUrl: string): Promise<string> {
    const resource = `https://${tenantHost}/.default`;
    const tokenResponse = await this.credential.getToken(resource);
    return tokenResponse.token;
  }
}
```

The Function App uses `DefaultAzureCredential`, which in production resolves to the system-assigned Managed Identity. In local development, it resolves to the `AZURE_CLIENT_ID/SECRET` app registration. This is the correct pattern.

**What is not confirmed:**
- Whether the Managed Identity has been granted the required permissions in any tenant (dev, staging, production)
- Whether `Sites.Selected` grants can be applied to newly-created sites during a provisioning run
- Whether `Group.ReadWrite.All` has been granted to the Managed Identity

T05 validates these gaps.

---

## Path A — Preferred: `Sites.Selected` + Managed Identity

### What `Sites.Selected` Provides

`Sites.Selected` is a Microsoft Graph application permission that grants an Entra ID application (or Managed Identity) access only to specific SharePoint sites — not all sites in the tenant. Access is granted explicitly per site via a Graph API call by a tenant admin.

### Required Application Permissions

The provisioning Function App's Managed Identity requires the following Microsoft Graph application permissions:

| Permission | Scope | Purpose |
|-----------|-------|---------|
| `Sites.Selected` | Application | Create sites, manage libraries/lists on granted sites |
| `Group.ReadWrite.All` | Application | Create Entra ID security groups (T02 requirement) |

Both permissions require **tenant admin consent** (they are not delegated permissions). Neither can be self-assigned.

### Per-Site Grant Process

The `Sites.Selected` model requires an explicit grant at the time each new project site is provisioned. This is the mechanism:

1. The provisioning saga creates the new SharePoint site (Step 1, which uses the `ISharePointService.createSite` method)
2. **After site creation**, a tenant admin (or an authorized automation process) calls the Microsoft Graph API to grant the Managed Identity access to the new site:
   ```
   POST https://graph.microsoft.com/v1.0/sites/{siteId}/permissions
   {
     "roles": ["fullcontrol"],
     "grantedToIdentities": [{
       "application": {
         "id": "<managed-identity-app-id>",
         "displayName": "HB Intel Provisioning Function"
       }
     }]
   }
   ```
3. With the grant in place, Steps 2–7 can proceed (document library creation, list creation, permissions, hub association)

### Automation Requirement

For Wave 0 pilot, two approaches for the per-site grant step are possible:

**Option A1 — Pre-grant via a dedicated setup step (recommended):**
Add a Step 0 or a pre-step before Step 1 that calls Graph API to grant the Managed Identity `Sites.Selected` access to the would-be new site's URL (even before it exists, using the planned URL). This requires the Managed Identity to have `Sites.FullControl.All` momentarily or a tenant admin service account for this one step only. This is the cleanest but most complex approach.

**Option A2 — Tenant admin grant during pilot setup:**
For the Wave 0 pilot (2–3 projects), a tenant admin manually runs a Graph API call or PowerShell script to grant the Managed Identity access to each new site immediately after Step 1 completes. The saga pauses at a checkpoint waiting for the grant before continuing. This is manual but demonstrably secure and acceptable for a small pilot.

**Recommended Wave 0 approach:** Option A2 for pilot (initial 2–3 projects only), with Option A1 as the required implementation for any expansion beyond the initial pilot cohort. The pilot's limited scope makes manual grants workable. However, Option A1 is not optional for general availability — it is the locked steady-state target (see §Long-Term Steady-State Target above). Planning for Option A1 must begin concurrently with the pilot, not after it.

### Tenant Admin Action Required

For `Sites.Selected` to work, a tenant admin must:

1. Navigate to Entra ID → Enterprise Applications → find the Function App's Managed Identity
2. Grant `Sites.Selected` and `Group.ReadWrite.All` application permissions
3. Provide admin consent for both permissions

This action must be completed in the staging tenant before G2.2 validation runs. It must be repeated in the production tenant before pilot.

---

## Path A Validation Plan

Validation must be performed in the staging SharePoint tenant using the staging Function App's Managed Identity. It must not be performed in the production tenant.

### Prerequisites for Validation

- [ ] Staging Function App has system-assigned Managed Identity enabled
- [ ] IT/security has granted `Sites.Selected` and `Group.ReadWrite.All` to staging Managed Identity
- [ ] Staging SharePoint tenant URL is configured in staging Function App (`SHAREPOINT_TENANT_URL`)
- [ ] Staging hub site exists and `SHAREPOINT_HUB_SITE_ID` is configured

### Validation Test Cases

Each test case must be executed against the staging tenant and the result recorded.

**Test A-1: Site creation**
- Action: Trigger a provisioning run for a test project against the staging tenant
- Expected: A new SharePoint site is created at the expected URL
- Validates: `DefaultAzureCredential` resolves to the Managed Identity; the provisioning function has sufficient access to call `SPSite.Create` (or equivalent via PnPjs)

**Test A-2: Document library creation**
- Action: After Test A-1, confirm Step 2 completes (document library created in the new site)
- Expected: `Project Documents` library exists in the new site
- Validates: Per-site grant (if using Option A2) has been applied before Step 2 runs

**Test A-3: List creation**
- Action: Confirm Step 4 completes (all core lists created)
- Expected: 6 core lists exist in the new site with correct column schemas
- Validates: PnPjs list creation via Managed Identity works within the per-site grant

**Test A-4: Permission assignment**
- Action: Confirm Step 6 completes with Entra ID group creation and site assignment
- Expected: Three Entra ID security groups exist; site permission levels reflect group assignments
- Validates: `Group.ReadWrite.All` permission is working; PnPjs group permission assignment works

**Test A-5: Hub association**
- Action: Confirm Step 7 completes (hub association)
- Expected: New site appears as an associated site in the staging hub
- Validates: Hub association API via Managed Identity works

**Test A-6: Idempotency**
- Action: Re-trigger the same provisioning run (retry scenario)
- Expected: All steps skip idempotently; no duplicate artifacts; saga completes cleanly
- Validates: Idempotency checks work within the `Sites.Selected` access model

**Test A-7: Throttle handling (simulated)**
- Action: If possible in staging, inject a test that forces the `withRetry` utility to encounter a 429-like error from SharePoint
- Expected: Saga retries with backoff; `Retry-After` header is respected (after G2.1 enhancement)
- Validates: Retry mechanism does not loop indefinitely under throttle pressure

### Validation Recording Requirement

All test results (pass/fail, observed behavior, any errors, timing) must be recorded in `docs/reference/configuration/sites-selected-validation.md`. The record must include:
- Date of test
- Staging tenant URL
- Managed Identity App ID
- Result per test case
- Any remediation steps taken
- Final determination: Path A confirmed / Path A blocked (with reason)

---

## Path B — Fallback: Broader Access Scope

Path B is documented here as a contingency. It must not be treated as an equivalent alternative to Path A. It is a time-bounded, security-reviewed concession for cases where Path A approval delays would otherwise block the Wave 0 pilot entirely.

### When Path B May Be Activated

Path B may be activated ONLY if:
1. IT/security has been engaged per the engagement plan (see §IT/Security Engagement)
2. A specific, documented reason has been provided for why Path A cannot be approved within the required timeline
3. A separate ADR has been created documenting the fallback activation, the scope of the broader access, and the committed timeline for returning to Path A
4. The ADR has been reviewed by the architecture owner

### What Path B Means

Path B grants the provisioning Managed Identity `Sites.FullControl.All` application permission — access to all SharePoint sites in the tenant.

This is a significant security exposure. The Managed Identity can read from, write to, delete, and reconfigure any site in the tenant if compromised or misused.

Path B constraints (non-negotiable if activated):
- The Function App must be locked to its resource group with no public IP exposure (Azure Functions firewall rules)
- AppInsights alerting must be active and monitored for any provisioning calls against unexpected site URLs
- Path B must be reviewed by IT/security and have an expiry date — it must not persist indefinitely
- The committed timeline for returning to Path A must be stated in the ADR

### What Path B Does Not Authorize

- Path B does not authorize removing the `Retry-After` handling requirement (G2.1 remains mandatory)
- Path B does not authorize skipping Entra ID group creation (T02 remains mandatory)
- Path B does not remove the requirement to validate configuration at function startup (G2.6 remains mandatory)
- Path B does not mean the architecture is permanently acceptable as-is

---

## IT/Security Engagement Plan

The following IT/security actions must be initiated as early as Group 1 — do not wait for Group 1 to be fully locked before starting this engagement.

### Required Actions (in order)

1. **Identify the IT/security contact** who can approve Entra ID application permission grants and tenant admin consent. This person must have the Global Administrator or Application Administrator role in Entra ID.

2. **Submit a permission request** for:
   - `Sites.Selected` (Graph API application permission) — for the staging Managed Identity
   - `Group.ReadWrite.All` (Graph API application permission) — for the staging Managed Identity
   - Explanation of purpose: SharePoint site creation and Entra ID group management for the HB Intel project provisioning service

3. **Confirm the staging hub site exists** and that the staging Managed Identity can be granted access to it.

4. **Execute the staging validation tests** (see Path A Validation Plan) once permissions are granted.

5. **Submit production permission requests** after staging validation confirms the model works.

### Timeline Expectations

| Activity | Target Timing |
|----------|--------------|
| Initial permission request submitted | During Group 1 (do not defer to G2) |
| IT/security response expected | Within 2 weeks of request |
| Staging permissions granted | Within 3 weeks of request |
| Path A staging validation complete | Within 1 week of permissions granted |
| Production permission request submitted | Immediately after staging validation success |
| Decision: Path A confirmed or fallback required | No later than G2.2 start |

If the IT/security timeline exceeds this expectation, the fallback path decision must be made explicitly and recorded in the validation document.

---

## Group 2 Entry Condition (Sites.Selected Gate)

G2 step 6 implementation depends on the T05 outcome. Specifically:

**If Path A is confirmed (preferred):**
G2.2 (`Validate PnPjs + Managed Identity end-to-end`) proceeds against staging using `Sites.Selected`. Step 6 expansion (T02 group creation) proceeds with full confidence in the permission model.

**If Path A is pending and fallback is activated:**
G2 may proceed with `Sites.FullControl.All` against staging only. A note must be added to the provisioning step 6 implementation: `TODO: Replace Sites.FullControl.All with Sites.Selected per ADR-0{fallback-adr-number} when Path A is approved`. The fallback ADR number must be referenced in code.

**If Path A approval timeline is unknown:**
G2 step 6 must not proceed. The permission model for step 6 is a foundational architectural decision — implementing step 6 with an undefined permission model creates a code path that may require complete rewrite. Block G2 step 6 until T05 decision is recorded.

---

## Reference Document Requirements

T05 must produce `docs/reference/configuration/sites-selected-validation.md`. That document must include:

1. The preferred Path A specification (permissions required, per-site grant process, tenant admin action)
2. The pilot option chosen (Option A1 or A2) and rationale
3. IT/security engagement record (who was contacted, when, what was requested)
4. Validation test results (per test case, with dates and outcomes)
5. Final determination: Path A confirmed / Path B activated with ADR reference
6. If Path B: scope of fallback, constraints, expiry commitment

---

## Acceptance Criteria

- [ ] Path A specification is complete (permissions required, per-site grant mechanism, tenant admin action required)
- [ ] Path B fallback is fully specified (conditions for activation, constraints, ADR requirement)
- [ ] IT/security engagement has been initiated (permission request submitted)
- [ ] Staging validation plan is documented (7 test cases defined)
- [ ] Group 2 entry condition is clearly stated based on T05 outcome (3 cases: Path A confirmed, fallback activated, pending)
- [ ] `Group.ReadWrite.All` requirement is documented and linked to T02
- [ ] Long-term steady-state target is documented: automated least-privilege site bootstrap (Option A1) as the mandatory destination for any expansion beyond the pilot
- [ ] Pilot bridge model (Option A2) is explicitly bounded to the initial pilot cohort with a named scale threshold (>3 projects triggers mandatory reassessment)
- [ ] Option A1 planning is identified as a concurrent Wave 0 GA requirement, not post-Wave-0
- [ ] Reference document (`docs/reference/configuration/sites-selected-validation.md`) exists
- [ ] Reference document is added to `current-state-map.md §2` as "Reference"
- [ ] Staging validation tests have been executed and results recorded in the reference document
- [ ] Final path determination is recorded before G2 step 6 begins

---

## Known Risks and Pitfalls

**Risk T05-R1: IT/security engagement is delayed because it is not started early enough.** This risk is high-probability and high-impact. The `Sites.Selected` permission approval is an external dependency (roadmap §16.1). If not initiated during Group 1, it will block G2 step 6. Initiate the permission request the same week Group 1 begins — do not wait for T05 to be "complete."

**Risk T05-R2: Path B is quietly normalized.** If the fallback is activated without a formal ADR and a committed return timeline, it becomes the de facto permanent model. The ADR requirement and the constraints in this plan exist to prevent this.

**Risk T05-R3: Staging validation confirms Path A works, but production approval is still pending at pilot time.** The staging validation proves the technical model. Production permission approval is a separate process. Do not confuse staging success with production readiness. Confirm production permission grants are in place before pilot begins.

**Risk T05-R4: Option A2 (manual grants) normalized as the default model.** For a 2–3 project pilot, manual per-site grants are workable. They are NOT workable beyond the pilot. The scale threshold for mandatory reassessment is: **more than 3 projects requiring provisioning without Option A1 in place** (see §Long-Term Steady-State Target). Option A1 automation planning must begin concurrently with the pilot — not after it. If Option A1 is not implemented before the pilot cohort is exceeded, every additional provisioning run requires a manual IT intervention that creates scheduling risk and erodes trust in the system. This risk is designated HIGH PROBABILITY / HIGH IMPACT. Mitigate by including Option A1 as an explicit Wave 0 GA acceptance criteria, not a post-Wave-0 concern.

**Risk T05-R5: `Group.ReadWrite.All` is treated as a separate request and delayed.** Both `Sites.Selected` and `Group.ReadWrite.All` are required. Submit them together in the same permission request. If they are reviewed separately, the approval timeline may double.

---

## Follow-On Consumers

- **G2 step 6 expansion (T02):** T05's path determination directly gates what permission model step 6 uses for Entra ID group creation and SharePoint access.
- **T06 (MVP Project Setup plan set):** The permission bootstrap section of T06 uses T05's path determination to specify how `setGroupPermissions` is called and what the service principal's access scope is.
- **G6 (operational readiness):** The admin runbook must document the per-site grant procedure (Option A2 for pilot) so that IT/security staff can execute it without developer involvement.
- **G8 (CI/CD):** Deployment pipeline validation must confirm that required Graph API permissions (`Sites.Selected`, `Group.ReadWrite.All`) are active on the Managed Identity before a production deployment proceeds.

---

*End of W0-G1-T05 — Sites.Selected Validation and Fallback Path v1.1 (Corrected 2026-03-14: Long-Term Steady-State Target section added — automated least-privilege site bootstrap locked as mandatory destination; pilot bridge (Option A2) explicitly bounded to ≤3-project cohort with named scale threshold; Option A1 designated as concurrent Wave 0 GA requirement; Risk T05-R4 upgraded to HIGH/HIGH with specific reassessment trigger)*
