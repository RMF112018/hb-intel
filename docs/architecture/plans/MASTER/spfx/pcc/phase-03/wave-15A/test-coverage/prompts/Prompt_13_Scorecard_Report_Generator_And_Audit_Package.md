# Prompt 13 — Scorecard Report Generator and Audit Package

## Context

Use current repo truth. Do not re-read files that are still in current context unless exact edit context is required or a file may have changed.

Tenant target for metadata only:

```text
https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject
```

Governing documents:

```text
docs/explanation/design-decisions/con-tech-ui-study.md
docs/explanation/design-decisions/con-tech-ux-study.md
docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md
docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard_v2.md
```

Prompt 13 follows Prompts 00–12. Existing `e2e/pcc-live` lanes now provide evidence registry, scorecard traceability, live runtime/surface/screenshot evidence, breakpoint evidence, accessibility evidence, workflow/source/state evidence, conditional evidence, content/language evidence, doctrine/source/Mold Breaker evidence, and surface/primitive evidence blocks.

The package manifest identifies Prompt 13 as:

```text
Prompt_13_Scorecard_Report_Generator_And_Audit_Package.md
```

Prompt 13 is **not** a scoring prompt. It must generate a draft scorecard report and audit package for expert review. It must not calculate or assert final scorecard points.

Critical distinction:

- Automate report assembly, evidence traceability, audit package generation, and expert-review worksheet preparation.
- Do **not** calculate a final 100-point score.
- Do **not** mark any EV captured unless the existing registry already marks it and the report labels that as registry status only.
- Do **not** mark any hard stop passed or failed.
- Do **not** claim 56/56, 100/100, Phase 4 readiness, Mold Breaker achievement, or deployment readiness.
- Final score, hard-stop disposition, Mold Breaker conclusion, and Phase 4 readiness remain `expert-review-required`.

---

## Objective

Implement Prompt 13 as a new read-only, aggregation-only scorecard report and audit package lane under `e2e/pcc-live/`.

Generate a deterministic JSON/Markdown audit package that pulls together:

- evidence registry and EV coverage;
- scorecard pillar traceability;
- hard-stop worksheet;
- surface/primitive evidence block index from Prompt 12;
- doctrine/source/Mold Breaker review artifacts from Prompt 11;
- content/language/HBI/source-of-record review artifacts from Prompt 10;
- conditional state support from Prompt 09;
- workflow/action/source/state support from Prompt 08;
- accessibility, breakpoint, screenshot, smoke/runtime summaries from Prompts 04–07;
- artifact inventory;
- findings register;
- residual risk register;
- expert scoring worksheet.

The output must be suitable for an expert reviewer to score the PCC 100-point UI/UX Mold Breaker scorecard manually.

---

## Required File Changes

Create exactly these new files:

```text
e2e/pcc-live/pcc-live.scorecard-report.types.ts
e2e/pcc-live/pcc-live.scorecard-report-assembler.ts
e2e/pcc-live/pcc-live.scorecard-report-writer.ts
e2e/pcc-live/pcc-live.scorecard-report.spec.ts
```

Do not modify:

```text
PCC runtime/source files
Playwright config files
package.json
pnpm-lock.yaml
evidence registry files
scorecard model/traceability files
governing doctrine/scorecard documents
Prompt 01–12 evidence files
.gitignore
generated evidence artifacts
```

Exception: if a direct compile blocker is discovered that cannot be solved inside the four Prompt 13 files, stop and report rather than editing a forbidden file.

---

## Source Dependencies

Prompt 13 may import existing types and pure functions from current evidence lanes, including but not limited to:

```text
e2e/pcc-live/pcc-evidence.types.ts
e2e/pcc-live/pcc-evidence.registry.ts
e2e/pcc-live/pcc-scorecard.model.ts
e2e/pcc-live/pcc-scorecard.types.ts
e2e/pcc-live/pcc-scorecard.traceability.ts
e2e/pcc-live/pcc-live.surface-blocks.types.ts
e2e/pcc-live/pcc-live.surface-blocks-assembler.ts
```

Prompt 13 must not reimplement earlier capture lanes and must not drive a browser. It may accept normalized input payloads from earlier lanes and safe artifact-path references.

---

## EV / Scope Rules

Prompt 13 may reference the complete required evidence universe from `REQUIRED_PCC_EVIDENCE_IDS`, currently including:

```text
EV-37..EV-106
EV-125..EV-134
```

Rules:

1. Every EV ID included in Prompt 13 output must be part of `REQUIRED_PCC_EVIDENCE_IDS`.
2. Unknown or malformed EV IDs must be redacted or excluded and recorded as an `expert-review-required` finding.
3. Prompt 13 must not invent new EV IDs.
4. Prompt 13 must not mark EVs as captured as a result of report generation.
5. Prompt 13 may classify report coverage as:
   - `registry-listed`
   - `artifact-referenced`
   - `source-missing`
   - `operator-review-pending`
   - `expert-review-required`
   - `not-observed`
6. Prompt 13 must not use `passed`, `failed`, `score-ready`, `complete`, `Phase 4 ready`, `Mold Breaker achieved`, or equivalent conclusion language as final judgment.

---

## Type Contract

Create `pcc-live.scorecard-report.types.ts`.

Required type groups include, at minimum:

### Run / disposition / source lanes

```text
PccScorecardReportRunState
PccScorecardReportDisposition
PccScorecardReportSourceLane
PccScorecardReportArtifactKind
```

Allowed dispositions:

```text
report-ready-for-expert-review
expert-review-required
operator-review-pending
source-missing
not-observed
registry-listed
artifact-referenced
```

### Core report model

```text
PccScorecardReportRun
PccScorecardReportSummary
PccScorecardReportArtifactRef
PccScorecardReportEvidenceCoverageRow
PccScorecardReportPillarRow
PccScorecardReportHardStopRow
PccScorecardReportFinding
PccScorecardReportResidualRisk
PccScorecardReportExpertScoringRow
PccScorecardReportAuditPackageIndexItem
```

### Required fields

`PccScorecardReportRun` must include:

```text
runId
generatedAtIso
tenantSiteUrl
tenantPageUrl
expectedPackageVersion
repoCommit?
registryEvidenceCount
requiredEvidenceCount
summary
evidenceCoverage
pillarRows
hardStopRows
findings
residualRisks
expertScoringWorksheet
artifactInventory
auditPackageIndex
warnings
disclaimer
```

### Required summary fields

At minimum:

```text
requiredEvidenceCount
registeredEvidenceCount
evidenceReferencedCount
missingEvidenceCount
pillarCount
hardStopCount
manualScoreRequiredCount
manualHardStopReviewRequiredCount
artifactReferenceCount
findingCount
residualRiskCount
expertReviewRequiredCount
operatorPendingCount
sourceMissingCount
```

### Required artifact-reference fields

Each artifact ref must include safe metadata only:

```text
artifactKind
sourceLane
path
description
exists
operatorReviewRequired
```

No binary content, base64, screenshots, HAR, videos, traces, raw Playwright outputs, raw console dumps, auth/session/storage paths, or full DOM/source text may be embedded.

---

## Assembler Module

Create `pcc-live.scorecard-report-assembler.ts`.

The assembler must be pure/read-only and deterministic.

### Input model

The assembler input should support:

```text
runId?
generatedAtIso?
tenantSiteUrl?
tenantPageUrl?
expectedPackageVersion?
repoCommit?
registry?
scorecardModel?
surfaceBlocksRun?
evidenceManifest?
traceabilityCoverage?
pillarWorksheet?
hardStopWorksheet?
screenshotRun?
breakpointRun?
accessibilityRun?
workflowRun?
conditionalRun?
contentRun?
doctrineSourceRun?
runtimeSummary?
artifactPaths?
operatorNotes?
```

All evidence-source payloads are optional. Missing sources must become report findings or residual risks, not thrown errors.

### Required assembler behavior

1. Build evidence coverage rows for every `REQUIRED_PCC_EVIDENCE_IDS` item.
2. Use the existing evidence registry if provided; otherwise import the registry directly.
3. Build pillar rows using `buildPccScorecardWorksheet(...)` / `buildPccPillarEvidenceMap(...)` where possible.
4. Build hard-stop rows using `buildPccHardStopWorksheet(...)` / `buildPccHardStopEvidenceMap(...)` where possible.
5. Build an expert scoring worksheet with one row per pillar:
   - include pillar ID/title/weight;
   - include related EV IDs;
   - leave score fields null;
   - owner is `expert-review`;
   - include review prompts, not answers.
6. Build a hard-stop review worksheet with one row per hard stop:
   - review status remains `manual-review-required`;
   - include related EV IDs;
   - no pass/fail result.
7. Build artifact inventory from safe artifact paths and optional run references.
8. Build findings register:
   - missing artifact sources;
   - source-missing/pending evidence;
   - missing live-env-dependent runs;
   - pending expert scoring;
   - pending hard-stop manual review;
   - status taxonomy mismatch, if observed;
   - environment validation exceptions, if provided.
9. Build residual risk register:
   - live conditional evidence not run or self-skipped;
   - `pnpm install --frozen-lockfile` not run due host policy, if provided;
   - missing artifact directories or operator-supplied evidence;
   - manual expert score still required;
   - manual hard-stop review still required.
10. Build audit package index with every output file the writer will create.
11. Include links/references to Prompt 12 surface blocks when provided.
12. Include links/references to Prompt 11 doctrine/source artifacts when provided.
13. Include links/references to Prompt 10 content/language artifacts when provided.
14. Do not calculate score totals.
15. Do not assert `passed`, `failed`, `captured`, `ready`, or `achieved` outcomes.

---

## Sanitization Rules

Sanitize all text before it enters the report model or writer output.

Redact:

```text
email addresses
phone numbers
query strings
raw HTML
token/blob-like strings
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
.auth
.e2e-auth
```

Redact forbidden conclusion phrases:

```text
hard stop passed
hard stop failed
score-ready
Phase 4 ready
56/56 achieved
100/100
mold breaker achieved
deployment ready
ready for Phase 4
"captured" as a status claim
```

Bound text:

```text
max 180 chars per note/snippet/question
max 10 findings per finding category in summaries
max 10 residual risks in summary sections
max 12 artifact refs per source lane in Markdown summaries
```

Full JSON may include all model rows, but still only sanitized bounded metadata.

---

## Writer Module

Create `pcc-live.scorecard-report-writer.ts`.

Write all outputs under the provided output directory:

```text
pcc-live-scorecard-report.json
pcc-live-scorecard-report.md
executive-review-summary.md
audit-package-index.json
audit-package-index.md
evidence-coverage-matrix.json
evidence-coverage-matrix.md
pillar-evidence-map.json
pillar-evidence-map.md
hard-stop-worksheet.json
hard-stop-worksheet.md
expert-scoring-worksheet.json
expert-scoring-worksheet.md
findings-register.json
findings-register.md
residual-risk-register.json
residual-risk-register.md
artifact-inventory.json
artifact-inventory.md
manual-review-checklist.md
final-report-readme.md
```

Every Markdown file must include:

```text
Final judgment: expert-review-required.
No score calculated.
No EV captured by Prompt 13.
No hard stop passed or failed.
```

Use this disclaimer verbatim:

```text
This output is a draft PCC scorecard report and audit package for expert review only. It is not a final 100-point scorecard result, does not calculate points, does not mark any EV captured, and does not mark any hard stop passed or failed.
```

Writer requirements:

- deterministic file order;
- deterministic row sorting by EV ID, pillar ID, hard-stop ID, source lane, and artifact path;
- no binary/raw artifacts;
- no raw console dumps;
- no raw DOM/source text;
- no auth/session/storage paths;
- no final readiness conclusion.

---

## Required Markdown Content

### `pcc-live-scorecard-report.md`

Must include:

```text
1. Purpose
2. Scope
3. Inputs Used
4. Evidence Coverage Summary
5. Pillar Review Summary
6. Hard-Stop Manual Review Summary
7. Surface / Primitive Evidence Block Summary
8. Doctrine / Mold Breaker Review Summary
9. Content / HBI / Source-of-Record Review Summary
10. Findings Register Summary
11. Residual Risk Summary
12. Expert Review Instructions
13. Final Judgment
```

The final judgment must be:

```text
Final judgment: expert-review-required.
```

### `executive-review-summary.md`

Must be concise and suitable for leadership review. It must state:

- evidence package is assembled;
- expert scoring remains required;
- hard-stop review remains required;
- no final score has been calculated;
- report is an audit package, not a readiness claim.

### `manual-review-checklist.md`

Must include checkboxes for:

- confirm all EV coverage rows;
- review each of 9 pillar scoring rows;
- review each of 10 hard stops;
- inspect surface/primitive blocks;
- review doctrine/source/Mold Breaker artifacts;
- review content/HBI/source-of-record artifacts;
- record expert scores manually;
- record hard-stop dispositions manually;
- decide whether additional evidence is needed.

---

## Spec Module

Create `pcc-live.scorecard-report.spec.ts`.

Required tests:

1. **Report type / coverage assembly**
   - builds report with every `REQUIRED_PCC_EVIDENCE_IDS` ID represented exactly once in evidence coverage;
   - no duplicate EV IDs;
   - no unknown EV IDs.

2. **Pillar and hard-stop worksheets**
   - exactly 9 pillar rows;
   - exactly 10 hard-stop rows;
   - pillar score fields remain null;
   - hard-stop statuses remain manual review required;
   - no pass/fail status appears.

3. **Synthetic full report assembly**
   - provide synthetic Prompt 12 surface blocks, Prompt 11 doctrine-source summary, Prompt 10 content summary, and artifact paths;
   - assert all report sections are populated;
   - assert artifact inventory is metadata-only;
   - assert findings/residual risks are generated for missing optional evidence.

4. **Missing source handling**
   - assemble with minimal input;
   - report still builds;
   - missing inputs become findings/residual risks;
   - final judgment remains expert-review-required.

5. **Writer artifact completeness**
   - write to temp dir;
   - assert all required JSON/Markdown files exist;
   - assert deterministic counts and row ordering.

6. **Sanitization and forbidden claim lockdown**
   - use unsafe synthetic input with email/phone/token/query/raw HTML/auth/session/storage/Playwright artifact terms;
   - include forbidden phrases such as `hard stop passed`, `hard stop failed`, `score-ready`, `Phase 4 ready`, `56/56 achieved`, `100/100`, `mold breaker achieved`, `deployment ready`;
   - assert no generated file contains raw unsafe strings;
   - allow required disclaimer wording only after normalizing it in the test.

7. **No automatic scoring**
   - assert all pillar scores are `null`;
   - assert total score is absent or `null`;
   - assert all hard-stop dispositions are manual-review-required;
   - assert report does not include final score or readiness claims.

8. **Regression compatibility**
   - imports and compiles against existing registry, traceability, scorecard model, and Prompt 12 surface-block types;
   - does not require live env;
   - does not modify prior prompt files.

---

## Required Validation

Run and report exactly:

```text
git status --short
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.scorecard-report.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.surface-blocks.spec.ts
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

If `pnpm install --frozen-lockfile` is blocked by host authorization policy, report it as an **environment validation exception**, consistent with Prompts 09–12.

---

## Required Closeout From Agent

Return:

```text
Prompt completed.

Files changed:
- <paths>

Validation:
- <commands and results>

Evidence / scorecard impact:
- <EV IDs / pillars / hard stops affected>

Safety confirmation:
- No tenant mutation.
- No storageState path/content committed.
- No raw Playwright artifacts committed.
- No raw console dumps committed.
- No raw DOM HTML committed.
- No full source files or long excerpts committed.
- No scorecard-report evidence artifacts staged/committed automatically.
- No PCC runtime source modified.
- pnpm-lock.yaml unchanged.
- No EV marked captured by Prompt 13.
- No score calculated.
- No hard stop marked passed/failed.

Residual risks or pending items:
- <items>
```
