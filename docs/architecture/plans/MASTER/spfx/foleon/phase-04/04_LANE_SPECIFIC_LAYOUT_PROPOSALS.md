# Lane-Specific Layout Proposals

## Shared Principles

All three Foleon reader lanes should follow these shared rules:

- Preview and production use the same lane-specific composition frame.
- Preview content remains clearly labeled as sample/preview.
- Production Foleon governance remains unchanged.
- The iframe remains gated and telemetry boundaries remain intact.
- The outer heavy reader card is removed or reduced.
- The gradient/background may bleed to the shell/window edge based on slot-side metadata.
- Internal content safe areas are preserved.
- Each lane uses a distinct layout, not just different accent colors.

## Recommended Shared View Model

```ts
export interface FoleonReaderViewModel {
  lane: 'projectSpotlight' | 'companyPulse' | 'leadershipMessage';
  state: 'preview' | 'ready';
  title: string;
  summary?: string;
  eyebrow: string;
  previewLabel?: string;
  freshnessLabel: string;
  freshnessValue: string;
  audience?: string;
  archiveGroup?: string;
  primaryActionLabel: string;
  secondaryActionLabel?: string;
  media?: {
    kind: 'preview-gradient' | 'image' | 'iframe';
    src?: string;
    alt?: string;
  };
  facts: ReadonlyArray<{ label: string; value: string }>;
  chips: ReadonlyArray<string>;
  supportItems: ReadonlyArray<{ title: string; body: string; kind?: string }>;
  quote?: string;
  byline?: {
    name?: string;
    role?: string;
    photoUrl?: string;
  };
}
```

## Project Spotlight Layout

### Intent

Project Spotlight is a monthly, visual, editorial feature. It should feel like a project profile, not a generic content card.

### Desktop Paired Layout

When Project Spotlight is in the major-left slot:

- Background/visual band bleeds left.
- Right side remains internally padded and aligned to the paired grid.
- Large visual story panel on the left.
- Content block on the right:
  - `PREVIEW — MONTHLY PROJECT PROFILE` or production equivalent.
  - title;
  - short summary;
  - project metadata ribbon;
  - “Why this project matters” block;
  - facts row/grid.
- Archive/gallery link appears as a secondary action.

### Desktop Full-Width / Stacked Layout

- Visual panel spans top or left depending container width.
- Metadata ribbon sits below hero text.
- Facts become a 2–4 column row.
- Archive/gallery action is visible but secondary.

### Tablet Layout

- Visual panel becomes a wide banner.
- Text and facts stack below.
- Facts reduce to two columns.

### Mobile Layout

- Bleed to both sides.
- Internal safe area remains.
- Visual panel is a shorter image band.
- Facts become a compact list.
- Only one primary CTA is emphasized.

### Preview Equivalent

Preview uses the same layout with:

- sample gradient media;
- clearly labeled preview badge;
- placeholder project facts;
- no live iframe telemetry;
- archive/gallery described as coming soon.

### Production Equivalent

Production uses:

- active Foleon record title/summary;
- configured issue date / publish date;
- audience/archive metadata;
- iframe launch or inline iframe behavior based on current reader rules.

### Distinctive Elements

- Project-specific fact ribbon.
- “Why this project matters.”
- Visual story panel.
- Fewer support cards; more project-story modules.

## Company Pulse Layout

### Intent

Company Pulse is a frequent company digest: news, events, recognition, and operational updates.

### Desktop Paired Layout

When Company Pulse is in the major-right slot:

- Background/briefing band bleeds right.
- Content structure is newsroom-like:
  - compact top masthead;
  - freshness/date strip;
  - lead latest update;
  - secondary updates stack;
  - category chips;
  - mini pulse/timeline strip.
- Media, if any, is secondary and small.

### Desktop Full-Width / Stacked Layout

- Lead story spans top.
- Secondary updates arrange in a grid.
- Chips and pulse strip remain visible.

### Tablet Layout

- Lead story first.
- Secondary updates collapse to two-column or stacked list.
- Category chips wrap.

### Mobile Layout

- Bleed to both sides.
- Latest update card first.
- Secondary updates become simple list rows.
- Archive action becomes compact.

### Preview Equivalent

Preview uses the same newsroom layout with:

- sample update categories;
- clearly labeled preview status;
- “awaiting active Company Pulse edition” language;
- no live telemetry.

### Production Equivalent

Production uses:

- latest active edition;
- last editorial update;
- audience/archive group;
- configured live Foleon record.

### Distinctive Elements

- Newsroom briefing, not feature story.
- Current update + secondary updates.
- Freshness and cadence emphasis.
- Category chips and/or pulse strip.

## Leadership Message Layout

### Intent

Leadership Message is an executive communication. It should feel calm, premium, and authoritative.

### Desktop Paired Layout

When Leadership Message is in the major-left slot:

- Background bleeds left with restrained gradient or paper-like surface.
- Layout resembles a letter:
  - byline/portrait/monogram panel;
  - message title;
  - pull quote/key statement;
  - short message body;
  - intent/context notes;
  - archive link.
- Avoid a large decorative media placeholder unless production provides a leadership portrait or specific editorial visual.

### Desktop Full-Width / Stacked Layout

- Message column remains centered/readable.
- Byline/portrait appears above or beside text.
- Pull quote becomes a prominent line.

### Tablet Layout

- Byline/portrait stacks above message body.
- Intent/context notes become a small row or list.

### Mobile Layout

- Bleed to both sides.
- Paper/message safe area remains.
- Byline, message, and CTA stack.
- Avoid large blocks that consume the first viewport.

### Preview Equivalent

Preview uses the same executive-message layout with:

- sample byline/monogram;
- preview label;
- sample pull quote;
- no iframe telemetry;
- clear active-edition pending state.

### Production Equivalent

Production uses:

- active leadership record title/summary;
- published/last editorial date;
- audience/archive group;
- optional byline/portrait if available through future content configuration;
- current iframe governance.

### Distinctive Elements

- Letter/announcement structure.
- Pull quote.
- Byline/portrait.
- Minimal support metadata.
- Restrained visual tone.

## Border / Chrome Recommendation

Remove the heavy outer reader border as the default lane chrome.

Recommended pattern:

- Use a tone-specific background band with optional edge bleed.
- Preserve internal safe area.
- Use subtle internal dividers or small bordered panels only where needed.
- Keep focus outlines visible and not clipped.
- Use shadow selectively, preferably internal/panel-level rather than full outer-card shadow.

Why:

- The current card border reinforces the cookie-cutter issue.
- Edge-bleed backgrounds will integrate the reader with the homepage shell better than isolated cards.
- Internal dividers keep content organized without making each lane feel like a boxed web part.
