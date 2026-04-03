# Prompt-01 — App-Binding Gap Audit and Slice Definition

## Objective

Audit the live repo and the completed Phase 6 artifacts to determine exactly what is already present for app-binding / backend-setup configuration, what remains missing, and what the smallest forward-compatible implementation slice must be.

## Important execution rules

- Read the smallest authoritative set needed.
- **Do not re-read files that are still within active context or memory unless they changed, the context is stale, or the scope widened.**
- Treat live repo truth as authoritative over plan assumptions.
- This is an audit-and-scope prompt, not the main implementation prompt.

## Governing direction

Use the Admin end-state plan and the completed Phase 6 docs as the immediate controlling inputs.

The target outcome is **not** the full Phase 10 config platform. It is the smallest app-binding slice that makes the Phase 6 setup lane materially useful for target SPFx apps.

## Required authority set to inspect first

### Phase docs
- the Phase 6 summary plan
- the Phase 6 prerequisite audit
- the Phase 6 install/bootstrap architecture
- the Phase 6 install contract slice
- the Phase 6 preflight validator doc
- the Phase 6 install orchestrator doc
- the Phase 6 setup wizard UX doc
- the Phase 6 final reconciliation
- the Admin end-state plan

### Target app runtime areas
At minimum inspect:
- `apps/accounting/src/config/runtimeConfig.*`
- `apps/accounting/src/mount.*`
- `apps/accounting/src/backend/**`
- `apps/estimating/src/config/runtimeConfig.*`
- `apps/estimating/src/mount.*`
- `apps/estimating/src/backend/**`
- `tools/spfx-shell/**`
- `tools/build-spfx-package.*`

### Admin/control-plane areas
- current admin-control-plane shared models
- any existing config or registry package/surface
- backend admin-control-plane services and APIs
- any SharePoint-backed or Table-backed config persistence already present in repo

## Required output

Create:
- `docs/architecture/plans/MASTER/spfx/admin/phase-6a-app-binding/admin-spfx-app-binding-gap-audit.md`

## The audit file must contain

1. Purpose
2. Authority set actually used
3. Confirmed repo facts about the target apps’ runtime config expectations
4. Confirmed repo facts about current Admin setup/install outputs
5. Confirmed gaps that prevent first-class app-binding from working today
6. Circular-dependency analysis for runtime resolution
7. Recommended minimum slice to implement now
8. Explicit non-goals
9. Recommended execution order for Prompts 02–09

## Minimum facts to confirm if still true

- Target apps already expect the shared runtime binding fields (`functionAppUrl`, `apiAudience`, `backendMode`, `allowBackendModeSwitch`).
- The current packaged-shell/runtime path is not yet a sufficient first-class operator-governed source of truth on its own.
- Phase 6 built install/bootstrap control-plane substrate but did not yet build a durable app-binding registry/resolution flow.
- Phase 10 config governance remains broader than what this slice should implement now.
- A target app must be able to resolve binding state before first backend-dependent use.

## Compatibility rule

If the repo lacks a finished generalized config registry, define the **smallest forward-compatible binding slice** needed now instead of waiting for full Phase 10 completion.

## Validation

Before finishing:
- verify every referenced path exists,
- distinguish confirmed fact from inference,
- make the resulting document narrow enough to govern the remaining prompts.

## Completion condition

Stop after the gap audit is complete and coherent.
Do not implement architecture or code in this prompt.
