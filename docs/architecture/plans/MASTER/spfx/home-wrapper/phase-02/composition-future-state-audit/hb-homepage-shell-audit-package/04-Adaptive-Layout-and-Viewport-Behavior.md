# Adaptive Layout and Viewport Behavior

## Current shell behavior
At the shell level, adaptive behavior is minimal.

### What the shell currently does
- single-column stack at all widths
- larger gaps/padding at 768 and 1200
- reduced-motion timing reset

### What the shell currently does not do
- breakpoint-specific reordering
- lane collapse rules
- paired-zone behavior
- shell-owned width allocation
- module footprint changes by slot
- container-aware placement decisions
- responsive prioritization rules

## Current module behavior

## Stronger adaptive modules
### Company Pulse
The shared newsroom surface has explicit responsive adjustments and a dedicated `company-pulse-homepage` variant. It changes proportions, image height, headline rail behavior, and quick-reads density based on breakpoints.

### Leadership Message
The shared editorial surface has a `leadership` variant for narrower section fit, which is a good sign of slot-aware thinking even if it is still not driven by shell metadata.

### Project Portfolio Spotlight
Project Spotlight was intentionally shifted to a single-column stacked desktop composition to fit the SharePoint section more cleanly. This is a strong module-level shell-fit response, but it is still a local decision, not part of a broader shell orchestration system.

### HB Kudos
HB Kudos has robust host-safe behavior, safe-zone awareness, richer interaction flows, and desktop/mobile differences in some panel behavior.

## Weaker adaptive module
### People & Culture Public
The surface is self-contained and responsive in a basic way, but it is not as refined or as shell-aware as the strongest modules. It does not feel like part of the same governable composition family.

## Wide / medium / narrow / compressed analysis

## Wide viewport
### Current state
- shell still stacks everything vertically
- strong modules already contain rich internal layouts
- page can feel long and sequential rather than orchestrated

### Required future state
At wide widths, the shell should:
- pair compatible modules
- separate competing dominant surfaces
- use distinct bands/lane logic
- create stronger above-the-fold value density

## Medium viewport
### Current state
- shell still behaves like a simple stack
- child modules individually adapt
- hierarchy remains mostly determined by order, not layout

### Required future state
At medium widths, the shell should:
- demote some paired bands into sequenced bands
- preserve one clear dominant module first
- tighten density without flattening all modules equally
- adjust section rhythm and prominence intentionally

## Narrow viewport
### Current state
- stacking works in the basic sense
- but the shell does not reprioritize content
- some surfaces retain too much depth for a narrow composition context

### Required future state
At narrow widths, the shell should:
- show one dominant band first
- suppress or collapse supporting density
- replace some side-by-side richness with summary-first presentation
- maintain a premium, not overcrowded, scan path

## Compressed SharePoint page width / crowded host conditions
### Current state
This is the most important real-world case for the control-panel trajectory.
The shell currently lacks:
- zone comfort thresholds
- hard minimum placement widths
- shell-level demotion rules
- container-aware component switching

### Required future state
The shell needs to know:
- which modules are comfortable at half-width
- which modules require wide/full treatment
- which modules can safely convert to summary mode
- which modules should never be placed next to one another at certain widths
- which modules need dedicated compact variants

## Does the layout adapt correctly today?
**Partially.**

The modules adapt better than the shell.
That means:
- the page does not fully fail at different widths
- but the shell does not actively produce the best layout at those widths

## Does each application remain premium-looking across widths?
### Company Pulse
Yes, mostly

### Leadership Message
Yes, mostly

### Project Portfolio Spotlight
Yes, mostly

### HB Kudos
Yes, strongly

### People & Culture Public
Only partially

## Does the shell need stronger viewport-aware organization?
Yes.
This is one of the clearest findings of the audit.

The shell needs:
- breakpoint-specific composition rules
- not just spacing changes

## Does the shell need container-query thinking?
Yes.

A future control panel that allows governed resizing cannot rely only on viewport breakpoints.
It needs components that respond to:
- the size of the slot/container they actually occupy

This is especially important if a maintainer later changes:
- grouping
- width allocation
- module footprint
- lane placement

## Should adaptive behavior be safely exposable later?
Only partially.

### Safe to expose later
- choose among approved layout presets
- choose among approved prominence tiers
- reorder modules within compatible zone groups
- hide/show optional tertiary modules
- select compact vs expanded treatment when explicitly supported

### Should remain code-governed
- hard min/max footprint rules
- container comfort thresholds
- incompatible placements
- anti-chaos constraints
- accessibility-preserving fallback behavior
- system-authored top-band integrity
- motion / density safety rules

## Adaptive-layout verdict
The homepage already contains several modules that are advanced enough to support a better shell.

The bottleneck is no longer module responsiveness.
The bottleneck is the absence of **shell-owned responsive orchestration**.
