# Objective

Refactor the shared Spotlight surface into cleaner seams that support the new mode/disclosure contract without becoming brittle or monolithic.

This prompt is about maintainability and clean closure after the behavioral redesign work.

# Governing repo authority

Use these as governing authority:
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

# Inspect these files and seams first

- `packages/ui-kit/src/HbcProjectSpotlightSurface/index.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/project-spotlight-surface.module.css`
- any new helpers/hooks/types you introduced during the prior Spotlight prompts

Do not re-read files that are still in your active context unless you need to confirm drift, dependencies, or uncertainty after changes.

# Current gap to close

The current shared Spotlight surface is good enough for the old implementation, but the redesigned behavior now needs cleaner seams for:
- layout-mode ownership
- details disclosure
- history disclosure
- media posture
- content visibility rules

# Required implementation outcome

Refactor the shared surface so those responsibilities are easy to understand and maintain.

Recommended seam targets:
- mode resolver / visibility rules helper
- featured essentials block
- featured details region
- history disclosure block
- mode-aware media contract

You do not need to force a specific file count, but the result must be cleaner than a single oversized render tree with scattered conditions.

# Proof of closure

Provide:
- the new seam breakdown
- why it is easier to maintain
- which responsibilities live where now
- files changed

# Constraints

- Do not over-engineer with unnecessary abstraction.
- Do not move business/data logic out of its correct local seams.
- Do not change unrelated homepage modules.
