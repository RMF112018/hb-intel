# Scorecard Models Reference

> Go/No-Go evaluation and version history.

**Package:** `@hbc/models` | **Module:** `scorecard`
**Data-access port:** `IScorecardRepository`

## Interfaces

### `IGoNoGoScorecard`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `number` | Scorecard identifier |
| `projectId` | `string` | Project identifier |
| `version` | `number` | Version number |
| `overallScore` | `number` | Overall score (0–100) |
| `recommendation` | `string` | Final recommendation |
| `createdAt` | `string` | ISO-8601 creation timestamp |
| `updatedAt` | `string` | ISO-8601 updated timestamp |

### `IScorecardVersion`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `number` | Version record identifier |
| `scorecardId` | `number` | Parent scorecard |
| `version` | `number` | Version number |
| `snapshot` | `Record<string, unknown>` | Full data snapshot |
| `createdAt` | `string` | ISO-8601 creation timestamp |

### Form Data

`IScorecardFormData`

## Enums

### `ScorecardRecommendation`

`Go` | `NoGo` | `Conditional` | `Deferred`

## Constants

| Constant | Description |
|----------|-------------|
| `SCORECARD_RECOMMENDATION_LABELS` | Human-readable recommendation labels |
| `SCORECARD_GO_THRESHOLD` | Score for "Go" recommendation (70) |
| `SCORECARD_NOGO_THRESHOLD` | Score for "No-Go" recommendation (40) |

## Import Examples

```ts
import type { IGoNoGoScorecard } from '@hbc/models';
import { ScorecardRecommendation } from '@hbc/models/scorecard';
```
