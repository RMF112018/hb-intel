# 04 — Zone And Content-State Plan

## New Lane Host

Add:

- `apps/hb-webparts/src/webparts/hbHomepage/zones/FoleonHomepageLaneHost.tsx`
- optional `FoleonHomepageLaneHost.module.css`

Props:

- `lane: 'projectSpotlight' | 'companyPulse'`
- `occupantId: 'project-portfolio-spotlight' | 'company-pulse'`
- `zoneProps: HbHomepageZoneProps`, or directly accept `HbHomepageZoneProps` plus lane fields.

Responsibilities:

- Build `IFoleonMountConfig` from homepage-specific config values.
- Call `createEmbeddedFoleonRuntimeContract`.
- Render `FoleonEmbeddedReaderLane`.
- Provide safe callbacks:
  - `onOpenArchive`
  - `onReaderOpen`
  - `onReaderClose`
  - `onEmbedError`
  - `onGateBlocked`
- Report shell content state using `useReportOccupantContentState`.
- Avoid preview production telemetry.
- Avoid hardcoded tenant GUIDs.

## Mapping

Final occupant-to-lane mapping:

- `project-portfolio-spotlight` → `<FoleonEmbeddedReaderLane lane="projectSpotlight" />`
- `company-pulse` → `<FoleonEmbeddedReaderLane lane="companyPulse" />`

Do not introduce new occupant IDs.

## Zone Replacement

`ProjectPortfolioSpotlightZone.tsx` should become a thin wrapper:

- keep `ZoneErrorBoundary zoneName="project-portfolio-spotlight"`
- keep a section with safe aria label such as `Project Spotlight`
- render `FoleonHomepageLaneHost lane="projectSpotlight" occupantId="project-portfolio-spotlight"`
- stop rendering legacy `ProjectPortfolioSpotlight`

`CompanyPulseZone.tsx` should become a thin wrapper:

- keep `ZoneErrorBoundary zoneName="company-pulse"`
- keep a section with safe aria label such as `Company Pulse`
- render `FoleonHomepageLaneHost lane="companyPulse" occupantId="company-pulse"`
- stop rendering legacy `CompanyPulse`
- remove legacy `normalizeCompanyPulseConfig` content-state reporting after the cutover

## Content-State Vocabulary

Use only:

- `strong`
- `low-signal`
- `empty`
- `invalid`
- `loading`
- `unknown`

Do not add a `blocked` state.

## Planned Mapping

- `loading` while embedded Foleon lane is resolving.
- `empty` when the lane resolves to preview/no active record.
- `strong` when a live reader record is active and renderable.
- `invalid` when the lane has real blocked/config/error condition.

## Required Shared Package API Addition

Current `@hbc/foleon-reader` does not expose a status callback from `FoleonEmbeddedReaderLane` or `FoleonReaderModule`.

Minimal API addition needed:

```ts
type FoleonEmbeddedReaderStatus =
  | { kind: 'loading' }
  | { kind: 'preview'; resolution: FoleonReaderResolution }
  | { kind: 'ready'; resolution: FoleonReaderResolution }
  | { kind: 'blocked'; resolution: FoleonReaderResolution }
  | { kind: 'error'; resolution?: FoleonReaderResolution; message?: string };
```

Add optional callback:

```ts
onStatusChange?: (status: FoleonEmbeddedReaderStatus) => void;
```

The reader module should call this callback when internal resolution state changes. The callback must not emit telemetry; it is a shell diagnostics seam only.

Because this changes `@hbc/foleon-reader`, and the standalone Foleon app consumes that package, execution must decide whether to rebuild/deploy Foleon:

- If only homepage consumes the added optional callback and standalone behavior remains source-compatible, the Foleon app may still need type/build validation but not necessarily a tenant package bump.
- If the Foleon package artifact is rebuilt for tenant deployment after this shared API change, bump Foleon coherently from `1.0.21.0` to the next version and run Foleon package proof.

## Initial Report Fallback

Before the reader reports:

- publish `loading` when contract inputs are sufficient to attempt resolution.
- publish `invalid` immediately if required homepage Foleon config is missing in hosted SharePoint mode.

## Archive Callback

`onOpenArchive` must not render a fake archive button in preview. It may be a no-op for the embedded lane until a real archive route exists, but live reader behavior should remain consistent with shared reader behavior. If the shared reader still renders a live "Open full archive" action, the homepage host should route only to a real tested archive destination or provide a noninteractive note in a future shared reader update.

## Telemetry

Preview state must not emit production content telemetry. The lane host callbacks should only log diagnostics or no-op unless a real live reader event is emitted by the shared reader path.
