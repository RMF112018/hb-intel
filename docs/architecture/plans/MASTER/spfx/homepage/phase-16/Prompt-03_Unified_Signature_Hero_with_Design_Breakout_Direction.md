# Prompt 03 — Unified Signature Hero with Design Breakout Direction

## Objective

Use the stronger dependency stack and shared premium primitives to rebuild the top band as a **single signature hero** that contains the personalized greeting.

## Non-Negotiable Requirement

The personalized greeting must be integrated into the hero.
It must no longer read as a separate adjacent surface.

## Explicit Design Direction

This hero should feel:
- premium
- bold
- layered
- personalized
- branded
- memorable
- far beyond default enterprise UI

## Named Dependency Guidance

### Use `motion` or `framer-motion` for:
- subtle reveal choreography
- premium CTA hover and press transitions
- layered content entrance
- restrained depth and movement

### Use `lucide-react` for:
- supporting icon accents
- CTA embellishment if appropriate
- metadata or operational-signal accents

### Use `class-variance-authority` and `clsx` for:
- structured visual variants
- clean hero subregion styling
- maintaining clarity without reverting to generic component shapes

### Use `@floating-ui/react` only if:
- the hero introduces a premium contextual affordance that genuinely improves the surface

## Specific Composition Requirements

The hero must include, in one integrated surface:
- personalized greeting
- major headline
- supporting copy
- CTA hierarchy
- metadata or freshness
- optional alert or daily context signal

It must also solve:
- dead empty space
- weak negative-space use
- lack of tension
- generic enterprise-banner feeling

## Hard Prohibitions

Do not:
- produce a large blue slab with text and a button
- keep the greeting floating beside the hero
- imitate stock SharePoint hero patterns
- produce a clean AI dashboard hero

## Acceptance Criteria

At first glance, the result should look like a custom premium product surface, not a SharePoint webpart.
