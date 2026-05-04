# Prompt 13E — SPFx Fixture Integration Into Core Surfaces

## Objective

Wire Procore data-layer fixture/read-model outputs into PCC core surfaces through existing read-model seams.

## Required Work

1. Add Project Home Procore mapping/sync/status/signal card(s).
2. Add Priority Actions Procore-derived candidates.
3. Add Project Readiness Procore impact/source-confidence display.
4. Add External Systems Procore configuration/status posture.
5. Add Site Health Procore sync/repair posture.
6. Add degraded states for unmapped, stale, permission-denied, tool-disabled, rate-limited, partial-sync, and backend-unavailable.
7. Preserve bento/direct-child and no-runtime guards.

## Forbidden

No direct Procore links required for MVP, no enabled mutation buttons, no live Procore fetch, no file actions.

## Validation

Run @hbc/spfx-project-control-center check-types/test/build and lockfile MD5 proof.
