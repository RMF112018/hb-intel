# Prompt 06 — Phase D Safety and Field Excellence

## Objective

Redesign **Safety & Field Excellence** so it reads as a signal-driven field/safety surface with stronger urgency, freshness, and recognition differentiation than the current generic operational-card posture.

Use the shared-kit primitives and conventions established earlier in Phase D.

## Hard instruction

Do **not** re-read files already in your active context or memory unless needed to resolve uncertainty or verify repo truth after edits.

## Target design intent

Safety & Field Excellence should feel like:
- field-relevant
- signal-driven
- trustworthy
- crisp and current
- clearly distinct from Project / Portfolio Spotlight
- capable of handling both excellence/recognition items and cautionary/awareness items

## Required implementation outcomes

Implement repo-truth-grounded improvements such as:
- stronger signal hierarchy
- clearer freshness/timestamp semantics
- better differentiation between safety recognition and warning/awareness content
- stronger indicator / severity / type presentation where appropriate
- better supporting metadata and CTA structure
- more intentional field/safety surface treatment

## Specific guidance

### Hierarchy
- signal type and importance should read quickly
- title/event should be clear
- freshness and supporting context should be structured
- CTA should feel purposeful

### Surface family
- use a dedicated safety/signal family or variant, not the same operational spotlight shell with minor tweaks
- allow recognition and warning modes to differ appropriately without feeling like different products

### Status language
- badges, indicators, or severity chips should support clarity
- avoid using badges as the only distinguishing feature

### Differentiation
- it should not look like Project / Portfolio Spotlight with safety labels swapped in
- it should not look like a generic announcement card

## Constraints

- Keep the tone serious and premium.
- Do not overuse warning colors or high-alert semantics when not warranted.
- Preserve accessibility, contrast, and keyboard behavior.
- Support content variability gracefully.

## Deliverables

At minimum:
- updated Safety & Field Excellence implementation
- any required shared-kit refinements
- docs/comments/tests/story fixtures as appropriate

## Validation requirements

Prove:
- the surface reads as safety/field signal content at first glance
- recognition vs warning/awareness modes are differentiated appropriately
- hierarchy and metadata are stronger
- the surface remains cohesive with the homepage system
- accessibility and reduced-motion expectations are satisfied

## Risk Exposure

- Too much warning styling can make the homepage feel alarmist.
- Too little differentiation can keep the surface generic.
- Reusing project-operational grammar too closely will reduce recognition value.

## Standards / Best Practices

- signal-first design
- restrained urgency
- structured freshness metadata
- accessibility preserved
- premium field-oriented visual grammar
