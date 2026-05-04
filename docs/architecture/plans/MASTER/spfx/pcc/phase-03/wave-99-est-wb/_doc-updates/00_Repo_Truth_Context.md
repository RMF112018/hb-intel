# Repo Truth Context — Estimating Workbench

## Required First Step

Start every local execution with read-only repo truth:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

## Fallback Context From Prior Evaluation

Local shell access was unavailable during package creation. GitHub fallback confirmed:

- Repository: `RMF112018/hb-intel`
- Default branch: `main`
- Inspected remote HEAD: `8d53bd67b9074bf6efdcf9d29041cb5f1dfb0cde`
- Latest inspected commit message reported `pnpm-lock.yaml` MD5 unchanged at `c56df7b79986896624536aab74d609f4`.
- Root `package.json` uses `pnpm@10.13.1`, Node `>=20`, Turbo, TypeScript, Vitest, Playwright, Prettier, `tsx`, and `@pnp/queryable`.
- `apps/project-control-center/package.json` uses React `^18.3.1`, `@hbc/models`, `@hbc/ui-kit`, Vite, Vitest, and Testing Library.

## Required Repo Paths To Inspect

- `docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md`
- `docs/architecture/blueprint/sp-project-control-center/Unified_PCC_Lifecycle_Objective_Architecture.md`
- `docs/architecture/blueprint/sp-project-control-center/System_of_Record_Matrix.md`
- `docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md`
- `packages/models/src/pcc/WorkflowModules.ts`
- `packages/models/src/pcc/PccModuleFlags.ts`
- `packages/models/src/pcc/PccMvpSurfaces.ts`
- `packages/models/src/pcc/PccWorkCenters.ts`
- `apps/project-control-center/package.json`
- `package.json`
- `docs/reference/example/est-workbooks/`

## Guardrail

Do not re-read files still in current context unless needed to verify stale, missing, or contradictory repo truth.
