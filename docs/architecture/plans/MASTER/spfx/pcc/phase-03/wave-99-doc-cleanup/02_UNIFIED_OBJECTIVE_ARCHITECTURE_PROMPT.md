# 02 — Create Unified PCC Objective Architecture Doctrine

## Objective

Create the primary doctrine document that states PCC's unified lifecycle target architecture and prevents future siloed departmental implementation.

## New File to Create

```text
docs/architecture/blueprint/sp-project-control-center/Unified_PCC_Lifecycle_Objective_Architecture.md
```

## Required Purpose

This document must become the controlling architecture narrative for PCC lifecycle continuity.

It must define PCC as:

- one unified project operating layer;
- one canonical project context across all stages;
- work-center organized but not department-siloed;
- role-aware, stage-aware, and task-aware through lenses;
- source-of-record disciplined;
- lifecycle-continuity oriented;
- project-memory capable;
- traceability-ready;
- HBI-grounding-ready;
- closed-project knowledge-reuse ready.

## Required Sections

Create the document with these sections:

1. **Purpose**
2. **Architecture Thesis**
3. **Business Problem**
4. **Unified PCC Operating Model**
5. **What PCC Is**
6. **What PCC Is Not**
7. **Surfaces, Work Centers, Modules, and Lenses**
8. **Project Lifecycle Continuity**
9. **Project Memory and Source Lineage**
10. **Cross-Stage Traceability**
11. **Closed-Project Knowledge Reuse**
12. **Warranty and Obligation Traceability**
13. **Unified Search and HBI Grounding**
14. **Source-of-Record Boundaries**
15. **Security and Access Posture**
16. **MVP vs Later-Phase Posture**
17. **Guardrails**
18. **Required Future Documentation Alignment**

## Required Content Rules

### Surfaces

State that surfaces are shell-level navigation destinations, currently including:

- Project Home
- Team & Access
- Documents
- Project Readiness
- Approvals
- External Systems
- Control Center Settings
- Site Health

### Work Centers

State that work centers are governed capability domains. They are not separate apps, not separate departmental workspaces, and not independent source-of-record silos.

### Workflow Modules

State that workflow modules are structured control patterns hosted within the unified PCC context. A module may have a primary governance location and secondary affinity surfaces.

### Lenses

Define role/stage/task lenses as contextual views over the same project truth. Lenses may reorder, emphasize, filter, and permission information; they must not fork the project experience.

### Required Anti-Silo Language

Include clear statements that PCC must not create separate workspaces for:

- Business Development
- Estimating
- Preconstruction
- Operations
- Project Controls
- Accounting
- Closeout
- Warranty
- Executive Oversight
- IT/Admin

These groups may have lenses, dashboards, views, permissioned controls, and workflows, but the architecture remains one PCC project context.

### Required Examples

Include practical examples:

- Operations referencing estimating/preconstruction assumptions.
- Estimating referencing active or closed projects for new pursuits.
- Warranty tracing estimate/scope/vendor/product/submittal/commitment/field/closeout records.
- Executives viewing project continuity across lifecycle stages.
- HBI answering with citations and source lineage.

## Guardrails to Include

- No duplicate source-of-record claims.
- No source-system writeback without explicit gate.
- No direct production/tenant mutation.
- No HBI answer without cited source lineage.
- No warranty conclusions without evidence.
- No cross-project leakage.
- No module-specific architecture bypassing the unified shell.

## Validation

After creating the doc:

```bash
pnpm exec prettier --check docs/architecture/blueprint/sp-project-control-center/Unified_PCC_Lifecycle_Objective_Architecture.md
```

If it fails formatting, run Prettier only on this new file.

Do not run broad formatting.
