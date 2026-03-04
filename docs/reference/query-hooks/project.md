# Project Hooks Reference

> **Package:** `@hb-intel/data-access` | **Domain:** Project

## Hooks

### `useActiveProjects(options?)`
- **Type:** Query
- **Key:** `queryKeys.project.list(options)`
- **Returns:** `UseQueryResult<Project[]>`
- **Description:** Fetches the list of active projects, with optional filtering/pagination.

### `useProjectById(id: string)`
- **Type:** Query
- **Key:** `queryKeys.project.detail(id)`
- **Returns:** `UseQueryResult<Project>`
- **Description:** Fetches a single project by its string ID.

### `useProjectDashboard()`
- **Type:** Query
- **Key:** `queryKeys.project.dashboard()`
- **Returns:** `UseQueryResult<ProjectDashboard>`
- **Description:** Fetches aggregated dashboard data for the active project.

### `useCreateProject()`
- **Type:** Mutation
- **Key:** Invalidates `queryKeys.project.lists()`
- **Returns:** `UseMutationResult<Project, Error, CreateProjectInput>`
- **Description:** Creates a new project.

### `useUpdateProject()`
- **Type:** Mutation
- **Key:** Invalidates `queryKeys.project.lists()`, `queryKeys.project.detail(id)`
- **Returns:** `UseMutationResult<Project, Error, UpdateProjectInput>`
- **Description:** Updates an existing project.

### `useDeleteProject()`
- **Type:** Mutation
- **Key:** Invalidates `queryKeys.project.all`
- **Returns:** `UseMutationResult<void, Error, string>`
- **Description:** Deletes a project by its string UUID.

## Query Keys

| Key | Factory | Usage |
|-----|---------|-------|
| `project.all` | `queryKeys.project.all` | Top-level invalidation target for all project data |
| `project.lists()` | `queryKeys.project.lists()` | All list-type project queries |
| `project.list(opts)` | `queryKeys.project.list(opts)` | Specific filtered/paginated list |
| `project.detail(id)` | `queryKeys.project.detail(id)` | Single project by string ID |
| `project.dashboard()` | `queryKeys.project.dashboard()` | Project dashboard aggregation |
