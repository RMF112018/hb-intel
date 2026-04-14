# Prompt 03 — Create the HB Homepage SPFx Host

You are working in the live local HB Intel repo.

## Objective

Implement the new `hb-homepage` SPFx host component and its initial internal shell structure inside `apps/hb-webparts`.

This prompt should create the actual new homepage host, but it should not yet absorb all target modules.

## Critical operating instruction

Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Governing authority

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/architecture/plans/MASTER/spfx/homepage/hb-homepage/phase-01/01-Authority-and-Repo-Truth-Lock.md`
- `docs/architecture/plans/MASTER/spfx/homepage/hb-homepage/phase-01/02-Architecture-and-Surface-Contract.md`

## Required implementation

Create the new `hb-homepage` host under `apps/hb-webparts/src/webparts/`.

Required outcomes:

1. create the new host folder and all foundational files
2. create the adjacent manifest
3. create the internal shell component hierarchy needed for composed homepage rendering
4. define the module registration / composition seam
5. establish shell-owned layout structure and spacing ownership
6. preserve doctrine-compliant host-aware behavior
7. keep `hbSignatureHero` out of the shell

## Required file outputs

In addition to code changes, create a closure note at:

`docs/architecture/plans/MASTER/spfx/homepage/hb-homepage/phase-02/03-Create-HB-Homepage-Host.md`

The note must include:

- exact files created
- exact files updated
- shell structure implemented
- manifest details
- any temporary placeholder composition decisions
- what remains open for Prompt 04

## Constraints

- Do not absorb Kudos yet
- Do not update `mount.tsx` yet unless absolutely necessary for local compile safety
- Do not update packaging yet
- Do not use CSS-only fake full-bleed hacks
- Do not introduce unrelated refactors

## Completion standard

This prompt is complete when `hb-homepage` exists as a real SPFx host component with a manifest, shell structure, and a stable foundation for embedding the first-wave modules.
