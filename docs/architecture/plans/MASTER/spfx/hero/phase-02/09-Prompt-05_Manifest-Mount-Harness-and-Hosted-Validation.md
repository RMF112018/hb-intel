# 09 — Prompt 05: Manifest, Mount, Harness, and Hosted Validation

You are working in the live local HB Intel repo.

## Objective

Wire `teamViewer` fully into the homepage/SPFx runtime, prove mount correctness, and add validation seams strong enough to support real closure.

## Mandatory operating instruction

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**

## Repo-truth reference seams

Inspect the live equivalents before editing:
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/HbKudosWebPart.manifest.json`
- `apps/hb-webparts/src/webparts/hbKudos/kudosRuntimeContract.ts`
- `apps/dev-harness/src/harness/kudosHarness.ts`

## Required implementation work

1. add the `teamViewer` manifest
2. add runtime contract constants as needed
3. wire `teamViewer` into `mount.tsx`
4. add any required webpart properties / config defaults
5. add a harness or seeded validation seam for `teamViewer`
6. validate host-safe behavior if the chosen interaction model needs it

## Mandatory validation scenarios

At minimum, create proof for:
- normal dataset
- empty dataset
- missing-photo dataset
- missing-title dataset
- large-team dataset
- partial malformed dataset

If the app has a detail panel:
- open / close
- keyboard behavior
- focus return
- reduced motion compatibility

## Prohibited behavior

- do not leave manifest / mount drift risk
- do not rely on visual-only proof
- do not ship without a seeded runtime path
- do not close without at least basic hosted-style runtime confidence

## Closure requirements

Before closing this prompt:

- prove the manifest and mount wiring are correct
- prove the harness or seeded validation seam is functional
- capture the remaining defects, if any, for final closure review
