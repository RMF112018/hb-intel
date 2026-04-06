# Project Spotlight Webpart — Phase Implementation Summary

## Objective

Implement Project Spotlight as a premium, image-led homepage storytelling surface aligned with the Signature Hero and grounded in live repo truth.

## Final Product Definition

Project Spotlight should resolve to:

- one dominant featured project
- a lighter supporting rail of 3–5 projects
- concise editorial text
- restrained metadata
- a project team avatar strip inside the featured surface
- a lightweight detail layer for team expansion
- a desktop-first layout that adapts cleanly to tablet and mobile

## Phase Sequence

### Phase 1 — Repo-Truth Baseline and Ownership Map
Freeze the component anatomy, ownership boundaries, and reuse strategy before implementation accelerates.

### Phase 2 — Featured Spotlight Anatomy and Desktop Composition
Build the dominant featured spotlight shell first and prove the hierarchy.

### Phase 3 — Supporting Rail and Hierarchy Enforcement
Add secondary supporting spotlights without diluting the featured surface.

### Phase 4 — Signature Hero Alignment Pass
Tune spacing, typography, image treatment, and surface behavior so Spotlight belongs to the same premium homepage family as the hero.

### Phase 5 — Project Team Strip and Detail Layer
Add the human layer as a supporting interaction, not as a competing module.

### Phase 6 — Responsive Adaptation and Device Behavior
Preserve the hierarchy across desktop, tablet, and mobile with the right interaction fallbacks.

### Phase 7 — Ranking, Freshness, and Authoring Safety
Refine editorial control, selection logic, fallbacks, and authoring reliability after the surface system is already strong.

### Phase 8 — Hardening, Accessibility, and Documentation
Finish the work with accessibility, performance, validation, and documentation closure.

## Ownership Model

### Keep local to `src/webparts/projectPortfolioSpotlight/**`
- featured vs supporting orchestration
- Spotlight-specific property mapping
- Spotlight-specific ranking orchestration
- Spotlight-specific composition wrappers
- Spotlight-specific interaction choreography

### Keep in `src/homepage/shared/**` first
- homepage-local editorial media wrappers
- homepage-local metadata presentation helpers
- homepage-local avatar teaser wrappers
- homepage-local supporting rail tile shells
- homepage-local visual utilities that may later prove reusable

### Promote to `@hbc/ui-kit/homepage` only when reuse is proven
- generic homepage-safe media shell primitives
- generic homepage-safe avatar strip primitives
- generic homepage-safe editorial tile shells
- generic homepage-safe anchored detail wrappers

## Hard Gates

The implementation is not complete unless all of the following are true:

- Spotlight reads as a premium editorial surface, not a dashboard card grid
- the featured project is clearly dominant on first scan
- the supporting rail is visually subordinate
- the Project Team strip supports the card without cluttering it
- interaction remains restrained
- tablet and mobile preserve the featured-first hierarchy
- ranking and authoring logic are deterministic and safe
- accessibility and reduced-motion behavior are validated
- documentation reflects the final ownership and implementation boundaries

## Standards / Best Practices

- hierarchy before density
- image before metadata
- composition before automation
- local-first ownership before premature abstraction
- accessibility and SharePoint runtime realism throughout
