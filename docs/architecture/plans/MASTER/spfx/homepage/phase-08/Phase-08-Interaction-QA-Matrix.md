# Phase 08 Interaction QA Matrix

Interaction quality assessment across all homepage and shell-extension surfaces.

## Lane A — Homepage Webparts

| Surface | Focus-Visible | Hover | Reduced Motion | Empty State | Loading State | Touch Target |
|---------|:------------:|:-----:|:--------------:|:-----------:|:------------:|:------------:|
| Welcome Header | N/A (no interactive) | N/A | N/A | Always renders | N/A (sync) | N/A |
| Hero Banner CTA | Yes (CSS module) | Yes (underline) | Yes (transition: none) | Yes (authoring msg) | N/A (sync) | Link text |
| Priority Actions links | Yes (CSS module) | Yes (underline) | Yes | Yes (authoring msg) | Yes (spinner) | Link text |
| Tool Launcher links | Yes (CSS module) | Yes (underline) | Yes | Yes (authoring msg) | Yes (spinner) | Link text |
| Company Pulse CTAs | Yes (CSS module) | Yes (underline) | Yes | Yes (authoring msg) | Yes (spinner) | Link text |
| Leadership CTAs | Yes (CSS module) | Yes (underline) | Yes | Yes (authoring msg) | Yes (spinner) | Link text |
| People CTAs | Yes (CSS module) | Yes (underline) | Yes | Yes (authoring msg) | Yes (spinner) | Link text |
| Project Spotlight CTAs | Yes (CSS module) | Yes (underline) | Yes | Yes (stale badge) | Yes (spinner) | Link text |
| Safety CTAs | Yes (CSS module) | Yes (underline) | Yes | Yes (stale badge) | Yes (spinner) | Link text |
| Smart Search input | Yes (border + shadow) | N/A (input) | Yes | Yes (authoring msg) | Yes (spinner) | Full width |
| Smart Search links | Yes (inherited) | Yes | Yes | Yes (noResults msg) | — | Link text |

## Lane B — Shell Extension

| Surface | Focus-Visible | Hover | Reduced Motion | Empty State | Touch Target |
|---------|:------------:|:-----:|:--------------:|:-----------:|:------------:|
| Ribbon links | Yes (outline) | Yes (background) | Yes | No content → no render | Link text |
| Alert CTAs | Yes (outline) | Yes (underline) | Yes | No alerts → no render | Link text |
| Alert dismiss | Yes (outline) | Yes (opacity) | Yes | N/A | 32x32px min |
| Footer links | Yes (outline) | Yes (background) | Yes | No content → no render | Link text |
| Support links | Yes (outline) | Yes (background) | Yes | No content → no render | Link text |

## Responsive Behavior Assessment

| Concern | Lane A | Lane B |
|---------|--------|--------|
| Top-band pair wraps at narrow width | Yes — flex-wrap with min-widths | N/A |
| Utility groups wrap at narrow width | Yes — flex-wrap | N/A |
| Discovery search input full-width | Yes — `width: 100%` | N/A |
| Ribbon wraps at narrow width | N/A | Yes — flex with gap |
| Alert band stacks vertically | N/A | Yes — flex-direction: column |
| Footer wraps at narrow width | N/A | Yes — flex with gap |

## Interaction Consistency Assessment

| Pattern | Consistent? | Notes |
|---------|:-----------:|-------|
| Focus-visible outline style | Yes | 2px solid #225391 across both lanes |
| Hover behavior (links) | Yes | Underline + darker color across all lanes |
| Reduced-motion blanket | Yes | `@media (prefers-reduced-motion: reduce)` in both CSS modules |
| Empty state pattern | Yes | `role="status" aria-live="polite"` + authoring message in Lane A |
| Safe no-op for missing content | Yes | Lane A: authoring empty state. Lane B: no render or empty container |
