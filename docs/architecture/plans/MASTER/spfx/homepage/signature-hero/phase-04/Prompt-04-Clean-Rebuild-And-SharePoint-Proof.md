# Prompt 04 — Clean Rebuild and SharePoint Proof

## Objective

Perform a clean rebuild of `hb-webparts` and prove in SharePoint that the refined hero and configurable background behavior both work.

This is the closure prompt for the package.

## Required Build Posture

Use a clean rebuild posture.
Do not trust prior generated assets.

That means:
- clear stale build output
- clear stale packaging output
- rebuild from clean state
- regenerate the `.sppkg`
- deploy and verify the SharePoint runtime again

Do not re-read files that are still within your current context window or memory. Re-open files only when necessary to verify changed or unresolved details.

## Required Proof

### A. Visual proof
Show that the refined hero now:
- is materially shorter
- uses the new default banner image
- center-crops correctly
- no longer shows `HB Central`
- has a more balanced logo
- reads in the correct order:
  - `Good {time of day}, {User first name}.`
  - `Build with GRIT.`

### B. SharePoint configurability proof
Show that:
- the property pane contains the background image override field
- entering an image URL changes the background
- clearing the field restores the default repo image

### C. Runtime stability proof
Show that:
- CSS still loads correctly
- hero still renders as a premium full-width flagship surface
- no packaging or runtime regressions were introduced

## Hard Gates

- Do not stop at build success.
- Do not stop at local harness proof.
- Do not stop at screenshot-only proof of the default state.
- Do not mark complete until the SharePoint runtime confirms both:
  - the refined hero visual state
  - the configurable background override behavior

## Deliverables

Produce:
- rebuilt `.sppkg`
- concise closure report
- SharePoint runtime validation notes
- recommended authoring instructions for changing the background image from the property pane

## Completion Standard

You are done only when:
- the hero refinement is visibly correct
- the default image is working
- SharePoint property-pane override works
- the runtime remains stable
