# Prompt 08 — Phase 3 Production Token Acquisition and API Audience Consistency

## Objective
Resolve the Phase 3 auth finding that the production token-acquisition and API audience story must be explicit, consistent, and aligned across frontend and backend for the Project Setup release surface.

## Critical instructions
- Work from live repo truth.
- Do not rely on deprecated session-token helpers as a production answer.
- Do not widen into unrelated app architecture or release work.
- Preserve `ui-review` mode as a bounded non-production path, not as a substitute for production auth correctness.
- Keep the solution aligned with the intended Project Setup domain boundary.

## Context
The audit found that:
- production-vs-`ui-review` mode is real
- SPFx audience-scoped token acquisition is materially implemented
- backend audience/issuer validation is materially implemented
- but the overall Phase 3 handoff overstated completion because auth convergence and transition cleanup were incomplete

This prompt is specifically about tightening the **production API token path** and ensuring the frontend/backend audience contract is explicit and correct.

## Required work
1. Re-verify the current production token-acquisition flow for the retained Project Setup release surface.
   - Identify the canonical token provider/factory.
   - Identify how API audience/scopes are configured.
   - Identify any fallback or alternate paths that still exist.

2. Reconcile the frontend production token path with backend validation.
   - Confirm that the intended audience/scopes used by the frontend match what `validateToken.ts` expects.
   - Confirm issuer/version handling is appropriate for the intended release posture.
   - Remove ambiguity between “real production API token” and “session-like/deprecated token path” usage.

3. Make the production path explicit in code.
   - Prefer one clear Project Setup production path over multiple soft alternatives.
   - Add clarifying inline comments where that materially reduces future ambiguity.
   - Avoid hidden magic around environment-derived audience behavior.

4. Preserve safe `ui-review` separation.
   - Ensure `ui-review` remains bounded and clearly distinct from the production API token path.
   - Prevent `ui-review` assumptions from contaminating production auth logic.

5. Tighten release-surface assumptions.
   - Ensure the retained Project Setup release surfaces use the canonical API token path.
   - Identify and isolate any surfaces that still do not.

## Files likely in scope
Likely:
- `apps/estimating/src/mount.tsx`
- `apps/estimating/src/project-setup/backend/ProjectSetupBackendContext.tsx`
- `apps/estimating/src/config/runtimeConfig.ts`
- `backend/functions/src/middleware/validateToken.ts`
- any shared token-provider helpers used by Project Setup release surfaces

## Required documentation update
Update:
- `docs/architecture/reviews/project-setup-phase-1-through-5-implementation-and-gap-report.md`

Add a **Phase 3 production-token progress note** that:
- states the canonical production API token path
- states the expected backend audience/validation posture
- states what ambiguity or redundancy was removed
- explains how `ui-review` remains separated from production auth

Add a **closure statement draft** such as:
- “The retained Project Setup release surface now uses a single explicit production API token path aligned to the backend audience-validation model, with `ui-review` remaining a bounded non-production mode.”

## Evidence requirements
The review doc update must include:
- exact files changed
- exact auth-path decisions made
- any remaining external environment or tenant dependencies
- any remaining auth caveats, if any

## Acceptance criteria
- The production token-acquisition path is explicit and canonical.
- Backend audience validation is aligned to the retained Project Setup release surface.
- `ui-review` is safely separated from production auth.
- The review doc is updated with truthful progress notes, closure language, and evidence.
