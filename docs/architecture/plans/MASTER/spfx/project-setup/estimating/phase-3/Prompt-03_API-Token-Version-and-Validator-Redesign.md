# Prompt 03 — API Token Version and Validator Redesign

You are continuing the **HB Intel Estimating / Project Setup** Phase 3 effort.

## Authoritative repository

- Repo: `https://github.com/RMF112018/hb-intel.git`

## Objective

Redesign the backend Project Setup API token validation model so it matches the chosen API token contract and is safe for production use.

This prompt is focused on the API token contract and validator behavior only.

## Critical instructions

- Use the Phase 3 auth matrix and the frontend production-mode work from Prompt 02 as governing context.
- Do **not** re-read files already in your active context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Do **not** leave narrow issuer/audience assumptions in place if they do not match the chosen API contract.
- Do **not** drift into managed-identity boundary cleanup or broad route-surface redesign in this prompt.
- Keep changes scoped to the Project Setup API auth contract and its validator/test surface.

## Required working approach

1. Determine and document the Project Setup API token contract:
   - token version posture
   - audience
   - issuer rules
   - tenant rules
   - required claims
2. Update the validator implementation to enforce that contract safely.
3. Replace ambiguous or unsafe assumptions with explicit documented logic.
4. Add tests for success and failure paths.
5. Improve diagnostics for validator failures without leaking sensitive data.

## Specific outcomes required

By the end of this prompt:
- the API token contract should be written down explicitly
- the validator should match that contract
- invalid token cases should fail clearly and safely
- tests should cover the major success and failure paths

## Required implementation outputs

Make the code changes necessary to:
- update validator behavior
- add/adjust auth middleware tests
- document the API token contract
- add safe diagnostics for validator failures

Update or create a markdown file summarizing:
- chosen token contract
- validator changes made
- test coverage added
- any unresolved tenant/app-registration dependencies that must be completed outside code

## Acceptance criteria

- The validator behavior is no longer narrower than the documented API token contract.
- Success and failure paths are covered by tests.
- The Project Setup API auth contract is explicit enough for deployment and troubleshooting.

## Required summary back to me

When done, report:
- files changed
- token contract chosen
- validator behavior changed
- tests added
- any remaining auth-boundary issues that must be handled in Prompt 04
