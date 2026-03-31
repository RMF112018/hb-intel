# Prompt 09 — Phase 5 Smoke Tests, Deployment Runbook, and Operational Proof Categorization

## Objective
Address the Phase 5 audit finding that smoke tests and deployment/runbook artifacts are useful but environment-gated, and therefore must be categorized truthfully rather than treated as self-proving release readiness.

## Critical instructions
- Be exact about what repo can prove and what it cannot.
- Do not describe environment-gated smoke tests as equivalent to completed deployment validation.
- Do not widen into unrelated infra/auth work beyond what is needed to make Phase 5 proof truthful.
- Preserve a clear distinction between:
  - repo-executable checks
  - environment prerequisites
  - manual deployment steps
  - post-deploy verification
  - completed operational evidence

## Context
The audit found that smoke tests, runbooks, and release docs exist, but that their existence does not prove a successful live staging/production rehearsal or fully validated retained release posture.

This prompt is about the **truthful evidence model** for smoke/deployment proof.

## Required work
1. Re-verify the current smoke/deployment evidence set.
   - Identify what smoke tests are present.
   - Identify what they require from environment/runtime.
   - Identify what runbooks and deployment docs describe versus what repo can actually prove.

2. Improve evidence categorization.
   - Make it explicit which smoke tests are:
     - repo-present and executable with environment
     - environment-gated
     - intended for post-deploy verification only
   - Make it explicit which runbook/signoff steps are documentary rather than self-proving.

3. Improve the retained Project Setup deployment-proof posture.
   - Tighten runbook/readiness docs so it is clear what constitutes:
     - pre-deploy readiness
     - deploy execution
     - post-deploy validation
     - operational acceptance
   - Avoid broad “ready for production” language unless the evidence set truly supports it.

4. Add guardrails.
   - Make it harder for future docs to treat “smoke test exists” as proof that staging/production validation occurred.
   - Prefer explicit evidence categories and prerequisites.

## Files likely in scope
Likely:
- `backend/functions/src/test/smoke/post-deploy-smoke.test.ts`
- `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-5/Phase-5_Deployment-Runbook.md`
- `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-5/Phase-5_Release-Gates-and-Diagnostics.md`
- related deployment/readiness docs/scripts touching Project Setup verification

## Required documentation update
Update:
- `docs/architecture/reviews/project-setup-phase-1-through-5-implementation-and-gap-report.md`

Add a **Phase 5 smoke/deployment progress note** that:
- states what smoke/deployment evidence is truly repo-proven
- states what remains environment-gated
- states what remains operational/manual
- records any changes made to runbook/readiness clarity for Project Setup

Add a **closure statement draft** such as:
- “Project Setup smoke tests and deployment artifacts are now categorized truthfully across repo-present checks, environment-gated execution, and operational post-deploy verification, reducing overstated readiness claims.”

## Evidence requirements
The review doc update must include:
- exact tests/docs changed
- exact evidence categories
- any remaining environment or operational dependencies
- any remaining deployment-proof gaps, if any

## Acceptance criteria
- Smoke/deployment proof is categorized truthfully.
- Runbook/readiness docs no longer imply that repo artifacts equal completed deployment validation.
- The retained Project Setup deployment-proof posture is more explicit and decision-useful.
- The review doc is updated with progress notes, closure language, and evidence.
