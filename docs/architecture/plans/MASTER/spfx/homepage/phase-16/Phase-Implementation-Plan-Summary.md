# Phase Implementation Plan Summary — Design Breakout Addendum

## Objective

Break the code agent out of a conservative enterprise-UI pattern and force a materially more ambitious visual outcome for HB Central.

## Problem Statement

The agent is still behaving like a safe UI refiner instead of a premium product designer.

Symptoms include:
- over-reliance on card grids
- conservative top-band composition
- insufficient differentiation between module types
- weak launcher and discovery expression
- generic button and input treatments
- visual deference to Fluent UI defaults, even when not explicitly using Fluent components

## Strategic Shift

This package changes the development posture from:

> improve the current homepage

to:

> replace the weak visual language with a premium authored system and then rebuild the homepage using it

## Required Design Breakout Principles

### 1. Fluent UI is not the visual north star
Fluent may remain in the stack for:
- SPFx interoperability
- token interoperability
- accessibility and focus patterns
- host-context compatibility

But Fluent must **not** determine the dominant homepage visual identity.

### 2. The homepage must feel custom-built
Every major surface should feel intentionally designed for HB Central, not adapted from a design-system starter kit.

### 3. Surface types must be meaningfully different
The homepage needs clear visual distinctions between:
- signature and flagship
- command and action
- launcher and discovery
- editorial and communications
- recognition and people
- operational and intelligence

### 4. Stronger dependencies are allowed and expected
The code agent is explicitly authorized to introduce carefully selected packages that improve motion, iconography, overlays, composition, and premium interaction quality.

## Recommended Dependency Stack

These packages should be evaluated and adopted where compatible with the repo and packaging model:

- `motion` or `framer-motion`
- `lucide-react`
- `@floating-ui/react`
- `@radix-ui/react-slot`
- `@radix-ui/react-separator`
- `@radix-ui/react-tooltip`
- `@radix-ui/react-scroll-area`
- `embla-carousel-react`
- `class-variance-authority`
- `clsx`

### Allowed posture
Use these packages to create premium custom primitives.

### Disallowed posture
Do not add them and then still render the page as mildly restyled Fluent-shaped cards.

## Phase Structure

### Phase A — Dependency and doctrine lock
Force the visual doctrine change and approve the named stack.

### Phase B — Shared premium primitive rebuild
Build the new surface, CTA, icon, and interaction primitives in shared code.

### Phase C — Unified signature hero rebuild
Use the stronger primitives to rebuild the top band as one authored flagship surface.

### Phase D — Full homepage surface overhaul
Push the rest of the homepage beyond the current generic enterprise card language.

### Phase E — Validation and packaging
Prove the rendered result is materially stronger and rebuild the deployable package cleanly.

## Hard Gates

The work is not complete unless:
- the page no longer reads like custom SharePoint cards
- Fluent-style defaults no longer dominate the homepage
- the top band is materially stronger than the current output
- launcher, discovery, and command surfaces feel premium and custom
- the rendered screenshots look decisively less generic
