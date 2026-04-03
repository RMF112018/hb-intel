# Admin SPFx IT Control Center — Install/Bootstrap Operator Runbook

**Prompt:** P6-10
**Date:** 2026-04-03
**Purpose:** Practical operator guidance for running the HB Intel install/bootstrap flow.

---

## When to run preflight

Run preflight **before every install attempt**. Navigate to the Setup lane (`/setup`) and click **Run Preflight Checks**.

Preflight validates:
- Core backend configuration (tenant ID, client ID, table storage, app insights)
- Managed identity and Graph API permissions
- SharePoint tenant URL, app catalog, and SPFx app ID
- Entra app registration prerequisites
- Adapter mode (proxy for production, mock for development)

**Wait to launch install until preflight shows "Ready to Install."**

---

## How to interpret blockers vs warnings

| Indicator | Meaning | Action |
|-----------|---------|--------|
| **Pass** (green) | Check succeeded | No action needed |
| **Fail** (red, blocking) | Critical prerequisite missing — install will not succeed | Fix the issue before launching. Follow the "Recommended" guidance shown. |
| **Warning** (yellow, non-blocking) | Non-critical issue — install can proceed | Review the recommendation. The issue may cause a specific step to skip or degrade. |

The **Launch Install** button is disabled until all blocking checks pass.

---

## When to launch install

Launch install when:
1. Preflight shows **Ready to Install**
2. You have confirmed the environment is the correct target (tenant, subscription, resource group)
3. You are prepared to respond to checkpoint prompts within a reasonable time (the install pauses and waits)

Click **Launch Install** on the Setup page. You will be automatically navigated to the run detail view.

---

## What to do at a checkpoint

The install has 2 checkpoint steps that require manual action in external admin portals:

### Checkpoint 1: Grant API Permissions (step 10)

1. Navigate to **Entra admin portal** → App registrations → Select the HB Intel app
2. Go to **API permissions**
3. Click **Grant admin consent for [your tenant]**
4. Verify the Status column shows **Granted** for all permissions
5. Return to the install run detail page and click **Approve & Resume**

### Checkpoint 2: Approve SharePoint API Access (step 12)

1. Navigate to **SharePoint admin center** → API access
2. Find the pending request for HB Intel
3. Click **Approve**
4. Verify the request shows **Approved** status
5. Return to the install run detail page and click **Approve & Resume**

### If you cannot complete the manual action

- Click **Reject** with a comment explaining why (e.g., "Insufficient permissions — escalating to tenant admin")
- The install will stop at the current step
- You can retry the install later after resolving the blocker

---

## How to review verification results

After the install completes, the run detail page shows a **Run Post-Install Verification** button.

Verification checks:
1. Function App health — confirms the backend is responding
2. Table Storage access — confirms persistence is operational
3. Graph API access — confirms Entra permissions are active
4. SharePoint tenant — confirms SharePoint connectivity
5. SPFx package — confirms the app package is in the catalog
6. API permissions — confirms Graph permissions + proxy adapter mode

**All Passed** = environment is operational. **Issues Detected** = review the failing checks and take corrective action.

---

## When to escalate

Escalate to a platform administrator or DevOps team when:
- Preflight fails on infrastructure configuration you cannot change (subscription access, managed identity)
- A checkpoint requires tenant-admin consent you do not have
- Post-install verification fails on Graph API or SharePoint access after you confirmed the manual steps
- The install fails repeatedly at the same step
- The run is stuck in a non-terminal state for more than 30 minutes

---

## Quick reference

| Action | Route | API |
|--------|-------|-----|
| Run preflight | `/setup` | `POST /api/admin/preflight` |
| Launch install | `/setup` | `POST /api/admin/runs` |
| Track run | `/setup/run/{runId}` | `GET /api/admin/runs/{runId}` |
| Approve checkpoint | `/setup/run/{runId}` | `POST /api/admin/runs/{runId}/checkpoint` |
| Reject checkpoint | `/setup/run/{runId}` | `POST /api/admin/runs/{runId}/checkpoint` |
| Cancel run | (Runs lane) | `POST /api/admin/runs/{runId}/cancel` |
| Run verification | `/setup/run/{runId}` | `POST /api/admin/preflight` (verify-only) |
