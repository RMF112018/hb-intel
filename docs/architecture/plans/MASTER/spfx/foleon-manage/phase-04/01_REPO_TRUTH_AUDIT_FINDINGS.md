# 01 — Repo-Truth Audit Findings

## Scope

This audit reviewed current `main` source for `hb-intel-foleon` and the supporting homepage/UI doctrine files. The attached user prompt required a planning and prompt package only, not implementation.

## Repo-truth files reviewed

- `apps/hb-intel-foleon/src/FoleonApp.tsx`
- `apps/hb-intel-foleon/src/pages/HighlightsPage.tsx`
- `apps/hb-intel-foleon/src/pages/ContentHubPage.tsx`
- `apps/hb-intel-foleon/src/pages/ReaderPage.tsx`
- `apps/hb-intel-foleon/src/pages/ManagePage.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ManageOrchestrator.tsx`
- `apps/hb-intel-foleon/src/components/FoleonCard.tsx`
- `apps/hb-intel-foleon/src/components/FoleonStates.tsx`
- `apps/hb-intel-foleon/src/services/FoleonContentService.ts`
- `apps/hb-intel-foleon/src/services/FoleonPlacementService.ts`
- `apps/hb-intel-foleon/src/services/FoleonTelemetryEmitter.ts`
- `apps/hb-intel-foleon/src/types/foleon-content.types.ts`
- `apps/hb-intel-foleon/src/runtime/foleonRuntimeContract.ts`
- `apps/hb-intel-foleon/src/mount.tsx`
- `apps/hb-intel-foleon/src/webparts/foleon/runtimeContract.ts`
- `apps/hb-intel-foleon/src/webparts/foleon/FoleonWebPart.manifest.json`
- `tools/spfx-shell/src/webparts/shell/foleonRuntimeConfigBridge.ts`
- `apps/hb-intel-foleon/package.json`
- `apps/hb-intel-foleon/README.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`


## Current route architecture

`FoleonApp.tsx` is the route orchestrator. It resolves navigation from `contract.route` and URL query parameters, then renders one of four routes:

| Route | Source component | Current purpose |
|---|---|---|
| `highlights` | `HighlightsPage` | Homepage card surface |
| `hub` | `ContentHubPage` | Archive/search view |
| `reader` | `ReaderPage` | SharePoint-hosted gated iframe reader |
| `manage` | `ManagePage` → `ManageOrchestrator` | Backend-governed management workflow |

Key observations:

- `readNavFromLocation()` accepts only `reader`, `hub`, `manage`, and `highlights`.
- `renderPage()` preserves reader gating and routes telemetry through `emit`.
- `openReader()` emits `Card Click` before routing to the reader.
- `openExternal()` emits `External Open` before opening `record.publishedUrl`.
- `onCardImpression()` emits `Card Impression` for every rendered live card.
- `contract.canInitialize === false` renders a top-level `FoleonError`; the preview fallback must not interfere with this fail-closed behavior.

## Current runtime proof and diagnostics posture

`mount.tsx` publishes `window.__hbIntel_foleonRuntimeBindingProof` on every mount. The proof includes:

- package and manifest identity;
- host mode, route, and `canInitialize`;
- redacted presence booleans for list IDs, origin allowlist, route, doc ID, API URL/resource;
- fingerprints rather than raw GUIDs/URLs;
- governance status;
- property bridge diagnostics;
- typed issue codes;
- admin issue details only when `?foleon-diagnostics=1`.

`foleonRuntimeContract.ts` blocks hosted initialization for missing site URL, missing content registry, missing placements on Highlights, empty origin allowlist, manifest mismatch, and package mismatch.

**Finding:** Preview fallback must be downstream of `canInitialize`. It must not change runtime contract resolution, proof semantics, issue code semantics, or diagnostics behavior.

## Current package/version truth

- `FOLEON_PACKAGE_VERSION = '1.0.16.0'`
- Webpart manifest version: `1.0.16.0`
- Manifest ID: `2160edb3-675e-4451-92bb-8345f9d1c71e`
- `package.json` package name: `@hbc/spfx-hb-intel-foleon`
- Build/test scripts:
  - `build`
  - `check-types`
  - `lint`
  - `test`
  - `schema:validate`
  - `package:proof`
  - `provision:print`

**Recommendation:** If this fallback changes runtime behavior and ships as one branch, bump the package to `1.0.17.0` only in the final packaging prompt.

## Current data loading behavior

### Highlights

`HighlightsPage.tsx` currently:

1. Verifies `siteUrl`, `placementsListId`, and `contentRegistryListId`.
2. Fetches active placements and published homepage-eligible content in parallel.
3. Calls `materializeHighlights(placements, content)`.
4. If placements resolve to content, renders resolved records ordered by placement rank.
5. If no placements resolve, falls back to latest homepage-eligible content, sliced to six.
6. If resulting `records.length === 0`, renders `FoleonEmpty`.
7. Calls `onCardImpression(records)` after every successful ready load, including an empty array.

**Finding:** This is the primary insertion point for the Highlights preview fallback. It should be triggered only after successful fetch + `materializeHighlights()` resolves zero records.

### Content Hub

`ContentHubPage.tsx` currently:

1. Verifies `siteUrl` and `contentRegistryListId`.
2. Fetches published content records.
3. Tracks local `query` and `typeFilter`.
4. Computes `filtered` records.
5. If `filtered.length === 0`, always renders filter-oriented `FoleonEmpty` copy: “No publications match your filters.”

**Finding:** The Hub needs two empty states:
- configured + registry returns zero records: full preview fallback;
- registry has records but current search/filter returns zero: current filter empty state.

### Reader

`ReaderPage.tsx`:

- fetches a single registry record by `docId`;
- calls `evaluateFoleonReaderGate`;
- only renders `FoleonIframeHost` when the gate passes;
- blocks missing record, non-visible, non-published, embed-disallowed, external-only, no URL, origin-not-allowlisted, preview-url-blocked, future window, and past window;
- does not render a preview iframe.

**Finding:** Do not add an automatic reader preview. Missing `docId` should remain an error, or at most route to a clearly labeled static preview only if a future explicit preview route is approved.

### Manager

`ManagePage.tsx` is a thin wrapper over `ManageOrchestrator`. `ManageOrchestrator`:

- creates a backend-governed management API;
- blocks if hosted and no backend API/token path exists;
- loads content, placements, sync status, and runs;
- shows metric cards, registry panel, editor panel, placement panel, and sync panel;
- renders `FoleonEmpty` inside the editor panel when no registry records exist.

**Finding:** Management workflows should remain authoritative. Add a non-blocking guidance panel only if it helps admins understand that public pages will show preview/sample content until real records exist.

## Current display model

`FoleonCard.tsx` is the primary card renderer.

Current behavior:

- Displays content type badge, issue/published date, featured badge.
- Displays `heroImageUrl` or `thumbnailUrl` depending on variant.
- Displays title, summary, and project label.
- Shows “Open externally” only if `publishedUrl` exists and is not a `/preview/` URL.
- Always shows `Read` button, which calls `onOpen(record)`.

**Finding:** Preview cards can reuse much of `FoleonCard`, but not directly without safe action handling. A preview-aware wrapper or card prop is needed so the primary action reads “Preview only” or “Sample only” and is disabled/non-routing.

## Current loading / empty / error states

`FoleonStates.tsx` owns:

- `FoleonLoadingState`: spinner + polite `role=status`.
- `FoleonEmpty`: thin wrapper around `HbcEmptyState`.
- `FoleonError`: alert-style panel with optional retry/external action.

**Finding:** Current empty states are functionally safe but too generic for the desired first-run experience. Preview fallback should be separate from generic `FoleonEmpty` and should explain the intended final state.

## Current telemetry behavior

`FoleonTelemetryEmitter.ts` centralizes event envelopes. It supports:

- `Card Impression`
- `Card Click`
- `External Open`
- `Reader Open`
- `Reader Close`
- `Embed Error`
- `Search`

Envelopes include package/manifest identity, route, page context, record IDs where provided, and privacy class `telemetry-minimal`.

**Finding:** Preview content must not call existing live telemetry pathways. Do not pass preview records into `onCardImpression`, `onOpenReader`, or `onOpenExternal`.

## Governance and UI doctrine findings

The reviewed doctrine and scorecard require:

- clear empty/loading/error states;
- author-safe behavior when minimally or partially configured;
- non-generic homepage composition;
- explicit breakpoint behavior;
- no dead/deceptive CTAs;
- host-safe SharePoint behavior;
- clear state-model separation;
- no fake shell chrome;
- credible compact/touch behavior;
- packaging truth matching source truth.

**Gap:** Current Foleon empty states are safe but not benchmark-grade. They do not show the intended editorial/Foleon experience, do not provide a first-run visual sample, and do not sufficiently distinguish “configured but no content yet” from “filters returned no matches.”

## Implementation gaps to close

1. Add a preview state model that is clearly distinct from live records.
2. Add preview fixture data that cannot be mistaken for real Foleon registry data.
3. Add preview-safe cards/actions that do not route or emit live telemetry.
4. Split Content Hub empty logic into zero-live-content vs. zero-filter-match.
5. Preserve current config-error handling and runtime proof.
6. Preserve reader gate behavior.
7. Add tests proving preview only renders under configured-empty conditions.
8. Add tenant validation instructions for empty lists and live-content precedence.

## External subject-matter sources consulted

- Microsoft Learn — SharePoint Framework property pane configuration: property panes expose configurable web part properties and support pages/groups/fields, including text fields, toggles, dropdowns, and custom controls.
- Microsoft Learn — SPFx preconfigured entries: manifest `preconfiguredEntries` can initialize web parts with scenario-specific defaults.
- Microsoft Learn — SPFx custom property pane controls: custom controls are appropriate when async or richer configuration behavior is needed.
- Microsoft Fluent 2 — Skeleton / shimmer guidance: loading placeholders should reflect the final layout structure, remain simple, and avoid long-running indeterminate illusions.
- Fluent 2 Accessibility guidance: accessible experiences require clear structure, predictable navigation, visible focus, and WCAG contrast.
- MDN ARIA `aria-busy` and `status` role: dynamic loading/status regions should communicate state politely and avoid disruptive focus changes.
- Foleon knowledge base — embed element guidance: embeds require a source URL, and whether a page can be embedded depends on source-site settings.

