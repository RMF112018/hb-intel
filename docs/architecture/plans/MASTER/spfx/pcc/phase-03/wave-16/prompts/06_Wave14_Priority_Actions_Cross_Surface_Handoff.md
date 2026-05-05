# Prompt 06 — Wave 14, Priority Actions, and Cross-Surface Handoff Gap Closure

## Objective

Add implementation-driving contracts for Wave 14 approval/checkpoint handoff, Priority Actions candidates, and cross-surface settings seams.


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
reference/06_CHANGE_REQUEST_WAVE14_HANDOFF_CONTRACT.md
reference/07_PRIORITY_ACTION_RULES.md
```

Inspect:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-14/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-16/Wave_16_Cross_Surface_Integration_Boundaries.md
packages/models/src/pcc/PriorityActions.ts
packages/models/src/pcc/CheckpointInstance.ts
apps/project-control-center/src/surfaces/priorityActions/
apps/project-control-center/src/surfaces/approvals/
apps/project-control-center/src/surfaces/projectHome/
apps/project-control-center/src/surfaces/projectReadiness/
apps/project-control-center/src/surfaces/siteHealth/
apps/project-control-center/src/surfaces/adminReview/
```

## Implementation Steps

1. Add Wave 14 handoff payload and routing rules.
2. Add Priority Actions candidate rules, severity, dedupe keys, suppression, resolve, and Project Home rollup rules.
3. Define cross-surface behavior for:
   - Project Home;
   - Project Readiness;
   - Priority Actions;
   - Approvals / Checkpoints;
   - Team & Access;
   - Site Health;
   - Admin Review;
   - External Systems;
   - Document Control;
   - HBI.
4. State all seams are display/reference-only unless future command gate authorizes commands.
5. Add tests implied by each seam.


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

- Wave 14 handoff contract added;
- Priority Actions rules added;
- cross-surface map added;
- validation results;
- commit summary/description.
