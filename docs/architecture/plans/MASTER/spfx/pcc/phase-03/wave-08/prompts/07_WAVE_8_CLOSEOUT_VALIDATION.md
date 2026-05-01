<!--
PCC Phase 3 Wave 8 Prompt Bundle
Use this file as a standalone prompt for the local code agent.
Do not combine with later prompts until this prompt has been completed, validated, committed, and closed out.
-->

## Package-Level Operating Rules

- Work in `/Users/bobbyfetting/hb-intel`.
- Do not re-read files that are still within your current context or memory; only re-open files when you need fresh repo truth, exact line references, or to verify changes after editing.
- Protect unrelated working-tree changes. Record them, do not overwrite them, and do not stage them.
- Do not use `git add .` or broad staging.
- Use explicit path staging only.
- Run `git diff --check` before commit.
- Record `md5 pnpm-lock.yaml` before and after.
- Do not run `pnpm install`, `pnpm add`, or `pnpm update` unless explicitly authorized.
- Do not edit `docs/architecture/plans/**` unless this prompt explicitly authorizes it. Prefer current-state documentation under `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/`.
- Preserve Wave 8 as the Project Readiness Module Framework; do not implement Wave 9 checklist content, Wave 10 Permit Log, Wave 11 RACI, Wave 12 Constraints Log, Wave 13 Buyout Log, or Wave 14 Approvals runtime.
- Preserve no-mutation posture: no live Graph file operations, SharePoint list mutations, tenant mutations, permission mutations, Procore runtime/writeback, external-system writeback, approval/workflow execution, secrets/app settings, SPFx package/deployment, or production rollout.

---

# Prompt 07 — Wave 8 Closeout Documentation and Final Validation

## Role

You are a closeout/documentation and validation agent working in:

```text
/Users/bobbyfetting/hb-intel
```

## Objective

Create/update Wave 8 closeout documentation and perform final targeted validation for the Project Readiness Module Framework implementation.

This prompt should not add new behavior unless a narrow defect is found while closing the wave.

## Mandatory preflight

```bash
cd /Users/bobbyfetting/hb-intel
git status --short
git branch --show-current
git log --oneline -20
md5 pnpm-lock.yaml
```

Record unrelated changes and do not stage them.

Do not re-read files that are still within your current context or memory; only re-open files when you need fresh repo truth, exact line references, or to verify changes after editing.

## Preconditions

Verify Prompts 01–06 have landed or explicitly document which were skipped/deferred and why.

## Files to inspect

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/
apps/project-control-center/README.md
apps/project-control-center/src/surfaces/projectReadiness/
apps/project-control-center/src/api/
apps/project-control-center/src/tests/
packages/models/src/pcc/ProjectReadinessFramework.ts
packages/models/src/pcc/PccReadModels.ts
packages/models/src/pcc/fixtures/projectReadiness.ts
backend/functions/src/hosts/pcc-read-model/
```

## Files you may modify

Expected:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/Wave_8_Closeout.md
apps/project-control-center/README.md
```

Only modify source/test files if final validation reveals a narrow defect caused by Wave 8.

Do not modify:

```text
docs/architecture/plans/**
pnpm-lock.yaml
package.json
```

## Required closeout content

Create or update:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/Wave_8_Closeout.md
```

Include:

1. Summary
2. Research-informed design basis
3. Files changed by prompt
4. Implementation slices completed
5. Shared model/read-model summary
6. Backend mock-provider/route summary, if implemented
7. SPFx client/fixture parity summary
8. Project Readiness Center shell summary
9. Ownership/evidence/blocker/risk/source-health summary
10. Validation results
11. Lockfile/package confirmation
12. Explicit exclusions
13. Remaining risks/operator-pending items
14. Wave 9 handoff notes
15. Recommended next prompt/wave

## Required explicit exclusions

Closeout must explicitly state that Wave 8 did **not** introduce:

- Wave 9 checklist library implementation;
- Startup/Safety/Closeout checklist execution;
- RACI implementation;
- Permit Log implementation;
- Constraints Log implementation;
- Buyout Log implementation;
- approval/workflow execution;
- scoring engine runtime;
- live Microsoft Graph file operations;
- PnP/SharePoint REST runtime;
- SharePoint list/library mutations;
- OneDrive folder creation runtime;
- Procore writeback/sync/mirror;
- Sage runtime/writeback;
- Adobe Sign execution;
- Document Crunch runtime;
- external-system writeback;
- tenant mutation;
- permission mutation;
- Power Automate flow;
- SPFx package/deployment change;
- package dependency changes;
- `pnpm-lock.yaml` changes;
- secrets/app settings changes;
- production rollout.

## Final validation commands

Run:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
git diff --check
md5 pnpm-lock.yaml
git status --short
git diff --stat
```

Run lint where practical and document if skipped:

```bash
pnpm --filter @hbc/models lint
pnpm --filter @hbc/functions lint
pnpm --filter @hbc/spfx-project-control-center lint
```

## Staging

Explicit path staging only. Do not use `git add .`.

## Commit summary

```text
docs(pcc): close wave 8 readiness framework
```

## Commit body

```text
Closes Phase 3 Wave 8 for the Project Readiness Module Framework.

Documents the research-informed design basis, shared model/read-model contracts, deterministic fixtures, optional GET-only mock read-model route posture, SPFx fixture/client parity, Project Readiness Center shell, ownership/evidence/blocker/risk/source-health summaries, validation results, explicit no-runtime/no-mutation exclusions, and Wave 9 handoff.

No Wave 9 checklist-library implementation, RACI implementation, Permit Log, Constraints Log, Buyout Log, approval/workflow execution, scoring engine runtime, live Graph/PnP/SharePoint REST operation, Procore/Sage/Adobe/Document Crunch runtime, external-system writeback, tenant mutation, permission mutation, package/dependency change, lockfile change, SPFx packaging, deployment, secrets, app settings, or production rollout is introduced.
```

## Closeout response

Include:

- commit hash if committed;
- files changed;
- validation results;
- lockfile md5 before/after;
- explicit exclusions;
- remaining risks/operator-pending items;
- recommended next wave: Wave 9 Project Lifecycle Readiness Center.

---
