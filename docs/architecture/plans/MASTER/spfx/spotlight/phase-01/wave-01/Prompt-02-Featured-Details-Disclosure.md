# Objective

Refactor the featured Spotlight presentation so the current featured story is split into:
- always-visible essentials
- explicitly revealed details

The current featured slot still exposes too much by default. That must be corrected.

# Governing repo authority

Use these as governing authority:
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/spfx-surfaces/benchmark/**`

# Inspect these files and seams first

- `packages/ui-kit/src/HbcProjectSpotlightSurface/index.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/project-spotlight-surface.module.css`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/HbcProjectSpotlightSurface.stories.tsx`

Do not re-read files that are still in your active context unless you need to confirm drift, dependencies, or uncertainty after changes.

# Current gap to close

The featured slot currently tries to show all of the following in the default experience:
- title
- headline
- summary
- milestone strip
- freshness row
- team strip
- CTA

That is too much for compact and minimal entry states.

# Required implementation outcome

Implement an explicit details-disclosure model for the featured Spotlight.

Minimum expectation:
- create a keyboard/touch-safe control comparable to `Show spotlight details`
- move lower-priority featured content behind that disclosure in compact/minimal modes
- ensure the details region can be expanded and collapsed cleanly
- preserve premium hierarchy when the details region is closed
- keep image and title recognition strong in the closed state

Strong recommended split:
## Always visible
- image
- title
- one compact signal if needed

## Details region
- headline
- summary
- milestones
- freshness
- team strip
- CTA (or most of these if a tighter arrangement is warranted)

# Additional implementation rules

- The control must be explicit and accessible.
- The details region must not depend on hover.
- The default open/closed state must follow the new layout-mode contract.
- If wide mode stays open by default, that is acceptable only if compact/minimal are closed by default.

# Proof of closure

Provide:
- the new details control behavior
- default details state by mode
- what content moved behind disclosure
- before/after explanation of how the default information burden was reduced
- files changed

# Constraints

- Do not rewrite unrelated data seams.
- Do not hide the title or image in the compact/minimal entry state.
- Do not leave details permanently open in compact/minimal modes.
