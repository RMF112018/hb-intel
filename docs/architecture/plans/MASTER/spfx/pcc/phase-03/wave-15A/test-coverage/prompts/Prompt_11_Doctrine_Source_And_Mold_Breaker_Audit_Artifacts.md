# Prompt 11 — PCC Doctrine, Source, and Mold Breaker Audit Artifacts

## Role

You are the local code agent implementing **Prompt 11** for the Project Control Center (PCC) 100-Point UI/UX Mold Breaker Scorecard evidence automation track in the `RMF112018/hb-intel` repository.

You are implementing **repo-source and governing-document audit tooling** that generates deterministic, sanitized, review-support artifacts for doctrine traceability, PCC source indexing, and Mold Breaker comparison review.

You are **not** calculating a final score, not marking EVs captured, not marking hard stops passed/failed, not claiming 56/56 or Phase 4 readiness, not editing PCC runtime/source code, not modifying tenant data, and not committing generated evidence artifacts automatically.

Do not re-read files that are still within your current context or memory unless you need exact edit context or the file may have changed.

---

## Critical Context

Prompt 01 established the PCC live Playwright harness.

Prompt 02 established the evidence registry and manifest writer.

Prompt 03 established scorecard pillar/hard-stop traceability.

Prompt 04 established safe live page-object navigation, HTTPS enforcement, expected origin/hostname boundary checks, and sanitized runtime smoke posture.

Prompt 05 established screenshot and DOM summary evidence support.

Prompt 06 established breakpoint/container/overflow/rowspan/touch evidence support.

Prompt 07 established accessibility/Axe/keyboard/focus/ARIA evidence support.

Prompt 08 established workflow/action/source/state/HBI/false-affordance evidence support for `EV-83..EV-106`.

Prompt 09 established conditional edit-mode, high-zoom, short-height, drawer/modal, unauthorized, and special-state evidence support.

Prompt 10 established visible-copy/content-language/source/HBI authority review support for `EV-83..EV-106`, with the corrective follow-up that hidden DOM text must not be persisted as visible-copy evidence.

The original Prompt 11 objective was:

```text
Implement source/doc audit tooling and generated markdown templates. Verify governing docs, index PCC source files, map doctrine conformance, and generate Mold Breaker comparison artifacts tied to con-tech UI/UX studies. Mark final judgments expert-review-required.
```

This replacement prompt expands that objective into a safe, deterministic, repo-auditable implementation contract.

---

## Governing References

Use current repo truth from these references:

```text
docs/explanation/design-decisions/con-tech-ui-study.md
docs/explanation/design-decisions/con-tech-ux-study.md
docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md
docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard_v2.md
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/test-coverage/docs/05_DOCTRINE_SOURCE_AND_MOLD_BREAKER_AUDIT_STRATEGY.md
e2e/pcc-live/pcc-evidence.types.ts
e2e/pcc-live/pcc-evidence.registry.ts
e2e/pcc-live/pcc-scorecard.traceability.ts
e2e/pcc-live/pcc-live.workflow.types.ts
e2e/pcc-live/pcc-live.content.types.ts
e2e/pcc-live/pcc-live.conditional.types.ts
```

Important distinction:

```text
Generate evidence support, source indexes, doctrine maps, and expert-review templates.
Do not calculate the final score.
Do not mark EVs captured.
Do not mark hard stops passed or failed.
Do not claim 56/56, 100/100, Phase 4 readiness, or mold-breaker compliance as final.
```

---

## Repo-Truth Gate Before Editing

Before editing, verify the current checkout has Prompt 01–10 foundation.

Run or inspect enough to confirm:

```bash
git status --short
test -f e2e/pcc-live/pcc-evidence.types.ts
test -f e2e/pcc-live/pcc-evidence.registry.ts
test -f e2e/pcc-live/pcc-scorecard.traceability.ts
test -f e2e/pcc-live/pcc-live.workflow.types.ts
test -f e2e/pcc-live/pcc-live.content.types.ts
test -f e2e/pcc-live/pcc-live.conditional.types.ts
test -f docs/explanation/design-decisions/con-tech-ui-study.md
test -f docs/explanation/design-decisions/con-tech-ux-study.md
test -f docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md
test -f docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md
test -f docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard_v2.md
```

Stop and report if:

- any Prompt 01–10 foundation file is missing;
- the governing documents listed above are missing;
- existing Prompt 11 doctrine/source files already exist and conflict with this design;
- implementation appears to require PCC runtime/source edits;
- implementation would require Playwright config, `.gitignore`, dependency, package, or lockfile changes;
- implementation would require committing generated evidence output artifacts;
- implementation would require scanning secrets/auth/session artifacts.

---

## Objective

Implement Prompt 11 doctrine/source/Mold Breaker audit tooling that can:

1. Verify the presence and basic structure of governing documents.
2. Index selected PCC source and evidence-support files in a deterministic, metadata-only way.
3. Map source files and governing documents to doctrine-review categories.
4. Generate review-support markdown artifacts for:
   - doctrine conformance;
   - source file index;
   - primitive/source review;
   - surface/source review;
   - state/source review;
   - test-coverage review;
   - package-version proof;
   - Mold Breaker comparison;
   - incumbent failure-mode mapping;
   - cognitive-load review;
   - progressive-disclosure review;
   - field/office continuity review.
5. Tie artifacts to initial source/doc evidence support for:
   - `EV-37..EV-43` governing doctrine traceability;
   - `EV-44..EV-51` Mold Breaker / con-tech UI/UX study alignment;
   - `EV-52..EV-58` tenant/runtime/source/package evidence support where source-review applicable.
6. Mark all judgments as `expert-review-required`, `review-support`, `source-present`, `source-missing`, or `not-observed`; never final pass/fail.
7. Write deterministic sanitized outputs under a provided output directory.
8. Preserve review boundaries:
   - evidence output is operator/expert-review pending;
   - no EV registry status changes;
   - no final score;
   - no hard-stop pass/fail decisions;
   - no runtime changes.

---

## Required Files To Add

Create these files unless repo truth shows equivalent files already exist:

```text
e2e/pcc-live/pcc-live.doctrine-source.types.ts
e2e/pcc-live/pcc-live.doctrine-source-capture.ts
e2e/pcc-live/pcc-live.doctrine-source-writer.ts
e2e/pcc-live/pcc-live.doctrine-source.spec.ts
```

Do not add a package script unless a direct blocker makes it necessary. The default expectation is **no `package.json` change**.

Do not create committed live/source audit evidence artifacts in this prompt. Evidence artifacts should be generated only by tests or an intentionally run audit and remain uncommitted until operator review.

---

## Files Allowed To Modify

Allowed:

```text
e2e/pcc-live/pcc-live.doctrine-source.types.ts
e2e/pcc-live/pcc-live.doctrine-source-capture.ts
e2e/pcc-live/pcc-live.doctrine-source-writer.ts
e2e/pcc-live/pcc-live.doctrine-source.spec.ts
```

Do not modify:

```text
apps/project-control-center/src/**
apps/project-control-center/package.json
apps/project-control-center/config/**
apps/project-control-center/src/webparts/**
packages/**
backend/**
docs/reference/**
docs/explanation/**
docs/architecture/**
e2e/pcc-live/pcc-evidence*.ts
e2e/pcc-live/pcc-scorecard*.ts
e2e/pcc-live/pcc-live.env.ts
e2e/pcc-live/pcc-live.page-object.ts
e2e/pcc-live/pcc-live.surfaces.ts
e2e/pcc-live/pcc-live.workflow*.ts
e2e/pcc-live/pcc-live.conditional*.ts
e2e/pcc-live/pcc-live.content*.ts
playwright*.config.ts
package.json
pnpm-lock.yaml
.gitignore
```

Reading those files is allowed when required by the audit. Editing them is not allowed.

If a forbidden file appears necessary to change, stop and report instead of editing.

---

## Required EV Scope

Prompt 11 creates initial doctrine/source/Mold Breaker audit support artifacts for:

```text
EV-37
EV-38
EV-39
EV-40
EV-41
EV-42
EV-43
EV-44
EV-45
EV-46
EV-47
EV-48
EV-49
EV-50
EV-51
EV-52
EV-53
EV-54
EV-55
EV-56
EV-57
EV-58
```

Define a strict tuple:

```ts
export const PCC_DOCTRINE_SOURCE_EVIDENCE_IDS = [
  'EV-37',
  'EV-38',
  'EV-39',
  'EV-40',
  'EV-41',
  'EV-42',
  'EV-43',
  'EV-44',
  'EV-45',
  'EV-46',
  'EV-47',
  'EV-48',
  'EV-49',
  'EV-50',
  'EV-51',
  'EV-52',
  'EV-53',
  'EV-54',
  'EV-55',
  'EV-56',
  'EV-57',
  'EV-58',
] as const;
```

Add compile-time guards:

- tuple length is `22`;
- tuple is unique;
- tuple IDs are assignable to `PccEvidenceId`;
- ID union does not widen to `string`.

Do not include `EV-59..EV-106` in the Prompt 11 tuple. Those are already covered by Prompts 06–10. Prompt 11 may reference those files as source context, but its EV support scope is `EV-37..EV-58`.

Use disposition wording such as:

```text
review-support
source-present
source-missing
not-observed
expert-review-required
operator-review-pending
```

Do not use disposition wording such as:

```text
captured
passed
approved
complete
score-ready
Phase 4 ready
hard stop passed
hard stop failed
56/56
100/100
mold breaker achieved
```

---

## Source Areas To Index

Index only the following repo areas:

```text
apps/project-control-center/src/shell/
apps/project-control-center/src/layout/
apps/project-control-center/src/surfaces/
apps/project-control-center/src/ui/
apps/project-control-center/src/tests/
apps/project-control-center/config/
tools/spfx-shell/config/
e2e/pcc-live/
docs/architecture/blueprint/sp-project-control-center/
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/test-coverage/
```

For source file index traversal:

- include extensions: `.ts`, `.tsx`, `.js`, `.jsx`, `.json`, `.md`, `.css`, `.scss`;
- exclude: `node_modules`, `dist`, `build`, `coverage`, `temp`, `.next`, `.turbo`, `.git`, `playwright-report`, `test-results`, auth/session/storage directories, generated evidence directories;
- cap indexed files per source area to a reasonable deterministic limit, such as 500;
- sort paths alphabetically;
- record missing source areas as `source-missing`, not failure;
- do not read or serialize binary files;
- do not serialize full file contents.

For each indexed file, record metadata only:

```ts
path
sourceArea
extension
kind
exists
sizeBytes
lineCount
sha256
firstRelevantLineNumbers?
boundedSignalSnippets?
detectedMarkers
reviewDisposition
```

`boundedSignalSnippets` must be sanitized and short, for example max 160 characters per snippet and max 3 snippets per file. Prefer marker/snippet evidence such as lines containing `data-pcc-`, `PccDashboardCard`, `PccBentoGrid`, `PccHorizontalTabs`, `role=`, `aria-`, `source of record`, `HBI`, `read-only`, `preview`, `mock`, `fixture`, `scorecard`, or `mold breaker`.

Do not persist raw full source files.

---

## Governing Document Verification

Verify these required governing documents:

```text
docs/explanation/design-decisions/con-tech-ui-study.md
docs/explanation/design-decisions/con-tech-ux-study.md
docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md
docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard_v2.md
```

For each, record:

```ts
path
exists
sizeBytes
lineCount
sha256
detectedHeadings
requiredReferenceRole
reviewDisposition
notes
```

Do not copy large sections. Store only detected headings and short sanitized snippets where needed.

---

## Doctrine Categories

Map indexed source/doc evidence to these doctrine categories:

```text
shell-host-fit
navigation-orientation
bento-card-hierarchy
responsive-container-discipline
accessibility-semantics
state-feedback
source-of-record-boundary
hbi-authority-boundary
external-launch-boundary
approval-mutation-boundary
content-language-quality
mold-breaker-differentiation
test-coverage-evidence
package-version-evidence
```

Every category should be present in output, even if the disposition is `not-observed` or `expert-review-required`.

---

## Mold Breaker Review Themes

Generate Mold Breaker review artifacts tied to the con-tech UI/UX studies using these themes:

```text
incumbent failure mode contrast
cognitive load reduction
progressive disclosure
field-office continuity
source clarity and confidence
role/action clarity
PWA/live-runtime resilience
mold-breaker differentiation
```

For each theme, output:

```text
theme
related EV IDs
related scorecard pillars or hard stops if known
supporting governing docs
supporting source areas
observed source signals
expert review questions
review disposition
```

Do not claim the PCC has achieved Mold Breaker status. Mark final judgment as `expert-review-required`.

---

## Required Types Module

Create:

```text
e2e/pcc-live/pcc-live.doctrine-source.types.ts
```

Required exports:

```ts
export const PCC_DOCTRINE_SOURCE_EVIDENCE_IDS = [...] as const;
export type PccDoctrineSourceEvidenceId = (typeof PCC_DOCTRINE_SOURCE_EVIDENCE_IDS)[number];

export type PccDoctrineSourceRunState =
  | 'completed'
  | 'self-skipped'
  | 'operator-review-pending'
  | 'writer-test-only';

export type PccDoctrineSourceDisposition =
  | 'review-support'
  | 'source-present'
  | 'source-missing'
  | 'not-observed'
  | 'expert-review-required'
  | 'operator-review-pending';

export type PccDoctrineCategory =
  | 'shell-host-fit'
  | 'navigation-orientation'
  | 'bento-card-hierarchy'
  | 'responsive-container-discipline'
  | 'accessibility-semantics'
  | 'state-feedback'
  | 'source-of-record-boundary'
  | 'hbi-authority-boundary'
  | 'external-launch-boundary'
  | 'approval-mutation-boundary'
  | 'content-language-quality'
  | 'mold-breaker-differentiation'
  | 'test-coverage-evidence'
  | 'package-version-evidence';

export type PccMoldBreakerTheme =
  | 'incumbent-failure-mode-contrast'
  | 'cognitive-load-reduction'
  | 'progressive-disclosure'
  | 'field-office-continuity'
  | 'source-clarity-and-confidence'
  | 'role-action-clarity'
  | 'pwa-live-runtime-resilience'
  | 'mold-breaker-differentiation';

export interface PccGoverningDocVerification {
  path: string;
  exists: boolean;
  sizeBytes: number;
  lineCount: number;
  sha256?: string;
  detectedHeadings: string[];
  requiredReferenceRole:
    | 'con-tech-ui-study'
    | 'con-tech-ux-study'
    | 'ui-doctrine'
    | 'acceptance-scoring-model'
    | 'pcc-scorecard';
  reviewDisposition: PccDoctrineSourceDisposition;
  notes: string[];
}

export interface PccSourceFileIndexEntry {
  path: string;
  sourceArea: string;
  extension: string;
  kind:
    | 'shell'
    | 'layout'
    | 'surface'
    | 'ui'
    | 'test'
    | 'config'
    | 'tool-config'
    | 'evidence-tooling'
    | 'blueprint-doc'
    | 'planning-doc'
    | 'unknown';
  exists: boolean;
  sizeBytes: number;
  lineCount: number;
  sha256?: string;
  detectedMarkers: string[];
  boundedSignalSnippets: string[];
  reviewDisposition: PccDoctrineSourceDisposition;
}

export interface PccDoctrineConformanceItem {
  category: PccDoctrineCategory;
  relatedEvidenceIds: readonly PccEvidenceId[];
  supportingDocPaths: string[];
  supportingSourcePaths: string[];
  observedSignals: string[];
  missingSignals: string[];
  expertReviewQuestions: string[];
  reviewDisposition: PccDoctrineSourceDisposition;
}

export interface PccMoldBreakerReviewItem {
  theme: PccMoldBreakerTheme;
  relatedEvidenceIds: readonly PccEvidenceId[];
  supportingDocPaths: string[];
  supportingSourceAreas: string[];
  observedSignals: string[];
  incumbentFailureModeContrast: string;
  expertReviewQuestions: string[];
  reviewDisposition: PccDoctrineSourceDisposition;
}

export interface PccPackageVersionProof {
  packageSolutionPath?: string;
  manifestPaths: string[];
  detectedVersions: string[];
  packageNameSignals: string[];
  reviewDisposition: PccDoctrineSourceDisposition;
  notes: string[];
}

export interface PccDoctrineSourceEvidenceRun {
  runId: string;
  generatedAtIso: string;
  tenantSiteUrl: string;
  repoRootLabel: string;
  selfSkipped: boolean;
  runState: PccDoctrineSourceRunState;
  evRefs: readonly PccEvidenceId[];
  governingDocs: PccGoverningDocVerification[];
  sourceIndex: PccSourceFileIndexEntry[];
  doctrineConformance: PccDoctrineConformanceItem[];
  moldBreakerReview: PccMoldBreakerReviewItem[];
  packageVersionProof: PccPackageVersionProof;
  summary: {
    governingDocCount: number;
    missingGoverningDocCount: number;
    indexedSourceFileCount: number;
    missingSourceAreaCount: number;
    doctrineCategoryCount: number;
    moldBreakerThemeCount: number;
    expertReviewRequiredCount: number;
    warningCount: number;
  };
  warnings: string[];
  disclaimer: string;
}
```

You may add helper types if useful, but keep the model metadata-only and sanitized.

---

## Capture Module

Create:

```text
e2e/pcc-live/pcc-live.doctrine-source-capture.ts
```

Required behavior:

1. Accept:
   - repo root path, defaulting to `process.cwd()`;
   - optional run ID;
   - optional source area caps.
2. Verify governing docs.
3. Index allowed source areas only.
4. Detect source/doc markers without persisting full file contents.
5. Build doctrine conformance items for every doctrine category.
6. Build Mold Breaker review items for every Mold Breaker theme.
7. Build package version proof from existing SPFx package/manifest files where present.
8. Return a `PccDoctrineSourceEvidenceRun`-compatible payload excluding `summary` and `disclaimer`, or return enough structured data for the writer to complete the run.

Sanitization rules:

- Strip query strings.
- Redact email addresses.
- Redact phone numbers.
- Redact token/blob-like values.
- Redact raw HTML.
- Redact raw Playwright artifact paths.
- Redact storage/auth/session/cookie/token/secrets terms.
- Redact claim phrases:
  - `hard stop passed`
  - `hard stop failed`
  - `score-ready`
  - `Phase 4 ready`
  - `56/56 achieved`
  - `100/100`
  - `mold breaker achieved`
- Do not persist full source text.
- Do not persist raw file paths from outside the allowed repo-relative source areas.
- Do not inspect storageState/auth/session files.

Source marker examples:

```text
data-pcc-
PccDashboardCard
PccBentoGrid
PccHorizontalTabs
data-pcc-active-surface-panel
role=
aria-
PCC_RESPONSIVE_THRESHOLDS_PX
FOOTPRINT_COLUMN_SPANS
source of record
system of record
source-confidence
HBI
command search
read-only
preview
deferred
blocked
degraded
mock
fixture
Playwright
axe
keyboard
scorecard
mold breaker
```

All marker snippets must be bounded and sanitized.

---

## Writer Module

Create:

```text
e2e/pcc-live/pcc-live.doctrine-source-writer.ts
```

Required output files under the provided output directory:

```text
pcc-live-doctrine-source-evidence.json
pcc-live-doctrine-source-evidence.md
governing-doc-verification.json
source-file-index.json
source-file-index.md
doctrine-conformance-map.json
doctrine-conformance-map.md
mold-breaker-review.md
incumbent-failure-mode-map.md
cognitive-load-review.md
progressive-disclosure-review.md
field-office-continuity-review.md
primitive-source-review.md
surface-source-review.md
state-source-review.md
test-coverage-review.md
package-version-proof.md
```

Required disclaimer:

```text
This output is doctrine, source, and Mold Breaker review support for EV-37 through EV-58 only. It is not a final scorecard result, does not mark any EV captured, and does not mark any hard stop passed or failed.
```

Markdown artifacts must include:

```text
run ID
generated timestamp
tenant target
EV refs
summary counts
operator/expert-review reminder
not-final-scoring disclaimer
related governing docs
related source areas
review questions
expert-review-required final judgment
```

Do not include long source excerpts. Use path lists, counts, bounded snippets, and expert-review questions.

---

## Spec Module

Create:

```text
e2e/pcc-live/pcc-live.doctrine-source.spec.ts
```

Required tests:

### 1. Doctrine/source EV tuple is valid

Assert:

- tuple equals `EV-37..EV-58`;
- length is 22;
- every ID exists in `REQUIRED_PCC_EVIDENCE_IDS`;
- no duplicate IDs;
- no EV outside Prompt 11 scope.

### 2. Governing document verification detects required docs

Run against the current repo.

Assert:

- all five governing docs are present;
- each has line count > 0;
- each has at least one detected heading or content signal;
- no final scoring/hard-stop pass/fail language is emitted.

### 3. Source index is bounded and metadata-only

Run against the current repo.

Assert:

- allowed source areas are represented as present or source-missing;
- indexed file paths are repo-relative and within allowed source areas;
- no full file content is serialized;
- `node_modules`, `test-results`, `playwright-report`, `.auth`, storageState, and generated evidence paths are excluded;
- marker snippets are bounded;
- no forbidden claim terms are emitted.

### 4. Writer produces all expected artifacts with sanitized output

Use a temp directory and synthetic run data containing unsafe strings.

Assert all expected JSON/Markdown files exist and do not contain:

```text
email address
phone number
token-like blob
query string
raw HTML
storageState
cookie
token
session
.auth
test-results
playwright-report
trace.zip
video.webm
network.har
hard stop passed
hard stop failed
score-ready
Phase 4 ready
56/56 achieved
100/100
mold breaker achieved
"captured"
```

Assert disclaimer appears.

### 5. Doctrine categories and Mold Breaker themes are complete

Assert:

- every `PccDoctrineCategory` has one conformance item;
- every `PccMoldBreakerTheme` has one review item;
- each item has related EV IDs;
- each item has expert-review questions;
- each item has review disposition that is not final pass/fail.

### 6. Package version proof is review-support only

Assert:

- package/manifest version signals are recorded when files exist;
- missing files are recorded as source-missing or expert-review-required;
- no version proof claims package readiness, deployment success, or Phase 4 readiness.

### 7. Real repo source/doc audit can write outputs to temp directory

Run capture + writer against current repo and temp output dir.

Assert:

- output files exist;
- summary counts are deterministic enough for test expectations, for example `governingDocCount === 5` and indexed source count > 0;
- outputs do not include forbidden strings;
- outputs include expert-review-required language.

---

## Validation Commands

Run and report:

```bash
git status --short
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.doctrine-source.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.content.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.conditional.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.workflow.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.accessibility.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.breakpoint.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.screenshot.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.surface-smoke.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-evidence.registry.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-scorecard.traceability.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
pnpm exec prettier --check --ignore-unknown e2e/pcc-live
git diff --check
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm install --frozen-lockfile
```

If `pnpm install --frozen-lockfile` is blocked by host authorization policy, report it as an environment validation exception exactly as in Prompts 09 and 10.

Do not run or commit generated evidence artifacts outside temp output unless the user explicitly authorizes it.

---

## Acceptance Criteria

Prompt 11 is complete only when:

- strict `EV-37..EV-58` tuple exists and validates;
- doctrine/source capture module exists;
- doctrine/source writer module exists;
- doctrine/source spec exists;
- governing docs are verified;
- PCC source areas are indexed within allowed boundaries;
- source index is metadata-only and bounded;
- doctrine conformance map includes all required categories;
- Mold Breaker review includes all required themes;
- package version proof is review-support only;
- writer produces all required JSON/Markdown artifacts in tests;
- outputs exclude unsafe raw/auth/session/DOM/full-source content;
- no final score is calculated or implied;
- no EV is marked captured;
- no hard stop is marked passed/failed;
- no PCC runtime/source files are modified;
- no generated evidence artifacts are staged/committed automatically;
- Prompt 10 content tests still pass;
- Prompt 09 conditional tests still pass;
- Prompt 08 workflow tests still pass;
- Prompt 07 accessibility tests still pass;
- Prompt 06 breakpoint tests still pass;
- Prompt 05 screenshot tests still pass;
- Prompt 04 surface smoke tests still pass;
- Prompt 02 registry tests still pass;
- Prompt 03 traceability tests still pass;
- `pnpm-lock.yaml` is unchanged.

---

## Stop Conditions

Stop and report instead of continuing if:

- Prompt 01–10 foundation files are missing;
- governing documents are missing;
- existing Prompt 11 files conflict with this design;
- implementation requires PCC runtime/source edits;
- implementation requires Playwright config edits;
- implementation requires `.gitignore` changes;
- implementation requires dependency, package, or lockfile changes;
- implementation would need to scan or serialize secrets/auth/session/storageState artifacts;
- implementation would serialize full source files or long source excerpts;
- implementation would commit generated evidence artifacts;
- implementation attempts final score calculation;
- implementation attempts hard-stop pass/fail decisions;
- implementation marks EVs captured.

---

## Required Closeout Response

Return exactly this structure:

```markdown
Prompt completed.

Files changed:
- <path>
- <path>

Validation:
- `git status --short` — <result>
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.doctrine-source.spec.ts` — <result>
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.content.spec.ts` — <result>
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.conditional.spec.ts` — <result>
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.workflow.spec.ts` — <result>
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.accessibility.spec.ts` — <result>
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.breakpoint.spec.ts` — <result>
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.screenshot.spec.ts` — <result>
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.surface-smoke.spec.ts` — <result>
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-evidence.registry.spec.ts` — <result>
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-scorecard.traceability.spec.ts` — <result>
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts --list` — <result>
- `pnpm exec prettier --check --ignore-unknown e2e/pcc-live` — <result>
- `git diff --check` — <result>
- `pnpm --filter @hbc/spfx-project-control-center check-types` — <result>
- `pnpm --filter @hbc/spfx-project-control-center test` — <result>
- `pnpm install --frozen-lockfile` — <result or environment validation exception>

Evidence / scorecard impact:
- Doctrine/governing document verification tooling established.
- PCC source file index tooling established.
- Doctrine conformance map tooling established.
- Mold Breaker comparison review artifacts established.
- Incumbent failure-mode review artifact established.
- Cognitive-load review artifact established.
- Progressive-disclosure review artifact established.
- Field/office continuity review artifact established.
- Package-version proof artifact established.
- Initial EV-37 through EV-58 doctrine/source/Mold Breaker evidence support established.
- Evidence remains operator/expert-review pending.
- No final 100-point score calculated.
- No hard stop marked passed/failed.

Safety confirmation:
- No tenant mutation.
- No storageState path/content committed.
- No raw Playwright artifacts committed.
- No raw console dumps committed.
- No raw DOM HTML committed.
- No full source files or long source excerpts committed.
- No doctrine/source evidence artifacts staged/committed automatically.
- No PCC runtime source modified.
- `pnpm-lock.yaml` unchanged.
- No EV marked captured.

Residual risks or pending items:
- <items>
```
