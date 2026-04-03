# Prompt-11 — Validation, Reconciliation, and Phase 9 Exit

## Objective

Finish Phase 9 by validating the implementation, reconciling contradictions, and producing the canonical exit record for the **Hybrid Identity Administration foundation** phase.


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

- Do not re-read files still in active context unless needed for final verification.
- Use the smallest meaningful validation set that still gives real confidence.
- This prompt should not introduce new substantive features unless needed to fix a discovered contradiction or broken path.

## Required work

### A. Reconcile the implementation set

Check for contradictions across:

- admin Phase 9 docs
- touched local READMEs
- `apps/admin/**`
- `backend/functions/**`
- any touched reusable admin package files

Resolve:

- inconsistent naming of hybrid identity actions/domains
- inconsistent source-of-authority labels
- mismatched permission / risk labels
- UI claiming unsupported actions
- docs overstating implementation maturity
- backend actions lacking corresponding audit/evidence behavior where the phase requires it
- environment docs claiming prerequisites that are not actually wired
- UI claiming no-code connection setup where the backend still requires manual code/config edits
- handoff guidance implying the developer must remain involved after delivering the `.sppkg`

### B. Create the exit report

Create:

- `docs/architecture/plans/MASTER/spfx/admin/phase-9/admin-spfx-phase-9-exit-reconciliation.md`

Required sections:

1. What was created or updated
2. Phase 9 exit criteria checklist
3. What Phase 9 intentionally did not do
4. Validation executed
5. Residual risks
6. Recommended next phase entry point

### C. Run the final validation set

Use the smallest meaningful set, likely including:

- targeted backend tests
- targeted frontend tests or route/component checks
- TypeScript/build verification for touched surfaces
- any other directly relevant focused validation

In the exit report, include:

- Verified
- Not run
- Why this set
- Residual risk

## Required exit checklist items

Verify whether the repo now has all of the following:

- a dedicated Hybrid Identity control lane in Admin SPFx
- authority-aware user/group/access capability through the privileged backend
- explicit source-of-authority and action/risk separation
- explicit permission / access / role matrix documentation
- UI-driven setup and maintenance of required backend connections without normal code edits
- a passing result against the hard no-code IT handoff gate
- audit-backed or evidence-backed identity workflows
- docs/runbooks/env guidance aligned to the implementation

## Completion condition

Stop when the repo has a coherent, validated Phase 9 implementation set and the exit-reconciliation file is complete.


## Hard-gate validation requirement

The exit report must include a dedicated section titled:

- `Hard no-code IT handoff gate`

That section must state explicitly whether all of the following are true:

- the developer can hand IT the final `.sppkg` and walk away,
- IT can complete normal setup through the app UI and standard Microsoft admin pages where unavoidable,
- IT does not need to edit source, manifests, `.env` files, backend config files, deployment templates, or package files,
- any remaining manual steps are clearly classified as external admin approvals or external infrastructure prerequisites rather than hidden engineering work,
- and the implemented connection-management UX is backed by real backend resolution and verification.

If any item fails, the phase fails.
