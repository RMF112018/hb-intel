# Prompt 04 — First-Lane Content-State Contract

## Objective

Create a shell-safe, inspectable contract that lets early-lane homepage occupants communicate whether they are currently:

- strong / meaningful
- empty / no-data
- invalid / unavailable
- low-signal but still renderable

This prompt defines the **contract and integration seam only**. It does not yet implement the promotion / demotion resolver.

## Why this prompt exists now

The attached package was correct that the shell lacks non-empty-first behavior, but it bundled two separate problems together:

1. how the shell learns a candidate’s current state
2. how the shell uses that state to select or demote candidates

This prompt solves problem 1 cleanly so problem 2 can be implemented without guesswork.

## Repo-truth findings to respect

- `HbHomepageShell` already owns placement, band layout, and diagnostics.
- `slotComfortResolver` currently reasons about fit, not content quality.
- `occupantRegistry` currently models static eligibility, not live content-state quality.
- zone wrappers already provide a natural seam for shell-safe adaptation without mutating child modules directly.

## Governing authorities

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- current shell ownership boundary in `hbHomepageContract.ts` and shell-adjacent docs/comments
- existing shell diagnostic and conformance surfaces

## External best-practice guidance to apply

- Keep the contract inspectable and explainable.
- Distinguish layout/fit state from content/value state.
- Avoid letting child modules reach across boundaries and directly reorder the shell.

## Exact files / seams to inspect first

- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageContract.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/occupantRegistry.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellTypes.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/slotComfortResolver.ts`
- zone wrappers under `apps/hb-webparts/src/webparts/hbHomepage/zones/`
- any existing fallback / diagnostics surface used by the shell

Do **not** re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Current problem state

The shell can currently reason about:
- eligibility
- pairing
- prominence
- comfort width
- stacking

It does **not** appear to have a first-class way to reason about:
- whether the candidate is actually carrying strong current value
- whether the candidate is effectively empty
- whether the candidate is technically renderable but too low-signal for premium early placement

That leaves the shell blind to an important part of real flagship composition.

## Required future state

- Each shell-relevant early-lane occupant can expose a shell-safe content-state signal.
- The signal is narrow, typed, explainable, and inspectable.
- The signal does not require the shell to reach into module internals.
- The signal clearly separates:
  - content state
  - layout comfort
  - static eligibility
- The signal is ready for a later resolver to consume.

## Implementation requirements

1. **Define a typed content-state contract.**
   - Keep the vocabulary small and meaningful.
   - Include enough metadata for diagnostics and later resolver decisions.

2. **Choose the right reporting seam.**
   - likely zone-level or shell-adjacent wrapper level
   - not deep child-module internals
   - not a fragile DOM-inspection hack

3. **Preserve shell boundaries.**
   - child modules may expose state
   - they must not directly reorder themselves

4. **Make the state inspectable.**
   - diagnostics, dev/harness attributes, or structured reports should make it obvious what state a candidate is in

5. **Avoid overfitting to one module.**
   - the contract must work for early-lane candidates generally, even if rollout begins with the current first-lane candidates

## Definition of done

This prompt is done only when:

- a typed content-state contract exists
- at least the relevant early-lane candidates can surface that state through a shell-safe seam
- the shell can inspect that state without violating ownership boundaries
- the contract is clear enough for the next prompt to consume in a promotion / demotion resolver

## Proof of closure required in the final response

Provide all of the following:

- the new contract/type definitions
- where state is reported from
- where the shell can read it
- exact files changed
- one or more concrete examples of reported candidate state
- any diagnostic or test additions

## Constraints

- Do not implement final promotion / demotion logic in this prompt.
- Do not let child modules directly mutate shell ordering.
- Do not blur content-state and layout-comfort concepts into one vague enum.
- Do not create a brittle implicit contract that only exists in comments.
