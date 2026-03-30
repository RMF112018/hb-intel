# Prompt 04 — Contract Freeze: API Surface, Runtime Config, and Mode Rules

You are continuing the **HB Intel Estimating / Project Setup SPFx** Phase 1 effort.

## Authoritative repository

- Repo: `https://github.com/RMF112018/hb-intel.git`

## Objective

Write and enforce the **frozen contract** for the isolated Project Setup package.

By the end of this prompt, engineers should be able to answer:
- which routes are allowed
- which runtime modes exist
- what config each mode requires
- which backend endpoints are allowed
- what request/response/error shapes are expected

## Critical instructions

- Use the repo truth established in Prompts 01–03.
- Do **not** re-read files already in your active context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Do **not** treat informal behavior as contract.
- Do **not** leave mode behavior implicit.
- Keep this prompt inside Phase 1 boundaries.

## Required working approach

1. Create one authoritative contract document for isolated Project Setup.
2. Define:
   - allowed frontend routes
   - allowed backend endpoints
   - request/query/response/error shapes
   - `ui-review` mode rules
   - production mode rules
   - runtime config requirements
   - explicit non-goals / excluded scope
3. Align code-level types or validation helpers to that contract where practical.
4. Add guardrails or comments where future work is required but not yet implemented.

## Required implementation outputs

Create or update documentation in an appropriate repo path with sections for:
- Scope statement
- Frontend route contract
- Backend route contract
- Runtime mode contract
- Config contract
- Excluded scope
- Known deferred items

Where appropriate, add or update:
- shared types
- narrow config helpers
- route constants
- comments or assertions enforcing the contract

## Acceptance criteria

- The isolated package contract exists in repo truth.
- Mode behavior is explicit.
- Engineers no longer need to infer whether something is “supposed to be in scope.”
- Code-level constants/types do not contradict the contract.

## Required summary back to me

When done, report:
- contract file path(s)
- route list
- runtime mode rules
- deferred items intentionally left for later phases
