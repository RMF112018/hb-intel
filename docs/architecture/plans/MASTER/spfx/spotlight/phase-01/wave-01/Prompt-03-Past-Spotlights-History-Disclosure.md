# Objective

Convert the current supporting rail into a governed past-spotlights/history disclosure pattern so compact and minimal modes do not show history by default.

# Governing repo authority

Use these as governing authority:
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/spfx-surfaces/benchmark/**`

# Inspect these files and seams first

- `packages/ui-kit/src/HbcProjectSpotlightSurface/index.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/project-spotlight-surface.module.css`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/HbcProjectSpotlightSurface.stories.tsx`
- `apps/hb-webparts/src/homepage/helpers/operationalAwarenessConfig.ts`

Do not re-read files that are still in your active context unless you need to confirm drift, dependencies, or uncertainty after changes.

# Current gap to close

The current supporting rail is always rendered when secondary items exist. In effect, past spotlights/history are always visible. That directly undermines hierarchy in tighter states.

# Required implementation outcome

Implement an explicit history disclosure model.

Minimum expectation:
- add a control comparable to `Show past spotlights`
- default history to collapsed in compact/minimal modes
- keep the history interaction explicit, keyboard-safe, and touch-safe
- preserve the premium rail styling when history is expanded
- do not let history compete with the featured spotlight in the compact/minimal entry state

Possible acceptable render patterns:
- inline accordion block
- expandable section below the featured essentials
- mobile bottom sheet for history if that is cleaner than inline expansion

Choose the cleanest governed pattern for the shared Spotlight surface.

# Additional implementation rules

- Keep the number ordering / editorial rail identity if it still fits the expanded state.
- Do not force the rail to remain visible just because it already exists.
- Respect the new mode contract.
- Keep the thin SPFx consumer unchanged unless a small model field addition is truly necessary.

# Proof of closure

Provide:
- the new history control behavior
- default history state by mode
- the final compact/minimal entry posture
- files changed
- why the result now protects primary hierarchy

# Constraints

- Do not drift into broader homepage-shell work.
- Do not leave the history rail always visible in compact/minimal modes.
- Do not make history hover-only.
