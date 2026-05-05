# Wave 16 Read Model And Command Boundary

## Required Read Route

`GET /api/pcc/projects/{projectId}/settings`

## Optional Future Read Routes

- `GET /api/pcc/projects/{projectId}/settings/{category}`
- `GET /api/pcc/projects/{projectId}/settings/change-requests`
- `GET /api/pcc/projects/{projectId}/settings/validation-results`
- `GET /api/pcc/projects/{projectId}/settings/audit-events`

## Planned Future Command Routes (Not Implemented in This Wave)

- `POST /api/pcc/projects/{projectId}/settings/change-requests`
- `POST /api/pcc/projects/{projectId}/settings/change-requests/{requestId}/submit`
- `POST /api/pcc/projects/{projectId}/settings/{settingKey}/validate`
- `POST /api/pcc/projects/{projectId}/settings/{settingKey}/request-recheck`

## Forbidden Mutation Paths

- Direct SPFx writes to SharePoint settings lists.
- Direct SPFx tenant Graph or permission mutation.
- Direct external-system writeback from SPFx.
- Direct secret update or display of secret values.
- HBI-initiated mutation of settings state.
