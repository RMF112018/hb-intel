# 08C — Discovery Test, Usage, and Handoff Guide

## Purpose

Capture Prompt-08 verification expectations and downstream usage guidance for smart search, wayfinding, and discovery surfaces.

## Usage Guidance

- Keep discovery scan-first and curated-first for homepage reliability and authorability.
- Use promoted destinations and quick paths for high-intent resource access.
- Keep imports constrained to `@hbc/ui-kit/homepage` and approved narrow shared seams.
- Treat advanced search intelligence as a future seam, not first-release dependency.

## Required Verification

- `pnpm --filter @hbc/spfx-hb-webparts check-types`
- `pnpm --filter @hbc/spfx-hb-webparts lint`
- `pnpm --filter @hbc/spfx-hb-webparts build`
- `pnpm --filter @hbc/spfx-hb-webparts test`

## Prompt-08 Readiness Outcome

- Smart search/wayfinding discovery contract is implemented, test-covered, and documented.
- Prompt-09 can focus on authoring/config governance and page composition without reopening discovery strategy decisions.
