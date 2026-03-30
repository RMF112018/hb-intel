# Prompt 02 — Integration, Regression, and End-to-End Coverage

You are continuing the **HB Intel Estimating / Project Setup SPFx** Phase 5 effort.

## Authoritative repository

- Repo: `https://github.com/RMF112018/hb-intel.git`

## Objective

Implement the **integration, regression, and end-to-end coverage** required to make Project Setup release claims credible.

This prompt is focused on turning retained launch assumptions into executable tests.

## Critical instructions

- Use the Phase 5 baseline created in Prompt 01 as the governing source.
- Do **not** re-read files already in your active context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Do **not** reopen broad architecture redesign.
- Do **not** write shallow tests that merely exercise happy-path rendering without checking release-critical assumptions.

## Required working approach

1. Review the retained Project Setup launch surface and its critical flows.
2. Identify the highest-value release assumptions that are still not test-backed.
3. Add or tighten integration, regression, and end-to-end / smoke coverage for those assumptions.
4. Add regression guards for removed/orphaned scope so unsupported shell behaviors do not silently return.
5. Update or create markdown documenting what release evidence the new tests provide.

## Specific outcomes required

By the end of this prompt:
- retained launch assumptions are test-backed wherever practical
- unsupported scope has regression guards
- production mode and UI-review mode behavior are both covered where intentionally retained
- the repo has clear evidence that the package is not relying on narrow demo-only paths

## Required implementation outputs

Make the code changes necessary to add or tighten tests for at least:
- package boot in UI-review mode
- package boot in production mode
- retained authenticated API call path
- project request create/list/update-state lifecycle
- production `Projects` list mapping assumptions
- retained provisioning-status path if still in scope
- failure behavior for missing config / denied permissions / backend unavailability
- prevention of unsupported/orphaned route reintroduction

Update or create markdown summarizing:
- tests added or changed
- release assumptions now covered
- assumptions still not testable and why
- any remaining evidence gaps to close later in Phase 5

## Acceptance criteria

- Retained launch assumptions are meaningfully covered by tests.
- Unsupported scope cannot quietly re-enter the package without detection.
- Test outputs are understandable enough to be used as release evidence.

## Required summary back to me

When done, report:
- files changed
- tests added or strengthened
- release assumptions now covered
- evidence gaps that remain
- any blockers discovered that require a narrow corrective change before release
