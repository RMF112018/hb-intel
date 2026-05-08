# Prompt 04 — Screenshot Contact Sheet and EV Manifest

## Role

You are acting as a senior TypeScript/Playwright test architect, SPFx evidence-harness maintainer, UI/UX audit systems engineer, and repository-quality reviewer.

You are working in the local repository:

```text
RMF112018/hb-intel
```

## Mandatory Session Rules

- Start from repo truth. Run `git status --short` and identify the current branch/HEAD before making changes.
- Do not re-read files that are still within your current context or memory. Reopen a file only if it may have changed, if exact code is required, or if your prior context is stale.
- Make the smallest coherent set of changes necessary to satisfy this prompt.
- Preserve existing architecture and naming patterns unless this prompt explicitly instructs a targeted adjustment.
- Do not calculate final scorecard points.
- Do not mark hard stops as passed or failed.
- Do not mark EVs as finally captured by automation.
- Do not generate or commit storageState, cookies, tokens, raw traces, videos, HAR files, raw `test-results/`, or raw `playwright-report/`.
- Do not add live write-side PCC actions or tenant mutation behavior.
- Keep all outputs expert-review / operator-review oriented.

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

These artifacts should make visual review faster, easier to navigate, and more directly traceable to EVs, scorecard pillars, hard stops, surfaces, and screenshot files.

## Why This Matters

The screenshot lane already captures above-fold, full-page, and scroll-segment screenshots plus DOM card summaries. However, the current Markdown summary is primarily a counts table. Expert auditors need a visual index and EV-linked manifest to evaluate command-center clarity, visual hierarchy, card density, and cognitive load.

## Repo Areas to Inspect

```text
e2e/pcc-live/pcc-live.screenshot.types.ts
e2e/pcc-live/pcc-live.screenshot-capture.ts
e2e/pcc-live/pcc-live.screenshot-evidence-writer.ts
e2e/pcc-live/pcc-live.screenshot.spec.ts
e2e/pcc-live/pcc-evidence.registry.ts
e2e/pcc-live/pcc-scorecard.model.ts
```

## Required Changes

1. Extend screenshot writer output to include:

```text
screenshot-contact-sheet.md
screenshot-manifest-by-ev.json
first-screen-review-index.md
```

2. `screenshot-contact-sheet.md` should group screenshots by:

- surface,
- screenshot kind,
- viewport width/height,
- file name,
- operator review status.

Use Markdown image links if safe relative paths are available. If screenshots are not guaranteed repo-eligible, show links/paths and preserve operator-review warnings.

3. `screenshot-manifest-by-ev.json` should map:

```ts
evId
pillarRefs
hardStopRefs
surfaceId
screenshotKind
fileName
path
viewportWidth
viewportHeight
operatorReviewRequired
artifactPolicy
```

4. `first-screen-review-index.md` should focus on above-fold screenshots and include reviewer prompts for:

- command-center clarity,
- project context,
- priority/action visibility,
- card hierarchy,
- cognitive load,
- SharePoint host fit,
- field/tablet usability.

5. Update writer result types and tests.
6. Preserve screenshot scrub/operator-review language.
7. Do not add visual scoring.
8. Do not mark screenshots as approved.

## Suggested Implementation Notes

- Reuse existing screenshot artifacts and surface evidence records.
- Do not duplicate PNG files.
- Do not embed unsafe raw tenant URLs.
- Avoid adding dependencies unless necessary. Markdown is sufficient for the first implementation.
- If image paths are absolute temp paths, add a normalized display path field when safe.

## Validation

Run:

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.screenshot.spec.ts
pnpm exec prettier --check "e2e/pcc-live/**/*.{ts,md,json}"
git diff --check
```

## Acceptance Criteria

- Screenshot lane writes the three new artifacts.
- Tests confirm files are generated.
- Tests confirm artifacts do not contain forbidden auth/session/raw artifact terms.
- Manifest maps screenshots to EV/pillar/hard-stop context.
- Contact sheet improves manual review without making scoring claims.
