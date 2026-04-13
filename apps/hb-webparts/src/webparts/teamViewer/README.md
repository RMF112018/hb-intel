# TeamViewer webpart

Article-bound team-member viewer for the HB Intel homepage.

## Purpose

Present **article-linked team members** (photo, name, job title) in a premium,
scan-friendly, SharePoint-safe surface. Each person supports a real
bio/resume slide-out that ships **disabled by default** behind an explicit
feature flag (`featureFlags.profileDetailDrawer`).

## Public exports

See `./index.ts`:

- `TeamViewer`, `TeamViewerProps`
- `TEAM_VIEWER_WEBPART_ID`, `TEAM_VIEWER_RUNTIME_OWNERSHIP`
- Contracts: `TeamViewerPerson`, `TeamViewerArticleBinding`, `TeamViewerGroup`,
  `TeamViewerDensity`, `TeamViewerLayout`, `TeamViewerFeatureFlags`,
  `TeamViewerConfig`
- `resolveTeamViewerConfig`, `DEFAULT_TEAM_VIEWER_FEATURE_FLAGS`

## Runtime wiring

- Manifest: `TeamViewerWebPart.manifest.json` (GUID `c2f1b4e7-…`, alias
  `TeamViewerWebPart`).
- Mount map: `apps/hb-webparts/src/mount.tsx` registers the id against
  the `TeamViewer` renderer with `getGraphToken` for Graph-backed photo
  hydration.

## Webpart properties (preconfigured defaults)

| Property | Default | Purpose |
|---|---|---|
| `heading` | `"Team"` | Section heading. |
| `articleId` | `""` | Explicit article id; short-circuits host-context resolution. |
| `destinationKey` | `""` | Override for `HB Article Destination Pages` lookup. |
| `layout` | `"grid"` | `grid` / `rail` / `strip` / `grouped`. |
| `density` | `"standard"` | `compact` / `standard` / `expanded`. `standard` auto-selects by team size. |
| `featureFlags.profileDetailDrawer` | `false` | Enables the bio/resume slide-out. |

## Scope

- **Prompt 01 (this scaffold):** architecture lock, contracts, hooks,
  surface + card + drawer + states, manifest, mount wiring.
- **Prompt 02:** real SharePoint list reads for `HB Articles`,
  `HB Article Team Members`, `HB Article Destination Pages`; schema
  validation; host-context resolution; harness fixtures.

## Anti-coupling

TeamViewer imports nothing from the Kudos runtime. It composes
`@hbc/ui-kit/homepage` primitives and local helpers only.
