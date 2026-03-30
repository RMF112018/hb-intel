# Prompt 04 — Delegated vs App-Only Boundaries and Managed Identity Cleanup

You are continuing the **HB Intel Estimating / Project Setup** Phase 3 effort.

## Authoritative repository

- Repo: `https://github.com/RMF112018/hb-intel.git`

## Objective

Separate delegated-user behavior from app-only / managed-identity behavior in the Project Setup backend and clean up any misleading abstractions, especially around OBO semantics.

This prompt is focused on service boundaries, naming, and permission semantics.

## Critical instructions

- Use the Phase 3 auth matrix and Prompt 03 token-contract work as governing context.
- Do **not** re-read files already in your active context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Do **not** leave misleading OBO naming in place if the behavior is actually app-only.
- Do **not** drift into broad provisioning redesign or unrelated infrastructure work in this prompt.
- Keep changes scoped to the retained Project Setup backend capabilities.

## Required working approach

1. Classify each retained Project Setup capability as delegated-user or app-only.
2. Audit service abstractions and helper names for semantic correctness.
3. Refactor or rename misleading seams so the code communicates the true execution identity.
4. Document the permission boundary for each retained capability.
5. Add tests or assertions where feasible to prevent silent crossing between delegated and app-only semantics.

## Specific outcomes required

By the end of this prompt:
- it should be obvious which work runs as the user and which runs as the app
- misleading OBO semantics should be corrected
- managed-identity usage should be intentional and documented
- permission-boundary notes should exist for future phases and ops review

## Required implementation outputs

Make the code changes necessary to:
- update service abstractions / naming
- document capability boundaries
- add targeted tests or assertions for boundary-sensitive paths

Update or create a markdown file summarizing:
- delegated capabilities
- app-only capabilities
- seams renamed or refactored
- any follow-on permission requirements for deployment

## Acceptance criteria

- Engineers can tell exactly which retained operations run as the user and which run as the app.
- The code no longer implies delegated behavior where only app-only behavior exists.
- No silent identity-boundary crossing remains in retained Project Setup code paths.

## Required summary back to me

When done, report:
- files changed
- capability classifications made
- abstractions renamed/refactored
- tests/assertions added
- any remaining auth-hardening work that must be handled in Prompt 05
