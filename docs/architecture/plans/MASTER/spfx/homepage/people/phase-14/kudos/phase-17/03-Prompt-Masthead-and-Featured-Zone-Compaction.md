# 03 — Prompt: Masthead and Featured-Zone Compaction

## Mission

Execute a **targeted vertical-compaction pass** on the HB Kudos public surface so the webpart performs correctly at desktop 100% zoom while preserving the existing premium concept.

## Scope

In scope:
- hero band
- hero copy
- hero CTA row
- featured recognition card
- featured avatar/ring
- featured eyebrow/title/recipient line/excerpt/meta/reaction area

Out of scope:
- flyout internals
- companion/admin
- workflow redesign

## Required outcome

At desktop 100% zoom, the opening viewport should show:
- the hero action row,
- the full featured card,
- and the beginning of recent recognition,

without the masthead feeling oversized or the card feeling weakened.

## Mandatory rules for the code agent

- Do not redesign the composition.
- Do not replace the current hero + frosted-card concept.
- Do not apply arbitrary global shrinkage.
- Implement in conformance with `@hbc/ui-kit` guidance.
- Use the correct homepage variant seam first. Do not create local override sprawl when the ui-kit variant is the right place.
- Address **all affected masthead/featured elements together**. Do not shrink one element and leave its neighbors visually out of proportion.

## Required implementation direction

1. Reduce hero vertical footprint in a measured way.
2. Tighten CTA row spacing and vertical sizing while keeping the buttons premium and accessible.
3. Reduce featured-card shell padding/gap enough to shorten the card footprint.
4. Slightly reduce avatar/ring scale while preserving the visual signature.
5. Tighten internal text spacing.
6. Clamp featured excerpt more aggressively for desktop 100% zoom and supported constrained desktop widths.
7. Preserve strong readability and contrast on the featured card.
8. Verify the featured card still feels authoritative after compaction.

## Specific instruction

When one masthead or featured element is changed, review and adjust all other directly related elements in that same visual zone so the result remains balanced:
- hero padding
- hero copy spacing
- CTA spacing/button sizing
- card shell padding
- avatar/ring scale
- eyebrow spacing
- title spacing
- recipient line spacing
- excerpt spacing and clamp behavior
- meta row spacing
- reaction pill sizing/placement

## Deliverables

- updated ui-kit homepage-variant implementation and/or tightly justified local seam adjustments
- implementation note explaining what changed by zone
- before/after screenshots showing the first viewport at desktop 100%
