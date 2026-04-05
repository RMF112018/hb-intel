# Prompt 04 — Phase D People and Culture

## Objective

Redesign **People & Culture** so it feels clearly human, recognition-oriented, and warmer than the editorial and operational surfaces, while still remaining disciplined and premium.

Use the shared-kit primitives established in earlier Phase D prompts.

## Hard instruction

Do **not** re-read files already in your active context or memory unless needed to resolve uncertainty or confirm repo truth after edits.

## Target design intent

People & Culture should feel like:
- recognition and celebration
- employee-centered storytelling
- warmer and more human than news or operational content
- polished, not playful
- premium, not corporate-generic

## Required implementation outcomes

Implement repo-truth-grounded improvements such as:
- stronger person-first hierarchy
- better photo / avatar / portrait handling where supported
- improved distinction between featured recognition and secondary items
- clearer event-type semantics such as anniversary, promotion, welcome, recognition, milestone
- cleaner celebratory metadata treatment
- stronger CTA and browse/archive affordance
- more refined spacing and visual warmth without drifting into novelty UI

## Specific guidance

### Hierarchy
- person / team / recognition moment should lead
- supporting label and metadata should support, not dominate

### Surface treatment
- use a recognition-specific card family or shared-kit variant
- support warmth through composition, typography, and subtle tonal treatment rather than loud color

### Secondary items
- do not make secondary items feel like miniature generic cards
- make them scan quickly and feel intentionally designed

### Branding
- keep HB brand presence subtle and confident
- no gimmicky celebration patterns or loud animation

## Constraints

- Maintain accessibility and text clarity.
- Preserve responsive behavior.
- Do not over-index on imagery if data support is inconsistent.
- Keep the implementation durable for different recognition item types.

## Deliverables

At minimum:
- updated People & Culture implementation
- any necessary shared-kit follow-on refinements
- documentation/comments/tests/story fixtures as appropriate

## Validation requirements

Prove:
- People & Culture feels distinct from Company Pulse and Leadership Message
- the surface reads as human and recognition-oriented
- the hierarchy supports fast scanning
- celebratory cues are restrained and premium
- accessibility and reduced-motion behavior remain sound

## Risk Exposure

- Too little change will keep the module feeling generic.
- Too much warmth or color can cheapen the page.
- Poor handling of missing photos or varied content types can destabilize layout quality.

## Standards / Best Practices

- human-centered hierarchy
- premium recognition design
- graceful fallback behavior
- subtle visual warmth
- accessibility first
