# Prompt 02 — Shared Premium Primitive Rebuild

## Objective

Rebuild the shared homepage visual primitives so the agent is no longer trapped by the current weak surface language.

## Focus Area

Primary target:
- `@hbc/ui-kit/homepage`

Secondary target:
- any supporting shared styling or branding surfaces that materially affect homepage rendering

## What Must Change

The current system is too dependent on:
- mild card variants
- subtle border changes
- restrained padding changes
- safe header wrappers
- generic action-row composition

That is not enough.

## Required New Primitive Classes

Create or upgrade shared primitives for at least the following:

### 1. Signature surface
For the flagship top band and other premium hero-like moments.
Must support:
- layered composition
- premium depth
- asymmetry
- richer internal regions
- integrated metadata and CTA hierarchy

### 2. Command surface
For priority actions and high-urgency operational tasks.
Must support:
- stronger state contrast
- richer row hierarchy
- urgency emphasis without clutter
- premium interaction states

### 3. Launcher and discovery surface
For work hub and smart wayfinding.
Must support:
- icon-led affordances
- premium search treatment
- hoverable affordance quality
- promoted destinations
- richer visual density

### 4. Editorial surface
For communications, leadership, and people content.
Must support:
- stronger headline hierarchy
- media or art direction where appropriate
- better featured versus secondary contrast

### 5. Operational intelligence surface
For project spotlight and safety intelligence.
Must support:
- KPI or freshness treatment
- stronger status expression
- better visual organization of insight signals

## Explicit Direction

You are encouraged to use:
- `lucide-react` for iconography
- `motion` or `framer-motion` for restrained premium interaction
- `class-variance-authority` and `clsx` for variant discipline
- `@floating-ui/react` and `@radix-ui/*` where overlay or microinteraction primitives help

## Hard Prohibitions

Do not:
- wrap old card patterns in new names
- create premium-sounding primitives that still render like Fluent-adjacent boxes
- keep default-looking buttons, inputs, or badges
- use stock enterprise visual treatments and call them premium

## Acceptance Criteria

The shared primitives must make it possible for the homepage to look materially different from its current state before individual webparts are even revisited.
