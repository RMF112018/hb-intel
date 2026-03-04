# Risk Hooks Reference

> **Package:** `@hb-intel/data-access` | **Domain:** Risk

## Hooks

### `useRiskItems(projectId, options?)`
- **Type:** Query
- **Key:** `queryKeys.risk.items(projectId)`
- **Returns:** `UseQueryResult<RiskItem[]>`
- **Description:** Fetches all risk items for a given project.

### `useRiskItemById(id: number)`
- **Type:** Query
- **Key:** `queryKeys.risk.item(id)`
- **Returns:** `UseQueryResult<RiskItem>`
- **Description:** Fetches a single risk item by its numeric ID.

### `useCreateRiskItem()`
- **Type:** Mutation
- **Key:** Invalidates `queryKeys.risk.items(projectId)`
- **Returns:** `UseMutationResult<RiskItem, Error, CreateRiskItemInput>`
- **Description:** Creates a new risk item.

### `useUpdateRiskItem()`
- **Type:** Mutation
- **Key:** Invalidates `queryKeys.risk.items(projectId)`, `queryKeys.risk.item(id)`
- **Returns:** `UseMutationResult<RiskItem, Error, UpdateRiskItemInput>`
- **Description:** Updates an existing risk item.

### `useDeleteRiskItem()`
- **Type:** Mutation
- **Key:** Invalidates `queryKeys.risk.items(projectId)`
- **Returns:** `UseMutationResult<void, Error, number>`
- **Description:** Deletes a risk item by ID.

### `useRiskManagement(projectId)`
- **Type:** Query
- **Key:** `queryKeys.risk.management(projectId)`
- **Returns:** `UseQueryResult<RiskManagement>`
- **Description:** Fetches the risk management overview for a project.

## Query Keys

| Key | Factory | Usage |
|-----|---------|-------|
| `risk.all` | `queryKeys.risk.all` | Top-level invalidation target for all risk data |
| `risk.items(projectId)` | `queryKeys.risk.items(projectId)` | Risk items list scoped to a project |
| `risk.item(id)` | `queryKeys.risk.item(id)` | Single risk item by ID |
| `risk.management(projectId)` | `queryKeys.risk.management(projectId)` | Risk management overview for a project |
