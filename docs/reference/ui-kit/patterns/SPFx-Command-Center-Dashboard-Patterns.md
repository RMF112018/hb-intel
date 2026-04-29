# SPFx Command Center Dashboard Patterns

> **Governance Status:** Supporting pattern
> **Inherits from:**
>
> - `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
> - `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Full-Page-App-Widget-Overlay.md`
> - `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md`
>   **Doctrine Precedence:** This document does not override Layer 1 runtime doctrine.

## Purpose

Define command-center dashboard composition patterns for PCC-style and similar non-homepage SPFx surfaces.

## Core composition model

### Overview zones (bento/cockpit)

Use bento/cockpit composition for overview surfaces where rapid scan and cross-signal interpretation are primary goals.

Typical overview zones:

- command/search zone
- KPI/status band
- prioritized widget matrix with variable spans
- context rail for alerts, filters, or responsibility queues

### Workbench zones (structured execution)

Use structured workbench composition for:

- workflows
- forms
- logs
- approvals
- detail review

Workbench zones prioritize task progression clarity over symmetrical card appearance.

## Layout quality rules

- Container-aware behavior is required.
- Fixed equal-height row defaults are prohibited where they create whitespace or compression traps.
- Generic enterprise-card-grid dominance is prohibited for serious command-center surfaces.
- Mobile and tablet must preserve equivalent design depth, not become reduced-function afterthoughts.

## Widget integration requirements

Command-center layouts must include widgets with documented footprint variant and contract fields:

- compact, standard, wide, hero, tall, full, rail, detail
- purpose
- minimum width
- preferred span
- height behavior
- compact behavior
- state obligations
- data seam/freshness obligations
- accessibility obligations

## Command-center decision heuristics

- Use wider/hero/full footprints for primary decision surfaces.
- Use compact/standard footprints for secondary status and queue context.
- Use rail/detail footprints to anchor persistent context without overcrowding the overview matrix.
- Switch from cockpit overview to workbench emphasis when task execution or review depth becomes dominant.

## Acceptance linkage

- Validate composition against the acceptance/scoring model.
- Record evidence for host/runtime behavior and device-depth parity.
- Hard-stop failures block acceptance regardless of numeric score.
