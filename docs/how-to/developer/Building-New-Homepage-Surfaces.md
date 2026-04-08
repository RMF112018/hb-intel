# Building New Homepage Surfaces

## Purpose

Provide a practical implementation guide for building new premium homepage or editorial surfaces within the HB Intel two-lane UI system.

This document is for developers creating or extending:

- homepage webparts
- editorial modules
- project spotlights
- communications surfaces
- branded discovery or showcase sections

---

## Before you build

Before creating a new homepage surface, answer these questions:

1. Is this truly a **presentation-lane** surface?
2. Is there already a matching primitive or surface family in `@hbc/ui-kit`?
3. Is this a new reusable section type or only a local consumer assembly?
4. Can the desired result be achieved with shared foundations and primitives instead of one-off visual values?
5. Should the UI/UX conformance reviewer inspect the direction before implementation?

If the answers are unclear, stop and review ownership before coding.

---

## Step 1 — Classify the work correctly

Determine which level the work belongs to.

### Use a primitive when

- the need is a building block
- the pattern is smaller than a section
- multiple lanes or features can benefit from it

### Use or create a surface family when

- the pattern is a reusable section type
- the pattern has strategic homepage or editorial value
- the pattern should exist in more than one consumer over time

### Keep the work local when

- the assembly is feature-specific
- there is no durable reuse case
- the work is mostly data wiring and local composition

---

## Step 2 — Start from shared foundations

New homepage surfaces must use shared foundations for:

- color roles
- spacing
- typography
- radii
- elevation
- motion timing
- responsive behavior

### Do not start by

- inventing local brand colors
- hardcoding spacing systems
- defining isolated shadow recipes casually
- creating a second unofficial token system inside the webpart

---

## Step 3 — Decide whether this is a shared surface family

Ask:

- Is this a pattern we expect to repeat?
- Does it represent a recognizable type of homepage section?
- Would multiple consumers benefit from the same section grammar?

### Good candidates for shared surface ownership

- hero
- spotlight
- editorial feature rail
- premium command band
- recognition surface
- discovery showcase surface

If yes, prefer shared surface-family work in `@hbc/ui-kit`.

---

## Step 4 — Define the hierarchy first

Before styling, define:

- the focal point
- the scan order
- the primary content region
- the secondary content region
- the allowed number of emphasis points

### Rule

If the hierarchy is weak in wireframe form, styling will not save it.

---

## Step 5 — Use presentation-lane composition rules

For homepage/editorial work, design for:

- stronger scale
- stronger contrast
- deliberate whitespace
- clear asymmetry where useful
- image treatment with readability control when needed
- obvious branded presence
- limited visual clutter

### Avoid

- generic equal-weight cards
- dashboard-widget framing
- tiny typography surrounded by filler whitespace
- section designs that could be mistaken for admin tiles

---

## Step 6 — Keep business logic out of shared UI

If a homepage surface is shared, keep these local to the consumer where possible:

- data fetching
- feature business rules
- SharePoint list orchestration
- route-specific branching
- consumer-specific fallback behavior

The shared UI layer should own the reusable surface, not the feature's business logic.

---

## Step 7 — Make motion purposeful

Use motion to:

- stage hierarchy
- improve reveal quality
- support hover or focus response
- reinforce section emphasis

Do not use motion to add noise.

All homepage motion must still respect reduced-motion expectations.

---

## Step 8 — Verify on real surfaces

Homepage surfaces should not be approved based on code quality alone.

### Required proof when practical

- Storybook or local isolated rendering if available
- consumer rendering proof
- desktop and smaller-screen proof
- before/after screenshots for major redesigns
- proof that the surface does not collapse into generic productive-card UI

---

## Step 9 — Check for the common failure mode

The most common failure in homepage work is this:

> A premium content section gets implemented as a slightly nicer dashboard card.

If that is what happened, the surface is not done.

---

## Review checklist

Before considering a homepage surface complete, confirm:

- it belongs in the presentation lane,
- it uses shared foundations,
- its hierarchy is intentional,
- it does not visually read like routine workflow UI,
- ownership is correct,
- business logic remains local where appropriate,
- the UI is visually proven, not only technically correct.
