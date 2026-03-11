# ADR-0103 — Related Items Unified Work Graph Primitive

**Status:** Accepted
**Date:** 2026-03-11
**Deciders:** HB Intel Architecture Team
**Supersedes:** None

## Context

Cross-module relationships are critical to record context but are currently siloed and non-discoverable in a consistent UI surface.

## Decisions

### D-01 — Relationship Registry
Use module-registered relationship definitions with `registerBidirectionalPair()`.

### D-02 — Direction Model
Use fixed relationship-direction union values.

### D-03 — ID Resolution Strategy
Resolve related IDs via module-local resolver functions with governance metadata.

### D-04 — API Model
Fetch related-item summaries via batched backend route.

### D-05 — UI Model
Render grouped relationship panel with item cards and version chips.

### D-06 — Visibility Model
Support role-gated relationship visibility and role-aware empty states.

### D-07 — Complexity Behavior
Hide panel in Essential; show progressively richer info in Standard/Expert including AI group.

### D-08 — Canvas Integration
Expose panel as project-canvas tile with compact top-3 + overlay.

### D-09 — Bidirectional Baseline
Require bidirectional relationship registration for key lifecycle links.

### D-10 — Testing Sub-Path
Expose canonical fixtures from `@hbc/related-items/testing`.

## Compliance

This ADR is locked and can only be superseded by explicit follow-up ADR.
