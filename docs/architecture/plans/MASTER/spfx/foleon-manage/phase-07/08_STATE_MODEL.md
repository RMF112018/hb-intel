# 08 — State Model

## Professional State Taxonomy

| State | User-Facing Meaning | Required UI |
|---|---|---|
| Loading | Manager is loading content and readiness. | Skeleton header, inbox rows, lane cards; no layout jump. |
| Empty | No synced Foleon content exists. | Explain sync path and next steps; show lane model. |
| Partial configuration | Some infrastructure is ready but not all operations are available. | Useful limited mode with exact admin action. |
| Graph/list configured, OAuth missing | HB Central lists are ready but Foleon sync cannot run. | Lane board visible; sync disabled with setup action. |
| OAuth configured, no content synced | Sync path exists but no data has been imported. | Prominent Sync from Foleon action and empty inbox education. |
| Content available, unassigned | Content exists but is not placed in a lane. | Inbox filtered to Unassigned; “Place content” CTA. |
| Lane has live content | Content currently visible to employees. | Live badge, display window, preview, replace/stage action. |
| Lane has staged content | Content is queued for lane. | Staged badge, readiness checks, activate action. |
| Blocked validation | Content or placement cannot safely render. | Blocking reason, owner, next action, source category. |
| Sync in progress | Foleon sync is running. | Non-blocking progress strip; disable duplicate sync. |
| Sync failed | Sync could not complete. | Failure summary, retry, admin proof, correlation ID. |
| Publish / placement success | Placement changed or activated. | Toast/status strip; refresh lane board and inbox. |
| Authorization failure | User lacks route role/scope. | Explain role needed and who can fix it; no raw claims. |
| Backend unavailable | Function App or safe-config unavailable. | Retry, admin diagnostic link, redacted correlation. |

## Blocked Reason Structure

Each blocked state must include:

```ts
type ManagerBlockSource =
  | 'foleon-source'
  | 'hb-central-placement'
  | 'backend-admin'
  | 'authorization'
  | 'runtime-host';

interface ManagerBlockReason {
  source: ManagerBlockSource;
  title: string;
  plainLanguageReason: string;
  owner: 'Marketing' | 'HB Intel Content Manager' | 'IT/Admin' | 'System';
  nextAction: string;
  technicalCode?: string;
  correlationId?: string;
}
```

## Status Vocabulary

Use:

- Ready
- Needs review
- Blocked
- Missing placement
- Missing content
- Pending sync
- OAuth not configured
- Graph/list issue
- Authorization required
- Backend unavailable

Avoid raw technical labels in the primary workflow.
