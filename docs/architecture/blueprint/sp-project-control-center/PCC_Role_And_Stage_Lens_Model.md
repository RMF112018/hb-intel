# PCC Role And Stage Lens Model

## 1. Purpose

Define lens behavior for presenting one PCC project truth to different roles, lifecycle stages, and task contexts without creating separate workspaces.

## 2. Lens Definition

A lens is a governed contextual view that reorders and filters shared project data according to role, stage, and current tasks.

## 3. Lens vs Surface

Surfaces are shell navigation destinations. Lenses are view behavior applied within and across surfaces.

## 4. Lens vs Work Center

Work centers are capability domains. Lenses do not change domain ownership; they adjust context presentation.

## 5. Lens vs Workflow Module

Workflow modules are control patterns. Lenses determine how module context is shown to a user.

## 6. Role Lenses

- Estimating Coordinator: primary lens `Pursuit/Estimating Continuity`; active work handoff readiness; historical context from comparable outcomes; restricted live financial and privileged exec content; cross-stage use case is preserving bid assumptions into startup.
- Lead Estimator: primary lens `Estimating Intent`; active work scope/pricing assumptions; historical context from closed-project variances; restricted HR and unrelated project details; cross-stage use case is validating assumptions against operations outcomes.
- Estimator: primary lens `Estimate-to-Execution Trace`; active work alternates/exclusions tracking; historical context from warranty and lessons references; restricted executive-only decisions; cross-stage use case is future pursuit calibration.
- Director of Preconstruction: primary lens `Preconstruction Governance`; active work readiness and handoff quality; historical context from prior mobilization blockers; restricted role-specific personnel data; cross-stage use case is gating transition quality.
- Marketing / Pursuits: primary lens `Comparable Project Intelligence`; active work pursuit strategy; historical context from closed-project lessons; restricted active-project sensitive execution details; cross-stage use case is pursuing similar details with evidence.
- IDS: primary lens `Design/Document Coordination`; active work document and source integrity; historical context from submittal/closeout references; restricted finance and HR; cross-stage use case is preserving document lineage continuity.
- Project Executive: primary lens `Lifecycle Control`; active work risk/readiness escalation; historical context from project memory and outcomes; restricted HR-only details; cross-stage use case is continuity oversight across stages.
- Project Manager: primary lens `Execution and Readiness`; active work coordination, constraints, and buyout posture; historical context from estimating and preconstruction assumptions; restricted executive-private content; cross-stage use case is linking handoff intent to field actions.
- Superintendent: primary lens `Field Delivery`; active work inspections, blockers, and execution readiness; historical context from scope and approved product context; restricted accounting internals; cross-stage use case is tracing installed work to upstream approvals.
- Project Accountant: primary lens `Financial/Commitment Context`; active work commitment and closeout accounting posture; historical context from buyout and obligation records; restricted HR/executive strategy items; cross-stage use case is linking commitments to downstream claims.
- QAQC / Safety: primary lens `Compliance and Risk`; active work inspections, observations, and evidence quality; historical context from prior issue patterns; restricted unrelated financial detail; cross-stage use case is applying past controls to current risk.
- Warranty: primary lens `Warranty Trace`; active work claim triage and obligation evidence; historical context from closeout and field records; restricted pursuit-confidential content; cross-stage use case is root-cause trace across lifecycle.
- Executive Oversight: primary lens `Portfolio Continuity`; active work posture and trend review; historical context across authorized projects; restricted project-level sensitive details without approval; cross-stage use case is enterprise learning.
- IT / PCC Admin: primary lens `Governance and Health`; active work configuration, access governance, and site health; historical context from drift and control events; restricted business-private content unless required; cross-stage use case is enforcing doctrine consistency.

## 7. Stage Lenses

Stage lenses emphasize stage-relevant controls while preserving prior-stage context and forward dependencies:

- Lead/Pursuit
- Estimating
- Preconstruction
- Setup/Mobilization
- Active Construction
- Closeout
- Warranty
- Archive/Future Reference

## 8. Task Lenses

Task lenses focus workflows such as readiness unblock, warranty trace, buyout decisioning, inspection response, or evidence verification across the same project truth.

## 9. Lens Switching UX

Lens switching must be explicit, auditable, and reversible. It changes context emphasis, not ownership or storage boundaries.

## 10. Security and Permission Filtering

Lens outputs must honor least privilege, role grants, stage constraints, and cross-project boundaries.

## 11. Default Lens by Role / Stage

Default lens should be computed by role plus current stage, with controlled override options when permissions allow.

## 12. Cross-Stage Historical Context

Lenses must preserve authorized historical context so users can see upstream assumptions and downstream outcomes without losing lifecycle continuity.

## 13. Guardrails

- Lenses are never departmental workspace forks.
- Lens-specific UI cannot bypass unified shell governance.
- Lens filters cannot expose restricted data.
- Lens outputs must preserve source lineage and evidence links.
