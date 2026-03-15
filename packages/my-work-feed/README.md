# @hbc/my-work-feed

Cross-module My Work aggregation feed for HB Intel.

## Overview

`@hbc/my-work-feed` is the shared package that owns personal work-item aggregation across all HB Intel modules. It provides a unified feed surface where users see their actionable work items — approvals, tasks, reviews, deadlines — normalized from multiple source modules into a single prioritized stream.

The package acts as an orchestration layer: individual feature modules register as work-item sources via adapters, and the feed normalizes, prioritizes, and renders the combined result across multiple composite surfaces (badge, tile, panel, full feed).

## Purpose

My Work is a cross-module personal work orchestration layer. It does not own domain data — each source module retains authority over its own work items. Instead, `@hbc/my-work-feed` owns:

- the adapter registry that source modules plug into,
- normalization of heterogeneous work items into a canonical shape,
- count aggregation and priority scoring,
- the composite UI surfaces that render the unified feed,
- telemetry for feed engagement and source health.

## Adapter-Registry Architecture

Source modules (Accounting, Estimating, Safety, etc.) each implement a `MyWorkAdapter` that knows how to fetch and describe that module's work items. Adapters register with the central registry at app startup.

**Source-ownership boundaries:**
- Each adapter owns its own data fetching, error handling, and item shaping.
- The registry owns adapter lifecycle (register, unregister, health checks).
- The normalization layer owns the canonical `MyWorkItem` shape.
- The feed layer owns rendering, sorting, and count rollups.

No adapter may reach into another adapter's data. The registry is the only coordination point.

## Reuse-First Rule

All visual UI in this package composes primitives from `@hbc/ui-kit`. Components in `src/components/` are feed-specific compositions — they must not duplicate design-system-grade primitives (buttons, cards, badges, drawers, etc.) that already exist in `@hbc/ui-kit`.

If a new primitive is needed and it would be useful beyond My Work, it should be contributed to `@hbc/ui-kit` rather than built locally.

## Count Semantics

Counts flow through a defined hierarchy:

1. **Badge** (`HbcMyWorkBadge`) — shows the top-level unread/actionable count, visible in the app shell header.
2. **Launcher** (`HbcMyWorkLauncher`) — the entry point that opens the tile or panel; carries the badge count.
3. **Tile** (`HbcMyWorkTile`) — a compact summary card showing count breakdown by source or priority.
4. **Panel** (`HbcMyWorkPanel`) — a slide-out panel with the full item list, grouped and sorted.
5. **Full Feed** (`HbcMyWorkFeed`) — the dedicated page view with filtering, search, and team feed toggle.

Counts are computed from the normalized work-item set and are consistent across all surfaces — the badge count always equals the sum visible in the panel.

## Offline Model

`@hbc/session-state` owns offline cache persistence and the replay-safe mutation queue. `@hbc/my-work-feed` does not implement its own IndexedDB layer.

- Work items are cached via `@hbc/session-state` for offline availability.
- Mutations (dismiss, snooze, mark-done) are queued as replay-safe operations.
- On reconnect, the session-state sync engine replays queued mutations before refreshing the feed.
- The feed UI reflects optimistic updates immediately and reconciles on sync completion.

## Testing Entrypoint

The `@hbc/my-work-feed/testing` sub-path export provides test factories and mocks for consumers writing integration tests against the feed:

```ts
import { /* factories and mocks */ } from '@hbc/my-work-feed/testing';
```

This entrypoint is excluded from production bundles. It will be populated starting in T02 with typed factories for `MyWorkItem`, mock adapters, and mock registry instances.

## Exports

| Entry Point | Contents |
|-------------|----------|
| `@hbc/my-work-feed` | Types, constants, registry, normalization, adapters, API, hooks, store, components, telemetry |
| `@hbc/my-work-feed/testing` | Test factories and mocks (populated by T02+) |

## Architecture Boundaries

- **Adapter isolation** — adapters must not import from each other; the registry is the only coordination point.
- **No direct data ownership** — this package normalizes and renders; source modules own their domain data.
- **No prohibited imports** — `@hbc/my-work-feed` must not import from `packages/features/*` directly.
- **Reuse-first UI** — compose `@hbc/ui-kit` primitives; do not duplicate design-system-grade components.
- **Peer dependencies only** — `react` and `react-dom`.
- **Public barrel only** — consumers import from `@hbc/my-work-feed` or `@hbc/my-work-feed/testing`, never from internal file paths.

## Related

- [SF29 Master Plan](../../docs/architecture/plans/shared-features/SF29-My-Work-Feed.md)
- [SF29-T09 — Testing and Deployment](../../docs/architecture/plans/shared-features/SF29-T09-Testing-and-Deployment.md)
- [ADR-0114 — My Work Feed Architecture](../../docs/architecture/adr/ADR-0114-my-work-feed-architecture.md)
