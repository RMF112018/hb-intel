# Prompt 02 — Rebuild Flagship PriorityActionsRail Surface

## Objective

Rebuild the homepage-flagship `PriorityActionsRail` surface so it reads as a premium top-band command system instead of a lightly tinted bordered card.

## Current condition

The shared rail surface already has real infrastructure:
- urgency variants
- layout modes
- grouped sections
- motion-enhanced rows
- governed overflow
- professional loading/empty/error states

But the current flagship rendering still inherits card-like signals from `priority-rail.module.css`, including a soft tinted background, visible border, rounded radius, and narrow module-card rhythm.

## Why the current condition is inadequate

The homepage doctrine explicitly rejects timid white-card or safe enterprise panel outcomes for flagship SPFx surfaces. The current hosted result still reads as a module inside a wrapper, not as a decisive action layer.

## Intended future state

The homepage-facing rail should read first as:
- command band
- premium launcher / utility layer
- compact operational surface
- top-band action system

It must remain:
- grouped and scannable
- fast to parse
- accessible
- stable across layout modes
- visually distinct from editorial cards, recognition surfaces, and stock utility lists

## What done looks like

- the flagship surface no longer reads as a bordered card
- primary actions feel more decisive and more immediately scannable
- grouping rhythm and hierarchy are materially stronger
- width authority improves without creating brittle layouts
- the surface still behaves correctly in loading/empty/error/compact states

## Exact repo seams to inspect

- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailSurface.tsx`
- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailAction.tsx`
- `packages/ui-kit/src/HbcPriorityRail/priority-rail.module.css`
- `packages/ui-kit/src/HbcPriorityRail/variants.ts`
- `packages/ui-kit/src/HbcPriorityRail/types.ts`
- any shared homepage exports that carry the surface contract

## Governing authorities

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

## Research-backed implementation guidance

Use the already-installed premium stack where justified:
- `motion` for refined but restrained depth / hover / reveal treatment
- `lucide-react` for consistent icon emphasis
- `@radix-ui/react-separator` for hierarchy rhythm
- `class-variance-authority` / `clsx` for a serious flagship variant contract

Prefer structural surface changes over decorative repainting.

## Required implementation tasks

1. Rework the flagship root surface treatment.
2. Rework header, section, count, row, and affordance hierarchy so scan speed improves.
3. Ensure the flagship context has a materially stronger visual identity than the generic shared surface.
4. Preserve compact and fallback states.
5. Keep loading/empty/error states visually aligned with the new flagship posture.

## Constraints and anti-patterns

### Do not do these things
- do not solve this with color tweaks alone
- do not keep the same card silhouette and call it a redesign
- do not introduce heavy fake shell chrome
- do not make rows so dense that touch and keyboard credibility drop
- do not break standalone use cases

## Proof of closure

Provide:
- exact files changed
- before/after explanation of why the bordered-card reading is gone
- notes on how the flagship variant differs from generic shared usage
- screenshot-ready evidence points to verify in hosted SharePoint

## Mandatory directive

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**
