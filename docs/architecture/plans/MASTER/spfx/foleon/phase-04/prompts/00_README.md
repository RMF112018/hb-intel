# Foleon Full-Window Viewer Prompt Package

## Purpose

This package inserts a new shared interaction layer before Prompt 05.

The desired product behavior is:

> Each Foleon article/card on the homepage should be directly interactive. When a user clicks a card, the selected Foleon document opens in a full-window, immersive viewer instead of relying on a passive embedded iframe inside the homepage lane.

## Why this must happen before Prompt 05

Project Spotlight and Company Pulse already have lane-owned compositions. Leadership Message should not be redesigned on the old interaction model. Before Prompt 05, the repo needs a shared viewer contract that Leadership can consume without duplicating logic.

## Recommended Execution Order

1. `PROMPT_04A_SHARED_FOLEON_FULL_WINDOW_VIEWER_CONTRACT.md`
2. `PROMPT_04B_RETROFIT_PROJECT_SPOTLIGHT_AND_COMPANY_PULSE_CLICKABLE_CARDS.md`
3. `PROMPT_04C_FULL_WINDOW_VIEWER_TESTING_PACKAGE_AND_HOSTED_PROOF.md`

## Expected Version Direction

The current baseline is `1.1.84.0`.

- Prompt 04A likely bumps lockstep to `1.1.85.0` because it adds shared TS/CSS viewer behavior.
- Prompt 04B likely bumps lockstep to `1.1.86.0` because it changes Project Spotlight and Company Pulse interaction behavior.
- Prompt 04C may not require a version bump if it only adds tests/docs/proof, but the agent must follow repo version authority.

## Critical Product Rule

Do not fabricate article cards in ready state.

If the current Foleon content schema exposes only one active record per lane, then only that active record should be directly clickable in ready state. Multi-card ready-state digest behavior requires a real multi-record source, archive feed, or future content model change.

Preview state may show sample cards only when clearly labeled as preview/sample content.
