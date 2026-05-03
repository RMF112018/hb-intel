# 03 — Create Lifecycle Spine, Project Memory, and Role/Stage Lens Docs

## Objective

Create the core architecture documents that convert the unified PCC doctrine into implementable lifecycle, memory, and lens models.

## New Files to Create

```text
docs/architecture/blueprint/sp-project-control-center/PCC_Project_Lifecycle_Spine.md
docs/architecture/blueprint/sp-project-control-center/PCC_Project_Memory_Layer.md
docs/architecture/blueprint/sp-project-control-center/PCC_Role_And_Stage_Lens_Model.md
```

## File 1: PCC_Project_Lifecycle_Spine.md

### Required Thesis

PCC should treat lifecycle continuity as a first-class architecture concept.

The lifecycle spine must connect:

```text
Lead / Pursuit
→ Estimating
→ Preconstruction
→ Setup / Mobilization
→ Active Construction
→ Closeout
→ Warranty
→ Archive
→ Future Reference
```

### Required Sections

1. Purpose
2. Relationship to Existing ProjectStage / ProjectStatus
3. Lifecycle Event Concept
4. Stage Transition Checkpoints
5. Lifecycle Timeline UX
6. Relationship to Project Readiness
7. Relationship to Workflow Modules
8. Relationship to Project Memory
9. Relationship to Closed-Project Knowledge Reuse
10. MVP vs Later-Phase Timing
11. Guardrails

### Required Record Concepts to Define

Define conceptual records only. Do not implement code.

- `ProjectLifecycleEvent`
- `ProjectStageTransitionCheckpoint`
- `LifecycleGateSignal`
- `LifecycleContextReference`

For each concept, state:
- owner,
- likely source,
- read/write posture,
- security class,
- relationship to current PCC models,
- phase timing.

## File 2: PCC_Project_Memory_Layer.md

### Required Thesis

Project Memory is the persistent context layer that prevents knowledge loss between departments and stages.

It must not be a second source of truth. It must summarize, index, connect, and cite source-owned and PCC-native records.

### Required Sections

1. Purpose
2. What Project Memory Solves
3. What Belongs in Project Memory
4. What Does Not Belong in Project Memory
5. Source-Owned vs PCC-Native vs PCC-Derived Memory
6. Decisions and Assumptions
7. Risks, Constraints, Obligations, Vendors, Products, and Lessons
8. Evidence Links and Source Lineage
9. HBI Grounding
10. Security Filtering
11. UX Patterns
12. MVP vs Later-Phase Timing
13. Guardrails

### Required Record Concepts to Define

Define conceptual records only. Do not implement code.

- `ProjectMemoryRecord`
- `ProjectDecisionRecord`
- `ProjectAssumptionRecord`
- `SourceLineageRecord`
- `EvidenceLinkRecord`

For each, state:
- owner,
- source,
- read/write posture,
- security class,
- phase timing,
- relationship to current PCC models.

## File 3: PCC_Role_And_Stage_Lens_Model.md

### Required Thesis

Lenses are contextual views over the same PCC project truth. They are not separate workspaces.

### Required Sections

1. Purpose
2. Lens Definition
3. Lens vs Surface
4. Lens vs Work Center
5. Lens vs Workflow Module
6. Role Lenses
7. Stage Lenses
8. Task Lenses
9. Lens Switching UX
10. Security and Permission Filtering
11. Default Lens by Role / Stage
12. Cross-Stage Historical Context
13. Guardrails

### Required Role Coverage

Include at minimum:

- Estimating Coordinator
- Lead Estimator
- Estimator
- Director of Preconstruction
- Marketing / Pursuits
- IDS
- Project Executive
- Project Manager
- Superintendent
- Project Accountant
- QAQC / Safety
- Warranty
- Executive Oversight
- IT / PCC Admin

For each role, include:
- primary lens,
- active work,
- historical context,
- restricted content,
- cross-stage use case.

## Validation

Run Prettier check only on the new files:

```bash
pnpm exec prettier --check \
  docs/architecture/blueprint/sp-project-control-center/PCC_Project_Lifecycle_Spine.md \
  docs/architecture/blueprint/sp-project-control-center/PCC_Project_Memory_Layer.md \
  docs/architecture/blueprint/sp-project-control-center/PCC_Role_And_Stage_Lens_Model.md
```

If formatting fails, run Prettier only on those files.
