# Config Options Matrix

## Operating rule
All 3 rows use the canonical band key `homepage-primary`, but only **one** row should be live at a time for that band.

| Config Name | Band Key | Enabled | IsActive | Heading Text | Overflow Label | Show Heading | Sticky After Hero | Show Badges | Desktop Layout | Tablet Layout | Mobile Layout | Max Desktop | Max Laptop | Max Tablet Landscape | Max Tablet Portrait | Max Phone | Open External In New Tab By Default | Admin Notes Recommendation | Rationale |
|---|---|---:|---:|---|---|---:|---:|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|---|
| Homepage Priority Actions | `homepage-primary` | Yes | Yes | blank | `More tools` | No | No | Yes | `rail` | `grid` | `sheet-trigger` | 5 | 5 | 4 | 4 | 4 | Yes | Live default profile for the mixed internal/external workplace shortcut set. | Best fit for the current action catalog and aligns with the existing runner/runtime defaults while still supporting grouped data if added. |
| Homepage Priority Actions - Compact | `homepage-primary` | No | No | blank | `More tools` | No | Yes | No | `hybrid` | `rail` | `scroll` | 7 | 6 | 5 | 4 | 4 | Yes | Alternate compact preset. Activate only after deactivating the live standard row. | Optimized for utility-first browsing when more actions should remain immediately visible above the fold. |
| Homepage Priority Actions - Guided | `homepage-primary` | No | No | `Priority Actions` | `All tools` | Yes | No | No | `segmented` | `hybrid` | `sheet-trigger` | 4 | 4 | 4 | 3 | 3 | Yes | Alternate grouped preset. Activate only after deactivating the live standard row. | Optimized for wayfinding when maintainers want stronger sectioning and less cognitive load on smaller surfaces. |

## Why these 3 profiles are meaningfully different
1. **Standard** preserves the current expected operating posture and is the safest live default.
2. **Compact** increases immediate visibility and makes the rail behave more like a utility shelf.
3. **Guided** uses grouping and a heading to make the catalog easier to scan when the maintainer wants a more structured presentation.

## Validation reminders
- Breakpoint caps must be integers from 1 to 20.
- Breakpoint caps must be non-increasing from desktop to phone.
- Duplicate active rows for `homepage-primary` are invalid.
