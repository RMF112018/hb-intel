# Wave 02 — UI Kit Extension and Newsroom Primitives

## Objective

Extend the minimum necessary premium primitives so `CompanyPulse` can inherit the same family-level quality as `ProjectPortfolioSpotlight` and the refined People & Culture direction, but with newsroom-appropriate tuning.

## Governing instruction

Treat the narrow People & Culture remediation prompt as a **visual and compositional benchmark** in the following areas:

- strong premium outer container
- clear dominant-versus-supporting hierarchy
- integrated CTA posture
- image/avatar fallback discipline
- higher-quality sparse-state behavior
- avoidance of flat separator-only layouts
- better zoomed-out legibility

Retune those traits for newsroom content.

## Emotional and stylistic tuning for CompanyPulse

Relative to the People & Culture direction, `CompanyPulse` should be:

- cooler and more editorial
- more blue-led / neutral-led than orange-led
- more current and information-forward
- more authoritative and newsroom-like
- more image-led where story quality warrants it
- more headline-driven than people-driven

It should still remain:

- premium
- branded
- visually distinct from stock SharePoint
- production-safe
- disciplined and not noisy

## Required primitive direction

Add or refine only the minimum necessary newsroom-specific primitives, such as:

- featured-story surface shell
- supporting-headline stack
- editorial metadata row
- category/shelf chip or eyebrow
- premium newsroom CTA grouping
- intentional media and fallback treatment
- compact utility rail or archive cue if needed

Do **not** build a broad new design system.

## Reference standard

Use `ProjectPortfolioSpotlight.tsx` as the base premium grammar.

Use the People & Culture remediation prompt as the proof that:
- hierarchy must be stronger
- supporting regions must be subordinate
- sparse states must still look premium
- the module must behave like one intentional surface instead of multiple weak boxes

## Deliverables

Produce:

1. any minimal `@hbc/ui-kit/homepage` additions or targeted local primitives required
2. clear notes describing how the primitives align with Spotlight-family quality while being tuned for newsroom/editorial content

## Validation

Visually confirm that the primitive layer would support:

- a lead article that feels materially more premium than the current digest
- supporting content that is clearly subordinate
- no fallback to generic white-card-grid behavior
