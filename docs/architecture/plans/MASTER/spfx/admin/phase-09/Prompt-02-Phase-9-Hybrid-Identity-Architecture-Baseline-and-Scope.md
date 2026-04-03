# Prompt-02 — Phase 9 Hybrid Identity Architecture Baseline and Scope

## Objective

Create the canonical Phase 9 architecture baseline for **Hybrid Identity Administration** and define what this phase will and will not build.


## Hard gate

Treat the following as mandatory for this prompt and all later prompts:

After the final `.sppkg` is delivered, IT must be able to install the app and complete required operational setup and ongoing maintenance **without editing source code, manifests, environment files, backend configuration files, deployment templates, or package files**.

This prompt must therefore drive the repo toward:

- UI-managed setup, testing, rotation, and maintenance of required backend connections,
- secure backend custody/resolution of secrets and credentials,
- explicit operator-visible preflight checks for any external prerequisite the app cannot create itself,
- and documentation that distinguishes allowed admin-page approvals from prohibited code-edit setup.

Standard Microsoft admin approval pages are allowed where unavoidable. Code interaction is not.


## Important execution rules

- Do not re-read files already in active context unless needed.
- Use Prompt-01 output as the immediate truth base.
- Keep the architecture explicit about frontend/backend separation.
- Do not turn this into a giant generic identity-platform document.
- Preserve the Admin SPFx target architecture rather than casually rewriting it.

## Inputs

Use:

- `docs/architecture/plans/MASTER/spfx/admin/phase-9/admin-spfx-phase-9-repo-truth-and-hybrid-gap-map.md`
- `docs/architecture/plans/MASTER/spfx/admin/phase-9/admin-spfx-phase-9-connection-topology-and-config-gap-map.md`
- `docs/architecture/plans/MASTER/spfx/admin/admin-spfx-target-architecture.md`
- `docs/architecture/plans/MASTER/spfx/admin/admin-spfx-it-control-center-end-state-plan.md`
- verified source files from Prompt-01

## Create

1. `docs/architecture/plans/MASTER/spfx/admin/phase-9/admin-spfx-phase-9-hybrid-identity-architecture-baseline.md`
2. `docs/architecture/plans/MASTER/spfx/admin/phase-9/admin-spfx-phase-9-scope-map.md`
3. `docs/architecture/plans/MASTER/spfx/admin/phase-9/admin-spfx-phase-9-connection-management-baseline.md`
4. `docs/architecture/plans/MASTER/spfx/admin/phase-9/admin-spfx-phase-9-no-code-handoff-gate.md`

## Required architecture-baseline content

The baseline must define:

- what the **Hybrid Identity control lane** is,
- what the SPFx app owns,
- what the privileged backend owns,
- what the AD DS / on-prem identity adapter or equivalent execution boundary owns,
- what the Graph / Entra adapter/service owns,
- how audit/evidence responsibilities are split,
- how connector configuration, testing, secure storage, and rotation are split,
- and what **must not** live in SPFx.

Include explicit sections for:

1. Purpose
2. Current foundations
3. Phase 9 operating model
4. Source-of-authority model
5. Frontend responsibilities
6. Backend/control-plane responsibilities
7. AD DS / on-prem execution responsibilities
8. Graph / Entra responsibilities
9. Audit/evidence responsibilities
10. Explicit out-of-boundary items
11. Reuse of provisioning-era patterns
12. Forward-compatibility notes without phase bleed

## Required scope-map content

Separate:

- active Phase 9 scope,
- visibility-only or deferrable scope,
- later-phase scope,
- explicit non-goals.

The scope map must explicitly distinguish:

- AD DS-authoritative user lifecycle actions,
- group and membership actions by source of authority,
- cloud-only identity / access actions,
- sync-visibility actions,
- role-assignable / highly sensitive / privileged-admin edge cases,
- and out-of-scope wider M365 administration.

## Required baseline substance

Make these points explicit unless repo truth contradicts them:

- SPFx is the operator console and not the privileged executor.
- Broad identity administration in this phase runs through the backend.
- Existing `graph-service.ts` is a starting point, not the final capability set.
- Graph / Entra is **not** assumed to be the authority for all identity operations.
- `@hbc/features-admin` remains reusable admin intelligence and not the privileged execution substrate.
- Phase 9 must add a dedicated Hybrid Identity lane in the admin UI.
- Phase 9 must add UI-managed connection setup, testing, and maintenance surfaces for the required backend connectors.
- This phase must not rely on broad opaque permissions when narrower action-specific permissions are workable.
- This phase must not rely on post-deployment code edits or hidden environment edits for normal IT setup and use.
- If AD DS lifecycle authority is required, its execution boundary must be explicit and auditable.

## Validation

Before finishing:

- confirm both docs align with Prompt-01,
- confirm no target-state speculation is written as current implementation fact,
- confirm phase boundaries remain clear,
- and confirm the baseline is a **redirection of the current Phase 9 intent**, not an unrelated side architecture.

## Completion condition

Stop after all three docs are complete and cross-linked.


## Required connection-management-baseline content

The baseline must define:
- what connection classes Phase 9 requires to function,
- what the UI must allow an authorized IT operator to configure,
- what sensitive values must be entered through the UI but stored/resolved only in the backend,
- how connection tests / health checks / last-verified state are handled,
- how credential rotation and endpoint updates are handled without code edits,
- what must remain deployment-time infrastructure versus what must become app-configurable,
- and what security controls prevent unsafe secret handling in SPFx.

It must make explicit that:
- IT should not need to edit code, env files, deployment templates, or backend config files after deployment to set up or use the feature,
- the UI may collect connection details, credentials, certificate references, keys, secrets, and toggles only if the backend handles them securely,
- and connection setup must be governed, auditable, and permission-scoped.


## Required no-code-handoff-gate content

Create a dedicated gate document that states, in architecture terms:

- what “developer hands off the `.sppkg` and walks away” means for this phase,
- what setup must be possible through the app UI,
- what setup may occur in standard Microsoft admin pages,
- what setup may remain an external infrastructure prerequisite,
- what setup is forbidden because it would require code interaction,
- and how the exit prompt must fail the phase if these conditions are not met.

The gate doc must make explicit that:
- SPFx is not a secret store,
- the backend must own secure secret custody/resolution,
- and any remaining manual backend configuration by IT outside governed UI/admin flows is a phase failure unless explicitly classified as a non-Phase-9 infrastructure prerequisite.
