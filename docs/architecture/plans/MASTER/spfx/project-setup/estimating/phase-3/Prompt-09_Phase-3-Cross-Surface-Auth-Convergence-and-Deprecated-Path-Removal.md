# Prompt 09 — Phase 3 Cross-Surface Auth Convergence and Deprecated Path Removal

## Objective
Address the Phase 3 audit finding that cross-surface auth convergence is incomplete by removing or containing deprecated session-token paths and aligning retained Project Setup-related surfaces to the canonical auth posture.

## Critical instructions
- Do not break supported controller/admin flows without replacing them with a canonical supported auth path.
- Do not leave “deprecated” helpers live in production-critical paths if a canonical replacement exists.
- Keep scope bounded to surfaces materially tied to the Project Setup retained launch/workflow posture.
- Be explicit about what is being converged versus what is intentionally deferred.

## Context
The audit specifically identified:
- deprecated `resolveSessionToken()` still exists
- related controller/admin surfaces still import session-token helpers
- cross-surface authorization/authentication posture is not fully converged

This prompt is about either:
- converging those retained surfaces to the canonical Project Setup auth pattern, or
- explicitly isolating/de-scoping anything that should not remain in retained release scope

## Required work
1. Audit current auth usage across retained Project Setup-adjacent surfaces.
   - requester
   - controller/review
   - admin/oversight
   - any other retained Phase 3/5 surfaces materially tied to launch posture

2. Classify each auth path as:
   - canonical and retained
   - transitional but still needed short-term
   - deprecated and removable now
   - out of retained release scope

3. Remove or contain deprecated token helpers.
   - Eliminate live production reliance on `resolveSessionToken()` where a canonical replacement exists.
   - If a helper must remain temporarily, narrow its scope and label it clearly.
   - Do not keep broad “temporary forever” fallback logic.

4. Align retained controller/admin surfaces to the canonical Project Setup auth posture where appropriate.
   - Ensure those surfaces do not silently rely on a weaker or different token model than the requester path unless there is a strong documented reason.

5. Add or improve guardrails.
   - Prevent future accidental reintroduction of deprecated token paths into retained release surfaces.

## Files likely in scope
Likely:
- `apps/estimating/src/utils/resolveSessionToken.ts`
- `apps/accounting/src/pages/ProjectReviewQueuePage.tsx`
- `apps/admin/src/pages/ProvisioningOversightPage.tsx`
- any related shared auth helpers
- any tests covering retained auth behavior

## Required documentation update
Update:
- `docs/architecture/reviews/project-setup-phase-1-through-5-implementation-and-gap-report.md`

Add a **Phase 3 auth-convergence progress note** that:
- records which retained surfaces were converged
- records whether `resolveSessionToken()` was removed, narrowed, or left intentionally isolated
- distinguishes remaining transitional auth posture from closed items

Add a **closure statement draft** such as:
- “Retained Project Setup-related surfaces now converge on the canonical auth posture, and deprecated session-token paths are no longer part of the supported production release surface.”

If some surfaces remain intentionally transitional, state that plainly.

## Evidence requirements
The review doc update must include:
- exact surfaces reviewed
- exact files changed
- exact deprecated paths removed or narrowed
- any intentionally deferred auth convergence work

## Acceptance criteria
- Retained Project Setup-related surfaces are aligned to the canonical auth posture or explicitly de-scoped.
- Deprecated token paths are removed from supported production paths or tightly contained.
- Future drift is reduced via guards/comments/tests where appropriate.
- The review doc is updated with truthful progress notes, closure language, and evidence.
