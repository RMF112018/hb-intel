# Objective and Current Phase 14 Context

## Objective

Update PCC governing documentation so **Approvals / Checkpoints** is no longer a planning concept. The update must define an implementable, testable, and PCC-aligned control layer for approval queues, checkpoint policies, route steps, decision actions, source lineage, audit events, Priority Actions, Project Readiness rollups, Wave 13G estimating checkpoints, and SPFx UX.

## Current Repo Truth to Verify

The executing agent must begin with:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

Expected but not assumed current state:

- `packages/models/src/pcc/PccMvpSurfaces.ts` includes the `approvals` surface.
- `apps/project-control-center/src/surfaces/approvals/PccApprovalsSurface.tsx` is preview/fixture-oriented.
- `packages/models/src/pcc/ApprovalCheckpoint.ts` contains a limited read-model vocabulary and explicitly excludes approval engine behavior.
- Phase 3 roadmap places Wave 14 as `Approvals / Checkpoints`.
- Workflow Module Register shows Wave 14 depends on Waves 6 and 8-13.
- Wave 13G may exist locally even if remote search does not surface it; local repo truth controls.

## Required Interpretation

Phase 14 is the PCC-native checkpoint orchestration layer. It aggregates prompts from source modules, validates decision authority, records decisions, updates queue/readiness/priority signals, and preserves source lineage.

It must not become:

- a separate departmental approval portal;
- a generic task list;
- an embedded Power Automate runtime;
- a Procore/Sage execution layer;
- a SharePoint item-level-permission engine;
- an HBI automated-decision surface.

## Why Phase 14 Exists

PCC modules already surface approval/checkpoint needs, including access requests, readiness gates, permit/inspection exceptions, responsibility exceptions, constraints, buyout handoffs, estimating freeze/handoff approvals, external-system mapping corrections, site-health repair requests, and executive escalations.

Without Phase 14:

- each module would invent its own approval semantics;
- source lineage would fragment;
- approval authority would be inconsistent;
- Priority Actions would duplicate or miss decision prompts;
- HBI could appear to have implied authority;
- audit history would be incomplete;
- readiness gates would lack enforceable decision context.

Phase 14 resolves these issues with one unified control layer.
