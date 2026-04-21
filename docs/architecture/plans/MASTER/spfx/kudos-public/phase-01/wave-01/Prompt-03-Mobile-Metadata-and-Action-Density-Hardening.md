# Prompt-03-Mobile-Metadata-and-Action-Density-Hardening

## Objective
Reduce mobile footer/header crowding in the public hbKudos featured card while preserving accessibility and clear interaction.

## Inspect exactly
- `apps/hb-webparts/src/webparts/hbKudos/PublicKudosSurface.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/kudosSurface.module.css`

## Current problem
On phone widths, submitter metadata, celebrate action, excerpt, badge, and header content all compete inside a space that is too narrow for the desktop density model.

## Required implementation outcome
- keep touch targets comfortably operable
- reduce visual competition between metadata and action affordances
- ensure compact mode reads quickly
- preserve keyboard/focus-visible quality
- preserve celebrate functionality

## Standards / best-practice emphasis
- WCAG 2.2 target size minimum
- compact states should prioritize primary meaning first
- hover cannot be the primary path to understanding

## Proof of closure
Provide:
- hosted phone screenshots
- target-size / interaction notes for the changed controls
- confirmation that reduced-motion and focus-visible behavior still work
