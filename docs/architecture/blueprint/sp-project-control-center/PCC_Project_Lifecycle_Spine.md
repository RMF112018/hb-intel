# PCC Project Lifecycle Spine

## 1. Purpose

Define lifecycle continuity as first-class PCC architecture so project context survives across stages and remains usable by authorized roles without creating separate departmental workspaces.

## 2. Relationship to Existing ProjectStage / ProjectStatus

The lifecycle spine complements existing `ProjectStage` and `ProjectStatus` governance. Stage and status remain controlled vocabularies. The spine adds continuity semantics and transition evidence across:

Lead/Pursuit -> Estimating -> Preconstruction -> Setup/Mobilization -> Active Construction -> Closeout -> Warranty -> Archive -> Future Reference.

## 3. Lifecycle Event Concept

Lifecycle events capture meaningful project transitions and continuity anchors. Events are lifecycle references, not replacements for source transaction systems.

## 4. Stage Transition Checkpoints

Each stage transition should include governed checkpoint posture:

- entry criteria,
- required evidence references,
- readiness and blocker signals,
- approval/acknowledgement status,
- downstream handoff context.

## 5. Lifecycle Timeline UX

Lifecycle timeline UX should expose stage flow, event markers, checkpoint state, and major decision context in a permission-filtered view over the same project truth.

## 6. Relationship to Project Readiness

Project readiness modules provide signals that inform lifecycle transitions. Rollup into readiness views does not change source ownership of originating records.

## 7. Relationship to Workflow Modules

Workflow modules contribute event and checkpoint context. Modules remain structured control patterns in unified PCC context and are not independent lifecycle silos.

## 8. Relationship to Project Memory

Lifecycle events are indexed in project memory for continuity, rationale recall, and future reference while preserving source lineage.

## 9. Relationship to Closed-Project Knowledge Reuse

Archived lifecycle context becomes permissioned reference material for future pursuits, estimating, operations planning, warranty prevention, and executive learning.

## 10. MVP vs Later-Phase Timing

- MVP: doctrine, vocabulary, and cross-doc alignment.
- Later phase: runtime lifecycle timeline panels, transition workflows, and query endpoints through approved implementation gates.

## 11. Guardrails

- No lifecycle event record may duplicate or overwrite source ownership.
- No source-system writeback without explicit gate.
- No cross-project leakage of restricted content.
- No departmental workspace forks.

## Conceptual Record Definitions

### `ProjectLifecycleEvent`

- Owner: PCC (derived continuity layer).
- Likely source: PCC-native modules, project profile stage/status changes, and linked source-system events.
- Read/write posture: Read in MVP docs; write behavior deferred.
- Security class: Project-scoped, role-filtered; cross-project use requires explicit permissions.
- Relationship to current PCC models: Aligns with `ProjectStage`, readiness signals, and module read-model summaries.
- Phase timing: Architecture now; runtime implementation deferred.

### `ProjectStageTransitionCheckpoint`

- Owner: PCC governance.
- Likely source: readiness rollups, approvals/checkpoints, and controlled stage transitions.
- Read/write posture: Concept-only in this package.
- Security class: Project governance and leadership roles by default.
- Relationship to current PCC models: Extends existing stage/status governance and wave checkpoint doctrine.
- Phase timing: MVP architecture alignment; runtime flow later phase.

### `LifecycleGateSignal`

- Owner: PCC-derived signal.
- Likely source: readiness modules (startup, permit/inspection, responsibility, constraints, buyout, closeout), plus health/approval posture.
- Read/write posture: Derived/read-model concept; no runtime changes in this package.
- Security class: Role-filtered signal visibility.
- Relationship to current PCC models: Complements project-readiness framework and source lineage expectations.
- Phase timing: Architecture now; read-model expansion later.

### `LifecycleContextReference`

- Owner: PCC reference layer.
- Likely source: links to source-owned records and PCC-native items.
- Read/write posture: Reference/index concept only.
- Security class: Strict source-permission inheritance and project boundary controls.
- Relationship to current PCC models: Aligns with evidence link posture and object-link lineage doctrine.
- Phase timing: Documentation now; implementation deferred.
