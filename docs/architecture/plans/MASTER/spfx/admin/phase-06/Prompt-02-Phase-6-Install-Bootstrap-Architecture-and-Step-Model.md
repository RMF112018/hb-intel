# Prompt-02 — Phase 6 Install/Bootstrap Architecture and Step Model

## Objective

Create the Phase 6 architecture slice for install/bootstrap so the repo has one clear reference for:
- what the setup/install lane is,
- what steps it contains,
- what must happen in the backend,
- what can remain operator-facing in SPFx,
- and where manual checkpoints are allowed.

## Important execution rules

- Use the Prompt-01 audit as the immediate controlling input.
- Do **not** re-read files that are still in active context unless needed.
- Keep this architecture slice Phase-6-specific.
- Do not accidentally write the full generalized control-plane doctrine again.

## Inputs

Use:
- `docs/architecture/plans/MASTER/spfx/admin/phase-6/admin-spfx-phase-6-prerequisite-audit.md`
- `docs/architecture/plans/MASTER/spfx/admin/admin-spfx-target-architecture.md`
- the attached end-state plan
- current repo-truth findings from Prompt-01

## Create

1. `docs/architecture/plans/MASTER/spfx/admin/phase-6/admin-spfx-install-bootstrap-architecture.md`
2. `docs/architecture/plans/MASTER/spfx/admin/phase-6/admin-spfx-install-bootstrap-step-model.md`
3. `docs/architecture/plans/MASTER/spfx/admin/phase-6/admin-spfx-install-manual-checkpoint-policy.md`

## Required architecture topics

### In the architecture doc
Cover:
- purpose of the Phase 6 lane
- operator-console responsibilities
- backend/control-plane responsibilities
- adapter responsibilities
- preflight vs install vs post-install verification separation
- why Phase 6 must reuse provisioning/backend foundations
- where checkpointed manual action is allowed and why
- explicit out-of-boundary items for SPFx

### In the step model
Define the canonical step families for:
- environment discovery
- preflight validation
- install/bootstrap execution
- manual checkpoint handling
- post-install verification
- final evidence/result publication

For each step family, define:
- purpose
- owner layer
- required inputs
- expected outputs
- blocking vs warning behavior
- whether it is automatable, manual-checkpointed, or observational

### In the manual-checkpoint policy
Define:
- what qualifies as an unavoidable manual action
- how it is represented in run state
- required operator instructions
- resume / reject / cancel behavior
- evidence and audit expectations
- explicit anti-patterns (for example: hidden manual work outside the run record)

## Required architecture constraints

Make these explicit unless repo truth forces a correction:
- SPFx remains the operator console only.
- The backend owns orchestration, privileged execution, persistence, and evidence.
- Manual approval/checkpoint handling must be modeled as part of the run, not outside it.
- The provisioning saga remains straight-through unless failure occurs; install/bootstrap may use checkpoints where unavoidable.
- The architecture should be future-compatible with later generalized run contracts, but Phase 6 should not wait for perfect earlier-phase completion.

## Validation

Before finishing:
- cross-check with Prompt-01 audit findings,
- verify no contradiction with the end-state plan,
- keep the documents concrete enough to drive implementation prompts 03–09.

## Completion condition

Stop after the three architecture docs are complete and cross-linked.
Do not implement shared contracts or code in this prompt.
