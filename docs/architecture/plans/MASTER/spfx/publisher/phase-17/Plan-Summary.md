# Plan Summary — Enhanced Wave 02

## Objective

Close the remaining gap between the current competent Publisher workspace and the doctrine-level premium SPFx editorial surface the product brief actually requires.

## Recommended execution sequence

1. **Establish premium-stack foundation and owned primitives**
2. **Rebuild owned anchored overlays and popup seams**
3. **Elevate control language, iconography, and action affordances**
4. **Finish token provenance, CSS localization, and shell cleanup**
5. **Close UI-kit entry-point and import-discipline drift**
6. **Clean up product-scope, naming, and lineage drift**
7. **Prove final closure with build, package, and hosted validation**

## Why this sequence is correct

### 1 → 2
Overlay modernization should not start before the app has the missing premium dependencies and any shared primitive scaffolding it needs.

### 2 → 3
Once the owned overlay seams are structurally stronger, control-language uplift can be applied consistently across buttons, chips, disclosures, queue actions, team/media actions, and toolbar affordances.

### 3 → 4
After the control family is stabilized, CSS and token cleanup can narrow responsibilities without fighting in-flight component redesign.

### 4 → 5
Import-governance cleanup is easier to close once the active UI seams and their real dependencies are known.

### 5 → 6
Naming and lineage cleanup should reflect the final technical truth, not a mid-refactor state.

### 6 → 7
Validation comes last so build, packaging, and hosted-proof artifacts reflect the actual final surface.

## Package design decisions

### Existing Prompt 01 was split
The old “adopt the premium stack” prompt covered too many distinct closure units. It is now split into:
- foundation / dependency adoption
- owned overlay modernization
- control-language and iconography uplift

### Existing Prompt 02 was strengthened and narrowed
Control-language uplift remains necessary, but it now explicitly includes:
- queue CTA treatment
- team/media action affordances
- pseudo-icon retirement
- coherent iconography rules

### Existing Prompt 03 remains one prompt, but is much more explicit
CSS cleanup is still one closure unit because shell narrowing, token provenance, and component-local styling are tightly coupled. It now names the seams more precisely and requires responsibility cleanup rather than vague “CSS improvement.”

### Existing Prompt 04 remains, but now requires a full app-wide grep and closure
The prior prompt listed only a subset of files. The enhanced prompt forces a whole-app import scrub under `apps/hb-publisher`.

### Existing Prompt 05 remains, but now includes package-facing and manifest-facing truth
The prior prompt under-scoped `package-solution.json` and other narrative surfaces that still shape developer understanding and deployment semantics.

### Existing Prompt 06 remains final, but is stricter
The proof prompt now requires explicit closure artifacts and clearer validation evidence.

## Out of scope for this wave

- broad workflow redesign beyond directly coupled Wave 02 seams
- backend feature expansion
- unsupported destination expansion unless the local code agent can fully close it now without violating the narrowed wave boundary
- speculative future-proofing not needed for current closure
