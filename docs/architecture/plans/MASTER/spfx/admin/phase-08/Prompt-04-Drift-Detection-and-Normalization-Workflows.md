# Prompt-04 — Drift Detection and Normalization Workflows

## Objective

Implement the backend workflow that collects SharePoint posture for in-scope assets, compares it to the resolved standards snapshot, and produces normalized drift output suitable for operator review and later preview / repair execution.

## Important execution rules

- Reuse existing backend/control-plane patterns.
- Keep long-running or privileged activity in backend execution paths only.
- Stay strictly inside the managed-asset boundary defined in the Phase 8 baseline.
- Prefer adapter-based collection and normalization.

## Inputs

Use:
- the Phase 8 baseline
- the standards snapshot / comparison model
- existing SharePoint service adapters
- existing run / audit / orchestration foundations

## Scope of work

Implement the smallest correct workflow for:
- selecting an in-scope SharePoint asset target,
- collecting actual posture,
- resolving the applicable standards snapshot,
- running comparison,
- and persisting / returning normalized drift output.

## Required output behavior

At minimum the workflow must support:
- asset-level scoping
- normalized drift categories
- severity / risk signaling
- explainable difference summaries
- evidence references for operator review
- compatibility with preview / dry-run and repair steps that follow

## Documentation output

Create or update:
- `docs/architecture/plans/MASTER/spfx/admin/phase-8/admin-spfx-phase-8-drift-detection-workflow.md`

Include:
1. workflow steps
2. adapter responsibilities
3. run / evidence behavior
4. failure handling expectations
5. current limitations

## Validation

Run the smallest targeted set needed to validate:
- collection,
- comparison,
- normalized output shape,
- and persistence / retrieval compatibility.

## Completion condition

Stop after the drift workflow and supporting docs are complete.
Do not implement repair execution in this prompt.
