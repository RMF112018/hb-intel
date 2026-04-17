# Prompt 06 — Build Shell Conformance Harness, Tests, and Closure Artifacts

## Objective

Finish the shell-only Wave 02 program with a proof-grade conformance package covering governance, persisted boundaries, entry-stack rules, and constrained-state behavior.

## Why this issue exists in the current code

The live shell already has some validation tests.
That is not enough to close this wave.

The attached Wave 02 package asked for closure artifacts, but did not define the proof burden strongly enough.
This wave needs a shell-only closure package that a reviewer can actually trust.

## Current repo-truth evidence

- `shellValidation.test.ts` proves basic parsing, preset resolution, and preview behavior.
- There is no equivalent proof set yet for:
  - breakpoint policy behavior
  - slot comfort pair/stack outcomes
  - persisted policy rejection
  - shared entry-stack contract behavior
  - constrained-width / short-height reflow-oriented checks
- The doctrine and breakpoint spec demand stronger conformance than the current proof set demonstrates.

## Required future state

By the end of this prompt, the shell should have a reviewable proof package that demonstrates:

- governance rules are enforced
- persisted payload boundaries are bounded and reject unsafe mutations
- presets and overrides obey canonical semantics
- hero / priority actions / first-lane behavior align to the shared shell-entry contract
- constrained states remain shell-safe and reflow-safe
- the work stayed shell-only

The closure package should be suitable for code review and wave sign-off.

## Files / seams / symbols to inspect

- `apps/hb-webparts/src/webparts/hbHomepage/shell/__tests__/shellValidation.test.ts`
- any new shell tests added under `hbHomepage/shell/__tests__/`
- any dev-harness or preview surfaces used for shell proof
- `breakpointPolicy.ts`
- `slotComfortResolver.ts`
- `shellValidation.ts`
- any shell-only closure docs created as part of this work

## Implementation requirements

1. Add the missing test coverage needed to prove the new shell behavior.
2. Add harness scenarios or preview artifacts where they materially improve reviewability.
3. Include proof for constrained states, including reflow-oriented shell checks where applicable.
4. Include representative allowed and rejected persisted-policy examples.
5. Produce shell-only closure artifacts that summarize:
   - protected rules preserved
   - configurable rules bounded
   - entry-stack contract enforced
   - constrained-state behavior validated
6. Keep the closure package concrete and inspectable.

## Validation / proof of closure

Return all of the following:

- the new test suite additions
- any new harness or preview artifacts
- the shell-only closure summary or checklist
- a concise explanation of remaining shell-only gaps, if any
- confirmation that no out-of-scope module remediation was used as the answer

## Out-of-scope guardrails

- Do not treat compile success as closure.
- Do not rely on narrative summary without executable or inspectable proof.
- Do not widen scope into child-module redesign.
- Do not leave constrained-state or reflow-oriented proof for later.

## Active-context discipline

Do not re-read files that are already in active context or memory unless you need to confirm drift, dependencies, or uncertainty after making changes.

## No-deferral requirement

Do not leave this prompt in a “future wave,” “follow-up later,” or “optional if time permits” state.
If a shell-only issue must be solved now to close the shell correctly, solve it now and prove it now.
