# Prompt 03 — Canonicalize Presets, Band Semantics, and Override Permissions

## Objective

Harden the preset library and preset-derived override model so shell presets are semantically clean, reviewable, and safe to mutate only within approved bounds.

## Why this issue exists in the current code

The shell already has four approved presets and real preset selection logic.
That is good progress.
But preset governance is still too informal.

Without stronger canonicalization, a future maintainer surface could inherit or amplify ambiguity around:
- semantic-role usage
- empty bands
- duplicate semantic meanings
- which preset-derived slot or band decisions are actually mutable

## Current repo-truth evidence

- `presetLibrary.ts` already defines `default-v2`, `editorial-focus-v1`, `operations-safety-v1`, and `compact-linear-v1`.
- `defaultPreset.ts` currently includes patterns that should be reviewed for canonical shell governance, including an empty newsroom band and repeated operational semantic use.
- `shellValidation.ts` validates preset structure and some pairing/prominence rules, but does not yet fully express canonical preset-governance intent.
- Existing tests validate that presets parse and pass basic structural checks, but do not yet prove stronger preset semantics or override permission boundaries.

## Required future state

The preset system should become a canonical shell-governance layer that makes all of the following explicit:

- what a valid shell preset means semantically
- whether empty bands are allowed, prohibited, or normalized away
- how semantic roles may be repeated or not repeated
- which preset-derived decisions may be safely mutated by a future maintainer
- which override attempts are prohibited because they would violate authored hierarchy or shell-entry rules

After this prompt, preset usage should be easier to review, safer to mutate, and harder to drift.

## Files / seams / symbols to inspect

- `apps/hb-webparts/src/webparts/hbHomepage/shell/defaultPreset.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/presetLibrary.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellTypes.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellSchema.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellValidation.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/__tests__/shellValidation.test.ts`

## Implementation requirements

1. Audit the approved presets for canonical shell semantics.
2. Decide and codify shell policy for:
   - empty bands
   - semantic-role reuse
   - canonical band ordering expectations
   - mutable versus immutable preset-derived choices
3. Extend validation and tests so non-canonical preset states are surfaced clearly.
4. Ensure override permissions are aligned with the persisted-policy boundary from Prompt 02.
5. Produce a shell-only outcome. This is not a child-module composition redesign prompt.

## Validation / proof of closure

Return all of the following:

- the canonicalized preset model
- any preset-library changes required
- validation and test updates proving canonical semantics
- a concise table or note showing which preset-derived decisions are mutable vs protected
- confirmation that the work stayed shell-only

## Out-of-scope guardrails

- Do not redesign which hosted surfaces should visually dominate; stay at the shell-governance layer.
- Do not convert this into module fit-and-finish work.
- Do not leave semantic ambiguities in place because they are currently tolerated.
- Do not allow future maintainer freedom to collapse authored hierarchy.

## Active-context discipline

Do not re-read files that are already in active context or memory unless you need to confirm drift, dependencies, or uncertainty after making changes.

## No-deferral requirement

Do not leave this prompt in a “future wave,” “follow-up later,” or “optional if time permits” state.
If a shell-only issue must be solved now to close the shell correctly, solve it now and prove it now.
