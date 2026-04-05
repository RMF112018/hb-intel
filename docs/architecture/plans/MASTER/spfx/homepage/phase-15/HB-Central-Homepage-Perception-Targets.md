# HB Central Homepage — Perception Targets and Design Decision Lock

## Purpose

This document locks the desired emotional and functional posture for each homepage zone and maps those decisions to exact repo surfaces and ownership boundaries. These decisions are binding on all subsequent Phase 15 implementation prompts.

---

## Posture 1: Top-Band Emotional Posture

### Desired perception
The top band must feel like a **signature opening sequence** — the most memorable part of the homepage. It must immediately communicate brand confidence, personal awareness, and editorial authority. A user landing on the page should feel that this homepage was built for them, by a company that cares about quality.

### What this means concretely
- Welcome greeting and hero content must function as **one integrated composition**, not two adjacent cards
- The top band must occupy meaningful vertical space and use it with intention — layered typography, brand-coherent color, deliberate negative space
- The greeting must feel like a signature product element, not a utility label
- The hero must feel editorial and commanding, not like a banner ad
- The combined top band must set the emotional tone for the entire page

### What this replaces
- Current side-by-side flex layout where welcome (280px min) and hero (440px min) sit as peer cards
- Current welcome card with 4px blue left border and grid layout
- Current hero with gradient overlay that reads as a colored rectangle

### Repo surfaces
| Surface | Package | Key files |
|---|---|---|
| PersonalizedWelcomeHeader | `apps/hb-webparts` | `src/webparts/PersonalizedWelcomeHeader/` |
| HbHeroBanner | `apps/hb-webparts` | `src/webparts/HbHeroBanner/` |
| Top band composition | `apps/hb-webparts` | `src/homepage/ReferenceHomepageComposition.tsx` |
| Brand lockup | `packages/ui-kit` | `src/branding/` |
| Surface card (hero/welcome weights) | `packages/ui-kit` | `src/HbcHomepageSurfaceCard/` |

### Ownership
Lane A (`apps/hb-webparts`) owns the composition. `packages/ui-kit` owns shared primitives. No Lane B involvement in the top band.

---

## Posture 2: Shell Posture

### Desired perception
Lane B must feel like a **real product shell layer** — an intentional frame that supports and unifies the homepage experience. It must read as part of the same product, not as a separate technical strip bolted above and below the page.

### What this means concretely
- The top ribbon must feel like a purposeful utility bar with enough visual weight to anchor the page
- The alert band must feel like a deliberate communication channel, not a debug notice
- The footer rail must feel like a professional product footer, not an afterthought
- Shell and homepage must share enough visual DNA (color, typography, spacing rhythm) to feel like one product
- Shell must remain compact and utility-focused — it frames the experience but does not compete with it

### What this replaces
- Current thin ribbon with 6px padding and minimal brand presence
- Current alert band with basic colored containers
- Current footer with flat link row

### Repo surfaces
| Surface | Package | Key files |
|---|---|---|
| Top ribbon | `apps/hb-shell-extension` | `src/extensions/hbGlobalTopRibbon/` |
| Alert band | `apps/hb-shell-extension` | `src/extensions/hbPriorityAlertBand/` |
| Footer rail | `apps/hb-shell-extension` | `src/extensions/hbFooterRail/` |
| Shell styles | `apps/hb-shell-extension` | `src/shell-extension.module.css` |

### Ownership
Lane B (`apps/hb-shell-extension`) owns all shell surfaces. Shared visual tokens may be promoted to `packages/ui-kit` if needed for shell-homepage coordination.

---

## Posture 3: Utility Posture

### Desired perception
Priority Actions and Tool Launcher must feel like **command surfaces** — efficient, high-contrast, tool-like modules that communicate "here is what you need to do and where you need to go." They must feel like the operational cockpit of the homepage.

### What this means concretely
- Priority Actions must use urgency-aware visual treatments that make critical items impossible to miss
- Tool Launcher must feel like a real application launcher with icon-forward tile presentation, not a categorized link list
- Both surfaces must be denser than editorial surfaces but must not feel cramped
- Interactive states (hover, focus) must reinforce the tool-like character — snappy, responsive, confident
- The utility zone must be visually distinct from the editorial zone below it

### What this replaces
- Current `PriorityActionsRail` with small action rows and subtle urgency indicators
- Current `ToolLauncherWorkHub` with flat text links and minimal icon treatment
- Current utility zone with transparent background (no visual differentiation from communications zone)

### Repo surfaces
| Surface | Package | Key files |
|---|---|---|
| PriorityActionsRail | `apps/hb-webparts` | `src/webparts/PriorityActionsRail/` |
| ToolLauncherWorkHub | `apps/hb-webparts` | `src/webparts/ToolLauncherWorkHub/` |
| IconFrame primitive | `packages/ui-kit` | `src/HbcHomepageIconFrame/` |
| ActionRow primitive | `packages/ui-kit` | `src/HbcHomepageActionRow/` |
| Interactive styles | `apps/hb-webparts` | `src/homepage/homepage-interactive.module.css` |

### Ownership
Lane A (`apps/hb-webparts`) owns utility webparts. `packages/ui-kit` owns shared interaction primitives. Icon and tile primitives may need significant rework or replacement.

---

## Posture 4: Editorial Posture

### Desired perception
Company Pulse, Leadership Message, and People & Culture must feel like **authored editorial modules** — curated, hierarchical, and magazine-like. Each must have a distinct editorial character. The communications zone must feel like the homepage's editorial section, not like three more cards.

### What this means concretely
- Company Pulse must feel like a curated news digest with clear featured/secondary hierarchy and category-aware presentation
- Leadership Message must feel like a premium executive communication channel — prominent, personal, and visually distinct from news
- People & Culture must feel warm, human, and celebratory — visually distinct from both news and leadership content
- Featured items must be dramatically more prominent than secondary items (not just slightly larger)
- Each module must have its own visual identity within a shared editorial family

### What this replaces
- Current uniform card layout where all three modules use the same heading/metadata/paragraph/CTA structure
- Current `standard` card weight applied identically across all editorial surfaces
- Current zone background of `rgba(229,126,70,0.02)` (invisible warm tint)

### Repo surfaces
| Surface | Package | Key files |
|---|---|---|
| CompanyPulse | `apps/hb-webparts` | `src/webparts/CompanyPulse/` |
| LeadershipMessage | `apps/hb-webparts` | `src/webparts/LeadershipMessage/` |
| PeopleCulture | `apps/hb-webparts` | `src/webparts/PeopleCulture/` |
| SurfaceCard (editorial weight) | `packages/ui-kit` | `src/HbcHomepageSurfaceCard/` |
| MetadataRow | `packages/ui-kit` | `src/HbcHomepageMetadataRow/` |
| SectionShell | `packages/ui-kit` | `src/HbcHomepageSectionShell/` |

### Ownership
Lane A (`apps/hb-webparts`) owns editorial webparts. `packages/ui-kit` owns shared editorial primitives. The editorial surface family in ui-kit likely needs rework to support distinct module identities.

---

## Posture 5: Operational Posture

### Desired perception
Project / Portfolio Spotlight and Safety / Field Excellence must feel like **credible operational intelligence modules** — data-aware, structured, and authoritative. They must communicate "this is real business information" rather than "this is another content card."

### What this means concretely
- Project Spotlight must feel dashboard-adjacent — status indicators, milestone markers, and strategic emphasis badges must have real visual weight
- Safety must feel urgent and culturally important — safety is a core HB value and must be presented with appropriate gravity and visibility
- Both modules must feel structurally different from editorial surfaces — more grid-like, more data-oriented, less magazine-like
- Status indicators and badges must be immediately legible, not decorative

### What this replaces
- Current operational cards that look identical to editorial cards except for a 3px blue left border
- Current `standard` card weight shared with editorial surfaces
- Current zone background of `rgba(34,83,145,0.02)` (invisible cool tint)

### Repo surfaces
| Surface | Package | Key files |
|---|---|---|
| ProjectPortfolioSpotlight | `apps/hb-webparts` | `src/webparts/ProjectPortfolioSpotlight/` |
| SafetyFieldExcellence | `apps/hb-webparts` | `src/webparts/SafetyFieldExcellence/` |
| SurfaceCard (operational weight) | `packages/ui-kit` | `src/HbcHomepageSurfaceCard/` |
| StatusBadge | `packages/ui-kit` | `src/HbcStatusBadge/` |

### Ownership
Lane A (`apps/hb-webparts`) owns operational webparts. `packages/ui-kit` owns shared status and badge primitives. The operational surface family needs distinct treatment from the editorial family.

---

## Posture 6: Discovery Posture

### Desired perception
Smart Search / Wayfinding must feel like a **discovery product** — an inviting, prominent, and intelligent entry point for finding anything across the organization. It must communicate "we built this to help you find things" rather than "we added a search box."

### What this means concretely
- The search input must be visually prominent — larger, more styled, with search iconography and placeholder guidance
- Quick paths must feel like curated shortcuts, not a link list
- Category groups must create a browsable directory experience
- Promoted resources must have enough visual weight to feel intentional
- The discovery zone must feel like a destination within the homepage, not an afterthought at the bottom

### What this replaces
- Current plain `<input type="text">` with minimal styling in a `rgba(0,0,0,0.015)` box
- Current quick paths as small action rows with icon frames
- Current category groups as `supporting` weight cards
- Current zone background of `rgba(0,0,0,0.015)` (invisible neutral tint)

### Repo surfaces
| Surface | Package | Key files |
|---|---|---|
| SmartSearchWayfinding | `apps/hb-webparts` | `src/webparts/SmartSearchWayfinding/` |
| SurfaceCard (discovery weight) | `packages/ui-kit` | `src/HbcHomepageSurfaceCard/` |
| IconFrame | `packages/ui-kit` | `src/HbcHomepageIconFrame/` |
| ActionRow | `packages/ui-kit` | `src/HbcHomepageActionRow/` |
| Search input styles | `apps/hb-webparts` | `src/homepage/homepage-interactive.module.css` |

### Ownership
Lane A (`apps/hb-webparts`) owns the discovery webpart. `packages/ui-kit` owns shared primitives. Search input styling and discovery layout may need dedicated treatment beyond current shared primitives.

---

## Cross-Cutting Ownership Summary

| Concern | Owner | Location |
|---|---|---|
| Homepage webpart rendering and composition | Lane A | `apps/hb-webparts` |
| Shell placeholder rendering | Lane B | `apps/hb-shell-extension` |
| Shared visual primitives (cards, badges, CTAs, icons) | Shared | `packages/ui-kit` |
| Homepage-specific tokens (spacing, color, motion) | Lane A | `apps/hb-webparts/src/homepage/tokens.ts` |
| Brand foundation (colors, lockup, brand assets) | Shared | `packages/ui-kit/src/branding/` |
| Design brief and direction | Governance | `docs/architecture/blueprint/sharepoint-shell/` |

---

## Binding Constraint

These posture decisions are locked for Phase 15.
Subsequent prompts must implement against these targets, not drift back toward safe, uniform, card-based patterns.
If a prompt's implementation result does not match the posture defined here, the implementation must be reworked before the phase can advance.
