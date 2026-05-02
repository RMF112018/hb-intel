# 00 — Repo Truth Context

## Known Repo Truth From Prior Inspection

The package assumes the following repo-truth baseline, which the local agent must re-verify before making documentation changes:

- Phase 3 roadmap names Wave 13 as **Buyout Log**.
- Phase 3 implementation plan describes Wave 13 as an item-level buyout/project-controls workflow module.
- Workflow Module Register lists **Buyout Log** as MVP scope under Project Readiness, with checkpoint ties where appropriate.
- `packages/models/src/pcc/WorkflowModules.ts` already contains `buyout-log`.
- The current model registry maps `buyout-log` to `procurement-and-buyout`, while governing docs frame Wave 13 under Project Readiness. This must be resolved in documentation as an MVP-host/future-affinity distinction, not necessarily by changing source code.
- The canonical `System_of_Record_Matrix.md` governs Procore, Sage, PCC, SharePoint/Microsoft 365, evidence link, and source-lineage ownership.
- The repo-resident workbook path is expected to be:
  `docs/reference/example/financial/Buyout Log_Template 2025.xlsx`

## Required Local Re-Verification Commands

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

## Required Files to Inspect

```text
docs/architecture/blueprint/sp-project-control-center/System_of_Record_Matrix.md
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md
packages/models/src/pcc/WorkflowModules.ts
packages/models/src/pcc/PccWorkCenters.ts
docs/reference/example/financial/Buyout Log_Template 2025.xlsx
```

## Repo-Truth Resolution Required

Use this language unless repo truth has changed:

> Buyout Log is an MVP Project Readiness workflow module with Procurement / Project Controls classification and future Procurement & Buyout Center affinity.

This resolves the current Project Readiness versus `procurement-and-buyout` model-placement tension without forcing premature MVP promotion of the full Procurement & Buyout work center.
