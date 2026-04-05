# Prompt 06 — Communications Surfaces Redesign

## Objective

Rebuild Company Pulse, Leadership Message, and People & Culture so they read as premium editorial and human-centered modules instead of polite generic content cards.

## Scope

Primary targets:

- `apps/hb-webparts/src/webparts/companyPulse/*`
- `apps/hb-webparts/src/webparts/leadershipMessage/*`
- `apps/hb-webparts/src/webparts/peopleCulture/*`
- any relevant editorial or recognition shared primitives

## Current-State Problem to Solve

These surfaces are structurally competent but visually timid. They do not have enough editorial hierarchy, emotional warmth, or leadership authority.

## Hard Gates

- Do **not** reread files already in your active context or memory.
- Do **not** keep featured and secondary items too visually similar.
- Do **not** keep leadership presentation feeling like a standard note card.
- Do **not** keep people and culture feeling administrative rather than human.
- Do **not** keep Company Pulse reading like another generic content box.

## Required Outcomes

The redesigned communications zone should:

- have stronger editorial hierarchy
- better distinguish featured content from supporting items
- give leadership more authority and presence
- give people/culture more warmth and humanity
- feel unmistakably authored

## Implementation Requirements

1. Rebuild featured vs secondary composition patterns.
2. Improve headline, metadata, attribution, and CTA hierarchy.
3. Strengthen recognition and human-centered visual treatment.
4. Use imagery/media treatment more intentionally where supported.
5. Preserve accessibility and host realism.

## Validation

Show proof that:

- the communications zone is more editorially credible
- leadership has more gravitas
- people/culture has more warmth
- the rendered result is visibly less generic

## Output Format

Return:

1. summary of communications weaknesses removed
2. files changed
3. hierarchy strategy introduced
4. rendered-state proof

## Final Instruction

Do not soften this work.

The current homepage is not acceptable. The goal of this phase is to produce measurable visual improvement that can be seen immediately in the rendered experience, not merely explained in code review.
