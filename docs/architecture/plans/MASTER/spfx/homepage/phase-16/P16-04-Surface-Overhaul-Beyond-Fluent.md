# P16-04 — Homepage Surface Overhaul Beyond Fluent — Closure Note

## What changed

All 8 homepage webparts migrated from Phase 15 Fluent-adjacent primitives (HbcHomepageSurfaceCard, HbcHomepageIconFrame, HbcStatusBadge, HbcHomepageCta, HbcHomepageEyebrow, HbcHomepageMetadataRow) to Phase 16 premium primitives (HbcPremiumSurface, HbcPremiumIcon, HbcPremiumBadge, HbcPremiumCta, HbcPremiumSection) with lucide-react SVG icons throughout.

## Migration summary

| Webpart | Old primitives removed | New primitives adopted |
|---|---|---|
| PriorityActionsRail | HbcHomepageSurfaceCard, HbcHomepageIconFrame (Unicode), HbcStatusBadge | HbcPremiumSurface intent="command", HbcPremiumIcon (AlertTriangle/AlertCircle/CheckCircle2/ArrowRight), HbcPremiumBadge, HbcPremiumSection icon={Briefcase} |
| ToolLauncherWorkHub | HbcHomepageSurfaceCard, HbcHomepageIconFrame (resolveUtilityIconContent), HbcStatusBadge | HbcPremiumSurface intent="command", HbcPremiumIcon (11 lucide icons via resolveToolIcon), HbcPremiumBadge, HbcPremiumSection icon={Settings} |
| SmartSearchWayfinding | HbcHomepageSurfaceCard surface="discovery" | HbcPremiumSurface intent="discovery" |
| HomepageDiscoveryCluster | HbcHomepageSectionShell, HbcHomepageIconFrame (resolveDiscoveryIconContent), HbcHomepageSurfaceCard | HbcPremiumSection icon={Search}, HbcPremiumIcon (11 lucide icons via resolveDiscoveryIcon), HbcPremiumSurface intent="discovery" |
| CompanyPulse | HbcHomepageCta, HbcHomepageMetadataRow, HbcStatusBadge | HbcPremiumCta variant="ghost", HbcPremiumBadge |
| LeadershipMessage | HbcHomepageCta, HbcHomepageEyebrow | HbcPremiumCta variant="ghost", inline eyebrow span |
| PeopleCulture | HbcHomepageCta, HbcHomepageMetadataRow, HbcStatusBadge, HbcHomepageEyebrow | HbcPremiumCta variant="ghost", HbcPremiumBadge, inline eyebrow span |
| ProjectPortfolioSpotlight | HbcHomepageCta, HbcHomepageMetadataRow, HbcStatusBadge, HbcHomepageEyebrow | HbcPremiumCta variant="ghost", HbcPremiumBadge |
| SafetyFieldExcellence | HbcHomepageCta, HbcHomepageMetadataRow, HbcStatusBadge, HbcHomepageEyebrow | HbcPremiumCta variant="ghost", HbcPremiumBadge |

## Key changes per surface type

### Command surfaces (PriorityActions, ToolLauncher)
- Wrapped in `HbcPremiumSurface intent="command"` (cool-tinted bg, compact radius, brand border)
- Section headers use `HbcPremiumSection` with lucide icons (Briefcase, Settings) and gradient separators
- Action row icons now use real SVG: AlertTriangle for urgent, CheckCircle2 for success, ArrowRight for default
- Tool icons resolved via `TOOL_ICON_MAP` with 11 lucide mappings (Shield, DollarSign, HardHat, Users, etc.)
- Status badges now use `HbcPremiumBadge` with lucide status icons (dual-channel encoding)

### Discovery surface (SmartSearch, DiscoveryCluster)
- Wrapped in `HbcPremiumSurface intent="discovery"` (warm gradient, rounded border)
- Section header uses `HbcPremiumSection icon={Search} accent="warm"` with gradient separator
- All icons now use `HbcPremiumIcon` with lucide icons via `resolveDiscoveryIcon()` (11 icon mappings)
- Category cards wrapped in `HbcPremiumSurface intent="discovery"`

### Editorial surfaces (CompanyPulse, LeadershipMessage, PeopleCulture)
- All CTAs switched from `HbcHomepageCta variant="link"` to `HbcPremiumCta variant="ghost" arrow`
- All status badges switched from `HbcStatusBadge` to `HbcPremiumBadge` (lucide status icons)
- Metadata rows replaced with flex divs containing `HbcPremiumBadge` components
- Eyebrows replaced with inline styled `<span>` elements (the cluster variant already handles section character)

### Operational surfaces (ProjectPortfolio, SafetyField)
- All CTAs and badges migrated to premium primitives
- Eyebrows replaced with inline styled spans
- Secondary metadata rows replaced with flex divs containing `HbcPremiumBadge`

## Verification

- `@hbc/spfx-hb-webparts` check-types: pass
- `@hbc/spfx-hb-webparts` build: pass (495 KB JS, 12.10 KB CSS)
- `@hbc/spfx-hb-webparts` lint: pass (zero errors/warnings)

## Bundle impact

- Before (P16-03): 483 KB JS, 6.42 KB CSS
- After (P16-04): 495 KB JS (+12 KB from additional lucide icon tree-shaking), 12.10 KB CSS (+5.68 KB from premium surface CSS modules)
- Within the 800 KB warning threshold
