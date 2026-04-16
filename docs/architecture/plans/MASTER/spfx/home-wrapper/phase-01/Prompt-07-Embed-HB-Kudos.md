# Prompt Title

Prompt 07 — Embed HB Kudos and Close the Hardest Public Runtime Integration

## Objective

Embed `HbKudos` into `hb-homepage` without regressing its workflow richness, safety logic, recognition quality, or host-safe behavior.

## Why this prompt exists now

`HbKudos` is the highest-risk public module in this initiative. It carries:
- richer workflow behavior
- people search / photo behavior
- celebrate and feed/article interactions
- host-safe and assistant-safe concerns
- a clearer product identity than the simpler editorial modules

The original package acknowledged this but left the hardest decision vague: whether `HbKudos` needs an explicit embedded-shell contract. That decision must now be made concretely and proven.

## Current repo truth

You must inspect and preserve the runtime responsibilities already held by `HbKudos`, including the parts that should remain internal to that product runtime versus the parts that should yield to shell composition.

## Intended future state

At completion of this prompt:

- `HbKudos` renders inside `hb-homepage`
- the shell owns outer composition
- `HbKudos` keeps its internal recognition product logic
- any required embedded-shell mode/contract is explicit and justified
- the resulting composed surface remains premium and host-safe

## Research-informed technical considerations

Honor all previously locked realities:

- reuse existing shared dependencies and product layers where possible
- preserve reduced-motion and accessibility behavior
- preserve host-safe layout behavior
- do not accidentally widen scope into governance companion responsibilities

## Required implementation scope

Implement the integration and create:

`docs/architecture/plans/MASTER/spfx/homepage/hb-homepage/phase-03/07-Embed-HB-Kudos.md`

The note must include:

1. exact files changed
2. whether an explicit embedded-shell contract or mode was added
3. what shell-owned responsibilities changed
4. what `HbKudos` responsibilities remain internal
5. what behavior was intentionally preserved unchanged
6. what behavior was intentionally adapted for shell composition
7. residual risks, if any, before mount/packaging integration

## Explicit non-scope

- Do not broaden into `HbKudosCompanion`
- Do not redesign recognition governance flows beyond what shell integration strictly requires
- Do not modify unrelated homepage modules
- Do not edit packaging except for compile continuity forced by this prompt

## Required verification / burden of proof

You must prove:

- `HbKudos` now renders through `hb-homepage`
- composition ownership is shell-owned
- product behavior quality remains intact
- host-safe behavior remains intact
- any embedded-mode decision is explicit and justified

## Required output artifact(s)

- `07-Embed-HB-Kudos.md`

## Completion standard

This prompt is complete only when `HbKudos` renders inside the shell without losing product credibility and without continuing to own the page-canvas composition.
