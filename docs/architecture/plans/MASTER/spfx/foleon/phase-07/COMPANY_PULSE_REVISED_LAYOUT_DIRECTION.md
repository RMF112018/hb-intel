# Company Pulse Revised Layout Direction — Edition Launcher

## Corrected target

Company Pulse is not a feed, newsroom database, or article manager.

It is:

> the employee-facing launcher for the current Foleon-managed Company Pulse edition.

## Recommended layout: Company Pulse Edition Launcher

```text
[Full-bleed/edge-ready warm editorial surface]

Top line:
  COMPANY PULSE
  Current edition / Latest update / Preview

Hero/edition area:
  Large edition title
  1-2 sentence teaser from the active Foleon record summary
  Optional media/cover treatment from heroImageUrl or thumbnailUrl
  Last updated / published date as employee-facing freshness cue
  Single visual CTA: Open Company Pulse

Supporting strip:
  Coverage cues only:
    Company News
    Events
    Recognition
    Operations
  These are labels, not filters, unless future real routing exists.

Footer:
  Optional: View previous editions / archive
  Optional: availability / preview label
```

## Visual direction

- Use the Project Spotlight "showcase" idea as the model: one strong editorial card, not nested cards.
- Create a newsroom/communications-specific treatment:
  - warm editorial gradient;
  - publication-cover visual area;
  - concise teaser copy;
  - lower visual noise;
  - no grid of fake stories.
- Do not show four sample story cards in ready state.
- Do not let preview sample content look like real content.
- Do not make "News / Events / Recognition / Operations" look like active tab filters in Phase 1.

## Ready state behavior

Ready state should render only real record-backed data:
- title;
- summary;
- image URLs if present;
- lastEditorialUpdate or publishedOn;
- target state;
- archive action if supported.

If there is only one active Company Pulse record, the lane should say, effectively:

> "The latest Company Pulse edition is available. Open the full Foleon publication for this week's company updates."

It should not imply there are multiple live article cards.

## Preview state behavior

Preview may show sample structure, but the labels must be explicit:
- "Preview — no live Company Pulse edition selected"
- "Sample coverage areas"
- "Open preview" launches local preview content, not iframe content.

## Copy replacements

| Current/problematic | Replace with |
|---|---|
| Company Pulse reader | Company Pulse |
| Preview layout | Preview — no live edition selected |
| Frequent | Current updates |
| Latest update | Current edition |
| More updates | Previous editions |
| Sample latest update | Sample Company Pulse edition |
| Sample news update | Sample coverage area: Company news |
| Open full archive | View previous editions |
| Editorial summary has not been provided | Summary pending — open the Foleon edition when available |

## Data honesty

Do not invent:
- secondary articles;
- story counts;
- authors;
- read time;
- category assignments;
- individual article thumbnails;
- event details;
- recognition details;
- operations notes.

Those belong in the Foleon publication unless HB explicitly creates a separate article registry later.
