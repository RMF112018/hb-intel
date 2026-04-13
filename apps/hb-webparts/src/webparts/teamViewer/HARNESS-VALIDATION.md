# TeamViewer — Harness and Hosted Validation (Phase-01 Prompt-05)

## Manifest and mount wiring

- Manifest: `apps/hb-webparts/src/webparts/teamViewer/TeamViewerWebPart.manifest.json`
  - id: `c2f1b4e7-3a48-4d21-9c5e-7b82d4a6f901`
  - alias: `TeamViewerWebPart`
  - preconfigured properties include `heading`, `articleId`,
    `destinationKey`, `layout`, `density`, and
    `featureFlags.profileDetailDrawer: false`.
- Runtime contract: `teamViewerRuntimeContract.ts` exports the id as
  `TEAM_VIEWER_WEBPART_ID` so manifest and mount cannot drift.
- Mount registration: `apps/hb-webparts/src/mount.tsx` maps
  `TEAM_VIEWER_WEBPART_ID` to the `TeamViewer` renderer and threads
  `getGraphToken` + `assetBaseUrl` + `identity`.

## Dev-harness validation seam

- Tab route: `/?tab=team-viewer` on the dev harness.
- Tab component: `apps/dev-harness/src/tabs/TeamViewerTab.tsx`.
- Adapter: `apps/dev-harness/src/harness/teamViewerHarness.ts` exposes
  `window.__teamViewerSeed(scenario)` and
  `window.__teamViewerScenarios`.

The tab renders the real TeamViewer sub-components (surface, card,
drawer, loading/empty/error states, selectors, CSS-var bridge) so
every interaction and photo seam is exercised on the actual code.
The data-hook path is bypassed because the article lists are not yet
provisioned in the tenant — once the lists are live, the same tab can
be repointed at `TeamViewer` directly.

## Validated scenarios

| Scenario key | What it proves |
|---|---|
| `normal` | Baseline rendering with a 4-person team. |
| `empty` | Surface renders `TeamViewerEmptyState` when people are empty. |
| `missing-photos` | No photo URLs, SP resolver misses → initials avatars. |
| `missing-titles` | Tiles still render rhythmically when `jobTitle` is absent. |
| `ordered-children` | `sortPeople` orders by `sortOrder` ascending, ties break on name. |
| `large-team` | Grouped layout with `Core Team` + `Extended Team` buckets at compact density. |
| `partial-malformed` | Long names ellipsize; missing identity doesn't break layout. |
| `host-context-resolved` | Surface renders when binding resolves from host context. |
| `host-context-unresolved` | Article-unresolved empty variant displays intentional copy. |
| `drawer-disabled` | Tiles render as static `<article>` elements; drawer DOM absent. |
| `drawer-enabled` | Tiles are `<button>` with ArrowRight affordance; drawer opens. |

## Drawer validation (flag enabled)

- **Open:** click a tile (or Enter / Space) → drawer slides in from right.
- **Close:** click the `✕` button, click the backdrop, or press
  `Escape`. Focus restores to the previously-focused tile.
- **Keyboard:** drawer grabs initial focus on the close button; Escape
  keydown is listened at the window level and stops propagation.
- **Reduced motion:** respects `useHomepageReducedMotion`; slide
  animation is replaced with a straight fade.
- **Flag off (default):** drawer component is never mounted; tiles
  render as `<article>` with no click handler.

## Hosted-style runtime confidence

- `useTeamViewerHostSafeLayout` detects the iframed runtime and
  reserves the same bottom-right safe zone as Kudos so any persistent
  assistant overlay in the host page does not overlap the viewer.
- Manifest version is tracked in the SharePoint 4-part schema; each
  Prompt bumps the solution + feature version so the app catalog
  refreshes assets without manual intervention.
- The dev-harness tab renders the full premium surface stack
  (nameplate header, motion entry, ArrowRight affordance, drawer
  with focus/Escape/reduced-motion) so closure-reviewer evidence is
  visual *and* interactive.

## Remaining defects / follow-ups

- **Lists not yet provisioned**: `articles` /
  `articleTeamMembers` / `articleDestinationPages` GUIDs are empty
  in the registry. Runtime degrades to empty state as documented in
  `data/SCHEMA-NOTES.md`. Populate the GUIDs when the lists go live.
- **Schema additions for drawer**: RESOLVED. `ResumeRichText`,
  `ResumeDocumentUrl`, and `ResumeDocumentLabel` are provisioned by
  `provision-publisher-lists.ps1` alongside the pre-existing
  `BioSnippet` and `ContactLink`. See `data/SCHEMA-NOTES.md` for the
  locked field table.
- **Shared photo hook**: when a second webpart needs the same layered
  photo hydration, promote `hooks/useTeamViewerPhotoHydration.ts` to
  `homepage/shared/usePersonPhotoHydration.ts`.
