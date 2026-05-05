# 03 — Baseline Evidence and Screenshot Plan

## Purpose

Define the evidence structure required before any 56/56 claim.

## Required Evidence Location

Create or validate:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/evidence/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/evidence/screenshots/before/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/evidence/screenshots/after/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/evidence/tenant-validation/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/evidence/accessibility/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/evidence/scorecards/
```

## Before Screenshot Requirements

Capture each surface at minimum:

- desktop wide,
- desktop constrained SharePoint canvas width,
- tablet width,
- mobile/narrow container if the surface is expected to support it.

Required surfaces:

- Project Home.
- Team & Access.
- Documents.
- Project Readiness.
- Approvals.
- External Systems.
- Control Center Settings.
- Site Health.
- Any additional routed surfaces discovered in repo truth.

## Screenshot Naming Convention

Use deterministic names:

```text
before/{surface-key}__{viewport-key}__{date-or-build}.png
after/{surface-key}__{viewport-key}__{date-or-build}.png
```

Examples:

```text
before/project-home__desktop-wide__2026-05-05.png
before/team-access__sharepoint-constrained__2026-05-05.png
```

## Evidence Index

Use:

```text
artifacts/screenshot-evidence-index-template.md
```

Copy it into:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/evidence/screenshot-evidence-index.md
```

## Minimum Closeout Evidence

A final 56/56 claim requires:

- final scorecard,
- screenshots,
- tenant-hosted validation,
- accessibility/keyboard evidence,
- test/typecheck/build evidence,
- exact files changed,
- residual risk log,
- no hard stops.
