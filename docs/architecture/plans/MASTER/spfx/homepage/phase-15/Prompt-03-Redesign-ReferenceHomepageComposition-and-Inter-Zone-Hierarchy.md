# Prompt 03 — Redesign ReferenceHomepageComposition and Inter-Zone Hierarchy

## Objective

Redesign `ReferenceHomepageComposition.tsx` so it becomes a materially stronger governed homepage reference with clearer inter-zone hierarchy, sequencing, and page-level authorship.

This prompt is the center of Phase E. It must improve how the five homepage zones read together without violating the current architecture.

---

## First Instruction

**Do not re-read files that are still within your current context window or memory.** Re-read only when needed to verify drift, resolve uncertainty, or inspect files not already in active context.

---

## Start Here

Use the repo truth as modified by Prompts 01–02.

At minimum, inspect:

- `apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx`
- `apps/hb-webparts/src/homepage/tokens.ts`
- `apps/hb-webparts/src/homepage/shared/HomepageSectionShell.tsx`
- `apps/hb-webparts/src/homepage/shared/HomepageTopBandPair.tsx`
- `apps/hb-webparts/src/homepage/shared/HomepageRailShell.tsx`
- any additional composition wrappers touched in earlier prompts

Also inspect any neighboring files needed for a correct implementation.

---

## Design Intent

The target is a reference composition that feels:

- leadership-ready
- premium
- coherent
- intentional
- editorial in page flow
- clearly sequenced from top band through discovery

It should no longer feel like a linear stack of zones with broadly similar treatment.

---

## Required Tasks

### 1. Rework inter-zone hierarchy
Adjust the order presentation, spacing, and section posture in `ReferenceHomepageComposition` so each zone has the correct relative weight.

The top band should feel like the opening signature experience.

Utility should feel immediately actionable.

Communications should feel curated and intentional.

Operational should feel grounded and signal-rich.

Discovery should feel like a concluding navigation/help layer rather than just another card region.

### 2. Improve grouping and transitions
Where zone transitions currently feel abrupt, generic, or repetitive, improve them.

This may include:
- cleaner use of wrappers
- better spacing transitions
- better local composition annotations
- better handling of groupings inside zones

### 3. Reduce stacked-module fatigue
If the current composition causes too much repetition of:
- identical section wrappers
- identical spacing patterns
- same-feeling tints
- same-feeling grouping logic

then correct that now.

### 4. Preserve architecture truth
The redesigned composition must still clearly remain a governed composition reference, not a fake production shell takeover.

Any comments or in-file documentation should remain accurate.

---

## Hard Constraints

- do not collapse the architecture into a single fake production app
- do not create unsupported SharePoint host assumptions
- do not over-engineer the reference component into an entirely separate design system
- do not regress the current sample-data demonstration value of the file
- do not break lint/build/type-check viability

---

## Deliverables for This Prompt

By the end of this prompt, `ReferenceHomepageComposition.tsx` should be materially stronger and clearly more premium than current repo truth.

---

## Acceptance Criteria

- the reference composition no longer reads like a basic stack of sections
- zone-to-zone hierarchy is materially stronger
- the top band feels like the visual opening of the homepage
- utility, communications, operational, and discovery each have clearer relative posture
- repo truth remains honest about the reference-vs-production distinction

---

## Completion Note

At the end, produce a concise completion note that states:

- which composition files were materially changed
- how inter-zone hierarchy was improved
- what repetitive composition patterns were reduced or removed
- any follow-ons intentionally deferred
