# Prompt 04 — Accessibility, Responsive Behavior, and Full-Width Compliance

## Use

Run this after Prompt 03. This prompt closes the remaining production-grade accessibility and layout compliance gaps.

## Prompt

```text
You are working in the live local `hb-intel` repository with direct file-system access.

Your mission is to bring the People & Culture public and companion experiences to production-grade accessibility, keyboard interaction, responsive behavior, and SharePoint full-width compliance.

IMPORTANT OPERATING RULE:
Do not re-read files that are still in your active context or memory. Reuse current context first. Only open additional files when needed to progress, verify, or resolve uncertainty.

Primary objective:
Eliminate the remaining accessibility and layout gaps so the People & Culture application works comfortably and correctly at normal zoom, across common SharePoint viewport widths, and with proper keyboard/focus semantics.

Minimum focus areas:
- `apps/hb-webparts/src/webparts/peopleCultureCompanion/`
- `apps/hb-webparts/src/webparts/peopleCulturePublic/`
- any shared UI surfaces/primitives introduced in Prompt 03
- any test/story/demo coverage relevant to keyboard and responsive behavior

Required remediation goals:

1. Tabs
- make the companion tab system production-grade
- ensure correct relationships among tabs and panels
- add expected keyboard behavior
- ensure screen-reader-friendly labeling

2. Dialogs / drawers / modals
- make quick edit, full editor, preview, and any other dialog-like surfaces production-grade
- close focus-management gaps
- ensure predictable escape / close behavior
- restore focus correctly
- ensure background interaction is appropriately suppressed when modal behavior is intended

3. Keyboard support
- eliminate mouse-only critical paths
- ensure row selection, preview, and primary operating actions remain accessible by keyboard

4. Responsive behavior
- verify the surfaces at practical SharePoint widths
- remove the conditions that make the application feel like it only fits when zoom is reduced
- improve dense-but-comfortable layout at 100% browser zoom

5. Full-width compliance
- if the companion or any related webpart is meant to support full-width placement, ensure the rendered experience actually uses that canvas comfortably
- remove unnecessary `maxWidth` bottlenecks or replace them with better adaptive layout logic where appropriate

6. Reduced-motion and focus visibility
- ensure the final UI respects reduced-motion expectations where relevant
- ensure visible focus states across interactive elements

Implementation requirements:
- prefer accessible shared primitives if available or add them cleanly if needed
- do not regress the premium surface quality from Prompt 03
- do not weaken information density just to “make it fit”; solve layout intelligently
- add/update tests where feasible for helper logic and interaction-critical components

Required validation:
- keyboard navigation works across tabs and dialogs
- focus handling is correct and repeatable
- layout is comfortable at standard zoom
- full-width use is credible where supported
- no major accessibility anti-pattern remains in the primary operating flows

Required output:
- summary of accessibility/responsive fixes
- files changed
- what was validated manually and/or via tests
- any remaining edge cases
```