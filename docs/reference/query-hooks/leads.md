# Leads Hooks Reference

> **Package:** `@hb-intel/data-access` | **Domain:** Leads

## Hooks

### `useLeads(options?)`
- **Type:** Query
- **Key:** `queryKeys.leads.list(options)`
- **Returns:** `UseQueryResult<Lead[]>`
- **Description:** Fetches a filtered/paginated list of leads.

### `useLeadById(id: number)`
- **Type:** Query
- **Key:** `queryKeys.leads.detail(id)`
- **Returns:** `UseQueryResult<Lead>`
- **Description:** Fetches a single lead by its numeric ID.

### `useCreateLead()`
- **Type:** Mutation
- **Key:** Invalidates `queryKeys.leads.lists()`
- **Returns:** `UseMutationResult<Lead, Error, CreateLeadInput>`
- **Description:** Creates a new lead record.

### `useUpdateLead()`
- **Type:** Mutation
- **Key:** Invalidates `queryKeys.leads.lists()`, `queryKeys.leads.detail(id)`
- **Returns:** `UseMutationResult<Lead, Error, UpdateLeadInput>`
- **Description:** Updates an existing lead.

### `useDeleteLead()`
- **Type:** Mutation
- **Key:** Invalidates `queryKeys.leads.lists()`
- **Returns:** `UseMutationResult<void, Error, number>`
- **Description:** Deletes a lead by ID.

### `useSearchLeads(query, options?)`
- **Type:** Query
- **Key:** `queryKeys.leads.search(query)`
- **Returns:** `UseQueryResult<Lead[]>`
- **Description:** Searches leads by a text query string.

## Query Keys

| Key | Factory | Usage |
|-----|---------|-------|
| `leads.all` | `queryKeys.leads.all` | Top-level invalidation target for all lead data |
| `leads.lists()` | `queryKeys.leads.lists()` | All list-type lead queries |
| `leads.list(opts)` | `queryKeys.leads.list(opts)` | Specific filtered/paginated list |
| `leads.details()` | `queryKeys.leads.details()` | All detail-type lead queries |
| `leads.detail(id)` | `queryKeys.leads.detail(id)` | Single lead by ID |
| `leads.search(query)` | `queryKeys.leads.search(query)` | Search results for a given query |
