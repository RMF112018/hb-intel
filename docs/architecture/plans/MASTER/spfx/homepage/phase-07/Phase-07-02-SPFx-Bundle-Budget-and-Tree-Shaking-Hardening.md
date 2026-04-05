# Phase 07-02 — SPFx Bundle Budget and Tree-Shaking Hardening

## Objective

Establish bundle-budget governance and harden import/output discipline so homepage and shell-extension packages remain within intentional SharePoint-friendly constraints as they evolve.

## Repo scope

- `apps/hb-webparts/**`
- `apps/hb-shell-extension/**`
- relevant `@hbc/ui-kit` entry-point documentation and enforcement seams
- build configs and any analysis tooling already present or easily introduced

## Context from earlier phases

The two product lanes are already separated:

- Lane A uses homepage-constrained entry discipline
- Lane B uses app-shell-constrained entry discipline

Phase 07 must now turn those doctrinal boundaries into **measured bundle governance**.

## Required questions

1. What are the current bundle baselines for JS and CSS in each package?
2. What growth has occurred phase-over-phase, and which increases are acceptable?
3. Are the current imports as narrow as they should be?
4. Are aliases or build config choices preventing optimal tree-shaking?
5. What budget thresholds should be locked for warnings vs failures?
6. What docs and tests should exist so regressions are obvious?

## Required work

### A. Create a bundle baseline
For both packages, capture:

- current JS output size
- current CSS output size
- major growth points already known from completion notes
- likely risk areas for further growth

### B. Define bundle budgets
Create a practical budget model with:

- soft warning threshold
- hard review threshold
- forced investigation threshold

Separate JS and CSS budgets where helpful.

### C. Audit tree-shaking and narrow-import posture
Verify:

- lane-specific imports remain constrained
- no broad import creep has entered either package
- build aliases still align with intended narrow surfaces
- any proof-case or preview imports do not leak extra runtime weight into production unexpectedly

### D. Add regression guardrails
Implement the smallest justified combination of:

- structural tests
- documentation references
- build comments/config notes
- lightweight script or checklist hooks

Do not add heavy tooling without clear value.

## Deliverables

Create:

- `Phase-07-Bundle-Budget-Baseline.md`
- `Phase-07-Bundle-Governance-Policy.md`
- `Phase-07-02-Completion-Note.md`

Update as needed:

- package READMEs
- entry-point reference docs
- verification guidance docs if build-size checks become part of normal release validation

## Verification requirements

Run and report:

- `check-types`
- `lint`
- `build`
- `test`

If build outputs change, record before/after sizes clearly.

## Hard rules

- do not weaken import discipline to save effort
- do not create fake precision where build tooling cannot support it
- do not introduce large new analysis infrastructure unless absolutely necessary
- prefer small durable guardrails over elaborate one-off audits
