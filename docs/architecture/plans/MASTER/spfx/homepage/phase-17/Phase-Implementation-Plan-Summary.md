# Phase Implementation Plan Summary — Structural Rebuild

## Objective

Rebuild the homepage webparts under `apps/hb-webparts/src/webparts/` using a stronger stack, stronger primitive system, and stronger SPFx manifest discipline.

## Why This Package Exists

The current repo changes show intent, but not a real breakout.
The design model is still too safe.
The shared primitives are still too close to careful enterprise card language.
The actual webparts are still mostly wrappers around the same component structure.

This package changes the task from:

> make the current webparts look better

to:

> rebuild the webparts and supporting primitives so they no longer depend on the same safe visual and structural assumptions

## Structural Requirements

### A. Actual rebuild target
The rebuild target is the real webpart code in:

- `apps/hb-webparts/src/webparts/`

### B. Manifest discipline
Each webpart folder must include the appropriate SPFx manifest file adjacent to its entry.

### C. Signature hero full-width support
The signature hero banner manifest must explicitly include:

```json
"supportsFullBleed": true,
```

### D. Stack discipline
The rebuild must use the specified stack, not merely install it.

## Phase Structure

### Phase 1 — Stack installation and doctrine reset
Install the approved dependency set and freeze the “no default Fluent visual language” rule.

### Phase 2 — Manifest audit and enforcement
Audit every webpart folder for manifest correctness and enforce full-bleed support on the signature hero.

### Phase 3 — Shared primitive rebuild
Rebuild shared homepage primitives with the new stack.

### Phase 4 — Structural rebuild of top band, command, and discovery webparts
Rebuild the webparts that most clearly expose the old design box.

### Phase 5 — Structural rebuild of editorial and operational webparts
Rebuild the rest of the homepage webparts around the stronger system.

### Phase 6 — QA, rendered validation, and package rebuild
Prove the result is materially different and rebuild the deployable package.

## Hard Gates

The work is not complete unless:

- each webpart has the correct manifest structure
- the signature hero manifest has `supportsFullBleed: true`
- the greeting is truly integrated into the hero experience
- the homepage no longer reads like Fluent-adjacent card wrappers
- launcher, command, discovery, editorial, and operational surfaces feel materially distinct
- the rendered screenshots show a decisive jump in quality
