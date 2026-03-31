# Prompt 07 — Phase 4 Infrastructure Architecture Freeze and Deployment-Scope Revalidation

## Objective
Address the Phase 4 audit findings by revalidating the current infrastructure posture against live repo truth, freezing the intended Project Setup infrastructure boundary, and aligning Phase 4 work to the actual target deployment model before making deeper implementation changes.

## Required architecture posture
Treat the intended solution architecture as:
- shared backend service patterns and reusable infrastructure/config/auth/telemetry helpers inside the monorepo
- thin domain-specific Function App hosts / composition roots
- Project Setup / Estimating as its own domain host, runtime boundary, and release boundary
- least privilege, minimal blast radius, explicit domain boundaries, and truthful deployment/readiness validation

For this prompt, focus on **Phase 4 infrastructure scope truth**, not broad feature work.

## Critical instructions
- Use the live repo as the implementation source of truth.
- Do not assume the prior Phase 4 audit findings are still exact; verify them first.
- Do not re-read files already in your active context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Do not widen into unrelated feature/UI work.
- Do not close findings by documentation alone. Code, config, tests, and docs must agree.
- Preserve the intended “shared backend libraries + domain-specific hosts” architecture.

## Audit findings being addressed
The Phase 4 audit concluded that:
- tiered config validation exists
- the health endpoint exposes operational readiness and config tiers
- managed-identity-oriented service posture is materially real
- `host.json` contains CORS and SignalR config
- observability artifacts are checked into repo
- but Phase 4 completion is overstated because:
  - startup scoping is only partial
  - the backend host still reflects broader multi-domain registration
  - observability artifacts are not equivalent to operationalized monitoring
  - CORS posture is broader than some docs imply
  - deployment/runtime validation is stronger in repo than in live operational proof

Your first job is to re-verify which of these remain true in current repo state.

## Required repo-truth verification
Before changing code, verify and document:
1. The current Project Setup backend host / deployment posture.
2. Whether startup/config validation is currently scoped to:
   - Project Setup domain only, or
   - a broader shared-host posture.
3. Which infrastructure concerns are canonical for Project Setup:
   - config validation
   - health diagnostics
   - managed identity
   - storage/runtime dependencies
   - CORS
   - observability
4. Which Phase 4 assets are:
   - canonical and retained
   - transitional/shared-host artifacts
   - documentary only and not yet operationalized
5. Whether current repo truth now supports a Project Setup-specific infrastructure boundary or still materially depends on shared-host assumptions.

## Required work
1. Re-verify the current infrastructure architecture against repo truth.
2. Freeze the intended Project Setup infrastructure model in implementation terms.
3. Identify which Phase 4 surfaces are canonical vs transitional.
4. Add code-adjacent clarification comments/docs where they materially reduce ambiguity.
5. Prepare a stable foundation for follow-on prompts addressing scoping, CORS, identity, observability, and readiness proof.

## Files likely in scope
Likely areas to inspect and possibly update:
- `backend/functions/src/index.ts`
- `backend/functions/src/utils/validate-config.ts`
- `backend/functions/src/functions/health/index.ts`
- `backend/functions/src/services/service-factory.ts`
- `backend/functions/host.json`
- `backend/functions/observability/**`
- any Project Setup-specific backend host/composition-root files now present in repo truth
- related Phase 4 docs / review docs

## Required documentation update
Update:
- `docs/architecture/reviews/project-setup-phase-1-through-5-implementation-and-gap-report.md`

Add a **Phase 4 progress note** that:
- states what was re-verified in current repo truth
- states the canonical Project Setup infrastructure posture
- distinguishes canonical retained infrastructure from transitional/shared-host infrastructure
- explains whether the original Phase 4 audit findings remain accurate, partially stale, or closed

Add a **closure statement draft** for the architecture/scoping part of Phase 4, for example:
- “The Project Setup infrastructure posture is now explicitly frozen around a domain-scoped backend host, deployment-scoped validation, bounded CORS/identity/runtime assumptions, and a truthful distinction between repo artifacts and operationalized readiness.”

Do not declare full Phase 4 closure unless the repo evidence supports it.

## Evidence requirements
When finished, update the review doc with:
- progress notes
- closure status
- evidence bullets citing exact repo files
- remaining open infrastructure questions, if any

## Acceptance criteria
- The current Phase 4 infrastructure posture is re-verified against repo truth.
- Canonical vs transitional infrastructure surfaces are explicitly identified.
- The Project Setup infrastructure model is frozen in implementation terms for follow-on work.
- The review doc is updated with truthful progress notes, closure language, and evidence.
