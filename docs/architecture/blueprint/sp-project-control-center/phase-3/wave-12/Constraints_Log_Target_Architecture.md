# Constraints Log Target Architecture

Date: 2026-05-02
Wave: 12
Official module name: `Constraints Log`
User-facing subtitle: `Make-Ready Constraint & Risk Exposure Center`

## Purpose

Define the Wave 12 Project Readiness architecture for managing make-ready constraints and exposure posture with clear governance boundaries.

## Product Pillars

1. Make-ready execution posture for known blockers.
2. Embedded exposure visibility for risk, schedule, and change conditions requiring review.
3. Role-based ownership, escalation, and resolution accountability.
4. Reference-only cross-system posture with no external-system writeback.
5. Documentation-first governance with no legal/claim/delay determination automation.

## Core Definitions

- Risk: uncertain future event or condition.
- Constraint: known blocker to planned work.
- Issue: active problem.
- Delay exposure: potential or actual schedule-impact condition requiring review.
- Change exposure: potential or actual scope/cost/contract impact condition requiring review.

## Module Placement and Alignment Note

- Governing documentation places Wave 12 `Constraints Log` under Project Readiness.
- Current source-model registry maps `constraints-log` to `risk-issues-decision`.
- This is a documentation alignment note only in Wave 12 docs; no source-model edits are part of this prompt.

## Personas and Permissions

- Project Manager: create/update constraints, assign owners, set due dates, escalate, close.
- Superintendent: manage field execution blockers, update status/urgency, submit exposure notes.
- Project Executive: review exposure posture, override priority bands, approve major escalation paths.
- Project Controls/Scheduler: maintain look-ahead dependencies and delay-exposure commentary.
- Project Accountant: review change-exposure conditions and cost-impact visibility notes.
- Executive Oversight (read-only): governed visibility into aggregate exposure posture.

## UX Surfaces

- Constraints board/list with filter, sort, grouping, and status controls.
- Constraint detail panel with owner, dates, dependencies, comments/history, and escalation state.
- Embedded risk/exposure summary widgets for initial/residual risk and urgency-impact posture.
- Priority Actions handoff indicators for blocked/high-severity conditions.
- Read-only executive exposure summary.

## Saved Views

- My Assigned Constraints
- Blocked This Week
- High Severity Exposure
- Delay Exposure Review Queue
- Change Exposure Review Queue
- Executive Readout

## Metrics

- Open constraints by severity band.
- Aging of unresolved constraints.
- Escalation count and resolution turnaround.
- Initial vs residual risk trend.
- Delay exposure and change exposure queue volume.
- Priority Actions-linked blocker volume.

## Integration Seams and Boundaries

- Wave 8: consumes shared Project Readiness framework seams.
- Wave 9/10/11: aligns with lifecycle, permit/inspection, and responsibility context.
- Wave 14: approval/checkpoint execution remains owned by Wave 14.
- Priority Actions: receives blockers/high-severity escalation signals.
- Document Control: evidence-link/reference posture only; no binary ownership transfer.
- Scheduler/Look Ahead: coordination posture for planned work sequencing and due-window risk.
- External Systems: launcher/reference-only posture; no sync/writeback/mutation.

## Workbook-Source Posture

Workbook-derived taxonomy and seed structure are reference inputs for architecture and default field/category posture only.
No workbook row is treated as authoritative runtime behavior, legal determination, or automated decision output.

## Embedded Matrix/Exposure Posture Summary

Wave 12 includes an embedded risk matrix and constraint exposure model for project-controls prioritization.
Detailed scoring mechanics are defined in `Wave_12_Risk_And_Constraint_Exposure_Model.md`.

## Guardrails

- No legal advice or legal determination automation.
- No claim/entitlement/compensability or delay-damages determinations.
- No forensic schedule analysis automation.
- No external-system writeback, mutation, or mirrored runtime integration behavior.
- Documentation posture only; no runtime/source/package/lockfile/manifest/workflow/backend/SPFx/tenant changes.

## Definition of Done

1. Constraints Log architecture is defined as a Project Readiness module with official naming and subtitle posture.
2. Personas, permissions, surfaces, views, metrics, and integration seams are documented.
3. Exposure boundary definitions are explicit and consistent.
4. Risk/exposure scoring ownership is documented and delegated to the dedicated model doc.
5. Guardrails and documentation-only boundaries are explicit.
