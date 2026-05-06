# Prompt 08 — Cross-Route Surface Contract Tests


# Operating Rules for the Local Code Agent

- Work only in the current repository.
- Do not re-read files that are still within your current context or memory. Use targeted reads only when verifying drift.
- Do not install packages.
- Do not change `pnpm-lock.yaml`.
- Do not modify backend/functions.
- Do not enable live integrations, mutations, saves, launches, approvals, repairs, sync, access changes, or HBI execution.
- Preserve read-only / preview-only / inert behavior.
- Preserve bento direct-child invariants.
- Preserve existing `data-pcc-*` markers unless the prompt explicitly instructs a replacement and test update.
- Run the required validation commands listed in this prompt.
- Close with commit-ready summary, files changed, validation output, and residual risks.


## Objective

Add route-level tests proving the full PCC card contract across every routed surface.

## Context


Use `07_TEST_ACCEPTANCE_MATRIX.md`. This prompt is test-focused; avoid implementation changes unless fixing a test-discovered contract violation inside Prompt 02 scope.


## Required Work


1. Create or update `apps/project-control-center/src/tests/PccSurfaceCardContract.test.tsx`.
2. Render every route:
   - project-home
   - team-and-access
   - documents
   - project-readiness
   - approvals
   - external-systems
   - control-center-settings
   - site-health
3. Assert:
   - exactly one Tier 1 command card in ready state
   - every card has tier and region
   - first card is the Tier 1 command card
   - active panel marker belongs to command/state route card only
   - all cards are direct bento-grid children
   - no deferred/reference card is Tier 1
   - command card heading is h2
4. Add read-model-path coverage where existing test helpers make it practical.
5. Do not introduce broad mocks that hide real DOM structure.


## Validation


Run:

```bash
pnpm --filter @hbc/spfx-project-control-center test -- PccSurfaceCardContract
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center exec tsc --noEmit
pnpm exec prettier --check apps/project-control-center/src/tests/PccSurfaceCardContract.test.tsx
git diff --check
md5 pnpm-lock.yaml
```


## Closeout Response Required


Report:
- contract test coverage by route
- any route exceptions
- full test output
