# Wave 10 Scope Lock — Permit & Inspection Control Center

Generated: 2026-05-01

## Scope Lock Statement

Wave 10 scope is architecture-definition only for a unified Permit & Inspection Control Center.

## In-Scope Architecture Outcomes

- Unified module identity and command-center posture.
- Internal source-family continuity (`permits`, `required-inspections`).
- Permit/inspection/fee/AHJ model definitions.
- Failed/reinspection lineage requirement.
- Workbook-source traceability posture.
- Integration seams for Project Readiness, Priority Actions, Approvals / Checkpoints, HB Document Control Center, and External Systems.
- Guardrails and acceptance criteria.

## Out-of-Scope for Wave 10 Architecture Definition

- Runtime backend routes and services.
- Runtime SPFx UI/surface behavior.
- External-system scheduling/request/writeback automation.
- Tenant mutation, packaging, deployment, and manifest updates.

## Mandatory Guardrails

- AHJ posture remains launcher-link only.
- Procore posture remains launcher/reference only.
- Evidence-backed closeout remains default.
- Wave 8 ownership of framework seams remains intact.
- Wave 14 ownership of approvals/checkpoints remains intact.
