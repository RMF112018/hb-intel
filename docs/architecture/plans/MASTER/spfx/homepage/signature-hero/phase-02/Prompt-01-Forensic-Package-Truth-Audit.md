# Prompt 01 — Forensic Package Truth Audit

## Objective

Perform a narrow forensic audit of the current `hb-webparts` packaging seam.

The goal is to identify exactly where source truth is diverging from emitted package truth.

This is not a broad repo audit.
This is not a UI review.
This is a build-artifact truth audit.

## Required Inputs

Audit the current local branch state and the current generated package output, including at minimum:

- current source manifests under `apps/hb-webparts/src/webparts/*`
- current source files for:
  - `hbSignatureHero`
  - `hbHeroBanner`
  - `personalizedWelcomeHeader`
- emitted `.sppkg` contents
- emitted package XML manifests
- emitted client-side asset bundle(s)
- emitted shell-entry files
- any generated registry / routing tables used by the shared webparts app bundle

Do not re-read files that are still within your current context window or memory. Re-open files only when necessary to verify changed or unresolved details.

## Required Tasks

### 1. Establish source truth
Document the intended current-source posture for:
- Signature Hero component
- Signature Hero manifest
- non-hero manifest visibility
- canonical top-band routing

### 2. Establish packaged truth
Unpack the generated `.sppkg` and inspect:
- packaged XML manifests
- packaged app bundle registry
- packaged shell-entry surfaces
- packaged webpart IDs
- packaged toolbox visibility state

### 3. Build a source-to-package mismatch table
Create a concise mismatch table showing, for each relevant webpart:
- source manifest intent
- packaged manifest reality
- source component intent
- packaged routing reality
- whether toolbox visibility matches source

### 4. Identify the exact breakpoints
You must identify the concrete seam(s) causing the failure, such as:
- stale generated manifest XML
- stale registry emission
- wrong app-bundle routing source
- build pipeline not consuming current manifest files
- shell-entry or registry generation excluding Signature Hero ID
- non-hero hidden flags not surviving packaging

## Hard Gates

- Do not blame SharePoint first.
- Do not stop at “the source looks right.”
- Do not proceed to fixes without naming the exact source-to-package mismatches.
- Do not give generic packaging advice. Name the exact failing seam in this repo.

## Deliverables

Produce:
- a short forensic audit note
- a mismatch table
- a named list of failing seams
- a proposed fix order ranked by likelihood and blast radius

## Validation

Before finishing, prove:
- whether the Signature Hero webpart ID is present or absent in the emitted bundle registry
- whether `hiddenFromToolbox` survives into the packaged non-hero webpart artifacts
- whether the packaged Signature Hero manifest still carries stale legacy defaults
