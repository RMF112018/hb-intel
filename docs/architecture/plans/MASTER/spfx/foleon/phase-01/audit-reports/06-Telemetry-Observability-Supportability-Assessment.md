# 06 — Telemetry / Observability / Supportability Assessment

## Current Status

`FoleonTelemetryService` was not found on the inspected `main` branch. The claimed best-effort SharePoint list write model cannot be verified.

## Minimum Event Model

Recommended production event envelope:

| Field | Required | Notes |
|---|---:|---|
| `eventId` | Yes | UUID generated client-side or backend-side |
| `eventName` | Yes | Controlled enum |
| `eventVersion` | Yes | Schema version |
| `occurredAtUtc` | Yes | ISO UTC |
| `sessionId` | Yes | Non-PII session correlation |
| `correlationId` | Yes | End-to-end support correlation |
| `contentRegistryId` | When applicable | SharePoint item ID or stable content key |
| `foleonDocId` | When applicable | Foleon source ID |
| `route` | Yes | highlights / reader / hub |
| `gateResult` | Reader only | pass/failure reason |
| `origin` | Reader only | normalized origin, not full secret-bearing URL |
| `packageVersion` | Yes | Runtime version proof |
| `manifestId` | Yes | Runtime manifest proof |
| `errorCode` | On failure | Controlled enum |
| `privacyClass` | Yes | Non-sensitive / internal diagnostic etc. |

## SharePoint List Write Limitations

A best-effort SharePoint list write is acceptable for MVP diagnostics only if:

- failures never block user activity
- failures are observable somewhere else during testing
- payload is minimal and non-sensitive
- list schema/indexes are governed
- noisy events are throttled/debounced
- retention/archival is defined

It is not sufficient for production-grade operational observability by itself.

## Backend Transition Path

The target production model should be:

- client emits minimal event payload to `POST /api/foleon/events`
- backend validates schema, enriches with server-side context, strips sensitive data, and writes to governed storage
- backend correlates events with sync runs and Foleon API status
- SharePoint analytics snapshots are populated from backend jobs rather than ad hoc client event math

## Privacy / Security Requirements

- Do not send full URLs if query strings may contain tracking or preview data.
- Do not send user PII unless there is a documented purpose and retention policy.
- Do not send Foleon secrets or auth headers.
- Do not log raw `postMessage` payloads without strict schema filtering.

## Decision

Telemetry is **MVP-acceptable only as a temporary SharePoint best-effort write**. Production readiness requires backend event ingestion, schema versioning, correlation IDs, retention policy, and support dashboards or queryable diagnostics.

## Research Sources Used

- Foleon API authentication: https://developers.foleon.com/apis/authentication/obtainoauthtoken
- Foleon Docs API: https://developers.foleon.com/apis/docs/getdocbyid
- Foleon Analytics API: https://developers.foleon.com/apis/foleon-analytics
- Microsoft Support — SharePoint HTML Field Security / iframe domain controls: https://support.microsoft.com/en-us/office/allow-or-restrict-the-ability-to-embed-content-on-sharepoint-pages-e7baf83f-09d0-4bd1-9058-4aa483ee137b
- Microsoft Learn — SPFx client-side web parts: https://learn.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/overview-client-side-web-parts
- Microsoft Learn — SPFx isolated web parts retirement: https://learn.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/isolated-web-parts-retirement
- Microsoft Learn — Optimize iFrames in SharePoint: https://learn.microsoft.com/en-us/microsoft-365/enterprise/modern-iframe-optimization
- MDN — window.postMessage: https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
- MDN — iframe element and referrer policy: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe
- MDN — CSP frame-ancestors: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors
- OWASP XSS Prevention Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
- W3C/WAI WCAG Technique H64: https://www.w3.org/WAI/WCAG21/Techniques/html/H64
