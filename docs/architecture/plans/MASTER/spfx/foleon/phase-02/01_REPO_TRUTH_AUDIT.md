# Repo-Truth Audit — Current Foleon State

## Executive Finding

The current `hb-intel-foleon` implementation is a strong foundation for governed Foleon content, but it is still structured around a generic route model:

```text
highlights → generic card grid
hub        → generic archive/search
reader     → docId-driven iframe reader
manage     → generic connector management
```

The target requirement is more specific:

```text
Project Spotlight Reader → one active monthly project profile
Company Pulse Reader     → one active living news publication
```

This requires new schema/contracts and new public reader-resolution logic. It should not be implemented as a superficial rename of `HighlightsPage`.

## Current Runtime and Route Model

Current route type is:

```ts
export type FoleonRoute = 'highlights' | 'reader' | 'hub' | 'manage';
```

This means the application currently has no first-class route for:

- `project-spotlight`;
- `company-pulse`;
- `reader-module`;
- `communications-band`;
- route-specific reader configuration.

### Gap

The target two-lane homepage model requires either:

1. two new routes: `projectSpotlight` and `companyPulse`, or
2. one `readerModule` route plus a `readerKey` config value.

## Current Manifest / Toolbox Model

The current manifest exposes two toolbox entries:

- `HB Intel Foleon Highlights`
- `HB Intel Foleon Manager`

Both point to the same webpart ID and route through persisted properties.

### Gap

The target model should expose distinct toolbox entries:

- `HB Intel Project Spotlight Reader`
- `HB Intel Company Pulse Reader`
- `HB Intel Foleon Manager`

The legacy `HB Intel Foleon Highlights` may be retained temporarily for migration, but it should no longer be the primary homepage communication surface.

## Current Content Type Model

Current public `FoleonContentType` union includes:

```ts
'Project Highlight'
'Newsletter'
'Company News'
'Market Update'
'Leadership'
'Other'
```

### Gap

The target model requires at minimum:

```ts
'Project Spotlight'
'Company Pulse'
```

This affects:

- frontend content type union;
- backend DTOs/mutations;
- schema choice values;
- Feature Framework XML;
- docs/reference list schemas;
- Manager select fields;
- validation logic;
- tests;
- tenant choice values.

## Current Placement Model

Current `FoleonPlacementKey` includes:

```ts
'Hero'
'Primary Card'
'Secondary Card'
'Carousel'
'Archive Rail'
```

### Gap

The target model needs two governed lane keys:

```ts
'Project Spotlight Active'
'Company Pulse Active'
```

These may be added as placement choices, or the app can use new fields such as `ReaderKey` and `HomepageSlot` as the primary lane authority. The better model is to support both:

- `ReaderKey` / `ActiveEdition` on content registry for editorial state;
- `PlacementKey` on homepage placements for homepage lane activation.

## Current Public Content Service

`FoleonContentService.ts` now uses a scalar-safe public `$select`, after the tenant-proven 400 remediation. This must be preserved.

Current public filtering supports:

- `foleonDocId`
- `publishedOnly`
- `homepageEligibleOnly`

Current filter-safe fields are:

```ts
FoleonDocId
IsVisible
PublishStatus
IsHomepageEligible
```

### Gap

Two-lane reader resolution needs additional query fields:

- `ReaderKey`
- `ActiveEdition`
- possibly `ContentTypeKey`
- possibly `HomepageSlot`

These fields should be filter-safe and indexed if used in production filters.

## Current Reader Gate

`FoleonReaderGate.ts` already implements the correct shared gate:

1. record exists;
2. visible;
3. published;
4. embed allowed;
5. not external-only;
6. URL exists;
7. display window active;
8. origin allowlisted and preview URLs blocked.

### Recommendation

Reuse this gate unchanged. Do not fork gate logic for Project Spotlight or Company Pulse.

## Current Iframe Host

`FoleonIframeHost.tsx` already supports:

- origin validation;
- iframe `set-height` postMessage handling;
- iframe `page-change` handling;
- sandbox and allow policy;
- lazy loading.

### Recommendation

Reuse this host. Add reader-module chrome around it, not a second iframe implementation.

## Current Preview Fallback

Current preview fallback handles:

- Highlights configured-empty public route.
- Hub configured-empty public route.
- Manager ready-state guidance.

### Gap

Two-lane reader modules need route-specific preview states:

- Project Spotlight preview reader shape.
- Company Pulse preview reader shape.
- mobile collapsed card-first preview behavior.

These previews should show the intended module structure, not fake live content.

## Current Manager Model

Manager content DTOs include common fields:

- content type;
- publish status;
- visibility;
- homepage eligibility;
- URLs;
- summary;
- region/sector;
- open mode;
- embed flags;
- admin notes.

### Gap

Manager does not currently support:

- `ReaderKey`
- `Cadence`
- `HomepageSlot`
- `ArchiveGroup`
- `ActiveEdition`
- `PrimaryAudience`
- `LastEditorialUpdate`

It also does not enforce one active item per reader lane.

## Current Backend Model

Backend Foleon DTOs and mutations do not include the new two-lane fields. The sync process currently imports unknown Foleon docs as `contentTypeKey: 'Other'`, `publishStatus: 'Draft'`, and `isHomepageEligible: false`.

### Gap

Backend must be extended so sync, list, create, update, validate, publish, suppress, and Manager API payloads understand the new lane fields. Without backend support, the SPFx Manager cannot reliably edit or validate the two reader lanes.

## Current Version

Current package/runtime version is `1.0.17.0`.

### Recommendation

The two-lane reader architecture should be delivered as `1.0.18.0` or a later explicit version, because it includes schema, route, manifest, Manager, backend, and package-proof changes.
