> **Doc Classification:** Living Reference (Diátaxis) — How-to guide for adopting `@hbc/my-work-feed`.

# My Work Feed Adoption Guide

## Purpose

Adopt `@hbc/my-work-feed` as the canonical personal work aggregation feed without re-implementing normalization, ranking, or count logic.

## Integration Steps

1. Register a source adapter via `MyWorkRegistry.register()` — the adapter must implement `IMyWorkSourceAdapter` with `source`, `isEnabled()`, and `load()`.
2. Wrap the consuming app surface with `MyWorkProvider` to establish runtime context (user ID, roles, complexity tier, offline state).
3. Consume feed data via hooks: `useMyWork` for items, `useMyWorkCounts` for badge/count surfaces, `useMyWorkPanel` for grouped panel views.
4. Render composite components (`HbcMyWorkBadge`, `HbcMyWorkTile`, `HbcMyWorkPanel`, `HbcMyWorkFeed`) — all compose `@hbc/ui-kit` primitives.
5. Use testing exports from `@hbc/my-work-feed/testing` for deterministic test and story fixtures.

## Workflow Expectations

- **Adapter ownership:** Each source module owns its adapter's data fetching, error handling, and item shaping. Adapters must not import from each other.
- **Offline:** Mutations (dismiss, snooze, mark-done) are queued as replay-safe operations via `@hbc/session-state`. The feed reflects optimistic updates immediately.
- **Complexity:** Components respect the complexity tier from `IMyWorkRuntimeContext`. Essential tier surfaces fewer details; expert tier exposes full explainability.
- **Inline actions:** Work items expose typed `availableActions`. Inline actions that are `offlineCapable` are queued when offline; others show a deep-link via `context.href`.

## Testing Fixture Usage

Use the testing sub-path export for deterministic factories and scenario fixtures:

```ts
import {
  createMockMyWorkItem,
  createMockMyWorkQuery,
  createMockMyWorkFeedResult,
  createMockSourceAdapter,
  createMockRegistryEntry,
  createMockRuntimeContext,
  createMockMyWorkTeamScenario,
  mockMyWorkScenarios,
  mockItemClasses,
  mockPriorityLanes,
  mockStates,
} from '@hbc/my-work-feed/testing';
```

## Validation Commands

```bash
pnpm --filter @hbc/my-work-feed check-types
pnpm --filter @hbc/my-work-feed test:coverage
pnpm --filter @hbc/my-work-feed build
pnpm --filter @hbc/my-work-feed storybook
```

## Related Docs

- [SF29 Master Plan](/Users/bobbyfetting/hb-intel/docs/architecture/plans/shared-features/SF29-My-Work-Feed.md)
- [My Work Feed API Reference](/Users/bobbyfetting/hb-intel/docs/reference/my-work-feed/api.md)
- [ADR-0115](/Users/bobbyfetting/hb-intel/docs/architecture/adr/ADR-0115-my-work-feed-architecture.md)
