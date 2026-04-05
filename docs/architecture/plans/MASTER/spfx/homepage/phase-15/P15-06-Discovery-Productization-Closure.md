# P15-06 — Discovery and Launcher Productization — Closure Note

## What changed

The icon strategy, discovery cluster composition, and search treatment were rebuilt so the discovery zone feels like a premium discovery product rather than a generic search box in a card.

## Perception change (not just code)

### Before
- Icons used text-initials (`FI`, `HR`, `SF`, `QC`) — placeholder-grade abbreviations that required explanation
- Discovery fallback icon was a bullet (`•`)
- Search input was a plain `<input>` in a `rgba(0,0,0,0.015)` tinted box with `rgba(0,0,0,0.25)` border
- Quick paths used `sm` (28px) icon frames with brand tint and arrow text (`→`)
- Promoted destinations used `md` (36px) icon frames — barely distinguishable from quick paths
- Category groups used the same `subtle` tint icon frames as everything else
- Section headings were a generic `0.8125rem` at `0.65` opacity
- Search focus just changed border color to brand blue
- The entire zone looked like "we added a search box to a card"

### After
- **Semantic Unicode icons**: finance→`$`, field→`◉`, hr→`☺`, safety→`⛨`, quality→`✔`, risk→`⚠`, ops→`⚙`, admin→`☰`, legal→`§`, it→`⌨`, plus 10 more domain-specific symbols
- Discovery fallback icon is now `→` (directional arrow, not bullet)
- **Premium search container**: warm-gradient background (`rgba(229,126,70,0.04)→0.02`), warm-colored border, `10px` editorial radius
- **Search input**: larger padding (`12px 16px`), `2px` warm border, `0.9375rem` font, semi-transparent white background
- **Search focus**: warm accent border (`rgba(229,126,70,0.50)`), warm glow shadow (`3px rgba(229,126,70,0.12)`), white background
- **Quick paths**: `md` (36px) icon frames with `warm` tint — orange-toned, distinct from command surfaces
- **Promoted destinations**: `xl` (56px) icon frames with `warm` tint, featured tile treatment with warm border and background
- **Category resources**: `md` (36px) icon frames with `brand` tint — stepped up from `sm`/`subtle`
- **Section headings**: warm-colored `0.75rem`/`700` uppercase labels with `2px` warm accent bottom border
- **Category group headers**: `0.875rem`/`700` weight, full color — not muted
- **Section shell**: uses `accent="warm"` for warm-themed header bar
- The discovery zone now reads as a browsable destination product

## Components changed

### Icon resolver (`apps/hb-webparts/src/homepage/helpers/iconResolver.ts`)
- Replaced `UTILITY_ICON_MAP` from 10 text-initial entries (`FI`, `HR`, etc.) to 20 semantic Unicode symbols
- Added 6 new domain-specific keys: `project`, `report`, `schedule`, `email`, `document`, `team`, `form`, `policy`, `search`, `link`
- Utility fallback: `AP` → `⮚` (right arrowhead)
- `DISCOVERY_ICON_MAP` now extends utility map plus type-based mappings (`tool`→`⚙`, `form`→`✎`, `policy`→`≡`, `system`→`⌨`, `teamSpace`→`⌂`, `destination`→`↗`)
- Discovery fallback: `•` → `→` (right arrow)
- Both resolvers now normalize input to lowercase before lookup

### HomepageDiscoveryCluster (`apps/hb-webparts/src/homepage/shared/`)
- Search area: background changed from `rgba(0,0,0,0.015)` with subtle border to warm gradient with warm border at editorial radius
- Search input: padding, font-size, border weight, and background all increased for premium presence
- Search label: warm-colored (`rgba(180,90,40,0.7)`), 700 weight, uppercase
- Quick paths: icon frame `sm`→`md`, tint `brand`→`warm`, arrow icon `→` moved to icon resolver
- Promoted destinations: icon frame `md`→`xl`, tint `brand`→`warm`, featured tile with warm border and background
- Category resources: icon frame `sm`→`md`, tint `subtle`→`brand`
- Section headings: changed to warm-colored labels with accent bottom border
- Section shell: passes `accent="warm"` for warm-themed header

### Search CSS (`apps/hb-webparts/src/homepage/homepage-interactive.module.css`)
- Added `.searchInput:hover` state with warm border darkening and white background
- Focus: changed from brand-blue border+shadow to warm accent border (`rgba(229,126,70,0.50)`) with warm glow shadow (`3px rgba(229,126,70,0.12)`) and white background
- Added `background-color` to transition properties

## Verification

- `@hbc/spfx-hb-webparts` check-types: pass
- `@hbc/spfx-hb-webparts` build: pass (342 KB JS, 1.66 KB CSS)
- `@hbc/spfx-hb-webparts` lint: pass (zero errors)
- Keyboard focus: warm accent outline preserved on search input, focus-visible on all action rows
- Reduced-motion: search input transitions covered by existing blanket rule
