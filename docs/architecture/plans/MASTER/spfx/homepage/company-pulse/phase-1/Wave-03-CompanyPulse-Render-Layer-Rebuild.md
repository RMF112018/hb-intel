# Wave 03 — CompanyPulse Render-Layer Rebuild

## Objective

Rebuild `CompanyPulse.tsx` into a premium newsroom surface using the refined UI benchmark logic from the People & Culture remediation prompt, with content-appropriate tuning.

## Critical render rule

The module must read as **one premium newsroom surface**, not multiple weak regions and not a flat digest.

## Required hierarchy

Use this compositional hierarchy:

- **Primary focal zone:** lead article / featured story
- **Secondary supporting zone:** supporting stories / headline stack
- **Tertiary supporting zone:** quick updates, category cues, archive cue, or other subordinate newsroom utility

This hierarchy should be as visually decisive as the one demanded by the People & Culture prompt, but tuned to editorial rather than recognition content.

## Required UI treatment

### 1. Root surface
Refactor the root `CompanyPulse` container so it inherits the same premium family feel as `ProjectPortfolioSpotlight`:

- stronger root card/container
- visible but controlled depth
- deliberate internal rhythm
- better section contrast
- stronger typographic hierarchy
- more credible media treatment
- no weak flat separators as the dominant language

### 2. Lead story
The featured story must behave like a real lead article:

- dominant visual treatment
- stronger headline rhythm
- purposeful metadata
- integrated CTA posture
- media-first when image quality exists
- intentional fallback if media does not exist

### 3. Supporting stories
Supporting stories should behave like Spotlight’s supporting rail and like the subordinate regions called for in the People & Culture prompt:

- clearly subordinate
- denser
- scannable
- polished
- not equal-weight cards
- not visually louder than the lead story

### 4. CTA posture
Place newsroom CTAs intentionally. Examples may include:

- `Read story`
- `View all news`
- category/archive cues where appropriate

Do not leave placeholder CTA placement or floating empty-space actions.

### 5. Sparse-state resilience
Apply the People & Culture sparse-state lesson directly.

The module must still look premium when the valid content state is only:

- 1 lead story
- 1 supporting story
- 0 media
- limited metadata

Do not allow blank-space failure or weak floating labels.

## Manifest / seed requirement

Adjust the `CompanyPulse` manifest seed data only enough to demonstrate the intended premium result under local/dev/demo conditions.

Include just enough realistic content to prove:

- one meaningful lead story
- one or two meaningful supporting stories
- representative metadata and CTA behavior

## Deliverables

Produce:

1. rebuilt `CompanyPulse.tsx`
2. any necessary manifest seed adjustments
3. concise notes describing how the UI now aligns with the People & Culture benchmark logic while being properly tuned for editorial content

## Validation

You are not done until you can show that:

- the module clearly belongs to the same premium family as Spotlight
- it uses the People & Culture prompt’s hierarchy discipline
- it is visually tuned for newsroom content instead of celebration content
