# Unified PCC Lifecycle Objective Architecture

## Purpose

Define the controlling lifecycle architecture doctrine for Project Control Center (PCC) as one unified project operating layer across project stages, roles, and workflow patterns.

## Architecture Thesis

PCC is one unified, lifecycle-aware project operating layer. It maintains one canonical project context across the full project lifecycle. Surfaces, work centers, workflow modules, and lenses structure how users navigate and act, but they do not split PCC into departmental workspaces.

## Business Problem

Legacy project operations distribute context across handoff meetings, spreadsheets, PDFs, email chains, and disconnected systems. That causes loss of estimating intent, weak lifecycle continuity, reduced warranty traceability, and inconsistent decision grounding.

## Unified PCC Operating Model

- One project context per project site, governed through common shell navigation and permissions.
- Role, stage, and task context provided through lenses over the same project truth.
- Field-level source-of-record ownership retained by source systems.
- PCC-native workflow records, derived signals, and evidence references linked through source lineage.
- Cross-stage continuity preserved from pursuit through archive and future reference use.

## What PCC Is

- A unified project operating layer hosted on SharePoint.
- A governed shell with surface-level navigation:
  - Project Home
  - Team & Access
  - Documents
  - Project Readiness
  - Approvals
  - External Systems
  - Control Center Settings
  - Site Health
- A lifecycle continuity layer that preserves project memory, traceability, and evidence lineage.
- A role-aware and stage-aware operating experience with permission-filtered views.

## What PCC Is Not

- Not a set of separate departmental portals.
- Not a replacement for source ownership in Procore, Sage Intacct, or other systems.
- Not an unrestricted cross-project search surface.
- Not an AI-authored source of record.

## Surfaces, Work Centers, Modules, and Lenses

- Surfaces are shell-level navigable destinations.
- Work centers are governed capability domains; they are not separate apps, not departmental workspaces, and not independent ownership silos.
- Workflow modules are structured control patterns hosted in unified PCC context. A module can have a primary governance location and secondary surface affinity.
- Lenses are role/stage/task contextual views over one project truth. Lenses can reorder, emphasize, and filter content without forking project context.

## Project Lifecycle Continuity

PCC continuity spans pursuit to archive and future reference. Authorized users retain context across:

- Lead and pursuit assumptions,
- estimating intent and exclusions,
- setup and mobilization posture,
- active construction decisions and controls,
- closeout obligations,
- warranty outcomes,
- lessons learned for future work.

## Project Memory and Source Lineage

Project memory in PCC summarizes and connects source-owned and PCC-native records while preserving ownership. Every derived answer or signal must retain source lineage and evidence references.

## Cross-Stage Traceability

Traceability relationships connect estimate, scope, commitments, submittals, field events, closeout artifacts, warranty claims, and lessons learned without reassigning source ownership.

## Closed-Project Knowledge Reuse

Closed projects become governed reference context for authorized future users. Reuse supports pursuits, estimating, operations, warranty analysis, and executive learning with role-filtered access.

## Warranty and Obligation Traceability

Warranty workflows must trace claims and obligations back to scope, estimate references, vendor/subcontractor commitments, approved submittals, field evidence, and closeout records before conclusions are made.

## Unified Search and HBI Grounding

Unified search and HBI retrieval must operate across lifecycle context with:

- role and permission filtering,
- source-of-record boundaries,
- source lineage and evidence requirements,
- refusal or qualified responses when evidence is insufficient.

HBI is not a source of truth.

## Source-of-Record Boundaries

- Procore owns Procore-native records.
- Sage Intacct remains accounting book of record.
- PCC owns PCC-native workflow/control records.
- PCC-derived signals never overwrite source ownership.
- No duplicate source-of-record claims are permitted.

## Security and Access Posture

- Least-privilege, role-based, and stage-aware filtering is mandatory.
- Cross-project knowledge reuse is permission-scoped and auditable.
- Sensitive pursuit, executive, financial, warranty, HR, and privileged context is never exposed outside authorized scope.

## MVP vs Later-Phase Posture

- MVP establishes unified doctrine, foundational surfaces, and governed read-model patterns.
- Later phases may add richer lifecycle timelines, project memory panels, traceability graph views, warranty trace mode, and grounded search/HBI workflows through explicit architecture and implementation gates.

## Guardrails

- No separate PCC workspaces for Business Development, Estimating, Preconstruction, Operations, Project Controls, Accounting, Closeout, Warranty, Executive Oversight, or IT/Admin.
- No source-system writeback without explicit future gate.
- No production or tenant mutation from this documentation package.
- No HBI response without cited lineage and evidence grounding.
- No warranty conclusions without traceable evidence.
- No cross-project leakage.
- No module-specific architecture that bypasses unified shell doctrine.

## Required Future Documentation Alignment

All future PCC architecture, roadmap, register, wave, and implementation docs must align to this doctrine and explicitly describe:

- surface/work-center/module/lens separation,
- source-lineage and ownership posture,
- lifecycle continuity and project memory expectations,
- cross-stage traceability and warranty evidence requirements,
- grounded HBI behavior and permission controls.

## Practical Examples

- Operations can reference estimating/preconstruction assumptions and exclusions for current execution decisions.
- Estimating can reference authorized active/closed project outcomes for future pursuits.
- Warranty can trace a claim through estimate, scope, vendor, commitment, submittal, field, closeout, and lessons context.
- Executive oversight can review lifecycle continuity posture from pursuit through warranty.
- HBI can answer project questions only with source citations and lineage-backed evidence.
