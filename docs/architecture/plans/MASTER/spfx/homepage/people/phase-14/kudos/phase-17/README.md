# HB Kudos Public Surface — Targeted 100% Zoom Size / Overflow Remediation Package

## Purpose

This package updates the prior public-surface remediation direction with a **targeted vertical-compaction and overflow-control pass** for the HB Kudos public homepage webpart.

The objective is to make the webpart read correctly at **desktop 100% zoom**, maintain strong hierarchy at reduced desktop widths, and coexist cleanly with SharePoint chrome and the persistent bottom-right assistant overlay.

## Core problem statement

The current public Kudos surface is visually strong, but the **hero + featured-card zone still consumes too much vertical budget at 100% zoom**. That leaves the first viewport top-heavy and makes hosted overflow feel worse than it should.

This package is intentionally targeted. It is not a redesign package.

## Scope lock

In scope:
- hero band / masthead
- featured recognition card
- recent recognition band
- archive zone
- visible browse/feed rows where they continue the same public-surface experience
- hosted spacing / safe-zone behavior affecting the public surface
- ui-kit-conformant refinement of the homepage variant and any tightly related local webpart styling/rendering paths
- harness updates required to validate the compaction / overflow work

Out of scope:
- Give Kudos flyout internals
- companion/admin surfaces
- people picker
- workflow redesign
- unrelated homepage webparts

## Non-negotiable execution rules

- Preserve the current premium concept. Do not redesign the public surface.
- Treat the work as a **coordinated whole-surface compaction pass**, not isolated tweaks.
- Every affected public-surface area must be reviewed relative to the compaction changes so the result remains balanced.
- Conform all changes to `@hbc/ui-kit` guidance and existing homepage / presentation-lane doctrine.
- Do not solve the problem by making everything globally smaller.
- Do not claim closure unless 100% zoom hosted validation is updated and passing.

## Recommended execution order

1. Read `00-Plan-Summary.md`
2. Read `01-Decision-Lock-Vertical-Compaction.md`
3. Lock the rows in `02-Targeted-Size-and-Overflow-Remediation-Matrix.md`
4. Execute prompts in numeric order
5. Complete validation and proof capture before claiming closure
