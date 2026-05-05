# Prompt 07 — Wave B Closeout Evidence and Handoff

## Role

You are the PCC Wave B closeout and Wave C handoff agent.

## Objective

Produce the final Wave B evidence-backed closeout, scorecard impact summary, and handoff to Wave C without claiming final 56/56.

## Scope

Documentation closeout, evidence index reconciliation, scorecard update, residual risk log, handoff recommendations.

## Non-Scope

No runtime source changes unless correcting documentation-only references is impossible without a minor source marker fix; no new implementation scope.

## Required Repo-Truth Inspection

Inspect all Wave B prompt closeouts, changed source files, tests, screenshot indexes, tenant evidence, scorecard templates, and Wave 15A target architecture.

## Exact or Best-Known Source Areas

Likely docs: Wave 15A blueprint closeout path, this package artifacts, `PACKAGE_MANIFEST.md`, evidence index. No source changes expected.

## Implementation Requirements

Compile final exact files changed by Wave B, command evidence, screenshots, tenant evidence/gaps, hard-stop checklist, scorecard categories improved, residual risks, and Wave C prerequisites.

## Required Tests

Run Prettier on changed Markdown. If no source changed in Prompt 07, do not rerun full tests unless required by local policy; include previous prompt command evidence.

## Required Screenshot / Evidence Output

Finalize screenshot index and attach/point to evidence paths. Tenant gap must be explicit if screenshots unavailable.

## Scorecard Impact

Targets validation/closure proof and prepares later waves; does not claim final 56/56.

## Closeout Requirements

Create final Wave B closeout/handoff under canonical blueprint path and update package artifacts with actual results.

## Stop Conditions

Stop if evidence is missing for a Wave B hard gate; do not close Wave B, instead issue a blocker report.


## Standing Instructions

- Inspect repo truth first.
- Do not rely on chat memory, assumptions, or prior summaries.
- Do not re-read files still within current context unless exact wording, line references, or changed repo state must be verified.
- Avoid unrelated changes.
- Preserve architecture unless it conflicts with doctrine.
- Prefer shared primitives over one-off styling.
- Avoid backend/API scope creep.
- Update or create closeout documentation.
- Run repo-appropriate checks.
- Report exact files changed, command results, residual issues, and stop conditions.
- Never claim final 56/56 from Wave B alone.
