# Prompt 07 — Phase 5 Release Scope Freeze and Repo-Truth Revalidation

## Objective
Address the Phase 5 audit findings by revalidating the current release-hardening posture against live repo truth, freezing the intended retained Project Setup release surface, and aligning all Phase 5 work to that frozen scope before attempting closure.

## Required architecture / release posture
Treat the intended solution posture as:
- shared backend/service libraries inside the monorepo
- thin domain-specific backend hosts and runtime boundaries
- Project Setup / Estimating as its own domain/release boundary
- truthful release readiness based on retained release scope, not broad shared-host presence
- explicit distinction between:
  - repo proof
  - environment-gated proof
  - operational proof
  - undocumented assumptions

For this prompt, focus on **release-scope truth**, not broad feature expansion.

## Critical instructions
- Use the live repo as the implementation source of truth.
- Do not assume the prior Phase 5 audit findings are still exact; verify them first.
- Do not re-read files already in your active context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Do not widen into unrelated domain or UI-polish work.
- Do not close findings by documentation alone. Code, tests, runbooks, and docs must agree.
- Do not rely on broad “package exists / runbook exists / test exists” logic as proof of retained-surface release readiness.

## Audit findings being addressed
The Phase 5 audit concluded that:
- backend release-hardening evidence is materially real
- release-gate tests, lifecycle integration tests, scope-guard tests, smoke tests, and runbook/signoff docs exist
- but Phase 5 completion is overstated because:
  - frontend/package-level release evidence is weaker than the docs claim
  - retained-surface page-level SPFx tests were not at a clearly green baseline
  - smoke tests are environment-gated and not proof of live deployment validation
  - signoff docs overstate closure relative to repo truth
  - several readiness dependencies remain external/deployment/operational rather than proven in repo

Your first job is to re-verify which of these remain true in current repo state.

## Required repo-truth verification
Before changing code/docs, verify and document:
1. The exact retained Project Setup release surface.
2. The exact Phase 5 evidence categories currently present:
   - backend tests
   - frontend/package tests
   - smoke tests
   - runbooks
   - signoff docs
   - deployment prerequisites
3. Which Phase 5 assets prove repo truth versus merely describing future/operational actions.
4. Whether the current repo now supports a stronger retained-surface release posture than the audit found.
5. Which prior Phase 5 blockers remain open vs partially improved vs closed.

## Required work
1. Re-verify the current retained release-surface truth.
2. Freeze the intended Project Setup retained release scope in implementation terms.
3. Classify Phase 5 evidence into:
   - repo-proven
   - environment-gated
   - operational/manual
   - overstated or stale
4. Add code/doc-adjacent clarification where it materially reduces ambiguity for follow-on prompts.
5. Prepare a stable foundation for follow-on prompts addressing frontend tests, smoke/deployment proof, release gates/signoff, and documentation closure.

## Files likely in scope
Likely areas to inspect and possibly update:
- `apps/estimating/src/test/**`
- `backend/functions/src/test/**`
- `backend/functions/src/test/smoke/**`
- `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-5/**`
- `docs/architecture/reviews/project-setup-phase-1-through-5-implementation-and-gap-report.md`
- any Project Setup-specific backend host/release docs now present in repo truth

## Required documentation update
Update:
- `docs/architecture/reviews/project-setup-phase-1-through-5-implementation-and-gap-report.md`

Add a **Phase 5 progress note** that:
- states what was re-verified in current repo truth
- states the canonical retained Project Setup release surface
- distinguishes repo proof from environment-gated and operational proof
- explains whether the original Phase 5 audit findings remain accurate, partially stale, or closed

Add a **closure statement draft** for the release-scope architecture of Phase 5, for example:
- “The retained Project Setup release surface and its evidence model are now explicitly frozen around repo-proven tests, bounded environment-gated checks, and separately categorized operational signoff activities.”

Do not declare full Phase 5 closure unless the repo evidence supports it.

## Evidence requirements
When finished, update the review doc with:
- progress notes
- closure status
- evidence bullets citing exact repo files
- remaining release-readiness questions, if any

## Acceptance criteria
- The current Phase 5 release posture is re-verified against repo truth.
- Canonical retained release scope is explicitly identified.
- Repo proof vs environment-gated vs operational proof is explicitly categorized.
- The review doc is updated with truthful progress notes, closure language, and evidence.
