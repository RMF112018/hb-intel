# Prompt 03 — Report, Surface Blocks, Doctrine Source, and Package-Completeness Closeout Integration — UPDATED

## Role

You are acting as a senior TypeScript/Playwright test architect, SPFx evidence-harness maintainer, UI/UX audit systems engineer, and repository-quality reviewer.

You are working in the local repository:

```text
RMF112018/hb-intel
```

## Mandatory Session Rules

- Start from repo truth. Run `git status --short`, `git branch --show-current`, and `git rev-parse --short HEAD` before making changes.
- Do not re-read files that are still within your current context or memory. Reopen a file only if it may have changed, if exact code is required, or if prior context is stale or contradictory.
- Make the smallest coherent set of changes necessary to satisfy this prompt.
- Preserve existing architecture and naming patterns unless this prompt explicitly instructs a targeted adjustment.
- Do not calculate final scorecard points.
- Do not mark hard stops as passed or failed.
- Do not mark EVs as finally captured by automation.
- Do not approve or deny Phase 4 readiness by automation.
- Do not generate or commit storageState, cookies, tokens, raw traces, videos, HAR files, raw `test-results/`, or raw `playwright-report/`.
- Do not add live write-side PCC actions or tenant mutation behavior.
- Keep all outputs expert-review / operator-review oriented.
- Do not modify product UI runtime files.
- Do not change dependencies, `pnpm-lock.yaml`, package metadata, SPFx manifests, or package-solution files.

## Completion Summary Required

When finished, respond with:

```text
Commit summary:
<one-line summary>

Commit description:
- Objective:
- Files changed:
- What changed:
- Validation:
- Safety/scoring boundary:
- Package/lockfile/manifest boundary:
- Residual risks:
- Suggested next prompt:
```

## Objective

Integrate the Prompt 02 package-completeness contract into the existing PCC live evidence closeout flow so the scorecard-report package can reference the full evidence package, surface-block outputs, and doctrine-source outputs as auditable review artifacts.

A full closeout package should include or explicitly call out:

```text
doctrine-source-*/
surface-blocks-*/
scorecard-report-*/
evidence-package-completeness.json
evidence-package-completeness.md
```

The key objective is not to produce a score. The key objective is to make missing package groups visible as review-support evidence gaps instead of hidden omissions.

## Why This Matters

Prompt 02 added the standalone package-completeness contract and writer. The current report model and artifact inventory can already ingest prior-lane artifact paths, but it does not yet explicitly type or elevate package-completeness outputs as a first-class source lane. The latest reviewed evidence package had strong lane-level outputs but did not visibly include final doctrine-source, surface-block, and scorecard-report closeout outputs. Auditors need these package-closeout artifacts to be explicitly referenced and easy to find.

## Repo Areas to Inspect

Inspect only as needed, starting from repo truth:

```text
e2e/pcc-live/pcc-live.package-completeness.types.ts
e2e/pcc-live/pcc-live.package-completeness.ts
e2e/pcc-live/pcc-live.package-completeness.spec.ts

e2e/pcc-live/pcc-live.scorecard-report.types.ts
e2e/pcc-live/pcc-live.scorecard-report-assembler.ts
e2e/pcc-live/pcc-live.scorecard-report-writer.ts
e2e/pcc-live/pcc-live.scorecard-report.spec.ts

e2e/pcc-live/pcc-live.surface-blocks.spec.ts
e2e/pcc-live/pcc-live.surface-blocks-assembler.ts
e2e/pcc-live/pcc-live.surface-blocks-writer.ts

e2e/pcc-live/pcc-live.doctrine-source.spec.ts
e2e/pcc-live/pcc-live.doctrine-source-capture.ts
e2e/pcc-live/pcc-live.doctrine-source-writer.ts

e2e/pcc-live/README.md
docs/architecture/evidence/pcc-live/README.md
docs/architecture/evidence/pcc-live/PCC_Live_Evidence_Closeout_Template.md
```

## Required Changes

### 1. Extend scorecard-report typing for package-completeness visibility

Update the scorecard-report model in the smallest compatible way needed to represent package-completeness outputs.

At minimum, add one source lane:

```ts
'package-completeness'
```

Also add or reuse a safe disposition/category for package gaps. Prefer adding the following where type-safe and minimally disruptive:

```ts
PccScorecardReportDisposition: 'evidence-package-gap'
PccScorecardReportFinding.category: 'evidence-package-gap'
```

If adding a new disposition/category creates unnecessary churn, use the existing `operator-review-pending` / `source-missing` posture but ensure the generated wording includes the phrase `evidence-package-gap` in finding titles/details and markdown output.

### 2. Ensure scorecard report artifact inventory recognizes closeout artifacts

Update scorecard-report artifact-lane mapping so the following paths are categorized correctly when supplied via `artifactPaths`:

```text
evidence-package-completeness.json
evidence-package-completeness.md
surface-blocks-*/pcc-live-surface-blocks-evidence.json
surface-blocks-*/pcc-live-surface-blocks-evidence.md
doctrine-source-*/pcc-live-doctrine-source-evidence.json
doctrine-source-*/pcc-live-doctrine-source-evidence.md
scorecard-report-*/audit-package-index.json
scorecard-report-*/artifact-inventory.json
scorecard-report-*/manual-review-checklist.md
scorecard-report-*/final-report-readme.md
```

The package-completeness artifacts must appear in `artifactInventory` when present.

The surface-block and doctrine-source artifacts must appear in `artifactInventory` when present.

### 3. Integrate package-completeness result data without making the assembler async

Do not make `assemblePccScorecardReport` async unless there is a strong repo-truth reason.

Preferred approach:

- Extend `AssemblePccScorecardReportInput` with an optional precomputed package-completeness run:

```ts
packageCompletenessRun?: PccEvidencePackageCompletenessRun;
```

- Keep `artifactPaths?: readonly string[]` behavior intact.
- The caller/test can use Prompt 02’s async evaluator/writer before assembling the report, then pass the run into the assembler.
- The assembler should summarize package-completeness status into report findings/residual risks/artifact inventory without calculating a score.

Acceptable alternative:

- If avoiding a new input is cleaner, rely on artifact-path presence only, but add explicit tests proving the scorecard report sees `evidence-package-completeness.json/.md` as first-class report artifacts.

Do **not** rescan the filesystem from inside the synchronous scorecard-report assembler.

### 4. Surface missing package groups as review gaps

When package-completeness data is supplied and it has missing/operator statuses, add findings or residual risks that use safe language such as:

```text
operator-review-pending
source-missing
evidence-package-gap
```

Do not state or imply:

```text
hard stop failed
Phase 4 not ready
score invalid
score failed
readiness denied
```

The report may state that additional artifacts are required before expert closeout can be completed, but it must not render a final readiness judgment.

### 5. Update report Markdown / checklist output

Update scorecard-report Markdown and/or manual-review checklist so expert reviewers are prompted to verify:

- all expected groups are present or explicitly documented;
- package-completeness artifacts are included or an exception is documented;
- screenshots are scrubbed;
- raw Playwright artifacts are excluded;
- scorecard references are canonical;
- final scores remain blank until expert review;
- hard-stop dispositions remain manual-review-required;
- surface-block artifacts are included or explicitly marked missing/operator-pending;
- doctrine-source artifacts are included or explicitly marked missing/operator-pending.

The scorecard report output set should continue to include its existing report artifacts. Do not remove or rename existing `PCC_SCORECARD_REPORT_OUTPUT_FILES` unless the tests and writer contract are intentionally updated.

### 6. Update audit package index expectations

The audit package index should include or reference the two package-completeness files:

```text
evidence-package-completeness.json
evidence-package-completeness.md
```

Implementation options:

- Include them in the scorecard report `auditPackageIndex` as external/prior-lane artifacts with source lane `package-completeness`; or
- Keep the scorecard report output list unchanged but ensure the report package index references these files as required closeout support artifacts.

Do not duplicate Prompt 02 writer responsibility unless repo truth shows the scorecard-report writer is the right owner for assembling the final folder.

### 7. Keep surface-block and doctrine-source writers scoped

Do not substantially rewrite doctrine-source or surface-block assemblers/writers.

Only make targeted updates if required to:

- expose stable output filenames to the scorecard report tests; or
- add minimal README/runbook guidance for the full closeout sequence.

### 8. Update runbook guidance

Update `e2e/pcc-live/README.md` and/or `docs/architecture/evidence/pcc-live/README.md` only as needed to show the full closeout sequence.

The runbook should instruct operators to run or include:

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.doctrine-source.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.surface-blocks.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.package-completeness.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.scorecard-report.spec.ts
```

If there is no production command that writes the complete evidence folder in one pass, do not invent one. Document the current focused-spec closeout sequence and leave full orchestration as future work.

## Required Tests

Update or add tests in `e2e/pcc-live/pcc-live.scorecard-report.spec.ts` to cover:

1. Synthetic full closeout package references:
   - artifact paths include smoke, screenshots, breakpoints, accessibility, workflow, content, doctrine-source, conditional, surface-blocks, scorecard-report, and package-completeness artifacts.
   - report artifact inventory classifies package-completeness as `package-completeness`.
   - report artifact inventory includes doctrine-source and surface-blocks artifacts.

2. Package-completeness summary integration:
   - pass a synthetic `PccEvidencePackageCompletenessRun` with all groups present.
   - report contains no evidence-package-gap finding.
   - final report still requires expert review and does not calculate a score.

3. Missing groups visibility:
   - pass a synthetic package-completeness run where `doctrine-source`, `surface-blocks`, and `scorecard-report` are missing/operator-pending.
   - report surfaces these as `operator-review-pending`, `source-missing`, or `evidence-package-gap`.
   - report does not say `hard stop failed`, `Phase 4 not ready`, or `score invalid`.

4. Writer output expectations:
   - written `artifact-inventory.json/.md`, `audit-package-index.json/.md`, `manual-review-checklist.md`, and `final-report-readme.md` reference package-completeness artifacts when supplied.
   - manual-review checklist includes the closeout checks listed above.

5. Regression boundaries:
   - manual score fields remain `null`.
   - hard-stop review statuses remain `manual-review-required`.
   - no `totalScore` or equivalent automated score field appears.
   - no `_v2` scorecard reference reappears.
   - unsafe raw artifact paths remain filtered.

Run the existing doctrine-source and surface-block specs. Add tests there only if a targeted code change to those writers requires it.

## Required Validation

Run exactly:

```bash
git status --short
git branch --show-current
git rev-parse --short HEAD
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.doctrine-source.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.surface-blocks.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.package-completeness.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.scorecard-report.spec.ts
pnpm exec prettier --check e2e/pcc-live/pcc-live.scorecard-report.types.ts e2e/pcc-live/pcc-live.scorecard-report-assembler.ts e2e/pcc-live/pcc-live.scorecard-report-writer.ts e2e/pcc-live/pcc-live.scorecard-report.spec.ts e2e/pcc-live/README.md docs/architecture/evidence/pcc-live/README.md docs/architecture/evidence/pcc-live/PCC_Live_Evidence_Closeout_Template.md
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

If touched files differ, adjust the targeted Prettier command to include every touched file and do not run a broad repo-wide Prettier command that captures unrelated pre-existing formatting warnings.

## Acceptance Criteria

- Scorecard report can reference package-completeness artifacts as first-class closeout artifacts.
- Package-completeness result data can be summarized in the scorecard report without making the report assembler async.
- Surface-block and doctrine-source outputs are visible in report artifact inventory when present.
- Missing package groups are explicit evidence-package gaps, not hidden omissions.
- Manual review checklist includes package-completeness, scrubbed screenshot, raw-artifact, canonical-scorecard, blank-score, and manual-hard-stop checks.
- Existing scorecard-report outputs remain deterministic and writer-compatible.
- Doctrine-source and surface-block specs remain passing.
- Package-completeness spec remains passing.
- No automated final score, EV capture, hard-stop disposition, or Phase 4 approval is introduced.

## Out of Scope

- Building a full orchestration command that executes every lane and writes a complete evidence package in one command.
- Changing product UI runtime behavior.
- Changing SPFx package/manifest/package-solution metadata.
- Changing dependencies or lockfile.
- Running a live tenant evidence capture unless explicitly requested by the operator.
- Manually scoring the 100-point scorecard.
- Adjudicating hard stops.
