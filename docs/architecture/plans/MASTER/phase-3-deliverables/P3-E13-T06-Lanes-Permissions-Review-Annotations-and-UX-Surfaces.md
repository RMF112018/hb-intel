# P3-E13-T06 — Lanes, Permissions, Review Annotations, and UX Surfaces

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E13-T06 |
| **Parent** | [P3-E13 Subcontract Execution Readiness Module](P3-E13-Subcontract-Execution-Readiness-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T06 of 8 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. Authority Model

### 1.1 Role behavior

| Role | Primary behavior |
|---|---|
| PM / APM / PA | Assemble package, upload evidence, respond to deficiencies, submit for specialist review, view current gate posture |
| Compliance / Risk | Own routine requirement evaluation, applicability rulings, readiness issuance, and exception-case administration |
| PX | Receives flagged business-risk visibility and acts where policy requires PX exception approval |
| CFO | Acts only where packet policy requires financial-risk approval authority |
| Compliance Manager | Acts where packet policy requires managed compliance authority distinct from routine evaluator actions |
| PER / review-only roles | Read-only or annotation-only visibility on supported review-capable surfaces |
| Read-only consumers | Observe current readiness posture without authoring actions |

### 1.2 Governing rule

Compliance / Risk owns routine evaluation and routine readiness issuance. PX does not become the default owner simply because a package affects contract execution.

---

## 2. Review, Approval, Issuance, And Gate Enforcement Are Distinct

The UX and permission model must preserve four separate actions:

- **annotation** — review-only, non-mutating,
- **approval** — governed action on an exception iteration slot,
- **readiness issuance** — specialist issuance of the active decision,
- **gate enforcement** — Financial consuming the issued decision to block or allow contract execution.

The UI must never imply that an annotation thread or an approval action directly flips Financial status.

---

## 3. Review-Capable Annotation Surfaces

The module is review-capable in Phase 3.

Supported annotation targets:

- case header and summary,
- requirement item detail,
- item evaluation detail,
- exception iteration detail,
- readiness decision detail,
- lineage / supersession summary where shown.

Annotations are always:

- review-only,
- non-mutating,
- stored through `@hbc/field-annotations`,
- separate from primary readiness ledgers.

---

## 4. PWA Versus SPFx Expectations

### 4.1 PWA depth

PWA is the full-depth lane for:

- dense requirement evaluation,
- exception packet history,
- iteration diff and history review,
- lineage and supersession inspection,
- cross-module analysis,
- complete case-detail authoring,
- precedent-reference management.

### 4.2 SPFx depth

SPFx supports lighter operational visibility and direct task execution where appropriate:

- case list and case summary,
- item and deficiency status,
- straightforward assembly and submission tasks,
- approval actions where the interaction is simple,
- read-only visibility into decision posture and linked buyout context.

Where deeper workflow is needed, SPFx should launch to PWA rather than attempting to replicate PWA-depth specialist tooling.

---

## 5. UX Surface Expectations

Minimum UX expectations:

- `WorkspacePageShell` for top-level surfaces,
- dense table / list treatment for registry and workbench surfaces,
- visible distinction between artifact state and evaluation state,
- visible lineage / supersession indicators,
- visible issuance status separate from workflow status,
- visible exception-iteration history,
- visible renewal / expiration posture where relevant,
- `HbcSmartEmptyState` for empty or pre-activation surfaces.

The UX must make the specialist nature of the workflow legible. It must not read like a generic 12-row checklist form.

---

## 6. Visibility Expectations

### 6.1 Operational actors

PM / APM / PA see:

- package assembly state,
- requirement status,
- deficiencies,
- decision posture,
- linked buyout context,
- read-only exception outcomes where not the acting authority.

### 6.2 Specialist actors

Compliance / Risk sees full detail across:

- item metadata,
- evaluation history,
- packet history,
- delegation audit,
- decision issuance controls.

### 6.3 Review actors

PER and similar review-only actors see governed read projections and annotation affordances where policy permits, but do not receive mutation authority over readiness state.
