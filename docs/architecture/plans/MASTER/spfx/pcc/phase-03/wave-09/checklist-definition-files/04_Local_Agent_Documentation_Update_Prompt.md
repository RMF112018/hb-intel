# Local Agent Prompt - Update PCC Wave 9 Documentation With Exact PDF Items

## Objective

Update the `hb-intel` PCC Phase 3 / Wave 9 planning and blueprint documentation so Wave 9 is no longer defined as only a Job Startup Checklist. It must be defined as a broader **Project Lifecycle Readiness Center** seeded from the exact items in the startup, safety, and closeout PDFs.

## Repository

```text
/Users/bobbyfetting/hb-intel
```

## Do Not Re-Read Current Context

Do not re-read files that are still within your current context or memory. Read only the files needed to verify current repo truth, PDF source placement, and target docs before editing.

## Required Source Files

Verify these repo-resident PDFs exist and inspect them directly if local extraction is needed:

```text
docs/reference/example/Project_Startup_Checklist.pdf
docs/reference/example/Project_Safety_Checklist.pdf
docs/reference/example/Project_Closeout_Checklist.pdf
```

Use this package's machine-readable extraction as the update seed:

```text
02_Default_Item_Library.csv
03_Default_Item_Library.json
```

## Required Documentation Updates

Update the appropriate PCC planning/blueprint/roadmap docs to reflect:

1. Wave 8 remains Project Readiness Module Framework.
2. Wave 9 becomes Project Lifecycle Readiness Center.
3. The module incorporates all three checklist families:
   - startup (55 items)
   - safety (32 items)
   - closeout (70 items)
4. The module must preserve PDF source traceability.
5. The module must avoid:
   - one giant checklist table;
   - three static tabs;
   - PDF replacement UX;
   - Procore clone behavior;
   - live external-system runtime unless explicitly approved later.
6. The module should use role-based queues, readiness scoring, evidence states, approval/checkpoint hooks, Priority Actions integration, and HB Document Control Center evidence links.

## Files to Inspect Before Editing

```text
docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
packages/models/src/pcc/PccMvpSurfaces.ts
packages/models/src/pcc/PccReadModels.ts
apps/project-control-center/README.md
```

## Files That May Be Modified

Prefer documentation-only updates first. Allowed paths:

```text
docs/architecture/blueprint/sp-project-control-center/**
apps/project-control-center/README.md
```

Only update `packages/models/**` if the prompt is explicitly expanded to implementation. This package is primarily documentation update guidance.

## Forbidden Changes

Do not:

- overwrite unrelated working-tree changes;
- edit `docs/architecture/plans/**` unless explicitly authorized and compatible with repo governance;
- introduce package dependencies;
- change `pnpm-lock.yaml`;
- run `pnpm install`, `pnpm add`, or equivalent;
- package or deploy SPFx;
- mutate tenant or external systems;
- introduce secrets or app settings;
- perform live Graph, Procore, Adobe, Document Crunch, or safety-platform operations;
- implement write routes;
- change permission execution.

## Validation Commands

Use targeted validation. At minimum:

```bash
git status --short
md5 pnpm-lock.yaml
pnpm exec prettier --check docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
git diff --check
md5 pnpm-lock.yaml
```

If code/model files are changed, also run the relevant package checks:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
```

## Commit Summary

```text
docs(pcc): define wave 9 lifecycle readiness center
```

## Commit Description

```text
Updates PCC Phase 3 Wave 9 planning from a narrow Job Startup Checklist into the Project Lifecycle Readiness Center.

Documents the startup, safety, and closeout checklist families as the default item seed library, preserves PDF source traceability, and defines the module as a lifecycle readiness, evidence, accountability, blocker, and action workflow built on the Wave 8 Project Readiness framework.

No runtime implementation, backend write routes, tenant mutation, Procore runtime, Graph/PnP live operations, dependency changes, package/deployment changes, or lockfile changes are introduced.
```
