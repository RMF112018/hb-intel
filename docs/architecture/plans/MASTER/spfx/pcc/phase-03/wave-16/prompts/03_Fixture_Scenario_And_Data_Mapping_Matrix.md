# Prompt 03 — Fixture Scenario and Data Mapping Matrix Gap Closure

## Objective

Add deterministic fixture scenario guidance so implementation can build meaningful Wave 16 model/backend/SPFx fixtures without inventing behavior.


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
reference/03_FIXTURE_SCENARIO_MATRIX.md
reference/02_WAVE16_RUNTIME_DTO_CONTRACT_SKELETON.md
```

Inspect current fixture patterns:

```text
packages/models/src/pcc/fixtures/
packages/models/src/pcc/*.test.ts
backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts
apps/project-control-center/src/fixtures/
apps/project-control-center/src/api/pccFixtureReadModelClient.ts
```

## Implementation Steps

1. Document known-project, unknown-project, backend-unavailable, and partial/degraded fixture scenarios.
2. Define required examples across all setting categories.
3. Add fixture rows for secret reference, expired override, future override, blocked policy override, source-derived setting, missing required setting, admin-verification setting, pending Wave 14 approval handoff, HBI refusal, HBI explanation.
4. Map each fixture scenario to tests.
5. State that fixtures must use stable IDs, fixed timestamps, fake URLs, no real tenant data, and no raw secrets.
6. State how category/summary counts are derived from row fixtures.
7. Include sample fixture naming conventions consistent with current repo naming.


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

- fixture matrix added;
- scenario coverage;
- no-secret attestation;
- validation results;
- commit summary/description.
