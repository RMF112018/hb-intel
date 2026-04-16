# Prompt Title

Prompt 04 — Create the HB Homepage Host and Adjacent Manifest

## Objective

Implement the new `hb-homepage` webpart host, including its adjacent manifest, internal shell hierarchy, and initial shell-owned layout/state behavior, without yet embedding all target modules.

## Why this prompt exists now

The original host-creation prompt was too terse. In this repo, “create the host” is not just “make a new component folder.” It requires:

- a new adjacent manifest
- host-safe shell defaults
- authoring-safe sparse and partial-config behavior
- a composition/registration seam for embedded modules
- discipline around coexistence with the current standalone webparts

## Current repo truth

You must honor:

- manifest adjacency rules
- import discipline for homepage work
- the current `mount.tsx` dispatch model
- the current package/build structure of `apps/hb-webparts`

## Intended future state

At completion of this prompt:

- `apps/hb-webparts/src/webparts/hb-homepage/` exists
- the new host has an adjacent manifest
- the shell can render an initial composed frame with authoring-safe placeholder content
- shell-level state treatment exists for loading / empty / invalid configuration / error conditions
- the host is ready to accept target modules in later prompts

## Research-informed technical considerations

Build the host according to the locked technical posture:

- if the architecture doc makes the host full-width-capable, the manifest must explicitly carry that intent
- the host must still render acceptably in non-full-width placements
- motion must be reduced-motion aware
- homepage imports must come from the governed homepage entry point unless the architecture doc explicitly justifies a narrower exception

## Required implementation scope

Implement the host and create a closure note at:

`docs/architecture/plans/MASTER/spfx/homepage/hb-homepage/phase-02/04-Create-HB-Homepage-Host-and-Manifest.md`

Implementation work must include:

1. create the `hb-homepage` folder and foundational files
2. create the adjacent manifest
3. create the shell component hierarchy
4. establish a module registration/composition seam
5. establish shell-owned layout structure
6. establish shell-owned sparse/loading/error posture
7. ensure the host compiles cleanly before module embedding starts

## Explicit non-scope

- Do not embed `HbKudos` yet
- Do not edit `mount.tsx` yet
- Do not update `build-spfx-package.ts` yet
- Do not break existing standalone public webparts
- Do not implement hero absorption

## Required verification / burden of proof

You must prove:

- exact files created
- manifest adjacency
- whether `supportsFullBleed` is or is not set, and why
- shell render behavior under minimal/partial configuration
- compile success for the new host files

## Required output artifact(s)

- `04-Create-HB-Homepage-Host-and-Manifest.md`

## Completion standard

This prompt is complete only when a real `hb-homepage` host exists and is technically ready for phased module embedding.
