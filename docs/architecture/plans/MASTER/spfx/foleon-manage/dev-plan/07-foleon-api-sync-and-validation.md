# 07 — Foleon API Sync and Validation

## Purpose

Use the Foleon API to reduce manual entry, improve accuracy, and ensure connector-managed SharePoint records correspond to real Foleon Docs and Projects.

## Token flow

```text
Backend receives authorized sync request
→ backend uses Foleon client credentials
→ backend receives Foleon bearer token
→ backend calls Foleon API
→ backend maps response to connector DTOs
→ backend writes SharePoint records through Graph
```

## Sync modes

### Manual Add

User enters Foleon Doc ID or URL. Backend validates and optionally hydrates from Foleon API.

### Docs Sync

Backend fetches Docs and updates registry candidates.

### Projects Sync

Backend fetches Projects/workspaces to improve project mapping and filtering.

### Analytics Sync — later phase

Backend stores aggregated analytics snapshots, not raw high-volume analytics in the frontend.

## Mapping policy

Foleon-owned fields:

- Doc UID / identifier;
- Foleon Project ID;
- Foleon Project Name;
- Foleon Modified On;
- Published URL when authoritative;
- Raw Foleon JSON hash.

HB-owned fields:

- Title override;
- Summary;
- Region;
- Sector;
- Related Project Number;
- Tags;
- DisplayFrom / DisplayThrough;
- IsHomepageEligible;
- Homepage placement decisions;
- PublishStatus in HB Central context;
- Admin notes.

Do not let sync overwrite HB-owned fields unless a clear `--force` or admin action is used.

## Validation gates

### URL validation

Block publish if:

- URL is empty;
- URL is not HTTPS;
- URL is a preview URL;
- URL origin is not accepted;
- URL cannot be parsed.

### Embed validation

Warn or block if:

- `AllowEmbed=true` but Foleon security profile/headers may prevent iframe;
- `RequiresExternalOpen=true` but `OpenMode` says inline;
- target origin has not been added to Foleon embed settings where applicable;
- SharePoint trusted-domain configuration is missing where applicable.

### Display validation

Block homepage placement if:

- content is not visible/published and not intentionally scheduled;
- display window expired;
- required card image/summary missing for selected layout;
- placement key conflicts with existing active placement rule;
- `ContentIdCache` mismatch.

## Sync run logging

Every sync action writes `HB_FoleonSyncRuns`:

- RunId
- RunKind
- Status
- StartedUtc
- EndedUtc
- TriggerSource
- ItemsFetched
- ItemsWritten
- ErrorCount
- ErrorsJson
- CorrelationId
- BackendVersion

## Error handling

Classify errors:

- Foleon auth failed;
- Foleon API unavailable;
- malformed Foleon data;
- Graph write failure;
- concurrency conflict;
- validation blocked;
- partial sync completed with errors.

## Sync conflict policy

If a Foleon API field changes and an HB user also changed a corresponding local field:

- preserve HB-owned fields;
- update Foleon-owned fields;
- flag conflict when ownership is ambiguous;
- show conflict in connector.
