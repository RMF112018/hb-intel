# Prompt 03 — Shared Primitive System Rebuild

## Objective

Rebuild the shared homepage primitive layer so the actual webparts can stop behaving like wrappers around a safe surface system.

## Primary Target

- `packages/ui-kit/src/homepage*`
- any directly related homepage primitive folders
- any shared branding or theme surfaces required to support the new primitives

## Required Primitive Families

Create or rebuild primitives for these families:

### 1. SignatureHeroSurface
Purpose:
- one flagship full-width opening surface
- integrated greeting, campaign headline, CTA hierarchy, metadata, and operational signal

### 2. CommandSurface
Purpose:
- urgent actions
- approvals
- task queues
- dense but premium interaction

### 3. LauncherSurface
Purpose:
- grouped tools
- primary launcher tiles
- richer icon-led destinations
- hover and affordance clarity

### 4. DiscoverySurface
Purpose:
- search input
- suggestion list
- quick paths
- promoted destinations
- category shelves

### 5. EditorialSurface
Purpose:
- leadership
- company pulse
- people and culture
- featured vs secondary editorial rhythm

### 6. OperationalSurface
Purpose:
- safety
- project spotlight
- intelligence/freshness/status framing

## Explicit Stack Usage

### `class-variance-authority`
Use to define surface families and state variants cleanly.

### `clsx`
Use for readable class composition across variants.

### `lucide-react`
Use inside primitives as the canonical icon system.

### `motion`
Use inside primitives for premium interaction and reveal behavior.

### `@radix-ui/react-slot`
Use to make CTA/link/button shells composable and reusable.

### `@radix-ui/react-separator`
Use for elegant hierarchy separators where they improve rhythm.

## Hard Prohibitions

Do not:
- rename the current surface wrappers and keep them visually similar
- keep surface differentiation limited to tint + shadow + border-left
- keep the primitive system dependent on the same polite enterprise card assumptions

## Acceptance Criteria

The shared primitive system must make it possible for the homepage webparts to render as materially different product surfaces before page authoring layout is even considered.
