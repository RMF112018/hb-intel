# Prompt 12 — Surface and Primitive Evidence Blocks (Updated Execution Spec)

## Context

Use current repo truth. Do not re-read files that are still in current context unless exact edit context is required or the file may have changed.

Tenant target for live-evidence metadata only:

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

Critical distinction:

- Automate evidence organization, block assembly, traceability, and review packet generation.
- Do **not** calculate a final 100-point score.
- Do **not** mark any EV captured.
- Do **not** mark any hard stop passed or failed.
- Do **not** claim 56/56, 100/100, Phase 4 readiness, Mold Breaker achievement, or deployment readiness.
- Final judgment for these blocks remains `expert-review-required`.

Prompt 12 comes after Prompt 11. Existing pcc-live lanes already provide the lower-level evidence sources that Prompt 12 must summarize and cross-reference:

- surface/screenshot/card-summary evidence;
- breakpoint/container/card/touch evidence;
- accessibility/axe/keyboard/focus/ARIA/contrast evidence;
- workflow/action/state/source/HBI evidence;
- conditional/edit/high-zoom/drawer/unauthorized state evidence;
- content/language/source/HBI authority review evidence;
- doctrine/source/Mold Breaker review evidence.

Prompt 12 must assemble **surface and primitive evidence blocks** from those evidence models and generated-artifact references. It must not reimplement the earlier lanes or mutate PCC runtime source.

---

## Objective

Implement Prompt 12 as a new read-only, aggregation-only evidence-block lane under `e2e/pcc-live/`.

Generate deterministic JSON/Markdown evidence blocks for `EV-125..EV-134` only. Each block must summarize, by surface or primitive layer, the evidence needed for expert review:

- screenshot references;
- source/state markers;
- card hierarchy distribution;
- workflow/action summary;
- accessibility summary;
- breakpoint/container summary;
- runtime/console summary;
- conditional/special-state support where applicable;
- content/language review signals where applicable;
- doctrine/source/Mold Breaker review links where applicable;
- pending gaps and operator/expert-review questions.

No new live browser interactions are required for Prompt 12. Prefer aggregation from typed input payloads and previously generated evidence artifact paths. Specs may use synthetic normalized payloads. If a live output directory is provided in a future run, Prompt 12 may read only the safe JSON/Markdown summary artifacts named in this prompt; it must not read screenshots as binary, Playwright traces, videos, HAR files, storage state files, auth/session files, or raw reports.

---

## Required File Changes

Create exactly these new files:

```text
e2e/pcc-live/pcc-live.surface-blocks.types.ts
e2e/pcc-live/pcc-live.surface-blocks-assembler.ts
e2e/pcc-live/pcc-live.surface-blocks-writer.ts
e2e/pcc-live/pcc-live.surface-blocks.spec.ts
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
Prompt 01–11 evidence files
.gitignore
generated evidence artifacts
```

Exception: if a direct compile blocker is discovered that cannot be solved inside the four Prompt 12 files, stop and report rather than editing a forbidden file.

---

## EV Scope

Prompt 12 is strictly scoped to:

```text
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

Define:

```ts
PCC_SURFACE_BLOCK_EVIDENCE_IDS = ['EV-125'..'EV-134'] as const
```

Add compile-time guards:

- exact length `10`;
- unique tuple;
- assignable to `PccEvidenceId`;
- non-widened union, not `string`.

No Prompt 12 runtime payload, block, JSON artifact, Markdown artifact, summary, or review question may include EV IDs outside `EV-125..EV-134`, except where an earlier-artifact reference is described as a source artifact path and the actual out-of-scope evidence detail is not repeated. Prefer not to print prior-lane EV IDs in Prompt 12 output at all. Use source-lane labels instead.

---

## Required Block Mapping

Implement this block mapping exactly:

| EV ID | Block ID | Block Type | Target |
|---|---|---|---|
| `EV-125` | `project-home-surface-block` | `surface` | `project-home` |
| `EV-126` | `team-and-access-surface-block` | `surface` | `team-and-access` |
| `EV-127` | `documents-surface-block` | `surface` | `documents` |
| `EV-128` | `project-readiness-surface-block` | `surface` | `project-readiness` |
| `EV-129` | `approvals-surface-block` | `surface` | `approvals` |
| `EV-130` | `external-systems-surface-block` | `surface` | `external-systems` |
| `EV-131` | `control-center-settings-surface-block` | `surface` | `control-center-settings` |
| `EV-132` | `site-health-surface-block` | `surface` | `site-health` |
| `EV-133` | `shared-primitive-system-block` | `primitive-system` | shared shell/layout/card/navigation/source primitives |
| `EV-134` | `cross-surface-evidence-index-block` | `cross-surface-index` | all surfaces and pending gaps |

Use `PCC_LIVE_SURFACES` as the source of truth for the eight surface IDs and labels.

---

## Type Contract

Create `pcc-live.surface-blocks.types.ts`.

Required types include, at minimum:

### EV / block identifiers

```text
PccSurfaceBlockEvidenceId
PccSurfaceEvidenceBlockId
PccSurfaceEvidenceBlockType
PccSurfaceEvidenceBlockDisposition
```

Allowed dispositions:

```text
review-support
expert-review-required
operator-review-pending
source-missing
not-observed
```

### Block data models

Define interfaces for:

```text
PccSurfaceEvidenceBlockRun
PccSurfaceEvidenceBlock
PccSurfaceEvidenceBlockSummary
PccSurfaceEvidenceBlockArtifactRef
PccSurfaceEvidenceScreenshotSummary
PccSurfaceEvidenceSourceStateSummary
PccSurfaceEvidenceCardHierarchySummary
PccSurfaceEvidenceWorkflowSummary
PccSurfaceEvidenceAccessibilitySummary
PccSurfaceEvidenceBreakpointSummary
PccSurfaceEvidenceRuntimeSummary
PccSurfaceEvidenceContentSummary
PccSurfaceEvidenceDoctrineSummary
PccSurfaceEvidenceGapItem
PccPrimitiveEvidenceBlockSummary
PccCrossSurfaceEvidenceIndexSummary
```

Each block must include:

```text
evId
blockId
blockType
surfaceId? / primitiveScope?
label
disposition
artifactRefs
screenshotSummary
sourceStateSummary
cardHierarchySummary
workflowSummary
accessibilitySummary
breakpointSummary
runtimeSummary
contentSummary
doctrineSummary
pendingGaps
expertReviewQuestions
```

All text fields must be bounded and sanitized. Do not store raw DOM, raw source file contents, raw console dumps, raw HTML, Playwright artifacts, auth/session/storage material, or long visible-copy excerpts.

---

## Assembler Module

Create `pcc-live.surface-blocks-assembler.ts`.

The assembler must be pure/read-only and accept normalized input, not drive the browser.

Required input shape should support optional sources:

```text
runId?
generatedAtIso?
tenantSiteUrl?
tenantPageUrl?
expectedPackageVersion?
surfaces?
screenshotRun?
breakpointRun?
accessibilityRun?
workflowRun?
conditionalRun?
contentRun?
doctrineSourceRun?
surfaceSmokeRun?
runtimeErrorSummary?
artifactPaths?
```

All inputs are optional except surface definitions; missing sources become `source-missing`, `not-observed`, or `operator-review-pending` block gaps.

### Required behavior

1. Build all ten blocks from the fixed mapping above.
2. For each surface block:
   - summarize screenshot references for that surface;
   - summarize card hierarchy distribution from screenshot/card summaries and/or breakpoint card measurements;
   - summarize source/state markers from workflow/content/conditional/doctrine-source summaries;
   - summarize workflow/action data from Prompt 08 workflow evidence;
   - summarize accessibility data from Prompt 07 accessibility evidence;
   - summarize breakpoint/container/card/touch coverage from Prompt 06 breakpoint evidence;
   - summarize runtime/console warnings from smoke/workflow/page-object summaries where available;
   - summarize content-language/HBI/source-label signals from Prompt 10 content evidence;
   - summarize doctrine/source/Mold Breaker support from Prompt 11 doctrine-source evidence;
   - list pending gaps when any expected source is missing.
3. For the primitive-system block:
   - summarize shared shell/layout/navigation/card/source/state/HBI primitives;
   - summarize primitive source review references from Prompt 11;
   - summarize card hierarchy/tier/footprint distribution across all surfaces;
   - summarize a11y primitive signals: ARIA, keyboard, focus, contrast, reduced motion, hover-only, touch targets;
   - summarize responsive primitives: responsive modes, grid/container behavior, row/column span behavior, overflow, clipping;
   - list pending gaps.
4. For the cross-surface-index block:
   - summarize all surfaces;
   - summarize which evidence sources are present/missing;
   - summarize block-level gaps;
   - summarize artifact availability by source lane;
   - provide expert review questions for final block review.
5. Do not calculate scores.
6. Do not emit captured/pass/fail/hard-stop readiness language.
7. Do not include EV IDs outside `EV-125..EV-134`.

### Sanitization

Sanitize all text before it enters the block model:

- strip query strings from URLs;
- redact email addresses;
- redact phone numbers;
- redact token/blob-like strings;
- redact raw HTML;
- redact `storageState`, `storage-state`, `cookie`, `token`, `auth`, `session`, `secret`, `secrets`;
- redact Playwright artifact terms such as `test-results`, `playwright-report`, `trace.zip`, `video.webm`, `network.har`;
- redact forbidden claim phrases:
  - `hard stop passed`
  - `hard stop failed`
  - `score-ready`
  - `Phase 4 ready`
  - `56/56 achieved`
  - `100/100`
  - `mold breaker achieved`
  - `"captured"` as a status claim
- redact any out-of-scope `EV-*` reference outside `EV-125..EV-134`.

Bound all snippets:

- maximum 160 characters per individual snippet;
- maximum 5 artifact refs per block per evidence source;
- maximum 8 pending gaps per block;
- maximum 8 expert review questions per block.

### Artifact reference policy

Artifact refs may include only safe metadata:

```text
artifactKind
sourceLane
path
description
exists?
operatorReviewRequired
```

Do not include binary screenshot content, base64 strings, raw Playwright output, trace paths, video paths, HAR paths, auth paths, or storage state paths. Screenshot artifact references may include sanitized relative paths only.

---

## Writer Module

Create `pcc-live.surface-blocks-writer.ts`.

Write all outputs under the provided output directory:

```text
pcc-live-surface-blocks-evidence.json
pcc-live-surface-blocks-evidence.md
surface-block-index.json
surface-block-index.md
blocks/project-home-surface-block.json
blocks/project-home-surface-block.md
blocks/team-and-access-surface-block.json
blocks/team-and-access-surface-block.md
blocks/documents-surface-block.json
blocks/documents-surface-block.md
blocks/project-readiness-surface-block.json
blocks/project-readiness-surface-block.md
blocks/approvals-surface-block.json
blocks/approvals-surface-block.md
blocks/external-systems-surface-block.json
blocks/external-systems-surface-block.md
blocks/control-center-settings-surface-block.json
blocks/control-center-settings-surface-block.md
blocks/site-health-surface-block.json
blocks/site-health-surface-block.md
blocks/shared-primitive-system-block.json
blocks/shared-primitive-system-block.md
blocks/cross-surface-evidence-index-block.json
blocks/cross-surface-evidence-index-block.md
primitive-evidence-summary.md
cross-surface-gap-register.md
```

Every Markdown file must include:

```text
Final judgment: expert-review-required.
No score calculated.
No EV captured.
No hard stop passed or failed.
```

Use this disclaimer verbatim:

```text
This output is surface and primitive evidence block review support for EV-125 through EV-134 only. It is not a final scorecard result, does not mark any EV captured, and does not mark any hard stop passed or failed.
```

Writer outputs must be deterministic: stable block order, stable surface order, stable sorted artifact refs, stable sorted gap lists.

---

## Spec Module

Create `pcc-live.surface-blocks.spec.ts`.

Required tests:

1. **EV tuple and mapping validity**
   - `PCC_SURFACE_BLOCK_EVIDENCE_IDS` is exactly `EV-125..EV-134`.
   - length is `10`.
   - no duplicates.
   - every ID exists in `REQUIRED_PCC_EVIDENCE_IDS`.
   - block mapping has exactly ten records.
   - eight surface blocks match `PCC_LIVE_SURFACES`.
   - primitive and cross-surface blocks are present.

2. **Synthetic full block assembly**
   - provide synthetic screenshot, breakpoint, accessibility, workflow, conditional, content, doctrine-source, and runtime summary inputs;
   - assemble all ten blocks;
   - assert every block has:
     - disposition;
     - artifact refs or pending gaps;
     - screenshot/card/workflow/accessibility/breakpoint/runtime/source-state/content/doctrine summaries;
     - expert-review-required questions.
   - assert surface blocks are keyed to the correct surface IDs.

3. **Missing source handling**
   - assemble from only `PCC_LIVE_SURFACES`.
   - assert all ten blocks still exist.
   - assert missing lower-level inputs become pending gaps, not thrown errors.
   - assert disposition is `operator-review-pending`, `source-missing`, or `expert-review-required`, not captured/pass/fail.

4. **Writer artifact completeness**
   - write to a temp directory.
   - assert every required JSON/Markdown file exists.
   - assert stable block count `10`.
   - assert per-block JSON and Markdown exist.

5. **Sanitization / no forbidden claims**
   - use synthetic unsafe inputs containing:
     - email;
     - phone;
     - token/blob;
     - query string;
     - raw HTML;
     - storageState/auth/session/cookie/secret terms;
     - Playwright artifact terms;
     - `hard stop passed`;
     - `hard stop failed`;
     - `score-ready`;
     - `Phase 4 ready`;
     - `56/56 achieved`;
     - `100/100`;
     - `mold breaker achieved`;
     - out-of-scope EVs such as `EV-37`, `EV-72`, `EV-83`, `EV-100`, `EV-106`.
   - assert no generated JSON/Markdown output contains those raw strings.
   - assert `EV-125..EV-134` may appear, but no other `EV-*` appears.

6. **Surface coverage and primitive/cross-surface completeness**
   - exactly eight surface blocks.
   - each `PCC_LIVE_SURFACES` ID has one block.
   - primitive-system block exists.
   - cross-surface-index block exists.
   - no duplicate block IDs.

7. **Regression source-lane compatibility**
   - import only types/helpers from prior Prompt 05–11 files as needed.
   - ensure the spec compiles without changing prior files.
   - do not require live env to pass.

---

## Required Validation

Run and report exactly:

```text
git status --short
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

If `pnpm install --frozen-lockfile` is blocked by host authorization policy, report it as an **environment validation exception**, consistent with Prompts 09–11.

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
- No surface-block evidence artifacts staged/committed automatically.
- No PCC runtime source modified.
- pnpm-lock.yaml unchanged.
- No EV marked captured.
- No score calculated.
- No hard stop marked passed/failed.

Residual risks or pending items:
- <items>
```
