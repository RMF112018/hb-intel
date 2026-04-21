# Prompt-02-Badge-Header-Geometry-Elimination

## Objective
Eliminate the fragile featured-card geometry that currently depends on absolute badge placement and fixed right-side reserved space.

## Governing authority
Use the doctrine plus the checklist criteria for:
- decisive visual hierarchy
- selective compact behavior
- breakpoint credibility
- role-appropriate material treatment

## Inspect exactly
- `apps/hb-webparts/src/webparts/hbKudos/kudosSurface.module.css`
- `apps/hb-webparts/src/webparts/hbKudos/PublicKudosSurface.tsx`

## Current problem
The current featured card uses a top-right absolute badge and a fixed `padding-right` reservation in the featured header zone. This is a desktop-biased solution that causes the recipient/title area to become artificially narrow on smaller widths.

## Required implementation outcome
Replace the fragile geometry with a breakpoint-aware slot/layout strategy:
- no fixed desktop-only reservation that breaks on phone width
- badge behavior must remain premium and intentional
- recipient/title hierarchy must stay readable at all audited widths

A good result may involve:
- moving the badge into normal flow in compact states
- giving compact mode a dedicated header grid/flex model
- reducing badge prominence or relocating it beneath the header at smaller widths

## Proof of closure
Provide:
- the specific CSS/JSX seams changed
- hosted screenshots proving that the recipient/title zone no longer collapses under badge pressure
- confirmation that badge treatment is still visually premium
