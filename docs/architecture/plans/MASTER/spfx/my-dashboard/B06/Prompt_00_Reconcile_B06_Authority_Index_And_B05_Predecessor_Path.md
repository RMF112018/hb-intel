# Prompt 00 — Reconcile B06 Authority Index and B05 Predecessor Path

## Role

Act as a repo-truth documentation implementer. This prompt performs a narrow planning-authority correction before runtime B06 work begins.

Do **not** broaden this prompt into code implementation.

## Objective

Correct the My Dashboard planning-chain drift that exists on current `main`:

1. the B06 dev-plan artifact references a non-canonical long-form B05 predecessor filename,
2. the My Dashboard dev-plan authority README is stale and does not index B04, B05, and B06.

## Files to inspect first

Do not re-read files that remain in your active context unless drift is suspected.

Inspect only what is necessary:

```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B06_My_Dashboard_Operational_Resilience_Security_And_Risk_Development.md
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B05_Adobe_Sign_Integration_Architecture_Development.md
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md
```

## Required changes

### A. Correct B06 B05 predecessor references
Where B06 names:

```text
B05_My_Dashboard_Adobe_Sign_Integration_Architecture_Identity_Mapping_OAuth_Agreement_Search_And_Source_Handoff_Development.md
```

replace with the actual committed artifact filename:

```text
B05_Adobe_Sign_Integration_Architecture_Development.md
```

Only adjust filename/path references. Do not rewrite B06’s substantive architecture.

### B. Refresh dev-plan README authority index
Update the authority index so it:

- includes B04,
- includes B05,
- includes B06,
- states B06 governs:
  - Sections 22, 23, and 27,
  - plus required refinements to Section 18,
- updates later-batch inheritance language so later sessions must read B04–B06 as applicable,
- preserves the existing hierarchy:
  1. live repo truth,
  2. applicable detailed batch artifact,
  3. umbrella outline,
  4. older references.

## Out of scope

Do not:
- change runtime code,
- change manifests/package versions,
- change lockfiles,
- change B01–B05 artifact substance,
- change the comprehensive outline unless a path reference there is directly broken and the minimal correction is unavoidable.

## Validation

Run targeted greps or repository search to confirm:

- the long-form B05 predecessor filename no longer appears where it is supposed to refer to the canonical artifact,
- the dev-plan README names B04, B05, and B06,
- no accidental duplicate or contradictory B05 filename is introduced.

## Closeout

Report:

1. files changed,
2. exact references corrected,
3. README authority-index updates,
4. validation performed,
5. whether runtime work may proceed to Prompt 01.
