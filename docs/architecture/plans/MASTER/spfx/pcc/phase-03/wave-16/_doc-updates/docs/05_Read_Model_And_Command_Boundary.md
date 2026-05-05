# 05 — Read-Model and Command Boundary

## Required read route
Recommended:
```text
GET /api/pcc/projects/{projectId}/settings
```

## Optional future read routes
```text
GET /api/pcc/projects/{projectId}/settings/{category}
GET /api/pcc/projects/{projectId}/settings/change-requests
GET /api/pcc/projects/{projectId}/settings/validation-results
GET /api/pcc/projects/{projectId}/settings/audit-events
```

## Future command routes — planned only
```text
POST /api/pcc/projects/{projectId}/settings/change-requests
POST /api/pcc/projects/{projectId}/settings/change-requests/{requestId}/submit
POST /api/pcc/projects/{projectId}/settings/{settingKey}/validate
POST /api/pcc/projects/{projectId}/settings/{settingKey}/request-recheck
```

## Forbidden
No direct SPFx writes to SharePoint lists, direct SPFx tenant Graph mutation, direct permission/group mutation, direct external-system writeback, direct secret update, or HBI-initiated mutation.
