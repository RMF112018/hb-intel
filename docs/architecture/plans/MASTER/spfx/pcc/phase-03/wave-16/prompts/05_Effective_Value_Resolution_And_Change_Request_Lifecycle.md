# Prompt 05 — Effective Value Resolution and Change Request Lifecycle Gap Closure

## Objective

Add deterministic effective-value resolution logic and change-request lifecycle guidance so implementation does not guess override, expiration, approval, validation, or command-gating behavior.


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
reference/05_EFFECTIVE_VALUE_RESOLUTION_ALGORITHM.md
reference/06_CHANGE_REQUEST_WAVE14_HANDOFF_CONTRACT.md
```

Inspect:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-16/Wave_16_Settings_Taxonomy_Inheritance_Override_Model.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-16/Wave_16_Read_Model_And_Command_Boundary.md
docs/reference/sharepoint/list-schemas/pcc/lists/control-center-setting-overrides.md
docs/reference/sharepoint/list-schemas/pcc/lists/control-center-setting-change-requests.md
```

## Implementation Steps

1. Add or update an effective-value resolution algorithm document.
2. Include precedence, input contracts, tie-break rules, invalid/expired/future/blocked override behavior.
3. Include helper function expectations and test cases.
4. Add or update a change request lifecycle document.
5. Explicitly state which UX is local-only, disabled, or future-command-gated.
6. Define future command payloads for documentation only.
7. Define statuses and disabled copy.
8. Prohibit backend write route implementation in this prompt.


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

- algorithm sections added;
- lifecycle statuses added;
- future command payload documented as non-authorizing;
- validation results;
- commit summary/description.
