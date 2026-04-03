# Phase 6 → Phase 6A Handoff Note

**Date:** 2026-04-03
**Purpose:** Summarize what Phase 6 completed, what remains deferred to Phase 6A, and where operators and developers should look next.

---

## What Phase 6 completed

Phase 6 delivered the first end-to-end in-app backend install and bootstrap lane:

- **Preflight validation** — 9 structured checks across 6 categories with blocking/warning severity
- **Install/bootstrap orchestration** — 19-step catalog with adapter invocation routing
- **Manual checkpoints** — 2 approval gates (Entra API permissions, SharePoint API access) with structured instructions, approve/reject, and audit
- **Post-install verification** — 6 health checks confirming environment readiness
- **Audit and evidence capture** — durable run lifecycle, audit events, and evidence artifacts via existing Phase 4 stores
- **Operator UX** — SetupWizardPage (preflight review, install launch) and InstallRunDetailPage (step progress, checkpoint actions, verification results)
- **Shared contracts** — install-specific vocabulary (`InstallStepId`, `InstallStepFamily`, `InstallPreflightCheckId`, `InstallVerificationCheckId`) on top of the generalized Phase 2 model
- **12 canonical documents** covering architecture, step model, checkpoint policy, contracts, services, UX, operator runbook, and final reconciliation

Phase 6 reused all existing API endpoints, persistence tables, and run lifecycle types. No new external dependencies were introduced.

---

## What remains intentionally deferred to Phase 6A

Phase 6A — Managed App Binding and Backend-Setup Configuration — owns the following:

| Concern | Why deferred |
|---------|-------------|
| Durable per-app binding storage and retrieval | Install produces values but has no governed publication channel |
| Binding publication from install/bootstrap | The install flow writes environment configuration but does not publish binding records for target apps |
| Target-app runtime resolution | Managed apps need to resolve `functionAppUrl`, `apiAudience`, `backendMode`, `allowBackendModeSwitch` before backend-dependent calls |
| Binding verification and drift detection | No mechanism exists to confirm bindings remain current after install |
| Binding repair and re-publish UX | No operator surface exists for viewing or repairing binding posture |
| Managed-app binding contract/model | The shared contract surface for binding records, retrieval, and governance is not yet defined |

---

## What target apps still need before runtime readiness

Managed HB Intel SPFx apps (at minimum **Accounting** and **Project Setup**) require:

1. **Resolved runtime binding** — `functionAppUrl`, `apiAudience`, `backendMode`, `allowBackendModeSwitch` — supplied by the control plane through a governed channel, not hard-coded or package-time-only
2. **Pre-call resolution** — binding must be available before the first backend-dependent API call
3. **No circular dependency** — the resolution path must not require `functionAppUrl` to resolve `functionAppUrl`
4. **No per-app rebuild dependency** — routine binding changes must not require rebuilding `.sppkg` artifacts

Until these are satisfied, managed apps are **installed but not bound and runtime-ready**.

---

## Next entry points

### For managed-app runtime readiness → Phase 6A

Start with the Phase 6A implementation prompt package:
- `docs/architecture/plans/MASTER/spfx/admin/phase-06a/README.md`
- `docs/architecture/plans/MASTER/spfx/admin/phase-06a/Admin-SPFx-App-Binding-Backend-Setup-Summary-Plan.md`

### For provisioning hardening → Phase 7 (after Phase 6A)

Phase 7 follows Phase 6A so provisioning hardening can assume a first-class binding model:
- `docs/architecture/plans/MASTER/spfx/admin/phase-07/Admin-SPFx-IT-Control-Center-Phase-7-Summary-Plan.md`

### For upstream reconciliation (already complete)

The Phase 6A upstream reconciliation updated top-level and Phase 1–5 docs to acknowledge managed app binding as a first-class concern:
- `docs/architecture/plans/MASTER/spfx/admin/phase-06a/admin-spfx-phase-6a-upstream-reconciliation.md`

---

## Cross-references

- [Phase 6 Summary Plan](Admin-SPFx-IT-Control-Center-Phase-6-Summary-Plan.md)
- [Phase 6 Final Reconciliation](admin-spfx-phase-6-final-reconciliation.md)
- [End-state plan — Phase 6A](../admin-spfx-it-control-center-end-state-plan.md)
- [Phase 6A Summary Plan](../phase-06a/Admin-SPFx-App-Binding-Backend-Setup-Summary-Plan.md)
- [Operator Runbook](admin-spfx-install-operator-runbook.md)
