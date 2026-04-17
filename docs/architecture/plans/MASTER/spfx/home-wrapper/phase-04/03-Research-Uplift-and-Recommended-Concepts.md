# 03 — Research Uplift and Recommended Concepts

## Research posture used

Research was used to improve the package in ways repo truth alone could not:

- container-aware shell and action behavior
- practical usable-space logic rather than raw-device optimism
- overflow and responsive action patterns
- reflow and touch usability requirements
- current device-spec references used by the repo’s breakpoint spec

## High-value external findings

### 1. Container queries are the right technical posture for nested shells
MDN’s guidance is directly aligned with the shell direction already present in repo truth: container queries let components adapt to the size of their containing block rather than only to the viewport.

**Why this matters here**
- The shell is nested inside SharePoint-controlled page chrome.
- Early-lane decisions should be based on actual slot width, not just viewport width.
- This supports the repo doctrine that shells should be container-aware and that row sharing must depend on actual available space.

**Implication for the package**
- Keep container-aware shell logic as a first-class implementation requirement.
- Extend container-aware thinking to the entry-stack policy and action overflow behavior where practical.
- Prefer shared policy thresholds keyed to practical shell width, not raw device size.

### 2. Responsive action overflow should be governed relative to the container, not assumed from viewport size alone
PatternFly’s responsive-actions and overflow-menu guidance is useful here even though the library itself need not be adopted. The important idea is the pattern:
- keep primary actions visible where space permits
- collapse less-primary actions into overflow
- allow breakpoints to be tied to the container, not just the viewport

**Why this matters here**
- The repo breakpoint spec already requires visible-action budgets and governed overflow.
- The production top-actions surface is still independently mounted.
- A shell-facing entry policy needs container-relative action budgets, not just generic “mobile vs desktop” logic.

**Implication for the package**
- Do not add PatternFly as a dependency.
- Borrow the pattern: persistent vs collapsible actions, governed overflow, container-relative breakpoints.

### 3. Reflow safety is not optional
W3C’s understanding doc for WCAG 2.1 SC 1.4.10 states that content should work without two-dimensional scrolling at 320 CSS px width or 256 CSS px height, except where two-dimensional layout is essential.

**Why this matters here**
- The shell-entry spec already bans awkward two-dimensional scrolling.
- Short-height phone-landscape states need stronger closure proof than the current package requires.
- First-screen closure should include reflow and zoom testing, not just nominal breakpoint snapshots.

**Implication for the package**
- Closure proof must include constrained-width and constrained-height states.
- “Technically renders” is not enough.
- Reflow-safe entry states must be part of the harness and automated-test plan.

### 4. Touch targets and dense actions need explicit discipline on smaller screens
W3C guidance on target size emphasizes that small touch targets become harder to activate on touch devices and recommends at least 44×44 CSS pixels for easier activation.

**Why this matters here**
- The shell-entry spec pushes high-priority actions into smaller handheld entry states.
- A shell that reduces action count but still creates overly dense controls has not solved the real usability problem.

**Implication for the package**
- Closure proof should verify action density and tap safety, not just visible count.
- The entry policy prompt should require touch-safe budgets for prioritized actions.

### 5. Modern responsive layout guidance reinforces hierarchy reduction on smaller widths
Material’s responsive layout guidance explicitly supports reducing the number of simultaneously visible content hierarchies below smaller breakpoints and allowing richer parallel hierarchy only at wider widths.

**Why this matters here**
- The repo shell-entry spec already defaults tablet portrait and phones to single-column first-lane behavior.
- This external guidance reinforces that single-column fallback is a strong adaptive outcome, not a failure mode.

**Implication for the package**
- The new prompts should treat single-column fallback as an authored positive state.
- They should reject “keep pairing if it still technically fits” logic.

### 6. Current Apple device specs support the device references used in the repo breakpoint spec
Current Apple technical-spec pages support the key resolution references used in the repo shell-entry spec for:
- 14-inch MacBook Pro
- 11-inch and 13-inch iPad Pro
- iPhone 17 Pro
- iPhone 17 Pro Max

**Why this matters here**
- The repo breakpoint spec uses these devices as reference anchors.
- The important rule still remains practical shell width, not raw device resolution.

**Implication for the package**
- Keep the repo’s practical usable-space framing.
- Do not turn device-spec references into rigid viewport assumptions.

## Recommended concept uplift for the shell package

### Concept A — Shared entry-stack policy contract
Add a typed shell-facing policy seam that expresses:
- hero height budgets by entry class
- visible primary action budgets by entry class
- overflow posture by entry class
- first-lane first-view requirement
- short-height fallback posture

### Concept B — Container-relative action budgeting
Wherever the independent actions surface is aligned to shell policy, use container-relative thresholds rather than viewport-only assumptions.

### Concept C — Inspectable runtime diagnostics
Require diagnostics that explain:
- selected entry state
- why the first lane paired or stacked
- whether normalization occurred
- whether protected rules forced the outcome

### Concept D — Closure matrix that tests practical usable-space targets
Require closure proof at:
- ultrawide desktop
- standard laptop / desktop baseline
- tablet landscape large / medium
- tablet portrait large / medium
- phone portrait large / standard
- short-height phone landscape
- higher zoom / constrained reflow conditions

### Concept E — Prefer existing tooling over novelty
No new stack is required for the shell core. Prefer:
- existing Vitest-based unit tests
- existing Playwright capability already present in the repo for screenshot / matrix proof if useful
- a bounded local preview / harness path for shell validation

## Dependency posture

### Recommended
- continue using current repo stack
- leverage existing Vitest and Playwright tooling if available for shell proof
- optionally add only minimal dev-only harness utilities if they materially improve proof

### Not recommended
- adding a new design system
- adding a freeform dashboard library
- adding drag-resize libraries
- adding PatternFly or Material libraries just to borrow their patterns

## External source appendix

- MDN — CSS container queries  
  https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries

- MDN — Using container size and style queries  
  https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_size_and_style_queries

- W3C WAI — Understanding SC 1.4.10 Reflow  
  https://www.w3.org/WAI/WCAG21/Understanding/reflow.html

- W3C WAI — Understanding SC 2.5.5 Target Size  
  https://www.w3.org/WAI/WCAG21/Understanding/target-size.html

- PatternFly — Responsive actions  
  https://www.patternfly.org/component-groups/controls/responsive-actions

- PatternFly — Overflow menu design guidelines  
  https://www.patternfly.org/components/overflow-menu/design-guidelines

- Material Design — Responsive UI  
  https://m1.material.io/layout/responsive-ui.html

- Apple — iPhone 17 Pro and 17 Pro Max technical specifications  
  https://www.apple.com/iphone-17-pro/specs/

- Apple — iPad Pro technical specifications  
  https://www.apple.com/ipad-pro/specs/

- Apple — MacBook Pro technical specifications  
  https://www.apple.com/macbook-pro/specs/
