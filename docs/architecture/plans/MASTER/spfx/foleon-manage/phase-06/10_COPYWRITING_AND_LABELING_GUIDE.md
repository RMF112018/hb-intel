# 10 — Copywriting and Labeling Guide

## Product Name

Use:

> Foleon Manager

Avoid as primary title:

> Foleon Connector

`Foleon Connector` may remain in diagnostics or package proof if it is the internal technical name.

## Subtitle

Recommended:

> Manage homepage Foleon content, placements, and publishing readiness.

Alternate longer version:

> Manage homepage Foleon content, placements, and publishing readiness without editing SharePoint lists directly.

## Status Language

Use short, human-readable statuses:

- Ready
- Needs approval
- Blocked
- Needs setup
- Unavailable
- Warning
- Live
- Preview
- Empty
- Limited mode

Avoid:

- `Valid`
- `Invalid`
- `TOKEN ACQUISITIONBlocked`
- `WRITE PATHBlocked`
- `REGISTRYValid`
- `true/false` as visible status labels

## Label Rewrite Table

| Raw label | User-facing label |
|---|---|
| `REGISTRY` | Registry connection |
| `LIST BINDINGS` | SharePoint lists |
| `BACKEND URL` | Backend connection |
| `API RESOURCE` | API permission |
| `TOKEN PROVIDER` | Token setup |
| `TOKEN ACQUISITION` | API approval |
| `BACKEND SAFE CONFIG` | Backend configuration |
| `ROUTE AUTHORIZATION` | User authorization |
| `READ PATH` | Read access |
| `WRITE PATH` | Publishing access |
| `SYNC PATH` | Sync access |

## Status Rewrite Examples

| Raw | User-facing |
|---|---|
| `REGISTRYValid` | Registry connection — Ready |
| `LIST BINDINGSValid` | SharePoint lists — Ready |
| `TOKEN ACQUISITIONBlocked` | API approval — Needs approval |
| `WRITE PATHBlocked` | Publishing access — Blocked |
| `SYNC PATHBlocked` | Sync access — Blocked |

## Banner Copy

### API approval required

> SharePoint needs approval to let this app call the HB Intel backend. Content can be reviewed, but publishing and sync are unavailable until `HB SharePoint Creator / access_as_user` is approved in SharePoint Admin Center.

### Limited mode

> You can review configured content and lane status. Publishing, placement updates, and sync are disabled until the listed admin action is resolved.

### Backend unavailable

> The Manager cannot reach the HB Intel backend. Review configuration and API approval, then retry.

### Registry issue

> The platform configuration registry is missing or invalid. Review the required admin actions before publishing content.

## Lane Card Copy

### Live

> Live on homepage

### Preview

> Preview content is available but not published to the homepage.

### Blocked

> This lane has content, but one or more publishing requirements are blocked.

### Empty

> No content is assigned to this lane yet.

### Needs setup

> This lane cannot be evaluated until required configuration is complete.

## Action Labels

Use:

- Review lane
- Edit content
- Validate
- Publish
- Open preview
- Open Foleon
- Sync content
- Review admin action
- Retry approval check
- View blockers
- View diagnostics
- Copy diagnostic proof

Avoid:

- Execute
- Submit mutation
- Probe backend
- Inspect raw config
- Token check
- Route auth

## Disabled Action Copy

- `Publishing is unavailable because API approval is still required.`
- `Sync is unavailable because the backend sync path is blocked.`
- `Saving is unavailable because publishing access is blocked.`
- `Placement updates are unavailable until write access is available.`
- `This content cannot be published until a production Foleon URL is configured.`
- `This lane cannot be published until placement is assigned.`

## Tone Rules

- Calm.
- Specific.
- Operational.
- No alarmist language.
- No raw stack traces in user copy.
- One clear next action where possible.
