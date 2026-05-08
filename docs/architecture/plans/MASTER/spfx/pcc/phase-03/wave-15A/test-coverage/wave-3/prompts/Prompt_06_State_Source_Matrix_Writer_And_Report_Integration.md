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


# Prompt 06 — State / Source Matrix Writer and Report Integration

## Objective

Implement the writer and report integration for the **state/source matrix**.

This prompt covers Near-Term Roadmap Item 9, second half.

## Required Repo-Truth Intake

Inspect Prompt 05 output plus workflow/conditional/content writers and scorecard-report assembler/writer.

## Implementation Requirements

Emit:

```text
pcc-live-state-source-matrix.json
pcc-live-state-source-matrix.md
pcc-live-source-system-matrix.json
pcc-live-source-system-matrix.md
pcc-live-state-copy-quality-matrix.md
pcc-live-hbi-source-authority-matrix.md
```

Markdown should include state/source coverage by surface, missing/not-observed states, source ownership, HBI advisory/authority risk observations, read-only/deferred/preview observations, copy quality review questions, EV/pillar/hard-stop refs, and disclaimer.

Integrate matrix refs into scorecard report and/or surface packets if available.

## Tests

Verify files emitted, rows grouped by surface, unknown/missing sources visible, HBI risks needs-review, no automated score/readiness claims, no secret leakage.

## Validation

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.workflow.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.scorecard-report.spec.ts
pnpm exec prettier --check e2e/pcc-live
git diff --check
```
