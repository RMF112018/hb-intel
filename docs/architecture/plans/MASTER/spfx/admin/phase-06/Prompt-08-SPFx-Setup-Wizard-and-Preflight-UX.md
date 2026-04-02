# Prompt-08 — SPFx Setup Wizard and Preflight UX

## Objective

Build the Phase 6 operator-console UX for setup/install and preflight review inside the Admin SPFx app.

## Important execution rules

- SPFx must remain a command and review surface, not the privileged executor.
- Use backend APIs for actual validation and install actions.
- Rework Admin navigation only as much as needed to introduce a real install lane cleanly.

## Inputs

Use:
- current `apps/admin` router and page structure
- Phase 6 architecture docs
- shared contracts
- backend preflight/install APIs

## Required work

### A. Introduce a real setup/install lane in Admin routing
Add or update routes/pages so Admin exposes a dedicated install/bootstrap flow instead of only settings/error/provisioning surfaces.

The exact route names should fit repo conventions, but the UX must clearly cover:
- setup/install
- validation/preflight
- install run status/history
- post-install verification access

### B. Build the setup wizard / install entry UX
The operator-facing UX should support:
- collecting or confirming install inputs
- launching preflight
- reviewing blockers vs warnings
- making an explicit install decision only when appropriate
- clear visibility into what will be automated vs what may require checkpointed manual action

### C. Preflight-result UX requirements
The UI must show:
- summary readiness state
- categorized findings
- blocking vs warning
- recommended operator actions
- any manual prerequisites that must be completed before install launch

### D. Documentation output
Create:
- `docs/architecture/plans/MASTER/spfx/admin/phase-6/admin-spfx-setup-wizard-ux.md`

Explain:
- route/page structure
- setup flow
- preflight presentation model
- what the frontend owns vs what it does not own

## Required boundaries

- No privileged Graph or SharePoint execution in browser code.
- No hidden backend assumptions.
- No generic single-page dump of all controls.
- Do not let UI state become the source of truth for run state.

## Validation

Run targeted frontend validation for touched Admin app surfaces:
- build/typecheck/tests/lint only if those scripts actually exist for the touched package
- add focused component or route tests where appropriate

Document the exact validation set used.

## Completion condition

Stop after the setup/preflight UX exists, is documented, and is validated.
Do not implement run-status/checkpoint detail UX in this prompt.
