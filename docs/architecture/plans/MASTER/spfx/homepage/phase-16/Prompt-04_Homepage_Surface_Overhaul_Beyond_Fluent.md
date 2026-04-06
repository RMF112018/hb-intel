# Prompt 04 — Homepage Surface Overhaul Beyond Fluent

## Objective

Apply the new premium visual system across the broader homepage so the page no longer reads like a collection of mildly upgraded enterprise cards.

## Priority Targets

1. Priority Actions
2. Tool Launcher / Work Hub
3. Smart Search and Wayfinding
4. Leadership Message
5. Company Pulse
6. People and Culture
7. Project / Portfolio Spotlight
8. Safety and Field Excellence

## Hard Direction

The homepage must no longer visually default to:
- white cards with thin borders
- basic header plus body plus CTA templates
- stock-looking search and launcher experiences
- timid, same-weight section rhythm

## Named Dependency Guidance

### `lucide-react`
Use real icons throughout utility, discovery, and operational surfaces.

### `motion` or `framer-motion`
Use for:
- hover depth
- selection states
- command-surface interaction quality
- subtle rail or spotlight transitions

### `@floating-ui/react`
Use for:
- premium search suggestions
- richer command and launcher overlays
- contextual affordances where they add real value

### `@radix-ui/react-tooltip` and `@radix-ui/react-separator`
Use to improve interaction refinement and layout clarity where appropriate.

### `embla-carousel-react`
Use if a horizontal premium shelf materially improves curated content or spotlight presentation.
Do not use it just because it exists.

## Required Outcome

By the end of this prompt:
- launcher and discovery no longer feel generic
- command surfaces feel more urgent and premium
- editorial surfaces feel authored
- operational surfaces feel more intelligent and less boxy
- the page has stronger visual rhythm and more distinct surface identities

## Hard Prohibitions

Do not:
- keep each module inside the same generic card formula
- avoid strong differentiation because of consistency anxiety
- fall back to Fluent-like shape language
- overcomplicate the page with motion noise or gimmicks
