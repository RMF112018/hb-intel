# PCC Project Memory Layer

## 1. Purpose

Define project memory as a persistent context layer that preserves lifecycle continuity across roles and stages without creating a second source of truth.

## 2. What Project Memory Solves

- Loss of intent between estimating, preconstruction, operations, closeout, and warranty.
- Repeated analysis caused by disconnected records.
- Weak evidence chains for warranty and lessons learned.
- Limited historical context for authorized future pursuits.

## 3. What Belongs in Project Memory

- Linked decisions and assumptions.
- Constraints, risks, obligations, and rationale summaries.
- Source lineage metadata and evidence references.
- Role-filtered continuity notes across lifecycle transitions.

## 4. What Does Not Belong in Project Memory

- Replacement ownership for Procore/Sage/native source objects.
- Unattributed AI conclusions.
- Unfiltered sensitive cross-project data.
- Direct binary mirroring not approved by doctrine.

## 5. Source-Owned vs PCC-Native vs PCC-Derived Memory

- Source-owned facts stay source-owned.
- PCC-native workflow records remain PCC-owned.
- PCC-derived memory records summarize and connect, never overwrite ownership.

## 6. Decisions and Assumptions

Project memory should preserve:

- why a decision was made,
- what assumptions were active,
- who approved or acknowledged,
- what evidence supported the posture.

## 7. Risks, Constraints, Obligations, Vendors, Products, and Lessons

Memory should connect these domains so downstream users can understand historical drivers and outcomes without re-creating context manually.

## 8. Evidence Links and Source Lineage

Every memory record should include lineage links to supporting source objects and evidence references. Unsupported conclusions should be flagged as insufficient.

## 9. HBI Grounding

HBI may summarize memory records only when lineage is available and permissions allow access. HBI must qualify or refuse when evidence is insufficient.

## 10. Security Filtering

- Role-based and stage-aware filtering applies to all memory views.
- Cross-project references require explicit authorization.
- Restricted executive, financial, HR, and privileged records remain filtered.

## 11. UX Patterns

- Memory timeline and decision threads.
- Assumption-to-outcome cross-links.
- Evidence-backed context cards in module and search views.

## 12. MVP vs Later-Phase Timing

- MVP: doctrine, terminology, and alignment only.
- Later phase: memory panels, query endpoints, and trace views.

## 13. Guardrails

- No second source of truth behavior.
- No source writeback.
- No cross-project leakage.
- No non-cited AI claims as project fact.

## Conceptual Record Definitions

### `ProjectMemoryRecord`

- Owner: PCC derived/reference layer.
- Source: PCC-native records plus linked source-owned evidence.
- Read/write posture: Concept-only; runtime write behavior deferred.
- Security class: Project-scoped; role-filtered.
- Phase timing: Documentation now; implementation deferred.
- Relationship to current PCC models: Extends readiness, constraints, and module evidence lineage posture.

### `ProjectDecisionRecord`

- Owner: PCC governance record family.
- Source: approvals/checkpoints and validated module decisions.
- Read/write posture: Concept-only in this package.
- Security class: Role-gated by governance sensitivity.
- Phase timing: Future implementation gate.
- Relationship to current PCC models: Aligns with approvals and readiness checkpoint doctrine.

### `ProjectAssumptionRecord`

- Owner: PCC continuity layer.
- Source: estimating/preconstruction handoff and lifecycle context updates.
- Read/write posture: Concept-only.
- Security class: Project role-filtered; some assumptions may be restricted.
- Phase timing: Future-phase modeling.
- Relationship to current PCC models: Bridges estimating context with operations/warranty views.

### `SourceLineageRecord`

- Owner: PCC lineage framework.
- Source: source-system object metadata and PCC reference links.
- Read/write posture: Concept-only.
- Security class: Inherits source visibility boundaries.
- Phase timing: Architecture now; endpoint/model implementation later.
- Relationship to current PCC models: Consistent with existing lineage doctrine in SoR matrix and read-model envelopes.

### `EvidenceLinkRecord`

- Owner: PCC reference classification record.
- Source: links to Procore/SharePoint/Sage/external artifacts as permitted.
- Read/write posture: Concept-only in this package.
- Security class: Permission and policy constrained.
- Phase timing: Later-phase runtime.
- Relationship to current PCC models: Extends existing evidence-link posture without ownership reassignment.
