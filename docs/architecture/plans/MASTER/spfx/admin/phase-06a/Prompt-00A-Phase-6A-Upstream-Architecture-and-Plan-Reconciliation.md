# Prompt-00A — Phase 6A Upstream Architecture and Plan Reconciliation

## Objective

Reconcile the **upstream architecture and phase-plan artifacts** so the Admin SPFx IT Control Center roadmap can cleanly support **Phase 6A — Managed App Binding and Backend-Setup Configuration**.

This prompt must run at the **beginning of Phase 6**, before the existing Phase 6 prerequisite audit, if the phase is being rerun from scratch.

The goal is to make the plan internally consistent before implementation begins.

---

## Important execution rules

- Read the smallest authoritative set needed.
- Do **not** re-read files that are still within active context unless they changed, the context is stale, or the scope widened.
- Treat the updated top-level end-state plan and target architecture as the controlling direction.
- This is a **docs / architecture reconciliation prompt**, not a feature-implementation prompt.
- Do **not** implement Phase 6A code here.
- Do **not** turn this into a full Phase 10 governance implementation.
- Be explicit about what changed, why it changed, and what remains deferred.

---

## Governing direction

Use the updated Admin SPFx plan direction that now treats **managed app binding / backend-setup configuration** as a first-class slice between Phase 6 and the later governance maturity work.

The reconciliation must reflect that:

1. install/bootstrap and app-binding are related but distinct concerns,
2. target apps must be able to consume governed runtime bindings without owning privileged writes,
3. app-binding becomes operational before full live-admin configuration governance matures,
4. and later phases must consume and extend that binding system rather than inventing it for the first time.

---

## Required authority set to inspect first

At minimum inspect:

### Top-level architecture docs
- `docs/architecture/plans/MASTER/spfx/admin/admin-spfx-it-control-center-end-state-plan.md`
- `docs/architecture/plans/MASTER/spfx/admin/admin-spfx-target-architecture.md`

### Phase 1 docs
- `docs/architecture/plans/MASTER/spfx/admin/phase-01/**`

### Phase 2 docs
- `docs/architecture/plans/MASTER/spfx/admin/phase-02/**`

### Phase 3 docs
- `docs/architecture/plans/MASTER/spfx/admin/phase-03/**`

### Phase 4 docs
- `docs/architecture/plans/MASTER/spfx/admin/phase-04/**`

### Phase 5 docs
- `docs/architecture/plans/MASTER/spfx/admin/phase-05/**`

### Phase 6 baseline docs
Inspect only enough of the Phase 6 package to ensure the upstream changes do not contradict the Phase 6 implementation package:
- `docs/architecture/plans/MASTER/spfx/admin/phase-06/Admin-SPFx-IT-Control-Center-Phase-6-Summary-Plan.md`
- `docs/architecture/plans/MASTER/spfx/admin/phase-06/admin-spfx-phase-6-prerequisite-audit.md`
- `docs/architecture/plans/MASTER/spfx/admin/phase-06/admin-spfx-phase-6-final-reconciliation.md`

---

## Required outputs

### A. Update top-level documents
Update:
- `docs/architecture/plans/MASTER/spfx/admin/admin-spfx-it-control-center-end-state-plan.md`
- `docs/architecture/plans/MASTER/spfx/admin/admin-spfx-target-architecture.md`

### B. Create one upstream reconciliation note
Create:
- `docs/architecture/plans/MASTER/spfx/admin/phase-6a/admin-spfx-phase-6a-upstream-reconciliation.md`

This document must summarize:
- what upstream assumptions changed,
- why Phase 6A exists as a separate slice,
- which earlier phases now explicitly carry app-binding responsibilities,
- and which later phases now mature or consume that substrate.

### C. Update or create the smallest necessary phase artifacts
Update existing docs where they already exist.
If a relevant phase doc family does not exist, create the **smallest addendum doc** rather than inventing an oversized phase rewrite.

Recommended addendum pattern if needed:
- `phase-01/admin-spfx-phase-1-managed-app-binding-addendum.md`
- `phase-02/admin-spfx-phase-2-managed-app-binding-contract-addendum.md`
- `phase-03/admin-spfx-phase-3-managed-app-binding-backend-addendum.md`
- `phase-04/admin-spfx-phase-4-managed-app-binding-audit-addendum.md`
- `phase-05/admin-spfx-phase-5-managed-app-binding-operator-console-addendum.md`

Use different names only if repo conventions clearly require it.

---

## Required reconciliation topics

### 1. Phase 1 — boundary hardening and program baseline
Make explicit:
- managed app binding is a control-plane concern,
- target apps may read governed binding but may not write privileged configuration,
- the binding layer sits between privileged setup execution and target-app runtime consumption.

### 2. Phase 2 — contracts and domain model
Make explicit:
- first-class app-binding contracts,
- binding status vocabulary,
- binding publish / drift / repair events,
- binding evidence and audit shape,
- target-app runtime binding fields such as:
  - `functionAppUrl`
  - `apiAudience`
  - `backendMode`
  - `allowBackendModeSwitch`
  - resource / scope relationship where relevant

### 3. Phase 3 — backend foundation
Make explicit:
- binding store / retrieval API support,
- publication / repair entry points,
- backend ownership of app-binding persistence and publication,
- target-app read-model access pattern.

### 4. Phase 4 — durable audit/evidence
Make explicit:
- binding publication events,
- binding drift events,
- binding repair events,
- evidence references for published binding payloads and target app consumption.

### 5. Phase 5 — operator console foundation
Make explicit:
- the shell and lane model must support app-binding status, configuration state, and repair surfaces,
- even if the detailed UX lands later.

### 6. Plan-wide changes
Update:
- workstreams,
- recommended implementation order,
- sequencing rationale,
- active first-wave scope,
- and end-state definition of done

so they reflect the existence of **Phase 6A**.

---

## Required boundaries

- Do not rewrite completed Phase 6 implementation details here.
- Do not implement binding-governance override mechanics that belong to later maturity work.
- Do not change Phase 10 into a duplicate of Phase 6A.
- Do not delete or weaken the original install/bootstrap boundary.
- Do not move privileged config writes into SPFx.

---

## Validation

Before finishing:
- verify every referenced path exists or explain why you created an addendum instead,
- distinguish confirmed repo fact from new architectural reconciliation,
- cross-check that the updated upstream documents no longer contradict the existence of Phase 6A,
- ensure the resulting docs still keep Phase 6 narrow and Phase 10 as governance maturation.

---

## Completion condition

Stop after:
- the top-level plan and architecture are reconciled,
- the upstream phase docs or addenda are complete,
- and the upstream reconciliation note clearly explains the change.

Do **not** implement Phase 6A feature code in this prompt.
