# Narrow Packaging / Registry Remediation Package

## Objective

This package instructs the local code agent to resolve the specific failure seam that is causing SharePoint to render the wrong homepage hero and continue exposing non-hero webparts in the toolbox.

This is **not** a hero redesign package.
This is **not** a broad UI package.
This is a **narrow build / packaging / registry / artifact-truth package**.

## Confirmed Failure Pattern

The current local source indicates a rebuilt minimal `HbSignatureHero` and cleaned flagship manifest, but the deployed behavior shows:

- old-looking hero still renders
- non-hero webparts still appear in the toolbox
- SharePoint behavior does not reflect the intended source-of-truth

Treat this as a packaging/emission problem until proven otherwise.

## Package Sequence

Run these prompts in order:

1. `Prompt-01-Forensic-Package-Truth-Audit.md`
2. `Prompt-02-Fix-Manifest-Emission-And-Toolbox-Hiding.md`
3. `Prompt-03-Fix-Webpart-Registry-And-Bundle-Routing.md`
4. `Prompt-04-Clean-Rebuild-Sppkg-And-Artifact-Proof.md`

## Hard Gates

- Do not assume SharePoint caching is the root cause until the packaged artifact is proven correct.
- Do not stop at source-file correctness.
- Do not rely on incremental build reuse.
- Do not upload another package until the emitted `.sppkg` proves:
  - Signature Hero manifest is current
  - non-hero manifests are hidden from toolbox
  - app bundle registry includes the Signature Hero webpart ID
  - stale legacy hero/welcome routing is removed or isolated appropriately
- Do not re-read files that are still within your current context window or memory. Re-open files only when necessary to verify changed or unresolved details.

## Required Outcome

The next generated `.sppkg` must prove, before deployment:
- packaged hero manifest matches current source intent
- packaged non-hero manifests include `hiddenFromToolbox: true` where required
- packaged bundle includes the Signature Hero ID mapping
- packaged bundle no longer routes the flagship top-band through stale legacy paths
