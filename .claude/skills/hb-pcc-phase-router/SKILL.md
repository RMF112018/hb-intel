---
name: hb-pcc-phase-router
description: Route Project Control Center work through current PCC source-of-truth hierarchy, phase/wave guardrails, MVP scope, module decisions, shell-frame boundaries, provisioning posture, and validation gates.
when_to_use: Use when the task mentions PCC, Project Control Center, project site provisioning, PCC Phase 2 or Phase 3, Wave 1 or Wave 2, Project Home, Team & Access, Documents, Readiness, Approvals, External Systems, Site Health, or PCC modules.
argument-hint: "[PCC objective, phase, wave, or module]"
allowed-tools: Read, Grep, Glob, Bash(git status:*), Bash(git diff:*)
---

# HB PCC Phase Router

Route PCC work for:

```text
$ARGUMENTS
```

## Objective

Apply the current PCC source-of-truth chain, MVP scope, phase/wave guardrails, and validation posture before planning or implementing PCC work.

## Starting Source Chain

Inspect the current live files that exist in the repo. Expected PCC sources may include:

```text
docs/architecture/blueprint/sp-project-control-center/README.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md
docs/architecture/blueprint/sp-project-control-center/phase-2/Phase_2_Closeout.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-1/Wave_1_Closeout.md
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-02/
apps/project-control-center/
packages/models/
```

Also inspect the live PCC Claude rule file. If references disagree on this path, surface the mismatch:

```text
.claude/rules/pcc-phase-3.md
```

## Phase 3 Wave 2 Default Boundary

Unless a newer governing doc or user instruction explicitly supersedes it, treat Wave 2 as:

### Allowed

- `apps/project-control-center/` shell-frame work;
- fixture-driven preview UI;
- `@hbc/models/pcc` vocabulary;
- UI/layout components;
- tests and docs directly supporting the shell frame.

### Forbidden Unless Explicitly Authorized

- backend APIs;
- tenant mutation;
- live Graph/PnP;
- Procore runtime;
- Procore secrets;
- Procore mirror;
- Procore write-back;
- direct SPFx-to-Procore;
- access execution;
- approval execution;
- Site Health scanning/repair execution;
- app catalog deployment;
- CI/CD changes;
- package/manifest version bumps.

## Module Vocabulary Reminder

Use current repo truth first, but expect PCC module discussions to include:

- Project Home;
- Team & Access;
- Documents / Document Control Center;
- Project Readiness;
- Approvals / Checkpoints;
- External Systems;
- Control Center Settings;
- Site Health.

## Output Format

## PCC Routing Verdict

Use one:

- **Proceed Under Current Phase/Wave**
- **Needs Source-Truth Audit First**
- **Blocked by Guardrail**
- **Needs Human Decision**

## Governing Sources

- <files inspected>

## Allowed Scope

- <scope>

## Forbidden Scope

- <scope>

## Recommended Prompt / Plan

- <copy-ready next step>


## Standing Constraints

- Use current repo truth before historical summaries.
- Do not re-read files still in active context unless they may have changed, line-level proof is needed, validation/closeout requires proof, scope expanded, or the user asked for a repo-truth audit.
- Separate evidence from recommendation.
- State uncertainty explicitly.
- Do not broaden scope into adjacent cleanup unless the user explicitly authorizes it.
- Do not claim completion without stating what was actually inspected or verified.

