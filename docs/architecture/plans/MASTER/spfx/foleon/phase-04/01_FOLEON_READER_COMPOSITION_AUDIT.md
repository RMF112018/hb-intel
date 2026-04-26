# Foleon Reader Composition Audit

## Executive Summary

The current Foleon homepage reader lanes are differentiated primarily by tone, copy, and color variables rather than by actual composition. The screenshots confirm the user-facing result: Project Spotlight, Company Pulse, and Leadership Message all read as variations of the same large rounded preview card, with similar header hierarchy, status rail, media block, content block, support cards, and footer note.

The repo-truth findings support this:

- `packages/foleon-reader/src/readers/FoleonReaderPreview.tsx` renders one shared preview skeleton for all reader tones.
- `packages/foleon-reader/src/readers/FoleonReaderModule.tsx` renders production through one shared shell/chrome pattern with lane tone labels.
- `packages/foleon-reader/src/readers/FoleonReaderModule.module.css` defines a shared `.readerPreviewFallback`, `.previewBanner`, `.previewLayout`, `.previewFeature`, `.previewSupport`, and `.previewSupportCard` system, then overrides only tone variables for spotlight/pulse/leadership.
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx` owns the band/slot placement and passes `shellRenderMode`, but it does not currently expose enough slot-side metadata for a child surface to know whether it is visually left, visually right, or full-width in a stacked state.
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.module.css` applies shell padding and grid gaps at the post-hero layer. This is one reason the Foleon readers cannot reach the edge of the available homepage window merely by changing reader CSS.
- `apps/hb-webparts/src/webparts/hbHomepage/shell/defaultPreset.ts` confirms the authored placement:
  - Row 1: Project Spotlight major-left with HB Kudos minor-right.
  - Row 2: Safety minor-left with Company Pulse major-right.
  - Row 3: Leadership Message major-left with People & Culture minor-right.

## Current Reader Architecture

### Embedded Lane Dispatch

`packages/foleon-reader/src/FoleonEmbeddedReaderLane.tsx` dispatches by lane:

```tsx
if (props.lane === 'projectSpotlight') return <ProjectSpotlightReader {...props} />;
if (props.lane === 'companyPulse') return <CompanyPulseReader {...props} />;
return <LeadershipMessageReader {...props} />;
```

This gives the repo a clean lane dispatch point, but the lane wrappers immediately delegate back into the same shared `FoleonReaderModule`.

### Lane Wrappers

Each lane wrapper sets:

- `config`
- `tone`
- `pageContext`
- reader event callbacks

The wrappers are structurally thin:

- `ProjectSpotlightReader.tsx` passes `tone="spotlight"`.
- `CompanyPulseReader.tsx` passes `tone="pulse"`.
- `LeadershipMessageReader.tsx` passes `tone="leadership"`.

### Shared Module

`FoleonReaderModule.tsx` owns:

- resolution/loading/error/preview/blocked/ready state
- mobile iframe open behavior
- telemetry callbacks
- shared production header, metadata rail, archive action area, iframe stage
- preview branch through `FoleonReaderPreview`

This is acceptable for runtime governance, but it is too much ownership for layout composition.

## Current Preview Behavior

`FoleonReaderPreview.tsx`:

- calls `previewCopyForTone(tone)`;
- returns one shared `<section>` skeleton;
- swaps `className`, `toneName`, title text, description text, cadence labels, governance notes, and support-card copy.

The preview uses shared structure:

- `.readerPreviewFallback`
- `.previewBanner`
- `.previewStatusRail`
- `.previewLayout`
- `.previewFeature`
- `.previewMediaPlaceholder`
- `.previewContentZone`
- `.previewMetadataGrid`
- `.previewSupport`
- `.previewSupportCard`
- `.previewFooterNote`

The reader lanes therefore do not have meaningful structural differentiation in preview.

## Current Production Behavior

Production ready-state rendering in `FoleonReaderModule.tsx` also uses one shared pattern:

- `<section className={shell + readerToneClass(tone)}>`
- `.chrome`
- `.hero`
- `.rail`
- `.readerStage`
- `.frameWrap`

Tone changes affect labels, accent classes, border radii, and some sizing, but the overall composition is still shared.

## Shell Embedding Analysis

Homepage zones:

- `ProjectPortfolioSpotlightZone.tsx` renders `FoleonHomepageLaneHost lane="projectSpotlight"` with occupant `project-portfolio-spotlight`.
- `CompanyPulseZone.tsx` renders `FoleonHomepageLaneHost lane="companyPulse"` with occupant `company-pulse`.
- `LeadershipMessageZone.tsx` renders `FoleonHomepageLaneHost lane="leadershipMessage"` with occupant `leadership-message`.

`FoleonHomepageLaneHost.tsx` creates the embedded Foleon runtime contract and mounts `FoleonEmbeddedReaderLane`.

The shell currently exposes useful attributes:

- `data-shell-band`
- `data-shell-band-orientation`
- `data-shell-columns`
- `data-shell-slot`
- `data-shell-occupant`
- `data-shell-column-span`
- `data-shell-render-mode`

However, it does not expose a direct child-consumable attribute for:

- visual side: left/right/full
- edge-bleed direction: left/right/both/none
- band layout as semantic paired/stacked

This matters because Company Pulse is in a right-dominant band where visual side cannot be inferred safely from DOM order.

## Why the Readers Feel Cookie-Cutter

Concrete causes:

1. Same preview skeleton for all lanes.
2. Same production shell/chrome for all lanes.
3. Same large title + status rail header pattern.
4. Same feature block geometry.
5. Same support-card count and card structure.
6. Same footer note treatment.
7. Lane-specific differences are mostly copy/tone variables.
8. Preview fallback reads like a generic placeholder rather than an accurate preview of lane-specific final organization.
9. Heavy outer border/radius/card chrome makes all lanes feel like independent cards instead of integrated homepage bands.
10. Shell padding/gaps keep the lanes trapped inside the grid envelope.

## Existing Composition Inventory

| Lane | Component Path | Homepage Occupant | Default Slot | Current Structural Differentiation |
|---|---|---:|---|---|
| Project Spotlight | `ProjectSpotlightReader.tsx` -> `FoleonReaderModule` | `project-portfolio-spotlight` | Row 1 major-left | Low; shared skeleton with spotlight tone |
| Company Pulse | `CompanyPulseReader.tsx` -> `FoleonReaderModule` | `company-pulse` | Row 2 major-right | Low; shared skeleton with pulse tone |
| Leadership Message | `LeadershipMessageReader.tsx` -> `FoleonReaderModule` | `leadership-message` | Row 3 major-left | Low; shared skeleton with leadership tone |

## Recommendation

Preserve the shared runtime and governance logic, but remove layout authority from the monolithic preview and production shells.

Use:

```ts
type FoleonReaderLayoutId =
  | 'project-spotlight-feature'
  | 'company-pulse-briefing'
  | 'leadership-message';
```

and a registry:

```ts
export const FOLEON_READER_LAYOUTS = {
  projectSpotlight: ProjectSpotlightReaderLayout,
  companyPulse: CompanyPulseReaderLayout,
  leadershipMessage: LeadershipMessageReaderLayout,
} as const;
```

Preview and production should both resolve to a normalized `FoleonReaderViewModel` and render through the same lane-specific layout.
