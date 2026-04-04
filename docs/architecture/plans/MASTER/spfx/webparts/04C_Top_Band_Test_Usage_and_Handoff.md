# 04C — Top-Band Test, Usage, and Handoff Guide

## Purpose

Capture Prompt-04 verification and downstream usage guidance for the welcome-header + hero-banner pair.

## Shared Usage Guidance

- Compose top-band surfaces through `HomepageTopBandPair` to preserve coordinated layout behavior.
- Reuse Prompt-03 shared section/rail primitives for adjacent zones to avoid duplicate wrappers.
- Keep imports constrained to `@hbc/ui-kit/homepage` and allowed narrow token/icon entrypoints.

## Required Verification

- `pnpm --filter @hbc/spfx-hb-webparts check-types`
- `pnpm --filter @hbc/spfx-hb-webparts lint`
- `pnpm --filter @hbc/spfx-hb-webparts build`
- `pnpm --filter @hbc/spfx-hb-webparts test`

## Prompt-04 Readiness Outcome

- Top-band greeting and hero contracts are implemented, test-covered, and documented.
- Prompt-05 can focus on priority actions/work-hub behavior without reopening top-band policy.
