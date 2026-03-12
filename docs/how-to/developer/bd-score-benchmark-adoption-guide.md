> **Doc Classification:** Living Reference (Diátaxis) — How-to guide for adopting SF19 adapter over `@hbc/score-benchmark`.

# BD Score Benchmark Adoption Guide

## Purpose

Adopt `@hbc/features-business-development` as a Business Development adapter over `@hbc/score-benchmark` without re-implementing primitive benchmark semantics.

## Integration Steps

1. Consume canonical primitive contracts/hooks/APIs from `@hbc/score-benchmark`.
2. Consume adapter hooks/components from `@hbc/features-business-development`.
3. Configure profile defaults and recommendation/no-bid copy in BD adapter projection surfaces only.
4. Preserve primitive ownership for confidence/similarity/recommendation/governance/recalibration/telemetry semantics.
5. Use testing exports from `@hbc/score-benchmark/testing` and `@hbc/features-business-development/testing` for deterministic test and story fixtures.

## Workflow Expectations

- Recommendation and no-bid rationale workflows must preserve citation + approval requirements and immutable artifact capture.
- Confidence/similarity/governance expectations are primitive contracts; adapter only maps and presents them.
- Complexity behavior is adapter-projected from approved complexity contracts.
- Offline/sync states must surface `Saved locally` and `Queued to sync` from primitive state.
- HBI actions must preserve citation, approval, and governed artifact requirements.

## Testing Fixture Usage

Use primitive fixtures for domain-canonical states and adapter fixtures for BD projection states:

```ts
import {
  createMockScoreGhostOverlayState,
  mockScoreBenchmarkStates,
} from '@hbc/score-benchmark/testing';
import {
  createMockScoreBenchmarkProfile,
  createMockBdScoreBenchmarkView,
} from '@hbc/features-business-development/testing';
```

## Validation Commands

```bash
pnpm --filter @hbc/score-benchmark check-types
pnpm --filter @hbc/features-business-development check-types
pnpm --filter @hbc/score-benchmark test --coverage
pnpm --filter @hbc/features-business-development test --coverage
pnpm --filter @hbc/features-business-development storybook:test
pnpm --filter @hbc/features-business-development test:e2e -- score-benchmark
```

## Related Docs

- [SF19 Master Plan](/Users/bobbyfetting/hb-intel/docs/architecture/plans/shared-features/SF19-BD-Score-Benchmark.md)
- [SF19 API Reference](/Users/bobbyfetting/hb-intel/docs/reference/bd-score-benchmark/api.md)
- [ADR-0108](/Users/bobbyfetting/hb-intel/docs/architecture/adr/ADR-0108-bd-score-benchmark-ghost-overlay.md)
- [ADR-0112](/Users/bobbyfetting/hb-intel/docs/architecture/adr/ADR-0112-score-benchmark-primitive-runtime.md)
