# 05C — Utility Zone Test, Usage, and Handoff Guide

## Purpose

Capture Prompt-05 verification expectations and downstream usage guidance for priority actions and tool launcher surfaces.

## Usage Guidance

- Utility zone composition should use shared dense-group primitives to preserve visual/interaction consistency.
- Top-band and utility-zone prompts should share helper/model seams rather than introducing parallel config logic.
- Keep imports constrained to `@hbc/ui-kit/homepage` and approved narrow token/icon paths.

## Required Verification

- `pnpm --filter @hbc/spfx-hb-webparts check-types`
- `pnpm --filter @hbc/spfx-hb-webparts lint`
- `pnpm --filter @hbc/spfx-hb-webparts build`
- `pnpm --filter @hbc/spfx-hb-webparts test`

## Prompt-05 Readiness Outcome

- Priority actions and grouped launcher contracts are implemented, test-covered, and documented.
- Prompt-06 can focus on awareness/editorial surfaces without reopening utility-zone policy decisions.
