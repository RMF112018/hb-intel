# Buyout Hooks Reference

> **Package:** `@hb-intel/data-access` | **Domain:** Buyout

## Hooks

### `useBuyoutLog(projectId, options?)`
- **Type:** Query
- **Key:** `queryKeys.buyout.entries(projectId)`
- **Returns:** `UseQueryResult<BuyoutEntry[]>`
- **Description:** Fetches the buyout log entries for a given project.

### `useBuyoutEntryById(id: number)`
- **Type:** Query
- **Key:** `queryKeys.buyout.entry(id)`
- **Returns:** `UseQueryResult<BuyoutEntry>`
- **Description:** Fetches a single buyout entry by its numeric ID.

### `useCreateBuyoutEntry()`
- **Type:** Mutation
- **Key:** Invalidates `queryKeys.buyout.entries(projectId)`
- **Returns:** `UseMutationResult<BuyoutEntry, Error, CreateBuyoutEntryInput>`
- **Description:** Creates a new buyout entry.

### `useUpdateBuyoutEntry()`
- **Type:** Mutation
- **Key:** Invalidates `queryKeys.buyout.entries(projectId)`, `queryKeys.buyout.entry(id)`
- **Returns:** `UseMutationResult<BuyoutEntry, Error, UpdateBuyoutEntryInput>`
- **Description:** Updates an existing buyout entry.

### `useDeleteBuyoutEntry()`
- **Type:** Mutation
- **Key:** Invalidates `queryKeys.buyout.entries(projectId)`
- **Returns:** `UseMutationResult<void, Error, number>`
- **Description:** Deletes a buyout entry by ID.

### `useBuyoutSummary(projectId)`
- **Type:** Query
- **Key:** `queryKeys.buyout.summary(projectId)`
- **Returns:** `UseQueryResult<BuyoutSummary>`
- **Description:** Fetches aggregated buyout summary data for a project.

## Query Keys

| Key | Factory | Usage |
|-----|---------|-------|
| `buyout.all` | `queryKeys.buyout.all` | Top-level invalidation target for all buyout data |
| `buyout.entries(projectId)` | `queryKeys.buyout.entries(projectId)` | Entries list scoped to a project |
| `buyout.entry(id)` | `queryKeys.buyout.entry(id)` | Single entry by ID |
| `buyout.summary(projectId)` | `queryKeys.buyout.summary(projectId)` | Aggregated summary for a project |
