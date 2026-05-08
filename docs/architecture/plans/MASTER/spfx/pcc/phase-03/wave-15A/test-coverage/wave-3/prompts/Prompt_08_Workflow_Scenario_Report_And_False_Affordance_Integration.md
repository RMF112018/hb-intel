# Local Code Agent Prompt — PCC Playwright Near-Term Evidence-Harness Package

Repository: `RMF112018/hb-intel`

You are implementing a narrowly scoped enhancement to the PCC live Playwright evidence harness. This is not a PCC product UI remediation sprint.

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

## Non-Negotiable Boundaries

- Do not produce a final 100-point score.
- Do not mark hard stops as passed or failed.
- Do not mark EVs as finally captured by automation.
- Do not claim Phase 4 readiness.
- Do not introduce live tenant mutation.
- Do not click save, submit, approve, reject, delete, sync, upload, provision, or writeback controls in a live tenant.
- Do not commit storageState files, cookies, auth/session data, raw traces, videos, HAR files, raw `test-results/`, raw `playwright-report/`, unsanitized console dumps, or unsanitized screenshots.
- Do not change PCC product UI runtime unless the prompt explicitly requires a missing evidence marker and the change is minimal, safe, and validated.
- Do not change dependencies, lockfile, SPFx manifests, or package-solution metadata unless explicitly justified and approved.

## Canonical Scorecard Reference

Use only this durable scorecard path in new evidence/source references:

```text
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md
```

Do not introduce durable `_v2` scorecard references.

## Required Validation Posture

Run targeted validation for your prompt scope and report exact commands/results. At minimum, use targeted Playwright specs for files you modify, `pnpm exec prettier --check` on changed paths, `git diff --check`, and lockfile hash before/after if package files are touched.


# Prompt 08 — Workflow Scenario Reports and False-Affordance Integration

## Objective

Implement workflow scenario report outputs and integrate them with false-affordance evidence.

This prompt covers Near-Term Roadmap Item 10, second half.

## Required Repo-Truth Intake

Inspect Prompt 07 files, workflow writer, scorecard-report assembler, and surface-block assembler. If Immediate ROI false-affordance issue registers exist, integrate instead of duplicating.

## Implementation Requirements

Emit:

```text
pcc-live-workflow-scenario-evidence.json
pcc-live-workflow-scenario-evidence.md
pcc-live-workflow-scenario-index.json
pcc-live-false-affordance-scenario-register.json
pcc-live-false-affordance-scenario-register.md
```

Register should identify mutation-looking labels, enabled/disabled state, disabled reason, read-only/preview/deferred/source-owned context, HBI/source authority context, attempted interaction, no-attempt reason, severity/disposition, EV/pillar/hard-stop refs, and expert-review status.

## Tests

Verify files emitted, risky controls not executed, no-click reason present, findings grouped by surface, no automated score/readiness claims, unsafe paths excluded.

## Validation

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.workflow.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.scorecard-report.spec.ts
pnpm exec prettier --check e2e/pcc-live
git diff --check
```
