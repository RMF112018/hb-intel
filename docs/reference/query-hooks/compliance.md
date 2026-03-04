# Compliance Hooks Reference

> **Package:** `@hb-intel/data-access` | **Domain:** Compliance

## Hooks

### `useComplianceEntries(projectId, options?)`
- **Type:** Query
- **Key:** `queryKeys.compliance.entries(projectId)`
- **Returns:** `UseQueryResult<ComplianceEntry[]>`
- **Description:** Fetches all compliance entries for a given project.

### `useComplianceEntryById(id: number)`
- **Type:** Query
- **Key:** `queryKeys.compliance.entry(id)`
- **Returns:** `UseQueryResult<ComplianceEntry>`
- **Description:** Fetches a single compliance entry by its numeric ID.

### `useCreateComplianceEntry()`
- **Type:** Mutation
- **Key:** Invalidates `queryKeys.compliance.entries(projectId)`
- **Returns:** `UseMutationResult<ComplianceEntry, Error, CreateComplianceEntryInput>`
- **Description:** Creates a new compliance entry.

### `useUpdateComplianceEntry()`
- **Type:** Mutation
- **Key:** Invalidates `queryKeys.compliance.entries(projectId)`, `queryKeys.compliance.entry(id)`
- **Returns:** `UseMutationResult<ComplianceEntry, Error, UpdateComplianceEntryInput>`
- **Description:** Updates an existing compliance entry.

### `useDeleteComplianceEntry()`
- **Type:** Mutation
- **Key:** Invalidates `queryKeys.compliance.entries(projectId)`
- **Returns:** `UseMutationResult<void, Error, number>`
- **Description:** Deletes a compliance entry by ID.

### `useComplianceSummary(projectId)`
- **Type:** Query
- **Key:** `queryKeys.compliance.summary(projectId)`
- **Returns:** `UseQueryResult<ComplianceSummary>`
- **Description:** Fetches aggregated compliance summary data for a project.

## Query Keys

| Key | Factory | Usage |
|-----|---------|-------|
| `compliance.all` | `queryKeys.compliance.all` | Top-level invalidation target for all compliance data |
| `compliance.entries(projectId)` | `queryKeys.compliance.entries(projectId)` | Entries list scoped to a project |
| `compliance.entry(id)` | `queryKeys.compliance.entry(id)` | Single entry by ID |
| `compliance.summary(projectId)` | `queryKeys.compliance.summary(projectId)` | Aggregated summary for a project |
