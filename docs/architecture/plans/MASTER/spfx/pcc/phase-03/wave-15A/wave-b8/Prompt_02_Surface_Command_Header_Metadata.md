# Prompt 02 — Surface Command Header Metadata

## Mandatory Efficiency Directive

```text
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
```

## Shared Guardrails

- Work from current repo truth.
- Preserve SharePoint host-fit.
- Preserve read-only / preview / no-writeback posture.
- Preserve the distinction between PCC surfaces and work centers/modules.
- Preserve bento direct-child invariants.
- Preserve tab / tabpanel accessibility.
- Do not implement full Modules launcher behavior.
- Do not implement command routing.
- Do not introduce active module state.
- Do not remove duplicate/header cards in Phase 03.
- Do not change `pnpm-lock.yaml`, package dependencies, or SPFx package-solution files unless a prompt explicitly proves it is unavoidable and the user approves.
- Use `apps/project-control-center/config/package-solution.json` for package-solution references.

---

## Role

You are implementing the deterministic metadata layer for Phase 03.

## Objective

Implement the target metadata matrix defined in Prompt 01 so the command header has complete, deterministic, surface-specific metadata for every current MVP surface.

## Preconditions

Do not proceed unless Prompt 01 confirmed:

- current `main` was re-checked;
- Phase 2 shell ownership still exists;
- the metadata source of truth is confirmed;
- exact target metadata was defined;
- duplicate-card removal remains Phase 04;
- package-solution path correction is understood.

## Likely Files to Edit

```text
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/preview/projectShellViewModel.ts
apps/project-control-center/src/shell/surfaceHeroCopy.ts
apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx
```

Edit additional files only if current repo truth requires it and explain why.

## Implementation Requirements

### Metadata Model

Maintain or refine a typed metadata model with:

```text
surfaceSummaryItems
surfaceCues
readOnlyCue
```

If the current model must be extended for a compact visual/trend seam, keep the extension:

- typed;
- deterministic;
- exhaustive over `PccMvpSurfaceId`;
- fixture-safe;
- non-commanding;
- tested.

### Exhaustiveness

Every current `PccMvpSurfaceId` must have metadata:

```text
project-home
team-and-access
documents
project-readiness
approvals
external-systems
control-center-settings
site-health
```

### Authority Language

Metadata must clearly preserve:

- no decisions;
- no approvals;
- no writeback;
- no repair execution;
- no setting changes;
- no file moves/uploads/deletes;
- no external sync;
- user/governed workflow remains responsible.

### Static vs Fixture-Derived Values

Use static deterministic copy by default.

Use fixture-derived values only if:

- already present in repo fixtures/helpers;
- no new fetch/runtime dependency is introduced;
- no tenant/live count is implied;
- tests can assert the value deterministically.

## Surface-Specific Minimum Content

### Project Home

Must include:

- command-preview/command-summary posture;
- source preview/read-model posture;
- HBI advisory/no decisions/no writeback cue;
- high-priority actions / setup gaps only if safely deterministic;
- compact future trend/health summary seam if model supports it.

### Team & Access

Must include:

- access posture;
- permission/request context;
- governed access-change boundary.

### Documents

Must include:

- document control source posture;
- SharePoint / OneDrive / external references;
- no file operation/writeback cue.

### Project Readiness

Must include:

- readiness posture;
- blocker/evidence/source context;
- no checklist completion from header.

### Approvals

Must include:

- approval/checkpoint posture;
- pending/escalated context where deterministic;
- no approval/rejection/decision authority.

### External Systems

Must include:

- external platform configuration/source posture;
- launch-only/no sync/no writeback cue.

### Control Center Settings

Must include:

- setup/configuration posture;
- missing/inherited/override/governance context where deterministic;
- no setting changes from header.

### Site Health

Must include:

- health/drift/repair posture;
- last-check/source context where deterministic;
- no repair acknowledgement/execution from header.

## Tests Required

Add/update tests proving:

- metadata covers all current `PccMvpSurfaceId` values;
- each surface has non-empty summary items, cues, and read-only cue;
- summary IDs are stable and unique per surface;
- cue IDs are stable and unique per surface;
- tones are valid;
- authority language does not imply writeback or autonomous decision-making;
- metadata source remains deterministic and fixture-safe.

## Prohibited

- Do not remove duplicate/header cards.
- Do not implement command routing.
- Do not implement module launcher.
- Do not add active module state.
- Do not introduce live fetches.
- Do not change layout primitives.
- Do not change packages, lockfile, or SPFx package-solution.

## Required Validation

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

## Required Completion Response

```markdown
## Prompt 02 Complete

## Files Changed

## Metadata Model Changes

## Implemented Surface Metadata Matrix

## Static vs Fixture-Derived Values

## Authority / Read-Only Boundary Audit

## Tests Added or Updated

## Validation Results

## Package / Lockfile / Manifest Audit

## Follow-Up Notes for Prompt 03
```
