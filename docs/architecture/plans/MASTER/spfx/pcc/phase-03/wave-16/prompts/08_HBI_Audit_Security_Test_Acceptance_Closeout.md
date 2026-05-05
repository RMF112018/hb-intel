# Prompt 08 — HBI / Audit / Security / Test / Acceptance Closeout Gap Closure

## Objective

Add the final developer-readiness contracts for HBI behavior, business audit vocabulary, secret/security display, acceptance criteria, and implementation test matrix. Close out the documentation/package gap closure.


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
reference/09_HBI_AUDIT_SECURITY_TEST_CONTRACT.md
reference/10_RESEARCH_PATTERN_REFERENCE.md
reference/11_VALIDATION_COMMAND_REFERENCE.md
reference/12_HARD_GUARDRAILS.md
```

Inspect:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-16/hbi/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-16/audit/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-16/security/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-16/validation/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-16/closeout/
```

## Implementation Steps

1. Add HBI allowed/refused examples.
2. Add citation/source-lineage payload.
3. Add business audit event vocabulary and payload expectations.
4. Add M365/Purview/Entra audit separation language if missing.
5. Add secret/security display rules.
6. Add full behavior-to-test matrix.
7. Add Definition of Done / acceptance criteria.
8. Add package/dependency/lockfile/manifest protection statement.
9. Add closeout doc summarizing gap closure and what is now ready for implementation package generation.
10. Do not claim runtime implementation complete.


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

- HBI/audit/security/test/acceptance sections added;
- research references included;
- gap-closure closeout status;
- validation results;
- commit summary/description.
