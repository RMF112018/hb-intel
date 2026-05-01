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

# Prompt 02 — Shared Readiness Framework Model/Read-Model Contracts and Deterministic Fixtures

## Role

You are a TypeScript model-contract implementer working in:

```text
/Users/bobbyfetting/hb-intel
```

## Objective

Add Wave 8 shared Project Readiness Module Framework contracts and deterministic fixtures under `@hbc/models/pcc`, after verifying Prompt 01 authorization exists.

Do not implement backend routes or SPFx UI in this prompt.

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

## Required authorization check

Confirm Prompt 01 documentation exists and authorizes source implementation:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/Wave_8_Implementation_Authorization.md
```

If it does not exist or does not authorize bounded implementation, stop and report the blocker.

## Files to inspect

```text
packages/models/src/pcc/PccReadModels.ts
packages/models/src/pcc/index.ts
packages/models/src/pcc/PccMvpSurfaces.ts
packages/models/src/pcc/PccUserRoles.ts
packages/models/src/pcc/PccCapabilities.ts
packages/models/src/pcc/WorkflowModules.ts
packages/models/src/pcc/WorkflowItems.ts
packages/models/src/pcc/fixtures/index.ts
packages/models/src/pcc/fixtures/*.ts
packages/models/src/pcc/*.test.ts
packages/models/package.json
```

## Files you may modify/create

Expected:

```text
packages/models/src/pcc/ProjectReadinessFramework.ts
packages/models/src/pcc/ProjectReadinessFramework.test.ts
packages/models/src/pcc/fixtures/projectReadiness.ts
packages/models/src/pcc/fixtures/index.ts
packages/models/src/pcc/PccReadModels.ts
packages/models/src/pcc/index.ts
packages/models/src/pcc/PccMvpSurfaces.ts
```

Only modify `PccMvpSurfaces.ts` if needed to update the `project-readiness` description away from checklist/RACI implementation language and toward framework/shell language.

Do not modify:

```text
backend/**
apps/**
docs/architecture/plans/**
pnpm-lock.yaml
package.json
```

## Required model content

Add a pure TypeScript model file with no runtime side effects, service clients, URLs, secrets, Graph/PnP/SPFx/Azure imports, or backend imports.

Minimum constants/types:

```text
PROJECT_READINESS_DOMAINS
PROJECT_READINESS_LIFECYCLE_GATES
PROJECT_READINESS_SOURCE_MODULES
PROJECT_READINESS_STATUSES
PROJECT_READINESS_POSTURES
PROJECT_READINESS_BLOCKER_STATES
PROJECT_READINESS_SEVERITIES
PROJECT_READINESS_CONFIDENCE_STATES
PROJECT_READINESS_EVIDENCE_STATES
```

Minimum interfaces:

```text
IProjectReadinessSourceLineage
IProjectReadinessEvidenceRequirement
IProjectReadinessItem
IProjectReadinessDomainSummary
IProjectReadinessGateSummary
IProjectReadinessOwnershipSummary
IProjectReadinessEvidenceSummary
IProjectReadinessBlockerSummary
IProjectReadinessSourceHealthSummary
IProjectReadinessFrameworkSnapshot
PccProjectReadinessFrameworkReadModel
```

Update `PccReadModels.ts` to include:

```text
PccProjectReadinessFrameworkReadModel
'project-readiness': PccReadModelEnvelope<PccProjectReadinessFrameworkReadModel>
```

Use `project-readiness` as the response-map key unless repo truth from Prompt 01 chose another name.

## Required fixture content

Create deterministic fixture(s) showing framework variety without copying Wave 9 checklist libraries:

- 6–10 sample readiness framework items maximum;
- at least 5 domains represented;
- at least 4 lifecycle gates represented;
- at least one blocked item;
- at least one needs-evidence item;
- at least one at-risk source-health/degraded-state item;
- at least one downstream-module-linked sample item for Wave 9;
- at least one evidence/reference-only sample tied to HB Document Control Center;
- at least one owner/accountability example using existing `PccPersona` values;
- all data deterministic, no real URLs/secrets/tenant IDs.

## Required tests

Add tests proving:

- constants are non-empty and stable;
- readiness items use valid domain/gate/status/posture/severity/confidence/evidence states;
- fixture summaries reference existing items/domains/gates;
- no duplicate fixture item IDs;
- read-model response map includes `project-readiness`;
- no forbidden runtime strings/imports are introduced in the new model/fixture files.

## Validation commands

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/models build
git diff --check
md5 pnpm-lock.yaml
git status --short
git diff --stat
```

Run lint if touched files fall under existing lint coverage and it is practical:

```bash
pnpm --filter @hbc/models lint
```

## Staging

Explicit path staging only. Do not use `git add .`.

## Commit summary

```text
feat(models-pcc): add project readiness framework contracts
```

## Commit body

```text
Adds Phase 3 Wave 8 Project Readiness Module Framework contracts, deterministic fixtures, read-model map coverage, and model tests.

Introduces readiness domains, lifecycle gates, source-module lineage, item posture, blockers, evidence status, ownership summaries, source-health summaries, and a project-readiness read-model envelope key for downstream backend/SPFx consumption.

No backend routes, SPFx runtime behavior, checklist-library implementation, scoring engine, workflow execution, Graph/PnP/SharePoint REST runtime, Procore runtime, tenant mutation, package/dependency changes, lockfile changes, deployment, secrets, or app settings are introduced.
```

## Closeout response

Include:

- files changed;
- validation results;
- lockfile md5 before/after;
- explicit exclusions;
- model/read-model keys added;
- remaining risks;
- recommended next prompt: Prompt 03.

---
