# Public Reader Runtime Plan

## Objective

Add two first-class public reader routes:

```text
projectSpotlight
companyPulse
```

These routes should render through a shared `FoleonReaderModule`.

## New Files

Recommended new files:

```text
apps/hb-intel-foleon/src/readers/readerConfigs.ts
apps/hb-intel-foleon/src/readers/FoleonReaderModule.tsx
apps/hb-intel-foleon/src/readers/ProjectSpotlightReader.tsx
apps/hb-intel-foleon/src/readers/CompanyPulseReader.tsx
apps/hb-intel-foleon/src/readers/FoleonReaderPreview.tsx
apps/hb-intel-foleon/src/services/FoleonReaderContentService.ts
```

## Service API

Add a focused public reader query seam:

```ts
export interface FoleonReaderContentQueryParams {
  readonly siteUrl: string;
  readonly contentRegistryListId: string;
  readonly placementsListId?: string;
  readonly config: FoleonReaderModuleConfig;
  readonly signal?: AbortSignal;
}

export interface FoleonReaderResolution {
  readonly kind: 'ready' | 'preview' | 'blocked' | 'error';
  readonly record?: FoleonContentRecord;
  readonly reason?: string;
}
```

## Resolution Logic

Recommended order:

1. Fetch reader-lane content candidates using scalar-safe query.
2. Optionally fetch active placement by configured `placementKey`.
3. Resolve one active record:
   - placement match wins when valid;
   - otherwise `ActiveEdition = true` candidate wins;
   - otherwise newest public-ready candidate wins only if explicitly allowed.
4. Evaluate reader gate.
5. Return:
   - `ready` for embeddable record;
   - `blocked` for real record that fails gate;
   - `preview` when configured/read succeeds but no renderable active record exists;
   - `error` for query/config failures.

## Preview Eligibility

Preview is allowed only when:

- runtime config is valid;
- content registry query succeeds;
- placement query succeeds if required by route;
- no active/renderable record exists.

Preview is not allowed for:

- missing list IDs;
- package version mismatch;
- REST `400`;
- list schema failures;
- origin allowlist failures on a real record;
- broken reader gate for a real record.

## Reader Gate

Reuse `evaluateFoleonReaderGate`. Do not fork gate logic.

## Iframe Host

Reuse `FoleonIframeHost`. It already validates origin and supports Foleon `set-height` and `page-change` messages.

## Telemetry

Extend telemetry context carefully.

Current `FoleonPageContext` values:

```ts
'Homepage' | 'Content Hub' | 'Reader' | 'Project Site'
```

Recommended additions:

```ts
'Project Spotlight' | 'Company Pulse'
```

Event guidance:

| Event | Project Spotlight | Company Pulse |
|---|---:|---:|
| Reader Open | Yes | Yes |
| Reader Close | Yes | Yes |
| Embed Error | Yes | Yes |
| External Open | Yes, if enabled | Yes, if enabled |
| Preview impression | No production content telemetry | No production content telemetry |

Do not emit content telemetry for preview states.

## Route Integration

Update:

- `FoleonRoute`
- `routeAnnouncement`
- `readNavFromLocation`
- `renderPage`
- runtime binding proof route union
- tests

## Toolbox Integration

Add preconfigured entries:

```json
{
  "title": { "default": "HB Intel Project Spotlight Reader" },
  "properties": {
    "foleonRoute": "projectSpotlight",
    "expectedPackageVersion": "1.0.18.0"
  }
}
```

```json
{
  "title": { "default": "HB Intel Company Pulse Reader" },
  "properties": {
    "foleonRoute": "companyPulse",
    "expectedPackageVersion": "1.0.18.0"
  }
}
```

## Runtime Binding Proof

Runtime proof should report the new route. It should not include raw `ReaderKey`, raw placement values, URLs, or content metadata.

## Existing Routes

Keep current routes:

- `highlights`
- `hub`
- `reader`
- `manage`

Do not remove `highlights` until the tenant has fully migrated. The legacy route can be deprecated later.

## Error/Blocked State

For a real record that fails the reader gate, render a clear blocked state explaining what is wrong.

Examples:

- publication hidden;
- not published;
- embed disallowed;
- external-only;
- no URL;
- origin not allowlisted;
- preview URL blocked;
- display window inactive.

Do not convert these to preview.
