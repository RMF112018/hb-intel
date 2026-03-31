# Prompt 09 — Phase 4 CORS, Managed Identity, and Downstream Permission Scoping

## Objective
Address the Phase 4 audit finding that the infrastructure posture must make Project Setup CORS, managed identity usage, and downstream permission assumptions explicit, bounded, and domain-scoped.

## Critical instructions
- Do not optimize for convenience over least privilege.
- Keep scope bounded to Project Setup retained release/runtime needs.
- Do not silently inherit broader downstream permissions, identity posture, or CORS assumptions from transitional/shared-host configuration.
- Preserve safe separation between:
  - Project Setup canonical runtime needs
  - broader monorepo/shared-library capabilities
  - transitional artifacts that should not define retained infrastructure truth

## Context
The audit found that:
- managed-identity-oriented service posture is materially real
- host/runtime config includes CORS settings
- but the current posture is only partially aligned to a Project Setup-specific deployment truth
- and CORS/config docs may imply a tighter posture than the currently checked-in config actually shows

This prompt is specifically about making CORS, identity, and downstream dependency posture truthful and bounded.

## Required work
1. Re-verify current Project Setup runtime dependency needs.
   - Identify which downstream resources/services Project Setup actually needs for retained scope.
   - Identify which managed-identity grants/assumptions are canonical for that scope.
   - Identify which downstream assumptions belong to broader/shared-host posture rather than Project Setup.

2. Reconcile CORS posture with retained Project Setup deployment truth.
   - Confirm the intended browser-origin posture for the Project Setup release surface.
   - Narrow or clarify config/docs/tests where current repo truth is broader than intended.
   - Avoid misleading “tenant-aligned” language if the actual checked-in posture is broader.

3. Reconcile managed identity posture with Project Setup scope.
   - Ensure service initialization and dependency assumptions reflect Project Setup’s actual downstream needs.
   - Prefer explicit, least-privilege, domain-scoped assumptions.
   - Clarify any intentionally shared infrastructure helpers versus Project Setup-specific grants/dependencies.

4. Clarify downstream permission model.
   - Document or encode which downstream dependencies are truly required for the Project Setup runtime.
   - Separate “required for retained release scope” from “available in shared library/service-factory posture.”

5. Add narrow guardrails/comments/tests where useful.
   - Prevent future drift back toward overly broad infrastructure assumptions for Project Setup.

## Files likely in scope
Likely:
- `backend/functions/host.json`
- `backend/functions/src/services/service-factory.ts`
- managed-identity-related services/adapters
- any Project Setup-specific backend host config
- infra/readiness tests touching CORS/identity assumptions
- any docs that describe Project Setup runtime prerequisites

## Required documentation update
Update:
- `docs/architecture/reviews/project-setup-phase-1-through-5-implementation-and-gap-report.md`

Add a **Phase 4 CORS/identity progress note** that:
- states the retained Project Setup CORS posture
- states the retained Project Setup managed-identity/downstream dependency posture
- records what broad/shared-host assumptions were removed, narrowed, or explicitly labeled transitional
- distinguishes canonical retained runtime needs from broader monorepo capability

Add a **closure statement draft** such as:
- “Project Setup CORS, managed identity, and downstream runtime assumptions are now explicit and domain-scoped, with broad shared-host infrastructure posture no longer defining retained release truth.”

## Evidence requirements
The review doc update must include:
- exact files changed
- exact CORS/identity/downstream decisions made
- any remaining operational or environment dependencies
- any intentionally deferred least-privilege follow-up

## Acceptance criteria
- Project Setup CORS posture is explicit and truthful.
- Project Setup managed-identity/downstream assumptions are explicit and domain-scoped.
- Broad shared-host infrastructure assumptions are removed, narrowed, or clearly marked transitional.
- The review doc is updated with truthful progress notes, closure language, and evidence.
