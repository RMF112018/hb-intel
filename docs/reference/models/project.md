# Project Models Reference

> Active project context and portfolio summary.

**Package:** `@hbc/models` | **Module:** `project`
**Data-access port:** `IProjectRepository`

## Interfaces

### `IActiveProject`

The currently active project within the user's session.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique project identifier (UUID) |
| `name` | `string` | Project display name |
| `number` | `string` | Project number / code |
| `status` | `string` | Current project status |
| `startDate` | `string` | ISO-8601 start date |
| `endDate` | `string` | ISO-8601 end date |

### `IPortfolioSummary`

| Field | Type | Description |
|-------|------|-------------|
| `totalProjects` | `number` | Total projects in portfolio |
| `activeProjects` | `number` | Currently active projects |
| `totalContractValue` | `number` | Sum of contract values (USD) |
| `averagePercentComplete` | `number` | Weighted average completion |

### `IProjectFormData`

Form input for creating or editing a project.

## Enums

### `ProjectStatus`

| Value | Description |
|-------|-------------|
| `Active` | Under construction / management |
| `OnHold` | Temporarily paused |
| `Completed` | Completed and closed out |
| `Cancelled` | Cancelled before completion |

## Type Aliases

| Type | Definition | Description |
|------|-----------|-------------|
| `ProjectId` | `string` | Project identifier (UUID) |
| `ProjectNumber` | `string` | Project number string |
| `ProjectSearchCriteria` | `object` | Filters for project queries |

## Constants

| Constant | Description |
|----------|-------------|
| `PROJECT_STATUS_LABELS` | Human-readable status labels |
| `ACTIVE_PROJECT_STATUSES` | Statuses representing active work |

## Import Examples

```ts
import type { IActiveProject, IPortfolioSummary } from '@hbc/models';
import { ProjectStatus } from '@hbc/models/project';
```
