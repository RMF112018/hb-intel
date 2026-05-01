# Prompt 04 — Cross-Document Consistency, Validation, and Closeout

## Role

You are a senior repo closeout and consistency-validation agent working in:

```text
/Users/bobbyfetting/hb-intel
```

## Critical instruction

Do not re-read files that are still within your current context or memory. Use prior prompt context and inspect only files required to validate the final diff.

## Objective

Validate and finalize the Wave 8 documentation/persona correction pass.

This prompt should reconcile cross-document language, run targeted checks, and prepare a clean commit summary/description.

## Required consistency checks

Search the touched PCC docs and relevant model files for contradictions:

```bash
rg -n "Wave 8|Project Readiness|Project Readiness Center|Project Readiness Module Framework|Job Startup|Startup Checklist|Permit Log|Responsibility Matrix|Constraints Log|Buyout Log|Approvals|Checkpoints" docs/architecture/blueprint/sp-project-control-center packages/models/src/pcc
```

Verify:

1. Wave 8 is consistently a reusable framework.
2. User-facing name is consistently **Project Readiness Center** where a surface/module name is needed.
3. Technical wave name remains **Project Readiness Module Framework**.
4. Wave 9 remains the downstream Job Startup Checklist / Lifecycle Checklist module.
5. Wave 10 remains Permit Log.
6. Wave 11 remains Responsibility Matrix / RACI.
7. Wave 12 remains Constraints Log.
8. Wave 13 remains Buyout Log.
9. Wave 14 remains Approvals / Checkpoints.
10. Priority Actions is not duplicated by Wave 8.
11. HB Document Control Center remains evidence/document source posture, not replaced by Wave 8.
12. Site Health remains health/drift posture, not replaced by Wave 8.
13. Team & Access remains access workflow, not replaced by Wave 8.
14. Persona additions are documented and tested.
15. No runtime integrations, tenant changes, external mutations, package changes, lockfile changes, or deployment changes were introduced.

## Files expected to be touched

Expected documentation files, subject to actual repo truth:

```text
docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/Wave_8_Project_Readiness_Framework_Scope_Lock.md
packages/models/src/pcc/PccUserRoles.ts
packages/models/src/pcc/PccUserRoles.test.ts
```

If fewer files are touched, explain why. If more files are touched, justify each one.

## Validation commands

Run targeted validation first:

```bash
pnpm --filter @hbc/models test -- PccUserRoles
pnpm --filter @hbc/models check-types
git diff --check
```

Then run targeted markdown formatting check on touched markdown docs only:

```bash
pnpm exec prettier --check <touched markdown files>
```

Then confirm lockfile:

```bash
md5 pnpm-lock.yaml
git status --short
```

Do not run broad install/update commands.

If targeted model tests cannot be filtered exactly as shown, use the repo-correct equivalent and record the exact command.

## Closeout file

Create or update:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/Wave_8_Documentation_And_Persona_Alignment_Closeout.md
```

Include:

- files changed;
- objective completed;
- repo-truth constraints confirmed;
- docs updated;
- persona additions/label changes;
- tests/checks run with results;
- lockfile checksum before/after if available;
- explicit exclusions;
- remaining risks/open decisions;
- recommended next prompt for Wave 8 runtime implementation.

## Explicit exclusions to record

Confirm these did not happen:

- no `docs/architecture/plans/**` edits;
- no readiness runtime implementation;
- no backend route creation;
- no SPFx runtime/data-seam implementation;
- no tenant mutation;
- no Graph/PnP/SharePoint/Procore/Adobe/Document Crunch/Sage runtime calls;
- no deployment/package/SPFx catalog work;
- no dependency changes;
- no `pnpm-lock.yaml` change;
- no mutation to `ProjectRole` unless separately justified.

## Commit

If validation is clean and working tree contains only intended changes, commit with:

```text
Commit summary

docs(pcc): define wave 8 readiness framework and personas

Commit description

Defines Phase 3 Wave 8 as the Project Readiness Module Framework with Project Readiness Center as the user-facing surface name. Aligns roadmap, blueprint, phase-specific docs, and Wave 8 scope-lock documentation around readiness domains, lifecycle gates, blocker-first posture, source-module signal mapping, evidence/audit posture, and guardrails for downstream workflow modules.

Extends the PCC persona vocabulary to cover the readiness role/action model, including estimating, preconstruction, project coordination, and scoped external/deferred personas while preserving existing ProjectRole compatibility. Adds targeted model validation and closes the documentation/persona alignment pass without runtime workflow implementation, backend routes, tenant mutation, external integrations, dependency changes, lockfile changes, or deployment work.
```

If validation is not clean, do not commit. Provide:
- exact failures;
- likely cause;
- proposed minimal fix;
- files involved.
