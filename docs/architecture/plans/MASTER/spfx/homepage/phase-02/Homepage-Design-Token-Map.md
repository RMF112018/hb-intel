# Homepage Design Token Map

Local design token system for `apps/hb-webparts`. Defined in `src/homepage/tokens.ts`.

These tokens are LOCAL to the homepage package — not exported via `@hbc/ui-kit`. Promotion to ui-kit requires 2+ non-homepage consumers.

## Spacing Scale (`HP_SPACE`)

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px | Tightest gap — action descriptions, inline metadata |
| `sm` | 6px | Compact gap — utility tile grids, list items, search input margin |
| `md` | 8px | Standard gap — badge rows, heading-to-content, icon margins |
| `lg` | 10px | Card interior — featured/secondary item padding |
| `xl` | 12px | Section rhythm — grid-to-section, CTA margin, zone flex gap |
| `2xl` | 16px | Generous interior — featured card padding |
| `3xl` | 20px | Hero interior padding |

## Border Radius (`HP_RADIUS`)

| Token | Value | Usage |
|-------|-------|-------|
| `image` | 6px | Image/media clipping |
| `card` | 8px | Standard card and container radius |
| `hero` | 10px | Hero banner / prominent surface |

## Border Treatment (`HP_BORDER`)

| Token | Value | Usage |
|-------|-------|-------|
| `subtle` | `1px solid rgba(0,0,0,0.08)` | Secondary containers |
| `standard` | `1px solid rgba(0,0,0,0.12)` | Featured cards, standard containers |
| `interactive` | `1px solid rgba(0,0,0,0.25)` | Input/interactive borders |

## Text Opacity (`HP_TEXT_OPACITY`)

| Token | Value | Usage |
|-------|-------|-------|
| `secondary` | 0.75 | Metadata, timestamps, freshness labels, descriptions |
| `muted` | 0.85 | Slightly muted but still prominent (hero metadata) |

## Image Sizing (`HP_IMAGE`)

| Token | Value | Usage |
|-------|-------|-------|
| `featuredMaxHeight` | 220px | Leadership/editorial hero images |
| `compactMaxHeight` | 180px | People/secondary images |
| `objectFit` | `cover` | All media |

## Layout (`HP_LAYOUT`)

| Token | Value | Usage |
|-------|-------|-------|
| `welcomeMinWidth` | 280px | Welcome header min width in top-band |
| `heroMinWidth` | 320px | Hero banner min width in top-band |
| `utilityGroupMinWidth` | 220px | Utility group min width |
| `welcomeFlex` | `1 1 280px` | Welcome flex in top-band pair |
| `heroFlex` | `2 1 440px` | Hero flex in top-band pair |

## Hero Surface (`HP_HERO`)

| Token | Value | Usage |
|-------|-------|-------|
| `gradientWithImage` | Branded blue→orange gradient at 120° | Hero with background image |
| `gradientFallback` | Deeper blue gradient at 135° | Hero without background image |
| `textColor` | `#ffffff` | Text on gradient background |

## Pre-Composed Style Fragments

Shared `React.CSSProperties` objects for common patterns:

| Fragment | Usage |
|----------|-------|
| `hpHeadingReset` | Heading with `margin: 0` |
| `hpSecondaryText` | Secondary text with standard margin + secondary opacity |
| `hpContentParagraph` | Content paragraph with standard top margin |
| `hpBadgeRow` | Flex wrap row for status badges |
| `hpFeaturedContainer` | Featured item with standard border and padding |
| `hpSecondaryGrid` | Grid layout for secondary items |
| `hpSecondaryCard` | Secondary item card with subtle border |
| `hpFeaturedImage` | Featured media with max-height and cover fit |
| `hpCompactImage` | Compact media with smaller max-height |
| `hpListStyle` | List with indent and grid gap |
| `hpZoneFlexLayout` | Zone-level flex wrap with standard gap |
