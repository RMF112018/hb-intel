# Prompt 03 — Top-Band Hard Reset

## Objective

Rebuild the homepage top band so the Welcome Header and Hero Banner work together as a single authored opening sequence. This phase must create a clear signature moment for HB Central.

## Scope

Primary targets:

- `apps/hb-webparts/src/webparts/personalizedWelcomeHeader/*`
- `apps/hb-webparts/src/webparts/hbHeroBanner/*`
- top-band shared composition files
- any related `@hbc/ui-kit/homepage` primitives introduced in prior work

## Current-State Problem to Solve

The current hero has scale but not authority. The current welcome card has the right concept but looks like an ordinary information card. Together they do not create a premium first impression.

## Hard Gates

- Do **not** reread files already in your active context or memory.
- Do **not** keep the current top-band visual hierarchy.
- Do **not** leave the hero as a large empty gradient box with a button.
- Do **not** leave the welcome card as a generic bordered card with a stripe.
- Do **not** create two unrelated surfaces that merely sit next to each other.

## Required Outcomes

The redesigned top band should:

- feel like one deliberate experience
- make the greeting memorable
- make the hero feel authored and premium
- create a strong opening hierarchy before the rest of the homepage begins
- reflect HB brand posture with more confidence

## Implementation Requirements

1. Re-evaluate the welcome and hero composition as one unit.
2. Strengthen greeting typography, context treatment, and signature-level personalization.
3. Rebuild the hero composition with stronger hierarchy, structure, and CTA posture.
4. Use asymmetry, layering, or stronger content framing where appropriate.
5. Preserve accessibility, focus, and reduced-motion support.
6. Ensure the result still behaves within realistic SharePoint page-canvas constraints.

## Validation

Show proof that:

- the top band now creates a convincing signature moment
- hero and welcome work together rather than competing or feeling disconnected
- the rendered result is materially stronger than the prior state
- no regressions were introduced in config normalization or authoring fallbacks

## Output Format

Return:

1. summary of what made the old top band weak
2. files changed
3. new composition strategy
4. rendered-state proof or screenshots

## Final Instruction

Do not soften this work.

The current homepage is not acceptable. The goal of this phase is to produce measurable visual improvement that can be seen immediately in the rendered experience, not merely explained in code review.
