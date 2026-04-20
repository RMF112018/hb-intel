# Objective

Use normalized content completeness to make the Spotlight rendering smarter and less rigid.

# Governing repo authority

Use these as governing authority:
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

# Inspect these files and seams first

- `apps/hb-webparts/src/homepage/helpers/operationalAwarenessConfig.ts`
- `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlight.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/index.tsx`

Do not re-read files that are still in your active context unless you need to confirm drift, dependencies, or uncertainty after changes.

# Current gap to close

`contentCompleteness` already exists in normalization, but the surface does not meaningfully use it.

# Required implementation outcome

Promote completeness into the shared surface contract and use it to improve rendering decisions.

Examples of acceptable use:
- suppress optional headline when content is minimal
- suppress inline milestones when the item is too sparse
- choose a tighter featured body when the authored payload is light
- avoid awkward empty/filler-looking detail regions

# Proof of closure

Provide:
- how completeness now flows into the surface model
- which rendering choices depend on it
- files changed
- why the result is more resilient to uneven authored content

# Constraints

- Do not add unrelated business logic.
- Do not create a fragile maze of one-off exceptions.
- Keep the rule set legible.
