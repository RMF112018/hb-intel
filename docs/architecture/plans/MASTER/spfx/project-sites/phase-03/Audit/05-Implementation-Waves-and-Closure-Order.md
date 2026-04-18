# Implementation Waves and Closure Order

## Why this closure order changed

The attached prompt package had the right broad order, but some work units were too broad.  
This enhanced package breaks the remediation into **tighter bounded prompts** so the local code agent can close each issue with less ambiguity.

## Wave 1 — Contract refresh and layout-mode redesign
**Prompts:** 01, 02

### Wave objective
Refresh the responsive contract and reshape the layout-mode system so later UI work is not being done against a stale or under-specified breakpoint model.

### Why first
Everything else depends on a credible mode contract.

### Closure standard
- updated code contract
- updated contract docs
- tests reflect the updated mode logic

## Wave 2 — Tablet/transitional control-band composition
**Prompts:** 03, 04

### Wave objective
Turn medium/tablet from a stacked overflow state into a deliberate operating layout, and then tighten compact/mobile control behavior separately.

### Why second
This is the current highest-value user-visible weakness after the coarse contract itself.

### Closure standard
- medium layout is visibly distinct and intentional
- compact remains reachable and cleaner under pressure
- filter and action ergonomics improve without breaking current behavior contracts

## Wave 3 — Card-density redesign
**Prompts:** 05

### Wave objective
Introduce explicit density variants so card content strategy actually changes by layout mode.

### Why third
The control band and card density must evolve together. A better top section with unchanged tall cards still leaves too much scrolling and weak scan speed.

### Closure standard
- card density changes by design, not only by wrap behavior
- primary launch meaning and action remain clear
- compact scans faster

## Wave 4 — Grid and sparse wide-state recomposition
**Prompts:** 06

### Wave objective
Fix weak desktop/ultrawide sparse states and tighten wide-state composition generally.

### Why fourth
This work depends on the updated card system and mode rules.

### Closure standard
- sparse states use the canvas intentionally
- standard desktop and ultrawide feel less timid
- no fake-shell filler or decorative overbuild

## Wave 5 — First-screen prioritization and host-fit hardening
**Prompts:** 07

### Wave objective
Reduce vertical overhead before results and harden the surface against obvious host-level crowding risks.

### Why fifth
This work is easier to do correctly after the control band and card densities are already defined.

### Closure standard
- cards appear sooner on narrow states
- context remains truthful but less dominant
- lower-edge/lower-right host-fit behavior is more robust

## Wave 6 — Proof, docs, and visual-regression posture
**Prompts:** 08

### Wave objective
Refresh the evidence layer so the redesign is discoverable, auditable, and harder to regress.

### Why last
This wave should capture the actual final state, not an intermediate one.

### Closure standard
- tests updated
- existing responsive closure docs refreshed or intentionally superseded
- named hosted validation matrix exists
- screenshot-capable path recommended or adopted

## Prompt map

1. `Prompt-01-Refresh-Responsive-Contract-and-Mode-Responsibilities.md`
2. `Prompt-02-Stabilize-Container-State-and-Short-Height-Behavior.md`
3. `Prompt-03-Recompose-Medium-Tablet-Control-Band.md`
4. `Prompt-04-Harden-Compact-Control-Band-and-Filter-Ergonomics.md`
5. `Prompt-05-Introduce-Card-Density-Variants.md`
6. `Prompt-06-Recompose-Sparse-Wide-and-Ultrawide-Grid-Behavior.md`
7. `Prompt-07-Reduce-First-Screen-Overhead-and-Host-Fit-Risk.md`
8. `Prompt-08-Refresh-Breakpoint-Evidence-Tests-and-Validation-Matrix.md`
