# ADR-0102 — Project Canvas Role-Based Dashboard Primitive

**Status:** Accepted
**Date:** 2026-03-10
**Deciders:** HB Intel Architecture Team
**Supersedes:** None
**Note:** Source spec PH7-SF-13 referenced ADR-0022. Canonical ADR number for SF13 is ADR-0102.

## Context

Generic dashboards fail role-specific workflows in construction project delivery.

## Decisions

### D-01 — Tile Registry
Central tile registry with lazy-loaded tile components.

### D-02 — Role Defaults
Role-specific default tile sets are mandatory with first-load smart-defaulting from Project Health Pulse signals.

### D-03 — Persistence
User/project canvas layouts persisted via backend API.

### D-04 — Edit Model
Add/remove/rearrange/resize with unsaved-change tracking.

### D-05 — Locking
Admin lock and mandatory tiers prevent prohibited tile removal/repositioning, with role-wide apply support.

### D-06 — Complexity
Every tile provides Essential/Standard/Expert lazy variants rendered by user complexity tier.

### D-07 — Platform Compatibility
SPFx-safe rendering and backend API persistence.

### D-08 — Drag Engine
`@dnd-kit/core` for drag/rearrange interactions.

### D-09 — Integration Baseline
Cross-package tile integrations include dynamic recommendation inputs, intelligent notification hub behavior, and AIInsightTile-ready registration paths.

### D-10 — Testing Sub-Path
`@hbc/project-canvas/testing` exports canonical fixtures.

## Compliance

This ADR is locked and can only be superseded by explicit follow-up ADR.
