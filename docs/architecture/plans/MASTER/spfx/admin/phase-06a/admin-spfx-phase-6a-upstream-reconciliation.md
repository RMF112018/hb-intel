# Phase 6A Upstream Reconciliation Note

**Prompt:** P00A — Phase 6A Upstream Architecture and Plan Reconciliation  
**Status:** Complete  
**Date:** 2026-04-03  
**Purpose:** Document what upstream assumptions changed when Phase 6A was inserted into the Admin SPFx IT Control Center roadmap and how earlier and later phases now relate to managed app binding.

---

## 1. Why Phase 6A exists as a separate slice

Phase 6 delivered the install/bootstrap lane: setup wizard, preflight validation, checkpoint handling, post-install verification, and durable run/audit/evidence support. It did **not** establish a durable, operator-governed mechanism for publishing, resolving, verifying, and repairing the backend runtime bindings that managed SPFx apps need before making backend-dependent calls.

That gap cannot wait until Phase 10 (live-admin configuration governance) because:

- Target apps (at minimum Accounting and Project Setup) already expect a shared runtime binding shape (`functionAppUrl`, `apiAudience`, `backendMode`, `allowBackendModeSwitch`).
- Install/bootstrap produces the values but has no first-class publication or resolution channel.
- Burying binding inside install/bootstrap would conflate two distinct concerns.
- Deferring binding to Phase 10 would leave managed apps without a governed resolution path through Phases 7-9B.

Phase 6A therefore exists as a narrow, focused slice that makes managed app binding operational before broader configuration governance matures.

---

## 2. What upstream assumptions changed

| Prior assumption | Corrected understanding |
|-----------------|------------------------|
| Install/bootstrap alone makes target apps runtime-ready | Install/bootstrap produces outputs; a separate binding publication and resolution step makes target apps runtime-ready |
| Phase 10 is the first place app-specific runtime configuration becomes real | Phase 6A establishes first-class app-binding; Phase 10 generalizes and extends that substrate |
| Upstream phases (1-5) can stay silent on binding contracts and binding auditability | Each upstream phase now explicitly acknowledges the binding concern within its domain |
| Binding is an implementation detail of per-app packages | Binding is governed control-plane configuration with publication, versioning, audit, and repair |

---

## 3. Which phases now carry app-binding responsibilities

| Phase | Binding responsibility | Addendum |
|-------|----------------------|----------|
| **Phase 1** | Managed app binding is a control-plane concern. Target apps read governed binding but may not write privileged configuration. The binding layer sits between privileged setup execution and target-app runtime consumption. | `phase-01/admin-spfx-phase-1-managed-app-binding-addendum.md` |
| **Phase 2** | First-class app-binding contracts: binding status vocabulary, binding publish/drift/repair events, binding evidence and audit shape, target-app runtime binding fields. | `phase-02/admin-spfx-phase-2-managed-app-binding-contract-addendum.md` |
| **Phase 3** | Backend foundation supports binding store/retrieval APIs, publication/repair entry points, and backend ownership of app-binding persistence. Target apps use a resolution endpoint, not direct store access. | `phase-03/admin-spfx-phase-3-managed-app-binding-backend-addendum.md` |
| **Phase 4** | Durable audit/evidence model accounts for binding publication events, binding drift events, binding repair events, and evidence references for published binding payloads. | `phase-04/admin-spfx-phase-4-managed-app-binding-audit-addendum.md` |
| **Phase 5** | Operator console shell and lane model must accommodate app-binding status, configuration state, and repair surfaces even if detailed UX lands in Phase 6A. | `phase-05/admin-spfx-phase-5-managed-app-binding-operator-console-addendum.md` |
| **Phase 6** | Install/bootstrap publishes usable binding outputs. No rewrite of completed Phase 6 — the handoff to Phase 6A is addressed by Prompt-10A retrofit. | *(Phase 6 final reconciliation retrofit is Prompt-10A scope)* |

---

## 4. Which later phases mature or consume the binding substrate

| Phase | Relationship to binding |
|-------|------------------------|
| **Phase 7** | Provisioning hardening can assume a first-class binding model rather than ad hoc per-app configuration. Provisioning readiness checks may include binding posture. |
| **Phase 10** | Generalizes the narrower app-binding, hybrid-identity connection, and device-package configuration slices into the broader governed configuration model. Phase 10 **extends** the binding substrate — it does not invent it. |

---

## 5. What did NOT change

- **Phase 6 stays narrow.** Phase 6 is install/bootstrap only. It is not retroactively expanded to include binding UX or governance.
- **Phase 10 stays governance maturation.** Phase 10 generalizes and extends early configuration slices (binding, connections, packages) — it does not replace them.
- **The install/bootstrap boundary is preserved.** Install/bootstrap execution and runtime binding publication remain distinct concerns.
- **Privileged config writes stay in the backend.** SPFx remains the operator console, not a privileged executor.
- **No locked decisions were changed.** All existing locked decisions (LD-01 through LD-10 from Phase 1, plus LD-11 through LD-16 from the end-state plan) remain intact.

---

## 6. Path convention note

The governing prompt text (`Prompt-00A`) references `phase-6a/` in some output path examples, but the repository uses `phase-06a/` with zero-padded numbering. All artifacts created by this reconciliation use the repo-standard `phase-06a/` path.

---

## 7. Cross-references

| Document | Purpose |
|----------|---------|
| `admin-spfx-it-control-center-end-state-plan.md` | End-state plan — already Phase 6A-aware |
| `admin-spfx-target-architecture.md` | Target architecture — already Phase 6A-aware |
| `phase-06a/Admin-SPFx-App-Binding-Backend-Setup-Summary-Plan.md` | Phase 6A implementation summary plan |
| `phase-06a/Phase-6A-Upstream-Reconciliation-Summary-Plan.md` | Upstream reconciliation package summary |
| `phase-06a/Prompt-00A-Phase-6A-Upstream-Architecture-and-Plan-Reconciliation.md` | Governing prompt for this reconciliation |
| `phase-06/admin-spfx-phase-6-final-reconciliation.md` | Phase 6 closure — retrofit handled by Prompt-10A |
