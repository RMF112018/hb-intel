# Prompt 04 — Screenshot Contact Sheet and EV Manifest (Updated)

## Role

You are acting as a senior TypeScript/Playwright test architect, SPFx evidence-harness maintainer, UI/UX audit systems engineer, and repository-quality reviewer.

You are working in the local repository:

```text
RMF112018/hb-intel
```

## Mandatory Session Rules

- Start from repo truth. Run `git status --short`, `git branch --show-current`, and `git rev-parse --short HEAD` before making changes.
- Do not re-read files that are still within your current context or memory. Reopen a file only if it may have changed, if exact code is required, or if prior context is stale.
- Make the smallest coherent set of changes necessary to satisfy this prompt.
- Preserve existing architecture, file naming, writer patterns, and Playwright harness conventions unless this prompt explicitly requires a targeted adjustment.
- Do not calculate final scorecard points.
- Do not mark hard stops as passed or failed.
- Do not mark EVs as finally captured by automation.
- Do not mark screenshots as approved.
- Do not generate or commit storageState, cookies, tokens, raw traces, videos, HAR files, raw `test-results/`, raw `playwright-report/`, or unsanitized tenant artifacts.
- Do not add live write-side PCC actions or tenant mutation behavior.
- Keep all outputs expert-review / operator-review oriented.
- Do not modify product UI runtime files.
- Do not modify dependencies, `pnpm-lock.yaml`, package metadata, SPFx manifests, or package-solution files.
- Leave unrelated pre-existing working-tree changes untouched.

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

Enhance the PCC screenshot lane so it emits audit-friendly screenshot review artifacts:

```text
screenshot-contact-sheet.md
screenshot-manifest-by-ev.json
first-screen-review-index.md
```

These artifacts should make visual review faster, easier to navigate, and more directly traceable to EVs, scorecard pillars, hard stops, surfaces, screenshot kinds, viewport sizes, and screenshot files.

This prompt builds on Prompt 02 package completeness and Prompt 03 scorecard closeout integration. The new screenshot artifacts must be reflected in the screenshot writer result contract, screenshot tests, and package-completeness expected file list.

## Why This Matters

The screenshot lane already captures above-fold, full-page, and scroll-segment screenshots plus DOM card summaries. The existing Markdown summary is primarily a count/table report. Expert auditors need a safer visual-review index and EV-linked manifest to evaluate command-center clarity, visual hierarchy, card density, cognitive load, SharePoint host fit, and field/tablet usability without manually hunting through PNG folders.

## Repo Areas to Inspect

Inspect only as needed and avoid redundant re-reads:

```text
e2e/pcc-live/pcc-live.screenshot.types.ts
e2e/pcc-live/pcc-live.screenshot-capture.ts
e2e/pcc-live/pcc-live.screenshot-evidence-writer.ts
e2e/pcc-live/pcc-live.screenshot.spec.ts

e2e/pcc-live/pcc-live.package-completeness.ts
e2e/pcc-live/pcc-live.package-completeness.spec.ts

e2e/pcc-live/pcc-evidence.registry.ts
e2e/pcc-live/pcc-scorecard.model.ts
e2e/pcc-live/README.md
docs/architecture/evidence/pcc-live/README.md
```

## Current Repo-Truth Baseline

- `writePccScreenshotEvidence` currently emits:
  - `pcc-live-screenshot-evidence.json`
  - `pcc-live-screenshot-evidence.md`
  - `pcc-live-screenshot-inventory.json`
  - `pcc-live-dom-card-summary.json`
- `PCC_SCREENSHOT_INITIAL_EVIDENCE_IDS` currently covers `EV-37..EV-49` and `EV-125..EV-134`.
- Package-completeness currently expects only the four screenshot outputs listed above for the `surface-screenshots` group. Prompt 04 must update that expected-file set to include the three new screenshot review artifacts.
- Prompt 03A fixed doctrine-source validation. Do not alter doctrine-source or scorecard-report behavior in this prompt unless a targeted compatibility test proves it necessary.

## Required Changes

### 1. Extend Screenshot Writer Outputs

Update `writePccScreenshotEvidence` to also emit:

```text
screenshot-contact-sheet.md
screenshot-manifest-by-ev.json
first-screen-review-index.md
```

Update `WritePccScreenshotEvidenceResult` to include paths for these outputs:

```ts
screenshotContactSheetPath
screenshotManifestByEvPath
firstScreenReviewIndexPath
```

Preserve all existing output filenames and return fields.

### 2. Add Screenshot Contact Sheet Markdown

`screenshot-contact-sheet.md` must group screenshots by:

- surface ID and label;
- screenshot kind;
- viewport width/height;
- file name;
- operator review status;
- artifact policy.

Use Markdown image syntax only when the screenshot path can be represented as a safe relative path. Otherwise show a sanitized path/link text only and include an operator-review warning.

Rules:

- Do not duplicate or move PNG files.
- Do not embed absolute temp paths.
- Do not embed tenant URLs.
- Do not mark images scrubbed or approved.
- Every screenshot row must preserve `operatorReviewRequired: true` language or equivalent visible text.
- Include a top-level boundary statement:
  - review support only;
  - screenshots require operator review/scrub;
  - no final score;
  - no hard-stop pass/fail;
  - no EV final-capture;
  - no Phase 4 readiness approval.

### 3. Add Screenshot Manifest by EV JSON

`screenshot-manifest-by-ev.json` must map screenshots to evidence context. Each manifest row should include at least:

```ts
evId
pillarRefs
hardStopRefs
surfaceId
surfaceLabel
screenshotKind
fileName
path
displayPath
viewportWidth
viewportHeight
operatorReviewRequired
artifactPolicy
reviewPrompts
```

Implementation guidance:

- Prefer deriving `pillarRefs` and `hardStopRefs` from `PCC_EVIDENCE_REGISTRY` by EV ID, not hard-coded duplicate mappings.
- Include only EVs relevant to screenshot evidence unless a defensible mapping is already available.
- Do not infer that a screenshot proves or captures an EV.
- Use `artifactPolicy` values such as:
  - `operator-review-required`
  - `not-auto-commit-eligible`
  - `commit-eligible-after-scrub`
- If one screenshot maps to multiple EV IDs, emit one row per `(screenshot, evId)` pair or a clearly typed equivalent. Keep it easy to consume by downstream audits.
- Preserve stable ordering by EV, surface, screenshot kind, viewport, and file name.

### 4. Add First-Screen Review Index Markdown

`first-screen-review-index.md` should focus only on `above-fold` screenshots and include reviewer prompts for:

- command-center clarity;
- project context;
- priority/action visibility;
- card hierarchy;
- cognitive load;
- SharePoint host fit;
- field/tablet usability;
- source/context confidence where visible;
- false-affordance risk where visible;
- screenshot scrub/operator-review status.

Rules:

- Do not include scoring columns.
- Do not include pass/fail columns.
- Do not mark any prompt complete.
- Use consistent language: `expert-review-required` / `operator-review-required`.

### 5. Update Package-Completeness Expectations

Update `e2e/pcc-live/pcc-live.package-completeness.ts` so `surface-screenshots` expected files include:

```text
screenshot-contact-sheet.md
screenshot-manifest-by-ev.json
first-screen-review-index.md
```

Update `pcc-live.package-completeness.spec.ts` synthetic screenshot paths so the complete-package test remains accurate and these new files are asserted as expected screenshot group files.

### 6. Update Tests

Update `pcc-live.screenshot.spec.ts` to assert:

- the three new files are generated by the writer;
- the writer result exposes the three new path fields;
- `screenshot-contact-sheet.md` includes surface grouping, screenshot kind, viewport, file name, and operator-review language;
- `screenshot-manifest-by-ev.json` includes EV ID, pillar refs, hard-stop refs, surface ID, screenshot kind, file name, viewport dimensions, operator-review flag, and artifact policy;
- `first-screen-review-index.md` includes only above-fold screenshot rows and the required reviewer prompts;
- no output contains forbidden auth/session/raw artifact terms;
- outputs do not contain:
  - final score claims;
  - hard-stop pass/fail claims;
  - EV final-capture claims;
  - Phase 4 readiness approval;
  - `_v2` scorecard path;
- absolute temp paths are not embedded as image links.

Also ensure the live/self-skip screenshot test checks the three new output paths when the live lane runs.

### 7. Update Runbooks Minimally

Update focused screenshot closeout guidance in:

```text
e2e/pcc-live/README.md
docs/architecture/evidence/pcc-live/README.md
```

Add the three new screenshot review artifacts to expected screenshot output references and note that they are closeout support only, not scoring authority.

Do not rewrite broad documentation.

## Suggested Implementation Pattern

- Keep the new artifact generation inside `pcc-live.screenshot-evidence-writer.ts` unless a small helper file is clearly cleaner.
- Prefer small local helper functions:
  - safe relative/display path normalization;
  - screenshot grouping/sorting;
  - manifest row building from `PCC_EVIDENCE_REGISTRY`;
  - Markdown table escaping.
- Reuse existing sanitizer conventions, but patch plural credential forms if needed:
  - `cookies?`
  - `tokens?`
  - `sessions?`
- Avoid adding dependencies. Markdown/JSON are sufficient.

## Artifact Safety Rules

- Safe display paths may be repo-relative or output-dir-relative.
- Absolute paths may appear in JSON only if already present in current sanitized inventory and not unsafe, but should not be used in Markdown image syntax.
- Prefer `displayPath` for Markdown references.
- Unsafe raw artifact paths must be filtered or redacted:
  - `storageState`
  - `storage-state`
  - `cookie` / `cookies`
  - `token` / `tokens`
  - `auth`
  - `session` / `sessions`
  - `secret` / `secrets`
  - `.auth`
  - `.e2e-auth`
  - `.secrets`
  - raw `test-results`
  - raw `playwright-report`
  - traces/videos/HAR/network captures
- Screenshots remain `operatorReviewRequired: true`.

## Validation

Run exactly:

```bash
git status --short
git branch --show-current
git rev-parse --short HEAD
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.screenshot.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.package-completeness.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.scorecard-report.spec.ts
pnpm exec prettier --check e2e/pcc-live/pcc-live.screenshot.types.ts e2e/pcc-live/pcc-live.screenshot-capture.ts e2e/pcc-live/pcc-live.screenshot-evidence-writer.ts e2e/pcc-live/pcc-live.screenshot.spec.ts e2e/pcc-live/pcc-live.package-completeness.ts e2e/pcc-live/pcc-live.package-completeness.spec.ts e2e/pcc-live/README.md docs/architecture/evidence/pcc-live/README.md
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

If an inspected file is not changed, it may still be included in Prettier validation if the command above includes it.

## Acceptance Criteria

- Screenshot lane writes:
  - `screenshot-contact-sheet.md`
  - `screenshot-manifest-by-ev.json`
  - `first-screen-review-index.md`
- Existing screenshot outputs still write successfully.
- Writer result type exposes all output paths.
- Tests confirm files are generated.
- Tests confirm artifacts do not contain forbidden auth/session/raw artifact terms.
- Manifest maps screenshots to EV/pillar/hard-stop context using registry-backed refs.
- Contact sheet improves manual review navigation without making scoring claims.
- First-screen index focuses only on above-fold screenshots and includes required review prompts.
- Package-completeness expected screenshot files are updated and tested.
- No automatic final score, EV capture, hard-stop disposition, screenshot approval, or Phase 4 approval is introduced.
- Lockfile hash remains unchanged.
