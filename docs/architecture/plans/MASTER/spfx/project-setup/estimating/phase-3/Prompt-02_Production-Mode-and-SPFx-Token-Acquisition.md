# Prompt 02 — Production Mode and SPFx Token Acquisition

You are continuing the **HB Intel Estimating / Project Setup SPFx** Phase 3 effort.

## Authoritative repository

- Repo: `https://github.com/RMF112018/hb-intel.git`

## Objective

Implement the **frontend production-mode and token-acquisition work** required to make `production` mode a real, deliberate, and supportable runtime posture for the isolated Project Setup package.

This prompt is focused on frontend/runtime/bootstrap behavior only.

## Critical instructions

- Use the Phase 3 auth matrix created in Prompt 01 as the governing source.
- Do **not** re-read files already in your active context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Do **not** preserve opaque token injection as the primary production pattern if a deliberate Project Setup API auth path can be implemented.
- Keep `ui-review` mode intact, but only as a clearly non-production, non-live-backend posture.
- Do **not** drift into backend validator redesign, broad infrastructure work, or unrelated UX polish in this prompt.

## Required working approach

1. Define the exact runtime prerequisites for `production` mode.
2. Implement intentional mode activation / gating so `production` does not appear active without its required auth/runtime prerequisites.
3. Implement the supported Project Setup API token-acquisition flow for SPFx.
4. Update bootstrap and API client initialization so production-mode auth behavior is explicit and diagnosable.
5. Ensure `ui-review` still boots cleanly and cannot be mistaken for a live auth posture.

## Specific outcomes required

By the end of this prompt:
- `production` mode should be intentionally activatable
- the frontend should use a deliberate auth/bootstrap path for the Project Setup API
- runtime config requirements should be explicit
- mode diagnostics should make it obvious why production mode is enabled or blocked
- `ui-review` should remain viable without implying live backend access

## Required implementation outputs

Make the code changes necessary to:
- implement production-mode gating / prerequisites
- update frontend bootstrap / auth initialization
- update API client initialization
- add or update mode diagnostics and developer/operator notes

Update or create a markdown file summarizing:
- production-mode activation rules
- token-acquisition behavior
- runtime config requirements
- any temporary compatibility shims retained, with explanation

## Acceptance criteria

- `production` mode is no longer latent or ambiguous.
- Frontend auth behavior is explicit and documented.
- `ui-review` remains usable without creating a false impression of production readiness.
- No unrelated backend redesign is introduced in this prompt.

## Required summary back to me

When done, report:
- files changed
- production-mode behavior implemented
- token-acquisition path implemented
- runtime requirements added or clarified
- any remaining frontend/backend auth issues that must be handled in Prompt 03
