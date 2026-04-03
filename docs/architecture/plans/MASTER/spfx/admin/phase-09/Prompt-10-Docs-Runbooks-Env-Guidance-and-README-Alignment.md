# Prompt-10 — Docs, Runbooks, Env Guidance, and README Alignment

## Objective

Bring the documentation set and local guidance up to date with the real Phase 9 hybrid identity implementation, including the no-code connection-management setup model.


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

- Do not re-read files still in active context unless needed.
- This is an alignment prompt, not a broad architecture rewrite.
- Update only what is required to eliminate contradiction or major omission.

## Required work

### A. Create or update Phase 9 docs index

Create or update:

- `docs/architecture/plans/MASTER/spfx/admin/phase-9/README.md`

It should:

- list the Phase 9 documents,
- explain what was implemented,
- cross-link the action catalog, source-of-authority matrix, risk taxonomy, permission/access matrix, and validation/exit docs.

### B. Update admin folder navigation

Create or update:

- `docs/architecture/plans/MASTER/spfx/admin/README.md`

Ensure it now references the redirected Phase 9 hybrid identity materials in addition to existing admin docs.

### C. Update local code/docs guidance for touched areas

Update as needed:

- `apps/admin/README.md`
- `packages/features/admin/README.md`
- `backend/functions/README.md`

Keep updates concise and boundary-safe.

### D. Add environment / prerequisite guidance

Create:

- `docs/architecture/plans/MASTER/spfx/admin/phase-9/admin-spfx-phase-9-env-and-prerequisites.md`

Document:

- Graph permissions and consent prerequisites
- on-prem / AD DS execution prerequisites
- service account / executor / connector assumptions if applicable
- Entra role assumptions / notes
- config/env flags or secrets required by the implementation
- which items must remain deployment-time infrastructure versus which must be UI-configurable after deployment
- manual IT approval steps if still necessary
- any constrained or deferred actions due to permission / sensitivity / source-of-authority boundaries
- operator-visible sync / propagation caveats if relevant
- explicit no-code setup instructions for IT using the app UI
- exact distinction between allowed standard admin-page approvals and prohibited code/config interaction

### E. Add operator runbook notes

Create:

- `docs/architecture/plans/MASTER/spfx/admin/phase-9/admin-spfx-phase-9-operator-runbook.md`

It should explain:

- what the Hybrid Identity lane can do,
- what it cannot do,
- what system is authoritative for what,
- how required connectors are configured and verified through the UI,
- how risky actions are surfaced,
- and how operators should interpret connection failures, sync-state, and audit/history results.

## Validation

Before finishing:

- verify every doc path and link resolves,
- ensure local READMEs do not claim unimplemented features,
- ensure permission guidance matches the implemented action set,
- ensure the environment guide does not claim an on-prem execution model that the repo did not actually implement,
- ensure the docs do not tell IT to edit code or env files for normal feature setup if the phase implemented UI-based connector management.

## Completion condition

Stop when the documentation set accurately reflects the Phase 9 implementation without contradiction.


## Required handoff artifact

Create:

- `docs/architecture/plans/MASTER/spfx/admin/phase-9/admin-spfx-phase-9-it-handoff-and-setup-guide.md`

It must be written for the IT department and explain, step by step:

- what they do after receiving the final `.sppkg`,
- what they install in SharePoint,
- what they configure in the app UI,
- what they verify in standard Microsoft admin pages where unavoidable,
- what external infrastructure prerequisites the app can only validate,
- how they know setup is complete,
- and what they should never need to edit in code.
