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

# Prompt 06 — Ownership, Evidence, Blocker, Risk, Source-Health, and Priority Actions Preview Summaries

## Role

You are an SPFx UI hardening implementer and construction project-controls reviewer working in:

```text
/Users/bobbyfetting/hb-intel
```

## Objective

Harden the Project Readiness Center shell by improving ownership/accountability, evidence, blocker, risk, source-health, and Priority Actions preview summaries.

This prompt adds clarity and guardrail coverage. It must not implement executable actions.

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

## Files to inspect

```text
apps/project-control-center/src/surfaces/projectReadiness/
apps/project-control-center/src/surfaces/priorityActions/
apps/project-control-center/src/surfaces/documents/
apps/project-control-center/src/tests/PccProjectReadinessSurface.test.tsx
packages/models/src/pcc/ProjectReadinessFramework.ts
packages/models/src/pcc/fixtures/projectReadiness.ts
```

## Files you may modify

Expected:

```text
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.module.css
apps/project-control-center/src/surfaces/projectReadiness/projectReadinessViewModel.ts
apps/project-control-center/src/surfaces/projectReadiness/projectReadinessAdapter.ts
apps/project-control-center/src/surfaces/projectReadiness/projectReadinessAdapter.test.ts
apps/project-control-center/src/tests/PccProjectReadinessSurface.test.tsx
packages/models/src/pcc/fixtures/projectReadiness.ts
```

Modify model contracts only if a narrow missing display field is proven necessary; otherwise keep model changes out of this prompt.

Do not modify:

```text
backend/**
docs/architecture/plans/**
pnpm-lock.yaml
package.json
```

## Required enhancements

Add/refine UI sections or card content for:

1. **Ownership & Accountability**
   - owner persona;
   - accountable persona;
   - reviewer persona;
   - unassigned gaps;
   - escalation posture.

2. **Evidence Readiness**
   - evidence required/satisfied/missing/waived/reference-only;
   - source-of-record explanation tied to HB Document Control Center;
   - no upload controls.

3. **Blocker and Risk Register Preview**
   - critical blockers;
   - due/overdue posture;
   - dependency/source module;
   - risk tag labels;
   - no mutation.

4. **Priority Actions Preview**
   - explain which readiness items would be eligible for Priority Actions later;
   - do not create/modify actual priority actions;
   - chips must be inert/disabled.

5. **Source Health / Degraded State**
   - render available, degraded, source-unavailable, backend-unavailable, missing-config, unauthorized/forbidden if fixture/client can represent them;
   - product-safe copy.

6. **Future-Wave Handoff**
   - clear labels for Wave 9 Lifecycle Readiness, Wave 10 Permit Log, Wave 11 RACI, Wave 12 Constraints, Wave 13 Buyout, Wave 14 Approvals.

## Required tests

Prove:

- ownership/accountability summary renders;
- missing owner or unassigned fixture state is handled;
- evidence summary renders without upload controls;
- blocker/risk preview renders;
- Priority Actions preview is inert and does not mutate actions;
- degraded/source-health states render safely;
- downstream waves remain deferred/preview;
- no forbidden labels imply live workflow execution.

## Validation commands

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
git diff --check
md5 pnpm-lock.yaml
git status --short
git diff --stat
```

## Staging

Explicit path staging only. Do not use `git add .`.

## Commit summary

```text
test(spfx-pcc): harden project readiness framework summaries
```

## Commit body

```text
Hardens the Phase 3 Wave 8 Project Readiness Center with ownership, evidence, blocker, risk, source-health, degraded-state, and Priority Actions preview summaries.

Adds or updates tests proving read-only rendering, inert/disabled action posture, evidence-reference-only behavior, downstream Wave 9–14 boundaries, and no mutation/runtime behavior.

No checklist execution, approval execution, workflow writes, priority-action mutation, upload/download/sync, Graph/PnP/SharePoint REST runtime, Procore runtime, external-system writeback, backend default cutover, package/dependency change, lockfile change, SPFx packaging, deployment, secrets, or app settings are introduced.
```

## Closeout response

Include:

- files changed;
- validation results;
- lockfile md5 before/after;
- summaries hardened;
- explicit exclusions;
- remaining risks;
- recommended next prompt: Prompt 07.

---
