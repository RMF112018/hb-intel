# PMP Hooks Reference

> **Package:** `@hb-intel/data-access` | **Domain:** PMP (Project Management Plan)

## Hooks

### `usePmpPlans(projectId, options?)`
- **Type:** Query
- **Key:** `queryKeys.pmp.plans(projectId)`
- **Returns:** `UseQueryResult<PmpPlan[]>`
- **Description:** Fetches all PMP plans for a given project.

### `usePmpPlanById(id: number)`
- **Type:** Query
- **Key:** `queryKeys.pmp.plan(id)`
- **Returns:** `UseQueryResult<PmpPlan>`
- **Description:** Fetches a single PMP plan by its numeric ID.

### `useCreatePmpPlan()`
- **Type:** Mutation
- **Key:** Invalidates `queryKeys.pmp.plans(projectId)`
- **Returns:** `UseMutationResult<PmpPlan, Error, CreatePmpPlanInput>`
- **Description:** Creates a new PMP plan.

### `useUpdatePmpPlan()`
- **Type:** Mutation
- **Key:** Invalidates `queryKeys.pmp.plans(projectId)`, `queryKeys.pmp.plan(id)`
- **Returns:** `UseMutationResult<PmpPlan, Error, UpdatePmpPlanInput>`
- **Description:** Updates an existing PMP plan.

### `useDeletePmpPlan()`
- **Type:** Mutation
- **Key:** Invalidates `queryKeys.pmp.plans(projectId)`
- **Returns:** `UseMutationResult<void, Error, number>`
- **Description:** Deletes a PMP plan by ID.

### `usePmpSignatures(pmpId: number)`
- **Type:** Query
- **Key:** `queryKeys.pmp.signatures(pmpId)`
- **Returns:** `UseQueryResult<PmpSignature[]>`
- **Description:** Fetches the signature records for a specific PMP plan.

### `useCreatePmpSignature()`
- **Type:** Mutation
- **Key:** Invalidates `queryKeys.pmp.signatures(pmpId)`
- **Returns:** `UseMutationResult<PmpSignature, Error, CreatePmpSignatureInput>`
- **Description:** Creates a new signature entry for a PMP plan.

## Query Keys

| Key | Factory | Usage |
|-----|---------|-------|
| `pmp.all` | `queryKeys.pmp.all` | Top-level invalidation target for all PMP data |
| `pmp.plans(projectId)` | `queryKeys.pmp.plans(projectId)` | Plans list scoped to a project |
| `pmp.plan(id)` | `queryKeys.pmp.plan(id)` | Single plan by ID |
| `pmp.signatures(pmpId)` | `queryKeys.pmp.signatures(pmpId)` | Signatures for a specific PMP plan |
