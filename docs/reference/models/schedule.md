# Schedule Models Reference

> Project activity tracking and schedule metrics.

**Package:** `@hbc/models` | **Module:** `schedule`
**Data-access port:** `IScheduleRepository`

## Interfaces

### `IScheduleActivity`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `number` | Activity identifier |
| `projectId` | `string` | Project identifier |
| `name` | `string` | Activity name |
| `startDate` | `string` | ISO-8601 start date |
| `endDate` | `string` | ISO-8601 end date |
| `percentComplete` | `number` | Completion (0–100) |
| `isCriticalPath` | `boolean` | On critical path? |

### `IScheduleMetrics`

| Field | Type | Description |
|-------|------|-------------|
| `projectId` | `string` | Project identifier |
| `totalActivities` | `number` | Total activities |
| `completedActivities` | `number` | Completed activities |
| `criticalPathVariance` | `number` | Variance in days |
| `overallPercentComplete` | `number` | Overall completion |

### Form Data

`IScheduleActivityFormData`

## Enums

### `ScheduleActivityStatus`

`NotStarted` | `InProgress` | `Completed` | `Delayed`

## Constants

| Constant | Description |
|----------|-------------|
| `SCHEDULE_STATUS_LABELS` | Human-readable status labels |

## Import Examples

```ts
import type { IScheduleActivity, IScheduleMetrics } from '@hbc/models';
import { ScheduleActivityStatus } from '@hbc/models/schedule';
```
