# Project Portfolio Spotlight Audit Package

This package is the repo-truth audit output for the `Project Portfolio Spotlight` homepage surface.

## Objective
Determine what the current Spotlight implementation requires in order to become:
- premium
- doctrine-compliant
- compact under constrained usable space
- progressively disclosive
- explicitly mode-governed instead of merely compressed

## Package contents
- `00-Project-Portfolio-Spotlight-Audit-Summary.md`
- `01-Current-Spotlight-Implementation-Map.md`
- `02-Doctrine-and-Benchmark-Assessment.md`
- `03-Spotlight-Gap-Register.md`
- `04-Prioritized-Spotlight-Enhancement-Plan.md`
- `05-Recommended-Implementation-Waves.md`

## Validation note

This audit package has been validated against current repo truth on 2026-04-20.
Primary claims were re-checked against:
- `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlight.tsx`
- `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/README.md`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/index.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/project-spotlight-surface.module.css`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/HbcProjectSpotlightSurface.stories.tsx`
- `apps/hb-webparts/src/homepage/helpers/operationalAwarenessConfig.ts`

Findings are directionally correct. Precision refinements applied in this pass:
- Gap 10 reframed from "monolithic" to "missing mode-aware seam" — the file already
  factors `Masthead`, `FeaturedMedia`, `FeaturedSlot`, `MilestoneStrip`, `TeamStrip`,
  `RailTile`, `SupportingRail` as discrete sub-components; the real defect is the
  absence of a mode resolver + visibility matrix connecting them.
- Gap 04 reframed from "past spotlight history" to "mode-suppressible secondary
  exploration" — the rail is labeled `More projects` / `Additional projects` and
  carries the `secondary[]` partition (with stale-demoted items). "Past spotlights"
  remains one valid disclosure framing but is not the rail's canonical role.
- Language around media scale softened — min-heights are 260 / 340 / 380px, which
  is moderate, not "bloated"; the defect is that media height is not mode-governed.
- README overstatement citation made explicit:
  `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/README.md:42` uses the
  phrase "tier-aware layout" for behavior that does not yet exist.

## Key conclusion
The current Spotlight has a good architectural base, but it still lacks the behavior contract required by the target state:
- no explicit layout modes
- no details disclosure
- no history disclosure
- no true practical-usable-space model
- compact states still compress rather than simplify
