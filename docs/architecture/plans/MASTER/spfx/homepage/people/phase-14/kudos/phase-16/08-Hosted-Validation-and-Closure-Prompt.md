# 08 — Hosted Validation and Closure Prompt

You are working in the live repo for `RMF112018/hb-intel`.

Your task is to perform the final hosted validation, evidence capture, defect logging, and closure pass for the HB Kudos stress suite.

## Mandatory directive

Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Objective

Prove that the implemented suite is not just technically present, but **credible**, **evidence-backed**, and **usable for future regression control**.

## Required hosted validation areas

### A. SharePoint-style runtime constraints

Validate behavior under realistic host constraints, including:

- host chrome present above or around webpart content
- slide-out/flyout panel usability
- no critical header/action hidden under host UI in ordinary use
- panel scroll behavior
- no obstructed primary CTA in practical view states

### B. Zoom / density capture

Capture and compare where useful:

- standard 100% baseline
- 90% comparison for layout regression proof where it materially reveals issues

Do not turn this into a fake visual-polish exercise. Use it only where it helps prove or expose hosted layout behavior.

### C. Keyboard and focus behavior

Prove:

- key primary flows can be navigated without a mouse
- focus-visible states are present on critical controls
- modal/flyout/panel focus behavior is not broken in obvious ways

### D. Dead-control sweep

Explicitly verify there are no dead:

- primary CTAs
- queue actions
- `View All` interactions
- archive entries
- detail-panel actions
- close/dismiss controls

### E. Evidence artifact capture

Produce a closure artifact set including:

- Playwright HTML report
- trace artifacts for failed or flaky cases
- curated screenshot pack for major surface families
- coverage map back to the scenario matrix
- defect log listing any failures, flaky cases, or remaining unsupported gaps

## Required closure document

Create a final closure markdown document in the repo that includes:

1. execution date / branch / commit context
2. suites run
3. scenario coverage summary
4. pass/fail summary
5. unresolved issues
6. known intentional exclusions tied to repo truth
7. artifact locations
8. recommendation for ongoing CI usage

## Pass/fail criteria

### Pass only if:

- the core public workflows are proven
- the core governance workflows are proven
- the shared data/privacy boundaries are proven
- evidence artifacts exist
- defect list is explicit
- the suite is runnable by another engineer without tribal context

### Fail if any of these remain true:

- major workflow classes are still manual-only
- traces/screenshots/report artifacts are absent
- scenario matrix and executed coverage do not align
- dead CTAs remain unresolved and undocumented
- public/admin leakage risks remain untested

## Prohibited shortcuts

- no “all good” closure note without artifacts
- no vague success summary without listing what actually ran
- no omission of unresolved defects
- no hiding flaky tests under silence

## Final deliverable

Commit the closure artifacts, the closure markdown, and a concise final summary that states plainly:

- what is now automated
- what is partially automated
- what remains open
- whether the HB Kudos stress suite is fit to serve as a serious regression gate
