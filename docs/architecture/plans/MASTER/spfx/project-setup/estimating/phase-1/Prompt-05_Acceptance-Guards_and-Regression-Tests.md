# Prompt 05 — Acceptance Guards and Regression Tests

You are continuing the **HB Intel Estimating / Project Setup SPFx** Phase 1 effort.

## Authoritative repository

- Repo: `https://github.com/RMF112018/hb-intel.git`

## Objective

Add the minimum effective **acceptance guards and regression protection** needed so removed scope cannot silently return later.

## Critical instructions

- Use the frozen contract from Prompt 04 as the governing source.
- Do **not** re-read files already in your active context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Do **not** write brittle snapshot tests that fail for noise but miss real regressions.
- Favor targeted tests and assertions that directly protect Phase 1 scope boundaries.

## Required working approach

1. Add tests or checks proving only allowed routes remain.
2. Add tests or checks proving removed API calls are not present in the isolated path.
3. Add tests or checks proving runtime mode rules are enforced.
4. Add a release/readiness checklist for Phase 1 completion.

## Required implementation outputs

Implement the most appropriate mix of:
- unit tests
- route-tree tests
- config validation tests
- static assertions
- lint/test helpers
- markdown checklist

At minimum, protect against reintroduction of:
- non-Project-Setup routes
- orphaned user/group/preferences/notification calls
- undocumented runtime mode assumptions

## Acceptance criteria

- A future merge that reintroduces removed scope should fail validation.
- The Phase 1 checklist exists in repo truth.
- Tests are targeted enough to be useful in CI.

## Required summary back to me

When done, report:
- tests/checks added
- what exact regressions they catch
- any known gaps still not covered
