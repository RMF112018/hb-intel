# ADR-0106 — Admin Intelligence Layer

**Status:** Accepted
**Date:** 2026-03-12
**Deciders:** HB Intel Architecture Team
**Supersedes:** None
**Note:** Source spec PH7-SF-17 referenced ADR-0026. Canonical ADR number for SF17 is ADR-0106.

## Context

Production trust requires proactive admin alerting, verifiable infrastructure truth, and configurable approval authority — capabilities that must live inside the existing `@hbc/features-admin` boundary without introducing a new standalone package.

## Decisions

### D-01 — Package Alignment
Admin-intelligence is delivered within `@hbc/features-admin`; no new standalone package.

### D-02 — Alert Scope
Use six monitored admin conditions (provisioning failure, permission anomaly, stuck workflow, overdue provisioning task, upcoming expiration, stale draft) with explicit severity.

### D-03 — Alert Lifecycle
Acknowledge marks seen only; alerts resolve only when the source condition clears.

### D-04 — Probe Scheduling
Run implementation-truth probes on a default 15-minute schedule with configurable cadence and retry policy.

### D-05 — Approval Authority Storage
Store approval authority in admin-managed policy records with user/group approvers and `any|all` mode.

### D-06 — Approval Integration
Approval-capable packages resolve approvers through `ApprovalAuthorityApi.getApprovers(context)`.

### D-07 — Complexity Behavior
Essential: badge only; Standard: alert dashboard; Expert: full truth-layer diagnostics and approval simulation.

### D-08 — Notification Policy
Critical/high alert conditions route immediate admin notifications; medium/low join digest flow.

### D-09 — Platform Constraints
Use app-shell-safe UI composition; no unsupported modal primitives in SPFx surfaces.

### D-10 — Testing Sub-Path
Expose canonical fixtures via `@hbc/features-admin/testing`.

## Compliance

This ADR is locked and can only be superseded by explicit follow-up ADR.
