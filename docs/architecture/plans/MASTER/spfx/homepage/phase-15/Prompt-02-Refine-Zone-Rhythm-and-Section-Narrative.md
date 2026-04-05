# Prompt 02 — Refine Zone Rhythm and Section Narrative

## Objective

Redesign the homepage's **zone rhythm and section narrative system** so the full page reads with stronger cadence, sequencing, and premium editorial control.

This prompt should address the layer between “individual webparts” and “full homepage composition.” The goal is to make the five homepage zones feel intentionally ordered, not merely stacked.

---

## First Instruction

**Do not re-read files that are still within your current context window or memory.** Re-read only when needed to verify drift, resolve uncertainty, or inspect files not already in active context.

---

## Start Here

Use the repo truth as modified by Prompt 01.

At minimum, inspect:

- `apps/hb-webparts/src/homepage/tokens.ts`
- `apps/hb-webparts/src/homepage/shared/HomepageSectionShell.tsx`
- `apps/hb-webparts/src/homepage/shared/HomepageTopBandPair.tsx`
- `apps/hb-webparts/src/homepage/shared/HomepageRailShell.tsx`
- any composition-safe shared primitives added in Prompt 01
- `apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx`

Also inspect any neighboring files required for a correct implementation.

---

## Design Intent

The target is a section/zone system that feels:

- premium
- composed
- editorial in rhythm
- clear in hierarchy
- restrained in tinting and material use
- more like a designed homepage framework and less like generic headings above boxes

---

## Required Tasks

### 1. Redesign section shell posture
Upgrade `HomepageSectionShell` and any related wrappers so section titles and subtitles feel authored and premium.

This may include:
- stronger title/subtitle hierarchy
- better spacing rhythm above and below section intros
- optional intro/action layout posture if justified by repo truth
- cleaner visual distinction between zone intro and contained webparts

### 2. Rationalize zone-level spacing cadence
Refine the zone spacing rules in `tokens.ts` and any local/shared composition utilities so:

- zone-to-zone rhythm is deliberate
- top-band spacing is appropriate to its importance
- utility-to-communications transition feels clean
- operational and discovery sections do not collapse into generic sameness

### 3. Refine zone differentiation
If current tint/background logic is too weak or too arbitrary, improve it now.

Do this with restraint. The outcome should feel premium, not decorative.

### 4. Improve the section narrative language in the composition layer
Where section labels, subtitles, or local composition copy patterns are too generic, improve them so the page reads like a real homepage narrative.

Do not fabricate production content systems. Keep this within the governed composition/reference layer.

---

## Hard Constraints

- do not turn section shells into shell chrome
- do not overuse tint blocks, borders, or ornamental devices
- do not create one-off logic that only works in the composition preview unless clearly isolated
- do not regress accessibility, token discipline, or reduced motion behavior

---

## Deliverables for This Prompt

By the end of this prompt, the section/zone framework should be materially stronger and ready for the main composition redesign.

---

## Acceptance Criteria

- section intros no longer feel generic
- zone spacing cadence is materially improved
- zone differentiation is more deliberate and premium
- the page-level narrative framework is stronger than current repo truth
- lint/build/type-check remain viable

---

## Completion Note

At the end, produce a concise completion note that states:

- which section/zone files were changed
- what spacing and narrative changes were made
- any tint/background changes and why
- any follow-ons intentionally deferred
