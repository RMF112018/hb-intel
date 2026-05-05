# Prompt 07 — UI Component / State / Copy / Accessibility Contract Gap Closure

## Objective

Add developer-ready UI decomposition, state ownership, copy catalog, mobile behavior, accessibility, and test-hook guidance for the Wave 16 surface.


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

Documentation/package files only, subject to Prompt 01 findings.

## Required Inputs

Use:

```text
reference/08_UI_STATE_COMPONENT_COPY_CONTRACT.md
```

Inspect:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-16/wireframes/
apps/project-control-center/src/surfaces/controlCenterSettings/
apps/project-control-center/src/layout/
apps/project-control-center/src/ui/
apps/project-control-center/src/shell/
```

## Implementation Steps

1. Add a UI component tree contract.
2. Define state ownership for category/search/filter/selected setting/drawers/panels/degraded states.
3. Define table sorting/filtering/grouping behavior.
4. Define mobile table-to-card behavior.
5. Define detail drawer/change request drawer behavior.
6. Define focus trap, Escape close, return-focus, non-nested dialog, color-not-only status behavior.
7. Add `data-pcc-settings-*` test-hook map.
8. Add UX copy catalog for disabled, redacted, degraded, HBI refusal, missing config, empty state, pending approval, validation blocked.
9. Link UI states to DTO fields and tests.


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

- component/state/copy/a11y contract added;
- mobile behavior added;
- test hooks added;
- validation results;
- commit summary/description.
