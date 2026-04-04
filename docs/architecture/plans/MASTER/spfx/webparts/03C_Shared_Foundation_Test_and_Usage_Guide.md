# 03C — Shared Foundation Test and Usage Guide

## Purpose

Describe the minimum verification and usage expectations for the Prompt-03 shared homepage foundation.

## Required Test Coverage

- Greeting/time helper determinism (`resolveGreetingForHour`, `resolveGreetingAt`).
- First-name resolution seam behavior.
- Config normalization defaults and guardrails.
- Shared primitive accessibility semantics (section region, loading status, empty-state rendering).

## Reference Composition

`apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx` is the canonical non-placeholder composition sample for Prompt-03. It demonstrates:

- coordinated section/rail composition,
- editorial + utility + spotlight + people card usage,
- shared helper/model consumption,
- light-theme-first runtime via homepage-safe theme provider.

## Verification Commands

- `pnpm --filter @hbc/spfx-hb-webparts check-types`
- `pnpm --filter @hbc/spfx-hb-webparts lint`
- `pnpm --filter @hbc/spfx-hb-webparts build`
- `pnpm --filter @hbc/spfx-hb-webparts test`

## Prompt-03 Readiness Outcome

Prompt-04+ implementation may now focus on feature behavior and authored content because shared layout/state/helpers are already scaffolded and test-covered.
