# Research-Informed Architecture and Design Considerations

## Purpose

This file translates modern frontend and responsive-design guidance into decisions relevant to the HB Homepage hero unification work.

## 1. Container-aware behavior should outrank viewport-only behavior for hosted entry surfaces

Modern guidance strongly favors container-aware adaptation where components can be hosted in varying page canvases or layout contexts.

That matters here because the HB Homepage is rendered inside a SharePoint-hosted environment where:
- total viewport width is not the only meaningful width,
- inline insets reduce usable width,
- and short-height conditions can materially change first-screen composition.

### Practical implication for HB Homepage
The hero should not continue to behave primarily as a viewport-keyed masthead. It should consume wrapper-owned entry-state truth and, where helpful, use the wrapper’s container query seam for layout and density changes.

## 2. Entry-stage systems should be governed as one first-screen experience

Modern portal and editorial-top-band patterns perform best when:
- the masthead,
- utility/actions,
- and immediate below-the-fold continuation

are treated as one entry composition rather than a stack of independently assertive surfaces.

### Practical implication for HB Homepage
The hero, launcher, and first shell lane should be budgeted as one system:
- hero height cannot expand casually,
- actions must stay usable without becoming a directory,
- and the first shell lane must still begin on first view.

## 3. Constrained-width and short-height behavior should de-escalate early

Best-practice responsive behavior for branded mastheads is not just “shrink everything.” It is usually:
- reduce visual dominance earlier,
- simplify composition earlier,
- and remove nonessential visual competition earlier.

### Practical implication for HB Homepage
The hero should adopt explicit modes, not just smaller CSS values:
- wide two-zone premium masthead,
- compressed laptop masthead,
- guided single-column / reduced-density portrait mode,
- compact short-height mode.

## 4. Decorative value should not dominate mobile or constrained layouts

Modern UX guidance is clear that decorative or brand-supporting media should not crowd primary content on small screens.

### Practical implication for HB Homepage
On constrained widths/heights, the hero’s brand posture should remain recognizable but more economical:
- smaller logo budget,
- earlier stack or overlap reduction,
- less empty decorative spread,
- more immediate continuation into actions and the first shell lane.

## 5. Reflow discipline matters

WCAG reflow expectations are a useful minimum constraint:
- avoid ordinary two-dimensional scrolling,
- avoid layouts that require horizontal scrolling for normal consumption,
- preserve a clean single reading path at narrow widths.

### Practical implication for HB Homepage
The unified entry stack must prove:
- no ordinary horizontal overflow,
- no logo/text collision,
- no launcher row forcing page-canvas overflow,
- and preserved readability at the required mobile widths.

## 6. Prefer small seam extensions over heavy new dependencies

The repo already contains:
- a containerized entry stack,
- wrapper-owned measurement truth,
- entry-state policy,
- shared snapshot helpers.

### Practical implication for HB Homepage
The strongest implementation likely extends current seams instead of introducing a new responsive framework or new state library.

## 7. Use diagnostics as architecture reinforcement, not just debug clutter

Responsive cutovers become much easier to validate when the runtime makes its state inspectable.

### Practical implication for HB Homepage
The unified hero path should expose consistent runtime markers for:
- entry-state,
- short-height posture,
- hero mode,
- wrapper region order,
- and duplicate-hero detection where relevant.

## Recommended design and engineering posture

1. Drive the hero from shared entry-state truth.
2. Use explicit hero layout modes instead of passive scale-down.
3. Preserve article-mode reuse separately from flagship composition truth.
4. Keep wrapper and shell responsibilities sharply bounded.
5. Add proof that survives hosted deployment, not just local preview.
