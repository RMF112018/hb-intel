# Homepage Three-Lane Cutover Plan

## Objective

Replace the existing homepage lanes with Foleon-backed lanes:

```text
ProjectPortfolioSpotlightZone → Foleon Project Spotlight
CompanyPulseZone              → Foleon Company Pulse
LeadershipMessageZone         → Foleon Leadership Message
```

## Occupant preservation

Preserve existing occupant IDs unless repo truth requires otherwise.

Expected occupant IDs:

```text
project-portfolio-spotlight
company-pulse
leadership-message
```

If the leadership ID differs, do not invent a new one. Inspect:

```text
apps/hb-webparts/src/webparts/hbHomepage/shell/occupantRegistry.ts
apps/hb-webparts/src/webparts/hbHomepage/shell/shellTypes.ts
apps/hb-webparts/src/webparts/hbHomepage/shell/protectedDecisions.ts
apps/hb-webparts/src/webparts/hbHomepage/zones/LeadershipMessageZone.tsx
```

## Homepage config seam

Add homepage-specific Foleon config support for the homepage webpart.

Required property/config names:

```text
foleonContentRegistryListId
foleonPlacementsListId
foleonEventsListId
foleonAcceptedOrigins
foleonAllowPreview
foleonExpectedManifestId
foleonExpectedPackageVersion
foleonApiBaseUrl
foleonApiResource
```

Do not rely on the standalone Foleon webpart property pane branch.

Do not hardcode tenant GUIDs.

## Zone wrappers

Add a shared homepage lane host:

```text
FoleonHomepageLaneHost
```

It should map homepage config into the shared reader runtime contract and render:

- Project Spotlight lane;
- Company Pulse lane;
- Leadership Message lane.

## Content state mapping

Use the existing shell content-state vocabulary:

```text
strong
low-signal
empty
invalid
loading
unknown
```

Recommended mapping:

| Foleon lane result | Homepage content state |
|---|---|
| loading | `loading` |
| preview / no active record | `empty` |
| ready live record | `strong` |
| blocked / config error / query error | `invalid` |

Do not introduce a new content-state type unless the shell contract is updated and tested.

## Legacy module replacement

Legacy modules should not render after the cutover:

- legacy Project Portfolio Spotlight;
- legacy Company Pulse / Newsroom;
- legacy Message from Leadership.

Do not delete legacy components in the first pass unless tests prove no imports remain and repo governance allows deletion. Replace the zone internals first.
