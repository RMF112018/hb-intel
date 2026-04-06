# Prompt 04 — Webpart Structural Rebuild: Top Band, Command, Discovery

## Objective

Structurally rebuild the most important homepage webparts under `apps/hb-webparts/src/webparts/` using the stronger shared system and the required stack.

## Target Webparts

At minimum:

- `hbHeroBanner`
- `personalizedWelcomeHeader`
- `priorityActionsRail`
- `toolLauncherWorkHub`
- `smartSearchWayfinding`

## Non-Negotiable Structural Requirements

### A. Top band must become one flagship experience
The greeting must be integrated into the signature hero experience in rendered output.

This means:
- no separate greeting card beside the hero
- no separate greeting block below the hero
- no dual-surface top band pretending to be unified

### B. Hero must be designed for full-width usage
The hero webpart must be rebuilt to take advantage of full-width rendering once the manifest supports it.

### C. Command surfaces must stop behaving like styled list rows
`priorityActionsRail` and `toolLauncherWorkHub` must become real command and launcher surfaces with:
- stronger primary item emphasis
- real iconography
- better urgency framing
- richer affordance quality
- optional anchored overlays where useful

### D. Discovery must stop being a passive card wrapper
`smartSearchWayfinding` must become a real discovery product surface, not a generic search field inside a card.

## Explicit Stack Usage by Webpart

### `hbHeroBanner`
Use:
- `motion` for reveal choreography and CTA response
- `class-variance-authority` for hero subregion variants
- `lucide-react` for supporting accents if needed

### `priorityActionsRail`
Use:
- `lucide-react` for urgency and action icons
- `motion` for hover/selection behavior
- `@radix-ui/react-tooltip` for compact micro-help if needed

### `toolLauncherWorkHub`
Use:
- `lucide-react` for launcher icons
- `motion` for hover depth and interaction feedback
- `@floating-ui/react` where launcher overlays or panels genuinely improve utility

### `smartSearchWayfinding`
Use:
- `@floating-ui/react` for anchored suggestions and result panels
- `@radix-ui/react-scroll-area` for polished result overflow
- `lucide-react` for search and destination iconography
- `motion` for suggestion and panel transition polish

## Hard Prohibitions

Do not:
- keep these webparts as wrappers around the same old content shape
- keep Unicode glyphs as icons
- keep the hero as a large blue slab
- keep the search surface passive and flat

## Required Output

Produce a completion note showing:
- what was structurally replaced
- what was deleted
- what new primitives are now used by each webpart
