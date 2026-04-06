# Prompt 05 — Webpart Structural Rebuild: Editorial and Operational

## Objective

Rebuild the remaining homepage webparts under `apps/hb-webparts/src/webparts/` so they stop reading as polite content cards and instead become authored premium surfaces.

## Target Webparts

At minimum:

- `companyPulse`
- `leadershipMessage`
- `peopleCulture`
- `projectPortfolioSpotlight`
- `safetyFieldExcellence`

## Required Direction

### Editorial surfaces
These must feel authored, not administrative.

Rebuild:
- featured vs secondary hierarchy
- media and metadata handling
- CTA quality
- headline authority
- recognition warmth where relevant

### Operational surfaces
These must feel intelligent, active, and premium.

Rebuild:
- KPI or freshness treatment
- status visibility
- strong operational accents
- real information hierarchy
- not just badges inside cards

## Explicit Stack Usage

### `lucide-react`
Use for:
- editorial metadata accents
- safety and operational status cues
- freshness or insight framing

### `motion`
Use for:
- hover depth
- micro transitions
- subtle featured-surface choreography

### `class-variance-authority`
Use to create clear editorial and operational surface variants.

### `@radix-ui/react-separator`
Use for high-quality internal segmentation where it improves content hierarchy.

## Hard Prohibitions

Do not:
- keep all modules using the same card formula
- keep featured items only slightly different from secondary items
- let operational modules read like neutral content cards
- let people/culture modules feel administrative

## Acceptance Criteria

These webparts must look and behave like distinct premium product surfaces with strong role-specific visual logic.
