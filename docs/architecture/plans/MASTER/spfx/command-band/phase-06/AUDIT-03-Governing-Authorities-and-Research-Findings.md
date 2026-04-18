# 03 — Governing Authorities and Research Findings

## Governing repo authorities used in this package

### Primary live-repo authorities
- `docs/architecture/blueprint/current-state-map.md`
- `docs/reference/sharepoint-homepage-shell-boundaries.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

### Live implementation seams
- `apps/hb-webparts/src/webparts/hbHomepage/**`
- `apps/hb-webparts/src/webparts/priorityActionsRail/**`
- `apps/hb-webparts/src/homepage/data/**`
- `packages/ui-kit/src/HbcPriorityRail/**`

## Governing conclusions from repo doctrine

1. **Homepage work owns the page canvas, not SharePoint chrome.**
2. **Entry stack must deliver brand + action + value** with hero, top actions/utility band, and first shell lane visible on first view.
3. **Priority actions must be prioritized**, not a flat directory.
4. **Breakpoint governance is binding** at shell and application levels.
5. **Structural rebuild is preferred over decorative refinement** when the current outcome is weak.

## Research-backed implementation findings

### 1. Container queries should keep driving component-level adaptation
**Sources:**
- MDN: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries
- web.dev: https://web.dev/learn/css/container-queries
- Netflix case study: https://web.dev/case-studies/netflix-cq

**Finding:** Container queries are the right tool when a surface can be nested inside variable page sections. They reduce dependence on viewport assumptions and can reduce layout bugs when logic that does not need JavaScript is moved into CSS.

**Implication for this remediation:**
- keep shell- and slot-level decisions in code where they are truly semantic
- prefer CSS container-query styling for presentational shifts inside the flagship rail surface
- do not bloat the rail with new JS just to solve style changes the CSS layer can own

### 2. Anchored overflow should use robust collision-aware positioning when it becomes menu-like
**Sources:**
- Floating UI React docs: https://floating-ui.com/docs/react
- Floating UI getting started: https://floating-ui.com/docs/getting-started
- Floating UI `useFloating`: https://floating-ui.com/docs/usefloating

**Finding:** Floating UI exists precisely to keep floating panels anchored, collision-aware, and stable under scroll/resize.

**Implication for this remediation:**
- if the rail keeps a menu-like overflow mode, use the already-installed `@floating-ui/react` rather than inventing fragile positioning
- keep inline-disclosure for cases where inline expansion is truly the correct interaction
- do not let “menu” behavior remain visually indistinguishable from an inline accordion if the flagship experience benefits from a real anchored overlay

### 3. Native scroll behavior is preferable for overflow lists
**Source:**
- Radix Scroll Area docs: https://www.radix-ui.com/primitives/docs/components/scroll-area

**Finding:** Scroll Area keeps native scrolling behavior while allowing refined overflow presentation.

**Implication for this remediation:**
- if overflow content becomes tall, prefer Radix Scroll Area before inventing custom scroll mechanics
- preserve keyboard behavior and avoid transform-based fake scrolling

### 4. Touch targets must remain credible
**Source:**
- WCAG 2.2 Understanding SC 2.5.8: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html

**Finding:** Minimum target size is 24x24 CSS px, with spacing-based exceptions.

**Implication for this remediation:**
- current action rows already clear this baseline, but any compact flagship treatment must remain pointer-safe
- overflow trigger, close affordance, and compact rows must be checked explicitly, not assumed

### 5. Full-width SharePoint sections require explicit webpart support and extra testing
**Source:**
- Microsoft Learn: https://learn.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/basics/use-web-parts-full-width-column

**Finding:** Full-width column support requires explicit manifest enablement and additional testing because communication-site full-width columns can expand to very large widths.

**Implication for this remediation:**
- hero/webpart manifest posture remains a real closure concern
- any flagship surface claiming premium ultrawide behavior must be validated in the actual SharePoint host, not assumed from localhost rendering

## Existing dependencies already available in repo

The current repo already includes the key premium-stack dependencies needed for this remediation:
- `@floating-ui/react`
- `@radix-ui/react-scroll-area`
- `@radix-ui/react-tooltip`
- `@radix-ui/react-separator`
- `class-variance-authority`
- `clsx`
- `lucide-react`
- `motion`

## Package guidance derived from research

1. Prefer **existing installed dependencies** over new packages.
2. Use **explicit flagship surface context / varianting** so the homepage expression cannot regress into the generic card language used by other contexts.
3. Keep **container-aware CSS** as the first solution for visual adaptation.
4. Use **Floating UI only where anchored overlay behavior is truly needed**.
5. Treat **hosted SharePoint validation** as binding proof, especially for wide/full-width conditions.
