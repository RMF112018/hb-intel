# Scorecard Hooks Reference

> **Package:** `@hb-intel/data-access` | **Domain:** Scorecard

## Hooks

### `useScorecards(projectId, options?)`
- **Type:** Query
- **Key:** `queryKeys.scorecard.scorecards(projectId)`
- **Returns:** `UseQueryResult<Scorecard[]>`
- **Description:** Fetches all scorecards for a given project.

### `useScorecardById(id: number)`
- **Type:** Query
- **Key:** `queryKeys.scorecard.detail(id)`
- **Returns:** `UseQueryResult<Scorecard>`
- **Description:** Fetches a single scorecard by its numeric ID.

### `useSubmitDecision()`
- **Type:** Mutation
- **Key:** Invalidates `queryKeys.scorecard.scorecards(projectId)`, `queryKeys.scorecard.detail(id)`
- **Returns:** `UseMutationResult<Scorecard, Error, SubmitDecisionInput>`
- **Description:** Submits a go/no-go decision for a scorecard.

### `useUpdateScorecard()`
- **Type:** Mutation
- **Key:** Invalidates `queryKeys.scorecard.all`
- **Returns:** `UseMutationResult<Scorecard, Error, { id: number; data: Partial<Scorecard> }>`
- **Description:** Updates an existing scorecard by ID with partial data.

### `useDeleteScorecard()`
- **Type:** Mutation
- **Key:** Invalidates `queryKeys.scorecard.all`
- **Returns:** `UseMutationResult<void, Error, number>`
- **Description:** Deletes a scorecard by its numeric ID.

### `useScorecardVersions(scorecardId: number)`
- **Type:** Query
- **Key:** `queryKeys.scorecard.versions(scorecardId)`
- **Returns:** `UseQueryResult<ScorecardVersion[]>`
- **Description:** Fetches the version history for a specific scorecard.

## Query Keys

| Key | Factory | Usage |
|-----|---------|-------|
| `scorecard.all` | `queryKeys.scorecard.all` | Top-level invalidation target for all scorecard data |
| `scorecard.scorecards(projectId)` | `queryKeys.scorecard.scorecards(projectId)` | Scorecards list scoped to a project |
| `scorecard.detail(id)` | `queryKeys.scorecard.detail(id)` | Single scorecard by ID |
| `scorecard.versions(scorecardId)` | `queryKeys.scorecard.versions(scorecardId)` | Version history for a scorecard |
