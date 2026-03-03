# Estimating Models Reference

> Bid tracking and estimating kickoff management.

**Package:** `@hbc/models` | **Module:** `estimating`
**Data-access port:** `IEstimatingRepository`

## Interfaces

### `IEstimatingTracker`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `number` | Tracker identifier |
| `projectId` | `string` | Project identifier |
| `bidNumber` | `string` | Bid / proposal number |
| `status` | `string` | Estimate status |
| `dueDate` | `string` | ISO-8601 due date |
| `createdAt` | `string` | ISO-8601 creation timestamp |
| `updatedAt` | `string` | ISO-8601 updated timestamp |

### `IEstimatingKickoff`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `number` | Kickoff identifier |
| `projectId` | `string` | Project identifier |
| `kickoffDate` | `string` | ISO-8601 kickoff date |
| `attendees` | `string[]` | Attendee names |
| `notes` | `string` | Meeting notes |
| `createdAt` | `string` | ISO-8601 creation timestamp |

### Form Data

`IEstimatingTrackerFormData`, `IEstimatingKickoffFormData`

## Enums

### `EstimatingStatus`

`Draft` | `InProgress` | `Submitted` | `Awarded` | `Lost`

## Constants

| Constant | Description |
|----------|-------------|
| `ESTIMATING_STATUS_LABELS` | Human-readable status labels |

## Import Examples

```ts
import type { IEstimatingTracker } from '@hbc/models';
import { EstimatingStatus } from '@hbc/models/estimating';
```
