# 08 — Degraded States and Consent-Required UX

## Principle

Degraded states must look intentional. A missing approval or blocked write path should not make the app look broken.

## State Matrix

| Condition | Primary UI behavior | Actions |
|---|---|---|
| API approval missing | Warning banner; content review remains available if read path works. | Disable publish/sync/write actions with reason. |
| Token acquisition fails | Warning or error depending on read availability. | Offer retry/check approval; diagnostics collapsed. |
| Backend read unavailable | Error banner or limited config view. | Show Config actions; no false content state. |
| Write path blocked | Read-only mode. | Disable publish/edit/write with reason. |
| Sync path blocked | Content review/edit may remain; sync disabled. | Disable `Sync content`; explain blocker. |
| Lane empty | Lane card shows Empty. | `Add content` / `Open Foleon`. |
| Lane preview-only | Lane card shows Preview. | `Open preview`; `Complete setup`; publish only if ready. |
| Lane blocked | Lane card shows Blocked. | `View blockers`; admin action if system blocker. |
| Live lane | Lane card shows Live. | `Review lane`, `Edit content`, `Open preview/live`. |

## API Approval Required Banner

Recommended copy:

### Title

API approval required

### Body

SharePoint needs approval to let this app call the HB Intel backend. Content can be reviewed, but publishing and sync are unavailable until `HB SharePoint Creator / access_as_user` is approved in SharePoint Admin Center.

### Actions

- `Review admin action`
- `View diagnostics`

### Expanded detail

- Requested resource: show friendly resource name only.
- Scope: show friendly scope only.
- Where to approve: SharePoint Admin Center API access page.
- Diagnostic proof: redacted/copyable.

## Disabled Actions

### Publish disabled

> Publishing is unavailable because API approval is still required.

### Sync disabled

> Sync is unavailable because the backend sync path is blocked.

### Save disabled

> Saving is unavailable because publishing access is blocked.

### Placement update disabled

> Placement updates are unavailable until write access is available.

## Read-Only Mode

Read-only mode is acceptable and should be explicit.

Recommended header chip:

`Limited mode`

Recommended help copy:

> You can review configured content and lane status. Publishing, placement updates, and sync are disabled until the listed admin action is resolved.

## Diagnostics in Degraded States

Diagnostics should be:

- accessible;
- collapsed by default;
- redacted;
- copyable;
- associated with the blocker.

Do not show stack traces in the primary banner or lane card.

## Live / Preview / Blocked / Empty Lane Cards

### Live

Copy:

> Live on homepage

CTA:

- `Review lane`

### Preview

Copy:

> Preview content is available but not published to the homepage.

CTA:

- `Open preview`
- `Complete setup`

### Blocked

Copy:

> This lane has content, but one or more publishing requirements are blocked.

CTA:

- `View blockers`

### Empty

Copy:

> No content is assigned to this lane yet.

CTA:

- `Add content`

### Needs setup

Copy:

> This lane cannot be evaluated until required configuration is complete.

CTA:

- `Review config`

## Acceptance Criteria

- API consent missing does not hard-block the entire app.
- User can still see controlled content/config views when safe.
- Write/sync/publish actions are disabled with precise reasons.
- Diagnostic proof exists but is not the primary interface.
- No raw tokens, secrets, URLs, API resources, or list GUIDs are exposed in primary UI.
