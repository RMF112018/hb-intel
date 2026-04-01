# Gap 6 projectViewerGroups — Design and Adapter Alignment

## Purpose

This document describes the repo-owned contract and adapter for the `projectViewerGroups` SharePoint list, the hybrid viewer model it enables, and the current state of runtime wiring.

## Hybrid Viewer Model

Effective read-only membership for a provisioned project site is computed as:

```
department default viewer groups  +  project-level viewerUPNs exceptions
       (projectViewerGroups list)          (Projects list)
```

- **Department defaults** are Entra ID security group IDs stored per department in the `projectViewerGroups` list. These groups receive Read access on every project site belonging to that department.
- **Project-level exceptions** are individual UPNs stored in `Projects.viewerUPNs`. These are additive read-only access grants for specific people beyond the department defaults.

## Contract and Adapter

### Contract (`viewer-groups-list-contract.ts`)

Defines:
- `VIEWER_GROUPS_LIST_NAME` — SharePoint list title (`projectViewerGroups`)
- `IDepartmentViewerPolicy` — domain model with department key, group IDs, active flag, metadata
- `IViewerGroupsListItem` — raw SP DTO matching the 6 live schema fields
- `VIEWER_GROUPS_FIELD_MAP` — authoritative domain-to-SP mapping
- `VIEWER_GROUPS_SELECT_FIELDS` — derived select array

### Mapper (`viewer-groups-list-mapper.ts`)

Read-only mapper:
- `toDomain(item)` — SP item → `IDepartmentViewerPolicy`
- Reuses `safeParseJsonArray` from `projects-list-mapper.ts` for JSON parsing
- No write path (admin-managed list)

### Repository (`viewer-groups-repository.ts`)

- `IViewerGroupsRepository` interface with `getActivePolicies()` and `getPolicyForDepartment(department)`
- `SharePointViewerGroupsAdapter` — PnPjs adapter filtering by `IsActive eq 'Yes'`
- `MockViewerGroupsRepository` — in-memory implementation for tests

### Resolver (`entra-group-definitions.ts`)

- `resolveDepartmentViewerGroupIds(policy)` — extracts group IDs from an `IDepartmentViewerPolicy`, returning empty array for null/inactive policies

## Current Environment State

The `projectViewerGroups` list exists on the HBCentral site with the correct schema:

| Field | Type | Purpose |
|---|---|---|
| Title | Text | Department key |
| DefaultViewerGroupIdsJson | Note | JSON array of Entra group IDs |
| DefaultViewerGroupNames | Text | Human-readable labels |
| IsActive | Choice (Yes/No) | Active flag |
| LastReviewedAt | DateTime | Admin review timestamp |
| Notes | Note | Free-form notes |

Two department rows are seeded ("Commercial", "Luxury Residential") but **all data columns are empty**. No viewer group IDs, names, or active flags are populated.

## Runtime Wiring Status

### What is implemented now

- Contract, mapper, repository, and resolver are in place
- Tests prove the adapter behavior (parsing, active filtering, department lookup, resolver)
- The hybrid viewer model is documented

### What is deferred

- **`step6-permissions.ts` is NOT yet wired to the `projectViewerGroups` adapter.** The current runtime path uses `getDepartmentBackgroundViewers()` which reads individual UPNs from `DEPT_BACKGROUND_ACCESS_{DEPT}` environment variables.
- **The list data is not populated.** This is a SharePoint Admin task, not a repo change.

### Intended Consumption Path

When the `projectViewerGroups` list data is populated and the provisioning saga service container is extended:

1. Add `IViewerGroupsRepository` to `IProjectSetupServiceContainer`
2. In `step6-permissions.ts`, replace:
   ```typescript
   const viewerMembers = getDepartmentBackgroundViewers(status.department);
   ```
   with:
   ```typescript
   const policy = await services.viewerGroups.getPolicyForDepartment(status.department);
   const viewerGroupIds = resolveDepartmentViewerGroupIds(policy);
   // Add groups (not individual UPNs) to the Viewers Entra group
   ```
3. The transition changes the model from "add individual UPNs to the Viewers group" to "add Entra security groups as nested members of the Viewers group" — this is a Graph API behavior change that needs validation.

### Transition Prerequisites

- `projectViewerGroups` list data must be populated by SharePoint Admin
- Graph API nested-group membership behavior must be validated
- `IProjectSetupServiceContainer` must be extended with the viewer-groups repository
- Existing env-var path should be retained as a fallback during transition
