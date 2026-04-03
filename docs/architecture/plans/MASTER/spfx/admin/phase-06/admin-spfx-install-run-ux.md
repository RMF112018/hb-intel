# Admin SPFx IT Control Center — Install Run UX

**Prompt:** P6-09 — SPFx Run Tracking, Checkpoint, and Verification UX
**Status:** Complete
**Date:** 2026-04-03
**Purpose:** Document the run detail, checkpoint handling, and verification UX for install/bootstrap runs.

---

## 1. Route structure

| Route | Page | Purpose |
|-------|------|---------|
| `/setup` | `SetupWizardPage` | Preflight review and install launch (P6-08) |
| `/setup/run/$runId` | `InstallRunDetailPage` | Run detail, step progress, checkpoint actions, verification |
| `/runs` | `ProvisioningOversightPage` | Provisioning run history (existing — install runs also appear here via shared run store) |

After launching an install from the setup wizard, the operator is automatically navigated to `/setup/run/{runId}`.

---

## 2. Run list/detail flow

```
[Setup Wizard] → [Launch Install] → [Install Run Detail]
                                          ↓
                                    Poll GET /api/admin/runs/{runId}
                                          ↓
                               Step progress + status updates
                                          ↓
                          [Checkpoint?] → [Approve/Reject]
                                          ↓
                               [Completed?] → [Run Verification]
```

### Run detail page sections

1. **Header** — Run status badge + step completion count ("N of M steps completed")
2. **Checkpoint panel** — Shown only when `status === AwaitingApproval`; includes instructions, comment textarea, approve/reject buttons
3. **Step progress list** — All steps with status badge, label, error message (if failed), duration
4. **Failure details** — Shown only when `failure !== null`; failure class, step number, retry eligibility
5. **Post-install verification** — "Run Verification" button shown when run is `Completed`; displays structured results

---

## 3. Checkpoint handling UX

When the run reaches `AwaitingApproval`:

1. The checkpoint panel renders with the paused step's label
2. Instructions tell the operator to complete the action in the external admin portal
3. A textarea captures an optional comment (required for reject)
4. **Approve & Resume** — calls `POST /api/admin/runs/{runId}/checkpoint` with `decision: 'approve'`
5. **Reject** — calls the same endpoint with `decision: 'reject'` and the comment

After submission, the page re-fetches the run to reflect the updated state.

### UX behavior by run status

| Status | Checkpoint panel | Step list | Failure panel | Verify button |
|--------|-----------------|-----------|---------------|---------------|
| `Pending` | Hidden | All pending | Hidden | Hidden |
| `Running` | Hidden | In-progress | Hidden | Hidden |
| `AwaitingApproval` | **Visible** | Shows paused step | Hidden | Hidden |
| `Completed` | Hidden | All complete | Hidden | **Visible** |
| `Failed` | Hidden | Shows failed step | **Visible** | Hidden |
| `Cancelled` | Hidden | Shows progress at cancel | Hidden | Hidden |

---

## 4. Verification-result UX

After a completed install, the operator can click "Run Post-Install Verification" which:
1. Calls the preflight API with `actionKey: 'setup-install:bootstrap:verify-only'`
2. Renders structured results with pass/fail badges per check
3. Shows an overall outcome badge ("All Passed" or "Issues Detected")

Verification is **observational** — it does not modify the run state.

---

## 5. Polling strategy

The run detail page polls `GET /api/admin/runs/{runId}` every 5 seconds while the page is mounted. Polling stops when the component unmounts (interval cleared in `useEffect` cleanup). This is consistent with the admin app's existing polling pattern (alert polling at 30s, probe polling at 15m).

---

## 6. Intentionally deferred UX

| Feature | Reason | Target |
|---------|--------|--------|
| Real-time WebSocket/SignalR updates | Polling is sufficient for Phase 6; SignalR adapter is planned but not wired | Later phase |
| Audit event timeline | Evidence/audit trail viewing available via existing `/runs/{runId}/audit` API; dedicated UI deferred | Phase 7+ |
| Install run list within Setup lane | Install runs visible via existing Runs lane; dedicated list deferred | Phase 7+ |
| Retry from failed step (partial resume) | Orchestrator supports full retry; step-level resume deferred | Phase 7+ |

---

## Implementation location

| File | Purpose |
|------|---------|
| `apps/admin/src/pages/InstallRunDetailPage.tsx` | Run detail, step progress, checkpoint actions, verification |
| `apps/admin/src/pages/SetupWizardPage.tsx` | Updated to navigate to run detail after launch |
| `apps/admin/src/router/routes.ts` | Added `/setup/run/$runId` route |

---

## Cross-references

- [Setup Wizard UX](admin-spfx-setup-wizard-ux.md) — preflight review and install launch
- [Checkpoint Lifecycle](admin-spfx-install-checkpoint-lifecycle.md) — backend checkpoint handling
- [Post-Install Verification](admin-spfx-post-install-verification.md) — verification checks
- [Install Orchestrator](admin-spfx-install-orchestrator.md) — backend step execution
