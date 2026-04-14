# Prompt 07 — Mount, Manifest, and Packaging Integration for HB Homepage

You are working in the live local HB Intel repo.

## Objective

Wire the new `hb-homepage` host into the real hb-webparts runtime and packaging pipeline so it becomes a true packaged SPFx component.

## Critical operating instruction

Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Governing authority

- the two doctrine files
- all prior `hb-homepage` architecture and closure notes
- live repo truth in `apps/hb-webparts/src/mount.tsx`
- live repo truth in `tools/build-spfx-package.ts`

## Required implementation

1. update `mount.tsx` to register and render `hb-homepage`
2. ensure runtime contract / webpart ID / manifest linkage are correct
3. update the hb-webparts packaging pipeline as required
4. ensure the new manifest is discoverable and packaged correctly
5. preserve existing packaging integrity for the rest of hb-webparts
6. do not break `hbSignatureHero`

## Required verification

You must prove:

- manifest adjacency is correct
- runtime registration is correct
- package generation includes the new component
- no stale or accidental legacy mapping was introduced

## Required closure note

Create:

`docs/architecture/plans/MASTER/spfx/homepage/hb-homepage/phase-04/07-Mount-Packaging-and-Manifest-Integration.md`

It must include:

- exact files changed
- manifest ID and runtime mapping proof
- packaging changes made
- build/package proof summary
- what remains for hosted vetting

## Constraints

- Do not skip package/build verification
- Do not make unrelated package-pipeline changes
- Do not leave mount mapping ambiguous

## Completion standard

This prompt is complete when `hb-homepage` is a real packaged hb-webparts component with verified runtime and packaging linkage.
