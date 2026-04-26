# Screenshot Context and Design Findings

## Supplied Screenshots

This package includes the newly supplied screenshots:

- `screenshots/project_spotlight_preview_context.png`
- `screenshots/company_pulse_preview_context.png`
- `screenshots/leadership_message_preview_context.png`

The screenshots show the preview fallback state, but the composition problem applies to both preview and production because the repo uses a shared reader shell and shared preview skeleton.

## Screenshot 1 — Project Spotlight + HB Kudos

Observed state:

- Project Spotlight occupies the left/major lane in Row 1.
- HB Kudos occupies the right/minor lane.
- Project Spotlight reads as a large independent card inside the shell rather than as an integrated editorial band.
- The reader has:
  - large bordered shell;
  - oversized “Project Spotlight reader” title;
  - detached preview status rail;
  - large image-placeholder panel;
  - content panel;
  - three support cards;
  - footer note.
- The left side still has visible page/shell gutter. The reader background does not bleed to the browser/window edge.

Interpretation:

- The layout direction is correct for a left-major editorial feature, but the composition is not sufficiently project-specific.
- The card chrome should be reduced. The Project Spotlight background/media treatment should be allowed to participate in the row edge, with internal safe-area padding for content.
- Project Spotlight should not use the same support-card skeleton as Leadership Message or Company Pulse.

Recommended direction:

- Edge-bleed visual story panel to the left.
- Project metadata ribbon.
- Large project media/visual area.
- “Why this project matters” editorial context.
- Project facts: client, location, market, team, milestone, edition date.
- Archive/gallery link as a secondary action, not a generic footer note.

## Screenshot 2 — Safety Field Excellence + Company Pulse

Observed state:

- Safety Field Excellence occupies the left/minor lane.
- Company Pulse occupies the right/major lane.
- Company Pulse repeats the same preview formula as Project Spotlight:
  - header;
  - preview status rail;
  - media block;
  - content block;
  - three support cards;
  - footer note.
- Company Pulse appears as a feature article, not as a newsroom/briefing digest.
- The right side does not truly bleed to the browser/window edge.

Interpretation:

- Company Pulse is the clearest mismatch between purpose and composition.
- It should feel like an active digest: current update, secondary updates, recognition/events/operations chips, and freshness/status signals.
- Because it is visually right-major in a right-dominant paired row, the edge-bleed logic must know it is on the right visual side. DOM order alone is unsafe.

Recommended direction:

- Right-edge newsroom band.
- Lead “latest update” panel.
- Compact secondary update stack.
- Date/freshness strip.
- News / event / recognition / operations chips.
- Optional mini timeline or pulse strip.
- Less reliance on large media placeholder.

## Screenshot 3 — Leadership Message + People and Culture

Observed state:

- Leadership Message occupies the left/major lane in Row 3.
- People and Culture occupies the right/minor lane.
- Leadership Message again uses the same feature-card structure:
  - large title;
  - status rail;
  - media placeholder;
  - content panel;
  - three support cards.
- The visual tone is darker, but the structure is still the same as Project Spotlight and Company Pulse.
- The layout feels like a generic content module, not an executive communication.

Interpretation:

- Leadership Message should be the most restrained of the three Foleon lanes.
- It should use an executive-letter or announcement layout, not a media-feature layout.
- Preview chrome should be quieter. The “preview” label should remain clear but should not dominate the executive communication.

Recommended direction:

- Executive message/letter layout.
- Portrait or monogram/byline area where available.
- Pull quote or key statement.
- Focused message body.
- Intent/context notes.
- Minimal supporting metadata.
- Calm gradient or paper-like editorial band, not a large media placeholder.

## Cross-Screenshot Finding

The visual sameness is not merely a styling issue. It is a composition issue.

Across all three screenshots, the following elements repeat:

- same top label pattern;
- same huge title pattern;
- same status rail location and geometry;
- same feature/media + copy grid;
- same three support cards;
- same footer note;
- same rounded card boundary;
- same trapped-in-grid feeling.

This confirms the need for lane-owned composition components, not only new color variables.

## Edge-to-Window Finding

The screenshots show multiple visible padding layers:

1. SharePoint canvas/page area or SPFx host wrapper.
2. Homepage entry/wrapper area.
3. `HbHomepageShell.module.css` post-hero shell padding.
4. Band grid gaps.
5. Reader fallback outer padding and border.
6. Internal reader layout padding.

Removing only the reader border will not produce edge-to-window behavior. It will only make the existing card look flatter inside the same padded container.

To let selected elements reach the window edge, the implementation needs a controlled shell/wrapper contract:

- identify full-bleed-eligible zones;
- identify visual side of each slot;
- neutralize shell inline padding only for those zones or allow child breakout using shell inset variables;
- preserve internal content safe areas;
- prove no horizontal overflow in SharePoint.

## User Position Check

The user’s assumption is correct: a shell styling modification is required for the three Foleon reader lanes to reach the edge of the window without padding. For the hero, the required modification is likely above or adjacent to the shell because the current `HbHomepageShell` is explicitly the post-hero operating layer.

The implementation should audit:

- the SPFx webpart root wrapper;
- the homepage entry stack;
- hero host/component CSS;
- SharePoint full-width section behavior;
- shell body inset variables;
- child lane wrapper CSS.

Do not treat the hero as if it is governed by the same slot-level Foleon lane code.
