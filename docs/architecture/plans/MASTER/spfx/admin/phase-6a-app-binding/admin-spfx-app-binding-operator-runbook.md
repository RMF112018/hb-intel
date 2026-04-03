# Admin SPFx IT Control Center — App-Binding Operator Runbook

**Prompt:** P6A-09 — Docs, Runbooks, Validation, and Final Reconciliation  
**Status:** Complete  
**Date:** 2026-04-03  
**Purpose:** Practical operator guidance for managing app-binding posture in the IT Control Center.

---

## 1. When bindings are published

Bindings are published automatically by the install/setup flow when a backend install or bootstrap run completes successfully. The orchestrator publishes bindings for all managed apps (`accounting`, `project-setup`) using the `functionAppUrl` and `apiAudience` values from the install command input.

**You do not need to publish bindings manually after a successful install.** The system does it automatically and records audit events for each publication.

Bindings are also published when:
- An operator manually publishes via the binding API (`POST /api/admin/apps/{appId}/binding/publish`)
- An operator repairs a binding via the Admin UX or API

---

## 2. How to review binding status

### Via the Admin UX

1. Navigate to **Setup > App Bindings** (`/setup/bindings`)
2. Each managed app shows a card with:
   - **Status badge** — Active (green), Drifted (red), PendingPublication (blue), etc.
   - **Function App URL** — the published backend URL
   - **API Audience** — the API audience URI for token acquisition
   - **Version** — increments with each publication
   - **Published** — timestamp and actor who published
   - **Last Verified** — when verification last ran and the result

### What each status means

| Status | Meaning | Action needed? |
|--------|---------|---------------|
| **Active** | Binding is published and valid | No — routine verification recommended |
| **Drifted** | Verification found a mismatch | Yes — review findings, then repair |
| **NotConfigured** | No binding exists for this app | Yes — run install or publish manually |
| **PendingPublication** | Publication is in progress | Wait — check again shortly |
| **Error** | Publication or verification failed | Yes — investigate and retry |
| **Superseded** | Replaced by Phase 10 configuration | No — follow Phase 10 guidance |

---

## 3. What drift means

Drift means the published binding values no longer match expectations. This can happen when:

- Infrastructure changes after install (e.g., Function App URL changes)
- App registration is modified outside the Admin control plane
- Binding was published with incorrect values
- Binding has not been verified in 30+ days (staleness)

### Drift findings

Each drift finding shows:
- **Field** — which binding field is affected
- **Severity** — critical (binding broken), warning (binding degraded), info (aging)
- **Expected** — what the binding says
- **Observed** — what was actually found
- **Message** — human-readable explanation

### Critical drift requires immediate action

If `functionAppUrl` or `apiAudience` are empty or invalid, target apps cannot connect to the backend. Repair promptly.

---

## 4. How to verify a binding

1. Navigate to `/setup/bindings`
2. Click **Verify** on the binding card
3. The system runs structural and format checks against the published values
4. Results appear inline as findings (or "passed" if no issues)

Verification updates the binding's `lastVerifiedAt` timestamp and may change status to `Drifted` if findings are detected.

---

## 5. When and how to repair

### When to repair

- After verification shows drift findings with critical or warning severity
- After infrastructure changes that invalidate published values
- When a target app reports `ConfigError` due to missing or wrong backend URL

### How to repair

1. Navigate to `/setup/bindings`
2. Click **Repair** on the affected binding card
3. Review and correct the pre-filled values:
   - **Function App URL** — the correct Azure Function App URL
   - **API Audience** — the correct `api://` audience URI
   - **Rationale** — why you're making this change
4. Click **Submit Repair**
5. The binding is re-published with incremented version and Active status
6. Click **Verify** to confirm the repair resolved the drift

### What repair does

- Creates a new version of the binding with corrected values
- Resets verification state (you should re-verify after repair)
- Records a `BindingRepaired` audit event with your identity and rationale
- Does **not** rebuild or redeploy `.sppkg` packages

### Important

If the correct values have changed (e.g., Function App was migrated), you will also need to rebuild and redeploy the `.sppkg` packages so the build-time injected values match. Repair only updates the binding store — it cannot change what's already compiled into a deployed package.

---

## 6. What to do when a target app shows missing or stale binding

If Accounting or Project Setup shows a `ConfigError` or falls back to `ui-review` mode unexpectedly:

1. **Check binding status** at `/setup/bindings`
   - If `NotConfigured`: run install or publish manually
   - If `Drifted` or `Error`: verify and repair
   - If `Active`: binding is fine; the issue may be in the deployed `.sppkg` (build-time values)
2. **Check that build-time values match** — compare the binding store values to what was built into the `.sppkg`
3. **Re-verify** to confirm the binding values are structurally valid

---

## 7. When to escalate

Escalate if:
- Repair and re-verification do not resolve the drift
- The Function App URL or API audience have changed due to infrastructure work you didn't initiate
- Multiple managed apps show drift simultaneously (may indicate a broader infrastructure change)
- The binding store is unreachable (Azure Table Storage issue)
- A target app's `ConfigError` persists after confirming the binding is Active and build-time values are correct

Escalation path: contact the engineering team responsible for the HB Intel backend infrastructure.
