# Prompt 02 — Rebuild `hbHomepage` as a Flagship Homepage Shell

## Objective

Replace the current “stacked zones inside a centered shell” posture with a real flagship homepage shell that establishes hierarchy immediately, renders a doctrine-safe top-band, and makes the page read as one authored homepage experience.

## Governing authority

Binding:
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

Benchmark context:
- `docs/architecture/plans/MASTER/spfx/benchmark/00-Plan-Summary.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/01-Homepage-Webpart-Conformance-Standard.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/07-Persona-and-Design-Symmetry-Rule.md`

## Exact seams to inspect

- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepage.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.module.css`
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageContract.ts`
- any new shell-level registry/helper you add
- the corrected shared hero primitive from Wave 01 Prompt 01

## Current future-state gap to close

The current shell is too thin. It composes strong zones, but it does not yet act like a flagship homepage application.

Specific problems:
- no true flagship top-band
- no dominant first read
- shell has little compositional authority beyond vertical order
- width and rhythm are too generic for flagship use
- the homepage still risks reading as premium modules stacked on a canvas rather than one authored surface

## Required implementation outcome

Rebuild the shell so it becomes the homepage composition authority:

1. Add a true flagship top-band at the top of the page using the corrected shared hero primitive.
2. Establish a clear hierarchy for the remaining zones:
   - primary editorial / operational lanes
   - supporting people / recognition lanes
   - deliberate spacing and transitions between them
3. Strengthen layout authority:
   - do not rely on a generic centered stack as the final flagship answer
   - use available width with more confidence
   - create stronger focal sequencing
4. Preserve zone independence:
   - do not collapse everything into one giant component
   - keep zones bounded
   - let the shell own composition, not zone internals
5. Keep SharePoint host-awareness:
   - no fake nav bars
   - no shell duplication
   - page-canvas ownership only

## Proof of closure

Show:
- the new top-level layout model
- files changed
- how the top-band now satisfies flagship hierarchy
- why the page now reads as one authored homepage experience instead of a stacked module sequence
- any visual/runtime tradeoffs you made

## Constraints

- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Do not weaken the existing zone personas.
- Do not make the page a clone of HB Kudos.
- Do not introduce decorative complexity without hierarchy value.
