# 07C — Operational Awareness Test, Usage, and Handoff Guide

## Purpose

Capture Prompt-07 verification expectations and downstream usage guidance for project/portfolio spotlight and safety/field excellence surfaces.

## Usage Guidance

- Keep operational-awareness rendering in the lightweight standalone homepage lane.
- Reuse shared operational normalization seams for hierarchy, status indicators, and stale detection.
- Keep imports constrained to `@hbc/ui-kit/homepage` and approved narrow shared seams.

## Required Verification

- `pnpm --filter @hbc/spfx-hb-webparts check-types`
- `pnpm --filter @hbc/spfx-hb-webparts lint`
- `pnpm --filter @hbc/spfx-hb-webparts build`
- `pnpm --filter @hbc/spfx-hb-webparts test`

## Prompt-07 Readiness Outcome

- Project/portfolio spotlight and safety/field excellence contracts are implemented, test-covered, and documented.
- Prompt-08 can focus on smart search, wayfinding, and discovery without reopening operational-awareness policy.
