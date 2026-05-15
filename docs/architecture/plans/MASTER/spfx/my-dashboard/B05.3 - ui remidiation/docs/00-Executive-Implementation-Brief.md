# 00 — Executive Implementation Brief

## Purpose

This implementation package exists to convert **HB Intel My Dashboard** into a production-ready **personal launch pad**. The target is not a mild visual refresh. It is a **UI-posture reset** that preserves underlying read-model and integration rigor while correcting the end-user surface model.

## Current Posture — Condensed Diagnosis

The current UI feels developer-first because it exposes too much of the system's implementation posture:

- shell tabs and dropdown navigation;
- a focused-module route model;
- state-derived hero telemetry;
- standalone readiness/status cards;
- Adobe Sign split across multiple surfaces;
- a full-width My Projects card that over-dominates the page in empty/low-density states.

The codebase is not undisciplined. It is overfit to **state-validation visibility**. The implementation target is to translate that rigor into a cleaner, more mature employee-facing experience.

## Closed Target Experience

The target experience is:

- **one primary page**;
- **two production module cards**;
- **one card per module**;
- **compact page identity header**;
- **disciplined bento composition**;
- **all card states resolved internally**;
- **no page-level telemetry theater**.

## Locked Rendered Experience

```text
My Dashboard
└── My Work
    ├── My Projects card
    └── Adobe Sign Action Queue card
```

No additional rendered module is required in this reset.

## Final UX Statement

A user opening My Dashboard should immediately understand:

1. which projects they can open;
2. whether Adobe Sign has work waiting for them;
3. what action is available now;
4. what is blocked and why, but only at the card level where the block belongs.

The page must not ask users to understand:
- shell state;
- source-health abstractions;
- route taxonomy;
- separate readiness cards;
- implementation of the underlying backend path.

## What the Local Agent Must Preserve

- Live/fixture/read-model safety boundaries.
- OAuth start behavior from the actual authenticated path.
- Source-of-record handoff to Adobe Sign and external project destinations.
- Accessibility and keyboard support.
- Existing bento/grid primitives where still useful.
- Build/package reliability.

## What the Local Agent Must Change

- Rendered shell model.
- Header structure.
- Adobe card architecture.
- My Projects footprint/state behavior.
- Home surface composition.
- Tests and documentation that assert the old architecture.

## Closure Bar

The update is complete only when:

- the rendered page meets the target UI posture;
- obsolete visible architecture is removed;
- implementation artifacts/tests/docs are reconciled;
- validation commands pass;
- package build succeeds.
