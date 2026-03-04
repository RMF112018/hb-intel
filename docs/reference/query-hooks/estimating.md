# Estimating Hooks Reference

> **Package:** `@hb-intel/data-access` | **Domain:** Estimating

## Hooks

### `useEstimatingTrackers(options?)`
- **Type:** Query
- **Key:** `queryKeys.estimating.trackers(options)`
- **Returns:** `UseQueryResult<EstimatingTracker[]>`
- **Description:** Fetches a filtered/paginated list of estimating trackers.

### `useEstimatingTrackerById(id: number)`
- **Type:** Query
- **Key:** `queryKeys.estimating.tracker(id)`
- **Returns:** `UseQueryResult<EstimatingTracker>`
- **Description:** Fetches a single estimating tracker by its numeric ID.

### `useCreateEstimatingTracker()`
- **Type:** Mutation
- **Key:** Invalidates `queryKeys.estimating.trackers()`
- **Returns:** `UseMutationResult<EstimatingTracker, Error, CreateEstimatingTrackerInput>`
- **Description:** Creates a new estimating tracker.

### `useUpdateEstimatingTracker()`
- **Type:** Mutation
- **Key:** Invalidates `queryKeys.estimating.trackers()`, `queryKeys.estimating.tracker(id)`
- **Returns:** `UseMutationResult<EstimatingTracker, Error, UpdateEstimatingTrackerInput>`
- **Description:** Updates an existing estimating tracker.

### `useDeleteEstimatingTracker()`
- **Type:** Mutation
- **Key:** Invalidates `queryKeys.estimating.trackers()`
- **Returns:** `UseMutationResult<void, Error, number>`
- **Description:** Deletes an estimating tracker by ID.

### `useEstimatingKickoff(projectId)`
- **Type:** Query
- **Key:** `queryKeys.estimating.kickoff(projectId)`
- **Returns:** `UseQueryResult<EstimatingKickoff>`
- **Description:** Fetches the estimating kickoff data for a project.

### `useCreateEstimatingKickoff()`
- **Type:** Mutation
- **Key:** Invalidates `queryKeys.estimating.kickoff(projectId)`
- **Returns:** `UseMutationResult<EstimatingKickoff, Error, CreateEstimatingKickoffInput>`
- **Description:** Creates a new estimating kickoff record.

## Query Keys

| Key | Factory | Usage |
|-----|---------|-------|
| `estimating.all` | `queryKeys.estimating.all` | Top-level invalidation target for all estimating data |
| `estimating.trackers(opts)` | `queryKeys.estimating.trackers(opts)` | Filtered/paginated tracker list |
| `estimating.tracker(id)` | `queryKeys.estimating.tracker(id)` | Single tracker by ID |
| `estimating.kickoff(projectId)` | `queryKeys.estimating.kickoff(projectId)` | Kickoff data scoped to a project |
