# Package Manifest — PCC Phase 3 Wave 17 Site Health

## Package Name

`pcc_phase17_site_health_comprehensive_documentation_update_package`

## Purpose

Generate canonical, implementation-ready documentation for PCC Phase 3 Wave 17 Site Health, resolving the architecture gaps identified during audit and converting them into executable local-agent prompts.

## Intended Repo Path

Recommended package staging path before execution:

`docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-17/_doc-updates/`

Canonical documentation output path created by the local agent:

`docs/architecture/blueprint/sp-project-control-center/phase-3/wave-17/`

## Content Inventory

| Folder | Purpose |
|---|---|
| `docs/` | Architecture, domain, storage, UX, security, validation, and implementation gap closure docs |
| `docs/wireframes/` | Screen-by-screen wireframes and interaction contracts |
| `artifacts/` | Deterministic JSON registries and execution contracts |
| `prompts/` | Staged local-agent prompts |
| `reference/` | Research, repo-truth facts, architecture delta, source summary, generation report |

## Intended Documentation Targets

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-17/README.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-17/Wave_17_Site_Health_Target_Architecture.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-17/Wave_17_Domain_Model_Health_Categories_Statuses_And_Drift.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-17/Wave_17_System_Of_Record_And_Health_Authority_Contract.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-17/Wave_17_Source_Module_Integration_Contract.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-17/Wave_17_Read_Model_Routes_Storage_And_Command_Gates.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-17/Wave_17_SPFX_UX_And_Wireframes.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-17/Wave_17_HBI_Security_Redaction_Audit_And_Guardrails.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-17/Wave_17_Test_And_Acceptance_Gates.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-17/Wave_17_Documentation_Closeout.md`
- `docs/reference/sharepoint/list-schemas/pcc/lists/site-health-*.md`
- `docs/reference/sharepoint/list-schemas/pcc/List-Map.md`

## Explicit Non-Goals

- No runtime implementation.
- No source code implementation.
- No SPFx SPPKG build or deployment.
- No backend write routes.
- No Microsoft Graph mutation.
- No SharePoint REST/PnP mutation.
- No Entra ID or group mutation.
- No SharePoint list/library schema mutation in tenant.
- No external-system writeback.
- No package, dependency, or lockfile changes.
- No production rollout.
- No legal, claim, entitlement, schedule-delay, compensability, or accounting determination.

## Validation Expectations

- Local repo-truth commands before edits.
- `git diff --check`
- `pnpm exec prettier --check <touched markdown/json files>`
- JSON parse validation for every generated artifact.
- Placeholder scan using `rg -n "TB[D]|TO[D]O|Open decisio[n]|PLACEHOLDE[R]" <wave-17-paths>`
- `git diff --name-only` and `git diff --cached --name-only`
- `md5 pnpm-lock.yaml` before and after documentation work.

## Package Limitations

This package uses remote repo truth from the connector plus user-provided context. It cannot replace local verification of branch, worktree, local HEAD, ignored files, lockfile hash, untracked files, or locally staged changes.
