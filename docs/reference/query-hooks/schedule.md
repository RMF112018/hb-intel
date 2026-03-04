# Schedule Hooks Reference

> **Package:** `@hb-intel/data-access` | **Domain:** Schedule

## Hooks

### `useScheduleActivities(projectId, options?)`
- **Type:** Query
- **Key:** `queryKeys.schedule.activities(projectId)`
- **Returns:** `UseQueryResult<ScheduleActivity[]>`
- **Description:** Fetches all schedule activities for a given project.

### `useScheduleActivityById(id: number)`
- **Type:** Query
- **Key:** `queryKeys.schedule.activity(id)`
- **Returns:** `UseQueryResult<ScheduleActivity>`
- **Description:** Fetches a single schedule activity by its numeric ID.

### `useCreateScheduleActivity()`
- **Type:** Mutation
- **Key:** Invalidates `queryKeys.schedule.activities(projectId)`
- **Returns:** `UseMutationResult<ScheduleActivity, Error, CreateScheduleActivityInput>`
- **Description:** Creates a new schedule activity.

### `useUpdateScheduleActivity()`
- **Type:** Mutation
- **Key:** Invalidates `queryKeys.schedule.activities(projectId)`, `queryKeys.schedule.activity(id)`
- **Returns:** `UseMutationResult<ScheduleActivity, Error, UpdateScheduleActivityInput>`
- **Description:** Updates an existing schedule activity.

### `useDeleteScheduleActivity()`
- **Type:** Mutation
- **Key:** Invalidates `queryKeys.schedule.activities(projectId)`
- **Returns:** `UseMutationResult<void, Error, number>`
- **Description:** Deletes a schedule activity by ID.

### `useScheduleMetrics(projectId)`
- **Type:** Query
- **Key:** `queryKeys.schedule.metrics(projectId)`
- **Returns:** `UseQueryResult<ScheduleMetrics>`
- **Description:** Fetches aggregated schedule metrics for a project.

## Query Keys

| Key | Factory | Usage |
|-----|---------|-------|
| `schedule.all` | `queryKeys.schedule.all` | Top-level invalidation target for all schedule data |
| `schedule.activities(projectId)` | `queryKeys.schedule.activities(projectId)` | Activities list scoped to a project |
| `schedule.activity(id)` | `queryKeys.schedule.activity(id)` | Single activity by ID |
| `schedule.metrics(projectId)` | `queryKeys.schedule.metrics(projectId)` | Aggregated metrics for a project |
