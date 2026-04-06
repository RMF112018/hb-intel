# Prompt 02 — Fix Manifest Emission and Toolbox Hiding

## Objective

Repair the manifest-emission path so the generated `.sppkg` reflects the current source manifests exactly.

This prompt is specifically about:
- packaged Signature Hero manifest truth
- packaged non-hero toolbox hiding truth

## Scope

Target:
- source webpart manifests under `apps/hb-webparts/src/webparts/*`
- any manifest transformation steps
- packaging scripts / config
- generated XML emission path for the `.sppkg`

Do not re-read files that are still within your current context window or memory. Re-open files only when necessary to verify changed or unresolved details.

## Required Changes

### 1. Signature Hero manifest truth
Ensure the emitted package manifest for Signature Hero exactly reflects the current flagship intent:
- `supportsFullBleed: true`
- no stale legacy editorial defaults
- no obsolete hero content fields that no longer belong to the flagship hero

### 2. Non-hero toolbox hiding
Ensure all non-hero homepage webparts that are meant to stay out of the toolbox for this cycle actually package with the correct hidden state.

This must survive all the way into the emitted artifact, not just source JSON.

### 3. Remove stale manifest carryover
If any generated XML is being reused from stale build output, fix that.
If any manifest transform step is reading from the wrong location, fix that.
If any packaging seam is preserving prior manifest state, fix that.

### 4. Add explicit build-proof checks
Add or update a validation step that fails the packaging flow when:
- Signature Hero packaged manifest contains stale hero defaults
- intended hidden webparts do not package as hidden
- packaged manifest output does not reflect current source

## Hard Gates

- Do not hand-wave manifest generation.
- Do not accept “source is correct” if emitted package is wrong.
- Do not leave toolbox hiding as an assumed side effect.
- Do not upload a new package without emitted-manifest proof.

## Deliverables

- corrected manifest emission behavior
- corrected non-hero toolbox hiding in packaged output
- a validation step or check script that proves emitted-manifest correctness
- concise implementation notes

## Validation

Prove, using emitted artifacts:
- packaged Signature Hero manifest is current
- packaged non-hero manifests reflect hidden-from-toolbox intent
- stale manifest carryover is eliminated
