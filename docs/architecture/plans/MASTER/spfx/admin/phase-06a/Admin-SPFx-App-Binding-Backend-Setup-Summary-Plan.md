# Admin SPFx IT Control Center — App-Binding / Backend-Setup Summary Plan

**Status:** New prompt package drafted from Phase 6 completion artifacts

## Purpose

This package exists to implement the **first-class app-binding / backend-setup configuration slice** that remains missing after Phase 6.

Phase 6 already established the control-plane substrate for:
- setup/install workflow UX,
- preflight validation,
- install/bootstrap orchestration,
- manual checkpoints,
- post-install verification,
- durable run, audit, and evidence handling.

What it did **not** yet establish is a durable and operator-governed way to:
- publish backend binding values for target SPFx apps,
- resolve those values inside target apps before the first backend-dependent action,
- audit and repair those bindings,
- and do so without requiring per-app rebuilds or assuming build-time shell injection is always sufficient.

This package is the narrow follow-on slice that closes that gap.

## Why this package is needed

The target apps (at minimum **Accounting** and **Project Setup**) already expect a shared runtime binding shape:
- `functionAppUrl`
- `apiAudience`
- `backendMode`
- `allowBackendModeSwitch`

The Admin app end-state also expects:
- in-app backend/bootstrap setup,
- configuration management UX,
- governed standards/configuration,
- durable auditability,
- and hybrid repo/live-admin configuration governance.

That means the suite now needs a **first-class binding model** rather than relying on package-time values alone.

## Scope of this slice

This package should deliver the smallest forward-compatible implementation that enables:

1. A durable **app-binding source of truth** for target SPFx apps.
2. A backend-controlled write/update path from the Admin install/setup flow.
3. A runtime resolution path inside the target apps that works **before** they make backend API calls.
4. Verification/drift checks for bindings.
5. Admin UX for reviewing, reapplying, and repairing bindings.

## Explicit constraints

- Do **not** reimplement the full Phase 10 configuration registry.
- Do **not** move privileged config writes into SPFx browser code.
- Do **not** create a circular dependency where a target app needs `functionAppUrl` before it can resolve `functionAppUrl`.
- Do **not** require rebuilding `.sppkg` artifacts to change app-binding values in normal operator workflows.
- Do **not** collapse the distinction between:
  - install/bootstrap execution,
  - runtime binding publication,
  - and post-install verification.

## Recommended package sequence

1. Gap audit and slice definition
2. Architecture and runtime resolution model
3. Shared contracts and governance slice
4. Backend binding store and retrieval API
5. Setup/install flow integration
6. Target-app runtime resolver integration
7. Binding verification and drift checks
8. Admin UX for status and repair
9. Docs, runbooks, validation, and final reconciliation

## Acceptance target for this slice

This slice is complete when all of the following are true:

- The Admin control plane can publish and update app bindings for target apps.
- The target apps can resolve those bindings at runtime **before** first backend-dependent use.
- The binding source is durable, auditable, and repairable.
- The implementation is clearly compatible with the later Phase 10 configuration-governance model.
- The work stays narrow and does not balloon into a full generalized standards/config platform.
