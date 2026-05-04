# Required Contracts, State, and Guardrails

## Required Model Families

- `PccProjectLifecycleEvent`
- `PccProjectStageTransitionCheckpoint`
- `PccLifecycleGateSignal`
- `PccProjectMemoryRecord`
- `PccProjectDecisionRecord`
- `PccProjectAssumptionRecord`
- `PccProjectStageLens`
- `PccProjectTraceabilityEdge`
- `PccObligationTraceRecord`
- `PccVendorProductTraceRecord`
- `PccWarrantyTraceRecord`
- `PccCrossProjectReference`
- `PccProjectKnowledgeReference`
- `UnifiedSearchGroundingCitation`
- `UnifiedSearchGroundedAnswer`
- `UnifiedSearchRefusal`
- `UnifiedSearchAskHbiResponse`

## Required Read Models

- Aggregate: `PccUnifiedLifecycleReadModel`
- Leaf: lifecycle timeline, project memory, project lenses, traceability, warranty trace, cross-project knowledge, unified search.

## Required Backend Route Families

- `/api/pcc/projects/{projectId}/unified-lifecycle`
- `/api/pcc/projects/{projectId}/project-memory`
- `/api/pcc/projects/{projectId}/project-lenses`
- `/api/pcc/projects/{projectId}/project-traceability`
- `/api/pcc/projects/{projectId}/warranty-trace`
- `/api/pcc/projects/{projectId}/cross-project-knowledge`
- `/api/pcc/projects/{projectId}/unified-search`

These are GET-only read-model route families, not shell routes.

## Forbidden Shell Routes

- `unified-lifecycle`
- `lifecycle-timeline`
- `project-memory-workspace`
- `traceability-graph`
- `closed-project-references`
- `warranty-trace-workspace`
- `cross-project-knowledge-workspace`
- `ask-hbi`
- `hbi-search`
- `unified-search-workspace`
- departmental workspace IDs such as estimating, preconstruction, operations, closeout, warranty, accounting, or executive workspaces.

## Required HBI Behavior

- Grounded answer requires citations.
- Refusal has no citations and must use canonical refusal reason.
- Permission-filtered missing evidence produces refusal or qualification, not fabricated answer.
- Warranty responsibility conclusion requires evidence threshold; otherwise no-blame / insufficient-evidence posture.

## Required Security Behavior

- Security classification is preserved.
- Redaction is read-time behavior.
- Withheld records do not render text.
- Cross-project references are summary-safe unless explicitly authorized.
- Privileged records are not summarized by HBI.
