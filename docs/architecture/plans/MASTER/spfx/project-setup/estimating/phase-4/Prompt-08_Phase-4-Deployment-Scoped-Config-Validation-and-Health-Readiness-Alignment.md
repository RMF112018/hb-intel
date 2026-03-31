# Prompt 08 — Phase 4 Deployment-Scoped Config Validation and Health/Readiness Alignment

## Objective
Resolve the Phase 4 audit finding that startup/config validation and health/readiness reporting must be explicitly scoped to the Project Setup deployment posture rather than implicitly inheriting broader shared-host assumptions.

## Critical instructions
- Work from live repo truth.
- Keep the target architecture aligned to Project Setup as its own domain host/runtime boundary.
- Do not widen into unrelated domain or UI work.
- Do not preserve broad boot assumptions merely because they exist historically.
- Prefer truthful, deployment-scoped readiness over globally convenient validation.

## Context
The audit found that:
- tiered config validation is real
- health/readiness diagnostics are real
- but startup/runtime scoping is only partially aligned to actual deployment because the backend posture is broader than the Phase 4 documentation implies

This prompt is about tightening the **deployment-scoped infrastructure truth** for Project Setup.

## Required work
1. Re-verify the current config-validation model.
   - Identify core validations.
   - Identify Project Setup domain-specific validations.
   - Identify validations that are artifacts of broader shared-host posture and should not block a Project Setup host.

2. Re-scope validation to the intended Project Setup deployment boundary.
   - Ensure Project Setup startup/runtime validation only requires what the retained Project Setup host truly needs.
   - Ensure domain-specific prerequisites are explicit and isolated.
   - Do not allow unrelated domains or transitional services to create boot blockers for the Project Setup host.

3. Align health/readiness output to deployment truth.
   - Ensure health/readiness surfaces reflect the actual Project Setup host posture.
   - Distinguish clearly between:
     - runtime healthy
     - degraded but serviceable
     - blocked by Project Setup-specific prerequisites
     - blocked by external environment dependencies
   - Avoid broad/shared-host readiness claims if the retained Project Setup host does not own them.

4. Improve diagnostic clarity where helpful.
   - Add precise readiness metadata or comments if they materially reduce ambiguity.
   - Make it easy for release/readiness decisions to interpret the health output truthfully.

5. Preserve domain-specific composition-root discipline.
   - Validation and health surfaces should describe the Project Setup deployment boundary, not an unrelated superset.

## Files likely in scope
Likely:
- `backend/functions/src/utils/validate-config.ts`
- `backend/functions/src/functions/health/index.ts`
- Project Setup-specific backend host/composition-root files
- related readiness tests
- any health/readiness config helpers

## Required documentation update
Update:
- `docs/architecture/reviews/project-setup-phase-1-through-5-implementation-and-gap-report.md`

Add a **Phase 4 validation/readiness progress note** that:
- states the canonical Project Setup validation scope
- states what over-broad boot blockers were removed, narrowed, or confirmed absent
- states how health/readiness output now maps to actual Project Setup deployment truth
- explains any remaining external environment dependencies

Add a **closure statement draft** such as:
- “Project Setup startup/config validation and health/readiness reporting are now explicitly scoped to the retained Project Setup deployment boundary rather than a broader shared-host posture.”

## Evidence requirements
The review doc update must include:
- exact files changed
- exact validation/readiness decisions made
- any remaining environment-gated or external prerequisites
- any remaining caveats, if any

## Acceptance criteria
- Validation is scoped to the retained Project Setup deployment posture.
- Health/readiness reporting truthfully describes the Project Setup host.
- Broad shared-host boot blockers are removed, narrowed, or explicitly isolated.
- The review doc is updated with truthful progress notes, closure language, and evidence.
