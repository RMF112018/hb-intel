# HB Foleon Interaction Events

## 1. Objective
- Target-state schema for `HB_FoleonInteractionEvents` at `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`.
- **Status: not yet provisioned on tenant.** Provision per `apps/hb-intel-foleon/docs/provisioning.md`.
- Code-level source of truth: `apps/hb-intel-foleon/src/schema/foleonListSchemas.ts`
  (`FOLEON_INTERACTION_EVENTS_SCHEMA`).

## 2. List-Level Metadata
- List ID: _assigned at provision time_
- Display Name: `Foleon Interaction Events`
- Internal Name: `HB_FoleonInteractionEvents`
- Template: Generic List (base template 100)
- Versioning: **disabled** (events are high-volume; versions would
  explode storage with no operational benefit)
- Attachments: disabled
- Classification: business/custom
- Primary consumer: Foleon SPFx telemetry service; future analytics
  rollups

## 3. Field Schema

| Display Name | Internal Name | Type | Required | Indexed | Unique | Notes |
|---|---|---|---|---|---|---|
| Title | Title | Text | Yes | No | No | auto-generated summary (e.g., "Card Click 123456") |
| Event ID | EventId | Text | Yes | Yes | Yes | GUID (from `crypto.randomUUID()` when available, fallback otherwise) |
| Event Type | EventType | Choice | Yes | Yes | No | Card Impression, Card Click, Reader Open, Reader Close, External Open, Embed Error, Search, Filter |
| Foleon Doc ID | FoleonDocId | Number | No | Yes | No | |
| Content Registry Item ID | ContentRegistryItemId | Number | No | Yes | No | SharePoint item id in `HB_FoleonContentRegistry` |
| User Email Hash | UserEmailHash | Text | No | Yes | No | avoid plain emails in production |
| User Department | UserDepartment | Text | No | Yes | No | |
| Page Context | PageContext | Choice | No | Yes | No | Homepage, Content Hub, Reader, Project Site |
| Search Query | SearchQuery | Text | No | No | No | only populated for Search events |
| Filter State JSON | FilterStateJson | Note | No | No | No | optional |
| Referrer Path | ReferrerPath | Text | No | No | No | internal path only |
| Event Timestamp | EventTimestamp | DateTime | Yes | Yes | No | UTC |
| Session ID | SessionId | Text | No | Yes | No | anonymous session key |
| Client Info JSON | ClientInfoJson | Note | No | No | No | optional |

## 4. Launch Provisioned Indexed Columns

Feature Framework launch provisioning intentionally avoids over-indexing.
Additional indexes must be created through controlled post-provisioning
and validated before service code treats them as filter-safe.

```
EventId
EventType
FoleonDocId
ContentRegistryItemId
PageContext
EventTimestamp
SessionId
```

## 5. Recommended Future Indexed Columns

None currently identified for launch-critical runtime paths.

## 6. Uniqueness Posture

`EventId` is provisioned with `Indexed="TRUE"` and
`EnforceUniqueValues="TRUE"` per Microsoft field schema guidance. Tenant
closure still requires clean-site proof that SharePoint created the
unique constraint.

## 7. Retention

- Raw events: retain 12–18 months.
- Rolled-up aggregates: stored separately (future
  `HB_FoleonAnalyticsSnapshots` list — deferred).
- Archive or purge older raw records when volume becomes material.

## 8. Service consumers

- `apps/hb-intel-foleon/src/services/FoleonTelemetryService.ts`
  - Write-only at the list level; no read path from the webpart.
  - Uses `fetchRequestDigest` before every POST.
  - Event id generated client-side via `crypto.randomUUID()` when
    available.
  - Best-effort: failure never surfaces to the user; caller-side
    `.catch(() => {})` is intentional.
