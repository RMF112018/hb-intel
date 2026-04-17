# PriorityActionsRail Implementation Prompt Package

## Package purpose

This package is an implementation-ready prompt set for a local code agent to deliver:

- `PriorityActionsRail`
- `PriorityActionsRailAdmin`

It is grounded in:

- current repo truth verified against the live `main` branch structure and mount/package seams
- the attached governing spec and doctrine files carried forward in this package
- the documented SharePoint list schemas for `Priority Actions Band Config` and `Priority Actions Band Items`
- the SPFx homepage benchmark package and closure rules

## What is in this package

- `Plan-Summary.md`
- `Gap-Register.md`
- `Dependency-Map.md`
- `Schema-Alignment-Appendix.md`
- `Benchmark-Reference-Summary.md`
- `Proof-and-Closure-Checklist.md`
- `Carry-Forward/` governing source files
- `Prompts/` detailed execution prompts in dependency order

## Verified repo-truth baseline used for this package

The package is built on these verified facts:

1. `PriorityActionsRail` already exists as a homepage webpart in `apps/hb-webparts`, has a dedicated folder target at `src/webparts/priorityActionsRail/`, is part of the shipped homepage package, and has a dedicated proof-case mount seam.
2. `PriorityActionsRailAdmin` is **not** present in the current `apps/hb-webparts/src/webparts/` listing on `main`.
3. `HbHeroBannerAdmin` exists and is the closest verified authoring/admin precedent in the homepage package.
4. The homepage package structure already includes the shared seams the implementation should reuse:
   - `src/homepage/shared/`
   - `src/homepage/helpers/`
   - `src/homepage/webparts/`
   - `src/homepage/models/`
   - `src/mount.tsx`
5. The SharePoint list schemas are already documented and provisioned, but the schema docs explicitly state that the direct public list-read adapter for Priority Actions is still pending. That means list contracts exist, but runtime integration is not yet complete.

## Important audit honesty

This package is repo-truth-based, but not every deep internal file body for the existing public rail was retrievable through live browsing. The verified baseline therefore leans on:

- current repo folder/package structure
- current mount/runtime seams
- current hb-webparts package README
- current webpart folder inventory
- current SharePoint schema docs
- current benchmark/doctrine docs

Where a deeper internal file body was not directly verified, the prompts explicitly instruct the code agent to confirm the exact local implementation before changing it, without reopening already-active context unless drift or dependency uncertainty requires it.

## Execution order

Run prompts in numeric order unless a later prompt explicitly says it may be executed in parallel after a predecessor closes.

1. `Prompt-01-Implementation-Baseline-and-Schema-Hardening.md`
2. `Prompt-02-Read-Seams-Normalization-and-Breakpoint-Resolution.md`
3. `Prompt-03-Shared-Priority-Rail-Surface-Family.md`
4. `Prompt-04-Public-PriorityActionsRail-Webpart-Refactor.md`
5. `Prompt-05-Admin-Contracts-Writers-and-Draft-State.md`
6. `Prompt-06-PriorityActionsRailAdmin-Webpart.md`
7. `Prompt-07-Mount-Manifest-Packaging-and-Homepage-Integration.md`
8. `Prompt-08-Hosted-Validation-Benchmark-and-Closure.md`

## Closure rule

Do not close this effort on visual uplift alone.

Closure requires all of the following:

- doctrine compliance
- benchmark-grade execution
- schema alignment with documented internal names and relationships
- explicit read/write seams
- credible admin workflows
- hosted SharePoint proof
- completed scorecard and closure evidence
