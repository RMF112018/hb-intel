# Prompt 04 — Rebuild First-Lane Governance and Vacancy Handling

## Objective

Strengthen the first shell lane into a **deterministic, vacancy-safe, visibly intentional composition zone** rather than a partially inferred promotion outcome.

## Why this matters

The first lane is the shell’s most important quality signal after the hero/utility region. If it resolves weakly, the homepage immediately feels underpowered.

The repo already contains first-lane logic. This prompt is not asking for first-lane logic to be invented from scratch. It is asking for that logic to become more explicit, more governable, and more closure-ready.

## Exact repo seams to inspect

- `apps/hb-webparts/src/webparts/hbHomepage/shell/firstLaneResolver.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/defaultPreset.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/occupantRegistry.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- any shell conformance helpers or diagnostics related to first-lane state

## Current implementation problem

First-lane promotion exists, but the closure bar needs to be stronger. The shell must not produce:
- awkward dead secondaries,
- weakly justified promotions,
- timid substitutions,
- or low-confidence vacancy handling.

## Required implementation outcome

Rebuild first-lane handling so it has:
1. explicit ranking logic,
2. explicit eligibility filtering,
3. explicit vacancy behavior,
4. explicit promotion reasoning,
5. and explicit diagnostics.

The shell should be able to explain:
- why the first lane is paired or stacked,
- why a given occupant won or lost promotion,
- and why any fallback occurred.

## Specific constraints / guardrails

- Do not move first-lane authority into child modules.
- Do not hardcode presentation-specific hacks that only fit the current occupant set.
- Keep the resolver generic enough to survive future occupant growth.
- Preserve protected pairing prohibitions where they exist.

## Proof of closure

Closure requires all of the following:
1. first-lane outcomes are explainable and deterministic;
2. vacancy handling is explicit rather than accidental;
3. weak or empty first-lane states are prevented by design;
4. diagnostics clearly expose first-lane decisions;
5. tests or assertions cover at least the main success path and at least one degraded/fallback path.


## Explicit prohibition on unrelated changes

Do not:
- rewrite unrelated hosted application internals,
- alter backend or list-seeding code,
- redesign child modules for cosmetic reasons outside shell-fit requirements,
- or drift into adjacent applications that are not required for this shell closure unit.

## Local code-agent operating instruction

Do **not** re-read files that are already in your active context unless you need to verify drift, dependencies, uncertainty, or the impact of your changes after implementation.

## Required output from the local code agent

Return:
1. files changed,
2. exact structural changes made,
3. why those changes satisfy this prompt,
4. any risks or follow-up observations,
5. and concrete proof of closure against the criteria below.
