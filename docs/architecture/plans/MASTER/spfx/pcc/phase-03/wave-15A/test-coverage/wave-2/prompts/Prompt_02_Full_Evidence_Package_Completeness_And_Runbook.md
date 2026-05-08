# Prompt 02 — Full Evidence Package Completeness and Runbook — Updated Execution Prompt

## Role

You are acting as a senior TypeScript/Playwright test architect, SPFx evidence-harness maintainer, UI/UX audit systems engineer, and repository-quality reviewer.

You are working in the local repository:

```text
RMF112018/hb-intel
```

## Current Sprint Context

Prompt 01 has already repaired the active PCC live evidence-harness scorecard references to the canonical non-versioned scorecard path and added `_v2` regression guards.

Do **not** reopen Prompt 01 unless repo truth shows a regression.

Prompt 02 now implements a standalone, machine-checkable **full evidence package completeness** contract for curated PCC live evidence runs.

The target is not to prove the PCC UI is complete. The target is to make evidence-package completeness auditable, reproducible, and explicit.

## Mandatory Session Rules

- Start from repo truth.
- Run `git status --short` and identify the current branch / HEAD before making changes.
- Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
- Make the smallest coherent set of changes necessary to satisfy this prompt.
- Preserve existing architecture and naming patterns unless this prompt explicitly instructs a targeted adjustment.
- Do not calculate final scorecard points.
- Do not mark hard stops as passed or failed.
- Do not mark EVs as finally captured by automation.
- Do not claim Phase 4 readiness.
- Do not generate or commit storageState, cookies, tokens, raw traces, videos, HAR files, raw `test-results/`, or raw `playwright-report/`.
- Do not add live write-side PCC actions or tenant mutation behavior.
- Keep all outputs expert-review / operator-review oriented.
- Do not modify product UI runtime files.
- Do not change dependencies, `pnpm-lock.yaml`, package metadata, SPFx manifests, or package solution files.
- Do not perform broad unrelated formatting passes.

## Objective

Add a machine-checkable **full evidence package completeness** contract for PCC live evidence runs.

The package must identify whether a curated run folder includes all expected evidence output groups:

```text
surface-smoke-*/
surface-screenshots-*/
breakpoints-*/
accessibility-*/
workflow-*/
content-*/
doctrine-source-*/
conditional-*/
surface-blocks-*/
scorecard-report-*/
```

The output must make missing groups visible as evidence-package gaps or operator-review items. It must not silently treat missing groups as complete, and it must not convert missing groups into hard-stop pass/fail outcomes.

This prompt should focus on:

- package-completeness typing;
- reusable completeness assembly logic;
- JSON / Markdown report writing;
- runbook and closeout-template clarity;
- synthetic tests that do not require a live tenant run.

## Why This Matters

The latest reviewed committed evidence package showed useful smoke, screenshot, breakpoint, accessibility, workflow, content, and conditional evidence, but the final `doctrine-source-*`, `surface-blocks-*`, and `scorecard-report-*` groups were not visibly committed in that package.

The suite must surface those missing package groups explicitly as evidence gaps. An auditor should not need to manually discover absence by scanning folders.

## Repo Areas to Inspect

Inspect only what is needed for this prompt:

```text
docs/architecture/evidence/pcc-live/README.md
docs/architecture/evidence/pcc-live/PCC_Live_Evidence_Closeout_Template.md
docs/architecture/evidence/pcc-live/20260507-134047/README.md

e2e/pcc-live/pcc-live.scorecard-report-assembler.ts
e2e/pcc-live/pcc-live.scorecard-report-writer.ts
e2e/pcc-live/pcc-live.scorecard-report.spec.ts
e2e/pcc-live/pcc-live.surface-blocks-assembler.ts
e2e/pcc-live/pcc-live.surface-blocks-writer.ts
e2e/pcc-live/pcc-live.doctrine-source-capture.ts
e2e/pcc-live/pcc-live.doctrine-source-writer.ts
e2e/pcc-live/pcc-live.doctrine-source.spec.ts
```

If a referenced file is missing or has been renamed, verify current repo truth and adapt minimally.

## Scope Boundaries

### Allowed Files / Areas

Prefer adding a standalone reusable completeness module under `e2e/pcc-live/`:

```text
e2e/pcc-live/pcc-live.package-completeness.types.ts
e2e/pcc-live/pcc-live.package-completeness.ts
e2e/pcc-live/pcc-live.package-completeness.spec.ts
```

Minimal documentation updates are allowed in:

```text
docs/architecture/evidence/pcc-live/README.md
docs/architecture/evidence/pcc-live/PCC_Live_Evidence_Closeout_Template.md
```

### Do Not Do in Prompt 02

- Do not integrate package completeness into scorecard-report outputs yet unless a tiny import-free consistency test is unavoidable. Prompt 03 owns scorecard-report / surface-block / doctrine-source closeout integration.
- Do not modify historical committed evidence packages such as `docs/architecture/evidence/pcc-live/20260507-134047/` unless explicitly instructed later.
- Do not add a live Playwright spec that requires tenant auth.
- Do not change PCC product UI runtime code.
- Do not run Prettier with `--write` across broad doc folders.

## Required Status Model

The original Prompt 02 status list is not sufficient. Use a status model that can express all relevant evidence-package postures from the Immediate ROI package.

At minimum, support:

```ts
type PccEvidencePackageCompletenessStatus =
  | 'present'
  | 'missing'
  | 'operator-pending'
  | 'not-configured'
  | 'self-skipped'
  | 'blocked'
  | 'unavailable';
```

Status guidance:

- `present`: expected group directory / artifact evidence is present.
- `missing`: required group is absent with no acceptable explanation.
- `operator-pending`: group is expected but requires operator action, review, artifact movement, scrub approval, or rerun.
- `not-configured`: group is intentionally not configured for the run, such as conditional lane disabled with explicit metadata.
- `self-skipped`: group emitted a self-skip artifact or explicit self-skipped run state.
- `blocked`: group could not complete due to a documented blocker.
- `unavailable`: group cannot be evaluated from the provided artifact list / run directory inventory.

Do not use `present` for an empty or absent group.

## Required Expected Groups

Define a canonical expected group list in typed source.

At minimum include:

```text
surface-smoke
surface-screenshots
breakpoints
accessibility
workflow
content
doctrine-source
conditional
surface-blocks
scorecard-report
```

Each expected group should include, at minimum:

```ts
groupId
label
requiredForFullPhase4ScoringPackage
expectedDirectoryPrefix
expectedFiles
absenceDefaultStatus
notes
```

Suggested expected files by group:

```text
surface-smoke
- pcc-live-surface-smoke.json
- pcc-live-surface-smoke.md

surface-screenshots
- pcc-live-screenshot-evidence.json
- pcc-live-screenshot-evidence.md
- pcc-live-screenshot-inventory.json
- pcc-live-dom-card-summary.json

breakpoints
- pcc-live-breakpoint-evidence.json
- pcc-live-breakpoint-evidence.md
- pcc-live-breakpoint-matrix.json
- pcc-live-breakpoint-card-measurements.json
- pcc-live-breakpoint-touch-targets.json

accessibility
- pcc-live-accessibility-evidence.json
- pcc-live-accessibility-evidence.md
- pcc-live-axe-summary.json
- pcc-live-keyboard-focus-summary.json
- pcc-live-aria-label-summary.json
- pcc-live-contrast-summary.json

workflow
- pcc-live-workflow-evidence.json
- pcc-live-workflow-evidence.md

content
- pcc-live-content-evidence.json
- pcc-live-content-evidence.md

doctrine-source
- pcc-live-doctrine-source-evidence.json
- pcc-live-doctrine-source-evidence.md

conditional
- pcc-live-conditional-evidence.json
- pcc-live-conditional-evidence.md

surface-blocks
- pcc-live-surface-blocks-evidence.json
- pcc-live-surface-blocks-evidence.md

scorecard-report
- pcc-live-scorecard-report.json
- pcc-live-scorecard-report.md
- audit-package-index.json
- audit-package-index.md
- evidence-coverage-matrix.json
- evidence-coverage-matrix.md
- hard-stop-worksheet.json
- hard-stop-worksheet.md
- expert-scoring-worksheet.json
- expert-scoring-worksheet.md
- findings-register.json
- findings-register.md
- residual-risk-register.json
- residual-risk-register.md
- manual-review-checklist.md
- final-report-readme.md
```

If current repo truth shows different writer output names, use repo truth and document the adjustment in closeout.

## Required Completeness Types

Add typed models with at least the following concepts:

```ts
export type PccEvidencePackageGroupId =
  | 'surface-smoke'
  | 'surface-screenshots'
  | 'breakpoints'
  | 'accessibility'
  | 'workflow'
  | 'content'
  | 'doctrine-source'
  | 'conditional'
  | 'surface-blocks'
  | 'scorecard-report';

export interface PccEvidencePackageExpectedGroup {
  groupId: PccEvidencePackageGroupId;
  label: string;
  requiredForFullPhase4ScoringPackage: boolean;
  expectedDirectoryPrefix: string;
  expectedFiles: readonly string[];
  absenceDefaultStatus: PccEvidencePackageCompletenessStatus;
  notes: readonly string[];
}

export interface PccEvidencePackageGroupCompleteness {
  groupId: PccEvidencePackageGroupId;
  label: string;
  required: boolean;
  expectedGlobOrPrefix: string;
  expectedFiles: readonly string[];
  observed: boolean;
  observedPathCount: number;
  observedPaths: readonly string[];
  missingExpectedFiles: readonly string[];
  status: PccEvidencePackageCompletenessStatus;
  notes: readonly string[];
  recommendedAction: string;
}

export interface PccEvidencePackageCompletenessRun {
  runId: string;
  generatedAtIso: string;
  sourceRoot?: string;
  groups: readonly PccEvidencePackageGroupCompleteness[];
  summary: {
    expectedGroupCount: number;
    presentGroupCount: number;
    missingGroupCount: number;
    operatorPendingGroupCount: number;
    notConfiguredGroupCount: number;
    selfSkippedGroupCount: number;
    blockedGroupCount: number;
    unavailableGroupCount: number;
    requiredMissingGroupCount: number;
    observedPathCount: number;
  };
  disclaimer: string;
  finalDisposition: 'expert-review-required' | 'operator-review-required';
}
```

You may adjust names to fit existing repo conventions, but preserve the same meaning.

## Required Assembly Logic

Add a reusable helper that can evaluate either:

1. a supplied list of artifact paths; or
2. a run directory inventory read from disk.

The helper should:

- match groups by expected directory prefix and/or expected files;
- count observed paths;
- identify missing expected files where possible;
- assign status according to the status model above;
- preserve safe relative evidence paths;
- filter or flag forbidden raw artifacts;
- never include sensitive raw artifact paths as commit-eligible evidence.

The helper should accept optional metadata to distinguish `not-configured`, `self-skipped`, and `blocked` where supplied. Example:

```ts
statusOverrides?: Partial<Record<PccEvidencePackageGroupId, PccEvidencePackageCompletenessStatus>>;
notesByGroup?: Partial<Record<PccEvidencePackageGroupId, readonly string[]>>;
```

This lets the conditional lane be represented clearly when disabled or not configured.

## Artifact Safety Requirements

Completeness output must not expose or endorse forbidden artifacts.

Forbidden paths / tokens include:

```text
storageState
storage-state
cookie
token
auth
session
secret
secrets
test-results
playwright-report
trace.zip
video.webm
network.har
.har
.webm
.zip when it is a Playwright trace/archive artifact
```

Behavior:

- Do not count forbidden raw artifacts toward group completeness.
- Either omit them from observed paths or include only a sanitized/flagged count if useful.
- Preserve safe run IDs and safe evidence paths such as `20260507-134047`, `workflow-1778175784527`, and `docs/architecture/evidence/pcc-live/<run-id>/workflow-*/pcc-live-workflow-evidence.json`.
- Do not repeat the sanitizer over-redaction problem that Prompt 08 will later address in broader scope.

## Report Output Requirements

Add writer/report support for:

```text
evidence-package-completeness.json
evidence-package-completeness.md
```

The Markdown must include:

- run ID;
- generated timestamp;
- source root or inventory source if supplied;
- group table;
- present count;
- missing count;
- operator-pending count;
- not-configured count;
- self-skipped count;
- blocked count;
- unavailable count;
- required missing groups;
- recommended rerun / closeout action;
- statement that this does not calculate final scorecard points;
- statement that this does not pass/fail hard stops;
- statement that this does not mark EVs finally captured;
- statement that this does not approve Phase 4 readiness.

## Documentation Updates

Update the runbook minimally:

```text
docs/architecture/evidence/pcc-live/README.md
```

Add `evidence-package-completeness.json` and `evidence-package-completeness.md` to expected closeout artifacts and explain that they are machine-readable / human-readable completeness checks, not scoring authority.

Update the closeout template minimally:

```text
docs/architecture/evidence/pcc-live/PCC_Live_Evidence_Closeout_Template.md
```

Add a row or section for package completeness artifacts, without changing final scoring posture.

Do not reformat unrelated sections.

## Required Tests

Create or update a focused spec, preferably:

```text
e2e/pcc-live/pcc-live.package-completeness.spec.ts
```

Required test coverage:

1. **Expected group taxonomy**
   - all 10 expected group IDs exist;
   - no duplicate IDs;
   - every group has prefix, required flag, expected files, and notes.

2. **Complete synthetic package**
   - synthetic artifact list with all groups returns all expected groups as `present`;
   - summary present count equals expected group count;
   - required missing count is zero.

3. **Missing groups surfaced**
   - synthetic artifact list missing `doctrine-source`, `surface-blocks`, and `scorecard-report` returns those groups as `missing` or `operator-pending` per model;
   - missing groups appear in JSON and Markdown;
   - output does not throw.

4. **Conditional nuance**
   - absent conditional group can be represented as `operator-pending` by default;
   - explicit override can represent it as `not-configured` or `self-skipped`;
   - either posture is visible in output.

5. **Blocked / self-skipped / unavailable statuses**
   - status overrides or metadata can produce `blocked`, `self-skipped`, and `unavailable` without treating them as present.

6. **Raw artifact safety**
   - forbidden raw artifacts are not counted as valid observed group paths;
   - raw `test-results`, `playwright-report`, storageState, auth/session/cookie/token, trace/video/HAR paths are filtered or flagged safely;
   - safe evidence paths and run IDs are preserved.

7. **Markdown / JSON writer output**
   - writer emits `evidence-package-completeness.json` and `.md`;
   - Markdown includes group table and summary counts;
   - JSON includes full typed group status data.

8. **No scoring / no hard-stop / no EV final capture**
   - output does not contain final score claims;
   - output does not contain hard-stop pass/fail claims;
   - output does not mark EVs finally captured;
   - output does not claim Phase 4 readiness.

9. **Compatibility guard**
   - scorecard-report tests continue passing;
   - Prompt 02 does not alter Prompt 01 canonical path behavior.

## Validation Commands

Run these commands and include exact output in closeout:

```bash
git status --short
git branch --show-current
git rev-parse --short HEAD
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.package-completeness.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.scorecard-report.spec.ts
pnpm exec prettier --check \
  e2e/pcc-live/pcc-live.package-completeness.types.ts \
  e2e/pcc-live/pcc-live.package-completeness.ts \
  e2e/pcc-live/pcc-live.package-completeness.spec.ts \
  docs/architecture/evidence/pcc-live/README.md \
  docs/architecture/evidence/pcc-live/PCC_Live_Evidence_Closeout_Template.md
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

If file names differ because you integrate the implementation differently, update the Prettier command to target only files modified by this prompt.

Do **not** run a broad Prettier check across all `docs/architecture/evidence/pcc-live/**/*.md` if it will repeat unrelated pre-existing formatting warnings. If unrelated existing warnings are encountered, record them as a validation exception and do not fix unrelated files.

## Acceptance Criteria

Prompt 02 is complete only when:

- Full package expected groups are defined in typed source.
- Completeness can be evaluated from an artifact-path list and/or run-folder inventory.
- `evidence-package-completeness.json` and `evidence-package-completeness.md` can be emitted by a writer/helper.
- Missing `doctrine-source`, `surface-blocks`, and `scorecard-report` groups are visible as evidence-package gaps in synthetic tests.
- Conditional absence is surfaced and can be documented as operator-pending, not-configured, self-skipped, or blocked when appropriate.
- Forbidden raw artifacts are filtered or safely flagged and do not count toward completeness.
- Safe run IDs and evidence paths remain navigable.
- Runbook / closeout template identify the completeness artifacts as closeout support.
- No final score is calculated.
- No hard stop is passed or failed by automation.
- No EV is finally marked captured by automation.
- No Phase 4 readiness claim is generated.
- No product UI runtime files are changed.
- No dependencies, lockfile, package metadata, SPFx manifest, or package solution files are changed.

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

The suggested next prompt should normally be:

```text
Prompt 03 — Report, Surface Blocks, and Doctrine Source Closeout Integration
```
