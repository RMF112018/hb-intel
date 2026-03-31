# Prompt 07 — Phase 3 Auth Architecture Freeze and Repo-Truth Revalidation

## Objective
Address the Phase 3 audit findings by revalidating the current auth architecture against live repo truth, freezing the intended Project Setup auth posture, and aligning implementation work to that frozen model before making deeper changes.

## Required architecture posture
Treat the intended backend/application architecture as:
- shared backend service patterns and reusable auth/config/middleware inside the monorepo
- thin domain-specific backend hosts / composition roots
- Project Setup / Estimating as its own domain host and release boundary
- least privilege, explicit domain boundaries, and truthful release/readiness validation

For this prompt, focus on the **auth architecture and scope truth**, not broad feature work.

## Critical instructions
- Use the live repo as the implementation source of truth.
- Do not assume the prior Phase 3 audit findings are still exact; verify them first.
- Do not re-read files already in your active context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Do not widen into unrelated domain or UI-polish work.
- Do not close findings by documentation alone. Code, tests, and docs must agree.
- Keep the Project Setup auth posture explicit, production-ready, and domain-scoped.

## Audit findings being addressed
The Phase 3 audit concluded that:
- Project Setup auth is substantially implemented
- production-vs-`ui-review` mode exists
- SPFx audience-scoped token acquisition exists
- backend JWT validation and route protection are real
- but auth completion is overstated because:
  - deprecated `resolveSessionToken()` still exists
  - related controller/admin surfaces still import session-token helpers
  - cross-surface auth convergence is incomplete
  - some auth-adjacent surfaces remain transitional
  - the proxy route is still a stub even though it is auth-protected

Your first job is to re-verify which of these remain true in current repo state.

## Required repo-truth verification
Before changing code, verify and document:
1. The currently intended auth modes for Project Setup:
   - production
   - `ui-review`
   - any fallback or degraded modes
2. The exact current token-acquisition path(s) for:
   - Estimating / requester surface
   - Accounting / controller review surface
   - Admin / provisioning oversight surface
3. The exact current backend token-validation / audience model.
4. Which code paths still rely on deprecated or transitional token helpers.
5. Which routes are intended to remain in supported release scope for Project Setup.
6. Whether the Project Setup auth model is currently scoped to the Project Setup domain boundary or still implicitly tied to a broader shared-host posture.

## Required work
1. Produce an explicit repo-truth auth architecture summary in code-adjacent docs/comments where useful.
2. Identify the intended “source of truth” pattern for:
   - acquiring an API token
   - validating an API token
   - protecting backend routes
   - handling `ui-review` mode safely
3. Identify auth surfaces that are:
   - canonical / supported
   - transitional and must be refactored
   - intentionally out of scope but still present
4. Freeze the intended Project Setup auth model in implementation terms so the next prompts can execute against a stable target.

## Files likely in scope
Likely areas to inspect and possibly update:
- `apps/estimating/src/config/runtimeConfig.ts`
- `apps/estimating/src/mount.tsx`
- `apps/estimating/src/project-setup/backend/ProjectSetupBackendContext.tsx`
- `apps/estimating/src/utils/resolveSessionToken.ts`
- `apps/accounting/src/pages/ProjectReviewQueuePage.tsx`
- `apps/admin/src/pages/ProvisioningOversightPage.tsx`
- `backend/functions/src/middleware/validateToken.ts`
- `backend/functions/src/middleware/auth.ts`
- related Phase 3 docs / review docs

## Required documentation update
Update:
- `docs/architecture/reviews/project-setup-phase-1-through-5-implementation-and-gap-report.md`

Add a **Phase 3 progress note** that:
- states what was re-verified in current repo truth
- states the canonical Project Setup auth posture
- distinguishes canonical auth paths from transitional ones
- explains whether the original Phase 3 audit findings remain accurate, partially stale, or closed

Add a **closure statement draft** for the architecture/scoping part of Phase 3, for example:
- “The Project Setup auth model is now explicitly frozen around a domain-scoped production path, a bounded `ui-review` path, and a single canonical API token/validation posture.”

Do not declare full Phase 3 closure unless the repo evidence supports it.

## Evidence requirements
When finished, update the review doc with:
- progress notes
- closure status
- evidence bullets citing exact repo files
- remaining open auth questions, if any

## Acceptance criteria
- The current Phase 3 auth posture is re-verified against repo truth.
- Canonical vs transitional auth paths are explicitly identified.
- The Project Setup auth model is frozen in implementation terms for follow-on work.
- The review doc is updated with truthful progress notes, closure language, and evidence.
