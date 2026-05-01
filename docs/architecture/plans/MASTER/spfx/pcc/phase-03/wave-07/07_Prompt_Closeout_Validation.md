# 07 — Prompt: Wave 7 Closeout and Validation

## Role

You are a local code agent working in:

```text
/Users/bobbyfetting/hb-intel
```

You are closing implementation for **Project Control Center Phase 3 / Wave 7 — HB Document Control Center**.

## Objective

Create/update Wave 7 implementation closeout documentation and run final targeted validation.

This is a closeout/validation prompt. It should not add new feature behavior unless a trivial documentation/test correction is required to accurately close the wave.

## Preconditions

Complete before starting:

1. `03A_Prompt_SPFX_Document_Control_Read_Model_Parity.md`
2. `03B_Prompt_SPFX_Three_Lane_UI.md`
3. `04_Prompt_Permission_Action_Rendering.md`
4. `05_Prompt_Source_Degraded_States.md`
5. `06_Prompt_Reviews_Approvals_Summary.md`

## Mandatory Preflight

```bash
cd /Users/bobbyfetting/hb-intel
git status --short
git branch --show-current
git log --oneline -10
md5 pnpm-lock.yaml
```

Protect unrelated working-tree changes.

Do not re-read files that are still within current context or memory.

## Files to Inspect

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-7/
apps/project-control-center/README.md
apps/project-control-center/src/surfaces/documents/**
apps/project-control-center/src/tests/PccDocumentsSurface.test.tsx
apps/project-control-center/src/api/pccFixtureReadModelClient.ts
apps/project-control-center/src/api/pccFixtureReadModelClient.test.ts
packages/models/src/pcc/DocumentControl.ts
packages/models/src/pcc/PccReadModels.ts
backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts
```

## Files You May Modify

Preferred closeout docs:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-7/Wave_7_Closeout.md
apps/project-control-center/README.md
```

Only modify source/test files if validation reveals a narrow defect caused by Wave 7 implementation.

Do not modify:

```text
docs/architecture/plans/**
```

unless explicitly authorized by the user and repo governance.

## Required Closeout Content

Create or update:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-7/Wave_7_Closeout.md
```

Include:

1. Summary
2. Files changed
3. Implementation slices completed
4. Read-model parity summary
5. Three-lane UI summary
6. Permission/action guardrail summary
7. Source/degraded-state summary
8. Reviews & Approvals summary
9. Validation results
10. Explicit exclusions
11. Remaining risks/open items
12. Recommended next wave/prompt

## Required Explicit Exclusions

The closeout must explicitly state that Wave 7 did **not** introduce:

- live Microsoft Graph file operations;
- direct broad SPFx Graph execution;
- PnP/SharePoint REST runtime;
- OneDrive folder creation runtime;
- upload/download/copy-link runtime;
- Procore writeback;
- Adobe Sign agreement execution;
- Document Crunch runtime writeback;
- external sync/mirror;
- tenant mutation;
- permission mutation;
- SPFx package/deployment changes;
- package dependency changes;
- `pnpm-lock.yaml` changes;
- secrets/app settings changes.

## Required Validation Commands

Run targeted validation first:

```bash
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center build
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/functions check-types
git diff --check
md5 pnpm-lock.yaml
```

If a command is inappropriate due to repo truth, run the nearest equivalent and document the reason.

Do not run:

```bash
pnpm install
pnpm add
pnpm update
```

## Required Final Working Tree Review

Run:

```bash
git status --short
git diff --stat
```

Confirm:

- only intended files are modified;
- unrelated pre-existing changes remain untouched;
- no lockfile change unless the user explicitly authorized it.

## Commit Format

Suggested commit summary:

```text
docs(pcc): close phase 3 wave 7 document control implementation
```

Suggested commit description:

```text
Closes Phase 3 Wave 7 for HB Document Control Center, documenting SPFx fixture/read-model parity, three-lane UI rendering, permission/action guardrails, source/degraded-state handling, Reviews & Approvals summary behavior, validation results, and remaining deferred live-integration work.

No live Graph/PnP/SharePoint REST file operations, OneDrive folder creation runtime, external system writeback/sync/mirror, tenant mutation, permission mutation, package/dependency changes, lockfile changes, SPFx packaging, deployment changes, secrets, or app settings are introduced.
```

## Closeout Response Requirements

In your final response, include:

- commit hash if committed;
- files changed;
- tests run and results;
- lockfile checksum before/after;
- explicit exclusions;
- remaining risks/open items;
- recommended next prompt or wave.
