# Prompt Title

Prompt 06 — Embed PeopleCulturePublic Without Breaking the Split Runtime Boundary

## Objective

Embed `PeopleCulturePublic` into `hb-homepage` while preserving the repo’s existing split People/Kudos model and tightening any shell-to-module contract needed for stable composed rendering.

## Why this prompt exists now

`PeopleCulturePublic` is more sensitive than the prior three modules because it sits beside an already-split recognition runtime and still carries public/legacy-bridge considerations. The original prompt mentioned that but did not force the code agent to explicitly preserve the split boundary or explain how the bridge changes.

## Current repo truth

You must respect that:

- `PeopleCulturePublic` is already the dedicated non-recognition public runtime
- recognition belongs to `HbKudos`
- the repo already contains explicit comments and seams reflecting that split
- the public surface may still bridge legacy configuration shapes at entry

## Intended future state

At completion of this prompt:

- `PeopleCulturePublic` renders through `hb-homepage`
- the People/Kudos split remains intact
- any shell-facing config or viewer-context contract is explicit and stable
- any bridge tightening is documented and justified

## Research-informed technical considerations

Honor host and accessibility rules:

- preserve authoring-safe behavior for missing/stale content
- preserve reduced-motion/focus discipline after shell embedding
- do not use `hb-homepage` as a reason to merge or blur public People and recognition concerns

## Required implementation scope

Implement the embedding work and create:

`docs/architecture/plans/MASTER/spfx/homepage/hb-homepage/phase-03/06-Embed-People-Culture-Public.md`

The note must include:

1. exact files changed
2. shell contract changes made
3. how viewer context is passed or normalized
4. whether legacy-bridge behavior was preserved, tightened, or reduced
5. proof that recognition responsibility still stays outside this module
6. exact remaining boundary before `HbKudos`

## Explicit non-scope

- Do not embed `HbKudos` yet
- Do not modify `HbKudosCompanion`
- Do not modify `PeopleCultureCompanion` except for compile continuity strictly forced by the embed
- Do not broaden into unrelated People/Culture redesign

## Required verification / burden of proof

You must prove:

- `PeopleCulturePublic` now renders through the shell
- the public People/Kudos responsibility split still holds
- any bridge or context change is explicit, not accidental
- no legacy merged seam is silently reintroduced

## Required output artifact(s)

- `06-Embed-People-Culture-Public.md`

## Completion standard

This prompt is complete only when `PeopleCulturePublic` is shell-rendered cleanly and the split runtime boundary remains explicit and protected.
