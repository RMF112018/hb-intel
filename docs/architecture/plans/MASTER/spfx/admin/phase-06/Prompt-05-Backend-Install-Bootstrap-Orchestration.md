# Prompt-05 — Backend Install/Bootstrap Orchestration

## Objective

Implement the backend install/bootstrap run support for Phase 6 using the existing provisioning/control-plane foundations as the seed crystal.

## Important execution rules

- Reuse the repo’s orchestration, persistence, adapter, and progress patterns where safe.
- Do not flatten the work into one giant synchronous endpoint.
- Keep privileged execution in the backend.
- Respect the manual-checkpoint policy from Prompt-02.

## Inputs

Use:
- Phase 6 architecture docs
- shared contracts
- preflight validator
- current provisioning saga and backend adapter foundations

## Required work

### A. Add install/bootstrap run-launch support
Implement the function/API layer needed to:
- create an install/bootstrap run
- validate that install may proceed
- queue or start execution
- retrieve summary/detail/status
- emit progress updates in the repo’s established pattern where applicable

### B. Implement the install/bootstrap orchestrator flow
Use the current repo’s orchestration style to sequence the install/bootstrap step families defined in the Phase 6 step model.

At minimum support:
- install input snapshot
- step sequencing
- durable step status updates
- failure capture
- terminal status handling
- evidence/result recording

### C. Reuse adapters and existing services where appropriate
Prefer extending or composing existing services instead of creating parallel ones for:
- SharePoint package / ALM / API posture operations
- Graph-backed grant operations
- persistence
- progress signaling
- audit writes

### D. Support “wherever technically possible” automation
Automate what is safe and technically feasible.
If an action requires admin consent or external approval that cannot be safely automated, represent it as a checkpoint, not as a silent failure and not as an undocumented manual prerequisite.

## Required documentation output

Create:
- `docs/architecture/plans/MASTER/spfx/admin/phase-6/admin-spfx-install-orchestrator.md`

Explain:
- orchestration entry points
- step sequencing
- adapter touchpoints
- failure behavior
- what is automated vs checkpointed
- why the implementation is Phase-6-appropriate instead of over-generalized

## Required boundaries

- Do not rewrite the provisioning saga from scratch.
- Do not couple install orchestration tightly to one page component.
- Do not bypass durable status updates.
- Do not implement full future multi-domain admin orchestration beyond what Phase 6 needs.

## Validation

Run targeted validation for the touched backend surfaces and any new orchestration logic.
Add focused tests around:
- sequencing
- failure handling
- terminal states
- durable status projection
- non-automatable checkpoint handoff

Document the exact validation set used.

## Completion condition

Stop after install/bootstrap orchestration is implemented, documented, and validated.
Do not build checkpoint resume actions or SPFx UI in this prompt.
