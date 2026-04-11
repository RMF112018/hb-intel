# HB Kudos Public Surface — Targeted Contract / Rendering Prompt Package

## Purpose

This package is a **targeted defect-closure package** for the public-facing HB Kudos webpart.

It is intended for use **after** the broader UI remediation and production-readiness prompt sequences have already been executed, but where the public surface still does **not** clear release due to a narrower class of unresolved issues centered on:

- featured recognition rendering failure
- shared-surface contract alignment
- public adapter/view-model shaping
- render-state resilience
- fresh package proof after targeted closure

This is **not** another broad design package.

It is a **focused contract/rendering package**.

## Current condition summary

The latest review indicates that the public HB Kudos webpart has improved in code quality and packaging posture, but the public featured recognition area still renders as a partially empty / visually broken shell.

That means the remaining problem is most likely concentrated in one or more of the following:

- the contract between public Kudos data and the shared people/culture surface
- the featured-item adapter logic in the public webpart
- assumptions inside the shared rendering path
- incomplete or mismatched fallback behavior when public data is sparse
- a render-state issue that is packaging-clean but product-broken

## Package contents

### Governing docs
- `HB-Kudos-Public-Contract-Rendering-Plan-Summary.md`
- `HB-Kudos-Public-Contract-Rendering-Matrix.md`

### Prompt sequence
- `Prompt-01-HB-Kudos-Public-Featured-Contract-Audit-and-Restoration.md`
- `Prompt-02-HB-Kudos-Public-Shared-Surface-Rendering-Alignment.md`
- `Prompt-03-HB-Kudos-Public-Adapter-and-Render-State-Hardening.md`
- `Prompt-04-HB-Kudos-Public-Targeted-Validation-and-Evidence.md`
- `Prompt-05-HB-Kudos-Public-Contract-Rendering-Final-Sweep-and-Packaging.md`

## Execution order

Run the prompts in numeric order.

Do **not** jump directly to Prompt 05.  
Prompt 05 is the release-gate and packaging pass for this targeted work.

## What the agent should optimize for

The prompts are intentionally explicit about:

- the target defect class
- the target product outcome
- the governance expectations
- the evidence standard

But they are intentionally **not overly definitive** about implementation direction.

The agent should decide, based on repo truth, whether the right correction belongs in:

- the public HB Kudos webpart
- the homepage shared layer
- `@hbc/ui-kit/homepage`
- or a combination of those, provided the boundary remains governed and explainable

## Agent expectations

The agent should:

- use live repo truth
- avoid re-reading files already in active context or memory
- remain tightly focused on the public HB Kudos contract/rendering path
- maintain strict compliance with `@hbc/ui-kit` and `docs/reference/ui-kit/`
- move or promote UI only when there is a real governance or durability reason
- avoid cosmetic masking of the defect
- avoid treating clean packaging as proof that rendering is correct
- remain skeptical and evidence-based

## Expected outputs after the full sequence

At the end of the sequence, the agent should be able to demonstrate:

- a restored featured recognition rendering path
- a stable and governed contract between public Kudos data and the shared surface
- safer render-state behavior when content is sparse or partially populated
- a public surface that no longer depends on fragile implicit assumptions
- a fresh package and honest final verdict on whether this defect class is actually closed

## Recommended acceptance stance

Do not accept the work until the agent supplies updated evidence for:

- public homepage rendered state
- featured recognition visible and content-carrying
- any sparse-data / fallback condition the agent deems relevant
- fresh build/package outputs
- explicit explanation of local/shared/ui-kit boundary decisions
