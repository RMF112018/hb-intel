# Prompt 05C — Project Readiness Lifecycle Context and Constraints Log Integration

## Objective

Verify, harden, and enhance Project Readiness integration so unified lifecycle context, related-record cues, and Constraints Log readiness posture appear as governed readiness inputs inside the existing Project Readiness surface.

Do not duplicate existing Constraints Log regions. Current repo truth already shows `PccProjectReadinessSurface.tsx` imports, builds, and renders `PccConstraintsLogRegions` in both fixture and read-model paths. This prompt should verify and enhance that integration, not blindly add it again.

## Repo Location

```text
/Users/bobbyfetting/hb-intel
```

## Required Baseline

Do not begin until Prompt 05B has completed.

Existing Project Readiness surface already includes:

- Project Readiness framework regions;
- Lifecycle Readiness regions;
- Permit & Inspection regions;
- Responsibility Matrix regions;
- Constraints Log regions.

This prompt should preserve those modules and add unified lifecycle context only where it improves readiness understanding.

## Required Pre-Edit Repo Truth

Run and report:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

Classify uncommitted files as user-owned, agent-owned, or unknown. Preserve unrelated/user-owned changes.

## Files to Inspect

Inspect current Project Readiness, Constraints Log, and unified lifecycle seams:

- `apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx`
- `apps/project-control-center/src/surfaces/projectReadiness/`
- `apps/project-control-center/src/surfaces/constraintsLog/`
- `apps/project-control-center/src/surfaces/unifiedLifecycle/`
- `apps/project-control-center/src/tests/`
- `apps/project-control-center/src/shell/PccSurfaceRouter.tsx`

Do not broadly edit Project Home in this prompt.

## Required Work

### 1. Verify Existing Constraints Log Integration

Confirm and harden tests proving:

- `PccConstraintsLogRegions` renders in the Project Readiness fixture path;
- `PccConstraintsLogRegions` renders in the read-model path when `readModelClient` is provided;
- Project Readiness client type includes Constraints Log client methods;
- the Constraints Log appears as a readiness source/input, not a disconnected risk workspace;
- no separate Constraints Log route/workspace is introduced unless already approved elsewhere.

If those tests already exist, add only missing focused assertions.

### 2. Add Unified Lifecycle Context to Project Readiness

Add compact lifecycle context into Project Readiness where it directly supports readiness interpretation.

Acceptable options:

- small lifecycle context card using `LifecycleTimelinePreview`;
- compact related-record cue using `RelatedRecordsPanel`;
- project memory reference cue using `ProjectMemoryPanel`;
- gate signal context tied to existing lifecycle readiness cards.

Do not add all seven unified lifecycle preview components unless the layout remains coherent and bounded.

### 3. Related-Record Cues

Where readiness items, constraints, lifecycle signals, or memory records have relationships, surface compact related-record cues.

Cues should show:

- source lineage;
- evidence/citation presence;
- traceability confidence where available;
- redaction/restriction posture.

Do not add live links to external systems. Use inert preview chips/cues only.

### 4. Maintain Readiness Surface Structure

Preserve:

- existing Project Readiness route;
- existing active surface marker;
- bento direct-child card structure;
- fixture fallback path;
- read-model-driven path;
- read-only/no-execution posture.

## Tests

Add/update tests proving:

- Project Readiness still renders all existing major regions;
- Constraints Log is visible as a readiness source/input;
- read-model path invokes/uses Constraints Log client seam;
- unified lifecycle context appears inside Project Readiness without creating a new route/workspace;
- related-record cues render source/evidence/citation/lineage where available;
- redacted/restricted records do not leak sensitive content;
- lens cues, if present, do not change shell/workspace route;
- existing Project Readiness loading/error fixture scaffold behavior still works;
- no external write actions are introduced.

Avoid broad snapshot churn.

## Constraints

Do not modify:

- Project Home.
- Shell/router navigation.
- backend.
- models.
- package files.
- lockfile.
- docs/blueprint/canonical plans.

Do not create:

- separate estimating/preconstruction/operations/warranty workspaces;
- new route IDs;
- live external calls;
- write behavior;
- broad styling overhaul.

## Validation

Run and report:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
md5 pnpm-lock.yaml
```

Run models check only if type failures require it:

```bash
pnpm --filter @hbc/models check-types
```

## Required Completion Summary

Return:

1. Pre-edit repo truth.
2. Workspace classification.
3. Project Readiness files changed.
4. Constraints Log integration proof.
5. Unified lifecycle/readiness context added.
6. Related-record cues added.
7. Tests added/updated.
8. Validation results.
9. Lockfile MD5 before/after.
10. Remaining gaps for Prompt 05D.
11. Commit hash if committed.
12. Confirm no push unless explicitly instructed.

## Commit Guidance

Commit only Prompt 05C-owned files. Do not push unless explicitly instructed.

Recommended commit message:

```text
feat(spfx-pcc): integrate lifecycle context into project readiness
```
