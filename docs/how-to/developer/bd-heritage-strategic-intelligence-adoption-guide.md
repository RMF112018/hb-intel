> **Doc Classification:** Living Reference (Diátaxis) — How-to guide for adopting SF20 adapter over `@hbc/strategic-intelligence`.

# BD Heritage Strategic Intelligence Adoption Guide

## Purpose

Adopt `@hbc/features-business-development` as a Business Development adapter over `@hbc/strategic-intelligence` without re-implementing primitive lifecycle, trust, workflow, or redaction semantics.

## Integration Steps

1. Consume primitive contracts/hooks/APIs from `@hbc/strategic-intelligence`.
2. Consume adapter hooks/components from `@hbc/features-business-development`.
3. Keep trust/provenance/stale/workflow/sensitivity/conflict/replay ownership in primitive outputs.
4. Use adapter projection hooks/components for BD copy, complexity behavior, and role-context rendering only.
5. Use public testing exports from both packages; do not deep-import internal fixtures.

## Workflow Expectations

- Contributor submissions enter `pending-approval` through primitive-backed queue actions.
- Reject/revision actions require rationale and remain monotonic primitive transitions.
- Handoff completion gates require required acknowledgments and unresolved commitment clearance.
- Conflict/supersession resolution notes remain append-only governance events.
- Offline indicators (`Saved locally`, `Queued to sync`) and replay reconciliation are primitive-owned.

## Integration Expectations

- Use integration projections for BIC ownership, project-canvas placement, related items, notifications, acknowledgment, health, and SF19/SF22 interop.
- Preserve redacted projection behavior from primitive outputs for restricted contexts.
- Ensure search/index-bound outputs include approved entries only.

## Testing Fixture Usage

```ts
import {
  createMockStrategicIntelligenceEntry,
  createMockHeritageSnapshot,
  mockStrategicIntelligenceStates,
} from '@hbc/strategic-intelligence/testing';
import {
  createMockStrategicIntelligenceProfile,
  createMockBdStrategicIntelligenceView,
} from '@hbc/features-business-development/testing';
```

## Validation Commands

```bash
pnpm --filter @hbc/strategic-intelligence check-types
pnpm --filter @hbc/features-business-development check-types
pnpm --filter @hbc/strategic-intelligence test --coverage
pnpm --filter @hbc/features-business-development test --coverage
pnpm --filter @hbc/features-business-development storybook:test
pnpm --filter @hbc/features-business-development test:e2e
```

## Related Docs

- [SF20 Master Plan](/Users/bobbyfetting/hb-intel/docs/architecture/plans/shared-features/SF20-BD-Heritage-Panel.md)
- [SF20 API Reference](/Users/bobbyfetting/hb-intel/docs/reference/bd-heritage-strategic-intelligence/api.md)
- [ADR-0109](/Users/bobbyfetting/hb-intel/docs/architecture/adr/ADR-0109-bd-heritage-living-strategic-intelligence.md)
- [ADR-0113](/Users/bobbyfetting/hb-intel/docs/architecture/adr/ADR-0113-strategic-intelligence-primitive-runtime.md)
