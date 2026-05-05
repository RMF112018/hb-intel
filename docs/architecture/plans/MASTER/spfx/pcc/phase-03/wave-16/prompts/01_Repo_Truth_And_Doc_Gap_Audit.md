# Prompt 01 — Wave 16 Repo Truth and Developer-Readiness Gap Audit

## Objective

Conduct a read-only local repo-truth audit of Wave 16 `Control Center Settings` and verify exactly where the missing developer-readiness information should be added before runtime implementation begins.


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


## Allowed Scope

Read-only audit. No file edits. No commits.

## Repo-Truth Files to Inspect

At minimum inspect:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-16/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-16/wireframes/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-16/security/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-16/audit/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-16/hbi/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-16/validation/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-16/closeout/
docs/reference/sharepoint/list-schemas/pcc/List-Map.md
docs/reference/sharepoint/list-schemas/pcc/lists/control-center-setting-*.md
packages/models/src/pcc/PccSettings.ts
packages/models/src/pcc/PccReadModels.ts
backend/functions/src/hosts/pcc-read-model/read-models/
apps/project-control-center/src/api/
apps/project-control-center/src/surfaces/controlCenterSettings/
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
```

## Audit Questions

Answer:

1. Which Wave 16 docs already contain developer-ready details?
2. Which docs are high-level and need gap closure?
3. Does the current runtime model still expose only legacy `IPccSettingsRef`?
4. Does the current mock provider still return an empty settings registry?
5. Does the SPFx client include a settings route/method?
6. Does the router pass a read-model client to Control Center Settings?
7. Which exact files should later prompts update?
8. Are docs/package updates enough, or are any implementation prompts already present and needing augmentation?
9. Are any local working-tree changes user-owned and outside this package scope?


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


## Final Output Requirements

Return:

- branch / HEAD / lockfile MD5;
- clean/dirty status;
- file findings;
- missing-info map;
- recommended edit targets for Prompts 02–08;
- explicit statement: no files edited.
