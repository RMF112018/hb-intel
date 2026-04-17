# Prompt 03 — Produce Hosted Validation and Conformance Closure Proof for `hbHomepage`

## Objective

Create the validation and closure package required to describe `hbHomepage` as benchmark-grade with evidence.

## Governing authority

Binding:
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

Benchmark package:
- `docs/architecture/plans/MASTER/spfx/benchmark/03-Homepage-Webpart-Delivery-Workflow-and-Gates.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/04-Conformance-Scoring-Matrix.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/06-Closure-Checklist.md`

## Exact seams to inspect

- the final `hbHomepage` implementation after Wave 01 and Wave 02 structural work
- any test harnesses already present in the repo
- any hosted validation or screenshot workflow already used by other homepage efforts

## Current future-state gap to close

The homepage cannot credibly close as benchmark-grade without:
- hosted screenshots
- viewport/zoom checks
- keyboard/focus checks
- runtime defect review
- a written conformance scorecard
- explicit pass/fail closure posture

## Required implementation outcome

Produce a closure artifact set that includes, at minimum:

1. hosted screenshots at relevant homepage widths
2. evidence for:
   - flagship top-band quality
   - zone hierarchy
   - viewport fit
   - author-safe degradation
   - keyboard/focus credibility where applicable
3. a scored conformance review using the benchmark matrix
4. an unresolved-defects list, even if empty
5. an explicit pass/fail statement

If repo conventions support automated checks, add them where appropriate. If not, produce disciplined manual artifacts in the repo’s established documentation style.

## Proof of closure

Your final response must include:
- artifact file paths created or updated
- score by category
- final total score
- pass/fail decision
- any non-blocking residual items

## Constraints

- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Do not claim closure without evidence.
- Do not bury unresolved defects.
