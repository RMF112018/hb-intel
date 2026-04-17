# Prompt 07 — Extend Automated Tests and Closure Evidence

## Objective

Extend the existing shell test base and produce a stronger closure-evidence set that proves the shell is complete under the governing device classes and constraints.

This prompt exists because the repo already has shell tests, but Wave 01 still lacks a serious closure standard.

## Why this issue exists in the current code

The current repo already contains:
- `breakpointPolicy.test.ts`
- `slotComfortResolver.test.ts`
- `shellValidation.test.ts`

Those tests are valuable, but they do not yet prove the complete shell-only success standard:
- first-lane-first-view behavior
- entry-stack policy budgets
- protected vs configurable persistence boundaries
- inspectable diagnostics
- closure matrix coverage

## Current repo-truth evidence

Use at minimum:
- existing shell unit tests
- the shell preview/harness added by Prompt 06
- any shared entry-stack policy seam added by Prompt 02
- any persistence hardening added by Prompt 04

## Required future state

You are done only when all of the following are true:

1. Existing shell unit tests are preserved and extended rather than duplicated.
2. Tests cover the new shared entry-policy logic.
3. Tests cover protected-vs-configurable governance where appropriate.
4. Tests cover normalization of invalid persisted state where appropriate.
5. Closure artifacts exist for the breakpoint matrix.
6. Remaining gaps, if any, are explicit, specific, and shell-only.

## Files / seams / symbols to inspect

Inspect at minimum:
- `shell/__tests__/breakpointPolicy.test.ts`
- `shell/__tests__/slotComfortResolver.test.ts`
- `shell/__tests__/shellValidation.test.ts`
- any new harness or policy files introduced by earlier prompts

## Implementation requirements

1. Extend existing tests instead of creating parallel redundant suites.
2. Add tests for:
   - entry-stack policy budgets or references
   - protected-rule preservation
   - invalid persisted-state normalization
   - inspectable diagnostics where applicable
3. Produce a closure artifact set that maps the breakpoint matrix to observed shell behavior.
4. Make the closure evidence reusable by future agents.

## Validation / proof of closure

Return all of the following:
1. exact files changed
2. tests added or updated
3. a summary of what each added test now proves
4. the final closure artifact set
5. a breakpoint-by-breakpoint closure summary
6. any remaining shell-only gaps that are still real after this work

## Out-of-scope guardrails

Do not:
- delete or bypass existing shell tests unless replacing them with materially stronger equivalents
- claim closure from unit tests alone
- broaden this into general application QA outside the shell subject

## Instruction not to re-read files that are still in active context unless needed to confirm drift, dependencies, or uncertainty after changes

Do not re-read files that are still in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## No-deferral requirement

Do not defer any in-scope shell work to a later wave. If a detail is required now to make the shell correct, governed, and provably closed, address it now.

