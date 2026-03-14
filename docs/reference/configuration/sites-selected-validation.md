# Sites.Selected Validation and Fallback Path

**Traceability:** W0-G1-T05
**Classification:** Living Reference (Diátaxis Reference quadrant)
**Version:** 1.0
**Last Updated:** 2026-03-14

---

## 1. Permission Model Overview

HB Intel backend functions authenticate to Microsoft Graph and SharePoint using a **Managed Identity** (or app registration in dev) via `DefaultAzureCredential` from `@azure/identity`. The current implementation in `sharepoint-service.ts` acquires tokens with the `.default` scope pattern:

```typescript
const credential = new DefaultAzureCredential();
// Token acquired with: https://graph.microsoft.com/.default
```

This document defines the two supported permission paths (A and B) for SharePoint site-level access, the validation procedure for confirming which path is active, and the fallback governance model.

---

## 2. Path A — Sites.Selected (Preferred)

**Sites.Selected** is the least-privilege Graph API application permission for site-scoped access. It grants the application access only to explicitly designated SharePoint sites, rather than all sites in the tenant.

### Required Permissions

| Permission | Type | Scope | Purpose |
|---|---|---|---|
| `Sites.Selected` | Application | Graph API | Per-site access grants to provisioned project sites |
| `Group.ReadWrite.All` | Application | Graph API | Entra ID security group lifecycle (create, populate, delete) |

### Per-Site Grant Mechanism

After a site is provisioned, a tenant administrator (or the bootstrap identity in Option A1) must grant the application access to that specific site via the Graph API:

```http
POST /sites/{siteId}/permissions
Content-Type: application/json

{
  "roles": ["write"],
  "grantedToIdentities": [{
    "application": {
      "id": "<managed-identity-app-id>",
      "displayName": "HB Intel Backend"
    }
  }]
}
```

### Tenant Admin Action Steps

1. Confirm `Sites.Selected` is consented in the Entra ID app registration (or Managed Identity enterprise app)
2. After each site provisioning, execute the per-site grant POST (manual or automated)
3. Verify the grant by querying `GET /sites/{siteId}/permissions`
4. Record the grant in the IT/Security engagement tracker (§7)

---

## 3. Option A2 — Pilot Bridge Model

For initial Wave 0 pilot deployment (≤3 projects), per-site grants may be performed **manually** by a tenant administrator:

- **Scope:** Bounded to ≤3 provisioned project sites
- **Procedure:** Admin executes the Graph POST per §2 after each provisioning run
- **Scale threshold:** When the 4th project is provisioned, Option A1 (automated bootstrap) must be reassessed
- **Tracking:** Each manual grant is logged in the §7 engagement tracker with date, site URL, and admin who performed the grant

This model is acceptable for Wave 0 pilot because:
- Project volume is low (≤3 sites)
- Manual verification provides a learning period for IT/Security
- No privileged automation identity is required

---

## 4. Option A1 — Automated Site Bootstrap (Long-Term Target)

For production-scale operation, per-site grants should be automated as a **pre-provisioning Step 0** in the saga:

### Concept

1. A **privileged bootstrap identity** (separate from the main Managed Identity) holds `Sites.FullControl.All` or equivalent admin consent
2. Step 0 of the provisioning saga uses this identity to grant `Sites.Selected` access to the main MI for the newly created site
3. All subsequent saga steps (1–8) run under the main MI with only `Sites.Selected` scope
4. Step 0 execution is logged to **Application Insights** for audit

### Requirements

- Dedicated bootstrap identity with narrowly scoped admin consent
- AppInsights audit trail for every Step 0 invocation
- Must be implemented **concurrently with Wave 0 GA** — not deferred to post-Wave-0
- Bootstrap identity credentials stored in Key Vault with rotation policy

### Current Status

Option A1 is a **future G2/G6/G8 scope** item. This document defines the concept; implementation is not part of T05.

---

## 5. Path B — Fallback (Governed Exception Only)

Path B uses `Sites.FullControl.All` as a tenant-wide permission grant. This is a **governed exception** — it may only be activated under specific conditions and with explicit constraints.

### Activation Conditions

Path B may be activated only when **one of these three cases** is confirmed:

| Case | Condition |
|---|---|
| **B-1** | Tenant admin policy prohibits `Sites.Selected` grants entirely |
| **B-2** | `Sites.Selected` per-site grants fail due to a platform bug or tenant configuration issue after documented troubleshooting |
| **B-3** | Timeline pressure requires immediate deployment and `Sites.Selected` validation cannot complete within the deployment window |

### Constraints

- **ADR required:** An ADR must be created documenting the activation case, justification, and expiry commitment
- **Time-bounded:** Path B activation must include a committed date by which Path A will be re-evaluated
- **Expiry commitment:** The ADR must specify a maximum duration (recommended: 90 days) after which Path B must be re-assessed
- **Monitoring:** All site operations under Path B must be logged to Application Insights

### What Path B Does NOT Authorize

- Permanent use of `Sites.FullControl.All` without re-assessment
- Skipping the ADR documentation requirement
- Bypassing the IT/Security engagement process (§7)
- Using `Sites.FullControl.All` as the default recommendation for new tenants

---

## 6. Required Graph API Permissions (Summary)

| Permission | Path | Required | Purpose |
|---|---|---|---|
| `Sites.Selected` | **A** (preferred) | Yes | Per-site scoped access to provisioned project sites |
| `Group.ReadWrite.All` | **A** and **B** | Yes | Entra ID security group lifecycle (T02 dependency) |
| `Sites.FullControl.All` | **B** (fallback) | Only if Path B activated | Tenant-wide site access — governed exception, ADR required |

---

## 7. IT/Security Engagement Record

### Permission Request Template

When engaging IT/Security for permission consent, use the following fields:

| Field | Value |
|---|---|
| **Application Name** | HB Intel Backend |
| **Application ID** | `<managed-identity-app-id or app-registration-id>` |
| **Requested Permissions** | `Sites.Selected`, `Group.ReadWrite.All` |
| **Justification** | Provisioning saga requires per-site SharePoint access and Entra ID group management for project site lifecycle |
| **Scope** | Per-site grants only (no tenant-wide site access) |
| **Data Access** | Project site document libraries, lists, and permissions only |
| **Audit Trail** | All operations logged to Application Insights |
| **Requested By** | `<requestor name and role>` |
| **Date Submitted** | `<date>` |

### Engagement Status Tracker

| Date | Action | Status | Notes |
|---|---|---|---|
| _YYYY-MM-DD_ | _Initial permission request submitted_ | _Pending / Approved / Denied_ | _Details_ |
| _YYYY-MM-DD_ | _Follow-up / escalation_ | _Pending / Approved / Denied_ | _Details_ |
| _YYYY-MM-DD_ | _Consent granted in Entra ID_ | _Complete_ | _Admin who granted, confirmation screenshot_ |

---

## 8. Staging Validation Test Cases

The following test cases must be executed in a staging tenant to validate the chosen permission path before production deployment.

### Test Matrix

| ID | Test Case | Expected Result |
|---|---|---|
| **A-1** | Create a new SharePoint site via Graph API using the Managed Identity | Site created successfully; site ID returned |
| **A-2** | Create a document library on the provisioned site | Document library created with correct schema |
| **A-3** | Create a SharePoint list on the provisioned site | List created with expected columns and content types |
| **A-4** | Assign an Entra ID security group to a SharePoint permission level | Group appears in site permissions with correct role |
| **A-5** | Associate the site with the hub site (`SHAREPOINT_HUB_SITE_ID`) | Site listed as associated in hub site membership |
| **A-6** | Re-run the provisioning saga for an already-provisioned site (idempotency) | No duplicate resources created; saga completes without error |
| **A-7** | Trigger Graph API throttling (429) and verify retry behavior | Retry-After header respected; operation completes after backoff |

### Validation Recording

| Field | Value |
|---|---|
| **Validation Date** | _YYYY-MM-DD_ |
| **Tenant URL** | _https://tenant.sharepoint.com_ |
| **Managed Identity App ID** | _<app-id>_ |
| **Permission Path** | _A (Sites.Selected) / B (FullControl)_ |

| Test ID | Result | Remediation | Notes |
|---|---|---|---|
| A-1 | _Pass / Fail_ | _N/A or description_ | |
| A-2 | _Pass / Fail_ | _N/A or description_ | |
| A-3 | _Pass / Fail_ | _N/A or description_ | |
| A-4 | _Pass / Fail_ | _N/A or description_ | |
| A-5 | _Pass / Fail_ | _N/A or description_ | |
| A-6 | _Pass / Fail_ | _N/A or description_ | |
| A-7 | _Pass / Fail_ | _N/A or description_ | |

**Final Determination:** _Path A confirmed / Path B activated (cite case B-1/B-2/B-3)_

---

## 9. Group 2 Entry Condition Matrix

T05 produces a **GO / NO-GO determination** that gates Group 2 (G2) implementation work:

| Condition | G2 Status | Constraints |
|---|---|---|
| Path A confirmed (Sites.Selected validated in staging) | **GO** | Proceed with G2 implementation using Sites.Selected |
| Path B activated (governed exception, ADR created) | **GO** (with constraints) | Proceed with G2 using FullControl; ADR expiry commitment applies; re-assess at expiry |
| Pending (neither path validated nor exception granted) | **BLOCKED** | G2 implementation must not begin; escalate to IT/Security |

---

## 10. Current Auth Posture

The following code references document the current authentication implementation relevant to T05:

| File | Reference | Notes |
|---|---|---|
| `backend/functions/src/services/sharepoint-service.ts` | `DefaultAzureCredential` + `.default` scope | Primary SharePoint access path; uses `@pnp/sp` with custom auth |
| `backend/functions/src/services/msal-obo-service.ts` | On-behalf-of flow scaffold | Delegated user context for frontend-initiated operations |
| `backend/functions/src/services/graph-service.ts` | `IGraphService` interface + mock | G2 scaffold; real implementation throws "G2 pending" |

The current `.default` scope pattern means the application receives whatever permissions are consented in Entra ID. T05 does not change this pattern — it documents which permissions should be consented and validates them in staging.

---

## 11. Known Risks

| Risk ID | Risk | Mitigation |
|---|---|---|
| **T05-R1** | Tenant admin denies `Sites.Selected` consent | Escalation path via IT/Security engagement (§7); Path B fallback available |
| **T05-R2** | `Sites.Selected` per-site grants fail silently | Staging validation test A-4 catches this; Graph API error handling in saga |
| **T05-R3** | Path B (FullControl) becomes permanent without re-assessment | ADR expiry commitment (§5) enforces time-bounded review |
| **T05-R4** | Manual per-site grants (Option A2) do not scale beyond pilot | Scale threshold (§3) triggers A1 reassessment at 4th project |
| **T05-R5** | Bootstrap identity (Option A1) credentials compromised | Key Vault storage + rotation policy + AppInsights audit (§4) |

---

## 12. Follow-On Consumers

This document is consumed by the following downstream work items:

| Consumer | Dependency |
|---|---|
| **G2 Step 6** (Set Permissions) | Requires T05 GO determination to implement real Graph API calls |
| **T06** (Provisioning saga integration) | Uses permission model to configure saga step authentication |
| **G6 Runbook** (Operations) | References this document for permission troubleshooting and re-validation |
| **G8 CI/CD** | May automate Option A1 bootstrap in deployment pipeline |

---

## 13. Related Documents

- [Wave 0 Config Registry](./wave-0-config-registry.md) — `SITES_PERMISSION_MODEL` env var definition
- [Entra ID Group Model](../provisioning/entra-id-group-model.md) — Three-group model requiring `Group.ReadWrite.All`
- [Saga Steps Reference](../provisioning/saga-steps.md) — Step-by-step provisioning contract
