# Prompt 09 — Phase 6 Auth Convergence, Preferences Endpoint, and Proxy Scope

## Objective
Close the remaining Phase 1/3 auth-related deferred work by converging retained surfaces onto one canonical auth posture, resolving the preferences backend mismatch, and making a final proxy decision.

## Required work
1. Re-audit current retained Project Setup auth surfaces:
   - requester
   - controller/review
   - admin/oversight
2. Remove or contain deprecated session-token helpers:
   - `apps/estimating/src/utils/resolveSessionToken.ts`
   - related helpers in accounting/admin if still live
3. Converge retained requester/controller/admin flows onto one canonical token-acquisition and route-auth posture where they remain in retained release scope.
4. Reconcile RBAC/auth divergence:
   - reduce split between JWT roles and UPN env lists where practical
   - document any intentional remaining split
5. Resolve the deferred complexity preferences backend contract:
   - either implement the expected backend contract for `/api/users/me/preferences`
   - or retire the frontend expectation and move the shared complexity package to the supported route/model
6. Make a final proxy decision:
   - implement real supported behavior, or
   - remove from retained Project Setup release scope, or
   - explicitly isolate as unsupported/transitional.

## Critical instructions
- Do not leave deprecated token helpers in supported production paths.
- Do not leave the preferences contract mismatch unresolved.
- Do not keep the proxy as an ambiguous auth-protected stub.

## Required documentation updates
Update:
- `docs/architecture/reviews/project-setup-phase-1-through-5-implementation-and-gap-report.md`

Add/update:
- Phase 1 deferred preferences item
- Phase 3 auth-convergence notes
- Phase 3 proxy decision notes
- closure statements and evidence for deprecated-token removal / preferences contract / proxy posture

## Acceptance criteria
- Retained surfaces converge on a clear canonical auth posture.
- Deprecated session-token paths are removed or tightly contained.
- The preferences backend contract mismatch is closed.
- Proxy posture is no longer ambiguous.
- The review report reflects the new auth truth.
