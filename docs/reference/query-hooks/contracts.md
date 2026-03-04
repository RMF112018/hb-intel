# Contracts Hooks Reference

> **Package:** `@hb-intel/data-access` | **Domain:** Contracts

## Hooks

### `useContracts(projectId, options?)`
- **Type:** Query
- **Key:** `queryKeys.contracts.contracts(projectId)`
- **Returns:** `UseQueryResult<Contract[]>`
- **Description:** Fetches all contracts for a given project.

### `useContractById(id: number)`
- **Type:** Query
- **Key:** `queryKeys.contracts.contract(id)`
- **Returns:** `UseQueryResult<Contract>`
- **Description:** Fetches a single contract by its numeric ID.

### `useCreateContract()`
- **Type:** Mutation
- **Key:** Invalidates `queryKeys.contracts.contracts(projectId)`
- **Returns:** `UseMutationResult<Contract, Error, CreateContractInput>`
- **Description:** Creates a new contract.

### `useUpdateContract()`
- **Type:** Mutation
- **Key:** Invalidates `queryKeys.contracts.contracts(projectId)`, `queryKeys.contracts.contract(id)`
- **Returns:** `UseMutationResult<Contract, Error, UpdateContractInput>`
- **Description:** Updates an existing contract.

### `useDeleteContract()`
- **Type:** Mutation
- **Key:** Invalidates `queryKeys.contracts.contracts(projectId)`
- **Returns:** `UseMutationResult<void, Error, number>`
- **Description:** Deletes a contract by ID.

### `useContractApprovals(contractId: number)`
- **Type:** Query
- **Key:** `queryKeys.contracts.approvals(contractId)`
- **Returns:** `UseQueryResult<ContractApproval[]>`
- **Description:** Fetches the approval chain for a specific contract.

### `useCreateContractApproval()`
- **Type:** Mutation
- **Key:** Invalidates `queryKeys.contracts.approvals(contractId)`
- **Returns:** `UseMutationResult<ContractApproval, Error, CreateContractApprovalInput>`
- **Description:** Creates a new approval entry for a contract.

## Query Keys

| Key | Factory | Usage |
|-----|---------|-------|
| `contracts.all` | `queryKeys.contracts.all` | Top-level invalidation target for all contract data |
| `contracts.contracts(projectId)` | `queryKeys.contracts.contracts(projectId)` | Contracts list scoped to a project |
| `contracts.contract(id)` | `queryKeys.contracts.contract(id)` | Single contract by ID |
| `contracts.approvals(contractId)` | `queryKeys.contracts.approvals(contractId)` | Approval chain for a contract |
