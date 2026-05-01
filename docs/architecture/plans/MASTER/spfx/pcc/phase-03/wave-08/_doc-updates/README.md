# PCC Phase 3 Wave 8 — Documentation + Persona Alignment Prompt Set

## Purpose

This package instructs a local code agent to implement the required documentation changes for **PCC Phase 3 / Wave 8 — Project Readiness Module Framework**, including a narrow update to the PCC persona set so Wave 8 role/action authority aligns with the business objective.

The goal is not to build the full Wave 8 runtime implementation. The goal is to make the repo’s documentation and shared persona vocabulary accurate, consistent, and implementation-ready before Wave 8 code work proceeds.

## Execution posture

- Work from `/Users/bobbyfetting/hb-intel`.
- Start with repo-truth verification.
- Do not overwrite unrelated working-tree changes.
- Do not re-read files that are still within your current context or memory.
- Do not edit `docs/architecture/plans/**` unless explicitly authorized and consistent with repo governance.
- Do not introduce dependencies.
- Do not run `pnpm install`, `pnpm add`, or equivalent.
- Do not change `pnpm-lock.yaml`.
- Do not package or deploy SPFx.
- Do not mutate tenant, SharePoint, Graph, Procore, Adobe, Document Crunch, Sage, or other external systems.
- Use targeted tests and checks first.
- Preserve compatibility for existing PCC consumers.

## Prompt sequence

1. `01_Repo_Truth_And_Scope_Lock.md`
2. `02_Wave_8_Documentation_Target_Definition.md`
3. `03_PCC_Persona_Set_Alignment.md`
4. `04_Cross_Document_Consistency_And_Validation.md`
5. `05_Fresh_Reviewer_Prompt.md`

Recommended execution:
- Run Prompts 01–04 locally in order.
- Commit after Prompt 04 only if validation is clean.
- Use Prompt 05 in a fresh reviewer session before merging/pushing if practical.

## Expected implementation boundaries

Allowed:
- Documentation updates under `docs/architecture/blueprint/sp-project-control-center/**`.
- Creation/update of a Wave 8 blueprint closeout/scope-lock document under `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/`.
- Narrow update to `packages/models/src/pcc/PccUserRoles.ts`.
- Targeted tests for PCC persona vocabulary if existing test structure supports it.
- Export/index updates only if the persona model update requires them.

Forbidden unless separately approved:
- Runtime implementation of readiness workflows.
- New backend routes.
- New SPFx runtime data seams.
- External integration execution.
- Permission execution.
- Package/dependency/lockfile changes.
- Deployment or tenant validation work.
