# Prompt 02 — Expand Shell Layout Grammar and Band Recipes

## Objective

Replace the shell’s overly limited active layout vocabulary with a **governed recipe-based composition model** that can deliver a premium modular homepage rather than a cautious stack with one paired lane.

## Why this matters

The current shell architecture is stronger than the rendered output suggests. The shell already owns layout and conformance. But the grammar it actively resolves is still too constrained to deliver the target state.

That is the core reason the homepage still looks too rigid, too narrow, and too editorially underpowered on larger surfaces.

## Exact repo seams to inspect

- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.module.css`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellTypes.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/defaultPreset.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/presetLibrary.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/slotComfortResolver.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellSchema.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellValidation.ts`
- any protected-decision or conformance helpers that govern allowable layouts

## Current implementation problem

The shell still effectively resolves into:
- stacked full-width bands, or
- one fixed paired lane.

That is too small a vocabulary for the target state. The homepage needs controlled variety:
- asymmetry where justified,
- mixed-density lanes,
- governed editorial composition,
- and stronger use of width without chaos.

## Required implementation outcome

Expand the shell into a recipe-based system with a limited but meaningful set of named band archetypes. Examples may include:
- feature pair,
- balanced 2-up editorial,
- asymmetric 2-up editorial,
- feature + utility strip,
- stacked full,
- stacked secondary compact strip,
- single-column constrained fallback.

You may refine those names, but the system must be:
- explicit,
- typed,
- validated,
- and bounded.

The shell must remain the layout governor.  
Hosted occupants must not self-place.

## Specific constraints / guardrails

- Do not create an unbounded free-form page builder.
- Do not replace shell governance with raw per-band CSS exceptions.
- Do not hide unsupported combinations behind silent fallback.
- Every recipe must have:
  - clear allowed slot roles,
  - clear width-state eligibility,
  - clear fallback behavior,
  - and validation protection.

## Proof of closure

Closure requires all of the following:
1. the shell can express more than the current stack + one paired pattern;
2. the new recipes are named, typed, and validated;
3. unsupported recipe/occupant combinations fail in a diagnosable way;
4. the default homepage preset uses the richer grammar in a way that materially improves composition;
5. rendered output shows stronger large-surface composition without compromising single-column fallback.


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
