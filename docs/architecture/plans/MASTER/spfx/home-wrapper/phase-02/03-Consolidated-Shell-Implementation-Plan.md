# 03 — Consolidated Shell Implementation Plan

## Executive implementation stance

This plan replaces the earlier wave model with one ordered implementation track.

That does **not** mean everything happens in one giant commit.
It means the shell package no longer pushes material shell work into “later” buckets.

## Scope locks

### Lock 1 — Post-hero shell only
`hbHomepage` remains the post-hero operating layer.
The independent flagship hero is not moved into the shell.

### Lock 2 — Child surfaces are bounded to shell compatibility
Any work touching a hosted surface must answer a shell-fit problem:
- slot comfort
- compact mode
- width ceiling/floor
- pairing tolerance
- fallback compatibility

### Lock 3 — Public shell stays preset-driven
Do not turn the public shell into a freeform dashboard editor.

### Lock 4 — Control-panel readiness means contracts now, UI later
Prepare:
- schema
- persistence shape
- protected/configurable boundary
- normalization rules
- validation

Do not spend this package on a maintainer UI unless an ultra-light internal preview harness is necessary to prove the schema.

### Lock 5 — Align to the local shell entry breakpoint spec
Treat `docs/reference/shell/HB-Shell-Entry-Breakpoint-Spec.md` as a governing local input.

That means the shell implementation track must encode:
- named entry states based on practical usable shell widths
- explicit first-lane policy
- conditional first-lane pairing
- forced single-column portrait / handheld fallbacks
- validation against first-screen value-density expectations

This still does **not** move the hero into `hbHomepage`.

## Ordered workstreams

| Order | Workstream | Why first / next | Primary outputs |
|---|---|---|---|
| 1 | Typed shell schema, registry, and validation | Every later shell decision depends on having a real data contract | schema files, parser/validator, registry, normalized defaults |
| 2 | Registry-driven shell renderer | Replace hard-coded JSX stacking with a governed renderer | band/slot resolver, new shell renderer, explicit shell metadata |
| 3 | Container-aware responsive resolution | Shell composition should depend on actual shell width, entry-state policy, and comfort rules | container queries, shell breakpoint resolver, first-lane rules, demotion/collapse rules |
| 4 | Degraded state, invalid-config, and diagnostics | Once layout becomes data-driven, invalid states and failures must degrade visibly and safely | visible fallback surfaces, invalid-state normalization, diagnostics |
| 5 | Occupant capability contracts and shell-fit adjustments | The shell must know what current occupants can safely do | capability registry, current occupant rules, bounded shell-fit fixes |
| 6 | Governed presets and control-panel-ready persistence | The future admin boundary must be encoded before any editor exists | preset definitions, protected decisions, serialized layout shape |
| 7 | Validation and closure proof | Shell work does not close without tests, artifacts, and scorecard proof | tests, screenshots, validation report, scorecard, pass/fail closure |

## What gets merged from the older packages

### Merged into Prompt 01
- composition package slot registry
- composition package capability contract direction
- basic package contract drift concern

### Merged into Prompt 02
- composition package governed layout resolution
- basic package shell-authority concern
- hero boundary correction from this audit

### Merged into Prompt 03
- composition package breakpoint orchestration
- adaptive layout analysis
- container-awareness requirement added by this audit
- explicit alignment to the new shell entry breakpoint spec

### Merged into Prompt 04
- basic package silent failure issue
- composition package invalid shell-state proof direction
- stronger diagnostics and invalid-config rules added by this audit

### Merged into Prompt 05
- both packages’ People & Culture concern, narrowed to shell-fit
- composition package future occupant readiness, reframed from a module-specific Safety brief into a shell capability model

### Merged into Prompt 06
- composition package preset and control-panel-readiness ideas
- clearer protected-vs-configurable boundary and persistence contract

### Merged into Prompt 07
- both packages’ validation and closure prompts
- stronger scorecard and pass/fail discipline

## What is removed outright

1. Any prompt whose primary purpose is to move the hero inside `hbHomepage`
2. Any prompt that mainly redesigns a child webpart as a standalone product
3. Any prompt that leaves core shell work to future phases
4. Any prompt that treats a future occupant as a one-off shell addition instead of capability-driven admission

## Implementation notes for the local code agent

### Shell data model principles
- separate shell layout data from per-module content config
- validate external config before rendering
- normalize to a safe default preset
- allow inactive candidate occupants in registry data without rendering them by default
- encode named entry states and first-lane policy explicitly instead of leaving them implicit in CSS

### Entry-state principles
- align shell behavior to the practical shell design targets in `docs/reference/shell/HB-Shell-Entry-Breakpoint-Spec.md`
- treat the first shell lane as a governed shell concept
- use conditional pairing, not automatic wide-screen side-by-side assumptions
- force disciplined single-column first-lane behavior on tablet portrait and handheld states

### Renderer principles
- shell should render from preset + band + slot data
- band and slot metadata must be explicit in code
- shell wrappers stay thin
- occupant zones still own child mounting and per-zone aria labeling

### Responsive principles
- decide pairing / stacking from shell container width and capability rules
- keep public shell hierarchy authored
- never let a fallback path silently flatten the page into equal-weight stacking

### Admin-readiness principles
- create a serializable preset/layout shape now
- define protected decisions now
- keep public render independent from any eventual drag/drop editor

## Completion standard

This plan is complete only when the shell has:

- typed layout contracts
- registry-driven rendering
- container-aware resolution aligned to the local breakpoint spec
- visible degraded-state handling
- occupant capability metadata
- governed presets and persistence boundaries
- validation and scored closure proof
