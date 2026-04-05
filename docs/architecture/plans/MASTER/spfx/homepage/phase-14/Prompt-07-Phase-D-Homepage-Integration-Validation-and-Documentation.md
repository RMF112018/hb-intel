# Prompt 07 — Phase D Homepage Integration, Validation, and Documentation

## Objective

Complete the Phase D integration pass after the five target surfaces and their shared-kit dependencies have been implemented.

This prompt is about:
- integration refinement
- consistency checks
- visual differentiation validation
- regression detection
- accessibility validation
- documentation updates

## Hard instruction

Do **not** re-read files already in your active context or memory unless needed to resolve uncertainty, confirm a regression, or validate repo truth after the previous prompts.

## Required work

### 1. Homepage integration pass
Review the five target surfaces together in the actual homepage composition and refine:
- inter-module rhythm
- consistency of section headers and CTA language
- cohesion of spacing and density
- balance between differentiation and product unity
- any remaining visual collisions with adjacent homepage surfaces

### 2. Differentiation validation
Explicitly verify that the following pairs are now clearly distinct:
- Company Pulse vs Leadership Message
- Company Pulse vs People & Culture
- Project / Portfolio Spotlight vs Safety & Field Excellence
- editorial surfaces vs operational surfaces overall

### 3. Regression review
Check for regressions in:
- shared kit consumers
- exports/imports
- theme behavior
- truncation and overflow
- keyboard focus
- hover/focus states
- responsive behavior
- reduced-motion handling

### 4. Documentation updates
Update or add the relevant docs to explain:
- the Phase D surface families
- when each shared primitive or variant should be used
- anti-patterns and usage boundaries
- any future extension guidance

### 5. Acceptance notes
Produce a short acceptance-oriented summary of:
- what changed
- what remains out of scope for Phase D
- any follow-on considerations for Phase E or later

## Deliverables

At minimum:
- updated docs
- validation notes
- any cleanup commits needed to remove duplication or inconsistencies
- a brief Phase D completion summary

## Required validation criteria

Phase D should only be considered complete if:
- all five target surfaces are clearly differentiated at first glance
- shared-kit additions are understandable and reusable
- the homepage still feels cohesive
- no major accessibility regressions exist
- no target surface still reads as a lightly restyled generic card

## Risk Exposure

- The homepage may become visually fragmented if integration is skipped.
- Shared-kit APIs may remain under-documented.
- Minor spacing and CTA inconsistencies can materially reduce perceived polish.

## Standards / Best Practices

- integration over isolated success
- accessibility validation
- docs as part of done
- differentiation with cohesion
- no unfinished prompt-local hacks
