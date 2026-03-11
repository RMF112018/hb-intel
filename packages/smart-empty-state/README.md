# @hbc/smart-empty-state

Context-aware empty state classification and guided onboarding for HB Intel modules.

## Overview

This Tier 2 shared-feature package provides intelligent empty state detection that distinguishes between "truly empty" states (no data exists), "not-yet-configured" states (setup required), and "filtered-to-zero" states (data exists but is filtered away). It delivers contextual onboarding guidance appropriate to each classification.

## Exports

| Entry Point | Description |
|-------------|-------------|
| `@hbc/smart-empty-state` | Main barrel — types, constants, classification, hooks, components |
| `@hbc/smart-empty-state/testing` | Test fixtures and factories for consumer packages |

## Main Exports

| Export | Type | Description |
|--------|------|-------------|
| `EmptyStateClassification` | Type | Union of classification values |
| `ISmartEmptyStateConfig` | Interface | Configuration for the classification resolver |
| `EMPTY_STATE_DEFAULTS` | Const | Default configuration values |
| `classifyEmptyState` | Function | Core classification logic |
| `IEmptyStateVisitStore` | Interface | Adapter for visit tracking (D-04) |
| `noopVisitStore` | Const | No-op visit store implementation |
| `useFirstVisit` | Hook | First-visit detection |
| `useEmptyState` | Hook | Combined empty state hook |
| `HbcSmartEmptyState` | Component | Primary empty state display |
| `HbcEmptyStateIllustration` | Component | Illustration renderer |

## Testing Sub-path

Import from `@hbc/smart-empty-state/testing` for test utilities:

```ts
import {
  createMockEmptyStateContext,
  createMockEmptyStateConfig,
  mockEmptyStateClassifications,
} from '@hbc/smart-empty-state/testing';
```

## Peer Dependencies

- `react` ^18.3.0
- `react-dom` ^18.3.0
- `@hbc/complexity` workspace:*
- `@hbc/ui-kit` workspace:*

## Scripts

```bash
pnpm --filter @hbc/smart-empty-state build        # Build
pnpm --filter @hbc/smart-empty-state check-types   # Type check
pnpm --filter @hbc/smart-empty-state test          # Run tests
pnpm --filter @hbc/smart-empty-state test:coverage # Run tests with coverage
pnpm --filter @hbc/smart-empty-state lint          # Lint
```
