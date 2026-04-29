# PCC Phase 3 Wave 1 Prompt Package

## Purpose

This package provides a complete prompt sequence for **Phase 3 Wave 1 — PCC Shared Foundations**.

It is designed for a local coding agent or future ChatGPT session to execute Wave 1 safely after re-checking repo truth and confirming implementation authorization.

This package does **not** implement Wave 1 code.

## Wave 1 Objective

Wave 1 establishes the shared foundations used by later Project Control Center phases and modules:

- shared TypeScript model contracts;
- role and persona definitions;
- work center registries;
- workflow status registries;
- workflow item types;
- business audit event types;
- approval checkpoint types;
- external system identifiers;
- Document Control Center source types;
- Site Health summary types;
- safe deterministic fixtures;
- feature/module enablement flags;
- no-mutation guardrails and tests where repo-supported.

Wave 1 must not build the PCC shell, backend APIs, tenant execution behavior, live workflow modules, or any production rollout path.

## Repo Audit Basis

The prompt package was generated from a repo-truth audit of `RMF112018/hb-intel` on `main`.

Audited sources included:

```text
package.json
pnpm-workspace.yaml
turbo.json
tsconfig.base.json
docs/architecture/blueprint/sp-project-control-center/README.md
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md
packages/project-site-template/**
packages/project-site-provisioning/**
packages/models/**
backend/functions/**
docs/reference/ui-kit/doctrine/**
docs/reference/spfx-surfaces/**
docs/reference/sharepoint/**
```

## Important Repo Mismatch

The requested exact Phase 3 planning directory was not found on `main` during package generation:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/
```

Prompt 01 requires the executing agent to re-check this before code work.

If those Phase 3 files exist on a branch, in a pending PR, or in a local working tree, the agent must inspect them and update the scope lock before Prompt 02.

## Dependency on Wave 0 / Implementation Gate

Prompt 01 is mandatory.

No code work may proceed until Prompt 01 confirms:

- Wave 1 code authorization;
- exact package/file location;
- whether `packages/models/src/pcc/` is approved;
- whether new package creation is forbidden or allowed;
- validation commands;
- that no Wave 2+ shell/backend/module work will start;
- how to handle the missing exact Phase 3 planning files.

If Prompt 01 cannot confirm these points, Prompt 02–07 must remain documentation-only.

## Recommended Implementation Location

Interim recommendation:

```text
packages/models/src/pcc/
```

Rationale:

- `@hbc/models` is the repo's canonical shared TypeScript model package.
- `backend/functions` already consumes `@hbc/models`.
- `@hbc/project-site-template` must remain schema/contract/validation-only.
- `@hbc/project-site-provisioning` must remain mapper/proof/no-mutation-only.
- App-local types would fragment the PCC model across future modules.

## Prompt Sequence

| Prompt | Purpose |
|---|---|
| Prompt 01 | Re-audit repo truth and lock Wave 1 scope. No code implementation. |
| Prompt 02 | Add/scaffold shared PCC model contracts. |
| Prompt 03 | Add role, work center, status, module, and capability registries. |
| Prompt 04 | Add workflow, audit, approval, comment, and assignment types. |
| Prompt 05 | Add external system, Document Control source, Site Health, and repair request types. |
| Prompt 06 | Add safe fixtures, feature/module flags, and no-mutation guards/tests if approved. |
| Prompt 07 | Finalize exports, tests, docs, and Wave 1 closeout. |

## Strict Guardrails

Do not implement or modify:

- PCC shell UI.
- Project Home UI.
- backend routes or APIs.
- provisioning executor.
- tenant mutation.
- Graph/PnP live calls.
- Procore runtime.
- direct SPFx-to-Procore paths.
- automated access execution.
- automated Site Health repair.
- production rollout.
- app catalog deployment.
- CI/CD deployment workflows.
- package or SPFx manifest version bumps unless a later prompt explicitly authorizes them.

Preserve:

- `@hbc/project-site-template` as schema/contract/validation-only.
- `@hbc/project-site-provisioning` as planner/mapper/proof/no-mutation-only.
- Procore launch-link/deferred posture.
- no Procore secrets.
- no Procore mirror.
- no Procore write-back.
- backend-only integration boundary for future Procore calls.

## Validation Expectations

Minimum validation pattern after code-authorized model work:

```bash
git status --short
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/models build
```

When appropriate:

```bash
pnpm --filter @hbc/models lint
pnpm --filter @hbc/project-site-template validate:all
pnpm --filter @hbc/project-site-provisioning check-types
pnpm --filter @hbc/project-site-provisioning test
```

Do not run broad deployment, app catalog, tenant, Graph, PnP, or production commands for Wave 1.

## Expected Final Wave 1 State

After all prompts execute successfully, the repo should have:

- a single shared PCC foundation model surface;
- deterministic, non-secret PCC fixtures;
- shared registries for roles, personas, work centers, workflow modules, statuses, priority categories, external systems, and Site Health;
- tests proving no-mutation/no-secret/no-Procore-runtime guardrails where supported;
- package exports available to later SPFx and backend waves;
- documentation confirming no shell/backend/API/module implementation occurred.

## Package Files

```text
README.md
00_Repo_Truth_Audit_Summary.md
Prompt_01_Wave_1_Repo_Truth_Audit_and_Scope_Lock.md
Prompt_02_Wave_1_Shared_Model_Contracts.md
Prompt_03_Wave_1_Role_WorkCenter_Status_Registries.md
Prompt_04_Wave_1_Workflow_Audit_Approval_Types.md
Prompt_05_Wave_1_External_System_and_Site_Health_Types.md
Prompt_06_Wave_1_Fixtures_Feature_Flags_and_NoMutation_Guards.md
Prompt_07_Wave_1_Exports_Tests_and_Documentation_Closeout.md
Wave_1_Open_Decision_Register.md
Wave_1_Validation_Matrix.md
```
