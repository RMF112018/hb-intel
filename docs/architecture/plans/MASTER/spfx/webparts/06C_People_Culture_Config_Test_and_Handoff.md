# 06C — People & Culture Config, Test, and Handoff Guide

## Purpose

Capture Prompt-06 people/culture configuration rules, test expectations, and downstream handoff for awareness-zone continuity.

## Configuration Expectations

- Supports authored events for new hires, anniversaries, promotions, and recognition.
- Curates one featured people/culture item plus bounded secondary entries.
- Applies optional audience filtering before hierarchy rendering.
- Handles optional media safely using alt-text requirements.

## Required Verification

- `pnpm --filter @hbc/spfx-hb-webparts check-types`
- `pnpm --filter @hbc/spfx-hb-webparts lint`
- `pnpm --filter @hbc/spfx-hb-webparts build`
- `pnpm --filter @hbc/spfx-hb-webparts test`

## Prompt-06 Readiness Outcome

- Company pulse, leadership message, and people/culture contracts are implemented and test-covered.
- Prompt-07 can focus on project/portfolio spotlight and safety field excellence without reopening awareness-zone policy.
