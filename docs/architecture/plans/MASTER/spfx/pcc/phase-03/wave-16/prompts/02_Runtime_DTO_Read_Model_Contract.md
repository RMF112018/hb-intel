# Prompt 02 — Runtime DTO and Read-Model Contract Gap Closure

## Objective

Add or update documentation/package reference artifacts so a developer has a complete Wave 16 runtime DTO/read-model contract before code implementation begins.


## Required Instruction Phrase

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

## Global Guardrails

- Work from `/Users/bobbyfetting/hb-intel`.
- Perform repo-truth verification before editing.
- Do not implement runtime feature code unless this prompt explicitly authorizes it.
- Do not edit `docs/architecture/plans/**` unless this prompt explicitly authorizes that documentation path.
- Do not run broad formatting across the repo.
- Do not mutate `package.json`, `pnpm-lock.yaml`, SPFx manifests, package-solution files, workflows, CI, deployment scripts, or tenant/provisioning settings unless explicitly authorized and justified.
- No backend write routes.
- No direct SPFx writes to SharePoint settings lists.
- No direct Graph, PnP, SharePoint REST, tenant, list, group, permission, Procore, Sage, Autodesk, Power Automate, or external-system runtime mutation.
- No raw secret values in SharePoint, fixtures, SPFx state, audit snapshots, logs, screenshots, test output, or HBI outputs.
- No HBI decision authority, approval authority, legal/claim/accounting/pricing/award authority, or automatic external execution.
- Stage only files authorized by this prompt.
- Capture validation evidence before proposing a commit.


## Allowed Files

Subject to Prompt 01 findings, likely documentation/package files only:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-16/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-16/closeout/
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-16/_implementation/   # only if this package path exists and is authorized
```

Do not edit runtime source in this prompt.

## Required Inputs

Use:

```text
reference/02_WAVE16_RUNTIME_DTO_CONTRACT_SKELETON.md
reference/01_MISSING_INFO_CANONICAL_CHECKLIST.md
```

Also inspect:

```text
packages/models/src/pcc/PccSettings.ts
packages/models/src/pcc/PccReadModels.ts
docs/reference/sharepoint/list-schemas/pcc/lists/control-center-setting-definitions.md
docs/reference/sharepoint/list-schemas/pcc/lists/control-center-setting-policy-rules.md
docs/reference/sharepoint/list-schemas/pcc/lists/control-center-setting-values.md
docs/reference/sharepoint/list-schemas/pcc/lists/control-center-setting-overrides.md
docs/reference/sharepoint/list-schemas/pcc/lists/control-center-setting-change-requests.md
docs/reference/sharepoint/list-schemas/pcc/lists/control-center-setting-validation-results.md
docs/reference/sharepoint/list-schemas/pcc/lists/control-center-setting-audit-events.md
docs/reference/sharepoint/list-schemas/pcc/lists/control-center-setting-dependency-map.md
docs/reference/sharepoint/list-schemas/pcc/lists/control-center-setting-health-snapshots.md
```

## Implementation Steps

1. Confirm current `PccSettingsReadModel` and `IPccSettingsRef` gaps.
2. Draft a developer-ready runtime DTO contract document.
3. Include top-level read model, wireframe-specific submodels, status vocabularies, redaction value model, detail drawer model, change request preview model, audit/HBI source-lineage model.
4. Add a schema-to-DTO mapping table for all nine Wave 16 settings-family lists.
5. State that code implementation should extend/bridge current repo models rather than inventing a parallel model architecture.
6. State that initial runtime route should be composite `GET /api/pcc/projects/{projectId}/settings` unless repo conventions prove otherwise.
7. Include tests implied by each DTO.


## Required Validation Commands

Run the repo-truth commands before and after changes where applicable:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
git diff --check
git diff --name-only
git diff --cached --name-only
```

Inspect package scripts before selecting package-specific validation:

```bash
cat package.json
cat packages/models/package.json
cat backend/functions/package.json
cat apps/project-control-center/package.json
```

Use only repo-supported scripts confirmed from `package.json`. Likely candidates, subject to repo truth:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
```

For documentation-only prompts:

```bash
pnpm exec prettier --check <touched markdown/json files>
python3 -m json.tool <touched json file>
```

Do not run `pnpm install`, `pnpm add`, or dependency updates unless separately authorized.


## Staged-File Proof and Commit Text

Before any commit, show:

```bash
git diff --name-only
git diff --cached --name-only
git status --short
md5 pnpm-lock.yaml
```

Use this commit format if changes are made:

```text
Commit summary:
docs(pcc): close wave 16 settings developer-readiness gaps

Commit description:
- Added implementation-driving developer contract details for Wave 16 Control Center Settings.
- Captured runtime DTO/read-model, fixture, role/action/redaction, effective-value, change-request, Wave 14 handoff, Priority Actions, UI/state/copy/accessibility, HBI/audit/security, and test-matrix guidance.
- Preserved read-model-first, GET-only, no tenant/source-system mutation, no raw secret, no HBI decision-authority, and no package/lockfile/manifest mutation guardrails.
- Validation: <commands and results>.
```


## Final Output Requirements

Return:

- files edited;
- DTO sections added;
- schema mapping coverage;
- unresolved tenant/provisioning facts;
- validation results;
- commit summary/description.
