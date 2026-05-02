# Wave 12 Constraints Log Scope Lock

Date: 2026-05-02
Wave: 12
Module: `Constraints Log` (`Make-Ready Constraint & Risk Exposure Center`)

## Scope Lock Objective

Lock Wave 12 architecture scope to make-ready constraint and exposure-governance documentation with explicit boundaries and dependency seams.

## In Scope

- Project Readiness placement for Wave 12 `Constraints Log`.
- Governance architecture for constraint lifecycle, assignment, escalation, and closure posture.
- Exposure-governance definitions: risk, constraint, issue, delay exposure, change exposure.
- Embedded matrix/exposure architecture posture and references to dedicated scoring model.
- Personas/permissions, UX surface responsibilities, saved views, and metrics definitions.
- Integration seams with Wave 8/9/10/11/14, Priority Actions, Document Control, Scheduler/Look Ahead, and External Systems (launcher/reference-only).
- Workbook-source taxonomy posture as reference input only.

## Out of Scope

- Runtime/source implementation changes.
- Backend route/controller/data-store changes.
- SPFx surface/component implementation changes.
- Package/dependency/lockfile/manifest/workflow/CI/tenant changes.
- External-system writeback/sync/mutation behavior.
- Legal/claim/entitlement/delay-damages/forensic schedule analysis determinations.
- Detailed UI contracts or component-level implementation specs.

## Dependency and Ownership Locks

- Wave 8 retains Project Readiness framework ownership.
- Wave 9/10/11 provide upstream readiness context; Wave 12 does not redefine those modules.
- Wave 14 retains approvals/checkpoints runtime execution ownership.
- Priority Actions receives escalation signals; it is not owned by Wave 12.
- HB Document Control Center and SharePoint project record retain evidence-binary ownership.
- External Systems remains launch/deep-link/reference posture only.

## Alignment Note Lock

- Governing docs place Wave 12 under Project Readiness.
- Current source-model mapping `constraints-log -> risk-issues-decision` remains unchanged in this prompt.
- This lock documents alignment posture only; no source-model updates are authorized here.

## Completion Lock for Prompt 03

Prompt 03 is complete when:

1. Target architecture, scope lock, risk/exposure model, and resolved decisions docs exist in Wave 12 blueprint path.
2. Definitions and guardrails are consistent across the four docs.
3. No non-documentation files are modified.
