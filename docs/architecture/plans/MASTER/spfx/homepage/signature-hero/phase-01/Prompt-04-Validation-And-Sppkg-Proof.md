# Prompt 04 — Validation, Runtime Proof, and SPPKG Readiness

## Objective

Validate that the hard-reset hero is genuinely rebuilt, genuinely full-width, and genuinely the only visible homepage webpart for this release cycle.

Do not stop at local code confidence.
Prove the SharePoint-hosted outcome.

## Validation Scope

### A. Runtime visual proof
Capture evidence that the rebuilt Signature Hero:
- renders as a single flagship surface
- uses the full available width of the SharePoint full-width section
- no longer uses the rejected gradient treatment
- contains only logo, tagline, and personalized greeting
- reads as a premium identity surface rather than a generic banner

### B. Packaging proof
Confirm the generated package preserves:
- `supportsFullBleed: true` for Signature Hero
- hidden-from-toolbox state for non-hero webparts
- correct manifest integrity
- no broken loader or packaging regressions introduced by the reset

### C. Authoring proof
Confirm that:
- the hero behaves safely in edit mode
- the hero still renders acceptably when no authored background image is supplied
- the fallback background remains premium and readable
- the hero is stable under normal SharePoint page authoring conditions

## Required Checks

- inspect the generated `.sppkg`
- confirm only the intended webpart is available in the SharePoint toolbox
- confirm the runtime result matches the new implementation rather than an old cached path
- verify there is no stale white-slab / giant-logo fallback surviving from prior logic
- verify the hero is not visually bottlenecked by internal layout constraints

## Deliverables

Produce a concise validation note containing:
- what was tested
- what passed
- what failed
- screenshots or runtime observations
- whether the package is ready for upload
- whether the SharePoint result matches the intended redesign

## Completion Standard

You are not done when the code compiles.
You are done when:
- the SharePoint-hosted hero visibly reflects the new design
- the hero uses the full-width section properly
- the gradient is gone
- the old flagship direction is gone
- only the Signature Hero is exposed for this build cycle

Do not re-read files that are still within your current context window or memory. Re-open files only when necessary to verify changed or unresolved details.
