# Prompt 10 — Phase 3 Protected Route Scope, Proxy Decision, and Auth Readiness Tests

## Objective
Close the remaining Phase 3 implementation ambiguity around protected route scope, the proxy stub decision, and auth-readiness proof so that Phase 3 is supported by clear repo evidence rather than broad handoff language.

## Critical instructions
- Truthfulness matters more than breadth.
- Do not claim route/auth completeness if the retained Project Setup release scope is still ambiguous.
- Make an explicit proxy decision: implement, isolate, or remove from supported scope.
- Ensure tests prove the retained auth posture, not a broader or vaguer one.

## Context
The audit found:
- backend JWT validation and route protection are real
- auth contract tests and release-readiness tests are real
- but the proxy route remains a stub
- and the overall handoff language is stronger than the current combined evidence

This prompt addresses the “proof and supported scope” side of the Phase 3 findings.

## Required work
1. Re-verify the retained protected backend route surface for Project Setup.
   - Identify which routes are part of the supported Project Setup release surface.
   - Identify which routes are merely present because of transitional/shared-host posture.
   - Document the distinction in code-adjacent comments/tests/docs where useful.

2. Make the proxy decision.
   Choose and implement the truthful repo-truth-appropriate option:
   - implement the proxy route for supported use, or
   - remove it from retained Project Setup release scope, or
   - isolate it clearly as non-release / transitional
   Do not leave this ambiguous.

3. Strengthen auth-readiness proof.
   - Ensure tests clearly prove the retained Project Setup protected route/auth posture.
   - Add or refine tests if current coverage is too broad, too weak, or too ambiguous.
   - Make it hard for future regressions to silently weaken route protection.

4. Align route/auth readiness docs with retained scope.
   - Avoid broad statements that imply every adjacent or transitional route is Phase 3-complete.
   - Prefer precise scope truth.

## Files likely in scope
Likely:
- `backend/functions/src/middleware/auth.ts`
- `backend/functions/src/middleware/validateToken.ts`
- `backend/functions/src/functions/projectRequests/index.ts`
- `backend/functions/src/functions/signalr/index.ts`
- `backend/functions/src/functions/proxy/proxy-handler.ts`
- Phase 3 auth tests / release-readiness tests

## Required documentation update
Update:
- `docs/architecture/reviews/project-setup-phase-1-through-5-implementation-and-gap-report.md`

Add a **Phase 3 protected-route/testing progress note** that:
- states the retained protected route surface
- states the explicit proxy decision
- states what auth-readiness tests now prove
- distinguishes retained release proof from broader shared-host presence

Add a **closure statement draft** such as:
- “The retained Project Setup protected route surface is now explicit, the proxy posture is no longer ambiguous, and Phase 3 auth readiness is supported by route-accurate tests.”

## Evidence requirements
The review doc update must include:
- exact routes reviewed
- exact proxy decision
- tests added/updated
- any remaining unsupported or transitional route posture

## Acceptance criteria
- Retained protected Project Setup route scope is explicit.
- The proxy route is implemented, removed from scope, or explicitly isolated.
- Tests truthfully prove retained auth readiness.
- The review doc is updated with progress notes, closure language, and evidence.
