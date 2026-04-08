# Package Summary

This is the final code-agent prompt set for the HB Intel shared UI refactor.

## What changed from earlier prompt sets

This set explicitly assumes the repository now contains the new two-lane UI-system documentation and requires the code agent to use those files as active guidance rather than treating the older `docs/reference/ui-kit/**` material as the only default doctrine.

## Governing model

The code agent must work from this layered model:

- **Foundations** — tokens, themes, spacing, typography, radii, elevation, motion, iconography
- **Primitives** — layout, text, button, status, input, overlay, nav, small interaction building blocks
- **Surface families** — presentation lane surfaces and productive lane shared structures
- **Consumers** — homepage webparts, PWA views, SPFx surfaces, feature-specific assemblies

## Governing lanes

- **Presentation lane**
  - homepage hero
  - project spotlight
  - leadership/editorial surfaces
  - company pulse/news
  - people/culture storytelling
  - other premium branded web-content surfaces

- **Productive lane**
  - forms
  - tables
  - workflow UI
  - admin and operational product screens
  - application-heavy modules where efficiency and clarity matter more than editorial drama

## Non-negotiable outcomes

- shared foundations stay shared
- primitives become coherent and modernized
- presentation UI stops being disguised generic card UI
- productive UI remains disciplined and efficient
- compatibility is preserved through controlled migration
- new docs and architecture files are treated as live references
