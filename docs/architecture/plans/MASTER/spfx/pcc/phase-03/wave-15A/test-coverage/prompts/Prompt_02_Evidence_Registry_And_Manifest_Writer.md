# Prompt 02 — PCC Evidence Registry and Manifest Writer

## Role

You are the local code agent implementing **Prompt 02** for the PCC 100-Point UI/UX Mold Breaker Scorecard evidence automation track in the `RMF112018/hb-intel` repository.

You are implementing the **evidence registry, manifest writer, markdown summary writer, and registry coverage guard only**. You are **not** running live tenant evidence capture, not calculating the final 100-point score, not producing final scorecard findings, and not modifying PCC runtime/source code.

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

---

## Critical Context

Prompt 01 established the PCC live SharePoint Playwright harness foundation:

```text
playwright.pcc-live.config.ts
e2e/pcc-live/pcc-live.env.ts
e2e/pcc-live/pcc-live.runtime.spec.ts
e2e/pcc-live/README.md
```

Prompt 01 also added opt-in root scripts:

```text
pcc:e2e:live:list
pcc:e2e:live
```

Prompt 02 must build on that foundation without changing PCC runtime code and without expanding live tenant execution.

The governing scorecard path is:

```text
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard_v2.md
```

The original Prompt 02 objective was:

```text
Implement evidence types, EV registry for all EV-37..EV-106 and EV-125..EV-134, artifact writer, manifest writer, markdown summary writer, and coverage guard that fails if any EV is missing from the manifest.
```

This updated prompt expands that objective into a safe, deterministic, repo-auditable implementation contract.

---

## Objective

Implement a typed PCC evidence registry and deterministic manifest/summary writer for the full required evidence set:

```text
EV-37 through EV-106, inclusive
EV-125 through EV-134, inclusive
```

Expected required evidence count:

```text
80 EV records
```

The implementation must:

1. Define evidence record types and status taxonomy.
2. Create a complete evidence registry for every required EV ID.
3. Create a deterministic JSON manifest writer.
4. Create a deterministic markdown summary writer.
5. Create a coverage guard test suite that fails on missing, duplicate, unexpected, or malformed EV records.
6. Preserve the evidence/scorecard boundary: this prompt produces traceability infrastructure only, not final scoring.
7. Keep curated evidence repo-visible after operator review and scrubbing.
8. Keep auth/session/raw Playwright artifacts out of git.

---

## Repo-Truth Gate Before Editing

Before editing, verify the current checkout has Prompt 01 harness files and the scorecard file.

Run/inspect:

```bash
git status --short
test -f playwright.pcc-live.config.ts
test -f e2e/pcc-live/pcc-live.env.ts
test -f e2e/pcc-live/pcc-live.runtime.spec.ts
test -f e2e/pcc-live/README.md
test -f docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard_v2.md
```

Also inspect current Prompt 01 documentation policy before implementing Prompt 02:

```bash
sed -n '1,260p' docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/test-coverage/prompts/Prompt_01_Playwright_Live_Harness_Auth_And_Safety.md
```

Stop and report if Prompt 01 documentation still instructs the agent to globally ignore curated PCC evidence directories such as:

```text
artifacts/pcc-live-evidence/
docs/architecture/evidence/pcc-live/
```

Prompt 02 depends on the corrected evidence posture:

- curated/sanitized evidence is repo-visible and commit-eligible after operator review;
- auth/session/raw Playwright artifacts remain local-only and ignored.

---

## Governing References

Use current repo truth from these references:

```text
docs/explanation/design-decisions/con-tech-ui-study.md
docs/explanation/design-decisions/con-tech-ux-study.md
docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md
docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard_v2.md
e2e/pcc-live/README.md
playwright.pcc-live.config.ts
e2e/pcc-live/pcc-live.env.ts
```

Use these only as needed. Do not perform broad, repetitive rescans.

Critical distinction:

```text
Automate evidence traceability and reproducibility.
Do not claim that the full 100-point score is automatically calculated.
Final scorecard scoring remains expert-review-only.
```

---

## Evidence Path Policy

Curated evidence must be repo-visible so fresh ChatGPT sessions can inspect it through the GitHub connector.

Preferred curated evidence path:

```text
docs/architecture/evidence/pcc-live/<run-id>/
```

Do **not** add this path to `.gitignore`.

Commit-eligible only after operator review/scrub:

```text
evidence manifests
markdown reports
JSON summaries
sanitized console/page-error summaries
screenshot inventories
scrubbed screenshots
```

Never commit:

```text
Playwright storageState files
tenant cookies/session data
raw traces/videos containing auth/session or tenant-sensitive data
raw test-results/
raw playwright-report/
unsanitized console dumps
secrets, tokens, cookies, personal data, or tenant auth context
```

Prompt 02 should define the writer path behavior, but it does not need to generate committed run artifacts unless the tests use temporary output and clean it up.

---

## Required Files To Add

Create these files unless repo truth shows equivalent files already exist:

```text
e2e/pcc-live/pcc-evidence.types.ts
e2e/pcc-live/pcc-evidence.registry.ts
e2e/pcc-live/pcc-evidence.manifest.ts
e2e/pcc-live/pcc-evidence.registry.spec.ts
```

Optionally add:

```text
docs/architecture/evidence/pcc-live/README.md
```

Do not create committed sample run artifacts in this prompt unless explicitly instructed by the operator. Tests should write only to temp output or Playwright-managed temp locations.

---

## Files Allowed To Modify

Allowed:

```text
e2e/pcc-live/pcc-evidence.types.ts
e2e/pcc-live/pcc-evidence.registry.ts
e2e/pcc-live/pcc-evidence.manifest.ts
e2e/pcc-live/pcc-evidence.registry.spec.ts
e2e/pcc-live/README.md
docs/architecture/evidence/pcc-live/README.md
package.json
```

`package.json` may be modified only if adding one opt-in registry validation script is materially useful.

Do not modify:

```text
apps/project-control-center/src/**
apps/project-control-center/package.json
apps/project-control-center/config/**
apps/project-control-center/src/webparts/**
pnpm-lock.yaml
playwright.config.ts
playwright.kudos-live.config.ts
playwright.homepage-live.config.ts
playwright.pcc-live.config.ts
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard_v2.md
docs/explanation/design-decisions/**
docs/reference/ui-kit/doctrine/**
packages/**
backend/**
```

Do not modify Prompt 01 files unless the repo-truth gate identifies stale evidence-policy drift and the operator has not already corrected it. If Prompt 01 drift remains, stop and report rather than silently changing it in Prompt 02.

---

## Required Evidence ID Coverage

The registry must include these required IDs:

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
EV-59
EV-60
EV-61
EV-62
EV-63
EV-64
EV-65
EV-66
EV-67
EV-68
EV-69
EV-70
EV-71
EV-72
EV-73
EV-74
EV-75
EV-76
EV-77
EV-78
EV-79
EV-80
EV-81
EV-82
EV-83
EV-84
EV-85
EV-86
EV-87
EV-88
EV-89
EV-90
EV-91
EV-92
EV-93
EV-94
EV-95
EV-96
EV-97
EV-98
EV-99
EV-100
EV-101
EV-102
EV-103
EV-104
EV-105
EV-106
EV-125
EV-126
EV-127
EV-128
EV-129
EV-130
EV-131
EV-132
EV-133
EV-134
```

The coverage guard must fail if:

```text
any required EV ID is missing
any duplicate EV ID exists
any unexpected EV ID is present
any record is missing required metadata
any record defaults to captured
EV-52 through EV-58 are marked captured
```

---

## Evidence Registry Requirements

Each EV registry record must include, at minimum:

```ts
id: PccEvidenceId;
title: string;
objective: string;
pillarRefs: PccScorecardPillarRef[];
hardStopRefs: PccHardStopRef[];
evidenceCategory: PccEvidenceCategory;
automationLevel: PccEvidenceAutomationLevel;
status: PccEvidenceStatus;
capturePhase: PccEvidenceCapturePhase;
requiredArtifacts: PccRequiredArtifact[];
reviewerNotes: string;
sourceRefs: PccEvidenceSourceRef[];
```

Field rules:

- `id` must be unique.
- `title` must be non-empty.
- `objective` must be non-empty.
- `pillarRefs` must be a non-empty array.
- `hardStopRefs` must exist on every record; it may be an empty array only when no hard-stop mapping applies.
- `evidenceCategory` must be from a typed enum/union.
- `automationLevel` must be from a typed enum/union.
- `status` must default to a non-captured state.
- `capturePhase` must indicate where or when the evidence should be captured.
- `requiredArtifacts` must exist on every record; it may be empty only for explicitly manual/expert-review evidence.
- `reviewerNotes` must exist on every record. It may default to an empty string.
- `sourceRefs` must include applicable governing docs, scorecard references, repo paths, or prompt references.

---

## Recommended Type Definitions

Define types in:

```text
e2e/pcc-live/pcc-evidence.types.ts
```

Use strongly typed unions/enums similar to:

```ts
export type PccEvidenceStatus =
  | 'not-started'
  | 'foundation-ready'
  | 'operator-pending'
  | 'captured'
  | 'review-required'
  | 'blocked'
  | 'not-applicable';

export type PccEvidenceAutomationLevel =
  | 'automated'
  | 'semi-automated'
  | 'manual-review'
  | 'operator-supplied';

export type PccEvidenceCapturePhase =
  | 'prompt-01-harness-foundation'
  | 'prompt-02-registry-and-manifest'
  | 'live-runtime-capture'
  | 'breakpoint-capture'
  | 'accessibility-capture'
  | 'state-capture'
  | 'source-review'
  | 'expert-review'
  | 'final-report';

export type PccEvidenceCategory =
  | 'governing-doctrine'
  | 'mold-breaker-study'
  | 'pcc-source'
  | 'visual-surface'
  | 'tenant-runtime'
  | 'breakpoint-container'
  | 'accessibility'
  | 'interaction-workflow'
  | 'state-model'
  | 'source-of-record'
  | 'content-language'
  | 'test-validation'
  | 'package-version'
  | 'hard-stop'
  | 'closure-reproducibility';

export type PccScorecardPillarRef =
  | 'P1'
  | 'P2'
  | 'P3'
  | 'P4'
  | 'P5'
  | 'P6'
  | 'P7'
  | 'P8'
  | 'P9';

export type PccHardStopRef =
  | 'HS-01'
  | 'HS-02'
  | 'HS-03'
  | 'HS-04'
  | 'HS-05'
  | 'HS-06'
  | 'HS-07'
  | 'HS-08'
  | 'HS-09'
  | 'HS-10';

export interface PccEvidenceSourceRef {
  type: 'scorecard' | 'doctrine' | 'study' | 'repo-path' | 'prompt' | 'test' | 'operator';
  ref: string;
  note?: string;
}

export interface PccRequiredArtifact {
  kind:
    | 'screenshot'
    | 'json-summary'
    | 'markdown-summary'
    | 'source-path'
    | 'test-output'
    | 'console-summary'
    | 'accessibility-summary'
    | 'operator-note'
    | 'review-note'
    | 'manifest-reference';
  description: string;
  requiredForCapturedStatus: boolean;
}

export interface PccEvidenceRecord {
  id: PccEvidenceId;
  title: string;
  objective: string;
  pillarRefs: PccScorecardPillarRef[];
  hardStopRefs: PccHardStopRef[];
  evidenceCategory: PccEvidenceCategory;
  automationLevel: PccEvidenceAutomationLevel;
  status: PccEvidenceStatus;
  capturePhase: PccEvidenceCapturePhase;
  requiredArtifacts: PccRequiredArtifact[];
  reviewerNotes: string;
  sourceRefs: PccEvidenceSourceRef[];
}
```

Define `PccEvidenceId` as a strict union or derive it from the required ID list with `as const`.

Do not use loose `string` for EV IDs if a strict union is practical.

---

## Evidence Status Rules

Default statuses:

- Most registry records should default to `not-started` or `operator-pending`.
- Prompt 01 harness foundation-related records may be `foundation-ready` only if the wording makes clear this is **not captured evidence**.
- EV-52 through EV-58 must **not** be `captured` in Prompt 02.
- No record should default to `captured`.

Use `captured` only when a later prompt produces reviewed, scrubbed, artifact-backed evidence.

---

## Manifest Writer Requirements

Implement manifest writer functions in:

```text
e2e/pcc-live/pcc-evidence.manifest.ts
```

The writer must create deterministic JSON and markdown output from:

```text
registry entries
run metadata
artifact references
package/version metadata when supplied
tenant/page URL metadata when supplied
```

Recommended exported functions:

```ts
export function createPccEvidenceManifest(input: CreatePccEvidenceManifestInput): PccEvidenceManifest;

export function writePccEvidenceManifest(input: WritePccEvidenceManifestInput): Promise<PccEvidenceManifestWriteResult>;

export function renderPccEvidenceMarkdownSummary(manifest: PccEvidenceManifest): string;

export function getPccEvidenceCoverage(registry: readonly PccEvidenceRecord[]): PccEvidenceCoverageResult;
```

Writer requirements:

1. Write `pcc-evidence-manifest.json` to the provided output directory.
2. Write `pcc-evidence-summary.md` to the provided output directory.
3. Create the output directory if it does not exist.
4. Sort EV records deterministically by EV number.
5. Include all EV IDs in output.
6. Include missing, duplicate, unexpected, and malformed record summaries.
7. Include status counts.
8. Include hard-stop mapping summary.
9. Include artifact references when supplied.
10. Include a clear warning if any EV is missing or not captured.
11. Include the statement:

```text
This manifest is evidence traceability only. It is not a final 100-point scorecard result.
```

The writer must never write:

```text
storageState contents
cookies
tokens
raw traces
raw videos
raw HARs
unsanitized console dumps
auth/session context
```

Artifact references must be path references only. Do not inline binary or secret-bearing content.

---

## Manifest Metadata Requirements

The manifest should support run metadata similar to:

```ts
export interface PccEvidenceRunMetadata {
  runId: string;
  generatedAtIso: string;
  repoCommit?: string;
  packageVersion?: string;
  expectedPackageVersion?: string;
  tenantSiteUrl?: string;
  tenantPageUrl?: string;
  evidenceOutputDir: string;
  generatedBy: 'pcc-live-playwright-harness';
  prompt: 'Prompt 02 — Evidence Registry and Manifest Writer';
}
```

Do not require live tenant env for Prompt 02 tests. Tests may pass mock metadata.

---

## Markdown Summary Requirements

The markdown summary must include:

```text
run ID
generated timestamp
repo commit if supplied
package/version if supplied
tenant site/page URL if supplied
total EV count
required EV count
missing EV IDs
duplicate EV IDs
unexpected EV IDs
EV status counts
hard-stop mapping summary
artifact path summary
warnings
not-final-scoring disclaimer
```

The summary should be readable by a fresh ChatGPT session using the GitHub connector.

---

## Coverage Guard Test Requirements

Create tests in:

```text
e2e/pcc-live/pcc-evidence.registry.spec.ts
```

Tests must not require live tenant env, storageState, or live SharePoint access.

Required assertions:

1. Registry contains exactly 80 records.
2. Registry contains every EV ID from EV-37 through EV-106 and EV-125 through EV-134.
3. Registry contains no duplicate IDs.
4. Registry contains no unexpected IDs.
5. Every record has required fields.
6. Every record has non-empty `pillarRefs`.
7. Every record has `hardStopRefs`.
8. Every record has `reviewerNotes`.
9. Every record has `sourceRefs`.
10. Every record has `requiredArtifacts`.
11. No record defaults to `captured`.
12. EV-52 through EV-58 are not marked `captured`.
13. Coverage helper reports zero missing/duplicate/unexpected IDs for the registry.
14. Manifest creator includes all EV IDs.
15. Manifest writer writes JSON and markdown outputs to a temporary directory.
16. Markdown summary includes the not-final-scoring disclaimer.
17. Written JSON can be parsed back and contains the same EV count.
18. Writer output does not include storageState/cookie/token keys from test metadata.

Use Node temp directory APIs for writer tests, such as:

```ts
fs.mkdtempSync(path.join(os.tmpdir(), 'pcc-evidence-'))
```

Clean up temp directories after tests where practical.

---

## Registry Content Guidance

Do not invent final evidence results.

Registry records should define what evidence is needed and how it maps to scorecard pillars/hard stops.

Recommended grouping:

### EV-37 through EV-51 — Source, doctrine, scorecard, and registry foundations

Use categories such as:

```text
governing-doctrine
mold-breaker-study
pcc-source
test-validation
closure-reproducibility
```

### EV-52 through EV-58 — Live SharePoint hosted runtime and package/version evidence

Use categories such as:

```text
tenant-runtime
package-version
test-validation
```

These may be `foundation-ready` or `operator-pending`, but not `captured`.

### EV-59 through EV-106 — Surface, breakpoint, state, accessibility, workflow, source-of-record, HBI, and hard-stop evidence

Use categories such as:

```text
visual-surface
breakpoint-container
accessibility
interaction-workflow
state-model
source-of-record
content-language
hard-stop
```

### EV-125 through EV-134 — Final closure, reproducibility, and Phase 4 readiness evidence

Use categories such as:

```text
closure-reproducibility
hard-stop
test-validation
```

Each record must have a meaningful title/objective and useful required artifact descriptions.

---

## Optional Root Script

If materially useful, add this root script:

```json
"pcc:e2e:evidence:registry": "playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-evidence.registry.spec.ts"
```

Do not wire it into:

```text
test
e2e
build
CI
Turbo defaults
```

Do not modify `pnpm-lock.yaml`.

If `package.json` is not changed, omit it from the files changed and validation scope.

---

## README Update Requirements

Update `e2e/pcc-live/README.md` only if needed to document Prompt 02 registry/manifest usage.

If updated, add a concise section covering:

```text
registry purpose
manifest writer purpose
preferred curated evidence output path
evidence is traceability, not final scorecard scoring
how to run the registry validation test
```

Do not remove Prompt 01 safety posture.

---

## Optional Evidence README

If adding:

```text
docs/architecture/evidence/pcc-live/README.md
```

Keep it concise and include:

```text
purpose of curated evidence folder
operator review/scrub requirement
commit-eligible artifact examples
never-commit artifact examples
not-final-scoring disclaimer
```

Do not add any actual run artifacts in Prompt 02.

---

## Validation Commands

Run and report:

```bash
git status --short
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-evidence.registry.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
pnpm exec prettier --check --ignore-unknown e2e/pcc-live docs/architecture/evidence/pcc-live package.json
git diff --check
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
```

If `package.json` is not changed, it is acceptable to omit `package.json` from the Prettier target.

If `docs/architecture/evidence/pcc-live` is not created, omit it from the Prettier target.

---

## Acceptance Criteria

Prompt 02 is complete only when:

- All 80 required EV IDs are represented.
- No duplicate EV IDs exist.
- No unexpected EV IDs exist.
- Required metadata exists on every registry record.
- `pillarRefs`, `hardStopRefs`, and `reviewerNotes` exist on every registry record.
- No registry record defaults to `captured`.
- EV-52 through EV-58 are not marked `captured`.
- Manifest creator includes all registry records.
- Manifest writer produces JSON and markdown summary in a provided output directory.
- Markdown summary includes the not-final-scoring disclaimer.
- Registry/writer tests pass without live tenant env.
- Curated evidence path remains repo-visible and is not ignored.
- No auth/session/raw Playwright artifacts are committed.
- No PCC runtime/source files are modified.
- `pnpm-lock.yaml` is unchanged.
- No final 100-point score is calculated or implied.

---

## Stop Conditions

Stop and report instead of continuing if:

- Prompt 01 doc-drift correction is not visible in the local branch.
- The scorecard file is missing.
- Existing registry/writer files conflict with this design and require migration decisions.
- Implementation requires PCC runtime source edits.
- `pnpm-lock.yaml` changes.
- Writer/test logic would serialize secrets, cookies, storageState, raw traces, raw videos, or unsanitized console output.
- Writer/test logic attempts live tenant execution.
- Curated evidence paths are added to `.gitignore`.

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
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-evidence.registry.spec.ts` — <result>
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts --list` — <result>
- `pnpm exec prettier --check --ignore-unknown e2e/pcc-live docs/architecture/evidence/pcc-live package.json` — <result or adjusted command with reason>
- `git diff --check` — <result>
- `pnpm --filter @hbc/spfx-project-control-center check-types` — <result>
- `pnpm --filter @hbc/spfx-project-control-center test` — <result>

Evidence / scorecard impact:
- Registry coverage for EV-37..EV-106 and EV-125..EV-134.
- Manifest/writer foundation only.
- No EV item marked captured unless backed by reviewed artifact output.
- No final 100-point score calculated.

Safety confirmation:
- No tenant mutation.
- No live tenant run required.
- No storageState committed.
- No raw Playwright artifacts committed.
- No PCC runtime source modified.
- `pnpm-lock.yaml` unchanged.

Residual risks or pending items:
- <items>
```
