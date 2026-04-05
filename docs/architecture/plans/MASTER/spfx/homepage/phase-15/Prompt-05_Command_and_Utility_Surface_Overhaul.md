# Prompt 05 — Command and Utility Surface Overhaul

## Objective

Transform utility surfaces from tidy grouped lists into premium command surfaces with clearer urgency, sharper affordances, and stronger visual hierarchy.

## Primary Scope

- `apps/hb-webparts/src/webparts/priorityActionsRail/`
- any adjacent utility group shells and shared homepage utility primitives
- `@hbc/ui-kit/homepage` utility-related primitives

## Hard Instructions

- Do not reread files already in current context or memory.
- The current utility presentation is too list-like and visually dead.
- Equal-weight rows are not sufficient.
- Utility modules must feel active, important, and premium.

## Required Work

1. Redesign Priority Actions so critical, due, blocked, pending, and standard items do not look visually interchangeable.
2. Introduce stronger command-surface behavior, such as:
   - featured action treatment
   - urgency chips / indicators
   - richer row affordances
   - better state framing
   - tighter but more intentional density
3. Rework group shells so “Today,” “Approvals,” and similar groups feel deliberate, not generic.
4. Improve CTA and interactive affordances to feel more like product controls and less like standard linked list entries.
5. Rebuild any weak shared action-row primitives if they are holding the surface back.

## Required Validation

- Show before/after.
- Demonstrate that the redesigned surface no longer reads as a standard card full of links.
- Validate keyboard, focus, hover, and reduced-motion behavior.

## Deliverables

- utility-surface implementation changes
- shared primitive changes if needed
- closure note focused on improved urgency and command quality
