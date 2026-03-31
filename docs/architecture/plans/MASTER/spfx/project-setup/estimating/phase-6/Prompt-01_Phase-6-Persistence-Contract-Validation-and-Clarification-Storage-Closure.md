# Prompt 07 — Phase 6 Persistence Contract, Validation, and Clarification Storage Closure

## Objective
Close the remaining production data-contract blocker by aligning the live Project Setup request model, real SharePoint persistence path, required-field enforcement, and clarification-record storage behavior.

## Why this prompt comes first
The deferred inventory identifies persistence truth as the strongest blocker because it gates every later claim about release hardening and retained-surface readiness.

## Required work
1. Re-audit current repo truth for the live `IProjectSetupRequest` shape.
2. Reconcile the real SharePoint field contract and mapper against the live wizard shape.
3. Verify whether the 2026-03-31 Phase 2 remediation is fully present in repo truth or still partial.
4. Close any remaining field gaps in:
   - `packages/models/src/provisioning/IProvisioning.ts`
   - `backend/functions/src/services/projects-list-contract.ts`
   - `backend/functions/src/services/projects-list-mapper.ts`
   - `backend/functions/src/services/project-requests-repository.ts`
5. Re-enable required-field enforcement in:
   - `packages/features/estimating/src/project-setup/config/projectSetupSteps.ts`
   only after the real persistence path supports the enforced contract.
6. Make an explicit production decision for `clarificationItems` if the current SP Text / 255-char posture is insufficient:
   - keep as-is with hard documented limitation, or
   - migrate to a fit-for-purpose storage shape/column type.
7. Ensure backend validation and request lifecycle handling match the final enforced contract.

## Critical instructions
- Do not re-enable required fields before the real persistence path can safely carry the enforced values.
- Do not rely on mock repository behavior as proof of production persistence.
- If `clarificationItems` remains constrained by a storage limitation, document the limitation plainly and treat it as open unless you actually close it.

## Required documentation updates
Update:
- `docs/architecture/reviews/project-setup-phase-1-through-5-implementation-and-gap-report.md`

Add/update:
- Phase 2 progress notes
- closure statement for the persistence blocker
- evidence bullets
- explicit note on required-field enforcement status
- explicit note on `clarificationItems` storage posture

## Acceptance criteria
- Real production persistence matches the intended enforced request contract.
- Required-field enforcement is either re-enabled safely or left disabled with a precise repo-truth justification.
- `clarificationItems` has an explicit, truthful production posture.
- The review report is updated with evidence-based closure language.
