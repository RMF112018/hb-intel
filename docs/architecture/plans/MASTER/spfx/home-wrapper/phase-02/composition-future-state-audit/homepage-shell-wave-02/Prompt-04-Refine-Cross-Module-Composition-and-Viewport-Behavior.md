# Prompt 04 — Refine Cross-Module Composition and Viewport Behavior

## Objective
Refine the composed homepage so the strongest modules work together as a flagship page across wide, medium, and narrow conditions.

## Governing authority
- the two homepage doctrine files
- shell contracts and presets from Wave 01
- benchmark requirement for premium, authored composition

## Exact repo seams to inspect
- shell resolver / preset files
- `HbHomepageShell.tsx`
- module shell-fit variants introduced in Wave 02
- viewport validation artifacts

## Current gap
The page still risks destructive prominence collisions and sequential flattening unless the shell explicitly mediates:
- Company Pulse vs Project Spotlight
- Leadership vs People & Culture
- HB Kudos prominence and density
- future Safety positioning

## Required implementation outcome
Tune the shell and slot behavior so:
- dominant modules no longer compete destructively
- secondary modules form a calmer context band
- recognition remains visible but not overpowering
- wide / medium / narrow layouts each preserve clear hierarchy

## Proof of closure required
Provide:
- before/after composition explanation
- viewport-specific behavior summary
- screenshots or validation artifacts showing reduced competition
- explanation of any remaining intentional tradeoffs

## Prohibited
- do not solve this only with spacing tweaks
- do not flatten hierarchy for convenience
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
