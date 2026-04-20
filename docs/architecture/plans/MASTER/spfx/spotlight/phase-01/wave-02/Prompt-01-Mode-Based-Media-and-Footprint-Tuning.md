# Objective

Tune the Spotlight media scale and vertical footprint by layout mode so the surface feels premium on large screens and intentionally selective on tighter screens.

# Governing repo authority

Use these as governing authority:
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/spfx-surfaces/benchmark/**`

# Inspect these files and seams first

- `packages/ui-kit/src/HbcProjectSpotlightSurface/project-spotlight-surface.module.css`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/index.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/HbcProjectSpotlightSurface.stories.tsx`

Do not re-read files that are still in your active context unless you need to confirm drift, dependencies, or uncertainty after changes.

# Current gap to close

The current image/media treatment is still governed mostly by breakpoint-only height changes. The result is:
- oversized vertical footprint in tight states
- occasional large-screen hero bloat
- insufficient connection between mode and media posture

# Required implementation outcome

Bind media scale to the new layout modes.

Minimum expectation:
- wide: strong editorial presence, but not bloated
- medium: balanced
- compact: recognizably image-first, but meaningfully reduced
- minimal: image still present, but subordinate to fast recognition and disclosure controls

Also tune:
- featured body spacing
- separator/masthead spacing where needed
- rail spacing in expanded history mode if necessary

# Proof of closure

Provide:
- media-height / media-posture rules by mode
- what changed in CSS/component logic
- why the new vertical footprint is more credible
- files changed

# Constraints

- Do not re-expand the default information burden.
- Do not regress the premium identity.
- Do not drift into other homepage modules.
