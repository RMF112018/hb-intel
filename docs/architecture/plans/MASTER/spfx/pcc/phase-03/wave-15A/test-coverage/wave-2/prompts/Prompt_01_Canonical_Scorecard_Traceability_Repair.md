# Prompt 01 — Canonical Scorecard Traceability Repair

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

Repair stale scorecard references in the PCC live Playwright evidence harness so all durable source references point to the canonical scorecard:

```text
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md
```

Durable references must not point to:

```text
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard_v2.md
```

## Why This Matters

The PCC scorecard folder now has a canonical filename rule. If Playwright-generated evidence, registries, or report artifacts keep pointing to `_v2`, the evidence package is less credible and can fail HS-09 Evidence Failure review.

This prompt is traceability-only. Do not expand test coverage beyond what is necessary to lock canonical references.

## Repo Areas to Inspect

Inspect current equivalents of:

```text
docs/reference/spfx-surfaces/project-control-center/README.md
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Scorecard_Use_Guide.md
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Evidence_Taxonomy.md
docs/reference/spfx-surfaces/project-control-center/PCC_Playwright_Evidence_Subset_Map.md

e2e/pcc-live/pcc-evidence.registry.ts
e2e/pcc-live/pcc-evidence.registry.spec.ts
e2e/pcc-live/pcc-scorecard.model.ts
e2e/pcc-live/pcc-scorecard.traceability.ts
e2e/pcc-live/pcc-scorecard.traceability.spec.ts
e2e/pcc-live/pcc-live.scorecard-report-assembler.ts
e2e/pcc-live/pcc-live.scorecard-report.spec.ts
e2e/pcc-live/pcc-live.doctrine-source*
e2e/pcc-live/**/*.ts
```

Use grep/search to locate all `_v2` references in `e2e/pcc-live` and relevant PCC scorecard docs.

## Required Changes

1. Replace stale `_v2` scorecard references in Playwright source/model/test files with the canonical non-versioned path.
2. Add or update tests so any future `_v2` source reference in the PCC Playwright evidence registry, scorecard model, scorecard traceability outputs, and report assembler fails validation.
3. Preserve `_v2` only where it is explicitly used as a forbidden example in canonical docs. Do not remove docs that state `_v2` must not be used.
4. If generated writer outputs include sourceRefs or report docs that mention scorecard path, ensure they use the canonical filename.
5. Keep existing manual-scoring and hard-stop-review posture unchanged.

## Suggested Implementation Approach

1. Add a shared constant if helpful:

```ts
export const PCC_CANONICAL_SCORECARD_PATH =
  'docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md';
```

Only add this if it reduces duplication without causing a broad refactor.

2. Replace hard-coded `_v2` references in:

```text
pcc-evidence.registry.ts
pcc-scorecard.model.ts
```

3. Add regression assertions in the closest existing spec(s):

```text
pcc-evidence.registry.spec.ts
pcc-scorecard.traceability.spec.ts
pcc-live.scorecard-report.spec.ts
```

Assertions should verify:

- no registry sourceRef includes `_v2`;
- no scorecard model sourceRef includes `_v2`;
- generated scorecard/report source references do not include `_v2`;
- canonical path is present where scorecard refs are expected.

## Validation

Run:

```bash
git status --short
grep -R "PCC_100_Point_UIUX_Mold_Breaker_Scorecard_v2.md" e2e/pcc-live docs/reference/spfx-surfaces/project-control-center || true

pnpm pcc:e2e:evidence:registry
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-scorecard.traceability.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.scorecard-report.spec.ts
pnpm exec prettier --check "e2e/pcc-live/**/*.{ts,md,json}" "docs/reference/spfx-surfaces/project-control-center/**/*.md"
git diff --check
```

## Acceptance Criteria

- No durable Playwright source/model/report reference points to `_v2`.
- Tests fail if `_v2` reappears in sourceRefs or report source refs.
- Canonical scorecard path is used consistently.
- No scoring or hard-stop automation is introduced.
