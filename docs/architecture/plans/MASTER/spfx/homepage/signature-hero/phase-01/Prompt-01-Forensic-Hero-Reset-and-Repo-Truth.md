# Prompt 01 — Forensic Hero Reset and Repo Truth Lock

## Objective

Perform a hard reset of the flagship homepage hero direction in the live repo.

This is not a polish pass.
This is not an incremental refinement pass.
This is a forensic teardown and reset.

The current hero direction has failed. Scrap it as the flagship solution and establish a clean repo-truth reset path for a brand-new hero implementation.

## Required Inputs

Use repo truth on the live main branch and the current local branch state.

Anchor your work to the files that currently govern the hero/top-band experience, including but not limited to:
- `apps/hb-webparts/src/webparts/hbSignatureHero/*`
- `apps/hb-webparts/src/webparts/hbHeroBanner/*`
- `apps/hb-webparts/src/webparts/personalizedWelcomeHeader/*`
- homepage composition references
- homepage shared helpers and contracts
- any manifest or registration files that keep split top-band logic alive

Do not re-read files that are still within your current context window or memory. Re-open files only when necessary to verify changed or unresolved details.

## Hard Reset Decision

Treat the current flagship hero as rejected.

The new flagship hero must contain only:
- company logo / brand lockup
- tagline: `Build with GRIT.`
- personalized welcome message

Remove all flagship hero expectations around:
- CTA rows
- metadata
- editorial copy
- alerts
- support lines
- operational widgets
- secondary promotional content
- split greeting/hero composition

## Tasks

### 1. Repo-truth audit
Identify every file, component, manifest, export, composition reference, and legacy path that currently participates in the homepage top band.

Produce a short internal implementation note that identifies:
- canonical top-band path
- stale split-top-band paths
- obsolete hero props and contracts
- obsolete manifest defaults
- obsolete composition references

### 2. Canonical path lock
Make `HbSignatureHero` the only flagship homepage top-band surface.

Reclassify all other top-band surfaces as one of:
- deprecated
- standalone/non-flagship
- hidden from toolbox
- retained only for non-homepage use

### 3. Flag stale architecture
Identify and remove or quarantine logic that keeps the old split architecture alive:
- `hbHeroBanner` as flagship
- `PersonalizedWelcomeHeader` as flagship
- stale composition references that still imply a two-surface hero

### 4. Simplify the contract
Reduce the flagship hero prop contract to only what is needed for:
- personalized greeting resolution
- optional authored background image / asset reference
- time-of-day resolution
- minimal author-safe defaults

Remove stale props such as:
- headline
- message
- metadata
- cta
- secondaryCta
- alert fields
- supportLine
- contextLine

If any of those are still needed for non-flagship legacy surfaces, isolate that logic away from the flagship hero path.

## Hard Gates

- Do not keep legacy hero content fields in the flagship manifest just because they already exist.
- Do not preserve split-top-band architecture for convenience.
- Do not leave the repo in an ambiguous state where multiple components still present themselves as the flagship homepage hero.
- Do not re-skin the existing hero and call it a reset.

## Deliverables

- code changes that lock the canonical flagship hero path
- cleanup of stale top-band contracts and references
- a concise implementation note summarizing what was removed, deprecated, or hidden

## Validation

Before finishing:
- prove which component is now canonical
- prove which legacy hero/welcome surfaces were downgraded or hidden
- prove that obsolete hero manifest defaults were removed from the flagship path
