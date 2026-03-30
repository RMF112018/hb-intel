# Prompt 05 — Backend Auth Hardening, CORS, Permissions, and Tests

You are continuing the **HB Intel Estimating / Project Setup** Phase 3 effort.

## Authoritative repository

- Repo: `https://github.com/RMF112018/hb-intel.git`

## Objective

Finalize the retained Project Setup backend auth posture by hardening route-level protection, locking down auth-related runtime requirements, documenting CORS and permission prerequisites, and adding regression protection.

This prompt is focused on backend auth hardening and release readiness.

## Critical instructions

- Use the outputs from Prompts 01–04 as governing context.
- Do **not** re-read files already in your active context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Do **not** broaden the backend surface in this prompt.
- Do **not** drift into unrelated non-auth infrastructure tuning.
- Keep the work scoped to retained Project Setup routes, mode behavior, permission prerequisites, and regression coverage.

## Required working approach

1. Review each retained Project Setup backend route for correct auth enforcement.
2. Tighten any inconsistent or missing protection.
3. Document the exact CORS, app registration, permission approval, and service-identity prerequisites for this deployment.
4. Add tests / release checks for:
   - protected route success/failure
   - missing runtime config
   - production-mode activation prerequisites
   - validator failure paths not already covered
5. Improve operational diagnostics for auth-related failures.

## Specific outcomes required

By the end of this prompt:
- retained routes should have explicit auth expectations
- auth-related runtime requirements should be documented and testable
- release-readiness checks should catch major auth/config regressions
- diagnostics should make auth/config failures obvious

## Required implementation outputs

Make the code changes necessary to:
- tighten route protection where needed
- add/update auth-focused tests and release checks
- document CORS / permission prerequisites
- improve auth-related diagnostics and operator/developer notes

Update or create a markdown file summarizing:
- route auth matrix
- CORS / permission prerequisites
- tests and release checks added
- any known deployment-time dependencies that cannot be solved in code

## Acceptance criteria

- Auth enforcement is consistent across the retained Project Setup backend surface.
- Missing prerequisites fail clearly.
- Release-readiness checks protect the Phase 3 auth posture from silent regression.

## Required summary back to me

When done, report:
- files changed
- route protections changed
- tests/release checks added
- CORS / permission notes documented
- any final unresolved items for Prompt 06
