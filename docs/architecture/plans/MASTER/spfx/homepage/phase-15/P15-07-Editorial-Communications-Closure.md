# P15-07 — Editorial Communications Redesign — Closure Note

## What changed

The three communications modules were redesigned so each has a distinct editorial character instead of being visually interchangeable content boxes sharing the same card treatment and text styles.

## Perception change (not just code)

### Before
- All three modules (CompanyPulse, LeadershipMessage, PeopleCulture) used the same `HbcHomepageSurfaceCard surface="editorial"` for both featured and secondary items
- All used `hpHeadingReset` (plain `margin: 0`), `hpContentParagraph` (8px top margin), and `hpSecondaryText` (0.75 opacity) — identical typography
- `HomepageCuratedContentCluster` had no variant support — same section accent, same featured container, same secondary grid for all three
- The only visual difference was content — structurally and visually, the three modules were interchangeable
- The communications zone read as "three identical cards with different text"

### After

#### CompanyPulse — news-digest character
- Variant `news`: warm section accent, warm-tinted featured container with 4px warm left accent border
- Featured headline: `1.125rem`/`700` with `-0.01em` letter-spacing — editorial authority
- Featured summary: `0.9375rem` at `55ch` max-width with `0.75` opacity — comfortable reading
- Featured metadata: italic style for freshness dates
- Category badge placed above headline (magazine hierarchy: category → headline → body)
- CTA with explicit top margin for visual breathing room

#### LeadershipMessage — executive character
- Variant `executive`: brand section accent, brand-tinted featured container with 4px brand left accent border and extra left padding
- "From Leadership" eyebrow above headline — establishes authority voice
- Featured headline: `1.125rem`/`700` in brand blue (`rgb(34, 83, 145)`) — formal, authoritative color
- Featured message: italic style with `1.7` line-height — quote-like presentation
- Attribution: stacked name (700 weight) + role (400 weight, 0.55 opacity) — formal signature treatment
- Secondary leader names in brand-blue-tinted color for consistency
- Visually distinct from news: brand accent vs warm accent, quote-like vs editorial hierarchy

#### PeopleCulture — celebration character
- Variant `celebration`: warm section accent, gradient warm-tinted featured container with warm border (no left accent — softer, more inviting)
- Event-type eyebrow ("Welcome", "Milestone", "Congratulations", "Recognition") above person name — celebratory framing
- Featured person name: `1.25rem`/`700` in warm brown (`rgb(180, 90, 40)`) — warm, personal
- Featured highlight: `0.9375rem` at `50ch` max-width — personal storytelling
- Secondary person names in warm brown — consistent warm identity
- Visually distinct from both news and executive: warm names, gradient container, no hard accent border

## Components changed

### HomepageCuratedContentCluster (`apps/hb-webparts/src/homepage/shared/`)
- Added `variant` prop: `'news' | 'executive' | 'celebration'`
- Each variant maps to a different `SectionAccent` (news→warm, executive→brand, celebration→warm)
- Three distinct featured container styles:
  - news: warm background, warm left accent border
  - executive: brand background, brand left accent border, extra left padding
  - celebration: warm gradient background, warm border (no left accent)
- Featured content no longer wrapped in `HbcHomepageSurfaceCard` — the variant container provides the treatment directly

### CompanyPulse (`apps/hb-webparts/src/webparts/companyPulse/`)
- Removed `HbcHomepageSurfaceCard surface="editorial"` wrapper — cluster now provides surface
- Passes `variant="news"` to cluster
- Featured: category badge moved above headline, headline scaled to `1.125rem`, summary to `0.9375rem` with max-width, metadata made italic
- Secondary: headline `0.9375rem`/`600`, summary `0.875rem` with muted color
- Removed unused `HbcHomepageEyebrow` import

### LeadershipMessage (`apps/hb-webparts/src/webparts/leadershipMessage/`)
- Removed `HbcHomepageSurfaceCard surface="editorial"` wrapper
- Passes `variant="executive"` to cluster
- Added `HbcHomepageEyebrow` "From Leadership" above featured headline
- Featured headline in brand blue, message in italic quote-like style
- Attribution redesigned as stacked name/role with explicit typography
- Secondary leader names in brand-blue-tinted color

### PeopleCulture (`apps/hb-webparts/src/webparts/peopleCulture/`)
- Removed `HbcHomepageSurfaceCard surface="editorial"` wrapper
- Passes `variant="celebration"` to cluster
- Added `HbcHomepageEyebrow` with event-type label ("Welcome", "Milestone", etc.)
- Featured person name in warm brown (`rgb(180, 90, 40)`) at `1.25rem`
- Featured highlight with `50ch` max-width for personal storytelling
- Secondary person names in warm brown for consistent identity

## How each module now differs

| Module | Tone | Color accent | Featured container | Distinctive element |
|---|---|---|---|---|
| CompanyPulse | Editorial, curated | Warm (orange) | Warm bg + warm left border | Category badge above headline |
| LeadershipMessage | Formal, authoritative | Brand (blue) | Brand bg + brand left border | "From Leadership" eyebrow, italic quote, stacked attribution |
| PeopleCulture | Warm, celebratory | Warm (brown) | Warm gradient bg + warm border | Event eyebrow, warm-brown names, no hard accent |

## Verification

- `@hbc/spfx-hb-webparts` check-types: pass
- `@hbc/spfx-hb-webparts` build: pass (344 KB JS, 1.66 KB CSS)
- `@hbc/spfx-hb-webparts` lint: pass (zero errors, zero warnings)
