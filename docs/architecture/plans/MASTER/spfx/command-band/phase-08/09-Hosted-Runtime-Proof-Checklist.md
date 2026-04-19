# 09 — Hosted Runtime Proof Checklist

## Purpose
Define the minimum closure proof required before this surface can be accepted again.

## A. Package / deployment proof
- prove the rebuilt `hb-webparts.sppkg` was generated from the intended branch / commit
- prove the package version changed where appropriate
- prove the updated package was deployed to the target tenant/site collection
- prove the hosted page is not rendering stale assets

## B. Runtime attribute proof
Capture hosted evidence showing:

### Wrapper layer
- `[data-hb-homepage-entry-stack="root"]`
- `data-hb-homepage-entry-stack-owner="hb-homepage-wrapper"`
- `data-hb-homepage-entry-stack-region="priority-actions"`

### Flagship rail layer
- `[data-hbc-ui="priority-rail"]`
- `data-hbc-priority-rail-context="homepage-flagship"`

### Container/device markers
Where available, capture:
- `data-hbc-rail-device-class`
- `data-hbc-rail-shell-state`
- `data-hbc-rail-short-height`

## C. Visual proof by device class / width
At minimum provide hosted screenshots for:
- standard laptop / desktop
- tablet landscape-like width
- tablet portrait-like width
- phone-like width or constrained narrow host width

## D. Interaction proof
Provide proof of:
- keyboard focus visibility
- overflow open / close
- Escape dismissal where relevant
- focus return to trigger
- external-link cue behavior
- reduced-motion sanity where relevant

## E. Product-quality proof
Provide screenshots or captured states showing:
- no sparse singleton section waste
- no redundant adjacent heading repetition
- clear primary-vs-secondary action hierarchy
- stronger command density than current screenshot
- no regression to flat Quick Links / enterprise card-grid feel

## F. Failure-state proof
Provide hosted or test proof for:
- loading
- empty
- error
- partial / missing data state

## G. Closure note
No closure is valid if the evidence only proves:
- the code compiles,
- tests pass,
- and something renders.

Closure requires proof that the **hosted output matches the intended flagship path**.
