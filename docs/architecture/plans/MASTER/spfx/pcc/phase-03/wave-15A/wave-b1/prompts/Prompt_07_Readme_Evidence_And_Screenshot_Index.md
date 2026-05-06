# Prompt 07 — README, Evidence, and Screenshot Index

# Shared Instructions for This Prompt

## Context-Efficiency Rules

- Use active context first.
- Do not re-read files that are already in your current context and have not changed.
- Read only files you will edit, the immediately prior closeout, screenshot folder listings, or exact docs needed to verify a documentation statement.
- Do not run broad repo audits.
- Do not search unrelated packages or archived plans.
- Do not inspect backend/API/surface/shared-package files unless a validation failure points there or this prompt explicitly allows it.
- Do not read runtime source unless needed to verify a README statement that cannot be verified from existing closeouts.
- If you need files outside the allowed list, stop and explain why before expanding scope.

## Global Guardrails

- No runtime source changes.
- No CSS/component/test changes.
- No backend/API runtime changes.
- No Graph/PnP/SharePoint REST.
- No Procore live integration.
- No dependency install/update.
- No `pnpm-lock.yaml` drift.
- No package/manifest bump unless packaging files are changed and user approval is obtained.
- No final 56/56 claim.
- No tenant-hosted proof claim unless tenant-hosted evidence actually exists.
- No `git push` unless the user explicitly instructs it.

## Role

You are the PCC shell remediation documentation and evidence indexing agent.

## Objective

Update the PCC app README and create/update the Wave B shell-remediation evidence index.

This is docs/evidence only. Do not change runtime source, CSS, tests, manifests, package files, lockfile, backend files, webparts, shared packages, or tenant artifacts.

## Evidence Screenshot Source

The user has saved pre-remediation screenshots in:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b1/evidence/
```

Expected pre-remediation screenshot names:

```text
old-1
old-2
old-3
old-4
old-5
old-6
old-7
old-8
```

Before this prompt is executed, the user intends to save post-remediation screenshots in the same folder:

```text
new-1
new-2
new-3
new-4
new-5
new-6
new-7
new-8
```

Important:

- Do not assume file extensions. Detect the actual files in the folder by listing names that begin with `old-` and `new-`.
- Do not rename, move, copy, edit, compress, or delete screenshot files.
- Do not invent screenshots that are missing.
- Do not claim tenant-hosted proof unless the screenshot set or closeout evidence explicitly supports it.
- If any `new-*` files are missing, create the evidence index anyway and record the gaps clearly.
- If any `old-*` files are missing, record the gaps clearly.
- The evidence index should pair `old-N` with `new-N` by number for `N = 1..8`.

## Allowed Files to Edit

```text
apps/project-control-center/README.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-b/evidence/shell-remediation/INDEX.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-b/prompt-07-readme-evidence/closeout/PROMPT_07_README_EVIDENCE_CLOSEOUT.md
```

## Allowed Reads

Use active context first. Read only:

- `apps/project-control-center/README.md`
- the immediately prior closeout, if needed for validation/evidence continuity
- prior prompt closeouts only if needed to summarize validation by prompt
- screenshot folder listing at:
  ```text
  docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b1/evidence/
  ```
- screenshot files only if needed to confirm that the files are valid images or to capture basic metadata available from the filesystem
- `docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png` path existence only if needed for the README reference

Do not read runtime source unless needed to verify a README statement.

## Documentation Requirements

Update `apps/project-control-center/README.md` to reflect the completed Wave B shell-remediation direction:

- Project Hero Band replaces the prior header/context-band direction.
- Premium horizontal tab navigation replaces the vertical rail after shell recomposition.
- 8-mode PCC breakpoint policy:
  - `phone`
  - `tabletPortrait`
  - `tabletLandscape`
  - `smallLaptop`
  - `standardLaptop`
  - `largeLaptop`
  - `desktop`
  - `ultrawide`
- Bento layout is preserved.
- PCC remains preview / no-live-operational-release unless existing closeouts prove otherwise.
- Basis-of-design reference:
  ```text
  docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png
  ```

Do not overstate production readiness, tenant-hosted validation, live data integration, or final Wave 15A 56/56 doctrine completion.

## Evidence Index Requirements

Create or update:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-b/evidence/shell-remediation/INDEX.md
```

The evidence index must include:

### 1. Purpose

State that this index tracks before/after visual evidence for Wave 15A / Wave B (b1) PCC shell remediation.

### 2. Screenshot Source Folder

Reference:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b1/evidence/
```

### 3. Before / After Screenshot Matrix

Create a table with eight rows:

- Pair `old-1` with `new-1`
- Pair `old-2` with `new-2`
- Pair `old-3` with `new-3`
- Pair `old-4` with `new-4`
- Pair `old-5` with `new-5`
- Pair `old-6` with `new-6`
- Pair `old-7` with `new-7`
- Pair `old-8` with `new-8`

Include columns:

- Pair #
- Pre-remediation screenshot path
- Pre-remediation status: `Found` / `Missing`
- Post-remediation screenshot path
- Post-remediation status: `Found` / `Missing`
- Notes

Use the actual discovered filename and extension in the path. If more than one candidate exists for a given number, list the exact candidates in the notes and mark the row as requiring operator review.

### 4. Evidence Interpretation Rules

State that:

- Screenshots are visual evidence only.
- Screenshot presence does not equal tenant-hosted proof unless the capture context is documented.
- Missing screenshots are tracked as evidence gaps, not invented.
- The index does not perform image analysis unless explicitly requested by the user; it catalogs evidence availability and links/paths.

### 5. Validation Summary by Prompt

Summarize available validation evidence from prompt closeouts only.

- Include Prompt 01 through Prompt 06 if closeouts exist and are readily available from active context or immediate closeout references.
- Do not re-run prompt-specific tests in this docs-only prompt.
- If a closeout is not available, mark it as `Not indexed`.
- Do not perform a broad search to find every historical closeout. Use the immediate package sequence and known closeout paths when available.

### 6. Tenant-Hosted Proof Status

State one of:

- `Operator-pending`
- `Not provided`
- `Provided — indexed`

Only use `Provided — indexed` if the screenshot set or closeout clearly documents SharePoint tenant-hosted published/edit-mode captures.

### 7. Known Evidence Gaps

Record:

- Missing `old-*` screenshots, if any.
- Missing `new-*` screenshots, if any.
- Missing tenant-host capture context, if applicable.
- Missing browser/device/viewport annotations, if not documented.
- Any duplicate screenshot candidates for the same `old-N` or `new-N` pair.

### 8. No Final 56/56 Claim

Explicitly state that this evidence index does not claim final Wave 15A 56/56 doctrine completion.

## Validation

Run:

```bash
git status --short
md5 pnpm-lock.yaml
pnpm exec prettier --check apps/project-control-center/README.md docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-b/evidence/shell-remediation/INDEX.md docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-b/prompt-07-readme-evidence/closeout/PROMPT_07_README_EVIDENCE_CLOSEOUT.md
md5 pnpm-lock.yaml
```

Do not run runtime tests unless the README or evidence-index work unexpectedly touches runtime source, which should not happen.

## Stop Conditions

Stop if:

- README update would require claiming tenant-hosted proof that does not exist.
- Evidence index would require inventing screenshots or screenshot context.
- Screenshot files must be moved, renamed, modified, copied, or deleted to complete the task.
- Any runtime source, CSS, test, package, manifest, backend, webpart, shared-package, or lockfile change appears necessary.
- `pnpm-lock.yaml` changes.
- The screenshot folder is missing entirely. If this occurs, stop and report the missing folder rather than creating an empty evidence index.

## Closeout

Create:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-b/prompt-07-readme-evidence/closeout/PROMPT_07_README_EVIDENCE_CLOSEOUT.md
```

Include:

- Docs changed.
- Screenshot folder inspected.
- `old-*` / `new-*` evidence availability summary.
- Missing screenshot gaps.
- Tenant-hosted proof status.
- README update summary.
- Context-efficiency section:
  - files actually read
  - files not re-read
  - screenshot listing method
- Validation results:
  - `git status --short`
  - `md5 pnpm-lock.yaml` before and after
  - Prettier result
- Guardrails preserved.
- Residual risks.
- Next prompt:
  ```text
  docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b1/prompts/Prompt_08_Final_Wave_B_Closeout_And_Handoff.md
  ```

## Commit

Commit message:

```text
docs(pcc): Wave 15A Wave B Prompt 07 — README and shell evidence index
```

Stage only the three allowed edited files. Do not stage screenshot files unless the user explicitly instructs it. Do not push unless the user explicitly instructs it.
