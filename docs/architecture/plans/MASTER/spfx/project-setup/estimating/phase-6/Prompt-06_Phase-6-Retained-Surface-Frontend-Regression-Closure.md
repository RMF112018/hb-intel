# Prompt 12 — Phase 6 Retained-Surface Frontend Regression Closure

## Objective
Close the retained-surface frontend release blocker by bringing the Project Setup retained requester surface to a truthful, stable, green verification baseline.

## Required work
1. Re-audit retained frontend tests and identify the canonical retained release proof set.
2. Fix the retained page-level failures at minimum for:
   - `apps/estimating/src/test/NewRequestPage.test.tsx`
   - `apps/estimating/src/test/RequestDetailPage.test.tsx`
   - `apps/estimating/src/test/RequestDetailPage.coordinator.test.tsx`
3. Update tests or implementation honestly:
   - if behavior drifted legitimately, update tests
   - if retained behavior is broken, fix implementation
   - if any tests are stale/out-of-scope, isolate them with explicit rationale
4. Tighten fixtures, harnesses, and assertions so the retained Project Setup release surface has a decision-useful package-level proof slice.
5. Rerun the retained package-level verification slice and record the result.

## Critical instructions
- Do not hide legitimate retained-surface failures behind broad skips.
- Do not let stale/out-of-scope test noise keep distorting retained release truth.
- The end state must clearly distinguish:
   - retained-surface proof
   - broader package noise
   - intentionally non-retained tests

## Required documentation updates
Update:
- `docs/architecture/reviews/project-setup-phase-1-through-5-implementation-and-gap-report.md`

Add/update:
- Phase 5 retained-surface frontend regression note
- proof-set definition
- test results
- closure statement for frontend retained-surface readiness

## Acceptance criteria
- Retained Project Setup frontend proof set is explicit.
- The retained baseline is green, or any remaining failures are explicitly bounded and categorized.
- The review report reflects the retained frontend truth.
