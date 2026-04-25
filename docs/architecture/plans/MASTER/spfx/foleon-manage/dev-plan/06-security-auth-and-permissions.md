# 06 — Security, Auth, and Permissions

## Security posture

The connector must enforce security server-side.

Frontend role visibility improves UX but is not authorization.

## Entra roles

Recommended app roles:

```text
HBIntelFoleonViewer
HBIntelFoleonEditor
HBIntelFoleonPublisher
HBIntelFoleonAdmin
HBIntelFoleonOperator
```

## Route enforcement

Every backend route must declare a required role set.

Example policy:

| Operation | Roles |
|---|---|
| Read content | Viewer, Editor, Publisher, Admin, Operator |
| Create/edit draft | Editor, Publisher, Admin |
| Publish/suppress | Publisher, Admin |
| Manage placements | Publisher, Admin |
| Run sync | Operator, Admin |
| Provision/validate SharePoint | Admin |
| View sync runs | Operator, Admin |

## Token validation

Use the same backend approach as the Safety Records workflow:

- validate bearer token;
- validate tenant;
- validate audience;
- validate issuer;
- validate role claim;
- produce stable denial responses.

## Secrets

Never expose:

- Foleon API secret;
- client secret;
- Graph app-only credential;
- backend config secrets;
- raw Foleon API payloads that contain sensitive account metadata.

Store secrets in Azure Functions app settings or Key Vault-backed settings.

## Foleon API credentials

Foleon uses OAuth/client credentials to obtain bearer tokens. This requires backend-only handling.

SPFx must never request a Foleon token directly.

## Graph permissions

Backend writes to SharePoint lists through Graph.

Use least-privilege permissions where possible. If the existing backend app already has Graph permissions for Safety Records, do not broaden permissions without a documented reason.

## Concurrency and integrity

Use eTag / `if-match` when updating SharePoint list items through Graph.

If the eTag is stale:

- reject update;
- return conflict response;
- UI shows refresh/compare option;
- do not overwrite silently.

## Auditability

Log meaningful events:

- content created;
- content updated;
- content published;
- content suppressed;
- placement created/updated/deactivated;
- sync started/succeeded/failed;
- validation blocked;
- unauthorized route attempt.

Avoid logging raw secrets, raw tokens, or raw external payloads.

## SharePoint permissions

End users do not need direct Edit access to the Foleon lists if the backend uses app-only or controlled delegated Graph writes.

Recommended list permission posture:

- narrow human direct-edit access;
- backend app write access;
- display app read access as required;
- admins retain emergency break-glass access.

## Failure handling

Denied request must return:

```json
{
  "errorCode": "FOLEON_ROLE_MISSING",
  "message": "You do not have permission to perform this Foleon action.",
  "correlationId": "...",
  "retryable": false
}
```
