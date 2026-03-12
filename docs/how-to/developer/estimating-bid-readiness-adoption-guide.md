# Estimating Bid Readiness Adoption Guide

## Purpose

Adopt `@hbc/features-estimating` as an Estimating-specific adapter over `@hbc/health-indicator` without re-implementing readiness runtime logic.

## Integration Steps

1. Consume canonical primitive contracts from `@hbc/health-indicator`.
2. Consume adapter hooks/components from `@hbc/features-estimating`.
3. Use estimating profile defaults and admin overrides through adapter exports.
4. Keep scoring/evaluation runtime ownership in `@hbc/health-indicator`.
5. Use `@hbc/features-estimating/testing` fixtures for deterministic tests.

## Do / Do Not

- Do keep UI composition and domain mapping in Estimating.
- Do not fork scoring/profile/telemetry runtime logic in downstream apps.
- Do preserve governance/version metadata across config changes.
- Do keep offline indicators user-visible for queued/local states.

## Validation Commands

From repository root:

```bash
pnpm --filter @hbc/features-estimating check-types
pnpm --filter @hbc/features-estimating lint
pnpm --filter @hbc/features-estimating build
pnpm --filter @hbc/features-estimating test:coverage
pnpm --filter @hbc/features-estimating verify:boundaries
pnpm --filter @hbc/features-estimating verify:docs
```

## Related Docs

- [API Reference](/Users/bobbyfetting/hb-intel/docs/reference/estimating/api.md)
- [SF18 Master Plan](/Users/bobbyfetting/hb-intel/docs/architecture/plans/shared-features/SF18-Estimating-Bid-Readiness.md)
